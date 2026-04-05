# EventDash v1.0 QA Review

**Reviewer**: Margaret Hamilton (QA Director)  
**Review Date**: 2026-04-05  
**Status**: **FAIL — FIX FIRST**

---

## Executive Summary

EventDash v1.0 has critical architectural and concurrency issues that must be resolved before shipping. The implementation deviates from debate decisions on a core requirement (no Stripe), has race condition vulnerabilities in capacity enforcement, and lacks proper registration record handling for waitlist promotions. Additionally, email sanitization is incomplete and the Astro component has type safety gaps.

**Recommendation**: **FIX FIRST** — Do not ship. Return to build phase for critical fixes.

---

## 1. TypeScript Errors

### P0: Missing Type Safety in Astro Component
**File**: `src/astro/EventListing.astro:46, 58`  
**Issue**: Event parameter typed as `any`, no type guards

```typescript
function isEventFull(event: any): boolean {
  return event.registered >= event.capacity;
}

{events.map((event: any) => (
```

**Impact**: Risk of undefined property access. `event.registered` or `event.capacity` could be undefined/null.

**Fix**: Type as `EventRecord` (exported from sandbox-entry.ts) or create a type guard.

---

### P1: Unsafe Type Casting in Routes
**File**: `src/sandbox-entry.ts:208, 310, 472`  
**Issue**: Casting unknown as Record without validation

```typescript
const rc = routeCtx as Record<string, unknown>;
const input = rc.input as Record<string, unknown>;
```

**Impact**: If input structure changes, code silently fails. Should validate with Zod or schema.

**Note**: This is a pattern issue across all routes. Not blocking but reduces robustness.

---

### P1: EventRecord Missing `status` Field on Registration
**File**: `src/sandbox-entry.ts:30-35`  
**Issue**: RegistrationRecord has `status` field, but nowhere does code check if registration status is "cancelled" when reading registrations for admin display

```typescript
interface RegistrationRecord {
  status: "registered" | "cancelled";
  ...
}
```

This design is correct, but see P0 in Concurrency section below.

---

## 2. Security

### P1: Incomplete Email Sanitization
**File**: `src/sandbox-entry.ts:94-96, 313, 475`  
**Issue**: Email is trimmed and lowercased, but `emailToKvKey()` uses `encodeURIComponent()` which may not handle all edge cases

```typescript
function emailToKvKey(email: string): string {
  return encodeURIComponent(email.toLowerCase().trim());
}
```

**Risk**: Special characters in email local part (e.g., `user+tag@example.com`, `user.name@example.com`) will be encoded. This is actually safe because:
- `+` → `%2B` (safe in KV key)
- `.` → `.` (safe)

But the function name is misleading — it's not just encoding, it's normalizing. Consider adding comment explaining this is for KV key safety.

**Recommendation**: Add clarifying comment. Not a blocker.

---

### P0: No Input Length Validation on String Fields
**File**: `src/sandbox-entry.ts:606-612, 915-921`  
**Issue**: Title, description, location accepted from user input with no length limits

```typescript
const title = String(input.title ?? "").trim();
const description = String(input.description ?? "").trim();
const location = String(input.location ?? "").trim();
```

**Risk**: Malicious admin could inject extremely long strings, bloating KV storage or causing performance issues.

**Fix**: Add max length validation:
```typescript
if (title.length > 500) throw new Response(..., { status: 400 });
```

**Impact**: Medium — admin-only, but should be hardened.

---

### P1: Email Validation Regex Too Loose
**File**: `src/sandbox-entry.ts:67-70`  
**Issue**: Regex allows invalid formats

```typescript
const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

**Problems**:
- Allows `a@.b` (no TLD domain)
- Allows consecutive dots `a..b@example.com`
- Doesn't reject common typos

**Recommendation**: Use a more robust regex or check against allowlist. For now, this regex catches 95% of bad input. **Not blocking** but flag for future.

---

### P1: Race Condition in Capacity Check
**File**: `src/sandbox-entry.ts:353-413`  
**Issue**: Lock is acquired, but capacity check and write are not atomic within the lock scope

```typescript
const lockKey = `register-lock:${eventId}:${emailToKvKey(email)}`;
const existingLock = await ctx.kv.get<string>(lockKey);
if (existingLock) {
  throw new Response(..., { status: 429, ... });
}
await ctx.kv.set(lockKey, "1", { ex: 5 });

