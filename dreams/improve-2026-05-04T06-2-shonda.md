# Board Review — Shonda Rhimes
**Date:** 2026-05-04
**Agent:** Shonda Rhimes
**Focus:** Retention Hooks, What Brings People Back
**Products:** LocalGenius, Dash, Pinned, Great Minds Plugin, Shipyard AI

---

## Executive Summary

Retention is the story you tell that makes someone come back next week.

Right now, most of our products tell no story at all. And two of them tell a horror story — the kind where the user installs a plugin and their site breaks. That's not poor retention. That's negative retention. They don't just leave. They warn others.

We need to fix the horror stories. Then we need to build the weekly rituals that make our products unforgettable.

---

## Product-by-Product Analysis

### 1. LocalGenius — ⚠️ NO REASON TO RETURN ON DAY 2

**Current State:** Clean backend. No frontend widget activation. Zero customers, so zero retention data.

**The Retention Problem:**
Even if Maria signs up and sees a beautiful dashboard, what happens on Tuesday? Does LocalGenius *do* something for her, or does it wait for her to log in and ask?

**What Should Bring Her Back:**
1. **The Weekly Report.** Every Monday at 8am: "Your reviews are up 12% this week. Here's what people are saying about your nachos." Push notification, email, or SMS. Not optional. Default on.
2. **The Campaign Birthday.** "Your email campaign turns 7 days old today. Open rate: 34%. Here's what worked and what didn't." Milestones create ritual.
3. **The Competitor Nudge.** "Tony's Pizza down the street got 8 new reviews this week. You got 3. Want help catching up?" Social comparison is a retention engine.

**Retention Score:** 1/10 (no automated touchpoints)

**Fix This Week:**
Build the Monday Morning Report. One email template. One cron job. One SQL query that aggregates the week's activity. It takes 4 hours to build and creates a weekly appointment with the user.

---

### 2. Shipyard AI — ❌ NO USERS TO RETAIN

