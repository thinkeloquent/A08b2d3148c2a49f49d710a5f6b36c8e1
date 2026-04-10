import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";

/**
 * Generate weekly time ranges for date partitioning.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {Array<{start: string, end: string}>}
 */
export function generateTimeRanges(startDate, endDate) {
  const ranges = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let current = new Date(start);

  while (current < end) {
    const rangeEnd = new Date(current);
    rangeEnd.setDate(rangeEnd.getDate() + 7);

    if (rangeEnd > end) {
      rangeEnd.setTime(end.getTime());
    }

    ranges.push({
      start: current.toISOString().split("T")[0],
      end: rangeEnd.toISOString().split("T")[0],
    });

    current = new Date(rangeEnd);
    current.setDate(current.getDate() + 1);
  }

  return ranges;
}

/**
 * Fetch pull requests for a user using search API with date partitioning.
 * Dual search using both author: and user: qualifiers, deduped by PR id.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<Array>} unique pull requests with detailed info
 */
export async function fetchPullRequests(ctx) {
  const {
    config,
    makeRequest,
    makeSearchRequest,
    log,
    totalFetched,
    cancelled,
    cache,
  } = ctx;

  const cacheKey = `pullRequests:${config.searchUser}:${config.start}:${config.end}:${config.org}:${config.repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const pullRequests = [];
  const perPage = 100;
  const searchQueries = [];

  // Build search queries with time partitioning — always use "created" qualifier
  if (!config.ignoreDateRange && config.start && config.end) {
    const timeRanges = generateTimeRanges(config.start, config.end);

    for (const range of timeRanges) {
      const authorQuery = `author:${config.searchUser} is:pull-request created:${range.start}..${range.end}`;
      const userQuery = `user:${config.searchUser} is:pull-request created:${range.start}..${range.end}`;

      if (config.org) {
        searchQueries.push(`${authorQuery} org:${config.org}`);
        searchQueries.push(`${userQuery} org:${config.org}`);
      } else if (config.repo) {
        const repoOwner = config.org || config.searchUser;
        const repoList = config.repo
          .split(",")
          .map((r) => {
            const name = r.trim();
            return `repo:${name.includes("/") ? name : `${repoOwner}/${name}`}`;
          })
          .join(" ");
        searchQueries.push(`${authorQuery} ${repoList}`);
        searchQueries.push(`${userQuery} ${repoList}`);
      } else {
        searchQueries.push(authorQuery);
        searchQueries.push(userQuery);
      }
    }
  } else {
    const authorQuery = `author:${config.searchUser} is:pull-request`;
    const userQuery = `user:${config.searchUser} is:pull-request`;

    if (config.org) {
      searchQueries.push(`${authorQuery} org:${config.org}`);
      searchQueries.push(`${userQuery} org:${config.org}`);
    } else if (config.repo) {
      const repoOwner = config.org || config.searchUser;
      const repoList = config.repo
        .split(",")
        .map((r) => {
          const name = r.trim();
          return `repo:${name.includes("/") ? name : `${repoOwner}/${name}`}`;
        })
        .join(" ");
      searchQueries.push(`${authorQuery} ${repoList}`);
      searchQueries.push(`${userQuery} ${repoList}`);
    } else {
      searchQueries.push(authorQuery);
      searchQueries.push(userQuery);
    }
  }

  // Execute all search queries
  for (const query of searchQueries) {
    if (cancelled.value) break;
    let page = 1;

    while (true) {
      if (checkTotalRecordsLimit(config, totalFetched)) break;
      if (cancelled.value) break;

      const remaining = getRemainingRecords(config, totalFetched);
      const searchResult = await makeSearchRequest("GET /search/issues", {
        q: query,
        page,
        per_page: Math.min(perPage, remaining),
        sort: "created",
        order: "desc",
      });

      if (!searchResult.items || searchResult.items.length === 0) break;

      totalFetched.value += searchResult.items.length;

      // Fetch detailed PR information
      for (const item of searchResult.items) {
        if (cancelled.value) break;

        try {
          const [owner, repo] = item.repository_url.split("/").slice(-2);
          const prDetail = await makeRequest(
            "GET /repos/{owner}/{repo}/pulls/{pull_number}",
            { owner, repo, pull_number: item.number }
          );

          pullRequests.push({
            ...prDetail,
            repository: {
              full_name: `${owner}/${repo}`,
              name: repo,
              owner: { login: owner },
            },
          });
        } catch (error) {
          if (error.status === 409) {
            log(
              `Repository for PR #${item.number} is empty or gone, skipping`,
              "warn"
            );
            continue;
          }
          log(
            `Failed to fetch PR details for #${item.number}: ${error.message}`,
            "warn"
          );
        }
      }

      if (searchResult.items.length < perPage) break;
      if (searchResult.total_count > 1000) {
        log("Search returned >1000 results, stopping pagination", "warn");
        break;
      }
      page++;
    }
  }

  // Remove duplicates based on PR ID
  const uniquePRs = Array.from(
    new Map(pullRequests.map((pr) => [pr.id, pr])).values()
  );

  cache.set(cacheKey, uniquePRs);
  return uniquePRs;
}

