import { CLIProgressHelper } from "@internal/cli-progressor";
import { UserStatusSchema } from "../domain/models.mjs";
import { validateUser, searchForUser } from "../github/endpoints/users.mjs";
import { checkTotalRecordsLimit, delay } from "@internal/github-api-sdk-cli";

/**
 * Check the status of a single GitHub user.
 * Tries the profile endpoint first, then the search API on 404.
 *
 * @param {object} ctx - Shared context
 * @param {string} username
 * @returns {Promise<object>} Validated user status result
 */
async function checkSingleUser(ctx, username) {
  const { makeRequest, searchLimiter, log } = ctx;

  // Try profile endpoint first
  const profileResult = await validateUser(makeRequest, username, { log });

  if (profileResult) {
    return UserStatusSchema.parse(profileResult);
  }

  // Profile returned 404 — check search API to differentiate
  const searchResult = await searchForUser(makeRequest, username, searchLimiter, { log });

  if (searchResult.found) {
    return UserStatusSchema.parse({
      username,
      status: "Suspended",
      details: searchResult.details,
    });
  }

  return UserStatusSchema.parse({
    username,
    status: "Not Found / Suspended",
  });
}

/**
 * Process all usernames and check their status.
 *
 * @param {object} instance - GitHubUserStatus instance (provides ctx, config, etc.)
 * @returns {Promise<Array>} Array of user status results
 */
export async function checkAllUserStatuses(instance) {
  const { ctx, config } = instance;
  const { log, output, errors, totalFetched, cancelled } = ctx;

  const usernames = config.searchUser
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  if (usernames.length === 0) {
    throw new Error("No valid usernames provided");
  }

  // Apply total records limit
  const usersToProcess =
    config.totalRecords > 0
      ? usernames.slice(0, config.totalRecords)
      : usernames;

  output(`Processing ${usersToProcess.length} user(s)...`);

  const results = [];

  await CLIProgressHelper.withProgress(
    usersToProcess.length,
    "Checking user status",
    async (update) => {
      for (const username of usersToProcess) {
        if (cancelled.value) break;
        if (checkTotalRecordsLimit(config, totalFetched)) break;

        try {
          const userStatus = await checkSingleUser(ctx, username);
          results.push(userStatus);
          totalFetched.value++;
          ctx.stream?.append("user", userStatus);

          log(`Processed user: ${username} (${userStatus.status})`);
        } catch (error) {
          const errorResult = UserStatusSchema.parse({
            username,
            status: "Error",
            error: error.message,
          });

          results.push(errorResult);
          ctx.stream?.append("user", errorResult);
          errors.push({
            operation: "check_user_status",
            username,
            error: error.message,
          });
          totalFetched.value++;

          log(`Failed to process user ${username}: ${error.message}`, "error");
        }

        update(1);

        // Add delay between requests
        if (config.delay > 0) {
          await delay(config.delay * 1000);
        }
      }
    }
  );

  return results;
}
