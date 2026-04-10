/**
 * @module services/label-service
 * @description Service for Confluence Label REST API operations.
 *
 * Provides access to global label relationships and recently-used labels.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence label operations.
 */
export class LabelService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get labels related to a given label.
   *
   * Returns labels that frequently co-occur with the specified label
   * across content items.
   *
   * @param {string} labelName - The label name to find related labels for.
   * @returns {Promise<Object>} Related labels.
   */
  async getRelatedLabels(labelName) {
    log.debug('getRelatedLabels called', { labelName });
    try {
      const result = await this._client.get(`label/${labelName}/related`);
      log.info('getRelatedLabels succeeded', { labelName });
      return result;
    } catch (error) {
      log.error('getRelatedLabels failed', { labelName, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get recently-used labels.
   *
   * Returns labels that have been recently applied to content by the
   * current user or across the instance.
   *
   * @returns {Promise<Object>} Recent labels.
   */
  async getRecentLabels() {
    log.debug('getRecentLabels called');
    try {
      const result = await this._client.get('label/recent');
      log.info('getRecentLabels succeeded');
      return result;
    } catch (error) {
      log.error('getRecentLabels failed', { message: error.message, status: error.status });
      throw error;
    }
  }
}
