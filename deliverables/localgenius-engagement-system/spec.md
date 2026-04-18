# LocalGenius Engagement System (Pulse) — Technical Specification

**Project:** LocalGenius Engagement System
**Product Name:** Pulse
**Status:** Ready for Build
**Ship Date:** 2 weeks (14 days)
**Build Artifact:** Feature plugin for LocalGenius

---

## 1. Goals

### Business Goals (from PRD)
1. **Increase daily engagement** — Transform LocalGenius from "weekly tool" to "daily companion"
2. **Build data moat** — Capture proprietary business journal annotations competitors can't replicate
3. **Drive upgrade conversion** — Contextual upgrade prompts at natural friction points
4. **Improve retention** — Weekly cliffhangers create "tune in next week" anticipation
5. **Enable viral growth** — Shareable milestone badges drive word-of-mouth

### Success Metrics (30-day post-launch)
- **DAU/WAU ratio:** Target 50%+ (from ~20% baseline)
- **Notification open rate:** >40% (email) / >70% (SMS)
- **First-run retention:** >60% open Pulse 3+ times in first week
- **Badge share rate:** >10% of badge unlocks result in social share
- **Pro upgrade rate:** >5% of free users upgrade within 30 days
- **Unsubscribe rate:** <5%

### User Experience Goals (from Debate Decisions)
- **30-second dopamine hit** — Show something meaningful immediately or fail
- **"Daily heartbeat"** — User feels their business is alive and someone is watching
- **One number per day** — Maximum impact, minimum friction (differentiation from dashboard competitors)
- **Warm, human brand voice** — "Sous chef" tone, not consultant/robot

---

## 2. Implementation Approach

### Architecture (Elon's 3-Table System)
Simple systems compound. Complex ones collapse. Core system uses 3 database tables:

1. **`notifications`** — Pre-computed notifications with scheduled delivery
2. **`journal_entries`** — User annotations (proprietary training data)
3. **`achievements`** — Milestone badge unlocks and share tracking

**Key Technical Decision:** Midnight UTC batch generation (Elon wins, Section II.3)
- Generate all notifications at midnight UTC asynchronously
- Store with `scheduled_for` timestamp
- Flush queue every 10 minutes at user's preferred time
- Prevents 9am spike bottleneck, scales to 1M users without rewrite

### Feature Set (from Debate — Must-Haves Only)

#### 1. Daily Notifications (Email + SMS)
- **Trigger:** When meaningful insight exists (trend, milestone, engagement spike)
- **Content:** One primary insight + context ("Up 40% from last week — your new lunch special is working")
- **Delivery channels:** Email (default) + SMS (opt-in)
- **Fallback:** "All quiet today" reassurance message when no data (max 2x/week frequency cap)
- **User control:** Time preference, frequency (daily/weekly), channel preference

#### 2. Five Milestone Badges
- **Badges:**
  1. Getting Started (first week completed)
  2. Review Responder (50 reviews managed)
  3. Local Favorite (500 website visitors)
  4. Destination Dining (1000 website visitors)
  5. Consistent (4-week streak)
- **Features:**
  - Auto-unlock on achievement
  - Confetti animation on unlock (dopamine hit)
  - Auto-generate shareable OG image (1200x630px, async, S3/CDN-cached)
  - One-tap share to Instagram/Facebook with pre-filled copy (user-editable)
- **Gallery:** Badge collection in account settings (locked + unlocked, with progression indicators)

