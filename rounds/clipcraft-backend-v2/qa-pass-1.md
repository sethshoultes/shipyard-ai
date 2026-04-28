# QA Pass 1 — `clipcraft-backend-v2`
**QA Director**: Margaret Hamilton
**Date**: 2026-04-28
**Verdict**: **BLOCK**
**Overall Status**: Multiple P0 issues. Build does NOT ship.

---

## 1. COMPLETENESS CHECK

### 1.1 Placeholder Content Scan
```bash
grep -rn "placeholder|coming soon|TODO|FIXME|lorem ipsum|TBD|WIP" /home/agent/shipyard-ai/deliverables/clipcraft-backend-v2/
```

**Results**: Hits limited to planning documents only:
- `spec.md:15` — mentions "TODOs in source and in README-INFRA.md"
- `spec.md:53` — mentions placeholder MP4 bytes (out-of-scope item)
- `spec.md:124` — documents Remotion placeholder gap
- `todo.md:34` — unchecked task for placeholder mux step

**Analysis**: No placeholder strings found in source or test files. However, **this is because there are virtually no source or test files**. The `todo.md` contains **unchecked boxes for every single implementation task**, confirming the deliverable is an empty skeleton.

### 1.2 File Inventory
```bash
find /home/agent/shipyard-ai/deliverables/clipcraft-backend-v2/ -type f | sort
```

**Actual files (8)**:
```
package.json
spec.md
tests/test-banned.sh
tests/test-manifest.sh
tests/test-types.sh
tests/test-wrangler.sh
todo.md
tsconfig.json
```

**Missing files per internal spec.md manifest (14 of 19 core deliverables)**:
- `src/index.ts` ❌
- `src/queue-producer.ts` ❌
- `src/queue-consumer.ts` ❌
- `src/render.ts` ❌
- `src/extract.ts` ❌
- `src/outline.ts` ❌
- `src/tts.ts` ❌
- `src/r2.ts` ❌
- `src/db.ts` ❌
- `wrangler.toml` ❌
- `migrations/001_render_jobs.sql` ❌
- `README-INFRA.md` ❌
- `tests/render.test.ts` ❌
- `tests/extract.test.ts` ❌
- `tests/fixtures/article-1.html` ❌
- `tests/fixtures/article-2.html` ❌
- `tests/fixtures/article-3.html` ❌

**Verdict**: **BLOCK**. A project with zero source files is not a deliverable.

---

## 2. CONTENT QUALITY CHECK

| File | Lines | Assessment |
|------|-------|------------|
| `package.json` | 18 | Valid JSON, minimal but real |
| `tsconfig.json` | 19 | Valid JSON, real config |
| `spec.md` | 126 | Real planning doc |
| `todo.md` | 71 | Real checklist, but **100% unchecked** |
| `tests/*.sh` | 28–57 | Real shell scripts that test for missing files |

**No source code exists to evaluate.** Every function the PRD demands is entirely absent. The existing files are planning artifacts and test harnesses that verify their own failure.

**Verdict**: **BLOCK**. No implementation.

---

## 3. BANNED PATTERNS CHECK

```bash
ls /home/agent/shipyard-ai/BANNED-PATTERNS.md 2>/dev/null || echo "NO BANNED PATTERNS FILE"
```

**Result**: `BANNED-PATTERNS.md` does **not exist** in repository root.
**Verdict**: N/A — no banned-patterns file to enforce.

**Secondary check** (built-in banned patterns from `test-banned.sh`):
```bash
bash tests/test-banned.sh
```
- package.json: clean ✅
- src/ and tests/: clean ✅ (trivial — directories are empty or nonexistent)
- Hardcoded secrets heuristic: clean ✅

---

## 4. REQUIREMENTS VERIFICATION

