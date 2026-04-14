# SEODash: Locked Decisions Blueprint

**Build Phase Authority Document**
*Compiled by Phil Jackson from Great Minds Agency debates*

---

## Executive Summary

**Product:** SEODash — WordPress SEO plugin for Emdash CMS
**Core Promise:** Make SEO visible without becoming a distraction. Show what's wrong, show how to fix it.
**Target Feeling:** Quiet confidence. Not guessing. Fix → save → done.
**Timeline:** 2 days to ship v1
**Test Gate:** Must work on Peak Dental (real Emdash instance) before claiming "done"

---

## Decision Log: Who Proposed, Who Won, Why

### Decision #1: Visual Social Previews (Facebook, Twitter, Google Cards)
- **Proposed by:** Steve Jobs (Round 1, reinforced Round 2)
- **Challenged by:** Elon Musk (Round 2 — "pixel-perfect replicas are maintenance burden")
- **Winner:** **Steve** (with constraints)
- **Rationale:** This is the core UX differentiator. Users don't want JSON — they want to SEE what others will see. "What You See Is What You Get" is the product's soul.
- **Implementation constraint:** Build simple HTML/CSS replicas, not iframe embeds. Accept minor rendering differences. Update when platforms break us, not on every tweak.

### Decision #2: Red-to-Green Audit Feedback
- **Proposed by:** Steve Jobs (Round 1 — "the emotional hook")
- **Challenged by:** Elon Musk (Round 2 — "dopamine dispenser, not real SEO")
- **Winner:** **Steve**
- **Rationale:** Both agreed it works psychologically. Elon's concern about misleading users is valid but solvable — green means "technically correct," not "will rank #1." Add disclaimer in UI.
- **Implementation:** Traffic light system (red/yellow/green) per page and per issue. Visual progress bar on dashboard.

### Decision #3: Fix getAllPages() N+1 Query Bug
- **Proposed by:** Elon Musk (Round 1 — identified bottleneck)
- **Challenged by:** Steve Jobs (Round 2 — "premature optimization")
- **Winner:** **Elon**
- **Rationale:** Steve conceded in Round 2 ("I completely missed this"). At 500+ pages, UI becomes unusable. Fix is simple (denormalize to single KV array), impact is massive.
- **Implementation:** Store full page list as JSON array in `seo:pages:list`. One read instead of N reads. O(1) vs O(n).

### Decision #4: Pagination on Admin List View
- **Proposed by:** Elon Musk (Round 1)
- **Accepted by:** Steve Jobs (Round 2 — "Pagination is non-negotiable")
- **Winner:** **Elon** (unanimous)
- **Rationale:** Without pagination, 500+ pages crashes browsers. Not theoretical — structural requirement.
- **Implementation:** Cursor pagination, max 50 pages per view. Hard limit 1,000 until search/filter added.

### Decision #5: Cut Meta Keywords Field
- **Proposed by:** Elon Musk (Round 1 — "ignored by Google since 2009")
- **Accepted by:** Steve Jobs (Round 2 — "Every unused field is a question mark")
- **Winner:** **Elon** (unanimous)
- **Rationale:** SEO theater. Adds cognitive load with zero value. "Completeness" doesn't mean shipping dead features.
- **Implementation:** Remove field from schema, UI, audit logic entirely.

### Decision #6: Cut Sitemap Pattern Overrides
- **Proposed by:** Elon Musk (Round 1 — "0.1% use case, 40 lines of code")
- **Challenged by:** Steve Jobs (Round 2 — wanted data, not assumptions)
- **Winner:** **Elon** (with monitoring clause)
- **Rationale:** Steve's compromise: "Ship without it. If even ONE user asks in first month, add it back."
- **Implementation:** Default `changefreq: monthly` for all URLs. No UI for per-path overrides. Track feature requests.

