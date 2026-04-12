# Tuned — Requirements Specification

**Product:** Tuned (Prompt Version Control)
**Generated:** 2026-04-12
**Source:** rounds/promptops/decisions.md
**Status:** Ready for Build

---

## Executive Summary

Tuned is a prompt version control system with zero-latency SDK, CLI-first UX, and edge-deployed infrastructure. Ship target: 7 hours.

### Core Decisions (Locked)
- **Architecture:** SDK-only, no proxy (zero latency impact on LLM calls)
- **Time Constraint:** 7-hour single session
- **Dashboard:** Static HTML, read-only (no React)
- **First Experience:** Value in <60 seconds from `npm install`

---

## Requirements by Category

### CLI Requirements

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-001 | `tuned init` | Initialize project, create local config with project ID and API key | <60 seconds | None | Config file created with valid API key |
| REQ-002 | `tuned push` | Push prompt to registry with auto-versioning | <60 seconds, auto-increment version | REQ-001 | Version incremented in D1, KV updated |
| REQ-003 | `tuned list` | List all prompts and versions | Show name, version, timestamp | REQ-001, REQ-007 | Lists all prompts correctly |
| REQ-004 | `tuned rollback` | Revert to previous version | Update active version | REQ-001, REQ-008 | Previous version marked active |
| REQ-005 | CLI Brand Voice | Direct, confident error messages | "This prompt has a problem. Here's the fix." | All CLI reqs | No hedging language in output |
| REQ-006 | Quickstart Docs | 60-second setup guide | /docs/quickstart.md | REQ-001, REQ-002 | Complete workflow in <60s |

### API Requirements (Cloudflare Worker)

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-007 | CRUD Prompts | Create, read, update, delete prompts | API key auth, D1 storage | REQ-025, REQ-028 | POST/GET/PUT/DELETE work |
| REQ-008 | CRUD Versions | Create, read prompt versions | Track version numbers, is_active flag | REQ-007, REQ-026 | Version numbering correct |
| REQ-009 | KV Read Endpoint | Read active prompt from Edge KV | <5ms latency | REQ-027 | Returns {version, content} |
| REQ-010 | Active Version Sync | Sync active version to KV on push/rollback | Non-blocking | REQ-008, REQ-009 | KV reflects D1 within seconds |
| REQ-011 | Async Logging | Fire-and-forget logging endpoint | Non-blocking | REQ-031 | Logs captured without latency |
| REQ-012 | Worker Config | Entry point with routing + bindings | wrangler.toml | REQ-028, REQ-027 | All bindings functional |

### SDK Requirements

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-015 | `getPrompt()` | Single function to fetch prompt by name | Returns {version, content} | REQ-009, REQ-016 | Function works correctly |
| REQ-016 | 5-min TTL Cache | Local in-memory cache | Auto-refresh after 5 min | REQ-015 | Second call uses cache |
| REQ-017 | Zero-Latency Injection | No proxy in critical path | SDK injects cached version | REQ-016 | 0ms added to LLM calls |
| REQ-018 | npm Package | Publish as standalone package | Manual publish post-build | REQ-015-017 | `npm install` works |
| REQ-019 | SDK Auth | Authenticate to fetch prompts | API key from config/env | REQ-015, REQ-032 | Auth succeeds |

### Dashboard Requirements

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-020 | Static HTML | Single index.html file | No React, no build | REQ-007 | Page loads in browser |
| REQ-021 | Read-Only View | Display prompts: name, version, timestamp, content | No edit/delete buttons | REQ-020 | All prompts displayed |
| REQ-022 | Static CSS | Minimal professional styling | /dashboard/styles.css | REQ-020 | Clean appearance |
| REQ-023 | Fetch Script | Vanilla JS to populate prompts | /dashboard/script.js | REQ-020, REQ-021 | Fetches and renders |
| REQ-024 | Dashboard Hosting | Deploy static dashboard | Cloudflare Pages (recommended) | REQ-020-023 | Accessible via URL |

### Schema Requirements

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-025 | Prompts Table | id, name (unique), created_at, updated_at | D1 | None | Schema created |
| REQ-026 | Versions Table | id, prompt_id (FK), version, content, is_active, created_at | D1 | REQ-025 | FK constraint works |
| REQ-027 | KV Schema | Key: `prompt:{name}`, Value: `{version, content}` | Edge KV | None | Format consistent |
| REQ-028 | D1 Creation | Create database + apply migrations | wrangler d1 | REQ-025, REQ-026 | Both tables exist |

### Config/Deploy Requirements

| ID | Title | Specification | Constraints | Dependencies | Verification |
|----|-------|--------------|-------------|--------------|--------------|
| REQ-029 | Local Config | Store project_id, api_key, backend_url | .tuned.json or ~/.tuned/ | REQ-001 | Config persists |
| REQ-030 | Worker Env | D1 binding, KV binding, logging URL | wrangler.toml | REQ-012 | All bindings work |
| REQ-031 | Logging Backend | Analytics Engine for volume writes | Not D1 (scale limit) | REQ-011 | Logs don't block |
| REQ-032 | API Key Strategy | Project-level key, generated on init | Secure, unique | REQ-001, REQ-007 | Keys work for auth |
| REQ-033 | npm Naming | Check "tuned" availability, backup: @tuned/sdk | Pre-build check | REQ-018 | Name available |
| REQ-034 | Deploy Script | wrangler deploy + migrations | REQ-012, REQ-028 | Deployment succeeds |

