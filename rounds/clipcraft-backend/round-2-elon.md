# Round 2 — Elon

## Where Steve's Beauty Blocks Shipping

**"Paste URL. Breathe. Watch."** A 60-second clip takes minutes to render. You cannot "watch" it bloom in real-time unless we fake it with a loading animation, which is theater, not product. The Polaroid fantasy requires either pre-rendering the entire internet or lying to users.

**No retry buttons, no status, no failure surfaces.** When Puppeteer segfaults on frame 1,847 or OpenAI hits a rate limit, pretending everything is fine is not "invisible technology"—it's gaslighting. Users need to know *something* happened and have a path forward. Hiding the queue doesn't delete the failure mode.

**"Pick the format for them and be right."** "Be right" requires ML classification of content to choose vertical vs. horizontal. That's a model, training data, and guesswork for v1. Just pick vertical. Smart automation that adds a dependency is just complexity wearing mascara.

**FLINT before Flint exists.** Renaming the company while the render node won't boot is classic bikeshedding. The name is a variable; the architecture is the constant.

## Why Technical Simplicity Wins

A $5 Hetzner box with a 200-line Node script is **debuggable**. I can SSH in, read logs, and restart it. A "magic" serverless abstraction that fails silently at 3 AM is a black box that kills you. The queue + worker pattern has shipped a billion times. Real-time preview alchemy has not.

Remotion Lambda costs pennies and is boring. Boring is the goal. Every hour spent making rendering "invisible" is an hour not spent making the video actually good.

## Where Steve Is Right

**One format, zero settings.** Vertical only. No toggles. We agree—just don't "intelligently" choose it.

**Brand voice.** "Boom" is cringe in a press release and perfect in a product. Short sentences, confident friend, emotional hook—this is correct. The user should feel creative, not like they scheduled a cron job.

**No exposed internals.** Nobody needs to see `jobId` or queue depth. Abstract the machinery; just don't pretend it isn't there.

## Top 3 Non-Negotiables

1. **Async rendering with honest status.** Users submit, we show progress, we notify on completion. No fake real-time preview in v1.
2. **Render on Node/VPS or Lambda.** No Cloudflare Worker video rendering. Physics wins.
3. **Watermarked output + end-card CTA.** Every video distributes the product. Distribution is not a v2 feature.
