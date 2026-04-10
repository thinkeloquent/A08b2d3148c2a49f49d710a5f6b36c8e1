import { resolve, resolveBool } from '@internal/env-resolve';

export interface GithubEnv {
    token: string | undefined;
    baseApiUrl: string;
    hostname: string | undefined;
    auth: string | undefined;
    actions: boolean;
}

export function resolveGithubEnv(config?: Record<string, any>): GithubEnv {
    return {
        token: resolve(undefined, ['GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_ACCESS_TOKEN', 'GITHUB_PAT'], config, 'token', undefined),
        baseApiUrl: resolve(undefined, ['GITHUB_BASE_API_URL', 'GITHUB_API_BASE_URL', 'GITHUB_BASE_URL'], config, 'baseApiUrl', 'https://api.github.com'),
        hostname: resolve(undefined, ['GITHUB_HOSTNAME'], config, 'hostname', undefined),
        auth: resolve(undefined, ['GITHUB_AUTH'], config, 'auth', undefined),
        actions: resolveBool(undefined, ['GITHUB_ACTIONS'], config, 'actions', false),
    };
}
