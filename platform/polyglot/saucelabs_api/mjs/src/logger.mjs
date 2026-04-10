/**
 * Logger Module — Sauce Labs API Client
 *
 * Structured logging factory with sensitive data redaction.
 * Each module creates a scoped logger via `create(packageName, filename)`.
 *
 * Features:
 *   - Respects LOG_LEVEL env var (debug/info/warn/error/silent), default: info
 *   - Auto-redacts keys containing: token, secret, password, key, auth, credential, access_key, api_key
 *   - Output format: [packageName:filename] LEVEL message + optional JSON context
 *   - Supports custom logger override via constructor arg
 *
 * Usage:
 *   import { create } from './logger.mjs';
 *   const log = create('saucelabs-api', import.meta.url);
 *   log.info('fetching jobs', { username: 'demo' });
 */

import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';

/**
 * Regex pattern matching sensitive key names that should be redacted in log output.
 * @type {RegExp}
 */
const _REDACT_KEYS = /token|secret|password|key|auth|credential|access_key|api_key/i;

/**
 * Numeric log level mapping.
 * @type {Record<string, number>}
 */
const _LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

/**
 * Resolve the current log level from the LOG_LEVEL environment variable.
 * @returns {number}
 */
function _getLogLevel() {
  const name = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return _LEVELS[name] ?? _LEVELS.info;
}

/**
 * Generate an ISO-8601 timestamp without fractional seconds.
 * @returns {string}
 */
function _formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

/**
 * Redact a single value if its key matches the redaction pattern.
 * @param {string} key
 * @param {*} value
 * @returns {*}
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
 * @param {*} ctx
 * @returns {*}
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
 * Format a context object into a JSON string for logging.
 * @param {*} ctx
 * @returns {string}
 */
function _formatContext(ctx) {
  if (!ctx || (typeof ctx === 'object' && Object.keys(ctx).length === 0)) return '';
  const redacted = _redactContext(ctx);
  return ' ' + JSON.stringify(redacted);
}

/**
 * Resolve a filename from a file:// URL or plain path to a short basename.
 * @param {string} filename
 * @returns {string}
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
 */
class SDKLogger {
  /**
   * @param {string} packageName - Package name (e.g. "saucelabs-api")
   * @param {string} filename - Source filename or import.meta.url
   * @param {object|null} [customLogger=null] - Optional external logger with debug/info/warn/error methods
   */
  constructor(packageName, filename, customLogger = null) {
    this.packageName = packageName;
    this.filename = _resolveFilename(filename);
    this.prefix = `[${packageName}:${this.filename}]`;
    this.customLogger = customLogger;
  }

  _format(msg, ctx) {
    return `${_formatTimestamp()} ${this.prefix} ${msg}${_formatContext(ctx)}`;
  }

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

  debug(msg, ctx) { this._log(_LEVELS.debug, 'DEBUG', msg, ctx); }
  info(msg, ctx) { this._log(_LEVELS.info, 'INFO', msg, ctx); }
  warn(msg, ctx) { this._log(_LEVELS.warn, 'WARN', msg, ctx); }
  error(msg, ctx) { this._log(_LEVELS.error, 'ERROR', msg, ctx); }
}

/**
 * Create a scoped logger instance.
 *
 * @param {string} packageName - SDK or package name
 * @param {string} filename - Source file path or import.meta.url
 * @param {object|null} [customLogger=null] - Optional logger override
 * @returns {SDKLogger}
 */
export function create(packageName, filename, customLogger = null) {
  return new SDKLogger(packageName, filename, customLogger);
}

export { SDKLogger, _LEVELS as LEVELS, _REDACT_KEYS as REDACT_KEYS };
export default { create, SDKLogger, LEVELS: _LEVELS };
