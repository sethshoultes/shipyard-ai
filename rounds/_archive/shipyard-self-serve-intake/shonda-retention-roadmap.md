# Retention Roadmap: What Keeps Users Coming Back
**Product:** shipyard-self-serve-intake
**Author:** Shonda Rhimes, Board Member (Narrative & Retention)
**Date:** 2026-04-16

---

## Current State: 0% Retention Potential

**Why users don't return:**
- No visible product to interact with
- Submit issue → silence
- No status updates
- No PRD delivery
- No completion notification
- No reason to check back

**Users experience:** One-time interaction that ends in a void.

---

## The Retention Equation

**Users return when:**
1. **Progress creates curiosity** - "What's happening with my request?"
2. **Value is delivered predictably** - "I know I'll get my PRD"
3. **Status creates FOMO** - "Did others' requests ship faster?"
4. **Achievements unlock** - "I've submitted 10 requests this month"
5. **Community creates belonging** - "I'm part of the intake community"

**Currently delivering:** None of the above.

---

## v1.0 → v1.1 Retention Transformation

### Phase 1: Close the Loop (Week 1-2)
**Goal:** Give users a reason to return within 24 hours of first use.

#### Feature 1.1.1: Real-Time Status Updates
**What it does:**
- Bot comments on GitHub issue with status updates
- Progress indicators: Received → Analyzing → Generating PRD → Complete
- Estimated time remaining visible

**User psychology:**
- Creates **anticipation** - "My PRD is being generated!"
- Establishes **reliability** - "This bot actually does something"
- Triggers **return visit** - "Let me check if it's ready"

**Implementation:**
```typescript
// Status update progression
const statusUpdates = [
  { stage: 'received', emoji: '✅', message: 'Request received! Analyzing priority...', eta: '~5 min' },
  { stage: 'analyzing', emoji: '🔍', message: 'Priority detected: P1. Extracting requirements...', eta: '~3 min' },
  { stage: 'generating', emoji: '⚙️', message: 'Generating PRD from your request...', eta: '~2 min' },
  { stage: 'complete', emoji: '🎉', message: 'Your PRD is ready! See details below.', eta: 'now' }
]
```

**Retention hook:** Users check back to see progress updates.

**Success metric:** 60%+ of users return to issue within 24 hours of submission.

---

#### Feature 1.1.2: PRD Delivery Moment
**What it does:**
- Formatted PRD posted as GitHub issue comment
- Tagged with summary stats: "Generated in 7 minutes, 847 words, P1 priority"
- Call-to-action: "Ready to implement? Click here to convert to project"

**User psychology:**
- **Payoff moment** - "I got value!"
- **Shareability** - "Look what this tool made for me"
- **Completion dopamine** - Request → PRD cycle complete

**Format:**
```markdown
## 📋 Your PRD is Ready!

**Request:** [Original issue title]
**Priority:** P1 (High Impact, Time-Sensitive)
**Generated in:** 8 minutes, 23 seconds
**Confidence:** 92%

---

### Executive Summary
[AI-generated summary]

### User Stories
[Extracted user stories]

### Technical Requirements
[Parsed technical specs]

### Success Metrics
[Suggested KPIs]

---

💡 **Next Steps:**
- [ ] Review PRD accuracy
- [ ] Convert to Linear/Jira project
- [ ] Share with your team

📊 **Was this PRD helpful?** 👍 Yes | 👎 No (helps us improve!)
```

**Retention hook:** Users return to see finished PRD.

**Success metric:** 80%+ of users read the PRD comment.

---

#### Feature 1.1.3: Notification System
**What it does:**
- Email notification when PRD is ready
- GitHub notification (native)
- Optional: Slack/Discord webhook

**User psychology:**
- **Pull users back** even if they forgot about request
- **Builds habit** - "I'll get notified when it's done"
- **Reduces anxiety** - "I don't need to constantly check"

**Email template:**
```
Subject: 🎉 Your PRD is ready: [Issue title]

Hi [username],

Your PRD for "[issue title]" has been generated!

Priority: P1 (High Impact)
Generated in: 8 minutes
Confidence: 92%

View your PRD: [link to GitHub issue]

[PRD summary preview - 3 sentences]

Ready to implement? Convert to project →

---
Shipyard Intake Bot
Unsubscribe | Settings
```

**Retention hook:** Email brings users back to product.

**Success metric:** 50%+ email open rate within 6 hours of send.

---

### Phase 2: Build the Habit (Week 3-4)
**Goal:** Transform one-time users into repeat users.

