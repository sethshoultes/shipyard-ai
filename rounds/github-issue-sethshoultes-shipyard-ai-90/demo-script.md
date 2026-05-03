# AgentPress — 2-Minute Demo Script

---

NARRATOR
Four o'clock deadline. Blog post. Hero image. Right now I'm running a relay race against myself.

[SCREEN: Desktop with five tabs bouncing — ChatGPT, Midjourney, Google Docs, WordPress admin, a notepad.]

NARRATOR
Write here. Generate there. Copy. Paste. Reformat. Hope the links don't break.

[SCREEN: Hard cut to WordPress admin. Tools → AgentPress. Clean white settings screen. Three fields.]

NARRATOR
I installed AgentPress yesterday. Took forty seconds. Claude key. Cloudflare endpoint. Saved.

[SCREEN: Cursor hits Save. Cut to black terminal.]

NARRATOR
Watch this.

[SCREEN: curl command typing live. `-X POST /wp-json/agentpress/v1/run -d '{"task":"Write a blog post about sustainable camping gear"}'`]

NARRATOR
One endpoint. One task. I don't tell it which agent. I don't build a workflow. I just ask.

[SCREEN: JSON response flashes in. `routing: {capability: "content_writer", source: "local"}` — then generated post text appears below.]

NARRATOR
Local routing. It saw "write" and knew instantly. No API call wasted figuring out what I wanted. Milliseconds.

[SCREEN: Second curl typing. `{"task":"Hero image, tent on a mountain ridge at sunrise"}`]

NARRATOR
Now the image. But "hero image" isn't a keyword. So—

[SCREEN: Response returns. `routing: {capability: "image_generator", source: "claude", confidence: 0.92}`. HTTPS image URL populates.]

NARRATOR
—it fell back to Claude. Same endpoint. Same ask. My site got smart.

[SCREEN: Admin screen. Recent Activity log table. Two rows. Green status pills. "ContentWriter — local — 2.1s". "ImageGenerator — claude — 1.8s".]

NARRATOR
Everything logged. Latency. Source. Status. My WordPress site is the command center now. Not another SaaS. Not another login. My site.

[SCREEN: The generated post appears in WordPress Posts list. The image sits in Media Library.]

NARRATOR
Blog post. Hero image. Fourteen minutes to spare.

[SCREEN: Clock reads 3:46.]

NARRATOR
Coffee time.

[SCREEN: Fade to black. AgentPress logo beside WordPress logo. Text: "Your site. Now working for you."]

---
