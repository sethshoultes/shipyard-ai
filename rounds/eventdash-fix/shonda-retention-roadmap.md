# Shonda Retention Roadmap: EventDash v1.1

**Author:** Based on Shonda Rhimes' Board Review
**Date:** 2026-04-12
**Philosophy:** "If users don't feel something, they won't come back."

---

## The Problem: Why Users Don't Return

EventDash v1.0 is transactional, not relational.

**Current user journey:**
1. Create event
2. See it in a table
3. Leave
4. Return only when they need to create another event

**What's missing:**
- No reason to check back
- No emotional investment
- No story arc
- No anticipation

Users will *use* EventDash because they have to. They won't *love* it.

---

## What Keeps Users Coming Back

### The Three Retention Questions

Every returning user is answering one of these:

| Question | EventDash v1.0 | EventDash v1.1 Target |
|----------|----------------|----------------------|
| What did I miss? | Nothing | Activity feed, registration notifications |
| What should I do next? | Unknown | Guided next steps, incomplete drafts |
| What's happening soon? | Invisible | Countdown, urgency indicators |

---

## V1.1 Feature Roadmap

### Phase 1: The Aha Moment (Week 1-2)

**Goal:** Make users feel something when someone registers for their event.

#### 1.1 First Registration Notification
```
"Sarah just registered for Morning Yoga!"
```
- Push notification / toast when admin is active
- Email notification when admin is away
- This is the emotional spike that creates attachment

#### 1.2 Registration Counter
```
5/20 spots filled
```
- Progress indicator on event list
- Creates anticipation and momentum
- Social proof that the event matters

#### 1.3 "Next Steps" Prompt After Creation
```
Your event is live!
[ Share Event ] [ Add to Calendar ] [ Preview Page ]
```
- Don't abandon users after form submission
- Give them somewhere to go
- Create forward momentum

---

### Phase 2: The Anticipation Engine (Week 3-4)

**Goal:** Make users excited about what's coming.

#### 2.1 Countdown Display
```
Morning Yoga — 3 days away
```
- Visible on event list
- Builds anticipation
- Reminds users why they're here

#### 2.2 Event Lifecycle Indicators
- **Draft:** Incomplete events waiting for attention
- **Live:** Accepting registrations
- **Filling Up:** >75% capacity
- **Sold Out:** Social proof achievement
- **Happening Soon:** <24 hours away
- **Completed:** Archive with attendee count

#### 2.3 "Spots Filling Up" Alert
```
Only 4 spots left for Sunset Meditation!
```
- Urgency drives action
- Shared with potential attendees
- Creates FOMO (healthy, event-appropriate FOMO)

---

### Phase 3: The Activity Feed (Week 5-6)

**Goal:** Give users a reason to check back daily.

#### 3.1 Admin Dashboard Feed
```
Today:
- Sarah registered for Morning Yoga (2 hours ago)
- 3 people viewed Sunset Meditation (today)
- Morning Yoga is tomorrow — 12 attendees confirmed

This Week:
- 8 new registrations across all events
- Sunrise Workshop hit capacity
```
- This is the "What did I miss?" answer
- Creates habit of checking in
- Makes the admin feel like a host, not a data entry clerk

#### 3.2 Weekly Digest Email
```
Your Week in Events:
- 3 new registrations
- 1 event completed (Yoga Flow — 15 attended)
- 2 upcoming events

"Keep the momentum going!"
```
- Bring users back without requiring them to remember
- Celebrate wins
- Create anticipation for next week

---

### Phase 4: The Emotional Journey (Week 7-8)

**Goal:** Treat events as stories, not data.

#### 4.1 Event Page (Public)
- Real landing page, not just a form
- Event description, date, time, location
- Host information
- Registration button
- Social sharing

**This is where the story goes public.** The admin isn't just creating a row in a database—they're inviting people into an experience.

#### 4.2 Registration Confirmation
```
You're in!

Morning Yoga with Sunrise Studio
Tuesday, April 15 at 6:00 AM

[ Add to Calendar ] [ Share with Friends ]
```
- Attendees feel welcomed
- Creates commitment
- Shareable (network effect)

#### 4.3 Post-Event Follow-Up
```
How was Morning Yoga?

"Thanks for hosting! 12 people attended."

[ View Attendees ] [ Create Next Event ] [ Download Report ]
```
- Close the loop
- Celebrate the completion
- Set up the next cycle

---

## Empty States That Create Anticipation

### Current (v1.0)
```
No events yet.
```

### Proposed (v1.1)
```
Your first event is one click away.

What will you create?

[ Morning Yoga ] [ Workshop ] [ Meetup ] [ Something else ]
```

Templates reduce friction. Questions create curiosity.

---

## The Retention Loop (Visual)

```
              ┌─────────────────────────────────────┐
              │                                     │
              ▼                                     │
        ┌──────────┐     ┌──────────────┐     ┌────┴─────┐
        │  Create  │────▶│  Registrations  │────▶│  Event   │
        │  Event   │     │  Roll In      │     │  Happens │
        └──────────┘     └──────────────┘     └────┬─────┘
              ▲                │                   │
              │                │                   │
              │         ┌──────▼──────┐           │
              │         │  Activity   │           │
              │         │  Feed       │◀──────────┘
              │         └──────┬──────┘
              │                │
              │         ┌──────▼──────┐
              │         │  "What's    │
              │         │   Next?"    │
              │         └──────┬──────┘
              │                │
              └────────────────┘
```

**The key insight:** Users return when there's always something to see, something to do, and something to anticipate.

---

## Metrics to Track

| Metric | Why It Matters |
|--------|----------------|
| **D1 Retention** | Do users return the day after creating their first event? |
| **D7 Retention** | Do users return within a week? |
| **Events per User** | Are users creating multiple events? |
| **Time to First Registration** | How quickly does the "aha moment" happen? |
| **Activity Feed Opens** | Are users checking in without explicit need? |
| **Email Click-Through Rate** | Are digests driving return visits? |

**Target:** Move D7 retention from ~10% (estimated current) to ~40%.

---

## What V1.1 Does NOT Include (V2+)

These are important but out of scope for v1.1:

1. **AI Event Generation** — "Create our fall workshop series" (NLP)
2. **Cross-Site Learning** — "Events at 6am on Tuesdays have 2.3x show rate"
3. **Paid Ticketing** — Stripe integration for monetization
4. **Recurring Events** — Weekly/monthly patterns
5. **Waitlist Management** — For capacity-constrained events
6. **Calendar Sync** — Google Calendar / Outlook integration
7. **Custom Branding** — Event pages match site design
8. **Analytics Dashboard** — Deep insights into event performance

V1.1 focuses on **emotional infrastructure**. V2 adds **operational sophistication**.

---

## Summary: The Shonda Test

> "Would I tell this story in 10 episodes, or does it end in the pilot?"

**EventDash v1.0:** Ends in the pilot. User creates event. Credits roll.

**EventDash v1.1:** The story continues.
- Episode 2: First registration arrives
- Episode 3: Momentum builds
- Episode 4: Event happens
- Episode 5: What's next?

Users come back because they're invested in the outcome. The event isn't just data—it's a story they're telling.

---

*"Events are inherently emotional. Weddings, launches, workshops, meetups—these are moments people anticipate. EventDash should honor that."*

— Based on Shonda Rhimes' Board Review
