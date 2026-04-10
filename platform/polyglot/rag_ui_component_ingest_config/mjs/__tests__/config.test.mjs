/**
 * @fileoverview Tests for RagUIComponentIngestConfig and SingleLibraryConfig.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  RagUIComponentIngestConfig,
  SingleLibraryConfig,
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
// fromEnv()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.fromEnv()', () => {
  it('creates a config with exactly one library (Ant Design default)', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    expect(cfg.libraries).toHaveLength(1);
    expect(cfg.libraries[0].slug).toBe('ant-design');
    expect(cfg.libraries[0].name).toBe('Ant Design');
  });

  it('returns base config with correct compiled-in defaults', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    expect(cfg.base.chunkSize).toBe(DEFAULTS.chunkSize);
    expect(cfg.base.chunkOverlap).toBe(DEFAULTS.chunkOverlap);
    expect(cfg.base.vectorBackend).toBe(DEFAULTS.vectorBackend);
    expect(cfg.base.llmProvider).toBe(DEFAULTS.llmProvider);
    expect(cfg.base.elasticsearchPort).toBe(DEFAULTS.elasticsearchPort);
    expect(cfg.base.redisPort).toBe(DEFAULTS.redisPort);
  });

  it('accepts baseOverrides that supersede defaults', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv({ chunkSize: 800, chunkOverlap: 80 });
    expect(cfg.base.chunkSize).toBe(800);
    expect(cfg.base.chunkOverlap).toBe(80);
  });
});

// ---------------------------------------------------------------------------
// toDict() round-trip via fromDict()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig round-trip toDict → fromDict', () => {
  it('produces the same base values after round-trip', () => {
    const original = RagUIComponentIngestConfig.fromEnv();
    const dict = original.toDict();
    const restored = RagUIComponentIngestConfig.fromDict(dict);

    expect(restored.base.chunkSize).toBe(original.base.chunkSize);
    expect(restored.base.chunkOverlap).toBe(original.base.chunkOverlap);
    expect(restored.base.vectorBackend).toBe(original.base.vectorBackend);
    expect(restored.base.llmProvider).toBe(original.base.llmProvider);
    expect(restored.base.elasticsearchPort).toBe(original.base.elasticsearchPort);
    expect(restored.base.redisPort).toBe(original.base.redisPort);
    expect(restored.base.embeddingsModelName).toBe(original.base.embeddingsModelName);
  });

  it('preserves library count and slug after round-trip', () => {
    const original = RagUIComponentIngestConfig.fromEnv();
    const dict = original.toDict();
    const restored = RagUIComponentIngestConfig.fromDict(dict);

    expect(restored.libraries).toHaveLength(original.libraries.length);
    expect(restored.libraries[0].slug).toBe(original.libraries[0].slug);
    expect(restored.libraries[0].name).toBe(original.libraries[0].name);
  });
});

// ---------------------------------------------------------------------------
// forLibrary()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.forLibrary()', () => {
  let cfg;
  beforeEach(() => {
    cfg = RagUIComponentIngestConfig.fromEnv();
  });

  it('returns a SingleLibraryConfig instance', () => {
    const slc = cfg.forLibrary('ant-design');
    expect(slc).toBeInstanceOf(SingleLibraryConfig);
  });

  it('produces a flat object with all expected infrastructure fields', () => {
    const slc = cfg.forLibrary('ant-design');
    // Base infrastructure fields
    expect(slc).toHaveProperty('datasetRoot');
    expect(slc).toHaveProperty('persistRoot');
    expect(slc).toHaveProperty('chunkSize');
    expect(slc).toHaveProperty('chunkOverlap');
    expect(slc).toHaveProperty('vectorBackend');
    expect(slc).toHaveProperty('elasticsearchHost');
    expect(slc).toHaveProperty('elasticsearchPort');
    expect(slc).toHaveProperty('llmProvider');
  });

  it('forLibrary("ant-design") has correct libraryName and librarySlug', () => {
    const slc = cfg.forLibrary('ant-design');
    expect(slc.name).toBe('Ant Design');
    expect(slc.slug).toBe('ant-design');
  });

  it('forLibrary() with no slug returns the first enabled library', () => {
    const slc = cfg.forLibrary();
    expect(slc.slug).toBe('ant-design');
  });

  it('throws when slug is not registered', () => {
    expect(() => cfg.forLibrary('nonexistent-lib')).toThrow(
      /No library registered with slug "nonexistent-lib"/,
    );
  });
});

// ---------------------------------------------------------------------------
// getEnabledLibraries()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.getEnabledLibraries()', () => {
  it('returns only enabled libraries', () => {
    const cfg = RagUIComponentIngestConfig.fromDict({
      base: {},
      libraries: [
        { name: 'Ant Design', slug: 'ant-design', enabled: true, import_packages: ['antd'] },
        { name: 'Disabled Lib', slug: 'disabled-lib', enabled: false, import_packages: [] },
      ],
    });

    const enabled = cfg.getEnabledLibraries();
    expect(enabled).toHaveLength(1);
    expect(enabled[0].slug).toBe('ant-design');
  });

  it('returns empty array when all libraries are disabled', () => {
    const cfg = RagUIComponentIngestConfig.fromDict({
      base: {},
      libraries: [
        { name: 'Ant Design', slug: 'ant-design', enabled: false, import_packages: ['antd'] },
      ],
    });

    expect(cfg.getEnabledLibraries()).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// listLibraries()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.listLibraries()', () => {
  it('returns correct structure with name, slug, and enabled fields', () => {
    const cfg = RagUIComponentIngestConfig.fromDict({
      base: {},
      libraries: [
        { name: 'Ant Design', slug: 'ant-design', enabled: true, import_packages: ['antd'] },
        { name: 'Material UI', slug: 'material-ui', enabled: false, import_packages: ['@mui/material'] },
      ],
    });

    const list = cfg.listLibraries();
    expect(list).toHaveLength(2);
    expect(list[0]).toEqual({ name: 'Ant Design', slug: 'ant-design', enabled: true });
    expect(list[1]).toEqual({ name: 'Material UI', slug: 'material-ui', enabled: false });
  });

  it('returns only name, slug, enabled — no other fields', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const list = cfg.listLibraries();
    const keys = Object.keys(list[0]);
    expect(keys).toHaveLength(3);
    expect(keys).toContain('name');
    expect(keys).toContain('slug');
    expect(keys).toContain('enabled');
  });
});

// ---------------------------------------------------------------------------
// toDict()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.toDict()', () => {
  it('produces snake_case keys at the base level', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const dict = cfg.toDict();

    expect(dict).toHaveProperty('base');
    expect(dict).toHaveProperty('libraries');
    expect(dict.base).toHaveProperty('chunk_size');
    expect(dict.base).toHaveProperty('chunk_overlap');
    expect(dict.base).toHaveProperty('vector_backend');
    expect(dict.base).toHaveProperty('llm_provider');
    expect(dict.base).toHaveProperty('embeddings_model_name');
    expect(dict.base).toHaveProperty('dataset_root');
    expect(dict.base).toHaveProperty('persist_root');
  });

  it('libraries array in toDict() has snake_case keys', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const dict = cfg.toDict();
    const lib = dict.libraries[0];

    expect(lib).toHaveProperty('source_directory');
    expect(lib).toHaveProperty('persist_directory');
    expect(lib).toHaveProperty('elasticsearch_index');
    expect(lib).toHaveProperty('component_path_segment');
    expect(lib).toHaveProperty('import_packages');
    expect(lib).toHaveProperty('chunk_size');
    expect(lib).toHaveProperty('chunk_overlap');
  });

  it('does not produce camelCase keys at the top level', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const dict = cfg.toDict();

    expect(dict.base).not.toHaveProperty('chunkSize');
    expect(dict.base).not.toHaveProperty('vectorBackend');
    expect(dict.base).not.toHaveProperty('llmProvider');
  });
});

// ---------------------------------------------------------------------------
// toJSON()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.toJSON()', () => {
  it('produces a valid JSON string', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const json = cfg.toJSON();

    expect(typeof json).toBe('string');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('round-trips through JSON.parse back to the correct shape', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    const parsed = JSON.parse(cfg.toJSON());

    expect(parsed).toHaveProperty('base');
    expect(parsed).toHaveProperty('libraries');
    expect(parsed.base).toHaveProperty('chunk_size', DEFAULTS.chunkSize);
  });
});

// ---------------------------------------------------------------------------
// validate()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.validate()', () => {
  it('returns an empty array for a valid default config', () => {
    const cfg = RagUIComponentIngestConfig.fromEnv();
    expect(cfg.validate()).toEqual([]);
  });

  it('returns an error when chunkOverlap >= chunkSize at the library level', () => {
    const cfg = RagUIComponentIngestConfig.fromDict({
      base: { chunk_size: 500, chunk_overlap: 100 },
      libraries: [
        {
          name: 'Ant Design',
          slug: 'ant-design',
          import_packages: ['antd'],
          chunk_size: 200,
          chunk_overlap: 200,
        },
      ],
    });

    const errors = cfg.validate();
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toMatch(/chunkOverlap.*must be less than.*chunkSize/);
  });

  it('reports duplicate slugs', () => {
    const cfg = RagUIComponentIngestConfig.fromDict({
      base: {},
      libraries: [
        { name: 'Ant Design', slug: 'ant-design', import_packages: ['antd'] },
        { name: 'Ant Design Copy', slug: 'ant-design', import_packages: ['antd'] },
      ],
    });

    const errors = cfg.validate();
    expect(errors.some((e) => e.includes('Duplicate library slug'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// fromArgs()
// ---------------------------------------------------------------------------

describe('RagUIComponentIngestConfig.fromArgs()', () => {
  it('applies camelCase overrides correctly', () => {
    const cfg = RagUIComponentIngestConfig.fromArgs({ chunkSize: 900, chunkOverlap: 90 });
    expect(cfg.base.chunkSize).toBe(900);
    expect(cfg.base.chunkOverlap).toBe(90);
  });

  it('applies snake_case overrides correctly', () => {
    const cfg = RagUIComponentIngestConfig.fromArgs({ chunk_size: 700, chunk_overlap: 70 });
    expect(cfg.base.chunkSize).toBe(700);
    expect(cfg.base.chunkOverlap).toBe(70);
  });

  it('falls back to default Ant Design library when no libraries provided', () => {
    const cfg = RagUIComponentIngestConfig.fromArgs({ chunkSize: 900, chunkOverlap: 90 });
    expect(cfg.libraries).toHaveLength(1);
    expect(cfg.libraries[0].slug).toBe('ant-design');
  });

  it('uses provided libraries array when given', () => {
    const cfg = RagUIComponentIngestConfig.fromArgs({
      chunk_size: 900,
      chunk_overlap: 90,
      libraries: [
        { name: 'Material UI', slug: 'material-ui', import_packages: ['@mui/material'] },
      ],
    });
    expect(cfg.libraries).toHaveLength(1);
    expect(cfg.libraries[0].slug).toBe('material-ui');
  });
});
