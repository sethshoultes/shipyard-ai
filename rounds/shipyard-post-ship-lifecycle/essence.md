# Essence

**What it is:**
Stay in the customer's inbox so when they need another site, they reply instead of search.

**Feeling it evokes:**
Someone remembers me.

**One thing that must be perfect:**
Email copy — three sentences, zero fluff, sounds human.

**Creative direction:**
Mechanic checking in, not marketer.

---

**Consensus:**
- Five emails. Five triggers. Locked forever.
- Plain text. No upsell. No metrics theater.
- Ship in 3 days via Cloudflare Worker + Resend.
- Measure reply rate, not opens.
- Never A/B test (Steve) vs. always test (Elon) = test once, lock winner.

**Name:** Aftercare
**Architecture:** One Worker, one KV namespace, five templates
**Voice:** Trusted mechanic — short sentences, no jargon, sounds like one person who remembers your project

**Non-negotiables:**
1. No customization per industry
2. No dashboard (use Resend's)
3. No features for 90 days post-launch

**Strip everything to:** Does this email make them reply in 6 months? If no, delete.
