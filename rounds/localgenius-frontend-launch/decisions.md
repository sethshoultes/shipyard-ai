# LocalGenius Frontend Launch — Locked Decisions
**Consolidated by:** Phil Jackson (Zen Master, Great Minds Agency)
**Date:** 2026-04-15
**Status:** Blueprint for Build Phase

---

## I. LOCKED DECISIONS — BY DECISION AREA

### A. Product Name & Brand
**Decision:** Keep "LocalGenius" for v1 launch
**Proposed by:** Elon (defend), Steve (concede)
**Winner:** Elon
**Rationale:**
- Steve proposed "Beacon" for emotional resonance but conceded SEO value matters more pre-PMF
- Elon argued rebranding in Week 1 wastes 2 days (new repo, domains, docs, wp.org screenshots)
- Compromise: Ship as LocalGenius, gather data from 1000 users, rebrand later if metrics justify
- **Technical note:** "AI chat for local businesses" searches surface "LocalGenius" naturally; "Beacon" requires brand spend we don't have

### B. Core Value Proposition
**Decision:** "Never lose a customer to an unanswered question" (peace of mind, not AI tech)
**Proposed by:** Steve
**Winner:** Steve (with Elon endorsement)
**Rationale:**
- Steve: "We're selling peace of mind, not metered software"
- Elon conceded: "Benefits over tech specs" — marketing leads with emotional hook, not Cloudflare Workers infrastructure
- Essence doc validates: "Relief. 'It already works.' Peace of mind."
- **Copy direction:** "Never miss a customer question again" beats "AI-powered chat widget"

### C. Pricing Model
**Decision:** $29/month flat, unlimited chats, no freemium
**Proposed by:** Steve (defend), Elon (propose alternative, lose debate)
**Winner:** Steve
**Rationale:**
- Elon proposed: Free tier (50 chats/month) with "Powered by LocalGenius" badge, paid tier for unlimited
- Steve countered: "Usage limits train users to think of this as cost center. They'll game limits, resent upgrade prompts."
- Steve's logic: Peace of mind cannot be metered. Flat pricing signals confidence, not anxiety.
- Essence doc confirms: "$29/month flat. No usage limits. No freemium anxiety."
- **Exception:** "Powered by LocalGenius" badge stays (Steve conceded for distribution), but appears in all tiers, not just free

### D. Week 1 Scope — What Ships
**Decision:** Minimal but not generic — Chat widget + Magical onboarding + FAQ editor
**Proposed by:** Steve (refined), Elon (challenged, partial concede)
**Winner:** Compromise

