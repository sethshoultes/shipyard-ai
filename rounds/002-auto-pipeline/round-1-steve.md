# Round 1 — Steve Jobs

## PRD-002: Auto-Pipeline

---

## 1. Naming & Identity

"Auto-Pipeline" is the name an engineer gives something before they go to lunch. It describes what it does. Nobody cares what it does. People care what it means.

This product does something that has never existed before: you describe what you want, and a finished, live website appears. That is not a "pipeline." That is a launchpad.

**The name: Shipwright.**

As in: the craftsperson who builds ships. Shipyard AI builds things. Shipwright is the tool that does it in one motion. It is confident, it implies mastery of craft, and it does not need an acronym or a prefix.

The brand promise is four words: **"Describe it. It's live."**

Not "auto-generated." Not "AI-powered." Those are ingredients, not promises. The promise is that the gap between intention and reality collapses to zero. You think it, you write it down, and it exists in the world.

---

## 2. UX of the Trigger

A GitHub issue label. Let me say that again so we can hear how absurd it sounds. We are building a product that conjures websites from words, and the front door is a dropdown menu in a developer tool that 99% of the world has never opened.

GitHub is the deployment substrate. It is not the user experience. Confusing those two things is how you build tools only engineers use.

**My position: the intake surface must be a simple form — one page, three fields.**

1. **What is this site for?** (free text, 2-3 sentences)
2. **Who is it for?** (audience description)
3. **What's the tone?** (pick from 5 curated options: Bold, Warm, Minimal, Playful, Professional)

That is it. Behind the scenes, the form creates the GitHub issue, applies the label, and the machinery runs. The user never sees GitHub. They see a clean page, they fill it out, they wait, and they get a URL.

Phase 1, yes, we can accept GitHub issues directly for internal and developer users. But the architecture must assume a non-technical intake surface from day one. The form is the product. The GitHub issue is the implementation detail.

If Elon argues "GitHub is fine for now," my answer is: the architecture you build for "now" is the architecture you are stuck with forever. Build the abstraction layer on day one.

---

## 3. The Experience Arc

Here is where most "auto" tools fail. They treat the waiting period as dead time. "Please wait while we generate your site." That is the experience of a loading spinner, and loading spinners are the enemy of delight.

The arc should feel like watching a building go up in time-lapse.

**The Shipwright Experience:**

**Moment 1: Submission.** The user hits "Launch." Not "Submit." Not "Create." The button says "Launch" because that is what is happening. Instant confirmation: "Shipwright is building your site. Watch it happen."

**Moment 2: The Build Feed.** A real-time feed shows what Shipwright is doing. Not logs. Not terminal output. Human-readable narration:

- "Choosing your color palette based on your industry..."
- "Writing your homepage headline..."
- "Designing your navigation..."
- "Generating hero imagery..."
- "Deploying to preview..."

Each step completes with a subtle animation. The user feels progress. They feel craft. They are watching something be made for them.

**Moment 3: The Reveal.** The preview URL does not arrive as a link in a comment. It arrives as a full-screen takeover: the site renders live, embedded, right there. The user sees their site for the first time the way you see a finished house for the first time. Full screen. No chrome. Just their creation.

**Moment 4: The Share.** One button: "Share this site." Copies the URL. That is the viral loop. Someone describes a business, gets a site in 90 seconds, shares the URL. That is the story people tell.

The GitHub issue comment with the URL? That is the API response. It still happens. But nobody should have to go read a GitHub comment to find their site.

---

## 4. Visual Quality Bar

This is the entire game. If the generated sites look like templates, we have failed. If they look like a junior designer's first Squarespace attempt, we have failed. The sites must look like a $5,000 custom job.

**Non-negotiable quality standards:**

**Typography.** Every generated site uses a curated type pairing from a library of 8 proven combinations. Not random Google Fonts. Tested, harmonious pairs. The user does not choose fonts. We choose fonts. Because we are better at it.

**Color.** A constrained palette system. Every site gets a primary, secondary, accent, and neutral derived from the industry and tone selection. The palette generator uses color theory, not randomness. Every combination must pass WCAG AA contrast on first deploy. No exceptions.

**Spacing.** A strict 4px/8px grid. Consistent vertical rhythm. No cramped sections, no floating orphans. The spacing system is baked into the seed generator, not left to chance.

**Imagery.** No placeholder images. No gray boxes. Every site ships with real, contextually appropriate imagery. If we cannot source or generate appropriate imagery, we use bold typographic layouts instead. An empty image slot is worse than no image at all.

**Responsiveness.** Every site must look intentional on mobile on first deploy. Not "it technically works on mobile." It must look like mobile was the primary design target. 60%+ of visitors will see it on a phone.

**The minimum quality bar: would I show this site to a client and charge money for it?** If the answer is no, it does not ship. The content moderation guardrail Jensen specified should extend to design quality. A site that passes content moderation but looks amateur still damages the brand.

---

## 5. What Makes This Great vs. Just Functional

The functional version: PRD goes in, site comes out, URL gets posted. It works. Engineers high-five. Nobody else cares.

The great version changes how people think about making websites.

Here is what separates the two:

**Speed as a feature, not a metric.** The site must be live in under 2 minutes. Not "usually under 5." Under 2. When the generation time is fast enough, it stops being a tool and starts being magic. The difference between 2 minutes and 10 minutes is not 8 minutes. It is the difference between "I just made a website" and "I waited for a website."

**Taste is the algorithm.** The generated sites do not offer infinite customization. They offer curated quality. Five tone options, not fifty. Eight type pairings, not eight hundred. Constraints are what make the output reliably excellent. Every choice we remove from the user is a choice they cannot get wrong.

**The URL is the product.** The preview URL must be beautiful. Not `worker-abc123.cloudflareworkers.dev`. Something like `preview.shipwright.site/your-site-name`. The URL is the first thing people share. It must look intentional.

**Iteration, not perfection.** After the reveal, one button: "Refine." Not a page builder. Not a dashboard with 40 settings. A conversation. "Make the headline bolder." "Change the color to something warmer." "Add a testimonials section." Natural language refinement. The site updates live. This is where the revision token budget from the credit system earns its keep.

**What I will fight for:** This is not a developer tool that generates websites. This is the moment when making a website becomes as simple as describing what you want. Every decision we make must serve that singular idea. If a technical choice makes the architecture cleaner but the experience worse, we choose the experience. Every time.

---

## Summary of Positions

| Topic | Position |
|-------|----------|
| Name | **Shipwright** — "Describe it. It's live." |
| Trigger UX | Simple form (3 fields), not a GitHub label. GitHub is substrate, not surface. |
| Experience Arc | Real-time build narration, full-screen reveal, one-tap share. Not a loading spinner. |
| Quality Bar | Curated type pairs, constrained palettes, strict grid, real imagery, mobile-first. Would I charge for it? |
| Great vs. Functional | Under 2 min, taste as algorithm, beautiful URLs, conversational refinement. |

I am not interested in building something that works. I am interested in building something that makes people say "How is this possible?" and then immediately share it with everyone they know.

---

*Steve Jobs, Director of Design & Brand*
*Shipyard AI*
