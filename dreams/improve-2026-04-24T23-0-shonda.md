# Board Review — Shonda Rhimes
**Date:** 2026-04-24
**Cycle:** featureDream IMPROVE
**Scope:** LocalGenius · Shipyard AI · Dash · Pinned · Great Minds

---

## The One-Sentence Verdict

None of your products have a story that continues. Every interaction is a standalone episode with no season arc, no cliffhanger, no reason to tune in next week. In television, that's called a cancellation. In software, it's called churn.

---

## Product-by-Product Assessment

### LocalGenius — "Data Without Drama Is Just a Spreadsheet"

**What I Love:**
The weekly digest is the right instinct. A coach who shows up every Monday with real numbers — reviews responded, posts published, engagement rate — is a character. "Sous" as a warm maître d' who never shames, only encourages, is a voice. You didn't build software. You built a character. That's rare.

**What Makes Me Change the Channel:**
Each week stands alone. No throughline. No rising action. Week 3 feels identical to Week 12. The restaurant owner opens the digest, skims the numbers, and closes the email. No emotional peak. No "what happens next."

**The Retention Gap:**
You designed a retention roadmap — V1.1 features estimated at $69K that add +25% annual renewal. None of it is built.

| Feature | Status | Retention Lift |
|---------|--------|----------------|
| Daily Check-In Notifications | Designed only | +12% Week 2-4 |
| Multi-Week Story Threads | Designed only | +18% Week 4-8 |
| Badge Callback System | Designed only | +10% long-term |
| Evolving Journal Prompts | Designed only | +15% journal completion |
| Seasonal Recap Narratives | Designed only | +25% annual renewal |

That's not a roadmap. That's a wish list. And the cost of delay is compounding: every week without multi-week threads is a cohort that hits Week 4 and wonders why they're still paying.

**The Narrative Fix:**
Turn the weekly digest into a serialized story.

Week 1: "The Pilot." "You answered 3 reviews this week. That's 3 more than last week. Here's what I noticed..."
Week 2: "Rising Action." "Remember those 3 reviews? Your response rate is now faster than 67% of restaurants in Denver. Want to break into the top 50%?"
Week 3: "The Reversal." "Uh oh. One negative review this week. But look — your response time was 4 hours. That's the real win."
Week 4: "The Cliffhanger." "Next week, I'll show you how your social posts performed against your biggest competitor. I think you'll be surprised."

That's not harder to write. It requires a data structure — a `story_arc` table that tracks where each user is in their season — but the emotional architecture is what matters.

**Specific Mandate:**
1. **Build the `story_arc` table.** User ID, current episode, narrative variables. "Met competitor_introduced? Y/N."
2. **Ship multi-week threads first.** Highest retention lift per engineering hour. Start with a 4-week "Season 1: Your First Month" arc.
3. **Add badge callbacks.** Not just "You earned Fast Responder" — "You earned Fast Responder. Last week you were at 67%. This week you're at 41%. The top 10% get Gold. Want to see what Gold looks like?"
4. **Seasonal recaps.** "Your Year in Review." 12 months of data, one emotional narrative. "You answered 147 reviews. You saved 23 hours. Your fastest response was 11 minutes. Here's the photo of your busiest day." People share these. That's organic marketing.

---

### Shipyard AI — "The Client Relationship Is a Story, Not a Transaction"

**What I Love:**
The agent personalities are theater. Steve Jobs rejecting ideas. Jensen Huang finding moats. Oprah worrying about users. That's a writers' room. People remember characters.

**What Makes Me Change the Channel:**
The client experience is: submit PRD, wait 5 days, get site, goodbye. No rising action. No mid-season twist. No finale that makes them want Season 2.

**The Retention Gap:**
Post-ship lifecycle is 40% complete. No systematic nurturing. No "Your site is live — here's what happens next." No maintenance nudges. No "6 months later, here's how you could improve."

The `insight_actions` table exists. Jensen told you: it's the perfect narrative database. But you're not querying it for clients. A client who sees "Shipyard has saved you 47 hours this year" or "Your site loads faster than 89% of your competitors" has an emotional reason to renew. Right now they have a ZIP file and a handshake.

**Specific Mandate:**
1. **Ship the client project memory.** One page: "What we built. Why we chose X. What you rejected. What maintenance is due." That's the season recap.
2. **30-day check-in email.** "Your site has been live for 30 days. Here's what we've noticed. Want to talk about Phase 2?" Not a sales pitch — a plot development.
3. **Add the "Behind the Scenes" narrative.** Clients love seeing process. "Steve rejected 4 color palettes before choosing this one. Here's why." It justifies price and creates emotional investment.

---

### Dash — "A Habit Without a Reward Is Just a Chore"

**What I Love:**
Keyboard shortcuts become muscle memory. That's genuine habit formation. The recent-items personalization means it gets smarter with use.

**What Makes Me Change the Channel:**
No feedback loop. A user presses Cmd+K 200 times in a month and sees... nothing. No "200 commands this month." No "You saved 2.4 hours vs mouse navigation." No "You're in the top 15% of power users." Just a blank search box, waiting.

