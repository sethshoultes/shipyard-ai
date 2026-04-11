# Finish Plugins — Consolidated Decisions
## The Zen Master's Blueprint for Build Phase

---

## Executive Summary

Two great minds. Two valid philosophies. One path forward.

**Steve Jobs** optimizes for emotion, coherence, and the human experience.
**Elon Musk** optimizes for validation, simplicity, and shipping velocity.

The triangle must balance. Below are the locked decisions.

---

## Locked Decisions

### Decision 1: Product Naming
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | "Circle" and "Gather" — emotional, intimate, category-creating | **Elon** | SEO discoverability trumps elegance in v1. "MemberShip" and "EventDash" are searchable, debuggable, self-documenting. Earned rebranding at 100 paying customers. |

**LOCKED:** Names remain **MemberShip** and **EventDash** for v1.

---

### Decision 2: Ship Sequence
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Ship both plugins together — coherent experience (memberships + events) | **Elon** | Validate before expanding. One plugin to one customer, proven in production, before second plugin ships. |

**LOCKED:** Ship **MemberShip first, alone**. EventDash follows after production validation.

---

### Decision 3: First-Run Experience
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Demo state on install ("Your First Gathering") — never show sad/empty | **Elon** | Demo data adds scope creep: generation logic, cleanup logic, edge cases, localization. Simpler: empty state with clear CTA. |

**LOCKED:** **Empty state with clear CTA** ("Create Your First Member"). No demo data.

---

### Decision 4: Admin UI Quality
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Admin UI must be as beautiful as customer UI | **Steve** | Elon conceded completely. Admins spend 80% of plugin time in dashboard. Ugly admin panels signal disrespect. |

**LOCKED:** Admin dashboard receives **equal design investment** as customer-facing UI.

---

### Decision 5: Brand Voice
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Terse, confident, warm. "Your gathering is live. Share it." not "Event successfully created!" | **Steve** | Elon conceded. Extra words cost nothing to remove, everything to keep. Terse is trust. |

**LOCKED:** All copy follows **3-word principle** where possible. Cut in half, then cut again.

---

### Decision 6: Permission Model
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Two tiers only: members and everyone else | **Steve** | Elon conceded. No role matrices. Complexity is a tax on attention. |

**LOCKED:** **Two permission tiers** — members and non-members. No granular roles.

---

### Decision 7: Calendar Views
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Steve | Month and list only. No week view. | **Contested** | Elon challenged with data: yoga studios with 20 classes/week need week view. Steve's position was taste without data. |

**OPEN:** Requires user research. Default to **month + list**, add week view if validated.

---

### Decision 8: Documentation
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Elon | Documentation cannot ship "PENDING" | **Elon** | Steve conceded. Incomplete docs = incomplete product. |

**LOCKED:** Documentation must be **complete before ship**. Not deferred.

---

### Decision 9: Webhook Failure Handling
| Proposed By | Position | Winner | Rationale |
|-------------|----------|--------|-----------|
| Elon | Webhook failure recovery must be tested before ship | **Elon** | Steve conceded. Payment success in Stripe + failure in our system = customer service nightmare. |

**LOCKED:** Webhook failure handling **verified before ship**. Kill webhook mid-transaction test required.

---

## MVP Feature Set (What Ships in v1)

### MemberShip v1 — SHIPS FIRST
| Feature | Status | Notes |
|---------|--------|-------|
| Core payment flows | ✅ Ship | Stripe checkout, webhooks, confirmation |
| Email confirmation | ✅ Ship | Resend integration |
| Admin dashboard | ✅ Ship | Beautiful, not spreadsheet-like |
| Basic reporting | ✅ Ship | API exists, minimal UI |
| Two permission tiers | ✅ Ship | Members vs everyone else |
| Single-form registration | ✅ Ship | |
| Documentation | ✅ Ship | MUST be complete |

### MemberShip v1 — CUT
| Feature | Status | Rationale |
|---------|--------|-----------|
| Astro admin reporting dashboard | ❌ Defer | API exists. Site owners can build their own UI. |
| Multi-step registration forms | ❌ Defer | 90% of signups are single-form. |

### EventDash v1 — SHIPS SECOND (After MemberShip Validation)
| Feature | Status | Notes |
|---------|--------|-------|
| Core event creation | ✅ Ship | Single-day events |
| Registration + payment | ✅ Ship | Stripe integration |
| Calendar (month + list) | ✅ Ship | Week view TBD |
| Email confirmation | ✅ Ship | |
| Admin dashboard | ✅ Ship | Beautiful |
| Documentation | ✅ Ship | MUST be complete |

