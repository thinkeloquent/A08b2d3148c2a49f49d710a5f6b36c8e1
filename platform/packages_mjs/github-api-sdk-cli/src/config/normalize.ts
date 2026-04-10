import chalk from "chalk";
import { resolveGithubEnv } from "@internal/env-resolver";
import type { ZodSchema } from "zod";
import { BaseConfigSchema } from "./base-schema.js";

/**
 * Validate and normalize configuration options against a Zod schema.
 * Defaults to BaseConfigSchema if no schema is provided.
 */
export function normalizeConfig<T>(
  options: Record<string, unknown>,
  schema: ZodSchema<T> = BaseConfigSchema as unknown as ZodSchema<T>,
): T {
  const merged: Record<string, unknown> = {
    ...options,
    token:
      (options.token as string) || resolveGithubEnv().token || "",
    verbose: (options.verbose as boolean) || false,
    debug: (options.debug as boolean) || false,
  };

  const configResult = (schema as any).safeParse(merged);
  if (!configResult.success) {
    console.error(chalk.red("Configuration validation failed:"));
    configResult.error.errors.forEach((err: any) => {
      console.error(
        chalk.red(`  - ${err.path.join(".")}: ${err.message}`),
      );
    });
    process.exit(1);
  }

  return configResult.data;
}
