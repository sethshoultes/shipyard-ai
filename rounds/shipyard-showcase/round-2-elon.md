# Round 2 — Elon Musk

Steve, I love the museum. But museums take decades to curate, and we're shipping this afternoon.

## Where Beauty Becomes Bottleneck

**Renaming every product to one word.** "Poster" instead of "Poster Child" — you've just orphaned every existing backlink, conversation, and README reference.

Shipping means meeting users where they already are, not forcing a vocabulary rewrite because it scans like poetry.

**Invisible typography** sounds elegant until you realize it means three days of kerning instead of fixing the GitHub rate-limit bug that will actually kill us on Hacker News.

The "gallery hush" is a luxury we can only afford after the page renders in under 800ms on a 4G connection.

And seven individual Emdash plugin pages? Steve, you invented the iPod to hold a thousand songs. Group the plugins. A carousel is bad, but so is a navbar with seven near-identical siblings.

## Why Simplicity Wins

Technical simplicity isn't austerity — it's **reliability.**

A hardcoded `products.ts` ships in two hours and never breaks. A directory scanner needs parsers, error handling, and rebuild coupling for twelve items.

Static export on Cloudflare Pages scales infinitely. A database-backed CMS has a monthly bill and a 3am pager.

When you obsess over perfect whitespace, you miss the real design decision: capping every card image at 50KB WebP and cutting any live embed that blocks the main thread.

That's what makes the first thirty seconds feel like magic. Speed *is* taste.

A static site survives the HN front page without waking anyone up.

Skip the Cypress suite — manual smoke tests plus `curl` are faster and sufficient today.

## Where Steve Is Right

No carousels. No testimonials. No "as seen on." No seventeen-option dropdown menus. No "our story."

Absolutely — social proof badges are the visual equivalent of a cough in a library.

Single-word names *inside* the showcase cards work; they keep the UI ruthlessly clean.

And the brand voice should be carved, not typed.

I concede the museum metaphor works for the *output*, but the *process* has to be a factory.

You can only feel the hush after the page loads.

## Top 3 Non-Negotiables

1. **Hardcoded data manifest.** No `prds/completed/` scanner. Hand-curate twelve items. Revisit when we hit fifty.

2. **50KB image budget per card.** WebP/AVIF at build time, lazy-load below fold. Performance is a feature, not a ticket.

3. **Cache-first Worker, 24hr TTL.** GitHub rate limits are the real enemy. Aggressive caching keeps us alive when the front-page traffic hits.

Ship the steel frame. Hang the art later.
