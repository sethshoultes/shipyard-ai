# Phase 1 Plan — WorkerKit v1

**Generated**: 2026-04-15
**Requirements**: `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`
**Total Tasks**: 18
**Waves**: 3
**Time Budget**: 6 hours

---

## EXECUTIVE SUMMARY

**What we're building:** A zero-dependency CLI tool (`create-workerkit`) that generates production-ready Cloudflare Workers applications with Hono, D1, Clerk auth, Workers AI, and Stripe payments—all in under 60 seconds.

**Why it matters:** Projects die in setup. WorkerKit eliminates 4-6 hours of boilerplate configuration, letting developers ship their first feature on day one instead of day three.

**Core promise:** `npx create-workerkit my-app` → working localhost in <20 seconds → deployed to production in <5 minutes.

**Critical constraints:**
- **6-hour time budget** - Must ship complete v1 within single build session
- **Zero dependencies** - CLI uses Node builtins only (fs, path, readline)
- **Single opinionated stack** - Hono + D1 + Clerk + Workers AI + Stripe (no alternatives)
- **Security-first** - Stripe webhook signature verification is non-negotiable
- **Zero runtime dependencies** - Generated projects have no WorkerKit dependency

**Success criteria:**
- ✅ CLI generates valid projects with zero syntax errors
- ✅ Generated projects run locally without API keys (mock mode)
- ✅ All 5 integrations have working examples (Hono, D1, AI, Clerk, Stripe)
- ✅ README enables 5-minute setup for first-time users
- ✅ Stripe webhooks are secure by default (signature verification included)
- ✅ Published to npm as `create-workerkit@latest`

---

## REQUIREMENTS TRACEABILITY

| Requirement | Task(s) | Wave | Coverage |
|-------------|---------|------|----------|
| REQ-001 to REQ-007 (CLI) | phase-1-task-1, task-2 | 1 | Complete |
| REQ-008 to REQ-013 (Project Structure) | phase-1-task-3, task-4, task-5 | 1 | Complete |
| REQ-014 to REQ-016 (Hono Framework) | phase-1-task-6 | 2 | Complete |
| REQ-017 to REQ-020 (D1 Database) | phase-1-task-7 | 2 | Complete |
| REQ-021 to REQ-026 (AI Integration) | phase-1-task-8 | 2 | Complete |
| REQ-027 to REQ-030 (Clerk Auth) | phase-1-task-9 | 2 | Complete |
| REQ-031 to REQ-036 (Stripe Payments) | phase-1-task-10 | 2 | Complete |
| REQ-037 to REQ-040 (Config & Types) | phase-1-task-11 | 2 | Complete |
| REQ-041 to REQ-050 (Documentation) | phase-1-task-12 | 2 | Complete |
| REQ-051 to REQ-054 (Distribution) | phase-1-task-16 | 3 | Complete |
| REQ-055 to REQ-060 (Testing) | phase-1-task-13, task-14, task-15 | 3 | Complete |
| REQ-061 to REQ-064 (Quality) | All tasks | All | Complete |
| REQ-065 to REQ-066 (Brand) | phase-1-task-1, task-12 | 1, 2 | Complete |

---

## WAVE EXECUTION ORDER

### Wave 1 (Parallel) — Foundation & CLI Core

**Estimated Duration:** 2 hours
**Goal:** Build CLI scaffold generator with interactive prompts and file generation infrastructure

Tasks can run in parallel after task-1 completes (task-1 creates project structure, tasks 2-5 operate independently).

---

