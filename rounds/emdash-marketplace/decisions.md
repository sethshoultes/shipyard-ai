# Wardrobe — Consolidated Decisions

**Product:** Theme marketplace for Emdash CMS
**Debaters:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Board Reviewers:** Warren Buffett, Jensen Huang, Oprah Winfrey, Shonda Rhimes
**Copy Review:** Maya Angelou
**Retrospective:** Marcus Aurelius
**Consolidated by:** Phil Jackson, April 11, 2026

---

## Board Verdict: PROCEED (Conditional)

**Aggregate Score:** 6/10

| Reviewer | Score | One-Line Summary |
|----------|-------|------------------|
| Warren Buffett | 5/10 | "A well-built feature masquerading as a business" |
| Jensen Huang | 5/10 | "Theme picker pretending to be a marketplace" |
| Oprah Winfrey | 8/10 | "Genuine emotional resonance, needs visual proof and accessibility" |
| Shonda Rhimes | 6/10 | "Clean pilot with no reason to return for episode two" |

**Rationale:** The product demonstrates strong fundamentals — clean execution, capital efficiency, exceptional emotional language. The 8/10 from Oprah suggests product-market fit exists. However, structural gaps around monetization, retention, and platform architecture must be addressed before scale.

---

## Decision Log

### 1. Product Name: "Wardrobe"

| Proposed By | Steve Jobs |
|-------------|------------|
| Winner | **Steve Jobs** |
| Why | Elon conceded. "Wardrobe" is evocative, memorable, human. `npx wardrobe install ember` is tweetable; `npx emdash-themes install ember` is forgettable. Names are the distribution strategy when marketing budget is zero. |

**LOCKED:** `npx wardrobe install [theme]`

---

### 2. Theme Count: Five Themes

| Proposed By | Steve Jobs (5) vs. Elon Musk (3) |
|-------------|----------------------------------|
| Winner | **Steve Jobs** |
| Why | Three themes feels like a test. Five feels like a collection. The difference between "some options" and "a curated selection" is the difference between a gas station and a boutique. Emotional diversity (Drift: contemplative, Bloom: optimistic, Forge: aggressive) attracts different people, not the same people with different preferences. |

**LOCKED:** Ship 5 themes — Ember, Forge, Slate, Drift, Bloom

**RISK ACKNOWLEDGED:** Risk register documented 5 themes as high-likelihood overreach. Mitigation: Phase rollout (ship Ember, Forge, Slate first; add Drift and Bloom in follow-up). **Note:** The mitigation was documented but not followed. Marcus Aurelius flagged this in retrospective.

---

### 3. Preview Experience: Screenshots (Not Live Preview)

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** |
| Why | Steve wanted live preview with user's actual content ("YOUR content appears inside it. Immediately."). Elon demonstrated the cost: authenticated D1 access, per-theme rendering, 5 Workers deployments. That's 30+ days of engineering for zero users. Screenshots with strong copywriting ship in one session. |

**LOCKED:** V1 uses screenshots. Live preview is V2.

**COMPROMISE:** Steve's condition — screenshots must "capture the magic." Architecture toward live preview; never abandon the goal.

**BOARD ADDITION (Jensen):** AI-powered "preview with YOUR content" should be Tier 2 priority. This is the "money shot" — seeing your D1 content rendered in a theme before installing.

---

### 4. Architecture: CLI-First, Static Infrastructure

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** |
| Why | The CLI IS the product. The website is marketing. Themes on R2/npm scale infinitely with zero ops. A Next.js marketplace introduces scale problems for no benefit at current user count (zero). |

**LOCKED:**
- CLI downloads tarball from R2/npm
- `themes.json` registry on CDN
- Static HTML showcase page
- No backend infrastructure for core flow

---

### 5. Install Speed: Sub-3-Second Target

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** (Steve agreed) |
| Why | 30-second install kills the magic. The transformation must feel instant. Unzipping a `src/` directory should take <3 seconds. Network latency and npm overhead are the only bottlenecks. |

**LOCKED:** Install completes in under 3 seconds.

---

### 6. Brand Voice & Copy

| Proposed By | Steve Jobs |
|-------------|------------|
| Winner | **Steve Jobs** (Elon explicitly agreed) |
| Why | Elon conceded: "The theme descriptions should feel like Steve wrote them." The copy style is Steve's — confident friend with impeccable taste, not a manual. Short sentences. Active verbs. Zero jargon. If we see "seamlessly" or "leverage" or "robust solution" anywhere, Steve will personally set it on fire. |

**LOCKED Copy Examples:**
- "Ember. Bold. Editorial. For people with something to say."
- "Forge. Dark and technical. Built for builders."
- "Your site is now wearing ember. Try it on. If it doesn't fit, try another."
- "Instant dignity for your Emdash site."

