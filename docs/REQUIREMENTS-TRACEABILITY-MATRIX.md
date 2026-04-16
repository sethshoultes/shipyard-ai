# Requirements Traceability Matrix: Fix EventDash Violations
## fix-eventdash-violations Project

**Project Priority:** P0 (Hotfix)
**Status:** Requirements Analysis
**Document Created:** 2026-04-16
**Last Updated:** 2026-04-16

---

## 1. EXECUTIVE SUMMARY

### Problem Statement
The EventDash plugin (`plugins/eventdash/src/sandbox-entry.ts`) violates Emdash sandboxed plugin patterns that prevent it from functioning correctly in the Emdash platform environment. These are mechanical pattern violations requiring find-and-replace fixes without business logic changes.

### Scope
- **Primary Target:** `plugins/eventdash/src/sandbox-entry.ts` (~3,442 lines)
- **Scope Boundaries:** Pattern fixes ONLY; no business logic, UI structure, or architecture changes
- **Reference Implementation:** `plugins/membership/src/sandbox-entry.ts` (already fixed with 0 violations)

### Success Criteria
All 5 banned patterns must be eliminated with zero violations post-fix:
- Zero `throw new Response` statements
- Zero `JSON.stringify`/`JSON.parse` in KV operations
- Zero `rc.user` references
- Zero `rc.pathParams` references
- TypeScript compilation without errors

---

## 2. EXTRACTED ATOMIC REQUIREMENTS

### REQ-001: Eliminate `throw new Response` Pattern
**Type:** Pattern Fix - Transport Layer
**Priority:** P0 (95 violations reported in PRD)
**Scope:** Find and replace all `throw new Response(...)` instances

#### Problem Definition
Emdash sandboxed plugins cannot throw Response objects directly. The framework expects proper return values with error objects instead.

#### Acceptance Criteria
- [ ] All `throw new Response(...)` statements are replaced
- [ ] Grep for `throw new Response` returns 0 matches
- [ ] All error paths return `{ error: string, status?: number }` object
- [ ] Business logic for error conditions remains unchanged

#### Before/After Patterns

**PATTERN A: JSON Error Responses → Error Object**
```typescript
// WRONG (banned)
throw new Response(
  JSON.stringify({ error: "Event not found" }),
  { status: 404, headers: { "Content-Type": "application/json" } }
);

// CORRECT - Option 1: Return error object
return { error: "Event not found", status: 404 };

// CORRECT - Option 2: Simple error string (if no status needed)
return { error: "Event not found" };
```

**PATTERN B: Redirect Responses → Return Object**
```typescript
// WRONG
throw new Response(null, { status: 302, headers: { "Location": "/events" } });

// CORRECT
return { navigate: "/events" };
```

**PATTERN C: Success Responses with Status Code**
```typescript
// WRONG
throw new Response(JSON.stringify({ ok: true }), { status: 200 });

// CORRECT
return { ok: true };
```

#### Verification Method
```bash
grep -c "throw new Response" plugins/eventdash/src/sandbox-entry.ts
# Must be 0
```

#### Edge Cases
- Nested `throw new Response` in conditionals
- Multi-line Response constructors
- Responses with custom headers (drop headers, keep status intent)

---

### REQ-002: Remove JSON.stringify from KV.set() Calls
**Type:** Pattern Fix - Serialization Layer
**Priority:** P0 (153 violations reported in PRD)
**Scope:** Find and replace all `kv.set()` calls with unnecessary `JSON.stringify`

#### Problem Definition
Emdash's KV store automatically serializes values to JSON. Manual `JSON.stringify()` causes double-encoding, corrupting data.

#### Acceptance Criteria
- [ ] All `kv.set(..., JSON.stringify(...))` patterns are identified and fixed
- [ ] Values passed to `kv.set()` are plain objects/primitives, never `JSON.stringify()` wrapped
- [ ] Grep for `JSON.stringify.*kv\|kv\.set.*JSON\.stringify` returns 0 matches
- [ ] No data type changes (objects remain objects, not strings)

#### Before/After Pattern
```typescript
// WRONG (double-encodes)
await ctx.kv.set(`event:${id}`, JSON.stringify(event));
// Stores: "{\"id\":\"...\",\"title\":\"...\"}" (string containing JSON)

// CORRECT (platform handles serialization)
await ctx.kv.set(`event:${id}`, event);
// Stores: event object, KV auto-serializes to JSON internally
```

