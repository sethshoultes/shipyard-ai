# AgentPress v1 — Build Specification

**PRD:** `/home/agent/shipyard-ai/prds/prd-agentpress-2026-05-03.md`
**Plan:** `/home/agent/shipyard-ai/.planning/phase-1-plan.md`
**Decisions:** `/home/agent/shipyard-ai/rounds/prd-agentpress-2026-05-03/decisions.md`
**Date:** 2026-05-03

---

## 1. Goals (from PRD)

1. Ship a working WordPress plugin in one session that installs without friction via zip upload or WP CLI.
2. Provide two built-in agents: **ContentWriter**, **ImageGenerator**.
3. Expose an extensible capability registry so third-party developers can add agents (v2, but infrastructure in v1).
4. Route tasks through Claude with a system prompt that matches intent to capability.
5. Demonstrate the full pipeline on our own agency site before public release.

---

## 2. Implementation Approach (from Plan)

### Wave 1 — Foundation (Parallel)
- **Task 1:** Plugin bootstrap with CPT registration (`agentpress_capability`, `agentpress_log`)
- **Task 2:** JSON parser hardening with 10+ edge-case tests
- **Task 3:** Minimal admin CSS (under 100 lines, native WordPress styling)

### Wave 2 — Core Classes (Parallel)
- **Task 4:** Agents base class + capability registry loader
- **Task 5:** Activity logger with auto-prune (delete oldest 50 when count > 500)
- **Task 6:** ContentWriter agent (Claude API integration)
- **Task 7:** ImageGenerator agent (Cloudflare Workers AI integration)

### Wave 3 — Orchestration (Sequential)
- **Task 8:** Router with local PHP keyword map + Claude fallback

### Wave 4 — Integration (Sequential)
- **Task 9:** REST API endpoint `POST /wp-json/agentpress/v1/run`

### Wave 5 — Admin & Polish (Parallel)
- **Task 10:** Single admin screen (Tools → AgentPress)
- **Task 11:** README + integration smoke test + exclusion audit

---

## 3. Verification Criteria

### 3.1 Plugin Bootstrap (Task 1)
| Criterion | Verification Method |
|-----------|---------------------|
| Plugin activates without fatal errors | Check `wp-content/debug.log` is empty after activation |
| CPT `agentpress_capability` registered | `SELECT post_type FROM wp_posts WHERE post_type = 'agentpress_capability'` returns rows |
| CPT `agentpress_log` registered | `SELECT post_type FROM wp_posts WHERE post_type = 'agentpress_log'` returns rows |
| Default settings option created | `SELECT option_value FROM wp_options WHERE option_name = 'agentpress_settings'` returns serialized array with `default_model = 'claude-3-5-sonnet-20241022'` |
| Built-in capabilities seeded | Query `agentpress_capability` CPT returns `content_writer` and `image_generator` posts |

### 3.2 JSON Parser (Task 2)
| Criterion | Verification Method |
|-----------|---------------------|
| Parses valid JSON directly | Test case: `{"capability":"content_writer"}` → parsed array |
| Strips markdown fences | Test case: ` ```json {"capability":"x"} ``` ` → parsed array |
| Handles truncated JSON | Test case: `{"capability":"content` → WP_Error with `agentpress_parser_error` |
| Handles hallucinated slugs | Test case: `{"capability":"video_editor"}` → WP_Error (invalid capability) |
| Sanitizes payload strings | Test case: payload with `<script>` tags → `wp_kses_post` strips tags |

### 3.3 Admin CSS (Task 3)
| Criterion | Verification Method |
|-----------|---------------------|
| File under 100 lines | `wc -l admin/css/agentpress-admin.css` ≤ 100 |
| All selectors prefixed | `grep -v '^\.' admin/css/agentpress-admin.css | grep -v '^\s'` shows only prefixed selectors |
| No framework imports | `grep -i 'tailwind\|bootstrap' admin/css/agentpress-admin.css` returns nothing |

### 3.4 Agents Registry (Task 4)
| Criterion | Verification Method |
|-----------|---------------------|
| `Agents::get_capabilities()` returns 2 capabilities | Call method, assert count = 2 with slugs `content_writer`, `image_generator` |
| `Agents::build_manifest()` returns serializable array | `json_encode(Agents::build_manifest())` succeeds |
| No public `agentpress_register_capability()` function | `grep -r 'function agentpress_register_capability'` returns nothing |

### 3.5 Logger (Task 5)
| Criterion | Verification Method |
|-----------|---------------------|
| Log entry created per task | Call `Logger::log()`, verify row in `wp_posts` with post_type `agentpress_log` |
| Auto-prune at 500 entries | Create 505 logs programmatically, verify count ≤ 550 after prune |
| No revisions for log CPT | Query `wp_posts` for `post_type = 'revision'` with parent in `agentpress_log` returns 0 |

### 3.6 ContentWriter Agent (Task 6)
| Criterion | Verification Method |
|-----------|---------------------|
| Validates required `topic` field | Call with missing `topic` → WP_Error |
| Validates `tone` enum | Call with `tone='casual'` → WP_Error |
| Returns `text` and `tokens_used` | Call with valid payload → array with both keys |
| Truncates to 2048 chars | Mock long response, verify `strlen(text)` ≤ 2048 |

