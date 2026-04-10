import { fetchUserRepos, checkTotalRecordsLimit } from "@internal/github-api-sdk-cli";
import { getRepositoryCommits } from "../github/endpoints/commits.mjs";

/**
 * Search for direct commits across user repositories.
 * @param {Function} makeRequest
 * @param {string} searchUser
 * @param {object|null} dateRange
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function searchDirectCommits(
  makeRequest,
  searchUser,
  dateRange,
  ctx
) {
  const { config, cancelled, totalFetched, log } = ctx;
  const allCommits = [];

  const repos = await fetchUserRepos(ctx);
  log(`Found ${repos.length} repositories for user ${searchUser}`);

  const filteredRepos = repos.filter((repo) => {
    if (config.org && repo.owner.login !== config.org) {
      return false;
    }
    if (config.repo) {
      const repoNames = config.repo.split(",").map((r) => r.trim());
      return repoNames.includes(repo.name);
    }
    return true;
  });

  log(`Processing ${filteredRepos.length} repositories after filtering`);

  for (const repo of filteredRepos) {
    if (cancelled.value || checkTotalRecordsLimit(config, totalFetched)) break;

    log(`Searching commits in ${repo.full_name}`);
    const repoCommits = await getRepositoryCommits(
      makeRequest,
      repo.owner.login,
      repo.name,
      searchUser,
      dateRange,
      ctx
    );

    allCommits.push(...repoCommits);

    if (checkTotalRecordsLimit(config, totalFetched)) {
      break;
    }
  }

  ctx.stream?.appendBatch("commit", allCommits);
  return allCommits;
}
