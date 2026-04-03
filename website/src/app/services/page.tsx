import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services — Shipyard AI",
  description: "Emdash sites, themes, and plugins built from PRDs with transparent token-based pricing.",
};

const tiers = [
  {
    name: "Simple Site",
    pages: "Up to 5 pages",
    tokens: "500K",
    includes: ["Design & layout", "Content integration", "Emdash deploy"],
  },
  {
    name: "Standard Site",
    pages: "Up to 10 pages",
    tokens: "1M",
    includes: ["Everything in Simple", "SEO optimization", "Analytics setup", "Contact forms"],
    featured: true,
  },
  {
    name: "Complex Site",
    pages: "20+ pages",
    tokens: "2M",
    includes: ["Everything in Standard", "API integrations", "Custom components", "Performance tuning"],
  },
];

const addOns = [
  { name: "Custom Theme", tokens: "750K", desc: "Design system, tokens, component library, docs" },
  { name: "Custom Plugin", tokens: "500K", desc: "Business logic, tests, API hooks, docs" },
  { name: "Revision Round", tokens: "100K", desc: "Scoped changes to a deployed product" },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Services</h1>
      <p className="mt-4 max-w-lg text-lg text-muted">
        Every project gets a token budget. You know the cost upfront. We ship
        within that budget or explain why.
      </p>

      <div className="mt-16 grid gap-6 sm:grid-cols-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`rounded-xl border p-8 ${
              t.featured
                ? "border-accent bg-surface"
                : "border-border bg-surface"
            }`}
          >
            {t.featured && (
              <div className="mb-4 inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold">{t.name}</h3>
            <p className="mt-1 text-sm text-muted">{t.pages}</p>
            <div className="mt-4 text-3xl font-bold text-accent">
              {t.tokens} <span className="text-base font-normal text-muted">tokens</span>
            </div>
            <ul className="mt-6 space-y-2">
              {t.includes.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted">
                  <span className="text-accent">&#10003;</span> {item}
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

      <h2 className="mt-24 text-2xl font-bold tracking-tight">Add-Ons</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {addOns.map((a) => (
          <div key={a.name} className="rounded-xl border border-border bg-surface p-6">
            <h3 className="font-semibold">{a.name}</h3>
            <p className="mt-2 text-sm text-muted">{a.desc}</p>
            <div className="mt-3 font-mono text-sm text-accent">{a.tokens} tokens</div>
          </div>
        ))}
      </div>
    </div>
  );
}
