# WP-Agent: Atomic Requirements Extraction

**Project:** WP-Agent WordPress Plugin
**Extraction Date:** 2026-04-21
**Status:** APPROVED (Board 4-1)
**Source Documents:**
- /home/agent/shipyard-ai/prds/prd-wp-agent.md (PRD)
- /home/agent/shipyard-ai/rounds/prd-wp-agent/decisions.md (Decisions)
- /home/agent/shipyard-ai/rounds/prd-wp-agent/essence.md (Essence)

---

## FUNCTIONAL REQUIREMENTS

### F.1 Installation & Activation

**REQ-F-001: One-Click Plugin Installation**
- Atomic: Plugin installs from WordPress.org plugin directory
- Verifiable: Install action completes without manual configuration
- Acceptance Criteria:
  - Plugin appears in WordPress "Plugins" list after upload
  - User can click "Activate" button in WP admin
  - No API keys, credentials, or setup wizard required
- Source: PRD (Lines 54, 113-119), Essence (Lines 9-10)
- Test: Manual install on fresh WordPress 6.4 site

**REQ-F-002: Auto-Activation Widget Display**
- Atomic: Chat widget appears on site frontend immediately upon plugin activation
- Verifiable: Widget visible on public pages without admin configuration
- Acceptance Criteria:
  - Widget icon appears in bottom-right corner of site
  - Visitor can see icon on page load
  - No additional setup or configuration required
- Source: PRD (Lines 115-119), Decisions (Lines 165-170)
- Test: Screenshot verification on multiple WordPress themes

**REQ-F-003: Plugin Activation Hook**
- Atomic: Plugin triggers content indexing on activation
- Verifiable: Indexing process starts automatically when plugin is activated
- Acceptance Criteria:
  - Activation hook fires on plugin activation
  - Content indexing begins without user action
  - Progress indicator displayed to admin (optional for v1)
- Source: PRD (Line 117), Decisions (Lines 173, 221)
- Test: Check transient creation on activation

### F.2 Content Indexing

**REQ-F-004: Automated Content Scraping (Posts & Pages)**
- Atomic: Plugin scans all published pages and posts on site
- Verifiable: All published content indexed and retrievable
- Acceptance Criteria:
  - Indexes all WordPress pages (post_type='page')
  - Indexes all WordPress posts (post_type='post')
  - Extracts full text content (post_content)
  - Extracts title (post_title)
  - Stores in WordPress transients
  - Completes within 5 minutes for sites up to 1,000 pages
- Source: PRD (Lines 30, 54-58, 207-209), Decisions (Lines 106, 172-173)
- Test: Query transients, verify count matches published post count

**REQ-F-005: Smart Keyword Search Indexing**
- Atomic: Content is indexed using keyword extraction, not vector embeddings
- Verifiable: Search algorithm uses grep-style keyword matching
- Acceptance Criteria:
  - Extracts keywords from post titles and content
  - Builds searchable index using keyword patterns
  - Does NOT use vector embeddings or semantic search
  - Retrieves relevant content based on keyword matching
- Source: Decisions (Line 60), Essence (Line 27)
- Test: Index posts, search for keywords, verify matching results

**REQ-F-006: Content Auto-Update on Post Publish**
- Atomic: Index automatically refreshes when new content is published
- Verifiable: New posts appear in indexed content immediately
- Acceptance Criteria:
  - Hooks into WordPress post_save action
  - Updates transients when post is published
  - No manual refresh required
- Source: Decisions (Lines 262-265)
- Test: Publish new post, verify it appears in API responses

**REQ-F-007: Daily Content Re-indexing**
- Atomic: Index refreshes daily via WordPress cron
- Verifiable: All content re-indexed on daily schedule
- Acceptance Criteria:
  - Implements WordPress wp_schedule_event for daily cron
  - Runs full content refresh daily
  - Updates all transients without site owner interaction
- Source: Decisions (Lines 262-265)
- Test: Verify cron job runs, transients update

**REQ-F-008: Large Site Support (Up to 1,000 Pages)**
- Atomic: Plugin handles sites with up to 1,000 pages without failure
- Verifiable: Content indexing succeeds on large site test
- Acceptance Criteria:
  - Indexes 1,000 pages without timeout
  - Completes within 5 minutes
  - No out-of-memory errors
  - Batch processing implemented if needed
- Source: PRD (Lines 135, 207-209)
- Test: Test on site with 1,000+ posts, measure time and memory

### F.3 Chat Widget User Interface

**REQ-F-009: Floating Chat Icon (Bottom-Right)**
- Atomic: Chat widget icon displays as floating element
- Verifiable: Icon position matches specification
- Acceptance Criteria:
  - Icon positioned bottom-right corner of viewport
  - Position fixed (stays visible during scroll)
  - Customizable position deferred to v2
  - No text labels, icon-only
- Source: PRD (Lines 61, 122), Decisions (Lines 159, 267-270)
- Test: Verify positioning on mobile and desktop

