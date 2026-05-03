# Standalone Apps Portfolio v2 — Locked Decisions

*Phil Jackson, Zen Master — Great Minds Agency*
*Date: May 3, 2026*

---

## How We Reached Here

Two rounds between **Elon Musk** (first-principles / velocity) and **Steve Jobs** (taste / curation), mediated by the **Essence** (credibility wall, invisible frame, visible proof).

Points of unanimous agreement: static export, zero runtime infrastructure, no SCAFFOLD on the public page, no gradients/pulses/theater, no search, curated scarcity, direct write to `website/src/`.

Points of genuine conflict: Lighthouse 90 vs. 95+, whether any meta-work (`todo.md`, `spec.md`) prevents agent failure, whether the portfolio is "residue" or the first touchpoint, and the naming gate for shipped apps.

Below are the binding resolutions.

---

## Decision Register

### 1. Static Export + Server Components Only — Zero Runtime Infrastructure
- **Proposed by:** Elon (Round 1)
- **Opposed by:** None. Steve agreed in Round 2.
- **Winner:** Elon. Unanimous.
- **Why:** "Seven pages of text do not justify infrastructure." No database, no CMS, no API layer, no auth, no edge functions, no hydration tax for read-only content. `generateStaticParams` emits HTML; a CDN serves it infinitely.

### 2. Three-App Architecture — One Array, One Section, One Template
- **Proposed by:** Elon (Round 1, Round 2 non-negotiable)
- **Opposed by:** None.
- **Winner:** Elon. Unanimous.
- **Why:** One `portfolio.ts` array, one section component for `/work`, one `[slug]/page.tsx` template. Complexity proportional to user value. Do not invent a design system for three cards. The PRD was 80% process instructions, 20% product spec; this flips the ratio back to product.

### 3. Zero SCAFFOLD Entries on `/work` — Only Shipped, Demo-able Tools
- **Proposed by:** Steve (Round 1: "A painting half-painted is not hung in the museum.") and Elon (Round 1: "Only shipped or demo-able tools get real estate.")
- **Opposed by:** None. Steve explicitly said in Round 2: "Cutting SCAFFOLD entries from `/work` — correct."
- **Winner:** Both. Unanimous.
- **Why:** If an app has no detail page and no live demo, listing it is resume padding, not product. Curated scarcity says: *we bled for these.* Two strong entries beat three with one broken link.

### 4. No Meta-Files in the Deliverable — `spec.md`, `MIGRATION.md`, `todo.md` Do Not Ship
- **Proposed by:** Elon (Round 1, Round 2 non-negotiable)
- **Opposed by:** Steve (Round 2 defended `spec.md` and `todo.md` as discipline that prevents skipped Write calls and empty hands)
- **Winner:** Elon on the product artifact; Steve’s concern is routed to process, not payload.
- **Why:** Every meta-file is a human handoff queue disguised as diligence. If the agent can generate code but cannot merge it into `website/src/`, the pipeline is broken, not the spec. The built app contains zero meta documents. The agent may use internal scratchpads during the session, but nothing gets committed alongside the source.

### 5. Kill the Build Theater — No Live-URL Curl Gates, No Retrospective Requirement, No Tautological `node --test`
- **Proposed by:** Elon (Round 1)
- **Opposed by:** None. Steve agreed in Round 2.
- **Winner:** Elon. Unanimous.
- **Why:** A build gate that fails because GitHub hiccuped is insanity. Documentation is not shipping. TypeScript already proves data structure; `node --test` of static data the agent just wrote is cargo-cult validation. Validate by existence, not bureaucracy.

### 6. Write Directly to `website/src/` — No Deliverables-Directory Handoff
- **Proposed by:** Elon (Round 1, Round 2)
- **Opposed by:** None. Steve agreed in Round 2.
- **Winner:** Elon. Unanimous.
- **Why:** The "self-contained deliverables" pattern manufactures stale code. At 100 PRDs, you have 100 orphaned backlogs waiting for a merge that never comes. Fix the pipeline, not the file path.

