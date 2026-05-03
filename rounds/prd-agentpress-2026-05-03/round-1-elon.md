# Round 1 — Elon (Chief Product & Growth Officer)

## Architecture
Two API hops for every task is wasteful. Claude routes, then Claude (or Cloudflare) executes. That's 1.5–3.5 seconds of serial latency before the user sees anything. The simplest system that works: a single request to the execution layer with intent passed directly. If you insist on a router, make it a lightweight PHP switch on keywords, not a paid LLM call. CPT registry is also overkill—register capabilities via a PHP action hook and store the manifest in a single serialized option. Zero database writes on every request.

## Performance
The bottleneck isn't WordPress. It's the two sequential network calls to third-party APIs. Average end-to-end latency will be 4–8 seconds, not the <4s target. The 10x path: eliminate the router LLM entirely for the three built-in agents. Map keywords locally ("write" → content_writer, "image" → image_generator). Reserve Claude routing only for ambiguous or third-party tasks. That cuts latency by 40–60% and saves ~$0.003 per request.

## Distribution
WordPress.org organic traffic is real—roughly 500–2,000 installs in month one for a well-tagged plugin with a clear screenshot. But "orchestration hub" is enterprise software speak. Site owners install plugins that solve immediate pain: "write my blog post" or "make my featured image." Lead with the agents, not the hub. The developer API is a v2 distribution multiplier, not a v1 hook. To hit 10,000 users without ads, you need one killer agent that is faster and cheaper than Jasper/Copy.ai. ContentWriter is that wedge.

## What to CUT
1. **SEOMeta agent.** Commodity. Yoast and RankMath already do this. Defer to v2 or kill entirely.
2. **Manual task runner textarea on admin settings page.** Scope creep disguised as dogfooding. Test via cURL or Postman; don't build a UI for it.
3. **"Encrypted" API key storage.** `wp_hash` + `base64_encode` is security theater. Use `wp-config.php` constants or standard options. If the server is compromised, that pseudo-encryption breaks in 30 seconds.
4. **Capability registry via CPT.** Adds DB bloat and query overhead. Use a PHP global/filter; you don't need versioned persistence for v1.

## Technical Feasibility
One session is achievable only if the admin UI is stripped to a single settings page with raw `<table class="form-table">` and no tabs. The build plan's 3h45m estimate is aggressive but not impossible if you skip the manual runner UI and the CPT registry layer. The real risk is JSON parsing from Claude—expect edge cases (markdown fences, truncated responses, hallucinated slugs). Budget 30 minutes for parser hardening or the whole pipeline collapses.

## Scaling
At 100x usage, three things break immediately:
1. **Synchronous REST with 30s timeout.** PHP-FPM workers will exhaust under concurrent load. You need an async queue (WP Cron or Action Scheduler) for any non-trivial throughput.
2. **CPT log auto-prune at 500.** Writing a post + meta on every task is the heaviest possible logging strategy. Switch to a flat file or lightweight custom table before you hit 1,000 tasks/day.
3. **Shared Claude API key per site.** One busy site hits rate limits and degrades everyone else. Per-site BYOK is the only sane model for scaling.

**Bottom line:** Ship the ContentWriter and ImageGenerator as fast, dead-simple agents. Strip the router if possible. Everything else is paint.
