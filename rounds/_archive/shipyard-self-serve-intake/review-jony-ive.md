# Design Review: Shipyard Self-Serve Intake

**Reviewed by: Jony Ive**

---

## Visual Hierarchy

### ❌ Fails

**route.ts (Lines 5-17)**: Block comment dominates. Requirements list screams.
- Move to separate doc. Route should open with intent, not spec.

**logger.ts (Lines 1-11)**: Feature list before essence.
- One line: "Structured JSON logging with graceful degradation." Done.

**github.ts (Lines 5-14)**: Seven bullets before code starts.
- Wrong hierarchy. Lead with one sentence.

**event-parser.ts (Lines 1-8)**: Module doc adequate, but function comments repeat obvious.
- Lines 48-58: Comment says what code already shows. Delete.

---

## Whitespace

### ✓ Passes

**priority-detector.ts**: Clean vertical rhythm. Functions breathe.

### ❌ Fails

**route.ts (Lines 37-89)**: `verifyWebhookSignature` lacks internal air.
- Lines 63-72: Cryptographic block crushed together.
- Insert blank line after line 68.

**github.ts (Lines 216-294)**: `postComment` method dense. 78 lines, no paragraph breaks.
- Break at line 236 (after API call).
- Break at line 245 (after rate limit update).

**content-analyzer.ts (Lines 75-116)**: `inferRequestType` cramped conditionals.
- Each `if` block needs separation. Insert blanks: after 90, 99, 105, 111.

---

## Consistency

### ✓ Passes

**Naming**: Unified across modules. `detectPriority`, `analyzeContent`, `parseGitHubWebhook`.

**Error handling**: All modules return structured objects, never throw raw.

### ⚠️ Mixed

**Comments style**:
- Some files use `/** JSDoc */` (github.ts)
- Some use `//` inline (route.ts line 37)
- Some use `/**` without JSDoc tags (logger.ts)
- **Fix**: Choose JSDoc for public APIs. Inline `//` for implementation notes. Never mix.

**Logging patterns**:
- route.ts uses `logger.info()` with inline objects (line 177)
- github.ts uses pre-structured calls like `logger.logGitHubAPICall()` (line 221)
- **Inconsistent abstraction level.** Either abstract everywhere or nowhere.

---

## Craft

### ✓ Rewards inspection

**priority-rules.ts (Lines 115-137)**: Metadata object elegant. Icon choice deliberate.

**event-parser.ts (Lines 98-144)**: Extraction functions single-purpose. No side effects.

**001_create_intake_requests.sql**: Schema concise. Constraints explicit. Indexes justified.

### ❌ Misses the mark

**route.ts (Lines 131-136)**: Returns 200 for invalid signatures "to not leak information."
- Comment explains tactic, not philosophy. Why is deception correct here?
- Rewrite: "Returns 200 to all requests—valid and invalid—preventing timing attacks and information disclosure to malicious actors."

**github.ts (Lines 104-109)**: Backoff calculation adds "jitter" (line 108).
- Why jitter? Comment silent.
- Add: "// Jitter prevents thundering herd when multiple clients retry simultaneously"

**logger.ts (Lines 87-92)**: Fallback for stringify errors hardcoded.
- String template fragile. What if `message` contains quotes?
- Use `.replace(/"/g, '\\"')` or rethink structure.

**content-analyzer.ts (Lines 48-54)**: URL regex uncommented.
- Regex is write-only code. Add comment: "// Matches http(s) URLs with domains, paths, and query strings"

---

## What Would Make It Quieter But More Powerful

### 1. Delete all docblocks over 3 lines
Every file starts with paragraph. No one reads them. Put docs in `/docs`, not code. Code should explain itself.

**Action**:
- route.ts: Remove lines 5-17. Replace with: `// GitHub webhook handler with HMAC-SHA256 validation`
- logger.ts: Remove lines 1-11. Replace with: `// Structured JSON logging`
- github.ts: Remove lines 5-14. Replace with: `// GitHub API client with rate limiting and circuit breaker`

### 2. Collapse validation helpers
**event-parser.ts (Lines 98-163)**: Four helper functions for extraction.
- Extract helpers hidden in middle of file. Relegate to bottom or separate module.
- Main logic (line 60) should be uninterrupted. Eye flows down, not up.

**Action**: Move `getIssueObject`, `getRepositoryObject`, `extractLabels`, `validateRequiredFields`, `handleBodyEdgeCases` to bottom after line 227.

### 3. Remove "logger salad"
**github.ts**: Every method logs 2-4 times. Noisy.
- Lines 221-234: Log before call
- Line 251: Log after call
- Lines 282-287: Log on error
- Excessive. Log **once per outcome**: success or failure. Not journey.

**Action**:
- Delete lines 221-234 (pre-call logging).
- Keep lines 251-257 (success).
- Keep lines 282-287 (error).

### 4. Surface structure with types, not comments
**priority-detector.ts (Lines 23-28)**: `DetectionResult` interface clear.
**route.ts (Lines 21-35)**: `WebhookPayload` interface clear.

But **github.ts (Lines 18-39)**: Three state interfaces unexplained.
- Why these fields? What state machine?

**Action**: Rename for clarity:
- `RateLimitState` → `GitHubRateLimit`
- `CircuitBreakerState` → `CircuitBreaker`
- `CommentQueueItem` → `QueuedComment`
Add one-line comment for CircuitBreaker explaining threshold (line 47).

### 5. Unify response shapes
**github.ts (Lines 188, 440)**: `postComment` returns `{ success, commentUrl, queued, error }`
**github.ts (Line 473)**: `getIssue` returns `{ success, data, error }`

Inconsistent keys. `data` vs `commentUrl`.

**Action**: Standardize:
```typescript
{ success: boolean; data?: T; error?: string; metadata?: object }
```

### 6. Reduce keyword redundancy
**priority-rules.ts (Lines 27-48)**: `p0.exact` has "production down", "production broken"
- "down" appears in exact AND partial (line 37, 45)
- Duplication dilutes meaning.

**Action**: Remove "down" from line 37. Keep only in partial at line 45. Precision in exact, breadth in partial.

### 7. Silent strength in SQL
**001_create_intake_requests.sql (Lines 1-3)**: Migration header adequate.
**Lines 5-40**: Schema reads cleanly.

But line 20: `priority TEXT CHECK (priority IN ('p0', 'p1', 'p2'))`
- Why TEXT? ENUM or small integer cleaner.

**Action**: Use ENUM or document decision: `-- TEXT chosen over ENUM for PostgreSQL version compatibility`

---

## Summary

**What's right**: Function signatures clean. Modules single-purpose. Error handling consistent.

**What's loud**: Comment blocks overwhelm. Logger calls intrude. Helper functions interrupt flow.

**What's missing**: Decisiveness. Why 200 for invalid webhooks? Why jitter? Why TEXT not ENUM? Code confident, comments defensive.

**Make it quieter**: Remove docblocks. Move helpers to bottom. Log outcomes, not steps.

**Make it more powerful**: Let types speak. Unify response shapes. Trust the reader.

---

The craft is here. Now refine it.
