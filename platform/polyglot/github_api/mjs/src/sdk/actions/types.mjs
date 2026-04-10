/**
 * JSDoc type definitions for GitHub Actions operations.
 * @module sdk/actions/types
 */

/**
 * @typedef {Object} WorkflowRun
 * @property {number} id
 * @property {string} name
 * @property {string} node_id
 * @property {string} head_branch
 * @property {string} head_sha
 * @property {string} status - queued, in_progress, completed, waiting, requested, pending
 * @property {string|null} conclusion - success, failure, cancelled, skipped, timed_out, action_required, neutral, stale, startup_failure, null
 * @property {number} workflow_id
 * @property {number} run_number
 * @property {number} run_attempt
 * @property {string} event
 * @property {string} display_title
 * @property {string} html_url
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string|null} run_started_at
 * @property {string} jobs_url
 * @property {string} logs_url
 * @property {string} artifacts_url
 * @property {Object} actor
 * @property {Object} repository
 * @property {Object} head_commit
 */

/**
 * @typedef {Object} WorkflowJob
 * @property {number} id
 * @property {number} run_id
 * @property {string} name
 * @property {string} node_id
 * @property {string} head_sha
 * @property {string} status - queued, in_progress, completed, waiting, pending
 * @property {string|null} conclusion - success, failure, cancelled, skipped, timed_out, action_required, neutral, null
 * @property {string} started_at
 * @property {string|null} completed_at
 * @property {string} html_url
 * @property {Object[]} steps
 * @property {string[]} labels
 * @property {number} runner_id
 * @property {string} runner_name
 * @property {number} runner_group_id
 * @property {string} runner_group_name
 * @property {string} workflow_name
 */

/**
 * @typedef {Object} WorkflowJobStep
 * @property {string} name
 * @property {string} status
 * @property {string|null} conclusion
 * @property {number} number
 * @property {string|null} started_at
 * @property {string|null} completed_at
 */

/**
 * @typedef {Object} Artifact
 * @property {number} id
 * @property {string} node_id
 * @property {string} name
 * @property {number} size_in_bytes
 * @property {string} archive_download_url
 * @property {boolean} expired
 * @property {string} created_at
 * @property {string|null} expires_at
 * @property {string} updated_at
 */

/**
 * @typedef {Object} Workflow
 * @property {number} id
 * @property {string} node_id
 * @property {string} name
 * @property {string} path
 * @property {string} state - active, deleted, disabled_fork, disabled_inactivity, disabled_manually, unknown
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} html_url
 * @property {string} badge_url
 */

/**
 * @typedef {Object} WorkflowDispatchRequest
 * @property {string} ref - Branch or tag name to dispatch against
 * @property {Object} [inputs] - Key/value pairs of workflow input parameters
 */

export default {};
