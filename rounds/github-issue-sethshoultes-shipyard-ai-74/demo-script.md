# EventDash Plugin Fix — Demo Script (2 minutes)

---

NARRATOR:
Wednesday morning. Your yoga studio's website is live on Cloudflare. Works perfectly.

[SCREEN: Sunrise Yoga homepage loading fast, clean design]

NARRATOR:
You add the EventDash plugin. Workshop registration. Events calendar. Features your members asked for.

[SCREEN: Terminal showing `npm install @shipyard/eventdash`]

NARRATOR:
Build succeeds locally.

[SCREEN: Green checkmarks, "Build complete"]

NARRATOR:
Deploy to Cloudflare.

[SCREEN: Deploy command running]

NARRATOR:
Error.

[SCREEN: Red error: "Module not found: @shipyard/eventdash/sandbox"]

NARRATOR:
Works on your laptop. Breaks in production. Every time.

[SCREEN: Developer staring at screen, coffee going cold]

NARRATOR:
Here's why.

[SCREEN: Split screen — code left, architecture diagram right]

NARRATOR:
Your plugin uses an npm alias. `@shipyard/eventdash/sandbox`. Works locally because Node finds it in node_modules.

[SCREEN: Highlight npm alias, arrow to node_modules folder]

NARRATOR:
Cloudflare Workers don't have node_modules. They bundle your code into one file. The alias? Gone.

[SCREEN: Animation — bundler process, node_modules disappearing]

NARRATOR:
The fix is twelve lines.

[SCREEN: Side-by-side diff appearing line by line]

NARRATOR:
Import Node's path utilities. Resolve file location at runtime. Use actual file path instead of alias.

[SCREEN: Code executing, absolute path appearing in console]

NARRATOR:
Bundler knows exactly where to find your entrypoint. Local dev? Works. Cloudflare Workers? Works.

[SCREEN: Green checkmarks on both "Local" and "Production" columns]

NARRATOR:
Rebuild.

[SCREEN: Terminal — build succeeding, 245 modules, zero errors]

NARRATOR:
Deploy.

[SCREEN: Deploy command — successful, URL appearing]

NARRATOR:
Load the site.

[SCREEN: Browser refreshing, Sunrise Yoga site with Events page visible]

NARRATOR:
EventDash admin panel. Live. Workshop creation form. Live. Calendar widget. Live.

[SCREEN: Clicking through admin interface — smooth, fast, working]

NARRATOR:
One pattern. Works everywhere. Every time.

[SCREEN: Code snippet of pattern, simple and clean]

NARRATOR:
You just learned what took us three hours to debug. Your next plugin? You'll get it right the first time.

[SCREEN: New plugin boilerplate already using correct pattern]

NARRATOR:
This is how infrastructure becomes invisible. Fix it once. Never think about it again.

[SCREEN: Fade to Shipyard AI logo]

---

**Runtime: 2:00**
**Tone: Human, urgent, cathartic**
**Structure: Problem (0:00-0:40) → Solution (0:40-1:20) → Payoff (1:20-2:00)**
