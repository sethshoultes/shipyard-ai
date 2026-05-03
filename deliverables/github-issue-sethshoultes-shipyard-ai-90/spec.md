# Spec: AgentPress v1 WordPress Plugin

**Project**: AgentPress WordPress Plugin
**Version**: 1.0.0
**Issue**: sethshoultes/shipyard-ai#90
**Date**: 2026-05-03

---

## Goals

From the PRD, AgentPress is a WordPress plugin that turns your site into an AI agent orchestration hub. The core value proposition is:

- **Single REST endpoint** for agent orchestration
- **Built-in agents**: ContentWriter (generates prose) and ImageGenerator (creates images)
- **Claude-powered routing** with local keyword map fallback
- **Zero-config WordPress integration** using native patterns

---

## Implementation Approach

Based on the phase-1 plan, this is a 5-wave parallel build:

### Wave 1 - Foundation (Parallel)
1. **Plugin Bootstrap** - Main plugin file, CPT registration, activation hooks
2. **JSON Parser Hardening** - Extract/validate JSON from Claude responses with markdown fence stripping
3. **Admin CSS** - Minimal native WordPress styling (100 lines max)

### Wave 2 - Core Classes (Parallel)
4. **Agents Base Class** - Internal capability registry, no public API in v1
5. **Activity Logger** - CPT-based logging with auto-prune (500 max → delete 50)
6. **ContentWriter Agent** - Claude API integration, topic/tone/length schema
7. **ImageGenerator Agent** - Cloudflare Workers AI integration, prompt/size schema

### Wave 3 - Orchestration (Sequential)
8. **Router** - Local keyword map + Claude fallback for ambiguous intent

### Wave 4 - Integration (Sequential)
9. **REST API** - Single endpoint `/wp-json/agentpress/v1/run` with auth, routing, execution

### Wave 5 - Admin & Polish (Parallel)
10. **Admin UI** - One settings screen under Tools → AgentPress
11. **README + Verification** - WordPress.org readme, exclusion audit, smoke test

---

## Verification Criteria

### Core Functionality
- [ ] Plugin activates without fatal errors on clean WordPress install
- [ ] Two CPTs registered: `agentpress_capability` and `agentpress_log`
- [ ] Two built-in capabilities auto-created: `content_writer` and `image_generator`
- [ ] Settings option created with default values

### JSON Parser (Critical Path)
- [ ] Handles valid JSON: `{"test": "value"}`
- [ ] Strips markdown fences: `` ```json{"test": "value"}``` ``
- [ ] Returns WP_Error for truncated/hallucinated responses
- [ ] Validates routing JSON schema (capability, reasoning, payload)
- [ ] All 10+ test cases pass without PHP fatal errors

### Agent Execution
- [ ] ContentWriter generates text with Claude API, returns `{text, tokens_used}`
- [ ] ImageGenerator returns HTTPS URL from Cloudflare Workers
- [ ] Both agents validate input schemas and return WP_Error on bad input
- [ ] Output text truncated to 2048 characters as required

### Router Logic
- [ ] Local keywords route without API calls (write/blog/post → ContentWriter)
- [ ] Image keywords route locally (image/photo/picture → ImageGenerator)
- [ ] Ambiguous input triggers Claude fallback with manifest in system prompt
- [ ] Invalid capabilities return `agentpress_no_match` error

### REST API Endpoint
- [ ] `POST /wp-json/agentpress/v1/run` requires authentication
- [ ] Missing `task` returns 400 with `agentpress_missing_task`
- [ ] Successful requests return 200 with `{success, routing, result, latency_ms}`
- [ ] Errors return 500 with structured `{code, message, data}`
- [ ] All executions logged to CPT with latency and status

### Admin Interface
- [ ] Admin page appears under Tools → AgentPress
- [ ] Settings fields save API key, Worker URL, model
- [ ] wp-config.php constants disable fields with note
- [ ] Log viewer shows last 50 tasks with status pills
- [ ] No tabs, no manual task runner, no dark mode toggle

### Performance & Stability
- [ ] Average latency under 4000ms for both agents
- [ ] CPT logging auto-prunes at 500 entries
- [ ] No revisions or autosave for log entries
- [ ] Plugin ZIP under 500KB with no bloat

---

## Files to Be Created or Modified

### New Files
```
agentpress/
├── agentpress.php                    # Main plugin file
├── includes/
│   ├── class-parser.php              # JSON parser (high-risk)
│   ├── class-agents.php              # Capability registry
│   ├── class-logger.php              # CPT activity logger
│   ├── class-router.php              # Orchestration layer
│   ├── class-rest-api.php            # Single REST endpoint
│   └── agents/
│       ├── class-content-writer.php  # ContentWriter agent
│       ├── class-image-generator.php # ImageGenerator agent
│       └── class-seo-meta.php       # SEO Meta agent
├── admin/
│   ├── class-admin.php               # Admin screen
│   └── css/
│       └── agentpress-admin.css      # Minimal native styles
└── readme.txt                        # WordPress.org readme
```

### Database Changes
- New custom post types: `agentpress_capability`, `agentpress_log`
- New option: `agentpress_settings`
- Post meta for capabilities and logs

### WordPress Integration
- Menu item under Tools → AgentPress
- REST namespace: `agentpress/v1`
- Settings fields with wp-config.php constant override

---

## Exclusions (Explicitly NOT in v1)

Based on debate decisions:
- No drag-and-drop canvas
- No freemium billing or Stripe integration
- No dark mode or advanced mode toggles
- No JSON/YAML editing in the UI
- No template marketplace
- No real-time collaboration
- No admin dashboard with 40 toggles
- No onboarding modals or tooltips
- No exposed execution logs in primary UI
- No WordPress plugin bifurcation (this IS the WordPress plugin)

---

## Success Metrics

From the PRD:
- All acceptance criteria in REQUIREMENTS.md met
- All tests pass without PHP fatal errors
- Plugin ready for WordPress.org submission
- Zero bloat, single crafted admin screen
- Average latency < 4000ms
- Plugin size < 500KB
