/**
 * @module services/attachment-service
 * @description Service for Confluence Attachment REST API operations.
 *
 * Handles file attachments on content: listing, uploading, updating data
 * and metadata, moving between content items, and deleting attachments
 * or specific attachment versions.
 *
 * Confluence Data Center REST API v9.2.3.
 */

import { createLogger } from '../logger.mjs';

const log = createLogger('confluence_api', import.meta.url);

/**
 * Service class for Confluence attachment operations.
 *
 * File uploads use multipart/form-data with the `X-Atlassian-Token: nocheck`
 * header required by Confluence to bypass XSRF protection on uploads.
 */
export class AttachmentService {
  /**
   * @param {import('../client/FetchClient.mjs').FetchClient} client
   *   The Confluence fetch client instance.
   */
  constructor(client) {
    /** @private */
    this._client = client;
  }

  /**
   * Get attachments for a content item.
   *
   * @param {string} contentId - The parent content ID.
   * @param {Object} [options={}] - Query options.
   * @param {string|string[]} [options.expand] - Fields to expand.
   * @param {number} [options.start=0] - Pagination start offset.
   * @param {number} [options.limit=25] - Maximum number of results.
   * @returns {Promise<Object>} Paginated attachment list.
   */
  async getAttachments(contentId, { expand, start = 0, limit = 25 } = {}) {
    log.debug('getAttachments called', { contentId, expand, start, limit });
    try {
      const queryParams = { start, limit };
      if (expand !== undefined) queryParams.expand = Array.isArray(expand) ? expand.join(',') : expand;

      const result = await this._client.get(`content/${contentId}/child/attachment`, { queryParams });
      log.info('getAttachments succeeded', { contentId, size: result.size ?? result.results?.length });
      return result;
    } catch (error) {
      log.error('getAttachments failed', { contentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Upload a new attachment to a content item.
   *
   * Constructs a multipart/form-data payload containing the file binary,
   * optional comment, and minor-edit flag. Sends with the required
   * `X-Atlassian-Token: nocheck` header.
   *
   * @param {string} contentId - The parent content ID.
   * @param {Buffer|Uint8Array} fileBuffer - The file content as a binary buffer.
   * @param {string} filename - The filename for the attachment.
   * @param {Object} [options={}] - Upload options.
   * @param {string} [options.comment] - Attachment comment visible in Confluence.
   * @param {boolean} [options.minorEdit=false] - If true, suppresses notification emails.
   * @returns {Promise<Object>} The created attachment object.
   */
  async createAttachment(contentId, fileBuffer, filename, { comment, minorEdit = false } = {}) {
    log.debug('createAttachment called', { contentId, filename, comment, minorEdit });
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.set('file', blob, filename);
      if (comment !== undefined) formData.set('comment', String(comment));
      formData.set('minorEdit', String(minorEdit));

      const result = await this._client.post(
        `content/${contentId}/child/attachment`,
        formData,
        { headers: { 'X-Atlassian-Token': 'nocheck' } },
      );
      log.info('createAttachment succeeded', { contentId, filename });
      return result;
    } catch (error) {
      log.error('createAttachment failed', { contentId, filename, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update the binary data (file content) of an existing attachment.
   *
   * @param {string} contentId - The parent content ID.
   * @param {string} attachmentId - The attachment ID.
   * @param {Buffer|Uint8Array} fileBuffer - The new file content.
   * @param {string} filename - The new filename.
   * @param {Object} [options={}] - Upload options.
   * @param {string} [options.comment] - Attachment comment.
   * @param {boolean} [options.minorEdit=false] - If true, suppresses notifications.
   * @returns {Promise<Object>} The updated attachment object.
   */
  async updateAttachmentData(contentId, attachmentId, fileBuffer, filename, { comment, minorEdit = false } = {}) {
    log.debug('updateAttachmentData called', { contentId, attachmentId, filename, comment, minorEdit });
    try {
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: 'application/octet-stream' });
      formData.set('file', blob, filename);
      if (comment !== undefined) formData.set('comment', String(comment));
      formData.set('minorEdit', String(minorEdit));

      const result = await this._client.post(
        `content/${contentId}/child/attachment/${attachmentId}/data`,
        formData,
        { headers: { 'X-Atlassian-Token': 'nocheck' } },
      );
      log.info('updateAttachmentData succeeded', { contentId, attachmentId, filename });
      return result;
    } catch (error) {
      log.error('updateAttachmentData failed', { contentId, attachmentId, filename, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Update the metadata (title, media type, etc.) of an existing attachment.
   *
   * @param {string} contentId - The parent content ID.
   * @param {string} attachmentId - The attachment ID.
   * @param {Object} data - Metadata update payload (title, version, etc.).
   * @returns {Promise<Object>} The updated attachment metadata.
   */
  async updateAttachmentMetadata(contentId, attachmentId, data) {
    log.debug('updateAttachmentMetadata called', { contentId, attachmentId });
    try {
      const result = await this._client.put(
        `content/${contentId}/child/attachment/${attachmentId}`,
        data,
      );
      log.info('updateAttachmentMetadata succeeded', { contentId, attachmentId });
      return result;
    } catch (error) {
      log.error('updateAttachmentMetadata failed', { contentId, attachmentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Move an attachment to a different content item.
   *
   * @param {string} contentId - The current parent content ID.
   * @param {string} attachmentId - The attachment ID.
   * @param {string} newContentId - The target content ID.
   * @returns {Promise<Object>} The moved attachment object.
   */
  async moveAttachment(contentId, attachmentId, newContentId) {
    log.debug('moveAttachment called', { contentId, attachmentId, newContentId });
    try {
      const result = await this._client.put(
        `content/${contentId}/child/attachment/${attachmentId}`,
        { id: attachmentId, type: 'attachment', container: { id: newContentId, type: 'page' } },
      );
      log.info('moveAttachment succeeded', { contentId, attachmentId, newContentId });
      return result;
    } catch (error) {
      log.error('moveAttachment failed', { contentId, attachmentId, newContentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete an attachment from a content item.
   *
   * @param {string} contentId - The parent content ID.
   * @param {string} attachmentId - The attachment ID.
   * @returns {Promise<void>}
   */
  async deleteAttachment(contentId, attachmentId) {
    log.debug('deleteAttachment called', { contentId, attachmentId });
    try {
      const result = await this._client.delete(
        `content/${contentId}/child/attachment/${attachmentId}`,
      );
      log.info('deleteAttachment succeeded', { contentId, attachmentId });
      return result;
    } catch (error) {
      log.error('deleteAttachment failed', { contentId, attachmentId, message: error.message, status: error.status });
      throw error;
    }
  }

  /**
   * Delete a specific version of an attachment.
   *
   * @param {string} contentId - The parent content ID.
   * @param {string} attachmentId - The attachment ID.
   * @param {number} version - The version number to delete.
   * @returns {Promise<void>}
   */
  async deleteAttachmentVersion(contentId, attachmentId, version) {
    log.debug('deleteAttachmentVersion called', { contentId, attachmentId, version });
    try {
      const result = await this._client.delete(
        `content/${contentId}/child/attachment/${attachmentId}/version/${version}`,
      );
      log.info('deleteAttachmentVersion succeeded', { contentId, attachmentId, version });
      return result;
    } catch (error) {
      log.error('deleteAttachmentVersion failed', { contentId, attachmentId, version, message: error.message, status: error.status });
      throw error;
    }
  }
}
