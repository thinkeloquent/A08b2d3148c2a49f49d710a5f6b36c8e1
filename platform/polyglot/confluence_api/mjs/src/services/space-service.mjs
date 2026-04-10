/**
 * @module services/space-service
 * @description Service for Confluence Space REST API operations.
 *
 * Covers space CRUD, archiving/restoring, private spaces, space content
 * retrieval, space properties, space labels, watchers, and categories.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence space operations.
 */
export class SpaceService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // Space CRUD
  // ---------------------------------------------------------------------------

  /**
   * Get a paginated list of spaces.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.type] - Space type filter (global, personal).
   * @param {string} [options.status] - Space status filter (current, archived).
   * @param {string} [options.label] - Label filter.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated space list.
   */
  async getSpaces({ type, status, label, expand, start = 0, limit = 25 } = {}) {
    log.debug('getSpaces called', { type, status, label, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (type !== undefined) queryParams.type = type;
      if (status !== undefined) queryParams.status = status;
      if (label !== undefined) queryParams.label = label;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('space', { queryParams });
      log.info('getSpaces succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getSpaces failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a new space.
   *
   * @param {Object} data - Space creation payload (key, name, description, etc.).
   * @returns {Promise<Object>} The created space object.
   */
  async createSpace(data) {
    log.debug('createSpace called', { key: data?.key, name: data?.name });
    try {
      const result = await this._client.post('space', data);
      log.info('createSpace succeeded', { key: result.key, name: result.name });
      return result;
    } catch (error) {
      log.error('createSpace failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a single space by key.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The space object.
   */
  async getSpace(spaceKey, { expand } = {}) {
    log.debug('getSpace called', { spaceKey, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`space/${spaceKey}`, { queryParams });
      log.info('getSpace succeeded', { key: result.key, name: result.name });
      return result;
    } catch (error) {
      log.error('getSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update an existing space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Space update payload (name, description, homepage, etc.).
   * @returns {Promise<Object>} The updated space object.
   */
  async updateSpace(spaceKey, data) {
    log.debug('updateSpace called', { spaceKey, name: data?.name });
    try {
      const result = await this._client.put(`space/${spaceKey}`, data);
      log.info('updateSpace succeeded', { key: result.key });
      return result;
    } catch (error) {
      log.error('updateSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a space.
   *
   * This is an asynchronous operation; the server returns a long-running task.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Long-running task details.
   */
  async deleteSpace(spaceKey) {
    log.debug('deleteSpace called', { spaceKey });
    try {
      const result = await this._client.delete(`space/${spaceKey}`);
      log.info('deleteSpace succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('deleteSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Archive a space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} The archived space object.
   */
  async archiveSpace(spaceKey) {
    log.debug('archiveSpace called', { spaceKey });
    try {
      const result = await this._client.put(`space/${spaceKey}/archive`);
      log.info('archiveSpace succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('archiveSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Restore an archived space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} The restored space object.
   */
  async restoreSpace(spaceKey) {
    log.debug('restoreSpace called', { spaceKey });
    try {
      const result = await this._client.put(`space/${spaceKey}/restore`);
      log.info('restoreSpace succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('restoreSpace failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a private space.
   *
   * Private spaces are only visible to the creator and explicitly added users/groups.
   *
   * @param {Object} data - Private space creation payload (key, name, description).
   * @returns {Promise<Object>} The created private space.
   */
  async createPrivateSpace(data) {
    log.debug('createPrivateSpace called', { key: data?.key, name: data?.name });
    try {
      const result = await this._client.post('space/_private', data);
      log.info('createPrivateSpace succeeded', { key: result.key });
      return result;
    } catch (error) {
      log.error('createPrivateSpace failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Content
  // ---------------------------------------------------------------------------

  /**
   * Get content within a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.depth] - Depth of child content (all, root).
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated content list for the space.
   */
  async getSpaceContent(spaceKey, { depth, expand, start = 0, limit = 25 } = {}) {
    log.debug('getSpaceContent called', { spaceKey, depth, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (depth !== undefined) queryParams.depth = depth;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`space/${spaceKey}/content`, { queryParams });
      log.info('getSpaceContent succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getSpaceContent failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get content of a specific type within a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} contentType - Content type (page, blogpost).
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.depth] - Depth of child content (all, root).
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated content list filtered by type.
   */
  async getSpaceContentByType(spaceKey, contentType, { depth, expand, start = 0, limit = 25 } = {}) {
    log.debug('getSpaceContentByType called', { spaceKey, contentType, depth, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (depth !== undefined) queryParams.depth = depth;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`space/${spaceKey}/content/${contentType}`, { queryParams });
      log.info('getSpaceContentByType succeeded', { spaceKey, contentType, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getSpaceContentByType failed', { spaceKey, contentType, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Properties
  // ---------------------------------------------------------------------------

  /**
   * Get all properties of a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated space properties list.
   */
  async getSpaceProperties(spaceKey, { expand, start = 0, limit = 25 } = {}) {
    log.debug('getSpaceProperties called', { spaceKey, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`space/${spaceKey}/property`, { queryParams });
      log.info('getSpaceProperties succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getSpaceProperties failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a new property on a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {Object} data - Property creation payload (key, value).
   * @returns {Promise<Object>} The created property.
   */
  async createSpaceProperty(spaceKey, data) {
    log.debug('createSpaceProperty called', { spaceKey, key: data?.key });
    try {
      const result = await this._client.post(`space/${spaceKey}/property`, data);
      log.info('createSpaceProperty succeeded', { spaceKey, key: data?.key });
      return result;
    } catch (error) {
      log.error('createSpaceProperty failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a specific space property by key.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} key - The property key.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The property object.
   */
  async getSpaceProperty(spaceKey, key, { expand } = {}) {
    log.debug('getSpaceProperty called', { spaceKey, key, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`space/${spaceKey}/property/${key}`, { queryParams });
      log.info('getSpaceProperty succeeded', { spaceKey, key });
      return result;
    } catch (error) {
      log.error('getSpaceProperty failed', { spaceKey, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update a space property by key (PUT).
   *
   * @param {string} spaceKey - The space key.
   * @param {string} key - The property key.
   * @param {Object} data - Property update payload (value, version).
   * @returns {Promise<Object>} The updated property.
   */
  async updateSpaceProperty(spaceKey, key, data) {
    log.debug('updateSpaceProperty called', { spaceKey, key });
    try {
      const result = await this._client.put(`space/${spaceKey}/property/${key}`, data);
      log.info('updateSpaceProperty succeeded', { spaceKey, key });
      return result;
    } catch (error) {
      log.error('updateSpaceProperty failed', { spaceKey, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a property for a specific key on a space (POST to key endpoint).
   *
   * @param {string} spaceKey - The space key.
   * @param {string} key - The property key.
   * @param {Object} data - Property creation payload (value).
   * @returns {Promise<Object>} The created property.
   */
  async createSpacePropertyForKey(spaceKey, key, data) {
    log.debug('createSpacePropertyForKey called', { spaceKey, key });
    try {
      const result = await this._client.post(`space/${spaceKey}/property/${key}`, data);
      log.info('createSpacePropertyForKey succeeded', { spaceKey, key });
      return result;
    } catch (error) {
      log.error('createSpacePropertyForKey failed', { spaceKey, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a space property by key.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} key - The property key.
   * @returns {Promise<void>}
   */
  async deleteSpaceProperty(spaceKey, key) {
    log.debug('deleteSpaceProperty called', { spaceKey, key });
    try {
      const result = await this._client.delete(`space/${spaceKey}/property/${key}`);
      log.info('deleteSpaceProperty succeeded', { spaceKey, key });
      return result;
    } catch (error) {
      log.error('deleteSpaceProperty failed', { spaceKey, key, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Labels
  // ---------------------------------------------------------------------------

  /**
   * Get labels across all spaces.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated space labels list.
   */
  async getSpaceLabels({ expand, start = 0, limit = 25 } = {}) {
    log.debug('getSpaceLabels called', { expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('label/space', { queryParams });
      log.info('getSpaceLabels succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getSpaceLabels failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get popular (most-used) space labels.
   *
   * @returns {Promise<Object>} Popular space labels.
   */
  async getPopularSpaceLabels() {
    log.debug('getPopularSpaceLabels called');
    try {
      const result = await this._client.get('label/space/popular');
      log.info('getPopularSpaceLabels succeeded');
      return result;
    } catch (error) {
      log.error('getPopularSpaceLabels failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get recently-used space labels.
   *
   * @returns {Promise<Object>} Recent space labels.
   */
  async getRecentSpaceLabels() {
    log.debug('getRecentSpaceLabels called');
    try {
      const result = await this._client.get('label/space/recent');
      log.info('getRecentSpaceLabels succeeded');
      return result;
    } catch (error) {
      log.error('getRecentSpaceLabels failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get labels related to a given space label.
   *
   * @param {string} labelName - The label name to find related labels for.
   * @returns {Promise<Object>} Related space labels.
   */
  async getRelatedSpaceLabels(labelName) {
    log.debug('getRelatedSpaceLabels called', { labelName });
    try {
      const result = await this._client.get(`label/space/${labelName}/related`);
      log.info('getRelatedSpaceLabels succeeded', { labelName });
      return result;
    } catch (error) {
      log.error('getRelatedSpaceLabels failed', { labelName, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Space Watchers
  // ---------------------------------------------------------------------------

  /**
   * Get watchers for a space.
   *
   * @param {string} spaceKey - The space key.
   * @returns {Promise<Object>} Space watchers list.
   */
  async getSpaceWatchers(spaceKey) {
    log.debug('getSpaceWatchers called', { spaceKey });
    try {
      const result = await this._client.get(`space/${spaceKey}/watch`);
      log.info('getSpaceWatchers succeeded', { spaceKey });
      return result;
    } catch (error) {
      log.error('getSpaceWatchers failed', { spaceKey, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Category
  // ---------------------------------------------------------------------------

  /**
   * Delete a category (label) from a space.
   *
   * @param {string} spaceKey - The space key.
   * @param {string} categoryName - The category (label) name to remove.
   * @returns {Promise<void>}
   */
  async deleteCategory(spaceKey, categoryName) {
    log.debug('deleteCategory called', { spaceKey, categoryName });
    try {
      const result = await this._client.delete(`space/${spaceKey}/label/${categoryName}`);
      log.info('deleteCategory succeeded', { spaceKey, categoryName });
      return result;
    } catch (error) {
      log.error('deleteCategory failed', { spaceKey, categoryName, message: error.message, status: error.status });
      throw error;
    }
  }
}
