# Shonda's Retention Roadmap: EventDash v1.1
## What Keeps Users Coming Back

**Author:** Shonda Rhimes
**Date:** April 16, 2026
**Context:** Post-entrypoint fix, pre-product-market fit

---

## The Current Problem

EventDash v1.0 has working code but zero retention mechanics.

**What's missing:**
- No reason to return tomorrow
- No emotional investment in the outcome
- No incomplete loops that create anticipation
- No content flywheel that drives discovery
- No social proof or community

**Result:** Even if we fix deployment and ship, users try once and ghost.

---

## Retention Fundamentals

### **What brings people back:**

1. **Anticipation** — something coming they care about
2. **Incompletion** — loops opened, not closed
3. **Social stakes** — others see their participation
4. **Variable rewards** — unexpected delights
5. **Identity** — "I'm the person who..."

### **What EventDash lacks today:**

All five. It's transactional: register event → done.

---

## v1.1 Feature Strategy: The Comeback Loop

### **Core insight:**
Event registration isn't the product. **Anticipation of the event** is the product.

Shift from:
- "I registered" (done, closed loop)

To:
- "I'm counting down to this" (open loop, daily check-ins)

---

## v1.1 Features (Ranked by Retention Impact)

### **Tier 1: Must-Have (Ship First)**

#### 1. **Event Countdown Dashboard**

**What it is:**
Homepage widget showing "X days until [Event Name]"

**Why it matters:**
- Creates daily check-in habit
- Anticipation builds over time
- Visual progress (14 days → 7 days → tomorrow!)
- Emotionally ties user to future outcome

**User story:**
*"Sarah registers for yoga retreat. Every morning she checks her Sunrise Yoga site: '9 days until Mountain Retreat.' She feels excitement build. On day of, she's primed to show up."*

**Retention hook:**
Open loop. Countdown incomplete until event happens.

---

#### 2. **Attendee Social Proof**

**What it is:**
Public attendee list (opt-in) with avatars/names

**Why it matters:**
- FOMO: "12 people registered, I should too"
- Social commitment: "My friends see I'm going"
- Community preview: "I'll know these people"
- Identity: "I'm part of this group"

**User story:**
*"Maya sees '23 yogis attending' with smiling faces. Clicks through, recognizes a friend. Registers immediately. Now her face is on the wall—public commitment made."*

**Retention hook:**
Social stakes. Backing out feels harder when others know you're in.

---

#### 3. **One-Click Share Generator**

**What it is:**
"Share My Registration" button → pre-formatted social post

**Why it matters:**
- Content flywheel: attendees recruit attendees
- Organic distribution: social proof spreads
- Host benefits: free marketing per registration
- Attendees benefit: "I'm doing something cool" signal

**Example post:**
*"Just signed up for @SunriseYoga Mountain Retreat! 🧘‍♀️ June 10-12. Who's in? [registration link]"*

**User story:**
*"Carlos registers, hits 'Share to Instagram,' posts in seconds. Three friends see it, two register. Carlos sees '🎉 2 friends joined via your link!' notification. Feels like host, not just attendee."*

**Retention hook:**
Variable reward. Sometimes friends register, sometimes not. Uncertainty drives engagement.

---

### **Tier 2: High-Value (Ship Second)**

#### 4. **Pre-Event Updates Feed**

**What it is:**
Host posts updates → attendees get notifications

**Examples:**
- "What to bring: yoga mat, water bottle, sunscreen ☀️"
- "Meet your instructors: [video]"
- "Weather looks perfect! 🌤️"
- "Only 3 spots left!"

**Why it matters:**
- Re-engages between registration and event
- Builds anticipation through drip content
- Creates host→attendee communication channel
- Prevents "registered and forgot"

**User story:**
*"Sarah registered 2 months ago. Week before event, gets notification: 'Packing list for Mountain Retreat.' Opens site, reads updates, gets excited again. Brings correct gear. Better experience."*

**Retention hook:**
Serialized content. Each update is cliffhanger for next.

---

#### 5. **Post-Event Memory Wall**

**What it is:**
After event ends: photo upload, testimonials, "We were there" badge

**Why it matters:**
- Completes narrative arc (before → during → after)
- User-generated content for next event marketing
- Identity reinforcement: "I'm someone who does retreats"
- Social proof for skeptics

**User story:**
*"Event ends Sunday. Monday, Sarah gets prompt: 'Share your favorite moment from Mountain Retreat.' Uploads sunset yoga photo. Site displays it publicly. Next month, new visitor sees photos, reads testimonials, registers for next retreat."*

**Retention hook:**
Closed loop becomes open loop. "That was amazing" becomes "When's the next one?"

---

#### 6. **Waitlist + Notification Engine**

**What it is:**
Event sells out → "Join Waitlist" → notify if spot opens OR when next event announced

**Why it matters:**
- Captures demand when can't fulfill
- FOMO amplifier: "Sold out" = desirable
- Re-engagement trigger: email when action possible
- Data: see demand before scheduling next event

**User story:**
*"Retreat sells out. Maya joins waitlist. Gets email: 'Someone canceled—spot available for 24 hours!' Registers immediately. OR: 'Next retreat announced—early access for waitlist.' Books before public launch."*

