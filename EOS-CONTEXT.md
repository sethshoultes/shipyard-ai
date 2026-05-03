# Shipyard AI — EOS Company Context
## Last updated: 2026-05-03
## This file is injected into every agent prompt. READ IT.

---

## What We Do

Shipyard AI is an autonomous software delivery company. We build and ship tools using AI agents running on a DigitalOcean server (164.90.151.82).

Built products:
- Relay — AI form handler and lead router (WordPress plugin)
- LocalGenius — AI widget for local businesses
- WP Intelligence Suite — WordPress analytics and intelligence
- AgentBridge — Agent-to-agent communication protocol
- WP Sentinel — WordPress security and monitoring
- Serenity Fitness, Peak Dental Management, Bella's Bistro — client sites

---

## Roles

| Role | Who | What They Do |
|------|-----|---------------|
| Visionary | Seth | Strategy, rocks, decisions, the "why" |
| Integrator | Hermes Agent | Runs L10s, tracks rocks, delegates, unblocks |
| Head of Engineering | Daemon / Builder Agent | Builds deliverables from PRDs |
| Head of QA | Margaret Hamilton Agent | Tests, hollow build detection, deploy verification |
| Head of Product | Dream Agent | PRDs, ideation, customer research, roadmap |

---

## Quarterly Rocks (90-Day Goals)

These are our highest priorities. Every PRD must map to at least one rock.

