# Steve Jobs — Chief Design & Brand Officer
## Round 1 Positions: Emdash Plugin Resurrection

---

### Product Naming

**Call the system "Pulse."**

Not "Emdash Plugins." Not "Plugin Suite." *Pulse.* Because plugins are the heartbeat of every site they power. MemberShip becomes *Pulse Members*. ReviewPulse becomes *Pulse Reviews*. EventDash becomes *Pulse Events*.

One word. One system. One unified brand. When someone asks "What powers your membership?" — "Pulse" is the answer. It beats. It's alive. It's essential.

---

### Design Philosophy

The API documentation failed these plugins. That's unforgivable. But here's the truth hiding inside this disaster:

**Every plugin must feel native to Emdash — not bolted on.**

Like AirPods connecting to an iPhone. No friction. No configuration theater. Just instant recognition.

We're removing `throw new Response()` and `rc.user` not as "cleanup" — we're performing surgery to remove *tumors*. Every banned pattern was a plugin trying to be smarter than the platform. That arrogance shatters the magic.

Plugins don't handle auth. Plugins don't manage responses. **The platform does that. A plugin's only job is delivering value.**

---

### User Experience — First 30 Seconds

Picture this: A developer installs *Pulse Members* on Sunrise Yoga.

They deploy. They open admin. They see a clean Block Kit dashboard — members, tiers, activity. No console errors. No "cannot read property of undefined." No Stack Overflow rabbit holes.

**It just works.**

That's not a low bar. That *is* the bar. The moment "mostly works" enters the conversation — we've lost. Complexity is a bug, not a feature.

---

### Brand Voice

Pulse speaks like a confident mechanic, not a corporate lawyer.

- "Member joined." Not "Membership instance successfully instantiated."
- "Review flagged." Not "Review marked for administrative attention."
- "SEO score: 73." Not "Optimization index calculated to seventy-three basis points."

**Short. Declarative. Human.** Every admin message must pass this test: *Would you text this to a friend?*

---

### What to Say NO To

**NO** to custom auth in plugins. The platform authenticates. Period.

**NO** to JSON.stringify/parse gymnastics. If your KV doesn't auto-serialize, it's not a wrapper — it's a burden.

**NO** to "rewrite from scratch." This PRD says *fix*, not rebuild. Every engineer who wants to start fresh is admitting defeat. That's not engineering — that's surrender.

**NO** to shipping without screenshots. If you can't prove it renders, it doesn't render.

**NO** to "works in curl." Users don't use curl. They use browsers. They see console errors. They leave.

---

### The Emotional Hook

Here's why developers will *love* Pulse:

**It gives them their weekend back.**

Every hour debugging broken response formats is an hour stolen from family, hobbies, sanity. Every hallucinated API that "seemed right" but crashed production? A trust violation.

When Pulse works — when EventDash admin actually renders, when MemberShip stops throwing Response objects into the void — developers feel *respected*. We're saying: "Your time matters. We tested this. We verified this. We screenshotted it working."

That respect? That's love. And love is the only competitive advantage that compounds.

---

**Ship it working, or don't ship it at all.**
