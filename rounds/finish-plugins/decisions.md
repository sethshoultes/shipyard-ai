# Finish Plugins — Consolidated Decisions
## Build Phase Blueprint

**Status:** LOCKED
**Date:** April 12, 2026
**Consolidated by:** Phil Jackson (Zen Master)

---

## I. Decision Registry

### Decision 1: Product Naming
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | "Belong" and "Moment" — emotional, poetic, active | — | Elegance over utility |
| **Elon Musk** | "MemberShip" and "EventDash" — searchable, functional | **ELON** | At zero users, SEO discoverability defeats poetry. "MemberShip EmDash plugin" returns search results. "Belong EmDash" returns self-help articles. Rebrand earned at 100 paying customers. |

**LOCKED:** Names remain **MemberShip** and **EventDash**.

---

### Decision 2: Ship Sequence
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Ship both plugins together for coherent user journey | — | Brand consistency |
| **Elon Musk** | Ship MemberShip alone first, validate, then EventDash | **ELON** | Zero production deployments exist. One plugin to one customer teaches twice as much as two theoretical ones. Sequential shipping compresses learning cycles. |

**LOCKED:** **MemberShip ships first, alone.** EventDash inherits learnings.

---

### Decision 3: First-Run Experience
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Demo data on install — fake member "Sofia Chen" showing success before configuration | — | Confidence before competence |
| **Elon Musk** | Empty state with clear CTA — no demo complexity | **ELON** | Demo data costs 2-3 weeks: mock generators, conditional rendering, cleanup flows. Ship empty state with "Create Your First Member" CTA. Polish after revenue. |

**Steve's concession:** "Beauty can't run on broken infrastructure."

**LOCKED:** Empty state with clear CTA. Demo data deferred to v1.1.

---

### Decision 4: Admin UI Quality
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Admin must be as beautiful as customer-facing UI | **STEVE** | The yoga instructor configuring her dashboard IS the product for the first six months. No public-facing members exist yet. |
| **Elon Musk** | *(Conceded completely)* | — | Admins spend 80% of plugin time in the dashboard. If the backend makes them feel stupid, they abandon before seeing the frontend. |

**LOCKED:** Admin dashboard receives **equal design investment** as customer-facing UI.

---

### Decision 5: Brand Voice
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Terse, confident, warm. Kill: "successfully," "submitted," "error occurred." Use: "Done," "Saved," "Live," "Oops." | **STEVE** | Costs nothing to cut words. |
| **Elon Musk** | *(Conceded)* | — | Maya Angelou validated: "Feature lists read like inventory. The rhythm is a metronome — steady, predictable, numbing." |

**Maya Angelou's rewrites adopted:**
- "Email-based membership plugin..." → "Turn visitors into members. Gate your best content. Get paid."
- "Welcome email — Sent on successful registration" → "The first hello. So members feel received, not processed."

**LOCKED:** All copy follows **3-word principle** where possible.

---

### Decision 6: Permission Model
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Two tiers only: Free and Paid. "If someone needs four tiers, they need Patreon." | **STEVE** | Both agreed. Deletes ~200 lines of tier management complexity. |
| **Elon Musk** | *(Agreed)* | — | Seven permission levels = corporation pretending to be a yoga studio. |

**LOCKED:** **Two permission tiers only.** Members and non-members.

---

### Decision 7: Test Sites
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | One test site per plugin. Horizontal testing across 4 sites is waste. | **ELON** | Proving the same code works on 4 sites teaches nothing. One real deployment, one real customer. |

**LOCKED:** **One test site per plugin.** MemberShip → Sunrise Yoga.

---

### Decision 8: Documentation
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Documentation is a ship blocker, not a follow-up. Cannot ship "PENDING." | **ELON** | QA found "SHIP" status while docs were "PENDING." Incomplete docs = incomplete product. |

**LOCKED:** Documentation complete before ship. Four docs required.

---

### Decision 9: Webhook Failure Handling
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Must verify before ship — kill-test required | **ELON** | Payment succeeds in Stripe + failure in our system = customer pays, doesn't get access, rage-quits, demands refund. |

**LOCKED:** Webhook failure recovery verified before ship.

---

### Decision 10: Playwright Screenshots
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Cut. Process theater. Curl + browser console sufficient. | **ELON** | Screenshot infrastructure is overhead for a plugin with zero users. |

**LOCKED:** No Playwright screenshots. Manual verification for v1.

---

## II. MVP Feature Set

### MemberShip v1 — What Ships

| Feature | Implementation Notes |
|---------|---------------------|
| Stripe Checkout + webhooks | HMAC signature verification, retry logic |
| KV member storage | Status, plan, expiration |
| Email confirmation (Resend) | Terse, warm copy per brand voice |
| Admin dashboard | Beautiful. Equal investment to customer-facing. |
| Basic reporting | Members and revenue only. No vanity metrics. |
| Two permission tiers | Members vs everyone else |
| Single-form registration | Email only. No password maze. |
| JWT authentication | httpOnly cookies, 15-min access, 7-day refresh |
| Documentation | Installation, Configuration, API Reference, Troubleshooting |
| Admin authentication | Endpoint security verified |
| Compassionate error messages | "We couldn't find your account" not "404: Member not found" |

