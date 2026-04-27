#!/usr/bin/env node
// Queue dispatcher — reads .daemon-queue.json, spawns the right agent for each
// queued entry, escalates human-targeted entries to HEARTBEAT.md.
//
// Cron: */15 * * * * cd /home/agent/shipyard-ai && /usr/bin/node pipeline/auto/queue-dispatcher.mjs
//
// Single-instance: aborts if another copy is running.

import { existsSync, readFileSync, writeFileSync, appendFileSync, mkdirSync, rmdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, "..", "..");
const QUEUE_FILE = resolve(REPO, ".daemon-queue.json");
const REGISTRY_FILE = resolve(__dirname, "agent-registry.json");
const HEARTBEAT_FILE = resolve(REPO, "HEARTBEAT.md");
const LOG_FILE = resolve(__dirname, "queue-dispatcher.log");
const LOCK_DIR = "/tmp/queue-dispatcher.lock";
const HISTORY_FILE = resolve(__dirname, "cagan-dispatch-history.json");

const ts = () => new Date().toISOString();
const log = (msg) => {
  const line = `[${ts()}] ${msg}\n`;
  process.stdout.write(line);
  try { appendFileSync(LOG_FILE, line); } catch {}
};

// Single-instance lock
try {
  mkdirSync(LOCK_DIR);
} catch {
  log("Another dispatcher running — exit");
  process.exit(0);
}
process.on("exit", () => { try { rmdirSync(LOCK_DIR); } catch {} });

if (!existsSync(QUEUE_FILE)) { log("No queue file — exit"); process.exit(0); }
const queue = JSON.parse(readFileSync(QUEUE_FILE, "utf8"));
const registry = JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));
const history = existsSync(HISTORY_FILE)
  ? JSON.parse(readFileSync(HISTORY_FILE, "utf8"))
  : {};
if (!Array.isArray(history.dispatches)) history.dispatches = [];

let dispatched = 0, escalated = 0, errors = 0;
const weekMs = 7 * 24 * 60 * 60 * 1000;
const now = Date.now();

for (const entry of queue.entries || []) {
  if (entry.status !== "queued") continue;

  // Escalation path
  if (entry.escalation && entry.escalation.target === "human") {
    const block = `\n\n---\n## Escalation — ${ts()}\n\n${entry.escalation.message}\n\nFrom queue entry: \`${entry.id}\`\n`;
    appendFileSync(HEARTBEAT_FILE, block);
    entry.status = "escalated";
    entry.escalated_at = ts();
    escalated++;
    log(`ESCALATED ${entry.id} to HEARTBEAT.md`);
    continue;
  }

  // Dispatch path
  const dispatch = entry.dispatch;
  if (!dispatch || !dispatch.agent) continue;

  const agentDef = registry[dispatch.agent];
  if (!agentDef) {
    log(`SKIP ${entry.id} — agent ${dispatch.agent} not in registry`);
    entry.status = "skipped-unknown-agent";
    errors++;
    continue;
  }

  // Per-project rate limiting
  const max = agentDef.max_per_project_per_week;
  if (max && entry.project?.slug) {
    const recent = history.dispatches.filter(
      (d) => d.agent === dispatch.agent && d.project_slug === entry.project.slug && (now - new Date(d.dispatched_at).getTime()) < weekMs
    );
    if (recent.length >= max) {
      log(`RATE_LIMIT ${entry.id} — ${dispatch.agent} already ${recent.length}/${max} for ${entry.project.slug} this week`);
      if (agentDef.after_max === "escalate-to-human") {
        const block = `\n\n---\n## Rate-limit Escalation — ${ts()}\n\n${dispatch.agent} hit max-per-week (${max}) for project \`${entry.project.slug}\` without resolution. Human review required.\n\nFrom queue entry: \`${entry.id}\`\n`;
        appendFileSync(HEARTBEAT_FILE, block);
        entry.status = "escalated-rate-limit";
        entry.escalated_at = ts();
        escalated++;
      } else {
        entry.status = "skipped-rate-limit";
      }
      continue;
    }
  }

  // Execute via claude CLI (env routes to Ollama Cloud / Kimi)
  const subagent = agentDef.subagent_type;
  const model = agentDef.model || "sonnet";
  const prompt = dispatch.prompt;
  log(`DISPATCH ${entry.id} → ${dispatch.agent} (${subagent}, model=${model})`);

  // Wrap prompt so Claude dispatches the subagent via Agent tool
  const wrappedPrompt = `Use the Agent tool to invoke the subagent type \`${subagent}\` with this exact prompt:

---
${prompt}
---

Do not paraphrase. Pass the prompt verbatim. After the subagent finishes, report only the location of any file it wrote.`;

  const result = spawnSync(
    "claude",
    [
      "--model", model === "haiku" ? "qwen3.5:cloud" : "kimi-k2.6:cloud",
      "--dangerously-skip-permissions",
      "-p", wrappedPrompt,
    ],
    { cwd: REPO, encoding: "utf8", timeout: 30 * 60 * 1000, env: process.env, maxBuffer: 50 * 1024 * 1024 }
  );

  // Log first 500 chars of claude's output for debugging
  if (result.stdout) {
    log(`OUTPUT[${entry.id}]: ${result.stdout.replace(/\n/g, " ").slice(0, 500)}`);
  }

  if (result.error || result.status !== 0) {
    log(`FAILED ${entry.id} — ${result.error?.message || `exit ${result.status}`}`);
    entry.status = "dispatch-failed";
    entry.dispatch_error = result.error?.message || `exit ${result.status}`;
    errors++;
    continue;
  }

  entry.status = "dispatched";
  entry.dispatched_at = ts();
  history.dispatches.push({
    agent: dispatch.agent,
    project_slug: entry.project?.slug,
    dispatched_at: entry.dispatched_at,
    queue_id: entry.id,
  });
  dispatched++;
  log(`OK ${entry.id} dispatched`);
}

// Persist
queue.last_updated = ts();
writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
log(`Done. dispatched=${dispatched} escalated=${escalated} errors=${errors}`);
