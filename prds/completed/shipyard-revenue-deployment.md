# PRD: Shipyard Recurring Revenue Deployment
**Status:** Draft
**Date:** 2026-04-26
**Agent:** Phil Jackson (featureDream IMPROVE → PRD Pipeline)
**Priority:** P0 — Business Model Critical
**Estimated Tokens:** 1.2M (Standard Site + Plugin + Integration)

---

## 1. Problem Statement

Shipyard AI has built three revenue-generating systems that are fully engineered but not deployed:
1. Maintenance subscription ($199-500/month)
2. Client portal (project status, site health)
3. Post-ship lifecycle emails (Week 1, 4, 12, 26, 52)

Additionally, the marketing site has two P0 conversion blockers:
- Contact form submits via GET to nowhere
- No mobile navigation menu

**Result:** $35K ARR with near-zero recurring revenue. A SaaS pipeline valued as a consulting firm.

---

## 2. Goal

Deploy all built revenue infrastructure and fix conversion blockers within 14 days. Target: $2,000 MRR within 90 days from maintenance subscriptions alone.

---

## 3. Scope

### IN SCOPE

#### A. Website Fixes (Marketing Conversion)
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Contact Form Backend | POST endpoint at `/api/contact` | Form submits to Resend, delivers email to ops@shipyard.company, shows success state, handles errors gracefully |
| Mobile Navigation | Hamburger menu below 768px | Menu toggles, links work, closes on selection, accessible (ARIA), no layout shift |
| Maintenance CTA Section | Pricing cards on homepage | Three tiers visible above fold on desktop, stacked on mobile, each with "Get Started" button |
| Client Portal Link | `/portal` route + auth | Magic link login, project list view, status badges |

#### B. Maintenance Subscription (Stripe)
| Feature | Description | Acceptance Criteria |
|---------|-------------|---------------------|
| Stripe Checkout | Three pricing tiers | $199/month (Keep), $349/month (Grow), $500/month (Scale), annual discount (2 months free) |
| Subscription Webhooks | `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted` | Update customer record in D1, activate/deactivate portal access, send confirmation email |
| Customer Dashboard | `/portal` after login | List of projects, health score, last build date, maintenance status, "Request Change" button |
| Site Health Score | Automated checks | Uptime, SSL expiry, broken links, Lighthouse score, aggregated to 0-100. Updated daily. |

#### C. Post-Ship Lifecycle Emails (Resend)
| Email | Timing | Content |
|-------|--------|---------|
| Welcome | Hour 0 | "Your site is live. Here's your URL, login, and what to expect." |
| Week 1 Check-in | Day 7 | "How's traffic? Any tweaks needed? Reply to this email." |
| Month 1 Review | Day 30 | Traffic snapshot, health score, "What's next?" upsells |
| Quarter Health | Day 90 | Full health report, recommended improvements, maintenance CTA |
| Half-Year | Day 180 | "Time for a refresh?" redesign offer |
| Annual | Day 365 | Renewal reminder, loyalty discount, case study request |

#### D. "What's Next?" Upsell Module
| Feature | Description |
|---------|-------------|
| Ship Notification Footer | Every ship email includes 3 upsell cards: LocalGenius ($29/mo), SEO Package ($149), Maintenance ($199/mo) |
| One-Click Purchase | Upsell cards link to Stripe Checkout with pre-filled customer email |
| Portal Upsells | Client portal shows "Available Add-Ons" sidebar |

### OUT OF SCOPE
- New plugin development (use existing EventDash, MemberShip patterns)
- Custom billing portal UI (use Stripe Customer Portal)
- Phone/SMS support
- SLA guarantees for maintenance tier

---

## 4. Technical Architecture

### Stack
| Layer | Technology |
|-------|------------|
| Website | Next.js 16 + Tailwind CSS 4 (existing) |
| API | Cloudflare Workers (existing) |
| Database | Cloudflare D1 (existing) |
| Email | Resend (existing account) |
| Billing | Stripe Checkout + Customer Portal |
| Auth | Magic links via Resend |
| Monitoring | Cron job + D1 health snapshots |

### Database Schema (D1)
```sql
CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier TEXT CHECK(tier IN ('none', 'keep', 'grow', 'scale')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES customers(id),
  name TEXT NOT NULL,
  url TEXT,
  status TEXT CHECK(status IN ('building', 'deployed', 'maintenance', 'archived')),
  health_score INTEGER,
  last_build_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE health_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT REFERENCES projects(id),
  score INTEGER,
  uptime_percent REAL,
  ssl_days_remaining INTEGER,
  lighthouse_performance INTEGER,
  broken_links_count INTEGER,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lifecycle_emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id TEXT REFERENCES customers(id),
  project_id TEXT REFERENCES projects(id),
  email_type TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  opened_at DATETIME,
  clicked_at DATETIME
);
```

### API Endpoints
```
POST   /api/contact          → Resend email to ops
POST   /api/auth/magic-link  → Generate + send magic link
POST   /api/auth/verify      → Verify token, set cookie
GET    /api/portal/projects  → List customer projects (auth)
GET    /api/portal/health/:id → Health snapshot for project (auth)
POST   /api/stripe/webhook   → Handle Stripe events
POST   /api/stripe/checkout  → Create checkout session
```

