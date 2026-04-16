# Shipyard Post-Ship Lifecycle: Locked Decisions
## Blueprint for Build Phase

**Compiled by:** Phil Jackson, Zen Master
**Date:** April 16, 2026
**Status:** Board Approved — PROCEED WITH CONDITIONS

---

## Executive Summary

**Product Name:** Homeport (customer-facing) / Aftercare (codebase)
**Core Insight:** Agencies ghost. We don't. We remember.
**Timeline:** 48-72 hours to MVP
**Success Metric:** ≥10% reply/revision request rate
**Kill Threshold:** <5% conversion after 90 days
**Board Score:** 6/10 — Good hygiene, not theater (requires Phase 2 for moat)

**Triangle Offense:** Steve writes. Elon ships. Data decides.

---

## 1. Key Decisions Matrix

### Decision 1.1: Product Name — "HOMEPORT"
**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** Elon Musk — "call it lifecycle-emails" (Round 2)
**Winner:** **Steve (brand) + Elon (code)**

**Ruling:**
- Customer-facing: **"Homeport"** (marketing, emails, docs)
- Internal/technical: **"aftercare"** (repo name, Worker name, KV namespace)
- Email domain: **`homeport@shipyard.ai`** (from config-decisions.md)

**Why:** Steve's right that naming creates emotional real estate. "Every ship needs a port to return to." One word. Memorable. Evocative.

**Status:** ✅ LOCKED

---

### Decision 1.2: Architecture — Ruthless Simplicity
**Proposed by:** Elon Musk (Round 1, Round 2)
**Winner:** **Elon**

**LOCKED ARCHITECTURE:**
```
Cloudflare Workers + Scheduled Cron
├── KV Store (project data: email, name, URL, ship_date)
├── Resend API (email delivery)
├── 5 email templates (plain text)
└── Unsubscribe mechanism (KV flag update)
```

