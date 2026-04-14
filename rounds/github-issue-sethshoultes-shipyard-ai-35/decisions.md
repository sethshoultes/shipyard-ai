# Shopfront: Locked Decisions Blueprint
**Phil Jackson — Zen Master, Great Minds Agency**
**Date:** 2026-04-14
**Status:** Build Phase Ready

---

## Executive Summary

After two rounds of debate between Elon Musk (Product & Growth) and Steve Jobs (Design & Brand), we have consensus on the core product strategy. **Shopfront** (formerly CommerceKit) is a simple e-commerce plugin for Emdash CMS that makes anyone a merchant in 30 seconds.

**Key Principle:** WordPress made everyone a publisher. Shopfront makes everyone a merchant.

---

## 1. LOCKED DECISIONS

### 1.1 Product Name
**Decision:** SHOPFRONT
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs
**Why:**
- Evokes physical storefront — universally understood by merchants
- Positions as merchant tool, not developer library
- "CommerceKit" has better SEO, but "Shopfront" has better emotional resonance
- Elon conceded in Round 2: "Shopfront feels like a product. CommerceKit feels like a library."
- **Final agreement:** A/B test both names in demo; "Shopfront" won consensus

**Status:** ✅ LOCKED

---

### 1.2 Target Customer
**Decision:** Small merchants selling 5-50 products
**Proposed by:** Both (consensus)
**Why:**
- Emdash CMS users needing simple e-commerce
- Consultants/agencies building client sites on Cloudflare
- Creators allergic to WooCommerce complexity
- NOT targeting: Enterprises, 1000+ SKU stores, Amazon-scale sellers

**Status:** ✅ LOCKED

---

### 1.3 First-Run Experience
**Decision:** ONE button — "Add Your First Product"
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs
**Why:**
- No setup wizard, no settings maze, no tour
- User clicks → sees form (name, price, photo, description) → hits "Publish" → product is live
- Creates immediate "I'm a merchant now" emotional hook
- Elon's concession (Round 2): "Zero-config defaults. Stripe key goes in one field. Everything else auto-configures."

**Implementation:**
1. Four fields: Product name, Price, Photo, Description
2. One button: "Publish"
3. Result: Product live at `yoursite.com/shop/product-name`
4. Next actions shown: "Share this" | "Add another" | "Set up payments"

**Status:** ✅ LOCKED

---

### 1.4 Payment Gateway
**Decision:** Stripe-only, zero customization
**Proposed by:** Both (unanimous)
**Winner:** N/A (full consensus)
**Why:**
- Every choice = support ticket
- Stripe handles PCI compliance, global payments, taxes
- No "choose your gateway" settings
- PayPal, Square = v2.0+ features only

**Elon's position:** "One payment provider. Hardcoded. No settings."
**Steve's position:** "Stripe only. One choice, perfectly executed."

**Status:** ✅ LOCKED

---

### 1.5 Architecture: KV-First Storage
**Decision:** Use Cloudflare KV for all data storage (no PostgreSQL)
**Proposed by:** Elon Musk (Round 1)
**Winner:** Elon Musk
**Why:**
- Zero schema migrations when adding features
- No database credentials to manage
- Scales automatically to 100k+ orders
- Simpler = fewer moving parts = fewer bugs

**Steve's concession (Round 2):** "You can't handwave infrastructure and expect elegance. Simple architecture = simple product."

**Status:** ✅ LOCKED

---

### 1.6 Performance Budget
**Decision:** 200ms page load maximum
**Proposed by:** Elon Musk (Round 2)
**Winner:** Elon Musk
**Why:**
- <200ms = perceived as "instant" by users
- Slower = "feels broken" or "feels cheap"
- Performance compounds: every 100ms delay costs conversions

**Requirements:**
- KV list operations (not serial reads)
- Cached product lists (60s TTL)
- Async email sending (queued, not blocking checkout)

**Steve's concession:** "Speed is the feature that makes all other features feel better."

**Status:** ✅ LOCKED

