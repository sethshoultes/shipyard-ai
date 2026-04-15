# Board Review: Shonda Rhimes
**Cycle:** IMPROVE 2026-04-14T23:04
**Lens:** Retention Hooks & What Brings People Back

---

## Executive Summary

A great product solves a problem. A **great franchise** creates anticipation. I'm looking at these five products through the lens of serialized storytelling: **What's the cliffhanger? What makes users come back tomorrow?**

Some of these products are one-shot experiences. You use them, they work, and there's no reason to return. Others have the bones of something that creates ongoing engagement—they just haven't built the hooks yet.

---

## Product-by-Product Retention Analysis

### 1. LocalGenius

**The Promise:** AI marketing that runs itself.

**Current Retention Mechanism:** Weekly Digest (designed but not built)

**Why Users Would Leave:**
- If the chat widget answers the same 10 questions forever, it becomes invisible. Users stop noticing it. Customers stop engaging with it.
- If there's no measurable improvement ("Your reviews went up 15% this month"), users assume nothing is happening.
- If the AI doesn't surprise them with useful suggestions, it feels like wallpaper.

**What Would Bring Them Back:**

1. **The Weekly Performance Email (HIGH PRIORITY)**
   - "This week: 127 questions answered. Your top question was 'Do you deliver?' 4 reviews received (up from 2 last week). Here's what I recommend..."
   - This is the equivalent of a "Previously on..." segment. It reminds users the product is working.
   - Must ship with Benchmark Engine.

2. **Competitive Context Notifications**
   - "You're now the #3 rated Italian restaurant in your neighborhood. Here's how to get to #2..."
   - This creates stakes. Users aren't just improving—they're competing.
   - Benchmark Engine enables this.

3. **Proactive Suggestions**
   - "It's been 2 weeks since you posted about a special. Restaurants like yours see 23% more engagement when they post weekly. Want me to draft something?"
   - This is the AI reaching out, not just waiting.

**Retention Potential: 8/10** (if weekly digest and benchmark shipped)

---

### 2. Dash (Command Palette)

**The Promise:** Navigate WordPress faster.

**Current Retention Mechanism:** Recent Items (last 10 selections)

**Why Users Would Leave:**
- Once users learn the 5 commands they use daily, there's no new value. The product becomes habit (good) but not delightful (not good enough).
- No notifications. No nudges. No reason to think about Dash unless actively using WordPress.

**What Would Bring Them Back:**

1. **"Discover Something New" Weekly Prompt**
   - Once a week, in the WordPress admin, show: "Did you know you can `>upload` to add media directly from Dash?"
   - Surface one underused feature per week.
   - Keeps the product feeling fresh.

2. **Usage Insights Dashboard**
   - "This week you ran 47 commands. Your most-used: 'settings', 'posts', '@jane'. You might also like: 'plugins'."
   - Shows users their own behavior, which is inherently engaging.

3. **Keyboard Shortcut Streak**
   - "You've used Cmd+K for 5 days in a row! Keep it up."
   - Gamification is cheap but effective.

**Retention Potential: 5/10** (utility product; retention is about habit, not anticipation)

---

### 3. Pinned Notes

**The Promise:** Team communication in WordPress.

**Current Retention Mechanism:** @mention notifications, visual note aging

**Why Users Would Leave:**
- If teammates don't use it, you stop using it. This is a network-effects product.
- If notes pile up and nobody acknowledges them, the widget becomes noise.
- If there's no "feed" of activity, users don't feel connected to their team.

**What Would Bring Them Back:**

1. **Daily Team Activity Summary (EMAIL)**
   - "Today on your dashboard: 3 new notes, 2 @mentions for you, 1 note expiring tomorrow."
   - Even if users don't log into WordPress, they know what's happening.
   - Creates anticipation: "Who mentioned me?"

2. **@mention Notification Feed**
   - A dedicated "Notifications" panel showing all recent @mentions, not just admin notices.
   - Let users catch up on mentions they missed.

3. **Team Engagement Leaderboard**
   - "Most active pinners this week: Jane (12 notes), Bob (8 notes), You (3 notes)."
   - Light gamification. Creates awareness of team dynamics.

4. **Note Threading**
   - Let users reply to notes, not just read them.
   - Turns one-way broadcasting into two-way conversation.
   - Increases time-in-product.

**Retention Potential: 7/10** (if threading and activity feed shipped)

---

### 4. Great Minds Plugin

**The Promise:** Automated multi-agent product development.

**Current Retention Mechanism:** Pipeline output (new projects create new deliverables)

**Why Users Would Leave:**
- If the pipeline fails repeatedly, users lose trust.
- If the memory system doesn't improve outputs over time, users feel like they're managing a dumb tool.
- If there's no visibility into what agents are doing, it feels like a black box.

**What Would Bring Them Back:**

