---
hotfix: true
---
# PRD: Fix EventDash 95 Banned Pattern Violations

> Priority: p0
> hotfix: true

## Problem

`plugins/eventdash/src/sandbox-entry.ts` (3,442 lines) has 95 banned pattern violations that prevent it from working correctly in the Emdash sandboxed plugin environment.

Check current count:
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/eventdash/src/sandbox-entry.ts
```

## CRITICAL: Do NOT Rewrite

Fix the patterns. Keep all business logic exactly as-is. These are mechanical find-and-replace fixes.

## Fixes Required

### 1. Replace all `throw new Response` (majority of violations)

```typescript
// WRONG (banned)
throw new Response(
  JSON.stringify({ error: "Event not found" }),
  { status: 404, headers: { "Content-Type": "application/json" } }
);

// CORRECT option A
throw new Error("Event not found");

// CORRECT option B
return { error: "Event not found", status: 404 };
```

### 2. Remove all `JSON.stringify` from `kv.set()` calls

```typescript
// WRONG (double-encodes)
await ctx.kv.set(`event:${id}`, JSON.stringify(event));

// CORRECT (kv auto-serializes)
await ctx.kv.set(`event:${id}`, event);
```

### 3. Remove all `JSON.parse` from `kv.get()` results

```typescript
// WRONG (double-decodes)
const json = await ctx.kv.get<string>(`event:${id}`);
const event = JSON.parse(json);

// CORRECT (kv auto-deserializes)
const event = await ctx.kv.get<EventRecord>(`event:${id}`);
if (!event) return { error: "Event not found", status: 404 };
```

### 4. Remove all `rc.user` checks

```typescript
// WRONG (rc.user doesn't exist — Emdash handles auth)
const user = rc.user as Record<string, unknown> | undefined;
if (!user || !user.isAdmin) {
  throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403 });
}

// CORRECT — delete the entire block. Emdash handles auth before handler runs.
```

### 5. Remove all `rc.pathParams` usage

```typescript
// WRONG
const id = (rc.pathParams as Record<string, string>)?.id;

// CORRECT — use rc.input or route-specific params
const input = (rc.input ?? {}) as Record<string, unknown>;
const id = String(input.id ?? "");
```

## Verification

After all fixes:
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams\|JSON\.stringify.*kv\|kv\.set.*JSON\.stringify" plugins/eventdash/src/sandbox-entry.ts
# Must be 0
```

## Reference

The membership plugin at `plugins/membership/src/sandbox-entry.ts` (3,640 lines) has already been fixed with 0 violations. Use it as a reference for correct patterns.

## Files to Modify

- `plugins/eventdash/src/sandbox-entry.ts` — all pattern fixes

## Success Criteria

- [ ] Zero `throw new Response` in eventdash sandbox-entry.ts
- [ ] Zero `JSON.stringify`/`JSON.parse` in KV calls
- [ ] Zero `rc.user` references
- [ ] Zero `rc.pathParams` references
- [ ] TypeScript compiles without errors
- [ ] Committed and pushed
