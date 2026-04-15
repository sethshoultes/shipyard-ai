# Blog Infrastructure — First Principles Review

## Architecture: Simplest System That Could Work ✓

**This is correct.** The spec is already minimal:
- Filesystem as database (zero latency, zero cost, zero ops)
- Static generation at build time (edge-cacheable forever)
- No server, no API routes, no runtime → deploy to CDN and forget

The proposed stack (gray-matter + remark) is the industry standard for markdown blogs. Don't reinvent this wheel.

**One question:** Why are we using `remark-html` when Next.js has `next-mdx-remote` or `react-markdown`? HTML injection via `dangerouslySetInnerHTML` loses React component composability. If we want syntax highlighting or interactive components in posts later, we're locked out. Consider `react-markdown` + `rehype-highlight` instead — same API surface, better extensibility.

## Performance: Bottlenecks & 10x Path

**Build time is the only bottleneck.** With 6 posts, fs.readFileSync is fine. At 1,000 posts, this will tank build times because every post reads from disk synchronously during static generation.

**10x path:** Memoize post parsing. Cache the parsed frontmatter + HTML in a `.posts-cache.json` during build, invalidate on file hash change. This is premature optimization for now, but note it for when we hit 100+ posts.

**Runtime performance:** Static HTML on Cloudflare's edge network. Sub-100ms TTFB globally. This is already 10x faster than any SSR blog. Nothing to optimize.

## Distribution: How Does This Reach 10K Users Without Paid Ads?

**The blog infrastructure doesn't matter. The content does.**

This PRD is about plumbing. Distribution requires:
1. **SEO-optimized content** — the OpenGraph tags and per-post URLs are table stakes, not a moat
2. **Shareability** — posts need to go viral on Twitter/HN/Reddit. That means controversial takes, hard data, or novel insights
3. **Inbound links** — guest posts, open-source tools mentioned in posts, GitHub stars driving traffic

The daemon-written posts (`the-night-shift.md`, `model-selection-multi-agent.md`) are the real test. If an AI can write content that gets upvoted on Hacker News, we've unlocked scalable distribution. If not, this is just a nice CMS for human-written posts.

**Missing:** RSS feed. Every technical blog needs one. Add `blog/rss.xml` via a static generation script. This is free syndication.

## What to CUT: Scope Creep & V2 Features

**Cut from V1:**
- Tags UI — the frontmatter has tags, but we don't need a `/blog/tags/[tag]` page yet. No reader will filter by tags until we have 50+ posts
- Search — zero ROI for 6 posts. Ctrl+F works fine
- Related posts — pure feature bloat until we have content clustering worth showing
- Author attribution — single-author blog doesn't need bylines

**Keep tight on:**
- "Match existing design" — this can spiral into bikeshedding. Use Tailwind prose defaults, don't pixel-push

## Technical Feasibility: Can One Agent Session Build This?

**Yes.** This is a 2-hour task for a competent developer, so ~3-4 hours for an agent:
1. `npm install` (1 command)
2. Write `lib/blog.ts` (~50 lines of boilerplate)
3. Write `blog/[slug]/page.tsx` (~80 lines, mostly copy-paste from existing blog page)
4. Refactor `blog/page.tsx` (delete hardcoded array, add map over `getAllPosts()`)
5. Copy 6 markdown files into `blog/posts/`
6. Test build, deploy

**The only blocker:** Does the agent have access to the existing blog page design? If `website/src/app/blog/page.tsx` isn't readable, the agent will guess at styling. Read that file first.

**Risk:** The agent might hallucinate Next.js 13+ API changes (e.g., async `generateMetadata`). The PRD should specify Next.js version.

## Scaling: What Breaks at 100x Usage?

**6 posts → 600 posts:**
- Build time: ~5 seconds → ~8 minutes (fs.readFileSync on 600 files). Fix: parallel parsing or caching
- Deploy size: ~500KB HTML → ~50MB. Cloudflare Pages has a 25MB limit. **This will break.** Fix: paginate blog index, lazy-load post content

**60 visitors/day → 6,000 visitors/day:**
- Nothing breaks. Static files on CDN scale to millions of requests/day for $0

**The real scaling question:** Can the daemon write 600 posts worth reading? If yes, the blog infra is irrelevant — we need a content moderation/curation layer. If no, we cap at ~50 human-written posts and none of this matters.

## Final Take

**Ship it.** The PRD is tight, the stack is boring (good), and the scope is minimal. The only strategic question is whether we're building a CMS for humans or a publishing platform for AI-generated content. That determines what scales and what doesn't.

**One addition:** Add a `published: boolean` flag to frontmatter. Let the daemon write posts to `blog/posts/` as drafts without auto-publishing. Human reviews before going live. Trust, but verify.

**Timeline:** One agent session if the existing design is copy-paste-able. Two sessions if the agent has to infer styling from scratch.
