# PRD: Shipyard Care — Post-Launch Maintenance & Site Performance Story

> **Source:** IMPROVE Cycle 2026-04-06
> **Board Sponsors:** Warren Buffett (revenue), Shonda Rhimes (retention)
> **Priority:** HIGH — Transforms one-time revenue into recurring

---

## 1. Project Overview

**Project name:** Shipyard Care
**Product type:** [x] Feature Addition to Shipyard AI
**Target URL/domain:** www.shipyard.company (add /care page + dashboard)
**Deadline:** End of Q2 2026

---

## 2. Business Context

**What does this business do?**
Shipyard AI builds websites, themes, and plugins autonomously from PRDs. Currently, this is a one-time transaction—client submits PRD, we build, we deliver, relationship ends.

**Who is the target audience?**
- Existing Shipyard customers who have received a completed site
- Future customers who want ongoing peace of mind
- Agencies who need maintenance offerings for their clients

**What's the primary goal?**
Transform Shipyard from a transactional project business into a recurring relationship business by adding post-launch maintenance tiers and monthly "Site Performance Story" reports.

**Business Impact:**
- **Revenue:** Add $99-499/mo recurring per customer
- **LTV:** 2-3x increase in customer lifetime value
- **Retention:** Monthly touchpoint prevents customer churn to competitors
- **Data:** Site performance metrics feed into pattern library (moat building)

---

## 3. Features

| # | Feature | Description | Priority |
|---|---------|-------------|----------|
| 1 | **Care Tier Selection** | Three maintenance tiers during checkout or post-launch | Must-have |
| 2 | **Site Performance Story** | Automated monthly email with metrics and recommendations | Must-have |
| 3 | **Performance Dashboard** | Customer-facing dashboard showing site metrics over time | Must-have |
| 4 | **Benchmark Comparison** | Compare site performance to aggregate Shipyard portfolio | Must-have |
| 5 | **Recommendation Engine** | AI-powered suggestions for site improvements | Must-have |
| 6 | **Upgrade Path UI** | Easy tier upgrade from dashboard | Must-have |
| 7 | **Billing Integration** | Stripe subscription management | Must-have |
| 8 | **Support Ticket System** | Request help within allocated hours | Nice-to-have |
| 9 | **Slack/Email Notifications** | Alert on performance issues | Nice-to-have |

---

## 4. Care Tier Structure

### Tier 1: Basic ($99/month)
- Uptime monitoring (5-minute checks)
- Security updates (WordPress core + plugins)
- Monthly Site Performance Story email
- Performance dashboard access
- Email support (48-hour response)

### Tier 2: Pro ($249/month)
- Everything in Basic, plus:
- Content updates (4 hours/month)
- Priority support (24-hour response)
- Quarterly strategy call (30 min)
- A/B testing recommendations

### Tier 3: Enterprise ($499/month)
- Everything in Pro, plus:
- Dedicated account manager
- Same-day response
- 8 hours/month content + development
- Custom integrations support
- Competitor monitoring report

---

## 5. Site Performance Story (Monthly Email)

**Purpose:** Create anticipation, prove value, open upsell opportunities

**Content Structure:**

```
Subject: Your Site's Story — [Month] Performance Report

Hi [Name],

Here's how [site-name] performed this month:

📊 THE NUMBERS
- Visitors: 2,847 (+34% from last month)
- Top page: /pricing (89 conversions)
- Avg. load time: 1.2s (better than 94% of sites)
- Lighthouse score: 94

🏆 HIGHLIGHTS
- Your site outperformed similar sites in your industry by 23%
- Mobile traffic increased 47%—your responsive design is paying off

💡 RECOMMENDATION
Sites like yours with testimonials see 23% more conversions.
[Add Testimonials Section →] (links to upgrade or content request)

📈 BENCHMARK
Your site ranks in the top 15% of all Shipyard sites.
[View full dashboard →]

Questions? Reply to this email or [schedule a call].

— The Shipyard Team
```

**Technical Requirements:**
- Automated data collection from Google Analytics, Lighthouse CI, uptime monitors
- Template system for personalized content
- Recommendation engine based on site type and performance gaps
- Sendgrid/Resend integration for delivery
- Open/click tracking for engagement metrics

---

## 6. Performance Dashboard

**Pages:**

### 6.1 Dashboard Home
- Current tier and billing status
- Quick stats: visitors, uptime, performance score
- Recent alerts (if any)
- Next Site Performance Story date

### 6.2 Metrics Deep Dive
- Traffic trends (daily/weekly/monthly)
- Page performance breakdown
- Core Web Vitals history
- SEO metrics (if available)

