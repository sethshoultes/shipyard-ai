# Phase 3 Debate: Member/Attendee Portals + Content Rules + Calendar Views — Round 2

**Date**: 2026-04-05  
**Participants**: Steve Jobs (Design), Elon Musk (Engineering), Phil Jackson (Moderator)  
**Format**: Challenges to Round 1 decisions. Assume decisions are locked—attack the assumptions.

---

## Challenge 1: Block-level gating will create a maintenance nightmare

**Elon (pushing back on block-level gating):**

Steve, I love the sneak-peek UX. But I'm worried block-level rules will become a support tax.

Here's the problem:
1. Content creators get freedom ("lock any block to any plan")
2. But no guardrails. Admin can lock footer, lock CTA, lock everything.
3. Creators forget which blocks are locked. User reports "where's the content?"
4. We end up building an admin UI to visualize which blocks are gated (scope creep)
5. Migration risk: if we lock blocks and later want to change plan structure, we have to re-audit every page.

**My worry:** Block-level gating is powerful but creates operational debt.

**Proposal to simplify:**

Instead of block-level, add **page-level variants**:
- One page can have multiple gating levels: "Public", "Members only", "Pro only"
- Content creator writes 3 versions of the same page (or one page with branches)
- Router serves the right version based on membership
- Simpler: page is either gated or not. No middle ground.

**Why this is better:**
- Creator thinks in pages, not blocks—mental model matches their workflow
- No orphaned locked blocks
- Easier to maintain (change plan structure = update page routes)
- Still unlocks sneak-peek (public version is preview, members version is full)

**Downside:** Creator has to write content twice. But that's clearer than "hide this one paragraph."

**Steve's counter:**

Elon, you're right to worry. But I disagree on the solution.

Block-level gating *is* powerful. The key is making it obvious to creators which blocks are locked. Here's how we prevent the nightmare:

1. **Visual indicator in editor:** Locked blocks have a colored badge: "Pro only". Super obvious.
2. **Admin audit page:** New admin feature (Phase 4, not v1) shows all gated blocks across all pages. Can search, filter.
3. **Default to simple:** On create, blocks are NOT locked. Creator has to explicitly choose to lock it.
4. **Good defaults:** Most pages are either fully public or fully gated. Block-level is the exception, not the rule.

The variant approach sounds simpler, but it creates a different problem: **content duplication**. Creator has to maintain three versions of the same page (public, member, pro). If they update the public version, they forget to update the member version. Now they're out of sync.

Block-level *requires* discipline, but it's a one-time decision per block. Variants require constant maintenance.

**I'm proposing:** Ship block-level with the visual badge. Add audit page in Phase 4. Don't ship variants—too much duplication risk.

**Elon concedes:** Fair point. The visual badge makes it clear. And audit page (Phase 4) is a good safety net. Let's do block-level.

**Decision:** Block-level gating with visual badge in editor. Audit page in Phase 4.

---

## Challenge 2: Can we really build custom calendar views without a library?

**Steve (pushing back on custom build):**

Elon, I said "no library", but I want to revisit. Building month view from scratch is risky.

Here's why:
1. **Edge cases:** Leap years, months starting on different days, DST changes, time zones
2. **UX debt:** React-big-calendar and fullcalendar have solved these. We'll have bugs we don't think of.
3. **Maintainability:** If a bug appears in 6 months, can a junior dev fix our custom calendar? With a library, it's documented.
4. **Performance:** Large calendars (500+ events) might be slow with our naive approach.

**I want to recommend:** Use a lightweight library. Something like `react-calendar` (8KB) or roll the month view ourselves but use a battle-tested event rendering library.

**Elon's counter:**

Steve, I get the worry. But look at what we're actually building:
- Month view: 30-42 cells, each cell shows 0-3 events (most days have 1)
- We don't need RRULE parsing (already done at event creation time)
- We don't need drag-drop (Phase 5 maybe, but not core)
- We don't need timezone UI (browser handles it)

The complexity that fullcalendar solves is: "How do I render a calendar with 1000 concurrent editing users?" We don't have that.

**Our custom month view:**
- 200 lines of React component
- Grid CSS (we know Tailwind)
- Click handler to navigate months
- All the "edge cases" are handled by JS Date (which we trust)

The bugs we'd hit are:
1. Off-by-one in month navigation (test with boundary dates: Jan 1, Dec 31, leap year)
2. Timezone mismatch (test with UTC vs. browser time)
3. Performance on 500+ events (we can optimize by limiting events shown, adding pagination)

These are *small* bugs, not systemic. We can fix them with 30 minutes of testing.

**Why no library:**
1. We avoid a 30KB dependency
2. We control the UX (library UX is often overstuffed)
3. The code is simple enough that future devs can understand it
4. We can customize the styling to match Tailwind design tokens

**I'm proposing:** Build month view custom. Build list view (definitely custom, it's just a card list). If we hit performance issues with 500+ events, we add pagination. If we hit timezone bugs, we can switch to a library then.

**Steve concedes:** OK, I was being conservative. Custom month view is fine if we test edge cases. Let's do it. But promise me we'll add a simple pagination control if we hit perf issues.

**Elon agrees:** Done. 500 events max per view, paginated if over.

**Decision:** Custom month + list views. Pagination for 500+ events.

---

## Challenge 3: Member/attendee portals might be out of scope for v1

**Phil (moderator):**

Guys, I'm going to push back on portal scope. Let's re-check token budget.

