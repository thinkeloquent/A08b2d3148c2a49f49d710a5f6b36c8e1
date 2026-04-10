/**
 * Raw Content Endpoint
 *
 * Fetches file contents using the raw media type header
 * (application/vnd.github.v3.raw) to avoid Base64 encoding overhead.
 */

/**
 * Fetch raw file content from GitHub.
 *
 * @param {object} ctx - Shared context from the service.
 * @param {Function} ctx.makeRequest - SDK-managed request function (rate-limited, logged).
 * @param {Function} ctx.debugLog - Debug logger function.
 * @param {object} params
 * @param {string} params.owner - Repository owner.
 * @param {string} params.repo - Repository name.
 * @param {string} params.path - File path within the repository.
 * @param {string} [params.ref] - Git ref (branch, tag, SHA). Defaults to default branch.
 * @returns {Promise<string>} Raw file content as a string.
 */
export async function fetchRawContent(ctx, { owner, repo, path, ref }) {
  const data = await ctx.makeRequest(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner,
      repo,
      path,
      ...(ref ? { ref } : {}),
      headers: {
        Accept: "application/vnd.github.v3.raw",
      },
    },
  );

  await ctx.debugLog("raw-content", { owner, repo, path, length: data?.length });

  // Octokit returns Buffer or string depending on the Accept header
  return typeof data === "string"
    ? data
    : String(data);
}
