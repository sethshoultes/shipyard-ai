# PRD: Update SCOREBOARD.md with Complete Pipeline Statistics

> Priority: p1

## Problem

SCOREBOARD.md is missing stats for many shipped projects. The daemon has completed 25+ PRDs but the scoreboard only reflects a handful. Every completed project should have its metrics recorded.

## Requirements

Read the completed PRDs list and rounds directories to compile accurate stats for every shipped project:

```bash
ls /home/agent/shipyard-ai/prds/completed/
ls /home/agent/shipyard-ai/rounds/
```

For each project that has rounds (debate transcripts, QA reports, board reviews, retrospectives), extract:
- **Project name and date shipped**
- **Pipeline duration** (from PIPELINE START to PIPELINE COMPLETE in daemon logs, or estimate from round file timestamps)
- **QA verdict** (PASS on first try, or how many BLOCK cycles)
- **Board verdict** (PROCEED/HOLD/REJECT and composite score if available)
- **Key deliverables** (list files in deliverables/{project}/)
- **Agent count** (how many agents ran — count round files)

Update `SCOREBOARD.md` in the repo root with a comprehensive table of ALL completed projects. Format:

```markdown
# Shipyard AI — Scoreboard

## Pipeline Stats
- **Total PRDs Shipped:** [count from completed/]
- **Total Failed:** [count from failed/]
- **Success Rate:** [shipped / (shipped + failed) * 100]%
- **Average Pipeline Duration:** [if available]

## Completed Projects

| Project | Shipped | Duration | QA | Board | Deliverables |
|---------|---------|----------|-----|-------|-------------|
| ... | ... | ... | ... | ... | ... |

## Failed Projects

| Project | Reason |
|---------|--------|
| ... | ... |
```

Read the actual data. Do not guess or use placeholder values. If a stat isn't available for a project, write "—" not a made-up number.

Also update `STATUS.md` to reflect the current idle state with accurate counts.

## Files to Modify

- `SCOREBOARD.md` — comprehensive update with all projects
- `STATUS.md` — update current state and counts

## Success Criteria

- [ ] Every project in `prds/completed/` has a row in the scoreboard
- [ ] Stats are derived from actual files, not guessed
- [ ] Failed projects listed with reason if available
- [ ] Committed and pushed
