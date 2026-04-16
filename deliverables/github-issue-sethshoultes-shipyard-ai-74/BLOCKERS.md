# Issue #74: Deployment Blockers & Follow-Up Issues

## Critical Blockers (Prevent Production Deployment)

### 1. Missing Build Script
**Owner:** Platform Team
**Status:** ⚠️ Blocking verification

**Problem:** The EventDash plugin has no build script in `package.json`. Cannot run `npm run build` to verify Cloudflare Workers compatibility.

**Current State:**
- Available scripts: `npm test`, `npm run test:watch`
- Missing: `npm run build`, `npm run dev`, `npm run typecheck`

**Required Action:**
- Add build script to `plugins/eventdash/package.json`
- Configure TypeScript compilation
- Test build output works with Cloudflare Workers

**Follow-Up Issue:** #77 — Add build script to EventDash plugin

---

### 2. TypeScript Compilation Errors
**Owner:** Engineering Lead
**Status:** ⚠️ Blocking build

**Problem:** EventDash plugin has multiple TypeScript compilation errors that prevent building for production.

**Errors Include:**
- Missing type declarations for Astro components (EventListing.astro, EventCalendarMonth.astro, AttendeePortal.astro)
- Type mismatches with null values being passed where typed objects are expected
- Missing properties on objects (id property on various records)
- Missing environment property on PluginContext
- Incorrect function signatures

**Impact:** Cannot verify that the entrypoint fix actually works in Cloudflare Workers until compilation succeeds.

**Required Action:**
- Fix all TypeScript errors in `plugins/eventdash/src/`
- Add proper type declarations for Astro components
- Ensure PluginContext types match Emdash API

**Follow-Up Issue:** #78 — Fix TypeScript compilation errors in EventDash

---

### 3. Cloudflare Account Deployment Limit
**Owner:** DevOps
**Status:** ⚠️ Known blocker

**Problem:** Cloudflare account limit reached. Cannot deploy to production to validate fix with real users.

**Current Status:** Acknowledged as out-of-scope for Issue #74, but blocks user validation.

**Options:**
1. Upgrade Cloudflare account (~$20/month)
2. Deploy to alternative environment (Vercel/Netlify)
3. Local deployment for user testing

**Required Action:** Choose mitigation within 3 days.

**Follow-Up Issue:** #79 — Resolve Cloudflare deployment blocker

---

### 4. Test Failures
**Owner:** QA Team
**Status:** ⚠️ Quality risk

**Problem:** 9 out of 80 tests failing (11% failure rate). Unknown what functionality is broken.

**Current Status:** Failures acknowledged as "out of scope" for Issue #74, but no follow-up issue created.

**Impact:** May be shipping broken features to users. Risk of runtime failures in production.

**Required Action:**
- Run failing tests and document failures
- Determine if failures block EventDash deployment
- Fix blockers OR document acceptable risk

**Follow-Up Issue:** #80 — Triage and fix EventDash test failures

---

## Follow-Up Issues Summary

| Issue | Title | Priority | Owner | Est. Time |
|-------|-------|----------|-------|-----------|
| #77 | Add build script to EventDash plugin | HIGH | Platform Team | 2 hours |
| #78 | Fix TypeScript compilation errors in EventDash | HIGH | Engineering Lead | 1 day |
| #79 | Resolve Cloudflare deployment blocker | MEDIUM | DevOps | 3 days |
| #80 | Triage and fix EventDash test failures | MEDIUM | QA Team | 2 days |

---

## Board Mandate: Market Validation Required

**From Board Review (2.75/10 score):**

EventDash must validate market demand before further development:

1. **Week 1:** Find 10 event hosts willing to test
2. **Week 2:** Get 3 to pay $50/month for current version
3. **Decision:** If zero conversions, kill EventDash and redirect resources

**Owner:** Product Owner
**Timeline:** 2 weeks

**Rationale:** "You built a working solution to a problem you haven't proven matters." — Marcus Aurelius, Board Review

---

## Prevention Work (Per Jensen Huang Mandate)

**Requirement:** Block further plugin work until prevention mechanisms ship.

### Sprint 1: Prevention Mechanisms
1. **ESLint rule** (`no-npm-alias-entrypoint`) — fails CI if plugins use npm aliases
2. **CI build test** — build all plugins for Cloudflare Workers target
3. **Automated scan** — detect this pattern across codebase
4. **CONTRIBUTING.md update** — document "Why file paths, not npm aliases"

**Owner:** Platform Team
**Timeline:** 1 week
**Status:** ❌ Not started

---

## Status: Issue #74 Technical Fix Complete, Deployment Blocked

The code change is complete and correct. The entrypoint now uses file path resolution that will work in Cloudflare Workers. However:

- ✅ Code fix implemented
- ✅ Pattern matches Membership plugin
- ✅ Plugin registered in Sunrise Yoga config
- ❌ Cannot verify build (no build script)
- ❌ Cannot test in production (deployment blocked)
- ❌ Cannot validate with users (no users identified)

**Next Steps:**
1. Resolve blockers #77 and #78 (build script + TypeScript errors)
2. Test build for Cloudflare Workers
3. Resolve deployment blocker #79
4. Validate with real users per board mandate
5. Implement prevention mechanisms per Jensen's requirement
