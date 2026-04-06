# Decisions — EmDash Plugins v1

**Round:** 003-emdash-plugins
**Debaters:** Steve Jobs (Design & Experience), Elon Musk (Product & Growth)
**Arbiter:** Phil Jackson

---

## Locked Decisions

### 1. Plugin Naming

| Decision | Keep **MemberShip**, Rename EventDash to **Convene** |
|----------|------------------------------------------------------|
| Proposed by | Steve (Round 1) |
| Winner | Steve |
| Why | Elon conceded MemberShip in Round 2 ("The capitalization is clever. Keep it."). On Convene vs. EventDash: Steve's argument that "names are the first UX" and do "emotional work that code cannot" went unchallenged in substance. Elon called it "procrastination wearing a turtleneck" but offered no alternative. Names ship free — no engineering cost. Steve wins on principle: users don't buy software, they buy feelings. |

### 2. Data Architecture — Stripe as Source of Truth

| Decision | Stripe is the single source of truth for subscription state |
|----------|-------------------------------------------------------------|
| Proposed by | Elon (Round 1) |
| Winner | Elon |
| Why | Steve argued for local state as "trust" (instant data availability). Elon countered that replication creates sync bugs, stale data, and double security surface. The tiebreaker: Steve never disputed the technical risk, only the UX concern. Compromise position: query Stripe, cache briefly for display, never persist subscription state in KV. If Stripe is slow, show cached data with "refreshing..." indicator — not a blank screen. |

### 3. Data Architecture — D1 (SQLite) for List Operations

