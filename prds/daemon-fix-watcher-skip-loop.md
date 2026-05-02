# PRD: Daemon Fix — watcher skip-loop on retried intake PRDs

**Slug:** `daemon-fix-watcher-skip-loop`
**Project:** `great-minds-plugin/daemon` (the orchestration daemon itself)
**Type:** Bug fix
**Priority:** P1
**Date:** 2026-05-02

---

## Bug

`daemon/src/daemon.ts:102` — `isAlreadyProcessed(prdFile)` returns true if the same filename exists in **any** of `prds/completed/`, `prds/failed/`, or `prds/parked/`. The watcher uses this gate before queueing.

Meanwhile `daemon/src/health.ts:154` — `isIssueAlreadyConverted` allows the GitHub intake to **recreate** a PRD when its prior copy is in `failed/` (or when its deliverable dir is empty).

Result: when an intake-sourced PRD fails, intake faithfully recreates it every 5 min, but the watcher silently rejects every recreation because the failed copy still sits in `failed/`. The PRD never re-enters the queue. No log line mentions the rejection — `WATCHER` never fires `New PRD detected`, only intake's `Created PRD` line.

This shipped a real-world stall: `dream-candidate` issues #86, #90, #91 (P1/P2 dreams) sat in this loop for 2 days after being marked for production. Diagnosed only after the user noticed they hadn't been worked.

## Reproduction

1. Submit a PRD that fails the build phase. Daemon moves it to `prds/failed/<name>.md`.
2. If the PRD originated from a GitHub issue, intake's next 5-min cycle calls `writeFileSync(prds/<name>.md, ...)` — recreates it in the live dir.
3. Chokidar emits `add`. Watcher's `add` handler calls `isAlreadyProcessed("<name>.md")`. Returns true. Logs `WATCHER: Skipping "..." — already processed`.
4. Loop forever.

(In our actual incident the `Skipping` log line *did not* appear in the daemon.log we have on disk, possibly truncated. Either way the file existence check explains the no-queue behavior.)

## Fix Approach

The two filters disagree on what "already processed" means. Bring them into agreement: a PRD is **NOT** already processed if a fresh copy in `prds/` exists with mtime **newer** than any copy in `failed/` or `parked/`. (`completed/` always wins — never re-attempt a shipped PRD.)

### Changes

**File:** `daemon/src/daemon.ts`

Replace the body of `isAlreadyProcessed(prdFile: string): boolean` (currently lines 102–107) with:

```ts
function isAlreadyProcessed(prdFile: string): boolean {
  const completedPath = resolve(PRDS_DIR, "completed", prdFile);
  if (existsSync(completedPath)) return true;

  const livePath = resolve(PRDS_DIR, prdFile);
  const failedPath = resolve(PRDS_DIR, "failed", prdFile);
  const parkedPath = resolve(PRDS_DIR, "parked", prdFile);

  for (const archivePath of [failedPath, parkedPath]) {
    if (!existsSync(archivePath)) continue;
    if (!existsSync(livePath)) return true; // archived and not retried — skip
    try {
      const archiveMtime = statSync(archivePath).mtimeMs;
      const liveMtime = statSync(livePath).mtimeMs;
      if (liveMtime <= archiveMtime) return true; // not a fresh retry — skip
    } catch {
      return true; // safe default
    }
  }
  return false;
}
```

This means: if the live copy is newer than the archived copy, treat it as a retry and queue it.

**Also add `statSync` import** at the top of `daemon.ts`:

```ts
import { existsSync, readFileSync, statSync } from "fs";
```

(Verify whether `existsSync` is already imported from `fs` and add `statSync` to the same import.)

### Logging visibility (small but important)

When the watcher rejects a file, the existing log already says `WATCHER: Skipping "<name>" — already processed`. Strengthen it to include the *reason*:

```ts
if (isAlreadyProcessed(name)) {
  log(`WATCHER: Skipping "${name}" — already processed (completed/failed/parked)`);
  return;
}
```

…and when intake recreates a PRD that is in `failed/` or `parked/`, log it explicitly so future incidents are visible:

**File:** `daemon/src/health.ts` near line 274 (where `INTAKE: Created PRD` is logged):

```ts
const failedPath = resolve(PRDS_DIR, "failed", filename);
const parkedPath = resolve(PRDS_DIR, "parked", filename);
if (existsSync(failedPath)) log(`INTAKE: Note — recreating "${filename}" which has a copy in failed/. Watcher will compare mtimes.`);
if (existsSync(parkedPath)) log(`INTAKE: Note — recreating "${filename}" which has a copy in parked/. Watcher will compare mtimes.`);
log(`INTAKE: Created PRD ${filename}`);
```

### Tests

Add `daemon/tests/watcher-skip.test.ts` (vitest — repo already uses it):

1. Live PRD newer than failed copy → `isAlreadyProcessed` returns false
2. Live PRD older than failed copy → returns true
3. Only failed copy exists, no live → returns true
4. Only completed copy exists → returns true regardless
5. Live PRD newer than parked copy → returns false

Use a temp directory and mock `PRDS_DIR` if needed; or refactor the function to take paths as parameters for testability (acceptable refactor — keep export shape identical).

## Acceptance Criteria

1. `daemon/src/daemon.ts` `isAlreadyProcessed` updated as above. `statSync` imported.
2. `daemon/src/health.ts` intake logs warn on recreation over archived copy.
3. New vitest file passes locally: `cd daemon && npx vitest run tests/watcher-skip.test.ts`.
4. `npx tsc --noEmit` exits 0 from `daemon/`.
5. Manual smoke: place a stale failed copy at `prds/failed/foo.md`, then write a newer `prds/foo.md`, restart daemon, confirm `WATCHER: New PRD detected — foo.md` appears in `daemon.log`.
6. Backwards compat: a PRD with no live copy and only an archive copy still logs `Skipping — already processed`.
7. No new dependencies added to `daemon/package.json`.

## Out of Scope

- Changing intake's recreation logic (the dual-source-of-truth is tolerable once the watcher's mtime check is in place).
- Renaming `failed/` or `parked/`.
- Cleanup of historical kimi-failed PRDs (already renamed manually 2026-05-02).
- The orthogonal Kimi build-phase issue (already fixed via `BUILD_PHASE_MODEL` env override).

## Risks

- **mtime precision on the host filesystem.** Linux ext4 has ms precision; this is fine for our 5-min recreate cadence. If a future filesystem has 1s precision and intake recreates within the same second as a move-to-failed, we could see a tied mtime. The `<=` operator in the check treats ties as "already processed" — safe default (one wasted recreate cycle, never an infinite loop).
- **`statSync` synchronous** — fine here, watcher is event-driven, called per-file at low rate.

## Done When

- All acceptance criteria pass
- Daemon redeployed (auto via shipyard pipeline ship phase OR explicit `systemctl restart shipyard-daemon.service`)
- Retro at `memory/daemon-fix-watcher-skip-loop-retrospective.md` with the 2-bug stack story (Kimi hollow build + watcher skip-loop) for future debugging context
