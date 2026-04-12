# EventDash Fix — Consolidated Decisions

*Consolidated by Phil Jackson, Zen Master*

---

## Essence (Guiding Star)

**What this product is about:** Making people look effortlessly good at bringing others together.

**The feeling:** The calm confidence of a host who has everything handled.

**The one thing that must be perfect:** First load. Events appear instantly, or nothing else matters.

**Creative direction:** Invisible until it delights.

---

## Decision Log

### Decision 1: Product Name
| | |
|---|---|
| **Steve proposed** | Rename to "Gather" — one word, warm, human, a verb that tells you what it does |
| **Elon proposed** | Keep "EventDash" for this PR — rename is scope creep touching package names, KV prefixes, docs, strings, Slack manifest |
| **Winner** | **Elon** |
| **Why** | The admin page is broken *right now*. Every hour debating naming is an hour users see "Failed to load." Rename belongs in v2, not a p0 bug fix. Ship velocity beats brand perfection when the product is non-functional. |

### Decision 2: User-Facing Copy
| | |
|---|---|
| **Steve proposed** | All copy must be human — "Your event is live" not "Event successfully created and saved to database" |
| **Elon proposed** | Human language only for error/success messages, no broader UI copy changes |
| **Winner** | **Compromise — Steve on substance, Elon on scope** |
| **Why** | Both agree human language wins. Elon concedes 20 minutes of copywriting for success/error messages. Steve accepts we're not touching the full Block Kit structure. The strings we *do* touch ship warm. |

### Decision 3: First Load Experience
| | |
|---|---|
| **Steve proposed** | Admin opens Gather, sees events or "Create Event" button. No onboarding modals, no wizards. Value first. |
| **Elon proposed** | Already in the PRD — this is Phase 1. No redesign needed. |
| **Winner** | **Both (aligned)** |
| **Why** | The PRD already specifies loading events on admin open. This was never in dispute — just needs to actually work. |

### Decision 4: Phase 3 (Sunrise Yoga Integration)
| | |
|---|---|
| **Steve proposed** | Initially included in scope |
| **Elon proposed** | Ship as separate PR — mixing bug fix with integration work creates review friction and deployment risk |
| **Winner** | **Elon** |
| **Why** | Steve explicitly concedes: "Separate PRs, separate risk profiles." Bug fix stays pure. Integration gets its own review cycle. |

### Decision 5: Architecture Changes (KV Key Design)
| | |
|---|---|
| **Elon proposed** | KV `events:list` single-array pattern breaks at 100x scale, but don't touch it now |
| **Steve proposed** | Agrees — fix transport layer, not data model |
| **Winner** | **Both (aligned)** |
| **Why** | This is v2 architecture. The current ticket is about API transport patterns, not data model optimization. Index-by-ID, pagination, denormalization all belong in future work. |

### Decision 6: Redundant Auth Checks
| | |
|---|---|
| **Steve proposed** | 16 redundant `rc.user` permission guards are "anxiety in code form" — delete them |
| **Elon proposed** | Agrees — they go |
| **Winner** | **Both (aligned)** |
| **Why** | The framework handles auth. Defensive checks the platform already handles add noise, not security. |

---

## MVP Feature Set (What Ships in v1)

### In Scope
1. **Fix 443 pattern violations** — mechanical find-and-replace:
   - 121 `throw new Response` → proper response pattern
   - 153 `JSON.stringify` in kv.set → remove wrapper (platform handles serialization)
   - 153 `JSON.parse` on kv.get → remove wrapper (platform handles deserialization)
   - 16 `rc.user` redundant auth checks → delete blocks
   - `rc.pathParams` → replace with `rc.input`

2. **Admin page loads events** — first load shows events or single "Create Event" button

3. **Human copy for success/error messages** — warm language where we touch strings

### Out of Scope (v2)
- Product rename to "Gather"
- Phase 3: Sunrise Yoga integration (separate PR)
- KV architecture refactor (index by event ID, pagination)
- Broader UI Block Kit structure changes
- Performance optimizations (batch KV reads, edge caching, denormalized counts)

---

## File Structure (What Gets Built)

### Primary Target
```
sandbox-entry.ts  — ~450 pattern replacements (single file contains all violations)
```

### Deliverables
```
Phase 1-2 PR:
├── sandbox-entry.ts (pattern fixes)
├── Human-language success/error strings
└── Delete redundant auth blocks

Phase 3 PR (separate):
└── Sunrise Yoga integration wiring
```

### Not Touched
- KV key schema
- Block Kit UI structure (beyond error messages)
- Package names / manifest
- Documentation

---

## Open Questions (Need Resolution)

| Question | Owner | Blocking? |
|----------|-------|-----------|
| What is the exact `rc.input` pattern for path params? | Build Agent | Yes — PRD should have examples |
| Which specific strings need human copy treatment? | Build Agent | No — judge during implementation |
| How do we verify admin page loads without the Sunrise Yoga integration? | Build Agent | No — test with mock/existing event data |
| Is there a staging environment to validate before production? | DevOps/Infra | Yes — don't ship blind |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Block Kit form state breaks after pattern replacement** | Medium | High | PRD has explicit example code; test form submission flows carefully |
| **Missed pattern instance crashes production** | Low | High | Grep for all 5 patterns post-fix; automated test coverage |
| **Human copy changes introduce tone inconsistency** | Low | Low | Stick to PRD examples; one voice, one pass |
| **KV data corruption from serialization change** | Low | Critical | Platform handles serialization natively — removing manual wrappers should be safe, but test with real data |
| **Phase 3 integration delayed indefinitely after split** | Medium | Medium | Create Phase 3 ticket immediately; don't lose momentum |
| **Rename to Gather never happens** | Medium | Low | Track in v2 roadmap; Steve won't let this die |

---

## Agreements (Both Aligned)

- The 443 violations must die
- User sees events in 30 seconds or less
- Human language in error messages
- Delete the defensive auth bloat
- Trust the platform's built-in serialization
- Phase 3 ships separately
- KV architecture is v2

---

## Final Verdict

**Ship it.**

The PRD is tight. The scope is correct. The work is mechanical. One file, one pass, one PR.

The codebase doesn't need a therapist. It needs a surgeon.

Then we argue about names over champagne.

---

*"The strength of the team is each individual member. The strength of each member is the team." — This build phase requires surgical precision from the agent and trust from the humans. Execute the plan.*

— Phil Jackson