### Decision #7: Robots.txt Settings UI
- **Proposed cut by:** Elon Musk (Round 1 — "default is perfect, power users can edit manually")
- **Challenged by:** Steve Jobs (Round 2 — "UI prevents catastrophic mistakes")
- **Winner:** **Elon** (narrow victory)
- **Rationale:** Steve's concern is valid (users break robots.txt), but solution is better defaults + docs, not UI. V1 ships with sensible static default. V2 adds UI if users request it.
- **Implementation:** Generate default robots.txt automatically. No admin UI in v1.

### Decision #8: Structured Data Handling
- **Proposed cut by:** Elon Musk (Round 1 — "users paste broken JSON-LD, site breaks")
- **Counter-proposal by:** Steve Jobs (Round 2 — "Don't cut it, constrain it")
- **Winner:** **Steve** (with Elon's constraints)
- **Rationale:** Rich snippets drive clicks, but freeform editor is dangerous. Compromise: ship with 3 templates (Article, LocalBusiness, Product) with form fields that generate valid JSON-LD. No freeform textarea.
- **Implementation:** V1 ships with Article template only. LocalBusiness + Product in v1.1 if users request.

### Decision #9: Social Preview Endpoint
- **Proposed cut by:** Elon Musk (Round 1 — "redundant with getPagePublic")
- **Defended by:** Steve Jobs (Round 2 — "users don't want JSON, they want to SEE")
- **Winner:** **Steve**
- **Rationale:** Endpoint renders visual artifacts (HTML cards), not raw data. This is "empathy, not redundancy." Core to WYSIWYG promise.
- **Implementation:** Keep `/seodash/socialPreview` endpoint. Returns rendered HTML for Facebook/Twitter/Google cards.

### Decision #10: "NPR at 6am" Brand Voice
- **Proposed by:** Steve Jobs (Round 1 — "calm, confident, always teaching")
- **Challenged by:** Elon Musk (Round 2 — "3x longer to write, test, internationalize")
- **Winner:** **Steve** (with efficiency constraint)
- **Rationale:** Tone matters in error messages — small business owners feel stupid, most SEO tools confirm it. But Elon's right that verbosity kills. Compromise: helpful tone, concise words.
- **Implementation:** "Description too short (87/160 chars)" not "FAIL". Add context links: "Why does this matter?" → docs.

### Decision #11: Test on Real Emdash Instance Before Ship
- **Proposed by:** Elon Musk (Round 1, reinforced Round 2)
- **Accepted by:** Steve Jobs (Round 2 — "all theorizing is worthless if runtime breaks assumptions")
- **Winner:** **Elon** (unanimous)
- **Rationale:** Plugin runtime is new. Sandbox model might break assumptions. Peak Dental is proving ground.
- **Implementation:** Final test checklist must include Peak Dental with real KV bindings.

---

## MVP Feature Set: What Ships in V1

### INCLUDED (Locked)
1. **Per-Page SEO Fields:**
   - Title (with length audit: 50-60 chars optimal)
   - Meta description (with length audit: 150-160 chars optimal)
   - OG image (with validation: exists, accessible, correct dimensions)
   - OG title (defaults to page title)
   - OG description (defaults to meta description)
   - Twitter card type (summary vs summary_large_image)
   - Noindex flag (default: false)
   - Nofollow flag (default: false)

2. **Audit Engine:**
   - Title length check (too short <30, too long >60, optimal 50-60)
   - Description length check (too short <120, too long >160, optimal 150-160)
   - Missing OG image detection
   - Missing title/description detection
   - Red/yellow/green scoring per page
   - Aggregate dashboard score (worst pages first)

3. **Dashboard:**
   - One-screen overview (no tabs, no setup wizard)
   - Worst pages ranked by issue severity
   - Quick-fix links (click → edit page)
   - Overall site health score (visual progress bar)
   - Zero configuration required (immediate value in <30 seconds)

4. **Visual Previews:**
   - Facebook card preview (HTML/CSS replica)
   - Twitter card preview (HTML/CSS replica)
   - Google search snippet preview (HTML/CSS replica)
   - Live updates as user types
   - Side-by-side view on page edit screen

5. **XML Sitemap:**
   - Auto-generated from all published pages
   - Flat list (no pattern overrides)
   - Default changefreq: monthly
   - Default priority: 0.5
   - Served at `/sitemap.xml`
   - Cached in KV with 5-minute TTL (invalidate on page save/delete)

6. **Robots.txt:**
   - Auto-generated with sensible defaults
   - Allow all bots, reference sitemap
   - No admin UI in v1 (static default only)

7. **Structured Data:**
   - Article template ONLY in v1
   - Form fields: headline, datePublished, author, image
   - Generates valid JSON-LD (no freeform editor)
   - LocalBusiness + Product templates deferred to v1.1

### EXCLUDED (Cut for V1)
1. ~~Meta keywords field~~ — Dead since 2009
2. ~~Sitemap pattern overrides~~ — 0.1% use case, ships without (track requests)
3. ~~Robots.txt settings UI~~ — Default is perfect, v2 if users ask
4. ~~Bulk SEO operations~~ — Focus matters, v2 feature
5. ~~AI meta generation~~ — V2 differentiator (requires LLM integration)
6. ~~Google Search Console integration~~ — V2 analytics play
7. ~~Freeform structured data editor~~ — Dangerous, replaced with templates
8. ~~SEO score out of 100~~ — Vanity metric, replaced with red/yellow/green

---

## File Structure: What Gets Built

### Plugin Architecture (Emdash KV-backed, no database)

```
/plugins/seodash/
│
├── index.ts                 # Main plugin entry, route registration
├── types.ts                 # TypeScript interfaces (PageSEO, AuditResult, etc.)
├── storage.ts               # KV operations (save, get, delete, denormalized list)
├── audit.ts                 # Pure audit functions (title, description, OG checks)
├── sitemap.ts               # XML generation + KV caching
├── robots.ts                # Static robots.txt generator
├── structured-data.ts       # JSON-LD templates (Article only in v1)
│
├── routes/
│   ├── admin.ts             # Dashboard, list view (paginated), edit UI
│   ├── public.ts            # Sitemap endpoint, robots.txt endpoint
│   └── api.ts               # Save/delete handlers, social preview renderer
│
├── components/
│   ├── Dashboard.tsx        # Main admin screen (worst pages, progress bar)
│   ├── PageEditor.tsx       # Edit form with live previews
│   ├── SocialPreview.tsx    # Facebook/Twitter/Google card renderers
│   ├── AuditFeedback.tsx    # Red/yellow/green issue display
│   └── Pagination.tsx       # List view pagination (max 50 per page)
│
└── utils/
    ├── scoring.ts           # Red/yellow/green logic
    ├── validation.ts        # URL/image/length validators
    └── preview-html.ts      # Social card HTML/CSS templates
```

### Key Technical Decisions

**Storage Pattern:**
- Primary keys: `seo:page:{hash}` (per-page data)
- Denormalized list: `seo:pages:list` (full array, one read)
- Cache key: `seo:sitemap:xml` (5-min TTL)
- Hash function: SHA-256 of page path (collision-free)

**Performance Optimizations:**
- `getAllPages()`: Single KV read (denormalized array)
- Sitemap: Cached XML, invalidated on writes
- Pagination: Cursor-based, max 50 items
- Audit: Pure functions (no I/O), computed on save

**Routes:**
- Admin: `/admin/seodash/dashboard`, `/admin/seodash/pages`, `/admin/seodash/edit/:hash`
- Public: `/sitemap.xml`, `/robots.txt`
- API: `POST /api/seodash/save`, `DELETE /api/seodash/delete/:hash`, `GET /api/seodash/preview/:hash`

---

## Open Questions: What Still Needs Resolution

### 1. Emdash Runtime Compatibility
**Question:** Does the plugin sandbox model support KV bindings as assumed?
**Blocker Status:** HIGH (breaks everything if wrong)
**Resolution Path:** Test on Peak Dental with real KV before proceeding
**Owner:** Build agent must validate environment first

### 2. Social Card Rendering Accuracy
**Question:** How close do HTML/CSS replicas need to match real platform rendering?
**Blocker Status:** MEDIUM (UX quality, not functionality)
**Resolution Path:** Build "good enough" replicas, iterate based on user feedback
**Owner:** Build agent uses current platform docs (2026 specs)

### 3. Structured Data Scope for V1
**Question:** Article template only, or also LocalBusiness/Product?
**Decision:** Article only, monitor requests for first 30 days
**Blocker Status:** LOW (can add templates easily)
**Owner:** Build agent ships Article, tracks feature requests

### 4. Dashboard "Worst Pages" Ranking Logic
**Question:** Sort by issue count, severity, or traffic potential?
**Current Decision:** Issue severity (missing OG > long title > short description)
**Blocker Status:** LOW (can adjust weighting)
**Owner:** Build agent implements severity enum, makes weights configurable

### 5. Cache Invalidation for Sitemap
**Question:** 5-minute TTL vs immediate invalidation on page save?
**Current Decision:** Immediate invalidation (delete `seo:sitemap:xml` on write)
**Blocker Status:** LOW (performance vs freshness tradeoff)
**Owner:** Build agent implements invalidation, monitors performance

### 6. Error Handling for Missing KV Keys
**Question:** What happens if `seo:pages:list` doesn't exist on first run?
**Resolution:** Initialize empty array, rebuild from individual page keys if corrupted
**Blocker Status:** LOW (edge case, but must handle gracefully)
**Owner:** Build agent adds defensive checks

### 7. Pagination State Persistence
**Question:** Should list view remember page position across sessions?
**Current Decision:** No (default to page 1 on load, simpler v1)
**Blocker Status:** LOW (nice-to-have, not critical)
**Owner:** Defer to v1.1 if users request

---

## Risk Register: What Could Go Wrong

### CRITICAL RISKS (Ship Blockers)

#### Risk #1: Emdash Plugin Runtime Mismatch
- **Probability:** MEDIUM (new platform, assumptions untested)
- **Impact:** CRITICAL (nothing works)
- **Mitigation:** Test on Peak Dental BEFORE building. Validate KV bindings work as expected. If runtime differs from assumptions, stop and re-architect.
- **Owner:** Build agent (pre-flight check required)

#### Risk #2: getAllPages() Still Breaks at Scale
- **Probability:** LOW (denormalization should fix it)
- **Impact:** HIGH (UX degrades >500 pages)
- **Mitigation:** Denormalize to `seo:pages:list`. Add pagination. Test with 1,000-page mock dataset.
- **Owner:** Build agent (must validate with load test)

#### Risk #3: Sitemap Exceeds Worker Response Limit
- **Probability:** LOW (<10,000 pages fits in 10MB limit)
- **Impact:** MEDIUM (sitemap fails silently)
- **Mitigation:** Monitor sitemap size. Add compression if >5MB. Stream XML in v2 if needed.
- **Owner:** Build agent (add size check on generation)

### HIGH RISKS (Quality Degradation)

#### Risk #4: Social Preview Cards Render Incorrectly
- **Probability:** MEDIUM (platforms change specs frequently)
- **Impact:** MEDIUM (users see wrong preview, lose trust)
- **Mitigation:** Use current 2026 platform specs. Accept minor differences. Add "Preview may differ slightly" disclaimer. Update on user reports.
- **Owner:** Build agent (document spec versions used)

#### Risk #5: Structured Data Templates Generate Invalid JSON-LD
- **Probability:** LOW (templates are static, validated)
- **Impact:** HIGH (breaks rich snippets, user sites penalized)
- **Mitigation:** Validate all template output with Google's Structured Data Testing Tool. Add schema version comments. Escape all user inputs.
- **Owner:** Build agent (must validate before ship)

#### Risk #6: Cache Invalidation Fails, Sitemap Serves Stale Data
- **Probability:** LOW (simple delete on write)
- **Impact:** MEDIUM (new pages missing from sitemap for up to 5 min)
- **Mitigation:** Immediate invalidation on page save/delete. Add manual "regenerate sitemap" button in admin if paranoid.
- **Owner:** Build agent (test save → sitemap flow)

### MEDIUM RISKS (User Friction)

#### Risk #7: Users Expect Features We Cut (Keywords, Patterns, Robots UI)
- **Probability:** MEDIUM (SEO users have legacy expectations)
- **Impact:** LOW (can add in v1.1 if demand proven)
- **Mitigation:** Track all feature requests for 30 days. Add most-requested features in v1.1. Document why features were cut in FAQ.
- **Owner:** Post-launch monitoring (track GitHub issues)

#### Risk #8: Pagination UX Confuses Users (No Search/Filter)
- **Probability:** MEDIUM (users expect search in lists >50 items)
- **Impact:** LOW (workaround: use browser find)
- **Mitigation:** Add search/filter in v1.1. For v1, keep list sorted by worst-first so important pages are on page 1.
- **Owner:** Build agent (ensure sort order is helpful)

#### Risk #9: Audit Feedback Misleads Users ("Green Means #1 Ranking")
- **Probability:** MEDIUM (users conflate technical correctness with SEO success)
- **Impact:** MEDIUM (unrealistic expectations, support burden)
- **Mitigation:** Add disclaimer in dashboard: "Green = technically optimized. Rankings depend on content quality, backlinks, competition." Link to SEO basics doc.
- **Owner:** Build agent (add disclaimer text)

### LOW RISKS (Edge Cases)

#### Risk #10: Path Hashing Collision (Unlikely but Catastrophic)
- **Probability:** VERY LOW (SHA-256 is collision-resistant)
- **Impact:** CRITICAL (wrong page data returned)
- **Mitigation:** Use full SHA-256 hash (not truncated). Log all hash operations. Add collision detection in storage layer.
- **Owner:** Build agent (use crypto.subtle.digest, no shortcuts)

#### Risk #11: OG Image Validation Blocks Valid Images
- **Probability:** LOW (validation is permissive)
- **Impact:** LOW (user sees false negative, annoying)
- **Mitigation:** Check URL format + reachability only. Don't enforce dimensions/format strictly. Allow override.
- **Owner:** Build agent (validate but don't block)

#### Risk #12: Robots.txt Default Accidentally Blocks Google
- **Probability:** VERY LOW (default is "allow all")
- **Impact:** CRITICAL (site disappears from search)
- **Mitigation:** Default template: `User-agent: *\nAllow: /\nSitemap: {url}/sitemap.xml`. Test against Google's robots.txt validator. Add warning if user tries to edit manually.
- **Owner:** Build agent (use battle-tested default)

---

## Success Criteria: How We Know It's Done

### Technical Validation (Required Before Ship)
- [ ] Runs on Peak Dental without errors
- [ ] KV bindings work as expected (read/write/delete)
- [ ] `getAllPages()` loads 500-page dataset in <500ms
- [ ] Sitemap generates valid XML (W3C validator passes)
- [ ] Structured data passes Google's testing tool
- [ ] Social preview cards render on all major browsers
- [ ] Pagination works (navigate 50+ pages without crash)

### User Experience Validation (Required Before Ship)
- [ ] Install → see dashboard in <30 seconds (zero config)
- [ ] Edit page → see live preview updates
- [ ] Fix issue → see red turn green
- [ ] Save page → sitemap updates (within 5 min)
- [ ] Delete page → removed from list and sitemap
- [ ] No console errors, no broken images, no 404s

### Quality Gates (Required Before Ship)
- [ ] All audit functions have unit tests
- [ ] Storage layer has integration tests (mock KV)
- [ ] Error messages follow "NPR at 6am" tone
- [ ] No meta keywords field in UI or schema
- [ ] No sitemap pattern overrides in UI
- [ ] Robots.txt UI does not exist (static default only)
- [ ] Structured data limited to Article template

---

## Post-Ship Monitoring Plan

### Week 1: Stability & Critical Bugs
- Monitor error logs for runtime crashes
- Track sitemap generation failures
- Validate KV performance (no timeouts)
- Fix critical bugs within 24 hours

### Days 1-30: Feature Request Tracking
- Log all "I wish it had..." comments
- Count requests for cut features (keywords, patterns, robots UI)
- Identify most-requested v1.1 features
- Decision threshold: 3+ users request = add to v1.1

### Day 30: V1.1 Planning
- Review feature request data
- Prioritize by demand + effort
- Top candidates for v1.1:
  - LocalBusiness structured data template (if requested)
  - Search/filter on page list (if >500 pages common)
  - Manual sitemap regeneration button (if cache issues reported)
  - Robots.txt UI (if users break default)

---

## Build Agent Instructions

### Pre-Flight Checklist (MUST Complete Before Coding)
1. Verify Peak Dental is accessible with KV bindings
2. Confirm Emdash plugin API matches assumptions (route registration, context object)
3. Check if TypeScript/React toolchain is configured
4. Validate that `ctx.kv.get()`, `ctx.kv.put()`, `ctx.kv.delete()` work as expected

### Build Order (Sequential, Do Not Skip Steps)
1. **Storage layer** — KV operations, denormalized list, hash function
2. **Audit engine** — Pure functions for title/description/OG checks
3. **Dashboard** — One-screen view, worst pages, progress bar
4. **Page editor** — Form fields, live previews, save handler
5. **Sitemap** — XML generation, KV caching, invalidation
6. **Robots.txt** — Static default generator
7. **Structured data** — Article template only
8. **Pagination** — List view, max 50 items
9. **Social previews** — Facebook/Twitter/Google HTML/CSS replicas
10. **Testing** — Unit tests (audit), integration tests (storage), Peak Dental validation

### Non-Negotiable Requirements
- Fix `getAllPages()` before proceeding (denormalize to single array)
- Add pagination before claiming list view is done
- Test on Peak Dental before claiming "done"
- NO meta keywords field anywhere
- NO sitemap pattern overrides UI
- NO robots.txt settings UI
- NO freeform structured data editor
- Article template ONLY for structured data

### Quality Standards
- Error messages: helpful tone, concise words (not verbose)
- Social previews: "good enough" replicas (not pixel-perfect)
- Audit feedback: red/yellow/green with context (not just pass/fail)
- Dashboard: zero config, immediate value (<30 seconds to usefulness)

---

## Debate Synthesis: Steve vs Elon

### Where Steve Won (Design & UX)
- Visual social previews (core differentiator)
- Red-to-green feedback (psychological hook)
- "NPR at 6am" brand voice (with efficiency constraint)
- Structured data templates (not cut, constrained to Article)
- Social preview endpoint (visual empathy, not JSON)

### Where Elon Won (Performance & Scope)
- Fix `getAllPages()` N+1 bug (unanimous)
- Add pagination (unanimous)
- Cut meta keywords (unanimous)
- Cut sitemap patterns (with monitoring clause)
- Cut robots.txt UI (narrow victory)

### Where Both Agreed (Locked Consensus)
- Test on Peak Dental before ship
- One dashboard, zero setup
- Worst pages ranked first
- No keyword density scores
- Sitemap/robots.txt auto-generation
- Ship simple, iterate with data

### Core Tension Resolved
**Steve:** "Design creates trust, trust drives adoption."
**Elon:** "Taste tells you WHAT to build. Data tells you WHEN."

**Synthesis:** Build the 10% of features that deliver 90% of value WITH Steve's design quality. Ship in 2 days. Let usage data tell us what to add next.

---

## Final Word: The Blueprint

**What we're building:** A tool that makes people feel confident, not just correct.

**How we're building it:** Steve's UX taste + Elon's performance discipline + data-driven iteration.

**When we ship:** 2 days from start.

**How we know it works:** Peak Dental runs it without errors.

**What happens next:** Monitor for 30 days. Add most-requested features in v1.1. Cut features nobody asks for.

**The promise:** SEO that's invisible when perfect, obvious when broken. Fix → save → done.

---

**This document is the contract between debate and execution. Build agent: make it real.**

— Phil Jackson, Zen Master
Great Minds Agency
