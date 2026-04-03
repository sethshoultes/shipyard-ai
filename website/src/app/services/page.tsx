import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services & Pricing — Shipyard AI",
  description:
    "Emdash sites from $2,500, themes from $1,500, plugins from $1,000, WordPress migrations from $3,500. Fixed-price, token-based billing with no surprises.",
  openGraph: {
    title: "Services & Pricing — Shipyard AI",
    description:
      "Emdash sites, themes, and plugins with transparent fixed pricing. Built by AI agents, deployed to production.",
    url: "https://shipyard.company/services",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Services & Pricing — Shipyard AI",
    description:
      "Emdash sites, themes, and plugins with transparent fixed pricing. Built by AI agents, deployed to production.",
  },
};

const tiers = [
  {
    name: "Simple Site",
    pages: "Up to 5 pages",
    price: "$2,500",
    tokens: "500K",
    description:
      "Perfect for small businesses, portfolios, and landing pages. Clean design, responsive layout, deployed and ready to go.",
    includes: [
      "Custom design & layout",
      "Responsive mobile-first build",
      "Content integration from your brief",
      "Contact form setup",
      "Emdash deployment",
    ],
  },
  {
    name: "Standard Site",
    pages: "Up to 10 pages",
    price: "$5,000",
    tokens: "1M",
    description:
      "For growing businesses that need SEO, analytics, and more pages. The most popular choice for companies migrating from WordPress.",
    includes: [
      "Everything in Simple",
      "SEO optimization & meta tags",
      "Analytics integration (GA4)",
      "Blog or news section",
      "Custom contact forms",
      "JSON-LD structured data",
    ],
    featured: true,
  },
  {
    name: "Complex Site",
    pages: "20+ pages",
    price: "$10,000",
    tokens: "2M",
    description:
      "Large-scale sites with API integrations, custom components, and advanced functionality. Built for performance at scale.",
    includes: [
      "Everything in Standard",
      "Third-party API integrations",
      "Custom interactive components",
      "Performance tuning & optimization",
      "Advanced SEO (sitemaps, schema)",
      "Multi-language support",
    ],
  },
];

