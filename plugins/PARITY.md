# Plugin Feature Parity Requirements

**Rule: Every plugin must match the feature set of its WordPress equivalent before shipping.**

## MemberShip — Target: MemberPress Parity

### Shipped (v1.0)
- [x] Membership plans (free, monthly, yearly)
- [x] Basic content gating (Portable Text block)
- [x] Email-only registration
- [x] Admin: member list, plan editor, MRR widget
- [x] KV storage
- [x] Input sanitization, race condition prevention

### Missing for Parity
- [x] **Stripe Checkout integration** (Phase 2 - real subscriptions with Session API)
- [x] **Stripe webhooks** (Phase 2 - subscription lifecycle, payments, cancellation)
- [x] **Member dashboard** (Phase 2 - self-serve portal: view plan, upgrade/downgrade, cancel)
- [x] **Content rules engine** (Phase 3 - per-page, per-block, and drip gating)
- [x] **Email automation** (Phase 2 - welcome, expiring soon, expired, payment receipt, renewal, cancellation)
- [x] **Coupon/discount codes** (Phase 2 - percentage, fixed amount, expiring, usage limits, plan restrictions)
- [x] **Drip content** (Phase 3 - time-released access based on join date with automated unlock)
- [x] **Member portal** (Phase 3 - content library, plan info, drip visibility, accessibility)
- [x] **Registration forms** (Phase 5 - custom fields, multi-step wizard with up to 20 steps, field validation)
- [x] **Upgrade/downgrade** (Phase 2 - pro-rated plan switching via Stripe API)
- [x] **Reporting** (Phase 5 - revenue, churn, member activity, cohort analysis, LTV, conversion funnel)
- [x] **Multiple payment gateways** (Phase 5 - Stripe primary, PayPal secondary, manual marking, admin gateway toggle)
- [x] **Group/corporate memberships** (Phase 5 - org creates group, invite codes, seat management, group portal)
- [x] **Developer webhooks** (Phase 5 - register endpoints, HMAC signing, retry with backoff, health checks, logs)
- [x] **CSV import/export** (Phase 5 - export members to CSV, bulk import from CSV data)

## EventDash — Target: Events Calendar + Event Espresso Parity

### Shipped (v1.0 draft)
- [x] Event CRUD with KV storage
- [x] Registration (name + email)
- [x] Capacity limits + waitlist
- [x] Recurring events (template → instances)
- [x] Admin: event list, create form
- [x] Portable Text event-listing block

### Missing for Parity
- [x] **Calendar views** (Phase 3 - month and list custom components)
- [x] **Stripe Checkout** (Phase 2 - paid events with PaymentIntent + inline checkout)
- [x] **Ticket types** (Phase 2 - early bird, VIP, general admission, group discounts)
- [x] **Multi-day events** (Phase 5 - endDate field, multi-day aware calendar/iCal rendering, validation)
- [x] **Event categories/tags** (Phase 5 - CRUD with filtering, color-coded categories)
- [x] **Venue management** (Phase 5 - saved locations with address/coordinates, full CRUD, reuse across events)
- [x] **iCal/Google Calendar** subscribe links (Phase 3 - iCal export endpoint)
- [x] **Check-in system** (Phase 3 - QR codes, confirmation codes, concurrency control, stats)
- [x] **Attendee portal** (Phase 3 - registrations, tickets, check-in status, QR codes)
- [x] **Attendee communication** (Phase 2 - email confirmation templates on registration)
- [x] **Refund handling** (Phase 2 - charge.refunded webhook updates registration status)
- [x] **Reporting** (Phase 5 - event performance, attendance trends, revenue per event)
- [x] **Embeddable widgets** (Phase 5 - upcoming events endpoint + embed code generator)
- [x] **CSV export** (Phase 5 - attendee registration export per event)
- [x] **Waiting list notifications** (Phase 5 - waitlist join, auto-notify when spots open)
- [x] **Event series** (Phase 5 - linked recurring events with shared branding, series CRUD)
- [x] **CSV import** (Phase 5 - bulk attendee import from CSV data)
- [x] **Developer webhooks** (Phase 5 - register/delete/test endpoints, health checks, signed payloads, logs)

### Out of Scope v1 (Phase 6+)
- [ ] **Organizer profiles** (dedicated organizer entity with bio, photo, linked events)

## MemberShip -- Full Parity Achieved

All MemberPress-equivalent features are now implemented. No remaining gaps.

## EventDash -- Near Full Parity

All Events Calendar + Event Espresso features implemented except Organizer Profiles (deferred to Phase 6).

## Build Order

Phase 1: Core scaffolding + basic functionality
Phase 2: Stripe integration + payments
Phase 3: Member/attendee portals + self-serve
Phase 4: Content rules + advanced gating/ticketing
Phase 5: Reporting, analytics, categories, venues, series, widgets, CSV, webhooks, multi-day, waitlist (COMPLETE)
Phase 6: Organizer profiles, UI polish, documentation
