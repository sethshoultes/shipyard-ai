# Board Review: AgentBridge WordPress MCP Server
**Reviewer:** Warren Buffett (Great Minds Agency Board)
**Date:** 2026-05-01
**Verdict:** This is not a business. It is a marketing expense with no revenue line.

---

## Unit Economics
- **CAC:** ~$0. Organic HN post + WP.org directory. No paid acquisition.
- **COS:** $0. Runs on user's PHP server. We bear no hosting, no bandwidth, no support desk.
- **Catch:** Economics only work because value created is captured by user, not us. Zero monetization of the marginal install.

## Revenue Model
- GPL-2.0+ open source. Free forever.
- No freemium gate. No support tier. No SaaS upsell. No "powered by" badge.
- "Dogfood our stack" is an engineering goal, not a revenue model.
- 100 installs = $0. 10,000 installs = $0.
- **This is a hobby.** A well-scoped hobby, but still a hobby.

## Competitive Moat
- None.
- MCP spec is public. WordPress REST API is public. Bridge is ~500 lines of PHP.
- Any PHP developer replicates this in a weekend.
- First-mover in protocol bridges means almost nothing. Standards evolve; community forks multiply.
- No network effects. No data gravity. No switching costs. User can uninstall and switch tomorrow.

## Capital Efficiency
- 6–8 hour build. Low burn. Good.
- Smart cuts: removed upload_media (abuse vector), user tools (GDPR risk), connection logs (complexity). Discipline here is admirable.
- But capital efficiency requires return on capital. Deploying 6 hours to produce $0 in perpetuity is not efficient. It is consumption.
- Missing: customer support budget, security audit budget, infrastructure for any future SaaS tier.

## Score: 2/10
**Justification:** No earnings power. No moat. No path to cash. Code quality and scope discipline are irrelevant when the product is priced at free and costs nothing to copy. We are paying to build someone else's infrastructure.

---

**Buffett Note:** I have never made money betting on "standards" or "ecosystem plays" that forgot to charge. If Shipyard AI wants to own this bridge, own the toll booth. Put a price on it, or kill it and spend the hours on something with a invoice attached.
