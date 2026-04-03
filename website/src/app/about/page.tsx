import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Shipyard AI | The Autonomous Emdash Agency",
  description:
    "Meet the 7 AI agents that build your Emdash products. Learn why we chose Emdash, how our pipeline works, and the principles that drive every project.",
  openGraph: {
    title: "About — Shipyard AI",
    description:
      "The first autonomous AI agency built for the Emdash ecosystem. 7 AI agents that debate, build, test, and ship.",
    url: "https://shipyard.company/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Shipyard AI",
    description:
      "The first autonomous AI agency built for the Emdash ecosystem. 7 AI agents that debate, build, test, and ship.",
  },
};

const directors = [
  {
    name: "Phil Jackson",
    role: "Orchestrator",
    desc: "Dispatches tasks, balances workloads, keeps the pipeline flowing. Reads every PRD first. Runs on a 30-minute cron cycle to advance work and unblock agents.",
    icon: "\u25C6",
    model: "Sonnet",
  },
  {
    name: "Steve Jobs",
    role: "Creative Director",
    desc: "Owns design, brand, UX, and messaging. Reviews every pixel for taste and craft. If it's not insanely great, it doesn't ship. Hires and directs Jony Ive and Maya Angelou.",
    icon: "\u2605",
    model: "Sonnet",
  },
  {
    name: "Elon Musk",
    role: "Engineering Director",
    desc: "Owns architecture, performance, and deployment. First-principles thinker — strips away unnecessary complexity. Challenges every technical decision. Can it scale 10x?",
    icon: "\u26A1",
    model: "Sonnet",
  },
  {
    name: "Margaret Hamilton",
    role: "QA Director",
    desc: "Named after the Apollo 11 flight software engineer. Runs continuous testing — accessibility, security, performance. P0 issues block ship. No exceptions, no negotiation.",
    icon: "\u2611",
    model: "Sonnet",
  },
  {
    name: "Jensen Huang",
    role: "Strategic Advisor",
    desc: "Runs on an hourly cron. Reviews the entire project state for blind spots, scope creep, and strategic misalignment. Files issues that nobody else is thinking about.",
    icon: "\u25A0",
    model: "Sonnet",
  },
];

const subAgents = [
  {
    name: "Jony Ive",
    role: "Visual Design",
    desc: "UI components, design tokens, visual hierarchy. Reports to Steve.",
    icon: "\u25CB",
    model: "Haiku",
  },
  {
    name: "Maya Angelou",
    role: "Copywriter",
    desc: "Messaging, microcopy, content strategy. Words that earn trust.",
    icon: "\u270E",
    model: "Haiku",
  },
];

const values = [
  {
    name: "Ship or Die",
    desc: "Every PRD has a finish line and a token budget. We hit both. Shipping beats perfection.",
  },
  {
    name: "Quality is Non-Negotiable",
    desc: "Fast doesn't mean sloppy. Margaret runs QA on every PR. P0 issues block deployment, always.",
  },
  {
    name: "First Principles Over Frameworks",
    desc: "We understand the problem before reaching for a solution. No cargo-culting, no best-practice theater.",
  },
  {
    name: "Tokens are Money",
    desc: "Every AI call is a credit the client paid for. We track burn rates in real-time and optimize relentlessly.",
  },
  {
    name: "The Pipeline is the Product",
    desc: "Our competitive advantage isn't any single output — it's the system that produces them. Six stages, every time.",
  },
];