---

### 1.7 Brand Voice
**Decision:** Human, not technical — merchant language everywhere
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve Jobs
**Why:**
- Words ARE UI
- Sets user expectations and attracts right customers
- Every label uses merchant language, not developer jargon

**Examples:**
- NOT: "Configure payment gateway integration" → **"Let's get you paid. Connect Stripe?"**
- NOT: "Inventory management dashboard" → **"What's in stock?"**
- NOT: "Order fulfillment workflow" → **"Mark as shipped"**
- NOT: "Error: Invalid checkout session configuration" → **"Hmm, something went wrong. Let's try that again?"**

**Status:** ✅ LOCKED

---

### 1.8 Security: Webhook Verification
**Decision:** Fix Stripe webhook signature verification BEFORE any launch
**Proposed by:** Elon Musk (Round 1)
**Winner:** Both (unanimous)
**Why:**
- Current code admits weak verification (line 1000-1001 comment)
- "If we fuck this up, someone loses real money" (Steve, Round 2)
- Not negotiable — security over speed-to-launch

**Status:** ✅ LOCKED (blocks launch)

---

### 1.9 Demo Store First
**Decision:** Build live demo store BEFORE any marketing
**Proposed by:** Elon Musk (Round 1)
**Winner:** Both (consensus)
**Why:**
- "Zero users until there's a demo" (Elon)
- Demo sells itself; marketing without demo is noise
- Optimize for impression BEFORE install, not after

**Demo Requirements:**
- 20 beautifully photographed test products
- Real Stripe test mode checkout
- Actual email confirmations
- Inventory that decrements on purchase
- Order management with status updates
- Deployed live at `demo.shopfront.dev` (or similar)

**Timeline:** Week 1 or launch is blocked

**Status:** ✅ LOCKED (critical path)

---

## 2. MVP FEATURE SET (What Ships in v1)

### 2.1 INCLUDED in v1

| Feature | Why It's Core | Lines of Code |
|---------|--------------|---------------|
| Product CRUD | Can't sell without products | ~130 |
| Cart management | Shopping cart basics | ~180 |
| Stripe checkout | Payment processing | ~200 |
| Order management | Track purchases | ~150 |
| Inventory tracking | Prevent overselling | ~80 |
| Email notifications | Order confirmations | ~100 |
| Admin UI | Manage store in Emdash | ~120 |
| **Basic analytics** | Today's revenue + order count | ~40 |
| **Single-dimension variants** | Size OR color (not both) | ~50 |

**Total v1 scope:** ~1,050 lines (down from 1,420)

---

### 2.2 CUT from v1 (Deferred to v2+)

| Feature | Proposed By | Why Cut | Future Version |
|---------|-------------|---------|----------------|
| **Advanced analytics** | Elon (cut) | Use Stripe dashboard | v1.1 (simplified) |
| **Multi-axis variants** | Elon (simplify) | Complexity explosion | v2.0 |
| **Low stock alerts** | Elon (cut) | Over-engineering | v1.2 |
| Discount codes | Steve (NO) | Feature creep | v2.0+ |
| Multiple payment gateways | Steve (NO) | Support burden | v2.0+ |
| Bulk imports | Steve (NO) | Wrong customer | v3.0+ |
| Subscriptions | Steve (NO) | Scope explosion | v3.0+ |
| Abandoned cart emails | Steve (NO) | Marketing automation | Never |
| CRM integrations | Steve (NO) | Enterprise bloat | Never |
| Themes/templates | Steve (NO) | Plugin, not takeover | Never |

---

### 2.3 Analytics: The Compromise
**Original Elon position:** Cut analytics entirely, use Stripe dashboard
**Steve's challenge:** "Fragmentation. Cognitive overhead. Makes users feel like sys admins."
**Final decision:** Ship **basic analytics** in v1

**What ships:**
- Today's revenue
- This week's order count
- Last month's growth percentage
- All visible in ONE place (the Shopfront dashboard)

