# Phase 1 Plan — RANK (LocalGenius Benchmark Engine)

**Generated**: 2026-04-14
**Project Slug**: localgenius-benchmark-engine
**Product Name**: RANK
**Requirements**: `.planning/REQUIREMENTS.md`
**Total Tasks**: 12
**Waves**: 4
**Estimated Timeline**: 4 weeks

---

## The Essence

From decisions.md:

> **What is this product REALLY about?**
> One number that answers the question every entrepreneur asks alone at night: Am I winning?

> **What's the feeling it should evoke?**
> Truth that stings — then fire to climb.

> **What's the one thing that must be perfect?**
> The first glance. Before she thinks, she knows.

> **Creative direction:**
> Mirror. Not dashboard.

---

## Problem Statement

LocalGenius helps local businesses with AI-powered marketing, but customers operate in isolation. They don't know how they compare to peers. RANK solves this with competitive rankings based on review metrics, response times, and proprietary LocalGenius data.

**Ship Test (from decisions.md):**
> Does she open RANK and instantly know her number, her direction, and her next action?
> If yes, ship it.

---

## BLOCKING ISSUE

**Public vs. Private Rankings** — Requires founder decision before schema design.

**Recommended Resolution**: Accept Phil Jackson's compromise:
1. Rankings: Private by default, always
2. Badges: Opt-in only for Top 20%
3. Reports: Aggregated category benchmarks only

**Proceeding with**: Private-only V1. Badge infrastructure deferred to V1.1 pending founder decision.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-DB-001: business_metrics table | phase-1-task-1 | 1 |
| REQ-DB-002: weekly_rankings view | phase-1-task-2 | 1 |
| REQ-BL-001: Ranking algorithm | phase-1-task-3 | 1 |
| REQ-CONFIG-001: categories.ts | phase-1-task-4 | 1 |
| REQ-CONFIG-002: cohorts.ts | phase-1-task-4 | 1 |
| REQ-API-001: Google OAuth | phase-1-task-5 | 2 |
| REQ-API-003: GBP daily sync | phase-1-task-6 | 2 |
| REQ-UI-001: RankWidget | phase-1-task-7 | 3 |
| REQ-UI-002: TrendLine | phase-1-task-8 | 3 |
| REQ-UI-003: Dashboard page | phase-1-task-9 | 3 |
| REQ-EMAIL-001-004: Weekly email | phase-1-task-10 | 3 |
| REQ-API-005: Ranking calculation | phase-1-task-11 | 4 |
| Integration testing | phase-1-task-12 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Database Foundation + Config

Four independent tasks that establish the data layer and configuration.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Create business_metrics table migration</title>
  <requirement>REQ-DB-001, REQ-DB-003, REQ-DB-004, REQ-DB-005</requirement>
  <description>
    Create the append-only business_metrics table that stores daily metric snapshots
    for each business. This is the foundation for all ranking calculations.
    Follow Drizzle ORM pattern from existing LocalGenius schema.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="Existing schema patterns, Drizzle ORM conventions" />
    <file path="/home/agent/localgenius/drizzle.config.ts" reason="Migration configuration" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-DB-001 schema specification" />
  </context>

  <steps>
    <step order="1">Read existing schema.ts to understand Drizzle table definition patterns</step>
    <step order="2">Create new schema file: src/db/schema/rank.ts</step>
    <step order="3">Define business_metrics table with fields: business_id (uuid, references businesses), date (date), category (text with check constraint), location_city/metro/state (text), review_count (integer), avg_rating (decimal 2,1), review_velocity (decimal 4,1), response_rate (decimal 5,2), avg_response_time_hours (integer), created_at (timestamp default now())</step>
    <step order="4">Add composite primary key on (business_id, date)</step>
    <step order="5">Add indexes on (category, date) and (location_city, category, date) for efficient cohort queries</step>
    <step order="6">Export table from schema.ts</step>
    <step order="7">Run drizzle-kit generate to create migration file</step>
  </steps>

  <verification>
    <check type="build">npx drizzle-kit generate --name business_metrics succeeds</check>
    <check type="test">Migration file exists in src/db/migrations/</check>
    <check type="manual">Schema matches REQ-DB-001 specification in REQUIREMENTS.md</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(rank): add business_metrics table schema

