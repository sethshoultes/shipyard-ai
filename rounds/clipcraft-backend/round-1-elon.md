# Round 1 — Elon (Chief Product & Growth Officer)

## Architecture
The PRD violates physics. Remotion requires a real browser (Puppeteer/Chrome). Cloudflare Workers run V8 isolates—no Chrome, no Node, no FFmpeg. You cannot render video in a Worker, full stop. The "Cloudflare Sandbox" hand-wave doesn't exist in production.

**Simplest system that works:** Workers for API + queue + state. A single Hetzner CX21 ($5.35/mo) or Fly.io machine running Node consumes queue jobs and renders with Remotion. If you're allergic to VPS maintenance, use Remotion Lambda and accept that one AWS service is cheaper than rewriting physics.

The constraint "all compute on Cloudflare" is architecture theater. Build what works, then optimize hosting costs. A $5 VPS is cheaper than engineering hours spent fighting a Worker runtime.

## Performance
**Bottleneck:** Video rendering is orders of magnitude slower than everything else combined. A 60-second 1080p30 clip is 1,800 frames. Puppeteer at 5 fps = 6 minutes. The 90-second SLA is fantasy for v1 without Lambda or a render farm.

**10x path:** Skip frame-by-frame browser rendering entirely. Generate slides as static images + timed captions, mux with audio via FFmpeg. Sub-60 seconds, trivially parallelizable, no browser overhead. Quality tradeoff is acceptable for short-form. Or just use Remotion Lambda with concurrency—cost per video is cents, time is under 2 minutes.

## Distribution
The PRD has zero distribution mechanics. A great video pipeline that nobody sees is a hobby, not a product.

**10,000 users without ads:** Every output video must have a "Made with ClipCraft" watermark and end-card CTA. Build a public gallery of rendered videos (SEO juice + social proof). Add a "remix this" button so viewers become users. If the video doesn't distribute itself, the product doesn't exist. Distribution is not a feature you bolt on later; it is the product.

## What to CUT
- **Public gallery:** Nice-to-have masquerading as v1. Cut. Watermark is cheaper distribution.
- **Horizontal format:** Pick vertical (TikTok/Reels/Shorts). One less dimension to test.
- **Cost ceiling guardrails:** Over-engineering. Set an OpenAI budget alert. Move on.
- **Workers AI fallback:** YAGNI. OpenAI's uptime is fine; this is premature reliability theater.
- **The 90-second SLA:** Measure actual render times first. Promise what you can hit.
- **Idempotency beyond 24h:** 24 hours is arbitrary. 6 hours is enough to prevent accidental double-clicks.

## Technical Feasibility
**Can one agent session build this?** Only if we drop the "all Cloudflare" religious constraint. With that constraint, no—the agent will burn hours trying to make Chrome run in a Worker and fail. Without it, yes: API + queue + status endpoints are trivial; the renderer is a 200-line Node script polling the queue.

Define the interface between queue and renderer clearly: queue message has `jobId`, `url`, `format`. Renderer posts back to `POST /api/internal/complete`. Decouple the two so the renderer can be rewritten without touching the API.

## Scaling
At 100x usage, what breaks is the **single render node**. One machine rendering serially is a bottleneck. But more insidious: **OpenAI TTS rate limits** (current: 100 RPM for standard tier) and **egress costs** if users download raw MP4s repeatedly.

**Fix:** Render-worker autoscaling (Docker + queue depth metric) and adding a CDN cache layer in front of R2 outputs. D1 handles 100x writes easily; the queue handles backpressure. The renderer is the only real bottleneck. Also: cache TTS output per article hash so you don't regenerate audio for duplicate URLs. Audio generation is slower than video composition.

**Numbers that matter:** A $0.50 cost cap per job sounds safe, but Remotion Lambda alone is $0.10–$0.30 per minute of video. Add OpenAI TTS at $0.015 per 1K chars and a GPT-4 outline call at $0.03, and you're already at $0.15–$0.35 for a 60-second clip. The margin is thin. Price to users must be >$1 per video or this is a charity.

**Bottom line:** Ship the simplest end-to-end flow in one session. If the agent spends more than 20 minutes on Cloudflare Worker rendering constraints, pivot to a VPS immediately. Speed of iteration beats architectural purity.
