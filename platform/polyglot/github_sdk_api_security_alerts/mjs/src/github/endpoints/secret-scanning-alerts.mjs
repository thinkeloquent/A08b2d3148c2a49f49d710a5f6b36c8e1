/**
 * GitHub Secret Scanning Alerts Endpoint
 *
 * Paginated GET /repos/{owner}/{repo}/secret-scanning/alerts
 * with per_page=100 page-based iteration.
 */

const PER_PAGE = 100;

/**
 * Fetch secret scanning alerts for a repository.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeRequest - SDK core request function.
 * @param {Function} ctx.log - Logger function.
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {{ value: boolean }} ctx.cancelled - Cancellation flag.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {string} [params.state="open"] - Alert state: open, resolved.
 * @param {string} [params.secretType] - Filter by secret type (e.g., "github_personal_access_token").
 * @param {string} [params.validity] - Filter by validity: active, inactive, unknown.
 * @returns {AsyncGenerator<object>} Yields individual alert objects.
 */
export async function* fetchSecretScanningAlerts(ctx, { owner, repo, state = "open", secretType, validity }) {
  ctx.log(`Fetching secret-scanning alerts for ${owner}/${repo} (state=${state})`);

  let page = 1;
  let totalYielded = 0;

  while (true) {
    if (ctx.cancelled.value) {
      ctx.log("Secret scanning fetch cancelled", "warn");
      return;
    }

    const params = {
      owner,
      repo,
      state,
      per_page: PER_PAGE,
      page,
    };
    if (secretType) params.secret_type = secretType;
    if (validity) params.validity = validity;

    let data;
    try {
      data = await ctx.makeRequest(`GET /repos/${owner}/${repo}/secret-scanning/alerts`, params);
    } catch (err) {
      if (err.status === 403) {
        ctx.log(`Secret scanning not available for ${owner}/${repo} (403 — may require GitHub Advanced Security)`, "warn");
        return;
      }
      if (err.status === 404) {
        ctx.log(`No secret scanning data for ${owner}/${repo} (404)`, "warn");
        return;
      }
      throw err;
    }

    await ctx.debugLog("secret-scanning-page", { page, count: Array.isArray(data) ? data.length : 0 });

    const alerts = Array.isArray(data) ? data : [];
    if (alerts.length === 0) {
      ctx.log(`No more secret-scanning alerts after page ${page - 1}`);
      break;
    }

    for (const alert of alerts) {
      totalYielded++;
      yield alert;
    }

    if (alerts.length < PER_PAGE) {
      ctx.log(`All secret-scanning alerts fetched (${page} page${page > 1 ? "s" : ""}, ${totalYielded} alerts)`);
      break;
    }

    page++;
  }
}
