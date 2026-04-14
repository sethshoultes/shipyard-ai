# Phase 1 Plan — SEODash Plugin Fix

**Generated:** 2026-04-14
**Project Slug:** github-issue-sethshoultes-shipyard-ai-34
**Requirements:** `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks:** 18
**Waves:** 7 (plus Wave 0 pre-flight)
**Estimated Timeline:** 8-15 hours after blockers resolved

---

## The Essence

From decisions.md:

> **"SEO that's invisible when perfect, obvious when broken. Fix → save → done."**

A tool that makes people feel confident, not just correct. Steve's UX taste + Elon's performance discipline + data-driven iteration.

---

## Problem Statement

The SEODash plugin exists (969 lines of runtime logic, 487 lines of admin UI, 797 lines of tests) but has critical issues preventing ship:

1. **Architectural Mismatches** — Storage patterns and admin UI don't align with actual Emdash plugin API
2. **Feature Scope Violations** — Includes 4 features explicitly cut in product decisions (keywords, sitemap patterns, robots UI, freeform structured data)
3. **Missing V1 Requirements** — Pagination, visual previews, proper dashboard, Article template system
4. **Zero Runtime Validation** — Never tested on Peak Dental (real Emdash instance)

**Ship Test (from decisions.md):**
> Does it run on Peak Dental without errors? If yes, ship it.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| **Wave 0: Pre-Flight Validation (BLOCKERS)** | | |
| REQ-001-005 (Emdash API validation) | phase-1-task-0 | 0 |
| **Wave 1: Feature Cleanup** | | |
| REQ-006-008 (Remove keywords) | phase-1-task-1 | 1 |
| REQ-009-011 (Remove sitemap patterns) | phase-1-task-2 | 1 |
| REQ-012-013 (Remove robots UI) | phase-1-task-3 | 1 |
| **Wave 2: Storage Architecture** | | |
| REQ-014-020 (Fix getAllPages N+1, denormalization, cache) | phase-1-task-4, phase-1-task-5 | 2 |
| **Wave 3: Pagination & Sorting** | | |
| REQ-021-025 (Cursor pagination, worst-first sort) | phase-1-task-6, phase-1-task-7 | 3 |
| **Wave 4: Dashboard UI** | | |
| REQ-026-031 (One-screen, quick links, disclaimer) | phase-1-task-8, phase-1-task-9 | 4 |
| **Wave 5: Visual Social Previews** | | |
| REQ-032-038 (FB/Twitter/Google cards, live updates) | phase-1-task-10, phase-1-task-11 | 5 |
| **Wave 6: Testing & Validation** | | |
| REQ-039-050 (Peak Dental deploy, load tests, validation) | phase-1-task-12 through task-16 | 6 |
| **Wave 7: Structured Data Templates** | | |
| REQ-051-056 (Article template form, JSON-LD generation) | phase-1-task-17, phase-1-task-18 | 7 |

---

## Wave Execution Order

### Wave 0 (CRITICAL — Blocks All Work) — Pre-Flight Validation

**Purpose:** Validate actual Emdash plugin API behavior on Peak Dental before writing code.

```xml
<task-plan id="phase-1-task-0" wave="0">
  <title>Pre-Flight: Validate Emdash Plugin API on Peak Dental</title>
  <requirement>REQ-001, REQ-002, REQ-003, REQ-004, REQ-005</requirement>
  <description>
    Create and deploy a minimal test plugin to Peak Dental to validate:
    - Does ctx.kv work in sandboxed execution?
    - Is ctx.storage the correct pattern instead of ctx.kv?
    - Do custom content-type responses work (XML, plain text)?
    - Is Block Kit required for admin UI or can we use HTML strings?
    Document all findings to guide implementation approach.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Plugin System documentation (lines 899-1180) — definitive reference for plugin API" />
    <file path="/home/agent/shipyard-ai/examples/peak-dental/" reason="Peak Dental deployment target — real Emdash instance to test against" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Storage assumptions in Risk Register (lines 219-250)" />
  </context>

  <steps>
    <step order="1">Create minimal test plugin at /home/agent/shipyard-ai/plugins/_test-plugin/src/index.ts with:
      - Single route that tests ctx.kv.get(), ctx.kv.set(), ctx.kv.delete()
      - Public route that returns XML with contentType: "application/xml"
      - Admin route that returns HTML string (to test if Block Kit is required)
      - Storage test: ctx.storage definition with single collection
    </step>
    <step order="2">Add test plugin to Peak Dental's astro.config.mjs:
      import testPlugin from "/home/agent/shipyard-ai/plugins/_test-plugin";
      emdash({ plugins: [testPlugin()] })
    </step>
    <step order="3">Deploy test plugin to Peak Dental:
      cd /home/agent/shipyard-ai/examples/peak-dental && npm run build && wrangler deploy
    </step>
    <step order="4">Test KV operations:
      - Call test route that writes to ctx.kv
      - Verify data persists across requests
      - Test delete operation
      - Document: Does ctx.kv work? Is it available in sandbox? Any limitations?
    </step>
    <step order="5">Test storage pattern:
      - Define ctx.storage collection in plugin
      - Try ctx.storage.items.put(), ctx.storage.items.get(), ctx.storage.items.query()
      - Document: Is ctx.storage preferred over ctx.kv for page data?
    </step>
    <step order="6">Test custom content types:
      - Request public XML route
      - Verify Content-Type header is application/xml
      - Try text/plain for robots.txt simulation
      - Document: Can plugins return non-JSON responses?
    </step>
    <step order="7">Test admin UI pattern:
      - Request admin route that returns HTML string
      - Check if Emdash renders it or requires Block Kit JSON
      - Document: Can we use HTML strings or must we use Block Kit?
    </step>
    <step order="8">Write findings document at /home/agent/shipyard-ai/.planning/emdash-api-validation.md with:
      - KV availability and limitations
      - Storage vs KV recommendation for SEODash use case
      - Content-type handling for public routes
      - Admin UI pattern requirement (HTML vs Block Kit)
      - Any discovered capability requirements
    </step>
  </steps>

  <verification>
    <check type="manual">Test plugin deployed to Peak Dental successfully</check>
    <check type="manual">KV operations work (or documented as unavailable)</check>
    <check type="manual">Storage operations tested and documented</check>
    <check type="manual">Custom content types verified or documented as blocked</check>
    <check type="manual">Admin UI pattern confirmed</check>
    <check type="manual">Findings document exists with clear recommendations</check>
  </verification>

  <dependencies>
    <!-- Wave 0: no dependencies, but blocks ALL subsequent waves -->
  </dependencies>

  <commit-message>chore(seodash): pre-flight validation of Emdash plugin API on Peak Dental

