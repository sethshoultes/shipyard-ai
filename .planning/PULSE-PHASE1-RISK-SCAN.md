# PULSE Phase 1 — Risk Scanner Report
## LocalGenius Benchmark Engine Build

**Scan Date:** 2026-04-08
**Scanner:** Risk Assessment Agent for Great Minds Agency
**Scope:** Phase 1 Build (4 weeks, Rank Widget + Weekly Email + GBP Integration)
**Status:** READY with 8 known blockers + technical debt concerns

---

## Executive Summary

**Build Readiness:** READY to start (pending founder tiebreak on public/private rankings)

**Critical Risks Identified:** 12
**High-Risk Areas:** 4 (GBP API integration, OAuth, cohort sparsity, email deliverability)
**Technical Debt:** 5 (architecture decisions, state management, error handling)
**Open Questions Blocking:** 8 (all documented in decisions.md)

**Recommendation:** Begin Phase 1 build with **risk mitigation sprints** for:
1. GBP API strategy and fallback mechanisms
2. OAuth error recovery UX
3. Cohort sparsity handling at scale
4. Email infrastructure warm-up (SendGrid pre-launch)

---

## Detailed Risk Register

### CRITICAL RISKS (Impact: Critical, Likelihood: High/Medium)

#### RISK-001: Google Business Profile API Changes/Deprecation
**Category:** Integration / Technical
**Likelihood:** Medium
**Impact:** Critical
**Severity:** Critical (5/5)

**Description:**
Google frequently deprecates or changes API endpoints, pricing, or quota structures. GBP API is the only data source for V1 (reviews, ratings, response times). Any breaking change blocks daily sync job and breaks ranking calculations.

**Current State:**
- No abstraction layer over GBP API in existing codebase
- No documented fallback strategy
- No deprecation monitoring process
- Single point of failure for entire product

**Evidence from PRD/Decisions:**
- Decision #5: "Only show what we can measure with confidence"
- Risk register item: "Google API changes/deprecation — Medium likelihood, Critical impact"
- Question #2: "GBP API rate limit strategy" (UNRESOLVED)

**Mitigation Strategy:**
1. **Abstract GBP API behind interface** (`api/data/gbp-sync.ts`)
   - Create adapter pattern: `GBPDataSource` interface
   - Implement concrete `GoogleBusinessProfileAdapter`
   - Plan for alternative data sources (Yelp fallback, manual override)

2. **Implement API monitoring**
   - Daily health checks on GBP endpoints
   - Alert on schema changes or rate limit hits
   - Subscribe to Google Cloud notifications

3. **Build graceful degradation**
   - Fallback messaging: "Data unavailable, try again later"
   - Use cached data if sync fails (preserve last 30 days)
   - Don't show "Insufficient data" if it's a sync failure

4. **Document API contract**
   - Version control GBP schema expectations
   - Unit tests that validate response structure
   - Breaking change detection in CI/CD

**Files/Areas Affected:**
- `/home/agent/shipyard-ai/apps/pulse/lib/` (create `api/data/gbp-sync.ts`)
- Database schema: `business_metrics` table
- Migration: `db/migrations/001_business_metrics.sql` (create)
- Job: `jobs/daily-sync.ts` (create)

**Owner:** Engineering
**Timeline:** Week 1 (build) + ongoing (monitoring)

---

#### RISK-002: GBP API Rate Limiting & Quota Exhaustion
**Category:** Integration / Scale
**Likelihood:** High
**Impact:** Critical
**Severity:** Critical (5/5)

**Description:**
At 1K businesses × daily syncs = 365K API calls/year minimum. Google quota is typically 1K-10K calls/day depending on tier. Scale to 5K businesses = quota exhaustion. No documented rate limit strategy or fallback.

**Current State:**
- Question #2 UNRESOLVED: "GBP API rate limit strategy"
- Default recommendation suggests "exponential backoff, staggered sync times"
- No queue/retry logic in existing codebase
- No queue pricing analysis (SendGrid costs documented, GBP quota not)

**Math:**
- 1K customers × 1 sync/day = 1K calls/day ✓ (within most tiers)
- 5K customers × 1 sync/day = 5K calls/day ✗ (at quota ceiling)
- Growth to 10K = 10K calls/day ✗ (exceeded, no upgrade path)

**Evidence:**
- Elon's note: "Google API rate limits are the real bottleneck, not compute"
- PRD Appendix: "10K businesses × 10 metrics = 100K rows" (achievable in DB, not in API)

**Mitigation Strategy:**
1. **Implement request queuing**
   - Use Bull queue (open source, Redis-backed)
   - Stagger 1K syncs across 6-hour window (168 calls/hour = 2.8/min)
   - Priority queue: pro tier first, basic tier second

2. **Build quota monitoring**
   - Track daily API calls in `metrics` table
   - Alert at 80% of daily quota
   - Implement circuit breaker: pause syncs if quota exhausted

3. **Rate limit strategy options** (pick one):
   - **Option A (Current):** Sync all customers daily, accept quota wall at ~5K
   - **Option B (Recommended):** Sync pro tier daily, basic tier every 3 days (reduce calls 50%)
   - **Option C (Premium):** Upgrade to Google Workspace API (higher quotas, requires contract)

4. **Document quota roadmap**
   - At 3K customers: implement Option B
   - At 8K customers: request Option C
   - Plan multi-account federation if needed

