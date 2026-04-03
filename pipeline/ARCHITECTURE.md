# Shipyard AI — PRD-to-Deploy Pipeline Architecture

**Author:** Elon Musk, Chief Product & Engineering Officer
**Date:** 2026-04-03
**Status:** Architecture Decision Record v1

---

## 1. System Overview

Shipyard AI takes a PRD (Product Requirements Document) and autonomously produces a deployed Emdash site, theme, or plugin. The pipeline is a 6-stage state machine with token-based budgeting at every stage.

```
┌─────────┐    ┌────────┐    ┌──────┐    ┌───────┐    ┌────────┐    ┌────────┐
│ INTAKE  │───▶│ DEBATE │───▶│ PLAN │───▶│ BUILD │───▶│ REVIEW │───▶│ DEPLOY │
│         │    │2 rounds│    │      │    │parallel│    │        │    │        │
│ budget  │    │  max   │    │ hire │    │ agents │    │  QA +  │    │staging │
│assigned │    │        │    │ subs │    │        │    │director│    │→ prod  │
└─────────┘    └────────┘    └──────┘    └───┬───┘    └───┬────┘    └────────┘
                                             │            │
                                             └────────────┘
                                           revision loop
                                          (costs tokens)
```

### State Machine

```
idle → intake → debate → plan → build → review → deploy → done
                                  ↑          │
                                  └──────────┘  (revision — burns tokens)

Any state → blocked → (human resolves) → previous state
```

---

## 2. Stage Details

### 2.1 INTAKE

**Trigger:** PRD file dropped in `prds/`
**Owner:** Phil Jackson (Orchestrator)
**Token budget:** 0 (orchestrator overhead, not charged to project)

**Process:**
1. Parse PRD for project type (site, theme, plugin)
2. Count pages, features, integrations
3. Calculate token budget (see Section 4)
4. Create project workspace: `projects/{slug}/`
5. Initialize `projects/{slug}/STATUS.json`:
   ```json
   {
     "project": "marias-kitchen",
     "type": "site",
     "pages": 5,
     "tokenBudget": 500000,
     "tokensBurned": 0,
     "stage": "intake",
     "createdAt": "2026-04-03T12:00:00Z"
   }
   ```
6. Dispatch to directors for DEBATE

**Quality gate:** PRD must specify: product type, page count, target audience, brand assets (if any), must-have features, nice-to-haves (explicitly separated).

### 2.2 DEBATE

**Trigger:** Intake complete
**Owners:** Elon Musk + Steve Jobs
**Token budget:** Max 5% of project total

**Process:**
1. **Round 1 — Positions:** Each director reads PRD and stakes positions on:
   - Tech approach (which Emdash features to leverage)
   - Design direction (template vs. custom, color palette, typography)
   - Content strategy (AI-generated vs. client-provided vs. hybrid)
   - Build parallelism (which tasks can run simultaneously)
2. **Round 2 — Resolution:** Directors challenge each other, resolve disagreements.
   - Every disagreement must produce a decision, not a compromise.
   - If no agreement after Round 2: Elon breaks the tie (engineering owns deploy risk).

**Output:** `projects/{slug}/debate/decisions.md` — locked decisions document.

**Quality gate:** Decisions document must cover: tech approach, design direction, content strategy, build plan outline. No open questions allowed.

### 2.3 PLAN

**Trigger:** Debate decisions locked
**Owners:** Elon Musk + Steve Jobs
**Token budget:** Max 5% of project total (combined with debate = 10% max)

**Process:**
1. Directors write sub-agent definitions in `team/{project}/`:
   - Each agent gets: role, inputs, outputs, token allocation, quality bar
   - Steve hires: designer, copywriter, brand specialist
   - Elon hires: developer, SEO specialist, deploy engineer
2. Token allocation per agent:
   ```
   Total build budget (60%) = project_tokens * 0.6
   Divide among agents based on complexity of their deliverables
   Each agent has a hard token cap
   ```
3. Dependency graph defined (what blocks what)
4. Parallel vs. sequential tasks identified

**Output:** `projects/{slug}/plan/build-plan.md` + agent definitions in `team/{project}/`

**Quality gate:** Sum of agent token allocations must not exceed 60% of project budget.

### 2.4 BUILD

**Trigger:** Build plan approved
**Owners:** Sub-agents (haiku), supervised by directors
**Token budget:** 60% of project total

**Process:**
1. Spawn sub-agents per the build plan (model: haiku)
2. Each agent:
   - Reads PRD + debate decisions + their role definition
   - Produces output in `projects/{slug}/build/`
   - Logs token usage per task
   - Flags blockers in STATUS.json (never silently fails)
3. Directors monitor:
   - Token burn rate (is any agent burning too fast?)
   - Output quality (does it match the locked decisions?)
   - Dependency resolution (unblock agents waiting on inputs)
4. If an agent exhausts their token allocation:
   - Stop. Ship what they have.
   - Director decides: reallocate from reserve, or ship as-is.

