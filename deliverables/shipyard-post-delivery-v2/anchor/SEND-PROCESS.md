# Anchor Email Send Process

**Purpose:** Step-by-step workflow for sending Anchor emails consistently.
**Target:** 95% on-time send rate (emails sent on correct day)

---

## Daily Workflow

### Morning Check (5 minutes, 9 AM)

1. **Open Notion** → "Emails Due Today" view
2. **Review queue** → See which clients have emails due
3. **Prepare merge data** → Open client record, gather required fields
4. **Send emails** → Copy template, fill merge fields, send
5. **Mark sent** → Check the email checkbox in Notion, add sent date

That's it. 5 minutes if you have 1-2 clients. Scale linearly.

---

## Email Send Checklist (Per Email)

### Step 1: Prepare

- [ ] Open Notion database, find the client row
- [ ] Confirm which email is due (Day 0, Day 7, Day 30, or Month 6)
- [ ] Open correct template from `/anchor/emails/`
- [ ] Gather merge field data:
  - Client name (first name)
  - Site URL
  - Page count (if Day 0)
  - Tokens used (if Day 0)
  - Maintenance link

### Step 2: Compose

- [ ] Create new email in Gmail/Resend
- [ ] Copy template body
- [ ] Replace all merge fields with actual values
- [ ] Read subject line — does it match template?
- [ ] Read body aloud — does it sound human?

### Step 3: Verify Before Sending

- [ ] "We don't disappear" variation in first paragraph? (All emails)
- [ ] Banned fields removed? (No {{FEATURE_LIST}}, no {{REFRESH_SUGGESTION}})
- [ ] CTA matches strategy? (Hard: Day 0, Day 30. Soft: Day 7, Month 6)
- [ ] Payment link is correct and working?
- [ ] URL is correct and site is live?
- [ ] No typos in client name?

### Step 4: Send

- [ ] Send email
- [ ] Confirm sent in outbox

### Step 5: Record

- [ ] Return to Notion
- [ ] Check the email checkbox (e.g., "Email 1 (Day 0)")
- [ ] Add sent date if tracking
- [ ] Add any notes (e.g., "Client was excited, replied same day")

---

## Merge Field Inventory

| Field | Used In | Source | Example |
|-------|---------|--------|---------|
| `{{NAME}}` | All emails | Client record | Sarah |
| `{{URL}}` | All emails | Client record | bellabistro.com |
| `{{PAGE_COUNT}}` | Day 0 only | Project record | 12 |
| `{{TOKENS_USED}}` | Day 0 only | Project record | 245K |
| `{{MAINTENANCE_LINK}}` | All emails | Stripe (fixed) | https://buy.stripe.com/... |

### Maintenance Link Options

**Option A: Direct Payment Link (Anchor Basic)**
```
https://buy.stripe.com/[your-basic-link]
```

**Option B: Landing Page (Shows Both Tiers)**
```
https://shipyard.ai/anchor
```

Choose one approach and use consistently across all emails.

---

## CTA Quick Reference

| Email | Day | CTA Type | Example CTA |
|-------|-----|----------|-------------|
| Launch Day | 0 | **Hard** | "Get started: {{MAINTENANCE_LINK}}" |
| Day 7 | 7 | Soft | "Here if you need us" + P.S. mention |
| Day 30 | 30 | **Hard** | "Get started: {{MAINTENANCE_LINK}}" |
| Month 6 | 182 | Soft | "Ready when you are" + link in body |

---

## Edge Cases

### Client Asks to Skip Emails
- Set Status to "Paused" in Notion
- Add note explaining preference
- Respect the request immediately

### Client Already on Maintenance
- Still send all 4 emails
- Modify language: "As an Anchor member, you can request this anytime"
- Skip the hard sell — they're already converted

### Email Bounces
- Check email address in Notion
- Reach out via alternate channel if available
- Note in record: "Email bounced, alternate contact needed"

### Client Doesn't Respond
- Don't chase after every email
- Continue with scheduled sequence
- If zero response after all 4 emails, consider relationship dormant

### Project Launched But Email Not Ready
- Send Day 0 email within 24 hours, not exactly at launch
- "Your site went live yesterday" works fine

### Multiple Projects Same Client
- One email sequence per project
- Mention specific project/URL in each email
- Don't consolidate unless explicitly requested

---

## Escalation Protocol

### If 1 Email Missed
- Send as soon as discovered
- Adjust subject if needed: "Your site's first week (a day late)"
- Continue with normal sequence

### If 2+ Emails Missed
- Send catch-up email covering what was missed
- Reset cadence from current date
- Review why emails were missed

### If Pattern Emerges (3+ Clients Behind)
- Stop and diagnose
- Is Notion reminders working?
- Do we need automation earlier?
- Consider Zapier integration

---

## Automation Triggers (Future State)

When to add automation (per decisions.md):

| Milestone | Action |
|-----------|--------|
| 15 clients | Evaluate automation tooling (Zapier, Loops) |
| 25 clients | Deploy automated sends |
| 50 clients | Full CRM consideration |

Manual process works until ~25 active clients. Don't over-engineer early.

---

## Quality Standards

### On-Time Send Rate Target: 95%

**Definition:** Email sent within 24 hours of due date.

**Tracking:** Count emails sent vs. emails due each month.

**Acceptable variance:** 1 email late per 20 due = 95%

### Response Tracking (Optional)

Track in Notion Notes:
- Client replied? (yes/no)
- Sentiment? (positive/neutral/negative)
- Action taken? (quoted work/signed up/no action)

Use for quarterly review of email effectiveness.

---

## Voice Consistency Check

Before sending any email, verify:

1. **"We don't disappear" in paragraph 1?** — Must be present
2. **Sounds human when read aloud?** — No robotic phrasing
3. **Would you forward this?** — If not, rewrite
4. **CTA matches strategy?** — Hard or soft per schedule

If any check fails, revise before sending.

---

## 48-Hour Follow-Up (Optional)

For hard-CTA emails (Day 0, Day 30):

1. Set reminder for 48 hours post-send
2. If no reply and email was opened (if trackable):
   - Consider brief follow-up: "Just checking this landed—any questions?"
3. Log follow-up in Notes

Don't overdo follow-ups. One is helpful. Two feels pushy.

---

## Quick Reference Card

**Print this and keep at desk:**

```
ANCHOR EMAIL PROCESS

1. Open Notion → Emails Due Today
2. For each client:
   a. Get merge data from record
   b. Open template from /anchor/emails/
   c. Fill fields, read aloud, send
   d. Mark checkbox, add note
3. Done.

HARD CTA: Day 0, Day 30
SOFT CTA: Day 7, Month 6

TARGET: 95% on-time sends
```

---

*Per REQ-018: Send Process Documentation*
*Per Risk Register: Mitigates "No one follows through on manual processes"*
