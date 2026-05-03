# Codex — Locked Decisions
## Blueprint for Build Phase | Rendered by Phil Jackson

---

## Decision Log

| # | Decision | Proposed By | Winner | Rationale |
|---|----------|-------------|--------|-----------|
| 1 | **Product name: Codex** | Steve | **Steve** | Identity drives adoption and behavioral change. "CODE-TEMPLATE" breeds bureaucracy; "Codex" breeds conviction. The repo filename stays technical (`codex.md`). |
| 2 | **Mandate verbatim code blocks in PRDs** | Elon | **Elon** | Single highest-leverage anti-hallucination mechanism. Improves first-try accuracy from ~40% to ~80%. Steve conceded in Round 2. |
| 3 | **Acceptance criteria floor: 5 (features), 3 (fixes)** | Steve (5), Elon (3 floor) | **Split** | Steve's rigor wins for features — the floor forces disciplined thinking. Elon's pragmatism wins for trivial bugfixes. Regression and side-effect coverage are mandatory regardless of count. |
| 4 | **Cut "Out of Scope" section** | Elon | **Elon** | Unanimous by absence of defense. If it's truly out of scope, silence is sufficient documentation. Padding is waste. |
| 5 | **Move "Done When" retrospectives to weekly batch** | Elon | **Elon** | Per-PRD retrospectives are a 15-minute linear tax that breaks flow. Steve did not defend. |
| 6 | **Retain Risks section, cap at 3 bullets** | Steve | **Steve** | Elon's "trust the gate" idealism is contradicted by his own scaling fears. Risks prevent 3 AM debugging. Capped to prevent bureaucratic theater. |
| 7 | **Deliverables path: namespaced + versioned** | Elon | **Elon** | `deliverables/<version>/<slug>/` prevents filesystem collisions on day three. Retroactive namespacing is migration hell. |
| 8 | **Distribution: OSS GitHub repo template + gate script + side-by-side diffs** | Both | **Consensus** | Network effects come from agencies adopting the format, not end-user ads. Both agreed in Round 1. |
| 9 | **Brand voice: master craftsman / uncompromising clarity** | Steve | **Steve** | The template is a behavioral product. Voice drives adherence. Parser specs and error messages use Elon's literalism; template copy and README use Steve's steel. |
| 10 | **Architecture: markdown → deterministic parser → file writer** | Elon | **Elon** | No database, no API, no frontend in v1. The contract is only as good as the parser that enforces it. |
| 11 | **Hollow-build gate: shell script in v1, CI spec stubbed for v2** | Elon | **Elon** | Ship the shell gate now. CI automation is a v2 upgrade. Steve's "ship the v0" timing respected. |
| 12 | **Dependency graph / traceability linking** | Elon | **Deferred** | Correct problem, wrong phase. v1 reserves `parent` and `dependencies` frontmatter fields so v2 can resolve them without migration. |

---

## MVP Feature Set (What Ships in v1)

### In Scope
1. **Codex Template (`codex.md`)** — The markdown contract. Locked sections:
   - **Frontmatter**: `slug`, `title`, `author`, `date`, `version`, `parent`, `dependencies`
   - **Background**: Max 200 words. No throat-clearing.
   - **Acceptance Criteria**: Minimum 5 for features, 3 for bugfixes. Verbatim code blocks mandated over prose descriptions.
   - **Verbatim Contracts**: Dedicated paste zone for function signatures, schemas, and interfaces.
   - **Risks / Failure Modes**: Max 3 bullets. Mandatory for all PRDs.
   - **Deliverables**: Path declaration using namespaced structure (`deliverables/<version>/<slug>/`).
   - **Inline Rules**: Hard "NO" statements from Steve's philosophy baked into template comments (e.g., "NO 'implement a function' without giving the signature").
   - *Cut*: Out of Scope, Done When (per PRD).

2. **Deterministic Validator (`parser/validate.js`)** — Conformance checker. Exit code 0 only if all schema rules pass. No ML, no fuzz — strict regex + frontmatter validation.

3. **Hollow-Build Gate (`gate/hollow-build.sh`)** — Minimum artifact validator. Checks deliverables path for ≥3 source files and ≥1 test file. Exit non-zero if hollow.

4. **Example PRD (`examples/before-after.md`)** — Side-by-side diff of agent output with and without Codex. Primary distribution asset.

