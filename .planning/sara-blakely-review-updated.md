# Sara Blakely's Review — Wardrobe Phase 1 Plan

**Date:** April 9, 2026
**Verdict:** 7.5/10 — Right direction, but still engineering-brain heavy

---

## 1. Would a Real Customer Pay for This?

The magic is there — "I can't believe I just did that" — but you're burying the lede. A customer doesn't care about themes. They care about **feeling professional for the first time.** Your plan addresses this in Wave 2 (GIFs, explainer), but that's Wave 2. Why isn't it Wave 1?

The before/after transformation needs to be the hero of your showcase. Not "5 themes available." Make them *see themselves* in that transformation — a messy WordPress site becoming dignified in 10 seconds. That's the feeling you're selling. Yes, people will pay for this. But only if they *feel* it first.

## 2. What's Confusing?

**"Wardrobe" still means nothing.** Your plan addresses this (task-9), but buries it. A first-time visitor lands on your showcase and sees theme cards. They don't know what Emdash is. They don't know what "install" means. The explainer can't be hidden in Wave 2 — it needs to be above the fold.

**The command is too technical.** "npx wardrobe install ember" looks like black magic to non-developers. Task-9 mentions an "npx tooltip," but that's band-aid thinking. The showcase needs a video or animated GIF showing: *Pick theme → Paste one line → Done.* No jargon.

**Coming Soon is still vague.** "Aurora, Coming August 2026" — fine. But *who* designed it? Is it worth waiting for? Add a designer credit, a 1-sentence tagline. "Aurora by [Designer] — Minimalist elegance for writers who want to disappear." Make me want to come back.

## 3. What's the First Thing You'd Test with $0 Marketing Budget?

**Ship the before/after GIF and the explainer first.** Don't wait for Wave 2.

Here's your $0 test: Deploy a minimal showcase with ONE theme showing a 3-second transformation loop. Get 10 people unfamiliar with Emdash to visit it. Record their first reaction. Do they go "wow" or "huh?"

If they go "wow," you have product-market fit. Expand to 5 themes. If they go "huh," keep iterating on the copy and GIF until they do.

Email capture is secondary. Social share is secondary. Make them say "wow" first.

## 4. Is the Plan Still Too Infrastructure-Focused?

**Better, but not flipped.**

Wave 1 is: Deploy showcase, SEO tags, R2 bucket, Coming Soon check, email API. That's 5 technical tasks.

Wave 2 is: Analytics, telemetry, GIFs, explainer, social share. That's 5 customer magic tasks.

You split it 50/50, but customers don't care about analytics on day one — they care about being blown away. **I'd reorder:**

1. **Wave 1: Magic** — Deploy showcase + GIFs (task-8) + Explainer (task-9) + Social share hook (task-10). Get the "wow" moment working.
2. **Wave 2: Infrastructure** — R2, email, analytics, telemetry.
3. **Wave 3: Polish & Publish** — README, pricing, CI/CD, npm.

You have the right ingredients. Wrong menu order.

## 5. Does the Plan Address My Original Concerns?

### "Wardrobe means nothing"
✓ **Addressed** — Task-9 adds explainer, "Emdash is a simple CMS," value prop clear. But buries it in Wave 2. Move to Wave 1.

### "No before/after GIFs"
✓ **Addressed** — Task-8 creates transformation GIFs, lazy-loaded. This is gold. But again, Wave 2. Move before you deploy.

### "Coming Soon feels vague"
✓ **Addressed** — Task-4 makes dates specific ("Coming August 2026"). Add designer names too. Not half-done — finish the job.

### "No word-of-mouth DNA"
✓ **Addressed** — Task-10 adds Twitter share CTA with pre-filled tweet. Correct instinct, but it's a CLI feature. You need an in-site hook too. After someone installs via your showcase, give them a "Share your new look" button with a preview image of their transformed site. Make it personal.

### "80% infrastructure, 20% magic"
⚠️ **Partially addressed** — You've identified the magic tasks (8-10), but they're sequenced after infrastructure. Flip the priority. The magic is what makes the infrastructure matter.

---

## One Actionable Recommendation

**Don't deploy yet.** Create a smoke test first:

1. Pick your favorite theme (Slate).
2. Record a 6-second GIF: boring default → Slate applied. Clean, no UI. Just the transformation.
3. Write one sentence: "Your site. Dignified. One command."
4. Show 20 people outside your company. Don't explain. Just ask: "Would you want this?"

If 15/20 say yes, ship. If 12/20 say yes, refine the copy. If less than 10/20 say yes, rethink the value prop.

This takes 2 hours. It saves 3 weeks if you're building the wrong thing.

---

## Final Take

You've gone from "why does this exist?" to "I see why this exists." That's a real shift. The plan has teeth. But you're still thinking like engineers — infrastructure first, magic second. Flip it. Customers don't care about CI/CD pipelines. They care about feeling like their site went to an Ivy League school while they sipped coffee.

Make them *feel* it first. Then measure it.

**Score: 7.5/10**

Ship the magic. The infra can wait.

---

*— Sara*

---

**P.S.** Your email capture is smart, but don't call it "email signup for Coming Soon themes." Call it "Be first to know when your favorite theme launches." Make it about them, not your launch schedule.
