/**
 * GitHub Repositories SDK client.
 * Provides methods for all repository CRUD, fork, star, watch, and topic operations.
 * @module sdk/repos/client
 */

import { createLogger } from '../client.mjs';
import { validateRepositoryName, validateUsername } from '../validation.mjs';

/**
 * Client for GitHub Repository API operations.
 */
export class ReposClient {
  /**
   * @param {import('../client.mjs').GitHubClient} client - The base GitHub HTTP client
   */
  constructor(client) {
    this.client = client;
    this.log = createLogger('repos');
  }

  /**
   * Get a single repository.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async get(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting repository', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}`);
  }

  /**
   * List repositories for a user.
   * @param {string} username - GitHub username
   * @param {import('./types.mjs').RepositoryListOptions} [options]
   * @returns {Promise<import('./types.mjs').Repository[]>}
   */
  async listForUser(username, options = {}) {
    validateUsername(username);
    this.log.info('Listing repositories for user', { username });
    return this.client.get(`/users/${username}/repos`, { params: options });
  }

  /**
   * List repositories for the authenticated user.
   * @param {import('./types.mjs').RepositoryListOptions} [options]
   * @returns {Promise<import('./types.mjs').Repository[]>}
   */
  async listForAuthenticatedUser(options = {}) {
    this.log.info('Listing repositories for authenticated user');
    return this.client.get('/user/repos', { params: options });
  }

  /**
   * List repositories for an organization.
   * @param {string} org - Organization name
   * @param {import('./types.mjs').RepositoryListOptions} [options]
   * @returns {Promise<import('./types.mjs').Repository[]>}
   */
  async listForOrg(org, options = {}) {
    this.log.info('Listing repositories for org', { org });
    return this.client.get(`/orgs/${org}/repos`, { params: options });
  }

  /**
   * Create a new repository for the authenticated user.
   * @param {import('./types.mjs').RepositoryCreate} data
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async create(data) {
    validateRepositoryName(data.name);
    this.log.info('Creating repository', { name: data.name });
    return this.client.post('/user/repos', data);
  }

  /**
   * Create a new repository in an organization.
   * @param {string} org - Organization name
   * @param {import('./types.mjs').RepositoryCreate} data
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async createInOrg(org, data) {
    validateRepositoryName(data.name);
    this.log.info('Creating repository in org', { org, name: data.name });
    return this.client.post(`/orgs/${org}/repos`, data);
  }

  /**
   * Update a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {import('./types.mjs').RepositoryUpdate} data
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async update(owner, repo, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    if (data.name) {
      validateRepositoryName(data.name);
    }
    this.log.info('Updating repository', { owner, repo });
    return this.client.patch(`/repos/${owner}/${repo}`, data);
  }

  /**
   * Delete a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async delete(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Deleting repository', { owner, repo });
    return this.client.delete(`/repos/${owner}/${repo}`);
  }

  /**
   * Get repository topics.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<import('./types.mjs').Topic>}
   */
  async getTopics(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting topics', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/topics`);
  }

