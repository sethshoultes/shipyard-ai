# EventDash Debate — Round 1

**Date**: 2026-04-05

## Question 1: What's the MVP?

**Steve**: EventDash needs to work for Sunrise Yoga's class schedule. That means:
1. Events with date, time, location, recurring schedule
2. Registration (name + email, no account needed)
3. Capacity limits
4. List view of upcoming events (calendar can wait)
5. Admin CRUD for events

**Elon**: Agreed. The v0.1 has most of this as stubs. The real work:
1. Recurring events — a yoga class happens every Tuesday at 6pm. Don't make the admin create 52 events.
2. Registration emails — confirm registration via Resend
3. Waitlist — when capacity is full, allow waitlist signup
4. Cancel with notification — when someone cancels, notify the first waitlist person

**Decision**: MVP = events + registration + capacity + recurring + email confirmation. No calendar view, no Stripe, no iCal in v1.0.

## Question 2: Data model?

**Elon**: Events in KV, same as MemberShip pattern:
- `event:{id}` → {title, description, date, time, endTime, location, capacity, registered, price, recurring, createdAt}
- `registration:{eventId}:{email}` → {name, email, ticketCount, status, createdAt}
- `events:list` → [id1, id2, ...] sorted by date

**Steve**: Recurring events need a different approach. Store a template and generate instances:
- `event-template:{id}` → {title, recurrence: "weekly", dayOfWeek: "tuesday", time: "18:00", ...}
- Each instance is generated on-the-fly when listing events

**Decision**: Start simple — recurring events stored as individual events with a `templateId` field. Admin creates a template, system generates N weeks of instances. Can optimize later.

## Question 3: Email integration?

**Elon**: Optional Resend integration. If admin configures RESEND_API_KEY in settings, send:
1. Registration confirmation to attendee
2. Cancellation confirmation to attendee
3. Waitlist promotion notification

If no Resend key, skip emails silently.

**Decision**: Optional Resend. Plugin works without it.

## Locked Decisions
1. KV storage for events and registrations
2. Email-only registration (no accounts)
3. Capacity enforcement with waitlist
4. Recurring events via template → instance generation
5. Optional Resend for email notifications
6. Block Kit admin UI
7. No Stripe in v1.0 (free registration only)
8. No calendar view in v1.0 (list only)
9. Test on Sunrise Yoga (class schedule)
