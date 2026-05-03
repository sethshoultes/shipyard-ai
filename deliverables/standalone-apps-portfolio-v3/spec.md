# Standalone Apps Portfolio v3 — Specification

**Slug:** `standalone-apps-portfolio-v3`
**Project:** `website` (shipyard.company)
**Type:** Feature — content + routing
**Priority:** P1
**Date:** 2026-05-03
**Version:** v3 (pre-researched, no read-existing)

---

## Goals

From the PRD, this feature aims to create a portfolio of standalone apps and developer tools that came out of the Shipyard pipeline. The goals are:

1. **Static export, zero runtime** — Build once, deploy anywhere. No client-side JavaScript required.
2. **Manifesto-first presentation** — Answer "why" not "what" in the first 30 seconds. No badges, no confetti.
3. **Narrative depth** — Detail pages must deepen the story, never reate what's already shown on the cards.
4. **Brand voice consistency** — "We craft tools we wish existed" — opinion made visible through every element.
5. **Minimal, crafted UI** — Native WordPress admin patterns elevated with tight spacing and precise typography.

---

## Implementation Approach

### Architecture Decisions

- **Next.js static export** with Server Components only (zero client JS)
- **Single `portfolio.ts` data file** consumed by every route
- **`generateStaticParams`** for `[slug]` dynamic routes
- **No gradients, no pulses, no theater** — clean, confident design
- **Auto-generated OG images** via `@vercel/og` for sharable assets

### File Structure

All work in `/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/`:

1. `spec.md` — This specification document
2. `todo.md` — Task checklist with verification steps
3. `portfolio.ts` — Data file with 3 app entries (Tuned, Beam, Promptfolio)
4. `work-section.tsx` — Drop-in JSX section for `/work` page
5. `portfolio-slug-page.tsx` — Next.js dynamic `[slug]` page
6. `tests/portfolio-data.test.ts` — Node --test validation script
7. `MIGRATION.md` — Instructions for human integration

### Data Model

```typescript
export type AppEntry = {
  slug: string;
  name: string;
  tagline: string;
  status: "SHIPPED" | "BUILD" | "SCAFFOLD";
  github: string;
  features: string[];
  techStack: string[];
  accent: "amber" | "rose" | "teal" | "cyan" | "lime" | "fuchsia";
};
```

### Content Strategy

- **Three apps only**: Tuned (BUILD), Beam/Commandbar (SHIPPED), Promptfolio (BUILD)
- **No SCAFFOLD entries** — dead code eliminated per debate decisions
- **Feature lists moved below fold** — main visual path is badge-free
- **Specific CTAs only** — no generic "Start a Project" buttons

---

## Verification Criteria

### Acceptance Criteria

1. **All 7 files exist** in `deliverables/standalone-apps-portfolio-v3/`
2. **`portfolio.ts` matches verbatim** — no improvisation from the exact strings provided in PRD
3. **Node test passes** — `node --test --import tsx tests/portfolio-data.test.ts` exits 0
4. **TypeScript compiles** — `npx tsc --noEmit work-section.tsx portfolio-slug-page.tsx portfolio.ts` exits 0
5. **No banned content** — `grep -riE 'TODO|FIXME|lorem|coming soon|placeholder'` returns nothing
6. **Line count sanity** — Total lines of `portfolio.ts` + `work-section.tsx` + `portfolio-slug-page.tsx` ≥ 200

### Component-Level Verification

#### `portfolio.ts`
- Contains exactly 3 apps: tuned, promptfolio, commandbar
- Each entry has all required fields: slug, name, tagline, status, github, features, techStack, accent
- GitHub URLs match pattern: `https://github.com/sethshoultes/shipyard-ai/tree/main/projects/[slug]`
- All taglines ≤ 140 characters
- Feature arrays contain 3-5 items each
- Tech stack arrays contain ≥ 1 item each

