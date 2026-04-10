/**
 * Polyglot Logger Interface
 *
 * Provides a unified logging interface for defensive programming with verbose output.
 * Logger instances can be injected via constructor for testing and customization.
 *
 * @example
 * ```typescript
 * import { create } from "./logger.js";
 *
 * const logger = create("aws_s3_client", import.meta.url);
 * logger.debug("Operation started");
 * logger.info("Operation completed successfully");
 * logger.warn("Approaching limit");
 * logger.error("Operation failed");
 * ```
 */

import { basename } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Logger interface for dependency injection.
 */
export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

/**
 * Log levels for filtering.
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Default logger implementation with structured output format.
 *
 * Format: [timestamp] [level] [package:filename] message
 */
export class DefaultLogger implements Logger {
  private packageName: string;
  private filename: string;
  private level: LogLevel;
  private stream: NodeJS.WriteStream;

  constructor(
    packageName: string,
    filename: string,
    options?: { level?: LogLevel; stream?: NodeJS.WriteStream }
  ) {
    this.packageName = packageName;
    this.filename = this.extractFilename(filename);
    this.level = options?.level ?? LogLevel.DEBUG;
    this.stream = options?.stream ?? process.stderr;
  }

  private extractFilename(input: string): string {
    if (!input) return "unknown";

    // Handle file:// URLs
    if (input.startsWith("file://")) {
      try {
        const path = fileURLToPath(input);
        return basename(path);
      } catch {
        return "unknown";
      }
    }

    return basename(input);
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${this.packageName}:${this.filename}] ${message}`;
  }

  private log(level: string, levelValue: LogLevel, message: string): void {
    if (levelValue >= this.level) {
      const formatted = this.formatMessage(level, message);
      this.stream.write(formatted + "\n");
    }
  }

  debug(message: string): void {
    this.log("DEBUG", LogLevel.DEBUG, message);
  }

  info(message: string): void {
    this.log("INFO", LogLevel.INFO, message);
  }

  warn(message: string): void {
    this.log("WARN", LogLevel.WARN, message);
  }

  error(message: string): void {
    this.log("ERROR", LogLevel.ERROR, message);
  }
}

/**
 * A logger that does nothing. Useful for testing or disabling logging.
 */
export class NullLogger implements Logger {
  debug(_message: string): void {
    // No-op
  }

  info(_message: string): void {
    // No-op
  }

  warn(_message: string): void {
    // No-op
  }

  error(_message: string): void {
    // No-op
  }
}

/**
 * Factory function to create a logger instance.
 *
 * This is the primary way to create loggers in the package.
 *
 * @param packageName - Name of the package (e.g., "aws_s3_client")
 * @param filename - Source filename, typically import.meta.url or __filename
 * @param options - Optional configuration
 * @returns A configured DefaultLogger instance
 *
 * @example
 * ```typescript
 * const logger = create("aws_s3_client", import.meta.url);
 * logger.info("Storage initialized");
 * ```
 */
export function create(
  packageName: string,
  filename: string,
  options?: { level?: LogLevel; stream?: NodeJS.WriteStream }
): DefaultLogger {
  return new DefaultLogger(packageName, filename, options);
}
