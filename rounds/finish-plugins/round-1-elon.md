# Round 1 — Elon Musk (Chief Product & Growth)

## The Brutal Truth

We built 6 plugins against a **hallucinated API**. That's ~10,000 lines of code that literally cannot run. This isn't a bug fix — this is a rewrite dressed up as maintenance.

The PRD says "fix the existing code, don't rewrite from scratch." That's optimistic thinking. When 114 instances of `throw new Response` need to become `throw new Error`, and you're touching every error path in 3,984 lines — you're rewriting. Call it what it is.

---

## Architecture: First Principles

**Simplest system that could work:**
1. Read `EMDASH-GUIDE.md`
2. Read `examples/sunrise-yoga/node_modules/emdash/dist/` source
3. Replace banned patterns with real API calls
4. Test one plugin against one live site
5. Repeat for remaining 5 plugins

**What's actually happening:**
6 plugins, 4 test sites, 7 success criteria per plugin, Playwright screenshots, curl every route. That's 42+ verification steps before "done."

**Cut the ceremony.** Deploy one plugin to one site. Verify it loads. Ship. Move to next.

---

## Performance: Where Are the Bottlenecks?

The PRD buries the lede: **the admin route returns valid JSON via curl but Emdash's PluginRegistry fails with `.map()` error.**

This is the only bottleneck that matters. Everything else is find-and-replace.

**Analysis:**
- Block Kit JSON is valid
- Browser fails
- `.map()` error means the host expects an array but gets an object (or vice versa)

**10x path:**
1. `curl` the working `eventdash` admin route
2. Compare response shape to broken plugins
3. Fix the shape mismatch
4. All 6 plugins inherit the fix

This is a 1-hour investigation, not a 40-hour debug session.

---

## Distribution: How Does This Reach 10,000 Users?

**It doesn't.** Not without EmDash reaching 10,000 users first.

These are plugins FOR EmDash. EmDash market size is listed as "Unknown. 100 sites? 500?" in the decisions doc. If EmDash has 100 sites, perfect plugins get us... 100 potential users.

**Distribution strategy for plugins:**
1. Bundle MemberShip and EventDash into official EmDash templates
2. Ship enabled-by-default, not discoverable-and-installable
3. New EmDash sites get working plugins on day one
4. Zero marketing required — distribution is EmDash's problem

**The real growth question:** How does EmDash reach 10,000 users? That's upstream of this PRD.

---

## What to CUT (v2 Masquerading as v1)

**Cut from this PRD:**

| Cut | Reason |
|-----|--------|
| **Playwright screenshots** | Curl + browser console is sufficient. Screenshot infra is overhead. |
| **"Test on a live site" for all 6** | Test MemberShip on Sunrise Yoga. If it works, pattern transfers. |
| **ReviewPulse (P1)** | Zero evidence anyone uses review collection features. Fix last. |
| **SEODash (P1)** | EmDash has `plugin-seo` in the guide. Duplicate functionality. |
| **CommerceKit (P2)** | "No example site assignment yet" = no customer demand. Cut entirely or defer. |

**Ship order:**
1. EventDash (130 lines, working reference)
2. MemberShip (highest stated priority, Stripe integration)
3. FormForge (no banned patterns, likely works)
4. The rest — when someone asks for them

---

## Technical Feasibility: Can One Agent Session Build This?

**MemberShip alone:** Maybe. 3,984 lines with 114 `throw new Response` replacements. That's mechanical work. One session can do it if:
- No architectural surprises
- The Block Kit response format is documented
- Stripe webhook testing doesn't require live card transactions

**All 6 plugins:** No. The PRD describes 40+ hours of work:
- 6 plugins * (grep + build + deploy + curl routes + curl admin + screenshots + console check) = minimum 3 hours per plugin
- Plus the Block Kit format investigation
- Plus Playwright setup for screenshots (which I'm cutting anyway)

**Achievable in one session:**
1. Fix MemberShip banned patterns (2 hours)
2. Deploy to Sunrise Yoga (30 mins)
3. Debug Block Kit format if it fails (1 hour)
4. Document the working pattern (30 mins)

That's one plugin shipped. Not six.

---

## Scaling: What Breaks at 100x Usage?

| Component | Now | At 100x | Fix Required |
|-----------|-----|---------|--------------|
| KV reads | 1K/day | 100K/day | Fine ($0.05/day at KV pricing) |
| Plugin sandboxing | 10 installs | 1,000 installs | Worker isolate limits apply |
| Stripe webhooks | 10/day | 1K/day | Cloudflare handles fan-out |
| Block Kit rendering | 1 admin | 100 admins | No state, scales linearly |

**The real 100x risk:** EmDash itself. These plugins run inside EmDash's sandbox. If EmDash has scaling issues at 100x, plugins inherit them. We don't control that.

**Our scaling risk:** KV list operations. `ctx.storage.entries.query()` against 10K records times out. The decisions doc already flagged this — D1 migration path exists. Accept for v1, migrate in v2.

---

## Bottom Line

**The PRD is overcomplicated.** 6 plugins, 7 criteria each, 4 test sites, Playwright screenshots, curl every route. This is process theater for a mechanical find-and-replace task.

**What actually needs to happen:**
1. One engineer reads the working `eventdash/sandbox-entry.ts`
2. Same engineer applies the pattern to MemberShip
3. Deploy to one site
4. Verify admin loads in browser
5. Verify one Stripe transaction works
6. Ship

**Timeline:** 1 day for MemberShip. 1 day for EventDash. FormForge probably already works. ReviewPulse, SEODash, CommerceKit — when customers request them.

**The philosophy:** We hallucinated an API and wrote 10,000 lines against it. The fix is not more process. The fix is reading the real API and writing less code.

Stop documenting. Start deploying.
