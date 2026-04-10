import * as path from 'path';
import { fileURLToPath } from 'url';
import {
    AppYamlConfig,
    AppYamlConfigSDK,
    type ILogger,
} from '@internal/app-yaml-static-config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIG_FILES = [
    'base.yml',
    'security.yml',
    'api-release-date.yml',
    'feature_flags.yml',
] as const;

function envConfigFiles(appEnv: string): string[] {
    return [
        `server.${appEnv}.yaml`,
        `endpoint.${appEnv}.yaml`,
    ];
}

export interface LoadOptions {
    configDir?: string;
    appEnv?: string;
    logger?: ILogger;
}

export interface LoadResult {
    config: AppYamlConfig;
    sdk: AppYamlConfigSDK;
}

/**
 * Resolve configDir from override, env var, or fallback relative to callerDir.
 */
export function resolveConfigDir(override?: string, callerDir?: string): string {
    if (override !== undefined) {
        if (!override) throw new Error('configDir must not be an empty string');
        return override;
    }
    const envVal = process.env.CONFIG_DIR;
    if (envVal !== undefined) {
        if (!envVal) throw new Error('CONFIG_DIR env var must not be an empty string');
        return envVal;
    }
    if (callerDir) {
        return path.join(callerDir, '..', '..', '..', '..', 'common', 'config');
    }
    throw new Error('configDir is required: pass it explicitly, set CONFIG_DIR env var, or provide callerDir');
}

function resolveAppEnv(override?: string): string {
    return (override || process.env.APP_ENV || 'dev').toLowerCase();
}

/**
 * Build the canonical 5-file list for AppYamlConfig initialization.
 */
export function buildConfigFiles(configDir: string, appEnv: string): string[] {
    return [
        ...CONFIG_FILES.map(f => path.join(configDir, f)),
        ...envConfigFiles(appEnv).map(f => path.join(configDir, f)),
    ];
}

/**
 * Resolve a single {{env.VAR_NAME}} template from process.env.
 * Non-template strings returned as-is. Returns null if env var not set.
 */
function resolveEnvTemplate(value: string): string | null {
    const trimmed = value.trim();
    if (trimmed.startsWith('{{env.') && trimmed.endsWith('}}')) {
        const varName = trimmed.slice(6, -2);
        return process.env[varName] || null;
    }
    return value;
}

/**
 * Recursively resolve {{env.VAR}} templates in an object.
 */
function resolveEnvTemplatesInObject(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return resolveEnvTemplate(obj);
    if (Array.isArray(obj)) return obj.map(item => resolveEnvTemplatesInObject(item));
    if (typeof obj === 'object') {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(obj)) {
            result[key] = resolveEnvTemplatesInObject(value);
        }
        return result;
    }
    return obj;
}

/**
 * Recursively walk the config tree. For each node with an
 * overwrite_from_context section:
 * 1. Resolve {{env.VAR}} templates in the overwrite section
 * 2. Apply resolved non-null values to the parent-level fields
 * 3. Keep overwrite_from_context with resolved values for reference
 */
function applyEnvOverwrites(node: any): any {
    if (node === null || node === undefined || typeof node !== 'object' || Array.isArray(node)) {
        return node;
    }

    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(node)) {
        if (key === 'overwrite_from_context') continue;
        result[key] = typeof value === 'object' && value !== null && !Array.isArray(value)
            ? applyEnvOverwrites(value)
            : value;
    }

    const overwrites = node.overwrite_from_context;
    if (overwrites && typeof overwrites === 'object') {
        const resolved = resolveEnvTemplatesInObject(overwrites);
        for (const [key, value] of Object.entries(resolved)) {
            if (value !== null && value !== undefined) {
                result[key] = value;
            }
        }
        result.overwrite_from_context = resolved;
    }

    return result;
}

/**
 * Initialize AppYamlConfig from the standard config directory and return
 * both the config singleton and an SDK instance.
 *
 * Resolves {{env.VAR}} templates in overwrite_from_context sections
 * and applies them to parent-level fields at load time.
 *
 * Works for servers, CLIs, and integration tests.
 */
export async function loadAppYamlConfig(options: LoadOptions = {}): Promise<LoadResult> {
    const configDir = resolveConfigDir(options.configDir, __dirname);
    const appEnv = resolveAppEnv(options.appEnv);
    const files = buildConfigFiles(configDir, appEnv);

    await AppYamlConfig.initialize({
        files,
        configDir,
        appEnv,
        logger: options.logger,
    });

    const config = AppYamlConfig.getInstance();

    // Resolve {{env.VAR}} templates in overwrite_from_context and apply to parent fields
    const rawConfig = (config as any)._config;
    if (rawConfig && typeof rawConfig === 'object') {
        (config as any)._config = applyEnvOverwrites(rawConfig);
    }

    const sdk = new AppYamlConfigSDK(config);

    return { config, sdk };
}
