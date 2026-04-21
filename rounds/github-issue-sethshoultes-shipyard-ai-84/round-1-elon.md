## Architecture

The PRD says "Cloudflare Workers + Claude + image generation." This is hand-wavy nonsense that conflates three unrelated things. Let's reason from first principles.

What is the actual job? A user pastes a GitHub URL. The system returns a PNG. That's it.

The simplest system that could work is a single Cloudflare Worker: fetch repo metadata and README via the public GitHub API, call Claude with a 100-token prompt for a tagline, render an HTML template to PNG using Satori + resvg-WASM, and return the image. No database. No GitHub App. No user accounts. No queue. No blob storage for v1. Cache the final PNG in Cloudflare Cache API for 24 hours keyed by `repo + commit SHA`. That's the whole system. If it doesn't fit in one Worker file, it's too complex. Complexity is the enemy of execution.

## Performance

Bottleneck is Claude latency (~2-3s) and WASM image rendering (~1s). A naive implementation does this on every request. That's insane and will get you rate-limited into oblivion.

The 10x path isn't "optimize rendering"—it's *don't render twice*. Use `Cache-Control: immutable` keyed to the latest commit SHA. If the repo hasn't changed, serve from edge cache in 50ms. Second 10x: truncate the README to 2,000 tokens before sending to Claude. Nobody needs a novel analyzed; the first paragraph is usually the pitch anyway. Third 10x: pre-warm cache for popular repos via a cron trigger so the first request is never cold. Without caching, this is a toy. With caching, it's a utility. Cache is architecture.

## Distribution

"Direct link sharing, GitHub Actions marketplace, Product Hunt" is not a distribution strategy; it's a list of places you heard about once and think count as a go-to-market plan. They don't.

To reach 10,000 users with $0 ad spend, the product itself must be the distribution: make the API a hotlinkable image (`poster.child/?repo=x/y`). Every README that embeds it becomes a billboard that every visitor sees. Provide a one-click GitHub Action YAML they paste—*not* a Marketplace app, which requires compliance review and nobody browses anyway. Product Hunt is a one-day spike, not user acquisition.

The viral loop is the embed. If the image doesn't link back to your domain, you failed at distribution.

## What to CUT

Cut the GitHub Actions Marketplace integration—that's a v2 compliance marathon masquerading as a v1 feature. Cut Claude-generated taglines as a blocking step; use the GitHub repo description for v1 and make Claude an opt-in enhancement. Cut a user dashboard, auth, billing, and usage analytics. Cut dynamic language pie charts; list the top language as text. Cut multiple image sizes and aspect ratios; ship one Twitter-card size and move on. This is an image API with a landing page, not a SaaS platform. If it doesn't directly contribute to generating a PNG from a URL, it doesn't ship. Period.

## Technical Feasibility

Can one agent session build this? Yes—if the scope is ruthlessly limited to the Worker + API + basic landing page. ~400 lines of code. The real risk is WASM font loading and resvg edge cases inside Workers; budget 30 minutes for debugging font paths and CJK character fallback. One session cannot build auth, databases, a Marketplace app, or an admin panel. Those are traps that feel like progress but kill velocity. Stay in scope and it's doable. Scope creep is what kills single-session builds. Define done as "paste URL, get PNG, end of story."

## Scaling

At 100x usage, three things break immediately—and two of them are money.

First, Claude API cost: if you eat the inference cost, 100k images/day = ~$1,000/day in tokens alone. You need user-funded API keys or abandon LLM taglines fast.

Second, GitHub's 60 req/hour unauthenticated rate limit breaks instantly at any meaningful scale; you need authenticated tokens and request pooling or your entire product goes down.

Third, Worker CPU time limits on WASM rendering; move PNG generation to an external stateless container or pre-render popular repos to R2.

The fun part: if you actually hit 100x usage, you have no revenue model. Fix monetization before you fix scaling. Otherwise you're just optimizing how fast you can lose money, and that's not a business.
