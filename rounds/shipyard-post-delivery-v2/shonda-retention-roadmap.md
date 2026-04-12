# Retention Roadmap: Anchor v1.1

**Author:** Shonda Rhimes (Board Member, Great Minds Agency)
**Focus:** What Keeps Users Coming Back
**Date:** 2026-04-12

---

## The Retention Problem

Anchor's current structure creates two dangerous gaps:

1. **The Onboarding Gap:** 7 days of silence between signup and first report
2. **The Mid-Journey Gap:** 60 days of silence between Month 1 and Q1 Refresh

These gaps are churn triggers. Users forget they're paying. They question the value. They cancel.

---

## The Retention Philosophy

**Episodic to Serialized:** Transform Anchor from a service that sends occasional updates into a show users don't want to miss.

The goal isn't more emails. It's **more anticipation**.

---

## v1.1 Feature Roadmap

### Phase 1: Fill the Gaps (Week 1-2)

#### 1.1 Day 3 "First Scan Coming" Email
**Purpose:** Build anticipation, reduce early churn

```
Subject: Your first Anchor check is scheduled

Hi {{FIRST_NAME}},

Quick note: your first performance scan is scheduled for Monday.

You'll get a report showing how your site performs on mobile and desktop,
plus how fast it loads for visitors.

Until then, you don't need to do anything. We're on it.

— The Anchor Team
```

**Why it works:** Creates a cliffhanger. Users now EXPECT Monday's email.

---

#### 1.2 Month 2 "Still Watching" Email
**Purpose:** Maintain presence during the 60-day gap

```
Subject: Month 2 with Anchor — everything's running smoothly

Hi {{FIRST_NAME}},

Two months in. Here's where things stand:

Your site has been scanned {{SCAN_COUNT}} times since you joined.
Current mobile score: {{MOBILE_SCORE}}
Trend: {{TREND_DIRECTION}}

No issues detected. No action needed.

We'll check in again next month with your quarterly summary.

— The Anchor Team
```

**Why it works:** Proves value without demanding attention. "We're still here."

---

#### 1.3 Month 3 "Q1 Preview" Email
**Purpose:** Build anticipation for Q1 Refresh

```
Subject: Your quarterly report is almost ready

Hi {{FIRST_NAME}},

Next week marks 3 months with Anchor.

We're compiling your quarterly performance summary — 13 weeks of data,
trends, and insights about your site.

Look for it on {{QUARTERLY_DATE}}.

— The Anchor Team
```

**Why it works:** Teases the quarterly report instead of dropping it cold.

---

### Phase 2: Create Hooks (Week 3-4)

#### 2.1 Performance Alert System
**Purpose:** Prove the "someone's got your back" promise

**Trigger:** Mobile or desktop score drops >10 points from previous week

```
Subject: Heads up — we noticed something on {{SITE_URL}}

Hi {{FIRST_NAME}},

Your mobile performance score dropped from {{PREVIOUS_SCORE}} to {{CURRENT_SCORE}} this week.

This could be temporary (heavy traffic, server hiccup) or something worth looking into.

Here's what we'd suggest checking:
- Recent changes to your site (new images, plugins, scripts)
- Your hosting provider's status page
- Whether any new features were added

If you'd like us to dig deeper, just reply to this email.

We'll keep monitoring and let you know if it recovers.

— The Anchor Team
```

**Why it works:** This is the moment Anchor earns its subscription. When something goes wrong, YOU told them first.

---

#### 2.2 Recovery Celebration Email
**Purpose:** Close the loop on alerts, reinforce value

**Trigger:** Score recovers after a previous alert

```
Subject: Good news — your site bounced back

Hi {{FIRST_NAME}},

Remember that performance dip we flagged last week?

Your mobile score is back up to {{CURRENT_SCORE}}.
Whatever happened, your site recovered.

We'll keep watching.

— The Anchor Team
```

**Why it works:** Completes the story arc. Problem > Alert > Resolution.

---

### Phase 3: Make It Shareable (Week 5-6)

#### 3.1 Shareable Performance Badge
**Purpose:** Turn happy users into ambassadors

**Implementation:** Generate a simple badge image users can share

```
+----------------------------------+
|         Monitored by Anchor      |
|     Performance Score: 92/100    |
|     Updated Weekly               |
+----------------------------------+
```

**Delivery:** Include in quarterly and anniversary emails

```
Want to show off your site's health? Here's your performance badge:
[View Badge] [Download Image]
```

**Why it works:** Pride creates sharing. Sharing creates social proof.

---

