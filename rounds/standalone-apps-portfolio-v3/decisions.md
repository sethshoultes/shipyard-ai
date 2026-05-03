# Standalone Apps Portfolio v3 — Locked Decisions

*Consolidated by Phil Jackson, Zen Master*

A manifesto in portfolio's clothing. Two heavyweights went two rounds. This is the scorecard.

---

## Decision Log

### 1. Architecture: Next.js Static Export, Zero Client JS
- **Proposed by:** Elon (pure HTML was his 10x preference; Next.js static export is his compromise)
- **Winner:** Elon, with Steve concession.
- **Why:** Steve acknowledged that ripping out Next.js would create a "visual Frankenstein" against the parent site. Consistency is a feature, not bloat. Zero client JS means Server Components only — no runtime tax for text and anchor tags.

### 2. First 30 Seconds: Answer WHY, Not WHAT
- **Proposed by:** Steve, codified in essence.md
- **Winner:** Steve, uncontested on essence.
- **Why:** The brief explicitly commands: "Must be perfect: the first thirty seconds. Answer *why*, not *what*." Elon's distribution-before-polish argument does not override the core mandate. The landing experience is sacred ground.

### 3. No Badges. No Confetti.
- **Proposed by:** Steve, codified in essence.md
- **Winner:** Steve.
- **Why:** Essence is higher authority than either debater. Status badges that scream "BUILD" in amber, tech-stack chips as decoration, and any visual element that does not deepen the story are cut. What remains is opinion made visible.

### 4. Brand Voice: "We craft tools we wish existed"
- **Proposed by:** Steve
- **Winner:** Steve, with full concession from Elon.
- **Why:** Elon called it "communication clarity, not beauty" and conceded without argument. This replaces "Things we built along the way." Every line of copy must speak with conviction.

### 5. Detail Pages Must Deepen, Not Restate
- **Proposed by:** Steve
- **Winner:** Steve, with full concession from Elon.
- **Why:** Elon: "A click that reveals the same bullets is a broken promise. That is a functional bug, not an aesthetic one." Every detail page must earn its keep with narrative, demonstration, or context never shown on the card.

### 6. Cut SCAFFOLD Status
- **Proposed by:** Elon
- **Winner:** Elon, with Steve concession.
- **Why:** Dead code. No entries use it. Steve: "Dead code is a lie you tell your repository."

### 7. Cut Unused Accent Colors (3 of 6)
- **Proposed by:** Elon
- **Winner:** Elon, uncontested.
- **Why:** YAGNI. Six colors defined, three used. At app #7 the design signal breaks from repetition. Cut the fat.

### 8. Cut HTTP 200 GitHub URL Checks Gating Builds
- **Proposed by:** Elon
- **Winner:** Elon, with Steve concession.
- **Why:** Brittle integration tests disguised as unit tests. External network state should not gate a build. Steve: "Brittle tests are worse than no tests; they teach you to ignore the signal."

### 9. Naming Clean-up
- **Proposed by:** Steve
- **Winner:** Steve, with Elon concession on bad names.
- **Why:** "Promptfolio" is a portmanteau Frankenstein — must be renamed to one clear word. "Beam (Commandbar)" becomes "Beam" — parentheticals in product names are a confession that you don't know what the product is. "Tuned" is already good and ships as-is.

### 10. No Tech Stack Badges as Decoration
- **Proposed by:** Steve
- **Winner:** Steve, with concession from Elon.
- **Why:** Elon granted they are "confetti — useful only to other developers, and only when placed out of the main visual path." Main visual path is badge-free. If stack matters, it lives in the source or a footnote, not a chip.

### 11. No Generic CTAs
- **Proposed by:** Steve
- **Winner:** Steve, with concession from Elon.
- **Why:** "Start a Project" is what a contractor says. A button must say what happens when you press it. UI hygiene, not decoration.

### 12. OG Images as Sharable Assets
- **Proposed by:** Steve (defending existing PRD item)
- **Winner:** Synthesis.
- **Why:** Steve sees it as the first handshake; Elon sees it as metadata. It ships because it serves Elon's own non-negotiable: distribution is a prerequisite for existence, and OG images are the cheapest sharable asset we have.

### 13. Distribution Is a Prerequisite for Further Polish
- **Proposed by:** Elon
- **Winner:** Synthesis — both converge.
- **Why:** Steve conceded that "if you build it, they will come" is the prayer of the arrogant. Elon conceded that a portfolio needs deliberate SEO and community presence, not "viral dark patterns." One intentional growth mechanism ships with v1. No pixel gets re-aestheticized until visitors actually arrive.

### 14. CMS Abstraction Before 10 Apps
- **Proposed by:** Elon
- **Winner:** Elon, with Steve concession.
- **Why:** `portfolio.ts` monolith snaps at scale. `generateStaticParams` slows linearly. No pagination, no search, no image pipeline at 300 apps. Steve: "Painfully right." This is a post-v1 roadmap lock, not a v1 build item.

---

## MVP Feature Set (What Ships in v1)

| Feature | Status | Owner |
|---|---|---|
| `/work` landing page — manifesto-first, no badges above fold | **LOCKED** | Steve |
| `/work/[slug]` detail pages — deepen story, never restate | **LOCKED** | Steve |
| Next.js static export, Server Components, zero client JS | **LOCKED** | Elon |
| Data in `portfolio.ts` (monolith accepted for 3 apps) | **LOCKED** | Elon |
| Auto-generated OG images (`@vercel/og`) | **LOCKED** | Synthesis |
| Brand voice: "We craft tools we wish existed" | **LOCKED** | Steve |
| Naming: Tuned ✓, Beam ✓, Promptfolio → **[RENAME]** | **LOCKED** | Steve |
| Cuts: SCAFFOLD, 3 unused accent colors, HTTP build-gate tests | **LOCKED** | Elon |
| One intentional growth mechanism (SEO + community presence) | **LOCKED** | Synthesis |
| No tech stack badges in main visual path | **LOCKED** | Steve |
| Specific, non-generic CTAs | **LOCKED** | Steve |

