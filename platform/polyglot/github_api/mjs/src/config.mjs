/**
 * Configuration loader for GitHub API SDK.
 * Reads from environment variables with sensible defaults.
 * @module config
 */

import { resolveGithubEnv } from '@internal/env-resolver';

/** @typedef {Object} AppConfig
 * @property {string|undefined} githubToken - GitHub API token
 * @property {string} githubApiBaseUrl - GitHub API base URL
 * @property {string} logLevel - Logging level
 * @property {number} port - Server port
 * @property {string} host - Server host
 */

/**
 * Load application configuration from environment variables.
 * @returns {AppConfig} The resolved configuration object.
 */
export function loadConfig() {
  const _githubEnv = resolveGithubEnv();

  return {
    githubToken: _githubEnv.token,
    githubApiBaseUrl: _githubEnv.baseApiUrl,
    logLevel: process.env.LOG_LEVEL || 'info',
    port: parseInt(process.env.PORT || '3100', 10),
    host: process.env.HOST || '0.0.0.0',
  };
}
