# Phase 1 Plan — MemberShip Fix

**Generated:** 2026-04-12
**Project Slug:** membership-fix
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 15
**Waves:** 5

---

## The Essence

> **What is this product REALLY about?**
> Giving creators the gift of invisibility — tools that work so well they disappear.

> **What's the feeling it should evoke?**
> Belonging. Not managing. Not configuring. Belonging.

> **What's the one thing that must be perfect?**
> The first 30 seconds.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| REQ-001: Replace throw new Response | phase-1-task-1, phase-1-task-2 | 1 |
| REQ-002: Remove JSON.stringify from kv.set | phase-1-task-3 | 1 |
| REQ-003: Remove JSON.parse from kv.get | phase-1-task-4 | 1 |
| REQ-004: Delete rc.user checks | phase-1-task-5 | 1 |
| REQ-005: Audit auth.ts | phase-1-task-6 | 1 |
| REQ-006: Audit email.ts | phase-1-task-7 | 1 |
| REQ-007: KV pagination schema | phase-1-task-8 | 2 |
| REQ-008: Admin pagination routes | phase-1-task-9 | 2 |
| REQ-009: Chunk size constant | phase-1-task-8 | 2 |
| REQ-010: Human-first error messages | phase-1-task-1, phase-1-task-2 | 1 |
| REQ-013: tsc --noEmit passes | phase-1-task-10 | 3 |
| REQ-014: Typed KV operations | phase-1-task-3, phase-1-task-4 | 1 |
| REQ-017: Register in Sunrise Yoga | phase-1-task-11 | 4 |
| REQ-018-022: Smoke tests | phase-1-task-12, phase-1-task-13, phase-1-task-14, phase-1-task-15 | 5 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Pattern Corrections

