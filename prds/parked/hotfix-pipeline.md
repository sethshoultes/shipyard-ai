# PRD: Add Hotfix Pipeline Path — Skip Ceremony for Bug Fixes

> Priority: p1

## Problem

The daemon pipeline runs every PRD through the full ceremony: debate (Steve + Elon × 2 rounds + Rick Rubin + Phil Jackson) → plan → build → QA × 2 → creative review → board review → ship. This takes 30-60+ minutes and is designed for new features.

For bug fixes and config changes (like fixing a wrangler.jsonc binding or changing an entrypoint path), this is overkill. The builder agent consistently hangs at the 20-minute timeout because the investigation-heavy PRDs spend all their time reading docs instead of making the 1-2 line fix.

**Evidence:**
- `membership-production-fix` — builder hung at 20min, 0 files produced
- `membership-v2-hung` — builder hung at 20min, 0 files produced
- Both were config/deploy fixes that needed <10 lines changed

## Solution

Add a `hotfix` pipeline path triggered by `priority: p0` issues or PRDs with a `hotfix: true` flag. Hotfix path:

```
plan → build → QA × 1 → ship
```

No debate. No creative review. No board review. One QA pass instead of two.

## Implementation

### 1. Add hotfix detection in `pipeline.ts`

In `runPipeline()`, check if the PRD contains `hotfix: true` in frontmatter or if the GitHub issue label includes `hotfix`:

```typescript
export async function runPipeline(prdFile: string, project: string, isHotfix = false): Promise<void> {
```

### 2. Add `isHotfix` detection in `daemon.ts`

When a PRD is picked up or a GitHub issue is converted, check for hotfix signals:

```typescript
function detectHotfix(prdContent: string): boolean {
  // Check frontmatter
  if (/^hotfix:\s*true/m.test(prdContent)) return true;
  // Check if it's a pure config/fix PRD (no new features)
  if (/^#.*\b(fix|hotfix|patch|config)\b/im.test(prdContent)) return true;
  return false;
}
```

### 3. Skip phases in `runPipeline()` when hotfix

```typescript
if (!isHotfix) {
  await runDebate(prdFile, project);
  // ... existing debate code
}

// Plan + Build always run
await runPlan(project);
await runBuild(project);

// QA — 1 pass for hotfix, 2 for features
await runQA(project, 1);
if (!isHotfix) {
  await runQA(project, 2);
  await runCreativeReview(project);
  await runBoardReview(project);
}

await runShip(project);
```

### 4. Increase builder timeout for hotfix OR reduce maxTurns

For hotfixes, the builder should be faster because scope is tiny. Two options:
- Increase `AGENT_TIMEOUT_MS` to 30min for hotfix builds (more time to investigate)
- OR reduce `maxTurns` to 15 (force agent to act fast, not explore)

Recommend: keep timeout at 20min but give builder a tighter prompt that skips the agency-execute skill and just says "make these specific changes."

### 5. Simpler builder prompt for hotfixes

Instead of loading the full agency-execute skill, hotfix builder gets a direct prompt:

```typescript
if (isHotfix) {
  await runAgent("builder", `You are fixing a bug. Read the PRD at ${prdPath}.
Make the specific changes described. Do NOT explore the codebase beyond what's needed.
Do NOT use wave-based execution. Just read the files, make the fix, and commit.
Read CLAUDE.md first for project rules. Read BANNED-PATTERNS.md if it exists.
Commit on a feature branch: git checkout -b hotfix/${project} && git add -A && git commit.`, 
    15, "build", "sonnet");
}
```

## Files to Modify

- `daemon/src/pipeline.ts` — add `isHotfix` parameter, skip phases conditionally, add simpler builder prompt
- `daemon/src/daemon.ts` — add `detectHotfix()`, pass flag to `runPipeline()`
- `daemon/src/config.ts` — optionally add `HOTFIX_AGENT_TIMEOUT_MS`

## Success Criteria

- [ ] PRDs with `hotfix: true` or fix/patch in title skip debate, creative, and board phases
- [ ] Hotfix pipeline completes in <15 minutes for simple fixes
- [ ] Builder uses direct prompt (no agency-execute skill) for hotfixes
- [ ] Single QA pass for hotfixes
- [ ] Full pipeline unchanged for feature PRDs
- [ ] Committed and pushed

## Notes

Do NOT change the full pipeline. Only ADD the hotfix path. Feature PRDs should still get the full ceremony. This is purely additive.
