/**
 * Pagination Module — Statsig Console API Client
 *
 * Auto-pagination utilities for Statsig Console API list endpoints.
 * The API uses cursor-based pagination with a `pagination.nextPage` field
 * containing the full URL for the next page of results.
 *
 * Provides:
 *   - `paginate()` — async generator yielding each page's data array
 *   - `listAll()` — convenience function collecting all pages into a single array
 */

import { create } from './logger.mjs';

const log = create('statsig-api', import.meta.url);

/**
 * Async generator that auto-paginates through a Statsig Console API list endpoint.
 *
 * Each iteration yields the `data` array from a single page. The generator
 * follows `pagination.nextPage` URLs until there are no more pages.
 *
 * @param {import('./client.mjs').StatsigClient} client - The StatsigClient instance
 * @param {string} path - API path for the first page (e.g. "/experiments")
 * @param {import('./types.mjs').RequestOptions} [options={}] - Request options (params, headers)
 * @yields {Array<*>} The data array from each page
 *
 * @example
 * for await (const page of paginate(client, '/experiments')) {
 *   for (const experiment of page) {
 *     console.log(experiment.name);
 *   }
 * }
 */
export async function* paginate(client, path, options = {}) {
  let pageNum = 1;
  let currentPath = path;
  let isFirstPage = true;

  while (currentPath) {
    log.debug(`fetching page ${pageNum}`, { path: currentPath });

    let response;
    if (isFirstPage) {
      response = await client.get(currentPath, options);
      isFirstPage = false;
    } else {
      // Subsequent pages use full URLs from pagination.nextPage
      response = await client.get(currentPath);
    }

    // Extract data array from response
    const data = response?.data ?? (Array.isArray(response) ? response : []);
    log.debug(`page ${pageNum} received`, { itemCount: data.length });

    yield data;

    // Check for next page
    const nextPage = response?.pagination?.nextPage || null;
    if (nextPage) {
      currentPath = nextPage;
      pageNum++;
    } else {
      currentPath = null;
    }
  }

  log.debug('pagination complete', { totalPages: pageNum });
}

/**
 * Convenience function that collects all pages from a paginated endpoint
 * into a single flat array.
 *
 * @param {import('./client.mjs').StatsigClient} client - The StatsigClient instance
 * @param {string} path - API path for the first page
 * @param {import('./types.mjs').RequestOptions} [options={}] - Request options (params, headers)
 * @returns {Promise<Array<*>>} All items across all pages
 *
 * @example
 * const allExperiments = await listAll(client, '/experiments');
 * console.log(`Found ${allExperiments.length} experiments total`);
 */
export async function listAll(client, path, options = {}) {
  const results = [];

  for await (const page of paginate(client, path, options)) {
    results.push(...page);
  }

  log.debug('listAll complete', { path, totalItems: results.length });
  return results;
}
