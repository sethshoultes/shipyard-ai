# Shonda's Retention Roadmap: What Keeps Users Coming Back
**EventDash v1.1 Feature Strategy**
**Author:** Shonda Rhimes, Board Member
**Date:** April 16, 2026

---

## The Problem: Events Are Drama, But EventDash Is Flat

**Current state:** EventDash is a database with forms.
- Create event (data entry)
- Register attendees (more data entry)
- View list (spreadsheet)
- Repeat

**Missing:** The emotional arc that makes users addicted.

**Insight:** People don't come back for features. They come back for feelings.

---

## What Keeps Users Coming Back: The Retention Psychology

### 1. **Anticipation** (Before Event)
*"I can't wait to see who's coming!"*

**Current:** Static registration list.

**v1.1 Hooks:**
- **Real-time registration feed:** "Sarah just registered! 🎉" (live updates)
- **Countdown timer:** "3 days until Sunrise Yoga Retreat" (mounting excitement)
- **Capacity milestones:** "You're 80% full! 🔥" (progress dopamine)
- **Social reveals:** "2 of your Instagram followers registered" (connection tease)

**Why it works:** Anticipation creates daily check-in habit. Users log in to see "what's new?"

---

### 2. **Anxiety** (Before Event)
*"What if nobody shows up?"*

**Current:** No visibility into conversion funnel.

**v1.1 Hooks:**
- **Conversion tracking:** "247 views → 18 registrations (7.3%)" (data anxiety)
- **Benchmark comparison:** "Similar events averaged 25 registrations by now" (FOMO)
- **Risk alerts:** "Only 3 registrations with 10 days left" (healthy pressure)
- **Rescue prompts:** "Boost this event? $20 gets 500 targeted impressions" (agency)

**Why it works:** Anxiety drives action. But give users tools to relieve it (ads, email nudges, social shares).

---

### 3. **Relief** (Threshold Achieved)
*"We hit the minimum! Event is happening!"*

**Current:** No celebration of wins.

**v1.1 Hooks:**
- **Milestone celebrations:** "🎊 You hit 20 registrations! Event confirmed." (confetti animation)
- **Unlocks:** "Full house! Photo gallery feature now active" (reward)
- **Share moments:** "Post your success: 'My retreat sold out in 4 days!'" (social proof generator)
- **Revenue tracking:** "You've earned $680 this month 💰" (tangible validation)

**Why it works:** Relief creates emotional peak. Users associate EventDash with winning feeling.

---

### 4. **Pride** (Event Success)
*"Look what I built!"*

**Current:** Event happens, then... silence.

**v1.1 Hooks:**
- **Auto-generated recap:** "Your event had 42 attendees, 93% attendance rate, 4.8⭐ avg rating"
- **Shareable achievements:** "I just hosted my 10th sold-out event 🔥" (badge system)
- **Attendee testimonials:** "What attendees said: 'Life-changing experience!'" (social proof)
- **Photo gallery:** Attendees upload photos → host gets "Your event in pictures" story

**Why it works:** Pride demands an audience. Make success shareable → users recruit users.

---

### 5. **FOMO** (Urgency)
*"I need to act NOW or I'll miss out!"*

**Current:** Events are static. No urgency.

**v1.1 Hooks:**
- **Limited seats counter:** "Only 5 spots left" (scarcity)
- **Early bird pricing:** "Price increases in 48 hours" (deadline)
- **Waitlist drama:** "12 people waitlisted — someone just canceled, claim their spot?"
- **Live activity feed:** "3 people viewing this event right now 👀" (social proof + competition)

**Why it works:** FOMO converts lurkers to registrants. Urgency beats procrastination.

---

## The Retention Loop: How Emotions Compound

### Week Before Event
**Monday:** Host creates event → feels **anticipation** (countdown starts)
**Wednesday:** First registration → feels **relief** ("it's happening!")
**Friday:** 5 more registrations → feels **pride** (shares on social)

### Week Of Event
**Tuesday:** 15 registrations → hits capacity threshold → **celebration animation**
**Thursday:** Event happens → attendees upload photos → **pride content generated**
**Saturday:** Host sees recap ("42 attendees, 4.8⭐") → **dopamine hit**

### Week After Event
**Monday:** Attendees share testimonials → **social proof accumulates**
**Wednesday:** Host gets "Plan your next event?" prompt → **anticipation restarts**
**Friday:** Creates next event → **loop repeats**

**Key:** Every emotional peak is an opportunity to re-engage. Never let a win go silent.

---

## v1.1 Feature Roadmap: Retention Hooks