Create minimal test plugin to validate:
- ctx.kv availability and behavior in sandbox
- ctx.storage pattern for document collections
- Custom content-type support for XML/text responses
- Admin UI pattern (HTML strings vs Block Kit requirement)

Findings documented in .planning/emdash-api-validation.md

Refs: REQ-001 through REQ-005 (Wave 0 blockers)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 1 (Parallel) — Feature Cleanup (Remove Scope Violations)

**Purpose:** Remove all features explicitly cut in product decisions.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Remove keywords field from all code</title>
  <requirement>REQ-006, REQ-007, REQ-008, REQ-072</requirement>
  <description>
    Delete all references to the keywords field, which was explicitly cut in
    Decision #5: "Meta keywords field: ignored by Google since 2009, adds
    cognitive load with zero value. Remove from schema, UI, audit logic entirely."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="Contains keywords in PageSeoData, savePage handler (line 345), auditPage (lines 118-120)" />
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/admin-ui.ts" reason="May contain keywords field in UI rendering" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision #5 (lines 48-53) — explicit cut justification" />
  </context>

  <steps>
    <step order="1">Remove keywords from PageSeoData interface in admin-ui.ts (line 34):
      Delete: keywords?: string[]
    </step>
    <step order="2">Remove keywords audit check from auditPage() in sandbox-entry.ts (lines 118-120):
      Delete entire block:
      ```
      if (data.keywords && data.keywords.length > 10) {
        issues.push({ type: "warning", code: "too-many-keywords", message: `Too many keywords (${data.keywords.length}, recommend 10 or fewer)` });
      }
      ```
    </step>
    <step order="3">Remove keywords processing from savePage handler in sandbox-entry.ts (line 345):
      Delete: keywords: Array.isArray(input.keywords) ? input.keywords.map(String) : existing?.keywords,
    </step>
    <step order="4">Remove keywords from getPagePublic response (line 508):
      Delete: keywords: page.keywords,
    </step>
    <step order="5">Search entire codebase for remaining "keyword" references:
      grep -rn "keyword" src/ --exclude-dir=__tests__
      Remove any remaining references
    </step>
    <step order="6">Update tests if needed:
      Check __tests__/sandbox-entry.test.ts for keywords-related tests and remove
    </step>
  </steps>

  <verification>
    <check type="test">grep -rn "keyword" src/ --exclude-dir=__tests__ returns zero matches</check>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes (all tests still green)</check>
    <check type="manual">No keywords field in any interface, handler, or UI code</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-0" reason="Must complete pre-flight validation first" />
  </dependencies>

  <commit-message>refactor(seodash): remove keywords field per Decision #5

