import type { Metadata } from "next";
import Link from "next/link";
import { getMarketingDoc } from "@/lib/marketing";
import { renderMarkdown } from "@/lib/markdown-jsx";

export const metadata: Metadata = {
  title: "Terms of Service — Shipyard AI",
  description:
    "v0 Terms of Service for Shipyard AI engagements. Draft for human review; not yet final.",
  openGraph: {
    title: "Terms of Service — Shipyard AI",
    description:
      "v0 Terms of Service for Shipyard AI engagements. Draft for human review; not yet final.",
    url: "https://shipyard.company/terms",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TermsPage() {
  const terms = await getMarketingDoc("terms");

  return (
    <>
      {/* Header */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-accent">LEGAL</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
            <div className="mt-4 rounded-md border border-yellow-500/40 bg-yellow-500/5 p-4 text-sm leading-relaxed text-muted">
              <strong className="text-yellow-200">⚠️ v0 draft for human review.</strong>{" "}
              This document is a draft prepared for review by a licensed attorney
              admitted in our jurisdiction. It is not the final Terms of Service
              and must not be relied on as a binding contract. The final version
              will be posted here after attorney review and before any paying
              customer signs.
            </div>
          </div>
        </div>
      </section>

      {/* ToS content */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <article className="text-base leading-relaxed">
            {renderMarkdown(terms.raw)}
          </article>
        </div>
      </section>

      {/* Back */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center justify-between">
            <Link
              href="/pricing"
              className="text-sm text-muted hover:text-foreground transition"
            >
              ← Back to pricing
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted hover:text-foreground transition"
            >
              Questions? Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
