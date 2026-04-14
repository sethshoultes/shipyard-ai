# SEODash Plugin Fix — Requirements Traceability

**Generated:** 2026-04-14
**Project:** github-issue-sethshoultes-shipyard-ai-34
**Source PRD:** `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-34.md`
**Source Decisions:** `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md`
**Source Documentation:** `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md`
**Existing Code:** `/home/agent/shipyard-ai/plugins/seodash/src/` (969 lines in sandbox-entry.ts)

---

## Executive Summary

The SEODash plugin is an existing Emdash CMS plugin providing comprehensive SEO management (title/description optimization, sitemaps, robots.txt, social previews, structured data). The plugin code exists but needs critical fixes before it can ship:

**Problems:**
1. **Architectural Mismatches** — Code doesn't fully align with Emdash plugin API expectations
2. **Feature Scope Violations** — Includes 4 features explicitly cut in product decisions (keywords, sitemap patterns, robots UI, freeform structured data)
3. **Missing V1 Requirements** — Pagination, visual social previews, proper dashboard UI, Article template system
4. **Untested Runtime** — Never deployed to Peak Dental (real Emdash instance)

**Status:** Code foundation is solid (audit engine, storage patterns, tests exist) but needs 8-15 hours of remediation before ship.

**Target:** Working v1 deployment to Peak Dental in 2 days after fixes completed.

---

## Requirements Traceability Matrix

### Legend
- ✅ **DONE** — Implemented correctly in current code
- ⚠️ **PARTIAL** — Partially implemented or needs validation
- ❌ **MISSING** — Not implemented
- ❌ **VIOLATES** — Violates locked decision (must remove)
- ⚠️ **BLOCKER** — Blocks all other work until resolved

---

## Wave 0: Pre-Flight Validation (CRITICAL BLOCKERS)

| ID | Requirement | Source | Status | Priority |
|----|-------------|--------|--------|----------|
| REQ-001 | Validate Emdash plugin API on Peak Dental with minimal test plugin | Risk #1 | ⚠️ BLOCKER | P0 |
| REQ-002 | Confirm `ctx.kv` works in sandboxed execution vs `ctx.storage` | Risk #2 | ⚠️ BLOCKER | P0 |
| REQ-003 | Verify custom content-type responses work for public routes (XML, plain text) | Risk Scanner | ⚠️ BLOCKER | P0 |
| REQ-004 | Determine if Block Kit is required for admin UI or if HTML strings work | EMDASH-GUIDE L1023 | ⚠️ BLOCKER | P0 |
| REQ-005 | Document actual Emdash plugin API patterns from test results | Risk #1 | ⚠️ BLOCKER | P0 |

**Acceptance:** Cannot proceed to Wave 1 until all P0 blockers resolved and documented.

---

## Wave 1: Feature Cleanup (Remove Scope Violations)

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-006 | Remove `keywords` field from PageSeoData interface | Decision #5 L48-53 | ❌ VIOLATES | No keywords in types, audit logic, or UI |
| REQ-007 | Remove keyword audit checks from auditPage() function | Decision #5 L48-53 | ❌ VIOLATES | Lines 118-120 deleted |
| REQ-008 | Remove keywords processing from savePage handler | Decision #5 L48-53 | ❌ VIOLATES | Line 345 deleted |
| REQ-009 | Remove sitemap pattern overrides from SitemapSettings | Decision #6 L55-60 | ❌ VIOLATES | Only defaultChangefreq and defaultPriority remain |
| REQ-010 | Remove pattern logic from generateSitemapXml() | Decision #6 L55-60 | ❌ VIOLATES | Lines 193-199 deleted |
| REQ-011 | Remove sitemapSettings handler (pattern configuration) | Decision #6 L55-60 | ❌ VIOLATES | Handler removed or simplified to defaults only |
| REQ-012 | Remove robotsSettings handler (make robots.txt immutable) | Decision #7 L62-67 | ❌ VIOLATES | Handler at lines 655-682 deleted |
| REQ-013 | Remove RobotsSettings rules configuration support | Decision #7 L62-67 | ❌ VIOLATES | Only static default template |

**Acceptance:** All cut features removed, zero references remain, tests still pass.

---

