#!/usr/bin/env node

import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import * as p from "@clack/prompts";
import { execa } from "execa";
import pc from "picocolors";

// ── Constants ────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, "..", "..", "..");
const MAKEFILE = "Makefile.gitmodule";

// ── Target Definitions ──────────────────────────────────────────────

interface MakeTarget {
  value: string;
  label: string;
  hint: string;
  params?: string[];
}

interface TargetCategory {
  name: string;
  targets: MakeTarget[];
}

const CATEGORIES: TargetCategory[] = [
  {
    name: "Initialization",
    targets: [
      { value: "init", label: "init", hint: "Initialize and clone all submodules" },
      { value: "init-recursive", label: "init-recursive", hint: "Initialize submodules recursively (nested)" },
    ],
  },
  {
    name: "Updates",
    targets: [
      { value: "update", label: "update", hint: "Update all submodules to recorded commits" },
      { value: "update-remote", label: "update-remote", hint: "Update submodules to latest remote commits" },
      { value: "update-rebase", label: "update-rebase", hint: "Update with rebase instead of merge" },
      { value: "pull", label: "pull", hint: "Pull latest changes in all submodules" },
    ],
  },
  {
    name: "Status & Info",
    targets: [
      { value: "status", label: "status", hint: "Show status of all submodules" },
      { value: "list", label: "list", hint: "List all registered submodules" },
      { value: "list-verbose", label: "list-verbose", hint: "Show submodule details (path + URL)" },
      { value: "diff", label: "diff", hint: "Show diff of submodule changes" },
      { value: "log", label: "log", hint: "Show recent commits in submodules" },
      { value: "report", label: "report", hint: "Full submodule report" },
    ],
  },
  {
    name: "Maintenance",
    targets: [
      { value: "sync", label: "sync", hint: "Sync submodule URLs from .gitmodules" },
      { value: "clean", label: "clean", hint: "Deinitialize and clean submodule dirs" },
      { value: "reset", label: "reset", hint: "Reset submodules to recorded commits" },
    ],
  },
  {
    name: "Add / Remove",
    targets: [
      {
        value: "add-submodule",
        label: "add-submodule",
        hint: "Add a new submodule (URL + PATH)",
        params: ["URL", "PATH"],
      },
      {
        value: "remove-submodule",
        label: "remove-submodule",
        hint: "Remove a submodule",
        params: ["PATH"],
      },
    ],
  },
  {
    name: "Batch Operations",
    targets: [
      {
        value: "foreach",
        label: "foreach",
        hint: "Run a command in each submodule",
        params: ["CMD"],
      },
      { value: "checkout-main", label: "checkout-main", hint: "Checkout main/master in all submodules" },
      { value: "fetch-all", label: "fetch-all", hint: "Fetch all remotes in submodules" },
    ],
  },
  {
    name: "CI / Quality",
    targets: [
      { value: "fresh-init", label: "fresh-init", hint: "Sync, init submodules, prune orphans" },
      { value: "prune", label: "prune", hint: "Prune orphaned .gitmodules entries" },
      { value: "prune-dry", label: "prune-dry", hint: "Preview orphans without changing anything" },
      { value: "check-orphans", label: "check-orphans", hint: "Exit 1 if orphaned entries exist (CI gate)" },
      { value: "check-commits", label: "check-commits", hint: "Verify submodule commits exist on remotes" },
      { value: "ci-check", label: "ci-check", hint: "Run all CI quality checks" },
    ],
  },
];

const ALL_TARGETS = CATEGORIES.flatMap((c) => c.targets);
const TARGET_NAMES = ALL_TARGETS.map((t) => t.value);

// ── Execution ────────────────────────────────────────────────────────