### Tier 1: Must-Have (Launch Blockers)
*These features are table stakes for retention. Ship or die.*

#### 1.1.1 Real-Time Registration Notifications
**What:** Live feed shows new registrations as they happen.

**UX:**
- Host dashboard: "Sarah Johnson registered 2 minutes ago 🎉"
- Mobile push notification: "You have 3 new registrations!"
- Email digest: "Daily recap: 7 new registrations yesterday"

**Why:** Creates check-in habit. Users log in daily to see "who's new?"

**Implementation:**
- WebSocket connection or SSE (Server-Sent Events)
- Fallback: 30-second polling for older browsers
- Rate limit: Max 1 push notification per hour (avoid spam)

---

#### 1.1.2 Progress Tracking Dashboard
**What:** Visual representation of event success metrics.

**Metrics displayed:**
- **Capacity:** "18/50 seats filled (36%)" with progress bar
- **Revenue:** "$720 earned, $1,800 potential" with money-bar animation
- **Conversion:** "247 views → 18 registrations (7.3%)"
- **Trajectory:** "At this rate, you'll sell out in 8 days"

**Why:** Anxiety + agency = engagement. Show the gap, then offer tools to close it.

**Implementation:**
- Recharts or Chart.js for visualizations
- Daily snapshot stored (enables "compare to this time last event")
- Export to PNG (shareable progress screenshots)

---

#### 1.1.3 Milestone Celebrations
**What:** Automated congratulations when thresholds hit.

**Triggers:**
- First registration: "🎉 Your event has its first attendee!"
- 50% capacity: "Halfway there! 🔥"
- 100% capacity: "SOLD OUT! You're amazing! 🎊" (confetti animation)
- Revenue milestones: "$500 earned! 💰"

