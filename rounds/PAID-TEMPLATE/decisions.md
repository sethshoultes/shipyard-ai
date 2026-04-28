# Shipyard — Locked Decisions
## Consolidated by Phil Jackson, Zen Master

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Shipyard** | Steve Jobs | Steve Jobs | Conceded by Elon Round 2. "The product is the vessel, not the welding torch." No "AI" suffix. |
| 2 | **Voice: Master craftsman** | Steve Jobs | Steve Jobs | Conceded by Elon Round 2. Warm, certain, exact. No buzzwords, no exclamation points, no emojis. Authority is kindness. |
| 3 | **Emotional hook: Liberation** | Steve Jobs | Steve Jobs | Conceded by Elon Round 2. The customer wants to become someone who *ships*. We deliver by actually shipping, not simulating empathy. |
| 4 | **PRD ≤ 50 lines, zero commercial fields** | Elon Musk | Elon Musk | Conceded by Steve Round 2. `stripe_payment_id`, status logs, and CRM leakage are administrative sin. Move money/legal to Stripe/HubSpot. Git history exists. The build document must be pure. |
| 5 | **V1 scope: Sites only** | Elon Musk | Elon Musk | No contest. Cut themes, plugins, and token budget tables. Internal cost accounting is not a customer deliverable. |
| 6 | **E-commerce, auth, i18n → v2** | Elon Musk | Elon Musk | Conceded by Steve Round 2. Each is a 10x complexity multiplier. v1 must ship before v2 exists. |
| 7 | **Automated deploy previews; no revision credits** | Elon Musk | Elon Musk | No contest. "Revision credits" imply human arbitration = O(n) labor. Customer approves or rejects via preview. |
| 8 | **Asset pipeline: local now, CDN at 100x** | Elon Musk | Elon Musk | Conceded by Steve Round 2. `./slug.assets/` for v1. CDN pipeline for scale. Infrastructure is where we comply, not compete. |
| 9 | **Sharded agents: Design → Component → Deploy** | Elon Musk | Elon Musk | Conceded by Steve Round 2. A 200-line PRD plus a full codebase will not fit in one session. Physics wins. |
| 10 | **Referral loop: one free month per closed deal** | Elon Musk | Compromise | Accepted by Steve, who modified execution. The output is the distribution engine. |
| 11 | **Badge: invisible signature, not billboard** | Steve Jobs | Steve Jobs | Elon wanted a visible "Built by Shipyard" badge; Steve rejected graffiti. Compromise: whispered signature. Let the work speak, then whisper our name. |

---

## MVP Feature Set (What Ships in v1)

### The Promise
Shipyard turns ambition into a live URL. The customer arrives anxious and leaves with their name on a URL the world can touch.

### In Scope
1. **Intake Experience**
   - A 5-question conversational form. Not a wall of YAML. Not a spreadsheet.
   - The customer must feel understood, not processed.
   - Behind the scenes, answers map to a structured markdown schema (≤20 lines, agent-ready).

2. **Build Contract (PRD)**
   - Hard limit: 50 lines.
   - Zero commercial fields. Zero status logs.
   - Contains only build instructions: pages, components, copy, assets, deploy target.

3. **Build Pipeline**
   - Single-session agent build for 5-page marketing sites.
   - Fixed page count guardrails. No exceptions in v1.
   - Design Agent → Component Agent → Deploy Agent sharding reserved for when context windows demand it.

4. **Output**
   - Live URL.
   - Deploy preview for customer approval/rejection.
   - Invisible "Built by Shipyard" signature — not a billboard.

5. **Asset Handling**
   - Local storage: `./slug.assets/`.
   - CDN pipeline designed but not implemented until scale demands it.

6. **Distribution Mechanics**
   - Referral loop: one free month for every closed deal.
   - Case studies extracted from beta program.
   - Open-sourced component artifacts (when ready).

### Out of Scope (v2 or Later)
- E-commerce
- Auth / user accounts
- Multi-language / i18n
- Themes as a product
- Plugins as a product
- Token budget tables in customer-facing docs
- Manual revision arbitration (human-in-the-loop review)

---

## File Structure (What Gets Built)