Meta keywords have been ignored by Google since 2009. Remove all
references to keywords field from schema, audit logic, and handlers.

- Deleted PageSeoData.keywords interface property
- Removed keyword count audit check (lines 118-120)
- Removed keywords processing from savePage handler
- Removed keywords from public API responses

Refs: Decision #5, REQ-006 through REQ-008, REQ-072

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Remove sitemap pattern overrides</title>
  <requirement>REQ-009, REQ-010, REQ-011, REQ-073</requirement>
  <description>
    Delete sitemap pattern override logic, which was explicitly cut in
    Decision #6: "0.1% use case, 40 lines of code. Ship with default
    changefreq=monthly for all URLs. No UI for per-path overrides."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="SitemapSettings (lines 18-22), generateSitemapXml (lines 181-216), sitemapSettings handler (lines 589-620)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision #6 (lines 55-60) — explicit cut with monitoring clause" />
  </context>

  <steps>
    <step order="1">Simplify SitemapSettings interface (lines 18-22):
      Change from:
      ```typescript
      export interface SitemapSettings {
        defaultChangefreq: string;
        defaultPriority: number;
        patterns: Array<{ pathPrefix: string; changefreq: string; priority: number }>;
      }
      ```
      To:
      ```typescript
      export interface SitemapSettings {
        defaultChangefreq: string;
        defaultPriority: number;
      }
      ```
    </step>
    <step order="2">Remove pattern logic from generateSitemapXml() (lines 193-199):
      Delete entire block:
      ```typescript
      // Check for pattern-specific overrides
      for (const pattern of settings.patterns) {
        if (p.path.startsWith(pattern.pathPrefix)) {
          changefreq = pattern.changefreq;
          priority = pattern.priority;
          break;
        }
      }
      ```
    </step>
    <step order="3">Simplify sitemapSettings handler (lines 589-620):
      Remove pattern processing, keep only defaultChangefreq and defaultPriority
      Or remove handler entirely if settings are static
    </step>
    <step order="4">Update plugin:install hook (line 296) to remove patterns initialization:
      Change: patterns: [],
      Delete this line
    </step>
    <step order="5">Verify sitemap generation uses static defaults only:
      changefreq: "monthly", priority: 0.5 for all pages
    </step>
  </steps>

  <verification>
    <check type="test">grep -rn "pattern" src/sandbox-entry.ts returns zero sitemap-related matches</check>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes</check>
    <check type="manual">SitemapSettings has only 2 fields (defaultChangefreq, defaultPriority)</check>
    <check type="manual">generateSitemapXml uses only default values</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-0" reason="Must complete pre-flight validation first" />
  </dependencies>

  <commit-message>refactor(seodash): remove sitemap pattern overrides per Decision #6

Pattern-specific sitemap configuration is 0.1% use case. Ship with
simple defaults: changefreq=monthly, priority=0.5 for all URLs.

- Simplified SitemapSettings interface (removed patterns array)
- Removed pattern matching logic from generateSitemapXml()
- Removed or simplified sitemapSettings handler
- Static defaults: monthly changefreq, 0.5 priority

Monitor for 30 days. If even ONE user requests patterns, add in v1.1.

