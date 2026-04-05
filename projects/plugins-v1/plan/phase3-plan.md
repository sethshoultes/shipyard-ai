# Phase 3: Member/Attendee Portals + Content Rules + Calendar Views — Build Plan

**Date**: 2026-04-05  
**Directors**: Elon Musk (Engineering), Steve Jobs (Design)  
**Phase Duration**: 3 weeks  
**Token Budget**: 360K tokens (from 500K plugin base)  

**North Star**: Members own their access. Content rules are invisible but powerful. Portals feel like home, not features. Calendars are simple and reliable.

---

## Architecture Summary

### Core Principles (from Rick Rubin Essence Check)
1. **Ownership over access** — Portals show "yours" not "what the business gives." Member feels they belong.
2. **Simple at the edge** — Lock block or not. See calendar or list. No complex rules or builders in v1.
3. **Consistency over features** — Portal data fresh from source, never cached. Times exact. Trust built on reliability.

### Tech Stack
- **Content gating**: Portable Text block-level rules + Drizzle schema migrations
- **Portals**: React components (MemberShip content library, EventDash registrations)
- **Calendar views**: Custom React Month + List components (no libraries)
- **QR codes**: `qrcode.react` library (2KB)
- **iCal export**: `ical-generator` library or custom ICS string builder
- **Frontend**: Skeleton loaders during fetch (never cache subscription data)
- **API routes**: `/api/member/accessible-content`, `/api/event/my-registrations`, `/api/event/check-in`, `/api/event/list`

### Build Phases

```
Wave 1 (Independent — parallel)      [Days 1-3]
├─ Task 1: Content gating engine
├─ Task 2: Drizzle schema (member_join_date)
├─ Task 3: Calendar list view component
└─ Task 4: MemberShip portal scaffolding

Wave 2 (Depends on Wave 1)           [Days 4-6]
├─ Task 5: Content library query + UI
├─ Task 6: Block-level gating render logic
├─ Task 7: Month calendar view component
└─ Task 8: EventDash portal scaffolding

Wave 3 (Depends on Wave 2)           [Days 7-10]
├─ Task 9: My registrations query + UI
├─ Task 10: QR ticket generation
├─ Task 11: Check-in API + UI
└─ Task 12: iCal export endpoint

Wave 4 (Depends on Wave 3)           [Days 11-14]
├─ Task 13: Drip content unlock logic
├─ Task 14: Portal mobile optimization
├─ Task 15: Edge case testing
└─ Task 16: README + ship
```

---

## WAVE 1: Infrastructure & Scaffolding (Parallel)

### TASK 1: Content Gating Engine — Utility Functions

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 6 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- Phase 3 Round 1: "Content rules: page-level + block-level gating"
- Phase 3 Round 2: "Block-level gating with visual badges. Audit page Phase 4."
- PARITY.md: "Missing: Content rules engine (per-page, per-category, partial content gating)"
- Rick Rubin: "Simplicity at the edge, complexity hidden"

**Description**:
Build the core gating engine: functions that check if a member has access to content (page or block). Handles membership plans, drip content timers, and returns boolean + metadata for UI (what plan unlocks it?).

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/` (structure)
- `/home/agent/shipyard-ai/plugins/membership/src/types.ts` (Member type)
- Phase 3 debate: `phase3-round-1.md` Q1 and Q3 (gating granularity, drip timing)

**Steps**:

1. **Define gating rule schema**:
   ```typescript
   interface GatingRule {
     type: "membership" | "drip";
     planIds: string[]; // ["basic", "pro", "enterprise"]
     dripDays?: number; // for drip type
     previewText?: string; // "Available to Pro members"
   }
   ```

2. **Create canAccessContent() utility**:
   - Input: memberId, contentRule, memberJoinDate
   - Logic: Check if member's subscription matches planIds + drip days elapsed
   - Output: { hasAccess: boolean, reason?: string, unlocksOn?: Date }
   - Handle: member not found, subscription expired, drip not yet ready

3. **Create canAccessBlock() utility**:
   - Input: blockRule (optional), member, joinDate
   - If no rule: return true (public block)
   - If rule exists: call canAccessContent() → return result

4. **Create getDripStatus() utility**:
   - Input: memberJoinDate, dripDays
   - Returns: { isLocked: boolean, unlocksOn: Date, daysRemaining: number }
   - Handle: UTC midnight calculation (no member timezone complexity)

5. **Create getMemberAccessList() utility**:
   - Input: memberId
   - Returns: array of page/block IDs member can access
   - Queries: member subscription from Stripe API + join date from KV
   - Caches: none (always fresh from Stripe)

6. **Write unit tests**:
   - Test member with no subscription: no access
   - Test member with correct plan: has access
   - Test drip content: locked until day 7
   - Test drip content: unlocked on day 8
   - Test UTC midnight boundary (test with mock dates like April 11 23:59 UTC, April 12 00:01 UTC)

**Verification Checklist**:
- ✓ canAccessContent() handles all 4 cases (no sub, wrong plan, right plan, drip locked/unlocked)
- ✓ dripDays calculation uses UTC midnight consistently
- ✓ Unit tests pass (5 scenarios)
- ✓ No external calls (all logic is synchronous)

---

### TASK 2: Drizzle Schema Migration — member_join_date Field

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 3 hours  
**Token Budget**: 6K  

**Requirement Trace**:
- Phase 3 Round 1: "Drip content: time-released access based on join date — how to implement?"
- PARITY.md: "Missing: Drip content (time-released access based on join date)"
- Task 1 dependency: canAccessContent needs member.joinDate

**Description**:
Add `joinDate` field to MemberShip KV schema. Timestamp of when member subscription was created. Used by drip content engine to calculate unlock times.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/schema.ts` or equiv
- Stripe integration code from Phase 2 (subscription creation points)

