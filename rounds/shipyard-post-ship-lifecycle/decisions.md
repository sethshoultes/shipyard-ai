# Aftercare — Locked Decisions Blueprint

**Status:** Ready for build
**Ship deadline:** 3 days from approval
**Voice:** Trusted mechanic — someone who remembers your project

---

## I. LOCKED DECISIONS

### 1.1 Product Name
**Decision:** Aftercare
**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** Elon Musk (Round 2) — suggested "post-ship-emails" or "Follow-up"
**Winner:** Steve
**Why:** Elon conceded. "Call it Aftercare in customer-facing docs. I don't care about naming as long as we ship this week."
**Locked:** One word, human, sets emotional tone for entire system.

### 1.2 Architecture
**Decision:** One Cloudflare Worker + One KV namespace + Five templates
**Proposed by:** Elon Musk (Round 1)
**Challenged by:** Initial PRD (database schema, lifecycle tracking)
**Winner:** Elon
**Why:** Steve conceded in Round 2: "One record per scheduled email, not per project? Yeah. That's cleaner."
**Locked:** Stateless, deletable, no complex database. Worker triggered on project completion schedules 5 emails with timestamps: `Date.now() + [7, 30, 90, 180, 365] days`.

### 1.3 Data Model
**Decision:** Store absolute minimum per email: `{email, projectName, siteUrl, scheduleId}`
**Proposed by:** Elon Musk (Round 1)
**Challenged by:** Original PRD (nested objects tracking sent/opened/clicked)
**Winner:** Elon
**Why:** One record per scheduled email, not per project. Each email is independent. Email service (Resend) handles open/click tracking.
**Locked:** No custom database schema. Workers KV only.

### 1.4 Email Service
**Decision:** Resend
**Proposed by:** Elon Musk (Round 1) — "simplest API, best deliverability"
**Challenged by:** None
**Winner:** Unanimous
**Locked:** Use Resend's built-in dashboard, unsubscribe handling, and reply forwarding.

### 1.5 Email Cadence
**Decision:** Five emails at Day 7, 30, 90, 180, 365
**Proposed by:** Consensus in essence.md
**Challenged by:** None
**Winner:** Unanimous
**Locked Forever:** No Day 14 email. No quarterly check-ins. Five triggers, never changes.

### 1.6 Email Format
**Decision:** Plain text only. Zero HTML templates.
**Proposed by:** Essence.md consensus
**Challenged by:** None
**Winner:** Unanimous
**Why:** "Automation that feels handwritten" (Steve) + "3-sentence plain-text email" (Elon).
**Locked:** No rich media, no images, no branded headers. Just text.

