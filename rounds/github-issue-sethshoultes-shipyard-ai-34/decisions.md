# Beacon: Locked Decisions Blueprint

**Build Phase Authority Document**
*Compiled by Phil Jackson from Great Minds Agency debates*

---

## Executive Summary

**Product:** Beacon (formerly SEODash) — SEO plugin for Emdash CMS
**Core Promise:** Make users feel confident about SEO without making them learn SEO
**Target Feeling:** Quiet relief. Not guessing anymore.
**Ship Gate:** Non-technical user fixes their first SEO issue in under 60 seconds and thinks "Oh. That's it?"

---

## Decision Log: Who Proposed, Who Won, Why

### Decision #1: Product Name — "Beacon" vs "SEODash"
- **Proposed by:** Steve Jobs (Round 1)
- **Challenged by:** N/A (Elon conceded Round 2)
- **Winner:** **Steve** (unanimous)
- **Rationale:** SEODash is forgettable tech jargon. Beacon is visceral, one word, clear metaphor. "SEO is about being found. A beacon guides people through darkness." Names shape perception, perception shapes adoption. Zero extra code cost, infinite marketing value.
- **Implementation:** All references become "Beacon"

### Decision #2: Simplicity — 300-400 Lines, Not 969
- **Proposed by:** Elon Musk (Round 1 — "Delete 60% of code")
- **Challenged by:** Steve Jobs (Round 2 — "Elon's 300 is too stripped")
- **Winner:** **Compromise at ~400 lines**
- **Rationale:** Elon identified massive complexity creep. Steve defended scoring system as core value. Synthesis: Keep intelligence (scoring), cut theater (audit history, pattern overrides, keywords). Target 400 lines.
- **What gets cut:** SEO scoring engine storage, robots.txt customization UI, sitemap pattern overrides, meta keywords field, bulk operations, Twitter card variants

### Decision #3: Storage Architecture — D1 vs KV
- **Proposed by:** Elon Musk (Round 1 — "Use D1 table, not KV")
- **Challenged by:** Steve Jobs (Round 2 — "Premature optimization theater")
- **Winner:** **Steve** (narrow victory, with monitoring clause)
- **Rationale:** Elon's scaling concern is valid (KV breaks at 5,000 pages), but Steve's correct that v1 won't hit scale. Compromise: Ship on denormalized KV for v1. If scale issues appear in first 30 days, migrate to D1 for v1.1.
- **Implementation:** Use `seo:pages:all` denormalized array for v1. Monitor performance. Have D1 migration plan ready.

### Decision #4: Scoring System — Keep or Cut?
- **Proposed cut by:** Elon Musk (Round 1 — "200+ lines of theater")
- **Defended by:** Steve Jobs (Round 2 — "It's not vanity, it's the core value prop")
- **Winner:** **Steve** (with simplification constraint)
- **Rationale:** Elon: "Score doesn't affect Google indexing." Steve: "Users don't buy metadata storage, they buy confidence." Synthesis: Keep red/yellow/green scoring (simple traffic light), cut numerical "92/100" and audit history storage. Score is computed on-demand, not persisted.
- **Implementation:** Pure function: `auditPage(data) → { color: 'red' | 'yellow' | 'green', issues: string[] }`. No KV writes for scores.

### Decision #5: N+1 Query Bug Fix
- **Proposed by:** Elon Musk (Round 1 — "getAllPages() is broken")
- **Accepted by:** Steve Jobs (Round 2 — "I completely missed this")
- **Winner:** **Elon** (unanimous)
- **Rationale:** Current code does N sequential KV reads. At 500 pages, UI becomes unusable. Fix is trivial: denormalize to single array. Steve: "This is the kind of performance fix that actually matters."
- **Implementation:** Store full page list as `seo:pages:all → PageSeoData[]`. Single read. Update array on save/delete.

### Decision #6: Pagination on Admin List
- **Proposed by:** Elon Musk (Round 1)
- **Accepted by:** Steve Jobs (Round 2 — "Non-negotiable")
- **Winner:** **Elon** (unanimous)
- **Rationale:** Without pagination, 500+ pages crashes browsers. Not theoretical—structural requirement.
- **Implementation:** Cursor pagination, max 50 pages per view.

