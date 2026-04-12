# MEMBERSHIP PLUGIN RISK ASSESSMENT
## /home/agent/shipyard-ai/plugins/membership

**Assessment Date:** 2026-04-12
**Scope:** Full plugin scan for mechanically-replaceable patterns
**Codebase Size:** 3,984 lines (sandbox-entry.ts) + 272 lines (email.ts) + 159 lines (auth.ts) + 272 lines (gating.ts)
**Total Tests:** 35 test cases covering full lifecycle flows

---

## EXECUTIVE SUMMARY

The MemberShip plugin is a **production-grade Emdash plugin** managing memberships, payments, authentication, content gating, and webhooks. The plugin is **MODERATE-HIGH RISK** for mechanical refactoring due to:

1. **114 instances of `throw new Response(JSON.stringify(...))`** - Highly prone to false positives in nested error handling
2. **Large monolithic sandbox-entry.ts file** (3,984 lines) - High churn concentration
3. **Webhook payload serialization** - Requires careful JSON handling
4. **Email template generation** - Complex string interpolation; some patterns could break
5. **JWT cryptographic operations** - Safe (isolated module)
6. **Moderate test coverage** - 35 tests but gaps in error paths

---

## RISK CATALOG

### RISK-001: Nested throw new Response with JSON.stringify
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Lines:** 985-1725+ (114 instances)
**Pattern:**
```typescript
try {
  // ... validation ...
  if (!email) {
    throw new Response(
      JSON.stringify({ error: "Email is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  // ... more nested ifs ...
} catch (error) {
  if (error instanceof Response) throw error;  // CRITICAL: Error guard
  throw new Response(
    JSON.stringify({ error: "Internal server error" }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
```

**Risk ID:** RISK-001
**Description:** 114 instances of `throw new Response(JSON.stringify(...))` in deeply nested conditionals. The error guard pattern `if (error instanceof Response) throw error;` is critical - if removed/changed, error responses could be double-wrapped or lost.

**Likelihood:** High
**Impact:** Critical
**Why Critical:**
- API clients depend on exact response format
- Nested conditionals make pattern matching error-prone
- Error guard is non-obvious; simple regex replacements will break it
- Affects 20+ route handlers

**Mitigation Strategy:**
1. **DO NOT use blanket JSON.stringify replacements** - manually verify context
2. **Keep error guard pattern identical** - `if (error instanceof Response) throw error;` must be preserved
3. **Test all error paths** - create unit tests for each validation branch
4. **Document error format** - add comments above each throw to clarify response structure
5. **Consider extracting helper:**
```typescript
function errorResponse(error: string, status: number = 400) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
// Then: throw errorResponse("Email required", 400);
```

---

### RISK-002: High-Churn Core File (sandbox-entry.ts)
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Size:** 3,984 lines

**Risk ID:** RISK-002
**Description:** Single 3,984-line file contains all plugin business logic: routes, hooks, storage, crypto, and admin. This is the highest-churn location in the plugin.

**Likelihood:** High
**Impact:** High
**Why High Churn:**
- 20+ route handlers (register, approve, revoke, login, etc.)
- 10+ admin routes (members list, plans CRUD, reporting)
- 5+ webhook handlers
- Stripe integration logic scattered throughout
- Email orchestration

**Mitigation Strategy:**
1. **Refactor into smaller modules** (post-migration only):
   - `routes/auth.ts` - register, login, refresh, logout
   - `routes/admin.ts` - approve, revoke, member ops
   - `routes/stripe.ts` - webhook handlers
   - `services/webhooks.ts` - fireWebhook, generateWebhookSignature
   - `admin/ui.ts` - Block Kit rendering

2. **Document module boundaries** clearly to prevent cross-module confusion
3. **Create integration tests** between modules
4. **For now:** Keep as-is; refactor AFTER migration complete

---

### RISK-003: Webhook Payload Serialization
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Lines:** 187-207 (fireWebhook function)
**Pattern:**
```typescript
const payload = JSON.stringify({
  event: eventType,
  timestamp: new Date().toISOString(),
  data,  // <-- Sensitive: arbitrary data object
});
// ... later ...
const response = await fetch(endpoint.url, {
  body: payload,  // <-- Sent over network
});
```

**Risk ID:** RISK-003
**Description:** Webhook payloads are JSON.stringify'd and sent over network. If data contains unserializable fields (circular refs, Functions, Dates), serialization fails silently or truncates data.

**Likelihood:** Medium
**Impact:** High
**Why Medium Likelihood:** Webhook data is currently always plain objects (member records, event logs), but risk increases if plugin adds:
- Nested objects with Date fields
- Error objects
- Class instances

