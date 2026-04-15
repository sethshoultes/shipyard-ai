# PRD: Shipyard Client Portal
**Author:** Phil Jackson (IMPROVE Cycle)
**Date:** 2026-04-14
**Priority:** P1 — Revenue Enabler
**Source:** IMPROVE Board Review (Buffett, Oprah, Shonda convergent)

---

## Problem Statement

Shipyard AI has proven delivery capability (27+ completed PRDs, 4 live example sites, 5-7 day turnaround) but **cannot scale beyond 1:1 sales conversations**. Every new project requires human involvement for intake, scoping, and status updates.

The pipeline is automated. The client experience is not.

Additionally, all revenue is project-based (one-time). There is no recurring revenue from ongoing relationships. When a project ends, the client relationship ends.

### Evidence from Board Review

- **Buffett (Revenue):** "Right now, every new customer requires a human conversation. That doesn't scale. The portal lets you serve 100 customers as easily as 10."
- **Buffett (Revenue):** "Service businesses without recurring revenue are exhausting. You're always hunting the next project. Retainers create predictability."
- **Oprah (First-5-Minutes):** "The website explains what Shipyard does but doesn't have a clear 'Submit your PRD here' CTA. Where does the journey begin?"
- **Shonda (Retention):** "Clients should be able to log in and see: Project status, site analytics, recommendations. This creates ongoing engagement beyond the initial project."

---

## Success Criteria

1. **Self-service intake functional** — Clients can submit PRDs, select scope, and pay without human intervention
2. **Project status visible** — Real-time view of pipeline stage (DEBATE → PLAN → BUILD → REVIEW → LIVE)
3. **Post-launch analytics accessible** — Visitors, conversions, uptime for deployed sites
4. **Retainer tier operational** — $299/month subscription with 200K token budget
5. **10 self-service projects completed** — Zero manual intake required
6. **5 retainer subscriptions active** — $1,495/month recurring revenue

---

## Scope

### In Scope

#### 1. Client Authentication
- Email/password signup and login
- Magic link option (passwordless)
- OAuth (Google, GitHub) optional
- Session management with secure tokens
- Password reset flow

#### 2. Project Intake Form
- Project name and description
- Scope selection (Emdash Site, Theme, Plugin)
- Design requirements (upload reference images, describe brand)
- Integration requirements (Stripe, Google, etc.)
- Timeline preferences
- Budget confirmation (token estimate displayed)
- Payment via Stripe (upfront or milestone-based)

#### 3. Project Dashboard
- List of client's projects (active and completed)
- Current project status: INTAKE → DEBATE → PLAN → BUILD → REVIEW → STAGING → LIVE
- Phase progress indicators (% complete, estimated time remaining)
- Deliverable previews (staging links when available)
- Feedback submission form (structured revision requests)
- Communication history (messages, notifications)

#### 4. Post-Launch Analytics
- Site visitors (daily, weekly, monthly)
- Page views and top pages
- Conversion tracking (form submissions, CTA clicks)
- Uptime monitoring (status badge)
- Performance metrics (load time, Core Web Vitals)
- "Recommendations" panel (suggested improvements)

#### 5. Retainer Subscription Management
- Subscribe to maintenance tier ($299/month)
- View remaining token budget
- Submit maintenance requests (content updates, feature additions)
- View request history and token usage
- Upgrade/downgrade subscription
- Cancel with prorated refund

#### 6. Notifications & Email
- Email on project phase changes
- Email on staging ready for review
- Email on production launch
- Weekly summary for retainer clients
- In-app notification center

### Out of Scope (Deferred)

- Real-time chat with agents (Slack integration exists)
- Multi-user team accounts
- White-label portal for agencies
- Custom domain for client portal
- Mobile app

---

## Technical Requirements

### Frontend Stack
- Next.js (matches existing Shipyard website)
- Tailwind CSS for styling
- React Query for data fetching
- Stripe Elements for payment UI

### Backend Stack
- Next.js API routes or separate Express service
- PostgreSQL for client/project data
- Redis for session management
- Stripe API for payments and subscriptions

### Integrations
- **Stripe:** One-time payments + subscriptions
- **Pipeline webhook:** Receive status updates from Great Minds daemon
- **Analytics:** Cloudflare Analytics API or custom Workers
- **Email:** Resend or SendGrid for transactional email

### API Endpoints

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

POST /api/projects
GET  /api/projects
GET  /api/projects/:id
PUT  /api/projects/:id/feedback
GET  /api/projects/:id/deliverables
GET  /api/projects/:id/analytics

POST /api/subscriptions
GET  /api/subscriptions
PUT  /api/subscriptions/:id
DELETE /api/subscriptions/:id

