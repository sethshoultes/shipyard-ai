# Phase 4: Reporting + Analytics + Advanced Features — Build Plan

**Date**: 2026-04-05  
**Directors**: Elon Musk (Engineering), Steve Jobs (Design)  
**Phase Duration**: 4-5 weeks  
**Token Budget**: 500K tokens (split: 120K features, 380K reserve for QA/buffer)

**North Star**: Give site owners visibility into what's working (reporting). Enable scaling beyond solo creators (groups). Build the ecosystem (webhooks).

---

## Architecture Summary

### Core Principles (from Rick Rubin Essence Check)

1. **Visibility drives decisions** — Reporting shows growth, churn, revenue. Site owners double down on what's working.
2. **Business model unlock** — Groups let creators sell to teams. B2B revenue stream.
3. **Open ecosystem** — Webhooks let developers build on top. Platform becomes part of their workflow.

### Tech Stack

- **Reporting**: Recharts for charts (shared library), Drizzle queries for data aggregation
- **Groups**: Schema extension (group_size, group_members array), invitation via email links
- **Webhooks**: Event emission system (in-memory queue), HTTP POST to registered URLs, DB logging
- **API routes**: `/api/membership/reporting/*`, `/api/event/reporting/*`, `/api/member/groups/*`, `/api/webhooks/register`
- **Frontend**: Clean dashboard tables/charts, group management UI, webhook test endpoint

### Build Phases

```
Wave 1 (Parallel — Independent)        [Days 1-5]
├─ Task 1: MemberShip reporting (revenue + churn)
├─ Task 2: EventDash reporting (events + attendance)
├─ Task 3: Group memberships (schema + invite flow)
└─ Task 4: Developer webhooks (admin UI + emission)

Wave 2 (Parallel — Depends on Wave 1)  [Days 6-12]
├─ Task 5: Registration forms builder
├─ Task 6: Event categories + filtering
├─ Task 7: Venue management
├─ Task 8: Event series (linked recurring)
├─ Task 9: Multi-gateway schema support
└─ Task 10: Embeddable widgets + waitlist

Wave 3 (Parallel — Depends on Wave 2)  [Days 13-18]
├─ Task 11: CSV import/export (members + attendees)
├─ Task 12: PayPal checkout integration
├─ Task 13: Advanced webhooks (retry + signing)
├─ Task 14: Advanced reporting (cohort analysis)
└─ Task 15: Polish + edge case testing
```

---

## WAVE 1: Reporting + Groups + Webhooks (Parallel)

### TASK 1: MemberShip Reporting — Revenue + Churn Dashboard

**Owner**: Elon Musk  
**Model**: Haiku (sub-agents)  
**Duration**: 4 days  
**Token Budget**: 16K  

**Requirement Trace**:
- PARITY.md: "Missing: Reporting (revenue charts, churn rate, LTV, growth, member activity)"
- Phase 4 Round 1: "Revenue chart (last 30 days), MRR, active members, churn rate"
- Phase 4 Round 2: "Full scope. Churn + member table essential."
- Rick Rubin: "Visibility drives decisions. Revenue, MRR, churn, attendee counts. No cache. Always fresh."

