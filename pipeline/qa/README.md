# QA Pipeline for EmDash Sites

Margaret Hamilton, QA Director

## Overview

The QA pipeline is an automated verification system that ensures every EmDash site built by Shipyard AI meets quality standards before deployment. It runs during the REVIEW stage of the pipeline and is responsible for verifying build integrity, accessibility, performance, security, and user experience.

## What Gets Tested

### Build & Integration
- **Build passes**: `npx astro build` completes without errors
- **Seed validates**: `npx emdash seed --validate` confirms schema is valid
- **No TypeScript errors**: `astro check` passes (type safety)

### Functionality
- **All critical pages return 200**: Homepage, primary content pages, and redirects work
- **No console errors**: Runtime errors are caught in the browser console
- **HTML validation**: No broken or unclosed tags; semantic HTML is correct

### Accessibility (WCAG 2.1 AA)
- **Color contrast**: All text meets WCAG AA contrast ratios (4.5:1 for normal, 3:1 for large)
- **Touch targets**: Interactive elements >= 44px (minimum touch-target size)
- **Alt text on images**: All images have descriptive alt text
- **Keyboard navigation**: All functionality accessible via keyboard
- **Semantic HTML**: Proper heading hierarchy, form labels, landmarks

### Content Quality
- **No broken links**: Internal and external links are valid and return 200
- **Images load correctly**: All images render without 404s
- **Forms are functional**: Contact forms, search, etc. work end-to-end

### Mobile & Responsive
- **Mobile responsive (320px-1280px)**: Layouts work at all breakpoints
- **Touch-friendly**: No horizontal scrolling, proper spacing on small screens
- **Fast on mobile**: Performance targets met even on 4G

### SEO
- **Title tag present**: Every page has a unique, descriptive title
- **Meta description**: Every page has a compelling meta description
- **OG tags**: Social sharing metadata (og:title, og:description, og:image, og:url)
- **Canonical tags**: Pages avoid duplicate content issues
- **Structured data**: Schema.org markup for content types (if applicable)

### Performance (Lighthouse 90+)
- **LCP (Largest Contentful Paint) < 2.5s**: Core Web Vital
- **CLS (Cumulative Layout Shift) < 0.1**: Core Web Vital
- **FID (First Input Delay) < 100ms** (or INP < 200ms for modern sites)
- **Overall Lighthouse score >= 90** across Performance, Accessibility, Best Practices, SEO

### Security
- **No exposed secrets**: API keys, tokens, credentials not visible in source or HTML
- **Content Security Policy (CSP)**: Headers prevent XSS attacks
- **HTTPS enforced**: Site redirects HTTP to HTTPS
- **No mixed content**: All resources loaded over HTTPS
- **Secure headers**: HSTS, X-Frame-Options, X-Content-Type-Options set correctly

## When Tests Run

1. **Automated (on every build)**: When code is pushed to feature branches
2. **Pre-staging**: Before promoting to staging environment
3. **Pre-production**: Final gate before deploying to production
4. **On-demand**: Margaret can run full QA at any time

## Pass/Fail Criteria

### PASS
All of the following must be true:
- Build script exits with code 0
- Seed validation passes
- No TypeScript errors
- All critical pages return 200
- No console errors on critical paths
- Accessibility audit passes (WCAG AA)
- Performance meets targets (LCP, CLS, Lighthouse 90+)
- No security vulnerabilities detected
- Mobile responsiveness verified
- All required SEO metadata present

### FAIL
Any of the following causes failure:
- Build fails (exit code != 0)
- Seed validation fails
- TypeScript errors present
- Critical pages return 404 or 5xx
- Console errors on critical paths
- Color contrast failures
- Touch targets < 44px
- Missing alt text on images
- Broken links to critical pages
- LCP > 2.5s or CLS > 0.1
- Lighthouse score < 90 on any category
- CSP header missing or misconfigured
- Exposed secrets detected
- HTTPS not enforced

## Automated vs. Manual Checks

### Automated (run-qa.sh)
- Build passes
- Seed validates
- TypeScript check
- Critical page responses
- No console errors (headless browser)
- HTML validation (W3C)
- Link checks (crawl)
- Performance (Lighthouse)
- Security basics (CSP, HTTPS, headers)

### Manual (Margaret's Review)
- Visual design quality matches brand
- Copy quality (no AI slop, grammar, tone)
- Accessibility fixes beyond automation (keyboard nav edge cases, screen reader testing)
- Content strategy compliance (PRD requirements met)
- Edge case testing (unusual content, very long titles, etc.)
- Real-device testing (iOS Safari, Android Chrome, etc.)

## Output

Every QA run produces:
- **QA Report** (`projects/{slug}/review/qa-report.md`): Test results, pass/fail verdict, recommendations
- **Test logs**: Detailed output from each check (saved alongside report)
- **Screenshots**: Before/after comparisons (for failed tests)

## Integration with Shipyard AI Pipeline

The QA pipeline is the gate to production. During the REVIEW stage:

1. **Automated checks run** (run-qa.sh): ~5-10 minutes
2. **Margaret reviews results**: Pass or specific revision requests
3. **If PASS**: Directors review for design + engineering compliance
4. **If FAIL**: Issues are triaged and routed back to BUILD
5. **Revision loop**: After fixes, QA runs again (max 2 rounds)
6. **Final verdict**: "SHIP" or "BLOCK" with reasoning

If QA blocks a site twice, Margaret escalates to directors with required changes.

## Tools & Technologies

- **Astro build**: `npx astro build`
- **EmDash CLI**: `npx emdash seed --validate`
- **TypeScript**: `astro check`
- **HTML validation**: W3C Nu Html Checker (via API or local)
- **Link checking**: Custom script with headless browser (Playwright)
- **Performance**: Lighthouse CI (Google's chromium-based auditing)
- **Accessibility**: axe DevTools (WCAG 2.1 AA automation)
- **Security**: Custom secret scanning + header validation

## Adding New Checks

To add a check to the QA pipeline:

1. Update `checklist.md` with new requirement
2. Add corresponding check to `run-qa.sh`
3. Update "Automated vs. Manual" section above
4. Document in README where the check lives
5. Test on example site (`examples/bellas-bistro/`)

## References

- **Lighthouse Scoring**: https://developers.google.com/web/tools/lighthouse/scoring
- **WCAG 2.1 Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Web Vitals**: https://web.dev/vitals/
- **EmDash Documentation**: See `building-emdash-site` skill