| Decision | All entities requiring filter/sort/pagination use D1, not KV |
|----------|--------------------------------------------------------------|
| Proposed by | Elon (Round 1) |
| Winner | Elon (with Steve's explicit endorsement) |
| Why | Steve conceded in Round 2: "He's right about KV scaling... Cursor pagination isn't optional. It's table stakes for v1." The 1,001 KV reads per admin page load at 1,000 members is indefensible. KV remains for auth tokens and session cache only. |

### 4. Cursor Pagination — Ship Day One

| Decision | All list endpoints use cursor-based pagination from v1 |
|----------|--------------------------------------------------------|
| Proposed by | Elon (Round 1), elevated to non-negotiable by Steve (Round 2) |
| Winner | Consensus |
| Why | Steve's framing won the argument: "If the admin dashboard ever hangs, even once, users will never fully trust the product again. Performance is a feature. Sluggishness is a moral failing." Both agree this is non-negotiable. |

### 5. First-Run Experience — 60-Second Benchmark

| Decision | Install to first success (event published or plan created) in under 60 seconds |
|----------|---------------------------------------------------------------------------------|
| Proposed by | Steve (Round 1, formalized Round 2) |
| Winner | Steve (with Elon's endorsement) |
| Why | Elon conceded in Round 2: "First 30 seconds define retention. If onboarding sucks, nothing else matters. Steve's coffee test is the right benchmark." This is now the only metric that predicts word-of-mouth. |

### 6. Brand Voice — Conversational, Not Technical

| Decision | UI copy uses conversational language, not technical jargon |
|----------|-----------------------------------------------------------|
| Proposed by | Steve (Round 1) |
| Winner | Steve (with Elon's endorsement) |
| Why | Elon conceded explicitly: "'Connect Stripe' beats 'Configure your Stripe webhook endpoint.' This costs zero engineering time and 100% improves adoption. Do it." |

### 7. Scope — Cut Phase 5 Entirely

| Decision | No group memberships, cohort analysis, PayPal, CSV import, developer webhooks, event series, categories, or venues in v1 |
|----------|---------------------------------------------------------------------------------------------------------------------------|
| Proposed by | Elon (Round 1) |
| Winner | Elon (with Steve's endorsement) |
| Why | Steve conceded in Round 2: "He's right that Phase 5 is v2. Group memberships, cohort analysis, PayPal — cut them. Not because they're bad ideas, but because shipping late is worse than shipping focused." |

### 8. Email Templates — Beautiful Defaults, No WYSIWYG

| Decision | Ship one gorgeous email template per event type; power users can edit HTML |
|----------|---------------------------------------------------------------------------|
| Proposed by | Steve (Round 1) |
| Winner | Steve (unchallenged) |
| Why | "A WYSIWYG email editor is 2,000 lines of code, dozens of edge cases, and infinite support tickets... You've just saved two weeks of development for 3% of users." Elon's "ruthless reduction" philosophy aligns; no counter-argument offered. |

### 9. Testing — E2E Coverage Required

| Decision | No shipping payment software without E2E test coverage |
|----------|-------------------------------------------------------|
| Proposed by | Elon (Round 1), elevated by Steve (Round 2) |
| Winner | Consensus |
| Why | Steve: "You cannot ship payment software on vibes. If a webhook fails silently, we've stolen someone's money. That's not a bug — it's a betrayal." Non-negotiable for both. |

---

## MVP Feature Set (What Ships in v1)

### MemberShip Plugin
- [ ] `definePlugin` registration with EmDash
- [ ] Member registration flow (single form)
- [ ] Stripe Checkout integration (subscription creation)
- [ ] Stripe webhook handler (subscription lifecycle events)
- [ ] Access check endpoint (`/check-access`)
- [ ] Member dashboard (view own subscription, cancel)
- [ ] Admin: member list with cursor pagination
- [ ] Admin: create/edit membership plans
- [ ] Admin: basic settings (Stripe connection)
- [ ] Email: registration confirmation (beautiful default template)
- [ ] Empty state: "Your first member is one link away"

### Convene Plugin (formerly EventDash)
- [ ] `definePlugin` registration with EmDash
- [ ] Event creation (single form: title, date, time, description, capacity, price)
- [ ] Event registration flow
- [ ] Stripe Checkout integration (one-time payment)
- [ ] Stripe webhook handler (payment events)
- [ ] Attendee list per event
- [ ] Admin: event list with cursor pagination
- [ ] Admin: basic settings (Stripe connection)
- [ ] Email: registration confirmation (beautiful default template)
- [ ] Empty state: "Your first event is 60 seconds away"

### Explicitly NOT in v1
- Event series / recurring events
- Event categories / tags
- Venue management
- Group/corporate memberships
- Multi-step registration wizards
- Cohort analysis / LTV / conversion funnels
- PayPal or any non-Stripe payment processor
- CSV import/export
- Developer webhooks with HMAC signing
- WYSIWYG email editor
- Attendee comments / discussion threads

---

## File Structure (What Gets Built)

```
packages/
├── plugin-membership/
│   ├── src/
│   │   ├── index.ts              # definePlugin entry point
│   │   ├── routes/
│   │   │   ├── register.ts       # POST /register
│   │   │   ├── webhook.ts        # POST /webhook (Stripe)
│   │   │   └── check-access.ts   # GET /check-access
│   │   ├── admin/
│   │   │   ├── members.ts        # Block Kit: member list
│   │   │   ├── plans.ts          # Block Kit: plan management
│   │   │   └── settings.ts       # Block Kit: Stripe connection
│   │   ├── db/
│   │   │   ├── schema.ts         # D1 schema (members, plans)
│   │   │   └── queries.ts        # Paginated queries
│   │   ├── stripe/
│   │   │   ├── checkout.ts       # Create checkout session
│   │   │   └── webhooks.ts       # Handle subscription events
│   │   ├── email/
│   │   │   └── templates.ts      # Beautiful default templates
│   │   └── types.ts
│   ├── tests/
│   │   ├── e2e/
│   │   │   ├── registration.test.ts
│   │   │   └── webhooks.test.ts
│   │   └── unit/
│   └── package.json
│
├── plugin-convene/               # Renamed from plugin-eventdash
│   ├── src/
│   │   ├── index.ts              # definePlugin entry point
│   │   ├── routes/
│   │   │   ├── register.ts       # POST /events/:id/register
│   │   │   ├── webhook.ts        # POST /webhook (Stripe)
│   │   │   └── events.ts         # GET /events, GET /events/:id
│   │   ├── admin/
│   │   │   ├── events.ts         # Block Kit: event list
│   │   │   ├── attendees.ts      # Block Kit: attendee list
│   │   │   └── settings.ts       # Block Kit: Stripe connection
│   │   ├── db/
│   │   │   ├── schema.ts         # D1 schema (events, registrations)
│   │   │   └── queries.ts        # Paginated queries
│   │   ├── stripe/
│   │   │   ├── checkout.ts       # Create checkout session
│   │   │   └── webhooks.ts       # Handle payment events
│   │   ├── email/
│   │   │   └── templates.ts      # Beautiful default templates
│   │   └── types.ts
│   ├── tests/
│   │   ├── e2e/
│   │   │   ├── registration.test.ts
│   │   │   └── webhooks.test.ts
│   │   └── unit/
│   └── package.json
```

---

## Open Questions (Requiring Resolution)

### 1. Caching Strategy for Stripe Data
**Question:** When Stripe is slow, what exactly do we show?
**Steve's concern:** Blank screens destroy trust.
**Elon's position:** Never persist subscription state.
**Proposed resolution:** Cache Stripe responses in KV with 60-second TTL. Display cached data with visual indicator ("Syncing...") if Stripe request exceeds 2 seconds. Never write-through to KV on webhook — let cache expire naturally.
**Status:** Needs engineering sign-off on TTL and UX indicator design.

### 2. D1 Migration Path
**Question:** Existing implementations use KV. How do we migrate?
**Options:**
  a) Fresh start — v1 is a clean build, no migration
  b) Migration script — convert KV data to D1 schema
**Status:** Needs decision based on whether any production data exists.

### 3. Shared Stripe Integration
**Question:** Should both plugins share a single Stripe connection, or configure separately?
**Trade-offs:**
  - Shared: One setup, but couples plugin lifecycles
  - Separate: Independent operation, but user configures twice
**Status:** Needs UX decision. Leaning toward shared (aligns with 60-second benchmark).

### 4. Empty State Copy
**Question:** Final copy for empty states needs approval.
**MemberShip:** "Your first member is one link away" (Elon's suggestion)
**Convene:** "Your first event is 60 seconds away" (Steve's suggestion)
**Status:** Needs sign-off from both parties.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Stripe webhook failures silently drop payments** | Medium | Critical | E2E tests for all webhook event types. Idempotency keys on all payment operations. Alert on webhook signature validation failures. |
| **D1 schema changes break deployed instances** | Medium | High | Version the schema. Migration scripts required before any schema change. Never delete columns in v1.x. |
| **60-second benchmark not achievable** | Low | High | Prototype the happy path first. Measure time-to-first-success before building features. Cut scope if benchmark fails. |
| **Convene name conflicts with existing product** | Low | Medium | Trademark search before public launch. Have fallback name ready (Rally, Gather). |
| **KV caching creates stale subscription state** | Medium | Medium | 60-second TTL. Visual "Syncing..." indicator. Never make access decisions on stale cache — always verify with Stripe for gating. |
| **Email deliverability issues at scale** | Medium | Medium | Use Resend with proper SPF/DKIM. Implement queue for >10 emails/second. Log all send failures. |
| **Admin dashboard slow with 1,000+ records** | Low (if D1) | High | Cursor pagination is locked decision. Load test at 10,000 records before launch. |
| **Scope creep during build phase** | High | Medium | This document is the contract. Any feature not listed in MVP section requires explicit approval from both debaters. |

---

## The Essence (North Star)

> **What this is really about:** Giving small business owners their time back so they can do what they love.
>
> **The feeling it should evoke:** Relief. The dread is gone.
>
> **The one thing that must be perfect:** The first 60 seconds. Install to first success.
>
> **Creative direction:** Simple enough to hug.

---

*This document is the blueprint for the build phase. Every feature, file, and line of code must trace back to a decision recorded here. If it's not in this document, it's not in v1.*
