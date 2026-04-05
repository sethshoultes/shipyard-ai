# EventDash v1.0 — Ship Report

**Date**: 2026-04-05
**Pipeline**: Full Great Minds process

## What shipped
- @shipyard/eventdash v1.0 — first events & ticketing plugin for EmDash
- 1,000+ lines TypeScript
- 7 API routes (events, eventDetail, register, cancel, createEvent, createTemplate, generateRecurring)
- Block Kit admin UI (event list, create form, attendee management, dashboard widget)
- Portable Text "event-listing" block with Astro renderer
- Capacity enforcement with waitlist + auto-promotion
- Recurring events via template → instance generation
- Optional Resend email notifications
- Comprehensive README

## Pipeline history
1. DEBATE: 2 rounds — email-only, KV storage, capacity + waitlist, recurring, no Stripe v1.0
2. BUILD: Elon delivered v1.0 rewrite from debate decisions
3. REVIEW: Margaret found 7 P0s (type safety, race condition, missing template route, etc.)
4. FIX: Elon fixed all 7 P0s + P1 improvements
5. RE-REVIEW: Margaret confirmed all fixed, recommended SHIP

## QA Status
- 7 P0 issues: ALL FIXED
- TypeScript strict: PASS
- Per-event capacity locking: PASS
- Waitlist cancellation: PASS
- Template creation + recurring generation: PASS
- Astro component error handling: PASS

## Parity gap (vs Events Calendar + Event Espresso)
- ~20% parity
- Missing: calendar views, Stripe ticketing, ticket types, venues, check-in, refunds, reporting
- Phase 2-7 needed for full parity
