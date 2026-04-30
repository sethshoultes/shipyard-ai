# PRD: Shipyard Auto-Pipeline Hardening + Shipyard Care Maintenance Subscription

**Status**: READY FOR DEBATE
**Owner**: Elon Musk (Engineering), Warren Buffett (Business Model)
**Date**: 2026-04-30
**Priority**: P0 — EXISTENTIAL
**Est. Tokens**: 1.2M
**Timeline**: 3-4 weeks

---

## 1. Problem Statement

Shipyard AI has two existential flaws:

1. **The auto-pipeline has never been tested end-to-end.** The GitHub Actions workflow exists in `.github/workflows/shipyard-pipeline.yml` but has zero successful runs against real PRDs. Plugin deployment to customer sites fails due to banned pattern violations (EventDash: 95 violations), broken npm alias entrypoints, and permission denied errors during build.

2. **There is no recurring revenue model.** Shipyard sells one-time website builds at 50% beta discount ($2,497-$14,997). Post-launch, customers have no reason to stay. Maintenance is offered at $150/hour opportunistically — a support tax, not a product.

Without a working auto-pipeline, Shipyard is a manual agency with AI branding. Without recurring revenue, it is not investable.

---

## 2. Goals

### Engineering Goals
- [ ] Auto-pipeline completes end-to-end (PRD → Debate → Plan → Build → Review → Deploy → Handoff) without human intervention on 5 consecutive test projects.
- [ ] Plugin deployment success rate >95% to Emdash CMS sites.
- [ ] Pre-deployment validation catches banned patterns, broken aliases, and permission errors before they reach production.
- [ ] Root domain `shipyard.company` resolves correctly (currently 404; only `www.shipyard.company` works).

### Business Model Goals
- [ ] Launch "Shipyard Care" — a maintenance subscription with three tiers.
- [ ] First subscription signed within 14 days of launch.
- [ ] MRR target: $1,000 by Month 3.

---

## 3. Non-Goals

- [ ] We are NOT adding new CMS support (WordPress, Shopify, etc.). Emdash-only.
- [ ] We are NOT rebuilding the pipeline from scratch. Harden the existing GitHub Actions workflow.
- [ ] We are NOT changing beta pricing for new project sales. Care is an add-on subscription.
- [ ] We are NOT building a customer portal in v1. Billing and management happen via Stripe Customer Portal.

---

## 4. User Stories

### As a Shipyard customer (Elon / Engineering)
- I submit a PRD via the intake form and receive a working deployed site with no human intervention.
- My site includes plugins that actually load (no 500 errors, no banned patterns).
- I receive a handoff email with clear next steps.

### As a Shipyard customer (Buffett / Business Model)
- I want my site maintained after launch without filing support tickets.
- I want predictable monthly costs, not hourly surprise bills.
- I want my plugins updated, my content refreshed, and my security monitored.

### As a Shipyard operator
- I want the pipeline to fail fast and loud with clear error logs.
- I want pre-deployment validation to catch errors before they reach customer sites.
- I want to track pipeline success rates and mean time to deploy.

---

## 5. Functional Requirements

### 5.1 Auto-Pipeline Hardening

#### 5.1.1 End-to-End Pipeline Test
```
Input: Sample PRD (Bella's Bistro clone)
Expected Output:
  1. GitHub Actions triggered on PRD push
  2. Debate round completes (2 rounds, Steve vs Elon)
  3. Plan file generated (XML task list)
  4. Build completes (Astro site + Emdash theme)
  5. Review passes (Margaret Hamilton QA checks)
  6. Deploy succeeds (Cloudflare Pages + D1 schema)
  7. Handoff email sent (Resend)
Success Criteria: 5 consecutive passes with no human intervention
```

#### 5.1.2 Pre-Deployment Validation Gate
Add a `validate` job to the GitHub Actions workflow BEFORE deploy:
- [ ] **Banned Pattern Scan**: Run regex against all plugin PHP files for forbidden patterns (e.g., `eval()`, `exec()`, `passthru()`, direct DB queries without `$wpdb->prepare`). EventDash had 95 violations — these must be caught in CI.
- [ ] **NPM Alias Resolution**: Verify all `npm` alias entrypoints resolve correctly (`npm ls --depth=0` fails if aliases are broken).
- [ ] **Permission Check**: Verify build output files have correct permissions (644 for files, 755 for dirs) before R2 upload.
- [ ] **Emdash Compatibility Check**: Verify `emdash.json` schema version matches target site version.

#### 5.1.3 Plugin Deployment Fix
- [ ] Fix EventDash banned patterns (95 violations → 0).
- [ ] Fix broken npm alias entrypoints in 3 affected plugins.
- [ ] Add plugin-specific CI tests that load each plugin in a sandboxed Emdash environment.

#### 5.1.4 Root Domain Fix
- [ ] Configure Vercel redirect: `shipyard.company` → `www.shipyard.company` (301 permanent).
- [ ] Verify SSL certificate covers apex domain.

### 5.2 Shipyard Care Maintenance Subscription

#### 5.2.1 Pricing Tiers

| Tier | Monthly | Annual | Includes |
|------|---------|--------|----------|
| **Care Starter** | $149 | $1,490 (2 months free) | Hosting, security monitoring, plugin updates, monthly backup, email support |
| **Care Standard** | $299 | $2,990 (2 months free) | Everything in Starter + monthly content tweak (1 hr), priority support, uptime SLA (99.5%) |
| **Care Complex** | $499 | $4,990 (2 months free) | Everything in Standard + weekly content tweaks (2 hrs), custom plugin maintenance, uptime SLA (99.9%), dedicated Slack channel |

