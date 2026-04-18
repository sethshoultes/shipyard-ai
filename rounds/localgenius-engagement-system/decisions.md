# LocalGenius Engagement System — Locked Decisions
## Build Blueprint (Post-Debate Consolidation)

**Orchestrated by:** Phil Jackson, Zen Master
**Date:** Post-Round 2 Synthesis
**Status:** LOCKED — Ready for Implementation

---

## Executive Summary

**Product Name:** Pulse
**Core Promise:** A daily heartbeat notification that makes restaurant owners feel their business is alive and someone is watching.
**Success Metric:** First 30 seconds. Show something meaningful immediately or fail.
**Philosophy:** Simple 3-table architecture (Elon) + Warm, human experience (Steve)

---

## I. LOCKED DECISIONS — Who Proposed, Who Won, Why

### 1. Product Name: "Pulse"
- **Proposed by:** Steve Jobs (Round 1)
- **Challenged by:** Elon Musk (Round 2) — conceded
- **Winner:** Steve
- **Rationale:** One word, one syllable, emotional resonance. "Engagement System" sounds corporate. "Pulse" is memorable, tweetable, and communicates the heartbeat metaphor. Elon agreed naming matters for conversion.
- **Status:** ✅ LOCKED

### 2. Architecture: 3 Tables, Not a Platform
- **Proposed by:** Elon Musk (Round 1)
- **Challenged by:** Steve Jobs — conceded (Round 2)
- **Winner:** Elon
- **Rationale:** Simple systems compound, complex ones collapse. 3 tables (`notifications`, `journal_entries`, `achievements`) handle all functionality. No microservices, no event buses, no over-engineering. Steve conceded: "His architecture is elegant. Let's build that."
- **Tables:**
  - `notifications` (user_id, type, content, sent_at, clicked, scheduled_for)
  - `journal_entries` (business_id, week, tags[], note)
  - `achievements` (user_id, badge_type, unlocked_at)
- **Status:** ✅ LOCKED

### 3. Pre-Computed Notifications (Midnight UTC Batch)
- **Proposed by:** Elon Musk (Round 1)
- **Challenged by:** None
- **Winner:** Elon (unanimous)
- **Rationale:** Prevents 9am spike bottleneck. Generate notifications asynchronously at midnight UTC, store with `scheduled_for` timestamp, flush queue on schedule. Scales to 1M users without rewrite. Steve agreed: "I didn't think about the 9am spike. His batching approach is right."
- **Status:** ✅ LOCKED — Technically mandatory

### 4. Shareable Badge Cards (Auto-Generated OG Images)
- **Proposed by:** Elon Musk (Round 1) — "Only viral growth mechanism"
- **Challenged by:** Steve Jobs (Round 2) — "Virality is exhaust, not engine"
- **Winner:** COMPROMISE — Both right
- **Resolution:**
  - Move shareable badges from "nice-to-have" to **MUST-HAVE** (Elon wins on priority)
  - But acknowledge: viral mechanics ≠ growth strategy; product quality drives word-of-mouth (Steve wins on philosophy)
  - Implementation: Auto-generate OG image on badge unlock, one-tap share to Instagram/Facebook, pre-filled copy
- **Status:** ✅ LOCKED — Must-have feature

### 5. SMS Notifications (Day One vs. Post-Email Validation)
- **Proposed by:** Steve Jobs (Round 2) — "SMS open rates 98% vs email 20%"
- **Challenged by:** Elon Musk (Round 1 & 2) — "Costs money, adds compliance risk, SMS is v2"
- **Winner:** **STEVE** (strong position, Elon deferred)
- **Rationale:** Steve's position: "Restaurant owners live in text messages. Email is a graveyard. If we're charging $49/month, we can afford 3¢ per SMS to a user 5x more likely to engage. This is the clearest ROI decision." Elon hasn't counter-argued hard enough to override.
- **Status:** ✅ LOCKED — SMS included in v1 (Email + SMS dual-channel)
- **Risk:** Cost & compliance (see Risk Register)

