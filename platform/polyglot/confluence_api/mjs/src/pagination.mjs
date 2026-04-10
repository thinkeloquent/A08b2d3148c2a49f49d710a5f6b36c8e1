/**
 * @module pagination
 * @description Pagination utilities for the Confluence Data Center REST API.
 *
 * Confluence uses two pagination strategies:
 *
 * 1. **Offset-based pagination** — Most endpoints use `start` (0-based offset) and
 *    `limit` (page size) parameters. The response includes `results[]`, `start`,
 *    `limit`, and `size` fields. Iteration stops when `size < limit`.
 *
 * 2. **Cursor-based pagination** — The `/content/scan` endpoint (and a few others)
 *    use an opaque `cursor` token. The response includes `_links.next` with the
 *    cursor for the subsequent page. Iteration stops when `_links.next` is absent.
 *
 * Both strategies are exposed as async generators that yield individual items,
 * abstracting away the underlying pagination mechanics.
 *
 * @example
 * // Offset-based: iterate all pages in a space
 * for await (const page of paginateOffset(client, '/rest/api/content', {
 *   spaceKey: 'DEV', type: 'page'
 * })) {
 *   console.log(page.title);
 * }
 *
 * // Cursor-based: scan all content
 * for await (const item of paginateCursor(client, '/rest/api/content/scan')) {
 *   console.log(item.id);
 * }
 */

/**
 * Async generator for offset-based pagination.
 *
 * Fetches pages of results from a Confluence REST endpoint using `start` and `limit`
 * query parameters. Yields individual items from each page's `results` array.
 * Automatically advances the offset until the server returns fewer results than
 * the requested limit, indicating the final page.
 *
 * @template T
 * @param {import('./client/ConfluenceFetchClient.mjs').ConfluenceFetchClient} client
 *   The Confluence fetch client instance.
 * @param {string} endpoint - API endpoint path (e.g. '/rest/api/content').
 * @param {Record<string, unknown>} [params={}] - Additional query parameters
 *   (e.g. spaceKey, type, expand).
 * @param {Object} [options={}] - Pagination options.
 * @param {number} [options.start=0] - Initial offset (0-based).
 * @param {number} [options.limit=25] - Page size (max items per request).
 * @yields {T} Individual result items from each page.
 *
 * @example
 * const client = new ConfluenceFetchClient({ baseUrl, username, apiToken });
 * for await (const page of paginateOffset(client, '/rest/api/content', {
 *   spaceKey: 'DEV',
 *   type: 'page',
 *   expand: 'version,space',
 * }, { limit: 50 })) {
 *   console.log(page.id, page.title);
 * }
 */
export async function* paginateOffset(client, endpoint, params = {}, { start = 0, limit = 25 } = {}) {
  let currentStart = start;

  while (true) {
    const queryParams = {
      ...params,
      start: currentStart,
      limit,
    };

    /** @type {{ results?: T[], start?: number, limit?: number, size?: number }} */
    const response = await client.get(endpoint, { queryParams });

    const results = response.results ?? [];
    for (const item of results) {
      yield item;
    }

    // If we received fewer results than the limit, we've reached the last page
    const size = response.size ?? results.length;
    if (size < limit) {
      break;
    }

    currentStart += size;
  }
}

/**
 * Async generator for cursor-based pagination.
 *
 * Fetches pages of results from a Confluence REST endpoint (typically
 * `/content/scan`) using an opaque cursor token. Yields individual items from
 * each page's `results` array. Automatically follows `_links.next` until no
 * further cursor is provided.
 *
 * @template T
 * @param {import('./client/ConfluenceFetchClient.mjs').ConfluenceFetchClient} client
 *   The Confluence fetch client instance.
 * @param {string} endpoint - API endpoint path (e.g. '/rest/api/content/scan').
 * @param {Record<string, unknown>} [params={}] - Additional query parameters
 *   (e.g. expand, cql).
 * @param {Object} [options={}] - Pagination options.
 * @param {number} [options.limit=25] - Page size (max items per request).
 * @yields {T} Individual result items from each page.
 *
 * @example
 * for await (const content of paginateCursor(client, '/rest/api/content/scan', {
 *   expand: 'version',
 * }, { limit: 100 })) {
 *   console.log(content.id, content.type);
 * }
 */
export async function* paginateCursor(client, endpoint, params = {}, { limit = 25 } = {}) {
  let cursor = undefined;

  while (true) {
    const queryParams = {
      ...params,
      limit,
    };

    if (cursor) {
      queryParams.cursor = cursor;
    }

    /** @type {{ results?: T[], _links?: { next?: string } }} */
    const response = await client.get(endpoint, { queryParams });

    const results = response.results ?? [];
    for (const item of results) {
      yield item;
    }

    // Extract cursor from _links.next
    // Confluence returns _links.next as a relative URL with query params including cursor
    const nextLink = response._links?.next;
    if (!nextLink) {
      break;
    }

    // Parse the cursor from the next link URL
    try {
      // _links.next may be a relative path like "/rest/api/content/scan?cursor=abc123&limit=25"
      const nextUrl = new URL(nextLink, 'http://placeholder');
      const nextCursor = nextUrl.searchParams.get('cursor');
      if (!nextCursor) {
        break;
      }
      cursor = nextCursor;
    } catch {
      // If we can't parse the next link, stop pagination
      break;
    }
  }
}

/**
 * Build a comma-separated `expand` parameter value from an array of field names.
 *
 * Confluence REST APIs use the `expand` query parameter to include additional
 * data in responses. This utility joins an array of field names with commas,
 * handling null/undefined inputs gracefully.
 *
 * @param {string|string[]|null|undefined} fields - Field names to expand.
 * @returns {string|undefined} Comma-separated string, or undefined if no fields provided.
 *
 * @example
 * buildExpand(['body.storage', 'version', 'space']);
 * // => 'body.storage,version,space'
 *
 * buildExpand('body.storage');
 * // => 'body.storage'
 *
 * buildExpand(null);
 * // => undefined
 */
export function buildExpand(fields) {
  if (!fields) return undefined;
  if (typeof fields === 'string') return fields;
  if (Array.isArray(fields) && fields.length > 0) {
    return fields.join(',');
  }
  return undefined;
}
