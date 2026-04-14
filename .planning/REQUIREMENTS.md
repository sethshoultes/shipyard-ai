# Forge Plugin — Requirements Specification

**Project Slug:** `github-issue-sethshoultes-shipyard-ai-33`
**Generated:** 2026-04-14
**Source:** PRD + Locked Decisions (decisions.md)

---

## Executive Summary

Forge is an Emdash CMS plugin for form building with a magic "Ask something" moment. This specification covers the v1 MVP which includes Form CRUD, D1 storage, CSV export, admin email notifications, and pattern-matching field inference — but explicitly excludes conditional logic, webhooks, analytics dashboards, auto-response emails, and multiple templates.

**North Star:** *Type a question. Get a form field. No friction.*

**Mantra:** *"Ship small. Ship beautiful. Ship now."*

---

## Requirements Traceability Matrix

### Core Features (MUST)

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| R-001 | IDENTITY | Product name is "Forge" | All branding, code, comments use "Forge" not "FormForge" | P0 |
| R-002 | STORAGE | Use D1 (SQLite) for all persistent data | Forms and submissions stored in D1; no KV for form data | P0 |
| R-003 | STORAGE | Do NOT use KV for form/submission storage | Only rate limiting uses KV (with TTL) | P0 |
| R-004 | UX | "Ask something" field creation | User types question, field type auto-suggested within 100ms | P0 |
| R-005 | INFERENCE | Pattern matching only (no NLP/ML) | Keyword matching only; no LLM calls; <20 lines of logic | P0 |
| R-006 | INFERENCE | "name" → text field | Questions containing "name" default to text type | P0 |
| R-007 | INFERENCE | "email" → email field | Questions containing "email" default to email type | P0 |
| R-008 | INFERENCE | "phone"/"number" → tel/number | Questions containing phone terms default to tel | P0 |
| R-009 | INFERENCE | "message"/"comments"/"feedback" → textarea | Long-text keywords default to textarea | P0 |
| R-010 | INFERENCE | Unknown → text default | Questions with no keyword match default to text | P0 |
| R-011 | CRUD | Form CRUD operations | Create, read, update, delete forms with validation | P0 |
| R-012 | FIELDS | Seven field types | text, email, number, textarea, select, checkbox, radio | P0 |
| R-013 | STORAGE | Submissions stored in D1 | Indexed by form_id; queryable by date | P0 |
| R-014 | EMAIL | Admin notification per submission | Form owner receives email with field values | P0 |
| R-015 | EXPORT | CSV export | Download all submissions as CSV with proper escaping | P0 |
| R-016 | TEMPLATE | One template: Contact Form | Only contact template ships; booking/feedback/quote cut | P0 |
| R-017 | THEME | Beautiful default theme | Professional, clean design out of the box | P0 |
| R-018 | THEME | Primary color customization | Single color picker field | P0 |
| R-019 | THEME | Logo upload field | Single image upload for logo | P0 |
| R-020 | THEME | Only two customization fields | No font dropdowns, no advanced theming | P0 |
| R-021 | PLUGIN | definePlugin() matches Emdash spec | Includes id, version, storage, admin, hooks, routes | P0 |
| R-022 | PLUGIN | Descriptor includes adminEntry | Per EMDASH-GUIDE section 6 | P0 |
| R-023 | EMAIL | Validate email config at startup | Error logged if RESEND_API_KEY missing | P0 |

### User Experience (SHOULD)

| ID | Category | Description | Acceptance Criteria | Priority |
|----|----------|-------------|---------------------|----------|
| R-024 | UX | Field type override UI | "Click to change type" visible after inference | P1 |
| R-025 | UX | Visual feedback on inference | Suggested type highlighted; animation | P1 |
| R-026 | EDITOR | Inline WYSIWYG form editor | Edit forms in-place; no separate screens | P1 |
| R-027 | RENDERER | Form renderer for end users | Clean, accessible form display | P1 |
| R-028 | CODE | Target 1,500-2,000 lines | Proxy metric; quality over line count | P2 |

---

## Explicitly Cut from v1 (MUST NOT)

