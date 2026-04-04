import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dash — Cmd+K Command Palette for WordPress | Shipyard AI",
  description: "Lightning-fast command palette for WordPress admin. Vanilla JS, zero dependencies, 6KB gzipped. 16 built-in commands, FULLTEXT search, developer API.",
  openGraph: {
    title: "Dash — Cmd+K Command Palette for WordPress",
    description: "Lightning-fast command palette for WordPress admin. Vanilla JS, zero dependencies, 6KB gzipped.",
    url: "https://shipyard.company/work/dash",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dash — Cmd+K Command Palette for WordPress",
    description: "Lightning-fast command palette for WordPress admin. Vanilla JS, zero dependencies, 6KB gzipped.",
  },
};

const commands = [
  { name: "Search Posts", key: "post", desc: "FULLTEXT search across all post types" },
  { name: "Switch User", key: "user", desc: "Quick switch between admin accounts" },
  { name: "Clear Cache", key: "cache", desc: "One-keystroke cache purge" },
  { name: "Toggle Debug", key: "debug", desc: "Enable/disable WP_DEBUG on the fly" },
  { name: "New Post", key: "new", desc: "Jump straight to the editor" },
  { name: "Edit Theme", key: "theme", desc: "Open the customizer instantly" },
  { name: "Plugin Search", key: "plugin", desc: "Find and activate plugins" },
  { name: "Media Upload", key: "media", desc: "Drag-drop upload from anywhere" },
];

export default function DashPage() {
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
                Dash
              </h1>
              <p className="mt-2 text-xl text-accent font-semibold">Cmd+K for WordPress</p>
              <p className="mt-4 text-lg leading-relaxed text-muted">
                A lightning-fast command palette for WordPress admin. Hit <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-sm font-mono">Cmd+K</kbd> and 
                search posts, run commands, navigate anywhere — without touching the mouse.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Vanilla JS</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Zero deps</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">6KB gzipped</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">16 commands</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">FULLTEXT search</span>
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-mono text-muted">Developer API</span>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="overflow-hidden rounded-2xl border border-border bg-surface/80 shadow-2xl shadow-accent/5 max-h-[380px]">
                {/* Command palette mockup */}
                <div className="px-6 pt-8 pb-2">
                  <div className="rounded-xl border border-border bg-background p-1 shadow-lg">
                    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                      <span className="text-sm text-muted">Search posts, pages, commands...</span>
                      <kbd className="ml-auto rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-mono text-muted">ESC</kbd>
                    </div>
                    <div className="divide-y divide-border">
                      {["Search Posts", "New Post", "Clear Cache", "Switch User", "Toggle Debug"].map((cmd, i) => (
                        <div key={cmd} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i === 0 ? "bg-accent/10 text-accent" : "text-foreground"}`}>
                          <span className="font-mono text-xs text-muted">&#9670;</span>
                          {cmd}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built-in Commands */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">16 BUILT-IN COMMANDS</p>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Everything at your fingertips</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {commands.map((cmd) => (
              <div key={cmd.key} className="rounded-xl border border-border bg-surface/50 p-4">
                <p className="font-semibold text-sm">{cmd.name}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{cmd.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specs */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">TECHNICAL</p>
          <h2 className="text-3xl font-bold tracking-tight mb-8">Built for speed</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-accent">6KB</p>
              <p className="text-sm text-muted mt-1">Gzipped bundle size. No jQuery, no React, no framework. Pure vanilla JavaScript.</p>
            </div>
            <div>
              <p className="text-4xl font-bold">0</p>
              <p className="text-sm text-muted mt-1">Dependencies. Ships as a single file. No node_modules, no build step, no supply chain risk.</p>
            </div>
            <div>
              <p className="text-4xl font-bold">&lt;50ms</p>
              <p className="text-sm text-muted mt-1">Search latency. FULLTEXT indexing on post titles, content, and meta fields.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-2 font-mono text-sm text-accent">DEVELOPER API</p>
          <h2 className="text-3xl font-bold tracking-tight mb-4">Extend with custom commands</h2>
          <p className="text-muted mb-6 max-w-2xl">Register your own commands with a simple PHP API. Each command gets a label, icon, callback, and optional keyboard shortcut.</p>
          <div className="rounded-xl border border-border bg-surface/80 p-6 font-mono text-sm overflow-x-auto">
            <pre className="text-muted"><code>{`add_filter('dash_commands', function($commands) {
    $commands[] = [
        'label'    => 'Deploy to Staging',
        'icon'     => 'rocket',
        'callback' => 'my_deploy_staging',
        'shortcut' => 'Ctrl+Shift+D',
    ];
    return $commands;
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
            Dash was built by Shipyard AI&apos;s agent pipeline. Steve Jobs debated UX with Elon Musk. 
            Sub-agents wrote the JavaScript, built the search index, designed the UI, wrote tests. 
            Margaret Hamilton ran QA. Jensen Huang filed board reviews. The entire plugin — from PRD to 
            production — shipped in a single session.
          </p>
          <div className="mt-8 flex gap-4">
            <Link href="/contact" className="rounded-full bg-accent px-6 py-3 font-semibold text-black transition hover:bg-accent-dim">
              Build something like this
            </Link>
            <Link href="/work" className="rounded-full border border-border px-6 py-3 font-semibold transition hover:bg-surface">
              See more work
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
