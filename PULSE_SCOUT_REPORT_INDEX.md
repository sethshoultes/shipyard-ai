# Pulse Engagement System - Codebase Scout Report Index

**Date:** April 18, 2026
**Mission:** Map LocalGenius codebase for Pulse Engagement System integration
**Status:** COMPLETE

---

## Documents Generated

### 1. CODEBASE_SCOUT_REPORT.md (633 lines)
**The Complete Technical Reference**

Comprehensive analysis of LocalGenius architecture including:
- Directory structure overview
- Service patterns (email, SMS, digest, campaigns)
- API route patterns (auth, response formats, validation)
- Database schema (16 tables + planned 4 new tables for Pulse)
- Cron job infrastructure
- Authentication & authorization
- AI integration patterns
- Error handling patterns
- Integration points for Pulse
- Recommended file locations
- Infrastructure we can leverage
- Schema changes required
- API response standards
- Testing patterns

**Use this document for:** Deep-dive technical reference, implementation guidance, code examples

---

### 2. PULSE_INTEGRATION_SUMMARY.md (260 lines)
**The Executive Overview**

High-level summary perfect for stakeholder communication:
- Key infrastructure already in place (7 items)
- Required for Pulse (4 database tables, 5 services, 6 API routes, 3 templates)
- Zero setup required for (8 items)
- Implementation phases (5 phases, 1 week total)
- Critical integration points
- Code quality standards (10 checkpoints)
- Risk assessment
- File locations reference

**Use this document for:** Stakeholder presentations, project planning, risk assessment, effort estimation

---

### 3. PULSE_ARCHITECTURE.md (835 lines)
**The Visual & Detailed Architecture**

Complete system design documentation with ASCII diagrams:
- System overview (flow from frontend → API → services → DB)
- Data flow diagrams (badge generation, journal distribution, preferences)
- Complete data model (ER diagram with all tables and relationships)
- Notification flow (detailed step-by-step)
- Authentication & authorization flow
- Integration with existing systems (what we reuse)
- Error handling flow
- Deployment & monitoring strategy

**Use this document for:** Architecture discussions, design reviews, developer onboarding, deployment planning

---

## Key Findings Summary

### What's Already Built ✅

1. **Email/SMS Delivery** (100% ready)
   - Resend API configured
   - Twilio configured
   - Multiple templates created
   - Notification preferences system complete

2. **Cron Jobs** (100% ready)
   - Universal dispatcher at `/api/cron/run?job=<name>`
   - Bearer token authentication
   - Job history tracking
   - 4 existing jobs as reference

3. **Database** (100% ready)
   - 16 tables with full schema
   - Multi-tenancy pattern (org + business IDs)
   - Type-safe Drizzle ORM
   - Proper indexing

4. **Authentication** (100% ready)
   - JWT-based (15m access, 30d refresh)
   - Middleware on all routes
   - Tenant context extraction

5. **API Routes** (100% ready)
   - Standard patterns
   - Consistent response format
   - Zod validation
   - Telemetry

6. **Telemetry** (100% ready)
   - OpenTelemetry instrumentation
   - Custom metric reporting
   - AI token tracking

7. **AI Integration** (100% ready)
   - Claude API configured
   - Prompt caching enabled
   - Multiple models available

### What We Need to Build 🚀

1. **Database Schema** (~150 SQL lines)
   - `pulse_badges` table
   - `pulse_journal_prompts` table
   - `pulse_journal_entries` table
   - `pulse_scheduled_notifications` table

2. **Services** (~1,200 LOC)
   - `pulse-notifications.ts` (orchestration)
   - `pulse-badges.ts` (badge generation)
   - `pulse-journal.ts` (journal management)
   - Job: `pulse-badges.ts` (daily job)
   - Job: `pulse-notifications.ts` (hourly dispatcher)

3. **API Routes** (~500 LOC)
   - `GET /api/pulse/badges`
   - `GET /api/pulse/journal/prompt`
   - `POST /api/pulse/journal/entry`
   - `POST /api/pulse/notifications/schedule`
   - `GET/PUT /api/pulse/notifications/preferences`
   - Cron endpoints

4. **Email Templates** (~300 LOC)
   - Badge earned notification
   - Journal reminder
   - Pulse insight digest

5. **Frontend Components** (TBD)
   - Badge display
   - Journal prompt UI
   - Notification preferences

### Implementation Timeline

- **Phase 1 (Days 1-3):** Database + services
- **Phase 2 (Day 4):** Jobs & scheduling
- **Phase 3 (Day 5):** API routes
- **Phase 4 (Day 6):** Email templates
- **Phase 5 (Day 7):** Frontend components

**Total Effort:** 1 week (conservative estimate)

### Risk Level: **LOW**

All implementation follows existing patterns exactly. Zero new architectural patterns required. Leverages fully-tested infrastructure.

---

## How to Use These Documents

### For Implementation Teams
1. Start with **PULSE_INTEGRATION_SUMMARY.md** to understand scope
2. Review **PULSE_ARCHITECTURE.md** for system design
3. Use **CODEBASE_SCOUT_REPORT.md** as implementation reference
4. Follow existing patterns from `/home/agent/localgenius/src/`

### For Product Managers
1. Read **PULSE_INTEGRATION_SUMMARY.md** (260 lines)
2. Review "Implementation Timeline" section
3. Understand "Zero Setup Required For" section (reduces risk significantly)

