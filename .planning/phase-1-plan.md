# Phase 1 Plan — Homeport (Aftercare) Post-Ship Lifecycle Emails

**Generated:** 2026-04-16
**Requirements:** `/home/agent/shipyard-ai/.planning/HOMEPORT-REQUIREMENTS.md`
**Total Tasks:** 20
**Waves:** 3
**Timeline:** 48-72 hours (Day 0 blockers + Day 1 build + Day 2 ship)
**Project:** shipyard-post-ship-lifecycle (Homeport / Aftercare)

---

## Executive Summary

**Homeport** is a 5-email lifecycle system that remembers customers after project deployment. The MVP ships in 48-72 hours using Cloudflare Workers + KV Store + Resend API.

**Three waves of work:**
- **Wave 1 (Foundation):** Independent setup tasks (Parallel)
- **Wave 2 (Core Implementation):** Feature development (Parallel after Wave 1)
- **Wave 3 (Integration & Launch):** End-to-end testing and go-live (Sequential after Wave 2)

**Success Metric:** 10%+ reply/revision request rate after 90 days

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R1: Email Templates | task-4, task-5, task-6 | 1, 2, 2 |
| R2: Scheduler Logic | task-1, task-9 | 1, 2 |
| R3: KV Operations | task-7, task-12 | 2, 2 |
| R4: Resend API Client | task-8 | 2 |
| R5: Unsubscribe Endpoint | task-10 | 2 |
| R6: CSV-to-KV Script | task-11 | 2 |
| R7: Email Template Tests | task-12 | 2 |
| R8: Scheduler Tests | task-13 | 2 |
| R9: Worker Scaffold | task-1, task-2, task-3 | 1, 1, 1 |
| R10: Resend Config | Day 0 blocker | Pre-Wave 1 |

---

## Wave Execution Order

### Wave 1 (Parallel — Foundation & Pre-Build Setup)

These tasks establish infrastructure, resolve critical blockers, and scaffold the project. They can run in parallel.

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Resolve Project Data Blocker — Audit and CSV Preparation</title>
  <requirement>R10 (Resend Config), Day 0 Blocker 1</requirement>
  <description>
    Audit existing shipped projects in Shipyard to verify we have clean data (customer email, name, URL, ship date) for at least 10 projects. This is the critical blocker that determines whether we can launch in 48 hours or must postpone.

    Outcome: CSV file with format: project_id, customer_email, customer_name, project_url, ship_date
    If data gap exists, escalate immediately and decide: (a) backfill manually, (b) postpone, or (c) test with partial data.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 4.1 - Project Data Source (blocker definition)" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 8.1 Blocker 1 - Project Data Availability (risk assessment)" />
    <file path="/home/agent/shipyard-ai/packages/db/schema/sites.ts" reason="Reference for site data structure (url, name fields)" />
    <file path="/home/agent/shipyard-ai/prds/shipyard-post-ship-lifecycle.md" reason="PRD context for shipped projects" />
  </context>

  <steps>
    <step order="1">List all completed projects by checking /home/agent/shipyard-ai/prds/completed/ directory (or CRM/project management system)</step>
    <step order="2">For each project, identify: customer_email, customer_name, project_url, ship_date. Check project records, invoices, or contact list.</step>
    <step order="3">Create CSV file with header: project_id, customer_email, customer_name, project_url, ship_date</step>
    <step order="4">Populate at least 10 rows with validated data (no blanks, verify emails are correct)</step>
    <step order="5">If less than 10 projects with clean data exist, document the gap and escalate to Phil/Elon (decision: backfill, postpone, or test with partial data)</step>
    <step order="6">Save CSV to /tmp/shipyard-projects.csv or shared location for later upload</step>
  </steps>

  <verification>
    <check type="manual">CSV file contains minimum 10 rows of project data</check>
    <check type="manual">All 5 required fields present for each row (email, name, URL, date)</check>
    <check type="manual">Sample email addresses are valid format (contain @domain)</check>
    <check type="manual">Ship dates are ISO 8601 format or convertible to it</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 blocker resolution -->
  </dependencies>

  <commit-message>chore(data): audit shipped projects and prepare initial CSV for Homeport KV upload

Conduct data availability assessment for Homeport MVP launch.
Identify 10+ shipped projects with clean customer email, name, URL, and ship date.
Create CSV seed data for manual KV population.

This task is a Day 0 blocker - must complete before Wave 1 build starts.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Decide Critical Configuration: "From" Email Address and Reply Inbox Owner</title>
  <requirement>Blocker 2 (Email "From" Address), Blocker 3 (Reply Handling)</requirement>
  <description>
    Make two critical product decisions before Resend configuration:
    1. Which email address do Homeport emails come from? (homeport@, aftercare@, personal, etc.)
    2. Who monitors and responds to customer replies? (shared inbox, Phil personally, or auto-reply)

    These decisions drive domain setup, Resend configuration, and operational workflow.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 4.2 - Email From Address (decision options), Section 4.5 - Reply Handling" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 8.1 Blockers 2 & 3 (impact and options)" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference: existing contact-form uses hello@shipyard.company" />
  </context>

  <steps>
    <step order="1">Review options in decisions.md Section 4.2 for "From" address (homeport@, aftercare@, hello@, personal)</step>
    <step order="2">Consider deliverability (SPF/DKIM setup cost) vs. brand differentiation</step>
    <step order="3">Make decision: record chosen address (e.g., homeport@shipyard.ai)</step>
    <step order="4">Review options in decisions.md Section 4.5 for reply handling (shared inbox vs. personal vs. auto-reply)</step>
    <step order="5">Decide: who owns reply inbox monitoring? What's the SLA (<24h, <48h)?</step>
    <step order="6">Document decisions in team communication (Slack, email, or decision log)</step>
  </steps>

  <verification>
    <check type="manual">From email address confirmed and documented</check>
    <check type="manual">Reply inbox owner assigned with explicit name (Phil, shared team, etc.)</check>
    <check type="manual">Reply SLA defined (<24 hours, <48 hours, or custom)</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 decision gate -->
  </dependencies>

  <commit-message>chore(config): decide From email address and reply inbox owner for Homeport

Configure critical product decisions before Resend setup:
- From email address: [recorded decision, e.g., homeport@shipyard.ai]
- Reply inbox owner: [name/team]
- Reply SLA: [<24h, <48h, or custom]

These decisions drive Day 0 pre-build setup and operational workflow.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Cloudflare Workers Project Scaffold and wrangler.toml Configuration</title>
  <requirement>R9 (Worker Scaffold), R2 (Scheduler Logic), R10 (Resend Config)</requirement>
  <description>
    Create the Cloudflare Workers project directory structure, configure wrangler.toml with KV namespace and scheduled cron, set up package.json with TypeScript and testing, and validate the build compiles cleanly.

    This scaffolding enables all subsequent development tasks. The Worker will export both a scheduled handler (cron job) and HTTP routes (unsubscribe endpoint).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/wrangler.toml" reason="Reference configuration for basic Worker setup" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/package.json" reason="Reference npm scripts and dependencies" />
    <file path="/home/agent/shipyard-ai/workers/prd-chat/wrangler.toml" reason="Reference for compatibility flags if needed" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 6 - Recommended File Structure, Section 7 - Dependencies" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.2 - Architecture (Workers + KV structure)" />
  </context>

  <steps>
    <step order="1">Create directory: /home/agent/shipyard-ai/workers/aftercare/</step>
    <step order="2">Create subdirectories: src/, tests/, scripts/, (optional: templates/)</step>
    <step order="3">Copy wrangler.toml from contact-form and customize:
      - name = "shipyard-aftercare"
      - Add [[kv_namespaces]] binding = "AFTERCARE_KV" (get namespace ID from Cloudflare dashboard)
      - Add [[triggers]] crons = ["0 0 * * *"] for daily UTC midnight execution
      - Add [vars] section: FROM_EMAIL = "homeport@shipyard.ai" (or chosen address from task-2)
      - Compatibility date = "2024-12-01" (or current)
    </step>
    <step order="4">Copy package.json structure from prd-chat:
      - Add scripts: dev, deploy, test, test:run, typecheck
      - Dependencies: @cloudflare/workers-types, wrangler, vitest, typescript (dev only)
    </step>
    <step order="5">Copy and customize tsconfig.json (standard TypeScript config)</step>
    <step order="6">Create src/index.ts with skeleton Worker export:
      - Export default object with: scheduled() handler and route handlers for GET /unsub
    </step>
    <step order="7">Run: cd /home/agent/shipyard-ai/workers/aftercare && npm install</step>
    <step order="8">Verify build: npm run typecheck (should pass with no errors)</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck succeeds</check>
    <check type="manual">wrangler.toml contains AFTERCARE_KV binding</check>
    <check type="manual">wrangler.toml contains cron trigger: "0 0 * * *"</check>
    <check type="manual">FROM_EMAIL variable set in [vars] section</check>
    <check type="manual">src/index.ts exports default object with scheduled and route handlers</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Wave 1 infrastructure -->
  </dependencies>

  <commit-message>chore(scaffold): initialize Cloudflare Workers project for Homeport (aftercare)

