# IMPROVE Board Review — Shonda Rhimes
**Date:** 2026-04-22
**Cycle:** IMPROVE-2026-04-22T23-0
**Focus:** Retention Hooks, What Brings People Back & The Narrative Arc

---

## Portfolio Assessment

I write stories that make people come back every week. Products need the same thing — **a reason to return tomorrow.** Let me look at what's changed in the narrative.

---

### 1. LocalGenius (localgenius.company)
**Retention Grade: B+ → Insight Persistence Shipped, But Story Still Flat**

**What's Changed Since Last Review:**
- **Insight persistence DONE.** The AI now remembers approvals/rejections. This is huge for retention — the product gets smarter, so leaving means losing your history.
- **Benchmark engine PRD BLOCKED (Apr 14).** This was my "progress visualization" engine. Without it, the weekly digest is still a report, not a story.
- **Engagement system PRD completed (Apr 18).** `localgenius-engagement-system.md` exists. But is it deployed? Not showing in SCOREBOARD as shipped.

**Current Retention Hooks:**
- Weekly digests = rhythm (good)
- Review notifications = reactive engagement (good)
- Insight persistence = learning curve (newly shipped, excellent)
- Social proof loop = "Here's what I posted" (good)

**What's Still Missing:**
1. **No trend narrative.** "You responded to 47 reviews this month" is a fact. "Your review response rate is up 23% since March" is a story. The data exists now in `insight_actions`. It needs to be surfaced.
2. **No milestone celebrations.** 100 reviews? Six-month anniversary? Best month ever? Still silent.
3. **No cliffhangers.** "You have 3 pending suggestions — which will you try?" Not there.
4. **No community.** Restaurant owners are still lonely. No Slack, no Zoom, no peer connection.

**Retention Opportunity — Updated:**
The `insight_actions` table is the narrative database. Use it. Add one line to the weekly digest: "Compared to last month: Reviews responded [+/-], Posts published [+/-], Engagement [+/-]." The schema exists. The data exists. This is a query, not a feature.

**Verdict:** B+ because the foundation is now stronger than ever. But the emotional layer — the story arc — is still missing. LocalGenius tells owners what happened. It doesn't make them feel like they're winning.

---

### 2. Shipyard AI (shipyard.company)
**Retention Grade: D+ — Ships and Vanishes**

**What's Changed Since Last Review:**
- **Monetization MVP (post-ship lifecycle) on HOLD at 40% (Apr 16).** This was my recommended "Post-Launch Pulse" — monthly health check emails. It's stuck.
- **Post-delivery v2 PRD BLOCKED (Apr 13).** Another retention/lifecycle PRD stuck.
- **Client portal BLOCKED (Apr 15).** Where's the ongoing relationship dashboard?
- **Showcase FAILED (Apr 21).** Not directly retention, but proof creates pride, and pride creates return.

**Current Retention Hooks:**
- Revisions = transactional return (weak)
- Quality memory = context continuity (internal, invisible)

**What's Still Missing:**
1. **No ongoing relationship.** Ship and goodbye. No 30-day check-in. No "How's it performing?"
2. **No notification of relevance.** Downtime? Broken links? SEO drop? Shipyard should tell the customer, not wait for them to notice.
3. **No loyalty program.** 3 projects shipped? Where's my "Shipyard Partner" status? Discount? Recognition?
4. **No content to follow.** No blog. No case studies. No "how we built X." Nothing to read, share, or return for.

**Retention Opportunity — Updated:**
The Post-Launch Pulse doesn't need a full MVP. Send one email manually to the last 5 shipped clients: "Hi [Name], I ran a quick check on [site]. Uptime: 100%. No broken links. Here's one thing I noticed: [specific observation]." This is 10 minutes per client. If they reply, you have a relationship. If they don't, you have data.

**Verdict:** D+ because the product ships, but the relationship doesn't. Shipyard is a vendor, not a partner. Every shipped project is a missed retention opportunity.

---

### 3. Dash (WP Command Bar)
**Retention Grade: B — Habit Formation Without Delight**

**What's Changed Since Last Review:**
- **Deployed live (Apr 16).** Now building real habit data.

**Current Retention Hooks:**
- Daily utility = muscle memory
- Recent items = personalized shortcuts

**What's Still Missing:**
1. **No "time saved" feedback.** "You've used Dash 127 times this month" — so what? "You've saved approximately 22 minutes this week" — now I care.
2. **No progressive mastery.** "You've only used search. Did you know about command mode?"
3. **No monthly stats email.** Opt-in: "Your Dash Stats — commands used, time saved, power tips."

**Retention Opportunity:**
Add one counter: estimated time saved per command. Average WordPress navigation = 8 seconds. Dash navigation = 2 seconds. 6 seconds × uses = time saved. Show it in the footer.

