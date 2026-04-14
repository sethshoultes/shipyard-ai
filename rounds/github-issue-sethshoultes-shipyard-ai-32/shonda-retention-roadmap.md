# Shonda's Retention Roadmap: What Keeps Users Coming Back

**Plugin:** ReviewPulse
**Author:** Based on Shonda Rhimes' Board Review
**Date:** 2026-04-14
**Version Target:** v1.1

---

## The Showrunner's Philosophy

> "Every login should have a 'previously on...' that reminds them why they care. And every session should end with 'Next time, on ReviewPulse...'"

ReviewPulse v1.0 aggregates data. v1.1 creates drama.

---

## Retention Framework: The Four Cliffhangers

### 1. The Daily Pull — "What happened while I was gone?"

**Current State:** Users check manually. Maybe.

**v1.1 Features:**

| Feature | Description | Hook Strength |
|---------|-------------|---------------|
| **Morning Digest Email** | Daily summary: new reviews, rating changes, unanswered queue count | High |
| **Push Notification: New Review** | Real-time alert when any review lands | High |
| **Push Notification: Crisis Alert** | Immediate alert for 1-2 star reviews with "Respond Now" CTA | Critical |
| **"Previously On" Dashboard** | First screen shows changes since last login, not static stats | High |

**Implementation Notes:**
- Use existing `email:send` capability
- Add `lastLoginAt` tracking to user preferences
- Diff reviews since last login for "Previously On" widget

---

### 2. The Weekly Pull — "How's my story arc developing?"

**Current State:** Analytics show trends. Trends don't feel like anything.

**v1.1 Features:**

| Feature | Description | Hook Strength |
|---------|-------------|---------------|
| **Weekly Report Card** | Emailed summary: "Your rating went UP 0.2 stars. You responded to 8 reviews. 2 customers mentioned 'friendly staff'." | High |
| **Trend Dramatization** | "RISING" with celebration animation. "FALLING" with concerned tone and action prompts. | Medium |
| **Competitive Pulse** | "Restaurants in your area averaged 4.3 this week. You're at 4.6." (Requires aggregate data) | High |
| **Response Leaderboard** | For multi-location businesses: "Your Denver location responded to 100% of reviews this week" | Medium |

**Implementation Notes:**
- Weekly cron job generates report
- Trend visualization requires UI animation work
- Competitive data requires opt-in data sharing agreement

---

### 3. The Monthly Pull — "What milestones am I approaching?"

**Current State:** Nothing. Users forget the plugin exists.

**v1.1 Features:**

| Feature | Description | Hook Strength |
|---------|-------------|---------------|
| **Milestone Tracker** | Visual progress toward next milestone: 100th review, 4.5 average, 50 responses | High |
| **Anniversary Celebrations** | "One year ago today, you got your first 5-star review from Sarah M." | Medium |
| **Monthly Achievement Badge** | "February 2026: Response Champion (answered 95% of reviews)" | Medium |
| **Goal Setting** | "Set your Q2 goal: reach 4.7 average rating" with progress tracking | High |

**Implementation Notes:**
- Store `achievementHistory` in user KV
- Calculate next milestone dynamically
- Badge system requires design assets

---

### 4. The Surprise Pull — "Something unexpected happened!"

**Current State:** Nothing unexpected ever happens. It's a spreadsheet.

**v1.1 Features:**

| Feature | Description | Hook Strength |
|---------|-------------|---------------|
| **Viral Review Alert** | "Your review from @foodie_jane has 47 helpful votes!" | High |
| **Customer Comeback** | "Remember Mike who left a 2-star in January? He just left a 5-star!" | Critical |
| **Theme Shift Detection** | "Customers started mentioning 'new menu' this week" | High |
| **Response Reply Notification** | "A customer responded to YOUR response!" | Critical |

**Implementation Notes:**
- Track review engagement metrics from platform APIs
- Store reviewer IDs to detect repeat reviewers
- NLP theme extraction requires AI integration

---

## The Emotional Design System

### Crisis Mode (Rating ≤ 2)

