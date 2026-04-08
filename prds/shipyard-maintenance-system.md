# PRD: Shipyard Maintenance & Post-Delivery System

**Author:** Phil Jackson
**Date:** 2026-04-08
**Status:** Draft
**Priority:** P0 — Critical
**Source:** IMPROVE Cycle 3 (Board Review)

---

## Problem Statement

Shipyard AI currently operates as a project-based business with zero customer relationship after delivery. Once a site ships, the client has no reason to return. This creates several problems:

1. **No recurring revenue** — Each project is a one-time transaction
2. **No retention** — Clients disappear after delivery
3. **No upsell path** — No mechanism to propose future work
4. **No proof of value** — Clients don't see ongoing performance metrics
5. **Not investable** — Project-based models don't scale predictably

### Board Mandate

- **Buffett:** "Project-based model is not investable. Adding maintenance transforms economics."
- **Shonda:** "Shipyard is a one-night stand, not a relationship. No sequel, no spinoff."
- **Jensen:** "Maintenance contracts = recurring revenue moat."

---

## Success Metrics

| Metric | Baseline | Target | Timeline |
|--------|----------|--------|----------|
| Maintenance attach rate | 0% | 30% | 90 days |
| Post-launch engagement | 0% | 40% | 90 days |
| MRR from maintenance | $0 | $3,000 | 6 months |
| Client return rate (new projects) | Unknown | 20% | 12 months |

---

## Solution Overview

Build a three-part system:

### 1. Maintenance Contracts (Revenue)
Recurring monthly token allowance for site updates.

### 2. Site Health Dashboard (Engagement)
Post-launch dashboard showing performance metrics.

### 3. Post-Delivery Email Sequence (Retention)
Automated touchpoints that keep clients engaged.

---

## Detailed Requirements

### Part 1: Maintenance Contracts

#### Pricing Tiers

| Tier | Price | Token Allowance | Features |
|------|-------|-----------------|----------|
| **Basic** | $79/month | 50K tokens | Minor updates, content changes, bug fixes |
| **Pro** | $199/month | 200K tokens | All Basic + priority queue, quarterly refresh proposal |
| **Enterprise** | Custom | 500K+ tokens | All Pro + dedicated agent time, SLA |

#### Token Mechanics
- Unused tokens do NOT roll over
- Overage: $0.15 per 1K tokens (discourages abuse)
- Quarterly refresh uses tokens from allowance
- Emergency requests (same-day) use 1.5x tokens

#### Workflow
1. Project completion triggers maintenance offer email
2. Client selects tier (or declines)
3. Dashboard shows token balance and usage
4. Update requests via form or email
5. Agents execute within token budget
6. Monthly usage report sent automatically

#### UI Requirements
- Maintenance tier selector on project completion page
- Token usage tracker in client dashboard
- Update request form with complexity estimator
- Usage history and invoice generation

---

### Part 2: Site Health Dashboard

#### Metrics to Display

| Category | Metric | Source |
|----------|--------|--------|
| **Traffic** | Visitors (daily/weekly/monthly) | Cloudflare Analytics |
| **Traffic** | Page views | Cloudflare Analytics |
| **Traffic** | Geographic distribution | Cloudflare Analytics |
| **Performance** | Lighthouse scores (Performance, Accessibility, SEO, Best Practices) | Lighthouse CI |
| **Performance** | Core Web Vitals (LCP, FID, CLS) | Cloudflare RUM |
| **Uptime** | Availability % | Uptime monitor |
| **Content** | Last updated date | Git commit history |

#### Dashboard Features
- **Summary card** — "Your site had 1.2K visitors this week (+15%)"
- **Trend charts** — 7-day, 30-day, 90-day views
- **Alerts** — Performance degradation, downtime, security issues
- **Suggestions** — "Your blog hasn't been updated in 30 days"
- **Quick actions** — Request update, view live site, contact support

#### Access Control
- Client receives unique dashboard URL (no account required)
- Optional: Password protection for sensitive metrics
- White-labeled to Shipyard branding

---

### Part 3: Post-Delivery Email Sequence

#### Email Timeline

| Day | Email | Content |
|-----|-------|---------|
| 0 | Launch Celebration | "Your site is live! Here's what we built." + link |
| 7 | Week 1 Report | First week stats, early insights, "Any issues?" |
| 30 | Month 1 Report | Monthly summary, maintenance CTA |
| 90 | Quarter 1 Report | Quarterly recap, refresh proposal |
| 365 | Anniversary | Celebration + year stats + redesign offer (20% off) |

#### Email Features
- Personalized with project name and metrics
- Clear CTA in each email (dashboard, maintenance, contact)
- Unsubscribe option (with "We'll miss you" note)
- Plain-text fallback for deliverability

