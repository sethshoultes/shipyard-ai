# Decisions: Membership Plugin Production Fix
## Blueprint for Build Phase

*Consolidated by Phil Jackson from Great Minds Agency debates*

---

## 📊 DEBATE OUTCOMES

### Round 1: Initial Positions
**Elon's stance:** 5-minute hardcoded fix, cut everything else as scope creep
**Steve's stance:** Fix the systemic issue (convention over configuration), make errors actionable
**Outcome:** Both partially correct—need BOTH fixes, not either/or

### Round 2: Refinement & Lock-In
**Elon's concessions:**
- Error messages DO matter (5 minutes investment)
- Local-production parity is non-negotiable
- Plugin system IS the product (if extensibility is value prop)
- Respecting developer time means making system obvious

**Steve's concessions:**
- PRD was over-engineered (124 lines for "make it load")
- "Read all docs" is process theater
- Should take <30 minutes if system is obvious
- Ship fast, validate with 100 users before adding abstraction

### Final Synthesis
**What ships:** Both the hardcoded fix AND the convention system (40 minutes total)
**Why both:** Hardcoded fix = immediate relief. Convention system = prevents 5,000 hours of future debugging
**How to execute:** Sequential—fix first (10 min), then prevent recurrence (30 min), ship same session

---

## 🔒 LOCKED DECISIONS

### Decision 1: Immediate Fix Strategy
**Proposed by:** Elon (Round 1)
**Winner:** Elon with Steve's Quality Constraint
**Why:** Binary failure with zero users requires immediate fix, but Steve's "fix the root cause" principle prevents creating infinite future pain

**Implementation:**
- Hardcode the entrypoint path to actual file location: `"./plugins/membership/dist/sandbox-entry.js"`
- Replace fake npm alias `@shipyard/membership/sandbox` with real, resolvable path
- Time budget: 10 minutes for immediate fix

**Rationale:** Speed compounds when you're at zero users. The yoga studio site is live and broken. Every day of debate is a day they can't onboard members.

**Elon's core argument (Round 2):** *"The entrypoint path is wrong. That's it. Don't engineer emotional narratives when you should be fixing the path."*

**Steve's concession (Round 2):** *"You're right to push back on over-engineering. This should take <30 minutes—not because we cut corners, but because the system should be obvious."*

---

### Decision 2: Convention-Based Plugin System (The Real Fix)
**Proposed by:** Steve (Round 2)
**Winner:** Steve with Elon's Time Constraint
**Why:** Quick fixes create slow systems. 30 minutes of design work eliminates 1000 hours of future debugging

**Implementation:**
```typescript
// Target API (zero-config)
plugins: ["membership"]  // System auto-resolves entrypoint

// Instead of manual configuration:
plugins: [{
  type: "standard",
  entrypoint: "@shipyard/membership/sandbox",  // ❌ mystery path
  workerLoader: "esm"
}]
```

**Convention:**
- Plugin name `"membership"` → auto-resolve to `plugins/membership/sandbox.ts`
- Build system handles bundling, worker loader config, everything
- Zero manual path configuration
- Time budget: 30 minutes for convention system design

**Rationale:** Configuration is tech debt disguised as flexibility. Convention over configuration prevents 100 future developers from wasting 5 hours each debugging paths.

**Steve's core argument (Round 2):** *"Your 'fix' creates a precedent: when plugins break, developers debug npm aliases, compare file paths, and trace build configs. That's not 5 minutes—it's 5 hours × 100 developers × 10 plugins = 5,000 hours of wasted time. You're treating the symptom. I'm treating the disease."*

**Elon's concession (Round 2):** *"Parity between local and production is non-negotiable. Steve's right: 'works on my machine' destroys trust. The fix should make behavior identical everywhere. That's not brand work—that's engineering rigor."*

---

### Decision 3: Self-Verifying Build System
**Proposed by:** Steve (Round 2)
**Winner:** Steve (Unopposed)
**Why:** Debugging production is 10x costlier than catching it at build time

