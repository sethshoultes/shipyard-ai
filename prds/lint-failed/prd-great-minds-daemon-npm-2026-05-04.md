# PRD: Great Minds Daemon — NPM Platform Extraction

**Status:** Approved for Build
**Date:** 2026-05-04
**Owner:** Phil Jackson (Dream Cycle)
**Build Target:** 3-4 week sprint, alpha npm publish
**Distribution:** npm (`@shipyard/daemon`) + GitHub releases + Claude Code marketplace

---

## 1. Overview

Great Minds Plugin v1.4.0 is the most sophisticated multi-agent orchestration system in our portfolio. It runs 14 personas, 17 skills, and a resilient daemon with crash recovery, worktree isolation, and Telegram notifications. It is also MIT-licensed, free, and trapped inside a single GitHub repo.

The daemon — the actual orchestration engine — is buried in `great-minds-plugin/daemon/src/`. It is synced to `shipyard-ai/daemon/` via `sync.sh`, a temporary script that is already labeled as technical debt. Every day we don't extract this to a standalone npm package is a day someone else builds the abstraction layer and captures the ecosystem.

This PRD extracts the daemon, packages it as `@shipyard/daemon`, and builds the first monetization layer on top.

**The promise:** `npm install @shipyard/daemon` gives any developer a production-grade multi-agent pipeline in 60 seconds.

---

## 2. Goals

1. Extract `daemon/src/` into a standalone, versioned npm package (`@shipyard/daemon`).
2. Preserve all existing resilience features: crash recovery, exponential backoff, hung-agent detection, Telegram notifications.
3. Add a CLI entry point (`npx @shipyard/daemon init`) that scaffolds a new agent project.
4. Ship a token dashboard that shows cost per project, per agent, and per day.
5. Create pricing tiers: Free (self-hosted), Cloud ($99/mo managed), Enterprise ($10K/year licensed + support).

---

## 3. Non-Goals

- Rewrite the daemon in a different language (stays TypeScript).
- Add a web-based IDE for agent authoring (defer to v2).
- Real-time collaboration on agent projects (defer to v2).
- Custom model hosting (we continue using Anthropic API).
- Multi-tenant SaaS dashboard for Cloud tier in v1 (simple status page only).

---

## 4. User Stories

1. **As a developer,** I want to `npm install @shipyard/daemon` and run `npx daemon init my-project` so I have a working agent pipeline without cloning a 50KB manual.
2. **As a developer,** I want a `daemon status` command that tells me "✅ Daemon running | ✅ 22 personas loaded | 💰 Tokens today: $0.42" so I know everything is healthy.
3. **As a team lead,** I want to see a weekly cost report per agent so I can decide if Steve Jobs is worth his token budget.
4. **As a non-technical business owner,** I want to pay $99/mo for "Great Minds Cloud" so I don't need Claude Code, local setup, or technical knowledge.
5. **As an enterprise engineer,** I want a self-hosted daemon with SSO, audit logs, and support SLA for $10K/year.

---

## 5. Functional Specification

### 5.1 Package Structure

```
@shipyard/daemon/
├── package.json
├── README.md (quick start, not 49KB)
├── dist/
│   ├── daemon.js          # Compiled entry point
│   ├── pipeline.js
│   ├── agents.js
│   └── ...
├── bin/
│   └── daemon-cli.js      # `npx @shipyard/daemon` entry point
├── templates/
│   └── project/             # Scaffold for `daemon init`
│       ├── .env.example
│       ├── agents/          # 3 starter personas
│       ├── skills/          # 3 starter skills
│       └── shipyard.config.js
└── src/                     # TypeScript source (maps to dist/)
```

**Entry points:**
- Programmatic: `import { Daemon } from '@shipyard/daemon'`
- CLI: `npx @shipyard/daemon <command>`

### 5.2 CLI Commands