  /**
   * Replace all repository topics.
   * @param {string} owner
   * @param {string} repo
   * @param {string[]} names - Topic names
   * @returns {Promise<import('./types.mjs').Topic>}
   */
  async replaceTopics(owner, repo, names) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Replacing topics', { owner, repo, count: names.length });
    return this.client.put(`/repos/${owner}/${repo}/topics`, { names });
  }

  /**
   * Get repository languages breakdown.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object<string, number>>}
   */
  async getLanguages(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting languages', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/languages`);
  }

  /**
   * List repository contributors.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {boolean} [options.anon] - Include anonymous contributors
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<Object[]>}
   */
  async listContributors(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing contributors', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/contributors`, {
      params: options,
    });
  }

  /**
   * Fork a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {string} [options.organization] - Fork into this organization
   * @param {string} [options.name] - Custom name for the fork
   * @param {boolean} [options.default_branch_only]
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async fork(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Forking repository', { owner, repo });
    return this.client.post(`/repos/${owner}/${repo}/forks`, options);
  }

  /**
   * List forks of a repository.
   * @param {string} owner
   * @param {string} repo
   * @param {Object} [options]
   * @param {string} [options.sort] - 'newest' | 'oldest' | 'stargazers' | 'watchers'
   * @param {number} [options.per_page]
   * @param {number} [options.page]
   * @returns {Promise<import('./types.mjs').Repository[]>}
   */
  async listForks(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing forks', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/forks`, {
      params: options,
    });
  }

  /**
   * Transfer a repository to a new owner.
   * @param {string} owner
   * @param {string} repo
   * @param {string} newOwner - New owner username or org
   * @param {Object} [options]
   * @param {string[]} [options.team_ids] - Team IDs (for org transfers)
   * @returns {Promise<import('./types.mjs').Repository>}
   */
  async transfer(owner, repo, newOwner, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.warn('Transferring repository', { owner, repo, newOwner });
    return this.client.post(`/repos/${owner}/${repo}/transfer`, {
      new_owner: newOwner,
      ...options,
    });
  }

  /**
   * Star a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async star(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Starring repository', { owner, repo });
    return this.client.put(`/user/starred/${owner}/${repo}`);
  }

  /**
   * Unstar a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async unstar(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Unstarring repository', { owner, repo });
    return this.client.delete(`/user/starred/${owner}/${repo}`);
  }

  /**
   * Check if the authenticated user has starred a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<boolean>}
   */
  async isStarred(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.debug('Checking star status', { owner, repo });
    try {
      await this.client.get(`/user/starred/${owner}/${repo}`);
      return true;
    } catch (err) {
      if (err.status === 404) {
        return false;
      }
      throw err;
    }
  }

  /**
   * Watch (subscribe to) a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async watch(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Watching repository', { owner, repo });
    return this.client.put(`/repos/${owner}/${repo}/subscription`, {
      subscribed: true,
    });
  }

  /**
   * Unwatch (unsubscribe from) a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async unwatch(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Unwatching repository', { owner, repo });
    return this.client.delete(`/repos/${owner}/${repo}/subscription`);
  }

  /**
   * Get the subscription (watch) status for a repository.
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<Object>}
   */
  async getSubscription(owner, repo) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.debug('Getting subscription', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/subscription`);
  }

  /**
   * List commits for a repository, optionally filtered by path.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} [options] - Query parameters (path, sha, per_page, page)
   * @returns {Promise<Object[]>}
   */
  async getCommits(owner, repo, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting commits', { owner, repo });
    return this.client.get(`/repos/${owner}/${repo}/commits`, { params: options });
  }

  /**
   * Get a single commit by ref (SHA, branch, or tag).
   * Returns full commit details including file-level stats.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} ref - Commit SHA, branch name, or tag
   * @returns {Promise<Object>}
   */
  async getCommit(owner, repo, ref) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting commit', { owner, repo, ref });
    return this.client.get(`/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}`);
  }

  /**
   * List pull requests associated with a commit.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} commitSha - Commit SHA
   * @returns {Promise<Object[]>}
   */
  async listCommitPulls(owner, repo, commitSha) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Listing pulls for commit', { owner, repo, commitSha });
    return this.client.get(`/repos/${owner}/${repo}/commits/${encodeURIComponent(commitSha)}/pulls`);
  }

  async getContents(owner, repo, path = '', options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting contents', { owner, repo, path });
    const encodedPath = path ? `/${path.split('/').map(encodeURIComponent).join('/')}` : '';
    return this.client.get(`/repos/${owner}/${repo}/contents${encodedPath}`, { params: options });
  }

  /**
   * Get a Git tree by SHA (or branch name).
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} treeSha - Tree SHA or branch name
   * @param {Object} [options] - Query parameters (recursive)
   * @returns {Promise<Object>}
   */
  async getGitTree(owner, repo, treeSha, options = {}) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Getting git tree', { owner, repo, treeSha });
    return this.client.get(`/repos/${owner}/${repo}/git/trees/${encodeURIComponent(treeSha)}`, { params: options });
  }

  /**
   * Create or update file contents (creates a commit automatically).
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path within the repository
   * @param {Object} data - { message, content (base64), branch, sha? (for updates), committer?, author? }
   * @returns {Promise<Object>} Commit and content info
   */
  async createOrUpdateContents(owner, repo, path, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating/updating file contents', { owner, repo, path });
    const encodedPath = path.split('/').map(encodeURIComponent).join('/');
    return this.client.put(`/repos/${owner}/${repo}/contents/${encodedPath}`, data);
  }

  /**
   * Create a Git reference (branch or tag).
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} ref - Full ref path (e.g. "refs/heads/my-branch")
   * @param {string} sha - SHA to point the ref at
   * @returns {Promise<Object>} Created ref
   */
  async createGitRef(owner, repo, ref, sha) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating git ref', { owner, repo, ref });
    return this.client.post(`/repos/${owner}/${repo}/git/refs`, { ref, sha });
  }

  /**
   * Create a pull request.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {Object} data - { title, head, base, body?, draft?, maintainer_can_modify? }
   * @returns {Promise<Object>} Created pull request
   */
  async createPullRequest(owner, repo, data) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Creating pull request', { owner, repo, title: data.title });
    return this.client.post(`/repos/${owner}/${repo}/pulls`, data);
  }

  /**
   * Add labels to an issue or pull request.
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {number} issueNumber - Issue or PR number
   * @param {string[]} labels - Label names to add
   * @returns {Promise<Object[]>} Added labels
   */
  async addLabels(owner, repo, issueNumber, labels) {
    validateUsername(owner);
    validateRepositoryName(repo);
    this.log.info('Adding labels', { owner, repo, issueNumber, labels });
    return this.client.post(`/repos/${owner}/${repo}/issues/${issueNumber}/labels`, { labels });
  }
}
