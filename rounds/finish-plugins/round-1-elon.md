# Round 1 — Elon Musk (Chief Product & Growth)

## The Brutal Truth

PRD says 6 plugins with hundreds of banned patterns. I ran the grep. Reality:
- `throw new Response`: **79 total** (only in membership + eventdash)
- `rc.user`: **15 total** (only in membership + eventdash)
- `rc.pathParams`: **5 total** (only in eventdash)

The PRD numbers are **hallucinated or stale**. Total banned patterns: ~99. Not 217.

FormForge and CommerceKit? **Zero banned patterns.** Why are they in this PRD at all?

---

## Architecture: First Principles

**Simplest system that works:**
```bash
sed -i 's/throw new Response/throw new Error/g' plugins/membership/src/*.ts
sed -i 's/rc\.user//g' plugins/membership/src/*.ts
```
Run build. Fix the 5 edge cases that break. Deploy. Done.

**What the PRD demands instead:**
- Read EMDASH-GUIDE.md (1,754 lines)
- Read BANNED-PATTERNS.md (doesn't exist — grep returns nothing)
- Read eventdash as "working reference" (3,442 lines)
- Curl every route, screenshot every page, check browser console

That's 5,000+ lines of documentation reading for 99 find-replace operations.

---

## Performance: Bottlenecks & 10x Path

**Current bottleneck:** Serial validation. Each plugin needs build → deploy → curl → Playwright. At 10 min/plugin × 6 = 60 minutes of pure waiting.

**10x path:**
1. Fix all code in one pass (30 min)
2. Build all 6 in parallel (`npm run build &` × 6) — 2 min
3. Deploy all 6 in parallel — 5 min
4. Curl all routes in a single bash script — 2 min
5. Playwright only on P0s (membership, eventdash) — 10 min

Total: **50 minutes**, not 3+ hours.

---

## Distribution: 10,000 Users Without Paid Ads

**Wrong question.** This is internal tooling, not a product.

The right question: **How do we prevent hallucinated APIs from shipping again?**

Answer: `npx emdash lint-plugin` that fails CI if it finds banned patterns. Ship that tool and you never write this PRD again.

---

## What to CUT

| CUT NOW | REASON |
|---------|--------|
| **FormForge (P2)** | Zero banned patterns. Verify build only. |
| **CommerceKit (P2)** | Zero banned patterns. No test site assigned. Defer. |
| **Playwright for every plugin** | One screenshot proving Block Kit renders = done |
| **"Wire into example sites"** | One site validates the pattern. The rest is copy-paste. |
| **BANNED-PATTERNS.md** | File doesn't exist. Remove from PRD or create it. |

**Keep:**
- MemberShip (actual banned patterns)
- EventDash admin Block Kit mystery (actual bug)
- ReviewPulse/SEODash (small, batch-apply fixes from MemberShip)

---

## Technical Feasibility: One Agent Session?

**Yes, easily.**

12,288 total lines, but:
- 99 mechanical replacements (sed/regex)
- 1 Block Kit format investigation (read Emdash source)
- 4 build/deploy cycles

**Risk:** EventDash Block Kit debugging. PRD says "PluginRegistry fails with `.map()` error." That's a response shape mismatch. Could be 30 minutes or 3 hours depending on how documented the Block Kit spec is.

**Mitigation:** Timebox Block Kit to 1 hour. If unresolved, ship everything else and file separate ticket.

---

## Scaling: What Breaks at 100x?

| At 100x... | What breaks | Fix |
|------------|-------------|-----|
| 100x events in EventDash | KV list queries timeout | Paginate with cursors |
| 100x members in MemberShip | Same KV issue | Same fix |
| 100 plugins total | Manual grep for banned patterns | CI lint tool |
| 100 concurrent admins | Nothing — Block Kit is stateless | N/A |

**Systemic risk:** Plugins were built against hallucinated APIs because there was no validation at build time. Without `npx emdash lint-plugin`, you'll repeat this cycle for every new plugin.

---

## Bottom Line

**This is 2-3 hours of work dressed up as a multi-day project.**

1. sed the banned patterns (30 min)
2. Build all 6 in parallel (5 min)
3. Debug the 3 edge cases that break (30 min)
4. Deploy and curl-test P0s (30 min)
5. Fix Block Kit shape for EventDash (1 hour max)

Cut FormForge/CommerceKit from scope. Cut Playwright theater. Ship by EOD.

**The PRD's success criteria is bureaucracy. The real success criteria: plugins build, routes return JSON, admin pages render. Everything else is v2.**
