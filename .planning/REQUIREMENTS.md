# Shipyard Self-Serve Intake: Requirements Document

**Generated**: 2026-04-16
**Project**: shipyard-self-serve-intake
**Source**: /home/agent/shipyard-ai/rounds/shipyard-self-serve-intake/decisions.md
**Status**: Locked for Phase 1 Build

---

## Executive Summary

This document contains atomic, testable requirements extracted from the locked decisions document. The self-serve intake system will automatically convert GitHub issues into PRDs without user interaction, following a zero-click philosophy.

**Core Vision**: Turn GitHub issues into shipped code without user thinking about it. Zero-click default path. System reads minds, not forms.

**MVP Scope**: GitHub webhook listener → content analyzer → PRD generator → bot responder → read-only dashboard

**Ship Date**: Friday EOD (non-negotiable per decisions)

---

## Requirement Categories

- **A. Infrastructure** - Databases, webhooks, API setup
- **B. Content Analysis** - Priority detection, classification
- **C. PRD Generation** - Creation, storage, formatting
- **D. Bot Integration** - GitHub comments, feedback
- **E. Dashboard** - Read-only views, filtering
- **F. Error Handling** - Graceful failures, logging
- **G. Testing** - Unit, integration, e2e tests

---

## A. INFRASTRUCTURE REQUIREMENTS

### REQ-INFRA-001: GitHub Webhook Listener Setup
**Description**: System must receive and process GitHub webhook events for newly opened issues in target repositories with proper authentication and filtering.

