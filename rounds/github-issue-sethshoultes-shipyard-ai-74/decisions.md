# Decisions Blueprint: Issue #74 EventDash Entrypoint Fix

**Status:** Locked for Build Phase
**Date:** 2024
**Debate Rounds:** 2 (Elon Musk vs Steve Jobs)

---

## Executive Summary

**The Core Problem:** EventDash plugin uses npm aliases in entrypoint resolution, which breaks on Cloudflare Workers deployments.

**The Solution:** Copy Membership plugin's file path resolution pattern exactly. Use `fileURLToPath + dirname + join` instead of npm aliases.

**The Bigger Win:** Establish plugin consistency standard across Shipyard codebase.

---

## Locked Decisions

### Decision 1: Copy Membership Pattern — Zero Deviation

**Proposed by:** Elon Musk (Round 1)
**Supported by:** Steve Jobs (Round 2)
**Winner:** Elon
**Why:** Membership plugin already solved this problem using Node.js standard library (`fileURLToPath`, `dirname`, `join`). This is proven, tested, working code. No invention needed.

**Implementation:**
```typescript
// From: import { sandboxEntry } from '@repo/eventdash-entries'
// To:   const entrypointPath = join(currentDir, "sandbox-entry.ts")
```

**Rationale:**
- Standard library solution (no dependencies)
- Works in all bundlers (runtime resolution to absolute paths)
- Already validated in production via Membership plugin
- Complexity: 1/10 (mechanical code surgery)

**Consensus:** Both agree this is the correct technical fix. No debate.

---

### Decision 2: Cut astro.config.mjs Registration from Issue #74

**Proposed by:** Elon Musk (Round 1)
**Challenged by:** Steve Jobs (Round 2) — "Fixing engine without enabling it"
**Winner:** Elon (for scope), Steve (for urgency)
**Why:** Atomic bug fixes prevent scope creep, but registration must ship in same release.

**Resolution:**
- Issue #74: Fix entrypoint only
- Issue #75: Register EventDash in astro.config.mjs
- Both ship in same release cycle
- Users never see broken EventDash

**Steve's Concession:** "Make it Issue #75. But it ships in the SAME release."
**Elon's Position:** "Bug fixes stay atomic. One problem, one solution, one commit."

**Consensus:** Separate issues, same release. Both agreed.

---

### Decision 3: Add Automated Enforcement

**Proposed by:** Elon Musk (Round 1, expanded Round 2)
**Evolved by:** Steve Jobs (Round 2) — Added plugin scaffold generator
**Winner:** Synthesis of both approaches
**Why:** "Taste documents the standard. Tools enforce it." (Elon, Round 2)

**Three-Layer Prevention System:**

#### Layer 1: Linter Rule (Immediate)
- ESLint rule flags npm aliases in `*/src/index.ts` entrypoint files
- Build fails if pattern violated
- Elon's position: "Hope doesn't scale. Automated checks scale."

#### Layer 2: Integration Test (Immediate)
- CI test builds all plugins for Cloudflare Workers target
- Fails PR if any plugin breaks on Workers
- Steve's position: "The test is the forcing function."

#### Layer 3: Plugin Scaffold Generator (Issue #76, ships within 2 sprints)
- Command: `npm run create-plugin <name>`
- Generates template with correct entrypoint pattern
- Steve's position: "The right way becomes the easy way."
- Elon's concession: "You mentioned it in passing. I'm making it non-negotiable." (Steve won this)

**Consensus:** All three layers approved. Elon focused on automation, Steve on prevention.

---

### Decision 4: Pattern Consistency Standard

**Proposed by:** Steve Jobs (Round 1, strengthened Round 2)
**Supported by:** Elon Musk (Round 2 concession)
**Winner:** Steve
**Why:** "Consistency reduces cognitive load. It's not just aesthetic — it's architectural." (Elon, Round 2)