### 7. No Search. No Filters. No Status Badges Above the Fold.
- **Proposed by:** Steve (Round 1, reinforced Round 2)
- **Opposed by:** None. Elon conceded in Round 2.
- **Winner:** Steve. Unanimous.
- **Why:** At three apps, search is absurd and signals a junk drawer. Status is metadata for us, not poetry for them. If you need a search bar, you have already failed at curation.

### 8. Restraint Is the Feature — Zero Gradients, Zero Pulses, Invisible Frame
- **Proposed by:** Steve (Round 1)
- **Opposed by:** None. Elon conceded in Round 2: "I concede on no-gradients, no-pulses, no-tech-stack-confetti, and no-search-bar rules."
- **Winner:** Steve. Unanimous.
- **Why:** The Essence demands it: "Invisible frame. Visible proof." The page must feel like walking into a white room with three objects on pedestals. No decoration. No "AI-powered" copy. The work speaks.

### 9. No Tech-Stack Chips Above the Fold; No GitHub Links as Primary CTAs
- **Proposed by:** Steve (Round 1)
- **Opposed by:** None.
- **Winner:** Steve. Unanimous.
- **Why:** Users do not care about your dependency array. You do not invite someone into your cathedral and hand them a wrench and point at the scaffolding. Source is backstage.

### 10. Curated Scarcity — Three Strong, No Weak, No Padding
- **Proposed by:** Steve (Round 1: emotional hook) and Elon (Round 1: "A portfolio with 3 strong entries beats a page with 3 strong and 4 weak ones. Weak entries dilute credibility.")
- **Opposed by:** None.
- **Winner:** Both. Unanimous.
- **Why:** Abundance is cheap — any developer can list fifty repositories. Three things. That is it. Each one survived a cull so brutal it would make most teams quit.

### 11. Naming: One Word, Emotional, Unforgettable
- **Proposed by:** Steve (Round 1, Round 2 non-negotiable: "Names are prayers, not labels.")
- **Opposed by:** Elon (Round 2: "ship the tool, fix the name in a follow-up commit")
- **Winner:** Steve on standard; Elon on v1 pragmatism.
- **Why:** The standard is correct. If a name does not make someone *feel* something before they understand it, it is dead. For v1, existing shipped names stand; future apps get Steve’s review before they enter the repo.

### 12. Brand Voice: Cold, Clean, Certain — No SaaS Markup
- **Proposed by:** Steve (Round 1)
- **Opposed by:** None.
- **Winner:** Steve.
- **Why:** No "leveraging." No "robust solutions." No "end-to-end platforms." Short sentences because we are not afraid of silence. Automated lint rule: ban words ["revolutionary", "AI-powered", "cutting-edge", "next-gen", "unlock", "leverage"].

### 13. The Portfolio Is the First Touchpoint, Not Residue
- **Proposed by:** Steve (Round 2: "Why did we spend a hundred million dollars on Apple Stores? Packaging is the product when attention is the scarcest resource.")
- **Opposed by:** Elon (Round 1: "The portfolio is residue.")
- **Winner:** Steve.
- **Why:** Distribution comes from the apps, but the portfolio closes the sale. It converts visitors who already arrived. We treat it as credibility infrastructure, not a growth engine, and we do not treat the wrapper as an afterthought.

### 14. Validation by Existence — If the Route Renders, It Passes
- **Proposed by:** Elon (Round 1, Round 2)
- **Opposed by:** None.
- **Winner:** Elon.
- **Why:** TypeScript already proves structure. The file is there and the route renders; that is the test. No `node --test` running TypeScript in Node without `tsx`. No curl checks against GitHub rate limits.

### 15. No Accent Color Audits for Three Cards — Pick a Color, Move On
- **Proposed by:** Elon (Round 1)
- **Opposed by:** None. Steve agreed in Round 2.
- **Winner:** Elon. Unanimous.
- **Why:** Six disallowed colors and a custom enum for three cards is bike-shedding.

