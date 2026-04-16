# Sara Blakely Review — Shipyard Self-Serve Intake

## Would a customer pay?
**No.** This is internal workflow automation. No revenue model. It's a cost-saver, not a revenue generator. You're building faster intake for *your* team, not selling to customers.

## What's confusing?
- "Zero-click" but requires adding `intake-request` label — that's manual. Not zero-click.
- Why keyword matching instead of just using AI worker from start? Over-engineered.
- Dashboard is read-only — so what happens after PRD created? Where's action?
- "Invisible power" — opening issue IS the form. You're replacing Jira with GitHub issues.

## 30-second elevator pitch
"Open GitHub issue with special label → bot analyzes it → posts PRD in 30 seconds. No forms. No meetings. No waiting."

## What would I test first ($0 budget)?
- Post fake GitHub webhook with urgent bug report. Does PRD make sense? Is priority right?
- Post vague feature request. Does confidence scoring work? Does it default safely?
- Post 10 issues at once. Does rate limiting hold up?
- Read bot comment. Does it sound human or robotic? Would I trust it?

## What's the retention hook?
**Lack one.** This is one-shot automation. User opens issue, gets PRD, walks away. No loop. No stickiness. No reason to come back beyond "I have another request."

Retention needs: status updates in GitHub issue comments. "PRD reviewed. Team starting work Monday." "Feature deployed. Close this issue?" That's the loop.

## Biggest risk?
False confidence. Keyword matching will misclassify. User opens "urgent bug" → system says p2 → trust broken. One bad classification kills adoption.

## Bottom line
It's clever infrastructure. But where's user delight? Bot comments need personality. Dashboard needs action buttons. System needs to *close the loop* — not just generate PRD and disappear.

**Would I ship it?** Yes, but stripped down. Cut AI worker integration for v1. Keyword matching only. Prove users open issues. Then add AI.
