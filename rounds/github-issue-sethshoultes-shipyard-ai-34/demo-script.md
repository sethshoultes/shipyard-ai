# SEODash Demo Script — 2 Minutes

---

NARRATOR:
You've got 500 pages on your site. Google's indexing them. Some rank. Some don't. You don't know which ones are broken.

[SCREEN: Analytics dashboard showing traffic graph going sideways]

NARRATOR:
Your client asks: "Why aren't we ranking?" You say... what? "Let me check 500 pages manually?"

[SCREEN: Browser tabs multiplying — View Source, Lighthouse, Google Search Console]

NARRATOR:
There's gotta be a better way.

[SCREEN: Fade to black. Title card: "SEODash"]

---

NARRATOR:
SEODash runs inside your CMS. One plugin. One dashboard.

[SCREEN: Emdash admin UI loads. SEO tab appears in sidebar]

NARRATOR:
It audits every page automatically. Title tags. Meta descriptions. Open Graph cards. All of it.

[SCREEN: Dashboard table loads — 50 pages, each with SEO score]

NARRATOR:
Worst first.

[SCREEN: Page with score 40/100 at top of list — "Missing meta description, title too short"]

NARRATOR:
You see the problem immediately. Missing meta description. Title's too short. Click to fix.

[SCREEN: Quick-edit modal opens — fields pre-filled with current values]

NARRATOR:
Type. Save.

[SCREEN: Score updates to 85/100 in real time]

NARRATOR:
Done.

---

NARRATOR:
But here's the thing. You've got 500 pages. This thing just loaded all 500 in under 50 milliseconds.

[SCREEN: Network tab shows single KV read — 1 request, 48ms]

NARRATOR:
Before? 500 database calls. Five seconds. Browser locked up.

[SCREEN: Split screen — old version vs. new. Old: spinning wheel. New: instant load]

NARRATOR:
We denormalized the storage. One read. All pages. 100x faster.

---

NARRATOR:
Sitemap? Auto-generated. Updates when you save.

[SCREEN: Page save triggers sitemap cache invalidation — timestamp updates]

NARRATOR:
Social previews? Facebook, Twitter, Google — live render.

[SCREEN: Mock-up of social preview cards — "Coming in Wave 5"]

NARRATOR:
Structured data? JSON-LD templates. Fill in the blanks.

[SCREEN: Mock-up of Article schema form — "Coming in Wave 7"]

---

NARRATOR:
Here's what we shipped today. Removed the dead weight — meta keywords field, nobody's used that since 2009. Sitemap pattern overrides, robots.txt UI — gone. You don't need them.

[SCREEN: Git diff — 100 lines deleted, green minus signs]

NARRATOR:
What you get: Fast. Simple. It works.

---

NARRATOR:
50 pages at a time. Cursor pagination. No browser crashes. Worst-first sorting. Fix what matters.

[SCREEN: Pagination controls — "Page 1 of 10" — Previous/Next buttons]

NARRATOR:
Your client asks: "Why aren't we ranking?"

You show them this.

[SCREEN: Dashboard with clear red/yellow/green scores — problems highlighted]

NARRATOR:
Now you have answers.

[SCREEN: Title card: "SEODash — Ship it."]

---

**Runtime: 2:00**
**Status: Ready for Wave 6 deployment**
