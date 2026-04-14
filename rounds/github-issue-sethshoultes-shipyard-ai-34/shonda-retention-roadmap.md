# Retention Roadmap: Beacon v1.1
**Author:** Shonda Rhimes (Narrative & Retention Advisor)
**Date:** 2026-04-14
**Purpose:** What keeps users coming back after the first 60 seconds

---

## The Problem: Beacon is a One-Act Play

**Current user journey:**
1. Install plugin
2. See red/yellow/green scores
3. Fix title lengths, add descriptions, upload OG images
4. Score turns green
5. **Never return**

**Why this fails:**
Users finish Act I (setup), feel mild relief, then abandon the theater.

SEO isn't a one-time fix. It's ongoing anxiety. Beacon treats it as a checklist. Checklists get completed and forgotten.

**Core insight:** Retention requires recurring tension. Users must wonder "what happens next?"

---

## What Keeps Users Coming Back: The 4 Retention Pillars

### Pillar 1: **Persistent Tension**
Create anxiety that never fully resolves.

**Why it works:**
- Humans return to unresolved stories
- "Everything is perfect" = no reason to check back
- "One thing needs attention" = curiosity + urgency

**Current state:** Score goes green → silence → user forgets plugin exists

**v1.1 solution:** Score always has room to improve OR new issues emerge over time

### Pillar 2: **Social Comparison**
Show user where they stand vs. others.

**Why it works:**
- Competitive ego (stay ahead)
- Aspiration (reach top 10%)
- Fear of falling behind (monthly ranking shifts)

**Current state:** User's score exists in vacuum (78/100 = good? bad? average?)

**v1.1 solution:** Contextual benchmarks make scores meaningful

### Pillar 3: **Discovery Loops**
Teach user something new each visit.

**Why it works:**
- Curiosity brings users back ("What will I learn today?")
- Educational value = higher perceived worth
- Pattern recognition = user feels smarter over time

**Current state:** Static audit. Same 12 issues every visit until fixed.

**v1.1 solution:** Dynamic insights that evolve as user improves

### Pillar 4: **Identity Reinforcement**
Let user become the person they want to be.

**Why it works:**
- "I'm the kind of person who has perfect SEO" = identity
- Shareable wins = social proof = deeper commitment
- Progress visualization = pride in improvement

**Current state:** Scores are private, progress is invisible, wins aren't celebrated

**v1.1 solution:** Make improvement visible and shareable

---

## v1.1 Feature Roadmap (Retention-First)

### Feature 1: **SEO Health Pulse** (Persistent Tension)
**What:** Weekly email digest of site SEO health

**User receives:**
- Subject: "Your SEO score changed: 78 → 82" (creates curiosity)
- New issues found: "3 new pages missing meta descriptions"
- Resolved issues: "You fixed 5 issues this week. Nice."
- One insight: "Pages with FAQ schema get 2x more clicks. You have 0 FAQs."

**Why it creates retention:**
- User expects weekly email (habit formation)
- Score changes create tension (must check dashboard)
- New issues emerge even after "completion" (never fully done)
- Insights teach patterns (ongoing education)

**Implementation:**
- Cron job: runs weekly SEO audit
- Email template: plain text, NPR-at-6am tone
- Opt-out available (but default opt-in)

**Success metric:** 40%+ users click through to dashboard from email

---

### Feature 2: **Beacon Benchmarks** (Social Comparison)
**What:** Anonymous comparison to similar sites

**Dashboard shows:**
- "Your score: 78/100"
- "Category average (dental practices): 62/100"
- "You're in the top 15% of dental sites"
- "Top performer in your category: 94/100"

**Monthly ranking shifts:**
- "Last month: Top 18%. This month: Top 15%. ↑"
- "You moved up 3 spots this month"
- "5 new sites in your category. 2 score higher than you."

**Why it creates retention:**
- Competition (user wants to stay ahead)
- Aspiration (reaching top 10% becomes goal)
- Fear of regression (monthly check to ensure rank holds)

**Implementation:**
- Aggregate anonymous data across all Beacon sites
- Categorize by industry (dental, legal, e-commerce, etc.)
- Monthly recalculation of percentiles
- Privacy: never show specific competitor names