#### Verification Method
```bash
grep -c "JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
# Must be 0
```

#### Data Model Impact
- Objects stored in KV must have proper TypeScript interfaces defined
- Platform automatically handles object-to-JSON conversion
- No application-level serialization needed

---

### REQ-003: Remove JSON.parse from KV.get() Calls
**Type:** Pattern Fix - Deserialization Layer
**Priority:** P0 (153 violations reported in PRD)
**Scope:** Find and replace all `kv.get()` calls with unnecessary `JSON.parse`

#### Problem Definition
When `kv.get()` retrieves values, Emdash automatically deserializes JSON back to objects. Manual `JSON.parse()` causes double-decoding, breaking data integrity.

#### Acceptance Criteria
- [ ] All `const x = JSON.parse(await kv.get(...))` patterns are identified and fixed
- [ ] `kv.get()` result is used directly as typed object (no parsing)
- [ ] Type parameter on `kv.get<T>()` specifies the expected object type
- [ ] Grep for pattern returns 0 matches
- [ ] Null-check pattern becomes `if (!value) return { error: ... }`

#### Before/After Pattern
```typescript
// WRONG (double-decodes)
const json = await ctx.kv.get<string>(`event:${id}`);
const event = JSON.parse(json);
// json is already an object (platform already decoded), JSON.parse fails or breaks it

// CORRECT (platform handles deserialization)
const event = await ctx.kv.get<EventRecord>(`event:${id}`);
if (!event) return { error: "Event not found", status: 404 };
```

#### Verification Method
```bash
grep -c "JSON\.parse" plugins/eventdash/src/sandbox-entry.ts
# Must be 0 (after accounting for legitimate JSON.parse uses in data transformation)
```

#### Type Safety
- Generic type parameter `<EventRecord>` must match the stored object interface
- Platform returns typed object directly, no string intermediary
- TypeScript compiler will catch type mismatches

---

### REQ-004: Remove All `rc.user` Redundant Auth Checks
**Type:** Pattern Fix - Authentication Layer
**Priority:** P0 (16 violations reported in PRD)
**Scope:** Delete all blocks checking `rc.user` permissions

#### Problem Definition
Emdash handles authentication at the framework level BEFORE a sandboxed plugin route handler runs. Plugin-level `rc.user` checks are defensive redundancy that add noise without security value.

#### Acceptance Criteria
- [ ] All `rc.user` permission checks identified
- [ ] Entire auth check blocks are deleted (not modified)
- [ ] Routes that required permission remain route handlers (framework gates them)
- [ ] Grep for `rc\.user` returns 0 matches
- [ ] No business logic is altered, only defensive checks removed

#### Before/After Pattern
```typescript
// WRONG - redundant auth check (framework already verified)
const user = rc.user as Record<string, unknown> | undefined;
if (!user || !user.isAdmin) {
  throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
}

// CORRECT - delete the entire block above
// Framework authentication is enforced at plugin registration level
// Handler runs only if Emdash has already verified permissions
```

#### Authentication Architecture
- Emdash framework validates credentials before route invocation
- Plugin route handlers assume valid context
- Route-level auth attributes (if needed) go in route definition, not handler body
- No application-level permission checks needed for sandboxed routes

#### Verification Method
```bash
grep -c "rc\.user" plugins/eventdash/src/sandbox-entry.ts
# Must be 0
```

#### Security Implications
- Framework-level auth is more secure (centralized, audited, enforced)
- Removing plugin-level checks does NOT reduce security
- Trust the framework's authentication mechanism

---

### REQ-005: Replace `rc.pathParams` with `rc.input`
**Type:** Pattern Fix - Route Parameters Layer
**Priority:** P0 (Scope of violations TBD, noted in decisions as open question)
**Scope:** Replace all `rc.pathParams` references with `rc.input`

#### Problem Definition
`rc.pathParams` doesn't exist in Emdash sandboxed plugins. Route parameters are passed via the `rc.input` object, which contains all request data (body, query, dynamic params).

#### Acceptance Criteria
- [ ] All `rc.pathParams` references identified
- [ ] Replaced with equivalent `rc.input` access patterns
- [ ] Grep for `rc\.pathParams` returns 0 matches
- [ ] Route parameter extraction uses `rc.input` consistently
- [ ] Type casting to `Record<string, unknown>` is replaced with proper object typing

