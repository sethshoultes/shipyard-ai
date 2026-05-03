# QA Pass 2 — Integration & Cross-File Consistency

**Project:** `build-model-canary-glm`
**QA Director:** Margaret Hamilton
**Date:** 2026-05-03
**Focus:** Integration — do all pieces work together? Cross-file references? Consistency?

---

## Step 1: COMPLETENESS CHECK — Placeholder Content Audit

**Command:** `grep -rn "placeholder|coming soon|TODO|FIXME|lorem ipsum|TBD|WIP" /home/agent/shipyard-ai/deliverables/build-model-canary-glm/`

**Result:** No matches. ✅ No placeholder content found in source files.

**Note:** `todo.md` contains task checklist items with `[ ]` unchecked boxes, which is structural checklist markup, not implementation TODOs.

---

## Step 2: CONTENT QUALITY CHECK — Stub & Implementation Audit

**Rule:** Any file with < 10 lines of actual content is flagged as a probable stub.

| File | Lines | Verdict |
|------|-------|---------|
| `index.ts` | 2 | **STUB — BLOCK** |
| `index.js` | 2 | **STUB — BLOCK** |
| `slugify.ts` | 6 | **STUB — BLOCK** |
| `slugify.js` | 7 | **STUB — BLOCK** |
| `truncate.ts` | 21 | Real implementation |
| `truncate.js` | 17 | Real implementation |
| `spec.md` | 131 | Real documentation |
| `todo.md` | 62 | Real checklist |
| `tests/test-slugify.ts` | 28 | Real tests |
| `tests/test-truncate.ts` | 32 | Real tests |

**Finding:** 4 of 10 core deliverable files are under the 10-line stub threshold.

---

## Step 3: BANNED PATTERNS CHECK

**File checked:** `/home/agent/shipyard-ai/BANNED-PATTERNS.md` — **Does not exist.**

**Result:** No banned patterns file present. Skipped. ✅

---

## Step 4: REQUIREMENTS VERIFICATION

**Requirements source:** `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md` (Relay v1 — SaaS workflow platform)

**CRITICAL FINDING:** The deliverable (`build-model-canary-glm`) is a 7-file diagnostic string utility canary (`slugify` + `truncate`). The requirements describe a full Next.js SaaS web application with DAG execution engine, queue system, caching, budget caps, workflow nodes, and UI. **Zero requirements are satisfied.**

| Req ID | Requirement | Expected Deliverable | Actual Deliverable | Verdict |
|--------|-------------|----------------------|--------------------|---------|
| REQ-001 | SaaS web app — single platform | Next.js App Router project | None | **FAIL — MISSING** |
| REQ-002 | Pre-loaded living workflow on first open | `app/page.tsx` with active workflow | None | **FAIL — MISSING** |
| REQ-003 | Form-based config UI | HTML form components | None | **FAIL — MISSING** |
| REQ-004 | Limited node palette (`content-writer`, `image-generator`, `connection`) | Node type definitions + forms | None | **FAIL — MISSING** |
| REQ-005 | Zero JSON/YAML exposure in-app | Form serialization layer | None | **FAIL — MISSING** |
| REQ-006 | White, airy, optimistic aesthetic | Tailwind light theme config | None | **FAIL — MISSING** |
| REQ-007 | Human brand voice | UI copy strings | None | **FAIL — MISSING** |
| REQ-008 | Defined execution model — DAG | `engine/dag.ts` | None | **FAIL — MISSING** |
| REQ-009 | Durable state + idempotency | `engine/state.ts` | None | **FAIL — MISSING** |
| REQ-010 | Async by default | `engine/queue.ts` | None | **FAIL — MISSING** |
| REQ-011 | Parallel execution | `engine/parallelizer.ts` | None | **FAIL — MISSING** |
| REQ-012 | Aggressive caching | `cache/store.ts` | None | **FAIL — MISSING** |
| REQ-013 | Sub-3-second target | Performance benchmarks | None | **FAIL — MISSING** |
| REQ-014 | Per-user token budgets | `budgets/caps.ts` | None | **FAIL — MISSING** |
| REQ-015 | Request deduplication | `budgets/dedup.ts` | None | **FAIL — MISSING** |
| REQ-016 | Workflow versioning | Version pinning in `engine/state.ts` | None | **FAIL — MISSING** |
| REQ-017 | Content Writer node | Form + execution logic | None | **FAIL — MISSING** |
| REQ-018 | Image Generator node | Form + execution logic | None | **FAIL — MISSING** |
| REQ-019 | Connection node (edge) | Edge data flow logic | None | **FAIL — MISSING** |
| REQ-020 | Living template on mount | `app/page.tsx` with cards + status | None | **FAIL — MISSING** |
| REQ-021 | Real output, not theater | LLM API integration or cache mocks | None | **FAIL — MISSING** |
| REQ-022 | Zero-setup first run | Anonymous execution path + hard cap | None | **FAIL — MISSING** |

