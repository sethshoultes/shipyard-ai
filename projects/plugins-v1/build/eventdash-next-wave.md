# EventDash Next Wave: Debate + Plan

**Date**: 2026-04-05
**Issue**: #31 (Plugin: EventDash -- Events & Ticketing)
**Status**: Phase 4 Waves 1-2 SHIPPED. Wave 3 NOT STARTED.

---

## Current State: What's Been Built

### Phase 1 (Core)
- Event CRUD with KV storage
- Registration (name + email)
- Capacity limits + waitlist
- Recurring events (template -> instances)
- Admin: event list, create form
- Portable Text event-listing block

### Phase 2 (Payments)
- Stripe Checkout (PaymentIntent + inline checkout)
- Ticket types (early bird, VIP, general admission, group discounts)
- Refund handling (charge.refunded webhook)
- Attendee communication (email confirmation templates)
- Coupon/discount codes

### Phase 3 (Portals + Content)
- Calendar views (month + list)
- Attendee portal (registrations, tickets, check-in status)
- Check-in system (confirmation codes, manual check-in, stats)
- iCal/Google Calendar export
- Content gating engine + drip content
- Registration management + ticket management

### Phase 4 Wave 1 (Reporting + Infrastructure)
- EventDash reporting (performance, attendance trends, revenue)
- MemberShip reporting (revenue, churn, members)
- Group memberships (schema, invite flow, seat management)
- Developer webhooks (registration, emission, logging)

### Phase 4 Wave 2 (Advanced Features)
- Registration forms builder
- Event categories + filtering
- Venue management (CRUD, link to events)
- Event series (linked recurring with branding)
- Multi-gateway schema support (Stripe, PayPal stub, manual)
- Embeddable widgets + waitlist notifications
- CSV export (attendees + events)

---

## What's NOT Yet Built (from PARITY.md + Issue #31 + Phase 4 Plan)

| Feature | Source | Status |
|---------|--------|--------|
| CSV import (members + attendees) | Phase 4 Task 11 | NOT BUILT |
| PayPal checkout integration | Phase 4 Task 12 | NOT BUILT |
| Advanced webhooks (retry + signing) | Phase 4 Task 13 | NOT BUILT |
| Advanced reporting (cohort analysis) | Phase 4 Task 14 | NOT BUILT |
| Edge case testing + polish | Phase 4 Task 15 | NOT BUILT |
| Multi-day events (conferences) | PARITY.md | NOT BUILT |
| Organizer profiles | PARITY.md | NOT BUILT |
| RSVP distinct from registration | Issue #31 | NOT BUILT |

---

## Debate: Steve Jobs vs Elon Musk

### Round 1: What matters most right now?

**Steve Jobs (UX/Design)**:

The plugin has an impressive feature set. 60+ routes, categories, venues, series, widgets, calendars, check-in, portals. But here's the problem: none of this matters if the end user -- the yoga studio owner, the event organizer -- can't confidently use it.

My priority is **polish and reliability**. The issue says "Test on Sunrise Yoga (class schedule)." We need to validate the actual user journey end-to-end: create a recurring yoga class, set up ticket types, let students register, check them in, see the dashboard. If any step is confusing or broken, the feature count is irrelevant.

Second priority: **multi-day events**. This is a glaring gap. A yoga retreat that spans Friday-Sunday can't be represented in the current schema (single date + time). Conferences, workshops, multi-session courses -- these are core use cases for any serious events plugin. The schema needs `endDate` alongside `endTime`.

Third: **organizer profiles**. Real events have hosts. "Led by Sarah, certified yoga instructor" is essential for trust. This is a simple schema addition (organizers table, link to events) with outsized UX value.

I would **deprioritize** PayPal checkout. Stripe handles 90%+ of online payments. PayPal is a nice-to-have, not a must-ship. Advanced webhooks (retry + signing) are developer features -- they matter, but they don't affect the end user's experience.

**Elon Musk (Engineering)**:

Steve is right that polish matters, but he's wrong about what to build. The Phase 4 plan already laid out Wave 3 with clear tasks. We should finish what we started before adding new scope.

