# Product Management Gap — Findings & Daemon Changes

**Audience:** Phil Jackson, Steve Jobs, Elon Musk, Margaret Hamilton, and any future Shipyard agent reading this.
**Date:** 2026-04-27
**Status:** proposed — humans review and activate cron entries; agents read and act.

---

## TL;DR

1. **You don't need a new product-manager persona plugin.** The persona surface is mostly there: Marty Cagan in `great-operators`, Phil Jackson in `great-minds`, Marcus Aurelius in `great-minds`. Adding more PM voices is pleasant; it isn't load-bearing.
2. **What you DO need is a stall-detector loop that forces the build-or-kill decision.** Shipyard's failure mode isn't lack of ideas (the dream cycle is producing them). It's a long tail of "almost-ships" that accumulate analysis docs without committing to BUILD or killing the PRD.
3. **The state files (STATUS.md, TASKS.md, HEARTBEAT.md, AGENTS.md) have drifted from git reality.** STATUS.md says IDLE; git log shows ships every few days. The cron reads stale state and dispatches into a void.

The fix is small: ~150 lines of Node, a new cron entry, a state-sync script, and one cross-dispatched persona (Cagan). This document is the spec. The code lives next to it in `pipeline/auto/stall-detector.mjs` and `pipeline/auto/state-sync.mjs`.

---

## Diagnosis (grounded in the actual repo, 2026-04-27)

### What's working

- **The daemon ships.** Recent git log: `prd-wp-sentinel-2026-04-27` (today), `work-page-refactor`, `github-issue-...-#84`. Multiple "daemon: auto-commit" entries. The build-and-ship pipeline functions when a project gets past PLAN.
- **Ideation is healthy.** `dreams/` has Steve+Elon "dream" sessions every 2-4 days through April 19, generating new project candidates with vote files.
- **Cron is firing.** Three jobs in `HEARTBEAT.md`: Phil dispatch every 29 min, Jensen review at :17, system heartbeat every 5 min.

### Where things stall

**Symptom 1 — Analysis-doc pile at repo root.** 17+ files at the top level whose names start with `RISK-`, `RISK_`, `PULSE_`, `CODEBASE_SCOUT_`, `REQUIREMENTS_`, or `WARDROBE-`. Examples:

- `RISK-CHECKLIST-blog-infrastructure.md`
- `RISK-REPORT-deploy-all-plugins.md`
- `PULSE_RISK_SCANNER_REPORT.md` (and `PULSE_RISK_SUMMARY_EXECUTIVE.md` and `PULSE_RISK_QUICK_REFERENCE.txt`)
- `CODEBASE_SCOUT_REPORT.md` (and `_HOMEPORT.md` and `_INDEX.md`)
- `REQUIREMENTS-VALIDATION-MATRIX.md` (and `-ANALYSIS.md` and `_ANALYSIS.md` — two different cases)
- `WARDROBE-DEPLOYMENT-RUNBOOK.md` (and `-EXECUTIVE-BRIEF.md` and `-RISK-ANALYSIS.md`)

These are graveyard markers. Each one is a project that generated analysis but never crossed into BUILD with commits. Some have *multiple* analysis docs from different agents on the same topic (note three `PULSE_RISK_*` files; three `WARDROBE-*` files; five `REQUIREMENTS*` variants). That's not "thorough planning." That's agents producing analysis when they should be coding, because nothing in the loop is forcing the question *"is this ready to build, or should we kill it?"*

**Symptom 2 — `.planning/` has the same pattern in miniature.** 33 files including `phase-1-plan.md`, `phase-1-plan-old.md`, `phase-1-plan-old-eventdash.md`, `phase-1-plan-spark.md.backup`, `REQUIREMENTS-old.md`, `REQUIREMENTS-spark.md.backup`. Multiple versions of the same plan, none of them current.

**Symptom 3 — State-file drift.**

