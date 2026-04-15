# Shipyard AI — Status

## Current State
- **Agency state**: IDLE
- **Founded**: 2026-04-03
- **Server**: 8GB RAM / 4 vCPU (resized)
- **Repo**: github.com/sethshoultes/shipyard-ai
- **Domain**: shipyard.company
- **Active projects**: 0
- **Current branch**: `feature/scoreboard-update-execution`
- **Total shipped**: 32
- **Total failed**: 2
- **Success rate**: 94%
- **Last updated**: 2026-04-15

## Active Project: PRD-001 (Shipyard Portfolio)

| Field | Value |
|-------|-------|
| Stage | BUILD (debate complete) |
| Token budget | 575K |
| Pages | Home, Services, About, Contact, Blog (nice-to-have) |
| Stack | Next.js + Tailwind (existing website/) |
| Deploy target | Vercel or Cloudflare Pages |
| Locked decisions | See projects/shipyard-portfolio/debate/round-1-decisions.md |

## Cron Jobs

| Job | Schedule | Status |
|-----|----------|--------|
| Phil dispatch | */29 min | Active (c58bb85d) |
| Jensen review | :17 hourly | Active (61e40285) |
| Heartbeat | */5 min | Active (20c457c6) |

## Infrastructure
- **Repo**: sethshoultes/shipyard-ai (pushed to GitHub)
- **Website**: PR #1 merged. QA P0s fixed on `fix/qa-p0s` branch.
- **Pipeline docs**: pipeline/ARCHITECTURE.md, pipeline/TOKEN-CREDITS.md
- **PRD template**: prds/TEMPLATE.md
- **Emdash research**: deliverables/emdash-platform-research.md
- **QA report**: qa-report-001.md (Margaret, first pass — 3 P0s, 5 P1s, 4 P2s)
- **great-minds-plugin**: pulled latest (up to date)

## QA P0 Fix Status (Complete)
| P0 Issue | Status |
|----------|--------|
| P0-A11Y-001: dangerouslySetInnerHTML | FIXED |
| P0-A11Y-002: No mobile nav | FIXED |
| P0-A11Y-003 / P0-SEC-001: Broken contact form | FIXED |

## Active Project: PRD-002 (Shipwright — Auto-Pipeline)

| Field | Value |
|-------|-------|
| Stage | PLAN (debate complete) |
| Token budget | 500K |
| Product name | Shipwright — "Describe it. It's live." |
| Stack | GitHub Actions + Workers AI + Cloudflare (Workers/D1/R2) |
| Deploy target | `preview.shipwright.site/{slug}` |
| Locked decisions | rounds/002-auto-pipeline/decisions.md |
| Rick Rubin essence | rounds/002-auto-pipeline/rick-rubin-essence.md |
| Debate rounds | 2 complete (Steve + Elon, full convergence) |

### v1 Scope (3 pipeline steps)
1. Parse PRD (Workers AI from GitHub issue)
2. Generate seed + deploy to Cloudflare preview
3. Comment formatted URL on issue

### The 3 Things That Matter (Rick Rubin)
1. Simplicity is the interface — PRD in, URL out, nothing else
2. Design system is non-negotiable — curated lookup tables, not random generation
3. Every failure must speak — labeled, logged, commented back on the issue

## Next Steps
1. PLAN phase: Directors define sub-agent teams + assignments in `team/`
2. BUILD phase: Parallel agent execution (workflow, parser, seed generator, commenter)
3. QA pass by Margaret
4. Deploy + open-source the reusable workflow
