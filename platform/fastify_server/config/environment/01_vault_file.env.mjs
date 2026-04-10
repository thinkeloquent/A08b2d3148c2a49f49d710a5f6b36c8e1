/**
 * Vault Secret File Loader for Fastify Server
 *
 * Loads environment variables from the file specified by VAULT_SECRET_FILE env var.
 * This runs first (01) before other env loaders.
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';

const VAULT_SECRET_FILE = process.env.VAULT_SECRET_FILE;

/**
 * Load environment variables from vault secret file.
 * @returns {Object} Load status
 */
function loadVaultFile() {
    const result = {
        loaded: false,
        path: VAULT_SECRET_FILE || null,
        error: null,
    };

    console.log(`[env:vault_file] Loading vault secret file. VAULT_SECRET_FILE=${VAULT_SECRET_FILE || '(not set)'}`);

    if (!VAULT_SECRET_FILE) {
        console.log('[env:vault_file] VAULT_SECRET_FILE not set, skipping vault file load');
        return result;
    }

    if (!existsSync(VAULT_SECRET_FILE)) {
        result.error = `Vault secret file not found: ${VAULT_SECRET_FILE}`;
        console.warn(`[env:vault_file] ${result.error}`);
        return result;
    }

    try {
        config({ path: VAULT_SECRET_FILE, override: true });
        result.loaded = true;
        console.log(`[env:vault_file] Loaded vault secret file: ${VAULT_SECRET_FILE}`);
    } catch (err) {
        result.error = err.message;
        console.error(`[env:vault_file] Failed to load vault secret file: ${err.message}`);
    }

    return result;
}

// Auto-load on import
console.log('[env:vault_file] Initializing vault file environment loader');
const loadResult = loadVaultFile();
console.log(`[env:vault_file] Load result: loaded=${loadResult.loaded}, error=${loadResult.error || 'none'}`);

/**
 * Return the result of the vault file load.
 * @returns {Object}
 */
export function getLoadResult() {
    return loadResult;
}

export { VAULT_SECRET_FILE };
export default { getLoadResult, VAULT_SECRET_FILE };