**REQ-F-010: Clickable Widget Trigger**
- Atomic: Icon is clickable and opens chat interface
- Verifiable: Click action toggles chat window
- Acceptance Criteria:
  - Icon click opens chat interface
  - Icon click again closes chat interface
  - No page reload or navigation
  - Instant response to click
- Source: PRD (Lines 122-126), Decisions (Lines 158-162)
- Test: Manual click test, JavaScript click simulation

**REQ-F-011: Chat Interface Greeting Message**
- Atomic: Chat widget displays greeting when opened
- Verifiable: Specific greeting text appears
- Acceptance Criteria:
  - Message format: "What are you looking for?"
  - No jargon, human language
  - Appears immediately on widget open
- Source: Decisions (Line 186)
- Test: Open widget, verify message text

**REQ-F-012: Chat Input Field**
- Atomic: User can type question in chat widget
- Verifiable: Input field accepts text
- Acceptance Criteria:
  - Text input field present in widget
  - Accepts visitor questions
  - Placeholder text: "What are you looking for?"
  - Enter key submits query
- Source: PRD (Lines 123-124), Decisions (Line 186)
- Test: Type in field, verify text entry and submission

**REQ-F-013: Streaming Response Display**
- Atomic: AI response displays with streaming animation
- Verifiable: Response appears character-by-character
- Acceptance Criteria:
  - Response streams to user in real-time
  - First character appears within 2 seconds
  - Continues streaming until complete
  - User sees typing/streaming effect
- Source: Decisions (Lines 87, 181)
- Test: Measure time-to-first-character and streaming speed

**REQ-F-014: Widget Close Button**
- Atomic: User can close chat widget
- Verifiable: Close action hides widget
- Acceptance Criteria:
  - Close button visible in widget header
  - Click closes widget
  - Clicking icon again re-opens widget
- Source: PRD (Lines 125-126), Decisions (Line 163)
- Test: Open/close cycle

**REQ-F-015: Mobile-Responsive Widget**
- Atomic: Widget functions on mobile devices
- Verifiable: Widget displays and works on iOS/Android
- Acceptance Criteria:
  - Widget adapts to small screens (<400px width)
  - Touch-friendly tap targets (min 44px)
  - No text truncation or overflow
  - Works on 3G/4G networks
- Source: PRD (Line 63)
- Test: Test on iOS Safari and Android Chrome

**REQ-F-016: Shadow DOM Isolation**
- Atomic: Widget styles don't conflict with site styles
- Verifiable: Widget CSS is scoped
- Acceptance Criteria:
  - Widget uses shadow DOM or CSS scoping
  - Site CSS doesn't affect widget appearance
  - Widget doesn't break site styling
  - Works on all tested WordPress themes
- Source: PRD (Line 174), Decisions (Line 62)
- Test: Deploy on 10 different themes, verify no conflicts

### F.4 AI Response Engine

**REQ-F-017: Query to Claude Haiku API**
- Atomic: Plugin sends visitor query to Claude Haiku model
- Verifiable: API request reaches Anthropic Claude API
- Acceptance Criteria:
  - Query sent via async proxy to Claude Haiku
  - Uses Claude Haiku model (single model, no routing)
  - Query includes site content context
  - API key securely stored (not in plugin)
- Source: Decisions (Lines 59, 108), Essence (Lines 21, 27)
- Test: Monitor API requests, verify model used

**REQ-F-018: Content Context in AI Requests**
- Atomic: Relevant site content provided to Claude
- Verifiable: AI receives keyword-matched content
- Acceptance Criteria:
  - Query includes top keyword-matched pages/posts
  - Content context limited to relevant results only
  - Full text of matching pages included in prompt
  - No sensitive content leaked
- Source: Decisions (Lines 174-176)
- Test: Log API requests, verify content provided

**REQ-F-019: Direct Answer Response**
- Atomic: AI returns natural language answer
- Verifiable: Response is human-readable answer
- Acceptance Criteria:
  - Answers directly address visitor question
  - Uses conversational, friendly tone
  - No jargon, no "AI-powered" language
  - Response in 2-3 sentences typically
- Source: Decisions (Lines 187-189)
- Test: 50 manual test queries, evaluate answer quality

**REQ-F-020: Source Link Citation**
- Atomic: AI includes link to relevant page
- Verifiable: Response includes URL
- Acceptance Criteria:
  - When answer found, includes link to source page
  - Link format: "Here's our delivery policy" (linked text)
  - Link points to actual page on site
  - Link opens in same or new tab
- Source: PRD (Lines 70, 125), Decisions (Line 188)
- Test: 20 queries with answers, verify all have links

**REQ-F-021: Honest "I Don't Know" Fallback**
- Atomic: AI admits when it can't find answer
- Verifiable: Specific fallback text appears
- Acceptance Criteria:
  - Message format: "I couldn't find that info, but here's our contact page."
  - Includes link to contact/help page when uncertain
  - No hallucinations or made-up answers
  - Prevents misinformation
