# Phase 3 Debate: Member/Attendee Portals + Content Rules + Calendar Views — Round 1

**Date**: 2026-04-05  
**Participants**: Steve Jobs (Design), Elon Musk (Engineering), Phil Jackson (Moderator)  
**Context**: Phase 2 shipped Stripe integration, webhooks, and member dashboards. Phase 3 adds granular content rules, drip content, and event calendar views.

---

## Question 1: How granular should content rules be?

**Steve Jobs (Design/UX):**

Content gating is the core value of MemberShip. Right now we have basic on/off access. Phase 3 needs flexibility without complexity for content creators.

Let me propose three tiers:

**Tier 1: Page-level gating** (current)
- Entire page locked to members of Plan X, Y, Z
- Simple UI: "Restrict to [dropdown: Basic/Pro/All Members]"
- Works for: premium guides, exclusive reports, member-only forums

**Tier 2: Section-level gating** (new in v1)
- Lock individual content blocks within a page
- Show preview for non-members, lock the juicy parts
- Works for: sneak peek articles, sample content, mixed audience pages
- UX: Admin marks blocks as "Premium section" with plan selector

**Tier 3: Category-based gating** (Phase 4, not v1)
- Lock entire content categories (e.g., "Tutorials" category requires Pro)
- Auto-applies to all current + future posts in category
- Complex, can wait

**My recommendation: Ship Tier 1 + Tier 2 in Phase 3.** Tier 3 can be Phase 4.

Here's why:
- Most memberships are page-based (premium articles, courses, resources)
- Section gating is the 20% that creates the "aha" (sneak peeks)
- Category gating is nice-to-have but creates maintenance headaches

**How to keep it simple:**
- Admin adds a Portable Text block-level setting: "Lock this block to [Plan]"
- Non-members see empty space or preview text
- Members see content
- No custom rules, no conditions—just membership plan membership

**Elon Musk (Engineering):**

Steve's tier approach is sound. From a technical angle, here's what matters:

**Current state:**
- Routes have `gated` metadata: true/false
- /api/gating checks if member has access to `/route`
- Content query filters by published membership

**Phase 3 approach:**

1. **Page-level rules** — Keep this. Already works.
   - Route metadata: `gating: [{ planId: 123, type: "page" }]`
   - Middleware checks before rendering

2. **Block-level rules** — New, and tricky
   - Each Portable Text block gets optional `gatingRule: { planId: 123 }`
   - On render, we check: does member have access to this block?
   - If not: render nothing (or placeholder/preview text)
   - If yes: render full block
   - **Complexity**: Portable Text rendering happens server-side (Astro) + client-side (React components). We need consistent gating logic in both places.

3. **Drip content** — Time-based access, new
   - Block or page gets `drip: { delayDays: 7 }`
   - Member joins on Day 0, gets access on Day 7
   - Needs: member sign-up date stored, access checker compares: now > joinDate + delayDays
   - **Complexity**: Drip rules create two time zones (user time vs. server time). Risky if not careful.

**My proposal:**

**v1 Phase 3 ships with:**
- Page-level gating (existing)
- Block-level gating (new, client-side rules only)
- Drip content (server-side time checks)

**Do NOT ship:**
- Category-level rules (Phase 4)
- Complex conditions (IF X AND Y THEN Z) — too complex for v1
- Conditional visibility logic (members see X, non-members see Y in same block) — causes confusion

**Implementation approach:**

1. **Gating engine** — New utility: `canAccessContent(memberId, rule, joinDate)`
   - Returns: true/false
   - Takes: member ID, gating rule object, member join date
   - Checks: membership plan + drip days

2. **Portable Text renderer** — Modified to check blocks
   - For each block, call `canAccessContent()`
   - If false, render `<GatedBlockPlaceholder />`
   - Show: "This content is for [Plan] members" or "Available in [N] days"

3. **Gating metadata schema**
   ```
   Block | Page gatingRule: {
     type: "membership" | "drip",
     planIds: [123, 456],
     dripDays: 7 (optional),
     previewText: "Available to Pro members" (optional)
   }
   ```

4. **Database** — Store member join_date on subscription creation
   - Drip checks: `now > subscription.created_at + dripDays`
   - No extra tables, keep it simple

**Why this matters:** 
- Block-level gating unlocks the "sneak peek" UX (sample content)
- Drip content creates engagement (members come back day-by-day)
- Keeping rules simple prevents support burden

