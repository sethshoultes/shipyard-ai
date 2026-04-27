# PRD: CommandBar for WordPress

**Status:** Approved (Dream Cycle 2026-04-25)
**Author:** Phil Jackson, Agency Lead
**Target Ship Date:** 2026-04-25 (single session)
**Distribution:** WordPress.org plugin directory

---

## 1. Overview

CommandBar is a keyboard-driven command palette for WordPress admin. Users press `CMD+K` (macOS) or `Ctrl+K` (Windows/Linux) anywhere in wp-admin to open a modal overlay. They can search posts, pages, users, plugins, and settings; execute quick actions; and navigate the admin without touching the mouse.

It makes WordPress feel like a modern OS — fast, keyboard-first, and intentionally designed.

---

## 2. User Story

> As a WordPress developer or power user, I want to navigate wp-admin and run actions using only my keyboard so that I can manage sites faster and avoid clicking through nested menus.

**Primary user:** WordPress developers, agency staff, power users managing multiple sites.
**Secondary user:** Content editors who prefer keyboard workflows.

---

## 3. Goals & Non-Goals

**Goals:**
- Reduce common navigation tasks from 3-4 clicks to 2-3 keystrokes.
- Ship a working MVP in one 4-hour build session.
- Achieve sub-200ms search results for all indexed content.
- Build an extensible architecture so other plugins can register commands via a single hook.

**Non-Goals:**
- Frontend search (this is wp-admin only).
- AI suggestions or natural language processing.
- Customization UI for command sources (MVP uses sensible defaults).

---

## 4. Features

### Must Have (MVP)
1. **Global Hotkey:** `CMD+K` / `Ctrl+K` opens the palette from any wp-admin page. `Escape` or click-backdrop closes it.
2. **Post/Page Search:** Search all public post types by title. Selecting a result navigates to the edit screen.
3. **User Search:** Search users by display name or email. Navigate to user profile.
4. **Admin Page Search:** Search registered admin menu items by label. Navigate on selection.
5. **Quick Actions:**
   - "Add New Post" → `/wp-admin/post-new.php`
   - "Add New Page" → `/wp-admin/post-new.php?post_type=page`
   - "View Site" → opens frontend in new tab
   - "Clear Cache" → if WP Rocket / W3TC / LiteSpeed detected, trigger clear; else show "No supported cache plugin detected"
6. **Visual Polish:** Dark overlay, centered modal, monospaced result list with keyboard highlight, category headers (Content, Users, Actions), empty state.
7. **Accessibility:** Full keyboard navigation (Up/Down arrows, Enter to select, Escape to close), focus trap inside modal, ARIA roles.

### Nice to Have (if time permits)
8. **Plugin Search:** Search installed plugins by name. "Activate" / "Deactivate" actions.
9. **Recent Commands:** Persist last 5 selected commands in `localStorage` and surface them at the top when palette opens with no query.
10. **Extensibility Hook:** `command_bar_register_commands( $registry )` — other plugins push commands into the palette at runtime.

---

## 5. Technical Architecture

### Stack
- **Backend:** PHP 7.4+ (WordPress plugin)
- **Frontend:** Vanilla JavaScript (no build step required; bundle as single file if desired)
- **API:** WordPress REST API with custom endpoints
- **Styling:** Inline styles + minimal CSS injected via `wp_enqueue_style`

### File Structure
```
commandbar/
├── commandbar.php          # Main plugin file, bootstraps admin hooks
├── includes/
│   ├── class-admin.php     # Enqueues assets, renders admin footer mount point
│   ├── class-rest-api.php  # Registers REST routes
│   └── class-commands.php  # Aggregates command data from WP
├── assets/
│   ├── commandbar.js       # Modal, hotkey, fetch, render logic
│   └── commandbar.css      # Overlay, modal, list, highlight styles
└── readme.txt              # WordPress.org plugin header
```

### REST API Endpoints
| Endpoint | Method | Auth | Response |
|----------|--------|------|----------|
| `/wp-json/commandbar/v1/search` | GET | `current_user_can( 'read' )` | JSON array of commands: `{ id, title, type, url, action }` |
| `/wp-json/commandbar/v1/clear-cache` | POST | `manage_options` | `{ success: bool, message: string }` |

**Search endpoint behavior:**
- Accepts `?q={string}` (min 1 char).
- Queries posts (post, page), users, admin menu items in parallel via `WP_Query` / `get_users` / `$menu` global.
- Returns max 5 per category, ranked by relevance (title starts with > title contains).
- Response time target: < 150ms.

