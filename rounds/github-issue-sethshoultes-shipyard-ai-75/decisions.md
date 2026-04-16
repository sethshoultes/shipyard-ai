# Decisions Blueprint: GitHub Issue #75
## Deploy Sunrise Yoga + Verify Plugins

**Blueprint Owner:** Phil Jackson (Zen Master)
**Date:** 2026-04-16
**Status:** LOCKED FOR BUILD

---

## Executive Summary

**What We're Building:** A deployment verification system that proves Sunrise Yoga plugins (`membership`, `eventdash`) load correctly in production with zero errors.

**Core Philosophy:** Ship fast (bash + curl), prove everything (smoke tests), automate proof (CI/CD pipeline). Quality isn't slow — ceremony is.

**Build Complexity:** Trivial (5-15 minute agent session)
**Strategic Importance:** Critical (establishes platform trust pattern)

---

## Locked Decisions

### Decision 1: Implementation Approach

**Proposed by:** Elon (Round 1)
**Winner:** Elon with Steve's quality gates
**Consensus:** Round 2

**What Ships:**
- Bash script + curl assertions for smoke testing
- No abstraction layers, no fancy tooling
- Fix config → rebuild → deploy → verify → commit

**Why This Won:**
- **Elon's technical argument:** Bash scripts are timeless, zero dependencies, debuggable in 30 seconds, impossible to over-engineer
- **Steve's quality gate:** Scripts must prove certainty, not just "probably works"
- **Synthesis:** Simplest tool that guarantees correctness

**Implementation Constraints:**
- Must complete in ONE agent session (< 15 minutes)
- Must use exact curl commands from PRD
- Must run Python assertion to verify plugin IDs match manifest

---

### Decision 2: Verification Standards

**Proposed by:** Steve (Round 1)
**Winner:** Steve
**Elon's concession:** Round 2 ("The Python assertion isn't bureaucratic — it's a contract")

**Zero Tolerance Policy:**
1. **No INTERNAL_ERROR in production** — Fix or don't deploy
2. **Manifest endpoint is source of truth** — Must always reflect reality
3. **Smoke tests run before every deploy** — Prove plugins work before marking success

**Why This Won:**
- **Steve's brand argument:** Every error is a micro-betrayal; first impressions establish trust
- **Elon's technical concession:** Developer-facing APIs and error messages matter; clean responses = professional product
- **User impact:** When developers hit manifest endpoint, clean JSON builds instant confidence

**Non-Negotiable Checks:**
- [ ] `GET /api/manifest` returns clean JSON with `membership` and `eventdash`
- [ ] `POST /api/membership/admin` returns valid response (not 500)
- [ ] `POST /api/eventdash/admin` returns valid response (not 500)
- [ ] Python assertion passes: `assert set(plugins) == {'membership', 'eventdash'}`

---

### Decision 3: Plugin Architecture (DEFERRED)

**Proposed by:** Elon (Round 1) — "Merge membership + eventdash into one studio-management plugin"
**Counter by:** Steve (Round 2) — "You're solving for YOUR convenience, not the customer's mental model"

**Status:** **OPEN QUESTION** — Must resolve within 30 days post-deploy

**The Debate:**
- **Elon:** Two plugins = unnecessary complexity; merge reduces moving parts and breakage surface
- **Steve:** Separate domains match studio owner mental model ("Who are my members?" vs "What's happening today?"); merging murders clarity

