# Membership Fix — Demo Script
**Runtime:** ~2 minutes

---

**NARRATOR:**
It's 11:47 PM. You're a creator with 2,000 paying members. You're asleep. And right now — right this second — someone's credit card just declined.

[SCREEN: A Stripe dashboard showing "invoice.payment_failed" at 11:47 PM]

**NARRATOR:**
Her name is Sarah. She joined eight months ago. She's commented on every post you've written. She doesn't know her payment failed. You don't know her payment failed. Nobody knows.

[SCREEN: Email inbox — empty. No notification. Just silence.]

**NARRATOR:**
In three days, Stripe will try again. It'll fail again. Seven days after that, she'll be automatically cancelled. Gone. And the only email she'll ever get? A cold transactional receipt that says "Your subscription has been cancelled."

[SCREEN: Generic Stripe email — "Your subscription to [Product] has been cancelled."]

**NARRATOR:**
No heads up. No "hey, want to update your card?" No second chance. Just... gone.

[SCREEN: Fade to black. Then: "There's a better way."]

**NARRATOR:**
This is what happens when Sarah's card declines now.

[SCREEN: Webhook fires. The system receives "invoice.payment_failed" event.]

**NARRATOR:**
The moment Stripe tells us the payment failed, we catch it.

[SCREEN: Email being composed — warm, personal: "Hi Sarah, We tried to charge your card for your Premium membership, but the payment was declined..."]

**NARRATOR:**
Sarah gets an email. Not from Stripe. From you. In your voice. It says: "Hey, something went wrong with your payment. No rush — your access stays active. Here's a link to fix it whenever you're ready."

[SCREEN: Email with a single orange button: "Update your payment method"]

**NARRATOR:**
One click. That's it. She lands on her member dashboard — her dashboard, not some Stripe portal that looks like a tax form.

[SCREEN: Clean self-serve member portal. Shows: current plan, next renewal date, payment method on file, one-click update button.]

**NARRATOR:**
She can see her plan. She can see when it renews. She can update her card in thirty seconds. And here's the thing —

[SCREEN: Dashboard showing status changing from "Past Due" to "Active" in real-time]

**NARRATOR:**
— the second she does, it just works. Her status updates. She gets a confirmation. You don't lift a finger.

[SCREEN: New email — "Your payment has been received. Your access remains active and uninterrupted. Thank you for being part of our community."]

**NARRATOR:**
But let's say Sarah doesn't update her card. Let's say she's busy. Life happens.

[SCREEN: Calendar showing "3 days before expiration"]

**NARRATOR:**
Three days before her membership expires, she gets another email. Gentle. Not guilt-trippy. Just: "Your membership expires in three days. No pressure — we're here whenever you're ready to rejoin."

[SCREEN: "Expiring Soon" email template]

**NARRATOR:**
And if she does cancel? Fine. People cancel. But she doesn't disappear into the void.

[SCREEN: Farewell email — "We've loved having you as part of our community. If circumstances change, we'd welcome you back with open arms."]

**NARRATOR:**
She gets a real goodbye. A door left open. Because maybe she comes back in six months when things settle down. Maybe she doesn't. But either way — she remembers how you treated her on the way out.

[SCREEN: Return to dashboard — member reactivates with one click, months later]

**NARRATOR:**
Now zoom out.

[SCREEN: Admin dashboard showing member list with status indicators — green "Active," yellow "Past Due," red "Cancelled"]

**NARRATOR:**
You can see every member. Who's active. Who's past due. Who's slipping away. And you can act before they're gone — not after.

[SCREEN: Filter by "Past Due" — shows 12 members. Bulk action: "Send reminder."]

**NARRATOR:**
The people who built your community? They deserve to know when something's wrong. They deserve a way to fix it themselves. They deserve to feel like members — not account numbers.

[SCREEN: Final shot — email arriving in inbox: "Welcome to [Your Community]! Your Premium membership is active."]

**NARRATOR:**
Sarah's still a member.

[SCREEN: Hold on "Active" status badge. Fade out.]

**NARRATOR:**
You slept through the whole thing.

---

**[END]**