```
shipyard/
├── intake/
│   ├── index.html              # The 5-question confessional
│   ├── questions.json          # Question flow and branching logic
│   └── mapper.js             # Translates answers → schema.md
├── schema/
│   └── template.md             # 20-line markdown schema contract
├── prd/
│   └── rules.md                # 50-line PRD hard limit + field blacklist
├── agent/
│   ├── prompts/
│   │   ├── design.txt          # Design agent system prompt
│   │   ├── component.txt       # Component agent system prompt
│   │   └── deploy.txt          # Deploy agent system prompt
│   └── guardrails.json         # Fixed scope rules (page count, component whitelist)
├── build/
│   ├── index.js                # Orchestrator
│   └── context-shard.js        # Splits PRD + codebase across agents
├── components/
│   └── (living set)            # NOT a rigid library. Craft-quality base components
│                               # that adapt per project without breeding sameness.
├── assets/
│   └── [project-slug]/         # Local asset storage for v1
├── deploy/
│   ├── preview.js              # Deploy preview generator
│   ├── badge-injector.js       # Invisible signature injection
│   └── target-config.json      # Hosting target configuration
└── ops/
    ├── stripe-webhook.js       # Payment state handler
    └── hubspot-sync.js         # CRM sync (no CRM fields in PRD)
```

---

## Open Questions (Requires Resolution Before Build)

| # | Question | Stakes | Suggested Path |
|---|----------|--------|--------------|
| 1 | **Component library vs. custom craft** | Elon insists on a fixed component library for predictability and token efficiency. Steve rejects rigid templates as graves that breed sameness. This is the single largest unresolved tension. | Start with a curated *base* component set (20-30 primitives) that agents *adapt* per project. The guardrail is "no new primitives in v1," not "no customization." |
| 2 | **What are the 5 questions?** | Steve demands five questions maximum. Elon demands a 20-line schema. The mapping between human conversation and machine contract is undefined. | Design the questions to *elicit* the schema fields organically. Question 1 = purpose (maps to hero + CTA). Question 2 = audience (maps to tone + social proof). Question 3 = pages/sections (maps to nav + footer). Question 4 = visuals (maps to palette + assets). Question 5 = domain/deploy (maps to DNS + SEO). |
| 3 | **How does the "invisible signature" work technically?** | Steve wants a whisper, Elon wants distribution. Both agree it exists. | Semantic HTML meta tag + subtle SVG watermark in footer (low opacity, no link unless hovered). Trackable via `generator` meta or DNS CNAME without visual clutter. |
| 4 | **Pricing model beyond referral loop** | Never debated. We know what a closed deal earns the referrer. We do not know what the customer pays. | Set as a separate pricing committee decision. Suggest: flat per-site fee with tiered page counts. |
| 5 | **Hosting and deployment target** | "Live URL" was promised without specifying infrastructure. | Default to Vercel/Netlify for v1. Abstract the deploy target so it can swap. |
| 6 | **Agent failure / hallucination recovery** | Steve's minimal intake risks agent hallucination. Elon's rigidity risks customer rejection. | Add a validation layer: schema → agent → lint → preview. If lint fails, auto-retry once with expanded context before surfacing to customer. |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Context window overflow** | High | Critical | Enforce 50-line PRD limit via linter. Shard agents when PRD + codebase > 75% of model context. |
| **Scope creep via intake** | Medium | High | Hardcode scope guardrails in `guardrails.json`. If a customer asks for e-commerce/auth/i18n, the form replies: *"That is a v2 product. We will notify you when it launches."* |
| **Sameness kills brand** | Medium | High | Resolve Open Question #1 immediately. Start with adaptable primitives, not rigid templates. Budget for human taste review on a subset of builds. |
| **Agent hallucinates requirements** | Medium | High | The 5-question intake maps to a structured schema. No freeform haikus to the agent. Validate schema before build. |
| **Local asset storage breaks at scale** | Low (v1) / High (v2) | Medium | v1: accept the risk. v2: implement CDN pipeline before 500th project. |
| **Distribution too slow without ads** | Medium | High | Referral loop is the primary engine, but set a KPI: if organic referrals < 30% of new leads by month 6, authorize a small paid test budget. |
| **Customer expects unlimited revisions** | Medium | Medium | Deploy preview = one-shot approval. Communicate clearly in intake: *"You will receive a deploy preview. Approve to launch, or reject with one round of consolidated feedback."* |
| **Single-session build fails on edge cases** | Medium | High | Retry logic + sharding fallback. If a build fails twice, escalate to human (exception path, not default). |
| **The "confessional" UI is expensive to build** | Low | Medium | A 5-question form with good typography is not rocket science. Do not over-engineer animations. The feeling comes from copy and spacing, not React hooks. |

---

## The Triangle

> *"Steve gave us the soul. Elon gave us the assembly line. You need both to build a ship that crosses an ocean."*
>
> The build phase must honor Steve's non-negotiables:
> 1. The intake is a conversation, never a form.
> 2. The output is undeniably beautiful.
> 3. Our voice is the master craftsman.
>
> While executing Elon's non-negotiables:
> 1. PRD ≤ 50 lines, zero commercial fields.
> 2. Fixed scope guardrails in the intake form.
> 3. Output as distribution engine.
>
> The blueprint above is where they meet. Build it.
