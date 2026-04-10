import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "../../utils/records-limit.js";
import type { SharedContext } from "../context.js";
import { fetchPullRequestCommits } from "./pull-request-commits.js";

export interface CommitRecord {
  sha: string;
  timestamp: string | null;
  repository: string;
  message: string;
  url: string;
}

/**
 * Fetch commits for a specific repository.
 * - When config.searchUser is set, filters by author
 * - When config.branch is set (and not "*"), filters by branch SHA
 */
export async function fetchRepoCommits(
  ctx: SharedContext,
  owner: string,
  repo: string,
): Promise<CommitRecord[]> {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  // Delegate to PR-specific endpoint when pullRequestNumber is set
  if (config.pullRequestNumber) {
    return fetchPullRequestCommits(ctx, owner, repo, config.pullRequestNumber);
  }

  const cacheKey = `repo-commits:${owner}/${repo}:${config.searchUser || ""}:${config.branch || ""}:${config.start || ""}:${config.end || ""}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as CommitRecord[];
  }

  const commits: CommitRecord[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    if (cancelled.value) break;
    if (checkTotalRecordsLimit(config, totalFetched)) break;

    try {
      const params: Record<string, unknown> = {
        owner,
        repo,
        page,
        per_page: Math.min(
          perPage,
          getRemainingRecords(config, totalFetched),
        ),
      };

      // Conditional author filter
      if (config.searchUser) {
        params.author = config.searchUser;
      }

      // Branch filter
      if (config.branch && config.branch !== "*") {
        params.sha = config.branch;
      }

      if (!config.ignoreDateRange) {
        if (config.start) params.since = `${config.start}T00:00:00Z`;
        if (config.end) params.until = `${config.end}T23:59:59Z`;
      }

      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/commits",
        params,
      );

      if (!pageCommits || pageCommits.length === 0) break;

      totalFetched.value += pageCommits.length;

      for (const commit of pageCommits) {
        commits.push({
          sha: commit.sha,
          timestamp:
            commit.commit?.author?.date ||
            commit.commit?.committer?.date ||
            null,
          repository: `${owner}/${repo}`,
          message: commit.commit?.message || "",
          url: commit.html_url || "",
        });
      }

      if (pageCommits.length < perPage) break;
      page++;
    } catch (error: any) {
      if (error.status === 409) {
        log(
          `Repository ${owner}/${repo} is empty or gone, skipping commits`,
          "warn",
        );
        break;
      }
      if (error.status === 404) {
        log(
          `Repository ${owner}/${repo} not found, skipping commits`,
          "warn",
        );
        break;
      }
      log(
        `Failed to fetch commits for ${owner}/${repo}: ${error.message}`,
        "warn",
      );
      break;
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