**SHIP Week 1:**
- ✅ Chat widget (bubble + interface, <2s response time)
- ✅ 60-second magical onboarding:
  - Auto-detect business type from WordPress metadata
  - Pre-populate 10 smart FAQs (not 15 — Elon's concession)
  - Show live preview pane with chat bubble
  - User clicks ONE button to activate
- ✅ Admin FAQ editor (manual input/override)
- ✅ `/chat` API endpoint with FAQ caching layer
- ✅ WordPress plugin structure
- ✅ "Powered by LocalGenius" footer badge

**Rationale:**
- Elon initially pushed "functional v1" (chat widget + FAQ editor, no onboarding polish)
- Steve argued: "Shipping generic = uninstalls in 3 days. Design quality IS distribution."
- Elon conceded: "First 30 seconds define retention. 'It already works' moment is critical."
- Compromise: Ship magical onboarding but cut animations/brand voice copy to v2
- Essence doc validates: "60-second setup that feels magical. Auto-detects business, pre-populates FAQs, shows live preview."

### E. Week 1 Scope — What's CUT
**Decision:** Defer analytics, digests, benchmarks to Month 2+
**Proposed by:** Elon
**Winner:** Elon (Steve conceded all)

**CUT from v1:**
- ❌ Benchmark Engine (competitive rankings)
  - Steve conceded: "#1 of 1 pizza place" is embarrassing; need density first
  - Elon's logic: Requires 50+ businesses per city per category; Google Places API = $680/month burn at 10 customers
- ❌ Weekly Digest emails
  - Steve initially defended emotional hook ("You answered 47 questions this week")
  - Conceded: Need 50 active users generating real data before digest has value
- ❌ Analytics dashboard
  - Elon: "What are you analyzing? 12 questions/week?"
  - Defer until Week 4 when beta users generate data worth showing
- ❌ GDPR consent flow (add when first EU customer appears)
- ❌ Customizable fonts/colors (Steve: "We designed it. Don't touch it.")
- ❌ Drag-and-drop FAQ reordering (Steve: "If auto-generation is good, this is unnecessary")

**Rationale:**
- Elon: "Stop building features for users you don't have yet."
- Steve's concession: "Week 1 should be minimal, but not generic."
- Essence doc confirms: "Ship functional, iterate to magical."

### F. Technical Architecture — Performance
**Decision:** FAQ caching layer (D1) before LLM calls
**Proposed by:** Elon
**Winner:** Elon (Steve conceded)
**Rationale:**
- Elon: "80% of questions repeat ('Do you deliver?'). Hit D1 cache first, LLM second."
- Benefits:
  - Response time: 3sec → 200ms
  - Cost savings: ~70% reduction in OpenAI API calls
  - Scalability: 10k customers without $30k/month LLM burn
- Steve initially wanted "alive conversations" over caching
- Steve conceded: "I missed the latency blocker. >2s response = users bounce."
- **Implementation:** Before `/chat` endpoint hits OpenAI, check D1: "Has THIS business answered this question before?" If yes, return cached response.

### G. Technical Architecture — Stack
**Decision:** Vanilla JS, no build step, <20KB
**Proposed by:** Elon (implicitly from original PRD)
**Winner:** Unopposed
**Rationale:**
- Elon: "Every framework adds complexity you don't need."
- Cloudflare Workers + D1 + R2 storage
- No debate occurred; Steve focused on UX, not stack

### H. Distribution Strategy
**Decision:** Outbound sales motion (email outreach, blogger seeding, "Powered by" badge)
**Proposed by:** Elon
**Winner:** Elon (Steve conceded)
**Rationale:**
- Elon: "wp.org has 60k plugins. Organic = 5 installs/week. Need distribution BEFORE launch."
- Plan:
  1. Email 50 WordPress SEO bloggers ("Best AI Chat Plugins 2026" listicles)
  2. Scan BuiltWith data → Email 1000 local businesses using WordPress
  3. "Powered by LocalGenius" footer link in all installs
- Steve conceded: "Hoping for wp.org organic traffic is delusional. Outbound email playbook is correct."
- **Target:** 500 installs in Month 1 (15/day)

### I. Design Philosophy
**Decision:** Design quality that earns word-of-mouth
**Proposed by:** Steve
**Winner:** Steve (Elon partial concede)
**Rationale:**
- Steve: "Design quality isn't luxury — it's distribution. If customers aren't proud to show it, we failed."
- Elon initially resisted ("800 lines of onboarding code for feelings?")
- Elon conceded: "Polish signals 'this company gives a shit.' Janky = sketchy offshore software. Spend 20% of dev time on UI details."
- Compromise: Beautiful chat widget, clean onboarding UX; cut pulsing animations and overwrought brand voice copy
- Essence doc validates: "Design quality that earns pride. 'Powered by LocalGenius' footer only works if product looks insanely great."

---

## II. MVP FEATURE SET — WHAT SHIPS IN V1

### Core Features (Week 1)
1. **Chat Widget**
   - Bubble interface (clean, fast, <20KB)
   - <2 second response time (via FAQ caching)
   - "Powered by LocalGenius" footer badge
   - Minimal customization (accent color only — Elon's concession to avoid theme conflicts)

2. **60-Second Magical Onboarding**
   - Auto-detect business type from WordPress site metadata (title, categories)
   - Auto-populate 10 FAQs based on business type
   - Live preview pane showing chat bubble on user's site
   - ONE-BUTTON activation ("Yes, that's me")
   - **Emotional goal:** "Holy shit, this already works" (Steve's non-negotiable)

3. **Admin FAQ Editor**
   - Manual input/edit of FAQs
   - Override auto-generated FAQs
   - Simple CRUD interface (no drag-and-drop reordering)

4. **Backend (`/chat` API)**
   - FAQ caching layer (D1 SQLite)
   - OpenAI fallback for non-cached questions
   - Response time optimization: cache-first architecture
   - No streaming in v1 (defer to v2 if latency issues arise)

5. **WordPress Plugin**
   - wp.org submission-ready
   - Settings page: API key input, FAQ management
   - Widget embed code auto-injection

### Deferred to Month 2+
- Weekly Digest emails (need 50 active users first)
- Analytics dashboard (need meaningful data)
- Benchmark Engine (need competitive density per city/category)
- GDPR consent flow (add when first EU customer requests)
- Advanced customization (fonts, animations, etc.)

### Permanently Cut
- Multi-language support (serve Austin perfectly before Madrid poorly)
- White-label tier (say no to agency requests until v3+)
- Customizable bubble animations

---

## III. FILE STRUCTURE — WHAT GETS BUILT

### Frontend (Vanilla JS)
```
/frontend
  /widget
    chat-bubble.js          # Bubble UI component
    chat-interface.js       # Expanded chat window
    api-client.js           # Handles /chat endpoint calls
    cache-handler.js        # Client-side response caching (optional)
  /admin
    onboarding-wizard.js    # 60-second setup flow
    faq-editor.js           # CRUD for FAQs
    preview-pane.js         # Live preview renderer
  /styles
    widget.css              # Chat bubble + interface styles
    admin.css               # Dashboard styles
  /utils
    business-detector.js    # Auto-detect business type from WP metadata
    faq-generator.js        # Pre-populate FAQs by business type
```

### WordPress Plugin
```
/wordpress-plugin
  localgenius.php           # Main plugin file
  /includes
    settings.php            # Admin settings page
    widget-embed.php        # Inject widget script into site
    api-config.php          # Store/retrieve API keys
  /assets
    /js                     # Compiled frontend scripts
    /css                    # Compiled styles
  readme.txt                # wp.org submission doc
```

### Backend (Cloudflare Workers)
```
/backend
  /workers
    chat.js                 # /chat API endpoint
    faq-cache.js            # D1 cache layer (query, store, invalidate)
  /db
    schema.sql              # D1 table schemas (faqs, chat_logs, businesses)
  /utils
    openai-client.js        # LLM fallback handler
    response-formatter.js   # Normalize responses
```

### Infrastructure
```
/infrastructure
  wrangler.toml             # Cloudflare Workers config
  /migrations
    001-initial-schema.sql  # D1 migration
```

---

## IV. OPEN QUESTIONS — WHAT STILL NEEDS RESOLUTION

### 1. FAQ Auto-Generation Logic
**Question:** How do we pre-populate 10 FAQs for each business type?
- **Options:**
  - A) Hardcoded templates per business type (fast, limited)
  - B) GPT-4 prompt: "Generate 10 FAQs for a [business type] in [city]" (flexible, costs $)
  - C) Hybrid: Base templates + GPT-4 refinement