**COPY REVIEW (Maya Angelou) — Three Rewrites:**

| Original | Rewrite | Why |
|----------|---------|-----|
| "Click the copy button or manually type the install command." | "Copy the command. Paste it. You're done before you finish your coffee." | Functional but lifeless. Instructions can still have music. |
| "Slate is for enterprises...professional bearing." | "Slate is for people who need to be trusted. Clean. Steady. The kind of design that lets the work speak first." | Corporate-speak describes categories, not feelings. No one wakes up wanting "professional bearing." |
| "Pick a theme. Change your life. (At least your website's.)" | "Pick a theme. Watch your site remember what it was meant to be." | The parenthetical undermines itself. Don't laugh at your own joke before anyone else can. |

---

### 7. Distribution: Themes in Core

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** (Steve called it "brilliant") |
| Why | Themes ship WITH Emdash, not adjacent. `emdash create --theme ember` is zero-friction. Nobody Googles "theme marketplace for static site generator they installed yesterday." They run `emdash --help` and see `--theme ember`. Discovery IS the install flow. |

**LOCKED:** `emdash create --theme [name]` integrates themes into core product.

---

### 8. Marketplace Website vs. README

| Proposed By | Contested |
|-------------|-----------|
| Winner | **Steve Jobs (with board enforcement)** |
| Why | Elon argued a README works for 5 themes. Steve insisted: "A README with screenshots isn't a product. It's homework. The URL you share must be beautiful because the URL IS the marketing." |

**LOCKED:** Single static HTML showcase page hosted on Cloudflare Pages.

**BOARD OVERRIDE:** All four board members require a deployed showcase website before launch. A README is insufficient for discovery. This is a **launch blocker**.

---

### 9. What Was Cut (V2 Features Disguised as V1)

| Feature | Status | Reason | Who Cut It |
|---------|--------|--------|------------|
| Live preview server | CUT | Requires auth, D1 injection, 5 Workers deployments — 30+ days of engineering | Elon (Steve conceded) |
| Live demo sites per theme | CUT | 5x maintenance, will drift from actual theme state | Elon (Steve conceded) |
| User accounts | CUT | Zero value when installing via CLI. An account is a wall between someone and their beautiful new website. | Both agreed |
| Theme ratings/reviews | CUT | Curation IS the quality signal at 5 themes. We're not Amazon. | Both agreed |
| Search/filtering | CUT | 5 themes visible at a glance. Search is an admission of chaos. | Both agreed |
| "Submit Your Theme" button | CUT | Build the standard first. Then maybe invite others in. | Steve proposed, Elon agreed |
| Customization panels | CUT | Themes are design opinions. If you want to change everything, use code. Don't dilute the vision. | Steve proposed, Elon agreed |
| Feature comparison tables | CUT | This isn't enterprise software. It's fashion. You KNOW what looks good on you. | Steve |

---

## MVP Feature Set (V1 Ships This)

### CLI: `wardrobe`

| Command | Function |
|---------|----------|
| `npx wardrobe list` | Fetches themes.json, displays available themes with descriptions |
| `npx wardrobe install [theme]` | Downloads tarball, backs up existing `src/`, swaps in theme `src/`, <3 seconds |
| `npx wardrobe preview [theme]` | Opens theme screenshots/showcase in browser |

### Five Themes

| Theme | Personality | Identity Statement | Target |
|-------|-------------|-------------------|--------|
| **Ember** | Bold, editorial | "For people with something to say" | Writers, thought leaders, publications |
| **Forge** | Dark, technical | "Built for builders" | Developers, technical writers, engineers |
| **Slate** | Clean, professional | "Trust at first glance" | Businesses, consultants, agencies |
| **Drift** | Minimal, airy | "Let your content breathe" | Photographers, artists, minimalists |
| **Bloom** | Warm, organic | "Where community feels at home" | Community spaces, bakeries, local businesses |

### Showcase Website

- Static HTML page with 5 theme cards
- Each card: screenshot/GIF, Steve's copywriting, one-click copy for install command
- Mobile-responsive, accessible (WCAG 2.1 AA)
- Hosted on Cloudflare Pages
- Email capture for "Coming Soon" themes (must be wired)

### Core Integration

- `emdash create --theme [name]` scaffolds with chosen theme

### Install Experience

Success message:
```
Your site is now wearing ember.

Try it on. If it doesn't fit, try another.

Installed in 2.34s
```

---

## File Structure (What Gets Built)

