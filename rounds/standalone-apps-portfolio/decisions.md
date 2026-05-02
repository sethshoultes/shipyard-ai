# Decisions: Standalone Apps Portfolio

*Orchestrator: Phil Jackson — Zen Master, Great Minds Agency*

This document is the single source of truth for the build phase. If it is not in this file, it is not in scope. If it contradicts this file, it does not ship.

---

## Locked Decisions

### 1. Architecture: Static Export, Zero Runtime
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Seven pages of text do not justify a database, CMS, API layer, auth, edge functions, or ISR. Static export bakes HTML at build time and serves from a CDN. Zero runtime means zero 3AM incidents, zero logs, zero rate limits, and zero dependency upgrades. Steve did not contest architecture; he contested aesthetics. The foundation is spartan.

### 2. Design Philosophy: No Theater
- **Proposed by:** Steve argued for gradients, pulsing badges, and gallery immersion (Round 1). Elon rebutted with elimination (Round 2).
- **Winner:** Elon
- **Why:** Users do not feel velocity from a purple fade; they feel it from a link that loads in 80ms. The Essence locks it: *"No gradients. No pulses. No theater."* Honesty is rendered through restraint, not production design.

### 3. Data Model: One Source of Truth
- **Proposed by:** Steve (Round 1); reinforced by Elon (Round 1, Round 2)
- **Winner:** Consensus
- **Why:** A single `portfolio.ts` array consumed by every route is the only correct model. Steve demanded no duplicated data; Elon called anything else platform cosplay. There is no debate here.

### 4. Scaffold Handling: Label, Not Page
- **Proposed by:** Elon (Round 1, reinforced Round 2)
- **Winner:** Elon
- **Why:** *"Honesty does not require a 404-word obituary."* If a project has fewer than 200 lines of code, it is marked `SCAFFOLD` on `/work` and does not receive a detail page. The Essence: *"Zero dead links. If it does not ship, it does not click."*

