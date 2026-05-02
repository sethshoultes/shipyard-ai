# WorkerForge (Anvil) — Build Specification

> Auto-generated from GitHub issue sethshoultes/shipyard-ai#86
> **Product Name:** Anvil (per decisions.md §1)
> **Phase:** Build
> **Spec Version:** 1.0

---

## 1. Goals (from PRD)

### Problem Statement
Build a CLI that scaffolds production-ready Cloudflare Workers AI projects. Users pick their model (LLM, image, audio) and get a working deployment with rate limiting, caching, streaming, and monitoring built in.

### Success Criteria (from PRD)
- Issue sethshoultes/shipyard-ai#86 requirements are met
- All tests pass

### Target User
Developers building AI features on Cloudflare Workers

### Target Experience
- `npx anvil create --llm` → deployed in 60 seconds
- First streaming response hitting the terminal should make the user **grin** (decisions.md §5)
- 100 concurrent streaming requests, stable (decisions.md §6)

---

## 2. Implementation Approach (from Plan + Decisions)

### Core Architecture Decisions

| Decision | Resolution | Source |
|----------|------------|--------|
| Product Name | **Anvil** | decisions.md §1 |
| CLI vs Wizard | **Flags-only CLI** — `npx anvil create --llm --stream` | decisions.md §10 |
| Template Strategy | **Dynamic generation** from live Cloudflare Workers AI OpenAPI spec | decisions.md §3 |
| Model Support | **One default LLM model** (streaming only) | decisions.md §2, §10 |
| Multimodal | **CUT** — image/audio deferred | decisions.md §2 |
| Rate Limiting | **INCLUDED** via native Cloudflare bindings | decisions.md §11 |
| Caching/Monitoring | **CUT** from v1 | decisions.md §11 |
| Auth Flow | CLI primary; GitHub zero-install button secondary | decisions.md §9 |
| Brand Voice | Plainspoken, confident, zero corporate jargon | decisions.md §4 |

### File Structure

#### The Anvil CLI (the tool)
```
anvil/
├── src/
│   ├── index.ts              # CLI entry point — parse flags, route command
│   ├── commands/
│   │   └── create.ts         # `anvil create --llm` orchestration
│   ├── generators/
│   │   ├── spec.ts           # Fetch & parse Cloudflare Workers AI OpenAPI spec
│   │   └── worker.ts         # Emit index.ts + wrangler.toml dynamically
│   └── utils/
│       └── deploy.ts         # Wrangler deploy wrapper; human-friendly errors
├── github-template/          # Zero-install fork target
│   ├── src/
│   │   └── index.ts          # Bootstrap placeholder
│   ├── wrangler.toml         # Base config
│   ├── package.json          # Minimal deps (wrangler only)
│   └── README.md             # "Deploy to Workers" button
├── package.json
├── tsconfig.json
└── bin/
    └── anvil                 # Executable entry
```

#### The Generated Worker (the artifact)
```
my-llm-worker/
├── index.ts          # Streaming LLM handler (generated from live spec)
├── wrangler.toml     # Worker config with AI binding + rate limit
└── package.json      # Minimal dependencies
```

**Design Rule:** `index.ts` and `wrangler.toml` only. If a third file is required, the generator is wrong (decisions.md §File Structure).

### Technical Requirements

1. **Zero hand-written templates** — all code generated from Cloudflare's live OpenAPI spec (decisions.md §3)
2. **Streaming-only** — Web Streams API, `fetch`-based inference (decisions.md §File Structure)
3. **AI binding** — native Cloudflare Workers AI binding in `wrangler.toml`
4. **Rate limiting** — single binding line in `wrangler.toml` (decisions.md §11)
5. **Wrangler deploy wrapper** — invokes `wrangler deploy` with human-friendly error translation (decisions.md §File Structure)
6. **One command, zero prompts** — flags-only CLI (decisions.md §10)

---

## 3. Verification Criteria

### 3.1 CLI Entry Point (`src/index.ts`)
| Criterion | How to Verify |
|-----------|---------------|
| Parses `--llm` and `--stream` flags | Run `node src/index.ts --llm --stream` — exits 0, no "unknown flag" errors |
| Routes to `create` command | Grep for `commands/create` import and invocation |
| No interactive prompts | Grep for `readline`, `prompts`, `inquirer` — must return 0 matches |
| Human-friendly error messages | Grep for `console.error` — no raw stack traces, no "Error:" prefixes |

### 3.2 Create Command (`src/commands/create.ts`)
| Criterion | How to Verify |
|-----------|---------------|
| Invokes spec fetcher | Grep for `generators/spec` import and call |
| Invokes worker generator | Grep for `generators/worker` import and call |
| Invokes deploy wrapper | Grep for `utils/deploy` import and call |
| Outputs progress spinner | Grep for spinner library (ora, cli-spinners) or custom spinner |
| Prints success message with "grin" quality | Manual review — must contain triumphant language, no "done" or "complete" |

### 3.3 Spec Fetcher (`src/generators/spec.ts`)
| Criterion | How to Verify |
|-----------|---------------|
| Fetches Cloudflare Workers AI OpenAPI spec | Grep for `fetch` with Cloudflare API URL |
| Parses highest-version `text-generation` model | Grep for model parsing logic, version comparison |
| Falls back dynamically on fetch failure | Grep for fallback logic — must NOT be hard-coded model name |
| Returns AI binding name | Grep for binding name extraction |

