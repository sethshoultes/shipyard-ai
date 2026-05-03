/**
 * Static Generator
 *
 * Orchestrates HTML + CSS + OG image generation for portfolios.
 * Writes static bundles to disk for CDN deployment.
 */

import type { Portfolio } from '@/types/aura';
import { renderMarkdown, isMarkdown } from './markdownRenderer';

/**
 * Generates a complete HTML document for a portfolio
 */
export function generatePortfolioHTML(portfolio: Portfolio): string {
  const promptsHTML = portfolio.prompts
    .map(
      (prompt) => `
        <article class="prompt-card bg-surface rounded-2xl p-8 mb-8 border border-border-subtle">
          <header class="mb-6">
            ${prompt.title ? `<h2 class="text-2xl font-bold text-text-primary mb-2">${escapeHtml(prompt.title)}</h2>` : ''}
            <time class="text-sm text-text-muted">${formatDate(prompt.timestamp)}</time>
          </header>

          <section class="prompt-content mb-6">
            <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Prompt</h3>
            <div class="prose prose-invert max-w-none">
              ${isMarkdown(prompt.content) ? renderMarkdown(prompt.content) : `<p class="text-text-primary leading-relaxed">${escapeHtml(prompt.content)}</p>`}
            </div>
          </section>

          <section class="response-content">
            <h3 class="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">Response</h3>
            <div class="prose prose-invert max-w-none bg-surface-elevated rounded-xl p-6 border border-border-subtle">
              ${isMarkdown(prompt.response) ? renderMarkdown(prompt.response) : `<p class="text-text-primary leading-relaxed">${escapeHtml(prompt.response)}</p>`}
            </div>
          </section>
        </article>
      `,
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(portfolio.title)} — Aura Portfolio</title>
  <meta name="description" content="Portfolio of AI prompts and workflows" />

  <!-- Open Graph -->
  <meta property="og:title" content="${escapeHtml(portfolio.title)}" />
  <meta property="og:description" content="Portfolio of AI prompts and workflows" />
  <meta property="og:image" content="./og-image.png" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(portfolio.title)}" />
  <meta name="twitter:description" content="Portfolio of AI prompts and workflows" />
  <meta name="twitter:image" content="./og-image.png" />

  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

  <!-- Styles -->
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }

    html {
      font-size: 16px;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    body {
      margin: 0;
      padding: 0;
      background-color: #0a0a0f;
      color: #fafafa;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      line-height: 1.6;
    }

    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 4rem 1.5rem;
    }

    .header {
      margin-bottom: 4rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid #2a2a35;
    }

    .header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin: 0 0 0.5rem 0;
      color: #fafafa;
    }

    .header-meta {
      color: #606070;
      font-size: 0.875rem;
    }

    .prompt-card {
      background-color: #12121a;
      border-radius: 1rem;
      padding: 2rem;
      margin-bottom: 2rem;
      border: 1px solid #2a2a35;
    }

    .prompt-card h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
      color: #fafafa;
    }

    .prompt-card time {
      color: #606070;
      font-size: 0.875rem;
    }

    .prompt-card h3 {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a0a0b0;
      margin: 0 0 0.75rem 0;
    }

    .prompt-card p {
      margin: 0.75rem 0;
      color: #fafafa;
      line-height: 1.75;
    }

    .prompt-card pre {
      background-color: #1a1a25;
      border-radius: 0.5rem;
      padding: 1rem;
      overflow-x: auto;
      margin: 1rem 0;
      border: 1px solid #2a2a35;
    }

    .prompt-card code {
      font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
      font-size: 0.875rem;
      color: #fafafa;
    }

    .prompt-card a {
      color: #7c7cff;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .prompt-card a:hover {
      color: #5c5cff;
    }

    .share-section {
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 1px solid #2a2a35;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .share-button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: #1a1a25;
      color: #fafafa;
      border: 1px solid #2a2a35;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .share-button:hover {
      background-color: #2a2a35;
    }

    .branding {
      color: #606070;
      font-size: 0.875rem;
    }

    @media (max-width: 640px) {
      .container {
        padding: 2rem 1rem;
      }

      .header h1 {
        font-size: 1.75rem;
      }

      .prompt-card {
        padding: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <main class="container">
    <header class="header">
      <h1>${escapeHtml(portfolio.title)}</h1>
      <div class="header-meta">
        Generated on ${formatDate(portfolio.createdAt)}
      </div>
    </header>

    ${promptsHTML}

    <footer class="share-section">
      <button class="share-button" onclick="sharePortfolio()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"></circle>
          <circle cx="6" cy="12" r="3"></circle>
          <circle cx="18" cy="19" r="3"></circle>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
        </svg>
        Share
      </button>
      <button class="share-button" onclick="copyLink()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
        Copy Link
      </button>
      <span class="branding">Generated with Aura</span>
    </footer>
  </main>

  <script>
    async function sharePortfolio() {
      if (navigator.share) {
        try {
          await navigator.share({
            title: '${escapeHtml(portfolio.title)}',
            text: 'Check out this AI prompt portfolio',
            url: window.location.href
          });
        } catch (err) {
          console.log('Share cancelled');
        }
      } else {
        copyLink();
      }
    }

    function copyLink() {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy link');
      });
    }
  </script>
</body>
</html>`;
}

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}

/**
 * Formats a date string for display
 */
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Generates the CSS bundle for portfolios
 * (Extracted from inline styles for potential reuse)
 */
export function generatePortfolioCSS(): string {
  return `
/* Aura Portfolio Styles */
:root {
  --color-background: #0a0a0f;
  --color-surface: #12121a;
  --color-surface-elevated: #1a1a25;
  --color-border-subtle: #2a2a35;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a0a0b0;
  --color-text-muted: #606070;
  --color-accent-primary: #7c7cff;
  --color-accent-secondary: #5c5cff;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--color-background);
  color: var(--color-text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  line-height: 1.6;
}
`.trim();
}
