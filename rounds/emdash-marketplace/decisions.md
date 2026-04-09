# Wardrobe — Consolidated Decisions

**Product:** Theme marketplace for Emdash CMS
**Debaters:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Board Reviewers:** Warren Buffett (Unit Economics), Shonda Rhimes (Narrative & Retention)
**Copy Review:** Maya Angelou
**Retrospective:** Marcus Aurelius
**Consolidated by:** Phil Jackson, April 8, 2026

---

## Board Verdict: HOLD

**Score:** 4.5/10 (Buffett: 5/10, Rhimes: 4/10)

The technical MVP is complete. The board has paused launch pending resolution of discovery, retention, and monetization gaps. This document captures what was decided, what must be built before launch, and what risks remain.

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
| Why | Elon conceded IF themes are "actually distinct." Range signals maturity. Emotional diversity (Drift: contemplative, Bloom: optimistic, Forge: aggressive) attracts different people, not the same people with different preferences. |

**LOCKED:** Ship 5 themes — Ember, Forge, Slate, Drift, Bloom

**RISK ACKNOWLEDGED:** Board review notes 5 themes may be overreach for one session. Mitigation: Phase rollout (ship 3, add 2 in follow-up). Priority order: Ember, Forge, Slate.

---

### 3. Preview Experience: Screenshots (Not Live Preview)

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** |
| Why | Steve wanted live preview with user's actual content ("the entire emotional transaction"). Elon demonstrated the cost: authenticated D1 access, per-theme rendering, 5 Workers deployments. That's 30 days of engineering for 0 users. Screenshots with strong copywriting ship in one session. |

**LOCKED:** V1 uses screenshots. Live preview is V2.

**COMPROMISE:** Steve's condition — screenshots must "capture the magic." Use GIFs showing transformation. Architect toward live preview; never abandon the goal.

---

### 4. Architecture: CLI-First, Static Infrastructure

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** |
| Why | Steve did not contest. The CLI IS the product. The website is marketing. Themes on R2/npm scale infinitely with zero ops. A Next.js marketplace introduces scale problems (caching, CDN, search) for no benefit at current user count (zero). |

**LOCKED:**
- CLI downloads tarball from R2/npm
- `themes.json` registry on CDN
- Static HTML showcase page

---

### 5. Install Speed: Sub-3-Second Target

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** (Steve agreed) |
| Why | 30-second install kills the magic. 3-second install preserves it. Unzipping a `src/` directory should take <3 seconds. Network latency and npm overhead are the only bottlenecks — eliminate them. |

**LOCKED:** Install completes in under 3 seconds.

---

### 6. Brand Voice & Copy

| Proposed By | Steve Jobs |
|-------------|------------|
| Winner | **Steve Jobs** (Elon agreed) |
| Why | Elon explicitly conceded: "Brand voice matters." The copy style is Steve's — confident friend with impeccable taste, not a manual. Short sentences. Active verbs. Zero jargon. |

**LOCKED:** Copy examples:
- "Ember is bold. Editorial. For people with something to say."
- "Install in one command. Your content stays untouched."
- "Try it on. If it doesn't fit, try another."

**COPY REVIEW (Maya Angelou):** Three lines flagged for revision:
1. ~~"Click the copy button or manually type the install command."~~ → "Copy the command. Paste it. You're done before you finish your coffee."
2. ~~"Slate is for enterprises...professional bearing."~~ → "Slate is for people who need to be trusted. Clean. Steady. The kind of design that lets the work speak first."
3. ~~"Pick a theme. Change your life. (At least your website's.)"~~ → "Pick a theme. Watch your site remember what it was meant to be."

---

### 7. Distribution: Themes in Core

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | **Elon Musk** (Steve called it "brilliant") |
| Why | Themes ship WITH Emdash, not adjacent. `emdash create --theme ember` is zero-friction. Marketplace is discovery; core is delivery. |

**LOCKED:** `emdash create --theme [name]` integrates themes into core product.

