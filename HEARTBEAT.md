# Shipyard AI — Heartbeat & Cron Schedule

## Active Cron Jobs

| Job ID | Schedule | Agent | Description |
|--------|----------|-------|-------------|
| `c58bb85d` | `*/29 * * * *` | Phil Jackson | Dispatch cycle — read TASKS.md, find idle agents, assign next open task |
| `61e40285` | `17 * * * *` | Jensen Huang | Board review — assess commits, pipeline state, write to rounds/board-review-NNN.md |
| `20c457c6` | `*/5 * * * *` | System | Heartbeat — log tmux sessions + system health to /home/agent/heartbeat.log |

## Schedule Notes

- All jobs are **durable** (persist across sessions) and **auto-expire after 7 days**.
- Jensen reviews fire at :17 past the hour (offset to avoid API contention at :00).
- Heartbeat log is auto-truncated at 500 lines to prevent bloat.
- Phil's dispatch only assigns tasks that are "open" or "ready" in TASKS.md.

## Log Locations

| Log | Path |
|-----|------|
| Heartbeat | `/home/agent/heartbeat.log` |
| Board Reviews | `/home/agent/shipyard-ai/rounds/board-review-NNN.md` |
| Pipeline State | `/home/agent/shipyard-ai/STATUS.md` |
| Task Board | `/home/agent/shipyard-ai/TASKS.md` |

## Maintenance + Stall Crons (added 2026-04-27)

| Job | Schedule | Description |
|-----|----------|-------------|
| stall-detector | 7 */4 * * * | Classify projects GREEN/YELLOW/RED/BLACK; queue Cagan dispatch in .daemon-queue.json |
| state-sync | 13 * * * * | Re-render STATUS.md and TASKS.md from git reality; reconcile AGENTS.md vs agent-registry.json |
| maintenance-crew | */15 * * * * | Standalone watchdog at /home/agent/maintenance-crew/ — checks daemon, ollama, disk, stuck pipelines, hollow ships, hang risk, unpushed commits, silent ship failures |

Logs:
- pipeline/auto/stall-detector.cron.log
- pipeline/auto/state-sync.cron.log
- /home/agent/maintenance-crew/log/maintenance.log

Activation status:
- stall-detector: ACTIVE (cron installed 2026-04-27)
- state-sync: ACTIVE (cron installed 2026-04-27, will skip STATUS.md/TASKS.md until daemon-authored)
- maintenance-crew: ACTIVE since 2026-04-21
- **Phil dispatcher wiring to read .daemon-queue.json: PENDING** — Phil cron still reads only TASKS.md. Cagan dispatches in queue will not execute until Phil is updated. See pipeline/auto/STALL-DETECTOR.md Step 4.


---
## Rate-limit Escalation — 2026-04-27T20:22:01.380Z

cagan hit max-per-week (2) for project `plugins-v1` without resolution. Human review required.

From queue entry: `stall-projects-plugins-v1-1777320422235`


---
## Escalation — 2026-04-28T00:22:01.835Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777334822175`


---
## Escalation — 2026-04-28T04:22:01.891Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777349222364`


---
## Escalation — 2026-04-28T08:22:01.658Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777363622455`


---
## Escalation — 2026-04-28T12:22:01.239Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777378021736`


---
## Escalation — 2026-04-28T16:22:01.963Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777392421712`


---
## Escalation — 2026-04-28T20:22:01.322Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777406822088`


---
## Escalation — 2026-04-29T00:22:01.144Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777421222548`


---
## Escalation — 2026-04-29T04:22:01.977Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777435621861`


---
## Escalation — 2026-04-29T08:22:01.984Z

🚨 STALL ESCALATION: plugins-v1 has had 2 Cagan dispatches in the past week and is still stalled. Human decision required: ship the existing scope, kill the project, or unblock a specific risk Cagan flagged. See /home/agent/shipyard-ai/projects/plugins-v1/cagan-*.md for prior analyses.

From queue entry: `stall-projects-plugins-v1-1777450022643`
