# Board Review: LocalGenius Benchmark Engine

**Reviewer:** Shonda Rhimes
**Role:** Board Member, Great Minds Agency
**Lens:** Narrative & Retention
**Date:** 2026-04-14

---

## Executive Summary

The Benchmark Engine has the bones of a great story. You've identified that small business owners are competitive creatures — they *want* to know where they stand. But right now, you've built the scoreboard without the season. The number is there. The drama isn't.

---

## Story Arc: Signup to "Aha Moment"

**Assessment: Incomplete**

The "aha moment" is clear: **"You're #8 of 47 Austin Mexican Restaurants."** That's a punch. That's a mirror held up to someone who's been wondering for years if they're doing okay. Good.

But the story *to* that moment is missing from these deliverables:

1. **No Setup** — Where's the hook during onboarding? The moment you ask Maria "Do you know how you compare to other Mexican restaurants in Austin?" and watch her realize she doesn't. That's Act One. You need her invested *before* you show the number.

2. **The Reveal is Flat** — The `RankWidget` shows the rank. But there's no narrative tension in the reveal. Consider: "Calculating your standing..." → "Scanning 47 Austin Mexican Restaurants..." → "You're #8." Make her *wait* for it. The reveal should feel like a curtain rising, not a page loading.

3. **The "Why" Comes After** — Good: the "Why this rank?" breakdown exists. But it's hidden behind a click. The story should show her the score *and* immediately tell her which lever to pull. Don't make her work for the insight.

**The arc should be:** Hook (you don't know where you stand) → Tension (let's find out) → Reveal (you're #8) → Stakes (here's what's keeping you from #7) → Action (here's what to do about it)

---

## Retention Hooks: What Brings Them Back?

**Assessment: One Strong Hook, Missing the Rest**

### Tomorrow
**The Weekly Email** — This is your strongest retention mechanic. The subject line `Your ranking this week: #8 (+2)` is solid episodic television. It's a weekly recap. People will open this.

But what happens *between* Mondays? Nothing. There's no:
- Push notification when you're close to ranking up ("1 review away from #7!")
- Alert when a competitor passes you ("You dropped to #9")
- Celebration when you move up mid-week

You've built a weekly show. You need daily micro-moments.

### Next Week
The weekly cadence works because of the **rank_change** mechanic. Seeing "+2" or "-1" creates anticipation: *what will it be next week?*

But you're missing:
- **Goal-setting** — Let Maria say "I want to be #5 by end of quarter." Now she has stakes.
- **Streaks** — "3 weeks of improvement!" Streaks create fear of loss.
- **Seasonal arcs** — Where's the "Summer Rankings" or "Holiday Rush Leaderboard"? Seasonality creates natural story beats.

### The Retention Gap
The codebase shows strong *data* infrastructure but weak *engagement* infrastructure. You sync daily (`daily-sync.ts`) but only communicate weekly. That's a 7:1 ratio of collection to connection. Flip it.

---

## Content Flywheel: Is There One?

**Assessment: Partially Built**

The flywheel exists in the data layer:
```
More businesses join → Better cohort density → More meaningful rankings → More value for everyone
```

But the *content* flywheel is missing:

1. **No Shareable Moments** — When Maria hits #5, can she share that? Where's the "I'm a Top 10 Austin Restaurant" badge for her website? Social proof drives acquisition. Acquisition feeds the cohort. The cohort improves the product.

2. **No User-Generated Stories** — "How I went from #23 to #5 in 6 months" — this content doesn't exist. But it should. These are the testimonials that convert new signups.

3. **No Community** — Rankings create natural cohorts. Why aren't #1-10 Austin Mexican Restaurants in a "Top 10" group where they can learn from each other? Community creates content. Content attracts users. Users improve rankings.

The data flywheel spins silently. The content flywheel needs to spin *loudly*.

---

## Emotional Cliffhangers: What Creates Curiosity?

**Assessment: One Good One, Two Missing**

### What Works: "2 reviews away from #7"
The insight in the `RankWidget` is good — it creates immediate tension. Maria knows exactly what's between her and the next rung. That's a cliffhanger.

### What's Missing:

