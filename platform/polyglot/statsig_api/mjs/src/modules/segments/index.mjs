/**
 * Segments Module — Statsig Console API Client
 *
 * Domain module for managing Statsig segments.
 * Segments define reusable groups of users for targeting.
 *
 * @see https://docs.statsig.com/console-api/segments
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig segment operations.
 *
 * @example
 * const segments = new SegmentsModule(client);
 * const list = await segments.list();
 * const segment = await segments.get('my_segment');
 */
export class SegmentsModule {
  /**
   * @param {import('../../client.mjs').StatsigClient} client - The core HTTP client
   * @param {object} [options={}]
   * @param {object} [options.logger] - Custom logger instance
   */
  constructor(client, options = {}) {
    /** @type {import('../../client.mjs').StatsigClient} */
    this._client = client;
    /** @type {object} */
    this._logger = options.logger || log;
  }

  /**
   * List all segments.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of segment objects
   */
  async list(params = {}) {
    this._logger.info('list segments');
    const data = await this._client.list('/segments', { params });
    this._logger.info('list segments complete', { count: data.length });
    return data;
  }

  /**
   * Get a single segment by ID.
   *
   * @param {string} segmentId - The segment ID or name
   * @returns {Promise<object>} Segment object
   */
  async get(segmentId) {
    this._logger.info('get segment', { segmentId });
    return this._client.get(`/segments/${encodeURIComponent(segmentId)}`);
  }

  /**
   * Create a new segment.
   *
   * @param {object} body - Segment configuration
   * @param {string} body.name - Segment name
   * @returns {Promise<object>} Created segment object
   */
  async create(body) {
    this._logger.info('create segment', { name: body?.name });
    return this._client.post('/segments', body);
  }

  /**
   * Fully update a segment (PUT).
   *
   * @param {string} segmentId - The segment ID or name
   * @param {object} body - Full segment configuration
   * @returns {Promise<object>} Updated segment object
   */
  async update(segmentId, body) {
    this._logger.info('update segment', { segmentId });
    return this._client.put(`/segments/${encodeURIComponent(segmentId)}`, body);
  }

  /**
   * Partially update a segment (PATCH).
   *
   * @param {string} segmentId - The segment ID or name
   * @param {object} body - Partial segment fields to update
   * @returns {Promise<object>} Updated segment object
   */
  async patch(segmentId, body) {
    this._logger.info('patch segment', { segmentId });
    return this._client.patch(`/segments/${encodeURIComponent(segmentId)}`, body);
  }

  /**
   * Delete a segment.
   *
   * @param {string} segmentId - The segment ID or name
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(segmentId) {
    this._logger.info('delete segment', { segmentId });
    return this._client.delete(`/segments/${encodeURIComponent(segmentId)}`);
  }
}
