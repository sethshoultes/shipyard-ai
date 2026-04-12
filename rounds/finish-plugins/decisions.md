# Finish Plugins — Consolidated Decisions
## The Zen Master's Blueprint for Build Phase

**Document Status:** LOCKED FOR BUILD PHASE
**Consolidated:** April 12, 2026
**Debaters:** Elon Musk (Chief Product & Growth), Steve Jobs (Chief Design & Brand)
**Board:** Warren Buffett, Jensen Huang, Oprah Winfrey, Shonda Rhimes
**Copy Review:** Maya Angelou
**QA:** Margaret Hamilton
**Synthesis:** Phil Jackson (Zen Master)

---

## I. Locked Decisions

### Decision 1: Product Naming
| Aspect | Proposed By | Alternative | Winner | Rationale |
|--------|-------------|-------------|--------|-----------|
| **MemberShip** (not "Belong") | Elon Musk | Steve Jobs wanted "Belong" — emotional, one word | **Elon** | SEO discoverability defeats elegance at zero users. "MemberShip EmDash plugin" returns search results. "Belong EmDash" returns self-help articles. Rebrand earned at 100 paying customers. |
| **EventDash** (not "Moment") | Elon Musk | Steve Jobs wanted "Moment" — poetic, memorable | **Elon** | Same reasoning. Search visibility > poetry when nobody knows you exist. |

**LOCKED:** Names remain **MemberShip** and **EventDash**.

---

### Decision 2: Ship Sequence
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve Jobs | Ship both plugins together for coherent user journey | — | — |
| **Elon Musk** | Ship MemberShip alone first — validate before expanding | **Elon** | Zero production deployments exist. One plugin to one customer teaches twice as much as two theoretical ones. EventDash inherits MemberShip learnings. |

**LOCKED:** **MemberShip ships first, alone.** EventDash follows after production validation.

---

### Decision 3: First-Run Experience
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve Jobs | Demo data on install — fake member "Sofia Chen" showing success before configuration | — | — |
| **Elon Musk** | Empty state with clear CTA — no demo complexity | **Elon** | Demo data costs 2-3 weeks: mock generators, conditional rendering, fake avatars, cleanup flows. Ship empty state with "Create Your First Member" CTA. |

**Steve's concession:** "Beauty can't run on broken infrastructure. Fix the plumbing, then decorate."

**LOCKED:** **Empty state with clear CTA.** Demo data deferred to v1.1.

---

### Decision 4: Admin UI Quality
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Admin must be as beautiful as customer-facing UI | **Steve** | Elon conceded completely. Admins spend 80% of plugin time in the dashboard. For the first six months, the admin panel IS the product — no public-facing members exist yet. The yoga instructor configuring her dashboard will never see the frontend if the backend makes her feel stupid. |

**LOCKED:** Admin dashboard receives **equal design investment** as customer-facing UI.

---

### Decision 5: Brand Voice
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Terse, confident, warm. Three words where competitors use twelve. Kill: "successfully," "submitted," "confirmed," "error occurred." Use: "Done," "Saved," "Live," "Oops." | **Steve** | Costs nothing to cut words. Maya Angelou validated: "Feature lists read like inventory. The rhythm is a metronome — steady, predictable, numbing." |

**Maya Angelou's rewrites adopted:**
- "Email-based membership plugin..." → **"Turn visitors into members. Gate your best content. Get paid."**
- "Welcome email — Sent on successful registration" → **"The first hello. So members feel received, not processed."**
- "Full access with email support" → **"Everything we make. Every course, every guide, every tool."**

**LOCKED:** All copy follows **3-word principle** where possible.

---

### Decision 6: Permission Model
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Steve Jobs** | Two tiers only: Free and Paid. No Bronze/Silver/Gold. | **Steve** | Both agreed. Seven permission levels means you're a corporation pretending to be a yoga studio. Enables deleting ~200 lines of tier management code. |

**LOCKED:** **Two permission tiers only.** Members and non-members.

---

### Decision 7: Test Sites
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | One test site per plugin. Sunrise Yoga gets MemberShip. Horizontal testing across 4 sites is waste. | **Elon** | Proving the same code works on 4 sites teaches nothing. One real deployment, one real customer. |

**LOCKED:** **One test site per plugin.** MemberShip → Sunrise Yoga.

---

### Decision 8: Documentation
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Documentation is a ship blocker, not a follow-up. Cannot ship "PENDING." | **Elon** | QA report said "SHIP" while documentation was "PENDING." This contradiction is self-deception. Incomplete docs = incomplete product. |

