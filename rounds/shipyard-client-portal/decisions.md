# Shipyard Client Portal — Locked Decisions
## Blueprint for Build Phase

**Consolidated by:** Phil Jackson, Zen Master
**Date:** 2026-04-15
**Status:** Ready for Implementation

---

## Executive Summary

**Product Essence:** Mission control for clients who hired AI to build their website—zero anxiety, total trust.

**Core Truth:** This isn't about features or beauty. It's about eliminating doubt. Every login either builds trust or bleeds it.

**The Moment That Matters:** When clients see "Your site is live. [View Site →]" and click to find it's beautiful, functional, and theirs.

---

## I. LOCKED DECISIONS

### Decision #1: MVP Scope — Ship Skeleton v1, Then Add Polish
**Proposed by:** Elon Musk
**Winner:** Elon (with Steve's design principles applied)
**Why:** Product-market fit is unproven. 27 completed PRDs exist but no retainer conversions yet. Must validate demand before building feature-complete SaaS.

**What This Means:**
- Ship bare-bones v1 in 1 week to validate market
- v1 proves clients will pay $299/month for self-service + retainers
- v1.5 adds Steve's "calm power" design once we have paying customers
- v2 adds advanced features after validation

**Compromise:** Elon's velocity + Steve's quality bar applied to reduced scope.

---

### Decision #2: Technology Stack — Three Services, One Repo
**Proposed by:** Elon Musk
**Winner:** Elon
**Why:** Complexity kills. Every additional service is another failure point.

**Locked Stack:**
- **Next.js 14+** (Server Components, API routes)
- **Supabase** (PostgreSQL + Auth built-in)
- **Stripe** (Payments + Subscriptions)
- **Deploy:** Vercel

**Explicitly CUT:**
- ❌ Redis (Supabase sessions sufficient for <1000 users)
- ❌ React Query (use Next.js Server Components)
- ❌ Separate Express service (Next.js API routes handle everything)
- ❌ Custom analytics infrastructure (use Cloudflare API if needed)

**Conceded by:** Steve Jobs (agreed Redis is cargo-culting)

---

### Decision #3: Notification Strategy — Email-First, Portal Secondary
**Proposed by:** Elon Musk
**Winner:** Elon
**Why:** Email is async, logged, requires zero infrastructure. Portal should be source of truth, not F5-spam target.

**Locked Approach:**
1. Pipeline webhook fires → Email sent instantly → Portal updates
2. Client never *needs* to log in to check status
3. Portal is for detail view and trust-building, not primary notifications

**What Gets Built:**
- Webhook endpoint to receive pipeline status updates
- Transactional email service integration (e.g., SendGrid, Postmark)
- Email templates: "Your site is live," "Build failed - we're fixing it," etc.
- Portal status page that shows current state

**Explicitly CUT from v1:**
- ❌ In-app notification center (v2)
- ❌ WebSocket/polling for real-time updates (v2)
- ❌ Mobile push notifications (v2)

**Conceded by:** Steve Jobs (agreed in-app notifications not launch-critical)

---

### Decision #4: Design Philosophy — Direct Truth & Calm Power
**Proposed by:** Steve Jobs
**Winner:** Steve (design principles) + Elon (implementation timing)
**Why:** Design quality IS the business moat. This is a trust product, not a utility.

**Locked Design Principles:**

#### Brand Voice (Non-Negotiable)
- **Direct truth, always:** "Your site is ready" not "deployment successful"
- **When failures happen:** "The build failed. We're fixing it. Update in 2 hours."
- **No corporate speak, no passive voice, no buzzwords**
- Write like texting a friend who hired you to build something important

#### Visual Design (v1.5 Target)
- **First screen:** One active project, center stage
- **Progress indication:** Ring/visual that actually means something (requires pipeline integration)
- **Hierarchy:** If multiple projects exist, active one is hero, others in minimal sidebar
- **Information density:** Show what matters: status, timeline, outcome
- **Emotion:** Relief. Confidence. "These people know what they're doing."

#### v1 Implementation Reality
Elon's constraint: Progress rings and dynamic messaging require pipeline webhook integration, status state machine, and estimated completion logic. That's v1.5.

**v1 Compromise:**
- Simple text-based status: "In Progress - Build Phase"
- Big button: "View Site →" when live
- Clean layout, but no progress rings yet
- Voice principles apply immediately (copy matters from day 1)

**Conceded by:** Elon (agreed voice matters, "how we say it" = brand differentiator)

---

### Decision #5: Authentication — Email/Password Only for v1
**Proposed by:** Elon Musk
**Winner:** Elon
**Why:** Ship fast. Validate demand before adding auth complexity.

**Locked for v1:**
- Email/password only
- Basic password reset via email link

**Cut to v2:**
- ❌ Magic link auth
- ❌ OAuth (Google/GitHub)
- ❌ Multi-user team accounts
- ❌ SSO/SAML

**Conceded by:** Steve Jobs

---

### Decision #6: Analytics — Three Numbers, No More
**Proposed by:** Steve Jobs
**Winner:** Steve (with Elon's infrastructure constraints)
**Why:** Clients paying $5K need to know "Is it working?" Showing outcomes closes the loop.

**Locked Scope:**
1. **Visitors this week** (weekly unique visitors)
2. **Key conversions** (form submissions or whatever client defined)
3. **Site status** (green dot = up, red dot = down)

**Implementation Constraint (Elon's point):**
Can't show beautiful numbers without pipes to deliver them. Must choose:
- **Option A:** Integrate Cloudflare Analytics API (sites already on Cloudflare)
- **Option B:** Integrate Google Analytics API (requires OAuth setup)
- **Option C:** Cut analytics entirely for v1, add in v1.5

**Decision Required:** Team must pick Option A, B, or C before build starts.

**Explicitly CUT:**
- ❌ Page views by URL
- ❌ Conversion rate tracking
- ❌ Core Web Vitals
- ❌ Load time graphs
- ❌ Uptime monitoring dashboards
- ❌ Recommendations panel

**Conceded by:** Elon (agreed three numbers are table stakes, not scope creep)

---

### Decision #7: Token Budget Display — Human Translation Required
**Proposed by:** Steve Jobs
**Winner:** Contested (needs resolution)
**Debate:**

**Steve's Position:** "185K tokens remaining" means nothing to clients. Show "3 content updates remaining this month."

**Elon's Counter:** Token-to-feature estimation adds complexity. One update might use 50K, another 200K. Need conversion logic + maintenance burden.

**Elon's Proposal:** "185K tokens (~3-5 content updates)" — show tokens WITH context.

**Decision Required:** Pick one approach before build:
- **Option A:** Steve's human translation (requires estimation logic)
- **Option B:** Elon's tokens + context (simpler, less precise)
- **Option C:** Cut token budget display from v1 entirely

**Status:** ⚠️ UNRESOLVED — Blocking decision for retainer dashboard

---

### Decision #8: Subscription Infrastructure — Build It, Don't Test Manually
**Proposed by:** Steve Jobs
**Winner:** Steve
**Why:** Can't scale manual white-glove service. Clients smell hesitation. Self-service retainer IS the product.

**Locked for v1:**
- Stripe subscription integration
- Token budget counter (display format TBD per Decision #7)
- Retainer tier: $299/month
- Self-service subscription management (cancel, update payment method)

**Cut to v2:**
- ❌ Upgrade/downgrade between tiers (only one tier for v1)
- ❌ Prorated refunds (Stripe default handles this automatically)
- ❌ Usage alerts/notifications

**Elon's Concession:** Agreed that manual retainer testing sends wrong signal. Build subscription infrastructure for v1.

---

## II. MVP FEATURE SET (v1)

### Core Features — Must Ship
1. **Authentication**
   - Email/password login
   - Password reset via email
   - Session management (Supabase)

2. **Project Intake + Payment**
   - Intake form (project details, requirements)
   - Stripe checkout integration
   - Payment confirmation

3. **Project Dashboard**
   - Current project status (pulled from pipeline webhook)
   - Text-based status: "In Progress - Build Phase" / "Live"
   - "View Site →" button when live
   - Simple, clean layout (Steve's voice principles applied to copy)

4. **Retainer Subscription**
   - Stripe subscription ($299/month)
   - Token budget counter (format TBD)
   - Update history (list of completed updates)
   - Self-service cancel

5. **Email Notifications**
   - Triggered by pipeline webhooks
   - Templates: Site live, build failed, update complete
   - Transactional email service integration

6. **Webhook Endpoint**
   - Receives pipeline status updates
   - Updates database
   - Triggers email notifications

### Features Cut to v1.5
- Progress rings with estimated completion
- Dynamic "what's next" messaging
- Post-launch analytics (if Option C chosen)
- Advanced status tracking (4-wave visualization)

### Features Cut to v2
- Magic link auth
- OAuth providers
- In-app notification center
- Communication history panel
- Team/multi-user accounts
- Recommendations engine
- Upgrade/downgrade subscription tiers
- Weekly summary emails
- Customization/theming

---

## III. FILE STRUCTURE

### Locked Architecture: Next.js App Router

```
/shipyard-portal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard shell
│   │   ├── page.tsx                 # Main project dashboard
│   │   ├── retainer/
│   │   │   └── page.tsx             # Retainer subscription management
│   │   └── intake/
│   │       └── page.tsx             # New project intake form
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── pipeline/
│   │   │       └── route.ts         # Receives pipeline status updates
│   │   ├── stripe/
│   │   │   └── webhooks/
│   │   │       └── route.ts         # Stripe webhook handler
│   │   └── projects/
│   │       └── [id]/
│   │           └── route.ts         # Project CRUD operations
│   └── layout.tsx                   # Root layout
├── components/
│   ├── ui/                          # Shadcn/ui components
│   ├── project-status.tsx           # Status display component
│   ├── token-budget.tsx             # Token budget display
│   └── email-templates/             # Email template components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client config
│   │   └── server.ts                # Supabase server actions
│   ├── stripe/
│   │   └── client.ts                # Stripe integration
│   ├── email/
│   │   └── send.ts                  # Email sending logic
│   └── utils.ts                     # Shared utilities
├── types/
│   └── database.ts                  # Supabase generated types
└── middleware.ts                    # Auth middleware
```

### Database Schema (Supabase PostgreSQL)

```sql
-- Core tables for v1

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL, -- 'intake', 'payment_pending', 'in_progress', 'review', 'live', 'failed'
  site_url TEXT,
  staging_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE TABLE retainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  token_budget INTEGER DEFAULT 500000,
  tokens_used INTEGER DEFAULT 0,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE retainer_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  retainer_id UUID REFERENCES retainers(id),
  description TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE status_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  status TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_retainers_client_id ON retainers(client_id);
CREATE INDEX idx_status_events_project_id ON status_events(project_id);
```

---

## IV. OPEN QUESTIONS (Require Resolution Before Build)

### 1. Analytics Integration (Blocking)
**Decision:** Choose Option A, B, or C from Decision #6
- **Option A:** Cloudflare Analytics API
- **Option B:** Google Analytics API
- **Option C:** Cut analytics from v1

**Impact:** Affects component architecture, API routes, external dependencies

**Owner:** Elon + Steve must align
**Deadline:** Before build session starts

---

### 2. Token Budget Display Format (Blocking)
**Decision:** Choose Option A, B, or C from Decision #7
- **Option A:** "3 content updates remaining" (requires estimation logic)
- **Option B:** "185K tokens (~3-5 updates)" (simpler)
- **Option C:** Hide token budget display in v1

**Impact:** Affects retainer dashboard UI and backend logic

**Owner:** Steve + Elon must align
**Deadline:** Before build session starts

---

### 3. Pipeline Webhook Format (Critical)
**Question:** What exact payload format does the pipeline send?

**Required Schema:**
```json
{
  "project_id": "uuid",
  "status": "in_progress" | "review" | "live" | "failed",
  "site_url": "https://...",
  "staging_url": "https://...",
  "message": "Human-readable status update",
  "timestamp": "ISO-8601"
}
```

**Impact:** Webhook endpoint implementation, status mapping logic

**Owner:** Pipeline team must document
**Deadline:** Before API route development

---

### 4. Email Service Provider (Required)
**Question:** Which transactional email service?

**Options:**
- SendGrid
- Postmark
- AWS SES
- Resend

**Impact:** Email integration code, cost structure

**Owner:** Elon
**Deadline:** Before email notification development

---

### 5. Stripe Subscription Configuration (Required)
**Question:** Exact Stripe product/price setup?

**Required Details:**
- Product name: "Shipyard Retainer"
- Price: $299/month recurring
- Token budget reset: On billing cycle renewal?
- Trial period: None for v1?

**Impact:** Stripe integration code

**Owner:** Finance/Ops
**Deadline:** Before subscription development

---

### 6. Domain & Deployment (Required)
**Question:** What domain? What Vercel project?

**Required:**
- Production domain (e.g., app.shipyard.ai)
- Staging domain (e.g., staging.shipyard.ai)
- Vercel project name
- Environment variables setup

**Impact:** Deployment configuration, DNS setup

**Owner:** DevOps
**Deadline:** Before final deployment

---

## V. RISK REGISTER

### High-Risk Items

#### Risk #1: No Product-Market Fit Validation
**Severity:** CRITICAL
**Likelihood:** HIGH

**Risk:** 27 completed PRDs but zero retainer conversions. Building full portal before validating demand.

**Mitigation:**
- Ship v1 in 1 week (reduces investment risk)
- Email 27 existing clients offering retainer at $299/month during beta
- Set success metric: 5 paying retainer clients before building v1.5
- Kill project if <3 conversions after 30 days

**Owner:** Business/Sales

---

#### Risk #2: Pipeline Webhook Integration Unknown
**Severity:** HIGH
**Likelihood:** MEDIUM

**Risk:** Portal depends on pipeline webhooks for status updates. If webhook format is unstable or payload changes, portal breaks.

**Mitigation:**
- Document exact webhook contract before build
- Build webhook endpoint with schema validation (reject malformed payloads)
- Add error logging + alerting for failed webhook deliveries
- Create manual status override for ops team (if webhook fails, update DB directly)

**Owner:** Pipeline team + Portal dev

---

#### Risk #3: Stripe Subscription Complexity
**Severity:** MEDIUM
**Likelihood:** MEDIUM

**Risk:** Subscription billing, token budget resets, failed payments, cancellations add backend complexity. Easy to introduce billing bugs.

**Mitigation:**
- Use Stripe's Customer Portal for self-service (cancel, update payment)
- Implement idempotent webhook handlers (use Stripe event IDs)
- Test failed payment scenarios (past_due, canceled states)
- Add manual billing override for ops team

**Owner:** Dev + Finance

---

#### Risk #4: Client Expectations Mismatch
**Severity:** MEDIUM
**Likelihood:** HIGH

**Risk:** Clients expect "calm power" design. v1 ships text-based status page. Disappointment kills trust.

**Mitigation:**
- Set expectations in onboarding email: "Portal is in beta. Full features coming soon."
- Apply Steve's voice principles to ALL copy (even v1)
- Ship v1.5 design polish within 2-4 weeks of v1 launch
- Offer beta discount ($249/month for early adopters)

**Owner:** Customer Success + Marketing

---

#### Risk #5: Token Budget Estimation Inaccuracy
**Severity:** LOW
**Likelihood:** HIGH

**Risk:** If we show "3 updates remaining" but estimation is wrong, clients run out faster than expected. Erodes trust.

**Mitigation:**
- Choose Option B (show tokens + context, not hard estimate)
- OR implement conservative estimation (e.g., assume 100K per update)
- OR hide token budget in v1, only show usage post-facto

**Owner:** Product (Steve + Elon must decide)

---

#### Risk #6: Email Deliverability
**Severity:** MEDIUM
**Likelihood:** LOW

**Risk:** Critical notifications ("Your site is live") land in spam. Clients miss updates.

**Mitigation:**
- Use reputable transactional ESP (Postmark, SendGrid)
- Configure SPF, DKIM, DMARC records correctly
- Test deliverability across Gmail, Outlook, Apple Mail
- Add "Add to contacts" prompt in first email

**Owner:** DevOps + Email provider setup

---

#### Risk #7: One Developer Building This
**Severity:** HIGH
**Likelihood:** MEDIUM

**Risk:** Elon claims "one agent session can scaffold this in 6-8 hours" for stripped v1. If wrong, timeline blows up.

**Mitigation:**
- Scope is genuinely minimal: Auth (Supabase), intake form, Stripe checkout, status page, 2-3 API routes
- Use proven stack (Next.js + Supabase + Stripe all have excellent docs)
- Break into phases: Day 1-2 (auth + DB), Day 3-4 (intake + payment), Day 5-6 (dashboard + webhooks), Day 7 (polish + deploy)
- Fallback: If agent can't complete, hand off to human dev after agent scaffolds structure

**Owner:** Dev team

---

### Medium-Risk Items

#### Risk #8: Design Quality Slips in v1
**Severity:** MEDIUM
**Likelihood:** MEDIUM

**Risk:** Elon's "ship fast" mentality leads to ugly v1. Hurts brand perception.

**Mitigation:**
- Use Shadcn/ui for component library (pre-built, beautiful defaults)
- Apply Steve's voice principles to all copy (costs zero dev time)
- Clean layout even with simple status page (white space, typography, hierarchy)
- No Comic Sans. No clipart. No "under construction" vibes.

**Owner:** Design oversight (Steve approval on final UI)

---

#### Risk #9: Scaling Assumptions Wrong
**Severity:** LOW
**Likelihood:** LOW

**Risk:** Elon assumes Supabase + Next.js scale to 1000 projects easily. If wrong, re-architecture needed.

**Mitigation:**
- Supabase handles 100K+ rows easily (validated by usage in production apps)
- Vercel auto-scales Next.js
- Add database indexes on `client_id`, `status`, `created_at`
- Monitor query performance from day 1

**Owner:** DevOps

---

### Low-Risk Items

#### Risk #10: Feature Creep During Development
**Severity:** LOW
**Likelihood:** MEDIUM

**Risk:** Dev adds "just one more thing" during build. Delays launch.

**Mitigation:**
- Lock scope in this document. No additions without Phil's approval.
- Separate v1, v1.5, v2 backlogs clearly
- Ship v1 even if imperfect. Iterate after validation.

**Owner:** Phil Jackson (project manager)

---

## VI. SUCCESS METRICS

### Launch Success (Week 1)
- [ ] Portal deployed to production
- [ ] 3+ test projects created successfully
- [ ] Stripe payment flow tested end-to-end
- [ ] Webhook integration confirmed working
- [ ] Email notifications delivered successfully

### Market Validation (Week 4)
- [ ] 5+ existing clients onboarded to retainer subscriptions
- [ ] $1,495+ MRR from retainers (5 × $299)
- [ ] Zero critical bugs reported
- [ ] Average session time <60 seconds (clients get in, see status, get out)

### v1.5 Trigger
- [ ] 10+ active retainer clients
- [ ] Client feedback survey shows demand for enhanced design
- [ ] Revenue validates continued investment

---

## VII. FINAL ARCHITECTURE DECISIONS SUMMARY

| **Decision** | **Winner** | **Rationale** |
|-------------|-----------|---------------|
| MVP Scope | Elon | Validate PMF before feature-complete SaaS |
| Tech Stack | Elon | Next.js + Supabase + Stripe, no Redis/React Query |
| Notifications | Elon | Email-first, portal secondary |
| Design Voice | Steve | Direct truth, no corporate speak (non-negotiable) |
| Visual Polish Timing | Elon (v1) → Steve (v1.5) | Ship skeleton fast, add calm power after validation |
| Auth | Elon | Email/password only for v1 |
| Analytics | Steve | Three numbers (visitors, conversions, status) |
| Subscription | Steve | Build self-service, don't test manually |

---

## VIII. HANDOFF TO DEVELOPMENT

### Prerequisites Before Build Starts
1. ✅ Read this document completely
2. ⚠️ Resolve Open Questions #1-6
3. ✅ Confirm tech stack access (Supabase project, Stripe account, Vercel project)
4. ✅ Receive pipeline webhook documentation
5. ✅ Choose email service provider

### Development Phases
**Phase 1 (Days 1-2):** Auth + Database
- Supabase setup, schema deployment
- Login/signup/reset password pages
- Middleware for protected routes

**Phase 2 (Days 3-4):** Intake + Payment
- Project intake form
- Stripe checkout integration
- Payment confirmation flow

**Phase 3 (Days 5-6):** Dashboard + Webhooks
- Project status dashboard
- Webhook endpoint (pipeline + Stripe)
- Email notification triggers

**Phase 4 (Day 7):** Polish + Deploy
- Apply Steve's voice principles to all copy
- Test end-to-end flows
- Deploy to production
- DNS configuration

### Acceptance Criteria
- Client can sign up, fill intake form, pay $1,495, see project in dashboard
- Client can subscribe to $299/month retainer
- Pipeline webhook updates project status
- Email sent when site goes live
- Client can view live site from dashboard
- Clean, professional UI (Shadcn components, good typography)
- All copy uses "direct truth" voice

---

## IX. STRATEGIC ALIGNMENT

### What This Portal Must Do
1. **Eliminate doubt** — Client logs in and thinks "they've got this"
2. **Build trust at scale** — Gorgeous dashboard signals professionalism
3. **Close the loop** — Show outcomes (site is live, site is working)
4. **Enable self-service** — Intake + retainers without manual ops

### What This Portal Must NOT Do
1. Try to be Slack/Discord (no real-time chat)
2. Try to be Google Analytics (just three key numbers)
3. Try to serve teams (one client, one login for v1)
4. Talk like enterprise software (direct truth, always)

### The North Star
**"Your site is live. [View Site →]"**

Every feature, every design decision, every line of code should serve this moment. When a client clicks that button and sees their beautiful, functional website, they become a customer for life.

---

**Blueprint Status:** LOCKED ✅
**Next Step:** Resolve open questions, then build.

*— Phil Jackson, Zen Master*
*Great Minds Agency*
