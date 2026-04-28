export interface Article {
  title: string;
  content: string;
  byline?: string;
}

/**
 * Minimal article extraction inspired by Mozilla Readability.
 * Uses a lightweight heuristic to find the main article text in HTML.
 */
export function extractArticle(html: string): Article {
  const title = extractTitle(html);
  const content = extractContent(html);
  const byline = extractByline(html);
  return { title, content, byline };
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (match && match[1]) return decodeHtmlEntities(match[1].trim());
  const h1 = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  if (h1 && h1[1]) return decodeHtmlEntities(h1[1].trim());
  return "Untitled";
}

function extractByline(html: string): string | undefined {
  const meta = html.match(
    /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i
  );
  if (meta && meta[1]) return decodeHtmlEntities(meta[1].trim());
  const altMeta = html.match(
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']author["']/i
  );
  if (altMeta && altMeta[1]) return decodeHtmlEntities(altMeta[1].trim());
  return undefined;
}

function extractContent(html: string): string {
  // Remove script and style tags
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  cleaned = cleaned.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  cleaned = cleaned.replace(/<header[\s\S]*?<\/header>/gi, "");
  cleaned = cleaned.replace(/<footer[\s\S]*?<\/footer>/gi, "");

  // Try to find article or main content
  const articleMatch = cleaned.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (articleMatch && articleMatch[1]) {
    return stripHtml(articleMatch[1]).trim();
  }

  const mainMatch = cleaned.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch && mainMatch[1]) {
    return stripHtml(mainMatch[1]).trim();
  }

  const contentMatch = cleaned.match(
    /<div[^>]+class=["'][^"']*(?:content|post|entry|article)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i
  );
  if (contentMatch && contentMatch[1]) {
    return stripHtml(contentMatch[1]).trim();
  }

  // Fallback: all paragraphs
  const paragraphs: string[] = [];
  const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRegex.exec(cleaned)) !== null) {
    const text = stripHtml(m[1]).trim();
    if (text.length > 20) paragraphs.push(text);
  }
  if (paragraphs.length > 0) {
    return paragraphs.join("\n\n");
  }

  return stripHtml(cleaned).trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
