# Shipyard Self-Serve Intake - Demo Script

**Duration:** 2 minutes

---

NARRATOR: It's 3 AM. Your platform just went down. Customers are screaming. And somewhere, a product manager is typing this into GitHub:

[SCREEN: GitHub issue]
```
Title: URGENT - Payment processing completely broken
Body: Users can't checkout. Lost 50k in revenue already.
      This is affecting enterprise customers. NEED FIX NOW.
```

NARRATOR: She labels it "intake-request." Hits submit. And waits.

[SCREEN: Loading spinner, then instant bot response]

NARRATOR: Three seconds later, Shipyard's already read it. Analyzed it. And posted this:

[SCREEN: Bot comment appears]
```
🚨 Priority: P0 - Critical Production Issue

Detected: Payment system failure, revenue impact, enterprise customers affected
SLA: 2-hour response required
Escalation: On-call engineer notified
```

NARRATOR: No human read that issue yet. The bot did.

[SCREEN: Split screen - PRD document generating in real-time]

NARRATOR: While the engineer's still rubbing sleep from their eyes, Shipyard's writing the PRD.

[SCREEN: PRD sections populate rapidly]
```
## Problem
Payment processing endpoint returning 500 errors...

## Impact Analysis
- 50+ affected transactions
- $50k revenue loss
- Enterprise SLA breach risk

## Suggested Investigation
1. Check payment gateway logs
2. Review recent deploy to checkout service
3. Verify database connection pool...
```

NARRATOR: It knows this is P0 because it read "completely broken" and "enterprise customers." It parsed "50k in revenue" and understood that matters. It didn't wait for the morning standup.

[SCREEN: GitHub issue sidebar shows updated labels: "p0", "payment-system", "engineering"]

NARRATOR: The webhook fired. The signature validated. The content analyzer ran. Priority rules applied. PRD generated. All before she refreshed the page.

[SCREEN: Engineer's phone lights up with notification]

NARRATOR: Here's what the engineer sees when she opens her laptop:

[SCREEN: Full GitHub issue with bot's structured breakdown]

NARRATOR: Not a wall of panicked text. A structured incident brief. With priority. With context. With next steps.

[SCREEN: Terminal shows webhook logs scrolling]
```
[INFO] Webhook signature validated
[INFO] Analyzing issue content...
[INFO] Detected priority indicators: ["broken", "enterprise", "revenue"]
[INFO] Classification: P0 - Critical
[INFO] PRD generated in 2.3s
[INFO] Bot response posted
```

NARRATOR: Every line is HMAC-validated. Every signature timing-safe. Every failure logged. Because the last thing you need at 3 AM is a forged webhook creating phantom fires.

[SCREEN: Split screen - two more issues come in simultaneously]
```
Issue #847: "Nice to have: Add dark mode to settings"
Issue #848: "Login page won't load on mobile Safari"
```

[SCREEN: Both process instantly with different priorities]
```
#847 → P2 (Enhancement)
#848 → P1 (User-Facing Bug, Mobile Critical)
```

NARRATOR: Shipyard doesn't just triage one fire. It triages all of them. Instantly. Accurately. While you're still brewing coffee.

[SCREEN: Dashboard showing all three issues categorized and prioritized]

NARRATOR: Your PM typed eight sentences. Shipyard gave your team a battle plan.

[SCREEN: Fade to logo]

**SHIPYARD**
*From issue to action. Instantly.*

---

[END]
