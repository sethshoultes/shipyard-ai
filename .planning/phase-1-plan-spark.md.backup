# Phase 1 Plan — SPARK (LocalGenius Lite)

**Generated:** 2026-04-19
**Requirements:** `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks:** 15 XML task plans
**Waves:** 3 waves (parallel execution within waves)
**Estimated Duration:** 4-6 hours (per locked decisions)

---

## Executive Summary

SPARK is an AI-powered chat widget that makes any website instantly helpful. One script tag, zero configuration.

**Architecture (Locked):**
- Client-side UUID generation (no auth, no dashboard in V1)
- Shadow DOM widget (vanilla JS, <10KB gzipped)
- Cloudflare Worker + Claude 3.5 Haiku
- Streaming responses via SSE
- Rate limiting: 10 req/min per site_id, 100 req/hour per IP

**Critical Path:**
- Wave 1: Widget UI + Content Scraping + Worker Foundation
- Wave 2: Claude Integration + Rate Limiting + Error Handling
- Wave 3: Landing Page + Deployment

---

## Requirements Traceability

| Requirement Category | Task(s) | Wave | Coverage |
|---------------------|---------|------|----------|
| **Widget UI** | tasks 1-3 | 1 | REQ-001 through REQ-014, REQ-040-042, REQ-066-075 |
| **Content Scraping** | task 4 | 1 | REQ-015 through REQ-021, REQ-064-065 |
| **Worker Foundation** | task 5 | 1 | REQ-022-026, REQ-045, REQ-059-063 |
| **Claude Integration** | tasks 6-7 | 2 | REQ-027-039 |
| **Rate Limiting** | task 8 | 2 | REQ-031-033 |
| **Streaming** | task 9 | 2 | REQ-028-030 |
| **Error Handling** | task 10 | 2 | REQ-043-044, REQ-080 |
| **Logging** | task 11 | 2 | REQ-078 |
| **Landing Page** | tasks 12-13 | 3 | REQ-046-052 |
| **Deployment** | tasks 14-15 | 3 | REQ-053, REQ-069-070 |

---

## Wave Execution Order

### Wave 1: Foundation (Parallel Execution)
**Duration:** 1.5-2 hours
**Tasks:** 5 independent tasks
**Focus:** Widget UI, content extraction, worker skeleton

**Tasks:**
- `phase-1-task-001`: Widget UI component (button + panel)
- `phase-1-task-002`: Chat panel interactions
- `phase-1-task-003`: Shadow DOM setup + CSS isolation
- `phase-1-task-004`: Page content scraper (SPA-aware)
- `phase-1-task-005`: Cloudflare Worker foundation

### Wave 2: Integration (Parallel, after Wave 1)
**Duration:** 2-2.5 hours
**Tasks:** 6 tasks depending on Wave 1
**Focus:** Claude API, streaming, rate limiting

**Tasks:**
- `phase-1-task-006`: Claude API integration
- `phase-1-task-007`: System prompt engineering
- `phase-1-task-008`: Rate limiting (multi-layer)
- `phase-1-task-009`: Streaming response handler
- `phase-1-task-010`: Error handling + timeouts
- `phase-1-task-011`: Usage logging (Cloudflare Analytics)

### Wave 3: Launch (Parallel, after Wave 2)
**Duration:** 1-1.5 hours
**Tasks:** 4 tasks for deployment
**Focus:** Landing page, CDN deployment

**Tasks:**
- `phase-1-task-012`: Landing page (Steve's vision)
- `phase-1-task-013`: Live demo embed
- `phase-1-task-014`: CDN deployment (widget script)
- `phase-1-task-015`: Cloudflare Worker deployment

---

## XML Task Plans

### Wave 1 (Parallel — No Dependencies)

<task-plan id="phase-1-task-001" wave="1">
  <title>Widget UI: Floating Button + Chat Panel</title>
  <requirement>REQ-001 through REQ-014: Create widget UI structure</requirement>
  <description>
    Build core widget UI: 56px floating button (bottom-right), 380×520px chat panel with smooth
    slide-up animation, purple gradient theme, "Powered by SPARK" footer. Vanilla JS, no frameworks.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Shadow DOM patterns (Section 6, Plugin System)" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 1.5 - polish requirements" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-lite.md" reason="UI/UX Specifications section" />
  </context>

  <steps>
    <step order="1">Create `/spark/widget/spark.js` entry point with self-initializing IIFE</step>
    <step order="2">Implement `createButton()`: 56px circle, bottom-right position (calc(100vw - 80px))</step>
    <step order="3">Add CSS: purple gradient background, subtle pulse animation (opacity 0.7→1.0, 2s infinite)</step>
    <step order="4">Implement `createPanel()`: 380×520px div, initially hidden</step>
    <step order="5">Add panel elements: close button (X), message container, input field, send button</step>
    <step order="6">Implement button click handler: toggle panel with CSS transition (transform: translateY, 300ms ease)</step>
    <step order="7">Add input placeholder: "What can I help you find?"</step>
    <step order="8">Create footer: `<a href="https://usespark.com" target="_blank">Powered by SPARK</a>`</step>
    <step order="9">Style message bubbles: user messages right-aligned, AI messages left-aligned</step>
  </steps>

  <verification>
    <check type="build">Test widget loads without errors in browser console</check>
    <check type="manual">Click button → panel opens in <300ms with smooth animation</check>
    <check type="manual">Verify button is 56px diameter circle positioned bottom-right</check>
    <check type="manual">Verify panel is 380×520px when open</check>
    <check type="manual">Check close button (X) works correctly</check>
    <check type="manual">Verify purple gradient theme applied</check>
    <check type="manual">Verify "Powered by SPARK" footer links to https://usespark.com</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(widget): add floating button and chat panel UI

- Implement 56px floating button with purple gradient
- Add 380×520px chat panel with smooth slide-up animation
- Include close button, message container, input, send button
- Add "Powered by SPARK" footer with link
- Vanilla JS, no framework dependencies

Implements REQ-001 through REQ-014 (decisions.md §1.4, §1.5)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-002" wave="1">
  <title>Chat Panel Interactions: Send, Clear, State</title>
  <requirement>REQ-066-075: Implement chat interactions and keyboard support</requirement>
  <description>
    Add chat interaction logic: send button click, Enter key submit, input clearing, optimistic UI
    (user message appears before API call), loading state during API wait.
  </description>

  <context>
    <file path="/spark/widget/spark.js" reason="Widget UI from task-001" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Chat Interface requirements" />
  </context>

  <steps>
    <step order="1">Implement `sendMessage()` function: validates input not empty (trim)</step>
    <step order="2">Add Enter key listener to input field: calls sendMessage() on keypress</step>
    <step order="3">Implement optimistic UI: append user message to chat immediately (before API call)</step>
    <step order="4">Clear input field after message send: input.value = ""</step>
    <step order="5">Add loading state: show typing indicator dots while awaiting response</step>
    <step order="6">Disable send button during API call to prevent duplicate sends</step>
    <step order="7">Persist widget state in memory: isOpen boolean for panel visibility</step>
  </steps>

  <verification>
    <check type="manual">Type message, click send → message appears immediately in chat</check>
    <check type="manual">Type message, press Enter → message sends</check>
    <check type="manual">Verify input clears after message send</check>
    <check type="manual">Try sending empty message → verify rejected</check>
    <check type="manual">Verify typing indicator shows during API call</check>
    <check type="manual">Verify send button disabled during API wait</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Requires widget UI components" />
  </dependencies>

  <commit-message>feat(widget): add chat interaction logic

- Implement send button click and Enter key submit
- Add optimistic UI: user message appears immediately
- Clear input after send, disable button during API call
- Add typing indicator for loading state
- Validate empty messages

Implements REQ-066 through REQ-075 (PRD §Chat Interface)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-003" wave="1">
  <title>Shadow DOM Setup + CSS Isolation</title>
  <requirement>REQ-059, REQ-063: Use Shadow DOM for CSS isolation from host site</requirement>
  <description>
    Wrap widget UI in Shadow DOM to prevent CSS conflicts with host site styles. Add CSS reset
    (all: initial), defensive styling, test on WordPress/Shopify/Wix for compatibility.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Shadow DOM isolation patterns (Section 6.6)" />
    <file path="/spark/widget/spark.js" reason="Widget UI to wrap in Shadow DOM" />
  </context>

  <steps>
    <step order="1">Create shadow host element: const host = document.createElement('div')</step>
    <step order="2">Attach Shadow DOM: const shadow = host.attachShadow({ mode: 'open' })</step>
    <step order="3">Move all widget UI elements into shadow root</step>
    <step order="4">Add CSS reset to shadow root: `:host { all: initial; }`</step>
    <step order="5">Inject widget styles inside shadow DOM (not global styles)</step>
    <step order="6">Test on WordPress site with aggressive global CSS (e.g., Divi theme)</step>
    <step order="7">Test on Shopify site (Dawn theme)</step>
    <step order="8">Add mobile responsiveness: full-width panel on <480px viewport</step>
  </steps>

  <verification>
    <check type="manual">Load widget on WordPress site → verify no style conflicts</check>
    <check type="manual">Load widget on Shopify site → verify no style conflicts</check>
    <check type="manual">Inspect Shadow DOM in DevTools → verify styles scoped</check>
    <check type="manual">Test on mobile (375px viewport) → panel full-width</check>
    <check type="manual">Verify touch targets ≥44px on mobile</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Requires widget UI structure" />
  </dependencies>

  <commit-message>feat(widget): add Shadow DOM isolation

- Wrap widget in Shadow DOM for CSS isolation
- Add CSS reset (all: initial) to prevent conflicts
- Test on WordPress, Shopify, Wix for compatibility
- Add mobile responsiveness: full-width <480px
- Ensure touch targets ≥44px on mobile

Implements REQ-059, REQ-063 (decisions.md §1.6, §5.1)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-004" wave="1">
  <title>Page Content Scraper (SPA-Aware)</title>
  <requirement>REQ-015 through REQ-021, REQ-064-065: Extract page content intelligently</requirement>
  <description>
    Scrape page content on widget load: extract document.title, meta[description], body text from
    <main>, <article>, or <body>. Handle SPAs with 1-second delay + MutationObserver. Truncate to ~10KB.
    Cache in widget memory.
  </description>

  <context>
    <file path="/spark/widget/spark.js" reason="Widget initialization" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 2.1 - scraping requirements, §5.1 SPA handling" />
  </context>

  <steps>
    <step order="1">Create `/spark/widget/utils/scraper.js` with `scrapePageContent()` function</step>
    <step order="2">Extract document.title and store in context object</step>
    <step order="3">Extract meta[description] content and store</step>
    <step order="4">Try extracting from <main>, fallback to <article>, fallback to <body></step>
    <step order="5">Use innerText (not innerHTML) to get visible text only</step>
    <step order="6">Truncate to 10KB: context.slice(0, 10240)</step>
    <step order="7">Add 1-second delay before scraping: setTimeout(scrape, 1000) for SPAs</step>
    <step order="8">Implement MutationObserver to detect DOM changes and re-scrape if needed</step>
    <step order="9">Cache scraped content in widget state: don't re-scrape per question</step>
  </steps>

  <verification>
    <check type="build">Import scraper in spark.js, verify no errors</check>
    <check type="manual">Load widget on static site → verify content extracted</check>
    <check type="manual">Load widget on React SPA → wait 1s → verify content extracted</check>
    <check type="manual">Test on large page (>50KB text) → verify truncated to 10KB</check>
    <check type="manual">Ask 3 questions → verify content not re-scraped (cached)</check>
    <check type="manual">Log scraped content → verify includes title, meta, body text</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(widget): add SPA-aware page content scraper

- Extract document.title, meta[description], body text
- Prioritize <main> > <article> > <body> for content
- Handle SPAs: 1-second delay + MutationObserver
- Truncate to 10KB, cache in widget memory
- Don't re-scrape per question (performance)

Implements REQ-015 through REQ-021, REQ-064-065 (decisions.md §2.1, §5.1)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-005" wave="1">
  <title>Cloudflare Worker Foundation</title>
  <requirement>REQ-022-026, REQ-045, REQ-060: Create Worker API endpoint with CORS</requirement>
  <description>
    Create Cloudflare Worker with POST /api/chat endpoint. Accept site_id, context, question in JSON.
    Validate UUID format. Return streaming response. Configure CORS for any origin.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/examples/bellas-bistro/wrangler.jsonc" reason="Wrangler config pattern" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Cloudflare Worker deployment (Section 5)" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 1.6 - tech stack, §4.2 CORS" />
  </context>

  <steps>
    <step order="1">Create `/spark/worker/index.js` Worker entry point</step>
    <step order="2">Implement POST /api/chat route handler</step>
    <step order="3">Parse request JSON: { site_id, context, question }</step>
    <step order="4">Validate site_id is valid UUID v4 format: regex /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i</step>
    <step order="5">Add CORS headers: Access-Control-Allow-Origin: *, Allow-Methods: POST, OPTIONS</step>
    <step order="6">Handle OPTIONS preflight requests</step>
    <step order="7">Return 400 Bad Request if site_id, context, or question missing</step>
    <step order="8">Create wrangler.jsonc config with nodejs_compat flag</step>
  </steps>

  <verification>
    <check type="build">wrangler dev → Worker starts locally</check>
    <check type="manual">POST to localhost:8787/api/chat with valid JSON → 200 response</check>
    <check type="manual">POST with missing site_id → 400 error</check>
    <check type="manual">POST with invalid UUID → 400 error</check>
    <check type="manual">OPTIONS request → verify CORS headers present</check>
    <check type="manual">POST from different origin → verify CORS allows request</check>
  </verification>

  <dependencies>
    <!-- No dependencies - Wave 1 foundation -->
  </dependencies>

  <commit-message>feat(worker): add Cloudflare Worker foundation

- Create POST /api/chat endpoint
- Accept site_id, context, question in JSON
- Validate UUID v4 format for site_id
- Configure CORS for any origin (Access-Control-Allow-Origin: *)
- Handle OPTIONS preflight requests

Implements REQ-022 through REQ-026, REQ-045 (decisions.md §1.6, §4.2)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

### Wave 2 (Parallel — Depends on Wave 1)

<task-plan id="phase-1-task-006" wave="2">
  <title>Claude API Integration</title>
  <requirement>REQ-027: Integrate Claude 3.5 Haiku via Anthropic API</requirement>
  <description>
    Call Claude API from Worker. Use model: claude-3-5-haiku-20241022. Include ANTHROPIC_API_KEY from
    environment. Stream response back to widget.
  </description>

  <context>
    <file path="/spark/worker/index.js" reason="Worker foundation from task-005" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 1.6 - Claude Haiku decision" />
  </context>

  <steps>
    <step order="1">Create `/spark/worker/claude.js` with `callClaude()` function</step>
    <step order="2">Install @anthropic-ai/sdk dependency</step>
    <step order="3">Initialize Anthropic client with API key from env.ANTHROPIC_API_KEY</step>
    <step order="4">Call messages API with model: "claude-3-5-haiku-20241022"</step>
    <step order="5">Set stream: true for streaming responses</step>
    <step order="6">Add error handling: catch API errors, return 500 with user-friendly message</step>
    <step order="7">Add timeout: 30-second max wait, return 408 Timeout if exceeded</step>
  </steps>

  <verification>
    <check type="build">npm install @anthropic-ai/sdk</check>
    <check type="manual">Call Claude API with test prompt → verify response received</check>
    <check type="manual">Verify model is claude-3-5-haiku-20241022</check>
    <check type="manual">Test with missing API key → verify error handled gracefully</check>
    <check type="manual">Test with 35-second wait → verify timeout at 30s</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-005" reason="Requires Worker foundation" />
  </dependencies>

  <commit-message>feat(worker): add Claude API integration

- Integrate Anthropic SDK for Claude 3.5 Haiku
- Configure streaming responses
- Add error handling for API failures
- Add 30-second timeout protection
- Read API key from environment variable

Implements REQ-027 (decisions.md §1.6)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-007" wave="2">
  <title>System Prompt Engineering</title>
  <requirement>REQ-034 through REQ-039: Create system prompt that prevents hallucination</requirement>
  <description>
    Design system prompt that instructs Claude to answer ONLY from page context. Include strict
    instructions: never make up info, never discuss unrelated topics, say "I don't see that information"
    when unknown. Test on 20+ sites for accuracy.
  </description>

  <context>
    <file path="/spark/worker/claude.js" reason="Claude integration from task-006" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-lite.md" reason="System Prompt section" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 2.1 - accuracy requirements" />
  </context>

  <steps>
    <step order="1">Create system prompt template in `/spark/worker/prompt.js`</step>
    <step order="2">Include instruction: "You are a helpful assistant for this website. Answer questions based ONLY on the page content provided."</step>
    <step order="3">Add fallback instruction: "If you don't know the answer from the provided content, say: 'I don't see that information on this page. You might want to contact the site owner directly.'"</step>
    <step order="4">Add constraint: "Never make up information. Never discuss topics unrelated to the page content."</step>
    <step order="5">Format: System prompt, then PAGE CONTENT: {scraped_content}, then User: {question}</step>
    <step order="6">Test on 20 different websites with known content + out-of-scope questions</step>
    <step order="7">Measure hallucination rate: should be <5%</step>
  </steps>

  <verification>
    <check type="manual">Test: "What are your hours?" on page with hours → correct answer</check>
    <check type="manual">Test: "What are your hours?" on page without hours → "I don't see that information"</check>
    <check type="manual">Test: "Who won the 2024 election?" (unrelated) → refuses to answer</check>
    <check type="manual">Run 100 test questions → hallucination rate <5%</check>
    <check type="manual">Verify responses cite page content, not external knowledge</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-006" reason="Requires Claude API integration" />
  </dependencies>

  <commit-message>feat(worker): add system prompt engineering

- Create strict system prompt for accuracy
- Instruct Claude to answer ONLY from page context
- Add "I don't see that information" fallback
- Prevent hallucination and off-topic responses
- Test on 20+ sites, <5% hallucination rate

Implements REQ-034 through REQ-039 (PRD §System Prompt)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-008" wave="2">
  <title>Multi-Layer Rate Limiting</title>
  <requirement>REQ-031-033: Implement 10 req/min per site_id + 100 req/hour per IP</requirement>
  <description>
    Add dual-layer rate limiting: (1) per site_id limit using in-memory map, (2) per IP limit using
    Cloudflare native rate limiting. Return 429 Too Many Requests when exceeded.
  </description>

  <context>
    <file path="/spark/worker/index.js" reason="Worker entry point from task-005" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 1.4, §2.1 - rate limit requirements" />
  </context>

  <steps>
    <step order="1">Create `/spark/worker/ratelimit.js` with rate limit logic</step>
    <step order="2">Implement in-memory map: { site_id: { count, resetAt } }</step>
    <step order="3">Check site_id limit: if count >= 10 in current minute, return 429</step>
    <step order="4">Reset count every minute using timestamp comparison</step>
    <step order="5">Extract client IP from request headers: request.headers.get('CF-Connecting-IP')</step>
    <step order="6">Add Cloudflare rate limiting: use wrangler.jsonc rate_limiting config for 100 req/hour per IP</step>
    <step order="7">Return 429 status with Retry-After header: seconds until reset</step>
    <step order="8">Test: send 11 requests from same site_id → 11th returns 429</step>
  </steps>

  <verification>
    <check type="manual">Send 10 requests with same site_id → all succeed</check>
    <check type="manual">Send 11th request → 429 Too Many Requests</check>
    <check type="manual">Wait 61 seconds → verify rate limit resets</check>
    <check type="manual">Send 101 requests from same IP → verify Cloudflare blocks</check>
    <check type="manual">Verify Retry-After header present in 429 response</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-005" reason="Requires Worker foundation" />
  </dependencies>

  <commit-message>feat(worker): add multi-layer rate limiting

- Implement 10 req/min per site_id limit (in-memory)
- Add 100 req/hour per IP limit (Cloudflare native)
- Return 429 Too Many Requests with Retry-After header
- Reset limits every minute for site_id
- Extract client IP from CF-Connecting-IP header

Implements REQ-031 through REQ-033 (decisions.md §1.4, §2.1)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-009" wave="2">
  <title>Streaming Response Handler</title>
  <requirement>REQ-028-030: Stream Claude responses via SSE to widget</requirement>
  <description>
    Stream Claude API response chunks to widget via Server-Sent Events. Format: data: {"chunk": "text"}.
    Send done flag on completion: data: {"done": true}.
  </description>

  <context>
    <file path="/spark/worker/claude.js" reason="Claude API from task-006" />
    <file path="/spark/widget/spark.js" reason="Widget needs to receive and render chunks" />
    <file path="/home/agent/shipyard-ai/prds/localgenius-lite.md" reason="API Design - streaming format" />
  </context>

  <steps>
    <step order="1">Configure Claude API for streaming: stream: true</step>
    <step order="2">Create ReadableStream in Worker to pipe Claude chunks</step>
    <step order="3">Format each chunk as SSE: `data: ${JSON.stringify({ chunk: text })}\n\n`</step>
    <step order="4">Send done event when stream completes: `data: ${JSON.stringify({ done: true })}\n\n`</step>
    <step order="5">Set Worker response headers: Content-Type: text/event-stream, Cache-Control: no-cache</step>
    <step order="6">In widget, create EventSource or fetch with reader to consume stream</step>
    <step order="7">Append each chunk to AI message bubble as it arrives</step>
    <step order="8">Hide typing indicator when done: true received</step>
  </steps>

  <verification>
    <check type="manual">Ask question → verify response streams chunk by chunk</check>
    <check type="manual">Verify first chunk appears in <2 seconds</check>
    <check type="manual">Verify typing indicator shows until done: true</check>
    <check type="manual">Check browser DevTools Network → verify SSE format correct</check>
    <check type="manual">Test on slow network → verify streaming still works</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-006" reason="Requires Claude API integration" />
    <depends-on task-id="phase-1-task-002" reason="Requires widget chat interactions" />
  </dependencies>

  <commit-message>feat(worker): add streaming response handler

- Stream Claude API responses via Server-Sent Events
- Format chunks as: data: {"chunk": "text"}
- Send done flag on completion: data: {"done": true}
- Configure Worker for SSE: Content-Type, Cache-Control
- Widget consumes stream and renders chunks in real-time

Implements REQ-028 through REQ-030 (PRD §API Design)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-010" wave="2">
  <title>Error Handling + Timeouts</title>
  <requirement>REQ-043-044, REQ-080: Handle API errors, timeouts gracefully</requirement>
  <description>
    Add comprehensive error handling: Claude API failures, network timeouts, rate limit errors.
    Show user-friendly messages (not stack traces). Add retry button for recoverable errors.
  </description>

  <context>
    <file path="/spark/worker/index.js" reason="Worker error handling" />
    <file path="/spark/widget/spark.js" reason="Widget error display" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 4.3 - error UX" />
  </context>

  <steps>
    <step order="1">Create `/spark/worker/errors.js` with error handling utilities</step>
    <step order="2">Add try-catch around Claude API calls</step>
    <step order="3">Map errors to user-friendly messages: "Sorry, I couldn't answer that. Try again?"</step>
    <step order="4">Handle specific errors: 429 → "I'm getting too many questions right now", 500 → "Something went wrong"</step>
    <step order="5">Add 30-second timeout: if Claude doesn't respond, return timeout error</step>
    <step order="6">In widget, display error message in chat (not console)</step>
    <step order="7">Add retry button to error messages</step>
    <step order="8">Log errors to console.error for debugging (not shown to user)</step>
  </steps>

  <verification>
    <check type="manual">Simulate Claude API error → verify user-friendly message shown</check>
    <check type="manual">Simulate 30-second timeout → verify "Try again" message</check>
    <check type="manual">Trigger 429 rate limit → verify correct error message</check>
    <check type="manual">Verify no stack traces shown to user</check>
    <check type="manual">Click retry button → verify message re-sends</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-006" reason="Requires Claude API integration" />
    <depends-on task-id="phase-1-task-008" reason="Handles rate limit errors" />
  </dependencies>

  <commit-message">feat(worker): add error handling and timeouts

- Add user-friendly error messages (no stack traces)
- Handle Claude API failures gracefully
- Add 30-second timeout with retry button
- Map 429, 500 errors to helpful messages
- Log errors to console for debugging

Implements REQ-043-044, REQ-080 (decisions.md §4.3)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-011" wave="2">
  <title>Usage Logging (Cloudflare Analytics)</title>
  <requirement>REQ-078: Log usage metrics to Cloudflare Analytics</requirement>
  <description>
    Track metrics: total questions, error rates, unique site_ids, response latency. Use Cloudflare
    Analytics (free tier) for monitoring. Enables post-launch iteration.
  </description>

  <context>
    <file path="/spark/worker/index.js" reason="Worker request handler" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 4.1 Q4 - logging requirements" />
  </context>

  <steps>
    <step order="1">Create `/spark/worker/analytics.js` with logging functions</step>
    <step order="2">Log each request: site_id, question length, response time, error status</step>
    <step order="3">Use console.log for structured JSON logging (Cloudflare captures this)</step>
    <step order="4">Track metrics: { event: "question", site_id, latency_ms, error: null }</step>
    <step order="5">Track errors: { event: "error", site_id, error_type, error_message }</step>
    <step order="6">Track rate limits: { event: "rate_limited", site_id, limit_type }</step>
    <step order="7">Add latency tracking: Date.now() before/after Claude call</step>
    <step order="8">Verify logs appear in Cloudflare dashboard</step>
  </steps>

  <verification>
    <check type="manual">Send test question → verify logged in Cloudflare dashboard</check>
    <check type="manual">Check log includes: site_id, latency, error status</check>
    <check type="manual">Trigger error → verify error logged with type</check>
    <check type="manual">Trigger rate limit → verify rate_limited event logged</check>
    <check type="manual">Verify unique site_ids count in dashboard</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-005" reason="Requires Worker foundation" />
  </dependencies>

  <commit-message>feat(worker): add usage logging to Cloudflare Analytics

- Log all requests with site_id, latency, error status
- Track errors with type and message
- Track rate limit events
- Use structured JSON logging for Cloudflare capture
- Enable post-launch metrics analysis

Implements REQ-078 (decisions.md §4.1 Q4)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

### Wave 3 (Parallel — Depends on Wave 2)

<task-plan id="phase-1-task-012" wave="3">
  <title>Landing Page (Steve's Vision)</title>
  <requirement>REQ-046-052: Create Apple-level simple landing page</requirement>
  <description>
    Build landing page with Steve's design: "Your website, instantly brilliant." Hero text, one script
    tag in code block, one demo, one CTA button ("Try It Now"). No feature lists. Minimal, beautiful.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 1.7 - landing page requirements (Steve's vision)" />
  </context>

  <steps>
    <step order="1">Create `/spark/landing/index.html` landing page</step>
    <step order="2">Add hero section: <h1>Your website, instantly brilliant.</h1></step>
    <step order="3">Add subheading: "One script tag. Zero configuration."</step>
    <step order="4">Add code block with copy-paste ready script tag: <script src="https://cdn.usespark.com/spark.js"></script></step>
    <step order="5">Add live demo section: working widget embedded on same page</step>
    <step order="6">Add single CTA button: "Try It Now" → scrolls to code block</step>
    <step order="7">Add footer with "Powered by SPARK" attribution</step>
    <step order="8">Style: Clean, Apple-inspired, purple gradient accents, generous whitespace</step>
    <step order="9">No feature lists, no pricing grids, no detailed docs (keep simple)</step>
  </steps>

  <verification>
    <check type="manual">Open landing page → verify hero text "Your website, instantly brilliant."</check>
    <check type="manual">Verify code block has copy-paste ready script tag</check>
    <check type="manual">Verify live demo works (widget opens, responds)</check>
    <check type="manual">Click "Try It Now" → scrolls to code block</check>
    <check type="manual">Verify design is clean, minimal, Apple-inspired</check>
    <check type="manual">Verify no feature lists or complexity</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Requires widget for live demo" />
    <depends-on task-id="phase-1-task-009" reason="Widget must work for demo" />
  </dependencies>

  <commit-message>feat(landing): create Apple-inspired landing page

- Add hero: "Your website, instantly brilliant."
- Include copy-paste script tag in code block
- Add working live demo of widget
- Single CTA: "Try It Now"
- Clean, minimal design with purple gradient
- No feature lists or complexity (Steve's vision)

Implements REQ-046 through REQ-052 (decisions.md §1.7)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-013" wave="3">
  <title>Live Demo Embed on Landing</title>
  <requirement>REQ-049: Embed working widget on landing page for demo</requirement>
  <description>
    Embed SPARK widget on landing page itself to serve as interactive demo. Pre-load with sample
    page content (landing page content) so visitors can test immediately.
  </description>

  <context>
    <file path="/spark/landing/index.html" reason="Landing page from task-012" />
    <file path="/spark/widget/spark.js" reason="Widget to embed" />
  </context>

  <steps>
    <step order="1">Add widget script tag to landing page: <script src="../widget/spark.js"></script></step>
    <step order="2">Widget scrapes landing page content automatically</step>
    <step order="3">Test question: "What is SPARK?" → should answer from landing page content</step>
    <step order="4">Add note above demo: "Try asking: 'What is SPARK?' or 'How does it work?'"</step>
    <step order="5">Verify widget appears and works on landing page</step>
  </steps>

  <verification>
    <check type="manual">Open landing page → widget button appears</check>
    <check type="manual">Click widget → panel opens</check>
    <check type="manual">Ask "What is SPARK?" → correct answer from landing content</check>
    <check type="manual">Verify demo works smoothly (no errors)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-012" reason="Requires landing page" />
    <depends-on task-id="phase-1-task-009" reason="Requires working streaming" />
  </dependencies>

  <commit-message>feat(landing): add live demo embed

- Embed SPARK widget on landing page
- Widget scrapes landing page content for demo
- Add suggested questions for testing
- Interactive demo shows widget in action

Implements REQ-049 (decisions.md §1.7)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-014" wave="3">
  <title>CDN Deployment (Widget Script)</title>
  <requirement>REQ-053: Deploy widget script to CDN at https://cdn.usespark.com/spark.js</requirement>
  <description>
    Bundle widget JavaScript, minify, gzip. Deploy to Cloudflare CDN (or similar). Configure caching,
    versioning. Ensure <10KB gzipped size. Provide stable URL for embedding.
  </description>

  <context>
    <file path="/spark/widget/spark.js" reason="Widget to deploy" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 4.2 Q8 - CDN URL" />
  </context>

  <steps>
    <step order="1">Install bundler: esbuild or rollup for minification</step>
    <step order="2">Bundle spark.js + dependencies into single file</step>
    <step order="3">Minify JavaScript: remove whitespace, shorten variable names</step>
    <step order="4">Gzip bundle: verify ≤10KB compressed</step>
    <step order="5">Deploy to Cloudflare R2 or Pages with public URL</step>
    <step order="6">Configure CDN caching: Cache-Control: public, max-age=3600 (1 hour)</step>
    <step order="7">Set up versioning: /v1/spark.js for future updates</step>
    <step order="8">Test: curl https://cdn.usespark.com/spark.js → returns bundled script</step>
  </steps>

  <verification>
    <check type="build">npm run build → creates bundled spark.js</check>
    <check type="manual">Check bundle size: ls -lh spark.min.js.gz → verify ≤10KB</check>
    <check type="manual">curl https://cdn.usespark.com/spark.js → returns script</check>
    <check type="manual">Embed script in test page → widget loads and works</check>
    <check type="manual">Check CDN caching headers in browser DevTools</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-001" reason="Requires complete widget code" />
    <depends-on task-id="phase-1-task-004" reason="Includes scraper in bundle" />
  </dependencies>

  <commit-message>feat(deploy): deploy widget to CDN

- Bundle, minify, gzip widget JavaScript
- Deploy to Cloudflare CDN at cdn.usespark.com/spark.js
- Configure caching and versioning
- Verify ≤10KB gzipped size
- Provide stable public URL for embedding

Implements REQ-053, REQ-057 (decisions.md §4.2)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

<task-plan id="phase-1-task-015" wave="3">
  <title>Cloudflare Worker Deployment</title>
  <requirement>REQ-069-070: Deploy Worker with wrangler, configure Claude API key</requirement>
  <description>
    Deploy Cloudflare Worker to production. Configure environment variables (ANTHROPIC_API_KEY).
    Set up wrangler.jsonc with correct settings. Test production deployment.
  </description>

  <context>
    <file path="/spark/worker/wrangler.jsonc" reason="Worker config" />
    <file path="/home/agent/shipyard-ai/examples/bellas-bistro/wrangler.jsonc" reason="Config pattern reference" />
    <file path="/home/agent/shipyard-ai/rounds/localgenius-lite/decisions.md" reason="Section 3 - deployment" />
  </context>

  <steps>
    <step order="1">Create wrangler.jsonc with name: "spark-api"</step>
    <step order="2">Set compatibility_date: "2026-04-19"</step>
    <step order="3">Add compatibility_flags: ["nodejs_compat"]</step>
    <step order="4">Configure secrets: wrangler secret put ANTHROPIC_API_KEY</step>
    <step order="5">Test locally: wrangler dev → verify Worker starts</step>
    <step order="6">Deploy to production: wrangler deploy</step>
    <step order="7">Verify production URL: https://spark-api.<subdomain>.workers.dev/api/chat</step>
    <step order="8">Test production: POST to Worker URL with valid request → verify response</step>
  </steps>

  <verification>
    <check type="build">wrangler deploy → successful deployment</check>
    <check type="manual">POST to production Worker URL → 200 response with Claude answer</check>
    <check type="manual">Verify ANTHROPIC_API_KEY secret configured</check>
    <check type="manual">Check Cloudflare dashboard → Worker deployed and running</check>
    <check type="manual">Test from widget → end-to-end flow works</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-005" reason="Requires Worker code" />
    <depends-on task-id="phase-1-task-006" reason="Requires Claude integration" />
    <depends-on task-id="phase-1-task-008" reason="Includes rate limiting" />
  </dependencies>

  <commit-message>feat(deploy): deploy Cloudflare Worker to production

- Configure wrangler.jsonc with nodejs_compat
- Set up ANTHROPIC_API_KEY secret
- Deploy to Cloudflare Workers
- Test production endpoint
- End-to-end flow operational

Implements REQ-069-070 (decisions.md §3)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Mitigation Plan

### High-Priority Risks (from Risk Scanner Report)

**TR-001: Shadow DOM CSS Conflicts**
- **Mitigation Tasks:** task-003 (Shadow DOM setup + testing)
- **Testing:** WordPress (Astra, Divi), Shopify (Dawn), Wix
- **Fallback:** Use `all: initial` + `!important` selectively

**TR-002: SPA Content Scraping Failures**
- **Mitigation Tasks:** task-004 (1-second delay + MutationObserver)
- **Testing:** React, Vue, Angular SPAs (20+ sites)
- **Impact:** 30-40% of target market

**TR-003: Claude API Hallucination**
- **Mitigation Tasks:** task-007 (strict system prompt)
- **Testing:** 100+ test questions, <5% hallucination rate
- **Monitoring:** Post-launch accuracy tracking

**TR-007: CORS Misconfiguration**
- **Mitigation Tasks:** task-005 (CORS headers)
- **Testing:** 3+ different domains, browser DevTools check
- **Impact:** Complete blocker if misconfigured

**TR-008: Rate Limiting Bypass**
- **Mitigation Tasks:** task-008 (multi-layer rate limiting)
- **Testing:** Attack simulation (UUID spoofing)
- **Monitoring:** Cost alerts in Claude API dashboard

---

## Success Metrics Validation

At launch, validate:

| Metric | Target | Validation Method |
|--------|--------|-------------------|
| **First Token Latency** | <2 seconds (p95) | task-011 logging |
| **Widget Size** | <10KB gzipped | task-014 bundle check |
| **Cost per Question** | <$0.001 | Claude API pricing validation |
| **Uptime** | 99%+ | Cloudflare SLA |
| **Error Rate** | <2% | task-011 analytics |
| **Launch Week: Sites Embedded** | 10+ | Manual tracking |
| **Launch Week: Questions Answered** | 100+ | task-011 analytics |

---

## Pre-Launch Checklist

- [ ] All Wave 1 tasks complete (widget UI, scraper, worker foundation)
- [ ] All Wave 2 tasks complete (Claude, rate limiting, streaming, errors)
- [ ] All Wave 3 tasks complete (landing page, deployments)
- [ ] Widget tested on 5+ CMS platforms (WordPress, Shopify, Wix, Squarespace, Webflow)
- [ ] SPA testing complete (10+ React/Vue/Angular sites)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] CORS verified from 3+ different domains
- [ ] Rate limiting tested (site_id + IP limits)
- [ ] System prompt accuracy tested (100+ questions)
- [ ] Error handling tested (timeouts, API failures, rate limits)
- [ ] Widget bundle ≤10KB gzipped
- [ ] First token latency <2s (p95)
- [ ] Cloudflare Analytics operational
- [ ] Landing page live and demo working
- [ ] CDN deployed and serving widget
- [ ] Worker deployed with API key configured
- [ ] Steve approves landing page copy and design
- [ ] Elon approves technical architecture and performance

---

*Phase 1 Plan complete. Ready for parallel wave execution. Estimated 4-6 hours to ship V1.*
