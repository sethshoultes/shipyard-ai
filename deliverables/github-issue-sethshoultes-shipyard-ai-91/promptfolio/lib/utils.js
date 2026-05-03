/**
 * Shared Utilities
 *
 * Common helpers used across the Promptfolio codebase.
 */

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

/**
 * Generates a UUID v4
 * @returns {string}
 */
export function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for Node.js environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates if content is valid JSON
 * @param {string} content
 * @returns {boolean}
 */
export function isValidJSONFile(content) {
  if (!content || typeof content !== 'string') {
    return false;
  }
  try {
    JSON.parse(content);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if file size is under the limit
 * @param {number} size - File size in bytes
 * @returns {boolean}
 */
export function isUnderSizeLimit(size) {
  return size <= FILE_SIZE_LIMIT;
}

/**
 * Gets the file size limit in bytes
 * @returns {number}
 */
export function getFileSizeLimit() {
  return FILE_SIZE_LIMIT;
}

/**
 * Decodes base64 string to Buffer
 * @param {string} base64 - Base64 encoded string (may include data: prefix)
 * @returns {Buffer}
 */
export function decodeBase64ToBuffer(base64) {
  if (!base64) {
    return Buffer.alloc(0);
  }

  // Handle data URLs (data:image/png;base64,...)
  const match = base64.match(/^data:.*?;base64,(.+)$/);
  const data = match ? match[1] : base64;

  // Validate base64 format
  if (!/^[A-Za-z0-9+/=]+$/.test(data)) {
    throw new Error('Invalid base64 data');
  }

  return Buffer.from(data, 'base64');
}

/**
 * Formats bytes to human-readable string
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${units[i]}`;
}

/**
 * Escapes HTML special characters
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Formats a date to locale string
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return 'Unknown date';
  }
}

/**
 * Truncates string to max length with ellipsis
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Extracts file extension from filename
 * @param {string} filename
 * @returns {string}
 */
export function getFileExtension(filename) {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/**
 * Sanitizes filename for safe storage
 * @param {string} filename
 * @returns {string}
 */
export function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}
