/**
 * Logger Module - Defensive Programming Style Logging
 *
 * Provides a standardized logging factory with verbose output for tracing
 * execution flow across the SDK.
 *
 * Usage:
 *   import { create } from './logger.mjs';
 *   const logger = create('gemini-openai-sdk', import.meta.url);
 *
 *   logger.debug('Processing message', { messageId: 123 });
 *   logger.info('Request completed', { status: 200 });
 *   logger.warn('Rate limit approaching', { remaining: 10 });
 *   logger.error('API request failed', { error: err.message });
 */

import { fileURLToPath } from 'url';
import { basename } from 'path';

/**
 * Log levels enum
 */
const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  WARNING: 2,
  ERROR: 3,
};

/**
 * Get current log level from environment
 */
function getLogLevel() {
  const levelName = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
  return LEVELS[levelName] ?? LEVELS.INFO;
}

/**
 * Format timestamp for log output
 */
function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Format arguments for log output
 */
function formatArgs(args) {
  if (!args || (Array.isArray(args) && args.length === 0)) {
    return '';
  }

  if (typeof args === 'object' && !Array.isArray(args)) {
    return ' ' + Object.entries(args)
      .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
      .join(' ');
  }

  if (Array.isArray(args)) {
    return ' ' + args.map(a => JSON.stringify(a)).join(' ');
  }

  return ' ' + String(args);
}

/**
 * SDK Logger class with defensive programming patterns.
 */
class SDKLogger {
  /**
   * @param {string} packageName - Package name for prefix
   * @param {string} filename - Source file (import.meta.url)
   * @param {object} [customLogger] - Optional custom logger instance
   */
  constructor(packageName, filename, customLogger = null) {
    this._packageName = packageName;
    this.packageName = packageName;

    // Extract filename from URL or path
    if (filename) {
      try {
        const filePath = filename.startsWith('file://')
          ? fileURLToPath(filename)
          : filename;
        this._filename = filename;  // Keep original
        this.filename = basename(filePath, '.mjs');
      } catch {
        this._filename = filename || '';
        this.filename = 'unknown';
      }
    } else {
      this._filename = '';
      this.filename = 'unknown';
    }

    this.prefix = `[${packageName}:${this.filename}]`;
    this.customLogger = customLogger;
  }

  /**
   * Format message with prefix
   */
  _formatMessage(msg, args) {
    return `${formatTimestamp()} ${this.prefix} ${msg}${formatArgs(args)}`;
  }

  /**
   * Log at specified level
   */
  _log(level, levelName, msg, args) {
    if (level < getLogLevel()) {
      return;
    }

    const formatted = this._formatMessage(msg, args);

    if (this.customLogger) {
      const method = levelName.toLowerCase();
      if (typeof this.customLogger[method] === 'function') {
        this.customLogger[method](formatted);
        return;
      }
    }

    switch (levelName) {
      case 'DEBUG':
        console.debug(`DEBUG ${formatted}`);
        break;
      case 'INFO':
        console.info(`INFO ${formatted}`);
        break;
      case 'WARN':
        console.warn(`WARN ${formatted}`);
        break;
      case 'ERROR':
        console.error(`ERROR ${formatted}`);
        break;
      default:
        console.log(`${levelName} ${formatted}`);
    }
  }

  /**
   * Log debug message
   * @param {string} msg - Message to log
   * @param {object|array} [args] - Additional arguments
   */
  debug(msg, args) {
    this._log(LEVELS.DEBUG, 'DEBUG', msg, args);
  }

  /**
   * Log info message
   * @param {string} msg - Message to log
   * @param {object|array} [args] - Additional arguments
   */
  info(msg, args) {
    this._log(LEVELS.INFO, 'INFO', msg, args);
  }

  /**
   * Log warning message
   * @param {string} msg - Message to log
   * @param {object|array} [args] - Additional arguments
   */
  warn(msg, args) {
    this._log(LEVELS.WARN, 'WARN', msg, args);
  }

  /**
   * Log warning message (alias)
   */
  warning(msg, args) {
    this.warn(msg, args);
  }

  /**
   * Log error message
   * @param {string} msg - Message to log
   * @param {object|array} [args] - Additional arguments
   */
  error(msg, args) {
    this._log(LEVELS.ERROR, 'ERROR', msg, args);
  }

  /**
   * Set log level dynamically
   * @param {string} level - Level name (DEBUG, INFO, WARN, ERROR)
   */
  setLevel(level) {
    process.env.LOG_LEVEL = level.toUpperCase();
  }
}

/**
 * Create a logger instance for a module.
 *
 * @param {string} packageName - Name of the package
 * @param {string} filename - Source file (use import.meta.url)
 * @param {object} [loggerInstance] - Optional custom logger
 * @returns {SDKLogger} Logger instance
 *
 * @example
 * import { create } from './logger.mjs';
 * const logger = create('gemini-openai-sdk', import.meta.url);
 *
 * logger.debug('enter function', { param1: 'value' });
 * logger.info('operation complete', { resultCount: 5 });
 * logger.error('failed', { error: err.message });
 */
export function create(packageName, filename, loggerInstance = null) {
  return new SDKLogger(packageName, filename, loggerInstance);
}

export { SDKLogger, LEVELS };
export default { create, SDKLogger, LEVELS };
