import { PostgresConfig, getPostgresClient } from "@internal/db_connection_postgres";
import { QueryTypes } from "sequelize";

/**
 * Mount postgres data-exploration routes.
 * Read-only endpoints for browsing schemas, tables, rows, and columns.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  // Helper: create a short-lived Sequelize client, close when done
  async function withClient(fn) {
    const config = new PostgresConfig();
    const client = getPostgresClient(config);
    try {
      return await fn(client, config);
    } finally {
      try {
        await client.close();
      } catch (_) {
        // ignore
      }
    }
  }

  // ── GET /healthz/postgres/schemas ──
  server.get("/healthz/postgres/schemas", async (_request, reply) => {
    try {
      return await withClient(async (client, config) => {
        const rows = await client.query(
          `SELECT schema_name
           FROM information_schema.schemata
           WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
           ORDER BY schema_name`,
          { type: QueryTypes.SELECT }
        );

        const schemas = rows.map((r) => r.schema_name);

        return {
          configuredSchema: config.schema || "public",
          schemas,
        };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/postgres/schemas/:schema/tables ──
  server.get("/healthz/postgres/schemas/:schema/tables", async (request, reply) => {
    const { schema } = request.params;
    try {
      return await withClient(async (client) => {
        const rows = await client.query(
          `SELECT table_name, table_type,
                  (SELECT reltuples::bigint FROM pg_class
                   WHERE relname = t.table_name
                     AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = t.table_schema)
                  ) AS estimated_rows
           FROM information_schema.tables t
           WHERE table_schema = :schema
           ORDER BY table_name`,
          { replacements: { schema }, type: QueryTypes.SELECT }
        );

        const tables = rows.map((r) => ({
          name: r.table_name,
          type: r.table_type,
          estimatedRows: Number(r.estimated_rows) || 0,
        }));

        return { schema, tables };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/postgres/schemas/:schema/tables/:table/columns ──
  server.get("/healthz/postgres/schemas/:schema/tables/:table/columns", async (request, reply) => {
    const { schema, table } = request.params;
    try {
      return await withClient(async (client) => {
        const rows = await client.query(
          `SELECT column_name, data_type, is_nullable, column_default,
                  character_maximum_length, numeric_precision
           FROM information_schema.columns
           WHERE table_schema = :schema AND table_name = :table
           ORDER BY ordinal_position`,
          { replacements: { schema, table }, type: QueryTypes.SELECT }
        );

        const columns = rows.map((r) => ({
          name: r.column_name,
          type: r.data_type,
          nullable: r.is_nullable === "YES",
          default: r.column_default,
          maxLength: r.character_maximum_length,
          precision: r.numeric_precision,
        }));

        return { schema, table, columns };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/postgres/schemas/:schema/tables/:table/rows?offset=0&limit=20 ──
  server.get("/healthz/postgres/schemas/:schema/tables/:table/rows", async (request, reply) => {
    const { schema, table } = request.params;
    const offset = Math.max(0, parseInt(request.query.offset, 10) || 0);
    const limit = Math.min(100, Math.max(1, parseInt(request.query.limit, 10) || 20));

    try {
      return await withClient(async (client) => {
        // Validate table exists in schema to prevent injection via identifiers
        const check = await client.query(
          `SELECT 1 FROM information_schema.tables WHERE table_schema = :schema AND table_name = :table`,
          { replacements: { schema, table }, type: QueryTypes.SELECT }
        );
        if (check.length === 0) {
          reply.code(404);
          return { error: `Table ${schema}.${table} not found` };
        }

        // Safe to use identifiers since we validated existence
        const quotedSchema = client.getQueryInterface().queryGenerator.quoteIdentifier(schema);
        const quotedTable = client.getQueryInterface().queryGenerator.quoteIdentifier(table);

        const countResult = await client.query(
          `SELECT COUNT(*) AS total FROM ${quotedSchema}.${quotedTable}`,
          { type: QueryTypes.SELECT }
        );
        const total = Number(countResult[0]?.total) || 0;

        const rows = await client.query(
          `SELECT * FROM ${quotedSchema}.${quotedTable} LIMIT :limit OFFSET :offset`,
          { replacements: { limit, offset }, type: QueryTypes.SELECT }
        );

        return { schema, table, total, offset, limit, rows };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });
}
