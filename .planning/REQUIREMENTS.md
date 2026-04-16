# Requirements: worker_loaders Binding for Sandboxed Plugins

**Project:** GitHub Issue #73 - Fix wrangler.jsonc worker_loaders binding
**Slug:** `github-issue-sethshoultes-shipyard-ai-73`
**Generated:** 2026-04-16
**Phase:** 1 (Manual Configuration - Ship within 24 hours)

---

## Atomic Requirements (Phase 1 Only)

### Configuration Requirements

- **REQ-1:** Add `worker_loaders` binding to `examples/sunrise-yoga/wrangler.jsonc` with exact structure `"worker_loaders": [{ "binding": "LOADER" }]`
  - **Source:** PRD, EMDASH-GUIDE.md Section 6
  - **Priority:** P0 (Existential)
  - **Verification:** File inspection confirms binding present with exact syntax

- **REQ-2:** Binding name MUST be `LOADER` (singular, standardized, non-negotiable)
  - **Source:** Decisions - Decision 3
  - **Priority:** P0
  - **Rationale:** Emdash conventions require this exact binding name
  - **Verification:** String match in wrangler.jsonc

- **REQ-3:** Binding must be required in configuration (no optional configuration)
  - **Source:** Decisions - Decision 3, "What's NOT in v1"
  - **Priority:** P0
  - **Verification:** No conditional logic around binding usage

- **REQ-4:** Custom binding names must not be supported (locked to `LOADER` only)
  - **Source:** Decisions - Decision 3, "What's NOT in v1"
  - **Priority:** P0
  - **Verification:** Code review confirms no variable binding names

### Build & Deployment Requirements

- **REQ-5:** Build must succeed after adding the binding
  - **Source:** PRD Success Criteria
  - **Priority:** P0
  - **Verification:** `npm run build` exits with code 0

- **REQ-6:** Deploy verification must confirm sandboxed plugins load successfully in production
  - **Source:** Decisions MVP Phase 1
  - **Priority:** P0
  - **Verification:** Post-deploy smoke test of plugin routes

- **REQ-7:** Changes must be committed to repository
  - **Source:** PRD Success Criteria
  - **Priority:** P0
  - **Verification:** `git log` shows commit with wrangler.jsonc modification

### Error Handling Requirements

- **REQ-8:** Configuration must fail at build time (not runtime) if `worker_loaders` binding is missing
  - **Source:** Decisions - Decision 2 (Fail-Fast Philosophy)
  - **Priority:** P0
  - **Verification:** Build with missing binding produces clear error before deploy

- **REQ-9:** Error messages must be explicit and actionable when binding is missing
  - **Source:** Decisions - Decision 2
  - **Priority:** P0
  - **Format:** "worker_loaders binding required. Add to wrangler.jsonc: {...}"
  - **Verification:** Error message inspection confirms actionable guidance

- **REQ-10:** No graceful degradation allowed; system must fail loudly if binding missing
  - **Source:** Decisions "What's NOT in v1"
  - **Priority:** P0
  - **Rationale:** "No silent failures. No debugging archaeology"
  - **Verification:** Test deployment without binding produces loud failure

### Documentation Requirements

- **REQ-11:** One-line setup documentation must be provided with surgical, concise instructions
  - **Source:** Decisions MVP Phase 1
  - **Priority:** P0
  - **Format:** "Add this. Deploy. Done."
  - **Location:** `docs/plugin-deployment.md` or inline in error messages
  - **Verification:** Documentation exists and is under 50 words

- **REQ-12:** Documentation must not include philosophical explanations, only actionable steps
  - **Source:** Decisions MVP Phase 1, Decision 5
  - **Priority:** P0
  - **Rationale:** Steve Jobs' "Don't explain why, just tell them what to add"
  - **Verification:** Documentation review confirms no "why" content

### Instrumentation Requirements

- **REQ-13:** Usage instrumentation must track % of users with sandboxed plugins enabled
  - **Source:** Decisions - Decision 6
  - **Priority:** P0
  - **Purpose:** Data decides if plugins deserve more resources
  - **Verification:** Telemetry endpoint confirms plugin usage tracking

