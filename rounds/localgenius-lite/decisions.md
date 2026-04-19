# SPARK — Build Blueprint
**Date:** 2026-04-19
**Orchestrator:** Phil Jackson (The Zen Master)
**Status:** Locked for Build Phase

---

## Executive Summary

Two titans debated. Elon pushed for speed, Steve for soul. The synthesis: **ship fast AND great.**

SPARK is an invisible AI assistant that makes any website instantly helpful. One script tag, zero configuration, magical experience. This document consolidates all locked decisions from the debate rounds.

---

## 1. Locked Decisions

### 1.1 Product Name
**Decision:** SPARK
**Proposed by:** Steve Jobs (Round 1)
**Winner:** Steve
**Opposition:** Elon suggested "PageChat" or "AnswerWidget" (Round 1)
**Why Steve Won:**
- "LocalGenius Lite" sounds weak, apologetic, like diet soda
- Descriptive names (PageChat/AnswerWidget) describe function, not emotion
- SPARK is memorable, ownable, one syllable, evokes the feeling of discovery
- "Add Spark to your website" > "Add LocalGenius Lite embed widget"
- Elon conceded in Round 2: "He's Right: 'LocalGenius Lite' Is Terrible"

**Impact:** All branding, code, and marketing uses "SPARK"

---

### 1.2 Architecture: No Dashboard in V1
**Decision:** Client-side UUID generation, no user accounts, no backend database
**Proposed by:** Elon Musk (Round 1)
**Winner:** Elon
**Opposition:** Original plan included "simple dashboard" with auth/billing
**Why Elon Won:**
- Dashboard adds 2-3 hours to build time (40% of total)
- Requires auth, KV writes, session management, Stripe integration
- Delivers minimal value when 0 users exist
- Steve conceded Round 2: "The dashboard is scope creep"
- UUIDs are mathematically sound (1 in 2^122 collision probability)

**Technical Implementation:**
```javascript
// Generate site ID client-side
const siteId = crypto.randomUUID();
localStorage.setItem('spark_site_id', siteId);
```

**Impact:** Ships in 4 hours instead of 7+ hours

---

