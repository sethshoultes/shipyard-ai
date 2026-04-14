# Phase 1 Plan — Forge v1 MVP Refactor

**Generated:** 2026-04-14
**Project Slug:** github-issue-sethshoultes-shipyard-ai-33
**Requirements:** .planning/REQUIREMENTS.md
**Total Tasks:** 14
**Waves:** 4

---

## The Essence

From decisions.md:

> **North Star:** Type a question. Get a form field. No friction.

> **Perfection point:** The first 30 seconds — "Ask something" → field appears like magic.

> **Mantra:** "Ship small. Ship beautiful. Ship now."

---

## Problem Statement

FormForge plugin exists at 1,289 lines but:
1. **Uses KV storage** — Decisions mandate D1 (SQLite) for all persistent data
2. **Has v2 features** — Webhooks, HMAC, conditional logic, analytics must be cut
3. **Missing "Ask something"** — Core differentiator not implemented
4. **Plugin spec violations** — definePlugin() missing id, version, storage, admin fields
5. **Wrong product name** — Code says "FormForge", should be "Forge"

**Technical Reference:** docs/EMDASH-GUIDE.md Section 6 (Plugin System, lines 1066-1157) defines correct patterns.

---

## Requirements Traceability

| Requirement | Task(s) | Wave |
|-------------|---------|------|
| R-001: Rename to "Forge" | phase-1-task-1 | 1 |
| R-021, R-022: Fix plugin spec compliance | phase-1-task-2 | 1 |
| C-001 to C-011: Remove cut features | phase-1-task-3 | 1 |
| R-002, R-003, R-013: Migrate to D1 storage | phase-1-task-4 | 2 |
| R-004 to R-010: "Ask something" inference | phase-1-task-5 | 2 |
| R-011, R-012: Form CRUD with 7 field types | phase-1-task-6 | 2 |
| R-014, R-023: Email notifications + validation | phase-1-task-7 | 2 |
| R-015: CSV export | phase-1-task-8 | 2 |
| R-016: Contact template only | phase-1-task-9 | 3 |
| R-017 to R-020: Theme customization | phase-1-task-10 | 3 |
| R-024, R-025: Field type override UI | phase-1-task-11 | 3 |
| Test suite update | phase-1-task-12 | 3 |
| Build verification | phase-1-task-13 | 4 |
| Commit & document | phase-1-task-14 | 4 |

---

## Wave Execution Order

### Wave 1 (Parallel) — Code Cleanup & Plugin Compliance

Remove banned features and fix Emdash plugin compliance. Can run in parallel.