### Decision #7: Cut Meta Keywords Field
- **Proposed by:** Elon Musk (Round 1 — "Google ignores since 2009")
- **Accepted by:** Steve Jobs (Round 2 — "Every unused field is a question mark")
- **Winner:** **Elon** (unanimous)
- **Rationale:** SEO theater. Adds cognitive load with zero value. "Completeness" doesn't mean shipping dead features.
- **Implementation:** Remove entirely from schema, UI, audit logic.

### Decision #8: Cut Sitemap Pattern Overrides
- **Proposed by:** Elon Musk (Round 1 — "0.1% use case")
- **Challenged by:** Steve Jobs (Round 2 — "Show me data, not assumptions")
- **Winner:** **Elon** (with monitoring clause)
- **Rationale:** Steve's compromise: "Ship without it. If even ONE user asks in first month, add it back."
- **Implementation:** Default `changefreq: monthly`, `priority: 0.5` for all URLs. No UI. Track feature requests.

### Decision #9: Robots.txt Settings UI
- **Proposed cut by:** Elon Musk (Round 1 — "Default is perfect")
- **Challenged by:** Steve Jobs (Round 2 — "UI prevents catastrophic mistakes")
- **Winner:** **Elon** (narrow victory)
- **Rationale:** Steve's concern is valid (users break robots.txt), but solution is better defaults + docs, not UI complexity. V1 ships static default. V2 adds UI if users request.
- **Implementation:** Generate sensible default automatically. No admin UI in v1.

### Decision #10: Auto-Generate Titles from H1s ("Fix This" Button)
- **Proposed by:** Steve Jobs (Round 1 — "One click to fix")
- **Challenged by:** Elon Musk (Round 2 — "This is a 2-week ML problem")
- **Winner:** **Elon** (deferred to v2)
- **Rationale:** Elon: "Emdash pages are React components, not static HTML. H1 might not exist. Right title isn't always H1. 'Fix this' is GPT-4 + API cost + latency." Steve conceded: "Let users write titles. Give 60-char guideline. Ship. If 10,000 users struggle, add auto-suggestions."
- **Implementation:** V1 shows length guidelines only. V2 adds AI-powered suggestions if data proves need.

### Decision #11: Sitemap Caching with TTL
- **Proposed by:** Elon Musk (Round 2)
- **Accepted by:** Steve Jobs (Round 2 — "Brilliant. I was wrong to miss this.")
- **Winner:** **Elon** (unanimous)
- **Rationale:** Regenerating sitemap XML on every request is wasteful. Cache in KV, invalidate on content change via hook. Sub-10ms response time.
- **Implementation:** Cache at `seo:sitemap:xml`, delete on page save/delete. No TTL—immediate invalidation.

### Decision #12: "NPR at 6am" Brand Voice
- **Proposed by:** Steve Jobs (Round 1 — "Calm, confident, always teaching")
- **Challenged by:** Elon Musk (Round 2 — "3x longer to write, test, internationalize")
- **Winner:** **Steve** (with efficiency constraint)
- **Rationale:** Tone matters—small business owners feel stupid, most SEO tools confirm it. But verbosity kills. Compromise: helpful tone, concise words.
- **Implementation:** "Description too short (87/160 chars)" not "FAIL". Add context links: "Why does this matter?" → docs.

### Decision #13: First 30 Seconds UX — Zero Config
- **Proposed by:** Steve Jobs (Round 1)
- **Accepted by:** Elon Musk (Round 2 — "Invisible until needed is correct")
- **Winner:** **Steve** (unanimous)
- **Rationale:** No setup wizard. No "Welcome! Let's configure..." Install → see what's wrong → fix it → feel smart.
- **Implementation:** Dashboard shows issues immediately. No config required. Sensible defaults for everything.

---

## MVP Feature Set: What Ships in V1

### INCLUDED (Locked)

