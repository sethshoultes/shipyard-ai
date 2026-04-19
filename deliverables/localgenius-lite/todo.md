# SPARK — Build To-Do List
**Status:** Ready for execution
**Total Tasks:** 107 atomic sub-tasks
**Estimated Duration:** 4-6 hours

---

## Wave 1: Foundation (1.5-2 hours)

### Task 001: Widget UI (Button + Panel)

- [ ] Create `/spark/widget/spark.js` with self-initializing IIFE — verify: file exists, no syntax errors
- [ ] Implement `createButton()` function: 56px circle, bottom-right position — verify: button renders at `calc(100vw - 80px)` from left
- [ ] Add purple gradient background to button — verify: `background: linear-gradient(...)` in styles
- [ ] Add subtle pulse animation: opacity 0.7→1.0, 2s infinite — verify: animation plays in browser
- [ ] Implement `createPanel()` function: 380×520px div, initially hidden — verify: panel has correct dimensions in DevTools
- [ ] Add panel structure: header with close button, message container, input field, send button — verify: all elements present in DOM
- [ ] Style close button (X) top-right — verify: clicking X closes panel
- [ ] Add input placeholder: "What can I help you find?" — verify: text appears in input field
- [ ] Create footer with link: `<a href="https://usespark.com" target="_blank">Powered by SPARK</a>` — verify: link opens in new tab
- [ ] Style message bubbles: user right-aligned, AI left-aligned — verify: `.user-message { text-align: right }`, `.ai-message { text-align: left }`

### Task 002: Chat Interactions

- [ ] Implement `sendMessage()` function: validate input.value.trim() not empty — verify: empty messages rejected
- [ ] Add click handler to send button: calls `sendMessage()` — verify: clicking send triggers function
- [ ] Add Enter key listener to input field: if key === 'Enter', call `sendMessage()` — verify: pressing Enter sends message
- [ ] Implement optimistic UI: append user message to chat immediately (before API call) — verify: message appears instantly
- [ ] Clear input field after send: `input.value = ""` — verify: input clears after message sent
- [ ] Add loading state: show typing indicator (3 animated dots) — verify: dots animate while waiting
- [ ] Disable send button during API call: `sendButton.disabled = true` — verify: button unclickable during loading
- [ ] Re-enable send button after response: `sendButton.disabled = false` — verify: button clickable again after completion
- [ ] Persist widget state in memory: `let isOpen = false` for panel visibility — verify: state toggles correctly

### Task 003: Shadow DOM Setup

- [ ] Create shadow host element: `const host = document.createElement('div')` — verify: element created
- [ ] Attach Shadow DOM: `const shadow = host.attachShadow({ mode: 'open' })` — verify: shadow root exists
- [ ] Move all widget UI elements into `shadow` root — verify: widget renders inside shadow
- [ ] Add CSS reset to shadow root: `:host { all: initial; display: block; }` — verify: no inherited styles
- [ ] Inject widget styles inside shadow DOM using `<style>` tag — verify: styles scoped to shadow
- [ ] Test on WordPress site with Astra theme — verify: no style conflicts
- [ ] Test on WordPress site with Divi theme — verify: no style conflicts
- [ ] Test on Shopify site with Dawn theme — verify: no style conflicts
- [ ] Add mobile responsiveness: `@media (max-width: 480px) { panel { width: 100% } }` — verify: full-width on small screens
- [ ] Ensure touch targets ≥44px on mobile — verify: button and send button meet minimum size

### Task 004: Page Content Scraper

- [ ] Create `/spark/widget/utils/scraper.js` file — verify: file exists
- [ ] Export `scrapePageContent()` function — verify: function is callable
- [ ] Extract `document.title` and store in context object — verify: title included in returned object
- [ ] Extract `meta[name="description"]` content: `document.querySelector('meta[name="description"]')?.content` — verify: description included
- [ ] Try extracting text from `<main>` element: `document.querySelector('main')?.innerText` — verify: main content extracted
- [ ] Fallback to `<article>` if no `<main>`: `document.querySelector('article')?.innerText` — verify: article fallback works
- [ ] Fallback to `<body>` if neither: `document.body.innerText` — verify: body fallback works
- [ ] Truncate content to 10KB: `content.slice(0, 10240)` — verify: large pages truncated correctly
- [ ] Add 1-second delay before scraping: `setTimeout(scrape, 1000)` — verify: delay applied for SPAs
- [ ] Implement MutationObserver to detect DOM changes and re-scrape — verify: detects dynamic content loading
- [ ] Cache scraped content in widget state: don't re-scrape per question — verify: scrape function called only once
- [ ] Import scraper in `spark.js` and call on init — verify: no import errors