const whyEmdash = [
  {
    title: "Modern Architecture",
    desc: "Built on Astro with edge-first deployment. No legacy PHP, no plugin security nightmares, no database overhead.",
  },
  {
    title: "Developer Experience",
    desc: "Component-based content modeling with Portable Text. AI agents can reason about the content structure, not fight with shortcodes.",
  },
  {
    title: "Performance by Default",
    desc: "Static generation, partial hydration, edge caching. Sites load fast without performance plugins or CDN configuration.",
  },
  {
    title: "Content Portability",
    desc: "Portable Text is a structured, open format. Your content isn't locked into a proprietary database — it's yours.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            mainEntity: {
              "@type": "Organization",
              name: "Shipyard AI",
              url: "https://shipyard.company",
              description:
                "Autonomous AI agency specializing in Emdash sites, themes, and plugins.",
              foundingDate: "2026",
              numberOfEmployees: {
                "@type": "QuantitativeValue",
                value: 7,
                unitText: "AI agents",
              },
            },
          }),
        }}
      />

      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        About Shipyard AI
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        We&apos;re an autonomous AI agency — seven agents with distinct roles,
        strong opinions, and a shared mission: turn your PRD into a deployed
        Emdash product as fast as physics allows.
      </p>

      {/* Why Emdash */}
      <h2 className="mt-20 text-2xl font-bold tracking-tight">Why Emdash</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        We built Shipyard specifically for the Emdash ecosystem. Not WordPress.
        Not Webflow. Not Squarespace. Here&apos;s why.
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {whyEmdash.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Agent Team - Directors */}
      <h2 className="mt-20 text-2xl font-bold tracking-tight">The Crew</h2>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Five directors run on Sonnet-class models for deep reasoning. Two
        sub-agents run on Haiku for cost-efficient execution. Every agent has a
        persona that shapes how they evaluate work.
      </p>

      <h3 className="mt-10 text-lg font-semibold text-muted">Directors</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {directors.map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-border bg-surface p-6 transition hover:border-muted"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-accent"
                aria-hidden="true"
              >
                {a.icon}
              </span>
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-accent">{a.role}</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{a.desc}</p>
            <div className="mt-3 inline-flex rounded-full bg-background px-2.5 py-0.5 font-mono text-xs text-muted">
              {a.model}
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-10 text-lg font-semibold text-muted">Sub-Agents</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {subAgents.map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-border bg-surface p-6 transition hover:border-muted"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-accent"
                aria-hidden="true"
              >
                {a.icon}
              </span>
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-accent">{a.role}</div>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{a.desc}</p>
            <div className="mt-3 inline-flex rounded-full bg-background px-2.5 py-0.5 font-mono text-xs text-muted">
              {a.model} · ~5x cheaper
            </div>
          </div>
        ))}
      </div>

      {/* How we work */}
      <div className="mt-20 rounded-xl border border-border bg-surface p-10">
        <h2 className="text-2xl font-bold tracking-tight">How We&apos;re Different</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div>
            <div className="text-3xl font-bold text-accent">24/7</div>
            <div className="mt-2 font-semibold">Always On</div>
            <p className="mt-1 text-sm text-muted">
              Agents work around the clock. No time zones, no holidays, no
              context-switching between clients.
            </p>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">2-round</div>
            <div className="mt-2 font-semibold">Debate System</div>
            <p className="mt-1 text-sm text-muted">
              Two directors with opposing priorities debate every strategic
              decision. Better outcomes than consensus.
            </p>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">100%</div>
            <div className="mt-2 font-semibold">QA Coverage</div>
            <p className="mt-1 text-sm text-muted">
              Margaret reviews every PR. Accessibility, security, and
              performance checks run on every build.
            </p>
          </div>
        </div>
      </div>

      {/* Values */}
      <h2 className="mt-20 text-2xl font-bold tracking-tight">
        Operating Principles
      </h2>
      <div className="mt-8 space-y-4">
        {values.map((v, i) => (
          <div
            key={v.name}
            className="flex gap-4 rounded-xl border border-border bg-surface p-6"
          >
            <div className="font-mono text-sm text-accent">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="font-semibold">{v.name}</div>
              <div className="mt-1 text-sm leading-relaxed text-muted">{v.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-20 text-center">
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-accent px-10 py-4 text-base font-semibold text-black transition hover:bg-accent-dim"
        >
          Work With Us
        </Link>
      </div>
    </div>
  );
}
