import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchRepoCommits } from "../github/endpoints/commits.mjs";
import { searchReviewedPRs, fetchPRReviews } from "../github/endpoints/reviews.mjs";
import { ACTIVITY_TYPES } from "../domain/models.mjs";

/**
 * Fetch all data: validate user, fetch PRs, commits, reviews → build unified activity timeline.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ activities: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  output("Data Collection");

  const activities = [];
  const discoveredRepos = new Set();

  // ── 1. Fetch PRs ──────────────────────────────────────────────────
  if (config.includePRs) {
    const pullRequests = await CLIProgressHelper.withProgress(
      1,
      "Fetching pull requests...",
      async (update) => {
        const prs = await fetchPullRequests(ctx);
        update(1);
        return prs;
      }
    );

    log(`Found ${pullRequests.length} pull requests`);

    // Convert PRs to activities
    for (const pr of pullRequests) {
      const repoName = pr.repository?.full_name || "unknown";
      discoveredRepos.add(repoName);

      // PR opened activity
      if (pr.created_at) {
        activities.push({
          timestamp: pr.created_at,
          repository: repoName,
          type: ACTIVITY_TYPES.PR_OPENED,
          reference: `#${pr.number}`,
          url: pr.html_url || "",
          title: pr.title || "",
        });
      }

      // PR merged activity
      if (pr.merged_at) {
        activities.push({
          timestamp: pr.merged_at,
          repository: repoName,
          type: ACTIVITY_TYPES.PR_MERGED,
          reference: `#${pr.number}`,
          url: pr.html_url || "",
          title: pr.title || "",
        });
      }

      // PR closed (not merged) activity
      if (pr.closed_at && !pr.merged_at) {
        activities.push({
          timestamp: pr.closed_at,
          repository: repoName,
          type: ACTIVITY_TYPES.PR_CLOSED,
          reference: `#${pr.number}`,
          url: pr.html_url || "",
          title: pr.title || "",
        });
      }
    }
  }

  if (cancelled.value) {
    return { activities, repositories: [...discoveredRepos] };
  }

  // ── 2. Fetch commits per discovered repo ──────────────────────────
  if (config.includeCommits && discoveredRepos.size > 0) {
    const repos = [...discoveredRepos];

    await CLIProgressHelper.withProgress(
      repos.length,
      "Fetching commit history per repository...",
      async (update) => {
        for (const repoFullName of repos) {
          if (cancelled.value) break;

          try {
            const [owner, repo] = repoFullName.split("/");
            const commits = await fetchRepoCommits(ctx, owner, repo);

            for (const commit of commits) {
              if (commit.timestamp) {
                activities.push({
                  timestamp: commit.timestamp,
                  repository: commit.repository,
                  type: ACTIVITY_TYPES.COMMIT,
                  reference: commit.sha.substring(0, 7),
                  url: commit.url,
                  title: commit.message.split("\n")[0],
                });
              }
            }

            log(`Fetched ${commits.length} commits from ${repoFullName}`);
          } catch (error) {
            log(
              `Failed to fetch commits for ${repoFullName}: ${error.message}`,
              "warn"
            );
          }

          update(1);
        }
      }
    );
  }

  if (cancelled.value) {
    return { activities, repositories: [...discoveredRepos] };
  }

  // ── 3. Fetch reviews ──────────────────────────────────────────────
  if (config.includeReviews) {
    const reviewedPRs = await CLIProgressHelper.withProgress(
      1,
      "Searching for reviewed PRs...",
      async (update) => {
        const prs = await searchReviewedPRs(ctx);
        update(1);
        return prs;
      }
    );

    log(`Found ${reviewedPRs.length} reviewed PRs`);

    if (reviewedPRs.length > 0) {
      await CLIProgressHelper.withProgress(
        reviewedPRs.length,
        "Fetching review details...",
        async (update) => {
          for (const pr of reviewedPRs) {
            if (cancelled.value) break;

            try {
              const repoName = pr.repository?.full_name;
              if (!repoName) {
                update(1);
                continue;
              }

              discoveredRepos.add(repoName);
              const [owner, repo] = repoName.split("/");
              const reviews = await fetchPRReviews(ctx, owner, repo, pr.number);

              // Filter to only this user's reviews
              const userReviews = reviews.filter(
                (r) =>
                  r.user?.login?.toLowerCase() ===
                  config.searchUser.toLowerCase()
              );

              for (const review of userReviews) {
                if (review.submitted_at) {
                  activities.push({
                    timestamp: review.submitted_at,
                    repository: repoName,
                    type: ACTIVITY_TYPES.REVIEW,
                    reference: `#${pr.number}`,
                    url: review.html_url || pr.pull_request?.html_url || "",
                    title: `Review on: ${pr.title || ""}`,
                  });
                }
              }
            } catch (error) {
              log(
                `Failed to fetch reviews for PR #${pr.number}: ${error.message}`,
                "warn"
              );
            }

            update(1);
          }
        }
      );
    }
  }

  // ── 4. Deduplicate ────────────────────────────────────────────────
  const seen = new Set();
  const dedupedActivities = activities.filter((a) => {
    const key = `${a.timestamp}|${a.repository}|${a.type}|${a.reference}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  ctx.stream?.appendBatch("activity", dedupedActivities);
  log(
    `Total activities: ${dedupedActivities.length} (${activities.length - dedupedActivities.length} duplicates removed)`
  );

  return {
    activities: dedupedActivities,
    repositories: [...discoveredRepos],
  };
}
