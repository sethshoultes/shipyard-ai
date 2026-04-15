# Blog Infrastructure Risk Checklist

## BLOCKING ISSUES — Must Resolve Before Building

### [ ] CRITICAL: Markdown Tech Stack Decision
- **Issue:** PRD says `remark-html`, Decisions say `react-markdown`
- **Action Required:**
  - [ ] Confirm which approach is final (get Steve/Elon consensus)
  - [ ] Update PRD or Decisions to match
  - [ ] Provide correct code example for chosen path
  - [ ] Document security implications (dangerouslySetInnerHTML if remark-html)

### [ ] CRITICAL: Add `published` Field to PRD
- **Issue:** Decisions mention content gating, PRD doesn't include `published` field
- **Action Required:**
  - [ ] Update PRD frontmatter schema to include `published: boolean`
  - [ ] Document default value (`false` per Decisions)
  - [ ] Show code: `.filter(post => post.published)` in getAllPosts()

### [ ] CRITICAL: Document RSS Implementation
- **Issue:** PRD has no RSS code example, but Decisions require it
- **Action Required:**
  - [ ] Add `blog/rss.xml/route.ts` example to PRD or Decisions
  - [ ] Specify RSS 2.0 format, full content inclusion
  - [ ] Note: Static generation (no dynamic route)

### [ ] CRITICAL: Normalize Existing Markdown Files
- **Issue:** Existing `.md` files have inconsistent frontmatter
- **Action Required:**
  - [ ] Audit each file in `blog/`:
    - `the-night-shift.md`: has `author`, missing `published`
    - `seven-plugins-zero-errors.md`: date is unquoted (number), missing `published`
    - `model-selection-multi-agent.md`: no `published`, no `description`
  - [ ] Decide: canonicalize to PRD schema before build
  - [ ] Add `published: true` to all existing posts (human-written)
  - [ ] Convert dates to quoted strings: `date: "2026-04-15"`
  - [ ] Add `description` field if missing

---

## IMPLEMENTATION CHECKPOINT — Validate During Build

### [ ] TypeScript Compilation
```bash
npm run build 2>&1 | grep -i error
# Should show: 0 errors
```
- [ ] No "fs is not defined" errors
- [ ] No "cannot find BlogPost" type errors
- [ ] All TypeScript strict mode warnings resolved

### [ ] Static Generation
```bash
# Count generated blog routes
find out/blog -name "index.html" | wc -l
# Should equal: (number of published posts)
```
- [ ] Route count matches post count
- [ ] No "route is not statically generated" warnings
- [ ] `generateStaticParams()` executed successfully

### [ ] Build Output Validation
```bash
ls -la out/blog/
# Should show:
# - index.html (blog index)
# - [slug]/index.html (one per post)
# - rss.xml (if RSS implemented)
```
- [ ] `/blog/index.html` exists
- [ ] `/blog/the-night-shift/index.html` exists
- [ ] `/blog/rss.xml` exists (if V1 scope includes RSS)
- [ ] No empty directories

### [ ] Bundle Size Check
```bash
du -sh out/
# Expected: < 5MB total (conservative)
du -sh out/_next/static/chunks/
# Check for unexpected bloat from markdown dependencies
```
- [ ] Total site size is reasonable
- [ ] JS chunks don't show markdown libs 2x+ times
- [ ] No obvious bundle bloat

---

## CONTENT MIGRATION CHECKLIST

### [ ] Audit Existing Posts
- [ ] Compare hardcoded posts in `page.tsx` vs. markdown files
- [ ] Resolve content mismatches:
  - "Why We Bet on EmDash" — hardcoded but no `.md` file
  - "Portable Text for Agents" — hardcoded but no `.md` file
  - "How We Built 3 Sites" — hardcoded but no `.md` file
  - "Seven Plugins, Zero Errors" — both versions exist, pick one

### [ ] Markdown Migration Checklist
- [ ] Remove all posts from `page.tsx` hardcoded array
- [ ] Verify each `.md` file renders without errors:
  - [ ] `the-night-shift.md`: Code blocks, typography, links
  - [ ] `seven-plugins-zero-errors.md`: Complex syntax highlighting
  - [ ] `model-selection-multi-agent.md`: Lists, code, formatting
  - [ ] Any others: Test rendering on individual post page

### [ ] Frontmatter Validation
- [ ] For each `.md` file, verify:
  - [ ] `title` is a string (not empty)
  - [ ] `date` is in ISO format: `"YYYY-MM-DD"`
  - [ ] `description` exists and is < 160 chars (SEO meta length)
  - [ ] `published: true` or `false` is set explicitly
  - [ ] `tags` are in YAML array format: `["tag1", "tag2"]`

---

## PRE-DEPLOYMENT VALIDATION

### [ ] Local Testing
```bash
# Build static export
npm run build

# Start static server
npx wrangler pages dev out

# Test in browser
# - http://localhost:8788/blog → index page with all posts
# - http://localhost:8788/blog/the-night-shift → individual post
# - http://localhost:8788/blog/rss.xml → valid XML feed
```

- [ ] Blog index loads, lists all published posts
- [ ] Each post URL is accessible (no 404s)
- [ ] Back button works (navigation history preserved)
- [ ] Code blocks render with syntax highlighting
- [ ] Typography matches existing blog aesthetic
- [ ] Meta tags visible in page source

### [ ] SEO Validation
For each post page:
```bash
curl https://localhost:8788/blog/the-night-shift | grep -E '<meta|<title>'
# Should show:
# <title>Post Title — Shipyard AI</title>
# <meta name="description" content="...">
# <meta property="og:title" content="...">
# <meta property="og:description" content="...">
```