<task-plan id="phase-1-task-1" wave="1">
  <title>Initialize CLI Project Structure & Entry Point</title>
  <requirement>REQ-001, REQ-004, REQ-061, REQ-066 - Create CLI scaffold generator with zero dependencies</requirement>
  <description>
    Initialize the create-workerkit CLI package structure with package.json, bin/create-workerkit entry point, and core file structure. Establish zero-dependency architecture using Node builtins (fs, path, readline) only. Set up project naming as "WorkerKit" per brand requirements.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/prds/workerkit.md" reason="Complete PRD with CLI requirements and architecture" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Locked decisions on zero-dependency constraint and CLI structure" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/package.json" reason="Reference pattern for CLI package.json structure" />
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/bin/tuned" reason="Reference shebang entry point pattern" />
  </context>

  <steps>
    <step order="1">Create directory structure: `mkdir -p create-workerkit/{bin,src,templates}`</step>
    <step order="2">Generate package.json with name "create-workerkit", version "1.0.0", type "module", bin entry pointing to "bin/create-workerkit", no dependencies (only devDependencies for TypeScript)</step>
    <step order="3">Create bin/create-workerkit shebang entry point: `#!/usr/bin/env node` followed by import of main CLI module</step>
    <step order="4">Create src/index.ts as main CLI logic entry point with parseArgs() using Node's process.argv</step>
    <step order="5">Add README.md with project tagline: "Zero-to-deployed business app in under 60 seconds"</step>
    <step order="6">Initialize git repo: `git init` and create .gitignore (node_modules, dist, .DS_Store)</step>
    <step order="7">Verify no external dependencies in package.json (only @types/* and typescript in devDependencies)</step>
  </steps>

  <verification>
    <check type="build">npm install && npm run build (TypeScript compilation)</check>
    <check type="manual">Verify bin/create-workerkit is executable: `chmod +x bin/create-workerkit && ./bin/create-workerkit --version`</check>
    <check type="manual">Confirm zero runtime dependencies: `cat package.json | grep dependencies` shows only devDependencies</check>
  </verification>

  <dependencies>
    <!-- No dependencies - this is the first task -->
  </dependencies>

  <commit-message>chore: initialize create-workerkit CLI project structure

Zero-dependency CLI scaffold with Node builtins only. Project structure:
- bin/create-workerkit (entry point)
- src/index.ts (main logic)
- templates/ (code generation templates)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-2" wave="1">
  <title>Implement Interactive Prompts & CLI Argument Parser</title>
  <requirement>REQ-002, REQ-003, REQ-005, REQ-007 - Interactive prompts with flag-based fast path</requirement>
  <description>
    Build interactive CLI prompt system using Node's readline builtin for 5 questions: project name, auth (Clerk), database (D1), AI (Workers AI), payments (Stripe). Support flag-based fast path (--skip-prompts). Output must be minimal and confident (no emojis, no chatty language).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/cli/src/commands/rollback.ts" reason="Reference pattern for readline-based interactive prompts" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Brand voice requirements: confident, precise, minimal output" />
  </context>

  <steps>
    <step order="1">Create src/prompts.ts module with readline-based prompt functions: promptText(), promptBoolean()</step>
    <step order="2">Implement parseArgs() function to handle CLI flags: --name, --skip-prompts, --version, --help</step>
    <step order="3">Build collectAnswers() function that prompts for: project name (required), needsAuth (default: y), needsDatabase (default: y), needsAI (default: y), needsPayments (default: n)</step>
    <step order="4">Add validation for project name: lowercase alphanumeric + hyphens only, max 50 chars, no special chars</step>
    <step order="5">Implement --skip-prompts flag path that uses defaults: auth=true, db=true, ai=true, payments=false</step>
    <step order="6">Add console output with minimal branding: "Creating [project-name]..." (no spinners, no emojis)</step>
    <step order="7">Add timing logic to track generation speed (target: <20s fast connection, <45s slow)</step>
  </steps>

  <verification>
    <check type="manual">Run CLI with prompts: `./bin/create-workerkit test-app` and answer all 5 questions</check>
    <check type="manual">Run CLI with flags: `./bin/create-workerkit test-app2 --skip-prompts` (should complete instantly)</check>
    <check type="manual">Test invalid names: `./bin/create-workerkit Test_App!` (should reject with clear error)</check>
    <check type="manual">Verify brand voice: console output is confident and minimal (no "🎉 Yay!")</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires CLI project structure and entry point" />
  </dependencies>

  <commit-message>feat(cli): add interactive prompts with flag-based fast path

Implements 5-question setup flow:
- Project name (validated)
- Auth (Clerk) - default yes
- Database (D1) - default yes
- AI (Workers AI) - default yes
- Payments (Stripe) - default no

Supports --skip-prompts for instant generation.
Brand voice: confident, precise, minimal output.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-3" wave="1">
  <title>Generate package.json Template</title>
  <requirement>REQ-011, REQ-062, REQ-063 - Zero WorkerKit runtime dependencies, locked versions</requirement>
  <description>
    Create template generation logic for package.json that includes Hono, Wrangler, TypeScript, and conditional dependencies (Clerk SDK if auth selected, Stripe SDK if payments selected). Lock dependency versions for stability. Zero WorkerKit runtime dependency.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/package.json" reason="Reference for minimal Cloudflare Workers package.json" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Locked dependency versions requirement for stability" />
  </context>

  <steps>
    <step order="1">Create src/templates/package-json.ts with generatePackageJson(config) function</step>
    <step order="2">Define base dependencies: hono (^4.x), @cloudflare/workers-types (^4.x), wrangler (^3.x), typescript (^5.x)</step>
    <step order="3">Add conditional dependency: @clerk/backend (^1.x) if config.needsAuth === true</step>
    <step order="4">Add conditional dependency: stripe (^15.x) if config.needsPayments === true</step>
    <step order="5">Generate scripts object: dev (wrangler dev), deploy (wrangler deploy), build (wrangler build), typecheck (tsc --noEmit), test (node tests/run.js)</step>
    <step order="6">Set package name to user's project name, version to 0.0.1, type to "module"</step>
    <step order="7">Add engines constraint: node >= 18.0.0 (Cloudflare Workers compatibility)</step>
    <step order="8">Verify generated JSON is valid with JSON.parse() before writing to file</step>
  </steps>

  <verification>
    <check type="manual">Generate sample package.json: `generatePackageJson({ name: 'test-app', needsAuth: true, needsPayments: true })` and verify JSON is valid</check>
    <check type="manual">Confirm no WorkerKit dependency in generated package.json (grep for "workerkit")</check>
    <check type="manual">Verify dependency versions are locked (e.g., "^4.x" not "*")</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires CLI project structure" />
  </dependencies>

  <commit-message>feat(templates): add package.json generator with locked dependencies

Generates package.json with:
- Base deps: Hono, Wrangler, TypeScript, Cloudflare Workers types
- Conditional: Clerk SDK (if auth), Stripe SDK (if payments)
- Scripts: dev, deploy, build, typecheck, test
- Zero WorkerKit runtime dependency

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-4" wave="1">
  <title>Generate wrangler.toml Template</title>
  <requirement>REQ-010, REQ-037, REQ-038, REQ-064 - Fully configured wrangler.toml with excellent inline comments</requirement>
  <description>
    Create template for wrangler.toml with D1 database binding, Workers AI binding, KV namespace (optional), and inline comments explaining every setting. Must be transparent and editable without breaking the project.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/wrangler.toml" reason="Reference for Cloudflare Workers wrangler.toml structure with D1 and KV bindings" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Transparent configuration philosophy with inline comments" />
  </context>

  <steps>
    <step order="1">Create src/templates/wrangler-toml.ts with generateWranglerToml(config) function</step>
    <step order="2">Generate main section with: name (from project name), main = "src/index.ts", compatibility_date = today's date (YYYY-MM-DD), compatibility_flags = ["nodejs_compat"]</step>
    <step order="3">Add D1 database binding with inline comments: "# D1 Database - Cloudflare's SQLite at the edge | Run: wrangler d1 create ${projectName}_db"</step>
    <step order="4">Add Workers AI binding with inline comments: "# Workers AI - Run LLMs at the edge | Free tier: generous daily quota"</step>
    <step order="5">Add placeholder account_id with comment: "# Your Cloudflare account ID - Get it: dash.cloudflare.com → Workers & Pages → Account ID"</step>
    <step order="6">Add KV namespace binding (optional) with comment: "# KV Namespace - Key-value storage for sessions/cache (optional)"</step>
    <step order="7">Add observability section: { enabled: true } with comment explaining dashboard access</step>
    <step order="8">Validate TOML syntax before returning (no external parser; manual validation of structure)</step>
  </steps>

  <verification>
    <check type="manual">Generate sample wrangler.toml and verify it contains inline comments for every section</check>
    <check type="manual">Verify D1 binding name matches src/index.ts usage (binding = "DB")</check>
    <check type="manual">Confirm file is editable: user can change account_id without breaking anything</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires CLI project structure" />
  </dependencies>

  <commit-message>feat(templates): add wrangler.toml generator with inline documentation

Generates wrangler.toml with:
- D1 database binding (DB)
- Workers AI binding (AI)
- KV namespace (optional)
- Inline comments explaining every setting
- Transparent and editable configuration

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-5" wave="1">
  <title>Generate tsconfig.json & .gitignore Templates</title>
  <requirement>REQ-012, REQ-040 - TypeScript strict mode, type-safe compilation</requirement>
  <description>
    Create tsconfig.json template configured for Cloudflare Workers with strict mode enabled. Generate .gitignore to exclude node_modules, dist, wrangler output, and .env files.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/tsconfig.json" reason="Reference for Cloudflare Workers TypeScript configuration" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="TypeScript strict mode requirement" />
  </context>

  <steps>
    <step order="1">Create src/templates/tsconfig.ts with generateTsConfig() function</step>
    <step order="2">Set compilerOptions: target = "ES2022", module = "ES2022", lib = ["ES2022"], strict = true, types = ["@cloudflare/workers-types"]</step>
    <step order="3">Configure module resolution: moduleResolution = "node", resolveJsonModule = true, esModuleInterop = true</step>
    <step order="4">Set output options: outDir = "./dist", declaration = true, skipLibCheck = true</step>
    <step order="5">Define include: ["src/**/*"], exclude: ["node_modules", "dist", ".wrangler"]</step>
    <step order="6">Create src/templates/gitignore.ts with generateGitignore() function</step>
    <step order="7">Generate .gitignore content: node_modules/, dist/, .wrangler/, .env, .dev.vars, *.log, .DS_Store</step>
  </steps>

  <verification>
    <check type="manual">Generate tsconfig.json and verify strict mode is enabled</check>
    <check type="manual">Confirm types array includes @cloudflare/workers-types</check>
    <check type="manual">Verify .gitignore excludes sensitive files (.env, .dev.vars)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Requires CLI project structure" />
  </dependencies>

  <commit-message>feat(templates): add tsconfig.json and .gitignore generators

TypeScript config:
- Strict mode enabled
- Target: ES2022 (Workers runtime)
- Types: @cloudflare/workers-types
- Fully type-safe compilation

Gitignore: node_modules, dist, .wrangler, .env, logs

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 2 (Parallel) — Generate Code Templates & Documentation

**Estimated Duration:** 3 hours
**Goal:** Generate all source code templates (Hono app, D1, AI, Auth, Stripe) and comprehensive documentation

All tasks in this wave can run in parallel after Wave 1 completes.

---

<task-plan id="phase-1-task-6" wave="2">
  <title>Generate Hono Application Template (src/index.ts)</title>
  <requirement>REQ-013, REQ-014, REQ-015, REQ-016 - Hono framework with example routes and hot reload</requirement>
  <description>
    Create src/index.ts template with Hono application entry point, public routes (GET /health, GET /), and auth-protected route example. Support hot reload via wrangler dev.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/index.ts" reason="Reference for Cloudflare Worker entry point with bindings" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Hono as sole framework, example routes requirement" />
  </context>

  <steps>
    <step order="1">Create src/templates/index-ts.ts with generateIndexTs(config) function</step>
    <step order="2">Import Hono from 'hono' and create app instance: `const app = new Hono<{ Bindings: Env }>()`</step>
    <step order="3">Add GET /health route returning { status: 'ok', timestamp: Date.now() }</step>
    <step order="4">Add GET / route returning welcome message with project name</step>
    <step order="5">If config.needsAuth, add GET /protected route with auth middleware import</step>
    <step order="6">If config.needsDatabase, add example GET /api/users route with D1 query</step>
    <step order="7">If config.needsAI, add POST /api/chat route with AI service import</step>
    <step order="8">If config.needsPayments, add POST /api/checkout route with Stripe import</step>
    <step order="9">Add export default app at bottom for Cloudflare Workers export</step>
    <step order="10">Include inline comments explaining each route and binding usage</step>
  </steps>

  <verification>
    <check type="manual">Generate index.ts with all features enabled and verify TypeScript compiles without errors</check>
    <check type="manual">Verify Hono app export matches Cloudflare Workers format (export default app)</check>
    <check type="manual">Confirm GET /health route exists in all variants</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires package.json to know which dependencies are included" />
  </dependencies>

  <commit-message>feat(templates): add Hono application entry point template

Generates src/index.ts with:
- Hono app with typed bindings
- Public routes: GET /health, GET /
- Conditional routes: /protected (auth), /api/users (db), /api/chat (ai), /api/checkout (payments)
- Hot reload support via wrangler dev

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-7" wave="2">
  <title>Generate D1 Database Integration (db.ts & migration)</title>
  <requirement>REQ-018, REQ-019, REQ-020 - D1 migration file, query wrapper, inline comments</requirement>
  <description>
    Create src/db.ts with simple D1 query wrapper and migrations/0001_create_users.sql with example users table. Include inline comments explaining D1 binding and setup process.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/schema.sql" reason="Reference for D1 database schema and migration file structure" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="D1 as sole database, simple query wrapper requirement" />
  </context>

  <steps>
    <step order="1">Create src/templates/db-ts.ts with generateDbTs() function</step>
    <step order="2">Generate src/db.ts with query() helper function that wraps D1 prepare().bind().all()</step>
    <step order="3">Add error handling with clear messages: "Database query failed. Ensure D1 is created: wrangler d1 create ${projectName}_db"</step>
    <step order="4">Add inline comments explaining D1 binding usage and Cloudflare env.DB access</step>
    <step order="5">Create src/templates/migration-sql.ts with generateMigration() function</step>
    <step order="6">Generate migrations/0001_create_users.sql with CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)</step>
    <step order="7">Add inline SQL comments: "-- D1 Database Migration | Run: wrangler d1 execute ${projectName}_db --local --file migrations/0001_create_users.sql"</step>
    <step order="8">Add CREATE INDEX on email column for query performance</step>
  </steps>

  <verification>
    <check type="manual">Generate db.ts and verify query() function handles errors gracefully</check>
    <check type="manual">Verify migration SQL is valid SQLite syntax (no PostgreSQL-specific features)</check>
    <check type="manual">Confirm inline comments explain D1 setup process</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires wrangler.toml to know D1 binding name" />
  </dependencies>

  <commit-message>feat(templates): add D1 database integration templates

