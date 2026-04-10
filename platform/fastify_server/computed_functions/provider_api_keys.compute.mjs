/**
 * Composite compute function that resolves API keys for all providers.
 *
 * Returns an object keyed by provider name, each holding the resolved
 * API key from the environment.  Uses a fake async delay to validate
 * that the resolver correctly awaits async compute functions.
 *
 * Usage in YAML (Option 4 — property access):
 *     endpoint_api_key: "{{fn:provider_api_keys.openai}}"
 *     endpoint_api_key: "{{fn:provider_api_keys.anthropic}}"
 */

import {
  resolveOpenaiEnv, resolveAnthropicEnv, resolveGeminiEnv,
  resolveFigmaEnv, resolveGithubEnv, resolveJiraEnv,
  resolveConfluenceEnv, resolveSaucelabsEnv, resolveServicenowEnv,
  resolveRallyEnv, resolveStatsigEnv, resolveSonarqubeEnv,
} from '@internal/env-resolver';

export const NAME = 'provider_api_keys';
export const SCOPE = 'GLOBAL';

/**
 * @param {Object} ctx - Context dictionary with env, config, app, state, shared, request
 * @returns {Promise<Record<string, string>>} Object keyed by provider name → resolved API key
 */
export async function register(ctx) {
  // Fake async wait — proves the resolver awaits async compute functions
  await new Promise((resolve) => setTimeout(resolve, 5));

  const result = {
    openai:            resolveOpenaiEnv().apiKey || '',
    openai_embeddings: resolveOpenaiEnv().apiKey || '',
    anthropic:         resolveAnthropicEnv().apiKey || '',
    gemini_openai:     resolveGeminiEnv().apiKey || '',
    figma:             resolveFigmaEnv().token || '',
    github:            resolveGithubEnv().token || '',
    jira:              resolveJiraEnv().apiToken || '',
    confluence:        resolveConfluenceEnv().apiToken || '',
    saucelabs:         resolveSaucelabsEnv().accessKey || '',
    servicenow:        resolveServicenowEnv().password || '',
    rally:             resolveRallyEnv().apiKey || '',
    statsig:           resolveStatsigEnv().apiKey || '',
    sonar:             resolveSonarqubeEnv().apiToken || '',
  };

  return result;
}
