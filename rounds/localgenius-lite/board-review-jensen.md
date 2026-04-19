# Board Review: LocalGenius Lite (SPARK)
**Reviewer:** Jensen Huang, NVIDIA CEO
**Date:** 2026-04-19
**Status:** CRITICAL CONCERNS

---

## The Moat? There Isn't One.

**What compounds:**
- Nothing. Site owners churn when pricing increases.
- No network effects. Each embed is isolated.
- No proprietary data collection. Content scraped per-session, not retained.
- No model improvement from usage.

**Reality check:**
- Competitors copy this in 48 hours.
- First-mover advantage evaporates on Product Hunt day 2.
- You're a thin wrapper on Claude with zero defensibility.

---

## AI Leverage? Massively Underutilized.

**Current state:**
- Scraping 10KB of text per session. Stateless. Amnesia by design.
- Using Haiku like a glorified FAQ bot.
- Zero learning, zero personalization, zero improvement.

**Where you're leaving 10x on the table:**
- Not building cross-page understanding. One page = stupid assistant.
- Not learning from question patterns. What are users actually asking?
- Not auto-generating suggested questions from page analysis.
- Not detecting *intent* — are they researching, ready to buy, confused?
- Not improving answers from implicit feedback (did they ask follow-up = bad answer).

**What AI should be doing:**
- Site-wide semantic index. "Tell me about your return policy" should work from ANY page.
- Question prediction. Surface answers before users ask.
- Auto-detect high-friction moments (pricing page with no chat = money left on table).
- Continuous model fine-tuning from site-specific conversations.

---

## Unfair Advantage You're Not Building

**What you have:**
- Access to real visitor questions across thousands of sites.
- Behavioral data: what confuses people, what converts, what makes them leave.

**What you should be building:**
- **The question graph.** "83% of SaaS visitors ask about pricing within 30 seconds."
- **Vertical-specific models.** E-commerce SPARK knows shipping. SaaS SPARK knows onboarding.
- **Conversion intelligence.** "Users who ask X are 4x more likely to buy."
- **Dataset no one else has.** Every competitor starts from zero. You compound daily.

**Instead you built:**
- Stateless throwaway conversations.
- No memory, no learning, no compounding value.

---

## Platform Play? None. This Is A Feature.

**To become a platform:**

1. **Open the API.** Let developers build on your question data.
   - "Show me all unanswered questions across my site."
   - "Auto-generate FAQ page from top 20 questions."
   - "Zapier integration: question asked → Slack notification."

2. **Embeddings marketplace.** Site owners upload docs, we semantically index them.
   - Not just page content. PDFs, videos (transcripts), support tickets.
   - Pay per GB indexed. Recurring revenue that scales with usage.

3. **Agent framework.** Not just Q&A. Actions.
   - "Book a demo" → actually books it.
   - "What's in stock?" → live inventory lookup.
   - "Track my order" → integrated with Shopify API.

4. **Vertical SaaS modules.**
   - SPARK for E-commerce (inventory, shipping, returns).
   - SPARK for Docs (code examples, version-specific answers).
   - SPARK for Lead Gen (qualify visitors, push to CRM).

**Current product:**
- Generic chatbot.
- Zero extensibility.
- Competitor can clone in a weekend.

---

## What's Missing: The Infrastructure Play

NVIDIA doesn't sell GPUs. We sell compute infrastructure that compounds in value.

**You should be:**
- Building the **conversational data layer** for the web.
- Selling **insights**, not just answers.
- Creating **lock-in through data**, not just convenience.

**Instead:**
- You're a $9/month widget.
- Churn on month 2 when they realize it's just Claude with extra steps.

---

## Score: **3/10**

**Justification:** Clean execution of a non-defensible idea. This is a feature Intercom ships in Q3.

---

## What Would Make This a 9/10

**Pivot in next 30 days:**

1. **Data retention mode.** Opt-in: "Let SPARK learn from your visitors."
   - Build site-specific knowledge graphs.
   - Answers improve over time → stickiness.

2. **Analytics dashboard.** Show what people are *actually* asking.
   - Top unanswered questions = product roadmap gold.
   - Conversion correlation: "Users who ask X convert at Y%."

3. **API-first architecture.** Widget is just one interface.
   - Expose `/api/ask` — let developers embed SPARK anywhere.
   - Slack bot, Discord bot, SMS — same brain, different interface.

4. **Vertical specialization.** Pick ONE industry. Go deep.
   - E-commerce: integrate Shopify, WooCommerce, inventory APIs.
   - Be the **AI layer for e-commerce sites**, not "chat widget for everyone."

5. **Model moat.** Fine-tune on collected conversations.
   - You have the data. Anthropic doesn't.
   - Your model gets better daily. Theirs stays static.

---

## Final Thought

You built a beautiful MVP. Ship it, learn from it.

But don't confuse "fast execution" with "durable business."

Right now, this is a vitamin. Make it a painkiller.

**The question isn't "Can we ship this?"**
**It's "Why can't they replace us in 6 months?"**

Answer that, and you have a company.

---

**Jensen Huang**
NVIDIA CEO, Great Minds Agency Board Member
