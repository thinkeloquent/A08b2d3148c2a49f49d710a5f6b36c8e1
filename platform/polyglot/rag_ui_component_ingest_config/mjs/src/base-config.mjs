/**
 * @fileoverview BaseIngestConfig — shared infrastructure configuration resolved
 * from environment variables with fallback to DEFAULTS.
 *
 * Immutable after construction (Object.freeze).
 * `toDict()` / `toJSON()` emit snake_case for wire-format compatibility with
 * the Python counterpart.
 */

import { DEFAULTS } from './defaults.mjs';
import { BaseIngestConfigSchema } from './schema.mjs';
import { createLogger } from './logger.mjs';
import { resolveAnthropicEnv } from '@internal/env-resolver';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Read an env var and return a string, or fall back to `defaultValue`.
 *
 * @param {string} name
 * @param {string|number|boolean} defaultValue
 * @returns {string|undefined}
 */
function env(name, defaultValue) {
  const raw = process.env[name];
  return raw !== undefined ? raw : defaultValue;
}

/**
 * Parse an env var as an integer, with a numeric fallback.
 *
 * @param {string} name
 * @param {number} defaultValue
 * @returns {number}
 */
function envInt(name, defaultValue) {
  const raw = process.env[name];
  if (raw !== undefined) {
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * Parse an env var as a float, with a numeric fallback.
 *
 * @param {string} name
 * @param {number} defaultValue
 * @returns {number}
 */
function envFloat(name, defaultValue) {
  const raw = process.env[name];
  if (raw !== undefined) {
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * Parse an env var as a boolean.
 * Truthy strings: "1", "true", "yes" (case-insensitive).
 *
 * @param {string} name
 * @param {boolean} defaultValue
 * @returns {boolean}
 */
function envBool(name, defaultValue) {
  const raw = process.env[name];
  if (raw !== undefined) {
    return ['1', 'true', 'yes'].includes(raw.toLowerCase());
  }
  return defaultValue;
}

// ---------------------------------------------------------------------------
// BaseIngestConfig
// ---------------------------------------------------------------------------

/**
 * Shared infrastructure configuration resolved from environment variables with
 * fallback to frozen `DEFAULTS`.
 *
 * Immutable after construction.  Wire serialisation (toDict / toJSON) uses
 * snake_case to match the Python counterpart and the REST/protobuf contract.
 */
export class BaseIngestConfig {
  /**
   * @param {object} [overrides={}] - Optional explicit overrides (camelCase).
   *   When an override is present it takes precedence over both the env var and
   *   the compiled-in default.
   * @param {object|null} [parentLogger=null] - Pino-compatible logger.
   */
  constructor(overrides = {}, parentLogger = null) {
    this._log = createLogger('BaseIngestConfig', parentLogger);

    // Resolve each field: override > env var > DEFAULTS
    const resolved = {
      datasetRoot:          overrides.datasetRoot          ?? env('DATASET_ROOT',           DEFAULTS.datasetRoot),
      persistRoot:          overrides.persistRoot          ?? env('RAG_PERSIST_ROOT',        DEFAULTS.persistRoot),
      embeddingsModelName:  overrides.embeddingsModelName  ?? env('EMBEDDINGS_MODEL_NAME',   DEFAULTS.embeddingsModelName),

      chunkSize:            overrides.chunkSize            ?? envInt('CHUNK_SIZE',           DEFAULTS.chunkSize),
      chunkOverlap:         overrides.chunkOverlap         ?? envInt('CHUNK_OVERLAP',        DEFAULTS.chunkOverlap),

      vectorBackend:        overrides.vectorBackend        ?? env('RAG_VECTOR_BACKEND',      DEFAULTS.vectorBackend),

      elasticsearchHost:    overrides.elasticsearchHost    ?? env('ELASTIC_DB_HOST',         DEFAULTS.elasticsearchHost),
      elasticsearchPort:    overrides.elasticsearchPort    ?? envInt('ELASTIC_DB_PORT',      DEFAULTS.elasticsearchPort),
      elasticsearchScheme:  overrides.elasticsearchScheme  ?? env('ELASTIC_DB_SCHEME',       DEFAULTS.elasticsearchScheme),

      redisHost:            overrides.redisHost            ?? env('REDIS_HOST',              DEFAULTS.redisHost),
      redisPort:            overrides.redisPort            ?? envInt('REDIS_PORT',           DEFAULTS.redisPort),

      llmProvider:          overrides.llmProvider          ?? env('LLM_PROVIDER',            DEFAULTS.llmProvider),
      openaiModel:          overrides.openaiModel          ?? env('OPENAI_MODEL',            DEFAULTS.openaiModel),
      anthropicModel:       overrides.anthropicModel       ?? resolveAnthropicEnv().model,
      geminiModel:          overrides.geminiModel          ?? env('GEMINI_MODEL',            DEFAULTS.geminiModel),

      hybridAlpha:          overrides.hybridAlpha          ?? envFloat('HYBRID_ALPHA',       DEFAULTS.hybridAlpha),
      scoreThreshold:       overrides.scoreThreshold       ?? envFloat('SCORE_THRESHOLD',    DEFAULTS.scoreThreshold),
      rerankerEnabled:      overrides.rerankerEnabled      ?? envBool('RERANKER_ENABLED',    DEFAULTS.rerankerEnabled),
      rerankerModel:        overrides.rerankerModel        ?? env('RERANKER_MODEL',          DEFAULTS.rerankerModel),
      retrieveN:            overrides.retrieveN            ?? envInt('RETRIEVE_N',           DEFAULTS.retrieveN),
      topK:                 overrides.topK                 ?? envInt('TOP_K',               DEFAULTS.topK),

      postgresEnabled:      overrides.postgresEnabled      ?? envBool('RAG_POSTGRES_ENABLED', DEFAULTS.postgresEnabled),
    };

    // Zod validation — throws ZodError on invalid input
    const parsed = BaseIngestConfigSchema.parse(resolved);

    // Assign all validated fields directly to `this`
    Object.assign(this, parsed);

    Object.freeze(this);

    this._log.debug('BaseIngestConfig constructed', {
      vectorBackend: this.vectorBackend,
      llmProvider: this.llmProvider,
    });
  }

  // ---------------------------------------------------------------------------
  // Serialisation
  // ---------------------------------------------------------------------------

  /**
   * Return a plain object with snake_case keys for wire-format compatibility.
   *
   * @returns {Record<string, unknown>}
   */
  toDict() {
    return {
      dataset_root:          this.datasetRoot,
      persist_root:          this.persistRoot,
      embeddings_model_name: this.embeddingsModelName,
      chunk_size:            this.chunkSize,
      chunk_overlap:         this.chunkOverlap,
      vector_backend:        this.vectorBackend,
      elasticsearch_host:    this.elasticsearchHost,
      elasticsearch_port:    this.elasticsearchPort,
      elasticsearch_scheme:  this.elasticsearchScheme,
      redis_host:            this.redisHost,
      redis_port:            this.redisPort,
      llm_provider:          this.llmProvider,
      openai_model:          this.openaiModel,
      anthropic_model:       this.anthropicModel,
      gemini_model:          this.geminiModel,
      hybrid_alpha:          this.hybridAlpha,
      score_threshold:       this.scoreThreshold,
      reranker_enabled:      this.rerankerEnabled,
      reranker_model:        this.rerankerModel,
      retrieve_n:            this.retrieveN,
      top_k:                 this.topK,
      postgres_enabled:      this.postgresEnabled,
    };
  }

  /**
   * Alias for `toDict()` — called by JSON.stringify automatically.
   *
   * @returns {Record<string, unknown>}
   */
  toJSON() {
    return this.toDict();
  }
}