| File | Says | Git reality |
|---|---|---|
| `STATUS.md` | "Agency state: IDLE", "Last shipped: 2026-04-16" | Ships in the log on 2026-04-27, 04-23, 04-19 |
| `TASKS.md` | "Last dispatch: 2026-04-03 19:10 UTC" — three weeks stale | Phil cron firing every 29 min |
| `AGENTS.md` | 7 active agents | `README.md` lists 14 (added Rick Rubin, Aaron Sorkin, Oprah, Buffett, Shonda, Marcus Aurelius); `PIPELINE.md` lists ~10 |
| `.daemon-queue.json` | empty (0 bytes) | The daemon is committing, so SOMETHING is queueing — but not through this file |

**Symptom 4 — Pipeline vocabulary has two versions.**

- `CLAUDE.md`: `intake → debate → plan → build → review → deploy → done`
- `PIPELINE.md`: `PRD → /agency-debate → /agency-plan → /agency-execute → /agency-verify → /agency-qa → /agency-review → /agency-ship`
- `README.md`: `PRD → Debate → Plan → Build → QA → Creative Review → Board Review → Ship`

Three different stage names. Agents reading different files form different mental models. When a project is "stuck in PLAN," whose PLAN definition applies?

**Symptom 5 — The dream-to-PRD-to-build bridge is leaky.** `dreams/` produces idea candidates. `prds/` is where PRDs land. There's no automated path from "dream votes ELON+STEVE both YES" → "create PRD draft" → "land in queue." Dreams accumulate. Some become PRDs by hand. The rest fade.

### The actual failure mode

It is not "agents can't decide" in the abstract. It is more specific:

> A PRD enters the pipeline, debates run, planning starts, agents generate analysis (scout reports, risk matrices, requirements analyses, validation matrices), and then nothing forces the question *"given these analyses, are we shipping or killing?"* — so the analyses pile up and the project drifts off the daemon's radar.

This is the **analysis-as-progress fallacy**. It is a known PM pathology. The fix is not more agents writing more analyses. The fix is a forcing function that says: at hour N of PLAN with M analysis docs and zero BUILD commits, **someone has to make the call**. That someone is Cagan — already in `great-operators`, asks "which of value / usability / feasibility / viability did you actually test?" — and if his diagnosis cycles twice without progress, the human gets paged.

---

## Why a new persona plugin is the wrong shape

The instinct "we need a great-pm-plugin with 9 PM personas" is reasonable but doesn't fix this. Reasons:

1. **The persona surface is mostly already there.** Marty Cagan (operators) is the canonical product-discovery voice — four risks, opportunity solution trees, outcome over output. Phil Jackson (minds) is the orchestrator. Marcus Aurelius (minds) is the mediator. Julie Zhuo (designers) covers design management. Adding Ken Norton, Shreyas Doshi, Lenny Rachitsky etc. would give Shipyard more PM voices to reference but wouldn't fix the loop.
2. **Adding personas without a forcing-function loop just generates more analysis.** Right now the failure mode is too much analysis. A new plugin would invite agents to dispatch more PM voices and produce *more* docs about why the project is stalled, instead of forcing the build-or-kill decision.
3. **The constellation rule: one craft per plugin.** "Product management" as a craft has Cagan in operators (the working voice) and Zhuo in designers (the design-management voice). It's already represented.
4. **The thing missing is infrastructure, not craft.** A cron-driven stall detector that reads project state, dispatches Cagan when stalls cross threshold, and escalates to the human — that's not a persona plugin. That's a script in `pipeline/auto/`.

So: build the script. Reference the existing personas. Don't build the plugin.

---

## The fix — four daemon changes

### Change 1: stall-detector cron (new)

**Goal:** detect projects that have analysis docs without commits, time-in-phase exceeded, or other markers of the analysis-as-progress trap. Trigger Cagan to force the build-or-kill decision.

**Cron:** `7 */4 * * *` (every 4 hours, offset to :07 to avoid contention).

