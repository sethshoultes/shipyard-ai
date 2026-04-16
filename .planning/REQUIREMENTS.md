# WorkerKit v1 — Requirements Document

**Project:** WorkerKit
**Version:** 1.0
**Date:** 2026-04-15
**Status:** Ready for Build

---

## Executive Summary

WorkerKit is a zero-dependency CLI tool that generates production-ready Cloudflare Workers applications in under 60 seconds. It scaffolds a complete project with Hono framework, D1 database, Clerk authentication, Workers AI, and Stripe payments—all pre-configured and ready to deploy.

**Core Promise:** Zero-to-deployed business app in under 60 seconds. Projects die in setup. WorkerKit gives you momentum.

**Build Constraint:** Must ship v1 within 6-hour build session.

---

## Requirements Traceability

| REQ ID | Category | Description | Priority | Source |
|--------|----------|-------------|----------|--------|
| REQ-001 | CLI | Create interactive CLI scaffold generator accessible via `npx create-workerkit@latest my-app` command. | MUST | PRD §1, Decisions §2 |
| REQ-002 | CLI | Support 5 interactive prompts (project name, auth, database, AI, payments) to customize generated project. | MUST | PRD §1, Decisions §4 |
| REQ-003 | CLI | Support flag-based fast path for power users: `--template=api --skip-prompts` to bypass interactive mode. | MUST | Decisions §4 |
| REQ-004 | CLI | Generate complete project structure from templates using zero external dependencies (Node builtins only: fs, path, readline). | MUST | Decisions §2 |
| REQ-005 | CLI | Produce clear, confident console output with minimal verbosity (no emojis, no chatty language). | MUST | Decisions §4 |
| REQ-006 | CLI | Display actionable error messages instead of stack traces when configuration is missing. | MUST | Decisions §9 |
| REQ-007 | CLI | Complete project generation in under 20 seconds on fast connections and under 45 seconds on slow connections. | MUST | Decisions §2, §7 |
| REQ-008 | Project Structure | Generate flat, navigable project directory with clear comments explaining each file's purpose. | MUST | Decisions §7 |
| REQ-009 | Project Structure | Include .env.example with all required API keys documented and setup URLs provided. | MUST | Decisions §5, §9 |
| REQ-010 | Project Structure | Generate wrangler.toml with inline comments explaining every setting (account ID, D1 bindings, AI bindings, secrets). | MUST | PRD §2, Decisions §5 |
| REQ-011 | Project Structure | Generate package.json with zero WorkerKit runtime dependencies (only Hono, Wrangler, TypeScript standard deps). | MUST | Decisions §2 |
| REQ-012 | Project Structure | Include tsconfig.json configured for TypeScript strict mode. | MUST | PRD §2 |
| REQ-013 | Project Structure | Create src/index.ts as main Hono application entry point with working Hello World endpoint. | MUST | Decisions §7 |
| REQ-014 | Framework | Use Hono as the sole HTTP framework (no alternatives in v1). | MUST | Decisions §3 |
| REQ-015 | Framework | Support hot reload during local development via `wrangler dev`. | MUST | Decisions §3 |
| REQ-016 | Framework | Provide example public routes (GET /health, GET /) and auth-protected routes. | MUST | Decisions §7 |
| REQ-017 | Database | Use D1 as the sole database option (no alternatives in v1). | MUST | Decisions §3 |
| REQ-018 | Database | Generate D1 migration file (0001_create_users.sql) with example users table and CRUD comments. | MUST | Decisions §7 |
| REQ-019 | Database | Create src/db.ts with simple, direct query wrapper for D1 database operations. | MUST | Decisions §7 |
| REQ-020 | Database | Include inline comments in migration files explaining D1 binding and database creation process. | MUST | Decisions §5 |
| REQ-021 | AI Integration | Create src/ai.ts with simple abstraction layer supporting primary (Workers AI) and fallback (Claude) providers. | MUST | PRD §3, Decisions §7 |
| REQ-022 | AI Integration | Default to Workers AI (@cf/meta/llama-2-7b-chat-int8) for primary AI completions. | MUST | Decisions §3 |
| REQ-023 | AI Integration | Implement automatic fallback to Anthropic Claude API when Workers AI fails or API key is provided. | MUST | PRD §3, Decisions §3 |
| REQ-024 | AI Integration | Provide simple `ai.chat(prompt)` function that auto-routes to appropriate provider without user configuration. | MUST | Decisions §1 (Open Q #1) |
| REQ-025 | AI Integration | Include graceful error handling with clear messages (e.g., "Workers AI quota exceeded. Add ANTHROPIC_API_KEY for fallback."). | MUST | Decisions §9 |
| REQ-026 | AI Integration | Generate example API endpoint (POST /api/chat) demonstrating AI functionality. | MUST | Decisions §7 |
| REQ-027 | Authentication | Use Clerk as the sole authentication provider (no alternatives in v1). | MUST | Decisions §3 |
| REQ-028 | Authentication | Create src/auth.ts with JWT validation middleware for Clerk token verification. | MUST | Decisions §7 |
| REQ-029 | Authentication | Enable `npm run dev` to work without Clerk API keys (mock/skip auth in local development). | MUST | Decisions §1 (Open Q #3) |
| REQ-030 | Authentication | Document Clerk API key setup with step-by-step instructions and dashboard URL in .env.example. | MUST | Decisions §5, §9 |
| REQ-031 | Payments | Integrate Stripe with minimal scope: checkout session creation and webhook handling. | MUST | Decisions §3 |
| REQ-032 | Payments | Create src/payments.ts with Stripe checkout endpoint for one-time payment flows. | MUST | Decisions §7 |
| REQ-033 | Payments | Implement Stripe webhook handler for `checkout.session.completed` event. | MUST | Decisions §7 |
| REQ-034 | Payments | Include Stripe webhook signature verification code with security-critical comments in webhook handler. | MUST | Decisions §9 |
| REQ-035 | Payments | Document Stripe webhook setup process in README with security emphasis. | MUST | Decisions §9 |
| REQ-036 | Payments | Add STRIPE_WEBHOOK_SECRET to .env.example with setup URL and warning. | MUST | Decisions §9 |
| REQ-037 | Configuration | Generate fully configured wrangler.toml without requiring manual binding setup. | MUST | Decisions §5 |
| REQ-038 | Configuration | Provide transparent, editable configuration files with excellent inline documentation (no hidden magic). | MUST | Decisions §5 |
| REQ-039 | Types | Create src/types/env.d.ts with TypeScript bindings for all Cloudflare Workers environment variables. | MUST | PRD §2 |
| REQ-040 | Types | Ensure generated code is fully type-safe and compilable in TypeScript strict mode. | MUST | Decisions §7 |
| REQ-041 | Documentation | Generate excellent README with 30-second quickstart and clear setup steps. | MUST | PRD §2, Decisions §7 |
| REQ-042 | Documentation | Include "Want to swap X? Here's how" sections in README (Auth.js, direct Anthropic, etc.). | MUST | Decisions §7 |
| REQ-043 | Documentation | Add README section: "Local dev (no keys needed)" vs "Deploy (keys required)" guidance. | MUST | Decisions §1 (Open Q #3) |
| REQ-044 | Documentation | Create comprehensive D1 setup and migration instructions in README. | MUST | Decisions §7 |
| REQ-045 | Documentation | Include troubleshooting section addressing missing API keys with direct dashboard links. | MUST | Decisions §9 |
| REQ-046 | Documentation | Add "AI Troubleshooting" section with error scenarios and fallback strategies. | MUST | Decisions §9 |
| REQ-047 | Documentation | Document D1 pricing with cost transparency and estimated costs for generated template. | MUST | Decisions §9 |
| REQ-048 | Documentation | Add "🔒 CRITICAL: Secure your Stripe webhooks" section to README. | MUST | Decisions §9 |
| REQ-049 | Documentation | Include deployment to Cloudflare Workers steps with `npm run deploy` command. | MUST | PRD §5, Decisions §7 |
| REQ-050 | Documentation | Add "Built with WorkerKit" badge to every generated README with link to project. | MUST | Decisions §6 |
| REQ-051 | Distribution | Publish CLI package to npm as `create-workerkit` at @latest version. | MUST | PRD §5, Decisions §7 |
| REQ-052 | Distribution | Create public GitHub repository with excellent README documentation. | MUST | Decisions §6 |
| REQ-053 | Distribution | Apply GitHub tags for discoverability: cloudflare-workers, cloudflare-template, hono, d1. | MUST | Decisions §6 |
| REQ-054 | Distribution | Enable GitHub template system for generated projects. | MUST | Decisions §6 |
| REQ-055 | Testing | Verify CLI generates files without errors. | MUST | Decisions §8 |
| REQ-056 | Testing | Verify `npm install && npm run dev` works on fresh machine without global dependencies. | MUST | Decisions §8 |
| REQ-057 | Testing | Verify localhost server runs without any API keys (mock mode). | MUST | Decisions §8 |
| REQ-058 | Testing | Verify all 5 integrations have working examples (Hono, D1, AI, Clerk, Stripe). | MUST | Decisions §8 |
| REQ-059 | Testing | Verify README setup takes less than 5 minutes for first-time user. | MUST | Decisions §8 |
| REQ-060 | Testing | Test error messages for missing configuration and bad API keys. | MUST | Decisions §8 |
| REQ-061 | Quality | Ensure zero dependencies in CLI (only Node builtins). | MUST | Decisions §2, §8 |
| REQ-062 | Quality | Ensure generated code has zero WorkerKit runtime dependencies. | MUST | Decisions §2, §8 |
| REQ-063 | Quality | Lock dependency versions in generated package.json for stability. | MUST | Decisions §9 |
| REQ-064 | Quality | All configuration files must remain editable without breaking the project. | MUST | Decisions §8 |
| REQ-065 | Brand | Establish confident, precise, warm brand voice (not corporate, not cutesy). | MUST | Decisions §4 |
| REQ-066 | Brand | Use product name "WorkerKit" for v1 launch. | MUST | Decisions §1 |

---

## Summary Statistics

**Total Atomic Requirements:** 66

**By Priority:**
- MUST: 66 (100%)
- SHOULD: 0
- COULD: 0

**By Category:**
- CLI: 7 requirements
- Project Structure: 5 requirements
- Framework: 3 requirements
- Database (D1): 4 requirements
- AI Integration: 6 requirements
- Authentication (Clerk): 4 requirements
- Payments (Stripe): 7 requirements
- Configuration: 2 requirements
- Types: 2 requirements
- Documentation: 9 requirements
- Distribution: 5 requirements
- Testing: 6 requirements
- Quality: 5 requirements
- Brand: 2 requirements

---

## Key Constraints

1. **Time Budget:** 6 hours maximum for complete v1 build
2. **Zero Dependencies:** CLI uses Node builtins only (fs, path, readline)
3. **Single Stack:** Hono + D1 + Clerk + Workers AI + Stripe (no alternatives)
4. **Generation Speed:** <20s fast connection, <45s slow connection
5. **Zero Runtime Dependencies:** Generated projects have no WorkerKit dependency
6. **Transparent Configuration:** All config files must be editable with inline comments
7. **Security-First:** Stripe webhook signature verification is non-negotiable

---

## Deferred to Post-v1

- Auth.js integration
- Turso database option
- Multi-AI provider configuration
- Advanced Stripe features (subscriptions, customer portal)
- TypeScript type generation from D1 schema
- Plugin system
- Template variants (full-stack, minimal, etc.)
- Color/spinner CLI output
- Interactive setup wizard beyond 5 questions

---

## Critical Success Factors

1. **CLI generates valid projects 100% of the time** (no syntax errors)
2. **Generated projects run locally without API keys** (mock mode)
3. **All 5 integrations have working examples** (Hono, D1, AI, Clerk, Stripe)
4. **README enables 5-minute setup** for first-time users
5. **Stripe webhooks are secure by default** (signature verification included)
6. **Error messages are actionable** (no stack traces, link to dashboard)

---

## Risk Mitigation Priorities

| Priority | Risk | Mitigation | Owner |
|----------|------|-----------|-------|
| 1 | Clerk auth fails | Zero-config mock mode for local dev | Build Phase |
| 2 | D1 setup unclear | Pre-flight validation + excellent comments | Build Phase |
| 3 | Stripe insecure | Webhook signature verification required | Build Phase |
| 4 | Timeline blown | Hard checkpoints every hour | Build Phase |
| 5 | Generated code broken | Post-generation validation | Build Phase |
| 6 | Testing gaps | Fail-fast test suite for critical paths | Build Phase |

---

## Definition of Done

WorkerKit v1 is complete when:

- [ ] `npx create-workerkit my-app` generates complete project
- [ ] `cd my-app && npm install && npm run dev` works on fresh machine
- [ ] Localhost runs without any API keys (mock mode)
- [ ] All 5 integrations have working examples
- [ ] README setup takes <5 minutes
- [ ] CLI package published to npm as `create-workerkit@latest`
- [ ] GitHub repo is public with tags applied
- [ ] Generated code passes TypeScript compilation
- [ ] Stripe webhooks have signature verification
- [ ] Error messages tested (missing keys, bad config)

---

*This requirements document is the contract for WorkerKit v1. All 66 requirements are MUST-ship for launch.*
