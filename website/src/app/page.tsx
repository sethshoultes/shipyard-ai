import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipyard AI — PRD to Production",
  description:
    "Productized Emdash sites built by a multi-agent constellation. Three tiers, fixed prices, named personas on every artifact.",
  openGraph: {
    title: "Shipyard AI — PRD to Production",
    description:
      "Productized Emdash sites built by a multi-agent constellation. Three tiers, fixed prices, named personas on every artifact.",
    url: "https://shipyard.company",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipyard AI — PRD to Production",
    description:
      "Productized Emdash sites. Three tiers. Named personas on every artifact.",
  },
};

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-muted">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Beta program open — first five customers, 50% off
            </div>
            <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
              PRD in.
              <br />
              <span className="text-accent">Production out.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Shipyard AI builds Emdash sites the way an agency would —
              except the team has names you know. Steve Jobs reviews your
              design. Marty Cagan runs discovery. Margaret Hamilton signs off
              on QA. Maya Angelou writes your welcome email. Three tiers,
              fixed prices, four-week timelines.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/intake"
                className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white transition hover:bg-accent-dim"
              >
                Start a Project
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-border px-8 py-3.5 text-base font-semibold transition hover:border-muted hover:bg-surface"
              >
                See Pricing
              </Link>
            </div>
            <p className="mt-6 max-w-xl text-sm text-muted">
              Starter $4,995 · Standard $14,995 · Complex $29,995. The first
              five customers get 50% off in exchange for a case study.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-2xl border border-border shadow-2xl shadow-accent/5">
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/tibnEd80D5g"
                  title="Shipyard AI — PRD to Production"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { label: "Named Personas", value: "14" },
    { label: "Pipeline Stages", value: "7" },
    { label: "Productized Tiers", value: "3" },
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

function PricingSection() {
  const tiers = [
    {
      name: "Starter",
      price: "$4,995",
      duration: "2 weeks",
      pages: "Up to 5 pages",
      description: "A clean, deployed site with the essentials.",
      includes: ["Design + content", "Mobile-responsive", "Emdash deploy"],
    },
    {
      name: "Standard",
      price: "$14,995",
      duration: "4 weeks",
      pages: "Up to 10 pages",
      description: "Everything in Starter plus integrations and SEO.",
      includes: ["Stripe / Resend / etc.", "SEO optimization", "Analytics setup"],
      featured: true,
    },
    {
      name: "Complex",
      price: "$29,995",
      duration: "6 weeks",
      pages: "20+ pages",
      description: "Custom-plugin work and deeper integrations.",
      includes: ["Custom Emdash plugins", "Advanced integrations", "Performance tuning"],
    },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Three productized tiers.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Fixed scope, fixed price, fixed timeline. No surprise invoices and
          no &ldquo;just one more thing.&rdquo; The beta-discount price applies
          to the first five customers.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-xl border p-8 transition ${
                t.featured
                  ? "border-accent bg-accent/5"
                  : "border-border bg-surface hover:border-muted"
              }`}
            >
              {t.featured && (
                <div className="mb-3 inline-flex rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                  Most common
                </div>
              )}
              <h3 className="text-xl font-semibold">{t.name}</h3>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold">{t.price}</span>
                <span className="text-sm text-muted">/ {t.duration}</span>
              </div>
              <div className="mt-1 text-sm text-muted">{t.pages}</div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t.description}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {t.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-muted">
                    <span className="mt-1 text-accent">+</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-accent-dim"
          >
            See full pricing details, beta-program terms, and timeline
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ConstellationSection() {
  const personas = [
    {
      name: "Steve Jobs",
      role: "Creative Director",
      lens: "Is this insanely great?",
      phase: "Debate, Creative Review",
    },
    {
      name: "Marty Cagan",
      role: "Product Discovery",
      lens: "Which of the four risks did we test?",
      phase: "Discovery",
    },
    {
      name: "Margaret Hamilton",
      role: "QA Director",
      lens: "Would this survive a 3 AM production incident?",
      phase: "QA",
    },
    {
      name: "Jony Ive",
      role: "Visual Design",
      lens: "Less, but better.",
      phase: "Creative Review",
    },
    {
      name: "Maya Angelou",
      role: "Copy & Voice",
      lens: "Words that land. Copy that connects.",
      phase: "Welcome email, microcopy",
    },
    {
      name: "Phil Jackson",
      role: "Orchestrator",
      lens: "Find the open player. Trust the system.",
      phase: "Every phase",
    },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          The team has names you know.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Most &ldquo;AI agency&rdquo; pitches are shapeless. Ours is not.
          Every artifact you receive is stamped with the persona that worked
          on it. Six of the fourteen are below; you&apos;ll see the rest as
          your project moves through the pipeline.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {personas.map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-border bg-surface p-6 transition hover:border-muted"
            >
              <div className="font-mono text-xs text-accent">{p.phase}</div>
              <h3 className="mt-2 text-lg font-semibold">{p.name}</h3>
              <div className="text-sm text-muted">{p.role}</div>
              <p className="mt-3 text-sm italic leading-relaxed text-muted">
                &ldquo;{p.lens}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineSection() {
  const stages = [
    { step: "01", name: "PRD", desc: "You describe the project." },
    { step: "02", name: "Debate", desc: "Steve and Elon stake positions." },
    { step: "03", name: "Plan", desc: "Sub-agents hired, tasks assigned." },
    { step: "04", name: "Build", desc: "Parallel execution, clean commits." },
    { step: "05", name: "QA", desc: "Margaret blocks ship on P0s." },
    { step: "06", name: "Review", desc: "Creative + board verdict." },
    { step: "07", name: "Ship", desc: "Live on Emdash, you sign off." },
  ];
  return (
    <section className="border-b border-border py-24">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Seven stages from PRD to live.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          You see the artifacts at every stage. Persona names on every
          handoff. No black box.
        </p>
        <div className="mt-12 grid gap-0 sm:grid-cols-7">
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
          Ready to start?
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Fill out the intake form. We respond within 48 hours with next
          steps. Beta-discount price applies to the first five customers.
        </p>
        <Link
          href="/intake"
          className="mt-8 inline-flex rounded-full bg-accent px-10 py-4 text-base font-semibold text-white transition hover:bg-accent-dim"
        >
          Start your project
        </Link>
        <p className="mx-auto mt-4 max-w-md text-xs text-muted">
          Or{" "}
          <Link href="/pricing" className="text-accent underline hover:text-accent-dim">
            see full pricing details
          </Link>
          {" "}first.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <PricingSection />
      <ConstellationSection />
      <PipelineSection />
      <CTASection />
    </>
  );
}
