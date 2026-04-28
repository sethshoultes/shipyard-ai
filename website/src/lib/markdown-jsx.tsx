import React from "react";

/**
 * Tiny markdown → JSX renderer for marketing pages.
 *
 * Handles: # h1, ## h2, ### h3, ###### h6, paragraphs, blank-line separation,
 * **bold**, *italic*, `code`, [link](url), unordered lists (- ), ordered lists (1. ),
 * blockquotes (> ), horizontal rules (---), code fences (```...```).
 *
 * Every node is a typed React element — no innerHTML injection.
 * Keeps it small (~150 lines) for marketing-page scope. Not a complete CommonMark
 * parser; if a marketing doc needs more, swap in react-markdown.
 */

type Inline = string | React.ReactElement;

function renderInline(text: string, keyPrefix: string): Inline[] {
  const out: Inline[] = [];
  let cursor = 0;
  let key = 0;
  const pattern =
    /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) out.push(text.slice(cursor, start));
    const matched = match[0];

    if (matched.startsWith("`")) {
      out.push(
        <code key={`${keyPrefix}-c${key++}`} className="rounded bg-surface px-1.5 py-0.5 font-mono text-sm">
          {matched.slice(1, -1)}
        </code>
      );
    } else if (matched.startsWith("[")) {
      const linkMatch = matched.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        out.push(
          <a
            key={`${keyPrefix}-l${key++}`}
            href={linkMatch[2]}
            className="text-accent underline hover:text-accent-dim"
            target={linkMatch[2].startsWith("http") ? "_blank" : undefined}
            rel={linkMatch[2].startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {linkMatch[1]}
          </a>
        );
      } else {
        out.push(matched);
      }
    } else if (matched.startsWith("**")) {
      out.push(
        <strong key={`${keyPrefix}-b${key++}`} className="font-bold">
          {matched.slice(2, -2)}
        </strong>
      );
    } else if (matched.startsWith("*")) {
      out.push(
        <em key={`${keyPrefix}-i${key++}`}>{matched.slice(1, -1)}</em>
      );
    }
    cursor = start + matched.length;
  }

  if (cursor < text.length) out.push(text.slice(cursor));
  return out;
}

export function renderMarkdown(md: string): React.ReactElement[] {
  const lines = md.split("\n");
  const elements: React.ReactElement[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <pre
          key={`md-${key++}`}
          className="my-4 overflow-x-auto rounded-md border border-border bg-surface p-4 font-mono text-sm"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (/^---+\s*$/.test(line)) {
      elements.push(<hr key={`md-${key++}`} className="my-8 border-border" />);
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const sizeClass = {
        1: "text-4xl font-bold mt-8 mb-4 tracking-tight",
        2: "text-3xl font-bold mt-8 mb-3 tracking-tight",
        3: "text-2xl font-semibold mt-6 mb-3 tracking-tight",
        4: "text-xl font-semibold mt-4 mb-2",
        5: "text-lg font-semibold mt-4 mb-2",
        6: "text-base font-semibold mt-4 mb-2 uppercase tracking-wide text-muted",
      }[level as 1 | 2 | 3 | 4 | 5 | 6];
      elements.push(
        <Tag key={`md-${key++}`} className={sizeClass}>
          {renderInline(text, `md-${key}`)}
        </Tag>
      );
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`md-${key++}`}
          className="my-4 border-l-4 border-accent/50 bg-surface/50 px-4 py-3 italic text-muted"
        >
          {renderInline(quoteLines.join(" "), `md-${key}`)}
        </blockquote>
      );
      continue;
    }

    if (line.match(/^[-*]\s+/)) {
      const items: React.ReactElement[] = [];
      let itemKey = 0;
      while (i < lines.length && lines[i].match(/^[-*]\s+/)) {
        const itemText = lines[i].replace(/^[-*]\s+/, "");
        items.push(
          <li key={`md-${key}-li${itemKey++}`}>
            {renderInline(itemText, `md-${key}-li${itemKey}`)}
          </li>
        );
        i++;
      }
      elements.push(
        <ul key={`md-${key++}`} className="my-4 list-disc space-y-2 pl-6">
          {items}
        </ul>
      );
      continue;
    }

    if (line.match(/^\d+\.\s+/)) {
      const items: React.ReactElement[] = [];
      let itemKey = 0;
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        const itemText = lines[i].replace(/^\d+\.\s+/, "");
        items.push(
          <li key={`md-${key}-oi${itemKey++}`}>
            {renderInline(itemText, `md-${key}-oi${itemKey}`)}
          </li>
        );
        i++;
      }
      elements.push(
        <ol key={`md-${key++}`} className="my-4 list-decimal space-y-2 pl-6">
          {items}
        </ol>
      );
      continue;
    }

    const paragraphLines: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].match(/^(#{1,6}\s|>|---+\s*$|```|[-*]\s+|\d+\.\s+)/)
    ) {
      paragraphLines.push(lines[i]);
      i++;
    }
    elements.push(
      <p key={`md-${key++}`} className="my-4 leading-relaxed">
        {renderInline(paragraphLines.join(" "), `md-${key}`)}
      </p>
    );
  }

  return elements;
}
