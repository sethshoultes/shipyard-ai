# EventDash Plugin Fix: 2-Minute Demo Script

---

NARRATOR:
It's 3 AM. Your yoga studio's event registration just broke.

[SCREEN: Error log scrolling. Red text. "Module not found: @shipyard/eventdash/sandbox"]

NARRATOR:
Not in dev. In production. On Cloudflare Workers.

[SCREEN: Slack message from angry customer: "Can't sign up for tomorrow's class"]

NARRATOR:
The code worked yesterday. You didn't change anything.

[SCREEN: Split screen - left shows local terminal with green checkmarks, right shows Workers dashboard with red X]

NARRATOR:
Local builds? Perfect. Workers deployment? Dead.

[SCREEN: Close-up of code - highlighted line reads: `entrypoint: "@shipyard/eventdash/sandbox"`]

NARRATOR:
The problem? This one line. An npm alias. Works everywhere *except* where it matters.

[SCREEN: Zoom out to show system architecture diagram - arrows pointing from local dev (has node_modules) to Workers (isolated bundle only)]

NARRATOR:
Because Workers don't have node_modules. They have what you give them. And you gave them a *reference* to a file, not the file itself.

---

[SCREEN: Side-by-side: EventDash plugin (red box) vs Membership plugin (green box)]

NARRATOR:
But look—the Membership plugin works fine. Same codebase. Same deployment target.

[SCREEN: Diff view showing Membership plugin's entrypoint code]

```typescript
const currentDir = dirname(fileURLToPath(import.meta.url));
const entrypointPath = join(currentDir, "sandbox-entry.ts");
```

NARRATOR:
They're using file paths. Not npm aliases. Real, absolute, unambiguous paths.

---

[SCREEN: Terminal - running `npm run build` in slow motion]

NARRATOR:
So we fix it. Copy the pattern. Three imports. Three lines of logic.

[SCREEN: Code editor - changes being made in real-time]

NARRATOR:
Replace the npm alias with the file path.

[SCREEN: Inline comment appears: "The alias works in local dev but fails in Workers which only has bundled code"]

NARRATOR:
Document *why* so the next developer doesn't undo it.

[SCREEN: Terminal output - build completing - "245 modules, 6180.25 KiB, exit code 0"]

NARRATOR:
Build succeeds. Zero errors. Zero warnings.

---

[SCREEN: git commit screen showing three changed files]

NARRATOR:
One commit. Three files. Atomic and revertable.

[SCREEN: GitHub commit view - commit message: "fix: Configure EventDash plugin for Sunrise Yoga deployment"]

NARRATOR:
Push it.

---

[SCREEN: Split screen returns - left side now matches right side - both green checkmarks]

NARRATOR:
Local? Works. Workers? Works.

[SCREEN: Customer Slack message: "Just registered! See you tomorrow!"]

NARRATOR:
It's 3:15 AM.

[SCREEN: Close laptop. Fade to black.]

NARRATOR:
Your yoga studio's back online. And you're going back to bed.

---

[SCREEN: Title card fades in]

**SHIPYARD AI**
*Infrastructure IS the user experience.*

[SCREEN: Subtitle appears below]

**Pattern consistency. File path resolution. One commit.**

[SCREEN: Fade out]
