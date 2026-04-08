# HARBOR — Locked Decisions

*Consolidated by Phil Jackson, The Zen Master*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product Name: HARBOR** | Steve (R1) | Steve | "Ships leave the shipyard — where do they return? The harbor." One word. Nautical. Emotional. Elon conceded in R2: "I love 'Harbor.' Genuinely. One word, memorable, evocative. Sold." |
| 2 | **Dashboard Ships Day One** | Steve (R1, R2) | Steve | Elon wanted email + Stripe first, dashboard later ("No dashboard v1"). Steve's non-negotiable: "The dashboard IS the product... over my dead body." Phil arbitrated: Dashboard ships, but static architecture. |
| 3 | **One Tier at Launch: $79/month** | Elon (R2) | Elon | Elon: "Two tiers maximum at launch." But with zero customers, even two is premature. Test whether anyone pays before testing whether they upgrade. Steve conceded Basic + Pro can wait. |
| 4 | **No Token Visibility for Clients** | Steve (R1) | Consensus | Both rounds aligned. Steve: "42,000 of 50,000 tokens remaining is anxiety, not service." Elon R2: "Hide token complexity from clients... We track tokens internally; clients see human units." |
| 5 | **Fixed Request Pricing (Internal)** | Elon (R1) | Elon | "Zero historical data makes token estimation impossible." Fixed prices ($25 logo swap, $50 blog post, $150 new page) are debuggable. Steve didn't contest. |
| 6 | **No Password Protection** | Steve (R1) | Consensus | Steve: "A password kills 40% of engagement." Elon raised security concern in R2 ("first client forwards their dashboard link to a competitor") but magic links + unique URLs accepted for v1. |
| 7 | **Static Architecture** | Elon (R1, R2) | Elon | Static HTML per client, rebuilt nightly. "2008 technology that works." Steve R2 concession: "Static dashboards don't scale... One app with client auth is correct at 100+ clients. I was wrong to resist." |
| 8 | **First 10 Contracts Hand-Sold** | Elon (R1) | Consensus | "Zero clients have ever bought maintenance. This is a cold-start problem." Steve R2: "Distribution strategy is missing — Guilty." Both agree: automation amplifies success; it can't create it. |
| 9 | **Cut White-Labeling** | Elon (R1) | Consensus | "Zero clients have asked for this." Steve didn't contest. V2 at earliest. |
| 10 | **Cut Geographic Metrics** | Elon (R1) | Consensus | Steve conceded: "Nobody wakes up excited about user distribution by country." Vanity metric. Cut. |
| 11 | **Cut Enterprise Tier** | Both (R1, R2) | Consensus | Elon R1: "You have zero enterprise clients." Steve R1: "Enterprise is a conversation, not a checkbox." Steve R2: "Enterprise tier — Cut. Zero clients asking." |
| 12 | **Cut Triggered Performance Alerts** | Elon (R1) | Elon | "Requires monitoring infra. V2." Requires baseline establishment and anomaly detection. Complex, rarely useful at scale. |
| 13 | **Weekly Lighthouse, Not Daily** | Elon (R1) | Consensus | "100 sites daily = compute cost + rate limits." Steve didn't contest. Weekly batch is sufficient. |
| 14 | **No Overage Pricing at Launch** | Both (R1, R2) | Consensus | Steve R1: "Handle overages gracefully." Elon R2: "Hard caps." Both agreed: no utility metering, no $0.15/1K token overages. Hard caps with human escalation path. |
| 15 | **Warm Human Voice in All Copy** | Steve (R1) | Steve | "Every notification should feel like a smart friend texting you." Elon R2 conceded: "First email should celebrate, not sell... The dopamine hit matters." |
| 16 | **"Built by Shipyard" Footer** | Elon (R1) | Consensus | "Every deployed site is a billboard. Free impressions." Steve R2: "Immediately actionable." Distribution strategy at zero cost. |
| 17 | **Client-Facing "Updates" Not "Tokens"** | Elon (R2) | Consensus | "3 updates/month" or "8 updates/month." Clear. Measurable. Steve R2: "Accept '3 updates/month' client-facing, even if tokens run underneath." |
| 18 | **Explicit Overage Path** | Elon (R2) | Elon | "Overages are $35/update or upgrade prompt — not free relationship-building." Steve wanted phone calls; Elon wants clarity at scale. |