**Per-Page SEO Fields:**
- Title (with length guidance: 50-60 chars optimal)
- Meta description (with length guidance: 150-160 chars optimal)
- OG image URL
- OG title (defaults to page title)
- OG description (defaults to meta description)
- Canonical URL
- Noindex flag (default: false)
- Nofollow flag (default: false)

**Red-to-Green Feedback System:**
- Title check (missing, too short <30, too long >60, optimal 50-60)
- Description check (missing, too short <120, too long >160, optimal 150-160)
- OG image check (missing, unreachable)
- Per-page color: red (critical issues), yellow (warnings), green (good)
- Computed on-demand (not persisted)

**Dashboard:**
- Single-screen overview (no tabs)
- Worst pages ranked first
- Quick-fix links (click → edit page)
- Overall site health indicator
- Zero configuration required

**Sitemap.xml:**
- Auto-generated from all published pages
- Excludes noindex pages
- Default: `changefreq: monthly`, `priority: 0.5`
- Served at `/sitemap.xml`
- Cached in KV, invalidated on page save/delete

**Robots.txt:**
- Static default: `User-agent: *\nAllow: /\nSitemap: {url}/sitemap.xml`
- No admin UI (manual editing only)

**JSON-LD Structured Data:**
- DEFERRED to v1.1 (cut from v1 scope)
- Rationale: Reduces scope, still ships core value

**Public Routes:**
- Metadata injection for `<head>` tags
- Sitemap XML endpoint
- Robots.txt endpoint

### EXCLUDED (Cut for V1)

- ❌ Meta keywords field (dead since 2009)
- ❌ Sitemap pattern overrides UI (0.1% use case)
- ❌ Robots.txt customization UI (default is perfect)
- ❌ SEO score out of 100 (vanity metric—use traffic light instead)
- ❌ Audit history storage (wasted KV writes)
- ❌ Bulk edit operations (focus matters more)
- ❌ Auto-generate titles from H1 (v2 ML feature)
- ❌ Twitter Card type selector (OG tags work fine)
- ❌ Google Search Console integration (v2 analytics)
- ❌ Social preview HTML endpoint (cut for simplicity)
- ❌ Structured data templates (deferred to v1.1)

---

## File Structure: What Gets Built

```
/plugins/beacon/
│
├── index.ts                 # Plugin entry, route registration
├── types.ts                 # TypeScript interfaces (PageSEO, AuditResult)
├── storage.ts               # KV operations (denormalized list pattern)
├── audit.ts                 # Pure audit functions (red/yellow/green logic)
├── sitemap.ts               # XML generation + caching
├── robots.ts                # Static default generator
│
├── routes/
│   ├── admin.ts             # Dashboard, list (paginated), edit UI
│   ├── public.ts            # Sitemap, robots.txt endpoints
│   └── api.ts               # Save/delete handlers
│
├── components/
│   ├── Dashboard.tsx        # Main admin screen
│   ├── PageEditor.tsx       # Edit form with live feedback
│   ├── AuditFeedback.tsx    # Red/yellow/green issue display
│   └── Pagination.tsx       # List pagination (max 50)
│
└── utils/
    ├── scoring.ts           # Traffic light logic
    └── validation.ts        # URL/length validators
```

### Storage Pattern (KV-Based)

**Primary keys:**
- `beacon:page:{hash}` → per-page SEO data
- `beacon:pages:all` → denormalized array of all pages (single read)
- `beacon:sitemap:xml` → cached sitemap XML

**Hash function:** SHA-256 of page path (collision-free)

**Performance optimizations:**
- `getAllPages()`: Single KV read (denormalized array)
- Sitemap: Cached, invalidated on writes
- Pagination: Max 50 items per view
- Audit: Pure function, no I/O

---

## Open Questions: What Still Needs Resolution

### 1. Emdash Runtime Compatibility
**Question:** Does plugin sandbox support KV bindings as assumed?
**Blocker:** CRITICAL (nothing works if wrong)
**Resolution:** Test on Peak Dental FIRST before building
**Owner:** Build agent pre-flight check

### 2. Cache Invalidation Timing
**Question:** Immediate invalidation vs TTL for sitemap?
**Decision:** Immediate (delete cache on save/delete)
**Blocker:** LOW (can adjust if performance issues)