5. **README & Setup** — Installation, usage, and contribution guidelines. Uses Steve's master-craftsman voice. Parser error messages use Elon's literalism.

### Out of Scope (v2 Roadmap)
- Web UI, API, or database
- CI/CD plugin (spec stubbed only)
- Dependency graph resolver
- Multi-team namespace permissions
- Automated traceability linking (code ↔ PRD version)

---

## File Structure

```
codex/
├── codex.md                     # The contract template (locked sections)
├── README.md                    # Master craftsman voice; usage instructions
├── package.json                 # Node-based tooling (fastest iteration)
├── parser/
│   ├── validate.js              # Deterministic conformance checker
│   ├── schema.json              # Codex schema (sections, required fields, counts)
│   └── errors.js                # Literal error messages (Elon voice)
├── gate/
│   ├── hollow-build.sh          # Minimum artifact validator (v1 shell)
│   └── hollow-build-ci.yml      # GitHub Actions spec for v2 (stub only)
├── examples/
│   ├── with-codex/              # Agent output using the template
│   ├── without-codex/           # Agent output without the template
│   └── before-after.md          # Side-by-side diff for distribution
└── deliverables/                # Runtime output directory (created by users)
    └── <version>/
        └── <slug>/
            ├── meta.yml         # Traceability stub: author, version, parent, dependencies
            ├── prd.md           # Canonical copy of the validated PRD
            └── artifacts/       # Generated code / tests from build phase
```

**Note**: `deliverables/` is a runtime output directory, not committed to the repo. The repo ships the template and tools; users instantiate the `deliverables/<version>/<slug>/` structure locally.

---

## Open Questions (Require Resolution Before Build)

1. **Parser Language Lock**: Node.js (fastest iteration for the team) or Python (wider ML ecosystem)? Validator is simple enough for either, but the choice propagates to v2 CI plugins.

2. **Versioning Scheme**: Semantic (`1.0.0`) or integer (`v001`)? Affects path sorting, collision logic, and `meta.yml` schema.

3. **Verbatim Block Definition**: Does a pasted function signature alone count as verbatim, or must it be wrapped in a fenced code block with a language tag? The parser regex depends on this.

4. **Risks Trigger Scope**: Steve's non-negotiable says Risks is mandatory always. The cap at 3 bullets is locked, but is a one-line typo fix truly required to have a Failure Modes section? Define the exemption threshold (e.g., PRDs touching ≤1 file with no external deps may omit).

5. **Frontmatter `parent` Syntax**: Is it a single slug reference, a comma-separated list, or a YAML array? v1 doesn't resolve it, but the schema must be forward-compatible.

6. **Hollow-Build Enforcement**: Is the gate executed as a pre-commit hook, a manual CLI step, or both? Determines how `gate/` is packaged and documented.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Agent ignores template because context window is cluttered with voice copy** | Medium | High | Parser is the enforcement layer, not the honor system. Template body is pure structure; Steve's voice is README-only. |
| **Verbatim code blocks bloat PRD length, causing LLMs to truncate or skip** | Medium | Medium | Cap block length in schema; require signatures and interfaces only — no full implementations. |
| **Namespaced deliverables path (`<version>/<slug>`) is over-engineered for v1 and confuses early adopters** | Medium | Medium | Make `version` default to `v1` if omitted; hide complexity in parser defaults and CLI scaffolding. |
| **5 AC minimum for features slows teams down, leading to template abandonment** | Medium | High | Build validator feedback to be instant (sub-100ms CLI); quantify and publish time saved in first-try builds. |
| **Hollow-build shell script is bypassed because it's manual** | High | High | Ship the CI spec stub immediately; provide a one-liner git hook install. Make the gate executable via `npx` or equivalent. |
| **"Codex" naming collision** (GitHub Copilot Chat uses "Codex", OpenAI has Codex model) | Medium | Medium | Acceptable collision for internal tooling and OSS. Monitor if commercializing; prepare fallback "BuildCodex" or "CodexSpec". |
| **No dependency graph means PRD B copies brittle references to PRD A output** | High | Medium | Document the limitation in README; enforce `parent` frontmatter field so v2 parser can resolve without migration. |
| **Steve's voice in template comments is interpreted as padding by Elon-purist users** | Low | Medium | Template comments are minimal guardrails only. If a comment doesn't stop a bug, delete it. |
