# Steve Jobs — Chief Design & Brand Officer
## Daemon Stability Fixes Review

---

### Product Naming

**Call it "Pulse."**

Not "daemon." Not "health service." Not "background process." *Pulse.* Because that's what it is — the heartbeat of your entire operation. When someone asks "Is Pulse running?" everyone knows exactly what they mean. When Pulse stops, you feel it.

The word "daemon" is engineering jargon that tells users nothing. Pulse tells them everything.

---

### Design Philosophy

Here's what makes this insanely great: **invisible reliability.**

The best products disappear. You don't think about your heartbeat until it skips. This system should commit your work, sync your repos, and intake your issues like breathing — automatically, silently, perfectly. The fact that code was written but never called? That's like designing a beautiful door that doesn't open. Craftsmanship means *finishing*.

The two bugs here aren't just bugs. They're broken promises. We told users "your work auto-commits" and "your issues get picked up." Neither happened. We lied with code.

---

### User Experience: The First 30 Seconds

The user shouldn't experience 30 seconds. They shouldn't experience *anything*. That's the point.

When Pulse works, the user wakes up, opens their repo, and finds their work already committed and pushed from last night's session. They check their intake and see issues already converted to PRDs. They think: "Huh, that just... works."

That moment of *not noticing* is the experience. The absence of friction is the feature.

---

### Brand Voice

**Quiet confidence.**

Pulse doesn't announce itself. It doesn't send notifications saying "I committed 3 files!" It doesn't brag. It just works. When it does speak — in logs, in errors — it's clear, direct, helpful. Never defensive. Never apologetic.

"Committed 3 files to great-minds-plugin" — not "Auto-commit process successfully completed file synchronization."

Say what you did. Move on.

---

### What to Say NO To

**No refactoring. No reorganizing. No "while we're in there" improvements.**

The PRD says it: two targeted changes. One function call. One query fix. That's it. The temptation will be to "clean things up" or "improve the architecture." Resist it. Every line you add is a line that can break.

Say NO to:
- Adding configuration options for auto-commit behavior
- Building a dashboard to monitor Pulse status
- Creating abstractions around the GitHub CLI calls
- Logging every single action "for debugging"

Simplicity isn't about what you add. It's about what you have the courage to remove.

---

### The Emotional Hook

People will love this because **their work is safe.**

That's it. That's the hook. Every developer has lost work. Every developer has forgotten to commit. Every developer has had that sinking feeling at 2am: "Did I push that?"

Pulse says: "Yes. You did. I handled it."

That's not a feature. That's peace of mind. That's trust. And trust is the most valuable thing you can build into a product.

---

*Ship the fix. Two changes. Test it. Move on.*
