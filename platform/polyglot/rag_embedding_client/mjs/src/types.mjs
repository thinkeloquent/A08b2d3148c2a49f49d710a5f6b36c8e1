/**
 * @fileoverview JSDoc type definitions for the embedding client.
 */

/**
 * @typedef {Object} EmbeddingResponse
 * @property {Array<{embedding: number[], index: number}>} data
 * @property {string} model
 * @property {Object} usage
 */

/**
 * @typedef {Object} EmbeddingClientOptions
 * @property {string} model - Embedding model name
 * @property {string} apiKey - API key for authentication
 * @property {string} [baseUrl] - API base URL (default: OpenAI)
 * @property {string} [organization] - Organization ID
 * @property {string} [proxyUrl] - HTTP/SOCKS proxy URL
 * @property {number} [timeout] - Request timeout in ms (default: 120000)
 * @property {boolean} [verifySsl] - Whether to verify SSL certificates (default: true)
 * @property {string} [caBundle] - Path to CA certificate bundle
 */

export {};
