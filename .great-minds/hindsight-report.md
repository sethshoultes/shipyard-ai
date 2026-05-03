# Hindsight Report
**Generated:** 2026-05-03T16:22:36.833Z

## Summary
Risk: HIGH. 15 high-churn files, 20 bug-associated files, 16 uncommitted changes. Tread carefully on flagged files.

## Recent Changes
- 3e6cb89 micromanager: dirty auto-reconcile
- 19b9352 daemon: auto-commit 2 files
- f7c2e32 Ship prd-agentpress-2026-05-03: all deliverables + retrospective
- dd73ed7 micromanager: dirty auto-reconcile
- e95acb5 daemon: auto-commit after build phase for prd-agentpress-2026-05-03
- 2ec103a micromanager: dirty auto-reconcile
- 40cd837 micromanager: dirty auto-reconcile
- 405e860 micromanager: dirty auto-reconcile
- 9af54eb micromanager: dirty auto-reconcile
- 1cb47a0 daemon: auto-commit 1 files

## High-Churn Files
- `.daemon-queue.json` (157 changes)
- `.planning/sara-blakely-review.md` (101 changes)
- `.great-minds/hindsight-report.md` (55 changes)
- `.planning/phase-1-plan.md` (53 changes)
- `.planning/REQUIREMENTS.md` (50 changes)
- `plugins/membership/src/sandbox-entry.ts` (33 changes)
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-91.md` (24 changes)
- `pipeline/auto/cagan-dispatch-history.json` (24 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-90.md` (23 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-98.md` (22 changes)
- `.daemon-retry-state.json` (13 changes)
- `HEARTBEAT.md` (13 changes)
- `.github-intake-state.json` (12 changes)
- `website/src/app/layout.tsx` (11 changes)

## Bug-Associated Files
- `.agent-logs/build/build-reviewer-1777763565759.jsonl`
- `.agent-logs/build/build-setup-1777763234839.jsonl`
- `.agent-logs/build/build-setup-1777763272147.jsonl`
- `.agent-logs/build/builder-1777763365854.jsonl`
- `.agent-logs/plan/sara-blakely-gutcheck-1777763202887.jsonl`
- `.github/workflows/deploy-website.yml`
- `.great-minds/hindsight-report.md`
- `.planning/sara-blakely-review.md`
- `deliverables/daemon-fix-watcher-skip-loop/spec.md`
- `deliverables/daemon-fix-watcher-skip-loop/todo.md`
- `domains-test-cname.json`
- `domains-test-fail.json`
- `domains.json`
- `scripts/proof.js`
- `.daemon-queue.json`
- `deliverables/daemon-fix-watcher-skip-loop/tests/check-code-changes.sh`
- `deliverables/daemon-fix-watcher-skip-loop/tests/check-file-existence.sh`
- `deliverables/daemon-fix-watcher-skip-loop/tests/check-no-new-deps.sh`
- `deliverables/daemon-fix-watcher-skip-loop/tests/check-no-todos.sh`
- `deliverables/daemon-fix-watcher-skip-loop/tests/check-tests-pass.sh`

## Uncommitted State
```
M .daemon-queue.json
 M rounds/github-issue-sethshoultes-shipyard-ai-90/decisions.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/essence.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-1-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-1-steve.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-2-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-2-steve.md
?? .agent-logs/debate/elon-musk-r1-1777824864368.jsonl
?? .agent-logs/debate/elon-musk-r2-1777825064284.jsonl
?? .agent-logs/debate/phil-jackson-consolidation-1777825217499.jsonl
?? .agent-logs/debate/rick-rubin-essence-1777825185698.jsonl
?? .agent-logs/debate/steve-jobs-r1-1777824864359.jsonl
?? .agent-logs/debate/steve-jobs-r2-1777825064276.jsonl
?? prds/github-issue-sethshoultes-shipyard-ai-90.md
?? prds/github-issue-sethshoultes-shipyard-ai-91.md
?? prds/github-issue-sethshoultes-shipyard-ai-98.md
```

---
*Let this guide your hands. The files marked here have stories—some of them cautionary tales.*
