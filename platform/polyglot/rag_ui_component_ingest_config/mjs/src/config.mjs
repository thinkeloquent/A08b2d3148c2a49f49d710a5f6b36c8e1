/**
 * @fileoverview Top-level config orchestrator for rag_ui_component_ingest_config.
 *
 * Exports:
 *  - SingleLibraryConfig  — flattened view (base + one resolved library)
 *  - RagUIComponentIngestConfig — multi-library config with factory methods
 *
 * Wire format (toDict / toJSON) uses snake_case.  Internal properties are
 * camelCase per the MJS convention.
 */

import { readFileSync } from 'node:fs';
import yaml from 'js-yaml';

import { BaseIngestConfig } from './base-config.mjs';
import { LibraryConfig } from './library-config.mjs';
import { DEFAULT_LIBRARY } from './defaults.mjs';
import { createLogger } from './logger.mjs';

// ---------------------------------------------------------------------------
// SingleLibraryConfig
// ---------------------------------------------------------------------------

/**
 * A flattened, read-only view of a single library merged with its base config.
 *
 * This is the primary object consumed by pipeline code that operates on one
 * library at a time.  Provides `toDict()` / `toJSON()` for serialisation.
 */
export class SingleLibraryConfig {
  /**
   * @param {import('./library-config.mjs').ResolvedLibraryConfig} resolved
   */
  constructor(resolved) {
    // Copy every property from the resolved config directly
    Object.assign(this, resolved);

    /** @type {string} */
    this.libraryName = resolved.name;
    /** @type {string} */
    this.librarySlug = resolved.slug;

    Object.freeze(this);
  }

  /**
   * Return a plain object with snake_case keys (delegates to the underlying
   * ResolvedLibraryConfig serialiser).
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

      // Base infrastructure
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
   * Serialize to a JSON string.
   *
   * @param {number} [indent=2]
   * @returns {string}
   */
  toJSON(indent = 2) {
    return JSON.stringify(this.toDict(), null, indent);
  }
}

// ---------------------------------------------------------------------------
// Helpers — snake_case ↔ camelCase conversion
// ---------------------------------------------------------------------------

/**
 * Convert a snake_case string to camelCase.
 *
 * @param {string} s
 * @returns {string}
 */
