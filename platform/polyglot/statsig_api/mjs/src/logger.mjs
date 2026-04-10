/**
 * Logger Module — Statsig Console API Client
 *
 * Structured logging factory with sensitive data redaction.
 * Each module creates a scoped logger via `create(packageName, filename)`.
 *
 * Features:
 *   - Respects LOG_LEVEL env var (debug/info/warn/error/silent), default: info
 *   - Auto-redacts keys containing: token, secret, password, key, auth, credential
 *   - Output format: [packageName:filename] LEVEL message + optional JSON context
 *   - Supports custom logger override
 *
 * Usage:
 *   import { create } from './logger.mjs';
 *   const log = create('statsig-api', import.meta.url);
 *   log.info('fetching experiments', { projectId: '123' });
 */

import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';

/**
 * Regex pattern matching sensitive key names that should be redacted in log output.
 * @type {RegExp}
 */
const _REDACT_KEYS = /token|secret|password|key|auth|credential/i;

/**
 * Numeric log level mapping.
 * Lower numbers are more verbose; `silent` suppresses all output.
 * @type {Record<string, number>}
 */
const _LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

/**
 * Resolve the current log level from the LOG_LEVEL environment variable.
 * Falls back to `info` if the variable is unset or contains an unrecognized value.
 * @returns {number} Numeric log level
 */
function _getLogLevel() {
  const name = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return _LEVELS[name] ?? _LEVELS.info;
}

/**
 * Generate an ISO-8601 timestamp without fractional seconds.
 * @returns {string} Formatted timestamp (e.g. "2025-01-15 09:30:42")
 */
function _formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Redact a single value if its key matches the redaction pattern.
 * String values longer than 8 characters are partially preserved (first 8 chars + "***").
 * Shorter strings or non-string values are replaced entirely with "***".
 *
 * @param {string} key - The key name to check
 * @param {*} value - The value to potentially redact
 * @returns {*} Original value or redacted placeholder
 */
function _redactValue(key, value) {
  if (typeof key === 'string' && _REDACT_KEYS.test(key)) {
    if (typeof value === 'string' && value.length > 8) {
      return value.slice(0, 8) + '***';
    }
    return '***';
  }
  return value;
}

/**
 * Deep-redact all sensitive keys in a context object.
 * Non-objects are returned as-is.
 *
 * @param {*} ctx - Context to redact
 * @returns {*} Redacted copy of the context
 */
function _redactContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return ctx;
  if (Array.isArray(ctx)) return ctx.map((item) => _redactContext(item));
  const result = {};
  for (const [k, v] of Object.entries(ctx)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      result[k] = _redactContext(v);
    } else {
      result[k] = _redactValue(k, v);
    }
  }
  return result;
}

/**
 * Format a context object into a space-separated key=value string.
 * Returns an empty string if the context is empty or falsy.
 *
 * @param {*} ctx - Context object to format
 * @returns {string} Formatted context string (prefixed with space) or empty
 */
function _formatContext(ctx) {
  if (!ctx || (typeof ctx === 'object' && Object.keys(ctx).length === 0)) return '';
  const redacted = _redactContext(ctx);
  return ' ' + JSON.stringify(redacted);
}

/**
 * Resolve a filename from a file:// URL or plain path to a short basename.
 *
 * @param {string} filename - The raw filename or import.meta.url
 * @returns {string} Short basename without extension
 */
function _resolveFilename(filename) {
  if (!filename) return 'unknown';
  try {
    const filePath = filename.startsWith('file://') ? fileURLToPath(filename) : filename;
    return basename(filePath).replace(/\.\w+$/, '');
  } catch {
    return 'unknown';
  }
}

/**
 * Structured logger instance for a specific package/file scope.
 * Provides leveled logging with automatic context redaction.
 */
class SDKLogger {
  /**
   * @param {string} packageName - Package or SDK name (e.g. "statsig-api")
   * @param {string} filename - Source filename or import.meta.url
   * @param {object|null} [customLogger=null] - Optional external logger with debug/info/warn/error methods
   */
  constructor(packageName, filename, customLogger = null) {
    /** @type {string} */
    this.packageName = packageName;

    /** @type {string} */
    this.filename = _resolveFilename(filename);

    /** @type {string} */
    this.prefix = `[${packageName}:${this.filename}]`;

    /** @type {object|null} */
    this.customLogger = customLogger;
  }

  /**
   * Format a log line with timestamp, prefix, message, and optional context.
   * @param {string} msg - Log message
   * @param {object} [ctx] - Optional structured context
   * @returns {string} Formatted log string
   */
  _format(msg, ctx) {
    return `${_formatTimestamp()} ${this.prefix} ${msg}${_formatContext(ctx)}`;
  }

  /**
   * Internal log dispatcher. Checks the current log level before emitting.
   * Delegates to the custom logger if provided, otherwise uses console.
   *
   * @param {number} level - Numeric level of this message
   * @param {string} levelName - Human-readable level name (DEBUG, INFO, etc.)
   * @param {string} msg - Log message
   * @param {object} [ctx] - Optional structured context
   */
  _log(level, levelName, msg, ctx) {
    if (level < _getLogLevel()) return;
    const formatted = this._format(msg, ctx);
    if (this.customLogger && typeof this.customLogger[levelName.toLowerCase()] === 'function') {
      this.customLogger[levelName.toLowerCase()](formatted);
      return;
    }
    switch (levelName) {
      case 'DEBUG': console.debug(`DEBUG ${formatted}`); break;
      case 'INFO':  console.info(`INFO  ${formatted}`); break;
      case 'WARN':  console.warn(`WARN  ${formatted}`); break;
      case 'ERROR': console.error(`ERROR ${formatted}`); break;
      default:      console.log(`${levelName} ${formatted}`);
    }
  }

  /**
   * Log a debug-level message.
   * @param {string} msg - Message text
   * @param {object} [ctx] - Optional structured context
   */
  debug(msg, ctx) { this._log(_LEVELS.debug, 'DEBUG', msg, ctx); }

  /**
   * Log an info-level message.
   * @param {string} msg - Message text
   * @param {object} [ctx] - Optional structured context
   */
  info(msg, ctx) { this._log(_LEVELS.info, 'INFO', msg, ctx); }

  /**
   * Log a warn-level message.
   * @param {string} msg - Message text
   * @param {object} [ctx] - Optional structured context
   */
  warn(msg, ctx) { this._log(_LEVELS.warn, 'WARN', msg, ctx); }

  /**
   * Log an error-level message.
   * @param {string} msg - Message text
   * @param {object} [ctx] - Optional structured context
   */
  error(msg, ctx) { this._log(_LEVELS.error, 'ERROR', msg, ctx); }
}

/**
 * Create a scoped logger instance.
 *
 * @param {string} packageName - SDK or package name (e.g. "statsig-api")
 * @param {string} filename - Source file path or import.meta.url
 * @param {object|null} [customLogger=null] - Optional logger override with debug/info/warn/error methods
 * @returns {SDKLogger} Scoped logger instance
 *
 * @example
 * import { create } from './logger.mjs';
 * const log = create('statsig-api', import.meta.url);
 * log.info('initialized', { baseUrl: 'https://statsigapi.net/console/v1' });
 */
export function create(packageName, filename, customLogger = null) {
  return new SDKLogger(packageName, filename, customLogger);
}

export { SDKLogger, _LEVELS as LEVELS, _REDACT_KEYS as REDACT_KEYS };
export default { create, SDKLogger, LEVELS: _LEVELS };
