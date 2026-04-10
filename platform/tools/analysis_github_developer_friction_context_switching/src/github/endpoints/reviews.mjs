import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "@internal/github-api-sdk-cli";
import { generateTimeRanges } from "./pull-requests.mjs";

/**
 * Fetch reviews for a specific pull request.
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

/**
 * Search for PRs that the user has reviewed using the GitHub search API.
 * Uses `reviewed-by:` search qualifier with date partitioning and dedup.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<Array>} unique PRs reviewed by the user
 */
export async function searchReviewedPRs(ctx) {
  const {
    config,
    makeRequest,
    makeSearchRequest,
    log,
    totalFetched,
    cancelled,
    cache,
  } = ctx;

  const cacheKey = `reviewedPRs:${config.searchUser}:${config.start}:${config.end}:${config.org}:${config.repo}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const reviewedPRs = [];
  const perPage = 100;
  const searchQueries = [];

  // Build search queries with time partitioning
  if (!config.ignoreDateRange && config.start && config.end) {
    const timeRanges = generateTimeRanges(config.start, config.end);

    for (const range of timeRanges) {
      let query = `reviewed-by:${config.searchUser} is:pr created:${range.start}..${range.end}`;

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
      }

      searchQueries.push(query);
    }
  } else {
    let query = `reviewed-by:${config.searchUser} is:pr`;

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
    }

    searchQueries.push(query);
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

      for (const item of searchResult.items) {
        if (cancelled.value) break;

        try {
          const [owner, repo] = item.repository_url.split("/").slice(-2);

          reviewedPRs.push({
            number: item.number,
            title: item.title,
            created_at: item.created_at,
            updated_at: item.updated_at,
            closed_at: item.closed_at,
            pull_request: item.pull_request,
            repository: {
              full_name: `${owner}/${repo}`,
              name: repo,
              owner: { login: owner },
            },
          });
        } catch (error) {
          log(
            `Failed to process reviewed PR #${item.number}: ${error.message}`,
            "warn"
          );
        }
      }

      if (searchResult.items.length < perPage) break;
      if (searchResult.total_count > 1000) {
        log("Search returned >1000 results for reviewed PRs, stopping pagination", "warn");
        break;
      }
      page++;
    }
  }

  // Remove duplicates based on number + repository
  const seen = new Set();
  const uniquePRs = reviewedPRs.filter((pr) => {
    const key = `${pr.repository.full_name}#${pr.number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  cache.set(cacheKey, uniquePRs);
  return uniquePRs;
}
