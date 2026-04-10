/**
 * API Uploader
 * Uploads extracted component data to the ui-component-metadata API.
 */

const DEFAULT_API_BASE = 'http://localhost:51000/api/ui-component-metadata';

/**
 * Create an API uploader for the ui-component-metadata service.
 * @param {{ apiBase?: string }} options
 */
export function createApiUploader({ apiBase = DEFAULT_API_BASE } = {}) {
  const componentsUrl = `${apiBase}/components`;

  return {
    /**
     * Upload a single component definition.
     * @param {object} componentData - POST body matching the component schema
     * @returns {Promise<{ success: boolean, id?: string, name: string, error?: string }>}
     */
    async uploadComponent(componentData) {
      try {
        const res = await fetch(componentsUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(componentData),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => '');
          return {
            success: false,
            name: componentData.name,
            error: `HTTP ${res.status}: ${body}`,
          };
        }

        const data = await res.json();
        return {
          success: true,
          id: data.component?.id,
          name: componentData.name,
        };
      } catch (err) {
        return {
          success: false,
          name: componentData.name,
          error: err.message,
        };
      }
    },

    /**
     * Upload all components from a payload with progress reporting.
     * @param {object[]} components - Array of component POST bodies
     * @param {{ onProgress?: (current: number, total: number, result: object) => void, delay?: number }} options
     * @returns {Promise<{ uploaded: number, failed: number, results: object[] }>}
     */
    async uploadAll(components, { onProgress, delay = 100 } = {}) {
      const results = [];
      let uploaded = 0;
      let failed = 0;

      for (let i = 0; i < components.length; i++) {
        const result = await this.uploadComponent(components[i]);
        results.push(result);

        if (result.success) uploaded++;
        else failed++;

        if (onProgress) onProgress(i + 1, components.length, result);

        // Small delay between requests to avoid overwhelming the server
        if (delay > 0 && i < components.length - 1) {
          await new Promise(r => setTimeout(r, delay));
        }
      }

      return { uploaded, failed, results };
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
