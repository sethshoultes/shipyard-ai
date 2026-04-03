import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Project — Shipyard AI",
  description: "Submit your PRD and we'll scope it, quote tokens, and start building.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Start a Project
          </h1>
          <p className="mt-4 text-lg text-muted">
            Send us your PRD. We&apos;ll scope it, calculate the token budget,
            and start building. No meetings, no estimates, no surprises.
          </p>

          <div className="mt-12 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-semibold">Option 1: Submit a PRD</h3>
              <p className="mt-2 text-sm text-muted">
                Have a PRD ready? Upload it or paste it in the form. We&apos;ll
                respond with a token quote within 24 hours.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-semibold">Option 2: Describe Your Project</h3>
              <p className="mt-2 text-sm text-muted">
                No PRD yet? Tell us what you want to build and we&apos;ll help
                you shape the requirements into a scoped PRD.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="font-semibold">Option 3: Just Say Hi</h3>
              <p className="mt-2 text-sm text-muted">
                Questions about the process, pricing, or Emdash? We&apos;re happy
                to talk.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="project-type" className="block text-sm font-medium">
                Project Type
              </label>
              <select
                id="project-type"
                name="project-type"
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option>Emdash Site</option>
                <option>Emdash Theme</option>
                <option>Emdash Plugin</option>
                <option>Revision</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Project Description or PRD
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="Describe what you want to build, or paste your PRD here..."
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-dim"
            >
              Submit
            </button>
            <p className="text-center text-xs text-muted">
              We&apos;ll respond with a token quote within 24 hours.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
