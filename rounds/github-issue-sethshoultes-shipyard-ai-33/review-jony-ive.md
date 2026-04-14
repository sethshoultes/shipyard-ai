# Design Review: Forge Form Builder Plugin

*A meditation on form and function.*

---

## Overview

Forge is a form builder. At its best, it should disappear—leaving only the conversation between creator and visitor. The question is whether these deliverables serve that invisibility, or whether they call attention to themselves.

Let me be direct: there is good work here. But good is not the same as inevitable.

---

## Visual Hierarchy

### What Works

**`types.ts`, lines 128-164** — The `CONTACT_FORM_TEMPLATE` is beautifully restrained. Three fields. Name, Email, Message. The hierarchy is self-evident: each field knows its place through `order: 0, 1, 2`. There is no competition for attention.

**`admin.ts`, lines 29-50** — The forms list page opens with a header, then actions, then content. This is correct. The most important thing—the list of forms—occupies the most space. The "Create New Form" button declares itself primary through a single attribute: `style: "primary"`. One word. That's enough.

### What Troubles Me

**`admin.ts`, lines 102-281** — The form editor page suffers from abundance. There are *five* distinct form sections:
- Form settings (lines 116-142)
- Theme settings (lines 148-172)
- "Ask something" input (lines 184-201)
- Submit settings (lines 233-255)
- Action buttons (lines 258-278)

Each section has a header. Each header has a divider before it. The visual rhythm becomes: content, divider, header, content, divider, header, content...

The eye has no resting place. Where should I look first? Everything is equally important, which means nothing is important.

**`admin.ts`, line 234** — The header "Submit Button & Success Message" is prosaic. It describes what it contains rather than what it means. Compare: "After They Submit" or simply "Completion." The current phrasing is functional. It is not beautiful.

---

## Whitespace

### What Works

**`field-type.ts`, lines 32-125** — The pattern rules are arranged with generous breathing room. Each rule is a discrete thought, separated by blank lines. The keywords array in the message pattern (lines 62-74) cascades down the page like water. You can read it.

**`email.ts`, lines 39-58** — The `buildTextBody` function creates its output with deliberate spacing:
```
New submission received
[blank]
---
[blank]
[fields]
[blank]
---
```

This structure will be felt by every person who receives these emails. It respects their time.

### What Troubles Me

**`admin.ts`, lines 293-336** — The `buildFieldBlock` function creates field editing forms with four inputs arranged sequentially: Label, Type, Placeholder, Required. These inputs are siblings, but they are not equal. Label and Type define the field's identity. Placeholder and Required are refinements.

Yet there is no visual distinction. No grouping. No suggestion that some choices are more consequential than others. The whitespace is uniform where it should be purposeful.

**`submissions.ts`, lines 264-329** — The `validateSubmission` function is dense. The switch statement spans 35 lines with minimal separation between cases. When you are validating someone's input—when you are about to tell them they've made a mistake—the code that makes that judgment should be crystal clear. Here, it is merely functional.

---

## Consistency

### What Works

**`types.ts`** — The interface naming is immaculate. `Form`, `FormField`, `FormTheme`, `Submission`. Each name is a noun. Each noun is singular. The pattern repeats: the thing, then modifiers to describe variations of the thing (`CreateFormInput`, `UpdateFormInput`).

**`forms.ts`, `submissions.ts`, `email.ts`** — All handlers follow the same contract:
1. Validate inputs
2. Perform operation
3. Log the result
4. Return the outcome

This consistency means a developer can read one file and understand all of them. That is rare. That is valuable.

**`admin.ts`** — Every table has the same column specification pattern:
```typescript
columns: [
  { key: "...", label: "..." },
  { key: "...", label: "...", format: "..." },
]
```
The structure is predictable. Predictability enables speed.

### What Troubles Me

**`types.ts`, line 9 vs line 17** — The `FieldType` union includes both `"textarea"` (lowercase, compound) and `"tel"` (abbreviation). One describes what the field is; the other describes the HTML input type it maps to. This inconsistency will propagate everywhere these types appear.

Should it be `"longtext"` and `"phone"`? Or `"textarea"` and `"tel"`? Either convention is defensible. But you must choose one.

**`admin.ts`** — Action buttons use inconsistent confirmation patterns:

- Line 83-89: Delete form has a confirmation with title, text, confirm, deny
- Line 326-333: Remove field has identical structure
- Line 389-395: Delete selected (submissions) has the same structure
- Line 419-425: Delete submission has *only* icon and style—no confirmation

The last case is dangerous. Deleting a submission is irreversible, yet it requires only a single click. The pattern breaks precisely where it should be strongest.

---

## Craft

### What Rewards Close Inspection

**`email.ts`, lines 64-118** — The HTML email template is genuinely beautiful. The gradient header (line 89) adapts to the form's primary color. The `adjustColor` function (lines 137-149) calculates a darker shade mathematically, ensuring the gradient always has sufficient contrast.