const additionalServices = [
  {
    name: "Custom Theme",
    price: "$1,500",
    tokens: "750K",
    description:
      "A complete Emdash design system: tokens, components, layouts, and documentation. Reusable across multiple sites.",
    includes: [
      "Design token system (colors, type, spacing)",
      "Reusable component library",
      "Multiple layout templates",
      "Full documentation",
    ],
  },
  {
    name: "Custom Plugin",
    price: "$1,000",
    tokens: "500K",
    description:
      "Custom Emdash functionality — business logic, API hooks, admin interfaces. Fully tested and documented.",
    includes: [
      "Business logic implementation",
      "API integration hooks",
      "Full test coverage",
      "Installation & usage docs",
    ],
  },
  {
    name: "WordPress Migration",
    price: "$3,500",
    tokens: "1.5M",
    description:
      "Complete migration from WordPress to Emdash. We handle content, URLs, SEO, and redirects so you don't lose a single ranking.",
    includes: [
      "Full content transfer",
      "URL mapping & 301 redirects",
      "SEO preservation (meta, schema)",
      "Theme rebuild in Emdash",
      "Post-migration QA audit",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            provider: {
              "@type": "Organization",
              name: "Shipyard AI",
              url: "https://shipyard.company",
            },
            name: "Emdash Development Services",
            description:
              "AI-powered development of Emdash sites, themes, and plugins from PRDs.",
            serviceType: "Web Development",
            areaServed: "Worldwide",
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Emdash Development Packages",
              itemListElement: tiers.map((t) => ({
                "@type": "Offer",
                name: t.name,
                description: t.description,
                price: t.price.replace("$", "").replace(",", ""),
                priceCurrency: "USD",
              })),
            },
          }),
        }}
      />

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Services &amp; Pricing
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Fixed-price packages based on token budgets. You know what you&apos;re
        paying before we write a single line of code. Every project includes
        QA, deployment, and a 10% reserve for rework.
      </p>

      {/* Site tiers */}
      <h2 className="mt-20 text-2xl font-bold tracking-tight">Emdash Sites</h2>
      <p className="mt-2 text-sm text-muted">
        Full websites built from your PRD. Design, content, SEO, and deployment included.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-xl border p-8 ${
              t.featured
                ? "border-accent bg-surface"
                : "border-border bg-surface"
            }`}
          >
            {t.featured && (
              <div className="mb-4 inline-flex self-start rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.pages}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-accent">{t.price}</span>
              <span className="ml-2 font-mono text-xs text-muted">
                {t.tokens} tokens
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {t.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2">
              {t.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 text-accent" aria-hidden="true">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition ${
                t.featured
                  ? "bg-accent text-black hover:bg-accent-dim"
                  : "border border-border hover:border-muted hover:bg-surface-hover"
              }`}
            >
              Start Project
            </Link>
          </div>
        ))}
      </div>

      {/* Additional services */}
      <h2 className="mt-24 text-2xl font-bold tracking-tight">
        Themes, Plugins &amp; Migrations
      </h2>
      <p className="mt-2 text-sm text-muted">
        Standalone services or add-ons to any site package.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {additionalServices.map((s) => (
          <div
            key={s.name}
            className="flex flex-col rounded-xl border border-border bg-surface p-8"
          >
            <h3 className="text-xl font-bold">{s.name}</h3>
            <div className="mt-3">
              <span className="text-2xl font-bold text-accent">{s.price}</span>
              <span className="ml-2 font-mono text-xs text-muted">
                {s.tokens} tokens
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {s.description}
            </p>
            <ul className="mt-6 flex-1 space-y-2">
              {s.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-0.5 text-accent" aria-hidden="true">&#10003;</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/contact"
              className="mt-8 block rounded-full border border-border py-3 text-center text-sm font-semibold transition hover:border-muted hover:bg-surface-hover"
            >
              Start Project
            </Link>
          </div>
        ))}
      </div>

      {/* Revision pricing */}
      <div className="mt-24 rounded-xl border border-border bg-surface p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Revisions</h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Need changes after deploy? Revision rounds are scoped and priced
              separately. Each round includes a QA pass and redeployment.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-3xl font-bold text-accent">$500</div>
            <div className="mt-1 font-mono text-xs text-muted">100K tokens per round</div>
          </div>
        </div>
      </div>

      {/* How pricing works */}
      <div className="mt-24">
        <h2 className="text-2xl font-bold tracking-tight">How Token Pricing Works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-sm text-accent">01</div>
            <h3 className="mt-2 font-semibold">Fixed Budget</h3>
            <p className="mt-2 text-sm text-muted">
              Every project gets a token budget based on complexity. Tokens map
              directly to AI compute costs. Your price is locked before we start.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-sm text-accent">02</div>
            <h3 className="mt-2 font-semibold">Transparent Tracking</h3>
            <p className="mt-2 text-sm text-muted">
              We track token burn in real-time. 60% goes to building, 20% to QA
              and deployment, 10% to strategy, and 10% held in reserve.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-sm text-accent">03</div>
            <h3 className="mt-2 font-semibold">No Overruns</h3>
            <p className="mt-2 text-sm text-muted">
              When the budget is spent, the project ships as-is. Unused reserve
              tokens are returned. Need more? Buy a revision round.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-24 text-center">
        <h2 className="text-2xl font-bold">Not sure which package?</h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Describe your project and we&apos;ll recommend the right package and
          quote a token budget. No commitment, no meetings.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-accent px-10 py-4 text-base font-semibold text-black transition hover:bg-accent-dim"
        >
          Get a Quote
        </Link>
      </div>
    </div>
  );
}
