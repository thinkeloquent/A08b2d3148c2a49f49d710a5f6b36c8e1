import type { ILogger } from './types.js';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE';

/**
 * Default logger implementation with structured output.
 * Format: [package:filename] LEVEL: message
 */
class DefaultLogger implements ILogger {
  private readonly prefix: string;

  constructor(packageName: string, filename: string) {
    this.prefix = `[${packageName}:${filename}]`;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    const output = `${this.prefix} ${level}: ${message}${contextStr}`;

    switch (level) {
      case 'ERROR':
        console.error(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'DEBUG':
      case 'TRACE':
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('INFO', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('WARN', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('ERROR', message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('DEBUG', message, context);
  }

  trace(message: string, context?: Record<string, unknown>): void {
    this.log('TRACE', message, context);
  }
}

/**
 * Create a logger instance with the standard package:filename prefix.
 *
 * @param packageName - The package name (e.g., 'static-app-loader')
 * @param filename - The source filename (e.g., 'plugin.ts')
 * @returns ILogger instance
 *
 * @example
 * ```typescript
 * import * as logger from './logger.js';
 * const log = logger.create('static-app-loader', 'plugin.ts');
 * log.info('Registering app: dashboard');
 * // Output: [static-app-loader:plugin.ts] INFO: Registering app: dashboard
 * ```
 */
export function create(packageName: string, filename: string): ILogger {
  return new DefaultLogger(packageName, filename);
}

/**
 * Create a no-op logger for testing or silent operation.
 */
export function createSilent(): ILogger {
  const noop = () => {};
  return {
    info: noop,
    warn: noop,
    error: noop,
    debug: noop,
    trace: noop,
  };
}
