import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests, searchRevertPRs } from "../github/endpoints/pull-requests.mjs";
import { fetchPRCommits } from "../github/endpoints/commits.mjs";
import { fetchPRReviews } from "../github/endpoints/reviews.mjs";
import { REVERT_PATTERNS, REVIEW_STATES } from "../domain/models.mjs";

/**
 * Fetch all data: validate user, fetch PRs, revert PRs, reviews, commits.
 * Enriches each PR with review history, commit messages, and revert/rework signals.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ pullRequests: Array, revertPRs: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  output("Data Collection");

  const discoveredRepos = new Set();

  // ── 1. Fetch user's PRs ─────────────────────────────────────────────
  const pullRequests = await CLIProgressHelper.withProgress(
    1,
    "Fetching user pull requests...",
    async (update) => {
      const prs = await fetchPullRequests(ctx);
      update(1);
      return prs;
    }
  );

  ctx.stream?.appendBatch("pullRequest", pullRequests);
  log(`Found ${pullRequests.length} pull requests for ${config.searchUser}`);

  for (const pr of pullRequests) {
    if (pr.repository?.full_name) {
      discoveredRepos.add(pr.repository.full_name);
    }
  }

  if (cancelled.value) {
    return { pullRequests, revertPRs: [], repositories: [...discoveredRepos] };
  }

  // ── 2. Search for revert PRs in scope ───────────────────────────────
  const revertPRs = await CLIProgressHelper.withProgress(
    1,
    "Searching for revert PRs...",
    async (update) => {
      const reverts = await searchRevertPRs(ctx);
      update(1);
      return reverts;
    }
  );

  log(`Found ${revertPRs.length} potential revert PRs`);

  if (cancelled.value) {
    return { pullRequests, revertPRs, repositories: [...discoveredRepos] };
  }

  // ── 3. Enrich PRs with review history ───────────────────────────────
  if (pullRequests.length > 0) {
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching review history for each PR...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoName = pr.repository?.full_name;
            if (!repoName) {
              pr._reviews = [];
              update(1);
              continue;
            }

            const [owner, repo] = repoName.split("/");
            const reviews = await fetchPRReviews(ctx, owner, repo, pr.number);
            pr._reviews = reviews;

            // Compute review round-trips
            pr._reviewRoundTrips = computeReviewRoundTrips(reviews);
            pr._changesRequestedCount = reviews.filter(
              (r) => r.state === REVIEW_STATES.CHANGES_REQUESTED
            ).length;
          } catch (error) {
            log(
              `Failed to fetch reviews for PR #${pr.number}: ${error.message}`,
              "warn"
            );
            pr._reviews = [];
            pr._reviewRoundTrips = 0;
            pr._changesRequestedCount = 0;
          }

          update(1);
        }
      }
    );
  }

  if (cancelled.value) {
    return { pullRequests, revertPRs, repositories: [...discoveredRepos] };
  }

  // ── 4. Enrich PRs with commit messages (for revert detection) ───────
  if (pullRequests.length > 0) {
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching PR commits for revert detection...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoName = pr.repository?.full_name;
            if (!repoName) {
              pr._commits = [];
              update(1);
              continue;
            }

            const [owner, repo] = repoName.split("/");
            const commits = await fetchPRCommits(ctx, owner, repo, pr.number);
            pr._commits = commits;

            // Check if any commit messages indicate a revert
            pr._hasRevertCommit = commits.some((c) =>
              REVERT_PATTERNS.some((pattern) => pattern.test(c.message))
            );
          } catch (error) {
            log(
              `Failed to fetch commits for PR #${pr.number}: ${error.message}`,
              "warn"
            );
            pr._commits = [];
            pr._hasRevertCommit = false;
          }

          update(1);
        }
      }
    );
  }

  log(
    `Data collection complete: ${pullRequests.length} PRs, ${revertPRs.length} revert PRs, ${discoveredRepos.size} repositories`
  );

  return {
    pullRequests,
    revertPRs,
    repositories: [...discoveredRepos],
  };
}

/**
 * Compute review round-trips: number of CHANGES_REQUESTED → new activity cycles.
 * A round-trip is when a reviewer requests changes and the author pushes new commits.
 *
 * @param {Array} reviews - Reviews sorted chronologically
 * @returns {number} number of round-trips
 */
function computeReviewRoundTrips(reviews) {
  let roundTrips = 0;
  let awaitingRework = false;

  for (const review of reviews) {
    if (review.state === REVIEW_STATES.CHANGES_REQUESTED) {
      awaitingRework = true;
    } else if (
      awaitingRework &&
      (review.state === REVIEW_STATES.APPROVED ||
        review.state === REVIEW_STATES.COMMENTED ||
        review.state === REVIEW_STATES.DISMISSED)
    ) {
      roundTrips++;
      awaitingRework = false;
    }
  }

  return roundTrips;
}
