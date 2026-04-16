# Demo Script: Membership Production Fix

**Runtime:** 2 minutes

---

[SCREEN: Dashboard showing "Revenue: $0. Active Members: 387. Churn Rate: ???"]

NARRATOR: Three hundred eighty-seven paying members. Zero visibility into revenue.

[SCREEN: Close-up of admin clicking through endless Stripe tabs]

We're logging into Stripe. Exporting CSVs. Cross-referencing subscriber IDs by hand. We don't know who's churning. We don't know why.

[SCREEN: Slack message: "Hey, can we add team accounts? Client wants to buy 15 seats."]

Client wants group memberships. We've got nothing. Tell them "maybe next quarter."

---

[SCREEN: Refresh. Dashboard now shows real numbers: "MRR: $12,450. Revenue (30 days): $18,200. Churn Rate: 3.2%"]

NARRATOR: Hit refresh.

[SCREEN: Bar chart animates in — revenue by date, spikes and dips visible]

There's your revenue. By date. By plan. Monthly recurring locked in.

[SCREEN: Click "Churn Report"]

Three-point-two percent churn. Retention at ninety-seven. We know who left. We know when.

[SCREEN: Click "Members Report" — filterable table with real data]

Filter by plan. Filter by status. Search by email. Pagination built in. No exports. No spreadsheets.

---

[SCREEN: Click "Create Group Membership"]

NARRATOR: Client wants fifteen seats?

[SCREEN: Form fills out: "Acme Corp. Pro Plan. 15 seats. Admin: sarah@acme.com"]

Create the group. Send the invite link.

[SCREEN: Invite URL copies to clipboard]

Sarah invites her team. They sign up. We track it.

[SCREEN: Group dashboard shows 11/15 seats filled]

Eleven out of fifteen. Four seats left. One subscription. One invoice.

---

[SCREEN: Click "Developer Webhooks"]

NARRATOR: You want to pipe this into *your* system?

[SCREEN: Webhook form: "URL: https://api.yourapp.com/hooks", Events: "member.created, member.cancelled"]

Register a webhook. Pick your events.

[SCREEN: Webhook fires — payload with member data, HMAC signature visible]

Member signs up, you get the payload. Signed. Verified. Real-time.

[SCREEN: Webhook logs — timestamp, status code, response body]

Logs every call. You see what fired. You see what failed.

---

[SCREEN: Split-screen: Old dashboard (empty) vs. New dashboard (revenue charts, churn metrics, group breakdown)]

NARRATOR: Before: spreadsheets and guesswork.

Now: revenue tracked. Churn measured. Groups managed. Webhooks firing.

[SCREEN: Dashboard zoom to MRR number updating live: "$12,450 → $12,549"]

You know what's happening. The second it happens.

---

**[END]**
