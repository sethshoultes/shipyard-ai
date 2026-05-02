# Round 1 — Elon (CPGO)

## Architecture
The bug isn't missing `mtime` logic. The bug is using a **directory layout as a state machine**. `daemon.ts` and `health.ts` are playing distributed consensus with `fs.existsSync`. That is not a bug; that is architectural bankruptcy.

The simplest system that could work is a single SQLite table: `(prd_path, state, version, updated_at)`. One source of truth. One query. No edge cases about mtimes, no races between intake and watcher, no silent skips because a file moved to the wrong folder. File moves are fine for build artifacts, not for orchestration state.

The PRD's proposed fix layers mtime comparison on top of the broken foundation. It will work for two weeks, then a new race will appear. First principles: if your state machine is grep'ing a directory tree, you have already lost.

## Performance
`statSync` inside a Chokidar event handler blocks the event loop. At today's rate — maybe 10 PRDs per day — it is invisible. At 100× usage (1,000 PRDs/day), intake recreates a PRD every 5 minutes, the watcher fires on every `writeFileSync`, and you are doing synchronous syscalls on every event. Node will stall.

The 10× path is not "faster statSync." It is eliminating the filesystem as a queue entirely. SQLite in WAL mode can handle 10,000 state transitions per second on a Raspberry Pi. A filesystem queue cannot. Band-aids do not scale; they rot.

## Distribution
This is a background daemon. It has **zero external users**. It will never have 10,000 users. Asking how to distribute it without paid ads is like asking how to virally distribute a piston ring.

The only metric that matters: does every engineer run it without thinking? If the daemon requires a wiki page to start, it has already failed. Distribution here means zero-friction onboarding — a single shell script that installs, validates, and runs. Fix the first 30 seconds, not virality.

## What to CUT
- **CUT AC #5 (manual smoke test).** "Place a file, restart the daemon, and eyeball the log" is operational toil, not acceptance criteria. If the test requires a human to read a log line, automate it properly or delete it. Manual smoke tests are how outages become weekends.
- **CUT the retro file deliverable.** Post-mortems are conversations, not filesystem artifacts. If you need a markdown file at `memory/daemon-fix-retrospective.md` to remember why you were down for 2 days, your observability is broken and your team has memory loss. Talk, then fix the logging so the next incident is obvious in real time.
- **CUT "refactor for testability" via export changes.** The PRD suggests refactoring `isAlreadyProcessed` to take paths as parameters so tests can inject them. Wrong. If you need to mutate the module surface area to test 30 lines of pure logic, you are testing wrong. Mock `PRDS_DIR` with a temp directory, monkey-patch `fs`, or use `vitest`'s `vi.spyOn`. Changing exports to chase coverage is a v2 feature masquerading as v1.
- **CUT the delusion that mtime is a safe long-term fix.** It is a tourniquet, not surgery. Ship it because the patient is bleeding, but leave a code comment that says exactly why it is there and what the replacement architecture is. No hand-waving.

## Technical Feasibility
Yes. One agent session can patch `isAlreadyProcessed`, add the `statSync` import, write the vitest file against a temp directory, and run `tsc --noEmit` in under 30 minutes. The patch itself is trivial.

What is *not* feasible in one session is replacing the filesystem queue with SQLite. That requires schema design, migration logic, backfill of existing PRDs, and updating every consumer of `prds/completed/`, `prds/failed/`, and `prds/parked/`. Accept that this PRD is a tactical patch, not a strategic fix. Do not let the team pretend otherwise.

## Scaling
At 100× usage, three things break — all first-principles, all predictable:

1. **Concurrency.** `mv prds/x.md prds/failed/x.md` is not atomic across processes or even across async operations in the same process. Parallel intake + watcher + build phases will race. You cannot run multiple daemon instances today; at 100× you will need to, and the filesystem queue will corrupt itself.

2. **Filesystem pressure.** Chokidar degrades linearly with watched directory size. Thousands of files in `prds/` and its subdirectories means the watcher CPU usage spikes proportionally. You are paying O(n) CPU for O(1) state lookups.

3. **Precision collapse.** The PRD acknowledges the `<=` mtime tie-risk. On many Linux hosts, ext4 timestamps have 1-second precision. If intake recreates a PRD within the same second it was moved to `failed/` — which will happen under load — the watcher silently drops a valid retry. The PRD calls this a "safe default." It is not. It is **guaranteed data loss** at scale. One dropped PRD per day at 100× volume is 365 silent failures per year.

Ship the band-aid. But do not confuse shipping with solving. If you 100× this system without replacing the filesystem queue with a real state store, you will be back here in three months with a harder outage, angrier users, and more retro files.