**Decision needed:**
- Do we include preview text for locked blocks, or just empty space?
- Should drip unlock happen at midnight server time or midnight member time?

---

## Question 2: What should member and attendee portals look like?

**Steve:**

Phase 2 built the member dashboard (view plan, update payment, cancel). Phase 3 needs two portals:

**MemberShip Portal — New:**
Expand the dashboard to be a full member hub. Currently it's: "View your plan, update payment, cancel."

Add:
1. **Content library** — "Your access includes [LIST OF PAGES/COURSES]". Browse gated content you can access. Not a marketplace, just a "here's what you can now read" curated list.
2. **Activity** — If we're tracking (Phase 5 feature), show: "You've accessed [N] pieces of content this month". Motivation to engage.
3. **Referral** (optional) — If plan includes referral, show: "Refer a friend → [Link]. You've earned [N] referrals." Nice for viral growth.
4. **Upgrade prompts** — Context-aware. If member is on Basic and tries to access Pro content, show in dashboard: "Want access to [PAGE]? Upgrade to Pro for $19/month."

Keep it minimal. Don't make it a CMS. Just a hub to see what they get + next actions.

**EventDash Portal — New:**
Attendees need to see their registrations and tickets.

Show:
1. **My events** — Calendar/list of events I registered for. Status: Registered / Attended / Cancelled.
2. **Ticket** — If paid: QR code to show at door. If free: confirmation code.
3. **Check-in** — "Check in here" link (or QR to scan) that marks attendee as present.
4. **ICal link** — "Add to calendar" for my registered events.

This is simpler than MemberShip portal. Just: here's what I signed up for + my ticket.

