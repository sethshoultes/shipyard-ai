# HARBOR Implementation Risk Assessment
**Risk Scanner Mission: Identify and Categorize Risks for Phase 1 Launch**

Generated: 2026-04-08
Status: Complete Analysis
Baseline: decisions.md + failed/shipyard-maintenance-system.md + codebase inventory

---

## TECHNICAL RISKS

### RISK-001: Lighthouse API Scale & Rate Limiting
**Description:** Weekly Lighthouse runs across 100+ sites (100K+ audit requests/month) will exceed Google PageSpeed API quotas and incur significant compute costs.

**Likelihood:** Medium → High (at scale >50 clients)
**Impact:** High
**Current Code State:**
- `/home/agent/shipyard-ai/deliverables/shipyard-care/lib/pagespeed.ts` implements 5-minute caching
- Uses serial batch processing with 3-concurrent limit
- No rate-limit handling or fallback strategy
- API calls unmetered per month

**Mitigation Strategy:**
1. Phase 1: Cap at 10 pilot clients (100 runs/week = manageable)
2. Implement batch cron job with exponential backoff for API failures
3. Add Lighthouse result caching (currently 5-min in-memory only)
4. Track API quota usage before reaching limits
5. Prepare SQLite-based metrics database for results deduplication
6. Decision needed: Switch to Lighthouse CI self-hosted before 50 clients

**Owner:** Engineering
**Deadline:** Week 3 (before dashboard build)

---

### RISK-002: Cron Job Collisions & Parallelization Bottleneck
**Description:** Sequential Lighthouse batch runs + uptime checks + email triggers on single cron agent = job queue overflow. 100 sites → 200+ minutes of sequential execution.

**Likelihood:** Medium → High (threshold: 30+ active clients)
**Impact:** Medium
**Current Code State:**
- Batch functions use Promise.all with manual concurrency limits (3-5 parallel)
- No queue system or job scheduling library detected
- Lighthouse: concurrency=3, caching=5min only
- Uptime checks: concurrency=5, run independently
- No retry logic for failed checks

**Mitigation Strategy:**
1. Implement BullMQ or similar job queue (avoid single-point-of-failure cron)
2. Parallelize independent jobs: Uptime checks ≠ Lighthouse runs ≠ Email sends
3. Set timeout per job: Lighthouse (5min), Uptime (30sec), Email (10sec)
4. Add dead-letter queue for failed jobs
5. At 30+ clients, scale to multi-process worker pool
6. Monitor job queue depth; alert if queue > 50 pending

**Owner:** Engineering
**Deadline:** Week 2 (during cron architecture phase)

---

### RISK-003: Cloudflare Analytics API Rate Limiting & Quota Exhaustion
**Description:** Fetching traffic data for 100+ sites daily from Cloudflare API (limited to 1,200 requests/minute) may hit throttling. No fallback if API is slow/down.

**Likelihood:** Low → Medium (threshold: 100+ sites)
**Impact:** Medium
**Current Code State:**
- No Cloudflare API integration code found in codebase
- Likely not yet implemented (decision.md references it, no code)
- Not mentioned in deliverables/shipyard-care