Generates:
- src/db.ts: Simple query wrapper with error handling
- migrations/0001_create_users.sql: Example users table
- Inline comments explaining D1 binding and setup

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-8" wave="2">
  <title>Generate AI Service Abstraction (ai.ts)</title>
  <requirement>REQ-021, REQ-022, REQ-023, REQ-024, REQ-025, REQ-026 - Workers AI with Claude fallback</requirement>
  <description>
    Create src/ai.ts with simple abstraction layer that defaults to Workers AI (@cf/meta/llama-2-7b-chat-int8) and automatically falls back to Anthropic Claude if Workers AI fails or ANTHROPIC_API_KEY is provided. Include graceful error handling with clear messages.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="AI abstraction scope: simple ai.chat() function with auto-routing" />
  </context>

  <steps>
    <step order="1">Create src/templates/ai-ts.ts with generateAiTs() function</step>
    <step order="2">Generate src/ai.ts with chat(prompt, options) function as primary API</step>
    <step order="3">Implement Workers AI call: env.AI.run('@cf/meta/llama-2-7b-chat-int8', { prompt, max_tokens: 512 })</step>
    <step order="4">Wrap in try-catch for automatic Claude fallback on quota exceeded or rate limit errors</step>
    <step order="5">Implement claudeChat() fallback function using fetch to Anthropic API (if ANTHROPIC_API_KEY exists)</step>
    <step order="6">Add error message if both fail: "Workers AI quota exceeded. Add ANTHROPIC_API_KEY to .env for Claude fallback. Get key: https://console.anthropic.com/account/keys"</step>
    <step order="7">Add inline comments explaining quota limits and fallback strategy</step>
    <step order="8">Generate example POST /api/chat route in routes/api.ts demonstrating usage</step>
  </steps>

  <verification>
    <check type="manual">Generate ai.ts and verify Workers AI is called first (primary)</check>
    <check type="manual">Verify Claude fallback only triggers if ANTHROPIC_API_KEY exists or Workers AI fails</check>
    <check type="manual">Test error message clarity: simulate quota exceeded and verify message is actionable</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires wrangler.toml to know AI binding name" />
  </dependencies>

  <commit-message>feat(templates): add AI service abstraction with Workers AI + Claude fallback

