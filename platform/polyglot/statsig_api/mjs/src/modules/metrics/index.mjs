/**
 * Metrics Module — Statsig Console API Client
 *
 * Domain module for managing Statsig metrics.
 * Metrics are used to measure experiment and gate impact.
 *
 * @see https://docs.statsig.com/console-api/metrics
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig metric operations.
 *
 * @example
 * const metrics = new MetricsModule(client);
 * const list = await metrics.list();
 * const metric = await metrics.get('my_metric');
 */
export class MetricsModule {
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
   * List all metrics.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of metric objects
   */
  async list(params = {}) {
    this._logger.info('list metrics');
    const data = await this._client.list('/metrics', { params });
    this._logger.info('list metrics complete', { count: data.length });
    return data;
  }

  /**
   * Get a single metric by ID.
   *
   * @param {string} metricId - The metric ID or name
   * @returns {Promise<object>} Metric object
   */
  async get(metricId) {
    this._logger.info('get metric', { metricId });
    return this._client.get(`/metrics/${encodeURIComponent(metricId)}`);
  }

  /**
   * Create a new metric.
   *
   * @param {object} body - Metric configuration
   * @param {string} body.name - Metric name
   * @returns {Promise<object>} Created metric object
   */
  async create(body) {
    this._logger.info('create metric', { name: body?.name });
    return this._client.post('/metrics', body);
  }

  /**
   * Update a metric (PUT).
   *
   * @param {string} metricId - The metric ID or name
   * @param {object} body - Full metric configuration
   * @returns {Promise<object>} Updated metric object
   */
  async update(metricId, body) {
    this._logger.info('update metric', { metricId });
    return this._client.put(`/metrics/${encodeURIComponent(metricId)}`, body);
  }

  /**
   * Delete a metric.
   *
   * @param {string} metricId - The metric ID or name
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(metricId) {
    this._logger.info('delete metric', { metricId });
    return this._client.delete(`/metrics/${encodeURIComponent(metricId)}`);
  }
}
