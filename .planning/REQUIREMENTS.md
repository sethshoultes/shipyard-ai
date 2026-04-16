# Requirements: Membership Plugin Hotfix

**Project:** membership-hotfix
**Priority:** p0 (Production Hotfix)
**Site:** yoga.shipyard.company
**Generated:** 2026-04-16

## Problem Statement

The Membership plugin on Sunrise Yoga has two runtime bugs blocking customers:

1. **Settings page is blank** — `/_emdash/admin/plugins/membership` shows nothing on page_load
2. **Members page crashes** — `/_emdash/admin/plugins/membership/members` throws `Cannot read properties of undefined (reading 'map')`

Both are Block Kit rendering issues in the admin route handler.

## Root Cause Analysis

### Bug 1: Blank Settings Page
The admin `page_load` handler only responds to specific pages (`/members`, `/plans`) but NOT the default root admin page. When no page is specified (or page is undefined), the handler returns `{ blocks: [] }`, causing a blank screen.

**Code Location:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`, Line 2511

### Bug 2: Members Page `.map()` Crash
According to the PRD, the members list handler calls `.map()` on a value that's undefined when no members exist. However, code analysis reveals the current implementation uses `parseJSON()` with fallback defaults, suggesting this might be intermittent or related to specific KV states.

**Code Location:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`, Lines 2212-2213

## Atomic Requirements

| ID | Requirement | File(s) | Verification |
|---|---|---|---|
| **REQ-1** | Fix blank settings page - Add page_load handler for root admin page that returns valid Block Kit blocks | `sandbox-entry.ts` | Navigate to `/_emdash/admin/plugins/membership` and confirm blocks render (not blank) |
| **REQ-2** | Implement dashboard page_load handler with header, stats, and action buttons | `sandbox-entry.ts` | Dashboard shows: (1) Header "MemberShip — Membership Management", (2) Stats for member/plan counts, (3) Action buttons for Members/Plans/Settings |
| **REQ-3** | Add null guard to members list KV fetch with `?? []` fallback | `sandbox-entry.ts` | Access members page with 0 members - shows empty table, no crash |
| **REQ-4** | Add null guard to view_members action handler | `sandbox-entry.ts` | Verify `.map()` calls have preceding null checks |
| **REQ-5** | Add null guard to view_plans action handler | `sandbox-entry.ts` | Access plans page with empty KV - shows default plans, no crash |
| **REQ-6** | Verify all array operations (`.map()`, `.filter()`, etc.) on KV results have null guards | `sandbox-entry.ts` | Code review + grep for array methods |
| **REQ-7** | Verify zero banned patterns (`throw new Response`, `rc.user`, `rc.pathParams`) | `sandbox-entry.ts` | Run: `grep -c "throw new Response\|rc\.user\|rc\.pathParams" plugins/membership/src/sandbox-entry.ts` → Must be 0 |
| **REQ-8** | Commit and push all changes with descriptive commit message | Git | `git status` confirms clean working tree, commit exists, branch pushed |

## Success Criteria

- [x] Requirements extracted and documented (this file)
- [ ] Admin page_load returns valid blocks (not blank)
- [ ] view_members works with 0 members (empty list, no crash)
- [ ] view_plans works with 0 plans (empty list, no crash)
- [ ] view_settings returns a settings form
- [ ] Zero banned pattern violations
- [ ] Committed and pushed to git

## Technical Constraints

### Block Kit Response Format
All admin handlers must return:
```typescript
{
  blocks: [ /* array of Block Kit blocks */ ],
  toast?: { message: string, type: "success" | "error" },
}
```

**Valid Block Types:** header, section, stats, table, form, actions, context, divider, fields

**Reference:** `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md`, Lines 1015-1047

### Sandbox Environment Rules
- Plugin runs in sandboxed Worker isolate
- No access to `rc.user`, `rc.pathParams`, `throw new Response`
- All KV operations are async and may return `null`
- Must use `ctx.kv.get<T>()` with type hints

### Known Working Pattern (from EventDash)
```typescript
if (interaction.type === "page_load" && interaction.page === "/events") {
  const events = await getAllEventsWithDates(ctx);
  const eventRows = [];

  for (const event of events) {
    eventRows.push({ /* ... */ });
  }

  return {
    blocks: [
      { type: "header", text: "Events" },
      { type: "stats", stats: [ /* ... */ ] },
      { type: "table", columns: [ /* ... */ ], rows: eventRows },
    ],
  };
}
```

## Files to Modify

- **Primary:** `/home/agent/shipyard-ai/plugins/membership/src/sandbox-entry.ts`
  - Lines 2202-2525: Admin handler section
  - Line 2511: Default return statement (empty blocks)
  - Lines 2211-2321: Members page handler
  - Lines 2385-2428: Plans page handler

## Related Documentation

- **PRD:** `/home/agent/shipyard-ai/prds/membership-hotfix.md`
- **Emdash Guide (Block Kit):** `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (Section 6: Plugin System, Lines 1015-1047)
- **Project Rules:** `/home/agent/shipyard-ai/CLAUDE.md` (Lines 158-177: Emdash CMS Reference)
- **Working Example:** `/home/agent/shipyard-ai/plugins/eventdash/src/sandbox-entry.ts` (Lines 2862-2939)

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| Breaking existing members/plans pages | MEDIUM | Test all existing admin pages after changes |
| KV null states causing new crashes | MEDIUM | Add comprehensive null guards with fallbacks |
| Incorrect Block Kit format | LOW | Follow EMDASH-GUIDE.md examples exactly |
| Regression in production | HIGH | This is a hotfix for live site - test thoroughly |

## Token Budget

**Hotfix Tier:** 100K tokens
**Current Usage:** ~54K tokens (research phase)
**Remaining:** ~46K tokens (implementation + review + deploy)

---

*Generated by agency-plan skill • GSD methodology*
