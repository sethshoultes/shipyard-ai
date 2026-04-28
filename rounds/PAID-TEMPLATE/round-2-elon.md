# Elon Musk — Round 2 Rebuttal: PAID-TEMPLATE.md

Steve, you named the thing beautifully. *Shipyard* is correct; the poetry lands. But a confessional that does not produce blueprints is just therapy. We are not in the business of healing customer anxiety. We are in the business of shipping URLs.

## Where Beauty Becomes a Bottleneck

"One beautiful question" is a lovely tweet. It is a disaster for an agent. A large language model needs structured signal to emit working code. If the intake is a haiku, the agent hallucinates the rest, and you spend three revision cycles debugging what a human should have specified in thirty seconds. Whitespace does not compile. Typography does not resolve dependencies. The customer feels cared for for thirty seconds, then furious for three days when the output misses their actual requirements.

Steve wants to cut fields. I agree. But he does not say which fields to keep, or how the agent receives the kept ones. "Cut it in half, then cut it again" is not a schema. It is a mood. I am offering a 20-line markdown schema. That is a contract. The agent knows what to expect; the customer knows what they are buying. Rigidity is the ultimate kindness when a deadline is involved.

## Why Technical Simplicity Wins

The 50-line PRD limit is not austerity. It is physics. A 200-line PRD plus a full codebase exceeds the context window of every model shipping today. You cannot shard a design agent, a component agent, and a deploy agent if the input is a novel. Hard constraints—fixed page count, fixed component library, no exceptions—are not customer-hostile. They are the reason the agent works on attempt one instead of attempt seven.

The commercial frontmatter must die. `stripe_payment_id` does not belong in a build artifact. That is a CRM leak. Stripe handles money; Git handles version history; the PRD handles build instructions. Conflating them is not integrated design. It is technical debt with a logo.

## The Concession

Steve is right about three things, and I will lock them:

1. **The name.** Shipyard. Not Shipyard AI. The product is the vessel, not the welding torch.
2. **Voice.** Warm, certain, exact. No exclamation points, no emojis, no "leverage our synergies." Authority scales.
3. **Emotional hook.** The customer wants to become someone who ships. We deliver that by actually shipping, not by simulating empathy in a form.

## Non-Negotiables

1. **PRD ≤ 50 lines, zero commercial fields.** Move money and legal tracking to Stripe and HubSpot. The PRD is a build contract, not a database record.
2. **Fixed scope guardrails in the intake form.** Fixed page count, fixed component library, no e-commerce / auth / i18n in v1. If the customer cannot describe it in the constraint box, it is out of scope.
3. **Output as distribution engine.** Every shipped site carries a "Built by Shipyard" badge, open-sources its components, and feeds a referral loop. The product markets itself, or we are a services company with an LLM intern.

Steve gave us the soul. I am giving us the assembly line. You need both to build a ship that crosses an ocean.
