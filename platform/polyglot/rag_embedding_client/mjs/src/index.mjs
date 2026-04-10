/**
 * @fileoverview Public API barrel for @internal/rag-embedding-client.
 */

export { EmbeddingClient } from './client.mjs';
export { EmbeddingBatchRejectedError, ForbiddenRejection } from './exceptions.mjs';
export { HttpMethods } from './http-methods.mjs';
export { DEFAULT_BASE_URL, EMBEDDINGS_PATH, MAX_BATCH_SIZE, getOpenAIKwargs } from '@internal/rag-embedding-config';
