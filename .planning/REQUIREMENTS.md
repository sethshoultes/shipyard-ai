# HARBOR: Atomic Requirements Specification

**Generated:** 2026-04-08
**Project Slug:** shipyard-maintenance-system
**Product Name:** HARBOR
**Source PRD:** `/prds/failed/shipyard-maintenance-system.md`
**Source Decisions:** `/rounds/shipyard-maintenance-system/decisions.md`
**Status:** Ready for Implementation
**Total Requirements:** 52

---

## The Essence

> **What is this product REALLY about?**
> Proving to clients they haven't been forgotten after the check clears.

> **What's the feeling it should evoke?**
> "You're not alone."

> **What's the one thing that must be perfect?**
> The first glance — one second to feel cared for or abandoned.

> **Creative direction:**
> Warm pulse, not cold dashboard.

---

## Critical Overrides (Decisions.md > PRD)

| Topic | PRD Says | Decisions.md Says (LOCKED) |
|-------|----------|---------------------------|
| Product Name | Shipyard Maintenance System | **HARBOR** |
| Pricing Tiers | Basic $79, Pro $199, Enterprise custom | **One tier: $79/month** |
| Architecture | Database with tables | **JSON file storage until 500 clients** |
| Dashboard | Real-time rendering | **Static HTML, rebuilt nightly** |
| Token Visibility | Show token balance | **Never show tokens; show "X updates remaining"** |
| Password Protection | Optional | **No passwords; magic links + UUIDv4** |
| Lighthouse Schedule | Daily | **Weekly batch only** |
| Features | Trend charts, suggestions, alerts | **Cut for V1** |

---

## Locked Decisions Summary

| # | Decision | Winner | Build Implication |
|---|----------|--------|-------------------|
| 1 | Product Name: HARBOR | Steve | All UI/emails use "HARBOR" branding |
| 2 | Dashboard Ships Day One | Steve | Dashboard IS the product |
| 3 | One Tier at Launch: $79/month | Elon | No tier selector; single Stripe product |
| 4 | No Token Visibility for Clients | Consensus | Show "updates remaining" not tokens |
| 5 | Fixed Request Pricing (Internal) | Elon | $25 logo, $50 blog, $150 page |
| 6 | No Password Protection | Consensus | Magic links + UUIDv4 only |
| 7 | Static Architecture | Elon | HTML rebuilt nightly via cron |
| 8 | First 10 Contracts Hand-Sold | Consensus | No automation until validated |
| 9 | Cut White-Labeling | Consensus | Shipyard branding visible |
| 10 | Cut Geographic Metrics | Consensus | Not in V1 |
| 11 | Cut Enterprise Tier | Consensus | Not in V1 |
| 12 | Cut Triggered Performance Alerts | Elon | Not in V1 |
| 13 | Weekly Lighthouse, Not Daily | Consensus | Cost/rate limit management |
| 14 | No Overage Pricing at Launch | Consensus | Hard caps with escalation |
| 15 | Warm Human Voice in All Copy | Steve | "Smart friend texting you" |
| 16 | "Built by Shipyard" Footer | Consensus | Distribution billboard |
| 17 | Client-Facing "Updates" Not "Tokens" | Consensus | Human units only |
| 18 | Explicit Overage Path | Elon | $35/update or upgrade prompt |

---

## Requirements Index

| Category | Count | Wave |
|----------|-------|------|
| Dashboard | 6 | 2-3 |
| Client-Facing | 5 | 1-3 |
| Backend | 6 | 1-2 |
| Email | 5 | 2 |
| Design | 5 | 3 |
| Architecture | 7 | 1-2 |
| Domain Logic | 5 | 1-2 |
| Cuts | 14 | N/A |
| **TOTAL** | **52** | - |

---

## Detailed Requirements

### DASHBOARD REQUIREMENTS

#### REQ-DASH-001: Green/Yellow/Red Health Indicator
**Category:** Dashboard
**Priority:** P0 — Blocker
**Source:** Decisions.md Phil's Arbitration

