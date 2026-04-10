import { createLogger } from './logger.js';
import { AuthConfig, AuthConfigInput, AuthConfigWithHeaders } from './types/auth-config.js';
import { validateAuthConfig } from './validate-auth-config.js';
import { toHeaders } from './to-headers.js';
import { AuthConfigError } from './errors.js';

const logger = createLogger('fetch_auth_config', import.meta.url);

export function createAuthConfig(input: AuthConfigInput): AuthConfig | AuthConfigWithHeaders {
    logger.debug('createAuthConfig called', { type: input.type });

    // Create base config
    const config: AuthConfig = {
        type: input.type,
        username: input.username,
        password: input.password,
        email: input.email,
        token: input.token,
        baseUrl: input.baseUrl,
        headerName: input.headerName,
        headerValue: input.headerValue,
    };

    // Validate
    const validation = validateAuthConfig(config);
    if (!validation.valid) {
        const errorMsg = `Invalid auth config: ${validation.errors.join(', ')}`;
        logger.error(errorMsg, { type: config.type });
        throw new AuthConfigError(errorMsg);
    }

    if (input.encode) {
        logger.debug('Encoding headers', { type: config.type });
        const headers = toHeaders(config);
        const result: AuthConfigWithHeaders = {
            ...config,
            headers,
        };
        logger.info('AuthConfigWithHeaders created successfully', { type: config.type });
        return result;
    }

    logger.info('AuthConfig created successfully', { type: config.type });
    return config;
}
