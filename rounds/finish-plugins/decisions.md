# Finish Plugins — Build Phase Blueprint
## Consolidated Decisions from the Great Minds Debate

**Document Status:** LOCKED FOR BUILD PHASE
**Consolidated:** April 12, 2026
**Zen Master:** Phil Jackson

---

## I. Decision Log

### Decision 1: Product Naming
| Proposed | Steve Jobs: "Belong" and "Moment" |
|----------|-----------------------------------|
| Counter | Elon Musk: Keep "MemberShip" and "EventDash" |
| **Winner** | **Elon Musk** |
| **Rationale** | SEO discoverability defeats elegance at zero users. "MemberShip EmDash plugin" returns search results. "Belong EmDash" returns self-help articles. Rebrand earned at 100+ paying customers. |

**LOCKED:** Names remain **MemberShip** and **EventDash**.

---

### Decision 2: Ship Sequence
| Proposed | Steve Jobs: Ship both plugins together for coherent user journey |
|----------|------------------------------------------------------------------|
| Counter | Elon Musk: Ship MemberShip alone first, validate, then EventDash |
| **Winner** | **Elon Musk** |
| **Rationale** | Zero production deployments exist. One plugin to one customer teaches twice as much as two theoretical ones. EventDash inherits MemberShip learnings. |

**LOCKED:** **MemberShip ships first, alone.** EventDash follows after production validation.

---

### Decision 3: First-Run Experience
| Proposed | Steve Jobs: Demo data on install (fake member "Sofia Chen" showing success) |
|----------|-----------------------------------------------------------------------------|
| Counter | Elon Musk: Empty state with clear CTA, no demo complexity |
| **Winner** | **Elon Musk** |
| **Rationale** | Demo data costs 2-3 weeks: mock generators, conditional rendering, fake avatars, cleanup flows. Empty state with "Your first member is waiting" CTA is honest and ships now. |

**Steve's Concession:** "Beauty can't run on broken infrastructure. Fix the plumbing, then decorate."

**LOCKED:** **Empty state with clear CTA.** Demo data deferred to v1.1.

---

### Decision 4: Admin UI Quality
| Proposed | Steve Jobs: Admin must be as beautiful as customer-facing UI |
|----------|--------------------------------------------------------------|
| Counter | None — Elon conceded completely |
| **Winner** | **Steve Jobs** |
| **Rationale** | Admins spend 80% of plugin time in the dashboard. For the first six months, the admin panel IS the product. The yoga instructor configuring her dashboard will never see the frontend if the backend makes her feel stupid. |

**LOCKED:** Admin dashboard receives **equal design investment** as customer-facing UI.

---

### Decision 5: Brand Voice
| Proposed | Steve Jobs: Terse, confident, warm. Three words where competitors use twelve. |
|----------|-------------------------------------------------------------------------------|
| Counter | Elon: Agreed, but apply after deployment, not before |
| **Winner** | **Steve Jobs** (with timing concession) |
| **Rationale** | Costs nothing to cut words. Maya Angelou validated: onboarding copy was "bloodless." Brand voice ships in v1, but 30-minute fixes only. |

**Kill these words forever:** Successfully, submitted, confirmed, processing, unfortunately, please try again, error occurred.

**Use these:** Done. Sent. Saved. Live. Oops.

**Maya Angelou's adopted rewrites:**
- One-liner: "You write what you want. We build it. Four weeks later, you're live."
- Onboarding: "Right now, our architects are locked in a room arguing about how to make your site remarkable."
- AdminPulse: "Your site's health, on your dashboard, before you have to ask."

**LOCKED:** All copy follows **3-word principle** where possible.

---

### Decision 6: Permission Model
| Proposed | Steve Jobs: Two tiers only — Free and Paid |
|----------|-------------------------------------------|
| Counter | None — unanimous agreement |
| **Winner** | **Steve Jobs** |
| **Rationale** | Both agreed. Seven permission levels means you're a corporation pretending to be a yoga studio. No Bronze/Silver/Gold. Members and non-members. Done. |

**LOCKED:** **Two permission tiers only.**

---

### Decision 7: Calendar Views (EventDash)
| Proposed | Steve Jobs: Month and List only. No week view. |
|----------|-----------------------------------------------|
| Counter | Elon Musk: Yoga studios with 20 classes/week may need week view. Taste without data is dangerous. |
| **Winner** | **Unresolved** |
| **Rationale** | Neither had evidence. Neither had spoken to a yoga instructor. Data decides, not debate. |

**LOCKED:** Default to **month + list**. Week view added only if user research validates need.

---

### Decision 8: Test Sites
| Proposed | Elon Musk: One test site per plugin. Sunrise Yoga gets MemberShip. |
|----------|-------------------------------------------------------------------|
| Counter | None |
| **Winner** | **Elon Musk** |
| **Rationale** | Proving the same code works on 4 sites teaches nothing. One real deployment, one real customer. |

