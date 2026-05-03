# Hindsight Report
**Generated:** 2026-05-03T22:36:17.504Z

## Summary
Risk: HIGH. 15 high-churn files, 20 bug-associated files, 15 uncommitted changes. Tread carefully on flagged files.

## Recent Changes
- a8ea914 daemon: auto-commit 1 files
- a519495 daemon: auto-commit after build phase for github-issue-sethshoultes-shipyard-ai-98
- fd998c1 micromanager: dirty auto-reconcile
- dc2927d micromanager: dirty auto-reconcile
- f6c176d micromanager: dirty auto-reconcile
- 9b3fe5f daemon: auto-commit 12 files
- 5e83e93 daemon: auto-commit 1 files
- 4560e3d daemon: auto-commit after build phase for github-issue-sethshoultes-shipyard-ai-98
- 3a51257 micromanager: dirty auto-reconcile
- a1cbc0f micromanager: dirty auto-reconcile

## High-Churn Files
- `.daemon-queue.json` (174 changes)
- `.planning/sara-blakely-review.md` (111 changes)
- `.great-minds/hindsight-report.md` (70 changes)
- `.planning/phase-1-plan.md` (53 changes)
- `.planning/REQUIREMENTS.md` (51 changes)
- `plugins/membership/src/sandbox-entry.ts` (33 changes)
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-91.md` (27 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-90.md` (26 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-98.md` (24 changes)
- `pipeline/auto/cagan-dispatch-history.json` (24 changes)
- `.daemon-retry-state.json` (20 changes)
- `HEARTBEAT.md` (13 changes)
- `rounds/github-issue-sethshoultes-shipyard-ai-98/round-1-steve.md` (12 changes)
- `.github-intake-state.json` (12 changes)

## Bug-Associated Files
- `deliverables/build-model-canary-glm/spec.md`
- `deliverables/build-model-canary-glm/tests/03-quality-audit.sh`
- `deliverables/build-model-canary-glm/todo.md`
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

## Uncommitted State
```
M .daemon-queue.json
 M .great-minds/hindsight-report.md
 M .planning/sara-blakely-review.md
 M data/costs.db
 D prds/github-issue-sethshoultes-shipyard-ai-98.md
?? .agent-logs/debate/elon-musk-r1-1777847277300.jsonl
?? .agent-logs/debate/elon-musk-r2-1777847345125.jsonl
?? .agent-logs/debate/phil-jackson-consolidation-1777847519718.jsonl
?? .agent-logs/debate/rick-rubin-essence-1777847446321.jsonl
?? .agent-logs/debate/steve-jobs-r1-1777847277292.jsonl
?? .agent-logs/debate/steve-jobs-r2-1777847345116.jsonl
?? .agent-logs/plan/planner-1777847624731.jsonl
?? .agent-logs/plan/sara-blakely-gutcheck-1777847750650.jsonl
?? prds/lint-failed/
?? rounds/CODE-TEMPLATE/
```

---
*Let this guide your hands. The files marked here have stories—some of them cautionary tales.*
