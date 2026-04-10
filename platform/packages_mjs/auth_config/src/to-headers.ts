import { encodeAuth, getHeaderName } from '@internal/auth-encoding';
import { AuthConfig } from './types/auth-config.js';
import { createLogger } from './logger.js';

const logger = createLogger('fetch_auth_config', import.meta.url);

export function toHeaders(config: AuthConfig): Record<string, string> {
    logger.debug('toHeaders called', { type: config.type });

    // Extract credentials
    const credentials: Record<string, unknown> = {
        username: config.username,
        password: config.password,
        email: config.email,
        token: config.token,
        headerName: config.headerName,
        header_name: config.headerName, // alias support
        headerValue: config.headerValue,
        header_value: config.headerValue, // alias support
    };

    // Filter out undefined and null values
    const filteredCredentials: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(credentials)) {
        if (value !== undefined && value !== null) {
            filteredCredentials[key] = value;
        }
    }

    try {
        const headers = encodeAuth(config.type, filteredCredentials);
        const headerName = getHeaderName(config.type);

        logger.info('Headers generated', { header: headerName });
        return headers;
    } catch (error) {
        logger.error(`Failed to encode headers: ${error}`, { type: config.type });
        throw error;
    }
}
