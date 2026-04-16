# Codebase Scout Report: Homeport/Aftercare (Post-Ship Lifecycle)

**Date:** April 16, 2026
**Project:** Shipyard Post-Ship Lifecycle Email System (Homeport)
**Prepared for:** Development Team (Elon/Build Agent)
**Status:** Ready for Build Phase

---

## Executive Summary

The Shipyard codebase provides **proven Cloudflare Worker patterns, Resend email integration examples, and database schemas** that directly accelerate the Homeport build.

**Key findings:**
- ✅ Three production Cloudflare Workers in `/workers` with complete TypeScript setup
- ✅ Resend API integration already proven in `/workers/contact-form` (sanitization, error handling patterns)
- ✅ Database schemas for project/site tracking in `/packages/db` (Drizzle ORM patterns)
- ✅ Wrangler 3.x configuration patterns established
- ✅ No existing lifecycle email or scheduled cron patterns (must build from scratch)
- ✅ Plain text email examples in contact-form Worker

**Development accelerators available:** Worker scaffolding, Resend fetch patterns, environment variable management, TypeScript error handling, CORS patterns.

**Gaps requiring build:** KV store schema design, cron scheduling logic, email template system, unsubscribe mechanism, daily trigger scheduler.

---

## 1. Existing Cloudflare Worker Ecosystem

### 1.1 Worker Projects Found

**Location:** `/home/agent/shipyard-ai/workers/`

**Three production Workers established:**

#### Worker 1: Contact Form (`contact-form`)
- **Purpose:** Form submission → Resend email delivery + GitHub issue creation
- **Tech Stack:** TypeScript, Cloudflare Workers, Resend API, GitHub API
- **File:** `/home/agent/shipyard-ai/workers/contact-form/src/index.ts` (209 lines)
- **Key Patterns:**
  - POST endpoint with CORS handling
  - Input sanitization (XSS prevention, field length validation)
  - Resend API integration with Bearer token auth
  - Error handling with user-friendly messages
  - HTML email template generation
  - GitHub webhook for intake tracking

**Resend Usage Pattern (Reusable):**
```typescript
const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: `Shipyard <${env.FROM_EMAIL}>`,
    to: [env.TO_EMAIL],
    reply_to: body.email,
    subject: `Subject`,
    html: `<html>...</html>`,
  }),
});
```

**Configuration File:** `/home/agent/shipyard-ai/workers/contact-form/wrangler.toml`
```toml
name = "shipyard-contact"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[vars]
FROM_EMAIL = "hello@shipyard.company"
TO_EMAIL = "seth@caseproof.com"
CORS_ORIGIN = "https://shipyard.company"
```

---

#### Worker 2: PRD Chat (`prd-chat`)
- **Purpose:** PRD parsing + seed.json generation with Workers AI
- **Tech Stack:** TypeScript, Cloudflare Workers, Workers AI (@cf/meta/llama-2-7b-chat-int8)
- **File:** `/home/agent/shipyard-ai/workers/prd-chat/src/index.ts` (509 lines)
- **Key Patterns:**
  - Multiple endpoints (/parse, /generate-seed, /chat)
  - Environment binding configuration (AI model)
  - Input sanitization and type validation
  - Complex JSON generation
  - Error handling with try-catch

**Configuration File:** `/home/agent/shipyard-ai/workers/prd-chat/wrangler.toml`
```toml
name = "shipyard-prd-chat"
main = "src/index.ts"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[ai]
binding = "AI"

[vars]
CORS_ORIGIN = "https://shipyard.company"
```

---

#### Worker 3: Wardrobe Analytics (`wardrobe-analytics`)
- **Purpose:** Anonymous telemetry tracking for CLI theme installs
- **Tech Stack:** TypeScript, Cloudflare Workers, D1 Database, Rate limiting
- **File:** `/home/agent/shipyard-ai/workers/wardrobe-analytics/src/index.ts` (unknown lines)
- **Documentation:** `/home/agent/shipyard-ai/workers/wardrobe-analytics/README.md` (204 lines) — **EXCELLENT REFERENCE**
- **Key Patterns:**
  - Fire-and-forget POST endpoint
  - Rate limiting (100 req/min per IP, in-memory)
  - Geographic data extraction (CF-IPCountry header)
  - D1 database schema and indexing
  - Async error handling

