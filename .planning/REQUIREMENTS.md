# AgentPress v1 — Atomic Requirements

**Generated**: 2026-05-03
**Source PRD**: `/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md`
**Source Decisions**: `/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md`
**Status**: Locked for Build Phase

> **Important:** `decisions.md` OVERRIDES the PRD where they conflict. The locked decisions (e.g., SEOMeta killed, manual runner killed, standard key storage, two agents only) are the binding spec.

---

## Plugin Bootstrap & Structure

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-001 | Plugin main file bootstrap | PRD §5.1, Decisions File Structure | `agentpress.php` exists with valid WP header, namespace `AgentPress`, activates without errors |
| R-002 | Activation — Capability CPT | PRD §5.1, Decision 7 | CPT `agentpress_capability` registered with `public => false`, `show_ui => false`, `supports => []` |
| R-003 | Activation — Log CPT | PRD §5.1, Decision 7 | CPT `agentpress_log` registered with `public => false`, `show_ui => false`, no revisions, no autosave |
| R-004 | File structure compliance | Decisions File Structure | All locked files exist; no extra files created. Third agent file is placeholder only |

---

## REST API Endpoint

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-005 | REST namespace | PRD §5.1, §6 | `agentpress/v1` registered; 404 on unregistered routes |
| R-006 | Single endpoint | PRD §5.3, Decision 5 | `POST /wp-json/agentpress/v1/run` accepts POST only; no other endpoints in v1 |
| R-007 | Auth — Nonce | PRD §5.3 | `X-WP-Nonce` from logged-in users accepted; invalid returns 401 |
| R-008 | Auth — Application Passwords | PRD §5.3 | Basic Auth with Application Password accepted; invalid returns 401 |
| R-009 | Authorization | PRD §5.3 | Requires `manage_options` or custom `agentpress_run` capability; 403 without |
| R-010 | Request validation | PRD §5.3, §6 | Missing `task` returns 400 `agentpress_missing_task`; optional `context` defaults to `{}` |
| R-011 | Success response shape | PRD §5.3, §6 | JSON contains `success` (bool), `routing` (object with `capability`, `reasoning`), `result` (object), `latency_ms` (int) |
| R-012 | Error response shape | PRD §6 | 400/500 errors include `code`, `message`, `data.status`; 500 includes `data.capability` |
| R-013 | Synchronous only | PRD §3, Decision 11 | Endpoint blocks until complete; no streaming; 30s timeout |

---

## Router & Routing Logic

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-014 | Local PHP keyword map | Decision 2 | `str_contains` matching routes built-in agents without LLM call |
| R-015 | Claude fallback | Decision 2 | Claude called ONLY when local map misses; fallback latency 4–8s acceptable |
| R-016 | Keyword whitelist locked | Decisions Open Q #2 | Content keywords (`write`, `content`, `blog`, `post`, `article`, `text`) → `content_writer`; image keywords (`image`, `picture`, `photo`, `graphic`) → `image_generator` |
| R-017 | System prompt construction | PRD §5.3 | Prompt includes capability manifest; instructs Claude to return ONLY JSON (no markdown); specifies schema `{"capability":"...","reasoning":"...","payload":{...}}` |
| R-018 | No third-party routing | Decision 8 | Router handles only built-in agents; no external capability calls in v1 |

---

## JSON Parser Hardening (Non-Negotiable)

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-019 | Markdown fence stripping | Decision 12 | ` ```json...``` ` responses parsed correctly; fences removed before decode |
| R-020 | Truncated response handling | Decision 12 | Partial JSON does not fatal-error; returns structured parser error |
| R-021 | Hallucinated slug handling | Decision 12 | Unknown slugs return error (not crash); fallback to `capability: none` |
| R-022 | Schema validation | Decisions Open Q #7 | Required field `capability` validated; missing/invalid fields rejected with error |
| R-023 | Parser budget honored | Decision 12 | Dedicated `class-parser.php` exists; tested with markdown fences, truncated JSON, hallucinated keys before any other feature |

---

## Built-In Agents

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-024 | ContentWriter registration | PRD §5.4, Decision 4 | Slug `content_writer`; callable via router; in capability list |
| R-025 | ContentWriter input schema | PRD §5.4 | Accepts `topic` (string), `tone` (enum: friendly/professional/witty), `length` (enum: short/medium/long); invalid values return error |
| R-026 | ContentWriter Claude integration | PRD §5.4 | Calls Anthropic Messages API via `wp_remote_post` with configured key; handles API errors gracefully |
| R-027 | ContentWriter guardrail | PRD §5.4 | Output truncated to 2048 chars max; `tokens_used` still reported |
| R-028 | ContentWriter output shape | PRD §5.4 | Returns `{"text":"...","tokens_used":42}` |
| R-029 | ImageGenerator registration | PRD §5.4, Decision 4 | Slug `image_generator`; callable via router; in capability list |
| R-030 | ImageGenerator input schema | PRD §5.4 | Accepts `prompt` (string), `size` (enum: 512x512/1024x1024); invalid values return error |
| R-031 | ImageGenerator CF Workers integration | PRD §5.4 | Calls configured `cf_worker_url` via `wp_remote_post`; handles Worker errors gracefully |
| R-032 | ImageGenerator HTTPS guardrail | PRD §5.4 | Returned URL must be HTTPS; HTTP rejected |
| R-033 | ImageGenerator output shape | PRD §5.4 | Returns `{"url":"https://...","format":"webp","size":"1024x1024"}` |
| R-034 | ImageGenerator error shape | PRD §5.4 | Failed Worker call returns structured WP_Error-style error with original message |
| R-035 | SEOMeta excluded | Decision 4 | No `seo_meta` capability, no `class-seo-meta.php`, no references in code |
| R-036 | Third agent placeholder | Decision 4, File Structure | File `includes/agents/class-agent-third.php` exists as minimal stub; not registered |