**Description:**
Display one-second visible status using Green/Yellow/Red health indicator on initial dashboard load, dominating viewport position.

**Acceptance Criteria:**
- [ ] Color indicator renders above fold
- [ ] Visible before any other element loads
- [ ] Large enough to see from arm's length

---

#### REQ-DASH-002: One-Sentence Traffic Summary
**Category:** Dashboard
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Show one-sentence traffic summary on dashboard: "{N} people visited your site this week. Everything looks great."

**Acceptance Criteria:**
- [ ] Exactly one sentence
- [ ] Shows actual visitor count from Cloudflare
- [ ] Warm, conversational tone

---

#### REQ-DASH-003: Three Metrics Only
**Category:** Dashboard
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Display exactly three metrics and no more: Traffic (visitor count), Health Score (composite), Last Updated (timestamp).

**Acceptance Criteria:**
- [ ] Count visible metric cards = 3
- [ ] No trend charts visible
- [ ] No geographic data visible

---

#### REQ-DASH-004: Click-Through Health Details
**Category:** Dashboard
**Priority:** P1 — High
**Source:** Decisions.md Phil's Arbitration

**Description:**
Implement click-through from health indicator to diagnostic detail view showing Lighthouse score, uptime percentage, and traffic trend.

**Acceptance Criteria:**
- [ ] Click/tap on indicator opens detail pane
- [ ] Shows three sub-metrics: Lighthouse, uptime, traffic
- [ ] Collapsible back to summary

---

#### REQ-DASH-005: Warm Human Voice Copy
**Category:** Dashboard
**Priority:** P0 — Blocker
**Source:** Decisions.md D-15

**Description:**
All dashboard copy uses warm, human voice consistent with "trusted friend" tone, not corporate default language.

**Acceptance Criteria:**
- [ ] No passive voice
- [ ] No "system" terminology
- [ ] No jargon

---

#### REQ-DASH-006: Last Updated Timestamp
**Category:** Dashboard
**Priority:** P1 — High
**Source:** Decisions.md MVP Feature Set

**Description:**
Display last updated timestamp in format: "Last updated: Today at 6:00 AM"

**Acceptance Criteria:**
- [ ] Shows dashboard rebuild time
- [ ] Updates once per day
- [ ] Format exactly as specified

---

### CLIENT-FACING REQUIREMENTS

#### REQ-CLIENT-001: UUIDv4 Dashboard URLs
**Category:** Client-Facing
**Priority:** P0 — Blocker
**Source:** Decisions.md D-6

**Description:**
Generate unique, unguessable dashboard URL per client using UUIDv4 standard.

**Acceptance Criteria:**
- [ ] URL format: `{domain}/{uuid}`
- [ ] UUID is valid UUIDv4 (122 bits entropy)
- [ ] Different clients get different UUIDs

---

#### REQ-CLIENT-002: Magic Link Access
**Category:** Client-Facing
**Priority:** P0 — Blocker
**Source:** Decisions.md D-6

**Description:**
Implement magic link access — no password login required; access via email-sent link only.

**Acceptance Criteria:**
- [ ] No password field anywhere
- [ ] Client receives email with unique link
- [ ] Clicking link grants access without credentials

---

#### REQ-CLIENT-003: Updates Remaining Display
**Category:** Client-Facing
**Priority:** P0 — Blocker
**Source:** Decisions.md D-4, D-17

**Description:**
Display "X updates remaining this month" in client-facing copy; never show tokens, token counts, or token mechanics.

**Acceptance Criteria:**
- [ ] All client text shows "updates remaining"
- [ ] No "tokens" or "credits" terminology
- [ ] No internal mechanics exposed

---

#### REQ-CLIENT-004: Stripe Checkout
**Category:** Client-Facing
**Priority:** P0 — Blocker
**Source:** Decisions.md D-3

**Description:**
Implement Stripe checkout integration for $79/month subscription initiation.

