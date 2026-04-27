# ANCHOR System — Design Review

## Overall Verdict
**Quiet confidence achieved.** System shows restraint. Not trying too hard.

---

## Visual Hierarchy

### Email Template (`day7-your-site-is-alive.tsx`)

**L58-61: Headline works.**
- 28px, weight 600, black on white
- Most important element claims space appropriately
- "Your site is alive" — direct, unfussy

**L151-156: Greeting too timid.**
- 16px greeting same size as body text
- Color (#666) creates hierarchy, but size equality undermines it
- Reduce to 14px or remove entirely

**L170-195: Button hierarchy inverted.**
- Primary and secondary buttons nearly identical weight
- Primary: 14px padding, 500 weight
- Secondary: 14px padding, 400 weight
- Difference: too subtle. Primary needs 600 weight minimum

**L94: Copy competes with CTA.**
- "We remember. Even after confetti settles" appears *after* CTAs
- Emotional anchor should lead into action, not trail it
- Move to L63 (before body paragraphs)

---

## Whitespace

**L136: Container max-width perfect.**
- 600px with 40px padding = breathing room

**L139: Hero margin insufficient.**
- 40px below hero image
- Should be 60px — let hero breathe before content intrudes

**L170: CTA section margin excessive.**
- 40px top/bottom creates dead zone
- Reduce to 32px top, 24px bottom

**L203-206: HR too heavy.**
- 40px margin before/after
- Should be 32px — footer doesn't deserve monument spacing

---

## Consistency

**Database Schema (`001-anchor-tables.sql`)**

**L8-19: Naming inconsistent.**
- Snake_case database fields
- React components use camelCase
- TypeScript interfaces use camelCase
- No bridge. Forces mapping layer everywhere.

**L18: Email validation duplicated.**
- Regex in schema (CHECK constraint)
- Regex in `resend-client.ts` L137
- Different patterns. Which is source of truth?
- Consolidate to single validation utility

**Console Logging (`resend-client.ts`, `email-helpers.ts`)**

**L48, 56, 67, 87, 94: Emoji inconsistency.**
- ✅ ❌ ⏭️ 📧 ⏳
- Five different emoji styles for logging
- Creates visual noise
- Replace all with simple prefix: `[OK]` `[ERR]` `[SKIP]` `[SEND]` `[WAIT]`

---

## Craft

**L124: Styles object — inline declared.**
- Comment says "following Steve Jobs' aesthetic"
- Implementation scattered in JSX file
- Extract to `styles/email.ts` — give it room to be intentional

**L147: Border radius magic numbers.**
- Email uses 8px (hero), 6px (buttons)
- No system. Arbitrary.
- Choose one: 8px everywhere or define scale

**L204: Footer color (#e5e5e5) appears once.**
- Not reused anywhere
- Not part of palette
- Define color system:
  - Primary text: #000
  - Secondary: #666
  - Tertiary: #999
  - Borders: #e5e5e5
  - Background: #f5f5f5

**db-queries.ts: Pool management broken.**

**L38, 60, 83, 105, 127, 149: Pool created/destroyed per query.**
```typescript
const pool = getDbPool();
// ... query
await pool.end();
```
- Connection thrash
- Performance penalty on every call
- Should be singleton pool, reused

**L48-54: SQL formatting inconsistent.**
- Some queries have 2-space indent
- Some have 4-space
- Pick one

---

## What Would I Change?

### 1. Remove the hero image placeholder
**L45-53: Fake hero hurts more than helps.**
```tsx
<Img
  src="https://shipyard.com/images/anchor-hero.png"
  alt="Your site is live"
/>
```
- Placeholder URL doesn't exist
- Will break on send
- Better: no image than broken image
- **Action:** Delete L45-53 entirely. Let typography carry weight.

### 2. Consolidate emotion
**Copy scattered across L64-95.**
- Three separate emotional beats:
  - "check in"
  - "doing exactly what it was built to do"
  - "we remember"
- Too much. Pick one strong line.
- **Action:** Collapse to:
```
L64-66:
It's been a week. Your site is live, serving visitors,
doing what it was built to do. We remember.
```
Delete L68-71, L94-95.

### 3. Button reduction
**L74-91: Three CTAs.**
- Visit Site (primary)
- Admin (secondary)
- What's Next? (secondary)
- **Action:** Remove "What's Next?" L85-90. Two is enough. Three dilutes.

### 4. Database pool singleton
**anchor/lib/db-pool.ts (new file)**
```typescript
let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  return pool;
}
```
**Action:** Create file. Refactor all db-queries to use singleton.

### 5. Typography scale
**Current: 13px, 16px, 28px — no rhythm.**
**Better scale:**
- Headline: 32px
- Body: 16px
- Footer: 12px
- Greeting: delete or 14px

**Action:** Update L152, L158, L210 accordingly.

### 6. Kill the italics
**L200-202: Signature italic.**
```typescript
fontStyle: 'italic' as const,
```
- Trying too hard to be "personal"
- Italic = decoration
- **Action:** Remove. Let words do the work.

---

## Final Thought

Good bones. System doesn't shout.

Needs:
- Tighter copy (50% reduction)
- Unified spacing scale
- Database connection fix (critical)
- Color system documented
- Remove decoration

Make it quieter. Make it stronger.