- Source: PRD (Lines 71, 176), Decisions (Line 188)
- Test: Query topics not on site, verify fallback message

**REQ-F-022: Async Proxy Architecture**
- Atomic: AI requests don't block WordPress execution
- Verifiable: Requests handled outside PHP process
- Acceptance Criteria:
  - Async proxy server (Node.js) handles AI calls
  - WordPress plugin doesn't wait for AI response
  - Response served via AJAX/fetch after AI returns
  - Prevents shared hosting crashes
- Source: Decisions (Lines 54, 61, 108, 284-288)
- Test: Monitor PHP execution time, verify <100ms

**REQ-F-023: Rate Limiting (100 queries/month per site)**
- Atomic: Plugin enforces maximum 100 queries per month
- Verifiable: Queries rejected after limit reached
- Acceptance Criteria:
  - Tracks query count per site
  - Hard cap at 100 queries/month
  - Proxy refuses requests beyond limit
  - User sees message: "Monthly query limit reached"
  - Resets monthly (calendar month basis)
- Source: Decisions (Lines 296, 425), Risks (Lines 291-300)
- Test: Submit >100 queries, verify rejection

**REQ-F-024: API Cost Monitoring**
- Atomic: System tracks Claude API costs
- Verifiable: Alerting system monitors spending
- Acceptance Criteria:
  - Monitors total monthly API spend
  - Alert triggered at $1,000/day spend
  - Dashboard shows current month cost (internal)
  - Prevents runaway costs
- Source: Risks (Lines 291-300)
- Test: Verify alert system, check monitoring logs

### F.5 REST API

**REQ-F-025: Chat REST Endpoint**
- Atomic: Plugin exposes REST API for chat requests
- Verifiable: Endpoint responds to POST requests
- Acceptance Criteria:
  - Endpoint: `/wp-json/wp-agent/v1/chat` (POST)
  - Accepts JSON payload: `{ "query": "user question" }`
  - Returns JSON: `{ "response": "answer", "source_url": "link" }`
  - Accessible from frontend without auth
- Source: Decisions (Lines 57, 173)
- Test: cURL/Postman test, verify request/response format

**REQ-F-026: CORS Headers for Widget**
- Atomic: Widget can make cross-domain requests
- Verifiable: CORS headers present in response
- Acceptance Criteria:
  - Response includes `Access-Control-Allow-Origin: *`
  - Allows XMLHttpRequest from widget
  - No preflight failures
- Source: Decisions (Line 173)
- Test: Browser DevTools, verify no CORS errors

**REQ-F-027: Input Sanitization**
- Atomic: User input is sanitized before processing
- Verifiable: Malicious input rejected or escaped
- Acceptance Criteria:
  - All user input sanitized (query text)
  - SQL injection prevented
  - XSS prevention (escape output)
  - Follows WordPress sanitization standards
- Source: Risk (Lines 302-312), Decisions (Line 225)
- Test: Security testing with malicious payloads

**REQ-F-028: Request Rate Limiting (Per IP)**
- Atomic: API prevents abuse from single IP
- Verifiable: Excessive requests rejected
- Acceptance Criteria:
  - Max 10 requests per minute per IP
  - Returns 429 Too Many Requests after limit
  - Prevents DDoS attacks
- Source: Decisions (Line 296)
- Test: Rapid fire requests from single IP, verify rate limit

### F.6 Admin Settings & Dashboard

**REQ-F-029: Admin Settings Page**
- Atomic: Site admin can access WP-Agent settings
- Verifiable: Settings page appears in WordPress admin
- Acceptance Criteria:
  - Menu item: "WP-Agent" in WordPress sidebar
  - Accessible at: `/wp-admin/admin.php?page=wp-agent`
  - Only visible to administrators
- Source: PRD (Lines 74, 120), Decisions (Lines 110, 222)
- Test: Admin access, verify page loads

**REQ-F-030: On/Off Toggle**
- Atomic: Admin can disable/enable widget
- Verifiable: Toggle switch changes widget status
- Acceptance Criteria:
  - Toggle switch (checkbox) on settings page
  - Unchecking disables widget on all pages
  - Checking re-enables widget
  - Change persists across page reloads
  - Default: Enabled (on activation)
- Source: Decisions (Lines 110, 222)
- Test: Toggle on/off, verify widget appears/disappears

**REQ-F-031: Zero Configuration Default**
- Atomic: No additional settings required for MVP
- Verifiable: Plugin works without any admin input
- Acceptance Criteria:
  - Only "on/off" toggle visible
  - No API key input field
  - No custom instructions field
  - No color customization (deferred to v2)
  - Widget appears immediately on activation
- Source: Decisions (Lines 110-123), Essence (Line 9)
- Test: Fresh install, verify zero config needed

### F.7 Widget Content & Branding

