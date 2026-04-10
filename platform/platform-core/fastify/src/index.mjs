/**
 * @internal/platform-core-fastify
 *
 * Public API for the Platform Core Fastify package.
 * Re-exports bootstrap factory, config, and contract utilities.
 */

export { setup, start, shutdown } from './bootstrap.mjs';
export { default as defaultConfig } from './config.mjs';
export {
  createLoaderReport,
  sortByNumericPrefix,
  validateBootstrapConfig,
  createDefaultConfig,
} from '../../contracts/bootstrap-contract.mjs';
