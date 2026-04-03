import type { Metadata } from "next";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Start a Project — Shipyard AI",
  description:
    "Submit your PRD or describe your project. We'll scope it, quote a fixed token budget, and start building within 24 hours. No meetings required.",
  openGraph: {
    title: "Start a Project — Shipyard AI",
    description:
      "Submit your PRD and we'll build your Emdash site, theme, or plugin. Fixed pricing, no surprises.",
    url: "https://shipyard.company/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Start a Project — Shipyard AI",
    description:
      "Submit your PRD and we'll build your Emdash site, theme, or plugin. Fixed pricing, no surprises.",
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            mainEntity: {
              "@type": "Organization",
              name: "Shipyard AI",
              url: "https://shipyard.company",
              email: "hello@shipyard.company",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "sales",
                email: "hello@shipyard.company",
                availableLanguage: "English",
              },
            },
          }),
        }}
      />

      <div className="grid gap-16 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Start a Project
          </h1>
          <p className="mt-4 text-lg text-muted">
            Send us your PRD or describe what you need. We&apos;ll scope it,
            quote a fixed price, and start building. No meetings, no estimates
            that turn into invoices, no surprises.
          </p>

          <div className="mt-12 space-y-6">
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background font-mono text-xs text-accent">01</span>
                <h2 className="font-semibold">Submit a PRD</h2>
              </div>
              <p className="mt-3 text-sm text-muted">
                Have a PRD ready? Paste it in the form or email it directly.
                We&apos;ll respond with a token quote and timeline within 24 hours.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background font-mono text-xs text-accent">02</span>
                <h2 className="font-semibold">Describe Your Project</h2>
              </div>
              <p className="mt-3 text-sm text-muted">
                No PRD yet? Tell us what you want to build — pages, features,
                integrations — and we&apos;ll help you shape the requirements
                and pick the right package.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background font-mono text-xs text-accent">03</span>
                <h2 className="font-semibold">WordPress Migration</h2>
              </div>
              <p className="mt-3 text-sm text-muted">
                Moving from WordPress to Emdash? Share your current site URL
                and we&apos;ll audit it, map the content, and quote the
                migration.
              </p>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Prefer email?</h2>
            <p className="mt-2 text-sm text-muted">
              Send your PRD directly to{" "}
              <a
                href="mailto:hello@shipyard.company"
                className="text-accent transition hover:text-accent-dim"
              >
                hello@shipyard.company
              </a>
            </p>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
