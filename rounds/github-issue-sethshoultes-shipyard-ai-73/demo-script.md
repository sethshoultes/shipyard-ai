# Demo Script: The Missing Binding

**NARRATOR:**
You just spent three weeks building a plugin system for your yoga studio app.

[SCREEN: Code editor showing a beautiful plugin architecture]

**NARRATOR:**
Sandboxed. Secure. Everything your EMDASH guide told you to do.

[SCREEN: Terminal running `npm run build` — success]

**NARRATOR:**
Local tests pass. You deploy to Cloudflare Workers.

[SCREEN: `wrangler deploy` command executing, green checkmarks]

**NARRATOR:**
You refresh the production site.

[SCREEN: Browser showing Sunrise Yoga homepage]

**NARRATOR:**
Nothing. No plugins. Just silence.

[SCREEN: Empty plugin panel, console showing "No worker_loaders binding found"]

**NARRATOR:**
You check the docs. Section 6. Worker loaders.

[SCREEN: EMDASH-GUIDE.md opened to section 6, highlighting the worker_loaders config]

**NARRATOR:**
Right there. One binding. You never added it.

[SCREEN: wrangler.jsonc file open, cursor blinking after the last line]

**NARRATOR:**
You add three lines.

[SCREEN: Typing `"worker_loaders": [{ "binding": "LOADER" }],` into the config]

**NARRATOR:**
Deploy again.

[SCREEN: Terminal showing `npx wrangler deploy`, progress bar]

**NARRATOR:**
Refresh.

[SCREEN: Browser refresh, plugin panel populating with active plugins — "Class Scheduler", "Payment Gateway", "Member Portal"]

**NARRATOR:**
Everything loads. Every plugin. Production-ready.

[SCREEN: Full app interface with all plugins running smoothly]

**NARRATOR:**
Three weeks of work. Three lines of config. One binding that changed everything.

[SCREEN: Fade to logo]