### 5. Detail Pages for Real Work Only
- **Proposed by:** Steve implied through gallery metaphor; Elon specified the technical contract (Round 1, Round 2)
- **Winner:** Elon (with Steve's quality constraint)
- **Why:** `[slug]/page.tsx` with `generateStaticParams`. Server Components only — zero client-side hydration overhead. Only apps with real code (>200 lines) and working links qualify. Steve's red line stands: no fabricated screenshots, no 404 demo links.

### 6. Screenshots, Browser Mockups, and README Snippets
- **Proposed by:** Steve wanted visual proof; Elon cut them (Round 1, Round 2)
- **Winner:** Elon
- **Why:** Conditional rendering logic adds build-time branching and failure modes. A scaffold inside a browser chrome is a lie. Revisit visuals when the products are real. For v1, text and status only.

### 7. Lighthouse Threshold: 90, Not 95
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Chasing 95 on a static content page requires font subsetting, image format gymnastics, and SSR hydration tricks. The last 5 points cost more than they convert. 90 is the threshold of professionalism; 95 is performance theater.

### 8. No Search, No Filters
- **Proposed by:** Steve (Round 1, as a negative constraint — "say NO to")
- **Winner:** Steve
- **Why:** *"If you need search, you have already failed at curation."* Elon did not contest. For seven items, search is an admission of poor hierarchy.

### 9. Stats Counter / Vanity Metrics Section
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** Counting scaffolds as assets inflates totals. Five sites and seven scaffolds is not "12 assets." It is five sites and two shipped tools. Cut the math entirely.

### 10. Memory Retrospectives and Process Documentation
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** *"Documentation is not shipping."* The PRD exists. Do not write a second document about writing the first. Ship, then move on.

### 11. Build Scope: One Session, Three Files
- **Proposed by:** Elon (Round 2)
- **Winner:** Elon
- **Why:** `portfolio.ts`, `work/page.tsx`, `[slug]/page.tsx`. If the build exceeds 30 seconds or requires a fourth file, the agent is inventing work. Complexity is a ratchet; keep the entire model in working memory.

### 12. Brand Voice: Craftsmen, Not SaaS Marketers
- **Proposed by:** Steve (Round 1)
- **Winner:** Steve (with Elon's amendment)
- **Why:** Short sentences. No "leveraging AI to drive synergy." The product is the prose. Elon agreed: *"direct prose does not require a pulse."* Voice lives; decoration dies.

### 13. Naming Philosophy for the Index
- **Proposed by:** Steve (Round 1); Elon dismissed (Round 2)
- **Winner:** Elon
- **Why:** This is an index page, not a product nobody downloads. The app names matter; the portfolio header does not. Do not burn cycles on syllable counts. Use what exists. Ship.

### 14. Source-Driven Status Assignment
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** The agent must read source. If `projects/<name>/` has fewer than 200 lines, mark `SCAFFOLD`. Fail gracefully — if a directory is missing or empty, default to `SCAFFOLD`. Do not block the build on research.

### 15. Images: Standard `<img>` or Inline SVG
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** `next/image` with remote optimization in static export creates unnecessary `_next/image` handlers and build-time failures. Standard tags or SVGs only.

### 16. Distribution Strategy: Portfolio Is a Side Effect
- **Proposed by:** Elon (Round 1)
- **Winner:** Elon
- **Why:** A portfolio page is not a product. It has no viral coefficient and no organic search moat. Distribution comes from the apps themselves — GitHub README backlinks, Hacker News Show HN posts, and word-of-mouth from tools people actually use. Ship finished tools first; the portfolio is residue.

---

## MVP Feature Set (What Ships in v1)

1. **`/work` index page** listing all apps in the monorepo.
2. **Honest status labels** derived from source audit: `Shipped`, `Building`, or `Scaffold`.
3. **Zero dead links.** Scaffold apps do not click through. Shipped/Building apps link to working demos or repos.
4. **Detail pages (`[slug]/page.tsx`)** only for non-Scaffold apps. Server Components with zero hydration overhead. Pre-rendered via `generateStaticParams`.
5. **Single `portfolio.ts` array** consumed by all routes. One source of truth. No duplicated data.
6. **Direct, craftsmen brand voice.** Short sentences. No marketing adjectives.
7. **No search bar.** No filters. No screenshots. No browser mockups. No stats counter. No vanity metrics.
8. **Lighthouse ≥ 90.** Not 95.
9. **Build completes in under 30 seconds.** Three files total.
10. **Static export only.** No CMS, no database, no API, no auth, no ISR, no edge functions.

---

## File Structure (What Gets Built)

```
app/
├── work/
│   └── page.tsx          # Index listing. Reads portfolio.ts. No client JS.
├── [slug]/
│   └── page.tsx          # Detail route. generateStaticParams. Server Component.
└── portfolio.ts          # THE source of truth. Static array of app metadata + status.
```

**Inputs (read-only, do not modify):**
- `projects/<name>/` directories — audited for line count to determine Scaffold status.

**Constraints:**
- If a fourth file is required, the build is over-engineered.
- No `next/image` optimization config.
- No new dependencies without explicit justification.

---

## Open Questions (What Still Needs Resolution)

1. **Page Title / Index Name**
   Steve rejected "Promptfolio" and "AgentPipe." Elon dismissed the debate as irrelevant. No decision is locked. Use a working title or the existing brand convention; do not block the build.

2. **Exact Status Taxonomy**
   Elon standardized on `SCAFFOLD` for <200-line projects. The labels for non-scaffold states are not formally locked. Steve suggested green/amber/slate mapping to `Shipped` / `Building` / `Scaffold`. Pick two honest words and ship.

3. **Accent Color Strategy**
   Steve wanted unique gradients per app. Elon mandated *"pick one accent color for the entire section."* The specific color is not locked.

4. **App Metadata Schema**
   Beyond `name`, `status`, `slug`, and `href`, the exact fields per app entry are not formally defined. Keep it minimal. Add fields only when content demands them.

5. **Line-Count Threshold Nuance**
   `<200 lines = Scaffold` is locked. What distinguishes `Shipped` from `Building` at ≥200 lines? Presence of a deployed URL? A passing CI badge? Define at build time or default honest apps without live demos to `Building`.

6. **Demo URLs for Real but Undeployed Apps**
   If an app has >200 lines but no public deployment, does it still get a detail page? Steve said no 404 links; Elon said cut dead links. The detail page can exist, but the primary CTA must not promise a broken demo. This boundary case needs a rule at build time.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Agent invents features instead of reading source** | High | High | Mandate source audit in acceptance criteria. Default to `SCAFFOLD` on any read failure. Do not block build on research. |
| **Dead links ship in v1** | Medium | High | No click-through for scaffolds. Manual spot-check every `href` in `portfolio.ts` before merge. |
| **Build time exceeds 30s** | Medium | Medium | Audit `package.json` for parasites. No analytics scripts. Standard `<img>` only. No `next/image` remote optimization. |
| **Scaffold majority destroys credibility** | High (if >50% scaffolds) | Medium | If the ratio is catastrophic, lead with shipped apps. But do not hide scaffolds — that breaks the honesty contract. Consider culling rather than lying. |
| **Static export limits future scaling** | Low now / High later | Medium | Hand-curating a TypeScript array breaks at ~100 apps. Document the constraint. Plan migration path to MDX or lightweight CMS when content volume demands it. |
| **Accessibility fails silently** | Low | Medium | Static text is inherently accessible, but poor semantic HTML or low-contrast accent colors can still fail. Enforce semantic markup and verify contrast ratios. |
| **Detail page bloat via client hooks** | Medium | Medium | Ban React hooks on detail pages. Server Components only. Zero hydration overhead is non-negotiable. |

---

*"The strength of the team is each member. The strength of each member is the team. But the blueprint is what keeps both from collapsing into chaos."*

Build from this. Nothing else.
