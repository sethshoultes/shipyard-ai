/**
 * PromptCard Component
 *
 * Displays a single prompt with its response in the gallery template.
 * Hero prompt display with large typography and elegant code blocks.
 */

'use client';

import { renderMarkdown, isMarkdown } from '@/lib/markdownRenderer';
import type { Prompt } from '@/types/aura';

interface PromptCardProps {
  prompt: Prompt;
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
 * PromptCard Component
 */
export function PromptCard({ prompt }: PromptCardProps) {
  const contentIsMarkdown = isMarkdown(prompt.content);
  const responseIsMarkdown = isMarkdown(prompt.response);

  return (
    <article className="prompt-card bg-surface rounded-2xl p-8 mb-8 border border-border-subtle">
      <header className="mb-6">
        {prompt.title && (
          <h2 className="text-2xl font-bold text-text-primary mb-2">{prompt.title}</h2>
        )}
        <time className="text-sm text-text-muted">{formatDate(prompt.timestamp)}</time>
      </header>

      <section className="prompt-content mb-6">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Prompt
        </h3>
        <div className="prose prose-invert max-w-none">
          {contentIsMarkdown ? (
            <div
              className="text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(prompt.content) }}
            />
          ) : (
            <p className="text-text-primary leading-relaxed">{prompt.content}</p>
          )}
        </div>
      </section>

      <section className="response-content">
        <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
          Response
        </h3>
        <div className="prose prose-invert max-w-none bg-surface-elevated rounded-xl p-6 border border-border-subtle">
          {responseIsMarkdown ? (
            <div
              className="text-text-primary leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(prompt.response) }}
            />
          ) : (
            <p className="text-text-primary leading-relaxed">{prompt.response}</p>
          )}
        </div>
      </section>
    </article>
  );
}
