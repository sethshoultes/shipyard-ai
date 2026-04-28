# Spec — ClipCraft Backend v2

## 1. Goals

1. **Ship a functional Cloudflare Worker backend** that powers https://reel-ebw.pages.dev by accepting a URL, enqueuing a render job, and returning a video file.
2. **Replace the hollow v1 ship** (1 source file) with ≥ 14 tangible source/config/test files that the build-gate can verify.
3. **Wire the existing frontend** (`PasteForm.tsx`, `RenderStatus.tsx`) to the new backend endpoints (`POST /api/render`, `GET /api/render/:jobId`).
4. **Meet all build-gate success criteria**:
   - Files 1–14 from the PRD exist at the listed paths inside `deliverables/clipcraft-backend-v2/`.
   - `tsc --noEmit` passes from the deliverable root.
   - `wrangler dev` boots without runtime errors.
   - No banned dependencies (`bull`, `ioredis`, `@aws-sdk/*`, `aws-sdk`, `redis`) in `package.json` or source.
   - `wrangler.toml` declares all 4 binding sections (R2, Queues, D1).
5. **Keep secrets out of code** — use `wrangler secret put` only.
6. **Document uncertainty** — any gaps (e.g., Remotion rendering) are captured as TODOs in source and in `README-INFRA.md`.

## 2. Implementation Approach

> **Plan Context:** The file `.planning/phase-1-plan.md` corresponds to Issue #99 (CF Pages auto-deploy workflow) and is unrelated to this backend PRD. The implementation approach below is derived directly from the `clipcraft-backend-v2` PRD.

### Phase A — Project Skeleton & Tooling
- Initialize a TypeScript Cloudflare Worker project inside `deliverables/clipcraft-backend-v2/`.
- Add `package.json` with scripts: `dev`, `deploy`, `typecheck`, `test`.
- Add `tsconfig.json` targeting Workers runtime (`@cloudflare/workers-types`).
- Add `wrangler.toml` with bindings for:
  - R2 buckets: `RENDER_OUTPUT`, `RENDER_CACHE`
  - Queue: `RENDER_QUEUE` (producer + consumer)
  - D1 database: `RENDER_DB`
- Add D1 migration `migrations/001_render_jobs.sql`.
- Add `README-INFRA.md` with exact provisioning commands.

### Phase B — Core API & Routing (`src/index.ts`)
- Export a default Hono-like (or plain `fetch` handler) Worker entry.
- Routes:
  - `POST /api/render` — accept `{ url }`, generate `jobId`, insert into D1, enqueue to `RENDER_QUEUE`, return `{ jobId }`.
  - `GET /api/render/:jobId` — query D1 for status and `output_url`; return JSON.
  - `GET /health` — return `{ ok: true }`.

### Phase C — Queue Producer & Consumer
- `src/queue-producer.ts` — typed helper to send messages to `RENDER_QUEUE`.
- `src/queue-consumer.ts` — Cloudflare Queue consumer entry. On message:
  1. Parse job payload.
  2. Call `renderPipeline(job)`.
  3. On success, write result to R2 (`RENDER_OUTPUT`) and update D1 status = `ready`.
  4. On failure, update D1 status = `failed`, store error message.

### Phase D — Render Pipeline (`src/render.ts`)
- Orchestrate the pipeline as a composition of pure async functions with explicit I/O types:
  1. `fetchUrl(url)` → HTML string.
  2. `extractArticle(html)` → `{ title, content, byline? }`.
  3. `generateOutline(content)` → `{ segments: Array<{ text, duration }> }` via OpenAI chat completions.
  4. `generateTTS(script)` → `ArrayBuffer` (audio bytes) via OpenAI TTS.
  5. `muxAudioAndPlaceholder(audioBytes, outline)` → placeholder MP4 bytes (Remotion is out of scope; return a stub/placeholder and document the gap).
  6. `uploadToR2(jobId, mp4Bytes)` → public URL.

### Phase E — Sub-system Modules
- `src/extract.ts` — port or wrap Mozilla Readability for Worker-compatible HTML extraction.
- `src/outline.ts` — `fetch` wrapper for `https://api.openai.com/v1/chat/completions`. No SDK.
- `src/tts.ts` — `fetch` wrapper for `https://api.openai.com/v1/audio/speech`. Returns `ArrayBuffer`.
- `src/r2.ts` — typed `put`/`get` wrappers around R2 bindings. Sets `cache-control` and uses idempotency keys.
- `src/db.ts` — D1 schema helpers: `insertJob`, `getJob`, `updateJobStatus`. Table: `render_jobs`.

