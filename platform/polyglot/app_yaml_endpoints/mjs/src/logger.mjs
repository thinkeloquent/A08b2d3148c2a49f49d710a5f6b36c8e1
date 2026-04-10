/**
 * Logger Module - Defensive programming logging with package/file context.
 *
 * Usage:
 *     const logger = LoggerFactory.create('app-yaml-endpoints', import.meta.url);
 *     logger.info('Message', { key: 'value' });
 *
 * @module app-yaml-endpoints/logger
 */

import { fileURLToPath } from 'url';
import path from 'path';

const LEVELS = { trace: 5, debug: 10, info: 20, warn: 30, error: 40 };

/**
 * Logger with package and file context.
 */
export class Logger {
    /**
     * @param {string} pkg - Package name
     * @param {string} filename - File path or import.meta.url
     * @param {Function|null} handler - Custom log handler
     * @param {string} level - Minimum log level
     * @param {boolean} jsonOutput - Output JSON format
     */
    constructor(pkg, filename, handler = null, level = 'info', jsonOutput = false) {
        this._pkg = pkg;
        this._file = this._extractFilename(filename);
        this._handler = handler || this._defaultHandler.bind(this);
        this._level = LEVELS[level.toLowerCase()] ?? 20;
        this._json = jsonOutput;
    }

    _extractFilename(filepath) {
        if (filepath.startsWith('file://')) {
            filepath = fileURLToPath(filepath);
        }
        return path.basename(filepath);
    }

    _defaultHandler(level, msg, data, ctx) {
        const ts = new Date().toISOString();
        const lvl = level.toUpperCase().padEnd(5);

        if (this._json) {
            const out = { ts, level, pkg: this._pkg, file: this._file, msg };
            if (data) out.data = data;
            const stream = level === 'warn' || level === 'error' ? console.error : console.log;
            stream(JSON.stringify(out));
        } else {
            const prefix = `[${ts}] [${lvl}] [${this._pkg}:${this._file}]`;
            const line = data ? `${prefix} ${msg} ${JSON.stringify(data)}` : `${prefix} ${msg}`;
            const stream = level === 'warn' || level === 'error' ? console.error : console.log;
            stream(line);
        }
    }

    _log(level, msg, data = null) {
        if ((LEVELS[level] ?? 0) >= this._level) {
            this._handler(level, msg, data, { pkg: this._pkg, file: this._file });
        }
    }

    trace(msg, data = null) { this._log('trace', msg, data); }
    debug(msg, data = null) { this._log('debug', msg, data); }
    info(msg, data = null) { this._log('info', msg, data); }
    warn(msg, data = null) { this._log('warn', msg, data); }
    error(msg, data = null) { this._log('error', msg, data); }
}

/**
 * Factory for creating loggers with consistent defaults.
 */
export class LoggerFactory {
    static _level = process.env.LOG_LEVEL || 'info';
    static _json = process.env.LOG_JSON?.toLowerCase() === 'true';

    /**
     * Create a logger instance.
     * @param {string} pkg - Package name
     * @param {string} filename - File path or import.meta.url
     * @param {Function|null} handler - Optional custom handler
     * @param {string|null} level - Override log level
     * @param {boolean|null} jsonOutput - Override JSON mode
     * @returns {Logger}
     */
    static create(pkg, filename, handler = null, level = null, jsonOutput = null) {
        return new Logger(
            pkg,
            filename,
            handler,
            level ?? this._level,
            jsonOutput ?? this._json
        );
    }
}

export default LoggerFactory;