**LOCKED:** **Documentation complete before ship.** Four docs required:
1. Installation.md
2. Configuration.md
3. API-reference.md
4. Troubleshooting.md

---

### Decision 9: Webhook Failure Handling
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Must verify before ship — kill-test required | **Elon** | Payment succeeds in Stripe + failure in our system = customer pays, doesn't get access, rage-quits, demands refund. Support nightmare. |

**LOCKED:** **Webhook failure recovery verified before ship.** Kill webhook mid-transaction, confirm system recovers.

---

### Decision 10: Playwright Screenshots
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| **Elon Musk** | Cut. Process theater. Curl + browser console sufficient for v1. | **Elon** | Screenshot infrastructure is overhead for a plugin with zero users. |

**LOCKED:** **No Playwright screenshots.** Manual verification sufficient for v1.

---

## II. Board Verdict Summary

**Aggregate Score:** 5.6/10
**Verdict:** PROCEED (Conditional)

| Reviewer | Score | Key Critique |
|----------|-------|--------------|
| **Oprah Winfrey** | 6.5/10 | "Functional, not inspirational. Handles the transaction, doesn't honor the transformation." |
| **Warren Buffett** | 6/10 | "The engine exists; the fuel tank is empty. Zero production transactions." |
| **Jensen Huang** | 5/10 | "Competent execution of a commodity feature set. Zero AI leverage. No moat." |
| **Shonda Rhimes** | 5/10 | "A membership *system*, not a membership *experience*. No tomorrow hooks." |

**Points of Unanimous Agreement:**
1. Technical foundation is solid
2. No production validation exists
3. Product lacks emotional/narrative layer
4. Missing retention mechanics
5. Privacy concern: `/membership/status` endpoint exposes data without auth
6. Version inconsistency erodes trust (README: 3.0.0, API: 1.5.0, Install: 1.0.0)

---

## III. MVP Feature Set

### MemberShip v1 — SHIPS FIRST

**What Ships:**

| Feature | Notes |
|---------|-------|
| Stripe Checkout + webhooks | Core payment flow, HMAC signature verification |
| KV member storage | Status, plan, expiration |
| Email confirmation (Resend) | Terse, warm copy per brand voice |
| Admin dashboard | Beautiful, not spreadsheet-like |
| Basic reporting API | Members and revenue. No vanity metrics. |
| Two permission tiers | Members vs everyone else |
| Single-form registration | Email only. No password creation maze. |
| JWT authentication | httpOnly cookies, 15-min access, 7-day refresh |
| Documentation | All four docs complete and accurate |

**What's Cut (v2 masquerading as v1):**

| Feature | Rationale | Cut By |
|---------|-----------|--------|
| Group/corporate memberships | Zero customers asked | Elon |
| Developer webhooks with HMAC | Zero integrations exist | Elon |
| Drip content scheduling | Zero content libraries exist | Elon |
| Multi-payment gateways (PayPal) | Stripe is 95% of market. PayPal stub is tech debt. | Elon |
| Multi-step registration wizard | 90% of signups are single-form | Steve |
| Coupon engine | Premature optimization | Elon |
| Content gating with rules | Ship basic gating, rules in v2 | Elon |
| Cohort analysis / LTV dashboards | Buffett: "Building Phase 5 before validating Phase 2" | Board |
| Analytics dashboards | Members and money. Chart.js can wait. | Steve |
| Demo data on install | 2-3 weeks engineering for one-time experience | Elon |

---

### EventDash v1 — SHIPS AFTER MEMBERSHIP VALIDATION

**What Ships:**

| Feature | Notes |
|---------|-------|
| Event creation (single-day) | |
| Registration + Stripe payment | |
| Calendar (month + list) | Week view deferred pending user research |
| Email confirmation | |
| Admin dashboard | Beautiful |
| Documentation | Complete |

**What's Cut:**

| Feature | Rationale |
|---------|-----------|
| Multi-day events | "Part 1 of 3" in title works |
| Week calendar view | Steve: "30% complexity for 3% usage." No data either way. |
| CSV import/export | Manual onboarding for first 50 customers |
| Event series | Build when someone pays for it |
| Venue management with coordinates | Over-engineering |
| Embeddable widgets | v2 |
| Check-in features | Digital knows who registered |

---

### Plugins Deferred (No Build This Phase)

| Plugin | Status | Rationale |
|--------|--------|-----------|
| ReviewPulse | Deferred | Zero evidence anyone uses review collection |
| SEODash | Deferred | EmDash has `plugin-seo` in guide. Duplicate. |
| CommerceKit | Cut | No example site. No customer demand. |
| FormForge | Monitor | Likely already works. Validate after MemberShip. |

