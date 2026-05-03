/**
 * Claude Export JSON Parser
 *
 * Transforms Claude conversation export JSON files into structured Portfolio objects.
 * Handles defensive parsing with multiple fallback strategies for schema drift.
 */

import { validateClaudeExport } from './schema.js';

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

/**
 * Parses a Claude conversation export file
 * @param {string} content - Raw file content
 * @param {number} fileSize - Size of the file in bytes
 * @returns {Portfolio} Parsed portfolio object
 * @throws {Error} On parse failure
 */
export function parseClaudeExport(content, fileSize = 0) {
  // Enforce size cap
  if (fileSize > FILE_SIZE_LIMIT) {
    throw new Error('File exceeds 5 MB limit. Please export a smaller conversation.');
  }

  if (!content || content.trim() === '') {
    throw new Error('Empty file. Please upload a valid Claude export.');
  }

  // Try direct JSON parse first
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    // Try stripping markdown fences
    const stripped = stripMarkdownFences(content);
    try {
      data = JSON.parse(stripped);
    } catch (e2) {
      // Try recursive brace extraction
      const extracted = extractJsonBlock(content);
      if (extracted) {
        try {
          data = JSON.parse(extracted);
        } catch (e3) {
          // Fall through to raw text fallback
          data = null;
        }
      }
    }
  }

  // If we have data, validate and parse
  if (data) {
    const validation = validateClaudeExport(data);
    if (validation.valid) {
      return extractPortfolio(data);
    }
    // Schema validation failed but we have JSON - try to extract what we can
    const partialExtract = extractPartialPortfolio(data);
    if (partialExtract.prompts.length > 0) {
      return partialExtract;
    }
  }

  // Raw text fallback - render as plain text blocks
  return createRawTextPortfolio(content);
}

/**
 * Strips markdown code fences from content
 * @param {string} content
 * @returns {string}
 */
function stripMarkdownFences(content) {
  // Match ```json ... ``` or ``` ... ```
  const fenceRegex = /^```(?:json)?\s*([\s\S]*?)```$/m;
  const match = content.match(fenceRegex);
  if (match && match[1]) {
    return match[1].trim();
  }
  return content;
}

/**
 * Extracts the first JSON-like block using brace matching
 * @param {string} content
 * @returns {string|null}
 */
function extractJsonBlock(content) {
  const startIdx = content.indexOf('{');
  if (startIdx === -1) return null;

  let braceCount = 0;
  let inString = false;
  let escape = false;

  for (let i = startIdx; i < content.length; i++) {
    const char = content[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      continue;
    }

    if (char === '"' && !escape) {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') braceCount++;
      if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          return content.substring(startIdx, i + 1);
        }
      }
    }
  }

  return null;
}

/**
 * Extracts a structured Portfolio from validated Claude export data
 * @param {object} data - Validated Claude export
 * @returns {Portfolio}
 */
function extractPortfolio(data) {
  const conversation = data.conversation;
  const messages = conversation.messages || [];

  const prompts = [];
  const images = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const content = normalizeContent(msg.content);

    // Extract images from content
    const extractedImages = extractImagesFromContent(msg.content, msg.role, i);
    images.push(...extractedImages);

    // Create prompt entry for user messages (the prompts)
    if (msg.role === 'user' && content.trim()) {
      prompts.push({
        id: `prompt-${i}`,
        title: generatePromptTitle(content, i),
        body: content,
        role: 'user',
        timestamp: conversation.created_at || new Date().toISOString(),
        imageIds: extractedImages.map(img => img.id)
      });
    }

    // Create response entry for assistant messages
    if (msg.role === 'assistant' && content.trim()) {
      prompts.push({
        id: `response-${i}`,
        title: `Response ${i}`,
        body: content,
        role: 'assistant',
        timestamp: conversation.created_at || new Date().toISOString(),
        imageIds: []
      });
    }
  }

  return {
    id: conversation.id || generateUUID(),
    title: conversation.title || 'Untitled Portfolio',
    createdAt: conversation.created_at || new Date().toISOString(),
    prompts,
    images
  };
}

/**
 * Normalizes content to string format
 * @param {string|Array} content
 * @returns {string}
 */
