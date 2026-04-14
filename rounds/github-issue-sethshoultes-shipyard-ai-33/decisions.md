# Forge: Locked Decisions

*Consolidated by Phil Jackson — The Zen Master*

---

## Decision Log

### 1. Product Name

| Aspect | Decision |
|--------|----------|
| **Winner** | Steve Jobs |
| **Decision** | **Forge** (not FormForge) |
| **Steve's Position** | One word. A verb. Memorable, active, carries weight of craftsmanship. FormForge sounds like enterprise software from 2008. |
| **Elon's Position** | Forge.com costs $500K+. All good domains taken. "Ship ugly names. Buy pretty domains later." |
| **Why Steve Won** | Brand identity is a non-negotiable. Elon conceded the naming is a marketing decision, not a technical one. Domain strategy is a solvable problem; brand confusion is not. |

---

### 2. Storage Architecture

| Aspect | Decision |
|--------|----------|
| **Winner** | Elon Musk |
| **Decision** | **D1 (SQLite) for all persistent data** — not KV |
| **Elon's Position** | KV creates N+1 queries. 50 forms = 51 reads. No indexing, JSON parsing overhead. "Architecturally broken for the stated use case." |
| **Steve's Position** | "He's completely correct. D1 should be the primary store from day one. This isn't premature optimization — it's not building on sand." |
| **Why Elon Won** | Steve explicitly conceded. Both agree KV is wrong. Unanimous. |

---

### 3. First 30 Seconds / "Ask Something" Experience

| Aspect | Decision |
|--------|----------|
| **Winner** | Steve Jobs |
| **Decision** | **"Ask something" → natural language creates fields ships in v1** |
| **Steve's Position** | "This is the entire product thesis." The magic moment is the differentiation. It's the story users tell friends. |
| **Elon's Position** | "That's an NLP inference engine. 10,000 lines of code to avoid a dropdown menu... You're designing a demo, not a product." |
| **Why Steve Won** | This is the essence document's core requirement: "The first 30 seconds. Type a question, get a field. No friction." Without this, Forge is just another form builder. The product IS the magic. Implementation complexity is engineering's problem, not product's excuse. |
| **Compromise** | Start with pattern matching (not full NLP). "What's your name?" → name field. "Email?" → email field. Simple heuristics first, smarter inference later. |

---

### 4. Conditional Logic / Multi-Step Forms

| Aspect | Decision |
|--------|----------|
| **Winner** | Both (unanimous) |
| **Decision** | **CUT from v1** |
| **Steve's Position** | "No conditional logic on day one. Ship the 80% use case flawlessly before touching branching." |
| **Elon's Position** | "Zero users asked for this, cut it." |
| **Why** | No demand signal. Adds complexity. Ship when users scream for it. |

---

### 5. Theme Customization

| Aspect | Decision |
|--------|----------|
| **Winner** | Both (unanimous) |
| **Decision** | **Two fields only: primary color and logo** |
| **Steve's Position** | "The moment we add font dropdowns, we've lost. Constraints create confidence." |
| **Elon's Position** | "Primary color + logo is exactly right. Two fields, not twenty." |
| **Why** | Complexity is a tax on users. One beautiful default theme. |

---

### 6. Templates

| Aspect | Decision |
|--------|----------|
| **Winner** | Elon Musk |
| **Decision** | **One template: Contact Form only** |
| **Elon's Position** | "One form that works. Add templates when users ask twice." |
| **Steve's Position** | Did not object. Aligned with "say no" philosophy. |
| **Why** | Minimal viable scope. Templates are easy to add, hard to maintain. |

---

### 7. Features to CUT from v1

| Feature | Status | Rationale |
|---------|--------|-----------|
| Multi-step forms | CUT | Zero demand, adds complexity |
| Conditional logic (`showWhen`) | CUT | v2 — ship when someone screams |
| Webhooks + HMAC signing | CUT | Enterprise upsell, not v1 |
| Analytics dashboard / charts | CUT | Both agree: vanity metrics |
| Auto-response emails | CUT | v2 |
| CSV export | **DISPUTED** | Elon: cut. Steve: "feel trapped" without it |
| Multiple templates | CUT | One contact form only |

**CSV Export Resolution:** Include basic CSV export. Steve's argument — "When an admin can't export to Excel, they feel trapped" — aligns with user dignity. Implementation cost is low (~50 lines). Elon's "copy/paste works" is valid but doesn't serve users with 100+ submissions.

---

### 8. Codebase Size Target

| Aspect | Decision |
|--------|----------|
| **Winner** | Elon Musk (with caveat) |
| **Decision** | **Target: ~1,500-2,000 lines** (down from 4,800) |
| **Elon's Position** | "Cut to 1,500 lines maximum. Form CRUD, submission storage, one email notification." |
| **Steve's Position** | Didn't contest the number. Focused on WHAT ships, not line count. |
| **Caveat** | Line count is a proxy, not a goal. If the "Ask something" experience requires 2,500 lines, it ships. Quality over arbitrary metrics. |

---

## MVP Feature Set (What Ships in v1)

