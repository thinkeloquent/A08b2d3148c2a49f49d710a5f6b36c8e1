/**
 * Files Client — Figma API SDK
 *
 * Domain client for Figma file retrieval, nodes, images, and versions.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class FilesClient {
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
   * Get a Figma file by key.
   *
   * @param {string} fileKey - The file key
   * @param {object} [options]
   * @param {string} [options.version] - File version to retrieve
   * @param {string} [options.ids] - Comma-separated list of node IDs
   * @param {number} [options.depth] - Depth of node tree to traverse
   * @param {string} [options.geometry] - Set to "paths" to export vector data
   * @param {string} [options.pluginData] - Comma-separated plugin IDs
   * @returns {Promise<object>} File response
   * @see https://www.figma.com/developers/api#get-files-endpoint
   */
  async getFile(fileKey, { version, ids, depth, geometry, pluginData } = {}) {
    this._logger.info('getFile', { fileKey, version, ids, depth, geometry });

    const params = {};
    if (version !== undefined) params.version = version;
    if (ids !== undefined) params.ids = ids;
    if (depth !== undefined) params.depth = depth;
    if (geometry !== undefined) params.geometry = geometry;
    if (pluginData !== undefined) params.plugin_data = pluginData;

    const data = await this._client.get(`/v1/files/${fileKey}`, { params });

    this._logger.info('getFile success', {
      fileKey,
      name: data.name,
      lastModified: data.lastModified,
    });

    return data;
  }

  /**
   * Get specific nodes from a file.
   *
   * @param {string} fileKey - The file key
   * @param {string} ids - Comma-separated list of node IDs
   * @param {object} [options]
   * @param {string} [options.version] - File version to retrieve
   * @param {number} [options.depth] - Depth of node tree to traverse
   * @param {string} [options.geometry] - Set to "paths" to export vector data
   * @param {string} [options.pluginData] - Comma-separated plugin IDs
   * @returns {Promise<object>} File nodes response
   * @see https://www.figma.com/developers/api#get-file-nodes-endpoint
   */
  async getFileNodes(fileKey, ids, { version, depth, geometry, pluginData } = {}) {
    this._logger.info('getFileNodes', { fileKey, ids, version, depth, geometry });

    const params = { ids };
    if (version !== undefined) params.version = version;
    if (depth !== undefined) params.depth = depth;
    if (geometry !== undefined) params.geometry = geometry;
    if (pluginData !== undefined) params.plugin_data = pluginData;

    const data = await this._client.get(`/v1/files/${fileKey}/nodes`, { params });

    this._logger.info('getFileNodes success', {
      fileKey,
      nodeCount: data.nodes ? Object.keys(data.nodes).length : 0,
    });

    return data;
  }

  /**
   * Render images from a file.
   *
   * @param {string} fileKey - The file key
   * @param {string} ids - Comma-separated list of node IDs
   * @param {object} [options]
   * @param {number} [options.scale] - Image scale (0.01 to 4)
   * @param {string} [options.format] - Image format (jpg, png, svg, pdf)
   * @param {object} [options.svgOptions] - SVG-specific options
   * @returns {Promise<object>} Images response with URLs
   * @see https://www.figma.com/developers/api#get-images-endpoint
   */
  async getImages(fileKey, ids, { scale, format, svgOptions } = {}) {
    this._logger.info('getImages', { fileKey, ids, scale, format });

    const params = { ids };
    if (scale !== undefined) params.scale = scale;
    if (format !== undefined) params.format = format;
    if (svgOptions) {
      if (svgOptions.svgIncludeId !== undefined) params.svg_include_id = svgOptions.svgIncludeId;
      if (svgOptions.svgIncludeNode !== undefined) params.svg_include_node = svgOptions.svgIncludeNode;
      if (svgOptions.svgSimplifyStroke !== undefined) params.svg_simplify_stroke = svgOptions.svgSimplifyStroke;
      if (svgOptions.contentsOnly !== undefined) params.contents_only = svgOptions.contentsOnly;
      if (svgOptions.useAbsoluteBounds !== undefined) params.use_absolute_bounds = svgOptions.useAbsoluteBounds;
    }

    const data = await this._client.get(`/v1/images/${fileKey}`, { params });

    this._logger.info('getImages success', {
      fileKey,
      imageCount: data.images ? Object.keys(data.images).length : 0,
    });

    return data;
  }

  /**
   * Get image fill URLs for a file.
   *
   * @param {string} fileKey - The file key
   * @returns {Promise<object>} Image fills response
   * @see https://www.figma.com/developers/api#get-image-fills-endpoint
   */
  async getImageFills(fileKey) {
    this._logger.info('getImageFills', { fileKey });

    const data = await this._client.get(`/v1/files/${fileKey}/images`);

    this._logger.info('getImageFills success', {
      fileKey,
      hasImages: data.meta?.images ? Object.keys(data.meta.images).length > 0 : false,
    });

    return data;
  }

  /**
   * Get version history for a file.
   *
   * @param {string} fileKey - The file key
   * @returns {Promise<object>} File versions response
   * @see https://www.figma.com/developers/api#get-file-versions-endpoint
   */
  async getFileVersions(fileKey) {
    this._logger.info('getFileVersions', { fileKey });

    const data = await this._client.get(`/v1/files/${fileKey}/versions`);

    this._logger.info('getFileVersions success', {
      fileKey,
      versionCount: data.versions?.length ?? 0,
    });

    return data;
  }
}
