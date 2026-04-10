import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchPRCommits, fetchCommitStats } from "../github/endpoints/commits.mjs";

/**
 * Fetch all data: validate user, fetch PRs, optionally enrich with commit-level stats.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ pullRequests: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  output("Data Collection");

  const discoveredRepos = new Set();

  // ── 1. Fetch user's PRs ─────────────────────────────────────────────
  const pullRequests = await CLIProgressHelper.withProgress(
    1,
    "Fetching user pull requests...",
    async (update) => {
      const prs = await fetchPullRequests(ctx);
      update(1);
      return prs;
    }
  );

  ctx.stream?.appendBatch("pullRequest", pullRequests);
  log(`Found ${pullRequests.length} pull requests for ${config.searchUser}`);

  for (const pr of pullRequests) {
    if (pr.repository?.full_name) {
      discoveredRepos.add(pr.repository.full_name);
    }
  }

  if (cancelled.value) {
    return { pullRequests, repositories: [...discoveredRepos] };
  }

  // ── 2. Enrich with commit-level stats (if granularity = "commit") ──
  if (config.granularity === "commit" && pullRequests.length > 0) {
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching commit-level stats for each PR...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoName = pr.repository?.full_name;
            if (!repoName) {
              pr._commitStats = [];
              update(1);
              continue;
            }

            const [owner, repo] = repoName.split("/");
            const commits = await fetchPRCommits(ctx, owner, repo, pr.number);

            // Fetch individual commit stats for each commit
            const commitStats = [];
            for (const commit of commits) {
              if (cancelled.value) break;
              const stats = await fetchCommitStats(ctx, owner, repo, commit.sha);
              if (stats) {
                commitStats.push({
                  sha: commit.sha,
                  date: commit.date,
                  additions: stats.additions || 0,
                  deletions: stats.deletions || 0,
                  total: stats.total || 0,
                });
              }
            }

            pr._commitStats = commitStats;

            // Compute commit-level totals
            pr._commitAdditions = commitStats.reduce((sum, c) => sum + c.additions, 0);
            pr._commitDeletions = commitStats.reduce((sum, c) => sum + c.deletions, 0);
          } catch (error) {
            log(
              `Failed to fetch commit stats for PR #${pr.number}: ${error.message}`,
              "warn"
            );
            pr._commitStats = [];
            pr._commitAdditions = 0;
            pr._commitDeletions = 0;
          }

          update(1);
        }
      }
    );
  }

  log(
    `Data collection complete: ${pullRequests.length} PRs, ${discoveredRepos.size} repositories`
  );

  return {
    pullRequests,
    repositories: [...discoveredRepos],
  };
}
