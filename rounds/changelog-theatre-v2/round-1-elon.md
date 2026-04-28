# Round 1 — Elon (Chief Product & Growth Officer)

## Architecture
The PRD says "using existing Remotion + TTS pipelines (the same stack ClipCraft uses)." First-principles check: ClipCraft shipped exactly **one** source file (`layout.tsx`). There is no pipeline. There is no renderer. There is no TTS integration. Building on an imaginary foundation is not architecture—it's LARPing.

Physics reminder: Remotion requires a real browser (Puppeteer/Chrome) and FFmpeg. Cloudflare Workers are V8 isolates. No Chrome. No FFmpeg. No video rendering. Period. The "Workers-only" constraint with "NO AWS" is a demand to defy thermodynamics.

Simplest system that works: Workers handle API + queue + state. A $5/mo Fly.io machine (or any VPS with Node) polls the queue and renders with Remotion. One non-Worker component. Accept it, or accept that v1 cannot produce an MP4.

## Performance
Bottleneck is not the GitHub API (ms). Not OpenAI TTS (~$0.015/1K chars, <5s). Not GPT-4 narrative (~$0.03, <3s). The bottleneck is video rendering: 30–60s × 30fps = **900–1,800 frames**. Browser capture at ~5 fps = 6–12 minutes of wall time. In a Worker, render time is undefined because the operation is physically impossible.

10x path: Skip MP4 rendering entirely. Generate timed captions + TTS audio as a vertical-scroll HTML5 experience. Embed it in a lightweight player. Zero FFmpeg, zero minutes of render time, works entirely in a Worker. If the product requirement is literally an MP4 file, use Remotion Lambda and accept one AWS call. Pretending otherwise is engineering theater.

Alternative 10x: Pre-render 20 scene templates as MP4s with alpha channels, then stitch them server-side with FFmpeg on a micro-VPS. Dynamic content becomes timed overlays, not full frame renders. Sub-60-second composition.

## Distribution
The PRD contains zero distribution mechanics. A product nobody sees is a hobby.

10,000 users without ads: Auto-generate videos for trending GitHub repos and tweet them from a bot. Watermark every output with "Made by Changelog Theatre." Build a public gallery indexed by repo name (SEO). Build a reply bot: mention the account on a release tweet, get a video reply in 60 seconds. Every output video must be a customer acquisition event. Distribution is not a v2 feature; it is the product.

## What to CUT
- **Hans Zimmer-style score:** Music generation/licensing is a separate company. Cut.
- **Aaron Sorkin's voice:** You cannot clone celebrity voices without legal liability. OpenAI offers alloy, echo, onyx. Use them. Cut the fantasy.
- **D1 database:** Overkill for job state. Write a JSON blob to R2 with the job ID as the key. Cut.
- **Scene composer with animations and "accent":** v1 is three scenes: title card, commit list, outro. Text on a solid background. No motion. Cut.
- **≥10 file mandate:** The PRD demands 10 files for bureaucratic gatekeeping, not because the problem needs 10 files. A tighter v1 is 6 files. Cut file-padding.
- **Remotion integration:** There is no working Remotion pipeline to integrate with. Cut the dependency. Ship static frames + audio first.

## Technical Feasibility
Can one agent session build this? **Only if we drop the Worker-rendering delusion.** The agent can absolutely build: API routes, GitHub fetch, OpenAI narrative, TTS, queue consumer, R2 upload, and job polling. That's 6 files, all trivial. The MP4 renderer is the blocker. Without a real render target, the success criterion "polling eventually returns an `outputUrl` to a valid MP4" is a lie.

Define the interface now: queue message has `jobId`, `repo`, `since`, `until`. Renderer posts back to `POST /api/internal/complete` with `outputUrl`. Decouple them so the renderer can be a VPS today and Lambda tomorrow without touching the API.

## Scaling
At 100x usage, what breaks first: **OpenAI TTS rate limits** (100 RPM standard tier). Second: **cost per video**. TTS + GPT-4 + render ≈ **$0.15–$0.50 per minute**. If this is free, 100 videos/day = $15–$50 in burn. At 100x, you're running a charity, not a business.

Third: **concurrent renders**. Even a VPS chokes at >2 simultaneous Puppeteer instances. Queue depth grows infinitely while users wait.

Fix: Cache TTS by script hash so identical changelogs don't re-generate audio. Cap free renders at 3/day. Price paid tiers at >$1/video or margins are negative. D1 and R2 don't break at 100x; the OpenAI bill and the single render node do.

**Bottom line:** This PRD repeats the same physics denial that killed ClipCraft and the hollow v1 of this exact issue. Ship audio + static slides first. Call it v0.5. Once that works, bolt on the browser renderer as a separate service. Speed of honest iteration beats architectural purity.