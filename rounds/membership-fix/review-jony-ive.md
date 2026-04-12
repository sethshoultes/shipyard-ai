# Design Review: Membership Plugin

*A meditation on form, restraint, and the quiet confidence of considered craft.*

---

## Summary

This is competent engineering that speaks too loudly. The code works — but it doesn't *feel* inevitable. There's noise where there should be silence. Repetition where there should be rhythm. The bones are good; the soul needs finding.

---

## Visual Hierarchy

**The most important thing should be the most visible.**

### What Works

The file separation honors distinct concerns. `auth.ts` knows only authentication. `email.ts` knows only communication. This is correct. Each file has a clear purpose — you understand what you're looking at.

### What Doesn't

**`sandbox-entry.ts` is a cathedral that has forgotten its nave.**

The file sprawls across 2000+ lines with no visual rhythm. The eye has nowhere to rest. Everything shouts at the same volume.

- **Lines 27–134**: Seven interface definitions stacked consecutively with no breathing room. `MemberRecord`, `GroupRecord`, `GroupInviteCode`, `WebhookEndpoint`, `WebhookLog`, `PlanConfig`, `AdminInteraction`, `CouponRecord` — each equally weighted, none elevated. The reader cannot distinguish the essential from the auxiliary.

- **Lines 887–917**: `DEFAULT_PLANS` is buried 900 lines into the file. This is foundational configuration — the very definition of what a membership *is* — yet it sits amidst webhook handlers like furniture moved to the wrong room.

- **Lines 919–end**: The plugin definition (`definePlugin`) — the actual entry point, the thing that matters most — begins at line 919. The reader has already traversed 918 lines of supporting cast before meeting the protagonist.

**Recommendation**: The important things should appear first. Configuration before implementation. Intent before mechanism.

---

## Whitespace

**Is there room to breathe?**

### The Problem

The code is dense without being compact. There's a difference.

**`email.ts`, lines 88–115** — The HTML template construction:

```typescript
html: `<html>
<body style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
<p>Hi ${memberName},</p>

<p>Welcome! You're now a <strong>${vars.planName}</strong> member of ${siteName}.</p>
```

Inline styles accumulate like sediment. `style="background-color: #C4704B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;"` appears identically at lines 107, 158, 207, 266, 315, 361, 466. Seven repetitions. This is not consistency — this is noise.

**`sandbox-entry.ts`, lines 1200–1212**:

```typescript
if (!member) {
    throw new Error("We couldn't find a membership with that email");
}

if (!member) {
    throw new Error("We couldn't find a membership with that email");
}
```

The same null check, twice, consecutively. Lines 1253–1255 repeat this pattern. Lines 1739–1742. Lines 1822–1824. Lines 1904–1906. Five instances of identical consecutive checks. The reader wonders: is this intentional? Is there meaning I'm missing? No. It's simply clutter.

**Recommendation**: Remove the duplicate null checks. Extract the button style to a constant. Let silence speak.

---

## Consistency

**Do patterns repeat elegantly?**

### Elegant Repetition

The error messages share a voice. Warm, human, forgiving:
- *"Please enter your email address"*
- *"That email doesn't look right — please check and try again"*
- *"We couldn't find that plan — it may have been removed"*
- *"Something went wrong on our end — please try again"*

This is excellent. A single voice. A single temperament. The user feels held.

### Inelegant Repetition

**Token extraction logic** — repeated verbatim at lines 1704–1715, 1787–1798, 1864–1875, and conceptually elsewhere:

```typescript
let token: string | null = null;
if (authHeader) {
    if (authHeader.startsWith("Bearer ")) {
        token = extractToken(authHeader);
    } else if (authHeader.includes("Authorization=")) {
        const match = authHeader.match(/Authorization=([^;]+)/);
        if (match) {
            token = decodeURIComponent(match[1]);
        }
    }
}
```

Four times. Four opportunities for drift. This should be a single function — `extractTokenFromRequest(headers)` — called once per handler. The repetition isn't a pattern; it's a liability.

**Email helper functions** — `sendWelcomeEmail`, `sendUpdateEmail`, `sendCancelledEmail`, `sendPaymentFailedEmail`, `sendPaymentReceivedEmail`, `sendRenewalReminderEmail`, `sendExpiringEmail` (lines 596–882). Each follows an identical structure:

1. Check rate limit
2. Get plans
3. Get site config
4. Build vars
5. Create template
6. Send email

The structure is correct. But the structure is *copied*, not *abstracted*. Each function fetches `plans`, `siteName`, and `portalLink` independently. Seven times. This is not DRY — it's damp.

**Recommendation**: Create `getEmailContext(member, ctx)` that returns `{ plans, plan, siteName, portalLink, vars }`. Each email function becomes three lines.

---

## Craft

**Do the details reward close inspection?**

### Moments of Care

**`auth.ts`, lines 1–12** — The module comment is precise, security-conscious, and human:

```typescript
/**
 * JWT Authentication Module
 *
 * Provides secure JWT token generation, verification, and payload management
 * for member self-serve dashboard authentication.
 *
 * Security:
 * - Tokens stored in httpOnly, Secure, SameSite=Strict cookies (no localStorage)
 * - 15-minute access token expiry
 * - 7-day refresh token expiry
 * - HMAC-SHA256 signature verification
 */