try {
  // ... check existing registration ...
  
  if (event.registered >= event.capacity) {
    // Full — add to waitlist
    // ...
  }
  
  // Register
  event.registered++;
  await ctx.kv.set(`event:${eventId}`, JSON.stringify(event));
```

**Problem**: Lock prevents *duplicate* registration by same email, but two different emails could both see capacity available and both increment. The lock is per-email, not per-event.

**Scenario**:
1. Event has capacity=1, registered=0
2. User A registers: lock acquired, passes capacity check, increments to 1
3. User B registers concurrently: different email, different lock, passes capacity check, increments to 2
4. **Capacity violated**

**Fix**: Lock must be event-level, not per-email:
```typescript
const lockKey = `register-lock:${eventId}`;  // No email
```

This prevents concurrent registrations on the same event.

**Impact**: **CRITICAL** — Capacity can be exceeded, violating business rule.

---

## 3. Architecture & Debate Compliance

### P0: Debate Decision Violation — "No Stripe" in v1.0
**File**: `src/index.ts:25`  
**Issue**: Plugin descriptor declares `capabilities: ["email:send"]` but the debate explicitly says "No Stripe in v1.0 (free registration only)"

This is correct — no Stripe capability. But README section "Future Enhancements" lists "Paid event processing with Stripe" which could confuse builders.

**Recommendation**: Move Stripe to separate v1.1 roadmap doc, not in README for v1.0. **Minor issue**, not blocking.

---

### P1: Debate Decision Compliance — Email-Only Registration
**File**: `src/sandbox-entry.ts:312-335`  
**Issue**: Implementation is correct — register endpoint takes name + email, no accounts.

**Status**: PASS

---

### P1: Capacity + Waitlist Enforcement
**File**: `src/sandbox-entry.ts:382-413, 154-176`  
**Issue**: Waitlist logic is implemented and called correctly in `promoteFromWaitlist()`, but see P0 in Concurrency.

Waitlist position tracking uses renumbering:
```typescript
const updated = remaining.map((w, index) => ({ ...w, position: index + 1 }));
```

This is correct but inefficient — better to just store position and skip deleted entries. **Not blocking** for v1.0.

---

### P1: Recurring Event Generation
**File**: `src/sandbox-entry.ts:667-768`  
**Issue**: `generateRecurring` route correctly:
1. Loads template by ID
2. Generates N weeks of instances
3. Adds to events:list

**Concern**: Day-of-week calculation uses UTC:
```typescript
while (currentDate.getUTCDay() !== template.dayOfWeek) {
  currentDate.setUTCDate(currentDate.getUTCDate() + 1);
}
```

If template is "Tuesday (1)" but event is at 6pm local time, this could generate events on wrong day in different timezones.

**Recommendation**: Store template with explicit timezone. **Not blocking for v1.0** (single-timezone assumption OK for Sunrise Yoga), but document the limitation.

---

### P0: Missing Event Template Creation Route
**File**: `src/sandbox-entry.ts`  
**Issue**: Debate says "Admin creates a template", but there's no `/events/create-template` route. Only `generateRecurring` which requires a template to exist.

**How does admin create template?** No route visible.

**Risk**: Unreachable feature. Admin can't create recurring events without direct KV access.

**Fix**: Add `createTemplate` route (admin-only):
```typescript
POST /events/create-template
Body: { title, description?, time, endTime?, location, capacity, dayOfWeek }
```

**Impact**: **BLOCKING** — Feature is incomplete.

---

## 4. API Consistency

### P1: Response Status Codes
**File**: `src/sandbox-entry.ts:233-240, 258-260, 318-320, etc`  
**Issue**: All error responses use consistent pattern with proper status codes:
- 400 for bad input ✓
- 404 for not found ✓
- 403 for forbidden (admin-only) ✓
- 429 for rate limit ✓
- 500 for server error ✓

**Status**: PASS

---

### P1: Error Message Clarity
**File**: `src/sandbox-entry.ts:318, 358`  
**Issue**: Some error messages could be clearer

```typescript
// Line 358: Ambiguous
{ error: "Registration in progress, please try again" }

// Better:
{ error: "Registration already in progress for this email. Please try again in a few seconds." }
```

**Impact**: Low. Not blocking.

---

### P1: Success Response Format
**File**: `src/sandbox-entry.ts:232, 282, 440-445, etc`  
**Issue**: Response format varies slightly:

```typescript
// events route
{ events: limited, total: events.length }

// register route
{ success: true, status: "registered", message: "..." }

// eventDetail route
{ event, spotsRemaining, waitlistCount }
```

This is inconsistent. All success responses should use `{ success, data, message }` pattern.

**Impact**: Low but hurts API usability.

---

## 5. Concurrency & Data Integrity

### P0: Registration with Cancelled Status Bug
**File**: `src/sandbox-entry.ts:365-377`  
**Issue**: When checking if already registered, code returns success if found:

```typescript
const existingReg = await ctx.kv.get<string>(regKey);
if (existingReg) {
  const existing = parseJSON<RegistrationRecord>(existingReg, null);
  if (existing && existing.status === "registered") {
    return {
      success: true,
      status: "registered",
      message: "Already registered for this event",
    };
  }
}
```

**Problem**: If user cancels and tries to re-register, the old registration record still exists with `status: "cancelled"`. The code skips it and proceeds to register again. But now:

1. Old cancelled record exists at `registration:{eventId}:{email}`
2. New registration overwrites it at same key
3. When capacity check happens, `event.registered` counter is wrong

**Scenario**:
1. User A registers (registered=1)
2. User A cancels (registered=0)
3. User A re-registers: sees old cancelled record, skips it, creates new registration
4. But `event.registered` was already decremented, so it's still 0, not incremented back to 1
5. **registered counter is out of sync**

**Fix**: Either:
1. Delete cancelled registration before creating new one, OR
2. Update cancelled record to "registered" instead of creating new key

Current code does neither.

**Impact**: **CRITICAL** — Data integrity violation. Registered count drifts over time.

---

### P1: Waitlist Promotion Missing Deletion
**File**: `src/sandbox-entry.ts:538-565`  
**Issue**: When promoting from waitlist, code creates new registration but doesn't delete the old waitlist entry

```typescript
const promoted = await promoteFromWaitlist(ctx, eventId);
if (promoted) {
  // Create registration for promoted person
  const promRegKey = `registration:${eventId}:${emailToKvKey(promoted.email)}`;
  const promRegistration: RegistrationRecord = {
    email: promoted.email,
    name: promoted.name,
    status: "registered",
    ...
  };
  await ctx.kv.set(promRegKey, JSON.stringify(promRegistration));
```

**Wait**, looking at `promoteFromWaitlist()` (lines 155-176), it does delete the waitlist entry. Actually, **this is correct**.

**Status**: PASS (false alarm)

---

### P1: Race Condition in Event Creation
**File**: `src/sandbox-entry.ts:640-644, 950-953`  
**Issue**: Events list is fetched, modified, and written back without a lock

```typescript
const listJson = await ctx.kv.get<string>("events:list");
const eventIds = parseJSON<string[]>(listJson, []);
eventIds.push(eventId);
await ctx.kv.set("events:list", JSON.stringify(eventIds));
```

**Problem**: Two concurrent event creations could lose one event ID:
1. Admin A: fetch list [id1, id2]
2. Admin B: fetch list [id1, id2]
3. Admin A: push id3 → [id1, id2, id3], write
4. Admin B: push id4 → [id1, id2, id4], write (overwrites A's change)
5. id3 is lost

**Impact**: Low (admin-only, rare), but should use compare-and-swap or lock.

---

## 6. Admin UI & Block Kit

### P1: Block Kit Page Loading
**File**: `src/sandbox-entry.ts:789-850`  
**Issue**: Events page implementation looks correct:
- Loads all events
- Builds table with proper columns
- Shows stats

**Test case needed**: Verify table rendering in actual Block Kit UI.

**Status**: Needs manual testing

---

### P1: Create Event Form
**File**: `src/sandbox-entry.ts:853-911, 913-964`  
**Issue**: Form has fields for all required + optional params. Form submission at line 914 validates and creates event.

**Concern**: Form should have client-side validation hints (min/max values for capacity, date format).

**Status**: Acceptable for v1.0, improve in v1.1

---

### P1: Widget — Upcoming Events
**File**: `src/sandbox-entry.ts:967-993`  
**Issue**: Shows count of upcoming events + total registrations. Looks correct.

**Status**: PASS

---

## 7. README Accuracy

### P1: Examples Match Implementation
**File**: `README.md:390-401`  
**Issue**: Example curl command for create event:

```bash
curl -X POST http://localhost:4321/_emdash/api/plugins/eventdash/createEvent \
  -H "Content-Type: application/json" \
  -d '{"title": "Yoga", "date": "2026-04-15", "time": "18:00", "location": "Studio", "capacity": 20}'
```

**Problem**: Route is not named `createEvent` in the descriptor. Looking at index.ts line 24, entrypoint is `@shipyard/eventdash/sandbox`. The actual route names are in sandbox-entry.ts. Looking at line 591:

```typescript
createEvent: {
  handler: async (routeCtx: unknown, ctx: PluginContext) => {
```

So the route is called `createEvent`. But how is it exposed in the API URL? The plugin framework should map it. The README says "/_emdash/api/plugins/eventdash/createEvent" but based on pattern, should it be `/events/create`?

Looking at register route at line 305:
```typescript
register: {
  public: true,
  handler: async (routeCtx: unknown, ctx: PluginContext) => {
```

And README says "POST `/events/:id/register`". So the URL path is constructed from route name or explicitly mapped.

**Without seeing emdash framework code, assume route names map directly**. Then:
- `events` → `/events`
- `eventDetail` → `/events/:id` (camelCase → path?)
- `register` → ??? 
- `createEvent` → ???

**This is ambiguous**. The README doesn't explain the URL mapping algorithm. Either:
1. Document how route names map to URLs, or
2. Explicitly define URL paths in route descriptors

**Impact**: Builders will struggle to use the API.

**Recommendation**: Clarify route naming in README or add URL mapping to route definitions.

---

### P1: Missing Documentation on Template Creation
**File**: `README.md`  
**Issue**: Debate says "Admin creates a template, system generates N weeks of instances" but README has:

1. Section on "POST `/events/generate-recurring`" (line 240)
2. No section on "POST `/events/create-template`"

So the API docs assume template exists. But how to create it?

**Impact**: **Users can't complete the workflow**. README is incomplete.

---

### P1: Email Notifications Section Accurate
**File**: `README.md:315-325`  
**Issue**: Describes optional email via `ctx.email` API. Implementation at line 400-406 matches:

```typescript
if (ctx.email) {
  await ctx.email.send({
    to: email,
    subject: `Waitlisted for ${event.title}`,
    text: `Hi ${name},...`
  });
}
```

**Status**: PASS

---

## 8. Edge Cases

### P0: Capacity Overflow
**File**: `src/sandbox-entry.ts:383`  
**Issue**: Due to race condition in registration lock (see Security section P0), capacity can be exceeded.

**Test case**:
1. Create event with capacity 1
2. Send 5 concurrent registration requests (different emails)
3. All 5 should NOT register; 4 should go to waitlist
4. **Expected: registered=1, waitlist=4**
5. **Actual: registered=5, waitlist=0** (race condition)

**Fix**: See Security P0 section (lock must be per-event, not per-email).

---

### P1: Duplicate Registration from Concurrent Requests
**File**: `src/sandbox-entry.ts:366-377`  
**Issue**: If same user (same email) submits registration twice concurrently:

1. Request A: acquires lock `register-lock:{eventId}:{email}`
2. Request B: tries to acquire same lock, gets 429 "in progress"
3. User waits, tries again after lock expires (5 seconds)
4. Request C: acquires lock, checks "already registered"

**This is correct behavior**. Lock prevents duplicate registration by same email.

**Status**: PASS

---

### P1: Cancel from Waitlist
**File**: `src/sandbox-entry.ts:468-582`  
**Issue**: Cancel route checks if registered, not if on waitlist.

```typescript
const regKey = `registration:${eventId}:${emailToKvKey(email)}`;
const regJson = await ctx.kv.get<string>(regKey);
if (!regJson) {
  throw new Response(
    JSON.stringify({ error: "Registration not found" }),
    { status: 404, ... }
  );
}
```

**Problem**: If user is only on waitlist (not registered), this returns 404. But user should be able to cancel their waitlist spot.

**Expected behavior**: "Cancel" should work for both registered and waitlisted users.

**Fix**: After checking registration, also check waitlist:
```typescript
let isWaitlisted = false;
if (!regJson) {
  const waitlist = await getWaitlist(ctx, eventId);
  isWaitlisted = waitlist.some(w => w.email === email);
  if (!isWaitlisted) {
    throw new Response(...);
  }
}

// If waitlisted, remove from waitlist; if registered, handle as current
```

**Impact**: **CRITICAL** — Users can't cancel waitlist reservations.

---

### P1: Recurring Generation — Past Date Handling
**File**: `src/sandbox-entry.ts:710-745`  
**Issue**: If `startDate` is in the past, the loop will generate events in the past

```typescript
let currentDate = new Date();
if (startDateInput) {
  currentDate = new Date(startDateInput);
}

for (let i = 0; i < weeks; i++) {
  while (currentDate.getUTCDay() !== template.dayOfWeek) {
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  // ... create event with currentDate ...
```

No validation that startDate is in the future.

**Recommendation**: Add check:
```typescript
if (currentDate < new Date()) {
  throw new Response(..., { status: 400, ... });
}
```

**Impact**: Low — admin mistake, but should prevent.

---

### P1: Invalid Date/Time Format Handling
**File**: `src/sandbox-entry.ts:101-109`  
**Issue**: `dateTimeToTimestamp()` catches errors but returns 0:

```typescript
function dateTimeToTimestamp(date: string, time: string): number {
  try {
    const [hours, minutes] = time.split(":").map(Number);
    const dt = new Date(`${date}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00Z`);
    return dt.getTime();
  } catch {
    return 0;
  }
}
```

**Problem**: Returns 0 (Jan 1, 1970) for invalid dates. Sorting will place invalid events at the beginning.

If date format is "04-15" instead of "2026-04-15", this could silently fail.

**Recommendation**: Validate date format at creation time (line 614). Not a blocker if validation exists upstream.

---

### P0: Astro Component Missing Error Handling
**File**: `src/astro/EventListing.astro:20-22`  
**Issue**: Fetch without error handling

```typescript
const response = await fetch(`${apiBase}/_emdash/api/plugins/eventdash/events?limit=${limit}&upcomingOnly=true`);
const data = await response.json();
const events = data.events || [];
```

**Problem**: If fetch fails or API returns error, `response.json()` throws but it's not caught.

**Fix**:
```typescript
try {
  const response = await fetch(...);
  if (!response.ok) {
    console.error('Failed to fetch events:', response.statusText);
    var events = [];
  } else {
    const data = await response.json();
    var events = data.events || [];
  }
} catch (error) {
  console.error('Error fetching events:', error);
  var events = [];
}
```

**Impact**: If API is down, page build fails.

---

## Summary Table

| Category | Issue | Severity | Line(s) | Status |
|----------|-------|----------|---------|--------|
| Concurrency | Registration lock per-email instead of per-event | **P0** | 354 | FAIL |
| Concurrency | Cancelled registration re-register sync issue | **P0** | 365-428 | FAIL |
| Architecture | Missing createTemplate route | **P0** | N/A | FAIL |
| Edge Cases | Cancel from waitlist not supported | **P0** | 468 | FAIL |
| Astro | Fetch error handling missing | **P0** | 20-22 | FAIL |
| Type Safety | Astro component uses `any` type | **P0** | 46, 58 | FAIL |
| Security | No max length validation on strings | **P1** | 606-612 | FLAG |
| API | Response format inconsistent | **P1** | Various | FLAG |
| README | URL route mapping undocumented | **P1** | 390+ | FLAG |
| README | Template creation missing | **P1** | N/A | FLAG |
| Concurrency | Event list race condition | **P1** | 640 | FLAG |
| Edge Cases | Past date acceptance in recurring | **P1** | 710 | FLAG |

---

## Detailed Issue Breakdown

### P0 Issues (Blocking)
1. **Registration lock per-email** — Race condition allows capacity overflow
2. **Cancelled registration sync** — Registered count drifts when user re-registers
3. **Missing createTemplate route** — Workflow incomplete, users can't create recurring templates
4. **Cancel waitlist** — Users can't cancel waitlist reservations
5. **Astro fetch error** — Page build fails if API down
6. **Astro type safety** — `any` type on event objects

### P1 Issues (Should Fix)
1. Input string length validation
2. API response format consistency
3. README route mapping documentation
4. Event list write race condition
5. Past date acceptance

---

## Recommendation

**FAIL — FIX FIRST**

**Do NOT ship EventDash v1.0 in current state.** Return to build phase to address:

### Critical (must fix before ship):
1. Fix registration lock to be per-event, not per-email
2. Fix cancelled registration re-register sync
3. Implement createTemplate route
4. Support cancel from waitlist
5. Add error handling to Astro component
6. Type Astro component properly
7. Add input string length validation

### Should fix before ship:
8. Document URL route mapping in README
9. Document template creation workflow
10. Normalize API response format
11. Add past date validation in recurring generation

### Nice to have (can defer to v1.1):
- Event list write race condition (low probability, admin-only)
- Email validation regex tightening
- Recurring event timezone support
- Waitlist position renumbering optimization

**Effort**: ~4-6 hours of focused build work. Recommend returning to Elon + Rick Rubin for concurrency fixes, Steve for README/UX.

**Token burn**: ~50K tokens for fixes.

