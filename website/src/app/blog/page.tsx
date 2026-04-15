import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

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

export default function BlogPage() {
  const posts = getAllPosts();

  function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

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
          <div className="space-y-16">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="border-b border-border pb-16 last:border-b-0"
              >
                <div className="flex flex-col gap-4">
                  <p className="font-mono text-xs text-muted">
                    {formatDate(post.date)}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-3xl font-bold leading-tight tracking-tight hover:text-accent transition-colors"
                  >
                    {post.title}
                  </Link>
                  <p className="text-lg leading-relaxed text-foreground">
                    {post.description}
                  </p>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-semibold text-accent hover:text-accent-dim transition-colors w-fit"
                  >
                    Read more →
                  </Link>
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