### 16. Demo-able Is the Shipping Standard — Perfect Is a Trap
- **Proposed by:** Elon (Round 2)
- **Opposed by:** Steve (Round 1: "only perfect earns a frame"; Round 2 softened to "perfection gets the spotlight")
- **Winner:** Elon, with Steve’s aesthetic veto.
- **Why:** Polish is asymptotic; shipping is binary. An app that runs with honest description ships. Steve keeps 24-hour veto power over whether the rendered card meets gallery standards, but "it is not perfect yet" is not a blocker.

---

## MVP Feature Set (What Ships in v1)

1. **`/work` index page**
   - Static export. Zero runtime dependencies.
   - Three app cards maximum. Each card links to its detail page.
   - Card content: name, one-line tagline (≤ 5 words), honest description.
   - Gallery aesthetic: white space, matte weight, no gradients, no pulses, no status badges cluttering the altar.
   - Copy is a confident whisper. The user feels it in their spine before their eyes finish focusing.

2. **Detail pages (one per app)**
   - Generated via `generateStaticParams` from the portfolio array.
   - Content: name, tagline, what it does, how we built it, GitHub door (backstage), live demo link if it exists.
   - If there is not enough substance to describe, the app does not get a detail page and does not appear on `/work`.

3. **Data layer**
   - Single file: `portfolio.ts`.
   - Typed schema with fields for: slug, name, tagline, status (`SHIPPED` | `BUILD` — internal only, not rendered as badge), description bullets, tech stack (detail page only), GitHub URL, live demo URL, lastVerified date.
   - Schema structured so a future build-time script can generate the array without a rewrite.

4. **Components**
   - Page component for `/work`.
   - Card component reused across apps.
   - Detail layout component.
   - No search. No filters. No "coming soon." No lorem ipsum. No SCAFFOLD rendering.

5. **Tests**
   - Zero test files shipped in the product directory. Validation by existence: the build succeeds, the routes render, TypeScript compiles.
   - The agent may run a pre-flight sanity check during the build session, but no committed test file validates static data the agent just typed.

---

## File Structure (What Gets Built)

```
website/src/
  app/
    work/
      page.tsx              # /work index — gallery wall
    work/[slug]/
      page.tsx              # detail page template
  components/
    work/
      AppCard.tsx           # card component
      AppDetail.tsx         # detail layout
  data/
    portfolio.ts            # single source of truth
```

**Explicitly NOT built:**
- `spec.md`
- `todo.md`
- `MIGRATION.md`
- Any search/filter UI or logic
- Any "coming soon" or SCAFFOLD card rendering
- Any screenshot generation pipeline (v1 is typographic)
- Any `node --test` file or live-URL curl gate in the build script

---

## Open Questions (What Still Needs Resolution)

1. **Lighthouse target: 90 vs. 95+.**
   Elon says 90 is fine on static text and the last five points are theater. Steve says 90 is sloppiness masquerading as pragmatism and the last five points are where you prove you care. **Ruling needed:** Target 95 on static pages because there is no database, no animation, no excuse — but 90 is the ship-floor. The last five points are not launch blockers unless the fix is trivial.

2. **Agent discipline without `todo.md`.**
   Steve argues checklists prevent skipped Write calls. Elon says if the agent skips writes, the problem is the agent, not the spec. **Ruling needed:** The agent may use a private scratchpad during the session, but the committed repo contains zero meta documents.

3. **The unfinished apps in the repo.**
   If an app is SCAFFOLD/BUILD with no live URL, Elon wants it removed from the repo entirely (zero inventory). Steve wants repo honesty but agreed it gets zero public real estate. **Ruling needed:** Unfinished apps may remain in the repo as private branches or metadata, but they do not appear in `portfolio.ts` and they do not render on `/work`.

