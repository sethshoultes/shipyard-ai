# Round 1 — Elon Musk (Chief Product & Growth Officer)

## Architecture: What's the Simplest System That Could Work?

The PRD claims 6 plugins need fixing. I ran the actual numbers:
- **Total lines:** 16,979 across all plugins
- **Banned patterns found:** 99 violations (79 `throw new Response`, 15 `rc.user`, 5 `rc.pathParams`)

The simplest fix is mechanical find-replace:
```bash
sed -i 's/throw new Response/throw new Error/g' plugins/*/src/*.ts
sed -i '/rc\.user/d' plugins/*/src/*.ts
```

That handles 94 of 99 violations. The remaining 5 `rc.pathParams` need manual `rc.input` rewrites.

**But here's the real question:** Why do we have 17K lines of plugin code?

EventDash (the "working reference") is 3,442 lines. For event management. That's WordPress-level bloat. A clean implementation is 300-500 lines. These plugins were over-engineered against hallucinated APIs — the architecture itself is the problem.

**Verdict:** Fix the 99 violations mechanically. Don't polish. These plugins need eventual rewrites, not extensive QA.

---

## Performance: Where Are the Bottlenecks? What's the 10x Path?

**Current bottleneck:** Serial validation theater.

PRD demands: build → deploy → curl → Playwright screenshots → console check, for EACH plugin. That's ~15 min × 6 = 90 minutes of pure waiting.

**The 10x path:**
1. Fix all violations in one sed pass (5 min)
2. Parallel build all 6 plugins (2 min with `&`)
3. Parallel deploy (5 min)
4. Single bash script curls all routes (2 min)
5. Skip Playwright — if JSON returns, it works

**Total: 15 minutes**, not 90+.

**Actual performance concern nobody mentions:** KV operations. MemberShip at 3,600 lines probably makes 10+ KV calls per request. That's the real scaling bottleneck, not banned patterns.

---

## Distribution: How Does This Reach 10,000 Users?

**This PRD has zero distribution angle.** It's tech debt remediation.

Plugins don't acquire users. Products do. The real question: What can we BUILD with working plugins that attracts 10K users?

Options:
- **MemberShip** → Gated newsletter platform (compete with Substack)
- **EventDash** → Local event aggregator (compete with Meetup)
- **ReviewPulse** → SMB review management (compete with Yelp Business)

But we're testing on Sunrise Yoga and Bella's Bistro — demo sites with zero users.

**Distribution strategy that works:**
1. Pick ONE plugin (MemberShip)
2. Build ONE product around it (paid newsletter toolkit)
3. Launch on Product Hunt, write "How I Built X" posts
4. The plugin is the means, not the end

Fixing 6 plugins doesn't move distribution needle. Shipping ONE product does.

---

## What to CUT: Scope Creep Masquerading as v1

| CUT | REASON |
|-----|--------|
| **FormForge** | Zero banned patterns. Build-verify only. |
| **CommerceKit** | Zero patterns, no test site assigned. Ghost feature. |
| **Playwright screenshots** | JSON response = works. Visual QA is v2. |
| **"Check browser console"** | If curl passes, you ship. Polish later. |
| **5 different test sites** | ONE site validates the pattern. Rest is copy-paste. |

**Keep in v1:**
- MemberShip (highest banned pattern count, P0)
- EventDash Block Kit fix (actual unsolved bug)
- ReviewPulse/SEODash (batch-apply MemberShip fixes)

---

## Technical Feasibility: Can One Agent Session Build This?

**The full PRD? No.** Too many serial dependencies and validation steps.

**A scoped version? Yes.**

One session can:
1. sed all 99 violations (5 min)
2. Build MemberShip + EventDash (5 min)
3. Deploy to one test site (5 min)
4. Curl-validate happy paths (5 min)
5. Debug EventDash Block Kit response shape (1 hour max)

**Timebox:** 90 minutes total. If Block Kit mystery exceeds 1 hour, file separate ticket and ship the rest.

**The trap:** PRD wants comprehensive QA across 6 plugins and 5 sites. That's 3+ sessions of context switching. One plugin, one site, ship it.

---

## Scaling: What Breaks at 100x Usage?

| At 100x | What Breaks | Mitigation |
|---------|-------------|------------|
| 100x members | KV list queries timeout | Cursor pagination, not `.list()` |
| 100x events | Same KV issue | Same fix |
| 100x concurrent writes | D1 10ms write latency = 10s queues | Cloudflare Queues for async writes |
| 100x plugins | Manual banned-pattern checking | Build-time lint tool (`npx emdash lint-plugin`) |

**Systemic risk:** Plugins were built against hallucinated APIs because there's no build-time validation. Without CI that fails on banned patterns, you'll rewrite this PRD for every new plugin.

**100x fix that matters:** Add grep check to CI pipeline. Costs 10 minutes. Prevents future PRDs like this.

---

## Bottom Line

**This is 90 minutes of work stretched into a multi-day project.**

The PRD's success criteria is process theater. The REAL success criteria:
1. ✅ `npm run build` passes
2. ✅ Routes return valid JSON
3. ✅ Admin pages render (even if ugly)

Everything else — Playwright, browser console, multi-site testing — is v2 polish.

**My call:** Ship MemberShip and EventDash today. Defer the rest. Build the lint tool so we never write this PRD again.