## Wave 2: Storage Architecture Fixes

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-014 | Fix getAllPages() N+1 bug by storing full page objects in list | Decision #3 Risk #3 | ⚠️ PARTIAL | `seo:pages:all` stores PageSeoData[], not hashes |
| REQ-015 | Denormalize page storage: one KV read returns all pages | Decision #3 L206-209 | ⚠️ PARTIAL | getAllPages() = single `ctx.kv.get("seo:pages:all")` |
| REQ-016 | Update savePage to maintain denormalized list on write | Storage fix | ❌ MISSING | Save updates both `seo:{hash}` AND full list |
| REQ-017 | Update deletePage to maintain denormalized list on delete | Storage fix | ❌ MISSING | Delete removes from both individual key and full list |
| REQ-018 | Add defensive handling for missing/corrupted `seo:pages:all` | Open Q #6 | ⚠️ PARTIAL | Initialize empty array, rebuild from individual keys if needed |
| REQ-019 | Implement sitemap cache invalidation on page save/delete | Decisions L140 Open Q #5 | ⚠️ UNCLEAR | Delete `seo:sitemap:xml` on write operations |
| REQ-020 | SHA-256 hash function with no truncation | Risk #10 | ✅ DONE | hashPath() uses full hash output |

**Acceptance:** Load test with 1,000 pages completes in <500ms, no N+1 queries.

---

## Wave 3: Pagination & Sorting

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-021 | Implement cursor-based pagination (max 50 items per view) | Decision #4 L41-46 | ❌ MISSING | listPages accepts limit/offset params |
| REQ-022 | Hard limit 1,000 total pages | Decision #4 L46 | ❌ MISSING | Returns error if page count exceeds 1,000 |
| REQ-023 | Sort pages by SEO score (worst first), not alphabetically | Decisions §122 Open Q #4 | ❌ WRONG | Line 416 sorts by `seoScore` ascending |
| REQ-024 | Severity ranking: missing OG > long title > short description | Open Q #4 | ⚠️ IMPLICIT | Issue types have explicit severity weights |
| REQ-025 | Dashboard shows "Page X of Y" indicator | Gap identified | ❌ MISSING | Pagination UI includes current page/total |

**Acceptance:** Admin list shows worst 50 pages first, pagination works, no browser crashes at 500+ pages.

---

## Wave 4: Dashboard UI Completion

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-026 | One-screen dashboard overview (no tabs, no wizards) | Decisions §120-124 | ⚠️ PARTIAL | Single dashboard page at `/admin/seodash/dashboard` |
| REQ-027 | Worst pages ranked list with issue severity display | Decisions §121 | ⚠️ PARTIAL | Shows score + top issue per page |
| REQ-028 | Quick-fix links to edit pages (click → edit) | Decisions §122 | ❌ MISSING | Each page row has "Edit" button |
| REQ-029 | Overall site health score with visual progress bar | Decisions §123 | ⚠️ PARTIAL | Progress bar shows average score visually |
| REQ-030 | Zero configuration required (<30 sec to value) | Decisions §124 | ✅ DONE | No setup wizard, immediate data |
| REQ-031 | Disclaimer: "Green = technically optimized, not rankings" | Risk #9 L324-326 | ❌ MISSING | Dashboard includes disclaimer text |

**Acceptance:** Dashboard loads in <30 seconds, shows all key metrics on one screen, clear action paths.

---

## Wave 5: Visual Social Previews

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-032 | Facebook card HTML/CSS visual replica (not just meta tags) | Decision #1 L20-25 | ⚠️ META ONLY | Rendered visual card showing how FB will display |
| REQ-033 | Twitter card HTML/CSS visual replica | Decision #1 L20-25 | ⚠️ META ONLY | Rendered visual card for Twitter |
| REQ-034 | Google search snippet HTML/CSS replica | Decision #1 L20-25 | ⚠️ META ONLY | Blue title, green URL, gray description |
| REQ-035 | Live preview updates as user types in editor | Decisions §132 | ❌ MISSING | Real-time update on title/description change |
| REQ-036 | Side-by-side preview view on page edit screen | Decisions §132 | ❌ MISSING | Edit form left, previews right |
| REQ-037 | Disclaimer: "Preview may differ slightly from actual platform" | Risk #4 L291-293 | ❌ MISSING | Note below previews |
| REQ-038 | Use 2026 platform specs for rendering accuracy | Risk #4 L293 | ⚠️ PARTIAL | Document spec versions used |

**Acceptance:** Users see visual cards that match Facebook/Twitter/Google appearance, updates happen live.

---

