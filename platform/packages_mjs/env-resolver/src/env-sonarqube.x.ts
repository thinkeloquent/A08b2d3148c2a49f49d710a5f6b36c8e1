import { resolve } from '@internal/env-resolve';

export interface SonarqubeEnv {
    apiToken: string | undefined;
    baseUrl: string;
}

export function resolveSonarqubeEnv(config?: Record<string, any>): SonarqubeEnv {
    return {
        apiToken: resolve(undefined, ['SONAR_API_TOKEN', 'SONAR_TOKEN', 'SONARQUBE_TOKEN'], config, 'apiToken', undefined),
        baseUrl: resolve(undefined, ['SONAR_BASE_URL'], config, 'baseUrl', 'https://sonarcloud.io'),
    };
}
