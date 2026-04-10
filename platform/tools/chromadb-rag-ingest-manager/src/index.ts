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
const MAKEFILE = "Makefile.chromadb-rag";

// ── Types ────────────────────────────────────────────────────────────

interface FrameworkStatus {
  slug: string;
  name: string;
  enabled: boolean;
  auto_ingest: boolean;
  ingested: boolean;
  chunk_count: number;
  size_bytes: number;
  size_human: string;
  persist_directory: string;
  source_directory: string;
  version: string | null;
}

interface MakeTarget {
  value: string;
  label: string;
  hint: string;
  needsSlug?: boolean;
}

interface TargetCategory {
  name: string;
  targets: MakeTarget[];
}

// ── Target Definitions ──────────────────────────────────────────────

const CATEGORIES: TargetCategory[] = [
  {
    name: "Status & Info",
    targets: [
      { value: "status", label: "status", hint: "Human-readable status table" },
      { value: "status-json", label: "status-json", hint: "JSON output for tooling" },
      { value: "info", label: "info", hint: "Single-framework JSON detail", needsSlug: true },
    ],
  },
  {
    name: "Ingest",
    targets: [
      { value: "ingest-all", label: "ingest-all", hint: "Ingest all enabled auto_ingest frameworks" },
      { value: "ingest", label: "ingest", hint: "Ingest a specific framework", needsSlug: true },
    ],
  },
  {
    name: "Cleanup",
    targets: [
      { value: "cleanup-all", label: "cleanup-all", hint: "Remove all data/chroma/*/" },
      { value: "cleanup", label: "cleanup", hint: "Remove data/chroma/{SLUG}/", needsSlug: true },
    ],
  },
  {
    name: "Re-ingest",
    targets: [
      { value: "reingest-all", label: "reingest-all", hint: "cleanup-all + ingest-all" },
      { value: "reingest", label: "reingest", hint: "cleanup + ingest for one framework", needsSlug: true },
    ],
  },
  {
    name: "Diagnostics",
    targets: [
      { value: "test-embedding", label: "test-embedding", hint: "Test embedding endpoint connectivity" },
    ],
  },
];

const ALL_TARGETS = CATEGORIES.flatMap((c) => c.targets);
const TARGET_NAMES = ALL_TARGETS.map((t) => t.value);

// ── Framework Fetching ──────────────────────────────────────────────

async function fetchFrameworks(): Promise<FrameworkStatus[]> {
  const result = await execa("make", ["-f", MAKEFILE, "status-json"], {
    cwd: MONOREPO_ROOT,
    reject: false,
  });

  if (result.exitCode !== 0) {
    console.error(pc.red("Failed to fetch framework status:"));
    console.error(result.stderr);
    return [];
  }

  try {
    return JSON.parse(result.stdout) as FrameworkStatus[];
  } catch {
    console.error(pc.red("Failed to parse framework status JSON"));
    return [];
  }
}

// ── Rich Output Renderers ───────────────────────────────────────────

function renderStatusTable(frameworks: FrameworkStatus[]): void {
  if (frameworks.length === 0) {
    console.log(pc.yellow("\n  No frameworks found.\n"));
    return;
  }

  const slugW = Math.max(4, ...frameworks.map((f) => f.slug.length));
  const nameW = Math.max(4, ...frameworks.map((f) => f.name.length));
  const chunksW = Math.max(6, ...frameworks.map((f) => String(f.chunk_count || "—").length));
  const sizeW = Math.max(4, ...frameworks.map((f) => f.size_human.length));

  const header = [
    "Slug".padEnd(slugW),
    "Name".padEnd(nameW),
    "Enabled",
    "Auto",
    "Ingested",
    "Chunks".padEnd(chunksW),
    "Size".padEnd(sizeW),
  ].join("  ");

  const sep = [
    "-".repeat(slugW),
    "-".repeat(nameW),
    "-".repeat(7),
    "-".repeat(4),
    "-".repeat(8),
    "-".repeat(chunksW),
    "-".repeat(sizeW),
  ].join("  ");

  console.log(`\n  ${pc.bold(header)}`);
  console.log(`  ${pc.dim(sep)}`);

  for (const fw of frameworks) {
    const enabled = fw.enabled ? pc.green("yes") : pc.red("no ");
    const auto = fw.auto_ingest ? pc.green("yes") : pc.dim("no ");
    const ingested = fw.ingested ? pc.green("yes     ") : pc.yellow("no      ");
    const chunks = fw.chunk_count > 0
      ? pc.cyan(String(fw.chunk_count).padEnd(chunksW))
      : pc.dim("—".padEnd(chunksW));
    const size = fw.ingested ? pc.cyan(fw.size_human.padEnd(sizeW)) : pc.dim("—".padEnd(sizeW));
    console.log(
      `  ${fw.slug.padEnd(slugW)}  ${fw.name.padEnd(nameW)}  ${enabled}    ${auto}  ${ingested}  ${chunks}  ${size}`,
    );
  }

  const ingested = frameworks.filter((f) => f.ingested).length;
  const totalBytes = frameworks.reduce((sum, f) => sum + f.size_bytes, 0);
  const totalHuman = humanSize(totalBytes);
  console.log(
    `\n  ${pc.dim(`${ingested}/${frameworks.length} ingested, total size: ${totalHuman}`)}\n`,
  );
}

