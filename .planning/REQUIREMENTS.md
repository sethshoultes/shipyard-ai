# Requirements: RANK (LocalGenius Benchmark Engine)

**Generated**: 2026-04-14
**Project Slug**: localgenius-benchmark-engine
**Product Name**: RANK
**Source PRD**: `/home/agent/shipyard-ai/prds/localgenius-benchmark-engine.md`
**Source Decisions**: `/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md`

---

## Executive Summary

RANK is a competitive benchmarking system for LocalGenius that shows small business owners how they rank against peers in their category and location. The product delivers one number that answers: "Am I winning?"

**Architecture**: PostgreSQL + Materialized View (no separate data warehouse)
**V1 Scope**: Dashboard Widget + Weekly Email + GBP Integration
**Timeline**: 4 weeks
**Total Artifacts**: 14 files

---

## The Essence (from decisions.md)

> **What is this product REALLY about?**
> One number that answers the question every entrepreneur asks alone at night: Am I winning?

> **What's the feeling it should evoke?**
> Truth that stings — then fire to climb.

> **What's the one thing that must be perfect?**
> The first glance. Before she thinks, she knows.

> **Creative direction:**
> Mirror. Not dashboard.

---

## BLOCKING DECISION

### Public vs. Private Rankings (REQUIRES FOUNDER DECISION)

| Position | Steve Jobs | Elon Musk |
|----------|------------|-----------|
| **Stance** | Private only. Non-negotiable. | Public opt-in badges for Top 20% |
| **Core Argument** | Competition motivates; humiliation doesn't. Public rankings = Yelp, and businesses hate Yelp. | Private-only = zero viral coefficient, zero backlinks, zero press hooks. |

**Phil Jackson's Recommended Compromise:**
1. Rankings: Private by default, always. No public leaderboard.
2. Badges: Opt-in only for businesses above threshold (Top 20%). No forced exposure.
3. Reports: Aggregated category benchmarks only. No individual business names without consent.

**Build Implications (if approved):**
- Add `badge_opt_in` boolean to user settings (default: false)
- Add `/embed/badge.svg` endpoint for website embed
- Public reports show category averages, not individual rankings

**STATUS: BLOCKING — Requires founder decision before schema design.**

---

## Database Requirements

### REQ-DB-001: business_metrics Table
**Source**: PRD lines 248-253; Decisions line 43
**Description**: Append-only metrics table with daily timestamped entries.
**Schema**:
```sql
business_id: uuid
date: date
category: text (restaurants | home_services | retail)
location_city: text
location_metro: text
location_state: text
review_count: integer
avg_rating: decimal(2,1)
review_velocity: decimal(4,1) -- reviews per month
response_rate: decimal(5,2) -- percentage 0-100
avg_response_time_hours: integer
created_at: timestamp
```
**Status**: V1 MUST HAVE

### REQ-DB-002: weekly_rankings Materialized View
**Source**: Decisions line 43
**Description**: ~30 lines SQL materialized view for ranking computation.
**Schema**:
```sql
business_id: uuid
week_of: date
category: text
location_level: text (city | metro | state)
location_value: text
rank: integer
total_in_cohort: integer
percentile: decimal(5,2)
composite_score: decimal(6,4)
previous_rank: integer
rank_change: integer
component_scores: jsonb -- breakdown for "why" explanation
```
**Refresh**: Weekly (Sunday 6pm, before Monday email)
**Status**: V1 MUST HAVE

### REQ-DB-003: Minimum Cohort Size Constraint
**Source**: PRD line 72; Decisions line 103
**Rule**: No rankings shown for cohorts with N < 10 businesses.
**Fallback**: Show "Insufficient data for ranking" instead of garbage ranks.
**Status**: V1 MUST HAVE

### REQ-DB-004: Data Freshness Rules
**Source**: PRD line 74
**Rules**:
- Metrics updated daily via GBP sync
- Aggregates (rankings) recalculated weekly
- Dashboard shows daily-fresh rank; email sends weekly snapshot
**Status**: V1 MUST HAVE

### REQ-DB-005: Data Retention Policy
**Source**: PRD line 280
**Rules**:
- Raw metrics: Retained 2 years
- Aggregates: Retained indefinitely
**Status**: V1 MUST HAVE

---

## API Requirements

