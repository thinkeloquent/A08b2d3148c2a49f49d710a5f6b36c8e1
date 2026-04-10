/**
 * GitHub Tags and Releases SDK client.
 * Provides methods for tags, releases, tag protection, and semantic versioning utilities.
 * @module sdk/tags/client
 */

import { createLogger } from '../client.mjs';
import { validateUsername, validateRepositoryName } from '../validation.mjs';
import { ValidationError } from '../errors.mjs';

/**
 * Client for GitHub Tags and Releases API operations.
 */
export class TagsClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('tags');
  }

  /**
   * List tags for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Tag[]>}
   */
  async listTags(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing tags', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/tags`, { params: options });
  }

  /**
   * Get a tag by SHA (via the git tag API).
   * @param {string} owner
   * @param {string} repo
   * @param {string} sha - The tag SHA
   * @returns {Promise<Object>}
   */
  async getTag(owner, repo, sha) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting tag', { owner, repo, sha });
    return this.client.get(`/repos/${owner}/${repo}/git/tags/${sha}`);
  }

  /**
   * Create a release.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} data
   * @param {string} data.tag_name - Tag name for the release
   * @param {string} [data.target_commitish] - Commit SHA or branch
   * @param {string} [data.name] - Release name
   * @param {string} [data.body] - Release body/notes
   * @param {boolean} [data.draft=false]
   * @param {boolean} [data.prerelease=false]
   * @param {boolean} [data.generate_release_notes=false]
   * @returns {Promise<import('./types.mjs').Release>}
   */
  async createRelease(owner, repo, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating release', { owner, repo, tag: data.tag_name });
    return this.client.post(`/repos/${owner}/${repo}/releases`, data);
  }

  /**
   * Get a release by ID.
   * @param {string} owner
   * @param {string} repo
   * @param {number} releaseId
   * @returns {Promise<import('./types.mjs').Release>}
   */
  async getRelease(owner, repo, releaseId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting release', { owner, repo, releaseId });
    return this.client.get(`/repos/${owner}/${repo}/releases/${releaseId}`);
  }

  /**
   * Get the latest release.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').Release>}
   */
  async getLatestRelease(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting latest release', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/releases/latest`);
  }

  /**
   * Get a release by tag name.
   * @param {string} owner
   * @param {string} repo
   * @param {string} tag - Tag name
   * @returns {Promise<import('./types.mjs').Release>}
   */
  async getReleaseByTag(owner, repo, tag) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting release by tag', { owner, repo, tag });
    return this.client.get(
      `/repos/${owner}/${repo}/releases/tags/${encodeURIComponent(tag)}`,
    );
  }

  /**
   * Update a release.
   * @param {string} owner
   * @param {string} repo
   * @param {number} releaseId
   * @param {Object} data
   * @returns {Promise<import('./types.mjs').Release>}
   */
  async updateRelease(owner, repo, releaseId, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Updating release', { owner, repo, releaseId });
    return this.client.patch(
      `/repos/${owner}/${repo}/releases/${releaseId}`,
      data,
    );
  }

  /**
   * Delete a release.
   * @param {string} owner
   * @param {string} repo
   * @param {number} releaseId
   * @returns {Promise<Object>}
   */
  async deleteRelease(owner, repo, releaseId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting release', { owner, repo, releaseId });
    return this.client.delete(`/repos/${owner}/${repo}/releases/${releaseId}`);
  }

  /**
   * List releases for a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Release[]>}
   */
  async listReleases(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing releases', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/releases`, {
      params: options,
    });
  }

  /**
   * List tag protection rules.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').TagProtection[]>}
   */
  async listTagProtections(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing tag protections', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/tags/protection`);
  }

  /**
   * Create a tag protection rule.
   * @param {string} owner
   * @param {string} repo
   * @param {string} pattern - Tag name pattern
   * @returns {Promise<import('./types.mjs').TagProtection>}
   */
  async createTagProtection(owner, repo, pattern) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating tag protection', { owner, repo, pattern });
    return this.client.post(`/repos/${owner}/${repo}/tags/protection`, {
      pattern,
    });
  }

  /**
   * Delete a tag protection rule.
   * @param {string} owner
   * @param {string} repo
   * @param {number} protectionId
   * @returns {Promise<Object>}
   */
  async deleteTagProtection(owner, repo, protectionId) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting tag protection', { owner, repo, protectionId });
    return this.client.delete(
      `/repos/${owner}/${repo}/tags/protection/${protectionId}`,
    );
  }

  /**
   * Parse a semantic version string (vX.Y.Z or X.Y.Z).
   * @param {string} tag - Version string
   * @returns {import('./types.mjs').SemanticVersion|null} Parsed version or null
   */
  parseSemanticVersion(tag) {
    const match = tag.match(
      /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.+-]+))?$/,
    );
    if (!match) {
      return null;
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || undefined,
      raw: tag,
    };
  }

  /**
   * Calculate the next version given a bump type.
   * @param {string} tag - Current version string
   * @param {'major'|'minor'|'patch'} bump - Bump type
   * @returns {string} Next version string (with v prefix if original had one)
   */
  getNextVersion(tag, bump) {
    const version = this.parseSemanticVersion(tag);
    if (!version) {
      throw new ValidationError(`Cannot parse semantic version from: ${tag}`);
    }

    const prefix = tag.startsWith('v') ? 'v' : '';

    switch (bump) {
      case 'major':
        return `${prefix}${version.major + 1}.0.0`;
      case 'minor':
        return `${prefix}${version.major}.${version.minor + 1}.0`;
      case 'patch':
        return `${prefix}${version.major}.${version.minor}.${version.patch + 1}`;
      default:
        throw new ValidationError(
          `Invalid bump type: ${bump}. Must be major, minor, or patch.`,
        );
    }
  }

  /**
   * Sort tags by semantic version (descending, newest first).
   * Non-semver tags are placed at the end.
   * @param {import('./types.mjs').Tag[]} tags
   * @returns {import('./types.mjs').Tag[]}
   */
  sortByVersion(tags) {
    return [...tags].sort((a, b) => {
      const va = this.parseSemanticVersion(a.name);
      const vb = this.parseSemanticVersion(b.name);

      if (!va && !vb) return 0;
      if (!va) return 1;
      if (!vb) return -1;

      if (va.major !== vb.major) return vb.major - va.major;
      if (va.minor !== vb.minor) return vb.minor - va.minor;
      return vb.patch - va.patch;
    });
  }
}