**Description**:
Build admin dashboard showing membership revenue, churn, and member status. Includes:
1. Revenue chart (daily bar chart, last 30 days)
2. Metrics: MRR, lifetime revenue, avg revenue per member, churn rate
3. Member status table (active/churned/trial, sortable, searchable)
4. Plan filter (dropdown to filter by membership plan)

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/db/schema.ts` (subscriptions table)
- `/home/agent/shipyard-ai/plugins/membership/src/api/` (API route patterns)
- Phase 4 Round 1, Q2 (reporting scope)
- Phase 3 Plan (portal + dashboard patterns)

**Steps**:

1. **Database queries (API layer)**:
   - `GET /api/membership/reporting/revenue?days=30` → query subscriptions where created_at in last 30 days, group by date, sum price
   - `GET /api/membership/reporting/churn?days=30` → query subscriptions where cancelled_at in last 30 days, compare to total active on day 1
   - `GET /api/membership/reporting/metrics` → total_revenue (all-time), mrr (sum of active subscriptions), active_members (count), churn_rate (%)
   - `GET /api/membership/reporting/members?status=active&plan_id=123&search=email` → list members with status, sortable

2. **Frontend components**:
   - Dashboard page: `/app/admin/membership/reporting`
   - Chart component: `<RevenueChart data={revenueData} />` (using Recharts)
   - Metrics cards: MRR $X, Active members Y, Churn Z%
   - Member table: searchable, sortable by name/email/status/plan
   - Filters: plan dropdown, status selector

3. **Data freshness (critical)**:
   - Queries hit DB directly (no cache)
   - Each page load fetches fresh data from Stripe subscriptions
   - Recurring revenue calculated: active subscriptions where status = "active"
   - Churn rate: (cancellations in period) / (active count at start of period)

4. **Testing**:
   - Mock member data: 50 active, 10 churned in last 30 days
   - Verify revenue chart shows correct daily totals
   - Verify churn rate calculation: (10 / 60) * 100 = 16.67%
   - Verify member table filters work (by plan, status)

5. **Acceptance criteria**:
   - [ ] Revenue chart renders daily bars, last 30 days
   - [ ] MRR metric is accurate (sum of active subscriptions)
   - [ ] Churn rate displayed as percentage, calculated correctly
   - [ ] Member table searchable by email, sortable by status
   - [ ] All data is fresh (not cached, fetched on page load)
   - [ ] Mobile responsive (dashboard readable on phone)
   - [ ] Load time < 2s

**Dependencies**: None (Wave 1, independent)

---

### TASK 2: EventDash Reporting — Event Performance + Attendance Trends

**Owner**: Elon Musk  
**Model**: Haiku (sub-agents)  
**Duration**: 4 days  
**Token Budget**: 14K  

**Requirement Trace**:
- PARITY.md: "Missing: Reporting (attendance, revenue per event, popular times)"
- Phase 4 Round 1: "Event table (name, date, registrations, capacity, revenue), Attendance trends, Popular times"
- Rick Rubin: "Visibility drives decisions. Give organizers data on what works."

**Description**:
Build organizer dashboard showing event performance, attendance metrics, and popularity trends. Includes:
1. Event performance table (all events with registrations, capacity, revenue, sortable)
2. Attendance trends chart (registrations over time, show rate)
3. Popular times insight (which days/times sell best)

**Context Files**:
- `/home/agent/shipyard-ai/plugins/eventdash/src/db/schema.ts` (events, registrations tables)
- `/home/agent/shipyard-ai/plugins/eventdash/src/api/` (API route patterns)
- Phase 4 Round 1, Q2 (reporting scope)

**Steps**:

1. **Database queries (API layer)**:
   - `GET /api/event/reporting/events?days=90` → query all events in last 90 days, include registration count, capacity, revenue
   - `GET /api/event/reporting/attendance?days=30` → query registrations per day (line chart), sum by date
   - `GET /api/event/reporting/popular-times` → group registrations by day-of-week + hour-of-day, find patterns
   - `GET /api/event/[id]/reporting/detail` → single event with attendance metrics, show rate

2. **Frontend components**:
   - Dashboard page: `/app/admin/eventdash/reporting`
   - Event table: name, date, registrations/capacity, revenue (sortable by any column)
   - Attendance chart: line chart showing registrations per day
   - Popular times: "Most registrations happen Thursday 6 PM" (text insight or bar chart)
   - Click event row → detail view with per-registration data

3. **Data freshness**:
   - Query all events + registrations from DB
   - Calculate show rate: (checked_in count) / (registered count)
   - Attendance trends: registrations grouped by date created
   - Popular times: registrations grouped by (event.date.weekday, event.date.hour)

4. **Testing**:
   - Mock data: 10 events, 500 total registrations, 50 checked in
   - Verify event table shows correct totals per event
   - Verify attendance chart shows registration trend
   - Verify popular times identifies peak hours

5. **Acceptance criteria**:
   - [ ] Event table displays all events with correct registration count
   - [ ] Table sortable by date, registrations, revenue
   - [ ] Attendance trend chart shows registration growth over 30 days
   - [ ] Show rate calculated (attended / registered)
   - [ ] Popular times identified correctly (which day/hour has most registrations)
   - [ ] Mobile responsive
   - [ ] Load time < 2s

**Dependencies**: None (Wave 1, independent)

---

### TASK 3: Group Memberships — Schema + Invitation Flow

**Owner**: Elon Musk  
**Model**: Haiku (sub-agents)  
**Duration**: 3 days  
**Token Budget**: 6K  

**Requirement Trace**:
- PARITY.md: "Missing: Group/corporate memberships (org pays for N seats)"
- Phase 4 Round 1, Q3: "Add group_size, group_members to subscriptions. Schema + invite flow + portal UI"
- Phase 4 Round 2: "Groups spec contingent. Elon writes spec before implementation."
- Rick Rubin: "Business model unlock. Simple invite + seat management."

**Description**:
Enable group subscriptions where one organization pays for N seats and manages member access. Includes:
1. Schema: subscriptions get group_size + group_members array
2. Invitation flow: group owner generates invite link, sends to team members
3. Accept flow: invited member clicks link, joins group
4. Seat management: owner can remove members, see seat count
5. Portal: group members see "You're part of [Organization] plan"

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/db/schema.ts` (subscriptions table)
- `/home/agent/shipyard-ai/plugins/membership/src/api/` (API routes)
- Phase 4 Round 2 (group spec requirement)

