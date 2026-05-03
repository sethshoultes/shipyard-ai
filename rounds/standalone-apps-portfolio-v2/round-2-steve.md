# Steve Jobs — Round 2

## Where Elon Optimizes for the Wrong Metric

Elon wants to cut spec.md and todo.md because they are "process overhead." That is optimizing for *agent tokens*, not *shipping quality*. The failure mode in v1 was skipped Write calls, not complexity. Those checklists are the discipline that prevents empty hands. I would rather the agent spend forty tokens on a todo than ship nothing.

He says Lighthouse 90 is "fine" and the last five points are "theater." On a static page of text, 90 is sloppiness masquerading as pragmatism. There is no database, no animation, no excuse. The last five points are where you prove you stayed up until three in the morning. That is not theater; that is love.

He calls the portfolio "residue." But the portfolio is the *first* app every user touches. If the wrapper is residue, why did we spend a hundred million dollars on Apple Stores? Packaging is the product when attention is the scarcest resource.

Pragmatism without taste is just efficient mediocrity.

## Defending What Elon Would Cut

Elon would put GitHub links front and center because "developers want source." You do not invite someone into your cathedral and hand them a wrench. Source is backstage. Show them the performance first; the scaffolding is for those who already believe.

He would scatter tech-stack chips like confetti because engineers love dependencies. Users do not care about your dependency array. They care what it does for their heartbeat. Every chip above the fold is an admission that you are talking to yourself, not them.

He would ship three strong entries and four weak ones because "more is more." Weak entries do not add value; they dilute credibility. That is math I agree with — three strong beats seven mixed. But I go further: if it is not in a user's hands, it is vapor, not product. A painting half-painted is not hung in the museum.

## Where Elon is Right

Static export with Server Components only — correct. No database, no CMS, no auth, no edge functions for seven pages of text.

Cutting live URL curl checks from the build gate — correct. A build should not fail because GitHub hiccuped.

Cutting SCAFFOLD entries from `/work` — correct. Resume padding is not product.

Writing directly to `website/src/` instead of deliverables-dir — correct. At 100 PRDs, you have 100 orphaned backlogs waiting for a merge that never comes.

The monorepo is a prison at scale — correct. Plan the content model, not the load balancer.

Accent color audits for three cards is bike-shedding — correct. Pick a color, move on.

## Top 3 Non-Negotiables

1. **Curated scarcity on `/work`**: Only shipped, working tools. No BUILD status badges, no SCAFFOLD padding, no "coming soon." A half-painted painting is not hung in the museum.

2. **Invisible design at 95+**: Not 90. Not "good enough." The interface disappears. Zero gradients, zero pulses, zero theater. On static text, 95 is proof you care, not theater.

3. **Names are prayers, not labels**: One word. Emotional. Unforgettable. If the name does not make someone *feel* something before they understand it, it is dead. Promptfolio dies. Commandbar dies. Tuned lives.