| ID | Feature | Decision Reference | Why Cut |
|----|---------|-------------------|---------|
| C-001 | Multi-step forms | Decision 4 | Zero demand; adds complexity |
| C-002 | Conditional logic (showWhen) | Decision 4 + 7 | v2 — ship when someone screams |
| C-003 | Webhooks | Decision 7 | Enterprise upsell, not v1 |
| C-004 | HMAC signing | Decision 7 | Enterprise upsell, not v1 |
| C-005 | Analytics dashboards | Decision 7 | Vanity metrics |
| C-006 | Auto-response emails | Decision 7 | v2 |
| C-007 | Multiple templates | Decision 6 + 7 | One contact form only |
| C-008 | Migration tools | MVP Feature Set | Not needed for new installs |
| C-009 | Integrations menu | MVP Feature Set | Cut scope |
| C-010 | Full NLP/AI inference | Risk Register | HARD STOP on complexity |
| C-011 | Font dropdowns | Decision 5 | Constraints create confidence |

---

## D1 Schema Requirements

### Tables Required

```sql
-- forms table
CREATE TABLE IF NOT EXISTS forge_forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  fields TEXT NOT NULL,       -- JSON array of FormFieldDefinition
  notify_emails TEXT,         -- JSON array of email strings
  primary_color TEXT DEFAULT '#C4704B',
  logo_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- submissions table
CREATE TABLE IF NOT EXISTS forge_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  data TEXT NOT NULL,         -- JSON object of field values
  submitted_at TEXT NOT NULL,
  ip TEXT,
  FOREIGN KEY (form_id) REFERENCES forge_forms(id) ON DELETE CASCADE
);
```

### Indexes Required

```sql
CREATE INDEX idx_submissions_form_id ON forge_submissions(form_id);
CREATE INDEX idx_submissions_submitted_at ON forge_submissions(submitted_at);
CREATE INDEX idx_forms_created_at ON forge_forms(created_at);
```

### Rate Limiting (KV with TTL)

```
rate-limit:{formId}:{ip} → count (TTL: 15 minutes)
```

---

## Field Type Inference Specification

### Pattern Matching Rules (EMDASH-GUIDE cited: none needed, simple logic)

```typescript
// inference/field-type.ts (~20 lines)
export type InferredFieldType = 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'date';

export function inferFieldType(question: string): InferredFieldType {
  const q = question.toLowerCase().trim();

  // Email patterns
  if (/email|e-mail|mail\s*address/i.test(q)) return 'email';

  // Phone patterns
  if (/phone|tel|mobile|cell|call/i.test(q)) return 'tel';

  // Number patterns (but not phone)
  if (/number|amount|quantity|count|how many|age/i.test(q)) return 'number';

  // Textarea patterns (long text)
  if (/message|comment|feedback|describe|tell us|details|notes/i.test(q)) return 'textarea';

  // Date patterns
  if (/date|when|day|time/i.test(q)) return 'date';

  // Default to text (includes "name" and unknown)
  return 'text';
}
```

---

## Plugin Architecture

### Target File Structure

```
forge/
├── src/
│   ├── index.ts              # Plugin descriptor (PluginDescriptor)
│   ├── sandbox-entry.ts      # Runtime (definePlugin)
│   ├── db/
│   │   ├── schema.sql        # D1 migration
│   │   └── queries.ts        # Type-safe D1 queries
│   ├── handlers/
│   │   ├── forms.ts          # Form CRUD routes
│   │   ├── submissions.ts    # Submission handling + CSV
│   │   └── email.ts          # Admin notifications
│   ├── inference/
│   │   └── field-type.ts     # "Ask something" pattern matching
│   ├── ui/
│   │   ├── admin.ts          # Block Kit admin UI
│   │   └── renderer.ts       # Form display for end users
│   └── types.ts              # TypeScript interfaces
├── migrations/
│   └── 0001_initial.sql      # D1 migration file
├── package.json
└── README.md
```

### Emdash Plugin Compliance (EMDASH-GUIDE Section 6)

**Descriptor (index.ts) — per EMDASH-GUIDE:1066-1078:**
```typescript
export function forgePlugin(): PluginDescriptor {
  return {
    id: "forge",
    version: "1.0.0",
    entrypoint: "@shipyard/forge/sandbox",
    adminEntry: "@shipyard/forge/admin",
    adminPages: [
      { path: "/forms", label: "Forms", icon: "list" }
    ],
    adminWidgets: [
      { id: "form-activity", title: "Form Activity", size: "half" }
    ],
  };
}
```

