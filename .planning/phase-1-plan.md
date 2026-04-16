# Phase 1 Plan — Shipyard Self-Serve Intake

**Generated:** 2026-04-16
**Project Slug:** `shipyard-self-serve-intake`
**Requirements:** `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks:** 20
**Waves:** 4
**Estimated Time:** 3-4 days (aggressive Friday ship date)

---

## Executive Summary

Build a zero-click GitHub issue → PRD automation system. When users open GitHub issues with the `intake-request` label, the system automatically:
1. Receives webhook
2. Analyzes content for priority (p0/p1/p2)
3. Generates structured PRD
4. Posts bot comment with PRD link
5. Stores everything in Postgres

**Core Philosophy:** Invisible power. Open issue, make coffee, PR appears. No forms, no bureaucracy.

**Tech Stack:** Postgres + GitHub API only (Decision 4)

---

## Requirements Traceability

| Requirement | Task(s) | Wave | Priority |
|-------------|---------|------|----------|
| REQ-INFRA-001: Webhook Listener | task-1, task-2 | 1 | Must-Have |
| REQ-INFRA-002: Postgres Schema | task-3 | 1 | Must-Have |
| REQ-INFRA-003: GitHub API Auth | task-4 | 1 | Must-Have |
| REQ-INFRA-004: Event Parser | task-5 | 2 | Must-Have |
| REQ-INFRA-005: Error Logging | task-6 | 2 | Must-Have |
| REQ-ANALYSIS-001: Priority Detection | task-7, task-8 | 2 | Must-Have |
| REQ-ANALYSIS-002: Content Extraction | task-9 | 2 | Must-Have |
| REQ-ANALYSIS-004: Type Classification | task-10 | 2 | Must-Have |
| REQ-PRD-001, 002, 003: PRD Generation | task-11, task-12 | 3 | Must-Have |
| REQ-PRD-004: PRD Failure Handling | task-13 | 3 | Must-Have |
| REQ-BOT-001-006: Bot Integration | task-14, task-15 | 3 | Must-Have |
| REQ-DASHBOARD-001-004: Dashboard | task-16, task-17 | 4 | Must-Have |
| REQ-ERROR-001-004: Error Handling | task-6, task-13 | 2-3 | Must-Have |
| REQ-TEST-001-005: Testing | task-18, task-19, task-20 | 4 | Must-Have |

---

## Critical Path & Risk Mitigation

### High-Priority Risks Addressed

1. **RISK-002: Webhook Delivery & Race Conditions** → task-3 includes UNIQUE constraint + idempotency
2. **RISK-003: Missing Webhook Signature Validation** → task-2 implements HMAC-SHA256 validation
3. **RISK-005: Content Analysis Over-Confidence** → task-8 includes confidence threshold (>0.7)
4. **RISK-010: No Observability** → task-6 implements structured logging from day 1

### Technical Dependencies from Codebase Scout

- **Existing Webhook Pattern**: `/deliverables/shipyard-client-portal/app/api/webhooks/` (Stripe, Pipeline)
- **Supabase Client**: `/deliverables/shipyard-client-portal/lib/supabase/server.ts` (reuse pattern)
- **PRD Worker**: `/workers/prd-chat/` (call `/parse` endpoint)
- **Email System**: `/deliverables/shipyard-client-portal/lib/email/` (optional for notifications)

---

## Wave Execution Order

### Wave 1 (Parallel - Infrastructure Foundation)
**Estimated Time:** 4-6 hours

Independent infrastructure tasks that lay the groundwork:

- **task-1**: Create webhook endpoint scaffold ✅
- **task-2**: Implement webhook signature validation ✅
- **task-3**: Create Postgres `intake_requests` schema ✅
- **task-4**: Configure GitHub API client & rate limiting ✅

**Output:** Secure webhook endpoint, database ready, GitHub API configured

---

### Wave 2 (Parallel - Core Analysis Logic)
**Estimated Time:** 6-8 hours
**Dependencies:** Wave 1 complete

Core business logic for analyzing GitHub issues:

- **task-5**: Build event parser & validator ✅
- **task-6**: Implement structured logging & observability ✅
- **task-7**: Build priority detection engine (keyword matching) ✅
- **task-8**: Implement confidence scoring (>0.7 threshold) ✅
- **task-9**: Build content extraction (title, description, raw_content) ✅
- **task-10**: Build type classification (BUG_FIX, FEATURE, ENHANCEMENT, DOCUMENTATION) ✅

**Output:** Content analyzer that can classify issues with confidence scores

---

### Wave 3 (Sequential - PRD Generation & Bot Response)
**Estimated Time:** 8-10 hours
**Dependencies:** Wave 2 complete

Critical path for PRD creation and user feedback:

- **task-11**: Build PRD generator (template + storage) ✅
- **task-12**: Integrate PRD Chat Worker (`/workers/prd-chat/parse` endpoint) ✅
- **task-13**: Implement PRD failure handling (graceful degradation) ✅
- **task-14**: Build bot comment templates (success & error cases) ✅
- **task-15**: Implement bot posting logic with rate limiting ✅

**Output:** End-to-end flow: webhook → analysis → PRD → bot comment

---

### Wave 4 (Parallel - Dashboard & Testing)
**Estimated Time:** 6-8 hours
**Dependencies:** Wave 3 complete

Polish and quality assurance:

- **task-16**: Build read-only dashboard (list view + filters) ✅
- **task-17**: Build PRD detail view (dashboard drill-down) ✅
- **task-18**: Unit tests (webhook, analyzer, PRD, bot) ✅
- **task-19**: Integration test (issue → PRD → comment e2e) ✅
- **task-20**: Error scenario tests (rate limits, DB failures, etc.) ✅

**Output:** Production-ready system with tests and dashboard

---

## Task Plans

<task-plan id="phase-1-task-1" wave="1">
  <title>Create Webhook Endpoint Scaffold</title>
  <requirement>REQ-INFRA-001: GitHub Webhook Listener Setup</requirement>
  <description>
    Create the foundational webhook endpoint that receives GitHub issue events. This follows the Next.js API Route pattern found in the shipyard-client-portal codebase.

    **Technical Context:** Per codebase scout findings, existing webhook patterns in `/deliverables/shipyard-client-portal/app/api/webhooks/` demonstrate the proper structure: signature verification → payload parsing → async processing → immediate response.

    **Location:** Create new route at `/app/api/intake/webhook/github/route.ts`

    **Why This Matters:** This is the entry point for the entire system. Without a reliable webhook endpoint, no issues can be processed. Must respond to GitHub within 5 seconds to avoid timeouts.
  </description>

  <context>
    <file path="/deliverables/shipyard-client-portal/app/api/webhooks/stripe/route.ts" reason="Example webhook pattern with signature verification" />
    <file path="/deliverables/shipyard-client-portal/app/api/webhooks/pipeline/route.ts" reason="Custom webhook implementation pattern" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Section II.1 - Webhook Listener requirements" />
  </context>

  <steps>
    <step order="1">Create directory structure: mkdir -p app/api/intake/webhook/github</step>
    <step order="2">Create route.ts with POST handler: export async function POST(request: Request)</step>
    <step order="3">Add basic request logging: log webhook receipt with timestamp</step>
    <step order="4">Extract GitHub webhook headers: X-GitHub-Event, X-Hub-Signature-256, X-GitHub-Delivery</step>
    <step order="5">Add label filtering: only process issues with 'intake-request' label</step>
    <step order="6">Return 200 OK immediately (async processing happens after response)</step>
    <step order="7">Add error handling: catch all errors, log, never crash</step>
  </steps>

  <verification>
    <check type="manual">Endpoint responds 200 OK to test POST request</check>
    <check type="manual">Logs show webhook receipt with correct headers</check>
    <check type="manual">Invalid requests (missing headers) logged but don't crash</check>
  </verification>

  <dependencies>
    <!-- No dependencies - foundation task -->
  </dependencies>

  <commit-message>feat(intake): create webhook endpoint scaffold

- Add POST /api/intake/webhook/github route
- Extract GitHub webhook headers
- Implement label filtering (intake-request only)
- Add structured logging for webhook receipt
- Ensure 5-second response time requirement

Refs: REQ-INFRA-001, Decision 1 (GitHub as interface)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Implement Webhook Signature Validation</title>
  <requirement>REQ-INFRA-001: Webhook Listener Setup (HMAC validation)</requirement>
  <description>
    Add HMAC-SHA256 signature validation to prevent forged webhook requests. This is a critical security requirement per RISK-003 in the risk assessment.

    **Security Context:** GitHub sends X-Hub-Signature-256 header with each webhook. Must compute HMAC-SHA256(secret, request_body) and compare using timing-safe string comparison to prevent timing attacks.

    **Why This Matters:** Without this, anyone who discovers the webhook URL can send forged requests, creating fake intake records and spamming bot comments. This is a HIGH impact security vulnerability.
  </description>

  <context>
    <file path="/app/api/intake/webhook/github/route.ts" reason="Webhook endpoint created in task-1" />
    <file path="/deliverables/shipyard-client-portal/app/api/webhooks/pipeline/route.ts" reason="Example custom secret validation (lines 19-25)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Decision 7 (fail gracefully, validate all inputs)" />
  </context>

  <steps>
    <step order="1">Add environment variable: GITHUB_WEBHOOK_SECRET</step>
    <step order="2">Extract X-Hub-Signature-256 header from request</step>
    <step order="3">Read raw request body (needed for HMAC computation)</step>
    <step order="4">Compute HMAC: crypto.createHmac('sha256', secret).update(body).digest('hex')</step>
    <step order="5">Compare signatures using crypto.timingSafeEqual() to prevent timing attacks</step>
    <step order="6">If validation fails: log attempt, return 401 Unauthorized, do NOT process</step>
    <step order="7">If validation succeeds: continue to payload processing</step>
  </steps>

  <verification>
    <check type="manual">Valid signature accepted (200 OK response)</check>
    <check type="manual">Invalid signature rejected (401 response, not processed)</check>
    <check type="manual">Missing signature header rejected (401 response)</check>
    <check type="manual">Security logs show rejected attempts</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires webhook endpoint to exist" />
  </dependencies>

  <commit-message>feat(intake): add webhook signature validation

- Implement HMAC-SHA256 signature verification
- Use crypto.timingSafeEqual() for timing-attack prevention
- Reject invalid signatures with 401 Unauthorized
- Log unauthorized attempts for security monitoring
- Add GITHUB_WEBHOOK_SECRET environment variable

Refs: REQ-INFRA-001, RISK-003 (security vulnerability mitigation)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Create Postgres intake_requests Schema</title>
  <requirement>REQ-INFRA-002: Postgres Database Schema</requirement>
  <description>
    Create the single `intake_requests` table that stores all intake data. This includes proper indexing for performance and constraints for data integrity.

    **Schema Design:** Based on decisions.md Section III (database schema) with critical additions from risk assessment: UNIQUE constraint on (github_issue_id, repo_name) to prevent duplicates (RISK-002).

    **Why This Matters:** This is the source of truth for all intake requests. Proper indexing ensures dashboard queries are fast. Constraints prevent data integrity issues.
  </description>

  <context>
    <file path="/deliverables/shipyard-client-portal/database/migrations/" reason="Example Supabase migration patterns" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Section III - Complete schema definition (lines 221-259)" />
    <file path="/deliverables/shipyard-client-portal/lib/supabase/server.ts" reason="Supabase client pattern to reuse" />
  </context>

  <steps>
    <step order="1">Create migration file: database/migrations/YYYYMMDD_create_intake_requests.sql</step>
    <step order="2">Define table with UUID primary key: id UUID PRIMARY KEY DEFAULT gen_random_uuid()</step>
    <step order="3">Add GitHub fields: github_issue_id INTEGER NOT NULL, github_issue_url TEXT NOT NULL, repo_name TEXT NOT NULL</step>
    <step order="4">Add content fields: title TEXT NOT NULL, description TEXT, raw_content TEXT NOT NULL</step>
    <step order="5">Add classification fields: priority TEXT CHECK (priority IN ('p0', 'p1', 'p2')), detected_type TEXT, confidence_score DECIMAL(3,2)</step>
    <step order="6">Add PRD fields: prd_content JSONB, prd_url TEXT</step>
    <step order="7">Add metadata: requested_by TEXT NOT NULL, status TEXT DEFAULT 'pending', created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()</step>
    <step order="8">Add tracking: bot_comment_url TEXT, error_log JSONB</step>
    <step order="9">Create UNIQUE constraint: UNIQUE(github_issue_id, repo_name) -- prevents duplicate processing</step>
    <step order="10">Create indexes: CREATE INDEX idx_github_issue ON intake_requests(github_issue_id); CREATE INDEX idx_status ON intake_requests(status); CREATE INDEX idx_priority ON intake_requests(priority); CREATE INDEX idx_created_at ON intake_requests(created_at DESC)</step>
    <step order="11">Run migration: npx supabase db push OR psql -f migration.sql</step>
  </steps>

  <verification>
    <check type="manual">Table created: SELECT * FROM intake_requests LIMIT 1</check>
    <check type="manual">UNIQUE constraint works: duplicate github_issue_id + repo_name insertion fails</check>
    <check type="manual">CHECK constraint works: invalid priority value rejected</check>
    <check type="manual">Indexes created: \d intake_requests shows all indexes</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run parallel with webhook setup -->
  </dependencies>

  <commit-message>feat(intake): create postgres schema with integrity constraints

- Create intake_requests table with all fields from spec
- Add UNIQUE constraint on (github_issue_id, repo_name) to prevent duplicates
- Add CHECK constraint on priority (p0/p1/p2 only)
- Create indexes on github_issue_id, status, priority, created_at
- Support JSONB for prd_content and error_log

Refs: REQ-INFRA-002, RISK-002 (duplicate prevention)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Configure GitHub API Client & Rate Limiting</title>
  <requirement>REQ-INFRA-003: GitHub API Authentication & Rate Limiting</requirement>
  <description>
    Set up GitHub API client using Octokit with proper authentication and rate limit handling. This prevents bot account suspension (RISK-007) and ensures reliable API access.

    **Rate Limit Strategy:** Implement exponential backoff, queue comments when approaching limits, and monitor X-RateLimit-Remaining header on every response.

    **Why This Matters:** GitHub enforces 5,000 req/hour for authenticated requests. At scale, multiple comments + issue fetches could exceed this. Rate limiting prevents silent failures.
  </description>

  <context>
    <file path="/app/api/intake/webhook/github/route.ts" reason="Will use GitHub client to post comments" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Risk Register #1 (GitHub API Rate Limits), Risk #7 (Bot Suspension)" />
  </context>

  <steps>
    <step order="1">Install Octokit: npm install @octokit/rest</step>
    <step order="2">Create GitHub client module: lib/intake/github.ts</step>
    <step order="3">Initialize Octokit with PAT: const octokit = new Octokit({ auth: process.env.GITHUB_PAT })</step>
    <step order="4">Add rate limit monitoring: check X-RateLimit-Remaining after every API call</step>
    <step order="5">Implement exponential backoff: if rate limit hit (429), wait 2^n seconds before retry</step>
    <step order="6">Create comment queue: if remaining < 100, queue comments instead of posting immediately</step>
    <step order="7">Add human-like delays: random 1-3 second delay between bot comments</step>
    <step order="8">Add circuit breaker: if 5+ failures in a row, pause for 5 minutes</step>
    <step order="9">Log all API errors with context: issue_id, endpoint, error_code</step>
  </steps>

  <verification>
    <check type="manual">Octokit client initializes successfully</check>
    <check type="manual">Test API call succeeds: octokit.rest.issues.listComments({ owner, repo, issue_number })</check>
    <check type="manual">Rate limit monitoring works: logs show remaining count after API call</check>
    <check type="manual">Backoff works: simulated 429 response triggers exponential retry</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can run parallel with other Wave 1 tasks -->
  </dependencies>

  <commit-message>feat(intake): configure github api client with rate limiting

- Initialize Octokit with GitHub PAT authentication
- Monitor X-RateLimit-Remaining header on all responses
- Implement exponential backoff for 429 errors
- Queue comments when rate limit approaching (<100 remaining)
- Add human-like delays (1-3s random) to avoid spam detection
- Implement circuit breaker for sustained failures

Refs: REQ-INFRA-003, RISK-001, RISK-007

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="2">
  <title>Build Event Parser & Validator</title>
  <requirement>REQ-INFRA-004: Event Parser & Validator</requirement>
  <description>
    Extract and validate relevant data from GitHub webhook payload. This prevents malformed events from crashing the system (RISK-009) and ensures clean data flows to downstream components.

    **Parser Strategy:** Extract issue_id, title, body, labels, created_by, repo_name. Validate required fields present. Handle edge cases gracefully (empty body, emoji-only content, etc.).

    **Why This Matters:** GitHub webhook payloads can be complex. Edge cases like missing fields or malformed JSON must be handled gracefully per Decision 7 (fail gracefully, never block user).
  </description>

  <context>
    <file path="/app/api/intake/webhook/github/route.ts" reason="Receives webhook, will call parser" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Risk Register #9 (Edge Cases in Issue Format)" />
  </context>

  <steps>
    <step order="1">Create parser module: lib/intake/event-parser.ts</step>
    <step order="2">Define TypeScript interface for parsed webhook: interface GitHubIssueEvent</step>
    <step order="3">Extract core fields: issue_id = payload.issue.number, title = payload.issue.title, body = payload.issue.body</step>
    <step order="4">Extract metadata: labels = payload.issue.labels.map(l => l.name), created_by = payload.issue.user.login, repo_name = payload.repository.full_name</step>
    <step order="5">Validate required fields: if (!title || !repo_name) throw ValidationError</step>
    <step order="6">Handle edge cases: if body empty, set description = ""; if body only emoji, log warning; if body has links, extract text content</step>
    <step order="7">Store raw_content unchanged: raw_content = JSON.stringify(payload.issue) for audit trail</step>
    <step order="8">Return validated ParsedIssueEvent object</step>
  </steps>

  <verification>
    <check type="test">npm run test -- event-parser.test.ts</check>
    <check type="manual">Valid payload parsed correctly</check>
    <check type="manual">Missing title throws ValidationError</check>
    <check type="manual">Empty body handled gracefully (doesn't crash)</check>
    <check type="manual">Emoji-only body logged as edge case</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Parser called by webhook handler" />
  </dependencies>

  <commit-message>feat(intake): build event parser with edge case handling

- Extract issue_id, title, body, labels, created_by, repo_name
- Validate required fields (title, repo_name) present
- Handle edge cases: empty body, emoji-only, malformed JSON
- Store raw_content for audit trail
- Add unit tests for parser validation logic

Refs: REQ-INFRA-004, RISK-009 (edge case handling)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="2">
  <title>Implement Structured Logging & Observability</title>
  <requirement>REQ-INFRA-005: Graceful Error Logging & Observability</requirement>
  <description>
    Add comprehensive structured logging to enable debugging and monitoring. This addresses RISK-010 (No Observability) - critical for detecting silent failures.

    **Logging Strategy:** Log all errors with context (timestamp, component, error type, stack trace, webhook/issue context). Store errors in intake_requests.error_log JSONB for traceability.

    **Why This Matters:** Without observability, failures will be discovered by angry users, not metrics. Logs enable root cause analysis and proactive monitoring.
  </description>

  <context>
    <file path="/app/api/intake/webhook/github/route.ts" reason="Main webhook handler - needs logging throughout" />
    <file path="/lib/intake/event-parser.ts" reason="Parser errors need structured logging" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Decision 7 (fail gracefully, log everything)" />
  </context>

  <steps>
    <step order="1">Create logging module: lib/intake/logger.ts</step>
    <step order="2">Define log levels: DEBUG, INFO, WARN, ERROR</step>
    <step order="3">Implement structured logging: logger.error({ component, error_type, stack, context })</step>
    <step order="4">Add webhook receipt logging: log every webhook with timestamp, issue_id, action</step>
    <step order="5">Add error logging: catch all errors, log with full context, never crash</step>
    <step order="6">Store errors in DB: on error, insert into intake_requests.error_log as JSONB</step>
    <step order="7">Add retry logging: log all retry attempts with backoff timing</step>
    <step order="8">Add API logging: log all GitHub API calls with endpoint, params, response code</step>
  </steps>

  <verification>
    <check type="manual">Logs show structured JSON with all required fields</check>
    <check type="manual">Errors logged with full stack trace</check>
    <check type="manual">Error stored in database intake_requests.error_log</check>
    <check type="manual">No crashes on logging errors (graceful degradation)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires intake_requests table with error_log field" />
    <depends-on task-id="phase-1-task-5" reason="Parser needs logging" />
  </dependencies>

  <commit-message>feat(intake): implement structured logging & observability

- Create structured logger with DEBUG/INFO/WARN/ERROR levels
- Log all webhook receipts with timestamp, issue_id, action
- Log all errors with full context (component, stack, issue_id)
- Store errors in intake_requests.error_log JSONB
- Log all GitHub API calls with endpoint, params, response code
- Never crash on logging errors (graceful degradation)

Refs: REQ-INFRA-005, RISK-010 (observability)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="2">
  <title>Build Priority Detection Engine (Keyword Matching)</title>
  <requirement>REQ-ANALYSIS-001: Priority Detection Engine</requirement>
  <description>
    Implement hardcoded keyword matching for priority detection (p0/p1/p2). This is the core of the "intelligent defaults" philosophy (Decision 5).

    **Detection Rules:**
    - p0: "production" + "bug" OR "urgent" OR "emergency" in title/body
    - p1: "feature request" without urgency markers
    - p2: "nice-to-have" OR "would be nice" OR default if unclear

    **Why This Matters:** This is the system's "intelligence" - it reads minds by inferring user intent. Accuracy here determines trust in the system.
  </description>

  <context>
    <file path="/lib/intake/analyzer/priority-detector.ts" reason="New module for priority detection" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Section IV.2 (Priority Detection Algorithm), Decision 5 (intelligent defaults)" />
  </context>

  <steps>
    <step order="1">Create priority detector module: lib/intake/analyzer/priority-detector.ts</step>
    <step order="2">Define keyword maps: p0_keywords = ['production', 'bug', 'urgent', 'emergency', 'critical', 'blocking'], p1_keywords = ['feature', 'request', 'enhancement'], p2_keywords = ['nice-to-have', 'would be nice', 'optional']</step>
    <step order="3">Implement detection function: detectPriority(title: string, body: string)</step>
    <step order="4">Check p0: if (title+body includes 'production' AND 'bug') OR includes 'urgent' => p0</step>
    <step order="5">Check p2: if includes 'nice-to-have' OR 'would be nice' => p2</step>
    <step order="6">Check p1: if includes 'feature request' without urgency => p1</step>
    <step order="7">Default: if no clear signals => p2 (safe default per Decision 5)</step>
    <step order="8">Document keyword mappings in config/priority-rules.ts for transparency</step>
  </steps>

  <verification>
    <check type="test">npm run test -- priority-detector.test.ts</check>
    <check type="manual">Test case: "production bug" → p0</check>
    <check type="manual">Test case: "urgent issue" → p0</check>
    <check type="manual">Test case: "nice-to-have feature" → p2</check>
    <check type="manual">Test case: "feature request" → p1</check>
    <check type="manual">Test case: "vague description" → p2 (default)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires parsed event with title and body" />
  </dependencies>

  <commit-message>feat(intake): build priority detection engine with keyword matching

- Implement p0 detection: production+bug, urgent, emergency, critical
- Implement p1 detection: feature request without urgency
- Implement p2 detection: nice-to-have, optional, or default
- Document keyword mappings in config/priority-rules.ts
- Add unit tests for all detection scenarios

Refs: REQ-ANALYSIS-001, Decision 5 (intelligent defaults)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-8" wave="2">
  <title>Implement Confidence Scoring with 0.7 Threshold</title>
  <requirement>REQ-ANALYSIS-001: Priority Detection Engine (confidence scoring)</requirement>
  <description>
    Add confidence scoring to priority detection. Only apply auto-detected priority if confidence > 0.7; otherwise default to p2 and ask user for clarification.

    **Confidence Calculation:**
    - Exact keyword match in title: 1.0
    - Exact keyword match in body: 0.8
    - Partial match or context-based: 0.5
    - No clear signals: 0.0

    **Why This Matters:** Addresses RISK-005 (Over-Confidence) - prevents misclassification by being conservative when uncertain.
  </description>

  <context>
    <file path="/lib/intake/analyzer/priority-detector.ts" reason="Extends task-7 with confidence scoring" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Risk Register #5 (Content Analysis Over-Confidence)" />
  </context>

  <steps>
    <step order="1">Extend detectPriority() to return: { priority: string, confidence: number }</step>
    <step order="2">Calculate confidence: if keyword in title => 1.0, if in body => 0.8, if ambiguous => 0.5</step>
    <step order="3">Apply threshold: if confidence < 0.7 => return { priority: 'p2', confidence: score, needs_clarification: true }</step>
    <step order="4">Store confidence_score in database (intake_requests.confidence_score)</step>
    <step order="5">Add unit tests for confidence edge cases</step>
  </steps>

  <verification>
    <check type="test">npm run test -- confidence-scoring.test.ts</check>
    <check type="manual">Exact match in title => confidence 1.0</check>
    <check type="manual">Match only in body => confidence 0.8</check>
    <check type="manual">Ambiguous signal => confidence 0.5, defaults to p2</check>
    <check type="manual">No signals => confidence 0.0, defaults to p2</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Extends priority detection" />
  </dependencies>

  <commit-message>feat(intake): add confidence scoring with 0.7 threshold

- Calculate confidence based on keyword match location (title vs body)
- Apply 0.7 threshold: below threshold defaults to p2
- Store confidence_score in database for review
- Flag low-confidence detections for user clarification
- Add unit tests for confidence edge cases

Refs: REQ-ANALYSIS-001, RISK-005 (over-confidence mitigation)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-9" wave="2">
  <title>Build Content Extraction (Title, Description, Raw Content)</title>
  <requirement>REQ-ANALYSIS-002: Issue Content Extraction</requirement>
  <description>
    Extract and structure key information from issue body and metadata. This feeds the PRD generator in Wave 3.

    **Extraction Strategy:**
    - title: GitHub issue title (already parsed)
    - description: first 500 chars of body or first paragraph
    - raw_content: full issue JSON for audit trail
    - request_type: inferred from keywords (bug, feature, enhancement, docs)

    **Why This Matters:** Clean extraction ensures PRD quality. Preserving raw_content enables manual review and debugging.
  </description>

  <context>
    <file path="/lib/intake/analyzer/content-analyzer.ts" reason="Main analysis orchestrator" />
    <file path="/lib/intake/analyzer/requirement-extractor.ts" reason="Requirement extraction module" />
    <file path="/lib/intake/event-parser.ts" reason="Provides parsed issue data" />
  </context>

  <steps>
    <step order="1">Create content analyzer: lib/intake/analyzer/content-analyzer.ts</step>
    <step order="2">Extract title: const title = parsedEvent.title</step>
    <step order="3">Extract description: const description = parsedEvent.body?.substring(0, 500) || parsedEvent.body?.split('\n\n')[0]</step>
    <step order="4">Store raw_content: const raw_content = parsedEvent.raw_content (from parser)</step>
    <step order="5">Handle multi-line content: preserve formatting, extract code blocks separately</step>
    <step order="6">Handle links: extract and store, but don't let them dominate description</step>
    <step order="7">Return structured AnalyzedContent object</step>
  </steps>

  <verification>
    <check type="test">npm run test -- content-analyzer.test.ts</check>
    <check type="manual">Title extracted correctly</check>
    <check type="manual">Description limited to 500 chars or first paragraph</check>
    <check type="manual">Raw content preserved unchanged</check>
    <check type="manual">Multi-line content handled without corruption</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Requires parsed event data" />
  </dependencies>

  <commit-message>feat(intake): build content extraction with formatting preservation

- Extract title from issue
- Extract description (first 500 chars or first paragraph)
- Preserve raw_content for audit trail
- Handle multi-line content and code blocks gracefully
- Extract and store links without dominating description
- Add unit tests for extraction edge cases

Refs: REQ-ANALYSIS-002

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-10" wave="2">
  <title>Build Type Classification (Bug, Feature, Enhancement, Docs)</title>
  <requirement>REQ-ANALYSIS-004: Request Type Classification</requirement>
  <description>
    Automatically categorize intake requests into BUG_FIX, FEATURE, ENHANCEMENT, or DOCUMENTATION based on keywords.

    **Classification Rules:**
    - BUG_FIX: "bug", "error", "broken", "issue", "fix"
    - FEATURE: "feature", "add", "new"
    - ENHANCEMENT: "improve", "enhance", "optimize", "update"
    - DOCUMENTATION: "docs", "documentation", "readme", "guide"

    **Why This Matters:** Type classification helps route requests to appropriate teams and set expectations for delivery timelines.
  </description>

  <context>
    <file path="/lib/intake/analyzer/classification.ts" reason="New classification module" />
    <file path="/lib/intake/analyzer/content-analyzer.ts" reason="Orchestrator calls classification" />
  </context>

  <steps>
    <step order="1">Create classification module: lib/intake/analyzer/classification.ts</step>
    <step order="2">Define RequestType enum: BUG_FIX, FEATURE, ENHANCEMENT, DOCUMENTATION</step>
    <step order="3">Define keyword maps for each type</step>
    <step order="4">Implement classifyRequest(title: string, body: string)</step>
    <step order="5">Check keywords in title (higher weight) and body</step>
    <step order="6">Return { type: RequestType, confidence: number }</step>
    <step order="7">Default to FEATURE if classification unclear</step>
  </steps>

  <verification>
    <check type="test">npm run test -- classification.test.ts</check>
    <check type="manual">"bug in production" → BUG_FIX</check>
    <check type="manual">"add new feature" → FEATURE</check>
    <check type="manual">"improve performance" → ENHANCEMENT</check>
    <check type="manual">"update docs" → DOCUMENTATION</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Requires extracted content" />
  </dependencies>

  <commit-message>feat(intake): build request type classification

- Classify requests into BUG_FIX, FEATURE, ENHANCEMENT, DOCUMENTATION
- Use keyword matching on title and body
- Return confidence score with classification
- Default to FEATURE if unclear
- Add unit tests for classification scenarios

Refs: REQ-ANALYSIS-004, Decision 5 (no dropdowns)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-11" wave="3">
  <title>Build PRD Generator (Template + Storage)</title>
  <requirement>REQ-PRD-001, REQ-PRD-002, REQ-PRD-003: PRD Generation & Storage</requirement>
  <description>
    Create structured PRD documents from analyzed issue content using Shipyard's existing PRD template format. Store PRD as JSONB in intake_requests table with versioned schema.

    **PRD Structure:**
    - version: 1 (schema version for future migrations)
    - title: from issue
    - description: extracted content
    - priority: detected priority (p0/p1/p2)
    - requirements: extracted from issue body
    - acceptance_criteria: bulleted lists from issue
    - success_metrics: inferred or default

    **Why This Matters:** PRD quality determines whether engineers can execute on the request. Template consistency enables downstream automation.
  </description>

  <context>
    <file path="/lib/intake/prd/generator.ts" reason="New PRD generator module" />
    <file path="/lib/intake/prd/templates.ts" reason="PRD template definitions" />
    <file path="/lib/intake/prd/storage.ts" reason="Postgres storage operations" />
    <file path="/home/agent/shipyard-ai/prds/TEMPLATE.md" reason="Existing PRD template to follow" />
  </context>

  <steps>
    <step order="1">Create PRD generator: lib/intake/prd/generator.ts</step>
    <step order="2">Define PRD schema interface with version field</step>
    <step order="3">Create template function: generatePRD(analyzedContent, priority, classification)</step>
    <step order="4">Populate PRD sections: Summary, Objectives, User Stories, Acceptance Criteria, Success Metrics</step>
    <step order="5">Use defaults for missing sections (never leave sections null/undefined)</step>
    <step order="6">Generate unique PRD ID: crypto.randomUUID()</step>
    <step order="7">Serialize to JSON: JSON.stringify(prd)</step>
    <step order="8">Store in database: INSERT INTO intake_requests (..., prd_content = $1, ...) VALUES (...)</step>
    <step order="9">Generate prd_url: `/intake/requests/${intake_id}/prd`</step>
    <step order="10">Return PRD object with ID and URL</step>
  </steps>

  <verification>
    <check type="test">npm run test -- prd-generator.test.ts</check>
    <check type="manual">PRD contains all required sections</check>
    <check type="manual">PRD has version: 1 field</check>
    <check type="manual">PRD serializes to valid JSON</check>
    <check type="manual">PRD stored in database prd_content field</check>
    <check type="manual">Missing sections filled with sensible defaults</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Requires priority detection" />
    <depends-on task-id="phase-1-task-9" reason="Requires content extraction" />
    <depends-on task-id="phase-1-task-10" reason="Requires type classification" />
    <depends-on task-id="phase-1-task-3" reason="Requires intake_requests table" />
  </dependencies>

  <commit-message>feat(intake): build prd generator with versioned schema

- Create PRD template with all required sections
- Include schema version (v1) for future migrations
- Generate unique PRD IDs
- Serialize PRD to JSONB for storage
- Fill missing sections with sensible defaults
- Store PRD in intake_requests.prd_content
- Generate PRD URL for dashboard linking
- Add unit tests for PRD structure validation

Refs: REQ-PRD-001, REQ-PRD-002, REQ-PRD-003, RISK-006 (schema versioning)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-12" wave="3">
  <title>Integrate PRD Chat Worker (/parse endpoint)</title>
  <requirement>REQ-PRD-001: PRD Content Generation (enhanced with AI)</requirement>
  <description>
    Call the existing `/workers/prd-chat/parse` endpoint to enhance PRD generation with AI-powered analysis. This leverages the Cloudflare Workers AI infrastructure already in place.

    **Integration Strategy:** Call worker `/parse` endpoint with issue content, get structured data back, merge with keyword-based analysis for hybrid approach.

    **Why This Matters:** Combining keyword detection (fast, reliable) with AI parsing (nuanced, contextual) gives best of both worlds.
  </description>

  <context>
    <file path="/workers/prd-chat/src/index.ts" reason="PRD Chat Worker with /parse endpoint (lines 343-400)" />
    <file path="/lib/intake/prd/generator.ts" reason="PRD generator to enhance" />
  </context>

  <steps>
    <step order="1">Add PRD Chat Worker URL to environment: PRD_CHAT_WORKER_URL</step>
    <step order="2">Create worker client: lib/intake/prd-chat-client.ts</step>
    <step order="3">Implement parseWithAI() function that calls /parse endpoint</step>
    <step order="4">Send issue content to worker: POST /parse with { content: issueBody }</step>
    <step order="5">Parse response: extract features, requirements, acceptance criteria</step>
    <step order="6">Merge AI results with keyword-based analysis (confidence-weighted)</step>
    <step order="7">Handle worker timeout (>2min): fall back to keyword-only analysis</step>
    <step order="8">Handle worker errors: log error, fall back to keyword-only analysis</step>
  </steps>

  <verification>
    <check type="manual">Worker /parse endpoint responds successfully</check>
    <check type="manual">AI-enhanced PRD includes more detailed requirements than keyword-only</check>
    <check type="manual">Worker timeout handled gracefully (falls back)</check>
    <check type="manual">Worker error logged but doesn't crash PRD generation</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Enhances PRD generation" />
  </dependencies>

  <commit-message>feat(intake): integrate prd chat worker for ai-enhanced analysis

- Call /workers/prd-chat/parse endpoint with issue content
- Merge AI results with keyword-based analysis
- Implement fallback to keyword-only if worker times out
- Handle worker errors gracefully (log and continue)
- Add timeout: 120 seconds (2 minutes per requirement)

Refs: REQ-PRD-001, Codebase Scout (existing PRD Worker)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-13" wave="3">
  <title>Implement PRD Failure Handling (Graceful Degradation)</title>
  <requirement>REQ-PRD-004: Graceful PRD Generation Failure Handling</requirement>
  <description>
    If PRD generation fails (worker timeout, parsing error, DB write failure), create basic PRD and notify user via comment. Never block the intake flow.

    **Failure Strategy:**
    - If AI worker fails: use keyword-only PRD
    - If template generation fails: create minimal PRD with just title, description, priority
    - If DB write fails: still post bot comment, retry save in background
    - Always log error with full context

    **Why This Matters:** Decision 7 (fail gracefully, never block user) - system must degrade gracefully, not crash.
  </description>

  <context>
    <file path="/lib/intake/prd/generator.ts" reason="PRD generator with error handling" />
    <file path="/lib/intake/logger.ts" reason="Error logging" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Decision 7 (graceful failure), Section IV.7 (error communication)" />
  </context>

  <steps>
    <step order="1">Wrap PRD generation in try-catch block</step>
    <step order="2">If worker fails: log error, generate keyword-only PRD</step>
    <step order="3">If template fails: log error, create minimal PRD: { version: 1, title, description, priority }</step>
    <step order="4">If DB write fails: log error, queue for retry, continue to bot comment</step>
    <step order="5">Store error in intake_requests.error_log JSONB</step>
    <step order="6">Set status = 'failed' if PRD completely unusable, 'partial' if degraded</step>
    <step order="7">Return { prd, status, error } object so bot can comment appropriately</step>
  </steps>

  <verification>
    <check type="test">npm run test -- prd-failure-handling.test.ts</check>
    <check type="manual">Worker timeout generates keyword-only PRD (doesn't crash)</check>
    <check type="manual">Template error generates minimal PRD (doesn't crash)</check>
    <check type="manual">DB write error logged but comment still posted</check>
    <check type="manual">Error stored in intake_requests.error_log</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Adds error handling to PRD generation" />
    <depends-on task-id="phase-1-task-12" reason="Handles worker failures" />
    <depends-on task-id="phase-1-task-6" reason="Uses structured logging" />
  </dependencies>

  <commit-message>feat(intake): implement prd failure handling with graceful degradation

- Wrap PRD generation in try-catch with multiple fallback levels
- Worker timeout → keyword-only PRD
- Template error → minimal PRD (title, description, priority)
- DB write error → log, queue retry, continue to comment
- Store all errors in intake_requests.error_log
- Set status = 'failed' or 'partial' based on severity
- Never block intake flow due to PRD errors

Refs: REQ-PRD-004, Decision 7 (fail gracefully)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-14" wave="3">
  <title>Build Bot Comment Templates (Success & Error Cases)</title>
  <requirement>REQ-BOT-006: Comment Template & Message Formatting</requirement>
  <description>
    Create standardized comment templates for all bot responses: successful PRD creation, failed PRD, low confidence, etc.

    **Template Types:**
    - Success: PRD link, priority, confidence, next steps, override instructions
    - Partial: PRD link, explanation of what failed, timeline expectation
    - Failed: Acknowledgment, timeline, manual review notice
    - Low Confidence: PRD link, request for clarification

    **Why This Matters:** Consistent communication builds trust. Users need to understand what happened and what to do next.
  </description>

  <context>
    <file path="/lib/intake/responder/templates.ts" reason="New bot comment templates" />
    <file path="/lib/intake/responder/formatter.ts" reason="Markdown formatting utilities" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md" reason="Section II.4 (Bot Responder), Section IV.7 (error communication)" />
  </context>

  <steps>
    <step order="1">Create templates module: lib/intake/responder/templates.ts</step>
    <step order="2">Define success template: "Thanks for your intake request! I've analyzed it and generated a PRD. **Priority:** {priority} (confidence: {confidence}). **[View PRD]({prd_url})**. Next steps: Review PRD, team will start work on {timeline}. To override priority, add label `priority/{new_priority}`."</step>
    <step order="3">Define partial template: "I've received your request but encountered an issue generating the full PRD. I've created a basic PRD with what I could extract. **[View PRD]({prd_url})**. A team member will review and enhance it within 24 hours."</step>
    <step order="4">Define failed template: "I couldn't generate a PRD due to a system issue, but I've logged your request. You'll hear from the team within 24 hours. Sorry for the inconvenience!"</step>
    <step order="5">Define low confidence template: "I've analyzed your request but I'm not very confident in my priority classification. I've defaulted to p2. **[View PRD]({prd_url})**. Could you provide more details about the urgency/impact?"</step>
    <step order="6">Parameterize templates: function formatSuccess(priority, confidence, prd_url, timeline)</step>
    <step order="7">Test markdown formatting: ensure links clickable, bold/italic work</step>
  </steps>

  <verification>
    <check type="manual">Success template renders correctly with test data</check>
    <check type="manual">All links clickable in GitHub</check>
    <check type="manual">Markdown formatting (bold, italic) renders correctly</check>
    <check type="manual">Tone is professional yet friendly</check>
  </verification>

  <dependencies>
    <!-- No dependencies - can build templates in parallel with other Wave 3 tasks -->
  </dependencies>

  <commit-message>feat(intake): build bot comment templates for all scenarios

- Create success template with PRD link, priority, confidence
- Create partial template for degraded PRD generation
- Create failed template for system errors
- Create low-confidence template requesting clarification
- Parameterize all templates for dynamic content
- Test markdown rendering in GitHub comments

Refs: REQ-BOT-006, Section II.4 (Bot Responder)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-15" wave="3">
  <title>Implement Bot Posting Logic with Rate Limiting</title>
  <requirement>REQ-BOT-001, REQ-BOT-002, REQ-BOT-003, REQ-BOT-004, REQ-BOT-005: Bot Integration</requirement>
  <description>
    Implement the bot comment posting logic using GitHub API (Octokit) with rate limiting, human-like delays, and error handling.

    **Posting Strategy:**
    - Post comment to source GitHub issue
    - Include PRD link, priority, confidence, next steps
    - Add random 1-3 second delay to appear human
    - Check rate limits before posting
    - Queue if rate limit approaching
    - Retry on failure with exponential backoff

    **Why This Matters:** This is the user's only feedback mechanism. Comment must post reliably and quickly (<30 seconds per Success Metrics).
  </description>

  <context>
    <file path="/lib/intake/responder/bot-comment.ts" reason="New bot comment poster" />
    <file path="/lib/intake/github.ts" reason="GitHub API client from task-4" />
    <file path="/lib/intake/responder/templates.ts" reason="Comment templates from task-14" />
  </context>

  <steps>
    <step order="1">Create bot comment module: lib/intake/responder/bot-comment.ts</step>
    <step order="2">Implement postComment(issue_id, repo, comment_body)</step>
    <step order="3">Add human-like delay: await sleep(Math.random() * 2000 + 1000) // 1-3 seconds</step>
    <step order="4">Check rate limits: if (remaining < 100) queue comment instead of posting</step>
    <step order="5">Post comment: octokit.rest.issues.createComment({ owner, repo, issue_number, body })</step>
    <step order="6">Handle errors: if 429 (rate limit), exponential backoff and retry</step>
    <step order="7">Store bot_comment_url in database after successful post</step>
    <step order="8">Log all comment posts with timestamp, issue_id, response code</step>
  </steps>

  <verification>
    <check type="manual">Test comment posts successfully to GitHub</check>
    <check type="manual">Human-like delay applied (1-3 seconds)</check>
    <check type="manual">Rate limit check works (doesn't post if < 100 remaining)</check>
    <check type="manual">429 error triggers exponential backoff</check>
    <check type="manual">bot_comment_url stored in database</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Uses GitHub API client" />
    <depends-on task-id="phase-1-task-14" reason="Uses comment templates" />
    <depends-on task-id="phase-1-task-11" reason="Needs PRD URL to include in comment" />
  </dependencies>

  <commit-message>feat(intake): implement bot posting with rate limiting

- Post comments to GitHub issues via Octokit
- Add human-like delays (1-3 seconds random)
- Check rate limits before posting (<100 remaining → queue)
- Implement exponential backoff for 429 errors
- Store bot_comment_url in database
- Log all comment posts with timing and response codes

Refs: REQ-BOT-001, REQ-BOT-002, REQ-BOT-003, REQ-BOT-004, REQ-BOT-005

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-16" wave="4">
  <title>Build Read-Only Dashboard (List View + Filters)</title>
  <requirement>REQ-DASHBOARD-001, REQ-DASHBOARD-002: Dashboard Views</requirement>
  <description>
    Create simple read-only dashboard to view all intake requests with filtering by priority.

    **Dashboard Features:**
    - List all intake requests: issue_id, title, priority, status, created_at
    - Filter by priority: p0, p1, p2, All
    - Sort by created_at DESC (newest first)
    - Click row to see PRD details
    - Refresh on page load (no real-time updates for v1)

    **Why This Matters:** Dashboard provides visibility into the intake pipeline. Team can see all requests, track status, and identify issues.
  </description>

  <context>
    <file path="/app/intake/dashboard/page.tsx" reason="New dashboard page" />
    <file path="/app/api/intake/requests/route.ts" reason="API endpoint for list view" />
    <file path="/lib/db/queries.ts" reason="Postgres query functions" />
  </context>

  <steps>
    <step order="1">Create dashboard page: app/intake/dashboard/page.tsx</step>
    <step order="2">Create API route: app/api/intake/requests/route.ts</step>
    <step order="3">Implement query: SELECT id, github_issue_id, title, priority, status, created_at FROM intake_requests ORDER BY created_at DESC</step>
    <step order="4">Add filter parameter: WHERE priority = $1 (if filter applied)</step>
    <step order="5">Build UI: table with columns: Issue ID, Title, Priority, Status, Created At</step>
    <step order="6">Add filter buttons: p0, p1, p2, All</step>
    <step order="7">Clicking filter updates URL param: ?priority=p0</step>
    <step order="8">Display count: "Showing {count} requests"</step>
    <step order="9">Make rows clickable: onClick navigate to /intake/requests/{id}</step>
  </steps>

  <verification>
    <check type="manual">Dashboard loads and displays all intake requests</check>
    <check type="manual">Filter by priority works (p0, p1, p2, All)</check>
    <check type="manual">Count displayed correctly</check>
    <check type="manual">Clicking row navigates to detail view</check>
    <check type="manual">Sort order correct (newest first)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Queries intake_requests table" />
    <depends-on task-id="phase-1-task-11" reason="Needs PRD data to display" />
  </dependencies>

  <commit-message>feat(intake): build read-only dashboard with priority filters

- Create dashboard list view showing all intake requests
- Display columns: Issue ID, Title, Priority, Status, Created At
- Add filter buttons: p0, p1, p2, All
- Filter updates URL param and query
- Display count of results
- Make rows clickable to detail view
- Sort by created_at DESC (newest first)

Refs: REQ-DASHBOARD-001, REQ-DASHBOARD-002

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-17" wave="4">
  <title>Build PRD Detail View (Dashboard Drill-Down)</title>
  <requirement>REQ-DASHBOARD-003, REQ-DASHBOARD-004: PRD Status & Link</requirement>
  <description>
    Create detail view page that displays full PRD content, status, metadata, and link to source GitHub issue.

    **Detail View Features:**
    - Display full prd_content JSONB rendered as readable markdown
    - Show status: pending, in_progress, completed, failed
    - Show metadata: requested_by, detected_type, confidence_score
    - Show error summary if failed (first 100 chars of error_log)
    - Link to source GitHub issue
    - Link to bot comment (if posted)

    **Why This Matters:** Detail view allows team to review PRD quality, understand classification decisions, and debug failures.
  </description>

  <context>
    <file path="/app/intake/requests/[id]/page.tsx" reason="New detail view page" />
    <file path="/app/api/intake/requests/[id]/route.ts" reason="API endpoint for single request" />
  </context>

  <steps>
    <step order="1">Create detail page: app/intake/requests/[id]/page.tsx</step>
    <step order="2">Create API route: app/api/intake/requests/[id]/route.ts</step>
    <step order="3">Implement query: SELECT * FROM intake_requests WHERE id = $1</step>
    <step order="4">Parse prd_content JSONB and render as markdown</step>
    <step order="5">Display status badge: pending (yellow), in_progress (blue), completed (green), failed (red)</step>
    <step order="6">Display metadata: requested_by, detected_type, confidence_score</step>
    <step order="7">If status = failed: display first 100 chars of error_log with "View Full Error" expandable</step>
    <step order="8">Add link to GitHub issue: "View Source Issue" button</step>
    <step order="9">Add link to bot comment: "View Bot Comment" button (if bot_comment_url exists)</step>
  </steps>

  <verification>
    <check type="manual">Detail view displays full PRD content</check>
    <check type="manual">Status badge shows correct color</check>
    <check type="manual">Metadata displayed correctly</check>
    <check type="manual">Error summary shown for failed requests</check>
    <check type="manual">Links to GitHub issue and bot comment work</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Accessed from dashboard list view" />
    <depends-on task-id="phase-1-task-11" reason="Displays PRD content" />
  </dependencies>

  <commit-message>feat(intake): build prd detail view with status and metadata

- Create detail page for individual intake requests
- Display full PRD content rendered as markdown
- Show status badge (pending/in_progress/completed/failed)
- Display metadata: requested_by, detected_type, confidence_score
- Show error summary for failed requests (first 100 chars)
- Add links to GitHub issue and bot comment
- Add "View Full Error" expandable for detailed error logs

Refs: REQ-DASHBOARD-003, REQ-DASHBOARD-004

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-18" wave="4">
  <title>Unit Tests (Webhook, Analyzer, PRD, Bot)</title>
  <requirement>REQ-TEST-001, REQ-TEST-002, REQ-TEST-003: Unit Testing</requirement>
  <description>
    Write comprehensive unit tests for all core modules: webhook handler, content analyzer, PRD generator, bot responder.

    **Test Coverage Goals:**
    - Webhook: signature validation, label filtering, edge cases
    - Analyzer: priority detection, confidence scoring, type classification
    - PRD: template generation, JSONB serialization, field validation
    - Bot: template formatting, rate limit handling

    **Why This Matters:** 80% code coverage required per requirements. Tests catch bugs before production and enable confident refactoring.
  </description>

  <context>
    <file path="/tests/webhook.test.ts" reason="Webhook handler tests" />
    <file path="/tests/analyzer.test.ts" reason="Content analyzer tests" />
    <file path="/tests/prd-generator.test.ts" reason="PRD generator tests" />
    <file path="/tests/bot-comment.test.ts" reason="Bot responder tests" />
  </context>

  <steps>
    <step order="1">Create test directory: mkdir -p tests</step>
    <step order="2">Write webhook.test.ts: test signature validation (valid, invalid, missing), label filtering, edge cases (empty body, malformed JSON)</step>
    <step order="3">Write analyzer.test.ts: test priority detection (p0/p1/p2 keywords), confidence scoring (>0.7 threshold), type classification (BUG_FIX/FEATURE/etc)</step>
    <step order="4">Write prd-generator.test.ts: test PRD structure (all sections present), JSONB serialization, missing field defaults, unique ID generation</step>
    <step order="5">Write bot-comment.test.ts: test template formatting, parameter substitution, markdown rendering</step>
    <step order="6">Run tests: npm run test</step>
    <step order="7">Check coverage: npm run test:coverage (should be >80%)</step>
  </steps>

  <verification>
    <check type="test">npm run test -- webhook.test.ts</check>
    <check type="test">npm run test -- analyzer.test.ts</check>
    <check type="test">npm run test -- prd-generator.test.ts</check>
    <check type="test">npm run test -- bot-comment.test.ts</check>
    <check type="build">npm run test:coverage shows >80% coverage</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Tests webhook signature validation" />
    <depends-on task-id="phase-1-task-7" reason="Tests priority detection" />
    <depends-on task-id="phase-1-task-8" reason="Tests confidence scoring" />
    <depends-on task-id="phase-1-task-11" reason="Tests PRD generation" />
    <depends-on task-id="phase-1-task-14" reason="Tests bot templates" />
  </dependencies>

  <commit-message>test(intake): add comprehensive unit tests for core modules

- Add webhook tests: signature validation, label filtering, edge cases
- Add analyzer tests: priority detection, confidence scoring, classification
- Add PRD tests: template structure, JSONB serialization, field defaults
- Add bot tests: template formatting, markdown rendering
- Achieve >80% code coverage across all modules

Refs: REQ-TEST-001, REQ-TEST-002, REQ-TEST-003

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-19" wave="4">
  <title>Integration Test (Issue → PRD → Comment E2E)</title>
  <requirement>REQ-TEST-004: Integration Test</requirement>
  <description>
    End-to-end integration test simulating full intake flow from GitHub webhook to bot comment.

    **Test Scenarios:**
    1. Happy path: valid issue → priority detected → PRD created → comment posted
    2. Low confidence: ambiguous issue → defaults to p2 → comment asks for clarification
    3. PRD failure: worker timeout → keyword-only PRD → partial comment posted
    4. Edge case: empty body → still processed, logged, comment posted

    **Why This Matters:** Integration tests verify system works end-to-end, catching issues unit tests miss (e.g., database connection, API integration).
  </description>

  <context>
    <file path="/tests/integration.test.ts" reason="Integration test suite" />
    <file path="/tests/fixtures/webhook-payloads.json" reason="Mock webhook payloads" />
  </context>

  <steps>
    <step order="1">Create integration test: tests/integration.test.ts</step>
    <step order="2">Create mock webhook payloads: tests/fixtures/webhook-payloads.json (5+ scenarios)</step>
    <step order="3">Test happy path: send mock webhook → verify intake_request created → verify PRD in prd_content → verify bot_comment_url stored</step>
    <step order="4">Test low confidence: ambiguous issue → verify priority = p2 → verify needs_clarification flag → verify comment asks for details</step>
    <step order="5">Test PRD failure: mock worker timeout → verify keyword-only PRD created → verify partial status → verify comment explains issue</step>
    <step order="6">Test edge case: empty body → verify processed without crash → verify logged → verify comment posted</step>
    <step order="7">Verify response time: assert all tests complete in <30 seconds (Success Metric)</step>
  </steps>

  <verification>
    <check type="test">npm run test:integration</check>
    <check type="manual">Happy path test passes</check>
    <check type="manual">Low confidence test passes</check>
    <check type="manual">PRD failure test passes</check>
    <check type="manual">Edge case test passes</check>
    <check type="manual">All tests complete in <30 seconds</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Tests webhook endpoint" />
    <depends-on task-id="phase-1-task-11" reason="Tests PRD generation" />
    <depends-on task-id="phase-1-task-15" reason="Tests bot comment posting" />
  </dependencies>

  <commit-message>test(intake): add end-to-end integration tests

- Test happy path: issue → PRD → comment
- Test low confidence: defaults to p2, asks for clarification
- Test PRD failure: keyword-only fallback, partial comment
- Test edge case: empty body processed without crash
- Verify <30 second response time requirement
- Create mock webhook payloads for all scenarios

Refs: REQ-TEST-004, Success Metrics

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-20" wave="4">
  <title>Error Scenario Tests (Rate Limits, DB Failures, etc.)</title>
  <requirement>REQ-TEST-005: Error Scenario Integration Tests</requirement>
  <description>
    Integration tests for error paths and graceful degradation: GitHub API rate limits, Postgres connection failures, PRD generation timeouts, invalid webhook signatures, malformed issue content.

    **Error Scenarios:**
    1. GitHub API rate limit (429) → queues comment, retries with backoff
    2. Postgres connection failure → logs error, still posts comment, queues retry
    3. PRD generation timeout → creates keyword-only PRD, posts partial comment
    4. Invalid webhook signature → rejects request, logs unauthorized attempt
    5. Malformed issue content → logs edge case, processes gracefully

    **Why This Matters:** Error handling is critical for reliability. These tests verify the system fails gracefully per Decision 7 (never block user).
  </description>

  <context>
    <file path="/tests/error-scenarios.test.ts" reason="Error scenario test suite" />
  </context>

  <steps>
    <step order="1">Create error scenario tests: tests/error-scenarios.test.ts</step>
    <step order="2">Test rate limit: mock 429 response → verify exponential backoff → verify retry succeeds</step>
    <step order="3">Test DB failure: mock connection error → verify logs error → verify comment still posted → verify queued for retry</step>
    <step order="4">Test PRD timeout: mock worker >2min → verify keyword-only PRD created → verify partial comment</step>
    <step order="5">Test invalid signature: send webhook with wrong signature → verify 401 response → verify not processed → verify logged</step>
    <step order="6">Test malformed content: send issue with only emoji → verify logged → verify processed → verify comment posted</step>
    <step order="7">Verify no requests lost: assert all error scenarios result in intake_request record (even if degraded)</step>
  </steps>

  <verification>
    <check type="test">npm run test:error-scenarios</check>
    <check type="manual">Rate limit test passes (queues, retries, succeeds)</check>
    <check type="manual">DB failure test passes (logs, comments, queues)</check>
    <check type="manual">PRD timeout test passes (fallback, partial comment)</check>
    <check type="manual">Invalid signature test passes (401, logged, not processed)</check>
    <check type="manual">Malformed content test passes (logged, processed, commented)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Tests signature validation errors" />
    <depends-on task-id="phase-1-task-4" reason="Tests rate limit handling" />
    <depends-on task-id="phase-1-task-6" reason="Tests error logging" />
    <depends-on task-id="phase-1-task-13" reason="Tests PRD failure handling" />
  </dependencies>

  <commit-message>test(intake): add error scenario integration tests

- Test GitHub API rate limit with exponential backoff
- Test Postgres connection failure with graceful degradation
- Test PRD generation timeout with keyword-only fallback
- Test invalid webhook signature rejection
- Test malformed issue content handling
- Verify no requests lost in error scenarios

Refs: REQ-TEST-005, Decision 7 (fail gracefully)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Register Summary

| Risk | Mitigation Task(s) | Status |
|------|-------------------|--------|
| RISK-002: Webhook Delivery & Race Conditions | task-3 (UNIQUE constraint + idempotency) | ✅ Mitigated |
| RISK-003: Missing Webhook Signature Validation | task-2 (HMAC-SHA256 validation) | ✅ Mitigated |
| RISK-001: GitHub API Rate Limits | task-4 (rate limiting + queuing) | ✅ Mitigated |
| RISK-005: Content Analysis Over-Confidence | task-8 (0.7 confidence threshold) | ✅ Mitigated |
| RISK-010: No Observability | task-6 (structured logging) | ✅ Mitigated |
| RISK-007: Bot Account Suspension | task-15 (human-like delays, rate limits) | ✅ Mitigated |
| RISK-006: PRD Storage Format Incompatibility | task-11 (versioned schema) | ✅ Mitigated |
| RISK-009: Invalid Issue Format | task-5 (edge case handling) | ✅ Mitigated |

---

## Success Criteria Verification

| Metric | Requirement | Verification Task |
|--------|-------------|-------------------|
| 10+ intake requests processed | Task success | task-19 (integration test) |
| <30 second bot response time | 95% SLA | task-19 (timing verification) |
| <5% error rate | PRD generation success | task-20 (error scenarios) |
| Zero manual PRD creation | Automation complete | All tasks complete |
| Positive user feedback | User testing | Friday deployment + feedback |

---

## Deployment Checklist

Before Friday launch:

1. **Environment Variables Configured:**
   - `GITHUB_WEBHOOK_SECRET` (task-2)
   - `GITHUB_PAT` (task-4)
   - `PRD_CHAT_WORKER_URL` (task-12)
   - `DATABASE_URL` (task-3)

2. **Database Migration Run:**
   - `intake_requests` table created (task-3)
   - Indexes verified (task-3)

3. **GitHub App Configured:**
   - Webhook URL registered: `https://{domain}/api/intake/webhook/github`
   - Webhook secret set
   - Bot account provisioned with write access

4. **Tests Passing:**
   - Unit tests: 80%+ coverage (task-18)
   - Integration test: <30 second response (task-19)
   - Error scenarios: all passing (task-20)

5. **Monitoring Set Up:**
   - Logs flowing to observability platform (task-6)
   - Alerts configured for high error rates

6. **Dashboard Accessible:**
   - `/intake/dashboard` loads (task-16)
   - Filters work (task-16)
   - Detail view loads (task-17)

---

**Status**: Ready for implementation
**Estimated Total Time**: 3-4 days (24-32 hours)
**Ship Date**: Friday EOD
**Next Step**: Begin Wave 1 implementation (Monday AM)
