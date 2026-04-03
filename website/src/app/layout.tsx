import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shipyard.company"),
  title: "Shipyard AI — PRD to Production",
  description:
    "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs. Ship production-quality digital products at machine speed.",
  openGraph: {
    title: "Shipyard AI — PRD to Production",
    description:
      "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
    url: "https://shipyard.company",
    siteName: "Shipyard AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipyard AI — PRD to Production",
    description:
      "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
  },
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="text-accent">&#9670;</span> Shipyard AI
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted sm:flex">
          <Link href="/services" className="transition hover:text-foreground">
            Services
          </Link>
          <Link href="/about" className="transition hover:text-foreground">
            About
          </Link>
          <Link href="/pipeline" className="transition hover:text-foreground">
            Pipeline
          </Link>
          <Link
            href="/contact"
            className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-black transition hover:bg-accent-dim"
          >
            Start a Project
          </Link>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 sm:flex-row">
        <div className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Shipyard AI. PRD in, production out.
        </div>
        <div className="flex gap-6 text-sm text-muted">
          <Link href="/services" className="transition hover:text-foreground">
            Services
          </Link>
          <Link href="/about" className="transition hover:text-foreground">
            About
          </Link>
          <Link href="/pipeline" className="transition hover:text-foreground">
            Pipeline
          </Link>
          <Link href="/contact" className="transition hover:text-foreground">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Shipyard AI",
              url: "https://shipyard.company",
              description:
                "Autonomous AI agency that builds Emdash sites, themes, and plugins from PRDs.",
              foundingDate: "2026",
              knowsAbout: [
                "EmDash",
                "Astro",
                "Cloudflare",
                "Web Development",
                "AI Agents",
                "CMS",
              ],
            }),
          }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:text-black">
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