**Elon's Non-Negotiables (all accepted):**
1. ❌ No screenshots in V1 (no Puppeteer infrastructure)
2. ❌ No performance metrics ("if we can measure" = we can't)
3. ✅ Ship in 48-72 hours, not 2 weeks

**Steve's Constraints (all accepted):**
1. ✅ Emails must be craft-quality, not generic
2. ✅ Voice must feel personal, not automated
3. ✅ All 5 templates built in V1 code

**Technical Constraints:**
- ~300 lines of TypeScript maximum
- Single failure mode: Resend API availability
- Debuggable in <60 seconds
- Fully deletable in 5 minutes if experiment fails

**Status:** ✅ LOCKED

---

### Decision 1.3: Email Cadence — Five Moments
**Proposed by:** Steve Jobs (Round 1)
**Challenged by:** Elon — "Ship Day 7 + 30 only, validate first"
**Winner:** **Steve (with Elon's measurement overlay)**

**LOCKED CADENCE:**
- **Day 7:** Honeymoon — pride and accomplishment ("Your site is breathing on its own")
- **Day 30:** Fresh memory — substantive check-in (not "how are things?")
- **Day 90:** Where agencies vanish — we stay ("Most agencies disappear around now")
- **Day 180:** Update timing — 6-month revision sweet spot
- **Day 365:** Anniversary — celebration + Year 2 preview

**Elon's Round 2 Concession:**
"I said ship Day 7 and Day 30 only, measure, then decide. But Steve's rhythm (7, 30, 90, 180, 365) is actually perfect. I was wrong to suggest validating with two—ship all five, but keep them SIMPLE."

**Deployment:** All 5 templates ship immediately. Measure for 90 days.

**Status:** ✅ LOCKED

---

### Decision 1.4: Email Format — Plain Text Only
**Proposed by:** Consensus
**Challenged by:** None
**Winner:** **Unanimous**

**LOCKED FORMAT:**
- Plain text only (no HTML)
- No images, no branded headers
- No screenshots (Elon's non-negotiable from Round 2)
- "Automation that feels handwritten" (Steve)

**Why:** Deliverability > aesthetics. Human voice > corporate templates.

**Status:** ✅ LOCKED

---

### Decision 1.5: Brand Voice — "Trusted Mechanic"
**Proposed by:** Steve Jobs (Round 1)
**Winner:** **Steve (Elon accepted unconditionally)**

**LOCKED VOICE:**
- ❌ Corporate: "Your deployment experience met expectations"
- ❌ Fake casual: "Hey there! Just checking in lol 😊"
- ✅ Shipyard: "It's been 30 days. Your site is holding up beautifully."

**Tone:** Trusted mechanic checking in. Confident, competent, human. We know what we built. We stand behind it.

**Elon's Round 2 Concession:**
"The tone is everything. Steve's right that corporate email voice kills this. Make them human. Make them caring. Make them sound like we give a shit. I'll ship them word-for-word."

**Voice Test:** "Would I send this to a friend?" If not, rewrite.

**Status:** ✅ LOCKED

---

### Decision 1.6: Success Metrics — Data Decides
**Proposed by:** Elon Musk (Round 1)
**Challenged by:** Steve — "We're building presence, not measuring engagement"
**Winner:** **Elon (with Steve's qualitative overlay)**

**LOCKED METRICS:**

**Primary (Elon):**
- Reply rate to lifecycle emails
- Revision request conversion rate
- Target: **≥10% conversion** (more aggressive than original 5%)

**Secondary (Resend analytics):**
- Email open rate (target: 40-60% per Shonda)
- Unsubscribe rate (kill switch at >15%)

**Qualitative (Steve):**
- Mental real estate — customer remembers us 6 months later
- "Did this email make them feel something?"

**Decision Framework:**
- **<5%** → Kill Homeport, focus on acquisition
- **5-15%** → Iterate, refine templates
- **>15%** → Fund V2 (screenshots, telemetry, Phase 2)

**Measurement Period:** 90 days minimum

**Status:** ✅ LOCKED

---

### Decision 1.7: Dashboard — Use Resend's, Build Nothing
**Proposed by:** Elon Musk
**Winner:** **Elon**

**LOCKED DECISION:**
- ❌ No custom dashboard for email analytics
- ✅ Use Resend's built-in analytics (open rate, click rate, bounce rate)

**Elon's Argument:** "Don't build what you can buy for $0. Dashboards are where good products go to die."

**Steve's Round 2 Concession:** "Elon's 'just use Resend's dashboard' is pragmatic—I'll give him that."

**Status:** ✅ LOCKED

---

### Decision 1.8: Timeline — 48-72 Hours to Ship
**Proposed by:** Elon Musk
**Winner:** **Elon**

**LOCKED TIMELINE:**
- **Target:** 48 hours from commit to production
- **Deadline:** 72 hours (buffer for quality)

**Elon's Constraint:** "This is 300 lines of TypeScript. If it takes longer than 48 hours, the spec is wrong."

**Steve's Round 2 Concession:** "If we build what actually matters—5 emails, scheduling, unsubscribe—it's 3 days."

**Status:** ✅ LOCKED

---

### Decision 1.9: Feature Freeze — 90 Days Untouched
**Proposed by:** Elon Musk (Round 2), essence.md
**Winner:** **Unanimous**

**LOCKED FREEZE:**
- No feature adds for 90 days post-launch
- "Test once. Ship. Never touch for 90 days." (essence.md)
- Let one full lifecycle complete (365 days) before major changes

**The Only Exception:** Spam/technical breaks — fix immediately. Otherwise, hands off.

**Status:** ✅ LOCKED

---

### Decision 1.10: Distribution Strategy — NO Footer Links
**Proposed by:** Elon — "Built with Shipyard footer badges"
**Challenged by:** Steve — "That's tacky"
**Winner:** **Steve**

**LOCKED DECISION:**
- ❌ NO "Built with Shipyard" footer links (rejected)
- ✅ Distribution via customer pride → testimonials, referrals, social proof
- ✅ Homeport itself is proof of care → differentiator in sales process

**Steve's Position (Round 2):**
"Customers either (a) remove the footer link immediately because it looks cheap, or (b) leave it and nobody clicks it. Real distribution comes from customers *talking* about Shipyard. One customer who brags about us is worth 100 footer links."

**Status:** ✅ LOCKED

---

## 2. MVP Feature Set (What Ships in V1)

### What Ships ✅
1. **Five email templates** (plain text, Steve writes, Elon ships word-for-word)
2. **Cloudflare Worker with scheduled cron** (daily check, sends emails at Day 7/30/90/180/365)
3. **KV Store** (project data: `{email, name, project_url, ship_date, unsubscribed}`)
4. **Resend API integration** (email delivery, analytics)
5. **Unsubscribe mechanism** (one-click, KV flag update)
6. **Reply forwarding** (to `homeport@shipyard.ai`)

### What Does NOT Ship ❌
- Screenshot generation (Puppeteer/headless Chrome)
- Performance monitoring (uptime, page speed)
- Analytics dashboard (use Resend's)
- Database/complex schema (KV only)
- Automated project data capture (manual CSV for V1)
- "Industry trends" content
- Special offers/discounts
- "Built with Shipyard" footer badges
- HTML email templates
- Multi-channel (email only)
- Site monitoring / health checks
- Case studies
- Per-industry customization
- AI-generated content

---

## 3. File Structure (What Gets Built)

```
/homeport  (or /aftercare in codebase)
├── /worker
│   ├── index.ts                 # Main Worker entry point
│   ├── scheduler.ts             # Cron job logic
│   ├── emails.ts                # Email template definitions
│   │   ├── day7()              # "Your site is breathing on its own"
│   │   ├── day30()             # "It's been 30 days"
│   │   ├── day90()             # "Ready for an update?"
│   │   ├── day180()            # "Six months in"
│   │   └── day365()            # "It's been a year"
│   ├── resend.ts                # Resend API client
│   ├── kv.ts                    # KV store operations
│   └── unsubscribe.ts           # Unsubscribe link handler
├── /templates
│   ├── day-007.txt              # Plain text template (Steve writes)
│   ├── day-030.txt
│   ├── day-090.txt
│   ├── day-180.txt
│   └── day-365.txt
├── /scripts
│   └── csv-to-kv.ts             # Manual project upload script
├── /tests
│   ├── emails.test.ts           # Email template rendering tests
│   └── scheduler.test.ts        # Cron logic tests
├── wrangler.toml                # Cloudflare Worker config
├── package.json
├── tsconfig.json
└── README.md                     # Voice guidelines, deployment
```

**Data in Workers KV:**
- Key: `project:{project_id}` → Value: `{email, name, project_url, ship_date}`
- Key: `unsubscribed:{email}` → Value: `true` (if opted out)

**Total estimated LOC:** ~300 TypeScript (Elon's cap)

---

## 4. Board Review Findings

### Board Score: 6/10 (Proceed with Conditions)
- **Oprah:** 7/10 — Heart is there, friction too high
- **Jensen:** 4/10 — CRM not AI, needs Phase 2 moat
- **Shonda:** 6/10 — Good hygiene, not theater
- **Buffett:** 7/10 — Excellent unit economics, weak moat

### Points of Agreement (All Board Members)
1. ✅ **Email quality is excellent** — Human voice, authentic tone (unanimous praise)
2. ✅ **Unit economics outstanding** — 99.99% gross margin, minimal infrastructure risk
3. ⚠️ **Current moat is weak** — Copyable in 48 hours by competitors
4. 🔴 **Phase 2 telemetry is CRITICAL** — Data moat is the durable advantage

### Points of Tension

**1. AI Leverage (Jensen harsh, others forgiving)**
- **Jensen:** "No AI. This is email automation. Could run on cron + SendGrid in 2010." (4/10)
- **Others:** Evaluated as retention system, not AI product

**2. Onboarding Complexity (Oprah critical)**
- **Oprah:** "700 lines DNS records... excludes solo founders, non-technical users" (4/10 accessibility)
- **Fix needed:** Simplified onboarding, video walkthrough

**3. Content Strategy (Shonda urgent)**
- **Shonda:** "No content between emails... Day 30 is dead air" (4/10 content)
- **Recommendation:** Add blog, serialized insights, peer comparison

**4. Launch Readiness**
- **Oprah:** "Prove it works before scale" (10-15 projects first)
- **Buffett:** "Ship it — minimal risk, $40 investment"
- **Jensen:** "Ship Phase 1, commit to Phase 2 immediately"

---

## 5. Mandatory Conditions (Before Full Scale)

### Tier 1: REQUIRED ⚠️

**1. Prove the System Works (Oprah)**
- Send first batch to 10-15 shipped projects
- Collect reply data for 30 days
- Measure: open rates, reply rates, conversion intent

**2. Commit to Phase 2 Telemetry Roadmap (Jensen, Buffett)**
- Lock timeline: Phase 2 ships within 6 months of Phase 1 launch
- Instrument agents with time/token tracking
- Define data schema for build intelligence
- **Why:** "Without data compounding, this is a feature, not a moat" (Jensen)

**3. Simplify Onboarding Path (Oprah)**
- Create 5-step quick-start guide (not 50)
- Video walkthrough for DNS setup
- Pre-validated domain configuration checklist

### Tier 2: RECOMMENDED (V1.1, Next 90 Days)

**4. Add Content Between Emails (Shonda)**
- Launch Homeport blog or case study hub
- Reference learnings from shipped projects in emails
- Create serialized insight arc (see Shonda retention roadmap)

**5. Improve Day 30 Email (Shonda, Maya Angelou)**
- Current subject weak: "It's been 30 days. How are things?"
- Maya's rewrite: "Does it feel like yours yet?"
- Add tension: security check, performance insight, or competitor analysis

**6. Track LTV by Cohort (Buffett)**
- Measure which project types generate most repeat revenue
- Identify high-value customer segments
- Test pricing elasticity on returning customers

**7. Build Feedback Loop (Jensen)**
- Extract themes from Phil's reply inbox
- Feed insights into future customer recommendations
- Start data flywheel: shipped projects → learnings → better builds

---

## 6. Open Questions (Resolve Before Build)

### 6.1 Project Data Source 🔴 CRITICAL
**Question:** Where does project data come from for manual CSV upload?
**Blocker:** Can't launch without data
**Owner:** Phil Jackson

**Required CSV fields:**
```csv
project_id,customer_email,customer_name,project_url,ship_date
proj_001,customer@example.com,Jane Doe,https://example.com,2024-01-15
```

**Steve's Warning:** "If we're shipping projects without capturing this data, we're not a real agency."

**Decision needed by:** Day 0 (before build starts)

---

### 6.2 Email "From" Address 🟡 MEDIUM
**Question:** What email address do Homeport emails come from?
**Owner:** Steve (brand) + Elon (deliverability)

**Locked Decision (from config-decisions.md):**
- **From:** `homeport@shipyard.ai`
- **Reply-To:** `homeport@shipyard.ai`
- Requires domain authentication (SPF/DKIM/DMARC)

**Brand Inconsistency Found (Jony Ive Review):**
- Templates reference `aftercare.shipyard.ai` (lines 19 in day-007, 19 in day-030, 23 in day-090)
- Config says `homeport@shipyard.ai`
- **FIX:** Change all template URLs to `homeport.shipyard.ai`

**Decision needed by:** Day 1 (before Resend integration)

---

### 6.3 Reply Handling 🟡 MEDIUM
**Question:** What happens when a customer replies?
**Owner:** Phil Jackson

**Options:**
1. Goes to `homeport@shipyard.ai` → Phil handles personally
2. Shared inbox → team response
3. Auto-reply (defeats the purpose)

**Board Emphasis:**
- **Shonda:** "Phil responds personally — major retention signal"
- **Oprah:** "Reply-to goes to real person (Phil), not support@"

**V1 Decision:** Phil monitors personally, <24h SLA (from board-verdict.md)

**V1.1 Requirement:** If reply rate >10%, need workflow for response management

**Decision needed by:** Day 2 (before first email send)

---

### 6.4 Unsubscribe Flow 🟡 MEDIUM (Legal Requirement)
**Question:** What happens when a customer unsubscribes?
**Blocker:** CAN-SPAM compliance required

**Locked Decision (from config-decisions.md):**
- One-click unsubscribe link → KV flag update → confirmation page
- URL format: `homeport.shipyard.ai/unsub?token={email}`

**Legal Requirement:** Clear opt-out mechanism

**Decision needed by:** Day 1 (before first email template finalized)

---

## 7. Risk Register (What Could Go Wrong)

### 7.1 Technical Risks

**Risk: Customers Hate It (Unsubscribe >20%)**
- **Likelihood:** 🟡 Medium
- **Impact:** 🔴 High (kills feature)
- **Mitigation:** Steve writes templates, test with internal team, kill switch at >15% unsub rate
- **Owner:** Steve (quality) + Phil (monitoring)

**Risk: No Project Data Exists (Can't Launch)**
- **Likelihood:** 🔴 High
- **Impact:** 🔴 High (blocks MVP)
- **Mitigation:** Audit existing records immediately, manual backfill if needed, minimum 10 shipped projects
- **Owner:** Phil Jackson
- **Steve's Warning:** "If we have <10 shipped projects with clean data, postpone Homeport and fix the shipment pipeline first."

**Risk: Email Deliverability Issues (Land in Spam)**
- **Likelihood:** 🟡 Medium
- **Impact:** 🔴 High (emails never seen)
- **Mitigation:** SPF/DKIM/DMARC setup, test with Mail-Tester, plain text (better deliverability), warm up domain
- **Owner:** Elon (setup) + Steve (content review for spam triggers)

**Risk: Workers KV Eventual Consistency → Duplicate Emails**
- **Likelihood:** 🟡 Medium
- **Impact:** 🟡 Medium (customer gets same email twice)
- **Mitigation:** Use unique `scheduleId`, check KV before creating, accept rare duplicates
- **Owner:** Elon

---

### 7.2 Product Risks

**Risk: Conversion Rate Too Low (<5%)**
- **Likelihood:** 🟡 Medium
- **Impact:** 🟡 Medium (feature killed, but learning gained)
- **Mitigation:** Accept as valid outcome (fast failure), ensure email quality is high
- **Steve's Constraint:** "If we ship mediocre emails to 'validate the concept,' we'll validate nothing."
- **Owner:** Phil (decision to kill) + Steve (ensure quality)

**Risk: Manual CSV Upload Becomes Bottleneck**
- **Likelihood:** 🔴 High
- **Impact:** 🟡 Medium (operational pain, doesn't scale)
- **Mitigation:** Accept manual process for 90 days, V1.1 priority = automated capture if >10% conversion
- **Elon's Threshold:** "At 10,000 shipped projects/year = 27 projects/day. Manual CSV = you're dead."
- **Owner:** Elon (build automation when threshold hit)

**Risk: Voice Drift Over Time**
- **Likelihood:** 🔴 High (if team expands)
- **Impact:** 🔴 High ("Maximize your digital presence" corporate slop)
- **Mitigation:** Lock templates in V1, never touch (Decision 1.9), document voice guidelines in README
- **Owner:** Steve (enforce) + Phil (veto power on changes)

**Risk: Reply Inbox Not Monitored**
- **Likelihood:** 🟡 Medium
- **Impact:** 🔴 High (customer replies, gets ignored, brand promise broken)
- **Mitigation:** Assign owner before ship, set <24h SLA
- **Owner:** Phil Jackson

---

### 7.3 Business Risks

**Risk: Homeport Solves Retention, Not Acquisition**
- **Likelihood:** 🔴 High (Elon flagged Round 1)
- **Impact:** 🟡 Medium (fixes churn, doesn't drive growth)
- **Elon's Challenge:** "This is a retention play when you don't have acquisition solved."
- **Steve's Counter:** "Homeport helps acquisition—it's proof we care. That's a differentiator."
- **Compromise:** Retention-focused, but becomes sales asset (proof of care)

**Risk: 48-Hour Timeline Unrealistic**
- **Likelihood:** 🟡 Medium
- **Impact:** 🟢 Low (delayed launch, recoverable)
- **Mitigation:** Elon's 300-line cap enforced, 72h buffer allowed if quality maintained, Phil has veto on scope creep
- **Owner:** Elon (timeline) + Phil (scope enforcement)

---

## 8. Phase 2 Imperative (The Moat)

### Why Phase 2 Is Non-Negotiable

**Jensen's Warning (4/10 score):**
"Lifecycle emails create retention hooks but miss compounding data moat entirely. Traditional agencies can copy this in 48 hours. **Zero proprietary data accumulation.** Without data compounding, this is a feature, not a moat."

**Buffett's Assessment (7/10 score):**
"Moat strength: Year 1 = Weak (anyone can clone templates). Year 2+ = Moderate **IF** Phase 2 telemetry ships. Long-term = Strong if customer LTV data + project patterns create recommendation engine."

**Board Consensus:**
All four board members emphasized Phase 2 telemetry as critical:
- Jensen: "Commit to Phase 2 NOW"
- Buffett: "Ship Phase 2 telemetry within 6 months"
- Shonda: "Phase 2 exists in PRD but not in MVP story"
- Oprah: (Implicitly through need for proof/evidence)

### What Phase 2 Unlocks (6-Month Roadmap)

**1. Project Telemetry Infrastructure**
- Instrument every agent with time/token tracking
- Capture revision reasons (structured data)
- Log customer feedback from email replies
- Store performance metrics if site monitoring added

**2. Build Intelligence Layer**
- Analyze patterns across projects
- Surface insights: "Astro sites ship 30% faster than Next.js"
- Feed recommendations into customer-facing agent prompts

**3. Customer-Facing Data Products**
- Peer comparison: "Your site is in top 15% for uptime"
- Performance benchmarks: "Industry average: 3.2s, yours: 1.8s"
- Personalized insights in Day 90+ emails

**4. The Data Flywheel**
Every project Shipyard ships teaches the system:
- Which stacks ship fastest
- Which patterns reduce revisions
- Which features drive repeat business
- Which customer requests correlate with success

**This becomes competitive moat:**
1. Shipyard builds 100 projects
2. Learns operational patterns traditional agencies can't see
3. Recommends better stacks, timelines, features for project 101
4. Ships faster/better than competition
5. Wins more projects → learns more → compounds advantage

**Phase 2 Timeline:** Lock commitment within 6 months of Phase 1 launch (board-verdict.md)

---

## 9. Design Review Findings (Jony Ive + Maya Angelou)

### Email Templates: WORLD-CLASS ✅
**Jony Ive:** "Flawless. Every word earns its place."
- Day 7: "Seven days. Your site shipped seven days ago" — rhythm, confidence
- Line 9: "That's pride-worthy. Seriously." — human, not corporate

**Maya Angelou:** "Voice feels like someone who built this with their hands."
- Day 7: YES — "Your site is breathing on its own now" (visceral)
- Day 90: ALMOST — "We're still here (most agencies aren't)" (good contrast, slight smug edge)

### Weaknesses Found

**Jony Ive — Documentation Bloat:**
- resend-setup-guide.md: 706 lines, too many words
- Cut 40% — say it once, not three times
- Show one DNS provider example (Cloudflare), cut GoDaddy/Route53 identical patterns

**Maya Angelou — Weakest Lines:**
1. **Day 30 subject:** ~~"It's been 30 days. How are things?"~~ → "Does it feel like yours yet?"
2. **Day 180:** ~~"That's gold."~~ → "That's what changes everything."
3. **Day 365:** ~~"The entire industry took steps you might not have noticed."~~ (condescending) → "A year moves faster than you think."

**Brand Inconsistency (Jony Ive):**
- Templates show `aftercare.shipyard.ai` in unsubscribe URLs
- Config says `homeport@shipyard.ai`
- **FIX REQUIRED:** Change all template URLs to `homeport.shipyard.ai`

---

## 10. Retrospective Learnings (Marcus Aurelius)

### What Worked Well ✅
- **Email craft:** World-class. Day 7/90 templates authentic, human, trust-building
- **Strategic clarity:** Problem/solution/unit economics clean
- **Multi-lens review:** Four board members caught what one would miss
- **Voice consistency:** "Trusted mechanic" tone held across all deliverables

### What Didn't Work ❌
- **Documentation bloat:** 706-line setup guide before showing emails
- **No implementation:** Built planning documents, not actual system
- **Phase 2 deferred:** Data moat pushed to future (weak moat compounds slowly)
- **Onboarding friction:** Non-technical users excluded
- **No content between emails:** 5 emails/365 days = radio silence

### Process Failure Identified 🔴

**Marcus Aurelius:**
"Agency built comprehensive planning layer (reviews, roadmaps, verdicts) on top of **unbuilt product**. Should have shipped small batch, gathered data, then convened board to review **results**, not **intentions**."

**Evidence:**
- 9 markdown files totaling ~30K words
- Zero customer emails sent
- Zero reply data collected
- Zero conversion events measured

**Corrective Action:**
"Next project: No board review until product ships to ≥10 users and collects ≥30 days of data. Review outcomes, not proposals."

**Key Learning:**
"World-class craft without distribution infrastructure is like building a cathedral in a forest — beautiful, unvisited, unable to prove its value until someone walks through the door."

---

## 11. The Deal (Steve ↔ Elon Agreement)

### Steve's Commitments ✅
1. Write all 5 email templates with craft quality
2. No dashboards, no screenshots, no metrics in V1 (accepted Elon's cuts)
3. Accept plain text emails (no HTML, no images)
4. Accept 48-72h timeline if email quality non-negotiable
5. Trust Elon's architecture (Workers + KV + Resend)
6. Accept templates use merge tags, not human review per send

### Elon's Commitments ✅
1. Ship Steve's email templates word-for-word (no edits for brevity)
2. Accept 5-email cadence (all deployed immediately, not phased)
3. Build all 5 templates in V1 code
4. Accept "Homeport" as customer-facing name
5. Give Steve veto power on any "optimization" that compromises voice
6. Accept that tone matters as much as speed

### The Deal (Elon's Round 2 Offer, Steve Accepted)
**Elon:** "I'll give Steve the tone, the cadence, and the positioning. He gives me the architecture, the timeline, and veto power on any feature that requires >1 day of eng work."

**Steve:** "Make them human. Make them caring. Make them sound like we give a shit. I'll ship them word-for-word."

**Status:** ✅ LOCKED

---

## 12. Success Criteria (What "Done" Looks Like)

### Launch Readiness Checklist

**Day 0 (Pre-Build):**
- [ ] **Project data audit complete** (Phil) — 10+ shipped projects with clean data?
- [ ] **CSV structure defined** (Phil) — Fields: project_id, email, name, project_url, ship_date
- [ ] **"From" email confirmed:** `homeport@shipyard.ai` (locked from config)
- [ ] **Unsubscribe flow designed** (Elon) — One-click KV flag
- [ ] **Reply inbox assigned** (Phil) — Who monitors? <24h SLA

**Day 1 (Build):**
- [ ] **Cloudflare Worker scaffolded** (Elon)
- [ ] **Resend account + domain auth** (Elon) — SPF/DKIM/DMARC
- [ ] **Day 7 email draft finalized** (Steve → Elon → Phil approval)
- [ ] **Day 30 email draft finalized** (apply Maya's feedback)
- [ ] **Day 90/180/365 drafts written** (Steve)
- [ ] **Worker core built** (Elon) — scheduler, KV, Resend integration
- [ ] **CSV-to-KV upload script** (Elon)
- [ ] **Tests written** (Elon)

**Day 2 (Ship):**
- [ ] **Worker deployed to production** (Elon)
- [ ] **KV store populated** (Phil uploads CSV)
- [ ] **Test emails sent to internal team** (Elon)
- [ ] **Cron jobs active** (Day 7/30/90/180/365)
- [ ] **Unsubscribe mechanism functional** (CAN-SPAM compliant)
- [ ] **Brand inconsistency fixed:** All URLs → `homeport.shipyard.ai`
- [ ] **Voice review complete** (Steve) — Final "automation smell" check
- [ ] **Go-live approval** (Phil)

### 90-Day Measurement Plan

**Metrics to Track:**
- Total emails sent (breakdown by Day 7/30/90/180/365)
- Open rate (% who open) — via Resend
- Reply rate (% who respond) — **primary metric**
- Revision request rate (% who book follow-up work) — **primary metric**
- Unsubscribe rate (% who opt out) — **kill switch if >15%**

**Kill Switch Triggers:**
- Unsubscribe rate >15% in first week → pause sends, review copy
- Reply rate <1% after 50 emails → consider copy rewrite
- Emails landing in spam (>10% bounce rate) → fix deliverability immediately

**Decision Meeting:** Day 91
**Attendees:** Steve Jobs, Elon Musk, Phil Jackson

**Outcome:**
- **<5%** → Kill Homeport, focus on acquisition
- **5-15%** → Iterate, refine templates, measure another 90 days
- **>15%** → Fund V2 (screenshots, telemetry, Phase 2)

---

## 13. Voice Lock (Steve's Final Word)

**Email Copy Test:** "Would I send this to a friend?" If not, rewrite.

**Voice Rules:**
- Short sentences. No jargon.
- No "solutions," "leverage," "ecosystem," "digital presence."
- Sounds like one person, not a CRM.
- No upsell. No "10% off next project."
- Honest, not cutesy.
- Confident, competent, human.

**Examples:**

❌ **Corporate:** "We hope your deployment experience met expectations and that your digital presence is performing optimally."

❌ **Fake Casual:** "Hey there! Just checking in to see how things are going with your awesome new site! 😊"

✅ **Shipyard:** "It's been 30 days. Your site is holding up beautifully. Page speed is solid. Uptime is 100%. You should be proud."

**Locked Forever:** Templates written in V1 never change unless data proves they're broken (<5% reply rate).

---

## 14. Speed Lock (Elon's Final Word)

**Technical Constraints:**
- 300 lines of TypeScript maximum (hard cap)
- 48 hours from commit to production (72-hour deadline)
- Single failure mode: Resend API down
- Zero infrastructure maintenance beyond Worker + KV
- Debuggable in <60 seconds
- Fully deletable in 5 minutes if experiment fails

**If it takes longer than 72 hours, the spec is wrong.**

**Delete > debug:** If something breaks, rewrite in a weekend rather than debug for a week.

---

## 15. Triangle Offense (Phil's Final Word)

**Roles:**
- **Steve:** Voice guardian. Writes all copy. Veto power on tone changes.
- **Elon:** Speed enforcer. Builds infrastructure. Veto power on scope creep.
- **Phil:** Tie-breaker. Data owner. Kill switch authority.

**When Steve and Elon Disagree:**
1. Check this document (locked decisions = source of truth)
2. If not covered, Phil decides
3. If Phil can't decide, run 48-hour experiment and measure

**The Deal Holds:**
- Steve writes, Elon ships word-for-word
- Elon cuts scope, Steve accepts if quality maintained
- Data decides the next move (not aesthetics, not intuition)

---

## 16. Next Actions (Immediate)

### Day 0 (Pre-Build) — DUE BEFORE BUILD STARTS

**Phil Jackson:**
- [ ] Audit shipped project records (do we have the data?)
- [ ] Prepare CSV with ≥10 shipped projects (email, name, URL, ship_date)
- [ ] Confirm "From" address: `homeport@shipyard.ai`
- [ ] Assign reply inbox owner (Phil monitors personally, <24h SLA)
- [ ] Approve unsubscribe flow design
- [ ] Resolve trigger mechanism (webhook or manual CSV)

**Steve Jobs:**
- [ ] Draft Day 7 email template (apply Jony/Maya feedback)
- [ ] Draft Day 30 email template (use Maya's subject line)
- [ ] Draft Day 90/180/365 templates (for code commit)
- [ ] Fix Day 180 "That's gold" → "That's what changes everything"
- [ ] Fix Day 365 condescending line

**Elon Musk:**
- [ ] Set up Resend account (if not done)
- [ ] Configure domain authentication (SPF/DKIM/DMARC for homeport@shipyard.ai)
- [ ] Scaffold Cloudflare Worker project structure

---

### Day 1 (Build) — 24 HOURS FROM START

**Elon Musk:**
- [ ] Build Worker core (scheduler, KV operations, Resend integration)
- [ ] Implement email template functions (using Steve's drafts)
- [ ] Build CSV-to-KV upload script
- [ ] Write tests (email rendering, cron logic)
- [ ] Deploy to staging for internal testing

**Steve Jobs:**
- [ ] Finalize Day 7/30 templates based on Elon's feedback
- [ ] Review Elon's implementation for "automation smell"
- [ ] Approve or request rewrites

**Phil Jackson:**
- [ ] Review build progress (scope adherence)
- [ ] Test email deliverability (Mail-Tester, spam check)
- [ ] Prepare test project data for staging

---

### Day 2 (Ship) — 48 HOURS FROM START

**Elon Musk:**
- [ ] Deploy Worker to Cloudflare production
- [ ] Upload project CSV to KV store (Phil provides)
- [ ] Activate Day 7/30/90/180/365 cron jobs
- [ ] Send test emails to internal team
- [ ] Confirm Resend dashboard shows sent emails
- [ ] **FIX:** Change all template unsubscribe URLs from `aftercare.shipyard.ai` → `homeport.shipyard.ai`

**Steve Jobs:**
- [ ] Final review of live email sends (tone, formatting)
- [ ] Approve go-live

**Phil Jackson:**
- [ ] Approve go-live
- [ ] Monitor first 10 email sends
- [ ] Set up 90-day measurement tracking (Resend dashboard access)
- [ ] Document launch in internal log

---

### Day 3-90 (Measurement Period) — HANDS OFF

**All:**
- [ ] **Do NOT touch the code** (90-day feature freeze)
- [ ] Monitor Resend dashboard weekly (open, unsub, reply rates)
- [ ] Respond to customer replies within <24h SLA (Phil)
- [ ] Log technical issues (Worker failures, deliverability problems)
- [ ] Collect qualitative feedback (what do customers say?)

---

### Day 91 (Decision Meeting)

**Attendees:** Steve Jobs, Elon Musk, Phil Jackson

**Agenda:**
1. Review metrics (reply rate, revision requests, unsub rate)
2. Qualitative review (what did customers say?)
3. Decide: Kill (<5%), Iterate (5-15%), or Scale (>15%)
4. **If >10%:** Lock Phase 2 commitment (telemetry within 6 months)

---

## 17. Final Locked Position

**Product:** Homeport (customer-facing) / Aftercare (codebase)
**Positioning:** "We're the agency that doesn't ghost you."
**MVP Scope:** 5 lifecycle emails (Day 7/30/90/180/365), Cloudflare Workers, Resend API, manual project upload
**Timeline:** 48-72 hours to production
**Success Metric:** ≥10% reply/revision request rate
**Kill Threshold:** <5% conversion after 90 days
**Scale Threshold:** >15% conversion unlocks V2
**Phase 2 Commitment:** Telemetry within 6 months if successful

**Steve writes. Elon ships. Phil decides. Data judges.**

---

## 18. Board Verdict Summary

**Status:** ✅ PROCEED WITH CONDITIONS

**Aggregate Score:** 6/10
- Good retention hygiene, not retention theater
- Excellent unit economics (99.99% margin)
- Weak moat Year 1 (copyable in 48h)
- Phase 2 non-negotiable for durable advantage

**Mandatory Before Full Scale:**
1. Prove system works (10-15 project batch, 30 days)
2. Lock Phase 2 telemetry roadmap (within 6 months)
3. Simplify onboarding (accessibility for non-technical users)

**Success Metrics for Next Review (90 days post-launch):**
- ≥10% reply rate on lifecycle emails
- ≥5% conversion rate on revision/update CTAs
- <5% unsubscribe rate
- Phase 2 data infrastructure design complete

**Next Board Review:** 90 days post-launch (or when Phase 2 ships)

---

**Reminder from essence.md:**

> **The lock:** Test once. Ship. Never touch for 90 days.
>
> **The deal:** Speed without soul = noise. Soul without speed = vaporware. Ship both in 3 days.
>
> **What dies without:** Emails that feel handwritten.
>
> **What kills it:** Automation smell. Screenshot scope creep.

---

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson
*"Make them binge. Make them care. Make them come back."* — Shonda Rhimes
*"This is CRM, not AI leverage. Commit to Phase 2 NOW."* — Jensen Huang
*"Heart is there, friction too high. Show proof."* — Oprah Winfrey
*"Excellent unit economics. Needs Phase 2 to reach 9/10."* — Warren Buffett

**END OF BLUEPRINT — READY FOR BUILD**
