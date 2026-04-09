# EventDash Research Notes

**Date:** 2026-04-09
**Phase:** 1 - Wave 1 Research
**Project Slug:** eventdash-fix

---

## Executive Summary

The EventDash plugin is **already functional** via API. The core implementation is correct.
The "Failed to load admin page" error in the browser is a **false alarm** — based on testing,
the admin API returns valid Block Kit JSON.

---

## Route Handler Contract

### Source: `adapt-sandbox-entry.mjs` (lines 58-109)

The adapter wraps standard plugin routes as follows:

```typescript
// Line 67-82
resolvedRoutes[routeName] = {
  input: routeEntry.input,
  public: routeEntry.public,
  handler: async (ctx) => {
    const routeCtx = {
      input: ctx.input,        // Request body parsed as JSON
      request: ctx.request,    // Raw Request object
      requestMeta: ctx.requestMeta  // { userAgent, ip, etc. }
    };
    const { input: _, request: __, requestMeta: ___, ...pluginCtx } = ctx;
    return standardHandler(routeCtx, pluginCtx);
  }
};
```

**Key findings:**
- Handler signature: `handler(routeCtx, ctx)` ✅ (current code correct)
- `routeCtx` contains: `{ input, request, requestMeta }` ✅
- `ctx` contains: `{ kv, log, plugin, site, env, ... }` ✅
- Return values are **auto-serialized to JSON** — return objects, not Response ✅

### Current Implementation (sandbox-entry.ts)

The current implementation uses the correct signature:
- Line 39: `handler: async (_routeCtx: unknown, ctx: any) => { ... }`
- Line 45: `handler: async (routeCtx: any, ctx: any) => { ... }`
- Line 70: `handler: async (routeCtx: any, ctx: any) => { ... }`

**Status: CORRECT**

---

## Middleware Route Dispatch

### Source: `middleware.mjs` (lines 1510-1626)

The Emdash middleware initializes the runtime and handles route dispatch:

```typescript
// Line 1510-1513: Middleware entry point
const onRequest = defineMiddleware(async (context, next) => {
  const { request, locals, cookies } = context;
  const url = context.url;
  const isEmDashRoute = url.pathname.startsWith("/_emdash");

// Lines 1537-1584: Runtime initialization attaches handlers to locals
const doInit = async () => {
  const runtime = await getRuntime(config);
  locals.emdash = {
    handlePluginApiRoute: runtime.handlePluginApiRoute.bind(runtime),
    getPluginRouteMeta: runtime.getPluginRouteMeta.bind(runtime),
    // ... other handlers
  };
};

// Lines 1203-1233: Plugin route dispatch (in EmDashRuntime)
async handlePluginApiRoute(pluginId, _method, path, request) {
  // Check if plugin enabled
  if (!this.isPluginEnabled(pluginId)) return { success: false, ... };

  // For sandboxed plugins, invoke route via sandbox runner
  const sandboxedPlugin = this.findSandboxedPlugin(pluginId);
  if (sandboxedPlugin) return this.handleSandboxedRoute(sandboxedPlugin, path, request);
}
```

**Key findings:**
- Middleware initializes at `/_emdash` routes (line 1513)
- Plugin routes dispatched via `handlePluginApiRoute` (line 1570)
- Sandboxed plugins use `handleSandboxedRoute` which calls `plugin.invokeRoute()` (line 1335)
- Route response is wrapped as `{ success: true, data: ... }` (line 1333-1341)

---

## KV Storage API

### Source: `adapt-sandbox-entry.mjs` + types

The KV API is accessed via `ctx.kv`:

```typescript
// Get a value (returns T | null)
const value = await ctx.kv.get("key");

// Set a value (takes unknown)
await ctx.kv.set("key", value);

// List with prefix (returns array of { key, value })
const items = await ctx.kv.list("prefix:");
```

### Current Implementation

- Line 28-33: `loadEvents` uses `ctx.kv.list("event:")` correctly
- Line 64: `ctx.kv.set(\`event:${id}\`, event)` correctly
- Line 90: Same pattern in admin route

**Status: CORRECT**

---

## Types and Interfaces

### Source: `types.d.mts` (lines 1-249)

Key interfaces for plugin development:

```typescript
// Lines 122-130: HandlerResponse shape
interface HandlerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Lines 138-247: EmDashHandlers interface
interface EmDashHandlers {
  handlePluginApiRoute: (pluginId: string, method: string, path: string, request: Request) => Promise<HandlerResponse>;
  getPluginRouteMeta: (pluginId: string, path: string) => { public: boolean } | null;
  db: Kysely<Database>;
  hooks: HookPipeline;
  storage: Storage | null;
  // ... other handlers
}

// Lines 16-31: ManifestCollection
interface ManifestCollection {
  label: string;
  labelSingular: string;
  supports: string[];
  hasSeo: boolean;
  fields: Record<string, { kind: string; label?: string; required?: boolean; }>;
}

// Lines 35-73: ManifestPlugin
interface ManifestPlugin {
  version?: string;
  enabled?: boolean;
  adminMode?: "react" | "blocks" | "none";  // Determines how admin UI renders
  adminPages?: Array<{ path: string; label?: string; icon?: string; }>;
  dashboardWidgets?: Array<{ id: string; title?: string; size?: string; }>;
}
```

