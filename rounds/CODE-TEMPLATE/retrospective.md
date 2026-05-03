# Retrospective — CODE-TEMPLATE (Codex)

## What Worked

- Two-round debate (Elon ↔ Steve) surfaced real trade-offs, not theater. Decisions became concrete: verbatim blocks, capped risks, namespacing.
- Decision log format (table + rationale) made later trade-offs traceable.
- Demo script is strong. Problem → contract → validation → payoff arc lands in two minutes.
- Diverse board composition exposed blind spots: Oprah caught onboarding coldness, Jensen caught primitive validation, Buffett caught phantom economics.
- QA gate caught placeholder content. Automation worked.

## What Failed

- **Deliverable shipped with phantom assets.** Non-existent GitHub repos, AgentPress references, TODOs in supposedly finished files. QA blocked it. Truth: we built a story, not a repo.
- **Board verdict: HOLD (4.25/10).** Three of four reviewers rated it a cost center or corpse. Shonda: "fix it or kill it." The artifact is not shippable.
- **Open questions in decisions.md never resolved.** Parser language, versioning scheme, verbatim block definition — six blockers punted to "before build." They were never answered. We wrote a blueprint without nailing the foundation.
- **Retention roadmap is scope bloat in disguise.** Shonda demands gamification, LLM-native validation, semantic ambiguity detection, progress loops. Board exit conditions require a full rebuild. v1 died before it lived because the bar became v3.
- **Naming debate (Codex vs CODE-TEMPLATE) consumed energy while deliverables rotted.** Steve won the word. Elon won the architecture. Neither prevented phantom repos.

## What to Do Differently

- **Resolve open questions before any board review.** No reviewer should see "TBD" in the build spec.
- **QA before board, not after.** Placeholder detection should block the round, not the verdict.
- **Shrink board conditions.** A HOLD that demands LLM-native grading + gamification + semantic validation is not a gate — it's a wishlist. Make exit criteria smaller than the next version.
- **Match ambition to evidence.** Buffett's right: prove internal ROI before dreaming of platform. Oprah's right: fix the welcome before adding a leaderboard.

## Key Learning

A template that enforces precision must itself be precise; hypocrisy is fatal.

## Process Adherence Score: 7/10

Followed the form faithfully (debate → decisions → QA → board → verdict), but let the substance leak through gaps (unresolved blockers, phantom assets, premature roadmap). Form without rigor is ritual, not discipline.
