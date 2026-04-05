# Debate Round 1 — Sunrise Yoga Studio

**PRD:** GitHub Issue #28
**Date:** 2026-04-05
**Participants:** Steve Jobs (Design & Brand), Elon Musk (Product & Engineering)

---

## Steve Jobs — Opening Position

The PRD asks for a yoga studio site. This is not a generic small-business template — it is a wellness brand, and the brand experience must reflect that from the first pixel.

**Brand Experience:**
- Calm, serene, inviting. The visitor should feel their nervous system downregulate the moment the page loads.
- Warm earth tones are already specified: sage green, warm cream, terracotta accents. These are perfect. No neon, no high-contrast harshness.
- Photography-forward. Large hero imagery of studio spaces, people practicing, natural light. Unsplash has strong yoga/wellness content.
- White space is the design. A yoga studio site should breathe. Dense layouts betray the brand.
- Typography: a serif for headings (warmth, tradition) paired with a clean sans-serif body. Think Lora or Playfair Display with Inter or Source Sans.

**Pages that matter most:**
1. **Home** — Hero image, class highlights (3-6 cards), testimonials, CTA to book/contact. This is the storefront. It must be stunning.
2. **Classes** — This is the money page. A schedule grid with class types, instructors, levels, and times. Visitors need to find "the right class for me" in under 10 seconds.
3. **Pricing** — Three-tier comparison (Drop-in $20, Monthly $99, Annual $899). Clean, scannable, with a clear "best value" indicator on Monthly or Annual.
4. **Contact** — Location map, hours, booking/inquiry form. Simple. Functional.

**What I will not compromise on:**
- The site must not look like a template. Even though we are using EmDash marketing blocks, the seed data, colors, and imagery must feel bespoke.
- Mobile must be flawless. This audience books classes from their phone after morning coffee.
- The class schedule display must be well-organized. If we just dump a list of classes, we have failed.

---

## Elon Musk — Opening Position

Steve is right about the brand, but let me ground this in reality. We already have a sunrise-yoga example site in `/examples/sunrise-yoga/` with:
- Pages: home, pricing, contact, 404
- Marketing blocks: Hero, Features, Pricing, Testimonials, FAQ
- Full seed.json with content already written for this exact studio

We are not building from scratch. We are customizing and extending an existing foundation.

**Fastest path to live:**
1. **Fork the example.** The existing sunrise-yoga example is 80% done. It has the homepage with Hero, Features, Testimonials, FAQ blocks. It has Pricing and Contact pages. Seed data is written with yoga-specific copy.
2. **Add a Classes page.** This is the only net-new page the PRD requires. We use the EventDash plugin for this — it has event-listing Portable Text blocks, calendar views, recurring event support, and capacity management. Class schedule is literally what EventDash was built for.
3. **Integrate MemberShip for pricing tiers.** The PRD has Drop-in ($20), Monthly ($99), Annual ($899). MemberShip handles plans with Stripe Checkout, content gating, and member dashboards. Wire the Pricing page to real MemberShip plans instead of static pricing cards.
4. **Styling pass.** Update the seed data and CSS custom properties to match the PRD colors exactly. Swap placeholder images for yoga-specific Unsplash photos.

**Plugin integration is the force multiplier:**
- **EventDash** for class scheduling: recurring events (weekly yoga classes), different class types as event categories, instructor as metadata, capacity limits, online registration. No need to build a custom schedule component.
- **MemberShip** for pricing: three plans, Stripe integration, member portal where members can manage their subscription. The pricing page becomes a real conversion funnel, not a static table.

**Timeline:** This is a Simple Site (5 pages = 500K token budget). With the example as a base, the build phase is mostly configuration and content refinement, not greenfield development.

**What I will not compromise on:**
- We ship with working plugins. A static pricing page with no checkout is a brochure, not a product.
- EventDash must be integrated for class scheduling. A hand-coded schedule grid is tech debt on day one.
- The site deploys to production. No "coming soon" pages.

---

## Points of Agreement

1. **Pages:** Home, Classes, Pricing, Contact — 4 pages total (plus 404). Both agree.
2. **Design direction:** Warm earth tones, photography-forward, generous white space. No disagreement.
3. **Mobile-first:** Non-negotiable for both.
4. **EventDash for classes:** Steve agrees that a well-designed schedule is critical; Elon proposes EventDash as the engine. Steve accepts as long as the rendering is beautiful, not generic.
5. **MemberShip for pricing:** Both agree static pricing is inferior to real membership plans with checkout.

## Points of Contention

1. **Template feel:** Steve worries the example site will look generic. Elon argues that with proper styling, imagery, and seed data customization, it will feel bespoke.
   - **Resolution:** Steve owns the styling pass. Custom color tokens, curated Unsplash imagery, and typography must be approved before shipping.

2. **Classes page complexity:** Steve wants a polished schedule grid. Elon wants to ship EventDash's built-in event-listing block.
   - **Resolution:** Use EventDash event-listing block as the foundation. If the default rendering is too generic, a sub-agent will create a custom block wrapper. But we try the default first.

3. **Scope creep — member portal, check-in, etc.:** EventDash and MemberShip have many features. We do NOT ship everything.
   - **Resolution:** MVP scope. EventDash: event listing, recurring events, basic registration. MemberShip: 3 plans, Stripe checkout, pricing page. No portals, check-in, or drip content in v1.

---

## Locked Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Base | Fork `examples/sunrise-yoga` | 80% done, yoga-specific content exists |
| Pages | Home, Classes, Pricing, Contact, 404 | PRD scope + standard 404 |
| Class scheduling | EventDash plugin | Recurring events, capacity, registration built-in |
| Pricing/memberships | MemberShip plugin | Real checkout vs. static cards |
| Design system | Custom color tokens + Unsplash imagery | Sage green, warm cream, terracotta per PRD |
| Typography | Serif headings + sans-serif body | Warm, approachable, premium feel |
| Token budget | 500K (Simple Site) | 4 pages + 2 plugin integrations |
| Deployment | EmDash standard deploy | Staging then production |
