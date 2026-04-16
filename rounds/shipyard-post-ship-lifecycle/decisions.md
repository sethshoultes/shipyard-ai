# Shipyard Post-Ship Lifecycle: Locked Decisions
## Blueprint for Build Phase

**Compiled by:** Phil Jackson, Zen Master
**Date:** Build Phase Ready
**Status:** Decisions Locked

---

## Executive Summary

**Product Name:** Homeport (Steve) / Aftercare (existing) — **UNRESOLVED**
**Core Insight:** Every agency ghosts their clients post-launch. We stay. We remember.
**Delivery Timeline:** 48 hours to MVP (Elon) vs. 3 days (existing blueprint)
**Success Metric:** 10%+ reply/revision request rate (Elon) vs. 5%+ (existing)

**Triangle Offense:** Steve writes. Elon ships. Data decides.

---

## 1. Locked Decisions Matrix

### Decision 1.1: Product Name
**Proposed by:** Steve Jobs — "Homeport" (Round 1)
**Challenged by:** Elon Musk — "call it `lifecycle-emails` in repo" (Round 2)
**Existing decision:** "Aftercare" (locked in current blueprint)
**Winner:** **CONTESTED**

**The debate:**
- **Steve's case:** "Every ship needs a port to return to. One word. Memorable. Evocative." (R1)
- **Elon's case:** "You're naming a feature before proving it works. Call it lifecycle-emails. If it works, users will name it." (R2)
- **Existing blueprint:** "Aftercare" already locked, Steve proposed it in Round 1

**Phil's ruling:** **HOMEPORT wins on brand positioning, AFTERCARE stays in codebase.**
- Customer-facing: "Homeport" (marketing, emails, docs)
- Internal/technical: "aftercare" (repo name, Worker name, KV namespace)
- **Why:** Steve's right that naming creates emotional real estate. Elon's right we shouldn't delay shipping for a rebrand. Use both.

---

### Decision 1.2: Architecture — The 10% Version
**Proposed by:** Elon Musk (Round 1, Round 2)
**Challenged by:** Original PRD (database schema, lifecycle tracking)
**Winner:** **Elon — ruthless simplicity**

**LOCKED ARCHITECTURE:**
```
Cloudflare Workers + Scheduled Cron
├── KV Store (project data: email, name, URL, ship_date)
├── Resend API (email delivery)
├── 5 email templates (hardcoded in Worker code)
└── Unsubscribe mechanism (KV flag update)
```

