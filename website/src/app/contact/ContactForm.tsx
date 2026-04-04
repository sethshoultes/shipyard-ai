"use client";

import { useState, useRef, type FormEvent } from "react";

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

const ALLOWED_FILE_TYPES = [".md", ".txt"];
const MAX_FILE_SIZE = 512_000; // 500KB

export function ContactForm() {
  const [state, setState] = useState<{ success: boolean; message: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName(null);
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      setState({ success: false, message: "Only .md and .txt files are accepted." });
      e.target.value = "";
      setFileName(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setState({ success: false, message: "File must be under 500KB." });
      e.target.value = "";
      setFileName(null);
      return;
    }
    setFileName(file.name);
    setState(null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
    const rawDescription = (data.get("description") as string)?.trim();
    const description = stripHtml(rawDescription);
    const projectType = data.get("project-type") as string;
    const budget = (data.get("budget") as string) || "";

    if (!name || !email || !description) {
      setState({ success: false, message: "Please fill in all required fields." });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState({ success: false, message: "Please enter a valid email address." });
      return;
    }

    setPending(true);

    try {
      const res = await fetch("https://shipyard-contact.seth-a02.workers.dev/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, projectType, budget, description }),
      });
      const result = await res.json();
      setState({ success: result.success, message: result.message });
      if (result.success) {
        form.reset();
        setFileName(null);
      }
    } catch {
      setState({ success: false, message: "Network error. Please email us directly at hello@shipyard.company." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Honeypot field — hidden from humans, catches bots */}
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
            <option value="">Select a range</option>
            <option>Under $1K</option>
            <option>$1K–$2.5K</option>
            <option>$2.5K–$5K</option>
            <option>$5K–$10K</option>
            <option>$10K+</option>
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium">
            Project Description or PRD (Markdown supported) <span className="text-accent">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            required
            className="mt-2 block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="Describe what you want to build, or paste your PRD in markdown..."
          />
          <p className="mt-1.5 text-xs text-muted">
            Paste your PRD in markdown format, or describe your project in plain text.
          </p>
        </div>
        <div>
          <label htmlFor="prd-file" className="block text-sm font-medium">
            Or upload a PRD file (.md or .txt)
          </label>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
            >
              {fileName ? "Change file" : "Choose file"}
            </button>
            <span className="truncate text-sm text-muted">
              {fileName ?? "No file selected"}
            </span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            id="prd-file"
            name="prd-file"
            accept=".md,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="mt-1.5 text-xs text-muted">
            Attach your PRD document (optional). Max 500KB.
          </p>
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
          className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-white transition hover:bg-accent-dim disabled:opacity-50"
        >
          {pending ? "Submitting..." : "Submit"}
        </button>
        <p className="text-center text-xs text-muted">
          We&apos;ll respond with a token quote within 24 hours.
        </p>
      </form>
    </div>
  );
}
