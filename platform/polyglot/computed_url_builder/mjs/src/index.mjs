/**
 * Computed URL Builder - A lightweight utility for building integration endpoint URLs.
 *
 * This package provides a simple, environment-aware URL builder for constructing
 * URLs from configuration. It supports both Python and Node.js with identical interfaces.
 *
 * @module computed-url-builder
 *
 * @example
 * import createUrlBuilder from '@thinkeloquent/computed-url-builder';
 *
 * const builder = createUrlBuilder(
 *   { dev: 'https://dev.api.com', prod: 'https://api.com' },
 *   '/api/v1'
 * );
 *
 * console.log(builder.build('dev')); // https://dev.api.com/api/v1
 */

import { create as createLogger, createNull as createNullLogger } from './logger.mjs';

/**
 * @callback UrlFunction
 * @param {Object} context - Context object for computing URL
 * @returns {string} Computed URL string
 */

/**
 * @typedef {string|string[]|UrlFunction} UrlValue
 * URL value can be a string (host), array (URL parts), or function (computed URL).
 */

/**
 * @typedef {Object.<string, UrlValue>} UrlKeys
 * Environment to URL mapping. Values can be strings (host), arrays (URL parts), or functions.
 */

/**
 * @typedef {Object} BuilderOptions
 * @property {import('./logger.mjs').Logger} [logger] - Custom logger instance
 */

/**
 * @typedef {Object} UrlBuilder
 * @property {UrlKeys} env - The environment URL configuration
 * @property {string} basePath - The base path
 * @property {function(string, Object=): string} build - Build URL for environment with optional context
 * @property {function(): Object} toJSON - Serialize builder state
 */

/**
 * Create a URL builder instance.
 *
 * Factory function for creating URL builder instances with support for
 * environment-specific URLs.
 *
 * @param {UrlKeys} [urlKeys={}] - Environment to URL mapping
 * @param {string} [basePath=''] - Base path to append to string URLs
 * @param {BuilderOptions} [options={}] - Builder options
 * @returns {UrlBuilder} URL builder instance
 *
 * @example
 * // Basic usage with string URLs
 * const builder = createUrlBuilder(
 *   { dev: 'https://dev.api.com', prod: 'https://api.com' },
 *   '/v1/users'
 * );
 * console.log(builder.build('dev')); // https://dev.api.com/v1/users
 *
 * @example
 * // Array-based URLs (basePath ignored)
 * const builder = createUrlBuilder({
 *   custom: ['https://api.com', '/v2/special']
 * });
 * console.log(builder.build('custom')); // https://api.com/v2/special
 */
export default function createUrlBuilder(urlKeys = {}, basePath = '', options = {}) {
  const logger = options.logger || createLogger('computed-url-builder', import.meta.url);

  logger.debug(
    `createUrlBuilder() called with ${Object.keys(urlKeys).length} environments, basePath='${basePath}'`
  );

  return {
    /**
     * The environment URL configuration.
     * @type {UrlKeys}
     */
    env: urlKeys,

    /**
     * The base path appended to string URLs.
     * @type {string}
     */
    basePath,

    /**
     * Internal logger instance.
     * @private
     */
    _logger: logger,

    /**
     * Build a URL for the specified environment key.
     *
     * @param {string} key - Environment key (e.g., 'dev', 'prod')
     * @param {Object} [context={}] - Optional context object for computed URLs
     * @returns {string} Complete URL
     * @throws {Error} If environment key is not found
     *
     * @example
     * builder.build('dev'); // https://dev.api.com/v1
     *
     * @example
     * // With function-based URL
     * const builder = createUrlBuilder({
     *   dev: (ctx) => `https://${ctx.tenant}.api.com`
     * });
     * builder.build('dev', { tenant: 'acme' }); // https://acme.api.com
     */
    build(key, context = {}) {
      this._logger.debug(`build() called with key='${key}', context=${JSON.stringify(context)}`);

      const value = this.env[key];

      if (value === undefined || value === null) {
        const errorMsg = `Environment key "${key}" not found`;
        this._logger.error(errorMsg);
        throw new Error(errorMsg);
      }

      let result;

      // If value is a function, invoke with context
      if (typeof value === 'function') {
        result = value(context);
        this._logger.debug(`build() invoked function, result='${result}'`);
        // Apply basePath to function result
        result = result + this.basePath;
      }
      // If value is array, join without separator
      else if (Array.isArray(value)) {
        result = value.join('');
        this._logger.debug(`build() joining array, result='${result}'`);
      } else {
        // Otherwise, concatenate with basePath
        result = value + this.basePath;
        this._logger.debug(`build() concatenating with basePath, result='${result}'`);
      }

      return result;
    },

    /**
     * Serialize the builder state to a JSON-compatible object.
     *
     * Useful for debugging, logging, and SDK integrations.
     *
     * @returns {Object} Object containing env and basePath
     *
     * @example
     * builder.toJSON(); // { env: { dev: '...' }, basePath: '/v1' }
     */
    toJSON() {
      this._logger.debug('toJSON() called');
      return {
        env: { ...this.env },
        basePath: this.basePath,
      };
    },
  };
}

/**
 * Create a URL builder from a context object.
 *
 * This is an alternative factory method that accepts URL keys directly.
 * Values can be strings, arrays, or functions that compute URLs.
 *
 * @param {UrlKeys} urlKeys - Environment to URL mapping
 * @param {string} [basePath=''] - Base path to append to string URLs
 * @param {BuilderOptions} [options={}] - Builder options
 * @returns {UrlBuilder} URL builder instance
 *
 * @example
 * const builder = createUrlBuilder.fromContext({
 *   dev: (ctx) => `https://${ctx.region}.dev.api.com`,
 *   prod: 'https://api.com'
 * });
 * console.log(builder.build('dev', { region: 'us-west' })); // https://us-west.dev.api.com
 */
createUrlBuilder.fromContext = function fromContext(urlKeys, basePath = '', options = {}) {
  const logger = options.logger || createLogger('computed-url-builder', import.meta.url);
  logger.debug(`fromContext() called with ${Object.keys(urlKeys).length} environments`);

  return createUrlBuilder(urlKeys, basePath, options);
};

// Re-export logger utilities
export { createLogger, createNullLogger };
