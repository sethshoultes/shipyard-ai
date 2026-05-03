/**
 * Markdown Renderer
 *
 * Renders markdown content with gallery-grade typography and syntax highlighting.
 * Simple, dependency-free implementation for static generation.
 */

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
 * Simple syntax highlighting for code blocks
 * Applies basic colorization to common patterns
 */
function highlightCode(code: string, language?: string): string {
  // Escape HTML first
  let highlighted = escapeHtml(code);

  // Common patterns for syntax highlighting
  const patterns: { regex: RegExp; className: string }[] = [
    // Strings
    { regex: /(&quot;.*?&quot;|&#39;.*?&#39;)/g, className: 'text-green-400' },
    // Keywords
    {
      regex:
        /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|async|await|try|catch|throw|new|this|typeof|instanceof)\b/g,
      className: 'text-purple-400',
    },
    // Numbers
    { regex: /\b(\d+\.?\d*)\b/g, className: 'text-orange-400' },
    // Comments
    { regex: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm, className: 'text-gray-500' },
    // Function calls
    { regex: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, className: 'text-blue-400' },
  ];

  // Apply patterns (order matters - strings first to avoid highlighting inside them)
  for (const { regex, className } of patterns) {
    highlighted = highlighted.replace(regex, (match) => {
      // Don't double-wrap already highlighted content
      if (match.includes('class=')) {
        return match;
      }
      return `<span class="${className}">${match}</span>`;
    });
  }

  return highlighted;
}

/**
 * Parses inline markdown (bold, italic, code, links)
 */
function parseInline(text: string): string {
  let result = escapeHtml(text);

  // Inline code (must be before bold/italic to avoid conflicts)
  result = result.replace(/`([^`]+)`/g, '<code class="bg-surface-elevated px-1.5 py-0.5 rounded text-sm font-mono text-text-primary">$1</code>');

  // Bold
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic
  result = result.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-accent-primary hover:text-accent-secondary underline underline-offset-2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  return result;
}

/**
 * Renders markdown to HTML with gallery-grade typography
 */
export function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  const blocks: string[] = [];
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeBlockLanguage = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Code block handling
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        codeBlockLanguage = line.slice(3).trim();
        codeBlockContent = [];
      } else {
        // End of code block
        inCodeBlock = false;
        const highlighted = highlightCode(codeBlockContent.join('\n'), codeBlockLanguage);
        blocks.push(
          `<pre class="bg-surface-elevated rounded-lg p-4 overflow-x-auto my-4 border border-border-subtle"><code class="font-mono text-sm leading-relaxed">${highlighted}</code></pre>`,
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      blocks.push(`<h3 class="text-xl font-semibold mt-6 mb-3 text-text-primary">${parseInline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(`<h2 class="text-2xl font-semibold mt-8 mb-4 text-text-primary">${parseInline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(`<h1 class="text-3xl font-bold mt-8 mb-4 text-text-primary">${parseInline(line.slice(2))}</h1>`);
      continue;
    }

    // Blockquotes
    if (line.startsWith('> ')) {
      blocks.push(
        `<blockquote class="border-l-4 border-accent-primary pl-4 my-4 text-text-secondary italic">${parseInline(line.slice(2))}</blockquote>`,
      );
      continue;
    }

    // Unordered lists
    if (line.match(/^[-*]\s+/)) {
      blocks.push(`<li class="ml-4 my-1 text-text-primary">${parseInline(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    // Ordered lists
    if (line.match(/^\d+\.\s+/)) {
      blocks.push(`<li class="ml-4 my-1 text-text-primary">${parseInline(line.replace(/^\d+\.\s+/, ''))}</li>`);
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      blocks.push('<br/>');
      continue;
    }

    // Regular paragraphs
    blocks.push(`<p class="my-3 text-text-primary leading-relaxed">${parseInline(line)}</p>`);
  }

  return blocks.join('\n');
}

/**
 * Renders plain text with minimal formatting (for prompts without markdown)
 */
export function renderPlainText(content: string): string {
  return `<p class="my-3 text-text-primary leading-relaxed">${escapeHtml(content)}</p>`;
}

/**
 * Detects if content contains markdown syntax
 */
export function isMarkdown(content: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s+/m, // Headers
    /\*\*[^*]+\*\*/, // Bold
    /\*[^*]+\*/, // Italic
    /`[^`]+`/, // Inline code
    /^```/m, // Code blocks
    /^\[.+\]\(.+\)/m, // Links
    /^[-*]\s+/m, // Unordered lists
    /^\d+\.\s+/m, // Ordered lists
    /^>\s+/m, // Blockquotes
  ];

  return markdownPatterns.some((pattern) => pattern.test(content));
}
