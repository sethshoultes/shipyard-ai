# Shonda's Retention Roadmap: What Keeps Users Coming Back

**Project:** LocalGenius Engagement System (Pulse)
**Author:** Shonda Rhimes (Narrative Design & Retention)
**Date:** 2026-04-18
**Version:** 1.1 Roadmap

---

## The Core Problem: Week 2-3 Narrative Void

Current design creates **retention moments** (weekly cliffhanger, badge unlocks), not **retention architecture**.

**What happens today:**
- Day 1: Notification arrives (if traffic spikes >10%)
- Day 7: Weekly digest with cliffhanger (strong hook)
- Days 8-13: Crickets (unless another >10% spike occurs)
- Week 2: Badge progression visible *if* user checks gallery (passive, not push)
- Week 4: "Consistent" badge unlocks (one-time dopamine hit, doesn't recur)

**The void:** Restaurant owners have steady growth, not viral curves. Steady = no daily "insights" = no notifications = user forgets product exists.

**The fix:** Turn Pulse from episodic alerts into a serialized narrative users follow every day.

---

## Retention Architecture Principles

### 1. **Daily Narrative Beats (Even Without Spikes)**

Users come back when they expect something new, not when something unusual happens.

**Bad:** "Only notify if >10% metric change"
**Good:** "Daily touchpoint, even if it's 'I'm still watching'"

**Examples:**
- "I'm still tracking your lunch rush — 3 days in, pattern holding."
- "2 more visits until you hit 500 this week."
- "Your average this week: 68 visits/day, up from 61 last week — slow and steady."

**Implementation (v1.1):**
- **Daily check-in** (8 AM local time):
  - If spike exists (>10% change) → insight notification
  - If milestone proximity (<5% away) → progress notification
  - If neither → reassurance notification (max 2x/week to avoid fatigue)
- **Copy bank:** 20 reassurance templates ("I'm watching," "Slow and steady," "Quiet day, but I'm here")
- **Tone:** Companion, not vendor. "We're in this together" vs. "Here's your report"

---

### 2. **Multi-Week Story Threads**

Current system: Each week stands alone. No throughline, no rising action.

**Bad:** Week 1 digest, Week 2 digest, Week 3 digest (disconnected)
**Good:** Week 1 setup → Week 2 development → Week 3 payoff

**Example missing arc:**
- **Week 1:** "Your lunch traffic is up. I'm going to track this."
- **Week 2:** "Lunch pattern holding. Might be a trend."
- **Week 3:** "Confirmed: lunch is your strongest segment. Here's what I learned."
- **Week 4:** Milestone badge: "Lunch Rush Champion" with stats from 4-week observation

**Implementation (v1.1):**
- **Thread tracker:** Database table storing active narrative threads
  - `thread_id`, `user_id`, `theme` (lunch_trend, competitor_watch, seasonal_pattern)
  - `week_started`, `weeks_active`, `status` (observing, confirming, revealed)
- **Cliffhanger evolution:** Week 1 cliffhanger → Week 2 callback → Week 3 reveal
- **Badge payoffs:** Unlock badges tied to multi-week threads, not arbitrary thresholds
  - "Lunch Champion" badge unlocks after 4-week tracking thread completes
  - Badge description references the journey: "I watched your lunch traffic for a month. You crushed it."

---

### 3. **Callback Structure (Badges Reference Each Other)**

Current badges: Disconnected achievements.

**Bad:** Badge #5 says "You hit 1,000 visits!" (isolated fact)
**Good:** Badge #5 says "Remember when you unlocked 'Getting Started'? Look at you now. 1,000 visits."

**Implementation (v1.1):**
- **Badge unlock copy** includes callback to previous badges:
  - "Getting Started" (Week 1) → "Consistent" (Week 4): "You stuck with it. Four weeks ago, you were just getting started."
  - "Consistent" (Week 4) → "Momentum Builder" (Week 12): "Remember hitting 'Consistent'? That was 8 weeks ago. You didn't stop."
- **Gallery view** shows progression timeline with narrative annotations:
  - Unlock date + mini-story: "March 15: You hit 500 visits. March 22: New menu launched. April 5: 1,000 visits. The menu worked."

---

### 4. **Journal as Personalization Engine (Not Just Data Collection)**

Current journal: User writes, data sits unused except for single cliffhanger template.

**Bad:** Journal = append-only table with no feedback loop
**Good:** Journal teaches AI how to talk to this specific user

**Implementation (v1.1):**
- **Prompt evolution:** Don't ask "What worked this week?" for 52 weeks straight
  - Week 1: "What worked this week?"
  - Week 5: "Last month you mentioned the new menu. Still seeing impact?"
  - Week 12: "You've been talking about Instagram a lot. Should I track that separately?"
- **Tone adaptation:** AI learns user's writing style
  - User writes 3-sentence entries → AI uses short, punchy notifications
  - User writes 2-paragraph reflections → AI uses longer narrative copy
  - User mentions family/personal context → AI incorporates warmth: "Hope the kids' spring break didn't hurt traffic too much"
- **Semantic search:** User can ask "Show me all weeks when weather impacted traffic"
  - Requires: Journal entry embeddings (OpenAI Ada or similar)
  - UI: Search bar in journal tab
  - Output: Relevant past entries + performance data from those weeks

---

### 5. **Seasonal Arcs (Annual Narrative Structure)**

Restaurant businesses have seasons. Pulse should reflect that.

**Missing today:** No month-end recap, no quarter milestones, no annual anniversary.

**Implementation (v1.1):**
- **Month-end recap** (last Sunday of month):
  - "March in review: 12,500 visits, up 18% from February. Best week was March 15."
  - Includes journal callbacks: "You wrote about the new menu 3 times. Looks like it paid off."
- **Quarter milestones** (Q1, Q2, Q3, Q4 end):
  - "Q1 done: 35,000 visits across Jan-Mar. Your strongest month was March."
  - Sets up next quarter: "I'm watching April closely — typically restaurants see 15% dip post-tax season. You might beat that."
- **Annual anniversary** (365 days after signup):
  - "One year ago, you hit 'Getting Started.' Today: 150K visits, 12 badges, 40 journal entries."
  - Unlock special badge: "365" with full-year recap narrative
  - Optional: Generate shareable year-in-review graphic (like Spotify Wrapped)

**Why this works:** Users renew subscriptions when they see progress over time. Annual recap is renewal ammunition.

---

## v1.1 Feature Additions (What Keeps Users Coming Back)

### **Feature 1: Daily Check-In Notifications**

**What it does:**
- Every morning (8 AM local time), Pulse sends a brief touchpoint
- Even if no spikes, user gets reassurance or progress update
- Prevents "I forgot this product exists" churn

**Copy examples:**
- Spike day: "Whoa — 85 visits yesterday, up 22% from your Monday average. Something working?"
- Progress day: "You're at 340 visits this week. 160 to go to beat your record. 3 days left."
- Quiet day: "Steady Tuesday — 62 visits, right on your average. I'm still watching."

**Implementation:**
- Cron job: Daily at 8 AM per user timezone
- Logic tree:
  1. Check for >10% spike → Insight notification
  2. Check for milestone proximity (<5% away) → Progress notification
  3. Check quiet day counter (<2 this week) → Reassurance notification
  4. Else → Skip (don't spam)
- Copy bank: 30 templates (10 spike, 10 progress, 10 reassurance)

**Cost:** ~$0.01/user/day (SMS) or $0.001/user/day (email) = $3-30/month per 100 users

**Retention impact:** Target +12% Week 2-4 retention (users don't forget product exists)

---

### **Feature 2: Multi-Week Story Threads**

**What it does:**
- AI identifies patterns (lunch surge, competitor activity, seasonal dip) and tracks them across weeks
- Weekly digest includes "continued story" callback + next chapter tease
- Badge unlocks tied to story completion (not arbitrary thresholds)

**Example thread:**
- **Week 1 cliffhanger:** "Your lunch traffic spiked Tuesday-Thursday. I'm tracking whether this is a fluke or a pattern."
- **Week 2 callback:** "Lunch pattern held this week — 40% higher traffic between 11 AM-1 PM. Digging into what's driving it."
- **Week 3 reveal:** "Confirmed: You're a lunch destination now. Traffic up 35% in that window since 3 weeks ago. Journal mentioned new lunch special Feb 28 — looks like it worked."
- **Week 4 badge:** "Lunch Rush Champion" unlocks with full story recap

**Implementation:**
- Database: `narrative_threads` table
  - Columns: `thread_id`, `user_id`, `theme`, `week_started`, `status`, `data_points` (JSON of metrics tracked)
- AI detection: Weekly cron identifies patterns (3+ days of similar behavior)
- Cliffhanger generator: References active thread, advances story each week
- Badge system: Checks for thread completion (status = "revealed") before unlock

**Cost:** ~$15K development (thread detection logic, cliffhanger evolution system, badge integration)

**Retention impact:** Target +18% Week 4-8 retention (users follow story to resolution)

---

### **Feature 3: Badge Callback System**

**What it does:**
- New badges reference previous badges in unlock copy
- Gallery view shows progression timeline with narrative annotations
- Users see journey, not isolated achievements

**Example unlocks:**
- **"Getting Started"** (Week 1): "Your first week! You're already ahead of most restaurants."
- **"Consistent"** (Week 4): "Four weeks. You stuck with it. Remember 'Getting Started'? Look at you now."
- **"Momentum Builder"** (Week 12): "12 weeks since 'Getting Started.' 8 weeks since 'Consistent.' You didn't stop. This is how growth happens."
- **"Unstoppable"** (Week 26): "Half a year ago, you unlocked 'Getting Started.' Today: 26 weeks of data, 75,000 visits, 8 badges. You're unstoppable."

**Implementation:**
- Badge definition table: Add `previous_badge_reference` field
- Unlock notification: Template includes callback to `previous_badge_reference` if exists
- Gallery UI: Timeline view with unlock dates + mini-stories linking badges

**Cost:** ~$8K development (badge copy rewrite, gallery UI, timeline component)

**Retention impact:** Target +10% long-term retention (users want to complete collection, callbacks create sentimental value)

---

### **Feature 4: Evolving Journal Prompts**

**What it does:**
- Journal prompts adapt based on user's previous answers
- AI notices topics user writes about and follows up
- User feels heard, not surveyed

**Example evolution:**
- **Week 1:** "What worked this week?"
- **Week 2:** User mentions "new Instagram post got traction"
- **Week 3 prompt:** "Last week you mentioned Instagram. Still seeing results from that?"
- **Week 6:** User mentions Instagram 3+ times
- **Week 7 prompt:** "You've been talking about Instagram a lot. Want me to start tracking that separately as a metric?"

**Implementation:**
- Journal entry analysis: Extract key topics (regex or lightweight NLP)
- Prompt database: Templates with variables like `{user_mentioned_topic}`
- Prompt selector: Checks past 4 entries for repeated topics, generates custom prompt
- Fallback: If no topics detected, use default prompt bank

**Cost:** ~$10K development (topic extraction, prompt customization, fallback logic)

**Retention impact:** Target +15% journal completion rate (40% → 55%), which strengthens moat

---

### **Feature 5: Milestone Proximity Notifications**

**What it does:**
- When user is <5% away from badge threshold, send progress notification
- Creates urgency and anticipation
- Turns passive badges into active goals

**Examples:**
- "You're at 485 visits this week. 15 more to hit 500 and unlock 'Busy Week' badge."
- "3 more days and you'll hit your 4-week streak. 'Consistent' badge waiting for you."
- "You've managed 48 reviews this month. 2 more for the 'Responsive' badge."

**Implementation:**
- Daily cron: Check user metrics against badge thresholds
- If within 5%, send notification (max 1 per day to avoid spam)
- Copy bank: 15 templates for various badge types (visit count, streak, review response)

**Cost:** ~$5K development (proximity detection, notification triggers)

**Retention impact:** Target +20% badge unlock rate (users actively pursue close thresholds)

---

### **Feature 6: Seasonal Recap Narratives**

**What it does:**
- Month-end, quarter-end, and annual anniversary recaps
- Turns Pulse from weekly tool to life-of-business chronicler
- Creates subscription renewal justification ("I've been tracking you for a year!")

**Examples:**
- **Month-end (March 31):** "March in review: 12,500 visits, up 18% from February. Best week was March 15 (you launched the lunch special). Slowest week was March 8 (spring break lull). April forecast: 13,200 visits if trend holds."
- **Quarter-end (Q1):** "Q1 done: 35,000 visits across Jan-Mar. Strongest month: March. You unlocked 4 badges this quarter. Journal entries mentioned 'Instagram' 8 times — that focus paid off."
- **Annual (365 days):** "One year with Pulse. 150K visits tracked. 52 journal entries. 12 badges unlocked. Best week ever: June 12 (1,850 visits). You're not the same restaurant you were a year ago."

**Implementation:**
- Scheduled notifications:
  - Month-end: Last Sunday of month (9 AM)
  - Quarter-end: Q1/Q2/Q3/Q4 last day (9 AM)
  - Annual: 365 days after user signup (9 AM)
- Data aggregation: Pull metrics for time period, generate narrative summary
- Optional: Shareable graphic (Figma template → dynamic image generation)

**Cost:** ~$12K development (recap generator, data aggregation, image generation optional)

**Retention impact:** Target +25% annual renewal rate (users see cumulative value, not weekly noise)

---

### **Feature 7: Semantic Journal Search**

**What it does:**
- User can search journal entries by topic, not just date
- Example: "Show me all weeks when weather impacted traffic"
- Surfaces patterns user might not remember

**Implementation:**
- Embeddings: Generate OpenAI Ada embeddings for each journal entry on save
- Search UI: Input box in journal tab
- Query: Convert user search to embedding, find similar entries (cosine similarity)
- Results: Show matching entries + performance data from those weeks

**Cost:** ~$8K development + $0.0001 per entry (embeddings API cost)

**Retention impact:** Target +10% journal completion rate (users see value in searching past entries)

---

### **Feature 8: "I'm Watching" Reassurance (Empty State Fix)**

**What it does:**
- When no spikes occur for 3+ days, send reassurance notification
- Prevents "is this thing broken?" anxiety
- Reinforces Pulse as active companion, not silent tool

**Examples:**
- "Steady week so far — 62, 58, 61 visits Mon-Wed. No spikes, but I'm still watching."
- "Quiet Friday (47 visits), but your weekly average is holding at 65/day. All good."
- "Traffic dipped 8% yesterday, but that's normal for Sundays in your area. I'm tracking it."

**Implementation:**
- Quiet day counter: Track days since last >10% spike
- Trigger: If counter ≥3 and reassurance_sent_this_week <2 → send notification
- Copy bank: 10 reassurance templates emphasizing "I'm here, just no drama today"

**Cost:** ~$3K development (counter logic, notification trigger)

**Retention impact:** Target +8% Week 2-3 retention (users don't assume product is broken)

---

## v1.1 Roadmap Summary

| Feature | Retention Impact | Development Cost | Ongoing Cost (per 1K users) |
|---------|------------------|------------------|----------------------------|
| Daily Check-In Notifications | +12% Week 2-4 | $8K | $30-300/month (SMS vs email) |
| Multi-Week Story Threads | +18% Week 4-8 | $15K | Negligible |
| Badge Callback System | +10% long-term | $8K | Negligible |
| Evolving Journal Prompts | +15% journal completion | $10K | Negligible |
| Milestone Proximity Notifications | +20% badge unlock rate | $5K | Included in daily check-in costs |
| Seasonal Recap Narratives | +25% annual renewal | $12K | Negligible |
| Semantic Journal Search | +10% journal completion | $8K | $10/month (embeddings API) |
| "I'm Watching" Reassurance | +8% Week 2-3 | $3K | Included in daily check-in costs |

**Total v1.1 development cost:** ~$69K
**Total ongoing cost (1K users):** $40-310/month (mostly SMS)

**Projected retention lift:**
- Week 1: Baseline 100%
- Week 2-3: +20% (from +12% daily check-in + 8% reassurance)
- Week 4-8: +18% (from multi-week threads)
- Month 3-6: +15% (from badge callbacks + journal engagement)
- Annual: +25% (from seasonal recaps)

**Compounded retention impact:** If baseline churn is 40% annually, reducing it to 25% increases LTV by 24%.

---

## What Makes Pulse Different (Post-v1.1)

### **Before v1.1: Episodic Notifications**
- User gets alert when something spikes
- Weekly digest with clever cliffhanger
- Badges unlock based on arbitrary thresholds
- Journal sits unused except for single template

**Problem:** Users engage with moments, not the product. Retention = sporadic.

---

### **After v1.1: Serialized Narrative**
- User gets daily touchpoint (spike, progress, or reassurance)
- Weekly digest advances multi-week story thread
- Badges unlock with callbacks to previous achievements ("Remember when...")
- Journal prompts evolve based on what user writes about
- Quarterly and annual recaps show life-of-business journey

**Result:** Users follow the story. Pulse becomes business companion, not notification vendor.

---

## Analogies to Explain This to Non-Narrative People

### **Current Pulse (v1.0):**
- Like getting a weather alert when it rains
- Useful in the moment, forgotten tomorrow
- No reason to check the app daily

### **Pulse v1.1:**
- Like a fitness coach who texts you every morning ("60 steps to your goal"), references your past wins ("Remember last month's PR?"), and sends you quarterly progress photos
- You check it daily because the story is ongoing
- Canceling feels like abandoning a relationship, not unsubscribing from alerts

---

## Open Questions for Team

1. **Daily notification frequency:** Will users tolerate 7 notifications/week (daily check-in + weekly digest)?
   - **Mitigation:** Let users set cadence (daily vs 3x/week vs digest-only)
   - **A/B test:** Daily vs 3x/week vs control (weekly only)

2. **Journal prompt evolution:** How sophisticated should topic extraction be?
   - **Option A:** Simple regex (fast, 80% accuracy)
   - **Option B:** Lightweight NLP (Claude API, slower but better)
   - **Recommendation:** Start with regex, upgrade if journal completion >50%

3. **Badge callback copy:** Should all badges reference previous badges, or just major milestones?
   - **Recommendation:** Callback every 3rd badge to avoid repetitiveness

4. **Seasonal recap shareability:** Should we generate Spotify-Wrapped-style graphics?
   - **Pros:** Virality potential, emotional payoff
   - **Cons:** $15K additional development, requires design system
   - **Recommendation:** Ship text-based recaps first, add graphics if users request

5. **Thread detection:** Should AI auto-detect patterns, or should users manually flag "things to track"?
   - **Recommendation:** Auto-detect to start, add manual flagging in v1.2

---

## Metrics to Track (Post-Launch)

### **Retention Metrics:**
- Week 2 retention (current baseline: 75%, target: 87%)
- Week 4 retention (current baseline: 60%, target: 78%)
- Week 8 retention (current baseline: 50%, target: 68%)
- Annual retention (current baseline: 60%, target: 85%)

### **Engagement Metrics:**
- Daily notification open rate (target: 40%+)
- Weekly digest open rate (target: 60%+)
- Journal completion rate (target: 55%, up from 40% baseline)
- Badge unlock rate (% of users who earn >3 badges in first 90 days, target: 70%)

### **Narrative Metrics (New):**
- Multi-week thread completion rate (% of threads that reach "reveal" stage, target: 60%)
- Badge callback engagement (click rate on "view previous badges" link, target: 25%)
- Seasonal recap open rate (target: 75%+)
- Journal search usage (% of users who search at least once, target: 15%)

### **Economic Metrics:**
- Base → Pro conversion lift from proximity notifications (target: +2% over control)
- LTV increase from retention lift (target: +20%)
- CAC payback period reduction (target: 25 months → 18 months)

---

## Final Thought: Series vs. Episodes

Most SaaS products send episodes: "Here's your weekly report. Here's your monthly summary."

Users watch episodes when convenient. They cancel when inconvenient.

Great products create series: ongoing stories users follow, anticipate, and miss when they're gone.

**Pulse v1.1 turns engagement from episodic to serialized.**

---

**Shonda Rhimes**
"You don't get renewed for one good episode. You get renewed because people can't stop watching."