function renderInfo(frameworks: FrameworkStatus[]): void {
  if (frameworks.length === 0) {
    console.log(pc.yellow("\n  Framework not found.\n"));
    return;
  }
  const fw = frameworks[0]!;
  console.log(`\n  ${pc.bold(pc.cyan(fw.name))} ${pc.dim(`(${fw.slug})`)}`);
  console.log(`  ${"─".repeat(40)}`);
  console.log(`  Version:          ${fw.version ?? pc.dim("—")}`);
  console.log(`  Enabled:          ${fw.enabled ? pc.green("yes") : pc.red("no")}`);
  console.log(`  Auto-ingest:      ${fw.auto_ingest ? pc.green("yes") : pc.dim("no")}`);
  console.log(`  Ingested:         ${fw.ingested ? pc.green("yes") : pc.yellow("no")}`);
  console.log(`  Chunks:           ${fw.chunk_count > 0 ? pc.cyan(String(fw.chunk_count)) : pc.dim("—")}`);
  console.log(`  Size:             ${fw.ingested ? pc.cyan(fw.size_human) : pc.dim("—")}`);
  console.log(`  Persist dir:      ${pc.dim(fw.persist_directory)}`);
  console.log(`  Source dir:       ${pc.dim(fw.source_directory)}`);
  console.log();
}

function humanSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

// ── Execution ────────────────────────────────────────────────────────

async function executeMakeTarget(
  target: string,
  slug?: string,
): Promise<void> {
  const args = ["-f", MAKEFILE, target];
  if (slug) args.push(`SLUG=${slug}`);
  const display = ["make", ...args].join(" ");

  // For status/info targets, capture output and render it ourselves
  if (target === "status") {
    const frameworks = await fetchFrameworks();
    renderStatusTable(frameworks);
    return;
  }

  if (target === "info" && slug) {
    const result = await execa("make", ["-f", MAKEFILE, "info", `SLUG=${slug}`], {
      cwd: MONOREPO_ROOT,
      reject: false,
    });
    if (result.exitCode !== 0) {
      console.log(pc.red(`\nFailed to fetch info for ${slug}`));
      return;
    }
    try {
      const frameworks = JSON.parse(result.stdout) as FrameworkStatus[];
      renderInfo(frameworks);
    } catch {
      console.log(result.stdout);
    }
    return;
  }

  console.log(pc.cyan(`\n▶ Running ${pc.bold(display)}\n`));

  const result = await execa("make", args, {
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

// ── Framework Selector ──────────────────────────────────────────────

async function promptSlug(frameworks: FrameworkStatus[]): Promise<string | null> {
  if (frameworks.length === 0) {
    console.log(pc.red("No frameworks available."));
    return null;
  }

  const choice = await p.select({
    message: "Select a framework",
    options: frameworks.map((fw) => ({
      value: fw.slug,
      label: fw.name,
      hint: fw.ingested
        ? `${fw.slug} — ${fw.chunk_count} chunks (${fw.size_human})`
        : `${fw.slug} — not ingested`,
    })),
  });

  if (p.isCancel(choice)) return null;
  return choice;
}

// ── Interactive Mode ─────────────────────────────────────────────────

async function runInteractive(): Promise<void> {
  p.intro(pc.cyan("ChromaDB RAG Ingest Manager"));

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

  let slug: string | undefined;
  if (targetChoice.needsSlug) {
    const frameworks = await fetchFrameworks();
    const selected = await promptSlug(frameworks);
    if (selected === null) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    slug = selected;
  }

  const paramStr = slug ? ` SLUG=${slug}` : "";
  const display = `make -f ${MAKEFILE} ${targetChoice.value}${paramStr}`;

  const confirmed = await p.confirm({
    message: `Run ${pc.bold(display)}?`,
  });

  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  p.outro(`Running ${pc.bold(targetChoice.value)}…`);

  await executeMakeTarget(targetChoice.value, slug);
}

// ── List Targets ─────────────────────────────────────────────────────

function listTargets(): void {
  console.log(pc.cyan("Available ChromaDB RAG Ingest Targets:\n"));
  for (const cat of CATEGORIES) {
    console.log(pc.green(`  ${cat.name}:`));
    for (const t of cat.targets) {
      const paramHint = t.needsSlug ? pc.dim(" [SLUG]") : "";
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
    .name("chromadb-rag-ingest-manager")
    .description("Manage RAG ingestion in the monorepo")
    .option("-l, --list", "List available targets and exit")
    .option("-t, --target <name>", "Run a target directly (skip prompts)")
    .option("-s, --slug <slug>", "Framework slug (for targets that need one)")
    .parse(argv);

  const opts = program.opts<{
    list?: boolean;
    target?: string;
    slug?: string;
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

    if (target.needsSlug && !opts.slug) {
      console.error(
        pc.red(`Target "${target.value}" requires --slug. Example:`),
      );
      console.error(
        pc.dim(`  chromadb-rag-ingest-manager --target ${target.value} --slug ant-design`),
      );
      process.exit(1);
    }

    await executeMakeTarget(opts.target, opts.slug);
    return;
  }

  // Interactive
  await runInteractive();
}

main().catch((err) => {
  console.error(pc.red(String(err)));
  process.exit(1);
});