function snakeToCamel(s) {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Recursively convert the keys of a plain object from snake_case to camelCase.
 * Arrays are traversed but their elements are only converted if they are plain
 * objects.
 *
 * @param {unknown} value
 * @returns {unknown}
 */
function deepSnakeToCamel(value) {
  if (Array.isArray(value)) {
    return value.map(deepSnakeToCamel);
  }
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [snakeToCamel(k), deepSnakeToCamel(v)]),
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// RagUIComponentIngestConfig
// ---------------------------------------------------------------------------

/**
 * Top-level configuration object.
 *
 * Composed of:
 *  - `base`      — BaseIngestConfig (shared infrastructure)
 *  - `libraries` — array of LibraryConfig (per-library settings)
 *
 * Factory methods:
 *  - `fromEnv()`              — env vars + single Ant Design default library
 *  - `fromManifest(path)`     — YAML / JSON manifest file
 *  - `fromArgs(args)`         — CLI / SDK argument object
 *  - `fromDict(data)`         — plain object
 *  - `fromJSON(jsonStr)`      — JSON string
 *
 * Query methods:
 *  - `getLibrary(slug)`       — ResolvedLibraryConfig for a slug
 *  - `getEnabledLibraries()`  — all enabled ResolvedLibraryConfigs
 *  - `forLibrary(slug)`       — SingleLibraryConfig (backward compat)
 *  - `listLibraries()`        — [{name, slug, enabled}]
 *
 * Serialisation:
 *  - `toDict()`  — snake_case plain object
 *  - `toJSON()`  — JSON string
 *  - `validate()` — list of validation error strings (empty = valid)
 */
export class RagUIComponentIngestConfig {
  /**
   * @param {BaseIngestConfig} base
   * @param {LibraryConfig[]} libraries
   * @param {object|null} [parentLogger=null]
   */
  constructor(base, libraries, parentLogger = null) {
    this._log      = createLogger('RagUIComponentIngestConfig', parentLogger);
    this.base      = base;
    this.libraries = libraries;

    this._log.debug('RagUIComponentIngestConfig constructed', {
      libraryCount: libraries.length,
    });
  }

  // ---------------------------------------------------------------------------
  // Factory — fromEnv
  // ---------------------------------------------------------------------------

  /**
   * Build a config from environment variables.
   * A single Ant Design library is registered as the default.
   *
   * @param {object} [baseOverrides={}] - camelCase overrides for BaseIngestConfig.
   * @param {object|null} [parentLogger=null]
   * @returns {RagUIComponentIngestConfig}
   */
  static fromEnv(baseOverrides = {}, parentLogger = null) {
    const log = createLogger('RagUIComponentIngestConfig.fromEnv', parentLogger);
    log.debug('Building config from environment variables');

    const base    = new BaseIngestConfig(baseOverrides, parentLogger);
    const library = new LibraryConfig(DEFAULT_LIBRARY, parentLogger);

    return new RagUIComponentIngestConfig(base, [library], parentLogger);
  }

  // ---------------------------------------------------------------------------
  // Factory — fromManifest
  // ---------------------------------------------------------------------------

  /**
   * Build a config from a YAML or JSON manifest file.
   *
   * Expected manifest shape (snake_case):
   * ```yaml
   * base:          # optional overrides for BaseIngestConfig
   *   chunk_size: 800
   * libraries:
   *   - name: Ant Design
   *     slug: ant-design
   *     version: "5.x"
   * ```
   *
   * @param {string} manifestPath - Absolute or cwd-relative path.
   * @param {object} [baseOverrides={}] - Additional camelCase base overrides.
   * @param {object|null} [parentLogger=null]
   * @returns {RagUIComponentIngestConfig}
   */
  static fromManifest(manifestPath, baseOverrides = {}, parentLogger = null) {
    const log = createLogger('RagUIComponentIngestConfig.fromManifest', parentLogger);
    log.debug('Loading manifest', { path: manifestPath });

    let raw;
    try {
      raw = readFileSync(manifestPath, 'utf8');
    } catch (err) {
      log.error('Failed to read manifest file', { path: manifestPath, error: err.message });
      throw err;
    }

    let data;
    const lower = manifestPath.toLowerCase();
    if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
      data = yaml.load(raw);
    } else {
      data = JSON.parse(raw);
    }

    return RagUIComponentIngestConfig.fromDict(data, baseOverrides, parentLogger);
  }

  // ---------------------------------------------------------------------------
  // Factory — fromArgs
  // ---------------------------------------------------------------------------

  /**
   * Build a config from a CLI / SDK argument object.
   *
   * Accepts both camelCase and snake_case keys.  A `libraries` array is
   * optional; when omitted the single default Ant Design library is used.
   *
   * @param {object} args
   * @param {object|null} [parentLogger=null]
   * @returns {RagUIComponentIngestConfig}
   */
  static fromArgs(args, parentLogger = null) {
    const log = createLogger('RagUIComponentIngestConfig.fromArgs', parentLogger);
    log.debug('Building config from args');

    // Normalise to camelCase for internal consumption
    const camel = /** @type {any} */ (deepSnakeToCamel(args));

    const { libraries: libsRaw, ...baseArgs } = camel;

    const base = new BaseIngestConfig(baseArgs, parentLogger);

    const libDefs = Array.isArray(libsRaw) && libsRaw.length > 0
      ? libsRaw
      : [DEFAULT_LIBRARY];

    const libraries = libDefs.map((l) => new LibraryConfig(l, parentLogger));

    return new RagUIComponentIngestConfig(base, libraries, parentLogger);
  }

  // ---------------------------------------------------------------------------
  // Factory — fromDict
  // ---------------------------------------------------------------------------

  /**
   * Build a config from a plain object.
   *
   * Expects `{ base?: {...}, libraries?: [...] }` with snake_case or camelCase
   * keys.
   *
   * @param {object} data
   * @param {object} [baseOverrides={}]
   * @param {object|null} [parentLogger=null]
   * @returns {RagUIComponentIngestConfig}
   */
  static fromDict(data, baseOverrides = {}, parentLogger = null) {
    const camel = /** @type {any} */ (deepSnakeToCamel(data));

    const baseRaw = { ...(camel.base ?? {}), ...deepSnakeToCamel(baseOverrides) };
    const base    = new BaseIngestConfig(baseRaw, parentLogger);

    const libsRaw = camel.libraries;
    const libDefs = Array.isArray(libsRaw) && libsRaw.length > 0
      ? libsRaw
      : [DEFAULT_LIBRARY];

    const libraries = libDefs.map((l) => new LibraryConfig(l, parentLogger));

    return new RagUIComponentIngestConfig(base, libraries, parentLogger);
  }

  // ---------------------------------------------------------------------------
  // Factory — fromJSON
  // ---------------------------------------------------------------------------

  /**
   * Build a config from a JSON string.
   *
   * @param {string} jsonStr
   * @param {object} [baseOverrides={}]
   * @param {object|null} [parentLogger=null]
   * @returns {RagUIComponentIngestConfig}
   */
  static fromJSON(jsonStr, baseOverrides = {}, parentLogger = null) {
    const data = JSON.parse(jsonStr);
    return RagUIComponentIngestConfig.fromDict(data, baseOverrides, parentLogger);
  }

  // ---------------------------------------------------------------------------
  // Query methods
  // ---------------------------------------------------------------------------

  /**
   * Return the ResolvedLibraryConfig for the given slug.
   *
   * @param {string} slug
   * @returns {import('./library-config.mjs').ResolvedLibraryConfig}
   * @throws {Error} when no library with that slug is registered.
   */
  getLibrary(slug) {
    const lib = this.libraries.find((l) => l.slug === slug);
    if (!lib) {
      throw new Error(
        `No library registered with slug "${slug}". ` +
        `Available: ${this.libraries.map((l) => l.slug).join(', ')}`,
      );
    }
    return lib.resolve(this.base);
  }

  /**
   * Return resolved configs for all enabled libraries.
   *
   * @returns {import('./library-config.mjs').ResolvedLibraryConfig[]}
   */
  getEnabledLibraries() {
    return this.libraries
      .filter((l) => l.enabled)
      .map((l) => l.resolve(this.base));
  }

  /**
   * Return a SingleLibraryConfig for the given slug (or the first enabled
   * library when slug is omitted).  Provided for backward compatibility with
   * single-library pipeline code.
   *
   * @param {string|null} [slug=null]
   * @returns {SingleLibraryConfig}
   * @throws {Error} when no enabled library is found.
   */
  forLibrary(slug = null) {
    let resolved;
    if (slug !== null) {
      resolved = this.getLibrary(slug);
    } else {
      const enabled = this.getEnabledLibraries();
      if (enabled.length === 0) {
        throw new Error('No enabled libraries are registered.');
      }
      resolved = enabled[0];
    }
    return new SingleLibraryConfig(resolved);
  }

  /**
   * Return a summary list of registered libraries.
   *
   * @returns {{ name: string, slug: string, enabled: boolean }[]}
   */
  listLibraries() {
    return this.libraries.map(({ name, slug, enabled }) => ({ name, slug, enabled }));
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  /**
   * Validate all registered libraries and return a list of error strings.
   * An empty array means everything is valid.
   *
   * @returns {string[]}
   */
  validate() {
    const errors = [];

    // Check for duplicate slugs
    const slugsSeen = new Set();
    for (const lib of this.libraries) {
      if (slugsSeen.has(lib.slug)) {
        errors.push(`Duplicate library slug: "${lib.slug}"`);
      }
      slugsSeen.add(lib.slug);

      // Per-library chunk_overlap < chunk_size consistency
      const effectiveChunkSize    = lib.chunkSize    ?? this.base.chunkSize;
      const effectiveChunkOverlap = lib.chunkOverlap ?? this.base.chunkOverlap;
      if (effectiveChunkOverlap >= effectiveChunkSize) {
        errors.push(
          `Library "${lib.slug}": chunkOverlap (${effectiveChunkOverlap}) ` +
          `must be less than chunkSize (${effectiveChunkSize})`,
        );
      }
    }

    if (this.libraries.length === 0) {
      errors.push('At least one library must be registered.');
    }

    return errors;
  }

  // ---------------------------------------------------------------------------
  // Serialisation
  // ---------------------------------------------------------------------------

  /**
   * Return a plain object with snake_case keys.
   *
   * @returns {Record<string, unknown>}
   */
  toDict() {
    return {
      base:      this.base.toDict(),
      libraries: this.libraries.map((lib) => lib.resolve(this.base).toDict()),
    };
  }

  /**
   * Serialize to a JSON string.
   *
   * @param {number} [indent=2]
   * @returns {string}
   */
  toJSON(indent = 2) {
    return JSON.stringify(this.toDict(), null, indent);
  }
}