#### Feature 1.1.4: Personal Dashboard
**What it does:**
- Web page showing all user's intake requests
- Status overview: Pending, In Progress, Complete
- Historical PRDs with search/filter
- Aggregate stats: Total requests, avg turnaround time, priority breakdown

**URL:** `https://intake.shipyard.dev/@username`

**Dashboard layout:**
```
═══════════════════════════════════════════════════
Your Intake Requests                    @username
═══════════════════════════════════════════════════

📊 Stats at a Glance
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 12 Total    │ 2 Pending   │ 1 Active    │ 9 Complete  │
└─────────────┴─────────────┴─────────────┴─────────────┘

Avg Response Time: 6.3 minutes
Accuracy Rating: 4.7/5.0 ⭐

═══════════════════════════════════════════════════
Active Requests (3)
═══════════════════════════════════════════════════

🔴 P0 | Add user authentication          ⚙️ Generating PRD (2 min left)
🟡 P1 | Fix mobile layout bug            🔍 Analyzing (5 min left)
🟢 P2 | Update documentation             ✅ Received (queued)

═══════════════════════════════════════════════════
Recent PRDs (9)
═══════════════════════════════════════════════════

✅ Add dark mode toggle                 P1 | Completed 2 days ago
✅ Optimize database queries            P0 | Completed 5 days ago
✅ Implement email notifications        P1 | Completed 1 week ago

[View all →]
```

**User psychology:**
- **Status visibility** reduces anxiety
- **Historical view** creates accumulation feeling ("Look how much I've done!")
- **Stats** create mini-achievements
- **Centralized hub** makes intake "a place I go"

**Retention hook:** Users bookmark dashboard, check daily for status updates.

**Success metric:** 30%+ of users visit dashboard 3+ times per week.

---

#### Feature 1.1.5: Request Templates
**What it does:**
- Pre-built templates for common request types
- One-click submission for standard use cases
- Template gallery: Bug Report, Feature Request, Documentation Update, Performance Issue, Security Concern

**Why it drives retention:**
- **Reduces friction** for repeat use
- **Teaches best practices** (well-formatted requests get better PRDs)
- **Encourages bulk submission** ("I have 5 bugs to report")

**Template example (Bug Report):**
```markdown
## Bug Report Template

**What's broken?**
[One-sentence description]

**How to reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Impact:**
- [ ] Critical (app is down)
- [ ] High (core feature broken)
- [ ] Medium (workaround exists)
- [ ] Low (minor inconvenience)

**Screenshots/logs:**
[Attach here]

---
🤖 This template helps us generate better PRDs faster!
```

**Retention hook:** Users return to submit more requests using templates.

**Success metric:** 40%+ of repeat users use templates for submissions.

---

### Phase 3: Create the Community (Week 5-8)
**Goal:** Turn individuals into a community that reinforces usage.

#### Feature 1.1.6: Public Showcase
**What it does:**
- Opt-in gallery of best PRDs generated
- Anonymized or attributed (user choice)
- Upvoting/liking system
- "PRD of the Week" spotlight

**URL:** `https://intake.shipyard.dev/showcase`

**Why it drives retention:**
- **Social proof** - "Other people are getting value"
- **Inspiration** - "I could request that too!"
- **Recognition** - "My PRD got featured!"
- **Competition** - "I want to submit better requests"

**Showcase layout:**
```
═══════════════════════════════════════════════════
PRD Showcase                    🏆 Top PRDs this week
═══════════════════════════════════════════════════

⭐ Featured PRD

"AI-Powered Code Review Bot"
by @sarah_dev | 342 👍 | P0 Priority

[PRD preview - first 200 words]

💬 "This PRD saved our team 2 weeks of spec writing!" - @sarah_dev

[View full PRD →]

═══════════════════════════════════════════════════

Trending This Week

🥇 Real-time Collaboration Features       @alex | 287 👍
🥈 Mobile App Performance Optimization    @jordan | 213 👍
🥉 Advanced Search with Filters           @casey | 198 👍

[See all →]
```

**Retention hook:** Users return to see what others are building, get inspired for new requests.

**Success metric:** 20%+ of users visit showcase weekly.

---

#### Feature 1.1.7: Gamification & Achievements
**What it does:**
- Badges for milestones: First Request, 10 Requests, 50 Requests
- Streak tracking: "7-day request streak!"
- Leaderboard (optional): Most requests, highest accuracy ratings
- Unlockable perks: Priority processing for power users

