/**
 * Audit Logs Module — Statsig Console API Client
 *
 * Domain module for querying Statsig audit logs.
 * Audit logs track changes made to configs, gates, experiments, etc.
 *
 * @see https://docs.statsig.com/console-api/audit-logs
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig audit log operations.
 *
 * @example
 * const auditLogs = new AuditLogsModule(client);
 * const logs = await auditLogs.list({ limit: 50 });
 */
export class AuditLogsModule {
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
   * List audit log entries.
   *
   * @param {object} [params={}] - Query parameters (limit, page, etc.)
   * @returns {Promise<Array<object>>} Array of audit log entries
   */
  async list(params = {}) {
    this._logger.info('list audit logs');
    const data = await this._client.list('/audit_logs', { params });
    this._logger.info('list audit logs complete', { count: data.length });
    return data;
  }
}