**REQ-F-032: "Powered by GUIDE" Branding**
- Atomic: Widget displays branding attribution
- Verifiable: Branding text visible in widget
- Acceptance Criteria:
  - Small text at bottom of widget: "Powered by GUIDE"
  - Not removable in v1 (Pro feature in v2)
  - Doesn't obscure functionality
  - Links to plugin homepage (optional)
- Source: PRD (Lines 65, 111), Decisions (Lines 111, 220)
- Test: Visual inspection, branding appears

**REQ-F-033: No Jargon Language**
- Atomic: Widget copy uses simple, human language
- Verifiable: No "AI-powered," "machine learning," or technical terms
- Acceptance Criteria:
  - Greeting: "What are you looking for?" (simple)
  - Answers: Direct and conversational
  - Error: "I couldn't find that" (honest, not apologetic)
  - No "AI" mentions in widget
- Source: Decisions (Lines 78, 185-189), Essence (Lines 12, 21)
- Test: Copy audit, verify no technical jargon

---

## PERFORMANCE REQUIREMENTS

### P.1 Load Time

**REQ-P-001: Widget Load Time <500ms**
- Atomic: Widget script loads and initializes within 500ms
- Verifiable: Measured at first paint
- Acceptance Criteria:
  - Widget visible on screen within 500ms
  - Measured on 3G network (simulated)
  - Measured on fresh page load
  - Includes DOM parsing and initial render
- Source: PRD (Line 136), Decisions (Lines 62, 179)
- Test: Measure via Chrome DevTools, WebPageTest

**REQ-P-002: Time to Interactive <1 second**
- Atomic: Widget accepts user input within 1 second
- Verifiable: User can type in input field
- Acceptance Criteria:
  - Widget responsive to user input at <1s
  - No "loading" state before accepting input
  - Click/tap on icon registers immediately
- Source: Decisions (Lines 62, 180)
- Test: Measure interaction latency via synthetic test

**REQ-P-003: Chat Response Time <2 seconds**
- Atomic: AI response appears within 2 seconds
- Verifiable: Time from query submission to first response character
- Acceptance Criteria:
  - First character of response within 2 seconds
  - Streaming begins immediately (perceived speed)
  - Includes network latency
  - Measured on 3G network
- Source: PRD (Line 135), Decisions (Lines 62, 181)
- Test: Measure streaming start time, verify <2s

**REQ-P-004: Widget Bundle Size <20KB**
- Atomic: Widget JavaScript is small
- Verifiable: Minified bundle size measured
- Acceptance Criteria:
  - Widget JavaScript <20KB (gzipped)
  - Includes widget UI + API calls
  - No external dependencies
- Source: Decisions (Lines 62, 65, 183)
- Test: Build widget, check bundle size with `wc -c`

**REQ-P-005: Network Latency 3G/4G Optimization**
- Atomic: Widget performs on slow networks
- Verifiable: Works on simulated 3G connection
- Acceptance Criteria:
  - No timeout errors on 3G (2G latency)
  - Graceful degradation on slow networks
  - Streaming prevents perceived lag
- Source: Decisions (Lines 87, 326-334)
- Test: WebPageTest with 3G throttling

### P.2 Indexing Performance

**REQ-P-006: Initial Indexing <5 minutes**
- Atomic: Full content index created on activation
- Verifiable: Indexing completes within 5 minutes
- Acceptance Criteria:
  - First index for 1,000 pages completes in <5min
  - No timeout on shared hosting
  - Progress tracked internally
- Source: PRD (Lines 117, 207-209)
- Test: Measure indexing time on test site

**REQ-P-007: Daily Re-indexing <5 minutes**
- Atomic: Content refresh runs within time limit
- Verifiable: Daily cron completes successfully
- Acceptance Criteria:
  - Daily refresh of all content <5min
  - Doesn't block site admin tasks
  - Runs off-hours (configurable in future)
- Source: Decisions (Lines 262-265)
- Test: Monitor daily cron execution time

---

## TECHNICAL REQUIREMENTS

### T.1 Platform & Environment

**REQ-T-001: WordPress 6.0+ Compatibility**
- Atomic: Plugin works on WordPress 6.0 and later versions
- Verifiable: Tested on multiple WordPress versions
- Acceptance Criteria:
  - Compatible with WordPress 6.0, 6.1, 6.2, 6.3, 6.4, 6.5
  - No deprecation warnings in WordPress debug.log
  - Uses modern WordPress APIs
- Source: PRD (Line 105)
- Test: Install on multiple WP versions, verify activation

**REQ-T-002: PHP 8.0+ Requirement**
- Atomic: Plugin requires PHP 8.0 or later
- Verifiable: Version check on activation
- Acceptance Criteria:
  - Check PHP version on activation
  - Deactivate if PHP <8.0
  - Show admin notice if incompatible
- Source: PRD (Line 105)
- Test: Test on PHP 7.4 (should fail), 8.0+ (should work)

