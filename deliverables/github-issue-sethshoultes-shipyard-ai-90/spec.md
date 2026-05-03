# Relay v1 — Build Specification

> **PRD:** [dream] AgentForge (GitHub Issue #90)
> **Implementation:** Relay Web App (Config UI + Execution Engine)
> **Phase:** 1 (MVP)
> **Generated:** 2026-05-03

---

## Goals (from PRD)

| Goal | Description |
|------|-------------|
| **Visual Agent Builder** | A web app that lets non-developers design, test, and deploy multi-agent AI workflows |
| **Zapier for Agents** | Think Zapier, but for orchestrating Claude agents |
| **Freemium Model** | Free for 3 workflows, then pricing tiers |
| **First-Mover Advantage** | Capture the visual agent building market early |
| **Target Users** | Operations teams, no-code builders, consultants |

---

## Implementation Approach (from Plan + Locked Decisions)

The v1 implementation is a **web app** called **Relay** that provides:

### Locked Decisions (Supersede Plan)

| Decision # | Decision | Outcome |
|------------|----------|---------|
| 1 | Name | **Relay** (Steve won; Elon conceded) |
| 5 | Platform | **Web app only** — NO WordPress plugin |
| 4 | Canvas | **No drag-and-drop for v1** — Config UI first (form-based) |
| 14 | JSON exposure | **No JSON/YAML in app UI** — Humans use forms |
| 7 | Execution | **Async by default** with parallelized independent nodes |
| 9 | Budgets | **Hard token budgets + per-user cost caps day one** |
| 15 | Versioning | **Workflow versioning mandatory** |
| 12 | Aesthetic | **White, airy, optimistic** — No dark mode |
| 10 | Billing | **No freemium billing stack in v1** |
| 11 | Templates | **No template marketplace in v1** |
| 3 | Engine First | **Execution model defined before pixels** |
| 13 | Admin Dashboard | **No admin dashboard with 40 toggles** |

### Relay Architecture

```
relay/
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
- Relay web app (single platform)
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
- Onboarding wizards, tooltips, tutorial videos

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

### Wave 1 — Foundation

#### 1. Project Bootstrap (`relay/package.json`, `relay/tsconfig.json`)
- [ ] `relay/` directory exists
- [ ] `relay/package.json` contains valid JSON with name "relay"
- [ ] `npm install` runs without errors
- [ ] `tsc --noEmit` passes with no TypeScript errors
- [ ] `relay/app/index.html` opens in browser with no console errors

#### 2. Config UI — Form-Based Node Editor
- [ ] At least one node form exists in `relay/app/config-ui/node-forms/`
- [ ] Form serializes to valid JSON matching schema
- [ ] No raw JSON editor visible (grep for `textarea.*json` returns zero)
- [ ] UI uses white/airy aesthetic (light backgrounds, no dark mode toggle)

#### 3. Admin CSS (`relay/app/config-ui/styles.css`)
- [ ] File size under 200 lines
- [ ] No `!important` declarations
- [ ] No dark mode classes or variables
- [ ] All selectors prefixed with `.relay-` to avoid conflicts

### Wave 2 — Core Classes

#### 4. Node Components (`relay/app/nodes/`)
- [ ] `types.ts` exports `NodeType`, `NodeInput`, `NodeOutput` interfaces
- [ ] `node-registry.ts` exports `registerNode()`, `getNode()` functions
- [ ] `content-writer-node.ts` exports `ContentWriterNode` with `run()` method
- [ ] `image-generator-node.ts` exports `ImageGeneratorNode` with `run()` method

#### 5. Execution Engine — DAG (`relay/engine/dag/`)
- [ ] `dag.ts` exports `Dag` class with `addNode()`, `addEdge()` methods
- [ ] `topological-sort.ts` exports `topologicalSort()` function
- [ ] Cycle detection throws error on cyclic graph
- [ ] Topological sort returns valid dependency-respecting order

#### 6. Execution Engine — State Machine (`relay/engine/state/`)
- [ ] `state-machine.ts` exports `StateMachine` class with state transitions
- [ ] State transitions: pending → running → completed
- [ ] `idempotency.ts` exports `generateIdempotencyKey()` function
- [ ] `retry-logic.ts` exports `retryWithBackoff()` function (max 3 retries)
- [ ] State persists across page refresh

#### 7. Caching Layer (`relay/cache/`)
- [ ] `key-builder.ts` exports `buildCacheKey()` function (deterministic hash)
- [ ] `cache-store.ts` exports `CacheStore` class with TTL support
- [ ] Identical prompts return cached result on second run
- [ ] TTL eviction removes expired entries
- [ ] LRU eviction removes least-recently-used when cache full

#### 8. Token Budgets (`relay/budgets/`)
- [ ] `user-caps.ts` exports `trackTokenUsage()`, `checkCap()` functions
- [ ] `daily-quota.ts` exports `checkDailyQuota()`, `resetDailyQuota()` functions
- [ ] `fingerprint.ts` exports `fingerprintRequest()` function
- [ ] `dedup-check.ts` exports `checkDuplicate()` function
- [ ] Execution blocked when token cap reached

### Wave 3 — Orchestration

#### 9. Parallel Execution (`relay/engine/parallelizer/`)
- [ ] `parallelizer.ts` exports `findIndependentNodes()` function
- [ ] `fork-join.ts` exports `forkJoin()` function
- [ ] `promise-pool.ts` exports `PromisePool` class with concurrency limit
- [ ] Independent nodes run concurrently (not serially)

### Wave 4 — Integration

#### 10. Async Job Queue (`relay/queue/`)
- [ ] `dispatcher.ts` exports `enqueue()`, `dequeue()` functions
- [ ] `worker.ts` exports `Worker` class that processes queue items
- [ ] `agent-handler.ts` exports `handleAgentCall()` function
- [ ] Workflows execute asynchronously (not blocking)

#### 11. REST API (`relay/api/v1/`)
- [ ] `routes.ts` exports route definitions for `/workflows`, `/execute`
- [ ] `workflows.ts` exports CRUD handlers for workflows
- [ ] `execute.ts` exports `executeWorkflow()` handler
- [ ] `auth.ts` exports `authenticate()` middleware
- [ ] API triggers queue and returns job ID

### Wave 5 — Admin & Polish

#### 12. Workflow Versioning
- [ ] Editing a workflow creates a new version (version increments)
- [ ] In-flight runs remain pinned to original version
- [ ] Version history displays version number and created date

#### 13. Brand Voice (`relay/app/voice/`)
- [ ] `brand.ts` exports `tone`, `style`, `acronymBlacklist`
- [ ] Copy is human, confident, zero acronyms
- [ ] No enterprise sludge or jargon

#### 14. Exclusion Audit
Verify zero matches for excluded features:

| Excluded Feature | Search Pattern | Expected Result |
|-----------------|----------------|-----------------|
| Drag-and-drop canvas | `canvas`, `drag.*drop`, `figma` | Zero matches |
| Freemium billing | `stripe`, `billing`, `subscription`, `freemium` | Zero matches |
| Dark mode | `dark.*mode`, `theme.*toggle` | Zero matches |
| WordPress plugin | `wordpress`, `wp-`, `add_action` | Zero matches |
| Workers AI edge | `workers.*ai`, `edge.*runtime` | Zero matches |
| Template marketplace | `marketplace`, `template.*store` | Zero matches |
| JSON editor in UI | `json.*editor`, `yaml.*editor`, `codemirror` | Zero matches |
| Onboarding wizard | `onboarding`, `wizard`, `tour`, `intro\.js` | Zero matches |

---

## Files to Create or Modify

### New Files (26 total)

| File | Purpose | Wave |
|------|---------|------|
| `relay/package.json` | Project metadata and dependencies | 1 |
| `relay/tsconfig.json` | TypeScript configuration | 1 |
| `relay/.gitignore` | Node.js/TypeScript exclusions | 1 |
| `relay/app/index.html` | Web app entry point | 1 |
| `relay/app/config-ui/node-forms/base-form.tsx` | Base form component | 2 |
| `relay/app/config-ui/node-forms/content-writer-form.tsx` | ContentWriter config | 2 |
| `relay/app/config-ui/node-forms/image-generator-form.tsx` | ImageGenerator config | 2 |
| `relay/app/config-ui/workflow-list/workflow-list.tsx` | List saved workflows | 2 |
| `relay/app/config-ui/workflow-list/version-history.tsx` | Version history UI | 2 |
| `relay/app/config-ui/run-preview/output-viewer.tsx` | Output display | 2 |
| `relay/app/config-ui/styles.css` | White/airy aesthetic | 1 |
| `relay/app/voice/brand.ts` | Brand constants | 1 |
| `relay/app/nodes/types.ts` | Node type definitions | 2 |
| `relay/app/nodes/node-registry.ts` | Node type registry | 2 |
| `relay/app/nodes/content-writer-node.ts` | ContentWriter implementation | 2 |
| `relay/app/nodes/image-generator-node.ts` | ImageGenerator implementation | 2 |
| `relay/engine/dag/dag.ts` | DAG data structure | 2 |
| `relay/engine/dag/topological-sort.ts` | Execution order | 2 |
| `relay/engine/dag/cycle-detection.ts` | Cycle detection | 2 |
| `relay/engine/state/state-machine.ts` | Workflow state | 2 |
| `relay/engine/state/idempotency.ts` | Idempotency keys | 2 |
| `relay/engine/state/retry-logic.ts` | Retry on failure | 2 |
| `relay/engine/state/durable-storage.ts` | State persistence | 2 |
| `relay/engine/parallelizer/parallelizer.ts` | Find independent nodes | 3 |
| `relay/engine/parallelizer/fork-join.ts` | Fork-join execution | 3 |
| `relay/cache/key-builder/key-builder.ts` | Cache key hashing | 2 |
| `relay/cache/store/cache-store.ts` | In-memory cache with TTL | 2 |
| `relay/cache/store/eviction.ts` | LRU eviction | 2 |
| `relay/budgets/per-user-caps/user-caps.ts` | Token tracking | 2 |
| `relay/budgets/per-user-caps/daily-quota.ts` | Daily quotas | 2 |
| `relay/budgets/dedup/fingerprint.ts` | Request fingerprinting | 2 |
| `relay/budgets/dedup/dedup-check.ts` | Duplicate check | 2 |
| `relay/queue/dispatcher/dispatcher.ts` | Job queue | 4 |
| `relay/queue/workers/worker.ts` | Queue processor | 4 |
| `relay/queue/workers/agent-handler.ts` | Agent call handler | 4 |
| `relay/api/v1/routes.ts` | REST routes | 4 |
| `relay/api/v1/workflows.ts` | Workflow CRUD | 4 |
| `relay/api/v1/execute.ts` | Execute handler | 4 |
| `relay/api/v1/auth.ts` | Auth middleware | 4 |
| `relay/README.md` | Setup instructions | 5 |
| `relay/ARCHITECTURE.md` | System overview | 5 |
| `relay/BRAND.md` | Voice and style guide | 5 |

### Modified Files

| File | Reason |
|------|--------|
| `STATUS.md` | Update pipeline state for Relay project |
| `TASKS.md` | Add Relay build tasks |

---

## Test Scripts

All test scripts are in `deliverables/github-issue-sethshoultes-shipyard-ai-90/tests/`:

| Script | Purpose |
|--------|---------|
| `verify-structure.sh` | Verify relay directory structure and file existence |
| `verify-no-banned-patterns.sh` | Ensure no excluded features in codebase |
| `verify-typescript.sh` | TypeScript compilation check |
| `verify-caching-budgets.sh` | Verify caching and budget enforcement |
| `run-all-tests.sh` | Run all verification tests |

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
| 7 | **Execution runtime substrate** — Existing daemon or new executor? | Elon | Before Phase 1 |
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

- **Name:** Relay (Steve won; Elon conceded Round 2)
- **Brand voice:** Human, confident, zero acronyms, no enterprise sludge
- **Phil Jackson's note:** Elon owns the foundation. Steve owns the soul. Both must agree for the product to ship.
- **Essence:** Engine first. Baton later. The engine is the product; the UI is documentation.