**LOCKED:** **One test site per plugin.** MemberShip → Sunrise Yoga.

---

### Decision 9: Documentation
| Proposed | Elon Musk: Documentation is a ship blocker, not a follow-up |
|----------|-------------------------------------------------------------|
| Counter | None |
| **Winner** | **Elon Musk** |
| **Rationale** | QA declared "SHIP" while documentation was "PENDING." This contradiction is self-deception. Incomplete docs = incomplete product. |

**LOCKED:** **Documentation complete before ship.**

---

### Decision 10: Webhook Failure Handling
| Proposed | Elon Musk: Must verify before ship — kill-test required |
|----------|--------------------------------------------------------|
| Counter | None |
| **Winner** | **Elon Musk** |
| **Rationale** | Payment succeeds in Stripe + failure in our system = customer pays, doesn't get access, rage-quits, demands refund. Support nightmare. |

**LOCKED:** **Webhook failure recovery verified before ship.**

---

## II. MVP Feature Set

### MemberShip v1 — SHIPS FIRST

**What Ships:**

| Feature | Notes |
|---------|-------|
| Stripe Checkout + webhooks | Core payment flow, HMAC signature verification |
| KV member storage | Status, plan, expiration |
| Email confirmation (Resend) | Terse, warm copy per brand voice |
| Admin dashboard | Beautiful, not spreadsheet-like |
| Basic reporting | Members count + revenue sum. Nothing else. |
| Two permission tiers | Members vs everyone else |
| Single-form registration | Email only. No password creation maze. |
| JWT authentication | httpOnly cookies, 15-min access, 7-day refresh |
| Documentation (4 docs) | Installation, Configuration, API Reference, Troubleshooting |

**What's Cut (v2 masquerading as v1):**

| Feature | Rationale | Cut By |
|---------|-----------|--------|
| EventDash (entire plugin) | Ship one plugin first. Learnings transfer. | Elon |
| Group/corporate memberships | Zero customers asked | Elon |
| Developer webhooks | Zero integrations exist | Elon |
| Drip content scheduling | Zero content libraries exist | Elon |
| Coupon engine | Premature optimization | Elon |
| CSV import/export | Manual onboarding for first 50 customers | Elon |
| Multi-tier permissions | Two tiers covers 99% | Steve |
| Analytics dashboards | Members + revenue only. Chart.js can wait. | Steve |
| Demo data on install | 2-3 weeks engineering for one-time experience | Elon |
| Week calendar view | No data validating need | Steve |
| Multi-payment gateways | Stripe is 95% of market | Elon |

---

### EventDash v1 — SHIPS AFTER MEMBERSHIP VALIDATION

**What Ships:**

| Feature | Notes |
|---------|-------|
| Event creation (single-day) | Multi-day uses "Part 1 of 3" in title |
| Registration + Stripe payment | |
| Calendar (month + list) | Week view deferred pending user research |
| Email confirmation | |
| Admin dashboard | Beautiful |
| Documentation (4 docs) | Complete |

**What's Cut:**

| Feature | Rationale |
|---------|-----------|
| Multi-day events | "Part 1 of 3" in title works |
| Week calendar view | No data validating need |
| CSV import/export | Manual onboarding for first 50 |
| Event series | Build when someone pays for it |
| Venue coordinates | Over-engineering |
| Embeddable widgets | v2 |
| Check-in features | Digital knows who registered |

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
│   │   │   ├── webhook.ts         # Stripe webhook handler (HMAC verified)
│   │   │   ├── members.ts         # CRUD operations
│   │   │   └── reporting.ts       # Members count + revenue only
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
│   ├── sandbox-entry.ts           # ~4,000 lines (monolith accepted for v1)
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
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   ├── api-reference.md
│   │   └── troubleshooting.md
│   ├── wrangler.toml
│   └── package.json
│
└── shared/                         # Extraction target for v2
    └── README.md                   # ~60% duplication accepted for v1
