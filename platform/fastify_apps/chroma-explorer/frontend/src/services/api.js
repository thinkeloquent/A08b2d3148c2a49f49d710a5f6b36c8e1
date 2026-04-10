/**
 * ChromaDB Explorer API client
 * All calls go to /api/chroma-explorer/*
 */

const BASE = '/api/chroma-explorer';

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const err = new Error(body.message || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/** GET /api/chroma-explorer — health check */
export function fetchHealth() {
  return apiFetch('');
}

/** GET /api/chroma-explorer/databases */
export function fetchDatabases() {
  return apiFetch('/databases');
}

/** GET /api/chroma-explorer/databases/:dbName/collections */
export function fetchCollections(dbName) {
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/collections`);
}

/** GET /api/chroma-explorer/databases/:dbName/embeddings */
export function fetchEmbeddings(dbName, { page = 1, limit = 20, component, file_name, collection } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (component) params.set('component', component);
  if (file_name) params.set('file_name', file_name);
  if (collection) params.set('collection', collection);
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/embeddings?${params}`);
}

/** GET /api/chroma-explorer/databases/:dbName/embeddings/:id */
export function fetchEmbedding(dbName, embeddingId) {
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/embeddings/${encodeURIComponent(embeddingId)}`);
}

/** GET /api/chroma-explorer/databases/:dbName/metadata-keys */
export function fetchMetadataKeys(dbName, collection) {
  const params = new URLSearchParams();
  if (collection) params.set('collection', collection);
  const qs = params.toString();
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/metadata-keys${qs ? `?${qs}` : ''}`);
}

/** GET /api/chroma-explorer/databases/:dbName/components */
export function fetchComponents(dbName, limit = 100, collection) {
  const params = new URLSearchParams({ limit });
  if (collection) params.set('collection', collection);
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/components?${params}`);
}

/** GET /api/chroma-explorer/databases/:dbName/stats */
export function fetchStats(dbName, collection) {
  const params = new URLSearchParams();
  if (collection) params.set('collection', collection);
  const qs = params.toString();
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/stats${qs ? `?${qs}` : ''}`);
}

/** GET /api/chroma-explorer/databases/:dbName/search?q=... */
export function fetchSearch(dbName, q, limit = 20, collection) {
  const params = new URLSearchParams({ q, limit });
  if (collection) params.set('collection', collection);
  return apiFetch(`/databases/${encodeURIComponent(dbName)}/search?${params}`);
}
