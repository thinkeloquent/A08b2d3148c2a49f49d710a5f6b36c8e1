/**
 * @fileoverview Shared infrastructure defaults for rag_ui_component_ingest_config.
 *
 * All exported objects are deeply frozen and must not be mutated at runtime.
 * The keys use camelCase (MJS internal convention); `toDict()` on config
 * objects converts them to snake_case for the wire format.
 */

/**
 * Shared infrastructure defaults.
 * Every field here has a corresponding env-var override in BaseIngestConfig.
 *
 * @type {Readonly<{
 *   datasetRoot: string,
 *   persistRoot: string,
 *   embeddingsModelName: string,
 *   chunkSize: number,
 *   chunkOverlap: number,
 *   vectorBackend: string,
 *   elasticsearchHost: string,
 *   elasticsearchPort: number,
 *   elasticsearchScheme: string,
 *   redisHost: string,
 *   redisPort: number,
 *   llmProvider: string,
 *   openaiModel: string,
 *   anthropicModel: string,
 *   geminiModel: string,
 *   hybridAlpha: number,
 *   scoreThreshold: number,
 *   rerankerEnabled: boolean,
 *   rerankerModel: string,
 *   retrieveN: number,
 *   topK: number,
 *   postgresEnabled: boolean,
 * }>}
 */
export const DEFAULTS = Object.freeze({
  // Dataset / persistence paths
  datasetRoot: 'dataset/repos',
  persistRoot: 'data/chroma',

  // Embeddings
  embeddingsModelName: 'all-MiniLM-L6-v2',

  // Chunking
  chunkSize: 1200,
  chunkOverlap: 150,

  // Vector backend
  vectorBackend: 'chroma',

  // Elasticsearch
  elasticsearchHost: 'localhost',
  elasticsearchPort: 53300,
  elasticsearchScheme: 'https',

  // Redis
  redisHost: 'localhost',
  redisPort: 53200,

  // LLM
  llmProvider: 'openai',
  openaiModel: 'gpt-4o',
  anthropicModel: 'claude-sonnet-4-5-20250514',
  geminiModel: 'gemini-2.0-flash',

  // Search / retrieval
  hybridAlpha: 0.5,
  scoreThreshold: 0.0,
  rerankerEnabled: false,
  rerankerModel: 'gemini-2.0-flash',
  retrieveN: 50,
  topK: 6,

  // Database
  postgresEnabled: true,
});

/**
 * Default library configuration — Ant Design.
 * Used by `RagUIComponentIngestConfig.fromEnv()` when no manifest is provided.
 *
 * @type {Readonly<{
 *   name: string,
 *   slug: string,
 *   version: string,
 *   importPackages: readonly string[],
 *   componentPathSegment: string,
 *   fileExtensions: readonly string[],
 *   ignoredDirectories: readonly string[],
 *   enabled: boolean,
 * }>}
 */
export const DEFAULT_LIBRARY = Object.freeze({
  name: 'Ant Design',
  slug: 'ant-design',
  version: '5.x',
  importPackages: Object.freeze(['antd', '@ant-design/icons', '@ant-design/pro-components']),
  componentPathSegment: 'components',
  fileExtensions: Object.freeze(['.tsx', '.jsx', '.ts', '.js', '.md', '.mdx', '.css', '.less']),
  ignoredDirectories: Object.freeze([
    'node_modules',
    '__tests__',
    'demo',
    'locale',
    'style',
    '__snapshots__',
  ]),
  enabled: true,
});
