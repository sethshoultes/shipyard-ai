# PRD: Plugin: EventDash — Events & Ticketing

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#31
> https://github.com/sethshoultes/shipyard-ai/issues/31

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #31
- **Author:** sethshoultes
- **Labels:** plugin, p0
- **Created:** 2026-04-05T03:48:13Z

## Problem
Events Calendar + Event Espresso equivalent for Emdash CMS.

## Status: In Progress (Fixing)

### What's Been Done
- Plugin code at `plugins/eventdash/src/sandbox-entry.ts` (130 lines, minimal rewrite)
- Wired into Sunrise Yoga site (`examples/sunrise-yoga/astro.config.mjs`)
- Deployed to Cloudflare Workers at `sunrise-yoga.seth-a02.workers.dev`
- Plugin appears in Emdash admin sidebar (Events, Create Event links visible)
- **API routes work via curl:**
  - `GET /_emdash/api/plugins/eventdash/events` — lists events
  - `POST /_emdash/api/plugins/eventdash/createEvent` — creates events
- Events created and stored in KV successfully

### What's Broken
- Admin Block Kit pages show "Failed to load admin page" in the browser
- The `admin` route returns valid JSON via curl but doesn't render in Emdash's admin UI
- PRD `plugin-audit` deployed to fix this along with all other plugins

### What's Left
- [ ] Fix admin Block Kit rendering so Events page works in the browser
- [ ] Fix Create Event form in admin UI
- [ ] Calendar views, Registration/RSVP, Stripe ticketing, recurring events, iCal export

### Technical Notes
- Original 3,600-line version was built against hallucinated Emdash API
- Rewritten to 130-line minimal version using correct sandbox API
- See `docs/EMDASH-GUIDE.md` for correct plugin API

## Success Criteria
- Issue sethshoultes/shipyard-ai#31 requirements are met
- All tests pass