**Acceptance Criteria**:
- Webhook endpoint accepts POST requests from GitHub
- Validates HMAC signature on every incoming webhook (Decision 7, Risk #3)
- Filters events by label (e.g., `intake-request`) to process only relevant issues
- Fails securely if signature validation fails (no processing, logs attempt)
- Responds to GitHub within 5 seconds to avoid timeout

**Priority**: Must-Have
**Dependencies**: None
**Traced to**: Decision 1 (GitHub as primary interface), Decision 2 (automatic analysis), Section II.1 (GitHub Webhook Listener), Risk Register #3

---

### REQ-INFRA-002: Postgres Database Schema
**Description**: Create a single intake_requests table to persist all issue intake data with proper indexing for query performance.

**Acceptance Criteria**:
- Table created with all fields defined in schema: github_issue_id, title, description, priority, prd_content, status, created_at, etc.
- UUID primary key auto-generated for each intake request
- Indexes created on: github_issue_id, status, priority, created_at
- CHECK constraint enforces priority ∈ {p0, p1, p2}
- JSONB fields support prd_content and error_log storage
- created_at and updated_at timestamps auto-populated
- **UNIQUE constraint on (github_issue_id, repo_name)** to prevent duplicates

**Priority**: Must-Have
**Dependencies**: None
**Traced to**: Decision 4 (Postgres + GitHub only), Section III (File Structure & Schema)

---

### REQ-INFRA-003: GitHub API Authentication & Rate Limiting
**Description**: System must authenticate to GitHub API and handle rate limits gracefully without blocking user requests.

**Acceptance Criteria**:
- Bot account provisioned with write access to target repo(s)
- API calls use valid GitHub PAT with appropriate scopes
- System detects rate limit responses (HTTP 403 with X-RateLimit headers)
- Implements exponential backoff when rate limit approaching
- Queues failed API calls for retry (Decision 7 - never block user)
- Logs all API errors to observability system

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-001
**Traced to**: Decision 7 (fail gracefully), Risk Register #1 (GitHub API Rate Limits)

---

### REQ-INFRA-004: Event Parser & Validator
**Description**: Extract and validate relevant data from GitHub webhook payload to prevent processing malformed events.

**Acceptance Criteria**:
- Parser extracts: issue_id, title, body, labels, created_by, repo_name from webhook payload
- Validator ensures required fields (title, repo_name) are present and non-empty
- Handles edge cases: empty body, only emoji, malformed JSON gracefully
- Logs malformed payloads without crashing

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-001
**Traced to**: Decision 2 (automatic analysis), Section III (event-parser.ts), Risk Register #9

---

### REQ-INFRA-005: Graceful Error Logging & Observability
**Description**: All errors logged to observability system with structured context; never block user flow.

**Acceptance Criteria**:
- Every error includes: timestamp, component, error type, stack trace, webhook/issue context
- Errors stored in intake_requests.error_log as JSONB for traceability
- System never crashes or hangs due to processing errors
- Retry logic implemented for transient failures (DB, GitHub API)

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-002, REQ-INFRA-003
**Traced to**: Decision 7 (graceful failure), Section II.4 (Bot error response)

---

## B. CONTENT ANALYSIS REQUIREMENTS

### REQ-ANALYSIS-001: Priority Detection Engine
**Description**: Analyze issue content to automatically detect and assign priority level (p0/p1/p2) based on keyword signals.

**Acceptance Criteria**:
- Detects "production" + "bug" → p0
- Detects "urgent" or "emergency" in title/body → p0
- Detects "nice-to-have" or "would be nice" → p2
- Detects "feature request" without urgency markers → p1
- Defaults to p2 if no clear signals (Decision 5)
- **Only applies auto-detection if confidence_score > 0.7**; otherwise defaults to p2 and asks user
- Stores confidence_score (0.00-1.00) for each detection
- Documented keyword→priority mappings in config/priority-rules.ts

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-004
**Traced to**: Decision 5 (intelligent defaults), Decision 2 (priority inference), Section II.2, Section IV.2

---

### REQ-ANALYSIS-002: Issue Content Extraction
**Description**: Extract and structure key information from issue body and metadata.

**Acceptance Criteria**:
- Extracts title from GitHub issue title field
- Extracts description from issue body (first 500 chars or paragraph)
- Stores raw_content unchanged for audit trail
- Identifies request type: bug fix, feature, enhancement, documentation
- Handles multi-line content, code blocks, links appropriately

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-004
**Traced to**: Section II.2 (Content Analysis Engine), Section III (requirement-extractor.ts)

---

### REQ-ANALYSIS-003: Requirement Signal Detection
**Description**: Identify key requirements from issue content to inform PRD generation.

**Acceptance Criteria**:
- Extracts acceptance criteria if mentioned (bulleted lists, numbered items)
- Identifies technical constraints or dependencies mentioned
- Captures stakeholder or user context
- Flags missing or ambiguous requirements for PRD

**Priority**: Nice-to-Have
**Dependencies**: REQ-ANALYSIS-002
**Traced to**: Section II.2 (requirement-extractor.ts), Risk Register #2

---

### REQ-ANALYSIS-004: Request Type Classification
**Description**: Automatically categorize intake request type (bug fix, feature, enhancement, documentation).

**Acceptance Criteria**:
- Classification returned as enum: BUG_FIX, FEATURE, ENHANCEMENT, DOCUMENTATION
- Default classification when unclear
- Confidence score included with classification
- No user input or form required

**Priority**: Must-Have
**Dependencies**: REQ-ANALYSIS-002
**Traced to**: Decision 5 (no dropdowns), Section II.2 (classification.ts)

---

## C. PRD GENERATION REQUIREMENTS

### REQ-PRD-001: PRD Content Generation
**Description**: Create structured PRD document from analyzed issue content using existing Shipyard templates.

**Acceptance Criteria**:
- PRD includes: title, description, priority, requirements, acceptance criteria
- Uses Shipyard's existing PRD template format
- Generates unique PRD identifier (included in prd_content JSONB)
- PRD content stored as valid JSON in intake_requests.prd_content
- Generation completes in <2 minutes (Decision 7 - immediate ack)

**Priority**: Must-Have
**Dependencies**: REQ-ANALYSIS-001, REQ-ANALYSIS-002, REQ-ANALYSIS-004
**Traced to**: Decision 2 (PRD generated automatically), Section II.3, Section IV.3

---

### REQ-PRD-002: PRD Storage in Postgres
**Description**: Persist generated PRD to database with issue linkage and metadata.

**Acceptance Criteria**:
- Stores prd_content as JSONB in intake_requests table
- Links prd to source GitHub issue via github_issue_id and github_issue_url
- Generates and stores unique prd_url reference
- Records generated_at timestamp
- Supports update if PRD regenerated

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-002, REQ-PRD-001
**Traced to**: Section II.3 (PRD Generator), Section III (database schema)

---

### REQ-PRD-003: PRD Template Consistency
**Description**: Ensure all generated PRDs follow consistent structure and formatting with versioned schema.

**Acceptance Criteria**:
- All PRDs contain: Summary, Objectives, User Stories, Acceptance Criteria, Success Metrics sections
- Markdown formatting consistent across all generated PRDs
- PRD sections never null/undefined (use sensible defaults if not detected)
- Template supports JSON serialization for storage
- **Include schema version in every record: `{ version: 1, title: "", sections: [] }`**

**Priority**: Must-Have
**Dependencies**: REQ-PRD-001
**Traced to**: Section IV.3 (PRD Format question), Section III (templates.ts)

---

### REQ-PRD-004: Graceful PRD Generation Failure Handling
**Description**: If PRD generation fails, create basic PRD and notify user via comment.

**Acceptance Criteria**:
- If generation fails, create basic PRD with detected priority and requirements
- Comment on GitHub issue explaining partial PRD and error context
- Error logged with full stack trace
- System continues to next step (commenting) despite PRD generation failure
- Never blocks issue intake flow

**Priority**: Must-Have
**Dependencies**: REQ-PRD-001, REQ-INFRA-005
**Traced to**: Decision 7 (fail gracefully), Section II.4, Section IV.7 (error communication)

---

## D. BOT INTEGRATION REQUIREMENTS

### REQ-BOT-001: Automatic GitHub Comment on Issue
**Description**: Bot posts response comment on GitHub issue within 30 seconds of intake request received.

**Acceptance Criteria**:
- Comment posted via GitHub API to source issue
- Response time <30 seconds for 95% of requests (Success Metrics)
- Comment includes: PRD link, detected priority, estimated ship time, override instructions
- Comment formatted as readable markdown
- Includes "how to override if needed" instructions (Decision 5)

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-003, REQ-PRD-001, REQ-ANALYSIS-001
**Traced to**: Decision 6 (immediate visible feedback), Section II.4, Success Metrics

---

### REQ-BOT-002: Priority Detection Feedback in Comment
**Description**: Bot comment clearly states detected priority and reasoning for detection.

**Acceptance Criteria**:
- Comment includes detected priority: "Priority: p0/p1/p2"
- Explains reasoning: "Detected production bug → p0"
- Shows confidence score if appropriate
- Explains how to override (labels or comment syntax, if implemented)

**Priority**: Must-Have
**Dependencies**: REQ-ANALYSIS-001, REQ-BOT-001
**Traced to**: Decision 6 (visible feedback), Section II.4

---

### REQ-BOT-003: PRD Link in Comment
**Description**: Bot comment includes accessible link to generated PRD.

**Acceptance Criteria**:
- Comment contains clickable markdown link to PRD
- PRD URL resolves to dashboard view (REQ-DASHBOARD-001)
- URL includes prd_id or issue_id for lookup
- Link text is descriptive: "[View PRD](url)" or similar

**Priority**: Must-Have
**Dependencies**: REQ-PRD-001, REQ-BOT-001
**Traced to**: Decision 2 (PRD linked back), Section II.4

---

### REQ-BOT-004: Error Communication via Comment
**Description**: When errors occur, bot comments with user-friendly error message and expectation setting.

**Acceptance Criteria**:
- If PRD generation fails: "I couldn't generate a full PRD, but I've logged your request. You'll hear from the team within 24 hours."
- Error message acknowledges system understood the request
- Provides next steps or timeline
- Never exposes internal error details to user

**Priority**: Must-Have
**Dependencies**: REQ-BOT-001, REQ-INFRA-005
**Traced to**: Decision 7 (never block user), Section IV.7 (error communication)

---

### REQ-BOT-005: Rate Limit Handling for Comments
**Description**: Bot manages API rate limits to avoid triggering GitHub's spam detection.

**Acceptance Criteria**:
- Comments queued if rate limit approaching
- Implements human-like delays (random 1-3 sec between comments)
- Retries queued comments with exponential backoff
- Monitors for bot account suspension risk
- Logs all rate limit events

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-003, REQ-BOT-001
**Traced to**: Risk Register #5 (Bot Account Suspension)

---

### REQ-BOT-006: Comment Template & Message Formatting
**Description**: Standardized comment templates ensure consistent, clear communication.

**Acceptance Criteria**:
- Template includes: greeting, priority statement, PRD link, next steps, override instructions
- Message tone is professional yet friendly
- Markdown formatting tested for readability
- Template parameterized for: priority, issue_title, prd_id, confidence_score

**Priority**: Must-Have
**Dependencies**: REQ-BOT-001
**Traced to**: Section III (bot-comment.ts, templates.ts)

---

## E. DASHBOARD REQUIREMENTS

### REQ-DASHBOARD-001: Read-Only Intake Request View
**Description**: Provide simple, read-only dashboard to view all intake requests processed.

**Acceptance Criteria**:
- Displays list of all intake_requests with columns: issue_id, title, priority, status, created_at
- Pulls data directly from Postgres intake_requests table
- No editing capabilities (read-only)
- Refreshes on page load (no real-time updates required for v1)
- Accessible to internal team members

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-002
**Traced to**: Section II.5 (Basic Dashboard), Section III (routes.ts, queries.ts)

---

### REQ-DASHBOARD-002: Filter by Priority
**Description**: Dashboard users can filter intake requests by priority level.

**Acceptance Criteria**:
- Filter options: p0, p1, p2, All
- Clicking filter updates query: WHERE priority = $1
- Results update immediately on client
- Filter state preserved on page (URL param or session)
- Count of results shown per filter

**Priority**: Must-Have
**Dependencies**: REQ-DASHBOARD-001
**Traced to**: Section II.5 (filter by priority)

---

### REQ-DASHBOARD-003: PRD Status Visibility
**Description**: Dashboard shows current status of each intake request's PRD.

**Acceptance Criteria**:
- Status column displays: pending, in_progress, completed, failed
- Status matches database intake_requests.status field
- Failed status includes error summary (first 100 chars of error_log)
- Clickable status to see full error details (if available)

**Priority**: Must-Have
**Dependencies**: REQ-DASHBOARD-001, REQ-INFRA-002
**Traced to**: Section II.5 (PRD status)

---

### REQ-DASHBOARD-004: PRD Link from Dashboard
**Description**: Dashboard provides clickable link to view full PRD content.

**Acceptance Criteria**:
- PRD link column shows "[View PRD]" for completed requests
- Link resolves to details page showing full prd_content JSON rendered as readable text
- Details page shows source GitHub issue link
- Details page shows all metadata: requested_by, detected_type, confidence_score

**Priority**: Must-Have
**Dependencies**: REQ-PRD-001, REQ-DASHBOARD-001
**Traced to**: Section II.5

---

### REQ-DASHBOARD-005: Dashboard Access Control
**Description**: Dashboard access limited to internal team members using existing GitHub authentication.

**Acceptance Criteria**:
- Uses existing Shipyard authentication mechanism
- Only authenticated team members can view dashboard
- No external access to intake data

**Priority**: Nice-to-Have
**Dependencies**: REQ-DASHBOARD-001
**Traced to**: Section IV.8 (Dashboard access control)

---

## F. ERROR HANDLING & RESILIENCE REQUIREMENTS

### REQ-ERROR-001: Webhook Reception Retry Strategy
**Description**: Handle GitHub webhook delivery failures gracefully with retry logic.

**Acceptance Criteria**:
- If webhook endpoint unavailable: GitHub retries per their default policy (documented)
- System implements queuing for failed webhook events
- Retries attempted up to 3 times with exponential backoff (1s, 2s, 4s)
- Successfully processed webhooks never reprocessed (idempotency via github_issue_id)
- **Idempotency key = hash(issue_id, webhook_event_id) stored for 24 hours**

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-001, REQ-INFRA-005
**Traced to**: Section IV.1 (Webhook Delivery Reliability), Decision 7

---

### REQ-ERROR-002: Database Outage Handling
**Description**: If Postgres unavailable during intake, still notify user and queue for retry.

**Acceptance Criteria**:
- Catches database connection errors gracefully
- Still comments on GitHub issue: "I've received your request but hit a hiccup. It's queued for processing."
- Retries database save operation up to 3 times
- Logs database error with context (connection string obfuscated)
- Never crashes the webhook handler

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-002, REQ-BOT-001, REQ-INFRA-005
**Traced to**: Risk Register #4 (Postgres Outage), Decision 7

---

### REQ-ERROR-003: Ambiguous Content Handling
**Description**: When issue content is too vague to classify, default to safe option and ask for clarification.

**Acceptance Criteria**:
- If priority unclear (confidence_score <0.7): default to p2
- Comment asks: "Could you provide more details about the urgency/impact?"
- If description empty or too short: request more context in comment
- Still create intake record with all available data
- Stores confidence_score so team can review uncertain requests

**Priority**: Must-Have
**Dependencies**: REQ-ANALYSIS-001, REQ-BOT-002, REQ-ANALYSIS-002
**Traced to**: Risk Register #2, Section IV.5 (Default to p2)

---

### REQ-ERROR-004: Invalid Issue Format Handling
**Description**: Gracefully handle edge cases in issue structure without blocking intake.

**Acceptance Criteria**:
- Empty body → logs warning, stores as empty description
- Only emoji → logs edge case, stores raw_content, continues processing
- Links instead of text → extracts and processes text content
- Malformed title → still processes, logs warning
- All edge cases logged with issue_id for manual review

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-004, REQ-INFRA-005
**Traced to**: Risk Register #9 (Edge Cases)

---

### REQ-ERROR-005: Slow Processing Acknowledgment
**Description**: If PRD generation will take >30 seconds, send immediate ack to avoid user anxiety.

**Acceptance Criteria**:
- Initial comment posted within 5 seconds: "Processing your request... will update with PRD link soon"
- Final comment with PRD posted when generation completes
- Both comments linked via thread/edit to show status progression

**Priority**: Nice-to-Have
**Dependencies**: REQ-BOT-001, REQ-PRD-001
**Traced to**: Risk Register #10 (Slow PRD Generation), Decision 6

---

## G. TESTING REQUIREMENTS

### REQ-TEST-001: Webhook Handler Unit Tests
**Description**: Unit tests for webhook reception, signature validation, and event parsing.

**Acceptance Criteria**:
- Test valid webhook signature acceptance
- Test invalid signature rejection
- Test event parser extraction accuracy
- Test label filtering (only process issues with `intake-request` label)
- Test edge case: missing fields, null values, empty body
- Minimum 80% code coverage for webhook module

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-001, REQ-INFRA-004
**Traced to**: Section III (webhook.test.ts), Risk Register #3

---

### REQ-TEST-002: Content Analysis Unit Tests
**Description**: Unit tests for priority detection, classification, and extraction logic.

**Acceptance Criteria**:
- Test priority detection: p0 keywords (production + bug, emergency, urgent)
- Test priority detection: p1 keywords (standard feature)
- Test priority detection: p2 keywords (nice-to-have, would be nice)
- Test type classification: bug_fix, feature, enhancement, documentation
- Test confidence score generation and accuracy
- Minimum 80% code coverage for analyzer module

**Priority**: Must-Have
**Dependencies**: REQ-ANALYSIS-001, REQ-ANALYSIS-002, REQ-ANALYSIS-004
**Traced to**: Section III (analyzer.test.ts)

---

### REQ-TEST-003: PRD Generation Unit Tests
**Description**: Unit tests for PRD template generation and storage.

**Acceptance Criteria**:
- Test PRD structure: contains all required sections
- Test JSONB serialization/deserialization
- Test template with various input scenarios
- Test graceful handling of missing fields (defaults applied)
- Test unique PRD ID generation
- Minimum 80% code coverage for prd module

**Priority**: Must-Have
**Dependencies**: REQ-PRD-001, REQ-PRD-002, REQ-PRD-003
**Traced to**: Section III (prd generation tests)

---

### REQ-TEST-004: Integration Test: Issue → PRD → Comment
**Description**: End-to-end integration test simulating full intake flow.

**Acceptance Criteria**:
- Mock GitHub webhook event for issue creation
- System processes event through: parsing → analysis → PRD generation → comment posting
- Verify intake_requests record created with correct fields
- Verify PRD stored in prd_content field
- Verify comment posted to GitHub with PRD link
- Test with 5+ realistic issue scenarios
- Response time verified to be <30 seconds

**Priority**: Must-Have
**Dependencies**: REQ-INFRA-001, REQ-ANALYSIS-001, REQ-PRD-001, REQ-BOT-001, REQ-INFRA-005
**Traced to**: Section III (integration.test.ts), Success Metrics

---

### REQ-TEST-005: Error Scenario Integration Tests
**Description**: Integration tests for error paths and graceful degradation.

**Acceptance Criteria**:
- Test GitHub API rate limit scenario: queuing and retry behavior
- Test Postgres connection failure: graceful degradation
- Test PRD generation failure: basic PRD created, error comment posted
- Test invalid webhook signature: rejected without processing
- Test malformed issue content: edge case logged, continues processing
- Verify no requests lost in failure scenarios

**Priority**: Must-Have
**Dependencies**: REQ-ERROR-001, REQ-ERROR-002, REQ-ERROR-003, REQ-ERROR-004
**Traced to**: Risk Register scenarios, Section VII.1

---

### REQ-TEST-006: Dashboard View Tests
**Description**: UI/functional tests for dashboard views and interactions.

**Acceptance Criteria**:
- Test dashboard loads and displays all intake requests
- Test filter by priority: each filter returns correct results
- Test PRD link navigation to details view
- Test status column displays correctly (pending/in_progress/completed/failed)
- Test error summary display for failed requests
- Verify no unfiltered data exposed to unauthorized users

**Priority**: Nice-to-Have
**Dependencies**: REQ-DASHBOARD-001, REQ-DASHBOARD-002, REQ-DASHBOARD-003, REQ-DASHBOARD-005
**Traced to**: Section III

---

## Requirements Summary

| Category | Must-Have | Nice-to-Have | Total |
|----------|-----------|--------------|-------|
| Infrastructure | 5 | 0 | 5 |
| Content Analysis | 3 | 1 | 4 |
| PRD Generation | 4 | 0 | 4 |
| Bot Integration | 6 | 0 | 6 |
| Dashboard | 4 | 1 | 5 |
| Error Handling | 4 | 1 | 5 |
| Testing | 5 | 1 | 6 |
| **TOTAL** | **31** | **4** | **35** |

---

## Success Metrics (from decisions.md Section VI)

### Launch Week Targets (Friday → Next Friday)
- **10+ intake requests processed** without manual intervention
- **<30 second bot response time** on 95% of issues
- **<5% error rate** (successful PRD generation)
- **Zero manual PRD creation** for intake-labeled issues
- **Positive user feedback** from Seth and team

### V2 Expansion Criteria
- If we hit 50+ requests/week → build analytics dashboard
- If error rate >10% → invest in better NLP
- If users ask for features 3+ times → prioritize for v2

---

## Out of Scope for v1 (Explicitly Deferred)

- Web forms or configuration UI
- Custom label handling (beyond `intake-request`)
- Multi-repo support (hardcode single repo for v1)
- Slack notifications
- Advanced NLP for requirement extraction
- Auto-assignment to engineers
- Integration with project management tools
- Analytics dashboard
- Beautiful animations and microcopy debates
- Email marketing integrations

---

## Technical Constraints

1. **Tech Stack**: Postgres + GitHub API only (no new infrastructure)
2. **Detection Algorithm**: Hardcoded keyword rules (no ML for v1)
3. **Single Table**: One Postgres table (`intake_requests`) for all data
4. **No Extensibility Framework**: Hardcoded rules, add sophistication in v2
5. **Response Time**: <30 seconds for bot comment (95% SLA)

---

## Key Architectural Decisions (Traced to decisions.md)

1. **GitHub Issues as Interface** (Decision 1) - No forms, use labels/comments
2. **Zero-Click Default Path** (Decision 2) - Automatic priority/routing
3. **Ship This Week** (Decision 3) - Friday EOD launch, iterate forever
4. **Postgres + GitHub Only** (Decision 4) - No Airtable, no third-party services
5. **Intelligent Defaults** (Decision 5) - System infers, user overrides if needed
6. **Immediate Feedback** (Decision 6) - Bot comments within 30 seconds
7. **Fail Gracefully** (Decision 7) - Never block user, optimistic processing

---

**Status**: Requirements locked for Phase 1 build
**Next Step**: Generate task plan with dependency-aware execution waves