### For Engineering Leads
1. Review **PULSE_ARCHITECTURE.md** for system design
2. Check **PULSE_INTEGRATION_SUMMARY.md** for risk assessment
3. Use **CODEBASE_SCOUT_REPORT.md** sections 2-8 for code standards
4. Validate using **PULSE_INTEGRATION_SUMMARY.md** checklist

### For Developers
1. Use **CODEBASE_SCOUT_REPORT.md** as primary reference
2. Review patterns in `/home/agent/localgenius/src/services/` and `/api/`
3. Copy structure from existing services (email.ts, digest.ts, etc.)
4. Follow code quality standards in **PULSE_INTEGRATION_SUMMARY.md**

---

## Critical Code Examples

### Pattern 1: Service Response (from existing code)
```typescript
// From email.ts
type SendResult = EmailResult | EmailError;

async function send(options: {...}): Promise<SendResult> {
  try {
    const result = await sendOperation();
    if (error) return { success: false, error: error.message };
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: message };
  }
}
```

### Pattern 2: API Route (from existing code)
```typescript
// From /api/notifications/preferences/route.ts
export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth instanceof NextResponse) return auth;

  const preferences = await getNotificationPreferences(auth.businessId);
  
  return NextResponse.json({
    data: { preferences },
    meta: { timestamp: new Date().toISOString() },
  });
}
```

### Pattern 3: Database Query (from existing code)
```typescript
// From digest.ts
const [counts] = await db
  .select({
    total: sql<number>`count(*)`,
    socialPosts: sql<number>`count(*) filter (where ${actions.actionType} = 'social_post')`,
  })
  .from(actions)
  .where(
    and(
      eq(actions.businessId, businessId),
      eq(actions.organizationId, organizationId),
      eq(actions.status, "completed")
    )
  );
```

### Pattern 4: Cron Job (from existing code)
```typescript
// From /api/cron/run/route.ts
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid cron secret" } },
      { status: 401 }
    );
  }

  const jobName = request.nextUrl.searchParams.get("job");
  const result = await runJob(jobName);

  return NextResponse.json({
    data: { job: jobName, ...result, timestamp: new Date().toISOString() }
  });
}
```

---

## Integration Checklist

- [ ] Read PULSE_INTEGRATION_SUMMARY.md
- [ ] Review PULSE_ARCHITECTURE.md sections 1-3
- [ ] Review CODEBASE_SCOUT_REPORT.md sections 2-8
- [ ] Examine existing services in `/src/services/`
- [ ] Examine existing API routes in `/src/app/api/`
- [ ] Plan database migration (use Drizzle-kit)
- [ ] Create Phase 1 services
- [ ] Create Phase 2 jobs
- [ ] Create Phase 3 API routes
- [ ] Create Phase 4 email templates
- [ ] Create Phase 5 frontend components
- [ ] Test each phase locally
- [ ] Deploy to staging
- [ ] Deploy to production

---

## Files Referenced

### LocalGenius Codebase
- `/home/agent/localgenius/src/db/schema.ts` — 16 tables
- `/home/agent/localgenius/src/services/email.ts` — Email pattern
- `/home/agent/localgenius/src/services/sms.ts` — SMS pattern
- `/home/agent/localgenius/src/services/notification-preferences.ts` — Preferences pattern
- `/home/agent/localgenius/src/services/digest.ts` — Service pattern
- `/home/agent/localgenius/src/app/api/cron/run/route.ts` — Cron pattern
- `/home/agent/localgenius/src/api/middleware/auth.ts` — Auth pattern
- `/home/agent/localgenius/src/lib/telemetry.ts` — Telemetry pattern

### Scout Report Documentation
- `/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT.md` — Full technical reference (633 lines)
- `/home/agent/shipyard-ai/PULSE_INTEGRATION_SUMMARY.md` — Executive summary (260 lines)
- `/home/agent/shipyard-ai/PULSE_ARCHITECTURE.md` — Architecture & diagrams (835 lines)
- `/home/agent/shipyard-ai/PULSE_SCOUT_REPORT_INDEX.md` — This file

---

## Next Steps

1. ✅ **Understanding Phase** (Today)
   - Read these documents
   - Review existing code patterns
   - Understand multi-tenancy model

2. **Design Phase** (1 day)
   - Review architecture with team
   - Plan database migrations
   - Define badge logic

3. **Implementation Phase** (5 days)
   - Follow 5-phase approach
   - Copy existing patterns
   - Test incrementally

4. **QA Phase** (1 day)
   - Integration testing
   - Timezone handling
   - Notification delivery

5. **Deployment Phase** (0.5 days)
   - Staging validation
   - Production rollout
   - Monitor telemetry

---

## Support Resources

**For questions about:**
- **Database patterns** → See CODEBASE_SCOUT_REPORT.md Section 2.3
- **API patterns** → See CODEBASE_SCOUT_REPORT.md Section 2.2
- **Authentication** → See PULSE_ARCHITECTURE.md "Authentication & Authorization"
- **Email/SMS** → See CODEBASE_SCOUT_REPORT.md Section 2.4
- **Cron jobs** → See CODEBASE_SCOUT_REPORT.md Section 3
- **Overall architecture** → See PULSE_ARCHITECTURE.md Section "System Overview"
- **Implementation order** → See PULSE_INTEGRATION_SUMMARY.md "Quick Start Implementation Order"

---

**Report Generated:** April 18, 2026
**Total Documentation:** 1,728 lines across 3 comprehensive documents
**Code Examples:** 20+ inline examples
**Diagrams:** 10+ ASCII architecture diagrams
**Estimated Reading Time:** 2-3 hours for complete understanding

