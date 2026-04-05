# Build Plan — Sunrise Yoga Studio

**PRD:** GitHub Issue #28
**Date:** 2026-04-05
**Token Budget:** 500K (Simple Site)
**Base:** Fork from `examples/sunrise-yoga`

---

## Site Overview

| Item | Detail |
|------|--------|
| Business | Sunrise Yoga Studio, Portland, OR |
| Audience | Women 25-45, community-focused yoga |
| Pages | Home, Classes, Pricing, Contact, 404 |
| Plugins | EventDash (class scheduling), MemberShip (memberships) |
| Design | Sage green, warm cream, terracotta. Serif + sans-serif. Photography-forward. |

---

## Pages & Content Structure

### Home (`/`)
- **Hero block** — Headline, subheadline, dual CTA (Get Started / View Schedule)
- **Features block** — 6 cards: Vinyasa Flow, Yin & Restorative, Hot Yoga, Community Classes, Private Sessions, Workshops & Retreats
- **Testimonials block** — 3 member testimonials
- **FAQ block** — 5-6 questions (what to bring, experience needed, cancellation, first visit, parking)
- **Status:** Exists in example. Needs content refinement and imagery.

### Classes (`/classes`) -- NEW PAGE
- **EventDash event-listing block** — Displays upcoming classes from recurring event templates
- **Class types:** Vinyasa Flow, Yin & Restorative, Hot Yoga, Community Class
- **Each class shows:** Name, instructor, day/time, duration, level, capacity, register button
- **View mode:** List view (default), optional month calendar view
- **Registration:** EventDash handles name + email registration per class
- **Status:** Does not exist. Must be built.

### Pricing (`/pricing`)
- **MemberShip-powered pricing cards:**
  - Drop-in: $20/class (handled via EventDash paid event tickets)
  - Monthly Unlimited: $99/month (MemberShip plan, Stripe recurring)
  - Annual Unlimited: $899/year (MemberShip plan, Stripe recurring, "Best Value" badge)
- **Feature comparison list** per tier
- **CTA buttons** link to Stripe Checkout (Monthly/Annual) or Classes page (Drop-in)
- **Status:** Static version exists. Must be wired to MemberShip plans.

### Contact (`/contact`)
- **Location info:** Address, phone, email, hours
- **Embedded map** or static map image
- **Contact/booking form** (EmDash built-in form handling)
- **Status:** Exists in example. Minor content updates needed.

### 404
- **Status:** Exists. No changes needed.

---

## Plugin Configuration

### EventDash
- Install plugin in `astro.config.mjs`
- Create 4 recurring event templates:
  - Vinyasa Flow — Mon/Wed/Fri 7:00 AM, 60 min, All Levels, cap 25
  - Yin & Restorative — Tue/Thu 6:00 PM, 75 min, All Levels, cap 20
  - Hot Yoga — Mon/Wed/Fri 12:00 PM, 60 min, Intermediate, cap 20
  - Community Class — Saturday 10:00 AM, 60 min, All Levels, cap 30, donation-based
- Add instructors as event metadata
- Enable registration (name + email)
- Enable paid events for Drop-in pricing ($20/class)

### MemberShip
- Install plugin in `astro.config.mjs`
- Create 2 membership plans:
  - Monthly Unlimited: $99/month, features: unlimited classes, mat rental, 10% workshop discount
  - Annual Unlimited: $899/year, features: unlimited classes, mat rental, 20% workshop discount, 1 free guest pass/month
- Configure Stripe Checkout integration
- Wire Pricing page to pull plan data from MemberShip

---

## Design Tokens

```css
--color-primary: #7A8B6F;       /* Sage green */
--color-primary-light: #A3B396;  /* Light sage */
--color-secondary: #C4704B;      /* Terracotta */
--color-accent: #D4A853;         /* Warm gold */
--color-background: #FAF8F2;     /* Warm cream */
--color-surface: #FFFFFF;        /* White cards */
--color-text: #2C2C2C;          /* Charcoal */
--color-text-muted: #6B6B6B;    /* Muted text */
--font-heading: 'Lora', serif;
--font-body: 'Source Sans 3', sans-serif;
```

