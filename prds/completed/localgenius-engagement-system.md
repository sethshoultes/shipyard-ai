# PRD: LocalGenius Engagement System

> **Source**: IMPROVE Cycle 2026-04-18 — Board Review Consolidation
> **Priority**: P0 — Highest-impact improvement across all four dimensions (moat, conversion, revenue, retention)

---

## 1. Project Overview

**Project name:** LocalGenius Engagement System
**Product type:** [x] Plugin/Feature Set for LocalGenius
**Target URL/domain:** localgenius.company
**Deadline:** 2 weeks (core features)

---

## 2. Business Context

**What does this business do?**
LocalGenius is an AI-powered marketing assistant for restaurants. It handles websites, review responses, social posts, and weekly performance digests so owners can focus on their business.

**Who is the target audience?**
Restaurant owners and managers who don't have time or expertise for marketing.

**What's the primary goal of this feature set?**
Increase daily engagement, retention, and upgrade conversion by transforming LocalGenius from a "weekly tool" to a "daily companion."

**Board Review Summary:**
- Jensen Huang: "Data moat underspecified. Need proprietary annotations."
- Oprah Winfrey: "Demo the product, don't just describe it."
- Warren Buffett: "No expansion revenue path. Add upgrade triggers."
- Shonda Rhimes: "Weekly digest ends. Add cliffhangers."

---

## 3. Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | Daily Micro-Notifications | Push/SMS/email: "3 people viewed your menu today" — just enough to stay top of mind | Must-have |
| 2 | Business Journal | Weekly prompt: "What happened this week?" Owner annotations create proprietary training data | Must-have |
| 3 | Milestone Badges | Visual celebrations: 50 reviews, 1000 visitors, 6-month streak, "best week ever" | Must-have |
| 4 | Trend Narratives | Replace snapshot metrics ("340 visits") with stories ("340 visits, up 22% from last week") | Must-have |
| 5 | Weekly Cliffhanger | End digest with forward hook: "Next week, I'm testing a new post format. I'll show you how it performs." | Must-have |
| 6 | Upgrade Prompts | Show locked Pro features at natural friction points with visible value preview | Must-have |
| 7 | Progress Dashboard | Visual timeline of business growth, AI improvements, milestones achieved | Nice-to-have |
| 8 | Competitive Benchmarks | "Restaurants like you average 400 visits. You're at 340." | Nice-to-have |

---

## 4. Feature Details

### 4.1 Daily Micro-Notifications

**Purpose:** Create daily touchpoint without being annoying

**Mechanics:**
- One notification per day, max
- Delivered at owner's preferred time (default: 9am local)
- Content rotates:
  - "3 new website visits today"
  - "Someone left you a 5-star review"
  - "Your social post got 12 likes"
  - "2 people clicked your reservation link"
- Falls back to "All quiet today — your AI is still learning" on zero-event days

**Channels:**
- Push notification (mobile app, if exists)
- SMS (if user opts in)
- Email (default)

**User Control:**
- Frequency: Daily / Weekly-only / Off
- Time preference
- Channel preference

---

### 4.2 Business Journal

**Purpose:** Capture proprietary context that creates moat

**Mechanics:**
- Weekly prompt (Sunday evening or Monday morning): "Your week in review. What drove these results?"
- Simple text input with optional tags:
  - [ ] Holiday/event
  - [ ] New menu item
  - [ ] Weather impact
  - [ ] Competitor action
  - [ ] Marketing campaign
  - [ ] Other
- Annotations stored and used to:
  - Train AI on business-specific patterns
  - Correlate future performance predictions
  - Create "This time last year" comparisons

**UI:**
- Inline in weekly digest
- 2-tap response: tag + optional 1-sentence note
- Skip option (but track skip rate for product iteration)

**Moat value:**
This data cannot be replicated by competitors. It's proprietary labeled training data from the business owner themselves.

---

### 4.3 Milestone Badges

**Purpose:** Celebrate progress, create emotional peaks

**Milestones:**
| Trigger | Badge Name | Message |
|---------|------------|---------|
| First week completed | "Getting Started" | "Your first week! You're already ahead of most restaurants." |
| 50 reviews managed | "Review Responder" | "50 reviews, 50 thoughtful responses. Your reputation is growing." |
| 100 website visitors | "Foot Traffic" | "100 people visited your site. That's 100 potential customers." |
| 500 website visitors | "Local Favorite" | "500 visits! You're becoming a neighborhood go-to." |
| 1000 website visitors | "Destination Dining" | "1000 visits. People are seeking you out." |
| 4-week streak | "Consistent" | "4 weeks of engagement. Consistency builds trust." |
| 12-week streak | "Dedicated" | "3 months strong. Your AI knows your business better than ever." |
| Best week ever | "New Record" | "This was your best week yet. What made it special?" |
| First anniversary | "Year One" | "365 days together. Look how far you've come." |

