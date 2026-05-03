# Spec: Forge — AgentForge MVP

> **PRD:** [dream] AgentForge (Issue #90)
> **Plan:** Phase 1 Plan — AgentPress v1 WordPress Plugin
> **Decisions:** Forge — Locked Decisions (rounds/github-issue-sethshoultes-shipyard-ai-90/decisions.md)
> **Project Slug:** `github-issue-sethshoultes-shipyard-ai-90`
> **Status:** Pre-build — awaiting open question resolution

---

## Goals (from PRD)

### Primary Goal
Build **Forge** — a web app that lets non-developers design, test, and deploy multi-agent AI workflows. Think Zapier, but for orchestrating Claude agents.

### Success Criteria
1. Issue sethshoultes/shipyard-ai#90 requirements are met
2. All tests pass
3. Web app runs locally without errors
4. Both built-in agents (ContentWriter, ImageGenerator) respond via execution engine
5. Workflow versioning preserves in-flight runs
6. Average latency < 3000ms for cached/parallel paths
7. Zero fatal errors after 100 workflow runs
8. Token budgets enforced (hard caps prevent runaway spend)

### Target Users
- Operations teams
- No-code builders
- Consultants

### Distribution Channels
- TBD (Open Question #2 — must resolve before launch)

---

## Implementation Approach (from Plan + Debate Decisions)

### Locked Decisions (Supersede Plan)

| Decision # | Decision | Outcome |
|------------|----------|---------|
| 1 | Name | **Forge** (one syllable, solid) |
| 5 | Platform | **Web app only** — NO WordPress plugin |
| 4 | Canvas | **No drag-and-drop for v1** — Config UI first (form-based) |
| 14 | JSON exposure | **No JSON/YAML in app UI** — Humans use forms |
| 7 | Execution | **Async by default** with parallelized independent nodes |
| 9 | Budgets | **Hard token budgets + per-user cost caps day one** |
| 15 | Versioning | **Workflow versioning mandatory** |
| 12 | Aesthetic | **White, airy, optimistic** — No dark mode |
| 10 | Billing | **No freemium billing stack in v1** |
| 11 | Templates | **No template marketplace in v1** |

### Forge Architecture

```
forge/
├── app/                          # Web application (single platform)
│   ├── config-ui/                # Form-based node editor
│   │   ├── node-forms/           # Input surfaces per node type
│   │   ├── workflow-list/        # Saved workflows + version history
│   │   └── run-preview/          # Output viewer (not canvas)
│   ├── nodes/                    # Core node component definitions
│   ├── executor/                 # Workflow execution wrapper
│   └── voice/                    # Brand copy — human, confident
├── engine/                       # Workflow execution core
│   ├── dag/                      # DAG definition + dependency resolution
│   ├── state/                    # Durable state + idempotency + retry
│   ├── parallelizer/             # Fork-join for independent nodes
│   └── validator/                # Pre-flight config validation
├── cache/                        # Aggressive deterministic cache layer
│   ├── key-builder/              # Hash inputs for cache keys
│   └── store/                    # TTL + eviction
├── budgets/                      # Token budgets & request deduplication
│   ├── per-user-caps/            # Hard spend limits, daily quotas
│   └── dedup/                    # Request fingerprinting
├── queue/                        # Async job runner
│   ├── dispatcher/               # Enqueue/dequeue workflows
│   └── workers/                  # Agent call handlers
└── api/                          # Developer-facing API
    └── v1/                       # REST surface (ships if cheap)
```

### v1 MVP Feature Set

**Core Experience:**
- Forge web app (single platform)
- Clean config UI (form-based, serializes to JSON)
- Limited node palette (2 agents: ContentWriter, ImageGenerator)
- White, airy interface (no dark mode toggle)

**Execution & Performance:**
- Defined execution model (DAG/state machine)
- Async by default (job queue)
- Parallel execution of independent nodes
- Aggressive caching (deterministic inputs hit cache)
- Sub-3-second target for cached/parallel paths

**Guardrails:**
- Per-user token budgets (hard limits, daily caps)
- Request deduplication (don't pay twice)
- Workflow versioning (in-flight runs pinned to version)

**Explicitly NOT in v1:**
- Drag-and-drop canvas
- Freemium billing / Stripe integration
- Dark mode
- WordPress plugin
- Workers AI / edge execution runtime
- Template marketplace
- JSON/YAML editor in UI
- Admin dashboard with 40 toggles

### Wave Sequencing

| Wave | Tasks | Theme | Parallel? |
|------|-------|-------|-----------|
| 1 | 1, 2, 3 | Foundation (bootstrap, config UI, CSS) | Yes |
| 2 | 4, 5, 6, 7 | Core Classes (nodes, engine base, budgets) | Yes |
| 3 | 8 | Orchestration (DAG + state machine) | Sequential |
| 4 | 9 | Integration (REST API + queue) | Sequential |
| 5 | 10, 11 | Admin & Polish (UI polish, docs, audit) | Yes |

---

## Verification Criteria

### V1. Project Bootstrap
| Criterion | Verification Method |
|-----------|---------------------|
| `forge/` directory exists | `ls -la forge/` shows directories |
| `forge/package.json` exists | `cat forge/package.json` shows valid JSON |
| `npm install` runs without errors | Run command, verify exit 0 |
| `tsc --noEmit` passes | Run command, verify no TypeScript errors |
| `forge/app/index.html` opens in browser | File opens, no console errors |

### V2. Form-Based Config UI
| Criterion | Verification Method |
|-----------|---------------------|
| At least one node form exists | `ls forge/app/config-ui/node-forms/` shows `.tsx` files |
| Form serializes to valid JSON | Submit form, verify JSON output matches schema |
| No raw JSON editor visible | Grep for `textarea.*json`, verify zero matches |
| UI uses white/airy aesthetic | CSS has light backgrounds, no dark mode toggle |

### V3. Execution Engine — DAG
| Criterion | Verification Method |
|-----------|---------------------|
| DAG data structure exists | `forge/engine/dag/dag.ts` exports `Dag` class |
| Can add nodes and edges | Test: create DAG, add node, add edge, verify no errors |
| Cycle detection works | Test: create cycle, verify error thrown |
| Topological sort returns valid order | Test: sort DAG, verify order respects dependencies |

### V4. Execution Engine — State Machine
| Criterion | Verification Method |
|-----------|---------------------|
| State machine handles transitions | Test: pending → running → completed |
| Idempotency keys prevent duplicates | Test: same input = same key, second run blocked |
| Retry logic works (up to 3 times) | Test: fail node, verify retries then marks failed |
| State persists across refresh | Test: save state, reload, verify state restored |

### V5. Caching Layer
| Criterion | Verification Method |
|-----------|---------------------|
| Cache key builder hashes inputs | Test: same inputs = same hash, different = different |
| Identical prompts hit cache | Test: run twice, second returns cached result |
| TTL eviction works | Test: set short TTL, verify expired entry removed |
| LRU eviction works | Test: fill cache, verify least-recently-used evicted |

### V6. Token Budgets
| Criterion | Verification Method |
|-----------|---------------------|
| Per-user token usage tracked | Test: increment counter on each API call |
| Daily quotas enforced | Test: exceed quota, verify execution blocked |
| Request deduplication works | Test: identical requests return cached result |

### V7. Workflow Versioning
| Criterion | Verification Method |
|-----------|---------------------|
| Editing creates new version | Test: edit workflow, verify version increments |
| In-flight runs pinned to version | Test: start run, edit, verify run uses original version |

### V8. Brand Voice
| Criterion | Verification Method |
|-----------|---------------------|
| Copy is human, confident | Review: no acronyms, no enterprise sludge |
| White/airy aesthetic | CSS: light backgrounds, optimistic colors |
| No dark mode toggle | Grep for `dark.*mode`, verify zero matches |

---

## Exclusion Audit (v1 Boundaries)

The following features are **explicitly NOT in v1**. Verify zero matches:

| Excluded Feature | Search Pattern | Expected Result |
|-----------------|----------------|-----------------|
| Drag-and-drop canvas | `canvas`, `drag.*drop`, `figma` | Zero matches |
| Freemium billing | `stripe`, `billing`, `subscription`, `freemium` | Zero matches |
| Dark mode | `dark.*mode`, `theme.*toggle` | Zero matches |
| WordPress plugin | `wordpress`, `wp-`, `plugin` | Zero matches (in forge/) |
| Workers AI edge | `workers.*ai`, `edge.*runtime` | Zero matches |
| Template marketplace | `marketplace`, `template.*store` | Zero matches |
| JSON editor in UI | `json.*editor`, `yaml.*editor` | Zero matches |
| 40-toggle admin | `wizard`, `onboarding`, `tour` | Zero matches |

---

## Files to Create or Modify

### New Files (20+ total)

| File | Purpose |
|------|---------|
| `forge/package.json` | Project metadata and dependencies |
| `forge/tsconfig.json` | TypeScript configuration |
| `forge/.gitignore` | Node.js/TypeScript exclusions |
| `forge/app/index.html` | Web app entry point |
| `forge/app/config-ui/node-forms/base-form.tsx` | Base form component |
| `forge/app/config-ui/node-forms/content-writer-form.tsx` | ContentWriter config |
| `forge/app/config-ui/node-forms/image-generator-form.tsx` | ImageGenerator config |
| `forge/app/config-ui/workflow-list/workflow-list.tsx` | List saved workflows |
| `forge/app/config-ui/workflow-list/version-history.tsx` | Version history UI |
| `forge/app/config-ui/run-preview/output-viewer.tsx` | Output display |
| `forge/app/config-ui/styles.css` | White/airy aesthetic |
| `forge/app/nodes/node-registry.ts` | Node type registry |
| `forge/app/nodes/types.ts` | Node type definitions |
| `forge/app/nodes/content-writer-node.ts` | ContentWriter implementation |
| `forge/app/nodes/image-generator-node.ts` | ImageGenerator implementation |
| `forge/engine/dag/dag.ts` | DAG data structure |
| `forge/engine/dag/topological-sort.ts` | Execution order |
| `forge/engine/state/state-machine.ts` | Workflow state |
| `forge/engine/state/idempotency.ts` | Idempotency keys |
| `forge/engine/state/retry-logic.ts` | Retry on failure |
| `forge/cache/key-builder/key-builder.ts` | Cache key hashing |
| `forge/cache/store/cache-store.ts` | In-memory cache |
| `forge/budgets/per-user-caps/user-caps.ts` | Token tracking |
| `forge/budgets/dedup/fingerprint.ts` | Request fingerprinting |
| `forge/queue/dispatcher/dispatcher.ts` | Job queue |
| `forge/api/v1/routes.ts` | REST routes |
| `forge/README.md` | Setup instructions |
| `forge/ARCHITECTURE.md` | System overview |

### Modified Files

| File | Reason |
|------|--------|
| `STATUS.md` | Update pipeline state for Forge project |
| `TASKS.md` | Add Forge build tasks |
| `rounds/github-issue-sethshoultes-shipyard-ai-90/decisions.md` | Resolve open questions before build |

---

## Open Questions (Must Resolve Before Build)

| # | Question | Owner | Resolution Required |
|---|----------|-------|---------------------|
| 1 | **Exact node type roster** — What are the 2 agents? Inputs/outputs? | Steve + Elon | Before Phase 1 |
| 2 | **Distribution channel** — Viral loop, embed, or SEO? | Product/GTM | Before launch |
| 3 | **Trial mechanics without Stripe** — How does trial work? | Elon + Steve | Before Phase 1 |
| 4 | **Developer API scope** — Ships in v1 or deferred? | Elon | Before Phase 1 |
| 5 | **Hosting/deployment target** — Cloudflare Pages + D1 + R2? | Elon | Before Phase 1 |
| 6 | **Auth model** — When does auth appear? | Elon + Steve | Before Phase 1 |
| 7 | **Execution runtime substrate** — Existing daemon or new? | Elon | Before Phase 1 |
| 8 | **First-run experience** — 30s magic moment without canvas? | Steve + Elon | Before Phase 1 |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Config UI fails emotional conversion | High | Critical | First workflow must run in <60s with visible result |
| API unit economics implode | Medium | Critical | Token budgets + dedup ship day one |
| No locked distribution = no users | High | Critical | Resolve Open Question #2 before build completes |
| Execution model undefined too late | Medium | Critical | Spike DAG/state-machine in Week 1 |
| Scope creep resurrects canvas | Medium | Medium | Phil's rule: both Elon + Steve must agree to reopen |
| One session cannot ship production | High | Critical | Scope to config UI + DAG runner + one workflow |

---

## Notes

- **Name:** Forge (one syllable, solid, memorable)
- **Brand voice:** Human, confident, zero acronyms, no enterprise sludge
- **Phil Jackson's note:** Elon owns the foundation. Steve owns the soul. Both must agree for the product to ship.
- **Essence:** Engine first. Baton later. The engine is the product; the UI is documentation.
