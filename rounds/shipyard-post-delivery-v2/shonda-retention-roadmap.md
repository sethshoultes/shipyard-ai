# Shonda Retention Roadmap: What Keeps Users Coming Back

**Product:** Anchor Post-Delivery System
**Version:** 1.1 Feature Roadmap
**Author:** Based on Shonda Rhimes Board Review
**Date:** 2026-04-12

---

## The Core Insight

> "The best stories don't end. They pause, and make you desperate for the next chapter."

Retention isn't about reminding people you exist. It's about making them **curious** what happens next. Every touchpoint should create anticipation for the following one.

---

## What Keeps Users Coming Back (Current State)

### Working Today

| Hook | Timing | Mechanism | Strength |
|------|--------|-----------|----------|
| Launch celebration | Day 0 | Shared ownership ("Look what we built together") | Strong |
| Preview of next chapter | Day 0 → Day 7 | "We'll check in next week..." | Strong |
| Relationship deepening | Day 7 | Care without selling | Moderate |
| Preview of refresh | Day 7 → Day 30 | "At one month, we'll help you refresh..." | Strong |
| Agency & momentum | Day 30 | Actionable questions they're already thinking | Moderate |
| Anniversary nostalgia | Month 6 | "It's been working for you 24/7..." | Moderate |

### Broken Today

| Gap | Problem | Impact |
|-----|---------|--------|
| Day 30 → Month 6 | 152 days of silence | Clients forget, seek alternatives |
| Email 3 has no preview | Serialization stops | Anticipation dies at Day 30 |
| Email 4 has no preview | No promise of Year 1 | Relationship feels finite |
| No Day 365 | Anniversary unused | Emotional milestone wasted |
| All retention is outbound | Client waits for you | No destination to return to |
| No flywheel | Content doesn't compound | Every client is standalone |

---

## V1.1 Features: The Serialization Fix

### Priority 1: Complete the Preview Chain

**Goal:** Every email promises the next chapter.

| Email | Current Preview | Add Preview |
|-------|-----------------|-------------|
| Email 1 (Day 0) | ✓ "We'll check in next week..." | — |
| Email 2 (Day 7) | ✓ "At one month, we'll help you refresh..." | — |
| Email 3 (Day 30) | ✗ None | "At the six-month mark, we'll help you plan the year ahead." |
| Email 4 (Month 6) | ✗ None | "Your one-year anniversary is coming. We're already planning how to celebrate." |

**Effort:** 30 minutes
**Impact:** High — transforms static emails into serialized narrative

---

### Priority 2: Bridge the Five-Month Gap

**Goal:** Maintain presence between Day 30 and Month 6.

**Add: Email 3.5 — Day 90 Check-in**

```
Subject: Quick check-in (no action needed)

Hey {{NAME}},

Three months with {{SITENAME}}.com live. Just wanted to pop in.

Everything still working? Anything feel different than you expected?

No action needed on your end—we're just making sure the foundation is solid.

Talk soon,
{{SENDER}}

P.S. Six-month mark is coming up. We're already thinking about your refresh.
```

**Characteristics:**
- Light touch, no CTA
- Reinforces "We don't disappear" without selling
- Creates anticipation for Month 6

**Effort:** 1 hour (write, review, add to sequence)
**Impact:** High — cuts silence from 152 days to 62 days max

---

### Priority 3: Restore Day 365 Anniversary Email

**Goal:** Emotional milestone that deepens relationship.

**Add: Email 5 — One Year Anniversary**

```
Subject: One year with {{SITENAME}}.com

Hey {{NAME}},

One year ago today, we launched {{SITENAME}}.com together.

Since then:
- Your site has been live for 8,760 hours
- It's been working while you slept, traveled, and lived your life
- And we've been here the whole time

We don't have a card or a cake. But we do have this: 20% off your next project with Shipyard. Same team. Same care. Same promise.

You've built something that lasts. We're proud to have been part of it.

Here's to year two,
{{SENDER}}

P.S. Know someone starting out who needs a site they can trust? We'd love to meet them.
```

**Characteristics:**
- Celebration, not transaction
- Emotional milestone language ("8,760 hours")
- Soft referral prompt
- Renewal offer embedded naturally

**Effort:** 1 hour
**Impact:** High — captures emotional anniversary moment, drives referrals

---

### Priority 4: Surface Pro Tier Value in Month 6

**Goal:** Make quarterly refresh proposals a retention hook, not a buried feature.

**Add to Email 4 (Month 6):**

```
If you're on Anchor Pro, your first quarterly refresh proposal is ready.
Here's what we'd suggest based on six months of watching your site evolve:

[AI-generated refresh recommendations]

Not on Pro yet? Reply "interested" and we'll share what we'd recommend.
```

**Effort:** 2 hours (template update + process for generating proposals)
**Impact:** Medium — upsell opportunity + curiosity hook

---

## V1.1 Feature Summary