**Files/Areas Affected:**
- `jobs/daily-sync.ts` (add queue logic)
- Database schema: add `api_call_log` table (tracking)
- Config: `GOOGLE_API_QUOTA_LIMIT` environment variable

**Owner:** Engineering + Product (pick rate limit strategy)
**Timeline:** Week 1 (queue implementation) + ongoing (monitoring)
**Blocking Decision:** Which rate limit strategy? (impacts daily-sync job design)

---

#### RISK-003: Cohort Sparsity (N<10 Everywhere)
**Category:** Data / Product
**Likelihood:** High
**Impact:** High
**Severity:** High (4/5)

**Description:**
"Boise Korean Restaurants = 2 businesses" (from decisions.md). Dynamic cohort sizing expands geography until N≥10, but many category/location combos will be sparse. Rankings become meaningless or unavailable. Users see "Insufficient data" frequently, destroying engagement.

**Current State:**
- Decision #8 LOCKED: "Dynamic Cohort Sizing" (city → metro → state)
- Risk register: "Cohort sparsity (N<10 everywhere) — High likelihood, High impact"
- No cohort density modeling in existing codebase
- No pre-launch analysis of sparse categories

**Evidence:**
- PRD: "Minimum cohort size: 10 businesses per category/location combination"
- Decisions: "State-level yields <10? Show 'Insufficient data' — no fake ranks"
- Steve: "Cohort sparsity will kill us"

**Scenario Analysis:**
```
Austin Mexican Restaurants: 47 (Good ✓)
Denver Korean Restaurants: 3 (Sparse — expand to metro)
Boulder Yoga Studios: 1 (Sparse — expand to state, still <10, show "Insufficient data")
Boise Auto Services: 4 (Sparse — expand to state = 120, works ✓)
```

**Problem:** Categories with low density (yoga, niche services) will frequently show "Insufficient data," limiting engagement.

**Mitigation Strategy:**
1. **Pre-launch cohort analysis**
   - Query GBP data for all 1K businesses
   - Count businesses per category/location combo
   - Identify density distribution (% showing "Insufficient data")
   - Set realistic expectations

2. **Implement smart cohort expansion**
   - Don't just expand geography, also merge related categories
   - Example: "Yoga" + "Pilates" + "Fitness" = 1 cohort if individually sparse
   - Document category merge rules in `config/cohorts.ts`

3. **Fallback cohort strategies** (in priority order):
   - City level (target: N≥10)
   - Metro level (target: N≥10)
   - State level (target: N≥10)
   - **NEW:** Region level (target: N≥10)
   - **NEW:** National cohort for very niche categories
   - **LAST RESORT:** "Insufficient data" (honest)

4. **Monitor post-launch**
   - Track % of users viewing "Insufficient data" weekly
   - Goal: <5% of users see "Insufficient data"
   - If >10%, expand V2 to more categories

**Files/Areas Affected:**
- `config/cohorts.ts` (define hierarchy + merges)
- `db/functions/rank_businesses.sql` (implement expansion logic)
- Database: add `cohort_density` table (pre-launch analysis)
- Seed data script (populate test cohorts with realistic distribution)

**Owner:** Product + Data
**Timeline:** Week 0 (pre-launch analysis) + Week 1-2 (build)
**Success Metric:** <5% of V1 users see "Insufficient data"

---

#### RISK-004: OAuth Onboarding Dropout & GBP Connection Failures
**Category:** UX / Integration
**Likelihood:** High
**Impact:** High
**Severity:** High (4/5)

**Description:**
OAuth permission request is the first user interaction. Data shows 25-40% dropout at permission screens. If Maria doesn't connect her GBP account, no ranking. Question #5 UNRESOLVED: "OAuth failure UX."

**Current State:**
- No OAuth implementation in existing codebase
- No documented error recovery flow
- Decision #6: "Single-step flow. Progress indicator."
- Risk register: "OAuth drop-off during onboarding — High likelihood, High impact"

**Failure Scenarios:**
1. **Maria doesn't see permission prompt** → no sync → no ranking
2. **Google auth server down** → OAuth fails → "Try again"
3. **Revokes permission post-signup** → sync fails → stale ranking shown
4. **Inconsistent Google account** → syncs wrong business profile

**Evidence:**
- Risk mitigation: "Clear value prop BEFORE permission request"
- Design note: "See how you rank against 47 competitors" (before OAuth)
- Question #5: "What does Maria see if connection breaks mid-sync?"

**Mitigation Strategy:**
1. **Pre-OAuth value demonstration**
   - Show example ranking: "#8 of 47 Austin Mexican Restaurants"
   - Show trend chart with sample data
   - Explain what data is collected (reviews, response time, rating)
   - **Build:** Demo component in `ui/components/RankDemo.tsx`

2. **OAuth flow UX**
   - Step 1: Select business (autocomplete from GBP profile)
   - Step 2: Verify category (show detected, allow override)
   - Step 3: Connect GBP (permission request)
   - Step 4: Success / retry if failed
   - **Build:** Multi-step flow in `api/auth/google-oauth.ts`

3. **OAuth failure recovery**
   - **Scenario A (Permission denied):** "Reconnect" button, keep last-known rank with "Data as of [date]"
   - **Scenario B (Wrong account):** "Switch account" option
   - **Scenario C (Server error):** Retry with exponential backoff, max 3 attempts, then "Contact support"
   - **Scenario D (Revoked mid-sync):** Preserve last 30 days of data, show "Rank updated [last-sync-date]"