Generates src/ai.ts with:
- Primary: Workers AI (@cf/meta/llama-2-7b-chat-int8)
- Fallback: Anthropic Claude (if API key provided)
- Auto-routing on quota exceeded
- Clear error messages with setup URLs
- Example POST /api/chat route

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-9" wave="2">
  <title>Generate Clerk Authentication Middleware (auth.ts)</title>
  <requirement>REQ-028, REQ-029, REQ-030 - Clerk JWT validation with zero-config local dev mode</requirement>
  <description>
    Create src/auth.ts with Clerk JWT validation middleware that works without API keys in local development (mock mode) and validates real JWTs in production. Include clear setup instructions in .env.example.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/lib/auth.ts" reason="Reference for auth validation pattern in Cloudflare Workers" />
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Zero-config local dev requirement: mock auth without API keys" />
  </context>

  <steps>
    <step order="1">Create src/templates/auth-ts.ts with generateAuthTs() function</step>
    <step order="2">Generate src/auth.ts with authMiddleware(c, next) Hono middleware function</step>
    <step order="3">Check if CLERK_SECRET_KEY environment variable exists; if not, enable mock mode</step>
    <step order="4">In mock mode: attach dummy user { id: 'local-dev', email: 'dev@example.com' } and call next()</step>
    <step order="5">In production mode: extract Authorization header, validate JWT with Clerk SDK</step>
    <step order="6">Return 401 with actionable error if auth fails: "Missing: CLERK_SECRET_KEY in .env | Get it: https://dashboard.clerk.com/api-keys"</step>
    <step order="7">Add inline comments explaining mock mode and when production mode activates</step>
    <step order="8">Generate example protected route in index.ts demonstrating middleware usage</step>
  </steps>

  <verification>
    <check type="manual">Generate auth.ts and verify mock mode activates when CLERK_SECRET_KEY is missing</check>
    <check type="manual">Test protected route without API key: should return 200 with mock user in local dev</check>
    <check type="manual">Verify error message includes direct link to Clerk dashboard</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires package.json to know if Clerk SDK is included" />
  </dependencies>

  <commit-message>feat(templates): add Clerk authentication middleware with zero-config dev mode

