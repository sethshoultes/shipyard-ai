# MemberShip Fix — Requirements Specification

**Project Slug:** membership-fix
**Generated:** 2026-04-12
**Sources:** prds/membership-fix.md, rounds/membership-fix/decisions.md
**Documentation Verified:** docs/EMDASH-GUIDE.md (Section 6: Plugin System)

---

## Summary

The MemberShip plugin (~4,000 lines) was built against a hallucinated Emdash API and contains 228 pattern violations that prevent it from functioning in the sandboxed plugin environment. This document extracts atomic requirements for the fix.

**Total Violations:**
- 114 instances of `throw new Response` (banned)
- ~50 instances of `JSON.stringify` in `kv.set()` (banned — double-encoding)
- ~50 instances of `JSON.parse` on `kv.get()` results (banned — unnecessary)
- 14 instances of `rc.user` checks (banned — Emdash handles auth)

---

## Phase 1: Pattern Corrections

### REQ-001: Replace throw new Response with throw new Error
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Count** | 114 instances |
| **File** | plugins/membership/src/sandbox-entry.ts |
| **Description** | Replace all `throw new Response(JSON.stringify({error: "..."}), {status, headers})` with either `throw new Error("message")` or `return { error: "message", status: N }`. Remove JSON.stringify wrapping. |
| **Acceptance** | `grep "throw new Response" sandbox-entry.ts` returns 0 matches; TypeScript compiles |

### REQ-002: Remove JSON.stringify from kv.set() calls
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Count** | ~50 instances |
| **File** | plugins/membership/src/sandbox-entry.ts |
| **Description** | Remove JSON.stringify() wrapping values passed to ctx.kv.set(). Pass typed values directly. Emdash KV auto-serializes objects. |
| **Acceptance** | No `ctx.kv.set(..., JSON.stringify(...))` patterns; TypeScript compiles |

**Correct Pattern (from docs/EMDASH-GUIDE.md Section 6):**
```typescript
// WRONG (banned — double-encodes)
await ctx.kv.set(`member:${email}`, JSON.stringify(member));

// CORRECT
await ctx.kv.set(`member:${email}`, member);
```

### REQ-003: Remove JSON.parse from kv.get() results
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Count** | ~50 instances |
| **File** | plugins/membership/src/sandbox-entry.ts |
| **Description** | Remove JSON.parse() wrapping results from ctx.kv.get(). Use typed generic parameters. Emdash KV auto-deserializes. |
| **Acceptance** | No `JSON.parse(await ctx.kv.get(...))` patterns; TypeScript compiles |

**Correct Pattern (from docs/EMDASH-GUIDE.md Section 6):**
```typescript
// WRONG (banned — double-decodes)
const json = await ctx.kv.get<string>(`member:${email}`);
const member = JSON.parse(json) as MemberRecord;

// CORRECT
const member = await ctx.kv.get<MemberRecord>(`member:${email}`);
if (!member) return { error: "Member not found", status: 404 };
```

### REQ-004: Delete rc.user defensive checks
| Field | Value |
|-------|-------|
| **Source** | PRD, Decisions (Decision 6) |
| **Priority** | P0 |
| **Count** | 14 instances |
| **File** | plugins/membership/src/sandbox-entry.ts |
| **Description** | Remove all `rc.user` auth checks. Delete entire guard blocks like `if (!adminUser || !adminUser.isAdmin) { throw ... }`. Emdash handles authentication before handler runs. |
| **Acceptance** | `grep "rc.user" sandbox-entry.ts` returns 0 matches |

**Decision Quote:** "Delete all 14 rc.user checks. Trust the platform — Emdash handles auth."

### REQ-005: Audit auth.ts for banned patterns
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **File** | plugins/membership/src/auth.ts |
| **Description** | Check auth.ts for throw new Response, JSON.stringify in KV, JSON.parse from KV, and rc.user patterns. Fix if present. Do NOT restructure the file. |
| **Acceptance** | File reviewed; any banned patterns documented and fixed |

