/**
 * Fetch issue comments for a specific pull request.
 * Issue comments are top-level conversation comments on the PR thread.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} issue comments sorted by created_at ascending
 */
export async function fetchIssueComments(ctx, owner, repo, pullNumber) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `issue-comments:${owner}/${repo}#${pullNumber}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const comments = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      const pageComments = await makeRequest(
        "GET /repos/{owner}/{repo}/issues/{issue_number}/comments",
        { owner, repo, issue_number: pullNumber, page, per_page: perPage }
      );

      if (!pageComments || pageComments.length === 0) break;

      comments.push(...pageComments);

      if (pageComments.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping issue comments`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Issue comments not accessible for PR #${pullNumber}, skipping`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch issue comments for PR #${pullNumber}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  // Sort by created_at ascending (earliest first)
  comments.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateA - dateB;
  });

  cache.set(cacheKey, comments);
  return comments;
}

/**
 * Fetch review comments (inline code comments) for a specific pull request.
 * Review comments are comments left on specific lines of code in the diff.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} review comments sorted by created_at ascending
 */
export async function fetchReviewComments(ctx, owner, repo, pullNumber) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `review-comments:${owner}/${repo}#${pullNumber}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const comments = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      const pageComments = await makeRequest(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/comments",
        { owner, repo, pull_number: pullNumber, page, per_page: perPage }
      );

      if (!pageComments || pageComments.length === 0) break;

      comments.push(...pageComments);

      if (pageComments.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping review comments`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Review comments not accessible for PR #${pullNumber}, skipping`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch review comments for PR #${pullNumber}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  // Sort by created_at ascending (earliest first)
  comments.sort((a, b) => {
    const dateA = new Date(a.created_at || 0);
    const dateB = new Date(b.created_at || 0);
    return dateA - dateB;
  });

  cache.set(cacheKey, comments);
  return comments;
}
