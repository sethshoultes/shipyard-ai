"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * /intake — Paid-customer intake form for Shipyard AI.
 *
 * v0 implementation, per DHH's spec at website/intake/INTAKE-FORM.md.
 * Single-page form, no wizard, no save-resume. One submit.
 *
 * Submission posts to /api/intake which writes a markdown file to
 * prds/intake/<slug>.md and emails the operator. Manual Stripe link
 * follows; no webhook in v0.
 */

type Tier = "starter" | "standard" | "complex" | "custom";

export default function IntakePage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier>("standard");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Multi-value: e.g. checkbox groups
        const existing = data[key];
        data[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
      } else {
        data[key] = value;
      }
    }

    try {
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error(`Submission failed (${res.status}). Please email seth@caseproof.com.`);
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <section className="border-b border-border">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-mono text-xs text-accent">INTAKE RECEIVED</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight">Thank you.</h1>
          <p className="mt-6 text-lg text-muted">
            Your intake is in. We respond within 48 hours with next steps —
            usually a quick email to confirm scope, a Stripe link for the
            deposit, and the v0 Terms of Service for your review.
          </p>
          <p className="mt-4 text-sm text-muted">
            If you don't hear back in 48 hours, email{" "}
            <a href="mailto:seth@caseproof.com" className="text-accent hover:text-accent-dim">
              seth@caseproof.com
            </a>
            . We are a small operation and we want every email read.
          </p>
          <div className="mt-12">
            <Link href="/" className="text-sm text-muted hover:text-foreground transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs text-accent">START YOUR PROJECT</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Tell us what you want to build.
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              A single form. One page. We respond within 48 hours with next
              steps. Required fields are marked with an asterisk; everything
              else is optional and helpful.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-16">
          <form onSubmit={handleSubmit} className="space-y-12">
            {/* Section 1 — About you */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">About you</legend>
              <Field label="Your name *" name="name" required />
              <Field label="Email *" name="email" type="email" required />
              <Field label="Business or project name" name="business_name" />
              <Field label="Your role" name="role" placeholder="Founder / Marketing lead / etc." />
              <Field
                label="How did you hear about us?"
                name="referral_source"
                placeholder="MemberPress, a friend, a search, ..."
              />
            </fieldset>

            {/* Section 2 — Tier */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Tier *</legend>
              <p className="text-sm text-muted">
                Pick the closest match. We'll confirm scope before any payment.
                Beta-discount price applies to the first five customers.
              </p>
              {(
                [
                  { value: "starter", label: "Starter — $4,995 — 5 pages, 2 weeks" },
                  { value: "standard", label: "Standard — $14,995 — 10 pages, 4 weeks" },
                  { value: "complex", label: "Complex — $29,995 — 20+ pages, 6 weeks" },
                  { value: "custom", label: "Custom — let's talk first" },
                ] as { value: Tier; label: string }[]
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 hover:border-muted"
                >
                  <input
                    type="radio"
                    name="tier"
                    value={opt.value}
                    checked={tier === opt.value}
                    onChange={() => setTier(opt.value)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </fieldset>

            {/* Section 3 — Beta */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Beta program</legend>
              <p className="text-sm text-muted">
                The first five customers get 50% off in exchange for: a published
                case study, a 30-min post-launch feedback call, and permission to
                use your site as a public reference. Optional. You can decline and
                pay full price.
              </p>
              <Checkbox
                name="beta"
                value="yes"
                label="Yes, I'd like the beta-discount terms (50% off, case study, feedback call)."
              />
            </fieldset>

            {/* Section 4 — Project basics */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Project basics</legend>
              <Field label="Project name (working title)" name="project_name" />
              <Field
                label="Target domain"
                name="target_domain"
                placeholder="example.com — or leave blank if you need help picking"
              />
              <Field
                label="Launch deadline (if any)"
                name="deadline"
                type="date"
              />
            </fieldset>

            {/* Section 5 — Business context */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Business context *</legend>
              <Textarea
                label="What does this business do?"
                name="business_what"
                required
                rows={3}
              />
              <Textarea
                label="Who is the target audience?"
                name="business_audience"
                required
                rows={2}
              />
              <Textarea
                label="What's the primary goal of the site?"
                name="business_goal"
                required
                rows={2}
                placeholder="Sign-ups, sales, leads, brand presence, etc."
              />
            </fieldset>

            {/* Section 6 — Pages and features */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Pages and features</legend>
              <Textarea
                label="List the pages or features you need"
                name="pages_and_features"
                rows={6}
                placeholder={`Home — hero, value prop, social proof
About — story, team
Services — three tiers
Contact — form
Blog — index + posts (Must-have / Nice-to-have)`}
              />
            </fieldset>

            {/* Section 7 — Design */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Design direction</legend>
              <Field
                label="Brand colors (hex if available)"
                name="brand_colors"
                placeholder="#1a73e8, #ffffff, #0a0a0a"
              />
              <Field
                label="Typography preferences"
                name="typography"
                placeholder="Modern sans-serif / classic serif / no preference"
              />
              <Textarea
                label="Reference sites (URLs of sites you like)"
                name="reference_sites"
                rows={3}
              />
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Brand assets</span>
                <Checkbox
                  name="brand_assets"
                  value="have_logos"
                  label="I have logos and brand assets to share"
                />
                <Checkbox
                  name="brand_assets"
                  value="generate"
                  label="Please generate brand assets for me"
                />
              </div>
            </fieldset>

            {/* Section 8 — Content */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Content</legend>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Who provides the copy?</span>
                <Radio name="copy_source" value="client" label="I will provide all copy" />
                <Radio
                  name="copy_source"
                  value="ai"
                  label="Please generate copy from the business info"
                />
                <Radio name="copy_source" value="hybrid" label="Hybrid — I have some, generate the rest" />
              </div>
              <div className="flex flex-col gap-2 text-sm">
                <span className="text-muted">Photos / images</span>
                <Radio name="photos_source" value="client" label="I will provide" />
                <Radio name="photos_source" value="stock" label="Use stock" />
                <Radio name="photos_source" value="ai" label="AI-generated" />
              </div>
              <Field
                label="Number of blog posts (if applicable)"
                name="blog_post_count"
                type="number"
              />
            </fieldset>

            {/* Section 9 — Integrations */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Integrations</legend>
              <p className="text-sm text-muted">
                Check any third-party services you need integrated. Third-party
                accounts and fees are paid by you, not Shipyard.
              </p>
              {[
                { value: "stripe", label: "Stripe (payments)" },
                { value: "resend", label: "Resend (email)" },
                { value: "memberpress", label: "MemberPress" },
                { value: "analytics", label: "Analytics (Plausible, GA4, etc.)" },
                { value: "newsletter", label: "Newsletter (Buttondown, Mailchimp, etc.)" },
              ].map((i) => (
                <Checkbox key={i.value} name="integrations" value={i.value} label={i.label} />
              ))}
              <Field
                label="Other integrations (free text)"
                name="integrations_other"
              />
            </fieldset>

            {/* Section 10 — Notes */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Anything else?</legend>
              <Textarea
                label="Notes, context, questions for us"
                name="notes"
                rows={4}
              />
            </fieldset>

            {/* Section 11 — Payment readiness */}
            <fieldset className="space-y-4">
              <legend className="text-xl font-bold tracking-tight">Payment readiness *</legend>
              <Checkbox
                name="ack_deposit"
                value="yes"
                label="I understand a 50% deposit is required to start. *"
                required
              />
              <Checkbox
                name="ack_terms"
                value="yes"
                label={
                  <>
                    I have read and accept the{" "}
                    <Link href="/terms" target="_blank" className="text-accent underline hover:text-accent-dim">
                      v0 Terms of Service
                    </Link>{" "}
                    (subject to attorney review before final signature). *
                  </>
                }
                required
              />
            </fieldset>

            {/* Submit */}
            {error && (
              <div className="rounded-md border border-red-500/40 bg-red-500/5 p-4 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-accent px-8 py-3.5 text-base font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Send my intake"}
            </button>
            <p className="text-xs text-muted">
              We respond within 48 hours. No automated emails; a real human
              reads every submission.
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

// ---------- Reusable form primitives ----------

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-border bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}

function Textarea({
  label,
  name,
  rows = 3,
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-muted">{label}</span>
      <textarea
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-border bg-surface px-3 py-2 text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
    </label>
  );
}

function Checkbox({
  name,
  value,
  label,
  required = false,
}: {
  name: string;
  value: string;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        value={value}
        required={required}
        className="mt-1 accent-[var(--accent)]"
      />
      <span>{label}</span>
    </label>
  );
}

function Radio({
  name,
  value,
  label,
}: {
  name: string;
  value: string;
  label: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="radio" name={name} value={value} className="accent-[var(--accent)]" />
      <span>{label}</span>
    </label>
  );
}