**REQ-T-003: No PHP Errors or Warnings**
- Atomic: Plugin produces no PHP errors in debug mode
- Verifiable: WordPress debug.log is clean
- Acceptance Criteria:
  - Zero fatal errors
  - Zero warnings in debug mode
  - Zero notices in debug mode
  - Clean when WP_DEBUG=true
- Source: PRD (Line 213)
- Test: Run with WP_DEBUG=true, check debug.log

**REQ-T-004: No JavaScript Console Errors**
- Atomic: Widget produces no JavaScript errors
- Verifiable: Browser console is clean
- Acceptance Criteria:
  - No errors in browser console
  - No warnings in console
  - Works with strict CSP headers
- Source: PRD (Line 213)
- Test: Check browser console, run with CSP

### T.2 Technology Stack

**REQ-T-005: Preact or Vanilla JavaScript Widget**
- Atomic: Widget uses Preact or vanilla JS, not React
- Verifiable: Dependencies listed in package.json
- Acceptance Criteria:
  - Uses Preact (3KB) OR vanilla JS
  - No React dependency
  - No jQuery dependency
  - Bundled with Vite
- Source: Decisions (Lines 58, 227)
- Test: Inspect build output, verify framework used

**REQ-T-006: Vite Build Tool**
- Atomic: Widget built with Vite
- Verifiable: vite.config.js present and used
- Acceptance Criteria:
  - Widget source code bundled with Vite
  - Source maps generated for debugging
  - Build output minified
- Source: Decisions (Lines 58, 227)
- Test: Verify build process uses Vite

**REQ-T-007: Claude Haiku API Integration**
- Atomic: Plugin uses Claude Haiku model
- Verifiable: Haiku model specified in API calls
- Acceptance Criteria:
  - Uses `claude-3-5-haiku-20241022` model
  - Single model (no hybrid routing)
  - Requests routed through async proxy
  - API key stored securely
- Source: Decisions (Lines 59, 108)
- Test: Check API logs, verify model used

**REQ-T-008: Async Proxy Server (Node.js)**
- Atomic: AI requests handled by separate Node.js server
- Verifiable: Proxy server deployed and running
- Acceptance Criteria:
  - Separate Node.js server handles Claude API calls
  - WordPress plugin makes HTTP request to proxy
  - Proxy hosted on Railway, Render, or equivalent
  - No PHP timeout from slow AI requests
- Source: Decisions (Lines 61, 108)
- Test: Deploy proxy, verify WordPress communicates with it

**REQ-T-009: WordPress Transients for Storage**
- Atomic: Content stored in WordPress transients
- Verifiable: Data stored in wp_options table
- Acceptance Criteria:
  - Uses WordPress transient API
  - No custom database tables
  - Data expires after 30 days (or manual refresh)
  - No external databases
- Source: Decisions (Lines 106, 222)
- Test: Query wp_options, verify transient keys

**REQ-T-010: WordPress REST API**
- Atomic: Chat endpoint uses WordPress REST API
- Verifiable: Endpoint registered with register_rest_route()
- Acceptance Criteria:
  - Uses WordPress REST API framework
  - Endpoint at `/wp-json/wp-agent/v1/chat`
  - Proper error handling
  - CORS headers set correctly
- Source: Decisions (Lines 57, 173)
- Test: Query REST endpoint, verify format

### T.3 Security

**REQ-T-011: Input Sanitization (WordPress Standards)**
- Atomic: All user input sanitized before use
- Verifiable: Sanitization functions called
- Acceptance Criteria:
  - Uses `sanitize_text_field()` for user queries
  - SQL injection prevention
  - XSS prevention via escaping
  - Follows WordPress coding standards
- Source: Risk (Lines 302-312), Decisions (Line 225)
- Test: Submit malicious payloads, verify rejection

**REQ-T-012: Output Escaping**
- Atomic: All output escaped before display
- Verifiable: Escaping functions used in HTML
- Acceptance Criteria:
  - Uses `esc_html()` for text output
  - Uses `esc_url()` for URL output
  - Uses `wp_json_encode()` for JavaScript
  - Prevents XSS attacks
- Source: Risk (Lines 302-312)
- Test: Verify escaping in source code, XSS tests

**REQ-T-013: No Bundled Third-Party Libraries**
- Atomic: No pre-bundled npm packages in plugin
- Verifiable: Only source code in plugin, no node_modules
- Acceptance Criteria:
  - Plugin directory doesn't contain node_modules
  - Widget built and minified before release
  - No security issues from bundled packages
- Source: Risk (Lines 302-312), Decisions (Line 225)
- Test: Check plugin directory, verify no node_modules

**REQ-T-014: API Key Security**
- Atomic: Claude API key not stored in plugin config
- Verifiable: Key stored only on proxy server
- Acceptance Criteria:
  - API key not in wp-config.php
  - Key not in plugin settings
  - Key only on async proxy server
  - Transmitted over HTTPS only