#### `work-section.tsx`
- Imports `apps` from `./portfolio`
- Renders `AppsAndToolsSection` component
- Status badges use correct CSS classes for SHIPPED/BUILD/SCAFFOLD
- Accent colors applied correctly per app
- GitHub links open in new tab with proper attributes
- "Read more" links only shown for non-SCAFFOLD apps

#### `portfolio-slug-page.tsx`
- Generates static params for all non-SCAFFOLD apps
- Generates proper metadata for SEO/social sharing
- 404s for SCAFFOLD or unknown slugs
- Renders structured layout: header → features → tech stack → source link → footer
- Source link section is styled and clickable

#### `tests/portfolio-data.test.ts`
- Validates 3 entries exist
- Checks all required fields present
- Validates GitHub URL patterns
- Ensures slug uniqueness
- Enforces tagline length limits

### Integration Verification

- Static export completes without errors
- OG images generate for each app slug
- TypeScript types resolve correctly
- Import/export chains are valid
- No circular dependencies

---

## File Creation List

### New Files to Create

1. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/spec.md`**
   - This specification document
   - Content: Goals, approach, verification criteria, file list

2. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/todo.md`**
   - Task breakdown with checkboxes
   - Format: "- [ ] Task description — verify: how to check it worked"

3. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/portfolio.ts`**
   - Verbatim content from PRD §EXACT contents
   - Contains AppEntry type and apps array with 3 entries

4. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/work-section.tsx`**
   - Verbatim content from PRD §EXACT contents
   - React component for /work page section

5. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/portfolio-slug-page.tsx`**
   - Verbatim content from PRD §EXACT contents
   - Next.js dynamic route page for individual app pages

6. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/tests/portfolio-data.test.ts`**
   - Verbatim content from PRD §EXACT contents
   - Node --test validation script

7. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/MIGRATION.md`**
   - 6-line version from PRD
   - Instructions for human integration into main website

### Test Scripts to Create

1. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/tests/check-files.sh`**
   - Verify all 7 files exist
   - Check file permissions
   - Exit 0 on success, non-zero on failure

2. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/tests/check-no-banned-content.sh`**
   - Grep for banned patterns
   - Verify no TODO/FIXME/lorem/etc.
   - Exit 0 on clean, non-zero on violations

3. **`/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/tests/check-line-count.sh`**
   - Count lines in the three source files
   - Verify total ≥ 200
   - Exit 0 on pass, non-zero on fail

---

## Out of Scope

Per PRD specifications, these items are explicitly out of scope for v1:

- **Editing `website/src/` directly** — Build into `deliverables/` only, human integrates per MIGRATION.md
- **Screenshots** — No browser mockups or images in v1
- **Live demos** — No functional demos, only static content
- **Additional 4 apps** — agentpipe, whisper, scribe, cut excluded until they have real code
- **CMS abstraction** — Monolith `portfolio.ts` accepted for 3 apps, abstraction deferred to post-distribution
- **Pagination/search** — Not needed for 3 apps, deferred to v2
- **Status badges in main visual path** — Moved below fold or removed entirely per debate decisions
- **Generic CTAs** — All buttons must be specific about their action

---

## Success Metrics

The build is successful when:

1. **All acceptance criteria pass** — Verified by automated tests
2. **Static export completes** — No build errors
3. **Content quality** — No placeholders, all copy is final and brand-aligned
4. **Type safety** — TypeScript compilation succeeds
5. **Migration readiness** — Human can follow MIGRATION.md to integrate

---

## Integration Notes

This deliverable is designed as a **drop-in feature** for the main shipyard.company website:

- The `work-section.tsx` can be imported and rendered in the existing `/work` page
- The `portfolio-slug-page.tsx` becomes the new dynamic route under `/portfolio/[slug]`
- All dependencies are external imports from the main website (Next.js, React, etc.)
- No build-time configuration changes required
- OG image generation will work with existing `/api/og/route.tsx` infrastructure

The approach minimizes integration risk while delivering a complete, tested feature that honors all debate decisions and PRD requirements.