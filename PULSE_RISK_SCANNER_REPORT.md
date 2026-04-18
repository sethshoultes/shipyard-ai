# PULSE IMPLEMENTATION: TECHNICAL RISK SCANNER REPORT

**Date:** 2026-04-18
**Scope:** Risk assessment for LocalGenius Pulse feature implementation (Decisions Document locked)
**Target:** v1 launch in 2 weeks per decision timeline
**Baseline:** LocalGenius frontend-launch + benchmark-engine deliverables

---

## EXECUTIVE SUMMARY

The Pulse implementation is **MEDIUM RISK** overall. Core architecture is sound (3 tables, pre-computed batch), but **4 CRITICAL INFRASTRUCTURE GAPS** exist that will block v1 if not addressed immediately:

1. **SMS/Twilio Integration**: Not configured anywhere in codebase
2. **Midnight Batch Job Infrastructure**: No cron framework exists (Cloudflare Workers architecture doesn't support scheduled tasks)
3. **Image Generation + S3/CDN Setup**: R2 binding exists in wrangler.toml but no image generation code
4. **Email Service Configuration**: No SendGrid/Postmark integration found (only OpenAI client exists)

**Recommendation:** Establish DevOps track immediately (Week 1) to resolve these gaps in parallel with feature development.

---

## I. TECHNICAL RISK ASSESSMENT

### RISK 1: SMS Compliance & Deliverability

**Severity:** HIGH
**Probability:** MEDIUM
**Status:** INFRASTRUCTURE GAP

#### Description
From decisions.md Section V: "SMS Compliance & Deliverability — TCPA compliance (opt-in requirements), carrier filtering (spam detection), international SMS costs"

**Current State:**
- No Twilio account/API integration found in codebase
- No environment variables for TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN
- No SMS opt-in/consent tracking tables in schema
- No SMS delivery retry logic or webhook handlers for DLR (Delivery Receipt) tracking

**Dependencies:**
- Twilio SDK not in package.json dependencies
- No phone number validation library
- No compliance audit trail system

**Files That Need Modification:**
- `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/wrangler.toml` - Add Twilio environment bindings
- New file: `/pulse/notifications/sms-sender.js` - SMS delivery logic (100-150 lines)
- Schema migration: Add `user_phone_number`, `sms_opt_in`, `sms_delivery_status` columns to notifications table
- New file: `/pulse/compliance/tcpa-audit.js` - Consent tracking + audit trail

**Estimated Complexity:** HIGH (requires legal review + compliance audit)

**Mitigations:**
- [ ] Explicit opt-in during onboarding (decision locked in 5.1)
- [ ] US-only launch (expand internationally post-validation)
- [ ] Monitor delivery rates from day 1 (target: >95% successful delivery)
- [ ] Copy review for spam trigger words (e.g., "act now", "limited time")
- [ ] Implement delivery receipt webhooks to track failures
- [ ] Start with Twilio Messaging Services (scale to 10K users safely)

**Testing Requirements:**
1. Test opt-in/opt-out workflows with 10 sandbox numbers
2. Delivery rate validation (simulate carrier filtering)
3. Load test: 10K users × 30 SMS/month = 300K SMS/month throughput
4. TCPA compliance audit: verify audit trail completeness
5. A/B test SMS content for spam trigger words

**Owner:** Elon (technical execution + growth metrics)

---

### RISK 2: Notification Fatigue (Over-Communication)

**Severity:** MEDIUM
**Probability:** MEDIUM
**Status:** DESIGN + IMPLEMENTATION RISK

#### Description
From decisions.md Section V: "Daily notifications + weekly digest + 'all quiet' messages = user annoyance, unsubscribes"

**Current State:**
- Notification generator logic not yet built
- No frequency capping logic in database schema
- No unsubscribe rate tracking
- "All quiet" notification frequency cap is **OPEN DECISION** (Section IV.3)

**Critical Decision Still Needed:**
Decision.md Section IV.3: "If business is slow for 5 days straight, do we send 'All quiet' 5x? Or cap at 2x/week?"
- **This must be resolved BEFORE building notification generator**
- Impacts schema design (need `last_quiet_notification_at` timestamp)

**Files That Need Modification:**
- `/pulse/notifications/generator.js` (200 lines) - Batch logic with frequency capping
- Schema migration: Add `unsubscribe_rate`, `last_quiet_notification_at`, `notification_frequency_pref` columns
- `/pulse/notifications/templates/quiet.js` - "All quiet" template logic

**Estimated Complexity:** MEDIUM (decision-dependent)

**Mitigations:**
- [ ] Track unsubscribe rates from day 1 (target: <5%, failure condition: >10%)
- [ ] A/B test notification frequency (daily vs 3x/week) with 10% of users
- [ ] Hard cap: Max 1 notification per day (including "all quiet")
- [ ] Implement exponential backoff: if no engagement for 3 days, reduce frequency
- [ ] Pre-launch survey: Ask 100 beta users about frequency preference

**Testing Requirements:**
1. Unit tests for frequency capping logic
2. Integration tests: Verify max 1 notification/day constraint
3. A/B test: Compare unsubscribe rates (daily vs 3x/week)
4. Load test: Pre-compute 10K users' notifications simultaneously
5. Analytics tracking: unsubscribe_rate, engagement_rate, churn_rate metrics

**Owner:** Steve (brand trust) + Elon (data-driven optimization)

---

### RISK 3: Badge Image Generation Latency

**Severity:** LOW
**Probability:** LOW
**Status:** INFRASTRUCTURE GAP (PARTIAL)

#### Description
From decisions.md Section V: "If async job fails or lags, user unlocks badge but can't share immediately"

**Current State:**
- R2 bucket binding exists in wrangler.toml (`binding = "ASSETS"`)
- No image generation code (sharp, PIL, or similar)
- No async job queue for image generation
- No CDN configuration for image serving
- No fallback generic badge logic

**Files That Need Modification:**
- New file: `/pulse/badges/image-generator.js` (100-150 lines) - OG image generation using Sharp or similar
- New file: `/pulse/badges/cdn-uploader.js` (50 lines) - Upload generated images to R2
- Schema migration: Add `image_url`, `image_generation_status`, `generated_at` to achievements table
- New file: `/pulse/badges/fallback-card.js` (50 lines) - Generic shareable card fallback

**Estimated Complexity:** MEDIUM (Sharp library integration + async job handling)

**Critical Dependencies:**
- Sharp/image processing library (node-canvas is CPU-heavy on Cloudflare Workers)
- R2 API credentials and bucket setup
- CDN URL structure (e.g., `https://cdn.localgenius.com/badges/{badge_id}.png`)

**Mitigations:**
- [ ] Pre-generate images at midnight (proactive, not reactive) — async task from notification generator batch job
- [ ] Fallback: Generic shareable card if custom image not ready within 5 seconds
- [ ] Monitor job queue: Alert if generation time >1 minute (target: <2 seconds per image)
- [ ] Cache generated images: 30-day TTL in R2
- [ ] Test with 5,000 concurrent badge unlocks

**Testing Requirements:**
1. Unit tests: Image generation with mocked Sharp
2. Load test: 5K concurrent badge unlocks, measure image generation latency
3. Integration test: R2 upload + CDN serving (verify URLs work)
4. Fallback test: If image generation fails, generic card should render instantly
5. Performance: Image generation should complete in <2 seconds

**Owner:** Elon (performance), Steve (visual polish)

---

### RISK 4: Midnight Batch Job Failure

**Severity:** HIGH
**Probability:** LOW
**Status:** ARCHITECTURE RISK

#### Description
From decisions.md Section V: "If notification generator cron fails, 10K users get no notifications that day"

**Current State:**
- LocalGenius is deployed on Cloudflare Workers (stateless, ephemeral)
- Cloudflare Workers **do NOT natively support scheduled tasks** (cron)
- No cron infrastructure exists in the codebase
- Benchmark engine has a cron handler pattern (POST `/api/cron/rank/daily-sync`) but no actual scheduler configured

**Critical Architecture Problem:**
Cloudflare Workers are event-driven (HTTP requests, KV writes, etc.). They cannot run code on a schedule.

**Three Solutions (Pick One):**

**Option A: External Cron Service (Recommended for v1)**
- Use Vercel Cron, AWS EventBridge, or upstash.com
- Call `/api/pulse/cron/generate-notifications` at exactly midnight UTC
- Pro: Simple, reliable, low cost
- Con: Adds external dependency

**Option B: Migrate to Node.js Backend**
- Move Pulse logic to Node.js (e.g., Express on Railway, Render, or DigitalOcean)
- Use node-schedule or bull queue for cron jobs
- Pro: Full control, can use standard cron libraries
- Con: Rebuilds entire architecture, 2-week timeline impact

**Option C: D1 Database Triggers + Polling**
- Create database trigger that enqueues jobs when scheduled_for time arrives
- Poll every minute from a Worker to check if jobs need flushing
- Pro: Keeps everything in Cloudflare ecosystem
- Con: Inefficient (polling every minute), not true cron, higher latency

**Files That Need Modification:**
- New file: `/pulse/cron/notification-scheduler.js` - Cron endpoint handler (like daily-sync.ts)
- New file: `/pulse/notifications/generator.js` (200+ lines) - Core batch logic
- Schema migration: Add `scheduled_for` timestamp to notifications table
- wrangler.toml: Document required cron service configuration

**Estimated Complexity:** MEDIUM (dependent on which solution chosen)

**Mitigations (Mandatory):**
- [ ] **Dead man's switch:** Alert if job doesn't complete by 1:00 AM UTC (60-minute SLA)
- [ ] **Graceful degradation:** Generate notifications on-demand if batch job missed
- [ ] **Redundancy:** Run job twice (12:00 AM + 2:00 AM UTC), deduplicate notifications
- [ ] **Monitoring:** Log all job runs to D1 (success/failure/duration)
- [ ] **Rollback:** Ability to manually trigger notification generation from admin dashboard

**Testing Requirements:**
1. Cron execution timing: Verify job runs at exact midnight UTC
2. Recovery test: Trigger job manually at 2 AM, verify no duplicate notifications
3. Load test: Pre-compute 10K users' notifications in <5 minutes
4. Failure simulation: Kill job mid-execution, verify recovery
5. Timezone test: Ensure scheduled_for times are correct across timezones

**Owner:** Elon (reliability + performance)

---

## II. INFRASTRUCTURE GAPS (MISSING COMPONENTS)

### GAP 1: Email Service Integration

**Status:** NOT FOUND in codebase

**Current State:**
- No SendGrid, Postmark, or other ESP integration
- No email templates for Pulse notifications
- No unsubscribe link tracking
- Weekly digest email system exists (from benchmark engine), but no Pulse hooks

**What Needs to Be Built:**
1. Email provider integration (SendGrid recommended for SMS + Email, or Postmark for reliability)
2. Email templates (insight, badge, quiet, cliffhanger) — 4 templates × 50 lines = 200 lines
3. Unsubscribe link + preference center
4. Email delivery tracking (bounces, opens, clicks)
5. Test email sending (sandbox environment)

**Files to Create:**
- `/pulse/notifications/email-sender.js` (100 lines) - SendGrid/Postmark client
- `/pulse/notifications/templates/insight.html` (50 lines)
- `/pulse/notifications/templates/badge.html` (50 lines)
- `/pulse/notifications/templates/quiet.html` (50 lines)
- `/pulse/notifications/templates/cliffhanger.html` (50 lines)
- `/pulse/notifications/unsubscribe.js` (50 lines)

**Estimated Effort:** 1-2 days (if email provider already has account)

**Decision Needed:**
- Which ESP: SendGrid (SMS + Email bundled) or separate providers?
- From email address: notifications@localgenius.com or pulse@localgenius.com?
- Unsubscribe behavior: Hard delete or just mark as inactive?

---

### GAP 2: Cron/Scheduler Infrastructure

**Status:** NOT FULLY CONFIGURED

**Current State:**
- Benchmark engine has cron handler pattern (`handleDailySyncCron` in daily-sync.ts)
- No actual scheduler calling that endpoint
- Vercel Cron, upstash.com, or AWS EventBridge NOT configured
- Environment variable CRON_SECRET not set in .env

**What Needs to Be Configured:**
1. Choose scheduler service (Vercel Cron if using Vercel, else Upstash.com)
2. Configure midnight UTC cron job pointing to `/api/pulse/cron/generate-notifications`
3. Set CRON_SECRET environment variable
4. Add error alerting (PagerDuty, Sentry, or email alert)
5. Implement cron monitoring dashboard (track success rate, duration)

**Files to Create/Modify:**
- New file: `/pulse/cron/notification-scheduler.js` - Handler for midnight batch
- Modify: wrangler.toml - Document scheduler setup
- Modify: .env.example - Add CRON_SECRET, SCHEDULER_URL variables

**Estimated Effort:** 4-6 hours (mostly configuration, not development)

**Decision Needed:**
- Which scheduler: Vercel Cron (free tier: 100 runs/day), Upstash Qstash, or AWS EventBridge?
- Alert mechanism: Email, PagerDuty, or custom Slack webhook?

---

### GAP 3: S3/CDN for Badge Images

**Status:** PARTIALLY CONFIGURED

**Current State:**
- R2 bucket binding exists in wrangler.toml: `binding = "ASSETS"`, bucket name `localgenius-assets`
- No image generation code
- No CDN URL structure
- No CloudFlare CDN configuration
- No image caching headers set

**What Needs Configuration:**
1. Verify R2 bucket exists and is accessible
2. Set up CloudFlare CDN with R2 as origin
3. Configure CDN caching headers (30-day TTL for badge images)
4. Generate signed URLs for private badge image access (if needed)
5. Create image upload handler in Pulse code

**Files to Create/Modify:**
- New file: `/pulse/badges/image-uploader.js` (50 lines) - Upload to R2
- Modify: wrangler.toml - Verify R2 binding, add CDN config
- New file: `/lib/r2-client.js` (50 lines) - Reusable R2 upload utility

**Estimated Effort:** 2-3 hours (mostly configuration)

**Decision Needed:**
- CDN URL pattern: `cdn.localgenius.com/badges/{id}.png` or `localgenius.com/cdn/badges/{id}`?
- Public or private badge images (affects URL signing)?

---

### GAP 4: Twilio SMS Integration

**Status:** NOT FOUND in codebase

**Current State:**
- No Twilio SDK in dependencies
- No TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN in .env
- No phone number validation
- No SMS delivery tracking
- No consent/opt-in tracking

**What Needs to Be Built:**
1. Twilio SDK integration + API key setup
2. Phone number validation (libphonenumber-js)
3. SMS sending logic with retry + fallback
4. Delivery receipt (DLR) webhook handler
5. Compliance audit trail (TCPA opt-in consent)

**Files to Create:**
- New file: `/pulse/notifications/sms-sender.js` (150 lines) - Twilio client
- New file: `/pulse/notifications/sms-delivery-webhook.js` (50 lines) - Handle DLR callbacks
- New file: `/pulse/compliance/phone-validator.js` (50 lines)
- New file: `/pulse/compliance/tcpa-audit.js` (100 lines) - Consent tracking

**Estimated Effort:** 2-3 days (includes TCPA compliance review)

**Decision Needed:**
- Twilio Messaging Service or direct SMS API?
- US-only or international from day 1?
- Cost model: Gate SMS behind Pro tier ($49/month) or include in free tier?

---

## III. COMPLEXITY HOTSPOTS IN EXISTING CODEBASE

### File 1: `/home/agent/shipyard-ai/deliverables/localgenius-benchmark-engine/jobs/daily-sync.ts`

**Status:** 461 lines, HIGH COMPLEXITY reference

**Why it matters:**
This is the REFERENCE IMPLEMENTATION for batch jobs in LocalGenius. The Pulse notification generator should mirror this pattern:
- Exponential backoff retry logic
- Rate limiting between API calls
- Status tracking (synced/skipped/failed)
- Comprehensive error handling

**What to reuse:**
- Backoff config pattern (lines 71-82)
- Sleep/delay utility (line 436)
- Error classification (lines 420-430)
- Progress tracking (results array)

**Modifications needed for Pulse:**
- Replace "GBP API calls" with "notification generation"
- Replace "sync business metrics" with "compute insights + generate notifications"
- Adjust retry logic (GBP is external API; notification gen is internal DB)

**Risk:** Don't copy this complexity naively — Pulse generation should be SIMPLER (no external API calls, no rate limits)

---

### File 2: `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/workers/chat.js`

**Status:** 145 lines, MEDIUM COMPLEXITY

**Why it matters:**
Clean example of Cloudflare Workers request handling. Pulse notification dispatch should follow same patterns:
- CORS headers setup (lines 18-22)
- Request validation (lines 44-51)
- Error responses (ResponseFormatter)
- Database queries via D1

**What to reuse:**
- CORS headers pattern
- Request validation logic
- Error response format (ResponseFormatter)
- Database binding pattern (`env.DB`)

**Risk:** Chat endpoint is synchronous. Pulse must be async (queue notifications without blocking)

---

### File 3: `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/workers/faq-cache.js`

**Status:** 163 lines, MEDIUM COMPLEXITY

**Why it matters:**
Shows how to implement similarity search (Levenshtein distance) for cache hits. Pulse might use similar logic to avoid duplicate notifications:
- Question similarity matching (lines 38-45)
- Cache hit/miss tracking
- Database CRUD operations

**Risk:** This is O(n) similarity search. For 10K users generating 10K notifications simultaneously, similarity matching for deduplication could be slow.

---

## IV. MISSING INTEGRATION POINTS

### 1. Existing Weekly Digest System

**Current State:**
Benchmark engine has `rank_email_preferences` table for weekly email opt-in.

**Pulse Integration Point:**
- Hook into existing weekly digest email system to add cliffhanger + journal prompt
- Reuse unsubscribe mechanism from RANK
- Coordinate email template rendering

**Action Required:**
- [ ] Identify existing weekly digest sending code
- [ ] Design Pulse email template injection point
- [ ] Ensure no double-sending of emails (1 email per week with all Pulse + RANK content)

---

### 2. Notification Preference System

**Current State:**
No preference center exists yet.

**Pulse Adds:**
- Time of day preference (9am local time, override in settings)
- Email vs SMS toggle
- Frequency preference (daily vs weekly digest)

**Action Required:**
- [ ] Create preferences UI (minimal, 3-5 toggles per decisions)
- [ ] Store preferences in new `user_notification_preferences` table
- [ ] Modify generator to respect preferences during batch job

---

### 3. Analytics/Metrics Tracking

**Current State:**
Chat endpoint logs response times and cache hits (lines 85-86, 120-121 in chat.js).

**Pulse Adds:**
- Notification open rates (email + SMS)
- Badge share rates
- Journal entry completion rates
- Upgrade prompt click rates
- Unsubscribe/complaint rates

**Action Required:**
- [ ] Add tracking columns to notifications table
- [ ] Create analytics dashboard
- [ ] Set up monitoring alerts (>10% unsubscribe rate triggers alert)

---

## V. DATABASE SCHEMA MIGRATION RISKS

### Current Schema Gap

**Decisions.md lines 184-217 define 3 new tables:**

1. **notifications** table — REQUIRES these columns:
   - id, user_id, type, content, scheduled_for, sent_at, clicked, created_at
   - **MISSING:** phone_number, sms_opt_in, email_opt_in, delivery_status, notification_frequency_cap

2. **journal_entries** table — REQUIRES these columns:
   - id, business_id, week, tags[], note, created_at
   - **MISSING:** response_count, sentiment_analysis (for future ML)

3. **achievements** table — REQUIRES these columns:
   - id, user_id, badge_type, unlocked_at, image_url, shared
   - **MISSING:** shared_at, share_count, image_generation_status

### Migration Complexity

**Risk:** Migrating live production database with 10K users is risky.

**Mitigations:**
- [ ] Test migration on staging environment first (exactly mirror production)
- [ ] Plan zero-downtime migration (add columns as nullable, populate async)
- [ ] Create rollback procedure
- [ ] Monitor migration duration (target: <5 minutes for 10K rows)
- [ ] Have backup restore procedure ready

---

## VI. TESTING STRATEGY BY RISK AREA

### RISK AREA 1: SMS Compliance & Deliverability

**Unit Tests:**
- [ ] Phone number validation (US numbers only)
- [ ] TCPA opt-in consent tracking
- [ ] SMS message length handling (160 chars, or split into multiple)

**Integration Tests:**
- [ ] End-to-end SMS send with Twilio sandbox
- [ ] Delivery receipt webhook handling
- [ ] Opt-in/opt-out workflow
- [ ] Bounce handling (invalid numbers)

**Load Tests:**
- [ ] 10K users × 30 SMS/month = 300K SMS throughput
- [ ] Twilio rate limit handling (1,000 SMS/sec per account)
- [ ] Peak load: All users getting notification simultaneously

**Compliance Tests:**
- [ ] TCPA audit trail completeness (proof of consent)
- [ ] Unsubscribe link functionality
- [ ] Copy review for spam triggers

---

### RISK AREA 2: Batch Job Reliability

**Unit Tests:**
- [ ] Notification deduplication logic
- [ ] Frequency capping (max 1 per day)
- [ ] "All quiet" trigger logic

**Integration Tests:**
- [ ] Job failure recovery (dead man's switch)
- [ ] Redundancy test (run twice, no duplicates)
- [ ] Timezone handling (user time zones vs UTC job time)

**Load Tests:**
- [ ] Pre-compute 10K users' notifications in <5 minutes
- [ ] Database lock handling (concurrent updates)
- [ ] Memory usage (should not exceed Cloudflare Worker limits)

**Reliability Tests:**
- [ ] Manual job trigger works from admin dashboard
- [ ] Cron scheduling is reliable (run 100 times, verify all successful)
- [ ] Monitoring alerts fire when job fails

---

### RISK AREA 3: Image Generation

**Unit Tests:**
- [ ] Image generation with mock Sharp library
- [ ] Fallback card rendering if generation fails

**Integration Tests:**
- [ ] R2 upload + CDN serving
- [ ] Image URL generation (correct format)
- [ ] Cache headers set correctly (30-day TTL)

**Load Tests:**
- [ ] 5,000 concurrent badge unlocks
- [ ] Image generation latency <2 seconds
- [ ] R2 upload throughput

---

### RISK AREA 4: Notification Fatigue

**A/B Test Plan (before launch):**
- Test Group A: Daily notifications (current design)
- Test Group B: 3x/week notifications
- Measure: Unsubscribe rate, open rate, engagement

**Metrics to Track:**
- [ ] Unsubscribe rate <5% (failure: >10%)
- [ ] Open rate >40% (email) / >70% (SMS)
- [ ] Engagement: Click-through on upgrade prompts >2%

---

## VII. CODEBASE MODIFICATION CHECKLIST

### Database Migrations (Order Matters)

```
1. Create notifications table with all columns
2. Create journal_entries table
3. Create achievements table
4. Create user_notification_preferences table (NEW)
5. Add indexes for performance
6. Add triggers for audit trails
```

### New Files to Create (in `/pulse` directory)

```
/notifications/
  ├── generator.js (200 lines) ★ CRITICAL
  ├── sender.js (100 lines)
  ├── email-sender.js (100 lines)
  ├── sms-sender.js (150 lines)
  ├── templates/
  │   ├── insight.js (50 lines)
  │   ├── badge.js (50 lines)
  │   ├── quiet.js (50 lines)
  │   ├── cliffhanger.js (50 lines)
  │   ├── insight.html (50 lines)
  │   ├── badge.html (50 lines)
  │   ├── quiet.html (50 lines)
  │   └── cliffhanger.html (50 lines)
  ├── sms-delivery-webhook.js (50 lines)
  └── unsubscribe.js (50 lines)

/badges/
  ├── checker.js (150 lines) ★ CRITICAL
  ├── image-generator.js (100 lines)
  ├── cdn-uploader.js (50 lines)
  ├── fallback-card.js (50 lines)

/journal/
  ├── prompt.js (50 lines)
  └── storage.js (50 lines)

/ui-enhancements/
  ├── trends.js (150 lines)
  └── upgrade-prompts.js (100 lines)

/settings/
  └── preferences.js (50 lines)

/compliance/
  ├── phone-validator.js (50 lines)
  ├── tcpa-audit.js (100 lines)

/cron/
  └── notification-scheduler.js (100 lines) ★ CRITICAL

/lib/
  ├── sms-client.js (50 lines)
  ├── email-client.js (50 lines)
  └── r2-client.js (50 lines)
```

**Total: ~2,050 lines (Elon's estimate: 900 lines — WILL EXCEED)**

---

### Files to Modify

```
/deliverables/localgenius-frontend-launch/backend/wrangler.toml
  - Add Twilio environment binding
  - Verify R2 binding
  - Add scheduler configuration

/deliverables/localgenius-frontend-launch/backend/db/schema.sql
  - Add 3 new tables + columns
  - Add indexes
  - Add audit tables

.env
  - Add TWILIO_ACCOUNT_SID
  - Add TWILIO_AUTH_TOKEN
  - Add SENDGRID_API_KEY or POSTMARK_API_KEY
  - Add CRON_SECRET
  - Add R2 bucket credentials
```

---

## VIII. DECISION DEPENDENCIES (BLOCKERS)

These decisions MUST be made BEFORE development starts:

### 1. SMS Provider & Cost Model (Decision.md IV.1)
**Status:** OPEN
**Impact:** Affects budget, compliance strategy, cron job design
**Decision Owner:** Elon (growth/performance)
**Recommended:** Twilio Messaging Service (safe for scale)

### 2. "All Quiet" Frequency Cap (Decision.md IV.3)
**Status:** OPEN
**Impact:** Affects schema design (need new timestamp column)
**Decision Owner:** Steve (brand voice) + Elon (anti-spam)
**Recommended:** Cap at 2x/week maximum

### 3. Notification Timing (Decision.md IV.4)
**Status:** OPEN
**Impact:** Affects generator logic (timezone handling)
**Decision Owner:** Steve (opinionated simplicity) vs Elon (user control)
**Recommended:** Default 9am local, allow override in settings

### 4. Badge Milestone Thresholds (Decision.md IV.2)
**Status:** OPEN
**Impact:** Affects badge checker logic
**Decision Owner:** Steve + Elon
**Must define 5 badge unlock criteria before building checker.js**

### 5. Notification Timing vs Timezone Handling
**Status:** CRITICAL
**Impact:** How do we compute "9am local time" for each user?
**Question:** Is user_id linked to a timezone/location in existing schema?
**Action:** Check LocalGenius users table for timezone field

---

## IX. PERFORMANCE REQUIREMENTS & SLA

### Notification Generator (Midnight UTC Batch)
- **Target:** Process 10K users in <5 minutes
- **Latency:** <500ms per user
- **Database:** Must handle 10K concurrent writes with no deadlocks
- **Memory:** Cloudflare Workers 128MB limit — must not exceed

### SMS Delivery
- **Twilio Rate Limit:** 1,000 SMS/sec per account
- **Target:** Send all 10K users' SMS within 10 seconds (100 SMS/sec)
- **Delivery Rate:** >95% successful

### Email Delivery
- **Target:** Queue 10K emails within 30 seconds
- **Send Rate:** 100 emails/sec (SendGrid standard)
- **Bounce Rate:** <2% (target)

### Image Generation
- **Target:** <2 seconds per badge image
- **Load:** 5K concurrent badge unlocks
- **R2 Throughput:** 10 images/sec sustained

### First-Run Experience
- **Target:** <30 seconds to show first insight (per decisions.md)
- **Database:** Single user query should take <100ms
- **No blank states:** Must show demo data if no real data exists

---

## X. CODEBASE-SPECIFIC RISKS

### Risk: Cloudflare Workers Execution Model

**Problem:** Workers are ephemeral and stateless. Long-running batch jobs (pre-computing 10K notifications) could timeout.

**Current Timeout Limit:** 30 seconds for Cloudflare Workers Free tier, 120 seconds for Paid

**Impact:** Generating 10K notifications in 30 seconds = 3ms per notification (tight but possible)

**Mitigation:**
- Batch notifications in chunks (1K per batch)
- Use D1 to store intermediate state (resume if job interrupted)
- Implement pagination/cursor for batch processing

---

### Risk: D1 Database Lock Contention

**Problem:** 10K concurrent INSERT operations on notifications table could cause lock contention

**Current Schema:** No mention of locking strategy in existing schema

**Mitigation:**
- Use INSERT with ON CONFLICT DO UPDATE (idempotent)
- Batch inserts into groups (bulk insert 100 notifications at a time)
- Monitor D1 performance metrics (lock wait time)

---

### Risk: R2 Upload Bandwidth

**Problem:** Uploading 5K+ badge images simultaneously to R2 could saturate bandwidth

**Mitigation:**
- Queue image uploads (background job, not critical path)
- Stagger uploads over 10-minute window
- Use parallel uploads (10 concurrent requests max)

---

### Risk: Email/SMS Template Rendering

**Problem:** No templating engine specified in codebase (Handlebars? Mustache? Plain string concatenation?)

**Existing Pattern:** OpenAI client uses string concatenation for prompts (see openai-client.js line 75)

**Recommendation:** Use Handlebars or Mustache for maintainability (e.g., "{{ business_name }}, you had {{ visit_count }} visits this week")

---

## XI. TESTING REQUIREMENTS SUMMARY

### Pre-Launch Testing (Mandatory for v1)

**Smoke Tests (Before any feature testing):**
- [ ] Notification table can be created via migration
- [ ] 10K users can be inserted into notifications table
- [ ] Queries on notifications table return results in <100ms
- [ ] Cron endpoint is callable and returns 200 OK

**Feature Tests (Per feature):**
- [ ] Email sending works (test both templates)
- [ ] SMS sending works (test US phone numbers)
- [ ] Badge image generation works (test fallback)
- [ ] Journal entry storage works
- [ ] Notification delivery tracking works

**Integration Tests:**
- [ ] Midnight batch job completes without errors
- [ ] Notifications are queued with correct scheduled_for time
- [ ] Email/SMS delivery happens within 60 seconds of scheduled_for
- [ ] Preference updates are respected (don't send to opted-out users)

**Load Tests:**
- [ ] 10K notifications generated + queued in <5 minutes
- [ ] 10K emails sent in <2 minutes
- [ ] 10K SMS sent in <30 seconds
- [ ] Image generation handles 5K concurrent requests

**Compliance Tests (Before SMS launch):**
- [ ] TCPA opt-in audit trail is complete
- [ ] Unsubscribe link works
- [ ] Delivery receipts are tracked

---

## XII. RISK MITIGATION ROADMAP

### Week 1: Infrastructure Setup (PARALLEL)

**Track A: DevOps**
- [ ] Choose SMS provider (Twilio + account setup)
- [ ] Choose email provider (SendGrid recommended)
- [ ] Choose scheduler (Vercel Cron or Upstash)
- [ ] Verify R2 bucket + CDN setup
- [ ] Database schema migration (create 3 tables)
- [ ] Environment variables configuration

**Track B: Backend Development**
- [ ] Implement notification generator skeleton
- [ ] Implement email sender
- [ ] Implement SMS sender
- [ ] Implement badge checker

### Week 2: Feature Development

- [ ] Complete notification generator logic
- [ ] Complete badge image generation
- [ ] Complete journal entry storage
- [ ] Complete preferences UI
- [ ] Implement unsubscribe workflow

### Week 3: Testing + Hardening

- [ ] Run load tests (10K users)
- [ ] Run compliance tests (TCPA audit)
- [ ] Fix issues from load tests
- [ ] Polish brand voice (Steve review)
- [ ] Performance optimization

### Launch Readiness Checklist

- [ ] SMS delivery rate >95%
- [ ] Notification open rate >30% (alpha test)
- [ ] Badge image generation <2 seconds
- [ ] Cron job success rate 100% (run 10 times)
- [ ] Database migration completed without errors
- [ ] Monitoring/alerting is configured
- [ ] Runbook for manual notification triggering
- [ ] Rollback procedure documented

---

## XIII. FINAL RECOMMENDATIONS

### High Priority (Week 1)

1. **Resolve 4 Decision Blockers** — SMS provider, "All quiet" frequency, notification timing, badge thresholds
2. **Stand up SMS + Email Infrastructure** — Twilio, SendGrid, scheduler service
3. **Database Schema Migration** — Create 3 new tables + necessary columns
4. **Cron Infrastructure** — Configure scheduler, create endpoint handler

### Medium Priority (Week 1-2)

5. **Image Generation POC** — Verify Sharp works on Cloudflare Workers
6. **Batch Job POC** — Test 10K notification generation in <5 minutes
7. **Email Template Library** — Build reusable template renderer

### Low Priority (Week 2+, Post-MVP)

8. **Advanced Analytics** — Dashboard for open rates, engagement metrics
9. **A/B Testing Framework** — Frequency, copy, timing variations
10. **Mobile Push Notifications** — Requires mobile app (out of scope for v1)

---

## APPENDIX: FILE CROSS-REFERENCES

### Files Requiring Modification
- `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/wrangler.toml` (environment bindings)
- `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/db/schema.sql` (new tables)
- `/home/agent/shipyard-ai/.env` (secrets + credentials)

### Reference Files (Reuse Patterns)
- `/home/agent/shipyard-ai/deliverables/localgenius-benchmark-engine/jobs/daily-sync.ts` (batch job pattern)
- `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/workers/chat.js` (request handling)
- `/home/agent/shipyard-ai/deliverables/localgenius-frontend-launch/backend/workers/faq-cache.js` (DB operations)

### Decisions Document
- `/home/agent/shipyard-ai/rounds/localgenius-engagement-system/decisions.md` (locked requirements)

---

## REPORT SIGN-OFF

**Report Generated:** 2026-04-18
**Risk Scanner Version:** 1.0
**Analysis Scope:** Complete codebase + decisions document
**Confidence Level:** HIGH (all gaps verified via code inspection)

**Next Steps:**
1. Share this report with Elon + Steve for decision sign-off
2. Create Jira/Linear tickets for each infrastructure gap
3. Assign Week 1 DevOps track to prevent 2-week timeline slip
4. Schedule decision review meeting for open questions (SMS provider, frequency cap, etc.)

---