#### 3.2 "Your Site vs. Average" Benchmark
**Purpose:** Create comparison context and bragging rights

**Add to quarterly emails:**
```
How you compare:
- Your mobile score: 87
- Average Anchor site: 72
- You're faster than 78% of sites we monitor
```

**Why it works:** "Better than average" is a shareable stat.

---

### Phase 4: Active Participation (Week 7-8)

#### 4.1 Simple Status Page
**Purpose:** Let users check their story on-demand

**URL:** `anchor.dev/status/{{SITE_ID}}`

**Features:**
- Current mobile/desktop scores
- 12-week trend chart
- Last scan date + next scheduled scan
- "Everything's running smoothly" or "We spotted an issue" status

**Why it works:** Supplements (doesn't replace) email-first philosophy. Users can peek without logging into a dashboard.

---

#### 4.2 "Request a Check" Button
**Purpose:** Give users agency

**Add to status page:**
```
Your next scheduled scan is Monday.
[Request Early Check]
```

**Limit:** 1 on-demand check per week (Basic) / 4 per week (Pro)

**Why it works:** Transforms passive recipients into active participants.

---

### Phase 5: Pro Tier Differentiation (Week 9-10)

#### 5.1 Visual Monthly Report (Pro Only)
**Purpose:** Justify the Pro price premium

**Delivery:** PDF attachment or web page link

**Contents:**
- Visual score chart (12-week trend)
- Mobile vs. desktop comparison
- Core Web Vitals breakdown (LCP, FID, CLS) with plain-English explanations
- "Issues avoided this month" section
- Optimization suggestions with priority ranking

**Why it works:** Pro users see the story behind the numbers.

---

#### 5.2 "Behind the Scenes" Email (Pro Only)
**Purpose:** Create exclusive narrative content

**Monthly email:**
```
Subject: Your site's month — behind the scenes

Hi {{FIRST_NAME}},

Here's what happened behind the scenes this month:

- We ran {{SCAN_COUNT}} performance checks
- Your site was reachable 100% of the time
- Fastest load time this month: {{FASTEST_TIME}} on {{FASTEST_DATE}}
- Slowest load time: {{SLOWEST_TIME}} on {{SLOWEST_DATE}}

One thing we noticed:
[Personalized insight based on their data]

Keep doing what you're doing.

— The Anchor Team
```

**Why it works:** Pro users feel like insiders, not just premium payers.

---

## Retention Email Calendar: v1.1

| Day | Email | Purpose |
|-----|-------|---------|
| 0 | Welcome | Relationship begins |
| 3 | **First Scan Coming** | Build anticipation |
| 7 | Week 1 Report | First proof of value |
| 14 | Week 2 Report | Consistency |
| 21 | Week 3 Report | Consistency |
| 28 | Week 4 Report | Consistency |
| 30 | Month 1 Summary | First milestone |
| 60 | **Month 2 Check-in** | Maintain presence |
| 83 | **Q1 Preview** | Build anticipation |
| 90 | Q1 Refresh | Quarterly milestone |
| 120 | **Month 4 Check-in** | Maintain presence |
| 150 | **Month 5 Check-in** | Maintain presence |
| 173 | **Q2 Preview** | Build anticipation |
| 180 | Q2 Refresh | Quarterly milestone |
| ... | ... | ... |
| 365 | Anniversary | Loyalty celebration |

**Plus:**
- Alert emails (triggered by performance drops)
- Recovery emails (triggered by score recovery)

---

## Metrics to Track

| Metric | Current Baseline | v1.1 Target |
|--------|------------------|-------------|
| 30-day retention | Unknown | >90% |
| 90-day retention | Unknown | >75% |
| 180-day retention | Unknown | >60% |
| Email open rate | Unknown | >50% |
| Alert email engagement | N/A | >80% open |
| Status page visits | N/A | 2+ visits/month |
| Badge shares | N/A | 10% of users |

---

## Summary: What Keeps Users Coming Back

1. **Anticipation** — Tease what's coming (Day 3, Q1 Preview)
2. **Presence** — Never disappear for 60 days (Month 2, Month 5)
3. **Proof** — Alert them BEFORE they notice problems (Alert system)
4. **Pride** — Give them something to share (Badges, benchmarks)
5. **Participation** — Let them act, not just receive (Status page, request checks)
6. **Premium Story** — Make Pro users feel like insiders (Visual reports, behind-the-scenes)

---

*"In television, you can't let your audience forget about you for 60 days. In subscription services, the same rule applies. Every silence is an invitation to cancel."*

*Now let's make sure they never forget about us.*

— Shonda Rhimes
