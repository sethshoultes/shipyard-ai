# Forge — Locked Decisions
*Phil Jackson, Zen Master. The orchestra is tuned. These are the notes we play.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name criteria: one word, proper noun, no "Agent" prefix** | Steve (Round 1: "One word, memorable, human. Think Chorus. Think Relay. Never two words. Never 'AgentAnything.'") | Steve on criteria; specific name established prior to these debates | Elon Round 2 conceded the principle: "AgentForge is a bad name... One word. Proper noun. Fine." Working title remains **Forge** from prior context. Steve explicitly rejected forging as a metaphor ("We don't forge—we orchestrate"), so the name is a label, not a mission statement. |
| 2 | **Visual canvas ships in v1 — aggressively scoped** | Steve (Round 1 & 2: "The canvas makes the invisible visible." "Two agents, one connection, one play button"). | Steve, bound by Elon's engineering guardrails | Elon Round 1: "Canvas is a v2 feature masquerading as v1." Elon Round 2: "A clean layout is worth building—after the engine works." Steve Round 2 narrowed scope to two agents, one connection, one play button. Essence locks it: canvas ships, but it is a beautiful sketch — not Figma. |
| 3 | **Zero JSON/YAML exposure in the app UI** | Steve (Round 1: "NO to exposed JSON, logs, or 'API configuration' screens in the first hour." Round 2: "zero JSON exposure to humans"). | Steve on UX; Elon wins on engine architecture | Elon Round 1 wanted a structured config editor (JSON/YAML in, workflow out) as the primary v1 UI. That was rejected. Synthesis: the engine runs on structured config internally; humans never touch it. Developers who want JSON use the API (see Open Question #4). |
| 4 | **Web app only. No WordPress plugin in v1** | Elon (Round 1: "Pick ONE. Dual-platform splits focus and doubles QA surface"). Steve (Round 1: "NO to the WordPress plugin"). | Unanimous | Steve Round 2: "He is right that dual-platform is stupid. One sacred canvas. One." Splitting focus between auth models and hosting surfaces is how mediocrity ships. Wrap it later. Not on day one. |
| 5 | **No Workers AI / edge execution in v1** | Elon (Round 1: "'Workers AI for edge execution' is hand-waving; edge functions are ephemeral and stateless, but multi-agent workflows need durable state, retries, and observability"). | Elon, unanimous | Steve Round 2 ceded: "He is right that 'Workers AI' is premature infrastructure theater before we have ten users. No edge execution in v1." Edge doesn't fix 10-second LLM calls. Agents call APIs directly. |
| 6 | **Parallelize independent nodes + aggressive caching** | Elon (Round 1: "The 10x path is caching intermediate outputs and parallelizing independent agent calls to cut token spend"). | Elon, unanimous | Steve Round 2 conceded: "Cache like a hawk. Parallelize so the wait never kills the wonder." A 5-agent synchronous chain at 2s per call is 10s+ wall-clock; users bounce. Target: <3 seconds for cached or parallel paths. |
| 7 | **Token budgets + request deduplication day one** | Elon (Round 1: "per-user cost caps." "One user running 3 workflows on a cron job could cost $500/month in API calls"). | Elon, unanimous | Steve Round 2 conceded: "Elon was right: we cap the spend before we uncap the wonder. Hard caps, daily limits, and prepaid credits ship alongside the first invitation, not after." A multi-agent workflow costs $0.50–$2.00 per run. COGS kills startups faster than churn. |
| 8 | **Cut freemium billing complexity in v1** | Elon (Round 1: "Start usage-based or paid-only"). Steve (Round 1 & 2: "Give the first taste free, then charge boldly for power." "No 'three workflows free.'"). | Synthesis / Both | Stripe, subscription state, dunning, and quota enforcement burn engineering tokens for zero core value. No metered freemium in v1. A generous capped trial may exist, but the full monetization stack ships later. |
| 9 | **One aesthetic. White canvas. No dark mode priority.** | Steve (Round 1: "NO to dark mode as default—light, airy, optimistic." "One aesthetic."). | Steve, uncontested | Elon contested timeline and scope, not taste. The app ships one look, one mode. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| 10 | **Minimal core node palette — no node spaghetti** | Steve (Round 1: "NO to node spaghetti." "Remove everything that isn't essential." Round 2: "Two agents, one connection, one play button"). | Steve, with Elon's functional caveat | Elon agreed that clean layout matters, but only after the engine works. PowerPoint export, CSV templates, spreadsheet-looking templates, and committee features die in the courtyard. Exact roster is still open (see Open Question #3). |
| 11 | **Brand voice: human, confident, zero acronyms, no explaining** | Steve (Round 1: "Warm, confident, poetic, slightly rebellious." "If a sentence could appear in a Microsoft annual report or a Salesforce whitepaper, burn it and rewrite it."). | Steve, uncontested | Elon Round 2 conceded: "No corporate voice... 'Leverage multi-agent orchestration' belongs in a Salesforce whitepaper. Burn it." If a sentence could appear on a spec sheet from 2003, it dies. We sell the feeling of unfair advantage. |
| 12 | **No template marketplace in v1** | Elon (Round 1: "Templates don't create themselves; that's v2"). Steve (Round 2: "Template marketplaces on day one are founder theater—we earn templates by watching what users actually build, not by guessing in a vacuum."). | Unanimous | Templates are a crutch for a broken core loop. |
| 13 | **No admin dashboard with 40 toggles** | Steve (Round 1: "NO to admin dashboards with 40 toggles"). Elon (Round 2: "NO 40-toggle dashboards. Configuration is the enemy."). | Unanimous | "If you need forty toggles, you haven't decided what the product is." One knob when possible, zero when not. |
| 14 | **Defined execution model with durable state and idempotency before pixels** | Elon (Round 1: "You cannot build a visual editor for an undefined data structure." Round 2: "State machine defined in code before a single pixel is placed"). | Elon, unanimous | Steve Round 2 conceded: "He's right that 'workflow' is undefined under the hood. We need durable state, and idempotency before the first pixel ships." You cannot animate what you have not built. |
| 15 | **Living first-run / no blank canvas** | Steve (Round 1: "You land on a living, breathing workflow... Instant delight. Immediate power." Round 2: "Living first-run experience. No blank canvas."). | Steve, with Elon's operational warnings acknowledged | Elon Round 2 warned this "requires the exact infrastructure the PRD skips" and risks being "a v2 onboarding experience masquerading as v1." The principle ships. The implementation needs guardrails (see Open Questions #2 and #6). |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Forge web app** — single-platform, no plugin bifurcation
2. **White infinite canvas** — one aesthetic, no dark mode toggle, no advanced mode toggle
3. **Limited node palette** — core agent types only; every node must beg for its existence (exact roster: see Open Question #3)
4. **Visual node wiring** — drag, connect, orchestrate; zero JSON/YAML exposure in-app
5. **Live demo state on landing** — no empty state, no tooltip tour, no onboarding wizard; they land in a running orchestra and touch a node to disrupt it

### Execution & Performance
6. **Defined execution model** — DAG or state machine with durable state and idempotency defined in code before UI pixels ship
7. **Parallel execution** — independent agent nodes run concurrently, not serial chains
8. **Aggressive caching** — deterministic inputs hit cache instantly; identical prompts don't re-call the LLM
9. **Sub-3-second target** — for cached or parallel paths; a workflow under three seconds feels like magic

### Guardrails & Economics
10. **Per-user token budgets** — hard limits, daily caps, prepaid credits to prevent runaway API spend
11. **Request deduplication** — don't pay twice for the same work

### Explicitly NOT in v1
- Freemium billing / Stripe integration
- Dark mode or advanced mode toggles
- JSON/YAML editing mode in the UI
- WordPress plugin
- Workers AI or edge execution runtime
- PowerPoint export, CSV templates, or ancillary export features
- Real-time collaboration
- Versioned workflows
- Plugin ecosystem / template marketplace
- More than a handful of node types
- Undo stack beyond simple restore
- Collision physics or Figma-grade canvas engineering
- Admin dashboard with 40 toggles

---

## File Structure (What Gets Built)

```
forge/
├── app/                          # Web application (single platform)
│   ├── canvas/                   # Visual canvas engine — white, infinite, minimal
│   │   ├── renderer/             # Node rendering + edge drawing
│   │   ├── interactions/         # Drag, snap, connect, select
│   │   └── demo-state/           # Live orchestra on landing page
│   ├── nodes/                    # Core node components (limited palette)
│   ├── executor/                 # Workflow execution wrapper
│   ├── preview/                  # Live preview / demo-state runner
│   └── voice/                    # Brand copy — human, confident, zero acronyms
├── engine/                       # Workflow execution core
│   ├── dag/                      # DAG definition + dependency resolution
│   ├── state/                    # Durable state + idempotency keys
│   ├── parallelizer/             # Fork-join for independent nodes
│   └── validator/                # Pre-flight config validation
├── cache/                        # Aggressive deterministic cache layer
│   ├── key-builder/              # Hash inputs for cache keys
│   └── store/                    # TTL + eviction for deterministic outputs
├── budgets/                      # Token budgets & request deduplication
│   ├── per-user-caps/            # Hard spend limits, daily quotas
│   └── dedup/                    # Request fingerprinting to avoid double-billing
└── api/                          # Developer-facing API (JSON for those who want it)
    └── v1/                       # REST surface — ships only if cheap (see Open Question #4)
```

**Principle:** Every directory must justify its existence to the core feeling. If it doesn't serve the 30-second wow, it gets cut.

---

## Open Questions (Needs Resolution Before Build)

| # | Question | Stakes | Suggested Owner |
|---|----------|--------|-----------------|
| 1 | **Distribution channel** | Elon Round 1: ProductHunt + LinkedIn is a press release, not a distribution strategy. To reach 10K users without paid ads, need (a) viral loop, (b) marketplace network effect, or (c) SEO/content flywheel. Steve is silent on distribution. Without a locked funnel, we build a cathedral in the desert. | Product / GTM lead |
| 2 | **Live demo state mechanics** | Steve demands "no login wall" and a running orchestra on landing. Elon asks: who pays for inference when an anonymous user presses play? Is it simulated? Rate-limited? IP-throttled? Steve never answers the economics. | Elon (security + economics) |
| 3 | **Exact node type roster** | "Two agents, one connection, one play button" is the scope boundary, but what are those two agents? What are their inputs, outputs, and config surfaces? We need the exact limited palette before the first file is written. | Steve (product taste) + Elon (feasibility) |
| 4 | **Developer API scope** | Steve says "Build the engine in JSON underneath" and implies developers can use the API for JSON. Does the REST/JSON API ship in v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. Shipping a broken API is worse than shipping no API. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack (Pages + D1 + R2). Elon killed Workers AI. Do we still build on Cloudflare, or does the execution model dictate the host? | Elon (architecture) |
| 6 | **Auth model post-demo** | If the first 30 seconds need no login, when does auth appear? How do we preserve canvas state for a returning user without forcing account creation before the magic? | Elon + Steve (UX + security) |
| 7 | **Trial mechanics without Stripe** | If freemium is cut and Stripe is v2, how does the "generous taste" trial work? Prepaid credits? Manual invoicing? Honor system? Hard caps prevent bankruptcy, but we need a mechanism. | Elon (economics) + Steve (experience) |
| 8 | **Execution runtime substrate** | Does the engine submit to an existing daemon/pipeline (zero new runtime), or do we build a lightweight new executor? The debates assume existing infrastructure but never explicitly lock the integration shape. | Elon (architecture) |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Canvas engineering swallows the sprint** | High | Critical | Cap canvas scope to 2–3 node types + basic wiring. No collision physics, no undo stack beyond simple restore, no accessibility over-engineering. Ship a beautiful sketch, not a Figma clone. |
| **API unit economics implode at 100 users** | Medium | Critical | Token budgets + deduplication ship day one. Monitor cost per workflow. If a single DAU costs >$1/day, pause and redesign the agent chain before adding users. |
| **No locked distribution = no users** | High | Critical | Resolve Open Question #1 before build completes. If no credible embed/partnership and no alternative, v1 is a portfolio piece, not a product. |
| **Anonymous demo state = API abuse / cost bleed** | Medium | High | Gate demo execution behind invisible rate limits, IP throttling, or lightweight fingerprinting. If mitigation adds friction, Steve vetoes. Find the Zen path. |
| **Execution model undefined until too late** | Medium | Critical | Spike DAG/state-machine definition in Week 1. Steve conceded idempotency and durable state must precede pixels. Do not let canvas rendering outrun execution semantics. |
| **No monetization = unsustainable burn** | Medium | Medium | Track API spend religiously. Set a kill switch: if burn exceeds $X/week with no conversion signal, halt and ship billing as v1.1, not v2. |
| **One aesthetic alienates power users** | Low | Low | Accept. Steve's call. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| **Scope creep resurrects JSON editor or advanced mode** | Medium | Medium | Phil's rule: any feature that reopens a locked decision requires both Elon and Steve to agree. Neither has veto override. |
| **Love-mover advantage doesn't convert to revenue** | Medium | High | The trial must feel magical, but hard caps prevent bankruptcy. If users love it but don't pay, we have a museum piece. Resolve trial mechanics (Open Question #7) before launch. |
| **Steve's "living workflow" assumes infrastructure that doesn't exist** | Medium | High | Steve conceded production is "3 engineers, 6 months, minimum." One session proves the soul of the interaction; it does not ship production orchestration. Do not promise demo-state magic on unproven engine bones. |

---

## The Zen Master's Note

Elon owns the pipeline. Steve owns the spark. Both are right where they agree: ship core or ship nothing. The rest is noise.

The blueprint is drawn. Build it like a hammer striking anvil — once, clean, and ringing.
