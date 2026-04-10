/**
 * Fetch commits for a specific pull request with individual commit stats.
 * Used for commit-level granularity analysis.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} commits with { sha, message, author, date, additions, deletions }
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

/**
 * Fetch individual commit details (includes stats: additions, deletions, total).
 * Required for commit-level granularity since PR commit listing doesn't include stats.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} sha - Commit SHA
 * @returns {Promise<{additions: number, deletions: number, total: number} | null>}
 */
export async function fetchCommitStats(ctx, owner, repo, sha) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `commit-stats:${owner}/${repo}@${sha}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    if (cancelled.value) return null;

    const commit = await makeRequest(
      "GET /repos/{owner}/{repo}/commits/{ref}",
      { owner, repo, ref: sha }
    );

    const stats = commit.stats || { additions: 0, deletions: 0, total: 0 };
    cache.set(cacheKey, stats);
    return stats;
  } catch (error) {
    if (error.status === 409 || error.status === 404) {
      log(
        `Commit ${sha.slice(0, 7)} not accessible in ${owner}/${repo}, skipping`,
        "warn"
      );
      return null;
    }
    log(
      `Failed to fetch stats for commit ${sha.slice(0, 7)}: ${error.message}`,
      "warn"
    );
    return null;
  }
}
