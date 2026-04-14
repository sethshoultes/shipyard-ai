# PRD: Plugin: SEODash — SEO Toolkit

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#34
> https://github.com/sethshoultes/shipyard-ai/issues/34

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #34
- **Author:** sethshoultes
- **Labels:** plugin, p2
- **Created:** 2026-04-05T03:48:16Z

## Problem
SEO toolkit for Emdash CMS — per-page SEO, sitemap, social previews, JSON-LD.

## Status: Broken — Needs Fix

### What Exists
- Plugin code at `plugins/seodash/src/sandbox-entry.ts` (969 lines)

### What's Broken
- **31 `throw new Response()`**, **11 `rc.user`**
- Never tested against real Emdash

### Fix Plan
- Part of PRD `plugin-audit` — will be wired into Peak Dental for testing
- See `docs/EMDASH-GUIDE.md` and `BANNED-PATTERNS.md`

## Success Criteria
- Issue sethshoultes/shipyard-ai#34 requirements are met
- All tests pass