### REQ-API-001: Google OAuth Flow
**Source**: Decisions line 195
**Build Artifact**: `api/auth/google-oauth.ts`
**Scope**: `https://www.googleapis.com/auth/business.manage`
**Implementation**: Reuse existing LocalGenius OAuth pattern at `/home/agent/localgenius/src/services/google-business.ts`
**Status**: V1 MUST HAVE

### REQ-API-002: OAuth Failure UX
**Source**: Decisions line 270
**Requirements**:
- Clear error message on denial
- "Reconnect" button
- Preserve last-known rank with timestamp
**Status**: V1 MUST HAVE

### REQ-API-003: GBP Daily Data Sync
**Source**: Decisions line 195
**Build Artifact**: `api/data/gbp-sync.ts`
**Data Pulled**: review_count, avg_rating, response_time
**Caching**: 24-hour minimum cache
**Rate Limiting**: Exponential backoff, staggered 6-hour window
**Status**: V1 MUST HAVE

### REQ-API-004: GBP API Cost Controls
**Source**: Decisions line 267, 291
**Requirements**:
- 24-hour cache minimum
- Exponential backoff on failures
- Stagger sync across 6-hour window
- Priority queue: active businesses daily, inactive weekly
**Estimate**: 5K customers x daily pulls = $500+/month
**Status**: V1 MUST HAVE

### REQ-API-005: Ranking Calculation Endpoint
**Source**: Decisions line 228
**Build Artifact**: `api/rank/calculate.ts`
**Triggered By**: Weekly cron + materialized view refresh
**Status**: V1 MUST HAVE

---

## UI Requirements

### REQ-UI-001: RankWidget Component
**Source**: Decisions lines 31, 193, 240
**Build Artifact**: `ui/components/RankWidget.tsx`
**Display Elements**:
- Rank number (prominent): "#8"
- Cohort size: "of 47"
- Direction arrow: up/down/neutral
- Cohort context: "Austin Mexican Restaurants"
- Percentile: "Top 17%"
- One actionable insight: "2 reviews away from #7"
**Voice**: Confident Coach (NOT cheerful assistant)
**Status**: V1 MUST HAVE

### REQ-UI-002: TrendLine Component
**Source**: Decisions lines 198, 241
**Build Artifact**: `ui/components/TrendLine.tsx`
**Display**: 4-week rank history sparkline (SVG, no chart library)
**Status**: V1 MUST HAVE

