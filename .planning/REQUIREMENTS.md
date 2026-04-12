# REQUIREMENTS — Anchor Post-Delivery System v1

> *Atomic requirements extracted from decisions.md for Shipyard Post-Delivery v2 (Anchor)*
> *Source: /home/agent/shipyard-ai/rounds/shipyard-post-delivery-v2/decisions.md*

---

## Summary

**Total Requirements: 58**
- **P0 (Must Ship): 56**
- **P1 (Should Ship): 2**
- **Token Budget: 300K max**

**Critical Blocker:** REQ-058 (Card collection timing) is DEADLOCKED and must be resolved by founder before signup flow development.

---

## Product & Branding

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-001 | Product Identity | Product shall be named "Anchor" internally and at v2 public launch | Name used consistently in code, documentation, and internal materials | P0 |
| REQ-002 | Product Tiers | Product shall offer exactly two pricing tiers: "Basic Anchor" and "Pro Anchor" | Both tier names appear in landing page, Stripe checkout, and customer communications | P0 |
| REQ-003 | Product Positioning | System shall communicate trust-first relationship messaging ("Someone's got my back") | Landing page copy reflects trust positioning; emails evoke ongoing care | P0 |

---

## Architecture

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-004 | Core Stack | System architecture shall use Cron + PageSpeed API + JSON + Email + Stripe on Cloudflare | All components integrated; no database until 100 customers | P0 |
| REQ-005 | Hosting | System shall be hosted as static site on Cloudflare Pages with Cron workers | Site deployed to Cloudflare Pages; workers functional | P0 |
| REQ-006 | Data Storage | System shall store all customer data in JSON format until 100 customers | customers.json file exists as single source of truth | P0 |
| REQ-007 | Dashboard Exclusion | System shall NOT include a dashboard in v1 | No authentication system, no user-facing admin panels | P0 |
| REQ-008 | PageSpeed Frequency | System shall run PageSpeed Insights API checks exactly once per week | Cron configured for weekly schedule (e.g., Mondays 3am UTC) | P0 |
| REQ-009 | Analytics Implementation | System shall use first-party analytics only (Cloudflare Analytics or Plausible) | No Google Analytics OAuth; first-party analytics configured | P0 |

---

## Token Budget

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-010 | Build Scope | Build phase shall not exceed 300K tokens in a single Claude session | Token usage tracked per session | P0 |
| REQ-011 | Budget Allocation | Token budget allocation: Landing page (50K) + Stripe (100K) + Email cron (80K) + PageSpeed API (40K) + buffer (30K) | Build plan documented with estimates | P0 |

---

## Email System

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-012 | Email Quality Bar | All email copy shall be A+ quality or product will not ship | All five templates reviewed and approved before launch | P0 |
| REQ-013 | Email Voice | Email voice shall be confident expert friend—not salesy, corporate, or desperate | Copy audit confirms appropriate tone | P0 |
| REQ-014 | Email CTA Strategy | Each email shall contain exactly one CTA, embedded naturally in body copy | Five templates reviewed; each has single CTA | P0 |
| REQ-015 | Email Personalization | Personalization shall be authentic/creative or absent entirely | No half-automated merge fields | P0 |
| REQ-016 | Email First-Line Impact | First line of each email shall make recipient feel genuinely seen | Email audit: first lines focus on customer's achievement | P0 |
| REQ-017 | Launch Day Email | System shall send "Launch Day" email as first contact after enrollment | Email template exists (launch-day.html); sends on enrollment day | P0 |
| REQ-018 | Week 1 Check-in Email | System shall send "Week 1" check-in email 7 days after enrollment | Email template exists (week-1.html); cron triggers at 7 days | P0 |
| REQ-019 | Month 1 Report Email | System shall send "Month 1" report email 30 days after enrollment | Email template exists (month-1.html); includes PageSpeed data | P0 |
| REQ-020 | Q1 Refresh Prompt Email | System shall send "Q1 Refresh" prompt email 90 days after enrollment | Email template exists (q1-refresh.html) | P0 |
| REQ-021 | Anniversary Email | System shall send "Anniversary" email 365 days after enrollment | Email template exists (anniversary.html); emotional peak | P0 |
| REQ-022 | Email Cron System | System shall automatically schedule and send emails based on enrollment date | Cron worker checks due emails daily; logs sent/failed | P0 |

