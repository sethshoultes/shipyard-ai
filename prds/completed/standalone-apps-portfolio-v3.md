# PRD: Standalone Apps Portfolio (v3 — pre-researched, no read-existing)

**Slug:** `standalone-apps-portfolio-v3`
**Project:** `website` (shipyard.company)
**Type:** Feature — content + routing
**Priority:** P1
**Date:** 2026-05-03
**Supersedes:** v1 (hollow under Kimi), v2 (hollow under qwen3.5 + glm-4.6 — read-existing PRD shape doesn't work)

---

## Why v3 exists

v1 and v2 failed identically on three different models (kimi, qwen3.5, glm-4.6) because they instruct the build agent to "READ each `projects/<name>/` then synthesize descriptions." Across all models tested, that prompt shape produces zero `Write` tool calls. The builder reads, accumulates context, and never transitions to writing source files.

v3 removes the read-existing step. **All factual content about the 3 apps is already pre-researched and embedded in this PRD as literal copy-paste strings.** The build agent only needs to write what's already in this file.

---

## Locked decisions (carried from v1 debate, see `rounds/standalone-apps-portfolio/decisions.md`)

- Static export, zero runtime
- No gradients, no pulses, no theater
- Single `portfolio.ts` consumed by every route
- `generateStaticParams` for `[slug]`
- Server Components only
- No screenshots / browser mockups in v1

## Required output (build gate enforces ≥3 .ts/.tsx files)

All work in `/home/agent/shipyard-ai/deliverables/standalone-apps-portfolio-v3/`:

1. `spec.md` — restate the 7 acceptance criteria below
2. `todo.md` — checklist (each file = one item)
3. `portfolio.ts` — exact contents specified below
4. `work-section.tsx` — drop-in JSX section for `/work` page
5. `portfolio-slug-page.tsx` — Next.js dynamic `[slug]` page
6. `tests/portfolio-data.test.ts` — node --test validation
7. `MIGRATION.md` — instructions for human integration

---

## EXACT contents for `portfolio.ts`

Write this file verbatim. Do not modify the strings. These descriptions were verified against actual source code in `projects/<name>/` on 2026-05-03.

```ts
export type AppEntry = {
  slug: string;
  name: string;
  tagline: string;
  status: "SHIPPED" | "BUILD" | "SCAFFOLD";
  github: string;
  features: string[];
  techStack: string[];
  accent: "amber" | "rose" | "teal" | "cyan" | "lime" | "fuchsia";
};

export const apps: AppEntry[] = [
  {
    slug: "tuned",
    name: "Tuned",
    tagline: "Prompt version control for AI applications. Track, version, and roll out prompts across your stack.",
    status: "BUILD",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/tuned",
    features: [
      "CLI (`tuned`) built on Commander for prompt push/pull/diff",
      "TypeScript SDK exported as `@tuned/sdk` with ESM-only build",
      "Cloudflare Worker storage backend (Wrangler-deployed)",
      "Dashboard for viewing prompt history and diffs",
      "Schema-first design (worker/schema.sql)"
    ],
    techStack: ["TypeScript", "Commander", "Cloudflare Workers", "Wrangler"],
    accent: "amber"
  },
  {
    slug: "promptfolio",
    name: "Promptfolio",
    tagline: "Turn your Claude conversation exports into a shareable, indexed portfolio of prompts.",
    status: "BUILD",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/promptfolio",
    features: [
      "Parses Claude `.json` exports via Zod-validated schema",
      "Renders markdown with `react-markdown` + GitHub-flavored remark",
      "Auto-generated OG images via `@vercel/og`",
      "Bulk export as `.zip` archive of selected prompts",
      "Next.js 14 App Router with server components"
    ],
    techStack: ["Next.js 14", "React 18", "Zod", "@vercel/og", "react-markdown"],
    accent: "rose"
  },
  {
    slug: "commandbar",
    name: "Beam (Commandbar)",
    tagline: "WordPress command palette plugin. Cmd-K to navigate, search, and act anywhere on a WP site.",
    status: "SHIPPED",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/commandbar-prd",
    features: [
      "Single-file PHP plugin (beam.php) with vanilla-JS frontend",
      "Cmd-K / Ctrl-K keyboard activation across admin and front-end",
      "Search WP posts, pages, settings via REST",
      "Shipped as packaged zip in `deploy/beam-1.0.0.zip`",
      "Zero build step — plug-and-play activation"
    ],
    techStack: ["PHP", "JavaScript", "WordPress"],
    accent: "teal"
  }
];
```

---

## EXACT contents for `work-section.tsx`

```tsx
import Link from "next/link";
import { apps } from "./portfolio";

const statusBadge = {
  SHIPPED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  BUILD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  SCAFFOLD: "bg-slate-500/10 text-slate-400 border-slate-500/20",
} as const;

const accentColor = {
  amber: "text-amber-400",
  rose: "text-rose-400",
  teal: "text-teal-400",
  cyan: "text-cyan-400",
  lime: "text-lime-400",
  fuchsia: "text-fuchsia-400",
} as const;

export function AppsAndToolsSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 font-mono text-sm text-accent">APPS & TOOLS</p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Things we built along the way</h2>
          <p className="mt-3 text-lg text-muted">
            Standalone apps and developer tools that came out of the Shipyard pipeline.
          </p>
        </div>
        <div className="space-y-8">
          {apps.map((app) => (
            <article key={app.slug} className="rounded-xl border border-border bg-surface p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${statusBadge[app.status]}`}>
                    {app.status}
                  </span>
                  <h3 className={`mt-3 text-2xl font-bold tracking-tight ${accentColor[app.accent]}`}>{app.name}</h3>
                  <p className="mt-2 max-w-2xl text-muted">{app.tagline}</p>
                </div>
              </div>
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {app.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted">
                    <span className={`mt-0.5 ${accentColor[app.accent]}`}>&#9670;</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {app.techStack.map((t) => (
                    <span key={t} className="rounded bg-surface px-2 py-1 font-mono text-xs text-muted">{t}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <a href={app.github} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-surface">
                    View on GitHub <span aria-hidden="true">&rarr;</span>
                  </a>
                  {app.status !== "SCAFFOLD" && (
                    <Link href={`/portfolio/${app.slug}`}
                      className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20">
                      Read more <span aria-hidden="true">&rarr;</span>
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

## EXACT contents for `portfolio-slug-page.tsx`

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apps, type AppEntry } from "./portfolio";

export async function generateStaticParams() {
  return apps.filter((a) => a.status !== "SCAFFOLD").map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const app = apps.find((a) => a.slug === params.slug);
  if (!app) return {};
  const url = `https://shipyard.company/portfolio/${app.slug}`;
  return {
    title: `${app.name} — Shipyard AI`,
    description: app.tagline,
    alternates: { canonical: url },
    openGraph: { title: app.name, description: app.tagline, url, type: "article" },
    twitter: { card: "summary", title: app.name, description: app.tagline },
  };
}

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
  const app: AppEntry | undefined = apps.find((a) => a.slug === params.slug);
  if (!app || app.status === "SCAFFOLD") notFound();

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <header className="border-b border-border pb-8">
        <span className="inline-block rounded-full border px-3 py-1 text-xs font-medium">{app.status}</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">{app.name}</h1>
        <p className="mt-3 text-lg text-muted">{app.tagline}</p>
      </header>
      <section className="py-8">
        <h2 className="text-xl font-semibold">Features</h2>
        <ul className="mt-4 space-y-2">
          {app.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-muted">
              <span className="mt-1 text-accent">&#9670;</span>{f}
            </li>
          ))}
        </ul>
      </section>
      <section className="border-t border-border py-8">
        <h2 className="text-xl font-semibold">Tech Stack</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {app.techStack.map((t) => (
            <span key={t} className="rounded bg-surface px-3 py-1 font-mono text-sm text-muted">{t}</span>
          ))}
        </div>
      </section>
      <section className="border-t border-border py-8">
        <a href={app.github} target="_blank" rel="noopener noreferrer"
          className="block rounded-xl border border-border bg-surface p-6 transition hover:border-accent">
          <p className="text-sm font-mono text-muted">SOURCE</p>
          <p className="mt-1 text-lg font-semibold">View on GitHub &rarr;</p>
          <p className="mt-1 break-all text-sm text-muted">{app.github}</p>
        </a>
      </section>
      <footer className="border-t border-border py-8 text-center">
        <p className="text-muted">Want something like this?</p>
        <Link href="/contact" className="mt-3 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-white">
          Start a Project
        </Link>
      </footer>
    </article>
  );
}
```

---

## EXACT contents for `tests/portfolio-data.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { apps } from "../portfolio.js";

