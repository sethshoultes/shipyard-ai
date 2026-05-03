# Forge Build — To-Do List

> **Project:** github-issue-sethshoultes-shipyard-ai-90
> **Target:** Forge MVP (web app, config UI, execution engine)
> **Status:** Pre-build — awaiting open question resolution
> **Last Updated:** 2026-05-03

---

## Phase 0: Open Question Resolution (BLOCKING)

- [ ] Resolve Open Question #1: Exact node type roster (2 agents, inputs, outputs, config surfaces) — verify: decisions.md updated with roster
- [ ] Resolve Open Question #2: Distribution channel (viral loop, embed, or SEO) — verify: distribution strategy documented in spec
- [ ] Resolve Open Question #3: Trial mechanics without Stripe (prepaid credits? honor system?) — verify: trial flow documented
- [ ] Resolve Open Question #4: Developer API scope (ships in v1 or deferred?) — verify: API decision in decisions.md
- [ ] Resolve Open Question #5: Hosting/deployment target (Cloudflare Pages + D1 + R2?) — verify: deployment target documented
- [ ] Resolve Open Question #6: Auth model (when auth appears, state preservation) — verify: auth flow documented
- [ ] Resolve Open Question #7: Execution runtime substrate (existing daemon or new executor?) — verify: architecture decision documented
- [ ] Resolve Open Question #8: First-run experience without canvas (30s magic moment) — verify: UX flow documented

---

## Phase 1: Project Bootstrap

- [ ] Create `forge/` directory — verify: `ls -la forge/` shows directory exists
- [ ] Create `forge/package.json` with project metadata — verify: `cat forge/package.json` shows valid JSON with name "forge"
- [ ] Create `forge/tsconfig.json` with TypeScript config — verify: `tsc --noEmit` passes
- [ ] Create `forge/.gitignore` with Node.js exclusions — verify: contains `node_modules`, `dist`, `.env`
- [ ] Create `forge/app/index.html` entry point — verify: file opens in browser, no console errors
- [ ] Create `forge/app/voice/brand.ts` with brand constants — verify: exports `tone`, `style`, `acronymBlacklist`
- [ ] Create `forge/README.md` with setup instructions — verify: contains `npm install`, `npm start` commands

---

## Phase 2: Config UI — Form-Based Node Editor

- [ ] Create `forge/app/config-ui/` directory — verify: `ls forge/app/config-ui/` shows subdirectories
- [ ] Create `forge/app/config-ui/node-forms/` directory — verify: directory exists
- [ ] Create `forge/app/config-ui/node-forms/base-form.tsx` — verify: exports `BaseForm` component with validation
- [ ] Create `forge/app/config-ui/node-forms/content-writer-form.tsx` — verify: form has topic/tone/length inputs
- [ ] Create `forge/app/config-ui/node-forms/image-generator-form.tsx` — verify: form has prompt/size inputs
- [ ] Create `forge/app/config-ui/workflow-list/` directory — verify: directory exists
- [ ] Create `forge/app/config-ui/workflow-list/workflow-list.tsx` — verify: displays workflow name, version
- [ ] Create `forge/app/config-ui/workflow-list/version-history.tsx` — verify: shows version number, created date
- [ ] Create `forge/app/config-ui/run-preview/` directory — verify: directory exists
- [ ] Create `forge/app/config-ui/run-preview/output-viewer.tsx` — verify: renders text output or image URL
- [ ] Create `forge/app/config-ui/styles.css` — verify: under 200 lines, no `!important`, no dark mode

---

## Phase 3: Node Components

- [ ] Create `forge/app/nodes/` directory — verify: directory exists
- [ ] Create `forge/app/nodes/types.ts` — verify: exports `NodeType`, `NodeInput`, `NodeOutput` interfaces
- [ ] Create `forge/app/nodes/node-registry.ts` — verify: exports `registerNode()`, `getNode()` functions
- [ ] Create `forge/app/nodes/content-writer-node.ts` — verify: exports `ContentWriterNode` with `run()` method
- [ ] Create `forge/app/nodes/image-generator-node.ts` — verify: exports `ImageGeneratorNode` with `run()` method
- [ ] Create `forge/app/nodes/connection-node.ts` — verify: exports `ConnectionNode` with source/target IDs

---

## Phase 4: Execution Engine — DAG

- [ ] Create `forge/engine/` directory — verify: directory exists
- [ ] Create `forge/engine/dag/` directory — verify: directory exists
- [ ] Create `forge/engine/dag/dag.ts` — verify: exports `Dag` class with `addNode()`, `addEdge()` methods
- [ ] Create `forge/engine/dag/topological-sort.ts` — verify: exports `topologicalSort()` function
- [ ] Create `forge/engine/dag/dependency-resolver.ts` — verify: exports `resolveDependencies()` function
- [ ] Create `forge/engine/validator/` directory — verify: directory exists
- [ ] Create `forge/engine/validator/config-validator.ts` — verify: exports `validateConfig()` function
- [ ] Create `forge/engine/validator/schema-validator.ts` — verify: exports `validateSchema()` function

---

## Phase 5: Execution Engine — State Machine

- [ ] Create `forge/engine/state/` directory — verify: directory exists
- [ ] Create `forge/engine/state/state-machine.ts` — verify: exports `StateMachine` class with state transitions
- [ ] Create `forge/engine/state/idempotency.ts` — verify: exports `generateIdempotencyKey()` function
- [ ] Create `forge/engine/state/retry-logic.ts` — verify: exports `retryWithBackoff()` function (max 3 retries)
- [ ] Create `forge/engine/state/durable-storage.ts` — verify: exports `saveState()`, `loadState()` functions

