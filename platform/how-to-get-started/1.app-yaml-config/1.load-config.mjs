#!/usr/bin/env node
/**
 * Example: Loading YAML configuration using app-yaml-static-config
 */
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from polyglot package dist
const { AppYamlConfig } = await import(
    join(__dirname, '../../polyglot/app_yaml_static_config/mjs/dist/index.js')
);

// Configuration file paths
const CONFIG_DIR = join(__dirname, '../../common/config');
const BASE_CONFIG = join(CONFIG_DIR, 'base.yml');
const SERVER_CONFIG = join(CONFIG_DIR, 'server.dev.yaml');

async function main() {
    // Initialize AppYamlConfig with both config files
    // Files are merged in order (later files override earlier ones)
    await AppYamlConfig.initialize({
        files: [BASE_CONFIG, SERVER_CONFIG]
    });

    // Get the singleton instance
    const instance = AppYamlConfig.getInstance();

    // Access configuration values
    console.log('=== Configuration Loaded ===');
    console.log(`App Name: ${instance.get('app')?.name}`);
    console.log(`App Version: ${instance.get('app')?.version}`);
    console.log(`Server Port: ${instance.get('server')?.port}`);

    // Get nested values
    const providers = instance.get('providers') || {};
    const storage = instance.get('storage') || {};
    console.log(`\nProviders: ${Object.keys(providers).join(', ')}`);
    console.log(`Storages: ${Object.keys(storage).join(', ')}`);

    // Get global config
    const globalConfig = instance.getGlobalAppConfig();
    console.log(`\nGlobal timeout (ms): ${globalConfig.client?.timeout_ms}`);

    // Return instance for use in step 2
    return instance;
}

// Export for use in step 2
export { main, AppYamlConfig, BASE_CONFIG, SERVER_CONFIG };

// Run if executed directly
main().catch(console.error);
