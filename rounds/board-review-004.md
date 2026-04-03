# Board Review #004 — Jensen Huang

**Date**: 2026-04-03
**Commits reviewed**: 21 PRs merged, 3 live demo sites, 1 main site
**Agency state**: OPERATIONAL — sites live, ongoing polish

## Assessment

The agency crossed a critical threshold this session: live demo sites that prospects can visit. Three EmDash sites running on DigitalOcean with Caddy reverse proxy, HTTPS via Let's Encrypt, and custom content. The portfolio page shows real screenshots in browser mockups. This is no longer a pitch deck — it's proof of work.

The dispatch pattern improved significantly. Content writers, QA auditors, and designers are now spawning in parallel. Margaret filed a real QA report that found template emails, broken footer links, and missing alt text — all fixed within minutes by parallel agents.

## Concern: The Sites Still Look Like Siblings

All three demo sites share the same EmDash marketing template: identical layout, identical purple/pink gradient, identical abstract SVG hero image. The content is differentiated (Italian restaurant vs dental practice vs design agency) but the visual identity is not. A prospect visiting all three will immediately see they're the same template with different words.

This matters because Shipyard AI's value proposition is "we build custom sites, not templates." If the portfolio showcases three sites that visually look like templates, the pitch contradicts itself.

## Recommendation

**Each demo site needs a distinct visual identity: unique color palette, unique hero treatment, unique typography pairing.**

The design agents are already working on this (terracotta for Bella's, teal for dental). Go further:

1. Bella's Bistro: warm serif typography (Playfair Display), earthy palette, remove the abstract SVG entirely — use a solid color hero with large text
2. Peak Dental: clean sans-serif (already Inter), clinical blue/white, geometric accent shapes instead of the organic blobs
3. Craft & Co: the portfolio template already looks different — just ensure the project images load correctly

Three sites that look like three different agencies built them. That's the demo that sells.

---

*Previous topics (not repeated): #001 free pilot, #002 deploy gap, #003 token tracking.*
