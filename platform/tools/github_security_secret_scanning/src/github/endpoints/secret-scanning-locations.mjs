/**
 * GitHub Secret Scanning Alert Locations Endpoint
 *
 * Paginated GET /repos/{owner}/{repo}/secret-scanning/alerts/{alert_number}/locations
 * with per_page=100 page-based iteration.
 */

const PER_PAGE = 100;

/**
 * Fetch locations for a specific secret scanning alert.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeRequest - SDK core request function.
 * @param {Function} ctx.log - Logger function.
 * @param {{ value: boolean }} ctx.cancelled - Cancellation flag.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {number} params.alertNumber - Alert number.
 * @returns {AsyncGenerator<object>} Yields individual location objects.
 */
export async function* fetchSecretScanningLocations(ctx, { owner, repo, alertNumber }) {
  ctx.log(`Fetching locations for secret-scanning alert #${alertNumber}`);

  let page = 1;
  let totalYielded = 0;

  while (true) {
    if (ctx.cancelled.value) {
      ctx.log("Location fetch cancelled", "warn");
      return;
    }

    let data;
    try {
      data = await ctx.makeRequest(
        `GET /repos/${owner}/${repo}/secret-scanning/alerts/${alertNumber}/locations`,
        { per_page: PER_PAGE, page }
      );
    } catch (err) {
      if (err.status === 404) {
        ctx.log(`No locations found for alert #${alertNumber} (404)`, "warn");
        return;
      }
      throw err;
    }

    const locations = Array.isArray(data) ? data : [];
    if (locations.length === 0) break;

    for (const loc of locations) {
      totalYielded++;
      yield loc;
    }

    if (locations.length < PER_PAGE) break;
    page++;
  }

  ctx.log(`Fetched ${totalYielded} location(s) for alert #${alertNumber}`);
}