---

## Phil's Arbitration: Contested Items

### Timeline: 5 Weeks

**Elon:** 72 hours for MVP (R1), 2 weeks (R2). Ship embarrassingly simple. Learn fast.

**Steve:** Quality requires time. 8 weeks original PRD. Conceded to 3-4 weeks in R2.

**Ruling:** 5 weeks. Speed matters (no 2-month dev cycles), but so does craft. Five weeks delivers "warm pulse" without perfectionism paralysis.

| Week | Focus |
|------|-------|
| 1 | Core architecture + Stripe integration |
| 2 | Dashboard template + health indicator logic |
| 3 | Email templates + Cloudflare analytics integration |
| 4 | Lighthouse CI setup + cron jobs |
| 5 | Copy refinement + QA + deployment |

### Dashboard: Real-Time vs Static

**Elon:** Static HTML, rebuilt nightly. Simplicity wins.

**Steve:** "Real-time beats stale every time." (R1 implication)

**Ruling:** Static wins. At <100 clients, daily rebuilds are sufficient. "Last updated: Today at 6:00 AM" is acceptable for v1. Steve gets the experience; Elon gets the architecture. Steve R2 conceded: "Static dashboards don't scale — One app with client auth is correct at 100+ clients. I was wrong to resist."

### Health Score: Composite vs Breakdown

**Steve:** One beautiful composite number. One-second clarity. "The first glance — one second to feel cared for or abandoned."

**Elon:** Black box problem. When something breaks, clients have zero diagnostic info.

**Ruling:** Both. A single Green/Yellow/Red indicator dominates the viewport (Steve). Click it, and diagnostic detail appears: Lighthouse score, uptime, traffic trend (Elon). Composite is the default. Components are one tap away.

### Overage Handling: Graceful vs Hard Cap

**Steve R1:** "NO to overage pricing on Day 1. Handle it gracefully. Call them. Upgrade them."

**Elon R2:** "That's a luxury for a company with 50 clients and time to spare. At 500 clients, that's a full-time employee doing customer success theater."

**Ruling:** Hard caps with human escalation path. System defaults to "Upgrade or wait" — with a clear button to request a conversation. Automation first, human override available.

---

## MVP Feature Set (What Ships in V1)

### Core Dashboard
- **Product name:** HARBOR
- **One-second status:** Green/Yellow/Red health indicator (visible instantly)
- **One sentence summary:** "1,247 people visited your site this week. Everything looks great."
- **Three metrics only:** Traffic, Health Score, Last Updated
- **Warm human voice:** All copy speaks like a trusted friend
- **Click-through detail:** Tap health indicator for component breakdown (Lighthouse, uptime, traffic)

### Client-Facing
- **Magic link access:** No login, no password, no friction
- **One tier:** $79/month
- **Request visibility:** "3 updates remaining this month" (no token exposure)
- **Stripe checkout:** Standard integration
- **Unique dashboard URL:** Per client, unguessable (UUIDv4)

### Technical Backend
- **Static HTML dashboards:** One per client, rebuilt nightly via cron
- **Data storage:** JSON file until 500 clients — Stripe handles subscription state
- **Cloudflare Analytics API:** Traffic data integration
- **Lighthouse CI:** Weekly batch runs
- **Email system:** 5 templates via cron trigger

### Email Touchpoints (5 Total)
1. **Welcome / Dashboard Ready** — "Your site is live. Here's your dashboard."
2. **Weekly/Monthly Status Summary** — "Your site had a great week."
3. **Request Completed Confirmation** — "We noticed something — already fixed."
4. **Usage Threshold Warning** — "1 update remaining this month"
5. **Anniversary Email (Day 365)** — "We're still here. We still care."

