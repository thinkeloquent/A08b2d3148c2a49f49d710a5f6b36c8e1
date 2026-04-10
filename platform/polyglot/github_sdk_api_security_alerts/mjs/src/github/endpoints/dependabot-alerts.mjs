/**
 * GitHub Dependabot Alerts Endpoint
 *
 * Paginated GET /repos/{owner}/{repo}/dependabot/alerts
 * using Octokit's built-in cursor-based pagination (Link header).
 *
 * The Dependabot API does NOT support `page` parameter — it uses
 * cursor-based `before`/`after` params via Link headers.
 * See: https://docs.github.com/rest/dependabot/alerts#list-dependabot-alerts-for-a-repository
 */

const PER_PAGE = 100;

/**
 * Fetch Dependabot alerts for a repository.
 *
 * Uses `ctx.octokit.paginate.iterator()` for automatic cursor pagination.
 * Falls back to a single non-paginated request if octokit is not on ctx.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {object} ctx.octokit - Octokit instance (needed for cursor pagination).
 * @param {Function} ctx.makeRequest - SDK core request function (fallback).
 * @param {Function} ctx.log - Logger function.
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {{ value: boolean }} ctx.cancelled - Cancellation flag.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {string} [params.state="open"] - Alert state: open, dismissed, fixed, auto_dismissed.
 * @param {string} [params.severity] - Filter by severity: critical, high, medium, low.
 * @param {string} [params.ecosystem] - Filter by ecosystem: npm, pip, maven, nuget, rubygems, composer, go, rust, pub.
 * @param {string} [params.scope] - Filter by scope: runtime, development.
 * @returns {AsyncGenerator<object>} Yields individual alert objects.
 */
export async function* fetchDependabotAlerts(ctx, { owner, repo, state = "open", severity, ecosystem, scope }) {
  ctx.log(`Fetching dependabot alerts for ${owner}/${repo} (state=${state})`);

  const requestParams = { owner, repo, state, per_page: PER_PAGE };
  if (severity) requestParams.severity = severity;
  if (ecosystem) requestParams.ecosystem = ecosystem;
  if (scope) requestParams.scope = scope;

  // ── Octokit paginate path (handles cursor-based Link headers) ──────────

  if (ctx.octokit) {
    let totalYielded = 0;
    let batch = 0;

    try {
      const iterator = ctx.octokit.paginate.iterator(
        "GET /repos/{owner}/{repo}/dependabot/alerts",
        requestParams,
      );

      for await (const { data: alerts } of iterator) {
        if (ctx.cancelled.value) {
          ctx.log("Dependabot fetch cancelled", "warn");
          return;
        }

        batch++;
        await ctx.debugLog("dependabot-batch", { batch, count: alerts.length });

        for (const alert of alerts) {
          totalYielded++;
          yield alert;
        }
      }
    } catch (err) {
      if (err.status === 403) {
        ctx.log(`Dependabot alerts not available for ${owner}/${repo} (403)`, "warn");
        return;
      }
      if (err.status === 404) {
        ctx.log(`No dependabot data for ${owner}/${repo} (404)`, "warn");
        return;
      }
      throw err;
    }

    ctx.log(`All dependabot alerts fetched (${batch} batch${batch !== 1 ? "es" : ""}, ${totalYielded} alerts)`);
    return;
  }

  // ── Fallback: single request via makeRequest (no pagination) ───────────

  ctx.log("No octokit on ctx — fetching single batch only", "warn");

  let data;
  try {
    data = await ctx.makeRequest(
      `GET /repos/${owner}/${repo}/dependabot/alerts`,
      requestParams,
    );
  } catch (err) {
    if (err.status === 403) {
      ctx.log(`Dependabot alerts not available for ${owner}/${repo} (403)`, "warn");
      return;
    }
    if (err.status === 404) {
      ctx.log(`No dependabot data for ${owner}/${repo} (404)`, "warn");
      return;
    }
    throw err;
  }

  const alerts = Array.isArray(data) ? data : [];
  for (const alert of alerts) {
    yield alert;
  }

  ctx.log(`Dependabot alerts fetched (single batch, ${alerts.length} alerts)`);
}
