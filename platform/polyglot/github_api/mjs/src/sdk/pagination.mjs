/**
 * Pagination utilities for GitHub API list endpoints.
 * Supports Link-header-based pagination with safety limits.
 * @module sdk/pagination
 */

const DEFAULT_PER_PAGE = 100;
const MAX_PAGES = 1000;

/**
 * Parse the Link header to extract the "next" URL.
 * @param {string|null} linkHeader - The Link header value
 * @returns {string|null} The URL for the next page, or null
 */
function parseNextLink(linkHeader) {
  if (!linkHeader) {
    return null;
  }

  const parts = linkHeader.split(',');
  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="next"/);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Async generator that yields pages of results from a GitHub API list endpoint.
 * Follows Link header rel="next" for automatic pagination.
 *
 * @param {import('./client.mjs').GitHubClient} client - The GitHub client instance
 * @param {string} path - API path (e.g., /repos/:owner/:repo/branches)
 * @param {Object} [options]
 * @param {number} [options.perPage=100] - Results per page
 * @param {number} [options.maxPages=1000] - Maximum pages to fetch (safety limit)
 * @param {Object} [options.params] - Additional query parameters
 * @yields {Array<Object>} Each page of results
 */
export async function* paginate(client, path, options = {}) {
  const {
    perPage = DEFAULT_PER_PAGE,
    maxPages = MAX_PAGES,
    params = {},
  } = options;

  const queryParams = new URLSearchParams({
    per_page: String(perPage),
    ...params,
  });

  let url = `${path}?${queryParams.toString()}`;
  let page = 0;

  const logger = client.logger || {
    debug() {},
    info() {},
    warn() {},
    error() {},
  };

  while (url && page < maxPages) {
    page++;
    logger.debug(`Fetching page ${page}`, { url });

    const response = await client.getRaw(url);
    const body = await response.json();

    yield Array.isArray(body) ? body : [body];

    const linkHeader = response.headers.get('link');
    const nextUrl = parseNextLink(linkHeader);

    if (!nextUrl) {
      break;
    }

    // The next URL from GitHub is a full URL; extract just the path + query
    try {
      const parsed = new URL(nextUrl);
      url = parsed.pathname + parsed.search;
    } catch {
      url = nextUrl;
    }
  }

  if (page >= maxPages) {
    logger.warn(`Reached maximum page limit (${maxPages})`);
  }
}

/**
 * Collect all pages from a paginated endpoint into a single array.
 *
 * @param {import('./client.mjs').GitHubClient} client - The GitHub client instance
 * @param {string} path - API path
 * @param {Object} [options] - Same options as paginate()
 * @returns {Promise<Array<Object>>} All results combined
 */
export async function paginateAll(client, path, options = {}) {
  const results = [];

  for await (const page of paginate(client, path, options)) {
    results.push(...page);
  }

  return results;
}
