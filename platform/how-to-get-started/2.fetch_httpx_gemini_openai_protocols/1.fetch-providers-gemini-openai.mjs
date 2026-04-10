#!/usr/bin/env node
/**
 * Example: Fetch health check for Gemini OpenAI provider
 *
 * This example demonstrates:
 * 1. Loading YAML config using app-yaml-static-config
 * 2. Merging global config into provider config
 * 3. Auto-loading compute functions from fastify_server/computed_functions
 * 4. Resolving computed overwrites using app-yaml-overwrites
 * 5. Performing a health check using fetch-undici
 *
 * Functions are decoupled following fastify_server/fastapi_server patterns.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '../..');

// Import from polyglot packages
const { AppYamlConfig } = await import(
    join(ROOT_DIR, 'polyglot/app_yaml_static_config/mjs/dist/index.js')
);
const { ConfigSDK, ComputeScope, MissingStrategy, createRegistry } = await import(
    join(ROOT_DIR, 'polyglot/app_yaml_overwrites/mjs/dist/index.js')
);
const { AsyncClient, BearerAuth, Timeout } = await import(
    join(ROOT_DIR, 'packages_mjs/fetch_undici/dist/index.js')
);

// Configuration file paths
const CONFIG_DIR = join(ROOT_DIR, 'common/config');
const BASE_CONFIG = join(CONFIG_DIR, 'base.yml');
const SERVER_CONFIG = join(CONFIG_DIR, 'server.dev.yaml');

// Compute functions directory (uses fastify_server's computed_functions)
const COMPUTE_FUNCTIONS_DIR = join(ROOT_DIR, 'fastify_server/computed_functions');

/**
 * Recursively merge two objects.
 * Override values replace base values. Arrays are replaced, not concatenated.
 *
 * @param {Object} base - Base object (defaults)
 * @param {Object} override - Override object (takes precedence)
 * @returns {Object} Merged object
 */
function deepMerge(base, override) {
    const result = structuredClone(base);
    for (const [key, value] of Object.entries(override)) {
        if (
            key in result &&
            typeof result[key] === 'object' &&
            result[key] !== null &&
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(result[key]) &&
            !Array.isArray(value)
        ) {
            result[key] = deepMerge(result[key], value);
        } else {
            result[key] = structuredClone(value);
        }
    }
    return result;
}

/**
 * Initialize AppYamlConfig with base + env-specific YAML files.
 *
 * @returns {Promise<AppYamlConfig>} AppYamlConfig singleton instance
 */
async function loadConfig() {
    await AppYamlConfig.initialize({
        files: [BASE_CONFIG, SERVER_CONFIG]
    });
    return AppYamlConfig.getInstance();
}

/**
 * Get provider config with global config merged as defaults.
 *
 * Pattern: Object.assign({...global}, provider)
 * - Global config is the BASE (defaults)
 * - Provider config OVERRIDES global values
 *
 * @param {AppYamlConfig} config - AppYamlConfig instance
 * @param {string} providerName - Name of the provider (e.g., 'gemini_openai')
 * @returns {Object} Provider config with global defaults merged in
 */
function loadProviderConfig(config, providerName) {
    const globalConfig = config.getGlobalAppConfig() || {};
    const providers = config.get('providers') || {};
    const providerConfig = providers[providerName] || {};

    if (Object.keys(providerConfig).length === 0) {
        throw new Error(`Provider '${providerName}' not found in configuration`);
    }

    // Deep merge: global (base) + provider (override)
    const merged = deepMerge(globalConfig, providerConfig);
    return merged;
}

/**
 * Auto-load compute functions from *.compute.mjs files in a directory.
 *
 * Each file should expose:
 * - register: function - The compute function to register
 * - NAME (optional): string - Name to register under (defaults to filename without .compute.mjs)
 * - SCOPE (optional): 'STARTUP' | 'REQUEST' - Scope for the function (defaults to 'STARTUP')
 *
 * @param {Object} registry - The compute function registry
 * @param {string} [baseDir] - Directory to scan for *.compute.mjs files
 * @returns {Promise<string[]>} List of loaded function names
 */