**Success metric:** Users with benchmarks visible return 2x more than users without

---

### Feature 3: **Pattern Recognition Engine** (Discovery Loops)
**What:** Teach user what works, not just what's broken

**Current:** "Title too short" (tells user what's wrong)
**v1.1:** "Pages with questions in titles get 35% more clicks. Try: 'What is the best dental implant?' instead of 'Dental Implants'" (tells user what works)

**Monthly rotating insights:**
- Week 1: "Pages with images load 2s faster and rank higher. You're missing images on 8 pages."
- Week 2: "Your blog posts average 300 words. Posts above 800 words get 3x more backlinks."
- Week 3: "You never link to your 'About' page. Internal linking boosts page authority."
- Week 4: "Your site has 0 video embeds. Pages with video have 50% longer session time."

**Why it creates retention:**
- Curiosity ("What will I learn this week?")
- Actionable insights (user can immediately improve)
- Education (user becomes SEO-literate over time)
- Discovery (always something new to optimize)

**Implementation:**
- Content bank of 50+ SEO insights
- Rotate based on user's current gaps
- Prioritize insights user can act on immediately
- Link to quick-fix actions in dashboard

**Success metric:** 30%+ users act on monthly insight (click suggested page, add image, etc.)

---

### Feature 4: **Beacon Badge & Progress Graph** (Identity Reinforcement)
**What:** Make improvement visible and shareable

**Dashboard additions:**
- **Progress graph:** Score over time (Jan: 45 → Apr: 78)
- **Milestone badges:** "First Green Score," "10 Pages Optimized," "30-Day Streak"
- **Shareable card:** Twitter/LinkedIn image: "I improved my SEO score from 45 to 78 with Beacon" + graph

**Example share card:**
```
┌─────────────────────────────────┐
│  SEO Score Progress             │
│                                 │
│  Jan ────────────── Apr         │
│   45  ████████████  78          │
│                                 │
│  "12 issues fixed in 90 days"   │
│  — Powered by Beacon            │
└─────────────────────────────────┘
```

**Why it creates retention:**
- Progress visualization (user sees improvement, wants to continue trend)
- Gamification (badges create micro-goals)
- Social proof (sharing wins = commitment + evangelism)
- Identity ("I'm the kind of business owner who cares about SEO")

**Implementation:**
- Time-series score storage (track weekly snapshots)
- Badge logic (10 pages = bronze, 50 pages = silver, 100 = gold)
- Share card generator (canvas API, OG image output)
- One-click sharing to Twitter, LinkedIn

**Success metric:** 10%+ users share progress card publicly

---

### Feature 5: **"Check-In" Notifications** (Persistent Tension)
**What:** Proactive alerts when action needed

**User receives notifications when:**
- Score drops 10+ points ("Your homepage score dropped from 85 to 72. New issue detected.")
- New page published without metadata ("New page detected: '/services/invisalign' — missing title and description")
- Competitor insight ("3 sites in your area now rank higher for 'dentist near me'")
- Milestone reached ("Congrats! All pages now green. You're in top 5% of dental sites.")

**Notification channels:**
- Email (weekly digest)
- Dashboard badge (red dot on Beacon icon)
- Optional: Slack integration, browser push

**Why it creates retention:**
- Urgency (score drop = must investigate)
- Fear of regression (user worked hard to reach green, doesn't want to lose it)
- Celebration (milestones reward continued engagement)
- Proactive (Beacon reaches out, user doesn't need to remember to check)

**Implementation:**
- Background job: weekly score comparison
- Notification system: queue alerts, send via email or webhook
- User settings: control frequency (daily/weekly/monthly)

**Success metric:** 50%+ users click notification within 24 hours

---

### Feature 6: **Content Suggestions** (Discovery Loops)
**What:** Show user what content to create, not just how to optimize existing pages

**Dashboard section: "Opportunities"**
- "You rank #8 for 'dental implants seattle.' Add a case study page to reach #5."
- "Competitor ranks for 'teeth whitening cost' but you don't. Write a pricing guide."
- "Your blog has 0 posts about 'dental insurance.' High-search, low-competition topic."
- "Pages with before/after images get 40% more engagement. You have 0."

**Why it creates retention:**
- Endless optimization (always new content to create)
- Competitive edge (outrank competitors = ongoing battle)
- Revenue tie-in (better ranking = more leads = more money)
- Aspirational (user sees path from #8 to #1)

**Implementation:**
- API integration: Google Search Console (see current rankings)
- Competitor analysis: scrape top 5 competitors' page titles
- Gap detection: keywords competitors rank for, user doesn't
- Recommendation engine: suggest content type (blog, FAQ, case study)

**Success metric:** 20%+ users create new content based on suggestion within 30 days

---

## v1.1 Retention Metrics (90-Day Goals)

### Baseline (v1.0 — current state):
- **DAU/MAU ratio:** ~5% (user checks once during setup, never returns)
- **Weekly active users:** <10% (only those publishing new pages)
- **Return visits in first 30 days:** 1.2 average
- **Time to abandonment:** 15 days (user fixes issues, forgets plugin)

### v1.1 Targets (with retention features):
- **DAU/MAU ratio:** 25% (user checks 7-8x per month)
- **Weekly active users:** 40% (driven by weekly health pulse emails)
- **Return visits in first 30 days:** 8+ average (2x per week)
- **Time to abandonment:** 120+ days (ongoing value via insights, benchmarks, notifications)

### Leading Indicators (30-day tracking):
- Email open rate: 35%+ (health pulse emails)
- Email click-through: 20%+ (users return to dashboard from email)
- Benchmark view rate: 60%+ (users check ranking vs. category)
- Insight action rate: 25%+ (users act on monthly content suggestion)
- Share rate: 10%+ (users share progress card publicly)
- Notification response: 50%+ (users click score drop alerts within 24hr)

---

## Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
**Goal:** Enable time-series tracking and notification infrastructure

- [ ] Store weekly score snapshots (enable progress graphs)
- [ ] Build notification queue system (email + dashboard badges)
- [ ] Implement health pulse weekly email
- [ ] Add basic progress graph to dashboard

**Rationale:** Without time-series data, no retention features work. Build foundation first.

### Phase 2: Persistent Tension (Weeks 5-8)
**Goal:** Give users reason to return weekly

- [ ] Launch SEO Health Pulse (weekly email)
- [ ] Add dashboard notification badges
- [ ] Implement score change alerts
- [ ] Add "new page detected" notifications

**Rationale:** Emails pull users back. Notifications create urgency. Tension drives retention.

### Phase 3: Social Comparison (Weeks 9-12)
**Goal:** Add competitive context to scores

- [ ] Aggregate anonymous cross-site data
- [ ] Build category classification (dental, legal, e-commerce)
- [ ] Add benchmark widget to dashboard
- [ ] Implement monthly ranking updates

**Rationale:** Scores become meaningful with context. Competition drives ongoing engagement.

### Phase 4: Discovery & Identity (Weeks 13-16)
**Goal:** Educate users and celebrate progress

- [ ] Build content bank of 50+ SEO insights
- [ ] Implement rotating monthly insight system
- [ ] Add milestone badges (bronze/silver/gold)
- [ ] Build shareable progress card generator
- [ ] Add one-click social sharing

**Rationale:** Education extends value. Sharing creates evangelism. Identity drives long-term retention.

### Phase 5: Content Suggestions (Weeks 17-20)
**Goal:** Give users endless optimization opportunities

- [ ] Integrate Google Search Console API
- [ ] Build competitor gap analysis
- [ ] Implement content suggestion engine
- [ ] Add "Opportunities" dashboard section

**Rationale:** Never run out of things to improve = never abandon tool.

---

## Success Criteria: When to Declare Victory

**v1.1 succeeds if (90 days post-launch):**

1. **Retention:** 40%+ weekly active users (vs. <10% baseline)
2. **Engagement:** 8+ return visits in first 30 days (vs. 1.2 baseline)
3. **Virality:** 10%+ users share progress publicly (creates acquisition loop)
4. **Revenue:** Users willing to pay $29-49/month for retention features (validates monetization)
5. **NPS:** 50+ (users actively recommend to peers)

**v1.1 fails if (90 days post-launch):**

1. **Retention:** <20% weekly active users (features didn't create habit)
2. **Engagement:** Email open rates <20% (users ignore notifications)
3. **Virality:** <3% sharing rate (no word-of-mouth)
4. **Revenue:** Users unwilling to pay for insights/benchmarks (features not valuable enough)
5. **NPS:** <20 (users lukewarm or negative)

---

## Narrative Arc: v1.0 vs. v1.1

### v1.0 Journey (One-Act Play):
1. **Setup:** User installs, sees dashboard, red dots everywhere
2. **Conflict:** Fix title lengths, add descriptions, upload images
3. **Resolution:** Score turns green
4. **END:** User leaves, never returns

**Problem:** No Act II. No ongoing story. No reason to return.

---

### v1.1 Journey (Three-Act Structure):

#### Act I: Discovery (Weeks 1-2)
1. User installs, sees dashboard, score is 45/100 (red)
2. Beacon shows: "Category average: 62. You're below average. Top 10%: 85+."
3. User feels competitive urgency
4. Fixes 12 issues in one session, score jumps to 68/100 (yellow)
5. Dashboard celebrates: "You're now average! 15 more points to reach top 25%."
6. User feels progress, but not done yet

#### Act II: Optimization (Weeks 3-8)
7. Weekly health pulse email: "Your score: 68 → 71. 3 new pages need attention."
8. User returns, fixes new issues
9. Monthly insight: "Pages with FAQ schema get 2x clicks. You have 0 FAQs."
10. User adds FAQ page, score jumps to 78
11. Beacon alerts: "Milestone! Top 25% of dental sites. 7 more points to reach top 10%."
12. User shares progress card on LinkedIn: "Improved SEO from 45 to 78 in 6 weeks with Beacon"
13. Peer comments: "How did you do that?" (social proof loop)

#### Act III: Mastery (Weeks 9+)
14. User reaches 85/100 (top 10%), feels pride
15. Weekly email: "Your ranking dropped 2 spots. New competitor entered your area."
16. User feels threatened, returns to investigate
17. Beacon suggests: "Competitor has 10 blog posts. You have 2. Write about 'dental insurance accepted.'"
18. User creates content, ranking recovers
19. Monthly benchmark: "You maintained top 10% for 3 consecutive months. Elite status."
20. User identity shifts: "I'm the kind of business owner who stays on top of SEO."
21. **Ongoing:** Never fully "done." Always new insights, new competitors, new milestones.

**Why this works:**
- Persistent tension (competition, score changes, new issues)
- Recurring stakes (can lose ranking, must maintain top 10%)
- Identity payoff (elite status, shareable wins)
- No final resolution (ongoing optimization journey)

---

## The Retention Hook Checklist

Use this framework to evaluate any feature: does it create retention?

### ✅ **Strong Retention Hook:**
- [ ] Creates ongoing tension (user worries about regression)
- [ ] Delivers new information each visit (not static)
- [ ] Enables social comparison (user sees where they stand)
- [ ] Reinforces identity ("I'm someone who cares about SEO")
- [ ] Triggers proactive notifications (Beacon reaches out, user doesn't need to remember)

### ❌ **Weak Retention Hook:**
- [ ] One-time completion (checklist done = user leaves)
- [ ] Static information (same data every visit)
- [ ] No social context (score exists in vacuum)
- [ ] No identity tie-in (user doesn't see themselves as "SEO person")
- [ ] Requires user to remember to check (no proactive alerts)

**Apply this checklist to every v1.1 feature.** If it doesn't pass 3+ retention checks, don't build it.

---

## Final Thought: Story vs. Checklist

**Checklists end. Stories continue.**

v1.0 Beacon is a checklist. User completes it, feels relief, forgets it exists.

v1.1 Beacon is a story. User enters ongoing narrative of optimization, competition, discovery, and mastery. No final page. Always another chapter.

**That's retention.**

---

**Shonda Rhimes**
Narrative & Retention Advisor
2026-04-14
