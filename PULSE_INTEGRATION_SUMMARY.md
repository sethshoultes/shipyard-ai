# Pulse Engagement System - Implementation Summary

## Executive Overview

The LocalGenius codebase has a **mature, production-ready foundation** for building Pulse. The infrastructure for notifications, scheduled jobs, email/SMS delivery, and database management is already fully operational.

---

## Key Infrastructure Already in Place

### 1. Notification Delivery (Ready to Use)
- **Email:** Resend API (fully configured, multiple React Email templates)
- **SMS:** Twilio (fully configured, three SMS templates)
- **Preferences:** User-configurable channels (email/SMS/push) with defaults
- **Location:** `/src/services/email.ts`, `/src/services/sms.ts`, `/src/services/notification-preferences.ts`

### 2. Scheduled Job Execution (Ready to Use)
- **Entry point:** `/api/cron/run?job=<name>` (Bearer token secured)
- **Existing jobs:** Weekly digest, analytics rollup, token refresh, stale cleanup
- **Pattern:** Register jobs + Vercel crons call the dispatcher
- **Location:** `/src/app/api/cron/run/route.ts` + `/src/services/jobs/`

### 3. Database (Drizzle ORM, Multi-tenant)
- **16 tables** with full schema + indexes
- **Multi-tenancy:** Every table has organization_id + business_id
- **Type-safe:** Full TypeScript integration
- **Location:** `/src/db/schema.ts`

### 4. Authentication & Authorization
- **JWT-based:** 15-minute access tokens, 30-day refresh tokens
- **Tenant context:** Automatically extracted (userId, organizationId, businessId, plan)
- **Middleware:** All routes automatically protected via `verifyAuth()`
- **Location:** `/src/api/middleware/auth.ts`

### 5. API Route Patterns
- **Standard:** GET, POST, PUT, DELETE with Next.js App Router
- **Response format:** Consistent `{ data, meta }` or `{ error }` structure
- **Validation:** Zod schemas for all request bodies
- **Error handling:** Standardized error codes and messages

### 6. Telemetry & Monitoring
- **OpenTelemetry:** Request duration, status codes, error counts
- **AI metrics:** Token counts, latency for Claude API calls
- **Custom reporting:** `reportAIMetrics()` function for custom events
- **Location:** `/src/lib/telemetry.ts`

### 7. AI Integration
- **Provider:** Claude (Haiku for cost optimization, Opus for real-time)
- **Prompt caching:** 5-minute cache at 90% token discount
- **Service:** `/src/services/ai.ts` with generate(), generateSocialPost(), etc.
- **Telemetry:** All calls logged to `inferenceLogs` table

---

## Required for Pulse Implementation

### Database Schema Changes
**4 new tables needed:**
1. `pulse_badges` — Badge tracking
2. `pulse_journal_prompts` — Prompt library
3. `pulse_journal_entries` — User journal entries
4. `pulse_scheduled_notifications` — Notification queue

**Total LOC:** ~150 SQL lines (migration)

### Service Layer Changes
**5 new files needed:**
1. `/src/services/pulse-notifications.ts` — Main orchestration
2. `/src/services/pulse-badges.ts` — Badge generation logic
3. `/src/services/pulse-journal.ts` — Journal management
4. `/src/services/jobs/pulse-badges.ts` — Daily badge cron job
5. `/src/services/jobs/pulse-notifications.ts` — Notification dispatcher

**Total LOC:** ~1,000-1,200

### API Routes
**6 new endpoints:**
1. `GET /api/pulse/badges` — Get user's badges
2. `GET /api/pulse/journal/prompt` — Get today's prompt
3. `POST /api/pulse/journal/entry` — Save journal entry
4. `POST /api/pulse/notifications/schedule` — Schedule notification
5. `GET/PUT /api/pulse/notifications/preferences` — Manage preferences
6. Cron endpoint for jobs

**Total LOC:** ~500

### Email Templates
**3 new React Email templates:**
1. Badge earned notification
2. Journal reminder
3. Pulse insight digest

**Total LOC:** ~300

---

## Zero Setup Required For

- Email/SMS infrastructure
- Cron job dispatcher
- Database connection + ORM
- Authentication & authorization
- API route patterns
- Telemetry & monitoring
- AI model integration
- Error handling patterns

---

## Quick Start Implementation Order