async function executeMakeTarget(
  target: string,
  params: Record<string, string> = {},
): Promise<void> {
  const paramArgs = Object.entries(params).map(([k, v]) => `${k}=${v}`);
  const display = [`make -f ${MAKEFILE}`, target, ...paramArgs].join(" ");

  console.log(pc.cyan(`\n▶ Running ${pc.bold(display)}\n`));

  const result = await execa("make", ["-f", MAKEFILE, target, ...paramArgs], {
    cwd: MONOREPO_ROOT,
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

// ── Parameter Prompts ────────────────────────────────────────────────

async function promptForParams(
  target: MakeTarget,
): Promise<Record<string, string> | null> {
  const params: Record<string, string> = {};

  if (!target.params || target.params.length === 0) return params;

  for (const param of target.params) {
    const value = await p.text({
      message: `Enter ${pc.bold(param)}:`,
      placeholder: getPlaceholder(param),
      validate: (v) => {
        if (!v.trim()) return `${param} is required`;
      },
    });

    if (p.isCancel(value)) return null;
    params[param] = value;
  }

  return params;
}

function getPlaceholder(param: string): string {
  switch (param) {
    case "URL":
      return "git@github.com:user/repo.git";
    case "PATH":
      return "libs/repo";
    case "CMD":
      return "git status";
    default:
      return "";
  }
}

// ── Interactive Mode ─────────────────────────────────────────────────

async function runInteractive(): Promise<void> {
  p.intro(pc.cyan("Git Submodule Manager"));

  const categoryChoice = await p.select({
    message: "Select a category",
    options: CATEGORIES.map((cat) => ({
      value: cat,
      label: cat.name,
      hint: `${cat.targets.length} target${cat.targets.length === 1 ? "" : "s"}`,
    })),
  });

  if (p.isCancel(categoryChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const targetChoice = await p.select({
    message: "Select a target",
    options: categoryChoice.targets.map((t) => ({
      value: t,
      label: t.label,
      hint: t.hint,
    })),
  });

  if (p.isCancel(targetChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const params = await promptForParams(targetChoice);
  if (params === null) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const paramStr = Object.entries(params)
    .map(([k, v]) => `${k}=${v}`)
    .join(" ");
  const display = paramStr
    ? `make -f ${MAKEFILE} ${targetChoice.value} ${paramStr}`
    : `make -f ${MAKEFILE} ${targetChoice.value}`;

  const confirmed = await p.confirm({
    message: `Run ${pc.bold(display)}?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Running ${pc.bold(targetChoice.value)}…`);

  await executeMakeTarget(targetChoice.value, params);
}

// ── List Targets ─────────────────────────────────────────────────────

function listTargets(): void {
  console.log(pc.cyan("Available Git Submodule Targets:\n"));
  for (const cat of CATEGORIES) {
    console.log(pc.green(`  ${cat.name}:`));
    for (const t of cat.targets) {
      const paramHint = t.params ? pc.dim(` [${t.params.join(", ")}]`) : "";
      console.log(`    ${pc.bold(t.label)}${paramHint}  ${pc.dim(t.hint)}`);
    }
    console.log();
  }
}

// ── Main ─────────────────────────────────────────────────────────────

// Strip bare "--" inserted by pnpm between the script and pass-through args,
// so that `pnpm dev -- --list` parses correctly as `--list`.
const argv = process.argv.filter((arg, i) => !(arg === "--" && i >= 2));

async function main() {
  const program = new Command()
    .name("gitmodule-manager")
    .description("Manage Git submodules in the monorepo")
    .option("-l, --list", "List available targets and exit")
    .option("-t, --target <name>", "Run a target directly (skip prompts)")
    .option("--url <url>", "Submodule URL (for add-submodule)")
    .option("--path <path>", "Submodule path (for add-submodule / remove-submodule)")
    .option("--cmd <command>", "Command to run (for foreach)")
    .parse(argv);

  const opts = program.opts<{
    list?: boolean;
    target?: string;
    url?: string;
    path?: string;
    cmd?: string;
  }>();

  // --list
  if (opts.list) {
    listTargets();
    return;
  }

  // Non-interactive
  if (opts.target) {
    if (!TARGET_NAMES.includes(opts.target)) {
      console.error(
        pc.red(`Invalid target "${opts.target}". Use --list to see available targets.`),
      );
      process.exit(1);
    }

    const target = ALL_TARGETS.find((t) => t.value === opts.target)!;
    const params: Record<string, string> = {};

    if (target.params) {
      for (const param of target.params) {
        const cliFlag = param.toLowerCase() as keyof typeof opts;
        const value = opts[cliFlag];
        if (!value) {
          console.error(
            pc.red(`Target "${target.value}" requires --${cliFlag}. Example:`),
          );
          console.error(
            pc.dim(`  gitmodule-manager --target ${target.value} ${target.params.map((p) => `--${p.toLowerCase()} <value>`).join(" ")}`),
          );
          process.exit(1);
        }
        params[param] = value as string;
      }
    }

    await executeMakeTarget(opts.target, params);
    return;
  }

  // Interactive
  await runInteractive();
}

main().catch((err) => {
  console.error(pc.red(String(err)));
  process.exit(1);
});
