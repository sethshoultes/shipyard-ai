# Forge — Locked Decisions
*Phil Jackson, Zen Master. The orchestra is tuned. These are the notes we play.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Forge** | Steve | Steve | Elon conceded Round 2: "He's right about the name." One word. Four letters. No "Agent." |
| 2 | **Visual canvas ships in v1** | Steve | Steve | Essence locks it: "Visual canvas. Not decoration. Comprehension." JSON editor v1 dies. Elon's risk acknowledged: canvas engineering is real, but the canvas *is* the product feeling. |
| 3 | **Zero new runtime — submit to existing daemon** | Elon | Elon | Essence locks it. Steve ceded pipeline ownership. The existing dispatch, retry, and secret management run the show. |
| 4 | **Parallelize independent nodes + aggressive caching** | Elon | Elon | Steve conceded Round 2: "Latency is the enemy of delight." Target: <3 seconds. Workers AI edge execution is dead — it doesn't run Claude. |
| 5 | **Token budgets + request deduplication day one** | Elon | Elon | Steve conceded Round 2: "The feeling of power must be sustainable." Anthropic API cost is the existential risk, not Cloudflare load. |
| 6 | **Cut freemium billing in v1** | Elon | Both | Unanimous. Stripe, subscription state, dunning, and quota enforcement burn 30% of tokens for zero core value. Ship love first; monetize when they pound the table. |
| 7 | **One aesthetic. White canvas. No dark mode. No advanced mode.** | Steve | Steve | Essence locks it: "One sun." Elon didn't contest taste; he contested timeline. Timeline is resolved: v1 ships one look, one mode. |
| 8 | **No forty-seven node types. Minimal core set only.** | Steve | Steve | Essence locks it. Every node must beg for its existence. PowerPoint export, CSV templates, and committee features die in the courtyard. |
| 9 | **Brand voice: human, confident, no acronyms, no explaining** | Steve | Steve | Elon agreed Round 2. If it needs a manual, it's broken. We sell the feeling of unfair advantage, not "AI-powered workflow orchestration." |
| 10 | **Cut Workers AI / no edge execution fiction** | Elon | Elon | Uncontested. Agents call the Claude API. Don't confuse the stack or set false latency expectations. |
| 11 | **Web app first. No WordPress plugin variant in v1.** | Elon | Elon | Essence direction: "Bare canvas. Immediate sound." Steve didn't defend the plugin path. If the web app works, wrap it later. Not on day one. |
| 12 | **No JSON editor in the app. Visual only.** | Steve | Steve | Essence: "JSON editor v1. Ship feeling first." Developers who want JSON use the API. The app is a conductor's baton, not a config file. |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Forge web app** — single-platform, no plugin bifurcation
2. **White infinite canvas** — one aesthetic, no dark mode, no advanced mode toggle
3. **Limited node palette** — core agent types only; no feature creep
4. **Visual node wiring** — drag, connect, orchestrate; zero JSON exposure in-app
5. **Live demo state on landing** — no empty state, no tooltip tour, no onboarding wizard; they land in a running orchestra and touch a node

### Execution & Performance
6. **Existing daemon integration** — submit jobs to current pipeline; zero new runtime, zero new auth system
7. **Parallel execution** — independent agent nodes run concurrently, not serial
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
| 1 | **Distribution channel** | Elon wants existing Emdash plugin ecosystem embed. Steve says that's selling bicycles at a bus station. Essence is silent. Without a locked funnel, we build a cathedral in the desert. | Product / GTM lead |
| 2 | **Live demo state mechanics** | Steve demands "no login wall" and a running orchestra on landing. How do we execute real agent workflows anonymously without burning the API budget or opening abuse vectors? Is it simulated? Is it rate-limited? | Elon (security + economics) |
| 3 | **Exact node type roster** | "Not forty-seven" is clear. "How many" is not. We need the exact limited palette before the first file is written. | Steve (product taste) |
| 4 | **Developer API scope** | Steve says "let them use the API" for JSON. Does the API ship v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack. Elon killed Workers AI. Do we still build on Cloudflare (Pages + D1 + R2) or another host? | Elon (architecture) |
| 6 | **Auth model post-demo** | If the first 30 seconds need no login, when does auth appear? How do we preserve state for a returning user? | Elon + Steve (UX + security) |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Canvas engineering swallows the sprint** | High | Critical | Cap canvas scope to 2–3 node types + wiring. No collision physics, no undo stack beyond basic restore, no accessibility over-engineering. Ship a beautiful sketch, not a Figma clone. |
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
