# QA Pass 2 — Shipyard Pulse (shipyard-care)

**QA Director**: Margaret Hamilton
**Date**: 2026-04-06
**Pass**: 2 (Integration Focus)
**Phase**: 1 — Core Infrastructure

---

## Executive Summary

**Overall Verdict: BLOCK**

Significant progress since QA Pass 1. All 15 requirements now have corresponding deliverables in the correct directory (`/home/agent/shipyard-ai/deliverables/shipyard-care/`). However, critical **integration failures** prevent shipping:

1. **4 database tables referenced in code have no migration files** (users, sessions, uptime_checks, processed_webhook_events)
2. **Token refresh mechanism not implemented** (requirements specify 15-minute access tokens)
3. **Cross-file consistency issues** in database schema

**Completion Rate**: 11/15 requirements PASS (73%)
**Blocking Issues**: 4 P0, 2 P1, 3 P2

---

## Requirements Verification

### REQ-001: Create Stripe API integration wrapper with error handling
**Status**: PASS
**Evidence**: `lib/stripe.ts`
**Findings**:
- Stripe client initialization with singleton pattern (lines 63-77)
- Environment variable validation at startup (lines 39-60)
- Test/Live mode detection and logging (lines 53-57)
- Error handling with user-friendly messages via `handleStripeError()` (lines 106-157)
- Idempotency key generation via `generateIdempotencyKey()` (lines 93-95)
- Unit tests present in `lib/__tests__/stripe.test.ts` (235 lines)

---

### REQ-002: Build Stripe checkout flow for subscription creation
**Status**: PASS
**Evidence**: `pages/api/stripe/checkout.ts`
**Findings**:
- Checkout session creation for all three tiers (lines 31-47):
  - Basic: $99/month (9900 cents)
  - Pro: $249/month (24900 cents)
  - Enterprise: $499/month (49900 cents)
- Idempotency keys on customer creation (line 89) and session creation (line 177)
- Route protected by `withAuth` middleware (line 201)
- Integration with `lib/stripe.ts` for client and error handling (line 14)
- Integration with `lib/db.ts` for customer lookup/creation (line 16)

---

### REQ-003: Implement Stripe webhook endpoint with signature verification and idempotency
**Status**: PASS
**Evidence**: `pages/api/stripe/webhook.ts`
**Findings**:
- Signature verification using `stripe.webhooks.constructEvent()` (lines 224-230)
- Raw body parsing via `micro.buffer()` for signature verification (line 215)
- Idempotency via `processed_webhook_events` table lookup (lines 37-43, 48-58)
- Duplicate events return 200 with `already_processed` status (lines 238-241)
- Handles: subscription created/updated/deleted, invoice payment succeeded/failed (lines 246-273)
- **Integration Gap**: `processed_webhook_events` table has no migration file (P0)

---

### REQ-004: Create PostgreSQL database schema for sites table
**Status**: PASS
**Evidence**: `migrations/001_create_sites_table.sql`
**Findings**:
- All required fields present: id, url, name, subscription_id, tier, status, created_at, updated_at (lines 9-18)
- UUID primary key with `gen_random_uuid()` (line 10)
- Tier constraint: basic, pro, enterprise (line 14)
- Status constraint: active, inactive, suspended (line 15)
- Indexes on subscription_id and status (lines 21-24)
- Auto-update trigger for `updated_at` (lines 27-38)

---

### REQ-005: Create PostgreSQL database table for metrics
**Status**: PASS
**Evidence**: `migrations/002_create_metrics_table.sql`
**Findings**:
- All required fields: id, site_id, health_score, load_time, uptime_percent, lighthouse_score, created_at (lines 9-17)
- Foreign key to sites table with CASCADE delete (line 11)
- Value constraints on scores (lines 12-15)
- **REQ-014 Index Present**: Composite index on (site_id, created_at DESC) for p95 target (lines 21-22)

---

