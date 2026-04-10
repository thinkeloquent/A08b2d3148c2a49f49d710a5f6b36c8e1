/**
 * Compatibility Adapter
 *
 * Wraps existing lifecycle file signatures to conform to the new lifecycle.schema.json.
 * Existing lifecycle files export:
 *   - async function onStartup(server, config) { ... }
 *   - async function onShutdown(server) { ... }
 *
 * The new contract expects:
 *   - { name, order, setup(server, config), shutdown(server) }
 */

import { basename } from 'node:path';

/**
 * Extracts the numeric order prefix from a lifecycle filename.
 * e.g. "01_config.lifecycle.mjs" -> 1
 *      "105-sequelize.lifecycle.mjs" -> 105
 * @param {string} filename
 * @returns {number}
 */
function extractOrder(filename) {
  const base = basename(filename);
  const match = base.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

/**
 * Extracts the human-readable name from a lifecycle filename.
 * e.g. "01_config.lifecycle.mjs" -> "config"
 *      "105-sequelize.lifecycle.mjs" -> "sequelize"
 * @param {string} filename
 * @returns {string}
 */
function extractName(filename) {
  const base = basename(filename);
  return base
    .replace(/^\d+[-_]?/, '')
    .replace(/\.lifecycle\.(mjs|py)$/, '')
    .replace(/[-_]/g, '-');
}

/**
 * Categorizes a lifecycle hook based on its numeric order prefix.
 * @param {number} order
 * @returns {string}
 */
function categorizeByOrder(order) {
  if (order < 100) return 'core';
  if (order < 200) return 'persistence';
  if (order < 500) return 'apps';
  return 'providers';
}

/**
 * Wraps a legacy lifecycle module into the new contract format.
 *
 * @param {Object} legacyModule - The imported module (with onStartup/onShutdown exports)
 * @param {string} filePath - Path to the lifecycle file (used for name/order extraction)
 * @param {Object} [overrides] - Optional overrides for name, order, or category
 * @returns {Object} New contract-compatible lifecycle object
 */
export function adaptLegacyLifecycle(legacyModule, filePath, overrides = {}) {
  const name = overrides.name || extractName(filePath);
  const order = overrides.order ?? extractOrder(filePath);

  return {
    name,
    order,
    category: overrides.category || categorizeByOrder(order),

    async setup(server, config) {
      if (typeof legacyModule.onStartup === 'function') {
        await legacyModule.onStartup(server, config);
      }
    },

    async shutdown(server) {
      if (typeof legacyModule.onShutdown === 'function') {
        await legacyModule.onShutdown(server);
      }
    },
  };
}

/**
 * Batch-adapts an array of legacy lifecycle modules.
 *
 * @param {Array<{ module: Object, filePath: string }>} legacyModules
 * @returns {Object[]} Array of adapted lifecycle objects, sorted by order
 */
export function adaptAll(legacyModules) {
  return legacyModules
    .map(({ module, filePath }) => adaptLegacyLifecycle(module, filePath))
    .sort((a, b) => a.order - b.order);
}
