/**
 * @module services/system-service
 * @description Service for Confluence System REST API operations.
 *
 * Provides access to server information, instance metrics, access mode,
 * and long-running task management.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence system operations.
 */
export class SystemService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get Confluence server information.
   *
   * Returns the server title, version, base URL, and other metadata
   * about the running Confluence instance.
   *
   * @returns {Promise<Object>} Server information object.
   */
  async getServerInfo() {
    log.debug('getServerInfo called');
    try {
      const result = await this._client.get('settings/serverInfo');
      log.info('getServerInfo succeeded', { version: result.version, title: result.title });
      return result;
    } catch (error) {
      log.error('getServerInfo failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get instance metrics.
   *
   * Returns operational metrics such as content counts, user counts,
   * and system health indicators.
   *
   * @returns {Promise<Object>} Instance metrics object.
   */
  async getInstanceMetrics() {
    log.debug('getInstanceMetrics called');
    try {
      const result = await this._client.get('settings/metrics');
      log.info('getInstanceMetrics succeeded');
      return result;
    } catch (error) {
      log.error('getInstanceMetrics failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get the current access mode of the Confluence instance.
   *
   * Access mode indicates whether the instance is in read-write, read-only,
   * or maintenance mode.
   *
   * @returns {Promise<Object>} Access mode object.
   */
  async getAccessMode() {
    log.debug('getAccessMode called');
    try {
      const result = await this._client.get('accessmode');
      log.info('getAccessMode succeeded', { mode: result.accessMode ?? result.mode });
      return result;
    } catch (error) {
      log.error('getAccessMode failed', { message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a specific long-running task by ID.
   *
   * Long-running tasks are created for operations like space deletion,
   * content copy, and site exports.
   *
   * @param {string} taskId - The long-running task ID.
   * @returns {Promise<Object>} Task details including status and progress.
   */
  async getLongTask(taskId) {
    log.debug('getLongTask called', { taskId });
    try {
      const result = await this._client.get(`longtask/${taskId}`);
      log.info('getLongTask succeeded', { taskId, status: result.status ?? result.state });
      return result;
    } catch (error) {
      log.error('getLongTask failed', { taskId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Get a paginated list of long-running tasks.
   *
   * @param {Object} [options={}] - Query options.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated long-running tasks list.
   */
  async getLongTasks({ start = 0, limit = 25 } = {}) {
    log.debug('getLongTasks called', { start, limit });
    try {
      const queryParams = { start, limit };

      const result = await this._client.get('longtask', { queryParams });
      log.info('getLongTasks succeeded', { size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getLongTasks failed', { message: error.message, status: error.status });
      throw error;
    }
  }
}
