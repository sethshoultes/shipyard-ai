# Shipyard Post-Delivery V2: Final Decisions

**Consolidated by:** Phil Jackson — Zen Master, Great Minds Agency
**Date:** 2026-04-12
**Status:** LOCKED FOR BUILD

---

## Decision Register

### DECISION 1: Product Naming
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs |
| **Decision** | Product is named **"Anchor"** (Anchor Basic, Anchor Pro) |
| **Rationale** | "Maintenance plans" is corporate furniture. "Anchor" carries emotional weight, fits nautical brand, sounds like a club not an insurance pitch. Elon's counter (rename in V2) overruled — names set positioning from day one. |

### DECISION 2: Pricing Tiers
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon (1 tier @ $99) vs Steve (2 tiers @ $79/$149) |
| **Winner** | Steve Jobs |
| **Decision** | **Two tiers from day one: $79/month (Basic) and $149/month (Pro)** |
| **Rationale** | Psychological anchoring. The existence of Pro makes Basic feel accessible. Apple doesn't sell one iPhone. This isn't premature optimization — it's positioning. |

### DECISION 3: Tracking System
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Decision** | **Notion database, not spreadsheet + calendar reminders** |
| **Rationale** | O(1) setup per client vs O(n) calendar events. Built-in automated reminders. Single source of truth. Steve conceded. |

### DECISION 4: Launch Day Email Structure
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon conceded) |
| **Decision** | **Launch Day email leads with celebration, not administration** |
| **Rationale** | First 30 seconds set the relationship. Open with awe. "Look what we built together." Maintenance upsell moves to paragraph three. Both parties agreed. |

### DECISION 5: Template 4 (Quarter 1 Report)
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk (Steve conceded) |
| **Decision** | **Cut or make optional. Move refresh suggestion to Day 30.** |
| **Rationale** | 90 days is too long — client has forgotten you. Day 30 maintains momentum. Steve conceded. |

### DECISION 6: Merge Fields
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Both (convergent) |
| **Winner** | Consensus |
| **Decision** | **Kill {{REFRESH_SUGGESTION}} and {{FEATURE_LIST}} merge fields** |
| **Rationale** | Nobody writes custom suggestions. These fields become lies or grocery receipts. Write one generic sentence that works for 80% of projects. Edge cases get manual edits. |

### DECISION 7: Emotional Positioning
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (Elon adopted) |
| **Decision** | **"We don't disappear" is the core emotional hook** |
| **Rationale** | Every freelancer, agency, dev shop vanishes after launch. Anchor is the promise that Shipyard stays. Lead every email with this positioning. Elon agreed — first line, not buried. |

### DECISION 8: CTA Strategy
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve (restrained P.S.) vs Elon (every email sells) |
| **Winner** | CONTESTED — Requires resolution |
| **Decision** | **Unresolved. See Open Questions.** |
| **Rationale** | Steve argues P.S. placement is intentional restraint that builds trust. Elon argues every touchpoint should convert. Neither conceded. |

### DECISION 9: Build Timeline
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon (1 day) vs Steve (5 days) |
| **Winner** | CONTESTED — Requires resolution |
| **Decision** | **Unresolved. See Open Questions.** |
| **Rationale** | Elon: actual build is 1 hour, rest is procrastination theater. Steve: emails ARE the product, 5 days is minimum viable craft. Neither conceded. |

---

## MVP Feature Set (What Ships in V1)

### SHIPPING
- [ ] 4 email templates (Launch Day, Day 7, Day 30, Month 6) — Template 4 cut/optional
- [ ] Product name: **Anchor** (Anchor Basic, Anchor Pro)
- [ ] Two Stripe products with payment links ($79/month, $149/month)
- [ ] Notion database for client tracking with automated reminders
- [ ] Emotional hook: "We don't disappear" — lead positioning in all emails

### NOT SHIPPING (Explicitly Cut)
- Dashboard
- Automations
- Token tracking system
- Email scheduling automation (Mailchimp/Loops/Resend) — deferred to 25+ clients
- Analytics
- {{REFRESH_SUGGESTION}} merge field
- {{FEATURE_LIST}} merge field
- Template 4 (Quarter 1 Report at 90 days) — cut or made optional

---

## File Structure (What Gets Built)