4. **Monitor post-launch**
   - Track OAuth completion rate (target: >85%)
   - Track sync failures/retries (target: <2% unrecovered)
   - Alert if GBP connection fails for >50 users

**Files/Areas Affected:**
- `api/auth/google-oauth.ts` (create, implement flow + error handling)
- `ui/components/RankDemo.tsx` (create, show value before OAuth)
- `ui/pages/onboarding.tsx` (create, multi-step flow)
- `db/migrations/001_business_oauth_state.sql` (store state, tokens, retry info)

**Owner:** Design + Engineering
**Timeline:** Week 1-2 (critical path item)
**Success Metric:** >85% OAuth completion rate

---

#### RISK-005: Low-Ranked Businesses Churning
**Category:** UX / Product
**Likelihood:** Medium
**Impact:** High
**Severity:** High (4/5)

**Description:**
User sees "#47 of 47" (last place) → emotional damage → churn. Steve's concern: "Your emotional fuel becomes emotional damage." Rankings create shame, not motivation. How to frame last place as "Room to climb" instead of "You're losing"?

**Current State:**
- Decision: No public leaderboards, no shame
- Question #8 UNRESOLVED: "What if #47 of 47?"
- Copy pattern locked: "Coach voice, not consultant voice"
- Risk: "Low-ranked businesses churn — Medium likelihood, High impact"

**Scenarios:**
- Maria sees "#45 of 47" → reads weekly email → "You're below 4% of competitors" → feels ashamed → unsubscribes
- Jake sees "#1 of 1" (only business in cohort) → ranking meaningless → no motivation → leaves

**Evidence:**
- Steve's argument: "Focus on progress, not position. Never expose 'You're last.'"
- Email template: "You moved up 2 spots" (emphasizes movement, not absolute rank)
- Risk mitigation: "Coach voice, focus on progress ('up 3 spots'), celebrate improvement"

**Mitigation Strategy:**
1. **Never show absolute bottom rank prominently**
   - Show: "#47 of 47. Room to climb. Here's your next move."
   - Show: "You're in the bottom 10%. Here's how to reach the top 25% in 4 weeks."
   - Don't show: "You're last. Your competitors are better."

2. **Reframe ranking in email/UI**
   - **Widget always shows:** Rank + percentile + arrow (↑↓→)
   - **Email always shows:** Movement ("+2 this week") + actionable next step
   - **Example (bad):** "You're #47 of 47"
   - **Example (good):** "#47 of 47 Austin restaurants. Up from #48 last week. Get 3 more reviews to reach #46."

3. **Minimum cohort threshold**
   - Don't show rankings with N<3 (too arbitrary)
   - Expand cohort rather than rank in tiny population
   - Example: "Boise Korean Restaurants" only 2 → don't rank → show "Insufficient data"

4. **Celebrate improvement, not position**
   - Weekly email: "↑ You moved up 3 spots! Here's what worked:"
   - Dashboard: Trend chart (show trajectory over 4 weeks)
   - Never: Competitor alerts ("Someone passed you" — creates anxiety)

5. **Monitor churn by rank**
   - Track unsubscribes by rank quintile
   - Alert if bottom 20% churn rate > top 20% by 2x
   - Adjust copy/framing if negative cohorts underperform

**Files/Areas Affected:**
- `email/templates/weekly-pulse.html` (refine copy, emphasize movement)
- `ui/components/RankWidget.tsx` (show "#X of Y" + percentile + arrow)
- `api/rank/calculate.ts` (document weight methodology for copy)
- Copy guidelines: update `COPY-STYLE.md` (coach voice rules)

**Owner:** Design + Copy
**Timeline:** Week 2 (copy refinement before launch)
**Success Metric:** Churn rate lowest/similar across rank quintiles

---

### HIGH-RISK ITEMS (Impact: High/Medium, Likelihood: Medium/High)

#### RISK-006: Email Deliverability at Scale
**Category:** Integration / Scale
**Likelihood:** Medium
**Impact:** Medium → High
**Severity:** High (4/5)

**Description:**
SendGrid is chosen for email delivery. Unknown email configuration, no domain warm-up strategy, no spam monitoring. At 1K businesses × 1 email/week = 52K emails/year. If emails hit spam folder, engagement = 0.

**Current State:**
- SendGrid configured in `apps/pulse/lib/stripe.ts` (payment processing only)
- No email infrastructure code yet
- No warm-up plan documented
- Risk register: "Email deliverability at scale — Medium likelihood, Medium impact"

**Scenarios:**
- Week 1: Send 1K emails, all to inbox ✓
- Week 2: Send 1K emails, 20% hit spam (deliverability issue)
- Week 4: SendGrid account flagged as sender of unsolicited email, IP blocked

**Mitigation Strategy:**
1. **Pre-launch domain warm-up** (2-3 weeks before launch)
   - Start: 100 emails/day (test list of engaged users)
   - Week 1: 500 emails/day
   - Week 2: 2K emails/day
   - Week 3: 5K emails/day
   - Target: Build sender reputation before first 1K customer email

2. **SendGrid configuration**
   - Custom domain (not sendgrid.net subdomain)
   - SPF + DKIM + DMARC records configured
   - Dedicated IP or SendGrid shared IP (depending on volume)
   - Monitor Sendgrid Bounce/Complaint/Drop rates

3. **Email list hygiene**
   - Implement one-click unsubscribe (legal requirement)
   - Monitor bounce rate (target: <0.5%)
   - Remove invalid addresses after 2 bounces
   - Track complaint rate (target: <0.1%)

