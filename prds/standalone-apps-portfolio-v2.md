# PRD: Standalone Apps Portfolio (v2 — scoped)

**Slug:** `standalone-apps-portfolio-v2`
**Project:** `website` (shipyard.company)
**Type:** Feature — content + routing
**Priority:** P1
**Date:** 2026-05-02
**Supersedes:** `standalone-apps-portfolio` (v1 failed — hollow build, 0 source files)

---

## Background

v1 of this PRD failed in the build phase: build agent produced zero source files, deliverables directory empty. Debate and plan phases produced excellent decisions (locked in `rounds/standalone-apps-portfolio/decisions.md` — read those before starting).

This v2 PRD narrows scope and gives the build agent an explicit, file-by-file deliverable shape so it cannot finish without writing code.

## Critical Process Rules (read first)

The pipeline's build gate inspects `/home/agent/shipyard-ai/deliverables/<slug>/` and refuses to ship if fewer than 3 source files exist. Therefore:

1. **All work output goes in `/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2/`** as a self-contained mini-project.
2. **Required files (build will fail without these):**
   - `spec.md` — restatement of this PRD's acceptance criteria
   - `todo.md` — checklist of every file produced, every check off
   - `portfolio.ts` — single source of truth data file (TypeScript)
   - `work-section.tsx` — new section to be merged into `website/src/app/work/page.tsx`
   - `portfolio-slug-page.tsx` — the dynamic `[slug]` page component
   - `tests/portfolio-data.test.ts` — at minimum, validate every slug has required fields and a real GitHub URL
   - `MIGRATION.md` — exact instructions for a human to copy these into `website/src/`
3. **Reference shape:** look at `/home/agent/shipyard-ai/deliverables/shipyard-self-serve-intake/` for a successful self-contained deliverable layout.
4. **Tool calls:** the build agent MUST issue at least one `Write` call per required file above. If you finish the phase without issuing those Writes, the gate fails — there is no negotiating with the gate.

## Locked Decisions (carry from v1 debate)

These were debated and locked in `rounds/standalone-apps-portfolio/decisions.md`. Do not re-debate:

