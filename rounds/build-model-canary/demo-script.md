# Build Model Canary — 2-Minute Demo Script

---

**NARRATOR**
It’s three in the morning. I just swapped the model. I hit build. I wait. I pray.

[SCREEN: Terminal window. `BUILD_PHASE_MODEL=kimi-k2.6`. Build completes. Directory listing shows `package.json`, `tsconfig.json` — and zero source files. Hollow build.]

**NARRATOR**
Zero files. Zero functions. Sixty seconds of my life I’m not getting back, and now I don’t know if the model’s broken or the pipeline’s broken or *I’m* broken.

[SCREEN: Black. A cursor blinks.]

**NARRATOR**
So I stop praying. I start measuring.

[SCREEN: Directory tree — flat. No `src/`, no `dist/`, no `lib/`. Just `slugify.ts`, `truncate.ts`, `index.ts`. Clean.]

**NARRATOR**
Two pure functions. A barrel export. Node’s own test runner. Zero dependencies, zero hallucination surface. I write the smallest possible truth.

[SCREEN: `slugify.ts` code — lower, replace, strip. `truncate.ts` — boundary-aware ellipsis. No comments, no fluff. Production code.]

**NARRATOR**
Slugify takes a headline and turns it into a URL. Truncate takes a paragraph and respects the word boundary. That’s it. That’s the canary.

[SCREEN: Terminal. `node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts`.]

**NARRATOR**
I run the tests.

[SCREEN: Test output scrolls. Three green checks for slugify. Seven green checks for truncate. Exit code 0.]

**NARRATOR**
Pass. Now the compiler.

[SCREEN: `tsc --noEmit slugify.ts truncate.ts index.ts`. Silent. Exit code 0.]

**NARRATOR**
Clean. No warnings. No ghosts.

[SCREEN: Split screen. Left: the canary files. Right: `BUILD_PHASE_MODEL=qwen3.5:cloud`. Build runs. All seven files materialize. Tests green. Types green.]

**NARRATOR**
The canary sings. The model works. The pipeline works. I know in twenty seconds what used to cost me three hours and a night of sleep.

[SCREEN: Single terminal line: `echo $?` — output `0`. Fade to product logo: "Build Model Canary."]

**NARRATOR**
Small build. Big signal. Go back to bed.

---
*End.*
