/**
 * GitHub Code Search Endpoint
 *
 * Paginated /search/code with custom iteration for the search API
 * response shape ({ total_count, incomplete_results, items }).
 *
 * Forks are excluded by default. Results capped at 1000 (10 pages x 100).
 */

const PER_PAGE = 100;

/**
 * Search GitHub code for component import patterns.
 *
 * Runs separate queries for each import style (destructured and default)
 * because /search/code doesn't support OR for quoted strings.
 * Results are deduplicated by repo + path across queries.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeSearchRequest - SDK search request function.
 * @param {Function} ctx.log - Logger function.
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {{ value: boolean }} ctx.cancelled - Cancellation flag.
 * @param {object} params
 * @param {string} params.componentName - Component name to search for.
 * @param {number} params.maxPages - Maximum pages to fetch (1-10).
 * @param {number} params.minFileSize - Minimum file size filter.
 * @param {string} [params.ownerScope] - Optional owner qualifier (e.g. "org:mui" or "user:octocat").
 * @returns {AsyncGenerator<object>} Yields search result items.
 */
export async function* searchCode(ctx, { componentName, maxPages, minFileSize, ownerScope }) {
  const queries = buildSearchQueries(componentName, minFileSize, ownerScope);
  const seen = new Set();

  for (const query of queries) {
    ctx.log(`Searching: ${query}`);
    ctx.log(`Max pages: ${maxPages} (${maxPages * PER_PAGE} results max)`);

    for (let page = 1; page <= maxPages; page++) {
      if (ctx.cancelled.value) {
        ctx.log("Search cancelled", "warn");
        return;
      }

      ctx.log(`Fetching page ${page}/${maxPages}...`);

      const data = await ctx.makeSearchRequest(
        `GET /search/code`,
        {
          q: query,
          per_page: PER_PAGE,
          page,
        },
      );

      await ctx.debugLog("code-search-page", { page, total_count: data.total_count, items: data.items?.length });

      const items = data.items || [];
      if (items.length === 0) {
        ctx.log(`No more results after page ${page - 1}`);
        break;
      }

      for (const item of items) {
        const key = `${item.repository?.full_name}/${item.path}`;
        if (seen.has(key)) continue;
        seen.add(key);
        yield item;
      }

      // Stop if we've fetched all available results
      if (items.length < PER_PAGE) {
        ctx.log(`All results fetched (${page} page${page > 1 ? "s" : ""})`);
        break;
      }
    }
  }
}

/**
 * Build GitHub code search queries for both import styles.
 *
 * GitHub /search/code doesn't support OR for quoted strings, so we
 * return separate queries for destructured and default imports:
 *   - `"import { Typography }"` → `import { Typography } from '...'`
 *   - `"import Typography from"` → `import Typography from '...'`
 *
 * @param {string} componentName - Component name to search for.
 * @param {number} minFileSize - Minimum file size in bytes.
 * @param {string} [ownerScope] - Optional owner qualifier (e.g. "org:mui" or "user:octocat").
 * @returns {string[]} Array of formatted search queries.
 */
export function buildSearchQueries(componentName, minFileSize, ownerScope) {
  const extensions = `extension:tsx extension:jsx size:>${minFileSize}`;
  const scope = ownerScope ? ` ${ownerScope}` : "";

  return [
    `"import { ${componentName} }" ${extensions}${scope}`,
    `"import ${componentName} from" ${extensions}${scope}`,
  ];
}

/** @deprecated Use buildSearchQueries instead. */
export function buildSearchQuery(componentName, minFileSize, ownerScope) {
  return buildSearchQueries(componentName, minFileSize, ownerScope)[0];
}
