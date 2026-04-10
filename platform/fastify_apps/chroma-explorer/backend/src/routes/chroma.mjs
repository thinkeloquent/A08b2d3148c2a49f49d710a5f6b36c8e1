/**
 * Chroma Explorer Routes
 * All API endpoints for browsing ChromaDB databases.
 * Most endpoints accept an optional `collection` query param to scope
 * results to a specific ChromaDB collection within the database.
 */

import { createChromaDbService } from '../services/chroma-db.mjs';

export default async function chromaRoutes(fastify, _options) {
  const service = createChromaDbService();

  /**
   * GET /databases
   * List all databases with per-collection info and embedding counts
   */
  fastify.get('/databases', {
    schema: {
      description: 'List all ChromaDB databases with collection info',
      tags: ['ChromaDB'],
    },
  }, async (_request, _reply) => {
    const databases = await service.listDatabases();
    return { databases };
  });

  /**
   * GET /databases/:dbName/collections
   * Get collection details for a specific database
   */
  fastify.get('/databases/:dbName/collections', {
    schema: {
      description: 'Get collection details for a specific database',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const collections = await service.getCollections(dbName);
    return { dbName, collections };
  });

  /**
   * GET /databases/:dbName/embeddings
   * List embeddings with pagination and optional filters
   * Query params: page, limit, component, file_name, collection
   */
  fastify.get('/databases/:dbName/embeddings', {
    schema: {
      description: 'List embeddings with pagination and optional filters',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          component: { type: 'string' },
          file_name: { type: 'string' },
          collection: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const { page, limit, component, file_name, collection } = request.query;
    const result = await service.listEmbeddings(dbName, { page, limit, component, file_name, collection });
    return { dbName, ...result };
  });

  /**
   * GET /databases/:dbName/embeddings/:embeddingId
   * Get a single embedding with all its metadata
   */
  fastify.get('/databases/:dbName/embeddings/:embeddingId', {
    schema: {
      description: 'Get a single embedding with all its metadata',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName', 'embeddingId'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
          embeddingId: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName, embeddingId } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const embedding = await service.getEmbeddingById(dbName, embeddingId);
    if (!embedding) {
      return reply.status(404).send({ error: 'Not Found', message: `Embedding not found: ${embeddingId}`, statusCode: 404 });
    }
    return { dbName, embedding };
  });

  /**
   * GET /databases/:dbName/metadata-keys
   * Get distinct metadata keys and their value counts
   * Query params: collection
   */
  fastify.get('/databases/:dbName/metadata-keys', {
    schema: {
      description: 'Get distinct metadata keys and their value counts',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          collection: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const { collection } = request.query;
    const keys = await service.getMetadataKeys(dbName, collection);
    return { dbName, keys };
  });

  /**
   * GET /databases/:dbName/components
   * Get component names with counts
   * Query params: limit, collection
   */
  fastify.get('/databases/:dbName/components', {
    schema: {
      description: 'Get component names with embedding counts',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 500, default: 100 },
          collection: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const { limit = 100, collection } = request.query;
    const components = await service.getComponents(dbName, limit, collection);
    return { dbName, components };
  });

  /**
   * GET /databases/:dbName/stats
   * Aggregate statistics, optionally scoped to a collection
   * Query params: collection
   */
  fastify.get('/databases/:dbName/stats', {
    schema: {
      description: 'Get aggregate statistics for a database',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          collection: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const { collection } = request.query;
    const stats = await service.getStats(dbName, collection);
    return { dbName, stats };
  });

  /**
   * GET /databases/:dbName/search
   * Full-text search on document content
   * Query params: q (required), limit, collection
   */
  fastify.get('/databases/:dbName/search', {
    schema: {
      description: 'Full-text search on document content',
      tags: ['ChromaDB'],
      params: {
        type: 'object',
        required: ['dbName'],
        properties: {
          dbName: { type: 'string', enum: service.ALLOWED_DB_NAMES },
        },
      },
      querystring: {
        type: 'object',
        required: ['q'],
        properties: {
          q: { type: 'string', minLength: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          collection: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    const { dbName } = request.params;
    if (!service.isValidDbName(dbName)) {
      return reply.status(404).send({ error: 'Not Found', message: `Unknown database: ${dbName}`, statusCode: 404 });
    }
    const { q, limit = 20, collection } = request.query;
    const results = await service.searchEmbeddings(dbName, q, limit, collection);
    return { dbName, query: q, results, count: results.length };
  });
}