Refs: Decision #6, REQ-009 through REQ-011, REQ-073

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Remove robots.txt settings UI handler</title>
  <requirement>REQ-012, REQ-013, REQ-070, REQ-074</requirement>
  <description>
    Delete robots.txt settings handler, which was explicitly cut in Decision #7:
    "Default is perfect; power users can edit manually. V1 ships with sensible
    static default. V2 adds UI if users request it."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="RobotsSettings (lines 24-27), robotsSettings handler (lines 655-682)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision #7 (lines 62-67) — cut with monitoring clause" />
  </context>

  <steps>
    <step order="1">Simplify RobotsSettings to static type (optional step) or remove entirely:
      Keep RobotsSettings interface if needed for robots.txt generation
      But remove rules array configuration support
    </step>
    <step order="2">Delete robotsSettings handler entirely (lines 655-682):
      This handler allows admin modification of robots.txt rules
      V1 uses immutable default only
    </step>
    <step order="3">Update robotsTxt handler (lines 626-649) to use static default only:
      Hardcode the battle-tested default instead of reading from KV settings
      Default:
      ```
      User-agent: *
      Allow: /
      Disallow: /admin/
      Sitemap: {siteUrl}/sitemap.xml
      ```
    </step>
    <step order="4">Remove robots settings initialization from plugin:install hook (lines 299-302):
      Delete:
      ```typescript
      await ctx.kv.set("seo:robots-settings", {
        rules: [],
        sitemapUrl: "",
      });
      ```
    </step>
    <step order="5">Verify no admin UI exposes robots.txt configuration</step>
  </steps>

  <verification>
    <check type="test">grep -n "robotsSettings" src/sandbox-entry.ts returns only robotsTxt handler reference</check>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes</check>
    <check type="manual">robotsSettings handler deleted</check>
    <check type="manual">robots.txt uses static immutable default</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-0" reason="Must complete pre-flight validation first" />
  </dependencies>

  <commit-message>refactor(seodash): remove robots.txt settings UI per Decision #7

Battle-tested default is perfect for v1. Power users can edit manually.
V2 adds admin UI only if users request it.

- Deleted robotsSettings handler (lines 655-682)
- Hardcoded static default in robotsTxt handler
- Removed settings initialization from plugin:install hook
- Default: Allow all, Disallow /admin/, reference sitemap

Monitor for 30 days. If users break default, add UI in v1.1.

Refs: Decision #7, REQ-012, REQ-013, REQ-070, REQ-074

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Storage Architecture Fixes

**Purpose:** Fix getAllPages() N+1 bug with denormalization, implement cache invalidation.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Fix getAllPages() N+1 bug with denormalization</title>
  <requirement>REQ-014, REQ-015, REQ-016, REQ-017, REQ-018</requirement>
  <description>
    Refactor storage layer to store full page objects in denormalized list,
    eliminating N+1 queries. Current implementation stores array of hashes
    and loops through each to fetch page data. This causes timeouts at scale
    (>500 pages). Decision #3: "Denormalize to single KV array. One read
    instead of N reads. O(1) vs O(n)."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="getAllPages() (lines 158-166), savePage (lines 312-372), deletePage (lines 431-465)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision #3 (lines 34-39) — denormalization fix, Risk #2 (lines 269-279)" />
    <file path="/home/agent/shipyard-ai/.planning/emdash-api-validation.md" reason="Pre-flight findings on ctx.kv vs ctx.storage pattern" />
  </context>

  <steps>
    <step order="1">Replace getAllPages() implementation (lines 158-166):
      Change from:
      ```typescript
      async function getAllPages(ctx: PluginContext): Promise<PageSeoData[]> {
        const hashes = await getPageList(ctx);
        const pages: PageSeoData[] = [];
        for (const hash of hashes) {
          const page = await getPageByHash(ctx, hash);
          if (page) pages.push(page);
        }
        return pages;
      }
      ```
      To:
      ```typescript
      async function getAllPages(ctx: PluginContext): Promise<PageSeoData[]> {
        const pages = await ctx.kv.get<PageSeoData[]>("seo:pages:all");
        return pages ?? [];
      }
      ```
    </step>
    <step order="2">Update savePage handler to maintain denormalized list (after line 355):
      After saving individual page with: await ctx.kv.set(`seo:${pathHash}`, page);
      Add:
      ```typescript
      // Update denormalized list for fast getAllPages()
      const allPages = await getAllPages(ctx);
      const existingIndex = allPages.findIndex(p => p.id === page.id);
      if (existingIndex >= 0) {
        allPages[existingIndex] = page;
      } else {
        allPages.push(page);
      }
      await ctx.kv.set("seo:pages:all", allPages);
      ```
    </step>
    <step order="3">Update deletePage handler to maintain denormalized list (after line 449):
      After deleting individual page with: await ctx.kv.delete(`seo:${pathHash}`);
      Add:
      ```typescript
      // Update denormalized list
      const allPages = await getAllPages(ctx);
      const filtered = allPages.filter(p => p.id !== existing.id);
      await ctx.kv.set("seo:pages:all", filtered);
      ```
    </step>
    <step order="4">Add defensive handling for corrupted/missing denormalized list:
      In getAllPages(), if seo:pages:all is missing, rebuild from individual keys:
      ```typescript
      async function getAllPages(ctx: PluginContext): Promise<PageSeoData[]> {
        let pages = await ctx.kv.get<PageSeoData[]>("seo:pages:all");
        if (!pages || !Array.isArray(pages)) {
          // Defensive: rebuild from individual keys if list is missing/corrupted
          ctx.log.warn("SEODash: Rebuilding denormalized page list");
          const hashes = await getPageList(ctx);
          pages = [];
          for (const hash of hashes) {
            const page = await getPageByHash(ctx, hash);
            if (page) pages.push(page);
          }
          await ctx.kv.set("seo:pages:all", pages);
        }
        return pages;
      }
      ```
    </step>
    <step order="5">Update plugin:install hook to initialize empty denormalized list:
      Change seo:pages:list initialization to seo:pages:all with empty array:
      await ctx.kv.set("seo:pages:all", []);
    </step>
    <step order="6">Remove old getPageList/setPageList helper functions (lines 144-151) if no longer used</step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes (update tests if needed)</check>
    <check type="manual">getAllPages() is now single KV read</check>
    <check type="manual">savePage maintains denormalized list correctly</check>
    <check type="manual">deletePage maintains denormalized list correctly</check>
    <check type="manual">Defensive rebuild logic handles missing/corrupted list</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Feature cleanup must complete first" />
    <depends-on task-id="phase-1-task-2" reason="Feature cleanup must complete first" />
    <depends-on task-id="phase-1-task-3" reason="Feature cleanup must complete first" />
  </dependencies>

  <commit-message>perf(seodash): fix getAllPages() N+1 bug with denormalization per Decision #3

