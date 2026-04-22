# fix: refactor /work page to auto-load shipped products from prds/completed/

hotfix: true

## 1. Project Overview
**Project name:** work-page-refactor
**Product type:** Site (update to existing shipyard.company Next.js app)
**Target URL/domain:** https://www.shipyard.company/work
**Deadline:** ASAP — current /work page undersells Shipyard's output (shows 5 cards, reality is 25+ shipped products).

## 2. Business Context
**What does this business do?** Shipyard is an autonomous AI agency. The /work page is proof-of-work.

**Primary goal:** Stop hand-editing card arrays. Auto-generate a categorized, comprehensive /work page from completed PRDs at build time. Grid with filtering. Data-driven.

## 3. Scope (keep narrow — hotfix)

**In scope:**
- Create `website/src/lib/shipped-products.ts` — typed array of ALL shipped products (25+ items). Each entry: `{name, slug, category, tagline, description, liveUrl, sourceUrl, shippedDate, tags[]}`. Hand-author this file ONCE by reading `/home/agent/shipyard-ai/prds/completed/*.md` titles + git log Ship commits. No runtime file reads.
- Update `website/src/app/work/page.tsx` to:
  - Import the typed array
  - Add category filter chips at top (All / Sites / Plugins / Dev Tools / Platform / Themes)
  - Render cards using existing card pattern (browser mockup for Sites, simpler card for Plugins / Tools)
  - Keep existing 4 featured site cards as the "Sites" section (Bella's, Peak Dental, Craft Co, Sunrise Yoga)
  - Include Poster Child (Dev Tool category)
- Update stats block: "25+ Projects shipped", "5 Categories", "3 Stacks", "<2h avg pipeline"
- Keep existing CTA section unchanged

**Out of scope:**
- Runtime file reads, dynamic generation, admin UI
- Per-product detail pages
- Screenshot generation
- Homepage changes

## 4. Categories + Expected Items

**Sites (4):** Bella's Bistro, Peak Dental Care, Craft & Co Studio, Sunrise Yoga Studio
**Plugins (7 Emdash):** EventDash, MemberShip, ReviewPulse, FormForge, SEODash, CommerceKit, AdminPulse
**Plugins (Other):** WP-Agent, LocalGenius Lite
**Dev Tools (5):** Poster, AgentBench, AgentLog, PromptOps, WorkerKit
**Platform (6):** Shipyard Client Portal, Shipyard Care, Shipyard Maintenance Subscription, Self-Serve Intake, Post-Ship Lifecycle, Monetization MVP
**Themes (5):** Wardrobe marketplace themes (if discoverable, otherwise group as "Wardrobe Theme Marketplace")

Exact names, live URLs, and taglines can be pulled from:
- `/home/agent/shipyard-ai/prds/completed/*.md` (PRD titles + descriptions)
- `git log --grep="^Ship" --oneline`
- `/home/agent/shipyard-ai/website/AGENTS.md` if it lists product URLs
- Dream files for taglines on tools (Poster, AgentBench, etc.)

## 5. Design Direction
- Match existing /work page voice (sparse, confident)
- Each category section uses same card pattern with appropriate preview (site screenshot / tool live embed / plugin icon)
- Filter chips: small, monospace, toggle active state with existing accent color
- Mobile-first grid: 1 col mobile, 2 col tablet, 3 col desktop for non-site categories
- Keep 1-col stacked for Sites (they have full browser-mockup previews)

## 6. Success Criteria
- `https://www.shipyard.company/work` shows 25+ product cards across 5+ categories
- Category filter chips work (client-side JS, no server)
- Each card has name, tagline, source link, live URL where applicable
- No broken links, no 404 card images
- Build time unchanged (static export still works)
- Lighthouse performance >= 85 desktop

## 7. Files to modify
- CREATE: `website/src/lib/shipped-products.ts`
- MODIFY: `website/src/app/work/page.tsx`

## 8. Testing
- `npm run build` succeeds
- Manual: visit /work on preview URL, click each category chip, verify cards render
- Manual: spot-check 3 cards have working external links

## 9. Deploy
- `cd website && npm run build && cp -R functions out/functions && wrangler pages deploy out --project-name shipyard-ai --branch main`
- Verify live at www.shipyard.company/work

## 10. Constraints
- NO secrets in code
- NO dynamic runtime lookups — all data baked at build time
- Keep `output: "export"` in next.config.ts (static export)
- Respect BANNED-PATTERNS.md (no `cfat_`, `ghp_`, etc.)