| # | Rock | Status |
|---|------|--------|
| 1 | Deploy verification pipeline (#98) | Active — custom domain 404s |
| 2 | Cost tracking DB | Planned — SQLite module designed, needs deployment |
| 3 | Model scorecard | DONE 2026-05-03 — see Model Scorecard section below. glm-4.6:cloud is the build-phase default. |
| 4 | Hollow build rate <10% | DONE — true rate 1.2% |
| 5 | Retry budget (max 3) | DONE — 3 attempts, then park in prds/parked/ |
| 6 | Open issues <5 | DONE — 4 open |

If you are building something NOT tied to these rocks, STOP and ask why.

---

## Scorecard (Current Numbers)

| Metric | Value | Goal |
|--------|-------|------|
| Deliverables | 82 | Baseline |
| Failed builds | 8 | <5 |
| Open issues | 4 | <5 |
| Hollow build rate | 1.2% | <10% |
| Active model (build phase) | glm-4.6:cloud | Pinned 2026-05-03 |
| Retry budget exhausted | 0 | 0 |

---

## Model Scorecard

Empirical results from `BUILD_PHASE_MODEL` env-override testing on the Shipyard daemon. Run via canary PRDs that build a small TypeScript module (slugify+truncate). Measured by `AGENT TOOL-USE: <agent> writes=N bash=N` log lines.

| Model | build-setup writes | builder writes | Hollow rate | Verdict |
|-------|--------------------|----------------|-------------|---------|
| `kimi-k2.6:cloud` | 0 | 0 | 100% | BROKEN — never makes Write/Edit calls in build phase |
| `qwen3.5:cloud` | ~50% writes=0 | flaky | ~50% | UNRELIABLE — works sometimes, frequently silent |
| `glm-4.6:cloud` | 7 (first try) | 10 (first try) | 0% | RELIABLE — current default |

**How to swap:** edit `/home/agent/.ollama.env`, set `BUILD_PHASE_MODEL=<model>:cloud`, then `systemctl restart shipyard-daemon.service`. The daemon's `BUILD_MODEL` const reads this on startup. Other phases (debate, plan, QA, review, ship) still use `sonnet` alias which maps to whatever `ANTHROPIC_DEFAULT_SONNET_MODEL` is set to.

**How to add a new candidate:** `sudo -u agent ollama pull <model>:cloud` then run a canary PRD with the env swap. Confirm `writes>0` on build-setup AND builder before promoting to default.

**Diagnostic:** if a build agent writes=0, daemon's hollow-agent guard (in `runAgentCore`) throws and triggers retry (max 5). Per-agent transcripts at `/home/agent/shipyard-ai/.agent-logs/build/<agent>-<ts>.jsonl`.

---

## Decision Matrix

| Decision Type | Who Decides | Escalation Path |
|---------------|-------------|------------------|
| Quarterly rocks | Visionary (Seth) | — |
| Issue prioritization | Integrator (Hermes) | Visionary |
| PRD approval | Dream + Integrator | Visionary |
| Model selection | Integrator | Visionary |
| Deploy blockers | QA (Margaret) | Integrator |
| Hollow build threshold | Integrator | — |
| Budget >$100/mo | Integrator + Visionary | — |

---

## Meeting Pulses

| Meeting | When | Purpose |
|---------|------|---------|
| Daily standup | 07:00 UTC | Daemon health, active builds, metrics check |
| Weekly L10 review | Friday, 18:00 UTC | Rocks review, IDS issues, scorecard update |
| Issue review | As needed | Open issue triage, target <5 |

---

## Operational Hazards (read before touching daemon)

These are non-obvious failure modes that have bitten us. Adding new patches without knowing them risks recreating these bugs.

### 1. Maintenance crew can SIGTERM the daemon mid-pipeline

`/home/agent/maintenance-crew/orchestrator.sh` (cron `*/15 * * * *`) was repeatedly sending SIGTERMs to `shipyard-daemon.service` during pipeline runs (2026-05-02 incident — 20+ kills/hour). Symptoms: `Claude Code process exited with code 143`, all in-flight PRDs land in `prds/failed/` with no real failure.

**Currently mitigated:** `/home/agent/maintenance-crew/PAUSED` flag is set. The orchestrator early-exits when it sees the flag.

**Before resuming maintenance crew:** identify which check/triage path was issuing kills outside the recovery-executor's whitelist. Recovery-executor.log only ever showed ONE explicit `RESTART_SERVICE shipyard-daemon` entry in 11+ minutes of kills, so the kill source is somewhere else.

**Quick check during incident:** `journalctl -u shipyard-daemon.service --since '1 hour ago' | grep -c Stopping` — if >5, maintenance crew (or another script) is the problem, not the daemon.

### 2. Watcher skip-loop on intake-recreated PRDs

When intake recreates a PRD whose previous copy is in `prds/failed/`, chokidar fires `change` (not `add`). Old watcher only listened to `add` → silent stall, intake recreates every 5 min, watcher rejects every 5 min, no log line says why.

**Currently mitigated:** watcher now binds `handleNewOrChanged` to BOTH `add` and `change` events, plus `isAlreadyProcessed` does an mtime comparison (live newer than failed/parked → not "already processed").

**Do not revert** the mtime check or the dual-event binding in `daemon.ts` — both are load-bearing.

### 3. Hollow-agent guard + auto-retry

Build-phase agents (`build-setup`, `builder`, `build-fixer`) on flaky models occasionally make zero `Write`/`Edit` tool calls — the SDK exits cleanly, no error, but no files written. Without detection, this wastes ~20 min per pipeline before the build gate fires.

**Mitigation in `runAgentCore`:** counts `tool_use` blocks per agent run, logs `AGENT TOOL-USE: <name> writes=N bash=N`, and throws `hollow agent: <name> produced no Write/Edit tool calls` when phase=='build' and writes==0. Throw triggers `runAgentWithRetry` (5 attempts, exponential backoff).

**Diagnostic signals:**
- `AGENT TOOL-USE: ... writes=N bash=N` — every agent run, look at writes count
- `AGENT HOLLOW: <name> made 0 Write/Edit calls — throwing for retry` — guard fired
- `AGENT RETRY: <name> attempt N in Ns` — retry layer caught it

**Per-agent transcripts** at `/home/agent/shipyard-ai/.agent-logs/<phase>/<agent>-<ts>.jsonl` — full SDK message stream for any run. Use for diagnosing why a model went silent.

### 4. Build agents can overwrite daemon source files

Builders run with `Read`, `Write`, `Edit`, `Bash`, `Agent`, `Glob`, `Grep` tools and full filesystem access. Working dir is `REPO_PATH=/home/agent/shipyard-ai` but tool calls take absolute paths — meaning a builder can edit `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` if it decides to "fix" something.

This happened 2026-05-02 18:59: a builder's "fix pass" overwrote write-counter patches in `pipeline.ts`, removing 49 lines. Auto-commit then committed the regression. Took 30 min to diagnose.

**Mitigation pending:** scope `ALLOWED_TOOLS` per agent so builders can only Write under `deliverables/<slug>/`. Until then, any patch to `daemon/src/*.ts` should be:

1. Verified after every pipeline run that touches the daemon (`grep` for marker strings)
2. Excluded from auto-commit (the `daemon: auto-commit ...` commits in `great-minds-plugin` are the danger — they pick up agent-induced edits)
3. Backed up — keep `.bak-<timestamp>` copies near the source

**Diagnostic:** after any daemon code change, run `grep -c <unique-marker> /home/agent/great-minds-plugin/daemon/src/pipeline.ts` periodically. If count drops, an agent reverted the patch.

---

## PRD Lint (pre-flight)

Every PRD dropped in `prds/` runs through `pipeline/auto/prd-lint.sh` before queueing. The watcher calls it; if exit != 0, the PRD moves to `prds/lint-failed/` with a `.lint-report.md` next to it. **No agent time is spent on a failed-lint PRD.**

### What lint catches

Hard fails (block the PRD):
- File <500 bytes
- Anti-pattern: "READ each X" + "synthesize" without "EXACT contents" or pre-baked data
- Missing `## Acceptance Criteria` (or `## Success Criteria`)
- No `## Required Files` / `## Required Output` AND no explicit file paths in the body
- No source-code file extensions (.ts/.tsx/.js/.php/.py/.go/.rs) — would trigger hollow-build gate

Warnings (logged, do not block):
- Missing Test Commands section
- Missing Out of Scope / Done When
- No rock mapping
- Vague language ("should work", "looks good")

### Templates

- `prds/TEMPLATE.md` — client website/theme/plugin work
- `prds/CODE-TEMPLATE.md` — internal code work (daemon, libraries, tools, integrations)

Both templates are exempt from lint. The `github-issue-*` auto-converted PRDs from intake bypass HARD fails (they need to flow through dream-promotion logic) but get a strong WARN if too thin.

### To bypass lint (rarely needed)

Don't. Fix the PRD instead. If you genuinely need to bypass, drop the PRD with a leading `# PRD-LINT: SKIP` comment and edit the linter rules — but every skip reason should land in this section as a permanent rule update.

---

## Banned Behaviors

- **No orphan PRDs.** Every build must be traceable to a GitHub issue or a quarterly rock.
- **No infinite retries.** Max 3 pipeline attempts. After that, park the PRD.
- **No hollow builds.** If you ship zero source files, it counts as a failure, not a success.
- **No deploy without verification.** PRD #98 exists because we shipped 404s silently.
- **No model experiments without logging.** All builds must be traceable to a model entry.

---

## Escalation

Stuck? Ask in this order:
1. Integrator (Hermes) — tactical blockers
2. Visionary (Seth) — strategic decisions, budget, rocks

Never escalate to Seth for a retry budget. That's Hermes' job.

---

## File Locations

| File | Path |
|------|------|
| This context | `/home/agent/shipyard-ai/EOS-CONTEXT.md` |
| PRDs | `/home/agent/shipyard-ai/prds/` |
| Deliverables | `/home/agent/shipyard-ai/deliverables/` |
| Failed PRDs | `/home/agent/shipyard-ai/prds/failed/` |
| Parked PRDs | `/home/agent/shipyard-ai/prds/parked/` |
| Completed PRDs | `/home/agent/shipyard-ai/prds/completed/` |
| Daemon source | `/home/agent/great-minds-plugin/daemon/src/` |
| Daemon log | `/tmp/claude-shared/daemon.log` |
| Database | `/home/agent/shipyard-ai/cost-tracker.db` (when deployed) |

---

## Agent Prompt Rules

- Before building, read this file.
- Before writing a PRD, check the rocks.
- After building, check hollow build gate (minimum 3 source files).
- If verification fails, HALT — do not ship.
- If your model costs >$5 for a single build, escalate to Integrator.

