/**
 * @module logger
 * @description Structured, scoped logger factory for the confluence-api package.
 *
 * Provides JSON-formatted log output with automatic redaction of sensitive values,
 * scoped to a package name and source file for easy filtering and debugging.
 *
 * Usage:
 *   import { createLogger } from './logger.mjs';
 *   const log = createLogger('confluence-api', import.meta.url);
 *   log.info('fetching content', { contentId: '12345' });
 *
 * - Respects LOG_LEVEL env var: trace | debug | info | warn | error | silent
 * - Auto-redacts sensitive keys (token, secret, password, auth, credential, api_key)
 * - Override via constructor: new ConfluenceFetchClient({ logger: customLogger })
 */

/** @type {RegExp} Pattern matching sensitive key names that should be redacted in log output. */
const _REDACT_PATTERN = /token|secret|password|auth|credential|api_key/i;

/** @type {string} Replacement value for redacted fields. */
const _REDACT_VALUE = '***REDACTED***';

/**
 * Numeric log level thresholds. Lower values are more verbose.
 * @type {Readonly<Record<string, number>>}
 */
const _LEVELS = Object.freeze({
  trace: 0,
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
});

/**
 * Deep-clone a context object, replacing values whose keys match the
 * redaction pattern with a placeholder string. Handles nested objects
 * recursively but leaves arrays and primitives untouched.
 *
 * @param {Record<string, unknown>} ctx - The context object to redact.
 * @returns {Record<string, unknown>} A new object with sensitive values replaced.
 */
function redactContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return ctx;
  const out = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (_REDACT_PATTERN.test(key)) {
      out[key] = _REDACT_VALUE;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redactContext(/** @type {Record<string, unknown>} */ (value));
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Extract a short, human-readable filename from a path or `import.meta.url`.
 * Handles both `file://` URLs (common in ESM) and plain filesystem paths.
 *
 * @param {string} filename - Full path or file:// URL to shorten.
 * @returns {string} The basename portion of the path, or 'unknown' if empty.
 */
function shortFilename(filename) {
  if (!filename) return 'unknown';
  if (filename.startsWith('file://')) {
    try {
      return new URL(filename).pathname.split('/').pop() || filename;
    } catch {
      return filename;
    }
  }
  return filename.split('/').pop() || filename;
}

/**
 * Create a scoped, structured logger instance.
 *
 * Each log entry is emitted as a single-line JSON string containing:
 * - `ts`  — ISO 8601 timestamp
 * - `pkg` — package name scope
 * - `file` — source file basename
 * - `level` — log level string
 * - `msg` — human-readable message
 * - `ctx` — (optional) redacted context object
 *
 * The logger respects the `LOG_LEVEL` environment variable. Messages below the
 * configured threshold are silently dropped. The default level is `info`.
 *
 * @param {string} packageName - Package name scope (e.g. 'confluence-api').
 * @param {string} filename - Source file identifier (import.meta.url or __filename).
 * @returns {{ trace: Function, debug: Function, info: Function, warn: Function, error: Function }}
 *
 * @example
 * const log = createLogger('confluence-api', import.meta.url);
 * log.info('space retrieved', { spaceKey: 'DEV' });
 * log.error('request failed', { status: 500, url: '/rest/api/content' });
 */
export function createLogger(packageName, filename) {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  const threshold = _LEVELS[envLevel] ?? _LEVELS.info;
  const file = shortFilename(filename);

  /**
   * Emit a structured log entry if the level meets the threshold.
   *
   * @param {string} level - Level name (trace, debug, info, warn, error).
   * @param {number} levelNum - Numeric level for threshold comparison.
   * @param {Function} consoleFn - The console method to invoke.
   * @param {string} message - Human-readable log message.
   * @param {Record<string, unknown>} [context] - Optional structured context.
   */
  function emit(level, levelNum, consoleFn, message, context) {
    if (levelNum < threshold) return;
    const entry = {
      ts: new Date().toISOString(),
      pkg: packageName,
      file,
      level,
      msg: message,
    };
    if (context) {
      entry.ctx = redactContext(context);
    }
    consoleFn(JSON.stringify(entry));
  }

  return {
    trace: (message, context) => emit('trace', _LEVELS.trace, console.debug, message, context),
    debug: (message, context) => emit('debug', _LEVELS.debug, console.debug, message, context),
    info: (message, context) => emit('info', _LEVELS.info, console.info, message, context),
    warn: (message, context) => emit('warn', _LEVELS.warn, console.warn, message, context),
    error: (message, context) => emit('error', _LEVELS.error, console.error, message, context),
  };
}

/**
 * No-op logger for when logging is disabled or not desired.
 * All methods silently discard their arguments.
 * @type {Readonly<{ trace: Function, debug: Function, info: Function, warn: Function, error: Function }>}
 */
export const nullLogger = Object.freeze({
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
});

export default { createLogger, nullLogger };
