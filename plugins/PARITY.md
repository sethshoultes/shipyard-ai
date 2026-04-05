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
- [ ] **Registration forms** (custom fields, multi-step)
- [x] **Upgrade/downgrade** (Phase 2 - pro-rated plan switching via Stripe API)
- [ ] **Reporting** (revenue charts, churn rate, LTV, growth, member activity)
- [ ] **Multiple payment gateways** (Stripe primary, PayPal secondary)
- [ ] **Group/corporate memberships** (org pays for N seats)
- [ ] **Developer webhooks** (member.created, member.cancelled, etc.)
- [ ] **CSV import/export** of members

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
- [ ] **Multi-day events** (conferences, festivals)
- [ ] **Event categories/tags** with filtering
- [ ] **Venue management** (saved locations, maps, directions)
- [ ] **Organizer profiles** (who's hosting)
- [x] **iCal/Google Calendar** subscribe links (Phase 3 - iCal export endpoint)
- [x] **Check-in system** (Phase 3 - QR codes, confirmation codes, concurrency control, stats)
- [x] **Attendee portal** (Phase 3 - registrations, tickets, check-in status, QR codes)
- [x] **Attendee communication** (Phase 2 - email confirmation templates on registration)
- [x] **Refund handling** (Phase 2 - charge.refunded webhook updates registration status)
- [ ] **Reporting** (attendance, revenue per event, popular times)
- [ ] **Embeddable widgets** (upcoming events for external sites)
- [ ] **CSV export** of attendees
- [ ] **Waiting list notifications** (auto-email when spot opens)
- [ ] **Event series** (linked recurring events with shared branding)

## Build Order

Phase 1 (current): Core scaffolding + basic functionality
Phase 2: Stripe integration + payments
Phase 3: Member/attendee portals + self-serve
Phase 4: Content rules + advanced gating/ticketing
Phase 5: Reporting + analytics
Phase 6: Email automation + notifications
Phase 7: Import/export + developer API
