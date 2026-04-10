/**
 * Components Client — Figma API SDK
 *
 * Domain client for Figma components, component sets, and styles.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class ComponentsClient {
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
   * Get a component by key.
   *
   * @param {string} key - The component key
   * @returns {Promise<object>} Component metadata
   * @see https://www.figma.com/developers/api#get-component-endpoint
   */
  async getComponent(key) {
    this._logger.info('getComponent', { key });

    const data = await this._client.get(`/v1/components/${key}`);

    this._logger.info('getComponent success', {
      key,
      name: data.meta?.name,
    });

    return data;
  }

  /**
   * Get all components in a file.
   *
   * @param {string} fileKey - The file key
   * @returns {Promise<object>} File components response
   * @see https://www.figma.com/developers/api#get-file-components-endpoint
   */
  async getFileComponents(fileKey) {
    this._logger.info('getFileComponents', { fileKey });

    const data = await this._client.get(`/v1/files/${fileKey}/components`);

    this._logger.info('getFileComponents success', {
      fileKey,
      componentCount: data.meta?.components?.length ?? 0,
    });

    return data;
  }

  /**
   * Get components for a team with pagination.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {number} [options.pageSize] - Number of items per page
   * @param {string} [options.cursor] - Pagination cursor
   * @returns {Promise<object>} Team components response
   * @see https://www.figma.com/developers/api#get-team-components-endpoint
   */
  async getTeamComponents(teamId, { pageSize, cursor } = {}) {
    this._logger.info('getTeamComponents', { teamId, pageSize, cursor });

    const params = {};
    if (pageSize !== undefined) params.page_size = pageSize;
    if (cursor !== undefined) params.cursor = cursor;

    const data = await this._client.get(`/v1/teams/${teamId}/components`, { params });

    this._logger.info('getTeamComponents success', {
      teamId,
      componentCount: data.meta?.components?.length ?? 0,
    });

    return data;
  }

  /**
   * Get a component set by key.
   *
   * @param {string} key - The component set key
   * @returns {Promise<object>} Component set metadata
   * @see https://www.figma.com/developers/api#get-component-set-endpoint
   */
  async getComponentSet(key) {
    this._logger.info('getComponentSet', { key });

    const data = await this._client.get(`/v1/component_sets/${key}`);

    this._logger.info('getComponentSet success', {
      key,
      name: data.meta?.name,
    });

    return data;
  }

  /**
   * Get component sets for a team with pagination.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {number} [options.pageSize] - Number of items per page
   * @param {string} [options.cursor] - Pagination cursor
   * @returns {Promise<object>} Team component sets response
   * @see https://www.figma.com/developers/api#get-team-component-sets-endpoint
   */
  async getTeamComponentSets(teamId, { pageSize, cursor } = {}) {
    this._logger.info('getTeamComponentSets', { teamId, pageSize, cursor });

    const params = {};
    if (pageSize !== undefined) params.page_size = pageSize;
    if (cursor !== undefined) params.cursor = cursor;

    const data = await this._client.get(`/v1/teams/${teamId}/component_sets`, { params });

    this._logger.info('getTeamComponentSets success', {
      teamId,
      componentSetCount: data.meta?.component_sets?.length ?? 0,
    });

    return data;
  }

  /**
   * Get styles for a team with pagination.
   *
   * @param {string} teamId - The team ID
   * @param {object} [options]
   * @param {number} [options.pageSize] - Number of items per page
   * @param {string} [options.cursor] - Pagination cursor
   * @returns {Promise<object>} Team styles response
   * @see https://www.figma.com/developers/api#get-team-styles-endpoint
   */
  async getTeamStyles(teamId, { pageSize, cursor } = {}) {
    this._logger.info('getTeamStyles', { teamId, pageSize, cursor });

    const params = {};
    if (pageSize !== undefined) params.page_size = pageSize;
    if (cursor !== undefined) params.cursor = cursor;

    const data = await this._client.get(`/v1/teams/${teamId}/styles`, { params });

    this._logger.info('getTeamStyles success', {
      teamId,
      styleCount: data.meta?.styles?.length ?? 0,
    });

    return data;
  }

  /**
   * Get a style by key.
   *
   * @param {string} key - The style key
   * @returns {Promise<object>} Style metadata
   * @see https://www.figma.com/developers/api#get-style-endpoint
   */
  async getStyle(key) {
    this._logger.info('getStyle', { key });

    const data = await this._client.get(`/v1/styles/${key}`);

    this._logger.info('getStyle success', {
      key,
      name: data.meta?.name,
    });

    return data;
  }
}
