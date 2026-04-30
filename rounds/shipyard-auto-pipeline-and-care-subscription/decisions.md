# Decisions — Keep (Shipyard Auto-Pipeline & Care Subscription)

> **Status:** Locked for build phase
> **Phil's directive:** Ship hull. Keep invisible. One green end-to-end run.

---

## Decision Log

### 1. Product Name: "Keep"
- **Proposed by:** Steve Jobs
- **Opposed by:** Elon Musk ("Stop naming the ship. Build the hull.")
- **Winner:** Steve Jobs (conceded by Elon: "call it whatever, but don't spend tokens on it now")
- **Why:** "Keep" is a verb. One word. Sells the outcome (your ship stays seaworthy), not the process. Elon accepted the name but blocked any further token spend on branding until the pipeline ships.

### 2. Pricing: One Tier, $199/mo, No SLAs, No Hourly Overages
- **Proposed by:** Elon Musk
- **Supported by:** Steve Jobs ("NO to hourly overage charges. Predictable pricing or death.")
- **Winner:** Elon Musk
- **Why:** Zero customers and zero willingness-to-pay data. Three tiers = analysis paralysis. Launch one tier, learn from real wallets. SLAs cut because Cloudflare Pages without enterprise support = liability without infrastructure.

### 3. No Publicly Visible Tier Matrix on Marketing Site
- **Proposed by:** Steve Jobs
- **Opposed by:** None (Elon already argued for one tier)
- **Winner:** Steve Jobs
- **Why:** A tier grid is a spreadsheet, not a product. Singular offering reinforces the "Keep" brand. Pricing lives in Stripe Checkout; the product lives in the results.

