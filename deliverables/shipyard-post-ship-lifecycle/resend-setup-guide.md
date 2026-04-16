# Resend Account and Domain Authentication Setup Guide

**Purpose:** Document the manual steps required to configure a Resend transactional email account, authenticate the sending domain, and verify email deliverability before the first Homeport email send.

**Timeline:** 24-48 hours (domain authentication propagation: 24-48 hours)

**Owner:** Elon Musk (technical setup) + Phil Jackson (verification and testing)

**Status:** Pre-Build Setup Documentation (manual execution required)

---

## Executive Summary

This guide covers setting up Resend for the Homeport lifecycle email system. Resend is a transactional email service providing:

- ✅ Reliable email delivery
- ✅ Built-in analytics (open rate, click rate, bounce rate)
- ✅ SMTP and API integrations
- ✅ Domain authentication (SPF, DKIM, DMARC)
- ✅ Bounce and complaint handling

**Key constraint:** Domain authentication requires DNS record updates that take 24-48 hours to propagate globally. Plan accordingly.

---

## Phase 1: Resend Account Setup

### Step 1.1: Create Resend Account

**URL:** https://resend.com

**Actions:**
1. Navigate to https://resend.com
2. Click "Get Started" or "Sign Up"
3. Enter email address (can be any Shipyard team email)
4. Create password (strong, 12+ characters)
5. Verify email address (check inbox for confirmation link)
6. Complete onboarding (no credit card required for initial setup)

**Expected outcome:**
- Resend dashboard accessible
- Default workspace created
- Ready to add custom domain

---

### Step 1.2: Access Resend Dashboard

**URL:** https://app.resend.com/dashboard

**Actions:**
1. Log in to Resend account
2. Navigate to Dashboard
3. Note the workspace ID (will be needed later)

**Key dashboard sections:**
- **Domains** — Configure sending domains
- **API Keys** — Generate authentication tokens
- **Analytics** — Track email performance
- **Logs** — View sent emails and delivery status

---

## Phase 2: Domain Selection and Addition

### Step 2.1: Choose Sending Domain

**Decision from decisions.md (Section 4.2):**

Choose ONE of the following:
1. **`homeport@shipyard.ai`** (recommended for Homeport brand)
2. **`aftercare@shipyard.ai`** (matches codebase naming)
3. **`hello@shipyard.ai`** (existing address, already in use)
4. **`personal@shipyard.ai`** (if personal touch preferred, e.g., `phil@shipyard.ai`)

**Recommendation:** Use `homeport@shipyard.ai` to establish Homeport as a distinct brand within Shipyard.

**Constraint:** Domain must be owned/controlled by Shipyard for DNS configuration.

---

### Step 2.2: Add Domain to Resend

**In Resend Dashboard:**

1. Navigate to **Domains** section
2. Click **Add Domain** or **+ New Domain**
3. Enter domain: `shipyard.ai` (NOT the full email address)
4. Select authentication level: **Full** (required for SPF, DKIM, DMARC)
5. Click **Add Domain**

**Expected outcome:**
- Domain appears in dashboard with "Pending" status
- Resend generates DNS records (see Step 3 below)
- Domain shows required DNS entries

---

## Phase 3: DNS Configuration (24-48 Hours)

### Step 3.1: Retrieve DNS Records from Resend

**In Resend Dashboard:**

After adding domain, Resend displays three DNS records:

1. **SPF Record**
   - Type: TXT
   - Name: `shipyard.ai` (or `@`)
   - Value: `v=spf1 include:resend.com ~all`

2. **DKIM Record**
   - Type: CNAME
   - Name: `default._domainkey.shipyard.ai`
   - Value: `[resend-specific-hostname]` (provided by Resend)

3. **DMARC Record**
   - Type: TXT
   - Name: `_dmarc.shipyard.ai`
   - Value: `v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai`

**Copy these values immediately** — you'll need them for DNS provider.

---

### Step 3.2: Access DNS Provider Control Panel

**Common DNS Providers:**
- GoDaddy, Namecheap, Route 53 (AWS), Cloudflare, Google Domains, etc.

**Actions:**
1. Log in to Shipyard's DNS provider
2. Navigate to DNS/Domain Management
3. Locate `shipyard.ai` domain
4. Find **DNS Records** or **Zone File** editor
5. Prepare to add three TXT/CNAME records

