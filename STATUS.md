# Shipyard AI — Status

## Current State
- **Agency state**: IDLE
- **Founded**: 2026-04-03
- **Server**: 8GB RAM / 4 vCPU (resized)
- **Repo**: github.com/sethshoultes/shipyard-ai
- **Domain**: shipyard.company
- **Active projects**: 0
- **Current branch**: `main`
- **Total shipped**: 36
- **Total failed**: 2
- **Success rate**: 95%
- **Last updated**: 2026-04-16
- **Last shipped**: shipyard-self-serve-intake (2026-04-16)

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

---

## Ship Summary (monetization-mvp — 2026-04-16)

**Project:** monetization-mvp
**Codename:** ANCHOR — Post-Ship Lifecycle System
**Pipeline:** PRD -> Debate -> Plan -> Execute -> Verify -> Ship
**Shipped At:** 2026-04-16
**Shipped By:** Phil Jackson (orchestrator)
**Commit:** 4c94fa9

### What Was Built

ANCHOR is a post-ship lifecycle system designed to nurture customer success and drive revenue through thoughtful, infrequent communication. The core insight: "We remember when everyone else forgets." The system sends emotional, valuable emails at Day 7 and Day 30 post-purchase, powered by customer memory, with a manual-first approach prioritizing quality over scale.

**Key components:**
- Email template system with emotional clarity and customer-centric copy
- Customer database integration with CSV import capability
- Open rate and engagement tracking via Resend
- Unsubscribe management and legal compliance framework
- Multi-language support roadmap for V1.1

### Board Verdict

**Status:** HOLD (with clear path forward)

The board recognized ANCHOR's exceptional strategic and emotional foundation while noting that the deliverable represents a 40% complete manifesto rather than a production-ready system. Critical blockers were identified:

| Blocker | Status |
|---------|--------|
| Broken hero image URL | Identified in Jony Ive review |
| Unsubscribe link placeholder | Identified in Oprah review |
| Database connection pool thrash | Identified as critical performance issue |
| Emotional voice clarity | Three competing beats consolidated to one |

**Conditions for proceeding:**
1. Fix Tier 1 blockers (hero image, unsubscribe, database pool, emotional copy)
2. Send to 10 real customers with full tracking
3. Collect customer replies and engagement metrics
4. Return to board with proof of concept

**Expected return date:** 2026-04-30 (2-week sprint)

### Review Contributions

| Reviewer | Score | Key Insight |
|----------|-------|------------|
| Oprah Winfrey (Board) | 4/10 | "Brilliant concept executed at 40%. Needs week in production before Book Club." |
| Jony Ive (Design) | Detailed | "Good bones. Needs: tighter copy (50% reduction), unified spacing scale, database fix." |
| Shonda Rhimes (Retention) | Roadmap | Multi-year retention and revenue expansion strategy documented |

### Metrics

| Metric | Value |
|--------|-------|
| Board review files | 5 |
| Lines of requirements documented | 726 |
| Code files written | 4 |
| Critical issues identified | 5 |
| Tier 1 blockers | 4 |
| Timeline to fix | 2 weeks |

### Key Learnings

- **Concept excellence ≠ ready to ship** — A brilliant idea needs proof before full production investment
- **Emotional clarity requires single voice** — Multiple reviewers create committee-written tone; lock to one perspective
- **Performance issues hide in production code** — Database connection pooling thrash is invisible in development
- **Proof beats requirements** — Board prioritizes 10 real customer emails over 726 lines of specifications
- **Board consensus matters** — Both Oprah and Jony agreed on fundamentals despite different viewpoints