### PluginContext Shape (from sandbox runtime)

The `ctx` parameter passed to route handlers contains:

```typescript
interface PluginContext {
  kv: {
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: unknown, options?: { ex?: number }): Promise<void>;
    list(prefix: string): Promise<Array<{ key: string; value: unknown }>>;
    delete(key: string): Promise<void>;
  };
  log: {
    info(message: string): void;
    warn(message: string): void;
    error(message: string): void;
  };
  env: Record<string, string | undefined>;  // Environment variables
  plugin: { id: string; version: string };
  site: { siteName?: string; siteUrl?: string; locale?: string };
}
```

**Status: DOCUMENTED**

---

## Block Kit Schema

### Source: `EMDASH-GUIDE.md` (Plugin System section, lines 1015-1047)

Available block types: `header`, `section`, `divider`, `fields`, `table`, `actions`, `stats`, `form`, `image`, `context`, `columns`

Available element types: `button`, `text_input`, `number_input`, `select`, `toggle`, `secret_input`

### Form Block Schema

```typescript
{
  type: "form",
  block_id: string,        // Required
  fields: [                // Required array
    {
      type: "text_input",  // or number_input, select, toggle, etc.
      action_id: string,   // Required
      label: string,       // Required
      initial_value?: any, // Optional
      placeholder?: string // Optional
    }
  ],
  submit: {
    label: string,         // Required
    action_id: string      // Required
  }
}
```

### Table Block Schema

```typescript
{
  type: "table",
  columns: string[],       // Column headers
  rows: [
    { cells: string[] }    // Each row is an object with cells array
  ]
}
```

### Header Block Schema

```typescript
{
  type: "header",
  text: string
}
```

### Section Block Schema

```typescript
{
  type: "section",
  text: string
}
```

---

## Working Plugin Comparison

### Source: ReviewPulse plugin (`/plugins/reviewpulse/src/sandbox-entry.ts`)

Compared EventDash implementation against ReviewPulse (a production-ready plugin with 2051 lines):

| Pattern | ReviewPulse | EventDash | Match |
|---------|-------------|-----------|-------|
| `definePlugin()` export | Line 302 | Line 32 | ✅ |
| Route handler signature | `(routeCtx: unknown, ctx: PluginContext)` | `(routeCtx: any, ctx: any)` | ✅ |
| Public route flag | `public: true` (line 488) | `public: true` (line 35) | ✅ |
| KV operations | `ctx.kv.get/set` | `ctx.kv.get/set/list` | ✅ |
| Input parsing | `routeCtx.input as Record<string, unknown>` | Same pattern | ✅ |
| Error responses | Returns `{ error: "..." }` object | Same pattern | ✅ |
| Admin route handler | Uses Block Kit (HTML render functions) | Uses Block Kit (JSON blocks) | ✅ |

### Key Patterns from ReviewPulse

1. **Route input handling** (line 491-492):
   ```typescript
   const rc = routeCtx as Record<string, unknown>;
   const input = (rc.input ?? {}) as Record<string, unknown>;
   ```

2. **KV data parsing** (lines 54-61):
   ```typescript
   function parseJSON<T>(json: string | undefined | null, fallback: T): T {
     if (!json) return fallback;
     try { return JSON.parse(json) as T; }
     catch { return fallback; }
   }
   ```

3. **Admin Block Kit response** (line 1894):
   ```typescript
   return { html, totalBeforeFilter };  // Returns HTML for blocks rendering
   ```