**UX:**
- Full-screen modal with animation (can't miss it)
- Social share button: "I just sold out my event in 3 days!"
- Unlocks feature: "You've unlocked: Premium event page themes"

**Why:** Positive reinforcement. Brain associates EventDash with winning.

**Implementation:**
- Frontend: Framer Motion for confetti animations
- Backend: Event triggers on registration count thresholds
- Personalization: "Faster than 73% of similar events!" (if data exists)

---

### Tier 2: Competitive Advantage (Differentiation)
*Features competitors don't have. These are your moat.*

#### 1.1.4 Social Proof Engine
**What:** Attendee activity becomes marketing content.

**Features:**
- **"Who else is going?" tease:** "3 of your Instagram followers registered"
- **Live activity feed:** "12 people viewed this event in the last hour"
- **Attendee avatars:** Circular avatar stack (like Clubhouse room participants)
- **Testimonial capture:** "Rate this event" prompt 24 hours after → auto-displays on next event page

**Why:** Social proof converts. People register because others are registering.

**Implementation:**
- OAuth integration: "Connect Instagram to see which friends are attending"
- Privacy toggle: "Show my attendance publicly" (opt-in)
- Aggregate anonymized data: "37 yoga teachers attended events like this"

---

#### 1.1.5 Content Flywheel
**What:** Every event generates shareable content that recruits next users.

**Content types:**
- **Event landing pages:** Auto-generated, shareable URLs (sunrise-yoga-retreat.eventdash.co)
- **Post-event recaps:** "42 attendees, 4.8⭐ rating, see photos" (public page)
- **Host profile pages:** "Sarah's Events" (portfolio of past events, star ratings)
- **Attendee badges:** "I attended Sunrise Yoga Retreat 🧘‍♀️" (share to social)

**Why:** Content IS the distribution. Every share is a free ad.

**Implementation:**
- SEO-optimized event pages (schema.org markup for Google Events)
- Open Graph tags for rich social previews
- Photo upload widget (attendees contribute content)
- "Share your attendance" button (one-click social post)

---

#### 1.1.6 Email Cliffhangers
**What:** Every email ends with curiosity driver.

**Examples:**
- After registration: "3 people you know are attending. See who? [View attendee list]"
- Before event: "Host is planning a surprise for attendees 👀"
- After event: "See what happened at Sunrise Yoga Retreat [Unlock photo gallery]"

**Why:** Cliffhangers drive click-through. Users can't resist unresolved tension.

**Implementation:**
- Email templates with A/B tested subject lines
- Personalization: "{{ attendee_name }}, your event is tomorrow!"
- Triggered sequences: Day-of reminder, post-event thank you, next-event prompt

---

### Tier 3: Retention Multipliers (Advanced)
*Once users are hooked, these keep them forever.*

#### 1.1.7 Streak & Gamification
**What:** Reward consistent hosting behavior.

**Features:**
- **Hosting streak:** "5 months in a row with events! 🔥"
- **Badges:** "Early Bird" (first 100 users), "Sold-Out Streak" (3 consecutive full events)
- **Leaderboard:** "Top hosts this month" (opt-in, public)
- **Levels:** Bronze → Silver → Gold host (unlocks features like custom domains)

**Why:** Streaks create loss aversion. Users don't want to break chain.

**Implementation:**
- Badge system with visual icons
- Monthly email: "Your hosting stats for March"
- Public profiles: "Gold host since January 2026"

---

#### 1.1.8 Predictive Prompts
**What:** AI suggests next action based on pattern recognition.

**Examples:**
- "You usually host events on Saturdays. Create your next one?"
- "Similar events charge $50. You're charging $30. Increase price?"
- "Events with photos get 2x more registrations. Add photos?"

**Why:** Removes decision fatigue. Platform becomes proactive partner.

**Implementation:**
- Basic: Rule-based triggers (if event ended + 7 days → prompt next event)
- Advanced: ML model predicts churn risk → intervention (if no event in 60 days → "We miss you" email)

---

#### 1.1.9 Community Features
**What:** Connect hosts to each other.

**Features:**
- **Host directory:** "Find yoga teachers near you hosting events"
- **Co-hosting:** "Invite another host to collaborate on event"
- **Host forum:** "Share tips: How I sold out my first retreat"
- **Mentorship:** "New hosts matched with experienced hosts"

**Why:** Community creates switching costs. Users stay for people, not features.

**Implementation:**
- Forum: Discourse integration or custom-built
- Matching algorithm: Location + event type + experience level
- Moderation: Automated spam detection, human review for flags

---

## User Journey: Before vs. After v1.1

### Current v1.0 Experience (Flat Line)

**Day 1:** Host creates event → sees blank registration list → closes tab
**Day 7:** Manually checks EventDash → 2 registrations → "hmm, okay" → closes tab
**Day 14:** Event happens → host doesn't log back in (nothing to see)
**Day 30:** Forgets EventDash exists → churn

**Retention rate:** ~20% (industry standard for tools without hooks)

---

### v1.1 Experience (Emotional Roller Coaster)

**Day 1:** Host creates event → countdown starts (⏰ "14 days until event!") → feels **anticipation**

**Day 3:** First registration → push notification 🎉 → logs in → sees "1/50 seats filled" progress bar → shares to Instagram → feels **pride**

**Day 5:** Email: "You're trending! 3 people viewed your event today 👀" → logs in to check analytics → feels **curiosity**

**Day 7:** Hits 10 registrations → milestone celebration modal (confetti 🎊) → unlocks "custom event themes" → feels **achievement**

**Day 9:** Email: "Only 5 days left! You're at 45% capacity" → anxiety → clicks "Boost event" → buys $20 ad → feels **agency**

**Day 12:** Hits 25 registrations (50% capacity) → celebration → email: "You're on track to sell out!" → feels **relief**

**Day 14:** Event happens → 23 attendees show up (93% attendance)

**Day 15:** Email: "See your event recap" → clicks → sees "4.8⭐ avg rating, 23 attendees, $920 revenue" + photo gallery → feels **pride** → shares recap to social media

**Day 16:** Prompt: "Your attendees loved it! Plan your next event?" → creates next event → **loop restarts**

**Retention rate target:** 60%+ (hooks + emotions + content flywheel)

---

## Metrics That Matter: How We'll Know It's Working

### Activation (Did user feel first magic moment?)
- **First registration time:** Median < 48 hours (event creates momentum)
- **Return visit rate:** 70%+ of hosts log in within 7 days of creating event

### Engagement (Is user coming back?)
- **Daily Active Hosts (DAH):** Hosts who log in daily during event countdown period
- **Check-in frequency:** Average logins per host during event lifecycle (target: 8+)
- **Feature adoption:** % of hosts who use notifications, progress tracking, milestones

### Retention (Does user stick around?)
- **Event-to-event return rate:** % of hosts who create 2nd event within 60 days (target: 50%+)
- **Monthly Active Hosts (MAH):** Hosts who create ≥1 event per month
- **Churn rate:** % of hosts who don't create event in 90 days (target: <30%)

### Virality (Does user recruit others?)
- **Social shares per event:** Average shares of event pages, recaps, badges (target: 3+)
- **Referral rate:** % of new users who came from existing user's shared content (target: 30%+)
- **Organic traffic:** % of event page visitors from social vs. direct/paid (target: 50%+ social)

### Monetization (Will user pay?)
- **Willingness to pay:** % of users who upgrade to paid tier after free trial
- **Revenue per host:** Average monthly revenue generated through events (proves value)
- **Feature-gated conversions:** % who upgrade to unlock premium features (custom domains, advanced analytics)

---

## Implementation Priorities: What to Ship First

### Sprint 1 (Week 1-2): Foundation Hooks
**Goal:** Get users to return within 7 days

**Ship:**
1. Real-time registration notifications (push + email)
2. Progress tracking dashboard (capacity, revenue, conversion)
3. Milestone celebrations (first registration, 50%, 100%)

**Success metric:** 70%+ of hosts log in within 7 days of creating event

---

### Sprint 2 (Week 3-4): Social Proof
**Goal:** Turn attendees into marketers

**Ship:**
1. Shareable event landing pages (SEO + Open Graph)
2. "Who else is going?" social reveals
3. Post-event recap generator (auto-creates shareable content)

**Success metric:** 3+ social shares per event (on average)

---

### Sprint 3 (Week 5-6): Email Cliffhangers
**Goal:** Re-engage users who go silent

**Ship:**
1. Triggered email sequences (registration, reminder, recap, next-event prompt)
2. Curiosity-driven subject lines A/B testing
3. Personalized prompts ("You usually host on Saturdays...")

**Success metric:** 40%+ email open rate, 15%+ click-through rate

---

### Sprint 4 (Week 7-8): Retention Multipliers
**Goal:** Lock in long-term users

**Ship:**
1. Streak tracking ("5 months in a row!")
2. Badge system (Early Bird, Sold-Out Streak, Gold Host)
3. Predictive prompts ("Create your next event?")

**Success metric:** 50%+ of hosts create 2nd event within 60 days

---

## Business Model Integration: How Retention Drives Revenue

### Free Tier (Hook)
**What's included:**
- Unlimited events
- Up to 50 registrations per event
- Basic email notifications
- Standard event landing pages

**Goal:** Get users addicted to dopamine hits (milestone celebrations, social proof).

**Why free?** Prove value before asking for money. Users need to feel "I can't live without this."

---

### Pro Tier ($50/month) (Monetization)
**What's unlocked:**
- Unlimited registrations (no cap)
- Custom branding (remove EventDash logo, add yours)
- Advanced analytics (conversion funnel, attendee demographics)
- Priority email placement (your events featured in discovery feed)
- Streak badges (visible flex for premium users)

**Trigger:** Upgrade prompt when free tier hits limit ("You have 51 registrations! Upgrade to continue.")

**Why it converts:** Loss aversion (users don't want to turn away registrants).

---

### Premium Tier ($150/month) (Whales)
**What's unlocked:**
- Everything in Pro
- Custom domain (your-brand.com instead of eventdash.co)
- White-label option (fully rebrand as your platform)
- API access (integrate with your CRM, marketing tools)
- Dedicated account manager (concierge support)

**Target:** Established studios/venues hosting 10+ events/month.

**Why it converts:** Status + control (brand matters to serious businesses).

---

## The North Star: What Success Looks Like

**6 months from now (October 2026):**
- **300 active hosts** creating events monthly
- **60% retention rate** (hosts create 2nd event within 60 days)
- **$15k MRR** (50 Pro, 10 Premium subscribers)
- **3,000 events hosted** (proof of platform utility)
- **12k social shares** (viral growth engine working)

**User testimonial we're chasing:**
> "I used to dread event planning. Now I'm addicted to watching registrations roll in. EventDash makes me feel like a rockstar event host."
> — Sarah, Sunrise Yoga Studio

**That's retention.** Not features. **Feelings.**

---

## Final Word: Events Are Stories

Every event is a story:
- **Setup:** Host creates event (anticipation)
- **Conflict:** Will anyone register? (anxiety)
- **Climax:** Registration threshold hit! (relief)
- **Resolution:** Event happens, attendees rave (pride)
- **Sequel hook:** "Plan your next event?" (loop restarts)

**EventDash v1.1 mission:** Make every event feel like a season finale that demands a sequel.

**Build that, and users will never leave.**

---

**Roadmap owner:** Shonda Rhimes
**Collaboration:** Product, Engineering, Marketing
**Review cadence:** Bi-weekly sprint demos (must show emotion, not just features)
**Success definition:** Users who can't stop talking about how EventDash makes them *feel*

---

*"You're not building event software. You're building the emotional engine that makes hosts fall in love with hosting."*
**— Shonda Rhimes, April 16, 2026**