---

## IV. File Structure

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
│   │   │   └── reporting.ts       # Basic metrics (members + revenue only)
│   │   ├── lib/
│   │   │   ├── stripe.ts          # Stripe client
│   │   │   ├── email.ts           # Resend integration
│   │   │   ├── auth.ts            # Admin authentication (REQUIRED)
│   │   │   └── kv.ts              # KV storage helpers
│   │   └── styles/
│   ├── docs/
│   │   ├── installation.md        # REQUIRED before ship
│   │   ├── configuration.md       # REQUIRED before ship
│   │   ├── api-reference.md       # REQUIRED before ship
│   │   └── troubleshooting.md     # REQUIRED before ship
│   ├── sandbox-entry.ts           # ~4,000 lines — accept monolith for v1
│   ├── wrangler.toml
│   └── package.json
│
├── eventdash/                      # Ships AFTER membership validation
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.astro
│   │   │   ├── Calendar.astro     # Month + List only. No week view.
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
└── shared/                         # ~60% code duplication accepted for v1
    └── README.md                   # Extraction target for v2
```

**Architecture Debt Accepted for v1:**
- 4,000-line `sandbox-entry.ts` monolith — refactor after revenue
- ~60% code duplication between plugins — extract shared module in v2
- 114 instances of `throw new Response` need replacement with EmDash API

---

## V. Open Questions

| # | Question | Status | Owner | Blocking? |
|---|----------|--------|-------|-----------|
| 1 | **Week view needed for EventDash?** | Requires user research. Neither Steve nor Elon had data. | Design | **No** — default to month+list |
| 2 | **D1 vs KV at scale?** | KV acceptable for <1,000 records. `ctx.storage.entries.query()` times out at 10K. Migration path exists. | Engineering | **No** for v1 |
| 3 | **Shared module extraction?** | ~60% duplication accepted. Extract after both plugins validated. | Engineering | **No** — defer to v2 |
| 4 | **Email queue for large events?** | 500-person event = significant Resend quota hit | Engineering | **Maybe** — stress test required |
| 5 | **EmDash market size?** | Unknown. 100 sites? 500? Buffett: "Cannot evaluate economics without knowing TAM." | Business | **YES** — affects everything |

---

## VI. Risk Register

### Critical Risks (Must Fix Before Ship)

| Risk | Likelihood | Impact | Status | Mitigation |
|------|------------|--------|--------|------------|
| **Webhook failure loses payment** | Medium | Critical | **Must verify** | Kill-test before ship. Customer pays but doesn't get access = nightmare. |
| **No production validation** | High | Critical | **Must fix** | Deploy to Sunrise Yoga this week. Three real transactions. |
| **No admin authentication** | High | Critical | **Must fix** | Anyone with endpoint URL can modify members. Auth required before scaling. |
| **Status endpoint exposes data** | High | Critical | **Must fix** | `GET /membership/status?email=...` exposes data without auth. Require auth or remove email visibility. Board flagged as trust-breaker. |
| **Documentation incomplete** | Medium | High | **Blocker** | All four docs complete before ship. |
| **Version inconsistency** | High | Medium | **Must fix** | Three different versions (3.0.0, 1.5.0, 1.0.0). Single source of truth: 1.0.0. |
| **Hallucinated API** | High | High | **Must fix** | 114 `throw new Response` → EmDash API. Mechanical find-and-replace. |

### Accepted Risks (Monitor, Don't Block)

| Risk | Likelihood | Impact | Status | Mitigation |
|------|------------|--------|--------|------------|
| **KV list at 10K records** | Medium | High | **Monitor** | D1 migration path exists. Accept for v1. |
| **Resend rate limits on large events** | Low | Medium | **Monitor** | Queue implementation if stress test fails. |
| **EmDash market too small** | Medium | High | **Unknown** | Bundle plugins in all EmDash templates. Distribution is EmDash's problem. |
| **4,000-line monolith** | High | Medium | **Accepted** | Refactor after revenue. Tech debt, not ship blocker. |
| **~60% code duplication** | High | Medium | **Accepted** | Extract shared module in v2. |

---

## VII. Shipping Criteria

### MemberShip v1 Gate Checklist

**ALL REQUIRED before ship:**

- [ ] **Deployed to one real EmDash site** — Sunrise Yoga, not test environment
- [ ] **Three real Stripe transactions** — Production mode, real cards, real money
- [ ] **Webhook failure recovery verified** — Kill webhook mid-transaction, confirm system recovers
- [ ] **Documentation complete** — Installation, Configuration, API Reference, Troubleshooting
- [ ] **Admin dashboard is beautiful** — Not spreadsheet-like. Equal investment to customer-facing.
- [ ] **Admin authentication exists** — Endpoint security verified
- [ ] **Status endpoint secured** — No public email → membership lookup
- [ ] **Version number unified** — 1.0.0 everywhere
- [ ] **Brand voice applied** — Terse, confident, warm throughout
- [ ] **Compassionate error messages** — "We couldn't find your account" not "404: Member not found"

---

## VIII. Ship Sequence

```
Phase 1: MemberShip v1 (THIS WEEK)
├── Fix 114 banned patterns (throw new Response → EmDash API)
├── Secure admin endpoints
├── Secure status endpoint
├── Deploy to Sunrise Yoga
├── Three production transactions
├── Verify webhook failure handling
├── Complete documentation
├── Unify version to 1.0.0
└── SHIP

