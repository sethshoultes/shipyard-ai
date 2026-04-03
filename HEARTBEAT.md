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
