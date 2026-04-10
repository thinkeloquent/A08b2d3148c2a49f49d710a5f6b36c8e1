/**
 * Logger module type declarations for computed-url-builder.
 */

/**
 * Logger interface for defensive programming.
 */
export interface Logger {
  /**
   * Log a debug message.
   * @param msg - Message to log
   * @param args - Arguments to interpolate
   */
  debug(msg: string, ...args: unknown[]): void;

  /**
   * Log an info message.
   * @param msg - Message to log
   * @param args - Arguments to interpolate
   */
  info(msg: string, ...args: unknown[]): void;

  /**
   * Log a warning message.
   * @param msg - Message to log
   * @param args - Arguments to interpolate
   */
  warn(msg: string, ...args: unknown[]): void;

  /**
   * Log an error message.
   * @param msg - Message to log
   * @param args - Arguments to interpolate
   */
  error(msg: string, ...args: unknown[]): void;
}

/**
 * Log levels enumeration.
 */
export declare const LogLevel: {
  readonly DEBUG: 10;
  readonly INFO: 20;
  readonly WARN: 30;
  readonly ERROR: 40;
  readonly SILENT: 100;
};

/**
 * Options for creating a logger.
 */
export interface LoggerOptions {
  /**
   * Log level (default: from LOG_LEVEL env or DEBUG)
   */
  level?: number;

  /**
   * Whether logging is enabled (default: from LOG_ENABLED env or true)
   */
  enabled?: boolean;
}

/**
 * Package logger implementation.
 */
export declare class PackageLogger implements Logger {
  readonly packageName: string;
  readonly filename: string;
  readonly level: number;
  readonly enabled: boolean;

  constructor(packageName: string, filename: string, level?: number, enabled?: boolean);

  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

/**
 * Null logger that discards all messages.
 */
export declare class NullLogger implements Logger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

/**
 * Create a logger instance for defensive programming.
 *
 * @param packageName - Name of the package
 * @param filename - Source filename (typically import.meta.url)
 * @param options - Logger options
 * @returns Logger instance
 */
export declare function create(
  packageName: string,
  filename: string,
  options?: LoggerOptions
): PackageLogger;

/**
 * Create a null logger that discards all messages.
 *
 * @returns Null logger instance
 */
export declare function createNull(): NullLogger;

declare const _default: {
  create: typeof create;
  createNull: typeof createNull;
  LogLevel: typeof LogLevel;
};

export default _default;