Add append-only metrics table for daily business performance snapshots.
Indexes optimized for cohort-based ranking queries.

Refs: REQ-DB-001, REQ-DB-003, REQ-DB-004

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Create weekly_rankings materialized view</title>
  <requirement>REQ-DB-002, REQ-DB-003</requirement>
  <description>
    Create the materialized view that computes weekly rankings from business_metrics.
    This view handles dynamic cohort sizing (city -> metro -> state) and computes
    composite scores using the documented algorithm weights.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/db/schema.ts" reason="Existing schema patterns" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-DB-002 schema, REQ-BL-001 algorithm weights" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="Dynamic cohort sizing rules (line 103)" />
  </context>

  <steps>
    <step order="1">Create migration file for materialized view: 002_weekly_rankings.sql</step>
    <step order="2">Write SQL that:
      a) Calculates composite_score using documented weights (review_count 25%, avg_rating 25%, review_velocity 20%, response_rate 15%, response_time 15%)
      b) Groups by category and location (start with city level)
      c) Uses DENSE_RANK() OVER (PARTITION BY category, location_city ORDER BY composite_score DESC) for ranking
      d) Calculates percentile as 100 - (rank / total_in_cohort * 100)
      e) Includes component_scores as JSONB for "why" explanation
    </step>
    <step order="3">Add UNIQUE INDEX on (business_id, week_of) to enable REFRESH CONCURRENTLY</step>
    <step order="4">Document algorithm weights inline with comments explaining each weight</step>
    <step order="5">Add helper view for cohort counts to check N >= 10 constraint</step>
  </steps>

  <verification>
    <check type="build">psql -f 002_weekly_rankings.sql executes without errors</check>
    <check type="test">SELECT * FROM weekly_rankings LIMIT 1 returns expected columns</check>
    <check type="test">REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_rankings succeeds</check>
    <check type="manual">Algorithm weights match REQ-BL-001 (25/25/20/15/15)</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies, but logically follows task-1 -->
  </dependencies>

  <commit-message>feat(rank): add weekly_rankings materialized view

Compute business rankings with composite score algorithm.
Weights: review_count 25%, avg_rating 25%, review_velocity 20%,
response_rate 15%, response_time 15%.

Includes dynamic cohort sizing support and "why" breakdown.

Refs: REQ-DB-002, REQ-BL-001

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Create rank_businesses.sql function with documented weights</title>
  <requirement>REQ-BL-001, REQ-BL-002, REQ-CONFIG-003</requirement>
  <description>
    Create the core SQL function that implements the ranking algorithm with
    dynamic cohort expansion (city -> metro -> state). This is the "brain"
    of RANK that determines which cohort a business belongs to and calculates
    their position.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="Dynamic cohort rules (line 96-103), algorithm weights (line 115)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-BL-001 weights, REQ-BL-002 cohort hierarchy" />
  </context>

  <steps>
    <step order="1">Create function file: src/db/functions/rank_businesses.sql</step>
    <step order="2">Define function rank_business_in_cohort(business_id uuid) that:
      a) First tries city-level cohort (count businesses in same category + city)
      b) If N < 10, falls back to metro-level cohort
      c) If metro N < 10, falls back to state-level cohort
      d) If state N < 10, returns NULL (insufficient data)
    </step>
    <step order="3">Document each weight with inline comments:
      -- Review count (25%): Commodity signal from GBP API. Volume indicator.
      -- Average rating (25%): Commodity signal. Quality perception.
      -- Review velocity (20%): Calculated. Growth momentum indicator.
      -- Response rate (15%): PROPRIETARY LocalGenius signal. Engagement.
      -- Response time (15%): PROPRIETARY LocalGenius signal. Customer service.
    </step>
    <step order="4">Add function to refresh rankings for all businesses in a category</step>
    <step order="5">Include PERCENTILE_CONT for outlier handling (remove top/bottom 5% for averages)</step>
  </steps>

  <verification>
    <check type="build">psql -f rank_businesses.sql executes without errors</check>
    <check type="test">SELECT rank_business_in_cohort('test-uuid') returns valid structure</check>
    <check type="manual">Weight documentation matches decisions.md line 115</check>
    <check type="manual">Cohort fallback logic matches decisions.md line 103</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(rank): add rank_businesses.sql with documented algorithm