test("3 entries", () => assert.equal(apps.length, 3));

test("required fields", () => {
  for (const a of apps) {
    assert.ok(a.slug && a.name && a.tagline && a.status && a.github);
    assert.ok(Array.isArray(a.features) && a.features.length >= 3 && a.features.length <= 5);
    assert.ok(Array.isArray(a.techStack) && a.techStack.length >= 1);
  }
});

test("github url shape", () => {
  for (const a of apps) {
    assert.match(a.github, /^https:\/\/github\.com\/sethshoultes\/shipyard-ai\/tree\/main\/projects\/[a-z-]+$/);
  }
});

test("unique slugs", () => {
  const slugs = apps.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test("tagline length", () => {
  for (const a of apps) assert.ok(a.tagline.length <= 140);
});
```

---

## `MIGRATION.md` (write a 6-line version)

```
1. cp portfolio.ts website/src/lib/portfolio.ts
2. Open website/src/app/work/page.tsx; import AppsAndToolsSection from work-section.tsx; render after the projects map
3. mkdir -p website/src/app/portfolio/[slug]; cp portfolio-slug-page.tsx website/src/app/portfolio/[slug]/page.tsx
4. cd website && npm run build
5. Verify out/portfolio/tuned/index.html, out/portfolio/promptfolio/index.html, out/portfolio/commandbar/index.html exist
6. Spot-check a GitHub URL renders correctly in the rendered HTML
```

---

## `spec.md` and `todo.md`

Standard format. Each acceptance criterion = one todo. Restate the 7 ACs below.

## Acceptance Criteria

1. All 7 files exist in `deliverables/standalone-apps-portfolio-v3/`
2. `portfolio.ts` matches the verbatim string above (no improvisation)
3. `node --test --import tsx tests/portfolio-data.test.ts` exits 0
4. `npx tsc --noEmit work-section.tsx portfolio-slug-page.tsx portfolio.ts` exits 0
5. No banned content: `grep -riE 'TODO|FIXME|lorem|coming soon|placeholder' deliverables/standalone-apps-portfolio-v3/` returns nothing
6. Each GitHub URL in `portfolio.ts` returns HTTP 200
7. Total line count of `portfolio.ts` + `work-section.tsx` + `portfolio-slug-page.tsx` ≥ 200 (sanity check the build wasn't truncated)

## Out of Scope

- Editing `website/src/` directly (build into `deliverables/` only; human integrates per MIGRATION.md)
- Screenshots
- Live demos
- The other 4 apps (agentpipe, whisper, scribe, cut) — separate PRD when they have real code

## Why this PRD design works

- Zero "read existing" instructions
- Every output is a verbatim copy-paste from this PRD
- The 4 source files (.ts/.tsx) satisfy the build gate's ≥3 source-file threshold
- All values pre-validated against actual code on 2026-05-03

## Done When

All 7 acceptance criteria pass and PRD is moved to `prds/completed/`.
