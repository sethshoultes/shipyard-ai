# Round 1 — Elon Musk (Chief Product & Growth)

## The Brutal Truth

We built 6 plugins against a **hallucinated API**. That's ~10,000 lines of code that literally cannot run. This isn't a bug fix — this is a rewrite dressed up as maintenance.

The PRD says "fix the existing code, don't rewrite from scratch." That's optimistic thinking. When 114 instances of `throw new Response` need to become `throw new Error`, and you're touching every error path in 3,984 lines — you're rewriting. Call it what it is.

---

## Architecture: First Principles

**Simplest system that could work:**
1. Build a lint script: `grep -r "throw new Response\|rc\.user\|rc\.pathParams" plugins/`
2. Auto-fix mechanical patterns with sed
3. Manual fix the 20% that requires reasoning
4. Deploy. Test. Ship.

**What the PRD actually demands:**
6 plugins × 7 success criteria × 4 test sites × Playwright screenshots × curl every route = 168+ verification checkboxes before "done."

**The PRD conflates two things:**
- **Fixing broken code** (mechanical regex, 2 hours)
- **Validating deployments** (infra work, 4+ hours)

Separate them. Fix all 6 plugins first. Deploy and test in parallel second.

---

## Performance: Where Are the Bottlenecks?

**The feedback loop kills velocity:**
Fix → Build → Deploy → Curl → Screenshot → Check console = 10+ minute cycles. At 6 plugins × 3 iterations = **3+ hours just waiting**.

**The 10x path:**
1. **Local Emdash mock** — validate `throw new Error` without live Cloudflare
2. **Parallel deploys** — fix all 6, deploy all 6, test all 6 simultaneously
3. **Skip Playwright until fixes validated** — screenshots are proof-of-done, not debugging tools

**The real blocker** (buried in PRD line 49):
> "admin route returns valid JSON via curl but Emdash's PluginRegistry fails with `.map()` error"

This is a **response shape mismatch**, not a code bug. Fix this once for EventDash, pattern transfers to all 6. This is a 1-hour investigation, not scattered across 6 plugins.

---

## Distribution: How Does This Reach 10,000 Users?

**It doesn't.** These are internal plugins for Emdash sites.

The real distribution question: **can future Shipyard agents fix plugins without this tribal knowledge?**

Answer: No. The PRD requires reading:
- EMDASH-GUIDE.md (1750 lines)
- Working sandbox-entry.ts example
- Block Kit JSON format
- Undocumented `rc.input` vs `rc.pathParams` differences

**What would scale:** `npx emdash lint-plugin plugins/membership` that codifies the banned patterns and auto-suggests fixes. Ship the tool, not the documentation.

---

## What to CUT (v2 Masquerading as v1)

| Cut | Reason |
|-----|--------|
| **Playwright screenshots for every admin page** | One screenshot per plugin showing Block Kit renders = sufficient |
| **"Wire into example sites" for P2 plugins** | FormForge and CommerceKit have no banned patterns. Test after P0/P1 done |
| **EventDash admin UI debugging** | Different bug (PluginRegistry `.map()` error). Separate ticket |
| **"Check browser console for JavaScript errors"** | Either Block Kit renders or it doesn't. Console errors are Emdash framework bugs |

**Critical path:** MemberShip (P0) → ReviewPulse (P1) → SEODash (P1) → validate all three → then touch P2s.

**Pure scope creep:** Testing 6 plugins on 4 different sites. One plugin on one site validates the pattern. The rest is copy-paste.

---

## Technical Feasibility: Can One Agent Session Build This?

**The math:**
- 3,984 + 2,051 + 969 = **7,004 lines** across P0/P1 plugins
- 114 + 72 + 31 = **217 banned pattern instances**
- Mechanical fixes: ~2 hours
- Block Kit format debugging: ~1 hour
- Deploy/test all 3: ~2 hours
- **Total: ~5 hours**

**One agent session can do this IF:**
1. It ignores P2 plugins (no banned patterns = no fix needed)
2. It parallelizes deploys
3. It uses grep/sed for mechanical fixes, not line-by-line manual edits

**One agent session cannot do this IF:**
- It reads every file character-by-character
- It manually edits each `throw new Response`
- It waits for sequential deploys
- It debugs Playwright setup

Context limits will hit before completion.

---

## Scaling: What Breaks at 100x Usage?

| Component | Now | At 100x | Risk |
|-----------|-----|---------|------|
| KV storage | ~1K records | ~100K records | `.query()` timeouts on large lists |
| Stripe webhooks | 10/day | 1K/day | Cloudflare handles, no issue |
| Plugin sandboxing | 6 plugins | 600 plugins | Worker isolate limits |
| Block Kit rendering | 1 admin | 100 admins | Stateless, scales linearly |

**The systemic failure:** Plugins were built against a hallucinated API because the SDK docs didn't exist or weren't enforced.

Fixing 6 plugins treats the symptom. The cure: `npx emdash validate-plugin` that fails at publish time, not fix-it-later.

**At 100 plugins**, you cannot manually grep for banned patterns. You need CI enforcement.

---

## Bottom Line

This PRD is **80% mechanical regex work** disguised as "plugin fixing." The 20% that requires reasoning:
1. Block Kit response shape (the `.map()` error)
2. `rc.pathParams` → `rc.input` mapping logic
3. Auth flow changes when `rc.user` is removed

**Ship a lint script. Auto-fix the mechanical stuff. Focus human/AI effort on the 20% that requires reasoning.**

Stop writing PRDs. Start deploying.
