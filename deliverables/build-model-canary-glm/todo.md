# Task Checklist — Build Model Canary (GLM)

**Project:** `build-model-canary-glm`
**Status:** Ready to Execute
**Goal:** Verify qwen3.5:cloud model can produce working TypeScript code

---

## Implementation Tasks

### Foundation
- [ ] Create project directory structure under `deliverables/build-model-canary-glm/` — verify: directory exists with correct path
- [ ] Create `tests/` subdirectory — verify: `tests/` directory exists

### Core Implementation
- [ ] Implement `slugify.ts` with string normalization logic — verify: file exists, exports slugify function
- [ ] Implement `truncate.ts` with word-boundary truncation — verify: file exists, exports truncate function
- [ ] Implement `index.ts` to re-export both functions — verify: file exists, exports { slugify, truncate }

### Test Implementation
- [ ] Create `tests/test-slugify.ts` with native node --test assertions — verify: file exists, has test cases for slugify
- [ ] Create `tests/test-truncate.ts` with native node --test assertions — verify: file exists, has test cases for truncate

### Verification & Quality
- [ ] Validate TypeScript compilation for all .ts files — verify: `tsc --noEmit slugify.ts truncate.ts index.ts` exits 0
- [ ] Execute full test suite with node --test — verify: `node --test --import tsx tests/*.ts` exits 0 with green output
- [ ] Audit for hollow files and incomplete markers — verify: no temporary comments, no empty functions, all files have substance
- [ ] Confirm file count matches PRD requirement (7 files total) — verify: `ls -1 | wc -l` returns 7
- [ ] Test alternate execution via compiled .js if tsx unavailable — verify: tests pass after `tsc` compilation

### Functional Tests
- [ ] Test slugify with "Hello World" → "hello-world" — verify: assertion passes
- [ ] Test slugify with "Foo  Bar!!!" → "foo-bar" — verify: assertion passes
- [ ] Test slugify with "  trim me  " → "trim-me" — verify: assertion passes
- [ ] Test truncate with "hello world", max 5 → "hello…" — verify: assertion passes
- [ ] Test truncate at word boundary — verify: assertion passes for long input

### Final Acceptance
- [ ] Confirm zero external dependencies — verify: no package.json, no node_modules required
- [ ] Confirm no build tools or bundlers — verify: works with native Node.js only
- [ ] Final acceptance test run — verify: complete test suite passes clean

---

## Completion Criteria

✅ **Ready for Acceptance When:**
- All 7 files exist with real implementation
- TypeScript compilation succeeds for all files
- `node --test` execution shows green passing output
- No hollow files, incomplete markers, or temporary comments
- All functional test cases pass as specified in spec.md
- Zero external dependencies (native Node.js only)

---

## Notes

- **Time Budget:** < 10 minutes total (per debate decisions)
- **Scope Lock:** Exactly 7 files, no additions
- **Quality Bar:** Every character earns its place
- **Test Method:** Native `node --test` only
- **Success Metric:** Clean green test output