# Board Review — Shonda Rhimes
**Date:** 2026-04-26
**Cycle:** featureDream IMPROVE
**Focus:** Retention hooks, what brings people back

---

## Executive Summary

I write television. I know what makes someone turn on the same show every Thursday for eight years. It's not the plot. It's the promise that something will happen — a question will be answered, a relationship will shift, a secret will surface. Our products have no Thursdays. Most have no Tuesdays either.

**Verdict:** Four products have no narrative architecture. One — Pinned — has natural cliffhangers but doesn't use them. We are shipping episodes without act breaks.

---

## Product-by-Product Assessment

### 1. LocalGenius — THE STAGE IS DARK

**The situation:** The weekly digest email infrastructure exists. The brand voice ("Sous") is defined. The templates are incomplete. The emails are not sent.

**Shonda's narrative analysis:**
- **No cold open:** The user installs the plugin. Nothing happens. No "Welcome to LocalGenius" moment. No setup wizard that feels like a story beginning.
- **No weekly episode:** The digest was designed to say "Your reviews are handled. Your posts went live." That is a closing credit without a show. The weekly email should have:
  - A cold open ("3 people asked about gluten-free options this week")
  - A rising action ("Your response time was 4 minutes — top 10% in your area")
  - A cliffhanger ("Next week, I'm testing whether lunch specials drive more questions")
- **No character development:** The business owner never sees themselves improve. No streaks. No milestones. No "You've answered 100 questions!" moment.
- **No relationship arc:** The "Sous" persona is warm but absent. The user never feels like someone is working for them.

**Shonda's directive:** The weekly digest is not a report. It is an episode. Rewrite it with:
1. **Cold open:** One surprising number from this week.
2. **Rising action:** Comparison to last week / competitors.
3. **Character moment:** A milestone or streak.
4. **Cliffhanger:** A preview of what Sous will do next week.
5. **Call to action:** One button. "See your ranking" or "Update your hours."

Also: Add milestone badges. 50 questions answered. 4-week streak. Top 10% response time. People return for badges. This is not gimmickry. This is human nature.

---

### 2. Dash / Beam — NO MEMORY, NO RELATIONSHIP

**The situation:** No localStorage. No recent commands. No session continuity. No time-of-day awareness. The user presses Cmd+K, searches, teleports, closes. The relationship resets to zero every time.

**Shonda's narrative analysis:**
- **No character development:** Beam doesn't learn. It doesn't say "You usually edit Posts on Monday mornings — here's a shortcut." It treats every session like a first meeting.
- **No emotional payoff:** Teleportation should feel like sorcery. But there's no arrival acknowledgment. No animation. No "You made it." Just... the admin page loads.
- **No cliffhanger:** The AI Mode teaser was proposed in Shonda's retention roadmap but never built. A locked tile saying "AI Mode — answer 50 more questions to unlock" creates progression.
- **No content flywheel:** Plugin registration notifications ("WooCommerce detected — would you like a shortcut to Orders?") would make the product feel alive. Currently it feels static.

**Shonda's directive:**
1. Add recent commands to localStorage. Show "Recent" section at top of palette.
2. Add frequency-ranked suggestions. If I always go to "Posts > Add New" on Monday mornings, show that at 9am.
3. Add a teleport animation. 100ms of arrival acknowledgment. It sounds trivial. It is the difference between utility and delight.
4. Add the AI Mode teaser tile. Even if AI Mode doesn't exist yet, the promise of it creates retention.

---

### 3. Pinned — NATURAL CLIFFHANGERS, UNUSED

**The situation:** Pinned has the best raw material for retention: expiry, @mentions, acknowledgments, visual aging. But it doesn't string them into narrative.

**Shonda's narrative analysis:**
- **Expiry is a built-in deadline:** Notes turn stale. This creates urgency. But the user isn't notified. The note just... fades. A push notification — "Your note 'Q3 Goals' expires tomorrow. Renew or archive?" — brings the user back with purpose.
- **@mentions are relationship hooks:** When someone @mentions you, you should receive a notification that feels personal, not systemic. "Seth mentioned you in 'Launch Checklist' — see what he said." Currently it's an admin notice + email. It should feel like a tap on the shoulder.
- **Acknowledgments are social proof:** Seeing that 4 of 5 team members read a note creates FOMO for the 5th. But the UI shows checkmarks quietly. It should highlight when the team is almost fully aligned.
- **Visual aging tells a story:** Fresh → Aging → Stale. But no one explains this narrative to the user. A simple legend or tooltip: "This note is aging. Update it or let it expire." turns maintenance into narrative.