**Display:**
- Modal celebration on login (dismissable)
- Badge gallery in account settings
- Shareable social card

---

### 4.4 Trend Narratives

**Purpose:** Turn data into stories users want to follow

**Current state:**
> "340 website visits | 4 new reviews | 23 reservation clicks"

**New state:**
> "340 website visits (up 22% from last week — your second-best week ever)
> 4 new reviews (all 5-star — you're averaging 4.8 this month)
> 23 reservation clicks (down from 28 — I'm testing a new CTA next week)"

**Mechanics:**
- Compare to: last week, last month, same week last year
- Highlight: improvements, declines, records
- Add context: "This might be because..." (AI inference, or reference Journal notes)

---

### 4.5 Weekly Cliffhanger

**Purpose:** Create "tune in next week" anticipation

**Mechanics:**
Every weekly digest ends with one of:
- "Next week, I'm trying a different post style. I'll let you know if it works."
- "I noticed competitors are doing X. I'm going to test something."
- "Based on your Journal note about the holiday rush, I'm preparing Y for next month."
- "Your best week was [date]. I'm studying what worked."

**Tone:**
- First person (the AI speaking)
- Curious, experimental, collaborative
- Never promises, always "testing" or "trying"

---

### 4.6 Upgrade Prompts

**Purpose:** Convert Base users to Pro

**Trigger points:**
| Context | Prompt |
|---------|--------|
| User views social post performance | "Want to see which post drove the most bookings? That's a Pro feature." |
| User has 3+ locations | "Managing multiple locations? Franchise dashboard is in Pro." |
| Competitor mentioned in reviews | "Your competitor was mentioned. Pro includes competitive benchmarking." |
| 90-day streak | "You're a power user! Pro users see 40% better results on average." |
| After milestone celebration | "Ready to level up? Pro unlocks advanced insights." |

**UI:**
- Subtle, never aggressive
- "Unlock" language, not "Buy"
- One-click upgrade path
- Show preview of what they'd see (blurred or sample data)

---

## 5. Design Direction

**Notifications:**
- Clean, minimal
- Single stat + context
- Easy dismiss/action

**Journal:**
- Inline with digest, not separate flow
- Mobile-first (thumb-tap tags)
- Optional text, not required

**Badges:**
- Warm, celebratory colors
- Collect-them-all energy
- Shareable format

**Upgrade prompts:**
- Integrated, not pop-up
- Show value before ask
- Progressive, not pushy

---

## 6. Success Metrics

| Metric | Current Baseline | Target |
|--------|------------------|--------|
| DAU/WAU ratio | ~20% | 50%+ |
| Weekly digest open rate | (measure baseline) | +25% |
| Journal completion rate | N/A | 40%+ |
| 30-day retention | (measure baseline) | +15% |
| Base → Pro conversion | (measure baseline) | +25% |
| Milestone badge shares | N/A | 100/month |

---

## 7. Must-Haves vs. Nice-to-Haves

**Must-haves (will not ship without these):**
1. Daily micro-notifications (one channel minimum)
2. Business Journal weekly prompt
3. Milestone badges (top 5)
4. Trend narratives in weekly digest
5. Weekly cliffhanger in digest
6. At least 3 upgrade prompt trigger points

**Nice-to-haves (only if tokens allow):**
1. Full badge collection (10+)
2. Progress dashboard
3. Competitive benchmarks
4. Multi-channel notifications
5. Shareable milestone cards

---

## 8. Technical Notes

- Notifications: Use existing email infrastructure; add SMS via Twilio if not present
- Journal: New database table (business_id, week_date, tags, note, created_at)
- Badges: Achievement tracking table; check on each digest generation
- Trends: Calculate week-over-week, month-over-month, year-over-year in digest pipeline
- Upgrade prompts: Feature flag system to A/B test prompt copy and placement

---

## 9. Token Budget

_Filled by Shipyard AI during INTAKE — client reviews and approves._

| Item | Tokens |
|------|--------|
| Base feature development | |
| UI components | |
| Notification infrastructure | |
| **Total budget** | |
| Estimated revision credits needed | |

---

## 10. Board Endorsements

- **Jensen Huang**: "Business Journal creates proprietary labeled data no competitor can replicate. This is the moat."
- **Warren Buffett**: "Upgrade prompts at natural friction points will increase LTV without feeling salesy."
- **Shonda Rhimes**: "The weekly cliffhanger turns a report into a story. Users will come back to see what happens."
- **Oprah Winfrey**: "Milestone celebrations create emotional peaks. That's what people remember and share."
