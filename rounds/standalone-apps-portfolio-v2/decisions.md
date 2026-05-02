# Standalone Apps Portfolio v2 — Locked Decisions

*Phil Jackson, Zen Master — Great Minds Agency*
*Date: May 2, 2026*

---

## How We Reached Here

Two rounds between Elon Musk (first-principles / velocity) and Steve Jobs (taste / curation). Points of deep agreement: kill meta-work, static export, zero theater, portfolio as credibility infrastructure not growth engine. Points of conflict: whether SCAFFOLD earns public real estate, whether restraint is feature or cope, whether data is gardened or generated. Below are the binding resolutions.

---

## Decision Register

### 1. Zero SCAFFOLD entries on `/work`
- **Proposed by:** Elon (Round 1, reinforced Round 2)
- **Opposed by:** Steve (Round 1 defended SCAFFOLD as radical honesty; Round 2 revised to "gallery wall is for shipped work only")
- **Winner:** Elon, with Steve's framing adopted.
- **Why:** Steve ultimately conceded that SCAFFOLD is a fact, not a fantasy, but the *gallery wall* is reserved for shipped/demo-able work only. The locked rule: only apps with live demos earn a card on `/work`. SCAFFOLD status may exist in repo metadata — it does not appear on the public page. Weak entries dilute credibility faster than strong ones build it. That is math, and Steve accepted the math when it was framed as quality of impression rather than quantity of output.

### 2. Restraint is the feature — zero gradients, zero pulses, invisible frame
- **Proposed by:** Steve (Round 1)
- **Opposed by:** Elon (initially dismissed as "coping mechanism" / aesthetic theater)
- **Winner:** Steve. Elon conceded in Round 2: "white space is cheaper to ship than gradients, and clean typography requires zero dependencies. Taste here is just the absence of bad decisions."
- **Why:** The rendered output must feel like a gallery wall. No decoration. No "AI-powered" copy. The work speaks. The frame is invisible. This is non-negotiable brand voice.

### 3. No search. No filters. For v1, forever if we stay curated.
- **Proposed by:** Steve (Round 1, reinforced Round 2)
- **Opposed by:** Elon (argued search is broken at thirty apps)
- **Winner:** Steve for v1. Elon's scaling concern is noted and architecturally hedged (see File Structure).
- **Why:** At three apps, search is absurd and signals a junk drawer. If we ever have thirty apps and no curation, we have failed as an agency. The page is proof, not a catalog. However, the component architecture must not bake in search assumptions that are hard to remove.

### 4. Kill the meta-work — three deliverable files, no `spec.md`, `todo.md`, `MIGRATION.md`
- **Proposed by:** Elon (Round 1)
- **Opposed by:** None. Steve fully agreed in Round 2.
- **Winner:** unanimous.
- **Why:** Every meta-file is a human handoff queue disguised as diligence. If the agent can generate code but can't merge it into `website/src/`, we haven't automated anything — we've emailed ourselves typesetting jobs. Fix the pipeline, delete the meta-work.

### 5. Portfolio data: hand-curated `portfolio.ts` for v1, schema must be machine-readable for future generation
- **Proposed by:** Elon (Round 2: "data generated, not gardened")
- **Opposed by:** Steve (implicitly; Steve never argued for generation but cares more about rendered truth than data pipeline)
- **Winner:** Compromise — v1 ships hand-curated, schema is Elon-compliant.
- **Why:** For three apps, a scraper script is premature optimization and burns build complexity budget. However, Elon is right that hand-curated arrays become stale weed patches. The `portfolio.ts` schema must be structured so that a future build-time script can walk the monorepo, read `package.json` + `README.md`, and generate the array without a rewrite. Humans ship v1; machines scale v2.

### 6. The portfolio page is credibility infrastructure, not a growth engine
- **Proposed by:** Elon (Round 1)
- **Opposed by:** None. Steve agreed in Round 2: "He brings them to the door; we close the sale."
- **Winner:** unanimous.
- **Why:** Nobody shares "my agency's work page." Distribution comes from the apps themselves or from Seth's content flywheel. `/work` converts visitors who already arrived. We do not pretend otherwise in copy or in metric targets.

### 7. Demo-able is the shipping standard — perfect is a trap
- **Proposed by:** Elon (Round 2)
- **Opposed by:** Steve (Round 1 said "only perfect earns a frame"; Round 2 softened to "perfection gets the spotlight")
- **Winner:** Elon, with Steve's taste guardrails.
- **Why:** Polish is asymptotic; shipping is binary. An app that runs with honest description ships. Steve keeps veto power over whether the rendered card meets gallery standards, but "it isn't perfect yet" is not a blocker. You can push a prettier commit tomorrow; you cannot iterate on something that never lands.

### 8. Naming: one word if possible, two if necessary, three is a committee
- **Proposed by:** Steve (Round 1)
- **Opposed by:** Elon (Round 2: "ship the tool, fix the name in a follow-up commit")
- **Winner:** Steve on standard, Elon on pragmatism.
- **Why:** The standard is Steve's. Names are destiny. But a bad name on a shipped app beats a beautiful name on a repo that never deploys. For v1, existing names stand. Future apps get Steve's review before they enter the repo.

