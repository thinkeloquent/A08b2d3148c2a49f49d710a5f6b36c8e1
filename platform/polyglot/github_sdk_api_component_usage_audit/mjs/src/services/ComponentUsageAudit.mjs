/**
 * Component Usage Audit Service
 *
 * Main orchestrator class that executes the full pipeline:
 *   search → validate → fetch → extract → report
 */

import chalk from "chalk";
import path from "path";
import { normalizeConfig } from "../config/normalize.mjs";
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
  ensureDir,
  writeAuditReport,
} from "@internal/github-api-sdk-cli";
import { searchCode } from "../github/endpoints/code-search.mjs";
import { fetchRepoMeta } from "../github/endpoints/repo-meta.mjs";
import { fetchRawContent } from "../github/endpoints/raw-content.mjs";
import { extractJsxUsages, extractReferences } from "../analysis/jsx-extractor.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";

export class ComponentUsageAudit {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.usages = [];
    this.references = [];
    this.errors = [];
    this.apiCalls = [];
    this.cancelled = { value: false };
    this.cache = new Map();
    this.stats = {
      totalSearchResults: 0,
      reposValidated: 0,
      reposSkipped: 0,
      filesProcessed: 0,
      cancelled: false,
    };

    // Logger
    const { log, output } = createLogger(this.config);
    const { debugLog } = createDebugLogger(this.config);
    this.log = log;
    this.output = output;
    this.debugLog = debugLog;

    // GitHub client
    const {
      octokit,
      coreLimiter,
      searchLimiter,
      makeRequest,
      makeSearchRequest,
    } = createGitHubClient(this.config, {
      log: this.log,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
    });
    this.octokit = octokit;

