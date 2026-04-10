import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Fetch commits for a specific repository authored by the search user.
 * Paginated GET /repos/{owner}/{repo}/commits with author/since/until filters.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} commits with { sha, timestamp, repository, message, url }
 */
export async function fetchRepoCommits(ctx, owner, repo) {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  const cacheKey = `repo-commits:${owner}/${repo}:${config.searchUser}:${config.start}:${config.end}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const commits = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;
    if (checkTotalRecordsLimit(config, totalFetched)) break;

    try {
      const params = {
        owner,
        repo,
        author: config.searchUser,
        page,
        per_page: Math.min(perPage, getRemainingRecords(config, totalFetched)),
      };

      if (!config.ignoreDateRange) {
        if (config.start) params.since = `${config.start}T00:00:00Z`;
        if (config.end) params.until = `${config.end}T23:59:59Z`;
      }

      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/commits",
        params
      );

      if (!pageCommits || pageCommits.length === 0) break;

      totalFetched.value += pageCommits.length;

      for (const commit of pageCommits) {
        commits.push({
          sha: commit.sha,
          timestamp:
            commit.commit?.author?.date ||
            commit.commit?.committer?.date ||
            null,
          repository: `${owner}/${repo}`,
          message: commit.commit?.message || "",
          url: commit.html_url || "",
        });
      }

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping commits`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Repository ${owner}/${repo} not found, skipping commits`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch commits for ${owner}/${repo}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
