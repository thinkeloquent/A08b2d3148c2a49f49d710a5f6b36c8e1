/**
 * Redis adapter — placeholder.
 * Replace the implementation with an actual Redis client (e.g. ioredis via a
 * backend proxy, or a Redis HTTP gateway like Upstash).
 */
export const redisAdapter = {
  name: 'redis',

  async get(key) {
    throw new Error(`[RedisAdapter] Not implemented — get("${key}")`);
  },

  async set(key, _value) {
    throw new Error(`[RedisAdapter] Not implemented — set("${key}")`);
  },

  async delete(key) {
    throw new Error(`[RedisAdapter] Not implemented — delete("${key}")`);
  },

  async list(_prefix) {
    throw new Error('[RedisAdapter] Not implemented — list()');
  },

  async clear() {
    throw new Error('[RedisAdapter] Not implemented — clear()');
  },
};
