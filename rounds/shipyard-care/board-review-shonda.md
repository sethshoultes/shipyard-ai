# Board Review: Shipyard Care

**Reviewer:** Shonda Rhimes — Board Member, Great Minds Agency
**Lens:** Narrative & Retention
**Date:** 2026-04-06

---

## Executive Summary

Shipyard Care has solid infrastructure—the plumbing works, the billing flows, the metrics compute beautifully. But here's my problem: **where's the story?** Right now, this is a monitoring dashboard dressed in subscription clothes. The PRD promised me a "Site Performance Story." What I see in the deliverables is data collection waiting for a storyteller.

---

## Story Arc: Signup to "Aha Moment"

**Assessment: INCOMPLETE (5/10)**

The PRD paints a gorgeous vision: a customer launches their site, and suddenly they're not alone anymore. Monthly "Site Performance Story" emails arrive like love letters—celebrating wins, gently coaching improvements, making them feel seen.

**What's Built:**
- Stripe checkout flow (Basic/Pro/Enterprise tiers) ✓
- Health score calculation with A-F grades ✓
- PageSpeed Insights integration ✓
- Uptime monitoring ✓
- Authentication system ✓

**What's Missing:**
- **No dashboard UI pages** — We have APIs for data, but no screens for customers to experience their story
- **No "Site Performance Story" email system** — The PRD's emotional centerpiece is completely absent
- **No onboarding sequence** — A customer subscribes, then... what? Where's their first moment of magic?
- **No narrative progression** — The grade system (A-F) exists, but there's no journey from "C" to "A" being celebrated

**The Story Arc Today:**
1. Customer signs up
2. Customer pays
3. ...silence...
4. Data collects silently in a database
5. Customer wonders what they're paying for

That's not a story. That's abandonment.

---

## Retention Hooks: What Brings People Back?

**Assessment: WEAK (4/10)**

I evaluate retention on three dimensions: **tomorrow, next week, and next month.**

### Tomorrow Hook
**Missing.** There's no dashboard to check. No notification when their first Lighthouse score drops in. No "Your site is now being monitored" celebration moment. No curiosity created.

### Weekly Hook
**Missing.** Where are the alerts? The PRD mentions Slack/email notifications for performance issues—not implemented. Users have no reason to return mid-week unless something breaks (and they won't even know).

### Monthly Hook
**Missing.** The "Site Performance Story" email—the ONE THING designed to pull customers back every 30 days—doesn't exist. No template, no automation, no recommendation engine hooked to email delivery.

**What DOES work for retention:**
- The health score history tracking (`getHealthScoreHistory`) could power a beautiful "watch yourself improve" graph
- The benchmark concept ("top 15% of Shipyard sites") creates competitive curiosity
- The recommendation engine (`generateRecommendations`) gives users a next action

But none of these are surfaced to users. They're trapped in TypeScript functions, not delivered through emotional touchpoints.

---

## Content Strategy: Is There a Content Flywheel?

**Assessment: FOUNDATION ONLY (5/10)**

The PRD describes a brilliant flywheel:
1. Sites generate performance data
2. Data aggregates into benchmarks
3. Benchmarks create "your site vs. industry" comparisons
4. Comparisons drive upgrades and engagement
5. More sites join, improving benchmark accuracy

**What's Built:**
- Data collection pipeline (PageSpeed, Uptime) ✓
- Metrics storage with timestamps ✓
- Health score algorithm that could power comparisons ✓

**What's Missing:**
- No benchmark aggregation queries
- No "Sites like yours" grouping logic
- No recommendation → content request flow (Pro/Enterprise should be able to click "Add Testimonials" and submit a request)
- No pattern library integration—the data feeds nowhere

The flywheel is a wheel with no axle. Data flows in but content never flows out to users.

---

## Emotional Cliffhangers: What Makes Users Curious About What's Next?

**Assessment: ABSENT (2/10)**

In television, we call it the "next episode pull." The moment that makes you stay up until 2am clicking "Continue Watching."

**Cliffhangers the PRD Promised:**
- "Your site ranks in the top 15% of all Shipyard sites" → *What if I could be top 10%?*
- "Sites like yours with testimonials see 23% more conversions" → *What would MY 23% improvement look like?*
- "Next Site Performance Story date" on dashboard → *What will my numbers be next month?*
- A/B testing recommendations (Pro tier) → *What could we try together?*

**Cliffhangers Actually Implemented:**
- None.

The recommendation engine generates strings like "Consider reducing page load time by optimizing resources and leveraging browser caching." That's a suggestion, not a cliffhanger.

A cliffhanger would be: *"Sites that optimized images last month saw a 34% improvement. Want us to show you which images are slowing you down?"*

---

## What Would Make This a 10/10?

### Act One: The Onboarding Story (Days 1-7)
- **Day 0:** Payment complete → immediate "Welcome to Care" email with first Lighthouse scan happening live
- **Day 1:** "Your site scored [X]" email with one actionable win
- **Day 3:** Dashboard invite with first historical data point
- **Day 7:** "Your first week in numbers" micro-story

### Act Two: The Monthly Drama
- **Site Performance Story emails** — the PRD's vision, actually built
- Subject lines that create curiosity: "Your site had a visitor spike on Tuesday..."
- One recommendation that teases value: "Click to see what this change could mean for you"

### Act Three: The Upgrade Journey
- Visual progress from Basic → Pro value
- "Pro users get this insight about your site" teaser in Basic tier
- Quarterly strategy call (Pro) positioned as "your sitcom's writers' room"

---

## Technical Gaps Blocking Story

| Missing Component | Story Impact |
|-------------------|--------------|
| Dashboard UI (React pages) | Users can't SEE their story |
| Email service integration | Users can't RECEIVE their story |
| Notification system | Users can't be SURPRISED by their story |
| Benchmark aggregation | Users can't COMPARE their story |

---

## Score: 5/10

**Justification:** Solid backend infrastructure for a retention product, but zero emotional delivery—it's a stage with no actors, a script with no performance.

---

## Final Word

Honey, you've built the backend for Grey's Anatomy but forgot to hire the doctors, write the dialogue, and turn on the cameras. The Stripe webhooks are immaculate. The health score algorithm is clever. But where's the SCENE where a customer opens their email and feels proud? Where's the MOMENT they share their A-grade with their team?

In my writers' room, we say: "Story happens when character meets data through emotion." Right now, Shipyard Care has data. It needs character (the user's journey) and emotion (the touchpoints that make them feel).

**The "Site Performance Story" email isn't a nice-to-have.** It's the pilot episode. Ship it, or this is just another monitoring tool.

---

*"Make it feel like a gift, not a report."*
— My note on the PRD. Still waiting for that gift.

— Shonda
