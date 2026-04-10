import { AuthType } from '@internal/auth-encoding';
import { CREDENTIAL_REQUIREMENTS } from './constants/credential-requirements.js';
import { createLogger } from './logger.js';

const logger = createLogger('fetch_auth_config', import.meta.url);

export function getRequiredCredentials(authType: AuthType): string[] {
    const reqs = CREDENTIAL_REQUIREMENTS[authType] || [];
    logger.debug(`getRequiredCredentials for ${authType}:`, { reqs });
    return reqs;
}
