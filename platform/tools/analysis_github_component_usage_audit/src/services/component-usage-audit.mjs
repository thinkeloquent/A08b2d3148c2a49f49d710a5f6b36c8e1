import chalk from "chalk";
import path from "path";
import { writeFileSync } from "fs";
import { normalizeConfig } from "../config/normalize.mjs";
import {
  createGitHubClient,
  createLogger,
  createDebugLogger,
  ensureDir,
  writeAuditReport,
  StreamWriter,
} from "@internal/github-api-sdk-cli";

// Import reusable modules from the polyglot layer
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
    this.totalFetched = { value: 0 };
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
      baseUrl,
    } = createGitHubClient(this.config, {
      log: this.log,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
    });
    this.octokit = octokit;
    this.makeRequest = makeRequest;
    this.baseUrl = baseUrl;

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
      totalFetched: this.totalFetched,
      cancelled: this.cancelled,
      cache: this.cache,
    };

    // Stream writer for crash-safe JSONL output
    const streamFilename =
      this.config.filename ||
      `component-audit-${this.config.componentName || "unknown"}`;
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "component-usage-audit",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

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
    this.output(chalk.blue.bold("GitHub Component Usage Audit"));

    const params = [
      ["Component", this.config.componentName],
      ["Min stars", String(this.config.minStars)],
      ["Max pages", `${this.config.maxPages} (${this.config.maxPages * 100} results max)`],
      ["Min file size", `${this.config.minFileSize} bytes`],
      ["Output format", this.config.format.toUpperCase()],
      ["Output directory", this.config.outputDir],
      [
        "Total records limit",
        this.config.totalRecords === 0
          ? "No limit"
          : String(this.config.totalRecords),
      ],
      ["API delay", `${this.config.delay}s`],
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

  /**
   * Resolve org/user config into an array of individual owner qualifiers.
   * Each qualifier is a single "org:foo" or "user:bar" string.
   * GitHub's /search/code only supports one org:/user: qualifier per query,
   * so callers must issue separate searches per qualifier.
   *
   * @returns {Promise<string[]>} Array of individual qualifiers, or empty array for unscoped.
   */
  async resolveOwnerScopes() {
    const { org, searchUser } = this.config;
    const qualifiers = [];

    // Split org on commas → produce ["org:foo", "org:bar"]
    if (org) {
      const orgs = org
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const o of orgs) {
        qualifiers.push(`org:${o}`);
      }
    }

    // Split searchUser on commas → detect type for each → produce "user:x" or "org:y"
    if (searchUser) {
      const users = searchUser
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s && s !== "_github_sdk_api_audit_");
      for (const u of users) {
        try {
          const userData = await this.makeRequest(`GET /users/${u}`);
          const qualifier = userData.type === "Organization" ? "org" : "user";
          this.log(`Detected ${u} as ${userData.type} → ${qualifier}:${u}`);
          qualifiers.push(`${qualifier}:${u}`);
        } catch (err) {
          this.log(`Failed to detect account type for ${u}: ${err.message}`, "warn");
        }
      }
    }

    return qualifiers;
  }

  async processSearchResults() {
    this.output(chalk.blue.bold("Search Phase"));

    const { componentName, maxPages, minFileSize, minStars } = this.config;
    const ownerScopes = await this.resolveOwnerScopes();

    // GitHub /search/code supports only one org:/user: qualifier per query.
    // Run a separate search for each owner scope and merge results.
    const scopes = ownerScopes.length > 0 ? ownerScopes : [undefined];
    const seenFiles = new Set();

    for (const ownerScope of scopes) {
      for await (const item of searchCode(this.ctx, { componentName, maxPages, minFileSize, ownerScope })) {
        if (this.cancelled.value) break;

        const { repository, path: filePath } = item;
        const owner = repository.owner?.login || repository.full_name?.split("/")[0];
        const repo = repository.name;

        // Deduplicate across owner scopes (same file may appear in overlapping searches)
        const fileKey = `${owner}/${repo}/${filePath}`;
        if (seenFiles.has(fileKey)) continue;
        seenFiles.add(fileKey);

        this.stats.totalSearchResults++;
        this.totalFetched.value++;

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
        if (snippets.length > 0) this.ctx.stream?.appendBatch("usage", snippets.map(s => ({ repository_name: `${owner}/${repo}`, file_path: filePath, code_snippet: s })));
        if (refs.length > 0) this.ctx.stream?.appendBatch("reference", refs.map(r => ({ repository_name: `${owner}/${repo}`, file_path: filePath, reference: r })));
      }
      if (this.cancelled.value) break;
    }
  }

  async saveResults() {
    this.stream.finalize(false);
    await ensureDir(this.config.outputDir);

    const timestamp = new Date().toISOString().split("T")[0];
    const baseFilename =
      this.config.filename ||
      `component-audit-${this.config.componentName}-${timestamp}`;

    const report = buildReport(this.config, this.usages, this.references, this.stats, {
      totalFetched: this.totalFetched.value,
      cancelled: this.stats.cancelled,
    });

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
        {
          totalFetched: this.totalFetched.value,
          cancelled: this.stats.cancelled,
        },
      );
      this.output(`Audit file saved: ${chalk.green(auditPath)}`);
    }

    return { report, outputPath };
  }

  async showRateLimit() {
    try {
      const data = await this.makeRequest("GET /rate_limit");
      const { rate } = data;

      this.output(chalk.blue.bold("\nGitHub API Rate Limit Status:"));
      this.output(`   Limit: ${chalk.green.bold(rate.limit)}`);
      this.output(`   Remaining: ${chalk.green.bold(rate.remaining)}`);
      this.output(`   Used: ${chalk.yellow.bold(rate.used)}`);
      this.output(
        `   Resets at: ${chalk.gray(
          new Date(rate.reset * 1000).toLocaleString()
        )}`
      );

      if (rate.remaining < 10) {
        this.log("Rate limit is low!", "warn");
      }
    } catch (error) {
      this.log("Failed to fetch rate limit information", "error");
    }
  }

  displaySummary(report, outputPath) {
    this.output("");
    this.output(chalk.blue.bold("GitHub API Usage Summary:"));
    this.output("\u2500".repeat(60));
    this.output(`Total API calls: ${chalk.green(this.apiCalls.length)}`);
    this.output(
      `API paths used: ${chalk.green(
        [
          ...new Set(
            this.apiCalls.map((call) => {
              try {
                return new URL(
                  `${this.baseUrl}${call.url.split(" ")[1]}`
                ).pathname;
              } catch {
                return call.url.split(" ")[1] || call.url;
              }
            })
          ),
        ].join(", ")
      )}`
    );

    this.output("");
    this.output(chalk.green.bold("Component usage audit completed!"));

    this.output("");
    this.output(chalk.blue.bold("Final Report Summary"));
    this.output("\u2500".repeat(60));
    this.output(
      `Component              : ${chalk.green(this.config.componentName)}`
    );
    this.output(
      `Search results scanned : ${chalk.green(this.stats.totalSearchResults)}`
    );
    this.output(
      `Repos validated        : ${chalk.green(this.stats.reposValidated)}`
    );
    this.output(
      `Repos skipped          : ${chalk.yellow(this.stats.reposSkipped)}`
    );
    this.output(
      `Files processed        : ${chalk.green(this.stats.filesProcessed)}`
    );
    this.output(
      `Usages found           : ${chalk.green.bold(this.usages.length)}`
    );
    this.output(
      `References found       : ${chalk.green(this.references.length)}`
    );
    this.output(
      `Records Fetched        : ${chalk.green(
        this.totalFetched.value
      )}${
        this.config.totalRecords > 0
          ? `/${this.config.totalRecords}`
          : ""
      }`
    );
    this.output(`Report Location        : ${chalk.green(outputPath)}`);
    this.output("\u2500".repeat(60));
  }

  async run() {
    try {
      this.displayInitialization();

      await this.processSearchResults();
      const { report, outputPath } = await this.saveResults();

      this.stream.finalize(true);
      await this.showRateLimit();
      this.displaySummary(report, outputPath);

      return { success: true, report, outputPath };
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const errFilename =
          this.config.filename ||
          `component-audit-${this.config.componentName}`;
        writeFileSync(
          path.join(
            this.config.outputDir,
            `dashboard-${errFilename}.errors.json`
          ),
          JSON.stringify({
            errors: [error.message],
            inputs: {
              ...this.config,
            },
          })
        );
      } catch {
        // Best-effort error file write
      }
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
