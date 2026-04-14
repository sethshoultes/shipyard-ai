# PRD: Plugin: ReviewPulse — Review Management

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#32
> https://github.com/sethshoultes/shipyard-ai/issues/32

## Metadata
- **Repo:** sethshoultes/shipyard-ai
- **Issue:** #32
- **Author:** sethshoultes
- **Labels:** plugin, p1
- **Created:** 2026-04-05T03:48:14Z

## Problem
Review management for Emdash CMS — Google/Yelp reviews, display widgets, respond from admin.

## Status: Broken — Needs Fix

### What Exists
- Plugin code at `plugins/reviewpulse/src/sandbox-entry.ts` (2,051 lines)

### What's Broken
- **72 `throw new Response()`**, **17 `rc.user`**, **1 `rc.pathParams`**
- Never tested against real Emdash

### Fix Plan
- Part of PRD `plugin-audit` — will be wired into Bella's Bistro for testing
- See `docs/EMDASH-GUIDE.md` and `BANNED-PATTERNS.md`

## Success Criteria
- Issue sethshoultes/shipyard-ai#32 requirements are met
- All tests pass