Generates src/auth.ts with:
- Mock mode for local dev (no API keys needed)
- Production mode with Clerk JWT validation
- Actionable error messages with dashboard URLs
- Example protected route in index.ts

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-10" wave="2">
  <title>Generate Stripe Payment Integration (payments.ts)</title>
  <requirement>REQ-032, REQ-033, REQ-034, REQ-035, REQ-036 - Stripe checkout + webhook with signature verification</requirement>
  <description>
    Create src/payments.ts with Stripe checkout session creation and webhook handler for checkout.session.completed event. CRITICAL: Include webhook signature verification with security-critical comments. Add prominent security warnings in README and .env.example.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Stripe security requirements: webhook signature verification is non-negotiable" />
  </context>

  <steps>
    <step order="1">Create src/templates/payments-ts.ts with generatePaymentsTs() function</step>
    <step order="2">Generate src/payments.ts with createCheckoutSession(c) route handler</step>
    <step order="3">Add Stripe SDK import and checkout session creation logic: Stripe().checkout.sessions.create({ mode: 'payment', ... })</step>
    <step order="4">Generate handleStripeWebhook(c) route handler for POST /api/stripe-webhook</step>
    <step order="5">CRITICAL: Implement webhook signature verification using crypto.createHmac with timing-safe comparison</step>
    <step order="6">Add error if STRIPE_WEBHOOK_SECRET is missing in production: "CRITICAL: STRIPE_WEBHOOK_SECRET not configured. You are vulnerable to fraud."</step>
    <step order="7">Include security-critical inline comments: "⚠️ Signature verification is required to prevent payment fraud"</step>
    <step order="8">Generate .env.example entry with prominent warning: "# ⚠️ WITHOUT THIS, YOUR PAYMENTS ARE NOT VERIFIED"</step>
  </steps>

  <verification>
    <check type="manual">Generate payments.ts and verify webhook signature verification code exists</check>
    <check type="manual">Test webhook without signature header: should return 403 Forbidden</check>
    <check type="manual">Confirm .env.example has security warning about webhook secret</check>
    <check type="test">Test rejects unsigned webhook requests (status 403)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires package.json to know if Stripe SDK is included" />
  </dependencies>

  <commit-message>feat(templates): add Stripe payment integration with mandatory signature verification

Generates src/payments.ts with:
- Checkout session creation endpoint
- Webhook handler for checkout.session.completed
- REQUIRED webhook signature verification (security-critical)
- Timing-safe comparison to prevent attacks
- Actionable error if webhook secret missing
- Security warnings in code and .env.example

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-11" wave="2">
  <title>Generate TypeScript Environment Types (env.d.ts)</title>
  <requirement>REQ-039, REQ-040 - TypeScript bindings for Cloudflare Workers environment</requirement>
  <description>
    Create src/types/env.d.ts with TypeScript interface definitions for all Cloudflare Workers bindings: D1Database, Ai, KVNamespace, and environment variables (CLERK_SECRET_KEY, STRIPE_API_KEY, etc.).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/projects/tuned/worker/src/index.ts" reason="Reference for Cloudflare Workers env types and bindings" />
  </context>

  <steps>
    <step order="1">Create src/templates/env-dts.ts with generateEnvDts(config) function</step>
    <step order="2">Generate src/types/env.d.ts with Env interface extending Cloudflare Workers types</step>
    <step order="3">Add DB: D1Database binding if config.needsDatabase</step>
    <step order="4">Add AI: Ai binding if config.needsAI</step>
    <step order="5">Add optional KV: KVNamespace binding (commented out)</step>
    <step order="6">Define environment variables: CLERK_SECRET_KEY (if auth), STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET (if payments), ANTHROPIC_API_KEY (if AI)</step>
    <step order="7">Import @cloudflare/workers-types for D1Database, Ai, KVNamespace types</step>
  </steps>

  <verification>
    <check type="build">Generate env.d.ts and verify TypeScript compilation succeeds</check>
    <check type="manual">Confirm Env interface matches wrangler.toml bindings (DB, AI)</check>
    <check type="manual">Verify environment variable types are string | undefined</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="Requires wrangler.toml to know which bindings are configured" />
  </dependencies>

  <commit-message>feat(templates): add TypeScript environment types for Workers bindings

Generates src/types/env.d.ts with:
- D1Database binding (DB)
- Workers AI binding (AI)
- KV namespace (optional, commented)
- Environment variables: CLERK_SECRET_KEY, STRIPE_API_KEY, etc.
- Full type safety for Cloudflare Workers environment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-12" wave="2">
  <title>Generate Comprehensive README.md</title>
  <requirement>REQ-041 to REQ-050 - Excellent README with quickstart, setup, troubleshooting, security warnings</requirement>
  <description>
    Create README.md template with 30-second quickstart, D1 setup instructions, API key setup for Clerk/Stripe/Anthropic, troubleshooting section with direct dashboard links, critical security section for Stripe webhooks, deployment steps, and "Built with WorkerKit" badge.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="README requirements: excellent documentation, troubleshooting, security warnings, brand voice" />
  </context>

  <steps>
    <step order="1">Create src/templates/readme-md.ts with generateReadme(config) function</step>
    <step order="2">Add hero section with project name and tagline: "Built with WorkerKit – Zero-to-deployed in under 60 seconds"</step>
    <step order="3">Add 30-second quickstart: npm install, wrangler d1 create, npm run dev (with exact commands)</step>
    <step order="4">Add "Local dev (no keys needed)" section explaining mock mode for auth and payments</step>
    <step order="5">Add "Deploy (keys required)" section with Clerk, Stripe, Anthropic API key setup instructions and dashboard URLs</step>
    <step order="6">Add "D1 Database Setup" section with wrangler d1 commands and migration instructions</step>
    <step order="7">Add "🔒 CRITICAL: Secure your Stripe webhooks" section with webhook signature verification explanation</step>
    <step order="8">Add "AI Troubleshooting" section explaining Workers AI quota and Claude fallback</step>
    <step order="9">Add "Troubleshooting" section with common errors (missing API keys, D1 not created) and direct dashboard links</step>
    <step order="10">Add "Deployment" section with wrangler deploy command and custom domain setup</step>
    <step order="11">Add "Want to swap X?" sections for Auth.js, direct Anthropic, etc.</step>
    <step order="12">Add "Built with WorkerKit" badge at bottom with link to GitHub repo</step>
  </steps>

  <verification>
    <check type="manual">Generate README and verify it has all required sections</check>
    <check type="manual">Verify "Built with WorkerKit" badge exists with correct link</check>
    <check type="manual">Confirm security warning for Stripe webhooks is prominent (uses 🔒 emoji)</check>
    <check type="manual">Test that all dashboard URLs are correct (Clerk, Stripe, Anthropic)</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-6" reason="Requires knowledge of generated routes" />
    <depends-on task-id="phase-1-task-7" reason="Requires D1 migration file name" />
    <depends-on task-id="phase-1-task-9" reason="Requires knowledge of auth setup" />
    <depends-on task-id="phase-1-task-10" reason="Requires knowledge of Stripe webhook setup" />
  </dependencies>

  <commit-message>feat(templates): add comprehensive README with quickstart and security warnings

