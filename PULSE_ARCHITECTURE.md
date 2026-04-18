# Pulse Engagement System - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PULSE ENGAGEMENT SYSTEM                  │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────┐ │
│  │  Badge Display  │  │  Journal UI     │  │  Notif     │ │
│  │   Component     │  │   Component     │  │  Prefs UI  │ │
│  └────────┬────────┘  └────────┬────────┘  └────────┬───┘ │
│           │                    │                    │      │
│           └────────────────────┴────────────────────┘      │
│                         │                                  │
│                    All routes require JWT auth            │
│                                                            │
└───────────────────────────────────────────────────────────┘
                         │
                         │ (JWT Authorization Header)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    API ROUTES (Next.js)                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  GET    /api/pulse/badges                                  │
│  GET    /api/pulse/journal/prompt                          │
│  POST   /api/pulse/journal/entry                           │
│  POST   /api/pulse/notifications/schedule                  │
│  GET/PUT /api/pulse/notifications/preferences              │
│  GET    /api/cron/pulse-badges       (Bearer CRON_SECRET)  │
│  GET    /api/cron/pulse-notifications (Bearer CRON_SECRET) │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ All routes:                                          │  │
│  │ - Verify JWT with verifyAuth() middleware           │  │
│  │ - Validate request body with Zod                    │  │
│  │ - Return {data, meta} or {error}                    │  │
│  │ - Report metrics via reportAIMetrics()              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────┬───────────────────────────────────────────────────┘
           │
           │ (Authenticate + Validate)
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ pulse-notifications.ts (Orchestration)               │ │
│  │ - Main entry point for all Pulse operations          │ │
│  │ - Coordinates badges, journal, notifications         │ │
│  │ - Delegates to other services                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         │               │               │                   │
│         ▼               ▼               ▼                   │
│   ┌──────────┐   ┌──────────┐   ┌──────────────────┐      │
│   │  Badges  │   │ Journal  │   │ Notification     │      │
│   │ Service  │   │ Service  │   │ Preferences      │      │
│   └──────────┘   └──────────┘   │ (Existing)       │      │
│         │               │        └──────────────────┘      │
│         └───────────────┼────────────────┬────────────────┐ │
│                         │                │                │ │
│                         ▼                ▼                ▼ │
│                    ┌──────────────────────────────────────┐ │
│                    │  Email Service (Resend)             │ │
│                    │  SMS Service (Twilio)               │ │
│                    │  (Both existing, pre-configured)    │ │
│                    └──────────────────────────────────────┘ │
│                                                              │
└──────────┬───────────────────────────────────────────────────┘
           │
           │ (Database queries via Drizzle)
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Existing Tables (19 total)                           │ │
│  │ - organizations, businesses, users, conversations    │ │
│  │ - messages, actions, content_items, reviews         │ │
│  │ - analytics_events, attribution_events, etc.        │ │
│  │ - business_settings (stores notification prefs)     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ New Pulse Tables (4 total)                           │ │
│  │ - pulse_badges                                       │ │
│  │   (id, business_id, organization_id, badge_type,    │ │
│  │    earned_at, description, created_at)              │ │
│  │                                                      │ │
│  │ - pulse_journal_prompts                             │ │
│  │   (id, prompt_text, category, theme, created_at)   │ │
│  │                                                      │ │
│  │ - pulse_journal_entries                             │ │
│  │   (id, business_id, organization_id, prompt_id,    │ │
│  │    entry_text, sentiment, themes, created_at)      │ │
│  │                                                      │ │
│  │ - pulse_scheduled_notifications                     │ │
│  │   (id, business_id, organization_id,               │ │
│  │    notification_type, scheduled_for, channels,     │ │
│  │    content, status, created_at)                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  All tables:                                                │
│  - Include organization_id + business_id (multi-tenant)    │
│  - Have proper indexes for common queries                  │
│  - Use PostgreSQL with Drizzle ORM (type-safe)            │
│  - Enforce RLS at database level                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  SCHEDULED JOBS (Cron)                       │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  /api/cron/run?job=pulse-badges                            │
│  └─▶ /src/services/jobs/pulse-badges.ts                    │
│      - Query businesses, analytics, reviews               │
│      - Generate badges based on business metrics          │
│      - Store in pulse_badges table                        │
│      - Queue badge_earned notifications                  │
│      - Runs daily or weekly (configurable)                │
│                                                              │
│  /api/cron/run?job=pulse-notifications                     │
│  └─▶ /src/services/jobs/pulse-notifications.ts            │
│      - Query pulse_scheduled_notifications (pending)      │
│      - Check notification preferences                     │
│      - Send via email.ts / sms.ts                         │
│      - Update status to 'sent'                            │
│      - Runs hourly                                        │
│                                                              │
│  Both jobs:                                                 │
│  - Secured with Bearer ${CRON_SECRET}                      │
│  - Return {success, duration_ms, details}                  │
│  - Can be triggered by Vercel crons or external scheduler │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Badge Generation Flow

