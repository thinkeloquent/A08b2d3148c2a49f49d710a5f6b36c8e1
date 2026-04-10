/**
 * @fileoverview Tests for LibraryConfig and ResolvedLibraryConfig.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  LibraryConfig,
  ResolvedLibraryConfig,
  BaseIngestConfig,
  DEFAULTS,
  DEFAULT_LIBRARY,
} from '../src/index.mjs';

// ---------------------------------------------------------------------------
// Env cleanup — remove vars that would override DEFAULTS in tests
// ---------------------------------------------------------------------------

const ENV_VARS = [
  'DATASET_ROOT', 'RAG_PERSIST_ROOT', 'EMBEDDINGS_MODEL_NAME',
  'CHUNK_SIZE', 'CHUNK_OVERLAP', 'RAG_VECTOR_BACKEND',
  'ELASTIC_DB_HOST', 'ELASTIC_DB_PORT', 'ELASTIC_DB_SCHEME',
  'REDIS_HOST', 'REDIS_PORT', 'LLM_PROVIDER',
  'OPENAI_MODEL', 'ANTHROPIC_MODEL', 'GEMINI_MODEL',
  'HYBRID_ALPHA', 'SCORE_THRESHOLD', 'RERANKER_ENABLED',
  'RERANKER_MODEL', 'RETRIEVE_N', 'TOP_K',
  'RAG_POSTGRES_ENABLED',
  'RAG_SOURCE_DIRECTORY', 'RAG_PERSIST_DIRECTORY',
  'RAG_ES_INDEX', 'RAG_EXAMPLES_DIRECTORY',
];

let _savedEnv;
beforeEach(() => {
  _savedEnv = {};
  for (const key of ENV_VARS) {
    if (key in process.env) {
      _savedEnv[key] = process.env[key];
      delete process.env[key];
    }
  }
});
afterEach(() => {
  for (const [key, val] of Object.entries(_savedEnv)) {
    process.env[key] = val;
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a BaseIngestConfig with default values for use in resolve() calls. */
function makeBase(overrides = {}) {
  return new BaseIngestConfig(overrides);
}

/** Build a minimal valid LibraryConfig from raw data. */
function makeLib(data) {
  return new LibraryConfig(data);
}

// ---------------------------------------------------------------------------
// LibraryConfig — inheritance of base values
// ---------------------------------------------------------------------------

describe('LibraryConfig — inheritance from base', () => {
  it('library with no overrides inherits base chunkSize and chunkOverlap', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.chunkSize).toBe(DEFAULTS.chunkSize);
    expect(resolved.chunkOverlap).toBe(DEFAULTS.chunkOverlap);
  });

  it('library with no overrides inherits base vectorBackend', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.vectorBackend).toBe(DEFAULTS.vectorBackend);
  });

  it('library with no overrides inherits base llmProvider and model names', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.llmProvider).toBe(DEFAULTS.llmProvider);
    expect(resolved.openaiModel).toBe(DEFAULTS.openaiModel);
    expect(resolved.anthropicModel).toBe(DEFAULTS.anthropicModel);
    expect(resolved.geminiModel).toBe(DEFAULTS.geminiModel);
  });

  it('library with no overrides inherits base elasticsearchHost/elasticsearchPort/elasticsearchScheme', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.elasticsearchHost).toBe(DEFAULTS.elasticsearchHost);
    expect(resolved.elasticsearchPort).toBe(DEFAULTS.elasticsearchPort);
    expect(resolved.elasticsearchScheme).toBe(DEFAULTS.elasticsearchScheme);
  });
});

// ---------------------------------------------------------------------------
// LibraryConfig — per-library overrides win
// ---------------------------------------------------------------------------

describe('LibraryConfig — per-library overrides take precedence', () => {
  it('library chunkSize override wins over base chunkSize', () => {
    const base = makeBase({ chunkSize: 1200, chunkOverlap: 150 });
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      chunkSize: 1500,
      chunkOverlap: 100,
    });
    const resolved = lib.resolve(base);

    expect(resolved.chunkSize).toBe(1500);
    // chunkOverlap is also overridden here
    expect(resolved.chunkOverlap).toBe(100);
  });

  it('library chunkOverlap falls back to base when not set', () => {
    const base = makeBase({ chunkSize: 1200, chunkOverlap: 200 });
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      chunkSize: 1500,
      // chunkOverlap not set — should fall back to base
    });
    const resolved = lib.resolve(base);

    expect(resolved.chunkOverlap).toBe(200);
  });

  it('library sourceDirectory override wins over computed default', () => {
    const base = makeBase();
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      sourceDirectory: '/explicit/source/path',
    });
    const resolved = lib.resolve(base);

    expect(resolved.sourceDirectory).toBe('/explicit/source/path');
  });

  it('library persistDirectory override wins over computed default', () => {
    const base = makeBase();
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      persistDirectory: '/explicit/persist/path',
    });
    const resolved = lib.resolve(base);

    expect(resolved.persistDirectory).toBe('/explicit/persist/path');
  });

  it('library elasticsearchIndex override wins over computed default', () => {
    const base = makeBase();
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      elasticsearchIndex: 'my-custom-index',
    });
    const resolved = lib.resolve(base);

    expect(resolved.elasticsearchIndex).toBe('my-custom-index');
  });
});