**Acceptance Criteria:**
- [ ] "Subscribe" button works
- [ ] Redirects to Stripe checkout
- [ ] Subscription created on confirmation

---

#### REQ-CLIENT-005: Single Pricing Tier
**Category:** Client-Facing
**Priority:** P0 — Blocker
**Source:** Decisions.md D-3

**Description:**
Accept only one pricing tier at launch: $79/month (no Basic/Pro/Enterprise tiers).

**Acceptance Criteria:**
- [ ] Single option displayed
- [ ] No tier selector
- [ ] Stripe product configured as single tier

---

### BACKEND REQUIREMENTS

#### REQ-BACKEND-001: Static HTML Dashboards
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md D-7

**Description:**
Generate static HTML dashboards per client, rebuilt nightly via cron job (no real-time rendering).

**Acceptance Criteria:**
- [ ] Dashboard snapshot generated at 6:00 AM daily
- [ ] HTML file per client: `static/clients/{uuid}/index.html`
- [ ] No server-side rendering on page request

---

#### REQ-BACKEND-002: JSON File Storage
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md D-7

**Description:**
Store all data in JSON files (no relational database), with backup strategy on every write.

**Acceptance Criteria:**
- [ ] clients.json and requests.json exist
- [ ] Every data mutation triggers backup
- [ ] No database connections in codebase

---

#### REQ-BACKEND-003: Cloudflare Analytics Integration
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Integrate Cloudflare Analytics API for weekly traffic data (visitors, pageviews, trends).

**Acceptance Criteria:**
- [ ] Dashboard displays traffic counts from Cloudflare
- [ ] Data refreshes weekly
- [ ] Graceful degradation if API unavailable

---

#### REQ-BACKEND-004: Lighthouse CI Weekly Batch
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md D-13

**Description:**
Run Lighthouse CI weekly (not daily) in batch mode for performance scoring.

**Acceptance Criteria:**
- [ ] Lighthouse audit runs once per week
- [ ] Performance and Accessibility scores stored
- [ ] No daily runs

---

#### REQ-BACKEND-005: Five Email Templates
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Implement five automated email templates triggered via cron and webhooks.

**Acceptance Criteria:**
- [ ] All five emails dispatch at correct times
- [ ] Templates use warm voice
- [ ] No cold corporate language

---

#### REQ-BACKEND-006: Health Score Thresholds
**Category:** Backend
**Priority:** P0 — Blocker
**Source:** Decisions.md Open Question #4

**Description:**
Determine and enforce Health Score thresholds: Green (Perf>=90 AND Access>=90), Yellow (either 70-89), Red (either <70 OR site down).

**Acceptance Criteria:**
- [ ] Input Lighthouse scores produce correct color
- [ ] Site down always returns red
- [ ] Threshold logic documented

---

### EMAIL REQUIREMENTS

#### REQ-EMAIL-001: Welcome Email
**Category:** Email
**Priority:** P0 — Blocker
**Source:** Decisions.md Email Touchpoints

**Description:**
Send Welcome/Dashboard Ready email upon subscription: "Your site is live. Here's your dashboard."

**Acceptance Criteria:**
- [ ] Dispatches after Stripe confirmation
- [ ] Contains dashboard link
- [ ] Uses warm, celebratory tone

---

#### REQ-EMAIL-002: Status Summary Email
**Category:** Email
**Priority:** P0 — Blocker
**Source:** Decisions.md Email Touchpoints

**Description:**
Send Weekly/Monthly Status Summary email: "Your site had a great week. [X visitors]"

**Acceptance Criteria:**
- [ ] Sends on schedule (weekly or monthly)
- [ ] Includes actual traffic data
- [ ] Warm, proud-parent tone

---

#### REQ-EMAIL-003: Request Completed Email
**Category:** Email
**Priority:** P1 — High
**Source:** Decisions.md Email Touchpoints

**Description:**
Send Request Completed Confirmation email: "We noticed something — already fixed."

