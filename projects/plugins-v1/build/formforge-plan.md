# FormForge: Debate + Plan

**Date**: 2026-04-05
**Issue**: #33 (Plugin: FormForge -- Form Builder)
**Status**: NOT STARTED

---

## Issue Summary

Drag-and-drop forms for EmDash. Contact, booking, surveys. Submissions to D1 + email. Spam protection, conditional logic, webhooks.

---

## Debate: Steve Jobs vs Elon Musk

### Round 1: Scope and Differentiation

**Steve Jobs (Design & Brand):**

The key question is: what does FormForge do that MemberShip's registration form builder does NOT? MemberShip already has custom fields (text, email, dropdown, checkbox, phone), multi-step wizard support, and submission handling. If we just rebuild that, we waste tokens and confuse site owners with two form systems.

FormForge must be the **general-purpose** form tool. MemberShip forms exist to collect membership data tied to a plan. FormForge forms exist for everything else: contact forms, booking requests, surveys, feedback, quote requests, job applications. The UX priority is a drag-and-drop builder that a non-technical site owner can use in under 2 minutes to create a contact form. That is the 80% use case.

The form-filling experience matters equally. Forms must feel native to the site's theme -- not like an embedded third-party widget. Inline validation, clear error states, mobile-first layout, and a confirmation experience that builds trust (not a generic "thank you" page).

**Elon Musk (Product & Engineering):**

Agreed on differentiation. MemberShip forms are tightly coupled to the membership pipeline -- they feed into member records, plans, and Stripe. FormForge is standalone. Submissions go to a generic store (KV, like everything else in EmDash) and optionally trigger email notifications and webhooks. No payment integration in v1.

The fastest technical path is to follow the exact same architecture as MemberShip and EventDash: `sandbox-entry.ts` handles all business logic via admin interactions, KV stores form definitions and submissions, Astro components render the public-facing forms. We do NOT need a visual drag-and-drop builder in v1 -- that implies a React-based admin UI with complex state management, which Emdash admin doesn't support yet. Instead, we use the same Block Kit pattern: admin interactions create/edit forms via structured commands, and the Astro component renders them.

What we DO need that MemberShip lacks:
1. **More field types** -- number, textarea, date, file upload (URL-based), radio buttons, hidden fields
2. **Conditional logic** -- show/hide fields based on other field values
3. **Spam protection** -- honeypot field + rate limiting (no CAPTCHA dependency in v1)
4. **Email notifications** -- send submission data to site owner via Resend
5. **Webhooks** -- POST submission data to external URLs (Zapier, Make, etc.)
6. **Submission management** -- admin can view, search, export submissions

**Steve Jobs:**

I accept the Block Kit approach for v1 -- drag-and-drop can come in v2 when the admin framework supports it. But I insist on two UX non-negotiables:

1. **Pre-built templates** -- contact form, booking request, feedback survey, quote request. Site owners should pick a template and customize, not build from scratch.
2. **Form styling that inherits the site theme** -- the Astro component must use CSS custom properties from the site's design tokens, not hardcoded styles.

**Elon Musk:**

Templates are cheap to implement -- they're just pre-defined FormDefinition objects. Agreed. Theme inheritance comes free from Astro component architecture since we use Tailwind classes that inherit from the site. No objection.

### Round 2: Architecture Decisions

**Steve Jobs:**

How do we handle file uploads? Local businesses need to accept resumes, photos, documents.

**Elon Musk:**

Not in v1. File uploads require either R2 storage integration or a third-party service. That is a Phase 2 feature. In v1, we support a "file" field type that accepts a URL -- the user pastes a link to their file on Google Drive, Dropbox, etc. This covers 80% of the use case without storage complexity.

Actually, scratch that. A URL field is confusing for non-technical users. Let's just omit file uploads entirely from v1. We ship: text, email, textarea, number, phone, date, dropdown, radio, checkbox, hidden. That is 10 field types, which is more than MemberShip's 5. File upload goes in Phase 2.

**Steve Jobs:**

Agreed. What about conditional logic? That is complex.

**Elon Musk:**

Simple conditional logic only. A field can have a `showWhen` rule: show this field when field X has value Y. Single condition, equals operator only. No nested logic, no AND/OR combinators. This covers the 80% case: "If you selected 'Other' in the dropdown, show the text field for details." Complex conditional logic is Phase 2.

**Steve Jobs:**

Acceptable. One more thing -- form analytics. Site owners need to know: how many submissions per form, submission rate over time, which forms get abandoned. Even basic counts.