4. **Monitor weekly**
   - Daily open rate (target: >25% for engagement email)
   - Bounce rate (target: <0.5%)
   - Complaint rate (target: <0.1%)
   - Delivery rate (target: >98%)
   - Setup Datadog/Sentry alerts

5. **Fallback strategy**
   - If SendGrid quota exceeded → queue emails to resend next day
   - If delivery rate drops <95% → alert, pause sends, investigate
   - If complaints spike → pause sends, audit list, notify users

**Files/Areas Affected:**
- `jobs/weekly-email.ts` (create, implement SendGrid job)
- `email/templates/weekly-pulse.html` (create template)
- `.env` (add SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)
- Database: add `email_log` table (track opens, bounces, complaints)
- Infrastructure: Setup SendGrid domain records, warm-up schedule

**Owner:** Engineering + DevOps
**Timeline:** Week 0-1 (warm-up schedule) + Week 1-2 (build + test)
**Success Metric:** >98% delivery rate, >25% open rate post-launch

---

#### RISK-007: Category Misclassification
**Category:** Data / Product
**Likelihood:** High
**Impact:** Medium
**Severity:** High (4/5)

**Description:**
Google's primary category assignment might be wrong. Taco truck = "restaurant" or "food truck"? Hair salon = "salon" or "barber shop"? Misclassification → wrong cohort → meaningless ranking.

**Current State:**
- Decision: "Trust Google's primary category. No override in V1."
- Question #3 UNRESOLVED: "Category taxonomy rules"
- Only 3 categories in V1: restaurants, home_services, retail
- No user override or correction mechanism

**Scenarios:**
- Google classifies "Hair Salon XYZ" as "barber_shop" → ranks against barbers, not salons → unfair comparison
- Taco truck (food truck) classified as "restaurant" → ranks against brick-and-mortar → scale mismatch
- Tesla repair shop classified as "auto_services" → ranks against small car washes → weird

**Mitigation Strategy:**
1. **Validate category assumptions in V1**
   - Test with sample 100 businesses from each category
   - Check if Google's category makes sense (manual review)
   - Document exceptions (e.g., food trucks excluded from restaurant cohort)

2. **Build V1.1 user override**
   - Add "category_override" field to users table
   - Show detected category, allow user to pick alternative
   - Approval queue: validate before applying
   - Only change cohort after approval

3. **Flag suspicious categories**
   - Auto-flag if business location = "food truck" or "mobile"
   - Auto-flag if name contains "food truck," "mobile," "temporary"
   - Show warning: "This might be classified wrong. Override here."

4. **Monitor post-launch**
   - Survey users: "Is your category correct?"
   - Track overrides, identify patterns
   - By V1.1, fix most common misclassifications

**Files/Areas Affected:**
- `config/categories.ts` (define 3 categories, include notes on edge cases)
- `db/migrations/001_business_metrics.sql` (add category_override field)
- `api/rank/calculate.ts` (use override if present, else Google primary)
- `ui/pages/onboarding.tsx` (show category verification step)

**Owner:** Product + Data
**Timeline:** Week 0 (validation) + Week 2 (build override in v1.1)

---

#### RISK-008: Materialized View Refresh Bottleneck
**Category:** Technical / Database
**Likelihood:** Medium
**Impact:** Medium
**Severity:** Medium (3/5)

**Description:**
Decision #3 locked: "One PostgreSQL table, one materialized view (~20 lines SQL), one ranking function (~50 lines)." Materialized views need manual refresh, which blocks concurrent reads. At 1K businesses, weekly refresh could take minutes, during which old rankings are shown.

**Current State:**
- Architecture locked: single materialized view
- No refresh strategy documented
- No existing migration/schema setup
- Question #6 UNRESOLVED: "Rank calculation frequency"

**Scenarios:**
- Monday 8am: Start weekly rank recalc
- View refresh takes 3 minutes (blocking)
- During refresh: old rankings returned (stale data)
- Dashboard/email built with stale data

**Math:**
- 1K businesses × 3 categories × ~5 cohorts (average) = 15K ranking rows
- Materialized view refresh on Postgres: typically <30s for 15K rows
- **Not a blocker for V1, but needs thought for V2**

**Mitigation Strategy:**
1. **Refresh strategy (pick one)**
   - **Option A (Concurrent):** Use `CONCURRENTLY` keyword (requires unique index, refreshes in background)
   - **Option B (Scheduled):** Refresh Monday 8am sharp, accept 3-min stale window
   - **Option C (Real-time):** Don't use materialized view, calculate on-demand (slower, always fresh)

2. **Monitor refresh performance**
   - Log refresh start/end time + duration
   - Alert if refresh >60 seconds
   - At 5K businesses, reassess strategy

3. **Real-time fallback**
   - If view refresh fails, calculate ranking on-demand (slower)
   - Cache result in Redis (24-hour TTL)
   - Show "Rank updated [date]" to be honest

**Files/Areas Affected:**
- `db/migrations/002_weekly_rankings.sql` (implement view + refresh logic)
- `jobs/weekly-email.ts` (trigger refresh Monday 8am)
- Database indexes (create unique index for CONCURRENT refresh)
- Monitoring: log refresh performance

**Owner:** Engineering
**Timeline:** Week 1 (build + test) + ongoing (monitoring)
**Success Metric:** Refresh completes <30 seconds

---

