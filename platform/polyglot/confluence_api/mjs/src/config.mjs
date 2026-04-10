/**
 * @module config
 * @description Configuration management for the Confluence Data Center REST API client.
 *
 * Resolves configuration from multiple sources with the following priority:
 * 1. Explicit `serverConfig` object (MCP server config with getNested)
 * 2. Environment variables (CONFLUENCE_BASE_URL, CONFLUENCE_USERNAME, CONFLUENCE_API_TOKEN)
 *
 * All resolution functions are graceful — they return null values for missing
 * fields rather than throwing, allowing consumers to validate at their own layer.
 *
 * @example
 * // From environment variables
 * const config = loadConfigFromEnv();
 *
 * // From MCP server config
 * const config = getServerConfig(server);
 *
 * // Auto-resolve with priority chain
 * const config = getConfig(serverConfig);
 */

import { createLogger } from './logger.mjs';
import { resolveConfluenceEnv } from '@internal/env-resolver';

const log = createLogger('confluence-api', import.meta.url);

/**
 * @typedef {Object} ConfluenceConfig
 * @property {string|null} baseUrl - Confluence Data Center base URL (e.g. https://confluence.example.com).
 * @property {string|null} username - Confluence username for Basic Auth.
 * @property {string|null} apiToken - Confluence API token or password for Basic Auth.
 */

/**
 * Resolve Confluence configuration from a server config object, falling back to
 * environment variables. This is the primary entry point for configuration resolution.
 *
 * @param {Object|null} [serverConfig=null] - Optional server config object with getNested method.
 * @param {Function} [serverConfig.getNested] - Method to retrieve nested configuration values.
 * @returns {ConfluenceConfig} Resolved configuration (fields may be null if not found).
 *
 * @example
 * // With MCP server config
 * const cfg = getConfig(server.config);
 * // { baseUrl: 'https://confluence.example.com', username: 'admin', apiToken: '...' }
 *
 * // Without server config — falls back to env vars
 * const cfg = getConfig();
 */
export function getConfig(serverConfig = null) {
  if (serverConfig && typeof serverConfig.getNested === 'function') {
    try {
      const baseUrl = serverConfig.getNested(['providers', 'confluence', 'base_url']) ?? null;
      const username = serverConfig.getNested(['providers', 'confluence', 'username']) ?? null;
      const apiToken = serverConfig.getNested(['providers', 'confluence', 'api_token']) ?? null;

      if (baseUrl && username && apiToken) {
        log.debug('config resolved from server config');
        return { baseUrl, username, apiToken };
      }
    } catch (err) {
      log.warn('failed to read server config, falling back to env', {
        error: /** @type {Error} */ (err).message,
      });
    }
  }

  return loadConfigFromEnv();
}

/**
 * Load Confluence configuration from environment variables.
 *
 * Reads:
 * - `CONFLUENCE_BASE_URL` — Confluence Data Center base URL
 * - `CONFLUENCE_USERNAME` — Username for Basic Auth
 * - `CONFLUENCE_API_TOKEN` — API token / password for Basic Auth
 *
 * Returns an object with null values for any missing variables rather than
 * throwing, so consumers can decide how to handle partial configuration.
 *
 * @returns {ConfluenceConfig} Configuration object (fields may be null).
 *
 * @example
 * process.env.CONFLUENCE_BASE_URL = 'https://confluence.example.com';
 * process.env.CONFLUENCE_USERNAME = 'admin';
 * process.env.CONFLUENCE_API_TOKEN = 'secret-token';
 * const cfg = loadConfigFromEnv();
 * // { baseUrl: 'https://confluence.example.com', username: 'admin', apiToken: 'secret-token' }
 */
export function loadConfigFromEnv() {
  const _confluenceEnv = resolveConfluenceEnv();
  const baseUrl = _confluenceEnv.baseUrl || null;
  const username = _confluenceEnv.username || null;
  const apiToken = _confluenceEnv.apiToken || null;

  if (baseUrl && username && apiToken) {
    log.debug('config loaded from environment variables');
  } else {
    log.debug('partial or missing env config', {
      hasBaseUrl: !!baseUrl,
      hasUsername: !!username,
      hasApiToken: !!apiToken,
    });
  }

  return { baseUrl, username, apiToken };
}

/**
 * Extract Confluence configuration from an MCP server instance.
 *
 * Reads from the server's nested config under `['providers', 'confluence', ...]`.
 * Returns null values gracefully if the server config is unavailable or incomplete.
 *
 * @param {Object} server - MCP server instance.
 * @param {Object} [server.config] - Server configuration object.
 * @param {Function} [server.config.getNested] - Method to retrieve nested config values.
 * @returns {ConfluenceConfig} Configuration object (fields may be null).
 *
 * @example
 * const cfg = getServerConfig(server);
 * // { baseUrl: 'https://confluence.example.com', username: 'admin', apiToken: '...' }
 */
export function getServerConfig(server) {
  try {
    if (!server?.config?.getNested) {
      log.debug('server config not available — getNested not found');
      return { baseUrl: null, username: null, apiToken: null };
    }

    const getNested = server.config.getNested.bind(server.config);
    const baseUrl = getNested(['providers', 'confluence', 'base_url']) ?? null;
    const username = getNested(['providers', 'confluence', 'username']) ?? null;
    const apiToken = getNested(['providers', 'confluence', 'api_token']) ?? null;

    if (baseUrl && username && apiToken) {
      log.debug('config resolved from MCP server config');
    }

    return { baseUrl, username, apiToken };
  } catch (err) {
    log.warn('failed to read server config', {
      error: /** @type {Error} */ (err).message,
    });
    return { baseUrl: null, username: null, apiToken: null };
  }
}
