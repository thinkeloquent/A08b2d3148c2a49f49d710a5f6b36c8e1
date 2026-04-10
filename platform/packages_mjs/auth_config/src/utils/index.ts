/**
 * Utility functions for fetch_auth_config.
 */
export {
    buildSdkAuthOptions,
    resolveContextValue,
    resolveEnvValue,
    resolveApiKey,
    resolveApiKeyFromEnv,  // deprecated alias
    resolveProviderField,
    resolveEmail,
    type ProviderConfig,
    type SdkAuthOptions,
    type OverwriteFromContextConfig,
    type OverwriteFromEnvConfig,
} from './provider-auth.js';
