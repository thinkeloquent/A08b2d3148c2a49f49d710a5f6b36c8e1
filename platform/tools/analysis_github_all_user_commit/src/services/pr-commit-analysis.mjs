import { delay, checkTotalRecordsLimit } from "@internal/github-api-sdk-cli";
import { getPullRequestCommits } from "../github/endpoints/pull-requests.mjs";

/**
 * Fetch commits for each pull request.
 * @param {Function} makeRequest
 * @param {Array} pullRequests
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function analyzePRCommits(makeRequest, pullRequests, ctx) {
  const { config, cancelled, totalFetched } = ctx;
  const allPrCommits = [];

  for (const pr of pullRequests) {
    if (cancelled.value || checkTotalRecordsLimit(config, totalFetched)) break;

    const [owner, repo] = pr.repository_url.split("/").slice(-2);
    const commits = await getPullRequestCommits(
      makeRequest,
      owner,
      repo,
      pr.number,
      ctx
    );
    allPrCommits.push(...commits);
    await delay(config.delay * 1000);
  }

  return allPrCommits;
}