**What's cut:**
- Cohort analysis
- LTV calculations
- 30-day KV scans on page load
- Advanced reporting

**Implementation:**
- Pre-calculate on write (order creation)
- Cache in KV with daily rollup
- <50ms dashboard load time

**Status:** ✅ LOCKED (Steve won this debate)

---

## 3. FILE STRUCTURE (What Gets Built)

### 3.1 Core Plugin Files
```
shopfront/
├── sandbox-entry.ts          # Main entry point (KV routing)
├── admin-ui.ts                # Emdash admin interface
├── email.ts                   # Order confirmation emails
├── stripe-integration.ts      # Checkout sessions (NEW - extract from sandbox-entry)
├── analytics.ts               # Basic revenue/order tracking (NEW)
├── README.md                  # Setup instructions
└── package.json               # Dependencies
```

### 3.2 KV Data Structure
```
Prefixes:
- product:{id}                 # Product documents
- cart:{sessionId}             # Shopping carts
- order:{id}                   # Order documents
- order:status:{status}:{id}   # Status index (NEW - for filtering)
- settings:orderCounter        # Atomic order number
- analytics:daily:{date}       # Revenue rollups (NEW)
```

### 3.3 Demo Store Files (NEW)
```
demo/
├── products.json              # 20 seed products
├── images/                    # Product photos
├── deploy.sh                  # One-click deployment
└── README.md                  # Demo walkthrough
```

---

## 4. OPEN QUESTIONS (What Still Needs Resolution)

### 4.1 Test Site Assignment
**Question:** Which Emdash instance is used for testing?
**Blocker:** Can't verify plugin integration without live Emdash site
**Owner:** Infrastructure team
**Deadline:** Before Week 1 development starts

---

### 4.2 Email Provider Configuration
**Question:** Resend or SendGrid for transactional emails?
**Context:** Need configured provider for order confirmations
**Decision needed by:** Week 1 (demo store requires working emails)

---

### 4.3 Demo Store Domain
**Question:** `demo.shopfront.dev` or different subdomain?
**Context:** Need live URL for marketing/social proof
**Decision needed by:** Week 2 (before soft launch)

---

### 4.4 GitHub Repository Structure
**Question:** Standalone repo or Emdash monorepo?
**Context:** Affects distribution strategy (npm package vs. git clone)
**Decision needed by:** Week 1

---

### 4.5 Name A/B Test Results
**Question:** Did "Shopfront" vs "CommerceKit" get validated?
**Context:** Elon proposed A/B test in Round 2; Steve won by consensus
**Status:** Locked as "Shopfront" pending any conflicting data

---

## 5. RISK REGISTER (What Could Go Wrong)

### 5.1 CRITICAL RISKS (Block Launch)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Stripe checkout flow fails in production** | Medium | CRITICAL | Test with real Stripe test mode keys before demo | Elon |
| **Webhook signature verification still weak** | High | CRITICAL | Implement proper Stripe signature validation (non-negotiable) | Elon |
| **Inventory race conditions cause overselling** | Medium | HIGH | Add distributed locks or Durable Objects for order creation | Elon |
| **Emails don't send** | Medium | HIGH | Queue emails via Cloudflare Queues (async) | Elon |
| **Demo store doesn't exist** | High | CRITICAL | Build demo Week 1 or delay launch | Both |

---

### 5.2 HIGH RISKS (Degrade Experience)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Performance degrades at 1000+ orders** | High | MEDIUM | Add KV pagination now (not v1.1) | Elon |
| **First-run UX confuses users** | Medium | HIGH | User test onboarding with 5 non-technical people | Steve |
| **Analytics slow down dashboard** | Medium | MEDIUM | Implement cached rollups (not on-demand calculations) | Elon |
| **Product photos break layout** | Low | MEDIUM | Test with various image sizes/aspect ratios | Steve |

---

