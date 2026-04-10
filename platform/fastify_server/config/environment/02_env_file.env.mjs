/**
 * Environment File Loader for Fastify Server
 *
 * Loads environment variables from .env files in order:
 * 1. <ROOT>/.env (shared config)
 * 2. <ROOT>/fastify_server/.env (server-specific config)
 *
 * Server-specific values override root values.
 */

import { config } from 'dotenv';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Resolve paths relative to this file's location
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SERVER_ROOT = resolve(__dirname, '..', '..');     // fastify_server/
const PROJECT_ROOT = resolve(SERVER_ROOT, '..');        // mta-v800/

// Environment file paths
const ROOT_ENV_FILE = resolve(PROJECT_ROOT, '.env');
const SERVER_ENV_FILE = resolve(SERVER_ROOT, '.env');

/**
 * Load environment files in priority order.
 * @param {boolean} override - If true, later files override earlier values.
 * @returns {Object} Load status for each file
 */
function loadEnvFiles(override = true) {
    const result = {
        loaded: [],
        notFound: [],
        rootEnv: ROOT_ENV_FILE,
        serverEnv: SERVER_ENV_FILE,
    };

    console.log(`[env:env_file] Loading .env files. ROOT_ENV=${ROOT_ENV_FILE}, SERVER_ENV=${SERVER_ENV_FILE}`);

    // Load root .env first (lowest priority)
    if (existsSync(ROOT_ENV_FILE)) {
        try {
            config({ path: ROOT_ENV_FILE, override });
            result.loaded.push(ROOT_ENV_FILE);
            console.log(`[env:env_file] Loaded root .env: ${ROOT_ENV_FILE}`);
        } catch (err) {
            console.error(`[env:env_file] Failed to load root .env (${ROOT_ENV_FILE}): ${err.message}`);
            result.notFound.push(ROOT_ENV_FILE);
        }
    } else {
        console.log(`[env:env_file] Root .env not found, skipping: ${ROOT_ENV_FILE}`);
        result.notFound.push(ROOT_ENV_FILE);
    }

    // Load server-specific .env second (highest priority)
    if (existsSync(SERVER_ENV_FILE)) {
        try {
            config({ path: SERVER_ENV_FILE, override });
            result.loaded.push(SERVER_ENV_FILE);
            console.log(`[env:env_file] Loaded server .env: ${SERVER_ENV_FILE}`);
        } catch (err) {
            console.error(`[env:env_file] Failed to load server .env (${SERVER_ENV_FILE}): ${err.message}`);
            result.notFound.push(SERVER_ENV_FILE);
        }
    } else {
        console.log(`[env:env_file] Server .env not found, skipping: ${SERVER_ENV_FILE}`);
        result.notFound.push(SERVER_ENV_FILE);
    }

    return result;
}

// Auto-load on import
console.log('[env:env_file] Initializing env file loader');
const loadResult = loadEnvFiles(true);
console.log(`[env:env_file] Load result: loaded=[${loadResult.loaded.join(', ')}], notFound=[${loadResult.notFound.join(', ')}]`);

/**
 * Return the result of the initial env file load.
 * @returns {Object}
 */
export function getLoadResult() {
    return loadResult;
}

/**
 * Get an environment variable with optional default.
 * @param {string} key
 * @param {string} [defaultValue]
 * @returns {string|undefined}
 */
export function get(key, defaultValue = undefined) {
    return process.env[key] ?? defaultValue;
}

/**
 * Get an environment variable or throw if not found.
 * @param {string} key
 * @returns {string}
 * @throws {Error} If the environment variable is not set
 */
export function getOrThrow(key) {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Required environment variable '${key}' is not set`);
    }
    return value;
}

export { ROOT_ENV_FILE, SERVER_ENV_FILE };
export default { get, getOrThrow, getLoadResult, ROOT_ENV_FILE, SERVER_ENV_FILE };
