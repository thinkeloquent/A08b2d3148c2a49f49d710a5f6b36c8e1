/**
 * @module services/group-service
 * @description Service for Confluence Group REST API operations.
 *
 * Provides read access to groups and group membership.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence group operations.
 */
export class GroupService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get a single group by name.
   *
   * @param {string} groupName - The group name.
   * @returns {Promise<Object>} The group object.
   */
  async getGroup(groupName) {
    log.debug('getGroup called', { groupName });
    try {
      const result = await this._client.get(`group/${groupName}`);
      log.info('getGroup succeeded', { groupName, name: result.name });
      return result;
    } catch (error) {
      log.error('getGroup failed', { groupName, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a paginated list of all groups.
   *
   * @param {Object} [options={}] - Query options.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated group list.
   */
  async getGroups({ start = 0, limit = 25 } = {}) {
    log.debug('getGroups called', { start, limit });
    try {
      const queryParams = { start, limit };

      const result = await this._client.get('group', { queryParams });
      log.info('getGroups succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getGroups failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get members of a group.
   *
   * @param {string} groupName - The group name.
   * @param {Object} [options={}] - Query options.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated group members list.
   */
  async getGroupMembers(groupName, { start = 0, limit = 25 } = {}) {
    log.debug('getGroupMembers called', { groupName, start, limit });
    try {
      const queryParams = { start, limit };

      const result = await this._client.get(`group/${groupName}/member`, { queryParams });
      log.info('getGroupMembers succeeded', { groupName, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getGroupMembers failed', { groupName, message: error.message, status: error.status });
      throw error;
    }
  }
}