**1. The Rival**
Rankings are competitive, but they're abstract. Maria is #8, but who is #7? Not their name (privacy matters), but their *story*:
> "The business ahead of you responds to reviews in 2 hours. You respond in 4."

Now #7 isn't a number. #7 is a *character* in Maria's story. Someone she's trying to catch.

**2. The Stakes of Inaction**
The code handles bottom-rank gracefully ("Room to climb") but never shows *risk*:
> "You're #8 today. But #9 got 3 reviews this week. They're coming."

Competition cuts both ways. Show the threat, not just the opportunity.

**3. The Locked Insight**
The Pro tier unlocks "specific gaps to next rank, competitor benchmarks, trend history." But this is buried in the PRD, not surfaced in the UI.

Show Maria a *blurred* insight: "Top performers in your category do [REDACTED]. Upgrade to see." That's a cliffhanger. That's how you drive upgrades.

---

## What's Working

1. **The Big Number** — "#8 of 47" is immediate, emotional, and clear. The `RankWidget` design gets this right.

2. **The Weekly Email Cadence** — Episodic engagement is the foundation of retention. You have it.

3. **The Coach Voice** — "Room to climb. Here's your next move." Not shaming, not cheerleading. Coaching. That's the right tone.

4. **The Trend Line** — The `TrendLine` component (4 weeks of history) creates narrative continuity. You're not just showing a snapshot; you're showing a story.

5. **Never Show "You're Last"** — The decision to handle bottom-rank with dignity is narratively correct. Shame creates churn. Hope creates retention.

---

## What's Missing

1. **The Reveal Experience** — First-time rank reveal needs ceremony. Don't just show the number.

2. **Mid-Week Engagement** — Daily data collection with weekly-only communication is a missed opportunity.

3. **The Rival Mechanic** — Rankings without visible competition lack stakes.

4. **Shareable Achievements** — No badges, certificates, or social proof mechanics.

5. **Goal-Setting** — Users can't set targets ("I want to be #5 by June").

6. **The Content Layer** — Success stories, community, educational content about ranking up — none of it exists.

---

## Narrative Recommendations

### 1. Add "First Rank Reveal" Ceremony
Build a dedicated reveal experience for first-time users. Three steps:
- "Let's see how you compare to [N] [category] in [location]..."
- Brief loading with tension ("Analyzing your reviews... Comparing to peers...")
- Reveal with context ("You're #8 — ahead of 39 businesses, 7 to catch")

### 2. Create "The One Ahead" Narrative
In weekly emails and dashboard, show anonymized traits of the business one rank ahead:
> "To catch #7, match their response time (2 hrs vs your 4 hrs)."

This creates a character to chase, not just a number.

### 3. Add Achievement Milestones
- "First Ranking" (you're on the board)
- "Top 50%" (you're above average)
- "Top 25%" (you're a leader)
- "Top 10" (elite status)

Each milestone = shareable badge = content flywheel.

### 4. Implement "Ranking at Risk" Alerts
> "#9 gained 2 spots this week. You could drop next Monday."

Fear of loss is a powerful retention hook. Use it sparingly, not manipulatively.

### 5. Build Weekly "Episode" Structure
The weekly email is your TV episode. Give it structure:
- **Previously:** Last week you were #10
- **This Week:** You're #8 (+2)
- **What Changed:** You responded to 3 reviews within 4 hours
- **Next Week Preview:** 2 reviews away from #7
- **Cliffhanger:** "#9 is gaining. Don't let them catch you."

---

## Score: 7/10

**Justification:** The narrative foundation is solid — competitive rankings are inherently dramatic, and the weekly email creates episodic engagement — but the emotional infrastructure (reveal ceremonies, rivals, cliffhangers, shareable moments) isn't built yet.

---

## The Bottom Line

You've built the scoreboard. Now build the season.

The data is there. The rankings are there. But data without drama is just a spreadsheet. You need Maria to *feel* something when she sees #8. You need her to *want* #7 so badly that she checks the app on Wednesday wondering if she's any closer. You need her to screenshot her "Top 10 Austin Restaurants" badge and text it to her sister who said the restaurant would never make it.

That's not a dashboard. That's a story.

Tell it.

---

*"Good television makes you want to see what happens next. Good products do the same."*

— Shonda Rhimes
Board Member, Great Minds Agency