### 3. Error Handling for Missing KV Keys
**Question:** What if `beacon:pages:all` doesn't exist?
**Resolution:** Initialize empty array, rebuild from page keys if corrupted
**Blocker:** LOW (edge case, handle gracefully)

### 4. Dashboard Ranking Logic
**Question:** Sort worst pages by issue count or severity?
**Decision:** Severity (missing OG > long title > short description)
**Blocker:** LOW (weights configurable)

### 5. Pagination State Persistence
**Question:** Remember page position across sessions?
**Decision:** No (default to page 1, simpler v1)
**Blocker:** LOW (defer to v1.1)

---

## Risk Register: What Could Go Wrong

### CRITICAL RISKS (Ship Blockers)

**Risk #1: Emdash Plugin Runtime Mismatch**
- **Probability:** MEDIUM (new platform, untested assumptions)
- **Impact:** CRITICAL (nothing works)
- **Mitigation:** Test on Peak Dental BEFORE coding. Validate KV bindings. If runtime differs, stop and re-architect.
- **Owner:** Build agent pre-flight check

**Risk #2: getAllPages() Still Breaks at Scale**
- **Probability:** LOW (denormalization should fix)
- **Impact:** HIGH (UX degrades >500 pages)
- **Mitigation:** Denormalize to single array. Add pagination. Test with 1,000-page mock.
- **Owner:** Build agent load test

**Risk #3: Sitemap Exceeds Worker Response Limit**
- **Probability:** LOW (<10k pages fits in 10MB)
- **Impact:** MEDIUM (sitemap fails silently)
- **Mitigation:** Monitor size. Add compression if >5MB.
- **Owner:** Build agent size check

### HIGH RISKS (Quality Degradation)

