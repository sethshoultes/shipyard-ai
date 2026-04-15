# Phase 1 Plan — LocalGenius Frontend Launch

**Generated:** 2026-04-15
**Project Slug:** `localgenius-frontend-launch`
**Total Tasks:** 17 tasks organized in 4 waves
**Timeline:** Week 1 (7 days to MVP)

---

## CRITICAL CONTEXT — Read This First

### This is NOT an Emdash Project

- **Platform:** WordPress Plugin (standalone, separate from Emdash CMS)
- **Backend:** Cloudflare Workers + D1 + R2 (ALREADY EXISTS - complete)
- **Frontend:** Vanilla JavaScript + CSS + WordPress PHP (DOES NOT EXIST - must build from scratch)
- **Integration:** WordPress plugin calls Cloudflare Workers API endpoints

### What We're Building

A WordPress plugin that adds an AI chat widget to local business websites. The widget:
1. Floats in bottom-right corner
2. Responds to customer questions in <2 seconds
3. Uses FAQ caching to reduce costs by 70%
4. Has magical 60-second onboarding
5. Works on any WordPress theme

### Critical Blockers (Must Resolve Before Build)

From research agents, there are **6 open questions** requiring immediate decisions:

1. **FAQ Auto-Generation:** Hardcoded templates vs. GPT-4 vs. hybrid? (DAY 1 decision)
2. **OpenAI Timeout:** 2-second timeout vs. streaming vs. optimization? (DAY 2 decision)
3. **Badge Placement:** Where does "Powered by LocalGenius" appear? (DAY 1 decision)
4. **Color Customization:** CSS variable scope? (DAY 1 decision)
5. **Trial vs. Payment:** Free trial or immediate $29/month? (DAY 3 decision)
6. **Beta Outreach:** Messaging and target list? (WEEK 1 parallel track)

---

## Requirements Summary

| Category | Count |
|----------|-------|
| Must-Have (Week 1) | 47 requirements |
| Deferred (v1.1+) | 10 features |
| Technical Constraints | 28 enforced |
| Critical Blockers | 6 decisions needed |

**Full requirements:** `/home/agent/shipyard-ai/.planning/localgenius-REQUIREMENTS.md`

---

## Wave Execution Plan

### Wave 1 (Parallel) — Foundation & Backend Setup
**Duration:** Days 1-2
**Dependencies:** None - all tasks run in parallel

#### Task 1.1: Provision Cloudflare Infrastructure
- Create D1 database for FAQ caching
- Create R2 bucket for assets
- Configure wrangler.toml
- Set up environment secrets
- **Output:** wrangler.toml, database ready

#### Task 1.2: Implement Chat API Endpoint (/chat)
- FAQ caching layer (check D1 first)
- OpenAI fallback for non-cached questions
- 2-second timeout with graceful fallback
- Response formatter
- **Output:** /backend/workers/chat.js functional

#### Task 1.3: Implement FAQ Data Layer
- D1 schema for FAQs table
- business_id foreign key
- Query by similarity
- Cache invalidation logic
- **Output:** /backend/db/schema.sql, /backend/workers/faq-cache.js

#### Task 1.4: Create WordPress Plugin Scaffold
- localgenius.php with plugin headers
- Directory structure
- Settings page skeleton
- README.txt for wp.org
- **Output:** /wordpress-plugin/ directory structure

**Wave 1 Success Criteria:**
- [ ] D1 database provisioned and migrated
- [ ] /chat endpoint returns responses
- [ ] FAQ cache working (test with sample data)
- [ ] WordPress plugin installable (shows in wp-admin)

---

### Wave 2 (Parallel, after Wave 1) — Core Widget & Admin
**Duration:** Days 3-4
**Dependencies:** Wave 1 complete

