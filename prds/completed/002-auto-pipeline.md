# PRD-002: Auto-Pipeline — PRD to Live Site, Zero Humans

> **Status**: BUILD
> **Created**: 2026-04-03

## Overview
When a GitHub issue with `prd-intake` label is created, a GitHub Action automatically parses the PRD, generates an EmDash site, and deploys it to Cloudflare. Comments the live URL back on the issue.

## Components
1. GitHub Action workflow (triggers on prd-intake label)
2. PRD parser (Workers AI extracts structured data)
3. Seed generator (builds seed.json from parsed data)
4. Auto-deploy (Cloudflare Workers + D1 + R2)
5. Issue commenter (posts live URL)

## Guardrails (Jensen #006)
- Deploy to preview URL first, not production
- Rate-limit: 3 deploys per hour
- Content moderation pass before production promotion
