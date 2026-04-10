#!/usr/bin/env node

import { resolve, dirname, join } from "node:path";
import { existsSync, readFileSync, mkdirSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import * as p from "@clack/prompts";
import { glob } from "glob";
import { execa } from "execa";
import pc from "picocolors";

// ── Constants ────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const MONOREPO_ROOT = resolve(__dirname, "..", "..", "..");
const ERROR_LOG_DIR = join(MONOREPO_ROOT, "logs");
const ERROR_LOG_PATH = join(ERROR_LOG_DIR, "cli_db_manager.error.log");
const SEED_ERROR_LOG_PATH = join(ERROR_LOG_DIR, "cli_db_manager_seed.error.log");

const SEED_TARGETS = new Set(["seed", "reseed", "reset"]);

const PROJECT_GLOB = "fastify_apps/*/sequelize/package.json";

// ── Error Log ─────────────────────────────────────────────────────────

function errorLogPathForTarget(target: string): string {
  return SEED_TARGETS.has(target) ? SEED_ERROR_LOG_PATH : ERROR_LOG_PATH;
}

function appendErrorLog(entry: string, target?: string): void {
  try {
    mkdirSync(ERROR_LOG_DIR, { recursive: true });
    const timestamp = new Date().toISOString();
    const logPath = target ? errorLogPathForTarget(target) : ERROR_LOG_PATH;
    appendFileSync(logPath, `[${timestamp}] ${entry}\n`);
  } catch {
    // Silent — never let log I/O crash the CLI
  }
}

interface Target {
  value: string;
  label: string;
  hint: string;
}

const TARGETS: Target[] = [
  { value: "setup", label: "setup", hint: "Create database tables" },
  { value: "teardown", label: "teardown", hint: "Drop database tables" },
  { value: "seed", label: "seed", hint: "Seed database with sample data" },
  {
    value: "reseed",
    label: "reseed",
    hint: "Truncate all data and re-seed",
  },
  {
    value: "connection-test",
    label: "connection-test",
    hint: "Test database connection",
  },
  {
    value: "reset",
    label: "reset",
    hint: "Reset database (teardown + setup + seed)",
  },
];

const TARGET_NAMES = TARGETS.map((t) => t.value);

// ── Types ────────────────────────────────────────────────────────────

interface Project {
  name: string;
  directory: string;
  relativePath: string;
}

interface ExecutionContext {
  project: Project;
  target: string;
}

class ScriptExecutionError extends Error {
  readonly project: string;
  readonly target: string;
  readonly exitCode?: number;
  override readonly cause?: unknown;

  constructor(
    context: ExecutionContext,
    message: string,
    options?: { exitCode?: number; cause?: unknown },
  ) {
    super(message);
    this.name = "ScriptExecutionError";
    this.project = context.project.name;
    this.target = context.target;
    this.exitCode = options?.exitCode;
    this.cause = options?.cause;
  }
}

const SEQUELIZE_VERBOSE_ENV = {
  SEQUELIZE_LOGGING: "1",
  SEQUELIZE_LOG_QUERY_PARAMETERS: "1",
};

function mergeDebugNamespaces(
  currentValue: string | undefined,
  namespace: string,
): string {
  if (!currentValue || !currentValue.trim()) {
    return namespace;
  }

  const namespaces = currentValue
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (namespaces.includes(namespace)) {
    return currentValue;
  }

  namespaces.push(namespace);
  return namespaces.join(",");
}

function createExecutionEnvironment(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ...SEQUELIZE_VERBOSE_ENV,
    DEBUG: mergeDebugNamespaces(process.env.DEBUG, "sequelize:*"),
  };
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.stack ?? `${error.name}: ${error.message}`;
  }
  return String(error);
}

function logExecutionFailure(
  context: ExecutionContext,
  error: unknown,
): void {
  const header = `${context.project.name}: ${context.target} failed`;
  const detail = `project=${context.project.name} target=${context.target} cwd=${context.project.directory}`;
  const errorText = formatError(error);

  console.error(pc.red(`\n✗ ${header} with an exception`));
  console.error(pc.red(`  Context: ${detail}`));
  console.error(pc.red(`  ${errorText}\n`));

  appendErrorLog(`${header}\n  Context: ${detail}\n  ${errorText}`, context.target);
}

// ── Discovery ────────────────────────────────────────────────────────

async function discoverProjects(): Promise<Project[]> {
  const matches = await glob(PROJECT_GLOB, { cwd: MONOREPO_ROOT });

  return matches
    .sort()
    .map((match) => {
      // fastify_apps/<name>/sequelize/package.json -> <name>
      const segments = match.split("/");
      const name = segments[1]!;
      const directory = resolve(MONOREPO_ROOT, ...segments.slice(0, -1));
      return { name, directory, relativePath: match };
    });
}