---

## Capability Registry

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-037 | CPT-based storage | PRD §5.2, Decision 7 | `agentpress_capability` CPT stores `_agentpress_name`, `_agentpress_description`, `_agentpress_input_schema`, `_agentpress_handler` as post_meta; `post_name` = slug |
| R-038 | Built-in auto-registration | PRD §5.2, Decision 4 | ContentWriter and ImageGenerator inserted into CPT on activation; immediately queryable |
| R-039 | No third-party API | Decision 8 | `agentpress_register_capability()` function does NOT exist in v1; no external registration mechanism |

---

## Activity Logging

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-040 | Log every task | PRD §5.3, Decision 7 | Log entry created on every task completion (success or error); `post_title` = truncated task string |
| R-041 | Log meta fields | PRD §5.3, §7, Decisions Open Q #4 | Meta: `_agentpress_capability`, `_agentpress_payload`, `_agentpress_result`, `_agentpress_latency_ms`, `_agentpress_status` (`success` or `error`); timestamp = `post_date` |
| R-042 | Auto-prune | PRD §7, Decisions Open Q #4 | On insert, if count > 500, delete oldest 50; pruning non-blocking; count never exceeds 550 |
| R-043 | Log viewer | PRD §5.5, Decision 7 | Admin displays last 50 logs with time, capability, status pill (green/red), latency |

---

## Admin Dashboard

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-044 | Single screen, no tabs | Decision 3, Decision 5 | Page slug `tools-agentpress` under Tools menu; no tab navigation; no wizards |
| R-045 | No manual task runner | Decision 5 | No textarea + Run button; testing via cURL/Postman only |
| R-046 | Claude API key field | PRD §5.5, Decision 6 | Text input (type="password"), saved to `agentpress_settings`; supports `AGENTPRESS_CLAUDE_KEY` constant override |
| R-047 | Cloudflare Worker URL field | PRD §5.5 | Text input for Worker URL, saved to `agentpress_settings`; URL format validation |
| R-048 | Default model select | PRD §5.5 | Dropdown with `claude-3-5-sonnet-20241022` as default; saved to `agentpress_settings` |
| R-049 | Standard key storage | Decision 6 | Plain option storage; no `wp_hash`/`base64_encode`; `wp-config.php` constants take precedence; UI disabled when constant is defined |
| R-050 | Native WordPress styling | PRD §5.5, §8, Decision 3 | Uses `.wp-list-table`, `.form-table`; no CSS frameworks; custom CSS minimal (spacing/typography only); WP admin colors |
| R-051 | Activity log display | PRD §5.5 | Table shows timestamp, capability, status pill, latency; most recent first |
| R-052 | No front-end chat | Decision 9 | No shortcode, no public UI; REST API only interface |
| R-053 | No onboarding wizard | PRD §8, Decision 5 | Single admin screen; setup in README only |

---

## Settings & Storage

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-054 | Settings option structure | PRD §7 | Option key `agentpress_settings`; serialized array with `claude_api_key`, `cf_worker_url`, `default_model`, `installed_version` |
| R-055 | No encrypted storage | Decision 6 | No encryption/decryption functions; keys readable as plain text in DB |
| R-056 | wp-config constant support | Decision 6 | Constants `AGENTPRESS_CLAUDE_KEY`, `AGENTPRESS_CF_WORKER_URL`, `AGENTPRESS_DEFAULT_MODEL` checked before option values; UI fields disabled when constants defined |

---

## Distribution & Documentation

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-057 | readme.txt | PRD §9, Decision 10 | WP.org header format; ~3 paragraphs; tags: `ai`, `agents`, `automation`, `claude`, `orchestration`; API usage disclosed |
| R-058 | README API example | PRD §9 | cURL example for `POST /wp-json/agentpress/v1/run`; installation steps |
| R-059 | No billing/SaaS mentions | Decision 8 | No "Pro", "Premium", "tier" references; no monetization mentions |
| R-060 | No third-party registration docs | Decision 8 | README does not document `agentpress_register_capability()`; v2 only |

---

## Non-Functional & Exclusions

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| R-061 | No async queues | Decision 11 | No WP-Cron task processing; no queue library; all tasks synchronous |
| R-062 | No BYOK | Decision 11 | Single site-level key; no per-user keys; BYOK noted as v2 trigger |
| R-063 | 30-second timeout | PRD §14 | `wp_remote_post` timeout = 30s; timeout returns structured error |
| R-064 | Latency target | PRD §13 | Average `latency_ms` < 4000 for built-in agents (measured over 100+ tasks) |
| R-065 | Zero fatal errors | PRD §13 | No fatal PHP errors after 100 tasks; all errors handled gracefully |
| R-066-R-075 | Exclusions verified | Decisions 4–9, 11 | SEOMeta dead, manual runner dead, no dev API, no streaming, no async, no BYOK, no front-end chat, no onboarding, no encrypted storage, third agent placeholder only |

---

## Requirements Summary

| Category | Count |
|----------|-------|
| Plugin Bootstrap | 4 |
| REST API | 9 |
| Router | 5 |
| Parser | 5 |
| Built-In Agents | 13 |
| Capability Registry | 3 |
| Activity Logging | 4 |
| Admin Dashboard | 10 |
| Settings & Storage | 3 |
| Distribution | 4 |
| Non-Functional | 15 |
| **Total** | **71** |
