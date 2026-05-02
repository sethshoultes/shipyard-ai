# Forge — To-Do List

**Issue**: sethshoultes/shipyard-ai#90
**Last Updated**: 2026-05-02

---

## Wave 1: Project Scaffolding

- [ ] Create `forge/` directory — verify: `ls -la forge/` shows directory exists
- [ ] Create `forge/package.json` with name="forge", version="0.1.0", type="module", empty dependencies — verify: `cat forge/package.json | jq '.dependencies | length'` returns 0
- [ ] Create `forge/tsconfig.json` with NodeNext module resolution, strict mode enabled — verify: `cat forge/tsconfig.json | jq '.compilerOptions.strict'` returns true
- [ ] Run `tsc --noEmit` on empty project — verify: command exits 0 with no errors

---

## Wave 2: Canvas Engine

- [ ] Create `forge/app/canvas/` directory — verify: `ls forge/app/canvas/` succeeds
- [ ] Create `forge/app/canvas/index.tsx` with Canvas root component — verify: file contains "export default function Canvas" and no TODO comments
- [ ] Create `forge/app/canvas/useCanvasState.ts` with state management hook — verify: file exports `useCanvasState` function with explicit return type
- [ ] Implement canvas white background styling — verify: CSS contains `background: #ffffff` or `background-color: white`
- [ ] Implement infinite canvas pan/zoom logic — verify: state includes `scale`, `offsetX`, `offsetY` properties
- [ ] Verify canvas renders without errors — verify: `tsc --noEmit forge/app/canvas/*.tsx` exits 0

---

## Wave 3: Node System

- [ ] Create `forge/app/nodes/` directory — verify: `ls forge/app/nodes/` succeeds
- [ ] Create `forge/app/nodes/BaseNode.tsx` with draggable node component — verify: exports `BaseNode` with `position`, `onMove` props
- [ ] Create `forge/app/nodes/AgentNode.tsx` extending BaseNode — verify: imports BaseNode, adds `agentConfig` prop
- [ ] Create `forge/app/nodes/TriggerNode.tsx` extending BaseNode — verify: imports BaseNode, adds `triggerConfig` prop
- [ ] Implement node drag handlers — verify: `onMouseDown`, `onMouseMove`, `onMouseUp` handlers exist in BaseNode
- [ ] Verify node components type-check — verify: `tsc --noEmit forge/app/nodes/*.tsx` exits 0

---

## Wave 4: Node Connections (Wiring)

- [ ] Create `forge/app/canvas/ConnectionWire.tsx` for node-to-node connections — verify: exports component accepting `from`, `to` coordinates
- [ ] Implement SVG wire rendering — verify: component renders `<path>` or `<line>` SVG element
- [ ] Implement connection state in canvas — verify: state includes `connections` array with `{from, to}` objects
- [ ] Add wire creation interaction (drag from output to input) — verify: mousedown on output, drag, mouseup on input creates connection
- [ ] Verify wiring type-checks — verify: `tsc --noEmit forge/app/canvas/ConnectionWire.tsx` exits 0

---

## Wave 5: Daemon Bridge

- [ ] Create `forge/daemon-bridge/` directory — verify: `ls forge/daemon-bridge/` succeeds
- [ ] Create `forge/daemon-bridge/schema/workflow.ts` with workflow JSON schema — verify: exports type `WorkflowSchema` with `nodes`, `connections` arrays
- [ ] Create `forge/daemon-bridge/validator/validate.ts` with config validation — verify: exports `validateWorkflow` function returning `{valid: boolean, errors: string[]}`
- [ ] Create `forge/daemon-bridge/submitter/submit.ts` with job submission — verify: exports `submitWorkflow` function with async/await
- [ ] Implement POST request to daemon endpoint — verify: code contains `fetch()` with `method: 'POST'`
- [ ] Verify daemon-bridge type-checks — verify: `tsc --noEmit forge/daemon-bridge/**/*.ts` exits 0

---

## Wave 6: Execution & Preview