async function autoLoadComputeFunctions(registry, baseDir = COMPUTE_FUNCTIONS_DIR) {
    if (!existsSync(baseDir)) {
        console.log(`Compute functions directory not found: ${baseDir}`);
        return [];
    }

    const loaded = [];

    try {
        const files = await readdir(baseDir);
        const computeFiles = files.filter(f => f.endsWith('.compute.mjs'));

        for (const file of computeFiles) {
            const filepath = join(baseDir, file);
            const funcName = file.replace('.compute.mjs', '');

            try {
                // Dynamic import using file:// URL
                const fileUrl = `file://${filepath}`;
                const module = await import(fileUrl);

                // Get required register function
                if (typeof module.register !== 'function') {
                    console.warn(`Warning: ${filepath} does not export 'register' function, skipping`);
                    continue;
                }

                const registerFunc = module.register;

                // Get optional NAME (defaults to filename)
                const name = module.NAME || funcName;

                // Get optional SCOPE (defaults to STARTUP)
                const scope = module.SCOPE === 'REQUEST' ? ComputeScope.REQUEST :
                              module.SCOPE === ComputeScope.REQUEST ? ComputeScope.REQUEST :
                              ComputeScope.STARTUP;

                // Register the function
                registry.register(name, registerFunc, scope);
                loaded.push(name);
            } catch (e) {
                console.error(`Error loading compute function from ${filepath}: ${e.message}`);
            }
        }
    } catch (e) {
        console.error(`Error scanning computed_functions directory: ${e.message}`);
    }

    return loaded;
}

/**
 * Resolve computed overwrites in provider config.
 *
 * Steps:
 * 1. Setup compute registry with compute functions
 * 2. Initialize ConfigSDK with config + registry
 * 3. Resolve templates like {{fn:compute_gemini_api_key}}, {{app.name}}
 * 4. Apply resolved overwrite_from_context values to top-level keys
 *
 * @param {Object} providerConfig - Provider config with global merged in
 * @param {ComputeScope} scope - ComputeScope.STARTUP or ComputeScope.REQUEST
 * @returns {Promise<Object>} Config with resolved computed values applied to top-level keys
 */
async function parseProviderComputedConfig(providerConfig, scope = ComputeScope.STARTUP) {
    // Setup compute registry
    const registry = createRegistry();

    // Auto-load compute functions from fastify_server/computed_functions
    const loaded = await autoLoadComputeFunctions(registry);
    console.log(`Auto-loaded compute functions: ${loaded.join(', ')}`);

    // Initialize ConfigSDK with config + registry
    const sdk = await ConfigSDK.initialize({
        configProvider: AppYamlConfig.getInstance(),
        missingStrategy: MissingStrategy.IGNORE,
        registry
    });

    // Get resolved configuration
    const resolved = await sdk.getResolved(scope);

    // Extract resolved overwrite_from_context for our provider
    const resolvedProvider = resolved.providers?.gemini_openai || {};
    const resolvedOverwrites = resolvedProvider.overwrite_from_context || {};

    // Apply resolved overwrites to the merged provider config
    const result = structuredClone(providerConfig);
    for (const [key, value] of Object.entries(resolvedOverwrites)) {
        // Only apply if value is resolved (not still a template string)
        if (value !== null && value !== undefined && !(typeof value === 'string' && value.startsWith('{{'))) {
            result[key] = value;
        }
    }

    // Remove overwrite_from_context from output (it's metadata, not needed after resolution)
    delete result.overwrite_from_context;

    return result;
}

/**
 * Perform health check using resolved provider config.
 *
 * Expects a fully resolved config where:
 * - Global defaults are already merged
 * - Computed values are already resolved to top-level keys
 *
 * @param {Object} providerConfig - Fully resolved provider configuration
 * @returns {Promise<Object>} Health check result
 */
