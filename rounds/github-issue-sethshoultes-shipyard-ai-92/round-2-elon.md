# Round 2: Reel

## Where Beauty Becomes a Bottleneck

Steve wants three voices, curated fonts, zero configuration, and a name that "makes your heart beat faster." This is putting the cart before the horse. We're arguing about cinema when we haven't proven the projector works.

**Three voices is not curation—it's premature optimization.** One voice ships in days. Three voices ships in weeks. The question is not "does choice feel better?" The question is: will anyone pay for this at all? Build one voice that sounds human. If users demand more, add them. If nobody buys one, you've saved weeks of voice-selection theology.

**"Taste is the feature" is dangerously wrong at v1.** Taste is the multiplier, not the base. The base is: paste text → receive video. If that pipeline takes 4 minutes, crashes at 10 users, or costs $2/video, taste multiplies zero. I don't care how beautiful the font is when the server is on fire. First make the machine work. Then make it beautiful. Steve wants to do both simultaneously, which means neither gets done properly.

**The name debate is a waste of oxygen right now.** "ClipCraft" vs "Reel" vs anything else—call it whatever you want for the v1 web form. If the product dies because we spent two weeks naming it instead of testing whether bloggers will wait 4 minutes for a video, the name becomes a tombstone. The Algorithm says: delete anything you can. A naming committee is the first thing to delete.

## Why Technical Simplicity Wins

Steve says I'm optimizing for "engineering convenience." He's wrong. I'm optimizing for **survival probability**.

A web form with ffmpeg compositing has 10x fewer failure modes than a WordPress plugin with Remotion headless Chrome. Every dependency you add—PHP, WordPress REST API, block editor hooks, plugin directory approvals—is a branching probability stream that ends in "doesn't work on user's hosting." The web service has one runtime: Node.js. One deployment target: a server we control. The WordPress plugin has 50,000 possible hosting configurations, each one a support ticket.

Steve argues the plugin "lives where the writer lives." Fine. But writers also live in Google Docs, Notion, and Medium. Build the engine first. Wrap it later. The engine is the hard part. Wrapping is a weekend project once the engine is real.

He says "cost-per-video solves itself if people love it." This ignores the laws of physics. If rendering costs $0.50 and you charge $20/month, you need each user to generate fewer than 40 videos per month or you lose money. At 100x scale, that constraint becomes a wall. You can't taste-your-way out of unit economics.

## Where Steve Is Right

I concede three things, but with conditions:

1. **First-run experience matters.** He's right that the first 30 seconds should be pure output. But the way to achieve this is not "zero configuration"—it's **one sane default** that works for 80% of cases. One template. One voice. One aspect ratio (vertical, because mobile). The user pastes text and sees magic. That's the v1. Configuration comes when users ask for it, not before.

2. **Default design quality matters.** He's right that users shouldn't look at bad typography. But "we choose the fonts" is not the only path. The path is: pick one great font pair, one great voice, one great template. Curation is correct. Over-curation is a trap.

3. **Honesty in timing.** He's right that "60 seconds" is fiction. "A few minutes" is honest. Honesty builds trust. I agree completely.

## My Non-Negotiables

1. **V1 is a web service, not a WordPress plugin.** The engine must work before it lives anywhere. One URL. Paste text. Download MP4. If it can't do that reliably, nothing else matters.

2. **One voice, one template, one vertical format.** Three voices is v3. Two templates is v2. v1 proves the magic with the smallest possible surface area. Add variation only after retention data says users are bored.

3. **Render time under 60 seconds or architecture change.** If Remotion + headless Chrome can't hit 60s for a 30s video on standard compute, we drop it for ffmpeg compositing. No debate. Performance is a requirement, not a preference.

Build the engine. Prove the magic. Then make it beautiful. Not the other way around.
