# Shipyard AI — Task Board

**Last dispatch**: 2026-04-03 17:30 UTC
**Dispatcher**: Phil Jackson (Orchestrator)

## Task States
- `open` — Unassigned, ready for pickup
- `assigned` — Dispatched to an agent
- `in-progress` — Agent is actively working
- `review` — Work done, awaiting review
- `done` — Completed and merged/shipped
- `blocked` — Waiting on dependency or human input

---

## P0 — ACTIVE: PRD-001 (Shipyard Portfolio Site)

**Pipeline stage**: DEBATE complete, entering BUILD
**Token budget**: 575K

| # | Task | Assigned To | Status | Branch | Notes |
|---|------|-------------|--------|--------|-------|
| 13 | PRD-001: Enhance homepage — refine copy, add SEO, JSON-LD | Steve Jobs | open | feature/prd-001-build | Hero, services grid, process, tech stack, CTA |
| 14 | PRD-001: Enhance services page — pricing cards, detailed descriptions | Steve Jobs | open | feature/prd-001-build | Sites $2.5K, Themes $1.5K, Plugins $1K, Migration $3.5K |
| 15 | PRD-001: Enhance about page — agent team, principles, why EmDash | Steve Jobs | open | feature/prd-001-build | Show the agent roster as a selling point |
| 16 | PRD-001: Build contact form — PRD submission | Elon Musk | open | feature/prd-001-build | Static form → Formspree or mailto |
| 17 | PRD-001: Add SEO metadata to all pages | Steve Jobs | open | feature/prd-001-build | OG, Twitter cards, JSON-LD Organization + SoftwareApplication |
| 18 | PRD-001: Blog placeholder (3 teaser posts) | Sub-agent (haiku) | open | feature/prd-001-build | Nice-to-have, only if token budget allows |
| 19 | PRD-001: QA pass + deploy | Margaret Hamilton | open | — | Build, a11y, lighthouse, deploy to Vercel |

## P1 — Core Systems

| # | Task | Assigned To | Status | Branch | Notes |
|---|------|-------------|--------|--------|-------|
| 4 | Design PRD intake system | Elon Musk | done | — | Implemented via prds/ directory + TEMPLATE.md |
| 5 | Design token credit system | Elon Musk | done | — | Documented in pipeline/TOKEN-CREDITS.md |
| 6 | Emdash platform integration research | Elon Musk | done | — | deliverables/emdash-platform-research.md |
| 7 | Marketing messaging + positioning | Steve Jobs | open | — | How we explain Shipyard AI to clients |

## P2 — Operations

| # | Task | Assigned To | Status | Branch | Notes |
|---|------|-------------|--------|--------|-------|
| 8 | QA pipeline setup | Margaret Hamilton | open | — | Automated testing for sites/themes/plugins we build |
| 9 | CI/CD for client projects | Elon Musk | open | — | Template pipeline: PRD → build → test → deploy |
| 10 | Agent operating procedures doc | Phil Jackson | open | — | Runbook for how the agency processes a PRD end-to-end |

## P3 — Growth

| # | Task | Assigned To | Status | Branch | Notes |
|---|------|-------------|--------|--------|-------|
| 11 | Case study template | Steve Jobs | open | — | Portfolio piece format for completed projects |
| 12 | Client onboarding flow | Sara Blakely | open | — | First-time client experience |

---

## Completed

| # | Task | Completed By | Date | PR |
|---|------|-------------|------|-----|
| 1 | Company identity | Steve Jobs | 2026-04-03 | — |
| 2 | Build company website | Steve + Elon | 2026-04-03 | PR #1 |
| 3 | Create GitHub repo + push | Phil Jackson | 2026-04-03 | — |
| — | Wire crons (dispatch, Jensen, heartbeat) | Phil Jackson | 2026-04-03 | — |
| — | PRD-001 intake + debate | Phil Jackson | 2026-04-03 | — |
