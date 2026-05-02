# Forge — Locked Decisions
*Phil Jackson, Zen Master. The orchestra is tuned. These are the notes we play.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Forge** | Steve (principle: one-word human name; candidate "Relay"). Elon conceded naming taste Round 2. | Steve's direction; word distilled by Essence | Elon Round 2: "AgentForge is infrastructure sludge." Steve's "Relay" proved the principle. Essence locks **Forge**: four letters, one syllable, no "Agent." You don't build a cathedral and hang a utility bill on the door. |
| 2 | **Visual canvas ships in v1 (scoped)** | Steve (canvas as proof); Elon (scope guardrails) | Steve, bound by Elon's constraints | Steve: "The canvas makes the invisible visible." Elon: "Scope to two agents, one connection, one play button." Essence locks it: "Visual canvas. Not decoration. Comprehension." JSON editor v1 dies. |
| 3 | **No JSON editor in the app** | Steve (UX layer); Elon (runtime layer) | Synthesis / Both | Elon demanded config-as-code under the hood for validation, diffing, and sanity. Steve demanded zero JSON exposure to humans. Essence: "JSON editor v1 dies. Ship feeling first." Developers who want JSON use the API. The app is a conductor's baton, not a config file. |
| 4 | **Submit to existing daemon — zero new runtime** | Elon | Elon (unanimous) | One auth model, one hosting surface, one security perimeter. Complexity there is a tax you pay forever with every deploy, every incident, every support ticket. Steve ceded pipeline ownership in Essence: "Existing daemon. Zero new runtime." |
| 5 | **Parallelize independent nodes + aggressive caching** | Elon | Elon (unanimous) | Steve conceded Round 2: "LLM latency is the enemy of delight." A 10-agent synchronous chain at 2s per call is 20s wall-clock; users bounce. Parallel DAGs, async queues, and deterministic output caching are survival, not luxury. Target: <3 seconds. |
| 6 | **Token budgets + request deduplication day one** | Elon | Elon (unanimous) | Steve conceded Round 2: "Budget tokens like a hawk." A multi-agent workflow costs $0.10–$2.00 per run in LLM tokens. 100 users × 10 workflows/day × $0.50 = $15K/mo. COGS kills startups faster than churn. The feeling of power must be sustainable. |
| 7 | **Cut freemium billing in v1** | Elon ("Free until 1,000 MAU"); Steve ("Free until it hurts") | Both / Unanimous | Stripe, subscription state, dunning, and quota enforcement burn 30% of engineering tokens for zero core value. No "Pro" badges on day one. Ship love first; monetize when they pound the table. |
| 8 | **One aesthetic. White canvas. No dark mode. No advanced mode.** | Steve | Steve (unanimous) | Essence locks it: "One sun." Elon didn't contest taste; he contested timeline. Timeline is resolved: v1 ships one look, one mode. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| 9 | **Minimal core node palette — no forty-seven node types** | Steve | Steve, with Elon's functional caveat | Essence: "No forty-seven nodes." Steve: "Every node must beg for its existence." Elon agreed that saying no to feature cancer is correct, though he warned that killing spreadsheet-looking templates purely for aesthetics is taste overriding function. PowerPoint export, CSV templates, and committee features die in the courtyard. |
| 10 | **Brand voice: human, confident, zero acronyms, no explaining** | Steve | Steve (unanimous) | Elon conceded Round 2: "The voice. No acronyms, no 'AI-powered orchestration,' no explaining. Declare, don't justify." If a sentence could appear on a spec sheet from 2003, it dies. We sell the feeling of unfair advantage. |
| 11 | **Web app only. No WordPress plugin in v1** | Elon ("WordPress is a tar pit") | Elon (unanimous) | Steve Round 2: "The WordPress plugin is a tar pit. Web app first, transcendent, then we port." Splitting focus between auth models and hosting surfaces is how mediocrity ships. Wrap it later. Not on day one. |
| 12 | **No Workers AI / edge execution fiction** | Elon | Elon (unanimous, uncontested) | "Workers AI for edge execution" is hand-waving — edge doesn't fix 10-second LLM calls. Agents call the Claude API directly. Don't confuse the stack or set false latency expectations. |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Forge web app** — single-platform, no plugin bifurcation
2. **White infinite canvas** — one aesthetic, no dark mode toggle, no advanced mode toggle
3. **Limited node palette** — core agent types only; every node must beg for its existence
4. **Visual node wiring** — drag, connect, orchestrate; zero JSON exposure in-app
5. **Live demo state on landing** — no empty state, no tooltip tour, no onboarding wizard; they land in a running orchestra and touch a node to disrupt it