### REQ-006: Audit email.ts for banned patterns
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **File** | plugins/membership/src/email.ts |
| **Description** | Check email.ts for throw new Response, JSON.stringify in KV, JSON.parse from KV, and rc.user patterns. Fix if present. Do NOT restructure the file. |
| **Acceptance** | File reviewed; any banned patterns documented and fixed |

---

## Phase 2: KV Pagination

### REQ-007: Implement chunked members:list pagination
| Field | Value |
|-------|-------|
| **Source** | Decisions (Decision 4) |
| **Priority** | P0 |
| **Description** | Split members list into 100-member chunks. Keys: `members:list:0`, `members:list:1`, etc. Add `members:count` key for total. |
| **Acceptance** | KV schema supports pagination; member lookups via `member:{email}` unchanged |

**Decision Quote:** "members:list pagination ships in v1, not v2... when the yoga instructor hits 500 members and her dashboard freezes, she doesn't care that the error messages are warm."

### REQ-008: Update admin routes for pagination
| Field | Value |
|-------|-------|
| **Source** | Decisions |
| **Priority** | P0 |
| **Description** | Update admin routes that enumerate members to fetch paginated chunks instead of single monolithic list. |
| **Acceptance** | Admin member list loads without freezing at 500+ members |

### REQ-009: Make chunk size configurable
| Field | Value |
|-------|-------|
| **Source** | Decisions (Risk Register) |
| **Priority** | P1 |
| **Description** | Define pagination chunk size (100) as a constant at file top. Not hard-coded inline. |
| **Acceptance** | Constant `MEMBERS_CHUNK_SIZE = 100` defined at top of file |

---

## Phase 3: Error Message Voice

### REQ-010: Rewrite errors with human-first tone
| Field | Value |
|-------|-------|
| **Source** | Decisions (Decision 5) |
| **Priority** | P0 |
| **Description** | Convert all error strings to warm, confident, human-readable copy. Example: "That email doesn't look right" not "Error: Invalid email format detected." |
| **Acceptance** | All 114 error messages use human-first language; no jargon |

**Decision Quote:** "Human-readable error messages ship in v1... since we're touching every throw new Response anyway, the marginal cost of humane copy is near-zero."

### REQ-011: Audit interpolated error messages
| Field | Value |
|-------|-------|
| **Source** | Decisions (Risk Register) |
| **Priority** | P1 |
| **Description** | Review error messages with variable interpolation to ensure rewrite doesn't change behavior. |
| **Acceptance** | Interpolated messages verified; behavior unchanged |

### REQ-012: Create error messages reference
| Field | Value |
|-------|-------|
| **Source** | Decisions (File Structure) |
| **Priority** | P2 |
| **Description** | Document all human-readable error messages in implementation/error-messages.md. |
| **Acceptance** | Reference document exists with all error strings catalogued |

---

## Phase 4: TypeScript Compilation

### REQ-013: Pass tsc --noEmit
| Field | Value |
|-------|-------|
| **Source** | Decisions (Success Criteria) |
| **Priority** | P0 |
| **Description** | Run `tsc --noEmit` on entire codebase. All pattern fixes must compile cleanly. |
| **Acceptance** | Exit code 0; no errors or warnings |

**Decision Quote:** "The fix ships when: (1) tsc --noEmit passes..."

### REQ-014: Verify typed KV operations
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Description** | After removing JSON.stringify/parse, verify all KV operations have correct type annotations. |
| **Acceptance** | All `ctx.kv.get<T>` calls have correct generic types |

### REQ-015: Resolve type errors from rc.user deletion
| Field | Value |
|-------|-------|
| **Source** | REQ-004 |
| **Priority** | P0 |
| **Description** | After deleting rc.user checks, fix any type narrowing or unreachable code issues. |
| **Acceptance** | TypeScript compiles; no dead code warnings |

---

## Phase 5: Core Flow Verification

### REQ-016: Verify signup → payment → access flow
| Field | Value |
|-------|-------|
| **Source** | Decisions (Success Criteria) |
| **Priority** | P0 |
| **Description** | End-to-end test: user signs up → Stripe payment → member record created → access granted. |
| **Acceptance** | Flow completes without crash; member stored correctly in KV |