    // Build shared context for sub-modules
    this.ctx = {
      config: this.config,
      makeRequest,
      makeSearchRequest,
      coreLimiter,
      searchLimiter,
      octokit,
      log: this.log,
      output: this.output,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
      errors: this.errors,
      cancelled: this.cancelled,
      cache: this.cache,
    };

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      this.stats.cancelled = true;
      await this.saveResults();
      process.exit(0);
    });

    this.log("ComponentUsageAudit initialized");
  }

  displayInitialization() {
    this.output(chalk.blue.bold("Component Usage Audit"));

    const params = [
      ["Component", this.config.componentName],
      ["Min stars", String(this.config.minStars)],
      ["Max pages", `${this.config.maxPages} (${this.config.maxPages * 100} results max)`],
      ["Min file size", `${this.config.minFileSize} bytes`],
      ["Output format", this.config.format.toUpperCase()],
      ["Output directory", this.config.outputDir],
      ["Verbose mode", this.config.verbose ? "Enabled" : "Disabled"],
      ["Debug mode", this.config.debug ? "Enabled" : "Disabled"],
    ];

    const maxLabelLength = Math.max(...params.map(([label]) => label.length));

    params.forEach(([label, value]) => {
      const padding = "\u2500".repeat(maxLabelLength - label.length);
      this.output(`${label} ${padding} ${value}`);
    });

    this.output(
      chalk.blue.bold("\nStarting component usage audit...\n"),
    );
  }

  async processSearchResults() {
    this.output(chalk.blue.bold("Search Phase"));

    const { componentName, maxPages, minFileSize, minStars } = this.config;

    for await (const item of searchCode(this.ctx, { componentName, maxPages, minFileSize })) {
      if (this.cancelled.value) break;

      this.stats.totalSearchResults++;

      const { repository, path: filePath } = item;
      const owner = repository.owner?.login || repository.full_name?.split("/")[0];
      const repo = repository.name;

      if (!owner || !repo) {
        this.log(`Skipping result with missing owner/repo: ${JSON.stringify(item)}`, "warn");
        continue;
      }

      // Two-tier validation: check repo metadata
      try {
        const meta = await fetchRepoMeta(this.ctx, { owner, repo, minStars });
        if (!meta.valid) {
          this.stats.reposSkipped++;
          this.log(`Skipped ${owner}/${repo} (stars: ${meta.repo.stargazers_count}, archived: ${meta.repo.archived})`);
          continue;
        }
        this.stats.reposValidated++;
      } catch (err) {
        this.log(`Failed to validate ${owner}/${repo}: ${err.message}`, "warn");
        this.errors.push({ type: "repo-meta", owner, repo, error: err.message });
        continue;
      }

      // Fetch raw content
      let content;
      try {
        content = await fetchRawContent(this.ctx, { owner, repo, path: filePath });
        this.stats.filesProcessed++;
      } catch (err) {
        this.log(`Failed to fetch content for ${owner}/${repo}/${filePath}: ${err.message}`, "warn");
        this.errors.push({ type: "raw-content", owner, repo, path: filePath, error: err.message });
        continue;
      }

      const mimetype = mimeFromPath(filePath);

      // Extract JSX usages
      const snippets = extractJsxUsages(content, componentName);
      for (const snippet of snippets) {
        this.usages.push({
          repository_name: `${owner}/${repo}`,
          file_path: filePath,
          mimetype,
          code_snippet: snippet,
        });
      }

      // Extract non-JSX references (type declarations, assignments, namespace access)
      const refs = extractReferences(content, componentName);
      for (const ref of refs) {
        this.references.push({
          repository_name: `${owner}/${repo}`,
          file_path: filePath,
          mimetype,
          reference: ref,
        });
      }

      if (snippets.length > 0 || refs.length > 0) {
        this.log(`Found ${snippets.length} usage(s), ${refs.length} reference(s) in ${owner}/${repo}/${filePath}`);
      }
    }
  }

  async saveResults() {
    await ensureDir(this.config.outputDir);

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `component-audit-${this.config.componentName}-${timestamp}`;

    const report = buildReport(this.config, this.usages, this.references, this.stats);

    const outputPath = path.join(this.config.outputDir, `${baseFilename}.json`);
    await writeJsonReport(report, outputPath);
    this.output(`Report saved: ${chalk.green(outputPath)}`);

    // Audit file in debug mode
    if (this.config.debug) {
      const auditPath = path.join(this.config.outputDir, `${baseFilename}.audit.json`);
      await writeAuditReport(
        this.apiCalls,
        this.errors,
        this.config,
        auditPath,
        { totalFetched: this.stats.totalSearchResults, cancelled: this.stats.cancelled },
      );
      this.output(`Audit file saved: ${chalk.green(auditPath)}`);
    }

    return { report, outputPath };
  }

  displaySummary() {
    this.output("");
    this.output(chalk.blue.bold("Audit Summary"));
    this.output("\u2500".repeat(60));
    this.output(`Component              : ${chalk.green(this.config.componentName)}`);
    this.output(`Search results scanned : ${chalk.green(this.stats.totalSearchResults)}`);
    this.output(`Repos validated        : ${chalk.green(this.stats.reposValidated)}`);
    this.output(`Repos skipped          : ${chalk.yellow(this.stats.reposSkipped)}`);
    this.output(`Files processed        : ${chalk.green(this.stats.filesProcessed)}`);
    this.output(`Usages found           : ${chalk.green.bold(this.usages.length)}`);
    this.output(`References found       : ${chalk.green(this.references.length)}`);
    this.output(`API calls made         : ${chalk.green(this.apiCalls.length)}`);
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();
      await this.processSearchResults();
      const { report, outputPath } = await this.saveResults();
      this.displaySummary();

      return { success: true, report, outputPath };
    } catch (error) {
      this.log(`Error: ${error.message}`, "error");
      if (this.config.debug) {
        this.log(error.stack, "error");
      }
      process.exit(1);
    }
  }
}

const EXT_MIME = {
  ".tsx": "text/tsx",
  ".jsx": "text/jsx",
  ".ts": "text/typescript",
  ".mts": "text/typescript",
  ".cts": "text/typescript",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".cjs": "text/javascript",
};

function mimeFromPath(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (filePath.endsWith(".d.ts") || filePath.endsWith(".d.mts") || filePath.endsWith(".d.cts")) {
    return "text/typescript";
  }
  return EXT_MIME[ext] || "text/plain";
}
