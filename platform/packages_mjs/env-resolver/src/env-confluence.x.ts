import { resolve } from '@internal/env-resolve';

export interface ConfluenceEnv {
    baseUrl: string | undefined;
    username: string | undefined;
    apiToken: string | undefined;
}

export function resolveConfluenceEnv(config?: Record<string, any>): ConfluenceEnv {
    return {
        baseUrl: resolve(undefined, ['CONFLUENCE_BASE_URL'], config, 'baseUrl', undefined),
        username: resolve(undefined, ['CONFLUENCE_USERNAME'], config, 'username', undefined),
        apiToken: resolve(undefined, ['CONFLUENCE_API_TOKEN'], config, 'apiToken', undefined),
    };
}
