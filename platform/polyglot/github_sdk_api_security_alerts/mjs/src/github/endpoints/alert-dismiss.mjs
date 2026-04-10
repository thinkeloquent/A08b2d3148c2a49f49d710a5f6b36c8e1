/**
 * GitHub Security Alert Dismiss/Close Endpoints
 *
 * PATCH endpoints for dismissing or closing security alerts.
 * These are write operations — use with caution.
 */

/**
 * Fetch the default branch name for a repository.
 *
 * @param {object} ctx - Shared context.
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @returns {Promise<string>} Default branch name (e.g., "main").
 */
export async function fetchDefaultBranch(ctx, { owner, repo }) {
  const data = await ctx.makeRequest(`GET /repos/${owner}/${repo}`);
  return data.default_branch;
}

/**
 * Dismiss a code scanning alert.
 *
 * @param {object} ctx - Shared context.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {number} params.alertNumber - Alert number.
 * @param {string} params.dismissedReason - Reason: "false positive", "won't fix", "used in tests".
 * @param {string} [params.dismissedComment] - Optional dismissal comment.
 * @returns {Promise<object>} Updated alert object.
 */
export async function dismissCodeScanningAlert(ctx, { owner, repo, alertNumber, dismissedReason, dismissedComment }) {
  ctx.log(`Dismissing code-scanning alert #${alertNumber} in ${owner}/${repo} (reason: ${dismissedReason})`);

  const body = {
    state: "dismissed",
    dismissed_reason: dismissedReason,
  };
  if (dismissedComment) body.dismissed_comment = dismissedComment;

  return ctx.makeRequest(`PATCH /repos/${owner}/${repo}/code-scanning/alerts/${alertNumber}`, body);
}

/**
 * Resolve a secret scanning alert.
 *
 * @param {object} ctx - Shared context.
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {number} params.alertNumber
 * @param {string} params.resolution - Resolution: "false_positive", "wont_fix", "revoked", "used_in_tests".
 * @param {string} [params.comment] - Optional comment.
 * @returns {Promise<object>} Updated alert object.
 */
export async function resolveSecretScanningAlert(ctx, { owner, repo, alertNumber, resolution, comment }) {
  ctx.log(`Resolving secret-scanning alert #${alertNumber} in ${owner}/${repo} (resolution: ${resolution})`);

  const body = {
    state: "resolved",
    resolution,
  };
  if (comment) body.comment = comment;

  return ctx.makeRequest(`PATCH /repos/${owner}/${repo}/secret-scanning/alerts/${alertNumber}`, body);
}

/**
 * Dismiss a Dependabot alert.
 *
 * @param {object} ctx - Shared context.
 * @param {object} params
 * @param {string} params.owner
 * @param {string} params.repo
 * @param {number} params.alertNumber
 * @param {string} params.dismissedReason - Reason: "fix_started", "inaccurate", "no_bandwidth", "not_used", "tolerable_risk".
 * @param {string} [params.dismissedComment] - Optional comment.
 * @returns {Promise<object>} Updated alert object.
 */
export async function dismissDependabotAlert(ctx, { owner, repo, alertNumber, dismissedReason, dismissedComment }) {
  ctx.log(`Dismissing dependabot alert #${alertNumber} in ${owner}/${repo} (reason: ${dismissedReason})`);

  const body = {
    state: "dismissed",
    dismissed_reason: dismissedReason,
  };
  if (dismissedComment) body.dismissed_comment = dismissedComment;

  return ctx.makeRequest(`PATCH /repos/${owner}/${repo}/dependabot/alerts/${alertNumber}`, body);
}