---

### Step 3.3: Add SPF Record

**Record Details:**
- **Type:** TXT
- **Name:** `@` (or `shipyard.ai` depending on provider)
- **Value:** `v=spf1 include:resend.com ~all`
- **TTL:** 3600 (or default)

**Instructions (varies by provider):**

**GoDaddy:**
1. DNS Management → Add Record
2. Type: TXT
3. Name: @
4. Value: `v=spf1 include:resend.com ~all`
5. Save

**Cloudflare:**
1. DNS → Add Record
2. Type: TXT
3. Name: shipyard.ai
4. Content: `v=spf1 include:resend.com ~all`
5. TTL: Auto
6. Save

**AWS Route 53:**
1. Hosted Zones → shipyard.ai
2. Create Record
3. Name: shipyard.ai
4. Type: TXT
5. Value: `v=spf1 include:resend.com ~all`
6. Create

**Expected outcome:** SPF record added successfully (shows in DNS provider)

---

### Step 3.4: Add DKIM Record

**Record Details (Resend provides exact value):**
- **Type:** CNAME
- **Name:** `default._domainkey.shipyard.ai`
- **Value:** `[resend-specific-value-from-dashboard]`
- **TTL:** 3600 (or default)

**Example DKIM value from Resend:**
```
default._domainkey.shipyard.ai CNAME [random-string].dkim.resend.domains
```

**Instructions:**

**GoDaddy:**
1. DNS Management → Add Record
2. Type: CNAME
3. Name: `default._domainkey`
4. Value: `[resend-provided-value]`
5. Save

**Cloudflare:**
1. DNS → Add Record
2. Type: CNAME
3. Name: `default._domainkey.shipyard.ai`
4. Target: `[resend-provided-value]`
5. TTL: Auto
6. Save

**AWS Route 53:**
1. Hosted Zones → shipyard.ai
2. Create Record
3. Name: `default._domainkey.shipyard.ai`
4. Type: CNAME
5. Value: `[resend-provided-value]`
6. Create

**Important:** DKIM record uses CNAME (not TXT). Double-check record type.

**Expected outcome:** DKIM CNAME record added successfully

---

### Step 3.5: Add DMARC Record

**Record Details:**
- **Type:** TXT
- **Name:** `_dmarc.shipyard.ai`
- **Value:** `v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai`
- **TTL:** 3600 (or default)

**DMARC Value Explanation:**
- `v=DMARC1` — DMARC version 1
- `p=none` — Policy is "monitor, don't reject" (safest for initial setup)
- `rua=mailto:dmarc@shipyard.ai` — Send DMARC reports to this email (or remove if no inbox available)

**Instructions:**

**GoDaddy:**
1. DNS Management → Add Record
2. Type: TXT
3. Name: `_dmarc`
4. Value: `v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai`
5. Save

**Cloudflare:**
1. DNS → Add Record
2. Type: TXT
3. Name: `_dmarc.shipyard.ai`
4. Content: `v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai`
5. TTL: Auto
6. Save

**AWS Route 53:**
1. Hosted Zones → shipyard.ai
2. Create Record
3. Name: `_dmarc.shipyard.ai`
4. Type: TXT
5. Value: `v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai`
6. Create

**Expected outcome:** DMARC TXT record added successfully

---

### Step 3.6: Verify DNS Propagation (24-48 Hours)

**Wait Time:** DNS changes can take 24-48 hours to propagate globally.

**Monitor propagation:**

1. **Resend Dashboard** (automatic checks)
   - Return to Domains section
   - Domain should change from "Pending" to "Active" or "Verified"
   - Watch for green checkmarks next to SPF, DKIM, DMARC

2. **Manual verification tools:**
   - MXToolbox: https://mxtoolbox.com/spf.aspx
   - DNSChecker: https://dnschecker.org
   - Google Toolbox: https://toolbox.googleapps.com/apps/checkmx/

3. **Terminal command (Linux/Mac):**
   ```bash
   # Check SPF record
   dig shipyard.ai TXT | grep v=spf1

   # Check DKIM record
   dig default._domainkey.shipyard.ai CNAME

   # Check DMARC record
   dig _dmarc.shipyard.ai TXT
   ```

**Expected outcome:** All three records visible and matching Resend values