### 3.7 ImageGenerator Agent (Task 7)
| Criterion | Verification Method |
|-----------|---------------------|
| Validates required `prompt` field | Call with missing `prompt` → WP_Error |
| Validates `size` enum | Call with `size='2048x2048'` → WP_Error |
| Returns HTTPS URL only | Mock `http://` response → WP_Error with HTTPS guardrail message |
| Handles timeout gracefully | Mock unreachable URL → WP_Error with user-friendly timeout message |

### 3.8 Router (Task 8)
| Criterion | Verification Method |
|-----------|---------------------|
| Local keyword map routes `write` → `content_writer` | Call `Router::route('write a blog post')` → `source='local'`, `capability='content_writer'` |
| Local keyword map routes `image` → `image_generator` | Call `Router::route('generate an image')` → `source='local'`, `capability='image_generator'` |
| Claude fallback for ambiguous tasks | Call `Router::route('something vague')` with valid API key → `source='claude'` |
| Local routing does NOT call Claude | Mock HTTP client, verify no outbound request on local match |

### 3.9 REST API (Task 9)
| Criterion | Verification Method |
|-----------|---------------------|
| Requires authentication | POST without auth → 401/403 |
| Requires `task` field | POST with empty `task` → 400 `agentpress_missing_task` |
| Returns correct success shape | POST valid task → 200 with `success`, `routing`, `result`, `latency_ms` |
| Logs all executions | After POST, verify `agentpress_log` CPT has new entry |
| Returns structured errors | POST with invalid API key → 500 with `code`, `message`, `data` |

### 3.10 Admin UI (Task 10)
| Criterion | Verification Method |
|-----------|---------------------|
| Page loads at Tools → AgentPress | Navigate to page, verify no PHP errors |
| No tabs, no manual runner | Visual inspection: no `.nav-tab-wrapper`, no textarea with "Run" button |
| Settings persist | Enter API key, save, reload → value persists |
| Log viewer displays entries | After running tasks, verify table shows Time, Capability, Status, Latency |
| wp-config constants override | Define `AGENTPRESS_CLAUDE_KEY`, verify field disabled with note |

### 3.11 README + Polish (Task 11)
| Criterion | Verification Method |
|-----------|---------------------|
| readme.txt has valid WP.org header | Header contains `=== AgentPress ===`, `Contributors:`, `Tags:`, `Requires at least:` |
| Three-paragraph description | Count paragraphs in Description section = 3 |
| Exclusion audit passes | `grep -r 'seo_meta\|stream\|async\|queue\|wizard\|billing'` returns no matches in plugin code |
| Smoke test passes | cURL POST to `/wp-json/agentpress/v1/run` → 200, log appears in admin |

---

## 4. Files to Create or Modify

### New Files (11 total)

| File | Purpose | Wave |
|------|---------|------|
| `agentpress/agentpress.php` | Main plugin file, bootstrap, activation hooks | 1 |
| `agentpress/includes/class-parser.php` | JSON extraction and validation | 1 |
| `agentpress/admin/css/agentpress-admin.css` | Minimal admin styling | 1 |
| `agentpress/includes/class-agents.php` | Capability registry loader | 2 |
| `agentpress/includes/class-logger.php` | CPT activity log with prune | 2 |
| `agentpress/includes/agents/class-content-writer.php` | ContentWriter agent | 2 |
| `agentpress/includes/agents/class-image-generator.php` | ImageGenerator agent | 2 |
| `agentpress/includes/class-router.php` | Keyword map + Claude fallback | 3 |
| `agentpress/includes/class-rest-api.php` | Single REST endpoint | 4 |
| `agentpress/admin/class-admin.php` | Admin screen | 5 |
| `agentpress/readme.txt` | WordPress.org readme | 5 |

### Third Agent (1 file)

| File | Purpose |
|------|---------|
| `agentpress/includes/agents/class-seo-meta.php` | SEO Meta agent — generates title tags and meta descriptions via Claude API |

### Modified Files

None — this is a net-new plugin with no existing file modifications.

---

## 5. File Structure

```
agentpress/
├── agentpress.php
├── includes/
│   ├── class-parser.php
│   ├── class-agents.php
│   ├── class-logger.php
│   ├── class-router.php
│   ├── class-rest-api.php
│   └── agents/
│       ├── class-content-writer.php
│       ├── class-image-generator.php
│       └── class-agent-third.php
├── admin/
│   ├── class-admin.php
│   └── css/
│       └── agentpress-admin.css
└── readme.txt
```

---

## 6. Key Constraints

1. **Two agents only:** ContentWriter and ImageGenerator. SEOMeta is explicitly excluded.
2. **No manual task runner UI:** Test via cURL/Postman only.
3. **No tabs in admin:** Single screen under Tools → AgentPress.
4. **No encrypted storage theater:** Standard options or wp-config constants only.
5. **CPT-based logging with auto-prune:** Delete oldest 50 when count > 500.
6. **Local keyword map first:** Claude fallback only for ambiguous intent.
7. **Synchronous REST only:** No streaming, no async queues.
8. **Native WordPress styling:** No Tailwind, no Bootstrap, under 100 lines CSS.