4. **How to ground feature bullets without burning agent context.**
   The PRD wants the agent to read 3 source files per app. With 3 apps × 3 files + analysis, this risks hallucination if context runs thin. **Ruling needed:** Pre-extract per-app summaries (3 bullets max). If context thins, stop reading and declare "Not enough substance to describe" — that app gets cut from the page.

5. **Image/screenshot policy for shipped apps.**
   Elon says screenshots were already cut in v1 and v2 anxiety must not reopen doors v1 correctly closed. The Essence says "demo-able work hangs." **Ruling needed:** v1 is purely typographic. If a future app has a live demo URL, the detail page links to it; no screenshot pipeline in v1.

6. **When the data generation script gets built.**
   Elon wants the schema architecturally ready for machine generation. Steve does not care about the pipeline until it breaks. **Ruling needed:** Schema is future-proofed now. Trigger condition: when app count exceeds 6, implement the build-time generation script.

7. **Detail page template sufficiency.**
   One template for all three apps, or does a CLI tool vs. a web app need structurally different detail treatment? **Ruling needed:** One template. The data schema handles the variance; the layout does not.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Agent context exhaustion** reading 9+ source files to ground bullets | High | High | Pre-extract per-app summaries. Limit to 3 bullets per app. If context thins, stop reading and declare "Not enough substance to describe" — that app gets cut. |
| **Agent skips Write calls** again, as in v1 | Medium | Critical | This PRD is stripped to ~200 lines of actual code across 4 files. Fewer files, fewer chances to skip. Orchestrator enforces direct-merge mode. |
| **Weak entry slips onto `/work`** because builder is proud of unfinished work | Medium | Critical | Gate: app must have a detail page with real substance and a live demo URL or GitHub URL that resolves. SCAFFOLD status auto-excludes from render loop. |
| **Portfolio.ts goes stale** after v1 because nobody updates taglines | Medium | Medium | Schema includes `lastVerified` date. Set calendar trigger: if `lastVerified` > 90 days, rebuild or review. |
| **Build pipeline still demands meta-files** after we delete them | Medium | Medium | Orchestrator must update merge protocol before build session begins. If pipeline breaks, the meta-file is a single-line stub pointing to source, not a full spec. |
| **Perfect becomes enemy of shipped** — endless polish on card spacing, typography, copy | High | High | Demo-able is binary. Steve has 24-hour veto window on rendered aesthetics, then we ship. Post-launch commits are encouraged; launch blockers are not. |
| **Lighthouse gate causes launch stall** arguing over 90 vs. 95 | Medium | Medium | Target 95. Ship-floor is 90. If the page scores 90 and the remaining optimizations are non-trivial, ship and fast-follow to 95. |
| **Copy drifts into billboard mode** — "revolutionary," "AI-powered," superlatives | Medium | High | Automated lint rule: ban words ["revolutionary", "AI-powered", "cutting-edge", "next-gen", "unlock", "leverage"]. Steve spot-checks before merge. |
| **Build time exceeds 30 seconds** due to package.json parasites | Medium | Medium | Audit dependencies before build. Static HTML has no runtime cost; the only bottleneck is the pipeline itself. |
| **One of the three apps is not actually demo-able** at build time | Medium | Critical | Pre-flight check: verify live URLs before agent begins. If <3 apps pass, page ships with however many pass. Two strong entries beat three with one broken link. |
| **Stale deliverables-dir pattern resurrects** at 100 apps | Low | High | Monorepo is a prison at scale. Plan the content model, not the load balancer. When app count crosses 12, automate integration or split the repo. |

---

## Final Word

> "The strength of the team is each individual member. The strength of each member is the team."

Elon gave us velocity, truth, and the elimination of every file that does not serve the user. Steve gave us taste, curation, and the iron law that only finished work hangs on the wall. The Essence gave us the white room.

The locked decisions are not compromises — they are the synthesis. We ship three apps on a gallery wall. No search. No scars on the showroom floor. No meta-work. No build theater. Demo-able is the standard. The frame is invisible. Move on.