#### Before/After Pattern
```typescript
// WRONG - rc.pathParams doesn't exist
const id = (rc.pathParams as Record<string, string>)?.id;

// CORRECT - use rc.input with proper typing
const input = (rc.input ?? {}) as Record<string, unknown>;
const id = String(input.id ?? "");
```

#### Input Object Structure
```typescript
interface RouteInput {
  // Dynamic route parameters (from URL)
  id?: string;
  slug?: string;

  // Query string parameters
  page?: string;
  limit?: string;

  // Request body fields
  title?: string;
  description?: string;

  // Special fields for admin forms
  type?: string;
  actions?: Array<{ action_id: string; values?: Record<string, string> }>;
}
```

#### Verification Method
```bash
grep -c "rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts
# Must be 0
```

#### Common Patterns
- Single ID extraction: `String(input.id ?? "")`
- Optional param: `input.page ?? "/default"`
- Type assertion: `(rc.input ?? {}) as Record<string, unknown>`

---

## 3. VIOLATION COUNTS & SCOPE

### Reported Violations by Type (from PRD)
| Violation Type | Count | Requirement |
|---|---|---|
| `throw new Response` | 121 | REQ-001 |
| `JSON.stringify` in kv.set | 153 | REQ-002 |
| `JSON.parse` on kv.get | 153 | REQ-003 |
| `rc.user` auth checks | 16 | REQ-004 |
| `rc.pathParams` usage | TBD | REQ-005 |
| **TOTAL** | **443** | **All REQs** |

### Current Status
- **eventdash** plugin: Code review shows fixes already applied
- **membership** plugin: Reference implementation (0 violations)

---

## 4. CORRECT PATTERNS FROM EMDASH GUIDE

### Plugin Context (from Section 6, EMDASH-GUIDE.md)

#### Available in PluginContext
```typescript
interface PluginContext {
  ctx.storage: PluginStorageCollections;      // Plugin's own document collections
  ctx.kv: KeyValueStore;                      // Key-value store for settings/state
  ctx.content: ContentAPI;                    // Read/write site content (capability-gated)
  ctx.media: MediaAPI;                        // Read/write media files (capability-gated)
  ctx.http: HttpClient;                       // HTTP client for external requests
  ctx.log: Logger;                            // Structured logger
  ctx.plugin: PluginMetadata;                 // Plugin ID, version
  ctx.site: SiteInfo;                         // Site name, url, locale
  ctx.users: UserManagement;                  // User APIs (capability-gated)
  ctx.cron: CronScheduler;                    // Task scheduling
  ctx.email: EmailAPI;                        // Email sending (capability-gated)
}
```

#### KV Store - Correct Usage Pattern
```typescript
// Correct: Platform auto-serializes
const event = { id: "123", title: "Birthday", date: "2026-05-01" };
await ctx.kv.set(`event:${event.id}`, event);  // Object goes in, auto-serialized

// Correct: Platform auto-deserializes
const retrieved = await ctx.kv.get<Event>(`event:123`);  // Returns Event object
if (!retrieved) { /* handle missing */ }

// Correct: List keys with prefix
const items = await ctx.kv.list(`event:`);
items.forEach(item => {
  const event = parseEvent(item.value);  // item.value is already object
});
```

#### Route Handler Signature - Correct Pattern
```typescript
routes: {
  getEvent: {
    handler: async (routeCtx: unknown, ctx: PluginContext) => {
      // routeCtx is request context (unused in most handlers)
      // ctx is PluginContext with all APIs

      // Extract route params from rc.input (if passed)
      const input = (routeCtx as any).input as Record<string, unknown>;
      const id = String(input?.id ?? "");

      // Return plain object - framework serializes
      return { event, ok: true };
    }
  }
}
```

#### Error Handling - Correct Pattern
```typescript
// Return error object (framework handles HTTP conversion)
return { error: "Validation failed", status: 400 };

// Or simple success
return { ok: true, data: { /* ... */ } };

// Or redirect (admin UI specific)
return { navigate: "/events" };

// Never:
// - throw new Response(...)
// - return new Response(...)
// - JSON.stringify before KV operations
```

#### Block Kit Forms - Correct Pattern
```typescript
// Incoming form submission:
const actions = input.actions as Array<{ action_id: string; values?: Record<string, string> }>;
if (actions?.[0]?.action_id === "create_event_submit") {
  const values = actions[0].values ?? (input.values as Record<string, string> | undefined);
  const title = values?.title ?? "";

  // Save to KV without JSON.stringify
  await ctx.kv.set(`event:${id}`, { title, date, description, createdAt });

  // Return Block Kit response
  return {
    toast: { type: "success", text: "Created." },
    navigate: "/events"
  };
}
```