1. **Project Progress Notifications**
   - "Hindsight has moved from DEBATE to BUILD. 3 tasks in progress."
   - Let users know the pipeline is alive without requiring them to check.

2. **Agent Performance Report**
   - "This month: Margaret blocked 3 critical bugs before shipping. Steve and Elon agreed on 12 of 15 debates."
   - Makes the agents feel like characters users care about.

3. **Memory Insights**
   - "Great Minds remembered to avoid `throw new Response()` on your last project, preventing 45 bugs."
   - Show users the system is learning.
   - Creates appreciation for the accumulated intelligence.

4. **Retrospective Digest**
   - After each project, send a summary: "What went well, what we learned, what we'll do differently."
   - This is the "season finale" moment. It gives closure and sets up the next project.

**Retention Potential: 6/10** (developer audience; retention is project-driven)

---

### 5. Shipyard AI

**The Promise:** PRD in, production site out.

**Current Retention Mechanism:** Project-based engagement (one-off)

**Why Users Would Leave:**
- If the project completes and there's no reason to return, users leave.
- If clients have to chase for updates, they feel neglected.
- If there's no ongoing relationship, Shipyard is a vendor, not a partner.

**What Would Bring Them Back:**

1. **Post-Launch Weekly Check-In (EMAIL)**
   - "Your site has been live for 7 days. 1,247 visitors. 3 form submissions. Here's what you might want to update..."
   - Keeps Shipyard in the client's mind after launch.
   - Opens door for maintenance retainer upsell.

2. **Client Dashboard with Live Metrics**
   - Real-time project status (DEBATE → BUILD → LIVE) during active projects.
   - Post-launch analytics (visitors, conversions, uptime).
   - Reason to log in even after the project ships.

3. **"Your Next Project" Suggestions**
   - "Your site is doing well. Here are 3 enhancements we recommend based on similar clients..."
   - Proactive upselling, but framed as helpful advice.

4. **Quarterly Business Review (FOR RETAINER CLIENTS)**
   - "In Q2, we shipped 3 updates to your site. Here's the impact and what we recommend for Q3."
   - Creates a recurring touchpoint that feels valuable, not salesy.

**Retention Potential: 7/10** (if retainers and dashboard shipped)

---

## Cross-Product Retention Patterns

### Pattern 1: Email Is Underutilized
Only Pinned has @mention emails. LocalGenius, Dash, and Shipyard don't send regular emails. **Email is the most reliable re-engagement channel.** Users who don't open your app might open your email.

**Recommendation:** Every product should send a weekly digest email summarizing activity, insights, or suggestions.

### Pattern 2: No Product Creates FOMO
None of these products make users feel like they're missing out by not using them. There's no "What happened while I was away?" moment.

**Recommendation:** Build activity feeds that show what's happened recently. This creates curiosity and pulls users back.

### Pattern 3: The "Season" Metaphor
Great TV shows have seasons with clear arcs. Products can too:
- **Episode:** Each use session
- **Season:** A project or month of use
- **Finale:** Retrospective, summary, achievement unlocked

**Recommendation:** Build "season recaps" into every product. At the end of a project or month, send a summary of what happened, what was achieved, and what's coming next.

---

## Top Recommendations

### 1. Ship the LocalGenius Weekly Digest (CRITICAL)
This single feature is the primary retention mechanism for LocalGenius. Without it, users have no reason to think about the product between customer interactions. It should include: questions answered, reviews received, engagement benchmarks, and personalized recommendations.

### 2. Add Email Summaries to Every Product
- **Dash:** Weekly "Your WordPress Shortcuts" email
- **Pinned:** Daily "Team Activity" email
- **Great Minds:** Per-project "Phase Complete" notification
- **Shipyard:** Weekly "Your Site This Week" email (post-launch)

### 3. Build the Shipyard Client Dashboard
Clients should be able to log in and see:
- Project status (during active builds)
- Site analytics (after launch)
- Recommendations for improvements
- Easy "Start New Project" flow

This creates ongoing engagement beyond the initial project.

### 4. Add Note Threading to Pinned
Turn one-way notes into conversations. This dramatically increases time-in-product and creates social dynamics that pull users back ("Did anyone respond to my note?").

---

## The Bigger Retention Question

**What story are you telling users?**

Right now, these products are tools. Tools get used and set aside. Stories create anticipation.

LocalGenius could tell the story: "Watch your business grow week by week."
Shipyard could tell the story: "Your digital presence, continuously improved."
Pinned could tell the story: "Your team, always in sync."

The retention features I'm recommending are really just **chapter markers in a longer narrative.** Weekly digests, progress updates, retrospectives—these are the "Previously on..." segments that keep users engaged.

**My challenge to the team:** Don't ask "How do we get users back?" Ask "What story are we inviting them into?"

---

*Shonda Rhimes*
*IMPROVE Cycle 2026-04-14*