| Feature | Type | Effort | Impact | Priority |
|---------|------|--------|--------|----------|
| Preview line in Email 3 | Copy update | 30 min | High | P1 |
| Preview line in Email 4 | Copy update | 30 min | High | P1 |
| Day 90 check-in email | New template | 1 hr | High | P2 |
| Day 365 anniversary email | New template | 1 hr | High | P2 |
| Pro tier callout in Month 6 | Copy update | 2 hr | Medium | P3 |

**Total V1.1 Effort:** ~5 hours
**Total V1.1 Impact:** Transforms incomplete serialization into full narrative arc

---

## V1.2 Features: The Flywheel Foundation

### What's a Flywheel?

A flywheel is a system where each action generates more actions. Currently, Anchor is a funnel:

```
Client enters → 4 emails → converts or doesn't → end
```

A flywheel looks like:

```
Client enters → emails → converts → success → referral → new client enters
                                      ↓
                              content generated
                                      ↓
                              attracts new clients
```

### Flywheel Components to Build

#### 1. Referral Mechanics
**Where:** Month 6 and Day 365 emails
**How:** Soft prompt: "Know someone who needs a site? Tell us and we'll thank you."
**Incentive:** $100 credit toward next project
**Effort:** 2 hours

#### 2. Client Success Stories
**Where:** Internal capture after Month 6
**How:** Ask high-engagement clients for 2-sentence testimonial
**Use:** Social proof in Day 0 emails for new clients
**Effort:** Ongoing process

#### 3. Monthly Inbound Content
**What:** "Site Owner Tips" — one useful thing per month
**Examples:**
- "3 things to update on your site before the holidays"
- "How to tell if your site needs a refresh"
- "What your competitors just changed (and what it means)"

**Goal:** Position Shipyard as trusted advisor, not vendor
**Effort:** 2-4 hours/month

#### 4. Site Card Artifact
**What:** Static page or PDF showing site status
**Contents:** URL, launch date, maintenance tier, last update, next touchpoint
**Goal:** Something the client can hold — makes relationship tangible
**Effort:** 4-8 hours to build template

---

## V1.3 Features: Inbound Retention

### The Problem

All V1 retention is **outbound**: Shipyard reaches to client. Client waits passively.

### The Solution

Give clients somewhere to **return to**:

| Feature | Description | Retention Mechanism |
|---------|-------------|---------------------|
| Site Card page | Simple status page per client | Bookmark, check occasionally |
| Request portal | "Submit update request here" | Habit formation |
| Health dashboard | Uptime, speed score, traffic basics | Reason to log in |

### Why This Matters

> "The client waits for you. They have no destination to return to."

When clients have a place that's "theirs," they visit. Visits create habit. Habit creates retention. Retention creates lifetime value.

### Implementation Approach

**Phase 1:** Static Site Card (PDF or simple page)
**Phase 2:** Basic portal (submit requests, view status)
**Phase 3:** Full dashboard (analytics, health scores, recommendations)

---

## The Serialized Narrative Arc (Complete)

### Before V1.1

| Day | Episode | Preview | Gap |
|-----|---------|---------|-----|
| 0 | Launch | ✓ Day 7 | — |
| 7 | Check-in | ✓ Day 30 | — |
| 30 | Refresh | ✗ | 152 days |
| 182 | Review | ✗ | 183 days |
| 365 | ✗ Missing | — | — |

### After V1.1

| Day | Episode | Preview | Gap |
|-----|---------|---------|-----|
| 0 | Launch | ✓ Day 7 | — |
| 7 | Check-in | ✓ Day 30 | — |
| 30 | Refresh | ✓ Day 90 | — |
| 90 | Light touch | ✓ Month 6 | — |
| 182 | Review | ✓ Day 365 | — |
| 365 | Anniversary | ✓ Year 2 | — |

**Result:** Complete serialized narrative with no silence longer than 92 days.

---

## Success Metrics

| Metric | Current | V1.1 Target | V1.2 Target |
|--------|---------|-------------|-------------|
| Reply rate (Day 30) | TBD | +20% | +30% |
| Churn rate (Month 6) | TBD | <10% | <5% |
| Referral rate | 0% | 5% | 15% |
| Client content generated | 0 | 2/month | 5/month |
| Inbound site visits | 0 | N/A | Track |

---

## The One Thing

> "You've built presence. Now build anticipation."

**V1.1 Goal:** Make every email promise the next chapter.
**V1.2 Goal:** Make clients generate content and referrals.
**V1.3 Goal:** Give clients a destination to return to.

Each version compounds on the previous. By V1.3, Anchor isn't just a retention system—it's a relationship platform.

---

*"Don't just tell them you'll be there. Make them want to see what you'll do next."*
— Shonda Rhimes

---

## Appendix: Full Email Sequence (V1.1)

1. **Day 0 — Launch Day** (existing + no changes)
2. **Day 7 — Check-in** (existing + no changes)
3. **Day 30 — Refresh** (add preview line)
4. **Day 90 — Light Touch** (NEW)
5. **Month 6 — Review** (add preview line + Pro callout)
6. **Day 365 — Anniversary** (NEW)

Total emails: 6 (up from 4)
Maximum silence: 92 days (down from 152)
Serialization: Complete
