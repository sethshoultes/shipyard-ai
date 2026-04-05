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
- [ ] **Stripe Checkout integration** (not Payment Links — real subscriptions)
- [ ] **Stripe webhooks** (subscription created, renewed, failed, cancelled, SCA)
- [ ] **Member dashboard** (self-serve portal: view plan, update billing, cancel)
- [ ] **Content rules engine** (per-page, per-category, partial content gating)
- [ ] **Email automation** (welcome, expiring soon, expired, payment receipt)
- [ ] **Coupon/discount codes** (percentage, fixed amount, expiring)
- [ ] **Drip content** (time-released access based on join date)
- [ ] **Registration forms** (custom fields, multi-step)
- [ ] **Upgrade/downgrade** (pro-rated plan switching)
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
- [ ] **Calendar views** (month, week, day, list)
- [ ] **Stripe Checkout** for paid events/tickets
- [ ] **Ticket types** (early bird, VIP, general admission, group)
- [ ] **Multi-day events** (conferences, festivals)
- [ ] **Event categories/tags** with filtering
- [ ] **Venue management** (saved locations, maps, directions)
- [ ] **Organizer profiles** (who's hosting)
- [ ] **iCal/Google Calendar** subscribe links
- [ ] **Check-in system** (QR codes, attendee check-in at door)
- [ ] **Attendee communication** (bulk email to registrants)
- [ ] **Refund handling** (cancel with refund via Stripe)
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
