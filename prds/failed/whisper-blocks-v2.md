# PRD — Whisper Blocks v2 (file-explicit re-queue, was issue #88)

## 1. Project Overview
**Project name:** whisper-blocks-v2
**Product type:** WordPress plugin (Gutenberg block + REST endpoint)
**Origin:** Re-queue of #88, which has now failed twice (genuine fail + hollow ship).

## 2. What it is
A Gutenberg block that accepts an audio file (WAV/MP3) or audio URL, runs OpenAI Whisper API for transcription, and renders the transcript with synced playback.

## 3. Files to create — non-negotiable (≥ 12 source files)

### Plugin core (PHP)
1. `whisper-blocks.php` — plugin header (Plugin Name, Version, Description, Author, License). Registers init hook.
2. `includes/class-plugin.php` — main bootstrap class, hooks into init, registers block + REST.
3. `includes/class-rest-controller.php` — REST endpoint `POST /wp-json/whisper-blocks/v1/transcribe` accepts media URL or attachment ID, calls OpenAI Whisper, returns `{ transcript, segments[] }`.
4. `includes/class-block-registrar.php` — registers the Gutenberg block via `register_block_type`.
5. `includes/class-settings.php` — admin settings page for OpenAI API key + default voice.

### Block (TypeScript / React)
6. `block/block.json` — Gutenberg block manifest (apiVersion 3, attributes, supports).
7. `block/edit.tsx` — editor view with audio uploader + "Transcribe" button.
8. `block/save.tsx` — front-end markup (audio player + transcript with timestamps).
9. `block/index.ts` — `registerBlockType` entry.
10. `block/style.scss` — minimal styles.

### Build
11. `package.json` — uses `@wordpress/scripts` for build. NO Bull, NO Redis.
12. `tsconfig.json`
13. `webpack.config.js` (or use wp-scripts default)

### Tests
14. `tests/test-rest-controller.php` — PHPUnit test (mocked Whisper API)
15. `tests/block-edit.test.tsx` — Jest + React Testing Library test for Edit component

### Docs
16. `README.md`
17. `readme.txt` — WordPress.org plugin directory format

## 4. Success criteria
- ≥ 12 source files at listed paths
- `composer dump-autoload` succeeds (PSR-4)
- `npm run build` produces `build/` artifacts
- PHP syntax check passes for all .php files
- Block manifest is valid (parseable JSON, schema fields)
- README.md has install + usage steps

## 5. Constraints
- All under `deliverables/whisper-blocks-v2/`
- WordPress plugin-directory standards (readme.txt, plugin header, sanitization for all REST inputs)
- Use existing OpenAI key pattern: `wp_options` storage, never hard-coded
- Build-gate demands ≥ 3 source files; this PRD demands ≥ 12
- Do NOT analyze more than once; build the files