**Achievement examples:**
```
🎖️ Badges You've Earned

✅ First Steps          Submitted your first request
✅ Getting the Hang     10 requests submitted
✅ Power User           50 requests submitted
✅ Quality Control      5 requests rated "Very Helpful"
✅ Early Adopter        Joined in first month
🔒 Team Player          Invite 3 teammates (locked)
🔒 Perfectionist        10 requests with 100% accuracy (locked)
```

**User psychology:**
- **Progress visibility** creates satisfaction
- **Unlockables** create curiosity ("What's next?")
- **Streaks** create commitment ("Don't break the chain!")
- **Status** creates prestige among peers

**Retention hook:** Users return to maintain streaks, unlock achievements.

**Success metric:** 25%+ of users engage with achievements system.

---

#### Feature 1.1.8: Team Collaboration Features
**What it does:**
- Team workspaces: Shared request queue for organizations
- @mention teammates in PRD comments
- Collaborative PRD editing/refinement
- Team stats dashboard: "Your team submitted 47 requests this month"

**Why it drives retention:**
- **Social accountability** - "Team is expecting me to review PRDs"
- **Network effects** - More team members = more activity
- **Shared goals** - "Let's hit 100 requests as a team"
- **Reduces isolation** - Intake becomes team activity, not solo task

**Team dashboard snippet:**
```
═══════════════════════════════════════════════════
Team Dashboard                      @engineering-team
═══════════════════════════════════════════════════

👥 Team Activity (Last 30 Days)

📊 47 Requests Submitted
⚡ 6.2 min avg response time
🎯 12 PRDs shipped to production
⭐ 4.8/5.0 team satisfaction

Top Contributors:
1. @sarah (12 requests)
2. @alex (9 requests)
3. @jordan (8 requests)

═══════════════════════════════════════════════════
```

**Retention hook:** Team creates social pressure and collaboration loops.

**Success metric:** Teams with 3+ members have 4x retention vs solo users.

---

### Phase 4: Long-Term Stickiness (Month 2-3)
**Goal:** Make the product indispensable to workflow.

#### Feature 1.1.9: Workflow Integrations
**What it does:**
- Export PRD to Linear/Jira/Asana with one click
- Sync priority changes back to intake system
- Close loop: Track "Was this PRD implemented?" status
- Analytics: "37% of your PRDs shipped within 2 weeks"

**Integration flow:**
```
Intake Request → PRD Generated → Export to Linear → Track Implementation

User sees:
✅ Request submitted
✅ PRD generated (8 min)
✅ Exported to Linear (Project #234)
🔄 In Development (3 days in progress)
✅ Shipped to Production (Completed 2 weeks later)

💡 "This feature request went from idea to production in 17 days!"
```

**User psychology:**
- **Closure loop** - See ideas become reality
- **Accountability** - Track what actually ships
- **Validation** - "My requests matter and get built"
- **Indispensability** - Intake becomes start of workflow, not standalone tool

**Retention hook:** Users return to track implementation status of their PRDs.

**Success metric:** 50%+ of PRDs exported to project management tools.

---

#### Feature 1.1.10: AI Learning Feedback Loop
**What it does:**
- After PRD delivered, ask: "Was this accurate?" (👍/👎)
- Collect corrections: "What should we have caught?"
- Show improvement over time: "Our accuracy for your requests: 78% → 94%"
- Personalization: System learns your team's priorities and language

**Feedback interface:**
```
═══════════════════════════════════════════════════
Help Us Improve! ✨
═══════════════════════════════════════════════════

Was this PRD helpful for: "Add dark mode toggle"?

😍 Very helpful - used it as-is
👍 Helpful - needed minor edits
👎 Not helpful - had to rewrite
😞 Not helpful at all

What could we improve?
┌─────────────────────────────────────────────────┐
│ [Text box for detailed feedback]                │
└─────────────────────────────────────────────────┘

[Submit Feedback]

═══════════════════════════════════════════════════
📊 Your Impact: 23 pieces of feedback have improved
our accuracy for your team by 12% this month!
═══════════════════════════════════════════════════
```

**User psychology:**
- **Agency** - "My feedback shapes the product"
- **Visible impact** - "I helped make this better"
- **Personalization** - "It's learning MY preferences"
- **Investment** - "I've trained this system; I won't switch"

**Retention hook:** Users invested in improving the product become sticky users.

**Success metric:** 60%+ of users provide feedback on at least one PRD.

---

