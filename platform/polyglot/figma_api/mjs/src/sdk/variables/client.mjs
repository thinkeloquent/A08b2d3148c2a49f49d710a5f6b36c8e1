/**
 * Variables Client — Figma API SDK
 *
 * Domain client for Figma variables (Enterprise feature).
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class VariablesClient {
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
   * Get local variables in a file.
   *
   * @param {string} fileKey - The file key
   * @returns {Promise<object>} Local variables response
   * @see https://www.figma.com/developers/api#get-local-variables-endpoint
   */
  async getLocalVariables(fileKey) {
    this._logger.info('getLocalVariables', { fileKey });

    const data = await this._client.get(`/v1/files/${fileKey}/variables/local`);

    this._logger.info('getLocalVariables success', {
      fileKey,
      variableCount: data.meta?.variables ? Object.keys(data.meta.variables).length : 0,
      collectionCount: data.meta?.variableCollections ? Object.keys(data.meta.variableCollections).length : 0,
    });

    return data;
  }

  /**
   * Get published variables in a file.
   *
   * @param {string} fileKey - The file key
   * @returns {Promise<object>} Published variables response
   * @see https://www.figma.com/developers/api#get-published-variables-endpoint
   */
  async getPublishedVariables(fileKey) {
    this._logger.info('getPublishedVariables', { fileKey });

    const data = await this._client.get(`/v1/files/${fileKey}/variables/published`);

    this._logger.info('getPublishedVariables success', {
      fileKey,
      variableCount: data.meta?.variables ? Object.keys(data.meta.variables).length : 0,
      collectionCount: data.meta?.variableCollections ? Object.keys(data.meta.variableCollections).length : 0,
    });

    return data;
  }

  /**
   * Create or update variables in a file.
   *
   * @param {string} fileKey - The file key
   * @param {object} payload - Variable creation/update payload
   * @param {Array} [payload.variableCollections] - Collections to create/update
   * @param {Array} [payload.variableModes] - Modes to create/update
   * @param {Array} [payload.variables] - Variables to create/update
   * @param {Array} [payload.variableModeValues] - Mode values to set
   * @returns {Promise<object>} Create variables response
   * @see https://www.figma.com/developers/api#post-variables-endpoint
   */
  async createVariables(fileKey, payload) {
    this._logger.info('createVariables', {
      fileKey,
      collectionCount: payload.variableCollections?.length ?? 0,
      variableCount: payload.variables?.length ?? 0,
    });

    const data = await this._client.post(`/v1/files/${fileKey}/variables`, payload);

    this._logger.info('createVariables success', { fileKey });

    return data;
  }
}
