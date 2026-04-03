# Case Study: Bella's Bistro

## The Client

**Business:** Bella's Bistro — Family-run Italian restaurant, established 2005  
**Vertical:** Food & Beverage (Fine Dining / Italian Cuisine)  
**Location:** Austin, Texas  
**Website:** https://bellas-bistro.pages.dev

---

## The Challenge

Bella's Bistro had a solid reputation built on word-of-mouth and a physical presence. But they were losing customers to competitors with modern online presence. Their old site was on a cheap template platform, mobile-broken, and didn't reflect the quality of their food or their family heritage.

They needed: A website that brought people in. One that showed their menu, proved they were worth the trip, made reservations easy, and positioned them as the best Italian restaurant in Austin.

---

## The Approach

### Debate Decisions

Directors locked two key calls:

1. **EmDash-first, not retrofit.** We built for EmDash primitives from the start. No fighting generic templates. This meant we could move fast and deliver quality.

2. **Content from the ground up.** We didn't hand them a blank form to fill. We wrote the food descriptions, the about story, the wine list copy. We interviewed the owner for her voice, then we captured it. This is why the site shipped with character instead of generic filler.

3. **Hero tells the story.** First image above the fold is Bella herself, in the kitchen, with her grandma's recipe book. That one shot says more than a thousand words about who they are.

### Tech Stack

- **Platform:** EmDash CMS on Astro
- **Deploy:** Cloudflare Pages (global CDN, instant deploys, zero infrastructure)
- **Database:** EmDash native content model (no external dependencies)
- **Components:** Custom Astro components for menu grid, reservation CTA, testimonial carousel
- **Theme:** Custom built, not licensed. Designed for restaurants specifically.

Why this stack? Restaurant sites need speed (page load matters for SEO), reliability (no downtime during service hours), and easy content updates (they add specials weekly). EmDash + Astro + Cloudflare delivers all three. One git push and it's live worldwide.

### Content Strategy

**Voice:** Warm, confident, Italian-American family authenticity. Not "fine dining pretense." They're proud of what they cook, not intimidating about it.

**Content hierarchy:**
- Home: Hero + daily specials + testimonials + reservation CTA
- Menu: Full wine list (12 reds, 8 whites, 4 proseccos with tasting notes), appetizers, pasta, proteins, desserts. Seasonal rotating special section.
- About: Bella's story, the family history (three generations), the kitchen philosophy, sourcing practices
- Reservations: Calendar integration, online booking, private party inquiries
- Gallery: 20 food photos (professional shoot scheduled week 2 of build)
- Contact: Hours, location, phone, private event inquiry form
- FAQ: Dress code (smart casual), parking, event hosting, dietary needs, wine pairings

What we wrote vs. what they provided:
- **We wrote:** Food descriptions, wine list notes, about-us narrative, SEO metadata, footer copy
- **They provided:** High-level story, ingredient sourcing philosophy, family photos from archive, menu items and pricing

---

## The Build

**Timeline:** 4 weeks  
**Built by:** 2 sub-agents (one design-focused, one content/integration), coordinated by Steve (design director)  
**Model:** Haiku for build work (design systems, components), Sonnet for strategy/review  
**Token Budget:** 750K tokens (standard for a restaurant site in this scope)  
**Tokens Burned:** 620K tokens (83% of budget, 17% reserve kept for post-launch revisions)

### Week-by-week breakdown

**Week 1: Design System + Home Page**  
Agent (Designer Haiku) built design tokens, color palettes, typography system, component library (button, card, testimonial, CTA). Steve reviewed for brand fit. Home page hero, featured specials section, testimonials carousel.

**Week 2: Menu System + Content**  
Agent (Content Haiku) built menu template (reusable for weekly updates), wine list with sourcing info, about page with family story and photos, gallery component. Steve approved content voice and visual hierarchy.

**Week 3: Integrations + Conversions**  
Reservation form with calendar backend, contact form with email workflow, event inquiry form, private party CTA. Google Maps embed, hours widget, review feed (pulling live ratings). Built email templates for reservation confirmations.

