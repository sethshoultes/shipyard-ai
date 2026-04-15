# HARBOR — Build Blueprint
**Consolidated Decisions from Great Minds Debate**
**Orchestrator:** Phil Jackson
**Date:** 2026-04-15

---

## EXECUTIVE SUMMARY

**What we're building:** Binary membership check plugin. You're in or you're not.
**Why it exists:** Fix 4 violations in `plugins/membership/src/sandbox-entry.ts`
**Core principle:** Invisible. Precise. Boringly reliable.
**Ship target:** Single agent session, <30 minutes execution time

---

## LOCKED DECISIONS

### 1. Product Name: HARBOR
**Proposed by:** Steve Jobs
**Contested by:** Elon Musk (called it "bikeshedding")
**Winner:** Steve
**Rationale:** Names shape how teams treat code. "MemberShip v2" signals iterative/temporary. "HARBOR" signals foundational. Psychology over marketing. Even internal tools deserve respect.
**Implementation:** Internal reference only for now. Renaming files/packages is deferred until V1 proves durability (30-day no-hotfix period).

### 2. Scope: Zero Features Beyond Binary Checks
**Proposed by:** Both (unanimous)
**Winner:** Consensus
**What's IN:**
- Binary membership validation (email → plan → boolean)
- KV-based lookups (O(1) performance)
- Zero-config operation after plugin registration

**What's OUT (deferred to V2 or never):**
- Admin UI / dashboards
- AI engagement / retention workflows
- Analytics / metrics
- Referral programs / viral mechanics
- Billing integration (use Stripe separately)
- Email notifications
- "Moat features"

**Rationale:** Great design is saying NO. Do one thing well. Complexity is technical debt.

### 3. Development Process: Speed vs. Durability Compromise
**Proposed by:** Elon (speed) vs. Steve (durability)
**Winner:** Hybrid approach
**Execution:**
1. **Copy** `deliverables/membership-fix/sandbox-entry.ts` → `plugins/membership/src/sandbox-entry.ts`
2. **Register** plugin in `astro.config.mjs` (1 line import)
3. **Test** via 6 manual curl commands (see test matrix below)
4. **Deploy** to Sunrise Yoga
5. **Freeze** code for 30 days (no optimizations/refactors)

**Rationale:**
- Elon's position: Ship in <30 minutes, automate everything, PRD is bureaucracy
- Steve's position: Team has rewritten working code before, needs discipline, manual tests force understanding
- **Compromise:** Shrink PRD to essentials, manual tests now, automation after 30-day stability proof

### 4. Testing Strategy: Manual First, Automate Later
**Proposed by:** Elon (automate immediately) vs. Steve (manual until proven)
**Winner:** Steve (conditional)
**Decision:** 6 curl commands run manually for V1 deployment. Automation unlocked after 30 days of zero hotfixes.
**Rationale:** "Automation amplifies competence. It also amplifies incompetence." Team must demonstrate they can ship without breaking working code first.

### 5. Version Semantics: Patch, Not Feature Release
**Proposed by:** Elon
**Winner:** Consensus
**Decision:** This is `v1.0.1` (patch), not "V2" (major feature release)
**Rationale:** Calling it "V2" creates false impression of new capabilities. This is a bug fix.

---

## MVP FEATURE SET (V1.0.1)

### Core Functionality
1. **Binary membership check** via `isMember(email: string, planId?: string): boolean`
2. **KV storage integration** (Cloudflare Workers KV)
3. **Zero-config deployment** (works immediately after plugin registration)
4. **Plans support** (Basic, Premium, Enterprise)
5. **Graceful degradation** (returns false on errors, never throws)

### Non-Functional Requirements
- **Performance:** O(1) KV lookups, <50ms p99 latency
- **Scalability:** Handles 1M users with zero code changes (Cloudflare Workers auto-scale)
- **Reliability:** No auth complexity, no database, no sessions, no real-time
- **Developer experience:** Install → Register → Works (the "first 30 seconds should feel like magic")

### What Ships in Files
- `plugins/membership/src/sandbox-entry.ts` (the working 3,441-line file)
- Plugin registration in `astro.config.mjs`
- Test documentation (6 curl commands with expected results)

---

## FILE STRUCTURE

### Critical Files (DO NOT MODIFY)
```
deliverables/membership-fix/sandbox-entry.ts
  └─ Source of truth: 3,441 lines, 0 violations
  └─ Action: COPY to target location
```

### Target Deployment Location
```
plugins/membership/src/sandbox-entry.ts
  └─ Current state: 8 lines, 4 violations
  └─ Action: OVERWRITE with clean file
```

### Configuration Files
```
astro.config.mjs
  └─ Action: Add plugin import/registration (1 line)
```

### Documentation (To Be Created)
```
plugins/membership/TEST-RESULTS.md
  └─ 6 curl commands + actual output
  └─ Pass/fail status
  └─ Timestamp of test run
```

