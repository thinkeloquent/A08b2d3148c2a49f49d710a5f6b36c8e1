/**
 * Fetch reviews for a specific pull request.
 * Returns all reviews with reviewer details and review state.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} pullNumber - PR number
 * @returns {Promise<Array>} reviews sorted by submitted_at ascending
 */
export async function fetchPRReviews(ctx, owner, repo, pullNumber) {
  const { makeRequest, log, cancelled, cache } = ctx;

  const cacheKey = `pr-reviews:${owner}/${repo}#${pullNumber}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const reviews = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;

    try {
      const pageReviews = await makeRequest(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews",
        { owner, repo, pull_number: pullNumber, page, per_page: perPage }
      );

      if (!pageReviews || pageReviews.length === 0) break;

      reviews.push(...pageReviews);

      if (pageReviews.length < perPage) break;
      page++;
    } catch (error) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping reviews`,
          "warn"
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Reviews not accessible for PR #${pullNumber}, skipping`,
          "warn"
        );
        break;
      }
      log(
        `Failed to fetch reviews for PR #${pullNumber}: ${error.message}`,
        "warn"
      );
      break;
    }
  }

  // Sort by submitted_at ascending (earliest first)
  reviews.sort((a, b) => {
    const dateA = new Date(a.submitted_at || 0);
    const dateB = new Date(b.submitted_at || 0);
    return dateA - dateB;
  });

  cache.set(cacheKey, reviews);
  return reviews;
}
