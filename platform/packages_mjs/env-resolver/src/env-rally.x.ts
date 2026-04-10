import { resolve } from '@internal/env-resolve';

export interface RallyEnv {
    apiKey: string | undefined;
    baseUrl: string;
}

export function resolveRallyEnv(config?: Record<string, any>): RallyEnv {
    return {
        apiKey: resolve(undefined, ['RALLY_API_KEY'], config, 'apiKey', undefined),
        baseUrl: resolve(undefined, ['RALLY_BASE_URL'], config, 'baseUrl', 'https://rally1.rallydev.com'),
    };
}
