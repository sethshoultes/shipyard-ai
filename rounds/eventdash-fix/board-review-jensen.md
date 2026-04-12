# Board Review: eventdash-fix

**Reviewer:** Jensen Huang — CEO, NVIDIA; Board Member, Great Minds Agency
**Date:** 2026-04-12
**Deliverable:** EventDash Plugin Bug Fix

---

## Executive Summary

This is maintenance work. Competent maintenance work — the agent correctly diagnosed hallucinated API patterns, fixed them, and documented the process. But it's maintenance. There's no compounding value being built here.

The real question isn't "did they fix the bug?" — they did. The question is: **why does this plugin exist at all?**

---

## What's the Moat? What Compounds Over Time?

**There is no moat.**

EventDash is a CRUD form for events. Name, Date, Description. Three fields. That's a Google Form. That's Notion. That's literally any tool built in the last 15 years.

What compounds:
- **Nothing in the current implementation.** Each event created is an isolated data point.
- **No network effects.** Events don't connect to attendees, venues, communities.
- **No data flywheel.** We're not learning what events work, who attends, what times convert.

The agent correctly stripped this down to an MVP — but an MVP of *what*? A feature that Calendly, Eventbrite, Luma, and Facebook Events already do better, with ecosystems around them.

---

## Where's the AI Leverage? Are We Using AI Where It 10x's the Outcome?

**Zero AI. Zero leverage.**

The implementation is pure CRUD:
- Manual form entry
- Static field validation
- Direct KV storage
- Dumb table rendering

Where AI could 10x this:
1. **Natural language event creation** — "Schedule a sunrise yoga class next Tuesday at 6am, repeat weekly for 8 weeks"
2. **Smart scheduling** — Suggest times based on attendee availability patterns
3. **Description generation** — One line in, compelling event copy out
4. **Attendee prediction** — "Based on similar events, expect 12-18 attendees"
5. **Dynamic capacity** — Auto-adjust based on historical show rates

The PRD explicitly says "do not add features" — and the agent correctly followed those constraints. But the constraints themselves are wrong. We're shipping a 2015 solution to a 2026 problem.

---

## What's the Unfair Advantage We're Not Building?

**The Emdash ecosystem itself is the unfair advantage we're ignoring.**

This plugin runs inside Emdash. It has access to:
- User authentication (pre-handled)
- Site context (Sunrise Yoga knows its members)
- KV storage with prefix-based querying
- Block Kit for admin UI

What we're NOT doing:
1. **Cross-plugin integration** — Events should connect to payments (Stripe ticketing mentioned in PRD but removed), email, memberships
2. **Site-aware intelligence** — Sunrise Yoga has member data. Events should know who's likely to attend.
3. **Embedded AI agents** — The admin doesn't need a form. They need a collaborator. "Create our fall workshop series" should work.

The agent followed scope correctly. But scope was set too narrow. We're optimizing the wrong function.

---

## What Would Make This a Platform, Not Just a Product?

Right now: EventDash is a feature. A single table in a database.

**To become a platform:**

1. **Event Templates as Composable Primitives**
   - Yoga studio template, workshop template, retreat template
   - Community-shared, forkable, improvable
   - Templates learn from outcomes across all Emdash sites

2. **Attendee Graph**
   - Who attends what? What patterns predict conversion?
   - Cross-site insights (anonymized): "Events at 6am on Tuesdays have 2.3x show rate"

3. **Integration Layer**
   - Payments, reminders, check-in, follow-up sequences
   - Other plugins can hook into event lifecycle (before_event, after_event, registration_confirmed)

4. **AI Event Operations**
   - Generate, optimize, analyze, iterate
   - "Run our events better than we could ourselves"

The PRD explicitly forbade all of this. The agent was compliant. But the PRD was wrong.

---

## Score: 4/10

**Justification:** Technically correct bug fix with thorough documentation, but zero strategic value creation — this is a solved problem being solved again, worse.

---

## Detailed Assessment

### What the Agent Did Well

1. **Research discipline** — Actually read the middleware, adapter, and working plugins before coding
2. **Pattern compliance** — Fixed all banned patterns (throw Response, JSON.stringify/parse, rc.user)
3. **Scope discipline** — Followed the "NO list" exactly, resisted feature creep
4. **Documentation** — TEST-RESULTS.md is comprehensive, includes code path verification
5. **UX refinement** — Shortened copy per guidelines ("Created." not "Event created!")

### What's Missing

1. **Strategic pushback** — Should have flagged that the entire plugin concept is undifferentiated
2. **AI integration plan** — Even a stub for future AI features would show vision
3. **Platform thinking** — No hooks, no events (ironically), no extension points
4. **Competitive awareness** — No mention of why this matters vs. existing solutions

---

## Recommendations

1. **Short-term:** Ship this fix. The yoga studio needs a working admin panel.

2. **Medium-term:** Kill EventDash as a standalone concept. Events should be a core Emdash primitive, not a plugin.

3. **Long-term:** Build the "AI Event Operations" vision:
   - Natural language event management
   - Cross-site learning
   - Integrated lifecycle (promotion → registration → attendance → follow-up)
   - Let the AI handle the CRUD so humans handle the creative

---

## The Hard Question

**Would I invest in a company whose core innovation is a three-field form?**

No.

The agent executed the task correctly. But the task shouldn't have existed. We're building the past.

---

*Jensen Huang*
*Board Member, Great Minds Agency*
