# EmDash Plugin Roadmap — Shipyard AI

**Strategy**: First-mover advantage in the empty EmDash marketplace. Build the plugins every site needs.

## P0 — Building Now

### MemberShip (Issue #30) — IN PROGRESS
**Agent**: Elon Musk | **Branch**: feature/plugin-membership

Membership & gated content. MemberPress equivalent.
- [ ] Plugin descriptor (index.ts)
- [ ] Sandbox entry with definePlugin
- [ ] KV storage schema (members, plans)
- [ ] API: /register, /check, /plans, /cancel
- [ ] Content gating hook (content:beforeRender)
- [ ] Settings: plan definitions
- [ ] Install on Bella's Bistro for testing
- [ ] README + docs

### EventDash (Issue #31) — IN PROGRESS
**Agent**: Steve Jobs | **Branch**: feature/plugin-eventdash

Events & ticketing. Events Calendar + Event Espresso equivalent.
- [ ] Plugin descriptor (index.ts)
- [ ] Sandbox entry with definePlugin
- [ ] KV storage schema (events, registrations)
- [ ] API: /events, /events/:id, /register, /cancel, /ical
- [ ] Settings: defaultCapacity, requirePayment
- [ ] Install on Sunrise Yoga for testing (class schedule)
- [ ] README + docs

## P1 — Next Up

### ReviewPulse (Issue #32)
Review management. Pull Google/Yelp reviews, display widget, respond from admin.
- Google Places API + Yelp Fusion API
- Review display Portable Text block
- Sentiment tracking
- Best test site: Bella's Bistro, Peak Dental

### FormForge (Issue #33)
Form builder. Contact, booking, surveys.
- Visual form builder in admin
- Submissions to D1 + email via Resend
- Spam protection + conditional logic
- Best test site: all sites need forms

## P2 — Future

### SEODash (Issue #34)
SEO toolkit. Meta tags, sitemaps, social previews.

### CommerceKit (Issue #35)
E-commerce. Products, cart, Stripe checkout.

## Plugin Architecture Notes

From EmDash docs:
- Standard plugins use `definePlugin()` in sandbox-entry.ts
- Capabilities declared in descriptor: kv:storage, api:routes, read:content, write:content
- KV storage for data persistence
- API routes for endpoints
- Hooks for content lifecycle (content:beforeRender, content:afterSave)
- Block Kit for admin UI
- Portable Text blocks for site-side rendering
