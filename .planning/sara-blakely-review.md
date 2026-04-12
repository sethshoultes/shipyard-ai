# Sara Blakely Gut-Check: AgentBench Phase 1

**Would a real customer pay for this?**
No. Not yet. It's free (npm), which is right for v1. But would they *choose* it? Maybe. The "replace prayer with proof" hook is strong. Developers live in fear of AI agents breaking in production. That fear is real money. But they won't pay until they've felt the relief. First run has to nail it.

**What's confusing? What would make someone bounce?**
- "AgentBench" means nothing. It's jargon. Nobody wakes up wanting a "bench."
- `matches_intent` requires an API key. That's friction. First-time user hits a wall unless they read everything.
- HTTP endpoint example assumes they already have an agent running. Most don't.
- "Evaluators" is engineer-speak. Call them "checks" or "expectations."

**30-Second Elevator Pitch:**
"You built an AI agent. It works on your laptop. You have no idea if it'll work tomorrow. AgentBench is one command that tells you: green means ship, red means fix. No dashboards, no logins, no setup. Write a YAML file with your test cases, run `npx agentbench`, get an answer."

**What would I test first with $0 marketing budget?**
Post the YAML example in AI agent Discord servers (LangChain, AutoGPT, Claude). Say nothing else. "Here's how I test my agents." If people screenshot it and share — you're onto something. If they ask "how do I install?" — you win. Silence means the value prop isn't landing.

**What's the retention hook?**
Weak. Once tests pass, why come back? Need: (1) test file versioning showing regressions over time, (2) "last run" comparison, or (3) CI integration that makes it painful to remove. Right now it's one-and-done. Great for adoption, bad for habit.

**Bottom line:** The insight is right — developers pray their agents work. The execution focuses too much on elegance (500 lines! batched LLM calls!) and not enough on the moment of relief. Ship it, but watch what happens AFTER the first run. That's where you'll learn what this actually needs to be.

—Sara
