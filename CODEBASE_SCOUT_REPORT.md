# LocalGenius Codebase Scout Report
## Pulse Engagement System Integration Map

**Date:** April 18, 2026
**Focus:** Building the Pulse Engagement System on LocalGenius infrastructure

---

## 1. DIRECTORY STRUCTURE OVERVIEW

```
/home/agent/localgenius/src/
├── app/
│   ├── (app)/                     # Authenticated user pages
│   ├── api/
│   │   ├── auth/                  # Auth endpoints (login, register, refresh)
│   │   ├── cron/                  # Scheduled job endpoints
│   │   │   ├── digest/            # Weekly digest generation
│   │   │   ├── run/               # Universal cron entry point
│   │   │   ├── meta-sync/         # Social sync
│   │   │   └── google-sync/       # Google sync
│   │   ├── notifications/         # Notification preferences/delivery
│   │   ├── analytics/             # Analytics aggregation
│   │   ├── conversations/         # AI conversation thread
│   │   ├── webhooks/              # Stripe, Google, Meta webhooks
│   │   └── [other routes]         # Reviews, content, actions, etc.
│   └── (marketing)/               # Public marketing pages
├── services/                      # Business logic layer
│   ├── email.ts                   # Resend email service
│   ├── sms.ts                     # Twilio SMS service
│   ├── digest.ts                  # Weekly digest generation
│   ├── campaign-engine.ts         # Campaign suggestions
│   ├── ai.ts                      # Claude API integration
│   ├── notification-preferences.ts
│   ├── jobs/
│   │   ├── analytics-rollup.ts    # Daily aggregation job
│   │   ├── token-refresh.ts       # OAuth token refresh
│   │   └── stale-cleanup.ts       # Cleanup jobs
│   └── [other services]           # Reviews, content, analytics, etc.
├── db/
│   ├── schema.ts                  # Drizzle ORM schema (16 tables)
│   └── seeds/
├── lib/
│   ├── db.ts                      # Lazy-initialized DB client
│   ├── api.ts                     # API client types
│   ├── logger.ts                  # Logging utility
│   ├── telemetry.ts               # OpenTelemetry instrumentation
│   └── [other utilities]
├── api/
│   └── middleware/
│       ├── auth.ts                # JWT verification
│       ├── telemetry.ts           # Request/AI metrics
│       ├── tenant.ts              # Multi-tenancy enforcement
│       └── rate-limit.ts          # Rate limiting
├── components/
│   ├── email/                     # React Email templates
│   ├── conversation/              # Chat UI
│   ├── digest/                    # Digest display
│   └── [other components]
└── hooks/                         # React hooks
```

---

## 2. EXISTING SERVICE PATTERNS TO FOLLOW

### 2.1 Service Architecture

**Pattern:** Modular, feature-focused services with clear responsibilities.

Examples:
- `email.ts` — single source of truth for all email sends
- `sms.ts` — all SMS logic, respects notification preferences
- `digest.ts` — contains both generation and batch processing logic
- `campaign-engine.ts` — converts insights → campaigns → actions