**Elon's non-negotiables (all accepted):**
1. No screenshots in V1 (no Puppeteer infrastructure)
2. No performance metrics ("if we can measure" = we can't)
3. Launch in 48 hours, not 2 weeks

**Steve's constraints (all accepted by Elon):**
1. Emails must be craft-quality, not generic
2. Voice must feel personal, not automated
3. All 5 templates built in V1 code (even if only 2 deploy initially)

**What's EXCLUDED:**
- ❌ Screenshot generation (Puppeteer/Chrome)
- ❌ Performance metrics (uptime, page speed)
- ❌ Analytics dashboard (use Resend's built-in)
- ❌ Database/complex schema
- ❌ "Industry trends" content pipeline
- ❌ Automated project capture (manual CSV → KV for V1)

**Technical constraints:**
- ~300 lines of TypeScript maximum
- Single failure mode: Resend API availability
- Debuggable in <60 seconds
- Fully deletable in 5 minutes if experiment fails

**Existing blueprint alignment:** ✅ Matches ("One Cloudflare Worker + One KV namespace + Five templates")

---

### Decision 1.3: Email Cadence — Five Moments, One Year
**Proposed by:** Consensus (essence.md, Steve Round 1)
**Challenged by:** Elon Round 1 — "Ship Day 7 + Day 30 only, validate before adding more"
**Counter-challenged by:** Steve Round 2 — "Five emails or nothing. This is a relationship, not a feature."
**Winner:** **Steve (with Elon's phased deployment)**

**LOCKED CADENCE:**
- Day 7: Honeymoon — pride and accomplishment
- Day 30: Fresh memory — check-in with substance
- Day 90: Where agencies vanish — we stay
- Day 180: Update timing — 6 months is revision sweet spot
- Day 365: Anniversary — "Look how far you've come"

**The compromise (Elon's Round 2 concession):**
- "I said ship Day 7 and Day 30 only, measure, then decide. But Steve's rhythm (7, 30, 90, 180, 365) is actually perfect. I was wrong to suggest validating with two—ship all five, but keep them SIMPLE."

**Deployment strategy:**
- Build all 5 templates in V1 code
- **Deploy ALL FIVE immediately** (Steve won this)
- Measure for 90 days
- If <5% conversion, kill feature
- If >15% conversion, fund V2 (screenshots, telemetry)

**What's cut:** Day 14, Day 60, Day 120, monthly check-ins. Respect the inbox.

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.4: Email Format — Plain Text, Zero HTML
**Proposed by:** Consensus (essence.md, Steve Round 1, Elon Round 1)
**Challenged by:** None
**Winner:** **Unanimous**

**LOCKED FORMAT:**
- Plain text only
- No HTML templates
- No images, no branded headers
- No screenshots (Elon's non-negotiable)
- "Automation that feels handwritten" (Steve)

**Elon's position:** "Email body should be: 'Your site is live: [URL]. Reply if you need anything.' That's it."
**Steve's counter:** "This is lazy. This is what every contractor sends. This is forgettable."
**Resolution:** Plain text format locked, but copy quality is Steve's domain.

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.5: Personalization — Minimal Variables Only
**Proposed by:** Steve Jobs (Round 1, Round 2 Non-Negotiable #2)
**Challenged by:** None
**Winner:** **Steve**

**LOCKED PERSONALIZATION:**
- Only `{projectName}` and `{siteUrl}` variables (existing blueprint)
- Expanded to: `{name}`, `{project_url}`, `{ship_date}` (Elon's data model)
- No per-industry content
- No AI-generated trends
- No fake personalization

**Steve's principle:** "Personalization isn't merge tags. It's 'I looked at your site. Here's what I noticed.'"
**Elon's constraint:** "You're describing a system that requires human review of every email. That doesn't scale past 100 customers."
**Resolution:** Templates use merge tags, but voice must feel personal. If it smells automated, rewrite.

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.6: Brand Voice — Trusted Mechanic
**Proposed by:** Steve Jobs (Round 1, essence.md)
**Challenged by:** None
**Winner:** **Steve (Elon accepted unconditionally)**

**LOCKED VOICE:**
- ❌ Corporate: "Your deployment experience met expectations"
- ❌ Fake casual: "Hey there! Just checking in lol 😊"
- ✅ Shipyard: "It's been 30 days. Your site is holding up beautifully."

**Tone:** Trusted mechanic checking in. Confident, competent, human. We know what we built. We stand behind it.

**Elon's Round 2 concession:** "The tone is everything. Steve's right that corporate email voice kills this. I'll give him that."

**The Deal (Elon Round 2):**
"Steve writes the five email templates. Make them human. Make them caring. Make them sound like we give a shit. I'll ship them word-for-word."

**Voice test:** "Would I send this to a friend?" If not, rewrite.

**Existing blueprint alignment:** ✅ Matches ("Trusted mechanic — someone who remembers your project")

---

### Decision 1.7: Success Metrics — Data Decides
**Proposed by:** Elon Musk (Round 1, Round 2 Non-Negotiable #2)
**Challenged by:** Steve Jobs — "We're building presence, not measuring engagement"
**Winner:** **Elon (with Steve's qualitative overlay)**

**LOCKED METRICS:**

**Primary (Elon):**
- Reply rate to lifecycle emails
- Revision request conversion rate
- Target: >10% conversion (Elon) vs. >5% (existing blueprint)

**Secondary (Resend analytics):**
- Email open rate
- Unsubscribe rate

**Qualitative (Steve):**
- "Mental real estate" — customer remembers us 6 months later
- "Did this email make them feel something?"

**Decision framework:**
- <5% conversion → Kill Homeport, focus on acquisition
- 5-15% conversion → Iterate, refine templates
- >15% conversion → Fund V2 (screenshots, telemetry)

**Measurement period:** 90 days minimum

**Elon's principle:** "Data decides the next move. Not aesthetics. Not intuition. Data."

**Existing blueprint alignment:** ⚠️ **TARGET DIFFERS** (10% vs. 5%) — **Phil's ruling: Use Elon's 10% threshold** (more aggressive validation)

---

### Decision 1.8: Distribution Strategy — Pride Over Footer Links
**Proposed by:** Elon Musk Round 1 — "Built with Shipyard footer links on all sites"
**Challenged by:** Steve Jobs Round 2 — "That's tacky. Footer links have the engagement rate of popup ads."
**Winner:** **Steve**

**LOCKED DECISION:**
- ❌ NO "Built with Shipyard" footer links (rejected)
- ✅ Distribution via customer pride → testimonials, referrals, social proof
- ✅ Homeport itself is proof of care → differentiator in sales process

**Steve's position (R2):**
"Customers either (a) remove the footer link immediately because it looks cheap, or (b) leave it and nobody clicks it. Real distribution comes from customers *talking* about Shipyard. One customer who brags about us is worth 100 footer links."

**Elon's counter (R1):**
"Every shipped project should have a 'Built with Shipyard' footer link. That's 10,000 backlinks pointing to real, live proof. That's distribution."

**Phil's ruling:** Steve wins. Footer badges deferred to separate distribution strategy (not part of Homeport MVP).

**Existing blueprint alignment:** ✅ Matches (footer badges listed in "What does NOT ship")

---

### Decision 1.9: Dashboard — Use Resend's, Build Nothing
**Proposed by:** Elon Musk (Round 1, Round 2)
**Challenged by:** Original PRD (custom email performance dashboard)
**Winner:** **Elon**

**LOCKED DECISION:**
- ❌ No custom dashboard for email analytics
- ✅ Use Resend's built-in analytics (open rate, click rate, bounce rate)

**Steve's Round 2 concession:**
"Elon's 'just use Resend's dashboard' is pragmatic—I'll give him that."

**Elon's argument:**
"Don't build what you can buy for $0. Dashboards are where good products go to die."

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.10: A/B Testing — Once During Dev, Never After
**Proposed by:** Essence.md compromise
**Challenged by:**
- Steve Round 2 — "No A/B testing. Ever. Consistency is the brand."
- Elon Round 2 — "Run the test. If 'Your site is alive' beats 'how's it going?' by 40%, use the winner."

**Winner:** **Compromise holds (test once, lock winner)**

**LOCKED PROCESS:**
1. Test during V1 development (before launch)
2. Lock winning copy
3. Zero tests after ship
4. No ongoing optimization

**The balance:**
- Elon gets to validate copy with data before launch
- Steve gets consistency post-launch (no drift, no "optimization")

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.11: Timeline — 48 Hours to Ship
**Proposed by:** Elon Musk (Round 1, Round 2 Non-Negotiable #1)
**Challenged by:** Original PRD (2 weeks)
**Winner:** **Elon**

**LOCKED TIMELINE:**
- 48 hours from commit to production (Elon Round 2)
- 3 days (72 hours) in existing blueprint
- **Phil's ruling:** 48 hours is the target, 72 hours is the deadline

**Elon's constraint:**
"This is 300 lines of TypeScript. If it takes longer than 48 hours, the spec is wrong."

**Steve's Round 2 concession:**
"If we build what actually matters—5 emails, scheduling, unsubscribe—it's 3 days."

**Existing blueprint alignment:** ⚠️ **DIFFERS** (48h vs. 72h) — **Phil's ruling: Ship in 48h, allow 72h buffer**

---

### Decision 1.12: Feature Freeze — 90 Days Untouched
**Proposed by:** Elon Musk (Round 2 Non-Negotiable #3), essence.md
**Challenged by:** None
**Winner:** **Unanimous**

**LOCKED FREEZE:**
- No feature adds for 90 days post-launch
- "Test once. Ship. Never touch for 90 days." (essence.md)
- Let one full lifecycle complete (365 days) before major changes

**What's forbidden:**
- ❌ No Day 14 emails
- ❌ No surveys
- ❌ No Slack integrations
- ❌ No "quick improvements"

**The only exception:** If emails are landing in spam or broken technically, fix immediately. Otherwise, hands off.

**Existing blueprint alignment:** ✅ Matches

---

### Decision 1.13: Data Requirements — Fix the Pipeline
**Proposed by:** Steve Jobs (Round 2)
**Challenged by:** Elon Musk (as scope creep)
**Winner:** **Steve**

**LOCKED REQUIREMENTS:**

Homeport forces us to capture clean project data:
- Customer email
- Customer name
- Project URL
- Ship date
- (Optional: project type, what we built)

**V1 workaround:** Manual CSV upload to KV store
**V1.1 requirement:** Automated capture from shipment pipeline

**Steve's argument (R2):**
"If we don't have clean project data, we can't send meaningful emails. Period. The constraint isn't email templates—it's the shipment pipeline. Homeport isn't a '2-day ship'—it's a forcing function to fix our data architecture."

**Elon's concession:**
"You're right that manual project entry doesn't scale. Auto-capture from pipeline is not V1.1—it's V1.0."

**Phil's ruling:** Manual CSV acceptable for V1 launch, but automated capture must be V1.1 priority if conversion >10%.

**Blocker identified:** If we don't have this data for at least 10 shipped projects, postpone Homeport and fix the system first.

**Existing blueprint alignment:** ⚠️ **Expanded** (Steve added "forcing function" insight)

---

## 2. MVP Feature Set (What Ships in V1)

### What Ships (Unanimous)
1. ✅ **Five email templates** (plain text, Steve writes, Elon ships word-for-word)
2. ✅ **Cloudflare Worker with scheduled cron** (daily check, sends emails at Day 7/30/90/180/365)
3. ✅ **KV Store** (project data: `{email, name, project_url, ship_date, unsubscribed}`)
4. ✅ **Resend API integration** (email delivery, analytics)
5. ✅ **Unsubscribe mechanism** (one-click, KV flag update)
6. ✅ **Reply forwarding** (to `aftercare@shipyard.ai` or designated inbox)

### What Does NOT Ship (Unanimous)
- ❌ Screenshot generation (Puppeteer/headless Chrome)
- ❌ Performance monitoring (uptime, page speed)
- ❌ Analytics dashboard (use Resend's)
- ❌ Database/complex schema (KV only)
- ❌ Automated project data capture (manual CSV for V1)
- ❌ "Industry trends" content
- ❌ Special offers/discounts
- ❌ "Built with Shipyard" footer badges
- ❌ HTML email templates
- ❌ Multi-channel (email only)
- ❌ Site monitoring / health checks
- ❌ Case studies
- ❌ Per-industry customization
- ❌ AI-generated content

**Consensus achievements:** Both Steve and Elon agreed on all exclusions without debate.

---

## 3. File Structure (What Gets Built)

**Consolidated from both blueprints:**

```
/homeport  (or /aftercare — see Decision 1.1)
├── /worker
│   ├── index.ts                 # Main Worker entry point
│   ├── scheduler.ts             # Cron job logic (daily check for projects hitting Day 7/30/90/180/365)
│   ├── emails.ts                # Email template definitions
│   │   ├── day7()              # "Your site is breathing on its own now"
│   │   ├── day30()             # "It's been 30 days. Need any changes?"
│   │   ├── day90()             # "Ready for an update?"
│   │   ├── day180()            # "Six months in. How's it going?"
│   │   └── day365()            # "It's been a year. The web moved on."
│   ├── resend.ts                # Resend API client
│   ├── kv.ts                    # KV store operations
│   │   ├── getProject()        # Fetch project data
│   │   ├── isUnsubscribed()    # Check unsub status
│   │   └── markUnsubscribed()  # Set unsub flag
│   └── unsubscribe.ts           # Unsubscribe link handler (Worker endpoint)
├── /templates
│   ├── day-007.txt              # Plain text template (Steve writes)
│   ├── day-030.txt
│   ├── day-090.txt
│   ├── day-180.txt
│   └── day-365.txt
├── /scripts
│   └── csv-to-kv.ts             # Manual project upload script (for V1)
├── /tests
│   ├── emails.test.ts           # Email template rendering tests
│   └── scheduler.test.ts        # Cron logic tests
├── wrangler.toml                # Cloudflare Worker config
│   └── [[kv_namespaces]]        # AFTERCARE_KV or HOMEPORT_KV
├── package.json
├── tsconfig.json
└── README.md                     # Voice guidelines, deployment instructions
```

**Data in Workers KV:**
- Key: `project:{project_id}` → Value: `{email, name, project_url, ship_date}`
- Key: `unsubscribed:{email}` → Value: `true` (if opted out)

**No separate database. No API server. No frontend. Just one Worker and five text files.**

**Total estimated lines of code:** ~300 TypeScript (Elon's cap)

---

## 4. Open Questions (What Needs Resolution Before Build)

### 4.1 Project Data Source (🔴 CRITICAL)
**Question:** Where does project data come from for the manual CSV upload?
**Blocker level:** 🔴 Critical — can't launch without data
**Owner:** Phil Jackson

**Options:**
1. Export from existing CRM/project management system
2. Manual entry from completed project list
3. Reveals we don't have clean shipped-project tracking (deeper problem)

**Required CSV fields:**
```csv
project_id,customer_email,customer_name,project_url,ship_date
proj_001,customer@example.com,Jane Doe,https://example.com,2024-01-15
```

**Decision needed by:** Day 0 (before build starts)

**Steve's warning:** "If we're shipping projects without capturing this data, we're not a real agency."

---

### 4.2 Email "From" Address and Reply-To (🟡 MEDIUM)
**Question:** What email address do Homeport emails come from?
**Blocker level:** 🟡 Medium
**Owner:** Steve Jobs (brand) + Elon Musk (deliverability)

**Options:**
1. `homeport@shipyard.ai` (branded, requires domain setup)
2. `aftercare@shipyard.ai` (matches codebase naming)
3. `hello@shipyard.ai` (existing address, less distinct)
4. Personal address (e.g., `phil@shipyard.ai`) for intimacy

**Steve's preference:** Must feel like a human, not a system
**Elon's constraint:** Must have proper SPF/DKIM setup for deliverability

**Decision needed by:** Day 1 (before Resend integration)

---

### 4.3 Unsubscribe Flow (🟡 MEDIUM — Legal Requirement)
**Question:** What happens when a customer unsubscribes?
**Blocker level:** 🟡 Medium (CAN-SPAM compliance required)

**Options:**
1. One-click unsubscribe link → KV flag update → confirmation page
2. "Reply STOP to unsubscribe" (simpler, less professional)
3. Resend's built-in unsubscribe (automatically appended)
4. Unsubscribe from all Shipyard emails vs. just Homeport

**Legal requirement:** Must provide clear opt-out mechanism

**Decision needed by:** Day 1 (before first email template finalized)

**Elon's Round 2 position:** "Simple KV lookup to block future emails if unsubscribed. No complex preference management."

---

### 4.4 Day 7 Email Content — Exact Copy (🔴 CRITICAL)
**Question:** What exactly does the Day 7 email say?
**Blocker level:** 🔴 Critical
**Owner:** Steve Jobs (draft) → Elon Musk (review) → Phil Jackson (approve)

**Steve's constraints:**
- Must deliver emotion (pride, accomplishment)
- Cannot be generic ("Your site is live: [URL]")
- Must pass "automation smell test"
- Subject: "Your site is breathing on its own now" (Steve Round 1)

**Elon's constraints:**
- No promises we can't keep 100% of the time
- No features requiring additional infrastructure (screenshots, metrics)
- If it can't be validated with data, cut it

**Rejected version (Elon Round 2):**
"Your site is live: [URL]. Reply if you need anything."
→ Steve: "This is lazy. This is forgettable."

**Draft needed by:** Day 1 (before build completes)

**Existing blueprint draft (for reference):**
```
Subject: Your site is alive
Body: We shipped your project 7 days ago. Here's what's happened since.
  - [Your site URL]
  - [Your admin]
  - [How did we do?]
CTA: Reply if something's off.
```

---

### 4.5 Reply Handling (🟡 MEDIUM)
**Question:** What happens when a customer replies to a Homeport email?
**Blocker level:** 🟡 Medium
**Owner:** Phil Jackson

**Options:**
1. Goes to shared inbox (e.g., `homeport@shipyard.ai`) → manual response
2. Goes to Phil's inbox → he handles personally
3. Auto-reply with "Thanks, we'll be in touch" (defeats the purpose)
4. Integrate with ticketing system (scope creep)

**Steve's constraint:** Must feel like a real human can respond
**Elon's constraint:** Must scale beyond manual reply handling

**V1 decision:** Manual handling acceptable for low volume (<100 emails)
**V1.1 requirement:** If reply rate >10%, need workflow for response management

**Decision needed by:** Day 2 (before first email send)

**SLA question:** What's the response time commitment? <24 hours? <48 hours?

---

### 4.6 Testing Strategy (🟢 LOW)
**Question:** How do we test emails before sending to real customers?
**Blocker level:** 🟢 Low (solvable during build)

**Options:**
1. Test mode flag in Worker → sends to internal team emails
2. Staging KV namespace with test data
3. Resend test API keys
4. Manual send to Phil/Steve/Elon before go-live

**Decision needed by:** During build (Day 1-2)

---

### 4.7 Activation Threshold for Full Sequence (🟢 LOW)
**Question:** At exactly what conversion rate do we validate success?
**Blocker level:** 🟢 Low (post-MVP decision)

**Current framework:**
- <5% = kill feature (focus on acquisition)
- 5-15% = iterate on templates
- >15% = fund V2 (screenshots, telemetry)

**Open question:** All 5 emails deploy immediately (Steve won), so what triggers V2?

**Decision needed by:** After 90-day measurement period

---

### 4.8 Trigger Mechanism (🔴 CRITICAL)
**Question:** How does Shipyard's main system trigger the Worker when a project ships?
**Blocker level:** 🔴 Critical — can't automate without this
**Owner:** Elon Musk (technical) + Phil Jackson (integration point)

**Options:**
1. Webhook from Shipyard backend → Worker endpoint (POST to `/trigger`)
2. Cloudflare Queue integration
3. Manual API call from agent after ship
4. CSV upload triggers Worker to schedule emails

**Required webhook payload:**
```json
{
  "project_id": "proj_001",
  "email": "customer@example.com",
  "name": "Jane Doe",
  "project_url": "https://example.com",
  "ship_date": "2024-01-15"
}
```

**Decision needed by:** Day 0 (defines V1 vs. V1.1 scope)

**If webhook doesn't exist:** V1 = manual CSV upload, V1.1 = automated webhook

---

### 4.9 Project Metadata Availability (🟡 MEDIUM)
**Question:** What data is actually available when a project ships?
**Blocker level:** 🟡 Medium
**Owner:** Phil Jackson (audit existing systems)

**Assumptions:**
- `project_id` (??)
- `customer_email` (??)
- `customer_name` (??)
- `project_url` (??)
- `ship_date` (??)

**Unknown:**
- Do we have all these fields today?
- Are they captured consistently?
- What's the source of truth?

**Decision needed by:** Day 0 (before CSV structure is defined)

---

## 5. Risk Register (What Could Go Wrong)

### 5.1 Technical Risks

#### Risk: Customers Hate It (Unsubscribe Rate >20%)
**Likelihood:** 🟡 Medium
**Impact:** 🔴 High (kills entire feature)
**Root cause:** Emails feel automated, spammy, or provide no value

**Mitigation:**
- Steve writes templates (quality control)
- Test with internal team first
- Monitor unsubscribe rate daily in first 30 days
- Kill switch: pause sends if unsub rate >15% in first week

**Owner:** Steve Jobs (template quality) + Phil Jackson (monitoring)

---

#### Risk: No Project Data Exists (Can't Launch)
**Likelihood:** 🔴 High
**Impact:** 🔴 High (blocks entire MVP)
**Root cause:** Shipyard doesn't have clean records of shipped projects

**Mitigation:**
- Audit existing project records immediately (Day 0)
- Manual backfill if needed
- Delay launch if data doesn't exist (don't fake it)
- **Minimum viable data:** 10 shipped projects with email, name, URL, ship date

**Owner:** Phil Jackson

**Steve's warning:** "If we have <10 shipped projects with clean data, postpone Homeport and fix the shipment pipeline first."

---

#### Risk: Email Deliverability Issues (Land in Spam)
**Likelihood:** 🟡 Medium
**Impact:** 🔴 High (emails never seen = feature doesn't exist)
**Root cause:** Improper domain setup, Resend reputation, spam filter triggers

**Mitigation:**
- Proper SPF/DKIM/DMARC setup before launch
- Test deliverability with Mail-Tester.com
- Plain text emails (no HTML) = better deliverability
- Warm up sending domain (start with small batch)
- Limit to 3 links max per email
- No attachments, no spam trigger words

**Owner:** Elon Musk (technical setup) + Steve Jobs (content review for spam triggers)

---

#### Risk: Cloudflare Worker Alarm Fails to Fire
**Likelihood:** 🟢 Low (Cloudflare SLA 99.99%)
**Impact:** 🔴 High (email never sends, customer forgotten)

**Mitigation:**
- Monitor Worker logs daily for first 30 days
- Set up Cloudflare alert if alarm fails
- Manual retry mechanism via KV query
- Accept rare failures vs. over-engineering redundancy

**Owner:** Elon Musk

---

#### Risk: Workers KV Eventual Consistency → Duplicate Emails
**Likelihood:** 🟡 Medium (KV is eventually consistent)
**Impact:** 🟡 Medium (customer gets same email twice, looks sloppy)

**Mitigation:**
- Use unique `scheduleId` per email
- Check KV for existing schedule before creating new one
- Accept rare duplicates vs. over-engineering deduplication

**Elon's position:** "Accept that debugging is slower vs. building custom UI."

---

#### Risk: No Way to Debug Missing Emails
**Likelihood:** 🟡 Medium (no custom dashboard)
**Impact:** 🟡 Medium (can't troubleshoot customer complaints)

**Mitigation:**
- Use Cloudflare Worker logs (shows all executions)
- Use Resend dashboard (shows all sent emails)
- Accept slower debugging in exchange for faster shipping

**Owner:** Elon Musk

---

### 5.2 Product Risks

#### Risk: Conversion Rate Too Low (<5%)
**Likelihood:** 🟡 Medium
**Impact:** 🟡 Medium (feature killed, but learning gained)
**Root cause:** Customers don't need lifecycle emails, or positioning is wrong

**Mitigation:**
- Accept this as a valid outcome (fast failure)
- Ensure email quality is high so we're testing the right thing
- If killed, redirect effort to acquisition (Elon's point proven)

**Steve's constraint:** "If we ship mediocre emails to 'validate the concept,' we'll validate nothing. Customers won't respond to mediocrity, and you'll declare lifecycle emails a failure when the real failure was execution."

**Owner:** Phil Jackson (decision to kill) + Steve Jobs (ensure quality not compromised)

---

#### Risk: Manual CSV Upload Becomes Bottleneck
**Likelihood:** 🔴 High
**Impact:** 🟡 Medium (operational pain, doesn't scale)
**Root cause:** V1 has no automated project data capture

**Mitigation:**
- Accept manual process for first 90 days
- If Homeport proves successful (>10% conversion), V1.1 priority = automated capture
- If shipping >1 project/day, automate immediately

**Elon's threshold:** "At 10x usage (10,000 shipped projects/year), manual CSV upload = 27 projects/day. You're dead."

**Owner:** Elon Musk (build automation when threshold hit)

---

#### Risk: "Someone Remembers" Feeling Degrades at Scale
**Likelihood:** 🟡 Medium
**Impact:** 🔴 High (brand promise broken, customers unsubscribe)
**Root cause:** Templates feel automated as volume increases

**Mitigation:**
- Never auto-generate content with AI
- Never customize per-industry (maintain human voice)
- Lock templates in V1, never change them
- Steve's principle: "I'd rather send fewer emails—beautifully—than scale to spam"

**Owner:** Steve Jobs (voice guardian)

---

#### Risk: Voice Drift Over Time (Future Team Rewrites)
**Likelihood:** 🔴 High (if team expands)
**Impact:** 🔴 High ("Maximize your digital presence" corporate slop)
**Root cause:** New team members "optimize" copy without understanding voice

**Mitigation:**
- **Lock templates in V1, never touch** (Decision 1.12)
- Document voice guidelines in README.md
- Steve's test: "Would I send this to a friend?" = quality gate
- 90-day feature freeze prevents premature optimization

**Owner:** Steve Jobs (enforce via README) + Phil Jackson (veto power on changes)

---

#### Risk: Reply Inbox Not Monitored (Trust Destroyed)
**Likelihood:** 🟡 Medium (open question 4.5)
**Impact:** 🔴 High (customer replies, gets ignored, brand promise broken)
**Root cause:** No assigned owner, no SLA for response

**Mitigation:**
- **Must resolve before ship:** Assign owner of reply inbox
- Set SLA for reply response (<24 hours target)
- If no one can monitor, reconsider reply-focused metric
- Start with manual handling, automate only if reply rate >10%

**Owner:** Phil Jackson (assign responsibility)

**Elon's warning:** "If reply rate >10%, need workflow for response management."

---

### 5.3 Business Risks

#### Risk: Homeport Solves Retention, Not Acquisition
**Likelihood:** 🔴 High (Elon flagged this in Round 1)
**Impact:** 🟡 Medium (fixes churn, doesn't drive growth)
**Root cause:** Lifecycle emails don't bring in new customers

**Mitigation:**
- Accept that this PRD is retention-only
- Separate effort needed for acquisition (deferred)
- Don't confuse repeat customers with new customers

**Elon's Round 1 challenge:**
"Target: '20% of shipped projects generate revision orders'—but where are the 10,000 users? This is a retention play when you don't have acquisition solved. Why would someone ship with Shipyard the FIRST time?"

**Steve's Round 2 counter:**
"Homeport helps acquisition—it's proof we care about what happens after the sale. That's a differentiator we can sell before the first project ships."

**Compromise:** Homeport is retention-focused, but becomes a sales asset (proof of care).

---

#### Risk: 48-Hour Timeline is Unrealistic
**Likelihood:** 🟡 Medium
**Impact:** 🟢 Low (delayed launch, but recoverable)
**Root cause:** Underestimated complexity, dependency blockers, scope creep

**Mitigation:**
- Elon's 300-line code cap enforced (hard limit)
- If timeline slips, identify what got added beyond locked scope
- Phil Jackson has veto power on any feature addition during build
- 72-hour buffer allowed if quality maintained

**Owner:** Elon Musk (timeline accountability) + Phil Jackson (scope enforcement)

---

#### Risk: Steve and Elon Disagree During Execution
**Likelihood:** 🟡 Medium
**Impact:** 🟡 Medium (delays, quality vs. speed tension)
**Root cause:** Creative vision (Steve) vs. technical constraints (Elon)

**Mitigation:**
- This locked decisions document = source of truth
- "Steve writes, Elon ships word-for-word" agreement holds (Decision 1.6)
- Phil Jackson = tie-breaker on all disputes

**The Deal (Elon Round 2):**
"I'll give Steve the tone, the cadence, and the positioning. He gives me the architecture, the timeline, and veto power on any feature that requires >1 day of eng work."

**Owner:** Phil Jackson (referee)

---

## 6. Success Criteria (What "Done" Looks Like)

### Launch Readiness Checklist

**Day 0 (Pre-Build):**
- [ ] **Project data audit complete** (Phil) — Do we have 10+ shipped projects with clean data?
- [ ] **CSV structure defined** (Phil) — Fields: project_id, email, name, project_url, ship_date
- [ ] **"From" email address decided** (Steve + Elon) — homeport@, aftercare@, or personal?
- [ ] **Unsubscribe flow designed** (Elon) — One-click KV flag or Resend built-in?
- [ ] **Reply inbox assigned** (Phil) — Who monitors? What's the SLA?

**Day 1 (Build):**
- [ ] **Cloudflare Worker project scaffolded** (Elon)
- [ ] **Resend account + domain authentication** (Elon) — SPF/DKIM/DMARC configured
- [ ] **Day 7 email draft finalized** (Steve → Elon → Phil approval)
- [ ] **Day 30 email draft finalized** (Steve → Elon → Phil approval)
- [ ] **Day 90/180/365 drafts written** (Steve) — dormant but committed to code
- [ ] **Worker core built** (Elon) — scheduler, KV operations, Resend integration
- [ ] **CSV-to-KV upload script working** (Elon)
- [ ] **Tests written** (Elon) — email rendering, cron logic

**Day 2 (Ship):**
- [ ] **Worker deployed to production** (Elon)
- [ ] **KV store populated** (Phil) — Upload CSV with real project data
- [ ] **Test emails sent to internal team** (Elon) — Deliverability confirmed
- [ ] **Day 7/30/90/180/365 cron jobs active** (Elon)
- [ ] **Unsubscribe mechanism functional** (Elon) — CAN-SPAM compliant
- [ ] **Monitoring dashboard accessible** (Resend analytics)
- [ ] **Voice review complete** (Steve) — Final check for "automation smell"
- [ ] **Go-live approval** (Phil)

### 90-Day Measurement Plan

**Weeks 1-4:**
- Projects shipped 7+ days ago → receive Day 7 email
- Projects shipped 30+ days ago → receive Day 30 email

**Weeks 5-8:**
- Full cadence active (Day 7, 30, 90)
- Monitor reply rate, unsubscribe rate

**Weeks 9-12:**
- Projects shipped 180+ days ago → receive Day 180 email
- Calculate conversion rates

**Metrics to track:**
- Total emails sent (breakdown by Day 7/30/90/180/365)
- Open rate (% who open) — via Resend
- Reply rate (% who respond) — primary metric
- Revision request rate (% who book follow-up work) — primary metric
- Unsubscribe rate (% who opt out) — kill switch if >15%

**Decision meeting:** Day 91
**Attendees:** Steve Jobs, Elon Musk, Phil Jackson
**Outcome:** Kill (<5%), iterate (5-15%), or scale (>15%) based on data

---

## 7. The Deal (Steve ↔ Elon Agreement)

### Steve's Commitments
1. ✅ Write all 5 email templates (Day 7, 30, 90, 180, 365) with craft quality
2. ✅ No dashboards, no screenshots, no metrics in V1 (accepted Elon's cuts)
3. ✅ Accept plain text emails (no HTML, no images)
4. ✅ Accept 48-hour timeline if email quality is non-negotiable
5. ✅ Trust Elon's architecture (Workers + KV + Resend)
6. ✅ Accept that templates use merge tags, not human review per send

### Elon's Commitments
1. ✅ Ship Steve's email templates word-for-word (no edits for brevity)
2. ✅ Accept 5-email cadence (all deployed immediately, not phased)
3. ✅ Build all 5 templates in V1 code
4. ✅ Accept "Homeport" as customer-facing name
5. ✅ Give Steve veto power on any "optimization" that compromises voice
6. ✅ Accept that tone matters as much as speed

### The Deal (Elon's Round 2 Offer, Steve Accepted)
**Elon:** "I'll give Steve the tone, the cadence, and the positioning. He gives me the architecture, the timeline, and veto power on any feature that requires >1 day of eng work."

**Steve:** "Steve writes the five email templates. Make them human. Make them caring. Make them sound like we give a shit. I'll ship them word-for-word."

**Locked:** ✅

### Phil's Role
- **Tie-breaker** when Steve and Elon disagree
- **Scope enforcer** (no additions beyond locked decisions)
- **Data source owner** (deliver clean project CSV by Day 0)
- **Kill switch authority** (if metrics justify shutting down)
- **Reply inbox** (assign owner, enforce SLA)

---

## 8. Consensus Achievements (What Both Agreed On)

**No debate required:**

1. ✅ Five emails at Day 7, 30, 90, 180, 365 (no sixth email, no monthly check-ins)
2. ✅ Plain text only (no HTML, no images, no branded templates)
3. ✅ No upsell in emails (Day 7 is not "10% off your next project")
4. ✅ Use Resend (don't build email infrastructure)
5. ✅ No custom dashboard (use Resend's built-in analytics)
6. ✅ Workers KV, not database (stateless, simple, deletable)
7. ✅ Ship in 48-72 hours (if longer, scope is wrong)
8. ✅ 90-day feature freeze (let it run untouched)
9. ✅ No site monitoring (we're not Pingdom)
10. ✅ Measure reply rate > open rate (data decides)
11. ✅ No "Built with Shipyard" footer badges (tacky, deferred)
12. ✅ No per-industry customization (same emails to everyone)
13. ✅ No AI-generated content (human voice only)

**Where they compromised:**

| Issue | Steve's Position | Elon's Position | Compromise |
|-------|------------------|-----------------|------------|
| **A/B Testing** | Never test (consistency = brand) | Always test (data > opinions) | Test once during dev, lock winner |
| **Success Metric** | Mental real estate (presence) | Reply rate (measurable) | Track both, optimize for replies |
| **Timeline** | 3 days if emails are perfect | 48 hours by cutting scope | 48h target, 72h deadline |
| **Email Count** | All 5 deployed immediately | Start with Day 7/30, validate | All 5 ship, measure 90 days |
| **Distribution** | Word-of-mouth from great service | Footer badges, showcase | Retention ≠ acquisition (separate) |
| **Scalability** | Human touch doesn't scale | Templates + merge tags scale | Templates feel personal, use variables |

---

## 9. Next Actions (Immediate)

### Day 0 (Pre-Build) — DUE BEFORE BUILD STARTS

**Phil Jackson:**
- [ ] Audit shipped project records (do we have the data?)
- [ ] Prepare CSV with at least 10 shipped projects (email, name, URL, ship_date)
- [ ] Decide on "From" email address (homeport@ vs. aftercare@ vs. personal)
- [ ] Assign reply inbox owner (who monitors? what SLA?)
- [ ] Approve unsubscribe flow design
- [ ] Resolve trigger mechanism (webhook payload format or manual CSV process)

**Steve Jobs:**
- [ ] Draft Day 7 email template (first draft for review)
- [ ] Draft Day 30 email template (first draft for review)
- [ ] Draft Day 90/180/365 templates (for code commit)

**Elon Musk:**
- [ ] Set up Resend account (if not already done)
- [ ] Configure domain authentication (SPF/DKIM/DMARC for homeport@ or aftercare@)
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
- [ ] Finalize Day 7 and Day 30 templates based on Elon's feedback
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
- [ ] Activate Day 7, 30, 90, 180, 365 cron jobs
- [ ] Send test emails to internal team (Phil, Steve, Elon)
- [ ] Confirm Resend dashboard shows sent emails

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
- [ ] **Do not touch the code** (90-day feature freeze)
- [ ] Monitor Resend dashboard weekly (open rate, unsub rate, reply rate)
- [ ] Respond to customer replies within SLA (<24 hours)
- [ ] Log any technical issues (Worker failures, deliverability problems)
- [ ] Collect qualitative feedback (what do customers say when they reply?)

**Kill switch triggers:**
- If unsubscribe rate >15% in first week → pause sends, review copy
- If reply rate <1% after 50 emails → consider copy rewrite
- If emails landing in spam (>10% bounce rate) → fix deliverability immediately

---

### Day 91 (Decision Meeting)

**Attendees:** Steve Jobs, Elon Musk, Phil Jackson

**Agenda:**
1. Review metrics (reply rate, revision requests, unsub rate)
2. Qualitative review (what did customers say?)
3. Decide: Kill (<5%), Iterate (5-15%), or Scale (>15%)

**Outcomes:**
- **Kill (<5%):** Shut down Homeport, redirect to acquisition efforts (Elon was right)
- **Iterate (5-15%):** Rewrite templates, test variations, measure another 90 days
- **Scale (>15%):** Fund V2 (screenshots, telemetry, automated project capture)

---

## 10. Final Locked Position

**Product:** Homeport (customer-facing) / Aftercare (codebase)
**Positioning:** "We're the agency that doesn't ghost you."
**MVP Scope:** 5 lifecycle emails (Day 7/30/90/180/365), Cloudflare Workers, Resend API, manual project upload
**Timeline:** 48 hours to production (72-hour buffer)
**Success Metric:** 10%+ reply/revision request rate
**Kill Threshold:** <5% conversion after 90 days
**Scale Threshold:** >15% conversion unlocks V2

**Steve writes. Elon ships. Phil decides. Data judges.**

---

## 11. Voice Lock (Steve's Final Word)

**Email copy test:** "Would I send this to a friend?"
**If not, rewrite.**

**Voice rules:**
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

**Locked forever.** Templates written in V1 never change unless data proves they're broken (<5% reply rate).

---

## 12. Speed Lock (Elon's Final Word)

**Technical constraints:**
- 300 lines of TypeScript maximum (hard cap)
- 48 hours from commit to production (72-hour deadline)
- Single failure mode: Resend API down
- Zero infrastructure maintenance beyond Worker + KV
- Debuggable in <60 seconds
- Fully deletable in 5 minutes if experiment fails

**If it takes longer than 72 hours, the spec is wrong.**

**Delete > debug.** If something breaks, rewrite it in a weekend rather than debug for a week.

---

## 13. Triangle Offense (Phil's Final Word)

**Roles:**
- **Steve:** Voice guardian. Writes all copy. Veto power on tone changes.
- **Elon:** Speed enforcer. Builds infrastructure. Veto power on scope creep.
- **Phil:** Tie-breaker. Data owner. Kill switch authority.

**When Steve and Elon disagree:**
1. Check this document (locked decisions = source of truth)
2. If not covered, Phil decides
3. If Phil can't decide, run a 48-hour experiment and measure

**The Deal holds:**
- Steve writes, Elon ships word-for-word
- Elon cuts scope, Steve accepts if quality maintained
- Data decides the next move (not aesthetics, not intuition)

---

**Status:** BLUEPRINT LOCKED
**Owner:** Development agent (following this blueprint)
**Approval:** Phil Jackson (Zen Master) + Steve Jobs (Chief Design) + Elon Musk (Chief Product)

**Ship when:** All Day 0 open questions resolved

---

**Reminder from essence.md:**

> **The lock:** Test once. Ship. Never touch for 90 days.
>
> **The deal:** Speed without soul = noise. Soul without speed = vaporware. Ship both in 3 days.

---

*"Simple. Reliable. Unforgettable."* — Steve Jobs
*"Ship now, iterate later."* — Elon Musk
*"One triangle offense. Execute."* — Phil Jackson

**End of Blueprint.**