#### 3. Weekly Journal Prompt
- **Delivery:** Inline in weekly digest email (Sunday evening/Monday morning)
- **Question:** "What worked this week?"
- **UI:** Simple text input with skip option
- **Storage:** Append-only journal_entries table
- **Purpose:** Proprietary labeled data moat (Jensen's endorsement)

#### 4. Trend Narratives
- **Enhancement:** Add % deltas to existing weekly digest metrics
- **Calculation:** SQL window functions (LAG/LEAD) for week-over-week comparison
- **Copy example:** "340 visits (up 22% from last week — your second-best week ever)"
- **Tone:** Warm, human ("People are noticing you" not "Traffic +40%")

#### 5. Weekly Cliffhanger
- **Placement:** End of weekly digest (2 sentences)
- **Examples:**
  - "Next week, I'm trying a different post style. I'll let you know if it works."
  - "I noticed competitors are doing X. I'm going to test something."
  - "Your best week was [date]. I'm studying what worked."
- **Tone:** First person (AI speaking), curious, experimental, never promises

#### 6. Inline Upgrade Prompts
- **Trigger points:**
  - User views social post performance → "Want to see which post drove bookings? That's in Pro."
  - 3+ locations → "Managing multiple locations? Franchise dashboard is in Pro."
  - Competitor mentioned in reviews → "Pro includes competitive benchmarking."
  - 90-day streak → "You're a power user! Pro users see 40% better results."
  - After milestone celebration → "Ready to level up? Pro unlocks advanced insights."
- **UI:** Inline contextual prompts only (NO modals, countdown timers, dark patterns)
- **Copy:** "Unlock" language, not "Buy"

#### 7. First-Run Experience
- **Requirement:** Show something immediately (demo data if needed)
- **No blank dashboards** or "Set up preferences" walls
- **Target:** 30-second dopamine hit or fail

### What's CUT from v1 (from Debate)
- ❌ Competitive benchmarks (no cross-restaurant data yet — v3 feature)
- ❌ Multi-metric dashboards (moat is simplicity)
- ❌ Gamification leaderboards (badges celebrate you, not comparison)
- ❌ Advanced notification customization (3-5 toggles max, not 47-toggle preference center)

---

## 3. Verification Criteria

### Database Layer
- [ ] **Migrations run successfully** on fresh LocalGenius database
- [ ] **3 tables exist** with correct schema (notifications, journal_entries, achievements)
- [ ] **Indexes created** on (user_id, scheduled_for), (business_id, week), (user_id, badge_type)
- [ ] **Foreign key constraints valid** (no orphaned records)
- [ ] **User preference fields added** to users table (sms_opt_in, notification_time, notification_frequency, preferred_channels)

### Notification System
- [ ] **Email notification sent** via Resend within 60 seconds of trigger
- [ ] **SMS notification sent** via Twilio to opted-in users only
- [ ] **Click tracking works** — notifications.clicked field updates on link click
- [ ] **Midnight batch job runs** at 00:00 UTC daily (Vercel cron configured)
- [ ] **Batch job completes** in <2 minutes for 100 test users
- [ ] **No duplicate notifications** — deduplication logic prevents multiple notifications per user per day
- [ ] **Scheduled delivery works** — notifications delivered within 5 minutes of scheduled_for timestamp
- [ ] **"All quiet" frequency cap** — max 2 quiet notifications per user per week
- [ ] **Dead man's switch alerts** if batch job doesn't complete by 01:00 UTC
- [ ] **All 4 notification templates render** correctly (insight, badge, journal_prompt, cliffhanger, quiet)

### Badge System
- [ ] **Badge detection runs** daily after metrics update
- [ ] **Badge unlocks correctly** when threshold reached (e.g., 500 visits = Local Favorite)
- [ ] **No duplicate unlocks** — same badge not awarded twice
- [ ] **Confetti animation plays** on badge unlock modal (2-3 seconds, >60fps on mobile)
- [ ] **Animation respects prefers-reduced-motion** accessibility setting
- [ ] **OG image generated** asynchronously within 5 minutes of unlock
- [ ] **OG image is 1200x630px** and suitable for Instagram/Facebook
- [ ] **Fallback image served** if custom generation fails
- [ ] **Share button opens** Web Share API native UI (or clipboard fallback)
- [ ] **Pre-filled share text editable** by user before sharing
- [ ] **Share events tracked** in database (achievements.shared=true, shared_at timestamp)
- [ ] **Badge gallery loads** in <1 second
- [ ] **Badge gallery shows** locked + unlocked badges with progression indicators
- [ ] **5 badge definitions exist** with correct thresholds and messaging (Steve-approved copy)

### Journal System
- [ ] **Journal prompt appears** inline in weekly digest email
- [ ] **Journal entry saved** to database on submission
- [ ] **Skip button works** and logs skip event to analytics
- [ ] **Journal history query** returns all entries in chronological order (<100ms)
- [ ] **Prompt scheduled** for Sunday evening or Monday morning per user timezone

### Trend Narratives
- [ ] **WoW percentage delta calculated** correctly for all metrics
- [ ] **Edge case handled:** zero baseline shows absolute value, not "undefined% increase"
- [ ] **Edge case handled:** missing data skips comparison gracefully
- [ ] **Trend calculation completes** in <500ms for 10 metrics
- [ ] **Copy is warm and human** ("up 22% from last week" not "+22% WoW")

### Cliffhanger System
- [ ] **Cliffhanger appended** to end of weekly digest
- [ ] **5-10 cliffhanger templates exist** with context-aware selection logic
- [ ] **Tone is first-person, curious** (uses "testing," "trying," never "promising")
- [ ] **All cliffhanger copy approved** by Steve for brand voice

### Preferences UI
- [ ] **Settings panel accessible** from account settings
- [ ] **3-5 toggles only** (time picker, frequency dropdown, channel checkboxes)
- [ ] **SMS opt-in disclaimer visible** for TCPA compliance
- [ ] **Preferences save** to database and affect next notification
- [ ] **Unsubscribe/pause option** available at bottom
- [ ] **No decision fatigue** — clean, minimal UI

### Analytics & Tracking
- [ ] **Notification metrics tracked:** sent_at, opened_at, clicked_at, clicked_url
- [ ] **Badge metrics tracked:** unlock_rate, share_rate
- [ ] **Journal metrics tracked:** prompt_shown, completed, skipped
- [ ] **Upgrade prompt metrics tracked:** shown_at, clicked_at, converted_at
- [ ] **Daily aggregation job runs** successfully
- [ ] **Analytics dashboard queries** return data in <1 second
- [ ] **Real-time alerts fire** when thresholds exceeded (unsubscribe >10%, open <20%, share <5%)

### Performance
- [ ] **Notification generation:** <2 minutes for 100 users
- [ ] **Scheduled delivery:** within 5 minutes of scheduled_for timestamp
- [ ] **Badge unlock latency:** <24 hours from metric reached to unlock
- [ ] **Badge image generation:** <2 seconds per image
- [ ] **Badge gallery load:** <1 second
- [ ] **Trend calculation:** <500ms for 10 metrics
- [ ] **Journal history query:** <100ms

### Compliance & Security
- [ ] **SMS opt-in explicit** (TCPA-compliant)
- [ ] **SMS not sent** if opt-in=false
- [ ] **Email unsubscribe link** in all notification emails
- [ ] **GDPR data export** includes journal entries, notifications, achievements
- [ ] **No sensitive data logged** in public analytics

### Brand Voice Quality
- [ ] **Steve approves** all notification templates
- [ ] **Steve approves** all badge messaging
- [ ] **Steve approves** all cliffhanger copy
- [ ] **Steve approves** all "all quiet" messaging
- [ ] **Copy is warm, human, first-person** where appropriate
- [ ] **No robotic or corporate tone** in any user-facing text

### First-Run Experience
- [ ] **New user sees** demo insight or real data within 30 seconds
- [ ] **No blank dashboards** or empty states without explanation
- [ ] **Demo data labeled** as "Here's what Pulse will look like"
- [ ] **Zero P0 bugs** in first login flow

---

## 4. Files to Create or Modify

### Database Migrations
- `+` `/migrations/001_create_notifications_table.sql`
- `+` `/migrations/002_create_journal_entries_table.sql`
- `+` `/migrations/003_create_achievements_table.sql`
- `+` `/migrations/004_add_user_preferences.sql`
- `+` `/migrations/005_create_badge_definitions.sql`
- `+` `/migrations/006_create_analytics_tables.sql`

### Backend Services — Notifications
- `+` `/src/services/notifications/email-sender.ts` (200 lines)
- `+` `/src/services/notifications/sms-sender.ts` (150 lines)
- `+` `/src/services/notifications/templates/insight.ts` (50 lines)
- `+` `/src/services/notifications/templates/badge.ts` (50 lines)
- `+` `/src/services/notifications/templates/quiet.ts` (50 lines)
- `+` `/src/services/notifications/templates/cliffhanger.ts` (50 lines)
- `+` `/src/services/notifications/templates/email/` (directory with HTML templates)
- `+` `/src/jobs/notification-generator.ts` (200 lines)
- `+` `/src/jobs/scheduled-delivery.ts` (150 lines)

### Backend Services — Badges
- `+` `/src/services/badges/checker.ts` (150 lines)
- `+` `/src/services/badges/image-generator.ts` (100 lines)
- `+` `/src/jobs/badge-checker.ts` (50 lines)
- `+` `/src/jobs/badge-image-gen.ts` (50 lines)

### Backend Services — Journal
- `+` `/src/services/journal/prompt.ts` (50 lines)
- `+` `/src/services/journal/storage.ts` (50 lines)

### Backend Services — Trends
- `+` `/src/services/trends/calculator.ts` (150 lines)

### Backend Services — Analytics
- `+` `/src/services/analytics/pulse-tracker.ts` (150 lines)

### API Routes
- `+` `/src/api/notifications.ts` (100 lines)
- `+` `/src/api/sms.ts` (50 lines)
- `+` `/src/api/journal.ts` (100 lines)
- `+` `/src/api/achievements.ts` (100 lines)
- `+` `/src/api/achievements/[id]/share.ts` (50 lines)
- `+` `/src/api/achievements/gallery.ts` (100 lines)
- `+` `/src/api/settings/notification-preferences.ts` (100 lines)
- `+` `/src/api/settings/sms-opt-in.ts` (50 lines)
- `+` `/src/api/analytics/pulse.ts` (100 lines)

### Frontend Components
- `+` `/src/components/NotificationPreferences.tsx` (150 lines)
- `+` `/src/components/BadgeUnlockModal.tsx` (200 lines)
- `+` `/src/components/BadgeGallery.tsx` (200 lines)
- `+` `/src/components/BadgeCard.tsx` (100 lines)

### Configuration
- `~` `/vercel.json` — Add cron jobs for midnight batch, scheduled delivery, badge checker
- `~` `/.env.example` — Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER placeholders
- `~` `/package.json` — Add twilio, canvas-confetti, @vercel/og (or canvas) dependencies

### Existing File Modifications
- `~` `/src/services/email.ts` — Reference for Resend integration pattern
- `~` `/src/db/schema.ts` — Add 3 new tables + user preference fields
- `~` `/src/services/analytics/metrics.ts` — Data source for notification content
- `~` `/src/services/digest/generator.ts` — Integrate journal prompt, trend narratives, cliffhanger
- `~` `/src/services/digest/templates.ts` — Append cliffhanger to digest template

### Tests
- `+` `/tests/notifications/email-sender.test.ts`
- `+` `/tests/notifications/sms-sender.test.ts`
- `+` `/tests/notifications/generator.test.ts`
- `+` `/tests/badges/checker.test.ts`
- `+` `/tests/badges/image-generator.test.ts`
- `+` `/tests/journal/storage.test.ts`
- `+` `/tests/trends/calculator.test.ts`
- `+` `/tests/analytics/pulse-tracker.test.ts`

### Documentation
- `+` `/docs/PULSE.md` — User-facing documentation for Pulse feature
- `+` `/docs/PULSE-API.md` — API reference for Pulse endpoints
- `+` `/docs/PULSE-DEPLOYMENT.md` — Deployment checklist and configuration guide

**Total New Code:** ~900 lines (matches Elon's estimate from Phase 1 Plan)

---

## 5. Open Questions Requiring Resolution Before Build

### BLOCKER 1: SMS Provider & Cost Model (Open Question #1)
- **Question:** Twilio vs. AWS SNS? What's the cost per notification at 10K users?
- **Cost Model:** 10K users × 30 SMS/mo × $0.03 = $9K/month
- **Decision needed by:** Wave 1 kickoff (blocks task-002)
- **Recommendation:** Twilio for delivery quality, gate behind Pro tier if cost >$5K/month

### BLOCKER 2: Badge Milestone Thresholds (Open Question #2)
- **Question:** Validate thresholds (500 visits, 1000 visits, 50 reviews, 4-week streak) with existing user data
- **Decision needed by:** Wave 1 kickoff (blocks task-008)
- **Recommendation:** Data analysis to ensure thresholds are achievable but not too easy

### BLOCKER 3: "All Quiet" Frequency Cap (Open Question #3)
- **Question:** Max 2x/week or different cap?
- **Decision needed by:** Wave 1 kickoff (blocks task-005)
- **Recommendation:** Max 2x/week (Steve + Elon compromise)

### BLOCKER 4: Notification Timing Default (Open Question #4)
- **Question:** Default to 9am local or let users pick immediately?
- **Decision needed by:** Wave 2 kickoff (blocks task-006)
- **Recommendation:** Default to 9am local, allow override in settings

### Non-Blocker 5: Badge Share Copy
- **Question:** Pre-filled share text locked or user-editable?
- **Recommendation:** Pre-filled with edit option (best of both worlds)

### Non-Blocker 6: Journal Prompt Rotation
- **Question:** Same prompt every week or rotate through 10+ prompts?
- **Recommendation:** Ship simple (same prompt), iterate based on completion rates

### Non-Blocker 7: First-Run Demo Data
- **Question:** Show demo insights or elegant empty state?
- **Recommendation:** Show 1-2 demo insights with disclaimer ("Here's what Pulse will look like")

---

## 6. Risk Register

### HIGH SEVERITY
1. **SMS Compliance & Deliverability** (Section V Risk 1)
   - Mitigation: Explicit opt-in, TCPA-compliant templates, carrier deliverability monitoring
   - Owner: Elon

2. **Midnight Batch Job Failure** (Section V Risk 4)
   - Mitigation: Dead man's switch, redundancy at 2am UTC, graceful degradation
   - Owner: Elon

### MEDIUM SEVERITY
3. **Notification Fatigue** (Section V Risk 2)
   - Mitigation: Frequency caps, unsubscribe flow, track open/click rates
   - Target: <5% unsubscribe rate
   - Owner: Steve + Elon

4. **"One Number Per Day" Feels Limiting** (Section V Risk 5)
   - Mitigation: Position Pulse as complementary, not replacement; Pro tier unlocks deeper view
   - Monitor: If >20% request "more data," revisit decision
   - Owner: Steve

5. **Badges Don't Drive Sharing** (Section V Risk 6)
   - Mitigation: Track share rate (target >10%); if <5%, investigate and pivot
   - Owner: Elon + Steve

6. **SMS Costs Blow Up Budget** (Section V Risk 8)
   - Mitigation: Gate SMS behind Pro tier, cap free tier, monitor cost real-time
   - Owner: Elon

7. **Inline Upgrade Prompts Under-Perform** (Section V Risk 10)
   - Mitigation: Track conversion rates; if <2%, test more prominent (but respectful) CTAs
   - Owner: Elon + Steve

### LOW SEVERITY
8. **Badge Image Generation Latency** (Section V Risk 3)
   - Mitigation: Async generation, fallback generic image, <5min target
   - Owner: Elon

9. **Journal Feature Ignored** (Section V Risk 7)
   - Mitigation: Track completion rates; if <10%, demote to optional; if >30%, invest in v2
   - Owner: Steve

10. **Brand Voice Inconsistency** (Section V Risk 9)
    - Mitigation: Copywriting templates for all scenarios, Steve reviews pre-launch
    - Owner: Steve

---

## 7. Definition of Done

### Code Complete
- [ ] All 18 Phase 1 tasks completed (per phase-1-plan.md)
- [ ] All 3 Wave 1 waves shipped (Foundation, Integration, Polish)
- [ ] All files from section 4 created or modified
- [ ] All verification criteria from section 3 passing

### Quality Gates
- [ ] `npm run typecheck` — zero TypeScript errors
- [ ] `npm run test` — all tests passing (>80% coverage for new code)
- [ ] `npm run build` — builds successfully
- [ ] `npm run db:migrate` — migrations run cleanly

### Performance Benchmarks
- [ ] Notification generation: <2 minutes for 100 users
- [ ] Badge unlock latency: <24 hours
- [ ] Badge gallery load: <1 second
- [ ] Trend calculation: <500ms
- [ ] Badge image generation: <5 minutes (async)

### Stakeholder Approval
- [ ] Steve approves all copy (notifications, badges, cliffhanger, "all quiet")
- [ ] Elon approves architecture and performance benchmarks
- [ ] Zero P0 bugs in first-run experience
- [ ] Staging tested with 100 alpha users
- [ ] Notification open rate >30% in alpha test
- [ ] SMS delivery rate >95% in alpha test

### Documentation
- [ ] PULSE.md user guide complete
- [ ] PULSE-API.md API reference complete
- [ ] PULSE-DEPLOYMENT.md deployment checklist complete
- [ ] All code commented with JSDoc where appropriate

### Deployment Ready
- [ ] Vercel cron jobs configured (midnight batch, scheduled delivery, badge checker)
- [ ] Environment variables configured (TWILIO_*, Resend API key)
- [ ] S3/CDN configured for badge images
- [ ] Analytics dashboard operational
- [ ] Monitoring and alerts configured
- [ ] Git tagged for release (v1.0.0-pulse)

---

## 8. Success Criteria (Post-Launch Validation)

### North Star Metrics (30 Days Post-Launch)
| Metric | Target | Validation Method |
|--------|--------|-------------------|
| Notification Open Rate | >40% (email), >70% (SMS) | task-018 analytics |
| First-Run Retention | >60% open Pulse 3+ times in first week | task-018 analytics |
| Badge Share Rate | >10% of unlocks result in social share | task-018 analytics |
| Pro Upgrade Rate | >5% within 30 days | task-018 analytics |
| Unsubscribe Rate | <5% | task-018 analytics |

### Failure Conditions (Triggers for Pivot)
- <20% notification open rate → we're spam
- >10% unsubscribe rate → we're annoying
- <2% upgrade conversion → economics don't work
- <5% badge share rate → viral hypothesis failed

### Qualitative Signals
- User testimonials mentioning "feel," "connection," "reassurance"
- Restaurant owner word-of-mouth referrals
- Low support tickets re: confusion or frustration

---

## 9. Timeline & Dependencies

### Wave 1: Foundation (Days 1-7, Parallel)
- Tasks: 001, 002, 003, 007, 008, 013, 014, 015, 016, 017
- **Critical path:** task-003 (batch generator) must complete before Wave 2

### Wave 2: Integration (Days 8-12, Parallel)
- Tasks: 004, 005, 006, 009, 010, 011, 018
- **Dependencies:** Requires Wave 1 complete
- **Critical path:** task-009 (badge images) must complete before Wave 3

### Wave 3: Polish (Days 13-14)
- Tasks: 012
- **Dependencies:** Requires Wave 2 complete
- QA, testing, launch preparation

### Ship Date: Day 14 (2 weeks from kickoff)

---

**Document Status:** LOCKED — Ready for Build Phase
**Last Updated:** 2026-04-18
**Next Milestone:** Resolve 4 open questions, begin Wave 1 execution