**Output:** Build artifacts in `projects/{slug}/build/`

**Quality gate:** All required deliverables present. No agent in "blocked" state.

### 2.5 REVIEW

**Trigger:** All build tasks complete
**Owner:** Margaret Hamilton (QA) + both directors
**Token budget:** 15% of project total

**Process:**
1. **Automated QA** (Margaret):
   - Build passes (`npm run build` or equivalent)
   - TypeScript/linting clean
   - Accessibility audit (WCAG 2.1 AA)
   - Performance audit (Lighthouse: 90+ on all scores)
   - Security review (no exposed secrets, proper auth)
   - Mobile responsiveness check
2. **Design review** (Steve):
   - Visual quality meets brand spec
   - Typography, spacing, color consistency
   - Content reads naturally (not AI-slop)
3. **Engineering review** (Elon):
   - Code quality, no hacks
   - PRD compliance (all requirements met)
   - Deploy readiness

**Revision loop:** If QA fails or directors flag issues:
   - Create specific revision tasks
   - Route back to BUILD (burns revision tokens from the 10% reserve)
   - Max 2 revision rounds before shipping as-is with known issues documented

**Output:** QA report in `projects/{slug}/review/qa-report.md`

**Quality gate:** QA report verdict is SHIP (not BLOCK).

### 2.6 DEPLOY (MCP-Native)

**Trigger:** QA verdict = SHIP
**Owner:** Elon Musk (or deploy sub-agent)
**Token budget:** 5% of project total

EmDash exposes a built-in **MCP server** on every instance. Our agents connect
directly via MCP to create content types, populate content, configure plugins,
and deploy — no custom scripts needed.

**Process:**
1. **Provision EmDash instance** on Cloudflare Workers (or target platform)
2. **Connect via MCP** — agent authenticates with the instance's MCP endpoint
3. **Create content types** via MCP: define schema for pages, posts, products
4. **Populate content** via MCP: push Portable Text content from build artifacts
5. **Configure plugins** via MCP: install + set capability manifests
6. **Apply theme** — push Astro theme project to Cloudflare Pages
7. **Smoke test** on staging URL (hit key pages, verify rendering)
8. If staging passes: **promote to production** via MCP
9. Configure custom domain (if specified in PRD)
10. Git tag the release: `v1.0.0-{project-slug}`
11. Generate deploy log: `projects/{slug}/deploy/deploy-log.md`
12. Update STATUS.json: `"stage": "done"`

**EmDash CLI fallback:** If MCP connection fails, use the EmDash CLI with
JSON output mode for programmatic site management.

**Output:** Live site + deploy log

**Quality gate:** Site loads on production URL. All pages render. No console errors.

---

## 2.7 EmDash Technical Integration

### Stack Alignment

| Shipyard AI | EmDash | Integration |
|-------------|--------|-------------|
| Build artifacts (TypeScript) | Themes (Astro 6 + TypeScript) | Direct — our agents write Astro themes natively |
| Content generation | Portable Text (JSON) | Direct — AI generates structured JSON, not HTML |
| Plugin development | Sandboxed Workers + capability manifests | Direct — TypeScript plugins with declared permissions |
| Deploy | MCP server + CLI | Direct — programmatic control of every instance |
| Database | Kysely ORM (D1, PostgreSQL, SQLite, Turso) | Compatible — type-safe queries |

### MCP Integration Points

```
Agent → MCP Server → EmDash Instance
  │
  ├── content.create(type, data)     — Create content entries
  ├── content.list(type, filters)    — Query existing content
  ├── schema.define(contentType)     — Define content types
  ├── plugin.install(manifest)       — Install plugin with capabilities
  ├── plugin.configure(id, config)   — Configure plugin settings
  ├── site.deploy()                  — Deploy to production
  └── site.status()                  — Check deploy status
```

### Theme Architecture (Astro 6)

Themes our agents build will follow this structure:
```
theme-{name}/
  src/
    pages/
      index.astro          — Homepage
      [...slug].astro      — Dynamic content pages
      blog/[slug].astro    — Blog post template
    layouts/
      Base.astro           — Base layout (head, nav, footer)
    components/
      Hero.astro           — Reusable components
      Card.astro
    styles/
      global.css           — Design tokens + global styles
  astro.config.mjs         — Astro + EmDash integration
  package.json
```

### Plugin Architecture (Cloudflare Workers)

Plugins our agents build will follow this structure:
```
plugin-{name}/
  src/
    index.ts               — Plugin entry point
    capabilities.ts        — Capability manifest
  manifest.json            — Declared permissions
  tests/
    index.test.ts
  package.json
```

Capability manifest example:
```json
{
  "name": "contact-form",
  "capabilities": ["read:content", "email:send"],
  "network": ["api.sendgrid.com"]
}
```

---

## 3. Token Flow Diagram

