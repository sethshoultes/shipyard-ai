# Round 1 — Elon (CPGO)

## Architecture
The bug is not a missing `mtime` check. The bug is using **directory existence as a state machine**. `daemon.ts` and `health.ts` are running distributed consensus via `fs.existsSync`. That is architectural bankruptcy, not a logic error.

The simplest system that could work is one SQLite table: `(slug, state, version, updated_at)`. One source of truth. One query. No races, no silent skips, no mtime edge cases. File moves are for build artifacts, not orchestration state. The PRD layers a band-aid on a broken foundation. It will stop the bleeding for two weeks, then a new race will appear.

## Performance
`statSync` inside a Chokidar handler blocks the event loop. Today — invisible. At 100× usage (1,000 PRDs/day, intake recreating every 5 min), you are doing synchronous syscalls on every event. Node stalls.

The 10× path is not "faster statSync." It is eliminating the filesystem as a queue entirely. SQLite in WAL mode handles 10,000 writes/sec on a Raspberry Pi. A filesystem queue cannot. Band-aids do not scale; they rot.

## Distribution
This is background plumbing. It has **zero external users** and never will. Asking how to distribute it without paid ads is like asking how to virally market a piston ring.

The only metric that matters: does every engineer run it without thinking? Distribution here means zero-friction onboarding — one shell script that installs, validates, and starts. Fix the first 30 seconds, not virality.

## What to CUT
- **CUT AC #5 (manual smoke test).** "Place a file, restart the daemon, eyeball the log" is operational toil, not acceptance criteria. If a test needs a human to read a log, automate it or delete it. Manual smoke tests are how outages become weekends.
- **CUT the retro file deliverable.** Post-mortems are conversations, not filesystem artifacts. If you need a markdown file to remember why you were down for 2 days, your observability is broken and your team has memory loss.
- **CUT "refactor for testability" via export changes.** If you need to mutate the module surface area to test 30 lines of pure logic, you are testing wrong. Mock `PRDS_DIR` with a temp directory, monkey-patch `fs`, or use `vi.spyOn`. Changing exports to chase coverage is a v2 feature masquerading as v1.
- **CUT the delusion that mtime is a safe long-term fix.** It is a tourniquet, not surgery. Ship it because the patient is bleeding, but leave a code comment that says exactly why it is there and what the replacement is. No hand-waving.

## Technical Feasibility
Yes. One agent session can patch `isAlreadyProcessed`, add `statSync`, write the vitest file against a temp directory, and run `tsc --noEmit` in under 30 minutes. The patch is trivial.

What is *not* feasible in one session is replacing the filesystem queue with SQLite. That requires schema design, migration logic, backfill, and updating every consumer of `prds/completed/`, `prds/failed/`, and `prds/parked/`. Accept this PRD as a tactical patch, not a strategic fix. Do not let the team pretend otherwise.

## Scaling
At 100× usage, three things break — all predictable:

1. **Concurrency.** `mv prds/x.md prds/failed/x.md` is not atomic across processes or even async ops in the same process. Parallel intake + watcher + build phases will race. You cannot run multiple daemon instances today; at 100× you will need to, and the filesystem queue will corrupt itself.

2. **Filesystem pressure.** Chokidar degrades linearly with watched directory size. Thousands of files in `prds/` and subdirectories means watcher CPU spikes proportionally. You are paying O(n) CPU for O(1) state lookups.

3. **Precision collapse.** The PRD acknowledges the `<=` mtime tie-risk. On many Linux hosts, ext4 timestamps have 1-second precision. Under load, intake recreates a PRD within the same second it was moved to `failed/`. The watcher drops a valid retry. The PRD calls this a "safe default." It is not. It is **guaranteed data loss** at scale. One drop per day at 100× volume is 365 silent failures per year.

Ship the band-aid. But do not confuse shipping with solving. If you 100× this system without replacing the filesystem queue with a real state store, you will be back here in three months with a harder outage, angrier users, and more retro files.