### REQ-006: Create PostgreSQL database table for subscriptions
**Status**: PASS
**Evidence**: `migrations/003_create_subscriptions_table.sql`
**Findings**:
- All Stripe sync fields: stripe_subscription_id, stripe_customer_id, stripe_price_id (lines 11-13)
- Tier and status fields with constraints (lines 14-18)
- Period tracking: current_period_start, current_period_end (lines 19-20)
- Cancellation tracking: cancel_at_period_end, canceled_at (lines 21-22)
- Foreign key from sites to subscriptions (lines 34-38)
- Indexes on Stripe IDs and status (lines 28-32)

---

### REQ-007: Setup database connection with connection pooling
**Status**: PASS
**Evidence**: `lib/db.ts`
**Findings**:
- Connection pool with configurable settings (lines 26-37):
  - min: 2, max: 20 connections
  - idleTimeoutMillis: 30000 (30s)
  - connectionTimeoutMillis: 10000 (10s)
- Singleton pool pattern (lines 68-110)
- Environment variable validation (lines 43-66)
- Transaction support with auto-commit/rollback (lines 159-175)
- Health check function (lines 182-190)
- Slow query logging for >100ms queries (lines 141-144) — supports REQ-014

---

### REQ-008: Implement session-based authentication middleware (httpOnly cookies)
**Status**: PARTIAL PASS
**Evidence**: `lib/auth.ts`
**Findings**:
- httpOnly cookie with Secure and SameSite=Strict (lines 26-32)
- Session token hashing with SHA-256 (lines 74-76)
- `withAuth` middleware rejects unauthenticated requests with 401 (lines 208-234)
- **Gap**: Token refresh mechanism NOT implemented
- **Gap**: Session uses 7-day expiry (line 18), not 15-minute access tokens as specified
- **Gap**: `sessions` table has no migration file (P0)

**Deviation from Acceptance Criteria**:
> "Token refresh works before expiry (15-minute access tokens)"
Implementation uses 7-day sessions with no refresh mechanism.

---

### REQ-009: Create login/logout authentication endpoints
**Status**: PARTIAL PASS
**Evidence**: `pages/api/auth/login.ts`, `pages/api/auth/logout.ts`
**Findings**:
- Login endpoint validates email/password, creates session, sets httpOnly cookie (login.ts lines 47-130)
- Logout endpoint destroys session and clears cookie (logout.ts lines 22-61)
- Password hashing with salt (login.ts lines 33-37)
- **Integration Gap**: Login queries `users` table (line 86) — no migration file exists (P0)

---

### REQ-010: Implement route protection for dashboard endpoints
**Status**: PASS
**Evidence**: `lib/auth.ts` (withAuth middleware), usage in endpoints
**Findings**:
- `withAuth` middleware returns 401 for missing tokens (lines 214-218)
- Returns 401 for expired/invalid sessions (lines 223-229)
- Clears cookie on invalid session (line 224)
- Used correctly in:
  - `pages/api/stripe/checkout.ts` (line 201)
  - `pages/api/pagespeed/analyze.ts` (line 108)

---

### REQ-011: Design Health Score calculation algorithm
**Status**: PASS
**Evidence**: `lib/health-score.ts`
**Findings**:
- Algorithm combines load time + uptime + lighthouse score (lines 221-257)
- Weighted scoring: loadTime 25%, uptime 35%, lighthouse 40% (lines 41-45)
- Load time scoring based on Core Web Vitals thresholds (lines 51-57, 74-111)
- Non-linear uptime scoring (heavy penalty for downtime) (lines 117-144)
- Grade calculation: A (90+), B (80+), C (70+), D (60+), F (<60) (lines 62-68, 156-162)
- Recommendations generation (lines 167-212)
- Database storage integration (lines 266-290)
- History retrieval (lines 335-355)

---

### REQ-012: Build PageSpeed Insights API client
**Status**: PASS
**Evidence**: `lib/pagespeed.ts`, `pages/api/pagespeed/analyze.ts`
**Findings**:
- PageSpeed Insights API v5 integration (line 51)
- **5-minute caching implemented** (line 46: `CACHE_TTL_MS = 5 * 60 * 1000`)
- Cache key by URL + strategy (lines 74-76)
- Cache hit/miss logic with expiration (lines 81-95, 100-105)
- Parses all Core Web Vitals metrics (lines 144-175)
- Batch processing with concurrency control (lines 272-289)
- API endpoint with auth protection (analyze.ts line 108)

