import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchCommits } from "../github/endpoints/commits.mjs";
import { discoverUserRepositories } from "../github/endpoints/repos.mjs";

/**
 * Fetch all data: validate user, fetch PRs, discover repos, fetch commits.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ pullRequests: Array, commits: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, makeGraphQLRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  // Fetch pull requests
  output("Data Collection");

  const pullRequests = await CLIProgressHelper.withProgress(
    1,
    "Fetching pull requests...",
    async (update) => {
      const prs = await fetchPullRequests(ctx);
      update(1);
      return prs;
    }
  );

  ctx.stream?.appendBatch("pullRequest", pullRequests);
  log(`Found ${pullRequests.length} pull requests`);

  if (cancelled.value) {
    return { pullRequests, commits: [], repositories: [] };
  }

  // Discover repositories
  let repositories = [];
  if (config.repo) {
    repositories = config.repo.split(",").map((r) => r.trim());
  } else if (pullRequests.length > 0) {
    repositories = [
      ...new Set(pullRequests.map((pr) => pr.repository.full_name)),
    ];
  } else {
    repositories = await discoverUserRepositories(
      makeGraphQLRequest,
      config,
      { log }
    );
  }

  log(`Analyzing ${repositories.length} repositories`);

  if (cancelled.value) {
    return { pullRequests, commits: [], repositories };
  }

  // Fetch commits
  const commits = await CLIProgressHelper.withProgress(
    1,
    "Fetching commits...",
    async (update) => {
      const cmts = await fetchCommits(ctx, repositories);
      update(1);
      return cmts;
    }
  );

  ctx.stream?.appendBatch("commit", commits);
  log(`Found ${commits.length} commits`);

  return { pullRequests, commits, repositories };
}