### 1.3 "Powered By" Attribution
**Decision:** Required in free tier, removable in paid tier
**Proposed by:** Elon Musk (Round 1, defended Round 2)
**Winner:** Elon (with Steve's compromise)
**Opposition:** Steve wanted no attribution in default experience (Round 2)
**Why Elon Won:**
- Only viral distribution mechanism in V1
- Every embedded widget = free billboard
- Steve's "confidence doesn't need attribution" loses to "virality is free"
- Compromise: Make it small, tasteful, but present

**Steve's Influence:**
- Must be subtle, not intrusive
- Design must maintain "feels like your site" magic
- Consider opt-out at $5/mo (not $20/mo)

**Implementation:**
```html
<div class="spark-footer">
  <a href="https://usespark.com" target="_blank">Powered by SPARK</a>
</div>
```

**Impact:** Customer acquisition without paid ads

---

### 1.4 Scope: What Ships in V1
**Decision:** Widget + Worker only, everything else is V2
**Proposed by:** Elon Musk (Round 1)
**Winner:** Consensus (Steve agreed Round 2)

**SHIPS IN V1:**
- ✅ Chat widget (button + panel)
- ✅ Page content scraping
- ✅ Claude API integration (Haiku model)
- ✅ Streaming responses
- ✅ Client-side site IDs
- ✅ Basic rate limiting (10 req/min per site_id)
- ✅ "Powered by SPARK" footer
- ✅ One default theme (purple gradient)
- ✅ Landing page with copy/paste instructions

**CUT FROM V1:**
- ❌ Dashboard / admin panel
- ❌ User authentication
- ❌ Pricing / billing / Stripe
- ❌ Custom branding / theming
- ❌ Dark mode auto-detection
- ❌ Mobile responsiveness polish (functional but basic)
- ❌ Exit-intent detection
- ❌ Auto-vibe matching
- ❌ Lead capture forms
- ❌ Analytics dashboard
- ❌ Conversation history

**Why These Cuts:**
- Each adds 30min-3hrs to build time
- None are necessary to prove core value
- Can be added when users request them

---

### 1.5 Design Quality: No Compromise on Core Experience
**Decision:** Polish the 3-second first impression
**Proposed by:** Steve Jobs (Round 1, defended Round 2)
**Winner:** Steve
**Opposition:** Elon initially wanted "ship ugly, iterate fast"
**Why Steve Won:**
- "Shipping garbage fast is worse than shipping great stuff slow" (Elon Round 2)
- First impression determines word-of-mouth
- 30 minutes of polish = 50% better retention
- Elon conceded: "He's Right: First Impression Is Everything"

**Required Polish:**
- Smooth slide-in animation (CSS transition, not janky)
- Thoughtful placeholder: "What can I help you find?" (not "Enter question...")
- Clean markdown rendering with proper spacing
- Streaming response feels instant, confident
- Button "breathes" with subtle pulse animation

**Steve's Philosophy:**
> "The difference between 'ships tonight' and 'ships tomorrow' is 12 hours. The difference between 'another chat widget' and 'holy shit, what is this?' is forever."

**Impact:** V1 ships with soul, not just speed

---

### 1.6 Technical Stack
**Decision:** Cloudflare Worker + Claude API + Shadow DOM Widget
**Proposed by:** Original plan, validated by Elon (Round 1)
**Winner:** Consensus

**Stack:**
- **Widget:** Vanilla JS, Shadow DOM (isolation from host site CSS)
- **Backend:** Cloudflare Worker (serverless, zero ops)
- **AI:** Claude 3.5 Haiku (fast, cheap, 200K context)
- **Storage:** localStorage (client-side only)
- **Deployment:** Cloudflare Pages (landing) + Workers (API)

**Why This Stack:**
- No servers, no containers, no DevOps
- Scales to 1M users before infrastructure complexity
- $0 fixed costs (pay-per-use)
- Ships in one session

---

### 1.7 Distribution Strategy
**Decision:** SEO + Viral + Developer Seeding
**Proposed by:** Elon Musk (Round 1)
**Winner:** Elon (with Steve's design additions)

**Tactics:**
1. **SEO Land Grab:** Comparison pages (`vs-intercom`, `vs-drift`) targeting "free alternative to X"
2. **Powered-by Attribution:** Every widget = billboard
3. **Public Stats Page:** Live count of questions answered (social proof)
4. **Developer Seeding:** Script tag in popular OSS docs
5. **Twitter Launch Thread:** "Built in 4 hours" story + architecture breakdown
6. **Landing Page:** Apple-level simplicity (Steve's influence)

**Steve's Landing Page Vision:**
- Single bold promise: "Your website, instantly brilliant."
- One script tag in code block
- One demo showing it working
- One button: "Try It Now"
- No feature lists, no pricing grids

**Target:** 50 devs see launch → 10 embed → 5 tweet → 1 goes viral → 1,000 sites

---

## 2. MVP Feature Set (What Ships in V1)

### 2.1 Core Functionality
1. **Widget Rendering**
   - Floating button (bottom-right corner)
   - Click to open chat panel
   - Smooth animations (slide-in, fade)
   - Shadow DOM isolation

2. **Page Content Extraction**
   - Scrape visible text on page load
   - Cache in widget memory (don't re-scrape per question)
   - Truncate to ~10KB (Claude Haiku handles 200K context)
   - Extract from `<main>`, `<article>`, or `<body>`

3. **Claude Integration**
   - Send question + page context to Worker
   - Worker proxies to Claude API
   - Stream response back to widget
   - Handle errors gracefully (API timeout, rate limits)

4. **Rate Limiting**
   - 10 requests/min per site_id (enforced in Worker)
   - 100 requests/hour per IP (Cloudflare rate limiting)

5. **Branding**
   - "Powered by SPARK" footer (small, tasteful)
   - Links to usespark.com

### 2.2 User Flow
1. Website owner copies script tag from landing page
2. Pastes into `<head>` or before `</body>`
3. Script self-initializes on page load
4. Visitor sees button, clicks, asks question
5. Answer streams in ~1-2 seconds
6. Visitor gets accurate response from page content

### 2.3 Technical Requirements
- **Latency:** <2s to first token
- **Accuracy:** Must use page context, not hallucinate
- **Reliability:** 99% uptime (Cloudflare SLA)
- **Cost:** <$0.001 per question (Claude Haiku pricing)

---

## 3. File Structure (What Gets Built)

```
spark/
├── widget/
│   ├── spark.js              # Main widget entry (injected via script tag)
│   ├── components/
│   │   ├── Button.js         # Floating chat button
│   │   ├── Panel.js          # Chat panel UI
│   │   └── Message.js        # Message bubble component
│   ├── utils/
│   │   ├── scraper.js        # Extract page content
│   │   ├── api.js            # Call Worker endpoint
│   │   └── storage.js        # localStorage helpers
│   └── styles/
│       └── spark.css         # Shadow DOM styles (purple gradient theme)
│
├── worker/
│   ├── index.js              # Cloudflare Worker main entry
│   ├── claude.js             # Claude API integration
│   ├── ratelimit.js          # Rate limiting logic
│   └── wrangler.toml         # Cloudflare config
│
├── landing/
│   ├── index.html            # Landing page (copy/paste instructions)
│   ├── demo.html             # Live demo of widget
│   └── styles.css            # Landing page styles
│
└── README.md                 # Build instructions
```

### 3.1 Key Files

**`widget/spark.js`** (~200 lines)
- Initialize shadow DOM
- Render button + panel
- Handle user input
- Stream responses
- Manage state (open/closed, loading, error)

**`worker/index.js`** (~150 lines)
- Receive request from widget
- Validate site_id (basic checks)
- Rate limit enforcement
- Proxy to Claude API
- Stream response back

**`worker/claude.js`** (~100 lines)
- Build prompt: "You are a helpful assistant. Answer based on this page content: {context}. Question: {question}"
- Call Anthropic API
- Handle streaming response
- Parse markdown

**`landing/index.html`** (~100 lines)
- Hero: "Your website, instantly brilliant."
- Code block with script tag
- Live demo embed
- Footer with attribution

---

## 4. Open Questions (Needs Resolution Before Build)

### 4.1 Product Questions

**Q1: What's the exact placeholder text in the input field?**
- Steve suggested: "What can I help you find?"
- Alternatives: "Ask me anything..." / "What would you like to know?"
- **Decision needed:** Pick one before build

**Q2: Where exactly does the button appear?**
- Bottom-right corner (default)
- But what about mobile? Bottom-center?
- **Decision needed:** Mobile positioning strategy

**Q3: What happens when Claude API fails?**
- Error message: "Sorry, I couldn't answer that. Try again?"
- Retry button?
- **Decision needed:** Error state UX

**Q4: Do we log usage metrics?**
- Elon conceded: "Even without dashboard, we need to log"
- Log to Cloudflare Analytics: total questions, error rates, site IDs
- **Decision needed:** What exactly to log and where

### 4.2 Technical Questions

**Q5: How do we handle CORS?**
- Widget calls Worker from any domain
- Worker needs `Access-Control-Allow-Origin: *`
- **Decision needed:** CORS headers configuration

**Q6: What's the Claude prompt template?**
- Current idea: "Answer based on page content: {context}. Question: {question}"
- Need to test: does this prevent hallucination?
- **Decision needed:** Test and lock prompt before launch

**Q7: What's the rate limit logic?**
- 10 req/min per site_id (too strict? too loose?)
- What error message when rate limited?
- **Decision needed:** Test with real usage patterns

**Q8: How do we deploy the widget script?**
- CDN URL: `https://cdn.usespark.com/spark.js`?
- Versioning: `/v1/spark.js` or `/spark.js`?
- **Decision needed:** CDN strategy

### 4.3 Business Questions

**Q9: When do we add pricing?**
- Launch free for everyone
- Add paid tier when: 100 users? 1000 questions/day? Someone asks?
- **Decision needed:** Success metric to trigger billing build

**Q10: What's the paid tier price?**
- Remove branding: $5/mo or $20/mo?
- Steve leans $5, Elon said $20
- **Decision needed:** Test willingness to pay

---

## 5. Risk Register (What Could Go Wrong)

### 5.1 Technical Risks

**RISK 1: Claude API Rate Limits**
- **Threat:** Anthropic caps us at 50 req/sec on paid tier
- **Impact:** Service degrades at 10K questions/day
- **Mitigation:**
  - Monitor usage closely
  - Add queue system if we hit limits
  - Upgrade to enterprise tier at scale
- **Probability:** Low (need 500K questions/day to hit limit)

**RISK 2: Cloudflare Worker Costs Explode**
- **Threat:** Free tier is 100K req/day, paid is $5/mo for 10M
- **Impact:** At 10K questions/day = $0.00045/question = $4.50/day = $135/mo Claude costs
- **Mitigation:**
  - Claude costs are the real expense (not Workers)
  - Add billing before costs exceed $500/mo
- **Probability:** Medium (if we get traction)

**RISK 3: CSS Conflicts Break Widget on Certain Sites**
- **Threat:** Some sites have aggressive global CSS that overrides Shadow DOM
- **Impact:** Widget looks broken, users uninstall
- **Mitigation:**
  - Use `!important` sparingly in widget styles
  - Test on top 10 CMS platforms (WordPress, Shopify, etc.)
  - Add `all: initial` reset in Shadow DOM root
- **Probability:** Medium (edge cases exist)

**RISK 4: Page Scraping Fails on SPAs**
- **Threat:** Single-page apps load content async, scraper gets empty page
- **Impact:** Widget says "I don't know" even when content is visible
- **Mitigation:**
  - Wait 1 second after page load before scraping
  - Use MutationObserver to detect content changes
  - V2: Add manual "refresh context" button
- **Probability:** High (many modern sites are SPAs)

**RISK 5: Abuse / Spam Attacks**
- **Threat:** Someone scrapes Worker URL and hammers it with fake requests
- **Impact:** Claude API costs spike, service degrades
- **Mitigation:**
  - Cloudflare rate limiting (100 req/hour per IP)
  - Block site_ids with suspicious patterns
  - Add CAPTCHA if abuse detected
- **Probability:** Low in V1, High if we go viral

### 5.2 Product Risks

**RISK 6: Nobody Embeds It**
- **Threat:** We launch, get 0 installs, product dies
- **Impact:** Wasted build time, no market validation
- **Mitigation:**
  - Manual outreach to 50 devs on launch day
  - Post on HN, Reddit, Twitter with "Show HN" thread
  - Embed on our own sites as social proof
- **Probability:** Medium (distribution is hard)

**RISK 7: "Powered By" Attribution Kills Adoption**
- **Threat:** Users refuse to install because they don't want our branding
- **Impact:** Lower adoption than expected
- **Mitigation:**
  - Make footer small, tasteful, subtle
  - Offer $5/mo removal (not $20/mo)
  - A/B test: attribution vs no attribution
- **Probability:** Low (most free tools have attribution)

**RISK 8: Claude Gives Bad Answers**
- **Threat:** AI hallucinates, users lose trust
- **Impact:** Bad reviews, uninstalls, reputation damage
- **Mitigation:**
  - Prompt engineering: "Only answer based on provided context"
  - Add "I don't know" fallback
  - Show confidence score (V2)
- **Probability:** Medium (LLMs hallucinate)

**RISK 9: Competitors Clone It**
- **Threat:** Intercom/Drift sees this and ships same feature in 2 weeks
- **Impact:** We lose "first mover" advantage
- **Mitigation:**
  - Speed is our moat (we ship faster than big cos)
  - Build brand loyalty early (SPARK = quality)
  - Add unique features they can't easily copy
- **Probability:** Low in V1, High if we succeed

### 5.3 Business Risks

**RISK 10: Can't Monetize**
- **Threat:** Users love free tier, refuse to pay for Pro
- **Impact:** High costs, no revenue, unsustainable
- **Mitigation:**
  - Launch free to validate demand first
  - Test pricing early (poll users on Twitter)
  - Offer value-add features (analytics, custom branding)
- **Probability:** Medium (freemium is hard)

**RISK 11: Steve and Elon Keep Arguing**
- **Threat:** Endless debates, no decisions, never ship
- **Impact:** Product dies in planning phase
- **Mitigation:**
  - This document locks decisions
  - Phil Jackson breaks ties
  - Time-box future debates (1 hour max)
- **Probability:** Low (both conceded key points)

---

## 6. Success Metrics

### 6.1 Launch Week (Week 1)
- 50+ developers see the launch
- 10+ sites embed the widget
- 100+ questions answered
- 1+ viral tweet/post about SPARK

### 6.2 First Month
- 100+ sites using SPARK
- 1,000+ questions answered
- 10+ organic mentions on Twitter/HN/Reddit
- 1+ request to remove branding (triggers paid tier build)

### 6.3 First Quarter
- 1,000+ sites using SPARK
- 10,000+ questions answered
- Revenue: $100/mo (20 paid users @ $5/mo)
- 1+ competitor mention in their roadmap

---

## 7. Build Timeline

### Phase 1: Core Build (4 hours)
- Hour 1: Widget UI (button, panel, input, messages)
- Hour 2: Worker + Claude integration
- Hour 3: Streaming responses + error handling
- Hour 4: Testing + debugging

### Phase 2: Polish (1 hour)
- Smooth animations
- Placeholder text
- Markdown rendering
- Button pulse effect

### Phase 3: Landing Page (1 hour)
- Hero section
- Copy/paste instructions
- Live demo embed
- Footer

### Phase 4: Deploy (30 min)
- Cloudflare Worker deploy
- CDN setup for widget script
- Landing page to Cloudflare Pages

**Total: ~6.5 hours** (ships in one day)

---

## 8. The Essence (North Star)

**What it really is:**
Intelligence that makes websites instantly helpful without requiring anyone to do anything.

**The feeling:**
Effortless power. "I pasted one line and my site got smarter."

**The one thing that must be perfect:**
First 3 seconds after clicking the button — smooth open, instant response, zero friction.

**Creative direction:**
Invisible until magical.

**The promise:**
Your website, instantly brilliant.

---

## 9. Final Decisions Summary

| Decision | Proposed By | Winner | Rationale |
|----------|-------------|--------|-----------|
| Name: SPARK | Steve | Steve | Memorable, ownable, emotional (not descriptive) |
| No Dashboard V1 | Elon | Elon | Cuts 40% of build time, ships this week |
| "Powered By" Footer | Elon | Elon | Only viral mechanism, Steve compromise on design |
| Scope: Widget+Worker Only | Elon | Consensus | Focus on core value, cut everything else |
| Polish Core Experience | Steve | Steve | 30min polish = 50% better retention |
| Tech Stack: CF+Claude | Original | Consensus | Serverless, scalable, ships in one session |
| Distribution: SEO+Viral | Elon | Elon+Steve | Growth tactics + Apple-level landing page |

---

## 10. What Dies (Confirmed Cuts)

- "LocalGenius Lite" name → SPARK
- Exit-intent detection → Always-visible button
- Auto-vibe matching → Single purple theme
- Lead capture gates → Direct to chat
- Dashboards before users → Ship widget first
- Dark mode → Light only
- Mobile polish → Functional but basic
- Custom branding → V2 feature
- Conversation history → Stateless
- Analytics dashboard → Basic logging only

---

## 11. Execution Philosophy

**Elon's Wisdom:**
> "Ship the core fast, but spend 30 minutes polishing: smooth animation, smart placeholder, clean formatting. This is a 5% time investment for 50% better first impression."

**Steve's Wisdom:**
> "The difference between 'ships tonight' and 'ships tomorrow' is 12 hours. The difference between 'another chat widget' and 'holy shit, what is this?' is forever."

**Phil's Synthesis:**
> "Both. Fast AND great. Ship in one day with soul intact. No dashboard, no billing, but the core experience must be magical. That's how you win."

---

**This blueprint is locked. Build begins now.**
