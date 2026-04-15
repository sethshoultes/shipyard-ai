# Design Review: Shipyard Client Portal

## Visual Hierarchy

**Landing page (`app/page.tsx`)**
- ❌ Hero headline (L28-31) too verbose. "Your Website Projects, Delivered & Managed" fights for attention with subhead.
- ❌ Dual CTAs (L38-49) confuse priority. "Get Started" and "Sign In" given equal weight.
- ✓ Three-column features (L53-78) balanced. Good rhythm.

**Dashboard (`app/dashboard/page.tsx`)**
- ❌ "Dashboard" header (L52) states the obvious. User knows where they are.
- ❌ Email display (L65-66) lacks hierarchy. Label and value have similar weight.
- ❌ Empty state message (L74-75) buried in border. Should be more prominent or removed entirely.

**Forms**
- ❌ Login (L38-39) uses "Sign in to your account" — redundant. User clicked "Log In" to get here.
- ❌ Signup form (L97-100) header verbose. "Create Account" + "Sign up to start managing" repeats intent.

## Whitespace

**Cramped:**
- `login/page.tsx` L60-70: Input fields have `mt-1` — too tight. Form feels dense.
- `SignupForm.tsx` L116-130: Same issue. Inputs lack breathing room.
- `dashboard/page.tsx` L62-90: Content max-width 3xl but sections packed with `space-y-6` — feels compressed.

**Good:**
- Landing page hero (L26-51) uses `space-y-8` and `pt-4` effectively.
- Footer (L81-93) balanced padding.

**Fix:**
- Change all form `mt-1` to `mt-2.5` or `mt-3`.
- Dashboard sections need `space-y-8` minimum, not `space-y-6`.

## Consistency

**Broken patterns:**

**Color systems clash:**
- Landing uses zinc palette: `bg-white dark:bg-black`, `border-zinc-200 dark:border-zinc-800`
- Login/forgot-password use gray palette: `bg-gray-50 dark:bg-gray-900`, `border-gray-300`
- Signup uses slate: `bg-slate-800`
- Landing buttons: `bg-black dark:bg-white`
- Login buttons: `bg-indigo-600`
- Signup buttons: `bg-blue-600`

**Three different brand colors for primary action. Unacceptable.**

**Border radius inconsistent:**
- Landing buttons: `rounded-lg` (8px) — `page.tsx` L18, L40
- Form inputs: `rounded-md` (6px) — `login/page.tsx` L68
- Signup inputs: `rounded-lg` (8px) — `SignupForm.tsx` L123

**Fix all to `rounded-lg` (8px). More confident.**

**Typography scale:**
- Landing H1: `text-xl` (L8)
- Dashboard H1: `text-2xl` (L52)
- Form H1: `text-3xl` (L38, L97)

**No consistent system. Headers should follow strict scale.**

## Craft

**Details that fail inspection:**

**`globals.css` L25-26:**
```css
font-family: Arial, Helvetica, sans-serif;
```
- Geist Sans loaded (L5-8 in `layout.tsx`) but globals.css ignores it.
- Should be: `font-family: var(--font-geist-sans), system-ui, sans-serif;`

**`layout.tsx` L28:**
```tsx
className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
```
- Template literal unnecessary. Use `cn()` utility or plain string.

**`page.tsx` L6:**
- Border on header but no max-width container creates edge-to-edge line that feels cheap on wide screens.
- Container (L7) should wrap entire header element, not sit inside.

**`login/page.tsx` L68-69:**
```tsx
className="mt-1 block w-full rounded-md border border-gray-300..."
placeholder="you@example.com"
```
- Placeholder too literal. "Email" or "Your email" sufficient. "you@example.com" patronizing.

**`SignupForm.tsx` L155:**
```tsx
placeholder="Minimum 8 characters"
```
- Requirement in placeholder = UI smell. Move to helper text below input.

**`dashboard/page.tsx` L86-88:**
```tsx
<p className="text-sm text-zinc-500 dark:text-zinc-500">
  Session expires after 7 days of inactivity.
</p>
```
- Technical detail user doesn't need on arrival. Remove or relocate to account settings.

**Loading state (`dashboard/page.tsx` L40-45):**
```tsx
<div className="flex items-center justify-center min-h-screen">
  <p>Loading...</p>
</div>
```
- Naked text. Needs proper spinner or skeleton. Feels unfinished.

## What Would Make It Quieter but More Powerful

1. **Single color system:**
   - Remove all indigo/blue from buttons
   - Use only: `bg-black dark:bg-white` for primary actions
   - Use only: `border-zinc-200 dark:border-zinc-800` for all borders
   - Use only: zinc palette for backgrounds/text

2. **Remove redundant text:**
   - Landing hero: Change to just "Website Projects, Delivered" (remove "Your" and "& Managed")
   - Dashboard: Remove "Dashboard" header entirely. Email is the header.
   - Login: Remove "Sign in to your account". Just show the form.
   - Signup: Combine to "Create your account" as only text.

3. **Consistent scale:**
   - Page titles: `text-3xl font-semibold` (not bold)
   - Section headers: `text-xl font-medium`
   - Body: `text-base`
   - Secondary: `text-sm`
   - Metadata: `text-xs`

4. **Increase whitespace systematically:**
   - All form inputs: `mt-3` instead of `mt-1` or `mt-2`
   - All sections: `space-y-8` minimum (never less)
   - Page padding: `py-12` minimum, `py-16` preferred

5. **Remove uncertainty:**
   - Delete empty state messages that apologize for missing content
   - Replace "Loading..." with elegant skeleton or remove entirely
   - Delete helper text that explains the obvious

6. **One border radius:**
   - Everything `rounded-lg` (8px)
   - Inputs, buttons, cards, alerts

7. **Fix typography:**
   - Remove Arial fallback from `globals.css`
   - Apply Geist Sans properly
   - Add `letter-spacing: -0.01em` to all headings for tighter feel

The portal functions but lacks conviction. Every page speaks with different voice. Make one decision and repeat it everywhere. Confidence through consistency.