- Static export, zero runtime
- No gradients, no pulses, no theater (Elon's restraint)
- Single `portfolio.ts` consumed by every route
- SCAFFOLD apps get a label on `/work` but **no detail page**
- `generateStaticParams` for `[slug]`, Server Components only
- No screenshots / browser mockups in v1 (revisit when products real)
- Lighthouse threshold: 90 (not 95)
- No search, no filters

## Scope (narrowed from v1)

**v1 covered all 7 apps. v2 covers only the 3 with the most actual code.** The other 4 will be a follow-up PRD once these ship.

### Apps in scope

| Slug | Source Path | Status target |
|---|---|---|
| `tuned` | `projects/tuned/` (cli/dashboard/sdk/worker — most built) | BUILD |
| `promptfolio` | `projects/promptfolio/` (Next.js app w/ app/, components/, lib/) | BUILD |
| `commandbar` | `projects/commandbar-prd/` (deliverables present) | SHIPPED |

For each app, the build agent MUST:

1. Read the project's `package.json`, `README.md` (if present), and at least 3 source files.
2. Write a one-liner (≤ 120 chars) and 3–5 feature bullets grounded in what the code actually does.
3. List actual tech-stack chips (read from `package.json` deps — e.g., Next.js, TypeScript, Hono, Cloudflare Workers).
4. Pick a unique gradient/accent (red, sky, purple, emerald, indigo are taken on `/work` — choose unused).
5. **Do not invent features.** If something looks like a stub, say so. The Essence locked in v1: *"Honesty is rendered through restraint."*

### Out of scope (do NOT do)

- The other 4 apps (agentpipe, whisper, scribe, cut) — follow-up PRD
- Screenshots
- Live demos / hosted URLs
- Search / filter UI
- Editing `website/src/` directly — produce the components in `deliverables/<slug>/` only; human will do the merge per `MIGRATION.md`

## File-by-file Build Instructions

### 1. `deliverables/standalone-apps-portfolio-v2/portfolio.ts`

```ts
export type AppEntry = {
  slug: string;
  name: string;
  tagline: string;          // ≤ 120 chars, derived from real code
  status: 'SHIPPED' | 'BUILD' | 'SCAFFOLD';
  github: string;            // exact URL: https://github.com/sethshoultes/shipyard-ai/tree/main/projects/<dir>
  features: string[];        // 3–5, no fabrication
  techStack: string[];        // chips, e.g., ['Next.js', 'TypeScript']
  accent: 'amber' | 'rose' | 'teal' | 'cyan' | 'lime' | 'fuchsia';  // unused on /work
};

export const apps: AppEntry[] = [/* 3 entries */];
```

### 2. `deliverables/standalone-apps-portfolio-v2/work-section.tsx`

A drop-in JSX section titled **"Apps & Tools"** that maps over `apps` and renders cards in the same visual style as the existing `projects.map()` block in `website/src/app/work/page.tsx`. Status badge on each card. Two CTAs per card: **View on GitHub** (target=_blank) and **Read more** (Next `<Link>` to `/portfolio/<slug>`). SCAFFOLD entries: GitHub link only, no Read more.

### 3. `deliverables/standalone-apps-portfolio-v2/portfolio-slug-page.tsx`

A complete `[slug]/page.tsx` for Next 16 with `output: 'export'`. Must export:

- `generateStaticParams(): Promise<{slug: string}[]>` — returns one entry per non-SCAFFOLD app
- `generateMetadata({params}): Metadata` — title, description, OG, canonical `https://shipyard.company/portfolio/<slug>`
- default async `Page` component

Render: hero (name + status badge + tagline), About paragraph, Features list, Tech Stack chips, big GitHub link card, footer CTA → `/contact`.

### 4. `deliverables/standalone-apps-portfolio-v2/tests/portfolio-data.test.ts`

Run with `node --test` (no extra deps). At minimum verify:

- Every entry has all required fields
- `github` matches `https://github.com/sethshoultes/shipyard-ai/tree/main/projects/.+`
- Slugs unique
- `accent` not in `['blue','red','sky','purple','emerald','indigo']` (already used on /work)
- ≥ 3 features per entry, each ≤ 200 chars
- Tagline ≤ 120 chars

Test must run from the deliverables dir with zero install steps. If TypeScript needed, use `tsx` or compile inline. Acceptance: `node --test tests/portfolio-data.test.ts` exits 0.

### 5. `deliverables/standalone-apps-portfolio-v2/MIGRATION.md`

Step-by-step for a human integrator:

1. Copy `portfolio.ts` → `website/src/lib/portfolio.ts`
2. Open `website/src/app/work/page.tsx`, paste contents of `work-section.tsx` after the existing `</section>` closing the projects map (cite the exact line marker)
3. Create `website/src/app/portfolio/[slug]/page.tsx` from `portfolio-slug-page.tsx`
4. Update stats counters in `WorkPage` hero
5. Run `cd website && npm run build`
6. Verify `out/portfolio/tuned/index.html` etc. exist

### 6. `deliverables/standalone-apps-portfolio-v2/spec.md`

Restate this PRD's acceptance criteria as a numbered list. The build review will check these exist and are addressed.

### 7. `deliverables/standalone-apps-portfolio-v2/todo.md`

Checklist with one item per file above + per acceptance criterion. All boxes ticked when phase ends.

## Acceptance Criteria

1. Deliverables dir contains all 7 required files.
2. `portfolio.ts` has exactly 3 entries: `tuned`, `promptfolio`, `commandbar`.
3. `node --test tests/portfolio-data.test.ts` exits 0.
4. Each entry's GitHub URL is reachable (HTTP 200) — verifiable with curl.
5. Each entry's features are grounded in real code — build review will spot-check by reading `projects/<slug>/`.
6. No banned content: no `lorem ipsum`, no `TODO`, no `coming soon`, no fabricated screenshots.
7. `work-section.tsx` and `portfolio-slug-page.tsx` parse as valid TSX (run `tsc --noEmit` or `npx tsx --check` against them).
8. `MIGRATION.md` instructions are complete enough that a human can apply them in <10 min.

## Test Commands

```bash
cd /home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v2

# 1. file presence
test -f spec.md && test -f todo.md && test -f portfolio.ts \
  && test -f work-section.tsx && test -f portfolio-slug-page.tsx \
  && test -f tests/portfolio-data.test.ts && test -f MIGRATION.md \
  || { echo FAIL; exit 1; }

# 2. data tests
node --test tests/portfolio-data.test.ts

# 3. URL liveness
grep -oE 'https://github\.com/sethshoultes/shipyard-ai/tree/main/projects/[a-z-]+' portfolio.ts \
  | sort -u | xargs -I{} curl -s -o /dev/null -w "%{http_code} {}\n" {}
# every line should start with 200

# 4. tsx syntax
npx --yes tsx --check work-section.tsx portfolio-slug-page.tsx
```

## Risks

- **Build agent skips Write calls** (the v1 failure mode). Mitigation: this PRD names every file explicitly; the gate will fail if any are missing.
- **Project READMEs absent** (true for several). Mitigation: build agent reads source files directly and writes honestly. SCAFFOLD label exists for a reason.
- **Test runner gotchas** with TS in `node --test`. Mitigation: keep test in `.ts` but use `tsx` runner if needed; acceptance is "exits 0" however achieved.

## Done When

- All 8 acceptance criteria pass
- A retrospective at `memory/standalone-apps-portfolio-v2-retrospective.md` notes what each app actually does, what was hard, and what to repeat next cycle
- Daemon moves PRD to `prds/completed/`
