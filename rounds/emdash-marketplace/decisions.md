# Wardrobe — Locked Decisions

**Product:** Theme marketplace for Emdash
**Debate Participants:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Consolidated by:** Phil Jackson, April 8

---

## Decision Log

### 1. Product Name: "Wardrobe"

| Proposed By | Steve Jobs |
|-------------|------------|
| Winner | Steve Jobs |
| Why | Elon conceded. "Wardrobe" is evocative, memorable, and human. "Emdash Theme Marketplace" is a description, not an identity. CLI aesthetics matter: `npx wardrobe install ember` feels intentional; `npx emdash-themes install ember` feels auto-generated. Word-of-mouth requires a name people can actually say. |

**LOCKED:** CLI command is `npx wardrobe install [theme]`

---

### 2. Theme Count: Five Themes

| Proposed By | Steve Jobs (5) vs. Elon Musk (3) |
|-------------|----------------------------------|
| Winner | Steve Jobs |
| Why | Elon conceded IF themes are "actually distinct." Steve's argument: range signals maturity and trust. Emotional range matters—Drift (contemplative), Bloom (optimistic), Forge (aggressive) attract *different people*, not the same people with different preferences. |

**LOCKED:** Ship 5 themes: Ember, Forge, Slate, Drift, Bloom

---

### 3. Preview Experience: Screenshots (Not Live Preview)

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | Elon Musk |
| Why | Steve wanted live preview with user's actual content ("the entire emotional transaction"). Elon demonstrated this requires: authenticated D1 access, per-theme rendering environments, server-side injection, 5 separate deployments. That's 30 days of engineering for 0 users. Screenshots with strong copywriting ship in one session. |

**LOCKED:** V1 uses screenshots. Live preview is V2.

**COMPROMISE:** Steve's condition—screenshots must "capture the magic." Architect toward live preview; never abandon the goal.

---

### 4. Architecture: CLI-First, Static Infrastructure

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | Elon Musk |
| Why | Steve didn't contest this hard. The CLI IS the product. The website is marketing. Themes on R2/npm scale infinitely with zero ops. A Next.js marketplace app introduces scale problems (caching, CDN, search) for no benefit at current user count. |

**LOCKED:**
- CLI downloads tarball from R2/npm
- Themes.json registry on CDN
- Static HTML showcase page (or gorgeous README)

---

### 5. Install Speed: Sub-3-Second Target

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | Elon Musk (Steve agreed) |
| Why | 30-second install is failure. Unzipping a `src/` directory should take <3 seconds. Network latency and npm overhead are the only bottlenecks—eliminate them. |

**LOCKED:** Install completes in under 3 seconds.

---

### 6. Brand Voice & Copy

| Proposed By | Steve Jobs |
|-------------|------------|
| Winner | Steve Jobs (Elon agreed) |
| Why | Elon explicitly conceded: "Brand voice matters." The copy style is Steve's—confident friend who works in fashion, not a manual. Short sentences. Active verbs. Zero jargon. |

**LOCKED:** Copy examples:
- "Ember is bold. Editorial. For people with something to say."
- "Install in one command. Your content stays untouched."
- "Try it on. If it doesn't fit, try another."

---

### 7. Distribution: Themes in Core

| Proposed By | Elon Musk |
|-------------|-----------|
| Winner | Elon Musk (Steve agreed) |
| Why | Steve called it "brilliant." Themes ship WITH Emdash, not adjacent to it. `emdash create --theme ember` is zero-friction. Marketplace is discovery; core is delivery. |

**LOCKED:** `emdash create --theme [name]` integrates themes into core product.

---

### 8. Marketplace Website vs. README

| Proposed By | Contested |
|-------------|-----------|
| Winner | Neither (flexible) |
| Why | Steve's concession: "If we ship a gorgeous README with GIFs that capture the magic, I can live with that." Elon's position: static page or README, whatever ships. |

**DECISION:** Ship a single static HTML showcase page. If that's not feasible, README with GIFs. The bar: it must evoke "I can't believe I just did that."

---

### 9. What to Cut (V2 Features Disguised as V1)

| Feature | Decision | Reason |
|---------|----------|--------|
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
- `npx wardrobe preview [theme]` — opens theme README/screenshots in browser

### Themes (5)
| Theme | Personality | Emotional Range |
|-------|-------------|-----------------|
| Ember | Bold, editorial | Confident, authoritative |
| Forge | Dark, technical | Aggressive, cutting-edge |
| Slate | Clean, corporate | Professional, trustworthy |
| Drift | Minimal, airy | Contemplative, calm |
| Bloom | Warm, organic | Optimistic, inviting |

### Showcase
- Static HTML page with 5 theme cards
- Each card: screenshot, Steve's copywriting, install command
- One-click copy for `npx wardrobe install [theme]`
- Alternative: README.md with GIFs if static page not feasible

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
│       ├── ember.png
│       ├── forge.png
│       ├── slate.png
│       ├── drift.png
│       └── bloom.png
│
└── README.md                  # Fallback showcase with GIFs
```

---

## Open Questions (Needs Resolution)

### 1. Where do themes live?
- **Option A:** npm packages (`@wardrobe/ember`, `@wardrobe/forge`, etc.)
- **Option B:** R2 bucket with tarballs
- **Option C:** Embedded in CLI itself (Elon's "10x path" — zero network calls)

**Decision needed:** Trade-off between update flexibility (npm/R2) vs. instant install (embedded).

### 2. How does `emdash create --theme` work?
- Does Emdash core depend on Wardrobe CLI?
- Or does Emdash bundle themes directly?
- Who owns the integration code?

### 3. Screenshot generation
- Manual screenshots per theme?
- Automated via Playwright/Puppeteer?
- Who designs the "demo content" shown in screenshots?

### 4. Theme structure contract
- What exactly is in each theme's `src/` directory?
- Is it a complete replacement or a merge?
- What files must themes provide vs. inherit from base?

### 5. Versioning
- How do theme updates work?
- Does `wardrobe install` always get latest?
- Is there a lockfile or version pinning?

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Screenshots don't capture magic** | Medium | High | Use GIFs showing transformation. Steve reviews all assets before ship. |
| **5 themes too ambitious for one session** | High | Medium | Phase rollout: ship 3, add 2 in follow-up. Prioritize Ember, Forge, Slate. |
| **Install >3 seconds** | Medium | Medium | Embed themes in CLI or use aggressive caching. Benchmark before ship. |
| **Themes drift from Emdash core** | Medium | High | Define clear `src/` contract. Automated tests that themes build successfully. |
| **No users to test with** | Certain | Low | Dogfood internally. Ship anyway—themes improve Emdash core value prop. |
| **Name collision** | Low | Low | Check npm for `wardrobe` package availability before committing. |
| **Community theme submissions** | N/A (V2) | N/A | Explicitly deferred. No submission process in V1. |

---

## The Essence (For Build Phase)

> **One command transforms your site into something beautiful—your content stays, only the skin changes.**

The feeling: "I can't believe I just did that."

The moment that must be perfect: Seeing YOUR content wearing a new theme.

The creative direction: **Instant dignity.**

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

**The synthesis:** Elon's architecture, Steve's soul.

---

*This document is the blueprint. Build this.*
