# Email 1: Launch Day (Day 0)

**When to send:** Same day the site goes live
**CTA Type:** Hard CTA (direct payment link)
**Purpose:** Celebrate, establish "we don't disappear" positioning, introduce maintenance

---

## Email Template

**Subject:** Your site is live!

---

**Body:**

Hi {{NAME}},

Look what we built together.

Your site is live at {{URL}} — and we're not disappearing. Most agencies vanish after delivery. We don't. We're still here, watching out for what we built.

Here's what's running for you now:
- All your pages are live and optimized
- Mobile responsive on every device
- SEO ready for search engines

**What's next?**

1. **Share it.** Post on social, email your customers, tell the world.
2. **Test it.** Click around on your phone. Report anything that feels off.
3. **Stay covered.** We can keep watching your site for you.

Want us to handle ongoing updates, bug fixes, and tweaks? Anchor starts at $79/month. It's peace of mind — not a contract. Cancel anytime.

- **Anchor Basic** ($79/month): Content updates, bug fixes, 48-hour response.
- **Anchor Pro** ($149/month): Everything in Basic + quarterly refresh proposals.

**Get started:** {{ANCHOR_BASIC_LINK}}
**Or go Pro:** {{ANCHOR_PRO_LINK}}

Questions? Just hit reply. We read everything.

P.S. We'll check in next week to see how your first visitors liked it.

— The Shipyard AI team

---

## Merge Fields Required

| Field | Description | Example |
|-------|-------------|---------|
| `{{NAME}}` | Client's first name | Sarah |
| `{{URL}}` | Live site URL (no https://) | bellabistro.com |
| `{{ANCHOR_BASIC_LINK}}` | Stripe payment link for Basic | https://buy.stripe.com/basic |
| `{{ANCHOR_PRO_LINK}}` | Stripe payment link for Pro | https://buy.stripe.com/pro |

**Banned merge fields (do NOT use):**
- `{{TOKENS_USED}}` — Tokens are internal accounting, not client-facing
- `{{PAGE_COUNT}}` — Not in approved merge field list
- `{{MAINTENANCE_LINK}}` — Replaced with tier-specific links
- `{{FEATURE_LIST}}` — Use generic features instead
- `{{REFRESH_SUGGESTION}}` — Not applicable to Day 0

---

## Checklist Before Sending

- [ ] "We don't disappear" or variation in first paragraph
- [ ] Maintenance upsell NOT in first paragraph (should be later)
- [ ] Hard CTA with actual payment links (both tiers)
- [ ] Preview line present: "We'll check in next week..."
- [ ] No {{FEATURE_LIST}} merge field (use generic "Mobile responsive, SEO optimized")
- [ ] No {{REFRESH_SUGGESTION}} merge field
- [ ] No {{TOKENS_USED}} merge field (banned per Decision 6)
- [ ] No {{PAGE_COUNT}} merge field (banned per Decision 6)
- [ ] URL is correct and site is actually live
- [ ] Read aloud — does it evoke relief, not stress?

---

## Voice Notes

This is THE critical email. Per essence.md:
> "The first email sets everything. Open with awe, not administration."

We lead with celebration: "Look what we built together."

We establish positioning immediately: "We're not disappearing."

The maintenance offer comes later (paragraph 4), not as the lead. The relationship comes first.

**Token language is banned:** Per Decision 11 (Oprah), "Normal people don't think in tokens." We use human-readable outcomes instead of technical metrics.

**Preview line added:** Per Decision 12 (Shonda), each email promises the next chapter. This creates a serialized narrative.

---

## What Success Looks Like

A client who receives this email should:
1. Feel proud of what they launched
2. Feel relief that someone's still watching out for them
3. Consider forwarding it to a colleague ("look what I just shipped!")
4. Know exactly where to get maintenance if they want it
5. Anticipate the Day 7 check-in

---

*Per Decision #4: Launch Day email leads with celebration, not administration.*
*Per Decision #6: Banned merge fields removed (TOKENS_USED, PAGE_COUNT, MAINTENANCE_LINK).*
*Per Decision #7: "We don't disappear" is core emotional hook, first paragraph.*
*Per Decision #11: Human-readable language, not token counts.*
*Per Decision #12: Preview line added for serialized narrative.*
