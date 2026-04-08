# PULSE — Locked Decisions

*Consolidated by Phil Jackson, The Zen Master*

---

## Decision Summary

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product Name: PULSE** | Steve | Steve | "One word. One syllable. Says everything." Steve originally proposed ANCHOR; refined to PULSE. Elon conceded: "Take it." Brand > description. |
| 2 | **One Tier at Launch: $99/month** | Both | Consensus | No Basic/Pro/Enterprise paralysis. Both agreed independently. Ship simple. |
| 3 | **No Token Visibility for Clients** | Steve | Steve (framing) | Elon agreed: "Same destination, your framing is better." Clients see "3 updates remaining," not token counts. Tokens create anxiety; outcomes create trust. |
| 4 | **Fixed Request Pricing for Internal Ops** | Elon | Elon | Zero historical data makes token estimation a "6-month rabbit hole." Fixed prices ($25 logo, $50 blog post, $150 new page) are debuggable, explainable, shippable. |
| 5 | **Cut White-Labeling** | Elon | Consensus | Steve conceded: "Own the brand. He's right." V2 feature at earliest. |
| 6 | **Cut Geographic Metrics** | Elon | Consensus | Steve conceded: "Vanity metric." Nobody needs geographic distribution. Cut. |
| 7 | **Cut Enterprise Tier** | Elon | Consensus | Steve conceded: "Build for Sarah, not imaginary enterprise buyers." Zero Pro customers exist. |
| 8 | **Cut Suggestions Engine** | Elon | Elon | "Your blog hasn't been updated" requires content analysis that doesn't exist. V2 feature. |
| 9 | **Cut Triggered Performance Alerts** | Elon | Elon | Requires baseline establishment and anomaly detection. Complex, rarely useful. V2 feature. |
| 10 | **Weekly Lighthouse, Not Daily** | Elon | Consensus | Steve conceded: "Nobody needs daily. Save the compute." 100 sites daily = compute cost + rate limits. |
| 11 | **Warm Human Voice in All Copy** | Steve | Steve | Elon conceded: "This costs nothing and adds everything." Copy examples: "We noticed something — already fixed" not "Alert: Issue detected." |
| 12 | **One-Second Clarity Dashboard** | Steve | Steve | Non-negotiable. Green/Yellow/Red status visible in ONE glance. The first 30 seconds = Shipyard's only mindshare. |
| 13 | **Dashboard Ships With Launch** | Steve | Steve | Elon wanted email + Stripe first, dashboard in "Session 2." Steve: "The dashboard IS the product. Without it, you're selling invisible work." Dashboard ships day one. |
| 14 | **No Password Protection** | Both | Consensus | Unique URLs sufficient. "Add a login and you've killed 40% of engagement on day one." — Steve |
| 15 | **Magic Link Access** | Steve | Consensus | Zero friction. No signup. No forms. |
| 16 | **Kill Overage Pricing at Launch** | Steve | Consensus | Hard caps instead of $0.15/1K overages. "Upgrade or wait." — Elon. No utility metering. |
| 17 | **Hand-Sell First 10 Contracts** | Elon | Elon | Zero clients have ever bought maintenance. This is a cold-start problem. First 10 are human sales, not automation. |
| 18 | **"Built by Shipyard AI" Footer** | Elon | Consensus | Every deployed site is a billboard. Free impressions. Own the brand. |

---

## Phil's Arbitration: Previously Unresolved Items

### Timeline: 5 Weeks

**Elon's position:** 4 weeks. "Week 8 is when we should be iterating on real user feedback."

**Steve's position:** 6 weeks. "The extra two weeks aren't perfectionism. They're the difference between forgettable and remarkable."

**Phil's ruling:** 5 weeks. Split the difference. Elon is right that speed matters — sitting in dev for 2 months is death. Steve is right that first impressions define the relationship. Five weeks gives enough time for the "warm pulse" without wallowing in polish.

- Week 1: Core architecture + database + Stripe integration
- Week 2: Dashboard template + health indicator logic
- Week 3: Email templates + Cloudflare analytics integration
- Week 4: Lighthouse CI setup + cron jobs
- Week 5: Copy refinement + QA + deployment

### Architecture: Static HTML, Rebuilt Nightly

**Elon's position:** Static HTML per client, rebuilt via cron. "2008 technology that works."

**Steve's position:** "Build once, update reactively. Real-time beats stale every time."

**Phil's ruling:** Static wins. Elon is right — at <100 clients, daily rebuilds are sufficient. Nobody checks their dashboard at 2am. The data doesn't need to be real-time; it needs to feel *current*. A "Last updated: Today at 6:00 AM" timestamp with yesterday's numbers is perfectly acceptable for v1.

Reactive architecture is a v2 concern when scaling demands it.

### Health Score: Composite with Drill-Down

**Steve's position:** One beautiful composite number. "Your site's health score." Simple, intuitive, one-second clarity.

**Elon's position:** Black box problem. "When something breaks, Sarah has zero diagnostic information. She calls support."

