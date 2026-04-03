import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pipeline — Shipyard AI",
  description: "Six stages from PRD to production. See exactly how your project gets built.",
};

const stages = [
  {
    step: "01",
    name: "Intake",
    budget: "Token budget assigned",
    details: [
      "PRD arrives via form or direct submission",
      "Phil Jackson (Orchestrator) reads and scopes the project",
      "Token budget calculated based on complexity tier",
      "Project workspace created, tasks generated in TASKS.md",
    ],
  },
  {
    step: "02",
    name: "Debate",
    budget: "Max 10% of token budget",
    details: [
      "Steve Jobs stakes design/brand position",
      "Elon Musk stakes engineering/feasibility position",
      "2 rounds maximum — disagreement is productive, not wasteful",
      "Phil logs locked decisions. No revisiting settled questions.",
    ],
  },
  {
    step: "03",
    name: "Plan",
    budget: "Included in debate budget",
    details: [
      "Directors define sub-agent teams and assignments",
      "Each agent gets: inputs, outputs, token allocation, quality bar",
      "Parallel tasks identified for maximum throughput",
      "Build plan committed to project workspace",
    ],
  },
  {
    step: "04",
    name: "Build",
    budget: "60% of token budget",
    details: [
      "Sub-agents execute in parallel on feature branches",
      "Directors monitor for drift and intervene when needed",
      "Token burn tracked in real-time against budget",
      "All code goes through PRs — no direct pushes to main",
    ],
  },
  {
    step: "05",
    name: "Review",
    budget: "20% of token budget",
    details: [
      "Margaret Hamilton runs automated QA pipeline",
      "Build verification, accessibility audit, security scan",
      "P0 = block ship. P1 = fix before deploy. P2 = backlog.",
      "Revisions loop back to Build (costs revision tokens)",
    ],
  },
  {
    step: "06",
    name: "Deploy",
    budget: "Included in review budget",
    details: [
      "Push to Emdash staging environment",
      "Smoke test on staging — verify all pages render",
      "Promote to production",
      "Git tag the release. Client notified. Done.",
    ],
  },
];

export default function PipelinePage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">The Pipeline</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        Six stages from PRD to production. Every stage has a token budget. Every
        agent has a role. Nothing is hand-wavy.
      </p>

      <div className="relative mt-16 space-y-0">
        {stages.map((s, i) => (
          <div key={s.step} className="relative border-l-2 border-border pb-12 pl-10 last:pb-0">
            <div className="absolute -left-3.5 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-border bg-background font-mono text-xs text-accent">
              {s.step}
            </div>
            <div className="flex flex-wrap items-baseline gap-4">
              <h3 className="text-2xl font-bold">{s.name}</h3>
              <span className="rounded-full bg-surface px-3 py-1 font-mono text-xs text-accent">
                {s.budget}
              </span>
            </div>
            <ul className="mt-4 space-y-2">
              {s.details.map((d, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-muted">
                  <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                  {d}
                </li>
              ))}
            </ul>
            {i < stages.length - 1 && (
              <div className="absolute -left-[1px] bottom-0 h-4 w-0.5 bg-border" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-xl border border-border bg-surface p-10 text-center">
        <h2 className="text-2xl font-bold">Token Budget Breakdown</h2>
        <div className="mx-auto mt-8 grid max-w-lg grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-3xl font-bold text-accent">10%</div>
            <div className="mt-1 text-sm text-muted">Strategy</div>
            <div className="text-xs text-muted">(Debate + Plan)</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">60%</div>
            <div className="mt-1 text-sm text-muted">Build</div>
            <div className="text-xs text-muted">(Parallel agents)</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-accent">20%</div>
            <div className="mt-1 text-sm text-muted">QA + Deploy</div>
            <div className="text-xs text-muted">(Non-negotiable)</div>
          </div>
        </div>
        <p className="mx-auto mt-6 max-w-sm text-sm text-muted">
          Plus a 10% reserve for unexpected rework. Unused reserve is returned.
        </p>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/contact"
          className="inline-flex rounded-full bg-accent px-10 py-4 text-base font-semibold text-black transition hover:bg-accent-dim"
        >
          Submit Your PRD
        </Link>
      </div>
    </div>
  );
}
