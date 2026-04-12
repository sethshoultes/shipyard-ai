# Wardrobe — Consolidated Decisions

**Product:** Theme Marketplace for Emdash CMS
**Debaters:** Steve Jobs (Design & Brand), Elon Musk (Product & Growth)
**Board Reviewers:** Warren Buffett, Jensen Huang, Oprah Winfrey, Shonda Rhimes
**Design Review:** Jony Ive
**Copy Review:** Maya Angelou
**QA:** Margaret Hamilton
**Retrospective:** Marcus Aurelius
**Consolidated by:** Phil Jackson
**Date:** April 12, 2026

---

## Board Verdict: PROCEED (Conditional)

**Aggregate Score:** 6/10

| Reviewer | Score | One-Line Verdict |
|----------|-------|------------------|
| Warren Buffett | 5/10 | "A well-built feature masquerading as a business" |
| Jensen Huang | 5/10 | "Theme picker pretending to be a marketplace" |
| Oprah Winfrey | 8/10 | "Genuine emotional resonance, needs visual proof and accessibility" |
| Shonda Rhimes | 6/10 | "Clean pilot with no reason to return for episode two" |

**QA Status:** BLOCK — 7 P0 infrastructure blockers prevent deployment.

---

## Locked Decisions

### 1. Product Name: "Wardrobe"

| Proposed By | Steve Jobs |
|-------------|------------|
| **Winner** | **Steve Jobs** |
| **Why** | `npx wardrobe install ember` is tweetable. `npx emdash-themes install ember` is forgettable. Names ARE the distribution strategy when marketing budget is zero. Elon explicitly conceded this point. |

**LOCKED:** `npx wardrobe install [theme]`

---

### 2. Theme Count: Five Themes

| Position | Steve Jobs: 5 themes | Elon Musk: 3 themes |
|----------|---------------------|---------------------|
| **Winner** | **Steve Jobs** |
| **Why** | Three themes feels like a test. Five feels like a collection. The emotional range (Drift: contemplative, Bloom: optimistic, Forge: aggressive) attracts different people, not the same people with different preferences. |

**LOCKED:** Ship 5 themes — Ember, Forge, Slate, Drift, Bloom

**RISK NOTE (Marcus Aurelius):** Risk register documented 5 themes as high-likelihood overreach with mitigation "phase rollout." The mitigation was documented but not followed. Future builds should honor documented mitigations or explicitly document the override.

---

### 3. Preview Experience: Screenshots (Not Live Preview)

| Position | Steve Jobs: Live preview | Elon Musk: Screenshots |
|----------|-------------------------|------------------------|
| **Winner** | **Elon Musk** |
| **Why** | Live preview requires authenticated D1 access, per-theme rendering, 5 Workers deployments — 30+ days of engineering for zero users. Screenshots with strong copywriting ship in one session. |

**LOCKED:** V1 uses screenshots. Live preview is V2.

**COMPROMISE:** Screenshots must "capture the magic." Architecture toward live preview; never abandon the goal.

**BOARD PRIORITY (Jensen):** AI-powered "preview with YOUR content" should be Tier 2. This is the "money shot."

---

### 4. Architecture: CLI-First, Static Infrastructure

| Proposed By | Elon Musk |
|-------------|-----------|
| **Winner** | **Elon Musk** |
| **Why** | The CLI IS the product. The website is marketing. Themes on R2 scale infinitely with zero ops. A Next.js marketplace introduces scale problems for no benefit at current user count. |

**LOCKED:**
- CLI downloads tarball from R2
- `themes.json` registry on CDN
- Static HTML showcase page
- No backend infrastructure for core flow

---

### 5. Install Speed: Sub-3-Second Target

| Proposed By | Elon Musk |
|-------------|-----------|
| **Winner** | **Elon Musk** (Steve agreed) |
| **Why** | 30-second install kills the magic. Transformation must feel instant. Network latency and tarball extraction are the only bottlenecks. |

**LOCKED:** Install completes in under 3 seconds.

**QA VERIFIED:** Install.ts implements progress bar, backup/restore, telemetry. Expected ~2.4s based on demo script.

---

### 6. Brand Voice & Copy