**Code:** `pipeline/auto/stall-detector.mjs` (committed alongside this doc).

**What it does, in pseudocode:**

```
for each dir in projects/* and prds/*:
  measure:
    - time since last commit touching this path
    - count of analysis docs in this path (RISK-*, *-ANALYSIS.md, *-REPORT.md, REQUIREMENTS*.md, SCOUT*.md)
    - count of code commits in this path (anything in src/ build/ deliverables/code/)
    - current phase (parsed from STATUS.md or project's plan/ dir)
  classify:
    GREEN  — recent commits, balanced ratio, on-track
    YELLOW — analysis_docs >= 3 with no code commits in 24h     [dispatch Cagan, light]
    RED    — analysis_docs >= 5 OR time-in-phase > 72h          [dispatch Cagan, force decision]
    BLACK  — Cagan dispatched twice in past week, still stalled [escalate to human via heartbeat]
  emit findings into:
    - .daemon-queue.json (the actual dispatch queue)
    - pipeline/auto/stall-detector.log (audit trail)
    - HEARTBEAT.md (only when escalating to human)
```

**Thresholds are tunable** — the script reads a `pipeline/auto/stall-detector.config.json` if present.

**What it does NOT do:**
- Does not modify project files.
- Does not invoke Cagan directly. It writes to the queue. The Phil dispatch cron picks up queued dispatches on its next cycle.
- Does not auto-kill projects. Killing is a human decision; the script flags the candidate.

### Change 2: Cagan cross-dispatch entry

Cagan lives in `great-operators` already. Shipyard's agent registry needs an entry that maps the alias `cagan` (or `marty-cagan` or `pm`) to a cross-plugin dispatch:

```js
// pipeline/auto/agent-registry.json (new)
{
  "cagan": {
    "source": "great-operators",
    "subagent_type": "great-operators:marty-cagan-operator",
    "model": "sonnet",
    "trigger_phrases": ["product discovery", "the four risks", "is this worth building"],
    "dispatched_by": ["stall-detector", "phil-jackson"],
    "max_per_project_per_week": 2,
    "after_max": "escalate-to-human"
  }
}
```

**The `max_per_project_per_week: 2` is the load-bearing rule.** If Cagan dispatches twice on the same project and the project is still stalled, the third dispatch is the escalation to the human. This prevents the stall-detector from itself becoming an analysis loop.

### Change 3: state-file auto-sync (new)

**Goal:** STATUS.md, TASKS.md, AGENTS.md get re-generated from git reality so they stop drifting.

**Cron:** `13 * * * *` (every hour at :13, offset from existing crons).

**Code:** `pipeline/auto/state-sync.mjs` (committed alongside this doc).

**What it does:**

- Walks `projects/*/`, parses each project's current phase (from latest plan/, build/, ship/ files), counts analysis docs and code commits.
- Re-renders STATUS.md from this data: agency state (active vs. idle based on commits in past 48h), per-project rows, last-shipped from git tags.
- Re-renders TASKS.md from each project's plan/ or .planning/ phase plans, surfacing only OPEN/READY tasks. Tasks already done in git get marked done automatically.
- Reconciles AGENTS.md against `pipeline/auto/agent-registry.json` (which becomes the source of truth) and the README's published roster. Flags any divergence in `pipeline/auto/state-sync.log`.
- Does **not** auto-rewrite if the file has uncommitted manual edits. Agents may still edit by hand; the sync is overwriting only files that were last touched by the daemon.

### Change 4: analysis-doc relocator (one-shot, then preventive)

**Goal:** the 17+ analysis docs at repo root and the 33 in `.planning/` go where they belong.

**One-shot move (recommended for human review before running):**

Each analysis doc gets relocated based on its prefix:

