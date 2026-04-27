# Beam — Build Specification

**Derived from:** `prds/commandbar-prd.md` + `.planning/phase-1-plan.md` + `rounds/commandbar-prd/decisions.md`
**Status:** Ready for build
**Target:** `projects/commandbar-prd/build/beam/`
**Distribution:** `projects/commandbar-prd/deploy/beam-1.0.0.zip`

---

## 1. Goals

1. **Reduce common navigation tasks from 3-4 clicks to 2-3 keystrokes.**
2. **Ship a working MVP in one build session.**
3. **Achieve instant search results** via client-side `Array.filter()` (zero HTTP round-trips).
4. **Build an extensible architecture** so other plugins can register commands via a single `beam_items` filter hook.

---

## 2. Non-Goals (Explicitly Cut)

- REST API endpoints
- Server-side search
- Cache plugin integrations (WP Rocket, W3TC, LiteSpeed)
- Dynamic admin menu parsing
- Plugin activation / deactivation inside the palette
- Recent commands / command history
- `localStorage` of any kind
- Settings page
- Onboarding wizard / tooltips / tutorials
- AI suggestions
- Light mode
- Separate CSS file
- Build step / bundler / npm

---

## 3. Implementation Approach

### 3.1 Architecture

- **Exactly two files** in the plugin root: `beam.php` and `beam.js`. No subdirectories.
- **Procedural PHP** — no OOP classes, no autoloader.
- **Functional vanilla JS** — no frameworks, no build step, inline CSS injection.
- **Client-side index** — `wp_localize_script` delivers a JSON array of searchable items on every admin page load.
- **Zero REST API** — no `register_rest_route`, no AJAX, no `fetch`/`XMLHttpRequest`.

### 3.2 Data Model (Item Shape)

Each searchable item is an associative array / object with these keys:

| Key | Type | Description |
|-----|------|-------------|
| `title` | string | Display label (post title, user display name + email, admin page label, action label) |
| `url` | string | Destination URL or action target |
| `type` | string | Category: `content`, `users`, `actions`, `admin` |
| `newTab` | bool | (optional) If true, open in new tab |

### 3.3 `beam.php` — Responsibilities

1. **Plugin header** with WordPress.org required fields.
2. **`ABSPATH` security guard**.
3. **Define `BEAM_VERSION`** constant.
4. **`beam_build_index()`** — procedural function that:
   - Queries up to **200 published posts** (`post_status=publish`, `fields=ids`).
   - Queries up to **200 published pages**.
   - For each post/page: build item with `title`, `url` (`get_edit_post_link()`), `type: content`.
   - Queries up to **200 users** (`get_users`, `fields` limited to `ID`, `display_name`, `user_email`).
   - For each user: build item with `title` (display name + email), `url` (`get_edit_user_link()`), `type: users`.
   - Defines **hardcoded top-20 admin URLs** as associative array:
     - Dashboard (`index.php`)
     - Posts (`edit.php`)
     - Add New Post (`post-new.php`)
     - Categories (`edit-tags.php?taxonomy=category`)
     - Tags (`edit-tags.php?taxonomy=post_tag`)
     - Pages (`edit.php?post_type=page`)
     - Add New Page (`post-new.php?post_type=page`)
     - Media Library (`upload.php`)
     - Add New Media (`media-new.php`)
     - Comments (`edit-comments.php`)
     - Themes (`themes.php`)
     - Customize (`customize.php`)
     - Widgets (`widgets.php`)
     - Menus (`nav-menus.php`)
     - Plugins (`plugins.php`)
     - Add New Plugin (`plugin-install.php`)
     - Users (`users.php`)
     - Add New User (`user-new.php`)
     - Tools (`tools.php`)
     - Settings (`options-general.php`)
   - **Filters each admin URL through `current_user_can()`** before adding to index.
   - Adds **quick-action items**: Add New Post, Add New Page, View Site (`home_url('/')`, `newTab: true`).
   - Applies extensibility filter: `$items = apply_filters( 'beam_items', $items );`
5. **`admin_enqueue_scripts` hook**:
   - Enqueues `beam.js` from `plugin_dir_url(__FILE__) . 'beam.js'`.
   - Dependencies: `array()`, version: `BEAM_VERSION`, in_footer: `true`.
   - Calls `wp_localize_script( 'beam', 'beamIndex', array( 'items' => $items ) )` immediately after enqueue.
6. **No activation hooks, no settings pages, no REST routes, no separate CSS file.**

### 3.4 `beam.js` — Responsibilities