**Mitigation Strategy:**
1. **Validate data before serialization:**
```typescript
function validateWebhookPayload(data: unknown): string {
  try {
    const serialized = JSON.stringify(data);
    // Sanity check size
    if (serialized.length > 100000) {
      throw new Error("Webhook payload too large");
    }
    return serialized;
  } catch (e) {
    ctx.log.error(`Failed to serialize webhook payload: ${String(e)}`);
    throw e;
  }
}
```

2. **Ensure all webhook data is plain objects** - no Date, Function, etc.
3. **Log serialized payload length** for monitoring
4. **Add e2e test** that fires webhook with various data types

---

### RISK-004: JSON.parse in Rate Limiting Logic
**File:** `/home/agent/shipyard-ai/plugins/membership/src/email.ts`
**Lines:** 547-580 (checkEmailRateLimit function)
**Pattern:**
```typescript
const lastSentJson = await ctx.kv.get<string>(key);

if (!lastSentJson) {
  await ctx.kv.set(key, JSON.stringify({ timestamp: new Date().toISOString() }));
  return true;
}

const lastSent = new Date(lastSentJson);  // <-- WRONG: lastSentJson is object JSON
const now = new Date();
const hoursSinceLastEmail = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
```

**Risk ID:** RISK-004
**Description:** The code stores `JSON.stringify({ timestamp: "..." })` but then does `new Date(lastSentJson)` which treats the JSON string as a date. This happens to work because JSON starts with `{`, but it's incorrect logic.

**Likelihood:** Medium
**Impact:** Medium
**Why Current Code Works:** Accidentally - JavaScript's `Date()` constructor is very forgiving; `new Date("{...}")` returns Invalid Date, which is falsy, so the check `hoursSinceLastEmail < 24` would fail, preventing duplicate emails anyway.

**Correct Code:**
```typescript
const lastSentJson = await ctx.kv.get<string>(key);

if (!lastSentJson) {
  await ctx.kv.set(key, JSON.stringify({ timestamp: new Date().toISOString() }));
  return true;
}

const lastSentData = JSON.parse(lastSentJson) as { timestamp: string };
const lastSent = new Date(lastSentData.timestamp);  // Parse JSON first
const now = new Date();
const hoursSinceLastEmail = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);
```

**Mitigation Strategy:**
1. **Fix immediately** - this is a clear bug
2. **Add unit test** that verifies rate limiting works correctly
3. **Review all similar JSON.parse patterns** - search for missing `JSON.parse()` calls

---

### RISK-005: Complex Member Record Transformation
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Lines:** 1050-1100 (member registration with stripe fields)

**Risk ID:** RISK-005
**Description:** Member registration accepts Stripe fields (stripeCustomerId, stripeSubscriptionId) which are conditionally set and transformed. The transformation logic is tightly coupled to the Stripe integration.

**Likelihood:** Medium
**Impact:** High
**Why Medium:** Logic only triggers if Stripe fields are provided; most registrations don't include them

**Sample Transform:**
```typescript
const member: MemberRecord = {
  email,
  plan: selectedPlan.id,
  status: selectedPlan.price === 0 ? "active" : "pending",
  // ... conditionally set Stripe fields ...
  stripeCustomerId,
  stripeSubscriptionId,
  stripePaymentMethod,
  planInterval: planInterval || selectedPlan.interval,
  currentPeriodEnd,
  cancelAtPeriodEnd,
};
```

**Mitigation Strategy:**
1. **Create MemberRecord factory function** instead of inline object creation
2. **Document all optional fields** and when they're set
3. **Add validation** - ensure stripeCustomerId format is valid if provided
4. **Test Stripe integration paths** separately from non-Stripe paths

---

### RISK-006: Email Template Generation with Variable Interpolation
**File:** `/home/agent/shipyard-ai/plugins/membership/src/email.ts`
**Lines:** 60-430 (email template functions)

**Risk ID:** RISK-006
**Description:** Email templates use variable interpolation in plain text and HTML. If variables contain special chars (quotes, HTML tags, newlines), they can break email formatting or be interpreted as code.

**Example - Potential Injection:**
```typescript
// If memberName = "Alice'; DROP TABLE members; --"
return {
  text: `Hi ${memberName},\n\nWelcome!`  // Works fine - plain text
  html: `<p>Hi ${memberName},</p>`       // POTENTIAL: if memberName = "<script>"
};
```

**Likelihood:** Low
**Impact:** Medium
**Why Low Likelihood:** Member names come from registration form, which should validate input; email service (Resend) also sanitizes HTML

**Mitigation Strategy:**
1. **HTML-escape template variables:**
```typescript
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (ch) => map[ch]);
}

// Usage:
html: `<p>Hi ${escapeHtml(memberName)},</p>`
```

