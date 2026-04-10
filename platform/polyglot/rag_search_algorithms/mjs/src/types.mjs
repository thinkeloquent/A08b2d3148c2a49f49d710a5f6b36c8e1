/**
 * @fileoverview JSDoc type definitions for search algorithms.
 */

/**
 * @typedef {Object} SearchResult
 * @property {string} content
 * @property {Record<string, any>} metadata
 * @property {number} score
 */

/**
 * @typedef {Object} FusedResult
 * @property {string} contentHash
 * @property {number} score
 */

/**
 * @typedef {Object} SeparationResult
 * @property {string[]} codeParts
 * @property {string[]} textParts
 */

/**
 * @typedef {Object} ProcessedResult
 * @property {string} content
 * @property {string[]} codeParts
 * @property {string[]} textParts
 * @property {Record<string, any>} metadata
 * @property {number} score
 */

/**
 * @typedef {Object} PostProcessedResults
 * @property {string[]} components
 * @property {ProcessedResult[]} results
 */

export {};
