# Build Blueprint: worker_loaders Binding for Sandboxed Plugins

**Issue:** GitHub #73 - Sandboxed plugins fail to load in production due to missing `worker_loaders` binding

**Essence:** Infrastructure that makes sandboxed plugins actually work. The feeling: relief. Zero surprise. It just works.

---

## 🔒 LOCKED DECISIONS

### Decision 1: Ship Timeline & Approach
**Proposed by:** Elon (ship in 2 minutes) vs Steve (auto-inject at build time)
**Winner:** **Synthesis - Progressive rollout**
**Why:** Both were right. Elon correct on urgency; Steve correct on durability.

**Locked:**
- **Phase 1 (Ship NOW - within 24 hours):** Manual binding configuration
- **Phase 2 (Within days):** Auto-detection and injection at build time
- Ship the fix immediately, but ship it toward the right architecture

### Decision 2: Fail-Fast Philosophy
**Proposed by:** Steve
**Winner:** **Steve (Elon conceded)**
**Why:** "No silent failures. No debugging archaeology" is non-negotiable.

**Locked:**
- Fail at build time, NEVER at runtime
- Explicit, actionable error messages
- No production deployments with missing bindings
- Build validation catches misconfiguration before deploy

### Decision 3: Configuration Approach
**Proposed by:** Steve (zero config) vs Elon (simple docs)
**Winner:** **Steve's vision, Elon's pragmatism on timeline**
**Why:** Zero config is the goal; manual config is the bridge.

**Locked:**
- **v1:** One-line manual config with crystal-clear docs
- **v2:** Auto-detection and injection (no manual steps)
- Binding name: `LOADER` (singular, standardized, non-negotiable)
- No custom naming, no configuration flexibility

### Decision 4: Priority & Urgency
**Proposed by:** Both (unanimous)
**Winner:** **P0 - Existential fix**
**Why:** Broken plugins in production = broken promise to users.

**Locked:**
- This is not a feature; this is stopping the bleeding
- Every hour of delay = users churning
- Quality matters, but working > wonderful for v1
- Measure before investing further