- [ ] Create `forge/app/executor/` directory — verify: `ls forge/app/executor/` succeeds
- [ ] Create `forge/app/executor/DaemonExecutor.ts` with execution wrapper — verify: exports `executeWorkflow` function calling daemon submitter
- [ ] Create `forge/app/preview/` directory — verify: `ls forge/app/preview/` succeeds
- [ ] Create `forge/app/preview/PreviewRunner.tsx` with live preview component — verify: exports component showing workflow execution state
- [ ] Implement execution status display (running, success, error) — verify: component renders different UI for each status
- [ ] Verify executor type-checks — verify: `tsc --noEmit forge/app/executor/*.ts` exits 0

---

## Wave 7: Caching Layer

- [ ] Create `forge/cache/` directory — verify: `ls forge/cache/` succeeds
- [ ] Create `forge/cache/CacheManager.ts` with deterministic caching — verify: exports `CacheManager` class with `get`, `set`, `has` methods
- [ ] Implement cache key generation from inputs — verify: function creates consistent hash from workflow + inputs
- [ ] Implement cache hit detection — verify: `get()` returns cached value when key exists
- [ ] Verify cache type-checks — verify: `tsc --noEmit forge/cache/*.ts` exits 0

---

## Wave 8: Token Budgets

- [ ] Create `forge/budgets/` directory — verify: `ls forge/budgets/` succeeds
- [ ] Create `forge/budgets/TokenBudget.ts` with budget enforcement — verify: exports `TokenBudget` class with `check`, `deduct`, `remaining` methods
- [ ] Implement budget exceeded detection — verify: `check()` returns false when cost exceeds budget
- [ ] Implement request deduplication — verify: same request within time window returns cached result
- [ ] Verify budgets type-check — verify: `tsc --noEmit forge/budgets/*.ts` exits 0

---

## Wave 9: Developer API

- [ ] Create `forge/api/` directory — verify: `ls forge/api/` succeeds
- [ ] Create `forge/api/routes.ts` with API route definitions — verify: exports route handlers for workflow CRUD
- [ ] Implement GET /workflows endpoint — verify: route returns list of workflows
- [ ] Implement POST /workflows endpoint — verify: route accepts workflow JSON, calls validator
- [ ] Implement GET /workflows/:id/run endpoint — verify: route triggers execution, returns job ID
- [ ] Verify API type-checks — verify: `tsc --noEmit forge/api/*.ts` exits 0

---

## Wave 10: Brand Voice

- [ ] Create `forge/app/voice/` directory — verify: `ls forge/app/voice/` succeeds
- [ ] Create `forge/app/voice/copy.ts` with UI copy strings — verify: exports copy object with human, confident tone (no acronyms)
- [ ] Verify copy has no jargon — verify: grep for "leverage", "synergy", "AI-powered", assert zero matches
- [ ] Apply copy to UI components — verify: components import from voice/copy.ts

---

## Wave 11: Quality Gate

- [ ] Run full TypeScript check — verify: `cd forge && tsc --noEmit` exits 0
- [ ] Scan for TODO/FIXME/HACK comments — verify: `grep -riE 'TODO|FIXME|HACK|XXX' forge/` returns nothing
- [ ] Scan for placeholder code — verify: grep for "implement me", "fix later", empty `{}` function bodies returns nothing
- [ ] Verify no dark mode code exists — verify: grep for "dark" mode selectors returns zero matches in production code
- [ ] Verify no JSON editor exists — verify: grep for "json editor", "json input" returns zero matches
- [ ] Verify no onboarding wizard exists — verify: grep for "wizard", "onboarding", "tour" returns zero matches
- [ ] Verify flat file structure (no deep nesting) — verify: `find forge -type f | wc -l` shows reasonable count
- [ ] Create test scripts in deliverables/tests/ — verify: test scripts exist and are executable

---

## Wave 12: Integration Tests

- [ ] Create canvas integration test — verify: test renders canvas, asserts white background
- [ ] Create node drag integration test — verify: test drags node, asserts position changed
- [ ] Create connection integration test — verify: test creates connection, asserts link exists
- [ ] Create cache integration test — verify: test runs workflow twice, asserts second is cached
- [ ] Create budget integration test — verify: test exceeds budget, asserts execution blocked
- [ ] Run all integration tests — verify: test runner exits 0 with all passing

---

## Notes

- Each task should complete in <5 minutes
- Each task has a verification step
- Tasks are ordered by dependency (earlier waves must complete before later waves)
- Wave numbers indicate parallelization opportunities (tasks in same wave can run in parallel)
