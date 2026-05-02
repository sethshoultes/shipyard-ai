# PRD: [dream] AgentForge

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#90
> https://github.com/sethshoultes/shipyard-ai/issues/90

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #90
- **Author:** sethshoultes
- **Labels:** dream-candidate, p2
- **Created:** 2026-04-30T11:22:21Z
- **Priority:** p2

## Problem
Operations teams and no-code builders need to design, test, and deploy multi-agent AI workflows without writing code. Current tools require programming (CrewAI, AutoGen) or Zapier-style linear automation, which doesn't support agent branching, conditional logic, or Claude-level reasoning workflows.

## Success Criteria
- Visual workflow builder with drag-and-drop nodes
- Pre-built agent templates (researcher, writer, reviewer, etc.)
- Claude agent integration with tool-calling support
- One-click testing of each workflow step
- Deploy as Cloudflare Worker or webhook
- Free tier: 3 workflows; paid tiers for more
- Exportable JSON workflow definitions

## Technical Approach
- Frontend: React + React Flow (xyflow) for the canvas
- Backend: FastAPI or Hono on Workers with SQLite/D1 for persistence
- Agent execution: Claude API via Server-Sent Events
- Deployment: Compile workflow to CF Worker JS bundle
- Auth: GitHub OAuth for user sessions

## Acceptance Criteria
- [ ] New workflow created via drag-drop
- [ ] At least 3 agent node types in palette
- [ ] Claude tool-calling works in test mode
- [ ] Workflow deploys to CF Pages/Workers
- [ ] Shared workflow URL works for visitors
