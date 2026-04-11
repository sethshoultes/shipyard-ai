# Wardrobe Theme Marketplace — Requirements Document

**Product:** Theme marketplace for Emdash CMS
**Project Slug:** emdash-marketplace
**Generated:** April 11, 2026
**Sources:** rounds/emdash-marketplace/decisions.md, docs/EMDASH-GUIDE.md

---

## The Essence

> **What it is:** One command transforms your site into something beautiful — your content stays, only the skin changes.

> **The feeling:** "I can't believe I just did that."

> **The one thing that must be perfect:** Seeing YOUR content wearing a new theme.

> **Creative direction:** Instant dignity.

---

## Requirements Summary

| Priority | Count | Description |
|----------|-------|-------------|
| P0-Blocker | 6 | Tier 1 board conditions - must complete before launch |
| P1-Must | 8 | Core MVP functionality (substantially complete) |
| P2-Should | 9 | Tier 2-3 board conditions (post-launch) |
| **Total** | **23** | |

---

## Current Implementation Status

The Wardrobe MVP is substantially built per codebase analysis:

| Component | Status | Location |
|-----------|--------|----------|
| CLI (`wardrobe`) | DONE | deliverables/emdash-marketplace/wardrobe/cli/ |
| 5 Themes | DONE | deliverables/emdash-marketplace/wardrobe/themes/ |
| Registry (themes.json) | DONE | deliverables/emdash-marketplace/wardrobe/registry/ |
| Showcase HTML | DONE | deliverables/emdash-marketplace/wardrobe/showcase/ |
| Email Worker Code | DONE | deliverables/emdash-marketplace/wardrobe/workers/email-capture/ |
| Analytics Worker Code | DONE | deliverables/emdash-marketplace/wardrobe/workers/analytics/ |
| Theme Tarballs | DONE | deliverables/emdash-marketplace/wardrobe/dist/themes/ |
| Screenshots | **SVG PLACEHOLDERS** | showcase/screenshots/*.svg |
| Worker Deployments | **NOT DONE** | KV namespaces not provisioned |
| R2 Theme Upload | **NOT DONE** | Tarballs built but not uploaded |
| Showcase Deployment | **NOT DONE** | Pages project not created |
| Live Demo Sites | **NOT DONE** | No per-theme demo deployments |
| Post-Install Reveal | **PARTIAL** | No browser open or dev server hint |

**Board Verdict:** PROCEED (Conditional) — 6/10 aggregate score
**Launch Status:** Technical MVP complete; 0/5 Tier 1 conditions met

---

## P0-BLOCKER: Tier 1 Launch Conditions

### REQ-T1-001: Deploy Live Demo Sites

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-001 |
| **Category** | Infrastructure |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Board Conditions Tier 1 #1 (Oprah/Shonda) |
| **Status** | NOT DONE |

**Description:**
Deploy live demo sites for each of the 5 themes with working preview URLs prominently featured on showcase.

**Acceptance Criteria:**
- [ ] 5 Emdash sites deployed to Cloudflare Workers (one per theme)
- [ ] Each accessible via public URL: ember.wardrobe.emdash.dev, forge.wardrobe.emdash.dev, etc.
- [ ] Each site contains representative sample content (blog posts, about page)
- [ ] Showcase website links point to live demo URLs
- [ ] Demo sites use consistent seed data for fair comparison

**Technical Notes (from docs/EMDASH-GUIDE.md Section 5):**
- Use `wrangler d1 create` and `wrangler r2 bucket create` for each theme
- Run `npm create emdash@latest` with theme scaffold
- Use seed.json for demo content (Section 7: Theme seed files)

---

### REQ-T1-002: Replace SVG Placeholders with Real Screenshots

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-002 |
| **Category** | Showcase |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Board Conditions Tier 1 #2 (Oprah) |
| **Status** | NOT DONE |

**Description:**
Replace SVG placeholder screenshots with actual site images showing each theme in use.

**Current State:**
- `showcase/screenshots/ember.svg` — placeholder SVG (~1KB)
- `showcase/screenshots/forge.svg` — placeholder SVG
- `showcase/screenshots/slate.svg` — placeholder SVG
- `showcase/screenshots/drift.svg` — placeholder SVG
- `showcase/screenshots/bloom.svg` — placeholder SVG

**Acceptance Criteria:**
- [ ] 5 PNG or WebP screenshots (1200x800px recommended)
- [ ] Screenshots show real rendered themes with sample content
- [ ] Screenshots capture "the magic" — must convey emotional essence
- [ ] Optional: GIFs showing transformation effect (Risk Register recommendation)
- [ ] Steve Jobs persona approval before ship

**Technical Notes:**
- Script exists: `scripts/generate-screenshots.ts` (uses Playwright)
- Depends on REQ-T1-001 (need live demo sites to capture)
- Output: Replace `showcase/screenshots/{theme}.svg` with PNG/WebP

---

### REQ-T1-003: Post-Install Reveal Enhancement

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-003 |
| **Category** | CLI |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Board Conditions Tier 1 #3 (Shonda) |
| **Status** | PARTIAL |

**Description:**
After theme installation, CLI offers to open transformed site or prints clear localhost URL.

**Current State (cli/commands/install.ts lines 197-202):**
```
✓ Theme installed.

Your site is now wearing ember.

Try it on. If it doesn't fit, try another.

Installed in 2.34s
```

**Gap:** Does not provide dev server command or localhost URL.

**Acceptance Criteria:**
- [ ] Success message includes: "Run `npm run dev` to see your transformed site"
- [ ] Print localhost URL: "Then open http://localhost:4321"
- [ ] Print admin URL: "Admin panel: http://localhost:4321/_emdash/admin"
- [ ] Use docs/EMDASH-GUIDE.md Section 1 port: 4321 (Astro default)

---

### REQ-T1-004: Wire Email Capture Worker

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-004 |
| **Category** | Infrastructure |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Board Conditions Tier 1 #4 (Shonda/Oprah) |
| **Status** | NOT DONE |

**Description:**
Deploy email capture worker to production; wire showcase form to actual endpoint; confirm data practices documented.

**Current State:**
- Worker code complete at `workers/email-capture/src/index.ts`
- Endpoints: `POST /subscribe`, `OPTIONS` (CORS)
- KV namespaces configured but IDs are placeholders
- Showcase form exists at `showcase/index.html` line 288-302
- `showcase/script.js` handles form submission

**Acceptance Criteria:**
- [ ] Create KV namespaces: `wrangler kv:namespace create EMAILS` and `RATE_LIMITS`
- [ ] Update `workers/email-capture/wrangler.toml` with real namespace IDs
- [ ] Deploy worker: `wrangler deploy` in workers/email-capture/
- [ ] Update showcase `script.js` with real endpoint URL
- [ ] End-to-end test: submit email → verify stored in KV
- [ ] Privacy policy/data practices documented in showcase

---

### REQ-T1-005: Deploy Analytics Telemetry Worker

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-005 |
| **Category** | Infrastructure |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Board Conditions Tier 1 #5 (Buffett) |
| **Status** | NOT DONE |

**Description:**
Deploy anonymous install telemetry worker to track which themes are installed.

**Current State:**
- Worker code complete at `workers/analytics/src/index.ts`
- Endpoints: `POST /track`, `GET /stats`, `GET /health`
- CLI already calls telemetry at install.ts line 34: `https://wardrobe-analytics.emdash.workers.dev/track`
- KV namespace IDs are placeholders
- `API_KEY` secret not configured

**Acceptance Criteria:**
- [ ] Create KV namespace: `wrangler kv:namespace create ANALYTICS`
- [ ] Update `workers/analytics/wrangler.toml` with real namespace ID
- [ ] Set API_KEY secret: `wrangler secret put API_KEY`
- [ ] Deploy worker: `wrangler deploy` in workers/analytics/
- [ ] CLI install command successfully sends telemetry (verify with /stats endpoint)
- [ ] No PII collected (theme, OS, timestamp, cliVersion only)
- [ ] Telemetry opt-out documented: `WARDROBE_TELEMETRY_DISABLED=1`

---

### REQ-T1-006: Deploy Showcase Website

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-006 |
| **Category** | Infrastructure |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Decision #8, Board Override |
| **Status** | NOT DONE |

**Description:**
Deploy static HTML showcase website to Cloudflare Pages.

**Current State:**
- Complete showcase exists in `showcase/` directory
- Files: index.html (341 lines), styles.css, script.js
- Cloudflare config: `_headers`, `_redirects`, `wrangler.toml`
- Email form posts to placeholder endpoint

**Acceptance Criteria:**
- [ ] Create Pages project: `wrangler pages project create wardrobe-showcase`
- [ ] Deploy: `wrangler pages deploy showcase/`
- [ ] Custom domain: wardrobe.emdash.dev (or wardrobe.emdash.app per HTML)
- [ ] All 5 theme cards display correctly with real screenshots
- [ ] Copy-to-clipboard works for install commands
- [ ] Email capture form posts to deployed worker endpoint
- [ ] Mobile-responsive (tested on iPhone/Android viewports)
- [ ] WCAG 2.1 AA accessible (color contrast, keyboard nav)

---

### REQ-T1-007: Upload Theme Tarballs to R2

| Property | Value |
|----------|-------|
| **ID** | REQ-T1-007 |
| **Category** | Infrastructure |
| **Priority** | P0 (Launch Blocker) |
| **Source** | Decision #4 (Architecture), Risk Register |
| **Status** | NOT DONE |

**Description:**
Upload built theme tarballs to Cloudflare R2 bucket so CLI installs work.

**Current State:**
- Tarballs built at `dist/themes/{theme}@1.0.0.tar.gz`
- Registry points to `https://cdn.emdash.dev/themes/` (placeholder CDN)
- Upload script exists: `scripts/upload-tarballs.ts`
- R2 bucket not created

**Acceptance Criteria:**
- [ ] Create R2 bucket: `wrangler r2 bucket create emdash-themes`
- [ ] Configure public access on bucket (or custom domain)
- [ ] Set environment variables: `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`
- [ ] Run upload script: `npm run upload:themes`
- [ ] Verify tarballs accessible at CDN URLs in themes.json
- [ ] Test: `npx wardrobe install ember` downloads from R2 successfully

---

## P1-MUST: Core MVP Features (Substantially Complete)

### REQ-CLI-001: List Command ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-CLI-001 |
| **Status** | DONE |
| **Implementation** | cli/commands/list.ts |

`npx wardrobe list` fetches themes.json and displays available themes with descriptions.

---

### REQ-CLI-002: Install Command ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-CLI-002 |
| **Status** | DONE |
| **Implementation** | cli/commands/install.ts (262 lines) |

`npx wardrobe install [theme]` downloads tarball, backs up src/, swaps in theme src/.

**Features verified:**
- Validates theme name against registry
- Downloads with progress bar
- Creates backup at `src.backup/`
- Verifies critical files: `live.config.ts`, `pages/index.astro`
- Restores backup on failure
- Sends anonymous telemetry (fire-and-forget)

**Locked Decision:** Install completes in under 3 seconds (Decision #5).

---

### REQ-CLI-003: Preview Command ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-CLI-003 |
| **Status** | DONE |
| **Implementation** | cli/commands/preview.ts |

`npx wardrobe preview [theme]` opens theme showcase in browser.

---

### REQ-THEME-001 through 005: Five Themes ✓

| Theme | Personality | Status | Path |
|-------|-------------|--------|------|
| Ember | Bold. Editorial. For people with something to say. | DONE | themes/ember/ |
| Forge | Dark and technical. Built for builders. | DONE | themes/forge/ |
| Slate | Clean and professional. Trust at first glance. | DONE | themes/slate/ |
| Drift | Minimal and airy. Let your content breathe. | DONE | themes/drift/ |
| Bloom | Warm and inviting. Where community feels at home. | DONE | themes/bloom/ |

**Theme Structure (verified for all 5):**
```
{theme}/
├── src/
│   ├── pages/index.astro
│   ├── layouts/BaseLayout.astro
│   ├── components/{Header,Footer}.astro
│   ├── styles/theme.css
│   └── live.config.ts
└── README.md
```

**Per docs/EMDASH-GUIDE.md Section 7:**
- All themes use `emdashLoader()` in live.config.ts ✓
- CSS variables for theming ✓
- Server-rendered pages (no getStaticPaths) ✓

---

### REQ-REG-001: Themes Registry ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-REG-001 |
| **Status** | DONE |
| **Implementation** | registry/themes.json (78 lines) |

Contains 5 active themes + 4 coming soon themes (Aurora, Chronicle, Neon, Haven).

**Registry Schema:**
```json
{
  "cdnBaseUrl": "https://cdn.emdash.dev/themes",
  "themes": [
    {
      "name": "ember",
      "description": "Bold. Editorial...",
      "personality": "Magazine-style...",
      "version": "1.0.0",
      "tarballUrl": "https://cdn.emdash.dev/themes/ember@1.0.0.tar.gz",
      "sha256": "c1d24f686f79fb29a11c1312d3c70cf121410e54ef7465c8ccedd98a06bf2d49",
      "previewUrl": "https://wardrobe.emdash.dev#ember"
    }
  ]
}
```

---

### REQ-SHOW-001: Showcase HTML ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-SHOW-001 |
| **Status** | DONE (pending deployment) |
| **Implementation** | showcase/index.html (341 lines) |

Features verified:
- 5 theme cards with copy-to-clipboard
- 4 coming soon cards with "Get Notified" links
- Email capture form at #notify section
- JSON-LD structured data
- Open Graph and Twitter Card meta tags
- ARIA labels and semantic HTML

---

### REQ-BRAND-001: Wardrobe Naming ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-BRAND-001 |
| **Status** | DONE |
| **Source** | Decision #1 |

"Wardrobe" is used throughout. `npx wardrobe install ember` is tweetable.

---

### REQ-BRAND-002: Steve Jobs Voice ✓

| Property | Value |
|----------|-------|
| **ID** | REQ-BRAND-002 |
| **Status** | DONE |
| **Source** | Decision #6 |

Copy follows Steve's voice per Maya Angelou review. Examples verified in codebase:
- "Ember. Bold. Editorial. For people with something to say." ✓
- "Your site is now wearing ember. Try it on. If it doesn't fit, try another." ✓
- "Instant dignity for your Emdash site." ✓ (showcase tagline)

---

## P2-SHOULD: Tier 2-3 Board Conditions (Post-Launch)

### REQ-T2-001: Pricing Infrastructure

| Property | Value |
|----------|-------|
| **ID** | REQ-T2-001 |
| **Priority** | P2 |
| **Source** | Board Tier 2 #6 (Buffett) |
| **Status** | NOT DONE |

Build pricing rails for paid themes (even if all free now).

---

### REQ-T2-002: Theme Creator Guidelines

| Property | Value |
|----------|-------|
| **ID** | REQ-T2-002 |
| **Priority** | P2 |
| **Source** | Board Tier 2 #7 (Jensen/Buffett) |
| **Status** | NOT DONE |

Public documentation for third-party theme submissions.

---

### REQ-T2-003: Post-Install Engagement Email

| Property | Value |
|----------|-------|
| **ID** | REQ-T2-003 |
| **Priority** | P2 |
| **Source** | Board Tier 2 #8 (Shonda) |
| **Status** | NOT DONE |

"You're wearing [theme]. Here's how to customize it."

---

### REQ-T2-004: User Content Preview

| Property | Value |
|----------|-------|
| **ID** | REQ-T2-004 |
| **Priority** | P2 |
| **Source** | Board Tier 2 #9 (Jensen) |
| **Status** | NOT DONE |

Let users see THEIR content in a theme before installing.

---

### REQ-T3-001: Theme Versioning

| Property | Value |
|----------|-------|
| **ID** | REQ-T3-001 |
| **Priority** | P2 |
| **Source** | Board Tier 3 #10 |
| **Status** | NOT DONE |

`wardrobe list` shows installed vs. latest version.

---

### REQ-T3-002: Site Gallery

| Property | Value |
|----------|-------|
| **ID** | REQ-T3-002 |
| **Priority** | P2 |
| **Source** | Board Tier 3 #11 |
| **Status** | NOT DONE |

Showcase of real sites using each theme.

---

### REQ-T3-003: Creator Submission Pipeline

| Property | Value |
|----------|-------|
| **ID** | REQ-T3-003 |
| **Priority** | P2 |
| **Source** | Board Tier 3 #12 |
| **Status** | NOT DONE |

Automated validation and revenue share model.

---

### REQ-T3-004: AI Theme Preview

| Property | Value |
|----------|-------|
| **ID** | REQ-T3-004 |
| **Priority** | P2 |
| **Source** | Board Tier 3 #13 (Jensen) |
| **Status** | NOT DONE |

Render user's D1 content into theme before install.

---

### REQ-T3-005: Catalog Expansion

| Property | Value |
|----------|-------|
| **ID** | REQ-T3-005 |
| **Priority** | P2 |
| **Source** | Board Tier 3 #14 |
| **Status** | NOT DONE |

Expand to 10+ themes at scale.

---

## Open Questions Requiring Resolution

### OQ-001: Emdash Core Integration

| Property | Value |
|----------|-------|
| **Question** | Does Emdash core depend on Wardrobe CLI, or does Emdash bundle themes directly? |
| **Source** | decisions.md Open Questions #2 |
| **Impact** | Blocks `emdash create --theme` integration |
| **Owner** | Emdash core team |

### OQ-002: Theme Structure Contract

| Property | Value |
|----------|-------|
| **Question** | What exactly must each theme's `src/` directory contain? |
| **Source** | decisions.md Open Questions #4 |
| **Impact** | Blocks third-party submissions, compatibility testing |
| **Recommendation** | Document in docs/THEME-CONTRACT.md |

**Reference (docs/EMDASH-GUIDE.md Section 7):**
Theme structure should include:
- `src/pages/` — Astro pages (index.astro required)
- `src/layouts/` — Layout components
- `src/components/` — UI components
- `src/live.config.ts` — Emdash content connection
- `.emdash/seed.json` — Schema and sample content (optional but recommended)

---

## Cut Features (NOT in V1)

Per decisions.md "What Was Cut":

| Feature | Rationale |
|---------|-----------|
| Live preview server | 30+ days engineering for zero users |
| Live demo sites per theme | Cut then REINSTATED as Tier 1 board blocker |
| User accounts | Zero value for CLI install |
| Theme ratings/reviews | Curation IS the quality signal |
| Search/filtering | 5 themes visible at glance |
| "Submit Your Theme" button | Build standard first |
| Customization panels | Themes are design opinions |
| Feature comparison tables | It's fashion, not enterprise software |

---

## Risk Register with Mitigations

| Risk | Likelihood | Impact | Mitigation | Task |
|------|------------|--------|------------|------|
| Screenshots don't capture magic | Medium | High | Use GIFs; Steve reviews before ship | phase-1-task-4 |
| 5 themes too ambitious | High | Medium | Phase rollout documented but NOT followed | Acknowledged |
| Install >3 seconds | Medium | Medium | Benchmark; optimize tarball size | phase-1-task-9 |
| Email endpoint not wired | Certain | Medium | Wire before launch (REQ-T1-004) | phase-1-task-5 |
| Themes drift from Emdash core | Medium | High | Automated compatibility tests | Future |
| R2 CDN not configured | Certain | Critical | Upload tarballs (REQ-T1-007) | phase-1-task-3 |

---

## Traceability Matrix

| Requirement | Board Condition | Task Plan |
|-------------|-----------------|-----------|
| REQ-T1-001 | Tier 1 #1 | phase-1-task-1 |
| REQ-T1-002 | Tier 1 #2 | phase-1-task-4 |
| REQ-T1-003 | Tier 1 #3 | phase-1-task-2 |
| REQ-T1-004 | Tier 1 #4 | phase-1-task-5 |
| REQ-T1-005 | Tier 1 #5 | phase-1-task-6 |
| REQ-T1-006 | Decision #8 | phase-1-task-7 |
| REQ-T1-007 | Decision #4 | phase-1-task-3 |

---

## Ship Test

> Does `npx wardrobe install ember` transform a site in under 3 seconds?
>
> Does seeing the transformed site make the user feel "I can't believe I just did that"?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/emdash-marketplace/decisions.md, docs/EMDASH-GUIDE.md*
*Project Slug: emdash-marketplace*
