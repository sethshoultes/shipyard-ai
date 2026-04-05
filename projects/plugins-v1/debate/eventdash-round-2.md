# EventDash Debate — Round 2

**Date**: 2026-04-05

## Steve challenges: The Portable Text block

**Steve**: EventDash needs a Portable Text block type "event-listing" that site builders can drop into any page. It renders the next N upcoming events with register buttons. This is how the plugin surfaces in the site — not just API routes.

**Elon**: Agreed. The block should:
1. Show configurable number of upcoming events (default 5)
2. Each event: title, date/time, location, spots remaining
3. "Register" button that submits name + email via the API
4. Show "Full — Join Waitlist" when at capacity

**Decision**: Portable Text block "event-listing" with Astro renderer.

## Locked Decisions (final)
1-9 from round 1, plus:
10. Portable Text "event-listing" block with Astro renderer
11. Register button submits via fetch to plugin API
12. Shows "Full — Join Waitlist" when capacity reached