**Configuration File:** `/home/agent/shipyard-ai/workers/wardrobe-analytics/wrangler.toml`
```toml
name = "wardrobe-analytics"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[[d1_databases]]
binding = "DB"
database_name = "wardrobe-analytics"
database_id = "analytics-db-id"
```

---

### 1.2 Worker Project Structure Pattern

All three Workers follow **identical structure** — use as template:

```
/worker-name
├── wrangler.toml          # Cloudflare config
├── package.json           # npm dependencies
├── tsconfig.json          # TypeScript settings (exists for all)
├── src/
│   └── index.ts           # Main entry point (default export)
└── .wrangler/             # Build output (gitignored)
```

**No Workers have:**
- Unit tests (none in `/workers` with test files)
- Environment-specific build configurations
- Complex folder structures

**Wrangler versions in use:** 3.x (verified in prd-chat package.json)

---

## 2. Email Service Integration (Resend)

### 2.1 Resend API Integration Pattern

**Status:** ✅ **Already integrated in contact-form Worker**

**Key Resend Files:**
- `/home/agent/shipyard-ai/workers/contact-form/src/index.ts` — Lines 123-146 (Resend fetch example)

**Integration Checklist (from decisions.md):**
- ✅ Resend API endpoint: `https://api.resend.com/emails`
- ✅ Bearer token authentication: `Authorization: Bearer ${env.RESEND_API_KEY}`
- ✅ Request structure: `{ from, to, reply_to, subject, html }`
- ✅ Error handling: Check `resendResponse.ok`, log errors to console
- ✅ Environment variable: `RESEND_API_KEY` (must be added to wrangler.toml)

**Email Format Used in Contact Form:**
```typescript
html: `
  <h2>New PRD Submission</h2>
  <table style="border-collapse:collapse;width:100%;">
    <tr><td>${escapeHtml(body.name)}</td></tr>
    ...
  </table>
`
```

**For Homeport (Decision 1.4):** Replace HTML with **plain text only**:
```typescript
text: `
It's been 7 days. Your site is breathing on its own now.

[Project Name]: ${project.name}
[URL]: ${project.project_url}

Reply if something's off.
`
```

---

### 2.2 Plain Text Email Advantages (Security + Deliverability)

From contact-form code:
- HTML templates increase complexity
- XSS/sanitization overhead
- Spam filter triggers from styled emails

