/**
 * Reports Module — Statsig Console API Client
 *
 * Domain module for managing Statsig reports.
 * Reports provide aggregated data views for experiments and metrics.
 *
 * @see https://docs.statsig.com/console-api/reports
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig report operations.
 *
 * @example
 * const reports = new ReportsModule(client);
 * const report = await reports.get('experiment_results', { id: 'my_experiment' });
 */
export class ReportsModule {
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
   * List all reports.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of report objects
   */
  async list(params = {}) {
    this._logger.info('list reports');
    const data = await this._client.list('/reports', { params });
    this._logger.info('list reports complete', { count: data.length });
    return data;
  }

  /**
   * Get a specific report.
   *
   * @param {string} reportType - The report type or ID
   * @param {object} [params={}] - Query parameters (e.g. { id: 'experiment_id' })
   * @returns {Promise<object>} Report data
   */
  async get(reportType, params = {}) {
    this._logger.info('get report', { reportType });
    return this._client.get(`/reports/${encodeURIComponent(reportType)}`, { params });
  }
}
