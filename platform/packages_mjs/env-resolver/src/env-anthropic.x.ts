import { resolve } from '@internal/env-resolve';

export interface AnthropicEnv {
    apiKey: string | undefined;
    model: string;
}

export function resolveAnthropicEnv(config?: Record<string, any>): AnthropicEnv {
    return {
        apiKey: resolve(undefined, ['ANTHROPIC_API_KEY'], config, 'apiKey', undefined),
        model: resolve(undefined, ['ANTHROPIC_MODEL'], config, 'model', 'claude-sonnet-4-5-20250514'),
    };
}
