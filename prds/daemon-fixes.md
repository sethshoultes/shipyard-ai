# PRD: Daemon Stability Fixes — Auto-Commit + GitHub Intake Label Bug

> Priority: p0
> Affects: great-minds-plugin/daemon/src/health.ts

## Problem

Two bugs in the daemon's health.ts are causing persistent operational failures.

### Bug 1: gitAutoCommit() is never called

`gitAutoCommit()` is defined in `health.ts` (around line 185) but is **never invoked anywhere**. The daemon heartbeat (`runHeartbeat()`) checks git repos and logs dirty file counts but does nothing about them. Result: dirty files and unpushed commits accumulate indefinitely — currently `great-minds` has 3 dirty files, `great-minds-plugin` has 3 dirty + 14 unpushed. This has been the permanent state for days.

### Bug 2: GitHub intake --label syntax is broken

In `pollGitHubIssuesWithLabels()`, the gh CLI call uses:
```bash
gh issue list --label p0,p1
```

On this server's version of gh CLI, `--label p0,p1` (comma-separated single flag) returns **zero results**. The correct syntax requires separate flags:
```bash
gh issue list --label "p0"   # works — returns p0 issues
gh issue list --label "p1"   # works — returns p1 issues
```

This is why the intake always logs "Found 0 p0/p1 issue(s)" despite open p0/p1 issues existing in the repos. Issues #32 (ReviewPulse) and #33 (FormForge) have never been picked up automatically as a result.

## Files to Modify

Both fixes are in one file: `/home/agent/great-minds-plugin/daemon/src/health.ts`

## Fix 1: Call gitAutoCommit() from runHeartbeat()

Add a call to `gitAutoCommit()` at the end of `runHeartbeat()`, after the git repo checks. The function already has the correct logic — it just needs to be called.

```typescript
// At the END of runHeartbeat(), after the git repo loop:
// Auto-commit any dirty repos
gitAutoCommit();
```

That's it. The function handles everything: checks for dirty files, commits, pushes.

## Fix 2: Fix --label syntax in pollGitHubIssuesWithLabels()

Replace the single `--label p0,p1` call with two separate queries merged together:

```typescript
// BEFORE (broken):
const output = execSync(
  `gh issue list --repo "${repo}" --state open --label p0,p1 --json number,title,body,labels,author,createdAt,url 2>&1`,
  { encoding: "utf-8", timeout: 15_000 }
);
const parsed = JSON.parse(output || "[]");

// AFTER (fixed):
const fetchByLabel = (label: string) => {
  try {
    const out = execSync(
      `gh issue list --repo "${repo}" --state open --label "${label}" --json number,title,body,labels,author,createdAt,url 2>&1`,
      { encoding: "utf-8", timeout: 15_000 }
    );
    return JSON.parse(out || "[]") as any[];
  } catch {
    return [];
  }
};
const p0Issues = fetchByLabel("p0");
const p1Issues = fetchByLabel("p1");
// Deduplicate by number
const seen = new Set<number>();
const parsed = [...p0Issues, ...p1Issues].filter(issue => {
  if (seen.has(issue.number)) return false;
  seen.add(issue.number);
  return true;
});
```

## Success Criteria

- [ ] `great-minds` and `great-minds-plugin` repos have 0 dirty files within one heartbeat cycle (5 min) after deploy
- [ ] `gh issue list` with `--label "p0"` AND `--label "p1"` both return results in tests
- [ ] Intake log shows issues found (not "Found 0") on next poll
- [ ] Issues #32 and #33 are converted to PRDs automatically by the intake
- [ ] Both code changes committed to `great-minds-plugin` repo and pushed

## CRITICAL: Commit to the right repo

These changes are in `great-minds-plugin/daemon/src/health.ts` — NOT in `shipyard-ai`. After making changes:

```bash
cd /home/agent/great-minds-plugin
git add daemon/src/health.ts
git commit -m "fix: call gitAutoCommit in heartbeat; fix gh label syntax for intake"
git push
```

Then restart the daemon so the changes take effect:
```bash
systemctl restart shipyard-daemon.service
```

## Notes

Do not refactor, rename, or reorganize. Two targeted changes: one added function call, one replaced query block.
