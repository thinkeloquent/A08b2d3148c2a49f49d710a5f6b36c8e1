/**
 * @module services/user-service
 * @description Service for Confluence User REST API operations.
 *
 * Covers user retrieval, current user info, anonymous user info, user groups,
 * user listing, password changes, content/space watching, and content watchers.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence user operations.
 */
export class UserService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // User Info
  // ---------------------------------------------------------------------------

  /**
   * Get a user by username or user key.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - The username.
   * @param {string} [options.userKey] - The user key.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The user object.
   */
  async getUser({ username, userKey, expand } = {}) {
    log.debug('getUser called', { username, userKey, expand });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;
      if (userKey !== undefined) queryParams.key = userKey;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('user', { queryParams });
      log.info('getUser succeeded', { username: result.username, userKey: result.userKey });
      return result;
    } catch (error) {
      log.error('getUser failed', { username, userKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the currently authenticated user.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The current user object.
   */
  async getCurrentUser({ expand } = {}) {
    log.debug('getCurrentUser called', { expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('user/current', { queryParams });
      log.info('getCurrentUser succeeded', { username: result.username });
      return result;
    } catch (error) {
      log.error('getCurrentUser failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the anonymous user representation.
   *
   * @returns {Promise<Object>} The anonymous user object.
   */
  async getAnonymousUser() {
    log.debug('getAnonymousUser called');
    try {
      const result = await this._client.get('user/anonymous');
      log.info('getAnonymousUser succeeded');
      return result;
    } catch (error) {
      log.error('getAnonymousUser failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get groups that a user belongs to.
   *
   * @param {string} username - The username.
   * @param {Object} [options={}] - Query options.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated group list for the user.
   */
  async getUserGroups(username, { start = 0, limit = 25 } = {}) {
    log.debug('getUserGroups called', { username, start, limit });
    try {
      const queryParams = { username, start, limit };

      const result = await this._client.get('user/memberof', { queryParams });
      log.info('getUserGroups succeeded', { username, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getUserGroups failed', { username, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * List all users in the Confluence instance.
   *
   * @param {Object} [options={}] - Query options.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated user list.
   */
  async listUsers({ start = 0, limit = 25 } = {}) {
    log.debug('listUsers called', { start, limit });
    try {
      const queryParams = { start, limit };

      const result = await this._client.get('user/list', { queryParams });
      log.info('listUsers succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('listUsers failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Change the current user's password.
   *
   * @param {string} oldPassword - The current password.
   * @param {string} newPassword - The new password.
   * @returns {Promise<void>}
   */
  async changeCurrentUserPassword(oldPassword, newPassword) {
    log.debug('changeCurrentUserPassword called');
    try {
      const result = await this._client.put('user/current/password', {
        oldPassword,
        newPassword,
      });
      log.info('changeCurrentUserPassword succeeded');
      return result;
    } catch (error) {
      log.error('changeCurrentUserPassword failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // User Watch — Content
  // ---------------------------------------------------------------------------

  /**
   * Check if the current user (or specified user) is watching a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to check (defaults to current user).
   * @returns {Promise<Object>} Watch status object.
   */
  async isWatchingContent(contentId, { username } = {}) {
    log.debug('isWatchingContent called', { contentId, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.get(`user/watch/content/${contentId}`, { queryParams });
      log.info('isWatchingContent succeeded', { contentId, watching: result.watching });
      return result;
    } catch (error) {
      log.error('isWatchingContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Start watching a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to watch on behalf of (defaults to current user).
   * @returns {Promise<void>}
   */
  async watchContent(contentId, { username } = {}) {
    log.debug('watchContent called', { contentId, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.post(`user/watch/content/${contentId}`, null, { queryParams });
      log.info('watchContent succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('watchContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Stop watching a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to unwatch on behalf of (defaults to current user).
   * @returns {Promise<void>}
   */
  async unwatchContent(contentId, { username } = {}) {
    log.debug('unwatchContent called', { contentId, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.delete(`user/watch/content/${contentId}`, { queryParams });
      log.info('unwatchContent succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('unwatchContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // User Watch — Space
  // ---------------------------------------------------------------------------

  /**
   * Check if the current user (or specified user) is watching a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to check (defaults to current user).
   * @returns {Promise<Object>} Watch status object.
   */
  async isWatchingSpace(spaceKey, { username } = {}) {
    log.debug('isWatchingSpace called', { spaceKey, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.get(`user/watch/space/${spaceKey}`, { queryParams });
      log.info('isWatchingSpace succeeded', { spaceKey, watching: result.watching });
      return result;
    } catch (error) {
      log.error('isWatchingSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Start watching a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to watch on behalf of (defaults to current user).
   * @returns {Promise<void>}
   */
  async watchSpace(spaceKey, { username } = {}) {
    log.debug('watchSpace called', { spaceKey, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.post(`user/watch/space/${spaceKey}`, null, { queryParams });
      log.info('watchSpace succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('watchSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Stop watching a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.username] - Username to unwatch on behalf of (defaults to current user).
   * @returns {Promise<void>}
   */
  async unwatchSpace(spaceKey, { username } = {}) {
    log.debug('unwatchSpace called', { spaceKey, username });
    try {
      const queryParams = {};
      if (username !== undefined) queryParams.username = username;

      const result = await this._client.delete(`user/watch/space/${spaceKey}`, { queryParams });
      log.info('unwatchSpace succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('unwatchSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Watchers
  // ---------------------------------------------------------------------------

  /**
   * Get all watchers for a content item.
   *
   * @param {string} contentId - The content ID.
   * @returns {Promise<Object>} Content watchers list.
   */
  async getContentWatchers(contentId) {
    log.debug('getContentWatchers called', { contentId });
    try {
      const result = await this._client.get(`content/${contentId}/notification/child-created`);
      log.info('getContentWatchers succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getContentWatchers failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }
}