#### RISK-009: Public vs. Private Rankings (DEADLOCKED)
**Category:** Product / Strategy
**Likelihood:** High (blocking decision)
**Impact:** High
**Severity:** Critical (5/5) — **BLOCKS BUILD**

**Description:**
Elon vs. Steve disagree fundamentally. Elon wants public badges + reports (growth/distribution). Steve wants purely private (ethical/retention). No compromise accepted by either. REQUIRES FOUNDER TIEBREAK.

**Current State:**
- Status: DEADLOCKED
- Recommendation from Phil Jackson: "Accept Elon's compromise with Steve's guardrails"
  - Private by default (always)
  - Opt-in badges for Top 20%
  - Aggregated reports (no individual business names)
- No database schema change yet
- No UI component for badges

**Build Impact:**
If public: need to build `/embed/badge.svg` endpoint, badge opt-in UI, public report pages
If private: simpler schema, no badge infrastructure, focuses on email + widget

**Blocking Questions:**
1. Will rankings be shown publicly (leaderboards)?
2. Will badges be embeddable on business websites?
3. Will "benchmark reports" list individual businesses or just category averages?

**Mitigation Strategy:**
1. **Get founder decision ASAP** (Week 0)
   - Phil's recommendation: Private with opt-in badges
   - Alternative decision paths:
     - Fully public (Elon path)
     - Fully private (Steve path)
     - Hybrid (Phil compromise)

2. **Design for either scenario**
   - Private-first schema (can always add public later)
   - Badge infrastructure optional (add in V1.1)
   - Public reports optional (add in V2)

3. **V1 scope (lock to private for now)**
   - Build: Private rankings only
   - Defer: Public badges, reports
   - Plan: Add if founder chooses public in V1.1

**Files/Areas Affected:**
- Database schema: `user_settings` table (add `badge_opt_in` boolean)
- API routes: `/api/rankings` (private), `/embed/badge.svg` (deferred)
- UI: Badge opt-in toggle (deferred to V1.1)

**Owner:** Founder (decision) + Engineering (implementation)
**Timeline:** **BLOCKING** — Must resolve before finalizing API design
**Recommendation:** Default to private (Steve), add badge infrastructure for V1.1 (Elon)

---

### MEDIUM-RISK ITEMS (Impact: Medium, Likelihood: Medium)

#### RISK-010: Insufficient Data for Ranking (Cohort Size <10)
**Category:** Product / Data
**Likelihood:** Medium
**Impact:** Medium
**Severity:** Medium (3/5)

**Description:**
Some users will see "Insufficient data" message frequently. Expectation-setting is critical. Unclear messaging destroys trust.

**Current State:**
- Decision: Show "Insufficient data" message (no fake rankings)
- No message copy written
- No fallback recommendations provided
- Risk: Covered in Risk-003 (cohort sparsity)

**Mitigation Strategy:** (See Risk-003)

---

#### RISK-011: Multi-Location Business Handling
**Category:** Product / Data
**Likelihood:** Medium
**Impact:** Medium
**Severity:** Medium (3/5)

**Description:**
Business with 5 locations: separate rank per location or aggregate? Deferred to V2, but might be requested immediately post-launch.

**Current State:**
- Explicitly cut from V1: "Multi-location business handling — Edge case complexity"
- Revisit trigger: ">50 customer requests"
- Database schema assumes single business_id per user

**Mitigation Strategy:**
1. **V1 approach:** Show primary location only, hide other locations
2. **Monitor requests:** Track feature requests post-launch
3. **V1.1 scope:** If >10 requests, build multi-location support

---

#### RISK-012: Algorithm Weight Opacity
**Category:** Product / UX
**Likelihood:** Medium
**Impact:** Medium
**Severity:** Medium (3/5)

**Description:**
Users will ask "Why am I #8?" without clear explanation. Showing weights might seem arbitrary. Question #7 UNRESOLVED: "Show 'why' for rank position?"

**Current State:**
- Recommendation: Basic explanation only ("Your response time ranks #3 in cohort")
- No weight documentation yet
- Weights not finalized

**Mitigation Strategy:**
1. **Build weight documentation** (in code + user-facing)
   - Document in `db/functions/rank_businesses.sql`
   - Example weights: review_count=25%, rating=25%, response_time=20%, proprietary=30%

2. **Show brief explanation**
   - Widget: "Response time is your strength (top 15%)"
   - Email: "Your response rate improved from 60% to 75%"
   - Don't show percentages, show qualitative feedback

3. **Iterate based on feedback**
   - Post-launch: survey users on clarity
   - If users confused, add more explanation
   - If users game it, less transparency (revisit)

---

#### RISK-013: Competitor Response (Yelp/Google Native)
**Category:** Strategy / Competitive
**Likelihood:** Low
**Impact:** Critical
**Severity:** High (4/5, but low likelihood)

**Description:**
If PULSE gains traction (rare, but possible), Yelp or Google could build competitive ranking feature. Speed to market = 4 weeks = protection.

**Current State:**
- Identified risk: "Competitive response (Yelp/Google native) — Low likelihood, Critical impact"
- Mitigation: "Speed to market = 4 weeks. Moat is proprietary signals."
- No competitive monitoring process

**Mitigation Strategy:**
1. **Execute 4-week build flawlessly** (best defense)
2. **Build proprietary data moat**
   - Response times from LocalGenius platform (not publicly available)
   - Posting frequency (not available on Yelp/Google)
   - Emphasize this in marketing (if public)
3. **Monitor competitor moves**
   - Weekly check of Yelp/Google for new features
   - Alert if ranking feature announced