### 5.3 MEDIUM RISKS (Delayed Adoption)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **No documentation = no installs** | High | MEDIUM | Write 3-step quickstart (not 30-step) | Elon |
| **SEO invisibility** | High | LOW | Own "serverless e-commerce plugin" keyword | Elon |
| **Wrong customers install it** | Medium | LOW | Clear positioning: "For 5-50 products, not Amazon scale" | Steve |
| **Demo looks generic** | Medium | MEDIUM | Hire photographer or use high-quality stock photos | Steve |

---

### 5.4 LOW RISKS (Monitor Only)

| Risk | Probability | Impact | Mitigation | Owner |
|------|-------------|--------|------------|-------|
| **Cloudflare KV pricing changes** | Low | LOW | Monitor usage; pivot to D1 if needed | Elon |
| **Stripe changes webhook format** | Low | MEDIUM | Subscribe to Stripe API changelog | Elon |
| **Competitor launches first** | Low | LOW | Speed to market (7-day timeline) | Both |

---

## 6. SUCCESS METRICS (90 Days Post-Launch)

| Metric | Target | Stretch Goal | Owner |
|--------|--------|--------------|-------|
| Stores deployed | 50 | 100 | Elon |
| GMV processed | $10k | $50k | Elon |
| GitHub stars | 100 | 500 | Elon |
| GitHub issues filed | 5 | 20 | Both |
| Paying customers (support/hosting) | 1 | 5 | Elon |
| Twitter mentions | 50 | 200 | Steve |
| Demo site visitors | 1,000 | 5,000 | Both |

**Success definition:** 50+ stores deployed AND $10k GMV proves product-market fit.

---

## 7. IMPLEMENTATION TIMELINE

### Week 1: Core Development
**Goal:** Deploy to test Emdash instance, verify all flows work

**Tasks:**
1. Extract Stripe logic into `stripe-integration.ts`
2. Build basic analytics module (`analytics.ts`)
3. Fix webhook signature verification (BLOCKER)
4. Add KV pagination for orders/products
5. Implement async email queue
6. Deploy to test site
7. Verify: Add product → checkout → receive email → see order

**Owner:** Elon (with agent support)
**Deliverable:** Working plugin on test site

---

### Week 2: Demo Store
**Goal:** Build beautiful demo with 20 products, deploy live

**Tasks:**
1. Source/create 20 high-quality product photos
2. Write compelling product descriptions
3. Seed demo database
4. Deploy to `demo.shopfront.dev`
5. Test full checkout flow (Stripe test mode)
6. Record 2-minute walkthrough video

**Owner:** Steve (design), Elon (technical)
**Deliverable:** Live demo URL

---

### Week 3: Documentation & Marketing
**Goal:** Make it installable by strangers

**Tasks:**
1. Write 3-step quickstart guide
2. Create GitHub README with "Deploy to Cloudflare" button
3. Document the NO's (opinionated roadmap)
4. Prepare social media launch assets
5. Draft Product Hunt description

**Owner:** Both
**Deliverable:** Public GitHub repo

---

### Week 4: Soft Launch
**Goal:** Get first 10 installs, collect feedback

**Tasks:**
1. Announce to Emdash community
2. Post on Twitter/X with demo link
3. Share in relevant Cloudflare/serverless communities
4. Monitor GitHub issues
5. Collect user feedback on onboarding

**Owner:** Elon (distribution), Steve (messaging)
**Deliverable:** 10+ real stores deployed

---

## 8. TEAM AGREEMENTS

