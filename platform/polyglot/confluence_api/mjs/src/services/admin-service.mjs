/**
 * @module services/admin-service
 * @description Service for Confluence Admin REST API operations.
 *
 * Provides administrative operations for user and group management:
 * creating, deleting, enabling/disabling users, setting passwords,
 * and creating/deleting groups.
 *
 * These operations require Confluence system administrator privileges.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence administration operations.
 */
export class AdminService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // User Administration
  // ---------------------------------------------------------------------------

  /**
   * Create a new user.
   *
   * @param {Object} data - User creation payload.
   * @param {string} data.username - The username for the new user.
   * @param {string} data.email - The email address for the new user.
   * @param {string} data.fullName - The full name of the new user.
   * @param {string} [data.password] - Optional initial password.
   * @returns {Promise<Object>} The created user object.
   */
  async createUser(data) {
    log.debug('createUser called', { username: data?.username, email: data?.email });
    try {
      const result = await this._client.post('admin/user', data);
      log.info('createUser succeeded', { username: data?.username });
      return result;
    } catch (error) {
      log.error('createUser failed', { username: data?.username, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a user.
   *
   * @param {string} username - The username of the user to delete.
   * @returns {Promise<void>}
   */
  async deleteUser(username) {
    log.debug('deleteUser called', { username });
    try {
      const result = await this._client.delete('admin/user', {
        queryParams: { username },
      });
      log.info('deleteUser succeeded', { username });
      return result;
    } catch (error) {
      log.error('deleteUser failed', { username, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Disable a user account.
   *
   * Disabled users cannot log in but their content is preserved.
   *
   * @param {string} username - The username of the user to disable.
   * @returns {Promise<void>}
   */
  async disableUser(username) {
    log.debug('disableUser called', { username });
    try {
      const result = await this._client.post('admin/user/disable', { username });
      log.info('disableUser succeeded', { username });
      return result;
    } catch (error) {
      log.error('disableUser failed', { username, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Enable a previously disabled user account.
   *
   * @param {string} username - The username of the user to enable.
   * @returns {Promise<void>}
   */
  async enableUser(username) {
    log.debug('enableUser called', { username });
    try {
      const result = await this._client.post('admin/user/enable', { username });
      log.info('enableUser succeeded', { username });
      return result;
    } catch (error) {
      log.error('enableUser failed', { username, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Set a user's password (admin override).
   *
   * Does not require knowledge of the user's current password.
   *
   * @param {string} username - The username.
   * @param {string} password - The new password to set.
   * @returns {Promise<void>}
   */
  async setUserPassword(username, password) {
    log.debug('setUserPassword called', { username });
    try {
      const result = await this._client.put('admin/user/password', {
        username,
        password,
      });
      log.info('setUserPassword succeeded', { username });
      return result;
    } catch (error) {
      log.error('setUserPassword failed', { username, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Group Administration
  // ---------------------------------------------------------------------------

  /**
   * Create a new group.
   *
   * @param {string} name - The group name.
   * @returns {Promise<Object>} The created group object.
   */
  async createGroup(name) {
    log.debug('createGroup called', { name });
    try {
      const result = await this._client.post('admin/group', { name });
      log.info('createGroup succeeded', { name });
      return result;
    } catch (error) {
      log.error('createGroup failed', { name, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a group.
   *
   * @param {string} groupName - The group name to delete.
   * @returns {Promise<void>}
   */
  async deleteGroup(groupName) {
    log.debug('deleteGroup called', { groupName });
    try {
      const result = await this._client.delete('admin/group', {
        queryParams: { name: groupName },
      });
      log.info('deleteGroup succeeded', { groupName });
      return result;
    } catch (error) {
      log.error('deleteGroup failed', { groupName, message: error.message, status: error.status });
      throw error;
    }
  }
}
