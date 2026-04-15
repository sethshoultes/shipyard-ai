# Shipyard Client Portal - Architecture & Context

**Last Updated:** 2026-04-15
**Version:** MVP v1 (Phase 1 Complete + QA Fixes)
**Status:** In Development

## Overview

The Shipyard Client Portal is a Next.js application that allows clients to:
- Submit new website project requests
- Track project build status in real-time
- Manage retainer subscriptions
- Receive notifications when sites go live
- View and access their deployed websites

## Tech Stack

- **Framework:** Next.js 16.2.3 (App Router, Server Components)
- **Language:** TypeScript (strict mode)
- **Database:** Supabase (PostgreSQL + Auth)
- **Styling:** Tailwind CSS 4.0
- **Payments:** Stripe (checkout + subscriptions)
- **Email:** Resend (transactional emails)
- **Testing:** Vitest + @vitest/ui
- **Deployment:** Vercel

## Architecture

### Authentication Flow
- Supabase Auth handles email/password authentication
- Server-side sessions via `@supabase/ssr`
- Session tokens stored in httpOnly cookies
- 7-day session expiration with inactivity timeout
- Middleware protects authenticated routes

**Key Files:**
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `app/(auth)/` - Authentication routes (signup, login, password reset)
- `components/SignupForm.tsx` - Signup form with validation

### Database Schema

**Tables:**
- `clients` - User accounts (linked to Supabase auth.users)
- `projects` - One-time project requests
- `retainers` - Retainer subscriptions (monthly/yearly)
- `retainer_updates` - Maintenance requests under retainer
- `status_events` - Project status change audit log

**Key Relationships:**
- client → projects (1:many)
- client → retainers (1:many)
- retainer → retainer_updates (1:many)
- project → status_events (1:many)

**Migrations:** `database/migrations/*.sql`

### Data Flow

**Project Intake Flow:**
1. Client fills intake form (`/projects/new`)
2. Project record created with `status='intake'`
3. Client redirected to Stripe Checkout
4. On payment success, Stripe webhook updates `status='payment_confirmed'`
5. Pipeline picks up project and begins build
6. Pipeline webhook updates status to `in_progress`, `live`, or `failed`
7. Email notification sent on status change

**Retainer Flow:**
1. Client subscribes via Stripe subscription checkout
2. Retainer record created with `status='active'`
3. Stripe webhook updates subscription status
4. Client submits maintenance requests via retainer dashboard
5. Token budget tracked per billing cycle

### API Routes

**Authentication:**
- `POST /api/auth/logout` - Clear session and redirect to login

**Webhooks:**
- `POST /api/webhooks/pipeline` - Receive project status updates from build pipeline
- `POST /api/webhooks/stripe` - Handle Stripe subscription events

**Stripe:**
- `POST /api/stripe/checkout` - Create checkout session for project payment
- `POST /api/stripe/subscription` - Create subscription checkout for retainer

### Email Notifications

**Email Service:** Resend (`@resend/sdk`)

**Templates:**
- Site Live - Sent when `status` changes to `live`
- Build Failed - Sent when `status` changes to `failed`
- Payment Confirmation - Sent after successful Stripe checkout
- Ready for Review - Sent when staging environment is ready

**Key Files:**
- `lib/email/client.ts` - Resend client configuration
- `lib/email/templates/` - Email templates (React Email components)

### Environment Variables

**Required for development:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
PIPELINE_WEBHOOK_SECRET=
STRIPE_WEBHOOK_SECRET=
```

See `.env.example` for full list.

## Key Decisions

### Resolved:
- **Auth:** Email/password only for v1 (no OAuth, magic links deferred to v2)
- **Database:** Supabase for auth + PostgreSQL hosting
- **Payments:** Stripe Checkout (not Stripe Elements)
- **Email:** Resend (chosen for simplicity and modern API)
- **Token Budget Display:** Option B - Show raw token counts (simpler than feature-count estimation)

### Open Questions:
- **DECISION-003:** Webhook payload format for pipeline integration (needs pipeline team input)
- **DECISION-006:** Final domain name (app.shipyard.ai vs portal.shipyard.ai)

## Development Workflow

**Install dependencies:**
```bash
npm install
```

**Run dev server:**
```bash
npm run dev
```

**Run tests:**
```bash
npm test          # Run tests once
npm run test:ui   # Run tests with UI
```

**Build for production:**
```bash
npm run build
npm start
```

**Database migrations:**
```bash
# Run migrations in Supabase dashboard SQL editor
# See database/migrations/README.md for order
```

## Testing Strategy

- **Unit Tests:** Form validation logic (`lib/validation/__tests__/`)
- **Integration Tests:** API routes, database queries
- **E2E Tests:** (Deferred to v1.5) Playwright for full user flows
- **Manual Testing:** Critical paths tested before each deployment

## Security Considerations

- All passwords hashed via Supabase Auth (bcrypt)
- Session tokens in httpOnly cookies (CSRF protection via Next.js)
- Webhook signatures verified (Stripe HMAC, pipeline shared secret)
- No sensitive data in client-side code
- Environment variables never committed to git
- Stripe API keys use restricted permissions

## Performance Optimizations

- Static page generation for auth routes (fast FCP)
- Server Components for data fetching (reduced client JS)
- Database indexes on foreign keys and status columns
- Tailwind CSS purging (minimal bundle size)

## Known Issues / Tech Debt

- No automated E2E tests yet (manual testing only)
- Email templates are plain text (HTML templates in v1.5)
- No rate limiting on API routes (rely on Vercel edge limits)
- No admin panel (database admin via Supabase dashboard)

## Future Enhancements (v2+)

- OAuth providers (Google, GitHub)
- Magic link authentication
- Multi-user team accounts
- Advanced project analytics
- Client file uploads
- Real-time chat with support

## Deployment

**Production URL:** TBD (pending DECISION-006)

**Deployment Platform:** Vercel

**Environment:**
- Production: `main` branch auto-deploys
- Staging: `develop` branch auto-deploys to preview URL

**Post-Deployment Checklist:**
1. Verify environment variables in Vercel dashboard
2. Run database migrations in production Supabase project
3. Test authentication flow (signup, login, logout)
4. Test webhook endpoints with curl
5. Verify Stripe webhooks configured correctly
6. Send test email to verify Resend integration
7. Monitor Vercel logs for errors

## References

- **PRD:** `/home/agent/shipyard-ai/prds/shipyard-client-portal.md`
- **Requirements:** `/home/agent/shipyard-ai/.planning/shipyard-client-portal-REQUIREMENTS.md`
- **Phase 1 Plan:** `/home/agent/shipyard-ai/.planning/shipyard-client-portal-phase-1-plan.md`
- **Decisions:** `/home/agent/shipyard-ai/rounds/shipyard-client-portal/decisions.md`
- **QA Report:** `/home/agent/shipyard-ai/rounds/shipyard-client-portal/qa-pass-2.md`

## Support

For questions or issues, contact the development team or refer to the project documentation in `.planning/`.