---

### REQ-013: Create uptime monitoring ping check mechanism
**Status**: PARTIAL PASS
**Evidence**: `lib/uptime.ts`
**Findings**:
- HTTP HEAD request with timeout (lines 81-88)
- Response time tracking (lines 59, 91, 99, 104)
- Status code validation (lines 49, 93)
- Database storage of results (lines 166-179)
- Statistics calculation with uptime percentage (lines 195-242)
- Batch checking with concurrency limit (lines 251-266)
- **Integration Gap**: References `uptime_checks` table (lines 168, 215-218, 285) — no migration file (P0)

---

### REQ-014: Create database indexes for performance (<100ms p95)
**Status**: PASS
**Evidence**: `migrations/002_create_metrics_table.sql`
**Findings**:
- Composite index on (site_id, created_at DESC) — lines 21-22
- Additional indexes for site_id and created_at (lines 25, 28)
- Slow query logging in `lib/db.ts` (lines 141-144) provides observability

---

### REQ-015: Implement database migration framework
**Status**: PASS
**Evidence**: `lib/migrate.ts`
**Findings**:
- Versioned migrations via `schema_migrations` table (lines 36-44)
- Idempotent: checks applied migrations before running (lines 49-54, 125-127)
- Atomic: migrations run in sequence, stop on error (lines 139-152)
- Uses `ON CONFLICT DO NOTHING` for idempotent marking (line 91)
- Status reporting (lines 202-224)

---

## Integration Verification Summary

### Cross-File Import Analysis
| Source File | Imports From | Status |
|-------------|--------------|--------|
| pages/api/auth/login.ts | lib/db.ts, lib/auth.ts | Valid |
| pages/api/auth/logout.ts | lib/auth.ts | Valid |
| pages/api/stripe/webhook.ts | lib/stripe.ts, lib/db.ts | Valid |
| pages/api/stripe/checkout.ts | lib/stripe.ts, lib/auth.ts, lib/db.ts | Valid |
| pages/api/pagespeed/analyze.ts | lib/pagespeed.ts, lib/auth.ts | Valid |
| lib/auth.ts | lib/db.ts | Valid |
| lib/health-score.ts | lib/db.ts | Valid |
| lib/uptime.ts | lib/db.ts | Valid |

### Database Table Consistency
| Table | Migration File | Code References | Status |
|-------|----------------|-----------------|--------|
| sites | 001_create_sites_table.sql | lib/uptime.ts | OK |
| metrics | 002_create_metrics_table.sql | lib/health-score.ts | OK |
| subscriptions | 003_create_subscriptions_table.sql | webhook.ts | OK |
| **users** | **MISSING** | login.ts, checkout.ts, auth.ts | **FAIL** |
| **sessions** | **MISSING** | auth.ts | **FAIL** |
| **uptime_checks** | **MISSING** | uptime.ts | **FAIL** |
| **processed_webhook_events** | **MISSING** | webhook.ts | **FAIL** |

---

## Issues List (Ranked by Severity)

### P0 — Ship Blockers

| ID | Issue | Files Affected | Impact |
|----|-------|----------------|--------|
| P0-001 | No `users` table migration | login.ts, checkout.ts, auth.ts | Authentication completely broken — queries will fail |
| P0-002 | No `sessions` table migration | auth.ts | Session creation/validation will fail — all protected routes broken |
| P0-003 | No `uptime_checks` table migration | uptime.ts | Uptime monitoring storage will fail — core feature broken |
| P0-004 | No `processed_webhook_events` table migration | webhook.ts | Webhook idempotency broken — risk of duplicate processing |

### P1 — High Priority

| ID | Issue | Files Affected | Impact |
|----|-------|----------------|--------|
| P1-001 | Token refresh mechanism not implemented | lib/auth.ts | Violates acceptance criteria: "15-minute access tokens with refresh" |
| P1-002 | Session expiry is 7 days, not 15 minutes | lib/auth.ts (line 18) | Security deviation from requirements |

### P2 — Medium Priority