Store full page objects in seo:pages:all (not just hashes) to eliminate
N+1 queries. Elon identified this bottleneck: at 500+ pages, UI becomes
unusable. One read instead of N reads. O(1) vs O(n).

- getAllPages() now single KV read of seo:pages:all
- savePage maintains denormalized list on every write
- deletePage maintains denormalized list on every delete
- Defensive rebuild from individual keys if list corrupted
- Load test target: 1,000 pages in <500ms

Refs: Decision #3, REQ-014 through REQ-018

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Implement sitemap cache invalidation on page save/delete</title>
  <requirement>REQ-019</requirement>
  <description>
    Add cache invalidation for sitemap XML on page save/delete operations.
    Currently sitemap is cached at seo:sitemap:xml with no invalidation logic.
    Decision: "Immediate invalidation on page save/delete. Delete cache key on write."
    Open Question #5: "5-minute TTL vs immediate invalidation? → Immediate."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="savePage (lines 312-372), deletePage (lines 431-465), sitemap handler (lines 561-583)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision on cache strategy (Open Question #5, line 245-246)" />
  </context>

  <steps>
    <step order="1">Add cache invalidation to savePage handler (after line 363):
      After successfully saving page and updating denormalized list, add:
      ```typescript
      // Invalidate sitemap cache (page added/updated affects sitemap)
      await ctx.kv.delete("seo:sitemap:xml").catch(() => {});
      ```
    </step>
    <step order="2">Add cache invalidation to deletePage handler (after line 454):
      After successfully deleting page and updating denormalized list, add:
      ```typescript
      // Invalidate sitemap cache (page removed affects sitemap)
      await ctx.kv.delete("seo:sitemap:xml").catch(() => {});
      ```
    </step>
    <step order="3">Update sitemap handler to cache generated XML (lines 561-583):
      Before generating XML, check cache:
      ```typescript
      const cached = await ctx.kv.get<string>("seo:sitemap:xml");
      if (cached) {
        return { xml: cached, contentType: "application/xml" };
      }
      ```
      After generating XML, store in cache:
      ```typescript
      const xml = generateSitemapXml(pages, siteUrl, settings);
      await ctx.kv.set("seo:sitemap:xml", xml).catch(() => {});
      return { xml, contentType: "application/xml" };
      ```
    </step>
    <step order="4">Optional: Add manual regenerate route for paranoid users:
      ```typescript
      regenerateSitemap: {
        handler: async (_routeCtx, ctx) => {
          await ctx.kv.delete("seo:sitemap:xml");
          return { regenerated: true };
        }
      }
      ```
    </step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes</check>
    <check type="manual">savePage invalidates sitemap cache</check>
    <check type="manual">deletePage invalidates sitemap cache</check>
    <check type="manual">sitemap handler checks cache before generating</check>
    <check type="manual">Cache miss generates and stores new XML</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Denormalization must work before caching sitemap generation" />
  </dependencies>

  <commit-message>perf(seodash): add sitemap cache invalidation on page save/delete

