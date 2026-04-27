# Elon — Round 2: Ship the Engine, Paint the Car Later

## Where Steve's Beauty Becomes Drag

The "one continuous gesture" wizard is exactly how you end up with a sprint demo that breaks on Bluehost. No save buttons? WordPress doesn't know what state you're in. A "continuous gesture" across three PHP view files with client-side state is just a wizard wearing a turtleneck. It's the same complexity with better typography. You ship it, then you debug state desync on a shared host at 2am.

"Sous" is a beautiful name. For version 3. Rebranding before you have a working activation flow is like painting a car that doesn't have an engine. LocalGenius is a fine codename. The product will tell you its real name once 1,000 people actually use it.

The widget preview panel is even worse — it's a second implementation of the widget that lives in admin CSS. It will drift from reality. Load the real widget on the real site. One implementation. No drift.

## Why Simplicity Wins

Technical simplicity isn't austerity — it's the only architecture that survives contact with the user.

One `admin.php` means one file to debug. A state machine across three views means three files, three edge cases, three timeout vectors. The 850-line version ships in one agent session. The wizard version ships never, because you're chasing "cream pouring into coffee" animations while the schema scraper 500-errors on GoDaddy.

Async detection isn't a preference; it's physics. Thirty percent of cheap hosts timeout on activation hooks. You don't "continuous gesture" your way out of a 504 error.

## Where Steve Is Right

Steve is absolutely correct that recognition beats configuration. The user should see *"We found Maria's Trattoria"* — but you get there by pre-populating a single editable screen, not by choreographing a multi-step ballet.

The mom test for copy is correct. "Optimize your workflow" is poison. Warm, specific language costs nothing and ships in the same JSON file.

Taste matters at the surface layer: the widget animation, the one sentence of copy, the absence of clutter. It does not matter inside the database query or the activation hook.

## Non-Negotiables

1. **One admin screen, zero wizards.** Editable, pre-populated, no state machine.
2. **Render first, detect second.** Async schema.org call after page load. Never on activation.
3. **No admin preview panel.** The widget renders on the real frontend or it doesn't exist.

Ship the engine. The turtleneck can wait.