### REQ-UI-003: Dashboard Page
**Source**: Decisions lines 198, 243
**Build Artifact**: `ui/pages/dashboard.tsx`
**Layout**:
- First view: Big number (#8 of 47), direction, one action
- Second view: Why (component scores breakdown)
- Third view: How (specific improvement actions)
**Status**: V1 MUST HAVE

### REQ-UI-004: Insufficient Data State
**Source**: Decisions line 269
**Trigger**: Cohort size < 10 at all geography levels
**Display**: "Insufficient data for ranking" card
**Status**: V1 MUST HAVE

### REQ-UI-005: Mirror, Not Dashboard Philosophy
**Source**: Decisions lines 23, 30-31
**Principle**: First-second emotional clarity
**Rules**:
- No charts or tables on first view
- Big number = emotional punch
- UX flow: Rank -> Why -> How
**Status**: V1 MUST HAVE

---

## Email Requirements

### REQ-EMAIL-001: Weekly Rank Email Template
**Source**: PRD lines 123-142; Decisions line 194
**Build Artifact**: `email/templates/weekly-rank.html` (React component via Resend)
**Frequency**: Mondays 8am (recipient local time)
**Status**: V1 MUST HAVE

### REQ-EMAIL-002: Email Subject Line
**Source**: PRD line 125
**Format**: "Your ranking this week: #8 (+2)"
**Status**: V1 MUST HAVE

### REQ-EMAIL-003: Email Content Structure
**Source**: PRD lines 130-140; Decisions line 91
**Sections**:
1. Rank position + cohort: "Austin Mexican Restaurants: #8 of 47 (Top 17%)"
2. "What helped" (2-3 positive actions)
3. "To reach [next rank]" (2-3 specific gaps)
**Voice**: Coach ("Respond faster. Top performers: 2 hours. You: 8.")
**NOT**: "Your response rate is below the benchmark average of 62%..."
**Status**: V1 MUST HAVE

### REQ-EMAIL-004: Email Deliverability Requirements
**Source**: Decisions line 286
**Requirements**:
- Use SendGrid or Postmark (not in-house)
- Domain warmup pre-launch (2 weeks)
- Weekly spam rate monitoring
- One-click unsubscribe in footer
- CAN-SPAM compliant headers
**Status**: V1 MUST HAVE

---

## Business Logic Requirements

### REQ-BL-001: Composite Score Algorithm
**Source**: PRD lines 101-106; Decisions line 115
**Weights**:
| Metric | Weight | Source |
|--------|--------|--------|
| Review count | 25% | GBP API (commodity) |
| Average rating | 25% | GBP API (commodity) |
| Review velocity | 20% | Calculated |
| Response rate | 15% | LocalGenius (proprietary) |
| Response time | 15% | LocalGenius (proprietary) |

**Key Decision (Decisions line 115)**: Weight proprietary signals (response time, posting frequency) higher than commodity signals. Document weights explicitly in `rank_businesses.sql`.
**Status**: V1 MUST HAVE

### REQ-BL-002: Dynamic Cohort Sizing
**Source**: Decisions lines 96, 103
**Build Artifact**: `config/cohorts.ts`
**Hierarchy**: city (preferred) -> metro -> state
**Rule**: Expand geography until N >= 10
**Fallback**: If state-level < 10, show "Insufficient data"
**Status**: V1 MUST HAVE

### REQ-BL-003: V1 Category Scope
**Source**: Decisions lines 47, 55
**Build Artifact**: `config/categories.ts`
**Allowed Values**: `['restaurants', 'home_services', 'retail']`
**Rule**: No additional categories in V1. Expansion is V2.
**Status**: V1 MUST HAVE

### REQ-BL-004: Category Classification
**Source**: Decisions line 268
**Rule**: Trust Google's primary category in V1
**User Override**: Not in V1. Add approval queue in V1.1.
**Status**: V1 MUST HAVE

### REQ-BL-005: Bottom-Rank Handling
**Source**: Decisions line 273
**Rule**: Never display "You're last" for #47 of 47
**Alternative**: "Room to climb. Here's your next move."
**Focus**: Progress over position
**Status**: V1 MUST HAVE

### REQ-BL-006: Algorithm Transparency
**Source**: Decisions line 272
**Requirement**: Show basic "why" explanation
**Format**: "You're #8 because: response time #3, review velocity #5"
**Location**: Secondary view in dashboard
**Status**: V1 MUST HAVE

---

## Configuration Requirements

### REQ-CONFIG-001: categories.ts
**Source**: Decisions line 249
**Content**:
```typescript
export const RANK_CATEGORIES = ['restaurants', 'home_services', 'retail'] as const;
export type RankCategory = typeof RANK_CATEGORIES[number];
```
**Status**: V1 MUST HAVE

### REQ-CONFIG-002: cohorts.ts
**Source**: Decisions line 248
**Content**:
```typescript
export const MIN_COHORT_SIZE = 10;
export const GEOGRAPHY_HIERARCHY = ['city', 'metro', 'state'] as const;
export type GeographyLevel = typeof GEOGRAPHY_HIERARCHY[number];
```
**Status**: V1 MUST HAVE

### REQ-CONFIG-003: Ranking Algorithm Weights
**Source**: Decisions line 115
**Location**: `db/functions/rank_businesses.sql` with inline documentation
**Status**: V1 MUST HAVE

### REQ-CONFIG-004: Timing Configuration
**Source**: Decisions line 271
**Rules**:
- Dashboard rank: Daily recalc
- Weekly email: Monday 8am (fresh calc from Sunday 6pm)
- GBP sync: Daily with 24hr cache
**Status**: V1 MUST HAVE

---

## Explicitly CUT from V1

| Feature | Source | Rationale | Revisit Trigger |
|---------|--------|-----------|-----------------|
| Conversational interface/chatbot | Decisions line 204 | "Cool demo, zero validated user demand" | Post-PMF validation |
| Monthly performance reports | Decisions line 205 | Redundant with weekly email | Weekly open rate > 40% |
| Seasonal adjustments | Decisions line 206 | Premature optimization | 6 months of data collected |
| Multi-location businesses | Decisions line 207 | Complexity; separate ranking needed | >50 customer requests |
| Website analytics | Decisions line 67 | Consent nightmare, tracking fragmentation | Reliable source identified |
| Social metrics (FB/IG) | Decisions line 67 | Platform APIs hostile | API stability confirmed |
| Additional categories (6+) | Decisions line 55 | Cohort density insufficient | 500+ businesses per category |
| Gamification badges | Decisions line 211 | "Business owners want respect, not stickers" | Never |
| Public badges/embeds | Decisions line 212 | Deadlocked - pending founder decision | Founder approval |
| Competitor alerts | Decisions line 213 | Creates anxiety, not motivation | Post-launch user feedback |
| Full-screen mobile | Decisions line 214 | Widget-first validation | Engagement validated |
| Customizable dashboards | Decisions line 149 | Choice paralysis kills engagement | Never |

---

## File Structure (14 Artifacts)

```
rank/
├── api/
│   ├── auth/
│   │   └── google-oauth.ts          [REQ-API-001, REQ-API-002]
│   ├── data/
│   │   └── gbp-sync.ts              [REQ-API-003, REQ-API-004]
│   └── rank/
│       └── calculate.ts             [REQ-API-005]
├── db/
│   ├── migrations/
│   │   ├── 001_business_metrics.sql [REQ-DB-001]
│   │   └── 002_weekly_rankings.sql  [REQ-DB-002]
│   └── functions/
│       └── rank_businesses.sql      [REQ-BL-001, REQ-CONFIG-003]
├── jobs/
│   ├── daily-sync.ts                [REQ-API-003]
│   └── weekly-email.ts              [REQ-EMAIL-001]
├── ui/
│   ├── components/
│   │   ├── RankWidget.tsx           [REQ-UI-001]
│   │   └── TrendLine.tsx            [REQ-UI-002]
│   └── pages/
│       └── dashboard.tsx            [REQ-UI-003, REQ-UI-004]
├── email/
│   └── templates/
│       └── weekly-rank.html         [REQ-EMAIL-001, REQ-EMAIL-002, REQ-EMAIL-003]
└── config/
    ├── cohorts.ts                   [REQ-CONFIG-002]
    └── categories.ts                [REQ-CONFIG-001]
```

---

## Integration with LocalGenius Platform

**Codebase Scout confirmed**: RANK integrates with existing LocalGenius platform at `/home/agent/localgenius/`.

**Existing Patterns to Follow**:
| Resource | Location | RANK Usage |
|----------|----------|------------|
| Database schema | `src/db/schema.ts` | Extend with rank.* schema |
| Auth middleware | `src/api/middleware/auth.ts` | Reuse for protected endpoints |
| Email service | `src/services/email.ts` | Use Resend + React templates |
| GBP integration | `src/services/google-business.ts` | Follow OAuth pattern |
| Digest service | `src/services/digest.ts` | Adapt for weekly rank email |
| Cron pattern | `src/app/api/cron/google-sync/route.ts` | Follow for daily-sync |
| Logger utility | `src/lib/logger.ts` | Use structured logging |
| Encryption | `src/lib/encryption.ts` | Encrypt OAuth tokens |

**Key Discovery**: `benchmark_aggregates` table already exists in LocalGenius schema with similar structure to RANK requirements.

---

## Risk Mitigations (from Risk Scanner)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| GBP API rate limits | HIGH | MEDIUM | 24hr cache, exponential backoff, staggered sync |
| OAuth drop-off | HIGH | MEDIUM | Pre-permission value prop, clear error UX |
| Email deliverability | MEDIUM | HIGH | SendGrid, domain warmup, spam monitoring |
| Cohort sparsity (N<10) | HIGH | HIGH | Dynamic geography expansion, "Insufficient data" fallback |
| Low-ranked user churn | MEDIUM | HIGH | Coach voice, progress focus, never show "last" |
| Category misclassification | HIGH | MEDIUM | Trust Google V1, user override V1.1 |
| Ranking feels arbitrary | MEDIUM | MEDIUM | Show "why" explanation, algorithm transparency |
| Data freshness mismatch | MEDIUM | MEDIUM | Daily dashboard, fresh Sunday calc for Monday email |

---

## Success Criteria (from PRD)

- [ ] 100+ businesses have rankings
- [ ] At least 3 categories with 10+ business cohorts (restaurants, home_services, retail)
- [ ] Weekly email sent to all customers with rankings
- [ ] Dashboard shows ranking widget
- [ ] Open rate on weekly email > 15%

---

## Version

- **Specification Version**: 1.0
- **Last Updated**: 2026-04-14
- **PRD Source**: `prds/localgenius-benchmark-engine.md`
- **Decisions Source**: `rounds/localgenius-benchmark-engine/decisions.md`
- **Integration Target**: `/home/agent/localgenius/`
