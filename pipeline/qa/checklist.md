# EmDash Site QA Checklist

## Pre-Flight Checks

- [ ] **Site directory exists and is readable**
  - Must be an EmDash site with `package.json`, `astro.config.mjs`, and `seed/` directory

- [ ] **Dependencies installed**
  - `npm install` or `npm ci` has been run
  - `node_modules/` exists and is complete

---

## Build & Integration (AUTOMATED)

- [ ] **Astro build succeeds**
  - Command: `npx astro build`
  - Expected: Exit code 0, `dist/` directory created
  - Failure: Build errors, missing dependencies, config issues

- [ ] **EmDash seed validates**
  - Command: `npx emdash seed seed/seed.json --validate`
  - Expected: Exit code 0, no schema errors
  - Failure: Invalid collections, field type mismatches, circular references

- [ ] **TypeScript check passes**
  - Command: `astro check`
  - Expected: Exit code 0, no type errors
  - Failure: Untyped imports, type mismatches, missing types

- [ ] **No fatal console errors**
  - Method: Headless browser crawl of critical pages
  - Allowed: Warnings, network errors (external CDNs)
  - Failure: Uncaught exceptions, undefined variable access, React errors

---

## Functionality (AUTOMATED)

- [ ] **Homepage returns 200**
  - GET `/`
  - Expected: 200 status, valid HTML
  - Failure: 404, 500, timeout

- [ ] **All critical pages return 200**
  - GET `/about`, `/contact`, `/blog`, `/products` (if they exist)
  - Expected: 200 status, valid HTML
  - Failure: 404, 500, broken redirects

- [ ] **Dynamic content pages render**
  - GET `/blog/{slug}`, `/products/{slug}`, etc.
  - Expected: 200 status, content populated
  - Failure: 404, template not found, missing query results

- [ ] **HTML validates (no broken tags)**
  - Method: W3C Nu Html Checker (API mode)
  - Expected: No errors (warnings OK)
  - Failure: Unclosed tags, invalid nesting, deprecated elements

- [ ] **All images have alt text**
  - Scan: `<img>` tags without `alt` attribute
  - Expected: 0 missing alt texts
  - Failure: Images without alt (accessibility blocker)

- [ ] **All links are valid**
  - Method: Crawl and check HTTP responses
  - Expected: All links return 2xx or 3xx (redirects OK)
  - Failure: Broken links (404), external links timing out

---

## Accessibility (WCAG 2.1 AA - AUTOMATED)

- [ ] **Color contrast meets WCAG AA**
  - Tool: axe-core (automated WCAG audit)
  - Standard: Normal text 4.5:1, large text 3:1
  - Scan: All text elements on primary pages
  - Failure: Text too light/dark against background

- [ ] **Touch targets are >= 44px**
  - Tool: axe-core measurement + manual inspection
  - Requirement: All interactive elements (buttons, links, form inputs) are at least 44x44 CSS pixels
  - Failure: Buttons < 44px, link text not clickable area

- [ ] **Keyboard navigation works**
  - Method: Manual test with Tab key through primary pages
  - Expected: All interactive elements reachable, focus visible
  - Failure: Trapped focus, hidden keyboard traps, no focus indicator

- [ ] **Form labels present and associated**
  - Scan: `<input>`, `<textarea>`, `<select>` tags
  - Expected: Each has associated `<label>` with `for` attribute
  - Failure: Unlabeled form fields

- [ ] **Heading hierarchy is correct**
  - Scan: `<h1>`, `<h2>`, `<h3>` ... tags
  - Expected: Starts with `<h1>`, no skipped levels (e.g., h1 → h3 is wrong)
  - Failure: Multiple h1s, skipped levels

- [ ] **Page landmarks present**
  - Expected: `<header>`, `<nav>`, `<main>`, `<footer>` on all pages
  - Failure: Missing main content landmark, ambiguous structure

---

## Mobile & Responsive (AUTOMATED)

- [ ] **Mobile viewport configured**
  - Check: `<meta name="viewport" content="width=device-width, initial-scale=1">`
  - Expected: Present in `<head>`
  - Failure: Missing viewport meta

- [ ] **Layout responsive at 320px (mobile)**
  - Method: Headless browser at viewport 320x667
  - Expected: No horizontal scrolling, all content readable
  - Failure: Text overflow, horizontal scroll, overlapping elements

- [ ] **Layout responsive at 768px (tablet)**
  - Method: Headless browser at viewport 768x1024
  - Expected: Touch-friendly spacing, readable text
  - Failure: Cramped layout, overlapping elements

- [ ] **Layout responsive at 1280px (desktop)**
  - Method: Headless browser at viewport 1280x720
  - Expected: Content well-distributed, no excessive whitespace
  - Failure: Single-column on desktop, broken multi-column layout

- [ ] **Images scale properly**
  - Check: No stretched or distorted images across breakpoints
  - Expected: Images maintain aspect ratio
  - Failure: Image distortion, pixelation at high zoom

---

## SEO (AUTOMATED)

- [ ] **Every page has `<title>` tag**
  - Expected: Unique, descriptive, 30-60 characters
  - Failure: Missing title, empty title, identical titles on all pages

- [ ] **Every page has meta description**
  - Tag: `<meta name="description" content="..."`
  - Expected: 120-160 characters, unique per page
  - Failure: Missing, too short, too long, duplicate descriptions

- [ ] **Homepage has OG tags**
  - Expected: `og:title`, `og:description`, `og:image`, `og:url`
  - Scan: Primary content pages (blog, products)
  - Failure: Missing social sharing metadata