### 6.3 Benchmarks
- Compare to industry averages
- Compare to Shipyard portfolio aggregate
- Ranking within tier (gamification)

### 6.4 Recommendations
- AI-generated improvement suggestions
- Priority ranking (impact vs. effort)
- One-click request for implementation (Pro/Enterprise)

### 6.5 Support/Requests
- Submit content update requests
- View hour allocation and usage
- Ticket history

---

## 7. Design Direction

**Brand colors:** Use existing Shipyard palette
**Typography:** Match shipyard.company
**Reference sites:**
- Vercel Dashboard (metrics presentation)
- Cloudflare Analytics (performance visualization)
- WP Engine MyWPE (maintenance dashboard)

**Design Principles:**
- Clean, data-forward
- Progressive disclosure (summary → details)
- Mobile-responsive (customers check on phones)
- Dark mode option

---

## 8. Integrations

- [x] Email delivery (Sendgrid or Resend)
- [x] Payment processing (Stripe subscriptions)
- [x] Analytics (Google Analytics API or Plausible)
- [x] Performance monitoring (Lighthouse CI, WebPageTest API)
- [x] Uptime monitoring (UptimeRobot or Better Uptime)
- [x] User authentication (existing Shipyard auth)
- [ ] Slack notifications (Nice-to-have)
- [ ] Zapier/webhook integration (Nice-to-have)

---

## 9. Data Collection & Pattern Library

**Critical:** All collected metrics feed into Shipyard's pattern library.

**Anonymized Aggregates to Track:**
- Hero section types → conversion rates
- Page layouts → bounce rates
- CTA placements → click-through rates
- Industry benchmarks → expected ranges
- Common issues → preventive recommendations

**This creates Jensen's moat:** "Shipyard sites perform X% better because we've analyzed 1,000+ sites."

---

## 10. Must-Haves vs. Nice-to-Haves

**Must-haves (will not ship without these):**
1. Three-tier subscription model with Stripe billing
2. Monthly Site Performance Story automated emails
3. Customer-facing performance dashboard
4. Benchmark comparison to portfolio aggregate
5. Basic recommendation engine

**Nice-to-haves (only if tokens allow):**
1. Slack integration for alerts
2. Support ticket system
3. Zapier/webhook integration
4. Advanced A/B test recommendations
5. Competitor monitoring (Enterprise tier)

---

## 11. Success Metrics

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Care tier adoption (new customers) | 40% | 90 days |
| Care tier adoption (existing customers) | 20% | 90 days |
| Monthly email open rate | >50% | Ongoing |
| Dashboard monthly active users | >60% of subscribers | Ongoing |
| Tier upgrade rate (Basic → Pro) | 15% | 6 months |
| Churn rate | <5%/month | Ongoing |

---

## 12. Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- Stripe subscription setup
- Database schema for site metrics
- Basic dashboard authentication

### Phase 2: Data Collection (Week 2-3)
- Lighthouse CI integration
- Uptime monitoring setup
- Analytics API connection

### Phase 3: Dashboard Build (Week 3-4)
- Dashboard UI implementation
- Metrics visualization
- Benchmark calculations

### Phase 4: Email Automation (Week 4-5)
- Site Performance Story template
- Email delivery integration
- Recommendation engine v1

### Phase 5: Launch (Week 5-6)
- Pricing page on shipyard.company/care
- Existing customer outreach
- New customer checkout integration

---

## 13. Token Budget

_Filled by Shipyard AI during INTAKE_

| Item | Estimated Tokens |
|------|-----------------|
| Dashboard application (5 pages) | 400K |
| Email template system | 100K |
| Data collection integrations | 150K |
| Stripe billing integration | 100K |
| Recommendation engine | 150K |
| **Total estimate** | 900K |
| Revision buffer | 100K |
| **Total budget** | 1M tokens |

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Low adoption from existing customers | Launch with 50% discount for first 3 months |
| High support burden | Automate as much as possible; clear tier boundaries |
| Data collection complexity | Start with Lighthouse + uptime only; add analytics later |
| Email deliverability | Use established provider (Sendgrid); monitor reputation |

---

## 15. Board Sign-Off

**Buffett:** "This is exactly what's needed. Recurring revenue at these margins is the path to investability."

**Shonda:** "The Site Performance Story is the hook. Make it feel like a gift, not a report."

**Jensen:** "The pattern library data is the hidden gem. Design data collection with future moat in mind."

**Oprah:** "Make onboarding to Care seamless. One click from project completion to subscription."

---

*PRD Created: 2026-04-06*
*Source: IMPROVE Cycle Board Review*
*Status: Ready for INTAKE*