**Implementation:**
- Build fails LOUDLY if plugin won't work in production
- No silent failures where plugin descriptor gets dropped
- No manual verification (curl commands to check manifest)
- Build-time validation catches broken plugins before deploy

**Error message specification:**
```json
// ❌ BAD (generic):
{"error": "INTERNAL_ERROR", "message": "Plugin route error"}

// ✅ GOOD (actionable):
{
  "error": "PLUGIN_ENTRYPOINT_NOT_RESOLVED",
  "message": "Could not find '@shipyard/membership/sandbox'. Use a file path like './sandbox-entry.js'",
  "tried": "@shipyard/membership/sandbox",
  "suggestion": "./plugins/membership/dist/sandbox-entry.js"
}
```

**Rationale:** If it builds, it ships. If it ships, it runs. Make wrong things impossible.

**Steve's principle (Round 1):** *"Error messages are documentation at the moment of crisis. The difference between generic errors and actionable ones is 30 minutes of debugging vs. 30 seconds. That's not polish—that's reducing time-to-success by 60x."*

**Elon's concession (Round 2):** *"Error messages DO matter—but only once. If we ship better error messages that prevent the next developer from hitting this bug, fine. Invest 5 minutes in a clear error."*

---

### Decision 4: Ship Timeline
**Proposed by:** Elon (Round 1, Round 2)
**Winner:** Elon
**Why:** Speed is a feature. The fastest path to learning is shipping

**Timeline:**
- Hardcode fix: 10 minutes
- Convention system: 30 minutes
- **Total: 40 minutes, ship today**

**Rationale:** Every hour spent debugging this is an hour not building features users care about. Fix once, never touch again.

---

### Decision 5: Documentation Philosophy
**Proposed by:** Steve (Round 1)
**Winner:** Steve (Elon conceded)
**Why:** Documentation is an apology for bad design

**Principle:**
- If you need 200 lines to explain plugin registration, the abstraction failed
- ONE canonical example (5 lines max)
- No "compare with other sites" debugging strategy
- System should say "I've got this. Go build your app." not "Please read the docs first"

**Rationale:** The first 30 seconds should feel like magic, not archaeology.

---

## 📦 MVP FEATURE SET (v1)

### SHIPS in v1:
1. **Convention-based plugin loading**
   - `plugins: ["membership"]` auto-resolves to correct entrypoint
   - Zero manual path configuration

2. **Hardcoded immediate fix**
   - Real file path for membership plugin entrypoint
   - Replaces broken npm alias

3. **Build-time validation**
   - Loud failures for unresolvable plugins
   - No silent drops from manifest

4. **Single canonical example**
   - 5-line reference implementation
   - One way that works, period

### CUT from v1:
- ❌ "Read all the docs" steps (bloat)
- ❌ "Compare with other sites" debugging (fragments knowledge)
- ❌ Smoke tests beyond manifest verification (theater)
- ❌ Cloudflare internals exposed to developers (implementation detail)
- ❌ Multiple plugin configuration patterns (cognitive load)
- ❌ "Passport" rebranding (defer until product validation)

---

## 📁 FILE STRUCTURE

### Phase 1: Immediate Fix (10 minutes)
**Single file change:**
```
plugins/membership/descriptor.json
```
**Change:**
```json
// BEFORE (broken npm alias):
{
  "type": "standard",
  "entrypoint": "@shipyard/membership/sandbox",
  "workerLoader": "esm"
}

// AFTER (real file path):
{
  "type": "standard",
  "entrypoint": "./plugins/membership/dist/sandbox-entry.js",
  "workerLoader": "esm"
}
```

### Phase 2: Convention System (30 minutes)
**New files to create:**
```
shipyard-core/
├── plugin-resolver.ts       # NEW: Convention-based path resolution
│   └── resolvePluginEntrypoint("membership") → "plugins/membership/sandbox.ts"
│
├── build-validator.ts       # NEW: Loud failure for broken plugins
│   └── validatePluginExists() → throw on missing entrypoint
│
└── plugin-loader.ts         # MODIFY: Use resolver instead of manual paths
    └── loadPlugins(["membership"]) → auto-resolve & bundle
```