### 1.7 Personalization
**Decision:** Only `{projectName}` and `{siteUrl}` variables. No other customization.
**Proposed by:** Steve Jobs (Round 2, Non-Negotiable #2)
**Challenged by:** None
**Winner:** Steve
**Why:** No per-industry content, no AI-generated trends, no fake personalization.
**Locked:** Same five emails to every customer, forever.

### 1.8 A/B Testing
**Decision:** Test once during development, lock winner forever. No ongoing tests.
**Proposed by:** Essence.md compromise — "Never A/B test (Steve) vs. always test (Elon) = test once, lock winner"
**Challenged by:** Elon (Round 2) — "Run the test. If 'Your site is alive' beats 'how's it going?' by 40%, use the winner."
**Counter-challenged by:** Steve (Round 2, Non-Negotiable #2) — "No A/B testing. Ever. Consistency is the brand."
**Winner:** Compromise holds
**Why:** Elon gets to validate copy with data before launch. Steve gets consistency post-launch.
**Locked:** One test during V1 development. Zero tests after ship.

### 1.9 Success Metric
**Decision:** Reply rate (not open rate, not click rate)
**Proposed by:** Elon Musk (Round 1, Round 2 Non-Negotiable #2)
**Challenged by:** Steve Jobs (Round 2) — "We're building presence, not measuring engagement"
**Winner:** Split decision
**Why:**
- **Primary metric (Elon):** Reply rate. Configure Resend to forward replies to `aftercare@shipyard.ai`. If <5% reply after 100 emails, copy is broken.
- **Secondary metric (Steve):** Mental real estate. Customer remembers us 6 months later = win, even without reply.
**Locked:** Track both. Optimize for replies (measurable). Understand presence (qualitative).

### 1.10 Brand Voice
**Decision:** Trusted Mechanic — short sentences, no jargon, sounds like one person who remembers your project
**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** None
**Winner:** Steve
**Why:** Elon conceded in Round 2: "If Steve writes the copy, I'll build the system. Deal."
**Locked:** Voice gets defined in V1 templates and never changes. Test: "Would I send this to a friend?" If not, rewrite.

### 1.11 Dashboard
**Decision:** No custom dashboard. Use Resend's built-in analytics.
**Proposed by:** Elon Musk (Round 1) — "Don't build what Resend already built"
**Challenged by:** Original PRD (custom dashboard for email performance)
**Winner:** Elon
**Why:** Steve conceded in Round 2: "Elon's 'just use Resend's dashboard' is pragmatic—I'll give him that."
**Locked:** Zero custom UI for viewing email stats. Resend only.

### 1.12 Unsubscribe
**Decision:** One-click unsubscribe via Resend's built-in handling. No preference center.
**Proposed by:** Elon Musk (Round 2 concession) — "I over-engineered by even suggesting a KV-based preference center"
**Challenged by:** None
**Winner:** Elon (simplified version)
**Locked:** Simple KV lookup to block future emails if unsubscribed. No complex preference management.

### 1.13 Timeline
**Decision:** 3 days to ship V1
**Proposed by:** Elon Musk (Round 1, Round 2 Non-Negotiable #1)
**Challenged by:** Original PRD (2 weeks)
**Winner:** Elon
**Why:** Steve conceded in Round 2: "If we build what actually matters—5 emails, scheduling, unsubscribe—it's 3 days."
**Locked:** 72 hours from approval to deployment. If longer, scope is wrong.

### 1.14 Feature Freeze
**Decision:** No feature adds for 90 days post-launch
**Proposed by:** Elon Musk (Round 2, Non-Negotiable #3) + Essence.md
**Challenged by:** None
**Winner:** Unanimous
**Why:** "This system runs untouched for one full lifecycle (365 days) before we add anything."
**Locked:** Let it run. Measure. Then decide. No Day 14 emails, no surveys, no Slack integrations.

---

## II. MVP FEATURE SET (V1)

**What ships:**
1. ✅ Five email templates (plain text, handwritten once)
2. ✅ Cloudflare Worker triggered on project completion
3. ✅ Email scheduling via Workers KV (stores `{email, projectName, siteUrl, scheduleId}`)
4. ✅ Resend integration for sending
5. ✅ Unsubscribe handling (one-click, KV-based blocking)
6. ✅ Reply forwarding to `aftercare@shipyard.ai`

**What does NOT ship:**
1. ❌ Custom dashboard (use Resend's)
2. ❌ Database schema with lifecycle tracking
3. ❌ Site monitoring / uptime checks
4. ❌ Performance metrics in emails (page speed, etc.)
5. ❌ Industry trends content
6. ❌ Case studies of similar projects
7. ❌ "Happy Anniversary" celebrations
8. ❌ Click heatmaps / advanced engagement tracking
9. ❌ Per-industry customization
10. ❌ AI-generated content
11. ❌ "Built with Shipyard" footer badges (rejected by Steve)
12. ❌ Public showcase / leaderboard (deferred to separate distribution strategy)

---

## III. FILE STRUCTURE

```
aftercare/
├── worker.js                 # Main Cloudflare Worker
│   ├── scheduleEmails()      # Triggered on project completion webhook
│   ├── sendEmail()           # Fired by Worker alarm at scheduled time
│   ├── handleUnsubscribe()   # Processes unsubscribe requests
│   └── checkKV()             # Queries KV for scheduled emails & unsub list
│
├── templates/
│   ├── day-007.txt           # "Your site is alive"
│   ├── day-030.txt           # "Need any changes?"
│   ├── day-090.txt           # "Ready for an update?"
│   ├── day-180.txt           # "Six months in. How's it going?"
│   └── day-365.txt           # "It's been a year. The web moved on."
│
├── wrangler.toml             # Cloudflare Worker config
│   └── [[kv_namespaces]]     # One KV namespace: AFTERCARE_KV
│
└── README.md                 # Deployment instructions, voice guidelines
```

**Data in Workers KV:**
- Key: `scheduled:{emailId}` → Value: `{email, projectName, siteUrl, sendAt}`
- Key: `unsubscribed:{email}` → Value: `true` (if opted out)

**No separate database.** No API server. No frontend. Just one Worker and five text files.

---

## IV. EMAIL TEMPLATES (Draft Structure)

Each email must pass Steve's test: **"Would I send this to a friend?"**

### Day 7: "Your site is alive"
- Subject: Your site is alive
- Body: We shipped your project 7 days ago. Here's what's happened since.
  - [Link: Your site]
  - [Link: Your admin]
  - [Link: How did we do?]
- CTA: Reply if something's off.

### Day 30: "Need any changes?"
- Subject: 30 days in
- Body: Your site has been live for a month. Need any changes?
- CTA: Reply with what you wish worked differently.

### Day 90: "Ready for an update?"
- Subject: Ready for an update?
- Body: Three months. The web moves fast. Ready for an update?
- CTA: Reply if yes.

### Day 180: "Six months in"
- Subject: Six months in
- Body: Your site is still running. How's it going?
- CTA: Reply if you need help.

### Day 365: "It's been a year"
- Subject: It's been a year
- Body: The web moved on. You should too.
- CTA: Reply when you're ready to refresh.

**Voice rules:**
- Short sentences. No jargon.
- No "solutions," "leverage," "ecosystem."
- Sounds like one person, not a CRM.
- No upsell. No "10% off next project."
- Honest, not cutesy.

**Final copy by:** Steve Jobs (owner)
**Validated by:** Elon Musk (reply rate data from single pre-launch A/B test)

---

## V. OPEN QUESTIONS (Needs Resolution Before Build)

### 5.1 Trigger Mechanism
**Question:** How does Shipyard's main system trigger the Worker when a project ships?
**Options:**
- Webhook from Shipyard backend → Worker endpoint
- Cloudflare Queue integration
- Manual API call from agent after ship

**Decision needed:** Define webhook payload format: `{email, projectName, siteUrl, shippedAt}`

### 5.2 Reply Handling
**Question:** Who monitors `aftercare@shipyard.ai` inbox?
**Options:**
- Human team member checks daily
- Auto-forward to existing support email
- Integrate with ticketing system

**Decision needed:** Who responds to customer replies? What's the SLA?

### 5.3 Unsubscribe Link Format
**Question:** What URL handles unsubscribe?
**Options:**
- `https://aftercare.shipyard.ai/unsubscribe?email={email}`
- Resend's built-in unsubscribe (automatically appended to emails)

**Decision needed:** Use Resend's built-in or custom Worker endpoint?

### 5.4 Pre-Launch A/B Test Scope
**Question:** What gets tested in the one-time A/B test?
**Options:**
- Subject lines only (5 variants)
- Full email body (5 variants)
- Single email (Day 30) vs. all five

**Decision needed:** Define test parameters before writing final templates.

### 5.5 Project Metadata
**Question:** What data is available at ship time?
**Assumptions:** `projectName`, `siteUrl`, `email`
**Unknown:** Customer name? Company? Industry? Ship date?

**Decision needed:** Confirm available variables from Shipyard's main system.

---

## VI. RISK REGISTER

### 6.1 Technical Risks

**Risk:** Cloudflare Worker alarm fails to fire
**Likelihood:** Low (Cloudflare SLA 99.99%)
**Impact:** High (email never sends, customer forgotten)
**Mitigation:**
- Monitor Worker logs daily for first 30 days
- Set up Cloudflare alert if alarm fails
- Manual retry mechanism via KV query

**Risk:** Resend rate limits or deliverability issues
**Likelihood:** Low (Resend scales to millions)
**Impact:** Medium (emails delayed or bounced)
**Mitigation:**
- Start with low volume (<100 emails/day)
- Monitor Resend dashboard for bounce rate
- Keep plain-text format (highest deliverability)

**Risk:** Workers KV eventual consistency causes duplicate emails
**Likelihood:** Medium (KV is eventually consistent)
**Impact:** Medium (customer gets same email twice, looks sloppy)
**Mitigation:**
- Use unique `scheduleId` per email
- Check KV for existing schedule before creating new one
- Accept rare duplicates vs. over-engineering deduplication

**Risk:** No way to debug why an email didn't send
**Likelihood:** Medium (no custom dashboard)
**Impact:** Medium (can't troubleshoot customer complaints)
**Mitigation:**
- Use Cloudflare Worker logs (shows all executions)
- Use Resend dashboard (shows all sent emails)
- Accept that debugging is slower vs. building custom UI

### 6.2 Product Risks

**Risk:** Customers unsubscribe at high rates (>20%)
**Likelihood:** Medium (emails might feel spammy)
**Impact:** High (defeats entire purpose of staying in inbox)
**Mitigation:**
- Obsessive focus on email copy quality (Steve's domain)
- No upsell, no marketing, just check-ins
- Monitor unsubscribe rate in Resend dashboard

**Risk:** Zero replies after 100 emails = copy is broken
**Likelihood:** Medium (untested voice/cadence)
**Impact:** High (wasted engineering effort, no retention value)
**Mitigation:**
- One A/B test before launch to validate copy
- If <5% reply rate, rewrite all templates and redeploy
- Steve writes copy, Elon validates with data

**Risk:** Emails land in spam folder
**Likelihood:** Low (plain text, Resend deliverability, no links overload)
**Impact:** High (customers never see emails)
**Mitigation:**
- Use Resend's domain authentication (SPF, DKIM, DMARC)
- Limit to 3 links max per email
- No attachments, no images, no spam trigger words

**Risk:** Feature creep after launch ("can we add a Day 14 email?")
**Likelihood:** High (natural urge to iterate)
**Impact:** Medium (distracts from core metrics, breaks simplicity)
**Mitigation:**
- **Locked decision:** No features for 90 days post-launch
- Steve and Elon both committed to this in Round 2
- Resist all requests until one full lifecycle completes

### 6.3 Business Risks

**Risk:** Aftercare solves retention but doesn't create distribution
**Likelihood:** High (Elon flagged this in Round 1)
**Impact:** Medium (fixes churn, doesn't drive growth)
**Mitigation:**
- Accept that this PRD is retention-only
- Separate effort needed for acquisition (footer badges, showcase, etc.)
- Don't confuse repeat customers with new customers

**Risk:** "Someone Remembers" feeling degrades at scale
**Likelihood:** Medium (Steve's concern in Round 2)
**Impact:** High (brand promise broken, customers unsubscribe)
**Mitigation:**
- Never auto-generate content with AI
- Never customize per-industry (maintain human voice)
- Steve's principle: "I'd rather send fewer emails—beautifully—than scale to spam"

**Risk:** Voice drift over time (future team rewrites emails)
**Likelihood:** High (Steve flagged in Round 2)
**Impact:** High ("Maximize your digital presence" corporate slop)
**Mitigation:**
- **Lock templates in V1, never touch**
- Document voice guidelines in README.md
- Steve's test: "Would I send this to a friend?" becomes quality gate

**Risk:** No one monitors reply inbox, defeating the purpose
**Likelihood:** Medium (open question 5.2)
**Impact:** High (customer replies, gets ignored, trust destroyed)
**Mitigation:**
- **Must resolve before ship:** Assign owner of `aftercare@shipyard.ai`
- Set SLA for reply response (<24 hours)
- If no one can monitor, reconsider reply-focused metric

---

## VII. CONSENSUS ACHIEVEMENTS

**What both sides agreed on without debate:**

1. **Five emails, five triggers.** No sixth email. No customization. Locked forever.
2. **Plain text only.** No HTML. No images. No branded templates.
3. **No upsell in emails.** Day 7 is not "10% off your next project."
4. **Use Resend.** Don't build email infrastructure.
5. **No dashboard.** Use Resend's built-in analytics.
6. **Workers KV, not database.** Stateless, simple, deletable.
7. **Ship in 3 days.** If it takes longer, scope is wrong.
8. **90-day feature freeze.** Let it run untouched.
9. **No site monitoring.** We're not Pingdom.
10. **Measure what matters.** Reply rate > open rate.

**Where they compromised:**

| Issue | Steve's Position | Elon's Position | Compromise |
|-------|------------------|-----------------|------------|
| A/B Testing | Never test (consistency = brand) | Always test (data > opinions) | Test once during dev, lock winner |
| Success Metric | Mental real estate (presence) | Reply rate (measurable) | Track both, optimize for replies |
| Timeline | 3 days if emails are perfect | 3 days by cutting scope | Both — fast ship, flawless copy |
| Distribution | Word-of-mouth from great service | Footer badges, showcase | Retention ≠ acquisition (separate) |

---

## VIII. FINAL MARCHING ORDERS

**Build this in 3 days:**
1. One Cloudflare Worker (`worker.js`)
2. One KV namespace (`AFTERCARE_KV`)
3. Five email templates (`templates/day-*.txt`)
4. Resend integration (API key, domain auth)
5. Unsubscribe handling (KV-based blocking)
6. Reply forwarding (`aftercare@shipyard.ai`)

**Do NOT build:**
- Custom dashboard
- Database schema
- HTML email templates
- Site monitoring
- Content generation system
- A/B testing infrastructure (just run one test manually)

**Before you start:**
- Resolve open questions (5.1–5.5)
- Assign owner of reply inbox
- Define webhook payload from Shipyard backend
- Run single A/B test to validate copy

**After you ship:**
- Monitor Cloudflare Worker logs for 30 days
- Monitor Resend dashboard for bounce/unsub rates
- Track reply rate (target: >5% after 100 emails)
- **Do not add features for 90 days**

**Voice lock (Steve):**
- Trusted mechanic, not marketer
- Short sentences, no jargon
- Test: "Would I send this to a friend?"

**Speed lock (Elon):**
- 72 hours from approval to deployment
- If it breaks, rewrite in a weekend
- Delete > debug

---

**Status:** READY FOR BUILD
**Owner:** Development agent (following this blueprint)
**Approval:** Phil Jackson (Zen Master) + Steve Jobs (copy) + Elon Musk (architecture)

**Ship when:** All open questions resolved + reply inbox assigned + webhook defined

---

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
