# PRD: Expand GitHub Intake to Include p2 Issues

> Priority: p0

## Problem

The GitHub intake in `health.ts` only polls for `p0` and `p1` labeled issues. Issues #34 (SEODash) and #35 (CommerceKit) are labeled `p2` and will never be auto-queued. The intake should grab all actionable priority labels.

## Fix

In `/home/agent/great-minds-plugin/daemon/src/health.ts`, in the `pollGitHubIssuesWithLabels()` function, add a `p2` label query alongside the existing `p0` and `p1` queries.

Current code (around line 187):
```typescript
const p0Issues = fetchByLabel("p0");
const p1Issues = fetchByLabel("p1");
```

Fixed:
```typescript
const p0Issues = fetchByLabel("p0");
const p1Issues = fetchByLabel("p1");
const p2Issues = fetchByLabel("p2");
// Deduplicate by number
const seen = new Set<number>();
const parsed = [...p0Issues, ...p1Issues, ...p2Issues].filter(issue => {
  if (seen.has(issue.number)) return false;
  seen.add(issue.number);
  return true;
});
```

Also update the log message from "p0/p1" to "p0/p1/p2":
```typescript
log(`INTAKE: Found ${issues.length} p0/p1/p2 issue(s) across ${GITHUB_REPOS.length} repos`);
```

## Success Criteria
- [ ] Intake polls for p0, p1, AND p2 issues
- [ ] Issues #34 and #35 are auto-converted to PRDs on next poll
- [ ] TypeScript compiles
- [ ] Committed to great-minds-plugin, pushed
- [ ] `systemctl restart shipyard-daemon.service` after push

## Files to Modify
- `/home/agent/great-minds-plugin/daemon/src/health.ts`

## Notes
One targeted change. Do not refactor or reorganize.