- Source: Decisions (Lines 108, 225)
- Test: Code review, verify no hardcoded keys

**REQ-T-015: WordPress.org Compliance**
- Atomic: Plugin meets WordPress.org requirements
- Verifiable: Plugin passes submission review
- Acceptance Criteria:
  - Follows WordPress coding standards
  - Unminified source code included
  - No unvetted third-party code
  - Passes security review
- Source: Risk (Lines 302-312), Decisions (Line 225)
- Test: Review against WordPress.org guidelines

### T.4 Data Storage

**REQ-T-016: No Conversation History Storage**
- Atomic: Plugin doesn't store chat conversations
- Verifiable: No conversation records in database
- Acceptance Criteria:
  - Queries not logged
  - Responses not stored
  - No user tracking
  - Each conversation is stateless
- Source: Decisions (Line 120), Essence (Line 21)
- Test: Check database, verify no conversation tables

**REQ-T-017: Transient Data Expiration**
- Atomic: Indexed content expires and refreshes
- Verifiable: Transients have expiration time
- Acceptance Criteria:
  - Transient TTL set (30 days or manual refresh)
  - Automatic cleanup via WordPress cron
  - No permanent data storage
- Source: Decisions (Lines 262-265)
- Test: Verify transient expiration in code

---

## USER EXPERIENCE REQUIREMENTS

### UX.1 Installation Experience

**REQ-UX-001: Zero-Config Installation**
- Atomic: Plugin works immediately after activation
- Verifiable: No setup required
- Acceptance Criteria:
  - Install and activate = widget appears
  - No configuration wizard
  - No API key entry
  - No prompts or dialogs
  - Default behavior is correct
- Source: Essence (Line 9), Decisions (Lines 12, 76-77, 109)
- Test: Fresh install, verify widget appears without config

**REQ-UX-002: No Setup Wizard**
- Atomic: Plugin activation doesn't trigger setup steps
- Verifiable: Direct activation without wizard
- Acceptance Criteria:
  - No modal or wizard after activation
  - No "Getting Started" page
  - No "Configure API" prompts
  - Direct to admin dashboard
- Source: Decisions (Lines 76, 109)
- Test: Activate plugin, verify no wizard appears

**REQ-UX-003: Self-Evident Widget Design**
- Atomic: Widget UI is intuitive without tutorial
- Verifiable: Users understand function without instruction
- Acceptance Criteria:
  - Icon clearly indicates chat function
  - Clicking opens obvious chat interface
  - Input field prompts for question
  - No onboarding tooltip needed
- Source: Decisions (Lines 76, 90-91)
- Test: User testing with 5 new visitors

**REQ-UX-004: No Loading Spinner Before Response**
- Atomic: Widget doesn't show empty loading state
- Verifiable: Streaming response begins immediately
- Acceptance Criteria:
  - User submits query
  - Streaming response begins within 2s
  - No "loading..." spinner before response
  - Streaming provides perceived speed
- Source: Decisions (Lines 81-82, 87)
- Test: Verify response starts streaming immediately

### UX.2 Widget Behavior

**REQ-UX-005: Invisible Until Needed**
- Atomic: Widget doesn't demand attention
- Verifiable: No pulsing, animations, or badges
- Acceptance Criteria:
  - Static icon, no pulsing or animation
  - No "Try me!" badge
  - No autoplay or pop-ups
  - Subtle presence on page
  - Icon color appropriate for site
- Source: Decisions (Lines 76, 88, 91)
- Test: Visual inspection, verify no distracting elements

**REQ-UX-006: Instant Widget Open**
- Atomic: Chat opens immediately on click
- Verifiable: No delay before widget appears
- Acceptance Criteria:
  - Icon click instantly opens widget
  - <100ms delay to open
  - No animation delay
  - Smooth appearance
- Source: Decisions (Lines 81, 158-162)
- Test: Measure click-to-open time

**REQ-UX-007: Conversational Concierge Tone**
- Atomic: AI voice is helpful, not buddy or butler
- Verifiable: Response language and tone
- Acceptance Criteria:
  - Professional but friendly tone
  - Not overly casual ("Hey buddy!")
  - Not overly formal ("Excellent query, sir")
  - Like a helpful concierge at hotel
- Source: Decisions (Lines 92-93)
- Test: Tone audit, verify response voice

**REQ-UX-008: Direct Answers Without Jargon**
- Atomic: Responses are simple and direct
- Verifiable: Response format and language
- Acceptance Criteria:
  - Answers main question first
  - No preface or apology
  - No "AI-powered" mentions
  - 2-3 sentence answers typical
- Source: Decisions (Lines 187-189)
- Test: Evaluate 50 responses for clarity and directness

### UX.3 Error Handling

**REQ-UX-009: Honest "I Don't Know" Messages**
- Atomic: When uncertain, AI admits it
- Verifiable: Specific message format
- Acceptance Criteria:
  - Message: "I couldn't find that info, but here's our contact page."
  - Includes helpful link
  - No hallucination or guessing
  - Honest about limitations
