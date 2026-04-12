# REQUIREMENTS — Wardrobe Theme Marketplace Phase 1 (Deployment)

> *Atomic requirements extracted from decisions.md for Emdash Marketplace (Wardrobe)*
> *Source: /home/agent/shipyard-ai/rounds/emdash-marketplace/decisions.md*

---

## Summary

**Total Requirements: 42**
- **P0 Infrastructure Blockers: 9** (MUST resolve before launch)
- **Tier 1 Launch Conditions: 5** (Board-mandated for V1)
- **Built Components: 23** (Code complete, awaiting deployment)
- **Post-Launch: 5** (Tier 2/3, Q2-Q3 2026)

**Build Status:** Technical MVP COMPLETE. Code is 100% done.
**Deployment Status:** 0% deployed. 9 P0 blockers prevent launch.

---

## 1. P0 Infrastructure Blockers (MUST Resolve)

| ID | Category | Description | Acceptance Criteria | Status |
|----|----------|-------------|---------------------|--------|
| P0-001 | KV Namespace | Create ANALYTICS KV namespace | `wrangler kv:namespace create ANALYTICS` returns valid ID | NOT DONE |
| P0-002 | KV Namespace | Create EMAILS KV namespace | `wrangler kv:namespace create EMAILS` returns valid ID | NOT DONE |
| P0-003 | KV Namespace | Create RATE_LIMITS KV namespace | `wrangler kv:namespace create RATE_LIMITS` returns valid ID | NOT DONE |
| P0-004 | R2 Bucket | Create R2 bucket for theme tarballs | `wrangler r2 bucket create emdash-themes` succeeds; public access enabled | NOT DONE |
| P0-005 | R2 Upload | Upload 5 theme tarballs to R2 CDN | All 5 tarballs return HTTP 200: ember, forge, slate, drift, bloom | NOT DONE |
| P0-006 | Worker Deploy | Deploy analytics worker to Cloudflare | Worker deployed; `/health` returns 200 | NOT DONE |
| P0-007 | Worker Deploy | Deploy email-capture worker to Cloudflare | Worker deployed; POST `/subscribe` accepts emails | NOT DONE |
| P0-008 | Showcase Deploy | Deploy showcase website to Cloudflare Pages | Site live at target domain; all theme cards visible | NOT DONE |
| P0-009 | Git Cleanup | Commit 3 uncommitted files | `git status` shows clean working tree | NOT DONE |

---

## 2. Tier 1 Launch Conditions (Board-Mandated)

Per Board Verdict (decisions.md):

| ID | Category | Description | Acceptance Criteria | Reviewer | Status |
|----|----------|-------------|---------------------|----------|--------|
| T1-001 | Demo Sites | Deploy 5 live demo sites | 5 Emdash sites running each theme; URLs accessible | Oprah | NOT DONE |
| T1-002 | Screenshots | Replace SVG placeholders with real PNGs | 5 PNG files captured from live demo sites; <200KB each | Oprah | NOT DONE |
| T1-003 | Install Experience | Post-install reveal enhancement | CLI shows `npm run dev`, localhost:4321, admin URL after install | Shonda | DONE |
| T1-004 | Email Capture | Wire email capture endpoint | Form submission stores email in KV; confirmation shown | Shonda | NOT DEPLOYED |
| T1-005 | Telemetry | Anonymous install telemetry | CLI sends usage data to analytics worker; events recorded | Buffett | NOT DEPLOYED |

---

## 3. Built Components (Code Complete, Awaiting Deployment)

### CLI Commands (All BUILT)

| ID | Component | Description | Line Count | Status |
|----|-----------|-------------|------------|--------|
| CLI-001 | List Command | `npx wardrobe list` - Fetches themes.json, displays available themes | ~50 lines | BUILT |
| CLI-002 | Install Command | `npx wardrobe install [theme]` - Downloads tarball, backs up src/, swaps theme | 266 lines | BUILT |
| CLI-003 | Preview Command | `npx wardrobe preview [theme]` - Opens theme showcase in browser | 96 lines | BUILT |