#### Task 2.1: Build Chat Widget Bubble
- Floating bubble UI (bottom-right)
- Expand/collapse animation
- CSS with --localgenius-accent-color variable
- Responsive design (<768px mobile)
- **Output:** /frontend/widget/chat-bubble.js, /frontend/styles/widget.css
- **Size Budget:** 5KB JS + 1.5KB CSS

#### Task 2.2: Build Chat Interface
- Message display area
- Input field
- Send button
- Loading state
- Error handling
- Conversation history
- **Output:** /frontend/widget/chat-interface.js
- **Size Budget:** 4KB JS

#### Task 2.3: Build API Client
- Fetch wrapper for /chat endpoint
- Authentication headers
- Error handling
- Timeout management
- **Output:** /frontend/widget/api-client.js
- **Size Budget:** 1KB JS

#### Task 2.4: Build FAQ Editor (Admin)
- CRUD interface for FAQs
- List view
- Edit form
- Delete confirmation
- No drag-and-drop (explicit requirement)
- **Output:** /frontend/admin/faq-editor.js, /wordpress-plugin/includes/settings.php
- **Size Budget:** 2KB JS

**Wave 2 Success Criteria:**
- [ ] Chat bubble renders on WordPress frontend
- [ ] Clicking bubble opens chat interface
- [ ] Messages send to /chat API
- [ ] FAQ editor functional in wp-admin
- [ ] Combined bundle < 15KB (5KB margin)

---

### Wave 3 (Sequential, after Wave 2) — Onboarding Magic
**Duration:** Days 5-6
**Dependencies:** Wave 2 complete (needs widget + FAQ editor)

#### Task 3.1: Build Business Type Detector
- Extract from WordPress metadata (site title, categories)
- Fallback dropdown UI
- 20+ business type templates
- **Output:** /frontend/utils/business-detector.js

#### Task 3.2: Build FAQ Generator
- Pre-populated 10-FAQ templates per business type
- Template library (20+ types: restaurant, dentist, yoga, etc.)
- **Decision dependency:** RESOlVE FAQ auto-generation logic (hardcoded vs GPT-4)
- **Output:** /frontend/utils/faq-generator.js

#### Task 3.3: Build Onboarding Wizard
- Step 1: Auto-detect business (with fallback)
- Step 2: Show 10 pre-populated FAQs
- Step 3: Live preview pane
- Step 4: Single button "Yes, that's me"
- <60 second completion time
- **Output:** /frontend/admin/onboarding-wizard.js, /frontend/admin/preview-pane.js
- **Size Budget:** 3KB JS

#### Task 3.4: Integrate Widget Embed
- Auto-inject widget script on frontend
- API key configuration
- Position and color settings
- **Output:** /wordpress-plugin/includes/widget-embed.php

**Wave 3 Success Criteria:**
- [ ] Onboarding detects business type (tested on 10 sites)
- [ ] 10 FAQs auto-populate
- [ ] Live preview shows widget
- [ ] Activation works with one button
- [ ] Complete onboarding in <60 seconds (5 user test)

---

### Wave 4 (Final Polish & Testing) — Week 1 Completion
**Duration:** Day 7
**Dependencies:** Wave 3 complete

#### Task 4.1: Security Audit
- PHPCS with WordPress ruleset
- XSS escape verification (esc_html, esc_attr)
- Nonce validation
- Capability checks
- SQL injection prevention
- **Output:** Security audit report, fixes applied

#### Task 4.2: Performance Optimization
- Minify JavaScript (goal: <20KB total)
- Optimize CSS
- Lazy-load widget
- Test response times
- **Output:** Optimized build, performance report

#### Task 4.3: Cross-Theme Testing
- Test on TwentyTwentyFour theme
- Test on GeneratePress theme
- Test on Astra theme
- Fix CSS conflicts
- **Output:** Theme compatibility report

#### Task 4.4: wp.org Submission Prep
- Complete readme.txt
- Add screenshots
- Pre-review against wp.org guidelines
- Prepare assets
- **Output:** wp.org submission package