- **REQ-14:** Error rate metrics must be tracked before and after fix deployment
  - **Source:** Decisions - Decision 6
  - **Priority:** P0
  - **Decision Point:** If <5% usage at 2-week mark, deprecate plugin system
  - **Verification:** Monitoring dashboard shows error rate metrics

---

## Success Criteria

### Phase 1 Success (24 hours)
- [ ] `worker_loaders` binding present in `examples/sunrise-yoga/wrangler.jsonc`
- [ ] Build succeeds: `npm run build` exits successfully
- [ ] Deploy verification passes: plugins load in production without INTERNAL_ERROR
- [ ] Changes committed to git with descriptive commit message
- [ ] Zero production runtime errors related to missing binding
- [ ] One-line documentation exists and is accessible
- [ ] Usage instrumentation deployed and collecting data

### Long-Term Success (2 weeks post-Phase 1)
- [ ] Usage data shows >5% of users leveraging sandboxed plugins (else deprecate)
- [ ] Zero support tickets about missing binding
- [ ] Developer feedback: "It just worked"
- [ ] No scaling issues at current load
- [ ] Error rates reduced to zero for binding-related failures

---

## Constraints from Locked Decisions

### 1. Binding Name (Decision 3)
Binding name is locked to `LOADER` (singular). No custom naming flexibility allowed. This is non-negotiable per EMDASH-GUIDE.md Section 6.

### 2. Fail-Fast Philosophy (Decision 2)
System must fail at build time, NEVER at runtime. No silent failures or runtime debugging archaeology permitted. Build validation catches misconfiguration before deploy.

### 3. Configuration Approach (Decision 3)
Phase 1 uses manual configuration only. Auto-detection/injection deferred to Phase 2. One-line manual config is the immediate solution.

### 4. Priority & Urgency (Decision 4)
This is P0 - Existential fix. Broken plugins in production = broken promise to users. Every hour of delay = users churning.

### 5. Design Philosophy (Decision 5)
Best infrastructure is invisible infrastructure. Zero-surprise deployment is the UX goal. "Relief" is the emotional outcome, not excitement.

### 6. Documentation Style (Decision 3)
Docs must be surgical one-step instructions with format: "Add this. Deploy. Done." No "why" explanations, only actionable "what."

### 7. Quality vs Delivery (Decision 4)
For Phase 1, working > wonderful. Quality matters, but delivery speed is critical.

### 8. Timeline Split (Decision 1)
- **Phase 1 (NOW - within 24 hours):** Manual binding configuration
- **Phase 2 (Within days):** Auto-detection and injection at build time

---

## Out of Scope (Phase 2 or Rejected)

### Phase 2 Deferred Items
- Auto-detection of sandboxed plugin usage
- Automatic injection of binding at build time
- Build-time validation logic (comprehensive)
- Build tool plugin development (custom script vs Wrangler plugin vs CLI tool)
- Backward compatibility migration guide
- Scaling architecture for 1,000+ plugins

### Explicitly Rejected (Never)
- Custom binding names (explicitly rejected by Steve)
- Optional configuration (explicitly rejected - must be required)
- Branding/naming exercises (rejected by Elon as "design theater")
- Complex documentation explaining "why" (rejected by Steve)
- Graceful degradation (rejected - fail loud, fail fast)

---

## Verification Methods

### 1. Configuration Presence
**Method:** File inspection
```bash
grep -q '"worker_loaders"' examples/sunrise-yoga/wrangler.jsonc && echo "PASS" || echo "FAIL"
```

### 2. Build Verification
**Method:** Build execution
```bash
cd examples/sunrise-yoga && npm run build
# Exit code 0 = PASS, non-zero = FAIL
```

### 3. Deployment Verification
**Method:** Deploy to production-like environment
```bash
cd examples/sunrise-yoga && \
  source /home/agent/shipyard-ai/.env && \
  export CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID && \
  npm run build && \
  npx wrangler deploy
# Check for deployment success
```

### 4. Plugin Loading Test
**Method:** Post-deploy smoke test
```bash
curl -I https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/manifest
# Expected: 200 OK, not 500 INTERNAL_ERROR
```