All 7 tasks in Wave 1 can run in parallel because they target different code regions or different files.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Fix throw new Response (routes 1-6)</title>
  <requirement>REQ-001, REQ-010: Replace throw new Response with throw new Error using human-first error messages</requirement>
  <description>
    Replace throw new Response patterns in the first half of route handlers (register, status, plans, approve, revoke, webhook).
    Convert JSON.stringify({ error: "..." }) to plain string messages.
    Rewrite error text with warm, human-first tone per Decision 5.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Contains all 114 throw new Response instances" />
    <file path="docs/EMDASH-GUIDE.md" reason="Section 6 shows correct error return patterns" />
    <file path="rounds/membership-fix/decisions.md" reason="Decision 5 specifies error voice" />
  </context>

  <steps>
    <step order="1">Open sandbox-entry.ts and locate routes: register (lines 967-1130), status (1138-1211), plans (1219-1231), approve (1240-1287), revoke (1296-1342), webhook (1351-1455)</step>
    <step order="2">For each throw new Response, replace with: throw new Error("Human-readable message") OR return { error: "message", status: N }</step>
    <step order="3">Remove JSON.stringify wrapper from error payloads</step>
    <step order="4">Rewrite error messages: "Email is required" → "We need your email to continue"; "Invalid email format" → "That email doesn't look right"</step>
    <step order="5">Verify each replacement preserves the intended HTTP status code semantics (4xx for client errors, 5xx for server errors)</step>
  </steps>

  <verification>
    <check type="grep">grep -c "throw new Response" plugins/membership/src/sandbox-entry.ts | verify count decreased</check>
    <check type="manual">Spot-check 5 error messages for human-first tone</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(membership): replace throw new Response in routes 1-6 with human-friendly errors</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Fix throw new Response (routes 7-11+)</title>
  <requirement>REQ-001, REQ-010: Replace throw new Response with throw new Error using human-first error messages</requirement>
  <description>
    Replace throw new Response patterns in remaining route handlers (checkoutCreate, checkoutSuccess, dashboard, dashboardCancel, dashboardUpgrade, couponCreate, and all admin routes).
    Focus on Stripe integration errors and admin panel errors.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Contains remaining ~60 throw new Response instances" />
    <file path="docs/EMDASH-GUIDE.md" reason="Section 6 shows correct error return patterns" />
  </context>

  <steps>
    <step order="1">Locate remaining routes: checkoutCreate (1463-1662), checkoutSuccess (1664-1826), dashboard (1835-1932), dashboardCancel (1941-2026), dashboardUpgrade (2036-2154), couponCreate (2163+), admin routes (2200-3984)</step>
    <step order="2">For each throw new Response, replace with: throw new Error("message") OR return { error: "message", status: N }</step>
    <step order="3">Special handling for Stripe errors: preserve diagnostic info in message but use friendly framing ("We couldn't process your payment" not "Stripe API error")</step>
    <step order="4">Admin route errors can be slightly more technical but still human-readable ("Couldn't find that member" not "Error: Member lookup failed")</step>
    <step order="5">Handle the error re-throw pattern: if (error instanceof Response) throw error; — DELETE these blocks entirely (they're checking for the banned pattern)</step>
  </steps>

  <verification>
    <check type="grep">grep -c "throw new Response" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="grep">grep "instanceof Response" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="manual">Review Stripe error messages for customer-friendliness</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies, runs parallel with task-1 -->
  </dependencies>

  <commit-message>fix(membership): replace remaining throw new Response with human-friendly errors</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Remove JSON.stringify from kv.set calls</title>
  <requirement>REQ-002, REQ-014: Remove JSON.stringify from kv.set; verify typed operations</requirement>
  <description>
    Remove all JSON.stringify() wrapping values passed to ctx.kv.set().
    Emdash KV auto-serializes objects (per docs/EMDASH-GUIDE.md Section 6).
    Pass typed values directly.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Contains ~50 JSON.stringify in kv.set calls" />
    <file path="docs/EMDASH-GUIDE.md" reason="Section 6 confirms KV auto-serializes" />
  </context>

  <steps>
    <step order="1">Search for pattern: ctx.kv.set\(.*,\s*JSON\.stringify\(</step>
    <step order="2">For each match, remove JSON.stringify wrapper: ctx.kv.set(key, JSON.stringify(obj)) → ctx.kv.set(key, obj)</step>
    <step order="3">Update member storage: ctx.kv.set(`member:${email}`, JSON.stringify(member)) → ctx.kv.set(`member:${email}`, member)</step>
    <step order="4">Update webhook storage: ctx.kv.set(`webhook:log:${id}`, JSON.stringify(log)) → ctx.kv.set(`webhook:log:${id}`, log)</step>
    <step order="5">Update lists: ctx.kv.set("members:list", JSON.stringify(list)) → ctx.kv.set("members:list", list)</step>
    <step order="6">Update settings: ctx.kv.set("plans", JSON.stringify(plans)) → ctx.kv.set("plans", plans)</step>
    <step order="7">Do NOT change JSON.stringify used for webhook payloads to external endpoints (fireWebhook function) — that's network serialization, not KV</step>
  </steps>

  <verification>
    <check type="grep">grep "ctx.kv.set.*JSON.stringify" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="manual">Verify fireWebhook still uses JSON.stringify for HTTP payload (line ~187)</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(membership): remove JSON.stringify from KV storage calls</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-4" wave="1">
  <title>Remove JSON.parse from kv.get results</title>
  <requirement>REQ-003, REQ-014: Remove JSON.parse from kv.get; use typed returns</requirement>
  <description>
    Remove all JSON.parse() wrapping results from ctx.kv.get().
    Use typed generic parameters: ctx.kv.get&lt;MemberRecord&gt;(key).
    Delete the parseJSON utility function after all usages removed.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Contains parseJSON utility and ~50 parse calls" />
    <file path="docs/EMDASH-GUIDE.md" reason="Section 6 confirms typed KV returns" />
  </context>

  <steps>
    <step order="1">Locate parseJSON utility function (lines 259-266) — this will be deleted at end</step>
    <step order="2">Find all parseJSON&lt;T&gt;(await ctx.kv.get(...)) patterns</step>
    <step order="3">Replace with: const result = await ctx.kv.get&lt;T&gt;(key); Add null check if needed</step>
    <step order="4">Example: parseJSON&lt;MemberRecord&gt;(memberJson, null) → const member = await ctx.kv.get&lt;MemberRecord&gt;(key); if (!member) ...</step>
    <step order="5">Update getMemberByStripeCustomerId: remove parseJSON, use typed get</step>
    <step order="6">Update all route handlers: status, register, dashboard, etc.</step>
    <step order="7">After all usages removed, delete parseJSON function definition</step>
    <step order="8">Note: Keep JSON.parse for Stripe webhook raw body (line 1389) — that's HTTP parsing, not KV</step>
  </steps>

  <verification>
    <check type="grep">grep "parseJSON" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="grep">grep "JSON.parse.*kv.get" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="manual">Verify Stripe webhook body parsing preserved</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(membership): remove JSON.parse from KV get operations, use typed returns</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="1">
  <title>Delete rc.user auth checks</title>
  <requirement>REQ-004: Delete all 14 rc.user defensive checks</requirement>
  <description>
    Remove all rc.user auth guard blocks from admin routes.
    Emdash handles authentication before handler runs — these checks are redundant.
    Delete entire if-blocks, not just the condition.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Contains 14 rc.user check instances" />
    <file path="rounds/membership-fix/decisions.md" reason="Decision 6: unanimous agreement to delete" />
  </context>

  <steps>
    <step order="1">Search for pattern: rc\.user</step>
    <step order="2">For each match, identify the full guard block structure:
      const adminUser = rc.user as Record&lt;string, unknown&gt; | undefined;
      if (!adminUser || !adminUser.isAdmin) { ... throw/return ... }</step>
    <step order="3">Delete the entire block (variable declaration + if statement + error handling)</step>
    <step order="4">Verify no other code depends on the deleted adminUser variable</step>
    <step order="5">Known locations: lines ~2167, 2267, 2399, 3160, 3237, 3303, 3388, 3455, 3534, 3597, 3737, 3811, 3863, 3904</step>
    <step order="6">After deletion, check for orphaned closing braces or indentation issues</step>
  </steps>

  <verification>
    <check type="grep">grep "rc.user" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="grep">grep "adminUser" plugins/membership/src/sandbox-entry.ts → should be 0</check>
    <check type="grep">grep "isAdmin" plugins/membership/src/sandbox-entry.ts → should be 0</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(membership): remove redundant rc.user auth checks (platform handles auth)</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="1">
  <title>Audit auth.ts for banned patterns</title>
  <requirement>REQ-005: Check auth.ts for banned patterns</requirement>
  <description>
    Review auth.ts for any throw new Response, JSON.stringify in KV, JSON.parse from KV, or rc.user patterns.
    Fix if found. Do NOT restructure the file.
  </description>

  <context>
    <file path="plugins/membership/src/auth.ts" reason="Must audit for banned patterns" />
  </context>

  <steps>
    <step order="1">Read auth.ts completely</step>
    <step order="2">Search for: throw new Response — likely 0 (auth returns null on failure)</step>
    <step order="3">Search for: ctx.kv — likely 0 (auth is stateless JWT)</step>
    <step order="4">Search for: rc.user — likely 0 (auth provides user, doesn't check it)</step>
    <step order="5">If any found, apply same fixes as sandbox-entry.ts</step>
    <step order="6">Document findings: "auth.ts: [X patterns found, Y fixed]" or "auth.ts: clean"</step>
  </steps>

  <verification>
    <check type="grep">grep -c "throw new Response" plugins/membership/src/auth.ts → 0</check>
    <check type="grep">grep -c "rc.user" plugins/membership/src/auth.ts → 0</check>
    <check type="manual">Confirm file reviewed; document any changes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>chore(membership): audit auth.ts for banned patterns (no changes needed)</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="1">
  <title>Audit email.ts for banned patterns</title>
  <requirement>REQ-006: Check email.ts for banned patterns</requirement>
  <description>
    Review email.ts for any throw new Response, JSON.stringify in KV, JSON.parse from KV, or rc.user patterns.
    Fix if found. Do NOT restructure the file.
  </description>

  <context>
    <file path="plugins/membership/src/email.ts" reason="Must audit for banned patterns" />
  </context>

  <steps>
    <step order="1">Read email.ts completely</step>
    <step order="2">Search for: throw new Response — likely 0</step>
    <step order="3">Search for: ctx.kv — may find rate limiting storage</step>
    <step order="4">If ctx.kv uses JSON.stringify/parse, apply fixes</step>
    <step order="5">Search for: rc.user — likely 0</step>
    <step order="6">Document findings</step>
  </steps>

  <verification>
    <check type="grep">grep -c "throw new Response" plugins/membership/src/email.ts → 0</check>
    <check type="grep">grep "ctx.kv.*JSON" plugins/membership/src/email.ts → 0</check>
    <check type="manual">Confirm file reviewed; document any changes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>chore(membership): audit email.ts for banned patterns</commit-message>
</task-plan>
```

---

### Wave 2 (After Wave 1) — KV Pagination

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Implement members:list pagination schema</title>
  <requirement>REQ-007, REQ-009: Chunked pagination with configurable size</requirement>
  <description>
    Split members:list into 100-member chunks.
    Keys: members:list:0, members:list:1, etc.
    Add members:count key for total.
    Define MEMBERS_CHUNK_SIZE constant.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="KV schema changes" />
    <file path="rounds/membership-fix/decisions.md" reason="Decision 4 requires pagination in v1" />
  </context>

  <steps>
    <step order="1">Add constant at file top: const MEMBERS_CHUNK_SIZE = 100;</step>
    <step order="2">Create helper: async function addMemberToList(email: string, ctx: PluginContext)</step>
    <step order="3">In addMemberToList: get current count, calculate chunk index, append to correct chunk, increment count</step>
    <step order="4">Create helper: async function getAllMemberEmails(ctx: PluginContext): Promise&lt;string[]&gt;</step>
    <step order="5">In getAllMemberEmails: get count, calculate chunks needed, fetch all chunks, flatten</step>
    <step order="6">Create helper: async function getMembersPaginated(page: number, ctx: PluginContext)</step>
    <step order="7">Update register route: use addMemberToList instead of direct list manipulation</step>
    <step order="8">Preserve backward compatibility: if members:list exists without :N suffix, migrate on first access</step>
  </steps>

  <verification>
    <check type="grep">grep "MEMBERS_CHUNK_SIZE" plugins/membership/src/sandbox-entry.ts → 1 definition</check>
    <check type="grep">grep "members:list:" plugins/membership/src/sandbox-entry.ts → pagination keys used</check>
    <check type="manual">Verify chunk math: 150 members → chunks 0 and 1</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="KV storage must be fixed before pagination" />
    <depends-on task-id="phase-1-task-4" reason="KV retrieval must be fixed before pagination" />
  </dependencies>

  <commit-message>feat(membership): implement paginated members:list schema (100-member chunks)</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-9" wave="2">
  <title>Update admin routes for pagination</title>
  <requirement>REQ-008: Admin routes use paginated chunks</requirement>
  <description>
    Update admin routes that enumerate members to use pagination helpers.
    Fetch paginated chunks for large lists.
    Add pagination controls to Block Kit UI.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Admin routes need pagination" />
    <file path="docs/EMDASH-GUIDE.md" reason="Block Kit table/pagination patterns" />
  </context>

  <steps>
    <step order="1">Locate admin page_load handler that displays member list</step>
    <step order="2">Replace: ctx.kv.get("members:list") with getMembersPaginated(page, ctx)</step>
    <step order="3">Add page parameter from Block Kit interaction: const page = input.page ?? 0</step>
    <step order="4">Update stats block: use members:count for total, not list.length</step>
    <step order="5">Add pagination actions to Block Kit response:
      { type: "button", text: "Previous", action_id: "members_prev", disabled: page === 0 }
      { type: "button", text: "Next", action_id: "members_next", disabled: noMorePages }</step>
    <step order="6">Handle members_prev/members_next action_ids to change page</step>
  </steps>

  <verification>
    <check type="manual">Admin page loads with 10 members (no pagination needed)</check>
    <check type="manual">Admin page loads with 150 members (pagination controls visible)</check>
    <check type="manual">Previous/Next buttons work correctly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-8" reason="Pagination helpers must exist" />
  </dependencies>

  <commit-message>feat(membership): add pagination to admin member list view</commit-message>
</task-plan>
```

---

### Wave 3 (After Wave 2) — TypeScript Compilation

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Verify TypeScript compilation</title>
  <requirement>REQ-013, REQ-014, REQ-015: tsc --noEmit passes clean</requirement>
  <description>
    Run TypeScript compiler on entire plugin.
    Fix any type errors from pattern changes.
    Verify all KV operations have correct generic types.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Main file to compile" />
    <file path="plugins/membership/src/auth.ts" reason="Must also compile" />
    <file path="plugins/membership/src/email.ts" reason="Must also compile" />
    <file path="plugins/membership/tsconfig.json" reason="Compiler config" />
  </context>

  <steps>
    <step order="1">Run: cd plugins/membership && npx tsc --noEmit</step>
    <step order="2">If errors, categorize: type mismatch, missing property, unreachable code, implicit any</step>
    <step order="3">Fix type mismatches from JSON.parse removal: add explicit type annotations</step>
    <step order="4">Fix null handling: add null checks where ctx.kv.get may return undefined</step>
    <step order="5">Fix dead code from rc.user deletion: remove any orphaned else branches</step>
    <step order="6">Re-run tsc --noEmit until exit code 0</step>
  </steps>

  <verification>
    <check type="build">cd plugins/membership && npx tsc --noEmit → exit code 0</check>
    <check type="grep">grep "// @ts-ignore" plugins/membership/src/*.ts → should be 0 (no suppressions)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Error handling must be fixed" />
    <depends-on task-id="phase-1-task-2" reason="Error handling must be fixed" />
    <depends-on task-id="phase-1-task-3" reason="KV storage must be fixed" />
    <depends-on task-id="phase-1-task-4" reason="KV retrieval must be fixed" />
    <depends-on task-id="phase-1-task-5" reason="Auth checks must be removed" />
    <depends-on task-id="phase-1-task-8" reason="Pagination must be implemented" />
    <depends-on task-id="phase-1-task-9" reason="Admin routes must be updated" />
  </dependencies>

  <commit-message>fix(membership): resolve all TypeScript errors after pattern fixes</commit-message>
</task-plan>
```

---

### Wave 4 (After Wave 3) — Integration

```xml
<task-plan id="phase-1-task-11" wave="4">
  <title>Register plugin in Sunrise Yoga</title>
  <requirement>REQ-017: Add MemberShip plugin to Sunrise Yoga astro.config.mjs</requirement>
  <description>
    Add the MemberShip plugin to Sunrise Yoga's Astro configuration.
    Verify the site builds with the plugin registered.
  </description>

  <context>
    <file path="plugins/membership/src/index.ts" reason="Plugin descriptor export" />
    <file path="docs/EMDASH-GUIDE.md" reason="Section 6 shows plugin registration pattern" />
  </context>

  <steps>
    <step order="1">Locate Sunrise Yoga project directory (likely projects/sunrise-yoga or sites/sunrise-yoga)</step>
    <step order="2">Open astro.config.mjs</step>
    <step order="3">Import plugin descriptor: import membershipPlugin from "@shipyard/membership" or relative path</step>
    <step order="4">Add to emdash plugins array:
      emdash({
        plugins: [membershipPlugin()],
        ...
      })</step>
    <step order="5">Run: npm run build to verify plugin loads</step>
    <step order="6">Check build output for plugin initialization errors</step>
  </steps>

  <verification>
    <check type="build">cd [sunrise-yoga] && npm run build → success</check>
    <check type="grep">grep "membershipPlugin" [sunrise-yoga]/astro.config.mjs → 1 match</check>
    <check type="manual">No "plugin failed to initialize" errors in build log</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-10" reason="Plugin must compile before registration" />
  </dependencies>

  <commit-message>feat(sunrise-yoga): register MemberShip plugin</commit-message>
</task-plan>
```

---

### Wave 5 (After Wave 4) — Smoke Tests

```xml
<task-plan id="phase-1-task-12" wave="5">
  <title>Verify admin page loads</title>
  <requirement>REQ-018, REQ-022: Admin page returns valid Block Kit</requirement>
  <description>
    Start Sunrise Yoga dev server.
    Navigate to admin plugin page.
    Verify HTTP 200 with valid blocks array.
    Check stats show member and plan counts.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Admin route handler" />
  </context>

  <steps>
    <step order="1">Start dev server: cd [sunrise-yoga] && npm run dev</step>
    <step order="2">Navigate to: http://localhost:4321/_emdash/admin/plugins/membership</step>
    <step order="3">Verify page loads without error (HTTP 200)</step>
    <step order="4">Open browser dev tools → Network tab → find plugin API call</step>
    <step order="5">Verify response has "blocks" array</step>
    <step order="6">Verify stats block shows member count and plan count</step>
  </steps>

  <verification>
    <check type="manual">Admin page loads without console errors</check>
    <check type="manual">Stats block visible with counts</check>
    <check type="manual">No "undefined" or "null" displayed in UI</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Plugin must be registered" />
  </dependencies>

  <commit-message>test(membership): verify admin page loads correctly</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-13" wave="5">
  <title>Verify member registration returns typed response</title>
  <requirement>REQ-019, REQ-021: Registration returns object, KV stores object</requirement>
  <description>
    POST to register endpoint.
    Verify response is JavaScript object, not double-encoded string.
    Verify KV stores object directly.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Register route handler" />
  </context>

  <steps>
    <step order="1">Use curl or Postman to POST to register endpoint:
      curl -X POST http://localhost:4321/_emdash/api/plugins/membership/register \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com","plan":"basic"}'</step>
    <step order="2">Verify response Content-Type is application/json</step>
    <step order="3">Verify response body is { success: true, ... } not "{\"success\":true,...}"</step>
    <step order="4">Check KV directly (via admin debug or test): ctx.kv.get("member:test%40example.com")</step>
    <step order="5">Verify KV returns object with email, plan, status properties (not a string)</step>
  </steps>

  <verification>
    <check type="manual">curl response is valid JSON object</check>
    <check type="manual">typeof response.success === "boolean" (not string)</check>
    <check type="manual">KV get returns object directly</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Plugin must be registered" />
  </dependencies>

  <commit-message>test(membership): verify registration returns typed response</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="5">
  <title>Verify member status returns typed object</title>
  <requirement>REQ-020: Status endpoint returns MemberRecord object</requirement>
  <description>
    GET status endpoint with test email.
    Verify response is MemberRecord object.
    Check all expected properties present.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="Status route handler" />
  </context>

  <steps>
    <step order="1">First register a test member (if not already done in task-13)</step>
    <step order="2">GET status endpoint:
      curl http://localhost:4321/_emdash/api/plugins/membership/status?email=test@example.com</step>
    <step order="3">Verify response is JSON object with: email, plan, status, createdAt</step>
    <step order="4">Verify email matches request</step>
    <step order="5">Verify status is one of: pending, active, revoked, cancelled, past_due</step>
  </steps>

  <verification>
    <check type="manual">Response is valid MemberRecord object</check>
    <check type="manual">All required properties present</check>
    <check type="manual">No double-encoding (response.email is string, not escaped JSON)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Must have registered member" />
  </dependencies>

  <commit-message>test(membership): verify status endpoint returns typed MemberRecord</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-15" wave="5">
  <title>Verify signup → payment → access flow</title>
  <requirement>REQ-016: End-to-end flow works without crash</requirement>
  <description>
    Complete full signup flow with Stripe test mode.
    Verify member record created.
    Verify access granted.
    This is the primary success criterion from decisions.md.
  </description>

  <context>
    <file path="plugins/membership/src/sandbox-entry.ts" reason="All routes involved" />
    <file path="rounds/membership-fix/decisions.md" reason="Success Criteria #2" />
  </context>

  <steps>
    <step order="1">Ensure Stripe test mode keys configured in environment</step>
    <step order="2">Register new member with paid plan</step>
    <step order="3">Follow payment link to Stripe Checkout (test mode)</step>
    <step order="4">Complete payment with test card: 4242 4242 4242 4242</step>
    <step order="5">Verify redirect to success page</step>
    <step order="6">Check member status: should be "active"</step>
    <step order="7">Verify Stripe fields populated: stripeCustomerId, stripeSubscriptionId</step>
    <step order="8">Test gated content access (if applicable)</step>
  </steps>

  <verification>
    <check type="manual">Complete flow without any crashes or errors</check>
    <check type="manual">Member status = "active" after payment</check>
    <check type="manual">Stripe webhook received and processed</check>
    <check type="manual">No 500 errors in server logs</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-12" reason="Admin must load first" />
    <depends-on task-id="phase-1-task-13" reason="Registration must work" />
    <depends-on task-id="phase-1-task-14" reason="Status must work" />
  </dependencies>

  <commit-message>test(membership): verify complete signup → payment → access flow</commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **RISK-001: 114 throw new Response instances** — High likelihood of breaking on mechanical replacement. Tasks 1-2 require careful manual review, especially for error re-throw patterns (`if (error instanceof Response) throw error;`).

2. **RISK-002: High-churn 4,000-line file** — Agent context window may bloat. Batch fixes by pattern type (tasks split into 1-2 for errors, 3-4 for JSON, 5 for auth). Verify TypeScript after each batch.

3. **RISK-003: Webhook payload serialization** — JSON.stringify in `fireWebhook` is CORRECT (network serialization, not KV). Task 3 explicitly excludes this.

4. **RISK-004: Email rate limiting JSON** — email.ts may have incorrect JSON handling. Task 7 will audit and fix if needed.

5. **RISK-005: Pagination migration** — Existing members:list must be migrated. Task 8 includes backward compatibility step.

---

## Summary

| Wave | Tasks | Total |
|------|-------|-------|
| Wave 1 (Parallel) | 7 tasks (pattern corrections + audits) | 7 |
| Wave 2 (After 1) | 2 tasks (pagination) | 2 |
| Wave 3 (After 2) | 1 task (TypeScript) | 1 |
| Wave 4 (After 3) | 1 task (integration) | 1 |
| Wave 5 (After 4) | 4 tasks (smoke tests) | 4 |
| **Total** | | **15** |

**Critical Path:** Wave 1 → Wave 2 → Wave 3 → Wave 4 → Wave 5

**Parallelization:** Wave 1 tasks can all run in parallel. Wave 5 tasks can mostly run in parallel.
