import type { Metadata } from "next";
import Link from "next/link";
import { getMarketingDoc } from "@/lib/marketing";
import { renderMarkdown } from "@/lib/markdown-jsx";

export const metadata: Metadata = {
  title: "Pricing — Shipyard AI",
  description:
    "Productized Emdash sites, fixed scope, fixed price, fixed timeline. Three tiers, beta program for the first five customers.",
  openGraph: {
    title: "Pricing — Shipyard AI",
    description:
      "Productized Emdash sites, fixed scope, fixed price, fixed timeline. Three tiers, beta program for the first five customers.",
    url: "https://shipyard.company/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — Shipyard AI",
    description:
      "Productized Emdash sites. Fixed scope. Fixed price. Beta program for the first five customers.",
  },
};

export default async function PricingPage() {
  const sales = await getMarketingDoc("sales-page");
  const pricing = await getMarketingDoc("pricing-page");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16 sm:py-24">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-accent">PRICING & PROCESS</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              How we work, what it costs, what to expect.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Three productized tiers. The beta program is open to the first
              five customers. Real persona names on every artifact you receive.
            </p>
          </div>
        </div>
      </section>

      {/* Sales-page positioning (Maya Angelou) */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <article className="text-base leading-relaxed">
            {renderMarkdown(sales.raw)}
          </article>
        </div>
      </section>

      {/* Pricing detail (Sara Blakely) */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-16">
          <article className="text-base leading-relaxed">
            {renderMarkdown(pricing.raw)}
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Ready to start?</h2>
            <p className="text-lg text-muted">
              Fill out the intake form. We respond within 48 hours.
            </p>
            <Link
              href="/intake"
              className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white transition hover:bg-accent-dim"
            >
              Start your project
            </Link>
            <p className="text-xs text-muted">
              Beta-discount price applies to the first five customers.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