### 5. Git Commit Verification
**Method:** Git log inspection
```bash
git log -1 --oneline -- examples/sunrise-yoga/wrangler.jsonc
# Should show recent commit with binding addition
```

### 6. Error Message Validation
**Method:** Intentionally break config and verify error
```bash
# Temporarily remove binding from test config
# Run build
# Verify error message is clear and actionable
```

### 7. Documentation Validation
**Method:** Manual review
- Verify docs exist in one location
- Confirm "Add this. Deploy. Done." format
- Word count <50 words
- No philosophical explanations

### 8. Instrumentation Deployment
**Method:** Check production telemetry
```bash
# Verify metrics endpoint exists
curl https://sunrise-yoga.seth-a02.workers.dev/_emdash/api/telemetry
# Should include plugin usage tracking
```

### 9. No Runtime Failures
**Method:** Production monitoring
- Monitor Cloudflare Workers logs for 24+ hours
- Filter for "worker_loaders" or "INTERNAL_ERROR"
- Zero occurrences = PASS

### 10. Test Creation
**Method:** Automated test suite
- Create `plugin-binding.test.ts`
- Verify binding exists in deployed Worker
- Verify plugins load successfully
- Run in CI/CD pipeline

---

## Technical Context

### Current State (Problem)
```jsonc
// examples/sunrise-yoga/wrangler.jsonc
{
  "name": "sunrise-yoga",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [...],
  "r2_buckets": [...],
  "observability": {"enabled": true}
  // MISSING: worker_loaders binding
}
```

**Symptom:** Membership plugin routes return `{"error": "INTERNAL_ERROR"}` in production.

### Required State (Solution)
```jsonc
// examples/sunrise-yoga/wrangler.jsonc
{
  "name": "sunrise-yoga",
  "compatibility_date": "2026-03-29",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [...],
  "r2_buckets": [...],
  "observability": {"enabled": true},
  "worker_loaders": [
    {
      "binding": "LOADER"
    }
  ]
}
```

**Result:** Membership plugin loads in sandboxed Worker isolate, routes return valid responses.

### Reference Implementation
See EMDASH-GUIDE.md Section 6 (lines 1005-1013) for canonical configuration:

> To enable sandboxing, configure `worker_loaders` in `wrangler.jsonc`:
> ```jsonc
> {
>   "worker_loaders": [{ "binding": "LOADER" }]
> }
> ```
> Sandboxed plugins require Cloudflare Workers with paid plan ($5/mo minimum).

---

## Timeline & Resource Allocation

**Total Phase 1 Time Budget:** <1 hour

| Task | Estimated Time | Owner |
|------|---------------|-------|
| Add binding to wrangler.jsonc | 2 minutes | Engineer |
| Write one-line setup doc | 5 minutes | Engineer |
| Test deploy verification | 10 minutes | Engineer |
| Add usage instrumentation | 20 minutes | Engineer |
| Ship to production | 1 minute | Engineer |
| Monitor for 24 hours | Passive | DevOps |

**Decision Gate:** At 2-week mark post-deployment, review usage data. If <5% of users leverage sandboxed plugins, deprecate entire plugin system in next major version.

---

## Risk Mitigation

### High-Severity Risks

1. **Users Don't Read Docs** → Make error message the documentation
2. **Silent Regression** → Add build-time validation
3. **Plugin System Not Valuable** → Ship instrumentation immediately, measure usage
4. **Testing Gaps** → Add integration tests for binding presence

### Medium-Severity Risks

1. **Migration Complexity (Phase 1→2)** → Auto-detection respects existing manual config
2. **Deployment Validation** → Add post-deploy smoke tests

---

## Kill Switch Decision Criteria

**Trigger:** If usage data shows <5% of users leveraging sandboxed plugins 2 weeks post-deployment.

**Action:** Deprecate entire plugin system in next major version. Do not invest in Phase 2.

**Rationale:** "We're fixing infrastructure for a feature nobody uses. What % of users actually need this?" - Elon (Decisions, Risk #3)

---

**Requirements Status:** LOCKED
**Owner:** Engineering Lead
**Review Date:** 2 weeks post-Phase 1 deployment
**Last Updated:** 2026-04-16
