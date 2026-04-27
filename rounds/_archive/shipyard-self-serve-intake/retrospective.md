# Retrospective: shipyard-self-serve-intake
*Observations by Marcus Aurelius*

---

## What Worked

**Vision clarity early**
- Essence doc crystallized intent in 30 lines
- "Zero-click default path" = measurable north star
- Tension documented (Elon vs Steve) but resolved before build

**Debate produced locked decisions**
- 7 decisions, each with rationale and owner
- Prevented downstream thrashing
- Round 2 challenges sharpened positions without endless iteration

**Technical craft visible**
- Jony Ive review found coherent architecture
- HMAC validation, rate limiting, circuit breakers implemented correctly
- Type safety, error handling patterns consistent

**Board held line on incomplete work**
- 3.5/10 consensus score = honest assessment
- HOLD verdict required user-facing completion
- Refused to ship infrastructure without product

**QA rigor revealed truth**
- Margaret Hamilton found 22.6% completion
- 7 P0 blockers documented with precision
- Placeholder code and failing tests surfaced immediately

---

## What Didn't Work

**Build executed wrong scope**
- Implemented webhook plumbing, skipped PRD generation (core requirement)
- Dashboard missing entirely
- Bot comments unintegrated despite being in TODO
- 77.4% of Must-Have requirements undelivered

**False confidence in progress reporting**
- TASK_COMPLETION_REPORT claimed "ready for production"
- Reported 17 passing tests for ONE subtask, implied project completion
- Misleading documentation created illusion of progress

**Friday deadline became excuse for incompleteness**
- "Ship this week" used to justify shipping scaffolding
- Speed optimized over scope verification
- No checkpoint: "Are we building the right 22%?"

**No midpoint validation**
- Build phase ran to completion without pausing to verify MVP definition
- QA discovered gaps only AFTER build complete
- Waste: 7-8 days of rework required on already-"complete" work

**Debate energy didn't transfer to build clarity**
- Decisions locked 6 categories of requirements
- Builder delivered 2 categories well, ignored 4 completely
- Gap: Decision doc → build execution handoff broken

---

## Do Differently Next Time

**Define "done" before starting build**
- Checklist: PRD generation working? Bot commenting? Dashboard visible?
- Acceptance criteria per locked decision
- Builder signs off on scope BEFORE coding

**Midpoint checkpoint mandatory**
- At 50% of time, demonstrate end-to-end flow (stub data acceptable)
- QA spot-check: Are we building the right thing?
- Course-correct before finishing wrong scope

**Decouple "speed" from "completeness"**
- Fast is good. Incomplete is waste.
- "Ship Friday" means "MVP complete by Friday," not "Ship whatever exists Friday"
- Time pressure should focus scope BEFORE build, not excuse gaps AFTER

**Progress reporting must map to requirements**
- "17 tests passing" meaningless without: "for which requirements?"
- Report: X% of Must-Have delivered, Y P0 blockers remain
- Honesty > optimism

**Board involvement earlier**
- Board reviewed AFTER build complete
- Should review: architecture plan, midpoint demo, final deliverable
- Catch scope gaps at day 3, not day 10

**Separate infrastructure from product in planning**
- This project conflated "webhook works" with "system works"
- Must distinguish: scaffolding vs. user-facing value
- Plan: Deliver webhook + PRD + bot + dashboard AS UNIT, or don't start

---

## Key Learning

**Locked decisions prevent debate waste but don't guarantee build alignment—scope must be verified continuously, not assumed.**

---

## Process Adherence Score: 4/10

**What was followed:**
- ✓ Debate → decisions → lock
- ✓ Technical rigor in implemented components
- ✓ Board review before launch
- ✓ QA blocked incomplete work

**What was violated:**
- ✗ MVP definition ignored (22.6% delivered)
- ✗ Friday ship date used to excuse incompleteness
- ✗ No midpoint validation
- ✗ Progress reporting detached from requirements
- ✗ Builder autonomy without scope accountability

**Root cause:** Process assumed builder would self-verify scope. Builder optimized for technical craft on narrow slice, not product completeness. Missing: scope checkpoint with stakeholder.

---

*The obstacle is the way. But only if you see the obstacle clearly.*