My priority is **shipping the remaining Phase 4 Wave 3 tasks**. We committed to CSV import, PayPal, advanced webhooks, cohort analysis, and comprehensive testing. Abandoning that plan mid-execution is how projects never ship.

CSV import is critical for onboarding. A yoga studio switching from Mindbody has 500 students in a spreadsheet. Without bulk import, they're typing emails one by one. That's a dealbreaker.

Advanced webhooks (retry + signing) are not just developer features -- they're reliability infrastructure. A webhook that fires once and silently fails is worse than no webhook at all. Developers will build integrations, those integrations will break, and they'll blame us.

I agree with Steve on multi-day events -- it's a real gap. But I'd scope it tightly: add `endDate` to EventRecord, update the create/edit flows, and make the calendar render multi-day spans. One task, not a project.

I would **defer** organizer profiles to Phase 5. It's cosmetic. The event description field can contain "Led by Sarah" today.

### Round 2: Finding Consensus

**Steve**: Fine. I'll concede on PayPal if Elon concedes on organizer profiles being deferred. But I insist on comprehensive end-to-end testing as Task 1. Not "edge case testing" buried at the end -- actual user journey validation before we build anything new. Fix what's broken first.

**Elon**: Agreed. Testing first. Here's my counter-proposal: we do testing + polish as a dedicated task, then CSV import (critical for onboarding), then multi-day events (real schema gap), then advanced webhooks (reliability), then cohort reporting (visibility). Five tasks, clean sequence.

**Steve**: I want multi-day events before CSV import. The schema gap is more fundamental -- it affects how every event is represented. CSV import is a utility feature.

**Elon**: Counterpoint: CSV import unblocks onboarding for every new customer. Multi-day events only matter for a subset of use cases. But fine -- we can run them in parallel since they touch different parts of the codebase.

### Consensus

1. **Testing + polish first** -- validate the full user journey, fix bugs, ensure mobile responsiveness
2. **Multi-day events + CSV import in parallel** -- both are gaps, both are independent
3. **Advanced webhooks** -- reliability infrastructure for the developer ecosystem
4. **Cohort analysis** -- gives organizers visibility into what's working
5. **Defer**: PayPal checkout (Phase 5), organizer profiles (Phase 5), RSVP as distinct concept (can use free registration)

---

## Build Plan: Phase 4 Wave 3

### Wave 3A (Sequential -- Must Complete First)

#### Task 11: End-to-End Testing + Polish
**Owner**: Phil Jackson (QA)
**Duration**: 3 days
**Token Budget**: 20K

**Scope**:
- Test the Sunrise Yoga user journey: create studio, set up weekly classes (recurring), enable paid tickets, student registers, student checks in, organizer views dashboard
- Mobile responsiveness audit on all admin pages and public-facing components
- Performance profiling: all API routes respond in < 500ms, dashboards load in < 2s
- Accessibility audit: keyboard navigation, screen reader labels, ARIA attributes
- Edge cases: timezone handling across DST boundaries, concurrent registrations at capacity, waitlist promotion race conditions, widget embed on external domains
- Fix all bugs found before proceeding to new features

**Acceptance Criteria**:
- [ ] Full Sunrise Yoga journey works end-to-end without errors
- [ ] All admin pages render correctly on mobile (375px width)
- [ ] All API endpoints respond < 500ms (p95)
- [ ] WCAG AA compliance on public-facing pages
- [ ] Zero critical bugs remaining

---

### Wave 3B (Parallel -- Independent Tasks)

#### Task 12: Multi-Day Events
**Owner**: Steve Jobs
**Duration**: 2 days
**Token Budget**: 8K

**Scope**:
- Schema: add `endDate` (optional string, ISO date) to EventRecord
- Create/edit: allow setting end date for multi-day events
- Calendar month view: render multi-day events spanning across days
- Event listing: show date range ("Apr 10-12") instead of single date
- Event detail: display full schedule (day 1, day 2, etc.)
- iCal export: use DTSTART/DTEND with correct multi-day span

