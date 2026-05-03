# Relay v1 — Atomic Requirements

**Generated**: 2026-05-03
**Project Slug**: `github-issue-sethshoultes-shipyard-ai-90`
**Source PRD**: `/home/agent/shipyard-ai/prds/github-issue-sethshoultes-shipyard-ai-90.md`
**Source Decisions**: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-90/decisions.md`
**Source Essence**: `/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-90/essence.md`
**Status**: Locked for Build Phase

> **Important:** `decisions.md` OVERRIDES the PRD where they conflict. The locked decisions (SaaS over WordPress, config UI over canvas, engine before baton, one free workflow, no Stripe v1) are the binding spec.

---

## Core Experience

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-001 | SaaS web app — single platform | Decision 6 | Next.js App Router project boots; no WordPress plugin code; deployable to Cloudflare Pages or Vercel |
| REQ-002 | Pre-loaded living workflow on first open | Decision 17 + MVP #2 | Opening `/` shows one active multi-agent workflow; no blank canvas; no setup wizard; no "build your first workflow" tutorial |
| REQ-003 | Form-based config UI | Decision 4 + MVP #3 | Humans configure nodes through HTML forms; no drag-and-drop canvas; no Figma-grade physics; cards feel human, not server-like |
| REQ-004 | Limited node palette | Decision 4 + MVP #4 | Exactly three node types exist: `content-writer`, `image-generator`, `connection`; no extensibility surface in v1 |
| REQ-005 | Zero JSON/YAML exposure in-app | Decision 5 + MVP #5 | Users never see raw config; forms serialize to JSON under the hood; developers use API only (see Open Question #4) |
| REQ-006 | White, airy, optimistic aesthetic | Decision 13 + MVP #6 | Single light theme; no dark mode toggle; no advanced mode toggle; Tailwind palette uses whites, soft grays, warm accents |
| REQ-007 | Human brand voice | Decision 2 + Essence | All UI copy reads warm, confident, zero acronyms; no "orchestration," "automation," or enterprise sludge |

---

## Execution & Performance

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-008 | Defined execution model — DAG | Decision 3 + MVP #7 | `engine/dag.ts` defines nodes, edges, topological sort; cycles rejected at validation time |
| REQ-009 | Durable state + idempotency | Decision 3 + MVP #7 | `engine/state.ts` assigns idempotency keys to each run; retry logic exists in code; state machine defined before UI ships |
| REQ-010 | Async by default | Decision 8 + MVP #8 | Workflows enqueue via `engine/queue.ts`; API returns run ID immediately; client polls or receives SSE for status |
| REQ-011 | Parallel execution | Decision 8 + MVP #9 | Independent nodes execute concurrently; fork-join logic in `engine/parallelizer.ts`; serial chains only where DAG mandates |
| REQ-012 | Aggressive caching | Decision 9 + MVP #10 | `cache/store.ts` hashes deterministic inputs; identical prompts hit cache without LLM call; TTL + eviction policy defined |
| REQ-013 | Sub-3-second target | MVP #11 | Cached or fully-parallel paths resolve under 3s wall-clock; uncached LLM paths are async so latency is tolerable |

---

## Guardrails & Economics

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-014 | Per-user token budgets | Decision 10 + MVP #12 | `budgets/caps.ts` enforces hard daily limit; workflow rejected when cap exceeded; cap visible in UI |
| REQ-015 | Request deduplication | Decision 9 + MVP #13 | `budgets/dedup.ts` fingerprints requests; identical in-flight or recent calls return same result; no double-billing |
| REQ-016 | Workflow versioning | Decision 15 + MVP #14 | `engine/state.ts` pins in-flight runs to workflow version at start time; edits create new versions; old versions readable |

---

## Node Types

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-017 | Content Writer node | Open Question #1 + AgentPress lineage | Form fields: `topic` (text), `tone` (select: professional/casual/witty), `length` (select: short/medium/long); outputs markdown text |
| REQ-018 | Image Generator node | Open Question #1 + AgentPress lineage | Form fields: `prompt` (textarea), `style` (select: photo/illustration/digital), `size` (select: square/wide); outputs image URL |
| REQ-019 | Connection node (edge) | Decision 4 + File Structure | Directed edge from output slot to input slot; data flows automatically; no manual wiring UI in v1 — edges defined in pre-loaded workflow template |

---

## Pre-Loaded Workflow (The "First 30 Seconds")

| ID | Requirement | Source | Acceptance Criteria |
|----|-------------|--------|---------------------|
| REQ-020 | Living template on mount | Decision 17 + Essence | `app/page.tsx` renders a real workflow on first load; agents appear as cards with status indicators; one click runs the workflow |
| REQ-021 | Real output, not theater | Decision 17 | The pre-loaded workflow calls real LLM APIs (or mocks with cache) and produces shareable text + image output; no fake demo states |
| REQ-022 | Zero-setup first run | Decision 17 + MVP #2 | No auth gate before first run; no API key input; no onboarding modals; hard budget cap protects against abuse even for anonymous users |

---

## Explicitly NOT in v1 (Scope Boundary)

| ID | Cut Feature | Source | Rationale |
|----|-------------|--------|-----------|
| OUT-001 | Drag-and-drop canvas | Decision 4 | v2 cathedral; v1 is forms + read-only node visualization |
| OUT-002 | Stripe / metered billing | Decision 11 | One free workflow with hard cap; no billing stack |
| OUT-003 | Dark mode / advanced mode | Decision 13 | One aesthetic only |
| OUT-004 | JSON/YAML editing mode | Decision 5 | Machine speaks JSON; humans never touch it |
| OUT-005 | WordPress plugin | Decision 6 | v2 distribution channel, not v1 identity |
| OUT-006 | Workers AI / edge runtime | Decision 7 | Execution engine needs durable state; edge is stateless |
| OUT-007 | Template marketplace | Decision 12 | One built-in template only; marketplace is v2 labor |
| OUT-008 | Admin dashboard with 40 toggles | Decision 14 | One knob when possible, zero when not |
| OUT-009 | Onboarding modals / tutorials | Decision 17 + MVP #2 | Pre-loaded workflow IS the onboarding |
| OUT-010 | Real-time collaboration | MVP NOT list | No multi-user cursors or live edits |
| OUT-011 | Plugin ecosystem | MVP NOT list | Closed node palette in v1 |
| OUT-012 | Exposed execution logs in primary UI | MVP NOT list | Results, not plumbing |

---

## Open Questions Deferred to Post-v1

| # | Question | Impact on Phase 1 |
|---|----------|-------------------|
| 1 | Exact node type roster | **Resolved**: content-writer, image-generator, connection |
| 2 | Locked distribution channel | Deferred; build SaaS first, distribution later |
| 3 | Trial mechanics without Stripe | Hard cap + one free workflow; conversion mechanism deferred |
| 4 | Developer API scope | Deferred unless cheap; no REST surface in v1 |
| 5 | Hosting / deployment target | Assume Cloudflare-compatible (Next.js + Pages); final deployment deferred |
| 6 | Auth model | Anonymous first run; auth gate deferred to v1.1 |
| 7 | Execution runtime substrate | In-process Node.js for v1; external queue deferred |
| 8 | First-run experience without canvas | Pre-loaded workflow is the answer; exact output defined in build |
| 9 | Paywall vs. one-free-workflow | Hard cap wins; billing deferred |

---

*Requirements locked per Phil Jackson consolidation. No scope changes without both Elon and Steve sign-off.*
