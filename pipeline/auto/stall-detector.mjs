#!/usr/bin/env node
/**
 * stall-detector.mjs
 * ------------------
 * Walks projects/* and prds/*, classifies each project as
 * GREEN / YELLOW / RED / BLACK based on git activity, analysis-doc count,
 * and time-in-phase. Writes findings to .daemon-queue.json so Phil's
 * dispatcher can pick them up. Logs to pipeline/auto/stall-detector.log.
 *
 * Spec: docs/PRODUCT-MANAGEMENT-GAP.md (sections "Change 1" and "Escalation").
 *
 * Cron suggestion: 7 *​/4 * * *  (every 4 hours, offset to :07)
 *
 * USAGE
 *   node pipeline/auto/stall-detector.mjs           # write to queue + log
 *   node pipeline/auto/stall-detector.mjs --dry     # log only, no queue writes
 *   node pipeline/auto/stall-detector.mjs --json    # emit findings as JSON to stdout
 *
 * NON-GOALS
 *   - Does not modify project files.
 *   - Does not invoke Cagan directly. Writes to queue; Phil dispatches.
 *   - Does not auto-kill projects. Killing is a human decision; this flags candidates.
 *
 * SECURITY
 *   Uses execFileSync with argv arrays (no shell interpretation) to invoke git.
 *   No user-supplied input is passed to git args without explicit allowlisting.
 */

import { readFileSync, readdirSync, writeFileSync, statSync, existsSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, basename } from "node:path";

const REPO_ROOT = process.cwd();
const PROJECTS_DIR = join(REPO_ROOT, "projects");
const PRDS_DIR = join(REPO_ROOT, "prds");
const QUEUE_FILE = join(REPO_ROOT, ".daemon-queue.json");
const LOG_FILE = join(REPO_ROOT, "pipeline/auto/stall-detector.log");
const CONFIG_FILE = join(REPO_ROOT, "pipeline/auto/stall-detector.config.json");
const DISPATCH_HISTORY_FILE = join(REPO_ROOT, "pipeline/auto/cagan-dispatch-history.json");

// ---------- Defaults (overridable via stall-detector.config.json) ----------

const DEFAULT_CONFIG = {
  thresholds: {
    yellow_analysis_docs: 3,
    yellow_no_commits_hours: 24,
    red_analysis_docs: 5,
    red_time_in_phase_hours: 72,
    black_cagan_dispatches_in_window: 2,
    black_window_days: 7,
    auto_archive_no_commits_days: 14,
  },
  analysis_doc_patterns: [
    "^RISK[-_]",
    "^PULSE[-_]",
    "^CODEBASE[-_]?SCOUT",
    "^WARDROBE[-_]",
    "[-_]ANALYSIS\\.md$",
    "[-_]REPORT\\.md$",
    "^REQUIREMENTS[-_]",
    "[-_]VALIDATION[-_]MATRIX\\.md$",
    "[-_]RISK[-_]ASSESSMENT\\.md$",
    "^SCOUT[-_]",
    "^HOMEPORT[-_]?SCOUT",
  ],
  code_path_indicators: ["src/", "build/", "deliverables/code/", "lib/", "components/"],
};

function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      const overrides = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
      return {
        ...DEFAULT_CONFIG,
        ...overrides,
        thresholds: { ...DEFAULT_CONFIG.thresholds, ...(overrides.thresholds || {}) },
      };
    } catch (err) {
      console.error(`[stall-detector] Failed to parse ${CONFIG_FILE}: ${err.message}. Using defaults.`);
    }
  }
  return DEFAULT_CONFIG;
}

function compilePatterns(config) {
  return config.analysis_doc_patterns.map((p) => new RegExp(p, "i"));
}

// ---------- Filesystem helpers ----------

function listProjectDirs() {
  const dirs = [];
  for (const root of [PROJECTS_DIR, PRDS_DIR]) {
    if (!existsSync(root)) continue;
    for (const name of readdirSync(root)) {
      if (name.startsWith(".")) continue;
      const full = join(root, name);
      try {
        if (statSync(full).isDirectory()) {
          dirs.push({ slug: name, path: full, root: basename(root) });
        }
      } catch (_) {}
    }
  }
  return dirs;
}

function walkFiles(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    try {
      const st = statSync(full);
      if (st.isDirectory()) walkFiles(full, files);
      else files.push(full);
    } catch (_) {}
  }
  return files;
}

function isAnalysisDoc(filepath, compiledPatterns) {
  const base = basename(filepath);
  return compiledPatterns.some((p) => p.test(base));
}

function isCodeFile(filepath, codePathIndicators) {
  return codePathIndicators.some((ind) => filepath.includes(ind));
}

// ---------- Git helpers (execFileSync — no shell, argv arrays) ----------

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

function gitLastCommitISO(path) {
  return git(["log", "-1", "--format=%cI", "--", path]) || null;
}