### 6. "All Quiet Today" Fallback Notifications
- **Proposed by:** Implicit in original PRD (nice-to-have)
- **Challenged by:** Elon (Round 1) — "Never ping users with non-information. That's spam."
- **Counter-challenged by:** Steve (Round 2) — "Reassurance ≠ spam. A friend who checks in vs. only texts when they need something."
- **Winner:** **STEVE**
- **Rationale:** Steve reframed as relationship maintenance, not noise. "When we go silent, they assume we're broken. The quiet notification is reassurance: 'I checked. Your business is steady. I'm still here.'"
- **Status:** ✅ LOCKED — Ship "All quiet" variant (copy TBD, must feel warm, not spammy)

### 7. "One Number Per Day" vs. Multi-Metric Dashboard
- **Proposed by:** Steve Jobs (Round 1) — "Maximum impact, minimum friction"
- **Challenged by:** Elon Musk (Round 2) — "Artificial scarcity. If someone has 3 insights, show them 3."
- **Winner:** **STEVE** (strategic moat)
- **Rationale:** Steve defended: "This is the entire moat. Every competitor gives dashboards. Nobody opens them. Pulse wins by doing *less*. If we add multi-metric dashboards, we become Toast Analytics with better copy." Elon didn't push back hard enough to override. This is a **differentiation decision**, not a UX preference.
- **Status:** ✅ LOCKED — One primary insight per notification. No dashboards in v1.

### 8. Customizable Notification Preferences
- **Proposed by:** Elon Musk (Round 2) — "Let users toggle notification types. Food trucks ≠ fine dining."
- **Challenged by:** Steve Jobs (Round 1) — "We decide what's important. No 47-toggle settings panel."
- **Winner:** **COMPROMISE** — Minimal, opinionated settings
- **Resolution:**
  - Allow basic toggles: Time of day, Email vs SMS, Frequency (daily vs weekly digest only)
  - NO per-metric toggles (no "turn off badge notifications but keep trends")
  - Elon's concern (segmentation) is valid; Steve's concern (decision fatigue) is also valid
  - Middle ground: Sensible defaults, 3-5 toggles max, not a "preference center"
- **Status:** ✅ LOCKED — Ship minimal settings screen

### 9. Upgrade Prompts (Inline vs. Modal, Aggressive vs. Respectful)
- **Proposed by:** Steve Jobs (Round 1 & 2) — "No aggressive upsell modals. Ever."
- **Challenged by:** Elon Musk (Round 2) — "Upgrade prompt is the entire economic engine. Your whisper strategy doesn't pay bills."
- **Winner:** **STEVE** (non-negotiable brand position)
- **Rationale:** Steve's final position: "This is a brand decision, not a product decision. I will burn this feature to the ground before I let us become another SaaS tool that manipulates users. We earn the upgrade by delivering value. Full stop."
- **Implementation:**
  - Inline contextual prompts only (e.g., "Want to see how you stack up? That's in the Pro kitchen.")
  - No popups, no countdown timers, no dark patterns
  - Elon conceded on tactics, still owns conversion optimization via *value demonstration*
- **Status:** ✅ LOCKED — Respectful inline prompts only

### 10. Brand Voice ("Sous Chef" vs. "Consultant")
- **Proposed by:** Steve Jobs (Round 1)
- **Challenged by:** Elon Musk (Round 2) — "Brand voice takes 3x longer to write. Ship fast > perfect copy."
- **Winner:** **STEVE** (but with velocity guardrails)
- **Resolution:**
  - Ship with Steve's warm, human voice: "People are noticing you. 340 visits this week."
  - BUT: Don't bottleneck on copywriting perfection. Use templates, A/B test in production.
  - Elon's concern (velocity) addressed by shipping "good enough" copy, iterating based on data
- **Status:** ✅ LOCKED — Warm brand voice, iterated post-launch

