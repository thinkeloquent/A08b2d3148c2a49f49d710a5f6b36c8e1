/**
 * Root .env File Loader
 *
 * Loads environment variables from <PROJECT_ROOT>/.env if the file exists.
 * Uses dotenv; variables are injected into process.env.
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Resolve project root relative to this file
const PROJECT_ROOT = resolve(__dirname, '..', '..', '..');  // mta-v800/
const ROOT_ENV_FILE = resolve(PROJECT_ROOT, '.env');

console.log(`[env:root_env_file_dev_only] Initializing root .env loader. ROOT_ENV_FILE=${ROOT_ENV_FILE}`);

let loaded = false;

if (existsSync(ROOT_ENV_FILE)) {
    try {
        config({ path: ROOT_ENV_FILE, override: true });
        loaded = true;
        console.log(`[env:root_env_file_dev_only] Loaded root .env file: ${ROOT_ENV_FILE}`);
    } catch (err) {
        console.error(`[env:root_env_file_dev_only] Failed to load root .env file (${ROOT_ENV_FILE}): ${err.message}`);
    }
} else {
    console.log(`[env:root_env_file_dev_only] Root .env file not found, skipping: ${ROOT_ENV_FILE}`);
}

console.log(`[env:root_env_file_dev_only] Load result: loaded=${loaded}`);

export function isLoaded() {
    return loaded;
}

export { ROOT_ENV_FILE };
export default { isLoaded, ROOT_ENV_FILE };
