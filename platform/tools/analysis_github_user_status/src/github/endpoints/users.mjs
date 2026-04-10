import { UserDetailsSchema } from "../../domain/models.mjs";

/**
 * Validate a GitHub user by fetching their profile.
 * Returns user details on success (HTTP 200 = Active).
 *
 * @param {Function} makeRequest
 * @param {string} username
 * @param {{ log: Function }} deps
 * @returns {Promise<{ username: string, status: string, details?: object }>}
 */
export async function validateUser(makeRequest, username, { log }) {
  try {
    const data = await makeRequest(`GET /users/{username}`, { username });
    log(`User '${username}' is active`);

    const userDetails = UserDetailsSchema.parse(data);

    return {
      username,
      status: "Active",
      details: {
        id: userDetails.id,
        name: userDetails.name,
        created_at: userDetails.created_at,
        updated_at: userDetails.updated_at,
        public_repos: userDetails.public_repos,
        followers: userDetails.followers,
        following: userDetails.following,
        bio: userDetails.bio,
        location: userDetails.location,
        company: userDetails.company,
        blog: userDetails.blog,
        twitter_username: userDetails.twitter_username,
      },
    };
  } catch (error) {
    if (error.status === 404) {
      return null; // Caller must check search API
    }
    throw error;
  }
}

/**
 * Search for a user via the GitHub Search API to differentiate
 * between suspended and truly not-found users.
 *
 * @param {Function} makeRequest
 * @param {string} username
 * @param {object} searchLimiter
 * @param {{ log: Function }} deps
 * @returns {Promise<{ found: boolean, details?: object }>}
 */
export async function searchForUser(makeRequest, username, searchLimiter, { log }) {
  try {
    const data = await makeRequest(
      "GET /search/users",
      { q: `user:${username}` },
      searchLimiter
    );

    if (data.total_count > 0) {
      const user = data.items[0];
      log(`User '${username}' found in search but not accessible (likely suspended)`, "warn");

      return {
        found: true,
        details: {
          id: user.id,
          name: user.login,
          created_at: null,
        },
      };
    }

    log(`User '${username}' not found in search`);
    return { found: false };
  } catch (error) {
    log(`Search API failed for user '${username}': ${error.message}`, "warn");
    return { found: false };
  }
}