// ── Execution ────────────────────────────────────────────────────────

type ExecutionResult = "success" | "skipped";

function readNpmScript(pkgJsonPath: string, target: string): string | undefined {
  const raw = readFileSync(pkgJsonPath, "utf-8");
  const pkg = JSON.parse(raw) as { scripts?: Record<string, string> };
  return pkg.scripts?.[target];
}

async function executeTarget(
  project: Project,
  target: string,
): Promise<ExecutionResult> {
  const context = { project, target };

  // Pre-flight: ensure project has a package.json
  const pkgJsonPath = join(project.directory, "package.json");
  if (!existsSync(pkgJsonPath)) {
    console.log(
      pc.yellow(`\n⚠ ${project.name}: skipped — no package.json`),
    );
    return "skipped";
  }

  // Pre-flight: ensure the target script exists in package.json
  const script = readNpmScript(pkgJsonPath, target);
  if (!script) {
    console.log(
      pc.yellow(`\n⚠ ${project.name}: skipped — no "${target}" script in package.json`),
    );
    return "skipped";
  }

  console.log(
    pc.cyan(`\n▶ Running ${pc.bold(target)} in ${pc.bold(project.name)}\n`),
  );
  console.log(pc.dim(`  $ ${script}`));
  console.log(
    pc.dim(
      `  verbose Sequelize logs enabled (SEQUELIZE_LOGGING=${SEQUELIZE_VERBOSE_ENV.SEQUELIZE_LOGGING}, DEBUG=${mergeDebugNamespaces(process.env.DEBUG, "sequelize:*")})`,
    ),
  );

  try {
    const result = await execa(script, {
      cwd: project.directory,
      shell: true,
      stdio: "inherit",
      reject: false,
      env: createExecutionEnvironment(),
    });

    console.log();
    if (result.exitCode === 0) {
      console.log(pc.green(`✓ ${project.name}: ${target} succeeded`));
      return "success";
    }

    throw new ScriptExecutionError(
      context,
      `${project.name}: ${target} failed (exit code ${result.exitCode})`,
      { exitCode: result.exitCode },
    );
  } catch (error: unknown) {
    logExecutionFailure(context, error);

    if (error instanceof ScriptExecutionError) {
      throw error;
    }

    throw new ScriptExecutionError(
      context,
      `${project.name}: ${target} failed due to an execution exception`,
      { cause: error },
    );
  }
}

// ── Batch Execution ─────────────────────────────────────────────────

interface BatchResult {
  project: Project;
  status: "success" | "skipped" | "failed";
  error?: ScriptExecutionError;
}

async function executeBatchTarget(
  projects: Project[],
  target: string,
): Promise<void> {
  console.log(
    pc.cyan(
      `\n▶ Running ${pc.bold(target)} on all ${projects.length} projects\n`,
    ),
  );

  const results: BatchResult[] = [];

  for (const project of projects) {
    try {
      const status = await executeTarget(project, target);
      results.push({ project, status });
    } catch (error: unknown) {
      const execError =
        error instanceof ScriptExecutionError
          ? error
          : new ScriptExecutionError(
              { project, target },
              `${project.name}: ${target} failed unexpectedly`,
              { cause: error },
            );
      results.push({ project, status: "failed", error: execError });
    }
  }

  // ── Summary ──────────────────────────────────────────────────────
  const succeeded = results.filter((r) => r.status === "success");
  const skipped = results.filter((r) => r.status === "skipped");
  const failed = results.filter((r) => r.status === "failed");

  console.log(pc.cyan("\n── Batch Summary ──────────────────────────────\n"));

  if (succeeded.length > 0) {
    console.log(
      pc.green(`  ✓ ${succeeded.length} succeeded: ${succeeded.map((r) => r.project.name).join(", ")}`),
    );
  }

  if (skipped.length > 0) {
    console.log(
      pc.yellow(`  ⚠ ${skipped.length} skipped: ${skipped.map((r) => r.project.name).join(", ")}`),
    );
  }

  if (failed.length > 0) {
    const failedNames = failed.map((r) => r.project.name).join(", ");
    console.log(pc.red(`  ✗ ${failed.length} failed: ${failedNames}`));

    for (const result of failed) {
      console.error(
        pc.red(`\n    ${result.project.name}: ${result.error!.message}`),
      );
    }

    appendErrorLog(
      `Batch ${target}: ${failed.length} failed [${failedNames}]\n` +
        failed.map((r) => `  ${r.project.name}: ${r.error!.message}`).join("\n"),
      target,
    );

    const logPath = errorLogPathForTarget(target);
    console.log();
    console.log(pc.dim(`  Error log: ${logPath}`));
    console.log();
    process.exit(1);
  }
}

// ── Interactive Mode ─────────────────────────────────────────────────