### Frontend Logic (`commandbar.js`)
1. Listen for `keydown` on `document`. If `Cmd/Ctrl + K` and not inside input/textarea, open modal.
2. Inject modal HTML into `#commandbar-root` (rendered in admin footer by PHP).
3. On input, debounce fetch to `/wp-json/commandbar/v1/search?q=...` at 100ms.
4. Render grouped results with arrow-key selection.
5. `Enter` navigates to `url` or executes `action`.
6. `Escape` removes modal from DOM (not just hides — avoids focus issues).

### PHP Admin Integration
- Hook `admin_enqueue_scripts` to load JS/CSS on all wp-admin pages.
- Hook `admin_footer` to print `<div id="commandbar-root"></div>`.
- Hook `rest_api_init` to register routes.

---

## 6. UI/UX Spec

### Modal Design
- **Overlay:** `rgba(0,0,0,0.6)`, `z-index: 999999`, fixed full viewport.
- **Modal container:** `max-width: 640px`, centered vertically and horizontally, `background: #1e1e1e`, `border-radius: 12px`, `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5)`.
- **Input:** Top of modal, full width, dark background, white text, placeholder "Type a command or search...", no border, `font-size: 16px`, `padding: 16px 20px`.
- **Results list:** Below input, `max-height: 400px`, scrollable, category headers in muted gray uppercase (`CONTENT`, `USERS`, `ACTIONS`).
- **Result row:** `padding: 10px 20px`, white text, flexbox with title left and keyboard hint right (e.g., "↵").
- **Selected row:** `background: #375a7f` (WordPress admin blue, adapted for dark).
- **Empty state:** "No results for 'xyz'" centered, muted text.

### Keyboard UX
- `Cmd/Ctrl + K`: Open.
- `Escape`: Close.
- `↑ / ↓`: Navigate results.
- `Enter`: Execute selected.
- `Tab`: Do nothing (trap focus).

---

## 7. One-Session Build Checklist

- [ ] Scaffold plugin file with WordPress.org headers.
- [ ] Create `class-admin.php` to enqueue `commandbar.js` and `commandbar.css` on all admin pages.
- [ ] Render `#commandbar-root` in admin footer.
- [ ] Implement `class-rest-api.php` with `/search` endpoint (posts, pages, users, admin menus).
- [ ] Implement `/clear-cache` endpoint with detection for WP Rocket, W3 Total Cache, LiteSpeed Cache.
- [ ] Build `commandbar.js`: hotkey listener, modal injection, debounced fetch, render, keyboard nav, selection.
- [ ] Build `commandbar.css`: overlay, dark modal, result list, selected state, responsive rules.
- [ ] Add accessibility: focus trap, ARIA roles, visible focus indicators.
- [ ] Write `readme.txt` for WordPress.org submission.
- [ ] Test on fresh WP install: hotkey opens, search returns, navigation works, Escape closes.
- [ ] Tag version 1.0.0, zip, and ship.

**Estimated build time:** 3.5–4 hours.

---

## 8. Distribution & Go-to-Market

1. **WordPress.org:** Submit as free plugin with GPL v2+ license. Use "CommandBar" slug or fallback "fast-admin-commander" if taken.
2. **Agency Dogfood:** Install on all agency-managed sites immediately. Gather internal feedback within 48 hours.
3. **Twitter/X:** 30-second screen recording showing `CMD+K` → type "hello" → edit post in 2 seconds. Tag WordPress and developer accounts.
4. **Blog Post:** "We built Raycast for WordPress in one afternoon." Publish on agency blog with technical breakdown.
5. **Plugin Extensibility:** Reach out to 3 plugin authors (SEO, forms, cache) to add native CommandBar support, creating network effects.

---

## 9. Success Metrics (30 Days)

| Metric | Target |
|--------|--------|
| WordPress.org active installs | 500+ |
| Average rating | 4.5+ stars |
| Daily active usage (internal) | 100% of agency staff |
| Search response time (p95) | < 200ms |
| Support tickets | < 5 (indicates stability) |

---

## 10. Risk & Mitigation

| Risk | Mitigation |
|------|------------|
| `CMD+K` conflicts with browser/OS shortcuts | Use `event.preventDefault()` on match; allow customization in v1.1. |
| Large sites have slow search | Cap results at 5 per category; use `WP_Query` with `no_found_rows => true` and `fields => ids`. |
| Admin menu items vary wildly by role | Only index items the current user can actually `current_user_can()` access. |
| Modal breaks in older WP versions | Test on WP 6.0+; declare `Requires at least: 6.0`. |

---

## 11. Future Roadmap (Post-MVP)

- **v1.1:** Plugin search/activation, recent commands, customizable hotkey.
- **v1.2:** `command_bar_register_commands()` extensibility API.
- **v1.3:** AI-powered "Smart Actions" (e.g., "Optimize this post for SEO" → redirects to Yoast focus keyword).
- **v2.0:** Frontend command bar for logged-in users (subscriber/patron commands).

---

**Decision:** Build CommandBar. Ship today. No vaporware.
