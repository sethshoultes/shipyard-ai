# Relay — Locked Decisions
*Phil Jackson, Zen Master. Two rounds on the clock. The court is set. These are the plays we run.*

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Name: Relay** | Steve (Round 1: "AgentForge is dead... Relay. Short. Punchy.") | **Steve**; Elon conceded Round 2 | Elon: "Call it Relay, call it anything — naming is cheap and reversible, so I'm not going to die on that hill." Steve fought for it as soul, not label. Essence anchors on the feeling; Relay is the two-syllable promise that carries it. |
| 2 | **Brand voice: human, confident, warm, zero acronyms, no enterprise sludge** | Steve (Round 1: "We do not say 'seamless integration of autonomous agentic orchestration.' We say: 'Your team just grew by ten people.'") | **Steve**; Elon conceded Round 2 | Elon agreed: "Steve is right that our copy should sound human. Taste in language and first impression is real leverage." Warmth is a feature. Humanity is the moat. |
| 3 | **Engine before baton — execution semantics defined before any UI pixels** | Elon (Round 1: "The hard 90% is the orchestration engine." Round 2: "Beauty on top of a broken engine is a coffin with nice varnish.") | **Elon**; Steve conceded Round 2 | Steve: "He's right that 'workflow' is undefined under the hood. We need durable state and idempotency before the first pixel ships. I'll take your engine if you let me wrap it in something human." Essence commands: "Engine first. Baton later." |
| 4 | **No drag-and-drop canvas for v1; form-based config UI with node visualization** | Elon (Round 1: "Ship a config UI, not Figma. Canvas is a v2 feature masquerading as v1." Round 2: "JSON config UI ships in 48 hours; a canvas ships in 6 weeks or never.") | **Elon** | Steve defended canvas as core interaction (Round 2: "Users touch nodes, not schemas."). Rejected: a full canvas is a v2 cathedral. Synthesis: the UI shows agents as human-readable nodes/cards with clean form surfaces — no blank canvas, no drag-and-drop physics, no Figma-grade engineering. Config forms serialize to JSON trivially under the hood. Essence: "No canvas v1." |
| 5 | **No user-facing JSON / YAML / raw schema editing in the app** | Steve (Round 1: "NO to exposed JSON, logs, or 'API configuration' screens in the first hour." Round 2: "No user-facing JSON / YAML / config panels in v1.") | **Steve on UX; Elon on engine** | Elon wanted a JSON schema editor as the primary v1 UI. Overruled. The engine runs on structured config internally; humans never touch it. Developers who want JSON use the API (see Open Question #4). |
| 6 | **Platform: SaaS web app v1; WordPress plugin is a v2 channel** | Steve (Round 2: "We pick SaaS, because that's the only format where the experience is ours to control.") | **Steve**; Phil tiebreak | Elon advocated WordPress plugin as v1 distribution wedge (Round 1 + Round 2). Steve countered: "Anchor as a plugin and you die as a feature." The first 30 seconds of living agents requires an experience we control end-to-end. WordPress is a distribution channel, not an identity. Distribution risk is acute and unresolved (Open Question #2). |
| 7 | **No Workers AI / edge execution runtime in v1** | Elon (Round 1: "'Workers AI for edge execution' is hand-waving. Edge functions are ephemeral and stateless, but multi-agent workflows need durable state.") | **Elon**; unanimous | Edge doesn't fix 10-second LLM calls. Agents call APIs directly. The execution engine lives where state and retries can durably reside. |
| 8 | **Async by default with parallelized independent nodes** | Elon (Round 1: "The 10x path is async by default... parallelizing independent agent calls.") | **Elon**; Steve conceded | A 5-step synchronous workflow at 3s per call is 15s minimum. Users want reliable, not instant — but parallel paths cut the wait that kills belief. Every second a request stays open is a dollar burned and a user lost. |
| 9 | **Aggressive prompt caching + request deduplication** | Elon (Round 1: "aggressive prompt caching") | **Elon**; unanimous | Deterministic inputs should hit cache instantly. Don't pay twice for the same work. |
| 10 | **Hard token budgets + per-user cost caps day one** | Elon (Round 1: "per-user cost caps. One user running workflows on a cron could cost $500/month.") | **Elon**; Steve conceded | Steve Round 2: "Elon was right: we cap the spend before we uncap the wonder." Essence: "Hard cost caps. No bankruptcy." COGS kills startups faster than churn. |
| 11 | **One free workflow; no Stripe / metered billing stack in v1** | Synthesis of Essence ("One free workflow.") + Elon (paid-only urgency) + Steve (free tier for learning) | **Phil's tiebreak** | Steve wants a free tier ("We monetize limits and power users, not access"). Elon wants paid-only from day one ($29/month). The Zen path: one capped trial workflow, no Stripe, no metered billing complexity in v1. Hard caps prevent bankruptcy regardless of trial generosity. Trial mechanics remain an open question (Open Question #3). |
| 12 | **No template marketplace in v1** | Elon (Round 1: "Templates don't create themselves; that's v2 labor.") | **Elon**; Steve aligned implicitly | Templates are a crutch for a broken core loop. Earn them by watching what users actually build. A handful of built-in demo templates ships, but no marketplace. |
| 13 | **No dark mode; one aesthetic: white, airy, optimistic** | Steve (Round 1: "NO to dark mode as default — light, airy, optimistic.") + Essence ("White. Airy. No dark mode.") | **Steve**; uncontested | The app is a baton, not a toolbox. The interface disappears until only the work remains. Power users who need dark mode can use the API. |
| 14 | **No admin dashboard with 40 toggles** | Steve (Round 1: "NO to admin dashboards with 40 toggles.") | **Unanimous** | "If you need forty toggles, you haven't decided what the product is." One knob when possible, zero when not. |
| 15 | **Workflow versioning mandatory** | Elon (Round 1: "Workflow versioning is mandatory — users will edit live workflows and break in-flight runs.") | **Elon**; Steve conceded | Users will edit a live run and blame us when it breaks. Version before the first public workflow. In-flight runs are pinned to the version that started them. |
| 16 | **Distribution must be locked before launch** | Elon (Round 1: "ProductHunt gives a spike, not 10,000 retained users. You need a viral loop or an existing traffic source." Round 2: "ProductHunt is a spike, not a strategy.") | **Elon**; Steve silent on this point | Without a locked viral loop, embed strategy, or traffic source, v1 is a portfolio piece in the desert. This is not yet resolved (Open Question #2). Steve builds the spark; someone must build the funnel. |
| 17 | **The first 30 seconds show real agents, not theater** | Synthesis of Steve (Round 1: "You open Relay and there's already a team working." Round 2: "The first 30 seconds must show living agents already working.") and Elon (Round 2: "The fix is a working template that produces a real result instantly, not a theatrical demo with fake agents.") | **Phil's synthesis** | Steve's magic is correct; Elon's reality check is correct. The synthesis: a pre-built, real workflow is alive the moment a user opens the app — configured, capped, and ready to run. No fake demo states. No blank canvas. One click and real agents move. Momentum with substance. |

---

## MVP Feature Set (What Ships in v1)

### Core Experience
1. **Relay web app** — single-platform SaaS; no WordPress bifurcation
2. **Pre-loaded living workflow** — one real multi-agent workflow is active on first open; no blank canvas, no setup wizard, no "build your first workflow" tutorial
3. **Clean config UI** — form-based node configuration with human-readable cards; serializes to JSON trivially under the hood; diffs cleanly in git
4. **Limited node palette** — core agent types only; every node must beg for its existence (exact roster: see Open Question #1)
5. **Zero JSON/YAML exposure in-app** — humans configure through forms; the machine speaks JSON underneath
6. **White, airy interface** — one aesthetic, no dark mode toggle, no advanced mode toggle

### Execution & Performance
7. **Defined execution model** — DAG or state machine with durable state, idempotency keys, and retry logic defined in code before UI ships
8. **Async by default** — workflows run via job queue, not synchronous blocking calls
9. **Parallel execution** — independent agent nodes run concurrently, not serial chains
10. **Aggressive caching** — deterministic inputs hit cache instantly; identical prompts don't re-call the LLM
11. **Sub-3-second target** — for cached or parallel paths; wall-clock latency matters in the magic window

### Guardrails & Economics
12. **Per-user token budgets** — hard limits, daily caps, prepaid credits to prevent runaway API spend
13. **Request deduplication** — don't pay twice for the same work
14. **Workflow versioning** — in-flight runs are pinned to the version that started them

### Explicitly NOT in v1
- Drag-and-drop canvas (v2 cathedral; v1 is the foundation)
- Freemium billing / Stripe integration / metered billing stack
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
- Exposed execution logs or token-count telemetry in the primary UI

---

## File Structure (What Gets Built)

```
relay/
├── app/                          # Web application (single platform, SaaS)
│   ├── onboarding/               # First-run experience: pre-loaded workflow, zero setup
│   ├── config-ui/                # Form-based node editor — clean, minimal, human
│   │   ├── node-cards/             # Visual agent representations (people, not servers)
│   │   ├── node-forms/             # Input surfaces per node type
│   │   ├── workflow-list/          # Saved workflows + version history
│   │   └── run-preview/            # Output viewer: results, not plumbing
│   ├── nodes/                    # Core node component definitions (limited palette)
│   ├── executor/                 # Workflow execution wrapper (UI-facing status)
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
| 2 | **Locked distribution channel** | ProductHunt + LinkedIn is a press release, not a distribution strategy. To reach 10K users without paid ads, need (a) viral loop, (b) marketplace network effect, or (c) SEO/content flywheel. Without a locked funnel, we build a cathedral in the desert. Elon is right that SaaS without traffic is dangerous; Steve is right that WordPress plugin is not the identity. The compromise needs a third path. | Product / GTM lead |
| 3 | **Trial mechanics without Stripe** | If freemium is cut and Stripe is v2, how does the "one free workflow" trial work? Prepaid credits? Manual invoicing? Honor system? Invite-only? Hard caps prevent bankruptcy, but we need a conversion mechanism that doesn't require a billing stack. | Elon (economics) + Steve (experience) |
| 4 | **Developer API scope** | Steve implies developers can use a JSON API. Does the REST/JSON API ship in v1, or is it a promise? Elon's scope discipline says defer unless it's cheap. Shipping a broken API is worse than shipping no API. | Elon (feasibility) |
| 5 | **Hosting / deployment target** | PRD mentioned Cloudflare stack (Pages + D1 + R2). Elon killed Workers AI. Do we still build on Cloudflare, or does the execution model dictate the host? | Elon (architecture) |
| 6 | **Auth model** | When does auth appear? How do we preserve workflow state for a returning user without forcing account creation before the first run? Can a user run their one free workflow anonymously, or is an account gate required for caps? | Elon + Steve (UX + security) |
| 7 | **Execution runtime substrate** | Does the engine submit to an existing daemon/pipeline (zero new runtime), or do we build a lightweight new executor? The debates assume existing infrastructure but never explicitly lock the integration shape. | Elon (architecture) |
| 8 | **First-run experience without canvas** | Steve's vision demands immediate delight and belief. Elon's config UI is a spreadsheet. How do we make the first 30 seconds feel like magic when the interface is forms and a Run button? The pre-loaded workflow is the answer, but what does it do? What output does it produce? | Steve (design) + Elon (constraints) |
| 9 | **Elon's paywall vs. Phil's one-free-workflow** | Elon never fully conceded $29/month from day one. If the trial produces no conversion signal, does billing become v1.1? What is the kill switch? | Phil / CEO |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Config UI fails emotional conversion** | High | Critical | The first workflow must run in under 60 seconds and produce a visible, shareable result. If form-based configuration feels like a tax return, the product dies. Steve must own the interaction design layer; Elon owns what happens after the button is pressed. The pre-loaded workflow is the defense. |
| **API unit economics implode at 100 users** | Medium | Critical | Token budgets + deduplication ship day one. Monitor cost per workflow. If a single DAU costs >$1/day, pause and redesign the agent chain before adding users. Hard caps are the guardrail. |
| **No locked distribution = no users** | High | Critical | Resolve Open Question #2 before build completes. If no credible embed/partnership and no alternative, v1 is a portfolio piece, not a product. Elon's WordPress argument was partially about this — if SaaS wins, SaaS distribution must be solved. |
| **Execution model undefined until too late** | Medium | Critical | Spike DAG/state-machine definition in Week 1. Steve conceded idempotency and durable state must precede pixels. Do not let UI rendering outrun execution semantics. The engine is the product; the UI is documentation. |
| **Scope creep resurrects canvas or JSON editor** | Medium | Medium | Phil's rule: any feature that reopens a locked decision requires both Elon and Steve to agree. Neither has veto override. If either wants to add canvas or JSON UI to v1, both must sign. |
| **One agent session cannot ship production-grade engine** | High | Critical | Elon Round 1: "One session can build a linear pipeline JSON runner with a basic React form UI and a serverless executor. That is the actual MVP." Scope the build to what one session can realistically ship: a working config UI, a defined DAG runner, and one end-to-end workflow. Production hardening is v1.1. |
| **No monetization = unsustainable burn** | Medium | Medium | Track API spend religiously. Set a kill switch: if burn exceeds $X/week with no conversion signal, halt and ship billing as v1.1, not v2. One free workflow with hard caps is the bridge. |
| **Love-mover advantage doesn't convert to revenue** | Medium | High | The trial must feel magical, but hard caps prevent bankruptcy. If users love it but don't pay, we have a museum piece. Resolve trial mechanics (Open Question #3) before launch. |
| **Long agent chains die on timeout** | Medium | High | SaaS or serverless has request limits. Async job queue is mandatory. Synchronous real-time workflows are a trap. Every second a request stays open is a dollar burned. |
| **Steve's "living first-run" assumes infrastructure that doesn't exist** | Medium | High | Steve's 30-second magic requires a running engine underneath. Do not promise demo-state magic on unproven engine bones. The first workflow is the demo. It must be real, not theater. |
| **WordPress plugin FOMO** | Medium | Medium | Elon may continue advocating WordPress if SaaS distribution stalls. Document the decision: WordPress is a v2 channel, not a v1 pivot. Reopening this requires new data, not new opinions. |
| **COGS outrun pricing before pricing exists** | Medium | Critical | Without Stripe in v1, API spend is pure burn. Hard caps are the only defense. If caps are too loose, one power user bankrupts the month. If too tight, the magic breaks. Calibrate in the first week with real calls. |

---

## The Zen Master's Note

Elon owns the foundation. Steve owns the soul.

Elon says: ship the engine, or you ship a mirage.
Steve says: ship the feeling, or you ship a tool.

Both are right where they agree: if the DAG doesn't run, the brand is a lie. If the user doesn't feel power in the first minute, the engine is invisible.

The locked disagreements:
- **Platform:** SaaS won. Distribution risk is now ours to solve.
- **UI:** Config forms won. Canvas is v2. The nodes must still feel human.
- **Pricing:** One free workflow won. No Stripe in v1. Burn must be watched like a heart monitor.

The blueprint is drawn. Build it like a hammer striking anvil — once, clean, and ringing.

*No canvas. No forty toggles. No bankruptcy. One light.*