```xml
<task-plan id="phase-1-task-1" wave="1">
  <title>Rename FormForge to Forge throughout codebase</title>
  <requirement>R-001</requirement>
  <description>
    Per Decision 1: Product name is "Forge" (single word, active verb).
    "FormForge sounds like enterprise software from 2008."
    Replace all references: plugin ID, comments, UI strings, CSS classes.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Plugin descriptor - id field" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Main plugin file" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/admin-ui.ts" reason="CSS classes use .formforge__" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/email.ts" reason="Email template branding" />
  </context>

  <steps>
    <step order="1">Search for all "formforge" (case-insensitive) references</step>
    <step order="2">In index.ts: change id from "formforge" to "forge"</step>
    <step order="3">In sandbox-entry.ts: update KV key prefixes from "form:" to "forge:"</step>
    <step order="4">In admin-ui.ts: rename CSS class prefix from ".formforge__" to ".forge__"</step>
    <step order="5">In email.ts: update any branding references to "Forge"</step>
    <step order="6">Update package.json name from "@shipyard/formforge" to "@shipyard/forge"</step>
    <step order="7">Rename directory from plugins/formforge to plugins/forge</step>
  </steps>

  <verification>
    <check type="test">grep -ri "formforge" plugins/forge/ returns 0 results</check>
    <check type="test">grep -r '"forge"' plugins/forge/src/index.ts shows plugin id</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>chore(forge): rename from FormForge to Forge per branding decision</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-2" wave="1">
  <title>Fix definePlugin() to match Emdash specification</title>
  <requirement>R-021, R-022</requirement>
  <description>
    Per EMDASH-GUIDE.md Section 6 (lines 1086-1157):
    definePlugin() must include id, version, storage, admin, hooks, routes.
    Plugin descriptor must include adminEntry field.
    Current code is missing these critical fields.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/index.ts" reason="Descriptor missing adminEntry" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="definePlugin missing id, version, storage, admin" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="Section 6: Plugin specification" />
  </context>

  <steps>
    <step order="1">Read current index.ts descriptor</step>
    <step order="2">Remove non-spec fields: format, capabilities, options</step>
    <step order="3">Add adminEntry field: "@shipyard/forge/admin"</step>
    <step order="4">In sandbox-entry.ts definePlugin():
      - Add id: "forge"
      - Add version: "1.0.0"
      - Add storage: {} (empty, using D1 directly)
      - Add admin: { settingsSchema: {...}, pages: [...], widgets: [...] }</step>
    <step order="5">Move admin pages/widgets from descriptor to runtime admin block</step>
    <step order="6">Add plugin:install hook for email validation (R-023 prerequisite)</step>
  </steps>

  <verification>
    <check type="test">grep "id:" plugins/forge/src/sandbox-entry.ts shows "forge"</check>
    <check type="test">grep "adminEntry:" plugins/forge/src/index.ts shows path</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>fix(forge): align plugin structure with EMDASH-GUIDE.md Section 6</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-3" wave="1">
  <title>Remove all features cut from v1</title>
  <requirement>C-001 through C-011</requirement>
  <description>
    Per Decision 7 "Features to CUT from v1", remove:
    - Conditional logic (showWhen, isFieldVisible) - C-002
    - Multi-step forms (steps property) - C-001
    - Webhooks + HMAC signing - C-003, C-004
    - Auto-response emails - C-006
    - Analytics routes + snapshots - C-005
    - Extra templates (booking, feedback, quote-request) - C-007

    Target removal: ~400 lines
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Contains all cut features" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/email.ts" reason="Auto-response functions" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-33/decisions.md" reason="Feature cut list" />
  </context>

  <steps>
    <step order="1">Remove ConditionalRule interface (lines 34-38)</step>
    <step order="2">Remove showWhen property from FormFieldDefinition (line 48)</step>
    <step order="3">Remove isFieldVisible function (lines 209-216)</step>
    <step order="4">Remove visibility check in submitForm (lines 668-675)</step>
    <step order="5">Remove steps property from FormDefinition (line 62)</step>
    <step order="6">Remove WebhookEndpoint interface (lines 51-55)</step>
    <step order="7">Remove computeHmacSignature function (lines 340-353)</step>
    <step order="8">Remove dispatchWebhooks function (lines 355-410)</step>
    <step order="9">Remove webhookTest route (lines 804-877)</step>
    <step order="10">Remove webhooks property from FormDefinition and updateForm</step>
    <step order="11">Remove autoResponse from FormDefinition and submitForm (lines 761-790)</step>
    <step order="12">Remove auto-response functions from email.ts (lines 128-195)</step>
    <step order="13">Remove AnalyticsSnapshot interface and related functions (lines 284-302)</step>
    <step order="14">Remove formAnalytics route (lines 1031-1112)</step>
    <step order="15">Remove dashboardAnalytics route (lines 1114-1175)</step>
    <step order="16">Keep ONLY contact template in getTemplate function (lines 155-203)</step>
  </steps>

  <verification>
    <check type="test">grep -r "showWhen\|ConditionalRule" plugins/forge/src/ returns 0</check>
    <check type="test">grep -r "WebhookEndpoint\|computeHmacSignature" plugins/forge/src/ returns 0</check>
    <check type="test">grep -r "autoResponse" plugins/forge/src/ returns 0</check>
    <check type="test">grep -r "formAnalytics\|dashboardAnalytics" plugins/forge/src/ returns 0</check>
    <check type="manual">wc -l sandbox-entry.ts shows ~900 lines (down from 1289)</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <!-- Wave 1: no dependencies -->
  </dependencies>

  <commit-message>feat(forge): strip v2 features per decisions.md scope lock</commit-message>
</task-plan>
```

---

### Wave 2 (Parallel, after Wave 1) — Core Feature Implementation

Implement D1 migration, field inference, and core functionality.

