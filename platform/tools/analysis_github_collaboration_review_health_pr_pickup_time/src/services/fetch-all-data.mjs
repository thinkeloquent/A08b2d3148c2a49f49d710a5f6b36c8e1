import { CLIProgressHelper } from "@internal/cli-progressor";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchPRReviews } from "../github/endpoints/reviews.mjs";
import { fetchIssueComments, fetchReviewComments } from "../github/endpoints/comments.mjs";
import { validateUser } from "@internal/github-api-sdk-cli";

/**
 * Fetch all data: validate user, fetch PRs, enrich ALL PRs with reviews and comments.
 *
 * Key difference from lead-time: enriches ALL PRs (not just merged), since pickup
 * time applies to open/closed/merged PRs equally.
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

  // Enrich ALL PRs with reviews and comments for pickup time analysis
  if (pullRequests.length > 0) {
    // Fetch reviews for all PRs
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching PR reviews for pickup time analysis...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoFullName = pr.repository?.full_name;
            if (!repoFullName) {
              update(1);
              continue;
            }

            const [owner, repo] = repoFullName.split("/");
            const reviews = await fetchPRReviews(ctx, owner, repo, pr.number);
            pr._reviews = reviews;
          } catch (error) {
            log(
              `Failed to fetch reviews for PR #${pr.number}: ${error.message}`,
              "warn"
            );
            pr._reviews = [];
          }

          update(1);
        }
      }
    );

    // Fetch issue comments for all PRs
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching PR issue comments for pickup time analysis...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoFullName = pr.repository?.full_name;
            if (!repoFullName) {
              update(1);
              continue;
            }

            const [owner, repo] = repoFullName.split("/");
            const comments = await fetchIssueComments(ctx, owner, repo, pr.number);
            pr._issueComments = comments;
          } catch (error) {
            log(
              `Failed to fetch issue comments for PR #${pr.number}: ${error.message}`,
              "warn"
            );
            pr._issueComments = [];
          }

          update(1);
        }
      }
    );

    // Optionally fetch review comments (inline code comments)
    if (config.includeReviewComments) {
      await CLIProgressHelper.withProgress(
        pullRequests.length,
        "Fetching PR review comments (inline) for pickup time analysis...",
        async (update) => {
          for (const pr of pullRequests) {
            if (cancelled.value) break;

            try {
              const repoFullName = pr.repository?.full_name;
              if (!repoFullName) {
                update(1);
                continue;
              }

              const [owner, repo] = repoFullName.split("/");
              const comments = await fetchReviewComments(ctx, owner, repo, pr.number);
              pr._reviewComments = comments;
            } catch (error) {
              log(
                `Failed to fetch review comments for PR #${pr.number}: ${error.message}`,
                "warn"
              );
              pr._reviewComments = [];
            }

            update(1);
          }
        }
      );
    }
  }

  return { pullRequests, repositories };
}
