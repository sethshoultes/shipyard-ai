# PRD: Stagger Board + Creative Review Phases to Reduce Memory Pressure

> Priority: p1
> Affects: great-minds-plugin/daemon/src/pipeline.ts

## Problem

The board review phase runs 4 Claude agents concurrently (Jensen, Oprah, Warren, Shonda), and creative review runs 3 concurrently (Jony, Maya, Sorkin). Combined with the Claude SDK overhead per agent, peak memory has historically spiked to 2.3GB — enough to trigger OOM kills on this 8GB droplet when other pipeline work is in flight or memory is fragmented. The server has 48 documented OOM restarts as evidence.

Swap has been added as a first mitigation, but swap is a safety net — not a plan. Burning swap under CPU-bound workloads (Node.js + Claude SDK) thrashes disk and slows every agent. The correct fix is to cap concurrent agent fan-out.

## Fix: Batch parallel agents in groups of 2

In `pipeline.ts`, two functions currently use `Promise.all` with 3–4 agents. Change both to run in batches of 2.

### File to modify

`/home/agent/great-minds-plugin/daemon/src/pipeline.ts`

### Change 1: `runBoardReview()` — batch 4 into 2+2

Current:
```typescript
await Promise.all([
  runAgent("jensen-huang-review", ...),
  runAgent("oprah-winfrey-review", ...),
  runAgent("warren-buffett-review", ...),
  runAgent("shonda-rhimes-review", ...),
]);
```

Fixed — two sequential batches of two:
```typescript
// Batch 1: Jensen + Oprah
await Promise.all([
  runAgent("jensen-huang-review", jensenHuangBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-jensen.md")), 20),
  runAgent("oprah-winfrey-review", oprahWinfreyBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-oprah.md")), 20),
]);

// Batch 2: Warren + Shonda
await Promise.all([
  runAgent("warren-buffett-review", warrenBuffettBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-buffett.md")), 20),
  runAgent("shonda-rhimes-review", shondaRhimesBoardReview(project, delDir, prdPath, resolve(roundsDir, "board-review-shonda.md")), 20),
]);
```

### Change 2: `runCreativeReview()` — batch 3 into 2+1

Current:
```typescript
await Promise.all([
  runAgent("jony-ive-review", ...),
  runAgent("maya-angelou-review", ...),
  runAgent("aaron-sorkin-demo", ...),
]);
```

Fixed:
```typescript
// Batch 1: Jony + Maya (visual + copy)
await Promise.all([
  runAgent("jony-ive-review", jonyIveVisualReview(delDir, resolve(roundsDir, "review-jony-ive.md")), 15),
  runAgent("maya-angelou-review", mayaAngelouCopyReview(delDir, resolve(roundsDir, "review-maya-angelou.md")), 15),
]);

// Batch 2: Aaron solo (demo script is independent)
await runAgent("aaron-sorkin-demo", aaronSorkinDemoScript(project, delDir, resolve(roundsDir, "demo-script.md")), 20);
```

## Why not sequential?

Sequential would double pipeline wall-clock time for these phases. Batches of 2 roughly double the phase time vs. full parallel (from ~60s to ~120s per batch) while halving peak memory. That's the right tradeoff on an 8GB box.

## Success Criteria

- [ ] `pipeline.ts` shows the two batched blocks in `runBoardReview()` and `runCreativeReview()`
- [ ] TypeScript compiles
- [ ] Next full pipeline run logs show board review agents arriving in two waves (2 START, 2 DONE, 2 START, 2 DONE) instead of all 4 at once
- [ ] Peak RSS of the daemon process during board-review stays under 1.8GB (check with `ps -o rss`)
- [ ] Pipeline still completes end-to-end
- [ ] Changes committed to `great-minds-plugin` and pushed
- [ ] `systemctl restart shipyard-daemon.service` after push so changes take effect

## CRITICAL: Commit to the right repo

This is a `great-minds-plugin` change, NOT a `shipyard-ai` change:
```bash
cd /home/agent/great-minds-plugin
git add daemon/src/pipeline.ts
git commit -m "perf: batch board and creative reviews 2-at-a-time to cap memory"
git push
systemctl restart shipyard-daemon.service
```

## Notes

Do not restructure the pipeline, rename agents, or change agent prompts. Two targeted `Promise.all` splits. Nothing else.
