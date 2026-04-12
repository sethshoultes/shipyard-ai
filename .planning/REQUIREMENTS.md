# REQUIREMENTS — PromptOps/Drift Phase 1 (Build)

> *Atomic requirements extracted from decisions.md and promptops.md*
> *Source: /home/agent/shipyard-ai/rounds/promptops/decisions.md*
> *Product: Drift (CLI + API) + NERVE (Pipeline Daemon)*

---

## Summary

**Total Requirements: 33**
- **P0 (Must Ship): 16** — Core product functionality
- **P1 (Should Ship): 17** — Quality and polish
- **Deferred (V2+): 10** — Explicitly cut from scope

**Build Status:** Code exists (~1,275 lines) but incomplete
- API: ~731 lines (ready)
- CLI: ~447 lines (partial — list/rollback missing)
- SDK: 0 lines (NOT BUILT)
- Dashboard: 0 lines (NOT BUILT)
- NERVE: ~1,055 lines (ready, integration undefined)

**Board Verdict:** HOLD (5.1/10) — Build phase never completed

---

## 1. P0 Requirements (MUST Ship in V1)

### CLI Commands

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| REQ-CLI-001 | `drift init` creates project | Generates API key, saves to `~/.drift/config.json`, no signup wall | PARTIAL |
| REQ-CLI-002 | `drift push <name> --file <path>` | Reads file, auto-increments version, stores in D1 | PARTIAL |
| REQ-CLI-003 | `drift list` shows prompts | Displays all prompts with version history, timestamps | NOT BUILT |
| REQ-CLI-004 | `drift rollback <name> --version <n>` | Sets specified version active, live immediately | NOT BUILT |

### API Endpoints (Cloudflare Worker)

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| REQ-API-001 | `POST /api/projects` | Creates project, generates API key, returns project_id | BUILT |
| REQ-API-002 | `GET /api/prompts` | Returns all prompts for authenticated project | BUILT |
| REQ-API-003 | `POST /api/prompts` | Creates new version, auto-increments version_number | BUILT |
| REQ-API-004 | `GET /api/prompts/:name` | Returns prompt with full version history | BUILT |
| REQ-API-005 | `POST /api/prompts/:name/rollback` | Updates active_version, returns success | BUILT |
| REQ-API-006 | API key validation middleware | Validates Authorization header, rejects invalid keys (401) | BUILT |

### SDK

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| REQ-SDK-001 | `getPrompt(name)` exported | TypeScript function returns prompt content | NOT BUILT |
| REQ-SDK-002 | 5-minute TTL caching | Cache hits return <1ms, API fallback <50ms | NOT BUILT |

### Dashboard

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| REQ-DASH-001 | Dashboard displays prompts | Static HTML table: name, version, timestamp | NOT BUILT |
| REQ-DASH-002 | Read-only interface | No rollback buttons (CLI only) | NOT BUILT |

### Meta Requirements

| ID | Requirement | Acceptance Criteria | Status |
|----|-------------|---------------------|--------|
| REQ-META-001 | 60-second time-to-value | `npm install` + `drift init` + `drift push` < 60 seconds | NOT TESTED |
| REQ-META-002 | D1 database deployed | Schema applied, migrations run | NOT DONE |

---

## 2. P1 Requirements (Should Ship in V1)

### CLI Quality

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| REQ-CLI-005 | npm package published | Installable as `drift` or `@drift/cli` | P1 |
| REQ-CLI-006 | Config file management | Reads from `~/.drift/config.json`, survives restarts | P1 |
| REQ-CLI-007 | Clear error messages | Network errors return actionable messages | P1 |
| REQ-CLI-008 | Uses commander.js | Tech stack locked per decisions | P1 |

### SDK Quality

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| REQ-SDK-003 | Zero latency overhead | Cache hits <1ms, never blocks app | P1 |
| REQ-SDK-004 | Graceful fallback | If API fails, returns cached version, logs warning | P1 |
| REQ-SDK-005 | npm package published | Installable as `drift-sdk` or `@drift/sdk` | P1 |
| REQ-SDK-006 | Environment variable config | Accepts `DRIFT_API_KEY`, `DRIFT_ENDPOINT` | P1 |

### Dashboard Quality

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| REQ-DASH-003 | Version history view | Click prompt → shows timeline with timestamps | P1 |
| REQ-DASH-004 | Professional styling | Tailwind CDN, clean typography | P1 |
| REQ-DASH-005 | Hosted and accessible | Deployed to Cloudflare (Pages or Worker) | P1 |
| REQ-DASH-006 | No React framework | Pure HTML/CSS/Vanilla JS, <500 LOC | P1 |

### API Quality

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| REQ-API-007 | D1 transactions | No data loss on concurrent writes | P1 |

### NERVE (Conditional — Recommend Defer)

| ID | Requirement | Acceptance Criteria | Priority |
|----|-------------|---------------------|----------|
| REQ-NERVE-001 | PID lockfile management | Prevents duplicate instances | P1 |
| REQ-NERVE-002 | Queue persistence | Survives daemon restart | P1 |
| REQ-NERVE-003 | Abort flag handling | Clean shutdown on flag | P1 |
| REQ-NERVE-004 | Verdict parsing (JSON) | Returns structured QA results | P1 |
| REQ-NERVE-005 | Standard log format | `[TIMESTAMP] [COMPONENT] message` | P1 |
| REQ-NERVE-006 | Drift integration | Auto-rollback on metrics (TBD) | P2 |

---

## 3. Deferred Requirements (V2+)

