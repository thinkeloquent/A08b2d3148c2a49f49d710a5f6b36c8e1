/**
 * JSDoc type definitions for repository operations.
 * @module sdk/repos/types
 */

/**
 * @typedef {Object} Repository
 * @property {number} id
 * @property {string} node_id
 * @property {string} name
 * @property {string} full_name
 * @property {Object} owner
 * @property {boolean} private
 * @property {string} html_url
 * @property {string} description
 * @property {boolean} fork
 * @property {string} url
 * @property {string} default_branch
 * @property {string} language
 * @property {string[]} topics
 * @property {string} visibility
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} pushed_at
 */

/**
 * @typedef {Object} RepositoryCreate
 * @property {string} name - Repository name
 * @property {string} [description] - Repository description
 * @property {string} [homepage] - Homepage URL
 * @property {boolean} [private=false] - Whether the repo is private
 * @property {boolean} [has_issues=true]
 * @property {boolean} [has_projects=true]
 * @property {boolean} [has_wiki=true]
 * @property {boolean} [auto_init=false]
 * @property {string} [gitignore_template]
 * @property {string} [license_template]
 */

/**
 * @typedef {Object} RepositoryUpdate
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [homepage]
 * @property {boolean} [private]
 * @property {string} [visibility]
 * @property {string} [default_branch]
 * @property {boolean} [has_issues]
 * @property {boolean} [has_projects]
 * @property {boolean} [has_wiki]
 * @property {boolean} [allow_squash_merge]
 * @property {boolean} [allow_merge_commit]
 * @property {boolean} [allow_rebase_merge]
 * @property {boolean} [delete_branch_on_merge]
 */

/**
 * @typedef {Object} RepositoryListOptions
 * @property {string} [type] - 'all' | 'owner' | 'public' | 'private' | 'member'
 * @property {string} [sort] - 'created' | 'updated' | 'pushed' | 'full_name'
 * @property {string} [direction] - 'asc' | 'desc'
 * @property {number} [per_page=30]
 * @property {number} [page=1]
 */

/**
 * @typedef {Object} Fork
 * @property {number} id
 * @property {string} full_name
 * @property {Object} owner
 * @property {string} html_url
 */

/**
 * @typedef {Object} Topic
 * @property {string[]} names
 */

export default {};