---

## ARCHITECTURAL & TECHNICAL DEBT CONCERNS

### Architectural Debt

#### AD-001: No API Abstraction Layer
**Severity:** Medium

**Issue:** Direct Google Business Profile API calls without abstraction. Makes switching sources difficult.

**Recommendation:**
```typescript
// Create adapter interface
interface IDataSource {
  getBusinessData(businessId: string): Promise<BusinessMetrics>;
  healthCheck(): Promise<boolean>;
}

class GoogleBusinessProfileAdapter implements IDataSource { ... }
class YelpAdapter implements IDataSource { ... } // Future fallback

// Use in code
const dataSource: IDataSource = new GoogleBusinessProfileAdapter();
```

---

#### AD-002: No Error Handling Strategy
**Severity:** High

**Issue:** No documented error recovery for OAuth, API calls, database queries, email sends. Failures cascade invisibly.

**Recommendation:**
- Implement circuit breaker pattern for GBP API
- Implement retry with exponential backoff
- Log all errors to centralized logging (Datadog/Sentry)
- Build error recovery flows in UI (OAuth reconnect, retry buttons)

---

#### AD-003: No State Management for Long-Running Jobs
**Severity:** Medium

**Issue:** Daily sync and weekly email jobs might fail mid-execution. No resume/retry logic.

**Recommendation:**
- Use Bull queue for jobs (Redis-backed, resilient)
- Track job state: pending, running, completed, failed
- Implement exponential backoff retries
- Log job execution details (start time, duration, error message)

---

### Schema & Data Concerns

#### SD-001: Missing Business Metrics Schema
**Severity:** High (Blocking)

**Issue:** No `business_metrics` table in existing codebase. This is critical for storing GBP data.

**Required Migration (001_business_metrics.sql):**
```sql
CREATE TABLE business_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id),

  -- GBP Data (from Google API)
  review_count INT,
  avg_rating DECIMAL(3,2),
  response_time_hours DECIMAL(5,2),
  response_rate_percent DECIMAL(5,2),

  -- Proprietary Data (from LocalGenius platform)
  posting_frequency_per_week INT,

  -- Metadata
  data_source VARCHAR(50), -- 'google_api', 'localgenius', etc.
  sync_status VARCHAR(50), -- 'success', 'failed', 'pending'
  last_sync_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_business_metrics_business_id_created_at
  ON business_metrics(business_id, created_at DESC);
```

---

#### SD-002: Missing Rankings Table
**Severity:** High (Blocking)

**Issue:** No `rankings` or `weekly_rankings` table. This is what gets displayed to users.

**Required Migration (002_weekly_rankings.sql):**
```sql
-- Materialized view for weekly rankings
CREATE MATERIALIZED VIEW weekly_rankings AS
SELECT
  bm.business_id,
  bm.category,
  bm.location,
  ROW_NUMBER() OVER (
    PARTITION BY bm.category, bm.location
    ORDER BY composite_score DESC
  ) as rank,
  COUNT(*) OVER (PARTITION BY bm.category, bm.location) as total_in_cohort,
  composite_score,
  bm.review_count,
  bm.avg_rating,
  bm.response_time_hours,
  bm.posting_frequency_per_week
FROM business_metrics bm
WHERE bm.created_at >= NOW() - INTERVAL '7 days'
GROUP BY bm.business_id, bm.category, bm.location;

-- Index for dashboard queries
CREATE INDEX idx_weekly_rankings_business_id
  ON weekly_rankings(business_id);
```

---

#### SD-003: Missing OAuth State Tracking
**Severity:** High (Blocking)

**Issue:** No table to track OAuth state, tokens, or connection status.

**Required Migration (003_google_oauth.sql):**
```sql
CREATE TABLE google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),

  -- Google OAuth
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,

  -- Connection tracking
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync_at TIMESTAMP,
  sync_status VARCHAR(50), -- 'connected', 'failed', 'revoked'

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_google_oauth_tokens_user_id
  ON google_oauth_tokens(user_id);
```

---

### Dependency & Library Concerns

#### DC-001: SendGrid Integration Not Started
**Severity:** High (Blocking for email)

**Issue:** Email job (`jobs/weekly-email.ts`) doesn't exist. SendGrid library might not be installed.

**Recommendation:**
```bash
npm install @sendgrid/mail
```

Implement:
```typescript
// lib/sendgrid.ts
import sgMail from '@sendgrid/mail';

export async function sendWeeklyEmail(
  to: string,
  rank: number,
  cohortSize: number,
  movement: number
): Promise<boolean> {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: `Your ranking this week: #${rank} ${movement > 0 ? '↑' : '→'}`,
    html: renderWeeklyTemplate({ rank, cohortSize, movement })
  };

  try {
    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}
