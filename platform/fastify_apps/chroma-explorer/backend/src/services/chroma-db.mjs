/**
 * ChromaDB Service
 *
 * Provides read-only access to ChromaDB SQLite databases using sql.js (WASM).
 * Supports ant-design and material-ui databases.
 * All data queries accept an optional `collection` parameter to scope results
 * to a specific ChromaDB collection (joined via segments).
 */

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Allowed database names — prevent path traversal
const ALLOWED_DB_NAMES = ['ant-design', 'material-ui'];

// Data directory: platform/data/chroma/{dbName}/chroma.sqlite3
const DATA_DIR = resolve(__dirname, '../../../../../data/chroma');

// Cache the SQL.js init promise
let sqlJsPromise = null;

/**
 * Get the initialized SQL.js module (cached).
 */
function getSqlJs() {
  if (!sqlJsPromise) {
    sqlJsPromise = initSqlJs();
  }
  return sqlJsPromise;
}

/**
 * Validate that a dbName is allowed to prevent path traversal.
 * @param {string} dbName
 * @returns {boolean}
 */
function isValidDbName(dbName) {
  return ALLOWED_DB_NAMES.includes(dbName);
}

/**
 * Open a read-only SQL.js database from the given ChromaDB file.
 * @param {string} dbName - one of ALLOWED_DB_NAMES
 * @returns {Promise<import('sql.js').Database>}
 */
async function openDb(dbName) {
  if (!isValidDbName(dbName)) {
    const err = new Error(`Unknown database: ${dbName}`);
    err.statusCode = 404;
    throw err;
  }

  const dbPath = resolve(DATA_DIR, dbName, 'chroma.sqlite3');

  if (!existsSync(dbPath)) {
    const err = new Error(`Database file not found for: ${dbName}`);
    err.statusCode = 404;
    throw err;
  }

  const SQL = await getSqlJs();
  const buffer = readFileSync(dbPath);
  return new SQL.Database(buffer);
}

/**
 * Run a SQL query and return all rows as plain objects.
 * @param {import('sql.js').Database} db
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {object[]}
 */
