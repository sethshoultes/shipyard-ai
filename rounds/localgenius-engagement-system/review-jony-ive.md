# Design Review: LocalGenius Pulse

**Reviewer:** Jony Ive
**Date:** 2026-04-18
**Status:** Incomplete — Only scaffolding exists

---

## The Problem

231 tasks defined. 1 implemented.

No visual hierarchy to evaluate. No interface exists.

---

## What's There

### spec.md
**Visual hierarchy:** Fails immediately.
- Lines 1-10: Wall of metadata. Ship date screams louder than purpose.
- Lines 13-27: 12 bullet points before user sees what this *is*.
- Line 29: "30-second dopamine hit" — right idea, buried.

**Recommendation:** Line 1 should be "One number. Daily. Personal." Everything else is noise.

### todo.md
**Lines 14-23:** Database migrations dominate. Foundation work first, yes — but list reveals priority confusion.

Most important question: "What does user feel?"

Answer location: Line 218 (buried in todo list).

### cliffhanger.ts
**Lines 30-101:** Only artifact with craft.

**Strengths:**
- Line 34: Warm voice present ("I'll let you know if it works")
- Line 55: Personal callback to user's journal — genuine connection
- Lines 172-209: Validation function shows care

**Issues:**
- Lines 31-101: 10 templates. User will see one. Why optimize the invisible?
- Line 64: "No promises, but..." — hedging undermines confidence
- Line 126: Fallback copy is generic surrender ("Talk soon")

**Recommendation:** 3 templates. Perfect them. Fallback should feel intentional, not defeated.

### .env.example
**Lines 1-42:** Functional. Flat. Forgettable.

**Missing:** Comments explaining *why* each variable exists. Developer experience is design.

**Line 38:** Feature flags good — shows restraint.

### tests/05-brand-voice-check.sh
**Lines 42-50:** Tests for robotic language. Defensive design.

**Issue:** Tests what's *wrong*. Doesn't test what's *right*.

**Line 89:** Checks quiet template isn't spammy. Good instinct — but where's test for *delight*?

---

## Visual Hierarchy Assessment

**Cannot evaluate.** No UI exists.

No badge unlock modal (task-011, line 230-243 in todo.md).
No preferences panel (task-006, line 178-192).
No gallery (task-012, line 275-291).

Foundation-first approach means hierarchy decisions deferred to "polish" (Wave 3, days 13-14).

**Risk:** Hierarchy as afterthought, not foundation.

---

## Whitespace Assessment

**Cannot evaluate.** No layout exists.

Spec suggests intent:
- Line 29: "One number per day" — constraint creates space
- Line 102: "NO modals, countdown timers, dark patterns" — restraint present

But intent ≠ execution.

---

## Consistency Assessment

**Partial.**

**Consistent:**
- Brand voice philosophy (lines 32-33 in spec.md, implemented in cliffhanger.ts lines 1-7)
- First-person AI tone (cliffhanger.ts lines 33, 47, 54)
- Test validation patterns (brand-voice-check.sh structure)

**Inconsistent:**
- Spec verbose (spec.md 487 lines). Cliffhanger code terse (217 lines). Same team?
- Spec says "simple" (line 39, "3-Table System"). Todo has 231 tasks. Definition drift.

---

## Craft Assessment

### What Rewards Inspection

**cliffhanger.ts lines 109-142:** Weighted selection algorithm.
- Considers context availability
- Falls back gracefully
- No user sees this — but code respects them

**cliffhanger.ts lines 172-209:** Tone validation.
- Bans promises (line 179)
- Bans corporate jargon (line 187)
- Enforces first-person (line 201)

Craft present in *constraints*, not decoration.

### What Lacks Craft

**spec.md lines 224-305:** File list.
- 81 lines of "+`/src/...`"
- Machine-readable. Human-hostile.
- Reads like git log, not vision doc.

**todo.md lines 14-291:** Checkbox wilderness.
- "verify: query shows table..." appears 18 times
- Copy-paste verification criteria
- Quantity over considered progression

---

## What Would Make This Quieter But More Powerful

### 1. Invert spec.md Hierarchy
**Current:** Metadata → Goals → Architecture → Features → Verification (487 lines)

**Proposal:**
```
Line 1: One number. Daily. Shows your business is alive.
Line 3: [One perfect example notification]
Line 10: How it works [concise]
Line 50: Implementation details [for builders]
```

User value first. Machinery last.

### 2. Reduce todo.md Surface Area
**Current:** 231 tasks across 400 lines

**Issue:** Can't see progress forest through verification trees.

**Proposal:**
- 18 primary tasks (spec.md line 398)
- Verification criteria separate artifact
- Todo shows *intent*, not *proof*