**Test files:**
```
tests/
├── plugin-resolver.test.ts  # Verify convention resolution
└── build-validator.test.ts  # Verify loud failures
```

**Target developer experience:**
```typescript
// emdash.config.ts - BEFORE (manual configuration):
export default {
  plugins: [{
    type: "standard",
    entrypoint: "./plugins/membership/dist/sandbox-entry.js",  // manual path
    workerLoader: "esm"
  }]
}

// emdash.config.ts - AFTER (convention):
export default {
  plugins: ["membership"]  // auto-resolves everything
}
```

---

## ❓ OPEN QUESTIONS

### 1. Plugin Architecture Uncertainty
**Question:** Is this plugin architecture even right long-term?
**Raised by:** Elon (Round 2)
**Stakes:** Every hour perfecting this system is sunk cost if we pivot
**Mitigation:** Ship hacky fix now, validate with 100 real users, THEN optimize based on actual pain points

**Decision Rule:** Measure after 100 members using this plugin:
- Signup completion rate
- Error rates
- Load times
- Developer feedback on entrypoint resolution

If metrics are poor or developers hate it → consider Edge Functions instead of Workers, or ditch Cloudflare entirely.

---

### 2. Distribution Impact
**Question:** Does this plugin drive revenue or retention?
**Raised by:** Elon (Round 1, Steve conceded Round 2)
**Stakes:** Fixing a plugin nobody uses is masturbatory engineering
**Current Status:** Unknown—yoga studio has zero members currently

**Decision Rule:** After fix ships, measure:
- Member signups (does plugin enable onboarding?)
- Retention (do members stay?)
- Referral loops (any viral mechanics?)

If no impact on key metrics → cut the plugin entirely.

---

### 3. Multi-Plugin Scaling
**Question:** What happens when developer adds a second plugin with different conventions?
**Raised by:** Steve (Round 2)
**Stakes:** Hardcoded fix works for one plugin but fragments with plugin diversity
**Mitigation:** Convention system handles this—`plugins: ["membership", "payments", "analytics"]` all auto-resolve

**Decision Rule:** Test with 2nd plugin before claiming victory on convention system.

---

### 4. Monorepo Workspace Aliases
**Question:** Should we publish `@shipyard/membership/sandbox` to npm or always use file paths?
**Raised by:** Elon (Round 1), Steve agreed (Round 2)
**Stakes:** Fake aliases create confusion, real npm packages create maintenance burden
**Current Decision:** Use real file paths for now, revisit if plugins become external packages

**Decision Rule:** If 3rd party developers want to publish Shipyard plugins → publish to npm. Otherwise, stay with file paths.

---

## 🚨 RISK REGISTER

### Risk 1: Speed vs Quality Death Spiral
**What could go wrong:** Ship hardcoded fix, never build convention system → 100 developers waste 5 hours each debugging paths
**Probability:** HIGH if convention system isn't built in same session
**Impact:** 500 hours of developer pain
**Mitigation:** Lock 40-minute timeline—both fixes in ONE session
**Owner:** Elon (speed) + Steve (quality)

---