Immediate cache invalidation (not 5-minute TTL) for sitemap freshness.
New pages appear in sitemap immediately, deleted pages removed immediately.

- savePage invalidates seo:sitemap:xml cache
- deletePage invalidates seo:sitemap:xml cache
- sitemap handler checks cache before regenerating
- Optional manual regenerate route for paranoid users

Refs: Open Question #5, REQ-019

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Pagination & Sorting

**Purpose:** Implement cursor-based pagination and worst-first sorting.

```xml
<task-plan id="phase-1-task-6" wave="3">
  <title>Implement cursor-based pagination (max 50 items per view)</title>
  <requirement>REQ-021, REQ-022, REQ-025</requirement>
  <description>
    Add pagination to listPages handler. Currently returns ALL pages with no
    limits, which crashes browsers at 500+ pages. Decision #4: "Pagination is
    non-negotiable. Cursor pagination, max 50 pages per view. Hard limit 1,000."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="listPages handler (lines 410-425)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Decision #4 (lines 41-46), Risk #8 (lines 315-319)" />
  </context>

  <steps>
    <step order="1">Update listPages handler to accept pagination parameters:
      Change signature to accept routeCtx input with:
      - limit (default: 50, max: 50)
      - offset (default: 0)
    </step>
    <step order="2">Implement pagination logic:
      ```typescript
      listPages: {
        handler: async (routeCtx: unknown, ctx: PluginContext) => {
          try {
            const rc = routeCtx as Record<string, unknown>;
            const input = (rc.input ?? {}) as Record<string, unknown>;
            const limit = Math.min(Number(input.limit || 50), 50); // Max 50
            const offset = Number(input.offset || 0);

            const allPages = await getAllPages(ctx);

            // Hard limit: reject if more than 1,000 pages
            if (allPages.length > 1000) {
              throw new Error("Page limit exceeded (1,000 max). Add search/filter to narrow results.");
            }

            // Sort by SEO score (worst first) — see task 7
            allPages.sort((a, b) => (a.seoScore ?? 0) - (b.seoScore ?? 0));

            // Paginate
            const paginatedPages = allPages.slice(offset, offset + limit);
            const totalPages = allPages.length;
            const currentPage = Math.floor(offset / limit) + 1;
            const totalPagesCount = Math.ceil(totalPages / limit);

            return {
              pages: paginatedPages,
              total: totalPages,
              limit,
              offset,
              currentPage,
              totalPagesCount,
              hasMore: offset + limit < totalPages
            };
          } catch (error) {
            if (error instanceof Error) throw error;
            ctx.log.error(`listPages error: ${String(error)}`);
            throw new Error("Failed to list pages");
          }
        }
      }
      ```
    </step>
    <step order="3">Update admin UI rendering (admin-ui.ts) to show pagination info:
      Add "Page X of Y" indicator
      Show total items: "Showing 1-50 of 234 pages"
    </step>
    <step order="4">Add pagination controls to admin UI:
      Previous/Next buttons
      Page number input
      Disable Previous on first page, disable Next on last page
    </step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes (add pagination tests)</check>
    <check type="manual">listPages returns max 50 items</check>
    <check type="manual">offset parameter works correctly</check>
    <check type="manual">Hard limit at 1,000 pages enforced</check>
    <check type="manual">Pagination metadata (currentPage, totalPages, hasMore) correct</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="getAllPages() must be fast before adding pagination" />
  </dependencies>

  <commit-message>feat(seodash): add cursor-based pagination (max 50 per view) per Decision #4

Without pagination, 500+ pages crashes browsers. Pagination is non-negotiable.

- listPages accepts limit (max 50) and offset parameters
- Hard limit: 1,000 total pages (search/filter required beyond that)
- Returns pagination metadata: currentPage, totalPages, hasMore
- Admin UI shows "Page X of Y" and "Showing 1-50 of N pages"
- Previous/Next buttons with disabled states

Refs: Decision #4, REQ-021, REQ-022, REQ-025

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="3">
  <title>Sort pages by SEO score (worst first)</title>
  <requirement>REQ-023, REQ-024</requirement>
  <description>
    Change listPages sorting from alphabetical to worst-first by SEO score.
    Decisions §122: "Worst pages ranked first." Open Question #4: "Sort by
    issue severity (missing OG > long title > short description)."
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts" reason="listPages handler (lines 410-425), computeSeoScore (lines 130-138)" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md" reason="Open Question #4 (line 241), Dashboard requirement (line 121-122)" />
  </context>

  <steps>
    <step order="1">Replace alphabetical sorting in listPages (line 416):
      Change from: pages.sort((a, b) => a.path.localeCompare(b.path));
      To: pages.sort((a, b) => (a.seoScore ?? 0) - (b.seoScore ?? 0)); // Ascending = worst first
    </step>
    <step order="2">Add explicit severity weighting to issue types (in auditPage or separate function):
      Create severity map:
      ```typescript
      const SEVERITY_WEIGHTS = {
        "title-missing": 100,    // Critical
        "desc-missing": 100,
        "og-image-missing": 90,  // High
        "title-short": 50,       // Medium
        "title-long": 50,
        "desc-short": 40,
        "desc-long": 40,
        "canonical-missing": 20, // Low
        "structured-data-missing": 20,
        "title-no-sitename": 10, // Info
        "desc-repeats-title": 30
      };
      ```
    </step>
    <step order="3">Optional: Add secondary sort by worst issue type:
      If two pages have same score, sort by highest severity issue
    </step>
    <step order="4">Update admin UI to highlight worst issues visually:
      Show worst issue type badge next to score
      Color-code by severity (red = critical, yellow = medium, blue = info)
    </step>
  </steps>

  <verification>
    <check type="build">npm run build succeeds</check>
    <check type="test">npm test passes</check>
    <check type="manual">listPages returns pages sorted worst-first (lowest seoScore first)</check>
    <check type="manual">Page with score 30 appears before page with score 80</check>
    <check type="manual">Admin UI shows worst pages at top of list</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Pagination must exist before adding sort logic" />
  </dependencies>

  <commit-message>feat(seodash): sort pages by SEO score worst-first per Decisions §122

Dashboard shows worst pages first so users fix critical issues immediately.
Severity ranking: missing OG > long title > short description.

- listPages sorts by seoScore ascending (worst = lowest score = top of list)
- Added explicit severity weighting for issue types
- Admin UI highlights worst issue type per page
- Color-coded badges: red (critical), yellow (medium), blue (info)

Refs: Decisions §122, Open Question #4, REQ-023, REQ-024

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

### Wave 4 (Parallel, after Wave 3) — Dashboard UI Completion

**Purpose:** Complete one-screen dashboard with quick links and disclaimer.

**Note:** Tasks 8-9 omitted for brevity in this summary. They would cover:
- **Task 8:** Integrate dashboard components into single-screen view
- **Task 9:** Add quick-fix edit links and disclaimer text

---

### Wave 5 (Parallel, after Wave 2) — Visual Social Previews

**Purpose:** Build visual Facebook/Twitter/Google card previews with live updates.

**Note:** Tasks 10-11 omitted for brevity. They would cover:
- **Task 10:** Create visual card rendering components (FB, Twitter, Google)
- **Task 11:** Implement live preview update mechanism

---

### Wave 6 (Sequential, after Waves 2-5) — Testing & Validation

**Purpose:** Deploy to Peak Dental, run load tests, validate outputs.

**Note:** Tasks 12-16 omitted for brevity. They would cover:
- **Task 12:** Deploy full plugin to Peak Dental
- **Task 13:** Load test with 1,000-page dataset
- **Task 14:** W3C XML validation for sitemap
- **Task 15:** Google Structured Data validation
- **Task 16:** Browser compatibility and UX flow testing

---

### Wave 7 (Parallel, after Wave 2) — Structured Data Templates

**Purpose:** Build Article template form with JSON-LD generation.

**Note:** Tasks 17-18 omitted for brevity. They would cover:
- **Task 17:** Create Article template form UI
- **Task 18:** Implement JSON-LD generator from form inputs

---

## Wave Summary

| Wave | Focus | Tasks | Dependencies | Estimated Duration |
|------|-------|-------|--------------|-------------------|
| Wave 0 | Pre-Flight (CRITICAL) | 1 | None (blocks all) | 2-3 hours |
| Wave 1 | Feature Cleanup | 3 | Wave 0 | 1-2 hours |
| Wave 2 | Storage Fixes | 2 | Wave 1 | 2-3 hours |
| Wave 3 | Pagination & Sorting | 2 | Wave 2 | 1-2 hours |
| Wave 4 | Dashboard UI | 2 | Wave 3 | 1-2 hours |
| Wave 5 | Visual Previews | 2 | Wave 2 | 2-3 hours |
| Wave 6 | Testing & Validation | 5 | Waves 2-5 | 2-3 hours |
| Wave 7 | Structured Data | 2 | Wave 2 | 1-2 hours |
| **TOTAL** | | **18 tasks** | | **12-20 hours** |

**Critical Path:** Wave 0 → Wave 1 → Wave 2 → (Wave 3 || Wave 5 || Wave 7) → Wave 4 → Wave 6

---

## Risk Notes

From Risk Scanner analysis:

1. **Wave 0 is BLOCKING** — Cannot skip pre-flight validation. If Emdash API differs from assumptions, entire architecture may need redesign.

2. **Feature Cleanup (Wave 1) is non-negotiable** — Violates locked product decisions. Must ship with scope cuts enforced.

3. **Denormalization (Wave 2) is performance-critical** — Without this fix, plugin fails at scale (>500 pages).

4. **Pagination (Wave 3) is quality gate** — Success Criteria §358 explicitly requires pagination before ship.

5. **Peak Dental validation (Wave 6) is mandatory** — Cannot claim "done" without real runtime testing.

---

## Success Criteria

From decisions.md "Success Criteria" (lines 350-376):

**Technical Validation (Gate Before Ship):**
- [ ] Runs on Peak Dental without errors
- [ ] KV bindings work as expected (read/write/delete)
- [ ] `getAllPages()` loads 500-page dataset in <500ms
- [ ] Sitemap generates valid XML (W3C validator passes)
- [ ] Structured data passes Google's testing tool
- [ ] Social preview cards render on all major browsers
- [ ] Pagination works (navigate 50+ pages without crash)

**User Experience Validation (Gate Before Ship):**
- [ ] Install → see dashboard in <30 seconds (zero config)
- [ ] Edit page → see live preview updates
- [ ] Fix issue → see red turn green
- [ ] Save page → sitemap updates (within 5 min or immediately)
- [ ] Delete page → removed from list and sitemap
- [ ] No console errors, no broken images, no 404s

**Quality Gates (Gate Before Ship):**
- [ ] All audit functions have unit tests ✅ (already done)
- [ ] Storage layer has integration tests ✅ (already done)
- [ ] Error messages follow "NPR at 6am" tone ✅ (already done)
- [ ] NO meta keywords field in UI or schema
- [ ] NO sitemap pattern overrides in UI
- [ ] NO robots.txt settings UI
- [ ] NO freeform structured data editor
- [ ] Article template ONLY for structured data

---

## Files Modified (Estimated)

| File | Changes | Lines Added/Modified |
|------|---------|---------------------|
| `/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts` | All waves | ~200 lines modified |
| `/home/agent/shipyard-ai/plugins/seodash/src/admin-ui.ts` | Waves 4-5 | ~100 lines modified |
| `/home/agent/shipyard-ai/plugins/seodash/src/astro/SocialPreview.astro` | Wave 5 | ~50 lines modified |
| `/home/agent/shipyard-ai/plugins/seodash/src/__tests__/sandbox-entry.test.ts` | Waves 1-3 | ~50 lines modified |
| **NEW:** `/home/agent/shipyard-ai/plugins/_test-plugin/` | Wave 0 | ~50 lines (minimal test plugin) |
| **NEW:** `/home/agent/shipyard-ai/.planning/emdash-api-validation.md` | Wave 0 | Documentation |

**Files NOT Modified:**
- No changes to package.json (zero new dependencies per REQ-025)
- No new top-level files or directories (except _test-plugin for validation)

---

## Final Alignment

**Elon (Performance):** "Fix the N+1 query, add pagination, ship. Taste tells you WHAT to build. Data tells you WHEN."

**Steve (Design):** "Visual previews matter. Users don't want JSON — they want to SEE. Build it right, then ship."

**Synthesis:** Build the 10% of features that deliver 90% of value WITH Steve's design quality. Ship in 2 days. Let usage data tell us what to add next.

---

**Generated by Great Minds Agency — Phase Planning (GSD-Style)**
**2026-04-14**
**Authority:** Phil Jackson, Zen Master
**Blueprint:** SEODash Locked Decisions (490 lines)
**Validation Gate:** Peak Dental deployment REQUIRED before claiming "done"
