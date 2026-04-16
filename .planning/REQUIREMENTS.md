# Requirements Analysis: Homeport (Post-Ship Lifecycle Emails)

**Analysis Date:** 2026-04-16
**Analyst Role:** Plan Generator
**Project:** shipyard-post-ship-lifecycle (Homeport / Aftercare)
**Scope:** Extract atomic requirements from PRD, decisions, and codebase scout report

---

## Executive Summary

Homeport is a **retention-focused lifecycle email system** that maintains relationships with customers after project deployment through a 5-email sequence spanning 365 days. The system is built on Cloudflare Workers + KV Store + Resend API, with a strict 48-72 hour timeline and 300-line code cap.

**Total Requirements:** 10 atomic (R1-R10)
**All requirements:** MUST (v1)

**Key Decisions Locked:**
- ✅ **Plain text only** (no HTML, no images, no branded templates)
- ✅ **5-email cadence** (Day 7, 30, 90, 180, 365) — deployed all together
- ✅ **Manual CSV upload for V1** (automated webhook for V1.1)
- ✅ **KV Store, not PostgreSQL** (simpler, matches 300-line cap)
- ✅ **Resend API for delivery** (proven in contact-form Worker)
- ✅ **One-click unsubscribe** (KV flag update, CAN-SPAM compliant)
- ✅ **Cloudflare Workers scheduled cron** (daily check for emails to send)
- ✅ **Reply forwarding to assigned inbox** (not auto-reply)
- ✅ **90-day feature freeze** (test once, ship, never change)
- ✅ **Success metric:** 10%+ reply/revision request rate (primary)

**Critical Success Factor:** Data availability. Cannot launch without 10+ shipped projects with clean customer email, name, URL, and ship date.

---

## Atomic Requirements (R1-R10)

### R1: Email Template System
**Category:** Core Feature
**Priority:** MUST (v1)
**Description:** Build email template function system that generates plain text emails with minimal variable interpolation (customer name, project URL only).

**Acceptance Criteria:**
- [ ] 5 email templates exist: Day 7, Day 30, Day 90, Day 180, Day 365
- [ ] All templates are plain text (no HTML, no images, no styling)
- [ ] Templates support at minimum: `{name}`, `{project_url}` merge variables
- [ ] Each template is a callable TypeScript function: `formatDayX(data: ProjectData): string`
- [ ] Templates pass Steve's voice test: "Would I send this to a friend?"
- [ ] Unsubscribe link included in footer of every email
- [ ] No upsell or discount offers in any template

**Source:**
- Decisions.md Section 1.4 (Plain Text Format)
- Decisions.md Section 1.3 (Email Cadence)
- Decisions.md Section 1.6 (Brand Voice — Trusted Mechanic)
- Codebase Scout Report Section 8.2 (Testing Strategy)

**Implementation Notes:**
- Steve writes all copy (non-negotiable)
- Elon ships word-for-word (no edits for brevity)
- Subject lines included in template functions
- Tone reference: "Someone remembers your project" (essence.md)

---

### R2: Scheduler and Cron Logic
**Category:** Infrastructure
**Priority:** MUST (v1)
**Description:** Implement daily scheduled cron job that detects projects hitting Days 7, 30, 90, 180, 365 and triggers email sends.

**Acceptance Criteria:**
- [ ] Cloudflare Workers cron trigger configured (runs daily)
- [ ] Cron handler reads KV store to identify projects with ship_date
- [ ] Calculates elapsed days: `(today - ship_date) / 86400`
- [ ] Identifies projects matching Day 7, 30, 90, 180, 365 thresholds (±1 day tolerance)
- [ ] Skips already-sent emails (tracked in KV via `schedule:{project_id}:{day}` key)
- [ ] Skips unsubscribed users (checks `unsubscribed:{email}` flag in KV)
- [ ] Deduplication: never sends same email twice to same recipient
- [ ] Logs all executions to Cloudflare Worker logs
- [ ] Handles KV eventual consistency gracefully (accept rare duplicates)

**Source:**
- Decisions.md Section 1.12 (Feature Freeze — no changes during 90 days)
- Codebase Scout Report Section 8.1 Gap 1 (Scheduled Cron Jobs pattern)
- Decisions.md Section 5.1 Risk Register (KV Eventual Consistency)

