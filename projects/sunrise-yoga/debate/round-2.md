# Debate Round 2 — Sunrise Yoga Studio

**Date:** 2026-04-05
**Focus:** Implementation details and risk mitigation

---

## Steve Jobs — Round 2

I reviewed the existing seed.json. The content is decent but needs refinement:

**Content gaps I see:**
- The Features block uses generic icons (zap, shield, users, chart, code, globe). These need to map to yoga-specific concepts, not SaaS features. The content text is good but the icons feel like a tech product.
- The FAQ block exists but I want to verify it covers the questions a yoga newcomer actually asks: "What should I bring?", "Do I need experience?", "What's the cancellation policy?"
- The Pricing page needs the three specific tiers from the PRD ($20/$99/$899), not whatever the example currently has.
- There is no Classes page at all in the example — just Home, Pricing, Contact. This is the biggest build item.

**Design must-haves for the Classes page:**
- Classes should be grouped by type (Vinyasa, Yin, Hot Yoga) or displayed in a weekly calendar view
- Each class card: name, instructor, time, duration, level (Beginner/Intermediate/All Levels), brief description
- A filter or tab system so visitors can find classes by type or day
- Registration CTA on each class (powered by EventDash)

**Imagery strategy:**
- Hero: Wide shot of a sunlit yoga studio, warm wood floors, plants. Calm but alive.
- Features section: Could use inline images or stick with icons — but the icons must feel wellness, not tech.
- Testimonials: No photos needed (text testimonials are fine for a studio).
- Classes: Instructor photos if possible, otherwise class-type imagery.

---

## Elon Musk — Round 2

Agreed on the content gaps. Here is the technical plan:

**EventDash integration for Classes:**
- Create recurring event templates for each class type (Vinyasa Flow, Yin & Restorative, Hot Yoga, Community Class, Private Sessions)
- Each template generates weekly instances with: title, instructor, time, duration, capacity, level
- The Classes page renders the `event-listing` Portable Text block from EventDash
- EventDash already supports calendar views (month + list) — we use the list view for a clean schedule, with the option to switch to month view
- Registration is built into EventDash — attendees register with name + email

**MemberShip integration for Pricing:**
- Three plans configured in MemberShip:
  - Drop-in: $20, one-time (or per-class via EventDash tickets)
  - Monthly Unlimited: $99/month, recurring
  - Annual Unlimited: $899/year, recurring (saves ~25%)
- Pricing page uses MemberShip plan data to render the comparison cards
- Stripe Checkout handles payment — no custom payment forms
- Actually, let me reconsider: Drop-in pricing might be better handled as EventDash ticket pricing (pay-per-class) rather than a MemberShip plan. Monthly and Annual are clearly MemberShip plans.

**Risk: Plugin integration complexity.**
- Both plugins need to be installed and configured in the EmDash site's `astro.config.mjs`
- Seed data must include plugin configuration (plans, event templates)
- Risk is medium — both plugins are at v3.0 and well-tested, but wiring two plugins into one site is the most complex part of this build

**Mitigation:**
- Wave 1: Get the site running with the existing example (no plugins) — verify pages, styling, content
- Wave 2: Integrate EventDash + add Classes page
- Wave 3: Integrate MemberShip + wire Pricing page to real plans
- Wave 4: Final styling pass, imagery, QA

---

## Final Consensus

1. **Drop-in pricing** handled via EventDash paid events (per-class ticket), not MemberShip. Monthly and Annual are MemberShip plans.
2. **Classes page** is the primary build item. Uses EventDash event-listing block with recurring events.
3. **Build in waves** to reduce integration risk. Site works at every wave — each wave adds capability.
4. **Icons** will be reviewed and swapped for wellness-appropriate choices during the styling pass.
5. **Imagery** curated from Unsplash during Wave 4. Steve approves before ship.

All decisions from Round 1 are confirmed. No reversals.
