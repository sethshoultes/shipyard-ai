# Retention Roadmap: What Keeps Users Coming Back

**Author:** Based on Shonda Rhimes Board Review
**Version:** 1.1 Planning
**Date:** 2026-04-12

---

## The Core Problem

> "This product answers: 'How do we gate content and collect payment?' It should be answering: 'How do we make members *need* to come back?'"

The MemberShip plugin has infrastructure. It lacks *narrative*. Every successful long-running show has hooks that make audiences count down to the next episode. MemberShip needs the same.

---

## What Keeps Users Coming Back

### The Three Retention Principles

1. **Anticipation > Delivery** — The excitement of what's coming is often more powerful than the thing itself
2. **Progress Creates Commitment** — People who see how far they've come are reluctant to abandon the journey
3. **Curiosity Demands Resolution** — Unanswered questions pull people back

---

## v1.0 Retention Gaps

| Touchpoint | Current State | Retention Problem |
|------------|---------------|-------------------|
| Registration | "You're registered!" | No hint of what's next |
| Dashboard | Static content list | No "new since last visit" |
| Drip Unlock | "Content now available" | No anticipation building |
| Between Logins | Silence | No reason to return |
| Renewal Reminder | "You're about to renew" | Defensive, not exciting |
| Cancellation | "Subscription cancelled" | No last hook |

---

## v1.1 Retention Features

### 1. The "Aha Moment" Framework

**Goal:** Define and design the specific moment when members realize value.

**Implementation:**
- [ ] Creator-configurable "aha moment" designation in admin
- [ ] Instrumentation to track when members hit it
- [ ] Analytics: "X% of members reach aha moment within Y days"
- [ ] Intervention: Automated nudges for members who haven't reached it

**Example Aha Moments:**
- First exclusive content consumed
- First drip unlock
- First community interaction
- First tangible result from content

---

### 2. Episode-Style Drip Content

**Goal:** Transform mechanical unlocks into anticipated reveals.

**Current:**
```
"Module 3 is now available"
```

**v1.1:**
```
"Module 3 is here: 'The Pivot Point'
In this module, everything you thought you knew about [topic] gets challenged.
143 other members unlocked this today. Here's what they're saying..."
```

**Implementation:**
- [ ] Drip content preview/teaser field (blurred image, summary text)
- [ ] "Coming in X days" dashboard widget with countdown
- [ ] Unlock notification templates with narrative hooks
- [ ] Social proof: "X members unlocked this" / "X members waiting"

---

### 3. "Previously On..." Dashboard

**Goal:** Reorient returning members and surface progress.

**Implementation:**
- [ ] "New since your last visit" section
- [ ] Content consumption history ("You've completed 7 of 12 modules")
- [ ] Streak tracking ("Member for 47 days")
- [ ] Personalized "Continue where you left off" prompt

**Dashboard Sections (v1.1):**
```
┌─────────────────────────────────────┐
│ Welcome back, [Name]!               │
│ You've been a member for 47 days    │
├─────────────────────────────────────┤
│ 🆕 NEW SINCE YOUR LAST VISIT        │
│ • Module 5 unlocked (2 days ago)    │
│ • 3 new community posts             │
├─────────────────────────────────────┤
│ ⏳ COMING SOON                       │
│ • Module 6 unlocks in 5 days        │
│   "The moment everything changes"   │
├─────────────────────────────────────┤
│ 📊 YOUR PROGRESS                    │
│ ████████░░░░ 7/12 modules complete  │
└─────────────────────────────────────┘
```

---

### 4. Anticipation Mechanics

**Goal:** Make members look forward to what's next.

**Teaser System:**
- [ ] Preview cards for locked content (blurred, with tagline)
- [ ] "Unlocks in X days" countdown timers
- [ ] Email: Weekly "What's coming" digest
- [ ] Creator tool: Write teaser copy for upcoming drips

**Example Email:**
```
Subject: This week on [Creator Name]...

Module 6 drops in 5 days.
We're not going to tell you what's in it.
But we will say this: it changes everything.

[See what's coming →]
```

---

### 5. Milestone Celebrations

**Goal:** Celebrate creator and member achievements.