Create project structure with wrangler.toml, package.json, and TypeScript config.
Configure KV namespace binding (AFTERCARE_KV) and daily cron trigger (0 0 * * *).
Set up npm scripts: dev, deploy, test, typecheck.

Worker skeleton ready for implementation in Wave 2.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Configure Resend Account and Domain Authentication (Pre-Build Setup)</title>
  <requirement>R10 (Resend Config), R4 (Resend API Client)</requirement>
  <description>
    Set up Resend transactional email account (if not already done), authenticate the sending domain (homeport@shipyard.ai or chosen address from task-2), and verify email deliverability before the first email send.

    This is a pre-build task that must complete before Wave 2 Resend API integration. Domain authentication (SPF/DKIM/DMARC) takes 24-48 hours to propagate, so start immediately.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 2 - Email Service Integration (Resend), Section 8.1 Blocker 2" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference Resend API integration pattern (lines 123-146)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 5.1 Risk - Email Deliverability Issues" />
  </context>

  <steps>
    <step order="1">Sign up for Resend account at resend.com (if not already done) or access existing account</step>
    <step order="2">In Resend dashboard, add sending domain: homeport@shipyard.ai (or chosen address from task-2)</step>
    <step order="3">Resend generates SPF record: v=spf1 include:resend.com ~all (copy this)</step>
    <step order="4">In domain registrar (Cloudflare, Route53, GoDaddy, etc.), add SPF TXT record to shipyard.ai DNS</step>
    <step order="5">In Resend dashboard, enable DKIM signing for the domain and verify completion</step>
    <step order="6">Create DMARC policy: v=DMARC1; p=quarantine; rua=mailto:[admin-email] and add to DNS as _dmarc TXT record</step>
    <step order="7">Resend dashboard shows domain as "Verified" (may take 1-2 hours for DNS propagation)</step>
    <step order="8">In Resend dashboard, generate API key and save securely (will be set via wrangler secret put in Wave 2)</step>
    <step order="9">Send test email via Resend API to internal email (your inbox) to confirm delivery</step>
    <step order="10">Test email with Mail-Tester.com: forward test email to mail@mail-tester.com and check score (should be >9/10)</step>
  </steps>

  <verification>
    <check type="manual">Resend dashboard shows domain as Verified</check>
    <check type="manual">SPF record appears in domain DNS (use dig/nslookup to verify)</check>
    <check type="manual">DKIM enabled in Resend dashboard</check>
    <check type="manual">Test email lands in inbox (not spam folder)</check>
    <check type="manual">Mail-Tester score is >9/10 (no spam triggers)</check>
    <check type="manual">Resend API key generated and available</check>
  </verification>

  <dependencies>
    <!-- No dependencies, but must complete before Wave 2 task-8 (Resend API implementation) -->
  </dependencies>

  <commit-message>chore(email): configure Resend account and domain authentication

Set up Resend transactional email service with domain authentication for:
- From address: [homeport@shipyard.ai or chosen address]
- SPF, DKIM, DMARC records configured in DNS
- Domain verified in Resend dashboard
- Deliverability tested with Mail-Tester (score >9/10)