### Task 005: Cloudflare Worker Foundation

- [ ] Create `/spark/worker/index.js` file — verify: file exists
- [ ] Implement Cloudflare Worker fetch handler: `export default { async fetch(request, env) {} }` — verify: Worker syntax valid
- [ ] Add POST /api/chat route handler — verify: only accepts POST method
- [ ] Parse request JSON: `const { site_id, context, question } = await request.json()` — verify: JSON parsed correctly
- [ ] Validate site_id is UUID v4: regex test `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i` — verify: invalid UUIDs rejected
- [ ] Return 400 Bad Request if site_id missing — verify: status code 400
- [ ] Return 400 Bad Request if context missing — verify: status code 400
- [ ] Return 400 Bad Request if question missing — verify: status code 400
- [ ] Add CORS headers: `Access-Control-Allow-Origin: *` — verify: header present in response
- [ ] Add CORS headers: `Access-Control-Allow-Methods: POST, OPTIONS` — verify: header present
- [ ] Handle OPTIONS preflight requests: return 204 No Content — verify: OPTIONS → 204
- [ ] Create `/spark/worker/wrangler.jsonc` config file — verify: file exists
- [ ] Add `compatibility_flags: ["nodejs_compat"]` to wrangler.jsonc — verify: flag present
- [ ] Test locally: `wrangler dev` → Worker starts at localhost:8787 — verify: server running

---

## Wave 2: Integration (2-2.5 hours)

### Task 006: Claude API Integration

- [ ] Create `/spark/worker/claude.js` file — verify: file exists
- [ ] Install dependency: `npm install @anthropic-ai/sdk` — verify: package in package.json
- [ ] Import Anthropic SDK: `import Anthropic from '@anthropic-ai/sdk'` — verify: import works
- [ ] Initialize client: `const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })` — verify: client created
- [ ] Export `callClaude(context, question, apiKey)` function — verify: function exported
- [ ] Call messages API: `anthropic.messages.create({ model, messages, stream: true })` — verify: API called
- [ ] Set model: `"claude-3-5-haiku-20241022"` — verify: correct model string
- [ ] Enable streaming: `stream: true` — verify: streaming enabled
- [ ] Add try-catch around API call — verify: errors caught
- [ ] Map API errors to user-friendly messages: "Sorry, I couldn't answer that. Try again?" — verify: error message returned
- [ ] Add 30-second timeout: use AbortController and setTimeout — verify: timeout triggers at 30s
- [ ] Return 408 Request Timeout if exceeded — verify: status code 408

### Task 007: System Prompt Engineering

- [ ] Create `/spark/worker/prompt.js` file — verify: file exists
- [ ] Export `buildSystemPrompt(context)` function — verify: function exported
- [ ] Add instruction: "You are a helpful assistant for this website." — verify: text in prompt
- [ ] Add instruction: "Answer questions based ONLY on the page content provided." — verify: text in prompt
- [ ] Add instruction: "Be concise, friendly, and helpful." — verify: text in prompt
- [ ] Add fallback: "If you don't know the answer from the provided content, say: 'I don't see that information on this page. You might want to contact the site owner directly.'" — verify: fallback in prompt
- [ ] Add constraint: "Never make up information. Never discuss topics unrelated to the page content." — verify: constraint in prompt
- [ ] Format template: System prompt + "PAGE CONTENT:\n{context}" — verify: context injected correctly
- [ ] Test on page with known content: ask "What are your hours?" → correct answer — verify: answer from page
- [ ] Test on page without answer: ask "What are your hours?" (not on page) → "I don't see that information" — verify: fallback works
- [ ] Test unrelated question: "Who won the 2024 election?" → refuses to answer — verify: refuses off-topic
- [ ] Run 20+ test questions on different sites — verify: hallucination rate <5%

### Task 008: Multi-Layer Rate Limiting

- [ ] Create `/spark/worker/ratelimit.js` file — verify: file exists
- [ ] Implement in-memory map: `const rateLimits = new Map()` — verify: Map initialized
- [ ] Export `checkSiteIdLimit(site_id)` function — verify: function exported
- [ ] Implement counter logic: `{ count: 0, resetAt: Date.now() + 60000 }` — verify: counter increments
- [ ] Check if count >= 10 in current minute → return false — verify: 11th request blocked
- [ ] Reset count when Date.now() > resetAt — verify: resets after 60 seconds
- [ ] Extract client IP from headers: `request.headers.get('CF-Connecting-IP')` — verify: IP extracted
- [ ] Add Cloudflare rate limiting config in wrangler.jsonc: 100 req/hour per IP — verify: config present
- [ ] Return 429 Too Many Requests when limit exceeded — verify: status code 429
- [ ] Add Retry-After header: calculate seconds until reset — verify: header present in 429 response
- [ ] Test: send 10 requests with same site_id → all succeed — verify: 200 responses
- [ ] Test: send 11th request → 429 error — verify: rate limited
- [ ] Test: wait 61 seconds → verify rate limit resets — verify: requests succeed again

