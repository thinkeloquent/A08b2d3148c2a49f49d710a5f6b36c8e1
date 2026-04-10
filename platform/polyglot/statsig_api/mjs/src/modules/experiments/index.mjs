/**
 * Experiments Module — Statsig Console API Client
 *
 * Domain module for managing Statsig experiments (A/B tests).
 * Wraps StatsigClient HTTP methods with experiment-specific convenience methods.
 *
 * @see https://docs.statsig.com/console-api/experiments
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig experiment operations.
 *
 * @example
 * const experiments = new ExperimentsModule(client);
 * const list = await experiments.list();
 * const exp = await experiments.get('my_experiment');
 */
export class ExperimentsModule {
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
   * List all experiments.
   *
   * @param {object} [params={}] - Query parameters (limit, page, etc.)
   * @returns {Promise<Array<object>>} Array of experiment objects
   */
  async list(params = {}) {
    this._logger.info('list experiments');
    const data = await this._client.list('/experiments', { params });
    this._logger.info('list experiments complete', { count: data.length });
    return data;
  }

  /**
   * Get a single experiment by ID.
   *
   * @param {string} experimentId - The experiment ID or name
   * @returns {Promise<object>} Experiment object
   */
  async get(experimentId) {
    this._logger.info('get experiment', { experimentId });
    return this._client.get(`/experiments/${encodeURIComponent(experimentId)}`);
  }

  /**
   * Create a new experiment.
   *
   * @param {object} body - Experiment configuration
   * @param {string} body.name - Experiment name
   * @returns {Promise<object>} Created experiment object
   */
  async create(body) {
    this._logger.info('create experiment', { name: body?.name });
    return this._client.post('/experiments', body);
  }

  /**
   * Fully update an experiment (PUT).
   *
   * @param {string} experimentId - The experiment ID or name
   * @param {object} body - Full experiment configuration
   * @returns {Promise<object>} Updated experiment object
   */
  async update(experimentId, body) {
    this._logger.info('update experiment', { experimentId });
    return this._client.put(`/experiments/${encodeURIComponent(experimentId)}`, body);
  }

  /**
   * Partially update an experiment (PATCH).
   *
   * @param {string} experimentId - The experiment ID or name
   * @param {object} body - Partial experiment fields to update
   * @returns {Promise<object>} Updated experiment object
   */
  async patch(experimentId, body) {
    this._logger.info('patch experiment', { experimentId });
    return this._client.patch(`/experiments/${encodeURIComponent(experimentId)}`, body);
  }

  /**
   * Delete an experiment.
   *
   * @param {string} experimentId - The experiment ID or name
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(experimentId) {
    this._logger.info('delete experiment', { experimentId });
    return this._client.delete(`/experiments/${encodeURIComponent(experimentId)}`);
  }

  /**
   * Start an experiment.
   *
   * @param {string} experimentId - The experiment ID or name
   * @returns {Promise<object>} Updated experiment object
   */
  async start(experimentId) {
    this._logger.info('start experiment', { experimentId });
    return this._client.post(`/experiments/${encodeURIComponent(experimentId)}/start`);
  }

  /**
   * Get experiment overrides.
   *
   * @param {string} experimentId - The experiment ID or name
   * @returns {Promise<object>} Overrides data
   */
  async getOverrides(experimentId) {
    this._logger.info('get experiment overrides', { experimentId });
    return this._client.get(`/experiments/${encodeURIComponent(experimentId)}/overrides`);
  }

  /**
   * Update experiment overrides.
   *
   * @param {string} experimentId - The experiment ID or name
   * @param {object} body - Overrides configuration
   * @returns {Promise<object>} Updated overrides data
   */
  async updateOverrides(experimentId, body) {
    this._logger.info('update experiment overrides', { experimentId });
    return this._client.put(`/experiments/${encodeURIComponent(experimentId)}/overrides`, body);
  }

  /**
   * Get pulse (metric lift) results for an experiment.
   *
   * @param {string} experimentId - The experiment ID or name
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<object>} Pulse results data
   */
  async pulseResults(experimentId, params = {}) {
    this._logger.info('get pulse results', { experimentId });
    return this._client.get(`/experiments/${encodeURIComponent(experimentId)}/pulse_results`, { params });
  }
}
