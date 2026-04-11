# Membership Plugin Demo Script
## 2-Minute Product Walkthrough

**Written by:** Aaron Sorkin *(style)*
**Runtime:** 2:00
**Tone:** Urgent, human, crackling. Not a pitch deck—a walk and talk.

---

[SCREEN: Black. A cursor blinks in the dark.]

NARRATOR:
It's 2 AM. You've been building your online course for six months. The videos are done. The workbooks are done. The thing is *good*. You know it's good.

[SCREEN: A beautiful course landing page fades in. "Advanced Photography Masterclass — $299"]

NARRATOR:
But now you need the part nobody warned you about. The part where someone actually *pays* you.

[SCREEN: Google search results cascade down: "Stripe integration tutorial"... "How to gate content WordPress"... "Build membership site from scratch"... Stack Overflow threads. YouTube tutorials. A developer quote: "$8,500 to $15,000."]

NARRATOR:
You need a payment system. You need user accounts. You need login flows, password resets, email confirmations, subscription management, failed payment handling, coupon codes, and—oh yeah—you'd like people to actually *access* the thing they paid for. Which means content gating. Which means more code. Which means...

[SCREEN: The clock now reads 4:47 AM. Coffee cup empty. Browser tabs: 23.]

NARRATOR:
...you're not a developer. You're a photographer. And you're starting to wonder if maybe you should just sell prints instead.

[SCREEN: Hard cut to black. Beat. Then—EmDash admin panel appears. Clean. Bright. A fresh start.]

NARRATOR:
Here's another way.

[SCREEN: Terminal window. User types: `npm install @shipyard/membership`]

NARRATOR:
One line. That's it. The Membership plugin drops into your EmDash site like it was always supposed to be there.

[SCREEN: `astro.config.mjs` opens. Three lines added. Save. File closes.]

NARRATOR:
Three lines of config. You're not writing a payment system. You're *turning one on*.

[SCREEN: EmDash admin → Membership → Plans. User creates "Pro Plan — $29/month" with features list]

NARRATOR:
Create a plan. Free tier. Monthly. Yearly. Whatever fits your business. Name it. Price it. List the features. Done.

[SCREEN: `.env` file. User pastes Stripe keys, Resend API key. Save.]

NARRATOR:
Your Stripe keys. Your email service. That's the last time you'll touch infrastructure.

[SCREEN: The course page in the editor. User highlights a paragraph, right-clicks: "Gate Content → Pro Members Only"]

NARRATOR:
Now watch this. You see that premium content? The stuff people should pay for? Highlight it. Right-click. Pick the plan.

[SCREEN: The section now shows a subtle lock icon. Preview mode displays: "Upgrade to Pro to access this exclusive guide."]

NARRATOR:
That paragraph? Pro members only. The rest of your page stays public. You didn't write an `if` statement. You didn't Google "JWT authentication flow." You just... *pointed at what you wanted to protect*.

[SCREEN: New browser window. A visitor arrives at the course page. They scroll. They're interested.]

NARRATOR:
Here's what your customer sees.

[SCREEN: Visitor clicks "Join Pro" → Clean modal with email field → They type their email]

NARRATOR:
Email. That's all we ask. No password to create. No "verify your account" email purgatory. Just their email.

[SCREEN: Stripe Checkout opens. Clean. Professional. Card number entered. "Pay $29" clicked.]

NARRATOR:
Stripe handles the payment. PCI compliance. Fraud detection. The stuff you *really* don't want to build yourself.

[SCREEN: Success page. "Welcome to Pro!" The course page reloads. The locked content is now visible, readable, *theirs*.]

NARRATOR:
And just like that—they're in. Content unlocked. Welcome email sent. Subscription live. JWT cookie set. They didn't see any of that machinery. They just see: "I'm a member now."

[SCREEN: Admin panel → Members table. The new member appears. Status: Active. Plan: Pro. Stripe ID. Next billing date. Payment method: Visa •••• 4242]

NARRATOR:
On your side? You see everything. Who joined. What plan. When they're renewing. How they paid. It's all there. One table. No spreadsheet required.

[SCREEN: Fast montage—]
- Email arrives: "Your Pro membership renews in 7 days"
- Admin panel: Creating coupon "LAUNCH20 — 20% off"
- Content schedule: "Module 3 unlocks in 4 days" (drip content)
- Member portal: "Upgrade to Premium" button clicked
- Revenue dashboard: "$4,847 MRR" with upward graph

NARRATOR:
Renewal reminders go out automatically—seven days before charge. Coupons take thirty seconds to create. Drip content releases on your schedule, not theirs. Members can upgrade themselves. And you? You get the dashboard you actually want to check.

[SCREEN: The Member Portal. Clean design. "Your Plan: Pro. Next billing: May 5th. Update payment method." Accessible, professional, *respects the user*.]

NARRATOR:
Your members get a real portal. Their plan. Their billing. Their payment method. No "please email support@" to make changes. They're paying customers. The software should treat them that way.

[SCREEN: Quick flash—Failed payment email with "Update Payment Method" button. Member clicks. Card updated. Status returns to Active.]

NARRATOR:
Failed payment? They get an email. Link to fix it. Card updated. Back in business. No support ticket. No awkward conversation. The system handles it because *that's what systems should do*.

[SCREEN: Return to the photographer's course page. Golden hour light. 847 members now. Comments section: "This changed how I see light." "Worth every penny." "When's the next course?"]

NARRATOR:
Remember where we started? 2 AM. A photographer who just wanted to teach what she knows.

[SCREEN: The same landing page. "1,247 members" badge. The creator is asleep. The system is processing a payment in Tokyo.]

NARRATOR:
She's not debugging Stripe webhooks at midnight anymore. She's not Googling "JWT refresh token expired." She's not on Stack Overflow trying to understand why her authentication broke.

She's shooting photos. She's teaching students. She's *doing the thing*.

[SCREEN: EmDash logo appears. Tagline fades in: "Build it. Gate it. Get paid."]

NARRATOR:
Membership for EmDash. One plugin. Everything you need. Nothing you don't.

[SCREEN: Terminal. Cursor blinks. Then types itself: `npm install @shipyard/membership`]

NARRATOR:
Start now.

[SCREEN: Fade to black.]

---

**[END]**

---

## Production Notes

**Runtime:** 2:00
**Tone:** Urgent, personal, human. The narrator is a friend who's been through this, not a spokesperson reading copy.
**Pacing:** Fast in the problem section (feel the overwhelm), slows down when the solution appears (let it breathe), accelerates through features (momentum), lands softly on the emotional payoff.
**Music suggestion:** Starts tense/ambient, opens up at the "Here's another way" beat, builds through the walkthrough, resolves warm.
**VO direction:** Conversational. Some lines almost muttered ("You're not a developer. You're a photographer."). Some lines punched ("One line. That's it."). The "wow moment" at the end should feel like exhaling.