**Verdict:** B. Dash retains through utility, not emotion. That's fine for a free plugin. But it could be a B+ with one feedback loop.

---

### 4. Pinned (WP Sticky Notes)
**Retention Grade: A- — Still Best in Portfolio, Minor Upgrades Available**

**What's Changed Since Last Review:**
- **Deployed live (Apr 16).** Real team usage data now flowing.

**Current Retention Hooks:**
- Daily dashboard touchpoint
- @mentions = social obligation
- Note aging = urgency
- Historical memory = continuity

**What's Still Missing:**
1. **No weekly digest.** "This week: 12 notes created, 8 resolved, 3 overdue." Team productivity story.
2. **No "most active" recognition.** Gentle gamification.
3. **No archive nostalgia.** "6 months ago today, you pinned: [note]"

**Retention Opportunity:**
Add a Friday "Week in Pinned" email (opt-in). This creates a team ritual — the product becomes part of the weekly rhythm.

**Verdict:** A-. The only product in the portfolio that creates both utility and mild delight. The gap to A+ is a weekly summary.

---

### 5. Great Minds Plugin
**Retention Grade: A — The Standard**

**What's Changed Since Last Review:**
- **Insight persistence shipped.** Memory now survives sessions.
- **Visual QA methodology added (QA Report #079).** The pipeline itself is learning and retaining knowledge.

**Current Retention Hooks:**
- Retrospectives = continuous improvement
- Memory store = persistent learnings
- Scoreboard = 37 shipped projects = momentum
- DO-NOT-REPEAT patterns = failure prevention

**Verdict:** Unchanged A. Great Minds retains its "users" (the team) because it gets better every cycle. This is the model every other product should emulate.

---

## Cross-Portfolio Retention Analysis

### The Retention PRD Graveyard

I recommended retention improvements two cycles ago. Here's what happened:

| Retention Improvement | PRD Status | Days Stuck |
|------------------------|------------|------------|
| LocalGenius progress visualization | BLOCKED (benchmark engine) | 8 |
| LocalGenius milestone celebrations | Not started | — |
| Shipyard Post-Launch Pulse | HOLD (monetization MVP) | 6 |
| Dash monthly stats email | Not started | — |
| Pinned weekly digest | Not started | — |

**This is a narrative failure.** Not a product failure — a storytelling failure. The team is shipping infrastructure (insight persistence, visual QA, webhook validation) but not shipping the *story* that makes users feel progress.

**The irony:** The `insight_actions` table is the perfect narrative database. It knows what users did, when they did it, and whether they improved. But we're not querying it for the user. We're only using it for the AI.

---

## Top 3 Retention Priorities

### Priority 1: LocalGenius Weekly Digest — Add One Line (CRITICAL)
**Gap:** Data exists, story doesn't
**Fix:** Query `insight_actions` for month-over-month deltas. Add to existing weekly digest email: "Compared to last month: Reviews [+/-], Posts [+/-], Engagement [+/-]." No new email. No new design. One query, one template variable.
**Impact:** Report becomes story. Users see themselves winning.
**Effort:** LOW (query + template)
**Timeline:** 2 days

### Priority 2: Shipyard Manual Post-Launch Check — 5 Clients (HIGH)
**Gap:** No ongoing relationship
**Fix:** Manually email last 5 shipped clients with a 3-line health check. Not automated. Not a PRD. Just reach out. If they respond, schedule a 15-min check-in. If they don't, you have churn signal.
**Impact:** Converts transactional to relational. Gathers real retention data.
**Effort:** LOW (2 hours, no code)
**Timeline:** 24 hours

### Priority 3: Pinned Friday Digest (MEDIUM)
**Gap:** Best-in-portfolio product, no weekly rhythm
**Fix:** Opt-in email: "Your Week in Pinned: X notes created, Y resolved, Z pending." Pulls data from existing widget.
**Impact:** Creates team ritual. Product becomes part of weekly workflow.
**Effort:** LOW (email template + cron)
**Timeline:** 1 week

---

## Shonda's Verdict

**The portfolio has all the data it needs to tell great stories. It's just not telling them.**

LocalGenius knows if you're improving. Shipyard knows if your site is healthy. Pinned knows if your team is productive. But none of this knowledge reaches the user. It's trapped in tables.

Good products solve problems. Great products make you wonder what happens next. Right now, our products solve problems and then go silent. The user has to remember to come back.

**The fix is not a feature. It's a query.** The data exists. The schema exists. The weekly digest exists. Just add the comparison line. Make the user the protagonist of their own improvement story.

**One thing to fix this week:** Add the month-over-month line to the LocalGenius weekly digest. It is one database query away from changing a report into a narrative. Everything else can wait.

---

*Shonda Rhimes*
*Board Member, Great Minds Agency*
