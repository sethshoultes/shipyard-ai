# Homeport/Aftercare: Atomic Requirements Document

**Project:** Homeport (customer-facing) / Aftercare (internal codebase)
**Compiled by:** Requirements Analyst
**Source Documents:** shipyard-post-ship-lifecycle.md (PRD) + decisions.md
**Status:** Board Approved — PROCEED WITH CONDITIONS
**Timeline:** MVP 48-72 hours from build start

---

## Functional Requirements

### FR-001: Send Day 7 Email to Shipped Projects
- **Description:** Automatically send "Your Site is Live" email to customer 7 days after ship_date
- **Source:** PRD "Day 7: Your Site is Live", decisions.md 1.3, Definition of Done
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Email sent exactly 7 days post-deployment
  - Email includes: site URL, admin link, documentation reference, feedback invitation
  - Plain text format only (no HTML)
  - Uses merge tags for personalization: {customer_name}, {project_name}, {site_url}
- **Verification:** Cron execution logs + test email send to internal team
- **Voice:** "Your site is breathing on its own now" (Day 7 template locked by Steve Jobs)

### FR-002: Send Day 30 Email to Shipped Projects
- **Description:** Automatically send 30-day health check email to customer 30 days after ship_date
- **Source:** PRD "Day 30: 30-Day Health Report", decisions.md 1.3, Design Review (Maya Angelou feedback)
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Email sent exactly 30 days post-deployment
  - Subject line: "Does it feel like yours yet?" (Maya Angelou revision)
  - Includes: check-in message, revision request CTA, customer testimonial space
  - Plain text format only
  - No performance metrics in V1 (marked as out of scope per decisions.md)
- **Verification:** Cron execution logs + Resend dashboard shows sent count
- **Voice:** "It's been 30 days. Your site is holding up beautifully." (locked tone)

### FR-003: Send Day 90 Email to Shipped Projects
- **Description:** Automatically send quarterly check-in email 90 days after ship_date
- **Source:** PRD "Day 90: Quarterly Check-In", decisions.md 1.3
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Email sent exactly 90 days post-deployment
  - Includes: position differentiation ("Most agencies disappear around now"), update scheduling CTA
  - Plain text format only
  - No case studies or industry trends in V1 (out of scope per decisions.md)
- **Verification:** Cron execution logs + Resend delivery confirmation
- **Voice:** "We're still here (most agencies aren't)" (locked tone, slight edge accepted)

### FR-004: Send Day 180 Email to Shipped Projects
- **Description:** Automatically send 6-month review email 180 days after ship_date
- **Source:** PRD "Day 180: 6-Month Review", decisions.md 1.3, Retrospective feedback
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Email sent exactly 180 days post-deployment
  - Includes: web standards changes summary, "Is your site still meeting needs?" prompt, special offer for returning customers
  - Plain text format only
  - Subject line revision: "That's what changes everything" (updated from "That's gold" per Maya Angelou)
- **Verification:** Cron execution logs + Resend dashboard
- **Voice:** Tone locked by Steve Jobs (original voice guidelines apply)

### FR-005: Send Day 365 Email to Shipped Projects
- **Description:** Automatically send 1-year anniversary email 365 days after ship_date
- **Source:** PRD "Day 365: Happy Anniversary", decisions.md 1.3
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Email sent exactly 365 days post-deployment
  - Includes: 1-year milestone celebration, year-over-year web industry changes, "Time for a refresh?" CTA with returning customer pricing
  - Plain text format only
  - Removed condescending line per Maya Angelou: ~~"The entire industry took steps you might not have noticed"~~ → "A year moves faster than you think"
- **Verification:** Cron execution logs + Resend delivery confirmation
- **Voice:** Celebration tone (locked by Steve Jobs)

### FR-006: Daily Scheduler Executes Cron Job
- **Description:** Cloudflare Worker runs daily cron job to identify and send due lifecycle emails
- **Source:** PRD Technical Requirements "Scheduling Worker", decisions.md 1.2, 1.8
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Runs daily (scheduled via Cloudflare cron trigger)
  - Queries KV store for all shipped projects
  - Calculates which lifecycle emails are due (Day 7, 30, 90, 180, 365)
  - Sends appropriate email via Resend API for each due project
  - Updates KV record with sentAt timestamp after successful send
  - Handles duplicate prevention (idempotent via unique scheduleId check)