### Decision 5: Design Philosophy
**Proposed by:** Steve
**Winner:** **Steve (with Elon's pragmatic timeline)**
**Why:** Infrastructure IS interface when it breaks.

**Locked:**
- Best infrastructure is invisible infrastructure
- Zero-surprise deployment is the UX goal
- "Relief" is the emotional outcome (not excitement)
- Developers should never think about this again

### Decision 6: Validation & Instrumentation
**Proposed by:** Elon
**Winner:** **Elon**
**Why:** Data must prove plugins are worth the investment.

**Locked:**
- Instrument plugin usage immediately
- Track: % of users with sandboxed plugins enabled
- Track: Error rates before/after fix
- Decision point: If <5% usage, consider deprecating entire plugin system in v2

---

## 📦 MVP FEATURE SET (What Ships in v1)

### Phase 1: Immediate Fix (24 hours)
1. **Manual binding configuration**
   - Add `worker_loaders` binding to `wrangler.jsonc`
   - Binding name: `LOADER`
   - One line: `"worker_loaders": [{ "binding": "LOADER" }]`

2. **Documentation**
   - Surgical, one-step instructions
   - No philosophical explanations
   - Format: "Add this. Deploy. Done."
   - Clear error message if binding missing

3. **Testing**
   - Deploy verification that plugins load
   - Confirm sandboxed Workers can access binding
   - Test in production-like environment

### Phase 2: Auto-Injection (Within days, not months)
1. **Build-time detection**
   - Scan for sandboxed plugin usage
   - Auto-detect if `worker_loaders` binding needed

2. **Automatic injection**
   - Inject binding into wrangler config at build time
   - No manual configuration required
   - Log action: "Sandboxed plugins detected. Adding worker_loaders binding automatically."

3. **Build-time validation**
   - Fail build if binding can't be injected
   - Explicit error with resolution steps
   - Zero runtime failures

### What's NOT in v1
- Custom binding names (rejected by Steve)
- Optional configuration (rejected - must be required)
- Branding/naming exercises (rejected by Elon as "design theater")
- Complex documentation explaining "why" (rejected by Steve)
- Graceful degradation (rejected - fail loud, fail fast)

---

## 📁 FILE STRUCTURE (What Gets Built)

### Phase 1: Manual Config
```
/
├── wrangler.jsonc (MODIFY)
│   └── Add worker_loaders binding
├── docs/
│   └── plugin-deployment.md (NEW)
│       └── One-line setup instructions
└── tests/
    └── plugin-binding.test.ts (NEW)
        └── Verify binding exists in deployed Worker
```

### Phase 2: Auto-Injection
```
/
├── build-tools/
│   ├── detect-plugins.ts (NEW)
│   │   └── Scan codebase for sandboxed plugin usage
│   ├── inject-binding.ts (NEW)
│   │   └── Auto-inject worker_loaders into config
│   └── validate-config.ts (NEW)
│       └── Build-time validation with clear errors
├── wrangler.jsonc (MODIFY)
│   └── Auto-populated by build process
├── package.json (MODIFY)
│   └── Update build script to include detection/injection
└── tests/
    ├── auto-injection.test.ts (NEW)
    │   └── Verify auto-detection works
    └── build-validation.test.ts (NEW)
        └── Verify build fails appropriately
```

### Instrumentation Files
```
/
└── analytics/
    ├── plugin-usage-tracker.ts (NEW)
    │   └── Track % of users with sandboxed plugins
    └── error-monitoring.ts (MODIFY)
        └── Track binding-related errors before/after fix
```

---

## ❓ OPEN QUESTIONS (What Still Needs Resolution)

### 1. Plugin System Viability (Elon's Challenge)
**Question:** Do we even need sandboxed plugins in v1?
**Why it matters:** If <5% of users touch this, kill the entire plugin system
**Who decides:** Data from instrumentation (after Phase 1 ships)
**Timeline:** Review usage metrics 2 weeks post-deployment
**Decision criteria:**
- If <5% usage → Deprecate in v2
- If >20% usage → Invest in Steve's full vision
- If 5-20% usage → Maintain but don't expand

### 2. Scaling Architecture (Elon's Concern)
**Question:** What happens at 1,000+ plugins?
**Sub-questions:**
- Worker loader limits on Cloudflare
- Cold start latency storms
- Memory overhead per sandbox
**Why it matters:** The binding scales; the architecture it enables might not
**Who decides:** Performance team + architecture review
**Timeline:** Only relevant if usage >20%

### 3. Backward Compatibility (Elon's Warning)
**Question:** How do we handle legacy deployments when moving to auto-injection?
**Why it matters:** "Mandatory binding" could break existing deploys
**Who decides:** Platform team
**Timeline:** Before Phase 2 implementation
**Options:**
- Detect existing manual config, don't override
- Migration guide for legacy deployments
- Version-gated rollout

### 4. Error Message Copy
**Question:** Exact wording for build-time validation errors
**Why it matters:** Steve's "fail loudly" needs concrete implementation
**Who decides:** Steve (design) + Engineering (technical accuracy)
**Timeline:** Before Phase 2
**Requirements:**
- Clear, actionable, non-technical
- Include exact code to add
- Link to one-line docs

### 5. Build Tool Integration
**Question:** Where does auto-detection/injection live?
**Options:**
- Custom build script in package.json
- Wrangler plugin
- Separate CLI tool
**Who decides:** Engineering lead
**Timeline:** Phase 2 planning
**Steve's preference:** Whatever is most invisible to developer

---

## 🚨 RISK REGISTER (What Could Go Wrong)

### High-Severity Risks

#### Risk 1: Users Don't Read Docs (Phase 1)
**Probability:** High
**Impact:** High
**Elon's take:** "They never do"
**Steve's take:** "That's why we need auto-injection"
**Mitigation:**
- Make error message the documentation
- When binding missing, error shows exact line to add
- Consider pre-commit hook that validates config
- Fast-track Phase 2 (auto-injection) if adoption <50% in week 1

#### Risk 2: Build-Time Validation False Positives (Phase 2)
**Probability:** Medium
**Impact:** High
**Description:** Auto-detection incorrectly identifies need for binding
**Mitigation:**
- Conservative detection (only inject when certain)
- Allow manual override in edge cases
- Comprehensive test suite for detection logic
- Gradual rollout with monitoring

#### Risk 3: Plugin System Isn't Actually Valuable
**Probability:** Unknown (Elon's concern)
**Impact:** Critical
**Description:** We're fixing infrastructure for a feature nobody uses
**Elon's take:** "What % of users actually need this?"
**Mitigation:**
- Ship instrumentation WITH Phase 1
- Set hard decision threshold (5% usage)
- Be willing to kill the plugin system entirely
- Don't invest in Phase 2 until data validates demand

#### Risk 4: Cloudflare Platform Limits at Scale
**Probability:** Medium (if plugins succeed)
**Impact:** Critical
**Elon's concerns:**
- Worker loader limits (caps on number of Workers)
- Cold start penalty (>50ms per plugin)
- Memory explosion at 100x users
**Mitigation:**
- Document current limits from Cloudflare
- Load testing with 100+ plugins
- Architectural review if usage >1,000 active plugins
- Potential pivot to different isolation model

### Medium-Severity Risks

#### Risk 5: Migration Complexity (Phase 1 → Phase 2)
**Probability:** Medium
**Impact:** Medium
**Description:** Users who manually configured binding get confused by auto-injection
**Mitigation:**
- Auto-detection respects existing manual config
- Clear migration communication
- Version all changes explicitly
- Maintain backward compatibility for 2+ versions

#### Risk 6: Testing Gaps
**Probability:** Medium
**Impact:** Medium
**Elon's observation:** "That it wasn't caught tells me testing is broken"
**Mitigation:**
- Add integration test for plugin loading in production-like env
- CI/CD validation that binding exists in deploy artifacts
- Smoke tests post-deployment
- Fix broader testing gaps, not just this issue

### Low-Severity Risks

#### Risk 7: Developer Confusion on "Why"
**Probability:** Low (with good docs)
**Impact:** Low
**Steve's take:** "Don't explain why, just tell them what to add"
**Mitigation:**
- Docs focus on "what" not "why"
- Link to advanced docs for curious developers
- Error messages are self-contained

#### Risk 8: Bikeshedding on Naming
**Probability:** Low (pre-decided)
**Impact:** Low
**Elon's warning:** "Don't waste time in branding meetings"
**Mitigation:**
- Binding name locked: `LOADER`
- No internal naming debates
- No developer-facing product names

---

## 🎯 SUCCESS CRITERIA

### Phase 1 Success (24 hours)
- [ ] Binding documented in one location
- [ ] Deploy verification passes (plugins load in production)
- [ ] Zero production runtime errors related to missing binding
- [ ] Instrumentation tracking usage deployed

### Phase 2 Success (Within days)
- [ ] 100% of new deployments auto-inject binding
- [ ] Build fails before deploy if misconfigured
- [ ] Zero manual configuration steps required
- [ ] Error messages are clear and actionable

### Long-Term Success (2 weeks post-Phase 1)
- [ ] Usage data shows >5% of users leveraging sandboxed plugins (else deprecate)
- [ ] Zero support tickets about missing binding
- [ ] Developer feedback: "It just worked"
- [ ] No scaling issues at current load

---

## 🤝 SYNTHESIS: Where Elon & Steve Agreed

Despite the debates, here's the unified vision:

1. **This is P0.** Broken plugins = broken promise. Ship immediately.
2. **Fail fast, fail loud.** Never let broken config reach production.
3. **Measure before investing.** Data decides if plugins deserve more resources.
4. **Best infrastructure is invisible.** Goal is zero cognitive load.
5. **Working > wonderful for v1.** Ship, then polish.
6. **Question the premise.** If plugins aren't valuable, kill them entirely.

**The real product:** Not the binding. The promise that plugins work. Keep the promise or kill plugins entirely.

---

## 📋 IMMEDIATE NEXT ACTIONS

### For Engineering Team:
1. Add `worker_loaders` binding to `wrangler.jsonc` (2 minutes)
2. Write one-line setup doc (5 minutes)
3. Test deploy verification (10 minutes)
4. Add usage instrumentation (20 minutes)
5. Ship to production (1 minute)
6. **Total Phase 1 time: <1 hour**

### For Product Team:
1. Monitor usage metrics daily for 2 weeks
2. Collect error rates and support tickets
3. Decision meeting at 2-week mark: continue, expand, or kill plugins

### For Platform Team:
1. Design auto-detection logic (Phase 2 prep)
2. Research Cloudflare Worker limits for scaling analysis
3. Plan build-time validation implementation

---

**Blueprint Status:** LOCKED
**Owner:** Engineering Lead (Phase 1), Platform Team (Phase 2)
**Review Date:** 2 weeks post-Phase 1 deployment
**Kill Switch:** If usage <5%, deprecate plugin system in next major version

---

*Orchestrated by Phil Jackson, Zen Master of the Great Minds Agency*
*"The strength of the team is each individual member. The strength of each member is the team."*