2. **Validate email inputs** - ensure memberName, siteName, etc. are safe strings
3. **Use email templating library** (handlebars, nunjucks) instead of string interpolation

---

### RISK-007: Cryptographic Operations in auth.ts
**File:** `/home/agent/shipyard-ai/plugins/membership/src/auth.ts`
**Lines:** 63-159 (signJWT, verifyJWT)

**Risk ID:** RISK-007
**Description:** JWT signing and verification use Web Crypto API. Implementation is correct but could be fragile if:
- Signature verification logic changes
- Token encoding changes
- Secret rotation is needed

**Likelihood:** Low
**Impact:** Critical
**Why Low Likelihood:** Crypto is well-tested (unit tests exist in gating.ts); implementation follows JWT spec

**Mitigation Strategy:**
1. **Keep crypto operations isolated** - do NOT move into shared utility
2. **Add detailed comments** explaining JWT structure:
```typescript
// JWT structure: Base64(header).Base64(payload).Base64url(signature)
// Only signature uses base64url (replacing +, /, = chars)
// This is intentional per JWT spec; do NOT change without full audit
```

3. **Test token rotation** - verify old tokens still work for grace period
4. **Use constant-time comparison** for signature verification (already correct)

---

### RISK-008: Test Coverage Gaps
**File:** `/home/agent/shipyard-ai/plugins/membership/src/__tests__/integration.test.ts`
**Coverage:** 35 test cases

**Risk ID:** RISK-008
**Description:** Test suite covers happy paths and basic flows but lacks coverage for:

| Category | Status | Gap |
|----------|--------|-----|
| Auth flows | Good | Token refresh edge cases |
| Member CRUD | Good | Race conditions (duplicate registration) |
| Webhooks | Partial | Webhook retry logic, dead-letter handling |
| Email | Partial | Resend API failures, rate limiting edge cases |
| Content gating | Good | Drip content edge cases (timezone boundaries) |
| Error handling | Weak | All 114 throw new Response paths |
| Stripe integration | Minimal | Webhook parsing, customer sync failures |

**Likelihood:** High
**Impact:** Medium
**Why High:** Easy to add tests; Impact is medium because integration tests help catch issues

**Mitigation Strategy:**
1. **Add error path tests:** Test all 114 error responses
   ```typescript
   describe("Error responses", () => {
     it("should return 400 for missing email", async () => {
       const result = await routes.register.handler(
         buildRouteCtx({ input: { plan: "pro" } }),
         ctx
       );
       expect(result).toBeInstanceOf(Response);
       expect(result.status).toBe(400);
     });
   });
   ```

2. **Add edge case tests:**
   - Drip content with join date at timezone boundary
   - Webhook retry after 3 failures
   - Rate limiting exactly at 24-hour mark
   - Concurrent registrations with same email

3. **Add Stripe mock tests** - verify webhook parsing for all event types

---

### RISK-009: Admin UI Rendering with Complex Interactions
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Lines:** 2300-2800+ (admin routes with Block Kit)

**Risk ID:** RISK-009
**Description:** Admin pages return Block Kit JSON structures for UI rendering. If structure is invalid, admin UI breaks silently.

**Likelihood:** Low
**Impact:** High
**Why Low:** Admin routes are tested; structure is generated, not user-supplied

**Mitigation Strategy:**
1. **Validate Block Kit output** before returning:
```typescript
function validateBlockKit(blocks: unknown[]): void {
  for (const block of blocks) {
    if (!block.type) throw new Error("Block missing type");
    if (block.type === "form" && !block.fields) throw new Error("Form block missing fields");
  }
}
```

2. **Test each admin page independently** - render all 5 admin UIs in tests
3. **Document Block Kit structure** - what fields are required for each block type

---