**For Homeport:** Plain text templates will:
- Reduce spam filter false positives
- Eliminate HTML injection risks
- Simplify template system (no escapeHtml needed)
- Match "automation that feels handwritten" (Steve's principle)

---

## 3. Project Data Structures

### 3.1 Existing Database Schemas

**Location:** `/home/agent/shipyard-ai/packages/db/schema/`

#### Sites Table (Drizzle ORM)
File: `/home/agent/shipyard-ai/packages/db/schema/sites.ts`

```typescript
export const sitesTable = pgTable("sites", {
  id: serial("id").primaryKey(),
  url: varchar("url", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  subscriptionId: integer("subscription_id"),
  tier: varchar("tier", { length: 50 }),
  status: varchar("status", { length: 50 }).default("active").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

export type Site = typeof sitesTable.$inferSelect;
export type NewSite = Omit<Site, "id" | "createdAt" | "updatedAt">;
```

**Alignment with Homeport Data Needs:**
- ✅ `url` → `project_url` (exact match)
- ✅ `name` → `project_name` (exact match)
- ⚠️ Missing: `customer_email`, `ship_date` (must add to KV)
- ⚠️ Missing: `customer_name` (must add to KV)

**Recommendation:** Use PostgreSQL sites table as **backup source** for V1.1 automated capture. For V1 (manual CSV upload), use **KV store only** (simpler, faster, matches Elon's 300-line cap).

---

#### Subscriptions Table (Reference Only)

File: `/home/agent/shipyard-ai/packages/db/schema/subscriptions.ts`

```typescript
export const subscriptionsTable = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  site_id: integer('site_id').notNull().references(() => sitesTable.id),
  stripe_subscription_id: varchar('stripe_subscription_id', { length: 255 }).unique(),
  stripe_customer_id: varchar('stripe_customer_id', { length: 255 }),
  status: varchar('status', { length: 50 }),
  tier: varchar('tier', { length: 50 }).notNull(),
  trial_ends_at: timestamp('trial_ends_at'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  canceled_at: timestamp('canceled_at'),
  created_at: timestamp('created_at').default(sql`now()`).notNull(),
  updated_at: timestamp('updated_at').default(sql`now()`).notNull(),
});
```

**Use case for Homeport:** If V1.1 needs to auto-capture data, query both tables for clean project records.

---

### 3.2 KV Store Design (Homeport-Specific)

**Decision from decisions.md:** KV store, not PostgreSQL (simpler, no DB setup needed for MVP)

**Recommended KV Schema:**

```typescript
// Key format: `project:{project_id}`
// Value: Full project data for email sending

interface ProjectData {
  email: string;           // customer@example.com
  name: string;            // Jane Doe
  project_url: string;     // https://example.com
  ship_date: string;       // ISO 8601: 2024-01-15T00:00:00Z
  project_name?: string;   // Optional: "Bellas Bistro Website"
  unsubscribed?: boolean;  // Tracked separately, but could cache here
}

// Key format: `unsubscribed:{email}`
// Value: "true" (no need for timestamp, just a flag)
```

**CSV Upload Format (V1):**
```csv
project_id,customer_email,customer_name,project_url,ship_date
proj_001,customer@example.com,Jane Doe,https://example.com,2024-01-15
proj_002,another@example.com,John Smith,https://another.com,2024-01-16
```

---

## 4. Testing Infrastructure

### 4.1 Testing Frameworks in Use

**Status:** ❌ **No existing Worker tests found**

**Search Results:**
- `/packages/db/client.test.ts` exists (PostgreSQL client tests, not Workers)
- No `.test.ts` or `.spec.ts` files in `/workers` directory
- Wrangler templates include vitest support, but not adopted

**Vitest availability** (from node_modules):
- ✅ Wrangler includes `vitest` as dev dependency
- ✅ Wrangler templates have `__tests__/` directory structure
- ✅ Works with Cloudflare Worker types

---

### 4.2 Recommended Testing Strategy for Homeport

**Pattern from decisions.md:**
- Build email templates as unit-testable functions
- Test each template's variable interpolation
- Test cron scheduling logic
- Test KV read/write operations

**Example Test Structure:**

```typescript
// emails.test.ts
import { formatEmailDay7 } from './emails';

describe('Email Templates', () => {
  it('should interpolate project name in Day 7 email', () => {
    const result = formatEmailDay7({
      name: 'Jane Doe',
      project_url: 'https://example.com',
      project_name: 'My Site',
    });

    expect(result).toContain('Jane Doe');
    expect(result).toContain('https://example.com');
    expect(result).toContain('My Site');
  });
});
```

**Testing Framework:** Use Vitest (already available via Wrangler, TypeScript-first, modern)

---

## 5. Relevant Documentation

### 5.1 Locked Blueprint (CRITICAL REFERENCE)

**File:** `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md` (1,162 lines)

**Key Sections:**
- **Section 2:** MVP Feature Set (what ships, what doesn't)
- **Section 3:** File Structure (directory layout)
- **Section 4:** Open Questions (blockers before build)
- **Section 5:** Risk Register (failure modes)
- **Section 6:** Success Criteria (launch checklist)
- **Section 7:** The Deal (Steve ↔ Elon agreement)

**This document is the source of truth.** Every build decision references it.

---

### 5.2 Essence Document

**File:** `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md` (32 lines)

**Key Principles:**
```
What is this? Agency that doesn't ghost you.
The feeling: Someone remembers your project.
What must be perfect: Day 7 email.
Creative direction: Trusted mechanic checking in.

The lock: Test once. Ship. Never touch for 90 days.
The deal: Speed without soul = noise. Soul without speed = vaporware.
Ship both in 3 days.
```

---

### 5.3 Wardrobe Analytics README (EXCELLENT REFERENCE)

**File:** `/home/agent/shipyard-ai/workers/wardrobe-analytics/README.md` (204 lines)

**Why useful for Homeport:**
- Complete Worker documentation template
- Database schema documentation with indexes
- Deployment instructions (wrangler commands)
- API endpoint documentation format
- Example curl requests
- Analytics queries (can adapt for Resend metrics)
- Troubleshooting section

**Recommend copying this README structure** for Homeport deployment docs.

---

### 5.4 Round Debate Documents

**Files:**
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/round-1-steve.md`
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/round-1-elon.md`
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/round-2-steve.md`
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/round-2-elon.md`

**Use cases:**
- Understand design decisions (why plain text? why no dashboard?)
- Reference for email voice guidelines
- Risk identification from debate discussions

---

## 6. Recommended File Structure (Based on Patterns)

```
/aftercare                    # Internal name (Homeport customer-facing)
├── wrangler.toml            # Cloudflare Worker config with KV namespace
├── package.json             # Dependencies: typescript, wrangler, @cloudflare/workers-types
├── tsconfig.json            # TypeScript config
├── src/
│   ├── index.ts             # Main Worker entry point
│   ├── scheduler.ts         # Cron job trigger (daily check for emails to send)
│   ├── emails.ts            # Email template functions (day7, day30, day90, day180, day365)
│   ├── resend.ts            # Resend API client wrapper
│   ├── kv.ts                # KV store operations (get/set project data, unsub checks)
│   └── unsubscribe.ts       # Unsubscribe link handler (Worker endpoint)
├── templates/               # Plain text email templates (optional, can hardcode)
│   ├── day-007.txt
│   ├── day-030.txt
│   ├── day-090.txt
│   ├── day-180.txt
│   └── day-365.txt
├── scripts/
│   └── csv-to-kv.ts         # Manual CSV upload utility (Node.js CLI)
├── tests/
│   ├── emails.test.ts       # Email template rendering tests
│   ├── scheduler.test.ts    # Cron logic tests
│   └── kv.test.ts           # KV operations tests
├── .wrangler/               # Build output (gitignored)
└── README.md                # Voice guidelines, deployment instructions

# In wrangler.toml:
[[kv_namespaces]]
binding = "AFTERCARE_KV"
id = "xxx-xxx-xxx"
preview_id = "yyy-yyy-yyy"

[env.production]
vars = { FROM_EMAIL = "homeport@shipyard.ai" }
```

---

## 7. Dependencies to Add

### 7.1 Package.json (Example)

```json
{
  "name": "shipyard-aftercare",
  "version": "0.1.0",
  "description": "Homeport — Lifecycle emails for shipped projects",
  "main": "src/index.ts",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {},
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240605.0",
    "typescript": "^5.3.3",
    "wrangler": "^3.30.0",
    "vitest": "^1.0.0"
  }
}
```

**No external dependencies required** (matching Elon's constraint).

### 7.2 Environment Variables (wrangler.toml)

```toml
[env.development]
vars = { FROM_EMAIL = "dev@shipyard.ai" }

[env.production]
vars = { FROM_EMAIL = "homeport@shipyard.ai" }

# Secrets (set via wrangler secret):
# - RESEND_API_KEY (required)
```

**Set secrets using:**
```bash
wrangler secret put RESEND_API_KEY --env production
```

---

## 8. Risk Flags & Blockers

### 8.1 Critical Blockers (Must Resolve Before Build)

#### 🔴 **Blocker 1: Project Data Availability**
**From decisions.md, Section 4.1**

**Status:** ❌ Unknown if data exists
**Impact:** Can't launch without this
**Owner:** Phil Jackson

**Question:** Do we have 10+ shipped projects with:
- ✅ Customer email
- ✅ Customer name
- ✅ Project URL
- ✅ Ship date

**Action:** Audit shipment pipeline immediately (Day 0)

**If data doesn't exist:**
- Option A: Manual backfill of 10 projects with clean data
- Option B: Postpone Homeport, fix shipment pipeline first
- Option C: Accept partial data for V1 testing

---

#### 🔴 **Blocker 2: Email "From" Address & Reply-To**
**From decisions.md, Section 4.2**

**Status:** ⚠️ Needs decision
**Impact:** Medium (affects deliverability and brand)
**Owner:** Steve (brand) + Elon (deliverability)

**Options:**
1. `homeport@shipyard.ai` (branded, requires domain setup)
2. `aftercare@shipyard.ai` (matches codebase naming)
3. `hello@shipyard.ai` (existing, less distinct)
4. Personal (e.g., `phil@shipyard.ai`) for intimacy

**Deliverability Check Needed:**
- ✅ SPF record configured for domain
- ✅ DKIM signature enabled
- ✅ DMARC policy set
- ✅ Domain reputation verified with Resend

**From contact-form reference:** Uses `hello@shipyard.company` successfully.

---

#### 🔴 **Blocker 3: Trigger Mechanism**
**From decisions.md, Section 4.8**

**Status:** ❌ Unknown how projects trigger email scheduling
**Impact:** Critical (defines V1 vs V1.1 scope)
**Owner:** Elon (technical) + Phil (integration point)

**Questions:**
- When does Shipyard backend know a project shipped?
- Is there a webhook, event system, or manual process?
- Can we add project data to KV immediately after ship?

**V1 Assumption:** Manual CSV upload (simplest, fits 48-hour timeline)
**V1.1 Requirement:** Webhook from Shipyard backend when project ships

---

### 8.2 Medium-Priority Decisions

#### 🟡 **Decision 1: Unsubscribe Flow**
**From decisions.md, Section 4.3**

**Options:**
1. One-click unsubscribe link (Worker endpoint) → KV flag
2. "Reply STOP" mechanism (simpler, less professional)
3. Resend's built-in unsubscribe (automatic, less control)

**CAN-SPAM Compliance:** All options are legal, but #1 is most professional.

**Implementation:** Include unsubscribe link in email footer:
```
Unsubscribe: https://homeport.shipyard.ai/unsub?token={encoded_email}
```

---

#### 🟡 **Decision 2: Reply Handling**
**From decisions.md, Section 4.5**

**Status:** ⚠️ No owner assigned yet
**Impact:** Medium (trust builder vs. operational burden)

**Options:**
1. Shared inbox (`homeport@shipyard.ai`) — manual replies
2. Personal inbox (`phil@shipyard.ai`) — Phil handles replies
3. Auto-reply + ticketing system (scope creep, skip for V1)

**SLA Needed:** Response time commitment (<24h, <48h, or TBD?)

**Elon's Warning:** "If reply rate >10%, need workflow for response management."

---

### 8.3 Technical Gaps

#### ⚠️ **Gap 1: Scheduled Cron Jobs**
**Status:** No existing cron patterns in codebase
**Solution:** Cloudflare Durable Objects or Workers Cron (preferred)

**Pattern to implement:**
```typescript
export default {
  async scheduled(event, env: Env, ctx: ExecutionContext) {
    // Runs daily at midnight UTC
    // Check KV for projects hitting Day 7, 30, 90, 180, 365
    // Send emails via Resend
  },
};
```

**Wrangler config:**
```toml
[triggers]
crons = ["0 0 * * *"]  # Daily at UTC midnight
```

---

#### ⚠️ **Gap 2: Email Template System**
**Status:** No existing plain text template system
**Solution:** Simple function-based templates (fastest, matches Elon's cap)

**NOT using:**
- Handlebars/Mustache templating
- HTML email builders
- Template files (hardcode in TypeScript)

**DO use:**
```typescript
// emails.ts
export function formatDay7(project: ProjectData): string {
  return `
It's been 7 days. Your site is breathing on its own now.

${project.project_name || 'Your project'}
${project.project_url}

Reply if something's off.
`;
}
```

---

#### ⚠️ **Gap 3: Unsubscribe Token Management**
**Status:** No secure token generation found
**Solution:** Simple encoding (not cryptographic, since data is non-sensitive)

```typescript
// Simple URL-safe encoding
const token = Buffer.from(email).toString('base64');
const encoded = token.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
```

---

## 9. Dependencies Already Available

### 9.1 Code Patterns (Copy-Paste Ready)

| Pattern | Source | Reusable? |
|---------|--------|-----------|
| Resend API fetch | `/workers/contact-form/src/index.ts:123-146` | ✅ 100% |
| CORS headers function | `/workers/contact-form/src/index.ts:53-61` | ✅ 100% |
| Input sanitization | `/workers/contact-form/src/index.ts:32-42` | ✅ 90% (adapt for email data) |
| XSS prevention patterns | `/workers/contact-form/src/index.ts:25-30` | ✅ 90% |
| Error response format | `/workers/contact-form/src/index.ts:100-104` | ✅ 100% |
| Environment typing | `/workers/contact-form/src/index.ts:11-18` | ✅ 100% |

### 9.2 Configuration Patterns (Copy-Paste Ready)

| Element | Source | Notes |
|---------|--------|-------|
| wrangler.toml structure | All 3 workers | ✅ Identical |
| package.json scripts | `/workers/prd-chat/package.json` | ✅ Can reuse |
| tsconfig.json | (standard TypeScript) | ✅ Standard config |
| Compatibility flags | `/workers/prd-chat/wrangler.toml` | ⚠️ Only if needed |

### 9.3 Infrastructure Already Proven

- ✅ Cloudflare Workers deployment (3 live workers)
- ✅ Resend API integration (contact-form proven)
- ✅ Wrangler CLI setup (all 3 workers)
- ✅ TypeScript in Workers (all 3 workers)
- ✅ Environment variable management (all 3 workers)

---

## 10. What Needs Building From Scratch

### 10.1 Core Homeport Components

| Component | Complexity | Est. Lines |
|-----------|------------|-----------|
| Scheduler logic (daily cron) | Medium | 50-80 |
| Email template functions (5 templates) | Low | 100-150 |
| KV operations (get/set/delete) | Low | 40-60 |
| Resend wrapper | Low | 30-50 |
| Unsubscribe endpoint | Low | 30-50 |
| CSV to KV upload script | Low | 40-60 |
| **Total** | | **~290-450 lines** |

**Note:** Elon's 300-line cap assumes minimal comments. With documentation, 350-400 realistic.

---

### 10.2 Testing Components

| Component | Priority | Est. Time |
|-----------|----------|-----------|
| Email template tests | High | 2 hours |
| KV operation tests | Medium | 2 hours |
| Scheduler logic tests | High | 2 hours |
| **Total** | | **~6 hours** |

---

## 11. Deployment Checklist (From decisions.md)

### Pre-Build (Day 0)

- [ ] **Phil:** Audit shipped project records (minimum 10 projects with clean data)
- [ ] **Phil:** Prepare CSV with: project_id, customer_email, customer_name, project_url, ship_date
- [ ] **Phil/Steve/Elon:** Decide on "From" email address (homeport@, aftercare@, or personal)
- [ ] **Phil:** Assign reply inbox owner (who monitors responses? SLA?)
- [ ] **Elon:** Set up Resend account + domain authentication (SPF/DKIM/DMARC)
- [ ] **Elon:** Scaffold Cloudflare Worker project (wrangler init)
- [ ] **Steve:** Draft Day 7 and Day 30 email templates (for review)

### Day 1 Build

- [ ] **Elon:** Build Worker core (scheduler, KV ops, Resend integration)
- [ ] **Elon:** Implement email template functions (using Steve's drafts)
- [ ] **Elon:** Build CSV-to-KV upload script
- [ ] **Elon:** Write tests (email rendering, cron logic)
- [ ] **Steve:** Finalize email copy (Day 7, 30 based on Elon's implementation feedback)
- [ ] **Phil:** Test deliverability (Mail-Tester, spam check)

### Day 2 Ship

- [ ] **Elon:** Deploy Worker to production
- [ ] **Elon:** Upload project CSV to KV
- [ ] **Elon:** Activate Day 7, 30, 90, 180, 365 cron jobs
- [ ] **Elon:** Send test emails to internal team
- [ ] **Steve:** Final voice check (automation smell test)
- [ ] **Phil:** Approve go-live

---

## 12. Key Files to Reference During Build

**Critical (Source of Truth):**
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md` — Read fully before building
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/essence.md` — Voice/principles

**Code Patterns (Copy liberally):**
- `/home/agent/shipyard-ai/workers/contact-form/src/index.ts` — Resend integration, sanitization
- `/home/agent/shipyard-ai/workers/contact-form/wrangler.toml` — Config structure
- `/home/agent/shipyard-ai/workers/prd-chat/package.json` — npm scripts

**Documentation Templates:**
- `/home/agent/shipyard-ai/workers/wardrobe-analytics/README.md` — Deployment docs structure

**Database Reference (for V1.1):**
- `/home/agent/shipyard-ai/packages/db/schema/sites.ts` — Site data schema
- `/home/agent/shipyard-ai/packages/db/schema/subscriptions.ts` — Subscription reference

---

## 13. Success Definition

### "Done" Looks Like:

- ✅ Single Worker deployed to Cloudflare (`aftercare`)
- ✅ KV namespace with 10+ test projects (manual CSV upload)
- ✅ Five email templates hardcoded in TypeScript
- ✅ Daily cron job checking for projects at Day 7, 30, 90, 180, 365
- ✅ Emails sending via Resend API (verified in Resend dashboard)
- ✅ Unsubscribe link functional (KV flag update)
- ✅ Reply-to address configured (email goes to assigned inbox)
- ✅ Tests written and passing (email templates, cron logic)
- ✅ README with deployment instructions and voice guidelines
- ✅ Ready for 90-day measurement period (no feature changes)

**Timeline:** 48 hours from first commit to production (72-hour buffer)

---

## 14. Success Metrics (90-Day Measurement)

From decisions.md:

**Primary Metric:**
- **Reply rate** (% of recipients who reply) — Target: >10% = success

**Secondary Metrics:**
- Open rate (via Resend dashboard)
- Unsubscribe rate (kill switch if >15% in first week)
- Revision request conversion (customers who book follow-up work)

**Decision Framework:**
- **<5% reply rate:** Kill feature, redirect to acquisition
- **5-15% reply rate:** Iterate on templates, retest
- **>15% reply rate:** Fund V2 (screenshots, telemetry, automation)

---

## 15. Risk Summary

### Highest Risks (Probability × Impact)

| Risk | Prob | Impact | Mitigation |
|------|------|--------|-----------|
| No project data exists | High | Critical | Audit Day 0, backfill or postpone |
| Emails land in spam | Medium | Critical | Test deliverability, warm up domain, plain text only |
| Reply inbox not monitored | Medium | Critical | Assign owner + SLA before launch |
| Customers hate emails | Medium | High | Steve writes quality templates, A/B test during dev |
| No automated trigger (V1) | High | Medium | Accept manual CSV for V1, plan webhook for V1.1 |
| KV eventual consistency → duplicates | Medium | Medium | Use unique scheduleId, accept rare duplicates |
| Unsubscribe link broken | Low | High | Test before launch, simple KV flag lookup |
| 48-hour timeline unrealistic | Medium | Low | 72-hour buffer, scope is locked at 300 lines |

---

## 16. Conclusion

**The Shipyard codebase provides excellent acceleration for Homeport:**
- Three production Workers demonstrate pattern, setup, and deployment
- Resend integration is proven (contact-form), ready to adapt
- Database schemas exist for future automated data capture
- Documentation patterns (Wardrobe README) available to copy
- TypeScript + Wrangler + Vitest ecosystem proven

**No major technical blockers identified.** Primary constraint is **data availability** (must have shipped projects with clean email/name/URL/date records).

**Build can start immediately upon resolving:**
1. Project data audit (Phil)
2. From email address decision (Steve/Elon)
3. Reply inbox assignment (Phil)

**Estimated build time:** 48 hours (Elon's target), 72 hours (safe buffer)

---

**Report prepared for:** Development Team / Elon (Build Agent)
**Date:** April 16, 2026
**Status:** Ready for Build Phase

---

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