The table cells have considered padding: `12px`. The border color (`#e5e7eb`) is the exact gray that disappears against white while still providing structure. The footer is set in 12px type at `#9ca3af`—present but unobtrusive. This is the work of someone who cares.

**`field-type.ts`, lines 142-185** — The `extractLabelFromPrompt` function handles natural language with unexpected grace:

```typescript
const questionPrefixes = [
  "what is your",
  "what's your",
  "whats your",  // Note: handles typo
  ...
]
```

Line 149 acknowledges that people misspell things. The system accommodates human imperfection without comment. This is hospitality encoded in software.

**`forms.ts`, lines 23-29** — The `generateSlug` function is three lines of quiet competence:
```typescript
return name
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .slice(0, 50);
```

Every edge case is handled. Leading dashes. Trailing dashes. Excessive length. No comments are needed because the code explains itself.

### What Disappoints Upon Inspection

**`types.ts`, lines 170-172** — The default theme is defined as:
```typescript
export const DEFAULT_THEME: FormTheme = {
  primaryColor: "#3B82F6", // Blue-500
};
```

The comment `// Blue-500` references Tailwind's naming convention. But this is a standalone plugin. Why does it speak in another system's vocabulary? The color should explain itself: `// A confident, accessible blue` or simply nothing at all.

**`submissions.ts`, lines 14-18** — The ID generation function:
```typescript
function generateSubmissionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `sub_${timestamp}${random}`;
}
```

The prefix `sub_` is functional but joyless. Compare to `forms.ts`, line 40, which uses `form_`. The system works, but it reads like a database schema rather than something a human would write. What if submissions were `response_`? The word "response" acknowledges that a person did something; "submission" sounds like paperwork.

**`admin.ts`, lines 574-586** — The stats widget:
```typescript
stats: [
  { label: "Total Forms", value: String(totalForms) },
  { label: "Total Submissions", value: String(totalSubmissions) },
  { label: "Last 7 Days", value: String(recentSubmissionCount) },
]
```

"Total Forms" and "Total Submissions" begin with the same word. This creates visual redundancy. Consider: "Forms Created," "Responses Received," "This Week." Each label is now distinct at a glance.

---

## To Make It Quieter but More Powerful

### 1. Consolidate the Editor

**`admin.ts`, lines 102-281** should become three sections, not five:

1. **Identity** (name, description, slug)
2. **Fields** (the "ask something" input and field list)
3. **Presentation** (theme, submit button, success message)

Reduce dividers. Let the sections breathe through whitespace alone. The header "Submit Button & Success Message" becomes simply "After Submission."

### 2. Elevate the Primary Action

**`admin.ts`, line 265** — "Save Draft" should not be the primary button. The primary action is to make the form live. Consider:

```typescript
{
  type: "button",
  text: form?.published ? "Update" : "Publish",
  action_id: "save_and_publish",
  style: "primary",
},
{
  type: "button",
  text: "Save Draft",
  action_id: "save_form",
},
```

The most important action should require the least effort.

### 3. Humanize the Vocabulary

**`types.ts`, line 95** — Rename `Submission` to `Response`. A submission is what the system receives; a response is what a person gives. The distinction matters.

**`submissions.ts`, line 17** — Change `sub_` to `resp_`.

**`admin.ts`, line 349** — The header "Submissions" becomes "Responses."

### 4. Add Confirmation Consistency

**`admin.ts`, lines 419-425** — The inline delete action for submissions must have a confirmation dialog. Silence before destruction is not efficiency; it is carelessness.

### 5. Simplify the Theme

**`types.ts`, lines 55-60** — The theme has only two properties: `primaryColor` and `logoUrl`. This is correct. But the admin UI (**`admin.ts`, lines 148-172**) presents these as two separate text inputs in a form section with its own header.

Consider: a single color picker inline with the form name. The logo can be uploaded via the media library (if one exists) or removed entirely. Most forms don't need logos. The interface should reflect this reality.

### 6. Let the Fields Speak

**`admin.ts`, lines 214-228** — When displaying existing fields, the context text reads:
```
"3 fields - drag to reorder"
```

This is instructional. It is not confident. Consider removing the instruction entirely. If the fields can be dragged, they will reveal this through their affordances—a handle, a cursor change, a subtle shadow on hover. Trust the user to discover.

---

## Conclusion

Forge is competent work. The architecture is sound. The patterns are consistent. The email template is genuinely beautiful.

But competence is the floor, not the ceiling.

The opportunity here is to make form creation feel inevitable—as though the form that emerges is the only form that *could* have emerged from the creator's intent. This requires reducing options, not adding them. It requires hierarchy so clear that no labels are needed. It requires confidence in every interaction.

The bones are good. Now: remove everything that isn't bone.

---

*"Design is not just what it looks like and feels like. Design is how it works."*

— Reviewed in the spirit of relentless refinement