### Explicitly NOT in V1

| Feature | Reason | Who Cut It | Revisit At |
|---------|--------|------------|------------|
| White-labeling | Zero demand | Elon (consensus) | 1,000 clients |
| Geographic distribution metrics | Vanity metric | Elon (Steve conceded) | Never |
| Suggestions engine | Scope creep | Elon | V2 |
| Triggered performance alerts | Complex infrastructure | Elon | V2 |
| Enterprise tier | No Pro customers yet | Both | 100 clients |
| Overage pricing ($0.15/1K) | Utility metering kills trust | Both | Never |
| Password protection | Friction kills engagement | Steve (consensus) | Never |
| Real-time dashboards | Overkill at scale | Elon (Steve conceded R2) | 500 clients |
| Multi-tier pricing | Test single price first | Elon | 50 clients |
| Token visibility to clients | Anxiety inducing | Steve (consensus) | Never |
| Dedicated database | JSON suffices | Elon | 500 clients |
| Token complexity estimator | No historical data | Both | Never |
| Trend charts | Complexity for zero conversion lift | Elon | V2 |
| AI-powered upsell (Suggestions) | That's v3 | Elon | V3 |

---

## File Structure (What Gets Built)

```
harbor/
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
├── data/
│   ├── clients.json                # Client records
│   │   # Schema: { client_id, dashboard_url, stripe_customer_id,
│   │   #           requests_remaining, created_at, last_updated }
│   └── requests.json               # Request records
│       # Schema: { request_id, client_id, type, price, status,
│       #           created_at, completed_at }
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
│       └── {client-uuid}/
│           └── index.html
│
└── config/
    ├── pricing.json                # Fixed request prices
    │   # { logo_swap: 25, image_replacement: 25, text_update: 25,
    │   #   blog_post: 50, new_section: 75, new_page: 150 }
    └── copy.json                   # Human voice templates
        # { status_great: "Your site had a great week.",
        #   issue_fixed: "We noticed something — already fixed." }
```

---

## Open Questions (What Still Needs Resolution)

### 1. Monthly Request Allowance
**Decision needed:** How many "updates" are included in $79/month?

| Option | Pros | Cons |
|--------|------|------|
| 3 updates/month | Conservative, sustainable margins | May feel stingy |
| 5 updates/month | Generous, competitive | Risk of abuse |
| Unlimited small + 1 large | Flexible | Definitional disputes |

**Context:** Elon R2 proposed "3 updates/month" or "8 updates/month" as clear options.

**Owner:** Shipyard leadership
**Deadline:** Before first client signs

### 2. "Small Update" Definition
**Proposed boundary:** Under 30 minutes of work = "small" = included

| Update Type | Classification |
|-------------|----------------|
| Logo swap | Small (included) |
| Text typo fix | Small (included) |
| Image replacement | Small (included) |
| New page | Billable |
| Blog post formatting | Billable |
| New section | Billable |

**Context:** Elon R2: "Constraints clarify... Ambiguity feels generous; it's actually a support ticket waiting to happen."

**Owner:** Shipyard leadership
**Deadline:** Document in terms of service before launch

### 3. Request Dispute Resolution
**Problem:** Client disagrees with categorization ("That wasn't a new page, it was a text update")

**Context:** Elon R2: "Every request requires work. MRR looks great until margins compress."

**Needed:** Written policy with examples. Fixed prices help, but edge cases will occur.

**Owner:** Shipyard leadership
**Deadline:** Before first client signs

### 4. Lighthouse Threshold Logic
**Proposed thresholds:**

| Status | Criteria |
|--------|----------|
| Green | Performance >= 90 AND Accessibility >= 90 |
| Yellow | Performance 70-89 OR Accessibility 70-89 |
| Red | Performance < 70 OR Accessibility < 70 OR site down |

**Owner:** Engineering
**Deadline:** Before dashboard build (Week 2)

