import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: "#0a0a0f",
          900: "#0f0f1a",
          800: "#141422",
          700: "#1a1a2e",
          600: "#252540",
        },
        spotlight: {
          DEFAULT: "#e8e6f0",
          muted: "#a09eb8",
          dim: "#6e6c88",
        },
        accent: {
          DEFAULT: "#8b5cf6",
          glow: "#a78bfa",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