**CRITICAL FINDING**: The requirements document `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md` describes **CF Pages Auto-Deploy** (GitHub Issue #99). The deliverable directory `clipcraft-backend-v2/` contains a **Cloudflare Worker backend** specification.

These are **completely different projects**.

| Req ID | Requirement (from REQUIREMENTS.md) | Corresponding Deliverable | Status |
|--------|-------------------------------------|---------------------------|--------|
| DEPLOY-001 | Add GitHub Actions workflow `.github/workflows/deploy-website.yml` | **NOT FOUND** — no `.github/` directory exists in deliverables | **FAIL** |
| DEPLOY-002 | Trigger workflow on push to `main` when paths under `website/**` change | **NOT FOUND** — no workflow file | **FAIL** |
| DEPLOY-003 | Build Next.js site and deploy `out/` to CF Pages project `shipyard-ai` | **NOT FOUND** — no Next.js site, no build output | **FAIL** |
| DEPLOY-004 | Use repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` | **NOT FOUND** — no workflow to consume secrets | **FAIL** |

**None of the four stated requirements have a corresponding deliverable.** The entire traceability matrix is broken.

**Internal spec verification** (spec.md self-checks — informative only, not a substitute for REQUIREMENTS.md traceability):

| Criterion | Evidence | Status |
|-----------|----------|--------|
| V1 — All core files exist | 14 of 19 files missing | **FAIL** |
| V2 — TypeScript compiles | `npx tsc --noEmit` fails; no source, no installed deps | **FAIL** |
| V3 — No banned dependencies | Package.json clean; no source to scan | **PASS (trivial)** |
| V4 — wrangler.toml bindings | `wrangler.toml` missing | **FAIL** |
| V5 — D1 migration valid SQL | `migrations/001_render_jobs.sql` missing | **FAIL** |
| V6 — Unit tests pass | No test files exist (only shell harnesses) | **FAIL** |
| V7 — Health endpoint works | No `src/index.ts`, cannot boot | **FAIL** |
| V8 — Render endpoint accepts job | No worker entry | **FAIL** |
| V9 — Frontend wired correctly | PasteForm.tsx and RenderStatus.tsx exist outside deliverable root, but backend they should call does not exist | **FAIL** |
| V10 — README-INFRA complete | File missing | **FAIL** |

---

## 5. LIVE TESTING

### 5.1 Build Test
```bash
bash tests/test-types.sh
```
**Result**: `TYPECHECK TEST FAILED: TypeScript errors detected.`
npx cannot locate `tsc` because `node_modules` is not installed, and there is no TypeScript source to compile even if it were.

### 5.2 Deploy / Runtime Test
```bash
bash tests/test-wrangler.sh
```
**Result**: `WRANGLER TEST FAILED: wrangler.toml does not exist.`
Without `wrangler.toml`, `wrangler dev` cannot boot. Without `src/index.ts`, there is no Worker entry.

**Curl verification**: Impossible. No running service.

### 5.3 Automated Manifest Test
```bash
bash tests/test-manifest.sh
```
**Result**: `MANIFEST TEST FAILED: one or more required files are missing.`
14 required files missing.

**Verdict**: **BLOCK**. Cannot build, cannot deploy, cannot curl.

---

## 6. GIT STATUS CHECK

```bash
git -C /home/agent/shipyard-ai status
```

**Result**:
```
On branch main
Your branch is ahead of 'origin/main' by 1 commit.
  (use "git push" to publish your local commits)

nothing to commit, working tree clean
```

**Verdict**: Working tree is clean. All existing files are committed.
**Note**: Branch is 1 commit ahead of origin; not blocking, but team should push before final release.

---

## 7. ISSUE REGISTER (Ranked by Severity)

### P0 — BLOCK SHIP

| # | Issue | Evidence |
|---|-------|----------|
| P0-1 | **Requirements traceability completely broken** — REQUIREMENTS.md describes a CF Pages auto-deploy workflow; deliverables contain a Cloudflare Worker backend. Zero overlap. | REQUIREMENTS.md lists DEPLOY-001→DEPLOY-004; deliverables have no `.github/workflows/deploy-website.yml`, no `website/`, no CF Pages deployment artifacts. |
| P0-2 | **No source code** — 9 required `src/*.ts` files are entirely absent. | `find` returns no `src/` directory. `test-manifest.sh` reports 9 missing `src/` files. |
| P0-3 | **No Worker configuration** — `wrangler.toml` missing. | `test-wrangler.sh` exits 1: "wrangler.toml does not exist." |
| P0-4 | **No database schema** — D1 migration file missing. | `migrations/001_render_jobs.sql` absent. |
| P0-5 | **No unit tests** — Test files and fixtures missing. | `tests/render.test.ts`, `tests/extract.test.ts`, and all 3 HTML fixtures absent. |
| P0-6 | **TypeScript typecheck fails** — Cannot run `tsc --noEmit`. | `test-types.sh` fails because `node_modules` is missing and no source exists. |
| P0-7 | **Worker cannot boot** — No entry point, no config. | `wrangler dev` impossible. `curl` impossible. |

### P1

| # | Issue | Evidence |
|---|-------|----------|
| P1-1 | **No infrastructure documentation** — `README-INFRA.md` missing. | Required by spec.md manifest and PRD. |
| P1-2 | **Frontend wiring unverified** — `PasteForm.tsx` and `RenderStatus.tsx` exist, but the backend endpoints they target do not exist. | V9 fails because the backend is missing. |

### P2

| # | Issue | Evidence |
|---|-------|----------|
| P2-1 | **Branch ahead of remote** — local `main` is 1 commit ahead of `origin/main`. | `git status` output. Not blocking, but should be pushed for visibility. |

---

## 8. SUMMARY

- **Placeholders in code**: None found (because there is no code).
- **Content quality**: Planning docs are substantive; implementation is completely absent.
- **Banned patterns**: N/A (no banned-patterns file).
- **Requirements coverage**: **0%**. The wrong project is in the deliverables directory, and even that project is an empty shell.
- **Live testing**: **Failed at every step**. Cannot compile, cannot boot, cannot curl.
- **Git status**: Clean.

### Final Verdict: **BLOCK**

This build has **seven P0 issues**. A single P0 is sufficient to block shipment. Under no circumstances does this deliverable ship.

### Required Actions Before Re-QA

1. **Clarify scope**: Determine whether the intended deliverable is the CF Pages auto-deploy workflow (per REQUIREMENTS.md) or the `clipcraft-backend-v2` Cloudflare Worker (per directory name and spec.md). They are mutually exclusive.
2. **If CF Pages workflow is correct**: Create `.github/workflows/deploy-website.yml` with path-filtered triggers, Next.js build, and wrangler Pages deploy using repository secrets.
3. **If `clipcraft-backend-v2` Worker is correct**: Create all 19 files listed in the manifest, install dependencies (`npm install`), ensure `tsc --noEmit` passes, ensure `wrangler dev` boots and responds to `/health`, write real unit tests, and provide `README-INFRA.md`.
4. **Install dependencies** and verify `npm run typecheck` exits 0.
5. **Run `wrangler dev`** and curl all endpoints (`/health`, `/api/render`).
6. **Commit all deliverables** and push to origin before requesting QA Pass 2.

---
*QA Pass 1 completed. Build held at gate.*