Implements dynamic cohort sizing (city -> metro -> state).
Algorithm weights documented inline per decisions.md:
- Review count: 25% (commodity)
- Average rating: 25% (commodity)
- Review velocity: 20% (calculated)
- Response rate: 15% (proprietary)
- Response time: 15% (proprietary)

Refs: REQ-BL-001, REQ-BL-002, REQ-CONFIG-003

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Create config files (categories.ts, cohorts.ts)</title>
  <requirement>REQ-CONFIG-001, REQ-CONFIG-002, REQ-BL-003</requirement>
  <description>
    Create the configuration files that define V1 scope: 3 categories only,
    dynamic cohort sizing rules, and minimum cohort threshold.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/lib/env.ts" reason="Existing config/env patterns" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="3 categories (line 55), cohort rules (line 103)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-CONFIG-001, REQ-CONFIG-002 specifications" />
  </context>

  <steps>
    <step order="1">Create directory: src/features/rank/config/</step>
    <step order="2">Create categories.ts:
      export const RANK_CATEGORIES = ['restaurants', 'home_services', 'retail'] as const;
      export type RankCategory = typeof RANK_CATEGORIES[number];
      export function isValidCategory(category: string): category is RankCategory {
        return RANK_CATEGORIES.includes(category as RankCategory);
      }
    </step>
    <step order="3">Create cohorts.ts:
      export const MIN_COHORT_SIZE = 10;
      export const GEOGRAPHY_HIERARCHY = ['city', 'metro', 'state'] as const;
      export type GeographyLevel = typeof GEOGRAPHY_HIERARCHY[number];
      export interface CohortConfig {
        minSize: number;
        geographyFallback: readonly GeographyLevel[];
      }
      export const COHORT_CONFIG: CohortConfig = {
        minSize: MIN_COHORT_SIZE,
        geographyFallback: GEOGRAPHY_HIERARCHY,
      };
    </step>
    <step order="4">Add JSDoc comments explaining why these values are locked (V1 scope)</step>
    <step order="5">Export from index.ts barrel file</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">import { RANK_CATEGORIES } from './config' works</check>
    <check type="manual">Categories exactly match decisions.md line 55</check>
    <check type="manual">MIN_COHORT_SIZE = 10 per decisions.md line 103</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(rank): add categories and cohorts config

V1 locked scope:
- 3 categories: restaurants, home_services, retail
- Min cohort size: 10 businesses
- Geography hierarchy: city -> metro -> state

Refs: REQ-CONFIG-001, REQ-CONFIG-002, REQ-BL-003

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Data Integration

Two tasks for Google Business Profile integration.

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Implement Google OAuth flow for RANK</title>
  <requirement>REQ-API-001, REQ-API-002</requirement>
  <description>
    Leverage existing LocalGenius Google OAuth infrastructure for RANK.
    Add error handling UX for OAuth failures with "Reconnect" button and
    last-known rank preservation.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/services/google-business.ts" reason="Existing OAuth implementation to reuse" />
    <file path="/home/agent/localgenius/src/app/api/auth/" reason="Existing auth API patterns" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="OAuth failure UX (line 270)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-API-001, REQ-API-002 specifications" />
  </context>

  <steps>
    <step order="1">Review existing google-business.ts OAuth flow</step>
    <step order="2">Verify scope includes 'business.manage' for review access</step>
    <step order="3">Create src/features/rank/api/auth/google-oauth.ts that wraps existing service</step>
    <step order="4">Add error boundary for OAuth failures:
      - On permission denied: return { error: 'PERMISSION_DENIED', message: 'To see your rank...' }
      - On network error: return { error: 'NETWORK_ERROR', retryable: true }
      - On token expired: trigger silent refresh
    </step>
    <step order="5">Add connection status endpoint: GET /api/rank/connection-status
      Returns: { connected: boolean, lastSync: timestamp | null, lastRank: RankData | null }
    </step>
    <step order="6">Store last-known rank in business settings for offline display</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">OAuth flow redirects to Google consent page</check>
    <check type="test">Connection status endpoint returns valid JSON</check>
    <check type="manual">Error messages match decisions.md line 270 UX requirements</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Need business_metrics table to store data" />
  </dependencies>

  <commit-message>feat(rank): implement Google OAuth flow with error handling

