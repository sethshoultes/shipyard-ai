# Forge — Locked Decisions
*Phil Jackson, Zen Master. The orchestra is tuned. These are the notes we play.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Forge** | Steve (Round 1: "One word. One syllable. Strong." Elon called it "Forge" in Round 2 rebuttal after killing "AgentForge"). | Steve, uncontested after Round 2 | Elon Round 2: "AgentForge is infrastructure sludge from 2008." Steve: "iPod wasn't 'MP3MusicPlayer.'" Essence locks it: four letters, one syllable, no "Agent." You don't build a cathedral and hang a utility bill on the door. |
| 2 | **Visual canvas ships in v1 (scoped)** | Steve (Round 1 & 2: canvas is the product, not decoration). Elon (Round 2: scope guardrails — 2 agents, 1 connection, 1 play button). | Steve, bound by Elon's hard scope limits | Steve: "The canvas makes the invisible visible. AI agents are terrifying to normal humans. The canvas makes them visible." Elon: "Canvas is v2 masquerading as v1... unless scoped to two agents, one connection, one play button." Essence locks it: visual canvas ships, but it is a beautiful sketch — not a Figma clone. JSON editor in the app dies. |
| 3 | **No JSON editor in the app UI** | Steve (Round 2: "zero JSON exposure to humans"). Elon (Round 1: config-as-code under the hood; Round 2: "state machine defined in code before a single pixel is placed"). | Synthesis / Both | The app is a conductor's baton, not a config file. Developers who want JSON use the API (see Open Question #4). The engine runs on structured config internally; humans never touch it. Essence: "JSON editor v1 dies. Ship feeling first." |
| 4 | **Submit to existing daemon — zero new runtime** | Elon (Round 1 & 2: "One auth model, one hosting surface, one security perimeter"). | Elon, unanimous | Steve ceded this in Essence: "Existing daemon. Zero new runtime." Building a new pipeline runtime is a tax paid forever with every deploy, every incident, every support ticket. Complexity there is fatal. |
| 5 | **Parallelize independent nodes + aggressive caching** | Elon (Round 1: "10x path is caching intermediate outputs and parallelizing independent agent calls"). | Elon, unanimous | Steve conceded Round 2: "LLM latency is the enemy of delight. Parallel execution and aggressive caching aren't luxuries; they're survival." A 10-agent synchronous chain at 2s per call is 20s wall-clock; users bounce. Target: <3 seconds for cached or parallel paths. |
| 6 | **Token budgets + request deduplication day one** | Elon (Round 1 & 2: "One cron job must not bankrupt us"). | Elon, unanimous | Steve conceded Round 2: "Budget tokens like a hawk. Per-user hard caps, daily limits, and prepaid credits ship alongside the trial." A multi-agent workflow costs $0.10–$2.00 per run. 100 users × 10 workflows/day × $0.50 = $15K/mo. COGS kills startups faster than churn. |
| 7 | **Cut freemium billing in v1** | Elon (Round 1: "Start usage-based or paid-only"). Steve (Round 1: "Give them the full instrument for 14 days, then ask for money"). | Both / Unanimous | Stripe, subscription state, dunning, and quota enforcement burn 30% of engineering tokens for zero core value. No "Pro" badges on day one. Ship love first; monetize when they pound the table. |
| 8 | **One aesthetic. White canvas. No dark mode. No advanced mode.** | Steve (Round 1: "NO to dark mode as a priority. Pick one perfect light palette and own it."). | Steve, uncontested | Essence locks it: "One sun." Elon didn't contest taste; he contested timeline. Timeline is resolved: v1 ships one look, one mode. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| 9 | **Minimal core node palette — no forty-seven node types** | Steve (Round 1 & 2: "Every node must beg for its existence or be fired"). | Steve, with Elon's functional caveat | Essence: "No forty-seven nodes." Elon agreed that saying no to feature cancer is correct, though he warned that killing spreadsheet-looking templates purely for aesthetics is taste overriding function. PowerPoint export, CSV templates, and committee features die in the courtyard. |
| 10 | **Brand voice: human, confident, zero acronyms, no explaining** | Steve (Round 1: "We speak like a master craftsperson standing beside you"). | Steve, uncontested | Elon conceded Round 2: "The voice. No acronyms, no 'AI-powered orchestration,' no explaining. Declare, don't justify." If a sentence could appear on a spec sheet from 2003, it dies. We sell the feeling of unfair advantage. |
| 11 | **Web app only. No WordPress plugin in v1** | Elon (Round 1: "Pick ONE. Dual-platform splits focus and doubles QA surface"). | Elon, unanimous | Steve Round 2: "The WordPress plugin is a tar pit. Web app first, transcendent, then we port." Splitting focus between auth models and hosting surfaces is how mediocrity ships. Wrap it later. Not on day one. |
| 12 | **No Workers AI / edge execution fiction** | Elon (Round 1: "Workers AI for edge execution is hand-waving"). | Elon, unanimous, uncontested | Edge functions are ephemeral and stateless; multi-agent workflows need durable state, retries, and observability. "Workers AI" doesn't fix 10-second LLM calls. Agents call the Claude API directly. Don't confuse the stack or set false latency expectations. |
| 13 | **No template marketplace in v1** | Elon (Round 1: "Templates don't create themselves; that's v2"). Steve (Round 1: "NO to template marketplaces on day one — crutches for broken UX"). | Both / Unanimous | Steve Round 2: "Template marketplaces on day one are founder theater — we earn templates by watching what users actually build." Templates are a crutch for a broken core loop. |
| 14 | **No admin dashboard with 40 toggles** | Steve (Round 1: "NO to admin dashboards with 40 toggles"). Elon (Round 2: "NO 40-toggle dashboards. Configuration is the enemy."). | Both / Unanimous | "If you need forty toggles, you haven't decided what the product is." One knob when possible, zero when not. |
| 15 | **DAG execution model, durable state, idempotency before pixels** | Elon (Round 2: "State machine defined in code before a single pixel is placed"). Steve conceded. | Elon, unanimous | Steve Round 2: "He's right that 'workflow' is undefined under the hood. We need a DAG execution model, durable state, and idempotency before the first pixel ships." You cannot build a visual editor for an undefined data structure. |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Forge web app** — single-platform, no plugin bifurcation
2. **White infinite canvas** — one aesthetic, no dark mode toggle, no advanced mode toggle
3. **Limited node palette** — core agent types only; every node must beg for its existence (exact roster: see Open Question #3)
4. **Visual node wiring** — drag, connect, orchestrate; zero JSON exposure in-app
5. **Live demo state on landing** — no empty state, no tooltip tour, no onboarding wizard; they land in a running orchestra and touch a node to disrupt it

### Execution & Performance
6. **Existing daemon integration** — submit jobs to current pipeline; zero new runtime, zero new auth system
7. **Parallel DAG execution** — independent agent nodes run concurrently, not serial chains
8. **Aggressive caching** — deterministic inputs hit cache instantly; identical prompts don't re-call Claude
9. **Sub-3-second target** — for cached or parallel paths; a workflow under three seconds feels like magic

### Guardrails & Economics
10. **Per-user token budgets** — hard limits to prevent runaway API spend
11. **Request deduplication** — don't pay twice for the same work

### Explicitly NOT in v1
- Freemium billing / Stripe integration
- Dark mode
- Advanced / Pro / JSON-editing mode in the UI
- WordPress plugin
- Workers AI edge execution
- PowerPoint export, CSV templates, or ancillary export features
- Real-time collaboration
- Versioned workflows
- Plugin ecosystem / template marketplace
- More than a handful of node types
- Undo stack beyond simple restore
- Collision physics or Figma-grade canvas engineering

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
│   ├── executor/                 # Submit-to-daemon wrapper
│   ├── preview/                  # Live preview / demo-state runner
│   └── voice/                    # Brand copy — human, confident, zero acronyms
├── daemon-bridge/                # Thin adapter to existing pipeline
│   ├── schema/                   # JSON workflow config schema (runtime only)
│   ├── validator/                # Config validation before submit
│   ├── dag-engine/               # Parallelization + dependency resolution
│   └── submitter/                # Job submission to existing daemon
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
| 1 | **Distribution channel** | Elon wants open-source execution engine + embed in existing ecosystems for distribution gravity. Steve says open-sourcing commoditizes the heart and that ecosystem embed is selling bicycles at a bus station. Essence is silent. Without a locked funnel, we build a cathedral in the desert. | Product / GTM lead |
| 2 | **Live demo state mechanics** | Steve demands "no login wall" and a running orchestra on landing. Elon asks: who pays for the inference when an anonymous user presses play? How do we execute real agent workflows without burning API budget or opening abuse vectors? Is it simulated? Rate-limited? IP-throttled? | Elon (security + economics) |
| 3 | **Exact node type roster** | "Not forty-seven" is clear. "How many and which" is not. We need the exact limited palette before the first file is written. A canvas with one node is a toy; a canvas with twelve is a mess. | Steve (product taste) |
| 4 | **Developer API scope** | Steve says "let them use the API" for JSON. Does the REST/JSON API ship in v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. Shipping a broken API is worse than shipping no API. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack (Pages + D1 + R2). Elon killed Workers AI. Do we still build on Cloudflare, or does the existing daemon dictate the host? | Elon (architecture) |
| 6 | **Auth model post-demo** | If the first 30 seconds need no login, when does auth appear? How do we preserve canvas state for a returning user without forcing account creation before the magic? | Elon + Steve (UX + security) |
| 7 | **Trial mechanics without Stripe** | If freemium is cut and Stripe is v2, how does the 14-day trial work? Prepaid credits? Manual invoicing? Honor system? | Elon (economics) + Steve (experience) |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Canvas engineering swallows the sprint** | High | Critical | Cap canvas scope to 2–3 node types + basic wiring. No collision physics, no undo stack beyond simple restore, no accessibility over-engineering. Ship a beautiful sketch, not a Figma clone. |
| **API unit economics implode at 100 users** | Medium | Critical | Token budgets + deduplication ship day one. Monitor cost per workflow. If a single DAU costs >$1/day, we pause and redesign the agent chain before adding users. |
| **No locked distribution = no users** | High | Critical | Resolve Open Question #1 before build completes. If no credible embed/partnership and no alternative, v1 is a portfolio piece, not a product. |
| **Anonymous demo state = API abuse / cost bleed** | Medium | High | Gate demo execution behind invisible rate limits, IP throttling, or lightweight fingerprinting. If mitigation adds friction, Steve vetoes. Find the Zen path. |
| **Existing daemon can't parallelize cleanly** | Medium | High | Spike the daemon's concurrency model in Week 1. If serial execution is hard-coded, we need a refactor plan or a lightweight parallel executor *inside* the bridge — not a new runtime, a thin fork-join wrapper. |
| **No monetization = unsustainable burn** | Medium | Medium | Track API spend religiously. Set a kill switch: if burn exceeds $X/week with no conversion signal, we halt and ship billing as v1.1, not v2. |
| **One aesthetic alienates power users** | Low | Low | Accept. Steve's call. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| **Scope creep resurrects JSON editor or advanced mode** | Medium | Medium | Phil's rule: any feature that reopens a locked decision requires both Elon and Steve to agree. Neither has veto override. |
| **Love-mover advantage doesn't convert to revenue** | Medium | High | The 14-day trial must feel magical, but hard caps prevent bankruptcy. If users love it but don't pay, we have a museum piece. Resolve trial mechanics (Open Question #7) before launch. |

---

## The Zen Master's Note

Elon owns the pipeline. Steve owns the spark. Both are right where they agree: ship core or ship nothing. The rest is noise.

The blueprint is drawn. Build it like a hammer striking anvil — once, clean, and ringing.