**Resolution Timeline:**
- **Ship v1:** Keep current two-plugin architecture (don't block deployment)
- **Within 30 days:** Provide customer evidence OR merge
  - If we have 3+ customers requesting separate membership/events → justified
  - If it's only architectural purity → merge into `studio-management`

**Decision Criteria:**
- Does separation serve actual customer workflow?
- Does plugin abstraction tax exceed organizational clarity benefit?
- Are customers asking for granular plugin control?

---

### Decision 4: Post-Deploy Automation

**Proposed by:** Elon (Round 2)
**Winner:** Elon
**Steve's concession:** "You're 100% right. Manual verification doesn't scale."

**Locked Timeline:**

1. **Immediate (day 0):** Instrument plugin performance
   - Add load time tracking to both plugins
   - Alert if > 50ms (Cloudflare Workers CPU limit awareness)
   - Track cold start costs

2. **7 days:** Automate smoke tests in CI/CD
   - Plugin verification runs on every PR
   - Blocks merge if manifest check fails
   - No human touches deployment verification after this

3. **30 days:** Justify or merge plugin separation (see Decision 3)

**Why This Won:**
- **Elon's scaling argument:** Manual verification doesn't scale to 100x deployments (10 customers → 1,000 customers)
- **Steve's quality preservation:** Automate certainty, not chaos — we prove it works perfectly once FIRST, then scale

**Success Metrics:**
- CI/CD pipeline has zero manual verification steps by day 7
- Plugin smoke test failures caught in PR, not production
- Agent time shifts from deployment fixes to customer features

---

## MVP Feature Set (What Ships in v1)

### IN SCOPE (Must Ship This Session)

1. **Fix Configuration**
   - Update `wrangler.jsonc` with correct plugin paths
   - Fix entrypoints for `membership` and `eventdash` plugins

2. **Build & Deploy**
   - Run `npm run build`
   - Deploy to production with `npm run deploy`

3. **Smoke Test Suite**
   ```bash
   # Manifest verification
   curl https://sunrise-yoga-jkb.shipyard.sh/api/manifest | jq

   # Plugin health checks
   curl -X POST https://sunrise-yoga-jkb.shipyard.sh/api/membership/admin \
     -H "Content-Type: application/json" \
     -d '{"type":"page_load"}'

   curl -X POST https://sunrise-yoga-jkb.shipyard.sh/api/eventdash/admin \
     -H "Content-Type: application/json" \
     -d '{"type":"page_load"}'

   # Python assertion
   python3 -c "import requests; manifest = requests.get('...').json(); \
     plugins = {p['id'] for p in manifest['plugins']}; \
     assert set(plugins) == {'membership', 'eventdash'}, f'Expected membership+eventdash, got {plugins}'"
   ```

4. **Commit & Push**
   - Document what was fixed
   - Push to main branch

### OUT OF SCOPE (V2 / Post-Deploy)

- CI/CD automation (7-day timeline)
- Plugin load performance optimization (30-day timeline)
- Plugin architecture merge/justification (30-day timeline)
- Lazy-loading plugins optimization
- CDN edge caching for manifest

---

## File Structure (What Gets Built)

### Files Modified in This Session

```
shipyard-ai/
├── wrangler.jsonc              # Fix plugin paths
├── plugins/
│   ├── membership/
│   │   └── entrypoint.ts      # Verify correct export
│   └── eventdash/
│       └── entrypoint.ts      # Verify correct export
└── (build outputs)             # Generated by npm run build
```

### Files NOT Modified

- No new abstractions
- No new test frameworks
- No CI/CD configs (post-deploy work)
- No manifest generation changes

### Verification Artifacts

**Local smoke test script** (recommended but optional):
```bash
# .github/scripts/smoke-test.sh
#!/bin/bash
set -e

BASE_URL="https://sunrise-yoga-jkb.shipyard.sh"

echo "Testing manifest..."
curl -f "$BASE_URL/api/manifest" | jq -e '.plugins | length == 2'

echo "Testing membership plugin..."
curl -f -X POST "$BASE_URL/api/membership/admin" \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}'

echo "Testing eventdash plugin..."
curl -f -X POST "$BASE_URL/api/eventdash/admin" \
  -H "Content-Type: application/json" \
  -d '{"type":"page_load"}'

echo "All plugins verified ✓"
```

---

## Open Questions (What Still Needs Resolution)

### Q1: Plugin Architecture Justification (30-day deadline)

**Question:** Should `membership` and `eventdash` remain separate plugins or merge into `studio-management`?

**Decision Criteria:**
- Customer workflow evidence
- Performance metrics (do separate plugins add measurable latency?)
- Future roadmap (are we building multi-plugin marketplace or single studio solution?)

**Who Decides:** Product team + customer interviews

**Blocking:** No — ship current architecture, revisit with data

---

### Q2: Cloudflare Workers Cold Start Costs (Instrumentation needed)

**Question:** How much do plugin loads cost per request? Are they CPU-bound or I/O-bound?

**Next Steps:**
- Instrument plugin load times immediately post-deploy
- Track cold start frequency and duration
- If > 50ms average, investigate lazy-loading

**Who Decides:** Elon's performance audit

**Blocking:** No — optimize after proving current implementation works

---

### Q3: Manifest Generation Bottleneck at Scale (Future scaling question)

**Question:** Is manifest dynamic or static? Will it bottleneck at 100x traffic?

**Elon's proposal:** Static manifest, regenerated on deploy, cached at CDN edge for 60s

**Next Steps:**
- Document current manifest generation approach
- Add performance monitoring
- If p99 latency > 200ms at 10,000 DAU, implement caching

**Who Decides:** Performance metrics in production

**Blocking:** No — current scale doesn't justify optimization

---

## Risk Register (What Could Go Wrong)

### Risk 1: Agent Session Exceeds 15 Minutes ⚠️ MEDIUM

**Probability:** Low
**Impact:** Medium (indicates tooling problems, not fatal)

**Symptoms:**
- Build step hangs
- Deploy credentials missing
- Smoke tests timeout

**Mitigation:**
- Use exact bash commands from PRD (pre-tested)
- Verify wrangler authentication before starting
- If stuck > 15 min, escalate to human operator

**Owner:** Build agent + tooling team

---

### Risk 2: Smoke Tests Pass but Production Still Broken 🔴 HIGH

**Probability:** Low
**Impact:** High (user-facing failures)

**Root Causes:**
- Smoke tests check wrong endpoints
- Production environment differs from test
- Race conditions in plugin loading

**Mitigation:**
- Use EXACT production URLs in smoke tests (no localhost)
- Python assertion must match manifest reality
- Manual verification after automated tests pass (just this once)

**Owner:** Steve (quality gate enforcer)

---

### Risk 3: Plugin Architecture Decision Deferred Indefinitely 🟡 LOW

**Probability:** Medium
**Impact:** Low (tech debt accumulates slowly)

**Symptoms:**
- 30-day deadline passes without decision
- No customer interviews conducted
- "We'll revisit next quarter"

**Mitigation:**
- Hard deadline: 2026-05-16 (30 days from today)
- Elon owns performance audit
- Steve owns customer workflow interviews
- Default decision if no data: MERGE (Elon's preference)

**Owner:** Phil Jackson (decision forcing function)

---

### Risk 4: Manual Verification Persists Beyond 7 Days ⚠️ MEDIUM

**Probability:** Medium
**Impact:** Medium (doesn't scale, wastes agent time)

**Symptoms:**
- Day 8 arrives, no CI/CD automation shipped
- "We're too busy with features" excuse
- Next deploy is manual again

**Mitigation:**
- Hard deadline: 2026-04-23 (7 days from today)
- Block all other work until automation ships
- Escalate to Elon if deadline slips

**Owner:** Elon (automation mandate enforcer)

---

## Success Criteria (How We Know We're Done)

### Immediate (End of Agent Session)

- [ ] `wrangler.jsonc` and plugin entrypoints are fixed
- [ ] `npm run build` completes with no errors
- [ ] `npm run deploy` completes successfully
- [ ] Manifest endpoint returns clean JSON with 2 plugins
- [ ] Both plugin admin routes return valid responses (not 500)
- [ ] Python assertion passes
- [ ] Changes committed and pushed to main

### 7-Day Post-Deploy

- [ ] Plugin smoke tests run in CI/CD on every PR
- [ ] Failed plugin loads block merges
- [ ] Zero manual verification needed for deployments

### 30-Day Post-Deploy

- [ ] Plugin architecture decision made (merge or justify)
- [ ] Plugin load times instrumented and analyzed
- [ ] Performance optimization roadmap created (if needed)

---

## Build Phase Instructions (For Agent)

1. **Prerequisites Check**
   ```bash
   # Verify you're in correct directory
   pwd  # Should be /home/agent/shipyard-ai or similar

   # Verify wrangler is configured
   npx wrangler whoami
   ```

2. **Fix Configuration**
   - Open `wrangler.jsonc`
   - Verify plugin paths point to correct entrypoint files
   - Verify `membership` and `eventdash` are registered

3. **Build**
   ```bash
   npm run build
   # Must complete with 0 errors
   ```

4. **Deploy**
   ```bash
   npm run deploy
   # Wait for completion, note deployment URL
   ```

5. **Smoke Test (Run ALL commands)**
   ```bash
   # Test 1: Manifest
   curl https://sunrise-yoga-jkb.shipyard.sh/api/manifest | jq

   # Test 2: Membership plugin
   curl -X POST https://sunrise-yoga-jkb.shipyard.sh/api/membership/admin \
     -H "Content-Type: application/json" \
     -d '{"type":"page_load"}'

   # Test 3: Eventdash plugin
   curl -X POST https://sunrise-yoga-jkb.shipyard.sh/api/eventdash/admin \
     -H "Content-Type: application/json" \
     -d '{"type":"page_load"}'

   # Test 4: Python assertion
   python3 -c "import requests; manifest = requests.get('https://sunrise-yoga-jkb.shipyard.sh/api/manifest').json(); plugins = {p['id'] for p in manifest['plugins']}; assert plugins == {'membership', 'eventdash'}, f'Expected membership+eventdash, got {plugins}'"
   ```

6. **Commit & Push**
   ```bash
   git add .
   git commit -m "fix: Deploy Sunrise Yoga with verified plugins

   - Fixed wrangler.jsonc plugin paths
   - Verified membership and eventdash plugins load correctly
   - All smoke tests passing
   - Manifest endpoint returns clean JSON

   Resolves #75"

   git push origin main
   ```

7. **Report Results**
   - Confirm all smoke tests passed
   - Document any deviations from expected behavior
   - Note build/deploy duration

---

## Philosophical Synthesis (Why These Decisions)

**Elon's Physics:** Ship the simplest thing that could work. Bash scripts over abstractions. Automate certainty.

**Steve's Poetry:** Every endpoint is a promise. Zero tolerance for broken experiences. Quality is invisible until it's missing.

**Zen Master's Truth:** Speed and quality aren't enemies. Ship simple fixes fast (bash + curl), prove they work (smoke tests), then automate proof (CI/CD). Ceremony is slow. Verification is fast.

---

**Ready for build. Ship it.**
