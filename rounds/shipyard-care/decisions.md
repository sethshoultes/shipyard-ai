# Shipyard Pulse — Locked Decisions

**Prepared by:** Phil Jackson, Zen Master
**Date:** Final synthesis from Round 1-2 debates
**Purpose:** Blueprint for Build Phase

---

## Executive Summary

Two brilliant minds. One product. The fundamental tension: Steve wants to ship something worth keeping; Elon wants to ship something worth testing. Both are right—at different phases.

The resolution: **Ship the minimum that retains.** Not the minimum that functions.

---

## Locked Decisions

### 1. Product Name: **Pulse**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve |
| **Rationale** | "Shipyard Pulse" creates identity. One word. Alive. The heartbeat metaphor gives copywriting leverage across every touchpoint. Elon's counter ("naming theater") is valid for pre-PMF startups, but Shipyard has existing customers—the name matters for internal positioning. |

**LOCKED:** Product ships as "Shipyard Pulse"

---

### 2. Dashboard vs. Email-Only: **Minimal Dashboard Ships in v1**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve (dashboard), Elon (email-only) |
| **Winner** | Compromise — Steve's principle, Elon's scope |
| **Rationale** | Steve's insight is correct: email-only has zero stickiness. Customers need somewhere to *go* when their partner asks "how's our site?" But Elon's token budget is real. The resolution: ship a **single-screen dashboard** with the Health Score, not 5 pages. |

**LOCKED:** v1 includes ONE dashboard screen. Not five.

---

### 3. Technical Stack: **PageSpeed Insights API**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon |
| **Rationale** | Self-hosted Lighthouse at scale = 1,000 compute hours/month for 10K sites. PageSpeed Insights API is free, Google-maintained, and returns the same core metrics. Control what you can't afford to run. Steve conceded this explicitly in Round 2. |

**LOCKED:** Use PageSpeed Insights API. No self-hosted Lighthouse.

---

### 4. Distribution Strategy: **Default-On Trial**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Elon Musk (Round 1) |
| **Winner** | Elon (Steve conceded explicitly) |
| **Rationale** | "Conversion at checkout is 10x harder than preventing cancellation." Every new Shipyard site ships with Pulse Basic pre-activated. Opt-out, not opt-in. This is the growth engine. |

**LOCKED:** Default-on trial for all new Shipyard customers.

---

### 5. Support Model: **Email Replies, No Ticket System**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Both (unanimous) |
| **Rationale** | Steve: "The moment you add tickets, you've admitted the product can't stand on its own." Elon: "Use email. Freshdesk exists. Don't build this." Rare complete agreement. |

**LOCKED:** No ticket system. Customers reply to emails. Use existing tools (Freshdesk/Intercom) if needed.

---

### 6. Kill List — What Does NOT Ship

| Feature | Who Killed It | Reasoning |
|---------|---------------|-----------|
| Slack notifications | Steve | "Nobody needs more Slack noise." |
| Dark mode | Both | Steve: "Ship one thing perfectly." Elon: "Seriously?" |
| Competitor monitoring | Steve | "You're not a spy agency." |
| Quarterly strategy calls | Both | Elon: "Unscalable." Steve conceded. |
| Support ticket system | Both | Unanimous. |
| 5-page dashboard | Elon | Token budget reality. One screen only. |
| Benchmark comparison | Elon | "Vanity feature. Nobody cares if they're top 15%." |
| Complex recommendation engine | Elon | Write 10 static recommendations. Ship that. |

---

### 7. Brand Voice: **Confident and Warm**

| Aspect | Decision |
|--------|----------|
| **Proposed by** | Steve Jobs (Round 1) |
| **Winner** | Steve (Elon endorsed explicitly) |
| **Rationale** | Elon in Round 2: "The brand voice matters... Taste applied to copywriting is high-leverage." Both agree on tone. |

**LOCKED:** Voice = trusted advisor, not SaaS notification blast. No exclamation points. No "just" or "simply." Subject line example: "Your site had a great month."

---

## MVP Feature Set — What Ships in v1

### Must Have (Non-Negotiable)

1. **Single-screen Dashboard**
   - Health Score (prominent, center)
   - Load time metric with context
   - Uptime percentage
   - One-second load time or we've failed
   - No animations in v1 (Elon won this)

2. **Monthly Email**
   - Subject: Narrative, not report ("Your site had a great month")
   - Three-second dopamine hit above fold
   - Link to dashboard
   - Brand voice: confident, warm

3. **Stripe Integration**
   - Checkout flow
   - Subscription management
   - Webhook handling

4. **PageSpeed Insights Integration**
   - API calls to Google
   - Score storage in Postgres
   - Monthly cron job

5. **Uptime Monitoring**
   - Basic ping checks
   - Store results
   - Surface in email/dashboard

### Should Have (v1 if time permits)

6. **Static Recommendations**
   - 10 pre-written improvement suggestions
   - Rule-based display (not AI)
   - "One thing that could make it even stronger"

### Will NOT Have (v2+)

- Multi-page dashboard
- Real-time data
- Agency white-label
- Google Analytics integration
- Competitor monitoring
- Pulsing animations
- Dark mode

---

## File Structure — What Gets Built