```xml
<task-plan id="phase-1-task-4" wave="2">
  <title>Migrate storage from KV to D1 (SQLite)</title>
  <requirement>R-002, R-003, R-013</requirement>
  <description>
    Per Decision 2: "D1 (SQLite) for all persistent data — not KV"
    Elon's position: "KV creates N+1 queries. 50 forms = 51 reads. No indexing."

    Create D1 schema and migrate all ctx.kv calls to D1 queries.
    Rate limiting can stay in KV (TTL-based).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Contains all KV storage calls" />
    <file path="/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md" reason="D1 configuration pattern (lines 726-750)" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="D1 schema specification" />
  </context>

  <steps>
    <step order="1">Create migrations/0001_initial.sql with schema:
      - forge_forms table (id, name, description, fields JSON, notify_emails JSON, primary_color, logo_url, created_at, updated_at)
      - forge_submissions table (id, form_id, data JSON, submitted_at, ip)
      - Indexes on form_id and submitted_at</step>
    <step order="2">Create src/db/queries.ts with type-safe D1 query functions:
      - getForm(db, id) → Form | null
      - listForms(db) → Form[]
      - saveForm(db, form) → void
      - deleteForm(db, id) → void
      - getSubmissions(db, formId, limit, offset) → Submission[]
      - saveSubmission(db, submission) → void
      - getSubmissionCount(db, formId) → number</step>
    <step order="3">Update sandbox-entry.ts routes to use D1 queries instead of ctx.kv</step>
    <step order="4">Remove getFormFromKV, getFormList, saveForm KV helpers (lines 222-258)</step>
    <step order="5">Remove getSubmissionList, submission KV helpers (lines 260-267)</step>
    <step order="6">Keep rate limiting in KV: rate-limit:{formId}:{ip}</step>
    <step order="7">Access D1 via ctx.env.DB (per EMDASH-GUIDE.md wrangler.jsonc pattern)</step>
  </steps>

  <verification>
    <check type="test">grep "ctx.kv.get.*form:" plugins/forge/src/ returns 0 results</check>
    <check type="test">grep "ctx.kv.get.*submission:" plugins/forge/src/ returns 0 results</check>
    <check type="test">grep "ctx.env.DB" plugins/forge/src/sandbox-entry.ts shows D1 usage</check>
    <check type="build">npx tsc --noEmit passes</check>
    <check type="test">migrations/0001_initial.sql exists and is valid SQL</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin renamed first" />
    <depends-on task-id="phase-1-task-3" reason="Cut features removed first" />
  </dependencies>

  <commit-message>feat(forge): migrate from KV to D1 storage per Decision 2</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-5" wave="2">
  <title>Implement "Ask something" field type inference</title>
  <requirement>R-004 through R-010</requirement>
  <description>
    Per Decision 3: "This is the entire product thesis."
    The magic moment: type a question, get a field type suggestion.

    Pattern matching ONLY (per Risk Register: "HARD STOP: no ML, no LLM").
    Keywords → field types with clear override capability.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Pattern matching specification" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-33/decisions.md" reason="Decision 3: First 30 Seconds" />
  </context>

  <steps>
    <step order="1">Create src/inference/field-type.ts</step>
    <step order="2">Implement inferFieldType(question: string): InferredFieldType
      - email patterns: "email", "e-mail", "mail address" → 'email'
      - phone patterns: "phone", "tel", "mobile", "cell" → 'tel'
      - number patterns: "number", "amount", "quantity", "age" → 'number'
      - textarea patterns: "message", "comment", "feedback", "describe", "details" → 'textarea'
      - date patterns: "date", "when", "day" → 'date'
      - default: everything else → 'text'</step>
    <step order="3">Add new route: inferFieldType
      - Input: { question: string }
      - Output: { suggestedType: InferredFieldType, confidence: 'high' | 'low' }</step>
    <step order="4">Integrate with form creation flow</step>
    <step order="5">Keep function under 30 lines (per decisions: "simple heuristics first")</step>
  </steps>

  <verification>
    <check type="test">inferFieldType("What is your email?") returns 'email'</check>
    <check type="test">inferFieldType("What's your name?") returns 'text'</check>
    <check type="test">inferFieldType("Phone number?") returns 'tel'</check>
    <check type="test">inferFieldType("Tell us about yourself") returns 'textarea'</check>
    <check type="test">wc -l src/inference/field-type.ts shows <30 lines</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Plugin renamed first" />
  </dependencies>

  <commit-message>feat(forge): implement "Ask something" pattern matching per Decision 3</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-6" wave="2">
  <title>Verify Form CRUD with seven field types</title>
  <requirement>R-011, R-012</requirement>
  <description>
    Verify Form CRUD operations work correctly after D1 migration.
    Ensure all seven v1 field types are supported:
    text, email, number, textarea, select, checkbox, radio

    Remove "hidden", "phone", "date", "dropdown" type names — consolidate.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Form CRUD routes" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-012 field types" />
  </context>

  <steps>
    <step order="1">Update FieldType union to match MVP:
      type FieldType = 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'</step>
    <step order="2">Remove deprecated types: 'hidden', 'phone', 'date', 'dropdown'</step>
    <step order="3">Map tel → text with validation (phone input can be text with pattern)</step>
    <step order="4">Verify createForm route validates field types</step>
    <step order="5">Verify updateForm route handles field type changes</step>
    <step order="6">Verify getForm and listForms return correct data from D1</step>
    <step order="7">Verify deleteForm cascades to submissions (ON DELETE CASCADE)</step>
  </steps>

  <verification>
    <check type="test">createForm with valid field types succeeds</check>
    <check type="test">createForm with invalid field type fails with error</check>
    <check type="test">updateForm preserves existing submissions</check>
    <check type="test">deleteForm removes form and all submissions</check>
    <check type="build">npx tsc --noEmit passes</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="D1 migration must complete" />
  </dependencies>

  <commit-message>fix(forge): consolidate field types to v1 MVP set</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-7" wave="2">
  <title>Verify admin email notifications with startup validation</title>
  <requirement>R-014, R-023</requirement>
  <description>
    Per MVP Feature Set: "Admin Email Notification — One email per submission to form owner"
    Per Risk Assessment: "If RESEND_API_KEY is missing, form submissions still succeed BUT notifications don't send"

    Add startup validation to warn if email not configured.
    Keep email sending graceful (don't fail submission if email fails).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/email.ts" reason="Email sending logic" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Submission handler calls email" />
  </context>

  <steps>
    <step order="1">In plugin:install hook, validate email configuration:
      if (!ctx.env?.RESEND_API_KEY) ctx.log.error("Forge: RESEND_API_KEY not configured")
      if (!ctx.env?.FORM_FROM_EMAIL) ctx.log.error("Forge: FORM_FROM_EMAIL not configured")
      Store status in KV: forge:email-configured = "true" | "false"</step>
    <step order="2">Update sendEmail to check config before attempting send</step>
    <step order="3">In submitForm, keep fire-and-forget pattern for email (don't block submission)</step>
    <step order="4">Add admin-visible indicator for email configuration status</step>
    <step order="5">Remove auto-response email sending (already cut in task-3)</step>
    <step order="6">Verify notification email HTML uses Forge branding</step>
  </steps>

  <verification>
    <check type="test">plugin:install logs error when RESEND_API_KEY missing</check>
    <check type="test">Submission succeeds even when email fails</check>
    <check type="test">Notification email contains form name and field values</check>
    <check type="manual">Admin can see email configuration status</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-2" reason="Plugin hooks must be added" />
  </dependencies>

  <commit-message>fix(forge): add email configuration validation at startup</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-8" wave="2">
  <title>Verify CSV export functionality</title>
  <requirement>R-015</requirement>
  <description>
    Per Decision 7 CSV Export Resolution: "Include basic CSV export"
    Steve's argument: "When an admin can't export to Excel, they feel trapped"

    Verify exportSubmissions route works with D1 data source.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="exportSubmissions route" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="R-015 specification" />
  </context>

  <steps>
    <step order="1">Update exportSubmissions to use D1 queries instead of KV</step>
    <step order="2">Verify CSV generation handles:
      - Fields with commas
      - Fields with quotes
      - Fields with newlines
      - Empty fields</step>
    <step order="3">Verify CSV headers match form field labels</step>
    <step order="4">Add Submission ID and Submitted At columns</step>
    <step order="5">Verify proper escaping: "val" → """val"""</step>
    <step order="6">Verify response Content-Type is text/csv</step>
  </steps>

  <verification>
    <check type="test">Export with 0 submissions returns header row only</check>
    <check type="test">Export with commas in values properly escapes</check>
    <check type="test">Export with quotes in values properly escapes</check>
    <check type="manual">Downloaded CSV opens correctly in Excel</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="D1 migration must complete" />
  </dependencies>

  <commit-message>fix(forge): update CSV export for D1 storage</commit-message>
</task-plan>
```

