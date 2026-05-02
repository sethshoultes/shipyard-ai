# PRD: Standalone Apps Portfolio Pages

**Slug:** `standalone-apps-portfolio`
**Project:** `website` (shipyard.company)
**Type:** Feature — content + routing
**Priority:** P1
**Date:** 2026-05-01

---

## Background

Shipyard has built 7 standalone apps in `/home/agent/shipyard-ai/projects/` beyond the EmDash sites currently shown on `/work`. They are not yet visible on shipyard.company. We want a portfolio surface that:

1. Adds them to the existing `/work` page (matching current style — same hero, card pattern, CTA).
2. Gives each one a dedicated `/portfolio/[slug]` detail page with deeper info and a GitHub link.

Show in-progress apps too — not just shipped. Honesty about state.

## Apps to Include

All 7 live in the monorepo `https://github.com/sethshoultes/shipyard-ai` under `projects/<name>`:

| Slug | Name | One-liner | Status | GitHub |
|---|---|---|---|---|
| `agentpipe` | AgentPipe | Multi-agent pipeline orchestration framework | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/agentpipe |
| `commandbar` | CommandBar | ⌘K command palette for AI-driven web apps | SHIPPED | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/commandbar-prd |
| `whisper` | Whisper Blocks | Voice-to-content authoring blocks for EmDash | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/whisper |
| `promptfolio` | Promptfolio | Next.js portfolio app for AI prompts and outputs | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/promptfolio |
| `scribe` | Scribe | AI-assisted writing/editing tool | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/scribe |
| `cut` | Cut | Video/clip editing utility | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/cut |
| `tuned` | Tuned | LLM tuning + dashboard + SDK + worker stack | BUILD | https://github.com/sethshoultes/shipyard-ai/tree/main/projects/tuned |

**Action item for build agent:** before writing copy, READ each `projects/<name>/` directory (package.json, README if present, source files) and write an accurate one-liner + 3–5 feature bullets per app. Do NOT invent capabilities. If a project is empty or `build/`-only, mark `status: SCAFFOLD` and say so honestly.

## Scope

### 1. Update `/work` page (`src/app/work/page.tsx`)

Add a second section below the existing "Sites we've shipped" section, titled **"Apps & Tools"**. Use the same card pattern as the existing sites/Poster entry. Every entry MUST include:

- Name, one-liner, status badge (`SHIPPED` / `BUILD` / `SCAFFOLD`)
- 3–5 feature bullets (researched from actual source code, not invented)
- Tech-stack chips (e.g., `Next.js`, `TypeScript`, `Cloudflare Worker`)
- Two CTAs: **View on GitHub** (external) and **Read more** → `/portfolio/[slug]`

Update the stats section to reflect new totals (sites + tools + apps).

### 2. New dynamic route `/portfolio/[slug]`

Create `src/app/portfolio/[slug]/page.tsx`. For Next.js static export (this site uses `next build` with static export per `prebuild` script), implement `generateStaticParams()` to pre-render all 7 slugs.

Each page renders:

- Hero with app name, status badge, one-liner
- "About" section — 1–2 paragraphs (honest, including in-progress caveats where applicable)
- "Features" — bulleted, sourced from code reading
- "Tech Stack" — chips
- "Source" — large GitHub link card with repo path + "View on GitHub →"
- (Optional, if README present) screenshot or code snippet
- Footer CTA matching existing site style: "Want something like this? → /contact"

Pull data from a shared `src/lib/portfolio.ts` (or similar) so the `/work` listing and `/portfolio/[slug]` pages use the SAME source of truth. No duplication.

### 3. Metadata & SEO

- Each `/portfolio/[slug]` needs proper `metadata` export (title, description, OG tags) matching the existing pattern in `src/app/work/page.tsx` and `src/app/page.tsx`.
- Add canonical URLs `https://shipyard.company/portfolio/<slug>`.

### 4. Navigation

Existing nav already has `/work`. Do NOT add a new top-level link — `/portfolio/<slug>` is reached via "Read more" buttons on `/work`. (Confirm by reading `src/app/layout.tsx`.)

## Style & Visual Constraints

- Match existing site exactly: dark theme, `border-border`, `bg-surface`, accent gradients per card.
- Pick a distinct gradient/accent color per app (similar to how Bella's = red, Peak Dental = sky, Poster = indigo). Do not reuse the same color twice.
- Use the same browser-mockup chrome on `/work` cards as existing entries.
- Status badges: green for SHIPPED, amber for BUILD, slate for SCAFFOLD.

## Acceptance Criteria

1. `npm run build` in `/home/agent/shipyard-ai/website` succeeds (static export — `next.config.ts` has `output: 'export'`).
2. `out/work/index.html` exists and contains all 7 new apps below the existing 5 entries.
3. `out/portfolio/<slug>/index.html` exists for all 7 slugs.
4. Every GitHub link points to the correct `tree/main/projects/<name>` URL.
5. No duplicated app data — `src/lib/portfolio.ts` (or equivalent) is the single source consumed by both pages.
6. Each app's one-liner + features are derived from reading the actual `projects/<name>/` source. No fabricated capabilities.
7. Lighthouse accessibility score on `/work` and any one `/portfolio/[slug]` page ≥ 95 (run via `lighthouse` CLI or equivalent).
8. Status badges visible on both `/work` cards and detail pages.
9. Existing 5 entries on `/work` are preserved unchanged.
10. CTA at bottom of each detail page links to `/contact`.

## Test Instructions

```bash
cd /home/agent/shipyard-ai/website
npm install
npm run build
# Verify out/ structure
ls out/portfolio/
ls out/work/
# Spot-check rendered HTML for one slug
grep -o 'github.com/sethshoultes/shipyard-ai/tree/main/projects/agentpipe' out/portfolio/agentpipe/index.html
# Should return 1 match minimum
```

## Out of Scope

- Live demo links (most projects don't have hosted demos yet)
- Screenshots — only include if a project has a `public/` or `screenshots/` dir already; do NOT generate placeholder images
- Search/filter UI on `/work`
- Analytics events on the new buttons

## Risks

- **Empty `build/`-only projects** — if `agentpipe`, `whisper`, `scribe`, `cut` truly have nothing to describe, mark them as SCAFFOLD and write the page honestly: "Early stage. The directory exists; substantial code does not." Do not pretend otherwise.
- **Static export gotcha** — Next 16 with `output: 'export'` requires `generateStaticParams()` for dynamic routes. Confirm this works before declaring done.

## Done When

- PR commits to `sethshoultes/shipyard-ai` on a feature branch with `[website]` prefix
- All acceptance criteria pass
- Brief retrospective dropped in `memory/standalone-apps-portfolio-retrospective.md` noting what each project actually is (research benefit for future PRDs)
