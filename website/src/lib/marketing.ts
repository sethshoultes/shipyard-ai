import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

/**
 * Read a marketing markdown file and return parsed frontmatter + rendered HTML.
 * Used by the /pricing, /terms, and (eventually) other content-driven marketing pages.
 *
 * The drafts live in shipyard-ai/website/copy/ and shipyard-ai/website/legal/.
 * They are authored by constellation personas (Maya Angelou, Sara Blakely, Lawrence Lessig, etc.)
 * and rendered server-side at build time. See brain/projects/shipyard-corporation-formation.md.
 */

export interface MarketingDoc {
  slug: string;
  title: string;
  author?: string;
  status?: string;
  created?: string;
  content: string; // rendered HTML
  raw: string;     // raw markdown body (for clients that prefer markdown)
}

const websiteRoot = process.cwd();

const sources: Record<string, string> = {
  'sales-page': path.join(websiteRoot, 'copy/sales-page.md'),
  'pricing-page': path.join(websiteRoot, 'copy/pricing-page.md'),
  'terms': path.join(websiteRoot, 'legal/TERMS.md'),
};

export async function getMarketingDoc(slug: keyof typeof sources): Promise<MarketingDoc> {
  const filePath = sources[slug];
  if (!filePath) {
    throw new Error(`Unknown marketing doc: ${slug}`);
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Marketing doc not found at ${filePath}`);
  }
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const parsed = matter(fileContents);
  const processed = await remark().use(html).process(parsed.content);
  return {
    slug,
    title: parsed.data.title || slug,
    author: parsed.data.author,
    status: parsed.data.status,
    created: parsed.data.created,
    content: processed.toString(),
    raw: parsed.content,
  };
}
