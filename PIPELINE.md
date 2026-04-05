# Shipyard AI — Great Minds Pipeline

**Rule: Every build uses this pipeline. No exceptions.**

## Pipeline Stages

```
PRD → /agency-debate → /agency-plan → /agency-execute → /agency-verify → /agency-ship
```

### 1. /agency-debate
- Steve Jobs + Elon Musk stake positions (parallel)
- 2 rounds max
- Rick Rubin essence check: "What are the 3 things that matter?"
- Output: rounds/{project}/round-1, round-2, rick-rubin-essence

### 2. /agency-plan  
- Research: codebase scout, requirements analyst, risk scanner (parallel haiku)
- Generate XML task plans with waves
- Each task: requirement trace, context files, steps, verification, dependencies
- Wave 1 = independent tasks, Wave 2 = depends on Wave 1
- Output: engineering/phase-{N}-plan.md

### 3. /agency-execute
- Pre-flight: clean git, correct branch, build passes
- Spawn haiku sub-agents per task (parallel within wave)
- Fresh context per agent (no accumulated context rot)
- Atomic commits per task
- Output: engineering/phase-{N}-execution.md

### 4. /agency-verify
- Build + typecheck + lint
- Test suite
- Requirements acceptance (check each requirement)
- Spawn debug agents for failures
- Output: engineering/phase-{N}-verification.md
- Recommendation: SHIP / FIX FIRST / BLOCK

### 5. /agency-qa
- Margaret Hamilton full pipeline
- Build, tests, live site, API smoke, accessibility, security
- Output: QA report

### 6. /agency-review
- Jensen Huang board review
- Strategic assessment + one actionable recommendation
- Output: board-review-{N}.md

### 7. /agency-ship
- Pre-ship gate (verify = SHIP)
- Merge feature branches to main
- Update STATUS.md, SCOREBOARD
- Write ship report
- Save learnings to memory
- Clean up branches
- Verify deploy

## Agent Roster

| Agent | Role | Model |
|-------|------|-------|
| Steve Jobs | Creative Director | Sonnet (via Agent) |
| Elon Musk | Engineering Director | Sonnet (via Agent) |
| Rick Rubin | Essence Check | Haiku |
| Margaret Hamilton | QA Director | Haiku |
| Jensen Huang | Board Reviewer | Haiku |
| Jony Ive | Visual Designer | Haiku |
| Maya Angelou | Copywriter | Haiku |
| Sara Blakely | Growth Strategist | Haiku |
| Rick Rubin | Creative Direction | Haiku |
| Phil Jackson | Orchestrator | Admin terminal |

## Reference

Full skill definitions: /home/agent/great-minds-plugin/skills/
