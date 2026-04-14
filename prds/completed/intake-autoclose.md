# PRD: Auto-Close GitHub Issues After Pipeline Ships

> Priority: p1

## Problem

When the daemon's GitHub intake converts an issue to a PRD and the pipeline ships it, the original GitHub issue stays open. Issues #30-33 all shipped but remained open until manually closed. The pipeline should auto-close the source issue after a successful ship.

## CRITICAL: Do NOT Start Over

The intake system already works. The `convertIssueToPRD()` function in `health.ts` embeds the repo and issue number in the PRD filename (`github-issue-{repo}-{number}.md`). The pipeline's ship phase in `pipeline.ts` already knows the project slug. Build on what exists.

## Requirements

### 1. Extract Issue Metadata from PRD Filename

In `pipeline.ts`, after a successful ship (in the `runShip` or `runPipeline` function, after archiving the PRD to `completed/`), check if the PRD filename matches the GitHub intake pattern:

```typescript
const ghMatch = prdFile.match(/^github-issue-(.+)-(\d+)\.md$/);
if (ghMatch) {
  const repoSlug = ghMatch[1]; // e.g., "sethshoultes-shipyard-ai"
  const issueNumber = ghMatch[2]; // e.g., "32"
  const repo = repoSlug.replace(/-/g, '/').replace(/^(\w+)\//, '$1/'); // restore "sethshoultes/shipyard-ai"
  // Close the issue
}
```

Note: The repo slug was sanitized by `sanitizeRepoSlug()` in health.ts which replaces `/` with `-`. So `sethshoultes/shipyard-ai` becomes `sethshoultes-shipyard-ai`. To reverse: the first `-` after the owner separates owner from repo. Use:
```typescript
const parts = repoSlug.split('-');
// Find the split point — owner is first segment, repo is rest
// Since GitHub owners can't have hyphens but repos can, try owner/rest pattern
const repo = `${parts[0]}/${parts.slice(1).join('-')}`;
```

Actually, simpler: just read the PRD file content — it contains `> Auto-generated from GitHub issue {repo}#{number}` on line 2. Parse that instead:
```typescript
const prdContent = readFileSync(resolve(PRDS_DIR, 'completed', prdFile), 'utf-8');
const issueMatch = prdContent.match(/Auto-generated from GitHub issue (.+)#(\d+)/);
if (issueMatch) {
  const repo = issueMatch[1]; // "sethshoultes/shipyard-ai"
  const number = issueMatch[2]; // "32"
  closeGitHubIssue(repo, number, project);
}
```

### 2. Close the Issue with a Comment

Add a new function in `health.ts` (or `pipeline.ts`):

```typescript
function closeGitHubIssue(repo: string, issueNumber: string, project: string): void {
  try {
    execSync(
      `gh issue close ${issueNumber} --repo "${repo}" --comment "Shipped via Great Minds pipeline. Project: ${project}"`,
      { encoding: "utf-8", timeout: 15_000 }
    );
    log(`INTAKE: Closed GitHub issue ${repo}#${issueNumber}`);
  } catch (err) {
    log(`INTAKE: Failed to close ${repo}#${issueNumber}: ${err}`);
    // Non-fatal — don't crash the pipeline over a GitHub comment
  }
}
```

### 3. Call It After Successful Ship

In `pipeline.ts`, in the `runPipeline()` function, after the PRD is archived to `completed/`, call the close function.

## Success Criteria

- [ ] After a GitHub-sourced PRD ships, the original issue is closed with a comment
- [ ] Non-GitHub PRDs (manually dropped) are unaffected
- [ ] Failed pipelines do NOT close the issue
- [ ] Close failure is logged but does not crash the pipeline
- [ ] TypeScript compiles
- [ ] Committed to great-minds-plugin, pushed
- [ ] `systemctl restart shipyard-daemon.service`

## Files to Modify

- `/home/agent/great-minds-plugin/daemon/src/pipeline.ts` — add close logic after archive step
- `/home/agent/great-minds-plugin/daemon/src/health.ts` — optionally add `closeGitHubIssue()` function (or put it in pipeline.ts)

## Notes

Keep it simple. Parse the PRD content for repo/number, call `gh issue close`, log the result, don't crash on failure.
