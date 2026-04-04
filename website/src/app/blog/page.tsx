import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Shipyard AI",
  description:
    "Notes from the build. Engineering insights, product decisions, and reflections on building Emdash sites with AI agents.",
  openGraph: {
    title: "Blog — Shipyard AI",
    description:
      "Notes from the build. Engineering insights, product decisions, and reflections on building Emdash sites with AI agents.",
    url: "https://shipyard.company/blog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Shipyard AI",
    description:
      "Notes from the build. Engineering insights, product decisions, and reflections on building Emdash sites with AI agents.",
  },
};

const posts = [
  {
    title: "Why We Bet Everything on EmDash",
    description:
      "EmDash is the WordPress successor. Here's why we went all-in on Cloudflare's new CMS before anyone else.",
    date: "2026-04-03",
    slug: "why-we-bet-on-emdash",
  },
  {
    title: "Portable Text Changes Everything for AI Agents",
    description:
      "WordPress stores HTML blobs. EmDash stores structured JSON. This is why AI agents can build sites 10x faster.",
    date: "2026-04-03",
    slug: "portable-text-for-agents",
  },
  {
    title: "How We Built 3 Sites in One Session",
    description:
      "Our AI agents debated strategy, built in parallel, and deployed to Cloudflare. Here's the full pipeline breakdown.",
    date: "2026-04-03",
    slug: "three-sites-one-session",
  },
];

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-sm text-accent">WRITING</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Notes from the build
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Engineering insights, product decisions, and reflections on
              building Emdash sites with AI agents. We think in public.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-border pb-8 last:border-b-0"
              >
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-xs text-muted">
                    {formatDate(post.date)}
                  </p>
                  <h2 className="text-2xl font-bold leading-tight tracking-tight">
                    {post.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted">
                    {post.description}
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent border border-accent/30">
                      Coming soon
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Get updates via email
          </h2>
          <p className="mt-3 text-muted">
            New posts delivered straight to your inbox. No spam, ever.
          </p>
          <div className="mt-8 flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-border bg-background px-4 py-3 text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dim">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