### MemberShip v1 — What's Cut

| Feature | Rationale | Deferred To |
|---------|-----------|-------------|
| Group/corporate memberships | Zero customers asked | v2+ |
| Developer webhooks with HMAC | Zero integrations exist | v2 |
| Drip content scheduling | Zero content libraries exist | v1.1 |
| Multi-payment gateways (PayPal) | Stripe is 95% of market. PayPal stub is tech debt. | v2 |
| Multi-step registration wizard | 90% of signups are single-form | Never |
| Coupon engine | Premature optimization | v1.1 |
| Content gating with rules | Ship basic gating | v2 |
| Cohort analysis / LTV dashboards | Buffett: "Building Phase 5 before validating Phase 2" | v2 |
| Analytics dashboards | Members and money only | v1.1 |
| Demo data on install | Elon won. CTA sufficient. | v1.1 |
| Week calendar view | No user research data. Default month+list. | Pending research |

### EventDash v1 — Ships After MemberShip Validation

| Feature | Notes |
|---------|-------|
| Event creation (single-day) | |
| Registration + Stripe payment | |
| Calendar (month + list) | No week view |
| Email confirmation | |
| Admin dashboard | Beautiful |
| Documentation | Complete |

### Plugins Deferred (No Build This Phase)

| Plugin | Disposition | Rationale |
|--------|-------------|-----------|
| ReviewPulse | Deferred | Zero evidence anyone uses review collection |
| SEODash | Deferred | EmDash has `plugin-seo` in guide. Duplicate. |
| CommerceKit | Cut | No customer demand |
| FormForge | Monitor | No banned patterns. Validate after MemberShip. |

---

## III. File Structure

```
emdash-plugins/
├── membership/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MemberCard.astro
│   │   │   ├── MemberList.astro
│   │   │   ├── RegistrationForm.astro
│   │   │   ├── MemberPortal.astro
│   │   │   └── AdminDashboard.astro
│   │   ├── api/
│   │   │   ├── checkout.ts        # Stripe checkout session
│   │   │   ├── webhook.ts         # Stripe webhook handler
│   │   │   ├── members.ts         # CRUD operations
│   │   │   └── reporting.ts       # Members + revenue only
│   │   ├── lib/
│   │   │   ├── stripe.ts          # Stripe client
│   │   │   ├── email.ts           # Resend integration
│   │   │   ├── auth.ts            # Admin authentication (REQUIRED)
│   │   │   └── kv.ts              # KV storage helpers
│   │   └── styles/
│   ├── docs/
│   │   ├── installation.md        # REQUIRED
│   │   ├── configuration.md       # REQUIRED
│   │   ├── api-reference.md       # REQUIRED
│   │   └── troubleshooting.md     # REQUIRED
│   ├── sandbox-entry.ts           # ~4,000 lines — accept monolith for v1
│   ├── wrangler.toml
│   └── package.json
│
├── eventdash/                      # Ships AFTER membership validation
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.astro
│   │   │   ├── Calendar.astro     # Month + List only
│   │   │   ├── RegistrationForm.astro
│   │   │   └── AdminDashboard.astro
│   │   ├── api/
│   │   │   ├── checkout.ts
│   │   │   ├── webhook.ts
│   │   │   ├── events.ts
│   │   │   └── attendees.ts
│   │   ├── lib/
│   │   │   ├── stripe.ts
│   │   │   ├── email.ts
│   │   │   └── kv.ts
│   │   └── styles/
│   ├── docs/
│   ├── wrangler.toml
│   └── package.json
│
└── shared/                         # ~60% duplication accepted for v1
    └── README.md                   # Extraction target for v2
```

**Architecture Debt Accepted:**
- 4,000-line `sandbox-entry.ts` monolith — refactor after revenue
- ~60% code duplication between plugins — extract shared module in v2
- 114 instances of `throw new Response` → must replace with EmDash API

---

## IV. Open Questions

| # | Question | Owner | Blocking? | Resolution |
|---|----------|-------|-----------|------------|
| 1 | Week view needed for EventDash? | Design | No | Default month+list. User research before adding. |
| 2 | D1 vs KV at scale? | Engineering | No | KV for <1K records. Migration path exists. |
| 3 | Shared module extraction timing? | Engineering | No | After both plugins validated. v2. |
| 4 | Email queue for large events? | Engineering | Maybe | Stress test required. |
| 5 | **EmDash market size?** | Business | **YES** | Unknown. Affects all economics. |
| 6 | **Admin authentication?** | Engineering | **YES** | Security gap. Must fix before ship. |
| 7 | **Status endpoint privacy?** | Engineering | **YES** | Exposes email→membership without auth. |
| 8 | **Version number?** | Engineering | **YES** | Pick 1.0.0. Single source of truth. |

---

## V. Risk Register

### Critical (Ship Blockers)