Ready for Wave 2 Resend API integration.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="1">
  <title>Draft Day 7 and Day 30 Email Templates (Steve's Work)</title>
  <requirement>R1 (Email Templates), Wave 1 Foundation</requirement>
  <description>
    Steve Jobs writes the critical Day 7 and Day 30 email templates. These are the first emails customers receive and set the tone for the entire Homeport product. All copy must pass the voice test: "Would I send this to a friend?"

    Day 7 focuses on pride and accomplishment. Day 30 checks in with substance.
    Both templates must be plain text, personalized with {name} and {project_url} only, and include an unsubscribe link.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md" reason="Voice principles and tone guidelines" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.4 (Plain Text Format), Section 1.6 (Brand Voice), Section 4.4 (Day 7 Email Content)" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 2.2 (Plain Text Advantages), Section 11 (Voice Lock)" />
  </context>

  <steps>
    <step order="1">Read essence.md and decisions.md Section 1.6 (Brand Voice) for tone guidelines</step>
    <step order="2">Write Day 7 template with subject line. Focus: pride and accomplishment after 7 days.
      - Include {name} personalization
      - Include {project_url} link
      - Keep tone: "Your site is breathing on its own now" (reference from decisions.md)
      - Plain text only (no HTML formatting)
      - ~150-200 words
      - End with invitation to reply if something's off
      - Include unsubscribe link in footer
    </step>
    <step order="3">Write Day 30 template with subject line. Focus: check-in with substance after 30 days.
      - Include {name} personalization
      - Include {project_url} link
      - Show that we've been watching: mention something about their project (e.g., "uptime", "page speed")
      - Plain text only
      - ~150-200 words
      - Offer to discuss revisions or updates
      - Include unsubscribe link in footer
    </step>
    <step order="4">Run both templates through voice test: Would I send this to a friend? If not, rewrite.</step>
    <step order="5">Format templates as plain text and save to /tmp/day-7-draft.txt and /tmp/day-30-draft.txt</step>
    <step order="6">Submit drafts to Elon and Phil for technical and content review before Wave 2 implementation</step>
  </steps>

  <verification>
    <check type="manual">Day 7 template is plain text (no HTML tags)</check>
    <check type="manual">Day 30 template is plain text (no HTML tags)</check>
    <check type="manual">Both include {name} and {project_url} merge variables</check>
    <check type="manual">Both include unsubscribe link (placeholder: https://aftercare.shipyard.ai/unsub?token={email})</check>
    <check type="manual">Tone passes "Would I send to friend?" test (subjective approval from Steve)</check>
    <check type="manual">No corporate jargon, no emoji, no fake casual language</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is Steve's async writing work, parallel to Elon's Wave 1 tasks -->
  </dependencies>

  <commit-message>docs(templates): draft Day 7 and Day 30 email templates (Steve)

Write high-quality plain text email templates for the critical first touchpoints:
- Day 7: Pride and accomplishment messaging
- Day 30: Substance check-in with caring tone

Templates personalized with {name} and {project_url} only.
Voice review complete - passes "send to friend" test.
Ready for implementation in Wave 2.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-6" wave="1">
  <title>Draft Day 90, Day 180, and Day 365 Email Templates (Steve's Work)</title>
  <requirement>R1 (Email Templates), Wave 1 Foundation</requirement>
  <description>
    Steve writes the three remaining email templates (Day 90, 180, 365). These are deployed in V1 but measure effectiveness over the 90-day lifecycle. Each template has distinct messaging: Day 90 positions Homeport as the agency that "stays" (vs. competitors who disappear), Day 180 offers refresh/update opportunities, Day 365 celebrates the anniversary.

    All templates must maintain consistent voice, be plain text, and pass the voice test.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md" reason="Voice principles and tone guidelines" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.3 (Email Cadence), Section 1.6 (Brand Voice)" />
    <file path="/home/agent/shipyard-ai/prds/shipyard-post-ship-lifecycle.md" reason="PRD Section (Phase 1) for messaging ideas for Day 90, 180, 365" />
  </context>

  <steps>
    <step order="1">Write Day 90 template with subject line. Focus: "We're still here" (where agencies vanish).
      - Include {name} personalization
      - Include {project_url} link
      - Acknowledge 90 days have passed, highlight that most agencies go silent here
      - Offer proactive support or updates
      - Plain text, ~150-200 words
      - Include unsubscribe link
    </step>
    <step order="2">Write Day 180 template with subject line. Focus: "Time for a refresh?" (6-month milestone).
      - Include {name} personalization
      - Include {project_url} link
      - Mention web standards changes, security updates, or design trends
      - Offer to discuss revisions or improvements
      - Plain text, ~150-200 words
      - Include unsubscribe link
    </step>
    <step order="3">Write Day 365 template with subject line. Focus: "Happy Anniversary!" (1-year milestone).
      - Include {name} personalization
      - Include {project_url} link
      - Celebrate the project and the relationship
      - Reflect on how the web has changed in a year
      - Plant the seed for next project
      - Plain text, ~150-200 words
      - Include unsubscribe link
    </step>
    <step order="4">Run all three templates through voice test: consistent with Day 7 and 30? Would I send to friend?</step>
    <step order="5">Save drafts to /tmp/day-90-draft.txt, /tmp/day-180-draft.txt, /tmp/day-365-draft.txt</step>
    <step order="6">Submit to Elon and Phil for technical review before Wave 2 implementation</step>
  </steps>

  <verification>
    <check type="manual">Day 90 template is plain text (no HTML)</check>
    <check type="manual">Day 180 template is plain text (no HTML)</check>
    <check type="manual">Day 365 template is plain text (no HTML)</check>
    <check type="manual">All three include {name} and {project_url} variables</check>
    <check type="manual">All three include unsubscribe link</check>
    <check type="manual">Tone consistent with Day 7 and 30 templates</check>
    <check type="manual">Voice test passed (subjective)</check>
  </verification>

  <dependencies>
    <!-- Depends on task-5 (day 7/30 drafts) for consistency, but can be done in parallel -->
  </dependencies>

  <commit-message>docs(templates): draft Day 90, Day 180, and Day 365 email templates (Steve)

Write remaining lifecycle email templates for extended lifecycle:
- Day 90: "We're still here" (vs. agencies that vanish)
- Day 180: "Time for a refresh?" (6-month milestone)
- Day 365: "Happy Anniversary!" (1-year celebration)

All templates maintain consistent voice with Day 7/30.
Ready for Wave 2 implementation and testing.
  </commit-message>
</task-plan>

---

### Wave 1 Summary

**Wave 1 Status:** 6 tasks establishing critical blockers, infrastructure, and content

**Parallel execution:** Tasks 1-6 can run simultaneously on Day 0-1
- Tasks 1-4: Operational/infrastructure decisions and setup (Phil, Elon)
- Tasks 5-6: Creative writing in parallel (Steve)
- Task 3 enables all Wave 2 tasks

**Outcome by end of Wave 1:**
- ✅ Project data validated (minimum 10 shipped projects in CSV)
- ✅ Critical decisions locked (From address, reply inbox, scaffold)
- ✅ Worker project scaffolded and TypeScript compiling
- ✅ Resend domain verified and API key ready
- ✅ All 5 email templates drafted and approved
- ✅ Ready to start Wave 2 implementation

---

## Wave 2 (Parallel after Wave 1 — Core Implementation)

These tasks implement the core Homeport functionality. They depend on Wave 1 foundation but can run in parallel with each other.

---

<task-plan id="phase-1-task-7" wave="2">
  <title>Implement KV Store Operations Module (get/set/unsub/dedup)</title>
  <requirement>R3 (KV Operations), R2 (Scheduler Logic)</requirement>
  <description>
    Build the KV store interface module (kv.ts) that handles all interactions with Cloudflare KV: project data retrieval, unsubscribe status checks, email send history (deduplication), and schedule tracking.

    This module abstracts KV operations so the scheduler and email sending logic doesn't deal with raw key naming.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 3.2 (KV Store Design with key structure)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.2 (KV Store design), Section 5.1 Risk (eventual consistency)" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference for TypeScript patterns in Workers" />
  </context>

  <steps>
    <step order="1">Create file: src/kv.ts</step>
    <step order="2">Define TypeScript interface: ProjectData { email, name, project_url, ship_date, project_name?, unsubscribed? }</step>
    <step order="3">Implement function: getProject(projectId: string): Promise<ProjectData | null>
      - Read KV key: project:{projectId}
      - Parse JSON and return, or return null if not found
      - No error thrown, just return null
    </step>
    <step order="4">Implement function: isUnsubscribed(email: string): Promise<boolean>
      - Read KV key: unsubscribed:{email}
      - Return true if key exists, false otherwise
    </step>
    <step order="5">Implement function: markUnsubscribed(email: string): Promise<void>
      - Write KV key: unsubscribed:{email} = "true"
      - No error handling needed (accept eventual consistency)
    </step>
    <step order="6">Implement function: recordSentEmail(projectId: string, day: number): Promise<void>
      - Write KV key: schedule:{projectId}:{day} = Date.now().toString()
      - Use this for deduplication (scheduler checks this before sending)
    </step>
    <step order="7">Implement function: hasSentEmail(projectId: string, day: number): Promise<boolean>
      - Read KV key: schedule:{projectId}:{day}
      - Return true if key exists, false otherwise
    </step>
    <step order="8">Export all functions as named exports</step>
    <step order="9">Add JSDoc comments explaining each function (no verbose comments, keep concise)</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck succeeds</check>
    <check type="manual">All 5 functions exported from src/kv.ts</check>
    <check type="manual">ProjectData interface defined with required fields</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="KV module builds on Worker scaffold (AFTERCARE_KV binding must exist in wrangler.toml)" />
  </dependencies>

  <commit-message>feat(kv): implement KV store operations module

Build abstraction layer for Cloudflare KV interactions:
- getProject(projectId): fetch project data by ID
- isUnsubscribed(email): check unsubscribe flag
- markUnsubscribed(email): set unsubscribe flag
- recordSentEmail(projectId, day): track sent emails (deduplication)
- hasSentEmail(projectId, day): check if already sent

Uses KV key structure: project:{id}, unsubscribed:{email}, schedule:{id}:{day}
Gracefully handles KV misses (return null/false, no errors).

Ready for scheduler integration in task-9.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-8" wave="2">
  <title>Implement Resend API Client Wrapper</title>
  <requirement>R4 (Resend API Client), R1 (Email Templates)</requirement>
  <description>
    Build lightweight Resend API client (resend.ts) that wraps the HTTP API for email sending. This client handles authentication, request formatting, response validation, and error logging — but NOT retry logic (accept single-send-only in V1).

    The client is kept minimal (~30-50 lines) to match Elon's 300-line code cap.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference Resend API integration pattern (lines 123-146)" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 2 (Resend Integration Pattern)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.4 (Plain text format requirement)" />
  </context>

  <steps>
    <step order="1">Create file: src/resend.ts</step>
    <step order="2">Define TypeScript interface: EmailInput { to: string, subject: string, text: string, replyTo?: string }</step>
    <step order="3">Implement function: sendEmail(env: Env, input: EmailInput): Promise<{id: string, ok: boolean}>
      - Fetch to https://api.resend.com/emails with POST method
      - Set headers: Authorization: Bearer ${env.RESEND_API_KEY}, Content-Type: application/json
      - Request body: { from: env.FROM_EMAIL, to: [input.to], subject, text, reply_to: input.replyTo }
      - Check response.ok and log success/failure
      - Parse response JSON and extract email ID
      - Return { id, ok: response.ok }
      - If response fails, log to console (no throw, let caller decide)
    </step>
    <step order="4">Define Env interface with RESEND_API_KEY and FROM_EMAIL variables</step>
    <step order="5">Add minimal error logging (console.error for failures)</step>
    <step order="6">Add JSDoc comments</step>
    <step order="7">Export sendEmail as named export</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck succeeds</check>
    <check type="manual">sendEmail function uses Bearer token auth</check>
    <check type="manual">Request body includes from, to, subject, text, reply_to fields</check>
    <check type="manual">Function returns object with id and ok properties</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Resend domain setup and API key generation must complete before this can be tested" />
    <depends-on task-id="phase-1-task-3" reason="Worker environment variables (RESEND_API_KEY, FROM_EMAIL) must be configured in wrangler.toml" />
  </dependencies>

  <commit-message>feat(resend): implement Resend API client wrapper

Build lightweight email sending client:
- sendEmail(env, {to, subject, text, replyTo}): sends via Resend API
- Bearer token authentication via RESEND_API_KEY secret
- Returns email ID and success flag
- Logs failures to console (no retry logic in V1)

Pattern copied from proven contact-form Worker integration.
Uses plain text emails only (no HTML).

Ready for scheduler integration in task-9.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-9" wave="2">
  <title>Implement Email Template Functions (5 templates: Day 7, 30, 90, 180, 365)</title>
  <requirement>R1 (Email Templates), R7 (Email Template Tests)</requirement>
  <description>
    Convert Steve's plain text email drafts into TypeScript functions. Each function takes ProjectData, returns a string containing the email body with personalization (name, URL) applied.

    Functions are tested in task-12, so keep them pure (no side effects, deterministic output).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 4.2 (Email template as pure functions example)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.4 (Plain Text Format)" />
    <file path="[Task 5 output]" reason="Steve's Day 7/30 drafts" />
    <file path="[Task 6 output]" reason="Steve's Day 90/180/365 drafts" />
  </context>

  <steps>
    <step order="1">Create file: src/emails.ts</step>
    <step order="2">Define TypeScript interface: ProjectData { name: string, project_url: string, project_name?: string, ship_date?: string }</step>
    <step order="3">Implement function: formatDay7(data: ProjectData): string
      - Use Steve's Day 7 draft text
      - Replace {name} with data.name
      - Replace {project_url} with data.project_url
      - Add unsubscribe link with placeholder token
      - Return plain text string (no HTML)
    </step>
    <step order="4">Implement function: formatDay30(data: ProjectData): string (similar pattern)</step>
    <step order="5">Implement function: formatDay90(data: ProjectData): string (similar pattern)</step>
    <step order="6">Implement function: formatDay180(data: ProjectData): string (similar pattern)</step>
    <step order="7">Implement function: formatDay365(data: ProjectData): string (similar pattern)</step>
    <step order="8">Create helper function: getEmailTemplate(day: number): (data: ProjectData) => string
      - Takes day number (7, 30, 90, 180, 365)
      - Returns corresponding format function
      - Used by scheduler to select template
    </step>
    <step order="9">Export all format functions and getEmailTemplate</step>
    <step order="10">Add JSDoc comments with example usage</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck succeeds</check>
    <check type="manual">All 5 format functions exported</check>
    <check type="manual">getEmailTemplate(7) returns formatDay7 function</check>
    <check type="manual">Sample output includes {name} and {project_url} replaced with test values</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Day 7/30 email drafts from Steve" />
    <depends-on task-id="phase-1-task-6" reason="Day 90/180/365 email drafts from Steve" />
  </dependencies>

  <commit-message>feat(emails): implement email template functions for all 5 lifecycle emails

Convert Steve's plain text templates into pure TypeScript functions:
- formatDay7(data: ProjectData): string
- formatDay30(data: ProjectData): string
- formatDay90(data: ProjectData): string
- formatDay180(data: ProjectData): string
- formatDay365(data: ProjectData): string
- getEmailTemplate(day): returns format function by day number

Templates personalize with {name} and {project_url} merge variables.
All templates plain text, include unsubscribe link in footer.

Ready for scheduler integration in task-10 and testing in task-12.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-10" wave="2">
  <title>Implement Unsubscribe Endpoint (GET /unsub?token=...)</title>
  <requirement>R5 (Unsubscribe Endpoint), R3 (KV Operations)</requirement>
  <description>
    Build the one-click unsubscribe endpoint that handles unsub links from emails. Decodes the token (base64-encoded email), marks the user as unsubscribed in KV, and returns a confirmation page.

    This endpoint is part of the Worker's HTTP route handler (alongside the cron scheduled handler).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 3.2 (Unsubscribe token management with base64 encoding)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 4.3 (Unsubscribe Flow - one-click KV flag)" />
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference for Worker route handler pattern" />
  </context>

  <steps>
    <step order="1">Create file: src/unsubscribe.ts (or add to src/index.ts directly)</step>
    <step order="2">Implement function: handleUnsubscribe(request: Request, env: Env): Promise<Response>
      - Parse query param: token from URL (new URL(request.url).searchParams.get('token'))
      - Decode token: Buffer.from(token, 'base64').toString('utf-8') to get email address
      - Call markUnsubscribed(email) from kv.ts to set KV flag
      - Return Response with 200 status and plain text confirmation: "You've been unsubscribed from Homeport emails."
      - Handle invalid token gracefully (return generic 404 or confirmation)
    </step>
    <step order="3">In src/index.ts, add route handler for GET /unsub:
      - Check if request.url contains /unsub
      - Call handleUnsubscribe and return response
      - This is part of the Worker's default export fetch handler
    </step>
    <step order="4">Add JSDoc comments with example unsubscribe URL</step>
  </steps>

  <verification>
    <check type="manual">Route GET /unsub?token=... is handled</check>
    <check type="manual">Token decoding works (test with base64-encoded email)</check>
    <check type="manual">Confirmation page returns 200 status</check>
    <check type="manual">KV flag is set after unsub (verify in KV dashboard)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Requires markUnsubscribed function from kv.ts" />
    <depends-on task-id="phase-1-task-3" reason="Worker route handler framework" />
  </dependencies>

  <commit-message>feat(unsub): implement one-click unsubscribe endpoint

Add GET /unsub?token={encoded_email} route to Worker:
- Decodes base64 token to extract email address
- Calls KV markUnsubscribed(email) to set unsubscribe flag
- Returns 200 confirmation: "You've been unsubscribed from Homeport emails."
- Handles invalid tokens gracefully

CAN-SPAM compliant one-click unsubscribe mechanism.

Ready for integration testing in Wave 3.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-11" wave="2">
  <title>Implement Scheduled Cron Job Logic (Daily scheduler that sends emails)</title>
  <requirement>R2 (Scheduler Logic), R3 (KV Operations), R4 (Resend API Client)</requirement>
  <description>
    Build the scheduled cron handler that runs daily at UTC midnight, scans KV for projects at each milestone (Day 7, 30, 90, 180, 365), and sends emails via Resend.

    This is the core business logic of Homeport. The scheduler:
    1. Iterates KV projects with ship_date
    2. Calculates elapsed days: (now - ship_date) / 86400
    3. Identifies projects matching Day 7, 30, 90, 180, 365 (±1 day tolerance)
    4. Skips already-sent emails (checks schedule:{id}:{day} in KV)
    5. Skips unsubscribed users
    6. Sends email and records sent date
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 8.1 Gap 1 (Scheduled Cron Jobs pattern)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.2 Architecture (Scheduler logic), Section 5.1 Risk (eventual consistency)" />
  </context>

  <steps>
    <step order="1">Create file: src/scheduler.ts</step>
    <step order="2">Implement function: getElapsedDays(shipDate: string): number
      - Parse ship_date as ISO 8601 (Date.parse(shipDate))
      - Calculate (now - shipDate) / 86400 (milliseconds to seconds to days)
      - Return Math.floor(elapsed)
    </step>
    <step order="3">Implement function: getNextMilestone(elapsedDays: number): number | null
      - Check if elapsedDays matches Day 7 (±1: 6-8), return 7
      - Check if elapsedDays matches Day 30 (±1: 29-31), return 30
      - Check if elapsedDays matches Day 90 (±1: 89-91), return 90
      - Check if elapsedDays matches Day 180 (±1: 179-181), return 180
      - Check if elapsedDays matches Day 365 (±1: 364-366), return 365
      - Return null if no match
    </step>
    <step order="4">Implement main cron handler: handleScheduledEvent(event, env: Env, ctx: ExecutionContext): Promise<void>
      - (This will be called by Worker scheduled trigger)
      - Iterate all projects in KV (note: KV doesn't have list(), so use wildcard key iteration)
      - For each project with ship_date:
        - Get elapsed days
        - Get next milestone (day to send)
        - Skip if already sent (hasSentEmail check)
        - Skip if unsubscribed (isUnsubscribed check)
        - Get email template (formatDay{X})
        - Send email via Resend
        - Record sent (recordSentEmail)
        - Log result to console
      - Handle errors gracefully (log, don't crash entire job)
    </step>
    <step order="5">In src/index.ts, add scheduled export:
      export default {
        async scheduled(event, env, ctx) {
          return handleScheduledEvent(event, env, ctx);
        }
      }
    </step>
    <step order="6">Add JSDoc comments with execution example</step>
  </steps>

  <verification>
    <check type="manual">getElapsedDays correctly calculates days since ship_date</check>
    <check type="manual">getNextMilestone returns 7, 30, 90, 180, or 365 based on elapsed days</check>
    <check type="manual">Scheduler skips already-sent emails (deduplication)</check>
    <check type="manual">Scheduler skips unsubscribed users</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="Uses KV operations (getProject, isUnsubscribed, hasSentEmail, recordSentEmail)" />
    <depends-on task-id="phase-1-task-8" reason="Uses sendEmail from Resend client" />
    <depends-on task-id="phase-1-task-9" reason="Uses getEmailTemplate to select template by day" />
    <depends-on task-id="phase-1-task-3" reason="Worker scaffold with scheduled trigger configuration" />
  </dependencies>

  <commit-message>feat(scheduler): implement daily scheduled cron job for lifecycle emails

Build core scheduler logic that runs daily at UTC midnight (0 0 * * *):
- Scans KV for projects with ship_date
- Calculates elapsed days: (now - ship_date) / 86400
- Identifies projects at Day 7, 30, 90, 180, 365 milestones (±1 day tolerance)
- Skips already-sent emails (checks schedule:{id}:{day})
- Skips unsubscribed users (checks unsubscribed:{email})
- Sends email via Resend API
- Records sent date in KV for deduplication

Handles KV eventual consistency gracefully (accepts rare duplicates).
Logs all executions to Cloudflare Worker logs.

Core business logic complete. Ready for Wave 2 integration.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-12" wave="2">
  <title>Build CSV-to-KV Import Script (Manual project data upload)</title>
  <requirement>R6 (CSV-to-KV Script), R3 (KV Operations)</requirement>
  <description>
    Create Node.js CLI script that parses the shipped project CSV (from task-1) and uploads each project record to KV store. This script runs once manually per CSV import and is the mechanism for V1 project initialization (before automated webhook in V1.1).

    Script should be idempotent (can run multiple times) and handle errors per-row (continue processing if one row fails).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 3.2 (CSV Upload Format), Section 10.1 (CSV to KV script estimate)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 4.1 (Project Data Source - manual CSV for V1)" />
  </context>

  <steps>
    <step order="1">Create file: scripts/csv-to-kv.ts</step>
    <step order="2">Implement CSV parser:
      - Read CSV file passed as CLI argument (process.argv[2])
      - Parse header row: project_id, customer_email, customer_name, project_url, ship_date
      - Parse each data row, validate required fields
      - Skip empty rows
    </step>
    <step order="3">Implement KV uploader using Wrangler CLI:
      - For each row, construct ProjectData object
      - Call wrangler kv:key put --namespace-id AFTERCARE_KV project:{project_id} "{json_data}"
      - Or use Node wrangler SDK to batch upload
    </step>
    <step order="4">Error handling:
      - Log which rows succeeded/failed
      - Continue processing even if one row fails
      - Exit with code 0 on success, 1 if all rows failed
    </step>
    <step order="5">Add usage instructions: `node scripts/csv-to-kv.ts ./projects.csv`</step>
    <step order="6">Optional: add --dry-run flag to preview without uploading</step>
  </steps>

  <verification>
    <check type="manual">Script reads CSV file correctly</check>
    <check type="manual">Script validates required fields (email, URL, date)</check>
    <check type="manual">Script uploads to KV with key format project:{id}</check>
    <check type="manual">Script logs success/failure per row</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires CSV from project data audit" />
  </dependencies>

  <commit-message>chore(scripts): implement CSV-to-KV import script for manual project upload

Build Node.js CLI for uploading shipped projects to KV store:
- Reads CSV: project_id, customer_email, customer_name, project_url, ship_date
- Validates required fields, skips empty rows
- Uploads each row as KV key: project:{project_id}
- Logs success/failure per row, continues on errors
- Exit code 0 on success, 1 on failure

Usage: npm run csv-to-kv ./projects.csv

V1 mechanism for manual project initialization (V1.1 will use webhook).

Ready for Wave 3 data population.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-13" wave="2">
  <title>Write Unit Tests — Email Template Rendering</title>
  <requirement>R7 (Email Template Tests), R1 (Email Templates)</requirement>
  <description>
    Build Vitest unit test suite that verifies email templates correctly interpolate variables and produce expected output. Tests ensure that {name} and {project_url} merge variables are replaced correctly, unsubscribe links appear, and output is plain text (no HTML).

    Minimal test suite (~30 tests across 5 templates) covering happy path and edge cases.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 4.2 (Example test structure for email templates)" />
  </context>

  <steps>
    <step order="1">Create file: tests/emails.test.ts</step>
    <step order="2">Import all email template functions from src/emails.ts</step>
    <step order="3">Create mock ProjectData: { name: "Jane Doe", project_url: "https://example.com", project_name: "My Site" }</step>
    <step order="4">For each template (Day 7, 30, 90, 180, 365):
      - Test that {name} is replaced: expect(result).toContain("Jane Doe")
      - Test that {project_url} is replaced: expect(result).toContain("https://example.com")
      - Test that unsubscribe link appears: expect(result).toContain("unsub?token=")
      - Test that output is plain text (no HTML): expect(result).not.toMatch(/<[^>]+>/g)
      - Test with empty name: expect output handles gracefully
    </step>
    <step order="5">Test getEmailTemplate function:
      - expect(getEmailTemplate(7)).toBe(formatDay7)
      - expect(getEmailTemplate(30)).toBe(formatDay30)
      - etc.
    </step>
    <step order="6">Add setup/teardown if needed (minimal for these tests)</step>
    <step order="7">Run all tests: npm run test:run (should show all passing)</step>
  </steps>

  <verification>
    <check type="test">npm run test:run — all email template tests pass</check>
    <check type="manual">All 5 template functions have test coverage</check>
    <check type="manual">Tests verify {name} and {project_url} replacement</check>
    <check type="manual">Tests verify unsubscribe link presence</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Email template functions from src/emails.ts" />
  </dependencies>

  <commit-message>test(emails): write unit tests for email template rendering

Build comprehensive test suite for email templates:
- Test each template (Day 7, 30, 90, 180, 365)
- Verify {name} merge variable replacement
- Verify {project_url} merge variable replacement
- Verify unsubscribe link appears in footer
- Verify output is plain text (no HTML)
- Test getEmailTemplate() function selector

All tests pass before Wave 3 integration.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-14" wave="2">
  <title>Write Unit Tests — Scheduler Logic (Milestone detection, deduplication)</title>
  <requirement>R8 (Scheduler Tests), R2 (Scheduler Logic)</requirement>
  <description>
    Build Vitest unit test suite that verifies scheduler logic correctly:
    - Calculates elapsed days from ship_date
    - Detects Day 7, 30, 90, 180, 365 milestones (±1 day tolerance)
    - Skips already-sent emails (deduplication)
    - Skips unsubscribed users

    Tests use mocked time and KV to avoid external dependencies.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 4.2 (Example test structure for scheduler)" />
  </context>

  <steps>
    <step order="1">Create file: tests/scheduler.test.ts</step>
    <step order="2">Import scheduler functions: getElapsedDays, getNextMilestone from src/scheduler.ts</step>
    <step order="3">Test getElapsedDays:
      - Ship 7 days ago: expect(getElapsedDays(dateMinusDays(7))).toBe(7)
      - Ship 30 days ago: expect(getElapsedDays(dateMinusDays(30))).toBe(30)
      - Ship 365 days ago: expect(getElapsedDays(dateMinusDays(365))).toBe(365)
      - Handle timezone: test in UTC
    </step>
    <step order="4">Test getNextMilestone:
      - 7 days elapsed → returns 7
      - 6 days elapsed → returns null
      - 8 days elapsed → returns null (wait until 30)
      - 30 days elapsed → returns 30
      - 89 days elapsed → returns null
      - 90 days elapsed → returns 90
      - etc. for 180, 365
      - Edge: 30.5 days → returns null (±1 day, not ±.5)
    </step>
    <step order="5">Test deduplication (mock KV):
      - hasSentEmail(projectId, 7) returns true if already sent → skip email
      - hasSentEmail returns false → proceed with send
    </step>
    <step order="6">Test unsubscribe skip (mock KV):
      - isUnsubscribed(email) returns true → skip email
      - isUnsubscribed returns false → proceed with send
    </step>
    <step order="7">Run all tests: npm run test:run (should show all passing)</step>
  </steps>

  <verification>
    <check type="test">npm run test:run — all scheduler tests pass</check>
    <check type="manual">Tests cover all 5 milestones (7, 30, 90, 180, 365)</check>
    <check type="manual">Tests verify ±1 day tolerance</check>
    <check type="manual">Tests verify deduplication skip</check>
    <check type="manual">Tests verify unsubscribe skip</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-11" reason="Scheduler functions from src/scheduler.ts" />
  </dependencies>

  <commit-message>test(scheduler): write unit tests for milestone detection and deduplication

Build test suite for scheduler logic:
- Test getElapsedDays(shipDate): verify day calculation
- Test getNextMilestone(days): verify Day 7/30/90/180/365 detection
- Test ±1 day tolerance (e.g., 6-8 days triggers Day 7)
- Test deduplication: hasSentEmail returns true → skip
- Test unsubscribe skip: isUnsubscribed returns true → skip

Mocked time and KV interactions (no external dependencies in tests).
All tests pass before Wave 3 integration.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-15" wave="2">
  <title>Integrate All Modules into Worker (src/index.ts main handler)</title>
  <requirement>R2 (Scheduler), R1 (Email Templates), R4 (Resend), R3 (KV), R5 (Unsub)</requirement>
  <description>
    Stitch together all Worker modules into a complete src/index.ts that exports:
    1. scheduled() handler for daily cron
    2. Route handler for GET /unsub
    3. Fallback handler for other routes (404)

    This is the final assembly of Wave 2 implementation before testing.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/src/index.ts" reason="Reference for Worker export pattern and route handling" />
  </context>

  <steps>
    <step order="1">Open src/index.ts (skeleton created in task-3)</step>
    <step order="2">Import all modules:
      - import { handleScheduledEvent } from './scheduler'
      - import { handleUnsubscribe } from './unsubscribe'
      - import { sendEmail } from './resend'
      - import { getProject, isUnsubscribed } from './kv'
      - etc.
    </step>
    <step order="3">Implement default export with two handlers:

      export default {
        async scheduled(event, env, ctx) {
          return await handleScheduledEvent(event, env, ctx);
        },

        async fetch(request, env, ctx) {
          const url = new URL(request.url);

          if (url.pathname === '/unsub' && request.method === 'GET') {
            return await handleUnsubscribe(request, env);
          }

          return new Response('Not Found', { status: 404 });
        }
      }
    </step>
    <step order="4">Add error boundary: catch unhandled errors, log, return 500</step>
    <step order="5">Verify TypeScript compiles: npm run typecheck</step>
  </steps>

  <verification>
    <check type="build">npm run typecheck succeeds</check>
    <check type="manual">src/index.ts exports both scheduled and fetch handlers</check>
    <check type="manual">GET /unsub route is handled</check>
    <check type="manual">Other routes return 404</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-7" reason="KV module" />
    <depends-on task-id="phase-1-task-8" reason="Resend API client" />
    <depends-on task-id="phase-1-task-9" reason="Email templates" />
    <depends-on task-id="phase-1-task-10" reason="Unsubscribe endpoint" />
    <depends-on task-id="phase-1-task-11" reason="Scheduler handler" />
  </dependencies>

  <commit-message>feat(worker): integrate all modules into main Worker handler

Assemble src/index.ts with complete request/schedule handling:
- Export scheduled() handler for daily cron (0 0 * * *)
- Export fetch() handler with route: GET /unsub?token=
- Import and wire: scheduler, kv, resend, emails, unsubscribe modules

Worker ready for deployment in Wave 3.
  </commit-message>
</task-plan>

---

### Wave 2 Summary

**Wave 2 Status:** 9 tasks implementing all core Homeport functionality

**Parallel execution:** Tasks 7-15 can run simultaneously
- All tasks depend on Wave 1 completion
- Internal dependencies exist (e.g., scheduler depends on kv, resend, emails)
- Parallel path exists: 7→11 (KV→Scheduler) and 8 (Resend) and 9→12-13 (Templates→Tests) can overlap

**Outcome by end of Wave 2:**
- ✅ KV operations module complete (get, set, unsub, dedup)
- ✅ Resend API client wrapper complete
- ✅ 5 email template functions implemented and tested
- ✅ Unsubscribe endpoint implemented
- ✅ Scheduler logic implemented and tested
- ✅ CSV-to-KV import script ready
- ✅ All modules integrated into Worker
- ✅ All unit tests passing (email rendering, scheduler logic)
- ✅ Ready for Wave 3 integration testing and deployment

---

## Wave 3 (Sequential after Wave 2 — Integration & Launch)

These tasks perform end-to-end testing, validation, and production deployment. They must run sequentially because each depends on the output of the previous.

---

<task-plan id="phase-1-task-16" wave="3">
  <title>Deploy Worker to Cloudflare Production</title>
  <requirement>R9 (Worker Scaffold), All core modules</requirement>
  <description>
    Deploy the complete Worker to Cloudflare production environment. This creates the live endpoint at aftercare.shipyard.ai and activates the scheduled cron job.

    Deployment is a one-time action that pushes the built code to Cloudflare's global edge network.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/workers/contact-form/README.md" reason="Reference deployment instructions if available" />
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 7 (Dependencies - wrangler setup)" />
  </context>

  <steps>
    <step order="1">Ensure all code is committed to git (clean working directory)</step>
    <step order="2">Set RESEND_API_KEY secret in production environment:
      cd /home/agent/shipyard-ai/workers/aftercare
      wrangler secret put RESEND_API_KEY --env production
      (Paste the API key from task-4)
    </step>
    <step order="3">Build Worker: npm run build (or wrangler build)</step>
    <step order="4">Deploy to production: npm run deploy --env production</step>
    <step order="5">Verify deployment: wrangler deployments list (shows the new deployment)</step>
    <step order="6">Test live endpoint: curl https://aftercare.shipyard.ai/unsub?token=... (should return confirmation)</step>
    <step order="7">Check Cloudflare dashboard: confirm cron trigger is active (0 0 * * *)</step>
  </steps>

  <verification>
    <check type="manual">Deployment completes without errors</check>
    <check type="manual">Cloudflare dashboard shows aftercare Worker deployed</check>
    <check type="manual">GET /unsub endpoint returns 200 with confirmation message</check>
    <check type="manual">Cron trigger is active in dashboard</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-15" reason="All modules must be integrated into Worker before deploying" />
    <depends-on task-id="phase-1-task-4" reason="Resend API key from domain setup" />
  </dependencies>

  <commit-message>chore(deploy): deploy Homeport Worker to Cloudflare production

Deploy final Worker build to production environment:
- Set RESEND_API_KEY secret
- Run wrangler deploy --env production
- Verify endpoint is live at aftercare.shipyard.ai
- Confirm cron trigger is active

Live Worker ready for data population and testing.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-17" wave="3">
  <title>Populate KV Store with Project Data (CSV Upload)</title>
  <requirement>R6 (CSV-to-KV Script), R3 (KV Operations)</requirement>
  <description>
    Run the CSV-to-KV import script (from task-12) to upload the shipped projects CSV (from task-1) into the live KV store. This initializes the database with real project data for testing and launch.

    After this step, the Worker has data to work with.
  </description>

  <context>
    <file path="[Task 1 output: projects CSV]" reason="Source data for KV upload" />
    <file path="[Task 12 output: csv-to-kv script]" reason="Upload script" />
  </context>

  <steps>
    <step order="1">Ensure CSV file exists: /tmp/shipyard-projects.csv (from task-1)</step>
    <step order="2">Run import script: cd /home/agent/shipyard-ai/workers/aftercare && npm run csv-to-kv /tmp/shipyard-projects.csv</step>
    <step order="3">Verify output: script should log "Uploaded X projects to KV"</step>
    <step order="4">Spot-check KV data: wrangler kv:key get --namespace-id AFTERCARE_KV project:proj_001 (should show JSON data)</step>
    <step order="5">Log into Cloudflare Workers KV dashboard and verify records appear</step>
  </steps>

  <verification>
    <check type="manual">Script runs without errors</check>
    <check type="manual">All rows from CSV are uploaded</check>
    <check type="manual">KV records appear in dashboard (project:{id} keys)</check>
    <check type="manual">Sample KV record contains all fields: email, name, project_url, ship_date</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Worker must be deployed (KV namespace is initialized)" />
    <depends-on task-id="phase-1-task-12" reason="CSV-to-KV script must exist" />
    <depends-on task-id="phase-1-task-1" reason="Project CSV data from audit" />
  </dependencies>

  <commit-message>chore(data): populate KV store with shipped projects data

Run CSV-to-KV import script to initialize production KV:
- Upload all projects from projects.csv
- Verify X projects successfully written to KV
- Spot-check KV records in Cloudflare dashboard

KV database ready for live email sending.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-18" wave="3">
  <title>Manual Testing: Send Test Emails to Internal Team</title>
  <requirement>All modules, R4 (Resend), R1 (Email Templates)</requirement>
  <description>
    Manually trigger the scheduler to send test emails to internal team (Phil, Steve, Elon) to verify end-to-end delivery: email composition, Resend API success, inbox placement.

    This validates the entire pipeline before production launch.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md" reason="Section 4.2 (Testing Strategy - test mode flag)" />
  </context>

  <steps>
    <step order="1">Modify one test project in KV to have ship_date exactly 7 days ago:
      wrangler kv:key put project:test_001 "{...ship_date: [7 days ago]...}"
    </step>
    <step order="2">Manually trigger cron handler (simulate scheduler):
      - Call Worker endpoint: POST /trigger (if implemented)
      - Or use wrangler local testing: wrangler dev and make request
      - Or manually execute scheduled handler in isolation (Node.js)
    </step>
    <step order="3">Monitor Resend dashboard: watch for email sending, check status</step>
    <step order="4">Check inbox: Phil, Steve, Elon should receive Day 7 test email</step>
    <step order="5">Verify email content:
      - Subject line is correct
      - Body includes {name} and {project_url} personalization
      - Unsubscribe link is clickable
      - Plain text formatting (no HTML corruption)
    </step>
    <step order="6">Test unsubscribe link: click on it, verify KV flag is set, verify no more emails sent to that address</step>
  </steps>

  <verification>
    <check type="manual">Test email arrives in inbox (not spam)</check>
    <check type="manual">Email subject line is visible</check>
    <check type="manual">Email body shows personalization ({name} and {project_url} replaced)</check>
    <check type="manual">Unsubscribe link is clickable</check>
    <check type="manual">Email is plain text (no HTML artifacts)</check>
    <check type="manual">Resend dashboard shows email as delivered</check>
    <check type="manual">Unsubscribe link sets KV flag and shows confirmation</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-17" reason="KV must be populated with test data" />
    <depends-on task-id="phase-1-task-16" reason="Worker must be deployed" />
  </dependencies>

  <commit-message>test(manual): send test emails to internal team for end-to-end validation

Manually trigger scheduler to send Day 7 test emails:
- Create test project with ship_date = 7 days ago
- Trigger scheduler (manual invocation)
- Verify email delivery via Resend dashboard
- Verify email content (subject, personalization, unsubscribe link)
- Test unsubscribe flow end-to-end

All delivery checks pass. Ready for production data and live go-live.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-19" wave="3">
  <title>Email Deliverability Validation (Mail-Tester, spam check)</title>
  <requirement>R10 (Resend Config), R4 (Resend), All email modules</requirement>
  <description>
    Validate that production emails pass spam filters and achieve high deliverability scores. This is a critical check before production launch.

    Forward a test email to mail@mail-tester.com, check score, and validate no spam triggers.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 5.1 Risk (Email Deliverability Issues)" />
  </context>

  <steps>
    <step order="1">Send another test email from the scheduler (or directly via Resend)</step>
    <step order="2">Forward test email to mail@mail-tester.com</step>
    <step order="3">Wait for Mail-Tester report (usually instant)</step>
    <step order="4">Check score: should be >9.0 / 10.0 (excellent deliverability)</step>
    <step order="5">Review details: check for any red flags:
      - SPF: PASS
      - DKIM: PASS
      - DMARC: PASS
      - Spam score: LOW
      - Blacklist status: CLEAN
    </step>
    <step order="6">If any red flags: debug and fix immediately (e.g., check DNS records, increase domain warmup time)</step>
  </steps>

  <verification>
    <check type="manual">Mail-Tester score is >9.0 / 10.0</check>
    <check type="manual">SPF, DKIM, DMARC all PASS</check>
    <check type="manual">Spam score is LOW</check>
    <check type="manual">No blacklist warnings</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-18" reason="Test email from internal testing" />
  </dependencies>

  <commit-message>test(deliverability): validate email spam score with Mail-Tester

Check email deliverability for production readiness:
- Forward test email to mail@mail-tester.com
- Verify score >9.0/10.0 (excellent)
- Verify SPF, DKIM, DMARC all PASS
- Verify spam score is LOW
- Verify no blacklist issues

Production-ready email delivery confirmed.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-20" wave="3">
  <title>Final Voice Review and Go-Live Approval</title>
  <requirement>All modules, R1 (Email Templates)</requirement>
  <description>
    Steve conducts final voice review of live email sends. Check that automation "smell test" passes: does the email feel human or robotic?

    Phil and Elon give final approval to activate production cron and begin live sending to customers.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 11 (Voice Lock - Steve's final word)" />
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md" reason="Voice principles" />
  </context>

  <steps>
    <step order="1">Steve reviews test email from task-18:
      - Read it aloud: does it sound human?
      - Would I send this to a friend?
      - Any corporate jargon or fake casual?
      - Any automation smell?
    </step>
    <step order="2">If Steve approves: move to step 4</step>
    <step order="3">If Steve finds issues: return to task-9 or task-5/6 to fix templates, re-test, re-send</step>
    <step order="4">Elon checks technical readiness:
      - Worker deployed and running
      - KV populated with real project data
      - Cron scheduled (0 0 * * * UTC)
      - Resend API key configured
      - All tests passing
    </step>
    <step order="5">Phil checks operational readiness:
      - Reply inbox assigned and monitored
      - SLA for response confirmed
      - Unsubscribe mechanism working
      - Data audit complete
    </step>
    <step order="6">Unanimous approval: go-live approved</step>
    <step order="7">Activate cron job (if not already active from deployment)</step>
  </steps>

  <verification>
    <check type="manual">Steve's voice review: APPROVED</check>
    <check type="manual">Elon's technical checklist: APPROVED</check>
    <check type="manual">Phil's operational checklist: APPROVED</check>
    <check type="manual">Cron trigger is active in Cloudflare dashboard</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-19" reason="All testing must be complete" />
    <depends-on task-id="phase-1-task-18" reason="Live email samples reviewed" />
  </dependencies>

  <commit-message>chore(approval): final voice review and go-live approval from Steve, Elon, Phil

Complete final sign-off before production launch:
- Steve: voice review APPROVED (passes automation smell test)
- Elon: technical readiness APPROVED (all systems operational)
- Phil: operational readiness APPROVED (reply inbox, SLA confirmed)

Cron job activated. Homeport is live.

Ready to monitor first customer emails and collect metrics for 90-day measurement period.
  </commit-message>
</task-plan>

---

<task-plan id="phase-1-task-21" wave="3">
  <title>Go-Live: Activate Production Cron and Begin Customer Sends</title>
  <requirement>All Wave 2 + Wave 3 preparation</requirement>
  <description>
    Final activation: the cron job is already configured to run daily at UTC midnight (set in task-3). This task confirms it's active and monitoring begins.

    After this, the system runs autonomously for 90 days without touching code (feature freeze from decisions.md Section 1.12).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md" reason="Section 1.12 (Feature Freeze)" />
  </context>

  <steps>
    <step order="1">Confirm cron is active: check Cloudflare Workers dashboard for aftercare Worker</step>
    <step order="2">View upcoming cron execution: dashboard should show "Next execution: [tomorrow at UTC midnight]"</step>
    <step order="3">Set up monitoring:
      - Cloudflare Worker logs: monitor for errors
      - Resend dashboard: watch open/click rates daily
      - Internal team: check internal email for unsubscribe/reply activity
    </step>
    <step order="4">Document go-live:
      - Record launch date/time
      - Record first batch of projects in KV
      - Record success metrics baseline (0 replies, 0 opens initially)
    </step>
    <step order="5">Lock code: no changes for 90 days (feature freeze in effect)</step>
  </steps>

  <verification>
    <check type="manual">Cloudflare dashboard confirms cron is active</check>
    <check type="manual">Next execution time is visible</check>
    <check type="manual">Monitoring dashboards are accessible</check>
    <check type="manual">Go-live timestamp documented</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-20" reason="Go-live approval must be granted first" />
  </dependencies>

  <commit-message>chore(go-live): activate production cron and begin customer lifecycle emails

Homeport is now live:
- Cron scheduled to run daily at UTC midnight (0 0 * * *)
- KV store populated with X shipped projects
- Resend API configured and verified
- Monitoring dashboards active

First lifecycle emails will send on next cron execution.

90-day feature freeze begins. Code is locked until post-launch analysis.
Metric collection begins: reply rate, open rate, unsubscribe rate.

Decision meeting scheduled for Day 91 to evaluate success.
  </commit-message>
</task-plan>

---

### Wave 3 Summary

**Wave 3 Status:** 6 tasks for integration, validation, and live launch

**Sequential execution:** Tasks must run in order (each depends on output of previous)
- Task 16: Deploy Worker
- Task 17: Populate data
- Task 18: Manual testing
- Task 19: Deliverability validation
- Task 20: Voice/approval review
- Task 21: Go-live activation

**Outcome at end of Wave 3:**
- ✅ Worker deployed to production
- ✅ KV store populated with real customer data
- ✅ End-to-end testing complete (email delivery, personalization, unsubscribe)
- ✅ Deliverability validated (Mail-Tester score >9/10)
- ✅ All stakeholders approved (Steve, Elon, Phil)
- ✅ Cron job active and monitoring begins
- ✅ **Homeport is LIVE**

---

## Project Timeline

### Day 0 (Pre-Build)
**Duration:** 4-8 hours (parallel work)

**Blockers to resolve:**
- Task 1: Audit project data ✅
- Task 2: Decide From address and reply inbox ✅
- Task 4: Configure Resend account ✅
- Tasks 5-6: Write email templates (Steve) ✅

**Outcome:** All blockers cleared, ready for Wave 1

---

### Day 1 (Build)
**Duration:** 24 hours (parallel tasks)

**Wave 1 (Foundation):** Tasks 1-6 (completed Day 0)
**Wave 2 (Implementation):** Tasks 7-15 in parallel

**Parallel paths:**
- Path A (KV + Scheduler): 7→11→15
- Path B (Resend): 8→15
- Path C (Templates): 9→12-13→15

**Outcome:** All code written, tested, and integrated

---

### Day 2 (Ship)
**Duration:** 24 hours (sequential validation)

**Wave 3 (Integration & Launch):** Tasks 16-21 in sequence

**Outcome:** **Homeport is LIVE**

---

## Risk Mitigation Summary

| Risk | Mitigation Task |
|------|-----------------|
| No project data | Task 1 (Day 0 blocker audit) |
| Email deliverability | Task 4 (Resend setup), Task 19 (Mail-Tester validation) |
| Bugs in email templates | Task 13 (Unit tests) |
| Bugs in scheduler | Task 14 (Unit tests) |
| Configuration errors | Task 3 (Scaffold + validate) |
| Unsubscribe broken | Task 10 (Implementation) + Task 18 (Manual testing) |
| Voice drift | Task 20 (Steve's final review) |
| Deployment failure | Task 16 (Deploy to production) |
| 48-hour timeline miss | Task 2, 3, 4 (Day 0 blockers), Wave 2 parallelization, 72-hour deadline buffer |

---

## Success Criteria (Complete Definition)

### Launch Day Checklist ✅
- [ ] Task 1: Project data validated (10+ projects)
- [ ] Task 2: Critical decisions locked (From email, reply owner)
- [ ] Task 3: Worker scaffolded and compiling
- [ ] Task 4: Resend configured and verified
- [ ] Tasks 5-6: Email templates approved by Steve
- [ ] Tasks 7-15: All code written, tested, integrated
- [ ] Task 16: Worker deployed to production
- [ ] Task 17: KV populated with real data
- [ ] Task 18: Test emails sent and verified
- [ ] Task 19: Deliverability score >9/10
- [ ] Task 20: Steve/Elon/Phil approval
- [ ] Task 21: Cron active, monitoring live

### 90-Day Measurement Metrics
- **Primary:** Reply rate ≥ 10% (success) or <5% (kill)
- **Secondary:** Revision request rate
- **Secondary:** Unsubscribe rate (kill if >15% in week 1)
- **Secondary:** Open rate

### Post-Launch Constraints
- 90-day feature freeze (no code changes)
- Monitor metrics weekly
- Respond to customer replies within SLA
- Document qualitative feedback

---

**Plan Generated:** 2026-04-16
**Status:** READY FOR EXECUTION
**Total Work Items:** 21 tasks across 3 waves
**Estimated Timeline:** 48 hours (2 days) from Day 0 blockers through Day 2 go-live

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson

---

## Appendix: File Structure After Execution

```
/home/agent/shipyard-ai/workers/aftercare/
├── wrangler.toml                    # ✅ Configured (task-3)
├── package.json                     # ✅ Created (task-3)
├── tsconfig.json                    # ✅ Created (task-3)
│
├── src/
│   ├── index.ts                     # ✅ Main Worker entry + routes (task-15)
│   ├── scheduler.ts                 # ✅ Cron logic (task-11)
│   ├── emails.ts                    # ✅ Template functions (task-9)
│   ├── resend.ts                    # ✅ API client (task-8)
│   ├── kv.ts                        # ✅ Store operations (task-7)
│   └── unsubscribe.ts               # ✅ Unsub endpoint (task-10)
│
├── scripts/
│   └── csv-to-kv.ts                 # ✅ CSV import (task-12)
│
├── tests/
│   ├── emails.test.ts               # ✅ Template tests (task-13)
│   └── scheduler.test.ts            # ✅ Scheduler tests (task-14)
│
├── .wrangler/                       # Build output (auto-generated)
└── README.md                        # Documentation (deployment guide, voice)

KV Store (Populated by task-17):
├── project:proj_001 → {email, name, project_url, ship_date, ...}
├── project:proj_002 → {...}
├── ...
└── unsubscribed:customer@example.com → "true" (if opted out)
```

---

End of Phase 1 Plan.