1. **IIFE wrapper** to avoid global namespace pollution.
2. **Inline CSS injection** — create a `<style>` tag appended to `document.head` containing:
   - Full-viewport overlay (`position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 999999; opacity: 0; transition: opacity 200ms ease;`)
   - Centered modal container (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 640px; width: 100%; background: #1e1e1e; border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);`)
   - Input field (`width: 100%; background: transparent; color: #fff; border: none; font-size: 16px; padding: 16px 20px;`)
   - Results list (`max-height: 400px; overflow-y: auto;`)
   - Category headers (`text-transform: uppercase; color: #888; font-size: 11px; padding: 8px 20px;`)
   - Result rows (`padding: 10px 20px; color: #fff; display: flex; justify-content: space-between; cursor: pointer;`)
   - Selected row (`background: #375a7f;`)
   - Empty state (`text-align: center; color: #888; padding: 20px;`)
3. **Modal lifecycle**:
   - `openModal()`: inject DOM if absent, add opacity class for 200ms fade-in, focus input, attach `keydown` listener.
   - `closeModal()`: set opacity to 0, wait 200ms, remove modal from DOM, detach listener, restore previous focus.
4. **Global hotkey listener** (`keydown` on `document`):
   - Trigger on `Cmd+K` (macOS) or `Ctrl+K` (Windows/Linux).
   - Guard against `event.target` being `<input>`, `<textarea>`, or `[contenteditable]`.
   - Call `event.preventDefault()` then `openModal()`.
5. **Focus trap**:
   - Track focusable elements inside modal (input + visible result rows).
   - On `Tab`: move to next focusable element; wrap from last to first.
   - On `Shift+Tab`: reverse.
   - Prevent default tab behavior outside modal.
6. **Search & render**:
   - `renderResults(query)` filters `beamIndex.items` with `title.toLowerCase().includes(query.toLowerCase())`.
   - Group results by `type` (`content`, `users`, `actions`, `admin`).
   - Limit each group to 5 results.
   - Render category headers and rows into results list.
   - Maintain `selectedIndex` variable.
7. **Keyboard navigation inside modal**:
   - `ArrowUp`: decrement `selectedIndex`.
   - `ArrowDown`: increment `selectedIndex`.
   - `Enter`: navigate to `selectedItem.url` (or `window.open(url, '_blank')` if `newTab: true`).
   - `Escape`: call `closeModal()`.
8. **Accessibility**:
   - `role="dialog"`, `aria-modal="true"`, `aria-label="Beam command palette"` on modal container.
   - `aria-live="polite"` on results list container.
9. **Zero `localStorage`, zero `fetch`/`XMLHttpRequest`, zero `wp.apiFetch`.**

### 3.5 `readme.txt` — WordPress.org Distribution

- Standard WordPress.org plugin header fields.
- Short description (≤139 characters).
- Long description, installation steps, FAQ, changelog.
- FAQ must document: index staleness (requires page reload), no settings page, dark mode only.

---

## 4. Verification Criteria

### 4.1 Structural Verification

| Criterion | Method | Pass Condition |
|-----------|--------|----------------|
| Exactly two plugin files | `ls build/beam/` | Only `beam.php` and `beam.js` exist (plus `readme.txt`) |
| No subdirectories | `find build/beam/ -type d` | Returns empty (or just `build/beam/` itself) |
| No separate CSS file | `ls build/beam/*.css` | Returns "No such file or directory" |
| No build artifacts | `ls build/beam/package.json` / `webpack.config.js` | Both return "No such file or directory" |
| ZIP contents | `unzip -l deploy/beam-1.0.0.zip` | Lists exactly `beam.php`, `beam.js`, `readme.txt` |

### 4.2 PHP Verification (`beam.php`)

| Criterion | Method | Pass Condition |
|-----------|--------|----------------|
| Syntax valid | `php -l beam.php` | "No syntax errors detected" |
| Line count ≤ 250 | `wc -l beam.php` | Output ≤ 250 |
| Security guard present | `grep "ABSPATH" beam.php` | Matches at least once |
| No REST routes | `grep -c "register_rest_route" beam.php` | Returns 0 |
| No settings pages | `grep -c "add_options_page\|add_menu_page" beam.php` | Returns 0 |
| Extensibility hook present | `grep "apply_filters( 'beam_items'" beam.php` | Matches at least once |
| Exactly one `wp_localize_script` | `grep -c "wp_localize_script" beam.php` | Returns 1 |
| Capability filtering | `grep "current_user_can" beam.php` | Matches at least once |
| No `localStorage` in PHP | `grep -c "localStorage" beam.php` | Returns 0 |

### 4.3 JavaScript Verification (`beam.js`)

| Criterion | Method | Pass Condition |
|-----------|--------|----------------|
| Syntax valid | `node --check beam.js` | No output (success) |
| Line count ≤ 350 | `wc -l beam.js` | Output ≤ 350 |
| Inline `<style>` injection | `grep "<style>" beam.js` | Matches at least once |
| No `localStorage` | `grep -c "localStorage" beam.js` | Returns 0 |
| No `fetch` | `grep -c "fetch" beam.js` | Returns 0 |
| No `XMLHttpRequest` | `grep -c "XMLHttpRequest" beam.js` | Returns 0 |
| No `wp.apiFetch` | `grep -c "wp.apiFetch" beam.js` | Returns 0 |
| `Cmd/Ctrl+K` listener | `grep -c "keydown" beam.js` | ≥ 1 |
| `Escape` close | `grep -c "Escape" beam.js` | ≥ 1 |
| ARIA attributes | `grep -c "aria-" beam.js` | ≥ 1 |

### 4.4 Functional Verification (Manual / Browser)

| Criterion | Method | Pass Condition |
|-----------|--------|----------------|
| Hotkey opens modal | Press `Cmd/Ctrl+K` in wp-admin | Dark overlay appears with search input |
| Typing filters results | Type "post" in input | Results list shows matching posts/pages/actions |
| Arrow keys navigate | Press `↓` / `↑` | Highlighted row moves; selected style applied |
| Enter navigates | Press `Enter` on selected row | Browser navigates to correct URL |
| Escape closes | Press `Escape` | Modal fades out and is removed from DOM |
| Click outside closes | Click dark overlay | Modal closes |
| Focus trap | Press `Tab` repeatedly | Focus cycles within modal only |
| Editable field guard | Press `Cmd/Ctrl+K` inside `<input>` | Modal does NOT open |
| Empty state | Type nonsense query "xyz123" | "No results" message displayed |
| View Site opens new tab | Select "View Site" action | Opens `home_url('/')` in new tab |

---

## 5. File Inventory

### Files to Create

| # | Path | Purpose | Approx. Lines |
|---|------|---------|---------------|
| 1 | `projects/commandbar-prd/build/beam/beam.php` | Main plugin file: header, index builder, asset enqueue, localize_script | ~200 |
| 2 | `projects/commandbar-prd/build/beam/beam.js` | Vanilla JS: modal, inline CSS, hotkey, focus trap, search, keyboard nav | ~300 |
| 3 | `projects/commandbar-prd/build/beam/readme.txt` | WordPress.org distribution metadata | ~80 |
| 4 | `projects/commandbar-prd/deploy/beam-1.0.0.zip` | Deployment archive | — |

### Files to Read (Reference Only — Do Not Modify)

| Path | Purpose |
|------|---------|
| `prds/commandbar-prd.md` | Original PRD |
| `.planning/phase-1-plan.md` | Build plan with wave breakdown |
| `rounds/commandbar-prd/decisions.md` | Locked debate decisions |
| `projects/agentpipe/build/agentpipe/agentpipe.php` | Reference WordPress plugin patterns |

### Deliverables (This Directory)

| Path | Purpose |
|------|---------|
| `deliverables/commandbar-prd/spec.md` | This specification |
| `deliverables/commandbar-prd/todo.md` | Running build checklist |
| `deliverables/commandbar-prd/tests/` | Executable verification scripts |

---

## 6. Risk Acceptance

| Risk | Mitigation in Build | Acceptance |
|------|---------------------|------------|
| Index staleness | Documented in `readme.txt` FAQ | Accepted — new content appears after next page load |
| Keyboard collision (`Cmd/Ctrl+K`) | Guard against editable fields + `preventDefault()` | Accepted — v1.1 may add customizable hotkey |
| Large-site payload | Cap each dataset at 200 items | Accepted — total payload stays under ~500KB |
| Accessibility gap | Real focus trap + ARIA implementation | Mitigated — allocate full implementation time |
| Maintenance debt | Inline CSS + two-file architecture | Accepted — budget for v2 refactor if traction |

---

## 7. Success Criteria (Final QA)

- [ ] `beam.php` parses without syntax errors (`php -l`)
- [ ] `beam.js` parses without syntax errors (`node --check`)
- [ ] ZIP contains exactly three files (`beam.php`, `beam.js`, `readme.txt`)
- [ ] No banned patterns present (`register_rest_route`, `localStorage`, `fetch`, `add_options_page`, `package.json`)
- [ ] Plugin activates on fresh WordPress install
- [ ] `Cmd/Ctrl+K` opens palette from any wp-admin page
- [ ] Search returns filtered results instantly (no network delay)
- [ ] `Enter` navigates to selected item
- [ ] `Escape` closes and removes modal from DOM
- [ ] Focus is trapped inside modal while open
- [ ] `beam_items` filter hook is documented and testable
- [ ] `readme.txt` passes WordPress.org standards review
