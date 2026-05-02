# Build Model Canary — Task Checklist

**Slug:** `build-model-canary`
**Status:** Not started

---

## Wave 1: Configuration

- [ ] Create directory structure — verify: `ls -la deliverables/build-model-canary/` shows directory exists
- [ ] Create `package.json` with name="slug", version="1.0.0", type="module", dependencies={} — verify: `cat package.json | jq '.dependencies | length'` returns 0
- [ ] Create `tsconfig.json` with module="NodeNext", strict=true, include=["*.ts"] — verify: `cat tsconfig.json | jq '.compilerOptions.module'` returns "NodeNext"
- [ ] Verify neither config file references `src/`, `dist/`, `lib/`, or `tests/` — verify: `grep -E 'src/|dist/|lib/|tests/' package.json tsconfig.json` returns no matches

---

## Wave 2: Source Implementation

- [ ] Create `slugify.ts` with export function `slugify(text: string): string` — verify: `grep -E 'export function slugify\(text: string\): string' slugify.ts` matches
- [ ] Implement slugify pipeline: toLowerCase → replace non-alphanum with hyphen → strip leading/trailing hyphens — verify: `node --import tsx -e "import('./slugify.ts').then(m => console.assert(m.slugify('Hello World') === 'hello-world'))"` exits 0
- [ ] Verify slugify.ts has no TODO, console.log, debugger, or empty function body — verify: `grep -riE 'TODO|console\.log|debugger|^\s*\{\s*\}$' slugify.ts` returns no matches
- [ ] Create `truncate.ts` with export function `truncate(text: string, maxLength: number): string` — verify: `grep -E 'export function truncate\(text: string, maxLength: number\): string' truncate.ts` matches
- [ ] Implement truncate logic: return unchanged if fits, find word boundary, append ellipsis — verify: `node --import tsx -e "import('./truncate.ts').then(m => console.assert(m.truncate('hello world', 5) === 'hello…'))"` exits 0
- [ ] Verify truncate.ts has no TODO, console.log, debugger, or empty function body — verify: `grep -riE 'TODO|console\.log|debugger|^\s*\{\s*\}$' truncate.ts` returns no matches
- [ ] Create `index.ts` re-exporting slugify and truncate — verify: `grep -E 'export.*from' index.ts` shows both exports

---

## Wave 3: Test Implementation

- [ ] Create `tests/` directory — verify: `test -d tests/ && echo OK`
- [ ] Create `tests/test-slugify.ts` importing `node:test`, `node:assert`, and `./slugify.js` — verify: `grep -E 'import.*from.*node:test|import.*from.*node:assert|import.*from.*\.\/slugify\.js' tests/test-slugify.ts` matches all three
- [ ] Add test: `slugify("Hello World") === "hello-world"` — verify: test file contains assertion with exact expected value
- [ ] Add test: `slugify("Foo  Bar!!!") === "foo-bar"` — verify: test file contains assertion with exact expected value
- [ ] Add test: `slugify("  trim me  ") === "trim-me"` — verify: test file contains assertion with exact expected value
- [ ] Create `tests/test-truncate.ts` importing `node:test`, `node:assert`, and `./truncate.js` — verify: `grep -E 'import.*from.*node:test|import.*from.*node:assert|import.*from.*\.\/truncate\.js' tests/test-truncate.ts` matches all three
- [ ] Add test: `truncate("hello world", 5)` returns word boundary result — verify: test file contains assertion for this case
- [ ] Add test: `truncate("hello world", 0)` returns `"…"` — verify: test file contains assertion with ellipsis character
- [ ] Verify test files have no TODO or skipped tests — verify: `grep -riE 'TODO|\.skip|todo\(' tests/` returns no matches

---

## Wave 4: Validation

- [ ] Run TypeScript type check on all source files — verify: `tsc --noEmit slugify.ts truncate.ts index.ts` exits 0
- [ ] Run test suite — verify: `node --test --import tsx tests/test-slugify.ts tests/test-truncate.ts` exits 0
- [ ] Scan for placeholder comments across all files — verify: `grep -riE 'TODO|FIXME|HACK|XXX|placeholder' .` returns no matches
- [ ] Verify exactly 7 required files exist — verify: `ls -1 spec.md todo.md slugify.ts truncate.ts index.ts tests/test-slugify.ts tests/test-truncate.ts | wc -l` returns 7
- [ ] Verify no banned patterns in package.json (no devDependencies, no scripts, no exports) — verify: `cat package.json | jq 'has("devDependencies") or has("scripts") or has("exports")'` returns false

---

## Sign-off Checklist

- [ ] All Wave 1 tasks complete
- [ ] All Wave 2 tasks complete
- [ ] All Wave 3 tasks complete
- [ ] All Wave 4 tasks complete
- [ ] Ready for Margaret Hamilton QA review
