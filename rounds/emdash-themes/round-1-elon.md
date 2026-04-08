# Round 1 Review — Elon Musk, Chief Product & Growth Officer

## Architecture: Simplest System That Works

The PRD asks for 5 themes × 5 pages = 25 distinct page templates. That's too much surface area for v1.

**First principles:** A "theme" is just CSS variables + layout primitives. The content structure (hero, grid, nav) should be shared; only the *skin* changes. Build ONE semantic HTML structure, then swap stylesheets.

**Cut the complexity:** Don't build 5 independent codebases. Build 1 base template + 5 CSS theme files. Total: ~1,500 lines of CSS instead of ~10,000 lines of duplicated HTML/CSS.

## Performance: Where Are the Bottlenecks?

The PRD says "no external dependencies" but specifies Google Fonts (Playfair, Inter, JetBrains, Quicksand). That's 4+ font families = 400-800KB of blocking requests.

**Fix:** Self-host fonts. Subset to Latin. Use `font-display: swap`. Budget: <100KB per theme.

Parallax and horizontal scroll (Drift theme) will kill mobile performance. 60fps scroll requires GPU-composited layers. Most implementations use JS scroll listeners — that's a perf disaster.

**10x path:** CSS-only effects. `scroll-snap` for horizontal. No parallax on mobile. Ship it.

## Distribution: Path to 10,000 Users

The PRD has zero distribution strategy. "Portfolio pieces" don't spread.

**Reality check:** Emdash is new. There's no theme marketplace. No ecosystem. We're building themes for a platform with limited users.

**What actually works:**
1. Get into Emdash's official docs/examples
2. SEO landing pages: "free restaurant website template" gets 2,400 monthly searches
3. One-click deploy buttons (Cloudflare, Vercel, Netlify)
4. HN/Reddit launch for Forge theme (dev tools angle)

No distribution plan = portfolio-ware. These themes serve our clients only.

## What to CUT (v2 Features in v1 Clothing)

- **Dark mode toggle:** Adds JS, localStorage, FOUC bugs. Ship Forge as dark-only, others as light. v2.
- **Parallax/horizontal scroll (Drift):** JS complexity for zero conversion impact. Cut.
- **Charts (Slate):** Requires chart library. Massive scope addition. Cut.
- **Sidebar navigation (Slate):** Different nav paradigm = different component architecture. Cut.
- **Blog templates:** 4 pages per theme is enough. Blog is content, not theme.
- **WCAG 2.1 AA compliance:** Important but scope-bloating. Hit basics (contrast, focus states). Full audit is v2.
- **Redesigning 4 existing sites:** Separate PRD. Themes first, applications second.

**Revised v1:** 5 CSS skins + 2 layout variants + shared components. Ship in 2-3 sessions.

## Technical Feasibility: Can One Agent Build This?

No.

**Math:** Each theme needs ~2-4 hours of equivalent work (layout, typography, responsive, testing). That's 10-20 hours. Agent sessions hit context limits before completion.

**Feasible scope:** 2 themes per session. Ship Ember + Forge first — most visually differentiated. Drift/Bloom/Slate follow.

## What Breaks at 100x Usage

Static HTML/CSS scales infinitely on CDN. Architecture is fine.

**What actually breaks:**
- Customization requests: "Can I change the orange to red?" × 1000 users = support nightmare
- Emdash version updates: Breaking changes could affect all themes with no update mechanism

**Fix:** Ship with documented CSS custom properties (`--primary`, `--accent`, `--font-heading`). Users customize without forking. Version-lock Emdash compatibility.

## Verdict

This PRD describes portfolio work, not a product. For 10k users:
1. Distribution hooks (official Emdash listing, SEO, deploy buttons)
2. Customization layer (CSS variables, documented)
3. Realistic scope (2 themes v1, not 5)
4. Version/update strategy

Ship Ember + Forge. Prove traction. Then build the rest.