---

## Phase 6: Parallel Execution

- [ ] Create `forge/engine/parallelizer/` directory — verify: directory exists
- [ ] Create `forge/engine/parallelizer/parallelizer.ts` — verify: exports `findIndependentNodes()` function
- [ ] Create `forge/engine/parallelizer/fork-join.ts` — verify: exports `forkJoin()` function
- [ ] Create `forge/engine/parallelizer/promise-pool.ts` — verify: exports `PromisePool` class with concurrency limit

---

## Phase 7: Caching Layer

- [ ] Create `forge/cache/` directory — verify: directory exists
- [ ] Create `forge/cache/key-builder/` directory — verify: directory exists
- [ ] Create `forge/cache/key-builder/key-builder.ts` — verify: exports `buildCacheKey()` function (deterministic hash)
- [ ] Create `forge/cache/store/` directory — verify: directory exists
- [ ] Create `forge/cache/store/cache-store.ts` — verify: exports `CacheStore` class with TTL
- [ ] Create `forge/cache/store/eviction.ts` — verify: exports `lruEviction()` function
- [ ] Create `forge/cache/cache-integration.ts` — verify: integrates cache with node execution

---

## Phase 8: Token Budgets

- [ ] Create `forge/budgets/` directory — verify: directory exists
- [ ] Create `forge/budgets/per-user-caps/` directory — verify: directory exists
- [ ] Create `forge/budgets/per-user-caps/user-caps.ts` — verify: exports `trackTokenUsage()`, `checkCap()` functions
- [ ] Create `forge/budgets/per-user-caps/daily-quota.ts` — verify: exports `checkDailyQuota()`, `resetDailyQuota()` functions
- [ ] Create `forge/budgets/dedup/` directory — verify: directory exists
- [ ] Create `forge/budgets/dedup/fingerprint.ts` — verify: exports `fingerprintRequest()` function
- [ ] Create `forge/budgets/dedup/dedup-check.ts` — verify: exports `checkDuplicate()` function

---

## Phase 9: Async Job Queue

- [ ] Create `forge/queue/` directory — verify: directory exists
- [ ] Create `forge/queue/dispatcher/` directory — verify: directory exists
- [ ] Create `forge/queue/dispatcher/dispatcher.ts` — verify: exports `enqueue()`, `dequeue()` functions
- [ ] Create `forge/queue/workers/` directory — verify: directory exists
- [ ] Create `forge/queue/workers/worker.ts` — verify: exports `Worker` class that processes queue items
- [ ] Create `forge/queue/workers/agent-handler.ts` — verify: exports `handleAgentCall()` function

---

## Phase 10: REST API

- [ ] Create `forge/api/` directory — verify: directory exists
- [ ] Create `forge/api/v1/` directory — verify: directory exists
- [ ] Create `forge/api/v1/routes.ts` — verify: exports route definitions for `/workflows`, `/execute`
- [ ] Create `forge/api/v1/workflows.ts` — verify: exports CRUD handlers for workflows
- [ ] Create `forge/api/v1/execute.ts` — verify: exports `executeWorkflow()` handler
- [ ] Create `forge/api/v1/auth.ts` — verify: exports `authenticate()` middleware

---

## Phase 11: Integration & Polish

- [ ] Wire config UI to execution engine — verify: form submission triggers workflow execution
- [ ] Wire execution engine to cache layer — verify: repeated runs hit cache
- [ ] Wire execution engine to budget tracker — verify: token usage tracked, caps enforced
- [ ] Wire execution engine to job queue — verify: workflows run async
- [ ] Wire job queue to REST API — verify: API triggers queue, returns job ID
- [ ] Add loading states to UI — verify: user sees progress during execution
- [ ] Add error states to UI — verify: user sees clear error messages
- [ ] Add success states to UI — verify: user sees result on completion

---

## Phase 12: Testing & QA

- [ ] Run all test scripts in `deliverables/github-issue-sethshoultes-shipyard-ai-90/tests/` — verify: all tests pass (exit 0)
- [ ] Test first-run experience (<60 seconds to first result) — verify: new user can create and run workflow in 60s
- [ ] Test token budget enforcement — verify: execution blocked when cap reached
- [ ] Test workflow versioning — verify: editing creates new version, old runs unaffected
- [ ] Test parallel execution — verify: independent nodes run concurrently
- [ ] Test caching — verify: identical runs return cached result
- [ ] Test retry logic — verify: failed nodes retry up to 3 times

---

## Phase 13: Documentation

- [ ] Write `forge/README.md` with setup and usage — verify: new developer can follow steps
- [ ] Write `forge/ARCHITECTURE.md` with system overview — verify: diagrams show data flow
- [ ] Write `forge/API.md` with REST API documentation — verify: all endpoints documented
- [ ] Write `forge/BRAND.md` with voice and style guide — verify: copy examples included

---

## Notes

- Each task should be completable in <5 minutes
- Each task has a verification step (how to check it worked)
- Tasks are atomic and independent where possible
- Phase 0 (open questions) must be resolved before Phase 1 begins
- Waves 1, 2, and 5 can run in parallel within their phase
- Phases 3, 4, 9, 10 are sequential (each depends on previous)