**Retention hook:**
Scarcity + exclusive access. Waitlist members feel VIP.

---

### **Tier 3: Nice-to-Have (Future Iterations)**

#### 7. **Recurring Event Subscription**

**What it is:**
"Auto-register me for all monthly yoga sessions"

**Why it matters:**
- Reduces friction: decide once, attend forever
- Predictable revenue for host
- Habit formation: "First Sunday is yoga"
- Retention ceiling: subscription = commitment

**User story:**
*"Sarah offers monthly full moon yoga. Carlos subscribes: $30/month, auto-registered. Calendar blocks first Sunday automatically. Misses one, no problem—already paid, keeps subscription."*

**Retention hook:**
Sunk cost. Canceling subscription feels like loss.

---

#### 8. **Friend Invite Credits**

**What it is:**
"Bring a friend free" or "Refer 3, get next event free"

**Why it matters:**
- Incentivizes attendee recruitment
- Lowers acquisition cost (attendees do marketing)
- Network effects: friends bring friends
- Social experience > solo experience

**User story:**
*"Maya refers 3 friends to Summer Solstice Yoga. All register. Maya gets free entry to next event. Brings different friend group. Now two social circles overlap—community grows."*

**Retention hook:**
Economic + social. Free stuff + reputation as connector.

---

#### 9. **Host Dashboard: Engagement Score**

**What it is:**
Host sees: "Your attendees are 73% engaged (12/16 viewed updates, 8 shared registration)"

**Why it matters:**
- Feedback loop: host sees what drives engagement
- Gamification for hosts: "How engaged is my community?"
- Data-driven: which updates work? Which events retain?
- Host retention: engaged hosts create better events

**User story:**
*"Sarah sees: 'Your retreat has 85% engagement vs. 60% average.' Feels pride. Sees: 'Update about packing list was most-viewed.' Uses that insight for next event."*

**Retention hook:**
For hosts, not attendees. Keeps hosts using platform.

---

## v1.1 Roadmap: Ship Order

### **Sprint 1: The Comeback Loop (Weeks 1-2)**
1. Event Countdown Dashboard
2. Attendee Social Proof
3. One-Click Share Generator

**Goal:** Users have reason to return daily + spread event organically.

### **Sprint 2: The Engagement Layer (Weeks 3-4)**
4. Pre-Event Updates Feed
5. Post-Event Memory Wall
6. Waitlist + Notification Engine

**Goal:** Fill time between registration and event with touchpoints.

### **Sprint 3: The Retention Ceiling (Weeks 5-6)**
7. Recurring Event Subscription
8. Friend Invite Credits
9. Host Dashboard: Engagement Score

**Goal:** Convert one-time attendees into repeat customers.

---

## Success Metrics

### **v1.0 (current):**
- Sign-ups per event: [unknown]
- Return visits: 0 (no reason to return)
- Social shares: 0 (no share mechanism)
- Days between registration and event: [unknown]

### **v1.1 (target):**
- **Daily active users:** 40% of registered attendees check countdown
- **Social amplification:** 30% of attendees share registration
- **Pre-event engagement:** 60% view at least one update
- **Post-event contribution:** 20% upload photo or testimonial
- **Repeat attendance:** 25% register for second event within 90 days

---

## The Narrative Arc v1.1 Unlocks

### **Before (v1.0):**
1. User discovers event
2. User registers
3. *(14-day void)*
4. User hopefully remembers to attend

**No story. No retention.**

### **After (v1.1):**

**Act 1: Discovery → Commitment**
1. User sees event, reads testimonials (social proof)
2. Sees attendee faces, recognizes friend (FOMO)
3. Registers, shares on Instagram (social stakes)

**Act 2: Anticipation → Engagement**
4. Sees countdown daily (open loop)
5. Gets pre-event updates (serialized content)
6. Invites friend, gets credit (variable reward)

**Act 3: Experience → Identity**
7. Attends event (payoff)
8. Uploads photo to memory wall (contribution)
9. Gets "Next event announced!" email (new loop opens)

**Complete narrative. Retention baked in.**

---

## Why This Matters

**v1.0 answered:** "Can we register people for events?"
**v1.1 answers:** "Can we make people care about coming back?"

One is infrastructure. One is a product.

EventDash isn't event registration software.
**EventDash is anticipation software that happens to use events.**

The countdown, the community, the content, the identity—that's the product.

Registration is just the entry point.

---

## Final Thought

> "You want to know what makes a show people binge?
> It's not plot. It's not budget. It's not stars.
> It's: **What question am I desperate to see answered next?**
>
> v1.0 has no questions.
> v1.1 is full of them:
> - Who else is going?
> - How many days left?
> - Did my friend register?
> - What's the packing list?
> - When's the next one?
>
> Build products that leave people curious.
> They'll come back to find out."

— Shonda Rhimes, April 16, 2026

---

**Next Steps:**

1. Validate assumptions: Interview 5 event hosts about what attendees ask
2. Wireframe countdown + social proof UI
3. Ship Tier 1 features in 2-week sprint
4. Measure: daily return rate before vs. after
5. Iterate based on engagement data

Let's make people excited to come back.
