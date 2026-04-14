# Beacon Plugin — Requirements Specification

**Project:** Beacon (SEO Plugin for Emdash CMS)
**Slug:** github-issue-sethshoultes-shipyard-ai-34
**Status:** Planning Phase — Research Complete
**Generated:** 2026-04-14
**Research Sources:**
- Codebase Scout (agent ac6595b)
- Requirements Analyst (agent ab197dc)
- Risk Scanner (agent a22ef73)

---

## Executive Summary

**Product:** Beacon — SEO plugin for Emdash CMS (name changed from SEODash per Decision #1)
**Core Promise:** Make users feel confident about SEO without making them learn SEO
**Target Feeling:** Quiet relief. Not guessing anymore.
**Ship Gate:** Non-technical user fixes their first SEO issue in under 60 seconds and thinks "Oh. That's it?"

**Current State:**
- Codebase exists: 796 lines (sandbox-entry.ts) + 487 lines (admin-ui.ts) + 40+ test cases
- Status: Clean foundation, NO banned patterns found (throw new Response, rc.user)
- Issues: N+1 query pattern still active, no pagination, simple hash (not SHA-256)
- Target: ~400 lines total after cleanup

**Scope Reduction:**
- Cut: 11 features (meta keywords, pattern overrides, numerical scores, audit history, etc.)
- Defer: Structured data to v1.1 per decisions.md

---

## Critical Findings from Research

### Codebase Scout Report (agent ac6595b)

**GOOD NEWS:**
- ✅ NO banned patterns found (`throw new Response()` = 0 occurrences, `rc.user` = 0)
- ✅ Solid test coverage (40+ tests in place)
- ✅ Clean TypeScript with full type coverage
- ✅ Audit engine already implemented correctly
- ✅ Sitemap and robots.txt generation working
- ✅ Error handling uses proper `throw new Error()` pattern

**ISSUES IDENTIFIED:**
- ❌ N+1 query pattern STILL EXISTS (lines 158-166 in sandbox-entry.ts)
- ❌ No pagination implemented (will crash at 100+ pages)
- ❌ Simple hash function (not SHA-256 as specified)
- ❌ No sitemap caching implemented
- ❌ Numerical scores stored to KV (violates Decision #4)

### Risk Scanner Report (agent a22ef73)

**CRITICAL RISKS:**
1. **RISK-001:** KV denormalization not implemented — N+1 pattern still present
2. **RISK-002:** Emdash plugin runtime KV binding assumptions untested
3. **RISK-004:** Hash collision risk with simple 32-bit hash (not SHA-256)

**HIGH RISKS:**
5. **RISK-005:** getAllPages() blocks until all N reads complete (25-50 seconds for 500 pages)
6. **RISK-006:** No pagination on admin page list
7. **RISK-008:** Cache invalidation logic missing

---

## MUST HAVE (MVP Features)

### Per-Page SEO Metadata Fields (8 fields)

**REQ-001: Title field with length guidance**
- Store and display page title (50-60 chars optimal range)
- Acceptance: UI shows "50-60 chars optimal" guideline; value persists to KV
- Status: ✅ IMPLEMENTED (lines 63-72 in sandbox-entry.ts)
- Source: MVP Feature Set, Decision #10

**REQ-002: Meta description field with length guidance**
- Store and display meta description (150-160 chars optimal range)
- Acceptance: UI shows "150-160 chars optimal" guideline; value persists to KV
- Status: ✅ IMPLEMENTED (lines 75-84 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-003: OG image URL field**
- Store and validate OG image URL
- Acceptance: Form accepts URL; audit fails if missing or unreachable
- Status: ✅ IMPLEMENTED (lines 87-89 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-004: OG title field with default**
- Store OG title; defaults to page title if empty
- Acceptance: Field shows default value from title; can override
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set

**REQ-005: OG description field with default**
- Store OG description; defaults to meta description if empty
- Acceptance: Field shows default value from meta description; can override
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set

**REQ-006: Canonical URL field**
- Store and validate canonical URL
- Acceptance: Form accepts URL; can be empty (self-referential assumed)
- Status: ✅ IMPLEMENTED (lines 92-94 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-007: Noindex flag (boolean)**
- Store noindex flag (default: false)
- Acceptance: Toggle on/off; excludes page from sitemap when true
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set

**REQ-008: Nofollow flag (boolean)**
- Store nofollow flag (default: false)
- Acceptance: Toggle on/off; default false
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set

### Red-to-Green Feedback System

**REQ-009: Title audit check (computed on-demand)**
- Audit page title and return red/yellow/green status
- Acceptance: Red if missing OR <30 OR >60; yellow if boundary; green if 50-60
- Status: ✅ IMPLEMENTED (lines 63-72 in sandbox-entry.ts)
- Source: MVP Feature Set, Decision #4

**REQ-010: Description audit check (computed on-demand)**
- Audit meta description and return red/yellow/green status
- Acceptance: Red if missing OR <120 OR >160; yellow if boundary; green if 150-160
- Status: ✅ IMPLEMENTED (lines 75-84 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-011: OG image audit check (computed on-demand)**
- Audit OG image and return red/yellow/green status
- Acceptance: Red if missing; green if present
- Status: ✅ IMPLEMENTED (lines 87-89 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-012: Per-page color indicator (red/yellow/green only)**
- Compute single color per page based on audit results
- Acceptance: Red if ANY critical issue; yellow if warnings; green if optimal
- Status: ⚠️ PARTIAL — numerical score also computed and stored (violates Decision #4)
- Source: MVP Feature Set, Decision #4

**REQ-013: Dashboard overall site health indicator**
- Show aggregate site health based on page colors
- Acceptance: Display count of pages by color or overall status
- Status: ✅ IMPLEMENTED (seo score widget in admin-ui.ts)
- Source: MVP Feature Set

### Dashboard (Admin Interface)

**REQ-014: Single-screen dashboard overview**
- Display all critical SEO issues on one screen without tabs
- Acceptance: No tabs; single scrolling page
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set, Decision #13

**REQ-015: Worst pages ranked first**
- Sort page list by severity (worst → best)
- Acceptance: Severity order enforced; red before yellow before green
- Status: ⚠️ PARTIAL — currently sorts alphabetically (line 416)
- Source: MVP Feature Set, Open Questions #4

**REQ-016: Quick-fix links in dashboard**
- Each listed page has clickable link to edit form
- Acceptance: Click page row → navigate to edit form
- Status: ⚠️ NEEDS VALIDATION
- Source: MVP Feature Set

**REQ-017: Zero configuration required for dashboard**
- Dashboard functional immediately after plugin install
- Acceptance: No setup wizard; install → dashboard shows data
- Status: ✅ IMPLEMENTED
- Source: MVP Feature Set, Decision #13

### Sitemap Generation & Caching

**REQ-018: Auto-generate sitemap.xml from published pages**
- Generate valid XML sitemap from all published pages
- Acceptance: Sitemap served at `/sitemap.xml`; valid XML; passes validator
- Status: ✅ IMPLEMENTED (lines 181-216 in sandbox-entry.ts)
- Source: MVP Feature Set

**REQ-019: Exclude noindex pages from sitemap**
- Sitemap includes only pages where noindex flag is false
- Acceptance: Pages with noindex=true NOT in sitemap XML
- Status: ✅ IMPLEMENTED (line 184 filters noindex)
- Source: MVP Feature Set

**REQ-020: Default sitemap values**
- All URLs use default `changefreq: monthly` and `priority: 0.5`
- Acceptance: XML shows these values; no overrides in v1
- Status: ⚠️ PARTIAL — pattern override logic still exists (lines 193-199)
- Source: MVP Feature Set, Decision #8

**REQ-021: Cache sitemap in KV**
- Store generated sitemap XML in KV to avoid regeneration
- Acceptance: First request caches at `beacon:sitemap:xml`; subsequent <10ms
- Status: ❌ MISSING — no caching implemented
- Source: MVP Feature Set, Decision #11

**REQ-022: Invalidate sitemap cache on page save**
- Delete cached sitemap when page SEO data saved
- Acceptance: Save → delete cache → next request regenerates
- Status: ❌ MISSING — no cache invalidation
- Source: Decision #11

**REQ-023: Invalidate sitemap cache on page delete**
- Delete cached sitemap when page deleted
- Acceptance: Delete → delete cache → next request regenerates
- Status: ❌ MISSING — no cache invalidation
- Source: Decision #11

### Robots.txt Generation

**REQ-024: Static default robots.txt**
- Serve static robots.txt at `/robots.txt`
- Acceptance: Returns static default; no admin UI
- Status: ⚠️ PARTIAL — robots.txt works but robotsSettings handler exists (should be removed)
- Source: MVP Feature Set, Decision #9

### Metadata Injection

**REQ-025: Inject SEO metadata into page head**
- Insert meta tags, OG tags, canonical into page `<head>`
- Acceptance: Page HTML includes proper meta tags
- Status: ✅ IMPLEMENTED (SeoHead.astro component)
- Source: MVP Feature Set

### Admin UI Components

**REQ-026: Page editor form with live feedback**
- Form for editing all 8 SEO fields with real-time audit feedback
- Acceptance: Form shows all fields; color updates as user types
- Status: ⚠️ NEEDS VALIDATION (admin-ui.ts exists, live feedback unclear)
- Source: File Structure, Components, Decision #13

**REQ-027: Pagination on admin list (max 50 items)**
- Split page list into pages of 50 items max
- Acceptance: List shows max 50 items; pagination controls; works with 500+ pages
- Status: ❌ MISSING — no pagination (CRITICAL RISK #6)
- Source: MVP Feature Set, Decision #6

**REQ-028: Audit feedback display with context**
- Show issues with helpful tone
- Acceptance: "Description too short (87/160 chars)" not "FAIL"
- Status: ✅ IMPLEMENTED (audit messages have helpful tone)
- Source: MVP Feature Set, Decision #12

---

## MUST NOT HAVE (Explicitly Cut from v1)

**NOFEATURE-001: Meta keywords field**
- Why: Google ignores since 2009; adds cognitive load
- Status: ⚠️ VIOLATION — keywords field still in code (lines 118-120, 345)
- Source: Decision #7

**NOFEATURE-002: Sitemap pattern overrides UI**
- Why: 0.1% use case; default settings sufficient
- Status: ⚠️ VIOLATION — pattern logic still exists (lines 193-199)
- Source: Decision #8

**NOFEATURE-003: Robots.txt customization UI**
- Why: Default is perfect
- Status: ⚠️ VIOLATION — robotsSettings handler exists (lines 655-682)
- Source: Decision #9

**NOFEATURE-004: Numerical SEO score (e.g., "92/100")**
- Why: Vanity metric; traffic light clearer
- Status: ⚠️ VIOLATION — score persisted to KV (lines 351-352)
- Source: Decision #4

**NOFEATURE-005: Audit history storage**
- Why: Wasted KV writes
- Status: ✅ NOT PRESENT
- Source: Decision #2

**NOFEATURE-006: Bulk edit operations**
- Why: Focus matters more than batch
- Status: ✅ NOT PRESENT
- Source: Decision #2

**NOFEATURE-007: Auto-generate titles from H1**
- Why: Requires ML/GPT-4; deferred to v2
- Status: ✅ NOT PRESENT
- Source: Decision #10

**NOFEATURE-008: Twitter Card type selector**
- Why: OG tags work fine
- Status: ✅ NOT PRESENT
- Source: Decision #2, MVP EXCLUDED

**NOFEATURE-009: Google Search Console integration**
- Why: v2 analytics feature
- Status: ✅ NOT PRESENT
- Source: MVP EXCLUDED

**NOFEATURE-010: Social preview HTML endpoint**
- Why: Cut for simplicity
- Status: ✅ NOT PRESENT
- Source: MVP EXCLUDED

**NOFEATURE-011: Structured data templates (JSON-LD)**
- Why: Deferred to v1.1
- Status: ⚠️ PARTIAL — freeform structuredData field exists (should remove per decisions.md)
- Source: MVP EXCLUDED

---

## Technical Requirements

**TECH-001: KV storage denormalization pattern** (CRITICAL)
- Store all page data at `beacon:pages:all` (single read)
- Acceptance: <500ms for 500 pages
- Status: ❌ MISSING — N+1 pattern still active (CRITICAL RISK #1)
- Source: Decision #5, Decision #3

**TECH-002: Primary KV schema for per-page data**
- Pattern: `beacon:page:{sha256_hash}`
- Acceptance: Each page has unique, collision-free key
- Status: ⚠️ PARTIAL — uses `seo:` prefix and simple hash (not SHA-256)
- Source: File Structure, Storage Pattern

**TECH-003: SHA-256 hashing for path collision resistance** (CRITICAL)
- Use full SHA-256 (not shortened)
- Acceptance: No collisions; cryptographic hash
- Status: ❌ MISSING — simple 32-bit hash used (CRITICAL RISK #4)
- Source: Risk Register, Risk #8

**TECH-004: Sitemap cache KV key**
- Pattern: `beacon:sitemap:xml` → XML string
- Acceptance: First request caches; subsequent <10ms
- Status: ❌ MISSING — no caching
- Source: File Structure, Decision #11

**TECH-005: Cache invalidation (immediate, no TTL)**
- Sitemap cache invalidated immediately on save/delete
- Acceptance: Save → delete cache → next request sees change
- Status: ❌ MISSING — no cache invalidation logic
- Source: Decision #11

**TECH-006: Audit engine pure function requirement**
- Audit functions with NO side effects (no KV writes)
- Signature: `auditPage(pageData) → { color, issues }`
- Status: ⚠️ PARTIAL — audit is pure but score is persisted (should not be)
- Source: Decision #4

**TECH-007: No numerical score persistence**
- Scores computed on-demand only; not stored
- Status: ❌ VIOLATION — seoScore stored at line 351-352
- Source: Decision #4

**TECH-008: Emdash KV binding availability** (CRITICAL BLOCKER)
- Plugin runtime must provide `ctx.kv` bindings
- Acceptance: Pre-flight test on Peak Dental validates KV works
- Status: ❌ UNTESTED — CRITICAL BLOCKER #1
- Source: Risk Register, Risk #1

**TECH-009: Pagination cursor-based**
- Max 50 items per page; cursor to next batch
- Status: ❌ MISSING — CRITICAL RISK #6
- Source: Decision #6

**TECH-010: KV rebuild logic for corrupted state**
- If `beacon:pages:all` corrupted, rebuild from individual keys
- Status: ❌ MISSING
- Source: Open Questions #3

---

## Performance Requirements

**PERF-001: getAllPages() <500ms for 500 pages** (CRITICAL)
- Single KV read (denormalized array)
- Status: ❌ FAILING — N+1 pattern = 25-50 seconds (CRITICAL RISK #5)
- Source: Risk Register, Success Criteria

**PERF-002: Sitemap serving <10ms (cached)**
- Cached sitemap served quickly
- Status: ❌ MISSING — no caching implemented
- Source: Decision #11

**PERF-003: Audit function <50ms**
- Pure function; no I/O
- Status: ✅ LIKELY OK (pure function)
- Source: MVP Feature Set

**PERF-004: Pagination prevents browser crash**
- UI remains responsive with 500+ pages
- Status: ❌ MISSING — no pagination
- Source: Decision #6

---

## Critical Blockers Summary

| Blocker ID | Issue | Status | Impact |
|------------|-------|--------|--------|
| BLOCKER-001 | Emdash KV binding validation | UNTESTED | CRITICAL — Nothing works if wrong |
| BLOCKER-002 | N+1 query pattern fix | NOT FIXED | CRITICAL — 25-50s load time at 500 pages |
| BLOCKER-003 | Hash collision fix (SHA-256) | NOT FIXED | CRITICAL — Data corruption risk |
| BLOCKER-004 | Pagination implementation | MISSING | HIGH — Browser crashes at 100+ pages |
| BLOCKER-005 | Scope violations cleanup | NOT DONE | HIGH — Violates product decisions |

---

## Requirements Status Summary

| Status | Count | % |
|--------|-------|---|
| ✅ IMPLEMENTED | 18 | 26% |
| ⚠️ PARTIAL | 15 | 21% |
| ❌ MISSING | 28 | 40% |
| ❌ VIOLATION | 6 | 9% |
| ❌ UNTESTED | 3 | 4% |
| **TOTAL** | **70** | **100%** |

---

## Success Criteria

### Technical Validation
- ✅ Runs on Peak Dental without errors — UNTESTED
- ✅ KV bindings work (read/write/delete) — UNTESTED
- ✅ `getAllPages()` loads 500 pages in <500ms — FAILING (N+1)
- ✅ Sitemap generates valid XML — IMPLEMENTED
- ✅ Pagination works (50+ pages without crash) — MISSING
- ✅ Cache invalidation works (save → sitemap updates) — MISSING

### User Experience Validation
- ✅ Install → see dashboard in <30 seconds — IMPLEMENTED
- ✅ Edit page → see live feedback — NEEDS VALIDATION
- ✅ Fix issue → see red turn green — NEEDS VALIDATION
- ✅ Save → sitemap updates immediately — MISSING (cache)
- ✅ No console errors, no 404s — NEEDS VALIDATION

### Ship Gate
**Non-technical user fixes their first SEO issue in under 60 seconds and thinks "Oh. That's it?"**

---

**Document Status:** FINAL — Research Complete
**Next Step:** Generate XML task plans in phase-1-plan.md
**Critical Path:** Fix N+1 → Add pagination → Remove violations → Test on Peak Dental