**Steps**:

1. **Create migration file**:
   - Name: `add-member-join-date.ts`
   - Adds `joinDate: Date` field to member record in KV schema

2. **Update subscription creation**:
   - When webhook creates subscription in KV, set joinDate = now()
   - Only set on first subscription, not on renewal

3. **Backfill existing members** (optional):
   - Set joinDate to their first subscription createdAt from Stripe
   - Or leave null (easier, assume no drip content retroactively)

4. **Test**:
   - New subscription: joinDate is set to now
   - Existing subscriptions: handled gracefully (null or backfilled)

**Verification Checklist**:
- ✓ Schema migration runs without error
- ✓ New member subscriptions get joinDate = now()
- ✓ Existing members have joinDate set or defaulted
- ✓ Database query performance unchanged

---

### TASK 3: Calendar List View Component

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 5 hours  
**Token Budget**: 10K  

**Requirement Trace**:
- Phase 3 Round 1: "Calendar views: month/week/list — build custom or use a library? Decision: Month + List, custom build."
- Phase 3 Round 2: "Build custom month view. Build list view (definitely custom, it's just a card list)."
- PARITY.md: "Missing: Calendar views (month, week, day, list)"

**Description**:
Build a simple Upcoming Events list view. Display events sorted by date, with filters (past/upcoming toggle, category dropdown). Mobile-first, card-based layout.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/eventdash/src/components/` (component structure)
- Phase 2 event model + queries
- Tailwind design tokens (colors, spacing)

**Steps**:

1. **Create UpcomingEventsList component**:
   - Props: `events: Event[]`, `limit?: number` (default 10)
   - Render: Card list, each card shows:
     - Event name (link to event detail page)
     - Date + time (JS Date converts to browser timezone)
     - Location
     - Attendance badge ("Registered", "Waitlist", etc.)
     - "Register" button (if not registered)

2. **Add filtering UI**:
   - Toggle: "Upcoming" / "Past" (defaults to Upcoming)
   - Dropdown: Filter by category (if categories exist, else hide)
   - Sorting: always by date ascending

3. **Responsive design**:
   - Desktop: 3-column grid or 2-column
   - Mobile: 1 column
   - Use Tailwind (mobile-first)

4. **Loading state**:
   - Skeleton loader while fetching events
   - 3 skeleton cards placeholder

5. **Portable Text block**:
   - Wrap component as Portable Text block type
   - Block props: `limit`, `showCategories`, `showPastEvents`

**Verification Checklist**:
- ✓ Events render in ascending date order
- ✓ Filters work (toggle past/upcoming, category dropdown)
- ✓ Card shows all fields (name, date, location, registration status)
- ✓ Mobile responsive (test on 375px viewport)
- ✓ Loading skeleton appears during fetch
- ✓ Works with 50+ events (performance acceptable)

---

### TASK 4: MemberShip Portal Scaffolding — Routes + Auth

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 4 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- Phase 3 Round 1: "Member portal: what self-serve features beyond dashboard? Content library + activity (minimal)."
- Phase 3 Round 2: "Portals in Phase 3. 60K token budget."
- Rick Rubin: "Portal ≠ Dashboard. Portal is where you experience value."

**Description**:
Create portal scaffolding: authenticated routes, layout, basic navigation. Member can access `/members/portal` (content library placeholder), separate from existing dashboard (`/members/dashboard` for plan management).

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/routes/` (route structure)
- Phase 2 dashboard code
- Auth middleware from Phase 2 (JWT validation)

**Steps**:

1. **Create route: GET /members/portal**:
   - Auth: JWT required (middleware)
   - Render: Portal layout (header, nav, main content area)
   - Show: "Content Library" placeholder, "My Plan", "Account Settings" nav

2. **Create route: GET /members/portal/content**:
   - Auth: JWT required
   - Render: Content library (placeholder, filled by Task 5)
   - Show: list of pages/courses member can access

3. **Create portal layout component**:
   - Header: Member's name, logout link
   - Nav: Links to Content Library, Dashboard (plan settings), Help
   - Main: content area (child pages fill this)
   - Footer: copyright, privacy link

4. **Styling**:
   - Use design tokens (terracotta accents, sage secondary)
   - Mobile nav: hamburger menu on mobile
   - Typography: Lora headings, Source Sans body

5. **Create loading/error states**:
   - Loading: skeleton layout
   - Error: "Failed to load portal. Retry?" button

**Verification Checklist**:
- ✓ Routes respond to GET /members/portal with 200
- ✓ Auth: unauthenticated request → 401
- ✓ Layout renders cleanly (header, nav, main, footer)
- ✓ Mobile responsive
- ✓ Navigation links functional

