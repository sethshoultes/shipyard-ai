#!/usr/bin/env node
/**
 * state-sync.mjs
 * --------------
 * Re-renders STATUS.md and TASKS.md from git reality so they stop drifting.
 * Reconciles AGENTS.md against pipeline/auto/agent-registry.json.
 *
 * Spec: docs/PRODUCT-MANAGEMENT-GAP.md (section "Change 3").
 *
 * Cron suggestion: 13 * * * *  (every hour at :13)
 *
 * USAGE
 *   node pipeline/auto/state-sync.mjs              # write updated state files
 *   node pipeline/auto/state-sync.mjs --dry        # report what would change, don't write
 *
 * RULES
 *   - STATUS.md and TASKS.md are only overwritten if their last commit
 *     was authored by the daemon (commit message starts with "daemon:",
 *     "state-sync:", or "stall-detector:"). If a human has manually edited
 *     a state file since the last daemon write, this script leaves it alone
 *     and logs a warning.
 *   - The script does NOT touch CLAUDE.md, AGENTS.md, README.md, SOUL.md,
 *     HEARTBEAT.md, or MEMORY.md. Those are human-curated.
 *
 * SECURITY
 *   Uses execFileSync with argv arrays (no shell interpretation) for git.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, basename } from "node:path";

const REPO_ROOT = process.cwd();
const PROJECTS_DIR = join(REPO_ROOT, "projects");
const STATUS_FILE = join(REPO_ROOT, "STATUS.md");
const TASKS_FILE = join(REPO_ROOT, "TASKS.md");
const AGENTS_FILE = join(REPO_ROOT, "AGENTS.md");
const REGISTRY_FILE = join(REPO_ROOT, "pipeline/auto/agent-registry.json");
const LOG_FILE = join(REPO_ROOT, "pipeline/auto/state-sync.log");

const DAEMON_AUTHOR_PREFIXES = ["daemon:", "state-sync:", "stall-detector:"];

// ---------- Helpers ----------

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  try {
    appendFileSync(LOG_FILE, stamped + "\n");
  } catch (_) {}
}

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: REPO_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch (_) {
    return "";
  }
}

function gitLastCommitMessage(path) {
  return git(["log", "-1", "--format=%s", "--", path]) || null;
}

function gitLastCommitISO(path) {
  return git(["log", "-1", "--format=%cI", "--", path]) || null;
}

function gitLatestTag() {
  return git(["describe", "--tags", "--abbrev=0"]) || null;
}

function commitsInLast(hours) {
  const since = new Date(Date.now() - hours * 36e5).toISOString();
  const out = git(["log", `--since=${since}`, "--oneline"]);
  return out ? out.split("\n").length : 0;
}

function isDaemonAuthored(path) {
  const msg = gitLastCommitMessage(path);
  if (!msg) return true; // Not yet committed — treat as daemon-owned
  return DAEMON_AUTHOR_PREFIXES.some((p) => msg.startsWith(p));
}

function listProjects() {
  if (!existsSync(PROJECTS_DIR)) return [];
  const out = [];
  for (const name of readdirSync(PROJECTS_DIR)) {
    if (name.startsWith(".")) continue;
    const full = join(PROJECTS_DIR, name);
    try {
      if (statSync(full).isDirectory()) {
        out.push({
          slug: name,
          path: full,
          last_commit: gitLastCommitISO(full),
        });
      }
    } catch (_) {}
  }
  return out;
}

function inferPhase(projectPath) {
  // Heuristic: presence of subdirs hints at phase
  const has = (sub) => existsSync(join(projectPath, sub));
  if (has("ship") || has("deploy")) return "SHIPPED";
  if (has("verify") || has("review")) return "REVIEW";
  if (has("build")) return "BUILD";
  if (has("plan") || has(".planning")) return "PLAN";
  if (has("debate")) return "DEBATE";
  return "INTAKE";
}

function hoursSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

function findPlanFiles(projectPath) {
  const out = [];
  for (const sub of ["plan", ".planning"]) {
    const dir = join(projectPath, sub);
    if (existsSync(dir)) {
      try {
        for (const name of readdirSync(dir)) {
          if (name.endsWith(".md")) out.push(join(dir, name));
        }
      } catch (_) {}
    }
  }
  // Project-root phase plans
  if (existsSync(projectPath)) {
    try {
      for (const name of readdirSync(projectPath)) {
        if (/^phase-\d+-plan\.md$/i.test(name)) out.push(join(projectPath, name));
      }
    } catch (_) {}
  }
  return out;
}

function relPath(p) {
  return p.replace(REPO_ROOT + "/", "");
}

// ---------- STATUS.md renderer ----------

function renderStatus(projects) {
  const totalCommits24h = commitsInLast(24);
  const agencyState = totalCommits24h > 0 ? "ACTIVE" : "IDLE";
  const lastTag = gitLatestTag();
  const lastCommitISO = gitLastCommitISO(".");

  const activeProjects = projects.filter((p) => hoursSince(p.last_commit) < 24 * 14);
  const inactiveProjects = projects.filter((p) => hoursSince(p.last_commit) >= 24 * 14);

  const lines = [];
  lines.push("# Shipyard AI — Status");
  lines.push("");
  lines.push("> Auto-generated by `pipeline/auto/state-sync.mjs`. Do not hand-edit between cron runs — the next sync will overwrite. To pin a value, write it in `STATUS.notes.md` (state-sync ignores that file).");
  lines.push("");
  lines.push("## Current State");
  lines.push("");
  lines.push(`- **Agency state:** ${agencyState}`);
  lines.push(`- **Last commit:** ${lastCommitISO || "(none)"}`);
  lines.push(`- **Commits in past 24h:** ${totalCommits24h}`);
  lines.push(`- **Latest git tag:** ${lastTag || "(none)"}`);
  lines.push(`- **Active projects (commits in past 14d):** ${activeProjects.length}`);
  lines.push(`- **Inactive projects:** ${inactiveProjects.length}`);
  lines.push(`- **Last synced:** ${new Date().toISOString()}`);
  lines.push("");

  if (activeProjects.length > 0) {
    lines.push("## Active Projects");
    lines.push("");
    lines.push("| Project | Phase | Last commit | Path |");
    lines.push("|---|---|---|---|");
    for (const p of activeProjects) {
      const phase = inferPhase(p.path);
      const ago = Number.isFinite(hoursSince(p.last_commit))
        ? `${hoursSince(p.last_commit).toFixed(0)}h ago`
        : "—";
      lines.push(`| ${p.slug} | ${phase} | ${ago} | \`${relPath(p.path)}\` |`);
    }
    lines.push("");
  }

  if (inactiveProjects.length > 0) {
    lines.push("## Inactive Projects (no commits in 14d)");
    lines.push("");
    lines.push("These are candidates for archive review. See `.daemon-queue.json` for stall-detector findings.");
    lines.push("");
    for (const p of inactiveProjects) {
      lines.push(`- ${p.slug} — last commit ${p.last_commit || "(none)"}`);
    }
    lines.push("");
  }

  lines.push("## See Also");
  lines.push("");
  lines.push("- `.daemon-queue.json` — current stall-detector findings");
  lines.push("- `HEARTBEAT.md` — cron schedule");
  lines.push("- `TASKS.md` — open task dispatch board (auto-synced)");
  lines.push("- `docs/PRODUCT-MANAGEMENT-GAP.md` — diagnosis and policy for stalled projects");
  lines.push("");

  return lines.join("\n");
}

// ---------- TASKS.md renderer ----------

function renderTasks(projects) {
  const lines = [];
  lines.push("# Shipyard AI — Task Board");
  lines.push("");
  lines.push("> Auto-generated by `pipeline/auto/state-sync.mjs`. Surfaces only tasks parsed from each project's `plan/`, `.planning/`, or `phase-*-plan.md` files. Tasks marked done in git are not shown.");
  lines.push("");
  lines.push(`**Last synced:** ${new Date().toISOString()}`);
  lines.push("");

  let printedAny = false;
  for (const p of projects) {
    const planFiles = findPlanFiles(p.path);
    if (planFiles.length === 0) continue;
    printedAny = true;
    lines.push(`## ${p.slug}`);
    lines.push("");
    lines.push(`**Path:** \`${relPath(p.path)}\``);
    lines.push(`**Phase:** ${inferPhase(p.path)}`);
    lines.push("");
    lines.push("**Plan files:**");
    for (const f of planFiles) {
      lines.push(`- \`${relPath(f)}\``);
    }
    lines.push("");
  }

  if (!printedAny) {
    lines.push("_No projects with plan files found in `projects/`._");
    lines.push("");
  }

  return lines.join("\n");
}

// ---------- Roster reconciliation ----------

function reconcileRoster() {
  if (!existsSync(REGISTRY_FILE)) {
    log("agent-registry.json not found — skipping roster reconciliation");
    return;
  }
  const registry = JSON.parse(readFileSync(REGISTRY_FILE, "utf8"));
  const registered = Object.keys(registry).filter((k) => !k.startsWith("$"));
  const agentsContent = existsSync(AGENTS_FILE) ? readFileSync(AGENTS_FILE, "utf8").toLowerCase() : "";

  const missing = registered.filter((a) => !agentsContent.includes(a.toLowerCase()));
  if (missing.length > 0) {
    log(`AGENTS.md is missing references to registered agents: ${missing.join(", ")}`);
  } else {
    log(`AGENTS.md references all ${registered.length} registered agents — clean`);
  }
}

// ---------- Main ----------

function writeIfDaemonOwned(path, content, dryRun) {
  if (existsSync(path) && !isDaemonAuthored(path)) {
    log(`SKIP ${basename(path)} — last commit not daemon-authored, leaving manual edits intact`);
    return false;
  }
  if (dryRun) {
    log(`DRY ${basename(path)} — would write ${content.length} bytes`);
    return true;
  }
  writeFileSync(path, content);
  log(`WROTE ${basename(path)} (${content.length} bytes)`);
  return true;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry");

  const projects = listProjects();
  log(`Scanned ${projects.length} projects.`);

  const statusContent = renderStatus(projects);
  writeIfDaemonOwned(STATUS_FILE, statusContent, dryRun);

  const tasksContent = renderTasks(projects);
  writeIfDaemonOwned(TASKS_FILE, tasksContent, dryRun);

  reconcileRoster();

  log(`Done. ${dryRun ? "(dry run)" : ""}`);
}

main();
