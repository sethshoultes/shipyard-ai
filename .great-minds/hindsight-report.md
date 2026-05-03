# Hindsight Report
**Generated:** 2026-05-03T18:17:20.088Z

## Summary
Risk: HIGH. 15 high-churn files, 20 bug-associated files, 14 uncommitted changes. Tread carefully on flagged files.

## Recent Changes
- e64b7b6 daemon: auto-commit 2 files
- e67de86 Ship github-issue-sethshoultes-shipyard-ai-91: all deliverables + retrospective
- fb58d61 micromanager: dirty auto-reconcile
- 19d56cb Fix placeholders: reword JSDoc comment and implement real parser tests
- dd379af daemon: auto-commit after build phase for github-issue-sethshoultes-shipyard-ai-91
- de204de micromanager: dirty auto-reconcile
- 9db2d12 micromanager: dirty auto-reconcile
- ca1028f daemon: auto-commit 1 files
- 033b6fa daemon: auto-commit after build phase for github-issue-sethshoultes-shipyard-ai-90
- 3cc9d94 micromanager: dirty auto-reconcile

## High-Churn Files
- `.daemon-queue.json` (162 changes)
- `.planning/sara-blakely-review.md` (105 changes)
- `.great-minds/hindsight-report.md` (60 changes)
- `.planning/phase-1-plan.md` (53 changes)
- `.planning/REQUIREMENTS.md` (50 changes)
- `plugins/membership/src/sandbox-entry.ts` (33 changes)
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-91.md` (25 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-90.md` (24 changes)
- `pipeline/auto/cagan-dispatch-history.json` (24 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-98.md` (23 changes)
- `.daemon-retry-state.json` (16 changes)
- `HEARTBEAT.md` (13 changes)
- `.github-intake-state.json` (12 changes)
- `website/src/app/layout.tsx` (11 changes)

## Bug-Associated Files
- `deliverables/github-issue-sethshoultes-shipyard-ai-91/promptfolio/src/generator/build.js`
- `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/parser.test.mjs`
- `deliverables/github-issue-sethshoultes-shipyard-ai-91/tests/test-parser.sh`
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

## Uncommitted State
```
M .daemon-queue.json
 M rounds/github-issue-sethshoultes-shipyard-ai-98/decisions.md
 M rounds/github-issue-sethshoultes-shipyard-ai-98/essence.md
 M rounds/github-issue-sethshoultes-shipyard-ai-98/round-1-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-98/round-1-steve.md
 M rounds/github-issue-sethshoultes-shipyard-ai-98/round-2-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-98/round-2-steve.md
?? .agent-logs/debate/elon-musk-r1-1777831679365.jsonl
?? .agent-logs/debate/elon-musk-r2-1777831837874.jsonl
?? .agent-logs/debate/phil-jackson-consolidation-1777832005241.jsonl
?? .agent-logs/debate/rick-rubin-essence-1777831947251.jsonl
?? .agent-logs/debate/steve-jobs-r1-1777831679348.jsonl
?? .agent-logs/debate/steve-jobs-r2-1777831837864.jsonl
?? prds/github-issue-sethshoultes-shipyard-ai-91.md
```

---
*Let this guide your hands. The files marked here have stories—some of them cautionary tales.*
