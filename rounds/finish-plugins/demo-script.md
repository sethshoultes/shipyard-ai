# Membership Plugin Demo Script
## 2-Minute Product Walkthrough

**Runtime:** 2:00
**Tone:** Walk and talk. Personal. Urgent where it needs to be, quiet where it lands.

---

[SCREEN: An inbox. 147 unread. Subject lines scroll by: "Can you add me manually?" ... "My card got declined, now what?" ... "I thought I cancelled?" ... "Where's my premium content?"]

NARRATOR:
You know what nobody tells you about running a membership site? It's not the content. The content you're good at. It's the *other* 47 jobs you didn't sign up for.

[SCREEN: Cut to a Notion doc titled "Member Tracking." Rows and rows of emails, dates, handwritten notes: "PAID - venmo" ... "gave free access - ask Mark" ... "expired??" with three question marks.]

NARRATOR:
You've become a bookkeeper. A payment processor. A customer service rep. And somewhere in there, occasionally, when you have time, a creator.

[SCREEN: A sticky note on a monitor: "Tuesday: cancel Jenny's subscription (she emailed)." Another sticky: "Check if Dan's card went through."]

NARRATOR:
This is what membership looks like when you build it yourself. Sticky notes. Manual email. Fingers crossed.

[SCREEN: A text message from a friend: "Hey, your member login is broken again." Timestamp: 11:47 PM.]

NARRATOR:
And when something breaks—because something always breaks—it breaks at 11:47 on a Tuesday night.

[SCREEN: Fade to black. One beat. Two. Then—the EmDash admin panel appears. Clean. Quiet. Empty in a good way.]

NARRATOR:
Okay. Different approach.

[SCREEN: The terminal. Someone types: `npm install @shipyard/membership`. Press enter. Packages install. Done.]

NARRATOR:
This takes about forty-five seconds.

[SCREEN: The astro.config file. Three lines added. Save.]

NARRATOR:
And this takes about ten.

[SCREEN: The EmDash admin panel now shows a new sidebar item: "Members."]

NARRATOR:
Now you have a membership system. Real one. Let me show you what that means.

[SCREEN: Click "Plans." A simple interface. User clicks "Add Plan." Types "Pro" — $12/month. Adds features: "All posts. Discord access. Monthly Q&A."]

NARRATOR:
You make a plan. Pro, twelve bucks a month, whatever features you want to list. That's your product now. It exists.

[SCREEN: The content editor. A blog post. User selects a section of text—a deep-dive analysis. Right-clicks. "Gate this content." Selects "Pro plan."]

NARRATOR:
And this—this is the part I love. You've got free content. You've got premium content. The difference used to be: a developer quote and three weeks of your life. Now it's a right-click.

[SCREEN: A lock icon appears on the gated section. Clean. Subtle.]

NARRATOR:
Pro members see it. Everyone else sees what they're missing.

[SCREEN: Cut to the public site. A reader scrolls. They hit the gated section. It says: "This section is for Pro members. Join now."]

NARRATOR:
Here's your customer.

[SCREEN: They click "Join." A modal appears. Just an email field. They type their email.]

NARRATOR:
Just their email. No password to forget. No "verify your inbox" purgatory.

[SCREEN: Stripe Checkout appears. They enter a card. Click "Pay $12."]

NARRATOR:
Stripe handles the money. Because Stripe is very, very good at handling money.

[SCREEN: Success. The page reloads. The locked content is now visible. A welcome email notification pops up in the corner.]

NARRATOR:
They're in. Content unlocked. Welcome email sent. Subscription active. All of it—automatic.

[SCREEN: Back to admin. The Members table now shows one entry. Email, plan, status: Active, next billing date, payment method.]

NARRATOR:
And you? You see everything. Who's paying. What plan. When they renew. You're not checking Stripe and cross-referencing a spreadsheet. It's one table. The truth.

[SCREEN: Quick cuts—]
- A failed payment notification
- The member gets an email: "Update your payment method"
- They click. Add a new card. Status: Active again.

NARRATOR:
Failed payment? They get an email. They fix it. You don't have to chase anyone down.

[SCREEN: Quick cuts continue—]
- Admin creates coupon: "LAUNCH" — 20% off, expires in 7 days
- A member upgrades from Free to Pro with one click in their portal
- Drip content settings: "Module 2 unlocks 7 days after signup"

NARRATOR:
Coupons. Upgrades. Drip content that unlocks on a schedule. The stuff that used to be "Phase Two" of your project? It's already there.

[SCREEN: The reporting dashboard. MRR: $1,847. Active members: 156. Churn rate: 3.2%. A chart shows steady growth.]

NARRATOR:
And this.

[SCREEN: Slow push in on the numbers.]

NARRATOR:
This is what it looks like when you know. Not "I think we're doing okay." Not "let me check the spreadsheet." You know. Monthly recurring revenue. Churn. The numbers that tell you whether this thing is working.

[SCREEN: The dashboard, full view. Members. Plans. Reports. Everything in one place.]

NARRATOR:
You spent years getting good at making things people want. You shouldn't have to spend another year learning to get paid for it.

[SCREEN: Back to that inbox from the opening. But now—it's different. Calm. Normal emails. The member management emails are gone. Because the system handles them.]

NARRATOR:
Those 47 other jobs you didn't sign up for?

[SCREEN: The EmDash logo fades in.]

NARRATOR:
Let the software do them.

[SCREEN: Text appears: "Membership for EmDash. npm install @shipyard/membership"]

NARRATOR:
Start today. Be done by lunch.

[SCREEN: Fade to black.]

---

**[END]**

---

## Production Notes

**Runtime:** 2:00
**Pacing:** Opens claustrophobic—the inbox, the sticky notes, the chaos. Releases when the solution appears. Builds confidence through the walkthrough. Lands warm and quiet.
**VO Direction:** This isn't a pitch. It's someone who's been where you are, telling you there's a better way. Conversational. Some lines almost thrown away ("That's your product now. It exists."). The close should feel like permission.
**Music:** Starts tense/cluttered ambient. Clears at "Different approach." Builds through features. Resolves with space.
**Key visual rhythm:** Chaos → Clarity → Capability → Calm