### What NOT to Build (V2 Scope)
```
plugins/membership/src/admin-ui/*       [deferred]
plugins/membership/src/analytics/*      [deferred]
plugins/membership/src/ai-features/*    [cut permanently]
```

---

## TEST MATRIX (6 Manual Smoke Tests)

Run these curl commands after deployment:

### Test 1: Valid Member (Basic Plan)
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{"email": "member@example.com", "planId": "basic"}'
```
**Expected:** `{"isMember": true}`

### Test 2: Valid Member (Any Plan)
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{"email": "member@example.com"}'
```
**Expected:** `{"isMember": true}`

### Test 3: Invalid Member
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{"email": "nonmember@example.com"}'
```
**Expected:** `{"isMember": false}`

### Test 4: Wrong Plan
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{"email": "basic-member@example.com", "planId": "premium"}'
```
**Expected:** `{"isMember": false}`

### Test 5: Malformed Email
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{"email": "not-an-email"}'
```
**Expected:** `{"isMember": false}` (graceful failure)

### Test 6: Missing Email
```bash
curl -X POST http://localhost:4321/api/membership/check \
  -H "Content-Type: application/json" \
  -d '{}'
```
**Expected:** `{"isMember": false}` or `{"error": "Email required"}` (graceful failure)

**Success Criteria:** All 6 tests return expected results. Document actual output in TEST-RESULTS.md.

---

## OPEN QUESTIONS

### 1. KV Namespace Configuration
**Question:** Does `astro.config.mjs` need KV namespace binding, or is it auto-configured?
**Who owns:** Build agent (verify during implementation)
**Blocker status:** Medium (may cause tests to fail silently)

### 2. Environment Variables
**Question:** Does Harbor need `HARBOR_KV_NAMESPACE` env var, or is it hardcoded?
**Who owns:** Build agent (check `sandbox-entry.ts` for references)
**Blocker status:** Low (likely hardcoded based on "zero-config" requirement)

### 3. Sunrise Yoga Deployment Target
**Question:** What's the actual deployment URL for smoke tests? (localhost:4321 may not be correct)
**Who owns:** Build agent (verify Astro dev server port)
**Blocker status:** Low (can adapt curl commands on the fly)

### 4. Git Commit Message Format
**Question:** Does this repo have commit message conventions?
**Who owns:** Build agent (check recent commits via `git log`)
**Blocker status:** Trivial

### 5. Post-Deployment Verification
**Question:** Should we deploy to staging before production, or ship directly to Sunrise Yoga?
**Who owns:** Unresolved (not debated by Elon/Steve)
**Blocker status:** Low (assume direct deploy for V1)

---

## RISK REGISTER

### CRITICAL RISKS

#### Risk 1: Temptation to "Optimize" Working Code
**Likelihood:** High (team has done this before per Steve)
**Impact:** Critical (reintroduces 4 violations)
**Mitigation:**
- Add `// DO NOT MODIFY` comments to copied file
- 30-day code freeze policy
- Manual code review before any future changes
**Owner:** Phil Jackson (enforce discipline)

#### Risk 2: File Copy Silently Fails
**Likelihood:** Low
**Impact:** Critical (deploys broken code)
**Mitigation:**
- Verify file size after copy (should be ~3,441 lines)
- Run linter immediately after copy to confirm 0 violations
- Compare checksums if paranoid
**Owner:** Build agent

