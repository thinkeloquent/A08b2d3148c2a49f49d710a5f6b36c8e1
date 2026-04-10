/**
 * @module services/user-service
 * @description User service for JIRA operations.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('jira-api', import.meta.url);

export class UserService {
  /** @param {import('../client/JiraFetchClient.mjs').JiraFetchClient} client */
  constructor(client) {
    this._client = client;
  }

  /**
   * Get a user by account ID.
   * @param {string} accountId
   * @returns {Promise<import('../models/user.mjs').User>}
   */
  async getUserById(accountId) {
    return this._client.get('/rest/api/3/user', { queryParams: { accountId } });
  }

  /**
   * Get a user by email address.
   * @param {string} email
   * @returns {Promise<import('../models/user.mjs').User|null>}
   */
  async getUserByEmail(email) {
    const users = await this.searchUsers(email, 1);
    for (const user of users) {
      if (user.emailAddress && user.emailAddress.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  /**
   * Search for users by query string.
   * @param {string} query
   * @param {number} [maxResults=50]
   * @returns {Promise<Array<import('../models/user.mjs').User>>}
   */
  async searchUsers(query, maxResults = 50) {
    return this._client.get('/rest/api/3/user/search', {
      queryParams: { query, maxResults },
    });
  }

  /**
   * Find users assignable to projects.
   * @param {string[]} projectKeys
   * @param {string} [query]
   * @param {number} [maxResults=50]
   * @returns {Promise<Array<import('../models/user.mjs').User>>}
   */
  async findAssignableUsers(projectKeys, query, maxResults = 50) {
    const params = { projectKeys: projectKeys.join(','), maxResults };
    if (query) params.query = query;
    return this._client.get('/rest/api/3/user/assignable/multiProjectSearch', {
      queryParams: params,
    });
  }

  /**
   * Get a user by either account ID or email.
   * @param {string} identifier
   * @returns {Promise<import('../models/user.mjs').User|null>}
   */
  async getUserByIdentifier(identifier) {
    try {
      return await this.getUserById(identifier);
    } catch {
      return this.getUserByEmail(identifier);
    }
  }
}
