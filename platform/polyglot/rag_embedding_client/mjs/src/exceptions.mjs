/**
 * @fileoverview Custom exceptions for the RAG embedding client.
 *
 * {@link EmbeddingBatchRejectedError} is thrown when one or more sub-batches
 * receive HTTP 403 Forbidden during `embedDocuments()`.  It carries any
 * partial embeddings that succeeded and a list of {@link ForbiddenRejection}
 * records describing the rejected sub-batches.
 */

/**
 * Details about a single sub-batch rejected with HTTP 403.
 */
export class ForbiddenRejection {
  /**
   * @param {object} opts
   * @param {number} opts.batchIndex - 0-based index of the sub-batch
   * @param {number} opts.textCount  - Number of texts in the rejected sub-batch
   * @param {string} opts.contentPreview - First 200 chars of the first text
   * @param {number} [opts.statusCode=403] - HTTP status code
   * @param {string} [opts.errorBody=''] - Raw response body (truncated to 1000 chars)
   */
  constructor({ batchIndex, textCount, contentPreview, statusCode = 403, errorBody = '' }) {
    this.batchIndex = batchIndex;
    this.textCount = textCount;
    this.contentPreview = contentPreview;
    this.statusCode = statusCode;
    this.errorBody = errorBody;
  }
}

/**
 * Thrown when sub-batches are rejected with HTTP 403 Forbidden.
 *
 * Callers can inspect `partialEmbeddings` for the results that succeeded
 * and `rejections` for details about the rejected sub-batches.
 */
export class EmbeddingBatchRejectedError extends Error {
  /**
   * @param {string} message
   * @param {object} [opts]
   * @param {number[][]} [opts.partialEmbeddings=[]]
   * @param {ForbiddenRejection[]} [opts.rejections=[]]
   */
  constructor(message, { partialEmbeddings = [], rejections = [] } = {}) {
    super(message);
    this.name = 'EmbeddingBatchRejectedError';
    this.partialEmbeddings = partialEmbeddings;
    this.rejections = rejections;
  }
}