---

## Stripe Integration

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-023 | Stripe Checkout | System shall implement Stripe checkout for two-tier subscriptions | Checkout page created; Basic and Pro plans configured | P0 |
| REQ-024 | Webhook Handling | System shall handle Stripe webhook events (subscription created, renewed, cancelled) | Webhook handler processes events; JSON updated | P0 |
| REQ-025 | Subscription Management | System shall track subscription status per customer | customer.json includes subscription_status field | P0 |

---

## Monitoring & Operations

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-026 | Uptime Monitoring | System shall implement uptime monitoring via free BetterUptime | BetterUptime account created; landing page monitored | P0 |
| REQ-027 | Support Channel | System shall provide "Request Update" button as sole support mechanism | Button present on landing page/emails; redirects to support email | P0 |
| REQ-028 | Operations Tracking | System shall track three metrics per customer: Last Contact, Next Touch, Status | JSON schema includes these three columns only | P0 |

---

## PageSpeed Integration

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-029 | PageSpeed API Wrapper | System shall provide wrapper library for PageSpeed Insights API | pagespeed.js handles API auth, rate limiting, response parsing | P0 |
| REQ-030 | Weekly Performance Data | System shall collect PageSpeed scores weekly for each customer | API calls weekly; desktop and mobile scores captured | P0 |
| REQ-031 | Performance Data Storage | System shall store PageSpeed metrics in customer JSON | customer.json includes performance_history array | P0 |
| REQ-032 | PageSpeed Rate Limit Handling | System shall batch API calls and cache to avoid rate limits | Cron runs at 3am; caching strategy implemented | P0 |

---

## Landing Page & Signup

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-033 | Landing Page | System shall host landing page explaining Anchor and two pricing tiers | index.html deployed to Cloudflare Pages | P0 |
| REQ-034 | Pricing Page | System shall display pricing breakdown for Basic/Pro tiers | pricing.html created with features and pricing | P0 |
| REQ-035 | Landing Page Assets | System shall include professional branding assets (logo, CSS) | logo.svg and styles.css exist; responsive design | P0 |
| REQ-036 | Enrollment Flow | System shall define how customers enter the system | Enrollment trigger documented | P1 |

---

## File Structure & Codebase

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-037 | Project Structure | System shall follow defined file structure with site/, workers/, emails/, data/, lib/ | Directory structure matches spec | P0 |
| REQ-038 | Static Site Files | System shall include HTML landing page and pricing page with assets | index.html, pricing.html, styles.css, logo.svg exist | P0 |
| REQ-039 | Worker Files | System shall include three Cron worker files | cron-pagespeed.js, cron-email-scheduler.js, stripe-webhook.js functional | P0 |
| REQ-040 | Email Templates | System shall include five HTML email templates | All five .html templates exist in emails/ | P0 |
| REQ-041 | Library Files | System shall include three utility libraries | pagespeed.js, email.js, stripe.js created | P0 |
| REQ-042 | Customer Data File | System shall initialize customers.json with schema | customers.json with schema and sample record | P0 |
| REQ-043 | Internal Documentation | System shall include README.md with internal-only documentation | README.md with setup and deployment instructions | P0 |

---

## Excluded from v1 (Hard Scope Cuts)

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-044 | No Dashboard Pages | System shall NOT include any dashboard pages | Zero dashboard code in final build | P0 |
| REQ-045 | No Benchmark Comparison | System shall NOT include benchmark comparison features | No competitor data | P0 |
| REQ-046 | No Recommendation Engine | System shall use hardcoded tips (max 10) instead of AI engine | Generic tips only | P0 |
| REQ-047 | No Support Tickets | System shall use email-only support | No help desk | P0 |
| REQ-048 | No Dark Mode | System shall not include dark mode | No dark mode CSS | P0 |
| REQ-049 | No Token Visibility | System shall not display token costs to customers | No token budgets shown | P0 |
| REQ-050 | No Third Tier | System shall offer exactly two tiers (not three) | Two Stripe plans only | P0 |
| REQ-051 | No Strategy Calls | System shall not offer quarterly strategy calls | No calendar integration | P0 |
| REQ-052 | No Competitor Monitoring | System shall not monitor competitor sites | Zero competitor tracking | P0 |
| REQ-053 | No OAuth for Analytics | System shall not use OAuth-based Google Analytics | No GA4 integration | P0 |
| REQ-054 | No Self-Hosted Lighthouse | System shall use PageSpeed Insights API only | Cloud API only | P0 |

