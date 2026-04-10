import { resolve } from '@internal/env-resolve';

export interface StatsigEnv {
    apiKey: string | undefined;
}

export function resolveStatsigEnv(config?: Record<string, any>): StatsigEnv {
    return {
        apiKey: resolve(undefined, ['STATSIG_API_KEY', 'STATSIG_SERVER_SECRET'], config, 'apiKey', undefined),
    };
}
