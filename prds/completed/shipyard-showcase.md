# fix: shipyard-showcase (hotfix retry)

hotfix: true

# PRD — Shipyard Website Showcase Update

## 1. Project Overview
**Project name:** shipyard-showcase-update
**Product type:** Site (Next.js on Cloudflare Pages)
**Target URL/domain:** https://www.shipyard.company (existing site in `/website/`)
**Deadline:** None — flexible, but within 48h preferred.

## 2. Business Context
**What does this business do?** Shipyard is an autonomous AI agency. The website is its storefront.

**Primary goal:** Make shipped products tangible. Visitors land, immediately see real deliverables with live, clickable examples. Proves the pipeline is not a demo — it ships.

**Target audience:** Prospective clients, investors, developer community. Anyone who needs to believe "these agents really do ship production software."

## 3. Pages / Features

### A. `/work` page — live deliverable showcase
| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Poster Child card | Live example — embed `https://poster.dev/github.com/sethshoultes/shipyard-ai` (the actual PNG). Caption: "One-click beautiful OG images for any GitHub repo." Links: live demo, GitHub issue #84, source in `deliverables/github-issue-sethshoultes-shipyard-ai-84/`. | Must-have |
| 2 | WP-Agent card | Link to published plugin + short blurb. "WordPress sites become AI agents." | Must-have |
| 3 | LocalGenius Lite card | Short blurb + live-site link if deployed. | Must-have |
| 4 | AgentBench card | Leaderboard link + blurb. | Must-have |
| 5 | PromptOps card | Blurb + source link. | Must-have |
| 6 | AgentLog card | Blurb + source link. | Must-have |
| 7 | MemberShip, EventDash, ReviewPulse, FormForge, SEODash, CommerceKit, AdminPulse (Emdash plugins) | Grouped "Emdash Plugins" section with 7 cards, short blurb each. | Must-have |
| 8 | "All shipped products" index | Generate from `shipyard-ai/prds/completed/` file list — auto-updates as more ship. | Nice-to-have |

Each card format:
- Name + one-sentence tagline
- Live example (image, embed, or demo link)
- Source link (GitHub commit or deliverable path)
- PRD link if public
- Shipped date

### B. Homepage `/` — hero refresh
- Above-the-fold: "We ship production AI software autonomously. Here's what shipped this week." + rotating 3 recent products.
- CTA: "See everything we've built" → `/work`

### C. Poster Child deployment (prerequisite for feature #1)
- Deploy the Worker in `deliverables/github-issue-sethshoultes-shipyard-ai-84/` to Cloudflare account `a02352ad1742197c106c1774fcbada2d`
- Use `CLOUDFLARE_API_TOKEN` from agent env (already configured on daemon via `/home/agent/.cloudflare.env`)
- Set `GITHUB_TOKEN_POOL` secret via `wrangler secret put GITHUB_TOKEN_POOL` using the existing GH token pool
- Route: `poster.shipyard.company` (add Cloudflare Worker route) OR use default `*.workers.dev` URL as fallback
- Verify: `curl https://poster.shipyard.company/github.com/sethshoultes/shipyard-ai -o test.png && file test.png` returns valid PNG
- Warm cache for top shipped-product repos

## 4. Design Direction
- Match existing Shipyard site voice — sparse, confident. See `/website/src/app/page.tsx` and [[`AGENTS.md`]] in website repo.
- Each card should feel inevitable, not cluttered. Jony Ive/Maya Angelou standard.
- Typography: site already uses self-hosted fonts — match.
- Mobile-first grid: 1 col mobile, 2 col tablet, 3 col desktop.

## 5. Scope

### In scope
- Update `/website/src/app/work/page.tsx` with real product cards
- Add `/website/src/lib/products.ts` — structured data (name, tagline, links, dates) pulled from `prds/completed/` + hand-curated
- Deploy Poster Child Worker to CF
- Wire homepage hero to show 3 latest
- Build + deploy site to Cloudflare Pages (existing pipeline in `website/`)

### Out of scope
- Redesign of navigation, footer, contact, chat
- Any backend changes to the daemon
- New MCP tools

## 6. Success Criteria
- `curl https://poster.shipyard.company/github.com/sethshoultes/shipyard-ai -I` returns `200` with `content-type: image/png`
- `https://www.shipyard.company/work` renders ≥10 product cards, each with a working link, image or live demo
- Homepage shows "Recently shipped" block with 3 products
- No broken images, no 404s
- Lighthouse performance >= 85 desktop, >= 70 mobile

## 7. Testing
- Manual: visit production URLs, click every card link
- Automated: add Cypress or Playwright check for `/work` page — at least 10 card elements, no console errors
- Poster Worker: `curl` test above + spot-check rendered PNG opens cleanly

## 8. Constraints
- Use existing Next.js 15 + App Router setup in `/website/`
- Deploy via existing `wrangler pages deploy` flow
- No secrets in code — all tokens via env (`CLOUDFLARE_API_TOKEN`, `GITHUB_TOKEN_POOL`)
- Respect `BANNED-PATTERNS.md` in root — no `cfat_`, `ghp_`, `gho_` literals anywhere
