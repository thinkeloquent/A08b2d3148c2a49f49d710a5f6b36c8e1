/**
 * @module utils/adf
 * @description Atlassian Document Format (ADF) v1 builder utilities.
 * Converts plain text to ADF structure required by Jira Cloud REST API v3.
 */

/**
 * Convert plain text to an ADF v1 document.
 * @param {string} text
 * @returns {object|null} ADF document
 */
export function textToAdf(text) {
  if (!text) return null;
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: String(text) },
        ],
      },
    ],
  };
}

/**
 * Wrap text in an ADF comment body.
 * @param {string} text
 * @returns {object|null} ADF comment body
 */
export function commentToAdf(text) {
  const doc = textToAdf(text);
  if (!doc) return null;
  return { body: doc };
}
