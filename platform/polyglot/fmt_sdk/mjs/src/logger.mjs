/**
 * @module logger
 * @description Structured, scoped logger factory for the fmt-sdk package.
 *
 * Usage:
 *   import { createLogger } from './logger.mjs';
 *   const log = createLogger('fmt-sdk', import.meta.url);
 *   log.info('formatting source', { language: 'go' });
 *
 * - Respects LOG_LEVEL env var: trace | debug | info | warn | error | silent
 * - Auto-redacts sensitive keys (token, secret, password, auth, credential, api_key)
 */

const _REDACT_PATTERN = /token|secret|password|auth|credential|api_key/i;
const _REDACT_VALUE = '***REDACTED***';

const _LEVELS = Object.freeze({
  trace: 0,
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
});

/**
 * Deep-clone and redact sensitive values from a context object.
 * @param {Record<string, unknown>} ctx
 * @returns {Record<string, unknown>}
 */
function redactContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return ctx;
  const out = {};
  for (const [key, value] of Object.entries(ctx)) {
    if (_REDACT_PATTERN.test(key)) {
      out[key] = _REDACT_VALUE;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redactContext(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Extract short filename from a path or import.meta.url.
 * @param {string} filename
 * @returns {string}
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
 * @param {string} packageName - Package name (e.g. 'fmt-sdk')
 * @param {string} filename - Source file (import.meta.url or __filename)
 * @returns {{ trace: Function, debug: Function, info: Function, warn: Function, error: Function }}
 */
export function createLogger(packageName, filename) {
  const envLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();
  const threshold = _LEVELS[envLevel] ?? _LEVELS.info;
  const file = shortFilename(filename);

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

/** No-op logger for when logging is disabled. */
export const nullLogger = Object.freeze({
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
});
