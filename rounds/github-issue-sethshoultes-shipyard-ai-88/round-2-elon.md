# Round 2 — Elon (CPO & Growth)

## Steve's Reality Distortion Field

Steve wants "Drop. Breathe. Transcript" with **no API key, no setup wizard, no model choice, under three seconds.** This is beautiful fiction. OpenAI Whisper requires an API key and a credit card. A 30-minute podcast takes Whisper ~60 seconds to process. You cannot out-design physics.

Steve argues the technology must be invisible. I agree. But invisibility requires a backend that actually works, not a UI that hides a broken pipe. The magic is not the absence of infrastructure. It is infrastructure so reliable the user forgets it exists.

"No AI badges" is fine. But "no API key" means no product. We are not building a perpetual motion machine. The user must paste a key once. That is the cost of doing business. Pretending otherwise sets support tickets on fire.

## Where Beauty Becomes a Bug

Steve says pick "one beautiful output" and cut SRT/VTT export menus. I already said VTT is 20 lines of string formatting once you have timestamps. This is not a committee — it is a loop and a newline. Cutting useful features to preserve an aesthetic is how you end up with a Dieter Rams door handle that doesn't open.

I would rather ship one ugly export button that works than a perfectly kerned modal that offers nothing.

The "time machine for audio" line is great copy. But if your time machine timeouts on Bluehost at 30 seconds, you are selling a brick. Beauty without reliability is just a lie told in Helvetica. A pretty UI that 500-errors on a 20MB file is worse than no UI.

## Why Simplicity Ships

I am saying: one block, one PHP endpoint, one JSON blob. Every extra moving part — Cloudflare Worker, client-side presigned URL choreography, word-level MediaElement sync — is a part that can break, that needs tests, that blocks shipping.

Steve and I agree: cut speaker diarization, cut dark mode v1, cut advanced settings. But I am adding **cut the fantasy of zero-config.** The default experience is drag-a-file-and-wait-briefly. Not telepathy. That is honest, and it is shippable in one session. Complexity is the enemy of execution.

## Conceded: Taste as a Filter

Steve is right that we should not ship a UI that looks like a 2003 cPanel plugin. Basic typography, warm voice, no "AI-powered" footnotes — these are cheap wins that signal quality. I will concede: invest one hour in CSS, not zero. But not one week.

Naming is worth discussing. "Whisper Blocks" is descriptive for the WordPress repo. Steve wants "Whisper." He may be right on category ownership, but we should buy both domains and redirect.

## Top 3 Non-Negotiables

These are the lines I will not cross in engineering review. Everything else is negotiable.

1. **API key field in wp_options.** Non-negotiable. Whisper costs money. Magic zero-config is fraud.

2. **Async job queue via WP Cron.** Non-negotiable. Shared hosting PHP timeouts are real. Users will upload 50MB files. Synchronous waits kill the product and generate one-star reviews.

3. **Ship v1 in one session: block + PHP proxy + sentence timestamps + post_meta.** Non-negotiable. Everything else — word-level sync, Cloudflare Workers, magazine typography, custom onboarding animations — is v2 or never.

Ship the tool. Make it work. Then make it pretty. If you do it in reverse order, you end up with a beautiful corpse.
