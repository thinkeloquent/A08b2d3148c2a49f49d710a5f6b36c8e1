import { resolve } from '@internal/env-resolve';

export interface ServicenowEnv {
    baseUrl: string | undefined;
    username: string | undefined;
    password: string | undefined;
}

export function resolveServicenowEnv(config?: Record<string, any>): ServicenowEnv {
    return {
        baseUrl: resolve(undefined, ['SERVICENOW_BASE_URL'], config, 'baseUrl', undefined),
        username: resolve(undefined, ['SERVICENOW_USERNAME'], config, 'username', undefined),
        password: resolve(undefined, ['SERVICENOW_PASSWORD'], config, 'password', undefined),
    };
}
