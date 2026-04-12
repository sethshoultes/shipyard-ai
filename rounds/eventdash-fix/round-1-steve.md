# Steve Jobs — Chief Design & Brand Officer

## Product Naming

**EventDash** is wrong. It sounds like a generic SaaS dashboard from 2014. Two words. Forgettable. We need one word that captures what this *is*: the place where gatherings come to life.

**Gather.** That's the name. One word. A verb. It tells you exactly what it does while implying something human — people coming together. "Dash" is cold. "Gather" is warm.

## Design Philosophy

Here's what makes this insanely great: **invisibility**.

The greatest event management tool is one you forget you're using. You're not "using software" — you're creating a yoga retreat, a conference, a birthday party. The tool should feel like an extension of your intention, not a system you're fighting.

Right now, EventDash is the opposite. It's *visible* for all the wrong reasons — error messages, broken pages, baroque JSON serialization rituals. The PRD lists **443 pattern violations**. That's not a bug count. That's a philosophy failure. Someone built what they *imagined* the API would be instead of what it *is*.

Great software is built on truth, not wishful thinking.

## User Experience: The First 30 Seconds

When an admin opens Gather, they should see **their events** — not a loading spinner, not an error, not a blank slate with instructions. Events. Real ones. With real attendee counts.

The first action should be obvious: a single "Create Event" button. Not hidden in a menu. Not one of twelve options. *The* option.

Thirty seconds in, they've either seen their events or they've started creating one. That's it. Anything else is friction, and friction is failure.

## Brand Voice

Gather speaks like a confident host, not a nervous waiter.

- "Your event is live" — not "Event successfully created and saved to database."
- "12 spots left" — not "Capacity: 88/100 (88% full)."
- "Sarah just registered" — not "Registration ID #4892 confirmed."

Every word should feel like it was written by someone who *throws* parties, not someone who *documents* them.

## What to Say NO To

**No** to configuration screens before value. Show me events first, settings later.

**No** to "power user" features that complicate the common path. Waitlists are great. Nested conditional capacity tiers based on ticket type and date range? No.

**No** to abstractions that leak. The 153 instances of manual JSON parsing in this codebase are a symptom: someone was building around the system instead of *with* it. Strip it out. Trust the platform.

**No** to defensive auth checks the framework already handles. Sixteen redundant permission guards? That's not security — it's anxiety in code form.

## The Emotional Hook

People will love Gather because **it makes them look good**.

When you send an invite through Gather, you look organized. When registration works flawlessly, you look professional. When the attendee list is beautiful and shareable, you look like someone who has their life together.

We're not selling event management. We're selling the feeling of being the person who *effortlessly* brings people together. That's the hook. That's why they'll tell their friends.

---

*Fix the 443 violations. Ship a working admin page. But remember: we're not fixing a bug. We're restoring dignity to an experience that should have been beautiful from day one.*