Generates README.md with:
- 30-second quickstart
- Local dev (no keys) vs Deploy (keys required) sections
- D1 database setup with exact commands
- 🔒 CRITICAL security section for Stripe webhooks
- AI troubleshooting (quota, fallback)
- Troubleshooting with dashboard links
- Deployment guide
- "Want to swap X?" sections
- "Built with WorkerKit" badge

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

### Wave 3 (Sequential) — Testing, Validation & Distribution

**Estimated Duration:** 1 hour
**Goal:** Validate generated projects work correctly, test critical paths, and publish to npm

Tasks in this wave must run sequentially as they depend on complete code generation from Wave 2.

---

<task-plan id="phase-1-task-13" wave="3">
  <title>Implement Post-Generation Validation</title>
  <requirement>REQ-055, REQ-056, REQ-057 - Verify CLI generates valid projects and runs without errors</requirement>
  <description>
    Add validation logic that runs after project generation to verify all files were created, package.json and wrangler.toml are valid, TypeScript compiles without errors, and generated project can npm install successfully.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Post-generation validation requirement to catch errors before user sees them" />
  </context>

  <steps>
    <step order="1">Create src/validate.ts with validateGeneratedProject(projectDir) function</step>
    <step order="2">Verify all expected files exist: package.json, wrangler.toml, tsconfig.json, src/index.ts, README.md</step>
    <step order="3">Validate package.json is valid JSON: JSON.parse(fs.readFileSync('package.json'))</step>
    <step order="4">Validate wrangler.toml has correct structure (manual check for required keys: name, main, compatibility_date)</step>
    <step order="5">Verify no placeholder values remain: grep for "your_account_id_here" and warn user</step>
    <step order="6">Test TypeScript compilation: run tsc --noEmit in generated project directory</step>
    <step order="7">If validation fails, throw clear error with file path and reason</step>
    <step order="8">Add validation call to CLI after file generation: validateGeneratedProject(projectPath)</step>
  </steps>

  <verification>
    <check type="build">Generate test project and verify validation passes without errors</check>
    <check type="manual">Intentionally corrupt package.json (invalid JSON) and verify validation catches it</check>
    <check type="manual">Remove required file (src/index.ts) and verify validation fails with clear error</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Requires package.json template" />
    <depends-on task-id="phase-1-task-4" reason="Requires wrangler.toml template" />
    <depends-on task-id="phase-1-task-6" reason="Requires index.ts template" />
  </dependencies>

  <commit-message>feat(cli): add post-generation validation

Validates generated projects:
- All expected files exist
- package.json is valid JSON
- wrangler.toml has required fields
- No placeholder values remain
- TypeScript compiles without errors
- Clear error messages if validation fails

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-14" wave="3">
  <title>Create End-to-End Test Suite</title>
  <requirement>REQ-058, REQ-059, REQ-060 - Verify all integrations work, test error messages</requirement>
  <description>
    Create automated test suite that generates a test project, runs npm install, starts wrangler dev, and tests all critical endpoints (health, auth, database, AI, payments). Verify error messages for missing configuration.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Testing requirements: verify all 5 integrations, test error messages" />
  </context>

  <steps>
    <step order="1">Create tests/e2e.test.ts with end-to-end test suite</step>
    <step order="2">Test 1: Generate project with all features enabled: run CLI with --skip-prompts</step>
    <step order="3">Test 2: Run npm install in generated project and verify no errors</step>
    <step order="4">Test 3: Start wrangler dev and wait for server to be ready</step>
    <step order="5">Test 4: Call GET /health endpoint and verify 200 response</step>
    <step order="6">Test 5: Call GET /protected endpoint without auth and verify mock mode works (200 response in dev)</step>
    <step order="7">Test 6: Simulate missing CLERK_SECRET_KEY in production and verify actionable error message</step>
    <step order="8">Test 7: Call POST /api/stripe-webhook without signature and verify 403 Forbidden</step>
    <step order="9">Test 8: Verify README.md has "Built with WorkerKit" badge</step>
    <step order="10">Clean up: stop wrangler dev and remove test project</step>
  </steps>

  <verification>
    <check type="test">Run tests/e2e.test.ts and verify all tests pass</check>
    <check type="manual">Verify test suite completes in under 2 minutes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Requires validation logic" />
    <depends-on task-id="phase-1-task-6" reason="Requires index.ts template with routes" />
    <depends-on task-id="phase-1-task-9" reason="Requires auth middleware" />
    <depends-on task-id="phase-1-task-10" reason="Requires Stripe webhook handler" />
  </dependencies>

  <commit-message>test: add end-to-end test suite for generated projects

