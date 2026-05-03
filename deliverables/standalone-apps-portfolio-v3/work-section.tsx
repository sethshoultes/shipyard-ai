import { apps } from "./portfolio";
import Link from "next/link";

export function AppsAndToolsSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16">
          <h2 className="text-4xl font-bold tracking-tight">Apps & Tools</h2>
          <p className="mt-4 text-lg text-gray-600">
            We craft tools we wish existed. Each project solves real problems we encountered while building.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {apps.map((app) => (
            <div
              key={app.slug}
              className={`
                relative rounded-lg border p-6 transition-all hover:shadow-lg
                ${app.accent === "amber" ? "border-amber-200 bg-amber-50 hover:border-amber-300" : ""}
                ${app.accent === "rose" ? "border-rose-200 bg-rose-50 hover:border-rose-300" : ""}
                ${app.accent === "teal" ? "border-teal-200 bg-teal-50 hover:border-teal-300" : ""}
                ${app.accent === "cyan" ? "border-cyan-200 bg-cyan-50 hover:border-cyan-300" : ""}
                ${app.accent === "lime" ? "border-lime-200 bg-lime-50 hover:border-lime-300" : ""}
                ${app.accent === "fuchsia" ? "border-fuchsia-200 bg-fuchsia-50 hover:border-fuchsia-300" : ""}
              `}
            >
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-xl font-semibold">{app.name}</h3>
                <span
                  className={`
                    rounded-full px-2 py-1 text-xs font-medium
                    ${app.status === "SHIPPED" ? "bg-green-100 text-green-800" : ""}
                    ${app.status === "BUILD" ? "bg-blue-100 text-blue-800" : ""}
                    ${app.status === "SCAFFOLD" ? "bg-gray-100 text-gray-800" : ""}
                  `}
                >
                  {app.status}
                </span>
              </div>

              <p className="mb-6 text-gray-700">{app.tagline}</p>

              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Features</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  {app.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="mb-2 text-sm font-medium text-gray-900">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {app.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <a
                  href={app.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded border border-gray-300 bg-white px-4 py-2 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  View Source
                </a>
                {app.status !== "SCAFFOLD" && (
                  <Link
                    href={`/portfolio/${app.slug}`}
                    className="flex-1 rounded bg-black px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
                  >
                    Read More
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}