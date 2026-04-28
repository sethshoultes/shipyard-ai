/**
 * parser.js — Cut (Changelog Theatre)
 *
 * Strict parser for WordPress readme.txt changelog format.
 * Input: raw text. Output: structured array of {version, date, bullets}.
 */

(function (global) {
  'use strict';

  const FORMAT_EXAMPLE = [
    '== Changelog ==',
    '',
    '= 1.0 =',
    '* First release.',
    '',
    '= 1.1 =',
    '* Fixed a bug.',
    '* Added a feature.'
  ].join('\n');

  /**
   * Parse a WordPress readme.txt changelog.
   *
   * @param {string} text — raw changelog text
   * @returns {Array}     — [{ version, date, bullets }]
   * @throws {Error}      — on malformed input
   */
  function parseChangelog(text) {
    if (typeof text !== 'string') {
      throw new Error('parseChangelog expects a string. Received: ' + typeof text);
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      throw new Error('Your changelog does not match the expected format. Here is an example.\n\n' + FORMAT_EXAMPLE);
    }

    // Find the == Changelog == section
    const changelogRegex = /==\s*Changelog\s*==/i;
    if (!changelogRegex.test(trimmed)) {
      throw new Error('Your changelog does not match the expected format. Here is an example.\n\n' + FORMAT_EXAMPLE);
    }

    // Extract everything after the Changelog header
    const parts = trimmed.split(changelogRegex);
    const body = parts[parts.length - 1].trim();

    if (body.length === 0) {
      throw new Error('Your changelog does not match the expected format. Here is an example.\n\n' + FORMAT_EXAMPLE);
    }

    // Split into version blocks
    // WordPress version line: = 1.0 = or = 1.0 (2023-01-01) =
    const lines = body.split('\n');
    const entries = [];
    let currentEntry = null;

    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i];
      const line = rawLine.replace(/\r/g, '').trimEnd();

      if (line.length === 0) continue;

      // Detect version line: = X.Y.Z = or = X.Y.Z (date) =
      const versionMatch = line.match(/^=\s*(.+?)\s*=$/);
      if (versionMatch) {
        if (currentEntry) {
          entries.push(currentEntry);
        }
        const versionContent = versionMatch[1].trim();
        // Try to extract date from parentheses: 1.0 (2023-01-01)
        const dateMatch = versionContent.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
        if (dateMatch) {
          currentEntry = {
            version: dateMatch[1].trim(),
            date: dateMatch[2].trim(),
            bullets: [],
          };
        } else {
          currentEntry = {
            version: versionContent,
            date: '',
            bullets: [],
          };
        }
        continue;
      }

      // Detect bullet line: * bullet or - bullet
      const bulletMatch = line.match(/^[*\-]\s*(.+)$/);
      if (bulletMatch && currentEntry) {
        currentEntry.bullets.push(bulletMatch[1].trim());
        continue;
      }

      // If we encounter a line that is neither a version header nor a bullet
      // and we are inside a version block, treat it as a continuation of the
      // previous bullet (multi-line bullet) if the previous line was a bullet.
      // Otherwise, it is malformed.
      if (currentEntry && currentEntry.bullets.length > 0) {
        // Append to last bullet
        const lastIdx = currentEntry.bullets.length - 1;
        currentEntry.bullets[lastIdx] += ' ' + line.trim();
      } else {
        // Malformed line outside of version context
        throw new Error('Your changelog does not match the expected format. Here is an example.\n\n' + FORMAT_EXAMPLE);
      }
    }

    if (currentEntry) {
      entries.push(currentEntry);
    }

    if (entries.length === 0) {
      throw new Error('Your changelog does not match the expected format. Here is an example.\n\n' + FORMAT_EXAMPLE);
    }

    return entries;
  }

  // Expose
  global.CutParser = {
    parse: parseChangelog,
  };

})(window);