- Source: Decisions (Lines 92-93, 188)
- Test: Query non-existent info, verify message

**REQ-UX-010: Graceful Degradation on API Failure**
- Atomic: Widget handles API errors gracefully
- Verifiable: Error messages are helpful
- Acceptance Criteria:
  - Network timeout: "Please try again"
  - API error: "I'm having trouble right now"
  - Rate limit: "Monthly limit reached"
  - User sees helpful message, not error codes
- Source: PRD (Line 71)
- Test: Simulate API failures, verify error messages

### UX.4 Brand & Voice

**REQ-UX-011: Product Name Placeholder "GUIDE"**
- Atomic: Plugin uses "GUIDE" as working title
- Verifiable: Name used in branding and copy
- Acceptance Criteria:
  - Working title: "GUIDE"
  - Will rebrand after trademark clearance
  - Placeholder for v1 launch
  - Trademark check required before final name
- Source: Decisions (Lines 34, 220)
- Test: Verify branding uses "GUIDE"

**REQ-UX-012: Branding Attribution**
- Atomic: "Powered by GUIDE" visible in widget
- Verifiable: Attribution text present
- Acceptance Criteria:
  - Small text at widget bottom: "Powered by GUIDE"
  - Not obtrusive or distracting
  - Not removable in v1 (pro feature v2)
- Source: Decisions (Lines 111, 220)
- Test: Verify branding text visible

---

## CONSTRAINTS

### CON.1 Project Scope

**CON-001: MVP Feature Set (V1 Only)**
- Scope: Limited to core features
- Verifiable: Feature list matches requirements
- Details:
  - Content indexing (posts + pages only)
  - Chat widget with streaming
  - Single REST endpoint
  - Zero-config activation
  - On/off admin toggle
  - "Powered by GUIDE" branding
- Deferred to V2:
  - WooCommerce products
  - Form completion / actions
  - Multi-language support
  - White-label / branding removal
  - Conversation memory
  - Analytics dashboard
  - Vector embeddings
  - Hybrid AI routing
- Source: Decisions (Lines 105-123)

**CON-002: Build Timeline (One Agent Session)**
- Scope: Complete build within single session
- Verifiable: Estimated 5.5 hours
- Details:
  - Plugin scaffold: 30 min
  - Content indexer: 45 min
  - REST endpoint: 30 min
  - Async proxy: 45 min
  - Widget: 2 hours
  - Admin page: 30 min
  - Testing: 1 hour
- Source: Decisions (Lines 221-230)
- Constraint: Hard timeline requirement

**CON-003: No Vector Embeddings in V1**
- Scope: Use keyword search only
- Verifiable: No vector database or embeddings
- Details:
  - Grep-style keyword matching
  - No semantic search
  - No ML-based similarity
  - Simple keyword indexing
- Rationale: Simplify architecture for one-session build
- Source: Decisions (Lines 60, 222)

**CON-004: Single AI Model (Haiku Only)**
- Scope: No hybrid routing or fallbacks
- Verifiable: Only Haiku model used
- Details:
  - Claude Haiku only (no fallback to workers AI)
  - No routing logic
  - Single model for all queries
  - Simple architecture
- Rationale: Simplify infrastructure
- Source: Decisions (Lines 59, 108)

**CON-005: No Cloudflare Workers in V1**
- Scope: Async proxy server instead
- Verifiable: Node.js proxy on Railway/Render
- Details:
  - Use Railway or Render for proxy
  - Not Cloudflare Workers
  - Simpler deployment
- Deferred to V2: Cloudflare Workers option
- Source: Decisions (Line 108)

### CON.2 Performance Constraints

**CON-006: Widget <20KB Bundle Size**
- Scope: Hard limit on JavaScript bundle
- Verifiable: Minified bundle size <20KB
- Details:
  - Including all widget code and styles
  - Excluding async proxy calls
  - Must meet on all build systems
- Source: Decisions (Lines 62, 65, 183)
- Enforcement: Build process fails if exceeded

**CON-007: Plugin <500ms Load Time**
- Scope: First paint performance
- Verifiable: Measured on 3G network
- Details:
  - 500ms maximum load time
  - Includes DOM parsing
  - Measured on simulated 3G
- Source: Decisions (Lines 62, 179)

**CON-008: Response <2 second Time**
- Scope: AI response latency
- Verifiable: Streaming starts within 2s
- Details:
  - 2 seconds from query submission
  - Includes network latency
  - Measured on 3G network
- Source: Decisions (Lines 62, 181)

### CON.3 Platform Constraints

**CON-009: WordPress Plugin Directory Compliance**
- Scope: Must meet WordPress.org standards
- Verifiable: Accepted by review
- Details:
  - Follows WordPress coding standards
  - Security review required
  - Unminified source included
  - No external API key requirements from user
  - Proper sanitization and escaping