### Task 009: Streaming Response Handler

- [ ] Configure Claude API for streaming in claude.js — verify: `stream: true` passed
- [ ] Create ReadableStream in Worker to pipe Claude chunks — verify: ReadableStream created
- [ ] Format each chunk as SSE: `data: ${JSON.stringify({ chunk: text })}\n\n` — verify: correct SSE format
- [ ] Send done event when stream completes: `data: ${JSON.stringify({ done: true })}\n\n` — verify: done sent
- [ ] Set Worker response headers: `Content-Type: text/event-stream` — verify: header present
- [ ] Set Worker response headers: `Cache-Control: no-cache` — verify: header present
- [ ] In widget, create fetch with streaming reader: `response.body.getReader()` — verify: reader created
- [ ] Parse SSE chunks: split on `\n\n`, parse JSON — verify: chunks parsed correctly
- [ ] Append each chunk to AI message bubble: `messageEl.textContent += chunk` — verify: text appears incrementally
- [ ] Hide typing indicator when `done: true` received — verify: indicator hidden
- [ ] Test: ask question → verify first chunk arrives in <2 seconds — verify: latency <2s
- [ ] Test on slow network: throttle to 3G → verify streaming still works — verify: chunks arrive

### Task 010: Error Handling + Timeouts

- [ ] Create `/spark/worker/errors.js` file — verify: file exists
- [ ] Export `handleError(error)` function — verify: function exported
- [ ] Add try-catch around Claude API call in index.js — verify: errors caught
- [ ] Map generic error to: "Sorry, I couldn't answer that. Try again?" — verify: message returned
- [ ] Map 429 error to: "I'm getting too many questions right now" — verify: message returned
- [ ] Map 500 error to: "Something went wrong" — verify: message returned
- [ ] Map timeout error to: "That took too long. Try again?" — verify: message returned
- [ ] In widget, display error message in chat (not console) — verify: error appears as AI message
- [ ] Add retry button to error messages: "Retry" — verify: button appears
- [ ] Retry button re-sends last question — verify: clicking retry re-sends
- [ ] Log all errors to console.error with stack trace — verify: errors logged in DevTools
- [ ] Test: simulate Claude API error → verify user-friendly message shown — verify: no stack trace to user

### Task 011: Usage Logging

- [ ] Create `/spark/worker/analytics.js` file — verify: file exists
- [ ] Export `logRequest(event, data)` function — verify: function exported
- [ ] Log each request: `{ event: "question", site_id, latency_ms, error: null }` — verify: JSON structure correct
- [ ] Calculate latency: `Date.now() - startTime` — verify: latency calculated
- [ ] Log errors: `{ event: "error", site_id, error_type, error_message }` — verify: errors logged
- [ ] Log rate limits: `{ event: "rate_limited", site_id, limit_type }` — verify: rate limits logged
- [ ] Use console.log for structured JSON (Cloudflare captures this) — verify: logs visible in Cloudflare dashboard
- [ ] Test: send question → verify logged in Cloudflare dashboard — verify: log entry appears
- [ ] Test: trigger error → verify error logged with type — verify: error in logs
- [ ] Test: trigger rate limit → verify rate_limited event logged — verify: event in logs

---

## Wave 3: Launch (1-1.5 hours)

### Task 012: Landing Page (Steve's Vision)

- [ ] Create `/spark/landing/index.html` file — verify: file exists
- [ ] Add hero section with `<h1>Your website, instantly brilliant.</h1>` — verify: text renders
- [ ] Add subheading: "One script tag. Zero configuration." — verify: text renders
- [ ] Add code block with copy-paste script tag: `<script src="https://cdn.usespark.com/spark.js"></script>` — verify: code block formatted
- [ ] Add "Copy" button to code block — verify: clicking copies to clipboard
- [ ] Add live demo section below code block — verify: section present
- [ ] Add CTA button: "Try It Now" — verify: button renders
- [ ] Make CTA scroll to code block on click: `scrollIntoView({ behavior: 'smooth' })` — verify: scrolling works
- [ ] Add footer with "Powered by SPARK" attribution — verify: footer present
- [ ] Create `/spark/landing/styles.css` file — verify: file exists
- [ ] Style hero with generous whitespace: `margin: 80px 0` — verify: spacing correct
- [ ] Add purple gradient accents: `background: linear-gradient(...)` — verify: gradient visible
- [ ] Use system font stack: `font-family: -apple-system, BlinkMacSystemFont, ...` — verify: font applied
- [ ] Keep design minimal: no feature lists, no pricing grids — verify: only hero, code, demo, CTA