**Steps**:

1. **Write group spec (Elon, 2 hours)**:
   - Document: "If group owner cancels, group becomes headless. Members lose access."
   - Document: "If member tries to leave, they email owner. No self-removal."
   - Document: "If owner removes member, email: 'You've been removed from [Org] plan'."
   - Document: "If group exceeds seat limit, show warning. Block new additions."
   - **Requirement**: Spec must be <= 2 pages, clear, no edge cases listed without resolution

2. **Schema migration (Drizzle)**:
   - Add to `subscriptions` table:
     ```sql
     group_size: integer (default NULL, null = individual subscription)
     group_members: jsonb array [member_ids] (default empty array)
     is_group_owner: boolean (true if this member is the group owner)
     ```
   - Create index on `group_members` for query efficiency

3. **API endpoints**:
   - `POST /api/member/groups/create` → owner creates group with N seats (creates invite code)
   - `POST /api/member/groups/invite` → owner sends invite link (email + link to accept)
   - `POST /api/member/groups/accept?code=xyz` → invited member accepts, joins group
   - `DELETE /api/member/groups/[member-id]` → owner removes member from group
   - `GET /api/member/groups/my-group` → current member sees their group info

4. **Invitation flow**:
   - Owner generates unique invite code (UUID)
   - Code stored in DB: `group_invites { code, subscription_id, expires_at, created_by_id }`
   - Invite link: `app.shipyard.io/join-group?code=xyz`
   - Code expires after 30 days
   - Clicking link: if authenticated and valid code → join group. If not authenticated → signup flow, then join.

5. **Portal experience**:
   - Group member sees on dashboard: "You're part of [Organization]" badge
   - Group member can see other group members (optional in v1, but nice)
   - Group owner sees: "Group seats: 9/10", list of members with remove button
   - If owner removes member: member sees "You're no longer part of [Org]. Redirected to home."

6. **Testing**:
   - Create group subscription (10 seats)
   - Generate invite link
   - Accept with new member (verify they join group)
   - Remove member (verify they lose access)
   - Try to add 11th member (verify warning/block)

