/**
 * SPARK System Prompt Template
 * Builds the system prompt with page content
 */

export function buildSystemPrompt(context) {
  const { title, description, body } = context;

  const pageContent = `
Title: ${title}
Description: ${description}

Content:
${body}
  `.trim();

  return `You are a helpful assistant for this website. Answer questions based ONLY on the page content provided below. Be concise, friendly, and helpful.

If you don't know the answer from the provided content, say: "I don't see that information on this page. You might want to contact the site owner directly."

Never make up information. Never discuss topics unrelated to the page content.

PAGE CONTENT:
${pageContent}`;
}