### 11. Competitive Benchmarks (v1 vs. v3)
- **Proposed by:** Original PRD (nice-to-have)
- **Challenged by:** Elon Musk (Round 1) — "You don't have cross-restaurant data yet. This is v3 pretending to be v2."
- **Agreed by:** Steve Jobs (Round 2) — "He's right. Let's ship the stuff we can do *now*."
- **Winner:** Unanimous CUT from v1
- **Status:** ✅ LOCKED — Deferred to v3

### 12. Badge Image Generation (Sync vs. Async)
- **Proposed by:** Elon Musk (Round 1) — "Generate asynchronously, store in S3/CDN, serve cached."
- **Agreed by:** Steve Jobs (Round 2) — "I was thinking about ceremony. He's thinking about latency. Both matter. His implementation is right."
- **Winner:** Elon (unanimous)
- **Status:** ✅ LOCKED — Async generation, CDN-served

---

## II. MVP FEATURE SET — What Ships in v1

### MUST-HAVE (Ships Day One)
1. **Daily Notifications (Email + SMS)**
   - Trigger: When meaningful insight exists (trend, milestone, engagement spike)
   - Content: One primary insight + context ("Up 40% from last week — your new lunch special is working")
   - Delivery: Email + SMS (user toggleable)
   - Fallback: "All quiet today" reassurance message (when no data)