**Wave 4 Success Criteria:**
- [ ] Zero security vulnerabilities
- [ ] Bundle size <20KB gzipped
- [ ] Works on 3+ themes without breaking
- [ ] wp.org submission package ready
- [ ] Private beta ready to deploy

---

## Technical Architecture

### File Structure (16 files to build)

```
/wordpress-plugin/
  localgenius.php                # Main plugin (150 LOC)
  readme.txt                     # wp.org submission doc
  /includes/
    settings.php                 # Admin settings page (200 LOC)
    widget-embed.php             # Frontend script injection (50 LOC)
    api-config.php               # API key storage (50 LOC)
  /assets/
    /js/
      widget.min.js              # Compiled frontend (<20KB)
    /css/
      widget.min.css             # Compiled styles

/frontend/
  /widget/
    chat-bubble.js               # Bubble UI (5KB)
    chat-interface.js            # Chat window (4KB)
    api-client.js                # API calls (1KB)
  /admin/
    onboarding-wizard.js         # Onboarding (3KB)
    faq-editor.js                # FAQ CRUD (2KB)
    preview-pane.js              # Live preview (1KB)
  /styles/
    widget.css                   # Widget styles (1.5KB)
    admin.css                    # Admin styles (1KB)
  /utils/
    business-detector.js         # Auto-detect business (1KB)
    faq-generator.js             # FAQ templates (1KB)

/backend/
  /workers/
    chat.js                      # /chat endpoint (200 LOC)
    faq-cache.js                 # D1 cache layer (150 LOC)
  /db/
    schema.sql                   # D1 table schemas
  /utils/
    openai-client.js             # LLM fallback (100 LOC)
    response-formatter.js        # Normalize responses (50 LOC)
```

**Total:** ~1,500 LOC across 16 files

---

## Technology Stack

### Frontend
- **Language:** Vanilla JavaScript (ES6+)
- **Styling:** Plain CSS with CSS custom properties
- **Build:** esbuild for minification only (no bundler)
- **Size:** <20KB total (gzipped)

### WordPress Plugin
- **Language:** PHP 7.4+
- **Standards:** WordPress Coding Standards (PHPCS)
- **Security:** Nonces, capability checks, escaping
- **Hooks:** wp_enqueue_scripts, admin_menu, etc.

### Backend API
- **Platform:** Cloudflare Workers
- **Database:** D1 SQLite
- **Storage:** R2
- **External:** OpenAI API (gpt-4 or gpt-3.5-turbo)

---

## Success Metrics

### Week 1 Build Complete
- [ ] Chat widget renders on 3 test WordPress sites
- [ ] Onboarding flow averages <60 seconds (5 users)
- [ ] FAQ caching reduces LLM calls by >70%
- [ ] Zero critical bugs in private beta

### Week 2 Private Beta
- [ ] 10 hand-selected beta users installed
- [ ] Average setup time <90 seconds
- [ ] >50% answer "recommend this" = Yes
- [ ] 3+ testimonials for wp.org

### Week 4 Public Launch
- [ ] wp.org plugin live (or manual install ready)
- [ ] 50 total installs
- [ ] 10 paying customers ($290 MRR)
- [ ] <2 negative reviews

---

## Risk Mitigation

### Critical Risks (from Risk Scanner)

**RISK-001: Magical onboarding auto-detection fails (65% probability)**
- **Impact:** CRITICAL - "Holy shit it works" moment fails, users uninstall
- **Mitigation:** Graceful fallback to dropdown, test on 10 diverse WP sites

**RISK-002: LLM response latency >2 seconds (45% probability)**
- **Impact:** HIGH - Users close widget, perceive as broken
- **Mitigation:** FAQ caching (80% queries <200ms), hard 2s timeout

**RISK-003: wp.org submission rejected (35% probability)**
- **Impact:** CRITICAL - Can't distribute, delays revenue
- **Mitigation:** PHPCS audit, manual .zip install fallback, 2-week approval buffer

