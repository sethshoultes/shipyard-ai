# QA Report 001 — Shipyard AI Website

**Reviewer:** Margaret Hamilton, QA Director
**Date:** 2026-04-03
**Branch:** `feature/pipeline-architecture`
**PR:** #1 — "Build Shipyard AI website — 5 pages, dark theme"
**Verdict:** BLOCK (3 P0 issues must be resolved before merge)

---

## 1. Build & Lint

| Check | Result |
|-------|--------|
| `npm run build` | PASS — all 5 pages + `_not-found` static-rendered, 0 errors |
| `npm run lint` | PASS — 0 ESLint errors, 0 warnings |
| TypeScript strict | PASS — compiled cleanly via Turbopack |

No issues here. Clean build.

---

## 2. Accessibility Audit (WCAG 2.1 AA)

### P0-A11Y-001: `dangerouslySetInnerHTML` on agent icons — XSS vector + no accessible label
**File:** `website/src/app/about/page.tsx:79-82`
**Severity:** P0
**Issue:** Agent icon `<span>` elements use `dangerouslySetInnerHTML={{ __html: a.icon }}` to render HTML entities (&#9670;, &#9733;, etc.). This is:
1. **An XSS risk** if icon data ever comes from an untrusted source (currently hardcoded, but the pattern is dangerous and sets a bad precedent).
2. **Missing accessible labels.** These icons are decorative but receive no `aria-hidden="true"` or `role="img"` + `aria-label`. Screen readers will announce raw unicode characters.
**Fix:** Replace `dangerouslySetInnerHTML` with direct unicode characters or React elements. Add `aria-hidden="true"` to decorative icon spans.

### P0-A11Y-002: Navigation has no mobile hamburger menu or responsive handling
**File:** `website/src/app/layout.tsx:29-44`
**Severity:** P0
**Issue:** The header nav renders all links in a horizontal `flex` row with `gap-8`. On small screens (<640px), the nav items and "Start a Project" button overflow or stack awkwardly. There is no hamburger menu, no `aria-expanded`, no mobile nav toggle. The site is effectively broken on mobile viewports for navigation.
**Fix:** Add a mobile nav (hamburger toggle) with proper `aria-expanded`, `aria-controls`, and focus management. Or at minimum use a responsive breakpoint to show/hide nav items.

### P0-A11Y-003: Contact form has no client-side validation or error messaging
**File:** `website/src/app/contact/page.tsx:47-108`
**Severity:** P0
**Issue:** The `<form>` element has:
- No `action` or `onSubmit` handler — submitting the form performs a GET to the current URL with query params, which does nothing and shows no feedback.
- No `required` attributes on any fields. Users can submit completely empty forms.
- No error messages, no success feedback, no loading state.
- No `aria-describedby` linking inputs to error messages.

This is a broken user flow. The primary conversion path (contact form) is non-functional.
**Fix:** At minimum add `required` to name/email/description, add a form action (Server Action or API route), and provide visible feedback on submit.

### P1-A11Y-004: Pipeline stage arrows are not accessible
**File:** `website/src/app/page.tsx:150-153`
**Severity:** P1
**Issue:** The `&rarr;` arrows between pipeline stages on the home page are purely decorative but have no `aria-hidden="true"`. Screen readers will announce "right arrow" between each stage.
**Fix:** Add `aria-hidden="true"` to the arrow `<div>` elements.

### P1-A11Y-005: Stats bar values lack semantic structure
**File:** `website/src/app/page.tsx:43-61`
**Severity:** P1
**Issue:** The stats bar (7 Agents, 6 Pipeline Stages, etc.) uses plain `<div>` elements. There's no `<dl>`/`<dt>`/`<dd>` or other semantic markup connecting values to labels. Screen readers get no relationship context.
**Fix:** Use a `<dl>` definition list with `<dt>` for labels and `<dd>` for values.

### P1-A11Y-006: Color contrast — muted text on dark background
**Severity:** P1
**Issue:** `--muted: #737373` on `--background: #0a0a0a` gives a contrast ratio of approximately 4.7:1. This passes AA for normal text (4.5:1 minimum) but barely, and fails AAA (7:1). For small text (text-xs, text-sm used extensively), readability is marginal. On `--surface: #141414` the ratio drops to ~4.4:1, which fails AA.
**Fix:** Bump `--muted` to at least `#8a8a8a` (~5.5:1 on #0a0a0a, ~5.0:1 on #141414) to pass AA with comfortable margin on both backgrounds.

### P2-A11Y-007: No skip-to-content link
**Severity:** P2
**Issue:** No "Skip to main content" link for keyboard users. Users must tab through the full header nav on every page load.
**Fix:** Add a visually-hidden skip link as the first child of `<body>` that links to `<main id="main-content">`.

### P2-A11Y-008: Footer copyright uses `new Date().getFullYear()` — no a11y issue but potential SSR/hydration mismatch
**File:** `website/src/app/layout.tsx:56`
**Severity:** P2
**Issue:** `new Date().getFullYear()` in a server component is fine for static generation, but worth noting: if the site is rebuilt at year boundary, cached and fresh pages could show different years. Minor, no fix needed now.

---

## 3. Security Review — Contact Form

### P0-SEC-001: Contact form submits nowhere — no backend, no validation
**File:** `website/src/app/contact/page.tsx:47`
**Severity:** P0 (overlaps with P0-A11Y-003)
**Issue:** The `<form>` has no `action`, no `method="POST"`, no `onSubmit` handler, and no Server Action. Clicking "Submit" performs a GET request to `/contact?name=&email=&project-type=...&description=` which:
- Exposes form data in the URL (visible in browser history, server logs, referrer headers)
- Does nothing with the data
- Provides zero feedback to the user
**Fix:** Implement a Server Action or API route. Use `method="POST"`. Never pass form data via GET for contact forms.

### P1-SEC-002: No CSRF protection
**Severity:** P1
**Issue:** When a form handler is eventually added, there is no CSRF token mechanism in place. Next.js Server Actions include CSRF protection by default, so using a Server Action would resolve this. If an API route is used instead, a CSRF token must be added manually.
**Fix:** Use Next.js Server Actions (recommended) which handle CSRF automatically.

### P1-SEC-003: No rate limiting on form submission
**Severity:** P1
**Issue:** Once the form is functional, there's no rate limiting. Bots could spam the endpoint. No CAPTCHA, honeypot field, or server-side rate limiter.
**Fix:** Add at minimum a honeypot field (hidden input that bots fill but humans don't). Consider adding rate limiting middleware when the API route is implemented.

### P1-SEC-004: `dangerouslySetInnerHTML` usage
**File:** `website/src/app/about/page.tsx:81`
**Severity:** P1 (security aspect; a11y aspect is P0-A11Y-001)
**Issue:** While the current data is hardcoded HTML entities and safe, `dangerouslySetInnerHTML` bypasses React's XSS protection. If the agent data source ever changes (e.g., fetched from a CMS), this becomes an injection vector.
**Fix:** Replace with direct unicode characters: `{"\u25C6"}` instead of `dangerouslySetInnerHTML={{ __html: "&#9670;" }}`.

### P2-SEC-005: Unused SVG assets in public/
**Severity:** P2
**Issue:** `public/` contains Next.js boilerplate SVGs (file.svg, globe.svg, next.svg, vercel.svg, window.svg) that are not referenced anywhere. Dead assets increase surface area and suggest incomplete cleanup.
**Fix:** Remove unused SVGs from `public/`.

---

## 4. Page-by-Page Review

### Home (`/`)
- Structure: Good. Clear hero, stats, services, pipeline, CTA flow.
- Heading hierarchy: H1 > H2 > H3 — correct.
- Links: All internal links use `next/link` — correct.
- Issue: Pipeline arrows need `aria-hidden` (P1-A11Y-004).

### Services (`/services`)
- Structure: Good. 3-tier pricing grid + add-ons.
- Heading hierarchy: H1 > H3 (skips H2 for tier cards). Minor — headings go H1 > H3 in the tier grid, then H2 for "Add-Ons" > H3 for add-on cards. The H3s before the H2 is a heading level skip.
- **P2-A11Y-009:** Heading hierarchy violation — tier card `<h3>` elements appear before the "Add-Ons" `<h2>`. Should be H2 for section headers, H3 for cards within each section.
- Checkmark icons (`&#10003;`) in service lists: rendered as text, not `dangerouslySetInnerHTML` — good.

### About (`/about`)
- Structure: Good. Agent grid + values list.
- Heading hierarchy: H1 > H2 > implicit card headings via `font-semibold` divs. The agent name divs are not headings — acceptable since they're within card context.
- Issue: `dangerouslySetInnerHTML` icons (P0-A11Y-001, P1-SEC-004).

### Pipeline (`/pipeline`)
- Structure: Good. Vertical timeline with budget breakdown.
- Heading hierarchy: H1 > H3 (skips H2 for stage names) > H2 for "Token Budget Breakdown". Same heading-level issue as Services.
- **P2-A11Y-010:** Stage names use `<h3>` but there's no parent `<h2>` section header before them. Then "Token Budget Breakdown" is `<h2>`.
- Timeline bullets use `<li>` within `<ul>` — correct list semantics.

### Contact (`/contact`)
- Form labels: All inputs have proper `<label htmlFor>` with matching `id` — correct.
- Issue: Form is non-functional (P0-A11Y-003, P0-SEC-001).
- Issue: No required fields, no validation (P0-A11Y-003).

---

## 5. Summary

### P0 — Ship Blockers (3)

| ID | Category | Issue |
|----|----------|-------|
| P0-A11Y-001 | A11y + Security | `dangerouslySetInnerHTML` on icons — XSS pattern + no accessible labels |
| P0-A11Y-002 | A11y + UX | No mobile navigation — site breaks on small screens |
| P0-A11Y-003 / P0-SEC-001 | A11y + Security | Contact form is non-functional — no action, no validation, GET exposes data |

### P1 — Fix Before Deploy (5)

| ID | Category | Issue |
|----|----------|-------|
| P1-A11Y-004 | A11y | Pipeline arrows need `aria-hidden` |
| P1-A11Y-005 | A11y | Stats bar lacks semantic structure |
| P1-A11Y-006 | A11y | Muted text color barely passes AA, fails on surface background |
| P1-SEC-002 | Security | No CSRF protection (use Server Actions) |
| P1-SEC-003 | Security | No rate limiting / spam protection on form |

### P2 — Backlog (4)

| ID | Category | Issue |
|----|----------|-------|
| P2-A11Y-007 | A11y | No skip-to-content link |
| P2-A11Y-008 | A11y | Year in footer — minor SSR note |
| P2-A11Y-009 | A11y | Heading hierarchy skip on Services page |
| P2-A11Y-010 | A11y | Heading hierarchy skip on Pipeline page |
| P2-SEC-005 | Security | Unused SVG assets in public/ |

---

## 6. Verdict

**BLOCK.** Three P0 issues prevent merge to main:

1. The contact form — the primary conversion path — is a dead end. It submits via GET, exposes data in URLs, provides no feedback, and has no backend. This must be functional or removed before ship.
2. Mobile navigation is broken. No hamburger menu, no responsive collapse. The site is not usable on phones.
3. `dangerouslySetInnerHTML` is unnecessary and introduces an XSS pattern that violates our security standards. Replace with direct unicode.

The P1s should be resolved before production deploy but do not block the PR merge if P0s are fixed and P1s are tracked as follow-up tasks.

The build is clean, lint passes, the design is solid, and the content is on-brand. Fix the P0s and this ships.

---

*Margaret Hamilton, QA Director*
*"Would this survive a production incident at 3 AM?"*
