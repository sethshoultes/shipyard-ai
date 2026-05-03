import { notFound } from "next/navigation";
import Link from "next/link";
import { apps, type AppEntry } from "./portfolio";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return apps
    .filter((app) => app.status !== "SCAFFOLD")
    .map((app) => ({
      slug: app.slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = apps.find((a) => a.slug === slug);

  if (!app) {
    return {
      title: "App Not Found",
    };
  }

  return {
    title: `${app.name} — Shipyard Portfolio`,
    description: app.tagline,
    openGraph: {
      title: app.name,
      description: app.tagline,
      type: "article",
      url: `/portfolio/${app.slug}`,
    },
  };
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params;
  const app = apps.find((a) => a.slug === slug);

  if (!app || app.status === "SCAFFOLD") {
    notFound();
  }

  return (
    <article className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-16">
          <Link
            href="/work"
            className="mb-8 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back to Apps & Tools
          </Link>

          <div className="mb-6">
            <span
              className={`
                inline-block rounded-full px-3 py-1 text-sm font-medium
                ${app.status === "SHIPPED" ? "bg-green-100 text-green-800" : ""}
                ${app.status === "BUILD" ? "bg-blue-100 text-blue-800" : ""}
                ${app.status === "SCAFFOLD" ? "bg-gray-100 text-gray-800" : ""}
              `}
            >
              {app.status}
            </span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-4">{app.name}</h1>
          <p className="text-xl text-gray-600 leading-relaxed">{app.tagline}</p>
        </header>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Features</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {app.features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="mr-3 mt-1 h-2 w-2 rounded-full bg-gray-400"></div>
                <p className="text-gray-700">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {app.techStack.map((tech, index) => (
              <span
                key={index}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Source Code</h2>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
            <p className="mb-4 text-gray-700">
              This project is open source and available on GitHub. Feel free to explore the codebase,
              open issues, or contribute to the development.
            </p>
            <a
              href={app.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-black px-6 py-3 text-white font-medium transition-colors hover:bg-gray-800"
            >
              View on GitHub
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </section>

        <footer className="border-t border-gray-200 pt-8">
          <div className="flex items-center justify-between">
            <Link
              href="/work"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back to all apps
            </Link>
            <p className="text-sm text-gray-500">
              Part of the Shipyard portfolio
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}