---

## MVP Feature Set (What Ships in v1)

1. **`/work` index page**
   - Static export. Zero runtime dependencies.
   - Three app cards only. Each card links to its detail page.
   - Status badge per card: `SHIPPED` or `BUILD`. No `SCAFFOLD`.
   - Gallery aesthetic: white space, matte weight, no gradients, no pulses.
   - Copy is a confident whisper: name, one-line tagline, honest description grounded in actual source.

2. **Detail pages (one per app)**
   - Generated via `generateStaticParams` from the portfolio array.
   - Content: name, tagline, what it does, how we built it, GitHub door.
   - If there is not enough substance to describe, the app does not get a detail page and does not appear on `/work`.

3. **Data layer**
   - Single file: `portfolio.ts`.
   - Typed schema with fields for: slug, name, tagline, status, description bullets, tech stack, GitHub URL, live demo URL.
   - Schema structured for future machine generation.

4. **Components**
   - Page component for `/work`.
   - Card / detail component reused across apps.
   - No search. No filters. No "coming soon." No lorem ipsum.

5. **Tests**
   - One test file verifying: static params generation, no 404s, no TODO copy, no SCAFFOLD badges on rendered output.

---

## File Structure (What Gets Built)

```
website/src/
  app/
    work/
      page.tsx          # /work index — gallery wall
    work/[slug]/
      page.tsx          # detail page template
  components/
    work/
      AppCard.tsx       # card component
      AppDetail.tsx     # detail layout
  data/
    portfolio.ts        # single source of truth
  __tests__/
    work.spec.ts        # one test file
```

**Explicitly NOT built:**
- `spec.md`
- `todo.md`
- `MIGRATION.md`
- Any search/filter UI or logic
- Any "coming soon" or SCAFFOLD card rendering

---

## Open Questions (What Still Needs Resolution)

1. **The four other apps.** They are not demo-able today. Do they remain in the repo with SCAFFOLD metadata (Steve's preference for honesty), or do they get removed from the repo entirely until they ship (Elon's preference for zero inventory)? Decision needed before build starts.

2. **How to ground feature bullets without burning agent context.** The PRD wants the agent to read 3 source files per app. With 3 apps × 3 files + analysis, this risks hallucination if context runs thin. Do we pre-extract key files into a scratchpad, or do we limit bullets to what the builder already knows?

3. **Detail page template vs. custom layout.** Is one template sufficient for all three apps, or does an app with a CLI tool vs. a web app need structurally different detail treatment?

4. **Image/screenshot policy.** Steve says "no screenshots of apps that don't exist yet." Do shipped apps get screenshots, or is the design purely typographic? If screenshots are used, who generates and validates them?

5. **When the data generation script gets built.** Is it a v1.1 follow-up, or is it built as a stub now? Elon wants it architecturally ready; Steve doesn't care about the pipeline until it breaks. We need a trigger condition (e.g., "when app count exceeds 6, build the script").

6. **Build pipeline fix.** We killed the meta-files, but the pipeline may still expect them. Does the orchestration layer need a one-time update to allow direct-merge mode, or does the agent self-coordinate without handoff artifacts?

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Agent context exhaustion** reading 9+ source files to ground bullets | High | High | Pre-extract per-app summaries. Limit to 3 bullets per app. If context thins, stop reading and declare "Not enough substance to describe" — that app gets cut from the page. |
| **Weak entry slips onto `/work`** because builder is proud of unfinished work | Medium | Critical | Gate: live demo URL must resolve HTTP 200. No exceptions. SCAFFOLD status auto-excludes from render loop. |
| **Portfolio.ts goes stale** after v1 because nobody updates taglines | Medium | Medium | Schema includes `lastVerified` date. Set calendar trigger: if `lastVerified` > 90 days, rebuild or review. |
| **Pipeline still demands meta-files** after we delete them | Medium | Medium | Orchestrator must update merge protocol before build session begins. If pipeline breaks, meta-file is single-line stub pointing to source, not full spec. |
| **Perfect becomes enemy of shipped** — endless polish on card spacing, typography, copy | High | High | Demo-able is binary. Steve has 24-hour veto window on rendered aesthetics, then we ship. Post-launch commits are encouraged; launch blockers are not. |
| **Build time at scale** (300 apps) with `generateStaticParams` | Low | Medium | Not a v1 risk. Schema is future-proofed. When app count crosses 12, implement build-time script. |
| **Copy drifts into billboard mode** — "revolutionary," "AI-powered," superlatives | Medium | High | Automated lint rule: ban words ["revolutionary", "AI-powered", "cutting-edge", "next-gen"]. Steve spot-checks. |
| **One of the three apps is not actually demo-able** at build time | Medium | Critical | Pre-flight check: verify live URLs before agent begins. If <3 apps pass, page ships with however many pass. Two strong entries beat three with one broken link. |

---

## Final Word

> "The strength of the team is each individual member. The strength of each member is the team."

Elon gave us velocity and truth. Steve gave us taste and curation. The locked decisions are not compromises — they are the synthesis. We ship three apps on a white gallery wall. No search. No scars on the showroom floor. No meta-work. Demo-able is the standard. The frame is invisible. Move on.