---

## 5. VERIFICATION CHECKLIST

### Pre-Implementation
- [ ] Current violation count obtained: 0 (eventdash already fixed)
- [ ] Reference implementation (membership) reviewed: 0 violations confirmed
- [ ] File located: `/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts`
- [ ] TypeScript compiler ready: `npm run build`

### Pattern Elimination Verification
```bash
# REQ-001: throw new Response
grep -c "throw new Response" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0

# REQ-002 & REQ-003: KV Serialization
grep -c "JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0

# REQ-003: KV Deserialization
grep -c "JSON\.parse" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0 (or only legitimate JSON.parse in non-KV contexts)

# REQ-004: Auth redundancy
grep -c "rc\.user" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0

# REQ-005: Route params
grep -c "rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0

# Compound verification (all patterns)
grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
# EXPECTED: 0
```

### Compilation & Type Safety
```bash
# Build TypeScript
npm run build
# EXPECTED: Compilation succeeds with no errors

# Type check
npx tsc --noEmit
# EXPECTED: All types resolve correctly
```

### Functional Validation (if needed)
- [ ] Admin page loads events on first visit
- [ ] Events display without errors
- [ ] Create Event form submits successfully
- [ ] Existing events persist across page reloads
- [ ] Error messages display in human language

---

## 6. SCOPE BOUNDARIES & CONSTRAINTS

### What MUST NOT Change
- ✗ Business logic for event CRUD operations
- ✗ Event data model or KV key schema
- ✗ Block Kit UI structure (header, form fields, navigation)
- ✗ Package names, manifests, or documentation strings
- ✗ Error message semantics (only language tone may improve)

### What MUST Change
- ✓ All `throw new Response` → object returns
- ✓ All `JSON.stringify` in KV calls → removed
- ✓ All `JSON.parse` in KV calls → removed
- ✓ All `rc.user` checks → deleted
- ✓ All `rc.pathParams` → replaced with `rc.input`

### Out of Scope (v2/Future)
- Product rename to "Gather" (separate PR)
- Phase 3: Sunrise Yoga integration (separate PR)
- KV architecture refactor (index by event ID, pagination)
- Broader UI/UX redesign
- Performance optimizations (batch KV, edge caching, denormalized counts)

---

## 7. DECISION LOG EXTRACTS

### Decision 1: Keep Code Structure (vs. Rewrite)
**Resolved:** Fix patterns mechanically, preserve business logic
**Rationale:** The code works logically; it just uses wrong transport patterns. Surgical fixes are safer than rewrites.

### Decision 2: No Product Rename in This PR
**Resolved:** Keep "EventDash" naming; rename in v2
**Rationale:** This is a p0 bug fix for non-functional product. Renaming touches package.json, KV prefixes, docs, Slack manifest — scope creep that delays the fix.

### Decision 3: Human Copy for Success/Error Messages
**Resolved:** Use warm, human language in messages we touch
**Rationale:** Both teams aligned: user-facing strings should be friendly, but we're not redesigning the full Block Kit structure.

### Decision 4: Delete Redundant Auth Checks
**Resolved:** All `rc.user` blocks deleted — framework handles auth
**Rationale:** Emdash authenticates before the handler runs. Plugin-level checks are defensive noise.

### Decision 5: Phase 3 Shipped Separately
**Resolved:** Sunrise Yoga integration is separate PR
**Rationale:** Keeps bug fix pure; integration gets its own review cycle and risk profile.

### Decision 6: Trust Platform Serialization
**Resolved:** Remove manual JSON.stringify/parse — KV auto-serializes
**Rationale:** Platform handles serialization. Manual wrappers double-encode and break data.

---

## 8. RISK REGISTER & MITIGATIONS

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Block Kit form state breaks after pattern replacement | Medium | High | PRD has explicit example code; test form submission flows carefully |
| Missed pattern instance crashes production | Low | High | Grep for all 5 patterns post-fix; automated test coverage |
| Human copy changes introduce tone inconsistency | Low | Low | Stick to PRD examples; one voice, one pass |
| KV data corruption from serialization change | Low | Critical | Platform handles serialization natively — removing manual wrappers should be safe, but test with real data |
| Pattern regression in future code | Medium | Medium | Document patterns in code comments; code review checklist |

