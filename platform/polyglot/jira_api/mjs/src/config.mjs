/**
 * @module config
 * @description Configuration management for the Jira API client.
 * Priority: env vars > .env file > ~/.jira-api/config.json
 */

import { readFileSync, writeFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { createLogger } from './logger.mjs';
import { resolveJiraEnv } from '@internal/env-resolver';

const log = createLogger('jira-api', import.meta.url);

const CONFIG_DIR = join(homedir(), '.jira-api');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

/**
 * @typedef {Object} JiraConfig
 * @property {string} baseUrl
 * @property {string} email
 * @property {string} apiToken
 */

/**
 * @typedef {Object} ServerConfig
 * @property {string} host
 * @property {number} port
 * @property {boolean} reload
 * @property {string|undefined} apiKey
 */

/**
 * Load config from ~/.jira-api/config.json.
 * @returns {JiraConfig|null}
 */
export function loadConfigFromFile() {
  try {
    if (!existsSync(CONFIG_FILE)) return null;
    const raw = readFileSync(CONFIG_FILE, 'utf-8');
    const data = JSON.parse(raw);
    log.debug('config loaded from file', { path: CONFIG_FILE });
    return {
      baseUrl: data.base_url || data.baseUrl,
      email: data.email,
      apiToken: data.api_token || data.apiToken,
    };
  } catch (err) {
    log.warn('failed to load config file', { error: err.message });
    return null;
  }
}

/**
 * Load config from environment variables.
 * @returns {JiraConfig|null}
 */
export function loadConfigFromEnv() {
  const _jiraEnv = resolveJiraEnv();
  const baseUrl = _jiraEnv.baseUrl;
  const email = _jiraEnv.email;
  const apiToken = _jiraEnv.apiToken;

  if (baseUrl && email && apiToken) {
    log.debug('config loaded from env');
    return { baseUrl, email, apiToken };
  }
  return null;
}

/**
 * Get configuration with priority: env > file.
 * @returns {JiraConfig|null}
 */
export function getConfig() {
  return loadConfigFromEnv() || loadConfigFromFile();
}

/**
 * Save config to ~/.jira-api/config.json with 0600 permissions.
 * @param {JiraConfig} config
 */
export function saveConfig(config) {
  mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  const data = {
    base_url: config.baseUrl,
    email: config.email,
    api_token: config.apiToken,
  };
  writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
  chmodSync(CONFIG_FILE, 0o600);
  log.info('config saved', { path: CONFIG_FILE });
}

/**
 * Get server configuration from env.
 * @returns {ServerConfig}
 */
export function getServerConfig() {
  return {
    host: process.env.SERVER_HOST || '0.0.0.0',
    port: parseInt(process.env.SERVER_PORT || '8000', 10),
    reload: process.env.SERVER_RELOAD === 'true',
    apiKey: process.env.SERVER_API_KEY || undefined,
  };
}