---

## Operational Constraints

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-055 | Scope Lock | Build phase shall hard-lock at 300K tokens; all scope beyond MVP deferred | No exceptions; v1 ships incomplete rather than over-budget | P0 |
| REQ-056 | Human-Centered Automation | Email copy shall balance automation with human warmth | Cron automated; copy maintains personal tone | P0 |
| REQ-057 | Cloudflare Cost Optimization | System shall use Cloudflare's free tier features | No paid Cloudflare services | P0 |

---

## Decision Awaiting Founder Input

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| REQ-058 | Card Collection Timing (UNRESOLVED) | Founder decides: collect card at signup (Elon) or after trust (Steve) | Decision documented; signup flow implemented accordingly | P0 |

---

## Open Questions (Need Resolution Before Build)

| # | Question | Context | Impact |
|---|----------|---------|--------|
| 1 | **Card collection timing** | Elon: project start. Steve: after trust earned. | Fundamentally changes signup flow |
| 2 | **Email service provider** | Not specified (Resend recommended based on existing patterns) | Affects email delivery |
| 3 | **Exact copy for 5 emails** | Steve demands A+ quality | Build cannot proceed without copy |
| 4 | **Support email address** | What address for support? | Customer communication channel |
| 5 | **BetterUptime configuration** | How many sites per account? Alert thresholds? | Affects monitoring costs |
| 6 | **Stripe pricing** | Exact dollar amounts for Basic/Pro | Cannot build checkout without prices |
| 7 | **PageSpeed API key management** | Free tier rate limits at scale | May need batching strategy |
| 8 | **What triggers enrollment?** | Manual? Auto on project completion? | Affects cron logic |

---

## Technical Reference

### Recommended Email Service: Resend API
Based on existing Shipyard patterns (`/workers/contact-form/`), Resend API is production-ready with:
- Simple REST API
- Domain authentication (SPF/DKIM)
- Free tier available

### Existing Codebase Patterns
| Pattern | Location | Description |
|---------|----------|-------------|
| Cloudflare Workers | `/workers/contact-form/src/index.ts` | CORS, input sanitization, email sending |
| Stripe Integration | `/apps/pulse/lib/stripe.ts` | Singleton pattern, idempotency, error handling |
| Email Templates | `/plugins/eventdash/src/email.ts` | Inline CSS, responsive 600px container |
| Wrangler Config | `/workers/prd-chat/wrangler.toml` | Standard Cloudflare Worker setup |

### docs/EMDASH-GUIDE.md References
- **Section 5: Deployment** — Cloudflare Workers setup (wrangler.jsonc, D1, R2 bindings)
- **Section 6: Plugin System** — Capabilities model, ctx.http for external API calls
- **Section 8: Real Examples** — Bella's Bistro wrangler.jsonc configuration pattern

---

## Risk Register (Summary)

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| RISK-001 | Card collection timing deadlock | High | High | Founder decision required BEFORE build |
| RISK-002 | Email copy quality control | High | High | Steve reviews all 5 templates before deploy |
| RISK-003 | Scope creep in 300K token budget | High | High | Hard token lock, daily tracking |
| RISK-004 | Email service provider not selected | High | Medium | Recommend Resend (existing pattern) |
| RISK-005 | Email deliverability | Medium | High | SPF/DKIM setup, domain warmup |
| RISK-006 | PageSpeed API rate limits | Medium | Medium | 3am batching, weekly frequency |
| RISK-007 | JSON storage scalability | Low | Medium | Monitor at 100 customers |
| RISK-008 | Support volume at scale | Medium | Medium | FAQ in emails, SLA documentation |

---

*Generated: 2026-04-12*
*Project Slug: shipyard-post-delivery-v2*
*Product Name: Anchor*