#### Triggered Emails
- **Downtime alert** — "Your site was down for 15 minutes. We're investigating."
- **Performance drop** — "Lighthouse score dropped from 95 to 82. Want us to fix it?"
- **Anniversary reminder** — Sent 30 days before anniversary with early-bird offer

---

## User Stories

### Client Persona: Sarah (Marketing Manager)
> "I paid Shipyard to build our company site. It launched 3 months ago. I have no idea if it's performing well or if anything needs updating."

**With this system:**
- Sarah receives Week 1 email with traffic stats
- She bookmarks the dashboard and checks monthly
- Month 3: Gets quarterly refresh proposal for blog improvements
- Signs up for Basic maintenance ($79/mo) for peace of mind
- Year 1: Anniversary email prompts her to request a visual refresh

### Internal Persona: Shipyard Pipeline
> "Project completed. Now what?"

**With this system:**
- Pipeline triggers maintenance offer automatically
- If declined: Email sequence runs for passive engagement
- If accepted: Token allowance tracked, requests queued
- Either way: Client stays in ecosystem, return rate increases

---

## Technical Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Client Dashboard                      │
│  (Static site on Emdash — unique URL per client)         │
│  - Traffic metrics (Cloudflare API)                      │
│  - Lighthouse scores (scheduled CI)                      │
│  - Token balance (from Shipyard DB)                      │
│  - Update request form (webhook to pipeline)             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Shipyard Database                     │
│  - clients: name, email, project_id, dashboard_url      │
│  - maintenance: tier, tokens_remaining, created_at      │
│  - usage: request_id, tokens_used, description, date    │
│  - emails: client_id, email_type, sent_at, opened       │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Email Service                         │
│  (Resend or Postmark)                                    │
│  - Scheduled emails via cron                             │
│  - Triggered emails via webhook                          │
│  - Open tracking for engagement metrics                  │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Project Completion**
   - Pipeline writes client record to DB
   - Generates unique dashboard URL
   - Triggers maintenance offer email
   - Schedules email sequence

2. **Maintenance Signup**
   - Client selects tier
   - Stripe subscription created
   - Token balance initialized
   - Welcome email sent

3. **Update Request**
   - Client submits form
   - Token estimate generated
   - If within budget: Queue for execution
   - If over budget: Notify client with options

4. **Monthly Cycle**
   - Token balance resets
   - Usage report generated
   - Invoice sent
   - Dashboard updated

---

## Implementation Phases

### Phase 1: Dashboard MVP (Week 1-2)
- Static dashboard template
- Cloudflare analytics integration
- Lighthouse score display
- Unique URL generation

**Deliverable:** Working dashboard for one pilot client

### Phase 2: Maintenance Contracts (Week 3-4)
- Tier selection flow
- Stripe subscription integration
- Token tracking database
- Update request form

**Deliverable:** Accept first paying maintenance customer

### Phase 3: Email Automation (Week 5-6)
- Email templates (launch, week 1, month 1, quarter 1, anniversary)
- Cron scheduling
- Open tracking
- Triggered alerts

**Deliverable:** Full email sequence running for all clients

### Phase 4: Polish & Scale (Week 7-8)
- Dashboard improvements based on feedback
- Overage handling
- White-labeling options
- Documentation

**Deliverable:** Production-ready system

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low maintenance attach rate | Revenue miss | Strong launch email, early-bird discount |
| Token estimation inaccuracy | Over/under delivery | Build estimation heuristics from past projects |
| Dashboard complexity | Engineering time | Start with MVP metrics, iterate |
| Email deliverability | Missed touchpoints | Use established ESP, monitor deliverability |
| Client churn | MRR loss | Quarterly value demonstrations, lock-in via content |

---

## Success Criteria for Launch

- [ ] Dashboard live for 3+ pilot clients
- [ ] At least 1 maintenance contract signed
- [ ] Email sequence tested end-to-end
- [ ] Token tracking accurate within 5%
- [ ] Client NPS > 8 on dashboard usefulness

---

## Open Questions

1. **Should maintenance contracts include hosting?** — If Emdash hosting is separate, maintenance is pure service. If bundled, more value but more complexity.

2. **What's the right overage rate?** — $0.15/1K is a guess. Need to balance discouraging abuse vs. not punishing good clients.

3. **Annual prepay discount?** — 2 months free for annual? Improves cash flow but reduces flexibility.

---

## Appendix: Competitive Analysis

| Competitor | Maintenance Model |
|------------|-------------------|
| WP Engine | $25-200/mo hosting + optional care plans |
| Squarespace | $16-49/mo all-inclusive |
| Webflow | Enterprise plans include support |
| Traditional agencies | Retainer ($1,000-5,000/mo) |

Shipyard's $79-199/mo is competitive with managed WordPress and significantly cheaper than traditional agency retainers.

---

*PRD prepared for Great Minds Agency pipeline*
