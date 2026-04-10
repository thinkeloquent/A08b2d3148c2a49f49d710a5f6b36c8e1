/**
 * Fetch commits for a specific pull request to determine the first commit date.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} commits in the PR (oldest first)
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

      commits.push(...pageCommits);

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping`,
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

  // Sort by commit date ascending (oldest first)
  commits.sort((a, b) => {
    const dateA = new Date(a.commit?.committer?.date || a.commit?.author?.date || 0);
    const dateB = new Date(b.commit?.committer?.date || b.commit?.author?.date || 0);
    return dateA - dateB;
  });

  cache.set(cacheKey, commits);
  return commits;
}