### 4. Customer Portal: Cut for v1
- **Proposed by:** Steve Jobs ("NO to a customer portal v1, v2, or v3")
- **Opposed by:** Elon Musk ("'No customer portal' is operational suicide... opaque systems require more support, not less")
- **Winner:** Steve Jobs (with Elon's caveat)
- **Why:** v1 ships without a portal. Billing and subscription management live in Stripe Customer Portal. Elon's operational concern is addressed by the Resend handoff + basic status observability (see Decision 9). When the machine is proven, a portal may be reconsidered.

### 5. Plugin Sandbox Tests: Deferred to v2
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** 95 violations get fixed manually. Don't build a containerized test harness before 50 plugins exist. Pre-deployment validation stays under 30 seconds or it will be bypassed.

### 6. Automated Monthly Reports: Deferred to v2
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** Don't build analytics pipelines for a non-existent subscriber base. On-demand or manual only in v1.

### 7. Dedicated Slack Channels: Cut for v1
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** Zero subscribers. Email works. If it requires a human to scale linearly with customers, it is cut.

### 8. Human Content Tweaks / "Services Business" Tiers: Cut for v1
- **Proposed by:** Elon Musk
- **Supported by:** Steve Jobs (no hourly overages)
- **Winner:** Elon Musk
- **Why:** Standard (1 hr/month) and Complex (2 hrs/week) tweaks make this a services business, not SaaS. Either automate with AI or kill the tier. v1 ships with zero human-dependent ops.

### 9. Observability: Minimal, Legible Status — Not "Invisible"
- **Proposed by:** Elon Musk ("Observability is trust. Make it legible first. Beautiful later.")
- **Opposed by:** Steve Jobs ("Hide the machinery. Nobody cares about CI/CD.")
- **Winner:** Elon Musk
- **Why:** The machine is currently broken (zero successful runs). Invisible design only works when the machine is perfect. v1 shows: build status, pass/fail, and why a failure occurred. No dashboards. No "CI/CD" jargon on customer-facing surfaces. Trust through transparency, not chrome.

### 10. Brand Voice: Captain-to-Owner, No Corporate Speak
- **Proposed by:** Steve Jobs
- **Supported by:** Elon Musk ("That is good copy.")
- **Winner:** Steve Jobs
- **Why:** "Your site is fast. Your plugins are current. Your bill is the same every month." Period. No "scalable solutions," no "leveraging automation."

### 11. Distribution Strategy: Fix Pipeline First, Then Case Studies
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** There is no distribution strategy in the PRD. "Build it and they will subscribe" is false. Shipyard is a high-ticket agency ($2,497–$14,997 per build). Recurring revenue doesn't create distribution; retention only amplifies acquisition that already exists. v1 focus: get sites live, use them as case studies for organic outreach.

### 12. Success Metric: One Green End-to-End Run, Not Five
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** Demanding five consecutive passes when zero exist is absurd. Optimize for one sigma before five sigma. First pass today, then iterate.

### 13. Internal "Debate Rounds" as Success Metric: Cut
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** Internal process theater. Customers don't care if Steve argued with Elon; they care if the site loads.

### 14. Architecture: Three Boring Primitives
- **Proposed by:** Elon Musk
- **Opposed by:** None
- **Winner:** Elon Musk
- **Why:** (1) `grep` script in GitHub Actions for banned patterns, (2) single Stripe webhook endpoint writing to D1, (3) Resend call on handoff. Everything else is ornamentation. If it takes more than one weekend to wire, the scope is wrong. ~400K tokens, 3–5 days.

---

## MVP Feature Set (v1 Ships)

| Feature | Owner | Rationale |
|---|---|---|
| **GitHub Actions banned-pattern scan** (`grep` script) | Elon | Pre-deployment validation <30s. No containerized harness. |
| **Single Stripe webhook endpoint → D1** | Elon | One source of truth for subscription state. |
| **Resend handoff email** | Elon | Customer knows their site is live. First 30 seconds of relief. |
| **One end-to-end green pipeline run** | Phil | Float the hull first. Nothing else ships without this. |
| **Basic status/observability** | Elon + Steve | Legible, minimal. No dashboards. No jargon. Trust through transparency. |
| **Stripe Checkout with one tier ($199/mo)** | Elon + Steve | No analysis paralysis. Learn from real transactions. |
| **Stripe Customer Portal for billing management** | Elon (concession) | Self-service cancel/update card. No custom portal. |

## Cut to v2 (Explicitly NOT in v1)

- Plugin sandbox tests
- Automated monthly reports (Cron Triggers)
- Uptime SLAs (99.5%/99.9%)
- Dedicated Slack channels
- Human content tweak tiers
- Three-tier pricing matrix
- Custom customer portal
- Debate rounds as KPI
- Heavy branding/design polish

---

## File Structure (What Gets Built)

```
shipyard-auto-pipeline-and-care-subscription/
├── .github/
│   └── workflows/
│       └── banned-pattern-scan.yml    # GitHub Actions: grep for banned patterns
├── src/
│   ├── webhooks/
│   │   └── stripe.ts                  # Single Stripe webhook → D1 write
│   ├── email/
│   │   └── resend.ts                  # Handoff / status emails
│   ├── db/
│   │   └── schema.sql                 # D1 schema (subscriptions, sites, status)
│   └── scripts/
│       └── banned-pattern-scan.sh     # `grep`-based scan, <30s
├── public/
│   └── checkout/                      # Stripe Checkout redirect (minimal)
├── wrangler.toml                      # Cloudflare Workers + D1 config
├── package.json
└── README.md                          # Runbook: how to deploy, debug, cancel
```

---

## Open Questions (Unresolved / Decide in Build)

1. **What exactly are the 95 banned patterns?**
   Need final list of regexes for the `grep` script. Currently inferred from violations, not enumerated.

2. **Resend email content and trigger conditions**
   On handoff only? On failure too? Who is the "from" address? Need copy in Steve's voice.

3. **Stripe webhook security: verify signature in Worker or trust Cloudflare?**
   Elon says single endpoint. Need decision on whether to add `stripe.webhooks.constructEvent` or rely on D1 RLS/Worker isolation.

4. **D1 schema: do we store full Stripe event history or current state only?**
   At 100x, D1 throughput limits. Need schema that supports queue migration later (Cloudflare Queues) without rebuild.

5. **Cancel flow: Stripe Customer Portal redirect or custom route?**
   Elon wants "in Stripe." Steve wants "no portal." Compromise is Stripe-hosted portal, but need URL strategy.

6. **Observability surface: where does legible status live?**
   README? A `/status` route? Email-only? Decision 9 says "make it legible" but not "where."

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Pipeline still fails after scopedown** | Medium | Critical | Daily green-run standup. If no pass in 48h, escalate to Phil for re-scoping or external dependency fix. |
| **D1 + Stripe webhooks bottleneck at >100 subs** | Low (v1) / High (v2) | High | Schema designed for Cloudflare Queues migration. Monitor webhook latency from day one. |
| **GitHub Actions runner limits at scale** | Low (v1) / High (v2) | Medium | Track build concurrency. Self-hosted runners or build queue if >20 concurrent projects. |
| **No distribution = zero subscribers even if pipeline works** | High | High | Phil mandate: use every live site as a case study. Organic outreach only. Do not expect viral loop from maintenance product. |
| **Customer emails Resend to cancel; no human process defined** | Medium | Medium | Stripe Customer Portal handles 80% of cases. Escalation path: email → Notion task → manual cancel in Stripe Dashboard. Document in README. |
| **One-tier pricing fails to capture enterprise willingness-to-pay** | Medium | Medium | Acceptable loss for v1. Enterprise tier is a v2 bet after 50+ paying customers. |
| **Banned-pattern scan false positives break valid builds** | Medium | High | Keep regex list small and conservative. Log every hit. Manual override documented in README. |
| **Steve demands invisible polish before machine works** | Medium | Medium | Phil locks build scope. Invisible polish is v2 backlog, gated on 5 consecutive green runs. |

---

*Locked by Phil Jackson. Build the hull. Don't name the ship. One green run.*
