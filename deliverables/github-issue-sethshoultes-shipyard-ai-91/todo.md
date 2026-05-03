# Promptfolio — To-Do List

**Issue:** sethshoultes/shipyard-ai#91
**Status:** Spec complete, awaiting implementation
**Architecture:** Static SaaS (no React, no backend, no auth)

---

## Phase 1: Project Bootstrap

- [ ] Create project directory `promptfolio/` with subdirs (`src/`, `app/`, `lib/`, `public/`) — verify: `ls -la promptfolio/` shows all directories
- [ ] Create `promptfolio/package.json` with minimal deps (sharp only, no React) — verify: `cat package.json` under 30 lines, no react/next dependencies
- [ ] Create `promptfolio/.gitignore` for Node.js project — verify: includes `node_modules/`, `dist/`, `*.log`, `.env`
- [ ] Write `promptfolio/README.md` (three paragraphs) — verify: word count 150-300, no "Pro/Premium" mentions

---

## Phase 2: Parser Module

- [ ] Create `src/parser/schema.js` with Claude export JSON schema — verify: file exports `claudeExportSchema` object
- [ ] Create `src/parser/claude.js` with `parseClaudeExport()` function — verify: function exists, exports correctly
- [ ] Implement JSON.parse with try/catch — verify: valid JSON returns parsed object
- [ ] Implement markdown fence stripping — verify: input with \`\`\`json fences parses correctly
- [ ] Implement recursive brace extraction fallback — verify: truncated JSON extracts partial object
- [ ] Implement raw-text fallback for unknown schemas — verify: invalid schema returns readable text, not crash
- [ ] Add 5 MB file size cap check — verify: test throws "File exceeds 5 MB limit" for large files
- [ ] Add base64 image extraction — verify: inline images extracted to separate buffers
- [ ] Create parser test with 10+ edge cases — verify: all cases pass (valid, fences, truncated, empty, oversized)

---

## Phase 3: Template Module

- [ ] Define CSS design tokens in `src/template/styles.css` — verify: CSS custom properties for colors, spacing, typography
- [ ] Create `src/template/layout.html` sacred dark gallery template — verify: single template file, dark colors only
- [ ] Create `src/template/prompt-card.html` component — verify: renders title, body, copy button
- [ ] Verify no light mode CSS — verify: `grep -ri "light-mode\|prefers-color-scheme.*light" src/template/` returns nothing
- [ ] Verify no toggle logic — verify: `grep -ri "toggle\|switch\|theme" src/template/` returns nothing
- [ ] Verify CSS under 200 lines — verify: `wc -l src/template/styles.css` shows < 200
- [ ] Add responsive breakpoint (mobile-first) — verify: CSS has `@media (min-width: 768px)` rule

---

## Phase 4: Generator Module

- [ ] Create `src/generator/build.js` with `generatePortfolio()` function — verify: function exists and exports
- [ ] Implement HTML file writer (template + data merge) — verify: output `index.html` contains all prompts
- [ ] Implement CSS copy/minify step — verify: output `styles.css` exists
- [ ] Implement base64-to-binary image conversion — verify: `assets/images/` contains `.png` files, no inline base64 in HTML
- [ ] Create `src/generator/og-image.js` with `generateOGImage()` — verify: function exists and exports
- [ ] Implement OG PNG generation (Sharp or Satori) — verify: output `og-image.png` is valid PNG under 500KB
- [ ] Verify OG meta tags in HTML — verify: `grep -c 'property="og:' output/index.html` returns at least 3

---

## Phase 5: Deploy Module

- [ ] Create `src/deploy/cdn-push.js` with `pushToCDN()` function — verify: function exists and exports
- [ ] Implement CDN upload (Cloudflare Pages / Vercel / Netlify) — verify: returns HTTPS URL
- [ ] Verify URL format — verify: matches `https://{uuid}.{domain}` pattern
- [ ] Verify anonymous access — verify: `curl -I {url}` returns 200, no auth headers