**Deferred to post-distribution / v2:**
- CMS abstraction (triggered at app #4, before app #10)
- Pagination / search on `/work`
- Image pipeline for thumbnails
- Advanced scroll physics or manifesto-level animation polish

---

## File Structure (What Gets Built)

```
app/
  work/
    page.tsx                 # Landing — manifesto first, answers WHY
    [slug]/
      page.tsx               # Detail — deepens story, never restates
  api/
    og/
      route.tsx              # OG image generation for sharable assets
lib/
  portfolio.ts               # Data monolith (3 apps only, v1)
components/
  # Minimal. Every component must earn its place.
  # If it does not deepen the story, cut it.
public/
  # Assets as needed
```

**Cut / Not Built:**
- `SCAFFOLD` status union member
- Unused 3 accent colors from theme map
- HTTP 200 integration tests gating builds
- `MIGRATION.md` (uncontested cut — dead process wrapper)

**Disputed — Build Phase Must Decide:**
- `spec.md` + `todo.md`: Steve argues these prevented v1/v2 process failures; Elon calls them 4 process wrappers for 3 lines of business logic. **Status: unresolved.**

---

## Open Questions (What Still Needs Resolution)

### 1. Promptfolio Replacement Name
- **Mandate:** One clear word. No portmanteaus. Evokes creation, curation, or memory.
- **Blocker:** Content lock. Must be resolved before build completes.
- **Escalation path:** Time-box to 24 hours. If no consensus, Steve has tie-breaker on naming per brand mandate.

### 2. Status Badges: Banned Entirely or Relocated?
- **Steve:** "No status badges that scream BUILD." Non-negotiable above fold.
- **Elon:** BUILD badge is "honest metadata" — stripping it strips signal.
- **Essence:** "No badges."
- **Question:** Are badges banned everywhere, or allowed below the fold / in metadata only? Essence suggests total ban; Elon wants signal preservation. Build team must resolve this tension.

### 3. Feature Lists: Banned or Below the Fold?
- **Steve:** "Say NO to feature lists as content. Nobody ever fell in love with a product because it had 'Zod-validated schema.'"
- **Elon:** "Feature lists are information architecture, not decoration. Strip them and you strip the signal."
- **Question:** Do detail pages contain zero feature lists, or are they moved to a secondary, non-prominent position? The "deepen not restate" mandate governs, but signal vs. noise must be decided.

### 4. Process Documentation: Keep or Cut?
- **Steve:** Keep `spec.md` and `todo.md` — "v1 and v2 failures were process failures."
- **Elon:** Cut all four wrappers (`spec.md`, `todo.md`, `MIGRATION.md`, test file).
- **Question:** Does the build team keep lightweight process docs to prevent repeat craters, or ship lean and trust version control?

### 5. Distribution Execution
- **Agreed:** One real growth mechanism must ship with v1.
- **Question:** Which one? Options on the table:
  - Hacker News launch strategy
  - SEO long-tail indexing (metadata, structured data, sitemap)
  - Community presence / social sharing pipeline
- **Needs:** Owner assignment and a concrete deliverable, not a strategy sentence.

### 6. Test Strategy
- **Agreed:** HTTP 200 checks are cut.
- **Question:** What, if anything, gates the build? Static export must complete? Visual regression? Build-time type checking? The void must be filled with something intentional.

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| **Build slips into "manifesto theatre"** — Steve's vision pulls scope into emotional polish before distribution exists | Medium | High | Hard gate: distribution mechanism must be live before any scroll-physics or animation polish. Essence governs; scope creep does not. |
| **portfolio.ts monolith ignored until it's too late** — v1 sets precedent, team forgets CMS abstraction mandate | High | Medium | Ticket CMS abstraction in the very next sprint. App #4 triggers mandatory architecture review. |
| **Renaming Promptfolio blocks launch** — naming debate becomes bike shed | Medium | Medium | Time-box to 24 hours. If no consensus, Steve has tie-breaker on naming per brand mandate. |
| **Zero test coverage after cutting HTTP checks** — Elon cuts tests, nothing replaces them, regressions slip through | Medium | Medium | Build phase must decide replacement test strategy. Minimum bar: static build must complete without error, type-check passes. |
| **Detail pages still restate instead of deepen** — content team misses "deepen not restate" mandate | High | High | Content review gate: every detail page must contain at least one element (demo, narrative, context, insight) not present on the card. No exceptions. |
| **Parent site bloat swallows portfolio performance** — zero client JS helps, but parent Next.js bundle tax remains | High | Low | Accept for v1. Monitor Core Web Vitals. If LCP > 2.5s, escalate to Elon's pure-HTML escape hatch. |
| **"No badges" essence conflicts with BUILD badge metadata** — Elon pushes back on total ban at implementation | Low | Low | Essence is higher authority. If functional status is necessary, render as plain text (e.g., "Status: In Development"), never as a badge component. |
| **Next.js upgrade breaks design system tokens** — six tokens become eighteen, colors shift silently | Medium | Medium | Lock design system version for v1. Document all token dependencies in a single source file. |
| **Three apps feel empty** — with cuts and no badges, the portfolio looks like a draft, not a manifesto | Medium | High | Lean harder into storytelling depth. Three great stories beat thirty catalog entries. Make each app feel inevitable. |

---

*"The strength of the team is each individual member. The strength of each member is the team."*

*Build like you care. The rest is noise.*