7. **Acceptance criteria**:
   - [ ] Spec written (clear, <= 2 pages)
   - [ ] Schema migration deploys cleanly
   - [ ] Invite code generated, stored, expires correctly
   - [ ] Member accepts invite, joins group, sees group badge
   - [ ] Owner can remove members (member notified via email)
   - [ ] Seat limit enforced (block additions at limit)
   - [ ] Group member portal shows group context

**Dependencies**: None (Wave 1, independent)

---

### TASK 4: Developer Webhooks — Admin UI + Event Emission + Logging

**Owner**: Elon Musk  
**Model**: Haiku (sub-agents)  
**Duration**: 4 days  
**Token Budget**: 8K  

**Requirement Trace**:
- PARITY.md: "Missing: Developer webhooks (member.created, member.cancelled, etc.)"
- Phase 4 Round 1, Q4: "Scope: webhook URL registration, event types, payload + signature, retry in Phase 5"
- Phase 4 Round 2: "Include logging backend. No UI for logs in v1. Add UI in Phase 5."
- Rick Rubin: "Webhooks are connective tissue. Reliable delivery essential. Logging shows success/failure."

**Description**:
Build webhook system for developers to integrate Shipyard data into their tools. Includes:
1. Admin UI to register webhook URLs
2. Test button to verify endpoint
3. Event emission when member/event actions occur
4. Backend logging of all webhook calls
5. 4 core events: member.created, member.cancelled, event.registered, event.checked_in

**Context Files**:
- `/home/agent/shipyard-ai/plugins/membership/src/db/schema.ts` (subscriptions table)
- `/home/agent/shipyard-ai/plugins/eventdash/src/db/schema.ts` (registrations table)
- Phase 4 Round 1 & 2 (webhook scope)

**Steps**:

1. **Schema for webhooks**:
   - Table: `webhooks { id, url, events (array), created_at, last_fired_at, failed_count }`
   - Table: `webhook_logs { id, webhook_id, event_type, payload, response_code, response_body, fired_at }`

2. **Admin UI for registering webhooks**:
   - Page: `/app/admin/webhooks`
   - Form: URL input, event checkboxes (member.created, member.cancelled, event.registered, event.checked_in)
   - Test button: POST to URL with sample payload, show response
   - List: all registered webhooks (url, events, last fired, delete button)

3. **Event emission system**:
   - When member is created: emit `member.created` event with member data
   - When member cancels: emit `member.cancelled` event with member data
   - When attendee registers: emit `event.registered` event with registration + event data
   - When attendee checks in: emit `event.checked_in` event with registration + check-in time

4. **Webhook payload schema** (consistent across events):
   ```json
   {
     "event": "member.created",
     "timestamp": "2026-04-05T10:30:00Z",
     "data": {
       "member_id": "123",
       "email": "user@example.com",
       "plan_id": "basic",
       "created_at": "2026-04-05T10:30:00Z"
     }
   }
   ```

5. **Emission logic**:
   - When event occurs, query registered webhooks filtered by event type
   - For each webhook URL, POST the payload (HTTP/1.1, 30s timeout)
   - Log the call: webhook_id, event_type, payload, response_code, response_body
   - If POST fails (network error, timeout), log it. Don't retry in v1.

6. **Testing**:
   - Register webhook URL (mock endpoint)
   - Trigger member.created event (create new member)
   - Verify webhook POST fires with correct payload
   - Verify webhook_logs table has entry for call
   - Test all 4 event types

7. **Acceptance criteria**:
   - [ ] Admin can register webhook URL + select event types
   - [ ] Test button POSTs sample payload, shows response
   - [ ] member.created emits webhook when new member joins
   - [ ] member.cancelled emits webhook when member cancels
   - [ ] event.registered emits webhook on registration
   - [ ] event.checked_in emits webhook on check-in
   - [ ] webhook_logs table stores all calls (success + failure)
   - [ ] Webhook timeout is reasonable (30s)
   - [ ] Payload schema consistent across all events

