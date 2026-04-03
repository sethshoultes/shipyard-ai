# Shipyard AI — Status

## Current State
- **Agency state**: operational
- **Founded**: 2026-04-03
- **Repo**: github.com/sethshoultes/shipyard-ai (public)
- **Pipeline**: architecture complete, first real PRD needed
- **Active projects**: 0
- **Current branch**: `fix/qa-p0s` — QA P0 fixes in progress

## Infrastructure
- **Repo**: sethshoultes/shipyard-ai (pushed to GitHub)
- **Website**: PR #1 merged. QA P0s fixed on `fix/qa-p0s` branch — needs PR to main.
- **Pipeline docs**: pipeline/ARCHITECTURE.md, pipeline/TOKEN-CREDITS.md
- **PRD template**: prds/TEMPLATE.md
- **Emdash research**: deliverables/emdash-platform-research.md
- **QA report**: qa-report-001.md (Margaret, first pass — 3 P0s, 5 P1s, 4 P2s)
- **great-minds-plugin**: pulled latest (up to date)

## QA P0 Fix Status
| P0 Issue | Status |
|----------|--------|
| P0-A11Y-001: dangerouslySetInnerHTML | FIXED — unicode + aria-hidden |
| P0-A11Y-002: No mobile nav | FIXED — MobileNav component |
| P0-A11Y-003 / P0-SEC-001: Broken contact form | FIXED — Server Action + validation + honeypot |

## P1 Fix Status
| P1 Issue | Status |
|----------|--------|
| P1-A11Y-004: Pipeline arrows | FIXED — aria-hidden |
| P1-A11Y-005: Stats bar semantics | FIXED — dl/dt/dd |
| P1-A11Y-006: Muted color contrast | FIXED — #737373 → #8a8a8a |
| P1-SEC-002: CSRF | RESOLVED — Server Actions handle it |
| P1-SEC-003: Rate limiting | PARTIAL — honeypot added, rate limiter TODO |

## Next Steps
1. Commit and PR the QA P0 fixes → merge to main
2. Deploy website to Vercel or Cloudflare
3. Run ONE real PRD through the full pipeline end-to-end
4. Log every token cost to validate the credit model