**⚠️ Critical:** Do NOT proceed to Phase 4 until all DNS records are verified. Sending emails before verification will reduce deliverability.

---

## Phase 4: API Key Generation

### Step 4.1: Generate Resend API Key

**In Resend Dashboard:**

1. Navigate to **API Keys** or **Settings** → **API Keys**
2. Click **Create API Key** or **+ New Key**
3. Name the key: `homeport-production` (or `aftercare-production`)
4. Scope: **Full access** (required for sending emails)
5. Click **Create**

**Expected outcome:**
- API key displayed (long string starting with `re_`)
- Copy immediately (will not be shown again)

**Example format:**
```
re_1234567890abcdef1234567890abcdef1234567890
```

---

### Step 4.2: Store API Key Securely

**Do NOT commit to version control.**

**For Cloudflare Workers deployment (Wave 3):**

API key will be set via:
```bash
wrangler secret put RESEND_API_KEY --env production
```

**Storage approach:**
1. Save to secure password manager (1Password, LastPass, etc.)
2. Store in `.env.production` (gitignored file, not committed)
3. Retrieve during Wave 3 Wrangler deployment

**⚠️ Security:** This API key can send emails on behalf of Shipyard. Protect it like a credit card number.

---

## Phase 5: Email Deliverability Testing

### Step 5.1: Send Test Email via Resend Dashboard

**In Resend Dashboard:**

1. Navigate to **Send Test** or **Emails** → **Send Email**
2. Fill form:
   - **From:** `homeport@shipyard.ai` (or chosen address)
   - **To:** Your own email (e.g., `elon@shipyard.ai`)
   - **Subject:** "Test from Resend — Shipyard Homeport"
   - **HTML/Text:** Simple test message

3. Click **Send**

**Expected outcome:**
- Email appears in Resend analytics immediately
- Email should arrive in your inbox within 10 seconds
- Check both Inbox and Spam folder

---

### Step 5.2: Test with Mail-Tester (Spam Score Check)

**URL:** https://www.mail-tester.com

**Purpose:** Verify email isn't flagged as spam by major providers.

**Steps:**

1. Go to https://www.mail-tester.com
2. Copy the email address provided (e.g., `test-xyz123@mail-tester.com`)
3. In Resend, send a test email to that address:
   - From: `homeport@shipyard.ai`
   - To: `test-xyz123@mail-tester.com`
   - Subject: "Mail-Tester: Shipyard Homeport Test"
   - Body: Sample Day 7 email template (from decisions.md)

4. After sending, click **Then check your score** on Mail-Tester
5. Wait 10-30 seconds for email to arrive
6. Review spam score report

**Expected results:**
- Score: 9.0+ out of 10 (excellent)
- SPF: ✅ Pass
- DKIM: ✅ Pass
- DMARC: ✅ Pass
- Domain reputation: ✅ OK (first few emails may be "New Domain")

**If score is low (<7):**
- Check DNS records (ensure DKIM, SPF, DMARC are active)
- Wait 24 hours for propagation
- Retest
- Review Resend documentation for additional setup

---

### Step 5.3: Test Email Headers and Formatting

**Goal:** Ensure plain text emails are formatted correctly.

**Test email content (from decisions.md):**
```
From: Homeport <homeport@shipyard.ai>
Subject: Your site is breathing on its own now

It's been 7 days. Your site is breathing on its own now.

[Project Name]
[URL]

Reply if something's off.

---
Unsubscribe: https://homeport.shipyard.ai/unsub?token=[encoded_email]
```