Example transformation:
```
Current (lines 14-23): 10 migration verification tasks
Proposed: "Database foundation — 3 tables, indexed, ready"
```

### 3. Default to Invisible
**Line 143 in todo.md:** "Ensure animation doesn't block user interaction"

Good. Extend principle:

**Badge unlock modal:** Should *feel* like celebration. Animation serves emotion, not spectacle.

**Confetti (todo.md lines 230-243):** 13 tasks for particles.
- Performance checks: good
- Duration optimization: good
- Missing: "Does it make user *proud*?"

**Recommendation:** Performance is craft. But delight is design. Test both.

### 4. Make Whitespace Structural

**Spec.md line 31:** "One number per day" — brilliant constraint.

**Implication:** Interface should have *one visual anchor* per screen.

**Badge gallery (todo.md line 279):** "Grid layout (3-4 columns desktop, 1-2 mobile)"

**Issue:** Grid = density. Contradicts "one thing" philosophy.

**Proposal:** Single badge hero focus. Gallery in background, blurred. Click to browse.

### 5. Notification Preferences Restraint

**todo.md lines 180-182:** 3-5 toggles max. Good instinct.

**Missing:** What are the 3?

**Proposal:**
1. Time (visual: clock, not dropdown)
2. Frequency (visual: slider "quiet ←→ active", not menu)
3. Channel (visual: icon tap, not checkbox grid)

Each preference: one gesture. No forms.

### 6. Let Silence Communicate

**"All quiet" feature (spec.md lines 57-58, todo.md lines 162-175):** Frequency capped at 2x/week.

**Issue:** Still notification. Still interruption.

**Alternative:** No notification. Badge in app: "Steady. I'm watching."

Presence through absence.

---

## Specific File + Line Changes

### spec.md
- **Lines 1-10:** Delete. Replace with user-facing summary (see #1 above)
- **Lines 224-305:** Move to `/docs/IMPLEMENTATION.md`. Spec shows *what*, not *where*.
- **Line 29:** Promote "30-second dopamine hit" to line 3. This is the design principle.

### todo.md
- **Lines 14-23:** Collapse 10 migration tasks → 1 outcome statement
- **Lines 230-243:** Confetti tasks missing emotional success criterion. Add: "User smiles (test with 5 people)"
- **Lines 275-291:** Badge gallery structure conflicts with "one number" philosophy. Rethink layout.

### cliffhanger.ts
- **Lines 30-101:** Cut to 3 templates. Perfect > abundant.
- **Line 64:** Remove "No promises, but..." Conviction > hedging.
- **Line 126:** Fallback "Talk soon" → "Watching closely." Active, not passive.
- **Lines 179-192:** Validation excellent. Add positive test: "Contains curiosity words: [trying, testing, noticed, studying]"

### .env.example
- **Lines 1-42:** Add inline comments explaining *why* each variable matters to user experience.
- Example: `TWILIO_PHONE_NUMBER=+15551234567  # Users receive SMS from this number — brand presence`

### tests/05-brand-voice-check.sh
- **Lines 42-50:** Good. Tests what to avoid.
- **Add:** Test what to *pursue*. Line 22-36 checks for warm language — expand with required minimum (e.g., "Every template must contain 'you' or 'your' at least once")

---

## The Core Issue

Project optimizes implementation before experience.

**Evidence:**
- 231 tasks before 1 UI exists
- Verification criteria longer than feature descriptions
- "Polish" scheduled last (Wave 3), not first

**Risk:** Ship database that happens to have interface.

**Alternative:** Design one perfect notification. Build backwards from that.

---

## What Would I Change Tomorrow

1. **Create single mockup:** Badge unlock moment. Perfect it. Use as North Star.
2. **Write 3 real notification examples.** Show user. Iterate until emotional response is correct.
3. **Reduce todo.md** to 50 lines. If task doesn't serve user feeling, defer it.
4. **Invert build order:** UI mocks → API to feed mocks → Database to persist.
5. **Add review checkpoint:** After Wave 1, stop. Evaluate if foundation serves quietness. If not, refactor before integration.

---

## Final Verdict

**Craft:** Present in constraints (cliffhanger validation, brand voice tests).
**Hierarchy:** Cannot assess — no interface.
**Consistency:** Philosophy strong, execution unknown.
**Whitespace:** Intent declared ("one number"), not yet designed.

**Recommendation:** Pause. Build one perfect thing. Then scale.

Systems thinking without human experience = elegant machinery nobody loves.

---

**Confidence:** Cannot fully assess product that doesn't exist yet.
**What's certain:** Spec shows care. Implementation will reveal if care becomes beauty.
