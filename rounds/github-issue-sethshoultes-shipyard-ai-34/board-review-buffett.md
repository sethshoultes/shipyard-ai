# Board Review: SEODash Plugin
**Reviewer:** Warren Buffett
**Date:** 2026-04-14
**Project:** GitHub Issue #34

---

## Score: 3/10
**Justification:** Classic engineer hobby project — no pricing, no distribution, no moat.

---

## Unit Economics

**Customer Acquisition Cost (CAC):** Unknown. Zero GTM strategy.

**Cost to Serve:**
- Sitemap generation: ~500 KV reads/month per customer
- Dashboard queries: ~50 reads/month (cached)
- Minimal compute — pennies per site
- **Estimated:** $0.10/month per site at scale

**Problem:** Who's paying? How much? Never addressed.

---

## Revenue Model

**Current state:** Hobby.

**Missing:**
- No pricing documented
- No licensing model (MIT = free forever)
- No SaaS wrapper
- No upsell path
- No recurring revenue mechanism

**Could be:**
- $29/month per site (Yoast Premium model)
- $99/month agency tier (unlimited sites)
- But nothing exists yet

**Verdict:** Build it and they'll pay? Doesn't work that way.

---

## Competitive Moat

**What stops copycats:** Nothing.

**Observations:**
- Generic SEO checklist (Google's free guidelines)
- Sitemap generation (commodity, 100+ options)
- Open source MIT license = instant cloning
- No proprietary data
- No network effects
- No switching costs

**Incumbents:**
- Yoast (WordPress): 12M+ active installs, 15 years head start
- RankMath: Free tier kills small players
- SEMrush, Ahrefs: Enterprise SEO with backlink data

**Differentiation:** "Works with Emdash CMS."
- Emdash user base: Unknown (likely <100)
- Lock-in value: Zero

**Time to clone:** One weekend for competent developer.

---

## Capital Efficiency

**Investment to date:**
- 8 commits
- ~200 lines modified
- ~100 lines deleted (good)
- 19 test failures ignored
- Zero user validation

**Burn rate:** Engineer time with no revenue.

**Smart moves:**
- Killed dead features (keywords, robots UI, sitemap overrides)
- 100x performance gains via denormalization
- Small surface area (969 lines total)

**Red flags:**
- 19/44 tests failing — "pre-existing issues" excuse doesn't fly
- Never deployed to real customer
- No feedback loop
- Building in vacuum

**Efficiency score:** 5/10. Doing more with less, but building what?

---

## Strategic Questions

1. **Market size:** How many Emdash sites exist? Growing?
2. **Willingness to pay:** What's Google Search Console cost? $0.
3. **Distribution:** Emdash plugin marketplace? Doesn't exist.
4. **Lock-in:** What keeps customers from switching to WordPress + Yoast?

**Answers:** None documented.

---

## Recommendation

**Do not invest** until:

1. **Pricing model defined** — What's the product worth?
2. **Beachhead customer** — Deploy to Peak Dental, charge them $50/month
3. **Competitive analysis** — Why not use Yoast API + headless CMS?
4. **Emdash ecosystem validation** — Is this CMS growing or dying?

**Alternative paths:**

- **Pivot to SaaS:** Decouple from Emdash, become headless SEO API
- **Acqui-hire play:** Build to showcase eng talent, not revenue
- **Open source brand:** Give away plugin, monetize consulting/support

**Current path:** Engineering exercise masquerading as product.

---

## Buffett's Iron Rule

> "Price is what you pay. Value is what you get."

**This project:**
- Price: Engineer time (high)
- Value: Unknown (no customers, no revenue, no validation)

**Math doesn't work.**

---

**Final Word:** Come back when someone's paid for it. Until then, it's just code.