**Acceptance Criteria:**
- [ ] Sends when request marked complete
- [ ] Shows what was done
- [ ] Proactive care messaging

---

#### REQ-EMAIL-004: Usage Warning Email
**Category:** Email
**Priority:** P0 — Blocker
**Source:** Decisions.md Email Touchpoints

**Description:**
Send Usage Threshold Warning email when 1 update remains: "1 update remaining this month."

**Acceptance Criteria:**
- [ ] Triggers when requests_remaining == 1
- [ ] Shows current month window
- [ ] Includes escalation path

---

#### REQ-EMAIL-005: Anniversary Email
**Category:** Email
**Priority:** P1 — High
**Source:** Decisions.md Email Touchpoints

**Description:**
Send Anniversary Email (Day 365): "We're still here. We still care."

**Acceptance Criteria:**
- [ ] Sends exactly one year after subscription start
- [ ] Includes year-in-review stats
- [ ] Genuine care, not upsell

---

### DESIGN REQUIREMENTS

#### REQ-DESIGN-001: Warm Pulse Visual Direction
**Category:** Design
**Priority:** P0 — Blocker
**Source:** Decisions.md Essence

**Description:**
Implement "warm pulse, not cold dashboard" visual direction across all UI elements.

**Acceptance Criteria:**
- [ ] Warm color palette (no cold grays)
- [ ] Soft, welcoming spacing
- [ ] No harsh metrics presentation

---

#### REQ-DESIGN-002: Health Color Indicator
**Category:** Design
**Priority:** P0 — Blocker
**Source:** Decisions.md Phil's Arbitration

**Description:**
Health indicator uses Green/Yellow/Red status colors only; no numerical score visible by default.

**Acceptance Criteria:**
- [ ] Primary shows color, not number
- [ ] Number only visible in detail pane
- [ ] Colors are warm, not harsh

---

#### REQ-DESIGN-003: One-Second Clarity
**Category:** Design
**Priority:** P0 — Blocker
**Source:** Decisions.md Essence

**Description:**
Achieve one-second status clarity — human can glance at dashboard and immediately understand site health status.

**Acceptance Criteria:**
- [ ] Large visible indicator
- [ ] High contrast
- [ ] Position above fold

---

#### REQ-DESIGN-004: Human Conversational Copy
**Category:** Design
**Priority:** P0 — Blocker
**Source:** Decisions.md D-15

**Description:**
All customer-visible copy uses human, conversational voice ("trusted friend" tone, not corporate).

**Acceptance Criteria:**
- [ ] No passive voice
- [ ] No jargon
- [ ] Aligns with "smart friend texting you"

---

#### REQ-DESIGN-005: Shipyard Footer
**Category:** Design
**Priority:** P1 — High
**Source:** Decisions.md D-16

**Description:**
Include "Built by Shipyard" footer on every dashboard as distribution billboard.

**Acceptance Criteria:**
- [ ] Footer visible on every dashboard
- [ ] Links to Shipyard site
- [ ] Consistent placement

---

### ARCHITECTURE REQUIREMENTS

#### REQ-ARCH-001: Static HTML Generation
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md D-7

**Description:**
Static HTML generation per client instead of server-side rendering; one index.html file per `{client-uuid}/index.html`.

**Acceptance Criteria:**
- [ ] All dashboards are static files
- [ ] No server-side processing on request
- [ ] Pages served from disk

---

#### REQ-ARCH-002: JSON Data Layer
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md D-7

**Description:**
No relational database; use JSON file storage with atomic write + backup strategy.

**Acceptance Criteria:**
- [ ] clients.json schema defined
- [ ] requests.json schema defined
- [ ] Backups created on mutations

---

#### REQ-ARCH-003: Cloudflare API Client
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Integrate Cloudflare Analytics API for real traffic data (not synthetic metrics).

**Acceptance Criteria:**
- [ ] Traffic counts match Cloudflare dashboard
- [ ] API authentication works
- [ ] Fallback if API down

---

#### REQ-ARCH-004: Weekly Lighthouse Batch
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md D-13

