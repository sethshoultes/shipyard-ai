# Sara Blakely Gut-Check — Anvil

**Verdict: Close. Not sellable yet.**

**Would they pay?**
- No. Cloudflare already has `npm create cloudflare`. "Two files, one purpose" is cute, not urgent.
- Missing: why switch? Speed to endpoint is table stakes. Need proof it streams faster or costs less.

**Bounce triggers:**
- GitHub template + CLI = two onboardings to maintain. Pick one hero.
- `--llm` flag is pointless friction. Only mode = default mode. Kill the flag.
- "One grin" promise but grin requires live URL. Clock should end at first streamed token, not file creation.
- "Plainspoken" over-engineered. Warmth doesn't sell dev tools. Speed and certainty do.

**30-second pitch:**
> Anvil scaffolds a streaming LLM worker on Cloudflare in under a minute. One command. Live URL. Zero config files to touch.

**$0 test:**
- Post generated `index.ts` in full on X/HN. No landing page. Caption: "This is all it takes." Measure saves vs clicks.
- If code doesn't get 100 likes, product isn't simple enough.

**Retention hook:**
- None. Scaffold-and-go is fine for v1, but admit it.
- Real hook: auto-update when Cloudflare deprecates models. "Anvil keeps your worker current." Add to v2.

**One fix before build:**
- Kill `--llm`. Default to LLM. Every keystroke saved = customer won.