**RISK-004: OpenAI costs spiral (55% probability)**
- **Impact:** CRITICAL - Burn cash before revenue
- **Mitigation:** FAQ caching (70% reduction), daily monitoring, $100/month hard limit

**RISK-005: Design quality slips (70% probability)**
- **Impact:** HIGH - No word-of-mouth, looks generic
- **Mitigation:** Allocate 20% dev time to UI polish, internal design review

---

## Decision Authority Matrix

| Decision Type | Authority | Escalation |
|---------------|-----------|------------|
| UX/Design details | Steve Jobs | Phil Jackson if timeline impact |
| Technical architecture | Elon Musk | Phil Jackson if scope impact |
| Pricing/business model | Steve Jobs (locked) | Not revisitable until Month 2 |
| Scope cuts | Elon Musk | Phil Jackson arbitrates |
| Marketing copy | Steve Jobs | Elon reviews accuracy |
| Distribution tactics | Elon Musk | Steve reviews brand |

**Phil Jackson (Zen Master) has final call on:**
- Scope cuts if Week 1 deadline at risk
- Disputes where Steve/Elon disagree
- Go/no-go for public launch

---

## Next Steps (DAY 1 REQUIRED)

### Immediate Actions (Today)

1. **Decision Meeting (30 min):**
   - FAQ auto-generation logic (hardcoded vs GPT-4 vs hybrid)
   - "Powered by LocalGenius" badge placement
   - Accent color customization scope

2. **Infrastructure Provisioning (60 min):**
   - Create Cloudflare Workers project
   - Provision D1 database
   - Create R2 bucket
   - Configure wrangler.toml

3. **OpenAI Access Clarification (15 min):**
   - Confirm API key access
   - Set rate limits
   - Configure cost monitoring

4. **FAQ Templates Research (90 min):**
   - List 20+ business types
   - Draft 10 FAQs per type (200 total FAQs)

**Total Day 1 Time:** 3 hours of decisions + infrastructure

---

## Resources

### Research Outputs (from Sub-Agents)

All three research agents have completed:

1. **Codebase Scout Report**
   - Location: `/home/agent/shipyard-ai/rounds/localgenius-frontend-launch/`
   - Files: CODEBASE_SCOUT_REPORT.md, QUICK_REFERENCE.md, STARTER_TEMPLATES.md

2. **Requirements Analyst Output**
   - 85 atomic requirements extracted
   - 10 deferred features cataloged
   - 6 open questions identified

3. **Risk Scanner Output**
   - 5 critical blockers
   - 10 high-priority risks
   - Mitigation strategies

### Reference Documentation

- **PRD:** `/home/agent/shipyard-ai/prds/localgenius-frontend-launch.md`
- **Decisions:** `/home/agent/shipyard-ai/rounds/localgenius-frontend-launch/decisions.md`
- **EMDASH Guide:** `/home/agent/shipyard-ai/docs/EMDASH-GUIDE.md` (for plugin patterns)
- **Requirements:** `/home/agent/shipyard-ai/.planning/localgenius-REQUIREMENTS.md`

---

## Phase 1 Timeline

```
DAY 1 (Today):   Resolve blockers + infrastructure setup
DAY 2:           Wave 1 execution (foundation + backend)
DAY 3-4:         Wave 2 execution (widget + admin)
DAY 5-6:         Wave 3 execution (onboarding magic)
DAY 7:           Wave 4 execution (polish + testing)
```

**End of Week 1:** Private beta deployment (10 users)

---

**Status:** READY FOR EXECUTION (pending blocker resolution)
**Next Document:** Begin Wave 1 task execution after decisions locked

---

## Sara Blakely Gut-Check (Auto-Triggered)

Per SKILL.md instructions, a Sara Blakely customer review agent will be spawned after this plan is approved to validate customer value alignment.

---

*This plan generated by Great Minds Agency Phase Planning skill (GSD methodology)*