| ID | Issue | Files Affected | Impact |
|----|-------|----------------|--------|
| P2-001 | Unused import: `transaction` imported but not used | webhook.ts (line 15) | Dead code, minor cleanup |
| P2-002 | Password hashing uses SHA-256, not bcrypt/argon2 | login.ts (lines 33-37) | Security: comment notes "use bcrypt or argon2 in production" |
| P2-003 | SQL injection risk in interval interpolation | uptime.ts (lines 219, 287) | Uses string interpolation for SQL intervals |

---

## Required Migrations (P0 Resolution)

The following 4 migration files must be created:

### 004_create_users_table.sql
Required fields (from code analysis):
- id UUID
- email VARCHAR (unique)
- name VARCHAR
- password_hash VARCHAR
- password_salt VARCHAR
- stripe_customer_id VARCHAR (nullable)
- created_at TIMESTAMP

### 005_create_sessions_table.sql
Required fields (from auth.ts):
- id UUID
- user_id UUID (FK to users)
- token_hash VARCHAR
- expires_at TIMESTAMP
- created_at TIMESTAMP

### 006_create_uptime_checks_table.sql
Required fields (from uptime.ts):
- id UUID
- site_id UUID (FK to sites)
- url VARCHAR
- is_up BOOLEAN
- status_code INTEGER (nullable)
- response_time DECIMAL
- error TEXT (nullable)
- checked_at TIMESTAMP

### 007_create_processed_webhook_events_table.sql
Required fields (from webhook.ts):
- id UUID
- event_id VARCHAR (unique)
- event_type VARCHAR
- processed_at TIMESTAMP

---

## Acceptance Criteria Audit

| Criteria | Status | Evidence |
|----------|--------|----------|
| Checkout session for Basic ($99) | PASS | checkout.ts line 33 |
| Checkout session for Pro ($249) | PASS | checkout.ts line 38 |
| Checkout session for Enterprise ($499) | PASS | checkout.ts line 43 |
| Webhook validates Stripe signature | PASS | webhook.ts lines 224-230 |
| Duplicate webhooks handled idempotently | BLOCKED | Table missing |
| Idempotency keys on Stripe calls | PASS | checkout.ts lines 89, 177 |
| Sites table accepts records | PASS | Migration exists |
| Metrics table stores scores | PASS | Migration exists |
| Subscriptions syncs with Stripe | PASS | webhook.ts handlers |
| Queries < 100ms p95 | PASS | Indexes exist |
| Migration framework works | PASS | migrate.ts |
| Login returns httpOnly cookie | BLOCKED | users table missing |
| Session NOT in localStorage | PASS | Uses cookies only |
| 401 on unauthenticated | PASS | withAuth middleware |
| Logout invalidates session | BLOCKED | sessions table missing |
| Token refresh (15-min tokens) | **FAIL** | Not implemented |
| PageSpeed returns score | PASS | pagespeed.ts |
| PageSpeed cached (5-min TTL) | PASS | pagespeed.ts line 46 |
| Uptime returns response time | BLOCKED | Table missing |
| Health Score calculation | PASS | health-score.ts |

---

## Recommendation

**BLOCK SHIP** — Return to development.

### Critical Path to QA Pass 3:

1. **P0: Create 4 missing migration files** (users, sessions, uptime_checks, processed_webhook_events)
2. **P1: Implement token refresh** OR document deviation with stakeholder sign-off
3. **P2: Address security concerns** (bcrypt, SQL parameterization)

### Estimated Effort:
- P0 migrations: ~2 hours
- P1 token refresh: ~4 hours (if required)
- P2 fixes: ~2 hours

---

## Progress Since QA Pass 1

| Metric | Pass 1 | Pass 2 | Delta |
|--------|--------|--------|-------|
| Deliverables in correct directory | 0 | 16 | +16 |
| Requirements with code | 1 | 15 | +14 |
| P0 issues | 6 | 4 | -2 |
| P1 issues | 4 | 2 | -2 |
| Completion rate | 7% | 73% | +66% |

Substantial progress. Integration issues are now the primary blocker.

---

*QA Pass 2 complete. Verdict: BLOCK.*
*— Margaret Hamilton, QA Director*