Reuse existing LocalGenius OAuth infrastructure.
Add error UX per decisions.md:
- Clear error messages on denial
- "Reconnect" button support
- Last-known rank preservation

Refs: REQ-API-001, REQ-API-002

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Implement GBP daily sync job with caching and rate limiting</title>
  <requirement>REQ-API-003, REQ-API-004</requirement>
  <description>
    Create the daily GBP data sync job that pulls review metrics from Google
    Business Profile API. Implements 24-hour caching, exponential backoff,
    and staggered sync across 6-hour window.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/app/api/cron/google-sync/route.ts" reason="Existing GBP sync pattern to follow" />
    <file path="/home/agent/localgenius/src/services/google-business.ts" reason="GBP API client" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="Rate limit strategy (line 267), cost concerns (line 291)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-API-003, REQ-API-004 specifications" />
  </context>

  <steps>
    <step order="1">Create src/features/rank/jobs/daily-sync.ts</step>
    <step order="2">Implement caching layer:
      - Check last_sync_at timestamp in business_settings
      - Skip if last sync < 24 hours ago
      - Update last_sync_at after successful sync
    </step>
    <step order="3">Implement exponential backoff:
      - Initial delay: 1 second
      - Max retries: 5
      - Max delay: 5 minutes
      - Backoff formula: min(initialDelay * 2^attempt, maxDelay)
    </step>
    <step order="4">Implement staggered sync:
      - Query all businesses needing sync
      - Sort by last_sync_at (oldest first)
      - Add 1-second delay between API calls
      - Spread across 6-hour window (4am-10am UTC)
    </step>
    <step order="5">Create cron endpoint: POST /api/cron/rank/daily-sync
      - Secured with CRON_SECRET
      - Returns: { synced: number, failed: number, skipped: number }
    </step>
    <step order="6">Insert synced data into business_metrics table</step>
    <step order="7">Add priority queue: active businesses (activity in 7 days) sync daily, inactive sync weekly</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">Cron endpoint returns 401 without CRON_SECRET</check>
    <check type="test">Cache prevents duplicate syncs within 24 hours</check>
    <check type="test">Exponential backoff triggers on API failure</check>
    <check type="manual">Sync staggering verified in logs</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Need business_metrics table to store synced data" />
    <depends-on task-id="phase-1-task-5" reason="Need OAuth tokens for GBP API access" />
  </dependencies>

  <commit-message>feat(rank): implement GBP daily sync with rate limiting

Daily sync job pulls review metrics from Google Business Profile.
Rate limit mitigations per decisions.md:
- 24-hour minimum cache
- Exponential backoff (1s initial, 5 retries)
- Staggered 6-hour sync window
- Priority queue: active daily, inactive weekly

Refs: REQ-API-003, REQ-API-004

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — UI + Email Delivery

Four tasks for user-facing components and email.

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Build RankWidget component</title>
  <requirement>REQ-UI-001, REQ-UI-005, REQ-BL-005, REQ-BL-006</requirement>
  <description>
    Create the core RankWidget component that displays the "punch" —
    big rank number, cohort size, direction arrow, and one actionable insight.
    Implements "Mirror, Not Dashboard" philosophy with coach voice.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/digest/WeeklyDigest.tsx" reason="Existing component patterns" />
    <file path="/home/agent/localgenius/src/components/shared/" reason="Shared UI components (Button, etc)" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="Mirror philosophy (line 30), coach voice (line 91), bottom-rank handling (line 273)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-UI-001 display elements" />
  </context>

  <steps>
    <step order="1">Create src/features/rank/components/RankWidget.tsx</step>
    <step order="2">Define RankWidgetProps interface:
      rank: number;
      totalInCohort: number;
      percentile: number;
      rankChange: number; // +2, -1, 0
      cohortLabel: string; // "Austin Mexican Restaurants"
      insight: string; // "2 reviews away from #7"
      isInsufficientData?: boolean;
    </step>
    <step order="3">Implement layout:
      - Rank number: text-6xl font-bold (e.g., "#8")
      - Cohort size: text-2xl text-gray-500 (e.g., "of 47")
      - Direction arrow: ArrowUpIcon/ArrowDownIcon with color (green/red)
      - Percentile: progress bar with "Top 17%"
      - Insight: text-lg with action-oriented copy
    </step>
    <step order="4">Implement bottom-rank special case (REQ-BL-005):
      - If rank === totalInCohort, never show "You're last"
      - Instead show: "Room to climb. Here's your next move."
      - Focus insight on progress, not position
    </step>
    <step order="5">Implement "Insufficient data" state:
      - Show placeholder card with message
      - "Insufficient data for ranking in your area"
      - Include helpful context about cohort requirements
    </step>
    <step order="6">Add "Why this rank?" expandable section:
      - Brief breakdown: "Response time #3, Review velocity #5"
      - Links to detailed view
    </step>
    <step order="7">Use Tailwind CSS (existing in LocalGenius)</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">Component renders without errors</check>
    <check type="test">Bottom-rank case shows progress message, not shame</check>
    <check type="test">Insufficient data state renders correctly</check>
    <check type="manual">Visual matches decisions.md "Mirror" philosophy</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Need config types for RankCategory" />
  </dependencies>

  <commit-message>feat(rank): build RankWidget component with coach voice

