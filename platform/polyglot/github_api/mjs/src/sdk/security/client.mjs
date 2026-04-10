/**
 * GitHub Security SDK client.
 * Provides methods for security analysis, vulnerability alerts, and repository rulesets.
 * @module sdk/security/client
 */

import { createLogger } from '../client.mjs';
import { validateUsername, validateRepositoryName } from '../validation.mjs';

/**
 * Client for GitHub Security API operations.
 */
export class SecurityClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('security');
  }

  /**
   * Get security and analysis settings for a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').SecurityAnalysis>}
   */
  async getSecurityAnalysis(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting security analysis', { owner, repo });
    // Security analysis is part of the repo object; fetch repo and extract
    const repoData = await this.client.get(`/repos/${owner}/${repo}`);
    return {
      advanced_security: repoData.security_and_analysis?.advanced_security || { status: 'disabled' },
      secret_scanning: repoData.security_and_analysis?.secret_scanning || { status: 'disabled' },
      secret_scanning_push_protection:
        repoData.security_and_analysis?.secret_scanning_push_protection || { status: 'disabled' },
    };
  }

  /**
   * Update security and analysis settings for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} data - Security settings to update
   * @returns {Promise<Object>}
   */
  async updateSecurityAnalysis(owner, repo, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Updating security analysis', { owner, repo });
    return this.client.patch(`/repos/${owner}/${repo}`, {
      security_and_analysis: data,
    });
  }

  /**
   * Get vulnerability alerts status for a repository.
   * Returns 204 if enabled, 404 if disabled.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<{enabled: boolean}>}
   */
  async getVulnerabilityAlerts(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting vulnerability alerts', { owner, repo });
    try {
      await this.client.get(`/repos/${owner}/${repo}/vulnerability-alerts`);
      return { enabled: true };
    } catch (err) {
      if (err.status === 404) {
        return { enabled: false };
      }
      throw err;
    }
  }

  /**
   * Enable vulnerability alerts for a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async enableVulnerabilityAlerts(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Enabling vulnerability alerts', { owner, repo });
    return this.client.put(`/repos/${owner}/${repo}/vulnerability-alerts`);
  }

  /**
   * Disable vulnerability alerts for a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async disableVulnerabilityAlerts(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Disabling vulnerability alerts', { owner, repo });
    return this.client.delete(`/repos/${owner}/${repo}/vulnerability-alerts`);
  }

  /**
   * List repository rulesets.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').Ruleset[]>}
   */
  async listRulesets(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing rulesets', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/rulesets`);
  }

  /**
   * Get a specific ruleset.
   * @param {string} owner
   * @param {string} repo
   * @param {number} rulesetId
   * @returns {Promise<import('./types.mjs').Ruleset>}
   */
  async getRuleset(owner, repo, rulesetId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting ruleset', { owner, repo, rulesetId });
    return this.client.get(`/repos/${owner}/${repo}/rulesets/${rulesetId}`);
  }

  /**
   * Create a repository ruleset.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} data - Ruleset configuration
   * @returns {Promise<import('./types.mjs').Ruleset>}
   */
  async createRuleset(owner, repo, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating ruleset', { owner, repo, name: data.name });
    return this.client.post(`/repos/${owner}/${repo}/rulesets`, data);
  }

  /**
   * Update a repository ruleset.
   * @param {string} owner
   * @param {string} repo
   * @param {number} rulesetId
   * @param {Object} data - Updated ruleset configuration
   * @returns {Promise<import('./types.mjs').Ruleset>}
   */
  async updateRuleset(owner, repo, rulesetId, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Updating ruleset', { owner, repo, rulesetId });
    return this.client.put(
      `/repos/${owner}/${repo}/rulesets/${rulesetId}`,
      data,
    );
  }

  /**
   * Delete a repository ruleset.
   * @param {string} owner
   * @param {string} repo
   * @param {number} rulesetId
   * @returns {Promise<Object>}
   */
  async deleteRuleset(owner, repo, rulesetId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting ruleset', { owner, repo, rulesetId });
    return this.client.delete(`/repos/${owner}/${repo}/rulesets/${rulesetId}`);
  }
}
