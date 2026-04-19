# SPARK v1.1: Retention Roadmap
**Author:** Shonda Rhimes
**Date:** 2026-04-19
**Focus:** What Keeps Users Coming Back

---

## The Problem

**Current State:** Install → Works → Forgotten

**User retention after:**
- Day 2: 15% (no reason to check back)
- Week 1: 5% (no progress to track)
- Month 1: <2% (pure utility, no relationship)

**Root cause:** Product is stateless. Users are ghosts. No narrative arc.

---

## The Vision: From Tool to Relationship

**New user journey:**
```
Curious → Delighted → Empowered → Evangelist
```

**Retention philosophy:**
- People don't come back to utilities. They come back to relationships.
- Create reasons to check in daily, weekly, monthly
- Build emotional investment through progress, insight, and belonging

---

## v1.1 Feature Pillars

### Pillar 1: **Daily Dopamine** (Why check today?)
### Pillar 2: **Weekly Wisdom** (What am I learning?)
### Pillar 3: **Monthly Milestones** (What progress have I made?)
### Pillar 4: **Community Connection** (Who else is here?)

---

## Pillar 1: Daily Dopamine

**Goal:** Give users a reason to open SPARK every day.

### Feature 1.1: Daily Recap Email
**What:** End-of-day summary sent at 6pm user's timezone
**Contents:**
- "3 questions today" (pride in usage)
- Top question asked (insight)
- Busiest page (awareness)
- "View full analytics →" CTA

**Why it works:**
- Creates anticipation: "What did my visitors ask today?"
- Surfaces insights without requiring dashboard visit
- Gentle reminder that SPARK is working
- Opens loop: "View full analytics" drives dashboard visit

**Implementation:**
- Cloudflare Durable Objects: track questions per site per day
- Scheduled worker: triggers at 6pm per site owner's timezone
- SendGrid API: templated email
- Unsubscribe option (but track: unsubscribers = churn risk)

---

### Feature 1.2: Real-Time Notification Badge
**What:** Browser notification when visitor asks first question of the day
**Contents:** "🎉 First question today: 'What are your hours?'"

**Why it works:**
- Immediate gratification (see SPARK working in real-time)
- Curiosity loop: "What else are they asking?"
- Drives dashboard visit
- Makes product feel alive

**Implementation:**
- Web Push API (requires user opt-in)
- Cloudflare Worker webhook: first question of day triggers push
- Fallback: Email notification if push not enabled

---

### Feature 1.3: Question Streak Tracker
**What:** Dashboard widget showing consecutive days with questions asked
**Contents:**
- "🔥 7-day streak! Your visitors asked questions every day this week."
- Streaks of 3, 7, 14, 30 days trigger celebration animations

**Why it works:**
- Gamification: users protect streaks (see Duolingo, Snapchat)
- External motivation: "Keep streak alive" = check dashboard
- Pride: "My site is active"
- Social proof: "Share your 30-day streak" CTA

**Implementation:**
- Track question_count per day in KV store
- Dashboard component: calculate streak from last 30 days
- Confetti animation on streak milestones

---

## Pillar 2: Weekly Wisdom

**Goal:** Help users learn something valuable about their visitors every week.

### Feature 2.1: Weekly Insight Email
**What:** Sunday morning email with actionable insights
**Contents:**
- **Top 3 questions this week** (what visitors care about)
- **Unanswered questions** (where site content is lacking)
- **Suggested action:** "12 people asked about pricing. Consider adding FAQ to /pricing page."
- **Comparison:** "This week: 47 questions. Last week: 31 questions. ↑ 52%"

**Why it works:**
- Actionable: tells user what to fix
- Educational: teaches about visitor behavior
- Progress-oriented: shows growth week-over-week
- Creates to-do: "I should update that page"

**Implementation:**
- Aggregate questions per week in Durable Object
- Claude API: analyze questions, identify themes
- Detect unanswered questions: "I don't see that information" responses
- Compare to previous week: calculate % change

---

### Feature 2.2: Auto-Generated FAQ
**What:** Dashboard feature that creates FAQ page from most-asked questions
**Contents:**
- "Export Top 10 Questions" button
- Generates markdown/HTML with questions + AI-generated answers
- One-click copy to clipboard

**Why it works:**
- Immediate value: user gets content for their site
- Shows SPARK's utility beyond widget
- Content flywheel: FAQ page attracts organic traffic
- Reduces future questions: visitors find answers on FAQ

**Implementation:**
- Track question frequency in KV store
- Claude API: generate polished answers for top 10
- Template: render as markdown/HTML
- Clipboard API: one-click copy

---