### 5. First 10 Client Selection
**Suggested criteria:**
- Launched within last 6 months (still warm)
- Project value > $20K (invested in quality)
- Responsive communication (likely to engage)

**Context:** Elon R1: "How many projects does Shipyard complete per month? If it's <5, the maintenance funnel is a rounding error."

**Owner:** Shipyard sales
**Deadline:** Client list review needed before Week 5

### 6. Welcome Email Content
| Option | Description | Complexity |
|--------|-------------|------------|
| A | "Your site is live. Here's your dashboard." | Ships fast |
| B | "Your site is live. 52 people visited today." | Requires analytics pipeline |

**Context:** Elon R2 conceded: "First email should celebrate, not sell. '1,247 visitors in week one' beats 'Welcome to your maintenance portal.'"

**Recommendation:** Option A for v1 welcome email. Let the dashboard deliver the numbers. Weekly status email (email #2) delivers the visitor count.

**Owner:** Steve (copy) + Engineering (implementation)
**Deadline:** Week 3

### 7. Security Model for Dashboard URLs
**Problem:** Elon R2 raised concern: "The 'no password' stance will last until the first client forwards their dashboard link to a competitor."

**Options:**
- Accept risk (UUIDv4 is unguessable)
- Add optional PIN protection (client choice)
- Implement magic link expiry + refresh

**Owner:** Engineering
**Deadline:** Before launch (Week 5)

---

## Risk Register (What Could Go Wrong)

### Technical Risks

| Risk | Likelihood | Impact | Mitigation | Source |
|------|------------|--------|------------|--------|
| **Lighthouse at scale** — 100 sites weekly = compute cost + rate limits | Medium | Medium | Batch runs, sampling strategy, caching. Budget for compute. | Elon R1 |
| **Cron job collisions** — Sequential Lighthouse runs = 100+ minutes | High at scale | Medium | Parallelization or queue system before 50 clients | Elon R1 |
| **Cloudflare API rate limits** — Traffic data fetching | Low | Medium | Caching layer, graceful degradation, batch requests | Elon R1 |
| **Dashboard URL guessing** — UUID collision or brute force | Very Low | High | UUIDv4 (122 bits entropy). Monitor for access anomalies. | Elon R2 |
| **JSON file corruption** — No database = no ACID guarantees | Medium | High | Backup on every write. Graduate to SQLite at 200 clients. | Elon R1 |
| **Integration surface area** — Cloudflare API, Lighthouse CI, Stripe, Resend, custom DB, token logic | Medium | High | Limit integrations in v1. Elon R1: "Can one agent session build the 8-week plan? No." | Elon R1 |

### Business Risks

| Risk | Likelihood | Impact | Mitigation | Source |
|------|------------|--------|------------|--------|
| **Zero attach rate** — No existing client buys | Medium | Critical | Hand-sell first 10. Human learning before automation. | Elon R1 |
| **"Small updates" abuse** — Client exploits ambiguity | High | High | Define clear boundaries in writing. 30-minute threshold. | Elon R2 |
| **Request disputes** — Client disagrees with categorization | Medium | Medium | Fixed prices + published definitions before launch. | Elon R1/R2 |
| **Churn at month 3** — Clients don't see value | Medium | High | Make invisible work visible. Status summaries. Anniversary emails. | Steve R1 |
| **$79 price point wrong** — Too high or too low | Medium | Medium | Start at $79. Adjust based on first 10 conversations. | Elon R1 |
| **This is a services business wearing SaaS clothes** — Every request requires work | Medium | High | Clear update limits. Fixed pricing. Don't promise automation you can't deliver. | Elon R1 |
| **Acquisition bottleneck** — Not enough clients to make maintenance math work | High | Critical | "Fix acquisition first." (Elon R1) Maintenance is downstream of project volume. | Elon R1 |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation | Source |
|------|------------|--------|------------|--------|
| **One-person bottleneck** — All requests flow through single human | High at scale | Critical | At 30+ contracts, need team expansion or AI execution | Elon R1 |
| **Scope creep** — V2 features sneaking into V1 | Medium | High | **This document is the contract.** No exceptions. | Both |
| **Dashboard feels rushed** — Shipped fast, looks abandoned | Medium | High | Week 5 is exclusively polish. Not feature cramming. | Steve R2 |
| **Overage handling at scale** — "Call them. Upgrade them" doesn't scale | High at 500+ | Medium | Hard caps with escalation button. Automation first. | Elon R2 |

### Emotional Risks (The Soul)

| Risk | Likelihood | Impact | Mitigation | Source |
|------|------------|--------|------------|--------|
| **Dashboard feels cold** — Opposite of "warm pulse" | Medium | High | Copy investment. Every word matters. Steve's voice, not developer defaults. | Steve R1 |
| **Clients feel nickel-and-dimed** — Despite hiding tokens | Low | High | "Updates remaining" not "credits consumed." Frame as abundance, not scarcity. | Steve R1 |
| **Client feels surveilled** — Dashboard = monitoring, not caring | Low | Medium | Copy framing: "We're watching *out for* you" not "We're watching you." | Steve R1 |
| **PDF emails = emotional death** — Elon's fallback feels cold | N/A (rejected) | High | Dashboard ships in v1. Not a PDF. Not "later." | Steve R2 |

---

## The Essence (Guiding Star)

From essence.md — the soul that survives every cut:

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

1. **This document is the contract.** Any feature not listed here is V2.

2. **Steve's soul, Elon's spine.** Warm copy everywhere. Static architecture. JSON storage. Fixed pricing. No scope creep.

3. **First 10 are hand-sold.** No automation substitutes for human learning.

4. **The dashboard ships day one.** It's not a nice-to-have. It's the product.

5. **Week 5 is for polish, not panic.** If you're adding features in week 5, you've failed.

6. **Timeline: 5 weeks.** Ship on schedule or cut scope. Never extend.

7. **Earn complexity through traction.** JSON until 500. SQLite at 500. Postgres at 5,000.

8. **Two competing truths, resolved:** Steve R2: "The fastest path to revenue is not the fastest path to a business worth having." Elon R2: "Ship ugly. Learn fast. Earn the right to be beautiful." **Resolution:** Ship something beautiful enough to prove the concept, simple enough to ship in 5 weeks.

---

## Success Metrics (Post-Launch)

| Metric | Target | Measurement |
|--------|--------|-------------|
| First 10 contracts | Within 30 days of launch | Stripe subscriptions |
| Attach rate | 30% of eligible clients | Subscriptions / Total clients |
| Monthly churn | < 10% | Cancellations / Active |
| Dashboard engagement | 2+ views/month per client | Analytics |
| Support tickets | < 1 per client per month | Ticket count |

**Note:** Elon R1 warned attach rate benchmarks are optimistic: "30% attach rate is optimistic. Industry upsell benchmarks: 10-15%. Plan for 15%." Measure against both targets.

---

## Summary: Who Won What

| Domain | Winner | Key Concession |
|--------|--------|----------------|
| **Brand & Name** | Steve | Elon: "I love 'Harbor.' Sold." |
| **Dashboard v1** | Steve | Elon wanted email-only MVP; Steve's non-negotiable won |
| **Architecture** | Elon | Steve conceded static is correct for <100 clients |
| **Timeline** | Phil (arbitrated) | 5 weeks — faster than Steve's 8, slower than Elon's 2 |
| **Pricing Model** | Elon | Fixed prices, clear limits, no token complexity |
| **Copy & Voice** | Steve | Elon: "This costs zero engineering time and changes everything" |
| **Distribution** | Elon | Steve: "Distribution strategy is missing — Guilty" |
| **Token Visibility** | Consensus | Both agreed: show outcomes, not machinery |

---

*The triangle has spoken. Steve brought the soul. Elon brought the spine. What emerges is HARBOR — a product that proves to clients they haven't been forgotten.*

*Ships return to harbor. So do clients.*

*Now we build.*

---

*— Phil Jackson, The Zen Master*
