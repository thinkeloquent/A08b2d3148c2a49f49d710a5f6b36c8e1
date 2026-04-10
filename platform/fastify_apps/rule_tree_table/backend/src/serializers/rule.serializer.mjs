/**
 * Rule Serializer
 * Converts between Sequelize models and API response formats
 */

/**
 * Convert timestamp to ISO string
 */
function toTimestamp(date) {
  if (!date) return null;
  return date instanceof Date ? date.toISOString() : date;
}

/**
 * Serialize a rule tree for API response
 * @param {object} tree - Plain tree object (from service)
 * @returns {object} Serialized tree
 */
export function serializeTree(tree) {
  return {
    id: tree.id,
    name: tree.name,
    description: tree.description || '',
    is_active: tree.is_active,
    stats: tree.stats || null,
    rules: tree.rules || [],
    repo_url: tree.repo_url || null,
    branch: tree.branch || null,
    commit_sha: tree.commit_sha || null,
    git_tag: tree.git_tag || null,
    graph_type: tree.graph_type || 'conditional_logic',
    language: tree.language || '',
    created_at: toTimestamp(tree.createdAt || tree.created_at),
    updated_at: toTimestamp(tree.updatedAt || tree.updated_at),
  };
}

/**
 * Serialize a tree list item (without nested rules)
 * @param {object} tree - Plain tree object
 * @returns {object} Serialized tree summary
 */
export function serializeTreeSummary(tree) {
  return {
    id: tree.id,
    name: tree.name,
    description: tree.description || '',
    is_active: tree.is_active,
    stats: tree.stats || null,
    repo_url: tree.repo_url || null,
    branch: tree.branch || null,
    commit_sha: tree.commit_sha || null,
    git_tag: tree.git_tag || null,
    graph_type: tree.graph_type || 'conditional_logic',
    language: tree.language || '',
    created_at: toTimestamp(tree.createdAt || tree.created_at),
    updated_at: toTimestamp(tree.updatedAt || tree.updated_at),
  };
}

/**
 * Build pagination response
 */
export function paginationResponse(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
