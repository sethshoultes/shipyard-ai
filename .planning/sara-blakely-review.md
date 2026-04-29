# Sara Blakely Gut-Check — Relay v1

## Verdict
Buildable. Over-engineered. Needs a customer before Wave 4.

## Would someone pay?
Yes. Inbox dread is real. But not for this complexity. A small agency with 50+ weekly form submissions would pay $29–$49/month. Under that, they'd rather just check email.

## Confusing / Bounce-worthy
- "Unclassified" badge for minutes after form submit. Customer thinks it's broken.
- 9 tasks, 4 waves, caching layer, cron jobs, encryption, taxonomies — for v1? No.
- "Steve Jobs called it the reason to survive" — embarrassing. Delete.
- Target is "cheapest shared hosting" yet requires Claude API key, cron, and REST endpoints. Friction city.
- No pricing page, no free trial length, no "first 100 classifications free." How do they buy?

## 30-Second Pitch
"Relay reads your website forms and sorts hot leads from spam instantly, so you respond to money while it's still warm."

## $0 Marketing Test
1. Go to 10 local service businesses (roofers, lawyers, dentists).
2. Offer to manually sort their last 100 form submissions into Sales/Support/Spam for free.
3. Ask: "Would you pay $39/month to never do this again?"
4. Get 3 yeses with credit cards. Then build.

## Retention Hook
Time-to-lead. If Relay shaves response time from hours to minutes, revenue goes up. Show that metric in a weekly email: "You responded to 12 hot leads 4x faster this week." Money talks. Inbox zero doesn't.

## Brutal Honest Note
You're building a racecar when customers need a bicycle. Cut v1 to: intercept form → send to Claude → display result. No cron. No cache. No AJAX polling. If it breaks under load, you have customers to fund v2.
