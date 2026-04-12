# Shonda Retention Roadmap: What Keeps Users Coming Back

**Product:** Anchor Post-Delivery System
**Version:** 1.1 Feature Roadmap
**Author:** Based on Shonda Rhimes Board Review
**Date:** 2026-04-12

---

## The Core Problem

> "Don't just promise you won't disappear. Give them reasons to look for you."

The current Anchor system is a **promise of presence**. But presence alone isn't retention. Clients should:
- **Want** to hear from us
- Be **curious** about what's next
- Feel like they're part of a **story still being written**

---

## Retention Framework: The Four Horizons

| Horizon | Timeframe | Question | Current State | v1.1 Target |
|---------|-----------|----------|---------------|-------------|
| Tomorrow | 24-72 hours | "Why check back?" | No reason | First Week Wins |
| Next Week | 7 days | "Why return?" | Passive email waiting | Client destination |
| Next Month | 30 days | "Why stay engaged?" | One-way communication | Client-initiated action |
| Six Months+ | 180+ days | "Why remain loyal?" | 152-day silence gap | Complete story arc |

---

## v1.1 Features: What Keeps Users Coming Back

### 1. First Week Wins (Tomorrow Retention)

**Problem:** No immediate reason to return after launch.

**Solution:** "First Week Stats" in Day 7 email.

**Implementation:**
```
Day 7 Email Addition:

"Your first week by the numbers:
- [X] visitors found your site
- [X] pages viewed
- Average time on site: [X] minutes
- Top traffic source: [source]

Your site is working. People are finding you."
```

**Requirements:**
- Cloudflare or basic analytics integration
- Auto-pull stats for each client site
- Fallback copy if analytics unavailable

**Impact:** Client now has a number going up. That's Tomorrow Retention 101.

---

### 2. Site Card Artifact (Client Destination)

**Problem:** Clients have no place to return to. No "home base."

**Solution:** A simple, branded one-page artifact clients can hold.

**Contents:**
| Field | Description |
|-------|-------------|
| Site URL | Their live website |
| Launch Date | When we shipped |
| Maintenance Tier | Basic / Pro / None |
| Tokens Used (Lifetime) | Running total |
| Tokens Remaining (Monthly) | Current allowance status |
| Next Touchpoint | When they'll hear from us |
| Quick Actions | "Reply to update" / "Upgrade plan" links |

**Format Options:**
- Static PDF (Phase 1 — manual generation)
- Hosted page at `shipyard.ai/clients/[id]` (Phase 2)
- Client dashboard (Phase 3)

**Impact:** A destination. Something to check. Something to hold.

---

### 3. Explicit Cliffhangers (Serialized Narrative)

**Problem:** Emails are standalone episodes. They should be a serialized narrative.

**Solution:** Each email previews the next touchpoint.

**Implementation:**

| Email | Current Ending | v1.1 Ending |
|-------|----------------|-------------|
| Day 0 | [CTA to buy Anchor] | "We'll check in next week to see how your first visitors liked it." |
| Day 7 | "Hit reply if you need anything" | "At one month, we'll help you refresh what's already feeling dated." |
| Day 30 | [CTA to buy Anchor] | "At six months, we'll review the year ahead together." |
| Month 6 | "Let's build what's next" | "One year coming up — we're planning something special for your anniversary." |

**Impact:** Anticipation. Curiosity. The feeling that the story continues.

---

### 4. Day 90 Pulse Check (Mid-Season Episode)

**Problem:** 152-day gap between Day 30 and Month 6 is a mid-season hiatus.

**Solution:** Lightweight Day 90 touchpoint.

**Email Purpose:** "Still here. You?"

**Draft:**
```
Subject: Quick check-in — [Site Name]

Hey [Client Name],

Three months in. Just wanted to say: we're still here.

Your site's been live for 90 days now. If anything's been nagging at
you — a page that needs updating, a feature you've been thinking about,
a question you haven't asked — now's a good time.

Hit reply. We'll take it from there.

Still watching out for you,
[Sender]

P.S. At six months, we'll do a full review together. For now, just
wanted you to know we're not going anywhere.
```

**CTA Type:** Soft (relationship-building, not revenue)

**Impact:** Closes the narrative gap. Reminds them we exist.

---

### 5. Day 365 Anniversary (Season Finale)

**Problem:** The year-one arc ends at Month 6. That's an incomplete story.

**Solution:** Restore the anniversary email from original PRD.

**Email Purpose:** Celebration + Renewal + Referral

**Draft:**
```
Subject: Happy 1 Year, [Client Name]!

One year ago today, we shipped [Site Name].

That's 365 days of your business being live on the internet. 365 days
of customers finding you, learning about what you do, and deciding to
work with you.

We helped build the foundation. You built everything on top of it.

To celebrate, here's 20% off any project you book in the next 30 days.
New feature, new page, fresh design — whatever's next for you.

Use code ONEYEAR at checkout, or just reply to this email and we'll
apply it.

And if you know someone who needs what you have — a website that
actually works, from a team that doesn't disappear — send them our way.
We'd be honored.

Here's to year two,
[Sender]

P.S. Thank you for trusting us. It still means something.
```