---

### 8. Marketplace Website vs. README

| Proposed By | Contested |
|-------------|-----------|
| Winner | **Neither** — flexible execution |
| Why | Steve's concession: "If we ship a gorgeous README with GIFs that capture the magic, I can live with that." Elon's position: static page or README, whatever ships. |

**DECISION:** Ship a single static HTML showcase page. Fallback: README with GIFs.

**BOARD OVERRIDE:** Buffett and Rhimes BOTH require a deployed showcase website before launch. A README is insufficient for discovery. This is now a **launch blocker**.

---

### 9. What Was Cut (V2 Features Disguised as V1)

| Feature | Status | Reason |
|---------|--------|--------|
| Live preview server | CUT | Requires auth, D1 injection, 5 Workers deployments |
| Live demo sites per theme | CUT | 5x maintenance, will drift from actual theme state |
| User accounts | CUT | Zero value when installing via CLI |
| Theme ratings/reviews | CUT | Curation IS the quality signal at 5 themes |
| Search/filtering | CUT | 5 themes visible at a glance |
| "Submit Your Theme" | CUT | Curate ruthlessly before opening gates |
| Pricing tiers | CUT | Free. Adoption is the only metric. |

---

## MVP Feature Set (V1 Ships This)

### CLI: `wardrobe`
- `npx wardrobe list` — fetches themes.json, displays available themes
- `npx wardrobe install [theme]` — downloads tarball, swaps `src/`, <3 seconds
- `npx wardrobe preview [theme]` — opens theme screenshots in browser

### Themes (5)

| Theme | Personality | Target User |
|-------|-------------|-------------|
| **Ember** | Bold, editorial | "For people with something to say" |
| **Forge** | Dark, technical | "Built for builders" |
| **Slate** | Clean, professional | "Trust at first glance" |
| **Drift** | Minimal, airy | "Let your content breathe" |
| **Bloom** | Warm, organic | "Where community feels at home" |

### Showcase
- Static HTML page with 5 theme cards
- Each card: screenshot/GIF, Steve's copywriting, install command
- One-click copy for `npx wardrobe install [theme]`
- Mobile-responsive, SEO-optimized (per board requirements)

