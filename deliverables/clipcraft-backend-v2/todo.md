# To-Do — ClipCraft Backend v2

## Phase A — Project Skeleton & Tooling

- [ ] Create `package.json` with dev/deploy/typecheck/test scripts and `@cloudflare/workers-types` + `wrangler` deps — verify: `cat package.json | grep -q '"typecheck"'` and `grep -iqv "bull\|ioredis\|redis\|aws-sdk" package.json`
- [ ] Create `tsconfig.json` with Workers target and `@cloudflare/workers-types` in `compilerOptions.types` — verify: `grep -q '@cloudflare/workers-types' tsconfig.json`
- [ ] Create `wrangler.toml` with name, main, compatibility_date — verify: `grep -q 'name = ' wrangler.toml`
- [ ] Add R2 bucket bindings `RENDER_OUTPUT` and `RENDER_CACHE` to `wrangler.toml` — verify: `grep -c 'RENDER_OUTPUT' wrangler.toml` returns ≥1
- [ ] Add Queue producer + consumer binding `RENDER_QUEUE` to `wrangler.toml` — verify: `grep -q 'RENDER_QUEUE' wrangler.toml`
- [ ] Add D1 database binding `RENDER_DB` to `wrangler.toml` — verify: `grep -q 'RENDER_DB' wrangler.toml`
- [ ] Create `migrations/001_render_jobs.sql` with `render_jobs` table schema — verify: `grep -q 'CREATE TABLE render_jobs' migrations/001_render_jobs.sql`
- [ ] Create `README-INFRA.md` with exact `wrangler queues create`, `wrangler r2 bucket create` (×2), `wrangler d1 create`, and `wrangler secret put` commands — verify: `grep -c 'wrangler ' README-INFRA.md` returns ≥5

## Phase B — Core API & Routing

- [ ] Create `src/index.ts` exporting default `fetch` handler with route dispatch — verify: `grep -q 'POST /api/render' src/index.ts` and `grep -q 'GET /health' src/index.ts`
- [ ] Implement `POST /api/render` route: parse JSON body, validate URL, generate `jobId`, insert into D1, enqueue to queue, return `{ jobId }` — verify: `grep -q 'jobId' src/index.ts`
- [ ] Implement `GET /api/render/:jobId` route: query D1, return job status + `output_url` — verify: `grep -q ':jobId' src/index.ts`
- [ ] Implement `GET /health` route returning `{ ok: true }` — verify: `grep -q 'ok: true' src/index.ts`

## Phase C — Queue Producer & Consumer

- [ ] Create `src/queue-producer.ts` with typed `enqueueRenderJob(job)` function using `env.RENDER_QUEUE` — verify: `grep -q 'RENDER_QUEUE' src/queue-producer.ts`
- [ ] Create `src/queue-consumer.ts` exporting default queue handler: parse message, call `renderPipeline`, update D1 on success/failure — verify: `grep -q 'renderPipeline' src/queue-consumer.ts`
- [ ] Add error handling in consumer: catch exceptions, write `status = failed` + error to D1 — verify: `grep -q 'failed' src/queue-consumer.ts`

## Phase D — Render Pipeline

- [ ] Create `src/render.ts` with `renderPipeline(job)` orchestrator and explicit step types — verify: `grep -q 'renderPipeline' src/render.ts`
- [ ] Add `fetchUrl(url)` step in `render.ts` — verify: `grep -q 'fetch(' src/render.ts`
- [ ] Add `extractArticle(html)` step wired to `src/extract.ts` — verify: `grep -q 'extract' src/render.ts`
- [ ] Add `generateOutline(content)` step wired to `src/outline.ts` — verify: `grep -q 'outline' src/render.ts`
- [ ] Add `generateTTS(script)` step wired to `src/tts.ts` — verify: `grep -q 'tts' src/render.ts`
- [ ] Add placeholder mux step: combine audio bytes with placeholder video, return MP4 bytes — verify: `grep -q 'placeholder' src/render.ts`
- [ ] Add `uploadToR2(jobId, bytes)` step wired to `src/r2.ts` — verify: `grep -q 'r2' src/render.ts`

## Phase E — Sub-system Modules

- [ ] Create `src/extract.ts` with `extractArticle(html)` function — verify: `grep -q 'extractArticle' src/extract.ts`
- [ ] Add minimal Readability logic or `@mozilla/readability` import in `extract.ts` — verify: `grep -iq 'readability' src/extract.ts`
- [ ] Create `src/outline.ts` with `generateOutline(content)` calling OpenAI chat completions via `fetch` — verify: `grep -q 'api.openai.com/v1/chat/completions' src/outline.ts`
- [ ] Create `src/tts.ts` with `generateTTS(script)` calling OpenAI TTS via `fetch` — verify: `grep -q 'api.openai.com/v1/audio/speech' src/tts.ts`
- [ ] Create `src/r2.ts` with typed `putObject(key, bytes)` and `getObject(key)` using R2 bindings — verify: `grep -q 'put' src/r2.ts` and `grep -q 'get' src/r2.ts`
- [ ] Add `cache-control` header and idempotency key logic in `src/r2.ts` — verify: `grep -q 'cache-control' src/r2.ts`
- [ ] Create `src/db.ts` with D1 helpers: `insertJob`, `getJob`, `updateJobStatus` — verify: `grep -q 'insertJob' src/db.ts` and `grep -q 'getJob' src/db.ts` and `grep -q 'updateJobStatus' src/db.ts`

## Phase F — Tests

- [ ] Create `tests/fixtures/article-1.html` with realistic article markup — verify: `test -f tests/fixtures/article-1.html`
- [ ] Create `tests/fixtures/article-2.html` with realistic article markup — verify: `test -f tests/fixtures/article-2.html`
- [ ] Create `tests/fixtures/article-3.html` with realistic article markup — verify: `test -f tests/fixtures/article-3.html`
- [ ] Create `tests/render.test.ts` with unit tests for `render.ts` pure functions using mocked `fetch` — verify: `grep -q 'test(' tests/render.test.ts` or `grep -q 'it(' tests/render.test.ts`
- [ ] Create `tests/extract.test.ts` asserting sane extraction output on all 3 fixtures — verify: `grep -q 'article-1.html' tests/extract.test.ts`
- [ ] Add test runner config (Vitest or Miniflare) so `npm test` executes — verify: `npm test -- --run` exits 0 (may require Miniflare env setup)

## Phase G — Frontend Wiring

- [ ] Update `PasteForm.tsx` to `POST /api/render` and store returned `jobId` in state — verify: `grep -q "/api/render" deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/PasteForm.tsx`
- [ ] Update `RenderStatus.tsx` to poll `GET /api/render/:jobId` every 2 seconds — verify: `grep -q "/api/render/" deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/RenderStatus.tsx`
- [ ] Update `RenderStatus.tsx` to render `<video src={output_url} controls />` when `status === "ready"` — verify: `grep -q '<video' deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/components/RenderStatus.tsx`

## Phase H — Build Gate & QA

- [ ] Run `npm install` inside `deliverables/clipcraft-backend-v2/` — verify: `node_modules/.bin/wrangler` exists
- [ ] Run `npm run typecheck` (tsc --noEmit) — verify: exits 0
- [ ] Run `tests/test-manifest.sh` — verify: exits 0
- [ ] Run `tests/test-banned.sh` — verify: exits 0
- [ ] Run `tests/test-wrangler.sh` — verify: exits 0
- [ ] Run `tests/test-types.sh` — verify: exits 0
- [ ] Run `wrangler dev` and hit `/health` — verify: returns `{"ok":true}`
