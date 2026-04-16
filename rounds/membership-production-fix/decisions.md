# Decisions: Membership Plugin Production Fix
## Blueprint for Build Phase

*Consolidated by Phil Jackson from Great Minds Agency debates*

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

**Rationale:** If it builds, it ships. If it ships, it runs. Make wrong things impossible.

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

### Immediate Fix Files:
```
plugins/membership/
├── descriptor.json          # Change entrypoint to real path
│   └── "entrypoint": "./plugins/membership/dist/sandbox-entry.js"
└── dist/
    └── sandbox-entry.js     # Actual bundled file
```

### Convention System Files:
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

### Test Files:
```
tests/
├── plugin-resolver.test.ts  # Verify convention resolution
└── build-validator.test.ts  # Verify loud failures
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

### Build Phase Success:
- ✅ Plugin loads in production (manifest verification)
- ✅ `plugins: ["membership"]` convention works
- ✅ Build fails loudly on broken plugins
- ✅ Total implementation time: ≤40 minutes
- ✅ Zero manual configuration required

### Product Validation Success (post-build):
- 📊 10+ real members using plugin
- 📊 >10% signup completion rate
- 📊 <1% error rate in production
- 📊 Zero developer support tickets on plugin loading

**If validation fails → cut the plugin per Elon's recommendation**

---

## 🧘 ZEN MASTER SYNTHESIS

**The tension:** Elon optimizes for iteration speed. Steve optimizes for years of developer joy.

**The truth:** Both right. Wrong timing for architecture—but right principle that bad abstractions create infinite pain.

**The resolution:** 40 minutes. Hardcode fix (10 min) + convention system (30 min) = ship today + never touch again.

**Core insight:**
- Documentation is apology for bad design *(Steve)*
- Configuration is tech debt disguised as flexibility *(Steve)*
- Speed is a feature, shipping is the only validation *(Elon)*
- The best infrastructure is invisible *(Steve)*

**The play:**
Fix fast. Design forever. Ship both. Move on.

---

*This blueprint is precise. Execute.*
