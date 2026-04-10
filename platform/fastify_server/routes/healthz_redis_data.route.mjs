import { RedisConfig, getRedisClient } from "@internal/db_connection_redis";

/**
 * Mount redis data-exploration routes.
 * Read-only endpoints for browsing keys, values, and namespaces.
 * @param {import('fastify').FastifyInstance} server
 */
export async function mount(server) {
  // Helper: create a short-lived client, disconnect when done
  async function withClient(fn) {
    const config = new RedisConfig();
    const client = getRedisClient(config);
    try {
      return await fn(client, config);
    } finally {
      try {
        client.disconnect();
      } catch (_) {
        // ignore
      }
    }
  }

  // ── GET /healthz/redis/keys?pattern=*&cursor=0&count=50 ──
  server.get("/healthz/redis/keys", async (request, reply) => {
    const pattern = request.query.pattern || "*";
    const cursor = request.query.cursor || "0";
    const count = Math.min(200, Math.max(1, parseInt(request.query.count, 10) || 50));

    try {
      return await withClient(async (client, config) => {
        const [nextCursor, rawKeys] = await client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          count
        );

        // Get type for each key
        const pipeline = client.pipeline();
        for (const key of rawKeys) {
          pipeline.type(key);
        }
        const types = await pipeline.exec();

        const keys = rawKeys.map((key, i) => ({
          key,
          type: types[i]?.[1] || "unknown",
        }));

        // Derive namespaces from all returned keys
        const nsSet = new Set();
        for (const key of rawKeys) {
          const idx = key.indexOf(":");
          if (idx > 0) nsSet.add(key.slice(0, idx));
        }

        return {
          cursor: nextCursor,
          keys,
          namespaces: [...nsSet].sort(),
          db: config.db ?? 0,
        };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/redis/key?name=<key> ──
  server.get("/healthz/redis/key", async (request, reply) => {
    const name = request.query.name;
    if (!name) {
      reply.code(400);
      return { error: "Query parameter 'name' is required" };
    }

    try {
      return await withClient(async (client) => {
        const keyType = await client.type(name);
        if (keyType === "none") {
          reply.code(404);
          return { error: `Key not found: ${name}` };
        }

        const ttl = await client.ttl(name);
        let value;

        switch (keyType) {
          case "string":
            value = await client.get(name);
            break;
          case "hash":
            value = await client.hgetall(name);
            break;
          case "list": {
            const len = await client.llen(name);
            value = { items: await client.lrange(name, 0, 99), length: len };
            break;
          }
          case "set": {
            const members = await client.smembers(name);
            value = { members, size: members.length };
            break;
          }
          case "zset": {
            const items = await client.zrange(name, 0, 99, "WITHSCORES");
            // ioredis returns flat array [member, score, member, score, ...]
            const pairs = [];
            for (let i = 0; i < items.length; i += 2) {
              pairs.push({ member: items[i], score: items[i + 1] });
            }
            const card = await client.zcard(name);
            value = { items: pairs, size: card };
            break;
          }
          default:
            value = null;
        }

        return { key: name, type: keyType, ttl, value };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });

  // ── GET /healthz/redis/namespaces ──
  server.get("/healthz/redis/namespaces", async (request, reply) => {
    try {
      return await withClient(async (client, config) => {
        const nsMap = {};
        let cur = "0";

        // Scan all keys to collect namespace prefixes
        do {
          const [nextCursor, keys] = await client.scan(cur, "COUNT", 500);
          cur = nextCursor;
          for (const key of keys) {
            const idx = key.indexOf(":");
            const ns = idx > 0 ? key.slice(0, idx) : "(root)";
            nsMap[ns] = (nsMap[ns] || 0) + 1;
          }
        } while (cur !== "0");

        const dbSize = await client.dbsize();

        const namespaces = Object.entries(nsMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));

        return { db: config.db ?? 0, dbSize, namespaces };
      });
    } catch (err) {
      reply.code(500);
      return { error: err.message || String(err) };
    }
  });
}
