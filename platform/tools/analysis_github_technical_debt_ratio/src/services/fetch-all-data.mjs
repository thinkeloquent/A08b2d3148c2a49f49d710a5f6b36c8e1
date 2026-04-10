import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import {
  discoverRepositories,
  fetchRepoCommits,
} from "../github/endpoints/commits.mjs";

/**
 * Fetch all data: validate user, discover repos, fetch commits.
 * No enrichment step needed — classification uses commit messages only.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ commits: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  output("Data Collection");

  // ── 1. Discover repositories ──────────────────────────────────────
  const repos = await CLIProgressHelper.withProgress(
    1,
    "Discovering repositories...",
    async (update) => {
      const discovered = await discoverRepositories(ctx);
      update(1);
      return discovered;
    }
  );

  log(`Discovered ${repos.length} repositories to scan`);

  if (cancelled.value || repos.length === 0) {
    return { commits: [], repositories: [] };
  }

  // ── 2. Fetch commits from each repository ─────────────────────────
  const allCommits = [];
  const discoveredRepos = new Set();

  await CLIProgressHelper.withProgress(
    repos.length,
    "Fetching commits from repositories...",
    async (update) => {
      for (const repo of repos) {
        if (cancelled.value) break;

        try {
          const commits = await fetchRepoCommits(ctx, repo.owner, repo.name);

          if (commits.length > 0) {
            allCommits.push(...commits);
            discoveredRepos.add(repo.full_name);
          }
        } catch (error) {
          log(
            `Failed to fetch commits for ${repo.full_name}: ${error.message}`,
            "warn"
          );
        }

        update(1);
      }
    }
  );

  // Deduplicate by SHA (commits may appear across forks)
  const uniqueCommits = Array.from(
    new Map(allCommits.map((c) => [c.sha, c])).values()
  );

  ctx.stream?.appendBatch("commit", uniqueCommits);
  log(`Found ${uniqueCommits.length} unique commits across ${discoveredRepos.size} repositories`);

  return {
    commits: uniqueCommits,
    repositories: [...discoveredRepos],
  };
}