**Decision Quote:** "(2) signup → payment → access flow completes without crash."

### REQ-017: Register plugin in Sunrise Yoga
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Description** | Add MemberShip plugin to Sunrise Yoga's astro.config.mjs. |
| **Acceptance** | Plugin entry exists; build succeeds; plugin initializes without errors |

### REQ-018: Admin page loads at /_emdash/admin/plugins/membership
| Field | Value |
|-------|-------|
| **Source** | PRD (Smoke Test) |
| **Priority** | P0 |
| **Description** | Admin page must return HTTP 200 with valid Block Kit blocks array. |
| **Acceptance** | No errors in logs; valid JSON response with `blocks` array |

### REQ-019: Member registration returns typed response
| Field | Value |
|-------|-------|
| **Source** | PRD (Smoke Test) |
| **Priority** | P0 |
| **Description** | POST to register endpoint returns `{ success: true }` as object, not double-encoded string. |
| **Acceptance** | Response is JavaScript object; no double-encoding |

### REQ-020: Member status returns typed object
| Field | Value |
|-------|-------|
| **Source** | PRD (Smoke Test) |
| **Priority** | P0 |
| **Description** | GET status endpoint returns MemberRecord as object, not JSON string. |
| **Acceptance** | Response has all MemberRecord properties; correctly typed |

### REQ-021: KV stores objects, not strings
| Field | Value |
|-------|-------|
| **Source** | PRD (Smoke Test) |
| **Priority** | P0 |
| **Description** | After registration, KV storage contains native objects, not JSON-encoded strings. |
| **Acceptance** | `ctx.kv.get()` returns object directly; no JSON.parse needed |

### REQ-022: Admin shows member and plan counts
| Field | Value |
|-------|-------|
| **Source** | PRD |
| **Priority** | P0 |
| **Description** | Admin page_load returns Block Kit with stats block showing member/plan counts. |
| **Acceptance** | Stats block present with correct counts |

### REQ-023: view_members interaction works
| Field | Value |
|-------|-------|
| **Source** | PRD (Phase 2) |
| **Priority** | P1 |
| **Description** | Admin action_id "view_members" returns paginated member table. |
| **Acceptance** | Table displays members; pagination visible if 100+ members |

### REQ-024: view_plans interaction works
| Field | Value |
|-------|-------|
| **Source** | PRD (Phase 2) |
| **Priority** | P1 |
| **Description** | Admin action_id "view_plans" returns plan list with name, price, interval. |
| **Acceptance** | Plans displayed with correct data |

---

## Files to Modify

| File | Phase | Changes |
|------|-------|---------|
| `plugins/membership/src/sandbox-entry.ts` | 1, 2, 3 | All pattern fixes, pagination, error messages |
| `plugins/membership/src/auth.ts` | 1 | Audit only (likely no changes) |
| `plugins/membership/src/email.ts` | 1 | Audit only (likely no changes) |
| Sunrise Yoga `astro.config.mjs` | 5 | Plugin registration |

---

## Success Criteria (from Decisions)

1. `tsc --noEmit` passes clean
2. signup → payment → access flow completes without crash
3. Zero `throw new Response` in codebase
4. Zero `JSON.stringify`/`JSON.parse` in KV calls
5. Zero `rc.user` references
6. Admin page loads without error
7. Member registration returns typed response
8. Member status lookup returns typed object

---

## Risk Mitigations

| Risk | Mitigation |
|------|------------|
| Regex replacement introduces new bugs | TypeScript compilation gate; human review for nested cases |
| KV pagination breaks member lookups | `member:{email}` key unchanged; only list enumeration affected |
| Agent context window bloat | Batch fixes by pattern type; verify after each batch |
| Error message rewrites change behavior | Review interpolated messages; text-only changes |
| Scope creep | decisions.md is the contract; reject unlisted changes |

---

## Out of Scope (v2)

- Product rename to "Belong"
- Admin Block Kit redesign ("three glances" UX)
- Drip content UI polish
- Webhook log TTL / cleanup
- emdash-plugin-validator lint tooling
