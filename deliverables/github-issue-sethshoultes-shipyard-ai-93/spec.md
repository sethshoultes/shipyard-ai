# Spec: Still — Calm Commit (GitHub Issue #93)

## Goals

From PRD `[dream] Calm Commit` and locked debate decisions (`decisions.md`):

1. Ship a CLI tool named **Still** that generates calm, useful commit messages by reading staged changes.
2. Integrate as a `prepare-commit-msg` git hook — universal across editors (vim, VS Code, Emacs, IntelliJ) without plugins.
3. Provide exactly one high-quality suggestion with **zero configuration** required from the user.
4. Enforce **Master Craftsman** voice: declarative, precise, concise. No emojis, no exclamation points, no marketing speak.
5. Achieve **<10ms** response on repeated changes via a diff-hash cache.
6. Use **cloud-only LLM** for v1 (Claude 3.5 Sonnet tier) to guarantee quality on every suggestion.
7. Distribute via `npm` and a `curl | bash` installer.
8. Keep CLI surface minimal: `still install`, `still uninstall`, `--version`.

## Implementation Approach

### Runtime & Language
**Node.js + TypeScript** chosen for v1.
- Fastest path to `npm` distribution (PRD explicitly names npm).
- No native compilation step required.
- Single `package.json` with a `bin` entry.

### Architecture Overview
```
still/
├── package.json              # Project manifest + bin entry
├── tsconfig.json             # Build-only TypeScript config (not user-facing)
├── README.md                 # One-line description + install instruction
├── scripts/
│   └── install.sh            # curl-pipe bootstrap
├── src/
│   ├── cli.ts                # Entrypoint: install, uninstall, --version, hook
│   ├── commands/
│   │   ├── install.ts        # Registers prepare-commit-msg hook
│   │   └── uninstall.ts      # Removes prepare-commit-msg hook
│   ├── git/
│   │   └── diff.ts           # Runs `git diff --staged`, returns diff string
│   ├── cache/
│   │   └── store.ts          # SHA-256 diff hash → suggestion (flat-file JSON)
│   ├── llm/
│   │   ├── client.ts         # HTTP client to cloud LLM
│   │   └── prompt.ts         # Assembles system + user prompts
│   ├── voice/
│   │   └── templates.ts      # System prompt enforcing Still tone
│   └── config/
│       └── constants.ts      # Internal constants: endpoint, timeout, env var names
└── .github/
    └── workflows/
        └── ci.yml            # Build, test, and verify pipeline
```

### Component Details

#### 1. CLI (`src/cli.ts`)
- Parse `process.argv`.
- Allowed commands: `install`, `uninstall`, `--version`, `--help`.
- When invoked as `still hook <commit-msg-file>`, write suggestion to the file path provided by git.
- Reject all other arguments with non-zero exit code.

#### 2. Hook Installer (`src/commands/install.ts`)
- Determine `.git/hooks` path from `git rev-parse --git-path hooks`.
- Write a `prepare-commit-msg` script that invokes `still hook "$1"`.
- If a hook already exists, warn and exit non-zero (do not overwrite silently).
- Set executable bit (`chmod +x`) on the hook.

#### 3. Hook Uninstaller (`src/commands/uninstall.ts`)
- Remove the `prepare-commit-msg` hook if it contains a `still` marker.
- If the hook was backed up, restore it.
- Idempotent: exits 0 if no still-managed hook exists.

#### 4. Diff Extractor (`src/git/diff.ts`)
- Spawn `git diff --staged` and capture stdout.
- Return raw diff string.
- Respect `GIT_DIR` and `GIT_WORK_TREE` environment variables.

#### 5. Diff-Hash Cache (`src/cache/store.ts`)
- Compute SHA-256 hash of the diff text.
- Store in `~/.cache/still/suggestions.json` (flat file, no daemon).
- On cache hit, return cached suggestion instantly.
- On cache miss, return `null`.
- Overwrite in place to prevent disk fill.