- [ ] **Blog/product pages have canonical URL**
  - Tag: `<link rel="canonical" href="..."`
  - Expected: Present on content pages to prevent duplicate content
  - Failure: Missing canonical, incorrect canonical URL

- [ ] **Site has robots.txt**
  - Location: `/robots.txt`
  - Expected: Present, allows major search engines
  - Failure: Missing or disallows all crawlers

- [ ] **Sitemap present (if 10+ pages)**
  - Location: `/sitemap.xml` or `/sitemap-index.xml`
  - Expected: Valid XML, all pages listed
  - Failure: Missing or malformed sitemap

---

## Performance (Lighthouse - AUTOMATED)

Core Web Vitals (all required):
- [ ] **LCP (Largest Contentful Paint) < 2.5s**
  - Metric: Time to render largest visible content element
  - Expected: < 2.5 seconds
  - Failure: > 2.5s indicates slow page load

- [ ] **CLS (Cumulative Layout Shift) < 0.1**
  - Metric: Visual stability (no unexpected layout jumps)
  - Expected: < 0.1 (smaller is better, 0 is perfect)
  - Failure: > 0.1 (jarring layout shifts)

- [ ] **INP (Interaction to Next Paint) < 200ms**
  - Metric: Responsiveness to user interactions (buttons, forms)
  - Expected: < 200ms
  - Failure: > 200ms (feels sluggish)

Lighthouse Overall:
- [ ] **Lighthouse Performance score >= 90**
  - Expected: >= 90 (out of 100)
  - Note: Mobile test is more demanding

- [ ] **Lighthouse Accessibility score >= 90**
  - Expected: >= 90 (out of 100)
  - Note: Catches WCAG issues automation misses

- [ ] **Lighthouse Best Practices score >= 90**
  - Expected: >= 90 (out of 100)

- [ ] **Lighthouse SEO score >= 90**
  - Expected: >= 90 (out of 100)

Performance optimizations:
- [ ] **No render-blocking resources**
  - Check: CSS/JS blocking page render
  - Expected: Critical CSS inlined, JS deferred
  - Failure: Large render-blocking resources

- [ ] **Images optimized and lazy-loaded**
  - Check: Image sizes, formats (WebP), lazy loading attributes
  - Expected: Appropriately sized for viewport, lazy-loaded below fold
  - Failure: Oversized images, missing `loading="lazy"`

---

## Security (AUTOMATED)

- [ ] **No exposed secrets**
  - Scan: HTML source, CSS, JavaScript for API keys, tokens, passwords
  - Patterns: `api_key=`, `ANTHROPIC_API_KEY=`, `JWT=`, database credentials
  - Failure: Any exposed secrets

- [ ] **Content Security Policy (CSP) header present**
  - Header: `Content-Security-Policy`
  - Expected: Restrictive policy (not `unsafe-inline`)
  - Failure: Missing CSP or overly permissive policy

- [ ] **HTTPS enforced**
  - Check: HTTP requests redirect to HTTPS
  - Expected: All traffic on HTTPS, HSTS header present
  - Failure: HTTP content served, no redirect

- [ ] **No mixed content**
  - Check: All resources (CSS, JS, images) loaded over HTTPS
  - Expected: No http:// resource URLs
  - Failure: Mixed content (HTTP + HTTPS)

- [ ] **Security headers present**
  - Headers: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`
  - Expected: Restrictive values (e.g., `X-Frame-Options: DENY`)
  - Failure: Missing or permissive headers

- [ ] **No outdated dependencies**
  - Scan: `package.json` dependencies for known vulnerabilities
  - Command: `npm audit` exit code 0
  - Failure: Critical or high-severity vulnerabilities

---

## Content Quality (MANUAL - Margaret's Review)

- [ ] **Copy is well-written**
  - Check: Grammar, spelling, tone consistency
  - Failure: AI-generated slop, grammatical errors, inconsistent voice

- [ ] **Content matches PRD requirements**
  - Verify: All required pages, sections, features present
  - Failure: Missing required content, incomplete features

- [ ] **Tone and voice consistent**
  - Check: Brand voice maintained throughout site
  - Failure: Jarring tone shifts, inconsistent terminology

- [ ] **Images are professional quality**
  - Check: Image selection, cropping, resolution
  - Failure: Low-quality, pixelated, or misaligned images

---

## Design & UX (MANUAL - Steve Jobs' Review)

- [ ] **Visual design meets brand spec**
  - Check: Color palette, typography, spacing
  - Failure: Colors don't match, fonts wrong, spacing inconsistent

- [ ] **Layout is clean and professional**
  - Check: Alignment, white space, visual hierarchy
  - Failure: Cluttered design, poor hierarchy, sloppy alignment

- [ ] **Components are visually consistent**
  - Check: Buttons, cards, forms look unified
  - Failure: Inconsistent styles, mix of design patterns

- [ ] **Interactive states are clear**
  - Check: Hover, focus, active states on buttons and links
  - Failure: No visual feedback, unclear interaction states

---

## Final Verdict

### PASS
All automated checks pass AND Margaret approves manual review.

### FAIL
Any of the following:
- Any automated check fails
- Margaret flags critical issues requiring fixes
- Security vulnerabilities detected
- Missing required content

### CONDITIONAL PASS (With Notes)
Automated checks pass but minor issues noted for future improvement:
- Non-critical accessibility improvements
- Performance optimizations that don't impact Core Web Vitals
- SEO enhancements that don't block deployment

---

## Revision Policy

If QA fails:
1. Margaret documents specific failures
2. Issues routed back to BUILD stage
3. Re-run QA after fixes
4. Max 2 revision rounds before escalating to directors

If QA passes but with manual review notes:
- Issues logged for post-launch improvement
- Site approved for deployment
