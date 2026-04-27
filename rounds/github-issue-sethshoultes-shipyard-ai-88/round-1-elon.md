# Round 1 — Elon (CPO & Growth)

## Architecture

**Strip it to bones.** This is a WordPress plugin with three moving parts: (1) Gutenberg block for file pick + transcript display, (2) PHP endpoint that proxies audio to Whisper, (3) JSON blob stored as post meta. That’s it.

Don’t build a Cloudflare Worker. That’s a fourth moving part for no reason. Call OpenAI Whisper API directly from PHP. One API key per site, stored in `wp_options`. Complexity kills velocity.

## Performance

**Bottleneck #1:** Shared hosting PHP timeouts. Upload a 50MB podcast on Bluehost and you hit `max_execution_time` in 30 seconds. **Fix:** Async processing via WP Cron + chunked upload, or offload to client-side presigned URL flow.

**Bottleneck #2:** Synchronous API waits. User stares at spinner for 60s while Whisper chews on a 30-min interview. **Fix:** Queue it. Return a job ID. Poll or webhook when done.

**10x path:** WordPress admins won’t wait. Make it async or this dies in reviews.

## Distribution — 10K Users, Zero Ad Spend

WordPress.org is a graveyard of plugins with zero installs. Posting it gets you nothing.

**Actual path:**
- **Content arbitrage:** Publish 50 blog posts targeting "[podcast name] transcript" SEO. Transcribe popular episodes yourself, rank, capture podcaster emails.
- **Integration hijack:** Partner with 3 podcast hosting tools (Buzzsprout, Transistor, Anchor). Be the "one-click WordPress embed."
- **Freemium leverage:** Free for files <10 min. Watermark removed at $29/mo. Podcasters pay for tools that save time.

10K is achievable if you nail podcaster Twitter/X and get 2-3 micro-influencers. WordPress plugin repo alone gets you 200.

## What to CUT (Scope Creep Surgery)

- **Speaker detection / diarization:** Whisper doesn’t do this. You’d need pyannote or AssemblyAI. That’s a separate product. **Cut.**
- **Cloudflare Worker:** Infrastructure theater. Adds deploy complexity, auth, caching debates. Call Whisper from PHP. **Cut.**
- **Word-level click-to-play:** Requires `timestamp_granularities=word` and precise HTML5 MediaElement sync. Cool demo, brittle in the wild. Ship sentence-level first. **Defer.**
- **VTT/SRT export:** Keep. It’s 20 lines of string formatting once you have timestamps.

## Technical Feasibility (One Agent Session?)

**Yes, but only if you cut the above.** One session can build:
- Plugin scaffold + block.json
- Media upload → PHP proxy → Whisper API
- Basic timestamped transcript render in Gutenberg
- JSON save/load as post meta

**Not in one session:** Async job queue, virtualized scrolling for 2-hour transcripts, speaker diarization, CDN upload resumability.

## Scaling — What Breaks at 100x

- **Cost:** OpenAI Whisper is $0.006/minute. 100 users transcribing 10 hrs/week = $360/week in API spend. If free tier is unlimited, you’re bankrupt. **Cap free tier at 60 min/month.**
- **Storage:** 10K sites × 100 transcripts × 500KB JSON = 500GB of post_meta bloat. WordPress databases will cry. **Add cleanup/pruning logic.**
- **Rate limits:** 100x concurrent uploads hits OpenAI RPM limits. You need a queue with backoff. **Plan for it or the plugin 500-errors at scale.**

## Verdict

Build the minimal lovable version: drag audio, async transcribe, sentence-level timestamps, export SRT. Everything else is v2 or never. Ship in one session. Iterate or die.