**Dependencies**: None (Wave 1, independent)

---

## WAVE 2: Advanced Features (Depends on Wave 1 foundation)

### TASK 5: Registration Forms Builder

**Owner**: Steve Jobs  
**Duration**: 4 days  
**Token Budget**: 12K  

**Scope**:
- Admin form builder: drag-drop fields (text, email, dropdown, checkbox)
- Field validation: required, email format, min/max length
- Form submission: POST to webhook or store in DB
- Frontend: render custom form before registration

**Acceptance criteria**:
- [ ] Admin can create form with 5+ field types
- [ ] Fields have validation rules (required, format)
- [ ] Forms render on registration page
- [ ] Form submissions stored in DB
- [ ] Admin can view submissions

**Dependencies**: TASK 4 (webhook infrastructure helpful but not required)

---

### TASK 6: Event Categories + Filtering

**Owner**: Steve Jobs  
**Duration**: 2 days  
**Token Budget**: 4K  

**Scope**:
- Schema: add categories to events
- Admin: assign category when creating event
- Frontend: category filter (dropdown or buttons) on event list

**Acceptance criteria**:
- [ ] Categories can be created + assigned to events
- [ ] Event list filters by category
- [ ] Multiple categories per event (optional in v1)
- [ ] Category shows on event card

**Dependencies**: TASK 2 (reporting helps, but independent)

---

### TASK 7: Venue Management

**Owner**: Steve Jobs  
**Duration**: 3 days  
**Token Budget**: 6K  

**Scope**:
- Schema: venues (address, city, capacity, map coordinates)
- Admin: CRUD venues, reuse across events
- Event: link to venue on event details
- Frontend: show venue location on event page, optional map preview

**Acceptance criteria**:
- [ ] Admin can create/edit/delete venues
- [ ] Events link to venues
- [ ] Venue address displayed on event card
- [ ] Event list shows venue city (groupable by location)

**Dependencies**: None

---

### TASK 8: Event Series (Linked Recurring Events)

**Owner**: Elon Musk  
**Duration**: 3 days  
**Token Budget**: 6K  

**Scope**:
- Schema: event_series { id, name, branding_color, description }
- Events: link to series (parent_series_id)
- Admin: create series, add events to series
- Frontend: show series name on events in series, link to series landing page

**Acceptance criteria**:
- [ ] Admin can create series + add events to it
- [ ] Series page shows all events in series
- [ ] Events in series show series name + branding
- [ ] Series has reusable description/branding

**Dependencies**: None

---

### TASK 9: Multi-Gateway Schema Support

**Owner**: Elon Musk  
**Duration**: 2 days  
**Token Budget**: 4K  

**Scope**:
- Schema: add payment_method field to subscriptions (stripe, paypal, future)
- Webhook routing: handle Stripe + PayPal webhooks differently
- Checkout UI: Stripe only (for now)
- Admin: can manually mark subscriptions as PayPal-paid

**Acceptance criteria**:
- [ ] Schema stores payment_method per subscription
- [ ] Stripe webhooks route correctly
- [ ] PayPal webhook structure handled (future-proofed)
- [ ] Admin can view which subscriptions are PayPal-paid

**Dependencies**: None

---

### TASK 10: Embeddable Widgets + Waitlist

**Owner**: Steve Jobs  
**Duration**: 4 days  
**Token Budget**: 8K  

**Scope**:
- Widget: upcoming events card (show next 3 events, register button)
- Embed code: site owner copies `<script>` tag, paste on external site
- Widget renders via iframe
- Waitlist: if event is full, allow signup to waitlist
- Notification: when spot opens, email waitlisted person

**Acceptance criteria**:
- [ ] Widget code generates embed script
- [ ] Embedded widget shows events correctly
- [ ] Registration works from embedded widget
- [ ] Waitlist accepts signups when full
- [ ] Email sent when space opens