- **Technical Constraints:** ~300 lines TypeScript maximum (Elon Musk's hard cap)
- **Verification:** Worker logs + KV store state changes + Resend API call logs

### FR-007: Store Shipped Project Metadata in KV Store
- **Description:** Persist shipped project data (customer info, site URL, ship date) in Cloudflare KV
- **Source:** PRD Data Model, decisions.md 1.2, 3
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Store key format: `project:{project_id}`
  - Store required fields: {email, name, project_url, ship_date}
  - Store lifecycle email status: {day7: {sent, sentAt}, day30: {sent, sentAt}, day90: {sent, sentAt}, day180: {sent, sentAt}, day365: {sent, sentAt}}
  - Support unsubscribe flag: `unsubscribed:{email}` → `true`
  - Minimal schema (no complex relationships)
- **Verification:** KV store query returns correctly structured data

### FR-008: Accept CSV Upload of Shipped Projects
- **Description:** Accept manual CSV file upload to populate KV store with shipped project data
- **Source:** PRD MVP "Manual entry of shipped projects", decisions.md 2, 6.1
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Build CSV-to-KV upload script
  - Accept CSV with columns: project_id, customer_email, customer_name, project_url, ship_date
  - Parse dates correctly (ship_date format: YYYY-MM-DD)
  - Validate email addresses before storing
  - Idempotent uploads (re-running same CSV doesn't duplicate records)
  - Minimum viable: support ≥10 shipped projects for MVP launch
- **Verification:** Manual CSV upload + KV store query confirms correct data population

### FR-009: One-Click Unsubscribe Mechanism
- **Description:** Allow customers to opt out of lifecycle emails via email link
- **Source:** PRD "Unsubscribe handling (CAN-SPAM compliance)", decisions.md 4, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Include unsubscribe link in every lifecycle email
  - Link format: `homeport.shipyard.ai/unsub?token={email_hash}` (corrected from aftercare.shipyard.ai per decision 6.2)
  - Clicking link sets `unsubscribed:{email}` flag in KV
  - Display confirmation page after unsubscribe
  - Future sends skip customers with unsubscribed flag
  - CAN-SPAM legally compliant (all emails include opt-out)
  - Kill switch trigger: >15% unsubscribe rate in first week (pause sends, review copy)
- **Verification:** Click unsubscribe link → confirm KV flag set → confirm no emails sent to that address

### FR-010: Reply Handling via homeport@shipyard.ai
- **Description:** Receive and forward customer replies from lifecycle emails to team
- **Source:** decisions.md 2, 6.3, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Set Reply-To header on all lifecycle emails to `homeport@shipyard.ai`
  - Phil Jackson (or assigned owner) monitors inbox personally
  - Respond to customer replies within <24h SLA
  - Track reply count as primary success metric
  - No auto-reply (defeats purpose of personal relationship)
  - If reply rate >10%, escalate to team-based workflow (V1.1 decision)
- **Verification:** Customer receives confirmation that email was sent from homeport@shipyard.ai, reply goes to correct inbox

### FR-011: Email Personalization with Template Merge Tags
- **Description:** Dynamically populate email templates with customer and project data
- **Source:** PRD Data Model, decisions.md 1.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Templates use merge tags: {customer_name}, {project_name}, {site_url}
  - Tags replaced at send time with values from KV store
  - Graceful fallback if data missing (skip field or use generic)
  - No rendering errors due to special characters in customer names
- **Verification:** Send test email with various customer name formats, verify correct personalization

### FR-012: Email Delivery via Resend API
- **Description:** Send lifecycle emails through Resend transactional email service
- **Source:** PRD Technical Requirements "Transactional email service", decisions.md 1.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Integrate Resend API for email delivery
  - Use authenticated domain: `homeport@shipyard.ai` (locked per decision 6.2, config-decisions.md)
  - Implement proper error handling for API failures
  - Log all sends to Resend for tracking
  - Single failure mode: Resend API unavailable (acceptable per decisions.md 1.2)
  - Plain text email format (no MIME multipart, no HTML)
- **Verification:** Resend dashboard shows emails delivered + no bounces on test batch

---

## Non-Functional Requirements

### NFR-001: Email Deliverability & Spam Avoidance
- **Description:** Ensure lifecycle emails reach customer inboxes (not spam folder)
- **Source:** PRD Risks & Mitigations "Emails marked as spam", decisions.md 1.4, 7.1
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Plain text format (no HTML, images, or screenshots)
  - Proper SPF/DKIM/DMARC setup for `homeport.shipyard.ai` domain
  - Run Mail-Tester validation before ship (target: 9-10/10 score)
  - Warm up domain before full send (test with 5 emails first)
  - No spam trigger words: "solution," "leverage," "ecosystem," "digital presence," "maximize"
  - Review email content for spam keywords
- **Verification:** Mail-Tester score ≥9/10, all test emails land in Primary inbox, no spam complaints post-launch

### NFR-002: Voice Consistency Across All Templates
- **Description:** Maintain "Trusted Mechanic" tone across all 5 lifecycle emails
- **Source:** decisions.md 1.5, 13 (Voice Lock), Design Review (Jony Ive + Maya Angelou)
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - All emails pass "Would I send this to a friend?" test (Steve's voice test)
  - No corporate language: no "solutions," "leverage," "ecosystem," "digital presence"
  - No fake casual: no emoji, no "lol," no "hey there!"
  - Consistent confidence: "We know what we built. We stand behind it."
  - Tone: confident, competent, human, caring
  - Templates locked after V1 launch (no changes for 90 days per decision 1.9)
  - Voice rules documented in README for future reference
- **Verification:** Voice review by Steve Jobs + design review team (Jony Ive, Maya Angelou), pass "automation smell" test

### NFR-003: System Simplicity & Debuggability
- **Description:** Keep system minimal, maintainable, and easy to troubleshoot
- **Source:** decisions.md 1.2, 1.8, 14 (Speed Lock)
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Codebase: ~300 lines TypeScript maximum (Elon Musk's hard cap)
  - Single architectural pattern: Cloudflare Workers + KV + Resend
  - No external databases, no complex schema
  - Debuggable in <60 seconds (clear error messages, simple logic flow)
  - Fully deletable in 5 minutes if experiment fails (no persistent schema, no dependencies)
  - No infrastructure maintenance beyond Worker + KV deployment
- **Verification:** Code review confirms <300 LOC, single developer can debug in <1 minute

### NFR-004: 48-72 Hour Build Timeline Adherence
- **Description:** Complete MVP from code commit to production within 48-72 hours
- **Source:** decisions.md 1.8, 14, Timeline
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Day 0: Pre-build prep (data audit, email drafts, Resend setup)
  - Day 1: Core Worker built, tests written, staging deployment
  - Day 2: Production deployment, KV population, go-live approval
  - If build exceeds 72h: revisit spec (indicates scope is wrong)
  - Project manager (Phil) has veto authority on scope creep
- **Verification:** Git commit timestamp + production deployment timestamp = <72h elapsed

### NFR-005: 90-Day Feature Freeze
- **Description:** Do not modify code or templates after MVP launch for 90 days
- **Source:** decisions.md 1.9, essence.md, Retrospective
- **Priority:** P0
- **Phase:** MVP + Measurement
- **Acceptance Criteria:**
  - No feature additions for 90 days post-launch
  - Only exceptions: critical spam/technical breaks (fix immediately)
  - Allow one full lifecycle to complete (365 days) before major changes
  - Review outcomes (data) before next round of changes, not intentions
  - Templates remain locked (no edits to voice, subject lines, or CTAs)
- **Verification:** No commits to worker code or email templates for 90 days post-launch (except bug fixes)

---

## Technical Requirements

### TR-001: Cloudflare Workers Runtime Environment
- **Description:** Deploy lifecycle email scheduler as a Cloudflare Worker
- **Source:** PRD Technical Requirements, decisions.md 1.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Use Cloudflare Workers runtime (TypeScript)
  - Bind to KV store namespace (for project data)
  - Bind to Resend API credentials
  - Implement scheduled cron trigger (daily)
  - Handle timeouts gracefully (Workers has 30s execution limit)
  - No external HTTP calls beyond Resend API
- **Technical Constraints:** Workers CPU + memory limits (typical <10ms execution per record)
- **Verification:** Worker deployed + cron job executes daily + logs show execution

### TR-002: Worker Cron Scheduling
- **Description:** Configure daily cron job to trigger email scheduler
- **Source:** decisions.md 1.2, Timeline
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Configure cron trigger in wrangler.toml: `cron = "0 8 * * *"` (8 AM UTC daily, adjust TZ as needed)
  - Cron job runs daily without manual intervention
  - Idempotent execution (safe to run multiple times on same day)
  - Resend rate-limit awareness (batch sends if >500 emails/day)
  - Log execution results (emails sent count, failures)
- **Verification:** Cron job executed daily for 7 days, cron logs confirm success

### TR-003: KV Store Configuration
- **Description:** Set up Cloudflare KV namespace for project data persistence
- **Source:** decisions.md 1.2, 3, Data Model
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create KV namespace: `aftercare-projects`
  - Set TTL on project records (optional, for eventual cleanup after 400+ days)
  - Support key format: `project:{project_id}`, `unsubscribed:{email}`
  - All reads/writes include error handling
  - Size estimate: ~1KB per project record, assume 100 projects = 100KB total (well under KV limits)
- **Verification:** KV namespace created + test key-value pair stored/retrieved successfully

### TR-004: Resend API Integration
- **Description:** Integrate Resend transactional email API for email delivery
- **Source:** PRD Technical Requirements, decisions.md 1.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create Resend account + API key
  - Authenticate from Worker using API key (stored in wrangler secrets)
  - Implement email sending function: sendEmail(to, subject, body, from)
  - Handle Resend API errors gracefully (retry logic, error logging)
  - Verify domain authentication (SPF/DKIM/DMARC) for `homeport@shipyard.ai`
  - Plain text email support (no HTML rendering required)
  - Rate limit handling (Resend supports 100+ emails/sec, no bottleneck expected)
- **Verification:** Test email sent via Resend API from Worker, appears in inbox within 60s

### TR-005: Email Template Rendering
- **Description:** Render 5 lifecycle email templates with dynamic personalization
- **Source:** decisions.md 2, 3, Design Review
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Store 5 email templates as TypeScript functions or text files
  - Template locations: `/worker/emails.ts` or `/templates/day-*.txt`
  - Implement template functions: day7(), day30(), day90(), day180(), day365()
  - Each function accepts: {customerName, projectName, siteUrl, shipDate}
  - Return: {subject, body} (plain text)
  - No templating engine required (simple string replacement acceptable)
  - Support merge tags: {customer_name}, {project_name}, {site_url}
- **Verification:** Template render test: day7({...}) returns correct subject + body with personalization

### TR-006: CSV-to-KV Data Import Script
- **Description:** Build script to parse CSV and populate KV store with project data
- **Source:** decisions.md 2, 6.1, MVP "Manual entry"
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create TypeScript script: `/scripts/csv-to-kv.ts`
  - Parse CSV with columns: project_id, customer_email, customer_name, project_url, ship_date
  - Validate: email format, date format (YYYY-MM-DD), non-empty fields
  - Batch upload to KV (use Wrangler API or custom upload)
  - Idempotent: running same CSV twice doesn't duplicate records
  - Support minimum 10 projects for MVP launch
  - Error reporting: log validation errors (invalid emails, dates) for manual review
- **Verification:** Import test CSV with 10 valid projects, query KV confirms all stored correctly

### TR-007: Unsubscribe Link Handling
- **Description:** Implement HTTP endpoint to process unsubscribe requests
- **Source:** decisions.md 4, 6.4, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create Worker route: `GET /unsub?token={email_hash}`
  - Extract email from token (hash-based, simple approach acceptable for MVP)
  - Set KV flag: `unsubscribed:{email}` → `true`
  - Return HTML confirmation page: "You've been unsubscribed"
  - Future scheduler checks flag before sending
  - No authentication required (email token acts as confirmation)
  - Support one-click unsubscribe (no form submission)
- **Verification:** Click unsubscribe link in email, receive confirmation page, future emails not sent to that email

### TR-008: TypeScript/Node.js Project Setup
- **Description:** Initialize TypeScript project with build tooling for Workers
- **Source:** decisions.md 1.2, 3
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create `package.json` with dependencies: wrangler, typescript, vitest/jest (for tests)
  - Create `tsconfig.json` for TypeScript compilation
  - Create `wrangler.toml` for Cloudflare Worker configuration
  - Implement build process: `npm run build`
  - Implement test process: `npm test`
  - Implement deploy process: `npm run deploy`
  - Support local development: `wrangler dev`
- **Verification:** `npm run build` succeeds, Worker deploys to production via `npm run deploy`

### TR-009: Test Suite for Core Logic
- **Description:** Unit tests for email rendering and scheduler logic
- **Source:** decisions.md 3, Definition of Done
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Test file: `/tests/emails.test.ts` — verify template rendering with merge tags
  - Test file: `/tests/scheduler.test.ts` — verify which emails are due for given ship_dates
  - Test data: mock KV store with 10 test projects at various lifecycle stages
  - Minimum test coverage: email rendering logic + scheduler date calculation
  - Tests runnable via `npm test`
  - All tests pass before production deployment
- **Verification:** `npm test` runs successfully, all tests pass, test output shows coverage

### TR-010: Worker Entry Point & Request Routing
- **Description:** Main Worker handler to route requests to appropriate handlers
- **Source:** decisions.md 3
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Create `/worker/index.ts` — main entry point
  - Implement fetch handler: route requests based on method + path
  - Support routes:
    - `POST /cron` — trigger daily scheduler (called by Cloudflare cron)
    - `GET /unsub?token={email}` — handle unsubscribe requests
  - Return JSON responses for API routes
  - Handle 404s gracefully
- **Verification:** HTTP requests to all routes return expected responses

### TR-011: Error Handling & Logging
- **Description:** Graceful error handling with structured logging
- **Source:** decisions.md 1.2, 14, Risk 7.1
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Catch and log all errors (KV failures, Resend API failures, validation errors)
  - Log format: JSON (compatible with Cloudflare logging)
  - Log fields: timestamp, error, context (which email, which project)
  - Resend API failures: log and skip project (don't crash scheduler)
  - KV failures: log and alert (may indicate broader infrastructure issue)
  - No sensitive data in logs (no API keys, no customer emails in debug output)
- **Verification:** Trigger intentional error (bad Resend key), confirm graceful handling + logged

### TR-012: Secrets Management (API Keys)
- **Description:** Securely store and use Resend API key in Worker
- **Source:** decisions.md 1.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Use Wrangler secrets for Resend API key: `wrangler secret put RESEND_API_KEY`
  - API key never committed to git or hardcoded
  - Worker accesses key via `env.RESEND_API_KEY`
  - Support local development (use `.env` file for wrangler dev)
  - Document secret setup in README
- **Verification:** Deploy Worker without API key in code, confirm Resend calls succeed

---

## Data Requirements

### DR-001: Shipped Project Data Model
- **Description:** Store minimal customer + project metadata required for lifecycle emails
- **Source:** PRD Data Model, decisions.md 3, 6.1
- **Priority:** P0
- **Phase:** MVP
- **Data Structure:**
  ```typescript
  interface ShippedProject {
    id: string;
    customerEmail: string;
    customerName: string;
    projectName: string;
    siteUrl: string;
    shippedAt: Date; // ISO format: 2024-01-15T00:00:00Z
    projectType?: 'site' | 'theme' | 'plugin'; // optional for V1
    lifecycleEmails: {
      day7: { sent: boolean; sentAt?: string };
      day30: { sent: boolean; sentAt?: string };
      day90: { sent: boolean; sentAt?: string };
      day180: { sent: boolean; sentAt?: string };
      day365: { sent: boolean; sentAt?: string };
    };
    unsubscribed?: boolean;
  }
  ```
- **Storage:** KV store (key: `project:{project_id}`, value: JSON serialized ShippedProject)
- **Acceptance Criteria:**
  - Minimum fields required: id, customerEmail, customerName, projectName, siteUrl, shippedAt
  - lifecycleEmails object tracks send status for each milestone
  - unsubscribed flag prevents future sends
  - Data persistence: ≥90 days (until all 5 emails sent + measurement period complete)
  - No PII beyond customer email + name (no passwords, auth tokens, payment info)

### DR-002: CSV Import Schema
- **Description:** Define CSV structure for bulk project data upload
- **Source:** decisions.md 6.1, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Schema:**
  ```csv
  project_id,customer_email,customer_name,project_url,ship_date
  proj_001,customer@example.com,Jane Doe,https://example.com,2024-01-15
  proj_002,user@company.com,John Smith,https://company.com,2024-01-20
  ```
- **Field Requirements:**
  - project_id: unique identifier (string, no spaces)
  - customer_email: valid email format (regex validation)
  - customer_name: free text (max 100 chars)
  - project_url: valid HTTP/HTTPS URL
  - ship_date: ISO date format (YYYY-MM-DD)
- **Validation Rules:**
  - Reject rows with invalid email format
  - Reject rows with invalid date format
  - Reject rows with missing required fields
  - Warn on duplicate project_id (skip duplicate)
- **Sample Valid Data:** Min 10 shipped projects for MVP launch

### DR-003: Unsubscribe Data Storage
- **Description:** Track customer opt-outs to prevent future sends
- **Source:** decisions.md 4, 6.4
- **Priority:** P0
- **Phase:** MVP
- **Storage Structure:**
  - KV key: `unsubscribed:{email}` (email address as part of key for quick lookup)
  - KV value: `true` (boolean flag)
  - TTL: no expiration (once unsubscribed, always unsubscribed)
  - Lookup logic: before sending to {email}, check if `unsubscribed:{email}` exists in KV
- **Acceptance Criteria:**
  - One-click unsubscribe creates flag in KV
  - Scheduler checks flag before sending (O(1) lookup)
  - No emails sent to unsubscribed addresses
  - Flag persists across Worker restarts

### DR-004: Email Send Audit Trail
- **Description:** Maintain immutable log of all email sends (via Resend API + KV)
- **Source:** PRD Definition of Done, decisions.md
- **Priority:** P1
- **Phase:** MVP
- **Data Captured:**
  - project_id
  - recipient_email
  - email_type (day7, day30, day90, day180, day365)
  - sent_timestamp
  - resend_message_id (for open/click tracking)
  - send_status (success / failed)
  - failure_reason (if failed)
- **Storage:**
  - Primary: Resend API dashboard (provides analytics)
  - Secondary: Update KV record `project:{project_id}` with sentAt timestamp
  - No separate log storage required for MVP (Resend provides analytics)
- **Acceptance Criteria:**
  - Every successful send logged with timestamp
  - Message IDs from Resend stored for tracking
  - KV record updated after send attempt (success or failure)

### DR-005: Resend Analytics Integration
- **Description:** Use Resend's built-in analytics for email performance tracking
- **Source:** decisions.md 1.7, 1.6
- **Priority:** P1
- **Phase:** MVP + Measurement
- **Metrics Tracked (via Resend dashboard):**
  - Total emails sent (by day/type)
  - Open rate (% who opened)
  - Click rate (% who clicked revision CTA)
  - Bounce rate (undeliverable emails)
  - Unsubscribe rate (% who clicked unsub link)
- **Access:**
  - Use Resend dashboard (no custom dashboard built per decision 1.7)
  - No data export required for V1 (manual review of dashboard sufficient)
- **Measurement Period:** 90 days post-launch
- **Success Thresholds:**
  - Open rate: target 40-60%
  - Reply rate: target ≥10% (primary metric)
  - Unsubscribe rate: kill switch if >15%

---

## Quality Requirements

### QR-001: Email Rendering Accuracy
- **Description:** All lifecycle emails render correctly without errors or broken personalization
- **Source:** Definition of Done, Design Review
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - All 5 email templates render without syntax errors
  - Merge tags {customer_name}, {project_name}, {site_url} correctly replaced
  - Special characters in names (apostrophes, accents) handled gracefully
  - Email subject lines complete + visible (no truncation in client preview)
  - Email body text complete (no line break issues)
  - Plain text formatting (no weird spacing or control characters)
- **Test Coverage:** Render all 5 templates with 10+ test data variations, verify no rendering errors

### QR-002: Email Deliverability Score
- **Description:** Emails pass spam filters and reach inboxes
- **Source:** PRD Risks & Mitigations, decisions.md 1.4, NFR-001
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Mail-Tester score: ≥9/10 (before and after launch)
  - SPF/DKIM/DMARC authentication: ✓ (full validation)
  - Bounce rate: <1% (test batch of 10+ emails)
  - Spam complaint rate: 0% (no emails reported as spam in first week)
  - Domain reputation: clean (not blacklisted)
- **Test Process:**
  - Send 10 test emails to Mail-Tester, receive score + recommendations
  - Send test email to Gmail, Outlook, Yahoo (verify inbox placement)
  - Monitor first week post-launch for bounces/complaints

### QR-003: Voice Authenticity (No Automation Smell)
- **Description:** Emails feel handwritten + personal, not automated
- **Source:** decisions.md 1.5, 13, Design Review (Steve Jobs, Jony Ive, Maya Angelou)
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Pass "Would I send this to a friend?" test (Steve's voice test)
  - No corporate phrases: "solution," "leverage," "ecosystem," "digital presence," "maximize"
  - No fake casual: emoji, "lol," "hey there!" excluded
  - No upsell language: "10% off next project" or similar removed
  - Tone: confident, competent, human, caring
  - Each email sounds like one person speaking (not committee)
  - Design review pass: Jony Ive (craft) + Maya Angelou (voice) approve
- **Test Method:** Voice review panel (Steve, design reviewers) scores on 1-10 authenticity scale

### QR-004: Cron Scheduler Reliability
- **Description:** Daily scheduler runs on time and sends all due emails
- **Source:** TR-002, Risk 7.1
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Cron job executes daily (24h interval, no skips)
  - Emails sent on schedule (Day 7 ±0 days, Day 30 ±0 days, etc.)
  - All due emails sent in single cron execution (no partial batches)
  - Idempotent: re-running cron on same day doesn't send duplicates
  - Uptime: 99%+ (1 failure per 100 runs acceptable)
  - Execution time: <5 seconds per 100 projects
- **Test Coverage:** Run cron simulator for 365 days of project data, verify correct email send schedule

### QR-005: Unsubscribe Flow CAN-SPAM Compliance
- **Description:** One-click unsubscribe works + meets legal requirements
- **Source:** decisions.md 4, 6.4, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - Unsubscribe link present in every email
  - Link clickable (no broken URLs)
  - Unsubscribe executes immediately (no confirmation dialog)
  - Confirmation page displays (confirms opt-out successful)
  - Future sends respect unsubscribed status (no emails sent)
  - Legal: List-Unsubscribe header included in email (if supported by Resend)
  - Honoring opt-outs within 24 hours post-click (best practice)
- **Test Method:** Click unsubscribe link from each email type, confirm status change + future emails blocked

### QR-006: Data Accuracy & CSV Import Validation
- **Description:** Project data correctly parsed + stored without corruption
- **Source:** DR-002, Risk 7.2
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - CSV import validates all fields (email, date, URL format)
  - Rejects invalid rows (log errors for manual review)
  - Idempotent: importing same CSV twice doesn't duplicate records
  - All project data in KV matches source CSV exactly
  - Date parsing correct (no timezone issues, day 7 calculated from ISO date)
  - Special characters in names (accents, apostrophes) preserved correctly
- **Test Coverage:** Import test CSV with 10 valid + 5 invalid rows, verify correct behavior

### QR-007: Production Deployment Verification
- **Description:** MVP ready for customer-facing production use
- **Source:** Definition of Done
- **Priority:** P0
- **Phase:** MVP
- **Acceptance Criteria:**
  - All 5 email templates deployed + live (not staging)
  - KV store populated with ≥10 real shipped projects
  - Cron job active + scheduled for daily execution
  - Unsubscribe mechanism functional (tested end-to-end)
  - Resend dashboard shows sent emails
  - No errors in Cloudflare Worker logs
  - Domain authentication verified (SPF/DKIM/DMARC green)
  - Reply-To address monitored (Phil Jackson or assigned owner)
- **Sign-Off:** Phil Jackson (product) + Elon Musk (engineering) + Steve Jobs (voice)

---

## Constraints

### C-001: Codebase Size Limit
- **Description:** Keep Worker implementation to ~300 lines TypeScript
- **Source:** decisions.md 1.2, 1.8, 14
- **Type:** Hard constraint
- **Impact:** Forces ruthless simplicity (no over-engineering, no "nice-to-have" features)
- **How to Honor:** Single-purpose functions, minimal abstraction, no infrastructure patterns
- **Verification:** `wc -l /worker/*.ts` ≤ 300 (excluding comments + tests)

### C-002: Timeline: 48-72 Hours to Production
- **Description:** Ship MVP from code commit to live production within 72 hours
- **Source:** decisions.md 1.8, 14, Timeline
- **Type:** Hard constraint
- **Impact:** Limits scope (no complex integrations, no external dependencies)
- **How to Honor:** Pre-build all decisions (email copy, data audit), parallel work (Steve + Elon), no blockers
- **Verification:** Commit timestamp + production deployment timestamp ≤ 72 hours apart

### C-003: Plain Text Email Format Only
- **Description:** All emails plain text (no HTML, no images, no screenshots)
- **Source:** decisions.md 1.4, 1.2
- **Type:** Hard constraint
- **Impact:** Better deliverability, forces clarity (no hiding behind design), no Puppeteer/headless browser needed
- **How to Honor:** Email templates written as `.txt` strings, no MIME multipart, no base64 encoding
- **Verification:** Resend API sends plain text (Content-Type: text/plain), no HTML in final send

### C-004: No Screenshots in V1
- **Description:** Do not include site screenshots in lifecycle emails
- **Source:** decisions.md 1.2
- **Type:** Hard constraint
- **Impact:** Eliminates need for Puppeteer/headless Chrome infrastructure (saves ~500 LOC)
- **How to Honor:** Remove screenshot generation from scope, link to site URL instead
- **Verification:** No image tags in email, no screenshot infrastructure built

### C-005: No Performance Metrics in V1
- **Description:** Do not include site performance data (uptime, page speed) in emails
- **Source:** decisions.md 1.2, PRD out of scope
- **Type:** Hard constraint
- **Impact:** Eliminates need for site monitoring service integration, removes telemetry complexity
- **How to Honor:** Remove performance metric collection from scope, keep emails generic + aspirational
- **Verification:** No uptime/speed data in final emails, no monitoring service integration

### C-006: Manual CSV Upload Only (No Pipeline Integration V1)
- **Description:** Do not auto-capture shipped projects from build pipeline in MVP
- **Source:** decisions.md 2, Risk 7.2, MVP "Manual entry"
- **Type:** Hard constraint
- **Impact:** Eliminates need to hook into build system, keeps scope small for 72h delivery
- **How to Honor:** Build CSV import script, manual uploads by Phil Jackson until automation needed
- **Verification:** No pipeline hooks added, CSV-to-KV script handles all data entry for V1

### C-007: Resend as Single Email Provider
- **Description:** Use Resend API exclusively (no fallback to SendGrid/Postmark)
- **Source:** decisions.md 1.2
- **Type:** Hard constraint
- **Impact:** Single failure mode (if Resend down, no emails sent), acceptable per decisions
- **How to Honor:** No redundant email service, no abstraction layer for multiple providers
- **Verification:** Only Resend API calls in codebase, no email provider abstraction

### C-008: No Custom Analytics Dashboard
- **Description:** Use Resend's built-in dashboard (do not build custom dashboard)
- **Source:** decisions.md 1.7
- **Type:** Hard constraint
- **Impact:** Saves ~200 LOC, eliminates database schema for metrics
- **How to Honor:** Manual review of Resend dashboard for metrics, no custom reporting built
- **Verification:** No `/dashboard` route in Worker, no custom analytics storage

### C-009: No Content Between Scheduled Emails
- **Description:** Do not add blog posts, case studies, or serialized content between lifecycle emails
- **Source:** decisions.md 2, out of scope, Mandatory Condition 4 (deferred to V1.1)
- **Type:** Scope constraint
- **Impact:** Simplifies MVP, defers content strategy to V1.1
- **How to Honor:** Focus on 5 emails only, no content distribution system built
- **Verification:** No blog/content features in MVP, documented as V1.1 priority

### C-010: 90-Day Feature Freeze
- **Description:** Do not modify email templates or add features for 90 days post-launch
- **Source:** decisions.md 1.9, essence.md
- **Type:** Hard constraint
- **Impact:** Ensures clean measurement period, prevents scope creep during evaluation
- **How to Honor:** Lock templates after ship, only fix critical bugs/spam issues
- **Verification:** No code commits to worker or templates 0-90 days post-launch (except critical fixes)

### C-011: Email "From" Address: homeport@shipyard.ai
- **Description:** All lifecycle emails must come from homeport@shipyard.ai (not support@ or noreply@)
- **Source:** decisions.md 1.1, 6.2, config-decisions.md
- **Type:** Hard constraint
- **Impact:** Brand consistency, signals personal relationship (not corporate)
- **How to Honor:** Configure Resend to use homeport@shipyard.ai as From + Reply-To
- **Verification:** Email headers show From: homeport@shipyard.ai, replies go to homeport@shipyard.ai

### C-012: Reply-To: homeport@shipyard.ai (Monitored by Phil)
- **Description:** Customer replies go to homeport@shipyard.ai, monitored by Phil Jackson <24h SLA
- **Source:** decisions.md 6.3, Risk 7.2
- **Priority:** P0
- **Type:** Hard constraint
- **Impact:** Signals personal care, builds retention relationship
- **How to Honor:** Phil monitors homeport@shipyard.ai inbox daily, responds <24h to customer replies
- **Verification:** Customer sends reply, Phil responds within 24 hours (audit for first 10 replies)

### C-013: No AI-Generated Content in Templates
- **Description:** All email copy written by Steve Jobs (human), not AI-generated
- **Source:** decisions.md 2, Design Review (Steve Jobs + Maya Angelou approval required)
- **Type:** Soft constraint (design review enforces)
- **Impact:** Authenticity + human voice critical for retention positioning
- **How to Honor:** Steve writes all templates, design review by Jony Ive + Maya Angelou, no AI rewrites post-approval
- **Verification:** All email templates signed off by Steve Jobs (no AI generation tools used)

### C-014: No Special Offers/Discounts in V1
- **Description:** Day 180 + Day 365 reference "special offer" but do not hard-code pricing/discounts
- **Source:** decisions.md 2, out of scope, Mandatory Condition 4 (deferred to V1.1)
- **Type:** Scope constraint
- **Impact:** Avoids pricing decisions before V2, keeps email copy generic
- **How to Honor:** Email says "special offer for returning customers" but no actual discount defined
- **Verification:** No pricing/discount codes in final emails, deferred to V1.1 pricing strategy

### C-015: Minimum 10 Shipped Projects for MVP Launch
- **Description:** Do not launch until ≥10 real shipped projects in KV store with clean data
- **Source:** decisions.md 6.1, Risk 7.2, Mandatory Condition 1 (proof system works)
- **Type:** Hard constraint
- **Impact:** Ensures launch has real customers + real data to measure against
- **How to Honor:** Phil audits existing shipped projects, backfills CSV with clean data
- **Verification:** CSV import shows ≥10 projects in KV before go-live approval

---

## Summary by Phase

### MVP Phase Requirements (48-72 hours)
**All P0 requirements + Core FR/TR/DR/QR**

**Functional:**
- FR-001 through FR-012 (email sending, cron scheduling, KV storage, CSV upload, unsubscribe, reply handling, personalization, Resend integration)

**Technical:**
- TR-001 through TR-012 (Workers setup, KV config, Resend API, email templates, CSV import, unsubscribe handler, TypeScript setup, tests, routing, error handling, secrets)

**Data:**
- DR-001 through DR-004 (project model, CSV schema, unsubscribe storage, audit trail)

**Quality:**
- QR-001 through QR-007 (rendering, deliverability, voice, scheduler reliability, unsubscribe compliance, data accuracy, deployment verification)

**Constraints:**
- All C-001 through C-015 enforced

### V1.1 Phase Requirements (Next 90 days, deferred)
- Auto-population of shipped projects from pipeline (not manual CSV)
- Email open tracking + click tracking (Resend provides, just needs dashboard access)
- Content between emails (blog/case studies)
- Improved Day 30 subject line (use Maya's suggestion)
- Reply workflow automation (if reply rate >10%)
- Pricing strategy for "special offers"

### Phase 2 Requirements (6+ months, telemetry moat)
- Project telemetry infrastructure (time/token tracking)
- Build intelligence layer (pattern detection)
- Customer-facing data products (benchmarks, peer comparison)
- Data flywheel (shipped projects → learnings → better recommendations)

---

## Definition of Done (MVP Launch Checklist)

- [ ] All 5 lifecycle email templates written + designed (Steve Jobs)
- [ ] Transactional email service (Resend) configured + SPF/DKIM/DMARC verified
- [ ] Shipped project database (KV store) created + populated with ≥10 real projects
- [ ] Daily email scheduler implemented + tested (cron job executes correctly)
- [ ] At least 1 real project entered + receiving lifecycle emails (end-to-end test)
- [ ] Unsubscribe handling implemented + CAN-SPAM compliant (legal review not required but best practice followed)
- [ ] Email open/click tracking operational (Resend dashboard shows data)
- [ ] Dashboard access confirmed (Resend dashboard available to view metrics)
- [ ] Brand inconsistency fixed: all URLs changed from aftercare.shipyard.ai → homeport.shipyard.ai
- [ ] Voice lock enforced: all templates pass "automation smell" test (no corporate language)
- [ ] Timeline verified: commit to deployment ≤72 hours
- [ ] Deployment approval: Phil Jackson (product) + Elon Musk (engineering) + Steve Jobs (voice)

---

**Report Generated:** 2026-04-16
**Status:** Ready for Build Phase
**Next Action:** Trigger Day 0 pre-build checklist (data audit, email drafts, Resend setup)
