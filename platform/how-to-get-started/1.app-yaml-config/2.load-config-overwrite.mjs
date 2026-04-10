#!/usr/bin/env node
/**
 * Example: Loading YAML configuration and applying overwrites using app-yaml-overwrites
 *
 * This example demonstrates how to:
 * 1. Load static config from app-yaml-static-config (via step 1)
 * 2. Use ConfigSDK to resolve template placeholders like {{app.name}}, {{env.VAR}}, etc.
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from polyglot packages
const { AppYamlConfig } = await import(
    join(__dirname, '../../polyglot/app_yaml_static_config/mjs/dist/index.js')
);
const { ConfigSDK, ComputeScope, MissingStrategy } = await import(
    join(__dirname, '../../polyglot/app_yaml_overwrites/mjs/dist/index.js')
);

// Configuration file paths
const CONFIG_DIR = join(__dirname, '../../common/config');
const BASE_CONFIG = join(CONFIG_DIR, 'base.yml');
const SERVER_CONFIG = join(CONFIG_DIR, 'server.dev.yaml');

async function main() {
    // Step 1: Initialize static config (from 1.load-config.mjs)
    await AppYamlConfig.initialize({
        files: [BASE_CONFIG, SERVER_CONFIG]
    });
    const staticConfig = AppYamlConfig.getInstance();

    console.log('=== Step 1: Static Config Loaded ===');
    console.log(`App Name: ${staticConfig.get('app')?.name}`);

    // Step 2: Initialize ConfigSDK with the static config provider
    // ConfigSDK can read from AppYamlConfig singleton via configProvider
    // Use MissingStrategy.IGNORE to preserve unresolved templates (e.g., {{fn:...}} without registered functions)
    const sdk = await ConfigSDK.initialize({
        configProvider: staticConfig,
        missingStrategy: MissingStrategy.IGNORE
    });

    console.log('\n=== Step 2: ConfigSDK Initialized ===');

    // Access raw (unresolved) configuration
    const rawConfig = sdk.getRaw();
    console.log(`Raw providers count: ${Object.keys(rawConfig.providers || {}).length}`);

    // Access specific provider config (unresolved)
    const geminiConfig = sdk.getProvider('gemini_openai');
    if (geminiConfig) {
        console.log('\nGemini Provider (raw):');
        console.log(`  - base_url: ${geminiConfig.base_url}`);
        console.log(`  - app_name template: ${geminiConfig.overwrite_from_context?.app_name}`);
    }

    // Step 3: Resolve configuration with context
    // ComputeScope.STARTUP - for server startup (cached values)
    // ComputeScope.REQUEST - for per-request resolution
    console.log('\n=== Step 3: Resolving Templates (STARTUP scope) ===');

    const resolved = await sdk.getResolved(ComputeScope.STARTUP);

    // After resolution, templates like {{app.name}} are replaced with actual values
    const resolvedGemini = resolved.providers?.gemini_openai || {};
    console.log('Gemini Provider (resolved):');
    console.log(`  - app_name: ${resolvedGemini.app_name}`);
    console.log(`  - app_version: ${resolvedGemini.app_version}`);

    // Resolve a single template manually
    console.log('\n=== Step 4: Manual Template Resolution ===');
    const templateResult = await sdk.resolveTemplate('{{app.name}}');
    console.log(`Template '{{app.name}}' resolved to: ${templateResult}`);

    // Access via dot-path notation
    console.log('\n=== Step 5: Dot-Path Access ===');
    console.log(`sdk.get('app.name'): ${sdk.get('app.name')}`);
    console.log(`sdk.get('server.port'): ${sdk.get('server.port')}`);
    console.log(`sdk.get('global.client.timeout_ms'): ${sdk.get('global.client.timeout_ms')}`);

    return sdk;
}

// Export for external use
export { main, AppYamlConfig, ConfigSDK, ComputeScope, MissingStrategy };

// Run if executed directly
main().catch(console.error);