---

### Wave 3 (Parallel, after Wave 2) — Polish & Testing

```xml
<task-plan id="phase-1-task-9" wave="3">
  <title>Reduce templates to Contact Form only</title>
  <requirement>R-016</requirement>
  <description>
    Per Decision 6: "One template: Contact Form only"
    Elon's position: "One form that works. Add templates when users ask twice."

    Remove booking, feedback, quote-request templates.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="getTemplate function" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-33/decisions.md" reason="Decision 6" />
  </context>

  <steps>
    <step order="1">In getTemplate function, keep ONLY 'contact' template</step>
    <step order="2">Remove booking template definition</step>
    <step order="3">Remove feedback template definition</step>
    <step order="4">Remove quote-request template definition</step>
    <step order="5">Update createFromTemplate error message to only mention 'contact'</step>
    <step order="6">Verify contact template has: name, email, subject, message fields</step>
  </steps>

  <verification>
    <check type="test">getTemplate("contact") returns template</check>
    <check type="test">getTemplate("booking") returns null</check>
    <check type="test">createFromTemplate with "contact" succeeds</check>
    <check type="test">createFromTemplate with "booking" fails with helpful error</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Cut features removed first" />
  </dependencies>

  <commit-message>feat(forge): reduce to single Contact Form template per Decision 6</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-10" wave="3">
  <title>Implement theme customization (color + logo only)</title>
  <requirement>R-017, R-018, R-019, R-020</requirement>
  <description>
    Per Decision 5: "Two fields only: primary color and logo"
    Steve's position: "The moment we add font dropdowns, we've lost. Constraints create confidence."

    Add primary_color and logo_url to form schema.
    Apply to form renderer output.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/sandbox-entry.ts" reason="Form definition and rendering" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/admin-ui.ts" reason="Admin form editor" />
  </context>

  <steps>
    <step order="1">Add to FormDefinition interface:
      primaryColor?: string;  // Default #C4704B
      logoUrl?: string;</step>
    <step order="2">Add to D1 schema (already in migrations task)</step>
    <step order="3">Update createForm to accept primaryColor and logoUrl</step>
    <step order="4">Update updateForm to modify theme settings</step>
    <step order="5">Add admin UI fields for color picker and logo upload</step>
    <step order="6">In form renderer, inject CSS custom properties:
      --forge-primary: {primaryColor};
      Apply to buttons, links, focus states</step>
    <step order="7">In form renderer, display logo if configured</step>
    <step order="8">DO NOT add: font selection, background colors, border styles</step>
  </steps>

  <verification>
    <check type="test">Form with custom primaryColor renders with that color</check>
    <check type="test">Form with logoUrl displays logo</check>
    <check type="test">Default color is #C4704B (Terracotta)</check>
    <check type="manual">Admin UI shows color picker and logo upload only</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-4" reason="D1 schema must include theme fields" />
  </dependencies>

  <commit-message>feat(forge): add theme customization (color + logo per Decision 5)</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-11" wave="3">
  <title>Add field type override UI</title>
  <requirement>R-024, R-025</requirement>
  <description>
    Per Risk Register: "Clear override UI. 'Click to change field type' always visible."
    After inference suggests a type, user must be able to easily change it.
    Pattern matching won't be perfect; override is essential.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/admin-ui.ts" reason="Admin form editor" />
    <file path="/home/agent/shipyard-ai/rounds/github-issue-sethshoultes-shipyard-ai-33/decisions.md" reason="Risk Register" />
  </context>

  <steps>
    <step order="1">In form field editor UI:
      - Show inferred type with subtle highlight
      - Display "Change type" link/button
      - Clicking reveals dropdown with all 7 field types</step>
    <step order="2">When type is changed:
      - Update field.type immediately
      - Remove any type-specific options (e.g., select options if changing from select)</step>
    <step order="3">Visual feedback:
      - Inferred types show "Suggested" badge
      - User-changed types show no badge (confirmed)</step>
    <step order="4">Persist user override (don't re-infer on form edit)</step>
    <step order="5">Accessible: dropdown is keyboard-navigable</step>
  </steps>

  <verification>
    <check type="manual">Inferred field shows "Suggested" indicator</check>
    <check type="manual">Click "Change type" reveals dropdown</check>
    <check type="manual">Selecting new type updates immediately</check>
    <check type="manual">Re-editing form preserves user's type choice</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-5" reason="Field inference must be implemented" />
  </dependencies>

  <commit-message>feat(forge): add field type override UI per Risk Register</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-12" wave="3">
  <title>Update test suite for v1 scope</title>
  <requirement>All requirements</requirement>
  <description>
    Update test suite to match v1 MVP scope.
    Remove tests for cut features.
    Add tests for new features (inference, D1 storage, theme).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/__tests__/sandbox-entry.test.ts" reason="Main test file" />
    <file path="/home/agent/shipyard-ai/plugins/formforge/src/__tests__/email.test.ts" reason="Email tests" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Test requirements" />
  </context>

  <steps>
    <step order="1">Remove tests for cut features:
      - Webhook tests
      - HMAC signature tests
      - Auto-response email tests
      - Analytics tests
      - Conditional logic tests
      - Multi-step form tests</step>
    <step order="2">Add tests for field type inference:
      - Test each keyword pattern
      - Test default fallback to text
      - Test edge cases (empty string, special chars)</step>
    <step order="3">Update storage tests for D1:
      - Mock D1 database
      - Test CRUD operations
      - Test submission storage</step>
    <step order="4">Add tests for theme customization:
      - Test primaryColor default
      - Test logoUrl storage</step>
    <step order="5">Keep tests for:
      - Form CRUD
      - Submission handling
      - CSV export
      - Email notification (mocked)</step>
    <step order="6">Run full test suite: npm run test</step>
  </steps>

  <verification>
    <check type="test">npm run test passes all tests</check>
    <check type="test">No tests reference removed features</check>
    <check type="test">Coverage includes inference, D1, theme</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-3" reason="Cut features must be removed" />
    <depends-on task-id="phase-1-task-4" reason="D1 migration must be complete" />
    <depends-on task-id="phase-1-task-5" reason="Inference must be implemented" />
  </dependencies>

  <commit-message>test(forge): update test suite for v1 MVP scope</commit-message>
</task-plan>
```

