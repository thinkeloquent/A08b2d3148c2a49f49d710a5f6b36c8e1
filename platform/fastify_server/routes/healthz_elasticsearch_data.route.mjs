import {
  ElasticsearchConfig,
  getSyncElasticsearchClient,
} from "@internal/db-connection-elasticsearch";

/**
 * Mount elasticsearch data-exploration routes.
 * These are read-only endpoints for browsing indices, documents, and field mappings.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  // Helper: create a short-lived client
  async function withClient(fn) {
    const config = new ElasticsearchConfig();
    const client = getSyncElasticsearchClient(config);
    try {
      return await fn(client, config);
    } finally {
      await client.close();
    }
  }

  // Normalise response body across ES v8 (returns body directly) and OpenSearch (returns { body })
  function body(response) {
    return response && typeof response === "object" && "body" in response && "statusCode" in response
      ? response.body
      : response;
  }

  // ── GET /healthz/elasticsearch/indices ──
  server.get("/healthz/elasticsearch/indices", async (_request, reply) => {
    try {
      return await withClient(async (client, config) => {
        const raw = await client.cat.indices({ format: "json" });
        const rows = body(raw);

        const indices = rows.map((r) => ({
          index: r.index,
          health: r.health,
          status: r.status,
          docsCount: r["docs.count"],
          storeSize: r["store.size"],
        }));

        return {
          configuredIndex: config.options.index || null,
          indices,
        };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/elasticsearch/indices/:index/mappings ──
  server.get("/healthz/elasticsearch/indices/:index/mappings", async (request, reply) => {
    const { index } = request.params;
    try {
      return await withClient(async (client) => {
        const raw = await client.indices.getMapping({ index });
        const data = body(raw);
        const mappings = data[index]?.mappings || {};
        return { index, mappings };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/elasticsearch/indices/:index/documents?from=0&size=20 ──
  server.get("/healthz/elasticsearch/indices/:index/documents", async (request, reply) => {
    const { index } = request.params;
    const from = Math.max(0, parseInt(request.query.from, 10) || 0);
    const size = Math.min(100, Math.max(1, parseInt(request.query.size, 10) || 20));

    try {
      return await withClient(async (client) => {
        const raw = await client.search({
          index,
          from,
          size,
          body: { query: { match_all: {} } },
        });
        const data = body(raw);

        const total =
          typeof data.hits.total === "number"
            ? data.hits.total
            : data.hits.total?.value ?? 0;

        const documents = data.hits.hits.map((hit) => ({
          _id: hit._id,
          _source: hit._source,
        }));

        return { index, total, from, size, documents };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });
}