| Proposed By | Steve Jobs |
|-------------|------------|
| **Winner** | **Steve Jobs** (Elon explicitly agreed) |
| **Why** | "The theme descriptions should feel like Steve wrote them." Confident friend with impeccable taste, not a manual. Short sentences. Active verbs. Zero jargon. |

**LOCKED Copy:**
- "Ember. Bold. Editorial. For people with something to say."
- "Forge. Dark and technical. Built for builders."
- "Your site is now wearing ember. Try it on. If it doesn't fit, try another."
- "Instant dignity for your Emdash site."

**COPY FIXES (Maya Angelou):**

| Original | Rewrite |
|----------|---------|
| "Click the copy button or manually type the install command." | "Copy the command. Paste it. You're done before you finish your coffee." |
| "Slate is for enterprises...professional bearing." | "Slate is for people who need to be trusted. Clean. Steady. The kind of design that lets the work speak first." |
| "Pick a theme. Change your life. (At least your website's.)" | "Pick a theme. Watch your site remember what it was meant to be." |

---

### 7. Distribution: Themes in Core

| Proposed By | Elon Musk |
|-------------|-----------|
| **Winner** | **Elon Musk** (Steve called it "brilliant") |
| **Why** | Themes ship WITH Emdash, not adjacent. `emdash create --theme ember` is zero-friction. Nobody Googles "theme marketplace" for a CMS they installed yesterday. They run `emdash --help` and see `--theme ember`. Discovery IS the install flow. |

**LOCKED:** `emdash create --theme [name]` integrates themes into core product.

---

### 8. Marketplace Website

| Position | Elon: README sufficient | Steve: Showcase website required |
|----------|------------------------|--------------------------------|
| **Winner** | **Steve Jobs** (board enforced) |
| **Why** | "A README with screenshots isn't a product. It's homework. The URL you share must be beautiful because the URL IS the marketing." |

**LOCKED:** Single static HTML showcase page hosted on Cloudflare Pages.

**BOARD REQUIREMENT:** All four reviewers require deployed showcase website before launch. This is a **launch blocker**.

---

### 9. What Was Cut (V2 Features in V1 Clothing)

| Feature | Status | Reason | Proposer |
|---------|--------|--------|----------|
| Live preview server | CUT | 30+ days of engineering for zero users | Elon (Steve conceded) |
| 5 live demo sites | CUT | 5x maintenance burden, will drift from theme state | Elon (Steve conceded) |
| User accounts | CUT | Zero value for CLI installs. Accounts are walls. | Both agreed |
| Theme ratings/reviews | CUT | Curation IS the quality signal at 5 themes | Both agreed |
| Search/filtering | CUT | 5 themes visible at a glance. Search admits chaos. | Both agreed |
| "Submit Your Theme" | CUT | Build the standard first. Invite others later. | Steve (Elon agreed) |
| Customization panels | CUT | Themes are opinions, not raw materials | Steve (Elon agreed) |
| Feature comparison tables | CUT | This isn't enterprise software. It's fashion. | Steve |

---

## MVP Feature Set (V1 Ships This)

### CLI Commands

| Command | Function | Status |
|---------|----------|--------|
| `npx wardrobe list` | Fetches themes.json, displays available themes | BUILT |
| `npx wardrobe install [theme]` | Downloads tarball, backs up src/, swaps theme, <3s | BUILT |
| `npx wardrobe preview [theme]` | Opens theme showcase in browser | BUILT |

### Five Themes

| Theme | Personality | Identity Statement | Status |
|-------|-------------|-------------------|--------|
| **Ember** | Bold, editorial | "For people with something to say" | BUILT (356 lines) |
| **Forge** | Dark, technical | "Built for builders" | BUILT (520 lines) |
| **Slate** | Clean, professional | "Trust at first glance" | BUILT (551 lines) |
| **Drift** | Minimal, airy | "Let your content breathe" | BUILT (307 lines) |
| **Bloom** | Warm, organic | "Where community feels at home" | BUILT (322 lines) |

### Showcase Website

