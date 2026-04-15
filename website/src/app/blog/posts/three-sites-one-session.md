---
title: "How We Built 3 Sites in One Session"
description: "Our AI agents debated strategy, built in parallel, and deployed to Cloudflare. Here's the full pipeline breakdown."
date: "2026-04-04"
tags: ["ai-agents", "multi-agent", "automation", "emdash"]
---

On March 28th, we launched three EmDash sites in a single day: Bella's Bistro, Peak Dental, and Craft & Co. Three different industries, three different designs, three different content strategies. All shipping before lunch. This isn't a fluke—it's what happens when you build the right system.

Here's how it went down.

At 9 AM, three PRDs landed on the intake desk. Each one: 5 pages, specific branding, local business focus. Enough scope to require design work but not so much that we'd be underwater. Total token budget: 900K tokens across all three. Normally this would be a 2-week project. We gave ourselves 8 hours.

Stage 1: Debate. Steve Jobs and Elon Musk spent 30 minutes locking down the strategy. Should we build three custom themes, or one flexible theme with configuration? Custom themes would look better; one theme would ship faster. They decided: one theme, heavily customizable. That decision collapsed 40% of the build work. The reserve team (Maya Angelou, Rick Rubin, Jony Ive) waited in the wings for their assignments.

Stage 2: Plan. Elon mapped out the agent assignments. Rick Rubin got Bella's Bistro—warmth, hospitality, hand-drawn elements. Jony Ive got Peak Dental—clean, minimal, trust-focused. Maya Angelou got Craft & Co—editorial, artisanal, storytelling. Each agent knew their inputs (brand guidelines, content, photos), their outputs (Astro components, Portable Text seed data, deployment artifacts), and their token allocation (250K each). The whole plan took 15 minutes.

Stage 3: Build. Three agents, three browsers, building in parallel. 9:45 AM to 11:30 AM. Here's what each one did:

Rick started by building the Astro component structure. Three layout variations (hero, gallery, testimonials), then configured for Bella's. He generated placeholder content blocks in Portable Text, validated them against the schema, then hand-wrote the real copy. No HTML manipulation—everything was JSON, typed, validated. Token burn: 85K.

Jony built the design system. He took the base theme, reskinned it with Peak Dental's palette (cool blues, professional serif), then built a custom "trust" component—three pillars with icons and copy. All TypeScript, all type-safe. Token burn: 92K.

Maya handled Craft & Co's content strategy. She wrote the homepage copy, blog header, about-page narrative. She worked in Portable Text directly, embedding her own schema-aware content blocks. No coordination needed—she knew what blocks were available because they were typed. Token burn: 78K.

While they built, Margaret Hamilton (our QA agent) ran continuous checks. Every 15 minutes, she'd run the build, check TypeScript, run accessibility audits, verify Portable Text validation. Zero broken builds. That's the power of types.

Stage 4: Review. 11:30 AM, everything's built. Margaret runs the final audit: accessibility (WCAG AA passed), performance (Lighthouse 95+), SEO (schema markup validated). One issue: Peak Dental's form needed a honeypot field for spam protection. Jony adds it. 20 minute revision. Total revision tokens: 12K.

Stage 5: Deploy. 11:50 AM. Three deploys to Cloudflare Pages. All succeed on first try. DNS pointed. SSL provisioned. Done.

Total tokens burned: 267K. Budget was 900K. We had 633K left over—returned to the clients.

So what made this possible?

First: The system. PRD intake, debate stage, plan stage, parallel build, integrated QA, atomic deploy. We've run this pipeline enough times that the overhead is gone.

Second: AI agents actually work. Steve and Elon disagreed three times during debate (theme strategy, navigation depth, hero image treatment). Instead of consensus-seeking, they defended their positions. Steve's argument won on two; Elon's won on one. The result was better than either of them would have produced alone. Disagreement produces better work if you have a decision framework.

Third: Portable Text and EmDash. Types, schemas, validation. When everything is structured, agents can work independently without coordination. Rick doesn't need to ask Jony "is this component valid?" because the schema tells him. Jony doesn't need to wait for Maya to finish copy because the blocks exist, typed, waiting to be filled. Parallelization is free when the system is designed for it.

Fourth: The right token allocation. We didn't try to squeeze three sites into a 300K budget. We allocated generously (250K per agent), which meant agents could think, iterate, and refine without token pressure. Turns out: slack enables speed.

Could we have built these sites faster? Maybe. Could we have built them cheaper? Sure—lower quality, cut corners, reduce scope. But we wanted to prove that the system works: good quality, full scope, atomic deploy, no rework, no human post-processing. The pipeline delivered.

The next question everyone asks: can we do this every day? The answer is yes. The system scales as long as the PRDs are clear and the token budget is honest. We've got a calendar now. Every Wednesday, three new sites. Every Friday, deploy day. It's not magic—it's a system that works.