/**
 * Search for revert PRs — PRs with "revert" in the title for a given org/repo scope.
 * This catches PRs that revert the user's work (authored by others).
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<Array>} revert PRs with detailed info
 */
export async function searchRevertPRs(ctx) {
  const {
    config,
    makeRequest,
    makeSearchRequest,
    log,
    totalFetched,
    cancelled,
    cache,
  } = ctx;

  const cacheKey = `revertPRs:${config.searchUser}:${config.start}:${config.end}:${config.org}:${config.repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const revertPRs = [];
  const perPage = 100;
  const searchQueries = [];

  // Search for PRs with "revert" in title scoped to org/repo
  if (!config.ignoreDateRange && config.start && config.end) {
    const timeRanges = generateTimeRanges(config.start, config.end);

    for (const range of timeRanges) {
      let query = `is:pull-request "revert" in:title created:${range.start}..${range.end}`;

      if (config.org) {
        query += ` org:${config.org}`;
      } else if (config.repo) {
        const repoOwner = config.org || config.searchUser;
        const repoList = config.repo
          .split(",")
          .map((r) => {
            const name = r.trim();
            return `repo:${name.includes("/") ? name : `${repoOwner}/${name}`}`;
          })
          .join(" ");
        query += ` ${repoList}`;
      } else {
        // Without org/repo scope, search user's repos for reverts
        query = `is:pull-request "revert" in:title user:${config.searchUser} created:${range.start}..${range.end}`;
      }

      searchQueries.push(query);
    }
  } else {
    let query = `is:pull-request "revert" in:title`;

    if (config.org) {
      query += ` org:${config.org}`;
    } else if (config.repo) {
      const repoOwner = config.org || config.searchUser;
      const repoList = config.repo
        .split(",")
        .map((r) => {
          const name = r.trim();
          return `repo:${name.includes("/") ? name : `${repoOwner}/${name}`}`;
        })
        .join(" ");
      query += ` ${repoList}`;
    } else {
      query += ` user:${config.searchUser}`;
    }

    searchQueries.push(query);
  }

  for (const query of searchQueries) {
    if (cancelled.value) break;
    let page = 1;

    while (true) {
      if (checkTotalRecordsLimit(config, totalFetched)) break;
      if (cancelled.value) break;

      const remaining = getRemainingRecords(config, totalFetched);
      const searchResult = await makeSearchRequest("GET /search/issues", {
        q: query,
        page,
        per_page: Math.min(perPage, remaining),
        sort: "created",
        order: "desc",
      });

      if (!searchResult.items || searchResult.items.length === 0) break;

      totalFetched.value += searchResult.items.length;

      for (const item of searchResult.items) {
        if (cancelled.value) break;

        try {
          const [owner, repo] = item.repository_url.split("/").slice(-2);
          const prDetail = await makeRequest(
            "GET /repos/{owner}/{repo}/pulls/{pull_number}",
            { owner, repo, pull_number: item.number }
          );

          revertPRs.push({
            ...prDetail,
            repository: {
              full_name: `${owner}/${repo}`,
              name: repo,
              owner: { login: owner },
            },
          });
        } catch (error) {
          if (error.status === 409) {
            log(
              `Repository for revert PR #${item.number} is empty or gone, skipping`,
              "warn"
            );
            continue;
          }
          log(
            `Failed to fetch revert PR details for #${item.number}: ${error.message}`,
            "warn"
          );
        }
      }

      if (searchResult.items.length < perPage) break;
      if (searchResult.total_count > 1000) {
        log("Search returned >1000 results for revert PRs, stopping pagination", "warn");
        break;
      }
      page++;
    }
  }

  // Remove duplicates
  const uniquePRs = Array.from(
    new Map(revertPRs.map((pr) => [pr.id, pr])).values()
  );

  cache.set(cacheKey, uniquePRs);
  return uniquePRs;
}