### EventDash v1 — CUT
| Feature | Status | Rationale |
|---------|--------|-----------|
| Multi-day events | ❌ Defer | "Part 1 of 3" in title works. |
| CSV import | ❌ Defer | Manual onboarding for first 50 customers. Learn needs. |
| Cohort analysis | ❌ Defer | Zero customers have asked for this. |
| Advanced webhooks with retry | ❌ Defer | Simple webhooks first. Add retry when someone complains. |
| Check-in features | ❌ Defer | Digital knows who registered. Physical check-in is theater. |

---

## File Structure (What Gets Built)

```
emdash-plugins/
├── membership/
│   ├── src/
│   │   ├── components/          # Astro components
│   │   │   ├── MemberCard.astro
│   │   │   ├── MemberList.astro
│   │   │   ├── RegistrationForm.astro
│   │   │   └── AdminDashboard.astro
│   │   ├── api/                 # API routes
│   │   │   ├── checkout.ts
│   │   │   ├── webhook.ts
│   │   │   ├── members.ts
│   │   │   └── reporting.ts
│   │   ├── lib/                 # Shared utilities
│   │   │   ├── stripe.ts
│   │   │   ├── email.ts
│   │   │   ├── auth.ts
│   │   │   └── kv.ts
│   │   └── styles/              # CSS
│   ├── docs/                    # MUST be complete
│   │   ├── installation.md
│   │   ├── configuration.md
│   │   ├── api-reference.md
│   │   └── troubleshooting.md
│   └── package.json
│
├── eventdash/                   # Ships AFTER membership validation
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
│   └── package.json
│
└── shared/                      # Potential future extraction
    └── README.md                # Note: ~60% code duplication identified
```

---

## Open Questions (Requiring Resolution)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | **Week view needed?** Yoga studios with 20 classes/week may need it. Requires user research. | Design | No (default to month+list) |
| 2 | **D1 vs KV?** Original architecture decision was Stripe + D1, but current code is all KV. Performance at 10K records? | Engineering | No for v1 (KV acceptable at small scale) |
| 3 | **Shared module extraction?** ~60% code duplication between plugins. Extract after v1 or live with it? | Engineering | No (defer to v2) |
| 4 | **Email queue system?** Resend has rate limits. 500-person event eats 1% of monthly quota. Background queue needed? | Engineering | Maybe (stress test required) |
| 5 | **EmDash user base?** How many active EmDash sites exist? 100? 500? Distribution strategy unclear. | Business | Yes (affects go-to-market) |

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Webhook failure loses payment data** | Medium | Critical | Verify failure handling before ship. Kill-test required. |
| **KV list iteration at scale** | Medium | High | Acceptable for v1 (<1000 records). Monitor. D1 migration path exists. |
| **No production validation** | High | Critical | Deploy to one real customer. Three real Stripe transactions. This week. |
| **Documentation incomplete** | Medium | High | Block ship until docs complete. No exceptions. |
| **Rate limit hits (Resend)** | Low | Medium | Monitor usage. Queue system if needed. |
| **EmDash market too small** | Medium | High | Embed in every EmDash template by default. |
| **Competitor feature parity** | Low | Low | Not competing on features. Competing on feeling. |
| **Code duplication maintenance burden** | Medium | Medium | Accept for v1. Extract shared modules in v2. |

---

## Shipping Criteria (Gate Checklist)

Before MemberShip v1 can ship:

- [ ] **Deployed to one real EmDash site** (not test environment)
- [ ] **Three real Stripe transactions completed** (production mode, not test)
- [ ] **Webhook failure recovery verified** (kill webhook mid-transaction)
- [ ] **Documentation complete** (installation, configuration, API reference, troubleshooting)
- [ ] **Admin dashboard is beautiful** (not spreadsheet-like)
- [ ] **Brand voice applied** (terse, confident, warm throughout)

---

## The Essence (North Star)

> **What is this product REALLY about?**
> Making small business owners feel capable instead of inadequate.

> **What's the feeling it should evoke?**
> "I did that. I built that."

> **What's the one thing that must be perfect?**
> The first 30 seconds.

> **Creative direction:**
> Competence without complexity.

---

*"The strength of the team is each individual member. The strength of each member is the team."*

— Phil Jackson

---

**Document Status:** LOCKED FOR BUILD PHASE
**Last Updated:** Consolidated from Round 1-2 debates
**Next Action:** Deploy MemberShip to one real customer. This week.