#### 6. LLM Client (`src/llm/client.ts`)
- POST JSON to Anthropic Messages API.
- Read API key from `STILL_API_KEY` environment variable.
- Timeout after 10 seconds.
- Return raw text content of the first message.
- On failure (timeout, non-2xx), exit non-zero so the hook leaves the buffer untouched rather than injecting garbage.

#### 7. Prompt Engine (`src/llm/prompt.ts` + `src/voice/templates.ts`)
- System prompt: "You are a disciplined senior engineer. Write a single-line git commit message in imperative mood, ≤72 characters, no punctuation marks that convey excitement."
- User prompt: concatenation of staged file names and diff summary.
- Abort if LLM returns low-confidence or empty text; leave buffer empty rather than poison history.

#### 8. Bootstrap Installer (`scripts/install.sh`)
- Detect OS/arch.
- `npm install -g still` or download pre-built artifact.
- Run `still install` automatically.
- Exit 0 on success, non-zero on failure.

#### 9. CI Pipeline (`.github/workflows/ci.yml`)
- Trigger on `push` to `main` and `workflow_dispatch`.
- Single job `build` on `ubuntu-latest`.
- Steps: checkout, `npm ci`, `npm run build`, `npm test`, run shell verification scripts.
- No `continue-on-error: true` on any step.

## Verification Criteria

| ID | Requirement | Verification |
|----|-------------|--------------|
| V1 | `still --version` | `node dist/cli.js --version` exits 0 and prints a semver string |
| V2 | `still install` | In a temp git repo, `.git/hooks/prepare-commit-msg` is created, executable, and contains `still hook` |
| V3 | `still uninstall` | In a temp git repo, the hook is removed; a second uninstall exits 0 (idempotent) |
| V4 | Diff extractor | Unit test: stage a file, `git diff.ts` returns string containing `diff --git` |
| V5 | Diff-hash cache | First call for a diff returns `null` (cache miss). Second call returns cached string instantly. Cache file `~/.cache/still/suggestions.json` exists. |
| V6 | LLM client | Mock test: fake server receives JSON with `system` and `messages` fields. Integration test (CI secret): returns non-empty string for a real diff. |
| V7 | Voice & tone | Run 10 sample diffs through prompt. Results must: contain no `!`, no emoji unicode, start with imperative verb, first line ≤72 chars. |
| V8 | Hook injection | Stage a file, run `git commit` (non-interactive with `-m` override to trigger hook), verify commit message file was modified by `still hook` |
| V9 | Zero config | `find . -name '*.stillconfig' -o -name 'still.yaml' -o -name '.stillignore'` returns empty |
| V10 | Exit codes | Every success path exits 0; every failure path (bad args, missing API key, LLM timeout) exits non-zero |
| V11 | CI pipeline | `.github/workflows/ci.yml` exists, `yamllint` passes, and GitHub Actions run completes green |
| V12 | No banned modules | Source tree contains no VS Code extension, no web dashboard, no local model runner, no plugin loader |

## Files to Create or Modify

| File | Status | Purpose |
|------|--------|---------|
| `package.json` | **Create** | Node manifest, dependencies, `bin` field |
| `tsconfig.json` | **Create** | TypeScript compiler configuration |
| `README.md` | **Create** | Install one-liner + product description |
| `scripts/install.sh` | **Create** | curl-pipe bootstrap |
| `src/cli.ts` | **Create** | CLI entrypoint |
| `src/commands/install.ts` | **Create** | Hook installer |
| `src/commands/uninstall.ts` | **Create** | Hook uninstaller |
| `src/git/diff.ts` | **Create** | Diff extractor |
| `src/cache/store.ts` | **Create** | Diff-hash cache |
| `src/llm/client.ts` | **Create** | Cloud LLM HTTP client |
| `src/llm/prompt.ts` | **Create** | Prompt assembler |
| `src/voice/templates.ts` | **Create** | System prompt template |
| `src/config/constants.ts` | **Create** | Internal constants |
| `.github/workflows/ci.yml` | **Create** | CI pipeline |
