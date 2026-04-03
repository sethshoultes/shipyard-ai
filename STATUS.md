# Shipyard AI — Status

## Current State
- **Agency state**: BUILD (first PRD in pipeline)
- **Founded**: 2026-04-03
- **Server**: 8GB RAM / 4 vCPU (resized)
- **Repo**: github.com/sethshoultes/shipyard-ai
- **Domain**: shipyard.company
- **Active projects**: 1
- **Current branch**: `fix/qa-p0s` — QA P0 fixes done, PRD-001 layered on top

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

## Next Steps
1. BUILD phase: Steve enhances pages, Elon wires contact form
2. QA pass by Margaret
3. Deploy to production at shipyard.company
4. Write case study: "PRD-001: How we built our own site in 24 hours"
