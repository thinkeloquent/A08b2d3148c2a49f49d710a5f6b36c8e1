/**
 * Tags Module — Statsig Console API Client
 *
 * Domain module for managing Statsig tags.
 * Tags are used to categorize and organize configs (gates, experiments, etc.).
 *
 * @see https://docs.statsig.com/console-api/tags
 */

import { create } from '../../logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Domain client for Statsig tag operations.
 *
 * @example
 * const tags = new TagsModule(client);
 * const list = await tags.list();
 * const tag = await tags.create({ name: 'production' });
 */
export class TagsModule {
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
   * List all tags.
   *
   * @param {object} [params={}] - Query parameters
   * @returns {Promise<Array<object>>} Array of tag objects
   */
  async list(params = {}) {
    this._logger.info('list tags');
    const data = await this._client.list('/tags', { params });
    this._logger.info('list tags complete', { count: data.length });
    return data;
  }

  /**
   * Create a new tag.
   *
   * @param {object} body - Tag configuration
   * @param {string} body.name - Tag name
   * @param {string} [body.description] - Tag description
   * @returns {Promise<object>} Created tag object
   */
  async create(body) {
    this._logger.info('create tag', { name: body?.name });
    return this._client.post('/tags', body);
  }

  /**
   * Update a tag.
   *
   * @param {string} tagId - The tag ID
   * @param {object} body - Tag configuration
   * @returns {Promise<object>} Updated tag object
   */
  async update(tagId, body) {
    this._logger.info('update tag', { tagId });
    return this._client.patch(`/tags/${encodeURIComponent(tagId)}`, body);
  }

  /**
   * Delete a tag.
   *
   * @param {string} tagId - The tag ID
   * @returns {Promise<object>} Deletion confirmation
   */
  async delete(tagId) {
    this._logger.info('delete tag', { tagId });
    return this._client.delete(`/tags/${encodeURIComponent(tagId)}`);
  }
}