---

## Step 5: LIVE TESTING

**Type of deliverable:** Node.js utility module (not a deployable site/plugin). Build/deploy steps skipped per scope.

**Test execution — TypeScript path (mandated by spec):**
```bash
node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts
```
**Result:** ❌ **BLOCK — tsx package not found.** `ERR_MODULE_NOT_FOUND` for `tsx`.

**Test execution — Compiled JS fallback:**
```bash
node --test tests/js/tests/test-slugify.js tests/js/tests/test-truncate.js
```
**Result:** ❌ **2 of 13 tests FAILED.**

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| `truncate("hello world", 5)` | `"hello…"` | `"hell…"` | **FAIL** |
| `truncate("supercalifragilistic", 8)` | `"supercal…"` | `"superca…"` | **FAIL** |

**Root cause:** `truncate` implementation uses `truncated.slice(0, -1) + '…'` when no space is found within the sliced substring. This unconditionally removes the last character even when the slice already lands at or before the desired boundary, producing outputs one character shorter than test expectations.

**TypeScript compilation:**
```bash
tsc --noEmit slugify.ts truncate.ts index.ts
```
**Result:** ✅ Exits 0. No type errors.

---

## Step 6: GIT STATUS CHECK

**Command:** `git status --short deliverables/build-model-canary-glm/`

**Result:** Empty output. ✅ No uncommitted modifications in the deliverables directory.

*(Note: Untracked files exist outside deliverables in `.agent-logs/` and `rounds/`, but they do not affect the deliverable tree.)*

---

## Additional Integration Findings

### Cross-file Consistency Bug (P2)
`truncate.ts` and `truncate.js` have divergent boundary-check logic:
- **JS:** `if (lastSpace > 0 && lastSpace < truncated.length)`
- **TS:** `if (lastSpace > 0)`

The extra `lastSpace < truncated.length` guard in the JS version is always true (by construction) and serves no purpose, but the files are not identical parity sources. In a rigorous build, `.ts` and `.js` should be byte-for-byte logic equivalents.

### Scope Breach (P1)
`spec.md` mandates **exactly 7 files**. The deliverables directory contains **16 files**:
- 5 shell scripts (`01-file-existence.sh` … `05-run-all-tests.sh`)
- 3 compiled JS artifacts under `tests/js/`

These extras violate the "Exactly 7 files, no additions" scope lock.

---

## Overall Verdict: 🔴 BLOCK

A single P0 is sufficient to block shipment. This build has **multiple P0 issues.**

---

## Issues Ranked by Severity

### P0 — Ship Blockers (MUST FIX)

1. **Catastrophic Requirements Mismatch**
   The deliverable is a string utility canary (`slugify` + `truncate`). The locked requirements describe a full SaaS workflow platform (Relay v1). Not one of 22 requirements is satisfied. The wrong product was built.

2. **Test Failures in Truncate**
   `truncate('hello world', 5)` and `truncate('supercalifragilistic', 8)` both return strings one character shorter than spec/test expectations. 2 of 13 tests fail in the compiled JS fallback.

3. **tsx Execution Failure**
   The primary test path mandated by `spec.md` (`node --test --import tsx`) fails with `ERR_MODULE_NOT_FOUND`. The build environment does not satisfy the documented execution contract.

4. **Stub Files Below Quality Threshold**
   Four files are under 10 lines and trigger the automatic stub rule:
   - `index.ts` (2 lines)
   - `index.js` (2 lines)
   - `slugify.ts` (6 lines)
   - `slugify.js` (7 lines)

### P1 — Major Defects

5. **Scope Breach — Extra Files**
   `spec.md` locks scope at exactly 7 files. The directory contains 16 files (shell scripts + compiled JS artifacts).

### P2 — Minor Defects

6. **Cross-file Logic Drift**
   `truncate.ts` and `truncate.js` have inconsistent `lastSpace` boundary guards.

---

## Resolution Required

Before this build can pass QA:
- **Deliver the correct product.** The `build-model-canary-glm` canary must be replaced with the full Relay v1 implementation per REQUIREMENTS.md, OR the requirements must be formally rescoped and re-locked for this canary.
- **Fix `truncate` implementation** to return expected outputs for exact-length and mid-word truncation.
- **Ensure `tsx` is available** in the test environment or remove it from the documented execution path.
- **Consolidate to exactly 7 files** per the locked spec, or update the spec to reflect actual file count.
- **Bring stub files above 10 lines** of substantive code or justify their minimal scope in writing.

*QA will not re-review until all P0 items are resolved and re-submitted.*
