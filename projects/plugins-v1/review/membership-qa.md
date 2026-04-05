# MemberShip Plugin v1.0 — QA Review

**Reviewed by**: Margaret Hamilton, QA Director  
**Date**: 2026-04-05  
**Status**: PASS with 4 P1 issues requiring fixes before shipping

---

## Executive Summary

The MemberShip plugin v1.0 is **architecturally sound and matches the debate decisions**, with solid error handling on API routes and proper TypeScript strictness. However, there are **4 critical (P1) issues** that must be fixed before shipping:

1. **Email injection vulnerability in KV keys** — Unsanitized email addresses as KV keys could allow key collision/traversal
2. **Race condition on duplicate registrations** — Two simultaneous registrations with same email can create inconsistent state
3. **Admin action verification missing** — No CSRF protection or membership check in `/admin` route; any authenticated user can approve/revoke
4. **Incomplete MRR calculation** — Revenue widget ignores yearly plans, making the metric inaccurate

The code is otherwise well-structured, with proper input validation, consistent error responses, and accurate README documentation.

---

## Issues Found

### P1: SHIP BLOCKER — Email Injection in KV Keys (Line 223, 387, 441, 583-604)

**Severity**: Critical Security Issue

**Description**: Email addresses are used directly as KV keys without sanitization:
```typescript
// Line 223 (register)
await ctx.kv.set(`member:${email}`, JSON.stringify(member));

// Line 387 (approve)
await ctx.kv.set(`member:${email}`, JSON.stringify(member));

// Line 441 (revoke)
await ctx.kv.set(`member:${email}`, JSON.stringify(member));

// Lines 583-604 (admin actions)
await ctx.kv.set(`member:${email}`, JSON.stringify({...}));
```

**Exploit**: An attacker could register with email `"admin@example.com\nmembership:other"` and potentially:
- Overwrite settings if an unsanitized admin flow uses the email in a key
- Create predictable key collisions in KV enumeration
- Confuse the members:list if newlines are embedded

**Example Attack**:
```
email = "user@example.com\nmembers:list"  // Could poison the enumeration list
```

**Fix**: Encode email to safe KV key format. Use URL encoding or hash:
```typescript
function emailToKvKey(email: string): string {
  return `member:${Buffer.from(email).toString("base64")}`;
}
```

Then update all `member:${email}` to `member:${emailToKvKey(email)}` and the members:list enumeration.

**Files affected**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (lines 223, 387, 441, 568-604)

---

### P1: SHIP BLOCKER — Race Condition on Duplicate Registrations (Lines 172-186)

**Severity**: Critical Consistency Issue

**Description**: The register endpoint checks for existing membership and reads from KV, but between the check and write, another request could create a duplicate:

```typescript
// Line 172-186
const existingKey = await ctx.kv.get<string>(`member:${email}`);
if (existingKey) {
  const existingMember = parseJSON<MemberRecord>(existingKey, null);
  if (existingMember) {
    return { /* return existing */ };
  }
}

// ... later, line 223, potential race window
await ctx.kv.set(`member:${email}`, JSON.stringify(member));
```

