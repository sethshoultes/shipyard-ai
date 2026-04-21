import { RepoMeta } from "./github";

const W = 1200;
const H = 630;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function nf(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  return String(n);
}

function clamp(s: string, max: number): string {
  if (!s) return "";
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export function renderTemplate(m: RepoMeta): string {
  const title = clamp(m.repo, 28);
  const subtitle = clamp(m.ownerName, 32);
  const desc = m.description ? clamp(m.description, 100) : "";
  const langs = m.topLanguages.slice(0, 3).map(esc);
  const stars = nf(m.stars);
  const forks = nf(m.forks);

  const langRow = langs.length
    ? langs
        .map((l, i) => `<tspan x="${80 + i * 180}" dy="0">${l}</tspan>`)
        .join("")
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/>
      <stop offset="100%" stop-color="#161c36"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#c4b5fd"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${W}" height="6" fill="url(#accent)"/>
  <g font-family="Inter, sans-serif" fill="#ffffff">
    <text x="80" y="140" font-size="28" fill="#94a3b8" font-weight="500">${esc(subtitle)}</text>
    <text x="80" y="240" font-size="96" font-weight="800" letter-spacing="-2">${esc(title)}</text>
    ${desc ? `<text x="80" y="320" font-size="30" fill="#cbd5e1" font-weight="400">${esc(desc)}</text>` : ""}
    <g font-size="24" fill="#7dd3fc" font-weight="600">
      ${langRow}
    </g>
    <g transform="translate(80 540)" font-size="26" fill="#e2e8f0" font-weight="600">
      <text x="0" y="0">★ ${stars}</text>
      <text x="160" y="0">⑂ ${forks}</text>
    </g>
    <text x="${W - 80}" y="540" font-size="22" fill="#64748b" text-anchor="end" font-weight="500">poster · github.com/${esc(m.fullName)}</text>
  </g>
</svg>`;
}
