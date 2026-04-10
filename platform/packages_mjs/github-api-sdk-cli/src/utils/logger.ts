import chalk from "chalk";

export interface LoggerConfig {
  verbose: boolean;
}

export type LogLevel = "info" | "warn" | "error";
export type LogFn = (message: string, level?: LogLevel) => void;
export type OutputFn = (message: string) => void;

/**
 * Create a logger that respects verbose/error configuration.
 * - info: only printed when --verbose is enabled
 * - warn: always printed
 * - error: always printed
 *
 * Also provides `output()` for CLI presentation (always printed, no timestamp).
 */
export function createLogger(config: LoggerConfig): {
  log: LogFn;
  output: OutputFn;
} {
  function log(message: string, level: LogLevel = "info"): void {
    if (level === "info" && !config.verbose) return;

    const timestamp = new Date().toISOString();
    const coloredMessage =
      level === "error"
        ? chalk.red(message)
        : level === "warn"
          ? chalk.yellow(message)
          : chalk.blue(message);
    console.log(`${chalk.gray(timestamp)} ${coloredMessage}`);
  }

  /**
   * Print CLI presentation output (always visible, no timestamp/level).
   * Use for summary tables, section headers, and user-facing formatted output.
   */
  function output(message: string): void {
    console.log(message);
  }

  return { log, output };
}