- [ ] `<title>` tag is present and correct
- [ ] `description` meta tag is present
- [ ] OpenGraph tags (og:title, og:description, og:url, og:type) are present
- [ ] og:type = "article"
- [ ] og:url points to correct blog post URL

### [ ] RSS Validation
```bash
curl http://localhost:8788/blog/rss.xml
# Copy output to: https://validator.w3.org/feed/
```

- [ ] Valid XML (no parsing errors)
- [ ] RSS 2.0 format compliant
- [ ] Contains all published posts
- [ ] Each item includes title, link, description, pubDate
- [ ] No XML escaping errors

### [ ] Accessibility Check
- [ ] Run Lighthouse audit on `/blog` and `/blog/[slug]`
- [ ] Accessibility score ≥ 90
- [ ] No color contrast failures
- [ ] Code blocks are navigable by keyboard
- [ ] Screen reader (NVDA/JAWS) can read content

### [ ] Performance Check
```bash
# Check initial load time (TTL)
time curl -o /dev/null -s -w "%{time_total}s\n" http://localhost:8788/blog/the-night-shift
# Expected: < 1s on localhost
```

- [ ] Page load time is reasonable (< 2s on CDN)
- [ ] No layout shift (CLS < 0.1)
- [ ] Images/assets load without 404s

---

## DEPLOYMENT CHECKLIST

### [ ] Pre-Deployment
- [ ] All tests pass locally
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No lint errors: `npm run lint`
- [ ] Git status clean: `git status` shows no unexpected files
- [ ] Commit all changes with clear message

### [ ] Cloudflare Pages Deploy
```bash
CLOUDFLARE_API_TOKEN=... npx wrangler pages deploy out --project-name=shipyard-ai
```

- [ ] Deploy succeeds without errors
- [ ] Check Cloudflare Pages dashboard for build status
- [ ] No 404s in deployment logs

### [ ] Post-Deployment Smoke Tests
```bash
# Test blog index
curl -I https://www.shipyard.company/blog
# Expected: 200 OK

# Test individual post
curl -I https://www.shipyard.company/blog/the-night-shift
# Expected: 200 OK

# Test RSS
curl https://www.shipyard.company/blog/rss.xml | head -5
# Expected: <?xml version="1.0"...
```

- [ ] Blog index returns 200 (not 404)
- [ ] Each post URL returns 200 (not 404)
- [ ] RSS feed is accessible and valid XML
- [ ] Page source contains correct meta tags
- [ ] Typography and styling render correctly

### [ ] Social Sharing Test
- [ ] Share `/blog/the-night-shift` on Twitter → preview renders
- [ ] Share on Slack → card preview shows title + description + image
- [ ] OpenGraph image works (if configured)

### [ ] Analytics (if available)
- [ ] Page views on `/blog` increase post-deploy
- [ ] No spike in 404 errors
- [ ] No unusual traffic patterns

---

## POST-DEPLOYMENT MONITORING (24-48 hours)

### [ ] Error Logs
- [ ] No JavaScript errors in Cloudflare Pages logs
- [ ] No 500s or server errors
- [ ] No 404s on blog routes

### [ ] User Feedback
- [ ] No bug reports in GitHub issues
- [ ] No Slack complaints about broken blog

### [ ] Content Verification
- [ ] All 6 posts visible on blog index
- [ ] All post links work
- [ ] RSS feed has all 6 posts

### [ ] Performance Monitoring
- [ ] Page load times stable (no degradation)
- [ ] No unexpected bandwidth spikes

---

## RISK FOLLOW-UP ITEMS

### If Bundle Size is Concerning
- [ ] Check: `npm run build && du -sh out/_next/static/chunks/`
- [ ] If > 200KB increase, consider:
  - [ ] Lazy-loading react-markdown
  - [ ] Code-splitting for syntax highlighting
  - [ ] Switching to remark-html (lighter alternative)

### If Build Time is Slow (> 30s at 6 posts)
- [ ] Profile: `npm run build -- --profile`
- [ ] Check: `time node -e "fs.readdirSync('blog/posts').length"` (should be instant)
- [ ] If slowness persists, plan ISR migration for V2

### If Posts Don't Render
- [ ] Check TypeScript: `npx tsc --noEmit`
- [ ] Check build output: `cat out/blog/[slug]/index.html`
- [ ] Verify fs access: `cat src/lib/blog.ts` uses correct path

### If SEO Tags Missing
- [ ] Verify: `generateMetadata()` exported from `[slug]/page.tsx`
- [ ] Check: `npm run build && grep -r 'og:title' out/`
- [ ] Manually inspect: `curl https://www.shipyard.company/blog/[slug] | grep '<meta'`

### If RSS Feed Invalid
- [ ] Run through https://validator.w3.org/feed/
- [ ] Check: All posts included, no malformed XML
- [ ] Verify: Full post content is in feed (not truncated)
- [ ] Test: Subscribe in Feedly, verify posts appear

---

## SIGN-OFF CRITERIA

Implementation is complete when ALL of these are true:

- [ ] All CRITICAL risks resolved (RISK-001, 002, 003)
- [ ] All BLOCKING items checked (frontmatter normalized, schema confirmed)
- [ ] Build succeeds locally with no TypeScript errors
- [ ] Static output contains all expected routes
- [ ] Local staging site matches existing blog aesthetic
- [ ] All 6 posts render correctly
- [ ] RSS feed is valid XML
- [ ] Deployed to Cloudflare Pages successfully
- [ ] All smoke tests pass (200 status codes, content visible)
- [ ] SEO tags are correct in page source
- [ ] No errors in Cloudflare Pages deployment logs
- [ ] 24-hour monitoring shows no issues

---

**This checklist is a companion to RISK-REGISTER-blog-infrastructure.md**
Refer to the full risk register for detailed mitigation strategies.
