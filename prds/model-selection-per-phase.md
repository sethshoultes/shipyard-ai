# PRD: Model Selection Per Pipeline Phase — Stop Hallucinations at the Source

> Priority: p0

## Problem

The daemon runs all agents on the default model (Sonnet) but CLAUDE.md says "always run on haiku model (~5x cheaper)". Neither is correct. Haiku hallucinates framework APIs — every Emdash plugin shipped with 100+ `throw new Response` violations, fake `rc.user` references, and manual JSON.stringify on auto-serializing KV. Each bad build costs 4-6 additional agent runs to fix (QA block → fix → re-QA → repeat). Running Sonnet on everything wastes tokens on phases that don't need reasoning.

The fix: pass the right model per phase. Sonnet for code-generating phases, Haiku for opinion/review phases.

## Architecture

The Claude Agent SDK `query()` accepts a `model` option. The daemon's `runAgent()` function in `pipeline.ts` currently does NOT pass a model — it uses whatever the system default is.

### Model Assignment

| Phase | Model | Reasoning |
|-------|-------|-----------|
| Debate R1/R2 (Steve, Elon) | sonnet | Strategy needs reasoning |
| Rick Rubin essence | haiku | Distillation, no code |
| Phil Jackson consolidation | sonnet | Decision-locking needs precision |
| Plan | sonnet | Wrong plans waste entire pipelines |
| Sara Blakely gut-check | haiku | Opinion, no code |
| **Build** | **sonnet** | **Code generation — hallucinations here cost the most** |
| **QA (Margaret)** | **sonnet** | **Must catch banned patterns accurately** |
| QA fixer | sonnet | Code fixes need same quality as build |
| Creative review (Jony, Maya, Aaron) | haiku | Subjective review, no code |
| Board review (Jensen, Oprah, Warren, Shonda) | haiku | Strategic opinions, no code |
| Board consolidation | haiku | Summarization |
| Ship | haiku | Mechanical — git commit, merge, push |
| Marcus retrospective | haiku | Reflection, no code |

## Implementation

### Change 1: Update `runAgent()` signature in `pipeline.ts`

Add an optional `model` parameter to `runAgent()` and pass it through to `query()`:

```typescript
// Current signature:
export async function runAgent(name: string, prompt: string, maxTurns = DEFAULT_MAX_TURNS, phase = ""): Promise<string>

// New signature:
export async function runAgent(name: string, prompt: string, maxTurns = DEFAULT_MAX_TURNS, phase = "", model?: string): Promise<string>
```

In `runAgentCore()`, pass the model to `query()`:

```typescript
for await (const message of query({
  prompt,
  options: {
    maxTurns,
    allowedTools: ALLOWED_TOOLS,
    permissionMode: "bypassPermissions" as const,
    cwd: REPO_PATH,
    model: model || undefined,  // undefined = system default (Sonnet)
  },
})) {
```

### Change 2: Pass model in each phase function

In `runDebate()`:
```typescript
// R1 — Sonnet (strategy)
await Promise.all([
  runAgent("steve-jobs-r1", steveJobsDebateR1(prd, r1Steve), DEFAULT_MAX_TURNS, "debate", "sonnet"),
  runAgent("elon-musk-r1", elonMuskDebateR1(prd, r1Elon), DEFAULT_MAX_TURNS, "debate", "sonnet"),
]);
// R2 — Sonnet
await Promise.all([
  runAgent("steve-jobs-r2", steveJobsDebateR2(...), DEFAULT_MAX_TURNS, "debate", "sonnet"),
  runAgent("elon-musk-r2", elonMuskDebateR2(...), DEFAULT_MAX_TURNS, "debate", "sonnet"),
]);
// Rick Rubin — Haiku
await runAgent("rick-rubin-essence", rickRubinEssence(...), 15, "debate", "haiku");
// Phil Jackson — Sonnet
await runAgent("phil-jackson-consolidation", philJacksonConsolidation(...), DEFAULT_MAX_TURNS, "debate", "sonnet");
```

In `runPlan()`:
```typescript
await runAgent("planner", `...`, DEFAULT_MAX_TURNS, "plan", "sonnet");
await runAgent("sara-blakely-gutcheck", saraBlakelyGutCheck(...), 15, "plan", "haiku");
```

In `runBuild()`:
```typescript
await runAgent("builder", `...`, DEFAULT_MAX_TURNS, "build", "sonnet");
```

In `runQA()`:
```typescript
await runAgent(`margaret-hamilton-qa-${passNumber}`, margaretHamiltonQA(...), DEFAULT_MAX_TURNS, "qa", "sonnet");
await runAgent("qa-fixer", `...`, DEFAULT_MAX_TURNS, "qa", "sonnet");
```

In `runCreativeReview()`:
```typescript
// All haiku — subjective review, no code
await Promise.all([
  runAgent("jony-ive-review", ..., 15, "creative", "haiku"),
  runAgent("maya-angelou-review", ..., 15, "creative", "haiku"),
]);
await runAgent("aaron-sorkin-demo", ..., 20, "creative", "haiku");
```

In `runBoardReview()`:
```typescript
// All haiku — strategic opinions
// Batch 1
await Promise.all([
  runAgent("jensen-huang-review", ..., 20, "board", "haiku"),
  runAgent("oprah-winfrey-review", ..., 20, "board", "haiku"),
]);
// Batch 2
await Promise.all([
  runAgent("warren-buffett-review", ..., 20, "board", "haiku"),
  runAgent("shonda-rhimes-review", ..., 20, "board", "haiku"),
]);
await runAgent("board-consolidation", `...`, DEFAULT_MAX_TURNS, "board", "haiku");
```

In `runShip()`:
```typescript
await runAgent("shipper", `...`, DEFAULT_MAX_TURNS, "ship", "haiku");
await runAgent("marcus-aurelius-retro", ..., 20, "ship", "haiku");
```

### Change 3: Update CLAUDE.md

Remove the "always run on haiku" rule. Replace with:

```markdown
## Model Selection
- **Sonnet** for code-generating phases: debate, plan, build, QA
- **Haiku** for opinion/review phases: creative review, board review, ship, retrospective
- Never use Haiku for code generation — it hallucinates framework APIs
```

### Change 4: Log the model

In `runAgentCore()`, log which model is being used:

```typescript
log(`AGENT START: ${name} (model: ${model || "default"})`);
```

## Success Criteria

- [ ] `runAgent()` accepts a `model` parameter
- [ ] Every `runAgent()` call in pipeline.ts passes an explicit model
- [ ] Build and QA phases use "sonnet"
- [ ] Creative/board/ship phases use "haiku"
- [ ] Agent start log shows model: `AGENT START: builder (model: sonnet)`
- [ ] CLAUDE.md updated to reflect model selection policy
- [ ] TypeScript compiles
- [ ] Committed to great-minds-plugin, pushed
- [ ] `systemctl restart shipyard-daemon.service`

## Files to Modify

- `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` — add model param, pass to all runAgent calls
- `/home/agent/shipyard-ai/CLAUDE.md` — update model selection section

## Notes

The Claude Agent SDK `query()` options may use `model` as a string like "claude-sonnet-4-6" or "claude-haiku-4-5-20251001". Check the SDK types to confirm the exact field name and accepted values. If the SDK uses full model IDs, map "sonnet" → "claude-sonnet-4-6" and "haiku" → "claude-haiku-4-5-20251001" in `runAgentCore()`.
