# Design Review — Membership Production Fix

**Reviewed:** `sandbox-entry.ts` (3,441 lines)

---

## Visual Hierarchy

**Problem:** Important fails to dominate.

- L28-47: Interface sprawl. Status types buried (`"pending" | "active" | "revoked"`). Eye scans 20 lines before understanding member states.
- L887-917: DEFAULT_PLANS hiding in middle of file, between email functions and plugin hook. Should lead, not follow.
- L955-1091: `register` route handler—132 lines of nested logic. Lock acquisition (L1008-1014), validation (L972-992), member creation (L1018-1061) all weighted equally. No separation.
- L1350-1377: Webhook switch statement flat. 7 event types look identical. Critical vs. informational events undifferentiated.
- L2164-2168: Member table sorted by date, but status filter applied earlier (L2186-2194). Filter should announce itself before data.

**What's missing:** Entry points. The file greets you with interfaces, not intentions.

---

## Whitespace

**Problem:** No room to think.

- L596-844: 7 email functions back-to-back, 248 lines unbroken. Each function 30-50 lines. Template building (L620-631), rate limiting (L602-608), KV fetches (L611-618)—all pressed together.
- L1492-1509: Stripe checkout form building: 17 consecutive `append()` calls. No separation between mode/customer setup vs. payment config.
- L2730-2806: Drip unlock processing loop: 76 lines, 5 levels of nesting. Member iteration, plan checks, date math, email sending, error handling—continuous text block.
- L357-405: `handleSubscriptionCreated` mixes member lookup, status updates, period calculations, email dispatch. 48 lines, zero internal breaks.

**Density everywhere.** Code breathes nowhere.

---

## Consistency

**Problem:** Patterns diverge.

- **Member lookup:** Sometimes `getMemberByStripeCustomerId()` (L322-341), sometimes inline KV fetch (L1123, L1733, L2465). Same operation, different grammar.
- **Error messages:** "That email doesn't look right" (L977, L1244) vs. "Invalid email address" (L2258) vs. "Valid email required" (L2460). Three voices for one concept.
- **Admin guards:** `approve` route (L1193) has no `public: false` annotation. `dashboard` (L1696) explicitly marks `public: false`. Inconsistent signaling.
- **Date handling:** `expiresAt` vs. `currentPeriodEnd`. Both store ISO dates. `expiresAt` set from `currentPeriodEnd` (L390) but both maintained separately. Redundant truth.
- **KV key encoding:** `emailToKvKey()` used sometimes (L995, L1622), raw email used others (L3048 stores `adminEmail` directly in members array).
- **Duplicated null checks:** L1206-1212, L1210-1212 check `!member` twice. L1249-1255 identical. L1739-1742 identical. L1818-1824 identical. L1900-1906 identical. Copy-paste scars.

**Inconsistency signals rush.**

---

## Craft

**Inspecting closely reveals:**

- L1014: Lock expiry set via `(ctx.kv as any).set(lockKey, "1", { ex: 5 })`. Type cast to escape safety. Lock never verified on cleanup. Race condition possible.
- L622-624: `memberName` derived from email prefix: `email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1)`. Splits twice. Capitalize fallback for missing names feels careless.
- L1496: `line_items[0][price]` assumes `selectedPlan.id` is Stripe price ID. Comment says "Assuming." Fragile.
- L2750-2751: UTC midnight calculation: `new Date(joinMidnight.getTime() - joinMidnight.getTimezoneOffset() * 60000)`. Mixing UTC and local. Drip unlock timing fragile across zones.
- L2668: `await canAccessContent(member.email, email, rule, ctx)` passes `member.email` and `email` separately. Why two emails? Unclear.
- L887: DEFAULT_PLANS hardcoded with `id: "free"`, `price: 0`. Used as both fallback data and schema example. Dual purpose muddies intent.
- L1339: Stripe webhook idempotency TTL 24h. Arbitrary. No comment explaining why.
- L240: Webhook logs capped at 100. Silently drops oldest. No warning logged when pruning.

**Details degrade trust.**

---

## What to Change

### Make it quieter but more powerful:

1. **Start with intention, not implementation.**
   Move `DEFAULT_PLANS` (L887-917) to top. Interface definitions follow plans, not precede them. Reader sees "what" before "how."

2. **Extract member operations.**
   Create `MemberService` or separate module:
   - `lookupMemberByEmail()`
   - `lookupMemberByStripeId()`
   - `updateMemberStatus()`
   - `checkMemberAccess()`
   Eliminates L322-341, L1123, L1733 inconsistencies. Single voice.

3. **Break email sender wall.**
   L596-844: Insert blank lines between function declarations. Group by purpose:
   - Welcome/lifecycle (L596-638, L680-718)
   - Payment events (L720-803)
   - Reminders (L805-844)
   Add section comments. Create visual sections without adding words.

4. **Simplify route handlers.**
   L955-1091 `register`: Extract validation → 1 function. Lock logic → 1 function. Member creation → 1 function.
   Handler becomes 20 lines:
   ```
   validate input
   acquire lock
   create member
   release lock
   ```
   Each step 1-2 lines. Eye scans structure instantly.

5. **Remove redundant state.**
   `expiresAt` and `currentPeriodEnd` both exist. Choose one. If Stripe is source of truth, `currentPeriodEnd` sufficient. Compute expiry on read, not store.

6. **Consolidate date math.**
   L2750-2773: UTC midnight logic in one place, not inline. Create `getDripUnlockDate(joinDate, dripDays)` utility. Tested once, trusted everywhere.

7. **Elevate errors.**
   "That email doesn't look right" vs. "Invalid email" vs. "Valid email required"—pick one. Preferably: "Email address required" and "Email address invalid." Same shape, different state.

8. **Surface hierarchy in webhook handling.**
   L1350-1377: Critical events (`subscription.deleted`, `payment_failed`) should feel different from informational (`subscription.updated`). Reorder by impact, not alphabet.

9. **Type instead of cast.**
   L1014 `(ctx.kv as any)` shows KV interface incomplete. If expiry options needed, define them. Types should enable, not block.

10. **Remove duplicate null checks.**
    L1210/1212, L1253/1255, etc. Delete second check. If trust is broken, fix source, don't double-guard.

---

**Summary:**
File is functional but fatigued. Information present but not prioritized. Code works but doesn't guide. To make it powerful, give it structure. To make it quiet, give it space.

Most important code should be most visible.
Most dangerous code should be most tested.
Most common code should be most elegant.

Right now: everything looks the same weight.

**Recommendation:** Refactor for clarity, not features. Break monolith into modules. Reader should know where they are without reading line numbers.
