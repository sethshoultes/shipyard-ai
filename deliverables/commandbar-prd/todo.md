# Beam — Build Checklist

**Instructions:** Complete tasks in order. Mark `[x]` only after verification passes. Each task should take < 5 minutes.

---

## Wave 1 — Core Files (Parallel)

### beam.php

- [ ] **1.1 Create `projects/commandbar-prd/build/beam/` directory**
  verify: `ls projects/commandbar-prd/build/beam/` returns directory exists

- [ ] **1.2 Write plugin header + security guard**
  verify: `grep "Plugin Name: Beam" projects/commandbar-prd/build/beam/beam.php && grep "ABSPATH" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.3 Define `BEAM_VERSION` constant**
  verify: `grep "define('BEAM_VERSION'" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.4 Implement `beam_build_index()` — post query (200 max, fields=ids)**
  verify: `grep "fields=ids\|fields => 'ids'" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.5 Implement `beam_build_index()` — page query (200 max, fields=ids)**
  verify: `grep "post_type=page\|post_type => 'page'" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.6 Implement `beam_build_index()` — user query (200 max)**
  verify: `grep "get_users" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.7 Add hardcoded top-20 admin URLs array**
  verify: `grep -c "index.php\|edit.php\|post-new.php" projects/commandbar-prd/build/beam/beam.php` ≥ 10

- [ ] **1.8 Wrap admin URLs in `current_user_can()` capability checks**
  verify: `grep -c "current_user_can" projects/commandbar-prd/build/beam/beam.php` ≥ 5

- [ ] **1.9 Add quick-action items (Add New Post, Add New Page, View Site)**
  verify: `grep -c "View Site\|Add New Post\|Add New Page" projects/commandbar-prd/build/beam/beam.php` ≥ 3

- [ ] **1.10 Add `apply_filters('beam_items', $items)` extensibility hook**
  verify: `grep "apply_filters( 'beam_items'" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.11 Hook `admin_enqueue_scripts` to enqueue `beam.js`**
  verify: `grep "admin_enqueue_scripts" projects/commandbar-prd/build/beam/beam.php && grep "wp_enqueue_script" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.12 Call `wp_localize_script('beam', 'beamIndex', …)`**
  verify: `grep "wp_localize_script" projects/commandbar-prd/build/beam/beam.php`

- [ ] **1.13 PHP syntax check**
  verify: `php -l projects/commandbar-prd/build/beam/beam.php` returns "No syntax errors"

- [ ] **1.14 Line count check (≤250)**
  verify: `wc -l projects/commandbar-prd/build/beam/beam.php` shows ≤ 250

### beam.js

- [ ] **1.15 Create `beam.js` as IIFE**
  verify: `head -n 1 projects/commandbar-prd/build/beam/beam.js` contains `(function`

- [ ] **1.16 Inject inline `<style>` tag with all required CSS**
  verify: `grep "<style>" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.17 Define overlay styles (fixed, rgba(0,0,0,0.6), z-index 999999)**
  verify: `grep "rgba(0,0,0,0.6)" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.18 Define modal container styles (max-width: 640px, #1e1e1e, border-radius: 12px)**
  verify: `grep "640px" projects/commandbar-prd/build/beam/beam.js && grep "#1e1e1e" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.19 Define selected row style (`background: #375a7f`)**
  verify: `grep "#375a7f" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.20 Implement `openModal()` — inject DOM, fade-in, focus input**
  verify: `grep "openModal" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.21 Implement `closeModal()` — fade-out, remove from DOM after 200ms**
  verify: `grep "closeModal" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.22 Add global `keydown` listener for `Cmd/Ctrl+K`**
  verify: `grep -c "metaKey\|ctrlKey" projects/commandbar-prd/build/beam/beam.js` ≥ 1

- [ ] **1.23 Guard hotkey against editable fields (input, textarea, contenteditable)**
  verify: `grep -c "contenteditable\|TEXTAREA\|INPUT" projects/commandbar-prd/build/beam/beam.js` ≥ 2

- [ ] **1.24 Implement focus trap (Tab cycles within modal)**
  verify: `grep "Tab" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.25 Implement `renderResults(query)` with `Array.filter()`**
  verify: `grep "filter" projects/commandbar-prd/build/beam/beam.js`

- [ ] **1.26 Group results by `type` with category headers**
  verify: `grep -c "content\|users\|actions\|admin" projects/commandbar-prd/build/beam/beam.js` ≥ 4

- [ ] **1.27 Limit each group to 5 results**
  verify: `grep "5" projects/commandbar-prd/build/beam/beam.js` (manual check: slice/limit logic)

- [ ] **1.28 Implement keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`)**
  verify: `grep -c "ArrowUp\|ArrowDown\|Enter\|Escape" projects/commandbar-prd/build/beam/beam.js` ≥ 4

- [ ] **1.29 Add ARIA attributes (`role="dialog"`, `aria-modal`, `aria-label`, `aria-live`)**
  verify: `grep -c "aria-" projects/commandbar-prd/build/beam/beam.js` ≥ 2

- [ ] **1.30 JS syntax check**
  verify: `node --check projects/commandbar-prd/build/beam/beam.js` exits 0

- [ ] **1.31 Line count check (≤350)**
  verify: `wc -l projects/commandbar-prd/build/beam/beam.js` shows ≤ 350

- [ ] **1.32 Banned pattern scan — no `localStorage`**
  verify: `grep -c "localStorage" projects/commandbar-prd/build/beam/beam.js` returns 0

- [ ] **1.33 Banned pattern scan — no `fetch` / `XMLHttpRequest` / `wp.apiFetch`**
  verify: `grep -c "fetch\|XMLHttpRequest\|wp.apiFetch" projects/commandbar-prd/build/beam/beam.js` returns 0

---

## Wave 2 — Distribution & QA

### readme.txt

- [ ] **2.1 Create `readme.txt` with WordPress.org headers**
  verify: `grep "Plugin Name:" projects/commandbar-prd/build/beam/readme.txt`

- [ ] **2.2 Include short description (≤139 chars)**
  verify: `grep "Short description:" -A1 projects/commandbar-prd/build/beam/readme.txt` (manual: count chars)

- [ ] **2.3 Include installation section**
  verify: `grep "== Installation ==" projects/commandbar-prd/build/beam/readme.txt`

- [ ] **2.4 Include FAQ covering index staleness, no settings, dark-only**
  verify: `grep -c "staleness\|settings\|dark" projects/commandbar-prd/build/beam/readme.txt` ≥ 2

- [ ] **2.5 Include changelog for v1.0.0**
  verify: `grep "== Changelog ==" projects/commandbar-prd/build/beam/readme.txt`

### Packaging

- [ ] **2.6 Create `projects/commandbar-prd/deploy/` directory**
  verify: `ls projects/commandbar-prd/deploy/` returns directory exists

- [ ] **2.7 ZIP the plugin into `beam-1.0.0.zip`**
  verify: `unzip -l projects/commandbar-prd/deploy/beam-1.0.0.zip` lists exactly 3 files

### Final QA

- [ ] **2.8 Run `test-structure.sh`**
  verify: `./deliverables/commandbar-prd/tests/test-structure.sh` exits 0

- [ ] **2.9 Run `test-php.sh`**
  verify: `./deliverables/commandbar-prd/tests/test-php.sh` exits 0

- [ ] **2.10 Run `test-js.sh`**
  verify: `./deliverables/commandbar-prd/tests/test-js.sh` exits 0

- [ ] **2.11 Run `test-banned-patterns.sh`**
  verify: `./deliverables/commandbar-prd/tests/test-banned-patterns.sh` exits 0

- [ ] **2.12 Manual browser check: `Cmd/Ctrl+K` opens modal**
  verify: visually confirm dark overlay appears

- [ ] **2.13 Manual browser check: typing filters results**
  verify: type "post" and see results update instantly

- [ ] **2.14 Manual browser check: `Enter` navigates**
  verify: select a post and press `Enter` → reaches edit screen

- [ ] **2.15 Manual browser check: `Escape` closes and removes modal**
  verify: press `Escape`, inspect DOM — modal element is gone

- [ ] **2.16 Plugin activates without errors on fresh WordPress**
  verify: activate in wp-admin, no PHP warnings/notices

---

## Done

- [ ] All tests pass
- [ ] All line-count constraints respected
- [ ] ZIP ready for WordPress.org submission
- [ ] Tag `v1.0.0` and ship
