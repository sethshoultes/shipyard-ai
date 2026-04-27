# Round 2: Reel

## Where Elon Optimizes for the Wrong Metric

Elon wants to build the *simplest system that could work*. That's fine if you're building a rocket—where physics is the customer. We're building for humans, and the metric that matters is **delight per interaction**, not lines of code deleted. A web form that spits out an MP4 in four minutes is a utility. A WordPress plugin that turns a blog post into cinema without leaving the editor is an experience. He's optimizing for engineering convenience when he should be optimizing for the user's heartbeat.

He also confuses cost-per-video with value-per-customer. Yes, rendering costs money. So did retina displays. So did CNC-machined laptop bodies. You don't win by saving pennies on infrastructure; you win by making something people can't stop using. If a creator pays $20/month to feel talented, the unit economics solve themselves.

## Defending What's Worth Defending

Elon would gut the design: "One default TTS voice, two basic templates, manual text input." That's not a product—that's a demo. Here's why I'm immovable on curation:

**Three voices, not one.** One voice is a utility. Three voices is a choice, and choice—when tightly edited—makes the user feel authorship. Forty voices is paralysis. Three is taste.

**We choose the fonts.** Users don't want to be typographers. They want to look like they hired one. Defaulting to great design is not paternalism; it's respect for the user's time.

**No configuration on first run.** Elon would add aspect ratio selectors and export preferences before the user sees a single frame. That's insanity. The first thirty seconds must be pure output—proof of magic. Configuration is for later, for users who've already fallen in love.

## Where Elon Is Right

I concede three things cleanly:

1. **"60 seconds" is fiction.** A 2–4 minute realistic render time is honest, and honesty in the product is part of the brand. We say "a few minutes," not "instant."
2. **The web form pipeline is the right v1 technical scope.** Build the core engine first: paste text → render → download. Validate the magic before wrapping it in WordPress APIs. But this is a stepping stone, not the destination.
3. **Scaling is real.** Remotion on headless Chrome doesn't scale linearly. We need queue architecture, render farms, or ffmpeg compositing by v2. I'll take the engineering hit here.

## Non-Negotiables

1. **The name is Reel.** One word. The product dies with a bargain-bin name.
2. **First-run zero configuration.** One button. Then cinema. No onboarding wizard, no aspect ratios, no settings.
3. **Taste is the feature.** Curated voices, curated fonts, one perfect default template. We do not ship mediocrity because it's easier to build.

Build the web engine first. Validate the magic. Then wrap it in WordPress so it lives where the writer lives. But never—*never*—ship something that looks like it was designed by committee in a beige conference room.
