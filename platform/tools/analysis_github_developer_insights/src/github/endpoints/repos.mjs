/**
 * Discover repositories where a user has activity using GraphQL search.
 * This is a tool-specific endpoint — uses GraphQL to find repos by commit activity,
 * which differs from the SDK's fetchUserRepos (REST-based user/org repo listing).
 *
 * @param {Function} makeGraphQLRequest
 * @param {object} config - Validated config
 * @param {{ log: Function }} deps
 * @returns {Promise<string[]>} Array of "owner/repo" names
 */
export async function discoverUserRepositories(makeGraphQLRequest, config, { log }) {
  const query = `
    query($searchQuery: String!) {
      search(
        type: REPOSITORY
        query: $searchQuery
        first: 100
      ) {
        nodes {
          ... on Repository {
            nameWithOwner
            name
            owner {
              login
            }
          }
        }
      }
    }
  `;

  try {
    let searchQuery;
    if (!config.ignoreDateRange && config.start && config.end) {
      searchQuery = `pushed:${config.start}..${config.end} committer:${config.searchUser}`;
    } else {
      searchQuery = `committer:${config.searchUser}`;
    }

    const result = await makeGraphQLRequest(query, { searchQuery });
    return result.search.nodes.map((repo) => repo.nameWithOwner);
  } catch (error) {
    log(
      `Failed to discover repositories, using fallback method: ${error.message}`,
      "warn"
    );
    return [];
  }
}
