/**
 * @module services/search-service
 * @description Service for Confluence Search REST API operations.
 *
 * Provides CQL-based content search, global search, and content scanning.
 * Confluence uses CQL (Confluence Query Language) as its search syntax.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence search operations.
 */
export class SearchService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Search for content using CQL via the content search endpoint.
   *
   * This endpoint searches only content entities and returns results in
   * the standard paginated content format.
   *
   * @param {string} cql - CQL query string (e.g. 'type=page AND space=DEV').
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.cqlcontext] - CQL context JSON string for relative queries.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated content search results.
   */
  async searchContent(cql, { cqlcontext, expand, start = 0, limit = 25 } = {}) {
    log.debug('searchContent called', { cql, cqlcontext, expand, start, limit });
    try {
      const queryParams = { cql, start, limit };
      if (cqlcontext !== undefined) queryParams.cqlcontext = cqlcontext;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('content/search', { queryParams });
      log.info('searchContent succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('searchContent failed', { cql, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Perform a global search using CQL via the search endpoint.
   *
   * This endpoint searches across all entity types (content, spaces, users)
   * and may return excerpts and additional search metadata.
   *
   * @param {string} cql - CQL query string.
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.cqlcontext] - CQL context JSON string for relative queries.
   * @param {string} [options.excerpt] - Excerpt strategy (highlight, indexed, none).
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated global search results.
   */
  async search(cql, { cqlcontext, excerpt, expand, start = 0, limit = 25 } = {}) {
    log.debug('search called', { cql, cqlcontext, excerpt, expand, start, limit });
    try {
      const queryParams = { cql, start, limit };
      if (cqlcontext !== undefined) queryParams.cqlcontext = cqlcontext;
      if (excerpt !== undefined) queryParams.excerpt = excerpt;
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get('search', { queryParams });
      log.info('search succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('search failed', { cql, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Scan all content using cursor-based pagination.
   *
   * Unlike search, this endpoint iterates through all content without a CQL
   * filter. It uses an opaque cursor token for efficient forward-only pagination.
   * Useful for bulk exports or full reindexing operations.
   *
   * @param {Object} [options={}] - Query options.
   * @param {string} [options.cursor] - Opaque cursor token for resuming a scan.
   * @param {number} [options.limit=25] - Maximum number of results per page.
   * @returns {Promise<Object>} Paginated scan results with cursor metadata.
   */
  async scanContent({ cursor, limit = 25 } = {}) {
    log.debug('scanContent called', { cursor, limit });
    try {
      const queryParams = { limit };
      if (cursor !== undefined) queryParams.cursor = cursor;

      const result = await this._client.get('content/scan', { queryParams });
      log.info('scanContent succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('scanContent failed', { message: error.message, status: error.status });
      throw error;
    }
  }
}
