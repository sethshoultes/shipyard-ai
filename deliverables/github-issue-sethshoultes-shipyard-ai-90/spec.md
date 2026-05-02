# Forge — Specification Document

**Issue**: sethshoultes/shipyard-ai#90
**Project Slug**: `github-issue-sethshoultes-shipyard-ai-90`
**Status**: Pre-build
**Generated**: 2026-05-02

---

## Goals (from PRD)

### Primary Goal
Build **AgentForge** — a web application that lets non-developers design, test, and deploy multi-agent AI workflows. Think Zapier, but for orchestrating Claude agents.

### Success Criteria
1. Issue sethshoultes/shipyard-ai#90 requirements are met
2. All tests pass
3. Visual canvas for building multi-agent workflows ships in v1
4. Non-developers can create, test, and deploy workflows without code

### Target Users
- Operations teams
- No-code builders
- Consultants

### Distribution Channels
- ProductHunt
- No-code communities
- LinkedIn

---

## Implementation Approach (from Debate Decisions)

### Core Architecture
| Decision | Resolution |
|----------|------------|
| Name | **Forge** — one word, four letters, no "Agent" |
| Platform | Web app only (no WordPress plugin in v1) |
| Canvas | Visual infinite canvas ships in v1 (white, no dark mode) |
| Node Types | Minimal core set only — no 47 types |
| Execution | Submit to existing daemon — zero new runtime |
| Performance | Parallel execution + aggressive caching, <3 second target |
| Economics | Token budgets + request deduplication day one |
| Monetization | Freemium billing CUT from v1 — ship love first |

### File Structure
```
forge/
├── app/                          # Web application (single platform)
│   ├── canvas/                   # Visual canvas engine — white, infinite, minimal
│   ├── nodes/                    # Core node components (limited palette)
│   ├── executor/                 # Submit-to-daemon wrapper
│   ├── preview/                  # Live preview / demo-state runner
│   └── voice/                    # Brand copy — human, confident, zero acronyms
├── daemon-bridge/                # Thin adapter to existing pipeline
│   ├── schema/                   # JSON workflow config schema (runtime only)
│   ├── validator/                # Config validation before submit
│   └── submitter/                # Job submission to existing daemon
├── cache/                        # Aggressive deterministic cache layer
├── budgets/                      # Token budgets & request deduplication
└── api/                          # Developer-facing API (JSON for those who want it)
```

### Technical Decisions
- **No Workers AI edge execution** — agents call Claude API directly
- **No JSON editor in-app** — visual only (developers use API)
- **One aesthetic** — white canvas, no dark mode, no advanced mode toggle
- **No onboarding wizard** — users land in a running orchestra, touch a node
- **No login wall for demo** — first 30 seconds are frictionless

### Explicitly NOT in v1
- Freemium billing / Stripe integration
- Dark mode
- Advanced / Pro / JSON-editing mode
- WordPress plugin variant
- Workers AI edge execution
- PowerPoint export, CSV templates
- More than a handful of node types

---

## Verification Criteria

### Canvas Engine
| Criterion | Verification Method |
|-----------|---------------------|
| Canvas renders as white infinite surface | Visual inspection + CSS computed value check |
| Nodes can be dragged and positioned | Integration test: drag node, assert new coordinates |
| Nodes can be connected via wires | Integration test: create connection, assert link exists in state |
| Limited node palette renders correctly | Count rendered node types, assert equals expected count |
| No dark mode toggle exists | Grep UI code for "dark" mode selectors, assert zero matches |

### Execution Pipeline
| Criterion | Verification Method |
|-----------|---------------------|
| Jobs submit to existing daemon | Mock daemon endpoint, assert POST request on workflow run |
| Independent nodes execute in parallel | Timing test: 3 independent nodes complete in ~max(single) not ~sum |
| Cache prevents duplicate API calls | Run identical workflow twice, assert second hit is instant |
| Token budgets enforce limits | Set budget=100, run workflow exceeding budget, assert early termination |
| Request deduplication works | Fire same request twice simultaneously, assert single API call |