### Feature 2.3: Confusion Heatmap
**What:** Visual dashboard showing which pages generate most questions
**Contents:**
- Site map with color-coded pages: red = high questions, green = low
- Click page → see specific questions asked
- Insight: "Your /pricing page generated 30% of all questions"

**Why it works:**
- Visual storytelling: heatmap is intuitive
- Surfaces friction: "Why are people confused on /checkout?"
- Drives site improvements: user fixes confusing pages
- Weekly habit: "Let me check the heatmap"

**Implementation:**
- Track page_url per question in KV store
- Dashboard: render site map from scraped pages
- Color-code by question density
- Click-through: show questions per page

---

## Pillar 3: Monthly Milestones

**Goal:** Celebrate progress, unlock new features, create long-term goals.

### Feature 3.1: Achievement System
**What:** Unlock badges for milestones
**Badges:**
- 🎯 **First 10 Questions** (activation milestone)
- 💬 **Conversationalist:** 100 questions answered
- 🔥 **On Fire:** 7-day question streak
- 📈 **Growing:** 50% question increase month-over-month
- 🌟 **Superstar:** 1,000 questions answered
- 💎 **Elite:** 10,000 questions answered

**Why it works:**
- Gamification: users chase next badge
- Social proof: "Share your badge on Twitter" CTA
- Progression: creates sense of leveling up
- Lock-in: "I'm 20 questions from next badge, can't churn now"

**Implementation:**
- Track total questions in user profile
- Dashboard: badge showcase with locked/unlocked states
- Twitter share button with pre-filled text: "Just hit 1,000 questions on @usespark! 🎉"

---

### Feature 3.2: Monthly Report Card
**What:** First day of month email with full analytics
**Contents:**
- Total questions last month
- Top 5 questions
- Most active day/hour
- Question category breakdown (pricing, features, support, etc.)
- YoY comparison: "April 2026 vs April 2025"
- Downloadable PDF report

**Why it works:**
- Comprehensive: satisfies curiosity about full picture
- Professional: PDF is shareable with team/investors
- Nostalgic: "Look how far we've come"
- Anticipatory: "Can't wait to see next month's report"

**Implementation:**
- Durable Object: aggregate monthly stats
- Claude API: categorize questions (pricing, features, etc.)
- PDF generation: Puppeteer or Cloudflare Workers PDF
- Email with attachment

---

### Feature 3.3: Progressive Feature Unlock
**What:** Earn features by hitting milestones (freemium gamification)
**Unlocks:**
- **100 questions:** Custom branding (remove "Powered by SPARK")
- **500 questions:** Multi-page context (not just single-page answers)
- **1,000 questions:** Conversation memory (AI remembers past questions)
- **5,000 questions:** Priority support + early access to new features

**Why it works:**
- Deferred gratification: "Keep using, unlock goodies"
- Feels earned, not bought (pride vs. transaction)
- Reduces churn: "I'm 50 questions from multi-page context"
- Viral: "Check out my custom-branded SPARK widget!"

**Implementation:**
- Track question_count in user profile
- Widget: check unlock status, conditionally render features
- Dashboard: progress bar showing "230/500 to multi-page context"

---

## Pillar 4: Community Connection

**Goal:** Users feel part of something bigger than themselves.

### Feature 4.1: SPARK Showcase
**What:** Public gallery of sites using SPARK
**Contents:**
- Submit your site → featured on spark.ai/showcase
- Filter by industry: e-commerce, SaaS, docs, blogs
- Upvote favorite implementations
- "Featured Site of the Week" spotlight

**Why it works:**
- Social proof: "1,200 sites use SPARK" → FOMO
- Aspiration: "I want my site featured"
- Discovery: users explore creative implementations
- Backlinks: SEO benefit for submitted sites

**Implementation:**
- Submission form: site_url, category, description
- Manual moderation (prevent spam)
- Static site: render showcase as HTML, update weekly
- Upvote: track in KV store, sort by popularity

---

### Feature 4.2: SPARK Community (Slack/Discord)
**What:** Private community for SPARK users
**Channels:**
- #wins: share success stories ("Visitor converted after SPARK answered their question!")
- #questions: troubleshooting, best practices
- #feature-requests: vote on roadmap priorities
- #showcase: share creative implementations
- #analytics: discuss visitor insights

**Why it works:**
- Belonging: "I'm part of the SPARK community"
- Peer learning: see how others use it
- Retention: active community members don't churn
- Feedback loop: feature requests inform roadmap

**Implementation:**
- Slack Community (free tier, <10K members)
- Auto-invite on dashboard signup
- Founder + community manager moderates
- Weekly "Community Highlight" email

---

### Feature 4.3: Leaderboard (Optional, Risky)
**What:** Public ranking of most-active SPARK sites
**Contents:**
- Top 10 sites by questions answered this week
- Top 10 sites by question streak
- Anonymous option: "Site #247" instead of domain

