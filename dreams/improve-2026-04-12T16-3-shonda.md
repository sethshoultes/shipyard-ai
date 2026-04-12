# Shonda Rhimes — IMPROVE Cycle Review
**Date:** 2026-04-12 | **Focus:** Retention Hooks & What Brings People Back

---

## Executive Assessment

*"I've built shows that kept millions coming back every Thursday night for years. Grey's Anatomy, Scandal, How to Get Away with Murder — all different genres, but they share one thing: they give you a reason to return. Looking at this portfolio, I see products people use once and forget. There's no cliffhanger. No 'what happens next.' No addiction loop. We're writing pilots with no series order."*

---

## Product-by-Product Retention Analysis

### LocalGenius — AI Marketing for Local Businesses
**Retention Score:** 5/10

**What Brings Users Back Now:**
- Business data changes (new reviews, metrics)
- Need to post to social media
- Weekly digest emails (if implemented)

**What's Missing:**

**1. The Daily Hook**
Users check LocalGenius when they *remember* to check it. There's no habitual trigger. No "I need to check this every morning" routine.

*"The most powerful retention mechanic is routine. Make checking LocalGenius as automatic as checking email."*

**Fix: The Morning Briefing**
This was proposed two cycles ago. Has it shipped? If not, this is the single most important retention feature.

Every morning at 8am:
- "Good morning, Maria! Here's what's happening at Bella's Bistro..."
- New reviews since yesterday (with AI-drafted responses)
- Social post suggestion for today
- One metric that improved/declined
- One task for today

**2. The Progress Story**
Users don't see their journey. There's no "You were here 30 days ago, now you're here" narrative. Without visible progress, users don't feel the product is working.

*"Every character needs an arc. Your users are the main characters. Show them their transformation."*

**Fix: Monthly Progress Report**
- 30-day comparison: ratings, reviews, response rate
- "You've responded to 47 reviews this month. That's 12 more than last month."
- Trend visualization showing improvement
- One "hero moment": "Your 5-star review from Sarah was your best-performing review this month"

**3. The Competitive Tension**
The benchmark engine PRD failed, but the core insight was right: business owners are competitive. They want to know how they stack up. Without rankings, there's no urgency.

*"Every great story needs stakes. What does your user lose if they stop using the product? Right now, nothing."*

**Fix: Simple Competitive Context (No Complex Infrastructure)**
- "You responded to reviews 40% faster than average this week"
- "Your review count is growing faster than 70% of restaurants in Austin"
- Weekly email with one competitive stat (calculated server-side, no complex pipeline)

---

### Shipyard AI — Autonomous Site Builder
**Retention Score:** 2/10

**What Brings Users Back Now:**
- They need a new project (rare)
- Site has an issue (reactive)

**What's Missing:**

**1. The Post-Launch Relationship**
Project ships. Customer disappears. This is a one-night stand, not a relationship. There's no Act 2.

*"The pilot is exciting. But the show lives or dies in Season 2. What's Shipyard's Season 2?"*

**Fix: The Site Story**
After launch, don't disappear. Send monthly "Site Story" emails:
- Traffic highlights
- Performance metrics
- Content freshness check
- "Your site had its best week ever" celebrations
- Subtle upsell: "Want us to add a blog section?"

**2. The Anticipation Hook**
During the project, the client waits. They check email hoping for updates. After delivery, that anticipation disappears.

*"Anticipation is the most powerful emotion in storytelling. You had it during the project. Why does it end at delivery?"*

**Fix: Quarterly Proposal**
Every 90 days, proactively send:
- "Based on trends in your industry, here's what's working for similar sites"
- "We recommend adding [feature]. Here's a quick mockup."
- "Want us to implement this? Reply to this email."

Not hard-sell. Just "Here's what you could do next."

**3. The Community**
Shipyard customers don't know each other. There's no "community of Shipyard sites." No showcase. No shared identity.

*"Fandoms are built on belonging. Your customers should feel like they're part of something."*

**Fix: The Shipyard Showcase**
- Public gallery of shipped sites (opt-in)
- "Built with Shipyard" badge option
- Occasional customer spotlights in email newsletter
- Creates social proof + community

---

### Dash (WP Command Palette)
**Retention Score:** 4/10

**What Brings Users Back Now:**
- They're using WordPress admin (habit formed elsewhere)
- Cmd+K becomes muscle memory

**What's Missing:**

**1. The "Look What You Did" Moment**
User presses Cmd+K 100 times a day. They have no idea they're saving time. It's invisible productivity.

*"Every hero needs a mirror to see their own growth. Show users their progress."*

**Fix: Weekly Time Saved Report**
- "This week, you used Dash 247 times"
- "Estimated time saved: 45 minutes"
- "Your most-used command: Posts > Add New"
- Celebrate milestones: "You've saved 10 hours with Dash!"

