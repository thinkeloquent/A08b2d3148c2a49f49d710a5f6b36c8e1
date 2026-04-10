import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Fetch commits for a user from specific repositories with detail enrichment.
 *
 * @param {object} ctx - Shared context
 * @param {string[]} repositories - Array of "owner/repo" full names
 * @returns {Promise<Array>} commits with stats and repository info
 */
export async function fetchCommits(ctx, repositories) {
  const {
    config,
    makeRequest,
    log,
    totalFetched,
    cancelled,
    cache,
  } = ctx;

  const cacheKey = `commits:${config.searchUser}:${config.start}:${config.end}:${repositories.join(",")}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const commits = [];
  const perPage = 100;

  for (const repoFullName of repositories) {
    if (cancelled.value) break;

    try {
      const [owner, repo] = repoFullName.split("/");
      let page = 1;

      while (true) {
        if (checkTotalRecordsLimit(config, totalFetched)) break;
        if (cancelled.value) break;

        const remaining = getRemainingRecords(config, totalFetched);
        const params = {
          owner,
          repo,
          author: config.searchUser,
          page,
          per_page: Math.min(perPage, remaining),
        };

        if (!config.ignoreDateRange && config.start && config.end) {
          params.since = `${config.start}T00:00:00Z`;
          params.until = `${config.end}T23:59:59Z`;
        }

        const repoCommits = await makeRequest(
          "GET /repos/{owner}/{repo}/commits",
          params
        );

        if (!repoCommits || repoCommits.length === 0) break;

        totalFetched.value += repoCommits.length;

        // Fetch commit stats/details
        for (const commit of repoCommits) {
          if (cancelled.value) break;

          try {
            const commitDetail = await makeRequest(
              "GET /repos/{owner}/{repo}/commits/{ref}",
              { owner, repo, ref: commit.sha }
            );

            commits.push({
              ...commitDetail,
              repository: {
                full_name: repoFullName,
                name: repo,
                owner: { login: owner },
              },
            });
          } catch (error) {
            log(
              `Failed to fetch commit stats for ${commit.sha}: ${error.message}`,
              "warn"
            );
          }
        }

        if (repoCommits.length < perPage) break;
        page++;
      }
    } catch (error) {
      log(
        `Failed to fetch commits from ${repoFullName}: ${error.message}`,
        "warn"
      );
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
