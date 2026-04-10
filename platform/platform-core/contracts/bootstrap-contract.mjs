/**
 * Bootstrap Contract
 *
 * Defines the interface for server bootstrap modules (both Fastify and FastAPI).
 * Bootstrap runs ONCE at application start/shutdown.
 *
 * Interface:
 *   setup(config: BootstrapConfig): Promise<Server>
 *   shutdown(server: Server): Promise<void>
 */

import path from 'node:path';

/**
 * @typedef {Object} BootstrapConfig
 * @property {number} port - Server port (Fastify: 51000, FastAPI: 52000)
 * @property {string} host - Server host (default: '0.0.0.0')
 * @property {Object} logger - Logger configuration
 * @property {string} logger.level - Log level (default: 'info')
 * @property {boolean} logger.prettyPrint - Pretty print for dev
 * @property {string[]} corePlugins - Plugin module paths to load
 * @property {string[]} coreLifecycles - Core lifecycle hook paths
 * @property {string[]} loaders - Loader module paths to execute
 */

/**
 * @typedef {Object} LoaderReport
 * @property {string} loader - Loader name
 * @property {number} discovered - Count of items found during discovery
 * @property {number} validated - Count of items that passed validation
 * @property {number} registered - Count of items successfully registered
 * @property {number} skipped - Count of items skipped
 * @property {Array<{path: string, step: string, error: string}>} errors - Error details
 * @property {Object} details - Additional loader-specific information
 */

/**
 * Validates a bootstrap config object.
 * @param {Object} config
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateBootstrapConfig(config) {
  const errors = [];

  if (!config || typeof config !== 'object') {
    return { valid: false, errors: ['Config must be an object'] };
  }

  if (typeof config.port !== 'number' || config.port < 1 || config.port > 65535) {
    errors.push('port must be a number between 1 and 65535');
  }

  if (config.host !== undefined && typeof config.host !== 'string') {
    errors.push('host must be a string');
  }

  if (config.logger !== undefined) {
    if (typeof config.logger !== 'object') {
      errors.push('logger must be an object');
    } else if (config.logger.level !== undefined) {
      const validLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'];
      if (!validLevels.includes(config.logger.level)) {
        errors.push(`logger.level must be one of: ${validLevels.join(', ')}`);
      }
    }
  }

  for (const key of ['corePlugins', 'coreLifecycles', 'loaders']) {
    if (config[key] !== undefined) {
      if (!Array.isArray(config[key])) {
        errors.push(`${key} must be an array`);
      } else if (!config[key].every((item) => typeof item === 'string')) {
        errors.push(`${key} must contain only strings`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates a default bootstrap config.
 * @param {Partial<BootstrapConfig>} overrides
 * @returns {BootstrapConfig}
 */
export function createDefaultConfig(overrides = {}) {
  return {
    port: 51000,
    host: '0.0.0.0',
    logger: {
      level: process.env.LOG_LEVEL || 'info',
      prettyPrint: process.env.NODE_ENV !== 'production',
    },
    corePlugins: [],
    coreLifecycles: [],
    loaders: [],
    ...overrides,
  };
}

/**
 * Creates an empty loader report structure.
 * @param {string} loaderName
 * @returns {LoaderReport}
 */
export function createLoaderReport(loaderName) {
  return {
    loader: loaderName,
    discovered: 0,
    validated: 0,
    imported: 0,
    registered: 0,
    skipped: 0,
    errors: [],
    details: {},
  };
}

/**
 * Sort file paths by numeric prefix extracted from filename.
 * "01_config.lifecycle.mjs" -> prefix 1
 * "100_decorators.lifecycle.mjs" -> prefix 100
 * Files without numeric prefix sort to 999.
 * @param {string[]} filePaths
 * @returns {string[]}
 */
export function sortByNumericPrefix(filePaths) {
  return [...filePaths].sort((a, b) => {
    const numA = parseInt(path.basename(a).match(/^(\d+)/)?.[1] || '999', 10);
    const numB = parseInt(path.basename(b).match(/^(\d+)/)?.[1] || '999', 10);
    return numA - numB || a.localeCompare(b);
  });
}
