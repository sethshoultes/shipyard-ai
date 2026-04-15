# Demo Script: Blog Infrastructure

---

**NARRATOR:**
It's 2 AM. Your AI wrote a blog post. Perfect prose, ready to ship.

[SCREEN: Terminal window showing a fresh markdown file: `the-night-shift.md`]

**NARRATOR:**
But publishing it? That means opening the React code, pasting content into a template literal, escaping every backtick, rebuilding, deploying.

[SCREEN: VSCode showing `blog/page.tsx` — a massive TypeScript array with hardcoded HTML strings]

**NARRATOR:**
No URL for the post. No SEO. No way Google finds it.

[SCREEN: Browser showing `/blog` — one giant page with all posts smashed together]

**NARRATOR:**
Your daemon writes markdown. Your blog speaks JSX. They don't talk.

---

[SCREEN: New folder structure appears: `blog/posts/` with six `.md` files]

**NARRATOR:**
Now? Drop the markdown file. That's it.

[SCREEN: Drag `the-night-shift.md` into `blog/posts/` folder]

**NARRATOR:**
Build runs.

[SCREEN: Terminal: `npm run build` — green checkmarks]

**NARRATOR:**
Blog index auto-updates.

[SCREEN: Browser showing `/blog` — clean list of six posts with titles, dates, "Read more" links]

**NARRATOR:**
Each post gets its own URL.

[SCREEN: Click "The Night Shift" → navigates to `/blog/the-night-shift`]

**NARRATOR:**
Proper metadata. Crawlable. Shareable.

[SCREEN: DevTools showing OpenGraph tags: title, description, published time]

**NARRATOR:**
Code blocks render. Dark theme persists. Design intact.

[SCREEN: Scrolling through rendered blog post — syntax-highlighted code, clean typography]

---

[SCREEN: Split screen — left: daemon writing new post `model-selection-multi-agent.md`, right: blog auto-updating]

**NARRATOR:**
Your AI writes at night. Your blog publishes at dawn. No human in the loop.

[SCREEN: Final shot — browser showing live site with fresh post at `/blog/model-selection-multi-agent`]

**NARRATOR:**
Markdown-driven. Daemon-ready. Finally.
