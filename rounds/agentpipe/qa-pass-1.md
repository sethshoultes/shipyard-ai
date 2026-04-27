# QA Pass 1 — Project: `agentpipe`
**QA Director:** Margaret Hamilton
**Date:** 2026-04-23
**Scope:** Verify deliverables in `/home/agent/shipyard-ai/deliverables/agentpipe/` against requirements in `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md`

---

## Overall Verdict: **BLOCK**

> **A single P0 blocks the entire build. This build has five P0 issues. It does not ship.**

---

## Critical Context

The requirements document (`REQUIREMENTS.md`) governs the **LocalGenius Revenue & Retention Sprint** — a SaaS application with Stripe annual billing, weekly digest emails, SQL analytics, and "Sous" brand voice.

The `deliverables/agentpipe/` directory contains deliverables for **AgentPipe** — a WordPress MCP plugin that exposes posts/pages via the Model Context Protocol.

**These are completely different projects. Not one requirement maps to a deliverable in the target directory.**

---

## Mandatory Step 1: COMPLETENESS CHECK (Placeholder Content)

**Command executed:**
```bash
grep -irn "placeholder|coming soon|TODO|FIXME|lorem ipsum|TBD|WIP" /home/agent/shipyard-ai/deliverables/agentpipe/
```

**Result:** 1 match — `spec.md:192` references `todo.md` in a file inventory table ("Running task checklist"). This is a structural reference, not placeholder copy.

**Verdict on literal placeholder check:** No banned placeholder strings found in content.
**However:** The entire directory contains the wrong project, so this check is moot.

---

## Mandatory Step 2: CONTENT QUALITY CHECK

| File | Lines | Assessment |
|------|-------|------------|
| `spec.md` | 227 | Real specification document. Describes a WordPress MCP plugin, not the required SaaS billing/digest system. |
| `todo.md` | 80 | **Every checkbox is unchecked.** Zero tasks complete. This is a scaffold, not a delivered artifact. |
| `tests/test-structure.sh` | 125 | Real test script. Passes against `projects/agentpipe/build/`. Does not map to any requirement. |
| `tests/test-security.sh` | 52 | Real test script. Passes against `projects/agentpipe/build/`. Does not map to any requirement. |
| `tests/test-protocol.sh` | 205 | Real test script. Passes against `projects/agentpipe/build/`. Does not map to any requirement. |

**Verdict:** The test scripts have real implementations, but the directory contains zero code deliverables for the requirements. `todo.md` is effectively a stub (unchecked tasks = incomplete work).

---

## Mandatory Step 3: BANNED PATTERNS CHECK

**Command executed:**
```bash
ls -la /home/agent/shipyard-ai/BANNED-PATTERNS.md
```

**Result:** `BANNED-PATTERNS.md` does not exist in the repository root.

**Verdict:** SKIP — no banned patterns file to enforce.
*(Note: The AgentPipe test scripts contain their own security patterns and pass when run against the build output in `projects/agentpipe/build/`.)*

---

## Mandatory Step 4: REQUIREMENTS VERIFICATION

**Source:** `/home/agent/shipyard-ai/.planning/REQUIREMENTS.md` (13 requirements for LocalGenius Revenue & Retention Sprint)

**Target:** `/home/agent/shipyard-ai/deliverables/agentpipe/`

| Requirement | Priority | Expected Deliverable(s) | Found in `deliverables/agentpipe/`? | Verdict |
|-------------|----------|----------------------|-------------------------------------|---------|
| **REQ-1:** Annual Billing Toggle | P0 | `app/components/BillingToggle.tsx`, `app/components/PricingPage.tsx` | **NO** | **FAIL** |
| **REQ-2:** Stripe Annual Plan Configuration | P0 | `app/lib/stripe.ts` | **NO** | **FAIL** |
| **REQ-3:** Stripe Webhook Handler — Annual Subscriptions | P0 | `app/api/webhooks/stripe.ts` | **NO** | **FAIL** |
| **REQ-4:** Idempotency Keys on All Stripe Webhooks | P0 | `app/api/webhooks/stripe.ts` | **NO** | **FAIL** |
| **REQ-5:** Proration Behavior — `create_prorations` | P0 | `app/lib/stripe.ts`, `app/api/webhooks/stripe.ts` | **NO** | **FAIL** |
| **REQ-6:** Async Job Queue for Digest Generation | P0 | `app/jobs/digest.ts` | **NO** | **FAIL** |
| **REQ-7:** Batched Email Sends | P0 | `app/lib/email.ts`, `app/jobs/digest.ts` | **NO** | **FAIL** |
| **REQ-8:** MoM SQL Query on `insight_actions` | P0 | `app/lib/digest-query.ts`, `db/migrations/002_insight_actions_index.sql` | **NO** | **FAIL** |
| **REQ-9:** Emotional Fork Framing + Annual Billing Badge | P0 | `app/components/PricingPage.tsx` | **NO** | **FAIL** |
| **REQ-10:** Post-Purchase Confirmation Email | P0 | `app/emails/Confirmation.tsx` | **NO** | **FAIL** |
| **REQ-11:** Weekly Digest Email Template with MoM Comparison | P0 | `app/emails/WeeklyDigest.tsx` | **NO** | **FAIL** |
| **REQ-12:** "Sous" Brand Voice Integration | P1 | `config/brand.ts` | **NO** | **FAIL** |
| **REQ-13:** Single-Line "Time Saved" Teaser | P1 | `app/components/DigestTeaser.tsx` | **NO** | **FAIL** |

**Requirements Met:** 0 / 13
**P0 Requirements Met:** 0 / 11
**P1 Requirements Met:** 0 / 2

