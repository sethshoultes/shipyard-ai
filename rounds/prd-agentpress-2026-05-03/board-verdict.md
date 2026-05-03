# Board Verdict — AgentPress
**Date:** 2026-05-03
**Rounds Reviewed:** Round 1–2 (Elon, Steve), Board Review (Jensen)
**Deliverable Status:** QA Blocked ×2 (placeholder content detected)

---

## Points of Agreement Across Reviewers

1. **AgentPress is the right wedge.** ContentWriter + ImageGenerator are the correct v1 pair. SEOMeta is a commodity battlefield owned by Yoast/RankMath and should not ship now.
2. **The REST endpoint is the only interface that matters in v1.** No front-end chat widget, no manual task runner textarea, no onboarding wizard.
3. **No SaaS tiers, "Pro" badges, or billing dashboards in v1.** Monetization is a v2 question.
4. **JSON parser hardening is non-negotiable.** Edge cases (markdown fences, truncated responses, hallucinated slugs) will collapse the pipeline if untested.
5. **Admin UI must stay minimal.** One settings page. No tabs. Consensus breaks on *how* native vs. crafted it should look, but all agree on the one-screen constraint.
6. **Scope discipline is the current failure mode.** The build phase introduced ghost files, placeholder stubs, and an excluded SEOMeta agent—precisely the bloat the review rounds voted to kill.

---

## Points of Tension

| Tension | Camp A | Camp B |
|---------|--------|--------|
| **Router Architecture** | *Steve:* The router is the soul. Orchestration layer stays as architecture; optimize with local keyword maps, do not eliminate. | *Elon / Jensen:* Local PHP keyword switch should be the default path. LLM routing is a latency tax and scaling bottleneck. Reserve Claude only for ambiguity. |
| **Design Philosophy** | *Steve:* "Crafted but native"—elevated WordPress patterns that signal premium quality. Ugly plugins are treated as commodity shareware. | *Elon:* Raw `form-table` *is* native taste. A tuxedo at a barbecue signals you don’t understand the room. |
| **Capability Registry** | *Steve:* CPT-based registry + activity logs = memory = trust. Users need to see what happened at 3 AM. | *Elon / Jensen:* Database write on every request is bloat. Use a serialized option or PHP filter on the hot path. |
| **Platform Claims vs. Deliverables** | *PRD / Decisions:* Claims extensibility via `agentpress_register_capability()` and a platform vision. | *Jensen:* Registry is a hardcoded static array. CPT exists but is not used dynamically. "Platform mechanics are theater." |
| **AI Leverage Depth** | *Steve / Product:* Invisible magic—human intent → machine decision → result. | *Jensen:* Commodity usage. No caching, no embeddings, no memory, no tool use, no agent collaboration. "200-level LLM architecture, not a system." |
| **Streaming / Async** | *Decisions (Steve/Elon converged):* No real-time streaming in MVP; async queues are architecturally correct but premature. | *Jensen:* "Async REST in 2026 is dead on arrival." Exclusion of streaming is a market-risk decision, not just scope discipline. |

---

## Overall Verdict: **HOLD**

The product vision is **endorsed**. The build execution is **blocked**.

Jensen Huang scored the deliverable **4/10** ("Good concept, incompetent execution"). The deliverable fails QA for placeholder content, ships with missing core files, references a ghost autoloader, and includes an agent explicitly excluded by audit criterion. It is not shippable in its current state.

However, the underlying blueprint (`decisions.md`) represents a championship rotation: Elon guards the baseline (speed, cost, technical honesty); Steve runs the offense (soul, taste, reason to care). The triangle offense is sound. The team did not execute what was written.

**Verdict:** HOLD. Do not ship. Do not kill. Rebuild to spec.

---

## Conditions for Proceeding

### Must-Fix (Blocking)
1. **Restore missing core files.** `class-rest-api.php`, `class-admin.php`, and `readme.txt` must exist and match the locked file structure.
2. **Autoloader integrity.** Remove all references to non-existent classes/files. Plugin must activate without fatal errors.
3. **Audit exclusion compliance.** SEOMeta agent must be fully removed from code, spec, and file tree per Decision 4.
4. **Zero placeholder deliverables.** No stub files, no unchecked todo items, no "reserved slot" files unless they contain production-ready code.

### Architecture & Performance
5. **Local keyword map for built-in agents.** ContentWriter and ImageGenerator must short-circuit via PHP `str_contains()` or equivalent **before** any LLM routing call. Claude fallback is reserved strictly for ambiguous input.
6. **Capability registry: choose a lane.** Either ship a working `agentpress_register_capability()` public API with dynamic CPT usage, or downgrade registry to a lightweight serialized option and remove platform claims from messaging until v2.
7. **JSON parser hardening.** Budget 30 minutes minimum for edge-case handling: markdown fences, truncated JSON, hallucinated slugs. Test before any other feature.
8. **Error contract definition.** The REST endpoint must return a predictable JSON error shape when Claude fails or the parser chokes.

### Trust & Quality
9. **Activity log schema lock.** Define CPT post-meta fields, retention/prune policy (Elon flagged 500 as a pain point), and confirm it renders in the one admin screen.
10. **Admin UI review gate.** The one settings screen must pass a "crafted vs. ugly" review before merge. Too designed = alien; too raw = shareware.
11. **Image handling flow defined.** Generated images: Media Library vs. custom directory? Shared-hosting timeout/memory fallback?

### Distribution
12. **readme.txt compliance.** Three paragraphs, API disclosure per WordPress.org TOS, no marketing novels.
13. **Third agent: fill or kill.** The reserved slot either ships with a defined, bloat-free agent, or the file is removed entirely.

---

*Build exactly what is written. No more. No less. The triangle offense only works when every player knows their spot.*
