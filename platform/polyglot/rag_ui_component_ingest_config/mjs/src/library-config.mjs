/**
 * @fileoverview LibraryConfig and ResolvedLibraryConfig.
 *
 * `LibraryConfig` holds per-library settings (some optional) and resolves them
 * against a `BaseIngestConfig` instance to produce a fully concrete
 * `ResolvedLibraryConfig` (immutable after construction).
 *
 * Wire format (toDict) uses snake_case; internal properties use camelCase.
 */

import { DEFAULTS, DEFAULT_LIBRARY } from './defaults.mjs';
import { LibraryConfigSchema } from './schema.mjs';
import { createLogger } from './logger.mjs';

const _log = createLogger('LibraryConfig');

// ---------------------------------------------------------------------------
// LibraryConfig
// ---------------------------------------------------------------------------

/**
 * Per-library configuration.  Optional fields are resolved against
 * `BaseIngestConfig` values at `resolve()` time.
 */
export class LibraryConfig {
  /**
   * @param {object} data - Raw library config (camelCase).
   * @param {object|null} [parentLogger=null]
   */
  constructor(data, parentLogger = null) {
    this._log = createLogger('LibraryConfig', parentLogger);

    // Zod v3 validation — throws ZodError on invalid input
    const parsed = LibraryConfigSchema.parse(data);

    // Required fields
    this.name                 = parsed.name;
    this.slug                 = parsed.slug;

    // Optional / defaulted fields
    this.version              = parsed.version ?? null;
    this.sourceDirectory      = parsed.sourceDirectory ?? null;
    this.persistDirectory     = parsed.persistDirectory ?? null;
    this.examplesDirectory    = parsed.examplesDirectory ?? null;
    this.elasticsearchIndex   = parsed.elasticsearchIndex ?? null;
    this.componentPathSegment = parsed.componentPathSegment;
    this.importPackages       = parsed.importPackages;
    this.chunkSize            = parsed.chunkSize ?? null;
    this.chunkOverlap         = parsed.chunkOverlap ?? null;
    this.fileExtensions       = parsed.fileExtensions ?? null;
    this.ignoredDirectories   = parsed.ignoredDirectories ?? null;
    this.enabled              = parsed.enabled;
  }

  /**
   * Resolve this library config against a BaseIngestConfig, computing all
   * defaults and producing a fully concrete ResolvedLibraryConfig.
   *
   * @param {import('./base-config.mjs').BaseIngestConfig} base
   * @returns {ResolvedLibraryConfig}
   */
  resolve(base) {
    return new ResolvedLibraryConfig(this, base);
  }
}

// ---------------------------------------------------------------------------
// ResolvedLibraryConfig
// ---------------------------------------------------------------------------

/**
 * Fully resolved, immutable library configuration.
 *
 * All optional fields from `LibraryConfig` are replaced with concrete values
 * derived from the `BaseIngestConfig` or hardcoded defaults.
 * All base infrastructure fields are also included for convenience.
 */
export class ResolvedLibraryConfig {
  /**
   * @param {LibraryConfig} lib
   * @param {import('./base-config.mjs').BaseIngestConfig} base
   */
  constructor(lib, base) {
    // Identity
    this.name                 = lib.name;
    this.slug                 = lib.slug;
    this.version              = lib.version;
    this.enabled              = lib.enabled;

    // Computed path defaults — env var overrides checked before computing defaults
    this.sourceDirectory = lib.sourceDirectory
      ?? process.env.RAG_SOURCE_DIRECTORY
      ?? `${base.datasetRoot}/${lib.slug}/${lib.componentPathSegment}`;

    this.persistDirectory = lib.persistDirectory
      ?? process.env.RAG_PERSIST_DIRECTORY
      ?? `${base.persistRoot}/${lib.slug}`;

    this.examplesDirectory = lib.examplesDirectory
      ?? process.env.RAG_EXAMPLES_DIRECTORY
      ?? `${base.datasetRoot}/${lib.slug}/components-examples`;

    this.elasticsearchIndex = lib.elasticsearchIndex
      ?? process.env.RAG_ES_INDEX
      ?? `rag-${lib.slug}`;

    // Library-level overrides fall back to base values
    this.componentPathSegment = lib.componentPathSegment;
    this.importPackages       = lib.importPackages.length > 0
      ? lib.importPackages
      : [...DEFAULT_LIBRARY.importPackages];

    this.chunkSize    = lib.chunkSize    ?? base.chunkSize;
    this.chunkOverlap = lib.chunkOverlap ?? base.chunkOverlap;

    this.fileExtensions     = lib.fileExtensions
      ?? [...DEFAULT_LIBRARY.fileExtensions];
    this.ignoredDirectories = lib.ignoredDirectories
      ?? [...DEFAULT_LIBRARY.ignoredDirectories];

    // All base infrastructure fields
    this.datasetRoot          = base.datasetRoot;
    this.persistRoot          = base.persistRoot;
    this.embeddingsModelName  = base.embeddingsModelName;
    this.vectorBackend        = base.vectorBackend;
    this.elasticsearchHost    = base.elasticsearchHost;
    this.elasticsearchPort    = base.elasticsearchPort;
    this.elasticsearchScheme  = base.elasticsearchScheme;
    this.redisHost            = base.redisHost;
    this.redisPort            = base.redisPort;
    this.llmProvider          = base.llmProvider;
    this.openaiModel          = base.openaiModel;
    this.anthropicModel       = base.anthropicModel;
    this.geminiModel          = base.geminiModel;
    this.hybridAlpha          = base.hybridAlpha;
    this.scoreThreshold       = base.scoreThreshold;
    this.rerankerEnabled      = base.rerankerEnabled;
    this.rerankerModel        = base.rerankerModel;
    this.retrieveN            = base.retrieveN;
    this.topK                 = base.topK;
    this.postgresEnabled      = base.postgresEnabled;

    Object.freeze(this);
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
      // Library identity
      name:                   this.name,
      slug:                   this.slug,
      version:                this.version,
      enabled:                this.enabled,

      // Resolved paths
      source_directory:       this.sourceDirectory,
      persist_directory:      this.persistDirectory,
      examples_directory:     this.examplesDirectory,
      elasticsearch_index:    this.elasticsearchIndex,

      // Library settings
      component_path_segment: this.componentPathSegment,
      import_packages:        this.importPackages,
      chunk_size:             this.chunkSize,
      chunk_overlap:          this.chunkOverlap,
      file_extensions:        this.fileExtensions,
      ignored_directories:    this.ignoredDirectories,

      // Base infrastructure (snake_case)
      dataset_root:           this.datasetRoot,
      persist_root:           this.persistRoot,
      embeddings_model_name:  this.embeddingsModelName,
      vector_backend:         this.vectorBackend,
      elasticsearch_host:     this.elasticsearchHost,
      elasticsearch_port:     this.elasticsearchPort,
      elasticsearch_scheme:   this.elasticsearchScheme,
      redis_host:             this.redisHost,
      redis_port:             this.redisPort,
      llm_provider:           this.llmProvider,
      openai_model:           this.openaiModel,
      anthropic_model:        this.anthropicModel,
      gemini_model:           this.geminiModel,
      hybrid_alpha:           this.hybridAlpha,
      score_threshold:        this.scoreThreshold,
      reranker_enabled:       this.rerankerEnabled,
      reranker_model:         this.rerankerModel,
      retrieve_n:             this.retrieveN,
      top_k:                  this.topK,
      postgres_enabled:       this.postgresEnabled,
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
