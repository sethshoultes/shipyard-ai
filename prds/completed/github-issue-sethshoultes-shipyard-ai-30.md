# PRD: Plugin: MemberShip — Membership & Gated Content

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#30
> https://github.com/sethshoultes/shipyard-ai/issues/30

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #30
- **Author:** sethshoultes
- **Labels:** plugin, p0
- **Created:** 2026-04-05T03:48:12Z

## Problem
MemberPress equivalent for Emdash CMS.

## Status: Broken — Needs Fix

### What Exists
- Plugin code at `plugins/membership/src/sandbox-entry.ts` (3,984 lines)
- Covers: membership plans, gated content, Stripe billing, member dashboard, drip content, groups, reporting

### What's Broken
- **114 instances of `throw new Response()`** — Emdash sandbox doesn't handle thrown Response objects
- **14 instances of `rc.user`** — property doesn't exist in the sandbox adapter
- Uses `JSON.stringify/parse` with KV — Emdash KV auto-serializes
- Built against a hallucinated API, never tested against real Emdash

### Fix Plan
- PRD `plugin-audit` deployed to pipeline
- Will be wired into Sunrise Yoga site for testing (yoga memberships)
- See `docs/EMDASH-GUIDE.md` and `BANNED-PATTERNS.md` for correct patterns

## Success Criteria
- Issue sethshoultes/shipyard-ai#30 requirements are met
- All tests pass
