import { resolve } from '@internal/env-resolve';

export interface JiraEnv {
    baseUrl: string | undefined;
    email: string | undefined;
    apiToken: string | undefined;
}

export function resolveJiraEnv(config?: Record<string, any>): JiraEnv {
    return {
        baseUrl: resolve(undefined, ['JIRA_BASE_URL'], config, 'baseUrl', undefined),
        email: resolve(undefined, ['JIRA_EMAIL'], config, 'email', undefined),
        apiToken: resolve(undefined, ['JIRA_API_TOKEN'], config, 'apiToken', undefined),
    };
}
