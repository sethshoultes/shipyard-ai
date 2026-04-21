# LOCKED DECISIONS — PRD WP-Agent Build Blueprint

**Orchestrated by Phil Jackson, Zen Master**
**Source:** Debate rounds between Steve Jobs (Design/Brand) and Elon Musk (Engineering/Execution)

---

## EXECUTIVE SUMMARY

**What we're building:** WordPress plugin with chat widget that answers visitor questions using site content via Claude AI.

**Core thesis:** Zero-config installation. Click activate, it works. The site feels smarter without the owner doing anything.

**Success metric:** User installs, never touches settings, gets email from customer saying "I love the chat thing on your site."

---

## I. LOCKED DECISIONS

### Decision 1: Product Name
**Proposed by:** Steve Jobs
**Counter:** Elon Musk
**Winner:** Deferred to post-launch A/B testing
**Why:**

- **Steve's position:** "GUIDE" — one word, human, memorable, instantly clear purpose
- **Elon's counter:** Trademark lawsuit risk (47 apps called "Guide"), fails domain availability test
- **Resolution:** Both agree "WP-Agent" is terrible. Name must be:
  - Human (not technical jargon)
  - Trademark-safe
  - Passes domain availability
  - Single word preferred

**Build decision:** Ship as working title "GUIDE" pending 30-minute trademark/domain check. If blocked, fallback options: "Concierge", "Compass", or brutally simple "Chat". Rebrand at 10K users if needed, not at 10.

**Risk flag:** Name decision is blocking brand identity but not blocking build. Proceed with placeholder.

---