**Current:** Review appears in list with others. Maybe flagged.

**v1.1 Treatment:**

```
┌─────────────────────────────────────────────────────────┐
│  ⚠️  URGENT: New 1-Star Review                         │
│                                                         │
│  "Worst experience ever. We waited 45 minutes..."       │
│                                                         │
│  Sarah M. • 2 hours ago • Google                        │
│                                                         │
│  [Respond Now]  [Get AI Help]  [View Full Review]       │
│                                                         │
│  💡 Tip: Reviews responded to within 24 hours see       │
│     40% higher resolution rates                         │
└─────────────────────────────────────────────────────────┘
```

- Red accent color
- Elevated z-index (appears on top of other content)
- Timer showing time since review posted
- AI-drafted response ready to edit

---

### Celebration Mode (Rating = 5, or Milestone Hit)

**Current:** Review appears in list. That's it.

**v1.1 Treatment:**

```
┌─────────────────────────────────────────────────────────┐
│  🎉  AMAZING: 5-Star Review!                            │
│                                                         │
│  "Best meal I've had in years. The pasta was..."        │
│                                                         │
│  James T. • Just now • Yelp                             │
│                                                         │
│  [Share on Instagram]  [Feature on Website]  [Thank]    │
│                                                         │
│  ⭐ This is your 147th 5-star review!                   │
└─────────────────────────────────────────────────────────┘
```

- Gold accent color
- Confetti animation on first view
- One-click social sharing
- Milestone counter

---

### Progress Mode (Weekly Summary)

```
┌─────────────────────────────────────────────────────────┐
│  📈  YOUR WEEK IN REVIEW                                │
│                                                         │
│  Rating:     ████████████████░░░░  4.6 (+0.1)          │
│  Reviews:    12 new (↑ from 8 last week)                │
│  Responses:  10/12 answered (83%)                       │
│  Sentiment:  "service" mentions up 40%                  │
│                                                         │
│  🏆 Best moment: "The manager personally came to        │
│     our table to make sure everything was perfect"      │
│                                                         │
│  [See Full Report]  [Share Wins]  [Set Goals]           │
└─────────────────────────────────────────────────────────┘
```

---

## The Notification Matrix

| Event | Email | Push | In-App | Priority |
|-------|-------|------|--------|----------|
| New 5-star review | ✓ | Optional | ✓ | Medium |
| New 3-4 star review | Daily digest | - | ✓ | Low |
| New 1-2 star review | ✓ | ✓ | ✓ | Critical |
| Customer replied to your response | ✓ | ✓ | ✓ | High |
| Weekly summary ready | ✓ | - | ✓ | Medium |
| Milestone achieved | ✓ | ✓ | ✓ | High |
| Rating trend changed | ✓ | - | ✓ | Medium |
| Unanswered reviews > 5 | ✓ | ✓ | ✓ | High |
| 24h no login + pending reviews | ✓ | ✓ | - | Medium |

**Notification Preferences:**
- All notifications on by default (except push, which requires opt-in)
- Granular controls in settings
- "Quiet hours" support (no notifications between 10pm-7am)
- Digest mode option (batch all non-critical into daily email)

---

## The Unanswered Queue: Your Inbox Anxiety

**Design Principle:** Unanswered reviews should feel like unread messages.

**v1.1 Features:**

| Feature | Description |
|---------|-------------|
| **Badge Count** | Red badge in navigation: "Reviews (3)" means 3 unanswered |
| **Aging Indicators** | "2 hours ago" → "1 day ago" → "3 days ago ⚠️" |
| **Response Time Tracking** | "Your average response time: 4.2 hours" |
| **Zero Inbox Celebration** | "All caught up! 🎉" with shareable badge |

---

## The Content Flywheel: From Aggregator to Creator

### Stage 1: Review Solicitation (v1.1)

```
Trigger: Customer completes transaction (POS integration)
    ↓
Email: "How was your experience at Bella's Bistro?"
    ↓
Customer clicks: Directed to Google/Yelp to leave review
    ↓
Review appears in ReviewPulse
    ↓
Owner responds
    ↓
Positive cycle established
```

