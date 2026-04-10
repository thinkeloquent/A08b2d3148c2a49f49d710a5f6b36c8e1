/**
 * Provider authentication utilities for building SDK auth options.
 *
 * This module centralizes the logic for resolving API keys and building
 * auth options for the fetch_client SDK.
 *
 * Supports two resolution modes:
 * 1. overwrite_from_context (new): Values pre-resolved by app_yaml_overwrites context resolver
 * 2. overwrite_from_env (legacy): Manual env var resolution
 */

import { createLogger } from '../logger.js';

const logger = createLogger('fetch_auth_config.utils', import.meta.url);

export interface OverwriteFromContextConfig {
    endpoint_api_key?: string;
    [key: string]: string | undefined;
}

export interface OverwriteFromEnvConfig {
    endpoint_api_key?: string | string[];
    [key: string]: string | string[] | undefined;
}

export interface ProviderConfig {
    endpoint_api_key?: string;
    endpoint_auth_type?: string;
    api_auth_header_name?: string;
    overwrite_from_context?: OverwriteFromContextConfig;
    overwrite_from_env?: OverwriteFromEnvConfig;
    base_url?: string;
    health_endpoint?: string;
    model?: string;
    headers?: Record<string, string>;
    client?: {
        timeout_ms?: number;
    };
    [key: string]: unknown;
}

export interface SdkAuthOptions {
    type: string;
    token?: string;
    email?: string;
    username?: string;
    password?: string;
    headerName?: string;
}

/**
 * If value is an unresolved {{env.VAR_NAME}} template, resolve it
 * from process.env. Returns null if the env var is not set.
 * Non-template strings are returned as-is.
 */
function resolveEnvTemplate(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.startsWith('{{env.') && trimmed.endsWith('}}')) {
        const varName = trimmed.slice(6, -2); // extract VAR_NAME from {{env.VAR_NAME}}
        const envVal = process.env[varName];
        if (envVal) {
            logger.debug(`Resolved env template ${trimmed} from environment`);
            return envVal;
        }
        logger.debug(`Env template ${trimmed}: variable ${varName} not set`);
        return null;
    }
    return value;
}

/**
 * Resolve a value from overwrite_from_context config.
 *
 * With overwrite_from_context, values are pre-resolved by the context resolver,
 * so the value is read directly from the config. If the value is still an
 * unresolved {{env.VAR_NAME}} template, it will be resolved from process.env.
 *
 * @param overwriteConfig - Dict containing resolved values from context
 * @param key - The key to look up
 * @param defaultValue - Value to return if key not found
 * @returns Resolved value or defaultValue
 */
export function resolveContextValue(
    overwriteConfig: OverwriteFromContextConfig | undefined,
    key: string,
    defaultValue: string | null = null
): string | null {
    if (!overwriteConfig) {
        return defaultValue;
    }

    const value = overwriteConfig[key];
    if (value) {
        const resolved = resolveEnvTemplate(value);
        if (resolved) {
            logger.debug(`Resolved ${key} from context`);
            return resolved;
        }
    }

    return defaultValue;
}

/**
 * Resolve a value from environment variables based on overwrite_from_env config.
 *
 * DEPRECATED: Use overwrite_from_context with context resolver instead.
 *
 * @param overwriteConfig - Dict containing env var mappings
 * @param key - The key to look up in the overwrite config
 * @param defaultValue - Value to return if no env var is found
 * @returns Resolved value from environment or defaultValue
 */
export function resolveEnvValue(
    overwriteConfig: OverwriteFromEnvConfig | undefined,
    key: string,
    defaultValue: string | null = null
): string | null {
    if (!overwriteConfig) {
        return defaultValue;
    }

    const envVars = overwriteConfig[key];
    if (!envVars) {
        return defaultValue;
    }

    if (Array.isArray(envVars)) {
        for (const varName of envVars) {
            const value = process.env[varName];
            if (value) {
                logger.info(`Resolved ${key} from env var: ${varName}`);
                return value;
            }
        }
        return null;
    }

    if (typeof envVars === 'string') {
        const value = process.env[envVars];
        if (value) {
            logger.info(`Resolved ${key} from env var: ${envVars}`);
        }
        return value || null;
    }

    return defaultValue;
}

/**
 * Resolve API key from provider config using overwrite_from_context (preferred)
 * or overwrite_from_env (legacy fallback).
 *
 * @param providerConfig - Provider configuration dict from resolved config
 * @param apiKeyExtractor - Optional callback to extract API key from config
 * @returns Resolved API key or null
 */
export function resolveApiKey(
    providerConfig: ProviderConfig,
    apiKeyExtractor?: (config: ProviderConfig) => string | null
): string | null {
    // 0. Try custom extractor first if provided
    if (apiKeyExtractor && typeof apiKeyExtractor === 'function') {
        try {
            const customKey = apiKeyExtractor(providerConfig);
            if (customKey) {
                return customKey;
            }
        } catch (error) {
            logger.warn(`Error in apiKeyExtractor: ${error}`);
        }
    }

    // 1. First try overwrite_from_context (new pattern - values pre-resolved)
    if (providerConfig.overwrite_from_context) {
        const apiKey = resolveContextValue(providerConfig.overwrite_from_context, 'endpoint_api_key');
        if (apiKey) {
            return apiKey;
        }
    }

    // 2. Fallback to overwrite_from_env (legacy pattern)
    if (providerConfig.overwrite_from_env) {
        const apiKey = resolveEnvValue(providerConfig.overwrite_from_env, 'endpoint_api_key');
        if (apiKey) {
            return apiKey;
        }
    }

    // 3. Final fallback to direct value
    return providerConfig.endpoint_api_key || null;
}

