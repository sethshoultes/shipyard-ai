---
hotfix: true
---
# PRD: Fix Membership Plugin — Blank Settings + Members Page Crash

> Priority: p0
> hotfix: true

## Problem

The Membership plugin on Sunrise Yoga (yoga.shipyard.company) has two runtime bugs:

1. **Settings page is blank** — `/_emdash/admin/plugins/membership` shows nothing on page_load
2. **Members page crashes** — `/_emdash/admin/plugins/membership/members` throws `Cannot read properties of undefined (reading 'map')`

Both are Block Kit rendering issues in the admin route handler in `plugins/membership/src/sandbox-entry.ts`.

## Root Cause Analysis

### Bug 1: Blank settings page
The admin `page_load` handler likely returns empty blocks or the wrong structure. The handler must return `{ blocks: [...] }` with valid Block Kit blocks.

### Bug 2: `.map()` on undefined
The members list handler calls `.map()` on a value that's undefined. This happens when:
- `ctx.kv.get("members:list")` returns `null`/`undefined` (no members exist yet)
- The code tries to `.map()` on the raw KV result without null-checking

## Fix Instructions

### Step 1: Read the current admin handler
Read `plugins/membership/src/sandbox-entry.ts` and find:
- The admin route handler (search for `admin:` or `page_load`)
- The `view_members` action handler
- The `view_plans` action handler

### Step 2: Fix page_load handler
The admin page_load MUST return a valid blocks array. Example of correct format:
```typescript
if (interactionType === "page_load") {
  const memberList = await ctx.kv.get<string[]>("members:list") ?? [];
  const plansList = await ctx.kv.get<unknown[]>("plans") ?? [];
  return {
    blocks: [
      { type: "header", text: "MemberShip — Membership Management" },
      { type: "stats", items: [
        { label: "Total Members", value: String(memberList.length) },
        { label: "Active Plans", value: String(plansList.length) },
      ]},
      { type: "actions", elements: [
        { type: "button", text: "Manage Members", action_id: "view_members", style: "primary" },
        { type: "button", text: "Manage Plans", action_id: "view_plans" },
        { type: "button", text: "Settings", action_id: "view_settings" },
      ]}
    ]
  };
}
```

### Step 3: Fix view_members handler — null guard
Every KV list fetch MUST have a `?? []` fallback:
```typescript
// WRONG — crashes if no members exist
const members = await ctx.kv.get<string[]>("members:list");
const rows = members.map(...)  // TypeError: Cannot read properties of undefined (reading 'map')

// CORRECT
const members = await ctx.kv.get<string[]>("members:list") ?? [];
const rows = members.map(...)  // Works — empty array, no crash
```

Find ALL instances of `.map()`, `.filter()`, `.forEach()`, `.reduce()` called on KV results and add null guards.

### Step 4: Fix view_plans handler — same pattern
Apply the same `?? []` null guard to plans list fetches.

### Step 5: Fix view_settings handler
If settings page_load returns nothing, add a proper Block Kit response with the plugin settings form.

### Step 6: Verify zero banned patterns
```bash
grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts
# Must be 0
```

## Files to Modify

- `plugins/membership/src/sandbox-entry.ts` — fix admin handlers

## Success Criteria

- [ ] Admin page_load returns valid blocks (not blank)
- [ ] view_members works with 0 members (empty list, no crash)
- [ ] view_plans works with 0 plans (empty list, no crash)
- [ ] view_settings returns a settings form
- [ ] Zero banned pattern violations
- [ ] Committed and pushed
