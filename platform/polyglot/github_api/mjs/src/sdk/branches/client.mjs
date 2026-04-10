/**
 * GitHub Branches SDK client.
 * Provides methods for branch CRUD, protection, merge, compare, and rename operations.
 * @module sdk/branches/client
 */

import { createLogger } from '../client.mjs';
import {
  validateUsername,
  validateRepositoryName,
  validateBranchName,
} from '../validation.mjs';

/**
 * Client for GitHub Branch API operations.
 */
export class BranchesClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('branches');
  }

  /**
   * List branches for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {boolean} [options.protected] - Filter by protected status
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Branch[]>}
   */
  async list(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing branches', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/branches`, {
      params: options,
    });
  }

  /**
   * Get a single branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch - Branch name
   * @returns {Promise<import('./types.mjs').Branch>}
   */
  async get(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting branch', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
    );
  }

  /**
   * Get branch protection rules.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<import('./types.mjs').BranchProtection>}
   */
  async getProtection(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting branch protection', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection`,
    );
  }

  /**
   * Update branch protection rules.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {Object} data - Protection configuration
   * @returns {Promise<import('./types.mjs').BranchProtection>}
   */
  async updateProtection(owner, repo, branch, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Updating branch protection', { owner, repo, branch });
    return this.client.put(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection`,
      data,
    );
  }

  /**
   * Remove branch protection.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async removeProtection(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.warn('Removing branch protection', { owner, repo, branch });
    return this.client.delete(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection`,
    );
  }

  /**
   * Get required status checks for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<import('./types.mjs').RequiredStatusChecks>}
   */
  async getStatusChecks(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting status checks', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/required_status_checks`,
    );
  }

  /**
   * Update required status checks for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {Object} data
   * @returns {Promise<import('./types.mjs').RequiredStatusChecks>}
   */
  async updateStatusChecks(owner, repo, branch, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Updating status checks', { owner, repo, branch });
    return this.client.patch(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/required_status_checks`,
      data,
    );
  }

  /**
   * Get pull request review protection.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<import('./types.mjs').RequiredPullRequestReviews>}
   */
  async getReviewProtection(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting review protection', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/required_pull_request_reviews`,
    );
  }

  /**
   * Update pull request review protection.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {Object} data
   * @returns {Promise<import('./types.mjs').RequiredPullRequestReviews>}
   */
  async updateReviewProtection(owner, repo, branch, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Updating review protection', { owner, repo, branch });
    return this.client.patch(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/required_pull_request_reviews`,
      data,
    );
  }

  /**
   * Delete pull request review protection.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async deleteReviewProtection(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.warn('Deleting review protection', { owner, repo, branch });
    return this.client.delete(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/required_pull_request_reviews`,
    );
  }

  /**
   * Get admin enforcement status for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async getAdminEnforcement(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting admin enforcement', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/enforce_admins`,
    );
  }

  /**
   * Enable admin enforcement for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async setAdminEnforcement(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Setting admin enforcement', { owner, repo, branch });
    return this.client.post(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/enforce_admins`,
    );
  }

  /**
   * Remove admin enforcement for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async removeAdminEnforcement(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.warn('Removing admin enforcement', { owner, repo, branch });
    return this.client.delete(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/enforce_admins`,
    );
  }

  /**
   * Get push restrictions for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<import('./types.mjs').PushRestrictions>}
   */
  async getPushRestrictions(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Getting push restrictions', { owner, repo, branch });
    return this.client.get(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/restrictions`,
    );
  }

  /**
   * Update push restrictions for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @param {Object} data
   * @returns {Promise<import('./types.mjs').PushRestrictions>}
   */
  async updatePushRestrictions(owner, repo, branch, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.info('Updating push restrictions', { owner, repo, branch });
    return this.client.put(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/restrictions`,
      data,
    );
  }

  /**
   * Delete push restrictions for a protected branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch
   * @returns {Promise<Object>}
   */
  async deletePushRestrictions(owner, repo, branch) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    this.log.warn('Deleting push restrictions', { owner, repo, branch });
    return this.client.delete(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/protection/restrictions`,
    );
  }

  /**
   * Rename a branch.
   * @param {string} owner
   * @param {string} repo
   * @param {string} branch - Current branch name
   * @param {string} newName - New branch name
   * @returns {Promise<import('./types.mjs').Branch>}
   */
  async rename(owner, repo, branch, newName) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateBranchName(branch);
    validateBranchName(newName);
    this.log.info('Renaming branch', { owner, repo, branch, newName });
    return this.client.post(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}/rename`,
      { new_name: newName },
    );
  }

  /**
   * Merge a branch (or ref) into another.
   * @param {string} owner
   * @param {string} repo
   * @param {string} base - Base branch to merge into
   * @param {string} head - Head branch or SHA to merge
   * @param {Object} [options]
   * @param {string} [options.commit_message] - Custom merge commit message
   * @returns {Promise<Object>} Merge commit info
   */
  async merge(owner, repo, base, head, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Merging branches', { owner, repo, base, head });
    return this.client.post(`/repos/${owner}/${repo}/merges`, {
      base,
      head,
      ...options,
    });
  }

  /**
   * Compare two branches, tags, or commits.
   * @param {string} owner
   * @param {string} repo
   * @param {string} base - Base ref
   * @param {string} head - Head ref
   * @returns {Promise<Object>} Comparison result
   */
  async compare(owner, repo, base, head) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Comparing refs', { owner, repo, base, head });
    return this.client.get(
      `/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`,
    );
  }

  /**
   * Create a branch protection template (builder pattern).
   * Returns a plain object that can be passed to updateProtection().
   * @param {Object} [options]
   * @param {boolean} [options.requireStatusChecks=false]
   * @param {string[]} [options.statusCheckContexts=[]]
   * @param {boolean} [options.strictStatusChecks=false]
   * @param {boolean} [options.requireReviews=false]
   * @param {number} [options.requiredReviewers=1]
   * @param {boolean} [options.dismissStaleReviews=false]
   * @param {boolean} [options.requireCodeOwnerReviews=false]
   * @param {boolean} [options.enforceAdmins=false]
   * @param {boolean} [options.requiredLinearHistory=false]
   * @param {boolean} [options.allowForcePushes=false]
   * @param {boolean} [options.allowDeletions=false]
   * @returns {import('./types.mjs').ProtectionTemplate}
   */
  createProtectionTemplate(options = {}) {
    const {
      requireStatusChecks = false,
      statusCheckContexts = [],
      strictStatusChecks = false,
      requireReviews = false,
      requiredReviewers = 1,
      dismissStaleReviews = false,
      requireCodeOwnerReviews = false,
      enforceAdmins = false,
      requiredLinearHistory = false,
      allowForcePushes = false,
      allowDeletions = false,
    } = options;

    const template = {
      required_status_checks: requireStatusChecks
        ? { strict: strictStatusChecks, contexts: statusCheckContexts }
        : null,
      enforce_admins: enforceAdmins,
      required_pull_request_reviews: requireReviews
        ? {
            dismiss_stale_reviews: dismissStaleReviews,
            require_code_owner_reviews: requireCodeOwnerReviews,
            required_approving_review_count: requiredReviewers,
          }
        : null,
      restrictions: null,
      required_linear_history: requiredLinearHistory,
      allow_force_pushes: allowForcePushes,
      allow_deletions: allowDeletions,
    };

    this.log.debug('Created protection template', template);
    return template;
  }
}
