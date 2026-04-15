# Shonda Rhimes: Retention Roadmap
**Product:** LocalGenius
**Date:** 2026-04-15
**Focus:** What Keeps Users Coming Back

---

## The Core Problem

**Backend is brilliant. Frontend is absent. Retention is impossible.**

You can't retain users who can't use the product.

---

## Retention Philosophy

People don't come back because of features. They come back because of:

1. **Progress visibility** — "I answered 127 questions this week"
2. **Social comparison** — "I'm #3 in my category"
3. **Incomplete loops** — "My ranking dropped—what do I need to fix?"
4. **Narrative continuity** — Weekly rhythms create episodic habits
5. **Emotional payoff** — Dopamine from wins, anxiety from competition

LocalGenius PRD has ALL of these mechanisms designed. NONE are built.

---

## The Ideal User Journey (3-Act Structure)

### **Act 1: The "Wow" Moment (First 5 Minutes)**

**Setup:**
- Business owner installs WordPress plugin
- Nervous: "Does this actually work?"

**Inciting Incident:**
- Plugin auto-generates 15 FAQs from scraped website content
- Chat widget instantly appears on their site
- Owner sees: "Your LocalGenius assistant is live"

**First Plot Point:**
- A real customer asks "Do you deliver?"
- AI answers in <2 seconds
- Owner gets notification: "Your first question was just answered"

**Emotional Hook:** Relief → Excitement → "This might actually help my business"

**Current Reality:** None of this exists. No widget. No FAQs. No notification system.

---

### **Act 2: The Productive Week (Days 2-7)**

**Rising Action:**
- 47 questions answered automatically
- Owner opens dashboard, sees bar chart climbing
- Top 5 questions appear: "Do you deliver?" asked 12 times

**Midpoint Revelation:**
- Owner realizes: "I should write a custom FAQ for this"
- Adds detailed delivery FAQ with zip codes and fees
- Chat widget immediately starts using it
- Customer satisfaction improves (AI gives precise answer now)

