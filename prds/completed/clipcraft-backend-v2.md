# PRD — ClipCraft Backend v2 (file-explicit re-queue)

## 1. Project Overview
**Project name:** clipcraft-backend-v2
**Product type:** Cloudflare Worker
**Target:** Wire ClipCraft (Reel) backend so https://reel-ebw.pages.dev becomes functional.

## 2. Why this PRD exists
A previous PRD (`clipcraft-backend`, 2026-04-27) "shipped" with only 1 source file. Hollow ship. The build phase produced no functional code. This v2 has explicit file-by-file success criteria the build-gate can verify.

## 3. Files to create — non-negotiable

The deliverable at `deliverables/clipcraft-backend-v2/` MUST contain ALL of the following or the build is incomplete. The build-gate now refuses to ship if fewer than 3 source files exist; this PRD demands at least 8.

### Core API (Cloudflare Workers, TypeScript)
1. `src/index.ts` — Worker entry. Routes: `POST /api/render`, `GET /api/render/:jobId`, `GET /health`.
2. `src/queue-producer.ts` — enqueues render jobs into `RENDER_QUEUE` Cloudflare Queue.
3. `src/queue-consumer.ts` — Worker queue consumer. Pulls job, calls render pipeline, writes result to R2.
4. `src/render.ts` — orchestrates: fetch URL → extract article → outline → TTS → mux. Each step is a pure function with explicit input/output types.
5. `src/extract.ts` — minimal Mozilla Readability port for HTML article extraction (or use `@mozilla/readability` if it bundles cleanly in Workers).
6. `src/outline.ts` — calls OpenAI to produce an outline + voiceover script. Wraps `fetch("https://api.openai.com/v1/chat/completions")` directly (no SDK).
7. `src/tts.ts` — calls OpenAI TTS API (`fetch("https://api.openai.com/v1/audio/speech")`). Returns audio bytes.
8. `src/r2.ts` — typed wrapper for R2 put/get with cache-control + idempotency keys.
9. `src/db.ts` — D1 schema + helpers for `render_jobs` table (jobId, status, idempotency_key, output_url, created_at, finished_at, error).

### Config / infra
10. `wrangler.toml` — declares: name, main, compatibility_date, R2 bindings (`RENDER_OUTPUT`, `RENDER_CACHE`), Queues binding (`RENDER_QUEUE` producer + consumer config), D1 binding (`RENDER_DB`), env vars referencing secrets.
11. `migrations/001_render_jobs.sql` — D1 schema for the jobs table.
12. `package.json` — scripts: `dev`, `deploy`, `typecheck`, `test`. Deps: `@cloudflare/workers-types`, `wrangler`. NO `bull`, NO `ioredis`, NO `@aws-sdk/*`, NO Redis, NO AWS.
13. `tsconfig.json` — Workers target.
14. `README-INFRA.md` — exact provisioning steps: `wrangler queues create render-queue`, `wrangler r2 bucket create render-output`, `wrangler r2 bucket create render-cache`, `wrangler d1 create render-db`, `wrangler secret put OPENAI_API_KEY`, `wrangler secret put GITHUB_TOKEN_POOL` (for any GH-fetch step).

### Tests (these are what the build-gate verifies as "real")
15. `tests/render.test.ts` — unit tests for the pure render functions (mock fetch).
16. `tests/extract.test.ts` — ensures readability output is sane on 3 fixture HTML files.

### Frontend wiring
17. Update `apps/web/components/PasteForm.tsx` to POST to `/api/render` and store the returned `jobId`.
18. Update `apps/web/components/RenderStatus.tsx` to poll `/api/render/:jobId` and render the final `<video>` when status is `ready`.

## 4. Success criteria (the build is incomplete unless ALL pass)
- Files 1–14 exist at the listed paths
- `tsc --noEmit` passes from the deliverable root
- `wrangler dev` boots without runtime errors (manual check)
- `package.json` does NOT contain `bull`, `ioredis`, `@aws-sdk`, `aws-sdk`, `redis`
- `grep -rn "bull\\|ioredis\\|aws-sdk" deliverables/clipcraft-backend-v2/src deliverables/clipcraft-backend-v2/apps 2>/dev/null` returns empty
- `wrangler.toml` has all 4 binding sections (R2, Queues, D1) declared

## 5. Out of scope (do NOT do these in this PRD)
- Remotion video rendering — that's a separate worker/sandbox concern; for this PRD return a placeholder MP4 from R2 and note the gap in README-INFRA.md. The wire-up is the goal here, not the visual quality.
- Public gallery
- Auth / user accounts
- Billing
- Custom voice cloning

## 6. Build instructions for agents
- Read existing files at `deliverables/github-issue-sethshoultes-shipyard-ai-92/reel/apps/web/` for the static frontend that already shipped — extend, don't replace.
- All new code goes in `deliverables/clipcraft-backend-v2/`. Do NOT write files outside that directory.
- If a step is uncertain (e.g. "Remotion in Workers"), document the uncertainty in README-INFRA.md and ship the wire-up anyway with a clearly-marked TODO in the relevant file.
- Do NOT analyze for more than one round. Build the files. The build-gate counts source files; analysis docs don't count.

## 7. Constraints
- NO secrets in code. All via `wrangler secret put`.
- Respect BANNED-PATTERNS.md.
- The build-gate (`pipeline.ts` substance check) demands ≥ 3 source files. This PRD demands ≥ 14. If you can't reach that, fail the build, do NOT ship hollow.