```
Weekly Digest Generation
         │
         ▼
   digest.ts::generateDigest()
         │
         ├─ Gather metrics (reviews, posts, actions, etc.)
         ├─ Generate narrative via Claude
         ├─ Store in weeklyDigests table
         │
         └─▶ Call pulse-badges.ts::generateBadgesForBusiness()
              │
              ├─ Analyze business metrics
              ├─ Determine badge achievements
              ├─ Store in pulse_badges table
              │
              └─▶ Queue notifications
                   │
                   ├─ Create pulse_scheduled_notifications
                   ├─ Set scheduled_for per business timezone
                   │
                   └─▶ Dispatcher picks up when scheduled_for <= now
                        │
                        ├─ Get notification preferences
                        ├─ Send email (if prefs.badge_earned.email)
                        ├─ Send SMS (if prefs.badge_earned.sms)
                        └─ Mark as 'sent' in database
```

### 2. Journal Prompt Distribution Flow

```
Daily Cron Job (pulse-journals job)
         │
         ▼
   For each active business:
         │
         ├─ Select random prompt from pulse_journal_prompts
         ├─ Calculate optimal send time (business timezone)
         │
         └─▶ Queue notification
              │
              ├─ Create pulse_scheduled_notifications entry
              ├─ scheduled_for = tomorrow at optimal time
              ├─ notification_type = 'journal_prompt'
              │
              └─▶ Notification Dispatcher (runs hourly)
                   │
                   ├─ Find pending notifications (scheduled_for <= now)
                   ├─ Get business owner's preferences
                   ├─ Send via preferred channels (email/SMS)
                   └─ Mark as 'sent'
         │
         Owner sees prompt in:
         ├─ Email notification (if enabled)
         ├─ In-app notification (push)
         └─ Dashboard widget
         │
         ▼
   Owner submits journal entry
         │
         └─▶ POST /api/pulse/journal/entry
              │
              ├─ Verify JWT auth
              ├─ Validate entry text with Zod
              ├─ Insert into pulse_journal_entries table
              └─ Return {data: {success: true}, meta: {...}}
```

### 3. Notification Preference Flow

```
User updates preferences in UI
         │
         └─▶ PUT /api/pulse/notifications/preferences
              │
              ├─ Verify JWT auth
              ├─ Validate updates with Zod schema
              │
              └─▶ notification-preferences.ts::updateNotificationPreferences()
                   │
                   ├─ Get current preferences
                   ├─ Merge with updates
                   ├─ Upsert in businessSettings table
                   │  (platform: 'notification_prefs')
                   │
                   └─▶ Return updated preferences
                        │
                        └─ Dispatcher checks these before sending:
                           ├─ badge_earned: {email, sms, push}
                           ├─ journal_prompt: {email, sms, push}
                           └─ etc.
```

---

## Data Model