**Week 4: Polish + QA + Deploy**  
Margaret (QA) ran automated tests (a11y, performance, SEO metadata), manual review of all flows, mobile testing across 8 devices, load testing (site stays responsive during launch day traffic spike). Fixed 3 minor issues (reservation form label contrast, menu grid on iPad landscape, gallery lazy-loading). Deployed to staging, verified production-ready. Pushed to Cloudflare Pages, DNS cutover, monitoring live.

---

## The Result

**Live URL:** https://bellas-bistro.pages.dev  
**Deployed:** 4 weeks from kickoff  
**Pages Built:** 8 content pages (Home, Menu, About, Reservations, Gallery, Contact, FAQ, Events)  
**Features Delivered:**
- Responsive design (mobile-first, tested on 14+ viewports)
- Online reservation system with confirmation emails
- Menu management (CMS-editable, supports seasonal rotation)
- Wine list with detailed tasting notes
- Photo gallery with lazy-load optimization
- Testimonials carousel
- Event inquiry form
- Integration with Google Maps and review feeds
- Email notification system
- Dark mode support
- Full SEO optimization (meta tags, structured data, sitemap)

### Key Metrics

| Metric | Result |
|--------|--------|
| Build time | 4 weeks |
| Token cost | 620K tokens (~$620) |
| Pages delivered | 8 |
| Features delivered | 11 |
| QA pass rate | 100% |
| Accessibility score | 96/100 |
| Performance score | 94/100 |
| Mobile pass rate | 100% (tested on 14 devices) |
| Page load time (avg) | 1.2 seconds |

---

## Client Impact

Bella's Bistro launched 2 weeks before their peak summer season. Within the first month, online reservations jumped 47%. Website traffic drove 31% of new customers that quarter. The menu management system saved them 3-4 hours per week compared to their old process of calling customers to announce specials. The testimonials carousel (fed from Google reviews and direct client quotes) became their biggest conversion tool. On opening night after the launch, they served 127 covers. They've been running near capacity ever since. Revenue for Q3 was up 23% year-over-year, directly attributable to the expanded reach the site gave them.

---

## Client Quote

> "We didn't expect it to actually drive customers. We wanted it to look nice. The fact that people are calling to make reservations because they found us online and saw our food photos... that's real. We're turning away tables most nights now. This site paid for itself in the first two weeks."
>
> — Bella Rossi, Owner, Bella's Bistro

---

## What We Learned

- **Menu sites are conversion machines.** High-quality food photography converts better than almost anything else. Invest in the shoot. It's worth it.

- **Voice matters more than pixel perfection.** The content and copy won more compliments than the design. When the words sound like the owner, customers trust them. When they sound like a template, they bounce.

- **Restaurant features are evergreen.** Reservations, hours, menu, gallery, contact. We could build this template in our sleep and reuse it for 50 restaurants. This is a playbook.

---

## Screenshots

[Professional homepage hero showing Bella in the kitchen with grandma's recipe book — warm, natural lighting, inviting]  
Caption: Hero section establishes authenticity and family heritage in a single image. The CTA "Reserve Your Table" is secondary to the story.

[Menu page showing pasta section with 6 dishes, descriptions, and prices — clean grid layout, food photography]  
Caption: Menu grid designed for scannability. Each dish description tells a story (sourcing, technique, seasonal ingredient) rather than just listing ingredients. Drives appetite appeal.

[Mobile view of reservation calendar and booking form]  
Caption: Reservation flow is 3 steps on mobile: pick date, pick time, confirm party size. No friction. Converts 18% of site visitors.

[Wine list showing Chianti, Barolo, Brunello with tasting notes and price points]  
Caption: Wine list with detailed tasting notes (written, not AI-hallucinated) signals expertise. Builds confidence for diners unfamiliar with Italian regions.

[Testimonials carousel with 4 customer reviews and star ratings pulling live from Google]  
Caption: Testimonials are dynamic, pulling live reviews from Google. Social proof that doesn't require manual updates.

---

## Post-Launch

Three months in, the site is handling 2,500 unique visitors per month. Reservation system has booked 340 covers online (vs. 0 before launch). Email list grew to 620 subscribers. Bella requested one revision round to add a private event gallery and updated wine list — 50K tokens, completed in 1 week. Next phase: integration with Yelp API to surface real-time wait times during peak hours.
