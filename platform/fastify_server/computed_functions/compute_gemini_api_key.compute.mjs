/**
 * Compute function to get Gemini API key from environment.
 *
 * This function is registered with ComputeRegistry and called when
 * resolving {{fn:compute_gemini_api_key}} templates.
 *
 * Usage in YAML:
 *     endpoint_api_key: "{{fn:compute_gemini_api_key}}"
 */

import { resolveGeminiEnv } from '@internal/env-resolver';

const _geminiEnv = resolveGeminiEnv();

// Module-level exports for auto-loading
export const NAME = 'compute_gemini_api_key';
export const SCOPE = 'STARTUP';

/**
 * Compute function entry point for auto-loading.
 *
 * @param {Object} ctx - Context dictionary with env, config, app, state, shared
 * @returns {string} API key string from GEMINI_API_KEY environment variable
 */
export function register(ctx) {
    return ctx?.env?.GEMINI_API_KEY || _geminiEnv.apiKey || '';
}