Portal features:
1. Content library (query accessible pages, render list)
2. Activity (if Phase 5, skip it)
3. Event registrations (query by email, render list)
4. Check-in (API endpoint, mark attendance)
5. iCal export (generate ICS file)
6. Ticket QR code (generate from payment ID)

That's a decent amount of work. Let me ask:
- Do we need activity in v1? (Elon: "No, Phase 5.")
- Do we need iCal export? (Steve: "Nice-to-have, low effort. One GET endpoint.")
- Do we need check-in? (Steve: "This is key for events. People expect it at the door.")

**Elon's assessment:**

Let me estimate tokens:
- MemberShip portal scaffolding: 5K tokens (auth, routes, components)
- Content library query + UI: 8K tokens (gating logic, list rendering)
- EventDash portal scaffolding: 5K tokens
- My registrations query + UI: 6K tokens
- Ticket generation (QR): 4K tokens
- Check-in API + UI: 6K tokens
- iCal export: 3K tokens
- Testing for all: 15K tokens

Total: ~52K tokens. That's 8-10% of Phase 3 budget (if Phase 3 is 500K like Phase 2).

We can do it.

**Steve's note:**

But there's a hidden cost: **portal UX needs to be good.** A half-baked portal looks unfinished. If we're shipping it, it needs:
- Clear loading states (skeleton screens)
- Error handling (network failure → show retry button)
- Mobile responsiveness (test on phone)
- Accessibility (keyboard nav, screen reader tested)

That's another 10K tokens in QA.

**Decision:** Portals are in Phase 3. Token budget: 60K total (including QA). Activity feature skips Phase 3 (Phase 5).

---

## Challenge 4: Drip content timing—should we use user time or server time?

**Steve (pushing back on server time):**

Elon said "server time is simpler." But members expect drip based on *their* time zone.

Example:
- Member in LA joins at 11 PM PT on Day 1
- Content unlocks "7 days later"
- Member expects: 11 PM PT on Day 8
- Server time (UTC): unlocks at 7 AM UTC on Day 9 (different person's experience)

This feels wrong to members.

**Elon's counter:**

I said server time (UTC) because implementing member timezone tracking is expensive:
1. Store member's timezone on signup (geolocation or ask them)
2. Drip checks compare: now (in member's tz) > joinDate + dripDays
3. Issue: JS Date conversions are error-prone

The simpler approach: 
- Store joinDate in UTC
- Drip check: `now > joinDate + (dripDays * 86400 seconds)`
- member sees unlock at a fixed UTC time (same for everyone)

**But Steve's point is valid.** What if we compromise?

**Middle ground:**
- Store member's timezone on subscription
- Drip unlock happens at midnight server time (UTC)
- So all members unlock at the same absolute moment (good for community, everyone gets access together)
- But we tell them: "Access unlocks on Day 8 (server time)"
- Or: "Access unlocks April 12 at 00:00 UTC"

**Actually,** most sites don't have enough members to care about this. And drip content is often "unlock weekly tips"—members don't expect precision timing.

**Practical proposal:** 
- Store joinDate in UTC
- Unlock happens at UTC midnight (server time)
- Show member: "Content unlocks on [DATE]" (no time specified, just date)
- Member sees unlock whenever they check (usually same day they expect)

**Steve agrees:** That works. The member doesn't see UTC in the UI, just the date. That's good enough.

**Decision:** Drip unlocks at UTC midnight relative to join date. Show "Available on [DATE]" in UI, not specific time.

---

## Challenge 5: Do we really need check-in? Can we simplify?

**Phil (cost control):**

Check-in is 6K tokens. It's useful but not core. Events work without it (we already send confirmation email).

Do we *need* check-in in Phase 3?

**Steve (strongly):**

YES. Here's why:

If you're putting on an event, you want to know who showed up. Without check-in, you have no data on attendance. That matters for:
- Refunding no-shows
- Understanding which time slots are popular
- Following up with attendees who didn't come

Check-in is the simplest form of reporting. And it's expected—every event platform has it.

But here's the thing: **check-in doesn't have to be complex.** Just:
1. Print attendee list with QR codes (via admin export)
2. At door, person scans QR → marks attendance
3. Done

That's 4K tokens, not 6K.

**Elon:**

I said 6K because I was thinking QR generation is complex. But actually:
- QR code library: 2KB (qrcode.react)
- Generate from: Stripe payment intent ID (unique, already have it)
- API endpoint to validate QR: 1K tokens

We can do this in 4K tokens total.

**Decision:** Ship check-in with QR codes. 4K tokens.

---

## Summary: Round 2 Resolutions

| Challenge | Resolution |
|-----------|-----------|
| **Block-level gating complexity** | Add visual badges in editor. Audit page Phase 4. Ship block-level. |
| **Custom calendar without library** | Build custom with pagination at 500 events. Test edge cases. |
| **Portal scope creep** | Portals in Phase 3. 60K token budget. No activity feature (Phase 5). |
| **Drip timing** | UTC server time. Show "Available on [DATE]" in UI. |
| **Check-in complexity** | Ship with QR codes. 4K tokens. Simplify validation logic. |

---

## Locked Decisions for Planning

1. Content rules: page-level + block-level (with badges)
2. Drip content: UTC time-based, show date in UI
3. Portals: MemberShip (content library) + EventDash (registrations)
4. Calendar views: custom Month + List
5. Check-in: QR code validation
6. Phase 3 budget: ~500K tokens (Phase 2 equivalent)

These are now locked. Planning can begin.
