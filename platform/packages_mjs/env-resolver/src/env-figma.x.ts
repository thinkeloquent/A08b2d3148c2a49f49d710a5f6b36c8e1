import { resolve, resolveInt } from '@internal/env-resolve';

export interface FigmaEnv {
    token: string | undefined;
    apiBaseUrl: string;
    timeout: number;
    proxyUrl: string | undefined;
}

export function resolveFigmaEnv(config?: Record<string, any>): FigmaEnv {
    return {
        token: resolve(undefined, ['FIGMA_TOKEN', 'FIGMA_ACCESS_TOKEN'], config, 'token', undefined),
        apiBaseUrl: resolve(undefined, ['FIGMA_API_BASE_URL'], config, 'apiBaseUrl', 'https://api.figma.com'),
        timeout: resolveInt(undefined, ['FIGMA_TIMEOUT'], config, 'timeout', 30000),
        proxyUrl: resolve(undefined, ['FIGMA_PROXY_URL'], config, 'proxyUrl', undefined),
    };
}
