# Demo Script — Build Model Canary (GLM)

**Runtime:** ~2:00
**Voice:** Human narrator, Sorkin cadence
**Format:** NARRATOR + [SCREEN] stage directions

---

NARRATOR
I asked the agent to build me a string utility.

[SCREEN: Dark terminal. Cursor blinking.]

NARRATOR
Three hours later I had seven empty files and a migraine.

[SCREEN: File listing flashes. `slugify.ts` — 0 bytes. `truncate.ts` — just a TODO comment.]

NARRATOR
It was writing *about* code. Not code. Like a chef describing a soufflé instead of cooking.

[SCREEN: `git diff` showing hollow commits. Red X marks on CI.]

NARRATOR
So we swapped the engine. New model. Fresh start. And we gave it one job.

[SCREEN: White text on black: "BUILD_PHASE_MODEL=qwen3.5:cloud"]

NARRATOR
Prove you can actually build something.

[SCREEN: Seven files materialize in a tree view. `spec.md`, `todo.md`, `slugify.ts`, `truncate.ts`, `index.ts`, `tests/test-slugify.ts`, `tests/test-truncate.ts`.]

NARRATOR
Not a product. A canary. Small cage. If it dies, we know the air is bad.

[SCREEN: `slugify.ts` opens. Clean TypeScript. Function body, not a stub. Regex, hyphens, lowercase.]

NARRATOR
Slugify. Takes "Hello World!!!" and gives you "hello-world". No dependencies. No hand-waving.

[SCREEN: `truncate.ts`. Word-boundary logic. Ellipsis. Edge cases handled.]

NARRATOR
Truncate. Cuts at the word. Appends the dot-dot-dot. Respects the string.

[SCREEN: `index.ts` — two lines, re-exporting both. Module interface. Done.]

NARRATOR
Entry point. Clean. Total TypeScript: eighty lines. We don't do bloat.

[SCREEN: `node --test --import tsx tests/*.ts` types into terminal.]

NARRATOR
Then we run the tests.

[SCREEN: Cursor hangs for one beat.]

NARRATOR
This is the moment.

[SCREEN: Green dots cascade down. `✔ slugify converts to lowercase and hyphenates`. `✔ truncate respects word boundaries`. `✔ all tests passed`.]

NARRATOR
It passed.

[SCREEN: Terminal holds on the green summary. `7 files. 0 type errors. 0 test failures.`]

NARRATOR
Seven real files. Working code. Green output. The canary sang.

[SCREEN: Fade to black. White text: "The build agent is back."]

NARRATOR
The model swap worked. We can ship again.

[SCREEN: End card.]

---