**Verdict:** Complete requirements traceability failure. The deliverables directory contains a WordPress plugin specification (AgentPipe), not the SaaS billing/digest system required by the locked requirements.

---

## Mandatory Step 5: LIVE TESTING

**Assessment:**
- The requirements describe a deployable SaaS application with Stripe webhooks, React components, and an async email pipeline.
- The `deliverables/agentpipe/` directory contains **no deployable application code** for these requirements.
- No `package.json`, no build script, no running server, no endpoints to curl.
- The only code that exists is in `projects/agentpipe/build/agentpipe/` (a WordPress plugin). That code is **not in the deliverables directory under verification** and is irrelevant to the requirements.

**Test Scripts Run (for completeness):**
```bash
bash tests/test-structure.sh   # PASS (against projects/agentpipe/build/)
bash tests/test-security.sh    # PASS (against projects/agentpipe/build/)
bash tests/test-protocol.sh   # PASS (against projects/agentpipe/build/)
```

These passing tests validate the wrong product.

**Verdict:** **BLOCK** — No deployable artifact exists in the target deliverables directory that corresponds to any requirement. Nothing to build, nothing to deploy, no endpoints to curl.

---

## Mandatory Step 6: GIT STATUS CHECK

**Command executed:**
```bash
git status
```

**Result:**
```
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	deliverables/agentpipe/
```

The entire `deliverables/agentpipe/` directory is **untracked**.

**Verdict:** **BLOCK** — Per critical QA step 6, uncommitted files in the deliverables directory = automatic block. Everything must be committed before passing QA.

---

## Issues Ranked by Severity

### P0 — Ship Blockers (5 issues)

1. **TOTAL REQUIREMENTS TRACEABILITY FAILURE**
   **Issue:** Not one of the 13 locked requirements has a corresponding deliverable in `deliverables/agentpipe/`. The directory contains a WordPress MCP plugin specification (AgentPipe) while the requirements govern a SaaS billing/digest/retention system (LocalGenius).
   **Evidence:** Requirements table above. Zero matches across 13 requirements.
   **Fix:** Remove incorrect deliverables and place the actual LocalGenius Revenue & Retention Sprint code into `deliverables/agentpipe/`, **or** update the requirements document to reflect the AgentPipe project scope (requires PM approval).

2. **MISSING ALL REQUIRED CODE DELIVERABLES**
   **Issue:** The following required files are completely absent from the target directory:
   - `app/components/BillingToggle.tsx`
   - `app/components/PricingPage.tsx`
   - `app/lib/stripe.ts`
   - `app/api/webhooks/stripe.ts`
   - `app/jobs/digest.ts`
   - `app/lib/email.ts`
   - `app/lib/digest-query.ts`
   - `db/migrations/002_insight_actions_index.sql`
   - `app/emails/Confirmation.tsx`
   - `app/emails/WeeklyDigest.tsx`
   - `config/brand.ts`
   - `app/components/DigestTeaser.tsx`
   **Fix:** All 12 files must be present, implemented, and committed.

3. **UNCOMMITTED DELIVERABLES DIRECTORY**
   **Issue:** `deliverables/agentpipe/` is entirely untracked in git.
   **Evidence:** `git status` shows `deliverables/agentpipe/` under "Untracked files."
   **Fix:** `git add deliverables/agentpipe/` and commit with a traceable message before resubmission.

4. **INCOMPLETE WORK TRACKED AS DELIVERABLE**
   **Issue:** `todo.md` contains 80 lines of unchecked tasks. It is a build checklist, not a completed artifact. Presenting an unchecked todo list as a deliverable is a process failure.
   **Evidence:** `todo.md` — every checkbox `[ ]` is empty. No `[x]` found.
   **Fix:** Complete all tasks or remove incomplete artifacts from the deliverables directory.

5. **NO DEPLOYABLE ARTIFACT FOR REQUIREMENTS**
   **Issue:** The requirements describe a running SaaS system (Stripe webhooks, React pricing page, async digest jobs). The deliverables directory has no application code, no `package.json`, no server, no buildable artifact for these requirements.
   **Fix:** Provide a buildable, deployable application that satisfies REQ-1 through REQ-13.

### P1 — Required for MVP Launch (1 issue)

6. **PROJECT / SPECIFICATION MISMATCH**
   **Issue:** `spec.md` documents AgentPipe (WordPress MCP plugin) while the build is supposed to satisfy LocalGenius Revenue & Retention Sprint requirements. This indicates a fundamental project identity or routing error.
   **Evidence:** `spec.md` line 1 reads "AgentPipe Build Specification" with goals for WordPress MCP protocol compliance. Requirements document governs Stripe billing, weekly digests, and "Sous" brand voice.
   **Fix:** Clarify project scope with product leadership. Either deliver LocalGenius per requirements, or formally re-scope and re-author requirements for AgentPipe.

---

## QA Sign-Off

| Checkpoint | Status |
|------------|--------|
| Completeness Check (placeholders) | Pass (literal) — irrelevant due to wrong project |
| Content Quality Check | Fail — no required code files; unchecked todo.md |
| Banned Patterns Check | Skip — no BANNED-PATTERNS.md |
| Requirements Verification | **Fail — 0/13 requirements met** |
| Live Testing | **Fail — no deployable artifact for requirements** |
| Git Status Check | **Fail — entire directory untracked** |

**Final Determination:** **BLOCK**

**Next Action:** Do not proceed to Pass 2. Fix all P0 issues, commit to git, and resubmit.

---

*"You can't fix it if you don't know it's broke. And you don't ship what you haven't verified."*
— Margaret Hamilton, QA Director
