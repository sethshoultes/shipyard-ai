# Stall Detector — Operator Guide

> Spec: [`docs/PRODUCT-MANAGEMENT-GAP.md`](../../docs/PRODUCT-MANAGEMENT-GAP.md)
> Code: [`stall-detector.mjs`](./stall-detector.mjs), [`state-sync.mjs`](./state-sync.mjs)
> Registry: [`agent-registry.json`](./agent-registry.json)

## What it does

Two cron-driven scripts that fix the analysis-as-progress failure mode:

1. **`stall-detector.mjs`** — every 4h, scans `projects/*` and `prds/*`, classifies each as GREEN/YELLOW/RED/BLACK based on analysis-doc count, time-in-phase, and commit recency. Writes Cagan dispatch entries to `.daemon-queue.json`. Escalates BLACK projects to the human via `HEARTBEAT.md`.
2. **`state-sync.mjs`** — every hour, re-renders `STATUS.md` and `TASKS.md` from git reality so they stop drifting. Reconciles `AGENTS.md` against `agent-registry.json`.

Neither script modifies project files. Neither script invokes Cagan directly — Phil's dispatch cron picks queue entries up.

## Activation (manual, opt-in)

The scripts are committed but their crons are NOT auto-installed. Phil reviews and decides.

### Step 1 — dry run

Run both scripts with `--dry` to see what they would do without writing:

```bash
cd /home/agent/shipyard-ai
node pipeline/auto/stall-detector.mjs --dry
node pipeline/auto/state-sync.mjs --dry
```

Read the output. If the classifications look right, proceed.

### Step 2 — first real run

```bash
node pipeline/auto/stall-detector.mjs
node pipeline/auto/state-sync.mjs
```

**Note on bootstrap:** `state-sync.mjs` will refuse to overwrite `STATUS.md` and `TASKS.md` on the first run because their last commit is not daemon-authored (i.e., a human wrote the current versions). To bootstrap:

1. Either commit a placeholder version with `state-sync: bootstrap` as the message, or
2. Delete the file and re-run state-sync (which will create it fresh and write a daemon-authored commit on its first cron-driven run).

After bootstrap, every subsequent state-sync run will refresh both files. If a human later edits STATUS.md or TASKS.md by hand and commits with a non-daemon message, the script will respect that edit and skip it on the next run — leaving manual edits intact until the human commits with a daemon prefix again.

Inspect:

- `.daemon-queue.json` — should have stall-detector entries for any non-GREEN projects.
- `STATUS.md` — should reflect git reality (active projects with recent commits).
- `TASKS.md` — should show only plan files from active projects.
- `pipeline/auto/stall-detector.log`, `state-sync.log` — audit trails.

### Step 3 — install crons

If satisfied with the first run, append to the project's cron schedule:

```cron
# Stall detector — every 4h, offset to :07
7  */4 * * *   cd /home/agent/shipyard-ai && /usr/bin/node pipeline/auto/stall-detector.mjs >> pipeline/auto/stall-detector.cron.log 2>&1

# State sync — hourly at :13
13 *   * * *   cd /home/agent/shipyard-ai && /usr/bin/node pipeline/auto/state-sync.mjs >> pipeline/auto/state-sync.cron.log 2>&1
```

Update `HEARTBEAT.md` with the two new entries.

### Step 4 — wire Phil's dispatcher to read the queue

Phil's existing 29-min cron reads `TASKS.md`. It also needs to read `.daemon-queue.json` and dispatch any pending Cagan calls there. This wiring depends on Phil's current implementation; the doc points at it but the diff is Phil's to make.

The minimum viable wiring:

```js
// pseudocode for Phil's dispatch cycle
const queue = JSON.parse(readFileSync(".daemon-queue.json", "utf8"));
for (const entry of queue.entries) {
  if (entry.dispatch && entry.status !== "dispatched") {
    Agent({
      subagent_type: agentRegistry[entry.dispatch.agent].subagent_type,
      prompt: entry.dispatch.prompt
    });
    entry.status = "dispatched";
    entry.dispatched_at = new Date().toISOString();
  }
  if (entry.escalation && entry.escalation.target === "human" && entry.status !== "escalated") {
    appendToHeartbeat(entry.escalation.message);
    entry.status = "escalated";
  }
}
writeFileSync(".daemon-queue.json", JSON.stringify(queue, null, 2));
```

## Tuning

Thresholds live in `pipeline/auto/stall-detector.config.json` (create it if absent — defaults are baked into the script). Example override:

```json
{
  "thresholds": {
    "yellow_analysis_docs": 4,
    "red_analysis_docs": 7,
    "red_time_in_phase_hours": 96
  }
}
```

After tuning, run `--dry` to confirm the new thresholds classify projects sensibly before the next live run.

## What if the script flags a project the human knows is fine?

Three options:

1. **Tune thresholds** — if the script is too sensitive across the board.
2. **Add a project allowlist** — drop a `.stall-detector-ignore` file at `projects/{slug}/.stall-detector-ignore` to opt that project out (planned, not yet implemented — the script will respect this file once it's added; PRs welcome).
3. **Mark it manually GREEN** — commit any small change to the project (a note in `projects/{slug}/notes.md`) and the next sync will see fresh activity.

## What if the script misses a stall the human can see?

Lower `yellow_analysis_docs` to 2, or `red_time_in_phase_hours` to 48. Or add a custom analysis-doc pattern to `analysis_doc_patterns` in the config.

## Failure modes (known, accepted for v1)

- **Same-named projects across `projects/` and `prds/` get classified twice.** Acceptable — the queue dedupes on `id` which includes the root.
- **Sub-projects nested deeper than one level are not detected.** v1 scans `projects/*/` and `prds/*/` only. Add deeper traversal if needed.
- **The script does not understand "this PRD was renamed."** A renamed project looks like a new GREEN project (no history) plus a stale RED/BLACK old name. Manual cleanup handles that.
- **No interaction with the dream→PRD bridge yet.** Listed in the gap doc as future work.

## See also

- [`docs/PRODUCT-MANAGEMENT-GAP.md`](../../docs/PRODUCT-MANAGEMENT-GAP.md) — the diagnosis and policy this implements.
- [`HEARTBEAT.md`](../../HEARTBEAT.md) — the cron schedule (update when activating).
- [`AGENTS.md`](../../AGENTS.md) — the active roster (reconcile against `agent-registry.json`).
- [`SOUL.md`](../../SOUL.md) — *"Ship or Die. Every PRD has a finish line. We hit it."* — this whole loop is in service of that value.