**Phil's ruling:** Both. Steve gets the one-second clarity — a single Green/Yellow/Red indicator dominates the viewport. But click it, and Elon's diagnostic detail appears: Lighthouse score, uptime percentage, traffic trend. The composite is the default. The components are one tap away.

This reduces support burden (Elon's concern) while preserving emotional simplicity (Steve's vision).

### Internal Request Tracking: Fixed Prices Per Type

**Decision:** Elon's fixed pricing model. No time tracking for v1.

```
{
  "logo_swap": 25,
  "image_replacement": 25,
  "text_update": 25,
  "blog_post": 50,
  "new_section": 75,
  "new_page": 150
}
```

Clients see: "3 updates remaining this month"
Internal logs: Request type + timestamp + completion status

---

## MVP Feature Set (What Ships in V1)

### Core Dashboard
- **Product name:** PULSE
- **One-second status:** Green/Yellow/Red health indicator (visible instantly)
- **One sentence summary:** "1,247 people visited your site this week. Everything looks great."
- **Three metrics only:** Traffic, Health Score, Last Updated
- **Warm human voice:** All copy speaks like a trusted friend
- **Click-through:** Tap health indicator for component breakdown

### Client-Facing
- **Magic link access:** No login, no password, no friction
- **One tier:** $99/month — unlimited small updates
- **Request visibility:** "3 updates remaining this month" (no token exposure)
- **Stripe checkout:** Standard integration
- **Unique dashboard URL:** Per client, unguessable

### Technical Backend
- **One dashboard per client:** Static HTML, rebuilt nightly via cron
- **Database:** 2 tables max (clients, requests) — Stripe handles subscription state
- **Cloudflare Analytics API:** Traffic data integration
- **Lighthouse CI:** Weekly batch runs (not daily)
- **Email system:** 5 templates via cron trigger

### Email Touchpoints (5 Total)
1. **Welcome / Dashboard Ready** — "Your site is live. 52 people visited in the first hour. Here's your dashboard."
2. **Weekly/Monthly Status Summary** — "Your site had a great week."
3. **Request Completed Confirmation** — "We noticed something — already fixed."
4. **Usage Threshold Warning** — "1 update remaining this month"
5. **Anniversary Email (Day 365)** — "We're still here. We still care."

### What's NOT in V1
- White-labeling
- Geographic distribution metrics
- Suggestions engine ("Your blog hasn't been updated...")
- Triggered performance alerts
- Enterprise tier
- Overage handling at $0.15/1K (hard caps only)
- Password protection (unique URLs sufficient)
- Real-time/reactive dashboards
- Multi-tier pricing

---

## File Structure (What Gets Built)

```
pulse/
├── dashboard/
│   ├── index.html                  # Dashboard template
│   ├── styles.css                  # Design system (warm, not cold)
│   └── components/
│       ├── health-indicator.html   # Green/Yellow/Red status
│       ├── health-details.html     # Drill-down (Lighthouse, uptime, traffic)
│       ├── traffic-summary.html    # One sentence traffic
│       └── last-updated.html       # Timestamp display
│
├── api/
│   ├── cloudflare-analytics.js     # Traffic data fetcher
│   ├── lighthouse-runner.js        # Weekly batch Lighthouse
│   └── stripe-webhook.js           # Subscription events
│
├── database/
│   └── schema.sql                  # 2 tables
│       # clients: client_id, dashboard_url, stripe_customer_id,
│       #          requests_remaining, created_at, last_updated
│       # requests: request_id, client_id, type, price, status,
│       #           created_at, completed_at
│
├── emails/
│   ├── welcome.html                # Dashboard ready
│   ├── status-summary.html         # Weekly/monthly digest
│   ├── request-completed.html      # Update confirmation
│   ├── usage-warning.html          # Threshold alert
│   └── anniversary.html            # Day 365 touchpoint
│
├── cron/
│   ├── lighthouse-batch.js         # Weekly Lighthouse runs
│   ├── email-scheduler.js          # Trigger email sends
│   └── dashboard-generator.js      # Nightly static dashboard rebuilds
│
├── static/
│   └── clients/                    # Generated per-client dashboards
│       ├── {client-uuid}/
│       │   └── index.html
│       └── ...
│
└── config/
    ├── pricing.json                # Fixed request prices
    │   # { "logo_swap": 25, "blog_post": 50, "new_page": 150 }
    └── copy.json                   # Human voice templates
        # { "status_great": "Your site had a great week.",
        #   "status_warning": "Your site got a little sluggish. Want us to speed it up?" }
```

---

## Open Questions (Remaining)

### 1. "Unlimited Small Updates" Definition
**Problem:** What qualifies as "small"?
**Proposed boundary:** Under 30 minutes of work = included. Over 30 minutes = counts against monthly allowance.
**Needs:** Clear examples in terms of service and client onboarding.

### 2. Request Dispute Resolution
**Problem:** Client disagrees with categorization (e.g., "That wasn't a new page, it was a text update").
**Mitigation:** Fixed prices + clear definitions published. "Logo swap = single image replacement." "New page = new URL with original content."
**Needs:** Written policy before first client signs.

