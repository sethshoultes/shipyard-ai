# Spec — Daemon Fix: Watcher Skip-Loop on Retried Intake PRDs

**Slug:** `daemon-fix-watcher-skip-loop`
**Date:** 2026-05-02
**Status:** Ready for Build

---

## Goals

From the PRD, this fix addresses a bug where:

1. **The Problem:** When a PRD from GitHub intake fails, it lands in `prds/failed/`. Intake's next 5-min cycle recreates it in `prds/`, but the watcher silently rejects it because `isAlreadyProcessed()` returns true for any file in `failed/`. The PRD never re-enters the queue.

2. **The Fix:** Align the watcher's `isAlreadyProcessed()` logic with intake's `isIssueAlreadyConverted()` logic. A PRD is **NOT** already processed if:
   - A fresh copy exists in `prds/` with mtime **newer** than any copy in `failed/` or `parked/`
   - (`completed/` always wins — never re-attempt a shipped PRD)

3. **Logging Visibility:** When the watcher rejects a file, it must log the *reason* explicitly. No silent rejections.

4. **Intake Visibility:** When intake recreates a PRD that has a copy in `failed/` or `parked/`, log it explicitly for debugging.

---

## Implementation Approach

From the plan and decisions:

### 1. Patch `daemon/src/daemon.ts` — `isAlreadyProcessed()`

Replace the current implementation (lines 102–107) with mtime-aware logic:

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

### 2. Add `statSync` Import

Add `statSync` to the existing `fs` import in `daemon.ts`:

```ts
import { existsSync, readFileSync, statSync } from "fs";
```

### 3. Strengthen Watcher Skip Log

Update the skip log message to include the reason:

```ts
if (isAlreadyProcessed(name)) {
  log(`WATCHER: Skipping "${name}" — already processed (completed/failed/parked)`);
  return;
}
```

### 4. Add Intake Recreation Log

In `daemon/src/health.ts` near the `INTAKE: Created PRD` log (line ~274), add warnings:

```ts
const failedPath = resolve(PRDS_DIR, "failed", filename);
const parkedPath = resolve(PRDS_DIR, "parked", filename);
if (existsSync(failedPath)) log(`INTAKE: Note — recreating "${filename}" which has a copy in failed/. Watcher will compare mtimes.`);
if (existsSync(parkedPath)) log(`INTAKE: Note — recreating "${filename}" which has a copy in parked/. Watcher will compare mtimes.`);
log(`INTAKE: Created PRD ${filename}`);
```

### 5. Add Vitest Test File

Create `daemon/tests/watcher-skip.test.ts` with tests for:
1. Live PRD newer than failed copy → `isAlreadyProcessed` returns `false`
2. Live PRD older than failed copy → returns `true`
3. Only failed copy exists, no live → returns `true`
4. Only completed copy exists → returns `true` regardless
5. Live PRD newer than parked copy → returns `false`

---

## Verification Criteria

### V1: Code Changes Applied

| Check | Command | Expected |
|-------|---------|----------|
| `statSync` imported | `grep "statSync" daemon/src/daemon.ts` | Import line present |
| `isAlreadyProcessed` updated | `grep -A 20 "function isAlreadyProcessed" daemon/src/daemon.ts` | Contains `statSync`, `mtimeMs`, `liveMtime <= archiveMtime` |
| Skip log strengthened | `grep "already processed (completed/failed/parked)" daemon/src/daemon.ts` | Log message present |
| Intake log added | `grep "recreating.*which has a copy in failed/" daemon/src/health.ts` | Log message present |

### V2: Type Check Passes

```bash
cd daemon && npx tsc --noEmit
# Exit code: 0
```

### V3: Vitest Tests Pass

```bash
cd daemon && npx vitest run tests/watcher-skip.test.ts
# Exit code: 0, all tests pass
```

### V4: No New Dependencies

```bash
cd daemon && cat package.json | jq '.dependencies, .devDependencies'
# No new entries added for this fix
```

### V5: Structural Scan

| Check | Command | Expected |
|-------|---------|----------|
| No TODOs | `grep -riE 'TODO|FIXME|HACK|XXX' daemon/src/daemon.ts daemon/src/health.ts daemon/tests/watcher-skip.test.ts` | No matches |
| No placeholders | `grep -riE 'placeholder|implement me|fix later' daemon/` | No matches |

---

## Files to Create or Modify

### Modified Files

| File | Change |
|------|--------|
| `daemon/src/daemon.ts` | Add `statSync` import; replace `isAlreadyProcessed()` body; strengthen skip log |
| `daemon/src/health.ts` | Add intake recreation warning logs before `INTAKE: Created PRD` |

### Created Files

| File | Purpose |
|------|---------|
| `daemon/tests/watcher-skip.test.ts` | Vitest tests for `isAlreadyProcessed()` mtime logic |
| `deliverables/daemon-fix-watcher-skip-loop/spec.md` | This spec document |
| `deliverables/daemon-fix-watcher-skip-loop/todo.md` | Running task list |
| `deliverables/daemon-fix-watcher-skip-loop/tests/*.sh` | Build verification scripts |

---

## Out of Scope

- Changing intake's recreation logic
- Renaming `failed/` or `parked/` directories
- Cleanup of historical failed PRDs
- The orthogonal Kimi build-phase issue
- SQLite migration (v2 conversation)
- Retro document creation

---

## Acceptance Criteria (from PRD)

1. [ ] `daemon/src/daemon.ts` `isAlreadyProcessed` updated with mtime check. `statSync` imported.
2. [ ] `daemon/src/health.ts` intake logs warn on recreation over archived copy.
3. [ ] New vitest file passes: `cd daemon && npx vitest run tests/watcher-skip.test.ts`
4. [ ] `npx tsc --noEmit` exits 0 from `daemon/`
5. [ ] Manual smoke test (cut per decisions.md #6 — replaced by automated tests)
6. [ ] Backwards compat: PRD with no live copy and only archive copy still logs `Skipping — already processed`
7. [ ] No new dependencies in `daemon/package.json`