#### Risk 3: KV Namespace Not Bound
**Likelihood:** Medium
**Impact:** High (all tests return false, looks like it "works" but doesn't)
**Mitigation:**
- Verify KV binding in Astro config
- Test 1 should explicitly check a KNOWN member (not test data)
**Owner:** Build agent

### HIGH RISKS

#### Risk 4: Tests Pass Locally, Fail in Production
**Likelihood:** Medium (common with env-dependent code)
**Impact:** High (Sunrise Yoga members can't access content)
**Mitigation:**
- Run smoke tests in production immediately after deploy
- Keep rollback script ready
- Monitor Sunrise Yoga error logs for 24h post-deploy
**Owner:** Post-deployment monitoring (outside scope)

#### Risk 5: Manual Test Fatigue
**Likelihood:** Medium
**Impact:** Medium (skipped tests, false confidence)
**Mitigation:**
- Copy-paste curl commands (no typing errors)
- Document expected vs actual output side-by-side
- Treat failed test as deployment blocker (no "ship and fix later")
**Owner:** Build agent

### MEDIUM RISKS

#### Risk 6: "Harbor" Name Confusion
**Likelihood:** Low
**Impact:** Medium (team forgets actual file/package names)
**Mitigation:**
- Keep "MemberShip" in file paths for now
- Use "Harbor" only in comments/docs
- Full rebrand only after 30-day stability proof
**Owner:** Documentation

#### Risk 7: Scope Creep via "Quick Improvements"
**Likelihood:** High (natural developer instinct)
**Impact:** Medium (delays ship date, adds bugs)
**Mitigation:**
- Reject ANY changes not in the 5-step execution plan
- "No" is a complete sentence
- Defer all improvements to V2 backlog
**Owner:** Phil Jackson (gatekeeper)

### LOW RISKS

#### Risk 8: Curl Commands Don't Match Production API
**Likelihood:** Low
**Impact:** Low (easy to fix during testing)
**Mitigation:**
- Verify API endpoint paths in `sandbox-entry.ts` before testing
- Adapt curl commands if needed
**Owner:** Build agent

---

## BUILD EXECUTION CHECKLIST

### Phase 1: Preparation (5 min)
- [ ] Verify source file exists: `deliverables/membership-fix/sandbox-entry.ts`
- [ ] Verify source file has 0 violations: `npm run lint` (or equivalent)
- [ ] Read target file to understand current state
- [ ] Locate `astro.config.mjs` for plugin registration

### Phase 2: File Operations (2 min)
- [ ] Copy clean file to target: `cp deliverables/membership-fix/sandbox-entry.ts plugins/membership/src/sandbox-entry.ts`
- [ ] Verify copy succeeded: `wc -l plugins/membership/src/sandbox-entry.ts` (should show ~3,441 lines)
- [ ] Run linter on target file: confirm 0 violations

### Phase 3: Configuration (3 min)
- [ ] Edit `astro.config.mjs` to import and register Harbor plugin
- [ ] Verify syntax: `npm run build` (or equivalent)
- [ ] Check for KV namespace binding (resolve Open Question #1)

### Phase 4: Testing (10 min)
- [ ] Start dev server: `npm run dev`
- [ ] Run all 6 curl tests sequentially
- [ ] Document actual output in `plugins/membership/TEST-RESULTS.md`
- [ ] Verify all tests pass (no `{"isMember": true}` for invalid members)

### Phase 5: Deployment (5 min)
- [ ] Git add changed files
- [ ] Git commit with clear message: "fix: Harbor plugin - resolve 4 violations via clean file copy"
- [ ] Push to main (or create PR if required)
- [ ] Verify CI passes (if applicable)

### Phase 6: Verification (5 min)
- [ ] Confirm deployment to Sunrise Yoga
- [ ] Rerun curl tests against production URL
- [ ] Monitor error logs for 10 minutes
- [ ] Mark deployment complete

**Total estimated time:** 30 minutes

---

## SUCCESS CRITERIA

### V1.0.1 Ships When:
1. ✅ `plugins/membership/src/sandbox-entry.ts` has **0 linter violations**
2. ✅ All **6 smoke tests pass** (documented in TEST-RESULTS.md)
3. ✅ Plugin is **registered in astro.config.mjs**
4. ✅ Code is **committed to version control**
5. ✅ Sunrise Yoga can **validate memberships in production**

### V1 is Stable When:
- **30 days pass** with zero hotfixes/patches
- No "optimizations" or "cleanups" applied to working code
- No production errors related to membership checks

**If stable:** Unlock automation (convert 6 curls to CI script)
**If unstable:** Root cause analysis, Steve's discipline process stays

---

## DEFERRED TO V2 (DO NOT BUILD)

### Features
- Admin UI (View Members, View Plans, Add Member buttons)
- Analytics dashboard
- AI-driven engagement suggestions
- Retention workflows
- Billing integration beyond Stripe webhooks
- Referral/viral mechanics
- Email notifications
- SSO/OAuth complexity

### Infrastructure
- Automated test suite (unlocked after 30-day stability)
- Performance monitoring beyond basic error logs
- Multi-tenancy support
- Rate limiting (KV handles this automatically)

### Branding
- Full "Harbor" rebrand (file renames, package name changes)
- Marketing site / landing page
- Public NPM package (currently internal-only)

---

## PHILOSOPHICAL ALIGNMENT

### From Elon (Speed)
> "Technical simplicity wins because **shipping beats perfecting**. You can't A/B test a product that doesn't exist."

### From Steve (Durability)
> "The metric isn't time-to-ship. It's **time-to-break**."

### From Essence Document
> "Works immediately. Zero config. Never breaks."

### Phil's Synthesis
Both are right. Speed without discipline creates chaos. Discipline without speed creates bureaucracy. Harbor ships fast (30 min) AND ships right (30-day freeze). That's the triangle offense.

---

## FINAL MARCHING ORDERS

**To the build agent:**

1. Your job is **NOT** to improve this code. Your job is to **copy it**.
2. If you see "opportunities for optimization," ignore them. The code is done.
3. The 6 curl tests are **mandatory**. Passing 5/6 is failure.
4. If anything is unclear, ask. Do not improvise.
5. Document everything. Future you will thank present you.

**Ship the fix. Kill the theater. Respect the craft.**

---

*This blueprint is the single source of truth for V1.0.1. Any deviations require Phil's approval.*

**Status:** Locked and loaded. Ready for build.
**Owner:** Build agent (single session execution)
**Timeline:** <30 minutes from green light to deployment
**Next step:** Execute Phase 1.