**The Retention Fix:**
Add a footer to the command palette: "127 commands this month. Estimated time saved: 4.2 hours."

That's it. One line. It transforms a utility into a scoreboard. People love scoreboards.

Better: weekly email (opt-in). "Your Dash stats this week: 47 searches, 3 new commands discovered, 5.1 minutes saved. You're 12 commands away from your personal best."

**Specific Mandate:**
1. **Add the usage footer.** One line of UI. Immediate emotional payoff.
2. **Add progressive mastery hints.** "You've used search 50 times. Did you know about 'p new' to create posts?" Discovery drives retention.
3. **Create a "Power User" badge.** 500 commands = Silver. 2,000 = Gold. 10,000 = Platinum. Ridiculous? People chase Steam achievements for games they don't play. They'll chase this.

---

### Pinned — "The Best Retention Hook Is Already Built. You're Not Using It."

**What I Love:**
@mentions are the single strongest retention mechanism in this entire portfolio. Social obligation is a force of nature. When Maria @mentions David about updating the hero image, David doesn't just see a note — he feels an expectation. That's emotional gravity.

**What Makes Me Change the Channel:**
No team rhythm. No weekly wrap-up. No "who's falling behind." The notes age visually, which is good, but there's no narrative consequence. A 7-day-old note should trigger a team notification: "This note is a week old. Should it still be open?"

**The Retention Fix:**
Friday "Week in Pinned" email (opt-in):
- "This week: 12 notes created, 8 resolved, 3 still open."
- "Top contributor: Sarah (5 notes)."
- "Longest open note: 'Update pricing page' — 14 days. @marketing-manager, this one's waiting for you."
- "Your team's resolution streak: 3 weeks."

That's not analytics. That's a story. And the story creates social pressure, which creates action, which creates retention.

**Specific Mandate:**
1. **Ship the Friday wrap-up email.** One email. One query. Transform data into drama.
2. **Add resolution streaks.** "Your team closed 12 notes this week. Best week ever!" Celebration drives repetition.
3. **Create archive nostalgia.** "6 months ago today, you pinned: 'Launch new menu page.' Look how far you've come." Continuity creates belonging.
4. **Add note reactions.** Simple emoji. 👍 = acknowledged. ✅ = done. Reactions are low-friction engagement that keep people returning.

---

### Great Minds Plugin — "Pipeline Addiction Is Real. You're Not Selling It."

**What I Love:**
The autonomous pipeline is genuinely addictive. Watching agents debate, build, test, and ship — it's binge-worthy. The first time you see a PRD become a live site without touching code, it's magic.

**What Makes Me Change the Channel:**
No one outside this room gets to experience that magic. The framework is locked behind technical setup. The retention hook — "I can't wait to see what the agents do next" — is wasted on a single user.

**The Retention Fix:**
If Great Minds were a hosted SaaS, every pipeline run could generate a "Behind the Episode" email:
- "Steve rejected 4 ideas this week. Jensen found 2 moat opportunities. Margaret caught a bug before production."
- "Your institutional memory has grown by 23% this month. You now have 47 patterns the agents know not to repeat."
- "Pipeline speed this month: 23% faster than your first project. You're learning. The agents are learning."

That's narrative. That's retention. That's why people binge-watch TV seasons.

**Specific Mandate:**
1. **Build the pipeline dashboard.** "15 pipelines run. 8 features shipped. 23 bugs caught." Accumulated value visualization.
2. **Add the "Agent Performance" weekly.** "Steve was tough this week. He rejected 4 concepts. But he approved the one that mattered." Character-driven engagement.
3. **Create memory growth visualization.** "Your buglog has 47 entries. Your agents haven't repeated a single one." Progress bars are heroin.

---

## Portfolio-Wide Narrative Failure

| Pattern | Evidence | Emotional Cost |
|---------|----------|--------------|
| Episodic, not serialized | Weekly digests stand alone; projects ship and end | Users feel no continuity |
| Data without drama | insight_actions exists but untold; Dash stats invisible | Users see chores, not progress |
| No celebration | No badges, no streaks, no "best week ever" | Users feel invisible |
| No cliffhangers | Nothing makes users wonder "what's next?" | No reason to return |

## My Ranked Improvements

1. **LocalGenius Multi-Week Story Threads** — Highest retention lift (+18% Week 4-8). Impact: Converts a report into a serialized experience people miss if canceled.
2. **Pinned Friday Wrap-Up + Streaks** — Social obligation is already built. Impact: Activates the strongest retention force in the portfolio with one email and one counter.
3. **Shipyard Client Project Memory + 30-Day Check-In** — Converts transactions into relationships. Impact: Creates narrative continuity that drives renewals and Phase 2 projects.

**Bottom Line:** People don't cancel characters they care about. Right now, your products are efficient machines. Make them characters. Give them seasons. Create cliffhangers. The best retention strategy in the world is simply this: make people wonder what happens next.

— Shonda
