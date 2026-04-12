# Design Review: EventDash Fix

**Reviewer:** Jony Ive
**Date:** 2026-04-12
**Deliverables:** `/home/agent/shipyard-ai/deliverables/eventdash-fix/`

---

## Opening Reflection

There is a profound difference between something that *works* and something that *feels inevitable*. These deliverables work. The bug is fixed. The feature ships. But when I study them closely, I find artifacts of urgency rather than artifacts of intention.

Let me be specific.

---

## Visual Hierarchy

### The Code (`sandbox-entry.ts`)

The most important thing in any plugin is its contract with the user — what it promises, what it delivers. Here, that contract is buried.

**Lines 3-9 (Event interface):**
```typescript
interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  createdAt: string;
}
```

This is *functional*, but it does not *lead*. The `id` — a technical implementation detail — appears before `title`, which is the human-facing essence of an event. The interface should tell a story. It should begin with what matters.

**Recommendation:** Reorder to reflect conceptual hierarchy:
```typescript
interface Event {
  title: string;       // What is it?
  date: string;        // When?
  description: string; // Tell me more
  id: string;          // (system)
  createdAt: string;   // (system)
}
```

This is not about runtime. It is about how the mind reads.

**Lines 96-109 (Form definition):**
The form fields arrive in a reasonable order (Name, Date, Description), but the Block Kit JSON structure is dense. There is no breathing room between fields. Each field definition is crammed into a single line within the array.

---

## Whitespace

### The Code

The code is *compressed* where it should *breathe*, and *expansive* where it should be *tight*.

**Lines 24-30 (`loadEvents` function):**
```typescript
async function loadEvents(kv: any): Promise<Event[]> {
  const items = await kv.list("event:");
  return (items ?? [])
    .map((item: any) => parseEvent(item.value))
    .filter((e: Event | null): e is Event => e !== null)
    .sort((a: Event, b: Event) => a.date.localeCompare(b.date));
}
```

This chain of operations has no visual rest. The eye cannot pause. The mind cannot reflect. I would suggest:

```typescript
async function loadEvents(kv: any): Promise<Event[]> {
  const items = await kv.list("event:");

  const parsed = (items ?? [])
    .map((item: any) => parseEvent(item.value))
    .filter((e: Event | null): e is Event => e !== null);

  return parsed.sort((a, b) => a.date.localeCompare(b.date));
}
```

Two blank lines. A named intermediate. The reader now understands: *fetch*, *transform*, *sort*. Three movements.

### The Documentation (`TEST-RESULTS.md`)

**Lines 28-46:** The JSON response structure is presented without adequate whitespace between conceptual sections. Legacy fields are annotated inline (`// Legacy field (v1)`) but these comments create horizontal noise rather than vertical clarity.

**Lines 207-213:** The table is effective. Tables create natural whitespace through their grid structure. More tables, fewer inline annotations.

---

## Consistency

### Patterns That Repeat Elegantly

**Positive observation:** The route handler signature `(routeCtx: any, ctx: any)` is consistent across all three routes (lines 36, 42, 67). This is good. Pattern recognition reduces cognitive load.

**Positive observation:** The toast + navigate response pattern (lines 86-89) is clean:
```typescript
return {
  toast: { type: "success", text: "Created." },
  navigate: "/events",
};
```

This is confident. Direct. It does not apologize.

### Patterns That Jar

**Lines 44-46 vs. Lines 80-84:** The input extraction differs:

Route `createEvent`:
```typescript
const title = String(input.title ?? "");
const date = String(input.date ?? "");
const description = String(input.description ?? "");
```

Route `admin` (form handling):
```typescript
title: values.title ?? "",
date: values.date ?? "",
description: values.description ?? "",
```

One uses `String()` coercion; the other does not. This inconsistency will eventually cause a bug. More importantly, it signals uncertainty — *which approach is correct?* The code should commit to one pattern.

**Documentation inconsistency (`RESEARCH-NOTES.md` vs. `TEST-RESULTS.md`):**

- RESEARCH-NOTES uses `⚠️` and `✅` emoji liberally (lines 431-438)
- TEST-RESULTS uses text labels like "PASS" and "CODE VERIFIED ✅"

Choose one vocabulary. Let it become invisible through repetition.

---

## Craft

### Details That Reward Inspection

**Line 16 (`parseEvent`):**
```typescript
try { obj = JSON.parse(obj); } catch { return null; }
```

