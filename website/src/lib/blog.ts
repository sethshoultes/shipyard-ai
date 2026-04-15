import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/app/blog/posts');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  content: string; // rendered HTML
}

function validateFrontmatter(data: any, slug: string): void {
  const errors: string[] = [];

  // Check title
  if (!data.title) {
    errors.push('Missing required field: title');
  } else if (typeof data.title !== 'string') {
    errors.push('Field "title" must be a string');
  }

  // Check date
  if (!data.date) {
    errors.push('Missing required field: date');
  } else if (typeof data.date !== 'string') {
    errors.push('Field "date" must be a string');
  } else {
    // Validate ISO date format
    const dateObj = new Date(data.date);
    if (isNaN(dateObj.getTime())) {
      errors.push(`Field "date" must be a valid ISO 8601 date string, got: "${data.date}"`);
    }
  }

  // Check description
  if (!data.description) {
    errors.push('Missing required field: description');
  } else if (typeof data.description !== 'string') {
    errors.push('Field "description" must be a string');
  }

  if (errors.length > 0) {
    const errorMessage = `Frontmatter validation failed for post "${slug}":\n  - ${errors.join('\n  - ')}`;
    throw new Error(errorMessage);
  }
}

export function getAllPostSlugs(): string[] {
  const files = fs.readdirSync(postsDirectory);
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace(/\.md$/, ''));
}

export function getAllPosts(): BlogPost[] {
  const slugs = getAllPostSlugs();
  const posts = slugs
    .map(slug => {
      try {
        return getPostBySlug(slug);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.warn(`Warning: Failed to load post "${slug}": ${errorMsg}`);
        return null;
      }
    })
    .filter((post): post is BlogPost => post !== null);

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function getPostBySlug(slug: string): BlogPost {
  const filePath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(fileContents);

  // Validate frontmatter before processing
  validateFrontmatter(data, slug);

  const processedContent = remark().use(html).processSync(content);

  return {
    slug,
    title: data.title,
    description: data.description || '',
    date: data.date,
    tags: data.tags || [],
    content: processedContent.toString(),
  };
}