### User Experience
| Criterion | Verification Method |
|-----------|---------------------|
| Landing page shows running demo state | Load page, assert canvas has pre-populated workflow |
| No login required for first use | Load page, assert no auth modal appears |
| No onboarding wizard/tooltips | Grep for tour/wizard/onboarding components, assert zero |
| Sub-3-second workflow execution (cached) | Timing test with cached inputs, assert <3000ms |

### Code Quality
| Criterion | Verification Method |
|-----------|---------------------|
| Zero TODO/FIXME/HACK comments | `grep -riE 'TODO|FIXME|HACK|XXX' forge/` returns nothing |
| No placeholder code blocks | Grep for "implement me", "fix later", empty function bodies |
| TypeScript strict mode passes | `tsc --noEmit` exits 0 |
| No runtime dependencies beyond React | Check package.json dependencies list |

---

## Files to Create or Modify

### New Directories
```
/home/agent/shipyard-ai/forge/
/home/agent/shipyard-ai/forge/app/
/home/agent/shipyard-ai/forge/app/canvas/
/home/agent/shipyard-ai/forge/app/nodes/
/home/agent/shipyard-ai/forge/app/executor/
/home/agent/shipyard-ai/forge/app/preview/
/home/agent/shipyard-ai/forge/app/voice/
/home/agent/shipyard-ai/forge/daemon-bridge/
/home/agent/shipyard-ai/forge/daemon-bridge/schema/
/home/agent/shipyard-ai/forge/daemon-bridge/validator/
/home/agent/shipyard-ai/forge/daemon-bridge/submitter/
/home/agent/shipyard-ai/forge/cache/
/home/agent/shipyard-ai/forge/budgets/
/home/agent/shipyard-ai/forge/api/
```

### New Files (Phase 1 Scope)
| File | Purpose |
|------|---------|
| `forge/package.json` | Module manifest with zero runtime dependencies |
| `forge/tsconfig.json` | TypeScript configuration (strict mode, ESM) |
| `forge/app/canvas/index.tsx` | Canvas root component |
| `forge/app/canvas/useCanvasState.ts` | Canvas state management hook |
| `forge/app/nodes/BaseNode.tsx` | Base node component |
| `forge/app/nodes/AgentNode.tsx` | Agent node component |
| `forge/app/nodes/TriggerNode.tsx` | Trigger node component |
| `forge/app/executor/DaemonExecutor.ts` | Daemon job submission logic |
| `forge/app/preview/PreviewRunner.tsx` | Live preview component |
| `forge/daemon-bridge/schema/workflow.ts` | Workflow JSON schema |
| `forge/daemon-bridge/validator/validate.ts` | Config validation |
| `forge/daemon-bridge/submitter/submit.ts` | Job submission |
| `forge/cache/CacheManager.ts` | Deterministic caching |
| `forge/budgets/TokenBudget.ts` | Token budget enforcement |
| `forge/api/routes.ts` | Developer API routes |

### Modified Files
| File | Modification |
|------|--------------|
| `STATUS.md` | Add Forge project to pipeline state |
| `TASKS.md` | Add Forge build tasks to dispatch board |

---

## Open Questions (To Resolve Before Build)

| # | Question | Owner |
|---|----------|-------|
| 1 | Distribution channel (Emdash plugin vs standalone) | Product/GTM |
| 2 | Live demo state mechanics (simulated vs real) | Elon |
| 3 | Exact node type roster (how many, which ones) | Steve |
| 4 | Developer API scope (ships v1 or deferred) | Elon |
| 5 | Hosting/deployment target (Cloudflare or other) | Elon |
| 6 | Auth model post-demo (when does login appear) | Elon + Steve |

---

## Notes

- This spec is derived from PRD #90 and locked debate decisions
- Implementation will follow the "Forge" architecture from decisions.md
- Test files are the specification — no separate detailed spec beyond this
- All code must pass TypeScript strict mode and zero-dependency checks