2. **Five Milestone Badges**
   - Auto-unlock on achievement (e.g., "Local Favorite — 500 visits")
   - Auto-generate shareable OG image (async, cached in S3)
   - One-tap share to Instagram/Facebook with pre-filled copy
   - Confetti animation on unlock (Steve's dopamine hit)

3. **Weekly Journal Prompt**
   - Inline in weekly digest email
   - Simple text input: "What worked this week?"
   - Stored in `journal_entries` table (append-only)
   - Builds proprietary data moat over time

4. **Trend Narratives**
   - Add % deltas and sparklines to existing weekly digest
   - Use SQL window functions (LAG/LEAD) to compute week-over-week changes
   - Copy: Warm, human tone ("People are noticing you" vs. "Traffic +40%")

5. **Weekly Cliffhanger**
   - Append 2 sentences to digest template
   - Example: "Next week, I'm trying something new with your Instagram posts. Let's see what happens."
   - Pure Shonda Rhimes retention mechanic

6. **Three Inline Upgrade Prompts**
   - Contextual, value-first, respectful
   - Example: "Want to see how you stack up? That's in the Pro kitchen."
   - No modals, no timers, no dark patterns

7. **First-Run Experience**
   - Show *something* immediately (pre-computed demo data if needed)
   - No blank dashboards, no "Set up preferences" walls
   - 30-second dopamine hit or fail

### NICE-TO-HAVE (Post-v1, Data-Driven)
- Multi-channel preference center (beyond basic toggles)
- Additional badge tiers (beyond 5)
- Advanced journal features (tagging, search, export)
- Competitive benchmarks (requires cross-restaurant data)
- Push notifications (mobile app required)

### CUT FROM v1
- ❌ Competitive benchmarks (no data yet)
- ❌ Multi-metric dashboards (moat is simplicity)
- ❌ Gamification leaderboards (badges celebrate *you*, not comparison)
- ❌ Advanced notification customization (47 toggles = decision fatigue)

---

## III. FILE STRUCTURE — What Gets Built

### Database Schema (3 New Tables)
```sql
-- notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'insight', 'badge', 'journal_prompt', 'cliffhanger', 'quiet'
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  clicked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- journal_entries table
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL,
  week DATE NOT NULL, -- ISO week start date
  tags TEXT[], -- User-added tags (v2 feature)
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- achievements table
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  badge_type VARCHAR(50) NOT NULL, -- 'local_favorite', 'destination_dining', etc.
  unlocked_at TIMESTAMP DEFAULT NOW(),
  image_url TEXT, -- S3/CDN URL for shareable OG image
  shared BOOLEAN DEFAULT FALSE
);
```

### Code Structure (Estimated 900 Lines)
```
/pulse
  /notifications
    - generator.js          (200 lines) — Batch job, runs midnight UTC
    - sender.js             (100 lines) — Flushes notification queue
    - templates/
      - insight.js          (50 lines)  — Insight notification template
      - badge.js            (50 lines)  — Badge unlock template
      - quiet.js            (50 lines)  — "All quiet" template
      - cliffhanger.js      (50 lines)  — Weekly cliffhanger template

  /badges
    - checker.js            (150 lines) — Milestone detection logic
    - image-generator.js    (100 lines) — OG image generation (async)

  /journal
    - prompt.js             (50 lines)  — Weekly journal prompt logic
    - storage.js            (50 lines)  — Journal entry CRUD

  /ui-enhancements
    - trends.js             (150 lines) — Add % deltas, sparklines to digest
    - upgrade-prompts.js    (100 lines) — Inline contextual prompts

  /settings
    - preferences.js        (50 lines)  — Minimal settings screen (3-5 toggles)
```

**Total New Code:** ~900 lines (matches Elon's estimate)

### Integration Points
- **Existing weekly digest cron:** Hook into existing digest generation, add Pulse enhancements
- **Email service:** Use existing provider (SendGrid/Postmark), add SMS via Twilio
- **S3/CDN:** For badge image storage
- **Analytics:** Track notification clicks, badge shares, journal entries, upgrade conversions

---

## IV. OPEN QUESTIONS — What Still Needs Resolution

### 1. SMS Provider & Cost Model
- **Question:** Twilio vs. AWS SNS vs. other? What's the cost per notification at 10K users?
- **Decision needed by:** Pre-build (affects budget projections)
- **Owner:** Elon (growth/performance)
- **Impact:** If cost >$1K/month, may need to gate SMS behind Pro tier

### 2. Badge Milestone Thresholds
- **Question:** What are the 5 badge unlock criteria? (e.g., "500 visits," "1000 visits," "100 reservations")
- **Decision needed by:** Build sprint (affects badge checker logic)
- **Owner:** Steve (brand/emotional impact) + Elon (data-driven thresholds)
- **Impact:** Too easy = meaningless. Too hard = never unlocked.

### 3. "All Quiet" Notification Frequency Cap
- **Question:** If business is slow for 5 days straight, do we send "All quiet" 5x? Or cap at 2x/week?
- **Decision needed by:** Build sprint (affects notification generator logic)
- **Owner:** Steve (brand voice) + Elon (anti-spam)
- **Impact:** Over-communication risk vs. abandonment risk

### 4. Notification Timing (9am Local vs. User-Selected)
- **Question:** Default to 9am local time, or let users pick in settings?
- **Decision needed by:** Build sprint (affects `scheduled_for` logic)
- **Owner:** Steve (opinionated simplicity) vs. Elon (user control)
- **Recommendation:** Default to 9am, allow override in settings (compromise)

### 5. Badge Share Copy (Templates vs. User-Editable)
- **Question:** Pre-filled share text ("Just hit 1000 website visitors with @LocalGenius 🚀") — locked or editable?
- **Decision needed by:** Build sprint (affects share UI)
- **Owner:** Steve (brand control) vs. user autonomy
- **Recommendation:** Pre-filled with edit option (best of both)

### 6. Journal Entry Prompts (Rotation Logic)
- **Question:** Same prompt every week ("What worked this week?") or rotate through 10+ prompts?
- **Decision needed by:** Post-launch (not v1 blocker)
- **Owner:** Steve (engagement depth)
- **Impact:** Low. Ship simple, iterate based on response rates.

### 7. First-Run Demo Data (Synthetic vs. Empty State)
- **Question:** If new user has no data, show demo/placeholder insights or elegant empty state?
- **Decision needed by:** Build sprint (affects first-run UX)
- **Owner:** Steve (emotional first impression)
- **Recommendation:** Show 1-2 demo insights with disclaimer ("Here's what Pulse will look like")

---

## V. RISK REGISTER — What Could Go Wrong

### Technical Risks

#### RISK 1: SMS Compliance & Deliverability
- **Severity:** HIGH
- **Probability:** MEDIUM
- **Description:** TCPA compliance (opt-in requirements), carrier filtering (spam detection), international SMS costs
- **Mitigation:**
  - Explicit opt-in during onboarding
  - SMS only for users who enable it in settings
  - Start US-only, expand internationally post-validation
  - Monitor delivery rates, adjust copy to avoid spam triggers
- **Owner:** Elon (technical execution)

#### RISK 2: Notification Fatigue (Over-Communication)
- **Severity:** MEDIUM
- **Probability:** MEDIUM
- **Description:** Daily notifications + weekly digest + "all quiet" messages = user annoyance, unsubscribes
- **Mitigation:**
  - Track unsubscribe rates, click-through rates in first 2 weeks
  - A/B test notification frequency (daily vs. 3x/week)
  - Hard cap: Max 1 notification per day (including "all quiet")
- **Owner:** Steve (brand trust) + Elon (data-driven optimization)

#### RISK 3: Badge Image Generation Latency
- **Severity:** LOW
- **Probability:** LOW
- **Description:** If async job fails or lags, user unlocks badge but can't share immediately
- **Mitigation:**
  - Generate images at midnight (proactive, not reactive)
  - Fallback: Generic shareable card if custom image not ready
  - Monitor job queue, alert on >1min generation time
- **Owner:** Elon (performance)

#### RISK 4: Midnight Batch Job Failure
- **Severity:** HIGH
- **Probability:** LOW
- **Description:** If notification generator cron fails, 10K users get no notifications that day
- **Mitigation:**
  - Dead man's switch: Alert if job doesn't complete by 1am UTC
  - Graceful degradation: Generate on-demand if batch job missed
  - Redundancy: Run job twice (12am + 2am), deduplicate notifications
- **Owner:** Elon (reliability)

### Product/Market Risks

#### RISK 5: "One Number Per Day" Feels Limiting to Power Users
- **Severity:** MEDIUM
- **Probability:** MEDIUM
- **Description:** Advanced users want more data, frustrated by artificial scarcity, churn to competitors with dashboards
- **Mitigation:**
  - Position Pulse as *complementary* to analytics tools, not replacement
  - Pro tier could unlock "Deep Dive" view (secondary screen, not daily notification)
  - Monitor feedback: If >20% request "more data," revisit decision
- **Owner:** Steve (product vision) + Elon (data-driven pivot)

#### RISK 6: Badges Don't Drive Sharing (Viral Hypothesis Fails)
- **Severity:** MEDIUM
- **Probability:** MEDIUM
- **Description:** Users unlock badges but don't share to Instagram/Facebook. Organic growth stalls.
- **Mitigation:**
  - Track share rate (target: >10% of badge unlocks)
  - If <5% in first month, investigate: Is share UX broken? Are badges unimpressive? Is copy bad?
  - Pivot: If badges don't drive virality, double down on word-of-mouth (referral program, case studies)
- **Owner:** Elon (growth mechanics) + Steve (emotional resonance)

#### RISK 7: Journal Feature Ignored (Low Engagement)
- **Severity:** LOW
- **Probability:** MEDIUM
- **Description:** Users skip journal prompt, don't see value in reflection exercise
- **Mitigation:**
  - Not a v1 blocker (low build cost)
  - Track completion rates: If <10%, demote to optional feature
  - If >30%, invest in v2 enhancements (tagging, insights from entries)
- **Owner:** Steve (engagement depth)

### Business/Strategic Risks

#### RISK 8: SMS Costs Blow Up Budget
- **Severity:** MEDIUM
- **Probability:** LOW
- **Description:** 10K users × 30 SMS/month × $0.03 = $9K/month (unexpected cost)
- **Mitigation:**
  - Gate SMS behind Pro tier ($49/month) — economics justify cost
  - Cap free tier at email-only or 5 SMS/month
  - Monitor cost in real-time, pause if >$5K/month threshold
- **Owner:** Elon (unit economics)

#### RISK 9: Brand Voice Inconsistency (Copy Quality Slips)
- **Severity:** LOW
- **Probability:** MEDIUM
- **Description:** Edge cases (e.g., negative trends, zero data) produce robotic or tone-deaf copy
- **Mitigation:**
  - Copywriting templates for all scenarios (positive, negative, neutral, quiet)
  - Steve reviews all templates pre-launch
  - Post-launch: User feedback loop, iterate bad copy within 48 hours
- **Owner:** Steve (brand integrity)

#### RISK 10: Inline Upgrade Prompts Under-Perform (Low Conversion)
- **Severity:** MEDIUM
- **Probability:** MEDIUM
- **Description:** Respectful inline prompts don't convert; competitors using dark patterns steal market share
- **Mitigation:**
  - Track conversion rates: If <2%, test more prominent (but still respectful) CTAs
  - A/B test copy, placement, frequency
  - Elon's position: "If we prove value, conversion follows." Test hypothesis rigorously.
- **Owner:** Elon (growth) + Steve (brand constraints)

---

## VI. SUCCESS CRITERIA — How We Know v1 Worked

### North Star Metrics (30 Days Post-Launch)
1. **Notification Open Rate:** >40% (email) / >70% (SMS)
2. **First-Run Retention:** >60% of users open Pulse 3+ times in first week
3. **Badge Share Rate:** >10% of badge unlocks result in social share
4. **Pro Upgrade Rate:** >5% of free users upgrade within 30 days
5. **Unsubscribe Rate:** <5% (validates non-annoying communication)

### Qualitative Signals
- User testimonials mentioning "feel," "connection," "reassurance" (Steve's companionship hypothesis)
- Restaurant owner word-of-mouth referrals (growth without paid ads)
- Low support tickets re: confusion or frustration (simplicity validation)

### Failure Conditions (Triggers for Pivot)
- <20% notification open rate (we're spam)
- >10% unsubscribe rate (we're annoying)
- <2% upgrade conversion (economics don't work)
- <5% badge share rate (viral hypothesis failed)

---

## VII. SHIP DATE & ACCOUNTABILITY

### Timeline
- **Build Sprint:** 2 weeks (per Elon's estimate: 900 lines, reasonable codebase)
- **QA/Polish:** 3 days (Steve's non-negotiable: smooth first-run UX)
- **Launch:** Week 3

### Accountability
- **Elon:** Architecture, performance, scalability, growth mechanics
- **Steve:** Brand voice, UX, emotional resonance, quality bar
- **Phil (Zen Master):** Conflict resolution, timeline management, synthesis

### Definition of Done
- All 7 must-have features shipped
- SMS + Email working in production
- Notification open rate >30% in alpha test (100 users)
- Steve approves brand voice in all templates
- Elon approves sub-200ms notification generation time
- Zero P0 bugs in first-run experience

---

## VIII. FINAL WORD (Synthesis)

**From Steve:** "Simple systems. Human experiences. That's the synthesis. Let's build Elon's 3-table architecture. Let's ship fast. But let's do it with the brand voice, the emotional intelligence, and the respect for the user that makes them *want* to open Pulse every morning."

**From Elon:** "I'll give you the poetry *if you give me the architecture*. Call it Pulse. Make the copy warm. Animate the badge unlock. But: 3 database tables, not a microservices platform. Pre-computed batch jobs, not real-time event streams. Shareable badges as must-have, not buried in nice-to-have. Ship in 2 weeks, iterate based on data, not taste."

**From Phil:** Both are right. Ship Elon's engine with Steve's soul. Fast *and* beautiful. Data *and* emotion. This blueprint is locked. Build begins now.

---

**Document Status:** LOCKED — Ready for Build Phase
**Last Updated:** Post-Round 2 Synthesis
**Next Milestone:** Ship v1 in 2 weeks