**Why it works:**
- Competition: "We're #3, let's get to #1"
- Recognition: top sites get featured
- Viral: "We're on the SPARK leaderboard!" → social shares

**Why it's risky:**
- Can feel exploitative (gamifying user engagement)
- Winners stay, losers churn (demotivating)
- Privacy concerns (some don't want to be public)

**Mitigation:**
- Make opt-in, not default
- Celebrate "Most Improved" not just "Most Questions"
- Rotate categories: "Best FAQ this week," "Most helpful answer"

---

## Retention Metrics to Track

### Activation (Day 1)
- % users who install widget AND get first question within 24 hours
- Target: 60% (if no questions, widget feels dead)

### Engagement (Day 2-7)
- % users who log into dashboard within 7 days
- % users who open Day 2 email
- Target: 40% dashboard login, 60% email open

### Habit Formation (Week 2-4)
- % users who check dashboard 2+ times per week
- % users with 7-day question streak
- Target: 25% weekly active, 15% streak maintainers

### Long-Term Retention (Month 2+)
- % users active month 2 (vs month 1)
- % users who hit 1,000 question milestone
- Target: 50% M2 retention, 10% hit 1,000 questions

### Leading Indicators of Churn
- No dashboard login in 14 days → 80% churn risk
- Email unsubscribe → 90% churn risk
- Questions drop 50% week-over-week → 70% churn risk
- Zero questions for 7 days → 85% churn risk

**Intervention:**
- Auto-email: "We noticed your questions dropped. Need help?"
- Offer: Free 30-minute consultation to optimize SPARK
- Survey: "What would make SPARK more useful for you?"

---

## v1.1 Roadmap Priority

**Tier 1 (Must Have - Ship in 30 days):**
1. ✅ Daily recap email (easiest, highest impact)
2. ✅ Weekly insight email (actionable, builds habit)
3. ✅ Auto-generated FAQ (immediate value, content flywheel)
4. ✅ Achievement system (gamification, low effort)

**Tier 2 (Should Have - Ship in 60 days):**
5. ✅ Monthly report card (comprehensive, professional)
6. ✅ Confusion heatmap (visual, drives site improvements)
7. ✅ SPARK Showcase (social proof, virality)
8. ✅ Progressive feature unlock (lock-in, deferred gratification)

**Tier 3 (Nice to Have - Ship in 90 days):**
9. ✅ Real-time notification badge (requires push permissions)
10. ✅ Question streak tracker (gamification, Duolingo-style)
11. ✅ SPARK Community (requires moderation, ongoing work)
12. ❌ Leaderboard (risky, save for post-PMF)

---

## Success Criteria

**v1.1 is successful if:**
- **Day 7 retention:** 40% → 60% (up 20pp)
- **Month 2 retention:** 10% → 50% (up 40pp)
- **Weekly dashboard visits:** <1 → 2+ per week
- **Email engagement:** 40%+ open rate on recap emails
- **Feature adoption:** 30% of users export FAQ
- **Social proof:** 50+ sites submitted to Showcase

**Leading indicators (within 30 days):**
- 50%+ of users open first daily recap email
- 30%+ of users log into dashboard within 7 days
- 20%+ of users hit "First 10 Questions" badge
- 10%+ of users export auto-generated FAQ

---

## What Good Looks Like: Retention Benchmarks

**Consumer apps:**
- Duolingo: 50% Day 1, 20% Day 7 (via streaks, gamification)
- Snapchat: 60% Day 1, 30% Day 7 (via streaks, social)
- Instagram: 70% Day 1, 40% Day 7 (via feed, notifications)

**B2B SaaS:**
- Slack: 85% Day 1, 70% Day 7 (via team invites, channels)
- Notion: 60% Day 1, 35% Day 7 (via templates, community)
- Linear: 55% Day 1, 40% Day 7 (via notifications, workflows)

**SPARK target (B2B utility):**
- Day 1: 60% (get first question)
- Day 7: 40% (check dashboard or open email)
- Month 2: 50% (still active, not churned)
- Month 6: 35% (long-term retained)

---

## Final Thought

**Current SPARK:** Refrigerator. Works, cold, forgettable.

**v1.1 SPARK:** Kitchen. Where people gather, learn, share, grow.

**Retention isn't about features. It's about relationships.**

Give users:
- **Daily dopamine:** Something to check today
- **Weekly wisdom:** Something to learn this week
- **Monthly milestones:** Something to celebrate this month
- **Community connection:** Someone to share with

Do this, and they won't forget you.

**People don't churn from products they love. They churn from products they forget.**

Make SPARK unforgettable.

---

**Shonda Rhimes**
Storyteller & Retention Architect
Great Minds Agency Board Member
