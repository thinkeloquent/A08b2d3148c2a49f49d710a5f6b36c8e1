/**
 * Postgres adapter — placeholder.
 * Replace the implementation with a real Postgres client
 * (e.g. pg via a backend proxy, Supabase, Neon serverless driver, etc.).
 */
export const postgresAdapter = {
  name: 'postgres',

  async get(key) {
    throw new Error(`[PostgresAdapter] Not implemented — get("${key}")`);
  },

  async set(key, _value) {
    throw new Error(`[PostgresAdapter] Not implemented — set("${key}")`);
  },

  async delete(key) {
    throw new Error(`[PostgresAdapter] Not implemented — delete("${key}")`);
  },

  async list(_prefix) {
    throw new Error('[PostgresAdapter] Not implemented — list()');
  },

  async clear() {
    throw new Error('[PostgresAdapter] Not implemented — clear()');
  },
};