```

This tells me what I'm holding. I trust it before I've read a line of implementation.

**`email.ts`, lines 60–116** — The welcome template reads like a letter from a friend:

```
Welcome! You're now a ${vars.planName} member of ${siteName}.

Your membership is active right now. You have full access to all the benefits
and content reserved for members like you.
```

The language has warmth. It assumes goodwill. It respects the reader's time.

### Moments of Compromise

**`sandbox-entry.ts`, lines 1654–1658**:

```typescript
const token = await signJWT(
    await createPayload(15 * 60, "access"),
    jwtSecret
);
```

`createPayload` expects `(email, plan, status, expiresIn, type)` — five parameters. Here it's called with two. This won't compile. The intention was correct; the execution slipped. The detail did not reward inspection — it punished it.

**`sandbox-entry.ts`, lines 502–512** — Environment variable access:

```typescript
const resendApiKey = (ctx as any).env?.RESEND_API_KEY as string | undefined;
const fromEmail = (ctx as any).env?.EMAIL_FROM as string | undefined;
```

`(ctx as any)` — the type system has been abandoned. This appears throughout: lines 1283, 1402, 1561–1562, 1722, 1805, 1882. The code no longer speaks honestly about what it knows.

**Recommendation**: Extend `PluginContext` type to include `env`. Or create a helper: `getEnv<T>(ctx, key): T | undefined`. The cast hides uncertainty; make uncertainty explicit.

---

## What I Would Change

### To Make It Quieter

1. **Delete the duplicate null checks.** Lines 1210–1212, 1253–1255, 1739–1742, 1822–1824, 1904–1906. They are echoes without meaning.

2. **Extract the button style constant.** In `email.ts`, create:
   ```typescript
   const BUTTON_STYLE = `background-color: #C4704B; color: white; padding: 10px 20px;
     text-decoration: none; border-radius: 4px; display: inline-block;`;
   ```
   Reference it seven times instead of defining it seven times.

3. **Create `extractTokenFromRequest(headers)`**. Call it instead of copying the extraction logic four times.

4. **Create `getEmailContext(member, ctx)`**. Let email functions focus on what makes them different, not what makes them the same.

5. **Move `DEFAULT_PLANS` to the top of `sandbox-entry.ts`**, immediately after imports and before interfaces. Configuration declares intent.

### To Make It More Powerful

1. **Reorder `sandbox-entry.ts`:**
   ```
   Imports
   Constants (DEFAULT_PLANS)
   Core interfaces (MemberRecord, PlanConfig)
   Supporting interfaces
   Utility functions
   Email helpers
   Webhook handlers
   Plugin definition
   ```

   The reader should meet the essential before the incidental.

2. **Fix the broken `createPayload` call at line 1656.** It needs email, plan, and status — the JWT must know who it authenticates.

3. **Type the environment properly.** Replace every `(ctx as any).env?.` with a typed accessor. The type system is not a suggestion — it's a contract.

4. **Consider splitting `sandbox-entry.ts`:**
   - `member-handlers.ts` — registration, status, approve, revoke
   - `stripe-handlers.ts` — webhook, checkout, portal
   - `dashboard-handlers.ts` — dashboard, cancel, upgrade
   - `admin-handlers.ts` — coupons, groups, webhooks
   - `index.ts` — the plugin definition, importing handlers

   Each file would be 200–400 lines. Each would have a singular responsibility. The whole would be comprehensible at a glance.

---

## Closing Thought

Good design is not the absence of complexity — it's the presence of clarity. This code solves the problem. But it doesn't yet embody its solution with the quiet inevitability of something that could not have been otherwise.

The work ahead is not addition. It's subtraction.

Remove what is said twice. Surface what is buried. Let the structure reveal the intention.

When the code feels like it designed itself — when a reader says "of course it's organized this way, how else could it be?" — then the work will be complete.

Until then: simplify, simplify, simplify.

---

*Reviewed with the conviction that every detail either elevates or diminishes the whole.*