---

### Wave 4 (Sequential, after Wave 3) — Verification & Ship

```xml
<task-plan id="phase-1-task-13" wave="4">
  <title>Build verification and final QA</title>
  <requirement>All requirements</requirement>
  <description>
    Final verification before committing. Run all checks, verify scope,
    ensure no regressions. Gate before ship.
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/forge/" reason="All plugin files" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Acceptance criteria" />
  </context>

  <steps>
    <step order="1">Run TypeScript check: npx tsc --noEmit</step>
    <step order="2">Run tests: npm run test</step>
    <step order="3">Grep verification (all should return 0 results):
      - grep -r "formforge" plugins/forge/ (should be 0)
      - grep -r "showWhen\|ConditionalRule" plugins/forge/
      - grep -r "WebhookEndpoint\|dispatchWebhooks" plugins/forge/
      - grep -r "autoResponse" plugins/forge/
      - grep -r "formAnalytics\|dashboardAnalytics" plugins/forge/
      - grep -r "ctx.kv.get.*form:" plugins/forge/
      - grep -r "ctx.kv.get.*submission:" plugins/forge/</step>
    <step order="4">Positive verification (should find results):
      - grep "id: \"forge\"" plugins/forge/src/sandbox-entry.ts
      - grep "ctx.env.DB" plugins/forge/src/ (D1 usage)
      - grep "inferFieldType" plugins/forge/src/</step>
    <step order="5">Count lines: wc -l plugins/forge/src/sandbox-entry.ts (target: ~1,200)</step>
    <step order="6">Review git diff for all changes</step>
  </steps>

  <verification>
    <check type="build">npx tsc --noEmit exits 0</check>
    <check type="test">npm run test exits 0</check>
    <check type="test">All grep verifications pass</check>
    <check type="manual">Git diff shows expected scope</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-1" reason="Rename complete" />
    <depends-on task-id="phase-1-task-2" reason="Plugin spec complete" />
    <depends-on task-id="phase-1-task-3" reason="Cut features complete" />
    <depends-on task-id="phase-1-task-4" reason="D1 migration complete" />
    <depends-on task-id="phase-1-task-5" reason="Inference complete" />
    <depends-on task-id="phase-1-task-12" reason="Tests updated" />
  </dependencies>

  <commit-message>N/A — verification only, no commit</commit-message>
</task-plan>
```