Tests:
- CLI generates valid project
- npm install succeeds
- wrangler dev starts successfully
- GET /health returns 200
- Auth mock mode works without API keys
- Error messages are actionable
- Stripe webhook rejects unsigned requests
- README has WorkerKit badge

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-15" wave="3">
  <title>Generate .env.example Template</title>
  <requirement>REQ-009, REQ-030, REQ-036 - Document all API keys with setup URLs and security warnings</requirement>
  <description>
    Create .env.example template with all required and optional environment variables documented. Include setup URLs for each service (Clerk, Stripe, Anthropic) and security warnings for critical secrets.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason=".env.example must have excellent inline documentation" />
  </context>

  <steps>
    <step order="1">Create src/templates/env-example.ts with generateEnvExample(config) function</step>
    <step order="2">Add header comment: "# Environment Variables for [project name] | Copy to .env and fill in your values"</step>
    <step order="3">Add Clerk section (if auth enabled): CLERK_SECRET_KEY with comment "Get from: https://dashboard.clerk.com → API Keys → Secret Key"</step>
    <step order="4">Add Stripe section (if payments enabled): STRIPE_API_KEY and STRIPE_WEBHOOK_SECRET with security warning "⚠️ WITHOUT THIS, PAYMENTS ARE NOT VERIFIED"</step>
    <step order="5">Add Anthropic section (if AI enabled): ANTHROPIC_API_KEY with comment "(Optional, for Claude fallback) Get from: https://console.anthropic.com/account/keys"</step>
    <step order="6">Add "Local Development" section explaining which keys are optional for npm run dev</step>
    <step order="7">Add "Production Deployment" section listing required keys for wrangler deploy</step>
  </steps>

  <verification>
    <check type="manual">Generate .env.example and verify all API keys have setup URLs</check>
    <check type="manual">Confirm STRIPE_WEBHOOK_SECRET has security warning</check>
    <check type="manual">Verify distinction between optional (local dev) and required (production) is clear</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-9" reason="Requires knowledge of auth environment variables" />
    <depends-on task-id="phase-1-task-10" reason="Requires knowledge of Stripe environment variables" />
    <depends-on task-id="phase-1-task-8" reason="Requires knowledge of AI environment variables" />
  </dependencies>

  <commit-message>feat(templates): add .env.example with setup URLs and security warnings

Generates .env.example with:
- Clerk: CLERK_SECRET_KEY (dashboard URL included)
- Stripe: STRIPE_API_KEY, STRIPE_WEBHOOK_SECRET (⚠️ security warning)
- Anthropic: ANTHROPIC_API_KEY (optional, for fallback)
- Local dev vs Production sections
- Clear comments explaining which keys are required

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-16" wave="3">
  <title>Publish CLI to npm & Create GitHub Repository</title>
  <requirement>REQ-051, REQ-052, REQ-053, REQ-054 - Publish to npm, GitHub repo with tags</requirement>
  <description>
    Build CLI package, publish to npm as create-workerkit@latest, create public GitHub repository with README, apply discoverability tags (cloudflare-workers, hono, d1), and enable GitHub template system.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Distribution strategy: npm package + GitHub repo + tags for SEO" />
  </context>

  <steps>
    <step order="1">Run npm run build to compile TypeScript CLI to JavaScript</step>
    <step order="2">Test CLI locally: npm link and run create-workerkit test-project</step>
    <step order="3">Verify generated project works: cd test-project && npm install && npm run dev</step>
    <step order="4">Create GitHub repository: github.com/[org]/create-workerkit (public)</step>
    <step order="5">Copy CLI README.md to GitHub repo with installation instructions</step>
    <step order="6">Apply GitHub topics: cloudflare-workers, cloudflare-template, hono, d1, typescript, cli-tool</step>
    <step order="7">Enable GitHub template repository setting (Settings → Template repository checkbox)</step>
    <step order="8">Publish to npm: npm publish --access public</step>
    <step order="9">Verify npm package is live: npm view create-workerkit</step>
    <step order="10">Test published package: npx create-workerkit@latest test-app</step>
  </steps>

  <verification>
    <check type="manual">Verify npm package is published: https://www.npmjs.com/package/create-workerkit</check>
    <check type="manual">Verify GitHub repo is public with correct tags</check>
    <check type="manual">Test installation: npx create-workerkit@latest test-final && cd test-final && npm install && npm run dev</check>
    <check type="manual">Verify GitHub template setting is enabled</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Requires validation to ensure CLI works before publishing" />
    <depends-on task-id="phase-1-task-14" reason="Requires tests to pass before publishing" />
  </dependencies>

  <commit-message>release: publish create-workerkit v1.0.0 to npm

Published:
- npm package: create-workerkit@1.0.0
- GitHub repo: public with tags (cloudflare-workers, hono, d1)
- GitHub template: enabled
- Verified: npx create-workerkit@latest works end-to-end

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-17" wave="3">
  <title>Run Final Verification & Generate Test Report</title>
  <requirement>All requirements - Final verification that v1 is complete</requirement>
  <description>
    Execute final verification checklist from REQUIREMENTS.md to confirm all 66 requirements are met. Generate test report documenting verification results and known issues.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Definition of Done checklist" />
  </context>

  <steps>
    <step order="1">Run final test: npx create-workerkit@latest final-test --skip-prompts</step>
    <step order="2">Verify step 1: CLI generates complete project (check all files exist)</step>
    <step order="3">Verify step 2: cd final-test && npm install && npm run dev works on fresh machine</step>
    <step order="4">Verify step 3: Localhost runs without any API keys (mock mode confirmed)</step>
    <step order="5">Verify step 4: All 5 integrations have working examples (test each route)</step>
    <step order="6">Verify step 5: README setup takes <5 minutes (manual timer test)</step>
    <step order="7">Verify step 6: CLI package published to npm (check npmjs.com)</step>
    <step order="8">Verify step 7: GitHub repo is public with tags applied</step>
    <step order="9">Verify step 8: Generated code passes TypeScript compilation (tsc --noEmit)</step>
    <step order="10">Verify step 9: Stripe webhooks have signature verification (grep for 'signature')</step>
    <step order="11">Verify step 10: Error messages tested (missing keys, bad config)</step>
    <step order="12">Generate test report: tests/verification-report.md with results and timestamp</step>
  </steps>

  <verification>
    <check type="manual">All 10 verification steps from Definition of Done pass</check>
    <check type="manual">Test report documents any known issues or limitations</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Requires published npm package" />
  </dependencies>

  <commit-message>test: final verification report for WorkerKit v1.0.0

