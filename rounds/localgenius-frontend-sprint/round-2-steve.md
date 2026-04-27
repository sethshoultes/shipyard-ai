# Steve Jobs — Round 2 Rebuttal

## Where Elon Optimizes for the Wrong Metric

Elon is optimizing for **code volume** when he should be optimizing for **uninstall rate**. A restaurant owner who sees one PHP file and a `<style>` tag injected into their header will uninstall before lunch. They didn't quit their day job to debug spaghetti code. One-file architecture is developer convenience masquerading as simplicity. Seven classes is not "theater" — it is respect for the customer's intelligence and our own future sanity.

He wants to pre-generate 500 generic answers into Cloudflare KV to chase a 90% cache hit rate. Congratulations: you have built a phone tree that feels like 1997. Sous is not a database lookup. It is a concierge. If the answer feels canned, the magic dies. We will cache intelligently, but we will not ship a robot that reads from a script. Every restaurant has a different menu, a different story, a different neighborhood. Generic answers insult their customer and their customer's intelligence.

And widget backlinks as "distribution"? That is growth-hacking graffiti on our customer's storefront. No self-respecting restaurant owner advertises their dishwasher supplier on the menu. Elon wants 10,000 users by turning our customers into billboards. I want 1,000 users who wake up excited because their widget makes them look brilliant. Churn, not acquisition, is the metric that kills WordPress plugins. A plugin with a 40% monthly churn dies faster than one with slow growth and zero backlinks.

His seven-day ship-or-die ultimatum is equally misguided. Shipping a stripped payment form is not shipping a product. It is shipping a demo. Demos do not retain users.

## Defending What Elon Calls "Theater"

Elon calls onboarding steps 4–6 "theater." I call it **the first and only retention funnel**. A restaurant owner installing a plugin is scared. If we do not dazzle them in 30 seconds, they panic, deactivate, and tell three friends we are broken. The split-screen preview, the confetti, the feeling that someone already knows their business — that is not theater. That is the product earning the right to exist on their site. You don't get a second chance at a first impression, and in the WordPress plugin repo, you don't get a second star.

The 20KB ceiling is not arbitrary physics-worship. It is the difference between their site loading in 0.8 seconds and 2.4 seconds. On mobile, that is the difference between a reservation and a bounce. This widget sits on *their* domain, representing *their* brand. If it stutters, *they* look cheap. Elon builds rockets where every gram matters; I am telling him that on the web, every kilobyte matters just as much. It is the same physics, applied to someone else's livelihood. Speed is a feature of politeness.

Elon also wants to inject CSS via a `<style>` tag inside the IIFE to save one HTTP request. That is the kind of optimization that leaves a greasy fingerprint on someone's website. A separate, cacheable CSS file is cleaner, faster on repeat visits, and respectful of the user's markup. We are guests in their house. We take off our shoes.

Onboarding is not a feature. It is the product. You cannot patch a bad first impression with a good update.

## Where Elon Is Right

The PRD is 15 products in a trench coat. He is right that one session cannot build badges, digests, percentile UIs, annual billing, rich-text editors, and a mobile app in 14 days. We cut the digest, badges, percentile dashboards, annual billing, drag-to-reorder, and mobile gestures. I concede those gladly — they are features searching for a problem.

He is also right about D1 write volume and Stripe webhook hell. We do not log every chat in v1. Counter only. Stripe Checkout monthly, period. No proration math inside WordPress. These are not compromises. They are discipline. And he is right that a hard 2-second LLM timeout is fiction without aggressive caching. We need a fallback typing indicator and realistic expectations, not magical thinking about latency. I will trade a typing indicator for a "we'll get back to you" failure any day.

He is even right that a standalone SaaS app plus a thin embed would halve the codebase. I hate admitting it, but the WordPress admin ecosystem is a bag of hurt. We build the SaaS dashboard first, then the thinnest possible PHP shim. The widget is the product; WordPress is just a door.

One table. One cron. One agent session. That is the discipline Elon demands, and he is right to demand it.

## Non-Negotiables

1. **The name is Sous.** LocalGenius is dead. A product with a forgettable name starts every conversation ten feet behind. The name is the first interface. You do not build a luxury brand on a discount sign.

2. **Zero-setup onboarding magic.** Detect, confirm, activate. The plugin reads the site and pre-loads FAQs before the owner finishes blinking. If they configure anything beyond "yes, this is my business," we have failed. The magic moment is the moat. Everything else is just code.

3. **Concierge voice, never "AI."** The widget speaks like the best employee they ever hired. No "leverage." No "AI-powered insights." No chatbot clichés. Warm, brief, confident. The tone is the feature. When their customer asks about parking, Sous does not say "Processing your request." Sous says, "We have valet starting at five."

Build less. But what you build must feel inevitable.