| Component | Status | Notes |
|-----------|--------|-------|
| Static HTML page (341 lines) | BUILT | Ready for deployment |
| 5 theme cards with copy | BUILT | Steve's voice throughout |
| Mobile-responsive | BUILT | |
| WCAG 2.1 AA accessibility | BUILT | ARIA labels, keyboard nav, focus states |
| Email capture form | BUILT | Worker code exists (305 lines) |
| Coming Soon section | BUILT | 4 themes teased |

### Install Experience

```
Your site is now wearing ember.

Run `npm run dev` to see your transformed site.
Then open http://localhost:4321
Admin panel: http://localhost:4321/_emdash/admin

Try it on. If it doesn't fit, try another.

Installed in 2.34s
```

---

## File Structure (What Gets Built)

```
wardrobe/
├── cli/
│   ├── index.ts                    # CLI entry (~80 lines)
│   └── commands/
│       ├── install.ts              # Download/swap (267 lines)
│       ├── list.ts                 # List themes
│       └── preview.ts              # Open browser
│
├── themes/
│   ├── ember/src/                  # pages/, styles/, components/
│   ├── forge/src/
│   ├── slate/src/
│   ├── drift/src/
│   └── bloom/src/
│
├── registry/
│   └── themes.json                 # Theme metadata (78 lines)
│
├── showcase/
│   ├── index.html                  # Static page (341 lines)
│   ├── styles.css                  # Showcase CSS
│   ├── script.js                   # Interactions (244 lines)
│   └── screenshots/                # Theme previews
│       ├── ember.svg → ember.png   # BLOCKED: Still SVG placeholders
│       ├── forge.svg → forge.png
│       ├── slate.svg → slate.png
│       ├── drift.svg → drift.png
│       └── bloom.svg → bloom.png
│
├── workers/
│   ├── email-capture/              # Email signup (305 lines)
│   │   ├── src/index.ts
│   │   └── wrangler.toml           # BLOCKED: Placeholder KV IDs
│   └── analytics/                  # Install telemetry (388 lines)
│       ├── src/index.ts
│       └── wrangler.toml           # BLOCKED: Placeholder KV IDs
│
├── dist/
│   └── themes/                     # Tarballs (5-6KB each)
│       ├── ember.tar.gz            # BLOCKED: Not uploaded to R2
│       ├── forge.tar.gz
│       ├── slate.tar.gz
│       ├── drift.tar.gz
│       └── bloom.tar.gz
│
└── docs/
    └── DEPLOYMENT-RUNBOOK.md       # Step-by-step deploy guide
```

---

## Open Questions (Needs Resolution)

### 1. Theme Storage Confirmation

| Option | Recommendation |
|--------|----------------|
| R2 bucket tarballs | **V1** — Fast, CDN-backed, simple |
| npm packages | V2 — Versioning, familiar ecosystem |

**Decision Needed:** Confirm R2 bucket name (`emdash-themes`).

### 2. Emdash Core Integration

- Does Emdash core depend on Wardrobe CLI?
- Or does Emdash bundle themes directly?
- Who owns the integration code?

**Decision needed from Emdash core team.**

### 3. Theme Structure Contract

What must each theme's `src/` contain?
- Complete replacement or merge with existing?
- Required vs. optional files?
- Relationship to Emdash starter template?

**Must be defined before themes can be maintained.**

### 4. Screenshot Generation

| Option | Recommendation |
|--------|----------------|
| Manual screenshots | Control but fragile |
| Automated (Playwright) | **Recommended** — Reliable, reproducible |

**Requires:** Demo sites deployed first.

### 5. Pricing Strategy

Warren Buffett: "You can't have a marketplace without commerce."

| Tier | Price | Timeline |
|------|-------|----------|
| Core 5 themes | Free | V1 |
| Premium themes | $29-99 | Q3 2026 |
| Creator revenue share | 70/30 | Q4 2026 |

