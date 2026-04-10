/**
 * @module services/space-permission-service
 * @description Service for Confluence Space Permission REST API operations.
 *
 * Manages space-level permissions including viewing, granting, and revoking
 * permissions for anonymous users, groups, and individual users.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence space permission operations.
 */
export class SpacePermissionService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get all permissions for a space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Space permissions.
   */
  async getPermissions(spaceKey) {
    log.debug('getPermissions called', { spaceKey });
    try {
      const result = await this._client.get(`space/${spaceKey}/permission`);
      log.info('getPermissions succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getPermissions failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Add a permission to a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Permission payload (subject, operation).
   * @returns {Promise<Object>} The added permission.
   */
  async addPermission(spaceKey, data) {
    log.debug('addPermission called', { spaceKey });
    try {
      const result = await this._client.post(`space/${spaceKey}/permission`, data);
      log.info('addPermission succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('addPermission failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get anonymous permissions for a space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Anonymous space permissions.
   */
  async getAnonymousPermissions(spaceKey) {
    log.debug('getAnonymousPermissions called', { spaceKey });
    try {
      const result = await this._client.get(`space/${spaceKey}/permission/anonymous`);
      log.info('getAnonymousPermissions succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getAnonymousPermissions failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get permissions for a specific group in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} groupName - The group name.
   * @returns {Promise<Object>} Group space permissions.
   */
  async getGroupPermissions(spaceKey, groupName) {
    log.debug('getGroupPermissions called', { spaceKey, groupName });
    try {
      const result = await this._client.get(`space/${spaceKey}/permission/group/${groupName}`);
      log.info('getGroupPermissions succeeded', { spaceKey, groupName });
      return result;
    } catch (error) {
      log.error('getGroupPermissions failed', { spaceKey, groupName, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get permissions for a specific user in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} userKey - The user key.
   * @returns {Promise<Object>} User space permissions.
   */
  async getUserPermissions(spaceKey, userKey) {
    log.debug('getUserPermissions called', { spaceKey, userKey });
    try {
      const result = await this._client.get(`space/${spaceKey}/permission/user/${userKey}`);
      log.info('getUserPermissions succeeded', { spaceKey, userKey });
      return result;
    } catch (error) {
      log.error('getUserPermissions failed', { spaceKey, userKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Grant a permission to anonymous users in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Permission grant payload (operation).
   * @returns {Promise<Object>} The granted permission.
   */
  async grantAnonymous(spaceKey, data) {
    log.debug('grantAnonymous called', { spaceKey });
    try {
      const result = await this._client.post(`space/${spaceKey}/permission/anonymous`, data);
      log.info('grantAnonymous succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('grantAnonymous failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Grant a permission to a group in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} groupName - The group name.
   * @param {Object} data - Permission grant payload (operation).
   * @returns {Promise<Object>} The granted permission.
   */
  async grantGroup(spaceKey, groupName, data) {
    log.debug('grantGroup called', { spaceKey, groupName });
    try {
      const result = await this._client.post(`space/${spaceKey}/permission/group/${groupName}`, data);
      log.info('grantGroup succeeded', { spaceKey, groupName });
      return result;
    } catch (error) {
      log.error('grantGroup failed', { spaceKey, groupName, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Grant a permission to a user in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} userKey - The user key.
   * @param {Object} data - Permission grant payload (operation).
   * @returns {Promise<Object>} The granted permission.
   */
  async grantUser(spaceKey, userKey, data) {
    log.debug('grantUser called', { spaceKey, userKey });
    try {
      const result = await this._client.post(`space/${spaceKey}/permission/user/${userKey}`, data);
      log.info('grantUser succeeded', { spaceKey, userKey });
      return result;
    } catch (error) {
      log.error('grantUser failed', { spaceKey, userKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Revoke a permission from anonymous users in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Permission revocation payload (operation).
   * @returns {Promise<void>}
   */
  async revokeAnonymous(spaceKey, data) {
    log.debug('revokeAnonymous called', { spaceKey });
    try {
      const result = await this._client.delete(`space/${spaceKey}/permission/anonymous`, {
        queryParams: data,
      });
      log.info('revokeAnonymous succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('revokeAnonymous failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Revoke a permission from a group in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} groupName - The group name.
   * @param {Object} data - Permission revocation payload (operation).
   * @returns {Promise<void>}
   */
  async revokeGroup(spaceKey, groupName, data) {
    log.debug('revokeGroup called', { spaceKey, groupName });
    try {
      const result = await this._client.delete(`space/${spaceKey}/permission/group/${groupName}`, {
        queryParams: data,
      });
      log.info('revokeGroup succeeded', { spaceKey, groupName });
      return result;
    } catch (error) {
      log.error('revokeGroup failed', { spaceKey, groupName, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Revoke a permission from a user in a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} userKey - The user key.
   * @param {Object} data - Permission revocation payload (operation).
   * @returns {Promise<void>}
   */
  async revokeUser(spaceKey, userKey, data) {
    log.debug('revokeUser called', { spaceKey, userKey });
    try {
      const result = await this._client.delete(`space/${spaceKey}/permission/user/${userKey}`, {
        queryParams: data,
      });
      log.info('revokeUser succeeded', { spaceKey, userKey });
      return result;
    } catch (error) {
      log.error('revokeUser failed', { spaceKey, userKey, message: error.message, status: error.status });
      throw error;
    }
  }
}
