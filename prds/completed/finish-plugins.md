# PRD: Fix All Broken Emdash Plugins

## Problem
Multiple Emdash plugins were built before `docs/EMDASH-GUIDE.md` existed. They were coded against a hallucinated API and contain banned patterns. They need to be fixed to actually work with real Emdash.

## CRITICAL RULES
1. **Read `docs/EMDASH-GUIDE.md` BEFORE touching any code** — this is the verified Emdash plugin API
2. **Read `BANNED-PATTERNS.md`** — any banned pattern = automatic failure
3. **Do NOT start over** — fix the existing code, don't rewrite from scratch
4. **Do NOT guess APIs** — if unsure, read `examples/sunrise-yoga/node_modules/emdash/dist/` source
5. **Test against a live site** — curl every route, screenshot every admin page with Playwright

## Reference: Working Plugin
`plugins/eventdash/src/sandbox-entry.ts` (130 lines) is the working reference. It was rewritten against the real Emdash API. Use it as your template for how routes and admin Block Kit should work.

## Plugins to Fix (in priority order)

### 1. MemberShip (`plugins/membership/`) — P0
- 3,984 lines, 114 `throw new Response`, 14 `rc.user`
- Fix: Replace all `throw new Response(...)` with `throw new Error("...")`
- Fix: Remove all `rc.user` auth checks (Emdash handles auth)
- Fix: Remove `JSON.stringify` in `kv.set()` and `JSON.parse` on `kv.get()` — KV auto-serializes
- Wire into Sunrise Yoga site for testing
- Test site: sunrise-yoga.seth-a02.workers.dev
- API Token: ec_pat_z3IdW-q-nG4w1bDadqTdGSkUxgNI-FGehCIgRjc2o8Q

### 2. ReviewPulse (`plugins/reviewpulse/`) — P1
- 2,051 lines, 72 `throw new Response`, 17 `rc.user`, 1 `rc.pathParams`
- Same fixes as MemberShip plus: replace `rc.pathParams` with reads from `rc.input`
- Wire into Bella's Bistro for testing

### 3. SEODash (`plugins/seodash/`) — P1
- 969 lines, 31 `throw new Response`, 11 `rc.user`
- Same fixes as MemberShip
- Wire into Peak Dental for testing

### 4. FormForge (`plugins/formforge/`) — P2
- 1,289 lines, no banned patterns found
- Needs live deployment testing — may still have issues with Block Kit or KV usage
- Wire into Craft Co Studio for testing

### 5. CommerceKit (`plugins/commercekit/`) — P2
- 1,420 lines, no banned patterns found
- Needs live deployment testing
- No example site assignment yet — test on any available site

### 6. EventDash Admin UI (`plugins/eventdash/`) — P0
- API routes work but admin Block Kit pages don't render in browser
- The `admin` route returns valid JSON via curl but Emdash's PluginRegistry fails with `.map()` error
- Need to figure out the exact Block Kit response format Emdash expects
- Check the Block Kit playground: https://emdash-blocks.cto.cloudflare.dev/
- Read how Emdash's admin renders plugin pages in the source

## Deploy Credentials
- Cloudflare Token: cfat_dO0mssaJcaRknzI4CMzm8Zg62JHkjRoIVhQxP6Pm7cfee40d
- Cloudflare Account: a02352ad1742197c106c1774fcbada2d

## Testing Requirements
For EACH fixed plugin:
1. Grep for banned patterns — any match = fail, go back and fix
2. Build: `cd examples/{site} && npm install && npx astro build`
3. Deploy: `npx wrangler deploy`
4. Curl every API route and verify valid JSON response
5. Curl the admin route and verify Block Kit JSON response
6. Screenshot the admin pages with Playwright to verify they render
7. Check browser console for JavaScript errors

## Success Criteria
- All 6 plugins build without errors
- All plugin API routes return valid JSON
- All plugin admin pages render in the Emdash admin UI (Playwright screenshots as proof)
- Zero banned patterns in any plugin
- Each plugin wired into an example site and verified
