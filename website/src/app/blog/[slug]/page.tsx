import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import type { Metadata } from 'next';
import Link from 'next/link';

// Required for static export
export function generateStaticParams() {
  return getAllPostSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return {
    title: `${post.title} — Shipyard AI`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.shipyard.company/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
    },
  };
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  return (
    <>
      {/* Back link */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition"
          >
            <span>←</span>
            <span>Back to blog</span>
          </Link>
        </div>
      </section>

      {/* Post Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-muted">
              {formatDate(post.date)}
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {post.title}
            </h1>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block bg-surface px-3 py-1 rounded-full text-xs font-medium text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <article className="prose prose-invert max-w-none">
            <div
              dangerouslySetInnerHTML={{ __html: post.content }}
              className="space-y-4 leading-relaxed"
            />
          </article>
        </div>
      </section>

      {/* Back to blog CTA */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                More from the blog
              </h2>
              <p className="mt-2 text-muted">
                Read more engineering insights and product decisions.
              </p>
            </div>
            <Link
              href="/blog"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition hover:bg-accent-dim whitespace-nowrap"
            >
              All posts
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