**Mitigation Strategy:**
1. Implement before pilot launch: Cloudflare API client with retry logic
2. Use GraphQL batch endpoint (single request for multiple sites)
3. Cache traffic data for 24 hours (yesterday's data acceptable for dashboard)
4. Add graceful degradation: show "last update 24 hours ago" vs failing
5. Test with 5 pilot sites before scaling
6. Document Cloudflare API quotas in runbook

**Owner:** Engineering
**Deadline:** Week 3 (analytics integration)

---

### RISK-004: JSON File Corruption & Data Loss
**Description:** Using JSON files (instead of database) until 500 clients risks data corruption on failed writes, concurrent writes, or infrastructure failures. "No ACID guarantees."

**Likelihood:** Medium
**Impact:** Critical (data loss = business failure)
**Current Code State:**
- Decisions.md mandates: "JSON file until 500 clients"
- Code uses Drizzle ORM with PostgreSQL (subscriptionsTable, metricsTable, sitesTable)
- **No JSON file storage code found** — using proper database schema instead
- Migration files exist: `/home/agent/shipyard-ai/deliverables/shipyard-care/migrations/`

**Good News:** Codebase is already using PostgreSQL, not JSON files.
**Remaining Risk:** Subscription state must verify Stripe as source of truth (cache TTL=60s per code comment).

**Mitigation Strategy:**
1. Continue PostgreSQL approach (deviation from decision.md is correct)
2. Ensure subscriptionsTable cache validation: query Stripe every 60s for authorization
3. Implement database backups: automated daily backups to S3
4. Add write-ahead logging (WAL) for crash recovery
5. Test data recovery procedure before launch
6. Document backup/restore process

**Owner:** Infrastructure
**Deadline:** Week 1 (database setup)

---

### RISK-005: Integration Surface Area & Dependency Chain
**Description:** HARBOR requires 7+ external integrations (Stripe, Cloudflare, Google PageSpeed, Uptime monitoring, Email/Resend, Database, Magic links). Each is a failure point.

**Likelihood:** Medium
**Impact:** High
**Current Code State:**
- Stripe integration: ✓ Complete (`/apps/pulse/lib/stripe.ts`)
- PageSpeed API: ✓ Complete (`deliverables/shipyard-care/lib/pagespeed.ts`)
- Uptime checks: ✓ Complete (`deliverables/shipyard-care/lib/uptime.ts`)
- Health score: ✓ Complete (`deliverables/shipyard-care/lib/health-score.ts`)
- Cloudflare: ✗ Not found
- Email/Resend: ✗ Not found
- Magic links: ✗ Not found

**Integration Inventory:**
```
1. Stripe (Payment) → stripe.ts
2. Google PageSpeed API → pagespeed.ts (with caching)
3. Uptime Monitor (via fetch) → uptime.ts
4. Health Score Calculator → health-score.ts
5. PostgreSQL Database → db schemas
6. Cloudflare Analytics → [MISSING]
7. Email Service (Resend?) → [MISSING]
8. Magic Link Auth → [MISSING]
```

**Mitigation Strategy:**
1. Phase 1: Implement only Stripe, PageSpeed, Uptime, Health Score (core 4)
2. Defer Cloudflare & Email to Week 3
3. Create integration test suite: mock each API, test fallback paths
4. Document API failures & recovery: what happens if each goes down?
5. Implement circuit breakers for external APIs (fail fast, not cascade)
6. Limit scope: V1 ships without suggestions, alerts, advanced features
7. Add integration health dashboard (internal tool) to monitor all APIs

**Owner:** Engineering
**Deadline:** Week 1 (integration matrix) + Week 3 (remaining integrations)

---

### RISK-006: UUID Collision Risk (Dashboard URL Guessing)
**Description:** UUIDv4 provides 122-bit entropy (unguessable), but concern exists about security if dashboard links are forwarded to competitors.

**Likelihood:** Very Low (UUID collision)
**Impact:** High (data exposure)
**Current Code State:**
- Decisions.md approves UUIDv4 + no password for v1
- No password protection code found
- Magic link implementation: [MISSING]

**Mitigation Strategy:**
1. Implement UUIDv4 for dashboard URLs (entropy sufficient for v1)
2. Add optional PIN/password in v2 if demand emerges
3. Monitor for URL exposure: log all dashboard access per client
4. Add rate limiting to prevent brute-force attempts
5. Implement "last accessed by" in dashboard (shows if shared)
6. Prepare magic link auth (avoid persistent sessions)

**Owner:** Security/Engineering
**Deadline:** Week 4 (dashboard implementation)

---

## BUSINESS RISKS

### RISK-007: Zero Attach Rate (No Customers Convert)
**Description:** First 10 clients refuse maintenance contracts. Zero MRR from maintenance = business failure.

**Likelihood:** Medium → High (industry baseline: 10-15% attach, target 30%)
**Impact:** Critical
**Source:** Elon R1: "Zero clients have ever bought maintenance. This is a cold-start problem."

**Mitigation Strategy:**
1. **Hand-sell first 10** (non-negotiable)
2. Criteria for pilot selection:
   - Project value > $20K (invested in quality)
   - Launched within 6 months (still warm relationship)
   - Responsive communication (likely to engage)
3. Offer **free month 1** to reduce friction
4. Launch email sequence: celebrate delivery, not sell maintenance
5. Dashboard must show value within first week (traffic, health)
6. Follow-up calls at Day 7 & Day 30
7. Measure: track attach rate weekly; pivot pricing if <20% at Day 30

**Owner:** Sales/Steve (partnerships)
**Deadline:** Week 5 (client selection before launch)

---

### RISK-008: "Small Updates" Abuse & Boundary Disputes
**Description:** Customers exploit ambiguity about what's "included" vs "billable." Client claims logo swap = text update (no charge), Shipyard disagrees = support burden + churn.

**Likelihood:** High
**Impact:** High
**Current Code State:**
- Decisions.md proposes: "30-minute threshold = small"
- No implementation for update categorization found
- Fixed pricing exists: `{logo_swap: $25, text_update: $25, new_page: $150}`
- No request form found

**Mitigation Strategy:**
1. **Publish clear definitions BEFORE launch** (required):
   - Small: < 30 min work, no new assets = included
   - Medium: 30-60 min = $25-75
   - Large: > 60 min or new page = $150+
2. Examples in writing:
   - Small: Logo swap, typo fix, color change, text swap
   - Medium: Add blog post (with formatting), adjust spacing
   - Large: New page, new section, custom feature, design refresh
3. Implement "request categorization" form: client selects size, Shipyard estimates
4. If dispute occurs: prepay $25 credit for first review (builds goodwill, discourages abuse)
5. Track disputes: categorize by type, refine definitions monthly

**Owner:** Product/Steve (copy + legal)
**Deadline:** Week 2 (document & publish)

---

### RISK-009: Request Dispute Resolution (No Clear Escalation Path)
**Description:** Client submits request, Shipyard categorizes as $150 (new page), client argues it's $25 (text update). No escalation policy = costly support conversations.

**Likelihood:** Medium
**Impact:** Medium
**Current Code State:**
- Decisions.md: "Every request requires work. MRR looks great until margins compress."
- No dispute resolution policy found

**Mitigation Strategy:**
1. Create written dispute policy (publish in ToS):
   - Day 1-3: Client can appeal categorization
   - Day 3-7: Shipyard reviews appeal with screenshot
   - Day 7+: Category stands; offer partial credit ($25) if goodwill warranted
2. Implement "Appeal Request" form in dashboard (audit trail)
3. Budget for: 1 dispute per 10 customers/month during ramp-up
4. Escalation: disputes > 3/month per client = candidate for Special pricing tier
5. Measure: track appeal rate, categories most disputed

**Owner:** Product/Support
**Deadline:** Week 3 (policy document)

---

### RISK-010: Churn at Month 3 (Clients Don't See Value)
**Description:** Clients sign up for maintenance, don't use dashboard, churn at 90 days. No proactive value demonstration = "we're just paying for nothing."

**Likelihood:** Medium
**Impact:** High
**Current Code State:**
- Decisions.md mandates email sequence: Day 0, 7, 30, 90, 365
- Email templates: [MISSING from codebase]
- Dashboard must show traffic + health within first week

**Mitigation Strategy:**
1. **Week 1 Email:** "Your site had 1,247 visitors this week. Here's what's working."
2. **Week 4 Email:** "Month 1 summary: 12K visitors, 2 small updates completed. Dashboard shows health score trend."
3. **Day 85 Email:** "Let's refresh your site before Month 2. Here's what we're seeing..." (encourage request)
4. **Day 365 Email:** Anniversary celebration + year-in-review + 20% off redesign offer
5. Dashboard must auto-load latest metrics (no manual refresh)
6. **Engagement target:** 2+ dashboard views/month per active customer
7. If churn > 15% at Month 3, investigate: send exit survey, identify pain points

**Owner:** Product/Steve (copy)
**Deadline:** Week 4 (email templates) + Week 5 (final copy)

---

### RISK-011: Price Point Wrong ($79 Too High or Too Low)
**Description:** $79/month may be too expensive for SMBs or too cheap relative to work required. No pricing flexibility in v1.

**Likelihood:** Medium
**Impact:** Medium
**Current Code State:**
- Decisions.md: "Start at $79/month. Adjust based on first 10 conversations."
- No dynamic pricing or A/B testing code found

**Mitigation Strategy:**
1. Launch at $79 for first 10 customers (fixed)
2. Collect feedback: "Is pricing fair?" in onboarding survey
3. If 50% say "too expensive," offer $59 for month 2
4. If 50% say "too cheap," Elon was right, increase to $99 for new signups
5. At 50+ customers: introduce tiering (Basic $59, Pro $99) but NOT v1
6. Measure: track price sensitivity across industry vertical (dental, restaurant, etc.)
7. Consider annual prepay discount (2 months free) at 25+ customers

**Owner:** Elon/Leadership
**Deadline:** Day 30 post-launch (first pricing review)

---

### RISK-012: This Is a Services Business Wearing SaaS Clothes
**Description:** Every request requires human work (no automation). HARBOR looks like SaaS (dashboard, monthly billing) but scales like services (1 person = capacity limit).

**Likelihood:** Medium
**Impact:** High
**Current Code State:**
- Decisions.md: "Clear update limits. Fixed pricing. Don't promise automation you can't deliver."
- Request queue not found (likely manual Slack/email)

**Mitigation Strategy:**
1. **Accept reality:** This is SaaS *infrastructure* + Services *delivery*
2. Set explicit update limits: 3-5 updates/month per tier (hard caps)
3. No "unlimited" or "as much as you want" language
4. Overage path: "Upgrade to Pro ($99) or wait until next month"
5. At 30+ clients: hire contractor for update execution OR implement AI-assisted templating
6. Measure: track human hours/month per client; calculate breakeven at scale
7. Plan v2: AI suggestions engine (automated some updates)

**Owner:** Elon/Leadership
**Deadline:** Week 1 (clarify model) + Day 30 (capacity assessment)

---

### RISK-013: Acquisition Bottleneck (Not Enough Clients to Make Math Work)
**Description:** Shipyard does 3-5 projects/month. At 30% attach rate = 1 client/month = $79 MRR. Maintenance won't scale if project pipeline is slow.

**Likelihood:** High
**Impact:** Critical
**Source:** Elon R1: "How many projects does Shipyard complete per month? If <5, maintenance funnel is rounding error."

**Mitigation Strategy:**
1. **Prerequisite:** Fix acquisition first (outside HARBOR scope)
2. HARBOR works IF project volume is 5+ sites/month
3. At current rate (<3): expect <1 attach/month = not viable business
4. Don't pursue maintenance scaling until project pipeline is 5+/month
5. Use first 30 days to validate: are projects 5+/month? If not, pause HARBOR
6. Measure: track project completion rate weekly; gate maintenance scale-out

**Owner:** Elon/Business Development
**Deadline:** Day 1 (validate baseline) + Day 30 (go/no-go decision)

---

## OPERATIONAL RISKS

### RISK-014: One-Person Bottleneck (All Requests Flow Through One Human)
**Description:** At 30+ contracts, request execution becomes 1 person full-time. Burnout, single point of failure, zero vacation.

**Likelihood:** High (at 30+ contracts)
**Impact:** Critical
**Current Code State:**
- No request queue system found
- No templating or automation library detected
- Likely: Slack/email → manual execution

**Mitigation Strategy:**
1. Phase 1 (< 10 clients): One person can manage
2. Phase 2 (10-30 clients, Month 6): Hire contractor for 10 hrs/week support
3. Phase 3 (30+ clients, Month 12): Either hire full-time OR implement AI suggestions
4. Implement request queue system NOW (even if manual):
   - Asana/Monday.com board: track pending → in-progress → done
   - SLA: respond to requests within 24 hours
   - Estimated time per request: logo swap (15 min), page (2 hrs)
5. At 30 clients with 3 updates/month: 30 × 3 × 1 hr avg = 90 hours/month
6. **Hiring trigger:** When human hours > 40/week, hire support

**Owner:** Operations/Leadership
**Deadline:** Week 2 (implement request queue) + Month 6 (reassess)

---

### RISK-015: Scope Creep (V2 Features Sneaking Into V1)
**Description:** Feature requests: "Add suggestions engine," "Real-time alerts," "White-labeling." Team adds features during weeks 2-5 → timeline slips → v1 ships late.

**Likelihood:** Medium
**Impact:** High
**Current Code State:**
- Decisions.md: "This document is the contract. No exceptions."
- Feature exclusion list clearly documented

**Mitigation Strategy:**
1. **Lock the feature list NOW** (post this risk assessment)
2. Create JIRA/GitHub project: HARBOR-V1 with only approved features
3. Tag any out-of-scope request: "V2: [feature name]"
4. Weekly standup: review out-of-scope requests, do NOT allow additions
5. Week 5 is POLISH ONLY (copy refinement, visual polish, QA)
6. If feature creep emerges: cut features, not timeline
7. Document "V2 Wishlist" (suggestions, alerts, analytics, white-label) for future

**Owner:** Engineering/Product
**Deadline:** Week 1 (lock features) + Weekly (enforce)

---

### RISK-016: Dashboard Feels Rushed (Shipped Fast, Looks Abandoned)
**Description:** v1 dashboard ships with 3 metrics (traffic, health, updated). If UI/copy feels unpolished, clients think "this is cheap, low-quality service."

**Likelihood:** Medium
**Impact:** High (emotional, affects churn)
**Current Code State:**
- Dashboard template framework: [MISSING]
- Health indicator component: referenced but [MISSING]
- Copy/voice framework: [MISSING]

**Mitigation Strategy:**
1. **Week 1-4:** Feature + integration build
2. **Week 5:** POLISH ONLY (no new code)
3. Design checklist for Week 5:
   - Typography: use 2 fonts max (warm, not cold)
   - Colors: green/yellow/red health indicator prominent
   - Copy: every word reflects "care" (Steve's voice)
   - Spacing: generous whitespace (not cramped)
   - Performance: dashboard loads < 1 sec
4. Run internal QA: 5 non-engineer reviews
5. Get Steve's approval on copy before launch
6. A/B test email subject lines (celebrate vs inform)

**Owner:** Design/Steve
**Deadline:** Week 5 (polish phase)

---

### RISK-017: Overage Handling at Scale (Hard Caps Don't Scale)
**Description:** At 500+ clients, "Upgrade or wait" escalation path becomes full-time customer support conversation. Hard cap is correct, but process must scale.

**Likelihood:** High (at 500+ clients)
**Impact:** Medium (future risk, not imminent)
**Current Code State:**
- Decision: "Hard caps with escalation button"
- No escalation system found

**Mitigation Strategy:**
1. Phase 1: Manual escalation (customer contacts support → human conversation)
2. Phase 2 (100+ clients): Implement "Request Priority Upgrade" form (one-click)
3. Phase 3 (500+ clients): Auto-approve overage requests < $50, human review > $50
4. Implement: "Next month overage credit" (client gets $25 credit, can wait OR pay $25 to rush)
5. Track: measure % of customers hitting caps monthly; adjust pricing if > 20%
6. At 500+ clients: consider Tier 2 (Pro) with higher limits ($199, 10 updates/month)

**Owner:** Product/Support
**Deadline:** Month 6 (reassess at 100+ clients)

---

## UNRESOLVED OPEN QUESTIONS

### Question 1: Monthly Request Allowance (3 or 5 updates?)
**Status:** Not Resolved in Code
**Decision Needed:**
- Option A: 3 updates/month (conservative, sustainable margins)
- Option B: 5 updates/month (competitive, risk of abuse)
- Option C: 3 small + unlimited large (definitional nightmare)

**Recommendation:** Start with 3 updates/month (lower risk, can raise at Month 3 if customers demand)
**Owner:** Elon/Leadership
**Deadline:** Before first sales call (Week 4)

---

### Question 2: "Small Update" Definition (< 30 min rule)
**Status:** Proposed but Not Codified
**Decision Needed:** Create & publish clear 1-page guide with examples

**Recommendation Template:**
```
SMALL (Included in plan):
- Logo or image swap (same dimensions)
- Text typo or copy change (< 100 words)
- Color adjustment
- Menu reordering
- Font size tweak
Est. time: 10-30 min

MEDIUM (Billable at $25-50):
- Add blog post (with formatting)
- Adjust section spacing
- Add new testimonial/quote
- Minor layout shift
Est. time: 30-60 min

LARGE (Billable at $75-150):
- New page (design + dev)
- New section (newsletter signup, etc.)
- Major redesign component
- Custom feature
Est. time: 2+ hours
```

**Owner:** Steve (copy) + Product
**Deadline:** Week 2 (before client conversations)

---

### Question 3: Request Dispute Resolution Policy
**Status:** Not Codified
**Decision Needed:** Write 3-step escalation policy + publish in ToS

**Recommendation:**
1. Client appeals within 3 days
2. Product team reviews (check screenshot/description)
3. If client partially right: offer 50% credit; if client fully wrong: deny appeal
4. Final: no more than 2 appeals per customer per month

**Owner:** Legal/Product
**Deadline:** Week 3 (before launch)

---

### Question 4: Lighthouse Threshold Logic
**Status:** Proposed in decisions.md, Not Tested
**Decision Needed:** Confirm Green/Yellow/Red thresholds before Week 2

**Current Proposal:**
```
Green:   Lighthouse >= 90 AND Accessibility >= 90
Yellow:  Lighthouse 70-89 OR Accessibility 70-89
Red:     Lighthouse < 70 OR Accessibility < 70 OR Site Down
```

**Issue:** PageSpeed API only returns Performance score (0-100), not separate Accessibility
**Recommendation:** Simplify for v1:
```
Green:   Performance >= 90
Yellow:  Performance 70-89
Red:     Performance < 70 OR Uptime < 99%
```

**Owner:** Engineering
**Deadline:** Week 2 (implement thresholds)

---

### Question 5: Security Model for Dashboard URLs
**Status:** Decided (UUIDv4 + no password), Implementation Needed
**Decision Needed:** Implement magic link auth or static UUID-only?

**Current:**
- UUIDv4 unguessable (122-bit entropy)
- No password protection (reduces friction)
- Risk: if link is shared, competitor has access

**Recommendation:**
- v1: Static UUID URL (no magic link needed)
- v2: Add optional PIN protection (client choice)
- Monitor: log all access, alert if unusual patterns

**Owner:** Engineering/Security
**Deadline:** Week 4 (dashboard auth implementation)

---

## FILE COMPLEXITY CONCERNS

### High-Complexity Files to Monitor

#### 1. `/home/agent/shipyard-ai/deliverables/shipyard-care/lib/health-score.ts`
**Complexity:** Medium (256 lines, weighted algorithm)
**Concern:** Non-linear uptime scoring may be unintuitive. Test thresholds with real data.
**Risk:** If algorithm is opaque, clients don't trust health score
**Mitigation:** Add comment explaining why 95% uptime = 90 score (non-linear)

#### 2. `/home/agent/shipyard-ai/deliverables/shipyard-care/lib/pagespeed.ts`
**Complexity:** Medium-High (290 lines, API + caching + batch)
**Concern:** In-memory cache only (5 min TTL); lost on server restart
**Risk:** Cache misses spike after deployments
**Mitigation:** Add persistent cache (Redis) at scale; for v1, 5-min cache is OK

#### 3. `/home/agent/shipyard-ai/packages/db/schema/subscriptions.ts`
**Complexity:** Medium (Stripe cache must be verified)
**Concern:** Critical note: "Stripe is source of truth. This table provides fast read access."
**Risk:** Cache TTL = 60 seconds; if client downgrades, old tier still shows for 1 minute
**Mitigation:** Verify with Stripe on every sensitive operation (access check, upgrade UX)

#### 4. `/home/agent/shipyard-ai/apps/pulse/lib/stripe.ts`
**Complexity:** Medium (error handling, idempotency keys)
**Concern:** Multiple Stripe error types; coverage test needed
**Risk:** Unhandled error type → user sees "Unknown error"
**Mitigation:** Add error type logging; monitor 'unknown_error' rate

#### 5. `/home/agent/shipyard-ai/deliverables/shipyard-care/lib/uptime.ts`
**Complexity:** Medium (async concurrency, database writes)
**Concern:** Uses fetch() HEAD requests; may be blocked by WAF/security rules
**Risk:** False negatives (site is up, uptime check fails)
**Mitigation:** Add retry logic; if 3 consecutive failures, alert human (not just down)

### Missing/Incomplete Integrations

| Integration | Status | Risk | Mitigation |
|-------------|--------|------|-----------|
| Cloudflare Analytics API | ✗ Not found | High | Implement Week 3 |
| Email service (Resend) | ✗ Not found | High | Implement Week 3 |
| Magic link auth | ✗ Not found | Medium | Implement Week 4 |
| Request queue system | ✗ Not found | Medium | Add by Week 2 |
| Dashboard HTML template | ✗ Not found | Critical | Build Week 2-3 |
| Email templates (5 total) | ✗ Not found | High | Build Week 4-5 |
| Cron job orchestration | ✗ Not found | Medium | Implement Week 2 |

---

## SUMMARY: RISK MATRIX

| Risk | Likelihood | Impact | Severity | Owner | Deadline |
|------|-----------|--------|----------|-------|----------|
| RISK-001: Lighthouse scale | Medium | High | **HIGH** | Engineering | Week 3 |
| RISK-002: Cron collisions | Medium | Medium | **MEDIUM** | Engineering | Week 2 |
| RISK-003: Cloudflare rate limits | Low | Medium | **LOW** | Engineering | Week 3 |
| RISK-004: JSON corruption | Low | Critical | **MEDIUM** (mitigated) | Infrastructure | Week 1 |
| RISK-005: Integration surface | Medium | High | **HIGH** | Engineering | Week 1-3 |
| RISK-006: UUID collision | Very Low | High | **LOW** | Security | Week 4 |
| RISK-007: Zero attach rate | Medium | Critical | **CRITICAL** | Sales/Steve | Week 5 |
| RISK-008: Small updates abuse | High | High | **CRITICAL** | Product/Steve | Week 2 |
| RISK-009: Dispute resolution | Medium | Medium | **MEDIUM** | Product | Week 3 |
| RISK-010: Churn at month 3 | Medium | High | **HIGH** | Product/Steve | Week 4-5 |
| RISK-011: Wrong price point | Medium | Medium | **MEDIUM** | Elon | Day 30 |
| RISK-012: Services vs SaaS | Medium | High | **HIGH** | Elon/Leadership | Week 1 |
| RISK-013: Acquisition bottleneck | High | Critical | **CRITICAL** | Elon/BD | Day 1 |
| RISK-014: One-person bottleneck | High | Critical | **CRITICAL** (future) | Operations | Week 2 |
| RISK-015: Scope creep | Medium | High | **HIGH** | Engineering/Product | Week 1 |
| RISK-016: Dashboard feels rushed | Medium | High | **HIGH** | Design/Steve | Week 5 |
| RISK-017: Overage at scale | High | Medium | **MEDIUM** (future) | Product | Month 6 |

---

## TOP 5 BLOCKING RISKS (Address Immediately)

1. **RISK-007: Zero Attach Rate** — If first 10 don't buy, HARBOR is dead. Hand-sell non-negotiable.
2. **RISK-013: Acquisition Bottleneck** — Project volume is prerequisite. Validate 5+/month before launch.
3. **RISK-008: Small Updates Abuse** — Codify definitions in writing NOW or face support nightmare.
4. **RISK-012: Services vs SaaS Model** — Accept it's services disguised as SaaS; set hard caps.
5. **RISK-005: Integration Surface Area** — 7+ integrations = 7 failure points. Implement in priority order.

---

## LAUNCH READINESS CHECKLIST

### Week 1 (Core Architecture)
- [ ] Lock feature list; create JIRA board with V1/V2 tags
- [ ] Validate project completion rate (must be 5+/month)
- [ ] Database backup/recovery procedure documented
- [ ] Stripe integration tested (checkout, webhooks, refunds)
- [ ] PageSpeed API caching tested
- [ ] Uptime check system tested (concurrency, fallbacks)

### Week 2 (Integration Build)
- [ ] Publish "Small Update" definitions in 1-page guide
- [ ] Implement request queue (Asana/GitHub/Monday)
- [ ] Cron job orchestration in place (BullMQ or alternative)
- [ ] Health score algorithm tested with real sites
- [ ] First pilot dashboard HTML template (basic, 3 metrics)
- [ ] Integration health dashboard (internal tool)

### Week 3 (Analytics & Scale)
- [ ] Cloudflare Analytics API integration complete
- [ ] Lighthouse threshold logic finalized & tested
- [ ] Email service (Resend) integration complete
- [ ] Disaster recovery procedure documented
- [ ] All 5 email templates drafted (Steve approval)
- [ ] Dashboard live for 1 internal test client

### Week 4 (UX & Polish)
- [ ] Magic link auth implemented (or static UUID confirmed)
- [ ] Dashboard copy refinement (warm voice throughout)
- [ ] Request dispute policy published in ToS
- [ ] First 10 pilot clients selected & contacted
- [ ] Pricing strategy confirmed ($79 base, no flexibility v1)
- [ ] Support runbook drafted (how to handle disputes, escalations)

### Week 5 (QA & Launch)
- [ ] Full end-to-end testing: sign up → request → dashboard → email
- [ ] Performance testing: dashboard load time < 1 sec
- [ ] Security audit: UUID entropy, Stripe security, DB backups
- [ ] Internal QA: 5 non-engineers test UX/copy
- [ ] Runbook finalized: deployment, monitoring, escalation
- [ ] **LAUNCH:** Monitor closely for first 30 days

---

## Post-Launch Monitoring (First 30 Days)

| Metric | Target | Measure | Action |
|--------|--------|---------|--------|
| Attach rate | 30% | Signups / Eligible clients | If <20%, pivot |
| Churn rate | <5% | Cancellations / Active | If >10%, investigate |
| Dashboard views | 2+/month | GA or server logs | If <1, improve copy |
| Support tickets | <1/month per client | Slack/email count | If >2, scope issue |
| API errors | <1% | Error logs | Monitor rate limits |
| Cron failures | 0 | Job logs | Alert immediately |
| Project volume | 5+/month | Sales pipeline | Go/no-go for scaling |

---

## Recommendation: Go/No-Go Decision Criteria

**GREEN (Go ahead with launch):**
- Project completion rate >= 5/month (RISK-013 mitigated)
- Database backups tested (RISK-004 mitigated)
- First 5 clients pre-qualified and warm (RISK-007 mitigated)
- All integrations tested (RISK-005 mitigated)
- Small update definitions published (RISK-008 mitigated)

**RED (Delay launch):**
- Project volume < 3/month (no point in maintenance)
- Database backups NOT tested (data loss risk)
- Integration failures in QA (launch will be messy)
- No small update definitions published (support will be chaos)
- Leadership disagreement on pricing/model (commit or defer)

---

**Risk Assessment Complete**
*Prepared for HARBOR Phase 1 Launch*
*5-week development sprint begins immediately*
