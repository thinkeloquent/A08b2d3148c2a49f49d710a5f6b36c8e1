import { expect } from "expect";
import {
  delay,
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";
import { getDetailedCommitInfo } from "./commits.mjs";

/**
 * Create weekly date partitions to stay under 1000 result limit.
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Array<{ start: string, end: string }>}
 */
export function createDatePartitions(startDate, endDate) {
  const partitions = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  let current = new Date(start);

  while (current < end) {
    const partitionEnd = new Date(current);
    partitionEnd.setDate(partitionEnd.getDate() + 7);

    if (partitionEnd > end) {
      partitionEnd.setTime(end.getTime());
    }

    partitions.push({
      start: current.toISOString().split("T")[0],
      end: partitionEnd.toISOString().split("T")[0],
    });

    current.setDate(current.getDate() + 8);
  }

  return partitions;
}

/**
 * Search pull requests for a specific query string with pagination.
 * @param {Function} makeRequest
 * @param {string} query
 * @param {object} searchLimiter
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function searchPullRequestsForQuery(
  makeRequest,
  query,
  searchLimiter,
  ctx
) {
  const { config, totalFetched, cancelled, log } = ctx;
  const pullRequests = [];
  let page = 1;
  const perPage = 100;

  while (!cancelled.value && !checkTotalRecordsLimit(config, totalFetched)) {
    try {
      const remainingRecords = getRemainingRecords(config, totalFetched);

      const response = await makeRequest(
        "GET /search/issues",
        {
          q: query,
          page,
          per_page: Math.min(perPage, remainingRecords),
          sort: "created",
          order: "desc",
        },
        searchLimiter
      );

      expect(response).toHaveProperty("items");
      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length === 0) break;

      pullRequests.push(...response.items);

      if (response.items.length < perPage) break;
      if (checkTotalRecordsLimit(config, totalFetched)) {
        const excess =
          pullRequests.length - getRemainingRecords(config, totalFetched);
        if (excess > 0) {
          pullRequests.splice(-excess);
        }
        break;
      }

      page++;
      await delay(config.delay * 1000);
    } catch (error) {
      if (
        error.status === 422 &&
        error.message.includes("Only the first 1000")
      ) {
        log(
          "Reached 1000 result limit for PRs, stopping pagination",
          "warn"
        );
        break;
      }
      throw error;
    }
  }

  return pullRequests;
}

/**
 * Search pull requests for a user with a base query and optional date partitioning.
 * @param {Function} makeRequest
 * @param {string} baseQuery - e.g. "author:username" or "user:username"
 * @param {object} searchLimiter
 * @param {object|null} dateRange
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function searchPullRequestsForUser(
  makeRequest,
  baseQuery,
  searchLimiter,
  dateRange,
  ctx
) {
  const { config, cancelled, totalFetched } = ctx;
  const allPullRequests = [];
  let query = `${baseQuery} is:pr`;

  if (config.org) {
    query += ` org:${config.org}`;
  }

  if (config.repo) {
    const repoNames = config.repo.split(",").map((r) => r.trim());
    if (config.org) {
      const repoQueries = repoNames.map(
        (name) => `repo:${config.org}/${name}`
      );
      query = `${baseQuery} is:pr (${repoQueries.join(" OR ")})`;
    } else {
      const repoQueries = repoNames.map((name) => `repo:*/${name}`);
      query = `${baseQuery} is:pr (${repoQueries.join(" OR ")})`;
    }
  }

  if (dateRange && !config.ignoreDateRange) {
    const partitions = createDatePartitions(dateRange.start, dateRange.end);

    for (const partition of partitions) {
      if (cancelled.value || checkTotalRecordsLimit(config, totalFetched))
        break;

      const partitionQuery = `${query} created:${partition.start}..${partition.end}`;
      const partitionResults = await searchPullRequestsForQuery(
        makeRequest,
        partitionQuery,
        searchLimiter,
        ctx
      );
      allPullRequests.push(...partitionResults);

      if (checkTotalRecordsLimit(config, totalFetched)) {
        const excess =
          allPullRequests.length - getRemainingRecords(config, totalFetched);
        if (excess > 0) {
          allPullRequests.splice(-excess);
        }
        break;
      }
    }
  } else {
    const results = await searchPullRequestsForQuery(
      makeRequest,
      query,
      searchLimiter,
      ctx
    );
    allPullRequests.push(...results);
  }

  return allPullRequests;
}

/**
 * Search pull requests with dual strategy (author: + user:) and deduplication.
 * @param {Function} makeRequest
 * @param {string} searchUser
 * @param {object} searchLimiter
 * @param {object|null} dateRange
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function searchPullRequestsWithPartitioning(
  makeRequest,
  searchUser,
  searchLimiter,
  dateRange,
  ctx
) {
  const { config, totalFetched } = ctx;

  const searchPromises = [
    searchPullRequestsForUser(
      makeRequest,
      `author:${searchUser}`,
      searchLimiter,
      dateRange,
      ctx
    ),
    searchPullRequestsForUser(
      makeRequest,
      `user:${searchUser}`,
      searchLimiter,
      dateRange,
      ctx
    ),
  ];

  const [authorResults, userResults] = await Promise.all(searchPromises);
  const allPullRequests = [...authorResults, ...userResults];

  const uniquePRs = allPullRequests.filter(
    (pr, index, self) =>
      index ===
      self.findIndex(
        (p) =>
          p.number === pr.number && p.repository_url === pr.repository_url
      )
  );

  if (config.totalRecords > 0) {
    const remainingRecords = getRemainingRecords(config, totalFetched);
    if (uniquePRs.length > remainingRecords) {
      uniquePRs.splice(remainingRecords);
    }
    totalFetched.value += uniquePRs.length;
  }

  return uniquePRs;
}

/**
 * Get commits for a specific pull request.
 * @param {Function} makeRequest
 * @param {string} owner
 * @param {string} repo
 * @param {number} pullNumber
 * @param {object} ctx
 * @returns {Promise<Array>}
 */
export async function getPullRequestCommits(
  makeRequest,
  owner,
  repo,
  pullNumber,
  ctx
) {
  const { config, errors, log } = ctx;
  try {
    const commits = await makeRequest(
      `GET /repos/${owner}/${repo}/pulls/${pullNumber}/commits`
    );

    const enhancedCommits = await Promise.all(
      commits.map(async (commit) => {
        const baseCommit = {
          sha: commit.sha,
          message: commit.commit.message,
          date: commit.commit.committer.date,
          repository: `${owner}/${repo}`,
          type: "pull_request",
          pullRequest: pullNumber,
          author: commit.commit.author.name,
          url: commit.html_url,
        };

        if (config.includeDetails) {
          const details = await getDetailedCommitInfo(
            makeRequest,
            owner,
            repo,
            commit.sha,
            { log }
          );
          baseCommit.parents = details.parents;
          baseCommit.stats = details.stats;
          baseCommit.files = details.files;
          await delay(config.delay * 1000);
        } else {
          baseCommit.parents = [];
          baseCommit.stats = { total: 0, additions: 0, deletions: 0 };
          baseCommit.files = [];
        }

        return baseCommit;
      })
    );

    return enhancedCommits;
  } catch (error) {
    errors.push({
      operation: "getPullRequestCommits",
      pullRequest: pullNumber,
      repository: `${owner}/${repo}`,
      error: error.message,
    });
    return [];
  }
}