```
┌──────────────────────┐
│    organizations     │
├──────────────────────┤
│ id (PK)              │
│ name                 │
│ plan: "base"/"pro"   │
│ created_at           │
└───────────┬──────────┘
            │
            │ 1:N
            ▼
┌──────────────────────┐       ┌─────────────────────┐
│    businesses        │◀─────►│     users           │
├──────────────────────┤       ├─────────────────────┤
│ id (PK)              │       │ id (PK)             │
│ organization_id (FK) │       │ business_id (FK)    │
│ name                 │       │ email (unique)      │
│ vertical             │       │ phone               │
│ timezone             │       │ created_at          │
│ created_at           │       └─────────────────────┘
└───────────┬──────────┘
            │
            │ 1:N
            ├─────────────────────────────────────────┐
            │                                         │
            ▼                                         ▼
┌──────────────────────────┐        ┌──────────────────────────┐
│   pulse_badges           │        │ pulse_journal_prompts    │
├──────────────────────────┤        ├──────────────────────────┤
│ id (PK)                  │        │ id (PK)                  │
│ business_id (FK) [idx]   │        │ prompt_text              │
│ organization_id (FK)     │        │ category (e.g., growth)  │
│ badge_type (e.g.,        │        │ theme (e.g., revenue)    │
│  "weekly_warrior")       │        │ created_at               │
│ badge_tier (bronze/etc)  │        └──────────────────────────┘
│ earned_at                │                    │
│ description              │                    │ 1:N
│ created_at               │                    │
│ UNIQUE(business, type)   │                    ▼
└─────────────────┬────────┘        ┌──────────────────────────┐
                  │ 1:N             │pulse_journal_entries     │
                  │                 ├──────────────────────────┤
                  ├────────────────►│ id (PK)                  │
                  │                 │ business_id (FK) [idx]   │
                  │                 │ organization_id (FK)     │
                  │                 │ prompt_id (FK)           │
                  │                 │ entry_text               │
                  │                 │ sentiment (pos/neu/neg)  │
                  │                 │ themes (jsonb array)     │
                  │                 │ created_at               │
                  │                 │ reviewed_at              │
                  │                 └──────────────────────────┘
                  │
                  │ 1:N (badge earned triggers notification)
                  │
                  ▼
        ┌──────────────────────────────────────┐
        │pulse_scheduled_notifications         │
        ├──────────────────────────────────────┤
        │ id (PK)                              │
        │ business_id (FK) [idx on pending]    │
        │ organization_id (FK)                 │
        │ notification_type (e.g.,             │
        │  "badge_earned", "journal_prompt")   │
        │ scheduled_for [idx]                  │
        │ channels (["email", "sms"])          │
        │ content (jsonb: title, body, etc)    │
        │ status: "pending"/"sent"/"failed"    │
        │ error_details (jsonb)                │
        │ created_at                           │
        │ sent_at                              │
        │                                      │
        │ Index: (status, scheduled_for)       │
        │ Index: (business_id, created_at)    │
        └──────────────────────────────────────┘

References to Existing Tables:
- organization_id → organizations.id
- business_id → businesses.id
- prompt_id → pulse_journal_prompts.id
```

---

## Notification Flow (Detailed)

```
BADGE EARNED
     │
     ▼
Badge created in pulse_badges
     │
     ├─▶ Service checks: should notify?
     │   └─ YES → Create pulse_scheduled_notifications entry
     │      └─ Rows: [
     │           {
     │             business_id: xyz,
     │             notification_type: 'badge_earned',
     │             scheduled_for: now + 5 minutes,
     │             channels: ['email', 'sms'],
     │             content: {title: 'Badge Title', ...}
     │           }
     │         ]
     │
     ▼
/api/cron/run?job=pulse-notifications (runs hourly)
     │
     ├─ Query: WHERE status='pending' AND scheduled_for <= now
     │
     ├─ For each notification:
     │  │
     │  ├─ Get prefs = getNotificationPreferences(business_id)
     │  │
     │  ├─ If 'email' in channels AND prefs.badge_earned.email:
     │  │  └─ sendBadgeEmail(email, businessName, badge)
     │  │     └─ Uses PulseBadgeEmail.tsx template
     │  │     └─ Via Resend API
     │  │
     │  ├─ If 'sms' in channels AND prefs.badge_earned.sms:
     │  │  └─ sendBadgeSMS(phone, businessName, badge)
     │  │     └─ Via Twilio API
     │  │
     │  ├─ Update: pulse_scheduled_notifications.status = 'sent'
     │  └─ Update: pulse_scheduled_notifications.sent_at = now()
     │
     ▼
Owner receives notification in preferred channel(s)
     │
     ├─ Email: "Congratulations! You've earned the Weekly Warrior badge"
     ├─ SMS: "🏆 Congrats! Weekly Warrior badge earned"
     └─ Push: In-app notification (optional)
```

---

## Authentication & Authorization

```
All Pulse API routes protected by JWT:

1. Client sends request:
   GET /api/pulse/badges
   Authorization: Bearer <jwt_token>

2. verifyAuth() middleware:
   ├─ Extract token from header or cookie
   ├─ Verify signature with JWT_SECRET
   ├─ Decode payload:
   │  ├─ sub (user ID)
   │  ├─ org (organization ID)
   │  ├─ biz (business ID)
   │  └─ plan (subscription plan)
   │
   ├─ If invalid → Return 401 {error: {code: "UNAUTHORIZED", ...}}
   └─ If valid → Return AuthContext
      │
      ├─ auth.userId
      ├─ auth.organizationId
      ├─ auth.businessId
      └─ auth.plan

3. Service layer uses auth context:
   ├─ Query only data for auth.businessId
   ├─ Enforce organization_id match
   ├─ Check plan for feature access (if needed)

4. Database RLS enforces:
   ├─ All queries filtered by organization_id
   └─ Even if app bug, DB prevents data leakage
```