```

---

#### DC-002: Google API Client Library
**Severity:** High (Blocking for GBP sync)

**Issue:** No Google Business Profile API client in dependencies. Need to add.

**Recommendation:**
```bash
npm install googleapis
# OR for simpler OAuth
npm install google-auth-library
```

---

#### DC-003: Job Scheduling Library Missing
**Severity:** High (Blocking for jobs)

**Issue:** Daily sync and weekly email jobs need scheduler. No existing scheduler in codebase.

**Recommendation:**
```bash
npm install bull redis
# OR for serverless
npm install node-cron
```

Bull (Redis-backed) is recommended for resilience.

---

## MISSING FILES/COMPONENTS (BUILD CHECKLIST)

### Critical Files to Create (Blocking Phase 1)

| File | Purpose | Status | Blocking |
|------|---------|--------|----------|
| `/apps/pulse/api/auth/google-oauth.ts` | OAuth flow | Not started | **YES** |
| `/apps/pulse/api/data/gbp-sync.ts` | Daily GBP data pull | Not started | **YES** |
| `/apps/pulse/jobs/daily-sync.ts` | Cron job for GBP sync | Not started | **YES** |
| `/apps/pulse/jobs/weekly-email.ts` | Cron job for email send | Not started | **YES** |
| `/apps/pulse/db/migrations/001_business_metrics.sql` | Metrics table | Not started | **YES** |
| `/apps/pulse/db/migrations/002_weekly_rankings.sql` | Rankings view | Not started | **YES** |
| `/apps/pulse/db/functions/rank_businesses.sql` | Ranking function | Not started | **YES** |
| `/apps/pulse/config/cohorts.ts` | Cohort hierarchy | Not started | **YES** |
| `/apps/pulse/config/categories.ts` | 3 categories (locked) | Not started | **YES** |
| `/apps/pulse/ui/components/RankWidget.tsx` | Main widget | Not started | **YES** |
| `/apps/pulse/ui/pages/dashboard.tsx` | Dashboard page | Not started | **YES** |
| `/apps/pulse/email/templates/weekly-pulse.html` | Email template | Not started | **YES** |
| `/apps/pulse/lib/sendgrid.ts` | SendGrid wrapper | Not started | **YES** |

### Secondary Files (Non-blocking but important)

| File | Purpose | Status | Blocking |
|------|---------|--------|----------|
| `/apps/pulse/ui/components/TrendLine.tsx` | 4-week trend chart | Not started | No |
| `/apps/pulse/api/rank/calculate.ts` | Ranking wrapper | Not started | No |
| `/apps/pulse/lib/stripe.ts` | Already exists (payments) | Complete | No |
| `/apps/pulse/.env.example` | Environment template | Not started | No |

---

## EXISTING CODEBASE PATTERNS & ASSETS

### Database Patterns (Reuse These)

**From `/packages/db/client.ts`:**
- Lazy initialization pattern (singleton)
- Connection pooling with Neon HTTP driver
- Health check pattern

**From `/packages/db/schema/*.ts`:**
- Drizzle ORM schema definitions
- Type-safe migrations
- Index creation patterns

**Recommendation:** Use same Neon + Drizzle stack for PULSE database schema.

---

### Error Handling Pattern (Stripe)

**From `/apps/pulse/lib/stripe.ts`:**
- Stripe error type enum
- User-friendly error messages
- Error handler function

**Recommendation:** Adopt similar pattern for Google API, OAuth, SendGrid errors.

---

### Environment Variable Pattern

**From `.env` file:**
- `OPENAI_API_KEY` (existing)

**Needed for PULSE:**
- `DATABASE_URL` (already in use)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `REDIS_URL` (for Bull queue)
- `LOG_LEVEL` (for debugging)

---

## TIMELINE & DEPENDENCIES

### Build Critical Path (4 weeks)

```
Week 0 (Planning & Setup)
├─ Founder decision on public/private rankings
├─ Pre-launch cohort density analysis
├─ SendGrid domain warm-up begins
└─ Database schema reviewed & locked

Week 1 (Foundations)
├─ Database migrations (metrics, rankings, OAuth state)
├─ Google OAuth flow (api/auth/google-oauth.ts)
├─ GBP data sync (api/data/gbp-sync.ts, jobs/daily-sync.ts)
├─ Ranking function (db/functions/rank_businesses.sql)
└─ Config files (cohorts.ts, categories.ts)

Week 2 (Dashboard & Logic)
├─ RankWidget component (ui/components/RankWidget.tsx)
├─ Dashboard page (ui/pages/dashboard.tsx)
├─ TrendLine component (ui/components/TrendLine.tsx)
└─ Internal QA & testing

Week 3 (Email & Polish)
├─ Email template (email/templates/weekly-pulse.html)
├─ Weekly email job (jobs/weekly-email.ts)
├─ SendGrid integration (lib/sendgrid.ts)
├─ Error recovery flows (OAuth reconnect, sync failures)
└─ Copy/messaging refinement (coach voice)

Week 4 (QA & Launch Prep)
├─ End-to-end testing (OAuth → ranking → email)
├─ Load testing (1K businesses, 52K emails/year)
├─ Monitoring setup (Datadog, Sentry)
├─ Documentation
└─ Soft launch to beta users (50-100)
```

### Dependency Chain

```
Database Schema Created
    ↓
GBP OAuth Flow Built
    ↓
Daily Sync Job Built
    ↓
Ranking Function Tested
    ↓
Dashboard Widget Built
    ↓
Email Job Built & SendGrid Configured
    ↓
End-to-End Testing
    ↓
Launch
```

---

## RECOMMENDATIONS FOR RISK MITIGATION

### Immediate Actions (Week 0)

1. **Get founder decision on public/private rankings**
   - Use Phil Jackson's recommendation as starting point
   - Private by default, opt-in badges for V1.1

2. **Validate cohort density**
   - Query GBP data for 1K+ businesses
   - Count per category/location combo
   - Identify sparse categories (% showing "Insufficient data")
   - Set realistic expectations

3. **Start SendGrid domain warm-up**
   - Configure SPF, DKIM, DMARC records
   - Begin warm-up schedule (100 → 500 → 2K → 5K emails/day)
   - Builds sender reputation before launch

4. **Finalize GBP API strategy**
   - Decide on rate limit approach (Option A, B, or C)
   - Plan queue implementation (Bull or alternatives)
   - Document quota monitoring

### Build Phase Safeguards (Week 1-4)

1. **Implement circuit breaker for GBP API**
   - Pause syncs if quota exhausted
   - Preserve last 30 days of data for dashboard
   - Alert on failures

2. **Build OAuth error recovery flows**
   - Clear error messages
   - Reconnect button
   - Preserve rank with "Data as of [date]" label

3. **Test cohort edge cases**
   - Businesses with N<10 in all cohort levels
   - Single-business cohorts
   - Category misclassifications (manually verify 100 businesses)

4. **Monitor email deliverability**
   - Daily open rate, bounce rate, complaint rate
   - Alert if any metric drops below threshold
   - Weekly SendGrid health check

### Post-Launch Monitoring (Month 1)

1. **Cohort sparsity tracking**
   - % of users seeing "Insufficient data"
   - Goal: <5%
   - Adjust categories/cohort expansion if needed

2. **Engagement metrics**
   - OAuth completion rate (target: >85%)
   - Weekly email open rate (target: >25%)
   - Dashboard views per user per week (target: >1)

3. **Churn analysis by rank**
   - Track unsubscribes by rank quintile
   - Alert if bottom 20% churn rate > top 20% by 2x

4. **API health**
   - GBP sync success rate (target: >99%)
   - Sync duration (target: <30 sec per business)
   - Rate limit incidents (target: 0)

---

## OPEN QUESTIONS REQUIRING RESOLUTION

**Before build starts, resolve these in priority order:**

| # | Question | Owner | Impact | Recommendation |
|---|----------|-------|--------|-----------------|
| 1 | Public vs. Private Rankings? | Founder | **BLOCKING** | Private default, opt-in badges (V1.1) |
| 2 | GBP API rate limit strategy? | Engineering + Product | **BLOCKING** | Option B: Sync pro tier daily, basic tier 3x/week |
| 3 | Category taxonomy rules? | Product | Medium | Trust Google's primary category, override in V1.1 |
| 4 | Minimum cohort threshold? | Product | Medium | N<10 → "Insufficient data", N<3 → no ranking |
| 5 | OAuth failure UX? | Design | High | Error message + reconnect button, preserve last rank |
| 6 | Rank calculation frequency? | Engineering | Medium | Daily for dashboard, weekly email Monday 8am |
| 7 | Algorithm weight transparency? | Product | Medium | Basic explanation only ("Response time is your strength") |
| 8 | What if #47 of 47? | Design + Copy | High | Never show "You're last", focus on "Room to climb" |

---

## SUCCESS CRITERIA FOR PHASE 1 BUILD

### Launch Readiness Checklist

- [ ] All 13 critical files created and tested
- [ ] Database migrations applied successfully
- [ ] OAuth flow tested with >10 real Google accounts
- [ ] Daily sync job runs without errors for 7 days
- [ ] Dashboard shows rankings for >100 businesses
- [ ] Weekly email sends to >100 users without bounce/spam issues
- [ ] Cohort expansion logic verified (city → metro → state)
- [ ] "Insufficient data" state working for sparse cohorts
- [ ] Coach voice copy applied to all user-facing text
- [ ] Monitoring setup (Datadog/Sentry) for errors + performance
- [ ] Documentation complete (API, schema, deployment)
- [ ] Soft launch to 50-100 beta users
- [ ] Metrics tracked: OAuth completion, email open rate, engagement, churn

### User Experience Validation

- [ ] New user can complete OAuth in <5 minutes
- [ ] Dashboard loads in <2 seconds
- [ ] Ranking visible within 24 hours of signup
- [ ] Weekly email arrives Monday 8am local time
- [ ] Email unsubscribe works (one-click)
- [ ] Users understand "why" they're ranked at position X
- [ ] Last-place users don't feel shame (coach voice validates)

---

## CONCLUSION

**PULSE Phase 1 is READY to build** with clear risk mitigation strategies. The 4-week timeline is achievable if:

1. ✓ Founder resolves public/private rankings decision (Week 0)
2. ✓ Engineering starts database schema + OAuth (Week 1, critical path)
3. ✓ GBP API rate limit strategy is locked (Week 0)
4. ✓ SendGrid warm-up begins immediately (Week 0-2)
5. ✓ Monitoring + error handling are built in, not bolted on (Week 1-4)

**Highest-risk areas:**
- GBP API integration (abstraction + rate limits + fallbacks)
- OAuth UX (clear error messages, recovery flows)
- Cohort sparsity (realistic expectations, graceful "Insufficient data" state)
- Email deliverability (warm-up + monitoring + list hygiene)

**Build this first, defer to V2:**
- Public badges/leaderboards (pending founder decision)
- Competitor alerts (Steve: "anxiety, not value")
- Seasonal adjustments (Elon: "cut complexity")
- Multi-location businesses (edge case, <50 requests)
- Conversational interface (nice demo, zero priority)

**The product succeeds if:** Maria opens PULSE, instantly sees her number (#8 of 47), sees direction (↑), and knows her next action ("Respond faster. Top performers: 2 hours. You: 8.").

---

**Report Prepared By:** Risk Scanner Agent
**Date:** 2026-04-08
**Version:** 1.0
**Status:** Ready for Build Phase