**Runtime (sandbox-entry.ts) — per EMDASH-GUIDE:1086-1157:**
```typescript
export default definePlugin({
  id: "forge",
  version: "1.0.0",

  storage: {},  // Using D1 directly, not ctx.storage.collections

  admin: {
    settingsSchema: {
      maxFieldsPerForm: { type: "number", label: "Max Fields", default: 50 },
    },
    pages: [{ path: "/forms", label: "Forms", icon: "list" }],
    widgets: [{ id: "form-activity", title: "Form Activity", size: "half" }],
  },

  hooks: {
    "plugin:install": async (_event, ctx) => {
      // Validate email configuration (R-023)
    },
  },

  routes: {
    // Form CRUD, submissions, export
  },
});
```

---

## Email Configuration

### Environment Variables Required

| Variable | Purpose | Required |
|----------|---------|----------|
| RESEND_API_KEY | Resend API authentication | Yes |
| FORM_FROM_EMAIL | Sender email address | Yes |

### Startup Validation (R-023)

Log error if missing; store status for admin visibility.

---

## Blockers Before Ship

| ID | Blocker | Status | Owner |
|----|---------|--------|-------|
| B-001 | Test against real Emdash instance | REQUIRED | Engineering |
| B-002 | Configure RESEND_API_KEY in production | REQUIRED | DevOps |
| B-003 | Migrate from KV to D1 storage | REQUIRED | Engineering |

---

## Code to Remove from Existing FormForge

Based on codebase scout analysis, these must be deleted:

| Feature | Lines to Remove | Files Affected |
|---------|-----------------|----------------|
| Conditional logic (showWhen, isFieldVisible) | ~15 lines | sandbox-entry.ts |
| Multi-step forms (steps property) | ~5 lines | sandbox-entry.ts |
| Webhooks + HMAC | ~140 lines | sandbox-entry.ts |
| Auto-response emails | ~60 lines | sandbox-entry.ts, email.ts |
| Analytics routes + snapshots | ~160 lines | sandbox-entry.ts |
| Extra templates (booking, feedback, quote-request) | ~20 lines | sandbox-entry.ts |

**Total removal:** ~400 lines
**Net result:** From 1,289 lines to ~900 lines before adding new features

---

## Code to Add

| Feature | Estimated Lines | Files |
|---------|-----------------|-------|
| Field type inference | ~30 lines | inference/field-type.ts |
| D1 schema | ~30 lines | db/schema.sql |
| D1 query layer | ~150 lines | db/queries.ts |
| Theme customization | ~50 lines | Various |
| Plugin compliance fixes | ~50 lines | index.ts, sandbox-entry.ts |

**Total additions:** ~310 lines
**Final estimate:** ~1,200-1,400 lines (within target)

---

## Acceptance Criteria

### Must Pass Before Ship

1. [ ] All KV storage replaced with D1 for forms/submissions
2. [ ] "Ask something" inference works for all documented patterns
3. [ ] Field type override UI functional
4. [ ] Form CRUD operations work (create, read, update, delete)
5. [ ] Submissions stored and retrievable
6. [ ] CSV export generates valid CSV
7. [ ] Admin email notifications sent on submission
8. [ ] Only Contact template available
9. [ ] Theme: primary color + logo customization only
10. [ ] definePlugin() matches Emdash spec
11. [ ] All cut features (C-001 through C-011) removed from code

### Human QA Required

1. [ ] Real Emdash instance integration test
2. [ ] Email delivery verification (Resend)
3. [ ] Mobile responsiveness
4. [ ] "Ask something" → field type feels magical

---

## Risk Mitigations

| Risk | Mitigation | Priority |
|------|------------|----------|
| Emdash integration fails | Test on real instance before build completion | MUST |
| Field inference frustrates users | Clear override UI + pattern matching only | MUST |
| Email deliverability | Use Resend (established provider) | MUST |
| Scope creep | This document is the contract | MUST |

---

## Version

- **Specification Version**: 1.0
- **Last Updated**: 2026-04-14
- **PRD Source**: `prds/github-issue-sethshoultes-shipyard-ai-33.md`
- **Decisions Source**: `rounds/github-issue-sethshoultes-shipyard-ai-33/decisions.md`
- **EMDASH-GUIDE Sections Cited**: 6 (Plugin System), specifically lines 1066-1157
