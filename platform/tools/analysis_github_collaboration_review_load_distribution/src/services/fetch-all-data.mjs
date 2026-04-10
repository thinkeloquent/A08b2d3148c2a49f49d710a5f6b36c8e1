import { CLIProgressHelper } from "@internal/cli-progressor";
import { validateUser } from "@internal/github-api-sdk-cli";
import { fetchPullRequests } from "../github/endpoints/pull-requests.mjs";
import { fetchPRReviews } from "../github/endpoints/reviews.mjs";

/**
 * Fetch all data: validate user, fetch PRs, enrich each PR with review data.
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
    ...new Set(
      pullRequests.map((pr) => pr.repository?.full_name).filter(Boolean)
    ),
  ];

  log(`Repositories found: ${repositories.length}`);

  // Fetch reviews for all PRs
  if (pullRequests.length > 0) {
    await CLIProgressHelper.withProgress(
      pullRequests.length,
      "Fetching PR reviews for load distribution analysis...",
      async (update) => {
        for (const pr of pullRequests) {
          if (cancelled.value) break;

          try {
            const repoFullName = pr.repository?.full_name;
            if (!repoFullName) {
              pr._reviews = [];
              update(1);
              continue;
            }

            const [owner, repo] = repoFullName.split("/");
            const reviews = await fetchPRReviews(ctx, owner, repo, pr.number);

            // Attach reviews to the PR object for analysis
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
  }

  return { pullRequests, repositories };
}
