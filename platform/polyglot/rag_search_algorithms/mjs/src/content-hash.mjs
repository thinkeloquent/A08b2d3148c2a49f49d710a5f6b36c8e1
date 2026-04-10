/**
 * @fileoverview Content hashing for deduplication.
 */

import { createHash } from 'node:crypto';

/**
 * Return MD5 hex digest of text content.
 * @param {string} text
 * @returns {string}
 */
export function contentHash(text) {
  return createHash('md5').update(text).digest('hex');
}
