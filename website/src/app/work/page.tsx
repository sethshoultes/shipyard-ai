import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work — Shipyard AI",
  description:
    "EmDash sites built by Shipyard AI. Restaurant, dental, and design agency examples — all built from PRDs using our AI agent pipeline.",
  openGraph: {
    title: "Work — Shipyard AI",
    description:
      "EmDash sites built by Shipyard AI. Real examples built from PRDs using our AI agent pipeline.",
    url: "https://shipyard.company/work",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Work — Shipyard AI",
    description:
      "EmDash sites built by Shipyard AI. Real examples built from PRDs using our AI agent pipeline.",
  },
};

const projects = [
  {
    name: "Bella's Bistro",
    vertical: "Restaurant",
    location: "Austin, TX",
    template: "Marketing",
    url: "https://bellas.shipyard.company",
    screenshot: "/screenshots/bellas-bistro.png",
    description:
      "Handmade Italian restaurant site with full menu and pricing, customer reviews, FAQ, and reservation booking. Built on the EmDash marketing template with custom content blocks.",
    features: [
      "Full menu with pricing (antipasti, entrées, dolci)",
      "Customer testimonials from Google & Yelp",
      "Reservation system integration",
      "Family-style dining & private events info",
      "Seasonal specials & wine list",
    ],
    color: "from-red-900/30 to-orange-900/10",
    accent: "text-red-400",
    badge: "bg-red-500/10 text-red-400 border-red-500/20",
    previewBg: "bg-gradient-to-br from-red-950 via-orange-950 to-amber-950",
  },
  {
    name: "Peak Dental Care",
    vertical: "Dental Practice",
    location: "Denver, CO",
    template: "Marketing",
    url: "https://dental.shipyard.company",
    screenshot: "/screenshots/peak-dental.png",
    description:
      "Modern dental practice site with transparent service pricing, patient testimonials, insurance FAQ, and same-day appointment booking. Professional and trustworthy.",
    features: [
      "6 service categories (preventive to emergency)",
      "Transparent pricing with insurance info",
      "Patient testimonials & trust signals",
      "Same-day emergency appointment booking",
      "Payment plans & financing options",
    ],
    color: "from-sky-900/30 to-blue-900/10",
    accent: "text-sky-400",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    previewBg: "bg-gradient-to-br from-sky-950 via-blue-950 to-indigo-950",
  },
  {
    name: "Craft & Co Studio",
    vertical: "Design Agency",
    location: "Portland, OR",
    template: "Portfolio",
    url: "https://craft.shipyard.company",
    screenshot: "/screenshots/craft-co-studio.png",
    description:
      "Creative agency portfolio with 5 case study projects, filterable by category. Brand identity, web design, packaging, and illustration work for food & beverage and outdoor brands.",
    features: [
      "5 portfolio case studies with full write-ups",
      "Category & tag filtering (brand, web, print)",
      "Agency bio & capabilities overview",
      "Project detail pages with process documentation",
      "Dark/light mode support",
    ],
    color: "from-purple-900/30 to-violet-900/10",
    accent: "text-purple-400",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    previewBg: "bg-gradient-to-br from-purple-950 via-violet-950 to-fuchsia-950",
  },
];