```
wardrobe/
├── cli/
│   ├── index.ts              # CLI entry point
│   ├── commands/
│   │   ├── list.ts           # List available themes
│   │   ├── install.ts        # Download and swap src/
│   │   └── preview.ts        # Open theme preview
│   └── utils/
│       ├── fetch-registry.ts # Fetch themes.json
│       ├── extract.ts        # Tarball extraction
│       └── backup.ts         # Create src.backup/
│
├── themes/
│   ├── ember/
│   │   ├── src/              # Full src/ directory
│   │   └── README.md         # Theme-specific docs
│   ├── forge/
│   │   └── src/
│   ├── slate/
│   │   └── src/
│   ├── drift/
│   │   └── src/
│   └── bloom/
│       └── src/
│
├── registry/
│   └── themes.json           # Theme metadata, URLs, descriptions
│
├── showcase/
│   ├── index.html            # Static showcase page
│   ├── styles.css            # Showcase styling
│   ├── app.js                # Copy-to-clipboard, interactions
│   └── screenshots/          # Theme preview images
│       ├── ember.png (or .gif)
│       ├── forge.png
│       ├── slate.png
│       ├── drift.png
│       └── bloom.png
│
├── workers/
│   └── email-capture/        # Cloudflare Worker for email signups
│       └── index.ts
│
└── README.md                  # Documentation
```

---

## Open Questions (Needs Resolution)

### 1. Theme Storage Location

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **npm packages** (`@wardrobe/ember`) | Versioning, familiar tooling, ecosystem | Slower install, npm overhead | V2 |
| **R2 bucket tarballs** | Fast, CDN-backed, simple | Manual versioning | **V1** |
| **Embedded in CLI** | Instant (zero network) | Large CLI package, stale themes | Not recommended |

**Decision needed:** Confirm R2 tarballs for V1.

### 2. Emdash Core Integration

- Does Emdash core depend on Wardrobe CLI?
- Or does Emdash bundle themes directly?
- Who owns the integration code?

**Decision needed from Emdash core team.**

### 3. Screenshot Generation

| Option | Pros | Cons |
|--------|------|------|
| Manual screenshots | Control | Fragile, labor-intensive |
| Automated (Playwright) | Reliable, reproducible | Setup overhead |

**Recommended:** Automated generation with standardized demo content.

### 4. Theme Structure Contract

What exactly must each theme's `src/` directory contain?
- Complete replacement or merge with existing?
- Required vs. optional files?
- Relationship to Emdash starter template?

**Must be defined before build.**

### 5. Versioning Strategy

