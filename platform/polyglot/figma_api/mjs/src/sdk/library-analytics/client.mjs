/**
 * Library Analytics Client — Figma API SDK
 *
 * Domain client for Figma library analytics: actions and usages.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class LibraryAnalyticsClient {
  /**
   * @param {import('../client.mjs').FigmaClient} client
   * @param {object} [options]
   * @param {object} [options.logger] - Custom logger instance
   */
  constructor(client, options = {}) {
    this._client = client;
    this._logger = options.logger || log;
  }

  /**
   * Get library actions analytics for a team.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {string} [options.startDate] - Start date (ISO 8601)
   * @param {string} [options.endDate] - End date (ISO 8601)
   * @param {string} [options.groupBy] - Group results by field
   * @param {string} [options.order] - Sort order (asc or desc)
   * @param {string} [options.cursor] - Pagination cursor
   * @param {number} [options.pageSize] - Number of items per page
   * @returns {Promise<object>} Library actions analytics response
   * @see https://www.figma.com/developers/api#get-library-analytics-actions-endpoint
   */
  async getActions(teamId, { startDate, endDate, groupBy, order, cursor, pageSize } = {}) {
    this._logger.info('getActions', { teamId, startDate, endDate, groupBy, order });

    const params = {};
    if (startDate !== undefined) params.start_date = startDate;
    if (endDate !== undefined) params.end_date = endDate;
    if (groupBy !== undefined) params.group_by = groupBy;
    if (order !== undefined) params.order = order;
    if (cursor !== undefined) params.cursor = cursor;
    if (pageSize !== undefined) params.page_size = pageSize;

    const data = await this._client.get(`/v1/analytics/libraries/${teamId}/actions`, { params });

    this._logger.info('getActions success', {
      teamId,
      rowCount: data.rows?.length ?? 0,
    });

    return data;
  }

  /**
   * Get library usages analytics for a team.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {string} [options.startDate] - Start date (ISO 8601)
   * @param {string} [options.endDate] - End date (ISO 8601)
   * @param {string} [options.groupBy] - Group results by field
   * @param {string} [options.order] - Sort order (asc or desc)
   * @param {string} [options.cursor] - Pagination cursor
   * @param {number} [options.pageSize] - Number of items per page
   * @returns {Promise<object>} Library usages analytics response
   * @see https://www.figma.com/developers/api#get-library-analytics-usages-endpoint
   */
  async getUsages(teamId, { startDate, endDate, groupBy, order, cursor, pageSize } = {}) {
    this._logger.info('getUsages', { teamId, startDate, endDate, groupBy, order });

    const params = {};
    if (startDate !== undefined) params.start_date = startDate;
    if (endDate !== undefined) params.end_date = endDate;
    if (groupBy !== undefined) params.group_by = groupBy;
    if (order !== undefined) params.order = order;
    if (cursor !== undefined) params.cursor = cursor;
    if (pageSize !== undefined) params.page_size = pageSize;

    const data = await this._client.get(`/v1/analytics/libraries/${teamId}/usages`, { params });

    this._logger.info('getUsages success', {
      teamId,
      rowCount: data.rows?.length ?? 0,
    });

    return data;
  }
}
