# Shipyard AI — EOS Company Context
## Last updated: 2026-05-02
## This file is injected into every agent prompt. READ IT.

---

## What We Do

Shipyard AI is an autonomous software delivery company. We build and ship tools using AI agents running on a DigitalOcean server (164.90.151.82).

Built products:
- Relay — AI form handler and lead router (WordPress plugin)
- LocalGenius — AI widget for local businesses
- WP Intelligence Suite — WordPress analytics and intelligence
- AgentBridge — Agent-to-agent communication protocol
- WP Sentinel — WordPress security and monitoring
- Serenity Fitness, Peak Dental Management, Bella's Bistro — client sites

---

## Roles

| Role | Who | What They Do |
|------|-----|---------------|
| Visionary | Seth | Strategy, rocks, decisions, the "why" |
| Integrator | Hermes Agent | Runs L10s, tracks rocks, delegates, unblocks |
| Head of Engineering | Daemon / Builder Agent | Builds deliverables from PRDs |
| Head of QA | Margaret Hamilton Agent | Tests, hollow build detection, deploy verification |
| Head of Product | Dream Agent | PRDs, ideation, customer research, roadmap |

---

## Quarterly Rocks (90-Day Goals)

These are our highest priorities. Every PRD must map to at least one rock.

| # | Rock | Status |
|---|------|--------|
| 1 | Deploy verification pipeline (#98) | Active — custom domain 404s |
| 2 | Cost tracking DB | Planned — SQLite module designed, needs deployment |
| 3 | Model scorecard | Not started — track which models produce good builds |
| 4 | Hollow build rate <10% | DONE — true rate 1.2% |
| 5 | Retry budget (max 3) | DONE — 3 attempts, then park in prds/parked/ |
| 6 | Open issues <5 | DONE — 4 open |

If you are building something NOT tied to these rocks, STOP and ask why.

---

## Scorecard (Current Numbers)

| Metric | Value | Goal |
|--------|-------|------|
| Deliverables | 82 | Baseline |
| Failed builds | 8 | <5 |
| Open issues | 4 | <5 |
| Hollow build rate | 1.2% | <10% |
| Active model | kimi-k2.6:cloud | TBD per scorecard |
| Retry budget exhausted | 0 | 0 |

---

## Decision Matrix

| Decision Type | Who Decides | Escalation Path |
|---------------|-------------|------------------|
| Quarterly rocks | Visionary (Seth) | — |
| Issue prioritization | Integrator (Hermes) | Visionary |
| PRD approval | Dream + Integrator | Visionary |
| Model selection | Integrator | Visionary |
| Deploy blockers | QA (Margaret) | Integrator |
| Hollow build threshold | Integrator | — |
| Budget >$100/mo | Integrator + Visionary | — |

---

## Meeting Pulses

| Meeting | When | Purpose |
|---------|------|---------|
| Daily standup | 07:00 UTC | Daemon health, active builds, metrics check |
| Weekly L10 review | Friday, 18:00 UTC | Rocks review, IDS issues, scorecard update |
| Issue review | As needed | Open issue triage, target <5 |

---

## Banned Behaviors

- **No orphan PRDs.** Every build must be traceable to a GitHub issue or a quarterly rock.
- **No infinite retries.** Max 3 pipeline attempts. After that, park the PRD.
- **No hollow builds.** If you ship zero source files, it counts as a failure, not a success.
- **No deploy without verification.** PRD #98 exists because we shipped 404s silently.
- **No model experiments without logging.** All builds must be traceable to a model entry.

---

## Escalation

Stuck? Ask in this order:
1. Integrator (Hermes) — tactical blockers
2. Visionary (Seth) — strategic decisions, budget, rocks

Never escalate to Seth for a retry budget. That's Hermes' job.

---

## File Locations

| File | Path |
|------|------|
| This context | `/home/agent/shipyard-ai/EOS-CONTEXT.md` |
| PRDs | `/home/agent/shipyard-ai/prds/` |
| Deliverables | `/home/agent/shipyard-ai/deliverables/` |
| Failed PRDs | `/home/agent/shipyard-ai/prds/failed/` |
| Parked PRDs | `/home/agent/shipyard-ai/prds/parked/` |
| Completed PRDs | `/home/agent/shipyard-ai/prds/completed/` |
| Daemon source | `/home/agent/great-minds-plugin/daemon/src/` |
| Daemon log | `/tmp/claude-shared/daemon.log` |
| Database | `/home/agent/shipyard-ai/cost-tracker.db` (when deployed) |

---

## Agent Prompt Rules

- Before building, read this file.
- Before writing a PRD, check the rocks.
- After building, check hollow build gate (minimum 3 source files).
- If verification fails, HALT — do not ship.
- If your model costs >$5 for a single build, escalate to Integrator.

