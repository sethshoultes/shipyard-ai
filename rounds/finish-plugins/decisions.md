# Finish Plugins — Consolidated Decisions
## The Zen Master's Blueprint for Build Phase

**Document Status:** LOCKED FOR BUILD PHASE
**Consolidated:** April 11, 2026
**Board:** Elon Musk (Product & Growth), Steve Jobs (Design & Brand), Maya Angelou (Copy Review)
**Synthesis:** Phil Jackson (Zen Master)

---

## I. Locked Decisions

### Decision 1: Product Naming
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Names | "Circle" and "Gather" — emotional, intimate | "MemberShip" and "EventDash" — searchable, obvious | **Elon** |

**Rationale:** SEO discoverability trumps elegance in v1. "MemberShip" is what people search for. "Circle" requires brand awareness we don't have. Earned rebranding at 100 paying customers.

**LOCKED:** Names remain **MemberShip** and **EventDash**.

---

### Decision 2: Ship Sequence
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Strategy | Ship both together — coherent user journey | Ship MemberShip alone first — validate before expanding | **Elon** |

**Rationale:** Zero production deployments exist. Validating one plugin with one real customer teaches more than debating two theoretical ones. EventDash benefits from MemberShip learnings.

**LOCKED:** **MemberShip ships first, alone.** EventDash follows after production validation.

---

### Decision 3: First-Run Experience
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Empty State | Demo data on install — never show sad/empty | Empty state with clear CTA — no demo complexity | **Elon** |

**Rationale:** Demo data sounds magical but costs 2+ weeks: generation logic, cleanup flows, localization, edge cases. Ship empty state with "Create Your First Member" CTA. Polish after revenue.

**LOCKED:** **Empty state with clear CTA.** No demo data.

---

### Decision 4: Admin UI Quality
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Investment | Admin must be as beautiful as customer-facing | (Conceded) | **Steve** |

**Rationale:** Elon conceded completely. Admins spend 80% of plugin time in the dashboard. For the first six months, the admin panel IS the product — no public-facing members exist yet. Ugly admin = abandoned installs before customers ever see the frontend.

**LOCKED:** Admin dashboard receives **equal design investment** as customer-facing UI.

---

### Decision 5: Brand Voice
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Copy Style | Terse, confident, warm. Three words where competitors use twelve. | (Conceded) | **Steve** |

**Rationale:** Elon conceded. Costs nothing to cut words. "They're in. Welcome email sent." beats "Member registration confirmed. A welcome email has been sent to the provided email address."

**Maya Angelou's rewrites adopted:**
- One-liner: "You write what you want. We build it. Four weeks later, you're live."
- Onboarding: "Right now, our architects are locked in a room arguing about how to make your site remarkable."
- AdminPulse: "Your site's health, on your dashboard, before you have to ask."

**LOCKED:** All copy follows **3-word principle** where possible.

---

### Decision 6: Permission Model
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Complexity | Two tiers: members and everyone else | (Conceded — delete GroupRecord code) | **Steve** |

**Rationale:** Both agreed. Complexity is a tax on attention. Seven permission levels means you're a corporation pretending to be a yoga studio. Two tiers enables deleting ~500 lines of group/role code.

**LOCKED:** **Two permission tiers only.** Members and non-members.

---

### Decision 7: Documentation
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Timing | (Conceded) | Cannot ship "PENDING" — incomplete docs = incomplete product | **Elon** |

**Rationale:** QA report said "SHIP" while Task 12 (Documentation) was "PENDING." This contradiction should have halted process. Documentation is a ship blocker, not a follow-up.

**LOCKED:** Documentation **complete before ship.** No exceptions.

---

### Decision 8: Webhook Failure Handling
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Testing | (Conceded) | Must verify before ship — kill-test required | **Elon** |

**Rationale:** Payment success in Stripe + failure in our system = customer pays, doesn't get access, rage-quits, demands refund. Customer service nightmare. This must be tested under failure conditions.

**LOCKED:** **Webhook failure recovery verified before ship.** Kill webhook mid-transaction, confirm system recovers.

---

### Decision 9: Calendar Views
| Proposed | Steve | Elon | Winner |
|----------|-------|------|--------|
| Week View | No week view needed — month + list only | Yoga studios with 20 classes/week may need it | **CONTESTED** |

**Rationale:** Steve's position was taste without data. Elon's position was hypothesis without validation. Neither had evidence.

**OPEN:** Default to **month + list.** Week view added only if user research validates need.

---

## II. MVP Feature Set

### MemberShip v1 — SHIPS FIRST

**Ships:**
| Feature | Notes |
|---------|-------|
| Stripe checkout + webhooks | Core payment flow |
| KV member storage | Status, plan, expiration |
| Email confirmation (Resend) | Terse, warm copy |
| Admin dashboard | Beautiful, not spreadsheet-like |
| Basic reporting API | Minimal UI, API exists |
| Two permission tiers | Members vs everyone else |
| Single-form registration | |
| Documentation | Installation, config, API ref, troubleshooting |

**Cut (v2 masquerading as v1):**
| Feature | Rationale |
|---------|-----------|
| Group/corporate memberships | Zero customers asked |
| Developer webhooks (HMAC) | Zero integrations exist |
| Drip content scheduling | Zero content libraries exist |
| Multi-payment gateways | Stripe is 95% of market |
| Multi-step registration | 90% of signups are single-form |
| Coupon engine | Premature optimization |

---

### EventDash v1 — SHIPS AFTER MEMBERSHIP VALIDATION

**Ships:**
| Feature | Notes |
|---------|-------|
| Event creation (single-day) | |
| Registration + Stripe payment | |
| Calendar (month + list) | Week view TBD |
| Email confirmation | |
| Admin dashboard | Beautiful |
| Documentation | Complete |