**Implementation:**
- Webhook listener for transaction events
- Email template system with business branding
- Smart timing (send 2 hours after transaction)
- Frequency caps (don't spam repeat customers)

### Stage 2: Featured Testimonials (v1.1)

```
Owner marks review as "Featured"
    ↓
ReviewPulse generates:
  - Embeddable widget code
  - Social media image
  - Website testimonial card
    ↓
Owner shares externally
    ↓
Increased visibility → More customers → More reviews
```

**Implementation:**
- "Feature" action on review cards
- Template engine for social images
- Embed code generator with styling options

### Stage 3: Response Templates (v1.1)

```
AI analyzes successful responses across platform
    ↓
Generates industry-specific templates
    ↓
Owner customizes and saves personal templates
    ↓
One-click application to new reviews
    ↓
Faster responses → Higher response rate → Better reputation
```

**Implementation:**
- Template CRUD system
- Variable substitution ({{customer_name}}, {{business_name}})
- AI-suggested templates based on review content

---

## Success Metrics: Is Retention Working?

| Metric | Current (Est.) | v1.1 Target | Measurement |
|--------|----------------|-------------|-------------|
| D1 Retention | Unknown | 60% | % users returning day after signup |
| D7 Retention | Unknown | 40% | % users returning within first week |
| D30 Retention | Unknown | 25% | % users active after 30 days |
| Weekly Active Rate | Unknown | 50% | % of all users active each week |
| Response Rate | Unknown | 70% | % of reviews receiving response |
| Notification Open Rate | N/A | 35% | % of emails/pushes opened |
| Feature Action Rate | N/A | 20% | % of users who share/feature a review |

---

## v1.1 Feature Priority Matrix

| Feature | Retention Impact | Dev Effort | Priority |
|---------|-----------------|------------|----------|
| Crisis Alert (1-2 star push) | Critical | Low | P0 |
| Morning Digest Email | High | Medium | P0 |
| Unanswered Queue Badge | High | Low | P0 |
| AI Response Drafting | High | Medium | P0 |
| "Previously On" Dashboard | High | Medium | P1 |
| Weekly Report Card | High | Medium | P1 |
| Milestone Celebrations | Medium | Low | P1 |
| Featured Review Sharing | Medium | Medium | P1 |
| Review Solicitation Email | High | High | P2 |
| Response Templates | Medium | Medium | P2 |
| Competitive Pulse | High | High | P2 |

---

## The Season Finale: What Makes Them Binge?

Users don't just want to manage reviews. They want to feel like the protagonist of their own business story. Every feature should answer one question:

**"What happens next?"**

- A new review is a plot twist
- A response is a character decision
- A rating improvement is character growth
- A negative review is conflict to overcome
- A milestone is a season finale celebration

Build the product like you're building a series. Hook them in episode one. Give them cliffhangers. Make them care what happens next.

---

*"The only way to do great work is to make people desperate to know what happens next."*

— Shonda Rhimes, adapted for product

---

## Appendix: Implementation Checklist

### Week 1 (P0 Features)
- [ ] Implement notification service (email + in-app)
- [ ] Add crisis alert for 1-2 star reviews
- [ ] Create unanswered queue with badge count
- [ ] Integrate AI response drafting (GPT-4)

### Week 2 (P0 + P1 Start)
- [ ] Build morning digest email template
- [ ] Create "Previously On" dashboard widget
- [ ] Add review aging indicators
- [ ] Implement response time tracking

### Week 3-4 (P1 Features)
- [ ] Build weekly report card system
- [ ] Add milestone tracking and celebrations
- [ ] Create featured review sharing flow
- [ ] Design trend dramatization UI

### Month 2 (P2 Features)
- [ ] Build review solicitation email system
- [ ] Create response template library
- [ ] Research competitive data sourcing
- [ ] Implement goal setting system

---

*Retention Roadmap v1.0 — Great Minds Agency*
