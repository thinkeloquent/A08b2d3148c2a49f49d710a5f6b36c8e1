/**
 * Layers Module — Statsig Console API Client
 *
 * Domain module for managing Statsig layers.
 * Layers allow multiple experiments to share parameters without conflicting.
 *
 * @see https://docs.statsig.com/console-api/layers
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig layer operations.
 *
 * @example
 * const layers = new LayersModule(client);
 * const list = await layers.list();
 * const layer = await layers.get('my_layer');
 */
export class LayersModule {
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
   * List all layers.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of layer objects
   */
  async list(params = {}) {
    this._logger.info('list layers');
    const data = await this._client.list('/layers', { params });
    this._logger.info('list layers complete', { count: data.length });
    return data;
  }

  /**
   * Get a single layer by ID.
   *
   * @param {string} layerId - The layer ID or name
   * @returns {Promise<object>} Layer object
   */
  async get(layerId) {
    this._logger.info('get layer', { layerId });
    return this._client.get(`/layers/${encodeURIComponent(layerId)}`);
  }

  /**
   * Create a new layer.
   *
   * @param {object} body - Layer configuration
   * @param {string} body.name - Layer name
   * @returns {Promise<object>} Created layer object
   */
  async create(body) {
    this._logger.info('create layer', { name: body?.name });
    return this._client.post('/layers', body);
  }

  /**
   * Fully update a layer (PUT).
   *
   * @param {string} layerId - The layer ID or name
   * @param {object} body - Full layer configuration
   * @returns {Promise<object>} Updated layer object
   */
  async update(layerId, body) {
    this._logger.info('update layer', { layerId });
    return this._client.put(`/layers/${encodeURIComponent(layerId)}`, body);
  }

  /**
   * Partially update a layer (PATCH).
   *
   * @param {string} layerId - The layer ID or name
   * @param {object} body - Partial layer fields to update
   * @returns {Promise<object>} Updated layer object
   */
  async patch(layerId, body) {
    this._logger.info('patch layer', { layerId });
    return this._client.patch(`/layers/${encodeURIComponent(layerId)}`, body);
  }

  /**
   * Delete a layer.
   *
   * @param {string} layerId - The layer ID or name
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(layerId) {
    this._logger.info('delete layer', { layerId });
    return this._client.delete(`/layers/${encodeURIComponent(layerId)}`);
  }
}
