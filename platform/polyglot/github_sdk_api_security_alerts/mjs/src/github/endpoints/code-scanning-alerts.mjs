/**
 * GitHub Code Scanning Alerts Endpoint
 *
 * Paginated GET /repos/{owner}/{repo}/code-scanning/alerts
 * with per_page=100 page-based iteration.
 *
 * Supports state/severity/tool filters. Yields individual alert objects.
 */

const PER_PAGE = 100;

/**
 * Fetch code scanning (CodeQL) alerts for a repository.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeRequest - SDK core request function.
 * @param {Function} ctx.log - Logger function.
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {{ value: boolean }} ctx.cancelled - Cancellation flag.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {string} [params.state="open"] - Alert state: open, closed, dismissed, fixed.
 * @param {string} [params.severity] - Filter by rule severity: critical, high, medium, low, warning, note, error.
 * @param {string} [params.toolName] - Filter by tool name (e.g., "CodeQL").
 * @param {string} [params.ref] - Git ref to filter alerts for.
 * @returns {AsyncGenerator<object>} Yields individual alert objects.
 */
export async function* fetchCodeScanningAlerts(ctx, { owner, repo, state = "open", severity, toolName, ref }) {
  ctx.log(`Fetching code-scanning alerts for ${owner}/${repo} (state=${state})`);

  let page = 1;
  let totalYielded = 0;

  while (true) {
    if (ctx.cancelled.value) {
      ctx.log("Code scanning fetch cancelled", "warn");
      return;
    }

    const params = {
      owner,
      repo,
      state,
      per_page: PER_PAGE,
      page,
    };
    if (severity) params.severity = severity;
    if (toolName) params.tool_name = toolName;
    if (ref) params.ref = ref;

    let data;
    try {
      data = await ctx.makeRequest(`GET /repos/${owner}/${repo}/code-scanning/alerts`, params);
    } catch (err) {
      if (err.status === 403) {
        ctx.log(`Code scanning not available for ${owner}/${repo} (403 — GitHub Advanced Security may not be enabled)`, "warn");
        return;
      }
      if (err.status === 404) {
        ctx.log(`No code scanning alerts found for ${owner}/${repo} (404)`, "warn");
        return;
      }
      throw err;
    }

    await ctx.debugLog("code-scanning-page", { page, count: Array.isArray(data) ? data.length : 0 });

    const alerts = Array.isArray(data) ? data : [];
    if (alerts.length === 0) {
      ctx.log(`No more code-scanning alerts after page ${page - 1}`);
      break;
    }

    for (const alert of alerts) {
      totalYielded++;
      yield alert;
    }

    if (alerts.length < PER_PAGE) {
      ctx.log(`All code-scanning alerts fetched (${page} page${page > 1 ? "s" : ""}, ${totalYielded} alerts)`);
      break;
    }

    page++;
  }
}

/**
 * Fetch a single code scanning alert by number.
 *
 * @param {object} ctx - Shared context.
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {number} params.alertNumber
 * @returns {Promise<object>} Alert object.
 */
export async function fetchCodeScanningAlert(ctx, { owner, repo, alertNumber }) {
  return ctx.makeRequest(`GET /repos/${owner}/${repo}/code-scanning/alerts/${alertNumber}`);
}