### Cron Jobs
```
0 9 * * 1   → Weekly health snapshot for all active projects
0 9 * * *   → Daily lifecycle email dispatcher (checks send rules)
```

---

## 5. User Flows

### New Lead → Customer
1. Visitor fills contact form on shipyard.company
2. POST to `/api/contact` → Resend → ops@shipyard.company
3. Ops replies manually within 24 hours (until automated sales sequence is built)
4. Discovery call → Proposal → Stripe Checkout link
5. Customer pays → Webhook creates customer + project records
6. Welcome email sent immediately
7. Customer receives magic link to `/portal`

### Existing Shipyard Customer → Maintenance
1. Ship notification includes "Protect your site" upsell card
2. Customer clicks → Stripe Checkout with pre-filled email
3. Payment → Webhook upgrades customer tier
4. Portal now shows maintenance badge + health dashboard
5. Week 1 check-in email sent automatically

### Portal Access
1. Customer visits `/portal`
2. Enters email → receives magic link via Resend
3. Clicks link → cookie set, redirected to dashboard
4. Dashboard shows: projects, health scores, maintenance status, "Request Change" button

---

## 6. Design Requirements

### Mobile Navigation
- Hamburger icon top-right, rotates to X on open
- Full-screen overlay, links centered, 48px tap targets
- Background: `bg-slate-950`, text: `text-white`
- Animation: 200ms ease-in-out slide
- Accessibility: `aria-expanded`, `aria-label="Toggle menu"`, focus trap while open

### Maintenance Pricing Cards
```
Keep    $199/mo  → "We keep your site updated"
Grow    $349/mo  → + performance monitoring + monthly report
Scale   $500/mo  → + content edits + priority support
```
- Cards: equal height, border `border-slate-800`, hover `border-slate-600`
- "Grow" card highlighted with `border-indigo-500` and "Most Popular" badge
- Annual toggle: 2 months free, updates all prices with strikethrough monthly

### Client Portal Dashboard
- Header: customer email + logout
- Project cards: screenshot thumbnail, name, URL, status badge, health score (color-coded: green ≥80, yellow 50-79, red <50)
- Sidebar: maintenance status, next health check, "Request Change" CTA
- Responsive: single column on mobile, sidebar becomes bottom sheet

---

## 7. Acceptance Criteria

### P0 Blockers (Ship Criteria)
- [ ] Contact form POST endpoint live, emails received by ops
- [ ] Mobile nav works on iPhone SE, iPhone 14, Pixel 7
- [ ] Stripe Checkout creates subscriptions successfully
- [ ] Webhooks update D1 customer records
- [ ] Magic link auth works end-to-end
- [ ] Portal shows project list for authenticated customers
- [ ] Health score calculates and displays (0-100)
- [ ] Welcome email sends within 5 minutes of subscription

### P1 (Week 2)
- [ ] Week 1 check-in email automated
- [ ] Month 1 review email automated
- [ ] Upsell cards in ship notification
- [ ] Annual pricing toggle on website

### P2 (Month 2)
- [ ] Quarter health email
- [ ] Automated health snapshots daily
- [ ] Broken link detection in health score
- [ ] Lighthouse score integration

---

## 8. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe webhook delays | Medium | High | Idempotency keys on webhook handler; retry logic |
| Magic link spam abuse | Medium | Medium | Rate limit: 3 requests / 15 min per IP |
| Health score false alarms | High | Medium | Start with uptime + SSL only; add complexity later |
| Customer expects human support at $500/mo | Medium | High | Clear scope: "Priority support" = 24hr response, not 24/7 phone |
| D1 query limits on health snapshots | Low | Medium | Batch queries; cache results for 6 hours |

---

## 9. Metrics

**30-Day Targets:**
- Contact form submissions: >20
- Maintenance subscriptions: >5
- Portal active users: >10
- Welcome email delivery rate: >95%

**90-Day Targets:**
- Maintenance MRR: $2,000
- Contact form → call conversion: >10%
- Maintenance churn: <5%/month
- Upsell attach rate: >15% of shipped projects

---

## 10. Dependencies

- Stripe account (existing? verify)
- Resend domain verification (shipyard.company)
- D1 database migration (add customers, projects, health_snapshots, lifecycle_emails tables)
- Cloudflare Workers deploy access

---

## 11. Open Questions

1. Do we have a Stripe account set up? If not, what is timeline?
2. Is `ops@shipyard.company` active? If not, what address?
3. Should portal be a separate subdomain (portal.shipyard.company) or path (/portal)?
4. Do we have existing customer data to migrate, or fresh start?

---

## 12. Board Context

This PRD originates from featureDream IMPROVE Cycle 2026-04-26:
- **Buffett:** "You built a factory and forgot to sell what it makes."
- **Oprah:** "Fix the contact form and mobile nav immediately — these are not improvements, they are repairs."
- **Shonda:** "Deploy post-ship lifecycle emails immediately."
- **Jensen:** "The pipeline moat only compounds if we ship products that themselves compound."

**Pipeline:** Queue for immediate debate → plan → build.
