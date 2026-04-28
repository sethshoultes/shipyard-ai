# Round 1 Review: Changelog Theatre

## Architecture
The PRD says "WordPress plugin" + "Remotion." This is nonsensical. Remotion is a Node.js/React rendering engine. WordPress is PHP. You cannot run Remotion inside a WordPress plugin without a separate Node service, which means every user needs their own video infrastructure—or you need a SaaS render farm. The simplest system that could work is **not video at all.** It is animated HTML/CSS changelog pages rendered client-side, optionally screenshotted. If video is mandatory, the architecture is a headless Node API that accepts text and returns an MP4. But that is a separate product, not a WordPress plugin.

## Performance
Bottleneck: video rendering. A 30-second Remotion render takes 30–90 seconds of CPU time. One user generating a changelog blocks a full CPU core. At 10 concurrent users, you need 10 cores. At 100x, you need a render farm or AWS Lambda costs explode. The 10x path is to **eliminate server-side rendering entirely.** Use browser-native animations + Web Speech API. If it must be shareable video, generate a lightweight WebM via Canvas capture in the browser—not on your server.

## Distribution
"WordPress.org plugin directory, Product Hunt, indie hacker communities." This is hope, not a strategy. Product Hunt gives you a one-day traffic spike and zero retention. WordPress plugin developers are famously price-sensitive; the free-to-paid conversion rate on wp.org is ~0.5%. To reach 10,000 users without paid ads, you need organic shareability: the output (the changelog) must be so visually compelling that *end users* share it, creating demand-pull on developers. A 30-second video about a bugfix does not go viral. Cut the ego. Solve distribution first.

## What to CUT
- **Remotion.** Overkill. CSS animations are 100x cheaper and instant.
- **TTS narration.** Nobody asked for a robot to read a changelog. It adds latency, cost, and cringe.
- **Video generation.** This is a v2 feature masquerading as v1. A beautiful, animated, auto-generated HTML changelog page is the real MVP. Video is a power-user export.
- **The WordPress plugin framing.** If the core value is visual changelogs, build a SaaS that works for any platform (npm, GitHub Releases, WordPress). Walled gardens limit TAM.

## Technical Feasibility
**No.** "One session buildable" is delusional. Building a WordPress plugin with admin UI, parser for readme.txt/changelog formats, a Remotion render pipeline, TTS integration, video storage, and delivery is at minimum 3–4 distinct engineering domains. A single agent session could build a polished animated HTML changelog page. That is it. Everything else is a weekend of infrastructure work.

## Scaling
At 100x usage, server-side video rendering breaks economically before it breaks technically. Assume 1 minute of render time per changelog. 1,000 plugins generating monthly changelogs = 1,000 CPU-minutes/month. That is fine. But if usage scales to 10,000 daily renders, you are burning thousands of dollars in compute for a free/cheap plugin. The model is unsustainable unless you charge per render or move rendering to the client. **Client-side generation scales infinitely; server-side generation scales linearly with your AWS bill.**

## Verdict
The insight—making changelogs delightful—is correct. The execution—video, TTS, Remotion, WordPress plugin—is heavy, slow, and expensive. Build a lightweight SaaS that turns changelog text into beautiful, animated HTML pages. Add video export later, if ever.
