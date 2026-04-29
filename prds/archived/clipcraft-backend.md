# PRD — ClipCraft (Reel) Backend Wire-Up

## 1. Project Overview
**Project name:** clipcraft-backend
**Product type:** Plugin (Cloudflare Worker + queue + storage)
**Target URL/domain:** https://reel.shipyard.company (or https://reel-ebw.pages.dev for now)
**Deadline:** Open. Static landing already shipped at reel-ebw.pages.dev — this PRD wires the actual rendering backend.

## 2. Business Context
**What does this business do?** ClipCraft (codename "Reel") turns blog posts into short-form videos via Remotion + AI voiceover. Currently a static landing page only. This PRD makes it functional.

**Primary goal:** A user pastes a blog URL → ClipCraft fetches the article, generates an outline + voiceover script, renders a Remotion video at 1080×1920 (vertical) or 1920×1080 (horizontal), uploads to storage, returns a shareable URL. End-to-end < 90 seconds for a 4-minute post.

**Why now:** Existing static demo at reel-ebw.pages.dev sets the surface. Now the autonomous pipeline can prove the Remotion + TTS stack works in production, the same stack will drive Changelog Theatre (#82), the constellation video work, and the Shonda board's narrative roadmaps.

## 3. Required infrastructure (provisioned outside this PRD)

This PRD assumes the following are available **as Cloudflare-bound bindings or env vars on the Worker**. If any are missing, fail loudly at startup. Do NOT silently fall back.

- **Queue:** Cloudflare Queues binding `RENDER_QUEUE` (consumer-only or producer-only as appropriate)
- **Storage:** R2 bucket binding `RENDER_OUTPUT` for finished videos, `RENDER_CACHE` for intermediate frames
- **AI:** `OPENAI_API_KEY` secret (for outline generation + TTS via OpenAI Audio API)
- **Optional fallback:** `WORKERS_AI_BINDING` for a CF-hosted summarization model if OpenAI quota exhausted
- **Database (cheap):** Cloudflare D1 binding `RENDER_DB` for job state + idempotency keys

The deliverable should include `wrangler.toml` with all bindings declared, plus a `README-INFRA.md` listing the manual provisioning steps (`wrangler queues create render-queue`, `wrangler r2 bucket create render-output`, `wrangler d1 create render-db`, `wrangler secret put OPENAI_API_KEY`).

## 4. Pages / Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | `POST /api/render` | Accepts `{ url, format }` (format: vertical | horizontal). Validates URL. Enqueues render job. Returns `{ jobId, status: "queued" }`. | Must |
| 2 | `GET /api/render/:jobId` | Returns `{ status, progress, outputUrl?, error? }`. Drives the existing RenderStatus.tsx UI. | Must |
| 3 | Queue consumer Worker | Pulls job from `RENDER_QUEUE`. Steps: fetch URL → extract main article (use existing `lib/extract.ts` if present, else add minimal Mozilla Readability port) → outline via OpenAI → voiceover via OpenAI TTS → frames via Remotion CLI in a Sandbox or via `@remotion/lambda`-compatible call → mux to MP4 → upload to R2 → update D1 → notify caller via webhook if provided. | Must |
| 4 | Static landing page (already shipped) | Existing `/apps/web/` Next.js app. Wire `PasteForm.tsx` to `POST /api/render`. Wire `RenderStatus.tsx` to poll `GET /api/render/:jobId`. Render the final video inline when ready. | Must |
| 5 | Idempotency | Same URL within 24h returns the cached output URL, no re-render. Hash on `(url, format)` → D1 `render_jobs.idempotency_key`. | Must |
| 6 | Cost ceiling | Per-job hard cap: 1 OpenAI outline call, 1 TTS call, 1 render. Reject if estimated cost > $0.50 (configurable env). | Should |
| 7 | Public gallery (optional v2) | `/gallery` shows recent public renders. Owner can mark private. R2 metadata includes `public: true|false`. | Nice |

## 5. Architecture / Constraints

- **All compute on Cloudflare** — no Bull, no Redis, no Node-only deps. Use Cloudflare Queues + R2 + D1 + Workers.
- **No persistent in-memory state.** Every Worker invocation is fresh.
- **No Redis dependency** — the existing `package.json` lists `bull` and `ioredis`. Remove them. Replace with the Cloudflare Queues binding.
- **No AWS S3** — replace `@aws-sdk/client-s3` with R2 binding.
- **Remotion rendering** — consider running Remotion in a Cloudflare Sandbox or invoking `@remotion/lambda` if AWS credentials are provisioned. If neither is feasible, document the constraint and fall back to a server-side render on a $5 VPS as documented in the original spec.

## 6. Files to modify
- DELETE: `apps/web/lib/queue.ts` (Bull-based) — replace with Queues helper
- DELETE: `apps/web/lib/s3.ts` — replace with `lib/r2.ts`
- CREATE: `apps/api/render-producer.ts` — POST /api/render handler
- CREATE: `apps/api/render-status.ts` — GET /api/render/:jobId handler
- CREATE: `apps/api/render-consumer.ts` — Queue consumer
- CREATE: `wrangler.toml` at the root with all bindings
- CREATE: `README-INFRA.md` listing manual provisioning steps
- UPDATE: `apps/web/components/PasteForm.tsx` and `RenderStatus.tsx` to call the new API endpoints
- UPDATE: `package.json` — drop bull, ioredis, @aws-sdk/* — add `@cloudflare/workers-types`, `wrangler`

## 7. Success criteria
- `curl -X POST https://reel-ebw.pages.dev/api/render -d '{"url":"https://example.com/post","format":"vertical"}'` returns `{ jobId, status: "queued" }`
- Polling `GET /api/render/:jobId` eventually returns `{ status: "ready", outputUrl: "https://..." }` within 90s for a typical 4-min blog post
- The output URL plays a valid MP4 in browser
- A second identical POST within 24h returns the cached jobId/outputUrl without re-rendering
- No Redis or AWS dependency anywhere in `package.json`
- `wrangler deploy` succeeds with all bindings declared

## 8. Testing
- Unit: render-status handler returns correct status from D1 row
- Integration: end-to-end with a known blog post (e.g. https://www.shipyard.company/blog/...)
- Manual: visit reel-ebw.pages.dev, paste a URL, watch a video render and play

## 9. Deploy
- After build: `wrangler deploy` for API workers, `wrangler pages deploy out --project-name reel` for landing
- Verify production URL returns 200 with live render flow

## 10. Constraints
- NO secrets in code — all via `wrangler secret put`
- Respect BANNED-PATTERNS.md (no `re_`, `cfat_`, `ghp_`, etc.)
- Keep within Cloudflare free-tier limits where possible; document when paid tier is required

## 11. Open questions to resolve in debate
- Vertical vs horizontal default — Sara should weigh in (TikTok/Reels vs LinkedIn/Twitter)
- OpenAI TTS voice presets vs allowing custom voice — Maya should weigh in on brand voice
- Public gallery scope — Shonda should weigh in on retention loop
