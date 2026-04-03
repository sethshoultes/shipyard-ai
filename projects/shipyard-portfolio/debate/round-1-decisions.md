# PRD-001 Debate — Round 1

**Date**: 2026-04-03
**Participants**: Steve Jobs (Design), Elon Musk (Engineering), Phil Jackson (Moderator)

## Decision 1: Build on Astro standalone or EmDash?

**Steve**: Build on EmDash. We're an EmDash agency — if our own site doesn't run on EmDash, we have zero credibility. Dog-food or die.

**Elon**: EmDash requires Node 22+ and we're on Node 20. We can't run `create-emdash` on this server. Counter-proposal: build on Astro 5 (which EmDash is built on) with the same patterns — Portable Text-ready content, Tailwind, component architecture. When we deploy to Cloudflare, it's trivially upgradeable to full EmDash once we can install it.

**Decision**: **Astro 5 + Tailwind**, structured for easy EmDash migration. Pragmatic, not purist. Ship today, migrate tomorrow.

## Decision 2: Reuse Dashwork assets or start fresh?

**Steve**: We already built a full site at /home/agent/dashwork/ with the right structure — 5 pages, dark theme, orange accent, all the brand work. That was a naming exploration. The design is solid. Rebrand to Shipyard, don't rebuild from scratch.

**Elon**: Agreed, but we already have a Next.js website at /home/agent/shipyard-ai/website/ from PR #1. Use that as the base — it's already merged to main. Don't introduce a second framework.

**Decision**: **Use the existing Next.js website** at `website/`. It's already deployed structure. Enhance it with SEO, refine copy, add contact form. No framework switch mid-project.

## Decision 3: Contact form backend?

**Elon**: No backend yet. Use `mailto:` link or Formspree/Cloudflare Forms for MVP. We can add a real API later.

**Steve**: Agreed. Ship the form, wire it to an email. Don't build infrastructure for a form.

**Decision**: **Static form with action to external service** (Formspree or similar). Add real backend in revision 1.

## Decision 4: Domain?

**Phil**: Jensen says shipyard.company. Domain TBD for actual DNS, but all meta/canonical URLs should point there.

**Decision**: **shipyard.company** as canonical. Deploy to Vercel/Cloudflare for now.

---

## Locked Decisions

1. Next.js (existing website/) — not Astro, not EmDash (Node version constraint)
2. Enhance existing 5 pages, don't rebuild
3. Static contact form (Formspree or mailto)
4. shipyard.company as canonical domain
5. Add full SEO metadata (OG, Twitter, JSON-LD) to every page
6. Dark-first, orange accent, Inter + JetBrains Mono