function gitCommitCountSince(path, sinceISO) {
  const out = git(["log", `--since=${sinceISO}`, "--oneline", "--", path]);
  return out ? out.split("\n").length : 0;
}

function hoursSince(iso) {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 36e5;
}

// ---------- Project classification ----------

function classifyProject(project, config, compiledPatterns, dispatchHistory) {
  const { slug, path, root } = project;
  const allFiles = walkFiles(path);
  const analysisDocs = allFiles.filter((f) => isAnalysisDoc(f, compiledPatterns));
  const codeFiles = allFiles.filter((f) => isCodeFile(f, config.code_path_indicators));

  const lastCommit = gitLastCommitISO(path);
  const hoursSinceLastCommit = hoursSince(lastCommit);

  // Time in current phase: heuristic — oldest analysis doc not yet superseded
  let timeInPhaseHours = 0;
  if (analysisDocs.length > 0) {
    let oldest = Infinity;
    for (const f of analysisDocs) {
      try {
        const m = statSync(f).mtimeMs;
        if (m < oldest) oldest = m;
      } catch (_) {}
    }
    if (Number.isFinite(oldest)) {
      timeInPhaseHours = (Date.now() - oldest) / 36e5;
    }
  }

  // Recent code commits (last 24h)
  const since = new Date(Date.now() - 24 * 36e5).toISOString();
  const recentCodeCommits = codeFiles.length > 0 ? gitCommitCountSince(path, since) : 0;

  // Dispatch history for escalation
  const projectKey = `${root}/${slug}`;
  const recentCaganDispatches = (dispatchHistory[projectKey] || []).filter(
    (entry) => hoursSince(entry.timestamp) < config.thresholds.black_window_days * 24
  );

  // Classification
  const t = config.thresholds;
  let level = "GREEN";
  const reasons = [];

  if (
    analysisDocs.length >= t.red_analysis_docs ||
    timeInPhaseHours >= t.red_time_in_phase_hours
  ) {
    level = "RED";
    if (analysisDocs.length >= t.red_analysis_docs)
      reasons.push(`${analysisDocs.length} analysis docs (>= ${t.red_analysis_docs})`);
    if (timeInPhaseHours >= t.red_time_in_phase_hours)
      reasons.push(`${timeInPhaseHours.toFixed(0)}h in phase (>= ${t.red_time_in_phase_hours}h)`);
  } else if (
    analysisDocs.length >= t.yellow_analysis_docs &&
    hoursSinceLastCommit >= t.yellow_no_commits_hours
  ) {
    level = "YELLOW";
    reasons.push(`${analysisDocs.length} analysis docs and ${hoursSinceLastCommit.toFixed(0)}h since last commit`);
  }

  if (
    recentCaganDispatches.length >= t.black_cagan_dispatches_in_window &&
    level !== "GREEN"
  ) {
    level = "BLACK";
    reasons.push(
      `Cagan dispatched ${recentCaganDispatches.length}x in last ${t.black_window_days}d, project still stalled`
    );
  }

  const autoArchiveCandidate =
    hoursSinceLastCommit >= t.auto_archive_no_commits_days * 24 && level !== "GREEN";

  return {
    slug,
    path,
    root,
    level,
    reasons,
    metrics: {
      analysis_doc_count: analysisDocs.length,
      code_file_count: codeFiles.length,
      hours_since_last_commit: Number.isFinite(hoursSinceLastCommit)
        ? hoursSinceLastCommit.toFixed(1)
        : "∞",
      time_in_phase_hours: timeInPhaseHours.toFixed(1),
      recent_code_commits_24h: recentCodeCommits,
      cagan_dispatches_recent: recentCaganDispatches.length,
    },
    auto_archive_candidate: autoArchiveCandidate,
    last_commit: lastCommit,
  };
}

// ---------- Queue management ----------

function loadJsonFile(path, fallback) {
  if (!existsSync(path)) return fallback;
  const content = readFileSync(path, "utf8").trim();
  if (!content) return fallback;
  try {
    return JSON.parse(content);
  } catch (err) {
    console.error(`[stall-detector] Failed to parse ${path}: ${err.message}. Using fallback.`);
    return fallback;
  }
}