**Elon Musk:**

Submission counts are trivial -- we store them with the form metadata. Abandonment tracking requires client-side analytics (tracking form opens vs submissions), which is doable in the Astro component with a simple KV counter. We can include basic analytics in v1: total submissions, submissions this week, last submission date. Conversion rate tracking (views vs submissions) goes in Phase 2.

### Consensus

| Decision | Resolution |
|----------|------------|
| Scope | General-purpose forms (NOT membership-specific) |
| Differentiation | More field types, conditional logic, spam protection, webhooks, templates |
| Field types (v1) | text, email, textarea, number, phone, date, dropdown, radio, checkbox, hidden |
| Conditional logic | Simple show/hide: one field, one condition, equals operator |
| Spam protection | Honeypot field + submission rate limiting per IP (KV-based) |
| File uploads | Phase 2 (requires R2 or external storage) |
| Visual drag-and-drop builder | Phase 2 (requires admin framework changes) |
| Email notifications | v1 -- send submission data to configurable email(s) via Resend |
| Webhooks | v1 -- POST JSON to configurable URL(s) on submission |
| Templates | v1 -- contact, booking, feedback, quote request |
| Analytics | v1 basic (submission count, last submission). Phase 2 conversion tracking |
| Architecture | Same pattern: sandbox-entry.ts + Astro components + KV storage |
| Multi-step forms | v1 -- reuse MemberShip's FormStep pattern |

---

## Build Plan

### Wave 1: Core Plugin Scaffold + Form CRUD (5 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 1.1 | Plugin scaffold | Dev | Create `plugins/formforge/` with `src/index.ts`, `src/sandbox-entry.ts`, `src/email.ts`, `src/astro/index.ts`, `package.json`, `tsconfig.json` | Plugin descriptor exports `formforgePlugin()` with id, version, entrypoint, capabilities. Matches MemberShip/EventDash pattern exactly. |
| 1.2 | Type definitions | Dev | Define all interfaces: `FormFieldDefinition` (10 types), `ConditionalRule`, `FormDefinition`, `FormSubmission`, `FormTemplate`, `WebhookEndpoint`, `FormSettings` | All types exported. `FormFieldDefinition` supports: text, email, textarea, number, phone, date, dropdown, radio, checkbox, hidden. `ConditionalRule` has `fieldId`, `operator: "equals"`, `value`. |
| 1.3 | Form CRUD handlers | Dev | Implement admin interaction handlers: `form.create`, `form.update`, `form.delete`, `form.get`, `form.list` | Forms stored in KV as `form:{id}`. Form list stored as `forms:list`. Create validates required fields (name, at least 1 field). Update merges fields. Delete removes form + all submissions. |
| 1.4 | Pre-built templates | Dev | Implement `form.createFromTemplate` handler with 4 templates: contact, booking, feedback, quote-request | Each template has sensible defaults (field labels, required flags, placeholders). Contact: name, email, subject, message. Booking: name, email, phone, date, time dropdown, notes. Feedback: name(optional), rating radio, comments. Quote: name, email, phone, service dropdown, budget dropdown, details. |
| 1.5 | Unit tests for Wave 1 | QA | Test form CRUD, template creation, validation edge cases | Minimum 15 tests. Cover: create with valid/invalid data, update existing/non-existent, delete cascade, list empty/populated, template creation for all 4 types. |

### Wave 2: Submission Engine + Spam Protection (5 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 2.1 | Submission handler | Dev | Implement `form.submit` handler: validate fields against form definition, store submission in KV | Submissions stored as `submission:{formId}:{id}`. Submission list per form: `submissions:{formId}:list`. Validates required fields, email format, phone format. Returns success with submission ID. |
| 2.2 | Conditional logic engine | Dev | Implement field visibility evaluation in submission handler | `showWhen` rule on any field: `{ fieldId, operator: "equals", value }`. Hidden fields are not required even if marked required. Submission strips values for hidden conditional fields. |
| 2.3 | Spam protection | Dev | Honeypot field + rate limiting | Honeypot: hidden field `_hp` -- if filled, reject silently (return fake success). Rate limit: max 5 submissions per IP per form per 15 minutes, tracked in KV with TTL. |
| 2.4 | Submission management | Dev | Admin handlers: `submissions.list`, `submissions.get`, `submissions.delete`, `submissions.export` | List with pagination (limit/offset). Export returns CSV string. Admin can view individual submission data. Delete removes single submission. |
| 2.5 | Unit tests for Wave 2 | QA | Test submission flow, conditional logic, spam protection, admin management | Minimum 20 tests. Cover: valid submission, missing required field, conditional field visibility, honeypot rejection, rate limiting, CSV export format, pagination. |