#### Feature 1.1.11: Weekly Digest Email
**What it does:**
- Automated weekly summary of activity
- Stats: Requests submitted, PRDs generated, items shipped
- Highlights: "Your most-liked PRD this week"
- Suggestions: "3 teammates haven't submitted requests yet - invite them?"

**Email template:**
```
Subject: 📊 Your Shipyard Intake Week in Review

Hi @username,

Here's what you accomplished this week with Shipyard Intake:

🎯 This Week's Activity
├─ 4 Requests Submitted
├─ 4 PRDs Generated (avg 7.2 min)
├─ 2 PRDs Exported to Linear
└─ 1 Feature Shipped to Production! 🎉

✨ Highlight
Your PRD "Real-time Notifications" received 47 👍 and
was featured in this week's showcase!

📈 Progress
You've submitted 23 requests total
+12% accuracy improvement this month
You're on a 5-week submission streak! 🔥

👥 Team Update
Your team submitted 19 requests this week
@alex just earned "Power User" badge
Team avg response time: 6.1 min (faster than 84% of teams)

[View Full Dashboard →]

See you next week!
Shipyard Intake Team
```

**User psychology:**
- **Progress visibility** - "I accomplished things"
- **Habit reinforcement** - Weekly reminder
- **Social comparison** - "How's my team doing?"
- **Streaks** - "Don't want to break my streak"

**Retention hook:** Weekly email brings lapsed users back.

**Success metric:** 40%+ open rate, 15%+ click-through to dashboard.

---

## Retention Funnel: v1.0 → v1.1

### Current (v1.0): Linear Drop-Off
```
100% - Submit issue
  0% - See acknowledgment (doesn't exist)
  0% - Check status (nothing to check)
  0% - Receive PRD (not delivered)
  0% - Return next week (no reason to)
```

**Retention rate: 0%**

---

### Target (v1.1): Compounding Engagement
```
100% - Submit first request
 95% - Receive real-time status update (Feature 1.1.1)
 85% - See PRD delivered (Feature 1.1.2)
 70% - Get email notification (Feature 1.1.3)
 60% - Visit personal dashboard (Feature 1.1.4)
 40% - Submit second request within 7 days (Features 1.1.5)
 30% - Visit showcase for inspiration (Feature 1.1.6)
 25% - Earn first achievement (Feature 1.1.7)
 20% - Invite teammate (Feature 1.1.8)
 15% - Export PRD to Linear/Jira (Feature 1.1.9)
 40% - Provide feedback on PRD (Feature 1.1.10)
 35% - Return following week (all features combined)
```

**7-day retention rate: 35%+**
**30-day retention rate: 20%+**

---

## Priority Roadmap: What to Build First

### Sprint 1 (Week 1-2): Close the Loop
**Ship these together** - they create the minimum viable retention loop:
1. ✅ Feature 1.1.1 - Real-time status updates
2. ✅ Feature 1.1.2 - PRD delivery moment
3. ✅ Feature 1.1.3 - Notification system

**Why:** Users MUST see output to return. These are table stakes.

**Success gate:** 60%+ users return within 24 hours to see their PRD.

---

### Sprint 2 (Week 3-4): Build the Habit
**Ship these to create repeat usage:**
4. ✅ Feature 1.1.4 - Personal dashboard
5. ✅ Feature 1.1.5 - Request templates

**Why:** Make second/third/nth submission easier than first.

**Success gate:** 40%+ users submit 2+ requests in first 30 days.

---

### Sprint 3 (Week 5-6): Add Community Layer
**Ship these to create social reinforcement:**
6. ✅ Feature 1.1.6 - Public showcase
7. ✅ Feature 1.1.7 - Gamification & achievements

**Why:** Transform individual tool usage into community participation.

**Success gate:** 25%+ users engage with showcase or achievements.

---

### Sprint 4 (Week 7-8): Enable Teams
**Ship this to unlock network effects:**
8. ✅ Feature 1.1.8 - Team collaboration features

**Why:** Teams retain 4x better than individuals.

**Success gate:** 30%+ of users invite at least one teammate.

---

### Sprint 5 (Week 9-10): Close External Loop
**Ship these to become indispensable:**
9. ✅ Feature 1.1.9 - Workflow integrations
10. ✅ Feature 1.1.10 - AI learning feedback loop

**Why:** Integrate into existing workflow = hard to remove.

**Success gate:** 50%+ of PRDs exported; 60%+ provide feedback.

---