---

## Build Waves

### Wave 1: Foundation (50K tokens)
**Goal:** Site runs with updated content, no plugins yet.

| Task | Agent | Description |
|------|-------|-------------|
| 1.1 | Developer | Fork `examples/sunrise-yoga` into `projects/sunrise-yoga/build/` |
| 1.2 | Developer | Update `seed.json` with refined copy, correct pricing tiers, improved FAQ |
| 1.3 | Designer | Define CSS custom properties for brand colors and typography |
| 1.4 | Developer | Verify all existing pages render correctly with updated seed |

### Wave 2: EventDash Integration (150K tokens)
**Goal:** Classes page is live with a real schedule.

| Task | Agent | Description |
|------|-------|-------------|
| 2.1 | Developer | Install EventDash plugin, configure in `astro.config.mjs` |
| 2.2 | Developer | Create recurring event templates for all class types in seed data |
| 2.3 | Developer | Build `/classes` page with EventDash `event-listing` block |
| 2.4 | Developer | Add "Classes" to primary navigation menu in seed |
| 2.5 | Developer | Test registration flow (name + email) |

### Wave 3: MemberShip Integration (100K tokens)
**Goal:** Pricing page converts visitors to paying members.

| Task | Agent | Description |
|------|-------|-------------|
| 3.1 | Developer | Install MemberShip plugin, configure in `astro.config.mjs` |
| 3.2 | Developer | Create Monthly and Annual plans in seed/config |
| 3.3 | Developer | Wire Pricing page to display MemberShip plan data |
| 3.4 | Developer | Configure Stripe Checkout for plan signup |
| 3.5 | Developer | Update Drop-in pricing CTA to link to Classes page |

### Wave 4: Polish & QA (100K tokens)
**Goal:** Site looks and feels bespoke, passes all quality checks.

| Task | Agent | Description |
|------|-------|-------------|
| 4.1 | Designer | Curate Unsplash images: hero, class types, studio atmosphere |
| 4.2 | Designer | Final typography and spacing pass — ensure generous white space |
| 4.3 | Designer | Verify mobile responsiveness at 320px, 375px, 768px, 1024px |
| 4.4 | QA (Margaret) | Accessibility audit (WCAG 2.1 AA) |
| 4.5 | QA (Margaret) | Performance check (Core Web Vitals targets) |
| 4.6 | QA (Margaret) | Cross-browser test (Chrome, Safari, Firefox) |
| 4.7 | QA (Margaret) | Verify all links, forms, and registration flows work |

### Wave 5: Deploy (50K tokens)
**Goal:** Live on production.

| Task | Agent | Description |
|------|-------|-------------|
| 5.1 | Developer | Deploy to EmDash staging |
| 5.2 | QA (Margaret) | Staging smoke test |
| 5.3 | Developer | Promote to production |
| 5.4 | Developer | Git tag release v1.0 |

---

## Token Budget Allocation

| Phase | Tokens | % |
|-------|--------|---|
| Debate + Plan | 50K | 10% |
| Wave 1: Foundation | 50K | 10% |
| Wave 2: EventDash | 150K | 30% |
| Wave 3: MemberShip | 100K | 20% |
| Wave 4: Polish + QA | 100K | 20% |
| Wave 5: Deploy | 50K | 10% |
| **Total** | **500K** | **100%** |

---

## Definition of Done

- [ ] All 4 pages render correctly (Home, Classes, Pricing, Contact)
- [ ] EventDash shows class schedule with working registration
- [ ] MemberShip pricing page with Stripe Checkout for Monthly/Annual
- [ ] Mobile responsive at all breakpoints
- [ ] WCAG 2.1 AA accessibility
- [ ] Core Web Vitals pass (LCP < 2.5s, CLS < 0.1, FID < 100ms)
- [ ] All forms functional (contact, class registration, membership signup)
- [ ] Deployed to production