async function fetchHealthz(providerConfig) {
    // Extract configuration values directly (no more checking overwrite_from_context)
    const baseUrl = providerConfig.base_url;
    const healthEndpoint = providerConfig.health_endpoint || '/models';
    const authType = providerConfig.endpoint_auth_type || 'bearer';
    const apiKey = providerConfig.endpoint_api_key;

    // Get timeout from merged config (provider overrides global)
    const clientConfig = providerConfig.client || {};
    const timeoutMs = clientConfig.timeout_ms || 30000;

    console.log('=== Gemini OpenAI Provider Configuration ===');
    console.log(`Base URL: ${baseUrl}`);
    console.log(`Health Endpoint: ${healthEndpoint}`);
    console.log(`Auth Type: ${authType}`);
    console.log(`API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'NOT SET'}`);
    console.log(`Timeout: ${timeoutMs}ms`);

    // Build health check URL
    const healthUrl = `${baseUrl.replace(/\/$/, '')}${healthEndpoint}`;
    console.log(`\nHealth Check URL: ${healthUrl}`);

    if (!apiKey) {
        console.log('\nWARNING: GEMINI_API_KEY environment variable not set');
        console.log('Set it with: export GEMINI_API_KEY=your_api_key');
        return {
            success: false,
            error: 'API key not configured',
            provider: 'gemini_openai'
        };
    }

    // Configure authentication based on auth_type
    let auth = null;
    if (authType === 'bearer') {
        auth = new BearerAuth(apiKey);
    }

    // Make health check request
    console.log('\n=== Performing Health Check ===');

    const client = new AsyncClient({
        timeout: new Timeout({ connect: 5000, read: timeoutMs }),
        auth
    });

    try {
        const response = await client.get(healthUrl);

        console.log(`Status Code: ${response.statusCode}`);
        console.log(`Response OK: ${response.isSuccess}`);

        if (response.isSuccess) {
            const data = await response.json();
            const models = Array.isArray(data?.data) ? data.data : [];
            console.log(`Models Available: ${models.length}`);

            return {
                success: true,
                statusCode: response.statusCode,
                provider: 'gemini_openai',
                modelsCount: models.length,
                data
            };
        } else {
            const errorText = await response.text();
            console.log(`Error Response: ${errorText.slice(0, 200)}`);

            return {
                success: false,
                statusCode: response.statusCode,
                provider: 'gemini_openai',
                error: errorText
            };
        }
    } catch (e) {
        console.log(`Request Error: ${e.constructor.name}: ${e.message}`);
        return {
            success: false,
            provider: 'gemini_openai',
            error: e.message
        };
    } finally {
        await client.close();
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('Gemini OpenAI Provider Health Check');
    console.log('='.repeat(60));

    // 1. Load static config
    const config = await loadConfig();
    console.log('Static config loaded successfully');

    // 2. Merge global into provider
    const providerConfig = loadProviderConfig(config, 'gemini_openai');
    console.log('Provider config merged with global defaults');

    // 3. Resolve computed values ({{fn:compute_gemini_api_key}}, etc.)
    const resolvedConfig = await parseProviderComputedConfig(providerConfig, ComputeScope.STARTUP);
    console.log('Computed values resolved');
    console.log('\n=== Resolved Config (JSON) ===');
    console.log(JSON.stringify(resolvedConfig, null, 2));
    console.log();

    // 4. Fetch healthz
    const result = await fetchHealthz(resolvedConfig);

    console.log('\n' + '='.repeat(60));
    console.log('Health Check Result');
    console.log('='.repeat(60));
    console.log(`Success: ${result.success}`);
    console.log(`Provider: ${result.provider}`);

    if (result.success) {
        console.log(`Status Code: ${result.statusCode}`);
        console.log(`Models Count: ${result.modelsCount}`);
    } else {
        console.log(`Error: ${result.error}`);
    }

    return result;
}

// Export for external use
export {
    deepMerge,
    loadConfig,
    loadProviderConfig,
    autoLoadComputeFunctions,
    parseProviderComputedConfig,
    fetchHealthz,
    main
};

// Run if executed directly
main().catch(console.error);