| Command | Description |
|---------|-------------|
| `daemon init [name]` | Scaffold new project with starter agents, skills, config |
| `daemon start` | Start the daemon in current project (reads shipyard.config.js) |
| `daemon status` | Print daemon health, loaded personas, last run, token cost today |
| `daemon run <skill>` | Run a single skill once (for testing/debugging) |
| `daemon logs` | Tail the last 100 lines of daemon output |
| `daemon doctor` | Check config validity, API key reachability, git status |

### 5.3 Configuration (`shipyard.config.js`)

```javascript
module.exports = {
  project: 'my-agency',
  agentsDir: './agents',
  skillsDir: './skills',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  modelDefaults: {
    director: 'claude-sonnet-4-20250514',
    specialist: 'claude-sonnet-4-20250514',
    implementer: 'claude-haiku-3-20240307'
  },
  notifications: {
    telegram: { botToken: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID }
  },
  limits: {
    maxConcurrentAgents: 4,
    hungAgentTimeoutMinutes: 20,
    pipelineTimeoutMinutes: 60
  },
  billing: {
    mode: 'self-hosted' // or 'cloud' for managed tier
  }
};
```

### 5.4 Token Dashboard

**Data sources:**
- Parse Anthropic API response headers (`x-request-id`, token usage metadata).
- Log every agent invocation to `~/.shipyard/ledger.jsonl` (append-only JSON Lines).

**Display:**
- `daemon status` prints:
  ```
  ┌─ Great Minds Daemon v1.0.0-alpha ─┐
  │ Status:    🟢 Running (PID 48291)   │
  │ Project:   my-agency                  │
  │ Agents:    14 loaded                  │
  │ Today:     $0.42 (42K tokens)         │
  │ This week: $2.18                      │
  │ Last ship: 12 min ago (Steve Jobs)     │
  └──────────────────────────────────────┘
  ```

**Weekly report (`~/great-minds-report.md`):**
- Auto-generated every Monday at 9am.
- Markdown format, committed to project repo.
- Sections: Ships this week, Cost breakdown by agent, Failures & retries, Next week's forecast, Token budget remaining.

### 5.5 Pricing Tiers

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Free / Self-Hosted** | $0 | Full daemon, CLI, community support. User pays Anthropic directly. |
| **Cloud** | $99/mo | Managed daemon (we host), web status dashboard, 1-on-1 onboarding, email support. |
| **Enterprise** | $10K/year | Self-hosted daemon with SSO (SAML), audit logs, dedicated support channel, quarterly review. |

**Cloud tier details:**
- User connects GitHub repo.
- We run daemon in a containerized environment (Cloudflare Workers or Fly.io).
- Web dashboard shows: project status, recent ships, token usage, agent roster.
- Not a full IDE — just observability and control.

### 5.6 Migration Path

**For existing Great Minds Plugin users:**
1. Run `npm install @shipyard/daemon` in existing project.
2. Run `daemon migrate` — reads existing `agents/`, `skills/`, `SOUL.md`, and generates `shipyard.config.js`.
3. `sync.sh` deprecated. `daemon start` replaces it.

**Backward compatibility:**
- All existing 14 personas and 17 skills load without modification.
- `CLAUDE.md` / `AGENTS.md` files are still respected as context sources.

---

## 6. UI/UX Specification

### CLI — `daemon init`
```
$ npx @shipyard/daemon init bella-agency
Creating project "bella-agency"...
✓ agents/         (3 starter personas)
✓ skills/         (3 starter skills)
✓ shipyard.config.js
✓ .env.example

Next steps:
  cd bella-agency
  cp .env.example .env      # Add your ANTHROPIC_API_KEY
  daemon doctor             # Verify everything
  daemon start              # Run your first pipeline

Docs: https://shipyard.company/docs/daemon
```

### CLI — `daemon status`
Color-coded health. Green = healthy. Yellow = warning (e.g., high token burn). Red = error (e.g., API key invalid).

