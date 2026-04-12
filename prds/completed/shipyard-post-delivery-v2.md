# PRD: Shipyard Post-Delivery System (Simplified V2)

**Author:** Phil Jackson
**Date:** 2026-04-12
**Status:** Active
**Priority:** P0 — Critical
**Source:** IMPROVE Cycle 4 (Board Review)

---

## Why V2?

The original maintenance system PRD (2026-04-08) failed in the pipeline. It was too complex:
- Full analytics dashboard
- Automated email sequences
- Token tracking database
- Stripe integration
- Triggered alerts

**This PRD descopes to Phase 1 only.** Ship something this week. Iterate later.

---

## Problem Statement

Shipyard operates as a one-time transaction business. After delivery:
- 0% retention
- $0 recurring revenue
- No relationship
- No reason for client to return

**Board Consensus (Cycle 4):**
- Buffett: "7 plugins shipped, $0 recurring added"
- Shonda: "The cliffhanger isn't built"
- Jensen: "Sites ship and we lose visibility"

---

## Phase 1 Scope (This Build)

### What's IN
1. **5 email templates** — Manual send at key milestones
2. **2 maintenance tiers** — Stripe payment links
3. **Simple tracking** — Google Sheet or Notion database

### What's OUT (Phase 2+)
- Automated email triggers
- Client dashboard
- Token tracking system
- Analytics integration
- Overage handling

---

## Deliverable 1: Email Templates

5 plain-text emails with merge fields. Manual send via Gmail/Resend.

### Template 1: Launch Day (Day 0)

**Subject:** Your site is live!

```
Hi {{NAME}},

Your new site is live at {{URL}}.

Here's what we built:
- {{PAGE_COUNT}} pages
- {{FEATURE_LIST}}
- Mobile responsive, SEO optimized

Your project used {{TOKENS_USED}} tokens.

What's next?
1. Share it — post on social, email your customers
2. Test it — click around, report any issues
3. Stay covered — see our maintenance plans below

Need updates? Reply to this email anytime.

— The Shipyard AI team

P.S. Want us to handle ongoing updates? Maintenance plans start at $79/mo.
{{MAINTENANCE_LINK}}
```

### Template 2: Week 1 Report (Day 7)

**Subject:** Your site's first week

```
Hi {{NAME}},

It's been one week since {{URL}} launched.

How's it going? Any issues? Feedback from customers?

Quick tips for week 2:
- Share your site link on your social profiles
- Add it to your email signature
- Ask for feedback from 3 people you trust

Reply to this email with anything you need.

— Shipyard AI

P.S. Not on a maintenance plan yet? $79/mo keeps us on call.
{{MAINTENANCE_LINK}}
```

### Template 3: Month 1 Report (Day 30)

**Subject:** One month in

```
Hi {{NAME}},

{{URL}} has been live for one month.

How's it performing? Here are questions to consider:
- Are you getting contact form submissions?
- Any pages need updating?
- Happy with the design?

We're here if you need tweaks. Maintenance plans: {{MAINTENANCE_LINK}}

Or just reply to this email with what you need.

— Shipyard AI
```

### Template 4: Quarter 1 Report (Day 90)

**Subject:** Q1 complete — refresh time?

```
Hi {{NAME}},

It's been 3 months since we launched {{URL}}.

Time for a check-in:
- Any outdated content?
- New services or products to add?
- Seasonal updates needed?

**Q2 Refresh Idea:** {{REFRESH_SUGGESTION}}

Want us to build this? Reply with interest and we'll quote it.

— Shipyard AI

Current maintenance clients get priority + discounts.
{{MAINTENANCE_LINK}}
```

### Template 5: Anniversary (Day 365)

**Subject:** Happy 1 year, {{NAME}}!

```
Hi {{NAME}},

One year ago today, we launched {{URL}}.

You've come a long way. Your site has been working for you 24/7.

**Anniversary Offer:** 20% off your next project or site refresh.

Ready for:
- Visual refresh?
- New features?
- Completely new site?

Reply to this email and let's talk.

— Shipyard AI

P.S. This offer expires in 30 days.
```

---

## Deliverable 2: Maintenance Tiers

Two tiers. Stripe payment links. No custom billing system.

### Basic Tier — $79/month
- 50K token allowance for updates
- Content changes, bug fixes, minor tweaks
- 48-hour response time
- Email-based requests

### Pro Tier — $199/month
- 200K token allowance
- All Basic features
- Priority queue (24-hour response)
- Quarterly refresh proposal included

### Implementation
1. Create Stripe subscription products
2. Generate payment links
3. Include in email templates
4. Track manually (spreadsheet)

**No dashboard. No automation. Just Stripe links and manual tracking.**

---

## Deliverable 3: Tracking System

Simple spreadsheet with columns:

| Client | Project | Launch Date | Email 1 | Email 2 | Email 3 | Email 4 | Email 5 | Maintenance Tier | Tokens Used |
|--------|---------|-------------|---------|---------|---------|---------|---------|------------------|-------------|
| Sarah | Acme Corp | 2026-04-01 | ✓ | ✓ | | | | Basic | 12K |

**Automation:** Calendar reminders to send each email at Day 0, 7, 30, 90, 365.

---

## Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| First maintenance contract | 1 | 14 days |
| Email open rate | 40% | 30 days |
| Maintenance attach rate | 25% | 60 days |
| MRR from maintenance | $400 | 60 days |

---

## Implementation Timeline

### Day 1-2
- [ ] Write 5 email templates (copy from this PRD)
- [ ] Create Stripe products (Basic $79, Pro $199)
- [ ] Generate payment links

### Day 3
- [ ] Create tracking spreadsheet
- [ ] Set up calendar reminders for existing clients
- [ ] Send first Launch Day emails to recent projects

### Day 4-5
- [ ] Monitor and iterate on templates
- [ ] Send maintenance offers to past clients
- [ ] Document process for future use

**Total build time:** 5 days (no engineering required)

---

## Phase 2 Preview (Not This Build)

After Phase 1 proves the model works (3+ maintenance contracts):

1. **Automated email triggers** — Webhook from pipeline completion
2. **Simple client page** — Static site with token balance
3. **Usage tracking** — Database instead of spreadsheet
4. **Analytics widget** — Cloudflare data embedded

Phase 2 is 2-4 weeks of engineering. Only build if Phase 1 shows demand.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Low maintenance attach | Test messaging in Week 1 email, iterate |
| Emails ignored | A/B test subject lines |
| Manual tracking unsustainable | Only a problem if we have 50+ active clients (good problem) |
| Token estimation wrong | Start conservative, adjust with experience |

---

## Open Questions (Deferred to Phase 2)

1. Should tokens roll over? — Default: No
2. Overage pricing? — Default: Request quote for larger work
3. Annual prepay discount? — Yes, 2 months free (implement if Phase 1 works)

---

## Approval Checklist

- [x] Scope is achievable in 5 days
- [x] No engineering dependencies
- [x] Revenue path clear
- [x] Manual before automated
- [x] Previous PRD failure addressed

---

*Simplified from Cycle 3 PRD based on pipeline failure analysis*
*"Ship manual, automate later."*
