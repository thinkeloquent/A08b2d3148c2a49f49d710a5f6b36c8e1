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
import { checkAllUserStatuses } from "./check-user-status.mjs";
import { buildReport } from "../reporting/report-builder.mjs";
import { writeJsonReport } from "../reporting/writers/json-writer.mjs";
import { writeCsvReport } from "../reporting/writers/csv-writer.mjs";

export class GitHubUserStatus {
  constructor(options) {
    this.config = normalizeConfig(options);

    // Mutable state
    this.users = [];
    this.errors = [];
    this.apiCalls = [];
    this.totalFetched = { value: 0 };
    this.cancelled = { value: false };

    // Logger
    const { log, output } = createLogger(this.config);
    const { debugLog } = createDebugLogger(this.config);
    this.log = log;
    this.output = output;
    this.debugLog = debugLog;

    // GitHub client
    const { octokit, coreLimiter, searchLimiter, makeRequest, baseUrl } =
      createGitHubClient(this.config, {
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
      makeRequest: this.makeRequest,
      coreLimiter,
      searchLimiter,
      log: this.log,
      output: this.output,
      debugLog: this.debugLog,
      apiCalls: this.apiCalls,
      errors: this.errors,
      totalFetched: this.totalFetched,
      cancelled: this.cancelled,
    };

    // Stream writer for crash-safe JSONL output
    const streamFilename =
      this.config.filename || "github-user-status";
    this.stream = new StreamWriter({
      outputDir: this.config.outputDir,
      filename: streamFilename,
      toolName: "github-user-status",
      toolConfig: { ...this.config },
    });
    this.ctx.stream = this.stream;

    // SIGINT handler
    process.on("SIGINT", async () => {
      this.log("\nGracefully stopping...", "warn");
      this.cancelled.value = true;
      await this.savePartialResults();
      process.exit(0);
    });

    // Load external data if provided
    if (this.config.loadData) {
      this.loadExternalData();
    }

    this.log("GitHubUserStatus initialized");
  }

  async loadExternalData() {
    try {
      const fs = await import("fs/promises");
      const data = await fs.readFile(this.config.loadData, "utf8");
      this.LOAD_DATA = JSON.parse(data);
      this.log(`External data loaded from ${this.config.loadData}`);
    } catch (error) {
      this.log(`Failed to load external data: ${error.message}`, "error");
      process.exit(1);
    }
  }

  async savePartialResults() {
    this.stream.finalize(false);
    if (this.users.length > 0) {
      this.log("Saving partial results...", "warn");
      await this.generateReport();
    }
  }

  async generateReport() {
    this.output(chalk.blue.bold("Report Generation"));

    await ensureDir(this.config.outputDir);

    const filename = this.config.filename || "github-user-status";
    const reportPath = path.join(
      this.config.outputDir,
      `${filename}.${this.config.format}`
    );

    const report = buildReport(this.users, this.config, {
      totalFetched: this.totalFetched.value,
      cancelled: this.cancelled.value,
    });

    if (this.config.format === "json") {
      await writeJsonReport(report, reportPath);
    } else {
      await writeCsvReport(this.users, reportPath);
    }

    this.output(`Report saved: ${chalk.green(reportPath)}`);

    if (this.config.debug) {
      const auditPath = path.join(
        this.config.outputDir,
        `${filename}.audit.json`
      );
      await writeAuditReport(
        this.apiCalls,
        this.errors,
        this.config,
        auditPath,
        {
          totalFetched: this.totalFetched.value,
          cancelled: this.cancelled.value,
        }
      );
      this.output(`Audit file saved: ${chalk.green(auditPath)}`);
    }
  }

  async showRateLimit() {
    try {
      const data = await this.makeRequest("GET /rate_limit");
      const { resources } = data;

      this.output(chalk.blue.bold("\nGitHub API Rate Limit Status:"));
      this.output(
        `   Core API - Limit: ${chalk.green.bold(
          resources.core.limit
        )}, Remaining: ${chalk.green.bold(
          resources.core.remaining
        )}, Used: ${chalk.yellow.bold(resources.core.used)}`
      );
      this.output(
        `   Search API - Limit: ${chalk.green.bold(
          resources.search.limit
        )}, Remaining: ${chalk.green.bold(
          resources.search.remaining
        )}, Used: ${chalk.yellow.bold(resources.search.used)}`
      );
      this.output(
        `   Resets at: ${chalk.gray(
          new Date(resources.core.reset * 1000).toLocaleString()
        )}`
      );

      if (resources.core.remaining < 10) {
        this.log("Core API rate limit is low!", "warn");
      }
      if (resources.search.remaining < 5) {
        this.log("Search API rate limit is low!", "warn");
      }
    } catch (error) {
      this.log("Failed to fetch rate limit information", "error");
    }
  }

  async run() {
    try {
      this.output(
        chalk.blue.bold("Starting GitHub user status analysis...\n")
      );

      this.users = await checkAllUserStatuses(this);
      await this.generateReport();

      // API usage summary
      this.output("");
      this.output(chalk.blue.bold("GitHub API Usage Summary:"));
      this.output("\u2500".repeat(60));
      this.output(
        `Total API calls: ${chalk.green(this.apiCalls.length)}`
      );
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

      this.stream.finalize(true);
      await this.showRateLimit();

      this.output("");
      this.output(chalk.green.bold("Analysis completed successfully!"));

      // Final report summary
      const activeCount = this.users.filter((u) => u.status === "Active").length;
      const suspendedCount = this.users.filter((u) => u.status === "Suspended").length;
      const notFoundCount = this.users.filter((u) => u.status === "Not Found / Suspended").length;
      const errorCount = this.users.filter((u) => u.status === "Error").length;

      this.output("");
      this.output(chalk.blue.bold("Final Report Summary"));
      this.output("\u2500".repeat(60));
      this.output(
        `Total Users Checked    : ${chalk.green(this.users.length)}`
      );
      this.output(
        `Active Users           : ${chalk.green(activeCount)}`
      );
      this.output(
        `Suspended Users        : ${chalk.yellow(suspendedCount)}`
      );
      this.output(
        `Not Found Users        : ${chalk.red(notFoundCount)}`
      );
      this.output(
        `Error Users            : ${chalk.red(errorCount)}`
      );
      this.output(
        `Success Rate           : ${chalk.green(
          this.users.length > 0
            ? (
                ((this.users.length - errorCount) / this.users.length) *
                100
              ).toFixed(1)
            : 0
        )}%`
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
      this.output(
        `Report Location        : ${chalk.green(
          path.join(
            this.config.outputDir,
            `${this.config.filename || "github-user-status"}.${this.config.format}`
          )
        )}`
      );
      this.output("\u2500".repeat(60));
    } catch (error) {
      this.stream.finalize(false);
      try {
        await ensureDir(this.config.outputDir);
        const errFilename = this.config.filename || "github-user-status";
        writeFileSync(
          path.join(
            this.config.outputDir,
            `dashboard-${errFilename}.errors.json`
          ),
          JSON.stringify({
            errors: [error.message],
            inputs: {
              ...this.config,
              userProfile: `https://${
                process.env.GITHUB_HOSTNAME || "github.com"
              }/${this.config.searchUser}?tab=overview`,
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