### Web Dashboard (Cloud tier only)
- Single-page status board.
- Top bar: project name, daemon status indicator, token burn rate.
- Middle: recent ships list (agent name, time ago, outcome).
- Bottom: cost graph (7-day rolling).

---

## 7. Technical Architecture

```
@shipyard/daemon/
├── src/
│   ├── cli.ts              # Command parser (commander.js or native parseArgs)
│   ├── daemon.ts           # Core orchestration (extracted from existing)
│   ├── pipeline.ts         # Stage runner (extracted)
│   ├── agents.ts           # Persona loader (extracted)
│   ├── config.ts           # shipyard.config.js reader + validator
│   ├── ledger.ts           # Token cost tracking
│   ├── report.ts           # great-minds-report.md generator
│   ├── doctor.ts           # Health checks
│   └── migrate.ts          # Legacy project importer
├── templates/
│   └── project/
├── dist/                   # Compiled JS + .d.ts
├── bin/daemon-cli.js       # Shebang entry
└── package.json
```

**Build:**
- `tsc` compiles `src/` to `dist/`.
- `npm pack` verifies bundle size < 500KB.
- CI tests: `daemon init`, `daemon doctor`, `daemon start` on a dummy project.

**Runtime dependencies:**
- `@anthropic-ai/sdk` (existing)
- `chokidar` (file watching, existing)
- `simple-git` (existing)
- `zod` (config validation, new)
- `chalk` (CLI colors, new)
- `ora` (CLI spinners, new)

**Dev dependencies:**
- `typescript`, `vitest`, `@types/node`

---

## 8. Acceptance Criteria

- [ ] `npm install @shipyard/daemon` succeeds in a fresh directory.
- [ ] `npx @shipyard/daemon init test-project` scaffolds runnable project.
- [ ] `daemon doctor` passes when config is valid, fails helpfully when API key is missing.
- [ ] `daemon start` runs a full pipeline on the scaffolded project without errors.
- [ ] `daemon status` shows accurate token cost for today's usage.
- [ ] `~/great-minds-report.md` generates automatically and includes cost breakdown.
- [ ] Existing Great Minds Plugin project migrates cleanly with `daemon migrate`.
- [ ] Cloud tier dashboard loads and shows real project status.

---

## 9. Metrics & Success

| Metric | Baseline | Target (90 days) |
|--------|----------|-----------------|
| npm downloads | 0 | >100 |
| `daemon init` completions | 0 | >50 |
| Cloud tier subscribers | 0 | >5 |
| Enterprise license inquiries | 0 | >2 |
| Token dashboard active users | 0 | >20 |
| `great-minds-report.md` generation | 0 | 100% of active projects |
| Migration success rate | N/A | >90% |

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| npm package bloat | Tree-shake unused personas. Provide `@shipyard/daemon-lite` if needed. |
| Breaking existing users | Semantic versioning strictly enforced. v1.0.0-alpha for 30 days before stable tag. |
| API key exposure in CLI | `shipyard.config.js` supports `process.env` references. Warn if raw key detected. |
| Cloud tier infra cost | Cap container hours. Pause daemon after 7 days of user inactivity. |
| Token cost unpredictability | Dashboard shows real-time burn rate. Alert at 80% of user-set daily budget. |

---

## 11. Release Plan

**Week 1:** Extract daemon source, create package structure, implement CLI (`init`, `doctor`, `status`).
**Week 2:** Implement `start`, `run`, `logs`. Add token ledger. Port all 14 personas + 17 skills to template.
**Week 3:** Build migration tool (`daemon migrate`). Alpha publish to npm (`v1.0.0-alpha.1`). Internal dogfooding.
**Week 4:** Build Cloud tier dashboard. Enterprise license page. Beta publish (`v1.0.0-beta.1`). Announce on repo README.

*Phil Jackson*
*Head Coach, Shipyard AI*