**Creator Milestones:**
- [ ] First subscriber notification (with confetti!)
- [ ] 10th, 50th, 100th subscriber emails
- [ ] First $100, $1,000, $10,000 revenue celebrations
- [ ] Monthly "Your community grew by X%" summary

**Member Milestones:**
- [ ] Welcome sequence (Day 1, Day 3, Day 7)
- [ ] Consumption milestones ("You've completed half the course!")
- [ ] Anniversary ("You've been a member for 1 year")
- [ ] Streak achievements ("30 days in a row!")

---

### 6. Cliffhanger Touchpoints

**Goal:** End every interaction with a question, not a period.

**Redesigned Touchpoints:**

| Touchpoint | Current | v1.1 |
|------------|---------|------|
| Registration Confirm | "You're registered!" | "Welcome! Your first exclusive drops in 24 hours. We can't wait to show you..." |
| Drip Unlock Email | "Content available" | "It's here. But fair warning—after this, nothing is what you expect." |
| Dashboard Exit | (none) | "Before you go: Module 6 drops in 3 days. It's a big one." |
| Renewal Reminder | "Renewing in 7 days" | "Next month: [teaser]. Plus something we've never done before." |
| Cancellation | "Cancelled" | "We'll miss you. Before you go, here's one last thing we made for you..." |

---

### 7. Content Engagement Intelligence

**Goal:** Help creators understand what resonates.

**Analytics (v1.1):**
- [ ] Content view tracking (which gated content is accessed)
- [ ] Completion rates (for video/long-form content)
- [ ] Drip email open rates
- [ ] Correlation: "Members who complete X have Y% lower churn"

**Creator Insights:**
```
📈 This Month's Insights

• Your most-viewed content: "Module 3: The Basics"
• Pro members engage most with: [AI/Strategy content]
• Members who complete Module 1 within 7 days → 2x retention
• Suggested: Email members who haven't started Module 1 yet
```

---

### 8. Win-Back Sequence

**Goal:** Re-engage members before and after they leave.

**Pre-Churn (7 days before renewal):**
- [ ] "Here's what you'll miss" preview of upcoming content
- [ ] Highlight unused benefits ("You haven't accessed X yet")
- [ ] Social proof: "147 members renewed this week"

**Post-Churn (7, 14, 30 days after):**
- [ ] "We saved your progress" email
- [ ] "Here's what you missed" summary
- [ ] Special comeback offer (if enabled by creator)

---

## Implementation Priority

### v1.1 Sprint 1: Foundation
1. Member event logging (all actions tracked)
2. "New since last visit" dashboard section
3. Drip content teaser/preview fields
4. First-subscriber celebration for creators

### v1.1 Sprint 2: Anticipation
5. Countdown timers for locked content
6. "Coming soon" dashboard widget
7. Narrative unlock email templates
8. Weekly "what's coming" digest

### v1.1 Sprint 3: Progress & Milestones
9. Content consumption tracking
10. Progress bar dashboard component
11. Member streak tracking
12. Creator milestone notifications

### v1.1 Sprint 4: Intelligence
13. Content engagement analytics
14. Creator insights dashboard
15. Churn correlation analysis
16. Pre-churn intervention triggers

---

## Success Metrics

| Metric | Current Baseline | v1.1 Target |
|--------|------------------|-------------|
| Day 7 retention | Unknown | 70% |
| Day 30 retention | Unknown | 50% |
| Drip email open rate | Unknown | 45% |
| Dashboard return visits/month | Unknown | 4+ |
| Members reaching "aha moment" | Unknown | 60% in first 7 days |
| Monthly churn rate | Unknown | <5% |

---

## The Shonda Test

Before shipping any v1.1 feature, ask:

1. **Does this make members curious about what's next?**
2. **Does this create a reason to come back tomorrow?**
3. **Does this celebrate progress, not just deliver content?**
4. **Does this end with a question, not a period?**

If the answer to any of these is "no," redesign it.

---

## Closing Principle

> "I've greenlit shows and I've cancelled shows. The cancelled ones always had one thing in common: they didn't make audiences care about next week."

MemberShip v1.0 manages members.
MemberShip v1.1 must *captivate* them.

Every feature in this roadmap serves one goal: **make members need to know what happens next.**

---

*Retention Roadmap based on Shonda Rhimes Board Review*
*Great Minds Agency — 2026-04-12*