function normalizeContent(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') return item;
        if (item.type === 'text') return item.text || '';
        if (item.type === 'image') return '[Image]';
        return '';
      })
      .join('\n\n');
  }

  return String(content || '');
}

/**
 * Extracts image data from message content
 * @param {string|Array} content
 * @param {string} role
 * @param {number} index
 * @returns {Array<{id: string, data: string, mediaType: string, filename: string}>}
 */
function extractImagesFromContent(content, role, index) {
  const images = [];

  if (Array.isArray(content)) {
    content.forEach((item, idx) => {
      if (item.type === 'image' && item.source) {
        const mediaType = item.source.media_type || 'image/png';
        const ext = mediaType.split('/')[1] || 'png';
        images.push({
          id: `img-${index}-${idx}`,
          data: item.source.data,
          mediaType,
          filename: `image-${index}-${idx}.${ext}`
        });
      }
    });
  }

  return images;
}

/**
 * Generates a title from prompt content
 * @param {string} content
 * @param {number} index
 * @returns {string}
 */
function generatePromptTitle(content, index) {
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 0) {
    const truncated = firstLine.length > 60 ? firstLine.substring(0, 57) + '...' : firstLine;
    return truncated;
  }
  return `Prompt ${index + 1}`;
}

/**
 * Extracts what it can from partially valid data
 * @param {object} data
 * @returns {Portfolio}
 */
function extractPartialPortfolio(data) {
  const prompts = [];

  // Try to find any messages-like structure
  function findMessages(obj, path = '') {
    if (!obj || typeof obj !== 'object') return null;

    if (Array.isArray(obj.messages)) {
      return obj.messages;
    }

    for (const key of Object.keys(obj)) {
      const found = findMessages(obj[key], `${path}.${key}`);
      if (found) return found;
    }

    return null;
  }

  const messages = findMessages(data);
  if (messages && messages.length > 0) {
    messages.forEach((msg, idx) => {
      const content = normalizeContent(msg.content || msg.text || '');
      if (content.trim()) {
        prompts.push({
          id: `partial-${idx}`,
          title: generatePromptTitle(content, idx),
          body: content,
          role: msg.role || 'unknown',
          timestamp: new Date().toISOString(),
          imageIds: []
        });
      }
    });
  }

  return {
    id: generateUUID(),
    title: 'Imported Portfolio',
    createdAt: new Date().toISOString(),
    prompts,
    images: []
  };
}

/**
 * Creates a raw text portfolio as last-resort fallback
 * @param {string} content
 * @returns {Portfolio}
 */
function createRawTextPortfolio(content) {
  // Split by double newlines to create rough blocks
  const blocks = content.split(/\n\n+/).filter(b => b.trim().length > 0);

  const prompts = blocks.map((block, idx) => ({
    id: `raw-${idx}`,
    title: `Block ${idx + 1}`,
    body: block.trim(),
    role: 'unknown',
    timestamp: new Date().toISOString(),
    imageIds: []
  }));

  return {
    id: generateUUID(),
    title: 'Raw Text Import',
    createdAt: new Date().toISOString(),
    prompts,
    images: []
  };
}

/**
 * Generates a UUID v4
 * @returns {string}
 */
function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for Node.js < 19
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * @typedef {Object} Portfolio
 * @property {string} id - Unique portfolio identifier
 * @property {string} title - Portfolio title
 * @property {string} createdAt - ISO timestamp
 * @property {Array<Prompt>} prompts - Array of prompt/response entries
 * @property {Array<Image>} images - Array of extracted images
 */

/**
 * @typedef {Object} Prompt
 * @property {string} id - Unique prompt identifier
 * @property {string} title - Prompt title (first line or generated)
 * @property {string} body - Full prompt/response content
 * @property {string} role - 'user', 'assistant', or 'unknown'
 * @property {string} timestamp - ISO timestamp
 * @property {Array<string>} imageIds - Associated image IDs
 */

/**
 * @typedef {Object} Image
 * @property {string} id - Unique image identifier
 * @property {string} data - Base64 image data
 * @property {string} mediaType - MIME type (e.g., 'image/png')
 * @property {string} filename - Suggested filename
 */
