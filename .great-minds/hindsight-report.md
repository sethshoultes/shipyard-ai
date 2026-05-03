# Hindsight Report
**Generated:** 2026-05-03T23:11:57.828Z

## Summary
Risk: HIGH. 15 high-churn files, 20 bug-associated files, 14 uncommitted changes. Tread carefully on flagged files.

## Recent Changes
- a97e336 daemon: auto-commit 2 files
- 7570fa2 Ship CODE-TEMPLATE: all deliverables + retrospective
- 4959a81 Fix QA placeholder scanner false-positives by rephrasing rule text
- cf3d593 daemon: auto-commit after build phase for CODE-TEMPLATE
- 9dec0a3 micromanager: dirty auto-reconcile
- 103d2ee micromanager: dirty auto-reconcile
- a8ea914 daemon: auto-commit 1 files
- a519495 daemon: auto-commit after build phase for github-issue-sethshoultes-shipyard-ai-98
- fd998c1 micromanager: dirty auto-reconcile
- dc2927d micromanager: dirty auto-reconcile

## High-Churn Files
- `.daemon-queue.json` (175 changes)
- `.planning/sara-blakely-review.md` (112 changes)
- `.great-minds/hindsight-report.md` (71 changes)
- `.planning/phase-1-plan.md` (53 changes)
- `.planning/REQUIREMENTS.md` (51 changes)
- `plugins/membership/src/sandbox-entry.ts` (33 changes)
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-91.md` (27 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-90.md` (26 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-98.md` (24 changes)
- `pipeline/auto/cagan-dispatch-history.json` (24 changes)
- `.daemon-retry-state.json` (20 changes)
- `data/costs.db` (15 changes)
- `HEARTBEAT.md` (13 changes)
- `rounds/github-issue-sethshoultes-shipyard-ai-98/round-1-steve.md` (12 changes)

## Bug-Associated Files
- `deliverables/CODE-TEMPLATE/README.md`
- `deliverables/CODE-TEMPLATE/codex.md`
- `deliverables/CODE-TEMPLATE/examples/before-after.md`
- `deliverables/CODE-TEMPLATE/parser/errors.js`
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

## Uncommitted State
```
M .daemon-queue.json
 M data/costs.db
 M prds/lint-failed/github-issue-sethshoultes-shipyard-ai-98.lint-report.md
 M rounds/standalone-apps-portfolio-v3/round-1-steve.md
 M rounds/standalone-apps-portfolio-v3/round-2-elon.md
?? .agent-logs/debate/elon-musk-r1-1777849405846.jsonl
?? .agent-logs/debate/elon-musk-r2-1777849508103.jsonl
?? .agent-logs/debate/phil-jackson-consolidation-1777849715994.jsonl
?? .agent-logs/debate/rick-rubin-essence-1777849682940.jsonl
?? .agent-logs/debate/steve-jobs-r1-1777849405835.jsonl
?? .agent-logs/debate/steve-jobs-r2-1777849508094.jsonl
?? rounds/standalone-apps-portfolio-v3/decisions.md
?? rounds/standalone-apps-portfolio-v3/essence.md
?? rounds/standalone-apps-portfolio-v3/round-2-steve.md
```

---
*Let this guide your hands. The files marked here have stories—some of them cautionary tales.*