- **Blocker:** Steve's "it already works" moment requires this to be accurate on first launch
- **Decision needed by:** Day 1 of build

### 2. OpenAI Timeout & Streaming Strategy
**Question:** If LLM response takes >2 seconds, do we stream or timeout?
- **Elon flagged:** "PRD doesn't mention timeout. If `/chat` takes 3+ seconds, users close widget."
- **Options:**
  - A) 2-second hard timeout → fallback to "I'm not sure, contact us at [business email]"
  - B) Server-Sent Events (SSE) streaming for gradual response
  - C) Aggressive prompt optimization to guarantee <1.5s responses
- **Decision needed by:** Day 2 of build

### 3. "Powered by LocalGenius" Badge Placement
**Question:** Where exactly does the badge appear?
- **Options:**
  - A) Bottom of chat interface (always visible)
  - B) Footer of chat bubble (collapses with bubble)
  - C) Separate footer element on page (independent of widget)
- **Design decision:** Steve's concession allows badge, but placement affects UX
- **Decision needed by:** Day 1 of build

### 4. Accent Color Customization Scope
**Question:** Elon conceded "one CSS variable for accent color" — what's customizable?
- **Elon's rationale:** "Every theme has different colors. If bubble is always blue and site is orange, it looks broken."
- **Steve's resistance:** "No customizable fonts or animations."
- **Options:**
  - A) Single CSS var: `--localgenius-accent-color` (Elon's proposal)
  - B) Auto-detect from WordPress theme primary color
  - C) No customization, but choose neutral default (gray/black)
