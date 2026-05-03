# Hindsight Report
**Generated:** 2026-05-03T19:56:08.641Z

## Summary
Risk: HIGH. 15 high-churn files, 20 bug-associated files, 16 uncommitted changes. Tread carefully on flagged files.

## Recent Changes
- 11b47f1 daemon: auto-commit 2 files
- cdd689d Ship build-model-canary-glm: all deliverables + retrospective
- 08f63ad micromanager: dirty auto-reconcile
- 35eaff6 fix: remove all placeholder/TODO/FIXME markers from canary deliverables
- eddd835 daemon: auto-commit after build phase for build-model-canary-glm
- cbbf54a micromanager: dirty auto-reconcile
- 9626f74 micromanager: dirty auto-reconcile
- 9da7099 daemon: auto-commit 11 files
- ee2d228 micromanager: dirty auto-reconcile
- 9456732 micromanager: dirty auto-reconcile

## High-Churn Files
- `.daemon-queue.json` (166 changes)
- `.planning/sara-blakely-review.md` (107 changes)
- `.great-minds/hindsight-report.md` (65 changes)
- `.planning/phase-1-plan.md` (53 changes)
- `.planning/REQUIREMENTS.md` (51 changes)
- `plugins/membership/src/sandbox-entry.ts` (33 changes)
- `plugins/eventdash/src/sandbox-entry.ts` (28 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-91.md` (26 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-90.md` (24 changes)
- `pipeline/auto/cagan-dispatch-history.json` (24 changes)
- `prds/github-issue-sethshoultes-shipyard-ai-98.md` (23 changes)
- `.daemon-retry-state.json` (17 changes)
- `HEARTBEAT.md` (13 changes)
- `.github-intake-state.json` (12 changes)
- `website/src/app/layout.tsx` (11 changes)

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
 M rounds/github-issue-sethshoultes-shipyard-ai-90/decisions.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/essence.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-1-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-1-steve.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-2-elon.md
 M rounds/github-issue-sethshoultes-shipyard-ai-90/round-2-steve.md
?? .agent-logs/debate/elon-musk-r1-1777837789003.jsonl
?? .agent-logs/debate/elon-musk-r2-1777837902187.jsonl
?? .agent-logs/debate/phil-jackson-consolidation-1777838052997.jsonl
?? .agent-logs/debate/rick-rubin-essence-1777838010426.jsonl
?? .agent-logs/debate/steve-jobs-r1-1777837788993.jsonl
?? .agent-logs/debate/steve-jobs-r2-1777837902179.jsonl
?? prds/github-issue-sethshoultes-shipyard-ai-90.md
?? prds/github-issue-sethshoultes-shipyard-ai-91.md
?? prds/github-issue-sethshoultes-shipyard-ai-98.md
```

---
*Let this guide your hands. The files marked here have stories—some of them cautionary tales.*
