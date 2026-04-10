/**
 * Logger Module — Figma API SDK
 *
 * Structured logging factory with sensitive data redaction.
 * Each package creates a scoped logger via `create(packageName, filename)`.
 *
 * Usage:
 *   import { create } from './logger.mjs';
 *   const log = create('figma-api', import.meta.url);
 *   log.info('fetching projects', { teamId: '123' });
 */

import { fileURLToPath } from 'node:url';
import { basename } from 'node:path';

const LEVELS = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 100 };

const REDACT_KEYS = new Set([
  'token', 'secret', 'password', 'auth', 'credential',
  'authorization', 'apikey', 'api_key', 'accesstoken', 'access_token',
]);

function getLogLevel() {
  const name = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
  return LEVELS[name] ?? LEVELS.INFO;
}

function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').split('.')[0];
}

function redactValue(key, value) {
  if (typeof key === 'string' && REDACT_KEYS.has(key.toLowerCase())) {
    if (typeof value === 'string' && value.length > 8) {
      return value.slice(0, 8) + '***';
    }
    return '***';
  }
  return value;
}

function redactContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return ctx;
  const result = {};
  for (const [k, v] of Object.entries(ctx)) {
    result[k] = redactValue(k, v);
  }
  return result;
}

function formatContext(ctx) {
  if (!ctx || (typeof ctx === 'object' && Object.keys(ctx).length === 0)) return '';
  const redacted = redactContext(ctx);
  return ' ' + Object.entries(redacted)
    .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
    .join(' ');
}

class SDKLogger {
  constructor(packageName, filename, customLogger = null) {
    this.packageName = packageName;
    if (filename) {
      try {
        const filePath = filename.startsWith('file://') ? fileURLToPath(filename) : filename;
        this.filename = basename(filePath).replace(/\.\w+$/, '');
      } catch {
        this.filename = 'unknown';
      }
    } else {
      this.filename = 'unknown';
    }
    this.prefix = `[${packageName}:${this.filename}]`;
    this.customLogger = customLogger;
  }

  _format(msg, ctx) {
    return `${formatTimestamp()} ${this.prefix} ${msg}${formatContext(ctx)}`;
  }

  _log(level, levelName, msg, ctx) {
    if (level < getLogLevel()) return;
    const formatted = this._format(msg, ctx);
    if (this.customLogger && typeof this.customLogger[levelName.toLowerCase()] === 'function') {
      this.customLogger[levelName.toLowerCase()](formatted);
      return;
    }
    switch (levelName) {
      case 'TRACE': console.debug(`TRACE ${formatted}`); break;
      case 'DEBUG': console.debug(`DEBUG ${formatted}`); break;
      case 'INFO': console.info(`INFO  ${formatted}`); break;
      case 'WARN': console.warn(`WARN  ${formatted}`); break;
      case 'ERROR': console.error(`ERROR ${formatted}`); break;
      default: console.log(`${levelName} ${formatted}`);
    }
  }

  trace(msg, ctx) { this._log(LEVELS.TRACE, 'TRACE', msg, ctx); }
  debug(msg, ctx) { this._log(LEVELS.DEBUG, 'DEBUG', msg, ctx); }
  info(msg, ctx) { this._log(LEVELS.INFO, 'INFO', msg, ctx); }
  warn(msg, ctx) { this._log(LEVELS.WARN, 'WARN', msg, ctx); }
  error(msg, ctx) { this._log(LEVELS.ERROR, 'ERROR', msg, ctx); }
}

export function create(packageName, filename, customLogger = null) {
  return new SDKLogger(packageName, filename, customLogger);
}

export { SDKLogger, LEVELS };
export default { create, SDKLogger, LEVELS };