### Core Integration
- `emdash create --theme [name]` scaffolds with chosen theme

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
│       └── extract.ts        # Tarball extraction
│
├── themes/
│   ├── ember/
│   │   └── src/              # Full src/ directory
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
│   └── screenshots/          # Theme preview images
│       ├── ember.png (or .gif)
│       ├── forge.png
│       ├── slate.png
│       ├── drift.png
│       └── bloom.png
│
└── README.md                  # Documentation + fallback showcase
```

---

## Open Questions (Needs Resolution)

### 1. Where do themes live?
| Option | Pros | Cons |
|--------|------|------|
| **A: npm packages** (`@wardrobe/ember`) | Versioning, familiar tooling | Slower install, npm overhead |
| **B: R2 bucket tarballs** | Fast, CDN-backed | Manual versioning |
| **C: Embedded in CLI** | Instant (zero network) | Large CLI package, stale themes |

**Recommended:** Option B (R2 tarballs) for V1. Architect for npm migration in V2.

### 2. How does `emdash create --theme` integrate?
- Does Emdash core depend on Wardrobe CLI?
- Or does Emdash bundle themes directly?
- Who owns the integration code?

**Needs decision from Emdash core team.**

### 3. Screenshot generation
- Manual screenshots per theme? (fragile)
- Automated via Playwright/Puppeteer? (reliable)
- Who designs the "demo content" shown in screenshots?

**Recommended:** Automated generation with standardized demo content.

### 4. Theme structure contract
- What exactly is in each theme's `src/` directory?
- Complete replacement or merge?
- What files must themes provide vs. inherit from base?

**Must be defined before build.**

### 5. Versioning strategy
- How do theme updates work?
- Does `wardrobe install` always get latest?
- Is there a lockfile or version pinning?

**Recommended:** Always latest for V1. Lockfile for V2.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Screenshots don't capture magic** | Medium | High | Use GIFs showing transformation. Steve reviews all assets before ship. |
| **5 themes too ambitious for one session** | High | Medium | Phase rollout: ship Ember, Forge, Slate first. Add Drift, Bloom in follow-up. |
| **Install >3 seconds** | Medium | Medium | Embed themes in CLI or use aggressive caching. Benchmark before ship. |
| **Themes drift from Emdash core** | Medium | High | Define clear `src/` contract. Automated tests that themes build successfully. |
| **No users to discover product** | Certain | Critical | Deploy showcase website. Board blocker. |
| **No retention mechanism** | Certain | High | Add "Coming Soon" themes. Email capture. Per Shonda's retention roadmap. |
| **No revenue model** | Certain | Medium | Build pricing rails. Display "Premium themes coming Q3 2026." Per Buffett. |
| **Name collision (`wardrobe` on npm)** | Low | Low | Check npm availability before committing. |

---

## Board Conditions for Launch

### Must-Have (BLOCKERS)

| Condition | Owner | Status |
|-----------|-------|--------|
| **Marketplace showcase website (deployed)** | Product/Design | NOT DONE |
| **Basic analytics (anonymous install tracking)** | Engineering | NOT DONE |
| **"Coming Soon" themes (3+ teased)** | Product | NOT DONE |

### Should-Have (Strong Recommendations)

| Condition | Owner | Status |
|-----------|-------|--------|
| Pricing page / premium theme rails | Product/Engineering | NOT DONE |
| Theme submission intake form | Product | NOT DONE |
| Email capture ("Get notified when new themes drop") | Marketing | NOT DONE |

### Timeline to Re-Review

| Milestone | Target |
|-----------|--------|
| Showcase website deployed | +2 weeks |
| Analytics instrumented | +2 weeks |
| Coming Soon themes added | +1 week |
| Pricing page live | +3 weeks |
| **Board re-review** | +3 weeks |

---

## The Essence (For Build Phase)

> **One command transforms your site into something beautiful — your content stays, only the skin changes.**

**The feeling:** "I can't believe I just did that."

**The moment that must be perfect:** Seeing YOUR content wearing a new theme.

**Creative direction:** Instant dignity.

---

## Synthesis

**What was debated:**
- Name (Steve won: "Wardrobe")
- Theme count (Steve won: 5 themes)
- Preview method (Elon won: screenshots, not live)
- Architecture (Elon won: CLI-first, static infra)
- Copy voice (Steve won: human, confident, zero jargon)
- Distribution (Elon won: themes in core)

**What both agreed on:**
- No user accounts
- No ratings/reviews
- No customization panels
- No "Submit Your Theme" at launch
- Speed matters (<3 second install)
- Curation over democracy

**What the board added:**
- Discovery is a blocker (showcase website)
- Retention needs hooks (Coming Soon, email capture)
- Monetization rails should exist (even if themes are free)

**The formula:**

> **Elon's architecture + Steve's soul + Board's launch conditions = Wardrobe V1**

---

## Sign-Off

**Steve Jobs' non-negotiables, preserved:**
- Wardrobe name ✓
- Five themes with emotional range ✓
- Copy that sounds human ✓
- Architecture toward live preview ✓

**Elon Musk's non-negotiables, preserved:**
- No live preview infrastructure in V1 ✓
- CLI-first distribution ✓
- Ships in one session ✓
- Static infrastructure only ✓

**Board's conditions, acknowledged:**
- Showcase website required ⚠️
- Analytics required ⚠️
- Coming Soon themes required ⚠️

---

**Build Status:** Technical MVP complete. Launch HELD pending board conditions.

**Next Action:** Address blockers, return for board re-review in 3 weeks.

---

*This document is the blueprint. Build what's missing. Then ship.*

— Phil Jackson
April 8, 2026