async function runInteractive(projects: Project[]): Promise<void> {
  p.intro(pc.cyan("Sequelize Manager"));

  const action = await p.select({
    message: "What would you like to do?",
    options: [
      {
        value: "connection-test-all",
        label: "Test all connections",
        hint: "Run connection-test on all projects",
      },
      {
        value: "setup-all",
        label: "Create all tables",
        hint: "Run setup on all projects",
      },
      {
        value: "seed-all",
        label: "Seed all tables",
        hint: "Run seed on all projects",
      },
      {
        value: "reseed-all",
        label: "Reseed all tables",
        hint: "Truncate and re-seed all projects",
      },
      {
        value: "manage",
        label: "Manage a project",
        hint: "Select a project and target",
      },
    ],
  });

  if (p.isCancel(action)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  // ── Batch actions ───────────────────────────────────────────────
  const BATCH_ACTIONS: Record<string, string> = {
    "connection-test-all": "connection-test",
    "setup-all": "setup",
    "seed-all": "seed",
    "reseed-all": "reseed",
  };

  if (action in BATCH_ACTIONS) {
    const target = BATCH_ACTIONS[action]!;

    const confirmed = await p.confirm({
      message: `Run ${pc.bold(target)} on all ${projects.length} projects?`,
    });

    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel("Cancelled.");
      process.exit(0);
    }

    p.outro(`Running ${pc.bold(target)} on all projects…`);
    await executeBatchTarget(projects, target);
    return;
  }

  // ── Manage single project ──────────────────────────────────────
  const projectChoice = await p.select({
    message: "Select a project",
    options: projects.map((proj) => ({
      value: proj,
      label: proj.name,
      hint: proj.relativePath,
    })),
  });

  if (p.isCancel(projectChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const targetChoice = await p.select({
    message: "Select a target",
    options: TARGETS,
  });

  if (p.isCancel(targetChoice)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const confirmed = await p.confirm({
    message: `Run ${pc.bold(targetChoice)} in ${pc.bold(projectChoice.name)}?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Running ${pc.bold(targetChoice)}…`);

  await executeTarget(projectChoice, targetChoice);
}

// ── Main ─────────────────────────────────────────────────────────────

// Strip bare "--" inserted by pnpm between the script and pass-through args,
// so that `pnpm dev -- --list` parses correctly as `--list`.
const argv = process.argv.filter((arg, i) => !(arg === "--" && i >= 2));

async function main() {
  const program = new Command()
    .name("sequelize-manager")
    .description("Manage Sequelize database projects in the monorepo")
    .option("-p, --project <name>", "Project name (non-interactive)")
    .option("-t, --target <target>", `Target: ${TARGET_NAMES.join(", ")}`)
    .option("-l, --list", "List discovered projects and exit")
    .parse(argv);

  const opts = program.opts<{
    project?: string;
    target?: string;
    list?: boolean;
  }>();

  const projects = await discoverProjects();

  if (projects.length === 0) {
    console.error(pc.red("No Sequelize projects found."));
    process.exit(1);
  }

  // --list
  if (opts.list) {
    console.log(pc.cyan("Discovered Sequelize projects:\n"));
    for (const proj of projects) {
      console.log(`  ${pc.bold(proj.name)}  ${pc.dim(proj.relativePath)}`);
    }
    return;
  }

  // Non-interactive
  if (opts.project || opts.target) {
    if (!opts.project || !opts.target) {
      console.error(
        pc.red("Both --project and --target are required for non-interactive mode."),
      );
      process.exit(1);
    }

    if (!TARGET_NAMES.includes(opts.target)) {
      console.error(
        pc.red(`Invalid target "${opts.target}". Valid targets: ${TARGET_NAMES.join(", ")}`),
      );
      process.exit(1);
    }

    const project = projects.find((proj) => proj.name === opts.project);
    if (!project) {
      console.error(
        pc.red(
          `Project "${opts.project}" not found. Available: ${projects.map((proj) => proj.name).join(", ")}`,
        ),
      );
      process.exit(1);
    }

    await executeTarget(project, opts.target);
    return;
  }

  // Interactive
  await runInteractive(projects);
}

main().catch((err) => {
  const errorText = formatError(err);
  const causeText =
    err instanceof ScriptExecutionError && err.cause
      ? `\nCaused by: ${formatError(err.cause)}`
      : "";

  console.error(pc.red("sequelize-manager failed with an unhandled error"));
  console.error(pc.red(errorText));
  if (causeText) {
    console.error(pc.red(causeText));
  }
  const target = err instanceof ScriptExecutionError ? err.target : undefined;
  const logPath = target ? errorLogPathForTarget(target) : ERROR_LOG_PATH;
  console.error(pc.dim(`\nError log: ${logPath}`));

  appendErrorLog(`Unhandled error: ${errorText}${causeText}`, target);
  process.exit(1);
});
