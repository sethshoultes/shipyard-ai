# Plugin Suite Debate — Round 2

**Date**: 2026-04-05

## Steve challenges: The v0.1 code needs a rewrite, not a patch

**Steve**: I read the v0.1 MemberShip code. Problems:
1. The Zod validation imports won't work in EmDash's sandbox environment
2. The content:beforeRender hook checks a `gated` property but there's no way for an admin to mark content as gated
3. The storage schema stores plan data in settings AND in KV — pick one
4. No error handling on any API route
5. No input sanitization beyond Zod

**Elon**: Agreed. The v0.1 is scaffolding, not a product. Here's what v1.0 needs:

### MemberShip v1.0 Architecture
- **Storage**: Members in KV (email → {plan, status, paymentLink, createdAt})
- **Plans**: Defined in plugin settings via admin UI, NOT in KV
- **Gating**: New Portable Text block type "gated-content" that wraps content. The plugin renders it as visible or hidden based on member status.
- **Registration flow**: User enters email → gets a Stripe Payment Link → pays → admin manually confirms (or webhook in v1.1)
- **Admin**: Member list, plan editor, manual approve/revoke

### EventDash v1.0 Architecture
- **Storage**: Events in KV (id → {title, date, time, location, capacity, price, paymentLink})
- **Registrations**: KV (eventId:email → {name, ticketCount, paid, createdAt})
- **Event page**: Portable Text block type "event-card" that renders event details + register button
- **Registration**: Email + name → stored in KV → confirmation email via Resend (if configured)
- **Admin**: Event CRUD, registration list per event, export CSV

## Locked Decisions (updated)

1. Rewrite both plugins from scratch based on this architecture
2. MemberShip: Portable Text "gated-content" block for access control
3. EventDash: Portable Text "event-card" block for event display
4. Both: KV-only storage, no D1 dependency
5. Both: Admin UI via Block Kit
6. Both: Optional Resend integration for emails
7. Both: Optional Stripe Payment Links for payments
8. Error handling on every route
9. README with installation, configuration, and usage docs
