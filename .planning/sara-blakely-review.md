## Sara Blakely Gut-Check

**Verdict: Unsellable.**

- Payment? No. Non-devs can't use it (zero task UI, only REST endpoint). Devs won't pay for a Claude wrapper they build in an hour.
- "Agent orchestration hub" is marketing theater. Two agents. Keyword map + fallback. Thin value.
- Cloudflare Worker dependency = extra setup chain. Customers abandon at second API key.

**Bounce triggers:**
- Admin page is settings + logs. No "Generate" button. User reads "Send a POST request to /wp-json/agentpress/v1/run." Bounces immediately.
- No instant gratification. No press-go-see-result loop.
- "Why not just use Claude directly?" No good answer in plan.

**30-second pitch (actual):**
> "AgentPress routes AI tasks inside WordPress via REST API. Two built-in agents write text and return image URLs. Requires Claude API key, Cloudflare Worker, and cURL skills."
> *Pitch doesn't close. Too much setup, too little payoff.*

**$0 test:**
- Post in WordPress Facebook groups: "Would you pay $49/year for AI that writes posts inside your dashboard?" Count "yes" replies.
- If >10 real yeses, build a Gutenberg block with a "Write intro about [topic]" button. Not REST endpoints. Not orchestration. One working button.

**Retention hook:**
- None. Pass-through middleware with zero lock-in. Users with Claude keys bypass you in week two.
- Needs: auto-publish drafts, content calendar, media library auto-import. Something WordPress-specific that Claude alone can't do.

**Bottom line:** Polished plumbing. No one asked for a smarter pipe.