/**
 * DEPRECATED: Use resolveApiKey() instead.
 *
 * Resolve API key from provider config.
 */
export function resolveApiKeyFromEnv(providerConfig: ProviderConfig): string | null {
    return resolveApiKey(providerConfig);
}

/**
 * Resolve any field from provider config using overwrite_from_context (preferred)
 * or direct value fallback.
 *
 * @param providerConfig - Provider configuration dict from resolved config
 * @param fieldName - The field name to resolve (e.g. "base_url", "email")
 * @param defaultValue - Value to return if field not found
 * @returns Resolved value or defaultValue
 */
export function resolveProviderField(
    providerConfig: ProviderConfig,
    fieldName: string,
    defaultValue: string | null = null
): string | null {
    // 1. First try overwrite_from_context (new pattern - values pre-resolved)
    if (providerConfig.overwrite_from_context) {
        const value = resolveContextValue(providerConfig.overwrite_from_context, fieldName);
        if (value) {
            return value;
        }
    }

    // 2. Final fallback to direct value
    return (providerConfig[fieldName] as string) || defaultValue;
}

/**
 * Resolve email from provider config using overwrite_from_context (preferred)
 * or direct value fallback.
 *
 * @param providerConfig - Provider configuration dict from resolved config
 * @returns Resolved email or null
 */
export function resolveEmail(
    providerConfig: ProviderConfig
): string | null {
    return resolveProviderField(providerConfig, 'email');
}

/**
 * Build SDK auth options from provider configuration.
 *
 * This function resolves the API key and builds the auth options object
 * that can be passed to fetch_client's createSDKClient.
 *
 * @param providerConfig - Provider configuration containing:
 *   - overwrite_from_context: Pre-resolved values from context (preferred)
 *   - overwrite_from_env: Env var mappings (legacy)
 *   - endpoint_api_key: Direct API key value
 *   - endpoint_auth_type: Auth type (bearer, x-api-key, basic, custom, custom_header)
 *   - api_auth_header_name: Custom header name for custom auth types
 * @param defaultAuthType - Default auth type if not specified in config
 * @param defaultHeaderName - Default header name for custom auth types
 * @returns Auth options object for SDK client, or null if no API key available
 *
 * @example
 * const providerConfig = {
 *     endpoint_auth_type: 'bearer',
 *     overwrite_from_context: { endpoint_api_key: 'resolved-api-key' }
 * };
 * const authOpts = buildSdkAuthOptions(providerConfig);
 * // Returns: { type: 'bearer', token: 'resolved-api-key' }
 */
export function buildSdkAuthOptions(
    providerConfig: ProviderConfig,
    defaultAuthType: string = 'bearer',
    defaultHeaderName?: string
): SdkAuthOptions | null {
    const apiKey = resolveApiKey(providerConfig);
    if (!apiKey) {
        return null;
    }

    const authType = (providerConfig.endpoint_auth_type || defaultAuthType).toLowerCase();
    logger.debug(`Building auth options for type: ${authType}`);

    let authOptions: SdkAuthOptions | null = null;

    switch (authType) {
        case 'bearer':
            authOptions = { type: 'bearer', token: apiKey };
            break;

        case 'x-api-key':
            authOptions = { type: 'x-api-key', token: apiKey };
            break;

        case 'basic':
            // Basic auth with empty username, API key as password
            authOptions = { type: 'basic', username: '', password: apiKey };
            break;

        case 'basic_email_token': {
            const email = resolveEmail(providerConfig);
            authOptions = { type: 'basic_email_token', email: email || '', token: apiKey };
            break;
        }

        case 'custom':
        case 'custom_header': {
            const headerName = providerConfig.api_auth_header_name || defaultHeaderName || 'Authorization';
            authOptions = { type: 'custom', token: apiKey, headerName };
            break;
        }

        default: {
            // Unknown type, fall back to default
            logger.warn(`Unknown auth type '${authType}', using default: ${defaultAuthType}`);
            if (defaultAuthType === 'bearer') {
                authOptions = { type: 'bearer', token: apiKey };
            } else if (defaultAuthType === 'x-api-key') {
                authOptions = { type: 'x-api-key', token: apiKey };
            } else {
                const headerName = providerConfig.api_auth_header_name || defaultHeaderName || 'Authorization';
                authOptions = { type: 'custom', token: apiKey, headerName };
            }
        }
    }

    // Print resolved fetch auth config
    console.log('[fetch_auth_config] buildSdkAuthOptions:', {
        endpoint_auth_type: authType,
        base_url: providerConfig.base_url || null,
        has_api_key: !!apiKey,
        resolved_type: authOptions?.type || null,
    });

    return authOptions;
}
