/**
 * Logger module for computed-url-builder package.
 *
 * Provides a factory function for creating logger instances with
 * defensive programming patterns and structured output.
 *
 * @module logger
 *
 * @example
 * import { create } from './logger.mjs';
 *
 * const logger = create('computed-url-builder', import.meta.url);
 * logger.debug('Operation started');
 */

/**
 * @typedef {Object} Logger
 * @property {function(string, ...any): void} debug - Log a debug message
 * @property {function(string, ...any): void} info - Log an info message
 * @property {function(string, ...any): void} warn - Log a warning message
 * @property {function(string, ...any): void} error - Log an error message
 */

/**
 * Log levels enumeration
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 10,
  INFO: 20,
  WARN: 30,
  ERROR: 40,
  SILENT: 100,
};

/**
 * Format a timestamp for log output.
 * @returns {string} Formatted timestamp
 */
function formatTimestamp() {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Extract filename from a path or URL.
 * @param {string} filenameOrUrl - Filename or file URL
 * @returns {string} Just the filename
 */
function extractFilename(filenameOrUrl) {
  if (!filenameOrUrl) return 'unknown';

  // Handle file:// URLs (import.meta.url)
  let path = filenameOrUrl;
  if (path.startsWith('file://')) {
    path = path.substring(7);
  }

  // Extract just the filename
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] || 'unknown';
}

/**
 * Format a log message with arguments.
 * @param {string} msg - Message template
 * @param {any[]} args - Arguments to interpolate
 * @returns {string} Formatted message
 */
function formatMessage(msg, args) {
  if (args.length === 0) return msg;

  // Simple printf-style formatting for %s, %d, %j
  let index = 0;
  const formatted = msg.replace(/%[sdj]/g, (match) => {
    if (index >= args.length) return match;
    const arg = args[index++];
    switch (match) {
      case '%s':
        return String(arg);
      case '%d':
        return Number(arg);
      case '%j':
        try {
          return JSON.stringify(arg);
        } catch {
          return '[Circular]';
        }
      default:
        return match;
    }
  });

  // Append remaining args
  if (index < args.length) {
    return formatted + ' ' + args.slice(index).map(String).join(' ');
  }

  return formatted;
}

/**
 * Parse log level from environment variable.
 * @param {string|undefined} envValue - Environment variable value
 * @returns {number} Log level
 */
function parseLogLevel(envValue) {
  if (!envValue) return LogLevel.DEBUG;

  const levelMap = {
    debug: LogLevel.DEBUG,
    info: LogLevel.INFO,
    warn: LogLevel.WARN,
    warning: LogLevel.WARN,
    error: LogLevel.ERROR,
    silent: LogLevel.SILENT,
  };

  return levelMap[envValue.toLowerCase()] ?? LogLevel.DEBUG;
}

/**
 * Parse boolean from environment variable.
 * @param {string|undefined} envValue - Environment variable value
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean} Parsed boolean
 */
function parseBoolean(envValue, defaultValue = true) {
  if (envValue === undefined || envValue === null) return defaultValue;
  return ['true', '1', 'yes', 'on'].includes(envValue.toLowerCase());
}

/**
 * Package logger implementation for defensive programming.
 */
class PackageLogger {
  /**
   * Create a new package logger.
   * @param {string} packageName - Name of the package
   * @param {string} filename - Source filename
   * @param {number} level - Log level
   * @param {boolean} enabled - Whether logging is enabled
   */
  constructor(packageName, filename, level = LogLevel.DEBUG, enabled = true) {
    this.packageName = packageName;
    this.filename = extractFilename(filename);
    this.level = level;
    this.enabled = enabled;
    this._prefix = `[${packageName}] [${this.filename}]`;
  }

  /**
   * Check if logging should occur for the given level.
   * @param {number} level - Log level to check
   * @returns {boolean} Whether to log
   */
  _shouldLog(level) {
    return this.enabled && level >= this.level;
  }

  /**
   * Log a debug message.
   * @param {string} msg - Message to log
   * @param {...any} args - Arguments to interpolate
   */
  debug(msg, ...args) {
    if (this._shouldLog(LogLevel.DEBUG)) {
      const timestamp = formatTimestamp();
      const formatted = formatMessage(msg, args);
      console.debug(`[${timestamp}] ${this._prefix} DEBUG:`, formatted);
    }
  }

  /**
   * Log an info message.
   * @param {string} msg - Message to log
   * @param {...any} args - Arguments to interpolate
   */
  info(msg, ...args) {
    if (this._shouldLog(LogLevel.INFO)) {
      const timestamp = formatTimestamp();
      const formatted = formatMessage(msg, args);
      console.info(`[${timestamp}] ${this._prefix} INFO:`, formatted);
    }
  }

  /**
   * Log a warning message.
   * @param {string} msg - Message to log
   * @param {...any} args - Arguments to interpolate
   */
  warn(msg, ...args) {
    if (this._shouldLog(LogLevel.WARN)) {
      const timestamp = formatTimestamp();
      const formatted = formatMessage(msg, args);
      console.warn(`[${timestamp}] ${this._prefix} WARN:`, formatted);
    }
  }

  /**
   * Log an error message.
   * @param {string} msg - Message to log
   * @param {...any} args - Arguments to interpolate
   */
  error(msg, ...args) {
    if (this._shouldLog(LogLevel.ERROR)) {
      const timestamp = formatTimestamp();
      const formatted = formatMessage(msg, args);
      console.error(`[${timestamp}] ${this._prefix} ERROR:`, formatted);
    }
  }
}

/**
 * Null logger that discards all messages.
 * Useful for disabling logging in tests or production.
 */
class NullLogger {
  debug() {}
  info() {}
  warn() {}
  error() {}
}

/**
 * Create a logger instance for defensive programming.
 *
 * @param {string} packageName - Name of the package (e.g., 'computed-url-builder')
 * @param {string} filename - Source filename (typically import.meta.url)
 * @param {Object} [options] - Logger options
 * @param {number} [options.level] - Log level (default: from LOG_LEVEL env or DEBUG)
 * @param {boolean} [options.enabled] - Whether logging is enabled (default: from LOG_ENABLED env or true)
 * @returns {Logger} Logger instance
 *
 * @example
 * const logger = create('computed-url-builder', import.meta.url);
 * logger.debug('Operation started');
 * // [2026-01-19 12:00:00] [computed-url-builder] [index.mjs] DEBUG: Operation started
 */
export function create(packageName, filename, options = {}) {
  // Get level from options, environment, or default
  const level =
    options.level ??
    parseLogLevel(typeof process !== 'undefined' ? process.env?.LOG_LEVEL : undefined);

  // Get enabled from options, environment, or default
  const enabled =
    options.enabled ??
    parseBoolean(typeof process !== 'undefined' ? process.env?.LOG_ENABLED : undefined, true);

  return new PackageLogger(packageName, filename, level, enabled);
}

/**
 * Create a null logger that discards all messages.
 * Useful for disabling logging in tests or when not needed.
 *
 * @returns {Logger} Null logger instance
 */
export function createNull() {
  return new NullLogger();
}

export { LogLevel, PackageLogger, NullLogger };

export default { create, createNull, LogLevel };
