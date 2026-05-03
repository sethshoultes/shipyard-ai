# Forge — Locked Decisions
*Phil Jackson, Zen Master. The court is set. These are the plays we run.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Forge** | Steve (Round 1: "AgentForge is two words. That's one too many. The name is Forge. Period.") | Steve; Elon conceded Round 2 | One syllable. Solid. Memorable. No compound, no category marker, no committee residue. |
| 2 | **Brand voice: human, confident, zero acronyms, no enterprise sludge** | Steve (Round 1: "We speak like we're sitting across from you at a cafe, not like we're filling out an RFP.") | Steve; Elon conceded Round 2 | Warmth is a feature. Humanity is the moat. If it sounds like a Salesforce whitepaper, burn it. |
| 3 | **Engine before baton — execution model defined before pixels** | Elon (Round 1: "You cannot build a visual editor for an undefined data structure." Round 2: "State machine defined in code before a single pixel is placed.") | Elon; Steve conceded Round 2 | Steve: "He's right that 'workflow' is undefined under the hood. We need durable state, and idempotency before the first pixel ships." You cannot animate what you have not built. |
| 4 | **No drag-and-drop canvas for v1; config UI first** | Elon (Round 1: "Ship a config UI, not Figma. Canvas is a v2 feature masquerading as v1." Round 2: "No canvas for v1. Config forms and a JSON editor. Canvas is a roadmap item, not a launch item.") | Elon | Steve defended canvas as core interaction (Round 2: "The canvas ships in v1. Not as a feature. As the core interaction model."). But Elon's compound-interest argument holds: a JSON config UI ships in 48 hours; a canvas ships in 6 weeks or never. The engine is the product; the UI is documentation. Essence commands "Engine first. Baton later." |
| 5 | **One platform only: web app** | Elon (Round 1: "Pick ONE. Dual-platform splits focus and doubles QA.") + Steve (Round 1: "NO to the WordPress plugin.") | Unanimous | A standalone web app with no traffic source is dangerous, but bifurcation is mediocrity. WordPress is a wrapper, not a launchpad. |
| 6 | **No Workers AI / edge execution in v1** | Elon (Round 1: "'Workers AI for edge execution' is hand-waving. Edge functions are ephemeral and stateless, but multi-agent workflows need durable state, retries, and observability.") | Elon; unanimous | Edge doesn't fix 10-second LLM calls. Agents call APIs directly. |
| 7 | **Async by default with parallelized independent nodes** | Elon (Round 1: "The 10x path is async by default... parallelizing independent agent calls.") | Elon; Steve conceded on throughput | A 5-step synchronous workflow at 3s per call is 15s minimum. Users want reliable, not instant — but parallel paths cut the wait that kills belief. |
| 8 | **Aggressive prompt caching + request deduplication** | Elon (Round 1: "aggressive prompt caching") | Elon; unanimous | Deterministic inputs should hit cache instantly. Don't pay twice for the same work. |
| 9 | **Hard token budgets + per-user cost caps day one** | Elon (Round 1: "per-user cost caps. One user running workflows on a cron could cost $500/month.") | Elon; Steve conceded | Steve Round 2: "Elon was right: we cap the spend before we uncap the wonder." COGS kills startups faster than churn. |
| 10 | **No freemium billing stack in v1** | Elon (Round 1: "Start usage-based or paid-only." Round 2: "No freemium with uncapped LLM costs.") | Elon; synthesis with Steve | Steve wants a free tier ("We monetize limits and power users, not access"). The Zen path: no Stripe, metered billing, or subscription complexity in v1. A limited capped trial may exist, but the full monetization stack is v2. Hard caps prevent bankruptcy regardless of pricing model. |
| 11 | **No template marketplace in v1** | Elon (Round 1: "Templates don't create themselves; that's v2 labor.") | Elon; Steve aligned implicitly | Templates are a crutch for a broken core loop. Earn them by watching what users actually build. |
| 12 | **No dark mode; one aesthetic: white, airy, optimistic** | Steve (Round 1: "NO to dark mode as default — light, airy, optimistic." "One aesthetic.") | Steve; uncontested | The app is a baton, not a toolbox. Power users who need dark mode can use the API. |
| 13 | **No admin dashboard with 40 toggles** | Steve (Round 1: "NO to admin dashboards with 40 toggles.") + Elon (Round 2 agreement implied) | Unanimous | "If you need forty toggles, you haven't decided what the product is." One knob when possible, zero when not. |
| 14 | **No JSON/YAML exposed in the app UI** | Steve (Round 1: "NO to exposed JSON, logs, or 'API configuration' screens in the first hour." Essence: "No JSON.") | Steve on UX; Elon on engine | Elon wanted a JSON schema editor as the primary v1 UI. Rejected. Synthesis: the engine runs on structured config internally; humans never touch it. Developers who want JSON use the API (see Open Question #4). |
| 15 | **Workflow versioning mandatory** | Elon (Round 1: "Workflow versioning is mandatory — users will edit live workflows and break in-flight runs.") | Elon; Steve conceded | Users will edit a live run and blame us when it breaks. Version before the first public workflow. |
| 16 | **Distribution must be locked before launch** | Elon (Round 1: "ProductHunt gives a spike, not 10,000 retained users. You need a viral loop or an existing traffic source." Round 2: "ProductHunt is a spike, not a strategy.") | Elon; Steve silent | Without a locked viral loop, embed strategy, or traffic source, v1 is a portfolio piece in the desert. Steve builds the spark; someone must build the funnel. |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Forge web app** — single-platform, no WordPress bifurcation
2. **Clean config UI** — form-based node configuration, not a canvas; serializes to JSON trivially; diffs cleanly in git
3. **Limited node palette** — core agent types only; every node must beg for its existence (exact roster: see Open Question #3)
4. **Zero JSON/YAML exposure in-app** — humans configure through forms; the machine speaks JSON underneath
5. **White, airy interface** — one aesthetic, no dark mode toggle, no advanced mode toggle

### Execution & Performance
6. **Defined execution model** — DAG or state machine with durable state, idempotency keys, and retry logic defined in code before UI ships
7. **Async by default** — workflows run via job queue, not synchronous blocking calls
8. **Parallel execution** — independent agent nodes run concurrently, not serial chains
9. **Aggressive caching** — deterministic inputs hit cache instantly; identical prompts don't re-call the LLM
10. **Sub-3-second target** — for cached or parallel paths; wall-clock latency matters in the magic window

### Guardrails & Economics
11. **Per-user token budgets** — hard limits, daily caps, prepaid credits to prevent runaway API spend
12. **Request deduplication** — don't pay twice for the same work
13. **Workflow versioning** — in-flight runs are pinned to the version that started them

### Explicitly NOT in v1
- Drag-and-drop canvas (v2 cathedral; v1 is the foundation)
- Freemium billing / Stripe integration
- Dark mode or advanced mode toggles
- JSON/YAML editing mode in the UI
- WordPress plugin
- Workers AI or edge execution runtime
- PowerPoint export, CSV templates, or ancillary export features
- Real-time collaboration
- Plugin ecosystem / template marketplace
- More than a handful of node types
- Undo stack beyond simple restore
- Collision physics or Figma-grade canvas engineering
- Admin dashboard with 40 toggles
- Onboarding modals, tooltips, or tutorial videos

---

## File Structure (What Gets Built)

```
forge/
├── app/                          # Web application (single platform)
│   ├── config-ui/                # Form-based node editor — clean, minimal, human
│   │   ├── node-forms/             # Input surfaces per node type
│   │   ├── workflow-list/          # Saved workflows + version history
│   │   └── run-preview/            # Output viewer, not a canvas
│   ├── nodes/                    # Core node component definitions (limited palette)
│   ├── executor/                 # Workflow execution wrapper (UI-facing)
│   └── voice/                    # Brand copy — human, confident, zero acronyms
├── engine/                       # Workflow execution core
│   ├── dag/                      # DAG definition + dependency resolution
│   ├── state/                    # Durable state + idempotency keys + retry logic
│   ├── parallelizer/             # Fork-join for independent nodes
│   └── validator/                # Pre-flight config validation
├── cache/                        # Aggressive deterministic cache layer
│   ├── key-builder/              # Hash inputs for cache keys
│   └── store/                    # TTL + eviction for deterministic outputs
├── budgets/                      # Token budgets & request deduplication
│   ├── per-user-caps/            # Hard spend limits, daily quotas
│   └── dedup/                    # Request fingerprinting to avoid double-billing
├── queue/                        # Async job runner
│   ├── dispatcher/               # Enqueue / dequeue workflows
│   └── workers/                  # Agent call handlers
└── api/                          # Developer-facing API (JSON for those who want it)
    └── v1/                       # REST surface — ships only if cheap (see Open Question #4)
```

**Principle:** Every directory must justify its existence to the core feeling. If it doesn't serve the first workflow running end-to-end, it gets cut.

---

## Open Questions (Needs Resolution Before Build)

| # | Question | Stakes | Suggested Owner |
|---|----------|--------|-----------------|
| 1 | **Exact node type roster** | "Two agents, one connection, one play button" is the scope boundary, but what are those two agents? What are their inputs, outputs, and config surfaces? We need the exact limited palette before the first file is written. | Steve (product taste) + Elon (feasibility) |
| 2 | **Distribution channel** | ProductHunt + LinkedIn is a press release, not a distribution strategy. To reach 10K users without paid ads, need (a) viral loop, (b) marketplace network effect, or (c) SEO/content flywheel. Without a locked funnel, we build a cathedral in the desert. | Product / GTM lead |
| 3 | **Trial mechanics without Stripe** | If freemium is cut and Stripe is v2, how does the "generous taste" trial work? Prepaid credits? Manual invoicing? Honor system? Hard caps prevent bankruptcy, but we need a mechanism. | Elon (economics) + Steve (experience) |
| 4 | **Developer API scope** | Steve implies developers can use a JSON API. Does the REST/JSON API ship in v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. Shipping a broken API is worse than shipping no API. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack (Pages + D1 + R2). Elon killed Workers AI. Do we still build on Cloudflare, or does the execution model dictate the host? | Elon (architecture) |
| 6 | **Auth model** | When does auth appear? How do we preserve workflow state for a returning user without forcing account creation before the first run? | Elon + Steve (UX + security) |
| 7 | **Execution runtime substrate** | Does the engine submit to an existing daemon/pipeline (zero new runtime), or do we build a lightweight new executor? The debates assume existing infrastructure but never explicitly lock the integration shape. | Elon (architecture) |
| 8 | **First-run experience without canvas** | Steve's vision demands immediate delight and belief. Elon's config UI is a spreadsheet. How do we make the first 30 seconds feel like magic when the interface is forms and a Run button? | Steve (design) + Elon (constraints) |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Config UI fails emotional conversion** | High | Critical | The first workflow must run in under 60 seconds and produce a visible, shareable result. If form-based configuration feels like a tax return, the product dies. Steve must own the interaction design layer; Elon owns what happens after the button is pressed. |
| **API unit economics implode at 100 users** | Medium | Critical | Token budgets + deduplication ship day one. Monitor cost per workflow. If a single DAU costs >$1/day, pause and redesign the agent chain before adding users. |
| **No locked distribution = no users** | High | Critical | Resolve Open Question #2 before build completes. If no credible embed/partnership and no alternative, v1 is a portfolio piece, not a product. |
| **Execution model undefined until too late** | Medium | Critical | Spike DAG/state-machine definition in Week 1. Steve conceded idempotency and durable state must precede pixels. Do not let UI rendering outrun execution semantics. |
| **Scope creep resurrects canvas or JSON editor** | Medium | Medium | Phil's rule: any feature that reopens a locked decision requires both Elon and Steve to agree. Neither has veto override. |
| **One agent session cannot ship production-grade engine** | High | Critical | Elon Round 1: "One session can build a WordPress shortcode that ingests a JSON config and runs it via wp_cron or a serverless proxy. That is the MVP." Scope the build to what one session can realistically ship: a working config UI, a defined DAG runner, and one end-to-end workflow. Production hardening is v1.1. |
| **No monetization = unsustainable burn** | Medium | Medium | Track API spend religiously. Set a kill switch: if burn exceeds $X/week with no conversion signal, halt and ship billing as v1.1, not v2. |
| **Love-mover advantage doesn't convert to revenue** | Medium | High | The trial must feel magical, but hard caps prevent bankruptcy. If users love it but don't pay, we have a museum piece. Resolve trial mechanics (Open Question #3) before launch. |
| **Long agent chains die on timeout** | Medium | High | Shared hosting has 30s max_execution_time; even serverless has limits. Async job queue is mandatory. Synchronous real-time workflows are a trap. |
| **Steve's "living first-run" assumes infrastructure that doesn't exist** | Medium | High | Steve's 30-second magic requires a running engine underneath. Do not promise demo-state magic on unproven engine bones. The first workflow is the demo. |

---

## The Zen Master's Note

Elon owns the foundation. Steve owns the soul.

Elon says: ship the engine, or you ship a mirage.
Steve says: ship the feeling, or you ship a tool.

Both are right where they agree: if the DAG doesn't run, the brand is a lie. If the user doesn't feel power in the first minute, the engine is invisible.

The blueprint is drawn. Build it like a hammer striking anvil — once, clean, and ringing.

*No canvas. No forty nodes. One syllable. One light.*
