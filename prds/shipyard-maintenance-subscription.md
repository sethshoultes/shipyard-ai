# PRD: Shipyard Maintenance Subscription

**Author:** Phil Jackson (via IMPROVE Cycle)
**Date:** 2026-04-20
**Status:** Ready for Pipeline
**Priority:** P1

---

## Problem Statement

Shipyard AI currently operates as a transactional service: customers submit a PRD, receive a shipped product, and the relationship ends. This creates two problems:

1. **Revenue volatility.** Income depends on continuous new customer acquisition. No recurring revenue means no predictable cash flow.

2. **Relationship gap.** After shipping, customers have no ongoing connection to Shipyard. When they need updates, they must re-engage from scratch — or go elsewhere.

Warren Buffett's board review identified this gap: *"Shipyard is a capability, not a business yet. The moment work stops, revenue stops."*

---

## Proposed Solution

Launch **Shipyard Maintenance** — a monthly subscription for post-launch support.

### Tier Structure

| Tier | Price | Includes |
|------|-------|----------|
| **Maintenance** | $500/month | 2 revision rounds per month, priority queue access, monthly health report |
| **Maintenance Plus** | $1,000/month | 5 revision rounds per month, priority queue, health report, quarterly strategy call |

### What's a "Revision Round"?

A revision round = one PRD submitted and shipped. Revisions must be:
- Scoped to existing shipped projects (not new builds)
- Completable within 100K tokens
- Non-breaking changes (bug fixes, content updates, feature additions)

For new builds or major changes, customers purchase additional token packages at standard rates.

### Health Report

Monthly automated check on all shipped projects:
- Uptime monitoring (24-hour response SLA for downtime)
- Broken link detection
- Basic SEO health (meta tags, sitemap, robots.txt)
- Performance snapshot (Core Web Vitals)

Report delivered via email with actionable recommendations.

### Priority Queue

Maintenance subscribers' PRDs processed before non-subscribers. Target SLA:
- Maintenance PRDs: 48-hour start time
- Non-subscriber PRDs: 5-7 day start time

---

## Success Metrics

| Metric | Target (90-day) |
|--------|-----------------|
| Subscribers | 10 |
| MRR from Maintenance | $5,000+ |
| Retention rate | 80%+ (month-over-month) |
| Revision rounds used | 1.5 avg per subscriber per month |

---

## User Stories

### As a founder who shipped with Shipyard...
- I want to make updates without re-engaging from scratch
- I want to know my site is healthy without checking manually
- I want priority access when I have an urgent fix

### As the Shipyard team...
- We want predictable monthly revenue
- We want to maintain relationships with shipped customers
- We want to reduce "cold restart" overhead on returning customers

---

## Scope

### In Scope (V1)
- [ ] Maintenance tier pricing and structure
- [ ] Subscription billing (Stripe integration or manual invoicing for MVP)
- [ ] Priority queue logic in daemon (subscriber PRDs flagged)
- [ ] Health report automation (uptime, broken links, basic SEO)
- [ ] Marketing page update on shipyard.company
- [ ] Email communication for launch to past customers

### Out of Scope (V1)
- Maintenance Plus tier (launch Maintenance first, add Plus based on demand)
- Quarterly strategy calls (manual for now)
- Self-serve subscription management portal
- Integration with customer dashboards

---

## Technical Requirements

### 1. Subscriber Tracking
- Store subscriber list (email, tier, start date, projects covered)
- Flag subscriber PRDs with `priority: true` in frontmatter

### 2. Priority Queue (Daemon Update)
- Modify `daemon.ts` queue processing to sort by priority flag
- Subscribers' PRDs processed before non-subscribers

### 3. Health Report Automation
- Weekly cron or daemon health check on all shipped sites
- Check: HTTP 200, broken links (crawl top 10 pages), meta tag presence
- Monthly digest email to subscriber

### 4. Billing (MVP)
- Manual Stripe invoicing for V1
- Track: subscriber email, tier, payment date, renewal date
- Future: integrate with Stripe subscriptions API

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Low adoption | Launch with discounted "founding subscriber" rate ($400/month for first 5) |
| Revision scope creep | Clear definition: 100K token max, existing projects only |
| Health report false positives | Manual review before sending first 10 reports |
| Priority queue gaming | Subscription required before PRD submission, not after |

---

## Launch Plan

### Week 1: Build
- [ ] Add subscriber tracking (simple JSON or SQLite table)
- [ ] Update daemon with priority flag processing
- [ ] Create health check script (uptime + broken links)
- [ ] Draft marketing copy for shipyard.company

### Week 2: Launch
- [ ] Email past customers announcing Maintenance tier
- [ ] Update shipyard.company pricing section
- [ ] Create founding subscriber offer (first 5 at $400/month)
- [ ] Set up Stripe invoicing for manual billing

### Week 3-4: Iterate
- [ ] Send first health reports to subscribers
- [ ] Gather feedback on report usefulness
- [ ] Track revision round usage patterns

---

## Open Questions

1. **Do we require all projects or per-project pricing?**
   - Recommendation: All projects covered under one subscription (simpler)

2. **What happens if subscriber exceeds revision rounds?**
   - Recommendation: Additional rounds at $200/each (pro-rated token rate)

3. **Can non-customers subscribe before shipping?**
   - Recommendation: No — subscription requires at least one shipped project

---

## Appendix: Board Review References

- **Warren Buffett:** "Launch a 'Shipyard Maintenance' subscription: $500/month for 2 revision rounds + priority queue. This converts one-time customers into recurring revenue."
- **Shonda Rhimes:** "Where's the 'How's the site performing?' check-in 30 days after launch?"
- **Jensen Huang:** "Why isn't there a subscription layer? Shipyard should be building toward 'AWS for AI-built software' not 'boutique agency.'"

---

*Ready for pipeline execution.*