### Decision 2: Architecture — Simplicity vs Infrastructure
**Proposed by:** Elon Musk
**Counter:** Steve Jobs
**Winner:** Elon (with Steve's quality constraints)
**Why:**

**Elon's case:**
- Original PRD too complex: hybrid AI routing, Cloudflare Workers, vector embeddings = 8-12 hour build
- Simplified version: WordPress plugin + vanilla JS widget + single model = 4 hour build
- "Good enough" beats "perfect but never ships"

**Steve's constraints:**
- Bundle size doesn't matter, perceived speed does
- Don't optimize for shipping speed if it compromises reliability
- Infrastructure is non-negotiable (async proxy needed to avoid crashing sites on shared hosting)

**LOCKED STACK:**
1. **WordPress Plugin** (PHP) — REST endpoint: `/wp-json/wp-agent/v1/chat`
2. **Widget** — Preact (3KB) or vanilla JS with modern build (Vite), NOT full React, NOT raw jQuery
3. **AI Model** — Claude Haiku (single model, no hybrid routing)
4. **Content Indexing** — Smart keyword search (grep-style), NOT vector embeddings in v1, NOT just "top 10 posts"
5. **Infrastructure** — Async AI proxy (Railway/Render/similar) to handle API calls outside WordPress PHP execution
6. **Performance targets:**
   - Widget loads: <500ms
   - Response time: <2s
   - Bundle size: <20KB

---

### Decision 3: Design Philosophy
**Proposed by:** Steve Jobs
**Counter:** Elon Musk (skeptical)
**Winner:** Steve (principles locked)
**Why:**

**Steve's principles:**
- Invisible until needed (no pulsing, no "Try me!" badges, no autoplay)
- Zero configuration (activate plugin = it works, no setup wizard, no API keys)
- Confident simplicity (answers directly, admits when it doesn't know, no corporate jargon)

**Elon's skepticism:**
- "Invisible = unused" (chat widgets have 1-3% engagement vs 30% for search bars)
- "No loading spinner" defies physics (800-1200ms API latency is real)
- Design shouldn't promise what engineering can't deliver

**Resolution:**
- Principles are locked: single subtle icon, minimal UI, no configuration
- Execution is honest: use streaming responses to manage latency perception
- Icon choice deferred: compass (Steve's preference) vs chat bubble (Elon's pragmatism) → A/B test with first 100 users

**Build mandate:**
- Widget UI: self-evident on first interaction (no tutorial, no tour)
- Brand voice: like a good concierge (not butler, not buddy)
- Response format: direct answer + link when possible, honest "I couldn't find that" when not

---

### Decision 4: Scope — What Ships in V1
**Proposed by:** Elon Musk
**Endorsed by:** Steve Jobs
**Winner:** Both aligned
**Why:**

Both agreed: complexity kills launches. Ship the essence, defer everything else.

#### ✅ IN V1 (MVP Feature Set):
1. **Content indexing** — Scrape site posts/pages (titles + full text), store in WordPress transients
2. **Chat widget** — Preact/vanilla JS, <20KB, streaming responses
3. **Single REST endpoint** — Accepts query, passes context to Claude Haiku, returns answer
4. **Zero-config install** — Activate plugin → widget appears with default styling
5. **Basic admin page** — On/off toggle ONLY
6. **"Powered by GUIDE" branding** — Always on (badge of quality, not shame)

#### ❌ OUT OF V1 (Deferred to V2+):
- Vector embeddings / semantic search
- Cloudflare Workers deployment option
- Hybrid AI routing (multi-model)
- Widget color customization
- Branding toggle (hide "Powered by")
- Analytics dashboard
- Conversational memory across sessions
- Multi-language support
- WooCommerce integration
- Admin settings beyond on/off

**Rationale:** Every feature is a place to fail. Prove core value first.

---

### Decision 5: Distribution Strategy
**Proposed by:** Elon Musk
**Counter:** Steve Jobs
**Winner:** Both (phased approach)
**Why:**

**Elon's math:**
- WordPress.org Plugin Directory = 90% of installs
- Top 1% get 10K+ installs organically via search
- Key: Get 3 early 5-star reviews in first week (algorithm weights recent reviews)
- ProductHunt/Twitter/Reddit = noise (50-100 installs total)

**Steve's addition:**
- WordPress.org proves volume, but volume ≠ revenue
- Target vertical markets for monetization: yoga studios, restaurants, local services
- 100 paying users > 10,000 free users

**LOCKED STRATEGY:**
- **Phase 1:** WordPress.org submission (volume + proof)
- **Phase 2:** Niche communities (revenue + case studies)
- **Phase 3:** Word of mouth (the product markets itself if it's great)

**Critical path:** Get first 10 users to 5-star reviews within 7 days of WordPress.org launch.

---

## II. MVP FEATURE SET (What Ships in V1)

### Core Functionality
1. **Visitor Experience:**
   - Sees single icon (bottom-right, subtle)
   - Clicks → widget opens instantly
   - Types question → sees streaming response within 2s
   - Gets direct answer + link to relevant page
   - Closes widget, continues browsing

2. **Site Owner Experience:**
   - Installs plugin from WordPress.org
   - Clicks "Activate"
   - Widget appears on site automatically
   - Never touches settings (unless they want to turn it off)
   - Gets email from customer praising the chat feature

3. **Technical Flow:**
   - Plugin indexes site content on activation (posts, pages → transients)
   - Visitor query → REST endpoint → async proxy → Claude Haiku
   - Haiku receives: query + relevant site content (keyword-matched)
   - Returns: natural language answer
   - Widget displays: streaming response

### Performance Constraints
- Widget load time: <500ms (first paint)
- Time to interactive: <1s (can accept input)
- Response time: <2s (answer appears)
- Bundle size: <20KB (widget JavaScript)

### User-Facing Copy
- Widget placeholder: "What are you looking for?"
- Confident answers: "Yes, we deliver to Brooklyn. Here's our delivery policy."
- Honest unknowns: "I couldn't find that info, but here's our contact page."
- No jargon, no apologies, no "AI-powered" bragging

---

## III. FILE STRUCTURE (What Gets Built)

```
wp-agent/
├── wp-agent.php                 # Main plugin file (WordPress headers, activation hooks)
├── includes/
│   ├── class-content-indexer.php    # Scrapes posts/pages, stores in transients
│   ├── class-api-handler.php        # REST endpoint logic, proxy communication
│   └── class-admin.php              # Settings page (on/off toggle)
├── widget/
│   ├── src/
│   │   ├── index.js                 # Widget entry point (Preact or vanilla)
│   │   ├── chat.js                  # Chat UI component
│   │   └── api.js                   # Frontend API calls (streaming)
│   ├── dist/
│   │   └── widget.min.js            # Built bundle (<20KB)
│   └── package.json                 # Build config (Vite)
├── proxy/
│   ├── index.js                     # Node.js server (Railway/Render)
│   ├── claude.js                    # Anthropic API integration
│   └── package.json                 # Dependencies (anthropic SDK)
├── assets/
│   ├── icon-compass.svg             # Icon option 1
│   ├── icon-chat.svg                # Icon option 2
│   └── style.css                    # Widget minimal styling
└── README.txt                       # WordPress.org submission (install instructions)
```

### Build Steps (Sequential)
1. WordPress plugin scaffold (PHP) — 30 min
2. Content indexer (scrape + transient storage) — 45 min
3. REST endpoint (accepts query, formats context) — 30 min
4. Async proxy server (Node.js + Claude API) — 45 min
5. Widget (Preact/vanilla JS, streaming UI) — 2 hours
6. Admin page (on/off toggle) — 30 min
7. Integration testing — 1 hour

**Total estimated build time:** 5.5 hours (within one agent session)

---

## IV. OPEN QUESTIONS (What Still Needs Resolution)

### Critical (Blocking Launch)
1. **Product name trademark clearance**
   - Action: 30-min search for "GUIDE" + backups
   - Owner: Pre-build task
   - Deadline: Before WordPress.org submission

2. **Free API tier strategy**
   - Problem: Zero-config = no user API keys = we pay for all queries
   - Options:
     - A) Include free tier (100 queries/month per site), upsell beyond
     - B) Freemium model (plugin free, API access paid)
     - C) Partner with Anthropic for startup credits
   - Impact: Determines revenue model
   - Owner: Business decision (not engineering)