**2. No Reason to Upgrade**
If there's no Pro tier, there's no reason to come back to the plugin itself. Users install, forget, use unconsciously.

**Fix: Monthly "Power User Tips" Email**
- "Did you know? Type > to enter command mode"
- "This week's tip: Use @ to search users instantly"
- Keeps product top-of-mind even if no Pro tier

---

### Pinned (WP Sticky Notes)
**Retention Score:** 4/10

**What Brings Users Back Now:**
- Someone @mentions them
- They need to check notes (habit formed elsewhere)

**What's Missing:**

**1. The Thread Continuation**
Notes are one-off. There's no conversation. No "What happened next?" Someone posts a note, others acknowledge it, it archives. Dead end.

*"Every scene should lead to the next scene. Your notes end, period. They should end, comma."*

**Fix: Note Threads (v1.1)**
- Reply to notes
- Threads create ongoing conversations
- Unresolved threads surface in a "needs attention" section
- Creates reason to check back

**2. The Team Pulse**
Users don't see team activity patterns. Is the team communicating more or less? Are notes being acknowledged?

**Fix: Weekly Team Activity Summary**
- "Your team posted 12 notes this week (up from 8)"
- "Sarah acknowledged the most notes"
- "3 notes are waiting for acknowledgment"
- Creates social pressure + visibility

---

### Great Minds Plugin
**Retention Score:** N/A (Internal Tool)

Great Minds is infrastructure. Retention mechanics don't apply directly. But...

**One Insight:**
Each Great Minds project could generate a "Project Story" — a visual timeline of how the project progressed through agents. This becomes content for Shipyard marketing AND a retention artifact for clients.

---

## Cross-Product Retention Themes

### Theme 1: The Daily/Weekly Cadence
None of these products have a reliable "come back tomorrow" trigger. Morning Briefing (LocalGenius), Site Story (Shipyard), Time Saved (Dash) — these create habitual touchpoints.

### Theme 2: The Progress Narrative
Users don't see their journey. Show them: "30 days ago vs. today." "You were #15, now you're #8." "You've saved 10 hours."

### Theme 3: The Anticipation Builder
After signup/install, the relationship goes flat. Create moments users anticipate: weekly reports, quarterly proposals, monthly tips.

### Theme 4: The Social Layer
Products are solitary experiences. Add community elements: showcases, leaderboards (even private ones), team activity visibility.

---

## My Top 3 Retention Priorities

### 1. LocalGenius Morning Briefing
**Why It Matters:** Creates daily habit. Makes LocalGenius the first thing checked every morning.
**Implementation:**
- 8am push notification/email
- Today's reviews, today's task, one insight
- AI-drafted responses ready to approve
**Retention Impact:** DAU +40%, churn -25%

### 2. Shipyard Site Story (Monthly Email)
**Why It Matters:** Maintains relationship post-delivery. Creates upsell opportunities. Prevents "one and done."
**Implementation:**
- Monthly automated email per delivered project
- Traffic metrics, performance data, content freshness
- One recommendation for improvement
- "Reply to this email" CTA
**Retention Impact:** Return project rate +30%

### 3. Progress Dashboards Everywhere
**Why It Matters:** Shows users their transformation. Creates emotional investment in continuing.
**Implementation:**
- LocalGenius: 30-day metrics comparison
- Dash: Time saved calculator
- Pinned: Team activity summary
- All: "You've been using [product] for 3 months. Here's your journey."
**Retention Impact:** Cross-product churn -15%

---

## The Story We Should Be Telling

Every product should have three story beats:

**Act 1: Discovery** (First 5 minutes)
"Welcome! Here's what I can do for you. Let me show you something amazing right now."

**Act 2: Progress** (Ongoing use)
"Look how far you've come. Here's what improved this week. Here's what's next."

**Act 3: Anticipation** (What keeps them coming back)
"Tomorrow morning, I'll have something new for you. Next month, here's what we'll tackle together."

Right now, our products have weak Act 1s and nonexistent Act 2s and 3s. We're writing pilots. We need to write series.

---

## The Cliffhanger Test

Every product interaction should end with a cliffhanger:
- LocalGenius session ends: "Tomorrow at 8am, I'll show you your overnight reviews. See you then!"
- Shipyard delivery: "Your site is live. In 30 days, I'll tell you how it performed."
- Dash usage: "You've used Dash 100 times this week. Check your inbox Friday to see your time saved."
- Pinned note created: "I'll remind you about this note in 3 days if no one acknowledges it."

*"Never let the audience leave satisfied. Leave them wanting more."*

---

## Final Word

*"I don't believe in products that people 'should' use. I believe in products people 'need' to use — products they think about when they're not using them, products they look forward to checking, products that make them feel like they're part of an ongoing story. Right now, these products are forgettable. Let's make them addictive."*

— Shonda

---

*Review completed for IMPROVE Cycle 2026-04-12*