### Phase 1: Foundation (Database + Services)
1. Create Drizzle migration for 4 tables
2. Create `/src/services/pulse-notifications.ts` (main orchestration)
3. Create `/src/services/pulse-badges.ts` (badge logic)
4. Create `/src/services/pulse-journal.ts` (journal logic)

**Effort:** 2-3 days
**Risk:** Low (follows existing patterns exactly)

### Phase 2: Jobs & Scheduling
1. Create `/src/services/jobs/pulse-badges.ts` (daily badge job)
2. Create `/src/services/jobs/pulse-notifications.ts` (notification dispatcher)
3. Register jobs with scheduler
4. Add Vercel cron entries

**Effort:** 1 day
**Risk:** Low (copy existing job patterns)

### Phase 3: API Routes
1. Create `/api/pulse/badges/route.ts`
2. Create `/api/pulse/journal/prompt/route.ts` + `/api/pulse/journal/entry/route.ts`
3. Create `/api/pulse/notifications/` routes

**Effort:** 1 day
**Risk:** Low (standard auth + response patterns)

### Phase 4: Email Templates & Integration
1. Create 3 React Email templates
2. Add notification types to preferences defaults
3. Integrate with existing notification checks

**Effort:** 1 day
**Risk:** Low (leverages existing Resend + Twilio setup)

### Phase 5: Frontend Components
1. Badge display component
2. Journal prompt UI
3. Notification preferences integration

**Effort:** 2 days
**Risk:** Low (no new patterns required)

---

## Critical Integration Points

### Badge Generation → Weekly Digest
```typescript
// In digest.ts generateDigest() function, after creating digest:
const badges = await generateBadgesForBusiness(businessId);
await queueBadgeNotifications(businessId, badges);
```

### Journal Prompt Distribution
```typescript
// New cron job runs daily:
const businesses = await db.select().from(businesses);
for (const biz of businesses) {
  const prompt = selectRandomPrompt();
  await scheduleNotification(biz.id, {
    type: 'journal_prompt',
    scheduledFor: getOptimalTime(biz.timezone),
  });
}
```

### Notification Preference Check
```typescript
// In pulse-notifications.ts before sending:
const prefs = await getNotificationPreferences(businessId);
const channels = prefs['badge_earned'];
if (channels.email) await sendBadgeEmail(...);
if (channels.sms) await sendBadgeSMS(...);
```

---

## Code Quality Standards

**All existing patterns to follow:**
- ✅ Lazy-initialized clients (no module-level init)
- ✅ Typed interfaces for all domain concepts
- ✅ Drizzle ORM for all database access
- ✅ Try-catch with context for errors
- ✅ Non-critical ops wrapped individually
- ✅ Zod validation for request bodies
- ✅ Consistent API response format
- ✅ JWT auth middleware on all routes
- ✅ Telemetry for all operations
- ✅ Multi-tenancy enforcement (org + biz IDs)

---

## Risk Assessment

| Component | Risk | Mitigation |
|-----------|------|-----------|
| Database migrations | Low | Use Drizzle-kit, test in dev |
| Cron jobs | Low | Test locally, use bearer token auth |
| Email/SMS sending | Low | Leverage existing services |
| Auth integration | None | Middleware already handles it |
| API routes | Low | Copy existing patterns exactly |
| Notification timing | Medium | Test timezone handling |

**Overall Risk:** LOW - LocalGenius provides mature scaffolding for Pulse

---

## File Locations Reference

| Component | Location |
|-----------|----------|
| Email service | `/src/services/email.ts` |
| SMS service | `/src/services/sms.ts` |
| Preferences | `/src/services/notification-preferences.ts` |
| Digest generation | `/src/services/digest.ts` |
| Cron dispatcher | `/src/app/api/cron/run/route.ts` |
| Job examples | `/src/services/jobs/` |
| Auth middleware | `/src/api/middleware/auth.ts` |
| DB schema | `/src/db/schema.ts` |
| Telemetry | `/src/lib/telemetry.ts` |
| Email templates | `/src/components/email/` |

---

## Next Steps

1. ✅ Review this document
2. ✅ Review full report: `CODEBASE_SCOUT_REPORT.md`
3. Create database migration
4. Implement Phase 1 (services)
5. Implement Phase 2 (jobs)
6. Implement Phase 3-5 (routes, templates, UI)

**Estimated total effort:** 1 week (conservative)

---

**Scout Report:** CODEBASE_SCOUT_REPORT.md (633 lines)
**Last updated:** April 18, 2026
