# Round 1 Review: ClipCraft

## Architecture — What's the simplest system that could work?

The PRD says "WordPress plugin" and "60 seconds" in the same breath. This is delusional.

Simplest viable system:
1. Web form (not WordPress plugin) — paste blog URL or text
2. LLM extracts 3-5 key points (~5s, ~$0.001)
3. TTS generates audio (~10s)
4. Remotion renders 1080p vertical video with ONE basic template (~30-90s on a 4-core server)
5. S3 upload → download link

That's it. WordPress plugin adds PHP dependency hell, hosting variance, and security surface area for zero user benefit. Build the web service first. Plugin is v3, maybe.

The "60 seconds" claim is hand-waving. Remotion + headless Chrome alone takes 30-90s to render a 60s video on a $40/month server. Add queue overhead, cold starts, and TTS latency. Realistic first-pass time: 2-4 minutes. Claiming 60s is lying to users.

## Performance — Where are the bottlenecks? What's the 10x path?

**Bottleneck #1: Rendering.** Headless Chrome is single-threaded per instance. One video = one CPU core pinned for 30-90s. At 10 concurrent users, you need 10 cores. At 100x, you need 100 cores or a queue that backs up for hours.

**Bottleneck #2: Cost per video.** Remotion render + TTS + LLM + S3 egress = $0.10-0.50/video at scale. If you charge $0, you bleed money. If you charge $5, users expect Hollywood.

**10x path:** Don't render in real-time. Batch-render overnight. Or: pre-render template segments, composite with ffmpeg instead of headless Chrome. Or: abandon Remotion entirely, use ffmpeg + Canvas/Node.js overlays. 10x cheaper, 10x faster.

## Distribution — How does this reach 10,000 users without paid ads?

It doesn't. "WordPress ecosystem" and "content marketing communities" are not distribution strategies. They're hopes.

WordPress plugin directory: 60,000+ plugins. Organic discovery is ~5-50 downloads/week without an existing audience or SEO dominance. "Content marketing communities" = posting in Slack channels and getting banned for self-promotion.

Real distribution:
- Build in public on X/Twitter with demo videos (meta, but works)
- Partner with 2-3 WordPress newsletter authors for sponsored mentions
- Product Hunt launch (one-time spike, not sustained)
- Affiliate program for course creators

Without $5-10K in paid spend or an existing audience, 10K users in year one is fantasy.

## What to CUT

V1 scope is bloated with v2 fantasies:

**CUT immediately:**
- WordPress plugin → web app first
- "Smart content extraction" → manual text input or simple LLM summary
- Multiple export formats (YouTube, TikTok, LinkedIn) → single MP4 download
- "Voice options" → one default TTS voice (ElevenLabs or OpenAI)
- "Apple keynote templates" → 2 basic templates, not 10
- One-click social publishing → download link only

**V1 should be:** paste text → pick template → wait 2 min → download MP4. Nothing else.

## Technical Feasibility — Can one agent session build this?

No. This PRD describes a 3-4 week project for a senior full-stack engineer:

- Remotion pipeline setup + template design: 3-5 days
- TTS integration + audio sync: 2-3 days
- "Smart extraction" (LLM prompt engineering): 1-2 days
- Web app (Next.js or similar): 3-4 days
- WordPress plugin (PHP, WP REST API, block editor): 4-6 days
- Export integrations (YouTube API, TikTok API): 3-5 days each
- Queue system for rendering: 2-3 days
- Auth, billing, storage: 3-5 days

One agent session = maybe the web form + one Remotion template + TTS. Everything else is v2.

## Scaling — What breaks at 100x usage?

Everything.

- **Rendering queue:** Without a job queue (Bull, SQS), concurrent requests crash the server. With a queue, wait times go to 30+ minutes.
- **Memory:** Each Remotion instance needs 500MB-1GB RAM. 100 concurrent renders = 100GB RAM. You can't vertical-scale out of this.
- **API rate limits:** ElevenLabs TTS has rate limits. OpenAI TTS has rate limits. You'll hit them.
- **Storage:** 1000 users × 10 videos × 50MB = 500GB/month. S3 egress adds up.
- **Cold starts:** If you use serverless (Lambda, etc.), Remotion doesn't work well. You need persistent compute.

**What survives:** The web form. Everything else needs re-architecture.

## Verdict

The core idea — text-to-video for content marketers — is viable. But this PRD is 80% fantasy. Cut scope by 70%, drop the WordPress plugin delusion, be honest about render times, and build the web service first. Then we'll talk.
