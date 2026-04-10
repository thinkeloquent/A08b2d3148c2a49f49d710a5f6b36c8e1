/**
 * Package logger interface for common-exceptions.
 *
 * Provides defensive programming style logging with verbose output.
 * Default LOG_LEVEL=debug with env.LOG_LEVEL override.
 *
 * @example
 * import { create } from './logger';
 * const logger = create('common-exceptions', __filename);
 * logger.debug('Exception raised');
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LOG_LEVEL: LogLevel = 'debug';

/**
 * Get the current log level from environment or default.
 */
function getLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }
  return DEFAULT_LOG_LEVEL;
}

/**
 * Extract filename from path.
 */
function extractFilename(filepath: string): string {
  const parts = filepath.replace(/\\/g, '/').split('/');
  const filename = parts[parts.length - 1] || 'unknown';
  return filename.replace(/\.[tj]s$/, '');
}

/**
 * Package-scoped logger implementation.
 */
class PackageLogger implements Logger {
  private packageName: string;
  private filename: string;
  private level: LogLevel;
  private customLogger?: Logger;

  constructor(
    packageName: string,
    filename: string,
    level?: LogLevel,
    customLogger?: Logger
  ) {
    this.packageName = packageName;
    this.filename = extractFilename(filename);
    this.level = level || getLogLevel();
    this.customLogger = customLogger;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  private formatPrefix(level: LogLevel): string {
    return `[${level.toUpperCase()}] ${this.packageName}.${this.filename}:`;
  }

  debug(msg: string, ...args: unknown[]): void {
    if (this.customLogger) {
      this.customLogger.debug(msg, ...args);
      return;
    }
    if (this.shouldLog('debug')) {
      console.debug(this.formatPrefix('debug'), msg, ...args);
    }
  }

  info(msg: string, ...args: unknown[]): void {
    if (this.customLogger) {
      this.customLogger.info(msg, ...args);
      return;
    }
    if (this.shouldLog('info')) {
      console.info(this.formatPrefix('info'), msg, ...args);
    }
  }

  warn(msg: string, ...args: unknown[]): void {
    if (this.customLogger) {
      this.customLogger.warn(msg, ...args);
      return;
    }
    if (this.shouldLog('warn')) {
      console.warn(this.formatPrefix('warn'), msg, ...args);
    }
  }

  error(msg: string, ...args: unknown[]): void {
    if (this.customLogger) {
      this.customLogger.error(msg, ...args);
      return;
    }
    if (this.shouldLog('error')) {
      console.error(this.formatPrefix('error'), msg, ...args);
    }
  }
}

/**
 * Create a package-scoped logger.
 *
 * @param packageName - Name of the package (e.g., "common-exceptions")
 * @param filename - Source filename, typically __filename
 * @param level - Optional log level override (debug, info, warn, error)
 * @param customLogger - Optional custom logger implementing Logger interface
 * @returns Logger instance
 *
 * @example
 * const logger = create('common-exceptions', __filename);
 * logger.debug('Exception raised: AUTH_NOT_AUTHENTICATED');
 */
export function create(
  packageName: string,
  filename: string,
  level?: LogLevel,
  customLogger?: Logger
): Logger {
  return new PackageLogger(packageName, filename, level, customLogger);
}

// Module-level default logger
export const defaultLogger = create('common-exceptions', __filename);