**Risk #4: Audit Feedback Misleads Users**
- **Probability:** MEDIUM (users conflate green with #1 ranking)
- **Impact:** MEDIUM (unrealistic expectations)
- **Mitigation:** Disclaimer: "Green = technically optimized. Rankings depend on content, backlinks, competition."
- **Owner:** Build agent disclaimer text

**Risk #5: Cache Invalidation Fails**
- **Probability:** LOW (simple delete on write)
- **Impact:** MEDIUM (stale sitemap for 5 min)
- **Mitigation:** Immediate invalidation on save/delete. Test save → sitemap flow.
- **Owner:** Build agent test coverage

### MEDIUM RISKS (User Friction)

**Risk #6: Users Expect Cut Features**
- **Probability:** MEDIUM (SEO users have legacy expectations)
- **Impact:** LOW (can add in v1.1)
- **Mitigation:** Track feature requests for 30 days. Add most-requested in v1.1.
- **Owner:** Post-launch monitoring

**Risk #7: Pagination UX Confuses Users**
- **Probability:** MEDIUM (expect search in lists >50)
- **Impact:** LOW (workaround: browser find)
- **Mitigation:** Sort by worst-first so important pages on page 1. Add search in v1.1.
- **Owner:** Build agent sort logic

### LOW RISKS (Edge Cases)

**Risk #8: Path Hashing Collision**
- **Probability:** VERY LOW (SHA-256 resistant)
- **Impact:** CRITICAL (wrong data returned)
- **Mitigation:** Use full SHA-256. Log all hashes. Add collision detection.
- **Owner:** Build agent (no shortcuts)

**Risk #9: Robots.txt Default Blocks Google**
- **Probability:** VERY LOW (default is "allow all")
- **Impact:** CRITICAL (site vanishes)
- **Mitigation:** Battle-tested default. Test against Google's validator.
- **Owner:** Build agent validation

---

## Success Criteria: How We Know It's Done

### Technical Validation
- ✅ Runs on Peak Dental without errors
- ✅ KV bindings work (read/write/delete)
- ✅ `getAllPages()` loads 500 pages in <500ms
- ✅ Sitemap generates valid XML
- ✅ Pagination works (50+ pages without crash)
- ✅ Cache invalidation works (save → sitemap updates)

### User Experience Validation
- ✅ Install → see dashboard in <30 seconds (zero config)
- ✅ Edit page → see live feedback
- ✅ Fix issue → see red turn green
- ✅ Save → sitemap updates immediately
- ✅ No console errors, no 404s

### Ship Gate (The One That Matters)
**Non-technical user fixes their first SEO issue in under 60 seconds and thinks "Oh. That's it?"**

---

## Post-Ship Monitoring Plan

### Week 1: Stability
- Monitor error logs
- Track sitemap failures
- Validate KV performance
- Fix critical bugs <24 hours

### Days 1-30: Feature Requests
- Log all "I wish it had..." comments
- Count requests for cut features
- Decision threshold: 3+ users = add to v1.1

### Day 30: V1.1 Planning
Top candidates:
- LocalBusiness/Product structured data (if requested)
- Search/filter on page list (if >500 pages common)
- Robots.txt UI (if users break default)
- D1 migration (if KV performance issues)

---

## Build Agent Instructions

### Pre-Flight Checklist (MUST Complete First)
1. ✅ Verify Peak Dental accessible with KV
2. ✅ Confirm Emdash plugin API matches assumptions
3. ✅ Validate `ctx.kv.get()`, `ctx.kv.put()`, `ctx.kv.delete()` work
4. ✅ Check TypeScript/React toolchain configured

### Build Order (Sequential)
1. **Storage layer** — KV ops, denormalized list, hash
2. **Audit engine** — Pure functions for red/yellow/green
3. **Dashboard** — One-screen, worst-first
4. **Page editor** — Form fields, live feedback
5. **Sitemap** — XML generation, caching, invalidation
6. **Robots.txt** — Static default
7. **Pagination** — List view, max 50
8. **Testing** — Unit + integration + Peak Dental validation

### Non-Negotiables
- ❌ NO meta keywords field
- ❌ NO sitemap pattern overrides UI
- ❌ NO robots.txt settings UI
- ❌ NO numerical scores (use red/yellow/green only)
- ❌ NO audit history storage
- ✅ FIX getAllPages() before proceeding
- ✅ ADD pagination before claiming done
- ✅ TEST on Peak Dental before shipping

### Quality Standards
- Error messages: helpful tone, concise words
- Audit feedback: traffic light + context
- Dashboard: zero config, immediate value
- Code: ~400 lines total

---

## Debate Synthesis: Steve vs Elon

### Where Steve Won (Design & UX)
- ✅ Product name: Beacon
- ✅ Red-to-green feedback system (core value)
- ✅ "NPR at 6am" brand voice (with efficiency)
- ✅ First 30 seconds must feel like magic
- ✅ KV storage for v1 (defer D1 to scale)

### Where Elon Won (Performance & Scope)
- ✅ Fix getAllPages() N+1 bug
- ✅ Add pagination
- ✅ Cut meta keywords
- ✅ Cut sitemap patterns
- ✅ Cut robots.txt UI
- ✅ Sitemap caching with invalidation
- ✅ Defer auto-title generation to v2

### Where Both Agreed (Locked)
- ✅ Test on Peak Dental before ship
- ✅ One dashboard, zero setup
- ✅ Worst pages ranked first
- ✅ Ship simple, iterate with data
- ✅ 400 lines max
- ✅ Delete complexity creep

### Core Tension Resolved
**Steve:** "Design creates trust. Trust drives adoption."
**Elon:** "Taste tells you WHAT to build. Data tells you WHEN."
**Synthesis:** Build the 10% that delivers 90% WITH design quality. Ship in 2 days. Let data guide v1.1.

---

## The Essence (What This Is Really About)

**What we're building:**
A guide that whispers the answer. Not another dashboard. Not another form.

**How it feels:**
Quiet relief. Confident, not confused. "Oh. That's it?"

**What must be perfect:**
First 30 seconds. Install → see what's wrong → fix it → feel smart.

**Creative direction:**
Invisible until needed. Obvious when broken.

**Ship when:**
Non-technical user fixes their first SEO issue in under 60 seconds without reading docs.

---

**This document is the contract between debate and execution.**

**Build agent: Make it real.**

— Phil Jackson, Zen Master
Great Minds Agency
