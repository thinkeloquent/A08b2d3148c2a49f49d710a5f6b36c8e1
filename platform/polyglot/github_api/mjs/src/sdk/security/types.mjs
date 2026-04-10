/**
 * JSDoc type definitions for security operations.
 * @module sdk/security/types
 */

/**
 * @typedef {Object} SecurityAnalysis
 * @property {Object} advanced_security
 * @property {string} advanced_security.status - 'enabled' | 'disabled'
 * @property {Object} secret_scanning
 * @property {string} secret_scanning.status
 * @property {Object} secret_scanning_push_protection
 * @property {string} secret_scanning_push_protection.status
 */

/**
 * @typedef {Object} VulnerabilityAlerts
 * @property {boolean} enabled
 */

/**
 * @typedef {Object} Ruleset
 * @property {number} id
 * @property {string} name
 * @property {string} target - 'branch' | 'tag'
 * @property {string} source_type
 * @property {string} source
 * @property {string} enforcement - 'disabled' | 'active' | 'evaluate'
 * @property {RulesetCondition} [conditions]
 * @property {Object[]} rules
 * @property {string} created_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} RulesetCondition
 * @property {Object} [ref_name]
 * @property {string[]} [ref_name.include]
 * @property {string[]} [ref_name.exclude]
 */

export default {};
