import { resolve, resolveInt, resolveFloat } from '@internal/env-resolve';

export interface GeminiEnv {
    apiKey: string | undefined;
    defaultModel: string;
    baseUrl: string;
    systemPrompt: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
    timeoutMs: number;
}

export function resolveGeminiEnv(config?: Record<string, any>): GeminiEnv {
    return {
        apiKey: resolve(undefined, ['GEMINI_API_KEY'], config, 'apiKey', undefined),
        defaultModel: resolve(undefined, ['GEMINI_DEFAULT_MODEL'], config, 'defaultModel', 'flash'),
        baseUrl: resolve(undefined, ['GEMINI_BASE_URL'], config, 'baseUrl', 'https://generativelanguage.googleapis.com/v1beta/openai'),
        systemPrompt: resolve(undefined, ['GEMINI_SYSTEM_PROMPT'], config, 'systemPrompt', 'You are a helpful AI assistant powered by Gemini.'),
        defaultTemperature: resolveFloat(undefined, ['GEMINI_DEFAULT_TEMPERATURE'], config, 'defaultTemperature', 0.7),
        defaultMaxTokens: resolveInt(undefined, ['GEMINI_DEFAULT_MAX_TOKENS'], config, 'defaultMaxTokens', 1000),
        timeoutMs: resolveInt(undefined, ['GEMINI_TIMEOUT_MS'], config, 'timeoutMs', 60000),
    };
}