```
shipyard-pulse/
├── apps/
│   └── pulse/
│       ├── pages/
│       │   ├── index.tsx           # Landing page
│       │   ├── dashboard/
│       │   │   └── [siteId].tsx    # Single-screen dashboard
│       │   └── api/
│       │       ├── stripe/
│       │       │   ├── checkout.ts
│       │       │   └── webhook.ts
│       │       ├── pagespeed/
│       │       │   └── fetch.ts
│       │       └── cron/
│       │           └── monthly.ts  # Monthly data collection + email
│       ├── components/
│       │   ├── HealthScore.tsx     # The big number
│       │   ├── MetricCard.tsx      # Load time, uptime
│       │   └── EmailTemplate.tsx   # React Email template
│       └── lib/
│           ├── pagespeed.ts        # PageSpeed Insights API client
│           ├── uptime.ts           # Uptime check logic
│           ├── stripe.ts           # Stripe helpers
│           └── recommendations.ts  # Static recommendation logic
├── packages/
│   └── db/
│       └── schema/
│           ├── sites.ts            # Site records
│           ├── metrics.ts          # Historical scores
│           └── subscriptions.ts    # Stripe subscription state
└── emails/
    └── monthly-pulse.tsx           # Monthly email template
```

**Estimated Token Budget:** ~200K tokens for core v1
- Dashboard (single screen): 60K
- Email template + cron: 40K
- Stripe integration: 50K
- PageSpeed integration: 25K
- Uptime monitoring: 25K

---

## Open Questions — What Still Needs Resolution

### 1. The Dashboard Debate — Unresolved Tension

**Status:** Partially resolved, friction remains.

Steve's non-negotiable: "Ship the Dashboard in v1. No dashboard, no deal."
Elon's non-negotiable: "No dashboard in v1. Email + Stripe checkout only."

**Phil's Resolution:** We ship a minimal dashboard (one screen), but Elon's concern about retention-before-proof is valid. We need to answer:

> **What's the conversion rate from "completed Shipyard project" to "Care subscription" today?**

If this number doesn't exist, we're building blind. Get baseline data before launch.

---

### 2. Animation / Polish Level

Steve wants "pulsing heartbeat animation" on Health Score.
Elon calls it "engineering debt disguised as delight."

**Open:** Does the Health Score animate in v1? Current lean: No. Ship static, validate retention, add polish in v2.

---

### 3. Agency Distribution Model

Both agree agencies are the "cheat code" (250 agencies × 40 clients > 10K direct).
Neither spec'd what this means for v1.

**Open:** Does v1 need any agency-facing features? Or is this purely a v2 sales motion?

---

### 4. Single Number vs. Context

Steve: "One number that matters."
Elon: "One number means nothing without context."

**Resolution Needed:** The Health Score must have clear context. Either:
- A comparison ("faster than 80% of sites we manage")
- A trend ("up 12 points from last month")
- A grade interpretation (A/B/C/D/F mapping)

**Open:** Which context model do we implement?

---

### 5. GA Integration

Elon wants to skip Google Analytics entirely ("OAuth flows, token refresh, scope creep, support tickets. Most customers won't do it.")

Steve didn't address this directly.

**Open:** Does v1 include *any* traffic metrics, or purely performance/uptime? If traffic metrics are needed, what's the data source?

---

## Risk Register — What Could Go Wrong

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| PageSpeed API rate limits | Medium | High | Cache results, batch requests, implement backoff |
| Stripe webhook failures | Low | High | Idempotency keys, retry logic, alerting |
| Email deliverability | Medium | Medium | Use established provider (Sendgrid/Postmark), warm domain |
| Dashboard performance > 1s | Medium | High | Static generation, edge caching, minimal JS |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email-only churn (Elon scenario) | Medium | High | Dashboard in v1 addresses this |
| Over-engineered dashboard (Steve scenario) | Medium | Medium | Single screen constraint enforced |
| Zero baseline conversion data | High | High | **CRITICAL:** Measure current conversion BEFORE launch |
| Customers don't understand Health Score | Medium | Medium | Add context/comparison to score display |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Enterprise tier margin trap | Medium | High | Don't offer human hours until proven scalable |
| Agency channel cannibalization | Low | Medium | Clear positioning—agencies mark up, we get volume |
| Default-on trial feels spammy | Medium | Medium | Clear value prop in trial activation email |

---

## The Essence — What This Is Really About

From essence.md:

> **Replacing the anxiety of silence with the confidence that your website is alive and well.**

The feeling: Relief. The exhale after checking and finding out everything's okay.

The one thing that must be perfect: **The monthly email—it arrives, you glance, you feel good, you move on.**

Creative direction: Calm proof, not noisy data.

---

## Final Word

Steve and Elon agree on more than they realize:
- Kill the cruft (tickets, Slack, dark mode)
- Copywriting matters
- Default-on distribution
- PageSpeed over Lighthouse
- Agencies are the scale path

They disagree on one thing: **how much product do you need before you've earned retention?**

The answer is in the middle. Ship the email Steve would be proud of. Ship the dashboard Elon would tolerate. Get to 100 customers. Then let data settle the debate.

Build boring. Write beautiful. Ship Friday.

---

*"The strength of the team is each individual member. The strength of each member is the team."*
— Phil Jackson