**Description:**
Run Lighthouse CI weekly in batch (not daily) for cost/rate-limit management.

**Acceptance Criteria:**
- [ ] Once per week only
- [ ] Results cached
- [ ] No daily runs

---

#### REQ-ARCH-005: Magic Link Authentication
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md D-6

**Description:**
Magic link authentication — session tied to UUID + email; no password stored or required.

**Acceptance Criteria:**
- [ ] No password field in system
- [ ] Email link grants session
- [ ] No password hashing logic

---

#### REQ-ARCH-006: UUIDv4 URLs
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md D-6

**Description:**
Dashboard URLs use UUIDv4 format (122 bits entropy); unguessable, no sequential IDs.

**Acceptance Criteria:**
- [ ] Valid UUIDv4 format
- [ ] No discernible patterns
- [ ] Entropy verified

---

#### REQ-ARCH-007: Stripe Webhook Handler
**Category:** Architecture
**Priority:** P0 — Blocker
**Source:** Decisions.md MVP Feature Set

**Description:**
Stripe webhook integration for subscription events (creation, cancellation, renewal).

**Acceptance Criteria:**
- [ ] Events trigger database updates
- [ ] Subscription state synchronized
- [ ] Idempotent processing

---

### DOMAIN LOGIC REQUIREMENTS

#### REQ-DOMAIN-001: Monthly Update Allowance
**Category:** Domain Logic
**Priority:** P0 — Blocker
**Source:** Decisions.md Open Question #1
**Status:** PENDING DECISION

**Description:**
Determine monthly update allowance for $79/month tier.

**Options:**
- 3 updates/month (conservative, sustainable)
- 5 updates/month (generous, competitive)

**Acceptance Criteria:**
- [ ] requests_remaining initialized correctly
- [ ] Decrements on completion
- [ ] Resets monthly

---

#### REQ-DOMAIN-002: Small Update Definition
**Category:** Domain Logic
**Priority:** P0 — Blocker
**Source:** Decisions.md Open Question #2
**Status:** PENDING DECISION

**Description:**
Define "small update" boundary at <=30 minutes of work.

**Classification:**
- Small (included): Logo swap, text fix, image replacement
- Billable: New page, blog post, new section

**Acceptance Criteria:**
- [ ] Documented in terms of service
- [ ] Examples published before launch

---

#### REQ-DOMAIN-003: Hard Cap Enforcement
**Category:** Domain Logic
**Priority:** P0 — Blocker
**Source:** Decisions.md D-14, D-18

**Description:**
Hard cap on updates (no overage pricing); when limit reached, show "Upgrade or wait" prompt with escalation button.

**Acceptance Criteria:**
- [ ] Client at 0 sees upgrade CTA
- [ ] Escalation button sends email
- [ ] No automatic billing for overages

---

#### REQ-DOMAIN-004: Fixed Internal Pricing
**Category:** Domain Logic
**Priority:** P1 — High
**Source:** Decisions.md D-5

**Description:**
Fixed request pricing structure (internal, not client-facing): Logo $25, Text $25, Image $25, Blog $50, Section $75, Page $150.

**Acceptance Criteria:**
- [ ] pricing.json configured
- [ ] Consistent cost estimation

---

#### REQ-DOMAIN-005: Request Dispute Policy
**Category:** Domain Logic
**Priority:** P1 — High
**Source:** Decisions.md Open Question #3
**Status:** PENDING DECISION

**Description:**
Document request dispute resolution policy before launch with concrete examples.

**Acceptance Criteria:**
- [ ] Written policy exists
- [ ] Specific examples included
- [ ] Accessible to clients

---

## Explicitly NOT in V1 (Scope Fence)

These features are explicitly CUT. Do NOT build:

