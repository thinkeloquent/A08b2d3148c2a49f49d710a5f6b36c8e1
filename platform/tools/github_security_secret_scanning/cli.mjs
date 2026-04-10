#!/usr/bin/env node

/**
 * Interactive CLI for GitHub Secret Scanning Tool.
 *
 * Usage:
 *   node cli.mjs              — interactive wizard (prompts for all options)
 *   node cli.mjs --repo       — skip to non-interactive mode (delegates to bin/secret_scanning.mjs)
 *
 * Interactive routes:
 *   1. Check Alerts           — download and display open secret scanning alerts
 *   2. Resolve Alerts         — download, apply handler, optionally resolve on GitHub
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import dotenv from "dotenv";
import {
  bail,
  promptHierarchyScope,
  promptHierarchyCascade,
  promptOutputOptions,
} from "@internal/github-api-sdk-cli";
import { validateAndNormalize } from "./src/cli/defaults-and-validate.mjs";
import { SecretScanningService } from "./src/services/secret-scanning-service.mjs";

dotenv.config();


// ── Route definitions ────────────────────────────────────────────────────────

const ROUTES = [
  {
    value: "check",
    label: "Check Alerts",
    hint: "Download and display open secret scanning alerts with locations",
  },
  {
    value: "resolve",
    label: "Resolve Alerts",
    hint: "Download alerts, apply a handler to fix local files, optionally resolve on GitHub",
  },
];


// ── Interactive Flow ─────────────────────────────────────────────────────────

async function runInteractive() {
  p.intro(chalk.cyan.bold("GitHub Secret Scanning Tool"));

  // ── Route selection ───────────────────────────────────────────────────────

  const mode = bail(
    await p.select({
      message: "Select mode",
      options: ROUTES.map((r) => ({
        value: r.value,
        label: r.label,
        hint: r.hint,
      })),
    })
  );

  // ── Hierarchy scope picker ────────────────────────────────────────────────

  const scopeConfig = { levels: {} };
  const scope = await promptHierarchyScope(scopeConfig);
  const { token, hierarchy } = await promptHierarchyCascade({ scope, config: scopeConfig });
  const { org, repo } = hierarchy;

  // ── Resolve-mode specific prompts ─────────────────────────────────────────

  let handler;
  let secretResolution = "false_positive";
  let autoResolve = false;
  let repoRoot;

  if (mode === "resolve") {
    const handlerInput = bail(
      await p.text({
        message: "Path to handler .mjs file",
        placeholder: "./handlers/redact-base64.mjs",
        validate: (v) => {
          if (!v?.trim()) return "Handler path is required for resolve mode";
        },
      })
    );
    handler = handlerInput.trim();

    secretResolution = bail(
      await p.select({
        message: "Resolution reason for GitHub API",
        options: [
          { value: "false_positive", label: "False Positive", hint: "Not a real secret" },
          { value: "revoked", label: "Revoked", hint: "Secret has been rotated/revoked" },
          { value: "used_in_tests", label: "Used in Tests", hint: "Test/example credential" },
          { value: "wont_fix", label: "Won't Fix", hint: "Accepted risk" },
        ],
      })
    );

    autoResolve = bail(
      await p.confirm({
        message: "Auto-resolve alerts on GitHub after handler fixes all locations?",
        initialValue: false,
      })
    );

    const repoRootInput = bail(
      await p.text({
        message: "Local repository root (leave blank to auto-detect from git)",
        placeholder: "/Users/Shared/autoload/A08b2d3148c2a49f49d710a5f6b36c8e1",
      })
    );
    repoRoot = repoRootInput?.trim() || undefined;
  }

  // ── Output options ────────────────────────────────────────────────────────

  const { format, outputDir, filename, totalRecords, delay, verbose, debug } =
    await promptOutputOptions({ searchUser: repo || org || "unknown" });

  // ── Build options object ──────────────────────────────────────────────────

  const options = {
    token,
    org: org || undefined,
    repo: repo || undefined,
    mode,
    handler: handler || undefined,
    secretResolution,
    autoResolve,
    dryRun: !autoResolve,
    repoRoot: repoRoot || undefined,
    format,
    outputDir,
    filename: filename || undefined,
    totalRecords,
    delay,
    verbose,
    debug,
    metaTags: [],
  };

  // ── Confirmation summary ──────────────────────────────────────────────────

  p.log.step(chalk.bold("Configuration Summary"));

  const summaryLines = [
    `  Mode               ${chalk.green(mode)}`,
    `  Repository         ${chalk.green(options.repo || "N/A")}`,
  ];

  if (mode === "resolve") {
    summaryLines.push(
      `  Handler            ${chalk.green(handler)}`,
      `  Secret resolution  ${chalk.green(secretResolution)}`,
      `  Auto resolve       ${autoResolve ? chalk.yellow("Yes") : "No"}`,
      `  Dry run            ${options.dryRun ? chalk.yellow("Yes (no GitHub writes)") : chalk.green("No")}`
    );
  }

  summaryLines.push(
    `  Format             ${chalk.green(format.toUpperCase())}`,
    `  Output             ${chalk.green(outputDir)}`,
    `  Verbose            ${verbose ? chalk.green("Yes") : chalk.gray("No")}`,
    `  Debug              ${debug ? chalk.green("Yes") : chalk.gray("No")}`
  );

  console.log(summaryLines.join("\n"));

  // ── Auto-resolve safety confirmation ──────────────────────────────────────

  if (autoResolve) {
    const resolveConfirmed = bail(
      await p.confirm({
        message: chalk.yellow(
          "This will resolve alerts on GitHub after the handler fixes all locations. Continue?"
        ),
        initialValue: false,
      })
    );

    if (!resolveConfirmed) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
  }

  // ── Final confirmation ────────────────────────────────────────────────────

  const confirmed = bail(
    await p.confirm({
      message: `Run secret scanning ${chalk.bold(mode)} for ${chalk.bold(options.repo || options.org || "repository")}?`,
    })
  );

  if (!confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(
    `Starting ${chalk.bold(mode)} mode for ${chalk.bold(options.repo || options.org || "repository")}`
  );

  // ── Execute ───────────────────────────────────────────────────────────────

  const validated = validateAndNormalize(options);
  const service = new SecretScanningService(validated);
  await service.run();
}


// ── Entry point ──────────────────────────────────────────────────────────────

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes("--repo")) {
    const { main } = await import("./src/main.mjs");
    main().catch((error) => {
      console.error(chalk.red(`Unexpected error: ${error.message}`));
      process.exit(1);
    });
  } else {
    runInteractive().catch((error) => {
      console.error(chalk.red(`Unexpected error: ${error.message}`));
      process.exit(1);
    });
  }
}