**Dependencies**: TASK 4 (webhooks helpful for notifications)

---

## WAVE 3: Polish + Integration

### TASK 11: CSV Import/Export

**Owner**: Elon Musk  
**Duration**: 3 days  
**Token Budget**: 8K  

**Scope**:
- Export members: CSV download from admin
- Export attendees: CSV per event
- Import members: bulk upload CSV, validate, import
- Export includes: email, name, status, signup date, plan

**Acceptance criteria**:
- [ ] Admin can export members to CSV
- [ ] Admin can export event attendees to CSV
- [ ] Admin can import members from CSV
- [ ] Import validates email uniqueness, required fields
- [ ] Imported members appear in system

**Dependencies**: None

---

### TASK 12: PayPal Checkout Integration

**Owner**: Elon Musk  
**Duration**: 3 days  
**Token Budget**: 5K  

**Scope**:
- Checkout UI: "Pay with Stripe" or "Pay with PayPal" buttons
- PayPal SDK integration (approve → capture flow)
- Webhook handling: payment.completed → create subscription
- Admin: can toggle PayPal on/off

**Acceptance criteria**:
- [ ] PayPal button visible on checkout
- [ ] PayPal approve flow works
- [ ] Subscription created on payment
- [ ] Webhook marks subscription as paid
- [ ] Can disable PayPal (Stripe only mode)

**Dependencies**: TASK 9 (schema support already in place)

---

### TASK 13: Advanced Webhooks (Retry + Signing)

**Owner**: Elon Musk  
**Duration**: 3 days  
**Token Budget**: 8K  

**Scope**:
- Retry logic: if POST fails, retry up to 3 times (exponential backoff)
- Signing: HMAC-SHA256 signature of payload, site owner can verify
- Rate limiting: max 100 webhooks/second per site
- Status page: show webhook health, last X calls (success/fail)

**Acceptance criteria**:
- [ ] Failed webhooks retry automatically
- [ ] Signature verifiable by receiver
- [ ] Rate limit enforced
- [ ] Admin can see recent webhook calls

**Dependencies**: TASK 4 (builds on basic webhook system)

---

### TASK 14: Advanced Reporting (Cohort Analysis)

**Owner**: Elon Musk  
**Duration**: 3 days  
**Token Budget**: 10K  

**Scope**:
- Cohort table: members grouped by signup month, retention tracked
- LTV analysis: lifetime value by cohort
- Churn prediction: which cohorts churning fastest
- Funnel: signup → first purchase → renewal

**Acceptance criteria**:
- [ ] Cohort table shows retention by month
- [ ] LTV calculated per cohort
- [ ] Churn rate comparable across cohorts
- [ ] Funnel shows dropout rates at each stage

**Dependencies**: TASK 1 (reporting infrastructure)

---

### TASK 15: Edge Case Testing + Polish

**Owner**: Phil Jackson (QA Orchestrator)  
**Duration**: 3 days  
**Token Budget**: 20K  

**Scope**:
- Test all Wave 1 + 2 features end-to-end
- Mobile responsiveness audit
- Performance profiling (load times < 2s)
- Accessibility audit (keyboard nav, screen readers)
- Edge cases: timezone handling, group owner removal, webhook failures
- Documentation: README for developers, webhook payload docs

**Acceptance criteria**:
- [ ] All wave 1 + 2 features tested
- [ ] Mobile responsive (tested on iPhone/Android)
- [ ] Dashboard load times < 2s
- [ ] WCAG AA accessibility
- [ ] Edge case scenarios documented
- [ ] Developer docs complete

**Dependencies**: TASK 1-14

---

## Success Criteria for Phase 4

### North Star: Visibility + Scale + Ecosystem