- Source: Decisions (Line 225)

**CON-010: Shared Hosting Compatibility**
- Scope: Works on cheap shared hosting
- Verifiable: No site crashes
- Details:
  - No long-running PHP processes
  - Async proxy handles AI calls
  - Prevents PHP timeout
  - No memory spike from indexing
- Source: Decisions (Lines 54, 284-288)

**CON-011: No External API Keys in Plugin**
- Scope: Zero-config installation
- Verifiable: No API key configuration
- Details:
  - Users don't configure Claude API key
  - Key stored only on proxy server
  - Plugin makes request to proxy
  - Proxy has authorized access
- Source: Decisions (Lines 76, 109)

### CON.4 Business Constraints

**CON-012: API Cost Sustainability**
- Scope: Rate limiting prevents runaway costs
- Verifiable: Cost caps enforced
- Details:
  - 100 queries/month per free site
  - Hard rate limit enforced by proxy
  - Monitoring at $1K/day spend
  - Future: Tiered pricing model
- Source: Decisions (Lines 296, 425)

**CON-013: Free Distribution (MVP)**
- Scope: No monetization in V1
- Verifiable: Plugin free on WordPress.org
- Details:
  - Free plugin distribution
  - No paid license requirement
  - Freemium model in V2
  - Focus on product-market fit first
- Source: PRD (Line 201), Decisions (Line 243-250)

**CON-014: Trademark Clearance Required**
- Scope: Name must be legally clear
- Verifiable: Trademark search completed
- Details:
  - "GUIDE" working title (provisional)
  - Must clear trademark before production
  - Backup names: Concierge, Compass, Chat
  - Acceptable to rebrand at 10K users if needed
- Source: Decisions (Lines 34, 237-241)

---

## ACCEPTANCE CRITERIA SUMMARY

### Definition of Done (Launch Criteria)

**Launch is complete when:**

1. **Installation Works**
   - Plugin installs on fresh WordPress 6.4 site
   - Activation completes without errors
   - Widget appears on frontend automatically

2. **Content Indexing Works**
   - All published posts and pages indexed
   - Indexing completes within 5 minutes
   - Content retrievable and searchable

3. **Chat Widget Works**
   - Widget icon visible on all pages
   - Widget opens on click
   - User can type question in input field
   - Response displays with streaming effect

4. **AI Responses Work**
   - Queries sent to Claude Haiku
   - Responses include relevant site content
   - Answers cite source links when available
   - "I don't know" message for uncertain queries

5. **Admin Settings Work**
   - Settings page accessible in WordPress admin
   - On/off toggle visible and functional
   - Toggling disables/enables widget
   - Setting persists across page reloads

6. **Performance Targets Met**
   - Widget loads in <500ms (3G network)
   - Response time <2 seconds
   - Widget bundle <20KB
   - No PHP errors or JS console errors

7. **Code Quality**
   - Zero PHP errors in debug mode
   - Zero JavaScript console errors
   - No security vulnerabilities
   - Follows WordPress coding standards

8. **Documentation Complete**
   - README.txt written
   - Installation instructions clear
   - FAQ section included
   - Changelog documented

Source: PRD (Lines 205-214), Decisions (Lines 396-422)

---

## REQUIREMENT CROSS-REFERENCE

### By Source Document

**PRD (prd-wp-agent.md):** REQ-F-001 to F-033, REQ-P-001 to P-007, REQ-T-001 to T-017, REQ-UX-001 to UX-012, CON-001 to CON-014

**Decisions (decisions.md):** REQ-F-001 to F-033, REQ-P-001 to P-007, REQ-T-001 to T-017, REQ-UX-001 to UX-012, CON-001 to CON-014

**Essence (essence.md):** REQ-UX-001, REQ-T-005 to T-010, REQ-UX-002 to UX-005, CON-001

### By Category Count

- **Functional Requirements:** 33 (F-001 to F-033)
- **Performance Requirements:** 7 (P-001 to P-007)
- **Technical Requirements:** 17 (T-001 to T-017)
- **User Experience Requirements:** 12 (UX-001 to UX-012)
- **Constraints:** 14 (CON-001 to CON-014)

**Total Atomic Requirements: 83**

---

## TRACEABILITY NOTES

Each requirement:
- Has a unique identifier (REQ-X-###)
- Specifies atomic, testable criteria
- Lists source document(s)
- Includes verification method
- Is verifiable and measurable

### For Task Planning

Every task plan item should reference one or more REQ-X-### identifiers. Example:

```
TASK: Build Chat REST Endpoint
  REQ-F-025: Chat REST Endpoint
  REQ-T-010: WordPress REST API
  REQ-UX-008: Direct Answers Without Jargon
```

This ensures complete traceability from requirements to implementation to testing.

---

**Document Status:** COMPLETE
**Ready for:** Build Phase Task Planning
**Version:** 1.0
**Last Updated:** 2026-04-21
