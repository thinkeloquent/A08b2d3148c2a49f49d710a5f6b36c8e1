/**
 * Comments Client — Figma API SDK
 *
 * Domain client for Figma file comments: list, add, and delete.
 * Wraps FigmaClient HTTP methods with structured logging.
 */

import { create } from '../../logger.mjs';

const log = create('figma-api', import.meta.url);

export class CommentsClient {
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
   * List comments on a file.
   *
   * @param {string} fileKey - The file key
   * @param {object} [options]
   * @param {boolean} [options.as_md] - Return comments as markdown
   * @returns {Promise<object>} Comments response
   * @see https://www.figma.com/developers/api#get-comments-endpoint
   */
  async listComments(fileKey, { as_md } = {}) {
    this._logger.info('listComments', { fileKey, as_md });

    const params = {};
    if (as_md !== undefined) params.as_md = as_md;

    const data = await this._client.get(`/v1/files/${fileKey}/comments`, { params });

    this._logger.info('listComments success', {
      fileKey,
      commentCount: data.comments?.length ?? 0,
    });

    return data;
  }

  /**
   * Add a comment to a file.
   *
   * @param {string} fileKey - The file key
   * @param {object} [options]
   * @param {string} options.message - The comment text
   * @param {object} [options.clientMeta] - Position metadata (x, y or node_id + node_offset)
   * @param {string} [options.commentId] - Parent comment ID for replies
   * @returns {Promise<object>} Created comment response
   * @see https://www.figma.com/developers/api#post-comments-endpoint
   */
  async addComment(fileKey, { message, clientMeta, commentId } = {}) {
    this._logger.info('addComment', { fileKey, hasClientMeta: !!clientMeta, commentId });

    const body = { message };
    if (clientMeta !== undefined) body.client_meta = clientMeta;
    if (commentId !== undefined) body.comment_id = commentId;

    const data = await this._client.post(`/v1/files/${fileKey}/comments`, body);

    this._logger.info('addComment success', {
      fileKey,
      id: data.id,
    });

    return data;
  }

  /**
   * Delete a comment from a file.
   *
   * @param {string} fileKey - The file key
   * @param {string} commentId - The comment ID to delete
   * @returns {Promise<object>} Delete response
   * @see https://www.figma.com/developers/api#delete-comments-endpoint
   */
  async deleteComment(fileKey, commentId) {
    this._logger.info('deleteComment', { fileKey, commentId });

    const data = await this._client.delete(`/v1/files/${fileKey}/comments/${commentId}`);

    this._logger.info('deleteComment success', { fileKey, commentId });

    return data;
  }
}