| Risk | Likelihood | Mitigation | Owner |
|------|------------|------------|-------|
| **Webhook failure loses payment** | Medium | Kill-test before ship. Customer pays but doesn't get access = nightmare. | Engineering |
| **No production validation** | High | Deploy to Sunrise Yoga this week. Three real transactions. | Engineering |
| **No admin authentication** | High | Auth required before any scaling. | Engineering |
| **Status endpoint exposes data** | High | Require auth or remove email visibility. | Engineering |
| **Documentation incomplete** | Medium | All four docs complete before ship. | Docs |
| **Version inconsistency** | High | Single source of truth: 1.0.0. | Engineering |
| **Hallucinated API patterns** | High | 114 `throw new Response` → EmDash API. Mechanical fix. | Engineering |

### Accepted (Monitor)

| Risk | Likelihood | Impact | Notes |
|------|------------|--------|-------|
| KV list at 10K records | Medium | High | D1 migration path exists |
| Resend rate limits on large events | Low | Medium | Queue implementation if needed |
| EmDash market too small | Medium | High | Bundle in all EmDash templates |
| 4,000-line monolith | High | Medium | Refactor after revenue |
| ~60% code duplication | High | Medium | Extract in v2 |

---

## VI. Board Verdict Summary

**Score:** 5.6/10 | **Verdict:** PROCEED (Conditional)

| Reviewer | Score | Key Critique |
|----------|-------|--------------|
| **Jensen Huang** | 5/10 | "Competent commodity feature set. Zero AI leverage. No moat." |
| **Warren Buffett** | 6/10 | "The engine exists; the fuel tank is empty. Zero production transactions." |
| **Oprah Winfrey** | 6.5/10 | "Functional, not inspirational. Handles the transaction, doesn't honor the transformation." |
| **Shonda Rhimes** | 5/10 | "A membership *system*, not a membership *experience*. No tomorrow hooks." |

**Universal Agreement:**
1. Technical foundation is solid
2. No production validation exists
3. Product lacks emotional/narrative layer
4. Privacy concern: status endpoint exposes data without auth
5. Version inconsistency erodes trust

---

## VII. Ship Sequence

```
PHASE 1: MemberShip v1 (THIS WEEK)
├── Fix 114 banned patterns (throw new Response → EmDash API)
├── Secure admin endpoints
├── Secure status endpoint
├── Unify version to 1.0.0
├── Complete documentation
├── Deploy to Sunrise Yoga
├── Three production transactions
├── Verify webhook failure handling
└── SHIP

PHASE 2: Production Validation (30 DAYS)
├── Monitor for what breaks
├── Document learnings
└── Apply fixes

PHASE 3: EventDash v1 (AFTER VALIDATION)
├── Apply learnings from MemberShip
├── Complete documentation
└── SHIP

PHASE 4: Retention Layer (v1.1 — Shonda's Roadmap)
├── "Aha moment" framework
├── "New since your last visit" dashboard
├── Episode-style drip notifications
├── Milestone celebrations
└── Cliffhanger mechanics
```

---

## VIII. Ship Gate Checklist

**ALL REQUIRED before MemberShip v1 ships:**

- [ ] Deployed to one real EmDash site (Sunrise Yoga)
- [ ] Three real Stripe transactions (production mode, real money)
- [ ] Webhook failure recovery verified (kill-test completed)
- [ ] Documentation complete (all four docs)
- [ ] Admin dashboard is beautiful (equal investment to customer-facing)
- [ ] Admin authentication exists (endpoint security verified)
- [ ] Status endpoint secured (no public email → membership lookup)
- [ ] Version number unified (1.0.0 everywhere)
- [ ] Brand voice applied (terse, confident, warm)
- [ ] Compassionate error messages throughout

---

## IX. The Essence

**What is this product REALLY about?**
> Making people who feel inadequate feel capable.

**The feeling:**
> "I built that."

**The one thing that must be perfect:**
> The first 30 seconds.

**Creative direction:**
> Disappear.

---

## X. Philosophy Summary

**Elon's Law:**
> "Taste doesn't ship. Code ships."

**Steve's Standard:**
> "The metric isn't 'does it load.' The metric is: does the yoga instructor feel smarter after using it?"

**Maya's Reminder:**
> "On the other side of the screen is a human being — tired, frustrated, hoping this tool solves their problem."

**Buffett's Question:**
> "How many active EmDash sites? Show me evidence, not assumptions."

**Jensen's Challenge:**
> "You've built a feature, not a flywheel. Where's the moat?"

**Shonda's Demand:**
> "What makes them *need* to come back?"

**Oprah's Test:**
> "Does this make people feel empowered, not just processed?"

---

## XI. Final Verdict

### PROCEED

**Next Action:**
> Ship MemberShip to one real EmDash customer. This week. Watch it break. Fix it. Then ship EventDash.

**Key Learning from Retrospective:**
> Verification reports are not verification. Only production contact with real customers reveals truth. The deliverables directory was empty while planning artifacts were polished. Planning without production is rehearsal without performance.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson

---

**Document Locked:** April 12, 2026
**Build Phase Authorized**
