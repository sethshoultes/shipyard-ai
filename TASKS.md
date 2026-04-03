# Shipyard AI — Task Board

**Last dispatch**: 2026-04-03 19:10 UTC
**Dispatcher**: Phil Jackson (Orchestrator)

## Task States
- `open` — Unassigned, ready for pickup
- `assigned` — Dispatched to an agent
- `in-progress` — Agent is actively working
- `review` — Work done, awaiting review
- `done` — Completed and merged/shipped
- `blocked` — Waiting on dependency or human input

---

## P0 — PRD-001 (Shipyard Portfolio Site) — COMPLETE

**Pipeline stage**: SHIPPED
**Token budget**: 575K | **Live**: shipyard-ai.pages.dev

| # | Task | Assigned To | Status | PR | Notes |
|---|------|-------------|--------|-----|-------|
| 13 | Enhance homepage | Steve Jobs | done | #4 | SEO, JSON-LD, tech stack |
| 14 | Enhance services page | Steve Jobs | done | #4 | Pricing cards, detailed descriptions |
| 15 | Enhance about page | Steve Jobs | done | #4 | Agent team, why EmDash |
| 16 | Contact form via Resend | Elon Musk | done | #5,#7 | Cloudflare Worker → Resend |
| 17 | SEO metadata all pages | Steve Jobs | done | #4 | OG, Twitter, JSON-LD per page |
| 18 | Blog placeholder | Sub-agent | in-progress | — | Dispatched 19:10 UTC |
| 19 | Deploy to Cloudflare | Phil Jackson | done | — | shipyard-ai.pages.dev |
| 20 | 3 example EmDash sites | Phil + haiku | done | #8 | Bella's, Peak, Craft & Co |
| 21 | Portfolio page + live links | Phil + haiku | done | #9,#10 | Browser mockups, live URLs |

## P1 — Core Systems — COMPLETE

| # | Task | Assigned To | Status | PR | Notes |
|---|------|-------------|--------|-----|-------|
| 4 | PRD intake system | Elon Musk | done | — | prds/ + TEMPLATE.md |
| 5 | Token credit system | Elon Musk | done | — | pipeline/TOKEN-CREDITS.md |
| 6 | EmDash research | Elon Musk | done | — | deliverables/emdash-platform-research.md |
| 7 | Marketing messaging | Steve Jobs | done | #11 | deliverables/marketing-messaging.md |

## P2 — Operations

| # | Task | Assigned To | Status | PR | Notes |
|---|------|-------------|--------|-----|-------|
| 8 | QA pipeline | Margaret Hamilton | done | #13 | pipeline/qa/ — checklist + run-qa.sh |
| 9 | CI/CD pipeline | Elon Musk | done | #12 | pipeline/deploy/ — deploy.sh + deploy-all.sh |
| 10 | Agent operations runbook | Phil Jackson | in-progress | — | Dispatched 19:10 UTC |

## P3 — Growth

| # | Task | Assigned To | Status | PR | Notes |
|---|------|-------------|--------|-----|-------|
| 11 | Case study template | Steve Jobs | in-progress | — | Dispatched 19:10 UTC |
| 12 | Client onboarding flow | Sara Blakely | in-progress | — | Dispatched 19:10 UTC |

## Blocked

| Issue | Blocker | Action Needed |
|-------|---------|---------------|
| Example sites returning 404 | EmDash needs D1 databases; API token lacks D1 permissions | Owner: create broader CF token or approve DigitalOcean hosting |

---

## Completed (13 PRs merged)

| # | Task | Completed By | Date | PR |
|---|------|-------------|------|-----|
| 1 | Company identity | Steve | 2026-04-03 | — |
| 2 | Website | Steve + Elon | 2026-04-03 | #1 |
| 3 | GitHub repo | Phil | 2026-04-03 | — |
| 4-6 | Core systems | Elon | 2026-04-03 | — |
| 7 | Marketing messaging | Steve | 2026-04-03 | #11 |
| 8 | QA pipeline | Margaret | 2026-04-03 | #13 |
| 9 | CI/CD pipeline | Elon | 2026-04-03 | #12 |
| 13-17 | PRD-001 pages + SEO | Steve + Elon | 2026-04-03 | #4,#5,#7 |
| 19-21 | Deploy + portfolio | Phil | 2026-04-03 | #8,#9,#10 |
