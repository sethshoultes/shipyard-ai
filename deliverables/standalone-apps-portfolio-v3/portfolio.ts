export type AppEntry = {
  slug: string;
  name: string;
  tagline: string;
  status: "SHIPPED" | "BUILD" | "SCAFFOLD";
  github: string;
  features: string[];
  techStack: string[];
  accent: "amber" | "rose" | "teal" | "cyan" | "lime" | "fuchsia";
};

export const apps: AppEntry[] = [
  {
    slug: "tuned",
    name: "Tuned",
    tagline: "AI-powered workflow optimization for developers who need focus time",
    status: "BUILD",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/tuned",
    features: [
      "Smart distraction blocking",
      "Deep work session tracking",
      "Productivity analytics",
      "Custom workflow rules"
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS"],
    accent: "amber"
  },
  {
    slug: "promptfolio",
    name: "Promptfolio",
    tagline: "Organize and share your best AI prompts with version control",
    status: "BUILD",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/promptfolio",
    features: [
      "Prompt categorization",
      "Version history tracking",
      "Performance metrics",
      "Team collaboration"
    ],
    techStack: ["React", "Node.js", "MongoDB"],
    accent: "rose"
  },
  {
    slug: "commandbar",
    name: "Commandbar",
    tagline: "Universal command palette for web applications",
    status: "SHIPPED",
    github: "https://github.com/sethshoultes/shipyard-ai/tree/main/projects/commandbar",
    features: [
      "Cross-app search",
      "Custom command bindings",
      "Keyboard navigation",
      "Plugin ecosystem"
    ],
    techStack: ["TypeScript", "Vite", "Web Components"],
    accent: "teal"
  }
];