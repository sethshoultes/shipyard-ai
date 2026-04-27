# Cagan Decision: plugins-v1

**Date**: 2026-04-27
**Decision**: KILL
**Analyst**: Cagan (Build/Kill/Pivot)
**Project**: plugins-v1 — EmDash Plugin Suite

---

## Summary

Kill the project as currently scoped. Ship what is already built as the final v1.0 release. Do not build any additional plugins or features until validated by real EmDash users.

---

## State of the Project

The project has built a massive amount of working code but has not shipped to users:

| Phase | Status | What Was Built |
|-------|--------|----------------|
| Phase 1 (v1.0) | SHIPPED | MemberShip + EventDash core plugins |
| Phase 2 (Stripe) | SHIPPED | JWT auth, Stripe Checkout, webhooks, email automation, coupons, ticket types |
| Phase 3 (Portals) | SHIPPED | Content gating, member/attendee portals, calendar views, check-in, QR codes, iCal, drip content |
| Phase 4 Wave 1 | BUILT + MERGED | Reporting dashboards, group memberships, developer webhooks |
| Phase 4 Wave 2 | BUILT + VERIFIED | Registration form builder, event categories, venue management, event series, multi-gateway, embeddable widgets, waitlist |
| Phase 4 Wave 3 | NEVER STARTED | CSV import/export, PayPal, advanced webhooks, cohort analysis |
| Additional Plugins | PARTIALLY BUILT | adminpulse, commercekit, forge, formforge, reviewpulse, seodash |

Total plugins: 8+. Total features: 50+. Time spent: ~22 days. Last meaningful commit: 2026-04-16. Last planning commit in `projects/plugins-v1/`: 2026-04-06.

The project started as "build two plugins for EmDash" and scope-creeped into "build an entire plugin ecosystem with enterprise features."

---

## The Four Risks: All Failed

### 1. Value Risk — FAILED

**Question**: Will EmDash site owners choose to use these plugins?

**Evidence**: None. After 22+ days of building, not a single EmDash site has these plugins installed. The ship reports mention "test on live sites" but there is no evidence this happened. The team built reporting dashboards, group memberships, and developer webhooks without validating whether a single user needs them.

**Verdict**: Value is completely unvalidated. Building 50+ features without a single real user is not product discovery — it is speculatively coding against a requirements document.

### 2. Usability Risk — FAILED

**Question**: Can EmDash users (small business owners, not developers) figure out how to use 8+ plugins with advanced features?

**Evidence**: QA reports verify technical correctness (routes return 200, webhooks verify signatures, email templates exist). But QA is not usability testing. No user has ever tried to configure Stripe webhooks, set up group memberships, or use the form builder. The admin UI for 8 plugins with overlapping settings creates enormous cognitive load.

**Verdict**: Technical QA passes do not mean the product is usable. The target audience (small business owners using EmDash) has never touched this software.

### 3. Feasibility Risk — FAILED

**Question**: Can the team build what was scoped with available time, skills, and tokens?

**Evidence**: Phase 4 Wave 3 was planned but never started. Additional plugins (formforge, reviewpulse, etc.) were drafted but abandoned. The team built ~70% of the Phase 4 plan and then stalled for 11+ days with only minor fixes and daemon auto-commits. The project went from 2 plugins to 8+ plugins without a corresponding increase in resources.

**Verdict**: The team proved they can build high-quality plugins, but they cannot build *this much* scope. The project outran its capacity.

### 4. Business Viability Risk — FAILED

**Question**: Does building an 8-plugin enterprise ecosystem make sense for Shipyard AI?

**Evidence**: The token budget for the original plugin suite was 500K base + 300K Phase 2 + 360K Phase 3 = 1.16M tokens already spent. Phase 4 was scoped at another 500K tokens. The additional plugins were never budgeted. No revenue has been generated. No marketplace exists yet. The agency is building infrastructure for a marketplace that has zero users.

**Verdict**: Building unvalidated platform features (reporting, groups, webhooks, cohort analysis) before shipping the core product is a classic startup trap. The business model cannot sustain this burn rate without shipping.

---

## Why KILL, Not PIVOT or BUILD

**Why not BUILD?** The team has already built far more than the smallest viable scope. The riskiest assumption — "will anyone use this?" — cannot be tested by building more features. It can only be tested by shipping what exists.

**Why not PIVOT?** The framing is not the problem. The core idea (membership + event plugins for EmDash) is sound. The problem is execution: infinite scope creep, zero user validation, and token budget exhaustion. A pivot implies changing the product strategy. The strategy was never wrong — the execution model was.

**Why KILL?** The project as a living, building entity must end. The team needs to stop adding scope, package what works, ship it, and start a new discovery cycle driven by user feedback, not by an ever-expanding PRD.

---

## What Happens Now

1. **Ship the v1.0 Plugin Suite** — Package MemberShip + EventDash (Phases 1-3) plus Phase 4 Waves 1-2 (reporting, groups, webhooks, form builder, categories, venues, series, widgets) as the final v1.0 release. This is already built and verified. No new code needed.

2. **Kill All Pending Work** — Phase 4 Wave 3 (CSV, PayPal, advanced webhooks, cohort analysis) and all additional plugins (adminpulse, commercekit, forge, formforge, reviewpulse, seodash) are cancelled. Do not resume without validated user demand.

3. **Archive the Project** — Move `projects/plugins-v1/` to `archive/completed/plugins-v1-v1.0/`. The project is complete, not abandoned.

4. **Require User Validation Before Restart** — Before any new plugin project begins, the agency must:
   - Have at least 3 EmDash site owners requesting the specific feature
   - Run a usability test with a real user configuring the plugin
   - Set a hard token cap with no phase expansion without board approval

5. **Token Budget Reconciliation** — Return unused reserve tokens to the agency pool. The plugins-v1 project consumed its budget and more. Future projects must prove they can ship within budget before Phase 2 planning.

---

## The Lesson

The plugins-v1 project is a textbook example of what Marty Cagan warns against: **output over outcome**. The team generated an impressive amount of code — 8 plugins, 50+ features, thousands of lines of TypeScript — but produced **zero validated learning** because nothing shipped to a real user.

The right move is not to keep building. It is to stop, ship what works, and learn.

**KILL. Ship v1.0. Validate next.**
