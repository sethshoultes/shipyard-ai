# Elon — Round 1 Review: Changelog Theatre

## Architecture
A WordPress plugin running Remotion is architecturally insane. Remotion needs Node.js, React, and FFmpeg. WordPress is PHP on shared hosts with 30-second timeouts and 128 MB memory limits. The simplest system that works: a SaaS web app. Paste changelog text → Remotion Lambda renders → returns an MP4. If WordPress integration is mandatory, make it a 20-line PHP iframe wrapper. Nothing more.

## Performance
The bottleneck is video rendering, not TTS. A 30-second Remotion render on Lambda costs $0.03–0.08 and takes 20–45 seconds. The 10x path is aggressive deduplication—identical changelog hashes skip re-rendering entirely—and pre-rendered motion backgrounds with lightweight text compositing overlaid on top.

## Distribution
WordPress.org and Product Hunt are organic graveyards. "Indie hacker communities" is hand-waving. There are ~50,000 WordPress plugins; maybe 3,000 have actively releasing developers. To reach 10,000 users without paid ads, you need viral mechanics: watermark free videos with your branding, make them one-click shareable on X/Twitter. Target agencies managing 10+ plugins—one signup equals ten videos, not one.

## What to CUT
Cut the WordPress plugin entirely for v1. Cut auto-parsing of readme.txt—there is no standard format, so you will burn 40% of your session on regex hell. Cut "animated release pages"—developers want MP4s for social media, not HTML embeds. Cut multi-language TTS and voice customization. v1: paste text, pick one voice, get a 30-second MP4.

## Technical Feasibility
"One session buildable" is fantasy if you include a WordPress plugin. Remotion + TTS + web UI + deployment is already 6–8 hours of tight work. Adding PHP, WP admin pages, and readme parsing pushes it to 12–15 hours. One agent session? No. Strip the WordPress layer and it is borderline—one long session for a janky but working SaaS MVP.

## Scaling
At 100x usage, the WordPress plugin architecture collapses immediately. Shared hosts lack Node, FFmpeg, and memory. Even serverless scales linearly: 1,000 users × 4 videos/month × $0.05 = $200/month compute, which is fine, but video storage on S3 balloons fast. The real breakage is architectural. Fix that first, or you have no scaling story.
