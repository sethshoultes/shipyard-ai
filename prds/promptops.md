# PRD: PromptOps
**Version:** 1.0
**Status:** Ready for Build
**Dream Cycle:** 2026-04-11T03:03
**Votes:** 4/6 (Phil, Elon, Warren, Ada)

---

## One-Liner
Git for prompts: version, deploy, rollback, and A/B test your AI prompts without changing application code.

---

## Problem Statement

Every company using LLMs has prompts scattered across codebases, Notion docs, and developer heads. When prompts change:
- There's no history of what worked before
- Rollback means searching through git commits
- A/B testing requires custom instrumentation
- No visibility into which prompt version is in production

This is the state of deployment tooling circa 2005, applied to the most critical component of AI applications.

---

## Solution Overview

PromptOps provides:

1. **CLI** (`promptops`) — Manage prompts from the terminal
   - `promptops init` — Initialize a project
   - `promptops push <name>` — Push a new prompt version
   - `promptops list` — Show all prompts and versions
   - `promptops rollback <name> <version>` — Rollback to previous version
   - `promptops diff <name>` — Show changes between versions

2. **Proxy** — Sits between your app and the LLM
   - Intercepts requests, injects the active prompt version
   - Logs latency, token usage, and optional user ratings
   - Routes traffic for A/B tests

3. **Dashboard** — Visibility into prompt performance
   - Version history with diffs
   - Performance metrics per version
   - One-click rollback
   - A/B test results

---

## MVP Scope (One Session)

### Must Have
- [ ] CLI with `init`, `push`, `list`, `rollback` commands
- [ ] Cloudflare Worker proxy that injects prompts
- [ ] D1 database storing prompts, versions, metadata
- [ ] Simple API key auth
- [ ] Basic web dashboard (list prompts, view versions, rollback)

### Nice to Have (Post-MVP)
- [ ] A/B testing with traffic splits
- [ ] Performance metrics and analytics
- [ ] GitHub Action for CI/CD
- [ ] SDK wrappers (Python, TypeScript)
- [ ] Team/organization support

### Out of Scope
- Native integrations with specific LLM providers (MVP uses generic proxy)
- Billing/payments (free tier only for launch)
- Prompt templates/variables (users manage their own templating)

---

## Technical Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Your App  │────▶│  PromptOps Proxy │────▶│   LLM API   │
│             │     │  (CF Worker)     │     │  (OpenAI,   │
└─────────────┘     └────────┬─────────┘     │  Anthropic) │
                             │               └─────────────┘
                             ▼
                    ┌─────────────────┐
                    │   D1 Database   │
                    │  - prompts      │
                    │  - versions     │
                    │  - logs         │
                    └─────────────────┘
```

### Data Model

```sql
-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  api_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

-- Prompts
CREATE TABLE prompts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL UNIQUE,
  active_version INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Versions
CREATE TABLE versions (
  id TEXT PRIMARY KEY,
  prompt_id TEXT NOT NULL,
  version INTEGER NOT NULL,
  content TEXT NOT NULL,
  message TEXT,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);
```

### API Endpoints

```
POST /api/projects          — Create project, get API key
GET  /api/prompts           — List prompts
POST /api/prompts           — Create/update prompt (new version)
GET  /api/prompts/:name     — Get prompt details
POST /api/prompts/:name/rollback — Rollback to version

POST /proxy/v1/chat/completions — OpenAI-compatible proxy
```

### CLI Implementation

Node.js CLI, published to npm as `promptops`. Stores config in `~/.promptops/config.json`.

```bash
npm install -g promptops
promptops init my-project
promptops push system-prompt --file ./prompts/system.txt
promptops list
promptops rollback system-prompt 2
```

---

## User Stories

### Developer Setting Up
1. `npm install -g promptops`
2. `promptops init my-saas` — Creates project, saves API key locally
3. Point app at `https://proxy.promptops.dev/v1/chat/completions`
4. Add header: `X-PromptOps-Key: <api_key>`
5. Add header: `X-PromptOps-Prompt: system-prompt`
6. Proxy injects the active version of `system-prompt`

### Developer Deploying New Prompt
1. Edit prompt locally
2. `promptops push system-prompt --file ./new-prompt.txt -m "Added error handling"`
3. New version is immediately active
4. Monitor in dashboard
5. If issues: `promptops rollback system-prompt 3`

### Developer Reviewing History
1. `promptops diff system-prompt` — Shows last change
2. `promptops list` — Shows all prompts with active versions
3. Dashboard shows full history with timestamps

---

## Distribution Strategy

### Launch Channels
1. **Hacker News** — "Show HN: Git for AI prompts" (controversial = engagement)
2. **Dev Twitter** — Thread on prompt versioning pain
3. **r/LocalLLaMA, r/ChatGPT** — Community posts
4. **ProductHunt** — Scheduled launch

### Positioning
"Heroku for prompts" — Simple, developer-friendly, just works.

### Pricing (Post-MVP)
- **Free:** 3 prompts, 1K requests/month
- **Pro ($29/mo):** Unlimited prompts, 100K requests, A/B testing
- **Team ($99/mo):** Multiple users, audit log, SSO

---

## Success Metrics

### Launch Day
- [ ] CLI published to npm
- [ ] Proxy deployed to Cloudflare Workers
- [ ] Dashboard accessible
- [ ] One external project using it (dogfooding doesn't count)

### Week 1
- 100+ npm installs
- 10+ projects created
- 1 Hacker News post with >50 points

### Month 1
- 1,000+ npm installs
- 100+ active projects
- First paying customer (if billing implemented)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Proxy adds latency | Medium | Edge deployment, async logging |
| Users don't want another tool | High | Make setup <5 minutes, immediate value |
| Security concerns (prompts are sensitive) | Medium | Encryption at rest, SOC2 roadmap |
| LLM providers change APIs | Low | Abstract provider layer |

---

## Open Questions

1. Should the proxy modify requests or just log/inject? (MVP: inject only)
2. Do we support prompt templates with variables? (MVP: no, raw text)
3. How do we handle streaming responses? (MVP: pass-through, no modification)

---

## Build Checklist

### Phase 1: Foundation (2 hours)
- [ ] Cloudflare Worker project setup
- [ ] D1 database schema
- [ ] Basic API routes (projects, prompts, versions)
- [ ] API key auth middleware

### Phase 2: CLI (1.5 hours)
- [ ] Node.js CLI scaffold
- [ ] `init`, `push`, `list`, `rollback`, `diff` commands
- [ ] Config file management
- [ ] Publish to npm

### Phase 3: Proxy (1 hour)
- [ ] OpenAI-compatible endpoint
- [ ] Header parsing (API key, prompt name)
- [ ] Prompt injection
- [ ] Request forwarding

### Phase 4: Dashboard (1.5 hours)
- [ ] Simple React/static HTML dashboard
- [ ] Prompt list view
- [ ] Version history view
- [ ] Rollback button
- [ ] Deploy to Workers/Pages

### Phase 5: Polish & Ship (1 hour)
- [ ] README with quickstart
- [ ] Error handling and edge cases
- [ ] Dogfood on shipyard-ai agents
- [ ] Hacker News post draft

---

## Appendix: Competitive Landscape

| Product | Approach | Gap |
|---------|----------|-----|
| LangSmith | Full observability platform | Too heavy, requires SDK |
| Weights & Biases | ML experiment tracking | Not prompt-focused |
| Helicone | Proxy logging | No versioning/rollback |
| Custom git | Manual prompt files | No deployment, no proxy |

PromptOps fills the gap: **lightweight, CLI-first, instant deployment**.

---

*Ready for build. Let's ship it.*
