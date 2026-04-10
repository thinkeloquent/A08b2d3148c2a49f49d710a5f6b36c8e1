/**
 * Adaptive storage — resolve the active adapter by name.
 * Default: localStorage (works in any browser with zero config).
 */
import { localStorageAdapter } from './localStorageAdapter.js';
import { redisAdapter } from './redisAdapter.js';
import { postgresAdapter } from './postgresAdapter.js';

const adapters = {
  localStorage: localStorageAdapter,
  redis: redisAdapter,
  postgres: postgresAdapter,
};

let activeAdapter = localStorageAdapter;

export function setStorageAdapter(name) {
  const adapter = adapters[name];
  if (!adapter) throw new Error(`Unknown storage adapter: "${name}"`);
  activeAdapter = adapter;
}

export function getStorageAdapter() {
  return activeAdapter;
}

export function listAdapters() {
  return Object.keys(adapters);
}