// ---------------------------------------------------------------------------
// ResolvedLibraryConfig — computed defaults
// ---------------------------------------------------------------------------

describe('ResolvedLibraryConfig — computed path defaults', () => {
  it('sourceDirectory defaults to {datasetRoot}/{slug}/{componentPathSegment}', () => {
    const base = makeBase({ datasetRoot: 'dataset/repos', chunkSize: 1200, chunkOverlap: 150 });
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.sourceDirectory).toBe('dataset/repos/ant-design/components');
  });

  it('persistDirectory defaults to {persistRoot}/{slug}', () => {
    const base = makeBase({ persistRoot: 'data/chroma', chunkSize: 1200, chunkOverlap: 150 });
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.persistDirectory).toBe('data/chroma/ant-design');
  });

  it('examplesDirectory defaults to {datasetRoot}/{slug}/components-examples', () => {
    const base = makeBase({ datasetRoot: 'dataset/repos', chunkSize: 1200, chunkOverlap: 150 });
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.examplesDirectory).toBe('dataset/repos/ant-design/components-examples');
  });

  it('elasticsearchIndex defaults to rag-{slug}', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.elasticsearchIndex).toBe('rag-ant-design');
  });

  it('componentPathSegment defaults to "components"', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.componentPathSegment).toBe('components');
  });

  it('fileExtensions falls back to DEFAULT_LIBRARY.fileExtensions when not set', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.fileExtensions).toEqual([...DEFAULT_LIBRARY.fileExtensions]);
  });

  it('ignoredDirectories falls back to DEFAULT_LIBRARY.ignoredDirectories when not set', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved.ignoredDirectories).toEqual([...DEFAULT_LIBRARY.ignoredDirectories]);
  });
});

// ---------------------------------------------------------------------------
// Slug validation
// ---------------------------------------------------------------------------

