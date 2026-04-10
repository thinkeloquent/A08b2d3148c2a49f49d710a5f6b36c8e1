/**
 * Gates Module — Statsig Console API Client
 *
 * Domain module for managing Statsig feature gates.
 * Wraps StatsigClient HTTP methods with gate-specific convenience methods.
 *
 * @see https://docs.statsig.com/console-api/gates
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig feature gate operations.
 *
 * @example
 * const gates = new GatesModule(client);
 * const list = await gates.list();
 * const gate = await gates.get('my_gate');
 */
export class GatesModule {
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
   * List all feature gates.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of gate objects
   */
  async list(params = {}) {
    this._logger.info('list gates');
    const data = await this._client.list('/gates', { params });
    this._logger.info('list gates complete', { count: data.length });
    return data;
  }

  /**
   * Get a single feature gate by ID.
   *
   * @param {string} gateId - The gate ID or name
   * @returns {Promise<object>} Gate object
   */
  async get(gateId) {
    this._logger.info('get gate', { gateId });
    return this._client.get(`/gates/${encodeURIComponent(gateId)}`);
  }

  /**
   * Create a new feature gate.
   *
   * @param {object} body - Gate configuration
   * @param {string} body.name - Gate name
   * @returns {Promise<object>} Created gate object
   */
  async create(body) {
    this._logger.info('create gate', { name: body?.name });
    return this._client.post('/gates', body);
  }

  /**
   * Fully update a feature gate (PUT).
   *
   * @param {string} gateId - The gate ID or name
   * @param {object} body - Full gate configuration
   * @returns {Promise<object>} Updated gate object
   */
  async update(gateId, body) {
    this._logger.info('update gate', { gateId });
    return this._client.put(`/gates/${encodeURIComponent(gateId)}`, body);
  }

  /**
   * Partially update a feature gate (PATCH).
   *
   * @param {string} gateId - The gate ID or name
   * @param {object} body - Partial gate fields to update
   * @returns {Promise<object>} Updated gate object
   */
  async patch(gateId, body) {
    this._logger.info('patch gate', { gateId });
    return this._client.patch(`/gates/${encodeURIComponent(gateId)}`, body);
  }

  /**
   * Delete a feature gate.
   *
   * @param {string} gateId - The gate ID or name
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(gateId) {
    this._logger.info('delete gate', { gateId });
    return this._client.delete(`/gates/${encodeURIComponent(gateId)}`);
  }

  /**
   * Get gate overrides.
   *
   * @param {string} gateId - The gate ID or name
   * @returns {Promise<object>} Overrides data
   */
  async getOverrides(gateId) {
    this._logger.info('get gate overrides', { gateId });
    return this._client.get(`/gates/${encodeURIComponent(gateId)}/overrides`);
  }

  /**
   * Update gate overrides.
   *
   * @param {string} gateId - The gate ID or name
   * @param {object} body - Overrides configuration
   * @returns {Promise<object>} Updated overrides data
   */
  async updateOverrides(gateId, body) {
    this._logger.info('update gate overrides', { gateId });
    return this._client.put(`/gates/${encodeURIComponent(gateId)}/overrides`, body);
  }
}