| ID | Feature | Reason | Target |
|----|---------|--------|--------|
| DEFER-001 | Proxy architecture | Latency killer, trust barrier | V2+ |
| DEFER-002 | A/B testing | Adoption before optimization | V2 |
| DEFER-003 | `drift diff` command | Nice-to-have, not essential | V2 |
| DEFER-004 | Dashboard rollback button | CLI sufficient for V1 | V2 |
| DEFER-005 | Semantic diff (AI-powered) | Requires LLM integration | V2 |
| DEFER-006 | Analytics dashboards | Charts are a crutch | V2+ |
| DEFER-007 | Team collaboration | Single developer first | V2 |
| DEFER-008 | Prompt marketplace | Network effects play | V3 |
| DEFER-009 | Retention features | Shonda's roadmap | V1.1 |
| DEFER-010 | Billing (Stripe) | After market validation | Post-V1 |

---

## 4. Locked Design Decisions

Per Steve Jobs / Elon Musk debate (decisions.md):

| # | Decision | Winner | Rationale |
|---|----------|--------|-----------|
| 1 | **Name: Drift/NERVE** | Steve Jobs | One-word names shape destiny |
| 2 | **No Proxy in V1** | Elon Musk | 15-80ms latency is commercial suicide |
| 3 | **SDK-First Architecture** | Elon Musk | "Add 2 lines of code" > "reroute traffic" |
| 4 | **Dashboard Minimal** | Elon Musk | Static HTML, read-only |
| 5 | **Polished Dashboard** | Steve Jobs (partial) | Clean but not elaborate |
| 6 | **Bash Over Agents** | Consensus | Determinism over probabilistic instructions |
| 7 | **Zero Configuration** | Steve Jobs | Every option is a failure to decide |
| 8 | **60-Second Time-to-Value** | Consensus | First dopamine hit must be fast |
| 9 | **CLI-First** | Consensus | Terminal discovery > web UI |
| 10 | **Confident Voice** | Steve Jobs | "This prompt has a problem. Here's the fix." |
| 11 | **Cut A/B Testing** | Consensus | V2 scope |
| 12 | **Cut diff Command** | Consensus | Ship lean |
| 13 | **One Pricing Tier** | Steve Jobs | No feature walls |

---

## 5. Open Questions (Require Resolution)

| ID | Question | Status | Recommended Resolution |
|----|----------|--------|------------------------|
| OQ-003 | Authentication model | **OPEN** | Project-level API key, SHA-256 hashed |
| OQ-004 | Logging backend | **OPEN** | D1 for prompts, Analytics Engine for logs |
| OQ-005 | Dashboard hosting | **OPEN** | Embed in Worker (single deployment) |
| OQ-006 | SDK distribution | **OPEN** | Reserve `drift-sdk` on npm |

---

## 6. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| RISK-001 | No competitive moat | High | Critical | Moat is adoption speed, pivot to intelligence (V2) |
| RISK-002 | SDK adoption unclear | Medium | High | Ship SDK, track adoption, iterate |
| RISK-003 | No revenue mechanism | High | High | Stripe integration (30 min) |
| RISK-004 | Build phase never completed | **REALIZED** | Critical | Execute now |
| RISK-005 | Doc-to-code ratio | **REALIZED** | Medium | Ship code, document later |
| RISK-006 | NERVE premature | High | Medium | Kill or integrate with Drift |
| RISK-007 | D1 write limits | High | High | Test under load, Analytics Engine fallback |
| RISK-008 | KV cold start latency | Medium | High | Benchmark, document SLA |

---

## 7. Acceptance Criteria (V1 Complete)

### Drift Core
- [ ] `drift init` creates project, generates API key, no signup wall
- [ ] `drift push` versions prompt, stores in D1
- [ ] `drift list` shows all prompts with version history
- [ ] `drift rollback` reverts to specified version, live immediately
- [ ] SDK `getPrompt()` fetches with caching, zero latency impact
- [ ] Dashboard displays prompts/versions (read-only)
- [ ] README.md <50 lines, setup in 60 seconds

### NERVE (If Ships)
- [ ] `daemon.sh` creates PID lockfile, prevents duplicates
- [ ] `queue.sh` persists queue, recovers on restart
- [ ] `abort.sh` sets flag, daemon clean-shuts
- [ ] `parse-verdict.sh` returns JSON with verdict
- [ ] All scripts use standard log format
- [ ] README.md documents all commands

### Meta
- [ ] All files committed to deliverables
- [ ] QA Pass confirms zero P0 issues
- [ ] At least one component actually runs

---

## 8. Documentation References

### decisions.md Key Sections
- **Locked Decisions** (Section I): 13 decisions locked
- **MVP Feature Set** (Section II): CLI, API, SDK, Dashboard scope
- **File Structure** (Section III): Expected directory layout
- **Open Questions** (Section IV): 4 unresolved items
- **Risk Register** (Section V): 12 identified risks
- **Board Verdict** (Section VI): 5.1/10 average, HOLD

### docs/EMDASH-GUIDE.md Key Sections
- **Section 5: Deployment** — Cloudflare Workers + D1 + R2 patterns
- **Section 6: Plugin System** — Not applicable to Drift
- Not directly applicable but provides Worker deployment patterns

### Existing Codebase
- `/home/agent/shipyard-ai/deliverables/promptops/drift/api/` — API implementation
- `/home/agent/shipyard-ai/deliverables/promptops/drift/cli/` — CLI implementation
- `/home/agent/shipyard-ai/nerve/` — NERVE scripts (source of truth)

---

## Verification Checklist

- [x] All P0 requirements identified (16 total)
- [x] All P1 requirements extracted (17 total)
- [x] Deferred features documented (10 total)
- [x] Risk register populated (8 risks)
- [x] Open questions documented (4 items)
- [x] Acceptance criteria defined
- [x] Documentation references cited

---

*Generated: April 12, 2026*
*Project Slug: promptops*
*Product Name: Drift + NERVE*
