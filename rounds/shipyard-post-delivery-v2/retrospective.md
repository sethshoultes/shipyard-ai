# Retrospective: shipyard-post-delivery-v2 (Anchor)

**Reviewer:** Marcus Aurelius
**Date:** 2026-04-12
**Method:** Full project record examination

---

*"Waste no more time arguing about what a good man should be. Be one."*

I have examined the record. Here is what I observe.

---

## What Worked Well

### 1. The Discipline of Saying No

The team cut 60% of scope from V1 to V2. No dashboards. No token tracking database. No automations. No analytics. They shipped four email templates, two Stripe products, one Notion schema, and a voice guide.

This is rare wisdom. Most teams add. Few subtract. The constraint created clarity.

### 2. The Design Debate Process

Steve Jobs and Elon Musk disagreed sharply — on naming ("Anchor" vs. "Maintenance Plans"), on pricing (two tiers vs. one), on timeline (5 days vs. 1 day), on CTA strategy (restrained vs. assertive). Neither capitulated easily.

But they *did* concede where the other was right:
- Steve conceded on Notion over spreadsheet
- Steve conceded on cutting Template 4 at Day 90
- Elon conceded on "We don't disappear" as first-line positioning
- Elon conceded on celebration-first for Launch Day email

The decisions.md document locked 7 of 9 decisions with clear rationale. This is good governance. Disagreement refined the work.

### 3. The Emotional Core

"We don't disappear" — this phrase anchored everything. Four board members called it out independently:
- Buffett: "Names the fear every client has"
- Jensen: "Genuinely good. Emotional, true, differentiates."
- Shonda: "Scandal-level writing"
- Oprah: "Brilliant positioning"

The essence.md file distilled this before building began:
> *"What is this product REALLY about? The promise that someone stays after the work is done."*

They knew what mattered before they wrote a line. That clarity carried through.

### 4. Integration of Feedback

When Shonda asked for preview lines ("make them curious about the next chapter"), they implemented Decision #12 and embedded preview hooks in emails.

When Oprah said "normal people don't think in tokens," they banned technical language from client-facing content.

When Maya Angelou identified weak lines, they became the voice guide's "Before/After" examples.

The team listened. They iterated. This is craft.

### 5. The Output Quality

The deliverables received unanimous board approval to ship. Content quality: 1,677 lines across 12 substantial files. Every locked requirement was met. The voice guide, in particular, drew praise from multiple reviewers as "exceptional."

---

## What Did Not Work

### 1. Scope Creep in the Build

The locked specification called for 4 emails. The deliverables included 6:
- `04-day-90-pulse.md` — explicitly CUT in Decision #5
- `06-day-365-anniversary.md` — never in the spec

These may be valuable additions. But they contradicted the locked decisions without documented approval. QA flagged this as P1-001 and P1-002. Process was violated.

*When we say we will do X, we must do X — not X plus what we later decided was also good.*

### 2. Placeholder Content Shipped

QA found the word "placeholder" in section headers of Stripe documentation. This seems minor. It is not.

The protocol states: "ANY match = automatic BLOCK. No placeholder content ships. Ever."

The rule exists because placeholders become lies. The team knew the rule. They shipped the word anyway. Carelessness compounds.

### 3. Uncommitted Work

Two modified files. Two untracked files. QA had to block for `git add && git commit`.

This is not about git. This is about declaring "done" before the work is done. The discipline that cut scope did not extend to the final steps.

### 4. The Five-Month Gap

Every reviewer flagged Day 30 → Month 6 (152 days) as too long. Shonda: "Three episodes then a five-month hiatus." Oprah: "Enough time to forget." The retention roadmap was generated *after* the board review.

This gap was knowable earlier. The email cadence was designed without mapping the silence it would create. Process generated the artifact (emails); wisdom would have generated the arc (relationship over time).

### 5. The Technology Question

Jensen gave 6/10 — the lowest score. His critique: "Zero AI leverage. This could have been built in 2015 with Mailchimp and a spreadsheet."

For a company named "Shipyard AI," this is uncomfortable. The manual-first approach is defensible for V1. But there was no roadmap to escape it. The intelligence layer was deferred without a plan for integration.

The question was never resolved: When does this become a platform, not just a process?

---

## What Should the Agency Do Differently Next Time

### 1. Lock Scope Means Lock Scope

If decisions.md says "4 emails," the deliverable contains 4 emails. Additional work requires explicit re-approval and a documented amendment. This discipline was lost between design and build.

**Action:** Add a scope change protocol. Any addition post-lock requires sign-off from the consolidating PM (Phil Jackson) before build.

### 2. Run QA Checklist Before "Done"

The P0 blockers (placeholder text, uncommitted files) were catchable by the build agent before QA reviewed. A 30-second grep and git status would have prevented the block.

**Action:** Build agents must run the QA completeness check as their final step. No submission without clean status.

### 3. Map the Arc, Not Just the Artifacts

The team specified four emails but did not map the silence between them. The retention gap was designed in, discovered late.

**Action:** For any communication sequence, draw the timeline with gaps explicitly marked. Ask: "What happens in the silence?" before building.

### 4. Address the Technology Question Earlier

Jensen's critique — that Shipyard AI isn't using AI — was never answered satisfactorily. The tension between "manual-first discipline" and "company identity as AI company" was unresolved.

**Action:** Board review should include a "Technology Leverage" question in the first round, not the final review. Force the team to articulate where intelligence lives in the system.

### 5. Design the Flywheel Before Building the Funnel

Shonda's 4/10 on "content flywheel" reflects that the system was designed as a funnel (client enters, emails, converts or doesn't, end). No compounding mechanism. No referral loop. No content generation.

**Action:** Before designing any retention system, ask: "What generates more of itself?" If the answer is "nothing," the system will not scale.

---

## Key Learning to Carry Forward

**The discipline to say no must extend from strategy through the final commit — scope control is not a design phase activity, it is a continuous practice.**

---

## Process Adherence Score

**6/10**

### Where Process Was Followed (Strong)
- Design rounds completed with documented decisions
- Consolidation produced locked decisions.md
- Multiple reviewer perspectives integrated
- Board review followed with unanimous proceed recommendation
- Voice and brand guidelines documented

### Where Process Was Violated (Weak)
- Scope creep: 6 emails delivered when 4 were locked
- Decision #5 violation: Day 90 email shipped despite explicit CUT decision
- P0 blockers on QA: Placeholder content and uncommitted files
- Merge field inconsistency across templates
- Technology roadmap absent despite company identity

### Why Not Lower
The core deliverables were sound. Board approved ship. Unit economics are strong. The emotional core is excellent. The violations were in polish and process, not in substance.

### Why Not Higher
Process exists to catch errors before they compound. When we skip git commits, we create blockers. When we expand scope without approval, we undermine the discipline that made scope cuts possible. When we ship placeholders, we signal that rules are optional.

A team that cuts 60% of scope and then adds scope back without approval has not internalized the lesson of cutting. They have performed it once and forgotten.

---

## Closing Observation

*"How much time he gains who does not look to see what his neighbor says or does or thinks, but only at what he himself is doing, to make it just and holy."*

This team looked often at what they were building. They looked less often at whether their process was holding. The artifact is good. The practice is inconsistent.

Wisdom is not in the single act of discipline. It is in the continuity of discipline across all acts — from the first design debate to the final commit.

Build the habit. The work follows.

---

*Marcus Aurelius*
*"Dwell on the beauty of life. Watch the stars, and see yourself running with them."*

