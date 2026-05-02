# To-Do List — Daemon Fix: Watcher Skip-Loop

**Slug:** `daemon-fix-watcher-skip-loop`
**Created:** 2026-05-02

---

## Tasks

### 1. Read Source Files

- [ ] Read `daemon/src/daemon.ts` to understand current `isAlreadyProcessed()` implementation — verify: file contents displayed, current lines 102–107 identified
- [ ] Read `daemon/src/health.ts` to locate intake PRD creation log — verify: line number of `INTAKE: Created PRD` log identified
- [ ] Check existing `fs` imports in `daemon.ts` — verify: confirm whether `existsSync` is already imported, note import line number

### 2. Modify `daemon/src/daemon.ts`

- [ ] Add `statSync` to the `fs` import statement — verify: `grep "import.*statSync.*from.*fs" daemon/src/daemon.ts` returns match
- [ ] Replace `isAlreadyProcessed()` function body with mtime-aware logic — verify: function contains `statSync`, `mtimeMs`, and `liveMtime <= archiveMtime` comparison
- [ ] Update skip log message to include `(completed/failed/parked)` reason — verify: `grep "already processed (completed/failed/parked)" daemon/src/daemon.ts` returns match
- [ ] Scan for TODOs/placeholders in modified file — verify: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder' daemon/src/daemon.ts` returns no matches

### 3. Modify `daemon/src/health.ts`

- [ ] Locate the `INTAKE: Created PRD` log line — verify: line number confirmed
- [ ] Add `failedPath` and `parkedPath` variable declarations before the log — verify: both `resolve(PRDS_DIR, "failed", filename)` and `resolve(PRDS_DIR, "parked", filename)` present
- [ ] Add conditional log for failed copy recreation — verify: `grep "recreating.*copy in failed/" daemon/src/health.ts` returns match
- [ ] Add conditional log for parked copy recreation — verify: `grep "recreating.*copy in parked/" daemon/src/health.ts` returns match
- [ ] Scan for TODOs/placeholders in modified file — verify: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder' daemon/src/health.ts` returns no matches

### 4. Create Test File

- [ ] Create `daemon/tests/watcher-skip.test.ts` — verify: file exists at exact path
- [ ] Write test: live PRD newer than failed copy → returns `false` — verify: test case present with descriptive name
- [ ] Write test: live PRD older than failed copy → returns `true` — verify: test case present with descriptive name
- [ ] Write test: only failed copy exists (no live) → returns `true` — verify: test case present with descriptive name
- [ ] Write test: only completed copy exists → returns `true` — verify: test case present with descriptive name
- [ ] Write test: live PRD newer than parked copy → returns `false` — verify: test case present with descriptive name
- [ ] Verify test file uses temp directory pattern (no hardcoded paths) — verify: test uses `tmp` or temp dir, mocks `PRDS_DIR`
- [ ] Scan test file for TODOs/skipped tests — verify: `grep -riE 'TODO|skip|todo\(' daemon/tests/watcher-skip.test.ts` returns no matches

### 5. Run Type Check

- [ ] Run `cd daemon && npx tsc --noEmit` — verify: exit code 0, no type errors
- [ ] If type errors exist, fix them — verify: re-run passes with exit code 0

### 6. Run Tests

- [ ] Run `cd daemon && npx vitest run tests/watcher-skip.test.ts` — verify: exit code 0, all tests pass
- [ ] If tests fail, debug and fix — verify: re-run passes with exit code 0

### 7. Dependency Check

- [ ] Verify no new dependencies added — verify: `cd daemon && cat package.json | jq '.dependencies'` shows no new entries compared to original
- [ ] Verify no new devDependencies added — verify: `cat package.json | jq '.devDependencies'` unchanged

### 8. Final Verification

- [ ] Run all verification shell scripts in `deliverables/daemon-fix-watcher-skip-loop/tests/` — verify: each script exits 0
- [ ] Confirm all acceptance criteria from spec.md are met — verify: checklist in spec.md fully checked

---

## Summary

| Status | Count |
|--------|-------|
| Total Tasks | 24 |
| Estimated Time | ~60 minutes (all tasks <5 min each) |
