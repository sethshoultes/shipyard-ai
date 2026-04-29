# Requirements Traceability Matrix
# Relay — AI Form Handler & Lead Router

**Generated**: 2026-04-29
**Source Documents**:
- `/home/agent/shipyard-ai/prds/relay-ai-form-handler.md` (PRIMARY)
- `/home/agent/shipyard-ai/rounds/relay-ai-form-handler/decisions.md` (LOCKED — overrides PRD where in conflict)
- `/home/agent/shipyard-ai/rounds/relay-ai-form-handler/essence.md` (Creative direction)

**Project Slug**: `relay-ai-form-handler`
**Total Requirements**: 14
**Status**: Phase 1 — v1 MVP Build

---

## Requirements Summary

| ID | Requirement | Priority | Source |
|----|-------------|----------|--------|
| RELAY-001 | Plugin activates cleanly, registers all components, and creates necessary database artifacts on activation | P0 | decisions.md MVP #1, #2 |
| RELAY-002 | Custom Post Type `relay_lead` stores submission metadata + content with structured fields | P0 | decisions.md MVP #2; PRD #2 (overridden: CPT instead of custom table) |
| RELAY-003 | Classification taxonomy: categories `Sales`, `Support`, `Spam`, `General` and urgency `High`, `Medium`, `Low` with locked hex color codes | P0 | decisions.md MVP #4; PRD Design Direction |
| RELAY-004 | Settings page accepts Claude API key (encrypted at rest) and integration toggles on a single screen | P0 | decisions.md MVP #7; PRD #7; risk #7 |
| RELAY-005 | Form handler intercepts Contact Form 7 submissions before standard email send | P0 | decisions.md MVP #1; PRD #1; decisions Open Question #3 |
| RELAY-006 | Form handler exposes generic `admin_post` / REST endpoint for any HTML form with nonce/token validation | P0 | decisions.md MVP #1; PRD #1 |
| RELAY-007 | Claude API client sends submission content via `wp_remote_post` and receives structured JSON classification | P0 | decisions.md MVP #3; PRD #3 (overridden: direct PHP, no Worker) |
| RELAY-008 | Classification cache deduplicates identical submissions via content hash to reduce API costs | P0 | decisions.md MVP #6; decisions Locked #11 |
| RELAY-009 | WP Cron job processes unclassified leads asynchronously without blocking form submission response | P0 | decisions.md MVP #3; decisions Locked #3 |
| RELAY-010 | Admin inbox displays classified leads with color-coded badges, sort/filter by category/urgency/date | P0 | decisions.md MVP #5; PRD #5 (overridden: PHP-rendered, no React) |
| RELAY-011 | One-click reply action opens native email client with pre-filled To/Subject | P0 | PRD #6; decisions MVP #5 |
| RELAY-012 | Basic email routing: sends `wp_mail` notifications to configured addresses based on classification category | P0 | PRD #4; decisions Open Question #3 |
| RELAY-013 | Plugin passes WordPress.org coding standards: nonces, capability checks, prepared SQL, input sanitization, output escaping | P0 | PRD Must-Have #6; risk #7, #8 |
| RELAY-014 | PHP 7.4+ compatibility, zero exotic extensions, graceful degradation if Claude API fails | P0 | decisions MVP #8; risk #2, #8, #9 |

---

## Technical Context (Verified)

### Architecture Lock
- **Platform**: WordPress plugin (pure PHP), NOT Emdash/Cloudflare per locked decisions #2
- **Data storage**: Custom Post Type (`relay_lead`) per locked decisions; custom table deferred to v2
- **Admin UI**: PHP-rendered with vanilla JS per Phil Jackson tie-breaker; React build pipeline deferred to v2
- **AI classification**: Direct PHP-to-Claude via `wp_remote_post` per locked decisions #2; Cloudflare Worker cut
- **Async mechanism**: WP Cron per locked decisions #3

### Design Tokens (Locked from PRD)
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#F97316` | Action buttons, routing indicators |
| Background | `#FFFFFF` | Clean admin UI base |
| Surface | `#F8FAFC` | Card backgrounds (slate-50) |
| Border | `#E2E8F0` | Dividers (slate-200) |
| Text | `#0F172A` | Body copy (slate-900) |
| Accent | `#38BDF8` | AI-generated badges (sky blue) |
| Urgency High | `#EF4444` | High priority leads |
| Urgency Medium | `#F59E0B` | Medium priority leads |
| Urgency Low | `#22C55E` | Low priority leads |
| Spam | `#64748B` | Quarantined / spam leads (slate-500) |

### Classification Taxonomy (Locked from decisions.md)
- **Categories**: `Sales`, `Support`, `Spam`, `General`
- **Urgency levels**: `High`, `Medium`, `Low`
- **Storage**: Post meta or taxonomy terms on `relay_lead` CPT

### File Structure (Locked from decisions.md)
```
relay/
├── relay.php
├── includes/
│   ├── class-relay.php
│   ├── class-form-handler.php
│   ├── class-claude-client.php
│   ├── class-storage.php
│   ├── class-async-processor.php
│   ├── class-cache.php
│   └── class-admin.php
├── admin/
│   ├── views/
│   │   ├── inbox.php
│   │   └── settings.php
│   ├── css/relay-admin.css
│   └── js/relay-admin.js
├── assets/relay-badge.svg
├── languages/
└── readme.txt
```

### Exclusions (Explicitly Cut in decisions.md)
- Gutenberg form block → v1.1 or later
- CSV export → cut entirely for v1
- AI reply draft → v2 only
- Slack webhook routing → v2 only
- Gravity Forms integration → v1.1
- React / Webpack build step for admin UI → v2 only

---

## Hindsight Risk Notes

- **No project-specific high-churn files** — this is a greenfield build.
- **Uncommitted changes in repo**: `dreams/dream-2026-04-29T07-2-*.md`, `prds/relay-ai-form-handler.md`, `rounds/relay-ai-form-handler/` — all related to this project intake; safe to ignore during build.
- **General repo risk**: HIGH (15 high-churn files, 20 bug-associated files), but none touch the greenfield plugin workspace.
- **Key risk**: `.planning/phase-1-plan.md` and `.planning/REQUIREMENTS.md` are high-churn files themselves (48 and 44 changes respectively). Coordinate with other active projects to avoid planning file conflicts.

---

## Open Questions Resolved for Phase 1

| # | Question | Resolution | Rationale |
|---|----------|------------|-----------|
| 1 | Admin inbox rendering layer | **PHP-rendered with vanilla JS** | Phil Jackson tie-breaker: preserves Steve's emotional promise within Elon's feasibility constraint. Schedule React rebuild for v2. |
| 2 | Data storage | **Custom Post Type for v1** | Fastest to build, WP-native. v2 migration path if SaaS tier demands it. |
| 3 | Form plugin priority | **Contact Form 7 + generic hook** | Widest free install base. Gravity Forms is v1.1. |
| 4 | Real-time admin updates | **30s AJAX polling** | Acceptable with PHP inbox. Define simple backoff on error. |
| 5 | Classification taxonomy schema | **Locked above** | Hex codes and labels from PRD §4, categories from decisions.md. |