**Acceptance Criteria**:
- [ ] Events can be created with start date + end date
- [ ] Calendar view shows events spanning multiple days
- [ ] Event listing displays date range correctly
- [ ] iCal export generates valid multi-day VEVENT
- [ ] Single-day events still work exactly as before (backward compatible)

#### Task 13: CSV Import (Members + Attendees)
**Owner**: Elon Musk
**Duration**: 3 days
**Token Budget**: 8K

**Scope**:
- Import endpoint: `POST /eventdash/import/attendees` with CSV body
- CSV format: email (required), name (required), ticketType (optional), status (optional)
- Validation: email format, duplicate detection, required fields
- Dry-run mode: validate without importing, return error report
- Batch processing: handle 1000+ rows without timeout
- Admin UI: upload CSV, see preview of first 5 rows, confirm import
- Error report: which rows failed and why

**Acceptance Criteria**:
- [ ] CSV upload parses correctly (handles commas in quoted fields)
- [ ] Dry-run mode returns validation errors without importing
- [ ] Duplicate emails detected and reported (not silently skipped)
- [ ] 1000-row import completes in < 10s
- [ ] Admin sees import results (X imported, Y skipped, Z errors)

---

### Wave 3C (Depends on Wave 3B)

#### Task 14: Advanced Webhooks (Retry + Signing)
**Owner**: Elon Musk
**Duration**: 3 days
**Token Budget**: 8K

**Scope**:
- Retry logic: failed webhook POSTs retry up to 3 times with exponential backoff (1s, 5s, 25s)
- HMAC-SHA256 signing: each webhook payload signed with site-specific secret
- Signature header: `X-Shipyard-Signature: sha256=...`
- Verification docs: show site owner how to verify signature in their code
- Rate limiting: max 100 webhook fires per minute per site
- Status dashboard: admin sees last 20 webhook calls with status (success/fail/retrying)

**Acceptance Criteria**:
- [ ] Failed webhooks retry automatically (up to 3 attempts)
- [ ] Backoff intervals are correct (1s, 5s, 25s)
- [ ] Payload signature is HMAC-SHA256, verifiable by receiver
- [ ] Rate limit enforced (returns 429 when exceeded)
- [ ] Admin dashboard shows webhook call history with status

#### Task 15: Advanced Reporting (Cohort Analysis)
**Owner**: Elon Musk
**Duration**: 3 days
**Token Budget**: 10K

**Scope**:
- Cohort table: attendees grouped by first-registration month, track repeat attendance
- Event series analysis: which series has best retention (repeat registrations)
- Revenue cohort: revenue generated by attendees who first registered in month X
- Popular times refinement: heatmap of registrations by day-of-week + hour
- Funnel: event viewed (if trackable) -> registered -> paid -> checked in

**Acceptance Criteria**:
- [ ] Cohort table shows retention by registration month
- [ ] Repeat attendance rate calculated per cohort
- [ ] Revenue attributed to cohorts correctly
- [ ] Popular times heatmap renders (7 days x 24 hours grid)
- [ ] Funnel shows drop-off at each stage

---

## Summary: Wave 3 at a Glance

```
Wave 3A (Sequential)              [Days 1-3]
  Task 11: E2E Testing + Polish

Wave 3B (Parallel)                [Days 4-8]
  Task 12: Multi-Day Events
  Task 13: CSV Import

Wave 3C (Parallel, after 3B)      [Days 9-14]
  Task 14: Advanced Webhooks
  Task 15: Cohort Analysis
```

**Total Token Budget**: 54K (well within 380K reserve)

## Deferred to Phase 5
- PayPal checkout integration (Stripe covers 90%+ of use cases)
- Organizer profiles (event description suffices for now)
- RSVP as distinct concept (free registration covers this)
- Conditional form logic (forms builder v2)

---

## PARITY.md Updates After Wave 3

After completing these 5 tasks, the remaining gaps vs WordPress equivalents will be:
- PayPal checkout (deferred)
- Organizer profiles (deferred)
- Multi-day events: CLOSED
- CSV import: CLOSED
- Advanced webhooks: CLOSED
- Reporting (cohort): CLOSED
- Edge case testing: CLOSED

**EventDash will be at ~95% feature parity with Events Calendar + Event Espresso.**
