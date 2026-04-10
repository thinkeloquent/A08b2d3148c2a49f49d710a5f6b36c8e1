import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Fetch commits for a specific pull request.
 * Used to detect revert commits within PRs.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} commits with { sha, message, author, date }
 */
export async function fetchPRCommits(ctx, owner, repo, pullNumber) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `pr-commits:${owner}/${repo}#${pullNumber}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const commits = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
        { owner, repo, pull_number: pullNumber, page, per_page: perPage }
      );

      if (!pageCommits || pageCommits.length === 0) break;

      for (const commit of pageCommits) {
        commits.push({
          sha: commit.sha,
          message: commit.commit?.message || "",
          author: commit.commit?.author?.name || commit.author?.login || "",
          authorLogin: commit.author?.login || "",
          date: commit.commit?.author?.date || commit.commit?.committer?.date || null,
        });
      }

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping PR commits`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `PR #${pullNumber} not found in ${owner}/${repo}, skipping commits`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch commits for PR #${pullNumber}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