### 8.1 What Elon Conceded
1. **Name:** "Shopfront" over "CommerceKit" (brand > SEO)
2. **Analytics:** Keep basic analytics in-product (don't force Stripe dashboard)
3. **First-run UX:** Zero-config, one-button experience is non-negotiable
4. **Voice:** Use merchant language, not technical jargon

---

### 8.2 What Steve Conceded
1. **Performance fixes:** Can ship v1.1 optimizations later (if <1000 SKUs)
2. **Variants:** Single-dimension only (size OR color, not both)
3. **Analytics scope:** Today's revenue + order count only (no fancy reporting)
4. **Demo-first:** Build functional demo before perfect design

---

### 8.3 Full Consensus
1. **Stripe-only** payment gateway
2. **Security first:** Fix webhook verification before launch
3. **Demo blocks launch:** No marketing without live demo
4. **Ruthless feature cuts:** Every NO strengthens the product
5. **Performance budget:** 200ms page loads
6. **Ship date:** April 21, 2026 (7 days from Round 2)

---

## 9. DECISION AUTHORITY MATRIX

| Domain | Primary Owner | Veto Power | Requires Consensus |
|--------|--------------|------------|-------------------|
| Product naming | Steve | Elon (SEO concerns) | ✅ Resolved (Shopfront) |
| UX/Voice | Steve | Elon (performance impact) | No |
| Architecture | Elon | Steve (if affects UX) | No |
| Feature cuts | Both | Either can veto | Yes |
| Performance | Elon | Steve (if breaks UX) | No |
| Security | Elon | Steve (if blocks launch) | Yes |
| Marketing | Steve | Elon (if unverified claims) | No |
| Timeline | Elon | Steve (if quality suffers) | Yes |

---

## 10. PHILOSOPHICAL ALIGNMENT

### The Shopfront Promise
1. **Simple:** 30 seconds to first product
2. **Fast:** 200ms page loads
3. **Invisible:** Technical complexity hidden from merchant
4. **Opinionated:** We say NO so you can say YES to customers
5. **Respectful:** Never make users feel stupid

### What We're NOT Building
- WooCommerce alternative (that's defining by negation)
- Developer library (we're merchant-first)
- Enterprise platform (wrong customer)
- Feature-complete solution (ruthless minimalism)

### What We ARE Building
**Commerce that feels native.**
Products are content. Orders are content. Your inventory is your story.

---

## 11. LAUNCH READINESS CHECKLIST

### Blockers (Must Be GREEN)
- [ ] Stripe webhook verification implemented
- [ ] Emails send successfully (queued, not blocking)
- [ ] Demo store live with 20 products
- [ ] Checkout flow tested end-to-end
- [ ] Inventory race conditions fixed
- [ ] Documentation exists (3-step quickstart)

### Quality Gates (Must Be GREEN)
- [ ] First-run UX tested with 5 non-technical users
- [ ] Performance <200ms on all pages
- [ ] Analytics dashboard loads <50ms
- [ ] Product photos don't break layout
- [ ] Error messages use human language

### Nice-to-Have (Can Be YELLOW)
- [ ] A/B test results (Shopfront vs CommerceKit)
- [ ] Video walkthrough recorded
- [ ] Product Hunt assets prepared
- [ ] SEO optimized for "serverless e-commerce"

---

## 12. POST-LAUNCH MONITORING

### Week 1 Metrics
- Installs (target: 10)
- Demo site visitors (target: 100)
- GitHub stars (target: 20)
- Support requests (expect: 5-10)

### Week 4 Metrics
- Stores deployed (target: 50)
- GMV processed (target: $1k)
- GitHub issues (target: 5)
- User testimonials (target: 3)

### Pivot Triggers
If after 30 days:
- <10 installs → Distribution problem (revisit SEO/demo)
- <$1k GMV → Product problem (revisit core value prop)
- >50% uninstall rate → UX problem (revisit first-run experience)
- Zero GitHub issues → No one's using it (revisit marketing)

---

## FINAL WORD

**From Elon:** "This is good code. Not great, not terrible. It's 90% complete and 0% tested. The real question isn't 'can we build it?' — it's 'will anyone use it?' Answer: Not without a demo."

**From Steve:** "First impressions are permanent. Ship something that works at 5,000 orders, not 500. Let's ship something fast that people remember — not something half-assed that people forget."

**From Phil:** You both want the same thing: a product that works beautifully and ships fast. The triangle is balanced. Now build the damn thing.

---

**Next Action:** Assign agent to Week 1 development tasks (sandbox-entry refactor, webhook security, analytics module).

**Blueprint Status:** ✅ LOCKED FOR BUILD
