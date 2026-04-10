/**
 * CLI formatting for common-exceptions.
 *
 * Provides terminal-friendly error output with optional colors.
 */

import { BaseHttpException } from '../base.js';
import { getCodeCategory } from '../codes.js';
import { create } from '../logger.js';

const logger = create('common-exceptions', __filename);

/**
 * ANSI color codes for terminal output.
 */
const Colors = {
  RED: '\x1b[91m',
  YELLOW: '\x1b[93m',
  BLUE: '\x1b[94m',
  CYAN: '\x1b[96m',
  GRAY: '\x1b[90m',
  BOLD: '\x1b[1m',
  RESET: '\x1b[0m',
} as const;

/**
 * Check if terminal supports color output.
 */
function supportsColor(): boolean {
  // Respect NO_COLOR env var
  if (process.env.NO_COLOR) {
    return false;
  }

  // Respect FORCE_COLOR env var
  if (process.env.FORCE_COLOR) {
    return true;
  }

  // Check if stdout is a TTY
  if (typeof process.stdout?.isTTY === 'boolean') {
    return process.stdout.isTTY;
  }

  return false;
}

/**
 * Options for formatForCli.
 */
export interface FormatCliOptions {
  verbose?: boolean;
  useColors?: boolean;
}

/**
 * Format an exception for CLI output.
 *
 * @param exc - Exception to format
 * @param options - Formatting options
 * @returns Formatted string for terminal output
 *
 * @example
 * const exc = new NotFoundException({ message: 'User not found' });
 * console.log(formatForCli(exc));
 * // Output:
 * // [NOT_FOUND] User not found (404)
 */
export function formatForCli(exc: BaseHttpException, options: FormatCliOptions = {}): string {
  const { verbose = false, useColors = supportsColor() } = options;

  logger.debug(`Formatting exception for CLI: ${exc.code}`);

  const lines: string[] = [];

  // Header line: [CODE] Message (status)
  if (useColors) {
    const codeColor = getColorForCategory(getCodeCategory(exc.code));
    const header =
      `${codeColor}${Colors.BOLD}[${exc.code}]${Colors.RESET} ` +
      `${exc.message} ` +
      `${Colors.GRAY}(${exc.status})${Colors.RESET}`;
    lines.push(header);
  } else {
    lines.push(`[${exc.code}] ${exc.message} (${exc.status})`);
  }

  // Details
  if (exc.details && Object.keys(exc.details).length > 0) {
    if (useColors) {
      lines.push(`\n${Colors.CYAN}Details:${Colors.RESET}`);
    } else {
      lines.push('\nDetails:');
    }

    for (const [key, value] of Object.entries(exc.details)) {
      const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (useColors) {
        lines.push(`  ${Colors.GRAY}${key}:${Colors.RESET} ${valueStr}`);
      } else {
        lines.push(`  ${key}: ${valueStr}`);
      }
    }
  }

  // Request ID
  if (exc.requestId) {
    if (useColors) {
      lines.push(`\n${Colors.GRAY}Request ID: ${exc.requestId}${Colors.RESET}`);
    } else {
      lines.push(`\nRequest ID: ${exc.requestId}`);
    }
  }

  // Verbose: include stack trace
  if (verbose) {
    const logEntry = exc.toLogEntry();
    const traceback = logEntry.error?.traceback;
    if (traceback) {
      if (useColors) {
        lines.push(`\n${Colors.GRAY}Stack Trace:${Colors.RESET}`);
        lines.push(`${Colors.GRAY}${traceback}${Colors.RESET}`);
      } else {
        lines.push('\nStack Trace:');
        lines.push(traceback);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Get color code for error category.
 */
function getColorForCategory(category: string): string {
  const categoryColors: Record<string, string> = {
    auth: Colors.RED,
    authz: Colors.RED,
    request: Colors.YELLOW,
    network: Colors.BLUE,
    upstream: Colors.BLUE,
    internal: Colors.RED,
  };
  return categoryColors[category] ?? Colors.YELLOW;
}

/**
 * Print formatted error to stderr.
 *
 * @param exc - Exception to print
 * @param options - Formatting options
 */
export function printError(exc: BaseHttpException, options: FormatCliOptions = {}): void {
  console.error(formatForCli(exc, options));
}

logger.debug('CLI formatter initialized');
