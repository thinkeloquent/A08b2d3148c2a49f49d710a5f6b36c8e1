/**
 * GitHub Collaborators SDK client.
 * Provides methods for managing repository collaborators, invitations, and permissions.
 * @module sdk/collaborators/client
 */

import { createLogger } from '../client.mjs';
import { validateUsername, validateRepositoryName } from '../validation.mjs';
import { ValidationError } from '../errors.mjs';

/**
 * Permission hierarchy from lowest to highest.
 * @type {string[]}
 */
const PERMISSION_HIERARCHY = [
  'none',
  'pull',
  'triage',
  'push',
  'maintain',
  'admin',
];

/**
 * Client for GitHub Collaborator API operations.
 */
export class CollaboratorsClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('collaborators');
  }

  /**
   * List collaborators for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {string} [options.affiliation] - 'outside' | 'direct' | 'all'
   * @param {string} [options.permission] - Filter by permission level
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Collaborator[]>}
   */
  async list(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing collaborators', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/collaborators`, {
      params: options,
    });
  }

  /**
   * Add a collaborator to a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {string} username - Collaborator to add
   * @param {string} [permission='push'] - Permission level
   * @returns {Promise<Object>}
   */
  async add(owner, repo, username, permission = 'push') {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateUsername(username);

    if (!PERMISSION_HIERARCHY.includes(permission)) {
      throw new ValidationError(
        `Invalid permission level: ${permission}. Must be one of: ${PERMISSION_HIERARCHY.join(', ')}`,
      );
    }

    this.log.info('Adding collaborator', { owner, repo, username, permission });
    return this.client.put(
      `/repos/${owner}/${repo}/collaborators/${username}`,
      { permission },
    );
  }

  /**
   * Remove a collaborator from a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {string} username
   * @returns {Promise<Object>}
   */
  async remove(owner, repo, username) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateUsername(username);
    this.log.info('Removing collaborator', { owner, repo, username });
    return this.client.delete(
      `/repos/${owner}/${repo}/collaborators/${username}`,
    );
  }

  /**
   * Check a collaborator's permission level.
   * @param {string} owner
   * @param {string} repo
   * @param {string} username
   * @returns {Promise<Object>} Permission details
   */
  async checkPermission(owner, repo, username) {
    validateUsername(owner);
    validateRepositoryName(repo);
    validateUsername(username);
    this.log.debug('Checking permission', { owner, repo, username });
    return this.client.get(
      `/repos/${owner}/${repo}/collaborators/${username}/permission`,
    );
  }

  /**
   * Check if a user has at least the required permission level.
   * Uses the permission hierarchy: none < pull < triage < push < maintain < admin.
   * @param {string} owner
   * @param {string} repo
   * @param {string} username
   * @param {string} requiredLevel - Minimum required permission
   * @returns {Promise<boolean>}
   */
  async hasPermission(owner, repo, username, requiredLevel) {
    const result = await this.checkPermission(owner, repo, username);
    const userLevel = result.permission || 'none';

    const userIndex = PERMISSION_HIERARCHY.indexOf(userLevel);
    const requiredIndex = PERMISSION_HIERARCHY.indexOf(requiredLevel);

    if (requiredIndex === -1) {
      throw new ValidationError(`Unknown permission level: ${requiredLevel}`);
    }

    this.log.debug('Permission check result', {
      username,
      userLevel,
      requiredLevel,
      hasPermission: userIndex >= requiredIndex,
    });

    return userIndex >= requiredIndex;
  }

  /**
   * List repository invitations.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').Invitation[]>}
   */
  async listInvitations(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing invitations', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/invitations`);
  }

  /**
   * Update a repository invitation's permission.
   * @param {string} owner
   * @param {string} repo
   * @param {number} invitationId
   * @param {string} permission - New permission level
   * @returns {Promise<import('./types.mjs').Invitation>}
   */
  async updateInvitation(owner, repo, invitationId, permission) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Updating invitation', { owner, repo, invitationId, permission });
    return this.client.patch(
      `/repos/${owner}/${repo}/invitations/${invitationId}`,
      { permissions: permission },
    );
  }

  /**
   * Delete (revoke) a repository invitation.
   * @param {string} owner
   * @param {string} repo
   * @param {number} invitationId
   * @returns {Promise<Object>}
   */
  async deleteInvitation(owner, repo, invitationId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Deleting invitation', { owner, repo, invitationId });
    return this.client.delete(
      `/repos/${owner}/${repo}/invitations/${invitationId}`,
    );
  }

  /**
   * Add multiple collaborators sequentially, collecting per-user results.
   * @param {string} owner
   * @param {string} repo
   * @param {Array<{username: string, permission?: string}>} users
   * @returns {Promise<Array<{username: string, success: boolean, error?: string}>>}
   */
  async bulkAdd(owner, repo, users) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Bulk adding collaborators', {
      owner,
      repo,
      count: users.length,
    });

    const results = [];

    for (const user of users) {
      try {
        await this.add(owner, repo, user.username, user.permission || 'push');
        results.push({ username: user.username, success: true });
      } catch (err) {
        this.log.error(`Failed to add collaborator ${user.username}`, {
          error: err.message,
        });
        results.push({
          username: user.username,
          success: false,
          error: err.message,
        });
      }
    }

    return results;
  }

  /**
   * Get collaborator statistics for a repository.
   * Aggregates counts by permission level.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async getStats(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting collaborator stats', { owner, repo });

    const collaborators = await this.list(owner, repo, {
      affiliation: 'all',
      per_page: 100,
    });

    const stats = {
      total: collaborators.length,
      byPermission: {},
    };

    for (const level of PERMISSION_HIERARCHY) {
      stats.byPermission[level] = 0;
    }

    for (const collab of collaborators) {
      const perm = collab.role_name || 'none';
      if (stats.byPermission[perm] !== undefined) {
        stats.byPermission[perm]++;
      }
    }

    return stats;
  }
}