function buildQueueEntries(findings) {
  const entries = [];
  for (const f of findings) {
    if (f.level === "GREEN") continue;

    const entry = {
      id: `stall-${f.root}-${f.slug}-${Date.now()}`,
      created_at: new Date().toISOString(),
      source: "stall-detector",
      project: { slug: f.slug, path: f.path, root: f.root },
      severity: f.level,
      reasons: f.reasons,
      metrics: f.metrics,
      status: "queued",
    };

    if (f.level === "YELLOW") {
      entry.dispatch = {
        agent: "cagan",
        mode: "light",
        prompt: `Stall detected (YELLOW) for project ${f.slug}. Reasons: ${f.reasons.join("; ")}. Read the analysis docs in ${f.path} and produce a 200-word memo to ${f.path}/cagan-check.md naming which of the four risks (value / usability / feasibility / viability) the analyses actually tested, and which were skipped. Do NOT write more analysis. Force the question: build, kill, or pivot.`,
        save_path: `${f.path}/cagan-check.md`,
      };
    } else if (f.level === "RED") {
      entry.dispatch = {
        agent: "cagan",
        mode: "force-decision",
        prompt: `Stall detected (RED) for project ${f.slug}. Reasons: ${f.reasons.join("; ")}. Read the analysis docs and prior cagan-checks in ${f.path}. Write a build-or-kill recommendation to ${f.path}/cagan-decision.md. Recommend ONE of: BUILD (with smallest viable scope and the riskiest assumption to test first), PIVOT (with the new framing), or KILL (with the reason the four risks failed). Do NOT defer. Do NOT request more analysis.`,
        save_path: `${f.path}/cagan-decision.md`,
      };
    } else if (f.level === "BLACK") {
      entry.dispatch = null;
      entry.escalation = {
        target: "human",
        message: `🚨 STALL ESCALATION: ${f.slug} has had ${f.metrics.cagan_dispatches_recent} Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See ${f.path}/cagan-*.md for prior analyses.`,
      };
    }

    if (f.auto_archive_candidate) {
      const days = (parseFloat(f.metrics.hours_since_last_commit) / 24).toFixed(0);
      entry.archive_candidate = {
        reason: `No commits in ${days} days`,
        suggested_path: `archive/abandoned/${f.slug}/`,
      };
    }

    entries.push(entry);
  }
  return entries;
}

function writeQueue(entries, dryRun) {
  if (dryRun) return;

  // Existing queue may be a bare array (legacy) or a {schema_version, entries} object.
  const raw = loadJsonFile(QUEUE_FILE, null);
  let priorEntries = [];
  if (Array.isArray(raw)) {
    priorEntries = raw;
  } else if (raw && Array.isArray(raw.entries)) {
    priorEntries = raw.entries;
  }

  const merged = {
    schema_version: 1,
    last_updated: new Date().toISOString(),
    entries: [
      ...priorEntries.filter((e) => e && e.source !== "stall-detector"),
      ...entries,
    ],
  };
  writeFileSync(QUEUE_FILE, JSON.stringify(merged, null, 2) + "\n");
}

function recordDispatchHistory(findings) {
  const history = loadJsonFile(DISPATCH_HISTORY_FILE, {});
  for (const f of findings) {
    if (f.level === "YELLOW" || f.level === "RED") {
      const key = `${f.root}/${f.slug}`;
      if (!history[key]) history[key] = [];
      history[key].push({
        timestamp: new Date().toISOString(),
        level: f.level,
        reasons: f.reasons,
      });
      // Keep last 30 entries per project
      history[key] = history[key].slice(-30);
    }
  }
  writeFileSync(DISPATCH_HISTORY_FILE, JSON.stringify(history, null, 2) + "\n");
}

// ---------- Logging ----------

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`;
  console.log(stamped);
  try {
    appendFileSync(LOG_FILE, stamped + "\n");
  } catch (_) {}
}

// ---------- Main ----------

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry");
  const jsonOut = args.has("--json");

  const config = loadConfig();
  const compiledPatterns = compilePatterns(config);
  const dispatchHistory = loadJsonFile(DISPATCH_HISTORY_FILE, {});
  const projects = listProjectDirs();

  const findings = projects.map((p) =>
    classifyProject(p, config, compiledPatterns, dispatchHistory)
  );

  if (jsonOut) {
    process.stdout.write(JSON.stringify({ findings }, null, 2));
    return;
  }

  log(`Scanned ${projects.length} project dirs.`);
  for (const f of findings) {
    if (f.level === "GREEN") continue;
    log(`  ${f.level}  ${f.root}/${f.slug}  — ${f.reasons.join("; ")}`);
  }

  const counts = { GREEN: 0, YELLOW: 0, RED: 0, BLACK: 0 };
  for (const f of findings) counts[f.level]++;
  log(`Summary: GREEN=${counts.GREEN} YELLOW=${counts.YELLOW} RED=${counts.RED} BLACK=${counts.BLACK}`);

  const entries = buildQueueEntries(findings);
  if (entries.length > 0) {
    log(`Built ${entries.length} queue entries.${dryRun ? " (dry run, not writing)" : ""}`);
    writeQueue(entries, dryRun);
    if (!dryRun) recordDispatchHistory(findings);
  }

  if (counts.BLACK > 0) {
    log(`🚨 ${counts.BLACK} BLACK escalation(s) — human attention required. See HEARTBEAT.md.`);
  }
}

main();