**Scenario**:
1. User A calls register with `user@example.com` — check passes (no existing member)
2. User B calls register with same email — check passes (User A hasn't written yet)
3. Both users get created as separate entries; inconsistent state
4. The members:list array gains duplicate entries (lines 229-231)

**Impact**:
- Members list has duplicate emails
- Approval/revoke may target inconsistent data
- MRR calculation counts the same email twice

**Fix**: Implement KV compare-and-set (if available) or add a lock key:
```typescript
const lockKey = `member-lock:${email}`;
if (await ctx.kv.getex(lockKey, { ex: 5 })) {
  // Lock held by another request, retry
  throw new Response(...);
}
await ctx.kv.set(lockKey, "1");
try {
  // perform registration
} finally {
  await ctx.kv.del(lockKey);
}
```

Or use a sequential ID instead of email as primary key.

**Files affected**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (lines 172-232)

---

### P1: SHIP BLOCKER — Missing Admin Authorization Check (Lines 459-763)

**Severity**: Authorization/Access Control Issue

**Description**: The `/admin` route handler processes admin actions (approve, revoke, member actions) **without verifying the user is actually an admin**:

```typescript
// Line 459-763
admin: {
  handler: async (routeCtx: unknown, ctx: PluginContext) => {
    // NO AUTH CHECK HERE
    // accepts any interaction and processes it
    try {
      const rc = routeCtx as Record<string, unknown>;
      const interaction = rc.input as AdminInteraction;
      
      // Line 567: form_submit handler processes actions immediately
      if (interaction.type === "form_submit" && interaction.action === "execute_action") {
        const email = String(interaction.email ?? "").trim().toLowerCase();
        const action = String(interaction.action ?? "");
        
        // DANGEROUS: No verification this user can do this
        if (action === "approve") {
          await ctx.kv.set(`member:${email}`, ...); // Updates immediately
        }
      }
    }
  }
}
```

**Attack**: An authenticated non-admin user could:
1. Inspect the Block Kit admin form via DevTools
2. Submit a direct POST to `/_emdash/api/plugins/membership/admin` with:
   ```json
   {
     "type": "form_submit",
     "action": "execute_action",
     "email": "user@example.com",
     "action": "revoke"
   }
   ```
3. Immediately revoke any user's membership without authorization

**Note**: The route is not marked `public: true`, which suggests EmDash applies auth, but there's no verification the authenticated user is an **admin** (distinct from regular authenticated users).

**Fix**:
```typescript
admin: {
  handler: async (routeCtx: unknown, ctx: PluginContext) => {
    try {
      const rc = routeCtx as Record<string, unknown>;
      
      // ADD THIS:
      if (!ctx.user?.isAdmin) {
        throw new Response(
          JSON.stringify({ error: "Admin access required" }),
          { status: 403, headers: { "Content-Type": "application/json" } }
        );
      }
      
      const interaction = rc.input as AdminInteraction;
      // ... rest of handler
    }
  }
}
```

Verify the `ctx.user` or equivalent auth object provides an `isAdmin` flag. If not, consult EmDash PluginContext API documentation.

**Files affected**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (lines 459-763)

---

### P1: SHIP BLOCKER — Incomplete MRR Calculation (Lines 709-746)

**Severity**: Data Accuracy Issue (Not a security issue, but breaks core feature)

**Description**: The MRR (Monthly Recurring Revenue) widget only counts **month** interval plans:

```typescript
// Line 725-727
if (plan && plan.interval === "month") {
  mrr += plan.price;
}
```

**Problem**: 
- Yearly plans are ignored entirely
- MRR is inaccurate and misleading to the admin
- The widget label says "Monthly Revenue" but the metric is incomplete

**Examples**:
- 3 active Pro ($99/month) users + 1 active Premium ($999/year) user:
  - Actual MRR: $99 × 3 + ($999 / 12) = $297 + $83.25 = **$380.25**
  - Plugin returns: $297 (ignores the yearly subscriber)

**Fix**: Annualize yearly plans in the calculation:
```typescript
if (plan) {
  if (plan.interval === "month") {
    mrr += plan.price;
  } else if (plan.interval === "year") {
    mrr += plan.price / 12; // Annualize yearly plans
  }
  // "once" plans contribute $0 to MRR (one-time purchase)
}
```

**Files affected**:
- `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (lines 715-731)

---

## Issues by Category

### TypeScript & Type Safety ✅ PASS

**Status**: No issues found.

- tsconfig.json has `strict: true`, `noImplicitAny: true`, `noUncheckedIndexedAccess: true`
- All type definitions are explicit (MemberRecord, PlanConfig, AdminInteraction)
- No `any` types used (except necessary `unknown` for routing context)
- Type casting is safe: `as Record<string, unknown>`, `as const` used correctly
- parseJSON utility properly handles `<T>` generics

---

### Input Validation ✅ PASS

**Status**: No issues found in validation logic.

- Email validation using regex (line 41-44) covers basic format checks
- Email is trimmed and lowercased consistently (lines 132, 266, 359, 414, 568)
- Required field checks on email and plan (lines 136-155)
- Plan existence verified against available plans (lines 161-169)
- MemberRecord existence checks before access (lines 173-187, 376-381, 423-437)

**Caveat**: See P1 email injection issue above — validation exists but sanitization for KV keys is missing.

---

### Error Handling ✅ PASS

**Status**: Comprehensive error handling on all public routes.

- register: Lines 129-250 — try/catch with proper Response throws
- status: Lines 262-324 — errors return JSON, fallback to `active: false`
- plans: Lines 335-344 — errors return DEFAULT_PLANS fallback
- approve: Lines 355-399 — validates email, checks member exists, proper error responses
- revoke: Lines 410-453 — same pattern as approve
- admin: Lines 460-763 — errors return error banner blocks

All errors return proper HTTP status codes:
- 400 for bad input
- 404 for missing resources
- 500 for internal errors
- JSON response format is consistent

---

### Security: Email Sanitization ⚠️ P1 ISSUE FOUND

See P1 issue above: Email Injection in KV Keys. Email validation exists but KV key construction is unsafe.

---

### Security: Authentication & Authorization ⚠️ P1 ISSUE FOUND

See P1 issue above: Missing Admin Authorization Check on `/admin` route.

**Other auth checks**: ✅
- register, status, plans endpoints are correctly marked `public: true` (lines 127, 261, 334)
- approve, revoke, admin routes are NOT marked public (implicitly require auth) — correct
- No API keys exposed in code
- No secrets logged

---

### Architecture: Matches Debate Decisions ✅ PASS

**Verified against debate/round-2.md locked decisions**:

1. ✅ **Email-only interaction** — No visitor auth system. Members identified by email (line 8-10, 204-205)
2. ✅ **Stripe Payment Links** — Admin-configured URLs in plan config (line 12, 24, 184, 208)
3. ✅ **No webhook in v1.0** — Manual approval flow (lines 354-399, 567-613)
4. ✅ **KV storage only** — Members stored in `member:{email}` keys, plans in `plans` key (lines 109, 159, 223, 337)
5. ✅ **Portable Text block** — "gated-content" block type defined (lines 770-791), renderer in GatedContent.astro
6. ✅ **Block Kit admin UI** — Members page (lines 466-564), Plans page (lines 627-671), widgets (lines 674-746)
7. ✅ **Error handling on every route** — All 6 routes have try/catch (lines 129, 262, 335, 355, 410, 460)
8. ✅ **No Zod** — Custom `isValidEmail()` and `parseJSON()` utilities used, no dependencies on validation frameworks

---

### API Consistency ✅ PASS

**Status codes**: Proper use across all routes
- 200 implicit for successful responses
- 400 Bad Request for invalid input (lines 139, 144, 153, 363-364, 418-419, 571-577)
- 404 Not Found for missing resources (lines 166, 370, 424)
- 500 Internal Server Error for exceptions (lines 247, 394, 447)

**Response Format**: Consistent JSON objects
- All successful responses return JSON objects (not arrays)
- All error responses wrap in `{ error: "message" }` (lines 138, 144, 153, etc.)
- Admin widget responses follow Block Kit shape (lines 494-562, 631-670, 693-745)

**HTTP Headers**: Properly set
- All manual responses include `"Content-Type": "application/json"` header
- Handler doesn't need to set headers for implicit returns (context handles it)

---

### README Accuracy ✅ PASS

**Status**: Documentation matches implementation.

Checked key sections:

1. **Installation** (lines 20-32) — Matches package.json exports (sandbox, astro, main)
2. **Default Plans** (lines 45-80) — Matches DEFAULT_PLANS array (lines 68-98 in sandbox-entry.ts)
3. **API Examples** (lines 120-195) — All endpoints exist and responses match
4. **Email-only registration** (line 10) — Confirmed in implementation
5. **Stripe Payment Links** (lines 93-112) — Matches manual approval flow (lines 354-399)
6. **Gated Content block** (lines 200-226) — Matches implementation (GatedContent.astro + portableTextBlocks definition)
7. **Member status flow** (lines 490-503) — Matches register logic (lines 190-221)
8. **Prices in cents** (line 82) — Confirmed in MRR calculation (line 740: `mrr / 100`)

**No inaccuracies found**.

---

### Frontend: GatedContent.astro Component ✅ PASS

**Status**: Component logic is sound.

- Reads email from cookie correctly (line 28)
- API call to status endpoint is proper (lines 36-42)
- URL encoding on email param prevents injection (line 38)
- Handles API failures gracefully (lines 52-55) — denies access if check fails
- Plan requirement check correct (lines 59-61)
- Fallback message is customizable and has default (line 63)
- CSS is minimal but adequate (lines 78-95)

**Caveat**: Relies on `membership-email` cookie being set. The plugin does **not** set this cookie anywhere in the code. Either:
1. The site's authentication system sets it, or
2. The site must set it via JavaScript after calling register endpoint

The README does not explain how to set the cookie. This is a **P2 documentation issue** (see below).

---

## Edge Cases

### Duplicate Email Registration ⚠️ P1 ISSUE (See above)

Race condition allows duplicate entries in members:list.

### Expired Membership Checks ✅ PASS

Status endpoint correctly checks expiry (lines 302-308):
```typescript
if (isActive && member.expiresAt && new Date(member.expiresAt) < new Date()) {
  isActive = false;
}
```

Active members widget also checks expiry (lines 686-687). ✅

### Missing Payment Link for Paid Plans ✅ PASS

Register endpoint handles this correctly:
- If plan is paid but has no payment link, status is "pending" (lines 196-201)
- Client receives no paymentLink in response (undefined is omitted from JSON)
- README notes this as a troubleshooting case (lines 538-543)

### Free Plan Registration ✅ PASS

Free plans are immediately active (line 195). ✅

### Member Approval When Already Active ✅ PASS

Approve endpoint will set `status: "active"` even if already active — idempotent. ✅

### Revoke an Already Revoked Member ✅ PASS

Revoke endpoint idempotent — sets status to "revoked" regardless. ✅

### Register with Non-Existent Plan ❌ HANDLED

Plan existence check at line 161-169 returns 404. ✅

---

## P2 Issues (Fix in v1.1)

These do not block shipping but should be addressed soon:

### P2: Cookie-Setting Not Documented

**Location**: README.md + GatedContent.astro

**Issue**: The gated-content block requires `membership-email` cookie to be set, but:
1. The plugin doesn't set this cookie in any code
2. The README doesn't explain how to set it
3. Visitors who don't have the cookie will always see the fallback message

**Impact**: Gated content won't work unless the site also implements a companion script to set the cookie after registration.

**Recommendation**: Add to README:
```markdown
### Setting the Membership Email Cookie

After a user registers (via the register endpoint), your frontend must set the `membership-email` cookie:

\`\`\`javascript
const response = await fetch('/_emdash/api/plugins/membership/register', {
  method: 'POST',
  body: JSON.stringify({ email: 'user@example.com', plan: 'pro' })
});

const { memberId } = await response.json();
document.cookie = `membership-email=${memberId}; path=/; max-age=31536000`; // 1 year
\`\`\`

Without this cookie, the `gated-content` block will show the fallback message.
```

---

### P2: No Pagination on Members Admin Page

**Location**: sandbox-entry.ts lines 471-485

**Issue**: The admin members page loads all members into memory:
```typescript
for (const email of memberEmails) {
  const memberJson = await ctx.kv.get<string>(`member:${email}`);
  // ... builds members array
}
// members array is then rendered in table
```

With 10,000+ members, this could:
- Exceed memory limits
- Make the admin page slow
- Risk timeouts

**Recommendation**: Paginate in v1.1. Load N members at a time with "next page" button.

---

### P2: Missing Widget Error Handling

**Location**: sandbox-entry.ts lines 674-746

**Issue**: The widget handlers (active-members, total-revenue) don't wrap their KV reads in defensive code:

```typescript
// Line 675-676: No try/catch around these loops
const listJson = await ctx.kv.get<string>("members:list");
const memberEmails = parseJSON<string[]>(listJson, []);

for (const email of memberEmails) {
  const memberJson = await ctx.kv.get<string>(`member:${email}`);
  // If KV call fails, widget crashes
}
```

If KV is degraded, the widget fails silently (returns empty stats).

**Recommendation**: Wrap widget logic in try/catch and return a "N/A" or error widget instead.

---

### P2: Plan Price Display Missing Currency

**Location**: sandbox-entry.ts line 660

**Issue**: Plans table displays price without currency symbol or context:
```typescript
price: `$${p.price}`, // p.price is in cents, shows as "$99" but means "$0.99"
```

This is confusing if the admin doesn't remember prices are in cents.

**Recommendation**: Format clearly: `$${(p.price / 100).toFixed(2)}` or add a label "(in cents)" or change the input format.

---

## Summary Table

| Category | Status | Notes |
|----------|--------|-------|
| TypeScript | ✅ PASS | Strict mode, no `any`, safe casting |
| Input Validation | ✅ PASS | Email format, required fields, existence checks |
| **Email Sanitization** | ❌ **P1** | KV keys not safe — email injection risk |
| Error Handling | ✅ PASS | All routes have try/catch, proper status codes |
| **Authorization** | ❌ **P1** | `/admin` route missing admin role check |
| **Race Conditions** | ❌ **P1** | Duplicate registration vulnerability |
| Architecture | ✅ PASS | Matches debate decisions exactly |
| API Consistency | ✅ PASS | Status codes, response formats, headers correct |
| README Accuracy | ✅ PASS | Docs match implementation |
| GatedContent Component | ✅ PASS | Logic is sound (but needs cookie setup docs) |
| MRR Calculation | ❌ **P1** | Yearly plans ignored in revenue widget |
| Edge Cases | ✅ PASS | Expiry, free plans, idempotent actions handled |
| **Documentation** | ⚠️ **P2** | Missing cookie setup instructions |
| **Performance** | ⚠️ **P2** | No pagination on members page; may fail at scale |

---

## Recommendation

### Status: **FIX FIRST**

**Do NOT ship v1.0 until the 4 P1 issues are resolved:**

1. ✅ Email sanitization in KV keys (Encode email to base64 or URL-safe format)
2. ✅ Race condition on duplicate registrations (Implement lock or sequential ID)
3. ✅ Authorization check on `/admin` route (Add `ctx.user.isAdmin` check)
4. ✅ MRR calculation (Annualize yearly plans)

**Estimated fix time**: 2-3 hours of engineering.

**Then re-test**:
- Manual registration with special characters in email (xss@test.com, "a+b"@test.com)
- Concurrent registrations with same email (load test)
- Non-admin user attempting to approve/revoke via direct API call
- Check MRR widget displays correct revenue with mixed monthly/yearly plans

**P2 issues can go into v1.1 backlog** (cookie docs, pagination, widget error handling, price display).

---

## Files Reviewed

1. `/home/agent/shipyard-ai/plugins/membership/src/index.ts` (31 lines) — ✅ No issues
2. `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts` (794 lines) — ❌ 4 P1 issues
3. `/home/agent/shipyard-ai/plugins/membership/src/astro/GatedContent.astro` (97 lines) — ✅ No critical issues (P2 cookie docs)
4. `/home/agent/shipyard-ai/plugins/membership/src/astro/index.ts` (11 lines) — ✅ No issues
5. `/home/agent/shipyard-ai/plugins/membership/README.md` (578 lines) — ✅ Accurate (P2 cookie setup docs)
6. `/home/agent/shipyard-ai/plugins/membership/package.json` (23 lines) — ✅ No issues
7. `/home/agent/shipyard-ai/plugins/membership/tsconfig.json` (20 lines) — ✅ Strict, correct

---

**Margaret Hamilton**  
Quality Assurance Director  
Shipyard AI  
2026-04-05
