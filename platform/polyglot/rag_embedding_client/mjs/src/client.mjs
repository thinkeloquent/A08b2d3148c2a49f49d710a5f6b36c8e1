/**
 * @fileoverview OpenAI-compatible embedding client using native fetch.
 *
 * Mirrors the Python HttpxEmbeddingClient with the same interface:
 * - embedDocuments(texts) -> float[][]
 * - embedQuery(text) -> float[]
 * - aEmbedQuery(text) -> Promise<float[]>
 */

import { createRequire } from 'node:module';
import { DEFAULT_BASE_URL, EMBEDDINGS_PATH, MAX_BATCH_SIZE } from '@internal/rag-embedding-config';
import { HttpMethods } from './http-methods.mjs';
import { EmbeddingBatchRejectedError, ForbiddenRejection } from './exceptions.mjs';

const _TAG = '[embedding-client]';

/**
 * Build authorization headers for the OpenAI-compatible API.
 * @param {string} apiKey
 * @param {string} [organization]
 * @returns {Record<string, string>}
 */
function buildHeaders(apiKey, organization) {
  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (organization) {
    headers['OpenAI-Organization'] = organization;
  }
  return headers;
}

export class EmbeddingClient {
  /**
   * @param {import('./types.mjs').EmbeddingClientOptions & { httpMethods?: HttpMethods, verifySsl?: boolean }} opts
   */
  constructor({ model, apiKey, baseUrl, organization, proxyUrl, timeout, verifySsl, httpMethods }) {
    this.model = model;
    this._baseUrl = (baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, '');
    this._headers = buildHeaders(apiKey, organization);
    this._timeout = timeout || 120_000;
    // proxyUrl is accepted for interface parity but native fetch doesn't
    // natively support proxies — consumers can wrap via undici ProxyAgent.
    this._proxyUrl = proxyUrl || null;

    // When verifySsl is explicitly false, create an undici Agent that skips cert
    // validation. This is intentional for internal/self-signed environments where
    // the caller opts out via connection config (e.g. connCfg.verifySsl = false).
    // CodeQL: js/disabling-certificate-validation — controlled by caller config
    let dispatcher;
    if (verifySsl === false) {
      try {
        const require = createRequire(import.meta.url);
        const { Agent } = require('undici');
        dispatcher = new Agent({ connect: { rejectUnauthorized: false } }); // lgtm[js/disabling-certificate-validation]
      } catch {
        // undici not available — fall through to default fetch behavior
      }
    }
    this._httpMethods = httpMethods || new HttpMethods({ dispatcher });
  }

  get _endpoint() {
    return `${this._baseUrl}${EMBEDDINGS_PATH}`;
  }

  /**
   * Send a single batch POST and return ordered embeddings.
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async _post(texts) {
    const payload = { input: texts, model: this.model };
    const data = await this._httpMethods.post(
      this._endpoint, payload, this._headers, this._timeout,
    );
    const items = data.data.sort((a, b) => a.index - b.index);
    return items.map((item) => item.embedding);
  }

  /**
   * Embed a list of texts, batching to stay within API limits.
   *
   * Throws {@link EmbeddingBatchRejectedError} if any sub-batch receives
   * an HTTP 403 Forbidden response.  The error carries partial embeddings
   * for the sub-batches that succeeded.  Non-403 errors are re-thrown
   * immediately.
   *
   * @param {string[]} texts
   * @returns {Promise<number[][]>}
   */
  async embedDocuments(texts) {
    const nTexts = texts.length;
    const nBatches = Math.ceil(nTexts / MAX_BATCH_SIZE);
    console.log(`${_TAG} embedDocuments: ${nTexts} texts in ${nBatches} batch(es)`);

    /** @type {number[][]} */
    const allEmbeddings = [];
    /** @type {ForbiddenRejection[]} */
    const rejections = [];

    for (let i = 0; i < nTexts; i += MAX_BATCH_SIZE) {
      const batch = texts.slice(i, i + MAX_BATCH_SIZE);
      const batchNum = Math.floor(i / MAX_BATCH_SIZE) + 1;
      console.log(`${_TAG}   batch ${batchNum}/${nBatches}: ${batch.length} texts`);

      const start = performance.now();
      try {
        const results = await this._post(batch);
        allEmbeddings.push(...results);
      } catch (err) {
        if (err.status === 403) {
          const preview = batch[0]?.slice(0, 200) ?? '';
          const errorBody = (err.responseBody ?? String(err)).slice(0, 1000);
          const rejection = new ForbiddenRejection({
            batchIndex: batchNum - 1,
            textCount: batch.length,
            contentPreview: preview,
            statusCode: 403,
            errorBody,
          });
          rejections.push(rejection);
          console.error(
            `${_TAG}   batch ${batchNum} REJECTED (403 Forbidden) — ` +
            `${batch.length} texts skipped. ` +
            `SRE HINT: Check upstream policy rules for false positives.`,
          );
          continue;
        }
        throw err;
      }
      const elapsed = ((performance.now() - start) / 1000).toFixed(3);
      console.log(`${_TAG}   batch ${batchNum} done (${elapsed}s)`);
    }

    if (rejections.length > 0) {
      throw new EmbeddingBatchRejectedError(
        `${rejections.length}/${nBatches} sub-batch(es) rejected with 403 Forbidden`,
        { partialEmbeddings: allEmbeddings, rejections },
      );
    }
    return allEmbeddings;
  }

  /**
   * Embed a single query string.
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async embedQuery(text) {
    const results = await this.embedDocuments([text]);
    return results[0];
  }

  /**
   * Async embed a single query string (alias for embedQuery in JS).
   * @param {string} text
   * @returns {Promise<number[]>}
   */
  async aEmbedQuery(text) {
    return this.embedQuery(text);
  }
}