### Risk 2: Over-Engineering for Zero Users
**What could go wrong:** Spend weeks building "insanely great" plugin system → nobody uses it
**Probability:** MEDIUM (Steve's perfectionist tendency)
**Impact:** Wasted engineering time, delayed feature shipping
**Mitigation:** Steve conceded—ship fast, validate with 100 users before adding abstraction layers
**Owner:** Elon (veto power on scope creep)

---

### Risk 3: Build System Doesn't Fail Loudly
**What could go wrong:** Convention system silently drops broken plugins from manifest → production debugging nightmare
**Probability:** MEDIUM (common failure mode in build tooling)
**Impact:** Hours of "why isn't my plugin loading?" support tickets
**Mitigation:** Build-time validation MUST throw errors, not warnings. Fail fast.
**Owner:** Steve (non-negotiable requirement)

---

### Risk 4: Plugin Provides Zero Distribution Value
**What could go wrong:** Fix the plugin, it loads perfectly → still zero members sign up
**Probability:** HIGH (Elon's skepticism valid)
**Impact:** Wasted effort on infrastructure that doesn't move business metrics
**Mitigation:** Measure signup completion rate after fix. If <10% conversion → cut plugin entirely
**Owner:** Elon (distribution focus)

---

### Risk 5: Convention Doesn't Match Developer Mental Model
**What could go wrong:** `plugins: ["membership"]` feels magical to us, confusing to developers
**Probability:** LOW but catastrophic if true
**Impact:** Developers reject system, demand manual configuration back
**Mitigation:** Single canonical example + loud build errors guide developers. Test with 3 external devs.
**Owner:** Steve (UX principle) + Elon (user validation)

---

### Risk 6: Cloudflare Workers Scaling Unknown
**What could go wrong:** Plugin works fine at 10 users, breaks at 1000 (worker isolate limits, cold starts, etc.)
**Probability:** LOW (Cloudflare designed for scale)
**Impact:** Production outages during growth spurt
**Mitigation:** Elon is right—Workers auto-scale to millions. Monitor at 100x usage threshold.
**Owner:** Elon (infrastructure confidence)

---

## 🎯 SUCCESS CRITERIA

### Build Phase Success (Required for "Done"):
- ✅ Plugin loads in production (manifest verification)
- ✅ `plugins: ["membership"]` convention works
- ✅ Build fails loudly on broken plugins
- ✅ Total implementation time: ≤40 minutes
- ✅ Zero manual configuration required
- ✅ Curl `https://[site].emdash.ai/api/plugins/manifest` returns `["membership"]`
- ✅ Local dev and production behave identically (no divergence)

### Product Validation Success (post-build, within 2 weeks):
- 📊 10+ real members using plugin
- 📊 >10% signup completion rate
- 📊 <1% error rate in production
- 📊 Zero developer support tickets on plugin loading
- 📊 Plugin enables measurable revenue or retention improvement

**If validation fails → cut the plugin per Elon's recommendation**

**Elon's metric (Round 1):** *"If the plugin doesn't drive revenue or retention, fixing this gets you from 0 to 0 users. Distribution comes from product-market fit, not from fixing build configs."*

---

## 🧘 ZEN MASTER SYNTHESIS

**The tension:** Elon optimizes for iteration speed. Steve optimizes for years of developer joy.

**The truth:** Both right. Wrong timing for architecture—but right principle that bad abstractions create infinite pain.

**The resolution:** 40 minutes. Hardcode fix (10 min) + convention system (30 min) = ship today + never touch again.

**Core insights from the debates:**
- *"Documentation is an apology for bad design"* — Steve (Round 2), Elon conceded
- *"Configuration is tech debt disguised as flexibility"* — Steve (Round 2)
- *"Speed is a feature, shipping is the only validation"* — Elon (Round 1, Round 2)
- *"The best infrastructure is invisible"* — Steve (Round 1)
- *"Every abstraction adds failure modes. Strip them away."* — Elon (Round 2)
- *"First impressions are permanent. Plugin Zero sets the tone for every plugin that follows."* — Steve (Round 2)

**The essence (from project brief):**
> "Relief. The platform doesn't fight you. Local and production never diverge. Boring simplicity. Magical results."

**The play:**
Fix fast. Design forever. Ship both. Move on.

**Execution directive:**
This is not a debate. This is a build. The agent has 40 minutes:
1. **Minutes 0-10:** Change descriptor.json entrypoint to real file path, deploy, verify manifest
2. **Minutes 10-40:** Build convention system (resolver + validator), update config API, write tests
3. **Minute 40:** Ship. Done. Never touch again.

If the agent asks questions about approach, point them to this blueprint. If they want to read docs, point them to the 3 lines about entrypoint resolution. If they want to add features, cut them ruthlessly.

**The triangle offense:**
- Elon guards the timeline (40 minutes, no exceptions)
- Steve guards the quality bar (no silent failures, actionable errors)
- Phil guards the execution (ship both fixes, not just one)

---

*This blueprint is precise. Execute.*