Key traits:
1. Lazy-initialized clients (avoid module-level initialization)
2. Typed interfaces for all domain concepts
3. Database access via Drizzle ORM (never raw SQL except for special cases)
4. Error handling returns success/error tuples or throws with context
5. Non-critical operations wrapped in try-catch (don't fail the whole operation)

### 2.2 API Route Patterns

**Structure:** Next.js App Router with standard HTTP method functions (GET, POST, PUT, DELETE).

**Authentication pattern:**
```typescript
import { verifyAuth } from "@/api/middleware/auth";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth instanceof NextResponse) return auth;

  const data = await getData(auth.businessId, auth.organizationId);
  return NextResponse.json({
    data: { ... },
    meta: { timestamp: new Date().toISOString() },
  });
}
```

**Response format (consistent):**
- Success: `{ data: {...}, meta: {timestamp: "ISO-8601"} }`
- Error: `{ error: { code: "ERROR_CODE", message: "...", details?: [...] } }`

**Validation pattern:** Zod schemas for request bodies

### 2.3 Database Access Patterns (Drizzle ORM)

**Multi-tenant enforcement:**
Every business-scoped table has both `organization_id` and `business_id`. RLS enforced at PostgreSQL level.

Key pattern:
```typescript
const [record] = await db
  .select()
  .from(myTable)
  .where(
    and(
      eq(myTable.businessId, businessId),
      eq(myTable.organizationId, organizationId)
    )
  )
  .limit(1);
```

Upsert pattern:
```typescript
await db
  .insert(myTable)
  .values({...})
  .onConflictDoUpdate({
    target: [myTable.businessId, myTable.platform],
    set: { config: updatedConfig, updatedAt: new Date() },
  });
```

### 2.4 Email/SMS Infrastructure

**Email Service (Resend)** — `/home/agent/localgenius/src/services/email.ts`
- Lazy-initialized Resend client
- React Email templates (JSX-based, server-rendered)
- API: `sendWelcomeEmail()`, `sendWeeklyDigestEmail()`, `sendNegativeReviewAlert()`, etc.

**SMS Service (Twilio)** — `/home/agent/localgenius/src/services/sms.ts`
- Lazy-initialized Twilio client
- Respects notification preferences
- Functions: `sendNegativeReviewSMS()`, `sendDigestSummarySMS()`, `sendBookingConfirmationSMS()`
- Checks `shouldSendSMS(businessId, notificationType)` before sending

**Notification Preferences** — `/home/agent/localgenius/src/services/notification-preferences.ts`
- Stored in `businessSettings` table with `platform: 'notification_prefs'`
- Supports 3 channels: email, SMS, push
- 8 notification types with defaults
- API endpoint: `GET/PUT /api/notifications/preferences`

---

## 3. CRON/SCHEDULED JOBS INFRASTRUCTURE

**Entry point:** `/home/agent/localgenius/src/app/api/cron/run/route.ts`

**How it works:**
- Vercel crons hit `/api/cron/run?job=<name>` with `Bearer ${CRON_SECRET}`
- Jobs registered and dispatched by name
- Returns detailed job history and execution results

**Existing jobs:**
1. `weekly-digest` — Monday 5 AM per timezone
2. `analytics-rollup` — Daily aggregation
3. `token-refresh` — OAuth token refresh
4. `stale-cleanup` — Cleanup old sessions/tokens

**Job result format:**
```typescript
interface JobResult {
  success: boolean;
  duration_ms: number;
  details: Record<string, unknown>;
  errors?: string[];
}
```

---

## 4. DATABASE SCHEMA OVERVIEW

**16 tables total:**
1. `organizations` — Multi-tenant root
2. `businesses` — Central entity
3. `users` — Business owners
4. `conversations` — One active thread per business
5. `messages` — Thread items
6. `actions` — All activities
7. `content_items` — AI-generated assets
8. `reviews` — Centralized review store
9. `review_responses` — Response tracking
10. `analytics_events` — Raw platform events
11. `attribution_events` — Actions → outcomes
12. `weekly_digests` — Pre-computed summaries
13. `benchmark_aggregates` — Anonymized data
14. `business_settings` — Platform connections
15. `scheduled_posts` — Future publications
16. `campaign_suggestions` — AI suggestions

**Key indexes:** All tables have indexes on business_id + relevant date/status fields

---

## 5. AUTHENTICATION & AUTHORIZATION

**JWT-based** — `/home/agent/localgenius/src/api/middleware/auth.ts`

**Access token:**
- Expiry: 15 minutes
- Payload: `{ sub: user_uuid, org: org_uuid, biz: biz_uuid, plan: "base"|"pro"|"franchise" }`
- Header: `Authorization: Bearer <token>` or cookie `lg_session`

**Refresh token:**
- Expiry: 30 days
- Uses rotation pattern

**Error codes:**
- `UNAUTHORIZED` — Missing/no token
- `INVALID_TOKEN` — Malformed payload
- `TOKEN_EXPIRED` — Token time expired

---

## 6. AI INTEGRATION PATTERNS

**Provider:** Anthropic Claude via `@anthropic-ai/sdk`

**Service:** `/home/agent/localgenius/src/services/ai.ts`

**Key functions:**
- `generate(prompt, maxTokens)` — Single completion
- `generateSocialPost(business, topic)` — Social post
- `generateReviewResponse(business, review)` — Review responses
- `generateDigestNarrative(business, metrics)` — Digest narrative

**Prompt caching:**
- System prompts cached for 5 minutes at 90% token discount

**Models used:**
- `claude-haiku-4-5-20251001` — Digest generation
- `claude-opus-4-5-20251101` — Real-time interactions

**Telemetry:**
- Token counts tracked
- Latency measured
- Success/failure logged to `inferenceLogs`

---

## 7. ERROR HANDLING PATTERNS

**Pattern 1: Try-catch with context**
```typescript
try {
  const result = await someOperation();
  return { success: true, data: result };
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return { success: false, error: message };
}
```

**Pattern 2: Non-critical operations wrapped individually**
```typescript
let seoScore = null;
try {
  const audit = await runAudit(businessId, organizationId);
  seoScore = { overall: audit.score.overall, ... };
} catch {
  // Non-critical — operation still completes
}
```

**Pattern 3: Validation via Zod**
```typescript
try {
  const validated = schema.parse(body);
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "...", details: error.errors } },
      { status: 400 }
    );
  }
}
```

---

## 8. TELEMETRY & LOGGING

**Instrumentation:** OpenTelemetry with HTTP exporter

**Metrics tracked:**
- `http.request.duration` — Per endpoint, per status code
- `api.error.count` — 4xx/5xx responses
- `ai.generation.duration` — Time in Claude API
- `ai.generation.tokens_input` — Input tokens per generation
- `ai.generation.tokens_output` — Output tokens per generation

**Usage in routes:**
```typescript
import { reportAIMetrics } from "@/api/middleware/telemetry";

const result = await generate({ prompt });
reportAIMetrics({
  durationMs: 1200,
  tokensInput: 500,
  tokensOutput: 200,
  model: "claude-haiku-4-5-20251001",
});
```

---

## 9. INTEGRATION POINTS FOR PULSE ENGAGEMENT SYSTEM

### 9.1 Where Notification Service Would Live

**Location:** `/home/agent/localgenius/src/services/pulse-notifications.ts`

**Responsibilities:**
- Badge generation logic
- Notification delivery orchestration
- Journal prompt management
- Scheduled notification queuing

**Will integrate with:**
- `email.ts` — Send notification emails
- `sms.ts` — Send notification SMS
- `notification-preferences.ts` — Check user preferences
- Database tables (new): `pulse_badges`, `pulse_notifications`, `pulse_journal_prompts`

### 9.2 Where Badge Generation Would Fit

**Option A: Synchronous in main services**
- Called from digest generation
- Called from analytics rollup job
- Instant feedback in conversation

**Option B: Async via new cron job**
- New job: `pulse-badges` — runs daily/weekly
- Queries analytics, generates badges
- Stores in `pulse_badges` table

**Recommended:** Hybrid
1. Generate badges during weekly digest (sync)
2. Update badge counts/status via daily cron (async)
3. Emit notifications based on badge achievement

### 9.3 Where Journal Prompts Would Be Served

**Location:** New API endpoint

**Structure:**
```typescript
// GET /api/pulse/journal/prompt
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  const prompt = await getJournalPrompt(auth.businessId);
  return NextResponse.json({ data: { prompt } });
}

// POST /api/pulse/journal/entry
export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  const body = await request.json();
  await recordJournalEntry(auth.businessId, body);
  return NextResponse.json({ data: { success: true } });
}
```

**Storage:**
- New table: `pulse_journal_entries`
  - `id`, `business_id`, `organization_id`
  - `prompt_id`, `entry_text`, `sentiment`, `theme`
  - `created_at`, `reviewed_at`

### 9.4 Where Scheduled Notifications Would Run

**Location:** New cron job

**Path:** `/home/agent/localgenius/src/app/api/cron/pulse-notifications/route.ts`

**Mechanism:**
1. Query `pulse_scheduled_notifications` (status = 'pending', scheduled_at <= now)
2. For each notification:
   - Get user preferences
   - Send email/SMS via existing services
   - Update status to 'sent'
3. Return summary

---

## 10. RECOMMENDED FILE LOCATIONS FOR PULSE FEATURES

```
/home/agent/localgenius/src/
├── db/
│   └── migrations/
│       └── [timestamp]_pulse_tables.sql
│
├── services/
│   ├── pulse-notifications.ts       ← Main service
│   ├── pulse-badges.ts              ← Badge generation
│   ├── pulse-journal.ts             ← Journal management
│   └── jobs/
│       ├── pulse-badges.ts          ← Daily badge update
│       └── pulse-notifications.ts   ← Notification dispatcher
│
├── app/api/
│   └── pulse/
│       ├── badges/route.ts          # GET: Get user badges
│       ├── journal/
│       │   ├── prompt/route.ts      # GET: Get today's prompt
│       │   └── entry/route.ts       # POST: Save entry
│       └── notifications/
│           ├── schedule/route.ts    # POST: Schedule notification
│           └── preferences/route.ts # GET/PUT: Notification prefs
│
└── components/
    └── pulse/
        ├── BadgeCard.tsx            # Badge display
        ├── JournalPrompt.tsx        # Prompt UI
        └── NotificationPrefs.tsx    # Preference manager
```

---

## 11. EXISTING INFRASTRUCTURE WE CAN LEVERAGE

### 11.1 Email/SMS Sending

**ALREADY SET UP:**
- Resend (email) - fully configured, multiple templates
- Twilio (SMS) - fully configured, multiple templates
- Notification preference system - complete

**For Pulse:**
Simply add new email templates and check preferences before sending.

### 11.2 Database & Multi-tenancy

**ALREADY SET UP:**
- Drizzle ORM for type-safe queries
- Multi-tenancy pattern (organization_id + business_id on all tables)
- RLS at PostgreSQL level
- Proper indexes for common queries

**For Pulse:**
Follow same pattern for new tables using Drizzle.

### 11.3 Cron Job Execution

**ALREADY SET UP:**
- Universal cron entry point at `/api/cron/run?job=<name>`
- Job scheduler/registry system
- Bearer token auth with CRON_SECRET
- History tracking

**For Pulse:**
Simply register new jobs and add to Vercel crons.

### 11.4 Notification Preferences

**ALREADY SET UP:**
- `notificationPreferences` service handles all preference logic
- Stored in `businessSettings` table
- 8 notification types with configurable channels
- API: `GET/PUT /api/notifications/preferences`

**For Pulse:**
Add new notification types to defaults and check before sending.

### 11.5 Telemetry & Monitoring

**ALREADY SET UP:**
- OpenTelemetry instrumentation
- Request duration, error counts, AI token tracking

**For Pulse:**
Track badge generation and notification delivery using same patterns.

### 11.6 Authentication & Authorization

**ALREADY SET UP:**
- JWT-based auth with 15-min expiry
- Tenant context extraction
- Auth middleware for all protected routes
- Refresh token rotation

**For Pulse:**
All endpoints automatically protected via middleware.

---

## 12. SCHEMA CHANGES REQUIRED FOR PULSE

**New tables to add:**

```sql
-- Pulse Badges
CREATE TABLE pulse_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  badge_type text NOT NULL,
  badge_tier text,
  earned_at timestamptz NOT NULL DEFAULT now(),
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, badge_type),
  INDEX idx_pulse_badges_business (business_id, earned_at)
);

-- Pulse Journal Prompts
CREATE TABLE pulse_journal_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_text text NOT NULL,
  category text,
  theme text,
  created_at timestamptz NOT NULL DEFAULT now(),
  INDEX idx_prompts_category (category)
);

-- Pulse Journal Entries
CREATE TABLE pulse_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  prompt_id uuid REFERENCES pulse_journal_prompts(id),
  entry_text text NOT NULL,
  sentiment text,
  themes jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  INDEX idx_journal_business (business_id, created_at)
);

-- Pulse Scheduled Notifications
CREATE TABLE pulse_scheduled_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid NOT NULL REFERENCES businesses(id),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  notification_type text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  channels jsonb NOT NULL,
  content jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  error_details jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  INDEX idx_pulse_notifications_pending (status, scheduled_for)
);
```

---

## 13. API RESPONSE FORMAT STANDARDS FOR PULSE

Follow existing LocalGenius pattern:

**Success:**
```json
{
  "data": {
    "badges": [...],
    "unlockedCount": 3
  },
  "meta": {
    "timestamp": "2026-04-18T15:30:00Z"
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [...]
  }
}
```

---

## 14. QUICK START CHECKLIST

- [ ] Create Drizzle migration for 4 new tables
- [ ] Push schema to database
- [ ] Create `/src/services/pulse-notifications.ts`
- [ ] Create `/src/services/pulse-badges.ts`
- [ ] Create `/src/services/pulse-journal.ts`
- [ ] Create job services in `/src/services/jobs/`
- [ ] Add API routes in `/src/app/api/pulse/`
- [ ] Create email templates in `/src/components/email/`
- [ ] Register jobs with scheduler
- [ ] Add Vercel cron entries
- [ ] Add notification types to preferences defaults
- [ ] Create React components for dashboard

---

## APPENDIX: FILE REFERENCE GUIDE

| File | Purpose | Integration Point |
|------|---------|-------------------|
| `/src/services/email.ts` | Email sending | Use for badge/journal emails |
| `/src/services/sms.ts` | SMS sending | Use for SMS notifications |
| `/src/services/notification-preferences.ts` | Preference storage | Check before sending |
| `/src/services/digest.ts` | Weekly digest | Call badge gen after digest |
| `/src/app/api/cron/run/route.ts` | Cron dispatcher | Register new jobs here |
| `/src/api/middleware/auth.ts` | Auth verification | Use in all Pulse routes |
| `/src/lib/db.ts` | Database connection | Import in all services |
| `/src/db/schema.ts` | Type-safe tables | Add new Pulse tables |
| `/src/components/email/*.tsx` | Email templates | Create new Pulse templates |
| `/src/lib/telemetry.ts` | Metrics | Track badge/notification metrics |

---

**Report generated:** April 18, 2026
**Codebase version:** main branch
**Next steps:** Start with database schema migration, then implement core services
