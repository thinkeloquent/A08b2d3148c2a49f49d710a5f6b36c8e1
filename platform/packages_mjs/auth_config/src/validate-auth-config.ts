import { isValidAuthType } from '@internal/auth-encoding';
import { AuthConfig } from './types/auth-config.js';
import { ValidationResult } from './types/validation.js';
import { getRequiredCredentials } from './get-required-credentials.js';
import { createLogger } from './logger.js';

const logger = createLogger('fetch_auth_config', import.meta.url);

export function validateAuthConfig(config: AuthConfig): ValidationResult {
    logger.debug('validateAuthConfig called', { type: config.type });

    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Validate Type
    if (!isValidAuthType(config.type)) {
        errors.push(`Invalid auth type: ${config.type}`);
        logger.warn('Validation failed: Invalid auth type', { type: config.type });
        return { valid: false, errors, warnings };
    }

    // 2. Validate Required Credentials
    const requiredFields = getRequiredCredentials(config.type);
    for (const field of requiredFields) {
        // Safe access
        const value = (config as any)[field];
        if (!value) {
            errors.push(`Missing required field: ${field}`);
        }
    }

    if (errors.length > 0) {
        logger.warn(`Validation failed with ${errors.length} errors`, { type: config.type });
        return { valid: false, errors, warnings };
    }

    logger.debug('Validation successful', { type: config.type });
    return { valid: true, errors, warnings };
}