### Five Themes (All BUILT)

| ID | Theme | Personality | Copy | Line Count | Status |
|----|-------|-------------|------|------------|--------|
| THEME-001 | Ember | Bold, editorial | "For people with something to say" | 356 lines | BUILT |
| THEME-002 | Forge | Dark, technical | "Built for builders" | 520 lines | BUILT |
| THEME-003 | Slate | Clean, professional | "Trust at first glance" | 551 lines | BUILT |
| THEME-004 | Drift | Minimal, airy | "Let your content breathe" | 307 lines | BUILT |
| THEME-005 | Bloom | Warm, organic | "Where community feels at home" | 322 lines | BUILT |

### Showcase Website (All BUILT)

| ID | Component | Description | Line Count | Status |
|----|-----------|-------------|------------|--------|
| SHOW-001 | HTML Page | Static showcase with theme cards | 341 lines | BUILT |
| SHOW-002 | JavaScript | Copy-to-clipboard, form handling, analytics | 244 lines | BUILT |
| SHOW-003 | CSS Styles | Responsive design, WCAG 2.1 AA accessibility | ~600 lines | BUILT |
| SHOW-004 | Coming Soon | 4 themes teased (Aurora, Chronicle, Neon, Haven) | Included | BUILT |

### Cloudflare Workers (All BUILT)

| ID | Worker | Description | Line Count | Status |
|----|--------|-------------|------------|--------|
| WORK-001 | Analytics | KV-based telemetry: POST /track, GET /stats | 389 lines | BUILT |
| WORK-002 | Email Capture | Email signup with rate limiting | 305 lines | BUILT |

### Registry & Distribution (All BUILT)

| ID | Component | Description | Line Count | Status |
|----|-----------|-------------|------------|--------|
| REG-001 | themes.json | Theme registry manifest (5 live + 4 coming soon) | 78 lines | BUILT |
| DIST-001 | Tarballs | 5 pre-packaged theme archives (5-6KB each) | 5 files | BUILT |

---

## 4. Locked Design Decisions

Per Steve Jobs / Elon Musk debate:

| ID | Decision | Winner | Rationale |
|----|----------|--------|-----------|
| LOCK-001 | Product Name: "Wardrobe" | Steve Jobs | `npx wardrobe install ember` is tweetable |
| LOCK-002 | Theme Count: 5 | Steve Jobs | Five feels like a collection; three feels like a test |
| LOCK-003 | Preview: Screenshots (not live) | Elon Musk | Ships in one session; live preview is V2 |
| LOCK-004 | Architecture: CLI-First | Elon Musk | The CLI IS the product; website is marketing |
| LOCK-005 | Infrastructure: Static | Elon Musk | R2 + CDN scales infinitely with zero ops |
| LOCK-006 | Install Speed: Sub-3-Second | Both | Transformation must feel instant |
| LOCK-007 | Brand Voice | Steve Jobs | "Confident friend with impeccable taste" |
| LOCK-008 | Themes in Core | Elon Musk | `emdash create --theme ember` for zero-friction discovery |
| LOCK-009 | Showcase Website | Steve Jobs (board enforced) | "The URL IS the marketing" |

---

## 5. Post-Launch Features (NOT in Phase 1)

### Tier 2: Before Paid Themes (Next Sprint)

| ID | Feature | Rationale | Reviewer |
|----|---------|-----------|----------|
| T2-001 | Pricing rails architecture | "Can't have marketplace without commerce" | Buffett |
| T2-002 | Theme creator guidelines | "Platform needs creators" | Jensen |
| T2-003 | Post-install email flow | "Create ongoing relationship" | Shonda |
| T2-004 | User content preview | "The money shot" | Jensen |

### Tier 3: Platform Status (Q2 2026)

| ID | Feature | Rationale | Reviewer |
|----|---------|-----------|----------|
| T3-001 | Theme versioning | "Reason to return" | Shonda |
| T3-002 | Site gallery | "Social proof + flywheel" | Oprah |
| T3-003 | Creator submission pipeline | "Platform economics" | Buffett |
| T3-004 | AI theme preview | "10x leverage" | Jensen |
| T3-005 | 10+ themes at scale | "5 feels sparse" | Buffett |

