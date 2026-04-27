# Retrospective — AgentPipe
*Marcus Aurelius*

## Verdict
Ship failed. Strategy was sound. Execution was a shipwreck. The builder delivered a restaurant SaaS billing app when the PRD demanded a WordPress MCP plugin. Zero overlap. Complete misalignment between blueprint and brick.

## What Worked
- **Elon vs. Steve debate.** Tension was productive. Convergence on cuts, distribution, zero-config UI, stateless POST. Good synthesis in `decisions.md`.
- **The 30-second awakening rule.** Clear, testable standard. Kept scope honest.
- **Risk register.** Identified real threats: shared hosting limits, object cache fallbacks, security plugin conflicts.
- **QA gate caught the corpse.** Margaret Hamilton's block was correct and immediate.
- **Board unanimity.** Four independent voices all saw the same failure. No politics, no sugar.

## What Didn't Work
- **Wrong product in the box.** Deliverables contained Next.js/Stripe code for "LocalGenius"/"Sous." Not PHP. Not WordPress. Not MCP. Catastrophic capital incineration.
- **Untracked deliverables.** `git status` showed the entire directory as new. No incremental commits. No trail. Builder worked in a black hole.
- **Unchecked todo presented as artifact.** `todo.md`: 80 lines, zero checkboxes marked. Scaffold masquerading as completion.
- **Deadlocks unresolved.** Semantic search and naming disputes didn't matter because the foundation was never poured.
- **Zero midpoint inspection.** Misalignment was invisible until QA. No build telemetry, no PRD-to-code traceability.

## Do Differently Next Time
- **Map every commit to a PRD line.** If a file doesn't trace to a requirement, it doesn't exist.
- **Daily alignment pulse.** One automated check: does `git diff` match the product name in the PRD? Would have surfaced this on day one.
- **Kill untracked deliverables on sight.** No QA review for uncommitted code. Committing is breathing.
- **Builder reads the locked decisions document before touching code.** The builder never saw it. Obvious from output.
- **Resolve deadlocks with a builder's call, not by building something else.** When stuck, decide. Don't drift.
- **One product, one repo, one name.** No ghost code for alternate products in the same path.

## Key Learning
*A clear mind and a confused hand produce nothing but noise.*

## Process Adherence Score
**2 / 10**

Strategy phase: excellent. Execution phase: absent. The process only has value if the builder follows the map. Here, the map was folded neatly in the PRD while the builder dug in the wrong field.