Phase 2: Production Validation (30 DAYS)
├── Monitor for what breaks
├── Document learnings
└── Apply fixes

Phase 3: EventDash v1 (AFTER VALIDATION)
├── Apply learnings from MemberShip
├── Complete documentation
└── SHIP

Phase 4: Retention Layer (v1.1 — Shonda's Roadmap)
├── First-content celebration ("Aha moment")
├── Milestone emails
├── "New since your last visit" badge
├── Tomorrow teasers for drip content
└── Cliffhanger notifications
```

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

## X. Key Learnings (from Retrospective)

1. **Verification reports are not verification.** Only production contact with real customers reveals truth. The deliverables directory was empty while planning artifacts were polished.

2. **Research before debating.** The week view argument consumed time without data. Neither side had evidence. User research should precede feature debates.

3. **Block on blockers.** "PENDING" documentation with "SHIP" status is self-deception. Pipeline stops until blockers resolve.

4. **Know the market size before building.** "Distribution strategy unclear" should be in prerequisites, not conclusions.

5. **Taste without data is dangerous.** Both Steve's design intuition and Elon's engineering judgment need evidence.

6. **Deploy before debating.** One real customer using crude code teaches more than ten planning documents.

---

## XI. Philosophy Summary

**Elon's Law:**
> "Taste doesn't ship. Code ships. Stop documenting. Start deploying."

**Steve's Standard:**
> "The metric isn't 'does it load.' The metric is: does the yoga instructor feel smarter after using it?"

**Maya's Reminder:**
> "On the other side of the screen is a human being — tired, frustrated, hoping this tool solves their problem. Speak to that person. Not to the code."

**Buffett's Question:**
> "How many active EmDash sites? What do they pay? What percentage would activate MemberShip? Show me X, Y, and Z with evidence, not assumptions."

**Jensen's Challenge:**
> "You've built a feature, not a flywheel. Everything here is table stakes. Where's the moat?"

**Shonda's Demand:**
> "Every interaction ends with a period, never a question mark. What makes them *need* to come back?"

**Oprah's Test:**
> "Does this make people feel empowered, not just processed?"

---

## XII. Final Verdict

# PROCEED (Conditional)

**Conditions (All Must Pass):**
1. Deploy MemberShip to Sunrise Yoga this week
2. Complete three real Stripe transactions
3. Verify webhook failure recovery
4. Complete all documentation
5. Secure admin endpoints
6. Secure status endpoint
7. Unify version number to 1.0.0
8. Apply brand voice throughout

**Accept for v1:**
- KV architecture at current scale
- ~60% code duplication
- 4,000-line monolith (refactor after revenue)
- No week view (pending user research)
- No demo data (CTA sufficient)

**Next Action:**
> Ship MemberShip to one real EmDash customer. This week. Watch it break. Fix it. Then ship EventDash.

---

## XIII. QA Status

**QA Pass 1 Verdict:** BLOCK — NO DELIVERABLES EXIST

The deliverables directory `/home/agent/shipyard-ai/deliverables/finish-plugins/` is empty. Zero of 31 requirements can be verified.

**Required Before QA Pass 2:**
1. Copy/deliver all plugin source code to deliverables directory
2. Create all documentation (4 docs)
3. Provide deployment evidence (URL, screenshots, logs)
4. Provide Stripe transaction evidence (receipts, webhook logs)
5. Provide webhook kill-test evidence (procedure, recovery logs)
6. Commit all deliverables to git

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson

---

**Document Locked:** April 12, 2026
**Build Phase Authorized**
