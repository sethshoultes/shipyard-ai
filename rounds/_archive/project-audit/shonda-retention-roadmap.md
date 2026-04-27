# Shonda Retention Roadmap
## What Keeps Users Coming Back — v1.1 Features
**Shipyard AI Agency**
**Date**: 2026-04-09

---

## The Retention Philosophy

Users don't return to products. They return to progress.

The question isn't "What features should we add?" — it's "What transformation do we help them achieve, and how do we make that transformation visible, tangible, and ongoing?"

For Shipyard AI, the transformation is: **"I went from not having a website to having one that works for my business."** Retention means making them feel that transformation every week.

---

## The Three Retention Pillars

### Pillar 1: Show Them the Impact
**Users return when they see their site doing work for them.**

The Day 3, Day 7, Day 14 email sequence (per Review #006) already captures this instinct. But the data pipeline must be real — hardcoded placeholders destroy trust faster than silence.

**v1.1 Features:**
- **Live Dashboard Widget**: Embed in the client's EmDash site admin. Shows:
  - Visitors this week (Cloudflare Analytics API)
  - Contact form submissions
  - Time on site / bounce rate
  - Simple trend arrows (up/down vs. last period)
- **Weekly Digest Email**: Auto-generated, sent every Monday at 9am local time
  - "Your site had 147 visitors last week. 3 people filled out your contact form. Here's what that means for a business like yours."
  - Includes one actionable tip: "Most visitors came from Google. Consider adding a blog post about [industry topic] to keep that momentum."
- **Milestone Celebrations**: First 100 visitors, first form submission, first month anniversary
  - Small but memorable: "You just hit 100 visitors! Here's a badge for your site."

**Why this works:** Progress is addictive. When users see their site generating leads, they don't want to lose it.

---

### Pillar 2: Give Them a Reason to Return
**Users return when there's something new to discover or do.**

The current flow is: build site → deliver → done. That's a transaction, not a relationship. v1.1 introduces lightweight ongoing engagement without requiring a full rebuild.

**v1.1 Features:**
- **Content Refresh Prompts**: Quarterly email suggesting content updates
  - "It's been 90 days since you updated your Pricing page. Would you like us to review it?"
  - One-click request: opens a simple form that generates a micro-PRD for a refresh
- **Seasonal Themes**: For restaurants, retail, service businesses
  - "Holiday season is coming. Want a festive hero banner? We can add it for $50."
  - Pre-built components, minimal scope, quick turnaround
- **Feature Unlocks**: Gamified discovery of EmDash capabilities
  - "Your site now supports photo galleries. Want to add one to your About page?"
  - Each unlock feels like the product is growing with them

**Why this works:** Ongoing value creates ongoing habit. Users who engage monthly are 5x more likely to refer others.

---

### Pillar 3: Make Leaving Painful (Ethically)
**Users stay when switching costs are real but fair.**

Not lock-in. Not hostage-taking. But genuine accumulated value that would be lost.

**v1.1 Features:**
- **Review Aggregation**: Pull Google/Yelp reviews into the site
  - Integration deepens over time; reviews accumulated on-site
  - Leaving means losing curated social proof display
- **SEO Momentum Report**: Show Google Search Console data
  - "Your site now ranks #7 for 'Italian restaurant Portland.' Here's how we got there."
  - Rankings take months to build; users understand the cost of starting over
- **Custom Domain + Email**: Offer managed email forwarding
  - info@bellasbistro.com → their personal inbox
  - Domain + email + site = a bundle harder to unbundle

**Why this works:** Accumulated value is earned lock-in. Users stay because they've built something, not because they're trapped.

---

## v1.1 Feature Prioritization

| Feature | Effort | Retention Impact | Priority |
|---------|--------|------------------|----------|
| Live Dashboard Widget | Medium | High | P0 |
| Weekly Digest Email | Low | High | P0 |
| Milestone Celebrations | Low | Medium | P1 |
| Content Refresh Prompts | Low | Medium | P1 |
| Seasonal Themes | Medium | Medium | P2 |
| Feature Unlocks | Medium | Medium | P2 |
| Review Aggregation | High | High | P1 |
| SEO Momentum Report | Medium | High | P1 |
| Custom Domain + Email | High | High | P2 |

---

## The Retention Narrative

### Week 1: Excitement
- Site launches
- Milestone: "Your site is live!"
- Day 3 email: "Here's what's happening"

### Month 1: Validation
- Weekly digest: "47 visitors, 2 contact forms"
- Milestone: "First 100 visitors!"
- Feature unlock: "Photo gallery now available"

### Month 3: Habit
- Quarterly refresh prompt: "Time to update your hours?"
- SEO report: "You're ranking for 3 new keywords"
- Review aggregation: "12 Google reviews now on your site"

### Month 6+: Loyalty
- Anniversary celebration: "6 months with Shipyard AI"
- Seasonal theme offer: "Holiday banner for $50?"
- Referral program: "Know another business? We'll discount your next refresh."

---

## Metrics to Track

### Leading Indicators
- **Email open rate**: Target >40% for weekly digests
- **Dashboard widget views**: How often clients check their stats
- **Content refresh request rate**: % of clients who respond to quarterly prompts

### Lagging Indicators
- **6-month retention rate**: Target >80% of clients still active/engaged
- **Referral rate**: % of new clients from existing client referrals
- **Expansion revenue**: Additional services (refreshes, seasonal themes) per client

### Anti-Metrics (Red Flags)
- Clients who never open emails after Month 1
- Sites with zero updates for 6+ months
- Clients who don't respond to any outreach

---

## Implementation Sequence

### Phase 1: Data Foundation (Week 1-2)
1. Instrument Cloudflare Analytics API pull
2. Build data pipeline for visitor stats, form submissions
3. Verify all email stats are real, not placeholders (#006 concern)

### Phase 2: Visibility Layer (Week 2-4)
4. Build dashboard widget component for EmDash
5. Implement weekly digest email (Resend automation)
6. Add milestone detection and celebration emails

### Phase 3: Engagement Loop (Week 4-6)
7. Build content refresh prompt flow
8. Create seasonal theme component library
9. Implement feature unlock notifications

### Phase 4: Stickiness (Week 6-8)
10. Google/Yelp review aggregation integration
11. SEO momentum report (Google Search Console API)
12. Custom domain + email bundle offering

---

## The One Question

**Every feature should answer: "Does this make the user feel like their site is alive and working for them?"**

If yes, build it.
If no, cut it.

---

*Retention is not a feature list. It's a feeling.*
*Users who feel progress will return. Users who feel abandoned will leave.*
*Build the feeling first. The features follow.*

---

*Roadmap authored by Retention Strategy Agent*
*Inspired by: Shonda Rhimes' philosophy on keeping audiences invested*
*Filed: 2026-04-09*