### Task 013: Live Demo Embed

- [ ] Add script tag to landing page: `<script src="../widget/spark.js"></script>` — verify: widget loads
- [ ] Widget auto-scrapes landing page content — verify: scraper runs on landing page
- [ ] Add suggested questions above demo: "Try asking: 'What is SPARK?' or 'How does it work?'" — verify: text visible
- [ ] Test: open landing page → widget button appears — verify: button renders
- [ ] Test: click widget button → panel opens — verify: panel slides up
- [ ] Test: ask "What is SPARK?" → correct answer from landing content — verify: answer accurate
- [ ] Test: ask "How does it work?" → correct answer — verify: answer accurate

### Task 014: CDN Deployment (Widget Script)

- [ ] Install bundler: `npm install esbuild --save-dev` — verify: package in package.json
- [ ] Create build script: `esbuild spark.js --bundle --minify --outfile=dist/spark.min.js` — verify: script in package.json
- [ ] Run build: `npm run build` → creates bundled file — verify: dist/spark.min.js exists
- [ ] Gzip bundle: `gzip -c dist/spark.min.js > dist/spark.min.js.gz` — verify: .gz file created
- [ ] Check bundle size: `ls -lh dist/spark.min.js.gz` → verify ≤10KB — verify: size ≤10240 bytes
- [ ] Deploy to Cloudflare R2 or Pages with public URL — verify: deployment succeeds
- [ ] Configure CDN caching: `Cache-Control: public, max-age=3600` — verify: header in response
- [ ] Set up versioning: create `/v1/spark.js` path — verify: versioned URL works
- [ ] Test: `curl https://cdn.usespark.com/spark.js` → returns script — verify: script downloaded
- [ ] Embed script in test page → widget loads and works — verify: end-to-end test passes

### Task 015: Cloudflare Worker Deployment

- [ ] Update wrangler.jsonc: `name: "spark-api"` — verify: name set
- [ ] Update wrangler.jsonc: `compatibility_date: "2026-04-19"` — verify: date set
- [ ] Update wrangler.jsonc: `compatibility_flags: ["nodejs_compat"]` — verify: flag set
- [ ] Configure secret: `wrangler secret put ANTHROPIC_API_KEY` — verify: secret added
- [ ] Test locally: `wrangler dev` → Worker starts — verify: localhost:8787 accessible
- [ ] Test local POST to /api/chat with valid request → 200 response — verify: response received
- [ ] Deploy to production: `wrangler deploy` — verify: deployment succeeds
- [ ] Get production URL from output — verify: URL format `https://spark-api.<subdomain>.workers.dev`
- [ ] Test production: POST to Worker URL with valid request → 200 response — verify: Claude answer returned
- [ ] Verify ANTHROPIC_API_KEY secret works in production — verify: API call succeeds
- [ ] Update widget API endpoint to production URL — verify: widget calls production Worker
- [ ] Test end-to-end: widget → Worker → Claude → widget — verify: full flow operational

---

## Final Verification

- [ ] Test on WordPress site (Astra theme) — verify: no conflicts, widget works
- [ ] Test on WordPress site (Divi theme) — verify: no conflicts, widget works
- [ ] Test on Shopify site (Dawn theme) — verify: no conflicts, widget works
- [ ] Test on Wix site — verify: no conflicts, widget works
- [ ] Test on static HTML site — verify: widget works
- [ ] Test on React SPA — verify: content scraper waits 1s, extracts content
- [ ] Test on Chrome (latest) — verify: widget works
- [ ] Test on Firefox (latest) — verify: widget works
- [ ] Test on Safari (latest) — verify: widget works
- [ ] Test on Edge (latest) — verify: widget works
- [ ] Test on iOS Safari — verify: widget works, mobile responsive
- [ ] Test on Android Chrome — verify: widget works, mobile responsive
- [ ] Measure first token latency: average of 10 requests — verify: <2s p95
- [ ] Measure widget load time: average of 10 page loads — verify: <500ms
- [ ] Check bundle size one final time — verify: ≤10KB gzipped
- [ ] Verify landing page live at usespark.com — verify: accessible
- [ ] Verify demo on landing page works — verify: can ask questions
- [ ] Verify "Powered by SPARK" links work — verify: opens https://usespark.com in new tab

---

**Total Tasks:** 107
**Completion Criteria:** All checkboxes checked, all verifications passed
**Ship Condition:** When final verification section is 100% complete

*Each task is atomic (<5 min), verifiable, and independent within its wave.*
