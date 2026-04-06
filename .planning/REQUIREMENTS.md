# Shipyard Pulse — Phase 1 Requirements

**Generated**: 2026-04-06
**Project Slug**: shipyard-care
**Source**: rounds/shipyard-care/decisions.md, prds/shipyard-care.md
**Phase**: 1 — Core Infrastructure
**Status**: Verified — 15 atomic requirements extracted

---

## Requirements Traceability Matrix

| REQ ID | Requirement | Source | Priority | Task(s) |
|--------|-------------|--------|----------|---------|
| REQ-001 | Create Stripe API integration wrapper with error handling | decisions.md: Must Have - Stripe Integration | P0 | phase-1-task-1 |
| REQ-002 | Build Stripe checkout flow for subscription creation | decisions.md: Must Have - Stripe Integration | P0 | phase-1-task-2 |
| REQ-003 | Implement Stripe webhook endpoint with signature verification and idempotency | decisions.md: Must Have - Stripe Integration | P0 | phase-1-task-3 |
| REQ-004 | Create PostgreSQL database schema for sites table | PRD: Phase 1 - Database schema | P0 | phase-1-task-4 |
| REQ-005 | Create PostgreSQL database table for metrics (PageSpeed scores, uptime results) | decisions.md: Must Have - PageSpeed/Uptime | P0 | phase-1-task-5 |
| REQ-006 | Create PostgreSQL database table for subscriptions (Stripe sync) | decisions.md: Must Have - Stripe Integration | P0 | phase-1-task-6 |
| REQ-007 | Setup database connection with connection pooling | PRD: Phase 1 - Database schema | P0 | phase-1-task-7 |
| REQ-008 | Implement session-based authentication middleware (httpOnly cookies) | PRD: Phase 1 - Basic dashboard auth | P0 | phase-1-task-8 |
| REQ-009 | Create login/logout authentication endpoints | PRD: Phase 1 - Basic dashboard auth | P0 | phase-1-task-9 |
| REQ-010 | Implement route protection for dashboard endpoints | PRD: Phase 1 - Basic dashboard auth | P0 | phase-1-task-10 |
| REQ-011 | Design Health Score calculation algorithm | decisions.md: Must Have - Single-screen Dashboard | P0 | phase-1-task-11 |
| REQ-012 | Build PageSpeed Insights API client | decisions.md: Must Have - PageSpeed Integration | P0 | phase-1-task-12 |
| REQ-013 | Create uptime monitoring ping check mechanism | decisions.md: Must Have - Uptime Monitoring | P0 | phase-1-task-13 |
| REQ-014 | Create database indexes for performance (<100ms p95) | PRD: Phase 1 - One-second load time | P0 | phase-1-task-14 |
| REQ-015 | Implement database migration framework | PRD: Phase 1 - Database schema | P0 | phase-1-task-15 |

---

## Locked Decisions (Non-Negotiable Constraints)

### Product Constraints (from decisions.md)

| Constraint | Decision | Winner |
|------------|----------|--------|
| Product Name | "Shipyard Pulse" | Steve Jobs |
| Dashboard Scope | Single screen only, not 5 pages | Compromise (Steve's principle, Elon's scope) |
| Performance API | PageSpeed Insights API (not self-hosted Lighthouse) | Elon Musk |
| Distribution | Default-on trial for all new Shipyard customers | Elon Musk |
| Support Model | Email replies only, no ticket system | Both (unanimous) |
| Brand Voice | Confident, warm, no exclamation points, no "just" or "simply" | Steve Jobs |
| Animations | No animations in v1 (static Health Score) | Elon Musk |

### Technical Constraints

| Constraint | Decision | Rationale |
|------------|----------|-----------|
| Data Storage | PostgreSQL | Score storage requirement, existing patterns |
| Payment Processing | Stripe Checkout + Webhooks | Must Have requirement |
| Subscription Tiers | Basic ($99), Pro ($249), Enterprise ($499) | PRD tier structure |
| Email Provider | Sendgrid or Resend | Existing plugin patterns |
| Dashboard Load | < 1 second | decisions.md - Hard requirement |
| Health Score | Static display with context (trend or grade) | decisions.md - Open Question #4 |

### Kill List (Explicitly NOT in v1)

Per decisions.md, the following are excluded:

- Multi-page dashboard
- Real-time data
- Agency white-label features
- Google Analytics integration
- Competitor monitoring
- Pulsing animations / heartbeat effect
- Dark mode
- Support ticket system
- Slack notifications
- Benchmark comparison to competitors
- Complex AI recommendation engine (10 static recommendations if time permits)
- Quarterly strategy calls

---

## Phase 1 Scope Boundaries

### IN Scope (Core Infrastructure - Week 1-2)

1. **Stripe Integration**
   - API wrapper with error handling
   - Checkout session creation for three tiers
   - Webhook endpoint with signature verification
   - Idempotency protection for all operations