**After Wave 1:**
- [ ] Site owner logs in, sees revenue dashboard (always fresh)
- [ ] Site owner sees churn rate (knows what's working)
- [ ] Organizer sees event performance (what sells best)
- [ ] Group owner invites 10 teammates (unlocks B2B)
- [ ] Developer registers webhook, sees test succeed
- [ ] New members trigger webhook (automation starts)

**After Wave 2:**
- [ ] Site owner can create custom registration forms
- [ ] Organizer can organize events by category
- [ ] Venue data is reusable across events
- [ ] Event series unifies multi-event programs
- [ ] PayPal available as payment option
- [ ] Embeddable widget works on external sites

**After Wave 3:**
- [ ] Admin can bulk import/export members
- [ ] Webhooks retry automatically on failure
- [ ] Webhook signatures verifiable by receivers
- [ ] Cohort analysis shows retention trends
- [ ] All features tested on mobile
- [ ] Docs complete for developers

### Rick Rubin Final Checkpoint

- Reporting is always fresh (not cached)
- Group invite UX is dead simple
- Webhooks reliable and logged
- Embeddable widgets work without friction
- Everything scales to 10K+ members/events
- No mystery failures (all logged, viewable)

---

## Token Budget Summary

| Wave | Task | Tokens | Owner |
|------|------|--------|-------|
| **1** | MemberShip Reporting | 16K | Elon |
| **1** | EventDash Reporting | 14K | Elon |
| **1** | Group Memberships | 6K | Elon |
| **1** | Developer Webhooks | 8K | Elon |
| **2** | Registration Forms | 12K | Steve |
| **2** | Event Categories | 4K | Steve |
| **2** | Venue Management | 6K | Steve |
| **2** | Event Series | 6K | Elon |
| **2** | Multi-Gateway Schema | 4K | Elon |
| **2** | Embeddable Widgets | 8K | Steve |
| **3** | CSV Import/Export | 8K | Elon |
| **3** | PayPal Checkout | 5K | Elon |
| **3** | Advanced Webhooks | 8K | Elon |
| **3** | Advanced Reporting | 10K | Elon |
| **3** | Edge Case Testing | 20K | Phil |
| | | | |
| **TOTAL FEATURES** | | **120K** | |
| **RESERVE (QA/Buffer)** | | **380K** | |
| **TOTAL BUDGET** | | **500K** | |

---

## Team Assignments

- **Elon Musk**: Engineering Director, owns Wave 1 + Wave 3. Tasks 1-4, 8-9, 11-14.
- **Steve Jobs**: Design Director, owns Wave 2 UX. Tasks 5-7, 10.
- **Phil Jackson**: QA + Orchestration. Task 15 + overall verification.

---

## Deployment Timeline

**Week 1 (Days 1-5)**: Wave 1 parallel
- All 4 tasks build in parallel
- Daily standup (status, blockers)
- Continuous testing as features complete

**Week 2 (Days 6-12)**: Wave 2 parallel
- 7 tasks build in parallel
- Wave 1 finalized + merged to main
- Daily standup

**Week 3 (Days 13-18)**: Wave 3 + Testing
- 5 tasks + comprehensive testing
- Hotfixes as bugs found
- Final documentation

**Week 4 (Days 19+)**: Polish + Ship
- Edge case fixes
- Accessibility audit
- Ship to production

---

## Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Group spec becomes too complex | Write spec before coding. Defer edge cases to Phase 5. |
| Webhook delivery unreliable | Test thoroughly. Log all calls. Phase 5 adds retry logic. |
| Reporting queries are slow | Add DB indexes upfront. Cache TTL on metrics (not data). |
| Registration form builder is overscoped | Scope to 5 field types max. No conditional logic in v1. |
| PayPal integration harder than expected | Already scoped to Wave 3. Stripe-only is fallback. |
| Mobile responsiveness issues | Test early + often. Use responsive framework (Tailwind). |

---

## Next: Build Execution

Once plan is approved, Phil dispatches agents to begin Wave 1 in parallel. Each task has clear inputs, outputs, acceptance criteria, and token budget.

Expected completion: 4 weeks from start.
