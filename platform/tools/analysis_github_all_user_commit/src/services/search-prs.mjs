import { searchPullRequestsWithPartitioning } from "../github/endpoints/pull-requests.mjs";

/**
 * Search for pull requests by a user.
 * @param {Function} makeRequest
 * @param {string} searchUser
 * @param {object} searchLimiter
 * @param {object|null} dateRange
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function searchPRs(
  makeRequest,
  searchUser,
  searchLimiter,
  dateRange,
  ctx
) {
  return searchPullRequestsWithPartitioning(
    makeRequest,
    searchUser,
    searchLimiter,
    dateRange,
    ctx
  );
}