## Wave 6: Testing & Validation

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-039 | Deploy minimal test plugin to Peak Dental (from Wave 0) | Success §352 | ❌ MISSING | Plugin loads, routes work, KV accessible |
| REQ-040 | Deploy full SEODash plugin to Peak Dental | Success §352 | ❌ MISSING | All routes work without errors |
| REQ-041 | Load test with 1,000-page mock dataset | Risk #2 Success §354 | ❌ MISSING | getAllPages() <500ms, list view renders |
| REQ-042 | Validate sitemap XML with W3C validator | Success §355 | ⚠️ UNTESTED | XML passes W3C validation |
| REQ-043 | Validate structured data with Google's testing tool | Success §356 Risk #5 | ⚠️ UNTESTED | JSON-LD passes Google validation |
| REQ-044 | Test social previews on all major browsers | Success §357 | ❌ MISSING | Chrome, Firefox, Safari, Edge render correctly |
| REQ-045 | Verify no console errors, broken images, or 404s | Success §367 | ⚠️ UNTESTED | Clean console on all admin pages |
| REQ-046 | Test UX flow: install → dashboard in <30 seconds | Success §362 | ❌ MISSING | Timed test with fresh install |
| REQ-047 | Test UX flow: edit page → live preview updates | Success §363 | ❌ MISSING | Type in field, preview changes immediately |
| REQ-048 | Test UX flow: fix issue → red turns green | Success §364 | ❌ MISSING | Save with fixed issue, score improves |
| REQ-049 | Test UX flow: save page → sitemap updates | Success §365 | ⚠️ UNCLEAR | Sitemap XML includes new page |
| REQ-050 | Test UX flow: delete page → removed from list and sitemap | Success §366 | ⚠️ UNCLEAR | Page gone from both admin and sitemap |

**Acceptance:** All tests pass, Peak Dental deployment confirmed working, zero critical errors.

---

## Wave 7: Structured Data Templates

| ID | Requirement | Source | Current Status | Acceptance Criteria |
|----|-------------|--------|----------------|---------------------|
| REQ-051 | Article JSON-LD template ONLY (no LocalBusiness/Product) | Decision #8 L69-74 | ❌ FREEFORM | Only Article template available |
| REQ-052 | Form fields: headline, datePublished, author, image | Decisions §148-150 | ❌ MISSING | Admin UI has 4 form fields |
| REQ-053 | Generate valid JSON-LD from form inputs (no freeform textarea) | Decision #8 L71-73 | ❌ VIOLATES | Template generator function |
| REQ-054 | Escape all user inputs to prevent injection | Risk #5 | ⚠️ PARTIAL | JSON.stringify() with proper escaping |
| REQ-055 | Add schema version comments in JSON-LD output | Risk #5 L299 | ❌ MISSING | Output includes @type and @context |
| REQ-056 | Validate template output against Google's tool before ship | Risk #5 Success §356 | ⚠️ UNTESTED | Manual validation with Google tool |

**Acceptance:** Article template generates valid Schema.org JSON-LD, passes Google validation, no freeform editor.

---

## Non-Functional Requirements

### SEO Audit Engine (Already Implemented ✅)

| ID | Requirement | Source | Current Status |
|----|-------------|--------|----------------|
| REQ-057 | Title length validation (red <30, yellow >60, green 50-60) | Decisions §102 | ✅ DONE |
| REQ-058 | Description length validation (red <120, yellow >160, green 150-160) | Decisions §102 | ✅ DONE |
| REQ-059 | OG image validation (exists, accessible, permissive) | Decisions §102 | ✅ DONE |
| REQ-060 | Missing field detection (title, description, OG image) | Decisions §102 | ✅ DONE |
| REQ-061 | Red/yellow/green scoring system (NOT 0-100 vanity metrics) | Decision #2 | ✅ DONE |
| REQ-062 | "NPR at 6am" error message tone (helpful, concise, educational) | Decisions §371 | ✅ DONE |

### XML Sitemap (Mostly Implemented ✅)

| ID | Requirement | Source | Current Status |
|----|-------------|--------|----------------|
| REQ-063 | Auto-generate sitemap from all published pages (exclude noindex) | Decisions §135 | ✅ DONE |
| REQ-064 | Flat list structure (NO pattern overrides after cleanup) | Decision #6 | ❌ VIOLATES → Wave 1 |
| REQ-065 | Static defaults: changefreq=monthly, priority=0.5 | Decisions §137-138 | ✅ DONE |
| REQ-066 | Served at `/sitemap.xml` public route | Decisions §139 | ✅ DONE |
| REQ-067 | Monitor size (alert if >5MB, compress if needed) | Risk #3 L282-285 | ❌ MISSING |

### Robots.txt (Implemented but needs UI removal ⚠️)

| ID | Requirement | Source | Current Status |
|----|-------------|--------|----------------|
| REQ-068 | Auto-generated with battle-tested default | Decisions §142 | ✅ DONE |
| REQ-069 | Allow all bots, reference sitemap | Decisions §143 | ✅ DONE |
| REQ-070 | NO admin UI (static immutable default only) | Decision #7 | ❌ VIOLATES → Wave 1 |
| REQ-071 | Validate default against Google's robots.txt validator | Risk #12 L342-345 | ⚠️ UNTESTED |