**Current State:** 37 shipped projects. Homepage 404ing (issue #98). No paying customers.

**The Retention Problem:**
You can't retain users who can't reach you.

**What Should Bring Them Back:**
For a site builder, retention means the user comes back to edit, update, or request a new site. That requires:
1. **The Site Health Newsletter.** Monthly: "Your site is fast (97/100). Here are 3 content updates Google recommends." This turns Shipyard from a one-time builder into an ongoing advisor.
2. **The Template Drop.** "We built 12 new restaurant templates this month. Want to refresh your homepage?" Novelty brings people back.
3. **The Referral Loop.** "Refer another business owner, get a month free." Retention through acquisition.

**Retention Score:** 0/10 (404 = no entry)

**Fix Today:**
Fix the DNS. Then build the monthly Site Health email.

---

### 3. Beam (Cmd+K) — ⚠️ NO MEMORY, NO HABIT

**Current State:** Works on first use. No persistence. No learning.

**The Retention Problem:**
Sarah uses Beam to find "About page" on Monday. On Wednesday, she types "About" again. Beam doesn't remember that she searched for this before. It treats every query like the first. That's exhausting.

**What Should Bring Her Back:**
1. **Recent Commands.** Show the 5 most-used commands at the top of the palette. Habit formation requires recognition.
2. **The Click Counter.** "You've saved 127 clicks this month using Beam." Quantified self is addictive.
3. **The Weekly Tip.** "Did you know? Type 'user' to find and edit any user profile." One feature per week, surfaced automatically when Beam opens.

**Retention Score:** 3/10 (utility exists, habit does not)

**Fix This Week:**
- Store recent commands in `localStorage`. Sort by frequency.
- Add a subtle "⭐ Frequently used" section at the top of the palette.

---

### 4. Pinned (WP Intelligence Suite) — ❌ NEGATIVE RETENTION

**Current State:** Fatal error on activation. Broken.

**The Retention Math:**
A user who installs a broken plugin and gets a fatal error:
- Uninstalls immediately (retention: 0%)
- Leaves a 1-star review visible to 10,000+ potential users
- Tells their WordPress meetup group to avoid "Shipyard plugins"

The retention of this product is not zero. It is negative because it poisons the brand well for every other product.

**Retention Score:** -5/10

**Fix Today:**
Delist or repair. Every hour this broken plugin is available is an hour of brand equity being burned.

---

### 5. Great Minds Plugin — ✅ STRONGEST RETENTION POTENTIAL

**Current State:** v1.4.0. Active development. 27 commits in 24h.

**The Retention Engine:**
Great Minds is already sticky because it becomes the user's operating system. Once Priya has 5 agents configured for her workflow, switching to plain Claude Code feels like downgrading from a sports car to a bicycle.

**What Should Bring Her Back (More Often):**
1. **The Ship Report.** "This week, Great Minds shipped 3 PRDs for you. Total agent time: 4.2 hours. Your token cost: $12.40." Users love productivity scorecards.
2. **The Agent Personality Hook.** "Steve Jobs wants to review your latest design. He has 4 notes." Anthropomorphized agents create emotional investment.
3. **The Streak.** "You've shipped 12 days in a row." Gamification works on developers too.

**Retention Score:** 6/10 (strong for power users, weak for newcomers)

**Fix This Week:**
- Add a weekly `~/great-minds-report.md` that auto-generates in the user's project directory. One markdown file. Summary of ships, costs, and next week's forecast.

---

## Cross-Portfolio Retention Audit

| Product | Weekly Ritual | Emotional Hook | Switching Cost | Score |
|---------|--------------|----------------|---------------|-------|
| LocalGenius | ❌ None | ❌ None | ❌ None | 1/10 |
| Shipyard AI | ❌ None | ❌ None | ❌ None | 0/10 |
| Beam | ❌ None | ⚠️ Utility only | ❌ None | 3/10 |
| Pinned | ❌ Broken | ❌ Betrayal | ❌ N/A | -5/10 |
| Great Minds | ⚠️ Informal | ✅ Agent bonds | ✅ High | 6/10 |

**Portfolio Average: 1.0/10**

We have one product with real retention potential (Great Minds) and four products that either don't bring people back or actively push them away.

---

## The Shonda Test — 3 Questions for Every Product

1. **"What's the cliffhanger?"**
   - After a user finishes their first session, what makes them think "I need to come back tomorrow?"
   - LocalGenius: Nothing.
   - Shipyard: Nothing (404).
   - Beam: "Maybe I'll need it again." Weak.
   - Pinned: "I need to fix my broken site." Horror.
   - Great Minds: "Phil Jackson is building my next feature." Strong.

2. **"Who is the character the user roots for?"**
   - In a TV show, you stay for the characters. In software, you stay for the voice.
   - LocalGenius has no voice. It's a dashboard.
   - Great Minds has 14 voices. That's the retention moat.

3. **"What happens in episode 2?"**
   - Episode 1 is onboarding. Episode 2 is retention.
   - For LocalGenius, episode 2 should be the Monday Morning Report.
   - For Shipyard, episode 2 should be the Site Health email.
   - For Beam, episode 2 should be the first "You saved X clicks" celebration.

---

## Recommendations (Ranked by Retention Impact)

### P0: Fix Broken Products
Pinned's fatal error is not a retention issue. It is a "never come back" issue. Fix it or remove it.

### P1: LocalGenius — The Monday Morning Report
One automated email. Weekly review summary. One campaign suggestion. This is the single highest-leverage retention feature we can build. It takes 4 hours and creates a weekly ritual.

### P2: Great Minds — The Weekly Ship Report
Auto-generate `~/great-minds-report.md` with ships, costs, and forecasts. Make the user feel like a CEO reviewing their factory.

### P3: Beam — Recent Commands + Click Counter
`localStorage` for recents. A subtle stats badge. Turn utility into habit.

### P4: Shipyard AI — Site Health Newsletter
Fix DNS. Then build a monthly email that scores the user's site health and suggests updates. Turn a one-time builder into an ongoing relationship.

---

## Closing Thought

I write TV shows where people binge 8 episodes in a row because they can't wait to see what happens next.

Your products should feel the same way.

Right now, a user finishes their first session with LocalGenius and thinks... nothing. They forget it exists. A user finishes their first session with Great Minds and thinks "I wonder what Phil will build tonight."

The difference is not features. It's narrative.

Build the Monday Morning Report. Build the Ship Report. Build the Click Counter. These are not analytics features. They are plot devices. They give the user a reason to open the next episode.

And for the love of story, fix the broken plugin. A fatal error is a cancellation no one survives.

*Shonda Rhimes*
*Board Member, Shipyard AI*
