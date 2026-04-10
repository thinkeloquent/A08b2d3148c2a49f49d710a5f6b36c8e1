/**
 * LocalStorage adapter — default storage backend.
 * Implements the StorageAdapter interface for browser-side persistence.
 */
const LS_PREFIX = 'lgraph_reflection_';

export const localStorageAdapter = {
  name: 'localStorage',

  async get(key) {
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${key}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  async set(key, value) {
    localStorage.setItem(`${LS_PREFIX}${key}`, JSON.stringify(value));
  },

  async delete(key) {
    localStorage.removeItem(`${LS_PREFIX}${key}`);
  },

  async list(prefix = '') {
    const results = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(`${LS_PREFIX}${prefix}`)) {
        results.push(k.slice(LS_PREFIX.length));
      }
    }
    return results;
  },

  async clear() {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith(LS_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  },
};