| ID | Feature | Reason | Revisit At |
|----|---------|--------|------------|
| REQ-CUT-001 | White-labeling | Zero demand | 1,000 clients |
| REQ-CUT-002 | Geographic distribution metrics | Vanity metric | Never |
| REQ-CUT-003 | Suggestions engine | Scope creep | V2 |
| REQ-CUT-004 | Triggered performance alerts | Complex infrastructure | V2 |
| REQ-CUT-005 | Enterprise tier | No enterprise clients | 100 clients |
| REQ-CUT-006 | Overage pricing ($0.15/1K) | Kills trust | Never |
| REQ-CUT-007 | Password protection | Friction kills engagement | Never |
| REQ-CUT-008 | Real-time dashboards | Static sufficient for <100 | 500 clients |
| REQ-CUT-009 | Multi-tier pricing | Test single price first | 50 clients |
| REQ-CUT-010 | Token visibility to clients | Anxiety inducing | Never |
| REQ-CUT-011 | Dedicated SQL database | JSON suffices | 500 clients |
| REQ-CUT-012 | Token complexity estimator | No historical data | Never |
| REQ-CUT-013 | Trend charts | Zero conversion lift | V2 |
| REQ-CUT-014 | AI-powered suggestions | V3 feature | V3 |

---

## File Structure (Per Decisions.md)

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

## Risk Summary

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Lighthouse at scale | Medium | Medium | Weekly batch, sampling |
| Cron job collisions | High at scale | Medium | Queue system at 50 clients |
| Cloudflare API limits | Low | Medium | Caching, graceful degradation |
| JSON file corruption | Medium | High | Backup on every write |
| Dashboard URL guessing | Very Low | High | UUIDv4 (122 bits entropy) |

### Business Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Zero attach rate | Medium | Critical | Hand-sell first 10 |
| "Small updates" abuse | High | High | Clear definitions in writing |
| Request disputes | Medium | Medium | Fixed prices + published definitions |
| Churn at month 3 | Medium | High | Make invisible work visible |
| $79 price point wrong | Medium | Medium | Adjust based on first 10 |

### Operational Risks

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| One-person bottleneck | High at scale | Critical | Team expansion at 30 clients |
| Scope creep | Medium | High | This document is the contract |
| Dashboard feels rushed | Medium | High | Week 5 is polish only |

---

## Open Questions (Blocking Launch)

| # | Question | Owner | Deadline |
|---|----------|-------|----------|
| 1 | Monthly request allowance: 3 or 5 updates? | Shipyard leadership | Before first client |
| 2 | "Small update" definition document | Shipyard leadership | Before launch (ToS) |
| 3 | Request dispute resolution policy | Shipyard leadership | Before first client |
| 4 | Lighthouse threshold refinement | Engineering | Week 2 |
| 5 | First 10 client selection criteria | Shipyard sales | Week 5 |
| 6 | Welcome email content approach | Steve + Engineering | Week 3 |
| 7 | Security model: UUID-only vs magic link expiry | Engineering | Week 5 |

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| First 10 contracts | Within 30 days of launch | Stripe subscriptions |
| Attach rate | 30% of eligible clients | Subscriptions / Total clients |
| Monthly churn | < 10% | Cancellations / Active |
| Dashboard engagement | 2+ views/month per client | Analytics |
| Support tickets | < 1 per client per month | Ticket count |

---

## Timeline (5 Weeks)

| Week | Focus | Key Deliverables |
|------|-------|------------------|
| 1 | Core architecture + Stripe | Project setup, JSON schemas, Stripe webhook |
| 2 | Dashboard template + health logic | HTML template, CSS, health indicator, thresholds |
| 3 | Email templates + Cloudflare integration | 5 email templates, Cloudflare API client |
| 4 | Lighthouse CI + cron jobs | Weekly batch runner, nightly generator |
| 5 | Copy refinement + QA + deployment | Polish, voice audit, production deploy |

---

## Ship Test

> Does the client open their HARBOR dashboard and in one second feel cared for — not abandoned?
>
> **If yes, ship it.**

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/shipyard-maintenance-system/decisions.md, prds/failed/shipyard-maintenance-system.md*
*Project Slug: shipyard-maintenance-system*
