# Anchor Client Database — Notion Template

**Purpose:** Single source of truth for all post-delivery client tracking.
**Mitigates Risk:** "No one follows through on manual processes" (HIGH/CRITICAL)

---

## Why Notion (Not Spreadsheet)

Per Decision #3:
- **O(1) setup per client:** Add one row, all reminder dates auto-calculate
- **Built-in automation:** Notion can trigger reminders
- **Single source of truth:** No duplicate calendars or scattered events
- **Daily task view:** One glance shows everything due today

---

## Database Schema

### Properties

| Property | Type | Description | Required |
|----------|------|-------------|----------|
| **Client Name** | Text | Client's name (e.g., "Sarah Chen") | Yes |
| **Project Name** | Text | Project identifier (e.g., "Bella's Bistro") | Yes |
| **URL** | URL | Live site URL | Yes |
| **Launch Date** | Date | Day site went live | Yes |
| **Email 1 (Day 0)** | Checkbox | Launch Day email sent | Auto |
| **Email 1 Sent Date** | Date | When Email 1 was sent | Auto |
| **Email 2 (Day 7)** | Checkbox | Day 7 check-in sent | Auto |
| **Email 2 Due Date** | Formula | Launch Date + 7 days | Auto |
| **Email 3 (Day 30)** | Checkbox | Day 30 refresh sent | Auto |
| **Email 3 Due Date** | Formula | Launch Date + 30 days | Auto |
| **Email 4 (Month 6)** | Checkbox | Month 6 review sent | Auto |
| **Email 4 Due Date** | Formula | Launch Date + 182 days | Auto |
| **Maintenance Tier** | Select | None / Anchor Basic / Anchor Pro | Manual |
| **Monthly Tokens** | Number | Token allowance based on tier | Auto |
| **Tokens Used (Lifetime)** | Number | Total tokens used on this client | Manual |
| **Notes** | Text | Any additional context | Optional |
| **Status** | Select | Active / Churned / Paused | Manual |

---

## Formula Fields

### Email 2 Due Date (Day 7)
```
dateAdd(prop("Launch Date"), 7, "days")
```

### Email 3 Due Date (Day 30)
```
dateAdd(prop("Launch Date"), 30, "days")
```

### Email 4 Due Date (Month 6)
```
dateAdd(prop("Launch Date"), 182, "days")
```

### Monthly Tokens (Auto from Tier)
```
if(prop("Maintenance Tier") == "Anchor Pro", 200000,
  if(prop("Maintenance Tier") == "Anchor Basic", 50000, 0))
```

### Next Action Due
```
if(not prop("Email 1 (Day 0)"), prop("Launch Date"),
  if(not prop("Email 2 (Day 7)"), prop("Email 2 Due Date"),
    if(not prop("Email 3 (Day 30)"), prop("Email 3 Due Date"),
      if(not prop("Email 4 (Month 6)"), prop("Email 4 Due Date"),
        dateAdd(now(), 365, "days")))))
```

---

## Views

### 1. Emails Due Today (DAILY CHECK)

**Filter:**
- Next Action Due = Today
- Status = Active

**Sort:** Next Action Due (ascending)

**Visible Properties:**
- Client Name
- Project Name
- URL
- Which email is due (derived)

**Usage:** Open this view every morning. Send what's due.

### 2. All Active Clients

**Filter:**
- Status = Active

**Sort:** Launch Date (descending)

**Visible Properties:** All

**Usage:** Overview of all active relationships.

### 3. Maintenance Clients

**Filter:**
- Maintenance Tier ≠ None
- Status = Active

**Sort:** Maintenance Tier (Anchor Pro first)

**Visible Properties:**
- Client Name
- Project Name
- Maintenance Tier
- Monthly Tokens
- Tokens Used

**Usage:** See who's paying for maintenance.

### 4. Overdue Emails

**Filter:**
- Next Action Due < Today
- Status = Active

**Sort:** Next Action Due (ascending)

**Visible Properties:**
- Client Name
- Which email is overdue
- Days overdue

**Usage:** Catch-up on anything missed.

---

## Onboarding Workflow (O(1) Setup)

When a project launches:

1. **Add new row to database**
2. **Fill in:**
   - Client Name
   - Project Name
   - URL
   - Launch Date (today)
3. **Check Email 1 (Day 0) box** immediately
4. **Send Launch Day email**
5. **Done.** All future dates auto-calculate.

**Time per client:** 2 minutes max.

---

## Automation Setup (Notion Automations)

### Option A: Notion Native Automations

Create automations for email reminders:

**Automation 1: Day 7 Reminder**
- Trigger: When "Email 2 Due Date" is today
- Condition: "Email 2 (Day 7)" is unchecked
- Action: Send notification to workspace member

**Automation 2: Day 30 Reminder**
- Trigger: When "Email 3 Due Date" is today
- Condition: "Email 3 (Day 30)" is unchecked
- Action: Send notification

**Automation 3: Month 6 Reminder**
- Trigger: When "Email 4 Due Date" is today
- Condition: "Email 4 (Month 6)" is unchecked
- Action: Send notification

### Option B: Zapier/Make Integration

If Notion native automations insufficient:
1. Connect Notion to Zapier
2. Trigger: Daily at 9 AM
3. Filter: Find rows where Next Action Due = Today
4. Action: Send Slack message or email to team

---

## 48-Hour Follow-Up Check

**Process:**

1. After sending any email, set a personal reminder for 48 hours
2. Check if client replied
3. If no reply and it's a hard-CTA email (Day 0, Day 30):
   - Consider a brief follow-up: "Just checking this landed—any questions?"
4. Log follow-up in Notes field

---

## Escalation Protocol

**If 2+ consecutive emails missed:**

1. Review why (vacation? forgot?)
2. Consider automation upgrade (see Phase 2 roadmap)
3. At 15 clients: evaluate Zapier automation
4. At 25 clients: deploy automated email sends
5. At 50 clients: transition to full CRM

---

## Sample Data Entry

| Client Name | Project Name | URL | Launch Date | Email 1 | Email 2 Due | Maintenance Tier |
|-------------|--------------|-----|-------------|---------|-------------|------------------|
| Sarah Chen | Bella's Bistro | bellabistro.com | 2026-04-12 | ✓ | 2026-04-19 | Anchor Basic |
| Mike Johnson | Peak Dental | peakdental.com | 2026-04-10 | ✓ | 2026-04-17 | None |
| Lisa Wang | Craft & Co | craftandco.shop | 2026-04-05 | ✓ | ✓ | Anchor Pro |

---

## Edge Cases

### Client Requests Early Email
Send it early, mark checkbox, add note explaining why.

### Client Opts Out of Emails
Set Status to "Paused" and add note. Respect the request.

### Client Churns Mid-Sequence
Set Status to "Churned". Stop sending emails.

### Multiple Projects Same Client
One row per project. Link via Client Name.

---

*Per Decision #3: Notion database, not spreadsheet. O(1) setup per client.*
*Addresses Risk: "No one follows through on manual processes" (HIGH/CRITICAL)*
