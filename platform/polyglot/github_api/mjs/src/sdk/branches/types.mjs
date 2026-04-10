/**
 * JSDoc type definitions for branch operations.
 * @module sdk/branches/types
 */

/**
 * @typedef {Object} Branch
 * @property {string} name
 * @property {Object} commit
 * @property {string} commit.sha
 * @property {string} commit.url
 * @property {boolean} protected
 */

/**
 * @typedef {Object} BranchProtection
 * @property {string} url
 * @property {RequiredStatusChecks} [required_status_checks]
 * @property {RequiredPullRequestReviews} [required_pull_request_reviews]
 * @property {boolean} [enforce_admins]
 * @property {PushRestrictions} [restrictions]
 * @property {boolean} [required_linear_history]
 * @property {boolean} [allow_force_pushes]
 * @property {boolean} [allow_deletions]
 * @property {boolean} [required_conversation_resolution]
 */

/**
 * @typedef {Object} RequiredStatusChecks
 * @property {boolean} strict - Require up-to-date branches
 * @property {string[]} contexts - Status check names
 * @property {Array<{app_id: number, context: string}>} [checks]
 */

/**
 * @typedef {Object} RequiredPullRequestReviews
 * @property {Object} [dismissal_restrictions]
 * @property {boolean} [dismiss_stale_reviews]
 * @property {boolean} [require_code_owner_reviews]
 * @property {number} [required_approving_review_count]
 * @property {boolean} [require_last_push_approval]
 */

/**
 * @typedef {Object} PushRestrictions
 * @property {Object[]} [users]
 * @property {Object[]} [teams]
 * @property {Object[]} [apps]
 */

/**
 * @typedef {Object} ProtectionTemplate
 * @property {RequiredStatusChecks} [required_status_checks]
 * @property {boolean} [enforce_admins]
 * @property {RequiredPullRequestReviews} [required_pull_request_reviews]
 * @property {PushRestrictions} [restrictions]
 * @property {boolean} [required_linear_history]
 * @property {boolean} [allow_force_pushes]
 * @property {boolean} [allow_deletions]
 */

export default {};
