# Board Verdict — SPARK v1 Deliverable

*Consolidated across Shonda Rhimes, Elon Musk, and Steve Jobs*

---

## Points of Agreement

1. **The name is SPARK.** One word. One breath. No committee amendments.
2. **One admin screen only.** Onboarding + widget toggle. Anything beyond that is a support vector or museum piece.
3. **Static demo, no live scraping.** Pre-compute 100 sites into KV. Dynamic scraping is a scaling nightmare and security liability dressed as a feature.
4. **Brand voice: warm, direct, zero jargon.** "You're #3 of 47." Not "competitive ranking within your vertical cohort." No AI badges, sparkle icons, or robot illustrations.
5. **Cut the bloat.** No FAQ reordering UI. No account card / billing dashboard in wp-admin. No thumbs up/down in the widget. No Shopify in v1.
6. **The benchmark concept is the soul.** All three board members agree that "#3 of 47" is the emotional core that differentiates SPARK from a commodity chat widget. They disagree on *timing and visibility*, not on the concept itself.
7. **The backend plumbing is solid.** KV worker, D1 aggregation cron, API client, and suppression logic are built and functional.

---

## Points of Tension

### 1. Benchmark in v1: Soul vs. Density
- **Steve**: The benchmark *is* the product. Without it, SPARK is wallpaper. Build it for five businesses; dignity creates density.
- **Elon**: A leaderboard for empty buckets is a participation trophy. Ship when 500+ businesses exist, or you get "#1 of 1."
- **Phil Jackson (Ruling)**: Benchmark Lite ships — broad buckets, suppression if <5 businesses, growth-state messaging.
- **Shonda**: The compromise is invisible. `get_benchmarks()` exists in the API. The admin never calls it. The user never feels it. The soul is buried in the basement.

### 2. Emotional Design vs. Utilitarian Implementation
- **Steve**: Every transition and shadow must whisper "this was made by people who love craft." Onboarding should feel like recognition before permission — the shock of being seen.
- **Elon**: wp-admin is a utility room, not a museum. Every animation is a conflict with a caching plugin in Nebraska. Beauty that requires perfect hosting is a support ticket.
- **Shonda**: The result is "all engine, no emotion." One screen, efficient, flat. No "We found you!" reveal. No dopamine. The story ends at "Save settings."

### 3. Distribution: Build the Bridge First, or the Billboards?
- **Elon**: Beautiful products die in obscurity every day. Where is the viral loop? The "Powered by SPARK" badge? The public FAQ page that ranks on Google? The designer partnership channel?
- **Steve**: Distribution is a consequence of a great product. Focus is a weapon. Build something worth talking about first.
- **Phil Jackson (Ruling)**: Distribution mechanics are architected into v1 (badge toggle, public FAQ permalink structure) but not built until Sprint 2, gated by 50 installs.
- **Shonda**: No shareable rankings. No "I'm #3 in Chicago" OG image. No viral loop. The 100-site demo cache is a filing cabinet with no growth mechanism.

### 4. Onboarding: Magic vs. Reality
- **Steve**: Zero forms. Zero passwords. Their business, breathing inside SPARK, instantly.
- **Elon**: WordPress requires `install_plugins`. Stripe requires an email. The API requires a key. The "shock of being seen" requires live scraping that we already cut.
- **Phil Jackson (Ruling)**: One field — business URL. The *feeling* is recognition before permission; the mechanism respects WordPress auth.
- **Shonda**: The preview card starts hidden. There is no reveal. No drama. The user types a URL and sees... a form that still needs to be saved.

---

## Overall Verdict: **HOLD**

**Score: 4/10 (Shonda Rhimes)**

The backend is built. The frontend is missing. The PRD promised "#3 of 47 Italian restaurants." The code delivers a cron job nobody sees.

SPARK is not rejected — the architecture is sound and the scope discipline is real. But it cannot ship in its current state because the user never experiences the emotional hook. The moat is dug but invisible. Owners cannot swim in water they cannot see.

---

## Conditions for Proceeding

These are non-negotiable before the HOLD is lifted:

| # | Condition | Owner | Rationale |
|---|-----------|-------|-----------|
| 1 | **Surface the benchmark card in admin.** Call `get_benchmarks()`. Show rank, total in bucket, and trend arrow. One card. One screen. | Engineering | The soul is built but buried. Unbury it. |
| 2 | **Build the weekly digest email.** One email template. One send logic. Subject line: "You're #3 in Chicago this week." | Engineering | What brings the owner back on Monday morning. |
| 3 | **Build the demo page frontend.** One HTML page. One CTA. Enter URL, see your business. The story starts there. | Engineering | The deliverable has a KV worker but no demo. The opening scene is missing. |
| 4 | **Rewrite suppression copy to create network effects.** "Not enough restaurants nearby... yet. Invite one and unlock your rank." | Product / Copy | Passive copy kills tension. Active copy creates stakes and invites density. |
| 5 | **Fix the quota-exceeded message.** Change from hostile stop-sign ("You have reached your conversation limit.") to a warm upgrade hook that points to Stripe Customer Portal. | Product / Copy | A dead end is churn. A hook is retention. |
| 6 | **Add trend arrows and movement history.** "You moved up from #5 to #3." Dopamine hit. Reason to reopen admin. | Engineering | Without change over time, rank is a number. With change, rank is a story. |

**Gate**: Re-review by Board after these six conditions are met. Target: 6/10 minimum to lift HOLD.

---

*"All engine, no emotion. The moat is dug but invisible."*
*— Shonda Rhimes*
