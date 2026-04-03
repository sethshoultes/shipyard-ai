import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Shipyard AI",
  description: "Meet the autonomous agent team that builds your Emdash products.",
};

const agents = [
  {
    name: "Phil Jackson",
    role: "Orchestrator",
    desc: "Dispatches tasks, balances workloads, keeps the pipeline flowing. Triangle offense.",
    icon: "&#9670;",
  },
  {
    name: "Steve Jobs",
    role: "Creative Director",
    desc: "Design, brand, UX, messaging. If it's not insanely great, it doesn't ship.",
    icon: "&#9733;",
  },
  {
    name: "Elon Musk",
    role: "Engineering Director",
    desc: "Architecture, performance, deployment. First principles. Can it scale 10x?",
    icon: "&#9889;",
  },
  {
    name: "Margaret Hamilton",
    role: "QA Director",
    desc: "Continuous testing, accessibility, security. Blocks ship on P0 issues.",
    icon: "&#9745;",
  },
  {
    name: "Jensen Huang",
    role: "Advisor",
    desc: "Strategic reviews, architecture guidance. Thinks in systems and throughput.",
    icon: "&#9632;",
  },
  {
    name: "Jony Ive",
    role: "Visual Design",
    desc: "UI components, design tokens, visual craft. Reports to Steve.",
    icon: "&#9675;",
  },
  {
    name: "Maya Angelou",
    role: "Copywriter",
    desc: "Messaging, microcopy, content strategy. Words that matter.",
    icon: "&#9998;",
  },
];

const values = [
  { name: "Ship or Die", desc: "Every PRD has a finish line. We hit it." },
  { name: "Quality is Non-Negotiable", desc: "Fast doesn't mean sloppy. QA runs on every PR." },
  { name: "First Principles Over Frameworks", desc: "Understand the problem before reaching for solutions." },
  { name: "Tokens are Money", desc: "Every AI call is a credit the client paid for. No waste." },
  { name: "The Pipeline is the Product", desc: "Our advantage is the system, not any single output." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">About Shipyard AI</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        We&apos;re an autonomous AI agency. Seven agents with distinct roles,
        strong opinions, and a shared mission: turn your PRD into a deployed
        product as fast as physics allows.
      </p>

      <h2 className="mt-20 text-2xl font-bold tracking-tight">The Crew</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((a) => (
          <div
            key={a.name}
            className="rounded-xl border border-border bg-surface p-6 transition hover:border-muted"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-background text-accent"
                dangerouslySetInnerHTML={{ __html: a.icon }}
              />
              <div>
                <div className="font-semibold">{a.name}</div>
                <div className="text-xs text-accent">{a.role}</div>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">{a.desc}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-20 text-2xl font-bold tracking-tight">Values</h2>
      <div className="mt-8 space-y-4">
        {values.map((v, i) => (
          <div key={v.name} className="flex gap-4 rounded-xl border border-border bg-surface p-6">
            <div className="font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <div className="font-semibold">{v.name}</div>
              <div className="mt-1 text-sm text-muted">{v.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
