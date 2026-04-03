import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Submit a PRD — Shipyard AI",
  description: "Submit your PRD and we'll scope it, quote tokens, and start building.",
  openGraph: {
    title: "Submit a PRD — Shipyard AI",
    description: "Submit your PRD and we'll build your Emdash site, theme, or plugin.",
    url: "https://shipyard.company/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit a PRD — Shipyard AI",
    description: "Submit your PRD and we'll build your Emdash site, theme, or plugin.",
  },
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
              <h2 className="font-semibold">Option 1: Submit a PRD</h2>
              <p className="mt-2 text-sm text-muted">
                Have a PRD ready? Paste it in the form. We&apos;ll respond with
                a token quote within 24 hours.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="font-semibold">Option 2: Describe Your Project</h2>
              <p className="mt-2 text-sm text-muted">
                No PRD yet? Tell us what you want to build and we&apos;ll help
                you shape the requirements.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h2 className="font-semibold">Option 3: Just Say Hi</h2>
              <p className="mt-2 text-sm text-muted">
                Questions about the process, pricing, or Emdash? We&apos;re happy
                to talk.
              </p>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