---

## WAVE 2: Content Gating + Calendar + Portal Content (Depends on Wave 1)

### TASK 5: Content Library Query + UI

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 7 hours  
**Token Budget**: 14K  

**Requirement Trace**:
- Phase 3 Round 1: "Content library — 'Your access includes [LIST OF PAGES/COURSES]'. Browse gated content you can access."
- Task 1 + Task 4 dependency: canAccessContent() engine, portal scaffolding
- Rick Rubin: "Portal shows 'your content', not what the business gives"

**Description**:
Build the content library page. Query all pages/courses member can access (using gating engine from Task 1), render as a browsable list/grid. Show: title, excerpt, category, "Read" button.

**Context Files**:
- Task 1: gating engine (getMemberAccessList utility)
- `/home/agent/shipyard-ai/plugins/membership/schema.ts` (page/course content type)
- Existing content queries from Phase 1/2

**Steps**:

1. **Create API endpoint: GET /api/member/accessible-content**:
   - Auth: JWT required
   - Query: all pages + courses in KV
   - Filter: keep only those member can access (use canAccessBlock/canAccessContent from Task 1)
   - Return: array of { id, title, excerpt, category, slug, joinDate }
   - Performance: cache for 1 minute (member's accessible list doesn't change often, except drip unlocks)

2. **Create ContentLibrary component**:
   - Props: `memberId`, `memberJoinDate`
   - Fetch: call /api/member/accessible-content
   - Render: Grid of content cards
   - Each card shows: title, excerpt, category badge, "Read →" link
   - Show "New" badge if content drip-unlocked in last 7 days

3. **Add filtering**:
   - Category filter dropdown
   - Search box (live search on title)
   - Sort: by date added, alphabetical

4. **Empty state**:
   - "No content yet" message if member has no access
   - "Upgrade to Pro to unlock [N] more articles" CTA

5. **Responsive design**:
   - Desktop: 3-column grid
   - Mobile: 1 column, stack

**Verification Checklist**:
- ✓ Only accessible content appears in list
- ✓ Page gating works (page locked to Pro → only shows for Pro members)
- ✓ Block gating works (page with mixed blocks → shows full content for Pro, partial for Basic)
- ✓ Drip content shows "New" badge if unlocked < 7 days ago
- ✓ Search filters live (debounced)
- ✓ Loads in <1s for typical member (20-50 accessible items)

---

### TASK 6: Block-Level Gating Render Logic

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 6 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- Phase 3 Round 1: "Block-level rules: each Portable Text block gets optional gatingRule"
- Phase 3 Round 2: "Add visual badges in editor. Audit page Phase 4. Ship block-level."
- Task 1 dependency: canAccessBlock() utility

**Description**:
Integrate gating into Portable Text block rendering. When rendering a block with a gating rule, check member access. If locked, show placeholder ("This content is for Pro members") instead of content.

**Context Files**:
- Portable Text renderer (likely in core plugin or content-rendering service)
- Task 1: canAccessBlock utility
- Block component library

**Steps**:

1. **Add gatingRule to block schema**:
   ```typescript
   interface PortableTextBlock {
     _type: string;
     gatingRule?: {
       type: "membership";
       planIds: string[];
       previewText?: string; // "Pro members only"
     };
   }
   ```

2. **Create GatedBlockWrapper component**:
   - Props: `children` (block content), `gatingRule`, `member`
   - Logic:
     - If no gatingRule: render children (public)
     - If gatingRule + member has access: render children
     - If gatingRule + no access: render GatedBlockPlaceholder
   - GatedBlockPlaceholder shows: "This section is for [Plan] members. Upgrade?"

3. **Wrap all block renderers**:
   - Each block type (heading, image, paragraph, custom) wraps with GatedBlockWrapper
   - Pass member from route context (via useContext or prop)

4. **Visual editor indicator** (for admin):
   - In page editor, locked blocks show badge: "🔒 Pro only"
   - Badge is inline, always visible
   - Admin clicks badge → can change plan or unlock

5. **Test gating logic**:
   - Render page with mixed blocks (some locked, some public)
   - Non-member: sees only public blocks
   - Basic member: sees public + basic blocks, locked Pro blocks show placeholder
   - Pro member: sees all blocks

**Verification Checklist**:
- ✓ Locked blocks render placeholder instead of content
- ✓ Placeholder shows which plan unlocks it
- ✓ Admin editor shows visual badge
- ✓ Non-members see correct content (public blocks only)
- ✓ Members see correct content (gating respected)
- ✓ Editor change to gating rule updates preview immediately

---

### TASK 7: Month Calendar View Component

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 8 hours  
**Token Budget**: 16K  

**Requirement Trace**:
- Phase 3 Round 1: "Calendar views: month view — build custom or use a library? Decision: custom build."
- Phase 3 Round 2: "Build month view custom. Pagination for 500+ events. Test edge cases."
- PARITY.md: "Missing: Calendar views (month, week, day, list)"

**Description**:
Build a custom month calendar view. Grid layout (7 columns, 6 rows). Each day cell shows events for that day (or badge count). Click day → expand to see details or navigate to day view. Handle month navigation (prev/next).

