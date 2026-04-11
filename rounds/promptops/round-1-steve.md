# Steve Jobs — Chief Design & Brand Officer
## PromptOps Design Review, Round 1

---

### Product Naming: Kill "PromptOps"

**PromptOps is a forgettable, committee-designed name.** It sounds like DevOps had a baby with a buzzword generator. Nobody falls in love with "Ops."

The name should be **Drift**.

Why? Because prompts drift. They evolve. They shift between versions. And when things go wrong, you *drift back* to what worked. It's a verb. It's a feeling. It's one word. When someone asks "How do you manage your prompts?" the answer is "We use Drift." That's a sentence that sounds like a decision, not a chore.

`drift push`, `drift rollback`, `drift diff` — these feel like actions, not bureaucracy.

---

### Design Philosophy: The Prompt is the Product

Here's what everyone misses: **the prompt IS the product now.** Not the code. Not the model. The prompt. And yet we treat it like a config file buried in a repo.

This tool should make you *feel* the gravity of your prompts. Every push should feel deliberate. Every rollback should feel like a rescue mission. The dashboard shouldn't just show versions — it should tell the *story* of your prompt's evolution.

The insanely great version of this? It makes prompt engineering feel like *craftsmanship*, not configuration.

---

### First 30 Seconds: Zero to Control

Here's what happens:

1. `npm install -g drift` — done.
2. `drift init` — you get an API key, no signup form, no email verification, no friction.
3. `drift push welcome --file welcome.txt` — your first prompt is live.

In 30 seconds, you've gone from chaos to control. That's the feeling. Not "I've configured another tool." The feeling is: **"I finally have a grip on this."**

The proxy URL should be dead simple. `drift.sh/v1` — that's it. If your proxy URL has the word "api" twice, you've already lost.

---

### Brand Voice: Confident, Not Clever

Drift speaks like a senior engineer who's seen everything break at 2am. No cutesy copy. No "Oopsie! Something went wrong!" When a rollback succeeds, it says: **"Rolled back to v3. Live now."**

The voice is:
- **Direct** — "Push failed. Prompt 'system' not found."
- **Helpful without coddling** — "Try `drift list` to see available prompts."
- **Never apologetic** — We don't say sorry. We fix things.

---

### What to Say NO To

1. **NO to prompt templates in v1.** Users already have Jinja, Handlebars, whatever. We version the output, not the machinery.
2. **NO to team features at launch.** One person, one project, one API key. Collaboration is a v2 problem.
3. **NO to analytics dashboards with seventeen charts.** One number matters at first: "Is this version working?" Show pass/fail. Show latency. That's it.
4. **NO to "A/B testing" in the MVP.** This is feature creep dressed up as sophistication. Ship versioning first. Experimentation is a distraction until you have users who need it.
5. **NO to native LLM provider integrations.** The proxy is dumb. It passes headers. That's the whole point — we're the layer *before* the model, not married to it.

Simplicity isn't about what you include. It's about having the courage to exclude.

---

### The Emotional Hook: Sleep at Night

Here's why people will love this:

Right now, every developer shipping AI products has a quiet terror: *"What if the prompt someone changed last Tuesday is why conversions dropped?"* There's no history. There's no rollback. There's only git blame and prayer.

Drift gives you **the undo button for your AI's personality.**

When the CEO asks why the chatbot started being rude to customers, you don't dig through commits. You open Drift, see that version 7 went live Thursday at 4pm, and you roll back to version 6. Done. Crisis over.

**That peace of mind? That's the product.**

---

*The people who built this have to believe prompts matter. If we treat this like infrastructure tooling, we'll build infrastructure tooling. If we treat it like the control panel for AI's soul, we'll build something people can't live without.*
