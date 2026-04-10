/**
 * @fileoverview OpenAI provider — lazy-loaded.
 */

let _client = null;

/**
 * Get or create a lazy-initialized OpenAI client.
 * Requires the `openai` npm package.
 * @returns {Promise<any>}
 */
export async function getOpenaiClient() {
  if (!_client) {
    try {
      const { default: OpenAI } = await import('openai');
      _client = new OpenAI();
    } catch {
      throw new Error('LLM provider is not available. Required dependency is not installed.');
    }
  }
  return _client;
}

export function resetClient() {
  _client = null;
}