```
/anchor/
├── emails/
│   ├── 01-launch-day.md          # Celebration-first, logistics line 3
│   ├── 02-day-7-checkin.md       # "We don't disappear" positioning
│   ├── 03-day-30-refresh.md      # Refresh suggestion (standardized)
│   └── 04-month-6-review.md      # Annual planning, renewal prep
├── stripe/
│   ├── anchor-basic.md           # $79/month product description
│   └── anchor-pro.md             # $149/month product description
├── notion/
│   └── client-database-template.md  # Schema + automated reminder setup
├── brand/
│   └── voice-guide.md            # "Confident, warm, slightly irreverent"
└── decisions.md                  # This document
```

---

## Open Questions (Requires Resolution Before Build)

### 1. CTA Strategy: Restrained vs. Assertive
- **Steve's position:** P.S. placement is intentional restraint. Pick 2 emails for the ask. Let others breathe. Trust builds conversion.
- **Elon's position:** Every touchpoint is a conversion opportunity. Make CTAs feel like value, not asks. "You're covered" framing.
- **Impact:** Directly affects email template content
- **Recommended path:** Hybrid — Lead with value in every email, but hard CTA in only Launch Day and Day 30. Others use soft "Here if you need us" close.

### 2. Build Timeline: 1 Day vs. 5 Days
- **Steve's position:** 5 days minimum. Emails are the entire product. Craft matters.
- **Elon's position:** 1-day build. 30-minute polish. Don't let perfect kill shipped.
- **Impact:** Sprint planning, stakeholder expectations
- **Recommended path:** 2-day sprint. Day 1: infrastructure (Notion, Stripe). Day 2: email craft with voice. Ship by EOD Day 2.

### 3. When to Automate Email Sends
- **Elon's position:** Now. Batch upload to Mailchimp/Loops saves 8+ hours/year.
- **Steve's position (implied):** Manual preserves intentionality
- **PRD position:** 50+ clients
- **Elon's counter:** Start evaluating at 15, deploy at 25
- **Impact:** Operational scalability
- **Recommended path:** Manual for first 15 clients. Evaluate automation tooling at client 15. Deploy at client 25.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Manual emails don't get sent** | HIGH | HIGH | Notion automated reminders. Daily task view. No willpower required. |
| **Emails feel robotic despite intentions** | MEDIUM | HIGH | Brand voice guide. "Confident, warm, slightly irreverent." Test reads before send. |
| **25% attach rate is too aggressive** | MEDIUM | MEDIUM | Industry baseline is 15-20%. Target 20% in projections. Celebrate 25%+. |
| **Two tiers create confusion** | LOW | MEDIUM | Clear feature differentiation. Anchor Basic = updates. Anchor Pro = updates + strategy. |
| **Notion database becomes unmaintainable at scale** | MEDIUM | HIGH | Transition plan at 50 clients. Evaluate Airtable or custom tooling at 100. |
| **"Anchor" name creates domain/trademark issues** | LOW | MEDIUM | Check availability before launch. Fallback: "Steady" or "Harbor" |
| **Client forgets Shipyard exists by Day 30** | MEDIUM | HIGH | Move refresh suggestion from Day 90 to Day 30 (already decided). |
| **Template polish takes longer than planned** | MEDIUM | LOW | Time-box to Day 2. Ship professional, iterate to perfect. |
| **No one follows through on manual processes** | HIGH | CRITICAL | This is Elon's core concern. Notion reminders + single daily task view is the entire mitigation strategy. If this fails, nothing else matters. |

---

## Essence (Guiding Principles for Build)

From `/essence.md`:

> **What is this product REALLY about?**
> The promise that someone stays after the work is done.

> **What feeling should it evoke?**
> Relief. The quiet comfort of knowing you're not alone with this thing you don't fully understand.

> **What's the one thing that must be perfect?**
> The first email. It sets everything. Open with awe, not administration.

> **Creative direction:**
> We don't disappear.

---

## Sign-Off

This document represents the consolidated decisions from:
- Steve Jobs (Chief Design & Brand Officer) — Rounds 1 & 2
- Elon Musk (Chief Product & Growth Officer) — Rounds 1 & 2

**Locked decisions:** 7 of 9
**Open questions:** 3 (require Phil's executive decision)
**Recommended build timeline:** 2 days
**Target ship date:** EOD Day 2

---

*"The strength of the team is each individual member. The strength of each member is the team."*
— Phil Jackson

**Now we build.**
