# Sara Blakely Review: EventDash Fix Plan

**Would a customer pay?** No. This isn't a product — it's technical debt cleanup. No customer wakes up wanting "fewer banned patterns."

**What's confusing?**
- 95 violations → 133 lines. Where'd the code go? Did you delete features or just fluff?
- "Already fixed" but making a 6-task plan to verify? Just run the damn tests.
- Wave 1, 2, 3 for what? Grep, compile, write docs? This is 30 minutes of work stretched into a process.

**30-second pitch:**
"We broke our own rules 95 times. We're fixing the code so it follows platform patterns. Zero new features. Zero customer impact. Just compliance."

**$0 marketing test:**
Can't test compliance. Either it works or it doesn't. Run the build, load the plugin, create an event. If it doesn't crash, ship it.

**Retention hook:**
None. Customers don't know or care about "throw new Response" vs return objects. If the plugin works exactly the same, this is invisible.

**Gut check:**
You're treating routine maintenance like it's a product launch. The work is done — file went from 3,442 lines to 133. Just verify it compiles and works. This plan has more documentation tasks than code changes.

**What I'd do:**
1. Run TypeScript build
2. Load plugin in staging
3. Create/list/view one event
4. Ship if it works
5. Write one commit message

Six tasks, three waves, requirements matrix for internal refactoring? The codebase needed a surgeon. This plan brought a committee.