### Execution & Performance
6. **Existing daemon integration** — submit jobs to current pipeline; zero new runtime, zero new auth system
7. **Parallel execution** — independent agent nodes run concurrently (DAG), not serial chains
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
- Plugin ecosystem
- More than a handful of node types

---

## File Structure (What Gets Built)

```
forge/
├── app/                          # Web application (single platform)
│   ├── canvas/                   # Visual canvas engine — white, infinite, minimal
│   ├── nodes/                    # Core node components (limited palette)
│   ├── executor/                 # Submit-to-daemon wrapper
│   ├── preview/                  # Live preview / demo-state runner
│   └── voice/                    # Brand copy — human, confident, zero acronyms
├── daemon-bridge/                # Thin adapter to existing pipeline
│   ├── schema/                   # JSON workflow config schema (runtime only)
│   ├── validator/                # Config validation before submit
│   └── submitter/                # Job submission to existing daemon
├── cache/                        # Aggressive deterministic cache layer
├── budgets/                      # Token budgets & request deduplication
└── api/                          # Developer-facing API (JSON for those who want it)
```

**Principle:** Every directory must justify its existence to the core feeling. If it doesn't serve the 30-second wow, it gets cut.

---

## Open Questions (Needs Resolution Before Build)

| # | Question | Stakes | Suggested Owner |
|---|----------|--------|-----------------|
| 1 | **Distribution channel** | Elon wants open-source execution engine + existing Emdash plugin ecosystem embed for distribution gravity. Steve says open-sourcing commoditizes the heart and that Emdash embed is selling bicycles at a bus station. Essence is silent. Without a locked funnel, we build a cathedral in the desert. | Product / GTM lead |
| 2 | **Live demo state mechanics** | Steve demands "no login wall" and a running orchestra on landing. Elon asks: who pays for the inference when an anonymous user presses play? How do we execute real agent workflows without burning API budget or opening abuse vectors? Is it simulated? Rate-limited? IP-throttled? | Elon (security + economics) |
| 3 | **Exact node type roster** | "Not forty-seven" is clear. "How many and which" is not. We need the exact limited palette before the first file is written. A canvas with one node is a toy; a canvas with twelve is a mess. | Steve (product taste) |
| 4 | **Developer API scope** | Steve says "let them use the API" for JSON. Does the REST/JSON API ship in v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. Shipping a broken API is worse than shipping no API. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack (Pages + D1 + R2). Elon killed Workers AI. Do we still build on Cloudflare, or does the existing daemon dictate the host? | Elon (architecture) |
| 6 | **Auth model post-demo** | If the first 30 seconds need no login, when does auth appear? How do we preserve canvas state for a returning user without forcing account creation before the magic? | Elon + Steve (UX + security) |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Canvas engineering swallows the sprint** | High | Critical | Cap canvas scope to 2–3 node types + basic wiring. No collision physics, no undo stack beyond simple restore, no accessibility over-engineering. Ship a beautiful sketch, not a Figma clone. |
| **API unit economics implode at 100 users** | Medium | Critical | Token budgets + deduplication ship day one. Monitor cost per workflow. If a single DAU costs >$1/day, we pause and redesign the agent chain before adding users. |
| **No locked distribution = no users** | High | Critical | Resolve Open Question #1 before build completes. If no Emdash embed and no credible alternative, v1 is a portfolio piece, not a product. |
| **Anonymous demo state = API abuse / cost bleed** | Medium | High | Gate demo execution behind invisible rate limits, IP throttling, or lightweight fingerprinting. If mitigation adds friction, Steve vetoes. Find the Zen path. |
| **Existing daemon can't parallelize cleanly** | Medium | High | Spike the daemon's concurrency model in Week 1. If serial execution is hard-coded, we need a refactor plan or a lightweight parallel executor *inside* the bridge — not a new runtime, a thin fork-join wrapper. |
| **No monetization = unsustainable burn** | Medium | Medium | Track API spend religiously. Set a kill switch: if burn exceeds $X/week with no conversion signal, we halt and ship billing as v1.1, not v2. |
| **One aesthetic alienates power users** | Low | Low | Accept. Steve's call. Power users who need dark mode can use the API. The app is a baton, not a toolbox. |
| **Scope creep resurrects JSON editor or advanced mode** | Medium | Medium | Phil's rule: any feature that reopens a locked decision requires both Elon and Steve to agree. Neither has veto override. |

---

## The Zen Master's Note

Elon owns the pipeline. Steve owns the spark. Both are right where they agree: ship core or ship nothing. The rest is noise.

The blueprint is drawn. Build it like a hammer striking anvil — once, clean, and ringing.
