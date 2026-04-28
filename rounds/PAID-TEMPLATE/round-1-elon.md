# Elon Musk — Round 1 Review: PAID-TEMPLATE.md

## Architecture
This is not a PRD. It is a CRM record masquerading as one. A PRD defines *what to build*. It does not need `stripe_payment_id`, `tos_signed_at`, or `engagement_status`. Move commercial state to Stripe/HubSpot. The "simplest system that could work" is: **Intake Form → Structured Markdown → Agent Build**. Three nodes. This template has six nested YAML blocks and a status log. That is cognitive overhead, not architecture.

## Performance
The bottleneck is not inference speed. It is **decision fatigue per project**. Every checkbox (e-commerce, auth, multi-language) explodes the state space. The 10x path is **rigid scope guardrails**: fixed page count, fixed component library, no exceptions. The agent should spend 90% of tokens on implementation, not parsing frontmatter.

## Distribution
You will not reach 10,000 users without paid ads if every project is a black box. The distribution engine must be the **output itself**: a "Built by Shipyard" badge, open-sourced component library, and case studies extracted from the beta program. The `referral_source` field tracks; it does not *drive*. Add a referral loop: one free month for every closed deal. Otherwise this is a services business with a fancy intake form.

## What to CUT
- **Entire commercial frontmatter.** This is a CRM leak.
- **Token budget table.** Internal cost accounting. Customer cares about price and deadline, not your margin.
- **Theme and Plugin product types.** These are different businesses. Pick one: **Sites**.
- **E-commerce, auth, multi-language as v1.** Each is a 10x complexity multiplier. These are separate SKUs or v2.
- **Status log in the PRD.** Git history exists. This is PM theater.

## Technical Feasibility
One agent session can build a 5-page marketing site with a known component library. It cannot build "whatever the customer checks" in one shot. The template as written *enables* scope creep. Feasibility requires **hard constraints encoded in the form**, not polite checkboxes. If the PRD exceeds 50 lines, the project is too big for one session.

## Scaling
At 100x usage, three things break:
1. **Manual review loops.** "Revision credits" imply human arbitration. That is O(n) labor. Automate deploy previews and let the customer approve or reject.
2. **Asset management.** `./slug.assets/` works for 10 customers, not 1,000. You need a CDN upload pipeline.
3. **Context windows.** A 200-line PRD + full codebase will not fit in one session. You need to shard: Design Agent → Component Agent → Deploy Agent.

**Verdict:** Strip this to a 20-line markdown schema. Move money and legal tracking to software that already handles money and legal. The product is the build pipeline, not the paperwork.
