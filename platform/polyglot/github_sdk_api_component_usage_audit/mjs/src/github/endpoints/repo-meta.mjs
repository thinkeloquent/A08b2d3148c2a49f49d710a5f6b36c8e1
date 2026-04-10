/**
 * Repository Metadata Endpoint
 *
 * Fetches /repos/{owner}/{repo} with an in-memory cache keyed by "owner/repo".
 * Validates stargazers_count and archived status.
 */

/**
 * Fetch and validate repository metadata.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeRequest - SDK core request function.
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {Map} ctx.cache - In-memory cache map.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {number} params.minStars - Minimum stargazer count.
 * @returns {Promise<{ valid: boolean, repo?: object }>}
 */
export async function fetchRepoMeta(ctx, { owner, repo, minStars }) {
  const cacheKey = `${owner}/${repo}`;

  // Check cache
  if (ctx.cache.has(cacheKey)) {
    return ctx.cache.get(cacheKey);
  }

  const data = await ctx.makeRequest(`GET /repos/${owner}/${repo}`);

  await ctx.debugLog("repo-meta", { owner, repo, stars: data.stargazers_count, archived: data.archived });

  const valid = data.stargazers_count >= minStars && data.archived === false;

  const result = { valid, repo: data };
  ctx.cache.set(cacheKey, result);

  return result;
}
