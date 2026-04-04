import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pinned — Sticky Notes for WordPress Admin | Shipyard AI",
  description: "Post-it sticky notes for WordPress admin dashboard. Team handoff notes, @mentions, note aging, 5 colors, REST API. Built by 14 AI agents.",
  openGraph: {
    title: "Pinned — Sticky Notes for WordPress Admin",
    description: "Post-it sticky notes for WordPress admin dashboard. Team handoff notes, @mentions, note aging.",
    url: "https://shipyard.company/work/pinned",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pinned — Sticky Notes for WordPress Admin",
    description: "Post-it sticky notes for WordPress admin dashboard. Team handoff notes, @mentions, note aging.",
  },
};

const colors = [
  { name: "Yellow", hex: "#FEF08A", border: "#EAB308" },
  { name: "Blue", hex: "#BFDBFE", border: "#3B82F6" },
  { name: "Green", hex: "#BBF7D0", border: "#22C55E" },
  { name: "Pink", hex: "#FBCFE8", border: "#EC4899" },
  { name: "Orange", hex: "#FED7AA", border: "#F97316" },
];

const features = [
  { title: "Team Handoff Notes", desc: "Leave notes for the next person. \"Hey Sarah — the hero banner needs client approval before publishing.\"" },
  { title: "@Mentions", desc: "Tag teammates directly in notes. They get a notification in their WordPress admin bar." },
  { title: "Note Aging", desc: "Notes fade over time. A 30-day-old note looks different from a fresh one — so stale tasks are obvious." },
  { title: "5 Colors", desc: "Yellow for general, blue for dev, green for done, pink for urgent, orange for client feedback. Your team picks the system." },
  { title: "REST API", desc: "Full CRUD API for notes. Build integrations, sync with Slack, or pull notes into your project management tool." },
  { title: "Dashboard Widget", desc: "Notes live on the WordPress dashboard. Every admin sees them on login — no extra clicks, no missed handoffs." },
];

export default function PinnedPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Link href="/work" className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground">
                &larr; Back to Work
              </Link>
              <div className="mt-2 mb-4 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                WordPress Plugin
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
                Pinned
              </h1>
              <p className="mt-2 text-xl text-accent font-semibold">Sticky notes for WordPress</p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                Post-it notes on your WordPress dashboard. Leave handoff notes for your team, 
                tag people with @mentions, and let old notes fade so nothing gets buried.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Dashboard widget</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">@mentions</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Note aging</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">5 colors</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">REST API</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Team handoffs</span>
              </div>
            </div>
            <div className="hidden lg:block">
              {/* Sticky notes mockup */}
              <div className="relative h-[380px]">
                {colors.map((color, i) => (
                  <div
                    key={color.name}
                    className="absolute shadow-lg"
                    style={{
                      backgroundColor: color.hex,
                      borderLeft: `4px solid ${color.border}`,
                      width: "200px",
                      padding: "16px",
                      borderRadius: "4px",
                      transform: `rotate(${(i - 2) * 3}deg)`,
                      top: `${20 + i * 55}px`,
                      left: `${30 + (i % 3) * 80}px`,
                      zIndex: 5 - i,
                    }}
                  >
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#1a1a1a" }}>
                      {i === 0 && "Update hero banner copy before launch"}
                      {i === 1 && "@sarah check the mobile nav"}
                      {i === 2 && "Client approved the new pricing page ✓"}
                      {i === 3 && "URGENT: SSL cert expires Friday"}
                      {i === 4 && "Feedback: logo needs more contrast"}
                    </p>
                    <p style={{ fontSize: "9px", color: "#666", marginTop: "8px" }}>
                      {i === 0 && "2 hours ago"}
                      {i === 1 && "Yesterday"}
                      {i === 2 && "3 days ago"}
                      {i === 3 && "Just now"}
                      {i === 4 && "1 week ago"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">FEATURES</p>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Simple tools, real impact</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-surface/50 p-5">
                <p className="font-semibold text-sm">{f.title}</p>
                <p className="mt-2 text-xs text-muted leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Color System */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">5 COLORS</p>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Your team picks the system</h2>
          <div className="flex flex-wrap gap-4">
            {colors.map((c) => (
              <div key={c.name} className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 px-4 py-3">
                <div className="h-6 w-6 rounded" style={{ backgroundColor: c.hex, border: `2px solid ${c.border}` }} />
                <span className="text-sm font-medium">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">Yellow for general. Blue for dev. Green for done. Pink for urgent. Orange for client. Or make up your own system — the colors are just colors.</p>
        </div>
      </section>

      {/* REST API */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">REST API</p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Full CRUD for notes</h2>
          <p className="text-muted mb-6 max-w-2xl">Every note is accessible via the WordPress REST API. Build Slack integrations, sync with project management tools, or create custom dashboards.</p>
          <div className="rounded-xl border border-border bg-surface/80 p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-muted"><code>{`GET    /wp-json/pinned/v1/notes
POST   /wp-json/pinned/v1/notes
PUT    /wp-json/pinned/v1/notes/{id}
DELETE /wp-json/pinned/v1/notes/{id}

// Example: Create a note
fetch('/wp-json/pinned/v1/notes', {
  method: 'POST',
  body: JSON.stringify({
    content: '@sarah hero banner needs approval',
    color: 'pink',
    mentions: ['sarah']
  })
});`}</code></pre>
          </div>
        </div>
      </section>

      {/* How it was built */}
      <section className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">BUILT BY AI AGENTS</p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">14 agents. One session. Zero humans writing code.</h2>
          <p className="text-muted max-w-2xl leading-relaxed">
            Pinned was built alongside Dash in the same agent session. The agents debated whether notes 
            should be per-user or shared (shared won — handoffs need visibility). They built the aging 
            system, the @mention parser, the color picker, and the REST API. Margaret Hamilton ran 
            QA on every endpoint.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/contact" className="rounded-full bg-accent px-6 py-3 font-semibold text-black transition hover:bg-accent-dim">
              Build something like this
            </Link>
            <Link href="/work/dash" className="rounded-full border border-border px-6 py-3 font-semibold transition hover:bg-surface">
              See Dash plugin
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
