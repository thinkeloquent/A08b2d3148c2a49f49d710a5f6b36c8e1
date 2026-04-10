#!/usr/bin/env node

/**
 * CLI Entry Point for AWS S3 Client
 *
 * Provides command-line interface for S3 storage operations.
 *
 * Usage:
 *   aws-s3-client save --bucket my-bucket < data.json
 *   aws-s3-client load --bucket my-bucket abc123
 *   aws-s3-client list --bucket my-bucket
 */

import { Command } from "commander";
import { createInterface } from "readline";

import { type SDKConfig } from "./config.js";
import { createSDK } from "./sdk.js";

/**
 * Read stdin as a string.
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = "";
    const rl = createInterface({
      input: process.stdin,
      terminal: false,
    });

    rl.on("line", (line) => {
      data += line + "\n";
    });

    rl.on("close", () => {
      resolve(data.trim());
    });

    // Handle case where stdin is empty/not piped
    if (process.stdin.isTTY) {
      resolve("");
    }
  });
}

/**
 * Create and configure the CLI program.
 */
function createProgram(): Command {
  const program = new Command();

  program
    .name("aws-s3-client")
    .description("AWS S3 JSON storage CLI")
    .version("1.0.0")
    .requiredOption("--bucket <bucket>", "S3 bucket name")
    .option("--region <region>", "AWS region", "us-east-1")
    .option("--prefix <prefix>", "Key prefix", "jss3:")
    .option("--ttl <ttl>", "Default TTL in seconds")
    .option("--verbose, -v", "Enable verbose logging")
    .option("--endpoint-url <url>", "Custom S3 endpoint URL");

  // Save command
  program
    .command("save")
    .description("Save JSON data from stdin")
    .option("--ttl <ttl>", "TTL for this save")
    .action(async (options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runSave(globalOpts, options);
    });

  // Load command
  program
    .command("load <key>")
    .description("Load JSON data by key")
    .action(async (key: string, _options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runLoad(globalOpts, key);
    });

  // Delete command
  program
    .command("delete <key>")
    .description("Delete object by key")
    .action(async (key: string, _options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runDelete(globalOpts, key);
    });

  // Exists command
  program
    .command("exists <key>")
    .description("Check if object exists")
    .action(async (key: string, _options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runExists(globalOpts, key);
    });

  // List command
  program
    .command("list")
    .description("List all keys")
    .action(async (_options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runList(globalOpts);
    });

  // Clear command
  program
    .command("clear")
    .description("Delete all objects")
    .action(async (_options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runClear(globalOpts);
    });

  // Stats command
  program
    .command("stats")
    .description("Show operation statistics")
    .action(async (_options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runStats(globalOpts);
    });

  // Debug command
  program
    .command("debug")
    .description("Show debug information")
    .action(async (_options, command) => {
      const globalOpts = command.parent?.opts() ?? {};
      await runDebug(globalOpts);
    });

  return program;
}

/**
 * Build SDK config from CLI options.
 */
function buildConfig(opts: Record<string, unknown>): SDKConfig {
  return {
    bucketName: opts.bucket as string,
    region: opts.region as string,
    keyPrefix: opts.prefix as string,
    ttl: opts.ttl ? parseInt(opts.ttl as string, 10) : undefined,
    debug: Boolean(opts.verbose),
    endpointUrl: opts.endpointUrl as string | undefined,
  };
}

/**
 * Output result as JSON.
 */
function output(result: unknown): void {
  console.log(JSON.stringify(result, null, 2));
}

// Command implementations

async function runSave(
  globalOpts: Record<string, unknown>,
  saveOpts: Record<string, unknown>
): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const input = await readStdin();
    if (!input) {
      output({ success: false, error: "No input provided. Pipe JSON to stdin." });
      process.exit(1);
    }

    let data: Record<string, unknown>;
    try {
      data = JSON.parse(input);
    } catch {
      output({ success: false, error: "Invalid JSON input" });
      process.exit(1);
    }

    const ttl = saveOpts.ttl ? parseInt(saveOpts.ttl as string, 10) : undefined;
    const response = await sdk.save(data, { ttl });
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runLoad(
  globalOpts: Record<string, unknown>,
  key: string
): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.load(key);
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runDelete(
  globalOpts: Record<string, unknown>,
  key: string
): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.delete(key);
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runExists(
  globalOpts: Record<string, unknown>,
  key: string
): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.exists(key);
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runList(globalOpts: Record<string, unknown>): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.listKeys();
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runClear(globalOpts: Record<string, unknown>): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.clear();
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runStats(globalOpts: Record<string, unknown>): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.stats();
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

async function runDebug(globalOpts: Record<string, unknown>): Promise<void> {
  const config = buildConfig(globalOpts);
  const sdk = createSDK(config);

  try {
    const response = await sdk.debugInfo();
    output(response);

    if (!response.success) {
      process.exit(1);
    }
  } finally {
    await sdk.close();
  }
}

// Main entry point
const program = createProgram();
program.parseAsync(process.argv).catch((error) => {
  console.error(JSON.stringify({ success: false, error: error.message }, null, 2));
  process.exit(1);
});
