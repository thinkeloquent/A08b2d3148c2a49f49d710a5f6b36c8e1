/**
 * Centralized Sequelize Connection
 *
 * Provides a singleton Sequelize instance for use across the application.
 * Uses @internal/db_connection_postgres for configuration and client creation.
 *
 * Usage:
 *   import { getSequelize, getConfig } from '@internal/db_connection_sequelize';
 *
 *   const sequelize = getSequelize();
 *   await sequelize.authenticate();
 */

import {
  PostgresConfig,
  getPostgresClient,
} from '@internal/db_connection_postgres';

// Singleton instances
let _config = null;
let _sequelize = null;

/**
 * Get or create the PostgresConfig singleton.
 * @param {object} [options] - Optional config overrides (only used on first call)
 * @returns {PostgresConfig}
 */
export function getConfig(options = {}) {
  if (!_config) {
    _config = new PostgresConfig(options);
  }
  return _config;
}

/**
 * Get or create the Sequelize singleton instance.
 * @param {object} [options] - Optional config overrides (only used on first call)
 * @returns {import('sequelize').Sequelize}
 */
export function getSequelize(options = {}) {
  if (!_sequelize) {
    const config = getConfig(options);
    _sequelize = getPostgresClient(config);
  }
  return _sequelize;
}

/**
 * Close the Sequelize connection and reset the singleton.
 * Useful for testing or graceful shutdown.
 */
export async function closeConnection() {
  if (_sequelize) {
    await _sequelize.close();
    _sequelize = null;
  }
}

/**
 * Reset the singleton instances without closing.
 * Primarily for testing purposes.
 */
export function resetSingleton() {
  _config = null;
  _sequelize = null;
}

/**
 * Check if a connection has been established.
 * @returns {boolean}
 */
export function hasConnection() {
  return _sequelize !== null;
}

// Re-export PostgresConfig for convenience
export { PostgresConfig };