- `RISK-*`, `RISK_*` → `projects/<inferred-slug>/risk/<original-name>`
- `PULSE_*` → `projects/pulse/risk/<name>` (or wherever pulse actually lives)
- `WARDROBE-*` → `projects/wardrobe/<name>`
- `CODEBASE_SCOUT_*` → `deliverables/scout-reports/<name>`
- `REQUIREMENTS_*`, `REQUIREMENTS-*` → `projects/<inferred-slug>/requirements/<original-name>`
- `*OLD*`, `*backup*` → `archive/`

If the project slug can't be inferred from the filename, the doc goes to `archive/unsorted/<name>` with a note in `archive/README.md`.

**Preventive rule (added to `CLAUDE.md`'s Pipeline section):**

> **Analysis docs do NOT live at repo root.** Every analysis artifact (risk report, scout report, requirements analysis, validation matrix, deployment runbook) belongs in `projects/{slug}/` or `deliverables/`. The repo root is for system files (README, CLAUDE, AGENTS, STATUS, MEMORY, HEARTBEAT, TASKS, SOUL) and nothing else. The stall-detector treats root-level analysis docs as a YELLOW signal: they are evidence the project bypassed its own directory.

The state-sync cron will eventually warn (not move) when it finds new analysis docs at root.

---

## Escalation policy

This is the part the constellation cannot decide for you. The stall-detector flags. Cagan dispatches once or twice. After that, the human gets pinged. Don't loop.

| Signal | Action | Who |
|---|---|---|
| YELLOW (3 analysis docs, no commits 24h) | Cagan dispatched (light) — produces a 200-word "what's the four-risk status" memo to `projects/{slug}/cagan-check-{N}.md` | Stall-detector cron |
| RED (5+ analysis docs OR 72h in phase) | Cagan dispatched (force decision) — produces a build-or-kill recommendation | Stall-detector cron |
| BLACK (Cagan ran twice in 7 days, still stalled) | Heartbeat log gets a `🚨 STALL ESCALATION` entry; STATUS.md gets a top-of-file note | Stall-detector cron |
| Phil dispatches Cagan and Cagan returns "human needed" | Same as BLACK | Phil dispatch cron |
| Project sits in PLAN > 14 days regardless of Cagan dispatches | Auto-archive to `archive/abandoned/{slug}/` with a note | Stall-detector cron |

The 14-day auto-archive is opinionated but defensible: if a project has been planning for two weeks without committing code, it is not a project. It is a position paper. Free the namespace.

---

## Operational checklist (this week)

For Phil Jackson (orchestrator):

- [ ] Read this document end-to-end. Confirm the diagnosis.
- [ ] Decide whether to enable `stall-detector.mjs` cron immediately or run it dry (log only) for 48h first. Recommended: dry first.
- [ ] Decide whether to enable `state-sync.mjs` cron. This will overwrite STATUS.md and TASKS.md on the next firing. Confirm there's nothing in those files Phil wants to keep before activation.
- [ ] Add Cagan to `pipeline/auto/agent-registry.json` (the file is committed alongside this doc).
- [ ] Run the analysis-doc relocator dry first. Review the proposed moves. Then execute.

For Steve and Elon (directors):

- [ ] Decide which pipeline vocabulary is canonical: CLAUDE.md's `intake → debate → plan → build → review → deploy`, PIPELINE.md's `/agency-debate → /agency-plan → /agency-execute → /agency-verify → /agency-qa → /agency-review → /agency-ship`, or README.md's `PRD → Debate → Plan → Build → QA → Creative Review → Board Review → Ship`. Pick one. Make the others reference it.
- [ ] Reconcile AGENTS.md (7 agents) and README.md (14 agents) — should they all be in the operating roster, or is the README aspirational? If aspirational, demote it. If real, add the missing 7 to AGENTS.md.

For Margaret Hamilton (QA):

- [ ] Add a smoke-test entry to `pipeline/qa/checklist.md`: "Stall-detector log has been read in past 48h; no BLACK escalations unaddressed."

For the human (you):

- [ ] When BLACK escalations land in HEARTBEAT.md, decide build-or-kill. The point of escalation is that this decision is yours to make.

---

## Where to dispatch by signal

This is the routing table the stall-detector and Phil reference. When something blocks, the question is "which persona unblocks this?" — and the answer should not be "another scout report."

| Blocker shape | Dispatch |
|---|---|
| "Should we build this at all?" | `cagan` (great-operators) — the four risks |
| "What's the simplest version we can ship to test the value?" | `cagan` (great-operators) — discovery prototype |
| "We disagree on the technical approach" | `steve` + `elon` — debate, 1 round |
| "We disagree and a round didn't resolve it" | `phil-jackson` (great-minds) — orchestrator decides |
| "Engineering can't see how to build it" | `elon` direct + `dhh` (great-engineers) — pragmatic web architecture |
| "The product feels off but we can't articulate why" | `aurelius` (great-minds) — Stoic mediation; or `rick-rubin` (great-minds) — essence |
| "We need a board verdict on shipping" | `jensen-huang` + `oprah` + `buffett` + `shonda` per README — board review |
| "QA found a P0" | `margaret-hamilton` (great-minds) — block ship |
| "We need design taste at the executive level" | `jony-ive` (great-minds) — strategic visual taste |
| "We need design craft at the working level" | `norman` / `rams` / `kare` etc. (great-designers) — hands-on craft |
| "Is this legal / ethical / regulatory?" | `counsels` plugin — `rbg` / `lessig` / `wu` / `rawls` / etc. (NOT LEGAL ADVICE) |
| "How do we run this operation at scale?" | `cook` / `grove` / `deming` / `ohno` (great-operators) |

The constellation is now nine plugins deep. Use it. Do not ask agents inside Shipyard to invent voices that already exist in `great-*` plugins — cross-dispatch.

---

## Acceptance criteria (how Shipyard knows the gap is closed)

- **No analysis docs at repo root** for two weeks. New ones go to `projects/{slug}/` or `deliverables/`.
- **STATUS.md is current** within 1 hour of git activity.
- **TASKS.md surfaces only actionable open tasks**, with a count that goes up and down with reality (not stale 3-week dispatches).
- **At least one Cagan dispatch per stalled project** before any project gets archived as abandoned.
- **No BLACK escalation goes unaddressed** in HEARTBEAT.md for >24 hours.
- **The dream → PRD → build path is automated** for at least one project (manual for now, but with a clear bridge: vote-positive dream → PRD draft in `prds/draft/` → human approves → moves to `prds/active/`).

---

## What's NOT in this fix (deferred)

- A great-pm-plugin (not the right shape; revisit only if signals change after stall-detector runs for a month).
- A unified UI / dashboard (Shipyard's "UI" is markdown files + git; that's fine).
- ML-based stall prediction (lol, no — file mtimes and commit counts are the right signal at this stage).
- Replacing Phil Jackson with anything else (he's the orchestrator persona; he just needs better state to dispatch from, which is what state-sync provides).
- Adding more board personas (the board has 4; that's plenty).

---

## References

- **Constellation roadmap:** brain vault `projects/caseproof-ai-company-constellation.md`
- **Cagan persona file:** `great-operators-plugin/agents/marty-cagan-operator.md`
- **Phil Jackson persona file:** `great-minds-plugin/agents/phil-jackson-orchestrator.md` (or current path)
- **Marcus Aurelius persona file:** `great-minds-plugin/agents/marcus-aurelius-mod.md`
- **Stall-detector code:** `pipeline/auto/stall-detector.mjs` (this commit)
- **State-sync code:** `pipeline/auto/state-sync.mjs` (this commit)
- **Daemon queue schema:** `.daemon-queue.json` (this commit, populated)

---

*Drafted by Claude (Opus) on 2026-04-27 at the founder's request. Phil Jackson and the directors review and decide what to enable. The stall-detector script is committed but its cron is NOT auto-activated — that's a human-in-loop decision.*