**Cut:**
| Feature | Rationale |
|---------|-----------|
| Multi-day events | "Part 1 of 3" in title works |
| CSV import/export | Manual onboarding for first 50 customers |
| Event series | Build when someone pays for it |
| Venue management with coordinates | Over-engineering |
| Embeddable widgets | v2 |
| Cohort analysis | Zero customers asked |
| Advanced webhooks with retry | Simple first, retry when complained |
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
│   │   │   └── AdminDashboard.astro
│   │   ├── api/
│   │   │   ├── checkout.ts        # Stripe checkout session
│   │   │   ├── webhook.ts         # Stripe webhook handler
│   │   │   ├── members.ts         # CRUD operations
│   │   │   └── reporting.ts       # Basic metrics
│   │   ├── lib/
│   │   │   ├── stripe.ts          # Stripe client
│   │   │   ├── email.ts           # Resend integration
│   │   │   ├── auth.ts            # Admin authentication
│   │   │   └── kv.ts              # KV storage helpers
│   │   └── styles/
│   ├── docs/
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   ├── api-reference.md
│   │   └── troubleshooting.md
│   ├── wrangler.toml              # Deployment config
│   └── package.json
│
├── eventdash/                      # Ships AFTER membership validation
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.astro
│   │   │   ├── Calendar.astro
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
└── shared/                         # Future extraction target
    └── README.md                   # ~60% code duplication noted
```

**Architecture Notes:**
- Current codebase: 6,495 lines (MemberShip), 5,876 lines (EventDash)
- Monolith problem: ~4,000 lines in single `sandbox-entry.ts` files
- Decomposition required before shipping but NOT a blocker for first deployment

---

## IV. Open Questions

| # | Question | Status | Owner | Blocking? |
|---|----------|--------|-------|-----------|
| 1 | **Week view needed?** | Requires user research | Design | No — default to month+list |
| 2 | **D1 vs KV at scale?** | KV acceptable for <1,000 records. Migration path exists. | Engineering | No for v1 |
| 3 | **Shared module extraction?** | ~60% duplication accepted for v1 | Engineering | No — defer to v2 |
| 4 | **Email queue for large events?** | 500-person event = 1% monthly Resend quota | Engineering | Maybe — stress test required |
| 5 | **EmDash market size?** | Unknown. 100 sites? 500? | Business | **YES** — affects everything |
| 6 | **Admin authentication?** | Anyone with endpoint can modify members | Engineering | **YES** — security gap |

---

## V. Risk Register

| Risk | Likelihood | Impact | Status | Mitigation |
|------|------------|--------|--------|------------|
| **Webhook failure loses payment** | Medium | Critical | Must verify | Kill-test before ship |
| **No production validation** | High | Critical | Must fix | Deploy this week |
| **No admin authentication** | High | Critical | Must fix | Auth before scaling |
| **Documentation incomplete** | Medium | High | Blocker | Complete before ship |
| **KV list at 10K records** | Medium | High | Monitor | D1 migration path exists |
| **Resend rate limits** | Low | Medium | Monitor | Queue if stress test fails |
| **EmDash market too small** | Medium | High | Unknown | Embed in all templates |
| **Code duplication burden** | Medium | Medium | Accepted | Extract in v2 |
| **4,000-line monolith** | High | Medium | Accepted | Refactor after revenue |

---

## VI. Shipping Criteria

### MemberShip v1 Gate Checklist

Before ship:

- [ ] **Deployed to one real EmDash site** — not test environment
- [ ] **Three real Stripe transactions** — production mode, real cards
- [ ] **Webhook failure recovery verified** — kill mid-transaction, confirm recovery
- [ ] **Documentation complete** — all four docs exist and are accurate
- [ ] **Admin dashboard is beautiful** — not spreadsheet-like
- [ ] **Admin authentication exists** — endpoint security verified
- [ ] **Brand voice applied** — terse, confident, warm throughout

### Ship Sequence

```
Phase 1: MemberShip v1 (THIS WEEK)
├── Deploy to one real customer
├── Three production transactions
├── Verify webhook failure handling
├── Complete documentation
├── Ship

Phase 2: EventDash v1 (AFTER VALIDATION)
├── Apply learnings from MemberShip
├── Complete documentation
├── Ship
```

---

## VII. The Essence

**What is this product REALLY about?**
> Making people who feel inadequate feel capable.

**The feeling:**
> "I built that."

**The one thing that must be perfect:**
> The first 30 seconds.

**Creative direction:**
> Disappear.

---

## VIII. Key Learnings (from Retrospective)

1. **Verification reports are not verification.** Only production contact with real customers reveals truth.
2. **Research before debating.** The week view argument was wasted time — neither side had data.
3. **Block on blockers.** "PENDING" documentation with "SHIP" status is self-deception.
4. **Name the market size early.** Distribution strategy cannot be "unclear" at end of planning.
5. **Taste without data is dangerous.** Both Steve and Elon need evidence, not intuition.

---

## IX. Final Verdict

# PROCEED

**Conditions:**
1. Deploy MemberShip to one real site this week
2. Complete three real Stripe transactions
3. Verify webhook failure recovery
4. Complete all documentation
5. Apply brand voice throughout

**Accept for v1:**
- KV architecture at current scale
- ~60% code duplication
- 4,000-line monolith (refactor after revenue)

**The philosophy:**
- Elon: "Taste doesn't ship. Code ships."
- Steve: "Competence without complexity."
- Maya: "They will remember how you made them feel."

**The action:**
> Stop planning. Start shipping.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson

---

**Next Action:** Deploy MemberShip to one real EmDash customer. This week. Watch it break. Fix it. Then ship.