```

**Architecture Debt Accepted for v1:**
- 4,000-line `sandbox-entry.ts` monolith — refactor after revenue
- ~60% code duplication between plugins — extract shared module in v2
- 114 instances of `throw new Response` need replacement with EmDash API

---

## IV. Open Questions

| # | Question | Owner | Blocking? | Resolution Path |
|---|----------|-------|-----------|-----------------|
| 1 | **Week view needed for EventDash?** | Design | **No** | User research after MemberShip ships. Default to month+list. |
| 2 | **D1 vs KV at scale?** | Engineering | **No** | KV acceptable for <1,000 records. Migration path exists. |
| 3 | **Shared module extraction timing?** | Engineering | **No** | Extract after both plugins validated in production. |
| 4 | **Email queue for large events?** | Engineering | **Maybe** | Stress test 500-person event against Resend quota. |
| 5 | **EmDash market size?** | Business | **YES** | Unknown. 100 sites? 500? Affects everything. Bundle in templates as mitigation. |

---

## V. Risk Register

### Critical Risks — MUST FIX BEFORE SHIP

| Risk | Impact | Mitigation | Owner |
|------|--------|------------|-------|
| **Webhook failure loses payment** | Customer pays, doesn't get access, rage-quits | Kill-test before ship: kill webhook mid-transaction, verify recovery | Engineering |
| **No production validation** | Zero learnings, all assumptions untested | Deploy to Sunrise Yoga this week, 3 real transactions | Engineering |
| **No admin authentication** | Anyone with endpoint URL can modify members | Implement auth.ts before scaling | Engineering |
| **Status endpoint exposes data** | `/membership/status?email=...` exposes membership without auth | Require authentication or remove email visibility | Engineering |
| **Documentation incomplete** | Users cannot self-serve, support burden | Complete all 4 docs before ship | Documentation |
| **Version inconsistency** | Three versions (3.0.0, 1.5.0, 1.0.0) erode trust | Unify to 1.0.0 everywhere | Engineering |
| **114 banned API patterns** | `throw new Response` incompatible with EmDash | Mechanical find-and-replace | Engineering |

### Accepted Risks — MONITOR, DON'T BLOCK

| Risk | Impact | Mitigation | When to Address |
|------|--------|------------|-----------------|
| **KV list at 10K records** | Timeouts on `entries.query()` | D1 migration path exists | After 5,000 members |
| **Resend rate limits** | Large events hit daily cap | Queue implementation | After stress test failure |
| **EmDash market too small** | Distribution limited | Bundle in all EmDash templates | Platform's problem |
| **4,000-line monolith** | Maintenance pain | Refactor | After revenue |
| **~60% code duplication** | Change propagation burden | Extract shared module | v2 |

---

## VI. Ship Criteria — MemberShip v1 Gate

**ALL MUST PASS:**

- [ ] Deployed to one real EmDash site (Sunrise Yoga)
- [ ] Three real Stripe transactions (production mode, real cards)
- [ ] Webhook failure recovery verified (kill-test documented)
- [ ] Admin authentication implemented and tested
- [ ] Status endpoint secured (no unauthenticated email lookup)
- [ ] 114 `throw new Response` patterns replaced
- [ ] Version unified to 1.0.0 everywhere
- [ ] Brand voice applied (terse, confident, warm)
- [ ] Documentation complete:
  - [ ] installation.md
  - [ ] configuration.md
  - [ ] api-reference.md
  - [ ] troubleshooting.md
- [ ] Admin dashboard is beautiful (not spreadsheet-like)
- [ ] Error messages solve, never apologize

---

## VII. Ship Sequence

```
Phase 1: MemberShip v1 (THIS WEEK)
├── Fix 114 banned patterns (throw new Response → EmDash API)
├── Implement admin authentication
├── Secure status endpoint
├── Deploy to Sunrise Yoga
├── Execute 3 production transactions
├── Kill-test webhook failure handling
├── Complete all documentation
├── Unify version to 1.0.0
├── Apply brand voice throughout
└── SHIP

Phase 2: Production Validation (30 DAYS)
├── Monitor for breakage
├── Document learnings
├── Gather user feedback
└── Apply critical fixes

Phase 3: EventDash v1 (AFTER VALIDATION)
├── Apply MemberShip learnings
├── Complete documentation
├── Deploy to test site
└── SHIP

Phase 4: Retention Layer v1.1 (Shonda's Roadmap)
├── Weekly digest email
├── Milestone celebrations
├── One-click social sharing
├── Simple progress dashboard
└── Quick actions from dashboard
```

---

## VIII. The Essence

**What is this product REALLY about?**
> Making people who feel inadequate feel capable.

**The feeling:**
> "I built that."

**The one thing that must be perfect:**
> The first 30 seconds.

**Creative direction:**
> Disappear.

---

## IX. Philosophy Summary

**Elon's Law:**
> "Ship ugly. Listen. Improve. Repeat. Polish is earned by survival."

**Steve's Standard:**
> "The metric isn't 'does it load.' The metric is: does the yoga instructor feel smarter after using it?"

**Maya's Reminder:**
> "People will forget your token counts. They will remember how you made them feel."

**The Synthesis:**
> Speed without craft is just noise. Craft without speed is just art. We ship one thing, and we ship it right.

---

## X. Final Verdict

# PROCEED — CONDITIONAL

**This Week:**
1. Deploy MemberShip to Sunrise Yoga
2. Complete three real Stripe transactions
3. Verify webhook failure recovery
4. Complete all documentation
5. Secure all endpoints
6. Unify version to 1.0.0
7. Apply brand voice

**What Does NOT Happen:**
- Another planning round
- More board reviews
- Retention roadmaps for users that don't exist
- Demo data implementations
- Week view debates without data

---

> *"Planning without production is rehearsal without performance. The audience teaches things the mirror cannot."*

**Build Phase Authorized. Ship MemberShip this week.**

---

**Document Locked:** April 12, 2026
**Zen Master:** Phil Jackson