3. **Proxy hosting costs at scale**
   - Problem: 10K installs × 1K queries/month = 10M requests
   - Cost estimate: $0.01/query (Haiku) = $100K/month
   - Mitigation: Rate limiting per site, tiered pricing, caching
   - Owner: Financial model (not blocking v1, but critical for v2)

### Important (Not Blocking, But Soon)
4. **Icon choice (compass vs chat bubble)**
   - Resolution: Ship with both, A/B test first 100 users
   - Metric: Engagement rate (clicks per visitor)

5. **Content refresh frequency**
   - Question: How often to re-index site content?
   - Options: On post publish, daily cron, manual trigger
   - Default: On post publish + daily cron

6. **Widget position customization**
   - V1: Bottom-right only
   - V2: Allow bottom-left, custom positioning?
   - Deferred to user feedback

### Deferred (Post-V1)
7. Multi-language support (English only in v1)
8. WooCommerce integration (product Q&A)
9. Analytics dashboard (query volume, popular questions)
10. Conversational memory (session persistence)

---

## V. RISK REGISTER (What Could Go Wrong)

### HIGH SEVERITY

**Risk 1: Crashes User Sites (Shared Hosting)**
- **Cause:** AI API calls block PHP execution on cheap hosting
- **Probability:** High (most WordPress sites on shared $5/mo hosting)
- **Mitigation:** LOCKED — async proxy server handles all AI calls
- **Owner:** Engineering (non-negotiable architecture decision)
- **Status:** Mitigated by Decision 2 (async proxy)

**Risk 2: API Cost Explosion**
- **Cause:** Viral growth without rate limiting
- **Impact:** $10K+/month in unexpected Claude API costs
- **Probability:** Medium (only if we succeed)
- **Mitigation:**
  - Rate limit: 100 queries/site/month in free tier
  - Hard cap: Proxy refuses requests beyond limit
  - Monitoring: Alert at $1K/day spend