**Resend API format (TypeScript):**
```typescript
const resendResponse = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: `Homeport <homeport@shipyard.ai>`,
    to: ["test@example.com"],
    reply_to: "homeport@shipyard.ai",
    subject: "Your site is breathing on its own now",
    text: `It's been 7 days. Your site is breathing on its own now.\n\n[Project Name]\n[URL]\n\nReply if something's off.\n\n---\nUnsubscribe: https://homeport.shipyard.ai/unsub?token=[encoded_email]`,
  }),
});
```

**Testing checklist:**
- [ ] Email received within 10 seconds
- [ ] Subject line correct
- [ ] Plain text formatting preserved (no HTML corruption)
- [ ] Links clickable (especially unsubscribe)
- [ ] Reply-To header set correctly
- [ ] Sender name displays as "Homeport" (not "homeport@shipyard.ai")

---

## Phase 6: Monitoring and Warm-Up

### Step 6.1: Domain Warm-Up Strategy

**Purpose:** Build sender reputation gradually to avoid spam filters.

**Recommendation (first 30 days):**

| Days | Action | Purpose |
|------|--------|---------|
| 1-3 | Send 5-10 test emails | Verify setup, check delivery |
| 4-7 | Send to internal team (5) | Test unsubscribe, reply-to |
| 8-30 | Ramp to 20-50 emails/day | Build reputation gradually |
| 30+ | Send all accumulated projects | Full production volume |

**Why warm up?**
- New domains have no sending history
- ISPs (Gmail, Yahoo, Outlook) monitor sender behavior
- Gradual volume increase = trusted sender signal
- Sudden large volume = spam filter trigger

---

### Step 6.2: Monitor Resend Dashboard Daily

**Key metrics to track (first 30 days):**

1. **Delivery Rate** (should be >95%)
   - Location: Analytics → Delivery Status
   - Expected: "Delivered" for all emails
   - Action if <95%: Check DNS, review content for spam triggers

2. **Bounce Rate** (should be 0%)
   - Location: Analytics → Bounces
   - Expected: No bounced emails
   - Action if >0%: Review recipient list for invalid emails

3. **Spam Complaint Rate** (should be 0%)
   - Location: Analytics → Complaints
   - Expected: No complaints
   - Action if >0%: Review email copy for aggressive language

4. **Unsubscribe Rate** (should be <5% in first 7 days)
   - Location: Analytics → Unsubscribes
   - Expected: <5% initially, stabilize around 2-3%
   - Action if >10%: Consider rewriting email copy (Steve to review)

---

### Step 6.3: Set Up Resend Alerts (Optional)

**In Resend Dashboard → Settings → Notifications:**

1. Enable email notifications for:
   - [ ] High bounce rate (>5%)
   - [ ] High complaint rate (>0%)
   - [ ] Delivery failures

2. Assign notification recipient: `elon@shipyard.ai` (or operations email)

---

## Phase 7: CAN-SPAM Compliance

### Step 7.1: Email Footer Requirements

**Legal requirement:** CAN-SPAM Act requires:
1. ✅ Clear sender identification (`Homeport <homeport@shipyard.ai>`)
2. ✅ One-click unsubscribe mechanism (in Worker unsubscribe endpoint)
3. ✅ Unsubscribe link in every email footer
4. ✅ Physical mailing address (optional, can be omitted if commitment to honor opt-outs is clear)

**Recommended email footer:**
```
---
Homeport by Shipyard
https://shipyard.ai

Unsubscribe: https://homeport.shipyard.ai/unsub?token=[encoded_email]
```

**Implementation note:** Unsubscribe link handled by Worker unsubscribe endpoint (built in Wave 2).

---

### Step 7.2: Resend Built-In Unsubscribe (Optional)

**Resend can automatically append unsubscribe links:**

In API request, add:
```typescript
headers: {
  "List-Unsubscribe": "<https://homeport.shipyard.ai/unsub?token=[token]>"
}
```

This tells email clients to show "Unsubscribe" button in email header.

**Advantage:** One-click unsubscribe in Gmail, Outlook, etc.

---

## Expected DNS Records Summary

**After successful setup, your DNS should contain:**

```dns
; SPF Record
@ TXT "v=spf1 include:resend.com ~all"

; DKIM Record
default._domainkey CNAME [resend-dkim-hostname].dkim.resend.domains