This single-line try-catch is *almost* elegant. The empty catch block is intentional — bad data should disappear silently. But the compression makes the intention unclear. Is this defensive programming or laziness?

I would make the intention explicit:
```typescript
try {
  obj = JSON.parse(obj);
} catch {
  return null; // Invalid JSON is treated as missing
}
```

The comment transforms the code from *suspicious* to *deliberate*.

**Lines 114-116 (Table row generation):**
```typescript
const rows = events.map((e: Event) => ({
  cells: [e.title, e.date, e.description || "-"],
}));
```

The `|| "-"` fallback for empty descriptions is thoughtful. But why `-` and not an empty string? Why not `"—"` (em-dash)? These micro-decisions matter. They accumulate into personality.

### Details That Disappoint

**Line 103: `"Date (YYYY-MM-DD)"`**

The label carries its validation requirements inside it, parenthetically. This is documentation masquerading as interface. The user should never need to know "YYYY-MM-DD". The input should guide them — a date picker, or at minimum, a placeholder that demonstrates format.

**`RESEARCH-NOTES.md`, Lines 263-306:**

The ReviewPulse comparison table is thorough, but it reads like a checklist rather than an insight. *"Match: ✅"* tells me the patterns align. It does not tell me *why* the patterns were chosen, or whether they should be questioned.

**`TEST-RESULTS.md`, Lines 276-291:**

The "Code Path" section uses ASCII arrows (`→`) which do not render consistently across systems. The path is deeply nested, spanning 7 levels, without visual hierarchy to distinguish middleware from plugin from handler.

---

## What I Would Change

To make this work quieter but more powerful:

### 1. Remove All Inline Type Annotations That Repeat

**Lines 27-28:**
```typescript
.map((item: any) => parseEvent(item.value))
.filter((e: Event | null): e is Event => e !== null)
```

The type annotations are noise. TypeScript can infer these. The code should trust the compiler:

```typescript
.map(item => parseEvent(item.value))
.filter((e): e is Event => e !== null)
```

### 2. Extract Magic Strings Into Named Constants

**Lines 25, 61, 85:** The string `"event:"` appears three times.

```typescript
const EVENT_PREFIX = "event:";
```

Now the *what* is separated from the *how*.

### 3. Simplify the Admin Route Structure

**Lines 67-131:** This single route handler does too much. It handles page loads, form submissions, list rendering, and create rendering. Each responsibility deserves its own function — not for performance, but for *comprehension*.

```typescript
const handlers = {
  renderList: async (ctx) => { ... },
  renderCreateForm: () => { ... },
  handleCreateSubmit: async (ctx, values) => { ... },
};
```

Then the admin handler becomes a router, not an executor.

### 4. Unify the Documentation Voice

**`RESEARCH-NOTES.md`** reads like investigation notes. **`TEST-RESULTS.md`** reads like a quality assurance report. Both are necessary, but neither is *finished*.

The final deliverable should have one voice: confident, concise, conclusive. Tables over paragraphs. Evidence over explanation.

### 5. Let the Empty State Breathe

**Line 127:**
```typescript
{ type: "section", text: "No events yet." }
```

This is correct. But imagine what it could be:

```typescript
{ type: "section", text: "No events yet. Create one to get started." }
```

Or even quieter:

```typescript
{ type: "section", text: "Create your first event." }
```

The absence of data is not a failure state. It is an invitation.

---

## Summary

| Dimension | Assessment |
|-----------|------------|
| Visual Hierarchy | Functional but uninspired. Technical details lead; human concepts follow. |
| Whitespace | Compressed where it should breathe. The code moves too fast. |
| Consistency | Strong in structure, weak in micro-patterns. Two extraction methods, two emoji vocabularies. |
| Craft | The fix works. But working is not the same as caring. Several moments of carelessness: parenthetical format hints, unexplained fallback values, type annotation noise. |

### The Core Tension

This work prioritizes *shipping* over *shaping*. Every decision was made to solve the immediate problem. No decision was made to create something beautiful that happens to solve the problem.

The fix is correct.
The code is adequate.
The documentation is thorough.

But none of it is *inevitable*.

When we make something truly right, it feels as though it could not have been made any other way. This work feels like it could have been made many ways, and this was simply one of them.

That is the gap.

---

*"Design is not just what it looks like and feels like. Design is how it works."*
*— But how it works should feel like it could not work any other way.*

