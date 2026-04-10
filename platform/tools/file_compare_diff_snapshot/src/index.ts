#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import * as p from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

// ── Constants ────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = resolve(__dirname, "..");
const MAKEFILE = resolve(TOOL_ROOT, "Makefile");

// ── Target Definitions ──────────────────────────────────────────────

interface MakeTarget {
  value: string;
  label: string;
  hint: string;
}

const TARGETS: MakeTarget[] = [
  {
    value: "snapshot",
    label: "snapshot",
    hint: "Create or verify a diff snapshot",
  },
  {
    value: "clean-snapshot",
    label: "clean-snapshot",
    hint: "Remove cached snapshot for a directory pair",
  },
  {
    value: "test",
    label: "test",
    hint: "Run the test suite",
  },
];

// ── Execution ────────────────────────────────────────────────────────

async function executeMakeTarget(
  target: string,
  vars: Record<string, string> = {},
): Promise<void> {
  const varArgs = Object.entries(vars)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`);
  const display = [`make`, target, ...varArgs].join(" ");

  console.log(pc.cyan(`\n▶ Running ${pc.bold(display)}\n`));

  const result = await execa("make", [target, ...varArgs], {
    cwd: TOOL_ROOT,
    stdio: "inherit",
    reject: false,
  });

  console.log();
  if (result.exitCode === 0) {
    console.log(pc.green(`✓ ${display} succeeded`));
  } else {
    console.log(pc.red(`✗ ${display} failed (exit code ${result.exitCode})`));
    process.exitCode = 1;
  }
}

// ── Interactive Mode ─────────────────────────────────────────────────

async function promptDirs(): Promise<{
  dirA: string;
  dirB: string;
  glob: string;
  verbose: boolean;
} | null> {
  const dirA = await p.text({
    message: `Enter ${pc.bold("DIR_A")} (source directory):`,
    placeholder: "./src",
    validate: (v) => {
      if (!v.trim()) return "DIR_A is required";
    },
  });
  if (p.isCancel(dirA)) return null;

  const dirB = await p.text({
    message: `Enter ${pc.bold("DIR_B")} (reference directory):`,
    placeholder: "./ref",
    validate: (v) => {
      if (!v.trim()) return "DIR_B is required";
    },
  });
  if (p.isCancel(dirB)) return null;

  const glob = await p.text({
    message: `Enter ${pc.bold("GLOB")} pattern (blank for all files):`,
    placeholder: "**/*.py",
    defaultValue: "",
  });
  if (p.isCancel(glob)) return null;

  const verbose = await p.confirm({
    message: "Enable verbose output?",
    initialValue: false,
  });
  if (p.isCancel(verbose)) return null;

  return { dirA, dirB, glob, verbose };
}

async function runInteractive(): Promise<void> {
  p.intro(pc.cyan("File Compare Diff Snapshot"));

  const targetChoice = await p.select({
    message: "Select an action",
    options: TARGETS.map((t) => ({
      value: t.value,
      label: t.label,
      hint: t.hint,
    })),
  });

  if (p.isCancel(targetChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // test doesn't need directory params
  if (targetChoice === "test") {
    const confirmed = await p.confirm({
      message: `Run ${pc.bold("make test")}?`,
    });
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    p.outro(`Running ${pc.bold("test")}…`);
    await executeMakeTarget("test");
    return;
  }

  const dirs = await promptDirs();
  if (dirs === null) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const vars: Record<string, string> = {
    DIR_A: dirs.dirA,
    DIR_B: dirs.dirB,
  };
  if (dirs.glob) vars.GLOB = dirs.glob;
  if (dirs.verbose) vars.VERBOSE = "1";

  const varStr = Object.entries(vars)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  const display = `make ${targetChoice} ${varStr}`;

  const confirmed = await p.confirm({
    message: `Run ${pc.bold(display)}?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Running ${pc.bold(targetChoice as string)}…`);
  await executeMakeTarget(targetChoice as string, vars);
}

// ── Main ─────────────────────────────────────────────────────────────

const argv = process.argv.filter((arg, i) => !(arg === "--" && i >= 2));

async function main() {
  const program = new Command()
    .name("file-compare-diff-snapshot")
    .description(
      "Compare files between directories, hash diffs, and verify snapshot stability",
    )
    .option(
      "-t, --target <name>",
      "Run a target directly (snapshot, clean-snapshot, test)",
    )
    .option("--dir-a <path>", "Source directory")
    .option("--dir-b <path>", "Reference directory")
    .option("-g, --glob <pattern>", "Glob filter pattern")
    .option("-v, --verbose", "Enable verbose output")
    .parse(argv);

  const opts = program.opts<{
    target?: string;
    dirA?: string;
    dirB?: string;
    glob?: string;
    verbose?: boolean;
  }>();

  // Non-interactive
  if (opts.target) {
    const valid = TARGETS.map((t) => t.value);
    if (!valid.includes(opts.target)) {
      console.error(
        pc.red(
          `Invalid target "${opts.target}". Valid: ${valid.join(", ")}`,
        ),
      );
      process.exit(1);
    }

    if (opts.target === "test") {
      await executeMakeTarget("test");
      return;
    }

    if (!opts.dirA || !opts.dirB) {
      console.error(pc.red("--dir-a and --dir-b are required."));
      process.exit(1);
    }

    const vars: Record<string, string> = {
      DIR_A: opts.dirA,
      DIR_B: opts.dirB,
    };
    if (opts.glob) vars.GLOB = opts.glob;
    if (opts.verbose) vars.VERBOSE = "1";

    await executeMakeTarget(opts.target, vars);
    return;
  }

  // Interactive
  await runInteractive();
}

main().catch((err) => {
  console.error(pc.red(String(err)));
  process.exit(1);
});
