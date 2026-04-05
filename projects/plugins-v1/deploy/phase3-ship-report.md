# Phase 3: Content Rules + Calendar + Portals — Ship Report

**Date**: 2026-04-05
**Pipeline**: Full GSD
**PRs**: #57-#61 (5 PRs)
**Tasks**: 16/16 complete across 4 waves

## What shipped

### MemberShip
- Content gating engine (page-level + block-level rules)
- Drip content unlock (UTC midnight, cron endpoint)
- Member portal (content library, locked content with unlock dates)
- GatedContent.astro with visual badges ("Members Only", "Premium")
- WCAG 2.1 AA accessibility + mobile responsive

### EventDash
- Month calendar view (grid with event dots, day selection)
- List calendar view (paginated monthly listing)
- Attendee portal (my events, check-in codes, past events)
- Registration management (admin list, CSV export, bulk email)
- Ticket sales analytics + transfer
- Check-in system (6-char codes + manual by email + stats)
- iCal export (single event + month subscription feed)
- WCAG 2.1 AA accessibility + mobile responsive

## Parity progress
- MemberShip: ~45% → ~65% MemberPress parity
- EventDash: ~45% → ~70% Events Calendar parity

## Rick Rubin essentials verified
1. Ownership over access — portal shows "yours"
2. Simple at edge — lock/unlock, month/list
3. Consistency over features — data fresh, times exact