---

## 6. What Was Cut (V1 Scope)

| Feature | Reason | Proposer |
|---------|--------|----------|
| Live preview server | 30+ days engineering for zero users | Elon (Steve conceded) |
| 5 live demo sites | 5x maintenance burden | Elon (Steve conceded) |
| User accounts | Zero value for CLI installs | Both agreed |
| Theme ratings/reviews | Curation IS the quality signal at 5 themes | Both agreed |
| Search/filtering | 5 themes visible at a glance | Both agreed |
| "Submit Your Theme" | Build the standard first | Steve (Elon agreed) |
| Customization panels | Themes are opinions, not raw materials | Steve (Elon agreed) |
| Feature comparison tables | This isn't enterprise software. It's fashion. | Steve |

---

## 7. Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| RISK-001 | R2 upload script bug (googleapis.com) | Certain | Blocking | Fix endpoint to `.r2.cloudflarestorage.com` |
| RISK-002 | Placeholder KV IDs in wrangler.toml | Certain | Blocking | Replace with real IDs after namespace creation |
| RISK-003 | Screenshots are SVG placeholders | Certain | Blocking | Generate PNGs from live demo sites |
| RISK-004 | Demo sites not deployed | Certain | Blocking | Longest task; critical path |
| RISK-005 | CORS_ORIGIN mismatch between workers | Medium | Medium | Synchronize to showcase domain |
| RISK-006 | API_KEY secret not generated | Medium | Blocking | Generate and set before analytics deploy |
| RISK-007 | Uncommitted files in git | Certain | Medium | Commit before QA Pass 2 |

---

## 8. Documentation References

### decisions.md Key Sections
- **P0 Launch Blockers** (lines 334-361): 9 blockers with resolution path
- **Board Conditions for Launch** (lines 366-395): Tier 1/2/3 requirements
- **MVP Feature Set** (lines 161-205): CLI, themes, showcase scope
- **File Structure** (lines 207-258): Expected directory layout
- **What Was Cut** (lines 149-158): V2 features explicitly excluded

### docs/EMDASH-GUIDE.md Key Sections
- **Section 5: Deployment** — Cloudflare Workers setup, wrangler.jsonc patterns
- **Section 7: Theming** — Theme structure, seed files, CSS tokens
- **Section 8: Real Examples** — Bella's Bistro configuration reference

### Existing Codebase Patterns
- `/workers/contact-form/` — Resend API, CORS handling, email validation
- `/apps/pulse/lib/stripe.ts` — Stripe integration, idempotency patterns
- `/plugins/eventdash/src/email.ts` — HTML email templates

---

## 9. Open Questions (Needing Resolution)

| # | Question | Context | Impact | Recommended Resolution |
|---|----------|---------|--------|------------------------|
| 1 | R2 bucket name confirmation | decisions.md suggests `emdash-themes` | CLI hardcodes tarball URLs | Use `emdash-themes` as specified |
| 2 | Public R2 URL format | `cdn.emdash.dev` vs `pub-xxx.r2.dev` | CLI tarball downloads | Configure custom domain or update CLI |
| 3 | Showcase domain | `wardrobe.emdash.dev` vs `wardrobe.emdash.app` | CORS configuration | Use `wardrobe.emdash.dev` per wrangler.toml |
| 4 | Demo site domains | `{theme}.wardrobe.emdash.dev` | Screenshot URLs | Follow DEPLOYMENT-RUNBOOK.md |

---

## Verification Checklist

- [x] All P0 blockers identified (9 total)
- [x] All Tier 1 conditions extracted (5 total)
- [x] Built components inventoried (23 total)
- [x] Risk register populated (7 risks)
- [x] Documentation references cited
- [x] Open questions documented

---

*Generated: April 12, 2026*
*Project Slug: emdash-marketplace*
*Product Name: Wardrobe*