**Implementation Notes:**
- Wrangler config: `[[triggers]] crons = ["0 0 * * *"]` (UTC midnight)
- Pattern in codebase scout: Workers exports `scheduled()` handler
- Accept that testing 365-day emails requires mock time in unit tests

---

### R3: KV Store Operations Module
**Category:** Data Layer
**Priority:** MUST (v1)
**Description:** Build KV store interface for project data retrieval, status tracking, and unsubscribe management.

**Acceptance Criteria:**
- [ ] `getProject(projectId): Promise<ProjectData>` retrieves project from KV
- [ ] `isUnsubscribed(email): Promise<boolean>` checks unsubscribe flag
- [ ] `markUnsubscribed(email): Promise<void>` sets unsubscribe flag in KV
- [ ] `recordSentEmail(projectId, day): Promise<void>` marks email as sent (deduplication)
- [ ] `hasSentEmail(projectId, day): Promise<boolean>` checks if already sent
- [ ] KV key structure: `project:{project_id}` → `{email, name, project_url, ship_date, ...}`
- [ ] KV key structure: `unsubscribed:{email}` → `"true"`
- [ ] KV key structure: `schedule:{project_id}:{day}` → timestamp
- [ ] Error handling: gracefully handle KV misses (project not found = skip, don't crash)

**Source:**
- Codebase Scout Report Section 3.2 (KV Store Design)
- Decisions.md Section 1.2 Architecture (KV Store, not database)

**Implementation Notes:**
- KV namespace binding in wrangler.toml: `AFTERCARE_KV`
- ProjectData interface: `{ email, name, project_url, ship_date, project_name?, unsubscribed? }`
- Simple encoding for unsubscribe tokens: base64(email).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')

---

### R4: Resend API Client Wrapper
**Category:** External Integration
**Priority:** MUST (v1)
**Description:** Build lightweight Resend API client that handles email sending with proper error handling and response validation.

**Acceptance Criteria:**
- [ ] `sendEmail(to, subject, text): Promise<{id: string, ok: boolean}>`
- [ ] Uses Resend API endpoint: `https://api.resend.com/emails`
- [ ] Sets Bearer token auth header: `Authorization: Bearer ${env.RESEND_API_KEY}`
- [ ] Request body includes: `from, to, subject, text, reply_to`
- [ ] Handles rate limits (429 response) — don't retry in V1
- [ ] Handles API errors (500) — log to Worker console
- [ ] Validates response: `response.ok` check
- [ ] Returns email ID from Resend for tracking (optional for V1)
- [ ] No retry logic in V1 (accept single-send-only)

**Source:**
- Codebase Scout Report Section 2 (Resend Integration Pattern)
- Contact-form Worker example: `/workers/contact-form/src/index.ts:123-146`
- Decisions.md Section 1.4 (Plain Text Format — use `text` field, not `html`)

**Implementation Notes:**
- Copy pattern from contact-form Worker (proven in production)
- FROM email address: TBD before build (homeport@, aftercare@, or personal)
- Environment variable: `RESEND_API_KEY` (secret, set via wrangler secret put)
- Response handling: `const result = await response.json()`

---

### R5: Unsubscribe Endpoint and Mechanism
**Category:** Feature
**Priority:** MUST (v1)
**Description:** Build Worker endpoint that handles one-click unsubscribe link from emails, updates KV flag, and shows confirmation page.

**Acceptance Criteria:**
- [ ] Worker route: `GET /unsub?token={encoded_email}`
- [ ] Decodes token: `Buffer.from(encoded, 'base64').toString('utf-8')`
- [ ] Updates KV: `unsubscribed:{email} = "true"`
- [ ] Returns 200 with confirmation HTML: "You've been unsubscribed from Homeport emails"
- [ ] Handles invalid/expired tokens gracefully (return 404 or generic confirmation)
- [ ] Unsubscribe is permanent for V1 (no re-subscribe mechanism)
- [ ] CAN-SPAM compliant (one-click, instant, no confirmation email)
- [ ] Matches brand voice (not corporate confirmation, human tone)

**Source:**
- Decisions.md Section 4.3 (Unsubscribe Flow — one-click KV flag)
- Decisions.md Section 5.2 Risk Register (Unsubscribe link broken)
- PRD Section "Out of Scope" (no customer portal, just one-click links)

**Implementation Notes:**
- Unsubscribe link in email template: `https://aftercare.shipyard.ai/unsub?token={encoded_email}`
- Email template includes: "Unsubscribe: [link]" in footer
- No database query needed, pure KV operation
- Can render simple HTML or plain text confirmation

---

### R6: CSV-to-KV Import Script
**Category:** Operational Tooling
**Priority:** MUST (v1)
**Description:** Build Node.js CLI script that parses shipped project CSV and uploads records to KV store for manual project initialization in V1.

**Acceptance Criteria:**
- [ ] Script reads CSV file: `project_id, customer_email, customer_name, project_url, ship_date`
- [ ] Validates required fields (error on missing email, URL, or date)
- [ ] Parses ship_date to ISO 8601 format: `YYYY-MM-DDTHH:mm:ssZ`
- [ ] Connects to KV namespace (via wrangler config or WRANGLER environment)
- [ ] Uploads each project as: `project:{project_id} = {json stringified ProjectData}`
- [ ] Logs success/failure per row
- [ ] Returns exit code 0 on success, 1 on any error
- [ ] No duplicate checking (user responsibility to avoid)
- [ ] Can be run multiple times (last write wins)

**Source:**
- Decisions.md Section 4.1 (Project Data Source) — manual CSV for V1
- Decisions.md Section 8.2 Risk Register (Manual CSV Upload Becomes Bottleneck)
- Codebase Scout Report Section 3.2 (KV Store Design, CSV format)

**Implementation Notes:**
- Minimal script (~40-60 lines per codebase scout estimate)
- Usage: `node scripts/csv-to-kv.ts ./projects.csv`
- Error handling: log which rows failed, continue processing others
- Optional: dry-run flag to preview without uploading

---

### R7: Unit Tests — Email Template Rendering
**Category:** Quality Assurance
**Priority:** MUST (v1)
**Description:** Write Vitest unit tests that verify email templates correctly interpolate variables and produce expected output.

**Acceptance Criteria:**
- [ ] Test file: `tests/emails.test.ts`
- [ ] Tests for each template: Day 7, 30, 90, 180, 365
- [ ] Each test verifies:
  - [ ] Customer name appears in output
  - [ ] Project URL appears in output
  - [ ] Unsubscribe link appears in output
  - [ ] Subject line is not empty
- [ ] Test data uses consistent mock: `{name: "Jane Doe", project_url: "https://example.com", ...}`
- [ ] All tests pass before shipping
- [ ] Test runs in CI (npm run test:run)

**Source:**
- Codebase Scout Report Section 4.2 (Recommended Testing Strategy)
- Decisions.md Section 6 Success Criteria (Tests written)
- Decisions.md Section 1.12 (90-day feature freeze — rely on test stability)

**Implementation Notes:**
- Use Vitest (already available via Wrangler)
- Example structure in codebase scout Section 4.2
- Mock ProjectData interface in test file
- Minimal test suite (~2 hours per codebase scout estimate)

---

### R8: Unit Tests — Scheduler Logic
**Category:** Quality Assurance
**Priority:** MUST (v1)
**Description:** Write Vitest unit tests that verify cron logic correctly identifies projects at each milestone (Day 7, 30, 90, 180, 365).

**Acceptance Criteria:**
- [ ] Test file: `tests/scheduler.test.ts`
- [ ] Tests verify day calculation function: `getElapsedDays(ship_date) → number`
- [ ] Tests verify milestone detection: `getNextMilestone(elapsed_days) → day | null`
- [ ] Test cases:
  - [ ] Ship date 7 days ago → triggers Day 7 email
  - [ ] Ship date 6 days ago → no email
  - [ ] Ship date 8 days ago → no email (already sent)
  - [ ] Ship date 30 days ago → triggers Day 30 email
  - [ ] Ship date 180 days ago → triggers Day 180 email
  - [ ] Unsubscribed flag prevents sending
  - [ ] Already-sent flag prevents duplicate
- [ ] All tests pass before shipping
- [ ] Handles timezone edge cases (test in UTC)

**Source:**
- Codebase Scout Report Section 4.2 (Email template rendering tests example)
- Decisions.md Section 6 Success Criteria (Tests written)
- Risk Register Section 5.1 (KV Eventual Consistency — test handles duplicates)

**Implementation Notes:**
- Mock KV interactions (don't hit real KV in tests)
- Use fixed dates to ensure test stability
- Minimal test suite (~2 hours per codebase scout estimate)
- Test both "send this email" and "skip this email" paths

---

### R9: Cloudflare Workers Project Scaffold and Configuration
**Category:** Infrastructure
**Priority:** MUST (v1)
**Description:** Set up Cloudflare Workers project structure with all necessary configuration, dependencies, and TypeScript setup.

**Acceptance Criteria:**
- [ ] Directory structure exists at `/workers/aftercare` (or similar)
- [ ] `wrangler.toml` configured with:
  - [ ] `name = "shipyard-aftercare"`
  - [ ] `main = "src/index.ts"`
  - [ ] `compatibility_date = "2024-12-01"` (or current)
  - [ ] `[[kv_namespaces]]` binding with AFTERCARE_KV
  - [ ] `[[triggers]] crons = ["0 0 * * *"]` (daily at UTC midnight)
  - [ ] `[vars]` with FROM_EMAIL environment variable
  - [ ] `RESEND_API_KEY` as secret (set via CLI)
- [ ] `package.json` with scripts:
  - [ ] `dev`: wrangler dev
  - [ ] `deploy`: wrangler deploy
  - [ ] `test`: vitest
  - [ ] `test:run`: vitest run
  - [ ] `typecheck`: tsc --noEmit
- [ ] `tsconfig.json` configured for TypeScript 5.x
- [ ] `src/index.ts` with Worker export structure (scheduled + route handlers)
- [ ] No external dependencies (matches Elon's constraint)

**Source:**
- Codebase Scout Report Section 1 (Existing Worker Projects)
- Codebase Scout Report Section 6 (Recommended File Structure)
- Contact-form Worker as reference: `/workers/contact-form/wrangler.toml`

**Implementation Notes:**
- Copy configuration patterns from existing Workers (contact-form, prd-chat, wardrobe-analytics)
- TypeScript dependencies: @cloudflare/workers-types, wrangler, vitest
- Development dependencies only (no runtime dependencies)

---

### R10: Resend Account Configuration and Domain Authentication
**Category:** Pre-Launch Setup
**Priority:** MUST (Day 0 blocker)
**Description:** Configure Resend account, authenticate sending domain, and verify email deliverability before first email send.

**Acceptance Criteria:**
- [ ] Resend account created (or existing account available)
- [ ] Sending domain configured (homeport@shipyard.ai or aftercare@shipyard.ai)
- [ ] SPF record added to domain DNS: `v=spf1 include:resend.com ~all`
- [ ] DKIM signature enabled and verified in Resend dashboard
- [ ] DMARC policy set: `v=DMARC1; p=quarantine; rua=mailto:{admin-email}`
- [ ] Domain reputation verified (no blocklist flags)
- [ ] Test email sends successfully to internal team
- [ ] Email passes Mail-Tester.com validation (score >9/10 = inbox placement)
- [ ] Plain text emails don't trigger spam filters
- [ ] Resend API key generated and stored as secret

**Source:**
- Codebase Scout Report Section 8.1 Blocker 2 (Email "From" Address & Reply-To)
- Decisions.md Section 6 Success Criteria (Resend + domain authentication before Day 1)
- Decisions.md Section 5.1 Risk Register (Email Deliverability Issues)

**Implementation Notes:**
- Decision needed: homeport@, aftercare@, or personal (phil@, etc.)
- Warm up sending domain: start with small batch (5 emails), monitor bounce rate
- No images/attachments in plain text emails (improves deliverability)
- Limit to 3 links per email (spam filter trigger reduction)
- Resend dashboard shows open rate, click rate, bounce rate

---

## Critical Blockers (Day 0 — Must Resolve Before Build Starts)

### Blocker 1: Project Data Availability
**Status:** ❌ Unresolved
**Impact:** 🔴 Critical — Can't launch without data
**Owner:** Phil Jackson

**Question:** Do we have 10+ shipped projects with:
- ✅ Customer email
- ✅ Customer name
- ✅ Project URL
- ✅ Ship date

**Action Required:** Audit shipment pipeline immediately (Day 0)

**If data doesn't exist:**
- Option A: Manual backfill of 10 projects with clean data
- Option B: Postpone Homeport, fix shipment pipeline first
- Option C: Accept partial data for V1 testing (minimum viable)

**Source:** Codebase Scout Report Section 8.1 Blocker 1 (Project Data Source)

---

### Blocker 2: Email "From" Address Decision
**Status:** ⚠️ Needs decision
**Impact:** 🟡 Medium (affects deliverability and brand)
**Owner:** Steve (brand) + Elon (deliverability)

**Options:**
1. `homeport@shipyard.ai` (branded, requires domain setup)
2. `aftercare@shipyard.ai` (matches codebase naming)
3. `hello@shipyard.ai` (existing, less distinct)
4. Personal (e.g., `phil@shipyard.ai`) for intimacy

**Decision Required:** Day 0 (before Resend domain setup)

**Source:** Codebase Scout Report Section 8.1 Blocker 2

---

### Blocker 3: Reply Inbox Assignment
**Status:** ❌ Unresolved
**Impact:** 🔴 Critical — customers reply, we must respond
**Owner:** Phil Jackson

**Question:** Who monitors replies to Homeport emails?

**Options:**
1. Shared inbox (e.g., `homeport@shipyard.ai`) → manual response
2. Phil's personal inbox → Phil handles personally
3. Auto-reply + ticketing system (scope creep, skip for V1)

**SLA Needed:** Response time commitment (<24h, <48h, or TBD?)

**Decision Required:** Day 0 (before launch)

**Source:** Decisions.md Section 4.5 (Reply Handling)

---

## Open Questions (Non-Blocking, Resolved During Build)

### Question 1: Trigger Mechanism for Automated Email Scheduling
**Status:** ⚠️ Unknown
**Impact:** 🟡 Medium (defines V1 vs. V1.1 scope)

**Options:**
1. Manual CSV upload → user runs script to populate KV (V1)
2. Webhook from Shipyard backend → Worker endpoint (V1.1)
3. Scheduled daily cron (always active in both)

**V1 Assumption:** Manual CSV upload
**V1.1 Plan:** Add webhook integration when shipping >10 projects/day

**Source:** Decisions.md Section 4.8 (Trigger Mechanism)

---

### Question 2: Unsubscribe UI/UX
**Status:** ✅ Locked
**Decision:** One-click unsubscribe link in email footer

**Implementation:** `https://aftercare.shipyard.ai/unsub?token={encoded_email}`

**Source:** Decisions.md Section 4.3 (Unsubscribe Flow)

---

## Constraints

### Timeline
- **Target:** 48 hours from first commit to production
- **Deadline:** 72 hours with buffer
- **Day 0:** Resolve blockers (data audit, From address, reply inbox)
- **Day 1:** Build and test (Wave 1 + Wave 2 parallel)
- **Day 2:** Ship and validate (Wave 3 sequential)

**Source:** Decisions.md Section 1.11 (Timeline — 48 Hours to Ship)

---

### Code Size
- **Hard cap:** 300 lines of TypeScript
- **Rationale:** Force ruthless simplicity, matching Elon's constraint
- **Estimated breakdown:**
  - Scheduler logic: 50-80 lines
  - Email templates: 100-150 lines
  - KV operations: 40-60 lines
  - Resend wrapper: 30-50 lines
  - Unsubscribe endpoint: 30-50 lines
  - Total: ~290-450 lines (with comments/docs)

**Source:** Decisions.md Section 1.2 Architecture (300-line cap) + Codebase Scout Section 10.1

---

### Feature Scope
- ✅ 5 email templates (all deployed together in V1)
- ✅ Daily cron scheduler
- ✅ Manual CSV upload for project data
- ✅ One-click unsubscribe
- ✅ Reply forwarding to assigned inbox
- ❌ Screenshots in emails
- ❌ Performance metrics
- ❌ Custom analytics dashboard
- ❌ Database/complex schema
- ❌ Automated project capture (V1.1)
- ❌ HTML email templates
- ❌ "Built with Shipyard" footer badges
- ❌ Per-industry customization
- ❌ AI-generated content

**Source:** Decisions.md Section 2 (MVP Feature Set)

---

### Brand Voice Lock
- **Tone:** Trusted mechanic checking in. Confident, competent, human.
- **What's forbidden:** Corporate jargon, fake casual, upsell language, emoji
- **Quality gate:** "Would I send this to a friend?"
- **Owner:** Steve Jobs (non-negotiable)

**Examples:**
- ✅ "It's been 30 days. Your site is holding up beautifully."
- ❌ "We hope your deployment experience met expectations and your digital presence is performing optimally."
- ❌ "Hey there! Just checking in to see how things are going! 😊"

**Source:** Decisions.md Section 1.6 (Brand Voice) + Section 11 (Voice Lock)

---

## Success Criteria (Launch Readiness)

### Day 0 Checklist
- [ ] Project data audit complete (Phil) — do we have 10+ shipped projects?
- [ ] CSV structure defined (Phil) — fields: project_id, email, name, project_url, ship_date
- [ ] "From" email address decided (Steve + Elon)
- [ ] Unsubscribe flow designed (Elon)
- [ ] Reply inbox assigned (Phil) — who monitors? what's the SLA?
- [ ] Resend account + domain authentication complete (Elon)

### Day 1 Checklist
- [ ] Cloudflare Worker project scaffolded (Elon)
- [ ] Day 7 and Day 30 email drafts finalized (Steve → Elon → Phil approval)
- [ ] Day 90/180/365 drafts written (Steve)
- [ ] Worker core built (Elon) — scheduler, KV operations, Resend integration
- [ ] CSV-to-KV upload script working (Elon)
- [ ] Tests written and passing (Elon) — email rendering, cron logic

### Day 2 Checklist
- [ ] Worker deployed to production (Elon)
- [ ] KV store populated with real project data (Phil)
- [ ] Test emails sent to internal team (Elon) — deliverability confirmed
- [ ] Day 7/30/90/180/365 cron jobs active (Elon)
- [ ] Unsubscribe mechanism functional (Elon) — CAN-SPAM compliant
- [ ] Voice review complete (Steve) — final check for automation smell
- [ ] Go-live approval (Phil)

---

## Traceability Matrix

| Requirement | Task(s) | Wave | Status |
|-------------|---------|------|--------|
| R1: Email Templates | task-4, task-5, task-6 | 1, 2 | Planned |
| R2: Scheduler Logic | task-1, task-9 | 1, 2 | Planned |
| R3: KV Operations | task-7, task-12 | 2, 2 | Planned |
| R4: Resend API Client | task-8 | 2 | Planned |
| R5: Unsubscribe Endpoint | task-10 | 2 | Planned |
| R6: CSV-to-KV Script | task-11 | 2 | Planned |
| R7: Email Template Tests | task-12 | 2 | Planned |
| R8: Scheduler Tests | task-13 | 2 | Planned |
| R9: Worker Scaffold | task-1, task-2, task-3 | 1, 1, 1 | Planned |
| R10: Resend Config | task-3 (pre-build) | Pre-Wave 1 | Blocker |

---

## Risk Summary

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|-----------|
| No project data exists | 🔴 High | 🔴 Critical | Audit Day 0, backfill or postpone |
| Emails land in spam | 🟡 Medium | 🔴 Critical | Plain text only, warm up domain, test with Mail-Tester |
| Reply inbox not monitored | 🟡 Medium | 🔴 Critical | Assign owner + SLA before launch |
| Customers hate emails | 🟡 Medium | 🔴 High | Steve writes quality templates, test with internal team |
| KV eventual consistency → duplicates | 🟡 Medium | 🟡 Medium | Use unique scheduleId, accept rare duplicates |
| Unsubscribe link broken | 🟢 Low | 🔴 High | Simple KV flag lookup, test before launch |
| 48-hour timeline unrealistic | 🟡 Medium | 🟢 Low | 72-hour buffer, scope is locked at 300 lines |

**Source:** Decisions.md Section 5 (Risk Register)

---

## Key References

**Critical (Read Before Build):**
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md` — Locked decisions (1,162 lines)
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md` — Voice and principles
- `/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md` — Architecture and patterns

**Code Patterns (Copy-Paste Ready):**
- `/home/agent/shipyard-ai/workers/contact-form/src/index.ts` — Resend API integration
- `/home/agent/shipyard-ai/workers/contact-form/wrangler.toml` — Worker configuration

**Reference Documentation:**
- `/home/agent/shipyard-ai/workers/wardrobe-analytics/README.md` — Deployment docs template
- `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` — Plugin system (Section 6 for entity specs)

---

## Next Actions

**Immediate (Day 0):**
1. Phil Jackson: Audit shipped project records and prepare CSV
2. Steve/Elon: Decide on "From" email address
3. Phil: Assign reply inbox owner and SLA
4. Elon: Configure Resend account and domain authentication
5. Steve: Draft Day 7 and Day 30 templates

**Then:** Proceed to phase-1-plan.md for task-by-task execution plan

---

**Status:** REQUIREMENTS LOCKED
**Date:** 2026-04-16
**Owner:** Plan Generator / Development Team (Elon)

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