| Question | V1 Answer | V2 Answer |
|----------|-----------|-----------|
| How do theme updates work? | `wardrobe install` always gets latest | Version pinning |
| Is there a lockfile? | No | Yes (`.wardrobe/versions.json`) |
| Update notifications? | No | `wardrobe list` shows available updates |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **No discovery mechanism** | Certain | Critical | Deploy showcase website before launch | Product |
| **No retention mechanism** | Certain | High | Coming Soon themes, email capture, per Shonda's roadmap | Product |
| **No revenue model** | Certain | Medium | Build pricing rails. Display "Premium themes coming Q3 2026." | Product |
| **Screenshots don't capture magic** | Medium | High | Use GIFs showing transformation. Steve reviews all assets before ship. | Design |
| **5 themes too ambitious for one session** | High | Medium | Phase rollout: Ember, Forge, Slate first. | Engineering |
| **Install >3 seconds** | Medium | Medium | Benchmark before ship. Optimize tarball size. | Engineering |
| **Themes drift from Emdash core** | Medium | High | Define clear `src/` contract. Automated tests that themes build successfully. | Engineering |
| **Email endpoint not wired** | Certain | Medium | Wire worker before launch. Placeholder URLs are lies dressed as features. | Engineering |
| **CLI-only excludes non-technical users** | High | Medium | Consider web-based install flow in V2 (Oprah's concern) | Product |
| **No competitive moat** | High | High | Build toward network effects: community themes, site gallery, creator tools | Strategy |
| **No AI leverage** | Certain | Medium | Roadmap AI theme generation and content-aware preview for V2 | Engineering |

---

## Board Conditions for Launch

### Tier 1: Required for Launch (This Sprint)

| # | Condition | Why | Status |
|---|-----------|-----|--------|
| 1 | **Deploy live demo sites** — Each theme must have a working preview URL prominently featured | Oprah, Shonda: The aha moment happens off-screen | NOT DONE |
| 2 | **Add real screenshots** — Replace SVG placeholders with actual site images | Oprah: People can't see themselves in placeholders | NOT DONE |
| 3 | **Post-install reveal** — CLI offers to open transformed site or prints clear localhost URL | Shonda: Show the climax, don't cut away | NOT DONE |
| 4 | **Wire email capture** — The worker code exists; deploy it and confirm data practices | Shonda, Oprah: Promise made must be kept | NOT DONE |
| 5 | **Anonymous install telemetry** — Track which themes are installed | Buffett: Know your users | NOT DONE |

### Tier 2: Required Before Paid Themes (Next Sprint)

| # | Condition | Why | Status |
|---|-----------|-----|--------|
| 6 | **Build pricing rails** — Infrastructure for paid themes, even if all free now | Buffett: Can't have marketplace without commerce | NOT DONE |
| 7 | **Theme creator guidelines** — Public documentation for third-party submissions | Jensen, Buffett: Platform needs creators | NOT DONE |
| 8 | **Post-install engagement email** — "You're wearing Ember. Here's how to customize it." | Shonda: Create ongoing relationship | NOT DONE |
| 9 | **User content preview** — Let users see THEIR content in a theme before installing | Jensen: The money shot | NOT DONE |

### Tier 3: Required for Platform Status (This Quarter)

| # | Condition | Why | Status |
|---|-----------|-----|--------|
| 10 | **Theme versioning and updates** — `wardrobe list` shows installed vs. latest | Shonda: Reason to return | NOT DONE |
| 11 | **Site gallery** — Showcase of real sites using each theme | Shonda, Oprah: Social proof + flywheel | NOT DONE |
| 12 | **Creator submission pipeline** — Automated validation, revenue share model | Jensen, Buffett: Platform economics | NOT DONE |
| 13 | **AI theme preview** — Render user's D1 content into theme before install | Jensen: 10x leverage | NOT DONE |
| 14 | **10+ themes at scale** — Expand catalog through community or internal effort | Buffett: 5 feels sparse | NOT DONE |

---

## Coming Soon Themes (V1 Roadmap)

| Theme | Personality | Release Target |
|-------|-------------|----------------|
| **Aurora** | "For brands that refuse to blend in" | Summer 2026 |
| **Chronicle** | "Stories deserve dignity" | Fall 2026 |
| **Neon** | "The future is now" | Summer 2026 |
| **Haven** | "Home on the internet" | Fall 2026 |

**Purpose:** Creates anticipation (season cliffhanger). Email capture tied to release notifications.

---

## Synthesis: Who Won What

### Steve Jobs Won:

| Decision | Why It Mattered |
|----------|-----------------|
| "Wardrobe" name | Distribution-ready when budget is zero |
| 5 themes | Emotional range creates collection, not test |
| Brand voice | Technology that feels human |
| Showcase website | The URL IS the marketing |

### Elon Musk Won:

| Decision | Why It Mattered |
|----------|-----------------|
| Screenshots (not live preview) | Ships in one session, not one month |
| CLI-first architecture | The product is the command, not the website |
| Static infrastructure | Zero ops, infinite scale |
| Themes in core | Discovery is the install flow |

### Both Agreed:

- No user accounts
- No ratings/reviews
- No customization panels
- No "Submit Your Theme" at launch
- Speed matters (<3 second install)
- Curation over democracy

### Board Added:

- Discovery is a blocker (showcase website)
- Retention needs hooks (Coming Soon, email capture, post-install emails)
- Monetization rails should exist
- AI leverage is missing (Jensen)
- Non-technical user path needed (Oprah)
- Post-install reveal required (Shonda)

---

## The Essence (For Build Phase)

> **One command transforms your site into something beautiful — your content stays, only the skin changes.**

**The feeling:** "I can't believe I just did that."

**The moment that must be perfect:** Seeing YOUR content wearing a new theme.

**Creative direction:** Instant dignity.

---

## Timeline to Re-Review

| Milestone | Target |
|-----------|--------|
| Tier 1 conditions complete | +2 weeks |
| At least 3 Tier 2 conditions in progress | +4 weeks |
| Documented roadmap for Tier 3 | +4 weeks |
| **Board re-review** | End of Q2 2026 |

**If conditions are not met:** Reclassify as HOLD and reduce resource allocation.

---

## Final Word

The team executed cleanly on the spec. But the spec was incomplete.

Wardrobe has the rarest quality in technology: emotional intelligence. The team understands that people don't want a theme — they want to feel confident about who they are online. "Instant dignity for your Emdash site" is not just a tagline; it's a promise worth keeping.

But promises require infrastructure. The emotional language writes checks that the current architecture can't cash. Five themes downloaded anonymously with no retention loop is a movie, not a franchise.

**The foundation is exceptional. Now build the house.**

---

**Formula:**

> **Elon's architecture + Steve's soul + Board's launch conditions = Wardrobe V1**

---

**Build Status:** Technical MVP complete. Launch CONDITIONAL pending Tier 1 blockers.

**Next Action:** Address Tier 1 blockers, then return for board re-review.

---

*This document is the blueprint for the build phase. Be precise.*

— Phil Jackson
April 11, 2026