**CTA Type:** Hard (discount offer with urgency)

**Impact:** The finale. Celebration, incentive, and referral ask in one.

---

### 6. Testimonial Capture (Content Flywheel Start)

**Problem:** No mechanism to capture success stories. No social proof.

**Solution:** Add testimonial ask to Day 30 or Month 6 email.

**Implementation:**

Add to Day 30 email (after soft CTA):
```
P.S. One more thing — if you're happy with what we built together,
would you mind if we shared your story? A quick quote from you could
help another business owner find the right team. Just reply with a
sentence or two about your experience, and we'll take it from there.
```

**Process:**
1. Client replies with quote
2. We follow up with permission request
3. Add to testimonials page / marketing materials
4. Notify client when their story goes live ("You're featured!")

**Impact:** Clients become content. Their success feeds our pipeline.

---

### 7. Referral Prompt (Word-of-Mouth Engine)

**Problem:** Satisfied clients have networks. We never ask.

**Solution:** Add referral prompt to Month 6 and Day 365 emails.

**Implementation:**

Add to Month 6 email:
```
Know someone who needs a site that actually works? Reply with their
name and email, and we'll mention you said hello. (We'll credit your
account with a free token boost if they sign on.)
```

**Referral Reward Structure:**
- Referrer: 25K bonus tokens (one-time)
- Referred: 10% off first project

**Impact:** Referrals are content. Word-of-mouth is designed, not hoped for.

---

### 8. Pro Tier Highlight (Curiosity Driver)

**Problem:** Quarterly Refresh Proposals (Pro feature) are buried in product description.

**Solution:** Surface this in Month 6 email as a curiosity hook.

**Implementation:**

Add to Month 6 email (for Basic tier clients):
```
Anchor Pro clients get quarterly refresh proposals — specific
recommendations for what to update next, based on how your site has
evolved. Here's what we'd suggest for you this quarter:

• [Recommendation 1]
• [Recommendation 2]
• [Recommendation 3]

Want the full breakdown? Upgrade to Pro and we'll send your complete
Q3 refresh proposal within 48 hours.
```

**For Pro clients:**
```
As promised, here's your Q3 refresh proposal...
```

**Impact:** Now they're curious. Now they want to know what the recommendations are.

---

## v1.1 Email Sequence (Updated)

| Touchpoint | Day | Type | New in v1.1 |
|------------|-----|------|-------------|
| Launch Day | 0 | Hard CTA | + Preview of Day 7 |
| Day 7 Check-in | 7 | Soft CTA | + First Week Stats, + Preview of Day 30 |
| Day 30 Refresh | 30 | Hard CTA | + Testimonial ask, + Preview of Month 6 |
| **Day 90 Pulse** | 90 | **Soft CTA** | **NEW** |
| Month 6 Review | 182 | Hard CTA | + Referral prompt, + Pro highlight, + Preview of Day 365 |
| **Day 365 Anniversary** | 365 | **Hard CTA** | **NEW (restored)** |

---

## The Content Flywheel (Future State)

```
         ┌──────────────────────────┐
         │   Client Success         │
         │   (site performs well)   │
         └───────────┬──────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   Testimonial Capture    │
         │   (Day 30 / Month 6)     │
         └───────────┬──────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   Social Proof           │
         │   (marketing materials)  │
         └───────────┬──────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   New Client Acquisition │
         │   (trust + credibility)  │
         └───────────┬──────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   Referral from Happy    │
         │   Client (Month 6/365)   │
         └───────────┬──────────────┘
                     │
                     └──────► [Back to Client Success]
```

**Current state:** Funnel (in → through → out)
**Target state:** Flywheel (in → through → compound → in)

---

## Implementation Priority

### Phase 1 (Before Launch)
1. Restore Day 365 email
2. Add preview lines to all emails (explicit cliffhangers)

### Phase 2 (Within 30 Days)
3. Add Day 90 Pulse Check email
4. Add testimonial capture to Day 30
5. Add referral prompt to Month 6

### Phase 3 (Within 90 Days)
6. First Week Stats integration (requires analytics)
7. Site Card artifact (PDF version)
8. Pro tier highlight in Month 6

### Phase 4 (Future)
9. Client dashboard (hosted Site Card)
10. Anchor Client Community (Slack/newsletter)
11. Monthly "Site Owner Tips" content

---

## Success Metrics

| Metric | Current | v1.1 Target | Measurement |
|--------|---------|-------------|-------------|
| Day 7 reply rate | Unknown | 15%+ | Track in Notion |
| Day 30 testimonial capture | 0% | 10%+ | Count replies with quotes |
| Month 6 referral rate | 0% | 5%+ | Count referral replies |
| Day 365 discount redemption | N/A | 25%+ | Track code usage |
| Basic → Pro upgrade rate | Unknown | 10%+ | Stripe data |

---

## The Shonda Test

Every touchpoint should pass this test:

> "Does this make them curious about what happens next?"

If the answer is no, add a cliffhanger. Add a tease. Add a reason to wonder.

The goal isn't just to be present. The goal is to be **anticipated**.

---

*"Every good story has a second act. Anchor has a first act. Now write the rest."*
— Shonda Rhimes
