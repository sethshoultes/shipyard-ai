import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipyard AI — PRD to Production",
  description: "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
  openGraph: {
    title: "Shipyard AI — PRD to Production",
    description: "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
    url: "https://shipyard.company",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipyard AI — PRD to Production",
    description: "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
  },
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 py-28 sm:py-40">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Accepting new PRDs
          </div>
          <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            PRD in.
            <br />
            <span className="text-accent">Production out.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Shipyard AI is an autonomous agency that builds Emdash sites, themes,
            and plugins from your PRD. No hand-holding. No scope creep. Just
            shipped products.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-black transition hover:bg-accent-dim"
            >
              Submit a PRD
            </Link>
            <Link
              href="/pipeline"
              className="rounded-full border border-border px-8 py-3.5 text-base font-semibold transition hover:border-muted hover:bg-surface"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { label: "Agents", value: "7" },
    { label: "Pipeline Stages", value: "6" },
    { label: "Token Tiers", value: "5" },
    { label: "Ship Rate", value: "100%" },
  ];
  return (
    <section className="border-b border-border bg-surface">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-border sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="px-6 py-8 text-center">
            <dd className="text-3xl font-bold text-accent">{s.value}</dd>
            <dt className="mt-1 text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ServicesSection() {
  const services = [
    {
      title: "Emdash Sites",
      description:
        "Full websites built from your PRD. Design, content, SEO, and deployment included. 5 to 50+ pages.",
      tokens: "500K - 2M tokens",
    },
    {
      title: "Emdash Themes",
      description:
        "Custom design systems with reusable components, design tokens, and documentation.",
      tokens: "750K tokens",
    },
    {
      title: "Emdash Plugins",
      description:
        "Custom functionality with full test coverage. Logic, API integrations, and docs.",
      tokens: "500K tokens",
    },
    {
      title: "Revisions",
      description:
        "Post-deploy changes billed per revision round. Quick turnaround, scoped by tokens.",
      tokens: "100K per round",
    },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          What We Build
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Every product type has a token budget. You know the cost before we
          start. No surprises.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {services.map((s) => (
            <div
              key={s.title}
              className="rounded-xl border border-border bg-surface p-8 transition hover:border-muted"
            >
              <h3 className="text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {s.description}
              </p>
              <div className="mt-4 inline-flex rounded-full bg-background px-3 py-1 font-mono text-xs text-accent">
                {s.tokens}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const stages = [
    { step: "01", name: "Intake", desc: "PRD drops. Token budget assigned." },
    { step: "02", name: "Debate", desc: "Directors align on strategy. 2 rounds max." },
    { step: "03", name: "Plan", desc: "Sub-agents hired. Tasks assigned." },
    { step: "04", name: "Build", desc: "Parallel execution. Feature branches." },
    { step: "05", name: "Review", desc: "QA runs. P0s block ship." },
    { step: "06", name: "Deploy", desc: "Push to Emdash. You're live." },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The Pipeline
        </h2>
        <p className="mt-3 max-w-lg text-muted">
          Six stages from PRD to production. Every stage has a token budget.
          Every agent has a role.
        </p>
        <div className="mt-12 grid gap-0 sm:grid-cols-6">
          {stages.map((s, i) => (
            <div
              key={s.step}
              className="relative border-l border-border pb-8 pl-6 sm:border-l-0 sm:border-t sm:pb-0 sm:pl-0 sm:pr-4 sm:pt-6"
            >
              <div className="font-mono text-xs text-accent">{s.step}</div>
              <div className="mt-1 font-semibold">{s.name}</div>
              <div className="mt-1 text-xs text-muted">{s.desc}</div>
              {i < stages.length - 1 && (
                <div className="absolute right-0 top-6 hidden text-border sm:block" aria-hidden="true">
                  &rarr;
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to ship?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Send us your PRD. We&apos;ll scope it, quote tokens, and start
          building. No meetings required.
        </p>
        <Link
          href="/contact"
          className="mt-8 inline-flex rounded-full bg-accent px-10 py-4 text-base font-semibold text-black transition hover:bg-accent-dim"
        >
          Submit Your PRD
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <PipelineSection />
      <CTASection />
    </>
  );
}
