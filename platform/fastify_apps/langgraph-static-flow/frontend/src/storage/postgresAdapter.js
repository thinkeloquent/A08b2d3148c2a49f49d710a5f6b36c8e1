/**
 * Postgres adapter — proxies KV operations through the backend API.
 * Backend routes: /api/langgraph-static-flow/kv
 */
const API_BASE = '/~/api/langgraph-static-flow/kv';

export const postgresAdapter = {
  name: 'postgres',

  async get(key) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`);
    if (!res.ok) throw new Error(`[PostgresAdapter] GET failed (${res.status})`);
    const data = await res.json();
    return data.value;
  },

  async set(key, value) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value }),
    });
    if (!res.ok) throw new Error(`[PostgresAdapter] PUT failed (${res.status})`);
  },

  async delete(key) {
    const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`, {
      method: 'DELETE',
    });
    if (res.status === 404) return;
    if (!res.ok) throw new Error(`[PostgresAdapter] DELETE failed (${res.status})`);
  },

  async list(prefix = '') {
    const url = prefix
      ? `${API_BASE}?prefix=${encodeURIComponent(prefix)}`
      : API_BASE;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`[PostgresAdapter] LIST failed (${res.status})`);
    const data = await res.json();
    return data.keys;
  },

  async clear() {
    const res = await fetch(API_BASE, { method: 'DELETE' });
    if (!res.ok) throw new Error(`[PostgresAdapter] CLEAR failed (${res.status})`);
  },
};