### Core Features
1. **Form CRUD** — Create, read, update, delete forms
2. **Field Types** — Text, email, number, textarea, select, checkbox, radio
3. **Natural Language Field Creation** — "Ask something" → field type inference (pattern matching)
4. **Submission Storage** — D1 (SQLite) backend
5. **Admin Email Notification** — One email per submission to form owner
6. **Basic CSV Export** — Download submissions as CSV
7. **One Theme** — Beautiful default + primary color + logo upload (two customization fields)

### Explicitly NOT in v1
- Multi-step forms
- Conditional field visibility
- Webhooks
- HMAC signatures
- Analytics dashboards
- Auto-response emails
- Multiple templates
- Migration tools
- Integrations menu

---

## File Structure (What Gets Built)

```
forge/
├── src/
│   ├── index.ts              # Main entry point, route handling
│   ├── db/
│   │   ├── schema.sql        # D1 schema: forms, fields, submissions
│   │   └── queries.ts        # Type-safe D1 query functions
│   ├── handlers/
│   │   ├── forms.ts          # Form CRUD operations
│   │   ├── submissions.ts    # Submission handling + CSV export
│   │   └── email.ts          # Admin notification (Resend/SendGrid)
│   ├── inference/
│   │   └── field-type.ts     # "Ask something" → field type mapping
│   ├── ui/
│   │   ├── editor.ts         # Form editor (inline, WYSIWYG)
│   │   ├── renderer.ts       # Form display for end users
│   │   └── theme.ts          # Single theme + color/logo config
│   └── types.ts              # TypeScript interfaces
├── migrations/
│   └── 0001_initial.sql      # D1 migration
├── wrangler.toml             # Cloudflare Workers config
├── package.json
└── README.md
```

**Estimated Total:** ~1,500-2,000 lines

---

## Open Questions (What Still Needs Resolution)

### 1. Emdash Integration Testing
**Status:** BLOCKER
**Issue:** Code is "untested against real Emdash" per PRD. Integration is the actual gate.
**Owner:** Needs Emdash instance access
**Resolution Required Before:** Build phase completion

### 2. Email Service Configuration
**Status:** BLOCKER
**Issue:** PRD mentions Resend/SendGrid but no configuration documented
**Owner:** Infrastructure/DevOps
**Resolution Required Before:** Email feature testing

### 3. Domain Strategy
**Status:** Not blocking v1
**Issue:** forge.com unavailable. Need domain decision.
**Options:** forgeforms.com, useforge.com, forge.app
**Owner:** Marketing/Business

### 4. Field Type Inference Scope
**Status:** Needs specification
**Issue:** How smart should "Ask something" be in v1?
**Proposal:** Pattern matching only. Keywords → field types.
- "name" → text (name validation)
- "email" → email
- "phone" / "number" → tel/number
- "message" / "comments" / "feedback" → textarea
- Question mark + no keywords → text (default)

### 5. Rate Limiting Strategy
**Status:** Needs architecture decision
**Issue:** Elon noted KV for rate limiting is "acceptable but Redis would be 10x faster at scale"
**Proposal:** KV for v1 (acceptable). Revisit at 10K submissions/day.

---

## Risk Register (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Emdash integration fails** | Medium | CRITICAL | Test against real Emdash instance before build completion. Have fallback standalone mode. |
| **Field type inference frustrates users** | Medium | High | Clear override UI. "Click to change field type" always visible. Pattern matching only (no hallucinating). |
| **D1 cold start latency** | Low | Medium | Acceptable for v1. Monitor. Cloudflare's problem to solve. |
| **Emdash ceiling limits distribution** | High | High | Per Elon: "Plugin distribution is a losing strategy." Counter per Steve: Make Forge so good people choose Emdash for Forge. Long-term: evaluate standalone distribution. |
| **Scope creep during build** | Medium | Medium | This document is the contract. Nothing ships that isn't listed in MVP Feature Set. |
| **"Ask something" becomes NLP rabbit hole** | Medium | High | HARD STOP: Pattern matching only for v1. No ML. No LLM calls. No inference beyond keyword matching. |
| **Email deliverability issues** | Low | Medium | Use established provider (Resend/SendGrid). Standard transactional email patterns. |
| **No users care** | Medium | CRITICAL | Ship fast. Validate with real users. First 10 users matter more than first 10 features. |

---

## Summary: The Zen Master's Synthesis

Steve and Elon are both right. They're optimizing for different time horizons.

**Steve is right about:**
- The name (Forge)
- The magic moment (first 30 seconds)
- User dignity (CSV export stays)
- Brand differentiation (this must FEEL different)

**Elon is right about:**
- Storage architecture (D1, not KV)
- Scope ruthlessness (cut 60% of existing code)
- Templates (one contact form)
- The real blocker (Emdash integration, not code)

**The synthesis:**
Ship Elon's architecture with Steve's soul. 1,500 lines of code that make users feel like craftsmen. The "Ask something" moment is non-negotiable — but implement it simply. Pattern matching, not AI.

**The mantra:**
*"Ship small. Ship beautiful. Ship now."*

---

*This document is the blueprint. If it's not in here, it doesn't ship in v1.*