**Context Files**:
- Task 3: UpcomingEventsList component (pattern)
- EventDash event model
- Tailwind for styling

**Steps**:

1. **Create MonthCalendar component**:
   - Props: `events: Event[]`, `month: Date`, `onDayClick?: (date: Date) => void`
   - State: `currentMonth`, `selectedDay`
   - Render: 7-column grid (Sun-Sat), 6-row grid (weeks)

2. **Generate calendar grid**:
   - Get first day of month (JS Date)
   - Calculate days before month starts (fill with prev month's trailing days)
   - Populate days 1-28/29/30/31 with current month
   - Fill remaining cells with next month's leading days
   - Style cells: gray for non-current month

3. **Populate event dots**:
   - For each day, count events: if 0, show empty; if 1-2, show dots/badges; if 3+, show "+2 more"
   - Color-code by category (if categories exist)
   - Click badge → expand modal showing all events on that day

4. **Month navigation**:
   - Buttons: "← Prev", "Next →"
   - Show current month/year heading
   - Clicking prev/next updates `currentMonth` state

5. **Event modal/detail**:
   - Click day with events → modal or sidebar shows full event list for that day
   - Shows: event name, time, location, "Register" button

6. **Edge case testing**:
   - Test Feb 29 (leap year): correct grid layout
   - Test Jan 1, Dec 31: prev/next month navigation works
   - Test DST boundary: event times display correctly
   - Test 500+ events: pagination or lazy load (limit 50 per month view, paginate on demand)

**Verification Checklist**:
- ✓ Calendar grid displays correctly for any month
- ✓ Days align correctly (Sun = left, Sat = right)
- ✓ Event dots appear on correct dates
- ✓ Event count badge shows "+X more" if > 2 events per day
- ✓ Prev/next navigation works, state updates
- ✓ Leap year Feb 29 renders correctly
- ✓ Clicking day with events shows modal
- ✓ Performance acceptable with 500+ events (use pagination)

---

### TASK 8: EventDash Portal Scaffolding — Routes + Auth

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 4 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- Phase 3 Round 1: "EventDash Portal — show: My events, Ticket, Check-in, ICal link"
- Phase 3 Round 2: "Portals in Phase 3. 60K token budget."
- Task 4 dependency: portal scaffolding pattern

**Description**:
Create event attendee portal. Routes: /events/portal (my registrations list), /events/portal/registrations/[id] (ticket + check-in). Authenticated via JWT (same auth as membership).

**Context Files**:
- Task 4: MemberShip portal scaffolding (pattern)
- EventDash registration model
- Phase 2 auth middleware

**Steps**:

1. **Create route: GET /events/portal**:
   - Auth: JWT required
   - Query: registrations where email = member.email
   - Render: list of events member registered for

2. **Create route: GET /events/portal/registrations/[id]**:
   - Auth: JWT required
   - Render: single registration detail + ticket + check-in UI

3. **Create portal layout component** (similar to Task 4):
   - Header: Attendee name, logout
   - Nav: My Events, Account Settings
   - Main: event list or ticket detail
   - Styling: consistent with membership portal

4. **Responsive design**:
   - Mobile: full-width
   - Desktop: sidebar nav or top nav

**Verification Checklist**:
- ✓ Routes /events/portal, /events/portal/registrations/[id] respond
- ✓ Auth: unauthenticated → 401
- ✓ Layout renders (header, nav, main)
- ✓ Mobile responsive

---

## WAVE 3: Portal Content + Tickets + Check-in (Depends on Wave 2)

### TASK 9: My Registrations Query + UI

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 6 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- Phase 3 Round 1: "EventDash Portal — show: My events (Calendar/list of events I registered for)"
- Task 8 dependency: EventDash portal scaffolding
- Similar pattern to Task 5 (content library)

**Description**:
Query registrations for authenticated member. Display as list or calendar. Show status (Registered / Attended / Cancelled), event details (date, time, location), and action buttons (view ticket, add to calendar).

**Context Files**:
- EventDash registration model
- Task 3: UpcomingEventsList component (pattern)
- JWT auth from Phase 2

**Steps**:

1. **Create API endpoint: GET /api/event/my-registrations**:
   - Auth: JWT required
   - Query: registrations where email = member.email
   - Return: array of { eventId, eventName, eventDate, eventTime, location, status, registrationId }
   - Filter: upcoming events (can add past/all toggle later)
   - Sort: by date ascending

2. **Create MyRegistrations component**:
   - Props: `memberId`, `memberEmail`
   - Fetch: /api/event/my-registrations
   - Render: list or grid of registration cards
   - Each card shows: event name, date/time, location, status badge, "View Ticket" link

3. **Add filters**:
   - Toggle: "Upcoming" / "Past" (default Upcoming)
   - Show past events user attended (engagement motivation)

4. **Empty state**:
   - "You haven't registered for any events yet. Find events →" with link

5. **Status badge**:
   - "Registered" (event upcoming)
   - "Checked in" (attended)
   - "Cancelled" (unregistered)

**Verification Checklist**:
- ✓ Query returns only authenticated user's registrations
- ✓ Registrations sorted by date
- ✓ Cards show all info (name, date, location, status)
- ✓ Filter toggle works (upcoming/past)
- ✓ Loads in <1s for typical user (10-20 registrations)

---

### TASK 10: QR Ticket Generation + Display

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 5 hours  
**Token Budget**: 10K  

**Requirement Trace**:
- Phase 3 Round 1: "Ticket — If paid: QR code to show at door. If free: confirmation code."
- Phase 3 Round 2: "Ship check-in with QR codes. 4K tokens."
- Task 9 dependency: registration query

**Description**:
Generate and display QR code on ticket. For paid events, encode payment intent ID (unique). For free events, generate confirmation code. Display on /events/portal/registrations/[id] page with attendee name, event details, and QR.

**Context Files**:
- Phase 2 Stripe integration (PaymentIntent)
- Task 9: registration detail route
- `qrcode.react` library (2KB)

**Steps**:

1. **QR code generation logic**:
   - Paid event: encode `{registrationId}:{paymentIntentId}` (Stripe ensures unique intent ID)
   - Free event: generate random 8-char code (e.g., "A7X2K9M1"), store in registration record
   - Use `qrcode.react` library: `<QRCode value={qrValue} size={256} />`

2. **Create Ticket component**:
   - Props: `registration`, `event`, `isCheckedIn`
   - Render: card showing:
     - Event name, date, time, location
     - Attendee name ("Your Ticket")
     - QR code (size: 256x256px, printable)
     - Confirmation code (text below QR, easy to copy)
     - "Check in" button (if event is today/future)
     - "Already checked in at [TIME]" if checked_in = true

3. **Mobile optimization**:
   - QR should be full-width, large (attendee holds phone to scanner)
   - Easy to read name and event details
   - Print-friendly (black QR on white)

4. **Data in registration model**:
   - Add fields: `free_confirmation_code` (for free events), `checked_in_at` (timestamp)
   - Update on registration create: set confirmation code (free) or link to PaymentIntent (paid)

**Verification Checklist**:
- ✓ QR code renders for paid events (encodes payment intent)
- ✓ Confirmation code shows for free events (unique, persistent)
- ✓ Ticket displays: event name, date, time, location, attendee name
- ✓ QR code scannable by typical barcode reader
- ✓ Mobile layout: QR full width, readable
- ✓ Print-friendly (black on white, no fancy colors that don't print)

---

### TASK 11: Check-in API + UI

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 6 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- Phase 3 Round 1: "Check-in: QR codes at door. Attendee communication: bulk email to registrants"
- Phase 3 Round 2: "Ship check-in with QR codes. Both QR scan + manual confirmation code."
- Task 10 dependency: QR code generation

**Description**:
Build check-in flow. Member scans QR (or enters confirmation code) on their ticket. API validates, marks registration as checked_in, shows confirmation. Admin can also bulk check-in (upload attendee list).

**Context Files**:
- Task 10: QR code + ticket
- EventDash registration model
- Check-in scanner libraries (optional, can use browser camera API for web scanning)

**Steps**:

1. **Create API endpoint: POST /api/event/[eventId]/check-in**:
   - Auth: optional (can be anonymous, but validate QR is valid for this event)
   - Body: `{ qrValue: string }` OR `{ confirmationCode: string }`
   - Logic:
     - Parse QR: extract registrationId + paymentIntentId (paid) or confirmationCode (free)
     - Query registration: validate exists + belongs to this event
     - Check: already checked in? If yes, return "Already checked in at [TIME]"
     - If not: set checked_in_at = now(), status = "attended"
     - Return: { success: true, attendeeName: string, timestamp: Date }
   - Error cases: invalid QR, no registration found, event not found → 400/404

2. **Create CheckinForm component**:
   - For mobile: camera input (barcode scanner)
   - For manual entry: text input ("Enter confirmation code or scan QR")
   - On submit: call check-in API
   - Show: success message ("✓ Welcome [Name]!") or error ("QR not recognized")
   - Clear form after submit (ready for next attendee)

3. **In-browser QR scanning** (optional, nice-to-have):
   - Use `html5-qrcode` library or native Camera API
   - Member holds phone to door, camera scans their QR
   - Alternatively: manual text field (attendee reads code)
   - Recommendation: start with text field (simpler), add camera scanning if time

4. **Admin check-in UI** (simpler):
   - Admin at door has phone/tablet
   - Can check in attendee by entering confirmation code
   - Show: list of attendees with checkboxes, bulk check-in
   - Display: "You've checked in 47 of 150"

5. **Error handling**:
   - "QR not recognized" → show code to try again
   - "Already checked in" → show time + "Thank you!"
   - "Event not found" → "Check the QR code"

**Verification Checklist**:
- ✓ QR scan via text input works (parses registrationId + paymentIntentId)
- ✓ Confirmation code entry works (valid code → check-in)
- ✓ Already checked in: shows "Already checked in at [TIME]"
- ✓ Invalid QR: shows error, allows retry
- ✓ Check-in updates registration.checked_in_at + status
- ✓ Admin check-in UI shows attendee list, count
- ✓ Mobile responsive (large buttons, readable text)

---

### TASK 12: iCal Export Endpoint

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 4 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- Phase 3 Round 1: "Check-in system... Attendee communication... iCal/Google Calendar subscribe links? No, not Phase 3."
- Phase 3 Round 1 (portal scope): "ICal link — 'Add to calendar' for my registered events"
- Nice-to-have, low effort (Task 5's decision: "iCal export: 3K tokens")

**Description**:
Generate iCal (ICS) file from member's registered events. Attendee clicks "Add to Calendar" → downloads .ics file → imports into Google Calendar, Apple Calendar, etc.

**Context Files**:
- Task 9: my registrations query
- EventDash event model (dates, times, locations)
- `ical-generator` library or custom ICS string builder

**Steps**:

1. **Create API endpoint: GET /api/event/my-registrations.ics**:
   - Auth: JWT required
   - Query: member's registered events
   - Format: iCal (ICS) format
   - Return: Content-Type: text/calendar, filename: "my-events.ics"

2. **Build iCal content**:
   - Use `ical-generator` library (simple) or build manually:
     ```
     BEGIN:VCALENDAR
     VERSION:2.0
     PRODID:-//Shipyard AI//EventDash//EN
     CALSCALE:GREGORIAN
     BEGIN:VEVENT
     UID:{registrationId}@events.shipyard.ai
     DTSTAMP:{now}
     DTSTART:{eventDate}T{eventTime}Z
     DTEND:{eventDate}T{eventEndTime}Z
     SUMMARY:{eventName}
     LOCATION:{venue}
     DESCRIPTION:{eventDescription}
     END:VEVENT
     END:VCALENDAR
     ```
   - Timestamp format: UTC (Z suffix)

3. **UI: Add "Add to Calendar" button on ticket**:
   - Button on /events/portal/registrations/[id]
   - Href: `/api/event/my-registrations.ics`
   - Trigger download (browser downloads .ics file)
   - User imports into calendar app

4. **Test**:
   - Download .ics file
   - Import into Google Calendar: event appears
   - Import into Apple Calendar: event appears
   - Times display correctly in member's local timezone

**Verification Checklist**:
- ✓ Endpoint returns valid iCal format
- ✓ Each event has correct date/time
- ✓ Downloaded file imports into Google Calendar
- ✓ Downloaded file imports into Apple Calendar
- ✓ Times display in member's browser timezone
- ✓ File downloads with correct filename

---

## WAVE 4: Drip Content + Final Polish + Ship (Depends on Wave 3)

### TASK 13: Drip Content Unlock Logic

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 5 hours  
**Token Budget**: 10K  

**Requirement Trace**:
- Phase 3 Round 1: "Drip content: time-released access based on join date"
- Phase 3 Round 2: "Drip timing — UTC server time. Show 'Available on [DATE]' in UI."
- Task 1 dependency: getDripStatus(), canAccessContent() utilities
- Task 2 dependency: member.joinDate field
- Task 6 dependency: block gating render logic

**Description**:
Integrate drip unlock logic into content gating. When rendering gated content, check if drip days have elapsed. If not, show placeholder with "Available on [DATE]" message. Handle UTC midnight boundary correctly.

**Context Files**:
- Task 1: getDripStatus() utility
- Task 2: member.joinDate schema
- Task 6: GatedBlockPlaceholder component

**Steps**:

1. **Update GatedBlockPlaceholder** (from Task 6):
   - If block has dripDays: call getDripStatus(memberJoinDate, dripDays)
   - If drip locked: show "Available on [DATE]" (not time, just date)
   - If drip unlocked: render block normally

2. **Drip check logic** (in canAccessBlock):
   - If rule.type === "drip":
     - Get dripStatus (hasAccess, unlocksOn)
     - If unlocked: proceed to membership check (basic, pro, etc.)
     - If locked: return hasAccess=false, reason="Drip locked until [DATE]"

3. **Content library badge**:
   - Task 5 (ContentLibrary): show "New" badge if drip unlocked < 7 days ago
   - Timestamp: now - 7d < contentUnlockDate < now
   - Color: green or accent color (design decides)

4. **Test drip boundaries**:
   - Member joins on April 1 at 10 AM UTC
   - Drip content: 7 days
   - April 8 00:00 UTC: unlock
   - Test: April 7 23:59 UTC = still locked, April 8 00:01 UTC = unlocked
   - Member in different timezone (LA): still unlocks at April 8 00:00 UTC (they see it April 7 5 PM PT)
   - UI shows: "Available April 8" (no time specified, prevents confusion)

5. **Admin testing**:
   - Admin creates drip rule: "Lock block X for 7 days"
   - Register test member
   - Day 1: block is locked
   - Day 8: block unlocked
   - Verify via admin (or test account)

**Verification Checklist**:
- ✓ Drip locked block shows placeholder with "Available on [DATE]"
- ✓ Drip unlocked block shows content normally
- ✓ UTC midnight boundary: locked until 00:00, unlocked after
- ✓ Cross-timezone: member sees "April 8" regardless of their timezone
- ✓ Content library: "New" badge appears after drip unlock
- ✓ Integration test: member joins, day-by-day content unlocks

---

### TASK 14: Portal Mobile Optimization + Accessibility

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 5 hours  
**Token Budget**: 10K  

**Requirement Trace**:
- Phase 3 Round 1: "Both portals: mobile-first"
- Phase 3 Round 2: "Portals need... mobile responsiveness... accessibility"
- Rick Rubin: "Consistency, not features"

**Description**:
Polish member and attendee portals for mobile and accessibility. Test on 375px (iPhone), ensure keyboard navigation, screen reader support, touch targets (44px buttons), fast load times.

**Context Files**:
- Task 4, 5: MemberShip portal components
- Task 8, 9: EventDash portal components
- Accessibility guidelines (WCAG 2.1 AA)

**Steps**:

1. **Mobile testing**:
   - Test on 375px viewport (typical iPhone)
   - Verify: text readable, buttons tappable (44px+), no overflow
   - Test portrait + landscape
   - Check: loading times < 2s on 4G

2. **Keyboard navigation**:
   - Tab through all interactive elements
   - Verify: visible focus indicator (Tailwind focus:ring)
   - Can activate buttons, links, form inputs via keyboard

3. **Screen reader testing**:
   - Test with NVDA (Windows) or VoiceOver (Mac)
   - Heading hierarchy correct (h1, h2, h3 nested properly)
   - Image alt text present (event photos, logos)
   - Form labels associated with inputs
   - Button text clear ("Read", "Register", "Check in" — not just icons)

4. **Color contrast**:
   - Text on background: WCAG AA (4.5:1) for body text, 3:1 for large text
   - Design tokens (Tailwind) should already pass, verify

5. **Touch targets**:
   - Buttons: 44x44px minimum (Tailwind default `py-2 px-4` is ~40px, OK)
   - Links: underlined or high contrast (current design)
   - Forms: tap-friendly (no tiny inputs)

6. **Responsive images**:
   - Event photos: use srcset, responsive sizes
   - QR code: scale up on mobile, clear background

7. **Performance optimization**:
   - Lazy load images (IntersectionObserver)
   - Defer non-critical JS
   - Cache portal resources (service worker, optional)
   - Target: <2s load on 4G

**Verification Checklist**:
- ✓ Mobile (375px): readable, no overflow, buttons tappable
- ✓ Keyboard: can navigate all elements, focus visible
- ✓ Screen reader: heading hierarchy, alt text, labels correct
- ✓ Color contrast: AA standard met
- ✓ Touch targets: 44px+ buttons
- ✓ Load time: <2s on 4G simulated
- ✓ Images: responsive, lazy loaded

---

### TASK 15: Edge Case Testing + Bug Hunt

**Owner**: Elon Musk  
**Model**: Haiku  
**Duration**: 6 hours  
**Token Budget**: 12K  

**Requirement Trace**:
- Phase 3 Round 2: "Calendar edge cases matter. One off-by-one month, and member sees next month's events this month. Test boundaries."
- Phase 2 learnings: thorough testing prevents support tickets
- Rick Rubin: "Consistency over features"

**Description**:
Systematic testing of edge cases that could cause member-facing bugs. Focus on: timezone boundaries, month navigation, drip unlock timing, concurrent operations, error handling.

**Context Files**:
- All Phase 3 tasks (test each)
- Test data: seed script with varied scenarios

**Steps**:

1. **Calendar edge cases**:
   - Test month navigation: Jan → Dec → Jan (wraparound)
   - Leap year: Feb 29 (if year is leap), March 1 grid alignment
   - DST boundary: event on spring-forward/fall-back date
   - Test with 500 events in one month (pagination kicks in)
   - Test with 0 events (empty calendar)

2. **Drip content boundaries**:
   - Member joins at 10:00 UTC
   - Content drip: 7 days
   - Test: April 7 23:59 UTC (not unlocked), April 8 00:00 UTC (unlocked), April 8 00:01 UTC (unlocked)
   - Test: member in LA timezone sees correct unlock date in UI
   - Test: multiple drip rules stacked (block A: 7 days, block B: 14 days)

3. **Portal edge cases**:
   - Empty state: member with no registrations, no accessible content
   - Large list: member with 200 registrations, page doesn't crash
   - Concurrent: member in 2 browser tabs, checks in from tab 1, tab 2 shows "already checked in"
   - Network error: API call fails, retry button works

4. **Auth edge cases**:
   - JWT expires mid-session: refresh endpoint works, user doesn't get booted
   - Member cancels subscription: portal still loads, shows "Access expired"
   - New member: join date is set correctly
   - Subscription upgrade: accessible content list updates (not cached stale)

5. **Payment edge cases**:
   - QR code from free event: shows confirmation code (not payment intent)
   - QR code from paid event: encodes payment intent, check-in validates intent
   - Double check-in: second attempt shows "Already checked in at [TIME]"

6. **Rendering edge cases**:
   - Block with no gating rule: renders normally
   - Page with 20 gated blocks: only accessible ones render
   - Content library: member with access to 100+ pages, list doesn't stall
   - Calendar: month with events spanning midnight (event ends day 1, starts day 2)

7. **Error handling**:
   - API returns 500: show "Something went wrong. Retry?" button
   - Network timeout: show "Connection lost. Checking..." then retry
   - Database unavailable: graceful fallback (don't crash)

**Verification Checklist**:
- ✓ All calendar edge cases pass (month wrap, leap year, DST, pagination)
- ✓ Drip unlock timing accurate (UTC midnight respected)
- ✓ Portal edge cases handled (empty, large lists, concurrent)
- ✓ Auth refresh works (JWT expiry → refresh → continue)
- ✓ All payment flows tested (paid, free, double check-in)
- ✓ Rendering is correct (gating respected, no stalls)
- ✓ Error handling: API failures show retry, not crash
- ✓ No console errors (clean logs on mobile + desktop)

---

### TASK 16: README Updates + Ship

**Owner**: Steve Jobs  
**Model**: Haiku  
**Duration**: 4 hours  
**Token Budget**: 8K  

**Requirement Trace**:
- Phase 3 ships when documented and merged
- PARITY.md updated with newly completed features

**Description**:
Update README, guides, and feature checklist. Document portal features, gating rules, calendar views, check-in system. Update PARITY.md with Phase 3 completions.

**Context Files**:
- `/home/agent/shipyard-ai/plugins/PARITY.md` (update completed features)
- Plugin README (if exists, or Phase 1 created)
- Test coverage report

**Steps**:

1. **Update README**:
   - Add section: "Member Portal" (link to content library, account)
   - Add section: "Attendee Portal" (my events, tickets, check-in)
   - Add section: "Content Gating" (page-level, block-level, drip content)
   - Add section: "Calendar Views" (month, list, filters)
   - Add subsection: "Setup" (how to enable gating on a page/block)

2. **Update PARITY.md**:
   - Mark completed:
     - [x] Content rules engine (per-page, per-block, drip)
     - [x] Calendar views (month, list)
     - [x] Check-in system (QR codes)
     - [x] Attendee communication (confirmation emails, check-in confirmations)
   - Still missing:
     - [ ] Reporting (attendance, revenue)
     - [ ] CSV export
     - [ ] Waiting list notifications
     - [ ] Category-level rules (Phase 4)
     - [ ] Registration forms (Phase 4)

3. **Write admin guide**:
   - "How to gate a page to Pro members"
   - "How to gate a block to Basic members"
   - "How to enable drip content (7 days after join)"
   - "How to check attendee attendance"

4. **Write user guide**:
   - "Accessing your member portal"
   - "Viewing your event tickets"
   - "Checking in at the door"

5. **Commit + PR**:
   - Branch: `feature/phase3-member-attendee-portals`
   - Commit: "Phase 3: member/attendee portals, content gating, calendar views"
   - PR: describe all features, reference debate + plan
   - Merge: when verified

**Verification Checklist**:
- ✓ README updated (all new features documented)
- ✓ PARITY.md updated (Phase 3 tasks marked complete)
- ✓ Admin guide written (3 how-to scenarios)
- ✓ User guide written (portal navigation)
- ✓ Code comments added (complex logic explained)
- ✓ Commit message clear
- ✓ PR passes CI (build, lint, test)

---

## Success Criteria (Ship Gate)

Phase 3 is ready to ship when:

1. **All Wave 4 tasks pass verification** ✓
2. **Rick Rubin essentials met**:
   - Member feels ownership of access (portal shows "yours", "new" badges)
   - Simplicity at edge (lock/unlock blocks, month/list views, no complex rules)
   - Consistency (portal data fresh from source, drip timing accurate)
3. **Token budget**: 360K tokens, on track
4. **Bug backlog**: zero critical/high severity bugs
5. **QA approval**: Margaret Hamilton sign-off on build + tests
6. **Accessibility**: WCAG 2.1 AA, mobile responsive
7. **Performance**: <2s load on 4G, <1s portal data fetch

---

## Next Phase: Phase 4 Planning

When Phase 3 ships, Phase 4 opens:
- Category-level gating rules
- Registration form builder (custom fields, multi-step)
- Reporting (revenue charts, churn, LTV, attendance analytics)
- Admin rule audit page (visualize all gating rules across site)
- Waiting list notifications (auto-email when spot opens)

---

## Token Budget Breakdown

| Wave | Task | Tokens | Notes |
|------|------|--------|-------|
| 1 | Gating engine | 12K | Core utility |
| 1 | Drizzle schema | 6K | Migration + backfill |
| 1 | Calendar list | 10K | Component + filters |
| 1 | MemberShip portal scaffold | 8K | Routes + auth |
| 2 | Content library | 14K | Query + UI + filters |
| 2 | Block gating render | 12K | Portable Text integration |
| 2 | Month calendar | 16K | Custom grid + modal |
| 2 | EventDash portal scaffold | 8K | Routes + auth |
| 3 | My registrations | 12K | Query + UI |
| 3 | QR ticket | 10K | Generation + display |
| 3 | Check-in API + UI | 12K | Validation + mobile |
| 3 | iCal export | 8K | Endpoint + download |
| 4 | Drip unlock logic | 10K | Integration + test |
| 4 | Mobile + a11y | 10K | Responsiveness + keyboard |
| 4 | Edge case testing | 12K | Boundary conditions |
| 4 | README + ship | 8K | Documentation |
| **Total** | | **360K** | On budget |

---

**Next**: Build begins immediately on Wave 1 (parallel tasks). Wave 1 takes 2-3 days. Phase 3 ships in ~3 weeks.