export default function WorkPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 font-mono text-sm text-accent">PORTFOLIO</p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              What we&apos;ve shipped
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              Sites, themes, and plugins — built by our AI agent pipeline. Each one started
              as a PRD and was debated, built, tested, and deployed — all
              without a human writing code.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-surface/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          <div>
            <p className="text-3xl font-bold text-accent">5</p>
            <p className="text-sm text-muted">Products shipped</p>
          </div>
          <div>
            <p className="text-3xl font-bold">14</p>
            <p className="text-sm text-muted">AI agents</p>
          </div>
          <div>
            <p className="text-3xl font-bold">2</p>
            <p className="text-sm text-muted">Platforms (EmDash + WordPress)</p>
          </div>
          <div>
            <p className="text-3xl font-bold">&lt;45s</p>
            <p className="text-sm text-muted">Build time each</p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="space-y-12">
            {projects.map((project, i) => (
              <article
                key={project.name}
                className="overflow-hidden rounded-xl border border-border bg-surface"
              >
                {/* Preview + Header */}
                <div
                  className={`${project.previewBg} relative overflow-hidden`}
                >
                  {/* Browser mockup */}
                  <div className="mx-8 mt-8 overflow-hidden rounded-t-lg border border-white/10 bg-black/40 backdrop-blur">
                    <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                      </div>
                      <div className="ml-2 flex-1 rounded bg-white/5 px-3 py-1 text-xs text-muted">
                        {project.url.replace("https://", "")}
                      </div>
                    </div>
                    <img
                      src={project.screenshot}
                      alt={`${project.name} website screenshot`}
                      className="w-full h-56 object-cover object-top"
                    />
                  </div>
                  <div className="px-8 pb-8 pt-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <span
                          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${project.badge}`}
                        >
                          {project.vertical}
                        </span>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight">
                          {project.name}
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                          {project.location} &middot; EmDash{" "}
                          {project.template} Template
                        </p>
                      </div>
                      <span className="font-mono text-sm text-muted">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="px-8 py-8">
                  <p className="max-w-2xl leading-relaxed text-muted">
                    {project.description}
                  </p>

                  <div className="mt-6">
                    <p className="mb-3 text-sm font-semibold">
                      What&apos;s included
                    </p>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {project.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-muted"
                        >
                          <span className={`mt-0.5 ${project.accent}`}>
                            &#9670;
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="rounded bg-surface px-2 py-1 font-mono text-xs text-muted">
                        EmDash CMS
                      </span>
                      <span className="rounded bg-surface px-2 py-1 font-mono text-xs text-muted">
                        Astro 6
                      </span>
                      <span className="rounded bg-surface px-2 py-1 font-mono text-xs text-muted">
                        Cloudflare
                      </span>
                      <span className="rounded bg-surface px-2 py-1 font-mono text-xs text-muted">
                        TypeScript
                      </span>
                    </div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
                    >
                      View Live Site
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* WordPress Plugins */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">WORDPRESS PLUGINS</p>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Built by 14 AI agents in one session</h2>
          <div className="grid gap-8 sm:grid-cols-2">
            <Link href="/work/dash" className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent/30">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-8">
                <div className="rounded-xl border border-border/50 bg-background/80 p-1 shadow-lg max-w-[280px] mx-auto">
                  <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    <span className="text-xs text-muted">Search commands...</span>
                  </div>
                  <div className="py-1">
                    <div className="px-3 py-1.5 text-xs bg-accent/10 text-accent">Search Posts</div>
                    <div className="px-3 py-1.5 text-xs text-muted">New Post</div>
                    <div className="px-3 py-1.5 text-xs text-muted">Clear Cache</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold group-hover:text-accent transition">Dash</h3>
                <p className="text-sm text-accent mt-1">Cmd+K for WordPress</p>
                <p className="mt-2 text-sm text-muted leading-relaxed">Command palette for WordPress admin. Vanilla JS, zero deps, 6KB gzipped, FULLTEXT search, 16 built-in commands, developer API.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">6KB</span>
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">0 deps</span>
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">16 commands</span>
                </div>
              </div>
            </Link>

            <Link href="/work/pinned" className="group overflow-hidden rounded-xl border border-border bg-surface transition hover:border-accent/30">
              <div className="bg-gradient-to-br from-amber-950/50 to-yellow-950/30 p-8 relative overflow-hidden" style={{minHeight: "180px"}}>
                <div className="absolute shadow-md" style={{backgroundColor: "#FEF08A", borderLeft: "3px solid #EAB308", width: "140px", padding: "10px", borderRadius: "3px", transform: "rotate(-2deg)", top: "20px", left: "30px"}}>
                  <p style={{fontSize: "10px", fontWeight: 600, color: "#1a1a1a"}}>Update hero copy before launch</p>
                  <p style={{fontSize: "8px", color: "#666", marginTop: "4px"}}>2h ago</p>
                </div>
                <div className="absolute shadow-md" style={{backgroundColor: "#FBCFE8", borderLeft: "3px solid #EC4899", width: "130px", padding: "10px", borderRadius: "3px", transform: "rotate(1deg)", top: "30px", right: "30px"}}>
                  <p style={{fontSize: "10px", fontWeight: 600, color: "#1a1a1a"}}>URGENT: SSL expires Fri</p>
                  <p style={{fontSize: "8px", color: "#666", marginTop: "4px"}}>Just now</p>
                </div>
                <div className="absolute shadow-md" style={{backgroundColor: "#BBF7D0", borderLeft: "3px solid #22C55E", width: "150px", padding: "10px", borderRadius: "3px", transform: "rotate(-1deg)", bottom: "15px", left: "60px"}}>
                  <p style={{fontSize: "10px", fontWeight: 600, color: "#1a1a1a"}}>Client approved pricing ✓</p>
                  <p style={{fontSize: "8px", color: "#666", marginTop: "4px"}}>3 days ago</p>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold group-hover:text-accent transition">Pinned</h3>
                <p className="text-sm text-accent mt-1">Sticky notes for WordPress</p>
                <p className="mt-2 text-sm text-muted leading-relaxed">Post-it notes on your admin dashboard. Team handoff notes, @mentions, note aging, 5 colors, REST API.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">@mentions</span>
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">5 colors</span>
                  <span className="rounded bg-surface px-2 py-0.5 text-[10px] font-mono text-muted">REST API</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Want something like this?
          </h2>
          <p className="mt-3 text-lg text-muted">
            Submit a PRD. We&apos;ll scope it, debate the approach, and ship it.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-black transition hover:bg-accent-dim"
            >
              Start a Project
            </Link>
            <Link
              href="/services"
              className="rounded-full border border-border px-6 py-3 font-semibold text-foreground transition hover:bg-surface"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
