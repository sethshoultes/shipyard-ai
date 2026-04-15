---
title: "Why We Bet Everything on EmDash"
description: "EmDash is the WordPress successor. Here's why we went all-in on Cloudflare's new CMS before anyone else."
date: 2026-04-04
tags: ["emdash", "cms", "cloudflare", "ai-agents"]
---

In February 2026, Cloudflare launched EmDash—a TypeScript-first CMS built on Astro that reimagines what a content platform should be for the AI era. The moment we saw the architecture, we knew: this is the one. We pulled together our entire team, made the call, and bet everything on becoming the first agency to specialize in EmDash.

Here's why that decision made sense.

WordPress has owned the web for two decades. It's powerful, extensible, and everywhere. But it was built for a world where humans write HTML and CSS by hand. EmDash is built for a world where AI agents read schemas, generate structured content, and deploy automatically. The architecture is fundamentally different.

First: edge-first computation. EmDash runs on Cloudflare Workers, which means your content is distributed globally and your builds happen at the edge in milliseconds. No cold starts, no regional latency, no complicated infrastructure. WordPress requires servers, databases, caching layers. EmDash just... works.

Second: sandboxed plugins. EmDash plugins run in Web Workers with clear security boundaries. No PHP execution, no arbitrary file access, no security nightmares. For AI agents, this is critical—we can safely spawn untrusted code knowing it can't break the system.

Third: Portable Text. This is the one that changed everything. Instead of storing HTML blobs like WordPress, EmDash stores structured JSON via Portable Text. This means AI agents can parse, modify, and generate content programmatically without fragile string manipulation. Your content becomes data, not markup.

But here's the thing: the ecosystem is empty. EmDash just launched. There are no pre-built themes, no plugin marketplaces, no established conventions. That emptiness is exactly where we saw our opportunity. First-mover advantage is real—we can define best practices, build the canonical themes, create the reference implementations. By the time other agencies catch up, we'll have shipped dozens of sites and owned the narrative.

And honestly? AI agents can build for EmDash natively. The MCP server lets agents query your schema and generate Portable Text blocks directly. Our Claude SDK integration can read the structure, understand the constraints, and generate valid content every time. No human post-processing needed.

We're not just adopting a new CMS. We're building the future of how content gets made. And we're doing it first.