### Architecture Requirements (Constraints)

| ID | Title | Specification | Impact |
|----|-------|--------------|--------|
| REQ-035 | SDK-Only Architecture | No proxy adding 15-80ms latency | All SDK design |
| REQ-036 | 7-Hour Constraint | Complete all features in session | All scope decisions |
| REQ-037 | One-Tier Pricing | Single price, no feature walls | Pricing docs |
| REQ-038 | Value Before Effort | Users see value in <60 seconds | All UX decisions |

---

## Open Questions (Must Resolve Before Build)

### Critical Blockers

| Question | Options | Recommended | Impact |
|----------|---------|-------------|--------|
| **Logging Backend** (REQ-031) | Analytics Engine / Logpush / External | **Analytics Engine** (native, scales) | Blocks REQ-011 |
| **API Key Strategy** (REQ-032) | Project-level / Per-user / One-time | **Project-level** (simplest, 7h scope) | Blocks REQ-001, REQ-002 |
| **npm Package Name** (REQ-033) | "tuned" / "@tuned/sdk" | Check availability first | Blocks REQ-018 |

### Medium Priority

| Question | Options | Recommended | Impact |
|----------|---------|-------------|--------|
| **Dashboard Hosting** (REQ-024) | Pages / Embedded / Static | **Cloudflare Pages** | Affects deploy config |
| **Config File Location** (REQ-029) | .tuned.json / ~/.tuned/ | **.tuned.json** (project-local) | Affects CLI design |
| **Error Message Voice** (REQ-005) | Templates needed | Create 5-10 examples | Affects CLI polish |

---

## Scope Guard Rails

### MUST Ship in v1
- `tuned init`, `tuned push`, `tuned list`, `tuned rollback`
- SDK `getPrompt()` with 5-min cache
- Worker API (CRUD + KV layer)
- D1 schema (prompts, versions)
- Static HTML dashboard (read-only)
- Cloudflare Analytics Engine logging
- Quickstart docs

### CUT if Over Time (Priority Order)
1. Dashboard rollback button (CLI sufficient)
2. `tuned diff` command
3. Prompt analysis/parsing
4. CLI interactive mode
5. Error message polish
6. Performance benchmarks

### NEVER in v1 (Locked Cuts)
- React dashboard
- A/B testing
- Proxy architecture
- Prompt templates/libraries
- Analytics charts
- Slack/webhook integrations
- Automated npm publish

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| 7-hour scope creep | High | Critical | Ruthless cuts, enforce guard rails |
| npm name collision | Medium | Medium | Check before build, have backup |
| D1 cold start latency | Medium | High | Pre-warm, use KV for reads |
| Edge KV cache staleness | Medium | Medium | Version-based cache keys |
| CLI >60 seconds | Medium | Critical | Test on cold machine early |
| Auth complexity explosion | High | High | Stick to project-level API key |

---

## File Structure (Target)

```
tuned/
├── worker/
│   ├── src/
│   │   ├── index.ts           # Worker entry
│   │   ├── routes/
│   │   │   ├── prompts.ts     # CRUD endpoints
│   │   │   ├── versions.ts    # Version endpoints
│   │   │   └── log.ts         # Async logging
│   │   └── lib/
│   │       ├── auth.ts        # API key validation
│   │       └── kv.ts          # KV sync helpers
│   ├── schema.sql             # D1 schema
│   └── wrangler.toml
│
├── cli/
│   ├── bin/tuned              # Entry script
│   ├── src/
│   │   ├── cli.ts             # Commander.js setup
│   │   ├── commands/
│   │   │   ├── init.ts
│   │   │   ├── push.ts
│   │   │   ├── list.ts
│   │   │   └── rollback.ts
│   │   ├── config.ts          # Local config handling
│   │   └── api.ts             # API client
│   └── package.json
│
├── sdk/
│   ├── src/
│   │   ├── index.ts           # getPrompt() export
│   │   └── cache.ts           # 5-min TTL cache
│   └── package.json
│
├── dashboard/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
└── docs/
    └── quickstart.md
```

---

## Verification Checklist (Definition of Done)

### CLI
- [ ] `tuned init` creates config in <10 seconds
- [ ] `tuned push "prompt content"` succeeds, version increments
- [ ] `tuned list` shows all prompts with versions
- [ ] `tuned rollback` reverts to previous version
- [ ] Full flow (init → push) completes in <60 seconds

### API
- [ ] POST /api/prompts creates prompt in D1
- [ ] GET /api/prompts/:name returns prompt data
- [ ] POST /api/versions creates new version
- [ ] GET /kv/prompt/:name returns from Edge KV in <10ms

### SDK
- [ ] `getPrompt("name")` returns {version, content}
- [ ] Second call within 5 min uses cache (0ms network)
- [ ] After 5 min, cache refreshes automatically

### Dashboard
- [ ] index.html loads without errors
- [ ] Displays all prompts after CLI push
- [ ] No edit/delete buttons visible

### Deploy
- [ ] `wrangler deploy` succeeds
- [ ] All D1 bindings functional
- [ ] All KV bindings functional
- [ ] Dashboard accessible via URL

---

*Generated by agency-plan skill*
*Source: /home/agent/shipyard-ai/rounds/promptops/decisions.md*
