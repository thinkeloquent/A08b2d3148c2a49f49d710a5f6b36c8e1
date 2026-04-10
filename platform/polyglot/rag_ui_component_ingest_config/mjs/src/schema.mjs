/**
 * @fileoverview Zod v3 validation schemas for rag_ui_component_ingest_config.
 *
 * All schemas use camelCase keys to match the MJS internal representation.
 * The Python counterpart uses snake_case (Pydantic); when exchanging data over
 * the wire use the `toDict()` methods that emit snake_case.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// BaseIngestConfigSchema
// ---------------------------------------------------------------------------

/**
 * Validates all shared infrastructure configuration fields.
 * Mirrors Python's `BaseIngestConfigSchema` (Pydantic).
 */
export const BaseIngestConfigSchema = z
  .object({
    // Paths
    datasetRoot: z.string().min(1),
    persistRoot: z.string().min(1),

    // Embeddings
    embeddingsModelName: z.string().min(1),

    // Chunking
    chunkSize: z.number().int().positive(),
    chunkOverlap: z.number().int().nonnegative(),

    // Vector backend
    vectorBackend: z.enum(['chroma', 'elasticsearch']),

    // Elasticsearch
    elasticsearchHost: z.string().min(1),
    elasticsearchPort: z.number().int().positive(),
    elasticsearchScheme: z.string().min(1),

    // Redis
    redisHost: z.string().min(1),
    redisPort: z.number().int().positive(),

    // LLM
    llmProvider: z.string().min(1),
    openaiModel: z.string().min(1),
    anthropicModel: z.string().min(1),
    geminiModel: z.string().min(1),

    // Search / retrieval
    hybridAlpha: z.number().min(0).max(1),
    scoreThreshold: z.number().min(0),
    rerankerEnabled: z.boolean(),
    rerankerModel: z.string().min(1),
    retrieveN: z.number().int().positive(),
    topK: z.number().int().positive(),

    // Database
    postgresEnabled: z.boolean(),
  })
  .refine(
    (data) => data.chunkOverlap < data.chunkSize,
    (data) => ({
      message: `chunkOverlap (${data.chunkOverlap}) must be less than chunkSize (${data.chunkSize})`,
      path: ['chunkOverlap'],
    }),
  );

// ---------------------------------------------------------------------------
// LibraryConfigSchema
// ---------------------------------------------------------------------------

/**
 * Validates a single library configuration entry.
 * Mirrors Python's `LibraryConfigSchema`.
 */
export const LibraryConfigSchema = z.object({
  // Identity — required
  name: z.string().min(1),
  slug: z
    .string()
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      'slug must be URL-safe lowercase with at least 2 characters',
    ),

  // Optional overrides
  version: z.string().optional(),
  sourceDirectory: z.string().optional(),
  persistDirectory: z.string().optional(),
  examplesDirectory: z.string().optional(),
  elasticsearchIndex: z.string().optional(),
  componentPathSegment: z.string().default('components'),

  importPackages: z.array(z.string()).default([]),
  chunkSize: z.number().int().positive().optional(),
  chunkOverlap: z.number().int().nonnegative().optional(),

  fileExtensions: z.array(z.string()).optional(),
  ignoredDirectories: z.array(z.string()).optional(),

  enabled: z.boolean().default(true),
});

// ---------------------------------------------------------------------------
// DocumentMetadataSchema
// ---------------------------------------------------------------------------

/**
 * Source type discriminator — the canonical set of values.
 */
export const SOURCE_TYPE_ENUM = z.enum([
  'component',
  'story',
  'doc',
  'style',
  'type',
  'test',
  'config',
]);

/**
 * Validates the metadata attached to a single document chunk.
 * Mirrors Python's `DocumentMetadataSchema`.
 */
export const DocumentMetadataSchema = z.object({
  // Identity
  library: z.string().min(1),
  libraryVersion: z.string().optional(),
  component: z.string().optional(),

  // Source
  fileName: z.string().min(1),
  filePath: z.string().min(1),
  sourceType: SOURCE_TYPE_ENUM,
  language: z.string(),

  // Lineage
  contentHash: z.string(),
  chunkIndex: z.number().int().nonnegative(),
  totalChunks: z.number().int().positive(),
  ingestedAt: z.string(),

  // Navigation
  heading: z.string().optional(),
  exportName: z.string().optional(),
});
