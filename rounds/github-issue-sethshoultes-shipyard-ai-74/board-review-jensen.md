# Board Review: Issue #74 - EventDash Entrypoint Fix

**Reviewer:** Jensen Huang (NVIDIA)
**Date:** April 16, 2026
**Status:** ❌ REJECT - No Strategic Value

---

## The Moat Question

**Answer:** There is none.

- Fixed npm alias → file path resolution bug
- Same pattern copied from Membership plugin
- Zero differentiation, zero IP created
- Compounds nothing - this is maintenance, not innovation
- Any competitor can replicate in 15 minutes (their own estimate)

---

## AI Leverage Analysis

**Answer:** Not applicable. This was manual code surgery.

- Human copied pattern from file A to file B
- No AI multiplier visible anywhere
- No AI-assisted debugging, testing, or code generation
- Could have used AI to scan entire codebase and fix all similar patterns at once
- Instead: fixed ONE plugin when there should be automated detection

**Missed opportunity:** Build linter that prevents this class of bug forever. That's 10x leverage.

---

## Unfair Advantage We're NOT Building

**Critical gaps:**

1. **No automated pattern enforcement**
   - Should have ESLint rule that fails CI on npm aliases in entrypoints
   - Mentioned in "recommendations" but not shipped
   - Prevention > correction, always

2. **No plugin scaffold generator**
   - Issue #76 deferred to "future work"
   - Should be blockers for ANY plugin work
   - Make correct path the DEFAULT path

3. **No CI validation for Workers builds**
   - Bug only caught when deploying
   - Should fail in PR, not production
   - Testing at wrong layer

4. **No cross-codebase analysis**
   - Fixed ONE plugin manually
   - What about other plugins? Future plugins?
   - Reactive firefighting vs. systematic elimination

**The pattern:** Solving today's symptom, ignoring tomorrow's thousand cuts.

---

## Platform vs. Product

**Current state:** Product fix. Tactical.

**Platform would be:**

1. **Plugin SDK with guardrails baked in**
   - Entrypoint resolution abstracted away
   - Developers can't make this mistake
   - "Pit of success" architecture

2. **Build-time validation layer**
   - Static analysis catches deployment blockers
   - Workers compatibility checked per PR
   - Zero production surprises

3. **Template system with best practices embedded**
   - `npx create-shipyard-plugin`
   - Correct patterns by default
   - Documentation IN the code, not separate

4. **Cross-environment testing harness**
   - Validate Node.js AND Workers AND edge
   - Single test suite, multiple targets
   - Compatibility matrix automated

**Gap:** Treating plugins as artisanal hand-crafted code instead of systematized platform components.

---

## What This Tells Me

Team confuses "shipping code" with "creating value."

- 400-line execution summary for 12-line code change
- More documentation than innovation
- Phil Jackson cosplay (careful execution) without Steve Jobs vision (what problem are we REALLY solving?)

**The real issue isn't the entrypoint bug. It's that this bug was possible at all.**

---

## Score: 3/10

**Justification:** Executes well but aims low. Fixed symptom, ignored disease.

**Why 3, not 1:**
- Code works (verified via build)
- Pattern matches existing convention
- Atomic commit, clean history
- Met stated requirements

**Why not 6+:**
- No leverage created
- No platform thinking
- No prevention, only reaction
- Deferred all high-value automation to "future work"

**NVIDIA wouldn't ship this. We'd ask: "How do we make this impossible to break again?"**

---

## What Should Happen Next

**Immediate (block further plugin work until done):**

1. ESLint rule that fails on npm aliases in plugin entrypoints
2. CI job that builds ALL plugins for Workers target
3. Automated scan for this pattern across entire codebase

**Short-term (next sprint):**

4. Plugin scaffold generator that makes correct pattern default
5. Build-time validator for cross-environment compatibility
6. Refactor plugin system to abstract entrypoint resolution

**Strategic (Q2):**

7. Shipyard Plugin SDK - opinionated, guardrailed, impossible to misconfigure
8. Multi-environment test matrix - Node/Workers/Edge validated automatically
9. Platform documentation - patterns embedded in tooling, not Word docs

---

## The Jensen Test

**Question:** If this shipped to 10,000 developers tomorrow, would they:
- **(A)** Build things they couldn't build before?
- **(B)** Build things faster/better than alternatives?
- **(C)** Be mildly less annoyed by a bug that's now fixed?

**Answer:** (C). That's not a product. That's a patch.

---

## Final Thought

Great Minds Agency is optimizing for "did we complete the task?" when we should optimize for "did we obsolete the task?"

Fix → Prevent → Systematize → Scale

Currently stuck at step 1.

---

**Recommendation:** REJECT this as directionally insufficient.
**Action:** Require infrastructure investment before next feature work.
**Mindset shift:** Stop building features. Start building platforms.