**Complications:**
- Dashboard shows "3 questions unanswered" (edge cases AI couldn't handle)
- Creates slight anxiety: "Am I missing opportunities?"

**Emotional Arc:** Productivity → Ownership → Mild concern about gaps

**Current Reality:** No dashboard. No analytics. No unanswered question queue. No way to see any of this.

---

### **Act 3: The Competitive Loop (Weekly Cadence)**

**Climax:**
- Weekly Digest email lands in inbox
- Subject: "You answered 127 questions this week 🎉"
- Opens email, sees:
  - "You're #3 Italian restaurant in Austin"
  - "Capri Ristorante (#1) has 8 more FAQs than you"
  - "Update your hours FAQ to improve ranking"

**Falling Action:**
- Owner clicks through to admin panel
- Updates hours FAQ with holiday schedule
- Adds new FAQ about gluten-free options
- Feels productive

**Resolution (Next Week):**
- Email arrives: "You moved to #2! 🚀"
- Dopamine hit
- Cycle repeats

**Emotional Hook:** Competitive anxiety → Action → Reward → Anticipation for next week

**Current Reality:** No Weekly Digest. No email templates. No Benchmark Engine. No ranking system. No FOMO. No retention loop.

---

## What Brings Users Back: The Retention Mechanisms

### **1. Daily Curiosity (Dashboard Analytics)**

**Psychological Hook:** Progress visibility + instant gratification

**What it needs to show:**
- "Questions answered today: 14"
- Real-time activity feed (last 10 questions)
- Top 3 questions this week
- Unanswered question count (red badge = urgency)

**Why it works:**
- Business owners check dashboard like social media
- Number goes up = dopamine
- Unanswered questions = incomplete loop (must resolve)

**Current State:** ❌ Not built

**v1.1 Priority:** 🔥 CRITICAL

---

### **2. Weekly Ritual (Digest Email)**

**Psychological Hook:** Episodic rhythm + social comparison

**Email Structure:**

**Subject Line Options:**
- "You answered 127 questions this week 🎉"
- "Your ranking improved to #2 in Austin 🚀"
- "You dropped to #5—here's how to recover"

**Body Content:**
1. **Hero Metric:** Questions answered this week (big number, bold)
2. **Competitive Ranking:** "You're #3/47 Italian restaurants in Austin"
3. **Progress Chart:** Bar graph showing weekly trend
4. **Top Questions:** "Do you deliver?" asked 23 times
5. **Actionable CTA:** "Add a delivery FAQ to improve your ranking"
6. **Social Proof:** "Top-ranked restaurants have 12+ FAQs on average"

**Why it works:**
- Weekly cadence creates habit (like Sunday night TV shows)
- Ranking triggers competitive anxiety
- CTA gives clear next action
- Opening the email = re-engagement

**Current State:** ❌ Not built

**v1.1 Priority:** 🔥 CRITICAL

---

### **3. Competitive Pressure (Benchmark Engine)**

**Psychological Hook:** Loss aversion + status anxiety

**How Benchmark Engine Creates Retention:**

**Scoring Formula (from PRD):**
- FAQ completeness (30%): 12+ FAQs = full points
- Response speed (25%): <2 sec = full points
- Customer engagement (25%): questions/day trend
- Content quality (20%): custom FAQs > auto-generated

**Visual Display:**
- Leaderboard: "Italian Restaurants in Austin"
  1. Capri Ristorante (94/100) ⭐️
  2. Vespaio (89/100) ⭐️
  3. **Your Restaurant (82/100)** ← You are here
  4. Asti Trattoria (78/100)

- **Gap Analysis:** "Add 3 more FAQs to reach #2"

**Why it works:**
- Humans are wired for status competition
- Being #3 feels incomplete (must reach #1)
- Specific action items remove ambiguity
- Weekly ranking changes create recurring drama

**Retention Trigger:**
- User checks ranking weekly (like checking lottery results)
- Rank improves → dopamine → come back next week to defend position
- Rank drops → anxiety → must fix immediately → logs in, updates FAQs

**Current State:** ❌ Designed but not built

**v1.1 Priority:** 🔥 CRITICAL (This is the monetization driver)

---

### **4. Incomplete Loops (Unanswered Questions)**

**Psychological Hook:** Zeigarnik Effect (unfinished tasks haunt us)

**How it works:**
- AI can't answer edge case question
- Logs to database as "unanswered"
- Dashboard shows red badge: "3 unanswered questions"
- Owner clicks, sees:
  - "Do you cater events for 200+ people?"
  - "Can I bring my service dog?"
  - "Do you have vegan options?"

**Why user can't ignore it:**
- Red badge = visual anxiety
- These are REAL customer questions (not hypothetical)
- Owner thinks: "I'm losing business by not answering these"

**Resolution path:**
- Owner writes custom FAQ for each
- Badge disappears
- Dopamine hit from completing task
- Customer asks same question next week → AI answers instantly → owner feels smart

**Current State:** ❌ Backend can log, but no UI to display

**v1.1 Priority:** 🔥 HIGH

---

### **5. Habit Stacking (WordPress Admin Integration)**

**Psychological Hook:** Proximity to existing behavior

**Strategy:**
- Business owners already check WordPress admin daily (to approve comments, check traffic, etc.)
- LocalGenius appears in their sidebar
- "LocalGenius: 14 questions today" (live counter)

**Why it works:**
- No need to form NEW habit
- Piggybacks on existing routine
- One-click access to dashboard
- Notifications pull them in

**Current State:** ❌ WordPress plugin empty

**v1.1 Priority:** 🔥 CRITICAL

---

### **6. Social Proof (Trending Questions Across Network)**

**Psychological Hook:** FOMO + learning from others

**v1.1 Feature Idea:**

**"Trending Questions This Week" (in admin dashboard)**
- Shows top questions asked across ALL LocalGenius customers in same category
- Example for Italian restaurants:
  1. "Do you have outdoor seating?" (asked 340 times this week)
  2. "Do you take reservations?" (asked 287 times)
  3. "Are you open on Sundays?" (asked 156 times)

**Why it works:**
- Owner realizes: "Oh, I should add these FAQs too"
- Network effect: every customer makes the product better for others
- Data-driven FAQ creation (not guessing)

**Current State:** ❌ Not designed in PRD, but aligns with Jensen's platform vision

**v1.1 Priority:** MEDIUM (ship after core retention loops work)

---

## v1.1 Feature Roadmap: What Keeps Users Coming Back

### **Sprint 1: Build What Was Promised (Week 1-2)**

**Goal:** Make retention mechanisms functional

1. **Weekly Digest Email System**
   - Email template (HTML + plain text)
   - Cron job (Cloudflare Workers scheduled job, runs Sunday 8am)
   - Metrics calculation: questions answered, ranking position, top questions
   - Unsubscribe flow (required by law)

2. **Benchmark Engine Rankings Display**
   - Scoring algorithm implementation (FAQ count, response speed, engagement)
   - Admin dashboard ranking widget
   - Leaderboard page (top 10 in category + user's position)
   - Gap analysis: "Add 3 FAQs to reach #2"

3. **Dashboard Analytics Overview**
   - Today's question count
   - This week's question count
   - Top 5 questions this week (bar chart)
   - Unanswered question queue (red badge)

**Success Metric:**
- Weekly Digest open rate > 40%
- Users check dashboard 3+ times per week

---

### **Sprint 2: Close Retention Loops (Week 3-4)**

4. **Unanswered Question Workflow**
   - Queue display in admin panel
   - "Create FAQ" button next to each question
   - One-click FAQ creation from unanswered question
   - Notification when question gets answered via new FAQ

5. **Ranking Change Notifications**
   - Email trigger when ranking moves up/down
   - Subject: "You moved to #2!" or "Your ranking dropped to #5"
   - Push notification option (future: browser push API)

6. **Progress Visualization**
   - Weekly trend chart (questions answered over time)
   - Month-over-month growth percentage
   - "You're answering 34% more questions than last month"

**Success Metric:**
- 60% of unanswered questions converted to FAQs within 7 days
- Ranking notifications drive 50%+ admin login rate

---

### **Sprint 3: Network Effects (Week 5-8)**

7. **Trending Questions Feature**
   - Cross-customer question aggregation
   - "Italian restaurants are being asked..." widget
   - One-click add from trending questions to your FAQ library

8. **FAQ Template Sharing**
   - "Top-performing FAQs in your category" suggestions
   - Owner can adopt/customize high-quality FAQs from network
   - Attribution: "Based on successful FAQs from 47 businesses"

9. **Competitive Intelligence**
   - "Businesses ranked above you have these FAQs you don't"
   - Specific gap identification
   - Closes the competitive loop

**Success Metric:**
- 30% of FAQs come from network suggestions
- Users who adopt trending FAQs have 20%+ higher engagement

---

### **Sprint 4: Monetization Retention (Week 9-12)**

10. **Free → Paid Conversion Triggers**
    - Free tier: Basic chat widget, 5 FAQs max
    - Paywall: "Unlock Benchmark Rankings" ($29/month)
    - Paywall: "Get Weekly Digest emails" ($29/month)
    - Paywall: "Add unlimited FAQs" ($29/month)

11. **Upgrade Prompts Based on Behavior**
    - After 50 questions answered: "You're a power user! Unlock rankings to see how you compare."
    - When user checks dashboard 5+ times: "Get weekly emails instead of logging in daily"
    - When FAQ limit reached: "Unlock unlimited FAQs for $29/month"

12. **Retention-Driven Pricing Tiers**
    - Free: Chat widget only
    - Growth ($29/month): Benchmark rankings, Weekly Digest, unlimited FAQs
    - Pro ($99/month): Multi-location support, API access, white-label widget

**Success Metric:**
- Free-to-paid conversion rate > 15%
- Paid users have 90%+ retention in month 2

---

## Retention Metrics Dashboard (Internal)

**What we measure:**

### **Engagement Metrics:**
- Daily active users (DAU) / Monthly active users (MAU)
- Dashboard logins per week (target: 3+)
- Weekly Digest open rate (target: 40%+)
- Weekly Digest click-through rate (target: 25%+)

### **Retention Cohorts:**
- Day 1 retention (user returns next day)
- Week 1 retention (user returns within 7 days)
- Month 1 retention (user still active after 30 days)
- Month 2 retention (churn prevention threshold)

### **Product Engagement:**
- % of users who check Benchmark rankings weekly
- % of users who resolve unanswered questions
- % of users who adopt trending FAQ suggestions
- Average FAQs created per user

### **Monetization Signals:**
- Time to first paid conversion
- Free-to-paid conversion rate by cohort
- Churn rate for paid users
- Revenue retention (MRR growth vs. churn)

---

## Why This Matters

**Current product = 0% retention because it doesn't exist.**

**v1.0 (if built):**
- Chat widget works
- FAQs get answered
- Business owner feels productive
- Retention: ~40% (guessing based on utility alone)

**v1.1 (with retention roadmap):**
- Weekly Digest creates ritual
- Benchmark Engine creates competition
- Unanswered questions create incomplete loops
- Dashboard creates habit
- Retention: ~75%+ (based on habit-forming product design)

---

## The Difference Between Product and Story

**Products solve problems.**
LocalGenius solves: "My customers have questions when I'm asleep."

**Stories create meaning.**
LocalGenius creates: "I'm #3 in Austin, and I'm going to reach #1."

Right now, we have neither.

**Ship the product first. Layer the story second.**

But don't forget: retention lives in the story, not the features.

---

## Final Word

Every retention mechanism in this roadmap **costs almost nothing to operate** once built:

- Weekly Digest: 1 cron job
- Benchmark rankings: 1 SQL query per user
- Trending questions: 1 aggregation query
- Dashboard analytics: real-time from existing DB

**High retention, low marginal cost = compounding business.**

But first: ship the frontend.

You can't retain users who don't exist.

---

**Next Steps:**
1. Build chat widget (Act 1: first "wow" moment)
2. Build admin dashboard (Act 2: productive week)
3. Build Weekly Digest (Act 3: competitive loop)
4. Ship v1.0 to 10 beta customers
5. Measure retention before building v1.1 features

**Timeline:** 4 weeks to v1.0, 8 weeks to v1.1

— Shonda Rhimes
April 15, 2026