### 3.4 Worker Generator (`src/generators/worker.ts`)
| Criterion | How to Verify |
|-----------|---------------|
| Emits `index.ts` with streaming handler | Verify output file contains `ReadableStream`, `fetch`, `stream` |
| Emits `wrangler.toml` with AI binding | Grep output for `[[ai]]` or `ai =` binding |
| Emits `wrangler.toml` with rate limit | Grep output for `limits` or rate limit config |
| No hand-written templates | Grep for template literals — must be dynamic string construction |
| Exactly 2 files generated | Count output files — must equal 2 |

### 3.5 Generated `index.ts` (Worker)
| Criterion | How to Verify |
|-----------|---------------|
| Uses Web Streams API | Grep for `ReadableStream`, `new ReadableStream` |
| Calls Cloudflare AI binding | Grep for `env.AI.run` or `ai.run` |
| Handles streaming response | Grep for `stream` in response handling |
| No batch/blocking mode | Grep for `batch`, `blocking` — must return 0 matches |

### 3.6 Generated `wrangler.toml` (Worker)
| Criterion | How to Verify |
|-----------|---------------|
| Contains AI binding | Grep for `[[ai]]` binding block |
| Contains rate limit config | Grep for `limits` or rate configuration |
| No caching config | Grep for `cache`, `kv`, `r2` — must return 0 matches (CUT from v1) |
| No monitoring config | Grep for `logs`, `observability`, `dashboard` — must return 0 matches (CUT from v1) |

### 3.7 Deploy Wrapper (`src/utils/deploy.ts`)
| Criterion | How to Verify |
|-----------|---------------|
| Invokes `wrangler deploy` | Grep for `wrangler deploy` or `exec` call |
| Translates errors to human messages | Grep for error handling with plain-language messages |
| No hidden auth flows | Grep for `auth`, `login` — must have explicit prompts, not silent |

### 3.8 GitHub Template (`github-template/`)
| Criterion | How to Verify |
|-----------|---------------|
| Contains "Deploy to Workers" button | Grep README for `deploy` button markup |
| Contains bootstrap `index.ts` | File exists with placeholder content |
| Contains base `wrangler.toml` | File exists with minimal config |
| Contains minimal `package.json` | File exists with only `wrangler` dependency |

### 3.9 Build Validation
| Criterion | How to Verify |
|-----------|---------------|
| `tsc --noEmit` passes | Run command — exit code 0 |
| No `TODO`/`FIXME` placeholders | `grep -riE 'TODO|FIXME|HACK|XXX' src/` — 0 matches |
| No `src/` or `lib/` invention in generated workers | Verify generated output is flat (2 files only) |
| Zero runtime dependencies in CLI | `cat package.json | jq '.dependencies | length'` — returns 0 |

### 3.10 Load Test (Post-Build)
| Criterion | How to Verify |
|-----------|---------------|
| Generated worker handles 100 concurrent streams | Run load test script against deployed worker |
| No errors under load | Load test reports 0 failures |
| Streaming latency <500ms p95 | Load test reports latency metrics |

---

## 4. Files to Create or Modify

### New Files (CLI Tool)
| File Path | Purpose |
|-----------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/package.json` | CLI manifest, zero dependencies |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/tsconfig.json` | TypeScript config for ESM |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/index.ts` | CLI entry point |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/commands/create.ts` | Create command orchestration |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/generators/spec.ts` | Cloudflare OpenAPI spec fetcher |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/generators/worker.ts` | Worker code generator |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/src/utils/deploy.ts` | Wrangler deploy wrapper |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/bin/anvil` | Executable entry point |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/github-template/src/index.ts` | Bootstrap worker placeholder |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/github-template/wrangler.toml` | Base worker config |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/github-template/package.json` | Minimal dependencies |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/anvil/github-template/README.md` | Deploy button + onboarding |

### Generated Files (Worker Artifact — created at runtime)
| File Path | Purpose |
|-----------|---------|
| `my-llm-worker/index.ts` | Streaming LLM handler |
| `my-llm-worker/wrangler.toml` | Worker config with AI binding + rate limit |
| `my-llm-worker/package.json` | Minimal dependencies |

### Test Files
| File Path | Purpose |
|-----------|---------|
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/tests/verify-structure.sh` | Verify flat structure, no placeholders |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/tests/verify-types.sh` | Run `tsc --noEmit` |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/tests/verify-dependencies.sh` | Verify zero dependencies |
| `deliverables/github-issue-sethshoultes-shipyard-ai-86/tests/verify-generated-output.sh` | Verify generated worker files |

---

## 5. Out of Scope (v1 Cuts)

Per decisions.md §"Explicitly CUT from v1":

- [ ] Image and audio models
- [ ] Interactive wizard / prompts
- [ ] Caching layer (edge cache, KV, R2)
- [ ] Monitoring / dashboards / observability
- [ ] Multi-cloud support (AWS/GCP/Azure)
- [ ] Web UI
- [ ] Model picker / multimodal logic
- [ ] Static/cookie-cutter hand-written templates
- [ ] 47 CLI flags

---

## 6. Open Questions (Deferred)

Per decisions.md §"Open Questions":

1. **Auth friction mitigation** — needs design for CLI path
2. **Default model selection algorithm** — needs logic in spec parser
3. **Distribution execution** — tactics need owner and timeline post-build
4. **Wizard for v2?** — deferred until v1 hits 100-concurrent-stream metric

---

*This spec is the contract for the build phase. If it's not in here, it's not in v1.*