**The Standard:**
- **All plugins** use file paths for entrypoints
- **No npm aliases** in entrypoint resolution
- **Zero exceptions** to the pattern
- **Document in CONTRIBUTING.md** with "Why file paths, not npm aliases" section

**Elon's Concession (Round 2):**
> "Steve's pattern language argument is valid. When every plugin uses file paths, developers learn once, apply everywhere. My initial dismissal of 'design discipline' was wrong. Enforcing patterns IS engineering discipline."

**Steve's Position:**
> "This isn't EventDash vs. Membership — this is setting the standard for plugin #3, #4, #100."

**Consensus:** Steve won the philosophical debate. Pattern consistency is now non-negotiable.

---

### Decision 5: Documentation vs. Automation Philosophy

**Debated:** Elon vs Steve (Round 2)
**Winner:** Both (Synthesis)
**Resolution:** "Steve's aesthetics with my automation." (Elon, Round 2)

**The Compromise:**
- **Document the pattern clearly** (Steve's strength)
- **Enforce with tools** (Elon's strength)
- **Ship fast** (Elon's speed)
- **Communicate impact** (Steve's framing)

**Key Insight:**
- **Steve:** "Design quality isn't overhead. It's the moat."
- **Elon:** "The fix is human. The prevention is automated."
- **Synthesis:** Do both. Documentation for understanding, automation for enforcement.

---

### Decision 6: "The Gateway" Naming Rejected

**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** Elon Musk (Round 2)
**Winner:** Elon
**Why:** "Entrypoint" is industry standard. Renaming creates cognitive overhead.

**Elon's Argument:**
> "Renaming it 'The Gateway' for emotional impact means developers search docs for 'entrypoint' and find nothing. The best name is the one that matches what everyone already knows."

**Steve's Position:** Internal rebranding for clarity.

**Outcome:** Keep "entrypoint" terminology. No poetic renaming.

**Consensus:** Elon won on pragmatism. Steve didn't counter-argue in final round.

---

## MVP Feature Set (What Ships in v1)

### Core Fix (Issue #74)
1. **Update `plugins/eventdash/src/index.ts`**
   - Replace npm alias pattern with file path resolution
   - Copy exact pattern from `plugins/membership/src/index.ts`
   - Use `fileURLToPath + dirname + join`

2. **Verification**
   - Confirm `sandbox-entry.ts` exists at expected location
   - Test build for Cloudflare Workers target

3. **Documentation**
   - Add 9-word inline comment: `// Use file paths, not npm aliases (Cloudflare Workers requirement)`

### Scope Boundary (NOT in Issue #74)
- ❌ astro.config.mjs registration (moved to Issue #75)
- ❌ Plugin scaffold generator (moved to Issue #76)
- ❌ CONTRIBUTING.md pattern documentation (ships with #76)

---

## File Structure (What Gets Built)

### Files Modified (Issue #74)
```
plugins/eventdash/src/index.ts
```

**Before:**
```typescript
import { sandboxEntry } from '@repo/eventdash-entries'
```

**After:**
```typescript
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = dirname(currentFile);
const entrypointPath = join(currentDir, "sandbox-entry.ts");
```

### Files to Reference (Not Modified)
```
plugins/membership/src/index.ts  (working reference implementation)
```

### Files to Verify (Not Modified)
```
plugins/eventdash/src/sandbox-entry.ts  (must exist)
```

---

## Open Questions (What Still Needs Resolution)

### Resolved During Debate
- ✅ Technical approach → Copy Membership pattern
- ✅ Scope boundary → Cut astro.config.mjs from Issue #74
- ✅ Long-term prevention → Three-layer automation system
- ✅ Naming convention → Keep "entrypoint" terminology
- ✅ Pattern enforcement → Both documentation + automation

### Remaining for Future Issues

#### Issue #75: EventDash Registration
- **Question:** Is EventDash currently registered in `astro.config.mjs`?
- **If not:** Add registration
- **If yes:** Verify configuration is correct
- **Priority:** Must ship in same release as #74

#### Issue #76: Plugin Scaffold Generator
- **Question:** What template structure?
- **Question:** Which files to generate automatically?
- **Question:** CLI interface design?
- **Timeline:** Ships within 2 sprints of #74

#### ESLint Rule Specification
- **Question:** Exact regex pattern to flag npm aliases?
- **Question:** Scope to all `src/index.ts` or just plugin directories?
- **Question:** Error message wording?

#### CI Test Implementation
- **Question:** Which CI platform? (GitHub Actions assumed)
- **Question:** Run on every PR or just main branch?
- **Question:** Build all plugins or just changed ones?

---

## Risk Register (What Could Go Wrong)

### Technical Risks

#### Risk 1: Broken File Path Resolution
**Likelihood:** Low
**Impact:** High (EventDash unusable)
**Mitigation:**
- Copy exact working code from Membership
- Verify `sandbox-entry.ts` file exists before committing
- Test build locally before PR
- Add CI test to catch regression

#### Risk 2: Bundler Compatibility Issues
**Likelihood:** Very Low
**Impact:** Medium
**Mitigation:**
- File path resolution is standard Node.js
- Already proven in Membership plugin
- Runtime resolution to absolute paths works in all major bundlers

#### Risk 3: Missing sandbox-entry.ts File
**Likelihood:** Low
**Impact:** High (build fails)
**Mitigation:**
- Verification step in implementation checklist
- Fail-fast error message if file missing
- Add file existence check to linter (future)

### Process Risks

#### Risk 4: Scope Creep Returns
**Likelihood:** Medium
**Impact:** Medium (delays shipment)
**Mitigation:**
- Locked scope boundary documented here
- Elon's "cut the scope creep" mandate
- Separate Issue #75 for registration

#### Risk 5: Pattern Not Adopted by Future Plugins
**Likelihood:** Medium (without enforcement)
**Impact:** High (inconsistency returns)
**Mitigation:**
- Three-layer prevention system (linter + CI + scaffold)
- Documentation in CONTRIBUTING.md
- Code review guidelines

#### Risk 6: Issue #75 Doesn't Ship Same Release
**Likelihood:** Medium
**Impact:** High (broken user experience)
**Mitigation:**
- Steve's non-negotiable: "Ships in SAME release"
- Link #74 and #75 in release planning
- Block release if either incomplete

### User Experience Risks

#### Risk 7: Silent Failures on Cloudflare Workers
**Likelihood:** Low (after fix)
**Impact:** Critical
**Mitigation:**
- Integration test for Workers deployment
- Clear error messages if entrypoint fails
- Documentation about Workers compatibility

#### Risk 8: Developer Confusion About Pattern
**Likelihood:** Medium (short-term)
**Impact:** Low
**Mitigation:**
- Inline code comment explains "why"
- Future CONTRIBUTING.md documentation
- Consistent pattern across all plugins

---

## Implementation Checklist (Single Session Build)

### Pre-Implementation (5 min)
1. ✅ Read `plugins/membership/src/index.ts` (working reference)
2. ✅ Read `plugins/eventdash/src/index.ts` (broken file)
3. ✅ Verify `plugins/eventdash/src/sandbox-entry.ts` exists

### Core Implementation (5 min)
4. ⬜ Copy file path resolution pattern from Membership
5. ⬜ Replace npm alias import in EventDash
6. ⬜ Add inline comment explaining Cloudflare Workers requirement
7. ⬜ Verify all imports resolve correctly

### Verification (5 min)
8. ⬜ Run local build for Cloudflare Workers target
9. ⬜ Verify no bundler errors
10. ⬜ Test plugin loads correctly

### Commit (5 min)
11. ⬜ Single atomic commit with clear message
12. ⬜ Reference Issue #74 in commit
13. ⬜ Push for review

**Total Time:** 20 minutes (estimated)
**Complexity:** 1/10 (Elon's assessment)
**Risk Level:** Low

---

## Success Criteria

### Must Pass (v1)
1. ✅ EventDash builds successfully for Cloudflare Workers
2. ✅ File path resolution matches Membership pattern exactly
3. ✅ No npm aliases in entrypoint code
4. ✅ Inline comment explains "why"
5. ✅ Single atomic commit

### Should Pass (v1.1 - same release)
6. ⬜ Issue #75 completed (astro.config.mjs registration)
7. ⬜ EventDash works end-to-end in production

### Could Pass (v2 - future sprints)
8. ⬜ ESLint rule enforces pattern
9. ⬜ CI test validates Workers builds
10. ⬜ Plugin scaffold generator ships (Issue #76)
11. ⬜ CONTRIBUTING.md documents pattern

---

## Philosophical Alignments (The Synthesis)

### Where Elon Won
- ✅ Cut scope creep (no astro.config.mjs in #74)
- ✅ Automated enforcement over cultural enforcement
- ✅ "Entrypoint" terminology over "The Gateway"
- ✅ Ship fast, iterate fast
- ✅ Linter rule priority

### Where Steve Won
- ✅ Pattern consistency is non-negotiable
- ✅ Plugin scaffold generator (Issue #76)
- ✅ Documentation matters (CONTRIBUTING.md)
- ✅ This is a "trust moment" not just a bug fix
- ✅ Issue #75 must ship same release

### Where Both Agreed
- ✅ Copy Membership pattern exactly
- ✅ File paths, not npm aliases (forever)
- ✅ Three-layer prevention system
- ✅ Cloudflare Workers is the reality test
- ✅ Consistency reduces cognitive load

### The Final Synthesis (Elon, Round 2)
> "Steve's aesthetics with my automation. Document the pattern clearly (Steve's strength). Enforce it with tools (my strength). Ship the fix in one session (my speed). Communicate the impact (Steve's framing)."

### The Design Philosophy (Steve, Round 2)
> "Infrastructure IS the user experience. Every abstraction that leaks is a betrayal."

### The Engineering Principle (Elon, Round 2)
> "Taste documents the standard. Tools enforce it. Ship both."

---

## Next Actions

### Immediate (Issue #74 - this PR)
1. Implement file path resolution fix
2. Test locally for Workers build
3. Commit and push

### Same Release (Issue #75)
1. Verify EventDash registration in astro.config.mjs
2. Fix if missing
3. Test end-to-end deployment

### Next Sprint (Post-#74 immediately)
1. Implement ESLint rule for npm alias detection
2. Add CI test for Workers builds
3. Document pattern in CONTRIBUTING.md

### Within 2 Sprints (Issue #76)
1. Design plugin scaffold generator CLI
2. Build template with correct patterns
3. Ship generator to prevent future pattern drift

---

## Appendix: Key Quotes

### On Technical Simplicity
**Elon:** "This is a 4-line code change. The PRD is 62 lines for a problem that's already solved in another file."

**Steve:** "You're measuring lines of code. I'm measuring trust."

### On Pattern Enforcement
**Elon:** "Hope doesn't scale. Automated checks scale."

**Steve:** "A linter is reactive. Better: Template-driven plugin creation so the correct pattern is the default."

### On Design Quality
**Steve:** "Design quality isn't overhead. It's the moat."

**Elon:** "My initial dismissal of 'design discipline' was wrong. Enforcing patterns IS engineering discipline."

### On Scope Discipline
**Elon:** "Bug fixes stay atomic. One problem, one solution, one commit."

**Steve:** "Fixing the entrypoint without enabling the plugin is like building a perfect engine and leaving it in the garage."

### On User Impact
**Steve:** "Users don't read manifestos before bug fixes."

**Elon:** "Steve's framing — that reliability creates emotional loyalty — is correct. The first time something 'just works' in production, users remember."

---

**Blueprint Status:** LOCKED
**Ready for Build:** YES
**Single Session:** YES
**Agent Handoff:** Complete

---

*"Silence is the highest compliment." — Essence*
*"Let's build the thing, then make sure we never break it again." — Elon, Round 2*