function queryAll(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Run a SQL query and return the first row as a plain object or null.
 * @param {import('sql.js').Database} db
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {object|null}
 */
function queryOne(db, sql, params = []) {
  const rows = queryAll(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Build a SQL subquery that resolves segment IDs for a given collection name.
 * Returns { clause, params } where clause is a WHERE/AND condition fragment
 * filtering embeddings.segment_id, or empty if no collection specified.
 *
 * @param {string} tableAlias - alias for the embeddings table (e.g. 'e')
 * @param {string|null} collection - collection name or null for all
 * @returns {{ clause: string, params: any[] }}
 */
function collectionFilter(tableAlias, collection) {
  if (!collection) return { clause: '', params: [] };
  return {
    clause: `${tableAlias}.segment_id IN (
      SELECT s.id FROM segments s
      JOIN collections c ON c.id = s.collection
      WHERE c.name = ?
    )`,
    params: [collection],
  };
}

/**
 * Build a SQL subquery filtering embedding_metadata rows to those
 * belonging to a specific collection.
 * @param {string} metaAlias - alias for embedding_metadata (e.g. 'em')
 * @param {string|null} collection
 * @returns {{ clause: string, params: any[] }}
 */
function collectionFilterForMeta(metaAlias, collection) {
  if (!collection) return { clause: '', params: [] };
  return {
    clause: `${metaAlias}.id IN (
      SELECT e_cf.id FROM embeddings e_cf
      JOIN segments s_cf ON s_cf.id = e_cf.segment_id
      JOIN collections c_cf ON c_cf.id = s_cf.collection
      WHERE c_cf.name = ?
    )`,
    params: [collection],
  };
}

/**
 * Create the ChromaDB service factory.
 * Returns an object with all query methods.
 */
export function createChromaDbService() {

  /**
   * List all available databases with per-collection info.
   * @returns {Promise<object[]>}
   */
  async function listDatabases() {
    const results = [];
    for (const dbName of ALLOWED_DB_NAMES) {
      try {
        const db = await openDb(dbName);
        try {
          const collections = queryAll(db, 'SELECT id, name, dimension FROM collections');
          // Count embeddings per collection via segments
          const collectionDetails = collections.map((col) => {
            const countRow = queryOne(
              db,
              `SELECT COUNT(*) as count FROM embeddings e
               JOIN segments s ON s.id = e.segment_id
               WHERE s.collection = ?`,
              [col.id],
            );
            return {
              id: col.id,
              name: col.name,
              dimension: col.dimension,
              embeddingCount: countRow ? countRow.count : 0,
            };
          });

          const totalCount = collectionDetails.reduce((sum, c) => sum + c.embeddingCount, 0);

          results.push({
            name: dbName,
            available: true,
            collections: collectionDetails,
            embeddingCount: totalCount,
          });
        } finally {
          db.close();
        }
      } catch (err) {
        results.push({
          name: dbName,
          available: false,
          error: err.message,
          collections: [],
          embeddingCount: 0,
        });
      }
    }
    return results;
  }

  /**
   * Get collection details for a specific database.
   * @param {string} dbName
   * @returns {Promise<object[]>}
   */
  async function getCollections(dbName) {
    const db = await openDb(dbName);
    try {
      const collections = queryAll(db, 'SELECT id, name, dimension FROM collections');
      return collections.map((col) => {
        const countRow = queryOne(
          db,
          `SELECT COUNT(*) as count FROM embeddings e
           JOIN segments s ON s.id = e.segment_id
           WHERE s.collection = ?`,
          [col.id],
        );
        return {
          id: col.id,
          name: col.name,
          dimension: col.dimension,
          embeddingCount: countRow ? countRow.count : 0,
        };
      });
    } finally {
      db.close();
    }
  }

  /**
   * List embeddings with pagination and optional filters.
   * @param {string} dbName
   * @param {object} options
   * @param {number} [options.page=1]
   * @param {number} [options.limit=20]
   * @param {string} [options.component]
   * @param {string} [options.file_name]
   * @param {string} [options.collection]
   * @returns {Promise<object>}
   */
  async function listEmbeddings(dbName, options = {}) {
    const { page = 1, limit = 20, component, file_name, collection } = options;
    const offset = (page - 1) * limit;

    const db = await openDb(dbName);
    try {
      const conditions = [];
      const countParams = [];
      const queryParams = [];

      // Collection filter
      const cf = collectionFilter('e', collection);
      if (cf.clause) {
        conditions.push(cf.clause);
        countParams.push(...cf.params);
        queryParams.push(...cf.params);
      }

      if (component) {
        conditions.push(`e.id IN (
          SELECT em2.id FROM embedding_metadata em2
          WHERE em2."key" = 'component' AND em2.string_value = ?
        )`);
        countParams.push(component);
        queryParams.push(component);
      }

      if (file_name) {
        conditions.push(`e.id IN (
          SELECT em3.id FROM embedding_metadata em3
          WHERE em3."key" = 'file_name' AND em3.string_value LIKE ?
        )`);
        countParams.push(`%${file_name}%`);
        queryParams.push(`%${file_name}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const totalRow = queryOne(db, `SELECT COUNT(*) as count FROM embeddings e ${whereClause}`, countParams);
      const total = totalRow ? totalRow.count : 0;

      const rows = queryAll(
        db,
        `SELECT e.id, e.embedding_id, e.created_at
         FROM embeddings e
         ${whereClause}
         ORDER BY e.id
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset],
      );

      const embeddings = rows.map((row) => {
        const metaRows = queryAll(
          db,
          `SELECT "key", string_value, int_value, float_value, bool_value
           FROM embedding_metadata
           WHERE id = ?`,
          [row.id],
        );
        const metadata = {};
        for (const m of metaRows) {
          const value = m.string_value ?? m.int_value ?? m.float_value ?? m.bool_value;
          metadata[m.key] = value;
        }
        return {
          id: row.id,
          embeddingId: row.embedding_id,
          createdAt: row.created_at,
          document: metadata['chroma:document'] ?? null,
          component: metadata['component'] ?? null,
          fileName: metadata['file_name'] ?? null,
          filePath: metadata['file_path'] ?? null,
          library: metadata['library'] ?? null,
          source: metadata['source'] ?? null,
          metadata,
        };
      });

      return {
        embeddings,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } finally {
      db.close();
    }
  }

  /**
   * Get a single embedding by its internal row id with all metadata.
   * @param {string} dbName
   * @param {string|number} embeddingId
   * @returns {Promise<object|null>}
   */
  async function getEmbeddingById(dbName, embeddingId) {
    const db = await openDb(dbName);
    try {
      const row = queryOne(
        db,
        `SELECT id, embedding_id, created_at
         FROM embeddings
         WHERE id = ? OR embedding_id = ?
         LIMIT 1`,
        [embeddingId, embeddingId],
      );

      if (!row) return null;

      const metaRows = queryAll(
        db,
        `SELECT "key", string_value, int_value, float_value, bool_value
         FROM embedding_metadata
         WHERE id = ?`,
        [row.id],
      );

      const metadata = {};
      for (const m of metaRows) {
        const value = m.string_value ?? m.int_value ?? m.float_value ?? m.bool_value;
        metadata[m.key] = value;
      }

      return {
        id: row.id,
        embeddingId: row.embedding_id,
        createdAt: row.created_at,
        document: metadata['chroma:document'] ?? null,
        component: metadata['component'] ?? null,
        fileName: metadata['file_name'] ?? null,
        filePath: metadata['file_path'] ?? null,
        library: metadata['library'] ?? null,
        source: metadata['source'] ?? null,
        metadata,
        rawMetadata: metaRows,
      };
    } finally {
      db.close();
    }
  }

  /**
   * Get distinct metadata keys with value counts.
   * @param {string} dbName
   * @param {string} [collection]
   * @returns {Promise<object[]>}
   */
  async function getMetadataKeys(dbName, collection) {
    const db = await openDb(dbName);
    try {
      const cf = collectionFilterForMeta('em', collection);
      const where = cf.clause ? `WHERE ${cf.clause}` : '';
      const rows = queryAll(
        db,
        `SELECT "key", COUNT(*) as count, COUNT(DISTINCT string_value) as distinct_values
         FROM embedding_metadata em
         ${where}
         GROUP BY "key"
         ORDER BY count DESC`,
        cf.params,
      );
      return rows.map((r) => ({
        key: r.key,
        count: r.count,
        distinctValues: r.distinct_values,
      }));
    } finally {
      db.close();
    }
  }

  /**
   * Get component names with embedding counts.
   * @param {string} dbName
   * @param {number} [limit=100]
   * @param {string} [collection]
   * @returns {Promise<object[]>}
   */
  async function getComponents(dbName, limit = 100, collection) {
    const db = await openDb(dbName);
    try {
      const cf = collectionFilterForMeta('em', collection);
      const extraWhere = cf.clause ? ` AND ${cf.clause}` : '';

      // Check if 'component' metadata key exists
      const hasComponentKey = queryOne(
        db,
        `SELECT 1 FROM embedding_metadata em WHERE "key" = 'component'${extraWhere} LIMIT 1`,
        cf.params,
      );

      if (hasComponentKey) {
        const rows = queryAll(
          db,
          `SELECT string_value as component, COUNT(*) as count
           FROM embedding_metadata em
           WHERE "key" = 'component' AND string_value IS NOT NULL AND string_value != ''${extraWhere}
           GROUP BY string_value
           ORDER BY count DESC
           LIMIT ?`,
          [...cf.params, limit],
        );
        return rows.map((r) => ({
          component: r.component,
          count: r.count,
        }));
      }

      // Fallback: derive components from 'source' paths
      const sourceRows = queryAll(
        db,
        `SELECT string_value as source
         FROM embedding_metadata em
         WHERE "key" = 'source' AND string_value IS NOT NULL AND string_value != ''${extraWhere}`,
        cf.params,
      );

      const counts = new Map();
      for (const r of sourceRows) {
        const pkgMatch = r.source.match(/\/packages\/([^/]+)/);
        const component = pkgMatch ? pkgMatch[1] : r.source.split('/').slice(-2, -1)[0] || 'unknown';
        counts.set(component, (counts.get(component) || 0) + 1);
      }

      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([component, count]) => ({ component, count }));
    } finally {
      db.close();
    }
  }

  /**
   * Get aggregate statistics for a database, optionally scoped to a collection.
   * @param {string} dbName
   * @param {string} [collection]
   * @returns {Promise<object>}
   */
  async function getStats(dbName, collection) {
    const db = await openDb(dbName);
    try {
      const eCf = collectionFilter('e', collection);
      const eWhere = eCf.clause ? `WHERE ${eCf.clause}` : '';

      const mCf = collectionFilterForMeta('em', collection);
      const mExtra = mCf.clause ? ` AND ${mCf.clause}` : '';

      const totalEmbeddings = queryOne(
        db,
        `SELECT COUNT(*) as count FROM embeddings e ${eWhere}`,
        eCf.params,
      ).count;

      const uniqueFiles = queryOne(
        db,
        `SELECT COUNT(DISTINCT string_value) as count
         FROM embedding_metadata em
         WHERE "key" = 'file_name' AND string_value IS NOT NULL AND string_value != ''${mExtra}`,
        mCf.params,
      ).count;

      const uniqueLibraries = queryOne(
        db,
        `SELECT COUNT(DISTINCT string_value) as count
         FROM embedding_metadata em
         WHERE "key" = 'library' AND string_value IS NOT NULL AND string_value != ''${mExtra}`,
        mCf.params,
      ).count;

      const metadataDistribution = queryAll(
        db,
        `SELECT "key", COUNT(*) as count
         FROM embedding_metadata em
         WHERE 1=1${mExtra}
         GROUP BY "key"
         ORDER BY count DESC`,
        mCf.params,
      );

      // Get the specific collection info if filtering, otherwise pick first
      let collectionInfo = null;
      if (collection) {
        collectionInfo = queryOne(db, 'SELECT id, name, dimension FROM collections WHERE name = ?', [collection]);
      }
      if (!collectionInfo) {
        collectionInfo = queryOne(db, 'SELECT id, name, dimension FROM collections LIMIT 1');
      }

      const derivedComponents = await getComponents(dbName, 20, collection);

      return {
        totalEmbeddings,
        uniqueComponents: derivedComponents.length,
        uniqueFiles,
        uniqueLibraries,
        collection: collectionInfo
          ? { id: collectionInfo.id, name: collectionInfo.name, dimension: collectionInfo.dimension }
          : null,
        metadataDistribution: metadataDistribution.map((r) => ({
          key: r.key,
          count: r.count,
        })),
        topComponents: derivedComponents,
      };
    } finally {
      db.close();
    }
  }

  /**
   * Full-text search on document content, optionally scoped to a collection.
   * @param {string} dbName
   * @param {string} q - search query
   * @param {number} [limit=20]
   * @param {string} [collection]
   * @returns {Promise<object[]>}
   */
  async function searchEmbeddings(dbName, q, limit = 20, collection) {
    const db = await openDb(dbName);
    try {
      const cf = collectionFilter('e', collection);
      const extraWhere = cf.clause ? ` AND ${cf.clause}` : '';

      const rows = queryAll(
        db,
        `SELECT e.id, e.embedding_id, e.created_at,
                em.string_value as document_text
         FROM embeddings e
         JOIN embedding_metadata em ON em.id = e.id AND em."key" = 'chroma:document'
         WHERE em.string_value LIKE ?${extraWhere}
         LIMIT ?`,
        [`%${q}%`, ...cf.params, limit],
      );

      return rows.map((row) => {
        const metaRows = queryAll(
          db,
          `SELECT "key", string_value, int_value, float_value, bool_value
           FROM embedding_metadata
           WHERE id = ?`,
          [row.id],
        );
        const metadata = {};
        for (const m of metaRows) {
          const value = m.string_value ?? m.int_value ?? m.float_value ?? m.bool_value;
          metadata[m.key] = value;
        }
        return {
          id: row.id,
          embeddingId: row.embedding_id,
          createdAt: row.created_at,
          document: row.document_text ?? metadata['chroma:document'] ?? null,
          component: metadata['component'] ?? null,
          fileName: metadata['file_name'] ?? null,
          filePath: metadata['file_path'] ?? null,
          library: metadata['library'] ?? null,
          source: metadata['source'] ?? null,
          metadata,
        };
      });
    } finally {
      db.close();
    }
  }

  return {
    listDatabases,
    getCollections,
    listEmbeddings,
    getEmbeddingById,
    getMetadataKeys,
    getComponents,
    getStats,
    searchEmbeddings,
    isValidDbName,
    ALLOWED_DB_NAMES,
  };
}
