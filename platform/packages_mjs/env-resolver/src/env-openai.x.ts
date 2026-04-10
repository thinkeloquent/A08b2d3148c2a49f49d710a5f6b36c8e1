import { resolve, resolveInt } from '@internal/env-resolve';

export interface OpenaiEnv {
    embeddingsApiKey: string | undefined;
    apiKey: string | undefined;
    embeddingsBaseUrl: string;
    embeddingsOrg: string | undefined;
    embeddingsTimeout: number;
    embeddingsProxyUrl: string | undefined;
    embeddingsCaBundle: string | undefined;
    orgId: string | undefined;
    projectId: string | undefined;
    baseUrl: string;
}

export function resolveOpenaiEnv(config?: Record<string, any>): OpenaiEnv {
    return {
        embeddingsApiKey: resolve(undefined, ['OPENAI_EMBEDDINGS_API_KEY', 'OPENAI_API_KEY'], config, 'embeddingsApiKey', undefined),
        apiKey: resolve(undefined, ['OPENAI_API_KEY'], config, 'apiKey', undefined),
        embeddingsBaseUrl: resolve(undefined, ['OPENAI_EMBEDDINGS_BASE_URL'], config, 'embeddingsBaseUrl', 'https://api.openai.com/v1'),
        embeddingsOrg: resolve(undefined, ['OPENAI_EMBEDDINGS_ORG'], config, 'embeddingsOrg', undefined),
        embeddingsTimeout: resolveInt(undefined, ['OPENAI_EMBEDDINGS_TIMEOUT'], config, 'embeddingsTimeout', 120000),
        embeddingsProxyUrl: resolve(undefined, ['OPENAI_EMBEDDINGS_PROXY_URL'], config, 'embeddingsProxyUrl', undefined),
        embeddingsCaBundle: resolve(undefined, ['OPENAI_EMBEDDINGS_CA_BUNDLE'], config, 'embeddingsCaBundle', undefined),
        orgId: resolve(undefined, ['OPENAI_ORG_ID'], config, 'orgId', undefined),
        projectId: resolve(undefined, ['OPENAI_PROJECT_ID'], config, 'projectId', undefined),
        baseUrl: resolve(undefined, ['OPENAI_BASE_URL'], config, 'baseUrl', 'https://api.openai.com/v1'),
    };
}
