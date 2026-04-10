import fs from "fs/promises";
import chalk from "chalk";

export interface DebugConfig {
  debug: boolean;
}

export type DebugLogFn = (operation: string, data: unknown) => Promise<void>;

/**
 * Create a debug logger that writes to github.log when debug mode is enabled.
 */
export function createDebugLogger(config: DebugConfig): {
  debugLog: DebugLogFn;
} {
  async function debugLog(operation: string, data: unknown): Promise<void> {
    if (config.debug) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        data,
      };

      try {
        await fs.appendFile("github.log", JSON.stringify(logEntry) + "\n");
      } catch (error) {
        console.error(
          chalk.red(
            `Failed to write debug log: ${(error as Error).message}`,
          ),
        );
      }
    }
  }

  return { debugLog };
}