```
Project Token Budget (e.g., 500K for simple site)
│
├── 5%  DEBATE    (25K)  ─── Strategy alignment
├── 5%  PLAN      (25K)  ─── Agent definitions + build plan
├── 60% BUILD     (300K) ─── Actual construction
│   ├── Designer    (80K)
│   ├── Developer   (120K)
│   ├── Copywriter  (60K)
│   └── SEO         (40K)
├── 15% REVIEW    (75K)  ─── QA + director review
├── 5%  DEPLOY    (25K)  ─── Staging + production push
└── 10% RESERVE   (50K)  ─── Rework buffer (returned if unused)
```

---

## 4. Token Budget Calculator

### Base Budgets

| Product Type | Base Tokens | Complexity Multiplier |
|-------------|-------------|----------------------|
| Simple Site (1-5 pages) | 500K | 1.0x |
| Standard Site (6-10 pages) | 1M | 1.0x |
| Complex Site (11-20 pages) | 2M | 1.0x |
| Enterprise Site (20+ pages) | 3M | 1.0x |
| Theme | 750K | 1.0x |
| Plugin (simple) | 300K | 1.0x |
| Plugin (complex) | 750K | 1.0x |

### Complexity Multipliers

| Feature | Multiplier | Rationale |
|---------|-----------|-----------|
| E-commerce integration | 1.3x | Payment flows, product pages |
| Multi-language | 1.2x | Content duplication + i18n |
| Custom animations | 1.2x | Design + dev coordination |
| API integrations (per integration) | 1.1x | External service wiring |
| Blog/CMS (50+ posts) | 1.2x | Content volume |
| User authentication | 1.3x | Security-sensitive feature |

### Formula

```
final_budget = base_tokens * product(applicable_multipliers)
```

Example: Standard Site (10 pages) + e-commerce + blog
```
1,000,000 * 1.3 * 1.2 = 1,560,000 tokens
```

### Revision Pricing

| Revision Scope | Tokens |
|---------------|--------|
| Content-only changes (text, images) | 50K |
| Design changes (layout, colors) | 100K |
| Feature additions | 150K |
| Structural changes (new pages, navigation) | 200K |

Revisions are charged separately. The client must approve the revision budget before work begins.

---

## 5. Agent Model Selection

| Role | Model | Rationale |
|------|-------|-----------|
| Directors (Elon, Steve) | Sonnet | High-judgment strategy + review |
| QA (Margaret) | Sonnet | Security + quality requires reasoning |
| Orchestrator (Phil) | Sonnet | Coordination + dispatch |
| All sub-agents | Haiku | ~5x cheaper, sufficient for execution tasks |

### Cost Efficiency

At current pricing (approximate):
- Haiku: ~$0.25/1M input, $1.25/1M output
- Sonnet: ~$3/1M input, $15/1M output

A 500K-token project at ~80% haiku / 20% sonnet:
- Haiku portion (400K): ~$0.60
- Sonnet portion (100K): ~$1.80
- **Total AI cost: ~$2.40 per simple site**

At scale (100 sites/month): ~$240/month in AI inference costs.

---

## 6. Error Handling & Recovery

### Agent Failure
1. Agent fails → retry once with same prompt
2. Retry fails → try alternative approach
3. Alternative fails → mark "blocked" in STATUS.json
4. 3 total failures → stop, engage human
5. While blocked on one task → work on unblocked tasks

### Token Overrun
1. Agent at 80% of allocation → warning logged
2. Agent at 100% → hard stop, ship what exists
3. Director can reallocate from reserve (max 10% of project budget)
4. If reserve exhausted → ship as-is, document gaps

### Deploy Failure
1. Staging fails → fix and retry (uses review tokens)
2. Production fails → rollback to previous version
3. Rollback fails → mark blocked, engage human

---

## 7. Metrics & Observability

Every project produces:

| Metric | Where |
|--------|-------|
| Total tokens burned vs. budget | STATUS.json |
| Per-stage token usage | STATUS.json |
| Per-agent efficiency (output quality / tokens burned) | Review report |
| Time from intake to deploy | STATUS.json timestamps |
| Revision rounds needed | Review report |
| QA pass/fail rate | QA report |
| Lighthouse scores (perf, a11y, SEO, best practices) | Deploy log |

Pipeline-level metrics (across all projects):
- Average tokens per site type
- Average time to deploy
- First-pass QA rate (% that pass without revisions)
- Agent efficiency rankings
- Cost per site deployed

---

## 8. Future Enhancements (Not Now)

- **Template library**: Reusable Emdash theme starting points (reduces BUILD tokens by 30-40%)
- **Plugin marketplace**: Pre-built plugins that clients can add for flat token cost
- **Client portal**: Web UI for PRD submission, progress tracking, revision requests
- **Auto-scaling**: Spawn more agents when queue depth exceeds threshold
- **Learning loop**: Feed deploy outcomes back into agent prompts (which decisions led to fewer revisions?)