**Decision needed:** Build pricing rails in V1 (even if unused).

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| **No discovery mechanism** | Certain | Critical | Deploy showcase website BEFORE launch | Product |
| **No retention loop** | Certain | High | Wire email capture, per Shonda's roadmap | Product |
| **No revenue model** | Certain | Medium | Build pricing rails for Q3 | Product |
| **Screenshots don't convert** | Medium | High | Use GIFs showing transformation; Steve reviews all assets | Design |
| **5 themes too ambitious** | High | Medium | Ship Ember, Forge, Slate first if timeline slips | Engineering |
| **Install >3 seconds** | Medium | Medium | Benchmark before ship; optimize tarball size | Engineering |
| **Themes drift from Emdash core** | Medium | High | Define clear `src/` contract; automated compatibility tests | Engineering |
| **Email endpoint is placeholder** | **Certain** | High | Wire worker BEFORE launch. Placeholder URLs are lies. | Engineering |
| **CLI excludes non-technical users** | High | Medium | Web-based install flow in V2 (Oprah's concern) | Product |
| **No competitive moat** | High | High | Build toward network effects: community themes, gallery | Strategy |
| **No AI leverage** | Certain | Medium | Roadmap AI preview for V2 (Jensen's concern) | Engineering |
| **KV namespaces are placeholders** | **Certain** | Critical | Create namespaces, update wrangler.toml | Engineering |
| **Demo sites not deployed** | **Certain** | Critical | Deploy 5 demo sites before screenshots | Engineering |
| **Uncommitted files in git** | **Certain** | Medium | Commit all changes before QA Pass 2 | Engineering |

---

## P0 Launch Blockers (QA Pass 1)

**Status:** 9 P0 issues identified. Cannot ship until resolved.

| # | Blocker | Location | Action Required |
|---|---------|----------|-----------------|
| 1 | KV namespace IDs are placeholders | `workers/analytics/wrangler.toml` | Create KV namespaces |
| 2 | KV namespace IDs are placeholders | `workers/email-capture/wrangler.toml` | Create KV namespaces |
| 3 | Screenshots are SVG placeholders | `showcase/screenshots/*.svg` | Deploy demos, capture PNGs |
| 4 | R2 bucket not created | N/A | `wrangler r2 bucket create emdash-themes` |
| 5 | Theme tarballs not uploaded | `dist/themes/*.tar.gz` | Run upload script |
| 6 | Workers not deployed | `workers/` | `wrangler deploy` after KV fix |
| 7 | Showcase not deployed | `showcase/` | `wrangler pages deploy` |
| 8 | Demo sites not deployed | N/A | 5 Emdash sites needed |
| 9 | Uncommitted files | 3 files in deliverables | `git add && git commit` |

**Path to PASS:**
1. Create KV namespaces (analytics + email-capture)
2. Update wrangler.toml files with real IDs
3. Create R2 bucket for tarballs
4. Upload tarballs to R2
5. Deploy both workers
6. Deploy 5 demo sites
7. Generate PNG screenshots from demo sites
8. Update showcase with PNG screenshots
9. Deploy showcase to Cloudflare Pages
10. Commit all changes to git
11. Run QA Pass 2

---

## Board Conditions for Launch

### Tier 1: Required for Launch (This Sprint)

| # | Condition | Rationale | Status |
|---|-----------|-----------|--------|
| 1 | **Deploy live demo sites** | "Let visitors experience themes" (Oprah) | NOT DONE |
| 2 | **Real screenshots (not SVG)** | "People can't see themselves in placeholders" (Oprah) | NOT DONE |
| 3 | **Post-install reveal** | "Show the climax, don't cut away" (Shonda) | **DONE** |
| 4 | **Wire email capture** | "Promise made must be kept" (Shonda) | NOT DEPLOYED |
| 5 | **Anonymous install telemetry** | "Know your users" (Buffett) | NOT DEPLOYED |

### Tier 2: Before Paid Themes (Next Sprint)

| # | Condition | Rationale | Status |
|---|-----------|-----------|--------|
| 6 | **Pricing rails** | "Can't have marketplace without commerce" (Buffett) | NOT DONE |
| 7 | **Theme creator guidelines** | "Platform needs creators" (Jensen, Buffett) | NOT DONE |
| 8 | **Post-install email** | "Create ongoing relationship" (Shonda) | NOT DONE |
| 9 | **User content preview** | "The money shot" (Jensen) | NOT DONE |

### Tier 3: Platform Status (This Quarter)

| # | Condition | Rationale | Status |
|---|-----------|-----------|--------|
| 10 | Theme versioning | "Reason to return" (Shonda) | NOT DONE |
| 11 | Site gallery | "Social proof + flywheel" (Shonda, Oprah) | NOT DONE |
| 12 | Creator submission pipeline | "Platform economics" (Jensen, Buffett) | NOT DONE |
| 13 | AI theme preview | "10x leverage" (Jensen) | NOT DONE |
| 14 | 10+ themes at scale | "5 feels sparse" (Buffett) | NOT DONE |

---

## Coming Soon Themes (Cliffhangers)

| Theme | Personality | Release | Purpose |
|-------|-------------|---------|---------|
| **Aurora** | "For brands that refuse to blend in" | Summer 2026 | Anticipation |
| **Chronicle** | "Stories deserve dignity" | Fall 2026 | Email capture hook |
| **Neon** | "The future is now" | Summer 2026 | Anticipation |
| **Haven** | "Home on the internet" | Fall 2026 | Email capture hook |

---

## Design Fixes (Jony Ive)

| Issue | Location | Action |
|-------|----------|--------|
| Hero competes with code block | `showcase/index.html:93-98` | Title should command; code should whisper |
| Spacing scale is arithmetic, not proportional | `showcase/styles.css:22-28` | Collapse to 4 values: 8/16/32/64px |
| `!important` in footer | `showcase/styles.css:596` | Remove; fix via specificity |
| Hardcoded `#fff` in code block | `showcase/styles.css:193-203` | Use CSS custom property |
| Coming Soon placeholders | `showcase/index.html:199-256` | Replace letters with real previews or simple text list |
| Hero gradient is noise | `showcase/styles.css:170` | Replace with pure `#ffffff` |
| Copy button redundant | `showcase/index.html:117-120` | Consider removal; `user-select: all` suffices |

---

## Synthesis: Who Won What

### Steve Jobs Won:
- **"Wardrobe" name** — Distribution-ready when budget is zero
- **5 themes** — Collection, not test
- **Brand voice** — Technology that feels human
- **Showcase website** — The URL IS the marketing

### Elon Musk Won:
- **Screenshots over live preview** — Ships in one session
- **CLI-first architecture** — The command is the product
- **Static infrastructure** — Zero ops, infinite scale
- **Themes in core** — Discovery is the install flow

### Board Added:
- Discovery is a launch blocker (showcase website)
- Retention needs hooks (email capture, post-install emails)
- Monetization rails should exist
- AI leverage is missing (Jensen)
- Non-technical user path needed (Oprah)
- Post-install reveal required (Shonda)

---

## The Essence

> **One command transforms your site into something beautiful — your content stays, only the skin changes.**

**The feeling:** "That's me."

**The moment that must be perfect:** The reveal.

**Creative direction:** Instant dignity.

---

## Timeline to Re-Review

| Milestone | Target |
|-----------|--------|
| P0 blockers resolved | +1 week |
| Tier 1 conditions complete | +2 weeks |
| Tier 2 conditions in progress (3 of 4) | +4 weeks |
| **Board re-review** | End of Q2 2026 |

**If conditions not met:** Reclassify as HOLD.

---

## Process Learnings (Marcus Aurelius)

1. **Board review at PRD stage, not after build** — Late feedback is expensive
2. **Define user journey before feature list** — Discovery → Curiosity → Action → Retention → Advocacy
3. **Distinguish MVP from Launchable** — Name the target explicitly
4. **Wire every endpoint or remove the UI** — Placeholder URLs are lies
5. **Include "Retention Check" in every PRD** — Why will users return?

---

## Final Word

The team executed cleanly on the spec. But the spec was incomplete.

Wardrobe has the rarest quality in technology: emotional intelligence. "Instant dignity for your Emdash site" is not just a tagline — it's a promise worth keeping.

But promises require infrastructure. The emotional language writes checks that the current architecture can't cash.

> **Elon's architecture + Steve's soul + Board's conditions = Wardrobe V1**

**Build Status:** Technical MVP complete. Launch CONDITIONAL pending 9 P0 blockers.

**Next Action:** Resolve P0 blockers per DEPLOYMENT-RUNBOOK.md, then QA Pass 2.

---

*The foundation is exceptional. Now build the house.*

— Phil Jackson
April 12, 2026