Core widget displays: rank number, cohort size, direction arrow,
percentile, and one actionable insight.

Per decisions.md:
- "Mirror, Not Dashboard" philosophy
- Coach voice, not cheerful assistant
- Bottom-rank shows progress, never shame
- Includes "Why this rank?" explanation

Refs: REQ-UI-001, REQ-UI-005, REQ-BL-005, REQ-BL-006

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="3">
  <title>Build TrendLine sparkline component</title>
  <requirement>REQ-UI-002</requirement>
  <description>
    Create a simple SVG sparkline showing 4 weeks of rank history.
    No chart library — pure SVG for minimal bundle size.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/digest/WeeklyDigest.tsx" reason="May have existing sparkline pattern" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-UI-002 specification" />
  </context>

  <steps>
    <step order="1">Create src/features/rank/components/TrendLine.tsx</step>
    <step order="2">Define TrendLineProps interface:
      data: number[]; // 4 weeks of rank positions (lower = better)
      width?: number; // default 120
      height?: number; // default 40
    </step>
    <step order="3">Implement SVG sparkline:
      - Invert Y-axis (rank 1 at top, rank 50 at bottom)
      - Use polyline for connected data points
      - Add subtle dots at each data point
      - Color: green if improving (last < first), red if declining
    </step>
    <step order="4">Add accessibility: aria-label with trend description</step>
    <step order="5">Handle edge cases:
      - Less than 2 data points: show "Not enough history"
      - Single point: show dot only
      - Missing data points: interpolate or show gap
    </step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">Component renders valid SVG</check>
    <check type="test">Trend direction colors correctly (green = improving)</check>
    <check type="manual">Visual is clear and readable at 120x40</check>
  </verification>

  <dependencies>
    <!-- Wave 3: depends on Wave 1-2 data availability -->
  </dependencies>

  <commit-message>feat(rank): build TrendLine sparkline component

Simple SVG sparkline showing 4 weeks of rank history.
No external chart library.
- Green = improving (rank going down)
- Red = declining (rank going up)

Refs: REQ-UI-002

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Build RANK dashboard page</title>
  <requirement>REQ-UI-003, REQ-UI-004</requirement>
  <description>
    Create the main dashboard page that displays RankWidget, TrendLine,
    and detailed breakdowns. Implements the "Rank -> Why -> How" UX flow.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/app/(dashboard)/page.tsx" reason="Existing dashboard pattern" />
    <file path="/home/agent/localgenius/src/api/middleware/auth.ts" reason="Auth protection pattern" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="UX flow (line 31)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-UI-003 layout" />
  </context>

  <steps>
    <step order="1">Create src/app/(dashboard)/rank/page.tsx</step>
    <step order="2">Implement data fetching:
      - Server component fetches current rank from weekly_rankings view
      - Fetches 4-week history for TrendLine
      - Handles "Insufficient data" case from API
    </step>
    <step order="3">Implement layout with three sections:
      - First view (visible): RankWidget with big number
      - Second view (expandable): "Why this rank?" breakdown
      - Third view (expandable): "How to improve" action items
    </step>
    <step order="4">Add "Insufficient data" state:
      - Full-page card explaining why no rank available
      - Include requirements (10+ businesses in cohort)
      - Suggest alternative actions
    </step>
    <step order="5">Add OAuth connection status:
      - If not connected: show "Connect Google Business Profile" CTA
      - If connected but stale: show "Last updated X days ago"
    </step>
    <step order="6">Add loading skeleton states</step>
    <step order="7">Protect route with auth middleware</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">Page renders with mock rank data</check>
    <check type="test">Insufficient data state renders correctly</check>
    <check type="test">Unauthenticated users redirected to login</check>
    <check type="manual">UX flow matches "Rank -> Why -> How" pattern</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Need RankWidget component" />
    <depends-on task-id="phase-1-task-8" reason="Need TrendLine component" />
  </dependencies>

  <commit-message>feat(rank): build dashboard page with rank display