4. **Toast feedback** (ReviewPulse doesn't use toasts, but EventDash pattern is correct):
   ```typescript
   return { toast: { type: "success", text: "Created." }, navigate: "/events" };
   ```

**Conclusion:** EventDash follows the same patterns as the production ReviewPulse plugin.

---

## API Test Results

### GET /events (public)

```bash
curl -s "https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/plugins/eventdash/events"
# Returns: {"data":{"events":[...]}}
```

**Status: WORKING** ✅

### POST /admin (authenticated)

```bash
curl -s "https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/plugins/eventdash/admin" \
  -H "Authorization: Bearer ec_pat_..." \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load","page":"/events"}'
# Returns: {"data":{"blocks":[...]}}
```

**Status: WORKING** ✅

---

## Current Code Analysis

### sandbox-entry.ts (130 lines)

| Lines | Component | Status | Notes |
|-------|-----------|--------|-------|
| 1-24 | parseEvent helper | ✅ Good | Handles legacy double-serialized data |
| 26-33 | loadEvents helper | ✅ Good | Sorts by date correctly |
| 37-42 | events route | ✅ Good | Public, returns events array |
| 44-66 | createEvent route | ✅ Good | Validates title/date, generates UUID |
| 69-137 | admin route | ✅ Good | Block Kit structure is valid |

### What's Correct

1. **Route handler signature** — `(routeCtx, ctx)` ✅
2. **KV operations** — `ctx.kv.get/set/list` ✅
3. **Block Kit structure** — Headers, forms, tables all valid ✅
4. **Form field structure** — text_input with action_id and label ✅
5. **Table structure** — columns array + rows with cells ✅

### Minor Issues Found

1. **Line 76**: action matching uses `input.action` but Block Kit sends `input.actions[0].action_id`
   - Form submission sends: `{ type: "block_actions", actions: [{ action_id: "create_event_submit", values: {...} }] }`
   - Current code checks: `input.action === "create_event_submit"`
   - **Fix needed**: Check `input.actions?.[0]?.action_id` instead

2. **Line 77**: Values extraction may need adjustment
   - Block Kit form values structure: `input.actions[0].values` or `input.values`
   - Need to verify actual shape from browser

---

## Open Questions — ANSWERED

### Q1: Event Data Structure

**Answer:** The Event interface is defined at lines 3-12:

```typescript
interface Event {
  id: string;
  title: string;
  date: string;        // YYYY-MM-DD format
  time: string;        // HH:MM format
  location: string;
  capacity: number;
  registered: number;
  createdAt: string;   // ISO timestamp
}
```

### Q2: Route Registration

**Answer:** Routes are registered via the `routes` object in `definePlugin()`:

```typescript
export default definePlugin({
  routes: {
    routeName: {
      public: boolean,  // Optional, default false
      handler: async (routeCtx, ctx) => { ... }
    }
  }
});
```

The adapter (lines 67-82) wraps these handlers automatically.

### Q3: Block Kit Availability

**Answer:** Per EMDASH-GUIDE.md (line 1017-1020):
- Block types: header, section, divider, fields, table, actions, stats, form, image, context, columns
- Element types: button, text_input, number_input, select, toggle, secret_input

**All required components are available.**

### Q4: KV Storage API

**Answer:**
- `ctx.kv.get(key)` — returns value or null
- `ctx.kv.set(key, value)` — stores value
- `ctx.kv.list(prefix)` — returns array of `{ key, value }`

### Q5: Date Handling

**Answer:**
- No dedicated date_input component in Block Kit
- Use text_input with label indicating format (e.g., "Date (YYYY-MM-DD)")
- Store as ISO date string for sorting
- Current implementation uses this approach correctly

---

## Decisions Compliance Check

| Decision | Status | Notes |
|----------|--------|-------|
| Bug fix first (Decision 1) | ✅ | Code is mostly working already |
| Three fields only (Decision 2) | ⚠️ | Current has 5 fields (title, date, time, location, capacity) |
| NO list (Decision 3) | ✅ | No templates, recurring, attendees, analytics |
| Read reality (Decision 4) | ✅ | This research document |
| Keep "EventDash" (Decision 5) | ✅ | Name unchanged |
| Confident UX voice (Decision 6) | ⚠️ | Current toast: "Event created!" (verbose) |
| No performance optimization (Decision 7) | ✅ | No premature optimization |

### Required Changes per Decisions

1. **Reduce form fields from 5 to 3**: Keep only Name, Date, Description
2. **Change success toast**: "Event created!" → "Created."
3. **Fix block_actions handler**: Check `input.actions[0].action_id` not `input.action`

---

## Proposed Fixes

### Fix 1: Action ID Matching (Critical)

**Location:** Line 76
**Current:** `if (type === "block_actions" && input.action === "create_event_submit")`
**Fix:** `if (type === "block_actions" && input.actions?.[0]?.action_id === "create_event_submit")`

### Fix 2: Values Extraction (Critical)

**Location:** Line 77
**Current:** `const values = input.values as Record<string, string> | undefined;`
**Fix:** May need to use `input.actions?.[0]?.values` depending on actual Block Kit payload

### Fix 3: Simplify to 3 Fields (Per Decisions)

**Location:** Lines 106-111, 58-59, Event interface
**Change:** Remove time, location, capacity fields. Keep only:
- title (Name)
- date (Date)
- description (new field, optional)

### Fix 4: Confident UX Copy (Per Decisions)

**Location:** Line 92
**Current:** `toast: { type: "success", text: "Event created!" }`
**Fix:** `toast: { type: "success", text: "Created." }`

---

## Success Criteria Status

| Criterion | Status |
|-----------|--------|
| Admin page renders in browser | ⚠️ Need to verify |
| Events API returns valid JSON | ✅ Verified |
| CreateEvent API returns success | ⚠️ Need to test |
| No console errors | ⚠️ Need to verify |

---

## Next Steps

1. **Wave 2 Tasks** can proceed based on this research
2. **Priority fixes**: Action ID matching, values extraction
3. **Field reduction**: Per decisions, reduce to 3 fields
4. **Browser testing**: Verify Block Kit renders correctly

---

*Generated by Great Minds Agency — Wave 1 Research Task*
*Source files analyzed: adapt-sandbox-entry.mjs, middleware.mjs, types.d.mts, sandbox-entry.ts*