### Quality Gates (Enforcement Rules)

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-072 | NO meta keywords field anywhere in code | Success §372 | All keywords references removed (Wave 1) |
| REQ-073 | NO sitemap pattern overrides UI or logic | Success §373 | All pattern logic removed (Wave 1) |
| REQ-074 | NO robots.txt settings UI | Success §374 | robotsSettings handler removed (Wave 1) |
| REQ-075 | NO freeform structured data editor | Success §375 | Only Article template form (Wave 7) |
| REQ-076 | Article template ONLY (no LocalBusiness/Product in v1) | Success §376 | Only one template exists (Wave 7) |

---

## Requirements Summary by Status

| Status | Count | % of Total |
|--------|-------|-----------|
| ✅ DONE | 18 | 24% |
| ⚠️ PARTIAL | 18 | 24% |
| ❌ MISSING | 30 | 39% |
| ❌ VIOLATES | 8 | 11% |
| ⚠️ BLOCKER | 5 | 7% |
| **TOTAL** | **76** | **100%** |

---

## Critical Path to Ship

```
┌─────────────────────────────────────────────────────────────┐
│ Wave 0: Pre-Flight (BLOCKING — cannot skip)                 │
│ - Validate Emdash API on Peak Dental                        │
│ - Confirm ctx.kv vs ctx.storage pattern                     │
│ - Verify admin UI approach (Block Kit vs HTML)              │
│ └─────────────────────────────────────┬────────────────────┘
│                                        ▼
│ Wave 1: Feature Cleanup (Remove scope violations)
│ - Delete keywords, sitemap patterns, robots UI
│ └─────────────────────────────────────┬────────────────────┘
│                                        ▼
│ Wave 2: Storage Architecture
│ - Fix getAllPages() denormalization
│ - Cache invalidation
│ └─────────────────────────────────────┬────────────────────┘
│                                        ▼
│ ┌──────────────────────────┐   ┌──────────────────────────┐
│ │ Wave 3: Pagination       │   │ Wave 5: Visual Previews  │
│ │ - Cursor pagination      │   │ - FB/Twitter/Google cards│
│ │ - Worst-first sorting    │   │ - Live update mechanism  │
│ └──────────┬───────────────┘   └────────┬─────────────────┘
│            │                              │
│            └──────────────┬───────────────┘
│                           ▼
│ ┌─────────────────────────────────────────────────────────┐
│ │ Wave 4: Dashboard UI + Wave 7: Structured Data          │
│ │ - One-screen dashboard - Quick links - Disclaimer       │
│ │ - Article template form - JSON-LD generation            │
│ └──────────────────────────┬──────────────────────────────┘
│                             ▼
│ ┌─────────────────────────────────────────────────────────┐
│ │ Wave 6: Testing & Validation                            │
│ │ - Peak Dental deploy - Load tests - Browser tests       │
│ │ - W3C XML validation - Google JSON-LD validation        │
│ │ - UX flow testing - Zero errors verification            │
│ └─────────────────────────────────────────────────────────┘
│                             ▼
│                   ✅ SHIP TO PRODUCTION
└─────────────────────────────────────────────────────────────┘
```

**Estimated Timeline:** 8-15 hours of focused development work after blockers resolved.

---

## References

### Source Documents
- **PRD:** `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-34.md`
- **Decisions Blueprint:** `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-34/decisions.md` (490 lines, Phil Jackson)
- **Emdash Guide:** `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (1,754 lines, comprehensive plugin system docs)

### Existing Codebase
- **Main Entry:** `/home/agent/shipyard-ai/plugins/seodash/src/index.ts` (37 lines, plugin descriptor)
- **Runtime Logic:** `/home/agent/shipyard-ai/plugins/seodash/src/sandbox-entry.ts` (796 lines, definePlugin with 16 routes)
- **Admin UI:** `/home/agent/shipyard-ai/plugins/seodash/src/admin-ui.ts` (487 lines, HTML rendering)
- **Astro Components:** `/home/agent/shipyard-ai/plugins/seodash/src/astro/SeoHead.astro`, `SocialPreview.astro`
- **Tests:** `/home/agent/shipyard-ai/plugins/seodash/src/__tests__/sandbox-entry.test.ts` (797 lines, 45+ test cases)

### Risk Analysis
- **Codebase Scout Report:** Agent a4f3b0f — Complete file tree and capabilities analysis
- **Requirements Analyst Report:** Agent a467392 — 62 atomic requirements extracted
- **Risk Scanner Report:** Agent a221484 — 12 risks identified (3 critical, 3 high, 3 medium, 3 low)

---

**Document Authority:** Phil Jackson, Zen Master — Great Minds Agency
**Build Blueprint:** SEODash Locked Decisions (2 days to V1 ship)
**Validation Gate:** Peak Dental deployment required before claiming "done"
**Final Arbiter:** "Ship simple, iterate with data" (Steve + Elon consensus)