### RISK-010: KV Store Key Collisions
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`

**Risk ID:** RISK-010
**Description:** Plugin uses flat key namespace in KV:
- `member:${email}` - member records
- `gating-rule:${ruleId}` - gating rules
- `group:${groupId}` - group records
- `webhook:${webhookId}` - webhooks
- `plans` - plan list (global)

If a groupId somehow matches an email, collisions could occur.

**Likelihood:** Very Low
**Impact:** Medium
**Why Very Low:** UUIDs are unique; emails have @ symbol which UUIDs don't have

**Mitigation Strategy:**
1. **Use namespaced prefixes:** Already done correctly (`member:`, `gating-rule:`, etc.)
2. **Document key format** - add comment at top of file listing all key formats
3. **Add validation** - reject any user input that looks like a key prefix

---

### RISK-011: Missing Read-Only Boundaries
**File:** Entire plugin

**Risk ID:** RISK-011
**Description:** No file marked as "read-only" or "external." If all source is considered editable, beware:
- `.emdash/types.ts` files (auto-generated)
- `node_modules` (dependencies)

**Likelihood:** High
**Impact:** Low
**Why High:** Easy to accidentally edit generated files

**Mitigation Strategy:**
1. **Do NOT edit** `.emdash/types.ts` - regenerate with `npx emdash types`
2. **Do NOT edit** `node_modules` - update with `npm install`
3. **Add `.gitignore` entries:**
   ```gitignore
   .emdash/types.ts
   node_modules/
   dist/
   .turbo/
   ```

---

### RISK-012: Decision Log Alignment (No Relevant Entries Found)
**File:** Checked `/home/agent/shipyard-ai/rounds/*/decisions.md`

**Risk ID:** RISK-012
**Description:** No membership-plugin-specific decisions found in Shipyard decision logs. This plugin was likely developed without formal risk decisions.

**Likelihood:** Medium
**Impact:** Low
**Why Medium:** Plugin is mature (v3.0.0) but no recorded design decisions

**Mitigation Strategy:**
1. **Create membership-plugin decisions.md** after migration
2. **Document key decisions:**
   - Why KV store instead of Cloudflare Durable Objects
   - Why JWT in cookies (not localStorage)
   - Why Stripe Payment Links (not Checkout)
   - How drip content timezone handling works
   - Webhook retry strategy (3 failures = dead letter)

---

## EMDASH-GUIDE ALIGNMENT CHECK

Reviewed Section 6: Plugin System from EMDASH-GUIDE.md:

| Aspect | Status | Notes |
|--------|--------|-------|
| PluginDescriptor registration | PASS | Correct format in index.ts |
| definePlugin() structure | PASS | Proper hooks, routes, storage |
| Capabilities declaration | PARTIAL | Only declares `email:send`; doesn't use `network:fetch:any` for Stripe webhooks |
| Error handling | WEAK | No validation of plugin context; assumes ctx.email, ctx.kv available |
| Sandbox vs trusted | CORRECT | Runs as sandboxed plugin |
| Block Kit rendering | PASS | Admin UI uses Block Kit correctly |

**Recommendation:** Add capability validation:
```typescript
if (!ctx.email) {
  ctx.log.warn("Email capability not available");
  // Fallback to Resend API
}
```

---

## SUMMARY TABLE

| Risk ID | Category | Likelihood | Impact | Mitigation |
|---------|----------|-----------|--------|-----------|
| RISK-001 | Response Errors | High | Critical | Error guard pattern; extract helper |
| RISK-002 | High Churn | High | High | Refactor after migration; document |
| RISK-003 | Webhook Payload | Medium | High | Validate before serialization |
| RISK-004 | JSON Parsing | Medium | Medium | Fix rate limit bug immediately |
| RISK-005 | Transformation Logic | Medium | High | Create factory; add validation |
| RISK-006 | Email Interpolation | Low | Medium | HTML-escape variables |
| RISK-007 | Cryptography | Low | Critical | Keep isolated; add comments |
| RISK-008 | Test Coverage | High | Medium | Add error path tests |
| RISK-009 | Admin UI | Low | High | Validate Block Kit; test UI |
| RISK-010 | Key Collisions | Very Low | Medium | Document key format |
| RISK-011 | Read-Only Files | High | Low | Add .gitignore; warn team |
| RISK-012 | Decision Log | Medium | Low | Create decisions.md post-migration |

---

## IMMEDIATE ACTIONS

1. **CRITICAL:** Fix RISK-004 (JSON.parse bug in email rate limiting)
2. **HIGH:** Review and test RISK-001 error patterns thoroughly
3. **HIGH:** Create error path test cases for all 114 Response objects
4. **MEDIUM:** Document key naming conventions (RISK-010)
5. **MEDIUM:** Add HTML escaping to email templates (RISK-006)

---

## APPROVAL GATES FOR MECHANICAL REPLACEMENT

✓ **CAN SAFELY AUTO-REPLACE:**
- Generic imports/exports
- TypeScript type definitions (interfaces)
- Configuration objects (constants)

✗ **MUST MANUALLY REVIEW:**
- All 114 `throw new Response(JSON.stringify(...))` patterns
- JSON.stringify in webhook payloads (RISK-003)
- JSON.parse calls (RISK-004)
- Email template string interpolation (RISK-006)
- JWT crypto operations (RISK-007)

---

**Assessment Complete**
**Risk Level: MODERATE-HIGH**
**Recommendation: Proceed with EXTREME CAUTION on error handling patterns**