### 3. Monthly Request Allowance
**Problem:** How many "updates" are included in $99/month?
**Options:**
- 3 updates/month (conservative)
- 5 updates/month (generous)
- Unlimited small, 1 large (hybrid)
**Needs:** Decision from Shipyard based on capacity and margin targets.

### 4. Lighthouse Threshold Logic
**Problem:** What score = Green/Yellow/Red?
**Proposed:**
- Green: Performance ≥ 90, Accessibility ≥ 90
- Yellow: Performance 70-89, or Accessibility 70-89
- Red: Performance < 70, or Accessibility < 70, or site down
**Needs:** Confirmation or adjustment.

### 5. First 10 Clients: Selection Criteria
**Problem:** Which existing clients get approached first?
**Criteria suggestions:**
- Launched within last 6 months (still warm)
- Project value > $20K (invested in quality)
- Responsive communication (likely to engage)
**Needs:** Client list review and prioritization.

---

## Risk Register (What Could Go Wrong)

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Lighthouse at scale** — 100 sites weekly = compute cost + rate limits | Medium | Medium | Batch runs, sampling strategy, caching. Budget for compute. |
| **Cron job collisions** — Sequential Lighthouse runs = 100+ minutes | High at scale | Medium | Parallelization or queue system before 50 clients |
| **CDN cache invalidation** — Static dashboard rebuilds at scale | Medium | Low | Stagger rebuilds, smart cache headers, purge on rebuild |
| **Cloudflare API rate limits** — Traffic data fetching | Low | Medium | Caching layer, graceful degradation, batch requests |
| **Dashboard URL guessing** — UUID collision or brute force | Very Low | High | Use UUIDv4 (122 bits entropy). Monitor for access anomalies. |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **"Unlimited small updates" abuse** — Client exploits ambiguity | High | High | Define clear boundaries: "Under 30 minutes of work." Document examples. |
| **Request disputes** — Client disagrees with categorization | Medium | Medium | Fixed prices + clear definitions. "Logo swap = single image replacement." |
| **Low attach rate** — Less than 30% of clients subscribe | Medium | High | Nail the welcome email. First impression = conversion. Hand-sell first 10. |
| **Support burden from opacity** — "Why did my score drop?" | Medium | Medium | Health indicator drill-down shows components. Reduces black-box anxiety. |
| **Churn at month 3** — Clients don't see value | Medium | High | Anniversary touchpoints. Status summaries. Make invisible work visible. |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **One-person bottleneck** — All requests flow through one human | High at scale | Critical | At 30+ active contracts (120 requests/month), need team or AI execution |
| **No historical data for estimation** | Certain | Medium | Fixed pricing eliminates this — Elon's solution adopted |
| **Scope creep** — V2 features sneaking into V1 | Medium | High | **This document is the contract.** No white-labeling. No suggestions engine. No enterprise tier. |
| **Dashboard feels like afterthought** — Rushed to meet deadline | Medium | High | Week 5 is exclusively for polish and copy. Not feature cramming. |

### Emotional Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Dashboard feels cold/transactional** — Opposite of "warm pulse" | Medium | High | Invest in copy. Every word matters. "Your site got a little sluggish. Want us to speed it up?" |
| **Clients feel nickel-and-dimed** — Despite hiding tokens | Low | High | "Unlimited small updates" framing. Subscription = access, not allowance. |
| **Launch feels forgettable** — Shipped fast but nobody talks about it | Medium | Medium | Steve's point. Design matters. The 30 seconds on dashboard = Shipyard's only mindshare. |
| **Client feels surveilled** — Dashboard feels like monitoring, not caring | Low | Medium | Copy framing: "We're watching *out for* you" not "We're watching you." |

---

## The Essence (Guiding Principles)

From essence.md — the soul of the product:

> **What is this product REALLY about?**
> Proving to clients they haven't been forgotten after the check clears.

> **What's the feeling it should evoke?**
> "You're not alone."

> **What's the one thing that must be perfect?**
> The first glance — one second to feel cared for or abandoned.

> **Creative direction:**
> Warm pulse, not cold dashboard.

---

## Build Phase Directives

1. **This document is the contract.** Any feature not listed here is a V2 discussion.

2. **Steve's soul, Elon's spine.** Warm copy everywhere. Static architecture. Fixed pricing. No scope creep.

3. **First 10 are hand-sold.** No automation substitutes for human learning. Sales before systems.

4. **The dashboard ships day one.** It's not a nice-to-have. It's the product.

5. **Week 5 is for polish, not panic.** If you're adding features in week 5, you've failed.

6. **Timeline: 5 weeks.** Not negotiable. Ship on schedule or cut scope, never extend.

---

## Post-Launch Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First 10 contracts | Within 30 days of launch | Stripe subscriptions |
| Attach rate | 30% of eligible clients | Subscriptions / Total clients |
| Churn rate | < 10% monthly | Cancellations / Active |
| Dashboard engagement | 2+ views/month per client | Analytics |
| Support tickets | < 1 per client per month | Ticket count |

---

*The triangle has spoken. Steve brought the soul. Elon brought the spine. What emerges is PULSE — a product that proves you haven't been forgotten.*

*Now we build.*

*— Phil Jackson*