```xml
<task-plan id="phase-1-task-14" wave="4">
  <title>Commit changes and document for human QA</title>
  <requirement>All requirements</requirement>
  <description>
    Commit all changes with semantic commit message.
    Document what needs human QA (Emdash integration, email delivery).
  </description>

  <context>
    <file path="/home/agent/shipyard-ai/plugins/forge/" reason="All plugin files to commit" />
    <file path="/home/agent/shipyard-ai/.planning/REQUIREMENTS.md" reason="Human QA checklist" />
  </context>

  <steps>
    <step order="1">Stage all changed files:
      git add plugins/forge/
      git add .planning/REQUIREMENTS.md
      git add .planning/phase-1-plan.md</step>
    <step order="2">Commit with message per template below</step>
    <step order="3">Create handoff document in .planning/:
      - Features removed (webhooks, analytics, conditional logic, etc.)
      - Features added ("Ask something", D1 storage, theme customization)
      - Environment variables required (RESEND_API_KEY, FORM_FROM_EMAIL)
      - Human QA checklist from REQUIREMENTS.md</step>
    <step order="4">Update STATUS.md with Forge build status</step>
    <step order="5">Do NOT push — wait for human review</step>
  </steps>

  <verification>
    <check type="test">git log --oneline -1 shows expected commit message</check>
    <check type="test">git status shows clean working tree</check>
    <check type="manual">Handoff document exists</check>
  </verification>

  <dependencies>
    <depends-on task-id="phase-1-task-13" reason="Verification must pass" />
  </dependencies>

  <commit-message>feat(forge): v1 MVP — D1 storage, "Ask something" inference, theme customization

BREAKING CHANGE: Renamed from FormForge to Forge
BREAKING CHANGE: Storage migrated from KV to D1 (requires migration)

Features added:
- "Ask something" pattern matching for field type inference (Decision 3)
- D1 (SQLite) storage for forms and submissions (Decision 2)
- Theme customization: primary color + logo (Decision 5)
- Email configuration validation at startup

Features removed (defer to v2):
- Conditional logic / showWhen
- Multi-step forms
- Webhooks + HMAC signing
- Auto-response emails
- Analytics dashboard
- Extra templates (booking, feedback, quote-request)

Per decisions.md: "Ship small. Ship beautiful. Ship now."

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com></commit-message>
</task-plan>
```

