# Round 1 — Elon (CPGO)

## Architecture
The bug isn't the missing `mtime` check. The bug is that `daemon.ts` and `health.ts` are playing distributed consensus with `fs.existsSync`. You have two filters inferring state from directory layout. That's not a bug, that's an architectural bankruptcy. The simplest system that could work is a single SQLite table: `(prd, state, updated_at)`. One source of truth. File moves are fine for artifacts, not for state machines.

## Performance
`statSync` inside a watcher handler blocks the event loop. At the current rate — maybe a few PRDs per hour — it's invisible. At 100× usage (say, 500 PRDs/day), you're doing hundreds of synchronous syscalls on every intake cycle. The 10× path is to eliminate the filesystem as a queue entirely: SQLite WAL + an async job table. Not `statSync` band-aids.

## Distribution
This is a background daemon. It has zero users. It will never have 10,000 users. Applying a consumer growth framework here is like asking how to virally distribute a piston ring. The only metric that matters is: does every engineer run it without thinking? Fix onboarding, not virality.

## What to CUT
- **CUT the manual smoke test (AC #5).** Restarting a service and eyeballing a log file is operational toil, not acceptance criteria. Automate or delete.
- **CUT the "refactor for testability" suggestion.** If you need to change exports to test 30 lines of pure logic, you're testing wrong. Use a temp directory and mock the constants. Changing the module surface area to chase coverage is v2 masquerading as v1.
- **CUT the retro as a deliverable.** Post-mortems are conversations, not file-system deliverables. If you need a markdown file to remember a 2-day outage, your observability is broken.

## Technical Feasibility
Yes. One agent session can write 40 lines and a vitest file in under 20 minutes. The patch itself is trivial. What is *not* feasible in one session is fixing the dual-source-of-truth architecture that guarantees the next bug of this class. Accept that this is a tactical patch, not a strategic fix.

## Scaling
At 100×, three things break — all first-principles:
1. **Concurrency:** You cannot run multiple daemon instances. `mv prds/x.md prds/failed/x.md` is not atomic across nodes. Even on one node, parallel intake + watcher race.
2. **Filesystem pressure:** Chokidar degrades linearly with directory size. Thousands of files in `prds/` and the watcher CPU usage spikes.
3. **Precision collapse:** The `mtime` tie-risk at 1s precision becomes a certainty under load. If two events happen in the same second, the `<=` check silently drops a retry. That is not a safe default; that is a guaranteed data loss at scale.

The fix ships. But do not confuse shipping with solving. If you 100× this system without replacing the filesystem queue, you will be back here in three months with a harder outage.