Verification results:
- All 66 requirements met
- Definition of Done: 10/10 checks passed
- Known issues: [documented in report]
- Ready for launch

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

<task-plan id="phase-1-task-18" wave="3">
  <title>Launch Preparation & Documentation</title>
  <requirement>REQ-052, REQ-053 - GitHub repo README and launch prep</requirement>
  <description>
    Prepare WorkerKit for public launch: finalize GitHub README with installation instructions, contributing guide, license, and launch checklist. Document distribution strategy and success metrics.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/rounds/workerkit/decisions.md" reason="Distribution strategy: Cloudflare partnership, GitHub discoverability" />
  </context>

  <steps>
    <step order="1">Create GitHub repository README.md with: hero image/logo placeholder, tagline, installation command, features list, quick example</step>
    <step order="2">Add "Why WorkerKit?" section explaining the 4-6 hour setup problem</step>
    <step order="3">Add "What You Get" section listing Hono, D1, Clerk, Workers AI, Stripe integrations</step>
    <step order="4">Add installation instructions: npx create-workerkit@latest my-app</step>
    <step order="5">Add "Zero-to-deployed in 60 seconds" quickstart with exact commands</step>
    <step order="6">Create CONTRIBUTING.md with guidelines for community contributions</step>
    <step order="7">Add LICENSE file (MIT license)</step>
    <step order="8">Create CHANGELOG.md with v1.0.0 release notes</step>
    <step order="9">Add GitHub issue templates: bug report, feature request</step>
    <step order="10">Document success metric tracking: npm weekly downloads (target: 500/week by month 1)</step>
  </steps>

  <verification>
    <check type="manual">GitHub README is compelling and includes installation command</check>
    <check type="manual">CONTRIBUTING.md exists and is clear</check>
    <check type="manual">MIT license file exists</check>
    <check type="manual">Issue templates are set up</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-16" reason="Requires GitHub repository" />
  </dependencies>

  <commit-message>docs: prepare WorkerKit for public launch

Added:
- GitHub README with hero, installation, quickstart
- CONTRIBUTING.md for community
- LICENSE (MIT)
- CHANGELOG.md (v1.0.0)
- GitHub issue templates
- Success metrics documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com></commit-message>
</task-plan>

---

## Risk Notes

Based on comprehensive risk analysis, these are the critical watchpoints during build:

### 🔴 Critical Risks (Address Immediately)

1. **Clerk Auth Integration (R1)**
   - **Risk:** Users forget to add CLERK_SECRET_KEY → auth breaks silently
   - **Mitigation:** Zero-config mock mode for local dev (task-9)
   - **Verification:** Test protected routes work without API key in dev mode

2. **D1 Database Setup (R2)**
   - **Risk:** Users forget to run `wrangler d1 create` → runtime errors
   - **Mitigation:** Pre-flight validation + excellent inline comments (task-7)
   - **Verification:** Error message explains exact wrangler command to run

3. **Stripe Webhook Security (R7)**
   - **Risk:** Developers skip signature verification → payment fraud vulnerability
   - **Mitigation:** Signature verification REQUIRED in generated code with loud errors (task-10)
   - **Verification:** Webhook handler rejects unsigned requests (403)

4. **6-Hour Timeline (R3)**
   - **Risk:** Integration testing exceeds time budget → incomplete features shipped
   - **Mitigation:** Hard hourly checkpoints, ruthless scope cuts if behind
   - **Checkpoints:**
     - Hour 2: Wave 1 complete (CLI + templates)
     - Hour 5: Wave 2 complete (all integrations)
     - Hour 6: Wave 3 complete (testing + publish)

### 🟡 High Risks (Monitor Closely)

5. **Workers AI Quota (R5)**
   - **Risk:** Users hit quota, don't understand fallback → blame WorkerKit
   - **Mitigation:** Clear quota error messages with setup URL for Claude fallback (task-8)
   - **Verification:** Error message includes "Add ANTHROPIC_API_KEY for fallback"

6. **Template Validation (R6)**
   - **Risk:** Generated code has syntax errors → bad first impression
   - **Mitigation:** Post-generation validation runs TypeScript compilation (task-13)
   - **Verification:** CLI catches syntax errors before declaring success

---

## Time Checkpoints

| Checkpoint | Time | Tasks Complete | Status Check |
|-----------|------|----------------|--------------|
| CP1 | Hour 2 | Wave 1 (tasks 1-5) | CLI generates valid files? |
| CP2 | Hour 5 | Wave 2 (tasks 6-12) | All integrations have working code? |
| CP3 | Hour 6 | Wave 3 (tasks 13-18) | Tests pass + npm published? |

**Hard stop rule:** If behind by >30 minutes at any checkpoint, cut scope immediately.

**Scope cut priority** (what to cut first if time runs out):
1. Task-18 (launch prep) - defer to post-v1
2. Task-14 (E2E tests) - reduce to smoke tests only
3. Task-8 AI integration - simplify to Workers AI only (remove Claude fallback)
4. Task-10 Stripe - reduce to checkout only (remove webhook)

---

## Post-Wave 3 (Sara Blakely Review)

After phase plan completion, auto-trigger Sara Blakely customer gut-check to validate product-market fit before execution begins.

---

*This phase plan is the execution blueprint for WorkerKit v1. All 18 tasks must complete successfully within 6 hours to ship.*
