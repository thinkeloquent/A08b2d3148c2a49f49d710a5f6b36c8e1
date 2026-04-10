/**
 * KV Store Routes
 * Simple key-value storage API backed by PostgreSQL for the frontend storage adapter.
 */
import { Op } from 'sequelize';

export default async function kvRoutes(fastify, _options) {
  const KvStore = fastify.db.KvStore;

  // GET /kv/:key — retrieve a value (returns null for missing keys)
  fastify.get('/kv/:key', async (request, reply) => {
    const row = await KvStore.findByPk(request.params.key);
    return reply.send({ key: request.params.key, value: row ? row.value : null });
  });

  // PUT /kv/:key — upsert a value
  fastify.put('/kv/:key', {
    schema: {
      body: { type: 'object', required: ['value'], properties: { value: {} } },
    },
  }, async (request, reply) => {
    const [row] = await KvStore.upsert({
      key: request.params.key,
      value: request.body.value,
    });
    return reply.send({ key: row.key, value: row.value });
  });

  // DELETE /kv/:key — remove a key
  fastify.delete('/kv/:key', async (request, reply) => {
    const deleted = await KvStore.destroy({ where: { key: request.params.key } });
    if (!deleted) {
      return reply.status(404).send({ statusCode: 404, error: 'NotFound', message: `Key "${request.params.key}" not found` });
    }
    return reply.send({ success: true });
  });

  // GET /kv?prefix=foo — list keys matching a prefix
  fastify.get('/kv', async (request, reply) => {
    const prefix = request.query.prefix || '';
    const where = prefix ? { key: { [Op.like]: `${prefix}%` } } : {};
    const rows = await KvStore.findAll({ where, attributes: ['key'], order: [['key', 'ASC']] });
    return reply.send({ keys: rows.map((r) => r.key) });
  });

  // DELETE /kv — clear all keys (with optional prefix filter)
  fastify.delete('/kv', async (request, reply) => {
    const prefix = request.query.prefix || '';
    const where = prefix ? { key: { [Op.like]: `${prefix}%` } } : {};
    const count = await KvStore.destroy({ where });
    return reply.send({ success: true, deleted: count });
  });
}
