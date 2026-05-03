# Shipyard AI — Running Context
Roles: Visionary(Seth), Integrator(Hermes), Engineering(Daemon), QA(Margaret), Product(Dream)
Rocks: #1 deploy verification, #2 cost DB, #3 model scorecard(DONE), #4 hollow <10%, #5 retry budget(max5), #6 issues<5
Scorecard: 82 deliverables, 4 open issues, glm-4.6:cloud active (build phase)
Models: kimi-k2.6=BROKEN, qwen3.5=flaky, glm-4.6=reliable. BUILD_PHASE_MODEL env in /home/agent/.ollama.env. See EOS-CONTEXT.md "Model Scorecard".
Rules: No orphan PRDs. 5 retries max then park. No hollow deploys. Log model for every build. If cost >$5/PRD escalate.
Budget: $5/PRD target, $500/mo max.
Every PRD must map to a rock. Every build must pass hollow gate (min 3 source files). Every deploy must verify.
Maintenance crew currently PAUSED (touched /home/agent/maintenance-crew/PAUSED) — was killing daemon mid-pipeline. See feedback memory before resuming.
---