### Phase F — Tests
- `tests/render.test.ts` — unit-test pure render functions with mocked `fetch` and stubbed OpenAI responses.
- `tests/extract.test.ts` — run `extractArticle` against 3 fixture HTML files and assert sane output.

### Phase G — Frontend Wiring (outside deliverable root)
- Modify `deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/PasteForm.tsx`:
  - On submit, `POST` to `/api/render`, store returned `jobId` in component state / localStorage.
- Modify `deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/RenderStatus.tsx`:
  - Poll `GET /api/render/:jobId` every 2 s.
  - When `status === "ready"`, render `<video src={output_url} controls />`.

## 3. Verification Criteria

| ID | Criterion | How to Verify |
|----|-----------|---------------|
| V1 | All core files exist | `ls` each file in the manifest below; fail if any missing |
| V2 | TypeScript compiles | Run `npx tsc --noEmit` from `deliverables/clipcraft-backend-v2/`; must exit 0 |
| V3 | No banned dependencies | `grep -iE "bull|ioredis|@aws-sdk|aws-sdk|redis" package.json src/ tests/` returns nothing |
| V4 | `wrangler.toml` bindings | `grep` confirms `[[r2_buckets]]` (×2), `[[queues.producers]]`, `[[queues.consumers]]`, `[[d1_databases]]` |
| V5 | D1 migration is valid SQL | `sqlite3` or D1 shell can parse `migrations/001_render_jobs.sql` without error |
| V6 | Unit tests pass | `npm test` exits 0 (uses Vitest or Miniflare test runner) |
| V7 | Health endpoint works | `wrangler dev` boots; `curl http://localhost:8787/health` returns `{"ok":true}` |
| V8 | Render endpoint accepts job | `curl -X POST -d '{"url":"https://example.com"}' http://localhost:8787/api/render` returns JSON with `jobId` |
| V9 | Frontend wired correctly | `grep` confirms `PasteForm.tsx` contains `fetch('/api/render')` and `RenderStatus.tsx` contains polling logic |
| V10 | README-INFRA complete | File lists exact `wrangler` provisioning commands for queues, R2, D1, and secrets |

## 4. File Manifest

### New Files (inside `deliverables/clipcraft-backend-v2/`)

| # | Path | Purpose |
|---|------|---------|
| 1 | `src/index.ts` | Worker entry — router for `/api/render` and `/health` |
| 2 | `src/queue-producer.ts` | Enqueue render jobs into `RENDER_QUEUE` |
| 3 | `src/queue-consumer.ts` | Queue consumer — invokes render pipeline, writes result to R2 |
| 4 | `src/render.ts` | Orchestrates fetch → extract → outline → TTS → mux → upload |
| 5 | `src/extract.ts` | HTML article extraction (Readability port/wrapper) |
| 6 | `src/outline.ts` | OpenAI chat completions wrapper for outline + script |
| 7 | `src/tts.ts` | OpenAI TTS API wrapper |
| 8 | `src/r2.ts` | Typed R2 put/get helpers with cache-control + idempotency |
| 9 | `src/db.ts` | D1 `render_jobs` schema + CRUD helpers |
| 10 | `wrangler.toml` | Worker name, bindings, compatibility_date |
| 11 | `migrations/001_render_jobs.sql` | D1 schema: `render_jobs` table |
| 12 | `package.json` | Scripts & dependencies (no banned packages) |
| 13 | `tsconfig.json` | TypeScript config for Workers runtime |
| 14 | `README-INFRA.md` | Exact provisioning steps for Cloudflare resources |
| 15 | `tests/render.test.ts` | Unit tests for pure render pipeline functions |
| 16 | `tests/extract.test.ts` | Extraction sanity tests on 3 HTML fixtures |
| 17 | `tests/fixtures/article-1.html` | Fixture HTML #1 for extract tests |
| 18 | `tests/fixtures/article-2.html` | Fixture HTML #2 for extract tests |
| 19 | `tests/fixtures/article-3.html` | Fixture HTML #3 for extract tests |

### Modified Files (existing frontend — outside deliverable root)

| # | Path | Change |
|---|------|--------|
| 20 | `deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/PasteForm.tsx` | Add `POST /api/render` call, store `jobId` |
| 21 | `deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/RenderStatus.tsx` | Add polling loop for `/api/render/:jobId`, render `<video>` on ready |

## 5. Out of Scope

- Remotion video rendering — return placeholder MP4; document gap in `README-INFRA.md`.
- Public gallery, auth, billing, custom voice cloning.