describe('LibraryConfig — slug validation', () => {
  it('accepts valid slugs with lowercase letters and hyphens', () => {
    expect(() => makeLib({ name: 'Ant Design', slug: 'ant-design' })).not.toThrow();
    expect(() => makeLib({ name: 'Material UI', slug: 'material-ui' })).not.toThrow();
    expect(() => makeLib({ name: 'My Lib', slug: 'mylib' })).not.toThrow();
    expect(() => makeLib({ name: 'Lib v2', slug: 'lib-v2' })).not.toThrow();
  });

  it('rejects slug with uppercase letters', () => {
    expect(() => makeLib({ name: 'Bad Lib', slug: 'AntDesign' })).toThrow();
  });

  it('rejects slug with leading hyphen', () => {
    expect(() => makeLib({ name: 'Bad Lib', slug: '-ant-design' })).toThrow();
  });

  it('rejects slug with trailing hyphen', () => {
    expect(() => makeLib({ name: 'Bad Lib', slug: 'ant-design-' })).toThrow();
  });

  it('rejects slug with spaces', () => {
    expect(() => makeLib({ name: 'Bad Lib', slug: 'ant design' })).toThrow();
  });

  it('rejects single-character slug (regex requires at least 2 characters)', () => {
    expect(() => makeLib({ name: 'Bad Lib', slug: 'a' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// resolve() — ResolvedLibraryConfig completeness
// ---------------------------------------------------------------------------

describe('LibraryConfig.resolve() — ResolvedLibraryConfig completeness', () => {
  it('returns a ResolvedLibraryConfig instance', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(resolved).toBeInstanceOf(ResolvedLibraryConfig);
  });

  it('resolved config has all required fields present', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    // Identity
    expect(resolved).toHaveProperty('name', 'Ant Design');
    expect(resolved).toHaveProperty('slug', 'ant-design');
    expect(resolved).toHaveProperty('enabled');

    // Computed paths
    expect(resolved).toHaveProperty('sourceDirectory');
    expect(resolved).toHaveProperty('persistDirectory');
    expect(resolved).toHaveProperty('examplesDirectory');
    expect(resolved).toHaveProperty('elasticsearchIndex');

    // Library settings
    expect(resolved).toHaveProperty('componentPathSegment');
    expect(resolved).toHaveProperty('importPackages');
    expect(resolved).toHaveProperty('chunkSize');
    expect(resolved).toHaveProperty('chunkOverlap');
    expect(resolved).toHaveProperty('fileExtensions');
    expect(resolved).toHaveProperty('ignoredDirectories');

    // Base infrastructure
    expect(resolved).toHaveProperty('datasetRoot');
    expect(resolved).toHaveProperty('persistRoot');
    expect(resolved).toHaveProperty('embeddingsModelName');
    expect(resolved).toHaveProperty('vectorBackend');
    expect(resolved).toHaveProperty('elasticsearchHost');
    expect(resolved).toHaveProperty('elasticsearchPort');
    expect(resolved).toHaveProperty('elasticsearchScheme');
    expect(resolved).toHaveProperty('redisHost');
    expect(resolved).toHaveProperty('redisPort');
    expect(resolved).toHaveProperty('llmProvider');
    expect(resolved).toHaveProperty('openaiModel');
    expect(resolved).toHaveProperty('anthropicModel');
    expect(resolved).toHaveProperty('geminiModel');
    expect(resolved).toHaveProperty('hybridAlpha');
    expect(resolved).toHaveProperty('scoreThreshold');
    expect(resolved).toHaveProperty('rerankerEnabled');
    expect(resolved).toHaveProperty('rerankerModel');
    expect(resolved).toHaveProperty('retrieveN');
    expect(resolved).toHaveProperty('topK');
    expect(resolved).toHaveProperty('postgresEnabled');
  });
});

// ---------------------------------------------------------------------------
// ResolvedLibraryConfig — immutability
// ---------------------------------------------------------------------------

describe('ResolvedLibraryConfig — Object.isFrozen', () => {
  it('is frozen after resolve()', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    expect(Object.isFrozen(resolved)).toBe(true);
  });

  it('assignment to a frozen property throws in strict mode or silently fails', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);

    // In strict mode (ESM modules are always strict) this throws TypeError
    expect(() => {
      resolved.chunkSize = 9999;
    }).toThrow();
  });
});

// ---------------------------------------------------------------------------
// ResolvedLibraryConfig.toDict() — snake_case
// ---------------------------------------------------------------------------

describe('ResolvedLibraryConfig.toDict()', () => {
  it('returns snake_case keys', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const dict = lib.resolve(base).toDict();

    expect(dict).toHaveProperty('source_directory');
    expect(dict).toHaveProperty('persist_directory');
    expect(dict).toHaveProperty('examples_directory');
    expect(dict).toHaveProperty('elasticsearch_index');
    expect(dict).toHaveProperty('component_path_segment');
    expect(dict).toHaveProperty('import_packages');
    expect(dict).toHaveProperty('chunk_size');
    expect(dict).toHaveProperty('chunk_overlap');
    expect(dict).toHaveProperty('file_extensions');
    expect(dict).toHaveProperty('ignored_directories');
    expect(dict).toHaveProperty('dataset_root');
    expect(dict).toHaveProperty('persist_root');
    expect(dict).toHaveProperty('embeddings_model_name');
    expect(dict).toHaveProperty('vector_backend');
    expect(dict).toHaveProperty('llm_provider');
  });

  it('does not emit camelCase keys', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const dict = lib.resolve(base).toDict();

    expect(dict).not.toHaveProperty('sourceDirectory');
    expect(dict).not.toHaveProperty('persistDirectory');
    expect(dict).not.toHaveProperty('chunkSize');
    expect(dict).not.toHaveProperty('vectorBackend');
  });

  it('toDict() values match the resolved property values', () => {
    const base = makeBase();
    const lib = makeLib({ name: 'Ant Design', slug: 'ant-design' });
    const resolved = lib.resolve(base);
    const dict = resolved.toDict();

    expect(dict.chunk_size).toBe(resolved.chunkSize);
    expect(dict.chunk_overlap).toBe(resolved.chunkOverlap);
    expect(dict.source_directory).toBe(resolved.sourceDirectory);
    expect(dict.elasticsearch_index).toBe(resolved.elasticsearchIndex);
  });
});

// ---------------------------------------------------------------------------
// importPackages fallback
// ---------------------------------------------------------------------------

describe('ResolvedLibraryConfig — importPackages fallback', () => {
  it('uses DEFAULT_LIBRARY.importPackages when importPackages is empty', () => {
    const base = makeBase();
    // LibraryConfig schema defaults importPackages to [] when omitted
    const lib = makeLib({ name: 'Empty Packages', slug: 'empty-pkg' });
    const resolved = lib.resolve(base);

    expect(resolved.importPackages).toEqual([...DEFAULT_LIBRARY.importPackages]);
  });

  it('uses the provided importPackages when non-empty', () => {
    const base = makeBase();
    const lib = makeLib({
      name: 'Custom Lib',
      slug: 'custom-lib',
      importPackages: ['my-custom-package'],
    });
    const resolved = lib.resolve(base);

    expect(resolved.importPackages).toEqual(['my-custom-package']);
  });
});