POST /api/requests (maintenance requests)
GET  /api/requests
```

### Database Schema

```sql
-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  company VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  scope VARCHAR(50), -- site, theme, plugin
  status VARCHAR(50), -- intake, debate, plan, build, review, staging, live
  description TEXT,
  requirements JSONB,
  token_budget INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(50), -- maintenance
  token_budget INT DEFAULT 200000,
  tokens_used INT DEFAULT 0,
  status VARCHAR(50), -- active, cancelled, past_due
  created_at TIMESTAMP DEFAULT NOW()
);

-- Maintenance Requests
CREATE TABLE requests (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id),
  project_id UUID REFERENCES projects(id),
  description TEXT,
  tokens_estimated INT,
  tokens_actual INT,
  status VARCHAR(50), -- pending, in_progress, completed
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## User Stories

### New Client (Self-Service Intake)
1. Client visits www.shipyard.company
2. Clicks "Start a Project"
3. Lands on intake form
4. Fills out project details (name, scope, requirements)
5. Sees token estimate and price
6. Enters payment via Stripe
7. Receives confirmation email
8. Project appears in dashboard as "INTAKE"

### Active Client (Project Tracking)
1. Client logs into portal
2. Sees project status: "BUILD - Wave 2/4"
3. Clicks project for details
4. Sees: 60% complete, estimated 2 days remaining
5. Reviews staging link when available
6. Submits feedback via form
7. Receives email when status changes

### Post-Launch Client (Analytics)
1. Client logs in 2 weeks after launch
2. Navigates to completed project
3. Sees: 1,247 visitors this week, 23 form submissions
4. Sees: "Recommendation: Add testimonials section"
5. Clicks "Start New Project" to add enhancement

### Retainer Client (Maintenance)
1. Client subscribes to $299/month tier
2. Sees: 200K tokens available this month
3. Submits request: "Update homepage hero image"
4. Sees request status: "In Progress"
5. Request completes, 15K tokens used
6. Sees: 185K tokens remaining
7. Receives weekly summary email

---

## Milestones

| Week | Deliverable |
|------|-------------|
| 1 | Authentication (signup, login, sessions) |
| 1 | Database schema and API routes |
| 2 | Project intake form with Stripe payment |
| 2 | Project dashboard (list, status view) |
| 3 | Pipeline webhook integration (status updates) |
| 3 | Feedback submission and communication |
| 4 | Post-launch analytics integration |
| 4 | Retainer subscription management |
| 5 | Email notifications (transactional) |
| 5 | Testing and polish |

---

## Pricing Structure

| Tier | Price | Included |
|------|-------|----------|
| **Emdash Site** | $500-1,500 | One-time project, 500K-2M tokens |
| **Emdash Theme** | $750 | One-time project, 750K tokens |
| **Emdash Plugin** | $500 | One-time project, 500K tokens |
| **Revision Round** | $100 | 100K tokens |
| **Maintenance Retainer** | $299/month | 200K tokens, ongoing support |

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Self-service leads to low-quality PRDs | Add intake validation; require minimum detail; offer templates |
| Payment disputes | Use Stripe's dispute management; clear refund policy |
| Pipeline fails mid-project | Show error state in portal; automated notification; manual escalation |
| Retainer tokens unused | Roll over unused tokens (up to 1 month); encourage requests |
| Analytics data unavailable | Graceful degradation; show "Analytics pending" state |

---

## Definition of Done

1. Client can complete signup → intake → payment in < 10 minutes
2. Project status updates within 5 minutes of pipeline phase change
3. Analytics load for all deployed sites (< 3s load time)
4. Retainer subscriptions bill correctly via Stripe
5. 10 projects completed via self-service intake (no manual intervention)
6. 5 retainer subscriptions active ($1,495 MRR)

---

## Revenue Impact

| Metric | Current | Target (90 days) |
|--------|---------|------------------|
| Projects/month | 5-8 (manual) | 15-20 (self-service) |
| Project revenue/month | ~$5,000 | ~$12,000 |
| Retainer customers | 0 | 5 |
| Retainer MRR | $0 | $1,495 |
| **Total MRR** | **~$5,000** | **~$13,500** |

---

## Board Quotes

> "Right now, every new customer requires a human conversation. That doesn't scale. The portal lets you serve 100 customers as easily as 10." — Warren Buffett

> "Service businesses without recurring revenue are exhausting. You're always hunting the next project. Retainers create predictability." — Warren Buffett

> "How do I actually start? The website explains what Shipyard does but doesn't have a clear 'Submit your PRD here' CTA." — Oprah Winfrey

> "Clients should be able to log in and see: Project status, site analytics, recommendations for improvements. This creates ongoing engagement beyond the initial project." — Shonda Rhimes