2. **Database Schema**
   - Sites table: id, url, name, subscription_id, tier, status, created_at, updated_at
   - Metrics table: id, site_id, health_score, load_time, uptime_percent, lighthouse_score, created_at
   - Subscriptions table: id, site_id, stripe_subscription_id, stripe_customer_id, status, tier, trial_ends_at, current_period_end
   - Proper indexes for performance (<100ms p95 queries)

3. **Authentication**
   - Session-based auth with httpOnly cookies
   - Login/logout endpoints
   - Route protection middleware
   - Token refresh mechanism

4. **External API Clients**
   - PageSpeed Insights API integration with caching
   - Uptime ping check mechanism with response time tracking
   - Health Score calculation algorithm

### OUT of Scope (Phase 2+)

- Dashboard UI implementation (Phase 3)
- Monthly email system (Phase 4)
- Landing page (Phase 5)
- Static recommendations (v1 if time permits)
- Cron job for monthly data collection
- Email templates

---

## Acceptance Criteria

### Stripe Integration
- [ ] Can create checkout session for Basic tier ($99/mo)
- [ ] Can create checkout session for Pro tier ($249/mo)
- [ ] Can create checkout session for Enterprise tier ($499/mo)
- [ ] Webhook endpoint validates Stripe signature
- [ ] Duplicate webhook events are handled idempotently (same event ID = no reprocessing)
- [ ] Subscription status updates correctly on webhook receipt
- [ ] Idempotency keys included on all Stripe API calls

### Database
- [ ] Sites table accepts new records with all required fields
- [ ] Metrics table stores PageSpeed scores with timestamps
- [ ] Metrics table stores uptime check results
- [ ] Subscriptions table syncs with Stripe subscription state
- [ ] Queries return in < 100ms at p95
- [ ] Indexes exist on (site_id, created_at DESC) for common queries
- [ ] Migration framework supports versioned, idempotent migrations

### Authentication
- [ ] Login endpoint returns session in httpOnly, Secure, SameSite=Strict cookie
- [ ] Session tokens are NOT stored in localStorage or sessionStorage
- [ ] Protected routes reject unauthenticated requests with 401
- [ ] Logout invalidates session and clears cookie
- [ ] Token refresh works before expiry (15-minute access tokens)

### External APIs
- [ ] PageSpeed API returns performance score for given URL
- [ ] PageSpeed results are cached (5-minute TTL) to avoid rate limits
- [ ] Uptime check returns response time and status
- [ ] Health Score calculated from load time + uptime + lighthouse score

---

## Risk Mitigations Required

### Critical Risks (Must address before development)

| Risk | Mitigation | Task |
|------|------------|------|
| Stripe webhook security not implemented | Verify signatures using stripe.webhooks.constructEvent | phase-1-task-3 |
| Missing idempotency protection | Store processed event IDs, check before processing | phase-1-task-3 |
| Database indexes missing | Add indexes on (site_id, created_at DESC) | phase-1-task-14 |
| Session tokens in localStorage | Use httpOnly cookies exclusively | phase-1-task-8 |

### High Risks (Address during development)

| Risk | Mitigation | Task |
|------|------------|------|
| Test/Live mode Stripe key confusion | Environment variable validation at startup | phase-1-task-1 |
| Database migration chaos | Backwards-compatible, idempotent migrations | phase-1-task-15 |
| Cold start latency (Neon) | Connection pooling, keep-alive pings | phase-1-task-7 |
| PageSpeed API rate limits | Cache results with 5-minute TTL | phase-1-task-12 |

---

## Token Budget Estimate (from decisions.md)

| Component | Estimated Tokens |
|-----------|------------------|
| Dashboard (single screen) | 60K |
| Email template + cron | 40K |
| Stripe integration | 50K |
| PageSpeed integration | 25K |
| Uptime monitoring | 25K |
| **Total estimate** | 200K |

Phase 1 (Core Infrastructure) represents approximately 60-70K tokens of this budget.

---

## Success Metrics (from PRD)

| Metric | Target | Timeframe |
|--------|--------|-----------|
| Care tier adoption (new customers) | 40% | 90 days post-launch |
| Care tier adoption (existing customers) | 20% | 90 days post-launch |
| Monthly email open rate | >50% | Ongoing |
| Dashboard monthly active users | >60% of subscribers | Ongoing |
| Churn rate | <5%/month | Ongoing |

---

## Traceability

Every task in `phase-1-plan.md` traces back to at least one requirement in this document.
Every requirement in this document is covered by at least one task.

**Coverage Status:** 15/15 requirements mapped (100%)

---

*Generated by Great Minds Agency — Phase Planning Skill*
*Source: rounds/shipyard-care/decisions.md, prds/shipyard-care.md*
