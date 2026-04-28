# Round 1 — Elon Musk, Chief Product & Growth Officer

## Architecture
The simplest system that works is: upload → store → call Whisper → cache → render. That's 4 steps. The PRD lists 17 files to do this. That's process theater. The actual load-bearing code is ~8 files. Everything else is padding to hit an arbitrary "≥12 files" quota. First principles: if the constraint is artificial, ignore it.

## Performance
**Bottleneck #1:** Synchronous Whisper API calls. A 30-min podcast takes 10-30 seconds. Blocking a REST request that long will timeout on most shared hosts (30s PHP limit). This is the critical path.
**Bottleneck #2:** No caching strategy. Re-loading a page re-transcribes? That burns API credits and destroys load time. Transcripts must be cached in post_meta or transients permanently.
**Bottleneck #3:** Long transcripts in React DOM. A 2-hour interview = 20,000+ words. Rendering that as clickable timestamp spans will crush mobile browsers.

**10x path:** Use WordPress Action Scheduler for async transcription. Return "pending" immediately, poll or webhook to update. Virtualize the transcript list on frontend. Cache forever.

## Distribution
WordPress.org plugin directory is the only channel that matters here. 10K users without ads is absolutely doable if the plugin solves a real pain point. The pitch: "free transcription block for accessibility." But — and this is crucial — users need their own OpenAI API key. That's both a barrier (friction) and a moat (we don't pay their bills). Distribution strategy: target accessibility advocates and podcasters. Write 3 killer blog posts about ADA compliance and audio accessibility. SEO the hell out of "wordpress audio transcription." If the plugin works, word-of-mouth in WP communities drives installs. If it doesn't work flawlessly, 1-star reviews kill it permanently.

## What to CUT
- **Jest tests for Gutenberg blocks.** Testing WP blocks in Jest is a time sink with near-zero value. The integration surface is WordPress itself, not React logic. Cut.
- **PHPUnit with mocked API.** Mocking proves you can mock, not that it works. Cut for v1.
- **Custom webpack config.** `@wordpress/scripts` exists for a reason. Don't override it.
- **`default voice` setting.** Whisper is transcription (speech-to-text). It doesn't have voices. This suggests confusion with TTS. Cut or rename.
- **`README.md` duplication.** WordPress.org requires `readme.txt`. Make `README.md` a symlink or 5-line stub. One source of truth.

## Technical Feasibility
Yes. One agent session can build this. The complexity is 3/10. The risk isn't the code — it's the WordPress block development environment (build tooling, Gutenberg APIs). The actual logic is: receive file, call API, store JSON, render JSON. A junior dev could ship this in a day if they know WP. The constraint of "≥12 files" is cargo-culting structure over function.

## Scaling
At 100x usage, three things break:
1. **OpenAI rate limits.** Whisper has file size limits (25MB) and rate limits. No chunked upload strategy is defined. Users will hit the wall immediately with hour-long audio.
2. **PHP memory/timeouts.** Default WP hosts run 128MB RAM and 30s max_execution_time. Large audio through the media uploader + synchronous API call = death.
3. **Database bloat.** Storing full transcripts as block attributes or post_meta for thousands of posts creates massive table growth. No cleanup or expiration strategy.

**Verdict:** Ship a minimal, async, cached v1. Cut the test suite theater. Fix the "voice" confusion. Validate the 25MB limit is handled gracefully. Everything else is v2.
