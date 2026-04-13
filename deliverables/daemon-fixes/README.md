# Daemon Fixes Deliverable

## Overview

This deliverable contains two surgical bug fixes for the daemon's health.ts file.

## Fix Location

**The code changes live in a different repository:**

```
/home/agent/great-minds-plugin/daemon/src/health.ts
```

This deliverables directory serves as a reference pointer. The actual implementation is in the `great-minds-plugin` repo, not `shipyard-ai`.

## Fixes Implemented

### Fix 1: Wire up gitAutoCommit() in runHeartbeat()

- **Location:** health.ts line 417
- **Change:** Added `gitAutoCommit();` call at the end of `runHeartbeat()`
- **Purpose:** Ensures dirty files and unpushed commits are automatically handled each heartbeat cycle

### Fix 2: Fix --label syntax in pollGitHubIssuesWithLabels()

- **Location:** health.ts lines 162-222
- **Change:** Replaced single `--label p0,p1` call with two separate queries + deduplication
- **Purpose:** The gh CLI on this server requires separate `--label` flags; comma-separated syntax returns zero results

## Implementation Details

### fetchByLabel() Helper (lines 167-196)

```typescript
const fetchByLabel = (label: string): any[] => {
  try {
    const output = execSync(
      `gh issue list --repo "${repo}" --state open --label "${label}" --json ...`,
      { encoding: "utf-8", timeout: 15_000 }
    );
    return JSON.parse(output || "[]");
  } catch (err) { ... }
};

const p0Issues = fetchByLabel("p0");
const p1Issues = fetchByLabel("p1");

// Deduplicate by issue number
const seen = new Set<number>();
const merged = [...p0Issues, ...p1Issues].filter((issue) => {
  if (seen.has(issue.number)) return false;
  seen.add(issue.number);
  return true;
});
```

## Commit Reference

- **Commit:** 01c0daa
- **Repository:** great-minds-plugin
- **Message:** fix: call gitAutoCommit in heartbeat; fix gh label syntax for intake

## Deployment Checklist

- [x] Code changes implemented in health.ts
- [x] Commit created in great-minds-plugin repo
- [ ] Push to remote origin
- [ ] Restart daemon service: `systemctl restart shipyard-daemon.service`
- [ ] Verify fix: wait one heartbeat cycle (5 min), check logs

## Related Documents

- PRD: `/home/agent/shipyard-ai/prds/daemon-fixes.md`
- Decisions: `/home/agent/shipyard-ai/rounds/daemon-fixes/decisions.md`
- QA Report: `/home/agent/shipyard-ai/rounds/daemon-fixes/qa-pass-1.md`
