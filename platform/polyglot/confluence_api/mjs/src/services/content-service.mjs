/**
 * @module services/content-service
 * @description Service for Confluence Content REST API operations.
 *
 * Covers the full content lifecycle: CRUD, child/descendant traversal,
 * labels, properties, restrictions, body conversion, versioning, and
 * blueprint publishing.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence content operations.
 *
 * All methods accept a `ConfluenceFetchClient` instance (injected via constructor)
 * and delegate HTTP calls to its convenience methods (`get`, `post`, `put`, `delete`).
 */
export class ContentService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  // ---------------------------------------------------------------------------
  // Content CRUD
  // ---------------------------------------------------------------------------

  /**
   * Retrieve a paginated list of content.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.type] - Content type filter (page, blogpost, comment, attachment).
   * @param {string} [options.spaceKey] - Space key filter.
   * @param {string} [options.title] - Title filter (exact match).
   * @param {string} [options.status] - Status filter (current, trashed, draft, any).
   * @param {string|string[]} [options.expand] - Fields to expand in the response.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated content list.
   */
  async getContents({ type, spaceKey, title, status, expand, start = 0, limit = 25 } = {}) {
    log.debug('getContents called', { type, spaceKey, title, status, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (type !== undefined) queryParams.type = type;
      if (spaceKey !== undefined) queryParams.spaceKey = spaceKey;
      if (title !== undefined) queryParams.title = title;
      if (status !== undefined) queryParams.status = status;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('content', { queryParams });
      log.info('getContents succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getContents failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a new piece of content.
   *
   * @param {Object} data - Content creation payload (type, title, space, body, etc.).
   * @returns {Promise<Object>} The created content object.
   */
  async createContent(data) {
    log.debug('createContent called', { type: data?.type, title: data?.title });
    try {
      const result = await this._client.post('content', data);
      log.info('createContent succeeded', { id: result.id, title: result.title });
      return result;
    } catch (error) {
      log.error('createContent failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a single content item by ID.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The content object.
   */
  async getContent(contentId, { expand } = {}) {
    log.debug('getContent called', { contentId, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}`, { queryParams });
      log.info('getContent succeeded', { id: result.id, title: result.title });
      return result;
    } catch (error) {
      log.error('getContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update an existing content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} data - Content update payload (version, title, body, etc.).
   * @returns {Promise<Object>} The updated content object.
   */
  async updateContent(contentId, data) {
    log.debug('updateContent called', { contentId, title: data?.title });
    try {
      const result = await this._client.put(`content/${contentId}`, data);
      log.info('updateContent succeeded', { id: result.id, version: result.version?.number });
      return result;
    } catch (error) {
      log.error('updateContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Delete options.
   * @param {string} [options.status] - If "trashed", permanently deletes from trash.
   * @returns {Promise<void>}
   */
  async deleteContent(contentId, { status } = {}) {
    log.debug('deleteContent called', { contentId, status });
    try {
      const queryParams = {};
      if (status !== undefined) queryParams.status = status;

      const result = await this._client.delete(`content/${contentId}`, { queryParams });
      log.info('deleteContent succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('deleteContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the history of a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} Content history object.
   */
  async getContentHistory(contentId, { expand } = {}) {
    log.debug('getContentHistory called', { contentId, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/history`, { queryParams });
      log.info('getContentHistory succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getContentHistory failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a macro by its ID within a specific content version.
   *
   * @param {string} contentId - The content ID.
   * @param {number} version - The content version number.
   * @param {string} macroId - The macro ID.
   * @returns {Promise<Object>} The macro object.
   */
  async getMacroById(contentId, version, macroId) {
    log.debug('getMacroById called', { contentId, version, macroId });
    try {
      const result = await this._client.get(
        `content/${contentId}/history/${version}/macro/id/${macroId}`,
      );
      log.info('getMacroById succeeded', { contentId, version, macroId });
      return result;
    } catch (error) {
      log.error('getMacroById failed', { contentId, version, macroId, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Child Content & Descendants
  // ---------------------------------------------------------------------------

  /**
   * Get all child content of a content item (grouped by type).
   *
   * @param {string} contentId - The parent content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} Child content grouped by type.
   */
  async getChildContent(contentId, { expand } = {}) {
    log.debug('getChildContent called', { contentId, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/child`, { queryParams });
      log.info('getChildContent succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getChildContent failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get child content of a specific type.
   *
   * @param {string} contentId - The parent content ID.
   * @param {string} childType - Child type (page, comment, attachment).
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated child content list.
   */
  async getChildContentByType(contentId, childType, { expand, start = 0, limit = 25 } = {}) {
    log.debug('getChildContentByType called', { contentId, childType, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/child/${childType}`, { queryParams });
      log.info('getChildContentByType succeeded', { contentId, childType, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getChildContentByType failed', { contentId, childType, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get child comments of a content item.
   *
   * @param {string} contentId - The parent content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @param {string} [options.depth] - Comment depth (empty string for root, "all" for all).
   * @param {string} [options.location] - Comment location (inline, footer, resolved).
   * @returns {Promise<Object>} Paginated comments list.
   */
  async getChildComments(contentId, { expand, start = 0, limit = 25, depth, location } = {}) {
    log.debug('getChildComments called', { contentId, expand, start, limit, depth, location });
    try {
      const queryParams = { start, limit };
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;
      if (depth !== undefined) queryParams.depth = depth;
      if (location !== undefined) queryParams.location = location;

      const result = await this._client.get(`content/${contentId}/child/comment`, { queryParams });
      log.info('getChildComments succeeded', { contentId, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getChildComments failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get all descendants of a content item (grouped by type).
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} Descendants grouped by type.
   */
  async getDescendants(contentId, { expand } = {}) {
    log.debug('getDescendants called', { contentId, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/descendant`, { queryParams });
      log.info('getDescendants succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getDescendants failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get descendants of a content item filtered by type.
   *
   * @param {string} contentId - The content ID.
   * @param {string} descType - Descendant type (page, comment, attachment).
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} Descendants of the specified type.
   */
  async getDescendantsByType(contentId, descType, { expand } = {}) {
    log.debug('getDescendantsByType called', { contentId, descType, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/descendant/${descType}`, { queryParams });
      log.info('getDescendantsByType succeeded', { contentId, descType });
      return result;
    } catch (error) {
      log.error('getDescendantsByType failed', { contentId, descType, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Labels
  // ---------------------------------------------------------------------------

  /**
   * Get labels for a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.prefix] - Label prefix filter (global, my, team).
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated labels list.
   */
  async getLabels(contentId, { prefix, start = 0, limit = 25 } = {}) {
    log.debug('getLabels called', { contentId, prefix, start, limit });
    try {
      const queryParams = { start, limit };
      if (prefix !== undefined) queryParams.prefix = prefix;

      const result = await this._client.get(`content/${contentId}/label`, { queryParams });
      log.info('getLabels succeeded', { contentId, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getLabels failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Add labels to a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Array<{prefix: string, name: string}>} labels - Array of label objects.
   * @returns {Promise<Object>} The updated labels list.
   */
  async addLabels(contentId, labels) {
    log.debug('addLabels called', { contentId, count: labels?.length });
    try {
      const result = await this._client.post(`content/${contentId}/label`, labels);
      log.info('addLabels succeeded', { contentId, count: labels?.length });
      return result;
    } catch (error) {
      log.error('addLabels failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a label from a content item by label name (query parameter).
   *
   * @param {string} contentId - The content ID.
   * @param {string} name - The label name to remove.
   * @returns {Promise<void>}
   */
  async deleteLabelByName(contentId, name) {
    log.debug('deleteLabelByName called', { contentId, name });
    try {
      const result = await this._client.delete(`content/${contentId}/label`, {
        queryParams: { name },
      });
      log.info('deleteLabelByName succeeded', { contentId, name });
      return result;
    } catch (error) {
      log.error('deleteLabelByName failed', { contentId, name, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a label from a content item by label value (path parameter).
   *
   * @param {string} contentId - The content ID.
   * @param {string} label - The label to remove.
   * @returns {Promise<void>}
   */
  async deleteLabel(contentId, label) {
    log.debug('deleteLabel called', { contentId, label });
    try {
      const result = await this._client.delete(`content/${contentId}/label/${label}`);
      log.info('deleteLabel succeeded', { contentId, label });
      return result;
    } catch (error) {
      log.error('deleteLabel failed', { contentId, label, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Properties
  // ---------------------------------------------------------------------------

  /**
   * Get all properties of a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} Content properties list.
   */
  async getProperties(contentId, { expand } = {}) {
    log.debug('getProperties called', { contentId, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/property`, { queryParams });
      log.info('getProperties succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getProperties failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a new property on a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} data - Property creation payload (key, value).
   * @returns {Promise<Object>} The created property.
   */
  async createProperty(contentId, data) {
    log.debug('createProperty called', { contentId, key: data?.key });
    try {
      const result = await this._client.post(`content/${contentId}/property`, data);
      log.info('createProperty succeeded', { contentId, key: data?.key });
      return result;
    } catch (error) {
      log.error('createProperty failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a specific property of a content item by key.
   *
   * @param {string} contentId - The content ID.
   * @param {string} key - The property key.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @returns {Promise<Object>} The property object.
   */
  async getProperty(contentId, key, { expand } = {}) {
    log.debug('getProperty called', { contentId, key, expand });
    try {
      const queryParams = {};
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/property/${key}`, { queryParams });
      log.info('getProperty succeeded', { contentId, key });
      return result;
    } catch (error) {
      log.error('getProperty failed', { contentId, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update a content property by key (PUT).
   *
   * @param {string} contentId - The content ID.
   * @param {string} key - The property key.
   * @param {Object} data - Property update payload (value, version).
   * @returns {Promise<Object>} The updated property.
   */
  async updateProperty(contentId, key, data) {
    log.debug('updateProperty called', { contentId, key });
    try {
      const result = await this._client.put(`content/${contentId}/property/${key}`, data);
      log.info('updateProperty succeeded', { contentId, key });
      return result;
    } catch (error) {
      log.error('updateProperty failed', { contentId, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Create a property for a specific key (POST to key endpoint).
   *
   * @param {string} contentId - The content ID.
   * @param {string} key - The property key.
   * @param {Object} data - Property creation payload (value).
   * @returns {Promise<Object>} The created property.
   */
  async createPropertyForKey(contentId, key, data) {
    log.debug('createPropertyForKey called', { contentId, key });
    try {
      const result = await this._client.post(`content/${contentId}/property/${key}`, data);
      log.info('createPropertyForKey succeeded', { contentId, key });
      return result;
    } catch (error) {
      log.error('createPropertyForKey failed', { contentId, key, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a content property by key.
   *
   * @param {string} contentId - The content ID.
   * @param {string} key - The property key.
   * @returns {Promise<void>}
   */
  async deleteProperty(contentId, key) {
    log.debug('deleteProperty called', { contentId, key });
    try {
      const result = await this._client.delete(`content/${contentId}/property/${key}`);
      log.info('deleteProperty succeeded', { contentId, key });
      return result;
    } catch (error) {
      log.error('deleteProperty failed', { contentId, key, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Restrictions
  // ---------------------------------------------------------------------------

  /**
   * Get content restrictions grouped by operation.
   *
   * @param {string} contentId - The content ID.
   * @returns {Promise<Object>} Restrictions grouped by operation (read, update).
   */
  async getRestrictionsByOperation(contentId) {
    log.debug('getRestrictionsByOperation called', { contentId });
    try {
      const result = await this._client.get(`content/${contentId}/restriction/byOperation`);
      log.info('getRestrictionsByOperation succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('getRestrictionsByOperation failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get content restrictions for a specific operation.
   *
   * @param {string} contentId - The content ID.
   * @param {string} operationKey - The operation key (read, update).
   * @returns {Promise<Object>} Restrictions for the specified operation.
   */
  async getRestrictionsForOperation(contentId, operationKey) {
    log.debug('getRestrictionsForOperation called', { contentId, operationKey });
    try {
      const result = await this._client.get(
        `content/${contentId}/restriction/byOperation/${operationKey}`,
      );
      log.info('getRestrictionsForOperation succeeded', { contentId, operationKey });
      return result;
    } catch (error) {
      log.error('getRestrictionsForOperation failed', { contentId, operationKey, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update content restrictions.
   *
   * @param {string} contentId - The content ID.
   * @param {Object} data - Restrictions update payload.
   * @returns {Promise<Object>} The updated restrictions.
   */
  async updateRestrictions(contentId, data) {
    log.debug('updateRestrictions called', { contentId });
    try {
      const result = await this._client.put(`content/${contentId}/restriction`, data);
      log.info('updateRestrictions succeeded', { contentId });
      return result;
    } catch (error) {
      log.error('updateRestrictions failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Body Conversion
  // ---------------------------------------------------------------------------

  /**
   * Convert content body to a different representation format.
   *
   * @param {string} toFormat - Target format (storage, view, editor, export_view, styled_view, anonymous_export_view).
   * @param {Object} data - Conversion payload containing the source representation.
   * @returns {Promise<Object>} The converted content body.
   */
  async convertContentBody(toFormat, data) {
    log.debug('convertContentBody called', { toFormat });
    try {
      const result = await this._client.post(`contentbody/convert/${toFormat}`, data);
      log.info('convertContentBody succeeded', { toFormat });
      return result;
    } catch (error) {
      log.error('convertContentBody failed', { toFormat, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Version
  // ---------------------------------------------------------------------------

  /**
   * Delete a specific version of a content item.
   *
   * @param {string} contentId - The content ID.
   * @param {number} versionNumber - The version number to delete.
   * @returns {Promise<void>}
   */
  async deleteContentVersion(contentId, versionNumber) {
    log.debug('deleteContentVersion called', { contentId, versionNumber });
    try {
      const result = await this._client.delete(`content/${contentId}/version/${versionNumber}`);
      log.info('deleteContentVersion succeeded', { contentId, versionNumber });
      return result;
    } catch (error) {
      log.error('deleteContentVersion failed', { contentId, versionNumber, message: error.message, status: error.status });
      throw error;
    }
  }

  // ---------------------------------------------------------------------------
  // Content Blueprint
  // ---------------------------------------------------------------------------

  /**
   * Publish a shared draft created from a blueprint.
   *
   * @param {string} draftId - The draft content ID.
   * @param {Object} data - Publish payload (status, space, title, etc.).
   * @returns {Promise<Object>} The published content.
   */
  async publishSharedDraft(draftId, data) {
    log.debug('publishSharedDraft called', { draftId });
    try {
      const result = await this._client.put(`content/blueprint/instance/${draftId}`, data);
      log.info('publishSharedDraft succeeded', { draftId, id: result.id });
      return result;
    } catch (error) {
      log.error('publishSharedDraft failed', { draftId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Publish a legacy draft created from a blueprint.
   *
   * @param {string} draftId - The draft content ID.
   * @param {Object} data - Publish payload (status, space, title, etc.).
   * @returns {Promise<Object>} The published content.
   */
  async publishLegacyDraft(draftId, data) {
    log.debug('publishLegacyDraft called', { draftId });
    try {
      const result = await this._client.post(`content/blueprint/instance/${draftId}`, data);
      log.info('publishLegacyDraft succeeded', { draftId, id: result.id });
      return result;
    } catch (error) {
      log.error('publishLegacyDraft failed', { draftId, message: error.message, status: error.status });
      throw error;
    }
  }
}