---

## Integration with Existing Systems

```
Pulse Services
        │
        ├──▶ Reuses: email.ts
        │    └─ sendEmail() function
        │    └─ React Email templates
        │    └─ Resend API client
        │
        ├──▶ Reuses: sms.ts
        │    └─ send() function
        │    └─ Twilio client
        │    └─ Phone number formatting
        │
        ├──▶ Reuses: notification-preferences.ts
        │    └─ getNotificationPreferences()
        │    └─ updateNotificationPreferences()
        │    └─ businessSettings table storage
        │
        ├──▶ Reuses: /api/cron/run route
        │    └─ Job registration & dispatch
        │    └─ Bearer token auth (CRON_SECRET)
        │    └─ Job history tracking
        │
        ├──▶ Reuses: Drizzle ORM
        │    └─ db connection
        │    └─ sql() helpers for aggregation
        │    └─ eq(), and(), gte() for filtering
        │
        ├──▶ Reuses: JWT auth middleware
        │    └─ verifyAuth() function
        │    └─ AuthContext extraction
        │    └─ 401 error handling
        │
        ├──▶ Reuses: Telemetry
        │    └─ reportAIMetrics()
        │    └─ meter/tracer for custom events
        │
        └──▶ Reuses: Database schema patterns
             └─ organization_id + business_id
             └─ Timestamp fields
             └─ Index naming conventions
             └─ Multi-tenancy RLS
```

---

## Error Handling Flow

```
Route Handler
    │
    ├─▶ Try: Call service function
    │   │
    │   ├─▶ Service validates input (Zod)
    │   │   ├─ If invalid: throw ZodError
    │   │   └─ If valid: proceed
    │   │
    │   ├─▶ Service queries database
    │   │   ├─ If error: throw database error
    │   │   └─ If success: continue
    │   │
    │   └─▶ Service returns result
    │       ├─ {success: true, data}
    │       └─ {success: false, error}
    │
    ├─▶ Catch: Multiple error types
    │   │
    │   ├─ instanceof z.ZodError
    │   │  └─ Return 400 {error: {code: "VALIDATION_ERROR", details: [...]}}
    │   │
    │   ├─ instanceof DatabaseError
    │   │  └─ Return 500 {error: {code: "DATABASE_ERROR", message: "..."}}
    │   │
    │   └─ Generic Error
    │      └─ Return 500 {error: {code: "INTERNAL_ERROR", message: "..."}}
    │
    └─▶ Return: NextResponse
        ├─ Success: {data: {...}, meta: {timestamp: "ISO-8601"}}
        └─ Error: {error: {code: "...", message: "...", details?: [...]}}
```

---

## Deployment & Monitoring

```
Vercel Deployment
        │
        ├─ Pull from git main branch
        │
        ├─ Install dependencies
        │
        ├─ Generate Drizzle migrations
        │
        ├─ Run database migrations
        │
        └─ Deploy Next.js app
           │
           ├─▶ API routes available
           │   └─ /api/pulse/* endpoints
           │   └─ /api/cron/pulse-* endpoints
           │
           └─▶ Cron jobs configured
               ├─ Vercel Cron UI → /api/cron/run?job=pulse-badges
               ├─ Vercel Cron UI → /api/cron/run?job=pulse-notifications
               └─ External service (e.g., EasyCron) → same endpoints

Monitoring
        │
        ├─ OpenTelemetry exports to observability platform
        │  ├─ http.request.duration per endpoint
        │  ├─ api.error.count (4xx/5xx responses)
        │  ├─ Custom metrics for badge generation
        │  └─ Custom metrics for notification delivery
        │
        ├─ Database logs
        │  ├─ Connection pool health
        │  ├─ Query performance (slow query log)
        │  └─ Transaction rollback events
        │
        └─ Email/SMS delivery
           ├─ Resend webhook for bounces/complaints
           ├─ Twilio delivery reports
           └─ Custom logging to database (pulse_notification_logs)
```

---

**Architecture Version:** 1.0
**Last Updated:** April 18, 2026
**Database:** PostgreSQL + Drizzle ORM
**Authentication:** JWT (15m access, 30d refresh)
**Notification Backends:** Resend (email), Twilio (SMS)
