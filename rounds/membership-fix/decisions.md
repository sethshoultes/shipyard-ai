# MemberShip Fix — Locked Decisions

**Arbitrated by:** Phil Jackson, The Zen Master
**Debaters:** Steve Jobs (Design & Brand), Elon Musk (Engineering & Scale)
**Date:** Locked for Build Phase

---

## Essence (North Star)

> Giving creators the gift of invisibility — tools that work so well they disappear.
> The feeling: Belonging. Not managing. Not configuring. Belonging.
> The one thing that must be perfect: The first 30 seconds.

---

## Decision Log

### Decision 1: Product Naming
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Elon Musk (deferred) |
| **Resolution** | Name remains "MemberShip" for v1. Rename to "Belong" is approved in principle but **blocked until TypeScript compiles**. |
| **Rationale** | Steve's naming philosophy is correct — "Belong" captures emotion over paperwork. But Elon's point stands: a rename during a bugfix sprint introduces coordination overhead (imports, KV prefixes, docs, user communication). Ship first, rebrand when there's something to rebrand. |

### Decision 2: Fix Methodology
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Resolution** | Bulk mechanical replacement via regex for 90% of violations, then targeted human review for edge cases. |
| **Rationale** | 228 pattern violations across 4,000 lines is industrial debugging, not artisanal craft. Regex surgery for the obvious patterns, human review for the 10% with context-dependent logic. TypeScript compiler catches what we miss. |

### Decision 3: Admin UI Scope
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs (expand) vs. Elon Musk (cut) |
| **Winner** | Compromise |
| **Resolution** | Fix pattern violations in existing admin routes. **No Block Kit redesign in v1**. But Steve's "three glances" UX principle is the acceptance criteria for v2 admin. |
| **Rationale** | Elon is right that "implement" sentences are scope creep. Steve is right that shipping a compiling plugin with a confusing admin defeats the purpose. The fix is: patterns only, design debt tracked for v2. |

### Decision 4: KV Pagination
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk |
| **Winner** | Steve Jobs conceded — **moved to v1** |
| **Resolution** | `members:list` pagination (`members:list:0`, `members:list:1`, etc. with 100-member chunks) ships in v1, not v2. |
| **Rationale** | Steve conceded explicitly: "when the yoga instructor hits 500 members and her dashboard freezes, she doesn't care that the error messages are warm." This is foundational, not optimization. |

### Decision 5: Error Message Voice
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Steve Jobs (with timing caveat) |
| **Resolution** | Human-readable error messages ship in v1. "That email doesn't look right" — not "Error: Invalid email format detected." |
| **Rationale** | Elon conceded this deserves a polish pass. Since we're touching every `throw new Response` anyway, the marginal cost of humane copy is near-zero. Do it in one pass, not two. |

### Decision 6: Defensive Code Removal
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Steve Jobs |
| **Winner** | Both agreed |
| **Resolution** | Delete all 14 `rc.user` checks. Trust the platform — Emdash handles auth. |
| **Rationale** | Unanimous. Every redundant check is cognitive debt. The platform contract is clear. |

### Decision 7: Success Criteria
| Aspect | Detail |
|--------|--------|
| **Proposed by** | Elon Musk |
| **Winner** | Elon Musk |
| **Resolution** | The fix ships when: (1) `tsc --noEmit` passes, (2) signup → payment → access flow completes without crash. |
| **Rationale** | Steve's "feels inevitable" is the v2 bar. v1 bar is: it works. Emotional experience requires functional foundation. |

---

## MVP Feature Set (v1 Ships)

### In Scope
1. **Pattern Corrections** — All 228 violations fixed:
   - 114 `throw new Response` → human-readable `throw new Error`
   - ~50 `JSON.stringify` removals (KV auto-serializes)
   - ~50 `JSON.parse` removals (KV auto-deserializes)
   - 14 `rc.user` defensive checks deleted

2. **KV Pagination** — `members:list` split into 100-member chunks
   - Keys: `members:list:0`, `members:list:1`, etc.
   - `members:count` for total
   - Admin routes updated to paginate

3. **Error Message Voice** — All error strings rewritten human-first
   - Warm, not corporate
   - Confident, not clever

4. **TypeScript Compilation** — `tsc --noEmit` passes clean

5. **Core Flow Verification** — signup → payment → access works

### Out of Scope (v2)
- Product rename to "Belong"
- Admin Block Kit redesign ("three glances" UX)
- Drip content UI polish
- Webhook log TTL / cleanup
- `emdash-plugin-validator` lint tooling

---

## File Structure (What Gets Built)

```
membership-fix/
├── decisions.md              # This document (locked)
├── essence.md                # Creative direction (reference)
├── rounds/                   # Debate archive
│   ├── round-1-steve.md
│   ├── round-1-elon.md
│   ├── round-2-steve.md
│   └── round-2-elon.md
└── implementation/           # Build phase outputs
    ├── patterns.md           # Regex patterns for bulk replace
    ├── edge-cases.md         # Manual review items
    ├── error-messages.md     # Human-readable copy for all errors
    └── kv-schema.md          # Paginated KV key structure
```

**Plugin Files to Modify:**
- Primary plugin file (~4,000 lines) — all pattern fixes
- Any admin route handlers — pagination integration
- Error handling utilities (if extracted)

---

## Open Questions (Needs Resolution)

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| 1 | What is the exact file path to the MemberShip plugin source? | Build Agent | Yes |
| 2 | Does Emdash KV support TTL on keys? (for rate limiting cleanup) | Platform Team | No (v2) |
| 3 | Are there existing tests to run post-fix, or is manual flow verification sufficient? | Build Agent | No |
| 4 | What is Sunrise Yoga's current member count? (validates pagination urgency) | Stakeholder | No |
| 5 | Is there a staging environment to verify before production? | Platform Team | Yes |

---

## Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| 1 | **Regex replacement introduces new bugs** | Medium | High | TypeScript compilation gate catches type mismatches. Human review for conditional/nested cases. |
| 2 | **KV pagination breaks existing member lookups** | Low | Critical | Member lookups use `member:{email}` key (unchanged). Only list enumeration affected. |
| 3 | **Agent context window bloat after 200+ edits** | High | Medium | Batch fixes by pattern type. Verify compilation after each batch, not only at end. |
| 4 | **Error message rewrites change behavior, not just text** | Low | High | Error messages are cosmetic (string content), not structural. Review any that include variable interpolation. |
| 5 | **Pagination chunk size (100) is wrong** | Low | Low | 100 is reasonable default. Make configurable via constant for easy v2 tuning. |
| 6 | **No rollback path if fix breaks production** | Medium | Critical | Require staging verification before Sunrise Yoga deployment. Keep pre-fix snapshot. |
| 7 | **Scope creep during build** | High | Medium | This document is the contract. Any "implement" or "add" language not listed here is out of scope. |

---

## Final Arbitration Notes

Both debaters brought their A-game.

**Steve** was right that naming shapes thinking, that error messages are part of the product, and that the admin experience is where creators live. His concession on pagination showed intellectual honesty.

**Elon** was right that a non-compiling plugin helps no one, that mechanical fixes require mechanical methods, and that scope discipline is the difference between shipping and spiraling. His concession on error voice showed design awareness.

**The synthesis:** Ship a working plugin with humane errors and scalable data patterns. The emotional layer comes when there's a foundation to stand on.

The fix is mechanical. The goal is not.

---

*"The strength of the team is each member. The strength of each member is the team."*

Now build it.
