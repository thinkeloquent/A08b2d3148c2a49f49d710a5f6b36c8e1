/**
 * @fileoverview Anthropic provider — lazy-loaded.
 */

let _client = null;

/**
 * Get or create a lazy-initialized Anthropic client.
 * Requires the `@anthropic-ai/sdk` npm package.
 * @returns {Promise<any>}
 */
export async function getAnthropicClient() {
  if (!_client) {
    try {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      _client = new Anthropic();
    } catch {
      throw new Error('LLM provider is not available. Required dependency is not installed.');
    }
  }
  return _client;
}

export function resetClient() {
  _client = null;
}