---

## Risk Notes

From Risk Scanner analysis:

1. **CRITICAL: Emdash Integration** — Plugin spec violations must be fixed (task-2). Test on real Emdash instance before ship.
2. **CRITICAL: Email Configuration** — Silent failures if RESEND_API_KEY missing. Mitigated by startup validation (task-7).
3. **HIGH: D1 Migration** — Major refactor from KV to D1. Thorough testing required.
4. **MEDIUM: Pattern Matching** — "Ask something" inference may not feel magical. Override UI essential (task-11).

---

## Summary

| Wave | Tasks | Description |
|------|-------|-------------|
| Wave 1 (Parallel) | 3 tasks | Rename, plugin spec, cut features |
| Wave 2 (Parallel) | 5 tasks | D1 migration, inference, CRUD, email, CSV |
| Wave 3 (Parallel) | 4 tasks | Templates, theme, override UI, tests |
| Wave 4 (Sequential) | 2 tasks | Verification and commit |
| **Total** | **14 tasks** | |

**Critical Path:** Wave 1 → Wave 2 → Wave 3 → Wave 4

**Parallelization:**
- Wave 1: All 3 tasks can run in parallel
- Wave 2: All 5 tasks can run in parallel (with dependencies)
- Wave 3: All 4 tasks can run in parallel (with dependencies)
- Wave 4: Sequential

---

## Human QA Required (Post-Execution)

Per REQUIREMENTS.md and decisions.md:

1. [ ] Test against real Emdash instance (B-001)
2. [ ] Email delivery verification with Resend (B-002)
3. [ ] "Ask something" experience feels magical
4. [ ] Mobile responsiveness
5. [ ] Form creation and submission end-to-end

---

## Scope Lock

Per decisions.md, the following are **EXPLICITLY NOT IN v1 MVP**:

- Multi-step forms (C-001)
- Conditional logic (C-002)
- Webhooks (C-003)
- HMAC signing (C-004)
- Analytics dashboards (C-005)
- Auto-response emails (C-006)
- Multiple templates (C-007)
- Migration tools (C-008)
- Integrations menu (C-009)
- AI/ML inference (C-010)
- Font customization (C-011)

**If it's not in this plan, it's out of scope.**

---

*Generated by Great Minds Agency — Phase Planning (GSD-Style)*
*2026-04-14*