#### 5.2.2 Subscription Mechanics
- [ ] Stripe Checkout integration for subscription signup (linked from handoff email and pricing page).
- [ ] Stripe Customer Portal for self-service billing (update card, cancel, upgrade/downgrade).
- [ ] Prorated billing for mid-month signups.
- [ ] Annual plan includes 2 months free (17% discount) to improve cash flow and retention.

#### 5.2.3 Service Delivery
- [ ] **Hosting**: Already on Cloudflare Pages. Care subscription includes bandwidth and request quotas.
- [ ] **Security Monitoring**: Weekly scan via Cloudflare Security Events API. Alert on threshold breach.
- [ ] **Plugin Updates**: Monthly batch update of Emdash plugins. Test in staging before production.
- [ ] **Content Tweaks**: Customer submits request via email (v1). Limit: 1 hr (Standard) or 2 hrs/week (Complex). Overage billed at $150/hr.
- [ ] **Monthly Report**: Automated email summarizing uptime, updates applied, security events, and content changes made.

#### 5.2.4 Marketing Site Updates
- [ ] Add "Shipyard Care" section to `/pricing` page.
- [ ] Add FAQ: "What happens after my site launches?"
- [ ] Update handoff email template to include Care subscription CTA.

---

## 6. Technical Requirements

### 6.1 Auto-Pipeline

**Stack**: GitHub Actions, Cloudflare Workers/Pages, D1, R2, Resend

```yaml
# .github/workflows/shipyard-pipeline.yml (updated)
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Banned Pattern Scan
        run: |
          ./scripts/banned-pattern-scan.sh plugins/
      - name: NPM Alias Check
        run: |
          npm ls --depth=0 || exit 1
      - name: Permission Check
        run: |
          find dist/ -type f ! -perm 644 -o -type d ! -perm 755
      - name: Emdash Compatibility Check
        run: |
          node scripts/verify-emdash-schema.js --target $EMDASH_VERSION
  deploy:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloudflare Pages
        ...
```

**New Scripts**:
- `scripts/banned-pattern-scan.sh`: Regex-based scan for PHP/JS forbidden patterns. Fails CI on match.
- `scripts/verify-emdash-schema.js`: Compares `emdash.json` schema version against target site.
- `scripts/plugin-sandbox-test.js`: Loads each plugin in a headless Emdash environment. Fails on PHP fatal error.

### 6.2 Shipyard Care

**Stack**: Stripe Billing, Cloudflare D1 (new `care_subscriptions` table), Resend

```sql
-- New table: care_subscriptions
CREATE TABLE care_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_email TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  tier TEXT CHECK(tier IN ('starter', 'standard', 'complex')),
  project_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('active', 'canceled', 'past_due')),
  started_at TEXT DEFAULT CURRENT_TIMESTAMP,
  canceled_at TEXT,
  monthly_content_hours_used REAL DEFAULT 0
);
```

**Stripe Products**:
- Create 3 Stripe Products (Care Starter, Care Standard, Care Complex) with monthly and annual prices.
- Webhook endpoint: `POST /api/stripe/webhook` → update `care_subscriptions.status` on `invoice.paid`, `invoice.payment_failed`, `customer.subscription.deleted`.

**Monthly Report Automation**:
- Cloudflare Cron Trigger (weekly) → Worker → fetch Cloudflare Analytics API → generate email → Resend.

---

## 7. Open Questions

1. **Plugin update strategy**: For monthly plugin updates, do we maintain a staging Emdash site per customer, or a shared staging environment? (Leans toward shared to reduce cost.)
2. **Content tweak workflow**: v1 is email-based. v2 could be a simple form. Is v1 sufficient for launch?
3. **Care for existing beta customers**: Do we offer Care to existing beta customers at a discount, or full price? (Leans toward 25% discount for first 3 months as loyalty reward.)
4. **Apex domain**: Is `shipyard.company` DNS configured at registrar, or does Vercel handle apex? (Need to verify Cloudflare/Vercel apex config.)

---

## 8. Success Metrics

| Metric | Baseline | Target (30d) | Target (90d) |
|--------|----------|--------------|--------------|
| Auto-pipeline e2e pass rate | 0% | 80% | 95% |
| Plugin deployment success | ~60% | 90% | >95% |
| Banned pattern escapes to prod | 95+ | 0 | 0 |
| Root domain 404s | 100% | 0% | 0% |
| Care MRR | $0 | $500 | $1,000 |
| Care churn rate | N/A | <10% | <8% |
| Care NPS | N/A | >30 | >40 |

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Auto-pipeline testing reveals fundamental architecture flaw | Medium | High | Time-box test to 1 week. If fundamental, escalate to Phil for scope reduction. |
| Customers reject monthly fees after one-time build | Medium | High | Offer 30-day free trial. Focus on value: "For less than a daily coffee, your site stays secure and updated." |
| Plugin sandbox tests are slow (5+ min per plugin) | Medium | Medium | Parallelize in CI. Cache Emdash container image. |
| Stripe webhook failures cause subscription state drift | Low | High | Idempotent webhook handler. Daily reconciliation job. |

---

## 10. Dependencies

- [ ] Cloudflare API keys configured in GitHub Actions secrets (for deploy)
- [ ] Stripe account with Products/Prices created
- [ ] Resend API key for transactional emails
- [ ] Vercel apex domain redirect config access

---

## 11. Out of Scope (Future Versions)

- Customer portal dashboard (v2)
- AI-generated content tweaks (v2)
- Multi-site Care plans (v2)
- White-label Care for agencies (v3)

---

> **Bottom line**: Shipyard AI is a Porsche with no roads and no gas station. The auto-pipeline is the road. The maintenance subscription is the gas station. Build both, or admit we are a boutique agency.