Main dashboard page showing rank widget and trend.
UX flow per decisions.md:
- First view: Big number (#8 of 47)
- Second view: Why (component breakdown)
- Third view: How (improvement actions)

Includes Insufficient Data and OAuth connection states.

Refs: REQ-UI-003, REQ-UI-004

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Build weekly rank email template and job</title>
  <requirement>REQ-EMAIL-001, REQ-EMAIL-002, REQ-EMAIL-003, REQ-EMAIL-004</requirement>
  <description>
    Create the weekly rank email using Resend + React Email pattern.
    Implements coach voice copy and includes deliverability requirements.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/components/email/DigestEmail.tsx" reason="Existing email template pattern" />
    <file path="/home/agent/localgenius/src/services/email.ts" reason="Resend integration" />
    <file path="/home/agent/localgenius/src/services/digest.ts" reason="Batch email job pattern" />
    <file path="/home/agent/localgenius/src/app/api/cron/digest/route.ts" reason="Cron endpoint pattern" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-benchmark-engine/decisions.md" reason="Coach voice (line 91), email timing (line 237)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-EMAIL-001-004 specifications" />
  </context>

  <steps>
    <step order="1">Create src/features/rank/components/email/RankWeeklyEmail.tsx</step>
    <step order="2">Implement email structure (React Email):
      - Subject: "Your ranking this week: #{rank} ({change})"
      - Header: Rank position + cohort (e.g., "Austin Mexican Restaurants: #8 of 47")
      - Section 1: "What helped" (2-3 positive actions)
      - Section 2: "To reach #{nextRank}" (2-3 specific gaps)
      - Footer: One-click unsubscribe link
    </step>
    <step order="3">Implement coach voice copy:
      - DO: "Respond faster. Top performers: 2 hours. You: 8."
      - DON'T: "Your response rate is below the benchmark average..."
    </step>
    <step order="4">Create src/features/rank/jobs/weekly-email.ts:
      - Query all businesses with valid ranks
      - Generate personalized email for each
      - Send via Resend with rate limiting
    </step>
    <step order="5">Create cron endpoint: POST /api/cron/rank/weekly-email
      - Secured with CRON_SECRET
      - Triggers materialized view refresh FIRST
      - Then sends emails
      - Schedule: Mondays 8am (recipient timezone)
    </step>
    <step order="6">Implement deliverability requirements:
      - Include List-Unsubscribe header
      - Include physical address (CAN-SPAM)
      - Track sends for spam monitoring
    </step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">Email template renders valid HTML</check>
    <check type="test">Cron endpoint triggers view refresh before sending</check>
    <check type="test">Unsubscribe link works correctly</check>
    <check type="manual">Copy follows coach voice pattern</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Need weekly_rankings view for rank data" />
    <depends-on task-id="phase-1-task-3" reason="Need ranking function for component scores" />
  </dependencies>

  <commit-message>feat(rank): build weekly rank email with coach voice

Weekly email sent Mondays 8am with:
- Rank position and cohort context
- "What helped" positive actions
- "To reach next rank" specific gaps

Coach voice per decisions.md: direct, warm, data-driven.
Includes deliverability compliance (unsubscribe, CAN-SPAM).

Refs: REQ-EMAIL-001, REQ-EMAIL-002, REQ-EMAIL-003, REQ-EMAIL-004

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Integration + Testing

Two final tasks for API integration and end-to-end testing.

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Create ranking calculation API endpoint</title>
  <requirement>REQ-API-005</requirement>
  <description>
    Create the API endpoint that wraps the ranking calculation logic
    and handles the materialized view refresh trigger.
  </description>

  <context>
    <file path="/home/agent/localgenius/src/app/api/" reason="Existing API patterns" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="REQ-API-005 specification" />
  </context>

  <steps>
    <step order="1">Create src/app/api/rank/route.ts</step>
    <step order="2">Implement GET /api/rank:
      - Requires auth (businessId from session)
      - Queries weekly_rankings view for current business
      - Returns: { rank, totalInCohort, percentile, rankChange, cohortLabel, componentScores, insufficientData }
    </step>
    <step order="3">Create src/app/api/rank/history/route.ts</step>
    <step order="4">Implement GET /api/rank/history:
      - Returns last 4 weeks of rank data for TrendLine
      - Format: [{ weekOf, rank, change }]
    </step>
    <step order="5">Create src/app/api/rank/refresh/route.ts (admin only)</step>
    <step order="6">Implement POST /api/rank/refresh:
      - Triggers REFRESH MATERIALIZED VIEW CONCURRENTLY
      - Returns: { refreshed: true, duration: ms }
      - Secured with admin role
    </step>
    <step order="7">Add error handling for insufficient data case</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">GET /api/rank returns valid rank data</check>
    <check type="test">GET /api/rank/history returns 4-week array</check>
    <check type="test">POST /api/rank/refresh triggers view refresh</check>
    <check type="test">Unauthorized requests return 401</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Need weekly_rankings materialized view" />
    <depends-on task-id="phase-1-task-3" reason="Need rank_businesses function" />
  </dependencies>

  <commit-message>feat(rank): add ranking calculation API endpoints

API endpoints for RANK feature:
- GET /api/rank - current rank for business
- GET /api/rank/history - 4-week trend data
- POST /api/rank/refresh - trigger view refresh (admin)

Refs: REQ-API-005

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="4">
  <title>Integration testing and verification</title>
  <requirement>All requirements</requirement>
  <description>
    Run end-to-end integration tests to verify all components work together.
    Test the full flow: OAuth -> Sync -> Rank -> Display -> Email.
  </description>

  <context>
    <file path="/home/agent/localgenius/vitest.config.ts" reason="Test configuration" />
    <file path="/home/agent/localgenius/tests/" reason="Existing test patterns" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="All requirements for verification" />
  </context>

  <steps>
    <step order="1">Create test file: tests/features/rank/integration.test.ts</step>
    <step order="2">Test OAuth flow:
      - Mock Google OAuth response
      - Verify tokens stored correctly
      - Verify connection status endpoint
    </step>
    <step order="3">Test daily sync:
      - Mock GBP API responses
      - Verify data inserted into business_metrics
      - Verify caching prevents duplicate syncs
    </step>
    <step order="4">Test ranking calculation:
      - Seed test data with known values
      - Verify composite score calculation matches expected weights
      - Verify dynamic cohort fallback (city -> metro -> state)
      - Verify minimum cohort threshold (N < 10 = insufficient data)
    </step>
    <step order="5">Test UI rendering:
      - Test RankWidget with various states
      - Test bottom-rank special case (progress, not shame)
      - Test TrendLine with 4 weeks of data
    </step>
    <step order="6">Test email generation:
      - Verify email content includes all required sections
      - Verify coach voice copy
      - Verify unsubscribe link present
    </step>
    <step order="7">Run full test suite: npm test</step>
    <step order="8">Document any gaps for V1.1</step>
  </steps>

  <verification>
    <check type="test">npm test passes with 0 failures</check>
    <check type="test">Integration tests cover OAuth -> Sync -> Rank -> Display -> Email</check>
    <check type="manual">All requirements from REQUIREMENTS.md verified</check>
    <check type="manual">No regressions in existing LocalGenius tests</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="All components must be complete" />
    <depends-on task-id="phase-1-task-9" reason="Dashboard must be complete" />
    <depends-on task-id="phase-1-task-10" reason="Email must be complete" />
  </dependencies>

  <commit-message>test(rank): add integration tests for full RANK flow

Integration tests covering:
- OAuth flow and connection status
- GBP daily sync with caching
- Ranking calculation with dynamic cohorts
- UI components (RankWidget, TrendLine)
- Weekly email generation

All REQ-* requirements verified.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **BLOCKING: Public vs. Private Rankings** — Proceeding with private-only V1. Badge infrastructure deferred to V1.1 pending founder decision.

2. **GBP API Rate Limits (High Likelihood, Medium Impact)** — Mitigated via 24hr cache, exponential backoff, staggered sync, priority queue. Task 6 implements all mitigations.

3. **Cohort Sparsity (High Likelihood, High Impact)** — Mitigated via dynamic geography expansion and "Insufficient data" fallback. Tasks 3 and 7 implement handling.

4. **Email Deliverability (Medium Likelihood, High Impact)** — Requires pre-launch domain warmup (2 weeks). Task 10 implements Resend integration with compliance headers.

5. **OAuth Drop-off (High Likelihood, Medium Impact)** — Mitigated via clear error UX and last-known rank preservation. Task 5 implements error handling.

6. **Low-Ranked User Churn (Medium Likelihood, High Impact)** — Mitigated via coach voice and progress-focused copy. Never show "You're last." Task 7 implements bottom-rank handling.

---

## Summary

| Wave | Tasks | Description | Est. Duration |
|------|-------|-------------|---------------|
| Wave 1 (Parallel) | 4 tasks | Database + Config foundation | Week 1 |
| Wave 2 (Parallel) | 2 tasks | GBP OAuth + Daily Sync | Week 1-2 |
| Wave 3 (Parallel) | 4 tasks | UI Components + Email | Week 2-3 |
| Wave 4 (Sequential) | 2 tasks | API + Integration Testing | Week 3-4 |
| **Total** | **12 tasks** | | **4 weeks** |

**Critical Path:** Wave 1 -> Wave 2 -> Wave 3 -> Wave 4

---

## Files to Create (14 Artifacts)

| File | Wave | Task |
|------|------|------|
| `src/db/schema/rank.ts` | 1 | phase-1-task-1 |
| `src/db/migrations/001_business_metrics.sql` | 1 | phase-1-task-1 |
| `src/db/migrations/002_weekly_rankings.sql` | 1 | phase-1-task-2 |
| `src/db/functions/rank_businesses.sql` | 1 | phase-1-task-3 |
| `src/features/rank/config/categories.ts` | 1 | phase-1-task-4 |
| `src/features/rank/config/cohorts.ts` | 1 | phase-1-task-4 |
| `src/features/rank/api/auth/google-oauth.ts` | 2 | phase-1-task-5 |
| `src/features/rank/jobs/daily-sync.ts` | 2 | phase-1-task-6 |
| `src/features/rank/components/RankWidget.tsx` | 3 | phase-1-task-7 |
| `src/features/rank/components/TrendLine.tsx` | 3 | phase-1-task-8 |
| `src/app/(dashboard)/rank/page.tsx` | 3 | phase-1-task-9 |
| `src/features/rank/components/email/RankWeeklyEmail.tsx` | 3 | phase-1-task-10 |
| `src/features/rank/jobs/weekly-email.ts` | 3 | phase-1-task-10 |
| `src/app/api/rank/route.ts` | 4 | phase-1-task-11 |

---

## Integration Points (from Codebase Scout)

| LocalGenius Resource | RANK Usage |
|---------------------|------------|
| `src/db/schema.ts` | Extend with rank.* schema |
| `src/api/middleware/auth.ts` | Protect RANK API endpoints |
| `src/services/email.ts` | Send weekly rank emails via Resend |
| `src/services/google-business.ts` | Reuse OAuth flow for GBP |
| `src/services/digest.ts` | Adapt pattern for weekly rank email |
| `src/app/api/cron/google-sync/route.ts` | Follow for daily-sync cron |
| `src/lib/logger.ts` | Structured logging for jobs |
| `src/lib/encryption.ts` | Encrypt OAuth tokens |

---

## Success Criteria

From decisions.md "Ship Test":

> Does she open RANK and instantly know her number, her direction, and her next action?
> If yes, ship it.

**Verification Checklist:**
- [ ] 100+ businesses have rankings
- [ ] At least 3 categories with 10+ business cohorts
- [ ] Weekly email sent to all customers with rankings
- [ ] Dashboard shows ranking widget
- [ ] Open rate on weekly email > 15%
- [ ] TypeScript compiles with no errors
- [ ] All integration tests pass

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2026-04-14*
