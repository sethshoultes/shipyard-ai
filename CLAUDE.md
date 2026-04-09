# Shipyard AI — Project Instructions

## Overview

Autonomous AI agency that builds and deploys Emdash sites, themes, and plugins from PRDs. Multi-agent pipeline with token-based credit budgeting to control scope and costs.

## System Files

| File | Purpose |
|------|---------|
| SOUL.md | Agency identity, values, operating principles |
| CLAUDE.md | This file — project instructions for all agents |
| AGENTS.md | Agent roster, roles, hierarchy |
| STATUS.md | Live pipeline state — what's building, what's queued |
| MEMORY.md | Persistent learnings across projects |
| HEARTBEAT.md | Cron schedule and automation |
| TASKS.md | Dispatch board — Phil assigns, agents execute |

## Directory Structure

```
shipyard-ai/
  [system files above]
  prds/                    — Input PRDs from clients
    TEMPLATE.md            — PRD template for consistent intake
  pipeline/                — Pipeline stage definitions + configs
  personas/                — Agent knowledge bases
  team/                    — Sub-agent role definitions (created per project)
  projects/                — Active project workspaces
    {project-slug}/
      debate/              — Strategy debate transcripts
      plan/                — Build plan + agent assignments
      build/               — Work-in-progress artifacts
      review/              — QA reports + review notes
      deploy/              — Final deploy artifacts + logs
  templates/               — Reusable Emdash theme templates
  plugins/                 — Reusable Emdash plugin library
  deliverables/            — Research, architecture docs, reports
```

## Pipeline: PRD to Deploy

```
intake → debate → plan → build → review → deploy → done
  |        |        |       |        |        |
  |        2 rounds  hire   parallel  QA +    push to
  |        max       subs   agents    staging  production
  |
  token budget assigned here — hard cap on scope
```

### Stage 1: INTAKE
- PRD drops in `prds/`
- Token budget calculated and assigned (see Token Credit System)
- Project workspace created in `projects/{slug}/`

### Stage 2: DEBATE (2 rounds max)
- Directors stake positions on approach
- Resolve: tech stack choices, component strategy, content approach
- Output: locked decisions document in `projects/{slug}/debate/`

### Stage 3: PLAN
- Directors define sub-agent teams in `team/`
- Each agent gets: inputs, outputs, token allocation, quality bar
- Output: build plan in `projects/{slug}/plan/`

### Stage 4: BUILD (parallel)
- Sub-agents execute assignments (model: haiku)
- Directors monitor, intervene on drift
- Token burn tracked in real-time
- Output: artifacts in `projects/{slug}/build/`

### Stage 5: REVIEW
- QA agent runs automated checks (build, a11y, performance)
- Directors review for quality + PRD compliance
- Revisions loop back to BUILD (costs revision tokens)
- Output: QA report in `projects/{slug}/review/`

### Stage 6: DEPLOY
- Push to Emdash staging → verify → promote to production
- Git tag the release
- Output: deploy log in `projects/{slug}/deploy/`

## Token Credit System

Tokens are the unit of work. Every project gets a token budget based on complexity. Tokens map to AI inference costs (input + output tokens across all models).

### Budget Tiers

| Product Type | Base Tokens | Includes |
|-------------|-------------|----------|
| Simple Site (5 pages) | 500K | Design, content, deploy |
| Standard Site (10 pages) | 1M | Design, content, SEO, deploy |
| Complex Site (20+ pages) | 2M | Design, content, SEO, integrations, deploy |
| Theme | 750K | Design system, components, docs |
| Plugin | 500K | Logic, tests, docs |
| Revision (per round) | 100K | Changes to deployed product |

### Rules

1. **Token budget is a hard cap.** When tokens run out, the project ships as-is or the client buys more.
2. **Debate + Plan uses max 10% of budget.** If you're spending more than 10% on strategy, the PRD is underspecified.
3. **Build gets 60%.** The bulk of tokens go to actual construction.
4. **Review + Deploy gets 20%.** QA is not optional.
5. **10% reserve** for unexpected rework. If unused, it's returned to the client.
6. **Revision tokens are separate.** Post-deploy changes cost 100K per round, charged separately.

### Token Tracking

Every agent logs token usage per task. The pipeline tracks:
- Total budget vs. burned
- Burn rate (tokens/hour)
- Projected completion vs. budget
- Per-agent efficiency

## Agent Hierarchy

### Directors (Sonnet-class)
- **Elon Musk** — Product & Engineering. Owns pipeline architecture, tech decisions, deployment.
- **Steve Jobs** — Design & Brand. Owns visual quality, UX, content standards.

### QA (Sonnet-class)
- **Margaret Hamilton** — Quality Assurance. Continuous testing, a11y, performance, security.

### Sub-Agents (Haiku-class, spawned per project)
- Designers, developers, copywriters, SEO specialists
- Defined in `team/` per project
- Always run on haiku model (~5x cheaper than Sonnet)

### Orchestrator
- **Phil Jackson** — Admin window. Dispatches tasks, monitors pipeline, coordinates agents.

## Commands

```bash
cd /home/agent/shipyard-ai
# No app commands yet — this is the agency repo, not a product repo.
# Product repos are created per-project during the BUILD phase.
```

## Branch Strategy

- `main` — stable, reviewed
- `feature/*` — all work happens here
- PRs required for merge to main
- Margaret reviews before merge

## Retry Policy

1. Agent fails → retry once
2. Retry fails → alternative approach
3. Alternative fails → mark "blocked" in STATUS.md
4. 3 total failures → stop, engage human
5. While blocked → work on unblocked tasks

## Emdash CMS Reference

**IMPORTANT:** Before building, modifying, or debugging any Emdash site, theme, or plugin, agents MUST read  first. This guide covers the actual Emdash API, plugin system, deployment, and content model — do not hallucinate APIs or guess at interfaces.

Key sections:
- **Plugin System** — How definePlugin() works, sandbox-entry.ts format, Block Kit admin UI, capabilities
- **Deployment** — Cloudflare Workers + D1 + R2 setup, wrangler.jsonc config
- **Content Model** — Collections, taxonomies, menus, widgets, sections
- **Querying** — getEmDashCollection, getEmDashEntry in Astro templates
- **Theming** — Template structure, seed files, CSS tokens

## Emdash CMS Reference

**IMPORTANT:** Before building, modifying, or debugging any Emdash site, theme, or plugin, agents MUST read docs/EMDASH-GUIDE.md first. This guide covers the actual Emdash API, plugin system, deployment, and content model — do not hallucinate APIs or guess at interfaces.

Key sections:
- **Plugin System** — How definePlugin() works, sandbox-entry.ts format, Block Kit admin UI, capabilities
- **Deployment** — Cloudflare Workers + D1 + R2 setup, wrangler.jsonc config
- **Content Model** — Collections, taxonomies, menus, widgets, sections
- **Querying** — getEmDashCollection, getEmDashEntry in Astro templates
- **Theming** — Template structure, seed files, CSS tokens