---

## Phase 6: Landing Page

- [ ] Create `app/index.html` with single drop-zone — verify: has file input, no nav, no settings
- [ ] Create `app/main.js` with drop-zone logic — verify: handles drag-drop, file select, validation
- [ ] Add helper text ("Claude → Settings → Data → Export") — verify: text visible, under 20 words
- [ ] Add progress indicator for parsing — verify: UI shows progress during file processing
- [ ] Add error display for failures — verify: user-friendly messages for each error type
- [ ] Verify no manual paste box — verify: `grep -ri "paste.*input\|textarea" app/` returns nothing

---

## Phase 7: Utilities

- [ ] Create `lib/utils.js` with `generateUUID()` — verify: returns v4 UUID format
- [ ] Add `isValidJSONFile()` helper — verify: function exists, tests pass
- [ ] Add `isUnderSizeLimit()` helper — verify: function exists, 5 MB check works
- [ ] Add `decodeBase64ToBuffer()` helper — verify: function converts base64 to Buffer

---

## Phase 8: Exclusion Audit

- [ ] Verify no auth code — verify: `grep -ri "login\|signup\|password\|auth" src/ app/ lib/` returns nothing
- [ ] Verify no database code — verify: `grep -ri "prisma\|drizzle\|mongodb\|postgres\|mysql" .` returns nothing
- [ ] Verify no light mode — verify: `grep -ri "light.*mode\|dark.*toggle" src/` returns nothing
- [ ] Verify no "Try this prompt" widget — verify: `grep -ri "try.*prompt\|execute.*prompt" src/ app/` returns nothing
- [ ] Verify no analytics — verify: `grep -ri "analytics\|dashboard\|view.*count" src/ app/` returns nothing
- [ ] Verify no forced watermark — verify: `grep -ri "made with promptfolio\|powered by" src/ app/` returns nothing
- [ ] Verify no onboarding wizard — verify: `grep -ri "wizard\|onboarding\|tutorial" app/` returns nothing
- [ ] Verify no React/Next.js — verify: `grep -ri "next\|react" package.json` shows nothing (or dev only)
- [ ] Verify no WordPress plugin — verify: `find . -name "*.php"` returns nothing

---

## Phase 9: Aesthetic Verification

- [ ] Verify typography hierarchy — verify: H1 > H2 > H3 font sizes strictly descending in CSS
- [ ] Verify generous whitespace — verify: section padding tokens ≥ 24px in CSS
- [ ] Verify line-height ≥ 1.5 — verify: `line-height` property check passes
- [ ] Verify motion ≤ 200ms — verify: CSS `transition` durations under 200ms
- [ ] Verify mobile rendering — verify: test at 375px viewport, no horizontal scroll
- [ ] Verify no corporate speak — verify: `grep -ri "leverage\|solution\|empower" src/ app/` returns nothing

---

## Phase 10: Final Smoke Test

- [ ] End-to-end test with sample JSON — verify: portfolio generated in under 60 seconds
- [ ] Verify shareable URL works — verify: `curl {url}` returns 200 with HTML
- [ ] Verify OG image validates — verify: LinkedIn Post Inspector shows image
- [ ] Verify bundle under 500KB — verify: `du -sh output/` shows under 500KB
- [ ] Verify latency < 4000ms — verify: timing log shows parse + generate + deploy under 4s

---

## Test Scripts

- [ ] Create `tests/test-parser.sh` — verify: executable, exits 0 on pass, tests all edge cases
- [ ] Create `tests/test-generator.sh` — verify: executable, exits 0, checks file existence
- [ ] Create `tests/test-exclusions.sh` — verify: executable, exits 0, greps for banned patterns
- [ ] Create `tests/test-aesthetic.sh` — verify: executable, exits 0, checks CSS tokens
- [ ] Create `tests/test-e2e.sh` — verify: executable, exits 0, runs full flow test