### Sprint 6 (Week 11-12): Automate Re-engagement
**Ship this to win back lapsed users:**
11. ✅ Feature 1.1.11 - Weekly digest email

**Why:** Proactive outreach recovers 20-30% of lapsed users.

**Success gate:** Weekly email drives 15%+ weekly active user increase.

---

## Key Metrics to Track

### Engagement Metrics
- **DAU/MAU ratio** - Target: 40%+ (daily/monthly active users)
- **Requests per user per month** - Target: 5+
- **Time to second request** - Target: <7 days for 40%+ users
- **Dashboard visits per week** - Target: 3+ for 30%+ users

### Retention Cohorts
- **D1 retention** (next day) - Target: 60%+
- **D7 retention** (week 1) - Target: 35%+
- **D30 retention** (month 1) - Target: 20%+
- **D90 retention** (quarter 1) - Target: 15%+

### Quality Signals
- **PRD accuracy rating** - Target: 4.5+/5.0
- **Feedback submission rate** - Target: 60%+
- **Showcase engagement** - Target: 25%+ weekly
- **Achievement unlock rate** - Target: 3+ badges per user

### Viral/Growth Metrics
- **Team invite rate** - Target: 30%+ invite ≥1 person
- **Viral coefficient** - Target: 0.3+ (each user brings 0.3 new users)
- **Showcase shares** - Target: 10%+ of PRDs shared externally
- **Word-of-mouth attribution** - Track via signup surveys

---

## What Success Looks Like (90 Days Post-Launch)

### User Behavior Transformation
**Before v1.1:**
- Submit issue → silence → never return

**After v1.1:**
- Submit issue → get status updates → see PRD → check dashboard → submit another request → invite teammate → provide feedback → check showcase → earn badge → export to Linear → get weekly digest → return next week

**Retention loop is complete.**

---

### User Testimonial (Target)
> "I submit intake requests every Monday morning while planning my sprint. The PRDs are ready before standup. My team uses the showcase for inspiration. We've shipped 12 features that started as intake requests. I can't imagine working without this now."
>
> — Target power user, 90 days post-launch

---

## Anti-Patterns to Avoid

### ❌ Don't Build:
1. **Features users can't see** - All backend, no frontend (current state)
2. **One-time interactions** - No reason to return tomorrow
3. **Isolated experiences** - No social/team elements
4. **Dead-end workflows** - Request → PRD → ... nothing
5. **Invisible progress** - User submits and waits in darkness
6. **Generic PRDs** - No personalization or learning
7. **No feedback loops** - System never improves with use

### ✅ Do Build:
1. **Visible progress** - Users see status in real-time
2. **Completion moments** - Clear payoff (PRD delivered)
3. **Habit formation** - Templates, dashboard, notifications
4. **Social features** - Showcase, teams, achievements
5. **External integration** - Export to Linear/Jira
6. **Learning systems** - Gets better with every use
7. **Proactive re-engagement** - Weekly digests, streak alerts

---

## Final Retention Formula

**Retention = Frequency × Value × Social × Habit**

**Frequency:** How often users have a reason to return
- ✅ Real-time status updates (multiple times per request)
- ✅ Dashboard (daily check-ins)
- ✅ Weekly digest (weekly touchpoint)

**Value:** How much utility users get
- ✅ PRD delivered in <10 min (high value)
- ✅ Export to Linear/Jira (workflow integration)
- ✅ Accuracy improves over time (compounding value)

**Social:** How users engage with others
- ✅ Team workspaces (collaboration)
- ✅ Public showcase (inspiration)
- ✅ Achievements (status/recognition)

**Habit:** How the product becomes automatic
- ✅ Templates (reduce friction)
- ✅ Streaks (commitment device)
- ✅ Email notifications (reminders)

**All four must be present for strong retention.**

---

## Next Steps

1. **Prioritize Sprint 1** (Features 1.1.1-1.1.3) - BLOCKING for any user launch
2. **Instrument analytics** - Set up tracking for all retention metrics
3. **Design feedback loops** - Collect user input from day 1
4. **A/B test messaging** - Optimize notification/email copy for engagement
5. **Build in public** - Share progress on showcase to create early community

**Timeline:** 12-week sprint to transform backend plumbing into sticky product.

**North Star Metric:** 30-day retention rate of 20%+

---

**Remember:** Infrastructure doesn't retain users. Moments do.

Build moments worth returning for.

---

**Signed,**
Shonda Rhimes
Board Member, Great Minds Agency
Date: 2026-04-16