; DMARC Record
_dmarc TXT "v=DMARC1; p=none; rua=mailto:dmarc@shipyard.ai"
```

**Verify with:**
```bash
dig shipyard.ai MX
dig shipyard.ai TXT
dig default._domainkey.shipyard.ai CNAME
dig _dmarc.shipyard.ai TXT
```

---

## Verification Checklist

**Before proceeding to Wave 2 (Worker build), verify:**

- [ ] **Resend Account**
  - [ ] Account created and verified
  - [ ] Dashboard accessible
  - [ ] Workspace ready

- [ ] **Domain Authentication**
  - [ ] Domain added to Resend (`shipyard.ai`)
  - [ ] SPF record added to DNS and verified (✅ in Resend dashboard)
  - [ ] DKIM record added to DNS and verified (✅ in Resend dashboard)
  - [ ] DMARC record added to DNS and verified (✅ in Resend dashboard)
  - [ ] Domain status shows "Active" or "Verified" in Resend

- [ ] **API Key**
  - [ ] API key generated and copied
  - [ ] Key stored securely (not committed to Git)
  - [ ] Key format: `re_[alphanumeric]`

- [ ] **Deliverability Testing**
  - [ ] Test email sent and received successfully
  - [ ] Mail-Tester score ≥9.0
  - [ ] SPF, DKIM, DMARC all pass in Mail-Tester
  - [ ] Plain text formatting correct
  - [ ] Unsubscribe link functional

- [ ] **CAN-SPAM Compliance**
  - [ ] Email footer includes unsubscribe link
  - [ ] Sender display name is "Homeport"
  - [ ] Reply-To address configured

---

## Troubleshooting

### Problem: DNS Records Not Propagating

**Symptom:** Resend dashboard shows "Pending" after 2+ hours

**Solutions:**
1. Verify record syntax in DNS provider (no typos)
2. Clear DNS cache: `sudo systemctl restart systemd-resolved` (Linux)
3. Wait 24 hours (some ISPs cache aggressively)
4. Use `dig` to manually check: `dig default._domainkey.shipyard.ai CNAME`
5. Contact DNS provider support if records visible but Resend still shows pending

---

### Problem: Emails Landing in Spam

**Symptom:** Test email arrives in Spam folder, not Inbox

**Diagnosis:**
1. Check Mail-Tester score (if <8.0, fix DNS records first)
2. Review email content for spam trigger words
3. Check Resend dashboard → Logs for bounce/complaint details
4. Review domain reputation (new domains may have lower trust)

**Solutions:**
1. Ensure all DNS records (SPF, DKIM, DMARC) are verified ✅
2. Wait 48 hours for domain reputation to build
3. Send from gradually warming domain (5 → 50 → 500 emails)
4. Remove trigger words from email copy (reviewed by Steve)
5. Retest with Mail-Tester

---

### Problem: API Key Not Working

**Symptom:** Resend API returns 401 Unauthorized

**Solutions:**
1. Verify API key format: starts with `re_`
2. Verify Bearer token in request: `Authorization: Bearer re_[key]`
3. Regenerate API key if compromised (old key revoked)
4. Check that key has "Full access" scope in Resend dashboard
5. Ensure `Content-Type: application/json` header in request

---

### Problem: Unsubscribe Link Not Working

**Symptom:** Clicking unsubscribe doesn't prevent future emails

**Solution:** Unsubscribe mechanism built in Wave 2 Worker. Coordinate with Elon during Worker build phase.

---

## Next Steps (Wave 2 / Wave 3)

### Wave 2: Worker Implementation
- Elon builds Cloudflare Worker with Resend API integration
- Uses API key generated in this phase
- Implements unsubscribe mechanism
- Scheduled cron job for daily email checks

### Wave 3: Wrangler Deployment
- API key stored as Wrangler secret: `wrangler secret put RESEND_API_KEY`
- Worker deployed to production
- KV store populated with project data
- Email delivery begins

---

## References

- **Resend Documentation:** https://resend.com/docs
- **Resend API Reference:** https://resend.com/docs/api-reference
- **SPF Record Guide:** https://mxtoolbox.com/spf.aspx
- **DKIM Setup:** https://resend.com/docs/dkim
- **DMARC Guide:** https://resend.com/docs/dmarc
- **Mail-Tester:** https://www.mail-tester.com
- **CAN-SPAM Compliance:** https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business

---

## Document Control

**Created:** April 16, 2026
**Status:** Pre-Build Setup Documentation
**Owner:** Elon Musk (technical setup) + Phil Jackson (verification)
**Last Updated:** April 16, 2026

**Related Documents:**
- `/home/agent/shipyard-ai/rounds/shipyard-post-ship-lifecycle/decisions.md` — Locked decisions (reference Section 4.2)
- `/home/agent/shipyard-ai/CODEBASE_SCOUT_REPORT_HOMEPORT.md` — Resend integration patterns (Section 2)
- `/home/agent/shipyard-ai/workers/contact-form/src/index.ts` — Resend API integration example (lines 123-146)

---

**End of Resend Setup Guide**
