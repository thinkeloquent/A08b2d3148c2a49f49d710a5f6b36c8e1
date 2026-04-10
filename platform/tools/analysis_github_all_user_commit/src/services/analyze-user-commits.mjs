import chalk from "chalk";
import { CLIProgressHelper } from "@internal/cli-progressor";
import {
  delay,
  checkTotalRecordsLimit,
  validateUser,
} from "@internal/github-api-sdk-cli";
import { getPullRequestCommits } from "../github/endpoints/pull-requests.mjs";
import { searchDirectCommits } from "./search-direct-commits.mjs";
import { searchPRs } from "./search-prs.mjs";

/**
 * Main analysis orchestration: validates user, searches commits, searches PRs, merges results.
 * @param {object} service - AllUserCommit instance (provides config and ctx)
 * @returns {Promise<Array>} commits array
 */
export async function analyzeUserCommits(service) {
  const { config, ctx } = service;
  const { makeRequest, searchLimiter, log, output, cancelled, totalFetched, errors } =
    ctx;

  output(chalk.blue.bold("Initialization"));

  // Display configuration
  output(
    `${chalk.cyan("Parameter")}            ${chalk.cyan("Value")}`
  );
  output("\u2500".repeat(50));
  output(
    `Search user       ${chalk.green(config.searchUser)}`
  );

  if (!config.ignoreDateRange && config.start && config.end) {
    output(
      `Date range        ${chalk.green(config.start)} to ${chalk.green(
        config.end
      )}`
    );
  } else {
    output(`Date range        ${chalk.yellow("All time")}`);
  }

  output(
    `Organization      ${chalk.green(config.org || "All organizations")}`
  );
  output(
    `Repositories      ${chalk.green(config.repo || "All repositories")}`
  );
  output(
    `Output format     ${chalk.green(config.format.toUpperCase())}`
  );
  output(`Output directory  ${chalk.green(config.outputDir)}`);
  output(
    `Include details   ${
      config.includeDetails ? chalk.green("Enabled") : chalk.gray("Disabled")
    }`
  );
  output(
    `Verbose mode      ${
      config.verbose ? chalk.green("Enabled") : chalk.gray("Disabled")
    }`
  );
  output(
    `Debug mode        ${
      config.debug ? chalk.green("Enabled") : chalk.gray("Disabled")
    }`
  );
  output(
    `Total records limit ${
      config.totalRecords > 0
        ? chalk.green(config.totalRecords)
        : chalk.yellow("No limit")
    }`
  );
  output("");

  // Validate user
  output(chalk.blue.bold("User Validation"));
  await validateUser(makeRequest, config.searchUser, { log });
  output("");

  // Search for direct commits using repository-based approach
  output(chalk.blue.bold("Repository-Based Commit Search"));
  const dateRange =
    !config.ignoreDateRange && config.start && config.end
      ? { start: config.start, end: config.end }
      : null;

  const directCommits = await CLIProgressHelper.withProgress(
    1,
    "Searching for direct commits",
    async (update) => {
      const commits = await searchDirectCommits(
        makeRequest,
        config.searchUser,
        dateRange,
        ctx
      );
      update(1);
      return commits;
    }
  );

  output(
    `Found ${chalk.green(directCommits.length)} direct commits`
  );
  output("");

  // Search for pull requests with partitioning
  if (!cancelled.value && !checkTotalRecordsLimit(config, totalFetched)) {
    output(chalk.blue.bold("Pull Request Search"));
    const pullRequests = await CLIProgressHelper.withProgress(
      1,
      "Searching for pull requests",
      async (update) => {
        const prs = await searchPRs(
          makeRequest,
          config.searchUser,
          searchLimiter,
          dateRange,
          ctx
        );
        update(1);
        return prs;
      }
    );

    output(
      `Found ${chalk.green(pullRequests.length)} pull requests`
    );
    output("");

    // Analyze pull request commits
    if (
      pullRequests.length > 0 &&
      !cancelled.value &&
      !checkTotalRecordsLimit(config, totalFetched)
    ) {
      output(chalk.blue.bold("Pull Request Commit Analysis"));

      const prCommits = await CLIProgressHelper.withProgress(
        pullRequests.length,
        "Fetching PR commits",
        async (update) => {
          const allPrCommits = [];

          for (const pr of pullRequests) {
            if (
              cancelled.value ||
              checkTotalRecordsLimit(config, totalFetched)
            )
              break;

            const [owner, repo] = pr.repository_url.split("/").slice(-2);
            const commits = await getPullRequestCommits(
              makeRequest,
              owner,
              repo,
              pr.number,
              ctx
            );
            allPrCommits.push(...commits);
            update(1);
            await delay(config.delay * 1000);
          }

          return allPrCommits;
        }
      );

      // Update direct commits that are actually part of PRs
      for (const prCommit of prCommits) {
        const directCommit = directCommits.find(
          (c) => c.sha === prCommit.sha
        );
        if (directCommit) {
          directCommit.type = "pull_request";
          directCommit.pullRequest = prCommit.pullRequest;
        }
      }

      // Add PR commits that weren't found in direct search
      for (const prCommit of prCommits) {
        if (!directCommits.find((c) => c.sha === prCommit.sha)) {
          directCommits.push(prCommit);
        }
      }
    }
  }

  const commits = directCommits.map((v) => ({
    ...v,
    userId: config.searchUser,
  }));

  ctx.stream?.appendBatch("prCommit", commits);
  output("");
  output(chalk.blue.bold("Processing Summary"));
  output("\u2500".repeat(50));
  output(
    `Total commits found    : ${chalk.green(commits.length)}`
  );
  output(
    `Direct commits         : ${chalk.green(
      commits.filter((c) => c.type === "direct").length
    )}`
  );
  output(
    `Pull request commits   : ${chalk.green(
      commits.filter((c) => c.type === "pull_request").length
    )}`
  );
  output(
    `Unique repositories    : ${chalk.green(
      new Set(commits.map((c) => c.repository)).size
    )}`
  );
  output(
    `Errors encountered     : ${chalk.red(errors.length)}`
  );
  output(
    `Records fetched/limit  : ${chalk.green(totalFetched.value)}${
      config.totalRecords > 0 ? `/${config.totalRecords}` : ""
    }`
  );
  output("\u2500".repeat(50));
  output("");

  return commits;
}
