/**
 * Dev Resources Client — Figma API SDK
 *
 * Domain client for Figma dev resources: list, create, update, and delete.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class DevResourcesClient {
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
   * List dev resources in a file.
   *
   * @param {string} fileKey - The file key
   * @param {object} [options]
   * @param {string} [options.nodeId] - Filter by node ID
   * @returns {Promise<object>} Dev resources response
   * @see https://www.figma.com/developers/api#get-dev-resources-endpoint
   */
  async listDevResources(fileKey, { nodeId } = {}) {
    this._logger.info('listDevResources', { fileKey, nodeId });

    const params = {};
    if (nodeId !== undefined) params.node_id = nodeId;

    const data = await this._client.get(`/v1/files/${fileKey}/dev_resources`, { params });

    this._logger.info('listDevResources success', {
      fileKey,
      resourceCount: data.dev_resources?.length ?? 0,
    });

    return data;
  }

  /**
   * Create dev resources in a file.
   *
   * @param {string} fileKey - The file key
   * @param {Array<object>} devResources - Array of dev resource objects to create
   * @returns {Promise<object>} Created dev resources response
   * @see https://www.figma.com/developers/api#post-dev-resources-endpoint
   */
  async createDevResources(fileKey, devResources) {
    this._logger.info('createDevResources', {
      fileKey,
      resourceCount: devResources?.length ?? 0,
    });

    const body = { dev_resources: devResources };

    const data = await this._client.post(`/v1/files/${fileKey}/dev_resources`, body);

    this._logger.info('createDevResources success', {
      fileKey,
      createdCount: data.links_created?.length ?? 0,
    });

    return data;
  }

  /**
   * Update dev resources in a file.
   *
   * @param {string} fileKey - The file key
   * @param {Array<object>} devResources - Array of dev resource objects to update
   * @returns {Promise<object>} Updated dev resources response
   * @see https://www.figma.com/developers/api#put-dev-resources-endpoint
   */
  async updateDevResources(fileKey, devResources) {
    this._logger.info('updateDevResources', {
      fileKey,
      resourceCount: devResources?.length ?? 0,
    });

    const body = { dev_resources: devResources };

    const data = await this._client.put(`/v1/files/${fileKey}/dev_resources`, body);

    this._logger.info('updateDevResources success', { fileKey });

    return data;
  }

  /**
   * Delete a dev resource from a file.
   *
   * @param {string} fileKey - The file key
   * @param {string} devResourceId - The dev resource ID to delete
   * @returns {Promise<object>} Delete response
   * @see https://www.figma.com/developers/api#delete-dev-resource-endpoint
   */
  async deleteDevResource(fileKey, devResourceId) {
    this._logger.info('deleteDevResource', { fileKey, devResourceId });

    const data = await this._client.delete(`/v1/files/${fileKey}/dev_resources/${devResourceId}`);

    this._logger.info('deleteDevResource success', { fileKey, devResourceId });

    return data;
  }
}