- **Decision needed by:** Day 1 of build

### 5. Beta User Outreach — Messaging & List
**Question:** Who receives the "50 blogger emails" and "1000 business emails"?
- **Elon's plan:** BuiltWith scraping + SEO blogger outreach
- **Open questions:**
  - Who writes the email copy? (Steve's brand voice vs. Elon's direct style)
  - What's the offer? ("Free early access" vs. "$29/month, first 50 users get 3 months half-off")
  - Who owns the scraping/outreach execution?
- **Decision needed by:** Week 1 (parallel to build)

### 6. What Triggers Paid Conversion?
**Question:** If there's no free tier, why would someone start paying $29/month immediately?
- **Steve's model:** Flat $29/month, no trial
- **Risk:** High friction for cold signups
- **Options:**
  - A) 14-day free trial, then $29/month
  - B) Freemium with badge removal as upsell (Elon's original proposal, rejected)
  - C) Guarantee: "Cancel anytime, refund if not satisfied in first 30 days"
- **Decision needed by:** Before launch (affects checkout flow)

---

## V. RISK REGISTER — WHAT COULD GO WRONG

### Critical Risks (Build Phase)

#### Risk 1: Magical Onboarding Fails to Detect Business Type
- **Failure mode:** WordPress site has generic title ("Home"), no location metadata → auto-detection breaks
- **Impact:** Steve's "it already works" moment becomes "configure 47 settings" → uninstalls
- **Mitigation:**
  - Fallback flow: "What type of business do you run?" dropdown if auto-detect fails
  - Test with 20 diverse WordPress sites during development
- **Owner:** Technical lead

