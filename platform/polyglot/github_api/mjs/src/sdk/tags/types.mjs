/**
 * JSDoc type definitions for tag and release operations.
 * @module sdk/tags/types
 */

/**
 * @typedef {Object} Tag
 * @property {string} name
 * @property {string} zipball_url
 * @property {string} tarball_url
 * @property {Object} commit
 * @property {string} commit.sha
 * @property {string} commit.url
 * @property {string} node_id
 */

/**
 * @typedef {Object} Release
 * @property {number} id
 * @property {string} tag_name
 * @property {string} target_commitish
 * @property {string} name
 * @property {string} body
 * @property {boolean} draft
 * @property {boolean} prerelease
 * @property {string} created_at
 * @property {string} published_at
 * @property {Object} author
 * @property {string} html_url
 * @property {Object[]} assets
 */

/**
 * @typedef {Object} TagProtection
 * @property {number} id
 * @property {string} pattern
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} SemanticVersion
 * @property {number} major
 * @property {number} minor
 * @property {number} patch
 * @property {string} [prerelease]
 * @property {string} raw - Original string
 */

export default {};