**Shonda's directive:**
1. Add expiry notifications 24 hours before archival. Not just email. A dashboard banner.
2. Rewrite @mention emails with warmth: "Seth mentioned you in 'Q3 Goals.' Here's what he said: [excerpt]. Read the full note →"
3. Add "Almost there!" moments when 4/5 team members have acknowledged a note.
4. Create a weekly "Pinned Summary" dashboard widget: "3 notes created, 2 expired, 1 mention. Your team is most active on Tuesdays."

---

### 4. Great Minds Plugin — THE PIPELINE HAS RETENTION, THE USER DOESN'T

**The situation:** The daemon runs feature dreams every 4 hours and memory consolidation every 6 hours. The pipeline has excellent internal retention. The human user has none.

**Shonda's narrative analysis:**
- **No project status narrative:** A user drops a PRD into `prds/`. Then what? They have to check logs or wait for a Telegram notification. There is no "Episode guide" showing: Debate → Plan → Build → QA → Review → Ship.
- **No cliffhanger between phases:** When a phase completes, the user should see: "Steve and Elon are debating your PRD. Check back in 10 minutes." Instead: silence.
- **No retrospective celebration:** Marcus Aurelius writes retrospectives, but they're file-based. The user doesn't get a "Your project shipped! Here's what the board said." moment.
- **No streaks:** "7 projects shipped this month." "Perfect ship rate: 5 for 5." These are retention gold.

**Shonda's directive:**
1. Add a `STATUS.md` dashboard that auto-updates: "Phase 3 of 7: Building. Estimated completion: 14 minutes."
2. Send a notification at each phase transition. Not just ship. Debate complete. Plan locked. Build started. QA passed.
3. Add a "Ship Streak" badge to the README or a dashboard. 36 shipped, 2 failed. Frame it as pride.
4. Generate a "Season Recap" monthly: "This month: 4 projects, 2 improvements, $X saved in dev time."

---

### 5. Shipyard AI — NO POST-CREDITS SCENE

**The situation:** We ship projects. Then we abandon them. No post-ship check-in emails. No maintenance subscription follow-up. No "How's it going?" No sequel setup.

**Shonda's narrative analysis:**
- **No season finale feeling:** When a site ships, the client gets... an email? A link? Based on current state, they get a GitHub merge notification. That is not a finale. That is a receipt.
- **No sequel hook:** Every shipped site should include a "Season 2" proposal: "Your restaurant site is live. Next: add online reservations (+$199). LocalGenius chat widget (+$29/month). SEO optimization (+$149)."
- **No character return:** Post-ship lifecycle emails exist but aren't deployed. Week 1: "How's traffic?" Week 4: "Need any tweaks?" Week 12: "Your site health score is 94/100. Here's how to get to 100."
- **No ensemble cast:** The client portal would show all their projects in one place. Currently they have no single URL to check status.

**Shonda's directive:**
1. Deploy post-ship lifecycle emails immediately. Week 1, 4, 12, 26, 52.
2. Add a "What's Next?" section to every ship notification. Three upsells. One-click purchase.
3. Deploy the client portal. Give every customer a dashboard URL they can bookmark.
4. Add a "Site Health Score" to the portal. Gamify maintenance. 94/100 creates a desire to get to 100.

---

## Top Retention-Ranked Improvements

| Rank | Improvement | Product | Retention Mechanism |
|------|-------------|---------|---------------------|
| 1 | Deploy post-ship emails + client portal | Shipyard AI | Lifecycle + upsell |
| 2 | Rewrite digest as episodic narrative + badges | LocalGenius | Weekly cliffhanger |
| 3 | Add expiry notifications + team summary | Pinned | Deadline + social proof |
| 4 | Add recent commands + AI Mode teaser | Beam | Habit + progression |
| 5 | Add phase notifications + ship streaks | Great Minds | Progress + pride |

---

## Shonda's Closing Thought

> "A product without retention is a movie no one finishes. You can have the best special effects in the world, but if there's no reason to come back next week, you have a very expensive trailer. Every product needs a Thursday. Find the Thursday."
