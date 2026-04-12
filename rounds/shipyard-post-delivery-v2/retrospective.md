# Retrospective: shipyard-post-delivery-v2 (Anchor)

**Author:** Marcus Aurelius
**Date:** 2026-04-12

---

*"Waste no more time arguing about what a good man should be. Be one."*

And so with projects: waste no more time debating what should have been done. See clearly what was, learn from it, and move forward with wisdom.

---

## What Worked Well

### 1. The Deliberative Process Was Rigorous
Steve Jobs and Elon Musk brought opposing philosophies into direct collision — soul versus speed, trust versus conversion, craft versus shipping. Phil Jackson consolidated their debates into a clear decisions document with winners documented, reasoning recorded, and compromises articulated. This is how good decisions are made: through honest disagreement, not false harmony.

### 2. The Essence Was Captured Early
The project began with clarity: *"Making clients feel watched over after their site launches."* The emotional core — "Someone's got my back" — was established before architecture debates consumed attention. This essence held throughout, guiding every subsequent decision.

### 3. Scope Was Controlled Ruthlessly
The 300K token budget forced discipline. The explicit "Excluded from v1" list prevented scope creep. "No dashboard in v1" was a brave and correct decision. The team understood: *a product that exists imperfectly beats a perfect product that never ships.*

### 4. The Architecture Debates Produced Sound Technical Choices
- JSON storage until 100 customers (no premature optimization)
- Cloudflare Workers + Stripe + Cron (minimal infrastructure)
- Weekly PageSpeed runs, not daily (useful, not vain)
- First-party analytics only (respect user privacy, avoid OAuth complexity)

Elon's first-principles thinking served the project well here.

### 5. Quality Standards Were Established
Steve's insistence that "the emails are the entire product" and "A+ copy or don't ship" created a quality bar. Maya Angelou's copy review was exacting and specific — naming weak lines and offering rewrites. This is how craft improves: through honest critique.

### 6. Board Review Added Strategic Depth
Oprah's focus on trust, accessibility, and human connection; Shonda's narrative lens on retention gaps and engagement hooks — both surfaced risks the technical debates had missed. The 60-day silence between Month 1 and Q1 Refresh is a churn timebomb that would have shipped unnoticed.

---

## What Didn't Work

### 1. The Build Was Catastrophically Incomplete
QA Pass 1 found **23 P0 blockers**. Completion rate: **41.7%**. The entire `site/`, `workers/`, and `emails/` directories were missing. Two QA passes later, the build still cannot ship.

This is not a minor gap. This is a failure to execute. The debates were eloquent; the code was absent.

### 2. The Deadlock on Card Collection Was Never Resolved
The philosophical disagreement between Steve (trust before transaction) and Elon (card at project start for 5x attach rate) was marked "DEADLOCKED — requires founder decision." It remains unresolved. The signup flow cannot be built without this decision.

The agency identified the impasse but did not escalate it. The founder was not forced to choose. And so the team built around a hole.

### 3. Eight Open Questions Were Left Unanswered
Email service provider. Exact pricing. Support email address. BetterUptime configuration. Enrollment trigger. These are not edge cases — they are prerequisites. The decisions document listed them; the build proceeded anyway.

This is process failure: moving to build before requirements were complete.

### 4. Nothing Was Committed to Git
Both QA passes found: `?? deliverables/shipyard-post-delivery-v2/`. The entire deliverables directory was untracked. Not a single file was committed to the repository.

This means: no version history, no backup, no collaboration possible. Work done in isolation, at risk of loss.

### 5. The Demo Script Preceded Deliverables
A polished 2-minute demo script was written for a product that doesn't exist. The story was told before the building was built. This is a seductive trap: the pleasure of imagining the future instead of constructing it.

### 6. The 60-Day Retention Gap Was Identified But Not Fixed
Shonda's review correctly flagged the dangerous silence between Day 30 and Day 90. The retention roadmap was written. But the Month 2 email? Not created. The Day 3 check-in? Not created. The alert system? Not implemented.

Insight without action is merely entertainment.

---

## What the Agency Should Do Differently Next Time

### 1. Resolve Blocking Decisions Before Build Begins
Mark open questions as blockers. Do not proceed to build until founders decide. Escalate actively: "We cannot build the signup flow until you choose card timing." Document the escalation.

### 2. Define "Done" Before Starting
Create a checklist of every file that must exist. Track completion against this checklist. Do not claim progress based on debates — claim progress based on deliverables.

### 3. Commit Early and Often
Every work session should end with a commit. "Work in progress" is still work worth saving. Git is not a ceremony for completion; it is protection against loss.

### 4. Sequence Reviews to Match Build State
QA should not run on a 41% complete build. Copy review (Maya Angelou) should not happen before copy exists. Board review should not evaluate a product that cannot ship.

The agency ran its full review process on a scaffold. This created the illusion of progress.

### 5. Close the Loop Between Critique and Implementation
When Shonda says "add a Month 2 email" and writes the template, someone must create `emails/month-2.html`. Recommendations that remain in prose are not improvements — they are intentions.

### 6. Distinguish Between Design and Delivery
The Essence document, the round-by-round debates, the demo script — these are *design* artifacts. They describe what should be. The `lib/` directory, the workers, the email templates — these are *delivery* artifacts. They are what is.

This project excelled at design and failed at delivery. The ratio should be inverted.

---

## Key Learning to Carry Forward

**Eloquent strategy without disciplined execution produces nothing but well-documented failure.**

---

## Process Adherence Score: 4/10

**Justification:**

| Dimension | Assessment |
|-----------|------------|
| Requirements definition | Strong (decisions.md is comprehensive) |
| Decision-making process | Strong (clear debates, documented outcomes) |
| Blocking issue escalation | Weak (card timing deadlock unresolved) |
| Build completeness | Failed (41% → ~65% across two QA passes) |
| Version control discipline | Failed (nothing committed) |
| QA rigor | Strong (Margaret Hamilton was thorough) |
| Review quality | Strong (Oprah, Shonda, Maya added value) |
| Action on feedback | Failed (retention roadmap not implemented) |

The agency designed well. It debated well. It critiqued well. It did not build.

---

## Final Reflection

*"It is not death that a man should fear, but he should fear never beginning to live."*

A product that is not shipped has not begun to live. Anchor has a soul — "Someone's got your back" — but a soul without a body cannot act in the world.

The next round must be different. Less discussion of what the emails should feel like. More creation of the emails themselves. Less imagining the customer journey. More building the landing page they will land on.

The agency has demonstrated taste. Now it must demonstrate discipline.

Ship the thing.

---

*Marcus Aurelius*
*Observer and Chronicler*
