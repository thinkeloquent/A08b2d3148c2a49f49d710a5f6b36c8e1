import {
  checkTotalRecordsLimit,
  getRemainingRecords,
} from "../../utils/records-limit.js";
import type { SharedContext } from "../context.js";
import type { CommitRecord } from "./commits.js";

/**
 * Fetch commits associated with a specific pull request.
 * Uses `GET /repos/{owner}/{repo}/pulls/{pull_number}/commits`.
 */
export async function fetchPullRequestCommits(
  ctx: SharedContext,
  owner: string,
  repo: string,
  pullNumber: number,
): Promise<CommitRecord[]> {
  const { config, makeRequest, log, totalFetched, cancelled, cache } = ctx;

  const cacheKey = `pr-commits:${owner}/${repo}:${pullNumber}`;
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
        pull_number: pullNumber,
        page,
        per_page: Math.min(
          perPage,
          getRemainingRecords(config, totalFetched),
        ),
      };

      const pageCommits = await makeRequest(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
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
      if (error.status === 404) {
        log(
          `Pull request #${pullNumber} not found in ${owner}/${repo}`,
          "warn",
        );
        break;
      }
      log(
        `Failed to fetch PR #${pullNumber} commits for ${owner}/${repo}: ${error.message}`,
        "warn",
      );
      break;
    }
  }

  cache.set(cacheKey, commits);
  return commits;
}
