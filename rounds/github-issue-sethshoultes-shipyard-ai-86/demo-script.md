# Anvil — 2-Minute Demo Script

---

NARRATOR
Eleven forty-seven. Board demo at nine. I need an LLM on Cloudflare Workers with streaming, rate limits, and a small miracle.

[SCREEN: Laptop clock. Calendar alert: "Board Demo — 09:00".]

NARRATOR
Ordinarily I'd open the docs. I'd weep. I'd copy a template from a repo abandoned during the last administration.

[SCREEN: Browser tabs. Cloudflare docs. GitHub repos with 2022 commit dates. Stack Overflow.]

NARRATOR
Tonight? I don't have time for that.

[SCREEN: Terminal. Hands type `npx anvil create --llm`.]

NARRATOR
Anvil. One flag. Zero prompts. No "what framework do you prefer?" It pulls Cloudflare's live spec, finds the latest text-generation model, and builds exactly two files. Exactly. Two. Design rule says: if the generator writes a third, the generator's wrong.

[SCREEN: `index.ts` and `wrangler.toml` appear side-by-side. Highlights: `ReadableStream`, `env.AI.run`, `[[ai]]` binding, rate limit config.]

NARRATOR
No KV. No R2. No observability dashboard I'll never check. Just a streaming handler and a config that knows what it's doing.

[SCREEN: `wrangler deploy`. URL returns.]

NARRATOR
Deploy. Curl. Pray.

[SCREEN: `curl -N -d "Why do we over-engineer?" https://...`]

NARRATOR
Notice the dash-N. No buffer. We're not calling a monolith and waiting for it to finish a thought. We're streaming.

[SCREEN: Words materialize one by one: "We", "over-engineer", "because", "we're", "afraid", "to", "ship."]

NARRATOR
First token hit before my finger left return. That's not fast. That's now.

[SCREEN: k6 load test. 100 virtual users. Ramp. All green.]

NARRATOR
Hundred concurrent streams. Zero errors. P95 under four hundred ninety milliseconds. That's not a prototype. That's production.

[SCREEN: Black. White text: `npx anvil create --llm`]

NARRATOR
You could keep reading documentation. Or you could be live before this sentence ends.

[SCREEN: Fade out.]

---
*Runtime: ~2:00*
