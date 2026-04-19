/**
 * SPARK Page Content Scraper
 * Extracts page content with SPA support and MutationObserver
 */

const MAX_CONTENT_SIZE = 10240; // 10KB

export function scrapePageContent() {
  const content = {
    title: document.title || '',
    description: '',
    body: ''
  };

  // Extract meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    content.description = metaDesc.getAttribute('content') || '';
  }

  // Extract body text with priority order
  let bodyText = '';

  // Try <main> first
  const main = document.querySelector('main');
  if (main) {
    bodyText = main.innerText;
  } else {
    // Fallback to <article>
    const article = document.querySelector('article');
    if (article) {
      bodyText = article.innerText;
    } else {
      // Fallback to <body>
      bodyText = document.body.innerText;
    }
  }

  // Clean and truncate
  content.body = bodyText
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONTENT_SIZE);

  return content;
}

export function setupContentObserver(callback) {
  // Delay initial scrape for SPAs
  let initialContent = null;

  setTimeout(() => {
    initialContent = scrapePageContent();
    callback(initialContent);
  }, 1000);

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    const newContent = scrapePageContent();

    // Only callback if content changed significantly
    if (initialContent && newContent.body !== initialContent.body) {
      initialContent = newContent;
      callback(newContent);
    }
  });

  // Observe main content areas
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer;
}