---

## 9. REFERENCE IMPLEMENTATION

### Membership Plugin (Correct Pattern Example)
**File:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
**Status:** 0 violations
**Key Patterns:**

1. **KV Storage (Correct)**
   - Store objects directly: `await ctx.storage.entries!.put(entryId, { ... })`
   - Retrieve without parsing: `const result = await ctx.storage.entries!.query(...)`

2. **Route Handlers (Correct)**
   - Extract params: `const input = (routeCtx.input ?? {}) as Record<string, unknown>;`
   - Return objects: `return { entries: [...] };`

3. **No Redundant Auth**
   - Plugin routes don't check `rc.user` — framework gates route access

4. **Error Handling**
   - Return error objects: `return { error: "Message" };`
   - No `throw new Response(...)`

---

## 10. SUCCESS CRITERIA SUMMARY

### Atomic Success (REQ-001 through REQ-005)
| Requirement | Atomic Criteria | Verification |
|---|---|---|
| REQ-001 | Zero `throw new Response` | `grep -c "throw new Response"` = 0 |
| REQ-002 | Zero `JSON.stringify` in KV.set | `grep -c "JSON.stringify.*kv"` = 0 |
| REQ-003 | Zero `JSON.parse` on KV.get | `grep -c "JSON.parse"` = 0 (context-dependent) |
| REQ-004 | Zero `rc.user` checks | `grep -c "rc.user"` = 0 |
| REQ-005 | Zero `rc.pathParams` usage | `grep -c "rc.pathParams"` = 0 |

### System-Level Success
- [ ] TypeScript compiles without errors
- [ ] All grep patterns return 0 matches (compound check)
- [ ] Committed to git with clear message
- [ ] Pushed to remote (if deploying)
- [ ] Admin page loads events on first visit
- [ ] Form submissions succeed with human-language success messages

### Definition of Done
1. All atomic requirements verified with grep
2. Compilation successful
3. Git commit created
4. Code review approved
5. Merged to main branch
6. Deployed to production (if gated by deployment process)

---

## 11. QUESTIONS RESOLVED & OPEN ITEMS

### Resolved Questions
- ✓ What pattern should `throw new Response` use? → Object returns with error property
- ✓ How should KV serialization work? → Platform auto-serializes, remove manual wraps
- ✓ Should `rc.user` checks stay? → No, framework handles auth
- ✓ What's the exact `rc.input` pattern? → `(rc.input ?? {}) as Record<string, unknown>`

### Open Items (Post-Fix)
- How do we verify admin page loads without Sunrise Yoga integration? → Test with mock/existing event data
- Is there a staging environment? → DevOps/Infra to confirm
- Should copy review happen? → Product team (Steve) to review human-language strings

---

## 12. DOCUMENT REVISION HISTORY

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-16 | Requirements Analyst | Initial extraction from PRD, decisions.md, EMDASH-GUIDE.md |

---

## APPENDIX A: REFERENCE FILES

- PRD: `/home/agent/shipyard-ai/prds/fix-eventdash-violations.md`
- Decisions: `/home/agent/shipyard-ai/rounds/eventdash-fix/decisions.md`
- Emdash Guide: `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (Section 6: Plugin System)
- Target File: `/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts`
- Reference: `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`

---

## APPENDIX B: GREP VERIFICATION COMMANDS

```bash
#!/bin/bash
# Complete pattern verification script

echo "=== EventDash Violation Check ==="
FILE="plugins/eventdash/src/sandbox-entry.ts"

echo ""
echo "REQ-001: throw new Response"
grep -c "throw new Response" "$FILE" || echo "0"

echo ""
echo "REQ-002: JSON.stringify in KV"
grep -c "JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" "$FILE" || echo "0"

echo ""
echo "REQ-003: JSON.parse (all)"
grep -c "JSON\.parse" "$FILE" || echo "0"

echo ""
echo "REQ-004: rc.user"
grep -c "rc\.user" "$FILE" || echo "0"

echo ""
echo "REQ-005: rc.pathParams"
grep -c "rc\.pathParams" "$FILE" || echo "0"

echo ""
echo "=== COMPOUND CHECK (All patterns) ==="
grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" "$FILE" || echo "0"

echo ""
echo "Expected result: 0 for all checks"
```

---

**End of Requirements Traceability Matrix**