### Wave 3: Notifications + Webhooks + Astro Components (5 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 3.1 | Email notifications | Dev | Implement `src/email.ts`: submission notification template, send via Resend on form submit | Configurable recipient email(s) per form in `FormDefinition.notifyEmails`. Email includes all submitted field values in a clean HTML table. Uses Resend API via plugin capabilities. |
| 3.2 | Webhook system | Dev | Implement webhook dispatch on submission | `FormDefinition.webhooks`: array of `{ url, secret?, events }`. On submit, POST JSON payload with form ID, submission data, timestamp. HMAC-SHA256 signing if secret provided. Async fire-and-forget (no retry in v1). Log last fired + success/fail. |
| 3.3 | Public form Astro component | Dev | Create `src/astro/FormEmbed.astro` | Fetches form definition by ID. Renders all 10 field types with proper HTML inputs. Client-side validation (required, email, phone format). Conditional field show/hide via JS. Honeypot field rendered but hidden. Submit via fetch to plugin API. Success/error states. Mobile responsive. Inherits site theme via CSS custom properties. |
| 3.4 | Multi-step form support | Dev | Add step-based rendering to FormEmbed.astro | If `FormDefinition.steps` is defined, render as wizard with step indicators, next/back buttons, per-step validation. Reuse the same pattern as MemberShip's RegistrationForm.astro. |
| 3.5 | Unit + integration tests for Wave 3 | QA | Test email, webhooks, component rendering | Minimum 15 tests. Cover: email template rendering, webhook payload signing, webhook dispatch, Astro component prop validation. Mock Resend + fetch for webhook tests. |

### Wave 4: Analytics + Admin Dashboard + Polish (4 tasks)

| # | Task | Owner | Scope | Acceptance Criteria |
|---|------|-------|-------|-------------------|
| 4.1 | Form analytics | Dev | Track submission counts, update form metadata on each submission | `FormDefinition` gains: `totalSubmissions`, `submissionsThisWeek`, `lastSubmissionAt`. Admin widget: "Form Activity" showing top forms by submission count. |
| 4.2 | Admin pages | Dev | Add admin pages to plugin descriptor: `/forms` (list all forms), `/submissions` (view submissions) | Forms page shows all forms with submission counts, last activity. Click-through to submission list with search/filter. |
| 4.3 | Auto-response email | Dev | Optional auto-response email to form submitter | `FormDefinition.autoResponse`: `{ enabled, subject, body }`. If form has an email field and autoResponse is enabled, send confirmation to submitter. |
| 4.4 | Final QA + edge cases | QA | End-to-end testing, edge cases, security review | Test: XSS in field values (must be escaped), oversized submissions (reject > 50KB), form with 0 fields (reject), submission to deleted form (404), concurrent submissions. Minimum 10 tests. |

---

## KV Storage Schema

```
form:{id}                    -> FormDefinition JSON
forms:list                   -> string[] of form IDs
submission:{formId}:{id}     -> FormSubmission JSON
submissions:{formId}:list    -> string[] of submission IDs
form-analytics:{formId}      -> { total, thisWeek, lastAt } JSON
rate-limit:{formId}:{ip}     -> number (submission count, TTL 15min)
settings:formforge           -> FormSettings JSON (global config)
```

---

## Token Budget Estimate

| Wave | Estimated Tokens | Notes |
|------|-----------------|-------|
| Wave 1 | 100K | Scaffold + CRUD is well-patterned from existing plugins |
| Wave 2 | 120K | Submission engine + conditional logic needs careful implementation |
| Wave 3 | 150K | Astro component + email + webhooks is the heaviest wave |
| Wave 4 | 80K | Analytics + polish, mostly lightweight |
| **Total** | **450K** | Under 500K plugin budget cap |

---

## Phase 2 Backlog (NOT in v1)

- Visual drag-and-drop form builder (requires admin framework updates)
- File upload fields (requires R2 storage integration)
- Complex conditional logic (AND/OR, not-equals, contains, ranges)
- Payment fields (Stripe integration for paid forms)
- Conversion tracking (form views vs submissions)
- Webhook retry with exponential backoff
- Form versioning (track changes to form definitions)
- CAPTCHA integration (Turnstile or hCaptcha)
- Form duplication / cloning
- Submission data encryption at rest
