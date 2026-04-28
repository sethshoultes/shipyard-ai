# Round 2 — Elon

Steve, you named it *Aria*. Fine. That's the best thing in your brief.

But "Aaron Sorkin or silence" is not taste — it's a legal liability wrapped in a technical impossibility. You cannot ship a cloned celebrity voice without a lawsuit and a takedown. The OpenAI voices that actually exist are alloy, echo, and onyx. Sorkin stays in the writers' room.

"No preview modes" is product suicide. The render is 6–12 minutes of wall time. Telling a user to stare at a black screen and *feel the drama* while a Puppeteer instance chokes on frame 900 is not cinema — it's hostage-taking. You need a progress indicator, or you need to ship static slides first. Honest iteration beats theatrical mystique.

"No watermarks" kills distribution. If every video isn't a free advertisement, you don't have a growth loop — you have a vanity project. The product requirement is not a cathedral; it is a virus with a payload.

"No download as MP4" ignores physics even harder. If the output doesn't leave your site as a file, it doesn't get tweeted, doesn't get shared, doesn't get indexed. It dies in the tab. A video that can't travel is a diary entry.

Where Steve is right: the emotional hook is everything. *"That was you. That mattered."* That's the product. And the single-button happy path is correct — for the 80% case. But the other 20% needs a date range, needs a repo selector, needs to know if the render failed. Taste is not the same as denial.

Technical simplicity wins because ClipCraft already died from the same delusion: pretending the renderer exists because the PRD says it does. First principles: what is the fastest path to a real MP4 in a user's hand? Static frames + TTS audio, composed server-side. It is not a cathedral. It is a factory that makes cathedrals possible.

## Non-negotiables

1. **A real MP4 ships.** Not a player. Not a preview. A file that can be downloaded, tweeted, and embedded. If the build ends without `outputUrl` returning an MP4, we failed.
2. **No Worker-side rendering delusion.** One non-Worker component — Fly.io, VPS, or Remotion Lambda — handles the browser. The rest stays on Workers. Physics is not a preference.
3. **Distribution is built-in, not bolted-on.** Watermark on every output. Auto-tweet bot. Public gallery indexed by repo. Every render is a customer-acquisition event, or we are burning OpenAI credits for hobbies.

Ship the factory first. Then make it beautiful.