**Both portals:**
- Auth: same JWT flow as member dashboard
- Mobile-first: people check these on their phone
- No account settings on portals (that's dashboard). Portals are read-only views.

**Elon:**

Steve's scope is good. Let me break down the implementation:

**MemberShip Portal:**

Same auth as dashboard. New routes:
- `/members/portal` — main hub (authenticated)
- `/members/portal/content` — list accessible pages/courses
- `/members/portal/activity` (future) — engagement stats

Each route queries:
- `/api/member/subscriptions` → current active plans
- `/api/member/accessible-content` → pages user can access (based on gating rules)
- `/api/member/activity` (Phase 5) → usage stats

**Complexity:** Accessible content query is expensive.
- We could query all pages, then filter on app (slow for large sites)
- Or pre-compute on subscribe (webhook): store member.accessible_pages in KV
- Or cache with 1-hour TTL

**Recommendation:** Cache in KV when subscription creates/updates. Query directly for now (simpler), optimize to cache if it's slow.

**EventDash Portal:**

New routes:
- `/events/portal` — my registrations (authenticated)
- `/events/portal/registrations/[id]` — single registration with ticket

Query `/api/event/my-registrations` → fetch all registrations where email = member.email

**Ticket flow:**
- If event is free: show confirmation code (random string)
- If event is paid: generate QR code from Stripe payment intent ID (Stripe ensures uniqueness)
- On check-in: scan QR → API validates payment was completed

**Check-in implementation:**
- Endpoint: POST `/api/event/[id]/check-in` with QR code or confirmation code
- If valid: mark registration as checked_in = true + timestamp
- If already checked in: show "Already checked in at [TIME]"

**iCal feed:**
- GET `/api/event/my-registrations.ics` → returns iCal format
- Member imports into Google Calendar / Apple Calendar

**Architecture note:**
Both portals are read-only views of existing data. No new data to store (except check-in status for events).

**Decision needed:**
- Should member portal show past events / expired memberships? (I'd say yes, with "Expired" badge.)
- Should check-in require QR scan, or can attendee enter confirmation code manually? (Both, for accessibility.)

---

## Question 3: How should calendar views work?

**Steve:**

Events are great, but people think in calendars. We need:

1. **Month view** — Grid. Dots or badges show which days have events. Click day → see events on that day.
2. **Week view** — 7-day horizontal strip. Time slots. Better for daily busy planners.
3. **List view** — "Upcoming events" sorted by date. Good for mobile + simple events.
4. **Day view** — Optional. For conferences with 20+ sessions per day.

**My recommendation: Ship Month + List in Phase 3.** Week view can be Phase 4. Day view is probably never needed.

Why Month + List?
- Month shows the big picture (when is the next event?)
- List is easiest to implement (just sort by date, render)
- Together they cover 90% of use cases
- Most WordPress event plugins default to this combo

**UI details:**
- Month view: Tailwind + custom CSS grid. No library needed.
- List view: Simple cards, date + location.
- Filtering: dropdown filters for category (if we have them), past/upcoming toggle.
- Colors: Event color coded by category (if we support it).

**Mobile:** Stack both views (month below list on small screens, or tabs).

**Elon:**

Steve's scope is solid. Calendar implementation is straightforward if we avoid libraries.

**Why no library?**
- Most calendar libraries (react-big-calendar, fullcalendar.io) are 30KB+ gzipped
- Their UX is often overstuffed (time zones, drag-drop, RRULE parsing)
- For Phase 3, we just need basic views—we can build it

**Month view implementation:**

Simple approach:
1. Query all events for the calendar month
2. Group by date (use day-of-month as key)
3. Render grid: 7 columns (Sun-Sat), 6 rows (weeks)
4. Each cell shows events for that date (or badge count)
5. Click → open modal or navigate to day detail

```
Tech: Portable Text block component
Props: { events: Event[], month: Date, onDayClick: (date) => void }
State: selectedDate, expanded
Render: <MonthCalendar events={events} month={month} onDayClick={...} />
```

**List view implementation:**

Even simpler:
1. Query all events
2. Filter: past/upcoming, category (optional)
3. Sort by date ascending
4. Render as card list
5. Each card: event name, date, time, location, "Register" button

```
Tech: Portable Text block component
Props: { events: Event[], limit: 10 }
Render: <UpcomingEventsList events={events} limit={10} />
```

**Data query:**

New endpoint: `/api/event/list`
- Query params: ?from=YYYY-MM-DD&to=YYYY-MM-DD&category=X&limit=100
- Returns: sorted array of events
- Already have this for EventDash admin

**Timezone handling:**
- Store event times in UTC in KV
- Convert to user's browser timezone on display (JS Date handles this)
- No server-side timezone complexity needed

**Recurring events:**
- Expand recurring events to individual instances in-memory (don't store)
- Query range: [month start, month end + 30 days] to catch overflowing months
- Filter instances within month on render

**Filtering:**

Keep simple:
- Past vs. Upcoming toggle
- Category dropdown (if EventDash has categories — check PARITY.md)

**Do NOT ship in Phase 3:**
- Drag-drop reordering (Phase 5)
- RRULE UI (event creation uses RRULE, but don't expose complex rule editor)
- Time zone conversion UI (browser handles it)
- iCal import (too complex for v1)

**Decision needed:**
- Should month view show event name or just a dot?
- Should list view show all time slots for multi-day events, or collapse them?
- Should we lazy-load events or fetch all upfront?

---

## Summary: Round 1 Decisions

| Topic | Decision |
|-------|----------|
| **Content rules granularity** | Tier 1 (page-level) + Tier 2 (block-level). Tier 3 (category) is Phase 4. |
| **Drip content** | Yes, time-based unlock based on join date. Server-side checks. |
| **Preview text for locked blocks** | Yes, show what plan unlocks it. |
| **Drip unlock timing** | Server time (UTC). Simpler than member timezone tracking. |
| **MemberShip portal scope** | Content library + activity (minimal). No referral in v1. |
| **EventDash portal scope** | My registrations + tickets + check-in + iCal export. |
| **Check-in** | Both QR scan + manual confirmation code. |
| **Calendar views** | Month + List. Week/Day are Phase 4. |
| **Calendar library** | Custom build, no external library. |
| **Event filtering** | Past/Upcoming toggle + category dropdown (if categories exist). |

---

## What we're NOT shipping in Phase 3

- Complex conditional gating (IF...THEN rules)
- Category-level rules
- Admin rule builder UI (just metadata in blocks)
- Member referral portals
- Week/Day calendar views
- Drag-drop reordering
- Time zone UX
- iCal import
- Advanced check-in (QR validation, attendance reports)

---

## Next: Round 2 Challenge

Round 2 will push back on:
1. Is block-level gating too complex to keep simple?
2. Can we really build calendar views without a library?
3. Are we overcomplicating portals?

**To Round 2 proposers:** Assume these decisions are locked. Attack the implementation assumptions, not the scope.
