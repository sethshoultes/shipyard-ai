"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [state, setState] = useState<{ success: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const honeypot = data.get("website") as string;
    if (honeypot) {
      setState({ success: true, message: "Thanks! We'll be in touch within 24 hours." });
      return;
    }

    const name = (data.get("name") as string)?.trim();
    const email = (data.get("email") as string)?.trim();
    const description = (data.get("description") as string)?.trim();
    const projectType = data.get("project-type") as string;
    const budget = data.get("budget") as string;

    if (!name || !email || !description) {
      setState({ success: false, message: "Please fill in all required fields." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ success: false, message: "Please enter a valid email address." });
      return;
    }

    setPending(true);

    const subject = encodeURIComponent(`PRD Submission: ${projectType} from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nProject Type: ${projectType}\nBudget Range: ${budget}\n\nDescription:\n${description}`
    );
    window.location.href = `mailto:hello@shipyard.company?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setPending(false);
      setState({ success: true, message: "Thanks! Your email client should have opened. We'll scope your project and respond within 24 hours." });
      form.reset();
    }, 1000);
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <h2 className="text-xl font-bold">Project Details</h2>
      <p className="mt-2 text-sm text-muted">
        Fill in what you know. We&apos;ll figure out the rest.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {/* Honeypot field */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
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
            <option>WordPress Migration</option>
            <option>Revision</option>
            <option>Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="budget" className="block text-sm font-medium">
            Budget Range
          </label>
          <select
            id="budget"
            name="budget"
            className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option>Under $2,500</option>
            <option>$2,500 – $5,000</option>
            <option>$5,000 – $10,000</option>
            <option>$10,000+</option>
            <option>Not sure yet</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Project Description or PRD <span className="text-accent">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            required
            className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Describe what you want to build, or paste your PRD here..."
          />
        </div>

        {state && (
          <div
            role="alert"
            className={`rounded-lg p-4 text-sm ${
              state.success
                ? "bg-green-900/20 text-green-400"
                : "bg-red-900/20 text-red-400"
            }`}
          >
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-black transition hover:bg-accent-dim disabled:opacity-50"
        >
          {pending ? "Submitting..." : "Submit Project"}
        </button>
        <p className="text-center text-xs text-muted">
          We&apos;ll respond with a scope and token quote within 24 hours.
        </p>
      </form>
    </div>
  );
}
