import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchPRCommits } from "../github/endpoints/commits.mjs";
import { fetchPRReviews } from "../github/endpoints/reviews.mjs";

/**
 * Fetch all data: validate user, fetch PRs, enrich with first commit dates and review data.
 *
 * @param {object} ctx - Shared context
 * @returns {Promise<{ pullRequests: Array, repositories: string[] }>}
 */
export async function fetchAllData(ctx) {
  const { config, makeRequest, log, output, cancelled } = ctx;

  // Validate user
  output("User Validation");
  await validateUser(makeRequest, config.searchUser, { log });
  log(`User ${config.searchUser} validated`);

  // Fetch pull requests
  output("Data Collection");

  const pullRequests = await CLIProgressHelper.withProgress(
    1,
    "Fetching pull requests...",
    async (update) => {
      const prs = await fetchPullRequests(ctx);
      update(1);
      return prs;
    }
  );

  ctx.stream?.appendBatch("pullRequest", pullRequests);
  log(`Found ${pullRequests.length} pull requests`);

  if (cancelled.value) {
    return { pullRequests, repositories: [] };
  }

  // Discover repositories from PR data
  const repositories = [
    ...new Set(pullRequests.map((pr) => pr.repository?.full_name).filter(Boolean)),
  ];

  log(`Repositories found: ${repositories.length}`);

  // Enrich merged PRs with first commit date for accurate lead time
  const mergedPRs = pullRequests.filter((pr) => pr.merged_at);

  if (mergedPRs.length > 0) {
    // Fetch commit history for first commit date
    await CLIProgressHelper.withProgress(
      mergedPRs.length,
      "Fetching PR commit history for lead time...",
      async (update) => {
        for (const pr of mergedPRs) {
          if (cancelled.value) break;

          try {
            const repoFullName = pr.repository?.full_name;
            if (!repoFullName) {
              update(1);
              continue;
            }

            const [owner, repo] = repoFullName.split("/");
            const commits = await fetchPRCommits(ctx, owner, repo, pr.number);

            if (commits.length > 0) {
              const firstCommit = commits[0];
              pr._firstCommitDate =
                firstCommit.commit?.author?.date ||
                firstCommit.commit?.committer?.date ||
                null;
            }
          } catch (error) {
            log(
              `Failed to fetch commits for PR #${pr.number}: ${error.message}`,
              "warn"
            );
          }

          update(1);
        }
      }
    );

    // Fetch review data for lead time phase breakdown
    if (config.includeReviews) {
      await CLIProgressHelper.withProgress(
        mergedPRs.length,
        "Fetching PR review data for lead time breakdown...",
        async (update) => {
          for (const pr of mergedPRs) {
            if (cancelled.value) break;

            try {
              const repoFullName = pr.repository?.full_name;
              if (!repoFullName) {
                update(1);
                continue;
              }

              const [owner, repo] = repoFullName.split("/");
              const reviews = await fetchPRReviews(ctx, owner, repo, pr.number);

              if (reviews.length > 0) {
                // First review (any state) — measures pickup time
                const firstReview = reviews[0];
                pr._firstReviewAt = firstReview.submitted_at || null;

                // Last approval — measures merge queue time
                const approvals = reviews.filter((r) => r.state === "APPROVED");
                if (approvals.length > 0) {
                  const lastApproval = approvals[approvals.length - 1];
                  pr._lastApprovalAt = lastApproval.submitted_at || null;
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

  return { pullRequests, repositories };
}