#### Risk 2: LLM Response Latency Kills UX
- **Failure mode:** OpenAI API takes 3-5 seconds → users close widget, perceive as broken
- **Impact:** High bounce rate, negative reviews
- **Mitigation:**
  - Implement FAQ caching (Elon's decision) to hit <500ms for 80% of queries
  - Set 2-second timeout with graceful fallback message
  - Monitor p95 latency in Week 1 beta
- **Owner:** Backend engineer

#### Risk 3: wp.org Approval Delays Launch
- **Failure mode:** WordPress.org plugin review takes 2-4 weeks; submission rejected for guideline violations
- **Impact:** Can't distribute to target users, delays revenue
- **Mitigation:**
  - Pre-review against wp.org guidelines before submission
  - Have manual install option (download .zip) for early beta testers
  - Budget 2 weeks for approval in launch timeline
- **Owner:** Project manager

#### Risk 4: OpenAI API Costs Spiral Before Revenue Scales
- **Failure mode:** 500 installs × 50 chats/month × $0.002/call = $50/month cost, but only 10 paying customers ($290 MRR) → negative margin
- **Impact:** Burn cash before PMF
- **Mitigation:**
  - FAQ caching reduces costs by ~70% (Elon's analysis)
  - Monitor LLM call volume daily; throttle if costs exceed $100/month pre-launch
  - Consider cheaper models (GPT-3.5-turbo) for FAQ matching vs. generative responses
- **Owner:** Finance/product lead

#### Risk 5: Design Quality Slips → "Generic Chat Widget" Perception
- **Failure mode:** Time pressure forces shortcuts on UI polish → looks like Intercom clone → no word-of-mouth
- **Impact:** Steve's "design IS distribution" thesis fails; no organic growth
- **Mitigation:**
  - Allocate 20% of dev time to UI details (Elon's concession)
  - Ship with placeholder animations if needed, but never ship broken/janky UX
  - Internal design review before beta launch
- **Owner:** Design lead (Steve proxy)

### Launch Risks (Distribution Phase)

#### Risk 6: Blogger Outreach Gets Ignored
- **Failure mode:** "Best AI Chat Plugins 2026" bloggers ignore cold emails → no press coverage
- **Impact:** Fail to hit 500 installs in Month 1 target
- **Mitigation:**
  - Personalize emails (reference blogger's previous posts)
  - Offer exclusive early access + affiliate revenue share
  - Fallback: Paid placement on high-traffic WordPress blogs ($500 budget)
- **Owner:** Growth lead (Elon proxy)

#### Risk 7: BuiltWith Scraping Hits Legal/Technical Walls
- **Failure mode:** BuiltWith data is outdated, scraped emails bounce, or outreach flagged as spam
- **Impact:** Can't execute direct outreach to 1000 businesses
- **Mitigation:**
  - Use Hunter.io for email verification before sending
  - Send from personal domain (not @localgenius.com) to avoid spam filters
  - Cap initial batch to 100 emails, test deliverability before scaling
- **Owner:** Growth lead

#### Risk 8: First Beta Users Leave Negative wp.org Reviews
- **Failure mode:** Setup takes >60 seconds or widget breaks on specific themes → 1-star reviews → tank wp.org ranking
- **Impact:** Kills organic discovery, reputation damage
- **Mitigation:**
  - Private beta with 10 hand-selected users before public wp.org launch
  - Fix all bugs before public submission
  - Proactively ask happy beta users for 5-star reviews to offset negatives
- **Owner:** Product lead

### Product-Market Fit Risks

#### Risk 9: $29/Month is Too High for Unproven Value
- **Failure mode:** Cold WordPress users won't pay $29/month for "AI chat widget" without trial
- **Impact:** Install-to-paid conversion <1%, can't hit $1k MRR in 90 days
- **Mitigation:**
  - Test messaging: emphasize "never lose a customer to unanswered question" (Steve's value prop), not "AI chat"
  - Consider 14-day trial if conversion data supports it (revisit after Week 2)
  - Track "questions answered per week" metric → email users: "You saved 2.3 hours this week"
- **Owner:** Product/growth leads

#### Risk 10: Competitors Clone & Undercut Within 6 Months
- **Failure mode:** Tech stack is simple, no defensible moat; competitor launches at $9/month
- **Impact:** Price pressure, churn risk
- **Mitigation:**
  - Steve's thesis: "60-second onboarding is the moat. Competitors can copy tech, not the dopamine hit."
  - Build brand loyalty through design quality + support excellence
  - Lock in annual contracts ($290/year = 2 months free) to extend LTV
- **Owner:** Strategy lead

---

## VI. SUCCESS METRICS — HOW WE KNOW IT WORKED

### Week 1 (Build Complete)
- [ ] Chat widget functional on 3 test WordPress sites
- [ ] Onboarding flow averages <60 seconds (tested with 5 users)
- [ ] FAQ caching reduces LLM calls by >70%
- [ ] Zero critical bugs in private beta

### Week 2 (Private Beta)
- [ ] 10 hand-selected beta users installed
- [ ] Average setup time <90 seconds
- [ ] >50% of beta users answer "Would you recommend this?" = Yes
- [ ] Collect 3+ testimonials for wp.org submission

### Week 4 (Public Launch)
- [ ] wp.org plugin live (or manual install available if approval delayed)
- [ ] 50 total installs
- [ ] 10 paying customers ($290 MRR)
- [ ] <2 negative reviews on wp.org

### Month 2 (Growth Phase)
- [ ] 500 total installs (Elon's distribution target)
- [ ] 50 paying customers ($1,450 MRR)
- [ ] Ship analytics dashboard (now have data worth showing)
- [ ] Ship Weekly Digest emails (now have users worth retaining)

### Month 3 (Scale Validation)
- [ ] $1,000 MRR milestone
- [ ] Install-to-paid conversion rate >5%
- [ ] NPS >50 among paying customers
- [ ] Begin Benchmark Engine build (now have competitive density)

---

## VII. DECISION AUTHORITY MATRIX

**For unresolved questions during build:**

| Decision Type | Authority | Escalation Path |
|---------------|-----------|-----------------|
| UX/Design details | Steve Jobs | Phil Jackson if impacts timeline |
| Technical architecture | Elon Musk | Phil Jackson if impacts scope |
| Pricing/business model | Steve Jobs (locked) | Not revisitable until Month 2 data |
| Scope cuts (if timeline slips) | Elon Musk | Phil Jackson arbitrates Steve objections |
| Marketing copy/messaging | Steve Jobs | Elon reviews for accuracy |
| Distribution tactics | Elon Musk | Steve reviews for brand consistency |

**Phil Jackson (Zen Master) has final call on:**
- Scope cuts if Week 1 deadline at risk
- Disputes where Steve/Elon disagree on unresolved questions
- Go/no-go decision for public launch

---

## VIII. BUILD PHASE KICKOFF — NEXT ACTIONS

### Immediate (Day 1)
1. **Resolve Open Question #1:** FAQ auto-generation logic (hardcoded vs. GPT-4 vs. hybrid)
2. **Resolve Open Question #3:** "Powered by LocalGenius" badge placement
3. **Resolve Open Question #4:** Accent color customization scope
4. **Set up:** GitHub repo, Cloudflare Workers project, D1 database

### Day 2-3
5. **Build:** Chat widget (bubble + interface)
6. **Build:** `/chat` API endpoint + FAQ caching layer
7. **Resolve Open Question #2:** Timeout/streaming strategy

### Day 4-5
8. **Build:** 60-second magical onboarding wizard
9. **Build:** Admin FAQ editor
10. **Test:** Onboarding flow with 5 internal users, measure time-to-activation

### Day 6-7
11. **Build:** WordPress plugin packaging
12. **Write:** wp.org submission docs (readme, screenshots)
13. **Prepare:** Beta user outreach emails (Steve writes copy, Elon reviews)

### Week 2
14. **Launch:** Private beta to 10 hand-selected users
15. **Execute:** Blogger outreach (50 emails)
16. **Monitor:** Setup time, bug reports, testimonials

### Week 3
17. **Fix:** All critical bugs from beta feedback
18. **Submit:** WordPress.org plugin for approval (or prepare manual .zip)
19. **Execute:** BuiltWith scraping + 1000 business emails

### Week 4
20. **Launch:** Public release (wp.org or manual install)
21. **Track:** Installs, conversions, MRR
22. **Decide:** Month 2 roadmap based on data (analytics dashboard, Weekly Digest, etc.)

---

## IX. ESSENCE — THE NORTH STAR

**From the original essence.md:**

> "Tool that makes small business owners sleep at night because they'll never miss a customer question again."

**The feeling:** Relief. "It already works." Peace of mind.

**The one thing that must be perfect:** 60-second setup that feels magical.

**What to ship Week 1:** Chat widget + minimal onboarding + FAQ editor. Nothing else.

**The trap to avoid:** Building features for users you don't have yet.

---

**This document is the blueprint. Debate is closed. Build begins now.**

— Phil Jackson, Zen Master
Great Minds Agency