- **Owner:** DevOps + Finance
- **Status:** Requires implementation before launch

**Risk 3: WordPress.org Rejection**
- **Cause:** Security review fails, violates guidelines
- **Common issues:** External API calls, bundled libraries, security holes
- **Probability:** Medium-High (strict review process)
- **Mitigation:**
  - Follow WordPress coding standards
  - Sanitize all inputs, escape all outputs
  - Use WordPress HTTP API for external calls
  - Include unminified source code
- **Owner:** WordPress plugin guidelines compliance
- **Status:** Requires careful review before submission

### MEDIUM SEVERITY

**Risk 4: Poor Answer Quality**
- **Cause:** Keyword search misses relevant content
- **Impact:** Users get "I don't know" when answer exists
- **Probability:** Medium (Steve's concern re: "top 10 posts")
- **Mitigation:** Smart keyword search (not just titles), full-text indexing
- **Fallback:** Always provide contact page link when uncertain
- **Owner:** Content indexing logic
- **Status:** Build quality gates in indexer

**Risk 5: Slow Widget Load (3G/4G)**
- **Cause:** Bundle size, network latency, render blocking
- **Impact:** Breaks Steve's "instant" experience
- **Probability:** Medium (depends on build optimization)
- **Mitigation:**
  - <20KB bundle size (enforced)
  - Lazy load widget on interaction (not on page load)
  - CDN for widget assets
- **Owner:** Frontend build process
- **Status:** Performance budget locked at <500ms

**Risk 6: Trademark Dispute ("GUIDE")**
- **Cause:** Existing trademark holders, app name conflicts
- **Impact:** Forced rebrand, lost marketing momentum
- **Probability:** Medium (Elon's concern, 47 existing "Guide" apps)
- **Mitigation:**
  - Trademark search before launch
  - Backup names ready
  - Rebrand at 10K users if needed (acceptable loss)
- **Owner:** Legal/Brand
- **Status:** Action required (see Open Question 1)

### LOW SEVERITY

**Risk 7: Low Engagement (1-3% Click Rate)**
- **Cause:** Banner blindness, invisible widget
- **Impact:** Product works but nobody uses it
- **Probability:** High (Elon's data on chat widget engagement)
- **Mitigation:**
  - A/B test icon styles (compass vs chat)
  - User education: WordPress.org listing emphasizes visitor benefit
  - Let product quality drive word-of-mouth
- **Owner:** Marketing + UX research
- **Status:** Accept as baseline, optimize in v2

**Risk 8: Competitor Clones Fast**
- **Cause:** Simple architecture, open-source plugin
- **Impact:** Market saturation before we gain traction
- **Probability:** Medium (if we prove demand)
- **Mitigation:**
  - Ship FAST (Elon's point: "first owns the feeling")
  - Quality moat: zero-config, better answers, design polish
  - Network effects: WordPress.org reviews create defensibility
- **Owner:** Execution speed
- **Status:** Mitigated by aggressive timeline

---

## VI. DECISION FRAMEWORK (How Disagreements Were Resolved)

### Guiding Principles (From Essence.md)
1. **Zero-config installation** — If user has to configure, we failed
2. **Invisible until needed** — Subtle, not desperate for attention
3. **Make it work, make it fast, make it easy** — In that order
4. **Ship in one agent session** — Forces architectural honesty

### Resolution Patterns
- **Steve wins on:** Brand, design philosophy, user experience goals
- **Elon wins on:** Architecture, scope cuts, shipping speed
- **Both defer when:** Decision doesn't block build (icon choice, name trademark)
- **Both align on:** Simplicity, zero-config, quality bar

### Intellectual Honesty Moments
- **Steve concedes:** React probably overkill → Preact or vanilla JS
- **Elon concedes:** Name matters → "WP-Agent" is bad, rebrand needed
- **Steve concedes:** Hybrid AI routing premature → single model in v1
- **Elon concedes:** Async proxy non-negotiable → infrastructure required

---

## VII. SUCCESS CRITERIA (How We Know It Worked)

### Launch Week (Days 1-7)
- ✅ 10 installations from WordPress.org
- ✅ 3 five-star reviews submitted
- ✅ Zero 1-star reviews mentioning "crashed my site"
- ✅ Widget loads <500ms on test sites (3G network)
- ✅ Answer quality: >80% relevant responses (manual QA on 50 test queries)

### Month 1
- ✅ 100 active installations
- ✅ 10+ five-star reviews (avg rating >4.5)
- ✅ At least 1 unsolicited testimonial ("customer loved the chat")
- ✅ <$500 in API costs (proves rate limiting works)

### Month 3 (Product-Market Fit Signal)
- ✅ 1,000 active installations (WordPress.org organic growth)
- ✅ 5% engagement rate (visitors clicking widget)
- ✅ First paying customer (vertical market, $20/mo tier)
- ✅ Zero critical bugs reported (crashes, security issues)

### The Steve Jobs Metric
> "Someone installs it, never touches the settings, and a week later gets an email from a customer saying 'I love the chat thing on your site.'"

**How to measure:**
- User survey 7 days post-install: "Have you received positive feedback?"
- Testimonial collection: WordPress.org reviews mentioning customer delight
- Support ticket sentiment: Ratio of praise to problems

---

## VIII. BUILD PHASE HANDOFF

### Immediate Next Actions
1. **Pre-build (30 min):**
   - Trademark search: "GUIDE" + backups (Concierge, Compass, Chat)
   - Domain availability check
   - Lock name or proceed with placeholder

2. **Build Sprint (5.5 hours):**
   - Follow file structure (Section III)
   - Hit performance targets (widget <500ms, response <2s)
   - Manual QA: 10 test queries on fresh WordPress install

3. **Pre-launch (1 day):**
   - WordPress.org submission prep (README.txt, screenshots)
   - Security review (sanitize inputs, follow WP coding standards)
   - Rate limiting implementation (100 queries/site/month)

4. **Launch (Week 1):**
   - Submit to WordPress.org
   - Manual outreach to 10 target users (yoga studios, restaurants)
   - Request reviews from first 3 users

### Open Loops to Close
- [ ] Finalize product name (trademark + domain check)
- [ ] Set up async proxy hosting (Railway/Render account)
- [ ] Configure Claude API key + billing alerts
- [ ] Implement rate limiting (queries per site)
- [ ] Create WordPress.org assets (icon, banner, screenshots)
- [ ] Draft README.txt (installation, FAQ, changelog)

### Who Owns What
- **Engineering:** Build to spec (5.5 hours), WordPress.org submission
- **Design:** Icon finalization (compass vs chat bubble)
- **Business:** API cost monitoring, rate limit strategy, pricing model
- **Legal:** Trademark clearance
- **Marketing:** First 10 user outreach, review requests

---

## IX. PHILOSOPHICAL ALIGNMENT (The "Why")

### Steve's Vision
"This makes websites feel alive. It's not about AI. It's about pride — my site is better than my competitor's."

### Elon's Execution
"Ship fast or someone else will own this feeling. The product that ships first wins. Perfect is the enemy of shipped."

### The Synthesis (Phil Jackson)
Build the thing Steve described using the system Elon designed.

**Quality without complexity.**
**Speed without compromise.**
**Magic through simplicity.**

The yoga studio owner clicks "Activate." The widget appears. A visitor asks about prenatal classes. The answer is instant and correct. The owner gets an email: "I love the chat thing."

That's the game. Everything else is noise.

---

**Blueprint Status:** LOCKED
**Build Authorization:** APPROVED
**Timeline:** One agent session (5.5 hours estimated)
**Go/No-Go:** Pending trademark clearance only (non-blocking for code build)

*Orchestrated by Phil Jackson, Zen Master of the Great Minds Agency*
*Synthesized from 2 rounds of debate between Steve Jobs (Design) and Elon Musk (Engineering)*
*Date: 2026-04-21*
