/**
 * API Uploader
 * Uploads extracted rule tree data to the rule-tree-table API.
 */

const DEFAULT_API_BASE = 'http://localhost:51000/~/api/rule_tree_table';

/**
 * Create an API uploader for the rule-tree-table service.
 * @param {{ apiBase?: string }} options
 */
export function createApiUploader({ apiBase = DEFAULT_API_BASE } = {}) {
  return {
    /**
     * Upload a complete rule tree (creates a new tree with rules).
     * @param {object} ruleTreeData - { name, description, is_active, rules }
     * @returns {Promise<{ success: boolean, id?: string, name: string, error?: string }>}
     */
    async uploadTree(ruleTreeData) {
      try {
        const res = await fetch(`${apiBase}/trees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ruleTreeData),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          return {
            success: false,
            name: ruleTreeData.name,
            error: `HTTP ${res.status}: ${body}`,
          };
        }

        const data = await res.json();
        return {
          success: true,
          id: data.tree?.id || data.id,
          name: ruleTreeData.name,
        };
      } catch (err) {
        return {
          success: false,
          name: ruleTreeData.name,
          error: err.message,
        };
      }
    },

    /**
     * Validate rules without saving.
     * @param {object} rules - Nested rule structure
     * @returns {Promise<{ valid: boolean, errors?: string[] }>}
     */
    async validateRules(rules) {
      try {
        const res = await fetch(`${apiBase}/rules/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rules }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          return { valid: false, errors: [`HTTP ${res.status}: ${body}`] };
        }

        const data = await res.json();
        return { valid: data.valid ?? data.is_valid ?? true, errors: data.errors };
      } catch (err) {
        return { valid: false, errors: [err.message] };
      }
    },

    /**
     * Check API health.
     * @returns {Promise<boolean>}
     */
    async checkHealth() {
      try {
        const res = await fetch(apiBase, { method: 'GET' });
        return res.ok;
      } catch {
        return false;
      }
    },
  };
}
