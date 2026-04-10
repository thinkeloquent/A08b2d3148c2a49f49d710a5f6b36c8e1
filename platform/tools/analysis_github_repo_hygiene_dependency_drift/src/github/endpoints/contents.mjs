/**
 * Fetch a file's contents from a GitHub repository using the Contents API.
 * Returns the decoded content (Base64 → UTF-8) and metadata.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to file in repo
 * @returns {Promise<{content: string, sha: string, path: string} | null>}
 */
export async function fetchFileContents(ctx, owner, repo, filePath) {
  const { makeRequest, log, cache } = ctx;

  const cacheKey = `contents:${owner}/${repo}:${filePath}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const data = await makeRequest(
      "GET /repos/{owner}/{repo}/contents/{path}",
      { owner, repo, path: filePath }
    );

    // Only handle files, not directories
    if (data.type !== "file") {
      log(`${filePath} in ${owner}/${repo} is not a file, skipping`);
      return null;
    }

    // Decode base64 content
    const content = Buffer.from(data.content, "base64").toString("utf-8");

    const result = {
      content,
      sha: data.sha,
      path: data.path,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    if (error.status === 404) {
      // File does not exist in this repo — normal, not an error
      return null;
    }
    if (error.status === 403) {
      log(`File ${filePath} in ${owner}/${repo} is too large for Contents API, skipping`, "warn");
      return null;
    }
    log(`Failed to fetch ${filePath} from ${owner}/${repo}: ${error.message}`, "warn");
    return null;
  }
}

/**
 * Fetch the most recent commit for a specific file path.
 * Used to determine when a dependency file was last updated.
 *
 * @param {object} ctx - Shared context
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filePath - Path to file in repo
 * @returns {Promise<{date: string, sha: string} | null>}
 */
export async function fetchFileLastCommit(ctx, owner, repo, filePath) {
  const { makeRequest, log, cache } = ctx;

  const cacheKey = `lastCommit:${owner}/${repo}:${filePath}`;
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  try {
    const data = await makeRequest(
      "GET /repos/{owner}/{repo}/commits",
      { owner, repo, path: filePath, per_page: 1 }
    );

    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const commit = data[0];
    const result = {
      date: commit.commit?.author?.date || commit.commit?.committer?.date || null,
      sha: commit.sha,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    log(`Failed to fetch last commit for ${filePath} in ${owner}/${repo}: ${error.message}`, "warn");
    return null;
  }
}
